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

test('viewer-2 Enter or Space on a focused picture opens it', async ({ page }) => {
  await pics(page).first().focus();
  await page.keyboard.press('Enter');
  await expect(dlg(page)).toBeVisible();
  await expect(count(page)).toHaveText(/^1 \//);
  await page.keyboard.press('Escape');
  await pics(page).nth(1).focus();
  await page.keyboard.press(' ');
  await expect(count(page)).toHaveText(/^2 \//);
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

test('viewer-4 the keys zoom (+, -, 1, 0) and page (PageDown, PageUp)', async ({ page }) => {
  await pics(page).first().click();
  const n = await total(page);
  await page.keyboard.press('+');
  await zoomed(page);
  await page.keyboard.press('-');
  await fitted(page);
  await page.keyboard.press('=');
  await zoomed(page);
  await page.keyboard.press('0');
  await fitted(page);
  await page.keyboard.press('1');
  await expect(dlg(page).locator('.ao-lb-zoom')).not.toHaveText('fit');
  await page.keyboard.press('0');
  await page.keyboard.press('PageDown');
  await expect(count(page)).toHaveText(`2 / ${n}`);
  await page.keyboard.press('PageUp');
  await expect(count(page)).toHaveText(`1 / ${n}`);
});

test('viewer-11 the toolbar zooms in, out and back to fit, links the file and closes', async ({ page, isMobile }) => {
  await pics(page).first().click();
  const bar = dlg(page).locator('.ao-lb-tools');
  // A phone hides + and − (it pinches); fit, the file link and close stay.
  if (!isMobile) {
    await bar.locator('[data-act="in"]').click();
    await zoomed(page);
    await bar.locator('[data-act="out"]').click();
    await fitted(page);
  }
  await bar.locator('[data-act="fit"]').click();
  await zoomed(page);
  await bar.locator('[data-act="fit"]').click();
  await fitted(page);
  await expect(bar.locator('.ao-lb-orig')).toHaveAttribute('href', /\S/);
  await bar.locator('[data-act="close"]').click();
  await expect(dlg(page)).toBeHidden();
});

test('viewer-12 ao-stop closes it (the homepage closing its reader)', async ({ page }) => {
  await pics(page).first().click();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('ao-stop')));
  await expect(dlg(page)).toBeHidden();
});

test('viewer-4b the wheel zooms', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no wheel on a phone');
  await pics(page).first().click();
  const box = await dlg(page).locator('.ao-lb-img').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -400);
  await zoomed(page);
});

test('viewer-5 a click on the picture zooms there, a drag pans, a second click fits, a click beside it closes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch uses the double tap (viewer-6) and swipes (viewer-13)');
  await pics(page).first().click();
  const img = dlg(page).locator('.ao-lb-img');
  await img.click();
  await zoomed(page);
  const before = await img.evaluate((i) => i.style.transform);
  const box = await dlg(page).locator('.ao-lb-stage').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => img.evaluate((i) => i.style.transform)).not.toBe(before);
  await img.click();
  await fitted(page);
  // The dark around the picture: beside it if it is letterboxed sideways, else above it.
  await expect.poll(async () => (await img.boundingBox()).width).toBeLessThanOrEqual(box.width + 1);
  const pic = await img.boundingBox();
  const beside = pic.x - box.x > pic.y - box.y;
  const at = beside ? [box.x + (pic.x - box.x) / 2, box.y + box.height / 2] : [box.x + box.width / 2, box.y + (pic.y - box.y) / 2];
  await page.mouse.click(...at);
  await expect(dlg(page)).toBeHidden();
});

test('viewer-13 a swipe sideways pages, a swipe down closes (touch)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'touch gestures are sent through the Chromium DevTools protocol');
  await pics(page).first().click();
  const n = await total(page);
  const box = await dlg(page).locator('.ao-lb-stage').boundingBox();
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (dx, dy) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
    for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + (dx * k) / 5, y: cy + (dy * k) / 5, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(-160, 0);
  await expect(count(page)).toHaveText(`2 / ${n}`);
  await swipe(160, 0);
  await expect(count(page)).toHaveText(`1 / ${n}`);
  await swipe(0, 200);
  await expect(dlg(page)).toBeHidden();
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

test('viewer-14 a resize keeps the picture the size it was on screen, and fit then fits the new window', async ({ page }) => {
  await pics(page).first().click();
  const img = dlg(page).locator('.ao-lb-img');
  const box = async (l) => (await l.boundingBox()) || { width: 0, height: 0 };
  await expect.poll(async () => (await box(img)).width).toBeGreaterThan(0);
  const before = await box(img);
  const size = page.viewportSize();
  await page.setViewportSize({ width: Math.round(size.width * 0.6), height: Math.round(size.height * 0.6) });
  await expect.poll(async () => (await box(dlg(page).locator('.ao-lb-stage'))).width).toBeLessThanOrEqual(size.width * 0.6 + 1);
  await expect.poll(async () => Math.abs((await box(img)).width - before.width)).toBeLessThan(2);
  await page.keyboard.press('0');
  const stage = await box(dlg(page).locator('.ao-lb-stage'));
  await expect.poll(async () => {
    const b = await box(img);
    return b.width <= stage.width + 1 && b.height <= stage.height + 1;
  }).toBe(true);
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
