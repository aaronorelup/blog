// The leaves room (/leaves/), headless: its build-time data (src/lib/leaves.js), the physics it shows (the
// tea-leaf paradox, Beer-Lambert), and whole brews (src/scripts/leaves/brew.js) run to rest: the same seed brews the
// same cup, the number is legible for every seed, and the slip's tally is the tea's own.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { colorTally, extract, leafData, LIVE_WORDS, nextId } from '../../src/lib/leaves.js';
import { createBrew, runToRest } from '../../src/scripts/leaves/brew.js';
import { radial } from '../../src/scripts/leaves/flow.js';
import { numberStrokes } from '../../src/scripts/leaves/glyphs.js';
import { ENTRY, FAN, makeLeaves, stepLeaves } from '../../src/scripts/leaves/leaves.js';
import { transmit } from '../../src/scripts/leaves/liquid.js';
import { mulberry32 } from '../../src/scripts/leaves/rng.js';
import { tallyOf } from '../../src/scripts/leaves/ui.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const POSTS = path.join(ROOT, 'src/content/posts/');
const posts = fs.readdirSync(POSTS).filter((f) => f.endsWith('.md'))
  .map((f) => { const m = matter.read(POSTS + f); return { id: f.slice(0, -3), data: m.data, body: m.content }; });
const BUILT = '2026-11-18';
const data = {
  leaves: await leafData(posts, new Date(BUILT), (p) => p.body.split(/\s+/).filter(Boolean).length),
  next: nextId(posts.map((p) => p.data.id)), built: BUILT,
};

test('the tea-leaf paradox: along the bottom the swirl pushes inward, at the surface outward', () => {
  for (const r of [0.3, 0.6, 0.9]) {
    assert.ok(radial(3, r, 'bottom') < 0, `bottom at r = ${r}`);
    assert.ok(radial(3, r, 'surface') > 0, `surface at r = ${r}`);
  }
  // and a sunk leaf really creeps in while a floating one drifts out
  const s = { t: 7, W: 3, gamma: 3, seed: 1, events: [], leaves: makeLeaves({ leaves: [], built: BUILT }, mulberry32(1)) };
  const sunk = { ...s.leaves[0], kind: ENTRY, x: 0.6, y: 0, z: 1, sunk: true, hyd: 1, wetT: 0, drop: 0, landed: true, tau: 1, sinkAt: 2 };
  const afloat = { ...s.leaves[0], kind: ENTRY, x: 0, y: 0.5, z: 0, sunk: false, hyd: 0, wetT: 6.99, drop: 0, landed: true, tau: 1e6, sinkAt: 2 };
  s.leaves = [sunk, afloat];
  for (let i = 0; i < 30; i++) { stepLeaves(s, 1 / 60, null, () => {}); s.t += 1 / 60; }
  assert.ok(Math.hypot(sunk.x, sunk.y) < 0.6, 'the sunk leaf moved in');
  assert.ok(Math.hypot(afloat.x, afloat.y) > 0.5, 'the floating leaf moved out');
});

test('Beer-Lambert: less light crosses more tea, on every channel, and blue goes first', () => {
  let last = [1, 1, 1];
  for (let d = 0.25; d <= 3; d += 0.25) {
    const t = transmit(0.8, d);
    t.forEach((v, i) => assert.ok(v < last[i], `channel ${i} at ${d} cm`));
    assert.ok(t[2] < t[1] && t[1] < t[0], 'blue falls fastest, then green');
    last = t;
  }
});

test("nextId is new-post's rule over the real posts: one past the highest AO-### filed, drafts included", () => {
  const top = Math.max(...posts.map((p) => Number(/^AO-(\d+)$/.exec(p.data.id ?? '')?.[1] ?? 0)));
  const want = `AO-${String(top + 1).padStart(3, '0')}`;
  assert.equal(data.next, want);
  assert.match(data.next, /^AO-\d{3}$/);
  assert.equal(nextId(['AO-009', 'AO-084', 'AO-010', undefined, 'notes']), 'AO-085');
});

test('leafData keeps listed entries only, oldest first, and never reads a live notebook', async () => {
  const post = (id, slug, date, extra = {}) => ({ id: slug, data: { id, title: slug, date: new Date(date), ...extra } });
  const asked = [];
  const rows = await leafData([
    post('AO-003', 'c', '2026-10-03'), post('AO-001', 'a', '2026-08-01'), post('AO-002', 'b', '2026-09-01', { draft: true }),
    post('AO-004', 'd', '2026-10-05', { unlisted: true }), post('AO-073', 'teardown-lab', '2026-10-31'),
  ], new Date(BUILT), (p) => {
    if (p.data.id === 'AO-073') throw new Error('read a live notebook');
    asked.push(p.data.id);
    return 500;
  });
  assert.deepEqual(rows.map((r) => r.id), ['AO-001', 'AO-003', 'AO-073']);
  assert.deepEqual(rows.map((r) => r.date), ['2026-08-01', '2026-10-03', '2026-10-31']);
  assert.equal(rows[2].words, LIVE_WORDS);
  assert.deepEqual(asked.sort(), ['AO-001', 'AO-003']);
});

test('colorTally: the color halves every month, and this month carries its share', () => {
  assert.equal(extract(0), 1);
  assert.ok(Math.abs(extract(30.44) - 0.5) < 1e-9);
  const t = colorTally([{ date: '2026-11-17' }, { date: '2026-11-01' }, { date: '2026-06-01' }], BUILT);
  assert.equal(t.recent, 2);
  assert.ok(t.share > 0.5 && t.share < 1);
});

const brew = (seed) => { const s = createBrew(data, seed, { quick: true }); runToRest(s); return s; };

test('the same seed brews the same cup', () => {
  const a = brew(4242), b = brew(4242);
  assert.equal(a.phase, 'rest');
  assert.deepEqual(a.leaves.map((p) => [p.x, p.y, p.a]), b.leaves.map((p) => [p.x, p.y, p.a]));
});

test('the number reads for every seed: leaves on their slots, and no gap in a stroke', () => {
  const { strokes, height } = numberStrokes(digitsOf(data.next));
  for (let seed = 1; seed <= 20; seed++) {
    const s = brew(seed * 7919);
    const assigned = s.leaves.filter((p) => p.slot >= 0 && !p.dregs);
    const near = assigned.filter((p) => Math.hypot(p.x - p.tx, p.y - p.ty) <= 1.2 * Math.max(p.kind === FAN ? p.len : p.len * 0.42, 0.012));
    assert.ok(near.length / assigned.length >= 0.9, `seed ${seed}: ${near.length} of ${assigned.length} on their slots`);
    const cover = (x, y) => assigned.some((p) => Math.hypot(p.x - x, p.y - y) < (p.kind === FAN ? 0.016 : p.len * 0.5));
    for (const st of strokes) {
      let gap = 0, worst = 0;
      for (let k = 0; k < st.pts.length; k++) {
        const [x, y] = st.pts[k];
        gap = cover(x, y) ? 0 : gap + (k ? st.cum[k] - st.cum[k - 1] : 0);
        worst = Math.max(worst, gap);
      }
      assert.ok(worst <= 0.08 * height, `seed ${seed}: a gap of ${(worst / height * 100).toFixed(1)}% of the height`);
    }
  }
});

test("the slip's tally is the tea's own: the color the leaves released matches colorTally within 2%", () => {
  const s = brew(99);
  const sim = tallyOf(s.leaves), want = colorTally(data.leaves, BUILT);
  assert.equal(sim.recent, want.recent);
  assert.ok(Math.abs(sim.share - want.share) <= 0.02, `${sim.share} vs ${want.share}`);
  assert.equal(s.leaves.filter((p) => p.kind === ENTRY).length, data.leaves.length);
});

test('every file of the room stays under 400 lines', () => {
  const dir = path.join(ROOT, 'src/scripts/leaves');
  for (const f of fs.readdirSync(dir)) {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').length;
    assert.ok(lines <= 400, `${f}: ${lines} lines`);
  }
});

function digitsOf(id) { return /(\d+)$/.exec(id)[1]; }
