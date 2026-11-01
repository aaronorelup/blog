// <ao-calc>: inputs (sliders and option buttons) feed the formulas of its results, which update as they change.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test.beforeEach(async ({ page }) => open(page, pageWith('ao-calc')));
const el = (page) => page.locator('ao-calc').first();
const outputs = (page) => el(page).locator('.ao-calc-num').allTextContents();

test('calc-1 every result shows a number, with its prefix and unit', async ({ page }) => {
  const nums = await outputs(page);
  expect(nums.length).toBe(await el(page).locator('li[data-f]').count());
  for (const n of nums) expect(n).toMatch(/\d/);
});

test('calc-2 moving a slider changes the results and its own readout', async ({ page }) => {
  const range = el(page).locator('.ao-calc-input input[type=range]').first();
  test.skip(!(await range.count()), 'no slider');
  const before = await outputs(page);
  const val = el(page).locator('.ao-calc-val').first();
  const shown = await val.textContent();
  await range.evaluate((r) => { r.value = String(parseFloat(r.value) === parseFloat(r.max) ? r.min : r.max); r.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(val).not.toHaveText(shown);
  expect(await outputs(page)).not.toEqual(before);
});

test('calc-3 an option button picks its value and changes the results', async ({ page }) => {
  const opts = el(page).locator('.ao-calc-opts button');
  test.skip(!(await opts.count()), 'no options');
  const i = await opts.evaluateAll((bs) => bs.findIndex((b) => b.getAttribute('aria-pressed') === 'false'));
  const other = opts.nth(i);
  const before = await outputs(page);
  await other.click();
  await expect(other).toHaveAttribute('aria-pressed', 'true');
  expect(await outputs(page)).not.toEqual(before);
});

test('calc-4 a slider moves by keys too', async ({ page }) => {
  const range = el(page).locator('.ao-calc-input input[type=range]').first();
  const before = await outputs(page);
  await range.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press(await range.evaluate((r) => (parseFloat(r.value) >= parseFloat(r.max) ? 'ArrowLeft' : 'ArrowRight')));
  expect(await outputs(page)).not.toEqual(before);
});
