// node --test src/scripts/stats/ask/ src/scripts/stats/how/
// The asking parts against the dev fixture: the Noticed rules, the 32 live answers, the filter.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as agg from '../core/agg.js';
import * as fmt from '../core/fmt.js';
import * as words from '../core/words.js';
import { createViews } from '../core/view.js';
import { createStore } from '../core/store.js';
import { findings, plainText } from './findings.js';
import { QUESTIONS, questionList, matches, synonymMap, tokens } from './answers.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const fixture = JSON.parse(fs.readFileSync(path.join(root, '.stats-fixture.json'), 'utf8'));

// The build's listed posts, read from the frontmatter the way stats.astro reads the collection.
function buildFromPosts() {
  const dir = path.join(root, 'src/content/posts');
  const posts = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const head = fs.readFileSync(path.join(dir, f), 'utf8').split('\n---')[0];
    const get = (k) => (new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, 'm').exec(head) || [])[1];
    if (/^draft:\s*true/m.test(head) || /^unlisted:\s*true/m.test(head)) continue;
    posts.push({ id: get('id'), slug: f.replace(/\.md$/, ''), title: get('title'), date: get('date') });
  }
  posts.sort((a, b) => a.id.localeCompare(b.id));
  return { posts, bySlug: new Map(posts.map((p) => [p.slug, p])), labels: {}, courses: [] };
}

function ctxFor(json, range = { kind: 'last', n: 30 }) {
  const snap = agg.normalize(json, Date.parse('2026-10-18T09:00:00Z'));
  const build = buildFromPosts();
  const views = createViews(snap, build);
  const store = createStore({ range: agg.clampRange(snap, range), unit: 'pages', tz: 'local', route: { ch: 'top', sub: null, item: null } });
  return { snap, build, views, store, agg, fmt, words, tz: { zone: 'America/New_York', city: 'New York' } };
}

test('Noticed finds the scanner wave first, with its replay route', () => {
  const ctx = ctxFor(fixture);
  const f = findings(ctx);
  assert.ok(f.length >= 3, 'at least three findings on the fixture');
  assert.equal(f[0].key, 'wave');
  assert.equal(f[0].route, '#/top/replay?d=2026-09-24&u=files');
  assert.match(plainText(f[0].parts), /^On Thu 24 Sep, scanners asked for 4,159 files in one day, \d+ times a normal day\. 3,898 of them got 'not found'\.$/);
  const keys = f.map((x) => x.key);
  assert.ok(keys.includes('ai'), 'AI out-fetches search on the fixture');
  // Every route is a hash route the router understands.
  for (const x of f) assert.match(x.route, /^#\/(top|machines|growing|read|where)(\/|\?|$)/);
});

test('Noticed holds on a quiet single day: no wave, no crash', () => {
  const one = { ...fixture, days: fixture.days.slice(-1) };
  const f = findings(ctxFor(one));
  assert.ok(!f.some((x) => x.key === 'wave'));
});

test('All 32 questions are present, grouped, each with an answer and a route', () => {
  const ctx = ctxFor(fixture);
  const list = questionList(ctx);
  assert.equal(list.length, 32);
  assert.deepEqual([...new Set(list.map((q) => q.n))].sort((a, b) => a - b), Array.from({ length: 32 }, (_, i) => i + 1));
  for (const q of list) {
    assert.ok(q.q && typeof q.q === 'string', `question ${q.n}`);
    assert.ok(q.a && !/undefined|NaN|\[object/.test(q.a), `answer ${q.n}: ${q.a}`);
    assert.match(q.route, /^#\/\w+/, `route ${q.n}`);
    assert.ok(!/!/.test(q.a), `no exclamation marks: ${q.n}`);
  }
});

test('Live answers match the chapter numbers for 30 days', () => {
  const ctx = ctxFor(fixture);
  const v = ctx.views.get(ctx.store.get().range);
  const by = Object.fromEntries(questionList(ctx).map((q) => [q.n, q]));
  assert.ok(by[1].a.includes(fmt.num(v.people.hi)), by[1].a);
  assert.ok(by[1].a.includes(fmt.approx(v.people.lo)), by[1].a);
  assert.match(by[2].a, /^Mostly machines: /);
  assert.ok(by[5].a.startsWith('Yes: AI bots fetched ' + fmt.num(v.purposes.ai.pages)), by[5].a);
  assert.equal(by[14].route, '#/top/replay?d=2026-09-24&u=files');
  assert.match(by[13].route, /^#\/growing\/day\/\d{4}-\d{2}-\d{2}$/);
  assert.match(by[19].q, /^Does anyone read from /);
  assert.match(by[19].route, /^#\/where\/[A-Z]{2}$/);
  assert.match(by[24].a, /^(Fast|Mostly fast|Slow)/);
  assert.equal(by[27].route, '#/top?r=1');
  assert.equal(by[28].route, '#/top?r=7');
  assert.ok(by[30].a.endsWith('in the last 30 days.'), by[30].a);
});

test('Answers follow the range: the latest day', () => {
  const ctx = ctxFor(fixture, { kind: 'last', n: 1 });
  const by = Object.fromEntries(questionList(ctx).map((q) => [q.n, q]));
  assert.ok(by[30].a.endsWith('on Saturday 17 October.'), by[30].a);
  assert.match(by[23].a, /Two weeks/);
  assert.match(by[13].a, /^There's one day here/);
});

test('The filter: "google" finds three or more, synonyms work, nonsense finds none', () => {
  const ctx = ctxFor(fixture);
  const list = questionList(ctx);
  const syn = synonymMap(words.SYNONYMS);
  const hit = (q) => list.filter((i) => matches(i, q, syn)).map((i) => i.n);
  assert.ok(hit('google').length >= 3, 'google: ' + hit('google'));
  assert.ok(hit('google').includes(7));
  assert.ok(hit('attack').includes(9) && hit('attack').includes(8), 'attack finds the scanner questions');
  assert.ok(hit('phone').includes(21) && hit('phone').includes(25));
  assert.ok(hit('phones').includes(21), 'plurals are trimmed');
  assert.ok(hit('busiest').includes(13));
  assert.deepEqual(hit('zzqx'), []);
  assert.equal(hit('').length, 32);
});

// R3: synonyms ran one way only, so the words a newcomer types first ("iphone", "views", "who
// reads") found nothing. Each must find the question that answers it, and a short synonym ("i"
// for "you") must not turn into a prefix that finds everything.
test('The filter finds the words a newcomer types', () => {
  const ctx = ctxFor(fixture);
  const list = questionList(ctx);
  const syn = synonymMap(words.SYNONYMS);
  const hit = (q) => list.filter((i) => matches(i, q, syn)).map((i) => i.n);
  for (const [q, n] of [['iphone', 21], ['android', 25], ['laptop', 21], ['anthropic', 5], ['views', 1],
    ['pageviews', 1], ['hits', 1], ['audience', 1], ['usa', 18], ['who reads', 1], ['real people', 1], ['search', 7]]) {
    assert.ok(hit(q).includes(n), `${q} -> ${n}: ${hit(q)}`);
  }
  assert.ok(hit('you').includes(26) && !hit('you').includes(2) && hit('you').length <= 8, 'you: ' + hit('you'));
});

test('Scanner sentences say most, not all, when some knocks got something other than not found', () => {
  const ctx = ctxFor(fixture);
  const by = Object.fromEntries(questionList(ctx).map((q) => [q.n, q]));
  const v = ctx.views.get(ctx.store.get().range);
  const n404 = v.probeStatus.find((r) => String(r.code) === '404').n;
  assert.ok(n404 < v.files.scanner);
  assert.ok(by[8].a.includes(`mostly on doors that don't exist (${fmt.num(n404)} got 'not found')`), by[8].a);
  assert.doesNotMatch(plainText(findings(ctx)[0].parts), /None of them/);
});

test('tokens trims plurals and possessives', () => {
  assert.deepEqual(tokens("Googlebot's pages"), ['googlebot', 'page']);
  assert.deepEqual(tokens('Countries'), ['country']);
});

test('QUESTIONS covers every group', () => {
  const groups = new Set(QUESTIONS.map((q) => q.group));
  for (const g of ['People', 'Machines', 'Time', 'Place', 'Speed', 'This page']) assert.ok(groups.has(g), g);
});

test('A one-page day: no "120 to 120", no "1 pages", no leader picked from a tie (24 Sep)', () => {
  const ctx = ctxFor(fixture, { kind: 'day', d: '2026-09-24' });
  const by = new Map(questionList(ctx).map((it) => [it.n, it.a]));
  assert.doesNotMatch(by.get(2), /\b([\d,]+) to \1\b/);
  for (const a of by.values()) assert.doesNotMatch(a, /(^|[^\d,.])1 pages/);
  const v = ctx.views.get(ctx.store.get().range);
  const placed = v.countries.people.filter((r) => r.n > 0 && !['XX', 'T1', ''].includes(r.code));
  if (placed[1] && placed[1].n === placed[0].n) assert.match(by.get(18), /none ahead of the rest/);
});

// R2: the growth and weekday answers printed a third number that neither chapter shows. They now
// take theirs from the chapters' own functions; this holds them to the same figures.
test('Growth and weekday answers say what their chapters say', async () => {
  const { growthOnSorted } = await import('../growing/calc.js');
  const { weekdayRange } = await import('../rhythm/geom.js');
  const ctx = ctxFor(fixture);
  const v = ctx.views.get(ctx.store.get().range);
  const by = Object.fromEntries(questionList(ctx).map((q) => [q.n, q]));
  const all = ctx.views.all();
  const g = growthOnSorted(agg.growth(ctx.snap, all.days), all.perDay.map((pd) => pd.pages.total));
  assert.ok(by[12].a.includes(`${fmt.num(g.b)} now`), by[12].a);
  const w = weekdayRange(v.people.perDay);
  const j = w.hi.indexOf(Math.max(...w.hi));
  assert.ok(by[23].a.includes(`about ${Math.round(w.lo[j])} to ${Math.round(w.hi[j])} pages`), by[23].a);
});
