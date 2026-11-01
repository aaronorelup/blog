// <ao-compare>: the grid takes cols and aspect; with sync its videos play, pause and seek in step. INVENTORY compare-*.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith, play, expectPlaying, clock } from '../helpers.mjs';

test('compare-1 cols and aspect shape the grid', async ({ page }) => {
  await open(page, pageWith('ao-compare', (a) => a.aspect && a.cols));
  const el = page.locator('ao-compare[aspect][cols]').first();
  const [cols, aspect] = await el.evaluate((n) => [n.style.getPropertyValue('--ao-cols'), n.style.getPropertyValue('--ao-aspect')]);
  expect(cols).toBe(await el.getAttribute('cols'));
  expect(aspect).toBe(await el.getAttribute('aspect'));
});

test.describe('compare sync', () => {
  test.beforeEach(async ({ page }) => open(page, pageWith('ao-compare', (a) => 'sync' in a)));
  const videos = (page) => page.locator('ao-compare[sync]').first().locator('video');

  test('compare-2 play and pause in step', async ({ page }) => {
    const v = videos(page);
    await play(v.first());
    for (const i of [1, 2].slice(0, (await v.count()) - 1)) await expectPlaying(v.nth(i));
    await v.first().evaluate((m) => m.pause());
    for (const i of [1, 2].slice(0, (await v.count()) - 1)) await expectPlaying(v.nth(i), false);
  });

  test('compare-3 a seek moves every video there', async ({ page }) => {
    const v = videos(page);
    await v.first().evaluate((m) => new Promise((r) => (m.readyState ? r() : m.addEventListener('loadedmetadata', r, { once: true }))));
    await v.first().evaluate((m) => { m.currentTime = Math.min(2, m.duration / 2); });
    await expect.poll(() => clock(v.first())).toBeGreaterThan(0.5);
    for (let i = 1; i < await v.count(); i++) {
      await expect.poll(async () => Math.abs((await clock(v.nth(i))) - (await clock(v.first())))).toBeLessThan(0.1);
    }
  });
});
