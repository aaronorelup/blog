// The floors of differ.mjs and sweep.mjs held to the frames of looks A and B they were measured on (docs/TEA_ROOM.md,
// "Calibration"). differ's frames are a sixth of 1440x900 and 390x844 (results within two points of full size), with
// every word hidden; the sweep's are 96 px wide, words shown, as tea-sweep.test.mjs's are.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { FLOORS as DF, compareGrids, comparePictures, verdict } from '../../scripts/tools/tea/differ.mjs';
import { FLOORS as SF, judge, judgePicture } from '../../scripts/tools/tea/sweep.mjs';

const pic = (dir, name) => fs.readFileSync(new URL(`./fixtures/tea/${dir}/${name}.png`, import.meta.url));
const differ = async (a, b, kind) => verdict(await comparePictures(pic('differ', a), pic('differ', b)), kind);

test('differ: the opening frames of neighbouring chapters in A and B pass, desktop and phone', async () => {
  for (const [a, b] of [['b-d-0.16', 'b-d-0.36'], ['b-p-0.18', 'b-p-0.37'], ['a-d-0.2', 'a-d-0.5'], ['a-p-0.2', 'a-p-0.5']]) {
    const v = await differ(a, b, 'chapter');
    assert.equal(v.ok, true, `${a} -> ${b}: ${v.why}`);
  }
});

test('differ: two frames of one held picture 0.1 vh apart fail', async () => {
  for (const [a, b] of [['b-d-0.16', 'b-d-0.16485'], ['b-d-0.36', 'b-d-0.36485'], ['b-p-0.37', 'b-p-0.37489'], ['a-d-0.46', 'a-d-0.46488'], ['a-p-0.46', 'a-p-0.46488']]) {
    assert.equal((await differ(a, b, 'step')).ok, false, `${a} -> ${b} should fail`);
  }
});

test('differ: B\'s flat dark slide between the television and film fails', async () => {
  for (const [a, b] of [['b-d-0.82', 'b-d-0.84'], ['b-d-0.83', 'b-d-0.85'], ['b-p-0.82', 'b-p-0.83']]) {
    assert.equal((await differ(a, b, 'step')).ok, false, `${a} -> ${b} should fail`);
  }
});

test('sweep: B\'s dead stretch on a desktop (0.82 to 0.86) and its television chapter on a phone fail', async () => {
  for (const name of ['d-0.82', 'd-0.83', 'd-0.84', 'd-0.85', 'd-0.86', 'p-0.4', 'p-0.45', 'p-0.48', 'p-0.5', 'p-0.52', 'p-0.55', 'p-0.58', 'p-0.6', 'p-0.62', 'p-0.66', 'p-0.72', 'p-0.8', 'p-0.83']) {
    assert.equal((await judgePicture(pic('sweep', `b-${name}`), { phone: name.startsWith('p-') })).ok, false, `${name} should fail`);
  }
});

test('sweep: B\'s dark but good frames, its lit television room and the film garden on a phone pass', async () => {
  for (const name of ['d-0.3', 'd-0.56', 'd-0.58', 'd-0.66', 'p-0.2', 'p-0.38', 'p-0.86']) {
    const r = await judgePicture(pic('sweep', `b-${name}`), { phone: name.startsWith('p-') });
    assert.equal(r.ok, true, `${name} should pass: ${r.why}`);
  }
});

// Each floor held from both sides on made-up frames, so moving one either way turns a verdict (the fixtures above
// hold the verdicts on real frames, but several of their pairs are a long way from any floor).

// a 16x9 grid of grey 100, its first `share` of cells moved up by `up` and the rest down by `down` (per channel)
const grid = (share = 0, up = 0, down = 0) => {
  const n = 16 * 9, g = Buffer.alloc(n * 3);
  for (let c = 0; c < n; c++) g.fill(Math.round(c < share * n ? 100 + up : 100 - down), c * 3, c * 3 + 3);
  return g;
};
const pair = (b) => compareGrids(grid(), b, 16, 9);

test('differ: the cells floor (0.30) is held from both sides', () => {
  assert.equal(DF.cells, 0.3);
  assert.equal(verdict(pair(grid(0.32, 20, 0)), 'step').ok, true);   // 32% of cells moved by 34.6
  assert.equal(verdict(pair(grid(0.28, 20, 0)), 'step').ok, false);  // 28%
});

test('differ: the cell floor (24) is held from both sides', () => {
  assert.equal(verdict(pair(grid(1, 14.5, 0)), 'step').ok, true);    // every cell by 25.1
  assert.equal(verdict(pair(grid(1, 13.3, 0)), 'step').ok, false);   // every cell by 23.0
});

test('differ: the mean floor (7) is held from both sides, on pairs that pass the cells floor', () => {
  // half the cells up by 20 (34.6, changed), half down: the mean colours end 8.0 or 6.0 apart
  const up = pair(grid(0.5, 20, 10.76));
  const down = pair(grid(0.5, 20, 13.07));
  assert.ok(up.cells >= DF.cells && down.cells >= DF.cells);
  assert.equal(verdict(up, 'chapter').ok, true, `mean ${up.mean}`);
  assert.equal(verdict(down, 'chapter').ok, false, `mean ${down.mean}`);
  assert.equal(verdict(pair(grid(0.5, 20, 20)), 'chapter').ok, false); // every cell changed, the mean not at all
});

test('sweep: the bright floor (0.30) is held from both sides', () => {
  // 96x54, every column whose index is below share*96 of each run of 96 lit: bright columns spread evenly
  const frame = (share) => {
    const w = 96, h = 54, rgb = Buffer.alloc(w * h * 3, 12);
    const lit = new Set(Array.from({ length: Math.round(share * w) }, (_, i) => Math.floor((i * w) / Math.round(share * w))));
    for (let y = 0; y < h; y++) for (const x of lit) rgb.fill(200, (y * w + x) * 3, (y * w + x) * 3 + 3);
    return judge(rgb, w, h);
  };
  assert.equal(SF.bright, 0.3);
  assert.equal(frame(0.32).ok, true, frame(0.32).why);
  assert.equal(frame(0.27).ok, false);
});
