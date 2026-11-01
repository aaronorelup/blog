// <ao-cues>: cuts of one timeline in lockstep beside timed cues; a cue sends every cut there, one cut is heard.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith, expectPlaying, clock } from '../helpers.mjs';

const cues = (page) => page.locator('ao-cues').first();
const vids = (page) => cues(page).locator('video');
const button = (page, name) => cues(page).locator('.ao-cues-bar button', { hasText: name });

test.beforeEach(async ({ page }) => {
  await open(page, pageWith('ao-cues', (a) => a.labels));
  await cues(page).scrollIntoViewIfNeeded();
});

test('cues-1 Play runs every cut together and Pause stops them all', async ({ page }) => {
  await button(page, 'Play').click();
  const n = await vids(page).count();
  for (let i = 0; i < n; i++) await expectPlaying(vids(page).nth(i));
  await expect.poll(() => clock(vids(page).first()), { timeout: 30_000 }).toBeGreaterThan(1);
  for (let i = 1; i < n; i++) {
    expect(Math.abs((await clock(vids(page).nth(i))) - (await clock(vids(page).first())))).toBeLessThan(0.7);
  }
  await button(page, 'Pause').click();
  for (let i = 0; i < n; i++) await expectPlaying(vids(page).nth(i), false);
});

test('cues-2 a cue sends every cut to its time and lights it', async ({ page }) => {
  const li = cues(page).locator('ol > li[data-t]').nth(2);
  const t = await li.evaluate((n) => n.dataset.t.split(':').map(Number).reduce((a, x) => a * 60 + x, 0));
  await li.click();
  await expect(li).toHaveAttribute('aria-current', 'true');
  for (let i = 0; i < await vids(page).count(); i++) {
    await expect.poll(() => clock(vids(page).nth(i))).toBeGreaterThanOrEqual(t - 0.1);
  }
  await expectPlaying(vids(page).first());
});

test('cues-3 the keyboard: Enter on a cue seeks, space on the element toggles', async ({ page }) => {
  const li = cues(page).locator('ol > li[data-t]').nth(1);
  await li.focus();
  await page.keyboard.press('Enter');
  await expect(li).toHaveAttribute('aria-current', 'true');
  await expectPlaying(vids(page).first());
  await vids(page).first().focus();
  await page.keyboard.press(' ');
  await expectPlaying(vids(page).first(), false);
});

test('cues-4 one Sound button per cut picks the one heard', async ({ page }) => {
  const sound = cues(page).locator('.ao-cues-bar button', { hasText: 'Sound:' });
  test.skip(await sound.count() < 2, 'one cut only');
  await sound.nth(1).click();
  await expect(sound.nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect(await vids(page).evaluateAll((vs) => vs.map((v) => v.muted))).toEqual([true, false, ...Array(Math.max(0, (await vids(page).count()) - 2)).fill(true)]);
});

test('cues-5 the scrubber seeks every cut', async ({ page }) => {
  await vids(page).first().evaluate((m) => new Promise((r) => (m.readyState ? r() : m.addEventListener('loadedmetadata', r, { once: true }))));
  await cues(page).locator('.ao-cues-bar input[type=range]').evaluate((r) => {
    r.value = String(Math.min(5, parseFloat(r.max) / 2));
    r.dispatchEvent(new Event('input', { bubbles: true }));
  });
  for (let i = 0; i < await vids(page).count(); i++) await expect.poll(() => clock(vids(page).nth(i))).toBeGreaterThan(1);
});
