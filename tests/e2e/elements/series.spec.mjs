// <ao-series>: a day-by-day table as a chart. The buttons switch the series shown (or the layers, with stack), and
// pointing at a day or focusing the chart and using the keys reads that day out, with its marks.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const el = (page) => page.locator('ao-series').first();
const read = (page) => el(page).locator('.ao-series-read');
test.beforeEach(async ({ page }) => open(page, pageWith('ao-series', (a) => a.show)));

test('series-1 show picks the first series, the buttons switch it', async ({ page }) => {
  const buttons = el(page).locator('.ao-series-top button');
  const shown = await el(page).getAttribute('show');
  await expect(buttons.filter({ hasText: shown })).toHaveAttribute('aria-pressed', 'true');
  const other = (await buttons.count()) > 1 ? buttons.filter({ hasNotText: shown }).first() : null;
  test.skip(!other, 'one series');
  await other.click();
  await expect(other).toHaveAttribute('aria-pressed', 'true');
  await expect(buttons.filter({ hasText: shown })).toHaveAttribute('aria-pressed', 'false');
});

test('series-2 pointing at a day reads it out, leaving clears it', async ({ page }) => {
  const body = el(page).locator('.ao-series-body');
  await body.scrollIntoViewIfNeeded();
  const box = await body.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(read(page).locator('.ao-series-val').first()).toBeVisible();
  await expect(el(page).locator('.ao-series-hl')).toBeAttached();
  await page.mouse.move(0, 0);
  await expect(read(page)).toContainText('Point at a day');
});

test('series-3 the chart takes focus and the keys walk the days', async ({ page }) => {
  const plot = el(page).locator('.ao-series-plot');
  await plot.focus();
  const last = await read(page).textContent();
  await page.keyboard.press('ArrowLeft');
  await expect(read(page)).not.toHaveText(last);
  await page.keyboard.press('End');
  await expect(read(page)).toHaveText(last);
  await page.keyboard.press('Home');
  await expect(read(page)).not.toHaveText(last);
});
