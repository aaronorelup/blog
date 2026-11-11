// lib/http.js's body readers: a body is held only up to its cap, whatever length it declares (or doesn't), so a
// streamed or chunked POST can't make the Worker buffer more than the cap; and the routes that read one keep to it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readBytes, readJson } from '../../worker/lib/http.js';
import { loadWorker } from './worker-env.mjs';

const { count } = await loadWorker('reads/serve.js');
const URL_ = 'https://aaronorelup.com/api/x';
const post = (body, headers = {}) => new Request(URL_, { method: 'POST', body, headers });

// A body sent in 1 KB chunks with no Content-Length, `chunks` of them at most; `sent` counts what was pulled.
function streamed(chunks) {
  const state = { sent: 0, cancelled: false };
  const body = new ReadableStream({
    pull(controller) {
      if (state.sent >= chunks) { controller.close(); return; }
      state.sent++;
      controller.enqueue(new Uint8Array(1024).fill(120));
    },
    cancel() { state.cancelled = true; },
  }, { highWaterMark: 0 });
  const request = new Request(URL_, { method: 'POST', body, duplex: 'half', headers: { Origin: 'https://aaronorelup.com' } });
  return { request, state };
}

test('readBytes gives a body up to the cap, and null past it', async () => {
  assert.deepEqual(await readBytes(post('abc'), 3), new Uint8Array([97, 98, 99]));
  assert.equal(await readBytes(post('abcd'), 3), null);
  assert.deepEqual(await readBytes(post(''), 3), new Uint8Array(0));
  assert.deepEqual(await readBytes(new Request(URL_), 3), new Uint8Array(0), 'no body at all');
  const two = streamed(2);
  assert.equal(two.request.headers.get('Content-Length'), null);
  assert.equal((await readBytes(two.request, 4096)).length, 2048, 'chunks are joined');
});

test('a declared length over the cap is refused without reading the body', async () => {
  const request = post('x', { 'Content-Length': '5000' });
  assert.equal(await readBytes(request, 2048), null);
  assert.equal(request.bodyUsed, false);
});

test('a body with no declared length is dropped as soon as it passes the cap', async () => {
  const { request, state } = streamed(100000);   // 100 MB if it were read to its end
  assert.equal(await readBytes(request, 2048), null);
  assert.ok(state.sent <= 4, `read ${state.sent} KB of it`);
  assert.equal(state.cancelled, true);
  const again = streamed(100000);
  assert.equal(await readJson(again.request, 2048), null);
  assert.ok(again.state.sent <= 4);
});

test('readJson parses a body within the cap, and reads one that is not JSON as {}', async () => {
  assert.deepEqual(await readJson(post(JSON.stringify({ q: 'héllo' })), 2048), { q: 'héllo' });
  assert.deepEqual(await readJson(post('not json'), 2048), {});
  assert.deepEqual(await readJson(post(''), 2048), {});
  assert.deepEqual(await readJson(post('null'), 2048), {});
  assert.equal(await readJson(post('é'.repeat(1025)), 2048), null, 'the cap counts bytes, not characters');
  assert.deepEqual(await readJson(post(JSON.stringify({ q: 'x'.repeat(2038) })), 2048), { q: 'x'.repeat(2038) }, 'exactly the cap');
});

test('POST /api/reads stops reading an endless body and answers 400', async () => {
  const { request, state } = streamed(100000);
  assert.equal((await count(request, {})).status, 400);
  assert.ok(state.sent <= 4, `read ${state.sent} KB of it`);
  const big = new Request('https://aaronorelup.com/api/reads', {
    method: 'POST', headers: { Origin: 'https://aaronorelup.com' }, body: JSON.stringify({ slug: 'a-post', pad: 'x'.repeat(2000) }),
  });
  assert.equal((await count(big, {})).status, 400, 'a slug in a body over 1 KB is not read');
});
