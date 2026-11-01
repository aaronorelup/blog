// The homepage scene (src/scripts/home-scene.js): waypoints by wheel, swipe, keys and the rail; the day/night toggle
// tweens the world rather than cutting; no WebGL (or a lost context) falls back to the flat page; the avatar flips
// like a coin; an outside link flies the camera out first; the backtick opens the staging tool.
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { test, expect } from './fixtures.mjs';

const rail = (page) => page.locator('#stop-rail [data-goto]');
const at = (page) => rail(page).evaluateAll((bs) => bs.findIndex((b) => b.getAttribute('aria-current') === 'true'));
// ?tier=low pins the cheapest animated rung, so software WebGL never drops the scene to its static rung mid-test.
async function scene(page) {
  await page.goto('/?tier=low');
  await expect(rail(page).first()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => at(page)).toBe(0);
}
// The scene ignores a step while the last one still flies (about 2 s from end to end, longer while software
// WebGL shares the box with other workers), so each step waits. The scene's tests run one at a time.
const settle = (page) => page.waitForTimeout(3500);
test.describe.configure({ mode: 'default' });

test('home-1 the wheel walks the waypoints', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones swipe (home-2)');
  await scene(page);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => at(page)).toBe(1);
  await settle(page);
  await page.mouse.wheel(0, -120);
  await expect.poll(() => at(page)).toBe(0);
});

test('home-2 a swipe walks the waypoints', async ({ page }) => {
  await scene(page);
  const swipe = (from, to) => page.evaluate(([from, to]) => {
    const ev = (type, y) => { const e = new Event(type, { cancelable: true }); Object.defineProperty(e, type === 'touchend' ? 'changedTouches' : 'touches', { value: [{ clientY: y }] }); return e; };
    window.dispatchEvent(ev('touchstart', from));
    window.dispatchEvent(ev('touchend', to));
  }, [from, to]);
  await swipe(600, 300);
  await expect.poll(() => at(page)).toBe(1);
  await settle(page);
  await swipe(300, 600);
  await expect.poll(() => at(page)).toBe(0);
});

test('home-3 the keys walk the waypoints: arrows, Page keys, space, Home and End', async ({ page }) => {
  test.setTimeout(120_000);
  await scene(page);
  const n = await rail(page).count();
  for (const [key, to] of [['ArrowDown', 1], ['PageDown', 2], ['ArrowUp', 1], ['Shift+Space', 0], ['Space', 1], ['End', n - 1], ['Home', 0]]) {
    await page.keyboard.press(key);
    await expect.poll(() => at(page)).toBe(to);
    await settle(page);
  }
});

test('home-4 a rail dot flies to its waypoint', async ({ page }) => {
  // Broken on main, at every tier and on both projects: the active section lies over the rail, so a click on a
  // dot lands on the section (INVENTORY home-4).
  test.fail();
  await scene(page);
  const box = await rail(page).nth(2).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(() => at(page), { timeout: 5000 }).toBe(2);
});

test('home-5 the day/night toggle tweens the world over a couple of seconds', async ({ page }) => {
  await scene(page);
  const toggle = page.locator('#mode-toggle');
  const before = await toggle.getAttribute('aria-pressed');
  const shot = async () => (await sharp(await page.screenshot()).resize(32, 20, { fit: 'fill' }).raw().toBuffer());
  const dist = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
  const page0 = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const start = await shot();
  const bg0 = await page0();
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-pressed', before);
  await page.waitForTimeout(1000);
  const bgMid = await page0();
  await page.waitForTimeout(2600);
  const bg1 = await page0();
  expect(dist(start, await shot())).toBeGreaterThan(4);
  // Halfway through, the page colour is neither the old one nor the new one.
  expect(new Set([bg0, bgMid, bg1]).size).toBe(3);
});

test('home-6 the avatar flips like a coin and lands on a face', async ({ page }) => {
  await scene(page);
  const spin = page.locator('#avatar-spin');
  await page.locator('#avatar').click();
  await expect(page.locator('#avatar')).toHaveAttribute('data-busy', '1');
  await expect.poll(() => spin.evaluate((s) => s.style.transform)).toMatch(/rotateY/);
  await expect(page.locator('#avatar')).not.toHaveAttribute('data-busy', '1', { timeout: 5000 });
  const deg = await spin.evaluate((s) => parseFloat(s.style.transform.match(/rotateY\(([-\d.]+)deg\)/)[1]));
  expect(deg % 180).toBe(0);
});

test('home-7 without WebGL the scene bails to the flat page', async ({ browserName, baseURL }) => {
  test.skip(browserName !== 'chromium', 'the switch is a Chromium flag');
  const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] });
  const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 } });
  const warn = page.waitForEvent('console', (m) => m.text().includes('static fallback'));
  await page.goto('/');
  await warn;
  await expect(page.locator('#home-scene-canvas')).toBeHidden();
  await expect(page.locator('#stop-rail')).toBeHidden();
  const shown = await page.locator('section[data-wp]').evaluateAll((ss) => ss.every((s) => s.style.opacity === '1' && !s.inert));
  expect(shown).toBe(true);
  await expect(page.locator('section[data-wp] a[href="/ledger"]').first()).toBeVisible();
  await browser.close();
});

const flash = (page) => page.locator('#scene-flash').evaluate((f) => parseFloat(getComputedStyle(f).opacity));

test('home-8 an outside link flies the camera out through the gate, then opens; the scene comes back', async ({ page, context }) => {
  await context.route('https://github.com/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>away</title>' }));
  await scene(page);
  const n = await rail(page).count();
  await page.keyboard.press('End');
  await expect.poll(() => at(page)).toBe(n - 1);
  await settle(page);
  // The white rises while the camera leaves (1.5 s) and is at full when the link opens, then fades: the page keeps
  // the highest it saw, frame by frame.
  await page.evaluate(() => {
    window.__sameDocument = true;
    window.__flashMax = 0;
    const f = document.getElementById('scene-flash');
    const tick = () => { window.__flashMax = Math.max(window.__flashMax, parseFloat(getComputedStyle(f).opacity)); requestAnimationFrame(tick); };
    tick();
  });
  const link = page.locator('section[data-wp] a[href^="https://github.com/"][target="_blank"]').first();
  const tab = context.waitForEvent('page');
  const t0 = Date.now();
  await link.click();
  const away = await tab;
  expect(Date.now() - t0).toBeGreaterThan(1000);
  expect(await page.evaluate(() => window.__flashMax)).toBeGreaterThan(0.9);
  expect(away.url()).toBe(await link.getAttribute('href'));
  await away.close();
  await expect.poll(() => flash(page)).toBe(0);
  expect(await at(page)).toBe(n - 1);
  expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
});

test('home-9 a data-no-fly link leaves at once, without closing the panel or flying', async ({ page }) => {
  await scene(page);
  // The courses card's own link grows the Courses view; its rows are data-no-fly links to the course pages.
  const card = page.locator('section[data-wp] a[href="/courses"]').first();
  for (let k = 0; k < 6 && await card.evaluate((a) => a.closest('section').inert); k++) {
    await page.keyboard.press('ArrowDown');
    await settle(page);
  }
  const box = await card.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('#panel-screen')).toHaveAttribute('aria-hidden', 'false');
  const row = page.locator('#panel-screen a[data-no-fly][href^="/courses/"]').first();
  const href = await row.getAttribute('href');
  // A flight closes the panel first; a session note survives the navigation to tell.
  await page.evaluate(() => new MutationObserver(() => {
    if (document.getElementById('panel-screen').getAttribute('aria-hidden') === 'true') sessionStorage.setItem('flew', '1');
  }).observe(document.getElementById('panel-screen'), { attributes: true }));
  await row.click();
  await expect(page).toHaveURL(new RegExp(href + '$'));
  expect(await page.evaluate(() => sessionStorage.getItem('flew'))).toBe(null);
});

test('home-10 a lost WebGL context bails to the flat page', async ({ page }) => {
  await scene(page);
  const warn = page.waitForEvent('console', (m) => m.text().includes('static fallback: context lost'));
  await page.locator('#home-scene-canvas').evaluate((c) => (c.getContext('webgl2') || c.getContext('webgl')).getExtension('WEBGL_lose_context').loseContext());
  await warn;
  await expect(page.locator('#stop-rail')).toBeHidden();
  await expect(page.locator('section[data-wp] a[href="/ledger"]').first()).toBeVisible();
});

test('home-11 the backtick opens and closes the staging tool', async ({ page }) => {
  await scene(page);
  const tool = page.locator('#staging-panel');
  await expect(tool).toBeHidden();
  await page.keyboard.press('`');
  await expect(tool).toBeVisible();
  await page.keyboard.press('`');
  await expect(tool).toBeHidden();
});
