// The Worker's front door (worker/index.js) and the guards a handler applies before it touches a binding: an unknown
// API path is 404, a wrong method 405 with Allow, a thrown error 503 and logged, anything else goes to the media
// handler. /api/session mints only for the site's own pages. /api/reads counts only a listed post, for something
// that doesn't call itself a bot, and stores a post, a day, a country and a count. And no code under worker/ names a
// header or a field that carries a visitor's IP address.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { d1, loadWorker } from './worker-env.mjs';

const SITE = 'https://aaronorelup.com';
const worker = (await loadWorker('index.js')).default;
const reads = await loadWorker('reads/serve.js');
// Any binding a handler reaches for throws, so a guard that should answer first is seen to answer first.
const untouched = new Proxy({}, { get: (_, name) => { throw new Error(`reached for env.${String(name)}`); } });
const ask = (path, init, env = untouched) => worker.fetch(new Request(SITE + path, init), env, {});
const bare = async (response, code) => {
  assert.equal(response.status, code);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(await response.text(), '');
};

test('an API path the Worker does not have is a bare 404, never an asset', async () => {
  for (const path of ['/api/nope', '/api/', '/api/reads/', '/api/reads/x', '/api/ask/hear/x']) await bare(await ask(path), 404);
});

test('a route asked with a method it does not take is 405 and says which it takes', async () => {
  for (const [path, method, allow] of [['/api/search', 'DELETE', 'GET'], ['/api/reads', 'PUT', 'GET, POST'],
    ['/api/stats', 'POST', 'GET, HEAD'], ['/api/ask', 'GET', 'POST'], ['/api/session', 'DELETE', 'GET, POST']]) {
    const response = await ask(path, { method });
    await bare(response, 405);
    assert.equal(response.headers.get('Allow'), allow, path);
  }
});

test('a handler that throws is answered 503 and logged with its path, never its stack', async (t) => {
  const logged = t.mock.method(console, 'error', () => {});
  await bare(await ask('/api/session'), 503);
  assert.equal(logged.mock.calls.length, 1);
  const said = logged.mock.calls[0].arguments;
  assert.equal(said.length, 2);
  assert.equal(said[0], '/api/session');
  assert.match(said[1], /^reached for env\.\w+$/);
});

test('every path that is not an API goes to the media handler', async () => {
  const seen = [];
  const env = { ASSETS: { fetch: async (request) => { seen.push(new URL(request.url).pathname); return new Response('an asset'); } } };
  const response = await ask('/apiary/notes.txt', { method: 'POST' }, env);
  assert.equal(await response.text(), 'an asset');
  assert.deepEqual(seen, ['/apiary/notes.txt']);
});

test('/api/lantern sends the door on to its secret address, uncached', async () => {
  const response = await ask('/api/lantern', {}, { LANTERN_URL: 'https://example.com/door' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://example.com/door');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('/api/session mints nothing for another site or a body over its cap, before any binding or call', async () => {
  const post = (headers, body = '{}') => ask('/api/session', { method: 'POST', headers, body });
  await bare(await post({}), 403);
  await bare(await post({ Origin: 'https://evil.example' }), 403);
  await bare(await post({ Origin: 'null' }), 403);
  await bare(await post({ Origin: SITE }, JSON.stringify({ turnstile: 'x'.repeat(4000) })), 413);
});

// /api/reads against an in-memory D1 and a previews.json that lists one post, on one fixed day.
const NOON = Date.UTC(2026, 10, 11, 12);
const stored = d1();
const limits = { reads: true };
const env = {
  DB: stored,
  ASSETS: { fetch: async () => Response.json({ posts: { shown: { id: 'AO-001', title: 'Shown' } } }) },
  READS_LIMIT: { limit: async () => ({ success: limits.reads }) },
  STATS_LIMIT: { limit: async () => ({ success: true }) },
};
const BROWSER = 'Mozilla/5.0 (X11; Linux x86_64) Firefox/140.0';
const read = (slug, { origin = SITE, ua = BROWSER, cf, body, to = env } = {}) => {
  const request = new Request(`${SITE}/api/reads`, { method: 'POST',
    headers: { ...(origin && { Origin: origin }), ...(ua && { 'User-Agent': ua }) }, body: body ?? JSON.stringify({ slug }) });
  if (cf) Object.defineProperty(request, 'cf', { value: cf });
  return reads.count(request, to);
};
const rows = async () => (await stored.prepare('SELECT slug, day, country, n FROM reads ORDER BY slug, country').all()).results.map((r) => ({ ...r }));

test('/api/reads refuses another site, a slug that is not one, and skips a bot quietly, all before any binding', async () => {
  assert.equal((await read('shown', { origin: 'https://evil.example', to: untouched })).status, 403);
  assert.equal((await read('shown', { origin: null, to: untouched })).status, 403);
  for (const slug of ['', 'Shown', 'a b', '../x', '-x', 'x'.repeat(101)]) assert.equal((await read(slug, { to: untouched })).status, 400, slug);
  assert.equal((await read('', { body: 'not json', to: untouched })).status, 400);
  for (const ua of [null, 'Googlebot/2.1', 'curl/8.5.0', 'python-requests/2.32', 'HeadlessChrome/126']) {
    assert.equal((await read('shown', { ua, to: untouched })).status, 204, String(ua));
  }
});

test('/api/reads counts a listed post only, and keeps a post, a day, a country and a count', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON });
  assert.equal((await read('hidden')).status, 404);
  assert.equal((await read('shown')).status, 204);
  assert.equal((await read('shown')).status, 204);
  assert.equal((await read('shown', { cf: { country: 'NZ' } })).status, 204);
  assert.equal((await read('shown', { cf: { country: 'not a country' } })).status, 204);
  assert.equal((await read('shown', { cf: { country: 'NZ', verifiedBotCategory: 'Search Engine Crawler' } })).status, 204);
  limits.reads = false;
  assert.equal((await read('shown')).status, 429);
  limits.reads = true;
  assert.deepEqual(await rows(), [{ slug: 'shown', day: '2026-11-11', country: 'NZ', n: 1 }, { slug: 'shown', day: '2026-11-11', country: 'XX', n: 3 }]);
  const columns = (await stored.prepare("SELECT name FROM pragma_table_info('reads') ORDER BY cid").all()).results.map((r) => r.name);
  assert.deepEqual(columns, ['slug', 'day', 'country', 'n']);
});

test('/api/reads gives a post its counts, and refuses a slug that is not one', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON + 3600e3 });
  const get = (query) => reads.counts(new Request(`${SITE}/api/reads${query}`), env);
  assert.equal((await get('')).status, 400);
  assert.equal((await get('?slug=Not%20A%20Slug')).status, 400);
  const response = await get('?slug=shown');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), {
    slug: 'shown', total: 4, first: '2026-11-11', today: 4, days: [{ day: '2026-11-11', n: 4 }],
    countries: [{ country: 'XX', n: 3 }, { country: 'NZ', n: 1 }], asOf: '2026-11-11T13:00:00.000Z',
  });
  const none = await (await get('?slug=never-read')).json();
  assert.deepEqual([none.total, none.first, none.today, none.days, none.countries], [0, null, 0, [], []]);
});

test("no code under worker/ names a header or a field that carries a visitor's IP address", () => {
  const dir = new URL('../../worker/', import.meta.url);
  const files = fs.readdirSync(dir, { recursive: true }).map(String).filter((f) => /\.(js|mjs|ts|sql)$/.test(f));
  assert.ok(files.length > 20 && files.includes('index.js'), 'the Worker was not found');
  // scripts/check/code.mjs's rule, and the other headers an address travels in. worker/stats/ is read here too.
  const IP = /CF-Connecting-IP|CF-Connecting-IPv6|True-Client-IP|X-Forwarded-For|X-Real-IP|remoteip|remote_addr/i;
  const naming = files.filter((f) => IP.test(fs.readFileSync(new URL(f, dir), 'utf8')));
  assert.deepEqual(naming, []);
});
