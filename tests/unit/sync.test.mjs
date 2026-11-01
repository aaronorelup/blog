// worker/search/sync.js on an in-memory D1 and a fake index: the first sync embeds 10 docs a run and stores v only
// once nothing is left; a removed doc (an unlisted post) loses its vectors and its row, a shorter doc its last ids,
// in deletes of at most 100 ids; a live notebook goes last; then each run is idle until its hash moves.
import test from 'node:test';
import assert from 'node:assert/strict';
import { d1, loadWorker } from './worker-env.mjs';

const { step } = await loadWorker('search/sync.js');
const MODEL = '@cf/baai/bge-m3';
const doc = (i, chunks) => ({ id: `AO-${100 + i}`, kind: 'post', slug: `p${i}`, title: `T${i}`,
  chunks: Array.from({ length: chunks }, (_, n) => ({ n, anchor: 'a', heading: n ? 'H' : '', text: `text ${n}` })) });
const docs = [{ ...doc(11, 1), slug: 'teardown-lab' }, ...Array.from({ length: 11 }, (_, i) => doc(i, 2))];
const manifest = { v: 'v2', model: MODEL, live: ['post:teardown-lab'],
  docs: Object.fromEntries(docs.map((d) => [`post:${d.slug}`, `h${d.id}`])) };
const files = new Map([['/search/manifest.json', manifest], ...docs.map((d) => [`/search/docs/post-${d.slug}.json`, d])]);

test('a full sync, a removed and a shortened doc, then idle until the live notebook moves', async () => {
  const vectors = new Map();
  const env = {
    DB: d1(),
    ASSETS: { fetch: async (r) => Response.json(files.get(new URL(r.url).pathname)) },
    AI: { run: async (model, { text }) => {
      assert.equal(model, MODEL);
      assert.ok(text.length <= 50);
      return { data: text.map(() => [0.5]) };
    } },
    SEARCH_INDEX: {
      upsert: async (list) => { assert.ok(list.length <= 50); list.forEach((v) => vectors.set(v.id, v)); },
      deleteByIds: async (ids) => { assert.ok(ids.length <= 100); ids.forEach((id) => vectors.delete(id)); },
    },
  };
  const { DB } = env;
  const v = () => DB.prepare("SELECT v FROM search_state WHERE k = 'v'").first('v');
  assert.equal(await step(env), '10 embedded, 0 removed, 2 left'); // nothing indexed yet: 10 docs a run
  assert.equal(await v(), null);
  assert.ok(!vectors.has('AO-111:0'), 'the live notebook waits for the other docs');
  // As a previous deploy left them: a post since unlisted (150 chunks), and p0 when it had 5 chunks.
  for (let n = 0; n < 150; n++) vectors.set(`AO-099:${n}`, {});
  for (const n of [2, 3, 4]) vectors.set(`AO-100:${n}`, {});
  await DB.prepare("INSERT INTO search_docs VALUES ('post:gone', 'AO-099', 'old', 150)").run();
  await DB.prepare("UPDATE search_docs SET hash = 'old', n = 5 WHERE doc = 'post:p0'").run();

  assert.equal(await step(env), '3 embedded, 1 removed, 0 left');
  const rows = (await DB.prepare('SELECT doc, id, hash, n FROM search_docs ORDER BY doc').all()).results;
  assert.deepEqual(rows.map((r) => r.doc), Object.keys(manifest.docs).sort());
  assert.equal(vectors.size, docs.reduce((n, d) => n + d.chunks.length, 0));
  assert.deepEqual(vectors.get('AO-111:0').metadata, { s: 'teardown-lab', k: 'post', a: 'a', h: '', t: 'text 0', T: 'T11' });
  assert.equal(await v(), 'v2');
  assert.equal(await step(env), 'idle');

  await DB.prepare("UPDATE search_docs SET hash = 'pushed' WHERE doc = 'post:teardown-lab'").run();
  assert.equal(await step(env), '1 embedded, 0 removed, 0 left');
  assert.equal(await step(env), 'idle');
});
