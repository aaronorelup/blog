// <ao-transcript>: each video's captions as a clickable transcript; a line seeks and plays, the current line follows
// playback, and the search box and find chips mark every hit.
import { test, expect } from '../fixtures.mjs';
import { open, openFirst, pageWith, pagesWith, expectPlaying, clock, seekTo } from '../helpers.mjs';

const el = (page) => page.locator('ao-transcript[find]').first();
test.beforeEach(async ({ page }) => {
  await open(page, pageWith('ao-transcript', (a) => a.find));
  await el(page).scrollIntoViewIfNeeded();
  await expect(el(page).locator('.ao-tr-text span[role=button]').first()).toBeVisible();
});

test('transcript-1 a line seeks its video there, plays it and lights the line', async ({ page }) => {
  const line = el(page).locator('.ao-tr-text').first().locator('span[role=button]').nth(5);
  const v = el(page).locator('figure video').first();
  await v.evaluate((m) => { m.muted = true; });
  await line.click();
  await expect(line).toHaveAttribute('aria-current', 'true');
  await expectPlaying(v);
  const [m, s] = (await line.getAttribute('title')).split(':').map(Number);
  expect(await clock(v)).toBeGreaterThanOrEqual(m * 60 + s - 0.1);
});

test('transcript-2 the lit line follows the video', async ({ page }) => {
  const v = el(page).locator('figure video').first();
  const box = el(page).locator('.ao-tr-text').first();
  await v.evaluate((m) => new Promise((r) => { m.preload = 'auto'; m.readyState ? r() : m.addEventListener('loadedmetadata', r, { once: true }); m.load(); }));
  await seekTo(v, 60);
  const lit = box.locator('[aria-current="true"]');
  await expect(lit).toHaveCount(1);
  const first = await lit.getAttribute('title');
  await seekTo(v, 120);
  await expect.poll(() => lit.getAttribute('title')).not.toBe(first);
});

test('transcript-3 a find chip marks every hit and says how many; again clears it', async ({ page }) => {
  const chip = el(page).locator('.ao-tr-bar button').first();
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  expect(await el(page).locator('.ao-tr-text mark').count()).toBeGreaterThan(0);
  await expect(el(page).locator('.ao-tr-count').first()).toContainText(/times?$/);
  await chip.click();
  await expect(el(page).locator('.ao-tr-text mark')).toHaveCount(0);
  await el(page).locator('.ao-tr-bar input[type=search]').fill('the');
  expect(await el(page).locator('.ao-tr-text mark').count()).toBeGreaterThan(0);
});

test('transcript-4 one pane playing pauses the other', async ({ page }) => {
  const i = await openFirst(page, pagesWith('ao-transcript'), (p) => p.locator('ao-transcript').evaluateAll((els) =>
    els.findIndex((e) => e.querySelectorAll(':scope figure video').length > 1)));
  const tr = page.locator('ao-transcript').nth(i);
  await tr.scrollIntoViewIfNeeded();
  const vs = tr.locator('figure video');
  const lines = tr.locator('.ao-tr-text');
  await expect(lines.nth(1).locator('span[role=button]').first()).toBeVisible();
  await vs.evaluateAll((all) => all.forEach((m) => { m.muted = true; }));
  await lines.nth(0).locator('span[role=button]').nth(2).click();
  await expectPlaying(vs.nth(0));
  await lines.nth(1).locator('span[role=button]').nth(2).click();
  await expectPlaying(vs.nth(1));
  await expectPlaying(vs.nth(0), false);
});

test('transcript-5 Enter on a line seeks there; hiding the element pauses its video', async ({ page }) => {
  const v = el(page).locator('figure video').first();
  await v.evaluate((m) => { m.muted = true; });
  const line = el(page).locator('.ao-tr-text').first().locator('span[role=button]').nth(3);
  await line.focus();
  await page.keyboard.press('Enter');
  await expect(line).toHaveAttribute('aria-current', 'true');
  await expectPlaying(v);
  await el(page).evaluate((n) => { n.style.display = 'none'; });
  await expectPlaying(v, false);
});
