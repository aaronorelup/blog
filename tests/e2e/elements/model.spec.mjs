// <ao-model>: a poster and a button until asked, then three.js and the GLB arrive and a canvas draws. INVENTORY model-*.
import sharp from 'sharp';
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test('model-1 nothing loads before the click, then the canvas renders the model', async ({ page }) => {
  test.slow(); // three.js draws in software here, beside the other workers
  await open(page, pageWith('ao-model'));
  const el = page.locator('ao-model').first();
  const size = await el.getAttribute('size');
  const btn = el.locator('.ao-model-load');
  await expect(btn).toHaveText(new RegExp('Turn it around in 3D' + (size ? '.*' + size.replace(/[.()]/g, '\\$&') : '')));
  await expect(el.locator('canvas')).toHaveCount(0);
  const glb = page.waitForResponse((r) => r.url().endsWith('.glb'));
  await btn.click();
  expect((await glb).status()).toBe(200);
  const canvas = el.locator('canvas.ao-model-canvas');
  await expect(canvas).toBeVisible();
  await expect(el.locator('.ao-model-poster')).toHaveCount(0);
  // A non-blank picture: the drawn pixels vary.
  await expect.poll(async () => {
    const { channels } = await sharp(await canvas.screenshot()).stats();
    return Math.max(...channels.slice(0, 3).map((c) => c.stdev));
  }, { timeout: 60_000 }).toBeGreaterThan(4);
});

test('model-2 a drag turns the model, which stops its own turning and drops the hint', async ({ page }) => {
  await open(page, pageWith('ao-model'));
  const el = page.locator('ao-model').first();
  await el.locator('.ao-model-load').click();
  const canvas = el.locator('canvas.ao-model-canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await expect(el.locator('.ao-model-hint')).toBeVisible();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(el.locator('.ao-model-hint')).toHaveCount(0);
});
