// node --test src/scripts/stats/growing/
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dayNum, addDays, longColumns, xLabels, postsByDay, postNote, idList, median, stackOf, stackTotal,
  tallest, peopleBusiest, bandIndex, growthWords, peopleLine, mergeSorted, growthOnSorted, clusterMarks,
} from './calc.js';

const f = {
  num: (n) => Math.round(n).toLocaleString('en-US'),
  pct: (x) => (x > 0 && x < 0.01 ? 'under 1%' : Math.round(x * 100) + '%'),
  pctRange: (a, b) => `${Math.round(a * 100)}–${Math.round(b * 100)}%`,
  times: (r) => r.toFixed(1) + ' times',
};

const rows = (from, n, v = 10) => Array.from({ length: n }, (_, i) => ({ d: addDays(from, i), pages: v + i, files: 2 * v, bytes: 1000 }));

test('day arithmetic', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(dayNum('2026-08-03') - dayNum('2026-08-02'), 1);
});

test('long view keeps one column per day while they are wide enough', () => {
  const r = rows('2026-08-02', 77);
  const L = longColumns(r, 900);
  assert.equal(L.binned, false);
  assert.equal(L.cols.length, 77);
  assert.equal(L.slots, 77);
});

test('a missing day leaves a gap, not a squeeze', () => {
  const r = rows('2026-08-02', 5);
  r.splice(2, 1);
  const L = longColumns(r, 900);
  assert.deepEqual(L.cols.map((c) => c.i), [0, 1, 3, 4]);
  assert.equal(L.slots, 5);
});

test('narrow plots bin by ISO week, as the average day', () => {
  // 2026-08-02 is a Sunday: it is its own (Mon 27 Jul) week, then full weeks from Mon 3 Aug.
  const r = rows('2026-08-02', 15, 100);
  const L = longColumns(r, 30);
  assert.equal(L.binned, true);
  assert.equal(L.cols[0].from, '2026-08-02');
  assert.equal(L.cols[0].days, 1);
  assert.equal(L.cols[1].from, '2026-08-03');
  assert.equal(L.cols[1].to, '2026-08-09');
  assert.equal(L.cols[1].days, 7);
  assert.equal(L.cols[1].pages, (101 + 107) / 2); // mean of 101..107
  assert.equal(L.slots, 3);
});

test('x labels: ends plus month starts that have room', () => {
  const first = '2026-08-02', last = '2026-10-17';
  const xOf = (d) => (dayNum(d) - dayNum(first)) * 10;
  const L = xLabels(first, last, xOf);
  assert.deepEqual(L.map((l) => l.d), ['2026-08-02', '2026-09-01', '2026-10-01', '2026-10-17']);
  const tight = xLabels(first, last, (d) => (dayNum(d) - dayNum(first)) * 1.2);
  assert.ok(!tight.some((l) => l.d === '2026-10-01'), 'a crowded month label is dropped');
  assert.equal(tight[tight.length - 1].d, last);
});

test('post notes: the same day, the day after, or nothing', () => {
  const by = postsByDay([
    { id: 'AO-029', date: '2026-10-01' },
    { id: 'AO-056', date: '2026-10-17' }, { id: 'AO-055', date: '2026-10-17' },
  ]);
  assert.equal(postNote('2026-10-01', by), ', the day AO-029 went up');
  assert.equal(postNote('2026-10-02', by), ', the day after AO-029 went up');
  assert.equal(postNote('2026-10-05', by), '');
  assert.equal(postNote('2026-10-17', by), ', the day AO-055 and AO-056 went up');
  assert.equal(idList([{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }]), 'A, B and 2 more');
});

test('median', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(median([]), 0);
});

const pd = (d, pages, req, lo, hi) => ({ d, pages: { ...pages, total: 0 }, req: { ...req, total: 0 }, lo, hi });

test('stack: people are solid lo then striped hi − lo in pages, solid in files', () => {
  const p = pd('2026-09-24', { person: 21, stale: 3, agent: 41, bot: 29, scanner: 47 }, { person: 66, stale: 4, agent: 63, bot: 78, scanner: 4159 }, 21, 22);
  const s = stackOf(p, 'pages');
  assert.deepEqual(s.map((x) => x.seg), ['person-lo', 'person-hi', 'stale', 'agent', 'scanner', 'bot']);
  assert.equal(s[0].v, 21);
  assert.equal(s[1].v, 1);
  const f2 = stackOf(p, 'files');
  assert.equal(f2[0].v, 66);
  assert.equal(f2[1].v, 0);
  assert.equal(stackTotal(f2), 66 + 4 + 63 + 78 + 4159);
  const hid = stackOf(p, 'files', new Set(['scanner']));
  assert.equal(hid.find((x) => x.seg === 'scanner').v, 0);
});

test('tallest: labels a dominant kind and spots a wave the median rule alone would miss', () => {
  const cols = [];
  for (let i = 0; i < 30; i++) {
    const scanner = i === 6 ? 4159 : 300;
    cols.push({ d: addDays('2026-09-18', i), segs: [{ kind: 'person', v: 800 }, { kind: 'bot', v: 500 }, { kind: 'scanner', v: scanner }, { kind: 'agent', v: 400 }] });
  }
  const t = tallest(cols);
  assert.equal(t.d, '2026-09-24');
  assert.equal(t.kind, 'scanner');
  assert.equal(t.label, true);
  assert.equal(t.hint, true);
  // a busy-all-round day a hair taller than the wave doesn't steal the label
  const busy = cols.map((c, i) => (i === 20 ? { ...c, segs: [{ kind: 'person', v: 1876 }, { kind: 'bot', v: 1463 }, { kind: 'scanner', v: 270 }, { kind: 'agent', v: 768 }] } : c));
  const tb = tallest(busy);
  assert.equal(tb.d, '2026-09-24');
  assert.equal(tb.kind, 'scanner');
  // a flat month: no hint
  const flat = cols.map((c) => ({ ...c, segs: c.segs.map((s) => (s.kind === 'scanner' ? { ...s, v: 300 } : s)) }));
  assert.equal(tallest(flat).hint, false);
});

test('busiest day for people uses the middle of the range', () => {
  const b = peopleBusiest([{ d: 'a', lo: 10, hi: 100 }, { d: 'b', lo: 60, hi: 70 }, { d: 'c', lo: 5, hi: 6 }]);
  assert.equal(b.d, 'b');
  assert.equal(peopleBusiest([{ d: 'a', lo: 0, hi: 0 }]), null);
});

test('band index clamps to the ends', () => {
  assert.equal(bandIndex(-5, 0, 10, 5), 0);
  assert.equal(bandIndex(25, 0, 10, 5), 2);
  assert.equal(bandIndex(999, 0, 10, 5), 4);
});

test('growth copy', () => {
  const g = { a: 168.2, b: 379.4, r: 2.255, rows: 77, lead: 'yes-machines', shares: { first: { lo: 0.09, hi: 0.16 }, second: { lo: 0.1, hi: 0.17 } } };
  const w = growthWords(g, { loShare: 0.09, hiShare: 0.155 }, f);
  assert.equal(w.lead, 'Yes, mostly with machines.');
  const text = w.rest.map((p) => (typeof p === 'string' ? p : f.num(p.num))).join('');
  assert.equal(text, " The site sends 2.3 times as many pages a day as in its first month: 168 a day then, 379 a day over the last 30 days. People's share held at about 9 to 16%.");
  assert.equal(growthWords({ ...g, rows: 10, lead: 'too-young' }, null, f).lead, 'Too early to say;');
  const y = growthWords({ ...g, rows: 20, lead: 'young', a: 5.25, b: 9 }, null, f);
  assert.equal(y.lead, 'The site is 20 days old:');
  assert.equal(y.rest[1].num, 5.3);
  assert.equal(peopleLine({ first: { lo: 0.05, hi: 0.1 }, second: { lo: 0.12, hi: 0.2 } }, null, f), "People's share went from 5–10% to 12–20%.");
});

test('the long view draws sorted days from the sorted sums, totals before them', () => {
  const totals = rows('2026-09-01', 5, 100);              // 100, 101, 102, 103, 104 pages
  const sorted = [{ d: '2026-09-04', pages: 110, files: 1, bytes: 2 }, { d: '2026-09-05', pages: 120, files: 1, bytes: 2 }, { d: '2026-09-06', pages: 90, files: 1, bytes: 2 }];
  const m = mergeSorted(totals, sorted);
  assert.deepEqual(m.rows.map((r) => r.pages), [100, 101, 102, 110, 120, 90]);
  assert.deepEqual(m.rows.map((r) => r.sorted), [false, false, false, true, true, true]);
  assert.equal(m.from, '2026-09-04');
  // only the shared days are compared: 103 + 104 against 110 + 120
  assert.deepEqual(m.both, { totals: 207, sorted: 230 });
  assert.equal(mergeSorted(totals, []).from, null);
});

test('the growth answer quotes the sorted days when they cover the last 30', () => {
  const g = { a: 168, b: 379, r: 379 / 168, rows: 77, lead: 'yes-machines', shares: { first: { lo: 0.09, hi: 0.16 }, second: { lo: 0.1, hi: 0.17 } } };
  const s = growthOnSorted(g, Array.from({ length: 30 }, (_, i) => (i % 2 ? 380 : 394)));
  assert.equal(s.b, 387);
  assert.equal(s.r, 387 / 168);
  assert.equal(s.lead, 'yes-machines');
  // too few sorted days: the totals' figure stands
  assert.equal(growthOnSorted(g, [400, 400]).b, 379);
  // the lead follows the new ratio by agg.growth's rules
  assert.equal(growthOnSorted({ ...g, a: 300, shares: { first: { lo: 0.05, hi: 0.1 }, second: { lo: 0.1, hi: 0.2 } } }, new Array(30).fill(387)).lead, 'yes');
  assert.equal(growthOnSorted({ ...g, a: 340, shares: { first: { lo: 0.1, hi: 0.2 }, second: { lo: 0.1, hi: 0.2 } } }, new Array(30).fill(387)).lead, 'flat');
  assert.equal(growthOnSorted({ ...g, rows: 10, lead: 'too-young' }, new Array(30).fill(1)).b, 379);
});

test('post marks closer than the gap merge into one ring', () => {
  const marks = [0, 4.4, 8.8, 13.2, 17.6, 22, 26.4, 60].map((x, i) => ({ d: 'd' + i, x, y: 1, posts: [{ id: 'AO-' + i }] }));
  const c = clusterMarks(marks, 9, 2, 58);
  for (let i = 1; i < c.length; i++) assert.ok(c[i].x - c[i - 1].x >= 9, 'groups stay apart');
  assert.equal(c.reduce((s, g) => s + g.posts.length, 0), 8, 'no post is lost');
  assert.equal(c[0].posts.length > 1, true);
  assert.equal(c[c.length - 1].x, 58, 'clamped inside the plot');
  assert.equal(c[0].x >= 2, true);
});
