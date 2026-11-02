// Build files (dist/: previews.json, media-sizes.json, the search manifest, /read/index.json, /ask/*) read through
// the ASSETS binding: buildJson() parses one once per isolate (an isolate serves one deploy, so its files can't
// change under it; a failed read is forgotten, so the next call tries again); asset() is one read, for callers that
// keep the bytes themselves.
const ORIGIN = 'https://aaronorelup.com'; // any host: the binding answers with this deploy's files
const files = new Map(); // path -> Promise of its parsed JSON

export const asset = (env, path) => env.ASSETS.fetch(new Request(ORIGIN + path))
  .then((r) => (r.ok ? r : Promise.reject(new Error(`${path} answered ${r.status}`))));

export function buildJson(env, path) {
  if (!files.has(path)) {
    const read = asset(env, path).then((r) => r.json());
    read.catch(() => files.delete(path));
    files.set(path, read);
  }
  return files.get(path);
}
