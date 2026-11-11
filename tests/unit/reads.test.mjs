// /api/reads (worker/reads/serve.js) with stub bindings: the counts are a listed post's only. A post that was counted
// and then unlisted answers GET and POST exactly as a slug that never existed (same status, headers and body), before
// the limiter or D1 is touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import { d1, loadWorker } from './worker-env.mjs';

const { count, counts } = await loadWorker('reads/serve.js');

const db = d1();
let queries = 0;
const limited = [];
const env = {
  DB: { prepare: (sql) => { queries++; return db.prepare(sql); }, batch: (list) => { queries++; return db.batch(list); } },
  ASSETS: { fetch: async () => Response.json({ posts: { 'listed-post': {} } }) },   // /ledger/previews.json: listed posts only
  STATS_LIMIT: { limit: async ({ key }) => { limited.push(key); return { success: env.allow !== false }; } },
  READS_LIMIT: { limit: async ({ key }) => { limited.push(key); return { success: true }; } },
};
const get = (slug) => counts(new Request(`https://aaronorelup.com/api/reads?slug=${slug}`), env);
const post = (slug) => count(new Request('https://aaronorelup.com/api/reads', {
  method: 'POST', body: JSON.stringify({ slug }),
  headers: { Origin: 'https://aaronorelup.com', 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Firefox/140.0' },
}), env);
const seen = async (res) => ({ status: res.status, headers: [...res.headers].sort(), body: await res.text() });
const today = new Date().toISOString().slice(0, 10);

test('a listed post is counted and its counts are given', async () => {
  assert.equal((await post('listed-post')).status, 204);
  // Reads counted for a post while it was listed, which a later deploy unlisted.
  await db.prepare("INSERT INTO reads (slug, day, country, n) VALUES ('unlisted-post', ?1, 'US', 7)").bind(today).run();
  const res = await get('listed-post');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual([body.slug, body.total, body.today, body.first], ['listed-post', 1, 1, today]);
  assert.deepEqual(body.countries, [{ country: 'XX', n: 1 }]);
});

test('an unlisted post answers GET and POST exactly as an unknown slug, with no limiter key and no query', async () => {
  queries = 0;
  limited.length = 0;
  const [unlisted, unknown] = [await seen(await get('unlisted-post')), await seen(await get('never-a-post'))];
  assert.deepEqual(unlisted, { status: 404, headers: [['cache-control', 'no-store']], body: '' });
  assert.deepEqual(unlisted, unknown);
  assert.deepEqual(await seen(await post('unlisted-post')), await seen(await post('never-a-post')));
  assert.equal((await post('unlisted-post')).status, 404);
  assert.deepEqual([queries, limited], [0, []]);
  assert.equal(await db.prepare("SELECT SUM(n) AS n FROM reads WHERE slug = 'unlisted-post'").first('n'), 7, 'nothing new is counted for it');
  for (const slug of ['constructor', '__proto__', 'toString']) assert.notEqual((await get(slug)).status, 200, slug);
});

test('the other guards: a malformed slug is 400, a limited post 429', async () => {
  for (const slug of ['', 'Has-Caps', 'a/b', '-leading', 'x'.repeat(101)]) assert.equal((await get(slug)).status, 400, slug);
  env.allow = false;
  assert.equal((await get('listed-post')).status, 429);
  env.allow = true;
  assert.equal((await get('listed-post')).status, 200);
});
