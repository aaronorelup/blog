// GET /api/search (worker/search/serve.js) with stub bindings: the answer holds only chunks of docs this deploy's
// /search/manifest.json lists, so a post a deploy has just unlisted (its vectors still in the index, an answer with
// it still in the cache) is in no answer; each hit is citable alone (AO id, title, page); the guards answer bare statuses.
import test from 'node:test';
import assert from 'node:assert/strict';
import { d1, loadWorker } from './worker-env.mjs';

const { serve } = await loadWorker('search/serve.js');

const store = new Map();   // the edge cache: url -> the JSON text put there
globalThis.caches = { default: {
  match: async (request) => (store.has(request.url) ? new Response(store.get(request.url)) : undefined),
  put: async (request, response) => { store.set(request.url, await response.text()); },
} };

const chunk = (id, s, k, score, a = 'top') => ({ id, score, metadata: { s, k, a, h: 'Heading', t: `text of ${s}`, T: `Title of ${s}`, v: 'claude' } });
const MATCHES = [chunk('AO-009:1', 'gone-post', 'post', 0.9), chunk('AO-001:0', 'kept-post', 'post', 0.8), chunk('AO-009n:2', 'gone-post', 'notes', 0.7),
  chunk('AO-001n:2', 'kept-post', 'notes', 0.6), chunk('AO-002:0', 'top-post', 'post', 0.5, '')];
const manifest = { v: 'v2', model: '@cf/test/embed', live: [], docs: { 'post:kept-post': 'h1', 'notes:kept-post': 'h2', 'post:top-post': 'h3' } };
const SITE = 'https://aaronorelup.com';
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
  assert.deepEqual(fresh.body.hits.map((h) => `${h.kind}:${h.slug}`), ['post:kept-post', 'notes:kept-post', 'post:top-post']);
  assert.deepEqual(Object.keys(fresh.body.hits[0]), ['id', 'title', 'url', 'slug', 'kind', 'anchor', 'heading', 'text', 'score']);
  assert.equal(embedded, 1);
  assert.ok(![...store.values()].join().includes('gone-post'), 'nor is it put in the cache');

  // An answer cached before the deploy that unlisted the post, under the v the index still has.
  const [url] = store.keys();
  assert.ok(url.startsWith('https://cache.internal/search?s=2&'), 'the key names the answer\'s shape');
  const old = { v: '', hits: MATCHES.map(({ id, score, metadata: m }) => ({
    id: id.split(':')[0].replace(/n$/, ''), title: m.T, url: `${SITE}/ledger/${m.s}/${m.k === 'notes' ? 'notes/' : ''}${m.a ? `#${m.a}` : ''}`,
    slug: m.s, kind: m.k, anchor: m.a, heading: m.h, text: m.t, score })) };
  store.set(url, JSON.stringify(old));
  const again = await search('where did the post go');
  assert.equal(again.status, 200);
  assert.deepEqual(again.body.hits.map((h) => `${h.kind}:${h.slug}`), ['post:kept-post', 'notes:kept-post', 'post:top-post']);
  assert.equal(again.body.v, '');
  assert.equal(embedded, 1, 'a cached answer costs no embedding');
});

test('a hit carries its AO id, title and page to cite, and never the voice or the vector id', async () => {
  const { body } = await search('which post says so');
  const [post, notes, top] = body.hits;
  assert.deepEqual([post.id, post.title, post.url], ['AO-001', 'Title of kept-post', `${SITE}/ledger/kept-post/#top`]);
  assert.deepEqual([notes.id, notes.url], ['AO-001', `${SITE}/ledger/kept-post/notes/#top`]);
  assert.deepEqual([top.id, top.url], ['AO-002', `${SITE}/ledger/top-post/`]);
  for (const h of body.hits) assert.ok(!('voice' in h) && !('vid' in h), JSON.stringify(h));
});

test('the guards: a short or long query is 400, a limited one 429', async () => {
  const before = embedded;
  assert.equal((await search('hi')).status, 400);
  assert.equal((await search('x'.repeat(201))).status, 400);
  env.one = false;
  assert.equal((await search('a limited question')).status, 429);
  env.one = true;
  assert.equal(embedded, before, 'a refused query costs no embedding');
});
