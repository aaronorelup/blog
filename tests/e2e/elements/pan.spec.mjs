// <ao-pan>: a picture far wider than the page, panned by drag, keys, wheel or the minimap; views keep the place, stops
// and Glide move the frame, Full size opens the viewer, and ao-stop or a touch stops a glide.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const el = (page) => page.locator('ao-pan[views][stops]').first();
const stage = (page) => el(page).locator('.ao-pan-stage');
const left = (page) => stage(page).evaluate((s) => s.scrollLeft);
test.beforeEach(async ({ page }) => {
  await open(page, pageWith('ao-pan', (a) => a.views && a.stops));
  await el(page).scrollIntoViewIfNeeded();
  await expect.poll(() => stage(page).evaluate((s) => s.scrollWidth > s.clientWidth * 2)).toBe(true);
});

test('pan-1 dragging pans the picture', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch pans natively; the drag handler is the mouse');
  const box = await stage(page).boundingBox();
  const before = await left(page);
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => left(page)).toBeGreaterThan(before + 50);
});

test('pan-2 arrow keys, Home and End pan', async ({ page }) => {
  await stage(page).focus();
  await page.keyboard.press('End');
  await expect.poll(() => stage(page).evaluate((s) => s.scrollLeft + s.clientWidth >= s.scrollWidth - 2)).toBe(true);
  await page.keyboard.press('Home');
  await expect.poll(() => left(page)).toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => left(page)).toBeGreaterThan(0);
});

test('pan-3 the minimap window follows, and a click on the minimap jumps there', async ({ page }) => {
  const mini = el(page).locator('.ao-pan-mini');
  const win = el(page).locator('.ao-pan-win');
  const box = await mini.boundingBox();
  await mini.click({ position: { x: box.width * 0.8, y: box.height / 2 } });
  await expect.poll(() => win.evaluate((w) => parseFloat(w.style.left))).toBeGreaterThan(50);
  expect(await left(page)).toBeGreaterThan(0);
});

test('pan-4 a stop glides the frame there, a view keeps the place', async ({ page }) => {
  const stop = el(page).locator('.ao-pan-stop').last();
  const f = parseFloat((await el(page).getAttribute('stops')).split('|').at(-1));
  await stop.click();
  const frac = () => stage(page).evaluate((s) => (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth);
  await expect.poll(async () => Math.abs((await frac()) - f), { timeout: 5000 }).toBeLessThan(0.06);
  const view = el(page).locator('.ao-pan-view').nth(1);
  const at = await frac();
  await view.click();
  await expect(view).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => Math.abs((await frac()) - at), { timeout: 5000 }).toBeLessThan(0.06);
});

test('pan-5 Glide pans on its own until stopped, by its button, a wheel or ao-stop', async ({ page }) => {
  const glide = el(page).locator('.ao-pan-glide');
  await stage(page).evaluate((s) => { s.scrollLeft = 0; });
  await glide.click();
  await expect(glide).toHaveText('Stop');
  await expect.poll(() => left(page)).toBeGreaterThan(5);
  await glide.click();
  await expect(glide).toHaveText('Glide');
  await glide.click();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('ao-stop')));
  await expect(glide).toHaveText('Glide');
  await glide.click();
  await stage(page).dispatchEvent('wheel');
  await expect(glide).toHaveText('Glide');
});

test('pan-6 Full size opens the views in the viewer', async ({ page }) => {
  await el(page).locator('.ao-pan-zoom').click();
  await expect(page.locator('dialog.ao-lb')).toBeVisible();
  const views = (await el(page).getAttribute('views')).split('|').length;
  await expect(page.locator('.ao-lb-count')).toHaveText(new RegExp(`^\\d / ${views}$`));
});
