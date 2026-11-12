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
import { asPost, fromPicker, picksFile, readPicks } from '../../src/lib/tea-picks.js';

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
  { key: 'film', section: 'play', posts: [{ slug: 'v1' }] }, { key: 'reel', section: 'watch' }];
const REG = [
  { id: 'hero', dom: 'top', kind: 'hero', title: 'H', shelves: [] },
  { id: 'a', dom: 'topic-video', kind: 'topic', topic: 'video', title: 'A', shelves: [{ id: 'leads', max: 2, holds: 'post', auto: { topic: 'video' } }] },
  { id: 'tv', dom: 'tv', kind: 'series', title: 'T', shelves: [{ id: 'episodes', max: 3, holds: 'post', auto: { project: 'evening-television' } },
    { id: 'machines', max: 2, holds: 'machine' }] },
  { id: 'b', dom: 'b', kind: 'projects', title: 'B', shelves: [{ id: 'play', max: 1, holds: 'project', section: 'play' }] },
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
  const leaky = [{ key: 'film', section: 'play', posts: [{ slug: 'newest-unlisted' }] }];
  assert.throws(() => resolveChapters(doc({ shelves: { 'b/play': shelf(['j-film']) } }), REG, { ...site, cards: leaky }),
    /project "film" links "newest-unlisted", which is not a listed post/);
  // nor one whose own main link is such a post: the link the row would carry
  for (const href of ['/ledger/newest-unlisted/', '/ledger/newest-draft/#top']) {
    const main = [{ key: 'film', section: 'play', main: { href, external: false }, posts: [] }];
    assert.throws(() => resolveChapters(doc({ shelves: { 'b/play': shelf(['j-film']) } }), REG, { ...site, cards: main }),
      /project "film" links "newest-(unlisted|draft)", which is not a listed post/, href);
  }
});

test("more picks than a shelf shows are cut to its max with a warning that names them, which fails --strict", () => {
  const warnings = [];
  const [, a] = run(doc({ shelves: { 'a/leads': shelf(['p-v3', 'p-v1', 'p-v4', 'p-v2'], { count: 4 }) } }), (w) => warnings.push(w));
  assert.deepEqual(keysOf(a), [['v3', 'v1']]);
  assert.deepEqual(warnings, ['shelf a/leads shows at most 2 picks, so "p-v4", "p-v2" are left out']);
  // an auto shelf shows count, as the picker does: nothing to warn about
  const quiet = [];
  run(doc({ shelves: { 'a/leads': shelf([], { auto: true, count: 4 }) } }), (w) => quiet.push(w));
  assert.deepEqual(quiet, []);
  // the reader says which warnings are about the live notebook (they never fail anything) and which are not
  const { warnings: kinds } = readPicks(doc({ shelves: { 'a/leads': shelf(['p-v3', 'p-v1', 'p-v4']),
    'tv/machines': shelf(['m-gone']) } }), REG, { ...site, projects: new Map() });
  assert.deepEqual(kinds.map((w) => w.live), [false, true]);
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
  // a project shows only on its own section's shelf, as the picker offers it
  refuses(on('b/play', shelf(['j-reel'])), /"j-reel" in shelf b\/play is a project of the "watch" section, and this shelf shows the "play" section/);
  refuses(on('b/play', shelf(['p-v1'])), /"p-v1" in shelf b\/play is a post, and this shelf holds projects/);
  refuses(on('b/play', shelf(['j-game', 'j-game'])), /"j-game" is picked twice in shelf b\/play/);
  refuses(on('b/play', shelf(['x-game'])), /"x-game" in shelf b\/play is not a key/);
  refuses(on('tv/machines', shelf(['m-../x'])), /not a machine name/);
  refuses(on('b/play', shelf([], { auto: true })), /b\/play cannot fill itself/);
  refuses(on('b/play', shelf([], { count: 0 })), /b\/play: count is 0/);
  // the picker asks for at most 12, and a fraction is the tool's to round (fromPicker), never the repo file's
  refuses(on('a/leads', shelf([], { auto: true, count: 13 })), /a\/leads: count is 13, not a whole number from 1 to 12/);
  refuses(on('a/leads', shelf([], { auto: true, count: 2.5 })), /a\/leads: count is 2.5/);
  // a shelf holds auto, count and picks only: a note there would be published
  refuses(on('a/leads', { ...shelf([]), notes: 'private' }), /shelf a\/leads: "notes" is not a field of a shelf/);
  refuses(on('a/leads', { ...shelf([]), extra: 1 }), /shelf a\/leads: "extra" is not a field of a shelf/);
  refuses(on('a/leads/x', shelf([])), /shelf "a\/leads\/x" is not a shelf of chapter "a"/);
  refuses(doc({ hidden: Object.fromEntries(REG.map((c) => [c.id, true])) }), /every chapter is hidden/);
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
  assert.doesNotThrow(() => readPicks(saved, REG, { ...site, projects: new Map() }, { allowPrivate: true }));
  assert.throws(() => readPicks({ ...saved, extra: 1 }, REG, { ...site, projects: new Map() }, { allowPrivate: true }), /"extra"/);
  assert.throws(() => readPicks({ ...saved, shelves: { 'a/leads': { ...shelf([]), notes: 'x' } } }, REG, { ...site, projects: new Map() },
    { allowPrivate: true }), /"notes" is not a field of a shelf/);
});

test('fromPicker gives a count the picker keeps as a fraction the whole number of posts it shows, and nothing else', () => {
  const d = doc({ shelves: { 'a/leads': shelf([], { auto: true, count: 2.5 }), 'tv/episodes': shelf([], { auto: true, count: 3 }) } });
  assert.deepEqual(fromPicker(d).shelves, { 'a/leads': shelf([], { auto: true, count: 2 }), 'tv/episodes': shelf([], { auto: true, count: 3 }) });
  assert.equal(d.shelves['a/leads'].count, 2.5);
  for (const bad of [0.5, -1, '2', 13.5]) {
    const out = fromPicker(doc({ shelves: { 'a/leads': shelf([], { count: bad }) } }));
    assert.throws(() => run(out), /count is/, String(bad));
  }
});

test('the live notebook picked while it can not be shown is left out with a warning; any other such post fails', () => {
  const live = (data) => ({ ...site, posts: [...posts.filter((p) => p.id !== 'teardown-lab'), ...(data ? [post('teardown-lab', '2026-12-01', { id: 'AO-073', ...data })] : [])] });
  const d = doc({ shelves: { 'a/leads': shelf(['p-teardown-lab', 'p-v1']) } });
  for (const [name, s, why] of [['unlisted', live({ unlisted: true }), /is unlisted/], ['draft', live({ draft: true }), /is a draft/],
    ['gone', live(null), /is not a post/], ['unreadable', { ...live(null), unreadable: new Set(['teardown-lab']) }, /has no valid YAML/]]) {
    const { chapters, warnings } = readPicks(d, REG, { ...s, projects: new Map() });
    assert.deepEqual(chapters[1].shelves[0].keys, ['v1'], name);
    assert.deepEqual(warnings.map((w) => w.live), [true], name);
    assert.match(warnings[0].text, /"p-teardown-lab" is the live notebook/, name);
    assert.match(warnings[0].text, why, name);
  }
  // and the page, which hands every warning on
  const shown = [];
  const [, a] = resolveChapters(d, REG, { ...live({ unlisted: true }), warn: (w) => shown.push(w) });
  assert.deepEqual([keysOf(a), shown.length], [[['v1']], 1]);
  // an ordinary post whose frontmatter can't be read says so, rather than that its file is missing
  const broken = { ...site, posts: posts.filter((p) => p.id !== 'v1'), unreadable: new Set(['v1']), projects: new Map() };
  assert.throws(() => readPicks(d, REG, broken), /"p-v1" in shelf a\/leads is not a post the page can read: src\/content\/posts\/v1\.md has no valid YAML/);
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
  return { root, put, md };
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

test('npm run tea:picks rounds a fractional count down as the picker shows it, and says what each auto shelf shows', async (t) => {
  const { root, put } = seed(t);
  put('src/content/posts/older.md', '---\nid: "AO-602"\ntitle: "T"\nsummary: "s"\ndate: 2026-10-01\ntopic: "agents"\n---\n\nText.\n');
  put('saved.json', JSON.stringify({ ...saved, shelves: { ...saved.shelves, 'agents/leads': { auto: true, count: 2.7, picks: [] } } }));
  const r = await tool(root, path.join(root, 'saved.json'));
  assert.equal(r.code, 0, r.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'src/data/tea-picks.json'), 'utf8')).shelves['agents/leads'].count, 2);
  // the page's own order (src/lib/posts.js ledgerOrder), the live notebook included and warned about
  assert.match(r.stdout, /^auto {2}agents\/leads shows teardown-lab, shown$/m);
  assert.match(r.stdout, /^warn {2}shelf agents\/leads shows the live notebook "teardown-lab"/m);
});

test('npm run tea:picks with --root and no folder says so plainly', async () => {
  const r = await promisify(execFile)(process.execPath, [path.join(REPO, 'scripts/tools/tea-picks.mjs'), 'saved.json', '--root'])
    .then(() => ({ code: 0 }), (e) => ({ code: e.code, stderr: e.stderr }));
  assert.deepEqual(r, { code: 1, stderr: 'tea:picks: --root needs the folder of the repo to write into: --root <dir>\n' });
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
  const { root, put, md } = seed(t);
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
  // more picks than a shelf shows: a plain warning, which --strict fails
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-shown', 'p-teardown-lab', 'p-older', 'p-newer'] } } });
  put('src/content/posts/older.md', md('AO-602'));
  put('src/content/posts/newer.md', md('AO-603'));
  assert.deepEqual(ours(), [['tea-picks', 'warn', 'shelf start/leads shows at most 3 picks, so "p-newer" is left out'],
    ['tea-picks', 'warn', 'shelf start/leads shows the live notebook "teardown-lab" (src/data/exempt.js), which other sessions rewrite at any time']]);
  assert.deepEqual(runChecks({ root }).filter((i) => i.rule === 'tea-picks').map((i) => i.live ?? false), [false, true]);
  // a note inside a shelf is refused like one at the top
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: [], notes: 'private' } } });
  assert.deepEqual(ours(), [['tea-picks', 'error', 'shelf start/leads: "notes" is not a field of a shelf (auto, count, picks) (the page could not be built from it)']]);
  // a project on another section's shelf
  write({ v: 1, order: [], hidden: {}, shelves: { 'projects/watch': { auto: false, count: 1, picks: ['j-game'] } } });
  assert.match(ours()[0][2], /"j-game" in shelf projects\/watch is a project of the "play" section/);
  // the live notebook pinned while another session leaves its frontmatter broken, or makes it unlisted: left out, a
  // warning only, at every level (the frontmatter rule only warns about it as well)
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-teardown-lab', 'p-shown'] } } });
  for (const lab of ['---\nid: "AO-073\ntitle: [\n---\n', '---\nid: "AO-073"\ntitle: "Lab"\nsummary: "s"\ndate: 2026-12-01\nunlisted: true\n---\n']) {
    put('src/content/posts/teardown-lab.md', lab);
    for (const deploy of [false, true]) {
      const all = runChecks({ root, deploy }).filter((i) => i.file === 'src/data/tea-picks.json');
      assert.deepEqual(all.map((i) => [i.severity, i.live]), [['warn', true]], lab);
      assert.match(all[0].message, /"p-teardown-lab" is the live notebook .* so it is left out today/);
    }
  }
  // any other post whose frontmatter can't be read is named as such, and one with no id can't crash the checker
  put('src/content/posts/shown.md', '---\nid: "AO-600\n---\n');
  assert.match(ours().find(([rule]) => rule === 'tea-picks')[2], /"p-shown" in shelf start\/leads is not a post the page can read/);
  put('src/content/posts/shown.md', '---\ntitle: "T"\ndate: 2026-11-01\n---\n');
  put('src/content/posts/twin.md', '---\ntitle: "T"\ndate: 2026-11-01\n---\n');
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: true, count: 3, picks: [] } } });
  assert.doesNotThrow(() => runChecks({ root }));
  put('src/content/posts/teardown-lab.md', `---\nid: "AO-073"\ntitle: "Lab"\nsummary: "s"\ndate: 2026-12-01\n---\n`);
  put('src/data/tea-picks.json', '{ "v": 1,');
  assert.match(ours()[0][2], /isn't valid JSON/);
  // a never-publish term in the picks fails like one anywhere else
  put('src/data/never-publish.json', JSON.stringify([hash('Zorblax')]));
  write({ v: 1, order: [], hidden: {}, shelves: { 'start/leads': { auto: false, count: 1, picks: ['p-Zorblax'] } } });
  assert.ok(ours().some(([rule, severity]) => rule === 'never-publish' && severity === 'error'));
});
