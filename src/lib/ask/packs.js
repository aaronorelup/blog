// Which docs share a pack, the cached block every question in that pack's range starts with. Whole mode: every
// non-live doc in one pack, while they fit under WHOLE_CAP (and the catalog under WHOLE_CATALOG). Split mode: the
// ranges pinned in src/data/ask-packs.json (pack i holds AO numbers >= starts[i] and < starts[i + 1]), a range over
// PACK_CAP split greedily inside itself only, so a doc that grows re-misses only its own pack and a new post lands
// in the last one. `starts` is what `npm run ask:pin` writes back.
import { WHOLE_CATALOG } from './caps.js';

// docs: non-live, in AO order, each { n, tokens }. Returns { mode, packs: [[n...]], starts }.
export function packsOf(docs, { pins, whole, pack, catalogTokens }) {
  const total = docs.reduce((t, d) => t + d.tokens, 0);
  if (total <= whole && catalogTokens <= WHOLE_CATALOG) return { mode: 'whole', packs: [docs.map((d) => d.n)], starts: pins };
  const packs = [];
  const starts = [];
  pins.forEach((from, i) => {
    const range = docs.filter((d) => (i === 0 || d.n >= from) && (i + 1 === pins.length || d.n < pins[i + 1]));
    let cur = null;
    for (const d of range) {
      if (!cur || cur.tokens + d.tokens > pack) {
        cur = { docs: [], tokens: 0 };
        packs.push(cur);
        starts.push(d === range[0] ? from : d.n);
      }
      cur.docs.push(d.n);
      cur.tokens += d.tokens;
    }
  });
  return { mode: 'split', packs: packs.map((p) => p.docs), starts };
}
