// <ao-cues>: cuts of one timeline in lockstep beside timed cues; a cue sends every cut there, one cut is heard.
import { test, expect } from '../fixtures.mjs';
import { open, lightestWith, expectPlaying, playing, clock, smallVideo } from '../helpers.mjs';

const cues = (page) => page.locator('ao-cues').first();
const vids = (page) => cues(page).locator('video');
const button = (page, name) => cues(page).locator('.ao-cues-bar button', { hasText: name });

// Every test streams the same two films; one at a time, so they don't share the line with each other.
test.describe.configure({ mode: 'default' });
test.beforeEach(async ({ page }) => {
  await open(page, lightestWith('ao-cues', (a) => a.labels));
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

test('cues-3 Enter on a cue seeks there and plays', async ({ page }) => {
  const li = cues(page).locator('ol > li[data-t]').nth(1);
  await li.focus();
  await page.keyboard.press('Enter');
  await expect(li).toHaveAttribute('aria-current', 'true');
  await expectPlaying(vids(page).first());
});

test('cues-3b space on a focused cut plays and pauses them all', async ({ page }) => {
  await vids(page).first().focus();
  await page.keyboard.press(' ');
  await expect.poll(() => playing(vids(page).first()), { timeout: 8000 }).toBe(true);
  await page.keyboard.press(' ');
  await expectPlaying(vids(page).first(), false);
});

test('cues-4 one Sound button per cut picks the one heard', async ({ page }) => {
  const sound = cues(page).locator('.ao-cues-bar button', { hasText: 'Sound:' });
  await expect(sound).toHaveCount(await vids(page).count());
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

test('cues-6 a cut that runs out of video holds the others until it has caught up', async ({ page }) => {
  await button(page, 'Play').click();
  const [lead, follower] = [vids(page).first(), vids(page).last()];
  await expectPlaying(lead);
  // The follower really has data, so the stall is the only one: the element resumes once it reports ready.
  await expect.poll(() => follower.evaluate((v) => v.readyState >= 3 && !v.seeking), { timeout: 30_000 }).toBe(true);
  await follower.evaluate((v) => v.dispatchEvent(new Event('waiting')));
  await expect(cues(page).locator('.ao-cues-clock')).toHaveText('loading…');
  await expectPlaying(lead, false);
  await follower.evaluate((v) => v.dispatchEvent(new Event('playing')));
  await expectPlaying(lead);
});

test('cues-7 a click on a video plays or pauses every cut', async ({ page }) => {
  await vids(page).first().click();
  await expectPlaying(vids(page).first());
  await expectPlaying(vids(page).last());
  await vids(page).last().click();
  await expectPlaying(vids(page).first(), false);
});

test('cues-8 a cut paused from outside stops them all; the end of the lead stops them', async ({ page }) => {
  await button(page, 'Play').click();
  await expectPlaying(vids(page).last());
  await vids(page).last().evaluate((v) => v.pause());
  await expectPlaying(vids(page).first(), false);
  await expect(button(page, 'Play')).toBeVisible();
  await vids(page).first().evaluate((v) => { v.currentTime = v.duration - 0.4; });
  await button(page, 'Play').click();
  await expect(button(page, 'Play')).toBeVisible({ timeout: 20_000 });
  await expectPlaying(vids(page).last(), false);
});

test('cues-9 another player starting stops the cuts', async ({ page }) => {
  await button(page, 'Play').click();
  await expectPlaying(vids(page).first());
  await page.evaluate((src) => {
    const v = document.createElement('video');
    v.id = 'other'; v.muted = true; v.loop = true; v.playsInline = true; v.src = src;
    v.style.cssText = 'position:fixed;right:0;bottom:0;width:120px;z-index:9';
    document.body.append(v);
    return v.play();
  }, smallVideo);
  await expectPlaying(vids(page).first(), false);
  await expectPlaying(vids(page).last(), false);
});
