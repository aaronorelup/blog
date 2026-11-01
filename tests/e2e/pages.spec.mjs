// Contract files and the pages built from them: RSS guids and /version.json's shape, /stats drawn from /api/stats
// (mocked: 200 from fixtures/stats-200.json, 503 not-connected), and where a link into a post lands. INVENTORY rows
// pages-*.
import { test, expect } from './fixtures.mjs';
import { allDefined, pagesWhere } from './helpers.mjs';

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

// Each post component loads its own chunk; on a slow line it draws after the load event, when the browser has already
// scrolled to the link's heading, and a chart is shorter than the table it replaces. The chunks are held back here.
test('pages-5 a link lands on its heading, or its passage, once the components above have drawn', async ({ page }) => {
  const url = pagesWhere((p) => p.ao['ao-series'] && p.ao['ao-bars'])[0];
  await page.goto(url);
  const [id, hs] = await page.evaluate(() => {
    const h = [...document.querySelectorAll('[data-post-article] h2[id]')].at(-1);
    let p = h.nextElementSibling;
    while (p.tagName !== 'P') p = p.nextElementSibling;
    return [h.id, p.textContent.trim().split(/\s+/).slice(0, 5).join(' ')];
  });
  await page.goto('about:blank');
  await page.route('**/_astro/element.*.js', async (r) => {
    await new Promise((ok) => setTimeout(ok, 1000));
    await r.continue();
  });
  const heading = page.locator(`[id="${id}"]`);
  const top = () => heading.evaluate((h) => Math.round(h.getBoundingClientRect().top));
  await page.goto(`${url}#${id}`);
  await allDefined(page);
  await page.waitForTimeout(300);
  const landed = await top();
  await heading.evaluate((h) => h.scrollIntoView());
  expect(landed).toBe(await top());
  await page.goto(`${url}?hs=${encodeURIComponent(hs)}#${id}`);
  await allDefined(page);
  await expect.poll(() => page.locator('mark.hl').first().evaluate((m) => {
    const r = m.getBoundingClientRect();
    const s = document.getElementById('panel-scroll').getBoundingClientRect();
    return r.top >= s.top && r.bottom <= s.bottom;
  })).toBe(true);
});
