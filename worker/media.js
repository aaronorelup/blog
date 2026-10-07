// Byte ranges for the site's video and audio.
//
// Workers static assets answer a Range request with the whole file: 200, never 206 (measured
// 2026-10-03, and again 2026-10-07 on /media/ and the course lessons). A browser that gets a
// 200 can only seek inside what it has already buffered, so every seek bar on the site was
// decoration: drag past the buffer and playback lands on 0, and a transcript line that should
// jump to 4:10 does nothing. wrangler.jsonc sends media files here first
// (`assets.run_worker_first`); nothing else on the site touches a Worker.
//
// A 206 has to state the file's length, and the asset binding doesn't give it inside a Worker
// (no Content-Length on what it returns). The build writes every media file's length to
// /media-sizes.json (src/pages/media-sizes.json.js), read once per isolate. With the length, a
// range is the asset streamed through with the bytes before it skipped and the bytes after it
// never read: nothing is held in memory, whatever the file's size, and the CPU cost is a loop
// over the skipped chunks. A file missing from the list (it can't be, short of a broken build) is
// read whole and cut, which is slower but still right.
//
// Used two ways: as the Worker's whole entry point (the default export), or from a larger
// Worker that calls serveMedia() for the paths isMedia() claims.

const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i;

export const isMedia = (pathname) => MEDIA.test(pathname);

let sizes = null; // path -> bytes, from the build
const sizeOf = (env, url) => {
  sizes = sizes || env.ASSETS.fetch(new Request(url.origin + '/media-sizes.json'))
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .catch(() => { sizes = null; return {}; }); // try again on the next request
  return sizes.then((all) => all[decodeURIComponent(url.pathname)] || 0);
};

export async function serveMedia(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || !isMedia(url.pathname)) return env.ASSETS.fetch(request);
  const range = (request.headers.get('Range') || '').trim();
  if (!range) return acceptRanges(await env.ASSETS.fetch(request));

  // The asset itself, asked for without the Range header it would ignore anyway.
  const [asset, size] = await Promise.all([
    env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' })),
    sizeOf(env, url),
  ]);
  if (asset.status !== 200 || !asset.body) return asset;
  const ifRange = request.headers.get('If-Range');
  if (ifRange && ifRange !== asset.headers.get('ETag')) return acceptRanges(asset); // changed since: all of it

  if (!size) return slice(new Uint8Array(await asset.arrayBuffer()), range, asset.headers);

  const want = parseRange(range, size);
  if (!want) return acceptRanges(asset); // several ranges, odd units: the whole file is a valid answer
  if (want === 'unsatisfiable') { asset.body.cancel(); return unsatisfiable(size); }
  const [start, end] = want;
  const length = end - start + 1;
  const body = start === 0 && end === size - 1 ? asset.body : cut(asset.body, start, length);
  const fixed = new FixedLengthStream(length);
  body.pipeTo(fixed.writable).catch(() => {});
  return new Response(fixed.readable, { status: 206, headers: partialHeaders(asset.headers, start, end, size) });
}

// The fallback: the whole file in memory, the range cut from it.
function slice(bytes, range, assetHeaders) {
  const size = bytes.byteLength;
  const want = parseRange(range, size);
  if (!want) {
    const h = new Headers(assetHeaders);
    h.set('Accept-Ranges', 'bytes');
    return new Response(bytes, { status: 200, headers: h });
  }
  if (want === 'unsatisfiable') return unsatisfiable(size);
  const [start, end] = want;
  return new Response(bytes.subarray(start, end + 1), { status: 206, headers: partialHeaders(assetHeaders, start, end, size) });
}

// "bytes=a-b", "bytes=a-" or "bytes=-n". Anything else gets the whole file.
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start, end;
  if (m[1] === '') {
    const n = Number(m[2]);
    if (n === 0) return 'unsatisfiable';
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size) return 'unsatisfiable';
  if (end < start) return null;
  return [start, end];
}

// Skip `start` bytes of a stream, then pass `length` bytes and stop reading.
function cut(stream, start, length) {
  const reader = stream.getReader();
  let skip = start;
  let left = length;
  return new ReadableStream({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        let chunk = value;
        if (skip) {
          if (chunk.byteLength <= skip) { skip -= chunk.byteLength; continue; }
          chunk = chunk.subarray(skip);
          skip = 0;
        }
        if (chunk.byteLength >= left) {
          controller.enqueue(chunk.subarray(0, left));
          left = 0;
          controller.close();
          reader.cancel().catch(() => {});
          return;
        }
        left -= chunk.byteLength;
        controller.enqueue(chunk);
        return;
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
}

function partialHeaders(assetHeaders, start, end, size) {
  const h = new Headers();
  for (const n of ['Content-Type', 'ETag', 'Last-Modified', 'Cache-Control']) {
    const v = assetHeaders.get(n);
    if (v) h.set(n, v);
  }
  h.set('Accept-Ranges', 'bytes');
  h.set('Content-Range', `bytes ${start}-${end}/${size}`);
  h.set('Content-Length', String(end - start + 1));
  return h;
}

function unsatisfiable(size) {
  return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
}

// Say ranges are welcome on a whole-file answer too, so the next seek asks for one.
function acceptRanges(res) {
  if (res.status !== 200) return res;
  const out = new Response(res.body, res);
  out.headers.set('Accept-Ranges', 'bytes');
  return out;
}

export default {
  fetch(request, env) {
    return serveMedia(request, env);
  },
};
