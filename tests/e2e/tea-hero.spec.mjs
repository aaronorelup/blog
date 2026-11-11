// The tea room's hero (src/components/tea/TeaHero.astro, hero/Stage.astro, src/scripts/tea/hero/, docs/TEA_HERO.md):
// the poster is the first picture on every path; reduced motion and no WebGL keep it and fetch none of the 3D; the 3D
// starts only after first paint; where WebGL runs it mounts and pins with no console error; the title box's skip link
// and chapter links get past the pinned hero; on a phone the day/night switch is on screen through it.
import { chromium } from '@playwright/test';
import { test, expect } from './fixtures.mjs';

// What only the 3D needs: its chunk, three and its glTF loader, the manifest, the models and the picture layers.
const THREE_D = /\/_astro\/(stage|three\.module|GLTFLoader)\.[^/]*\.js$|\.glb$|\/tea\/hero\/[^/]*\.json$|\/tea\/hero\/bg-/;
const asked3d = (page) => {
  const seen = [];
  page.on('request', (r) => { if (THREE_D.test(new URL(r.url()).pathname)) seen.push(new URL(r.url()).pathname); });
  return seen;
};
const hero = (page) => page.locator('[data-tea-hero]');
// boot.js has decided: the scene is on (data-3d) or kept off with its reason (data-3d-off)
const decided = (page, timeout = 15_000) => expect.poll(() => hero(page).evaluate((s) => s.dataset['3d'] || s.dataset['3dOff'] || ''),
  { timeout }).not.toBe('');
// Holds every request matching pattern (a page.route glob) until release() is called, as a slow network would.
async function gate(page, pattern) {
  let release;
  const open = new Promise((r) => { release = r; });
  await page.route(pattern, async (route) => { await open; await route.continue().catch(() => {}); });
  return release;
}
// the picture on screen is the scene's poster, loaded, and no canvas has replaced it
async function posterShown(page) {
  const poster = page.locator('.tea-stage-poster');
  await expect(poster).toBeVisible();
  expect(await poster.evaluate((p) => getComputedStyle(p).backgroundImage)).toMatch(/\/tea\/hero\/poster-(night|day)(-tall)?\.webp/);
  await expect(page.locator('[data-tea-stage] canvas')).toHaveCount(0);
}

test('tea-hero-1 with reduced motion the poster stays and none of the 3D is fetched', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const seen = asked3d(page);
  const poster = page.waitForResponse((r) => /\/tea\/hero\/poster-[a-z-]+\.webp$/.test(r.url()) && r.ok());
  await page.goto('/tea/');
  await poster;
  await expect(hero(page)).toHaveAttribute('data-3d-off', 'reduced motion');
  await page.waitForTimeout(1500);   // past boot's idle wait, in case anything were still to come
  await posterShown(page);
  await expect(hero(page)).not.toHaveAttribute('data-3d', /./);
  expect(seen).toEqual([]);
});

test('tea-hero-2 without WebGL the poster stays and none of the 3D is fetched', async ({ browserName, baseURL }) => {
  test.skip(browserName !== 'chromium', 'the switch is a Chromium flag');
  const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
  const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 } });
  const seen = asked3d(page);
  await page.goto('/tea/?hero=on');   // ?hero=on: no device checks, so WebGL is the only gate left
  await expect(hero(page)).toHaveAttribute('data-3d-off', 'no webgl');
  await page.waitForTimeout(1500);
  await posterShown(page);
  expect(seen).toEqual([]);
  await browser.close();
});

test('tea-hero-3 nothing of the 3D is fetched before first paint', async ({ page }) => {
  await page.goto('/tea/?hero=on');
  await decided(page, 30_000);
  const t = await page.evaluate(() => {
    const paint = performance.getEntriesByName('first-paint')[0] || performance.getEntriesByName('first-contentful-paint')[0];
    const res = performance.getEntriesByType('resource').map((e) => [new URL(e.name).pathname, e.startTime]);
    return { paint: paint ? paint.startTime : null, res };
  });
  expect(t.paint).not.toBeNull();
  const early = t.res.filter(([p, at]) => THREE_D.test(p) && at <= t.paint);
  expect(early).toEqual([]);
  // and not because nothing came: where the scene runs, its files were fetched, after the paint
  if (await hero(page).getAttribute('data-3d') === 'on') expect(t.res.filter(([p]) => THREE_D.test(p)).length).toBeGreaterThan(2);
});

test('tea-hero-4 where WebGL runs, the scene mounts and pins with no console error', async ({ page, browserName }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/tea/?hero=on');
  await decided(page, 30_000);
  const off = await hero(page).getAttribute('data-3d-off');
  test.skip(browserName !== 'chromium' && off === 'no webgl', 'no WebGL in this browser: verify.mjs runs the 3D path');
  expect(off).toBeNull();
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await expect(page.locator('[data-tea-stage][data-ready] canvas')).toHaveCount(1, { timeout: 60_000 });
  const layout = await hero(page).getAttribute('data-hero-layout');
  expect(layout).toMatch(/^(dock|flow)$/);
  // the section is taller than the screen and what sticks stays at the top while the scroll plays
  const sticky = layout === 'dock' ? '.tea-hero-pin' : '[data-tea-stage]';
  await page.evaluate(() => {
    const s = document.querySelector('[data-tea-hero]');
    scrollTo({ top: (s.offsetHeight - innerHeight) / 2, behavior: 'instant' });
  });
  await expect.poll(() => page.locator(sticky).evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
  expect(errors).toEqual([]);
});

test('tea-hero-5 on a phone the day/night switch is on screen and works while the hero is', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phones: under 1024 px the switch belongs to the chapter strip, which is below the hero');
  const onTop = () => page.locator('#mode-toggle').evaluate((b) => {
    const r = b.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return r.top >= 0 && r.bottom <= innerHeight && !!at && !!at.closest('#mode-toggle');
  });
  for (const url of ['/tea/?hero=off', '/tea/?hero=on']) {
    await page.goto(url);
    await decided(page, 30_000);
    await expect(page.locator('.mode-toggle')).toHaveCount(1);   // one switch on the page, so never two on a screen
    const run = await hero(page).evaluate((s) => s.offsetHeight - innerHeight);
    for (const y of [0, Math.max(0, run / 2)]) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
      await expect(page.locator('#mode-toggle')).toBeInViewport();
      expect(await onTop()).toBe(true);
      expect(await hero(page).evaluate((s) => s.getBoundingClientRect().bottom > innerHeight / 2)).toBe(true);
    }
    const before = await page.evaluate(() => document.documentElement.dataset.mode || 'night');
    await page.locator('#mode-toggle').tap();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.mode || 'night')).not.toBe(before);
  }
});

test('tea-hero-6 the skip link in the title box takes the keyboard past the hero to the chapters', async ({ page, browserName }) => {
  await page.goto('/tea/?hero=on');
  await decided(page, 30_000);
  await page.keyboard.press('Tab');
  await expect(page.locator('.tea-skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.locator('#chapters').evaluate((m) => Math.round(m.getBoundingClientRect().top)),
    { timeout: 20_000 }).toBe(0);
  // Chromium moves focus to the target; WebKit only moves the place the next Tab starts from
  if (browserName === 'chromium') await expect(page.locator('#chapters')).toBeFocused();
});

test('tea-hero-7 each chapter link in the title box lands on its chapter', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/tea/?hero=on');
  await decided(page, 30_000);
  // With the scene up, its frame loop is held (its own hook; the pin, the tall section and the anchors stay as they
  // are): six long smooth scrolls under a software GPU on a busy box otherwise take minutes. tea-hero-6 lands with
  // the scene drawing.
  if (await hero(page).getAttribute('data-3d') === 'on') {
    await page.waitForFunction(() => window.__teaHero, null, { timeout: 60_000 });
    await page.evaluate(() => window.__teaHero.hold(true));
  }
  const links = page.locator('.tea-hero-box .tea-toc a');
  const n = await links.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    const id = (await links.nth(i).getAttribute('href')).slice(1);
    await links.nth(i).focus();
    await page.keyboard.press('Enter');
    // lands where the chapter's own scroll margin puts it (under the phone's strip), whatever the pinned hero above
    await expect.poll(() => page.locator('#' + id).evaluate((el) =>
      Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop)) < 4), { timeout: 20_000 }).toBe(true);
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
  }
});

test('tea-hero-8 the title box stays where it is when the scene takes over', async ({ page }) => {
  // the box's rectangle on every frame, and whether the scene had pinned the section by then
  await page.addInitScript(() => {
    window.__boxes = [];
    const tick = () => {
      const s = document.querySelector('[data-tea-hero]');
      const box = s && s.querySelector('.tea-hero-box');
      if (box) {
        const r = box.getBoundingClientRect();
        window.__boxes.push([s.dataset['3d'] ? 1 : 0, r.left, r.top, r.width, r.height]);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // the scene waits for the web fonts, so nothing but the scene can move the box
  const release = await gate(page, '**/tea/hero/manifest.json');
  await page.goto('/tea/?hero=on');
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await page.waitForTimeout(300);
  release();
  await expect(page.locator('[data-tea-stage][data-ready]')).toHaveCount(1, { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  // two more frames with the canvas up
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const rows = await page.evaluate(() => window.__boxes);
  const before = rows.filter((r) => !r[0]).at(-1);
  const after = rows.filter((r) => r[0]);
  expect(after.length).toBeGreaterThan(1);
  // a transform is no layout shift, so the box itself is measured: within 1 px of its static place on every frame
  const moved = Math.max(...after.map((r) => Math.max(...[1, 2, 3, 4].map((i) => Math.abs(r[i] - before[i])))));
  expect(moved, JSON.stringify({ before, first: after[0] })).toBeLessThanOrEqual(1);
});

// Where the first chapter is on screen (its section: the opener inside it fades up 12 px as it arrives).
const startTop = (page) => page.locator('#start').evaluate((el) => Math.round(el.getBoundingClientRect().top));

test('tea-hero-9 a scene that arrives late moves nothing on screen', async ({ page }) => {
  const release = await gate(page, '**/tea/hero/manifest.json');
  await page.goto('/tea/?hero=on');
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  // partway into the hero, the title box still on screen: the scene gets ready and keeps waiting, the poster stays
  await page.evaluate(() => scrollTo({ top: Math.round(innerHeight / 3), behavior: 'instant' }));
  const top1 = await startTop(page);
  release();
  await expect(page.locator('[data-tea-stage] canvas')).toHaveCount(1, { timeout: 60_000 });
  await page.waitForTimeout(800);
  await expect(hero(page)).not.toHaveAttribute('data-3d', /./);
  expect(await startTop(page)).toBe(top1);
  // a reader on the first chapter (no address, a scroll: the hero's foot still 12 px on screen) gets the scene with
  // the chapter left where it is
  await page.locator('#start').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
  const top2 = await startTop(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on', { timeout: 30_000 });
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  expect(Math.abs(await startTop(page) - top2)).toBeLessThanOrEqual(1);
});

test('tea-hero-10 arriving at a chapter address lands on the chapter with the scene', async ({ page }) => {
  // the scene's files held until the page has begun its scroll to the chapter, so the scene is ready mid-scroll
  await page.route('**/tea/hero/manifest.json', async (route) => {
    await page.waitForFunction(() => scrollY > 0, null, { timeout: 15_000 }).catch(() => {});
    await route.continue().catch(() => {});
  });
  await page.goto('/tea/?hero=on#projects');
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await expect.poll(() => page.locator('#projects').evaluate((el) =>
    Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop))), { timeout: 30_000 }).toBeLessThan(2);
});

