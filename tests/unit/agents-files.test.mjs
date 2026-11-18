// The agent layer (src/lib/agent-text.js and its pages): /llms.txt, /llms-full.txt, /ledger/<slug>.md and
// /ledger/<slug>/notes.md, run as they are over made-up collections. Listed posts only, in ledger order; a draft, an
// unlisted post and its notes appear in none of them; the live notebook gets no twin and only its summary in the
// corpus; comments are stripped and root-relative links made absolute; the courses, Now, About and projects sections
// name only published lessons and listed posts. astro-content.mjs stands in for astro:content.
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { setCollections } from './astro-content.mjs';
import { TOPICS } from '../../src/data/taxonomy.js';
import { LIVE_NOTEBOOKS } from '../../src/data/exempt.js';
import { agentNoteProblems } from '../../scripts/build/contracts.mjs';

const HIDDEN = 'secret-unlisted-post';
const [topic] = Object.keys(TOPICS);
const [[liveId, { slug: LIVE }]] = Object.entries(LIVE_NOTEBOOKS);
const card = { verdict: 'It works', takeaway: 'It ran.', points: ['One.'] };
const post = (slug, id, day, more = {}) => ({ id: slug, body: `Body of ${slug}.\n`,
  data: { id, title: `Title of ${slug}`, summary: `Summary of ${slug}`, date: new Date(`${day}T00:00:00Z`), topic, project: [], preview: card, ...more } });
const notes = (slug) => ({ id: slug, body: `Notes body of ${slug}.`, data: { post: slug, title: `Notes on ${slug}`, summary: `Notes summary of ${slug}` } });
setCollections({
  posts: [post('shown', 'AO-001', '2026-10-01', { voice: 'claude' }),
    { ...post('newer', 'AO-003', '2026-11-01'), body: '<!-- a private remark -->\nSee [the old one](/ledger/shown/) and <ao-x src="/media/a.webp" poster="/media/b.webp">x</ao-x>, not [far](//cdn.example/x) or [abs](https://x.example/y).\n' },
    post('a-draft', 'AO-004', '2026-11-02', { draft: true }),
    post(HIDDEN, 'AO-005', '2026-11-03', { unlisted: true, preview: { ...card, takeaway: 'Nobody may read this.' } }),
    { ...post(LIVE, liveId, '2026-10-15'), body: 'The live notebook body, which is not ours.' }],
  notes: [notes('shown'), notes(HIDDEN)],
  research: [{ id: 'a-paper', data: { title: 'A paper', summary: 'About a paper.' } }],
});
const SITE = 'https://aaronorelup.com';
globalThis.__PUBLIC_DIR__ ??= path.resolve('public') + path.sep;   // astro.config.mjs defines it for the build
const twin = await import('../../src/pages/ledger/[slug].md.js');
const notesTwin = await import('../../src/pages/ledger/[slug]/notes.md.js');
const llms = await import('../../src/pages/llms.txt.js');
const full = await import('../../src/pages/llms-full.txt.js');
const agentText = await import('../../src/lib/agent-text.js');
const { absolutize, agentNote, stripComments } = agentText;
const text = async (r) => [r.headers.get('Content-Type'), await r.text()];
const secret = (s) => s.includes(HIDDEN) || s.includes('a-draft') || s.includes('Nobody may read this') || s.includes('AO-005');

test('the twin routes: listed posts that are no live notebook, and the notes beside them, nothing else', async () => {
  assert.deepEqual((await twin.getStaticPaths()).map((p) => p.params.slug), ['newer', 'shown']);
  assert.deepEqual((await notesTwin.getStaticPaths()).map((p) => p.params.slug), ['shown']);
});

test("a post's twin: canonical, title, its line, summary, card, then the body cleaned", async () => {
  const [{ props }] = (await twin.getStaticPaths()).filter((p) => p.params.slug === 'newer');
  const [type, md] = await text(twin.GET({ props }));
  assert.equal(type, 'text/markdown; charset=utf-8');
  assert.ok(md.startsWith(`<!-- Canonical: ${SITE}/ledger/newer/ -->\n\n# Title of newer\n\nAO-003 · 2026-11-01 · ${TOPICS[topic].label} · by Aaron\n\n> Summary of newer\n\n**It works.** It ran.\n- One.\n\n`));
  assert.ok(!md.includes('a private remark'));
  assert.ok(md.includes(`[the old one](${SITE}/ledger/shown/)`) && md.includes(`src="${SITE}/media/a.webp" poster="${SITE}/media/b.webp"`));
  assert.ok(md.includes('(//cdn.example/x)') && md.includes('(https://x.example/y)'));
  const [{ props: shown }] = await notesTwin.getStaticPaths();
  const [, notesMd] = await text(notesTwin.GET({ props: shown }));
  assert.ok(notesMd.startsWith(`<!-- Canonical: ${SITE}/ledger/shown/notes/ -->\n\n# Notes on shown\n\nAO-001 notes · 2026-10-01 · by Aaron`));
  assert.ok(notesMd.includes('Notes body of shown.'));
});

test('llms.txt: the listed posts in ledger order by their twins, the live notebook by its page, no draft or unlisted', async () => {
  const [type, txt] = await text(await llms.GET());
  assert.equal(type, 'text/plain; charset=utf-8');
  const posts = [...txt.matchAll(/^- \[(AO-\d+)[^\]]*\]\(([^)]*)\)/gm)].map((m) => [m[1], m[2]]);
  assert.deepEqual(posts, [['AO-003', `${SITE}/ledger/newer.md`], [liveId, `${SITE}/ledger/${LIVE}/`], ['AO-001', `${SITE}/ledger/shown.md`]]);
  assert.ok(txt.includes(`(${SITE}/ledger/shown/notes.md)`) && txt.includes(`(${SITE}/research/a-paper.md)`));
  assert.ok(txt.includes('429 past 600 a minute, or 20 a minute for one query') && txt.includes('No token.'));
  assert.ok(!secret(txt));
  const corpus = await (await full.GET()).text();
  assert.ok(txt.includes(`(${SITE}/llms-full.txt): every post and notes twin above, ledger order; ${agentText.sizeOf(Buffer.byteLength(corpus))}, about `));
  for (const h of ['## Courses', '## Now', '## About', '## Projects']) assert.ok(txt.includes(`\n${h}\n`), h);
});

test('llms-full.txt: every twin, notes after their post, the live notebook by its summary only', async () => {
  const [type, txt] = await text(await full.GET());
  assert.equal(type, 'text/plain; charset=utf-8');
  assert.ok(!secret(txt) && !txt.includes('Notes summary of ' + HIDDEN));
  assert.ok(txt.includes(`Summary of ${LIVE}`) && !txt.includes('The live notebook body'));
  const at = (s) => txt.indexOf(s);
  assert.ok(at('# Title of newer') < at(`# Title of ${LIVE}`) && at(`# Title of ${LIVE}`) < at('# Title of shown')
    && at('# Title of shown') < at('# Notes on shown'));
  assert.ok(txt.includes('· by Claude'));
});

test('a verdict that ends its own sentence gets no second stop', () => {
  const { postTwin } = agentText;
  assert.ok(postTwin(post('q', 'AO-009', '2026-10-01'), { verdict: 'Worth it?', takeaway: 'Yes.', points: [] }).includes('**Worth it?** Yes.\n\n'));
});

test('stripComments and absolutize', () => {
  assert.equal(stripComments('a\n<!-- x\ny -->\nb <!-- z --> c'), 'a\nb c');
  assert.equal(absolutize('[a](/x) ![b](/y.png) href="/z" src=\'/w\' [c](#d) [e](//f) [g](https://h/i)'),
    `[a](${SITE}/x) ![b](${SITE}/y.png) href="${SITE}/z" src='${SITE}/w' [c](#d) [e](//f) [g](https://h/i)`);
});

test('the note for agents: its twin and the newest when given, and it names no path the build lacks', () => {
  const p = post('shown', 'AO-001', '2026-10-01');
  const note = agentNote({ md: '/ledger/shown.md', newest: [p], extra: ['GET /api/stats returns a JSON snapshot.'] });
  // a crude tag-stripper (re.sub('<[^>]+>', '')) must never end the HTML-comment copy early, nor '--' close it
  for (const t of [note, agentNote()]) assert.ok(!/[<>]|--/.test(t), t);
  assert.ok(note.includes('/ledger/shown.md (this page, md)') && note.includes('AO-001 /ledger/shown/ 2026-10-01') && note.includes('/api/stats'));
  assert.ok(!agentNote().includes('this page') && !agentNote().includes('Newest'));
  const html = (t) => `<body><div class="ao-agent" aria-hidden="true" data-nosnippet>${t.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div></body>`;
  const built = new Set(['/llms.txt', '/llms-full.txt', '/ledger/shown.md', '/ledger/previews.json', '/rss.xml', '/sitemap.xml', '/ledger/shown/']);
  assert.deepEqual(agentNoteProblems(html(note), '/x/', (q) => built.has(q)), []);
  built.delete('/ledger/shown.md');
  assert.deepEqual(agentNoteProblems(html(note), '/x/', (q) => built.has(q)), ['/x/: its note for agents names /ledger/shown.md, which is not built']);
  assert.deepEqual(agentNoteProblems('<body></body>', '/x/', () => false), []);
});

// The sections past the ledger, over made-up courses and projects (pages/llms.txt.js shapes the real ones).
const n = (out, lessons, legacy) => ({ out, lessons, legacy });
const course = { code: 'C-09', title: 'A course', tagline: 'What it teaches', href: '/courses/a-course/', counts: n(1, 5, 1), minutes: '12 min',
  lessons: [{ id: '00.01', title: 'An old one', loc: '/courses/a-course/lessons/old/', duration: '5:15', legacy: true, text: 'Old. '.repeat(60) },
    { id: '00.02', title: 'A new one', loc: '/courses/a-course/lessons/new/', duration: '6:40', legacy: false, text: 'It is new.' }] };
const projects = [{ name: 'A game', line: 'Play it.', href: '/games/a/', chip: 'Finished · Oct 2026' },
  { name: 'A post', line: 'Read it.', href: '/ledger/shown/' }, { name: 'A hidden one', line: 'Shh.', href: `/ledger/${HIDDEN}/` },
  { name: 'A reel', line: 'Watch it.', href: '#proj-reel' }, { name: 'A zip', line: 'Get it.', href: '/media/a/a.zip' },
  { name: 'Elsewhere', line: 'Over there.', href: 'https://github.com/x/y' }];
const sections = (more) => agentText.llmsTxt({ posts: [post('shown', 'AO-001', '2026-10-01'), post(HIDDEN, 'AO-005', '2026-11-03', { unlisted: true })],
  notes: new Map(), research: [], cardOf: () => ({}), ...more });

test('llms.txt courses: each course with its counts, then its published lessons, the legacy ones marked', () => {
  const txt = sections({ courses: [course, { ...course, code: 'C-10', title: 'Done', href: '/courses/done/', counts: n(3, 3, 0), lessons: [] }] });
  assert.ok(txt.includes(`- [A course](${SITE}/courses/a-course/): C-09. What it teaches. 1 of 5 new lessons out, 1 legacy (made before the 2026-10-12 rebuild), 12 min to watch.`));
  assert.ok(txt.includes(`- [Done](${SITE}/courses/done/): C-10. What it teaches. 3 of 3 lessons out, 12 min to watch.`));
  assert.ok(txt.includes(`  - [00.02 A new one](${SITE}/courses/a-course/lessons/new/): 6:40. It is new.`));
  const old = txt.split('\n').find((l) => l.includes('00.01 An old one'));
  assert.ok(old.startsWith(`  - [00.01 An old one](${SITE}/courses/a-course/lessons/old/): 5:15, legacy. Old.`) && old.length < 250 && old.endsWith('Old.'), old);
  assert.equal(agentText.clip(`Short. ${'word '.repeat(40)}`, 60), `Short. ${'word '.repeat(10).trim()}…`, 'a first sentence too short is not all it keeps');
  assert.ok(txt.indexOf('## Research') < txt.indexOf('## Courses') && txt.indexOf('## Projects') < txt.indexOf('## Machine endpoints'));
});

test('llms.txt courses: a locked lesson, or a published one whose page is not built, is never named', async () => {
  const { publishedLessons } = await import('../../src/lib/sitemap.js');
  const lesson = (id, status, url) => ({ id, title: `Lesson ${id}`, status, url });
  const built = '/courses/the-hidden-curriculum/lessons/where-your-agent-works/';   // a page under public/
  const data = { 'the-hidden-curriculum': { modules: [{ n: '00', lessons: [lesson('a', 'locked', built),
    lesson('b', 'published', '/courses/the-hidden-curriculum/lessons/not-a-built-page/'), lesson('c', 'published', `${built}?t=1`)] }] } };
  assert.deepEqual(publishedLessons(data).map(({ slug, lesson: l, loc }) => [slug, l.id, loc]), [['the-hidden-curriculum', 'c', built]]);
});

test('llms.txt now, about and projects: an unlisted or hidden link falls back to /projects/, no email', () => {
  const txt = sections({ now: { date: '2026-11-08', summary: 'Busy.' }, projects,
    about: { description: 'I build things.', social: [{ label: 'GitHub', href: 'https://github.com/aaronorelup' }] } });
  assert.ok(txt.includes(`- [Now](${SITE}/now/): what Aaron is working on, updated 2026-11-08. Busy.`));
  assert.ok(txt.includes(`- [About](${SITE}/about/): who Aaron is. In his words: "I build things." Contact: his email`));
  assert.ok(txt.includes('- Profiles: [GitHub](https://github.com/aaronorelup)') && !txt.includes('@'));
  const link = (name) => txt.match(new RegExp(`^- \\[${name}\\]\\(([^)]*)\\)`, 'm'))[1];
  assert.equal(link('A game'), `${SITE}/games/a/`);
  assert.equal(link('A post'), `${SITE}/ledger/shown/`);
  for (const p of ['A hidden one', 'A reel', 'A zip']) assert.equal(link(p), `${SITE}/projects/`, p);
  assert.equal(link('Elsewhere'), 'https://github.com/x/y');
  assert.ok(txt.includes(`(${SITE}/games/a/): Play it. (Finished · Oct 2026)\n`) && txt.includes(`(${SITE}/ledger/shown/): Read it.\n`) && !txt.includes(HIDDEN));
});

test('the defaults: no courses, now, projects or size, and the old lines stand', () => {
  const txt = sections({});
  assert.ok(txt.includes(`- [Courses](${SITE}/courses/)`) && txt.includes(`- [Now](${SITE}/now/): what Aaron is working on.`));
  assert.ok(txt.endsWith(`- [Everything in one file](${SITE}/llms-full.txt): every post and notes twin above, ledger order\n`));
  assert.ok(sections({ fullBytes: 1612567 }).includes('ledger order; 1.6 MB, about 400k tokens. Try /api/search'));
});

test("the note for agents gives /llms-full.txt's size, with no '/' a contract would read as a path", () => {
  const note = agentNote({ full: agentText.sizeOf(1612567) });
  assert.ok(note.includes('/llms-full.txt (corpus, md, ~1.6 MB)'));
  const html = `<body><div class="ao-agent" aria-hidden="true" data-nosnippet>${note.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div></body>`;
  const built = new Set(['/llms.txt', '/llms-full.txt', '/ledger/previews.json', '/rss.xml', '/sitemap.xml']);
  assert.deepEqual(agentNoteProblems(html, '/x/', (q) => built.has(q)), []);
});
