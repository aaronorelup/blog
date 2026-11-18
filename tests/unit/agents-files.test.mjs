// The agent layer (src/lib/agent-text.js and its pages): /llms.txt, /llms-full.txt, /ledger/<slug>.md and
// /ledger/<slug>/notes.md, run as they are over made-up collections. Listed posts only, in ledger order; a draft, an
// unlisted post and its notes appear in none of them; the live notebook gets no twin and only its summary in the
// corpus; comments are stripped and root-relative links made absolute. astro-content.mjs stands in for astro:content.
import assert from 'node:assert/strict';
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
  const note = agentNote({ md: '/ledger/shown.md', newest: [p], extra: ['GET /api/stats -> JSON snapshot.'] });
  assert.ok(note.includes('/ledger/shown.md (this page, md)') && note.includes('AO-001 /ledger/shown/ 2026-10-01') && note.includes('/api/stats'));
  assert.ok(!agentNote().includes('this page') && !agentNote().includes('Newest'));
  const html = (t) => `<body><div class="ao-agent" aria-hidden="true">${t.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</div></body>`;
  const built = new Set(['/llms.txt', '/llms-full.txt', '/ledger/shown.md', '/ledger/previews.json', '/rss.xml', '/sitemap.xml', '/ledger/shown/']);
  assert.deepEqual(agentNoteProblems(html(note), '/x/', (q) => built.has(q)), []);
  built.delete('/ledger/shown.md');
  assert.deepEqual(agentNoteProblems(html(note), '/x/', (q) => built.has(q)), ['/x/: its note for agents names /ledger/shown.md, which is not built']);
  assert.deepEqual(agentNoteProblems('<body></body>', '/x/', () => false), []);
});
