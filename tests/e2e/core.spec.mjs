// The players every post shares (post-components.js, "One player at a time"): one player at a time, sync groups,
// pausing off screen, the now-playing bar, ao-stop and same-origin iframes. INVENTORY.md rows core-1 to core-9.
import { test, expect } from './fixtures.mjs';
import {
  targets, pagesWhere, pageWith, pagesWith, open, play, playing, expectPlaying, scrollAway, scrollBack, inView, loneMedia,
  smallVideo,
} from './helpers.mjs';

const twoLone = pagesWhere((p) => p.kind === 'post' && p.lone >= 2)[0];
const syncPage = pageWith('ao-compare', (a) => 'sync' in a);
const twoListens = pagesWith('ao-listen').find((p) => targets.pages[p].ao['ao-listen'] >= 2);

test('core-1 starting a lone player pauses the one playing', async ({ page }) => {
  await open(page, twoLone);
  const [a, b] = [loneMedia(page).nth(0), loneMedia(page).nth(1)];
  await play(a);
  await expectPlaying(a);
  await play(b);
  await expectPlaying(b);
  await expectPlaying(a, false);
});

test('core-2 a sync group plays together, and a lone player pauses it', async ({ page }) => {
  await open(page, syncPage);
  const group = page.locator('ao-compare[sync]').first();
  const vids = group.locator('video');
  expect(await vids.count()).toBeGreaterThan(1);
  await play(vids.first());
  for (let i = 0; i < await vids.count(); i++) await expectPlaying(vids.nth(i));
  const lone = loneMedia(page).first();
  if (await lone.count()) {
    await play(lone);
    for (let i = 0; i < await vids.count(); i++) await expectPlaying(vids.nth(i), false);
  }
});

test('core-3 a second group pauses the first', async ({ page }) => {
  await open(page, twoListens);
  const [one, two] = [page.locator('ao-listen').nth(0).locator('audio').first(), page.locator('ao-listen').nth(1).locator('audio').first()];
  await play(one);
  await expectPlaying(one);
  await play(two);
  await expectPlaying(two);
  await expectPlaying(one, false);
});

test('core-4 a silent player pauses when scrolled away and resumes when back', async ({ page }) => {
  await open(page, twoLone);
  const v = loneMedia(page).first();
  await scrollBack(v);
  await play(v, { muted: true });
  await expectPlaying(v);
  await scrollAway(v);
  await expectPlaying(v, false);
  await scrollBack(v);
  await expectPlaying(v);
});

test.describe('the now-playing bar', () => {
  const audible = async (page) => {
    await open(page, twoListens);
    const a = page.locator('ao-listen').first().locator('audio').first();
    await scrollBack(page.locator('ao-listen').first());
    await play(a, { muted: false });
    await expectPlaying(a);
    await scrollAway(page.locator('ao-listen').first());
    return a;
  };

  test('core-5 an audible player scrolled away keeps playing and the bar shows it', async ({ page }) => {
    const a = await audible(page);
    await page.waitForTimeout(500);
    expect(await playing(a)).toBe(true);
    const bar = page.locator('.ao-np');
    await expect(bar).toBeVisible();
    await expect(bar.locator('.ao-np-what b')).not.toBeEmpty();
    await expect(bar.locator('.ao-np-clock')).toHaveText(/\d+:\d\d \/ \d+:\d\d/);
  });

  test('core-6 the bar pauses and plays again', async ({ page }) => {
    const a = await audible(page);
    const toggle = page.locator('.ao-np-toggle');
    await toggle.click();
    await expectPlaying(a, false);
    await expect(toggle).toHaveAttribute('aria-label', 'Play');
    await toggle.click();
    await expectPlaying(a);
  });

  test('core-7 back to it scrolls the player into view, close stops it and hides the bar', async ({ page }) => {
    const a = await audible(page);
    await page.locator('.ao-np-back').click();
    await expect.poll(() => inView(page.locator('ao-listen').first())).toBe(true);
    await scrollAway(page.locator('ao-listen').first());
    await page.locator('.ao-np-close').click();
    await expectPlaying(a, false);
    await expect(page.locator('.ao-np')).toBeHidden();
  });
});

test('core-8 ao-stop stops everything', async ({ page }) => {
  await open(page, syncPage);
  const vids = page.locator('ao-compare[sync]').first().locator('video');
  await play(vids.first());
  await expectPlaying(vids.first());
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('ao-stop')));
  for (let i = 0; i < await vids.count(); i++) await expectPlaying(vids.nth(i), false);
});

// Posts embed the HLS player pages; no post has a player of its own beside one, so core-10 adds a plain video to the
// article to stand for it.
const framePage = targets.iframes.find((p) => targets.pages[p].iframe >= 2 &&
  Object.values(targets.standalone).filter((s) => s.via.includes('iframe') && s.from.includes(p)).length >= 2);
const frameVideo = async (page, i) => {
  const f = page.locator('[data-post-article] iframe').nth(i);
  await f.scrollIntoViewIfNeeded();
  const v = f.contentFrame().locator('video').first();
  await expect.poll(() => v.evaluate((m) => m.readyState)).toBeGreaterThan(0);
  return v;
};

test('core-9 playing in one embedded player pauses another', async ({ page }) => {
  await open(page, framePage);
  const a = await frameVideo(page, 0);
  const b = await frameVideo(page, 1);
  await play(a);
  await expectPlaying(a);
  await play(b);
  await expectPlaying(b);
  await expectPlaying(a, false);
});

test('core-10 an embedded player and a player in the post pause each other', async ({ page }) => {
  await open(page, framePage);
  const inner = await frameVideo(page, 0);
  await page.locator('[data-post-article]').evaluate((art, src) => {
    const v = document.createElement('video');
    v.id = 'outer'; v.playsInline = true; v.muted = true; v.loop = true; v.src = src;
    art.querySelector('iframe').before(v);
  }, smallVideo);
  const outer = page.locator('#outer');
  await play(outer);
  await expectPlaying(outer);
  await play(inner);
  await expectPlaying(inner);
  await expectPlaying(outer, false);
  await play(outer);
  await expectPlaying(outer);
  await expectPlaying(inner, false);
});
