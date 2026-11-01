// Build files (dist/: previews.json, media-sizes.json, the search manifest, /read/index.json) read through the
// ASSETS binding and parsed once per isolate. An isolate serves one deploy, so its files can't change under it.
// A failed read is forgotten, so the next call tries again.
const ORIGIN = 'https://aaronorelup.com'; // any host: the binding answers with this deploy's files
const files = new Map(); // path -> Promise of its parsed JSON

export function buildJson(env, path) {
  if (!files.has(path)) {
    const read = env.ASSETS.fetch(new Request(ORIGIN + path))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${path} answered ${r.status}`))));
    read.catch(() => files.delete(path));
    files.set(path, read);
  }
  return files.get(path);
}
