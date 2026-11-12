// worker/index.js's routing: an unknown /api/ path is 404, a known one with the wrong method 405 with Allow, and a
// handler that throws is logged and answered a bare 503, the media handler (every path that isn't /api/) included.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadWorker } from './worker-env.mjs';

const worker = (await loadWorker('index.js')).default;
const ctx = { waitUntil() {} };
const at = (path, init) => new Request(`https://aaronorelup.com${path}`, init);

test('an unknown /api/ path is 404 and a wrong method 405 with Allow', async () => {
  assert.equal((await worker.fetch(at('/api/nope'), {}, ctx)).status, 404);
  assert.equal((await worker.fetch(at('/api/ask/'), {}, ctx)).status, 404);
  const res = await worker.fetch(at('/api/ask'), {}, ctx);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('Allow'), 'POST');
  assert.equal((await worker.fetch(at('/api/search', { method: 'DELETE' }), {}, ctx)).headers.get('Allow'), 'GET');
});

test('a media path is served by the media handler, whatever the method', async () => {
  const seen = [];
  const env = {
    MEDIA: { get: async (key) => { seen.push(key); return null; } },
    ASSETS: { fetch: async (request) => new Response(null, { status: request.method === 'GET' ? 404 : 405 }) },
  };
  assert.equal((await worker.fetch(at('/media/x/clip.mp4'), env, ctx)).status, 404);
  assert.deepEqual(seen, ['media/x/clip.mp4']);
  assert.equal((await worker.fetch(at('/media/x/clip.mp4', { method: 'POST' }), env, ctx)).status, 405, 'the asset server answers it');
});

test('a media handler that throws is logged and answered 503, like an API handler', async (t) => {
  const logged = t.mock.method(console, 'error', () => {});
  const env = { MEDIA: { get: async () => { throw new Error('R2 is away'); } }, ASSETS: { fetch: async () => new Response('x') } };
  const res = await worker.fetch(at('/media/x/clip.mp4'), env, ctx);
  assert.equal(res.status, 503);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.equal(await res.text(), '');
  assert.deepEqual(logged.mock.calls[0].arguments, ['/media/x/clip.mp4', 'R2 is away']);
});

test('without SESSION_KEY, Ask and Ask by voice answer 503 to a well-formed token', async (t) => {
  const logged = t.mock.method(console, 'error', () => {});
  const token = `e30.${'A'.repeat(43)}`;
  const ask = at('/api/ask', { method: 'POST', headers: { 'X-AO-Session': token }, body: JSON.stringify({ q: 'what did it cost' }) });
  const hear = at('/api/ask/hear', {
    method: 'POST', body: new Uint8Array(2048),
    headers: { 'X-AO-Session': token, Origin: 'https://aaronorelup.com', 'Content-Type': 'audio/webm' },
  });
  for (const request of [ask, hear]) {
    const res = await worker.fetch(request, {}, ctx);
    assert.equal(res.status, 503, new URL(request.url).pathname);
  }
  assert.deepEqual(logged.mock.calls.map((c) => c.arguments[1]), ['SESSION_KEY is not set', 'SESSION_KEY is not set']);
});
