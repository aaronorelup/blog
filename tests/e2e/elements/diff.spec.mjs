// <ao-diff>: each earlier version shown against the last, word by word; the last shown as it stands.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test('diff-1 the buttons switch between word diffs and the final text', async ({ page }) => {
  await open(page, pageWith('ao-diff'));
  const el = page.locator('ao-diff').first();
  const buttons = el.locator('.ao-diff-bar button');
  const n = await el.locator(':scope > blockquote').count();
  await expect(buttons).toHaveCount(n);
  await expect(el.locator(':scope > blockquote').first()).toBeHidden();
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  expect(await el.locator('.ao-diff-view').locator('del, ins').count()).toBeGreaterThan(0);
  await expect(el.locator('.ao-diff-legend')).toContainText('Struck through');
  await buttons.last().click();
  await expect(buttons.last()).toHaveAttribute('aria-pressed', 'true');
  await expect(el.locator('.ao-diff-view').locator('del, ins')).toHaveCount(0);
  await expect(el.locator('.ao-diff-legend')).toContainText('as it stands');
});
