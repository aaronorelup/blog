// <ao-listen>: a set of clips with one player: a clip row picks and plays, A/B switches to the reference at the same
// moment and back, the spectrogram seeks (click and arrows), and keys drive the list.
import { test, expect } from '../fixtures.mjs';
import { openFirst, pagesWith, expectPlaying, clock, seekTo } from '../helpers.mjs';

// The first set whose every clip runs 4 s or more, so none ends under a test (many are one-line sound bites).
let at = null;
const listen = (page) => page.locator('ao-listen').nth(at.i);
const current = (page) => listen(page).locator('.ao-listen-list button[aria-current="true"] b');
// The audio of the clip the element shows, found by its title.
const audioOf = (page, title) => listen(page).locator('figure').filter({ has: page.locator('figcaption b', { hasText: title }) }).locator('audio').first();
const ready = (page) => listen(page).evaluate((el) => Promise.all([...el.querySelectorAll('audio')].map((a) => {
  a.muted = true; a.preload = 'metadata';
  return a.readyState ? 0 : new Promise((r) => { a.addEventListener('loadedmetadata', r, { once: true }); a.load(); });
})));

test.beforeEach(async ({ page }) => {
  const urls = at ? [at.url] : pagesWith('ao-listen');
  const i = await openFirst(page, urls, (p) => p.locator('ao-listen').evaluateAll((els) => Promise.all(els.map((el) =>
    Promise.all([...el.querySelectorAll('audio')].map((a) => (a.readyState ? a.duration : new Promise((r) => {
      a.addEventListener('loadedmetadata', () => r(a.duration), { once: true }); a.preload = 'metadata'; a.load();
    })))).then((d) => Math.min(...d)))).then((mins) => mins.findIndex((d) => d >= 4))));
  at = { url: page.url(), i };
  await listen(page).scrollIntoViewIfNeeded();
  await ready(page);
});

test('listen-1 a clip row selects that clip and plays it', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  const title = await current(page).textContent();
  await expect(listen(page).locator('.ao-listen-now b')).toHaveText(title);
  await expectPlaying(audioOf(page, title));
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Pause');
  await seekTo(audioOf(page, title), 2);
  await expect(listen(page).locator('.ao-listen-clock')).toHaveText(/^0:0[2-9] \/ \d+:\d\d$/);
  await listen(page).locator('.ao-listen-bar button').first().click();
  await expectPlaying(audioOf(page, title), false);
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Play');
});

test('listen-2 A/B switches to the reference at the same moment, and back', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  const ab = listen(page).locator('.ao-listen-bar button').nth(1);
  // Start on a clip that isn't the reference.
  for (let i = 0; i < await rows.count(); i++) {
    await rows.nth(i).click();
    if (!(await ab.isDisabled())) break;
  }
  const first = await current(page).textContent();
  const a = audioOf(page, first);
  await expectPlaying(a);
  // A moment well into the clip, set rather than waited for: WebKit on Linux can hold a playing clip's clock still.
  await seekTo(a, 2);
  await expect.poll(() => clock(a)).toBeGreaterThan(1.9);
  await ab.click();
  await expect(ab).toHaveAttribute('aria-pressed', 'true');
  const refTitle = await current(page).textContent();
  expect(refTitle).not.toBe(first);
  const ref = audioOf(page, refTitle);
  await expectPlaying(ref);
  // The reference picks up where the clip was (it would be near 0 from the start).
  const [ta, tr, end] = [await clock(a), await clock(ref), await ref.evaluate((m) => m.duration)];
  expect(tr).toBeGreaterThan(Math.min(ta, end) - 0.2);
  expect(tr - ta).toBeLessThan(3);
  await ab.click();
  await expect(current(page)).toHaveText(first);
  await expect(ab).toHaveAttribute('aria-pressed', 'false');
});

test('listen-3 the spectrogram seeks on click and with the arrow keys', async ({ page }) => {
  const spec = listen(page).locator('.ao-listen-spec');
  const box = await spec.boundingBox();
  await spec.click({ position: { x: box.width * 0.5, y: box.height / 2 } });
  await expect.poll(() => spec.getAttribute('aria-valuenow').then(Number)).toBeGreaterThan(40);
  const a = audioOf(page, await current(page).textContent());
  const t = await clock(a);
  await spec.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => clock(a)).toBeGreaterThan(t + 0.3);
});

test('listen-4 with the list focused: arrows pick a clip and keep playing, space toggles, C flips A/B', async ({ page }) => {
  const list = listen(page).locator('.ao-listen-list');
  const rows = list.locator('button');
  const ab = listen(page).locator('.ao-listen-bar button').nth(1);
  await list.focus();
  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  const a = audioOf(page, await current(page).textContent());
  await expectPlaying(a);
  await page.keyboard.press(' ');
  await expectPlaying(a, false);
  await page.keyboard.press(' ');
  await expectPlaying(a);
  const pressed = await ab.getAttribute('aria-pressed');
  if (await ab.isDisabled()) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('c');
  await expect(ab).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('C');
  await expect(ab).toHaveAttribute('aria-pressed', pressed);
});
