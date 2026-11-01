// <ao-ask>: questions put to a connection, as <details>; one open at a time, a filter per connection, the question
// copied on a click.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const el = (page) => page.locator('ao-ask').first();
test.beforeEach(async ({ page }) => open(page, pageWith('ao-ask')));

test('ask-1 a question expands, and opening another closes it', async ({ page }) => {
  const items = el(page).locator('details');
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});

test('ask-2 the filter shows one connection’s questions, All shows every one', async ({ page }) => {
  const bar = el(page).locator('.ao-ask-filter');
  test.skip(!(await bar.count()), 'one connection');
  const pick = bar.locator('button').nth(1);
  const via = await pick.getAttribute('data-via');
  await pick.click();
  await expect(pick).toHaveAttribute('aria-pressed', 'true');
  const shown = await el(page).locator('details:not([hidden])').evaluateAll((ds) => ds.map((d) => d.dataset.via));
  expect(shown.length).toBeGreaterThan(0);
  expect(shown.every((v) => v === via)).toBe(true);
  await bar.locator('button').first().click();
  await expect(el(page).locator('details[hidden]')).toHaveCount(0);
});

test('ask-3 Copy the question writes it to the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const d = el(page).locator('details').first();
  await d.locator('summary').click();
  const copy = d.locator('.ao-ask-copy');
  await copy.click();
  await expect(copy).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe((await d.locator('.ao-ask-q').textContent()).trim());
});
