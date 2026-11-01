// <ao-fetch>: each row sends its real request to this site and prints the live status and headers (and the body, with
// data-show); Send all runs them.
import { test, expect } from '../fixtures.mjs';
import { open, openFirst, pageWith, pagesWith } from '../helpers.mjs';

const rows = (page) => page.locator('ao-fetch').first().locator('li[data-url]');
const send = async (row) => {
  await expect(row.locator('.ao-fetch-out')).toHaveText('Not sent yet.');
  await row.getByRole('button', { name: 'Send it' }).click();
  await expect(row.locator('.ao-fetch-out')).toHaveText(/^HTTP \d{3}/, { timeout: 30_000 });
  await expect(row.locator('.ao-fetch-out')).toContainText('Time: ');
  await expect(row.getByRole('button', { name: 'Send it again' })).toBeEnabled();
  return row.locator('.ao-fetch-out');
};
const has = (sel) => (page) => page.locator(sel).count().then((n) => n > 0);

test('fetch-1 a row sends its request and shows the live status line and headers; a ranged row gets 206', async ({ page }) => {
  await openFirst(page, pagesWith('ao-fetch'), has('ao-fetch li[data-range]'));
  await expect(await send(page.locator('ao-fetch li[data-url][data-range]').first())).toHaveText(/^HTTP 206/);
});

test('fetch-2 Send all runs every row', async ({ page }) => {
  await open(page, pageWith('ao-fetch'));
  const all = page.locator('ao-fetch').first().locator('.ao-fetch-all');
  test.skip(!(await all.count()), 'a single row');
  await all.click();
  const n = await rows(page).count();
  for (let i = 0; i < n; i++) await expect(rows(page).nth(i).locator('.ao-fetch-out')).toHaveText(/^HTTP \d{3}/, { timeout: 30_000 });
});

test('fetch-3 a data-show="body" row prints the start of what came back', async ({ page }) => {
  await openFirst(page, pagesWith('ao-fetch'), has('ao-fetch li[data-show="body"]'));
  const row = page.locator('ao-fetch li[data-url][data-show="body"]').first();
  const body = await (await page.request.get(await row.getAttribute('data-url'))).text();
  await expect(await send(row)).toContainText(body.split('\n').map((l) => l.trim()).find((l) => l.length > 8));
});
