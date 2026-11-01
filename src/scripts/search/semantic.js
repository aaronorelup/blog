// The meaning half of search: GET /api/search?q= (worker/search/serve.js; no token). One request at a time, the
// stale one aborted, no retry, at most 40 a page view. Each hit keeps the sentence of its chunk that shares the most
// words with the query. A failure, a cap or the switch being off answers [], and the list stays words only.
import { termsOf } from './terms.js';

const CAP = 40;
let calls = 0;
let inflight = null;

// [{ path, anchor, heading, text }], best first, or null when a newer call aborted this one.
export async function search(q) {
  if (calls >= CAP) return [];
  calls += 1;
  inflight?.abort();
  const ctrl = (inflight = new AbortController());
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
    if (!r.ok) return [];
    const terms = termsOf(q);
    return (await r.json()).hits.map((h) => ({
      path: `/ledger/${h.slug}/${h.kind === 'notes' ? 'notes/' : ''}`,
      anchor: h.anchor,
      heading: h.heading,
      text: sentence(h.text, terms),
    }));
  } catch (e) {
    return e.name === 'AbortError' ? null : [];
  }
}

// The sentence with the most query words in it (the first, on a tie).
function sentence(text, terms) {
  const score = (s) => terms.filter((t) => new RegExp(`\\b${t}`, 'i').test(s)).length;
  return text.split(/(?<=[.!?])\s+|\n+/).filter(Boolean)
    .reduce((best, s) => (score(s) > score(best) ? s : best));
}
