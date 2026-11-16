// /ai-landscape against its frozen data and its registry, for every snapshot in the registry: five providers with 45
// floors that each have a state, every first-depth string inside its word limit, the fixed copy at 370 words or fewer,
// no lead and no field name in what is published, no verdict resting on evidence read after its date, no dated folder
// that names another date, a registry newest first that matches the page files. With a dist/, the built pages agree.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { LISTED, SNAPSHOTS } from '../../src/data/ai-landscape.js';

// Snapshots that have been public: deleting one of them from the registry breaks its permanent address.
const PUBLISHED = ['2026-11-10'];
const PAGES = 'src/pages/ai-landscape';
const STATES = new Set(['solid', 'hatch', 'frost', 'dotted', 'hollow']);
// a date as a path: a dated folder or a dated file (ai-landscape/<date>/, /<date>.json, <date>/sources), not a date in prose
const DATE = /(?<=ai-landscape\/|\/)\d{4}-\d{2}-\d{2}(?=[/.'"`])/g;
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const copyStrings = (node) => (typeof node === 'string' ? [node] : Object.values(node).flatMap(copyStrings));
const walk = (p) => (!fs.existsSync(p) ? [] : fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => walk(path.join(p, f))) : [p]);
const TEXT = /\.(js|mjs|astro|css|json|md|txt|svg)$/;
// Every file of one snapshot: its four dated folders and its two page files.
const filesOf = (date) => [
  ...['components', 'scripts', 'styles', 'assets'].flatMap((kind) => walk(`src/${kind}/ai-landscape/${date}`)),
  `${PAGES}/${date}.astro`, ...walk(`${PAGES}/${date}`),
].filter((f) => TEXT.test(f) && fs.existsSync(f));
// The dated paths a file names that are not its snapshot's own: a copied folder that kept an old import path.
const foreignDates = (text, own) => [...new Set(text.match(DATE) || [])].filter((d) => d !== own);

test('a snapshot\'s files name no other date: a copy that kept one old import path fails here', () => {
  assert.deepEqual(foreignDates("import raw from '../../../../data/ai-landscape/2026-11-10.json';", '2026-12-01'), ['2026-11-10'], 'the guard catches a kept data path');
  assert.deepEqual(foreignDates("import '../../../styles/ai-landscape/2026-11-10/base.css';", '2026-12-01'), ['2026-11-10'], 'the guard catches a kept folder');
  assert.deepEqual(foreignDates('// "Shipped, Confirmed, as of 2026-10-29, Sources 2"', '2026-12-01'), [], 'a date in a sentence is not a path');
  for (const { date } of SNAPSHOTS) {
    const files = filesOf(date);
    assert.ok(files.length > 100, `${date} has its dated folders`);
    for (const f of files) assert.deepEqual(foreignDates(fs.readFileSync(f, 'utf8'), date), [], `${f} names another snapshot's date`);
  }
});

for (const { date } of SNAPSHOTS) {
  const raw = JSON.parse(fs.readFileSync(`src/data/ai-landscape/${date}.json`, 'utf8'));
  const dir = `../../src/components/ai-landscape/${date}/data`;
  const { COPY } = await import(`${dir}/copy.js`);
  const { LIMITS, misses, printable, words } = await import(`${dir}/limits.js`);
  const { ORDER, view } = await import(`${dir}/view.js`);

  test(`${date}: five providers, in the owner's order, each with the fields the page reads`, () => {
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

  test(`${date}: 45 layer cells, nine per company in the fixed order, each with one of the five states`, () => {
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

  test(`${date}: every first-depth string is inside its word limit and prints in the page fonts`, () => {
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

  test(`${date}: the fixed copy is 370 words or fewer, the screen-reader words 60 or fewer, and all print in the page fonts`, () => {
    const { a11y, ...seen } = COPY;
    const all = copyStrings(seen);
    const hidden = copyStrings(a11y || {});
    const total = all.reduce((n, s) => n + words(s), 0);
    const quiet = hidden.reduce((n, s) => n + words(s), 0);
    assert.ok(total <= 370, `data/copy.js holds ${total} visible words, over 370`);
    assert.ok(quiet <= 60, `data/copy.js holds ${quiet} screen-reader words, over 60`);
    for (const s of [...all, ...hidden]) assert.ok(printable(s), `"${s}" has a character the page fonts lack`);
  });

  test(`${date}: the frozen data carries no unverified lead, only their count, and sources that link safely`, () => {
    assert.equal('unverified' in raw, false);
    assert.ok(Number.isInteger(raw.unverifiedCount) && raw.unverifiedCount > 0);
    assert.equal(raw.snapshot.date, date);
    // Cited as the sources page counts it: a lead's source keeps only its number, kind and date.
    const cited = new Set();
    (function walkData(node, key) {
      if (Array.isArray(node)) return node.forEach((v) => (typeof v === 'number' && key === 'sources' ? cited.add(v) : walkData(v, key)));
      if (!node || typeof node !== 'object') return;
      for (const [k, v] of Object.entries(node)) (k === 'src' && typeof v === 'number' ? cited.add(v) : walkData(v, k));
    })({ ...view.data, sources: null, conflicts: null });
    raw.sources.forEach((s, i) => {
      assert.equal(s.n, i + 1, 'sources are numbered 1 to n in order');
      assert.ok(s.date && s.kind, `source ${s.n} has a date and a kind`);
      if (!cited.has(s.n)) assert.ok(s.title === null && s.url === null, `source ${s.n} is cited by nothing published and keeps no title or address`);
      else if (!s.title) assert.fail(`source ${s.n} is cited and has a title`);
      else if (s.kind === 'request') assert.equal(s.url, null, `source ${s.n} is the request and has no address`);
      else assert.match(s.url, /^https:\/\//, `source ${s.n} links over https`);
    });
    assert.equal(raw.sources.filter((s) => s.title).length, cited.size, 'the sources with a title are exactly the cited ones');
    assert.ok(raw.conflicts.every((c) => !('resolution' in c)), 'a conflict keeps its topic and state, never its resolution');
    assert.ok(!JSON.stringify(raw).includes('"checked":'), 'no source-check or red-team trail');
    assert.ok(raw.sinceSnapshot.length > 0 && raw.expiring.length > 0);
  });

  test(`${date}: no string a visitor reads names a field or a data file (facts-9)`, () => {
    const seen = [];
    (function walkData(node, at) {
      if (typeof node === 'string') return void seen.push([node, at]);
      if (Array.isArray(node)) return node.forEach((v, i) => walkData(v, `${at}[${i}]`));
      if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (!['url', 'id', 'claimRef'].includes(k) && !k.endsWith('Ref') && k !== 'refs') walkData(v, `${at}.${k}`);
    })({ method: raw.snapshot.method, providers: raw.providers, bestAt: raw.bestAt, architecture: raw.architecture, aaron: raw.aaron, sinceSnapshot: raw.sinceSnapshot }, '');
    for (const [s, at] of seen) {
      assert.ok(!/"[a-z]+[A-Z][A-Za-z]*"|"(unverified|checked|resolution)"/.test(s), `${at} quotes a field name: ${s}`);
      assert.ok(!/\b[a-z]+\.json\b|\b(SCHEMA|CONFLICTS|FACTS)\.md\b/.test(s), `${at} names a data file: ${s}`);
    }
  });

  test(`${date}: the changes since the snapshot are sourced, and no verdict, reason or label rests on evidence read after it`, () => {
    for (const s of raw.sinceSnapshot) {
      assert.ok(Number.isInteger(s.src) || s.reread === true, `"${s.what}" has a source or is a re-reading of cited pages`);
      assert.ok(['confirmed', 'reported'].includes(s.confidence), `"${s.what}" is ${s.confidence}: no rumour is published`);
    }
    for (const c of raw.bestAt.capabilities) {
      const first = (c.evidence || [])[0];
      if (c.verdict === 'clear') assert.ok(first && !(first.readOn && first.readOn > date), `${c.id} is clear on a row read on ${first && first.readOn}, after ${date}`);
      for (const e of c.evidence || []) if (e.readOn) assert.ok(e.readOn > date, `${c.id}: a readOn date is after the snapshot`);
      // every verdict, not only a clear one (review round 2, F2-2): nobody is placed on a row read late, and no reason
      // or "leads on" label names a test or a subject that only a late row holds
      const late = (c.evidence || []).filter((e) => e.readOn);
      const onTime = (c.evidence || []).filter((e) => !e.readOn);
      const places = [c.leader, c.runnerUp, ...(c.contenders || [])].filter(Boolean);
      const guess = raw.bestAt.ownerGuesses.find((g) => g.capabilityRef === c.id);
      const said = [c.reason, guess && guess.reason, ...places.map((x) => x.leadsOn)].filter(Boolean);
      for (const e of late) {
        for (const x of places) {
          const ref = x.modelRef || x.productRef;
          if (ref && ref === e.subjectRef) assert.ok(onTime.some((o) => o.subjectRef === ref), `${c.id}: ${x.label} is placed only on a row read ${e.readOn}`);
        }
        const testName = e.what.split(/[\s:]/)[0];      // "FACTS Search: ..." is the test FACTS
        if (!onTime.some((o) => o.what.split(/[\s:]/)[0] === testName)) for (const t of said) assert.ok(!t.includes(testName), `${c.id}: "${t}" names ${testName}, read ${e.readOn}`);
        if (!onTime.some((o) => o.subject === e.subject)) assert.ok(!c.reason.includes(e.subject), `${c.id}: its reason names ${e.subject}, scored only on a row read ${e.readOn}`);
      }
    }
    // a price that ends says when: every flagship with priceUntil has its end in the expiry list
    for (const f of raw.bestAt.flagships) {
      if (!f.priceUntil) continue;
      assert.ok(f.priceClaim && raw.expiring.some((e) => e.claimRef === f.priceClaim.id && e.staleAfter === f.priceUntil), `${f.provider}'s price end is in the expiry list`);
    }
  });
}

test('the registry is newest first, matches the page files, and keeps every published snapshot', async () => {
  const { printable } = await import(`../../src/components/ai-landscape/${SNAPSHOTS[0].date}/data/limits.js`);
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

const DIST = 'dist/ai-landscape';
const built = fs.existsSync(`${DIST}/index.html`);
test('the built pages: newest at /ai-landscape/, "Newest" only on an older snapshot, the stamp and the sources', { skip: !built && 'no dist/' }, async () => {
  const home = read(`${DIST}/index.html`);
  assert.match(home, new RegExp(`data-snapshot="${SNAPSHOTS[0].date}"`));
  for (const [k, { date }] of SNAPSHOTS.entries()) {
    const { COPY } = await import(`../../src/components/ai-landscape/${date}/data/copy.js`);
    const raw = JSON.parse(fs.readFileSync(`src/data/ai-landscape/${date}.json`, 'utf8'));
    const page = read(`${DIST}/${date}/index.html`);
    assert.ok(page, `/ai-landscape/${date}/ is built`);
    assert.match(page, new RegExp(`data-snapshot="${date}"`));
    // the newest snapshot's pages never point to "Newest"; an older one's do, and only theirs carry no empty slot
    const newest = (page.match(new RegExp(`<a[^>]*href="/ai-landscape/"[^>]*>${COPY.stamp.newest}</a>`, 'g')) || []).length;
    if (k === 0) assert.equal(newest, 0, `/ai-landscape/${date}/ is the newest and links nothing as ${COPY.stamp.newest}`);
    else assert.ok(newest >= 1, `/ai-landscape/${date}/ links /ai-landscape/ as ${COPY.stamp.newest}`);
    assert.equal(page.includes('ail-slab--next'), k === 0, 'the empty slot for the next snapshot stands only on the newest');
    assert.match(page, new RegExp(`href="/ai-landscape/${date}/" aria-current="page"`), 'the current edition is marked');
    assert.equal((page.match(/class="ail-since__item"/g) || []).length, raw.sinceSnapshot.length, 'every change since the snapshot is in the page');
    assert.equal((page.match(/class="ail-expiring__item"/g) || []).length, raw.expiring.length, 'every expiring fact is in the page');
    assert.ok(!page.includes('class="ail-strip'), 'no edition strip under the text version: the stamp\'s shelf is the one list');
    const src = read(`${DIST}/${date}/sources/index.html`);
    assert.ok(src, 'the sources page is built');
    const rows = src.match(/<li class="ail-src"[\s\S]*?<\/li>/g) || [];
    assert.equal(rows.length, raw.sources.length, 'every source is listed');
    for (const row of rows) for (const [, href] of row.matchAll(/href="([^"]*)"/g)) assert.match(href, /^https:\/\//, 'a source links only https');
    const request = rows.find((r) => r.includes(`id="s-${raw.sources.find((s) => s.kind === 'request').n}"`));
    assert.ok(request && !request.includes('<a '), 'the request has no link');
    assert.ok(src.includes(`<b>${raw.unverifiedCount}</b> ${COPY.stamp.unverified}`), 'the count of unverified leads, and nothing else of them');
  }
});

// LISTED (src/data/ai-landscape.js) is the one switch: off, the pages say noindex and nothing on the site lists them.
test(`the LISTED switch is ${LISTED}: noindex, the sitemap, the project card and the preview label follow it`, { skip: !built && 'no dist/' }, () => {
  const noindex = /<meta name="robots" content="noindex"\s*\/?>/;
  for (const page of ['index.html', ...SNAPSHOTS.flatMap(({ date }) => [`${date}/index.html`, `${date}/sources/index.html`])]) {
    const html = read(`${DIST}/${page}`);
    assert.equal(noindex.test(html.split('</head>')[0]), !LISTED, `/ai-landscape/${page} ${LISTED ? 'has no' : 'has a'} robots noindex`);
    assert.equal(html.includes('class="ail-preview'), !LISTED, `/ai-landscape/${page} ${LISTED ? 'has no' : 'has its'} preview label`);
  }
  const sitemap = read('dist/sitemap.xml');
  assert.equal(sitemap.includes('/ai-landscape/'), LISTED, `the sitemap ${LISTED ? 'lists' : 'leaves out'} the AI landscape`);
  for (const where of ['projects/index.html', 'tea/index.html']) {
    const html = read(`dist/${where}`);
    assert.ok(html, `dist/${where} is built`);
    assert.equal(/href="\/ai-landscape\//.test(html), LISTED, `/${where.replace('index.html', '')} ${LISTED ? 'links' : 'does not link'} the AI landscape`);
  }
});
