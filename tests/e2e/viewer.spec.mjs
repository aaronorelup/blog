// The image viewer every post picture opens in (post-components.js "The image viewer"): click and Enter open it,
// the arrows, Home/End and the side buttons page, wheel, keys, a click, a double tap and a pinch zoom, Esc and Back
// close it, data-full is fetched, and pictures in links and components keep their own click.
import { test, expect } from './fixtures.mjs';
import { open, targets } from './helpers.mjs';

const url = targets.dataFull.find((p) => !targets.pages[p].live);
const dlg = (page) => page.locator('dialog.ao-lb');
const count = (page) => dlg(page).locator('.ao-lb-count');
const pics = (page) => page.locator('[data-post-article] img[role=button]');
const zoomed = (page) => expect(dlg(page)).toHaveClass(/ao-lb-zoomed/);
const fitted = (page) => expect(dlg(page)).not.toHaveClass(/ao-lb-zoomed/);
const total = (page) => count(page).textContent().then((t) => parseInt(t.split('/')[1], 10));

test.beforeEach(async ({ page }) => open(page, url));

test('viewer-1 a click opens the picture, counted among the post’s pictures', async ({ page }) => {
  await pics(page).nth(1).click();
  await expect(dlg(page)).toBeVisible();
  await expect(count(page)).toHaveText(/^2 \/ \d+$/);
  expect(await total(page)).toBe(await pics(page).count());
});

test('viewer-2 Enter on a focused picture opens it', async ({ page }) => {
  await pics(page).first().focus();
  await page.keyboard.press('Enter');
  await expect(dlg(page)).toBeVisible();
  await expect(count(page)).toHaveText(/^1 \//);
});

test('viewer-3 arrows, Home, End and the side buttons page through the pictures', async ({ page }) => {
  await pics(page).first().click();
  const n = await total(page);
  await page.keyboard.press('ArrowRight');
  await expect(count(page)).toHaveText(`2 / ${n}`);
  await page.keyboard.press('ArrowLeft');
  await expect(count(page)).toHaveText(`1 / ${n}`);
  await page.keyboard.press('End');
  await expect(count(page)).toHaveText(`${n} / ${n}`);
  await page.keyboard.press('ArrowRight');
  await expect(count(page)).toHaveText(`1 / ${n}`);
  await page.keyboard.press('Home');
  await dlg(page).locator('.ao-lb-next').click();
  await expect(count(page)).toHaveText(`2 / ${n}`);
  await dlg(page).locator('.ao-lb-prev').click();
  await expect(count(page)).toHaveText(`1 / ${n}`);
});

test('viewer-4 + and 0 zoom and fit', async ({ page }) => {
  await pics(page).first().click();
  await page.keyboard.press('+');
  await zoomed(page);
  await page.keyboard.press('0');
  await fitted(page);
});

test('viewer-4b the wheel zooms', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no wheel on a phone');
  await pics(page).first().click();
  const box = await dlg(page).locator('.ao-lb-img').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -400);
  await zoomed(page);
});

test('viewer-5 a click on the picture zooms there and a second fits it (mouse)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch uses the double tap (viewer-6)');
  await pics(page).first().click();
  await dlg(page).locator('.ao-lb-img').click();
  await zoomed(page);
  await dlg(page).locator('.ao-lb-img').click();
  await fitted(page);
});

test('viewer-6 a double tap zooms (touch)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');
  await pics(page).first().click();
  const box = await dlg(page).locator('.ao-lb-img').boundingBox();
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.touchscreen.tap(x, y);
  await page.touchscreen.tap(x, y);
  await zoomed(page);
});

test('viewer-7 a pinch zooms', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'two-finger touch is sent through the Chromium DevTools protocol');
  await pics(page).first().click();
  const box = await dlg(page).locator('.ao-lb-stage').boundingBox();
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, d) => cdp.send('Input.dispatchTouchEvent', { type,
    touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
  await touch('touchStart', 30);
  for (const d of [50, 80, 110, 140]) await touch('touchMove', d);
  await touch('touchEnd', 0);
  await zoomed(page);
});

test('viewer-8 Esc closes it, and so does Back without leaving the post', async ({ page }) => {
  await pics(page).first().click();
  await page.keyboard.press('Escape');
  await expect(dlg(page)).toBeHidden();
  await pics(page).first().click();
  await expect(dlg(page)).toBeVisible();
  const here = page.url();
  await page.goBack();
  await expect(dlg(page)).toBeHidden();
  expect(page.url()).toBe(here);
});

test('viewer-9 a picture with data-full shows that file', async ({ page }) => {
  const pic = page.locator('[data-post-article] img[data-full][role=button]').first();
  const full = await pic.getAttribute('data-full');
  await pic.click();
  await expect(dlg(page).locator('.ao-lb-orig')).toHaveAttribute('href', full);
  await expect.poll(() => dlg(page).locator('.ao-lb-img').evaluate((i) => new URL(i.src).pathname)).toBe(full);
});

test('viewer-10 pictures in links and in components with their own click are left alone', async ({ page }) => {
  const excluded = await page.locator('[data-post-article]').evaluate((art) => [...art.querySelectorAll('img')]
    .filter((i) => i.closest('a[href], button, ao-slider, ao-pan, ao-model, ao-game, ao-listen, [data-no-zoom]'))
    .map((i) => i.getAttribute('role')));
  expect(excluded.length).toBeGreaterThan(0);
  expect(excluded.every((r) => r !== 'button')).toBe(true);
  const slider = page.locator('ao-slider img').first();
  await slider.scrollIntoViewIfNeeded();
  await slider.click({ force: true });
  await expect(dlg(page)).toBeHidden();
});
