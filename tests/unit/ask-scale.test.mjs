// RAG Goobie at 1,000 posts (scripts/eval/scale.mjs simulate(), G10): a synthetic blog of posts the size of today's
// (mean ~3.9k est. tokens, a long tail) through the real build and the Worker's per-question code stays inside every
// cap: packs, catalog, each question's prompt, room for 6 focus docs at their caps, the reservation, the manifest.
// No timing here (npm run ask:scale prints it).
import test from 'node:test';
import assert from 'node:assert/strict';
import { BUDGET, CATALOG_CAP, DOC_CAP, LIVE_CAP, PACK_CAP } from '../../src/lib/ask/caps.js';
import { simulate } from '../../scripts/eval/scale.mjs';

// Docs shaped like today's: short versions, an opening and h2 sections of a few hundred to a few thousand words.
const SIZES = [600, 900, 1400, 2000, 2600, 3200, 4200, 5500, 8000, 12000, 16000];   // est. tokens a doc
const words = (tokens) => 'aaron measured the render time on his laptop and wrote it down '.repeat(Math.ceil((tokens * 3.5) / 64));
const base = SIZES.map((t, i) => ({ topic: ['video', 'agents', 'learning', 'games', 'art', '3d', 'site'][i % 7],
  short: { anchor: 'short', heading: 'The short version', text: words(80) },
  sections: Array.from({ length: 6 }, (_, j) => ({ anchor: `s${j}`, heading: `Section ${j}`, text: words(t / 6) })), notes: null }));

test('1,000 posts: packs, catalog, prompts, the room for 6 docs at their caps, the reservation and the manifest fit', async () => {
  const s = await simulate({ posts: 1000, base });
  const { m } = s;
  assert.equal(m.mode, 'split');
  assert.ok(m.packs.length >= 8 && m.packs.length <= 16, `${m.packs.length} packs`);
  assert.ok(m.packs.every((p) => p.tokens <= PACK_CAP));
  assert.ok(m.catalog.tokens <= CATALOG_CAP);
  assert.ok(s.prompts.every((t) => t <= BUDGET), `${Math.max(...s.prompts)}`);
  assert.ok(s.room >= LIVE_CAP + 5 * DOC_CAP);
  assert.ok(m.reserve_usd <= 0.25, `$${m.reserve_usd}`);
  assert.ok(s.manifestBytes <= 2e6);
  assert.deepEqual(m.starts, m.pins, 'pinned');
});
