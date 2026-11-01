// <ao-shots>: a strip of shots under one video; a shot seeks there and plays, the current shot is lit, arrows move.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith, expectPlaying, clock } from '../helpers.mjs';

test('shots-1 a shot seeks the video there and plays, and that shot is lit', async ({ page }) => {
  await open(page, pageWith('ao-shots'));
  const el = page.locator('ao-shots').first();
  await el.scrollIntoViewIfNeeded();
  const v = el.locator('video').first();
  await v.evaluate((m) => { m.muted = true; });
  const shot = el.locator('.ao-shots-btn').nth(2);
  const t = await el.locator('li[data-t]').nth(2).evaluate((li) => li.dataset.t.split(':').map(Number).reduce((a, x) => a * 60 + x, 0));
  await shot.click();
  await expectPlaying(v);
  expect(await clock(v)).toBeGreaterThanOrEqual(t);
  await expect(shot).toHaveAttribute('aria-current', 'true');
  await v.evaluate((m) => m.pause());
  await shot.focus();
  await page.keyboard.press('ArrowRight');
  await expect(el.locator('.ao-shots-btn').nth(3)).toBeFocused();
});
