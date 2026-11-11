// What search, Ask and read-aloud are built from (src/lib/search/docs.js, src/lib/ask/docs.js and build.js, and the
// pages under src/pages/search/, ask/ and read/), run as they are over made-up collections: a draft or an unlisted
// post never enters a search doc, the search manifest, an Ask doc, an Ask file, the Ask manifest or the read-aloud
// index, and neither do its notes. Every string of the draft and the unlisted post carries one word, looked for in
// everything that is built. A live notebook is in search and Ask, marked live, and is never recorded.
import assert from 'node:assert/strict';
import test from 'node:test';
import { setCollections } from './astro-content.mjs';
import { TOPICS } from '../../src/data/taxonomy.js';

const HIDDEN = 'secret-unlisted-post';
const MARK = 'NEVERSHOWN';
const [topic] = Object.keys(TOPICS);
const extraction = (name, mark = '') => {
  const sections = [{ anchor: '', heading: '', text: `Opening of ${name}.${mark}` }, { anchor: 'how', heading: `How ${name} works${mark}`, text: `The method of ${name}.${mark}` }];
  return { words: 120, sections, full: sections, headings: [{ depth: 2, text: `How ${name} works${mark}` }],
    read: { blocks: [['p', `Opening of ${name}.${mark}`], ['h', `How ${name} works${mark}`], ['p', `The method of ${name}.${mark}`]] } };
};
const post = (slug, id, more = {}, mark = '') => ({ id: slug, text: extraction(slug, mark),
  data: { id, title: `Title of ${slug}${mark}`, summary: `Summary of ${slug}.${mark}`, date: new Date('2026-11-01T00:00:00Z'), topic, project: [], ...more } });
const notes = (slug, mark = '') => ({ id: slug, text: extraction(`the notes on ${slug}`, mark),
  data: { post: slug, title: `Notes on ${slug}${mark}`, summary: `Summary of the notes on ${slug}.${mark}` } });
const card = (mark = '') => ({ verdict: `It works${mark}`, takeaway: `It ran.${mark}`, points: [`One.${mark}`] });

setCollections({
  posts: [post('shown', 'AO-002', { preview: card() }), post('first', 'AO-001', { voice: 'claude' }), post('teardown-lab', 'AO-073'),
    post('a-draft', 'AO-003', { draft: true, preview: card(MARK) }, MARK), post(HIDDEN, 'AO-004', { unlisted: true, preview: card(MARK) }, MARK)],
  notes: [notes('shown'), notes(HIDDEN, MARK)],
});
const { searchDocs } = await import('../../src/lib/search/docs.js');
const searchManifest = await import('../../src/pages/search/manifest.json.js');
const searchDoc = await import('../../src/pages/search/docs/[doc].json.js');
const { askDocs } = await import('../../src/lib/ask/docs.js');
const { askBuild } = await import('../../src/lib/ask/build.js');
const askManifest = await import('../../src/pages/ask/manifest.json.js');
const askFile = await import('../../src/pages/ask/[file].txt.js');
const readIndex = await import('../../src/pages/read/index.json.js');
const readPost = await import('../../src/pages/read/[slug].json.js');

const plain = (value) => JSON.parse(JSON.stringify(value));
const clean = (text, what) => {
  for (const secret of [MARK, HIDDEN, 'a-draft']) assert.ok(!text.includes(secret), `${what} holds ${secret}`);
};

test('search docs: each listed post, then its notes, and nothing of a draft or an unlisted post', async () => {
  const docs = await searchDocs();
  assert.deepEqual(docs.map((d) => [d.id, d.kind, d.slug]), [['AO-001', 'post', 'first'], ['AO-002', 'post', 'shown'], ['AO-002n', 'notes', 'shown'],
    ['AO-073', 'post', 'teardown-lab']]);
  assert.deepEqual(plain(docs[1]), { id: 'AO-002', kind: 'post', slug: 'shown', title: 'Title of shown', chunks: [
    { n: 0, anchor: 'short', heading: 'The short version', text: 'Summary of shown.\n\nIt works\n\nIt ran.\n\nOne.' },
    { n: 1, anchor: '', heading: '', text: 'Opening of shown.' },
    { n: 2, anchor: 'how', heading: 'How shown works', text: 'The method of shown.' },
  ] });
  assert.deepEqual(plain(docs[2]), { id: 'AO-002n', kind: 'notes', slug: 'shown', title: 'Notes on shown', chunks: [
    { n: 0, anchor: '', heading: '', text: 'Summary of the notes on shown.' },
    { n: 1, anchor: '', heading: '', text: 'Opening of the notes on shown.' },
    { n: 2, anchor: 'how', heading: 'How the notes on shown works', text: 'The method of the notes on shown.' },
  ] });
  assert.equal(docs[0].voice, 'claude');
  assert.equal(docs[0].chunks[0].text, 'Summary of first.');
  clean(JSON.stringify(docs), 'a search doc');
});

test('the search manifest and the doc files name the same docs, a live notebook apart', async () => {
  const manifest = await (await searchManifest.GET()).json();
  assert.deepEqual(Object.keys(manifest.docs), ['post:first', 'post:shown', 'notes:shown', 'post:teardown-lab']);
  assert.deepEqual(manifest.live, ['post:teardown-lab']);
  const paths = await searchDoc.getStaticPaths();
  assert.deepEqual(paths.map((p) => p.params.doc), ['post-first', 'post-shown', 'notes-shown', 'post-teardown-lab']);
  const served = await Promise.all(paths.map((p) => searchDoc.GET(p).text()));
  assert.deepEqual(JSON.parse(served[1]), plain((await searchDocs())[1]));
  clean(JSON.stringify(manifest) + JSON.stringify(paths.map((p) => p.params)) + served.join(''), 'search');
});

test('Ask docs: the listed posts in AO order, each with its notes, and nothing of a draft or an unlisted post', async () => {
  const docs = await askDocs();
  assert.deepEqual(docs.map((d) => [d.n, d.slug, d.url, d.by, d.live, d.notes?.url ?? null]), [[1, 'first', '/ledger/first/', 'Claude', false, null],
    [2, 'shown', '/ledger/shown/', 'Aaron', false, '/ledger/shown/notes/'], [73, 'teardown-lab', '/ledger/teardown-lab/', 'Aaron', true, null]]);
  assert.equal(docs[1].takeaway, 'It ran.');
  assert.equal(docs[1].short.text, 'Summary of shown.\n\nIt works\n\nIt ran.\n\nOne.');
  assert.deepEqual(docs[1].sections.map((s) => s.text), ['Opening of shown.', 'The method of shown.']);
  assert.deepEqual(docs[1].notes.sections.map((s) => s.text), ['Opening of the notes on shown.', 'The method of the notes on shown.']);
  clean(JSON.stringify(docs), 'an Ask doc');
});

test('the Ask files and manifest hold the listed posts and their notes, and nothing else', async () => {
  const { files, manifest } = await askBuild();
  assert.deepEqual(Object.keys(manifest.docs), ['1', '2', '73']);
  assert.deepEqual([manifest.counts.posts, manifest.counts.notes, manifest.counts.claude], [3, 1, 1]);
  assert.deepEqual(Object.keys(manifest.live), ['73']);
  const everything = [...files.keys(), ...files.values()].join('\n');
  for (const said of ['Opening of shown.', 'The method of the notes on shown.', 'Opening of first.', 'Opening of teardown-lab.']) assert.ok(everything.includes(said), said);
  clean(everything + JSON.stringify(manifest), 'Ask');

  const paths = await askFile.getStaticPaths();
  assert.deepEqual(paths.map((p) => `${p.params.file}.txt`).sort(), [...files.keys()].sort());
  assert.equal(await askFile.GET(paths[0]).text(), files.get(`${paths[0].params.file}.txt`));
  assert.deepEqual(await (await askManifest.GET()).json(), plain(manifest));
});

test('read-aloud: a recording for each listed post, never a draft, an unlisted post or a live notebook', async () => {
  const index = await (await readIndex.GET()).json();
  assert.deepEqual(Object.keys(index.posts).sort(), ['first', 'shown']);
  const paths = await readPost.getStaticPaths();
  assert.deepEqual(paths.map((p) => p.params.slug), ['first', 'shown']);
  const shown = await (await readPost.GET(paths[1])).json();
  assert.equal(shown.slug, 'shown');
  assert.equal(shown.hash, index.posts.shown.hash);
  assert.match(JSON.stringify(shown.sections), /Opening of shown\./);
  clean(JSON.stringify(index) + JSON.stringify(paths.map((p) => p.params)), 'read-aloud');
});
