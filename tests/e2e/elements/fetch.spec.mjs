// <ao-fetch>: each row sends its real request to this site and prints the live status and headers; Send all runs them.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test.beforeEach(async ({ page }) => open(page, pageWith('ao-fetch')));
const rows = (page) => page.locator('ao-fetch').first().locator('li[data-url]');

test('fetch-1 a row sends its request and shows the live status line and headers', async ({ page }) => {
  const row = rows(page).first();
  await expect(row.locator('.ao-fetch-out')).toHaveText('Not sent yet.');
  await row.getByRole('button', { name: 'Send it' }).click();
  await expect(row.locator('.ao-fetch-out')).toHaveText(/^HTTP \d{3}/, { timeout: 30_000 });
  await expect(row.locator('.ao-fetch-out')).toContainText('Time: ');
  const range = await row.getAttribute('data-range');
  if (range) await expect(row.locator('.ao-fetch-out')).toContainText('HTTP 206');
  await expect(row.getByRole('button', { name: 'Send it again' })).toBeEnabled();
});

test('fetch-2 Send all runs every row', async ({ page }) => {
  const all = page.locator('ao-fetch').first().locator('.ao-fetch-all');
  test.skip(!(await all.count()), 'a single row');
  await all.click();
  const n = await rows(page).count();
  for (let i = 0; i < n; i++) await expect(rows(page).nth(i).locator('.ao-fetch-out')).toHaveText(/^HTTP \d{3}/, { timeout: 30_000 });
});
