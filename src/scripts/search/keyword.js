// The words half of search: Pagefind, in the browser (scripts/build/pagefind.mjs writes its index). load(), on the
// box's first focus, imports /pagefind/pagefind.js and readies it; a build without an index leaves this half
// silent. search(q): the best pages, each with its best heading-anchored passage, or null once a newer search won.
const BUNDLE = '/pagefind/pagefind.js';
const DEBOUNCE = 120;     // ms
const TOP = 8;

let pagefind = null;      // a promise of the module, or of null when there is no index
let ready = false;
let latest = 0;           // the newest search's number: an older one still waiting on the index is dropped

export function load() {
  pagefind ??= import(/* @vite-ignore */ BUNDLE).then(async (m) => {
    await m.init();
    await m.preload('');  // its worker, metadata and wasm: init() leaves them to the first search
    ready = true;
    performance.mark('search:index');
    return m;
  }, () => null);
  return pagefind;
}

export async function search(q) {
  const typedEarly = !ready;
  const n = ++latest;
  const m = await load();
  if (!m) return [];
  if (n !== latest) return null;
  // Typed before the index was in: searched the moment it is, with no debounce.
  const found = typedEarly ? await m.search(q) : await m.debouncedSearch(q, {}, DEBOUNCE);
  if (!found) return null;
  return Promise.all(found.results.slice(0, TOP).map(async (r) => passage(await r.data())));
}

// The page's part that holds the most of the query (a part runs from one heading to the next).
const weight = (part) => part.weighted_locations.reduce((n, l) => n + l.balanced_score, 0);
function passage(page) {
  const best = page.sub_results.reduce((a, b) => (weight(b) > weight(a) ? b : a), page.sub_results[0] ?? page);
  const url = new URL(best.url, location.origin);
  return { path: url.pathname, anchor: url.hash.slice(1), heading: url.hash ? best.title : '', html: best.excerpt };
}
