// <ao-bars>: a table drawn as bars: one row per table row, widths against max, values with the unit, a legend for
// several series; the table stays for screen readers.
import { test, expect } from '../fixtures.mjs';
import { open, openFirst, pageWith, pagesWith } from '../helpers.mjs';

test('bars-1 every table row becomes a bar of the right width, labelled with its value and unit', async ({ page }) => {
  await open(page, pageWith('ao-bars', (a) => a.unit && a.max));
  const el = page.locator('ao-bars[unit][max]').first();
  const rows = await el.locator('table tbody tr').count();
  await expect(el.locator('.ao-bars-row')).toHaveCount(rows);
  await expect(el.locator('table')).toHaveClass(/ao-bars-table/);
  const max = parseFloat(await el.getAttribute('max'));
  const unit = await el.getAttribute('unit');
  const first = el.locator('.ao-bars-row').first();
  const value = parseFloat((await first.locator('.ao-bars-val').first().textContent()).replace(/[^0-9.\-]/g, ''));
  await expect(first.locator('.ao-bars-val').first()).toContainText(unit);
  const w = await first.locator('.ao-bars-bar').first().evaluate((b) => parseFloat(b.style.getPropertyValue('--w')));
  expect(w).toBeCloseTo(Math.min(1, value / max), 3);
});

test('bars-2 several series get a legend, one key per series', async ({ page }) => {
  const i = await openFirst(page, pagesWith('ao-bars'), (p) => p.locator('ao-bars').evaluateAll((els) =>
    els.findIndex((e) => e.querySelectorAll('table thead th').length > 2)));
  const el = page.locator('ao-bars').nth(i);
  await expect(el.locator('.ao-bars-legend .ao-bars-key')).toHaveCount(await el.locator('table thead th').count() - 1);
});
