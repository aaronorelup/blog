// <ao-blind>: rows of pictures judged blind (labels hidden, order shuffled), one pick per row, then Reveal shows the
// labels, the reference verdicts and a tally of the picks.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test('blind-1 judge blind, pick in each row, reveal', async ({ page }) => {
  await open(page, pageWith('ao-blind'));
  const el = page.locator('ao-blind').first();
  const bar = el.locator('.ao-blind-bar');
  await bar.getByRole('button', { name: 'Judge blind' }).click();
  await expect(el).toHaveClass(/is-blind/);
  await expect(el.locator('img[data-no-zoom]').first()).toBeAttached();
  await expect(el.locator('.ao-blind-status')).toContainText('0 of');
  const rows = el.locator('.ao-blind-row');
  for (let i = 0; i < await rows.count(); i++) {
    const pick = rows.nth(i).locator('.ao-blind-pick').first();
    await pick.click();
    await expect(pick).toHaveAttribute('aria-pressed', 'true');
  }
  await bar.getByRole('button', { name: 'Reveal' }).click();
  await expect(el).toHaveClass(/is-revealed/);
  await expect(el.locator('.ao-blind-status')).toContainText('Your picks:');
  if (await el.locator('figure[data-verdict]').count()) await expect(el.locator('.ao-blind-verdict').first()).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Judge blind again' })).toBeVisible();
});

test('blind-2 in blind mode a click on a picture picks it instead of opening the viewer', async ({ page }) => {
  await open(page, pageWith('ao-blind'));
  const el = page.locator('ao-blind').first();
  await el.locator('.ao-blind-bar').getByRole('button', { name: 'Judge blind' }).click();
  const fig = el.locator('.ao-blind-row').first().locator('figure').first();
  await fig.locator('img').click();
  await expect(fig).toHaveClass(/is-picked/);
  await expect(page.locator('dialog.ao-lb[open]')).toHaveCount(0);
});
