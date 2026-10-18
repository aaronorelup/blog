// node --test src/scripts/stats/rhythm/geom.test.mjs — the clock and speed arithmetic of chapter 04.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as g from './geom.js';

const whole = { fractional: false, offsetMin: -240 };   // New York in October
const kolkata = { fractional: true, offsetMin: 330 };

test('bins sit on the clock shown', () => {
  assert.equal(g.binStart(20, whole), 1200);
  assert.equal(g.angleOf(g.binStart(0, whole)), 0);
  assert.equal(g.angleOf(g.binStart(6, whole)), 90);
  // Kolkata keeps UTC edges: bin 0 (00:00 UTC) starts at 5:30 am
  assert.equal(g.binStart(0, kolkata), 330);
  assert.equal(g.binStart(23, kolkata), 270);
  assert.equal(g.angleOf(330), 82.5);
});

test('a finger anywhere in the slice finds its bin', () => {
  // straight up, just right of midnight, near the hub and near the rim
  assert.equal(g.binAt(g.C + 2, g.C - 20, whole), 0);
  assert.equal(g.binAt(g.C + 5, g.C - 138, whole), 0);
  // straight down and a hair clockwise is noon
  assert.equal(g.binAt(g.C - 2, g.C + 100, whole), 12);
  // 3 o'clock on the dial is 6 am
  assert.equal(g.binAt(g.C + 100, g.C + 2, whole), 6);
  // Kolkata: straight up is 23:30 to 00:30 local, which is bin 18 (18:00 UTC)
  assert.equal(g.binAt(g.C + 1, g.C - 80, kolkata), 18);
  assert.equal(g.binAt(g.C + 160, g.C, whole), -1);
});

test('peak, quiet and the night share', () => {
  const bins = Array(24).fill(10);
  bins[20] = 50; bins[4] = 1; bins[2] = 30;
  assert.deepEqual(g.peakQuiet(bins, whole), { peak: 20, quiet: 4 });
  const total = bins.reduce((a, b) => a + b);
  assert.equal(g.nightShare(bins, whole), (10 * 4 + 30 + 1) / total);
  assert.equal(g.nightShare(Array(24).fill(0), whole), 0);
});

test('wedges have a path when they have pages, none when they do not', () => {
  assert.equal(g.wedgePath(0, g.R0), '');
  const d = g.wedgePath(0, g.RMAX);
  assert.match(d, /^M[\d.]+ [\d.]+L.*A.*Z$/);
  assert.equal(g.radiusFor(0, 10), g.R0);
  assert.equal(g.radiusFor(10, 10), g.RMAX);
});

test('speed verdicts', () => {
  const ok = { n: 10, lcp: 700, inp: 64, cls: 0.01 };
  assert.equal(g.speedLead({ desktop: ok, mobile: ok }), 'Fast.');
  assert.equal(g.speedLead({ desktop: ok, mobile: { ...ok, inp: 300 } }), 'Mostly fast.');
  assert.equal(g.speedLead({ desktop: { ...ok, lcp: 3000 }, mobile: { ...ok, lcp: 4000 } }), 'Slow.');
  assert.equal(g.speedLead({ desktop: ok, mobile: { n: 0 } }), 'Fast.');
  assert.equal(g.speedLead(null), null);
});

test('numbers as words', () => {
  assert.equal(g.clsText(0), '0');
  assert.equal(g.clsText(0.007), '0.007');
  assert.equal(g.clsText(0.022), '0.02');
  assert.equal(g.offsetText(330), '+5:30');
  assert.equal(g.offsetText(-240), '−4:00');
  assert.equal(g.startsAt(330), 'half past');
  assert.equal(g.startsAt(345), 'quarter to');
  assert.equal(g.rulerMax({ desktop: { n: 5, lcp: 680 }, mobile: { n: 5, lcp: 800 } }), 3000);
  assert.equal(g.rulerMax({ desktop: { n: 5, lcp: 4000 } }), 5500);
  assert.deepEqual(g.rulerTicks(1000), [0, 500, 1000]);
  assert.equal(g.tickLabel(2500, false), '2.5');
  assert.equal(g.tickLabel(3000, true), '3 s');
});

test('the shift score is said in words', () => {
  const v = (dc, mc) => ({ desktop: { n: 5, cls: dc }, mobile: { n: 5, cls: mc } });
  assert.equal(g.movedText(v(0.007, 0)), "pages barely moved while loading on either (well inside Google's “good”)");
  assert.equal(g.movedText(v(0.08, 0)), "pages barely moved while loading on either (inside Google's “good”)");
  assert.equal(g.movedText(v(0.2, 0.3)), "pages jumped while loading on both (past Google's “good”)");
  assert.equal(g.movedText(v(0.01, 0.3)), "pages barely moved while loading on a computer but jumped on a phone (past Google's “good”)");
  assert.equal(g.movedText({ desktop: { n: 5, cls: 0.2 }, mobile: { n: 0, cls: 0 } }), "pages jumped while loading (past Google's “good”)");
  assert.equal(g.movedText(null), '');
});

test('weekday ranges average each end over the days counted', () => {
  // 2026-10-15 and 2026-10-08 are Thursdays, 2026-10-12 a Monday
  const r = g.weekdayRange([
    { d: '2026-10-08', lo: 106, hi: 159 },
    { d: '2026-10-15', lo: 56, hi: 102 },
    { d: '2026-10-12', lo: 30, hi: 40 },
  ]);
  assert.deepEqual(r.counts, [1, 0, 0, 2, 0, 0, 0]);
  assert.equal(r.lo[3], 81);
  assert.equal(r.hi[3], 130.5);
  assert.equal(r.lo[0], 30);
  assert.equal(r.hi[1], 0);
});
