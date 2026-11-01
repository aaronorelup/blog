// <ao-runs>: a table of agent runs drawn as bars on a time axis, packed per phase; pointing, focusing or clicking a
// bar names it, the arrow keys and Home/End walk the bars, leaving the chart clears the readout.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test.beforeEach(async ({ page }) => open(page, pageWith('ao-runs')));
const el = (page) => page.locator('ao-runs').first();
const read = (page) => el(page).locator('.ao-runs-read');

test('runs-1 one bar per valid table row, a summary and an axis', async ({ page }) => {
  const rows = await el(page).locator('table tbody tr').count();
  const bars = await el(page).locator('.ao-runs-bar').count();
  expect(bars).toBeGreaterThan(0);
  expect(bars).toBeLessThanOrEqual(rows);
  await expect(el(page).locator('.ao-runs-sum')).toContainText(/\d+ agents?/);
  expect(await el(page).locator('.ao-runs-tick').count()).toBeGreaterThan(1);
});

test('runs-2 pointing at a bar names it, leaving the chart clears it, a click names it', async ({ page }) => {
  const idle = await read(page).textContent();
  const bar = el(page).locator('.ao-runs-bar').first();
  const label = (await bar.getAttribute('aria-label')).split(',')[0];
  await bar.hover();
  await expect(read(page).locator('b')).toHaveText(label);
  await expect(bar).toHaveClass(/is-on/);
  await page.mouse.move(0, 0);
  await expect(read(page)).toHaveText(idle);
  await bar.click();
  await expect(read(page).locator('b')).toHaveText(label);
});

test('runs-3 focus and the arrow keys, Home and End walk the bars', async ({ page }) => {
  const bars = el(page).locator('.ao-runs-bar');
  const n = await bars.count();
  await el(page).locator('.ao-runs-bar[tabindex="0"]').focus();
  const at = async () => (await read(page).locator('b').textContent());
  const first = await at();
  await page.keyboard.press('ArrowRight');
  if (n > 1) await expect.poll(at).not.toBe(first);
  await page.keyboard.press('End');
  const on = el(page).locator('.ao-runs-bar.is-on');
  await expect(on).toBeFocused();
  expect((await on.getAttribute('aria-label')).startsWith(await at())).toBe(true);
  await page.keyboard.press('Home');
  await expect.poll(at).toBe(first);
});
