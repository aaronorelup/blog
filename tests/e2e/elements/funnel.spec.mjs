// <ao-funnel>: an ordered list of steps that each take some away, drawn as a bar of segments and rows; a row and its
// segment light together (pointer and focus), "What's in it" opens a row's examples.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const el = (page) => page.locator('ao-funnel').first();
test.beforeEach(async ({ page }) => open(page, pageWith('ao-funnel')));

test('funnel-1 a total row, one row per step, a segment per step and a summary with the unit', async ({ page }) => {
  const steps = await el(page).locator(':scope > ol > li').count();
  await expect(el(page).locator('.ao-funnel-row')).toHaveCount(steps);
  await expect(el(page).locator('.ao-funnel-row').first()).toHaveClass(/is-total/);
  const unit = await el(page).getAttribute('unit');
  if (unit) await expect(el(page).locator('.ao-funnel-sum')).toContainText(unit);
});

test('funnel-2 pointing at a row lights it and its segment; pointing at the segment does too', async ({ page }) => {
  const row = el(page).locator('.ao-funnel-row').nth(1);
  await row.hover();
  await expect(row).toHaveClass(/is-on/);
  await expect(el(page).locator('.ao-funnel-seg.is-on')).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(el(page).locator('.ao-funnel-seg.is-on')).toHaveCount(0);
  await el(page).locator('.ao-funnel-seg').first().hover({ force: true });
  await expect(el(page).locator('.ao-funnel-row.is-on')).toHaveCount(1);
});

test('funnel-3 focus inside a row lights it, and leaving clears it', async ({ page }) => {
  const more = el(page).locator('.ao-funnel-more').first();
  await more.focus();
  await expect(el(page).locator('.ao-funnel-row.is-on')).toHaveCount(1);
  await more.blur();
  await expect(el(page).locator('.ao-funnel-row.is-on')).toHaveCount(0);
});

test('funnel-4 What’s in it opens and closes the examples', async ({ page }) => {
  const more = el(page).locator('.ao-funnel-more').first();
  const ex = more.locator('xpath=following-sibling::*[contains(@class,"ao-funnel-ex")][1]');
  await expect(ex).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(ex).toBeVisible();
  await more.click();
  await expect(ex).toBeHidden();
});
