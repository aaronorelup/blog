// Every path run_worker_first sends that isn't an API: video, audio, HLS and /read/*. R2 (binding MEDIA, bucket
// aaronorelup-site-media, each object under its URL path without the leading slash) answers first, cutting byte
// ranges and checking conditional requests itself. What isn't in R2 is a static asset: those ignore Range, so
// ranges are cut here from the length the build lists in /media-sizes.json; with no length known, the whole file
// (200, Accept-Ranges). A read-aloud post file not recorded yet answers 200 { ready: false }, never a 404.
import { json, status } from '../lib/http.js';
import { buildJson } from '../lib/build-files.js';

// What the asset server sends with every file, so a file answers the same from either place. A read-aloud
// recording's files in R2 are named by the hash of their text, so they never change.
const CACHE = 'public, max-age=0, must-revalidate';
const IMMUTABLE = 'public, max-age=31536000, immutable';

const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i;
const RECORDING = /^\/read\/[^/]+\/[^/]+\.json$/;
const isMedia = (pathname) => MEDIA.test(pathname);

// The asset's length in bytes, or 0 when the list can't be read just now (the file then goes out whole).
const sizeOf = (env, pathname) => buildJson(env, '/media-sizes.json').then((all) => all[pathname] || 0, () => 0);

export async function serve(request, env) {
  const url = new URL(request.url);
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return status(400); } // a broken %-escape names no file
  if (request.method === 'GET' || request.method === 'HEAD') {
    const stored = await fromR2(request, env, path.slice(1));
    if (stored) return stored;
    if (RECORDING.test(path)) return json({ ready: false });
  }
  if (request.method !== 'GET' || !isMedia(url.pathname)) return env.ASSETS.fetch(request);
  const range = (request.headers.get('Range') || '').trim();
  if (!range) return acceptRanges(await env.ASSETS.fetch(request));

  // The asset itself, asked for without the Range header it would ignore anyway.
  const [asset, size] = await Promise.all([
    env.ASSETS.fetch(new Request(url.toString(), { method: 'GET' })),
    sizeOf(env, path),
  ]);
  if (asset.status !== 200 || !asset.body) return asset;
  const ifRange = request.headers.get('If-Range');
  if (ifRange && ifRange !== asset.headers.get('ETag')) return acceptRanges(asset); // changed since: all of it

  if (!size) return acceptRanges(asset); // length unknown: it plays from the start, it just can't seek

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
  if (key.startsWith('read/')) headers.set('Cache-Control', IMMUTABLE);
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
