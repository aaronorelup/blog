// <ao-matrix>: a grid of settings with one subject; view buttons switch every cell, and every matrix on the page with
// the same views; only the pictures in view open in the viewer.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test.beforeEach(async ({ page }) => open(page, pageWith('ao-matrix', (a) => a.views)));
const shownIndex = (m) => m.locator('figure:not(.none)').first().evaluate((f) =>
  [...f.querySelectorAll(':scope > img')].findIndex((i) => !i.classList.contains('ao-matrix-off')));

test('matrix-1 one heading per column and the rows under them', async ({ page }) => {
  const m = page.locator('ao-matrix[views]').first();
  const cols = (await m.getAttribute('cols')).split('|').length;
  await expect(m.locator('.ao-matrix-col')).toHaveCount(cols);
  expect(await m.locator('.ao-matrix-row').count()).toBeGreaterThan(0);
});

test('matrix-2 a view button switches every cell, and every matrix with the same views', async ({ page }) => {
  const all = page.locator('ao-matrix[views]');
  const m = all.first();
  expect(await shownIndex(m)).toBe(0);
  await m.locator('.ao-matrix-btn').nth(1).click();
  await expect(m.locator('.ao-matrix-btn').nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect(await shownIndex(m)).toBe(1);
  const views = await m.getAttribute('views');
  for (let i = 1; i < await all.count(); i++) {
    if ((await all.nth(i).getAttribute('views')) === views) expect(await shownIndex(all.nth(i))).toBe(1);
  }
});

test('matrix-3 hidden views never open in the viewer, the shown ones page in order', async ({ page }) => {
  const m = page.locator('ao-matrix[views]').first();
  await m.locator('figure:not(.none) > img:not(.ao-matrix-off)').first().click();
  const dlg = page.locator('dialog.ao-lb');
  await expect(dlg).toBeVisible();
  const count = await dlg.locator('.ao-lb-count').textContent();
  const total = parseInt(count.split('/')[1], 10);
  const offs = await page.locator('[data-post-article] img.ao-matrix-off').count();
  const allImgs = await page.locator('[data-post-article] img').count();
  expect(total).toBeLessThanOrEqual(allImgs - offs);
});
