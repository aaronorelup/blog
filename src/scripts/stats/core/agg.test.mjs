// node --test src/scripts/stats/core/
// The merge layer's promises: ranges sum the right days, the people range is honest on days the
// counter came out higher, unlisted posts never leave agg, "at least" is said when a top list
// was cut, the gate's dots add up, and the clock follows daylight saving.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as agg from './agg.js';
import { createViews } from './view.js';

const day = (d, o = {}) => ({
  d,
  req: { person: 10, stale: 1, agent: 2, bot: 3, scanner: 4, ...(o.req || {}) },
  pages: { person: 5, stale: 1, agent: 1, bot: 2, scanner: 0, ...(o.pages || {}) },
  bytes: {},
  bots: o.bots || [],
  agents: o.agents || [],
  stale: o.stale || [],
  probes: o.probes || [],
  people: { hours: o.hours || [], paths: o.paths || [], countries: {}, devices: {}, browsers: {}, os: {} },
  rum: 'rum' in o ? o.rum : { loads: 3, visits: 1, paths: [], referrers: [], countries: {}, devices: {} },
  reads: o.reads || [],
});
const snapOf = (days, extra = {}) => agg.normalize({ v: 1, builtAt: '2026-10-18T00:24:10Z', through: days[days.length - 1].d, days, totals: { cols: ['d', 'pages'], rows: [] }, ...extra });
const dates = (n, start = '2026-09-18') => {
  const t0 = Date.parse(start + 'T00:00:00Z');
  return Array.from({ length: n }, (_, i) => new Date(t0 + i * 86400000).toISOString().slice(0, 10));
};
const build = (slugs) => {
  const posts = slugs.map((s, i) => ({ id: 'AO-' + String(i + 1).padStart(3, '0'), slug: s, title: 'Title ' + s, date: '2026-10-01' }));
  return { posts, bySlug: new Map(posts.map((p) => [p.slug, p])), labels: null, courses: [{ href: '/courses/c/', title: 'C' }] };
};

test('ranges pick the right days and clamp sensibly', () => {
  const snap = snapOf(dates(12).map((d) => day(d)));
  assert.equal(agg.rangeDays(snap, { kind: 'last', n: 7 }).length, 7);
  assert.equal(agg.rangeDays(snap, { kind: 'last', n: 7 })[6].d, snap.through);
  assert.deepEqual(agg.clampRange(snap, { kind: 'last', n: 30 }), { kind: 'last', n: 12 });
  assert.deepEqual(agg.clampRange(snap, { kind: 'day', d: '1999-01-01' }), { kind: 'last', n: 1 });
  assert.deepEqual(agg.clampRange(snap, { kind: 'day', d: '2026-09-20' }), { kind: 'day', d: '2026-09-20' });
  assert.equal(agg.rangeDays(snap, { kind: 'day', d: '2026-09-20' })[0].d, '2026-09-20');
  assert.equal(agg.rangeKey({ kind: 'last', n: 30 }), '30');
  assert.equal(agg.rangeKey({ kind: 'day', d: '2026-09-24' }), 'd:2026-09-24');
  const k = agg.kindSums(agg.rangeDays(snap, { kind: 'last', n: 7 }), 'pages');
  assert.equal(k.person, 35);
  assert.equal(k.total, 7 * 9);
});

test('days sort oldest first whatever order they arrive in', () => {
  const snap = snapOf([day('2026-09-20'), day('2026-09-18'), day('2026-09-19')]);
  assert.deepEqual(snap.days.map((d) => d.d), ['2026-09-18', '2026-09-19', '2026-09-20']);
});

test('people range: swap days, missing counter days, additive', () => {
  const days = [
    day('2026-09-18', { pages: { person: 30 }, rum: { loads: 50, visits: 0, paths: [], referrers: [], countries: {}, devices: {} } }),
    day('2026-09-19', { pages: { person: 40 }, rum: null }),
    day('2026-09-20', { pages: { person: 20 }, rum: { loads: 8, visits: 0, paths: [], referrers: [], countries: {}, devices: {} } }),
  ];
  const snap = snapOf(days);
  const p = agg.peopleRange(snap.days);
  assert.equal(p.lo, 30 + 0 + 8);
  assert.equal(p.hi, 50 + 40 + 20);
  assert.equal(p.swappedDays, 1);
  assert.equal(p.rumMissingDays, 1);
  assert.equal(p.loRaw, 58);
  assert.equal(p.hiRaw, 90);
  // a range is the sum of its days
  const parts = snap.days.map((d) => agg.peopleRange([d]));
  assert.equal(parts.reduce((s, x) => s + x.lo, 0), p.lo);
  assert.equal(parts.reduce((s, x) => s + x.hi, 0), p.hi);
});

test('verdict reads both ends of the range', () => {
  assert.equal(agg.verdict(0, 0, 0), 'none');
  assert.equal(agg.verdict(0, 0, 100), 'machines-all');
  assert.equal(agg.verdict(9, 16, 100), 'machines');
  assert.equal(agg.verdict(60, 80, 100), 'people');
  assert.equal(agg.verdict(40, 60, 100), 'half');
  assert.equal(agg.verdict(20, 70, 100), 'unclear');
});

test('unlisted posts never leave agg', () => {
  const b = build(['listed-post']);
  assert.equal(agg.isPublicPath('/ledger/storm-bell-pop-up/', b), false);
  assert.equal(agg.isPublicPath('/ledger/Storm-Bell-Pop-Up/', b), false);
  assert.equal(agg.isPublicPath('/posts/storm-bell-pop-up/', b), false);
  assert.equal(agg.isPublicPath('/media/storm-bell-pop-up/clip.mp4', b), false);
  assert.equal(agg.isPublicPath('/ledger/storm%2Dbell%2Dpop%2Dup/', b), false);
  assert.equal(agg.isPublicPath('/ledger/listed-post/', b), true);
  assert.equal(agg.isPublicPath('/ledger/', b), true);
  assert.equal(agg.isPublicPath('/ledger/previews.json', b), true);
  assert.equal(agg.isPublicPath('/about/?x=1', b), false);
  assert.equal(agg.isPublicPath('/a b/', b), false);
  assert.equal(agg.isPublicPath('/' + 'x'.repeat(130), b), false);
  const snap = snapOf([
    day('2026-09-18', {
      paths: [['/', 9], ['/ledger/storm-bell-pop-up/', 7], ['/ledger/listed-post/', 4]],
      probes: [['/ledger/storm-bell-pop-up/secret.txt', 6], ['/wp-login.php', 5]],
      reads: [['storm-bell-pop-up', 3], ['listed-post', 2]],
      rum: { loads: 3, visits: 1, paths: [['/ledger/storm-bell-pop-up/', 2], ['/', 1]], referrers: [], countries: {}, devices: {} },
    }),
  ]);
  const v = createViews(snap, b).all();
  const all = JSON.stringify([v.paths, v.probes, v.reads.map((r) => [r.slug, r.n]), v.rumPaths]);
  assert.ok(!all.includes('storm-bell'), 'unlisted slug leaked: ' + all);
  assert.deepEqual(v.paths.map((p) => p.path), ['/', '/ledger/listed-post/']);
  assert.equal(v.paths[1].kind, 'post');
  assert.equal(v.paths[0].label, 'The homepage (the tea house)');
  assert.deepEqual(v.reads.map((r) => r.slug), ['listed-post']);
  // the hidden door's knocks still count in the total
  assert.equal(v.probes.total, 4);
});

test('mergeTop marks partial sums', () => {
  const days = [
    { a: [['a', 5], ['b', 3]] },
    { a: [['a', 1]] },
    { a: [['a', 4], ['c', 2]] },
  ];
  const rows = agg.mergeTop(days, (d) => d.a, 2);
  const by = Object.fromEntries(rows.map((r) => [r.key, r]));
  assert.equal(by.a.n, 10);
  assert.equal(by.a.partial, false);
  assert.equal(by.b.partial, true); // the third day's list was full and didn't have b
  assert.equal(by.c.partial, true);
  assert.deepEqual(rows.map((r) => r.key), ['a', 'b', 'c']);
  assert.equal(agg.mergeTop(days, (d) => d.a, Infinity).every((r) => !r.partial), true);
});

test('largestRemainder hits its target and keeps small piles', () => {
  const cases = [
    [[3996, 326, 1914, 3370, 1767], 112],
    [[1000, 1, 1], 10],
    [[1, 1, 1, 1, 1], 3],
    [[0, 5, 0, 5, 0], 7],
    [[7, 7, 7], 10],
  ];
  for (const [vals, target] of cases) {
    const out = agg.largestRemainder(vals, target);
    assert.equal(out.reduce((a, b) => a + b, 0), target, `sum for ${vals}`);
    out.forEach((x, i) => { if (vals[i] === 0) assert.equal(x, 0); });
    const nonZero = vals.filter((x) => x > 0).length;
    if (target >= nonZero) out.forEach((x, i) => { if (vals[i] > 0) assert.ok(x >= 1, `${vals} -> ${out}`); });
  }
  assert.deepEqual(agg.largestRemainder([1000, 1, 1], 10), [8, 1, 1]);
  assert.deepEqual(agg.largestRemainder([0, 0], 5), [0, 0]);
});

test('pickUnit takes the smallest unit that fits', () => {
  assert.equal(agg.pickUnit(4000, 500), 10);
  assert.equal(agg.pickUnit(40, 500), 1);
  assert.equal(agg.pickUnit(4000, 150), 50);
});

test('hoursLocal: New York across the end of daylight saving (1 Nov 2026)', () => {
  const h = (i) => { const a = new Array(24).fill(0); a[i] = 1; return a; };
  const days = [
    day('2026-10-31', { hours: h(0) }),   // 00:30 UTC = 8:30 pm EDT on the 30th
    day('2026-10-31', { hours: h(10) }),  // 10:30 UTC = 6:30 am EDT
    day('2026-11-01', { hours: h(0) }),   // still EDT: 8:30 pm
    day('2026-11-01', { hours: h(10) }),  // after 06:00 UTC it's EST: 5:30 am
  ];
  const snap = snapOf(days);
  const r = agg.hoursLocal(snap.days, 'America/New_York', '2026-11-01');
  assert.equal(r.fractional, false);
  assert.equal(r.offsetMin, -300);
  assert.equal(r.bins[20], 2);
  assert.equal(r.bins[6], 1);
  assert.equal(r.bins[5], 1);
  assert.equal(r.total, 4);
  assert.equal(r.label(20), '8 pm');
  assert.equal(r.span(20), '8–9 pm');
  assert.equal(r.label(0), 'midnight');
  assert.equal(r.utcOf(19), 0); // 7 pm EST starts at midnight UTC
});

test('hoursLocal: Kolkata keeps UTC edges with half-hour labels', () => {
  const hours = new Array(24).fill(0);
  hours[14] = 5;
  const snap = snapOf([day('2026-10-17', { hours })]);
  const r = agg.hoursLocal(snap.days, 'Asia/Kolkata', '2026-10-17');
  assert.equal(r.fractional, true);
  assert.equal(r.offsetMin, 330);
  assert.equal(r.bins[14], 5);
  assert.equal(r.label(14), '7:30 pm');
  assert.equal(r.span(14), '7:30–8:30 pm');
  assert.equal(r.utcOf(14), 14);
});

test('hoursLocal: UTC is the plain sum', () => {
  const a = new Array(24).fill(0); a[3] = 2; a[12] = 1;
  const snap = snapOf([day('2026-10-16', { hours: a }), day('2026-10-17', { hours: a })]);
  const r = agg.hoursLocal(snap.days, 'utc', '2026-10-17');
  assert.equal(r.bins[3], 4);
  assert.equal(r.bins[12], 2);
  assert.equal(r.label(12), 'noon');
  assert.equal(r.span(23), '11 pm–midnight');
  assert.equal(r.offsetMin, 0);
});

test('display guards fold unknown names', () => {
  const ds = dates(3).map((d, i) => day(d, {
    agents: [['curl', 5], ['madeup-tool', i === 0 ? 30 : 0], ['steady-tool', 6], ['Other programs', 2]].filter((r) => r[1] > 0),
    bots: [['Googlebot', 'Google', 'Search Engine Crawler', 4, 2], ['Weirdbot', 'Unknown', 'AI Crawler', 50, 5]],
  }));
  const snap = snapOf(ds);
  const agents = agg.agentsMerged(snap.days);
  const labels = agents.map((a) => a.label);
  assert.ok(labels.includes('curl'));
  assert.ok(labels.includes('steady-tool'));   // 18 files on 3 days
  assert.ok(!labels.includes('madeup-tool'));  // 30 files, but on one day only
  assert.equal(agents[agents.length - 1].label, 'Other programs');
  assert.equal(agents.reduce((s, a) => s + a.n, 0), 3 * 5 + 30 + 3 * 6 + 3 * 2);
  const bots = agg.botsMerged(snap.days);
  assert.equal(bots.find((b) => b.name === 'Weirdbot').show, true); // 150 files on 3 days
  assert.equal(bots.find((b) => b.name === 'Googlebot').daysSeen, 3);
});

test('scanner wave and growth', () => {
  const ds = dates(10).map((d, i) => day(d, { req: { scanner: i === 4 ? 400 : 20 } }));
  const snap = snapOf(ds);
  const w = agg.scannerWave(snap);
  assert.equal(w.d, ds[4].d ?? dates(10)[4]);
  assert.equal(w.n, 400);
  assert.equal(w.median, 20);
  const flat = snapOf(dates(10).map((d) => day(d)));
  assert.equal(agg.scannerWave(flat), null);
  const rows = dates(60, '2026-08-01').map((d, i) => [d, i < 30 ? 100 : 230]);
  // the detail days overlap the last totals days, and count the same 230 pages there (226 people
  // plus the fixture day's 4 machine pages), so growth reads one figure from either source
  const gs = snapOf(dates(10).map((d) => day(d, { pages: { person: 226 } })), { totals: { cols: ['d', 'pages'], rows } });
  const g = agg.growth(gs, gs.days);
  assert.equal(Math.round(g.r * 10) / 10, 2.3);
  assert.equal(g.lead, 'yes-machines');
});

test('views phrase their range', () => {
  const snap = snapOf(dates(12).map((d) => day(d)));
  const views = createViews(snap, build([]));
  assert.equal(views.all().phrase.long, 'in the 12 days gathered so far');
  assert.equal(views.all().phrase.eyebrow, 'ALL 12 DAYS SO FAR');
  assert.equal(views.get({ kind: 'last', n: 7 }).phrase.long, 'in the last 7 days');
  assert.equal(views.get({ kind: 'last', n: 1 }).phrase.long, 'on Tuesday 29 September');
  assert.equal(views.get({ kind: 'day', d: '2026-09-24' }).phrase.short, 'Thu 24 Sep');
  assert.equal(views.get({ kind: 'last', n: 7 }), views.get({ kind: 'last', n: 7 }));
});

test('unlisted slugs stay out however the path is spelled', () => {
  const b = { ...build(['listed-post']), words: ['grind-and-grimoire', '00-01-the-hidden-curriculum'] };
  for (const p of ['/LEDGER/storm-bell-pop-up/', '//ledger/storm-bell-pop-up/', '/%6Cedger/storm-bell-pop-up/',
    '/%256Cedger/storm-bell-pop-up/', '/games/storm-bell-pop-up/', '/media/previews/storm-bell-pop-up.webp', '/a/../ledger/x/']) {
    assert.equal(agg.isPublicPath(p, b), false, p);
  }
  for (const p of ['/games/grind-and-grimoire/', '/courses/c/lessons/00-01-the-hidden-curriculum/', '/LEDGER/listed-post/',
    '/media/previews/listed-post.webp', '/wp-login.php', '/']) {
    assert.equal(agg.isPublicPath(p, b), true, p);
  }
});

test('the Worker\'s remainder rows are never named', () => {
  const ds = dates(3).map((d) => day(d, {
    bots: [['Googlebot', 'Google', 'Search Engine Crawler', 4, 2], ['Other bots', 'Unknown', 'Other', 20, 5]],
    agents: [['No user agent', 12], ['curl', 3]],
  }));
  const snap = snapOf(ds);
  assert.equal(agg.botsMerged(snap.days).find((r) => r.name === 'Other bots').show, false);
  const labels = agg.agentsMerged(snap.days).map((a) => a.label);
  assert.ok(labels.includes('No name given'));
  assert.ok(!labels.some((l) => /user agent/i.test(l)));
});

test('growth with a single detail day makes no share claim', () => {
  const rows = dates(60, '2026-08-01').map((d, i) => [d, i < 30 ? 100 : 230]);
  const one = snapOf([day('2026-10-17')], { totals: { cols: ['d', 'pages'], rows } });
  const g = agg.growth(one, one.days);
  assert.equal(g.shares, null);
  assert.equal(g.lead, 'yes-machines');
});

test('growth reads "now" from the detail days where they exist, totals before', () => {
  // 60 days of totals at 100 then 230 a day; the last 30 also have detail days, which count
  // 9 pages each (the fixture day's five kinds), so "now" is 9 a day, not the totals' 230.
  const all = dates(60, '2026-08-01');
  const rows = all.map((d, i) => [d, i < 30 ? 100 : 230]);
  const det = all.slice(30).map((d) => day(d));
  const s = snapOf(det, { totals: { cols: ['d', 'pages'], rows } });
  const g = agg.growth(s, s.days);
  assert.equal(g.a, 100);
  assert.equal(g.b, 9);
  assert.equal(g.lead, 'down');
  // detail days newer than the last totals row (the totals refresh once a day) count too
  const more = [...det, day('2026-09-30'), day('2026-10-01')];
  const s2 = snapOf(more, { totals: { cols: ['d', 'pages'], rows } });
  assert.equal(agg.growth(s2, s2.days).rows, 62);
});
