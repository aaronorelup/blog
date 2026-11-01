// <ao-treemap>: a table as nested tiles; view buttons regroup it, pointing at a tile or the arrow keys read it out.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const el = (page) => page.locator('ao-treemap').first();
const read = (page) => el(page).locator('.ao-tm-read');
test.beforeEach(async ({ page }) => open(page, pageWith('ao-treemap')));

test('treemap-1 tiles are drawn, and pointing at one reads it out', async ({ page }) => {
  const tiles = el(page).locator('.ao-tm-tile');
  expect(await tiles.count()).toBeGreaterThan(2);
  await tiles.first().hover();
  await expect(read(page)).toContainText('of all');
  await page.mouse.move(0, 0);
  await expect(read(page)).toHaveText('');
});

test('treemap-2 focus and the keys walk the tiles', async ({ page }) => {
  const stage = el(page).locator('.ao-tm-stage');
  await stage.focus();
  await expect(read(page)).toContainText('of all');
  const first = await read(page).textContent();
  await page.keyboard.press('ArrowRight');
  await expect(read(page)).not.toHaveText(first);
  await page.keyboard.press('Home');
  await expect(read(page)).toHaveText(first);
  await page.keyboard.press('End');
  await expect(read(page)).not.toHaveText(first);
});

test('treemap-3 a view button regroups the tiles', async ({ page }) => {
  const buttons = el(page).locator('.ao-tm-bar button');
  test.skip(await buttons.count() < 2, 'one view');
  const names = await el(page).locator('.ao-tm-name').allTextContents();
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => el(page).locator('.ao-tm-name').allTextContents()).not.toEqual(names);
});
