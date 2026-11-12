// /ai-landscape against its frozen data and its registry: five providers with 45 floors that each have a state, every
// first-depth string inside its word limit, the fixed copy at 370 words or fewer, a registry newest first that matches
// the page files, and the published snapshots still in it. With a dist/, the built pages agree (stamp, sources, editions).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import raw from '../../src/data/ai-landscape/2026-11-10.json' with { type: 'json' };
import { SNAPSHOTS } from '../../src/data/ai-landscape.js';
import { COPY } from '../../src/components/ai-landscape/2026-11-10/data/copy.js';
import { LIMITS, misses, printable, words } from '../../src/components/ai-landscape/2026-11-10/data/limits.js';
import { ORDER, view } from '../../src/components/ai-landscape/2026-11-10/data/view.js';

// Snapshots that have been public: deleting one of them from the registry breaks its permanent address.
const PUBLISHED = ['2026-11-10'];
const PAGES = 'src/pages/ai-landscape';
const STATES = new Set(['solid', 'hatch', 'frost', 'dotted', 'hollow']);
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const copyStrings = (node) => (typeof node === 'string' ? [node] : Object.values(node).flatMap(copyStrings));

test('five providers, in the owner\'s order, each with the fields the page reads', () => {
  assert.deepEqual(ORDER, ['anthropic', 'openai', 'google', 'meta', 'xai']);
  assert.deepEqual(Object.keys(raw.providers), ORDER);
  for (const id of ORDER) {
    const p = raw.providers[id];
    for (const key of ['identity', 'personalAgent', 'surfaces', 'models', 'signature', 'tension', 'misconceptions', 'media', 'extensibility']) {
      assert.ok(p[key], `${id} has ${key}`);
    }
    assert.ok(p.identity.name && p.personalAgent.name, `${id} has a name and an agent`);
  }
});

test('45 layer cells, nine per company in the fixed order, each with one of the five states', () => {
  const ids = raw.architecture.stackLayers.map((l) => l.id);
  assert.equal(ids.length, 9);
  let cells = 0;
  for (const p of view.providers) {
    assert.equal(p.stack.length, 9, `${p.id} has nine floors`);
    p.stack.forEach((c, i) => {
      cells++;
      assert.equal(c.layer, ids[i], `${p.id} floor ${i + 1} is ${ids[i]}`);
      assert.ok(STATES.has(c.state), `${p.id} floor ${i + 1} has a state (${c.state})`);
      assert.ok(c.fact || c.reason, `${p.id} floor ${i + 1} has a fact or a reason`);
    });
  }
  assert.equal(cells, 45);
});

test('every first-depth string is inside its word limit and prints in the page fonts', () => {
  assert.deepEqual(misses({ providers: raw.providers, bestAt: raw.bestAt, architecture: raw.architecture, aaron: raw.aaron }).map((m) => m.path), []);
  const first = [];
  const add = (s, limit, where) => { if (s) first.push([s, limit, where]); };
  for (const l of view.layers) { add(l.name, LIMITS.label, `layer ${l.n}`); add(l.sentence, LIMITS.sentence, `layer ${l.n} sentence`); }
  for (const p of view.providers) {
    add(p.nameNote, LIMITS.short, `${p.id} name note`);
    add(p.signature.line, LIMITS.label, `${p.id} known for`);
    add(p.tension.line, LIMITS.tension, `${p.id} catch`);
    p.myths.forEach((m) => add(m.myth, LIMITS.myth, `${p.id} myth ${m.id}`));
    p.stack.forEach((c) => add(c.name, LIMITS.label, `${p.id} floor ${c.n}`));
  }
  add(COPY.stamp.stale, LIMITS.sentence, 'the stamp line');
  for (const [s, limit, where] of first) {
    assert.ok(words(s) <= limit, `${where}: "${s}" is ${words(s)} words, over ${limit}`);
    assert.ok(printable(s), `${where}: "${s}" has a character the page fonts lack`);
  }
});

test('the fixed copy is 370 words or fewer, the screen-reader words 60 or fewer, and all print in the page fonts', () => {
  const { a11y, ...seen } = COPY;
  const all = copyStrings(seen);
  const hidden = copyStrings(a11y || {});
  const total = all.reduce((n, s) => n + words(s), 0);
  const quiet = hidden.reduce((n, s) => n + words(s), 0);
  assert.ok(total <= 370, `data/copy.js holds ${total} visible words, over 370`);
  assert.ok(quiet <= 60, `data/copy.js holds ${quiet} screen-reader words, over 60`);
  for (const s of [...all, ...hidden]) assert.ok(printable(s), `"${s}" has a character the page fonts lack`);
});

test('the registry is newest first, matches the page files, and keeps every published snapshot', () => {
  const dates = SNAPSHOTS.map((s) => s.date);
  assert.ok(dates.length > 0);
  for (const d of dates) assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(dates, [...dates].sort().reverse(), 'SNAPSHOTS is newest first');
  assert.equal(new Set(dates).size, dates.length, 'no date twice');
  const files = fs.readdirSync(PAGES).filter((f) => /^\d{4}-\d{2}-\d{2}\.astro$/.test(f)).map((f) => f.slice(0, 10));
  assert.deepEqual([...files].sort(), [...dates].sort(), 'one page file per registry date, and no other');
  for (const d of dates) {
    assert.ok(fs.existsSync(`src/data/ai-landscape/${d}.json`), `${d} has its data file`);
    assert.ok(fs.existsSync(`src/components/ai-landscape/${d}/Page.astro`), `${d} has its page`);
  }
  assert.match(read(`${PAGES}/index.astro`), new RegExp(`components/ai-landscape/${dates[0]}/Page\\.astro`), 'index.astro shows the newest');
  for (const d of PUBLISHED) assert.ok(dates.includes(d), `published ${d} is still in the registry`);
  for (const s of SNAPSHOTS) assert.ok(s.title && s.summary && printable(s.summary), `${s.date} has a title and a summary`);
});

test('the frozen data carries no unverified lead, only their count, and sources that link safely', () => {
  assert.equal('unverified' in raw, false);
  assert.ok(Number.isInteger(raw.unverifiedCount) && raw.unverifiedCount > 0);
  assert.equal(raw.snapshot.date, '2026-11-10');
  raw.sources.forEach((s, i) => {
    assert.equal(s.n, i + 1, 'sources are numbered 1 to n in order');
    assert.ok(s.title && s.date && s.kind, `source ${s.n} has a title, a date and a kind`);
    if (s.kind === 'request') assert.equal(s.url, null, `source ${s.n} is the request and has no address`);
    else assert.match(s.url, /^https:\/\//, `source ${s.n} links over https`);
  });
  assert.ok(raw.sinceSnapshot.length > 0 && raw.expiring.length > 0);
});

const DIST = 'dist/ai-landscape';
const built = fs.existsSync(`${DIST}/index.html`);
test('the built pages: newest at /ai-landscape/, each dated page links back as Newest, the stamp and the sources', { skip: !built && 'no dist/' }, () => {
  const home = read(`${DIST}/index.html`);
  assert.match(home, new RegExp(`data-snapshot="${SNAPSHOTS[0].date}"`));
  for (const { date } of SNAPSHOTS) {
    const page = read(`${DIST}/${date}/index.html`);
    assert.ok(page, `/ai-landscape/${date}/ is built`);
    assert.match(page, new RegExp(`data-snapshot="${date}"`));
    assert.match(page, new RegExp(`<a[^>]*href="/ai-landscape/"[^>]*>${COPY.stamp.newest}</a>`), `/ai-landscape/${date}/ links /ai-landscape/ as ${COPY.stamp.newest}`);
    assert.match(page, new RegExp(`href="/ai-landscape/${date}/" aria-current="page"`), 'the current edition is marked');
  }
  const own = read(`${DIST}/${raw.snapshot.date}/index.html`);
  assert.equal((own.match(/class="ail-since__item"/g) || []).length, raw.sinceSnapshot.length, 'every change since the snapshot is in the page');
  assert.equal((own.match(/class="ail-expiring__item"/g) || []).length, raw.expiring.length, 'every expiring fact is in the page');
  const src = read(`${DIST}/${raw.snapshot.date}/sources/index.html`);
  assert.ok(src, 'the sources page is built');
  const rows = src.match(/<li class="ail-src"[\s\S]*?<\/li>/g) || [];
  assert.equal(rows.length, raw.sources.length, 'every source is listed');
  for (const row of rows) for (const [, href] of row.matchAll(/href="([^"]*)"/g)) assert.match(href, /^https:\/\//, 'a source links only https');
  const request = rows.find((r) => r.includes(`id="s-${raw.sources.find((s) => s.kind === 'request').n}"`));
  assert.ok(request && !request.includes('<a '), 'the request has no link');
  assert.ok(src.includes(`<b>${raw.unverifiedCount}</b> ${COPY.stamp.unverified}`), 'the count of unverified leads, and nothing else of them');
});
