// node --test src/scripts/stats/hero/
import test from 'node:test';
import assert from 'node:assert/strict';
import { frame, solve, layout, slotXY, polyline, at, hitTest, largestRemainderLocal } from './gate-layout.js';

// The fixture's 30 days, in station order: bot, scanner, agent, stale, person.
const MONTH = [4074, 326, 1973, 3432, 1810];

test('wide frame at 1140: 340 tall (lowered from the first spec, 380, so the piles clear a laptop fold)', () => {
  const f = frame(1140);
  assert.equal(f.tall, false);
  assert.equal(f.H, 340);
  assert.equal(f.yBase, 248);
  assert.equal(f.wp, 128);
  assert.deepEqual(f.xc, [160, 342, 524, 707, 889]);
});

test('a short window takes height off the wide stage, down to 280, and the piles still fit', () => {
  assert.equal(frame(1140, { maxH: 400 }).H, 340);
  assert.equal(frame(1140, { maxH: 296 }).H, 296);
  assert.equal(frame(1140, { maxH: 150 }).H, 280);
  assert.equal(frame(800, { maxH: 290 }).H, 290);   // below the 300 floor the width alone gives
  const g = layout(1140, MONTH, { lo: 1000, maxH: 290 });
  assert.equal(g.H, 290);
  assert.ok(Math.ceil(Math.max(...g.dots) / g.cols) * g.p <= g.pileRoom);
});

test('below 720 the gate is a tall rail', () => {
  assert.equal(frame(719).tall, true);
  assert.equal(frame(720).tall, false);
});

test('wide: smallest unit that fits, then the biggest pitch', () => {
  const s = solve(frame(1140), MONTH);
  assert.equal(s.u, 10);
  assert.equal(s.p, 6);
  const sum = s.dots.reduce((a, b) => a + b, 0);
  assert.equal(sum, Math.round(MONTH.reduce((a, b) => a + b, 0) / 10));
  // The tallest pile fits under the road with room to spare.
  const f = frame(1140);
  assert.ok(Math.ceil(Math.max(...s.dots) / s.cols) * s.p <= f.pileRoom);
});

test('tall: every band fits three rows in the phone width', () => {
  const f = frame(358);
  const s = solve(f, MONTH);
  assert.equal(s.u, 25);
  const cap = Math.floor(f.bandW / s.p) * 3;
  assert.ok(Math.max(...s.dots) <= cap);
  assert.ok(s.dots.reduce((a, b) => a + b, 0) <= 700);
});

test('a kind below one unit gets one crumb, a zero kind gets nothing', () => {
  const s = solve(frame(1140), [500, 3, 0, 200, 90]);
  assert.equal(s.u, 1);    // 793 pages fit one page a dot, at a 6px pitch
  assert.equal(s.p, 6);
  assert.equal(s.dots[1], 3);
  const s2 = solve(frame(358), [5000, 3, 0, 2000, 900]);
  assert.equal(s2.dots[2], 0);
  assert.equal(s2.dots[1], 1);
  assert.ok(s2.crumbs[1] > 0 && s2.crumbs[1] < 1);
});

test('empty day: no dots, no crash', () => {
  const g = layout(1140, [0, 0, 0, 0, 0]);
  assert.deepEqual(g.dots, [0, 0, 0, 0, 0]);
  const t = layout(358, [0, 0, 0, 0, 0]);
  assert.deepEqual(t.dots, [0, 0, 0, 0, 0]);
});

test('slots: wide piles fill bottom-up on one baseline; tall bands fill column by column', () => {
  const g = layout(1140, MONTH, { lo: 1000 });
  const [x0, y0] = slotXY(g, 0, 0);
  const [x1, y1] = slotXY(g, 0, 1);
  assert.equal(y0, y1);
  assert.ok(x1 > x0);
  const [, yUp] = slotXY(g, 0, g.cols);
  assert.ok(yUp < y0);
  // Same baseline for every pile.
  for (let k = 0; k < 5; k++) assert.equal(slotXY(g, k, 0)[1], y0);

  const t = layout(358, MONTH, { lo: 250 });
  const a = slotXY(t, 0, 0), b = slotXY(t, 0, 1), c = slotXY(t, 0, 3);
  assert.equal(a[0], b[0]);
  assert.ok(b[1] > a[1]);
  assert.ok(c[0] > a[0]);
});

test('the people bracket runs from the counted seam up to the top', () => {
  const g = layout(1140, MONTH, { lo: 1118 });
  assert.ok(g.bracket.seam < g.yBase && g.bracket.seam > g.bracket.top);
  const t = layout(358, MONTH, { lo: 1000 });
  assert.ok(t.bracket.seam < t.bracket.end);
});

test('road lookup table: positions along a straight line, unit normals', () => {
  const p = polyline([[0, 0], [100, 0]]);
  const o = at(p, 50, [0, 0, 0, 0]);
  assert.ok(Math.abs(o[0] - 50) < 1e-6);
  assert.equal(Math.hypot(o[2], o[3]), 1);
  assert.equal(at(p, 500, o)[0], 100);   // clamped
});

test('stations sit in road order', () => {
  const g = layout(1140, MONTH);
  for (let k = 1; k < 5; k++) assert.ok(g.stationS[k] > g.stationS[k - 1]);
  const t = layout(358, MONTH);
  for (let k = 1; k < 5; k++) assert.ok(t.stationS[k] > t.stationS[k - 1]);
});

test('hit test finds the pile column', () => {
  const g = layout(1140, MONTH);
  assert.equal(hitTest(g, g.xc[2], g.yBase - 5), 2);
  assert.equal(hitTest(g, 2, 2), -1);
});

test('largest remainder: sums to target, every non-zero value gets a dot', () => {
  const r = largestRemainderLocal([4074, 3, 1973, 3432, 1810], 450);
  assert.equal(r.reduce((a, b) => a + b, 0), 450);
  assert.ok(r[1] >= 1);
});
