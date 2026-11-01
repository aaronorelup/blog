// The deployed site, after a push (P step 4): GET and HEAD requests only, never a POST, so no run counts a read,
// writes search counts or spends a cap. Every baseline path answers, media come from R2 in byte ranges, the APIs
// answer in their shapes, and the homepage and a post load clean.
import { test, expect } from '@playwright/test';
import { readBaseline } from '../../scripts/build/contracts.mjs';
import { isLivePath } from '../../src/data/exempt.js';
import { targets, smallVideo } from './helpers.mjs';

test('live-1 /version.json is a main build', async ({ request }) => {
  const v = await (await request.get('/version.json')).json();
  expect(v.branch).toBe('main');
  expect(v.commit).toMatch(/^[0-9a-f]{40}$/);
});

test('live-2 every baseline path answers', async ({ request }) => {
  const bad = [];
  for (const p of readBaseline().filter((p) => !isLivePath(p))) {
    const r = await request.head(p, { maxRedirects: 3 });
    if (r.status() !== 200) bad.push(`${p} ${r.status()}`);
  }
  expect(bad).toEqual([]);
});

test('live-3 media come from R2 and answer byte ranges', async ({ request }) => {
  const r = await request.get(smallVideo, { headers: { Range: 'bytes=0-99' } });
  expect(r.status()).toBe(206);
  expect(r.headers()['content-range']).toMatch(/^bytes 0-99\/\d+$/);
  expect(r.headers()['x-media-source']).toBe('r2');
});

test('live-4 the APIs answer in their shapes', async ({ request }) => {
  const stats = await request.get('/api/stats');
  expect([200, 503]).toContain(stats.status());
  const s = await stats.json();
  if (stats.status() === 200) expect(s.v).toBe(1);
  else expect(['not-connected', 'gathering']).toContain(s.state);
  const slug = targets.tags['ao-demo'].find((u) => u.attrs.part === 'count').attrs['data-slug'];
  const reads = await request.get('/api/reads?slug=' + slug);
  expect(reads.status()).toBe(200);
  expect(Object.keys(await reads.json())).toEqual(expect.arrayContaining(['slug', 'total', 'today', 'days', 'countries']));
});

test('live-5 the homepage and a post load without a script error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.waitForTimeout(2000);
  await page.goto(Object.keys(targets.pages).find((p) => targets.pages[p].kind === 'post' && !targets.pages[p].live));
  await page.waitForFunction(() => !!customElements.get('ao-compare'));
  expect(errors).toEqual([]);
});
