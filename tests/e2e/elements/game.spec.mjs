// <ao-game>: a poster until Play, then the game's page in a frame; a player that pauses off screen, when the tab
// hides, when anything else plays and on ao-stop, and resumes from its veil. Stop and the own-tab link unload it.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith, scrollAway, scrollBack, expectPlaying, smallVideo } from '../helpers.mjs';

const url = pageWith('ao-game');
const game = (page) => page.locator('ao-game').first();
async function start(page) {
  await open(page, url);
  const g = game(page);
  await expect(g.locator('iframe')).toHaveCount(0);
  await g.locator('.ao-game-load').click();
  const frame = g.locator('iframe');
  await expect(frame).toHaveAttribute('src', await g.getAttribute('src'));
  await expect(g.locator('.ao-game-full')).toBeVisible();
  await expect(g.locator('.ao-game-stop')).toBeVisible();
  await expect.poll(() => frame.evaluate((f) => f.contentDocument?.readyState)).toBe('complete');
  return g;
}
const veil = (g) => g.locator('.ao-game-veil');

test('game-1 Play loads the game in a frame', async ({ page }) => {
  await start(page);
});

test('game-2 scrolled away it pauses behind a veil, and the veil resumes it', async ({ page }) => {
  const g = await start(page);
  await scrollAway(g);
  await scrollBack(g);
  await expect(veil(g)).toBeVisible();
  await expect(veil(g)).toContainText('Paused when you scrolled away.');
  await veil(g).click();
  await expect(veil(g)).toBeHidden();
});

test('game-3 it is a player: another player pauses it, and starting it pauses the other', async ({ page }) => {
  const g = await start(page);
  // A player of the test's own, pinned in view so the game stays on screen.
  await page.evaluate((src) => {
    const v = document.createElement('video');
    v.id = 'other'; v.muted = true; v.loop = true; v.playsInline = true; v.src = src;
    v.style.cssText = 'position:fixed;right:0;bottom:0;width:120px;z-index:9';
    document.body.append(v);
  }, smallVideo);
  const other = page.locator('#other');
  await other.evaluate((m) => m.play());
  await expect(veil(g)).toContainText('Paused while something else plays.');
  await veil(g).click();
  await expectPlaying(other, false);
});

test('game-4 ao-stop and a hidden tab pause it', async ({ page }) => {
  const g = await start(page);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('ao-stop')));
  // The page-wide stop reaches the game first through its aoPause, so the veil names "something else".
  await expect(veil(g)).toContainText(/^Paused/);
  await veil(g).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(veil(g)).toContainText('Paused while the tab was in the background.');
});

test('game-5 Stop unloads it, and so does opening it in its own tab', async ({ page, context }) => {
  const g = await start(page);
  await g.locator('.ao-game-stop').click();
  await expect(g.locator('iframe')).toHaveCount(0);
  await expect(g.locator('.ao-game-msg')).toHaveText('Stopped. Play it again to start over.');
  await expect(g.locator('.ao-game-load')).toContainText('Play again');
  await g.locator('.ao-game-load').click();
  await expect(g.locator('iframe')).toHaveCount(1);
  const tab = context.waitForEvent('page');
  await g.getByRole('link', { name: /Open in its own tab/ }).click();
  await (await tab).close();
  await expect(g.locator('iframe')).toHaveCount(0);
  await expect(g.locator('.ao-game-msg')).toHaveText('Opened in its own tab.');
});
