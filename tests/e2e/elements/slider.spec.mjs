// <ao-slider>: a divider dragged or keyed between two pictures, labels from the attribute, Full size opens both.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test.beforeEach(async ({ page }) => open(page, pageWith('ao-slider', (a) => a.labels)));
const slider = (page) => page.locator('ao-slider[labels]').first();
const pos = (el) => el.evaluate((n) => parseFloat(n.style.getPropertyValue('--ao-pos')));

test('slider-1 labels name the two sides and the divider starts at start (50)', async ({ page }) => {
  const el = slider(page);
  const [a, b] = (await el.getAttribute('labels')).split('|');
  await expect(el.locator('.ao-slider-tag-a')).toHaveText(a);
  await expect(el.locator('.ao-slider-tag-b')).toHaveText(b);
  expect(await pos(el)).toBe(parseFloat((await el.getAttribute('start')) || '50'));
});

test('slider-2 the keys move the divider', async ({ page }) => {
  const el = slider(page);
  const range = el.locator('.ao-slider-range');
  const before = await pos(el);
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  expect(await pos(el)).toBeGreaterThan(before);
  await page.keyboard.press('Home');
  expect(await pos(el)).toBe(0);
});

test('slider-3 dragging moves the divider', async ({ page }) => {
  const el = slider(page);
  await el.scrollIntoViewIfNeeded();
  const box = await el.locator('.ao-slider-range').boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, y, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => pos(el)).toBeLessThan(35);
});

test('slider-4 Full size opens both pictures in the viewer', async ({ page }) => {
  await slider(page).locator('.ao-slider-zoom').click();
  const dlg = page.locator('dialog.ao-lb');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('.ao-lb-count')).toHaveText('1 / 2');
});
