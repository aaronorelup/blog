// media/serve.js without R2's copy: when the build's list of sizes can't be read, a range request still plays
// (the whole file, 200, Accept-Ranges), never a 416; a read-aloud post file not recorded yet is 200 { ready: false }.
import test from 'node:test';
import assert from 'node:assert/strict';
import { serve } from '../../worker/media/serve.js';

const FILE = new Uint8Array(1000).map((_, i) => i % 251);
const MEDIA = { get: async () => null, head: async () => null };
const assets = (sizes) => ({
  fetch: async (request) => {
    const { pathname } = new URL(request.url);
    if (pathname === '/media-sizes.json') return sizes();
    if (pathname === '/courses/x/lesson.mp4') return new Response(FILE, { headers: { ETag: '"v1"', 'Content-Type': 'video/mp4' } });
    return new Response('not found', { status: 404 });
  },
});
const get = (path, headers = {}) => new Request(`https://aaronorelup.com${path}`, { headers });

test('a range request gets the whole file when the sizes fetch fails', async () => {
  let asked = 0;
  const env = { MEDIA, ASSETS: assets(() => { asked++; return new Response('', { status: 500 }); }) };
  for (const range of ['bytes=0-', 'bytes=500-599']) {
    const res = await serve(get('/courses/x/lesson.mp4', { Range: range }), env);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Accept-Ranges'), 'bytes');
    assert.deepEqual(new Uint8Array(await res.arrayBuffer()), FILE);
  }
  assert.equal(asked, 2, 'a failed read of the sizes is tried again, not remembered');
});

test('a recording that is not in R2 yet answers 200 { ready: false }, uncached', async () => {
  const env = { MEDIA, ASSETS: assets(() => Response.json({})) };
  const res = await serve(get('/read/some-post/0123456789ab.json'), env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await res.json(), { ready: false });
});

test('a path with a broken %-escape answers 400 before R2 or the assets are asked', async () => {
  let asked = 0;
  const env = {
    MEDIA: { get: async () => { asked++; return null; }, head: async () => { asked++; return null; } },
    ASSETS: { fetch: async () => { asked++; return new Response('not found', { status: 404 }); } },
  };
  for (const path of ['/media/%E0%A4%A.mp4', '/read/%zz/0123456789ab.json', '/media/100%.mp3']) {
    for (const method of ['GET', 'HEAD', 'POST']) {
      const res = await serve(new Request(`https://aaronorelup.com${path}`, { method }), env);
      assert.equal(res.status, 400, `${method} ${path}`);
      assert.equal(res.headers.get('Cache-Control'), 'no-store');
    }
  }
  assert.equal(asked, 0);
  assert.equal((await serve(get('/media/caf%C3%A9.mp4'), env)).status, 404, 'a well-formed escape still reaches the asset');
});
