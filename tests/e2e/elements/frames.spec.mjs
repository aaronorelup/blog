// <ao-frames>: frame-by-frame stepping (buttons and arrow keys), named marks, play and quarter speed.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith, expectPlaying } from '../helpers.mjs';

test.beforeEach(async ({ page }) => {
  await open(page, pageWith('ao-frames', (a) => a.marks));
  const v = page.locator('ao-frames[marks] > video').first();
  await v.scrollIntoViewIfNeeded();
  await v.evaluate((m) => { m.muted = true; m.preload = 'auto'; m.load(); });
  await v.evaluate((m) => new Promise((r) => (m.readyState ? r() : m.addEventListener('loadedmetadata', r, { once: true }))));
});
const el = (page) => page.locator('ao-frames[marks]').first();
const frame = async (page) => parseInt((await el(page).locator('.ao-frames-count').textContent()).match(/frame (\d+)/)[1], 10);

test('frames-1 a mark jumps to its frame, the buttons step one frame', async ({ page }) => {
  const n = parseInt((await el(page).getAttribute('marks')).split('|')[0], 10);
  await el(page).locator('.ao-frames-mark').first().click();
  await expect.poll(() => frame(page)).toBe(n);
  await el(page).getByRole('button', { name: 'frame ›' }).click();
  await expect.poll(() => frame(page)).toBe(n + 1);
  await el(page).getByRole('button', { name: '‹ frame' }).click();
  await expect.poll(() => frame(page)).toBe(n);
});

test('frames-2 arrow keys on the video step frames', async ({ page }) => {
  await el(page).locator('.ao-frames-mark').nth(1).click();
  const start = await expect.poll(() => frame(page)).toBeGreaterThan(0).then(() => frame(page));
  await el(page).locator('video').focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => frame(page)).toBe(start + 1);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => frame(page)).toBe(start);
});

test('frames-3 play toggles, quarter speed sets the rate', async ({ page }) => {
  const v = el(page).locator('video');
  await el(page).getByRole('button', { name: 'Play' }).click();
  await expectPlaying(v);
  await expect(el(page).getByRole('button', { name: 'Pause' })).toBeVisible();
  const slow = el(page).getByRole('button', { name: '¼ speed' });
  await slow.click();
  expect(await v.evaluate((m) => m.playbackRate)).toBe(0.25);
  await expect(slow).toHaveAttribute('aria-pressed', 'true');
  await slow.click();
  expect(await v.evaluate((m) => m.playbackRate)).toBe(1);
});
