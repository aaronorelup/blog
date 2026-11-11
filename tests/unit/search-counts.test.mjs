// What a search leaves behind (worker/search/counts.js): a day, a mode, the query scrubbed and cut to 80 characters,
// and a count, never who asked. The daily sweep (worker/cleanup.js) acts at 03:07 UTC alone and drops only what is
// past its age. And byPost, which picks the chunks a search answers with.
import assert from 'node:assert/strict';
import test from 'node:test';
import { d1, loadWorker } from './worker-env.mjs';

const { count } = await loadWorker('search/counts.js');
const { byPost } = await loadWorker('search/retrieve.js');
const cleanup = await loadWorker('cleanup.js');

// One database for the file: a schema is made once per isolate (lib/sql.js), as it is in the Worker.
const DB = d1();
const env = { DB };
const all = async (sql) => (await DB.prepare(sql).all()).results.map((r) => ({ ...r }));

test('a search is counted by day, mode and scrubbed query, and nothing else is kept', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 10, 11, 12) });
  await count(env, 'search', 'claude code cost');
  await count(env, 'search', 'claude code cost');
  await count(env, 'ask', 'claude code cost');
  await count(env, 'search', 'write to someone@example.com');
  await count(env, 'search', 'my number is 5551234567');
  await count(env, 'search', 'x'.repeat(200));
  assert.deepEqual(await all('SELECT day, mode, q, n FROM searches ORDER BY mode, q'), [
    { day: '2026-11-11', mode: 'ask', q: 'claude code cost', n: 1 },
    { day: '2026-11-11', mode: 'search', q: '(redacted)', n: 2 },
    { day: '2026-11-11', mode: 'search', q: 'claude code cost', n: 2 },
    { day: '2026-11-11', mode: 'search', q: 'x'.repeat(80), n: 1 },
  ]);
  assert.deepEqual((await all("SELECT name FROM pragma_table_info('searches') ORDER BY cid")).map((r) => r.name), ['day', 'mode', 'q', 'n']);
});

test('the daily sweep acts at 03:07 UTC alone, and drops only what is past its age', async () => {
  const at = (h, m, s = 20) => Date.UTC(2026, 10, 11, h, m, s);
  const untouched = new Proxy({}, { get: (_, name) => { throw new Error(`reached for env.${String(name)}`); } });
  for (const [h, m] of [[3, 6], [3, 8], [2, 7], [4, 7], [15, 7], [0, 0]]) assert.equal(await cleanup.daily(untouched, at(h, m)), undefined);

  assert.equal(await cleanup.daily(env, at(3, 7)), 'swept'); // makes the tables it sweeps
  await DB.batch([
    ...['2026-05-14', '2026-05-15', '2026-11-10'].map((day) => DB.prepare("INSERT INTO searches (day, mode, q, n) VALUES (?1, 'search', 'kept or not', 1)").bind(day)),
    ...['2026-11-04T03:07:19.999Z', '2026-11-04T03:07:20.000Z', '2026-11-11T00:00:00.000Z'].map((time, i) => DB.prepare("INSERT INTO ask_cache (key, body, at) VALUES (?1, '{}', ?2)").bind(`k${i}`, time)),
    ...['2026-09-11', '2026-09-12', '2026-11-11'].map((day) => DB.prepare("INSERT INTO usage_day (day, what, n) VALUES (?1, 'search', 1)").bind(day)),
  ]);
  assert.equal(await cleanup.daily(env, at(3, 7)), 'swept');
  assert.deepEqual((await all("SELECT day FROM searches WHERE q = 'kept or not' ORDER BY day")).map((r) => r.day), ['2026-05-15', '2026-11-10']);
  assert.deepEqual((await all('SELECT at FROM ask_cache ORDER BY at')).map((r) => r.at), ['2026-11-04T03:07:20.000Z', '2026-11-11T00:00:00.000Z']);
  assert.deepEqual((await all('SELECT day FROM usage_day ORDER BY day')).map((r) => r.day), ['2026-09-12', '2026-11-11']);
});

test('byPost: the best chunks of each of the best posts, in score order', () => {
  const chunks = ['a', 'b', 'a', 'a', 'c', 'b', 'd', 'c'].map((slug, i) => ({ slug, anchor: `s${i}`, score: 1 - i / 10 }));
  const picked = (per, posts) => byPost(chunks, per, posts).map((c) => `${c.slug}:${c.anchor}`);
  assert.deepEqual(picked(2, 2), ['a:s0', 'b:s1', 'a:s2', 'b:s5']);
  assert.deepEqual(picked(1, 3), ['a:s0', 'b:s1', 'c:s4']);
  assert.deepEqual(picked(2, 8), ['a:s0', 'b:s1', 'a:s2', 'c:s4', 'b:s5', 'd:s6', 'c:s7']);
  assert.deepEqual(byPost([], 2, 8), []);
});
