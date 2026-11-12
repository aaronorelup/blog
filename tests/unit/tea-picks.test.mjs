// The tea room's picks (src/data/tea-picks.json) through their one reader (src/lib/tea-picks.js), the resolver the
// page will call (src/lib/tea-chapters.js), npm run tea:picks and the checker's rule: the shipped picks resolve on
// the real site; order, hidden and missing chapters; a shelf's max and an auto shelf's count; every refusal; a
// draft or unlisted post never comes out; a machine gone from the lab and the live notebook only warn.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';
import { runChecks } from '../../scripts/check/run.mjs';
import { hash } from '../../scripts/check/never-publish.mjs';
import { TOPICS } from '../../src/data/taxonomy.js';
import { TEA_CHAPTERS } from '../../src/data/tea-chapters.js';
import { isListed, ledgerOrder } from '../../src/lib/posts.js';
import { asPost, picksFile, readPicks } from '../../src/lib/tea-picks.js';

// src/lib/paths.js reads the __PUBLIC_DIR__ define Astro gives the build; tea.js reaches it through icons.js.
const REPO = fileURLToPath(new URL('../../', import.meta.url));
globalThis.__PUBLIC_DIR__ = path.join(REPO, 'public/');
const { resolveChapters } = await import('../../src/lib/tea-chapters.js');
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

// The real site as lib/tea-room.js hands it over: every post through the schema, and a stand-in card per project file
// with what projectHref reads (lib/projects.js needs Vite's import.meta.glob, so plain Node can't load it).
const names = (dir, ext) => fs.readdirSync(path.join(REPO, dir)).filter((f) => f.endsWith(ext)).sort().map((f) => f.slice(0, -ext.length));
const realPosts = names('src/content/posts', '.md').map((id) => ({ id,
  data: collections.posts.schema.parse(matter(read(`src/content/posts/${id}.md`)).data) }));
const realCards = names('src/content/projects', '.yaml').map((key) => {
  const p = matter.engines.yaml.parse(read(`src/content/projects/${key}.yaml`));
  return { key, section: p.section, main: p.main && { href: p.main.href, external: /^https?:/.test(p.main.href) },
    posts: (p.posts ?? []).map((slug) => ({ slug })) };
});
const realMachine = (name) => fs.existsSync(path.join(REPO, 'public/labs/teardown', name));
const real = { posts: realPosts, notes: new Map(), cards: realCards, hasMachine: realMachine };
const shipped = JSON.parse(read('src/data/tea-picks.json'));
const PREFIX = { post: 'p', project: 'j', machine: 'm' };

// The lab is another session's live notebook: a machine it drops is left out with a warning, never a failure here.
const inLab = (key) => !key.startsWith('m-') || realMachine(key.slice(2));

test('the shipped picks resolve on the real site: every chapter in order, each shelf its picks, nothing else warned', () => {
  const warnings = [];
  const chapters = resolveChapters(shipped, TEA_CHAPTERS, { ...real, warn: (w) => warnings.push(w) });
  const gone = Object.values(shipped.shelves).flatMap((s) => s.picks).filter((k) => !inLab(k));
  assert.equal(warnings.length, gone.length);
  for (const k of gone) assert.ok(warnings.some((w) => w.includes(`"${k}" is not in the teardown lab`)), k);
  assert.deepEqual(chapters.map((c) => c.id), shipped.order);
  assert.deepEqual(chapters.map((c) => c.numeral), ['', ...chapters.slice(1).map((c, i) => ['I', 'II', 'III', 'IV', 'V', 'VI',
    'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'][i])]);
  const listed = new Set(realPosts.filter((p) => isListed(p.data)).map((p) => p.id));
  for (const c of chapters) {
    for (const s of c.shelves) {
      const picks = shipped.shelves[`${c.id}/${s.id}`].picks.filter(inLab);
      assert.deepEqual(s.rows.map((r) => `${PREFIX[r.kind]}-${r.slug ?? r.key}`), picks.slice(0, s.max), `${c.id}/${s.id}`);
      for (const r of s.rows.filter((r) => r.kind === 'post')) {
        assert.ok(listed.has(r.slug));
        assert.equal(r.href, `/ledger/${r.slug}/`);
      }
      for (const r of s.rows.filter((r) => r.kind === 'project')) assert.ok(r.href && r.card.key === r.key);
      for (const r of s.rows.filter((r) => r.kind === 'machine')) assert.equal(r.href, `/labs/teardown/${r.key}/`);
    }
  }
  // the repo keeps the file exactly as npm run tea:picks writes it, with none of the owner's private notes
  assert.equal(read('src/data/tea-picks.json'), picksFile(shipped, TEA_CHAPTERS));
  assert.deepEqual(Object.keys(shipped), ['v', 'order', 'hidden', 'shelves']);
});

test("the chapter list: the picker's ids, a valid and unique CSS id each, topics from the taxonomy", () => {
  assert.deepEqual(TEA_CHAPTERS.map((c) => c.id), ['hero', 'start', 'tv', 'film', 'games', 'art', '3d', 'agents', 'learning',
    'site', 'projects', 'courses', 'now', 'about']);
  const doms = TEA_CHAPTERS.map((c) => c.dom);
  assert.equal(new Set(doms).size, doms.length);
  for (const d of doms) assert.match(d, /^[A-Za-z][A-Za-z0-9_-]*$/);
  assert.equal(TEA_CHAPTERS.find((c) => c.id === 'projects').dom, 'projects');
  for (const c of TEA_CHAPTERS.filter((c) => c.kind === 'topic')) {
    assert.deepEqual([c.dom, c.title, c.shelves[0].auto], [`topic-${c.topic}`, TOPICS[c.topic].label, { topic: c.topic }]);
  }
  assert.deepEqual(TEA_CHAPTERS.map((c) => c.title), ['The garden', 'Start here', 'I Love My Evening Television', 'AI video & film',
    'Games', 'AI art & images', '3D & animation', 'Working with AI agents', 'Learning to build with AI', 'This website', 'Projects',
    'Courses', 'Now', 'About']);
});

test('asPost gives the topic, projects and date the schema gives, from the raw frontmatter the checker reads', () => {
  for (const p of realPosts) {
    const raw = asPost({ id: p.id, data: matter(read(`src/content/posts/${p.id}.md`)).data });
    assert.deepEqual([raw.data.topic, raw.data.project, raw.data.date.getTime()], [p.data.topic, p.data.project, p.data.date.getTime()], p.id);
  }
});

// A made-up site and chapter list, for every case the real one may not hold today.
let n = 0;
const post = (slug, date, more = {}) => ({ id: slug, data: { id: `AO-9${String(++n).padStart(2, '0')}`, title: slug, summary: 's',
  date: new Date(date), topic: 'video', project: [], draft: false, unlisted: false, ...more } });
const posts = [post('v1', '2026-10-01'), post('v2', '2026-10-02'), post('v3', '2026-10-03'), post('v4', '2026-10-04'),
  post('newest-draft', '2026-11-01', { draft: true }), post('newest-unlisted', '2026-11-02', { unlisted: true }),
  post('ep1', '2026-09-01', { topic: 'agents', project: ['evening-television'] }),
  post('teardown-lab', '2026-12-01', { id: 'AO-073', topic: 'agents', project: ['evening-television'] })];
const cards = [{ key: 'game', section: 'play', main: { href: '/games/x/', external: false } },
  { key: 'film', section: 'watch', posts: [{ slug: 'v1' }] }];
const REG = [
  { id: 'hero', dom: 'top', kind: 'hero', title: 'H', shelves: [] },
  { id: 'a', dom: 'topic-video', kind: 'topic', topic: 'video', title: 'A', shelves: [{ id: 'leads', max: 2, holds: 'post', auto: { topic: 'video' } }] },
  { id: 'tv', dom: 'tv', kind: 'series', title: 'T', shelves: [{ id: 'episodes', max: 3, holds: 'post', auto: { project: 'evening-television' } },
    { id: 'machines', max: 2, holds: 'machine' }] },
  { id: 'b', dom: 'b', kind: 'projects', title: 'B', shelves: [{ id: 'play', max: 1, holds: 'project' }] },
  { id: 'c', dom: 'c', kind: 'now', title: 'C', shelves: [] },
];
const site = { posts, notes: new Map(), cards, hasMachine: (m) => ['dray', 'hab3'].includes(m) };
const shelf = (picks, more = {}) => ({ auto: false, count: 1, picks, ...more });
const doc = (more = {}) => ({ v: 1, order: ['hero', 'a', 'tv', 'b', 'c'], hidden: {}, shelves: {}, ...more });
const run = (d, warn) => resolveChapters(d, REG, { ...site, warn });
const keysOf = (c) => c.shelves.map((s) => s.rows.map((r) => r.slug ?? r.key));

test('order is followed, a chapter missing from it joins at the end in list order, a hidden one is left out', () => {
  assert.deepEqual(run(doc()).map((c) => c.id), ['hero', 'a', 'tv', 'b', 'c']);
  assert.deepEqual(run(doc({ order: ['c', 'b'] })).map((c) => c.id), ['c', 'b', 'hero', 'a', 'tv']);
  const shown = run(doc({ order: ['b', 'hero', 'a'], hidden: { a: true, tv: true, c: false } }));
  assert.deepEqual(shown.map((c) => [c.id, c.numeral]), [['b', 'I'], ['hero', ''], ['c', 'II']]);
  assert.deepEqual(run(doc({ order: undefined, hidden: undefined, shelves: undefined })).map((c) => c.id), REG.map((c) => c.id));
  assert.deepEqual(Object.keys(run(doc())[1]), ['id', 'dom', 'kind', 'topic', 'title', 'numeral', 'shelves']);
});

test("a picked shelf shows its picks in order, cut to the shelf's max; one not in the document is empty", () => {
  const [, a, tv, b] = run(doc({ shelves: { 'a/leads': shelf(['p-v3', 'p-v1', 'p-v4'], { count: 3 }), 'b/play': shelf(['j-film', 'j-game']) } }));
  assert.deepEqual(keysOf(a), [['v3', 'v1']]);
  assert.deepEqual(keysOf(b), [['film']]);
  assert.deepEqual(b.shelves[0].rows[0], { kind: 'project', key: 'film', card: cards[1], href: '/ledger/v1/', external: false });
  assert.deepEqual(keysOf(tv), [[], []]);
  assert.deepEqual(a.shelves[0].rows.map((r) => [r.kind, r.href]), [['post', '/ledger/v3/'], ['post', '/ledger/v1/']]);
  // a project card that links a post nobody may see never comes out either (lib/projects.js refuses one upstream too)
  const leaky = [{ key: 'film', section: 'watch', posts: [{ slug: 'newest-unlisted' }] }];
  assert.throws(() => resolveChapters(doc({ shelves: { 'b/play': shelf(['j-film']) } }), REG, { ...site, cards: leaky }),
    /project "film" links "newest-unlisted", which is not a listed post/);
});

test("an auto shelf shows the newest count listed posts of its topic in ledger order, never a draft or unlisted one", () => {
  const auto = (count, picks = []) => run(doc({ shelves: { 'a/leads': shelf(picks, { auto: true, count }) } }))[1];
  assert.deepEqual(keysOf(auto(3)), [['v4', 'v3', 'v2']]);
  // count, not max: the owner asked for that many
  assert.deepEqual(keysOf(auto(9, ['p-v1'])), [ledgerOrder(posts.filter((p) => p.data.topic === 'video' && isListed(p.data))).map((p) => p.id)]);
  const all = run(doc({ shelves: { 'a/leads': shelf([], { auto: true, count: 12 }), 'tv/episodes': shelf([], { auto: true, count: 12 }) } }));
  const slugs = JSON.stringify(all);
  assert.ok(!slugs.includes('newest-draft') && !slugs.includes('newest-unlisted'));
});

test('a machine gone from the lab is left out with a warning; the live notebook on a shelf only warns', () => {
  const warnings = [];
  const [, , tv] = run(doc({ shelves: { 'tv/machines': shelf(['m-gone', 'm-dray', 'm-hab3']),
    'tv/episodes': shelf([], { auto: true, count: 2 }) } }), (w) => warnings.push(w));
  assert.deepEqual(keysOf(tv), [['teardown-lab', 'ep1'], ['dray', 'hab3']]);
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /tv\/episodes shows the live notebook "teardown-lab"/);
  assert.match(warnings[1], /"m-gone".*not in the teardown lab/);
  // a hidden chapter shows nothing, so it warns about nothing
  const quiet = [];
  run(doc({ hidden: { tv: true }, shelves: { 'tv/machines': shelf(['m-gone']) } }), (w) => quiet.push(w));
  assert.deepEqual(quiet, []);
});

test('every document the page could not show is refused, naming the key and the shelf', () => {
  const refuses = (d, re) => assert.throws(() => run(d), (e) => re.test(e.message) && e.message.startsWith('src/data/tea-picks.json: '), String(re));
  const on = (key, s) => doc({ shelves: { [key]: s } });
  refuses(doc({ v: 2 }), /v is 2, and this code reads only v 1/);
  refuses({ ...doc(), v: undefined }, /v is undefined/);
  refuses(on('a/leads', shelf(['p-no-such'])), /"p-no-such" in shelf a\/leads is not a post/);
  refuses(on('a/leads', shelf(['p-newest-draft'])), /"p-newest-draft" in shelf a\/leads is a draft/);
  refuses(on('a/leads', shelf(['p-newest-unlisted'])), /"p-newest-unlisted" in shelf a\/leads is unlisted/);
  // a pick on an auto shelf is checked too: switching auto off would show it
  refuses(on('a/leads', shelf(['p-newest-draft'], { auto: true, count: 2 })), /is a draft/);
  refuses(on('b/play', shelf(['j-nope'])), /"j-nope" in shelf b\/play is not a project/);
  refuses(on('b/play', shelf(['p-v1'])), /"p-v1" in shelf b\/play is a post, and this shelf holds projects/);
  refuses(on('b/play', shelf(['j-game', 'j-game'])), /"j-game" is picked twice in shelf b\/play/);
  refuses(on('b/play', shelf(['x-game'])), /"x-game" in shelf b\/play is not a key/);
  refuses(on('tv/machines', shelf(['m-../x'])), /not a machine name/);
  refuses(on('b/play', shelf([], { auto: true })), /b\/play cannot fill itself/);
  refuses(on('b/play', shelf([], { count: 0 })), /b\/play: count is 0/);
  refuses(on('nope/leads', shelf([])), /shelf "nope\/leads" names chapter "nope"/);
  refuses(on('a/other', shelf([])), /shelf "a\/other" is not a shelf of chapter "a"/);
  refuses(on('c/x', shelf([])), /shelf "c\/x" is not a shelf of chapter "c" \(it has none\)/);
  refuses(doc({ order: ['a', 'nope'] }), /order names chapter "nope"/);
  refuses(doc({ order: ['a', 'b', 'a'] }), /order names chapter "a" twice/);
  refuses(doc({ hidden: { nope: true } }), /hidden names chapter "nope"/);
  refuses(doc({ hidden: { a: 'yes' } }), /hidden\.a is "yes"/);
  // a hidden chapter's shelves are checked as well
  refuses(doc({ hidden: { a: true }, shelves: { 'a/leads': shelf(['p-no-such']) } }), /"p-no-such" in shelf a\/leads/);
  for (const key of ['notes', 'general', 'savedAt']) refuses(doc({ [key]: '' }), new RegExp(`"${key}" is the owner's private note`));
  refuses(doc({ extra: 1 }), /"extra" is not a field/);
  // the saved document may hold the private fields when the tool reads it, never anything else
  const saved = { ...doc(), notes: { a: 'x' }, general: 'y', savedAt: 'z' };
  assert.doesNotThrow(() => readPicks(saved, REG, { ...site, projects: new Set() }, { allowPrivate: true }));
  assert.throws(() => readPicks({ ...saved, extra: 1 }, REG, { ...site, projects: new Set() }, { allowPrivate: true }), /"extra"/);
});

// A repo on disk with two posts, a project and a lab machine, for the tool and the checker.
function seed(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'tea-picks-')));
  t.after(() => fs.rmSync(root, { recursive: true }));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  const md = (id, more = '') => `---\nid: "${id}"\ntitle: "T"\nsummary: "s"\ndate: 2026-11-01\ntopic: "agents"${more}\n---\n\nText.\n`;
  put('src/content/posts/shown.md', md('AO-600'));
  put('src/content/posts/hidden.md', md('AO-601', '\nunlisted: true'));
  put('src/content/posts/teardown-lab.md', `---\nid: "AO-073"\ntitle: "Lab"\nsummary: "s"\ndate: 2026-12-01\n---\n`);
  put('src/content/projects/game.yaml', 'name: "Game"\nsection: play\n');
  put('public/labs/teardown/dray/index.html', '');
  put('src/data/never-publish.json', '[]');
  put('src/data/media-manifest.json', '{}');
  put('public/_redirects', '');
  return { root, put };
}
const saved = { v: 1, order: ['hero', 'start'], hidden: { now: true }, notes: { start: 'a private note' }, general: 'private too',
  shelves: { 'tv/machines': { auto: false, count: 1, picks: ['m-dray'] }, 'start/leads': { auto: false, count: 1, picks: ['p-shown'] },
    'projects/play': { auto: false, count: 1, picks: ['j-game'] } }, savedAt: '2026-11-12T10:00:00.000Z' };
const tool = (root, file) => promisify(execFile)(process.execPath, [path.join(REPO, 'scripts/tools/tea-picks.mjs'), file, '--root', root])
  .then((r) => ({ code: 0, ...r }), (e) => ({ code: e.code, stdout: e.stdout, stderr: e.stderr }));

test('npm run tea:picks: the private fields left out, keys in a fixed order, the same file the second time', async (t) => {
  const { root, put } = seed(t);
  put('saved.json', JSON.stringify(saved));
  const first = await tool(root, path.join(root, 'saved.json'));
  assert.equal(first.code, 0, first.stderr);
  assert.match(first.stdout, /wrote src\/data\/tea-picks\.json \(new\)/);
  assert.match(first.stdout, /start\/leads: \(not set\) -> p-shown/);
  const text = fs.readFileSync(path.join(root, 'src/data/tea-picks.json'), 'utf8');
  assert.ok(!/private|savedAt|notes|general/.test(text));
  assert.deepEqual(Object.keys(JSON.parse(text)), ['v', 'order', 'hidden', 'shelves']);
  // shelves in the chapter list's order, whatever order the picker saved them in
  assert.deepEqual(Object.keys(JSON.parse(text).shelves), ['start/leads', 'tv/machines', 'projects/play']);
  assert.equal(text, JSON.stringify(JSON.parse(text), null, 2) + '\n');
  const again = await tool(root, path.join(root, 'saved.json'));
  assert.equal(again.code, 0);
  assert.match(again.stdout, /nothing changed/);
  assert.equal(fs.readFileSync(path.join(root, 'src/data/tea-picks.json'), 'utf8'), text);
  // and the checker takes what it wrote
  assert.deepEqual(runChecks({ root }).filter((i) => i.rule === 'tea-picks'), []);
});

test('npm run tea:picks refuses a bad document with the reason and writes nothing', async (t) => {
  const { root, put } = seed(t);
  put('bad.json', JSON.stringify({ ...saved, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-hidden'] } } }));
  put('broken.json', '{ "v": 1,');
  for (const [file, re] of [['bad.json', /"p-hidden" in shelf start\/leads is unlisted/], ['broken.json', /JSON/], ['none.json', /no such file/]]) {
    const r = await tool(root, path.join(root, file));
    assert.equal(r.code, 1, file);
    assert.match(r.stderr, re);
  }
  assert.ok(!fs.existsSync(path.join(root, 'src/data/tea-picks.json')));
});

test("npm run check: picks the page would refuse fail, the live notebook and a missing machine warn, the scan covers the file", (t) => {
  const { root, put } = seed(t);
  const ours = () => runChecks({ root }).filter((i) => i.file === 'src/data/tea-picks.json').map((i) => [i.rule, i.severity, i.message]);
  assert.deepEqual(ours(), []);
  const write = (d) => put('src/data/tea-picks.json', JSON.stringify(d));
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-hidden'] } } });
  assert.deepEqual(ours(), [['tea-picks', 'error', '"p-hidden" in shelf start/leads is unlisted, not a listed post (the page could not be built from it)']]);
  assert.equal(runChecks({ root, deploy: true }).find((i) => i.rule === 'tea-picks').severity, 'error');
  write({ v: 1, order: [], hidden: {}, shelves: { 'agents/leads': { auto: true, count: 2, picks: [] },
    'tv/machines': { auto: false, count: 1, picks: ['m-gone'] } } });
  assert.deepEqual(ours().map(([rule, severity, m]) => [rule, severity, m.replace(/".*/, '')]), [
    ['tea-picks', 'warn', 'shelf tv/machines: '], ['tea-picks', 'warn', 'shelf agents/leads shows the live notebook ']]);
  // warnings about the live notebook, which not even npm run check -- --strict fails (scripts/check/index.mjs)
  assert.ok(runChecks({ root }).filter((i) => i.rule === 'tea-picks').every((i) => i.live === true));
  put('src/data/tea-picks.json', '{ "v": 1,');
  assert.match(ours()[0][2], /isn't valid JSON/);
  // a never-publish term in the picks fails like one anywhere else
  put('src/data/never-publish.json', JSON.stringify([hash('Zorblax')]));
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-Zorblax'] } } });
  assert.ok(ours().some(([rule, severity]) => rule === 'never-publish' && severity === 'error'));
});
