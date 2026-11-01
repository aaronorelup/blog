// The ledger page and the hover card (src/scripts/ledger-preview.js): every listed post once, newest first; on a
// desktop, pointing at or focusing a post link opens its card from /ledger/previews.json, and it closes again; a
// phone never gets one. INVENTORY rows ledger-*.
import { test, expect } from './fixtures.mjs';

const rows = (page) => page.locator('#panel-scroll [data-ledger-entry]');
const card = (page) => page.locator('.lp-card');

test('ledger-1 every listed post appears once, newest first', async ({ page, request }) => {
  const previews = await (await request.get('/ledger/previews.json')).json();
  const rss = await (await request.get('/rss.xml')).text();
  const dated = [...rss.matchAll(/<guid[^>]*>https:\/\/aaronorelup\.com\/ledger\/([^/]+)\/<\/guid>.*?<pubDate>([^<]+)<\/pubDate>/gs)]
    .map(([, slug, d]) => ({ slug, t: Date.parse(d), id: previews.posts[slug].id }));
  const want = dated.sort((a, b) => b.t - a.t || b.id.localeCompare(a.id)).map((p) => p.slug);
  await page.goto('/ledger/');
  const got = await rows(page).evaluateAll((as) => as.map((a) => a.getAttribute('data-ledger-entry')));
  expect(got).toEqual(want);
  expect(new Set(got)).toEqual(new Set(Object.keys(previews.posts)));
});

test.describe('the hover card', () => {
  test('ledger-2 pointing at a post opens its card, leaving and Escape close it', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    const previews = await (await request.get('/ledger/previews.json')).json();
    await page.goto('/ledger/');
    const r = rows(page).nth(2);
    const slug = await r.getAttribute('data-ledger-entry');
    await r.hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    // A row shows its own title beside the card, so the card names the post by id.
    await expect(card(page).locator('.lp-meta')).toContainText(previews.posts[slug].id);
    await expect(card(page).locator('.lp-verdict')).toHaveText(previews.posts[slug].verdict || '');
    await page.mouse.move(5, 5);
    await expect(card(page)).not.toHaveClass(/lp-on/);
    await rows(page).nth(3).hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    await page.keyboard.press('Escape');
    await expect(card(page)).not.toHaveClass(/lp-on/);
  });

  test('ledger-3 keyboard focus on a post link opens its card, and its picture loads', async ({ page, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    await page.goto('/ledger/');
    await page.waitForLoadState('networkidle');
    await rows(page).first().focus();
    await expect(card(page)).toHaveClass(/lp-on/);
    const img = card(page).locator('.lp-img');
    if (await img.getAttribute('src')) await expect(img).toHaveClass(/lp-ready/);
  });

  test('ledger-4 a phone gets no card', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only');
    await page.goto('/ledger/');
    await rows(page).first().dispatchEvent('pointerover');
    await page.waitForTimeout(400);
    await expect(card(page)).toHaveCount(0);
  });

  test('ledger-5 a post link inside a post opens the card too', async ({ page, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    await page.goto('/ledger/');
    const slug = await rows(page).first().getAttribute('data-ledger-entry');
    await page.goto(`/ledger/${slug}/`);
    const link = page.locator('[data-post-article] a[href^="/ledger/"]:not([data-close-reader])').filter({ visible: true }).first();
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    await expect(card(page).locator('.lp-title')).not.toBeEmpty();
  });
});
