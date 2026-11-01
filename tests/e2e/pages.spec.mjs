// Contract files and the pages built from them: RSS guids and /version.json's shape, and /stats drawn from /api/stats
// (mocked: 200 from fixtures/stats-200.json, 503 not-connected). INVENTORY rows pages-*.
import { test, expect } from './fixtures.mjs';

test('pages-1 the RSS feed has one item per listed post, guid = the post URL', async ({ request }) => {
  const previews = await (await request.get('/ledger/previews.json')).json();
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const guids = [...(await res.text()).matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1]);
  expect(guids.sort()).toEqual(Object.keys(previews.posts).map((s) => `https://aaronorelup.com/ledger/${s}/`).sort());
});

test('pages-2 /version.json says which build this is', async ({ request }) => {
  const v = await (await request.get('/version.json')).json();
  const previews = await (await request.get('/ledger/previews.json')).json();
  expect(Object.keys(v).sort()).toEqual(['branch', 'built', 'commit', 'newest', 'posts']);
  expect(v.commit).toMatch(/^[0-9a-f]{40}$/);
  expect(typeof v.branch).toBe('string');
  expect(v.built).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  expect(v.posts).toBe(Object.keys(previews.posts).length);
  expect(Object.keys(v.newest).sort()).toEqual(['date', 'id', 'slug']);
  expect(previews.posts[v.newest.slug].id).toBe(v.newest.id);
});

test.describe('/stats with the numbers', () => {
  test('pages-3 /stats draws the snapshot', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/stats');
    await expect(page.locator('#st-top')).toBeVisible();
    await expect(page.locator('.st-state-lede')).toHaveCount(0);
    await expect(page.locator('#st-top')).toContainText(/\d/);
    expect(errors).toEqual([]);
  });
});

test.describe('/stats without the numbers', () => {
  test.use({ api: { '/api/stats': 'stats-503' } });
  test('pages-4 /stats says the numbers are not connected', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.locator('.st-state-lede')).toContainText("The numbers aren't connected right now.");
  });
});
