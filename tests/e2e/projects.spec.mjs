// The projects page (src/components/projects/, data src/content/projects/*.yaml): every card once in its section,
// the jump row's counts, Highlights with a reel that loads nothing until played and plays inline on a phone, needs
// lines, private cards linking only to this site, pictures that load without moving the page, the hover card on post
// links, and the same view in the homepage overlay. INVENTORY rows projects-*.
import fs from 'node:fs';
import { test, expect } from './fixtures.mjs';
import { expectPlaying, play } from './helpers.mjs';

const FILES = fs.readdirSync(new URL('../../src/content/projects/', import.meta.url)).filter((f) => f.endsWith('.yaml'));
const SECTIONS = ['play', 'download', 'watch', 'read', 'stopped'];
const sectionCards = (root, key) => root.locator(`#proj-${key} :is(.proj-card, .proj-line-item)`);

test('projects-1 every card is in its section once, and the jump row counts them', async ({ page }) => {
  await page.goto('/projects/');
  let total = 0;
  for (const key of SECTIONS) {
    const n = await sectionCards(page, key).count();
    await expect(page.locator(`.proj-jump-link[href="#proj-${key}"] .proj-jump-count`)).toHaveText(String(n));
    total += n;
  }
  expect(total).toBe(FILES.length);
  await expect(page.locator('#proj-stopped .proj-card, #proj-stopped .proj-pic')).toHaveCount(0);
  await page.locator('.proj-jump-link[href="#proj-read"]').click();
  await expect.poll(() => page.locator('#proj-read').evaluate((s) => Math.round(s.getBoundingClientRect().top))).toBeLessThan(200);
});

test('projects-2 Highlights: the reel loads nothing until played, then plays inline; four cards in order', async ({ page }) => {
  await page.goto('/projects/');
  const reel = page.locator('#proj-reel video');
  await expect(reel).toHaveAttribute('preload', 'none');
  await expect(reel).toHaveAttribute('playsinline', '');
  expect(await reel.evaluate((v) => v.readyState)).toBe(0);
  await expect(page.locator('.proj-highlight-cards .proj-card')).toHaveCount(4);
  await play(reel);
  await expectPlaying(reel);
  expect(await reel.evaluate((v) => !document.fullscreenElement && !v.webkitDisplayingFullscreen)).toBe(true);
  await expect(page.locator('#proj-reel a[href$="-15.mp4"]')).toBeVisible();
});

test('projects-3 play and download cards say what you need; private cards link only to this site', async ({ page }) => {
  await page.goto('/projects/');
  for (const key of ['play', 'download']) {
    const cards = page.locator(`#proj-${key} .proj-card`);
    expect(await cards.count()).toBeGreaterThan(0);
    expect(await cards.locator('.proj-needs').count()).toBe(await cards.count());
  }
  const priv = page.locator('.proj-card.is-private');
  expect(await priv.count()).toBeGreaterThan(0);
  await expect(priv.locator('.proj-ribbon')).toHaveCount(await priv.count());
  expect(await priv.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')).filter((h) => !h.startsWith('/')))).toEqual([]);
});

test('projects-4 every picture loads, and none moves the page as it does', async ({ page }) => {
  // Pictures arrive a second late, so anything they would push is measured before and after.
  await page.route(/\/media\/(projects|icons)\//, async (route) => {
    await new Promise((r) => setTimeout(r, 1000));
    await route.continue();
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/projects/', { waitUntil: 'domcontentloaded' });
  const marks = () => page.locator('.proj-section-title').evaluateAll((hs) => hs.map((h) => Math.round(h.offsetTop)));
  const before = await marks();
  const pics = page.locator('.proj-pic img');
  await pics.evaluateAll(async (imgs) => {
    for (const i of imgs) i.loading = 'eager';
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
  });
  expect(await pics.evaluateAll((imgs) => imgs.filter((i) => !i.naturalWidth).map((i) => i.src))).toEqual([]);
  expect(await marks()).toEqual(before);
  expect(errors).toEqual([]);
});

test('projects-5 pointing at a card\'s post link opens its hover card', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones never get a card (ledger-4)');
  await page.goto('/projects/');
  await page.locator('#proj-watch .proj-post').first().hover();
  await expect(page.locator('.lp-card')).toHaveClass(/lp-on/);
});

test.describe('in the homepage overlay', () => {
  test.describe.configure({ mode: 'default' });
  test('projects-6 the panel shows the same view, and a post link opens in its reader', async ({ page }) => {
    await page.goto('/projects/');
    const counts = async (root) => Promise.all(['.proj-card', ...SECTIONS.map((k) => `#proj-${k} :is(.proj-card, .proj-line-item)`)]
      .map((sel) => root.locator(sel).count()));
    const standalone = await counts(page.locator('[data-panel-view="projects"]'));
    await page.goto('/?tier=low');
    await expect(page.locator('#stop-rail [data-goto]').first()).toBeVisible({ timeout: 20_000 });
    await page.evaluate(() => { window.__sameDocument = true; });
    const card = page.locator('section[data-wp]').filter({ has: page.locator('a[href="/projects"]') }).first();
    for (let k = 0; k < 6 && await card.evaluate((s) => s.inert); k++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(3000);
    }
    const link = card.locator('a[href="/projects"]').first();
    const box = await link.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('#panel-screen')).toHaveAttribute('aria-hidden', 'false');
    await expect(page).toHaveURL(/\/projects$/);
    const view = page.locator('[data-view="projects"]');
    await expect(view.locator('.proj-card').first()).toBeVisible();
    expect(await counts(view)).toEqual(standalone);
    const post = view.locator('#proj-watch .proj-post').first();
    const href = await post.getAttribute('href');
    await post.click();
    await expect(page).toHaveURL(new RegExp(href + '$'));
    await expect(page.locator('[data-view="reader"]')).toHaveAttribute('data-slug', href.split('/')[2]);
    expect(await page.evaluate(() => window.__sameDocument === true)).toBe(true);
  });
});
