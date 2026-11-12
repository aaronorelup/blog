// worker/lib: the answers every handler gives (http.js), the form a query is limited, cached and stored in
// (text.js: a query that may carry someone's details is stored as "(redacted)"), the once-per-isolate helpers
// (memo.js, sql.js, build-files.js: a failed read is forgotten, so the next call tries again), and the schema files
// themselves: only CREATE TABLE IF NOT EXISTS, safe to run again, with no column for an address.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { json, readJson, sameOrigin, status } from '../../worker/lib/http.js';
import { normalize, scrub, sha256 } from '../../worker/lib/text.js';
import { memo } from '../../worker/lib/memo.js';
import { ensure } from '../../worker/lib/sql.js';
import { asset, buildJson } from '../../worker/lib/build-files.js';

const SITE = 'https://aaronorelup.com';

test('json and status: nothing an API answers is cached unless the handler says so', async () => {
  const body = json({ ok: true });
  assert.equal(body.status, 200);
  assert.equal(body.headers.get('Content-Type'), 'application/json; charset=utf-8');
  assert.equal(body.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await body.json(), { ok: true });
  const cached = json({ ask: true }, 200, { 'Cache-Control': 'max-age=30' });
  assert.equal(cached.headers.get('Cache-Control'), 'max-age=30');
  assert.equal(json({}, 429).status, 429);
  const bare = status(405, { Allow: 'GET' });
  assert.equal(bare.status, 405);
  assert.equal(bare.body, null);
  assert.equal(bare.headers.get('Allow'), 'GET');
  assert.equal(bare.headers.get('Cache-Control'), 'no-store');
});

test("sameOrigin: only a request whose Origin is the host it was sent to", () => {
  const from = (origin, url = `${SITE}/api/reads`) => sameOrigin(new Request(url, { method: 'POST', headers: origin === undefined ? {} : { Origin: origin } }));
  assert.equal(from(SITE), true);
  assert.equal(from('http://localhost:8787', 'http://localhost:8787/api/reads'), true);
  assert.equal(from(undefined), false);
  assert.equal(from(''), false);
  assert.equal(from('null'), false);
  assert.equal(from('not a url'), false);
  assert.equal(from('https://evil.example'), false);
  assert.equal(from('https://aaronorelup.com.evil.example'), false);
  assert.equal(from('https://www.aaronorelup.com'), false);
  assert.equal(from('https://aaronorelup.com:8443'), false);
  assert.equal(from('http://localhost:8788', 'http://localhost:8787/api/reads'), false);
});

test('readJson: null for a body over the cap (by its header or by its bytes), {} for one that is not JSON', async () => {
  const post = (body, headers = {}) => new Request(`${SITE}/api/x`, { method: 'POST', body, headers });
  assert.deepEqual(await readJson(post('{"a":1}'), 100), { a: 1 });
  assert.deepEqual(await readJson(post('not json'), 100), {});
  assert.deepEqual(await readJson(post('null'), 100), {});
  assert.deepEqual(await readJson(post(''), 100), {});
  assert.equal(await readJson(post('{"a":1}', { 'Content-Length': '101' }), 100), null);
  assert.equal(await readJson(post(JSON.stringify({ a: 'x'.repeat(100) })), 100), null);
  // Counted in bytes, not characters: 40 three-byte characters are over a 100-byte cap.
  assert.equal(await readJson(post(JSON.stringify('€'.repeat(40))), 100), null);
  assert.equal(await readJson(post(JSON.stringify('€'.repeat(30))), 100), '€'.repeat(30));
});

test('normalize: NFKC, lower case, whitespace collapsed and trimmed', () => {
  assert.equal(normalize('  Claude\tCode \n COST  '), 'claude code cost');
  assert.equal(normalize('Ａｉ ﬁne'), 'ai fine');
  assert.equal(normalize('a b'), 'a b');
  assert.equal(normalize(42), '42');
  assert.equal(normalize(''), '');
});

test("scrub: a query that may carry someone's details is stored as (redacted), never as typed", () => {
  for (const q of ['mail me at someone@example.com', '@handle', 'see https://example.com/x', 'HTTP://EXAMPLE.COM', 'www.example.com',
    'call 5551234567', 'order 123456']) assert.equal(scrub(q), '(redacted)', q);
  for (const q of ['how much does claude code cost', 'the 2026 ledger', '12345 tokens', 'http and www without a host', '']) assert.equal(scrub(q), q, q);
});

test('sha256: the hex digest', async () => {
  assert.equal(await sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('memo: one read every ms, shared by every caller in between, and a failed read forgotten', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 0 });
  const seen = [];
  const read = memo(1000, async (env) => { seen.push(env); return seen.length; });
  const first = read('env');
  assert.equal(read('env'), first);
  assert.equal(await first, 1);
  t.mock.timers.tick(999);
  assert.equal(await read('env'), 1);
  t.mock.timers.tick(1);
  assert.equal(await read('env'), 2);
  assert.deepEqual(seen, ['env', 'env']);

  let tries = 0;
  const flaky = memo(1000, async () => { tries += 1; if (tries === 1) throw new Error('down'); return tries; });
  await assert.rejects(flaky(), /down/);
  assert.equal(await flaky(), 2);
  assert.equal(await flaky(), 2);
});

test('ensure: a schema runs once, without its comments, and a failed run is tried again', async () => {
  const batches = [];
  const db = { prepare: (sql) => sql, batch: (list) => { batches.push(list); return Promise.resolve(); } };
  const schema = '-- A comment; with a semicolon.\nCREATE TABLE IF NOT EXISTS a (x TEXT); -- its note\n\nCREATE TABLE IF NOT EXISTS b (\n  y TEXT\n);\n';
  assert.equal(ensure(db, schema), ensure(db, schema));
  await ensure(db, schema);
  assert.deepEqual(batches, [['CREATE TABLE IF NOT EXISTS a (x TEXT)', 'CREATE TABLE IF NOT EXISTS b (\n  y TEXT\n)']]);

  let runs = 0;
  const down = { prepare: (sql) => sql, batch: () => { runs += 1; return runs === 1 ? Promise.reject(new Error('down')) : Promise.resolve(); } };
  const other = 'CREATE TABLE IF NOT EXISTS c (z TEXT);';
  await assert.rejects(ensure(down, other), /down/);
  await ensure(down, other);
  await ensure(down, other);
  assert.equal(runs, 2);
});

test('buildJson: a build file is read once, a missing one rejects and is tried again', async () => {
  const asked = [];
  let there = false;
  const env = { ASSETS: { fetch: async (request) => {
    asked.push(new URL(request.url).pathname);
    return there ? Response.json({ posts: {} }) : new Response('', { status: 404 });
  } } };
  await assert.rejects(asset(env, '/test/missing.json'), /\/test\/missing\.json answered 404/);
  await assert.rejects(buildJson(env, '/test/file.json'), /answered 404/);
  there = true;
  assert.deepEqual(await buildJson(env, '/test/file.json'), { posts: {} });
  assert.equal(buildJson(env, '/test/file.json'), buildJson(env, '/test/file.json'));
  assert.deepEqual(asked, ['/test/missing.json', '/test/file.json', '/test/file.json']);
});

test('the schema files: only CREATE TABLE IF NOT EXISTS, safe to run again, and no column for an address', async () => {
  const dir = new URL('../../worker/', import.meta.url);
  const files = fs.readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith('.sql'));
  assert.ok(files.length >= 6, 'the schema files were not found');
  const statements = [];
  const recorder = { prepare: (sql) => sql, batch: async (list) => { statements.push(...list); } };
  for (const f of files) await ensure(recorder, fs.readFileSync(new URL(f, dir), 'utf8'));
  for (const sql of statements) assert.match(sql, /^CREATE TABLE IF NOT EXISTS \w+ \(/, sql);

  const db = new DatabaseSync(':memory:');
  for (const sql of [...statements, ...statements]) db.exec(sql);
  const columns = db.prepare("SELECT m.name AS tbl, c.name AS col FROM sqlite_master m, pragma_table_info(m.name) c WHERE m.type = 'table'").all();
  assert.ok(columns.length > 20);
  assert.deepEqual(columns.filter((c) => /(^|_)ip(v[46])?(_|$)|addr/i.test(c.col)).map((c) => `${c.tbl}.${c.col}`), []);
});
