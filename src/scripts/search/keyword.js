// The words half of search: Pagefind, in the browser (scripts/build/pagefind.mjs writes its index). load(), on the
// box's first focus, imports /pagefind/pagefind.js and readies it; a build without an index leaves this half
// silent. search(q, draw): draw(hits) with the best pages, each its best heading-anchored passage, in rank order.
import { termsOf } from './terms.js';

const BUNDLE = '/pagefind/pagefind.js';
const DEBOUNCE = 120;     // ms
const TOP = 6;          // pages the words half brings; the meaning half adds its own

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

export async function search(q, draw) {
  const typedEarly = !ready;
  const n = ++latest;
  const m = await load();
  if (!m) return draw([]);
  if (n !== latest) return;
  // Without the small words, which Pagefind would match as the start of every word ("a" marks "agents").
  const words = termsOf(q).join(' ') || q;
  // Typed before the index was in: searched the moment it is, with no debounce.
  const found = typedEarly ? await m.search(words) : await m.debouncedSearch(words, {}, DEBOUNCE);
  if (!found) return;
  const top = found.results.slice(0, TOP);
  if (!top.length) return draw([]);
  // Drawn as the passages come, each time the run of them from the best grows: a page's passage waits on its whole
  // text (the live notebook's is by far the largest), so a slow page never holds back the ones ranked above it.
  const got = [];
  let shown = 0;
  top.forEach((r, i) => r.data().then((page) => {
    got[i] = passage(page);
    let k = shown;
    while (got[k]) k++;
    if (k > shown) draw(got.slice(0, (shown = k)));
  }));
}

// The page's part that holds the most of the query (a part runs from one heading to the next).
const weight = (part) => part.weighted_locations.reduce((n, l) => n + l.balanced_score, 0);
function passage(page) {
  const best = page.sub_results.reduce((a, b) => (weight(b) > weight(a) ? b : a), page.sub_results[0] ?? page);
  const url = new URL(best.url, location.origin);
  return { path: url.pathname, anchor: url.hash.slice(1), heading: url.hash ? best.title : '', html: best.excerpt };
}
