// GET /api/search (worker/search/serve.js) with stub bindings: the answer holds only chunks of docs this deploy's
// /search/manifest.json lists, so a post a deploy has just unlisted (its vectors still in the index, an answer with
// it still in the cache) is in no answer; and the guards answer bare statuses.
import test from 'node:test';
import assert from 'node:assert/strict';
import { d1, loadWorker } from './worker-env.mjs';

const { serve } = await loadWorker('search/serve.js');

const store = new Map();   // the edge cache: url -> the JSON text put there
globalThis.caches = { default: {
  match: async (request) => (store.has(request.url) ? new Response(store.get(request.url)) : undefined),
  put: async (request, response) => { store.set(request.url, await response.text()); },
} };

const chunk = (s, k, score) => ({ score, metadata: { s, k, a: 'top', h: 'Heading', t: `text of ${s}`, T: `Title of ${s}` } });
const MATCHES = [chunk('gone-post', 'post', 0.9), chunk('kept-post', 'post', 0.8), chunk('gone-post', 'notes', 0.7), chunk('kept-post', 'notes', 0.6)];
const manifest = { v: 'v2', model: '@cf/test/embed', live: [], docs: { 'post:kept-post': 'h1', 'notes:kept-post': 'h2' } };
let embedded = 0;
const env = {
  DB: d1(),
  ASSETS: { fetch: async () => Response.json(manifest) },
  AI: { run: async () => { embedded++; return { data: [[0.1, 0.2]] }; } },
  SEARCH_INDEX: { query: async () => ({ matches: MATCHES }) },
  SEARCH_ALL: { limit: async () => ({ success: true }) },
  SEARCH_Q: { limit: async () => ({ success: env.one !== false }) },
};
async function search(q) {
  const waits = [];
  const res = await serve(new Request(`https://aaronorelup.com/api/search?q=${encodeURIComponent(q)}`), env, { waitUntil: (p) => waits.push(p) });
  await Promise.all(waits);
  return { status: res.status, body: res.status === 200 ? await res.json() : null };
}

test('an answer holds only chunks of docs the deploy lists, a fresh one and a cached one alike', async () => {
  const fresh = await search('where did the post go');
  assert.equal(fresh.status, 200);
  assert.deepEqual(fresh.body.hits.map((h) => `${h.kind}:${h.slug}`), ['post:kept-post', 'notes:kept-post']);
  assert.deepEqual(Object.keys(fresh.body.hits[0]).sort(), ['anchor', 'heading', 'kind', 'score', 'slug', 'text']);
  assert.equal(embedded, 1);
  assert.ok(![...store.values()].join().includes('gone-post'), 'nor is it put in the cache');

  // An answer cached before the deploy that unlisted the post, under the v the index still has.
  const [url] = store.keys();
  const old = { v: '', hits: MATCHES.map(({ score, metadata: m }) => ({ slug: m.s, kind: m.k, anchor: m.a, heading: m.h, text: m.t, score })) };
  store.set(url, JSON.stringify(old));
  const again = await search('where did the post go');
  assert.equal(again.status, 200);
  assert.deepEqual(again.body.hits.map((h) => `${h.kind}:${h.slug}`), ['post:kept-post', 'notes:kept-post']);
  assert.equal(again.body.v, '');
  assert.equal(embedded, 1, 'a cached answer costs no embedding');
});

test('the guards: a short or long query is 400, a limited one 429', async () => {
  assert.equal((await search('hi')).status, 400);
  assert.equal((await search('x'.repeat(201))).status, 400);
  env.one = false;
  assert.equal((await search('a limited question')).status, 429);
  env.one = true;
  assert.equal(embedded, 1);
});
