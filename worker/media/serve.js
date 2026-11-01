// The site's video and audio.
//
// Most of it lives in R2 (the MEDIA binding, bucket aaronorelup-site-media), each file under its
// URL path without the leading slash: /media/<slug>/clip.mp4 is the object media/<slug>/clip.mp4.
// scripts/media/push.mjs puts it there and docs/MEDIA.md says how. R2 cuts byte ranges and checks
// conditional requests itself, so those answers need nothing from the build. Any path the Worker
// is sent is looked up in R2 first, so a folder moves out of git just by being uploaded.
//
// What isn't in R2 (public/courses/, written by the course publishers) is a static asset, and
// static assets answer a Range request with the whole file: 200, never 206 (measured 2026-10-03,
// and again 2026-10-07 on /media/ and the course lessons). A browser that gets a 200 can only seek
// inside what it has already buffered, so drag past the buffer and playback lands on 0. Those
// ranges are cut here. A 206 has to state the file's length, and the asset binding doesn't give it
// inside a Worker (no Content-Length on what it returns), so the build writes every media file's
// length under public/ to /media-sizes.json (src/pages/media-sizes.json.js), read once per isolate.
// With the length, a range is the asset streamed through with the bytes before it skipped and the
// bytes after it never read. A file missing from the list (it can't be, short of a broken build) is
// read whole and cut, which is slower but still right.
//
// wrangler.jsonc sends video, audio and HLS paths here first (`assets.run_worker_first`).

// What the asset server sends with every file, so a file answers the same from either place.
const CACHE = 'public, max-age=0, must-revalidate';

const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i;

const isMedia = (pathname) => MEDIA.test(pathname);

let sizes = null; // path -> bytes, from the build
const sizeOf = (env, url) => {
  sizes = sizes || env.ASSETS.fetch(new Request(url.origin + '/media-sizes.json'))
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .catch(() => { sizes = null; return {}; }); // try again on the next request
  return sizes.then((all) => all[decodeURIComponent(url.pathname)] || 0);
};

export async function serveMedia(request, env) {
  const url = new URL(request.url);
  if (request.method === 'GET' || request.method === 'HEAD') {
    const stored = await fromR2(request, env, decodeURIComponent(url.pathname.slice(1)));
    if (stored) return stored;
  }
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

// The file from R2, or null when R2 doesn't have it. R2 has already cut a single byte range and
// checked If-None-Match, If-Match, If-Modified-Since and If-Unmodified-Since (no body means one
// of them failed); it ignores If-Range, so that is checked here. The response is the same for
// HEAD, whose body the runtime drops.
async function fromR2(request, env, key) {
  const range = request.headers.get('Range');
  let object;
  try {
    object = await env.MEDIA.get(key, { range: request.headers, onlyIf: request.headers });
  } catch (e) {
    if (!String(e.message).includes('(10039)')) throw e; // "The requested range is not satisfiable"
    const head = await env.MEDIA.head(key);
    return head && unsatisfiable(head.size);
  }
  if (!object) return null;

  const headers = new Headers({ ETag: object.httpEtag, 'Cache-Control': CACHE, 'Accept-Ranges': 'bytes', 'X-Media-Source': 'r2' });
  object.writeHttpMetadata(headers);
  if (!object.body) {
    const notModified = request.headers.has('If-None-Match') || request.headers.has('If-Modified-Since');
    return new Response(null, { status: notModified ? 304 : 412, headers });
  }
  let partial = range && Array.isArray(parseRange(range, object.size));
  const ifRange = request.headers.get('If-Range');
  if (partial && ifRange && ifRange !== object.httpEtag) { // changed since: all of it
    object.body.cancel();
    object = await env.MEDIA.get(key);
    partial = false;
  }
  if (!partial) {
    headers.set('Content-Length', String(object.size)); // a HEAD has no body to measure
    return new Response(object.body, { headers });
  }
  const { offset, length } = object.range;
  headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
  headers.set('Content-Length', String(length));
  return new Response(object.body, { status: 206, headers });
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
