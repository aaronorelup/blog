// The tea room's hero (src/components/tea/TeaHero.astro, hero/Stage.astro, src/scripts/tea/hero/, docs/TEA_HERO.md):
// the poster is the first picture on every path; reduced motion and no WebGL keep it and fetch none of the 3D; the 3D
// starts only after first paint; where WebGL runs it mounts and pins with no console error; the title box's skip link
// and chapter links get past the pinned hero; on a phone the day/night switch is on screen through it.
import { chromium } from '@playwright/test';
import { REST } from '../../src/scripts/tea/hero/pin.js';
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
// the hero will change no layout by itself any more: kept off, or pinned with its first frame up
const settled = (page, timeout = 60_000) => expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout });
// The scene's frame loop held through its own hook, where it runs (the pin, the tall section and the anchors stay as
// they are): under a software GPU on a busy box every frame is a long task, and polls and scrolls starve behind them.
const holdScene = (page) => page.evaluate(() => window.__teaHero && window.__teaHero.hold(true));
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
  // the section is taller than the screen and what sticks stays at the top while the scroll plays (layout, not
  // drawing: the loop is held so the polls are not starved)
  const sticky = layout === 'dock' ? '.tea-hero-pin' : '[data-tea-stage]';
  await holdScene(page);
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
    // landed on the first chapter, the strip is already stuck at the top, the switch inside it and in line with it
    await page.locator('#start').evaluate((s) => s.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => {
      const strip = document.querySelector('[data-tea-rail]').getBoundingClientRect();
      const sw = document.querySelector('#mode-toggle').getBoundingClientRect();
      return [Math.round(strip.top), sw.top >= strip.top && sw.bottom <= strip.bottom];
    }), { timeout: 20_000 }).toEqual([0, true]);
  }
});

test('tea-hero-6 the skip link in the title box takes the keyboard past the hero to the chapters', async ({ page, browserName }) => {
  await page.goto('/tea/?hero=on');
  await settled(page);
  await holdScene(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.tea-skip')).toBeFocused();
  await page.keyboard.press('Enter');
  // the page's own smooth scroll, past the pinned section
  await expect.poll(() => page.locator('#chapters').evaluate((m) => Math.round(m.getBoundingClientRect().top)),
    { timeout: 30_000 }).toBe(0);
  // Chromium moves focus to the target; WebKit only moves the place the next Tab starts from
  if (browserName === 'chromium') await expect(page.locator('#chapters')).toBeFocused();
});

test('tea-hero-7 each chapter link in the title box lands on its chapter', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/tea/?hero=on');
  await settled(page);
  // The scene's loop held and the page's smooth scrolling off: six long smooth scrolls under a software GPU on a busy
  // box otherwise take minutes, and where each link lands is the point here. tea-hero-6 lands with the smooth scroll.
  await holdScene(page);
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
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
  // the scene's files held until the page has left the top for the chapter (an address with a chapter lands on it at
  // once, TeaPage's data-tea-arrive, tea-17), so the scene gets ready with the reader already there and pins below them
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

test('tea-hero-11 the day/night switch pressed while the scene loads is the mode the scene comes up in', async ({ page }) => {
  const release = await gate(page, '**/*.glb');
  const asked = page.waitForRequest(/\.glb$/, { timeout: 60_000 });
  await page.goto('/tea/?hero=on');
  await asked;   // the scene is loading its models: the switch now
  const mode = () => page.evaluate(() => document.documentElement.dataset.mode || 'night');
  const before = await mode();
  await page.locator('#mode-toggle').click();
  await expect.poll(mode).not.toBe(before);
  release();
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  const st = await page.evaluate(() => {
    const s = window.__teaHero.state;
    return { night: document.documentElement.dataset.mode !== 'day', target: s.target, mix: s.mix,
      pics: s.backdrop.layers.map((l) => [l.mat.uniforms.uNight.value.image.src, l.mat.uniforms.uDay.value.image.src]) };
  });
  // the scene's mode, its blend and the picture it shows are the page's (1 is night)
  expect(st.target).toBe(st.night ? 1 : 0);
  expect(st.mix).toBe(st.target);
  for (const pair of st.pics) expect(pair[st.night ? 0 : 1]).toMatch(st.night ? /-night\./ : /-day\./);
});

test('tea-hero-12 a lost WebGL context shows the poster until it is back, then the scene lit as before', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/tea/?hero=on');
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  const lost = await page.evaluate(() => {
    const ext = window.__teaHero.state.renderer.getContext().getExtension('WEBGL_lose_context');
    if (!ext) return false;
    window.__ext = ext;
    window.__env0 = window.__teaHero.state.scene.environment;
    ext.loseContext();
    return true;
  });
  test.skip(!lost, 'no WEBGL_lose_context in this browser');
  await expect(page.locator('[data-tea-stage][data-ready]')).toHaveCount(0, { timeout: 15_000 });
  await page.evaluate(() => window.__ext.restoreContext());
  await expect(page.locator('[data-tea-stage][data-ready]')).toHaveCount(1, { timeout: 60_000 });
  // the environment light (drawn on the GPU) is drawn again, not the lost one kept
  expect(await page.evaluate(() => {
    const env = window.__teaHero.state.scene.environment;
    return !!env && env !== window.__env0;
  })).toBe(true);
  expect(errors).toEqual([]);
});

test('tea-hero-13 reduced motion asked for while the scene runs puts the poster back, the page where it was, the GPU freed', async ({ page }) => {
  await page.goto('/tea/?hero=on');
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await page.locator('#ledger').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
  const top = () => page.locator('#ledger').evaluate((el) => Math.round(el.getBoundingClientRect().top));
  const before = await top();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero(page)).toHaveAttribute('data-3d-off', 'reduced motion', { timeout: 15_000 });
  await expect(hero(page)).not.toHaveAttribute('data-3d', /./);
  await posterShown(page);
  expect(Math.abs(await top() - before)).toBeLessThanOrEqual(1);
  // every picture and geometry the scene put on the GPU is freed with it (the picture layers' night and day images
  // and the sky light's render target included)
  expect(await page.evaluate(() => {
    const m = window.__teaHero.state.renderer.info.memory;
    return { geometries: m.geometries, textures: m.textures };
  })).toEqual({ geometries: 0, textures: 0 });
});

test('tea-hero-14 with the scene up the day/night switch fetches no poster under it', async ({ page }) => {
  await page.goto('/tea/?hero=on');
  await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await expect(page.locator('[data-tea-stage][data-covered]')).toHaveCount(1, { timeout: 15_000 });
  const posters = [];
  page.on('request', (r) => { if (/\/tea\/hero\/poster-/.test(r.url())) posters.push(new URL(r.url()).pathname); });
  const mode = () => page.evaluate(() => document.documentElement.dataset.mode || 'night');
  const before = await mode();
  await page.locator('#mode-toggle').click();
  await expect.poll(mode).not.toBe(before);
  await page.waitForTimeout(1500);
  expect(posters).toEqual([]);
});

test('tea-hero-15 the poster and the scene take the same shape of frame, a square window included', async ({ page }) => {
  test.setTimeout(150_000);
  for (const [width, height] of [[900, 900], [960, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/tea/?hero=on');
    await expect(hero(page)).toHaveAttribute('data-hero-settled', '', { timeout: 60_000 });
    await expect(hero(page)).toHaveAttribute('data-3d', 'on');
    const got = await page.evaluate(() => ({
      tall: /-tall\.webp/.test(getComputedStyle(document.querySelector('.tea-stage-poster')).backgroundImage),
      portrait: window.__teaHero.state.camRig.portrait,
    }));
    expect(got, `${width}x${height}`).toEqual({ tall: width <= height, portrait: width <= height });
  }
});

test('tea-hero-16 a missing manifest or model keeps the poster, the hero one screen', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const missing of ['**/tea/hero/manifest.json', '**/*.glb']) {
    await page.unrouteAll();
    await page.route(missing, (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto('/tea/?hero=on');
    await expect(hero(page)).toHaveAttribute('data-3d-off', 'failed', { timeout: 60_000 });
    await expect(hero(page)).toHaveAttribute('data-hero-settled', '');
    await expect(hero(page)).not.toHaveAttribute('data-3d', /./);
    await posterShown(page);
    // the static hero (the pinned one is three screens): the box and its padding, or one screen
    expect(await hero(page).evaluate((s) => s.offsetHeight < 2 * innerHeight), missing).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('tea-hero-17 Save-Data and a small device keep the poster and fetch none of the 3D', async ({ context }) => {
  for (const [why, init] of [
    ['save data', () => Object.defineProperty(Navigator.prototype, 'connection',
      { configurable: true, get: () => ({ saveData: true, effectiveType: '4g' }) })],
    ['small device', () => Object.defineProperty(Navigator.prototype, 'deviceMemory', { configurable: true, get: () => 1 })],
  ]) {
    const page = await context.newPage();
    await page.addInitScript(init);
    const seen = asked3d(page);
    await page.goto('/tea/');   // not ?hero=on, which skips these two checks
    await expect(hero(page)).toHaveAttribute('data-3d-off', why, { timeout: 30_000 });
    await page.waitForTimeout(1500);
    await posterShown(page);
    expect(seen, why).toEqual([]);
    await page.close();
  }
});

test('tea-hero-18 a reload inside the scene comes back to the same place in it', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  const raw = () => hero(page).evaluate((s) => {
    const r = s.getBoundingClientRect();
    return -r.top / (r.height - innerHeight);
  });
  const halfway = () => hero(page).evaluate((s) => scrollTo({ top: (s.offsetHeight - innerHeight) * 0.5, behavior: 'instant' }));
  await halfway();
  expect(Math.abs(await raw() - 0.5)).toBeLessThan(0.01);
  await holdScene(page);   // a busy software GPU slows the reload itself; leaving keeps the place all the same
  await page.reload();
  await settled(page);   // the place is back by then (stage.js puts it back before the first frame shows)
  await holdScene(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  expect(Math.abs(await raw() - 0.5)).toBeLessThan(0.01);
  // and the scene is drawn there, not easing in from its opening frame
  expect(Math.abs(await page.evaluate(() => window.__teaHero.progress) - 0.5)).toBeLessThan(0.01);
  // a new visit to the same address starts at the top
  await halfway();
  await holdScene(page);
  await page.goto('/tea/?hero=on');
  await settled(page);
  await holdScene(page);
  expect(await raw()).toBeLessThan(0.01);
});

test('tea-hero-19 the stage is one screen on every path, and the hero fades into the page at its foot', async ({ page, isMobile }) => {
  // the static stage as tall as the pinned one, so the poster is cropped the same before and after the pin, also where
  // the title box makes the hero taller than one screen (a short wide window; on a phone the box sits low)
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 700 });
  const stageH = () => page.locator('[data-tea-stage]').evaluate((el) => Math.round(el.getBoundingClientRect().height));
  const foot = () => page.locator('[data-tea-stage]').evaluate((el) => getComputedStyle(el, '::after').opacity);
  const screenH = () => page.evaluate(() => innerHeight);
  await page.goto('/tea/?hero=off');
  await settled(page);
  expect(await hero(page).evaluate((s) => s.offsetHeight - innerHeight)).toBeGreaterThan(0);
  expect(Math.abs(await stageH() - await screenH())).toBeLessThanOrEqual(1);
  expect(await foot()).toBe('1');
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await holdScene(page);
  expect(Math.abs(await stageH() - await screenH())).toBeLessThanOrEqual(1);
  // no fade over the scene while it plays; it comes as the pin lets go
  await expect.poll(foot).toBe('0');
  await hero(page).evaluate((s) => scrollTo({ top: s.offsetHeight - innerHeight, behavior: 'instant' }));
  await page.evaluate(() => window.__teaHero.render());
  await expect(hero(page)).toHaveAttribute('data-hero-end', '');
  await expect.poll(foot).toBe('1');
});

test('tea-hero-20 the title box is the same box static and over the scene, opaque by day', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('scene-mode', 'day'); } catch {} });
  const look = () => page.locator('.tea-hero-box').evaluate((b) => {
    const cs = getComputedStyle(b);
    const alpha = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number)[3];
    return { blur: cs.backdropFilter || cs.webkitBackdropFilter || 'none', alpha: alpha == null ? 1 : alpha };
  });
  await page.goto('/tea/?hero=off');
  await settled(page);
  const still = await look();
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await holdScene(page);
  // the same box on both paths (nothing about it changes when the scene arrives), and by day its card hides the picture
  // under it, so the title and kicker keep their contrast whatever the picture is
  expect(await look()).toEqual(still);
  expect(still).toEqual({ blur: 'none', alpha: 1 });
});

test('tea-hero-21 the box docks only where it leaves most of the frame to the scene', async ({ page, isMobile }) => {
  test.skip(isMobile, 'landscape windows of a desktop');
  test.setTimeout(150_000);
  for (const [width, height, layout] of [[1024, 768, 'flow'], [1366, 768, 'dock']]) {
    await page.setViewportSize({ width, height });
    await page.goto('/tea/?hero=on');
    await settled(page);
    await expect(hero(page), `${width}x${height}`).toHaveAttribute('data-hero-layout', layout);
    // docked, the lens shift grows with the share of the frame the box covers (1 where the keys were tuned, 1440)
    if (layout === 'dock') {
      const cover = await page.evaluate(() => window.__teaHero.state.cover);
      expect(cover).toBeGreaterThan(1.02);
      expect(cover).toBeLessThan(1.12);
    }
  }
});

test('tea-hero-22 on a portrait screen the cast stands clear above the title box in the first screen', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 768, height: 1024 });
  for (const url of ['/tea/?hero=off', '/tea/?hero=on']) {
    await page.goto(url);
    await settled(page);
    // the box waits low (the portrait camera stands the cast in the top 60% of the frame), on both paths
    const top = await page.locator('.tea-hero-box').evaluate((b) => b.getBoundingClientRect().top / innerHeight);
    expect(top, url).toBeGreaterThan(0.55);
    expect(top, url).toBeLessThan(0.7);
  }
  // and the scene keeps the portrait frame's full height on this screen (no crop of the characters' heads)
  expect(await page.evaluate(() => Math.round(window.__teaHero.state.camRig.cam.fov))).toBe(50);
});

// A chapter link tapped in the last moments before the scene pins lands on its chapter all the same. The pin waits for
// REST ms of no scroll (pin.js), armed in the task that puts the canvas in the stage; the tap comes 5 ms before that
// timer, so before the jump's first frame: from a chapter (the pin's own scroll used to cut the jump short, the reader
// left where they were) and from the top of the page (the section's growth used to land it two screens early).
test('tea-hero-23 a chapter link tapped just as the scene pins still lands on its chapter', async ({ page }) => {
  test.setTimeout(180_000);
  for (const [from, link] of [['about', '[data-tea-link="ledger"]'], [null, '.tea-toc a[href="#ledger"]']]) {
    await page.unroute('**/tea/hero/manifest.json');
    const release = await gate(page, '**/tea/hero/manifest.json');
    await page.goto('/tea/?hero=on');
    await page.waitForFunction(() => document.fonts.status === 'loaded');
    if (from) await page.locator(`#${from}`).evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.evaluate(([link, delay]) => {
      const stage = document.querySelector('[data-tea-stage]');
      new MutationObserver((records, mo) => {
        if (!stage.querySelector('canvas')) return;
        mo.disconnect();
        setTimeout(() => document.querySelector(link).click(), delay);
      }).observe(stage, { childList: true });
    }, [link, REST - 5]);
    release();
    await settled(page);
    await expect(page, `from ${from || 'the top'}`).toHaveURL(/#ledger$/);
    await expect.poll(() => page.locator('#ledger').evaluate((el) =>
      Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop))),
    { message: `from ${from || 'the top'}`, timeout: 30_000 }).toBeLessThan(2);
  }
});

// The manifest names parts of the models: the nodes its tracks and idle waves move, the nodes lights and glows hang
// from, each prop's parent and each material override's node. The runtime skips a name the models lack without a
// word (tracks.js findNode; a light or glow falls back to the actor's root, a prop to its model), so a model swapped in
// with a part renamed would silently stop moving or light the wrong place. Every name in the shipped manifest is found.
test('tea-hero-24 every part the manifest names is in the loaded models', async ({ page }) => {
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  const missing = await page.evaluate(() => {
    const { manifest: m, actors } = window.__teaHero.state;
    // findNode's own matching: the rig map's alias, the exact name, the name GLTFLoader leaves, the glTF's own name
    const clean = (n) => String(n).replace(/\s/g, '_').replace(/[[\]./:]/g, '');
    const found = (id, name) => {
      const a = actors.find((x) => x.spec.id === id);
      if (!a) return false;
      const want = a.spec.rig.map[name] || name;
      let hit = false;
      a.model.traverse((o) => { hit ||= o.name === want || o.name === clean(want) || o.userData?.name === want; });
      return hit;
    };
    const out = [];
    for (const t of [...m.tracks, ...m.idle]) {
      if (!actors.some((a) => a.spec.id === t.actor)) out.push(`actor ${t.actor}`);
      else if (t.node && !found(t.actor, t.node)) out.push(`${t.actor}/${t.node} (${t.channel})`);
    }
    for (const l of [...m.lights, ...m.glows]) {
      if (l.attach && l.attach.node && !found(l.attach.actor, l.attach.node)) out.push(`${l.attach.actor}/${l.attach.node} (light or glow)`);
    }
    for (const a of m.actors) {
      for (const p of a.props) if (p.parent && !found(a.id, p.parent)) out.push(`${a.id}/${p.parent} (parent of ${p.id})`);
      for (const n of Object.keys(a.materials)) if (!found(a.id, n)) out.push(`${a.id}/${n} (material)`);
    }
    return out;
  });
  expect(missing).toEqual([]);
});

// Leaving the page while the scene loads leaves nothing in the console. WebKit cancels the page's loads as a navigation
// starts and refuses, with a console error, any fetch the page starts after that; three's loaders report a cut load as
// an unhandled rejection (a model's body) or a console error (a model's picture). Each visit holds the scene's next
// file, lets it go and reloads `after` ms later, so the reload comes while the scene loads: as the manifest arrives (the
// models are asked for next) and as the models do (their bodies and pictures are cut).
test('tea-hero-25 leaving the page while the scene loads leaves no console error', async ({ page }) => {
  test.setTimeout(300_000);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [held, file] of [['**/tea/hero/manifest.json', /\/tea\/hero\/manifest\.json$/], ['**/*.glb', /\.glb$/]]) {
    for (const after of [0, 5, 10, 20, 40]) {
      await page.unrouteAll();
      const release = await gate(page, held);
      const asked = page.waitForRequest((r) => file.test(new URL(r.url()).pathname), { timeout: 60_000 });
      await page.goto('/tea/?hero=on');
      await asked;
      release();
      if (after) await page.waitForTimeout(after);
      await page.reload();
      await settled(page);   // the page reloaded, its scene loaded with nothing held
    }
  }
  expect(errors).toEqual([]);
});

// The swap the final cast uses (docs/TEA_HERO.md, "One actor in place of another"), on /tea/ itself with the shipped
// manifest plus a follower, served in its place: a follower riding Jefrie, made of another actor's model, that
// dissolves in (fade, opacity) while she dissolves out and back, and the last actor cut away (visible) late in the
// scroll; down to 0.8 and back to 0. The manifest's own followers and whole-actor visible and opacity tracks are left
// out, so these keys alone show or hide an actor, and no file name is assumed: it holds whatever the cast is.
test('tea-hero-26 one actor swapped for another rides its leader and cuts and dissolves as keyed, down and back', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  const LEAD = 'jefrie';
  const KEYS = {
    [LEAD]: { channel: 'opacity', keys: [[0.18, 1], [0.21, 0], [0.5, 0], [0.53, 1]] },
    swap: { channel: 'opacity', keys: [[0.18, 0], [0.21, 1], [0.5, 1], [0.53, 0]] },
  };
  let cast = [];
  await page.route('**/tea/hero/manifest.json', async (route) => {
    const response = await route.fetch();
    const m = await response.json();
    const keep = (t) => t.node || !['visible', 'opacity'].includes(t.channel);   // no whole-actor show or hide
    m.actors = m.actors.filter((a) => !a.follow);
    m.tracks = m.tracks.filter(keep);
    m.idle = (m.idle || []).filter(keep);
    const others = m.actors.filter((a) => a.id !== LEAD);
    KEYS[others[others.length - 1].id] = { channel: 'visible', keys: [[0.699, 1], [0.701, 0]] };
    m.actors.push({ id: 'swap', src: others[0].src, follow: LEAD, fade: true, position: [0.3, 0, 0.1],
      rotation: [0, 40, 0], scale: 0.5 });
    for (const [actor, t] of Object.entries(KEYS)) m.tracks.push({ actor, ease: 'linear', ...t });
    cast = m.actors.map((a) => a.id);
    await route.fulfill({ response, json: m });
  });
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  expect(cast).toContain(LEAD);
  await holdScene(page);
  for (const raw of [0, 0.1, 0.19, 0.2, 0.25, 0.4, 0.52, 0.6, 0.75, 0.8, 0.6, 0.45, 0.2, 0.1, 0]) {
    const got = await page.evaluate(([raw, LEAD]) => {
      const h = window.__teaHero;
      h.setProgress(raw);
      const st = h.state;
      const by = Object.fromEntries(st.actors.map((a) => [a.spec.id, a]));
      const [j, s] = [by[LEAD], by.swap];
      return {
        p: Math.min(1, Math.max(0, (st.input.st.p - st.lead) / (1 - st.lead))),
        shown: Object.fromEntries(st.actors.map((a) => [a.spec.id, a.root.visible])),
        fades: s.fadeMats.map(([m, base]) => [m.opacity, base, m.alphaHash, m.transparent]),
        rides: j.root.position.distanceTo(s.root.position) + j.root.quaternion.angleTo(s.root.quaternion)
          + j.inner.scale.distanceTo(s.inner.scale),
      };
    }, [raw, LEAD]);
    // the keys, sampled as tracks.js does (linear) at the scene's own progress
    const at = (keys) => {
      if (got.p <= keys[0][0]) return keys[0][1];
      const i = keys.findIndex(([t]) => t >= got.p);
      if (i < 0) return keys[keys.length - 1][1];
      const [[t0, a], [t1, b]] = [keys[i - 1], keys[i]];
      return a + (b - a) * (got.p - t0) / (t1 - t0);
    };
    // each actor shown as its keys say (opacity above 0.004, visible 0.5 or more), the rest always
    const shown = Object.fromEntries(cast.map((id) => {
      const t = KEYS[id];
      return [id, !t || (t.channel === 'visible' ? at(t.keys) >= 0.5 : at(t.keys) > 0.004)];
    }));
    const os = at(KEYS.swap.keys);
    const where = `raw ${raw}, scene ${got.p.toFixed(3)}`;
    expect(got.shown, where).toEqual(shown);
    expect(got.fades.length, where).toBeGreaterThan(0);
    for (const [o, base, hashed, seeThrough] of got.fades) {
      expect(Math.abs(o - base * os), where).toBeLessThan(1e-6);
      expect(hashed !== seeThrough, where).toBe(true);   // alpha-hashed in the opaque pass, or blended as it was
    }
    expect(got.rides, where).toBeLessThan(1e-6);
  }
  expect(errors).toEqual([]);
});

// The shipped manifest's own swap on the page (tests/unit/tea-hero.test.mjs checks the runtime's modules; this checks
// the scene the page really mounts): Jefrie handed over to her leap mesh, which follows her. An actor hidden at the top
// of the scroll by its own whole-actor visible or opacity track stands in for another for part of it, so it must
// follow someone (one that doesn't is drawn at its own place while the other is cut away), and every follower the
// manifest names is one the runtime knows (a runtime without "follow" drops them all); down the scroll and back, a
// step either side of every visible key and at 0, 0.3 and 0.6, exactly one of each pair is drawn, the follower on its
// leader's root; the number of point lights drawn never changes (a light under a hidden actor is not drawn, so the
// leap actor carries its own pair: a change would recompile every lit material in the middle of the leap), and nor
// does the number of pictures on the GPU (a hidden actor's are uploaded with the rest at the mount, not on its first
// frame in the middle of the leap).
test('tea-hero-27 the shipped leap: exactly one of a character and her leap mesh drawn, on one root, the lights and pictures the same', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/tea/?hero=on');
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await holdScene(page);
  // the other mode's picture layers load after the first frame: in, so they are not counted as the leap's
  await page.waitForFunction(() => window.__teaHero.state.backdrop.tried, null, { timeout: 60_000 });
  const out = await page.evaluate(async () => {
    const H = window.__teaHero;
    H.freeze(0.45); H.pointer([0, 0]);
    const s = H.state;
    const raw = await (await fetch(document.querySelector('[data-tea-stage]').dataset.manifest || '/tea/hero/manifest.json')).json();
    const wanted = (raw.actors || []).filter((a) => a.follow).map((a) => `${a.follow}>${a.id}`);
    const first = (t) => [...t.keys].sort((a, b) => a[0] - b[0])[0][1];
    const standins = (raw.actors || []).filter((a) => (raw.tracks || []).some((t) => t.actor === a.id && !t.node
      && t.keys && t.keys.length && ((t.channel === 'visible' && first(t) < 0.5) || (t.channel === 'opacity' && first(t) <= 0.004))));
    const loose = standins.filter((a) => !a.follow).map((a) => a.id);
    const pairs = s.actors.filter((a) => a.spec.follow).map((a) => [a, s.actors.find((b) => b.spec.id === a.spec.follow)]);
    const cuts = raw.tracks.filter((t) => t.channel === 'visible').flatMap((t) => t.keys.map(([p]) => p));
    const ps = [...new Set([0, 0.3, 0.6, ...cuts.flatMap((p) => [p - 0.001, p + 0.001])])]
      .filter((p) => p >= 0 && p <= 1).sort((a, b) => a - b);
    const drawn = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
    const bad = [];
    let lights = null;
    let pictures = null;
    for (const p of [...ps, ...ps.slice().reverse()]) {
      // the scene's progress p: in the flow layout the scroll's first share is the title box's lead
      H.setProgress(s.lead + p * (1 - s.lead));
      for (const [f, l] of pairs) {
        const n = [l.root, f.root].filter(drawn).length;
        if (n !== 1) bad.push(`progress ${p.toFixed(4)}: ${n} of ${l.spec.id} and ${f.spec.id} drawn`);
        if (f.root.position.distanceTo(l.root.position) > 1e-6 || f.root.quaternion.angleTo(l.root.quaternion) > 1e-6) {
          bad.push(`progress ${p.toFixed(4)}: ${f.spec.id} is off ${l.spec.id}'s root`);
        }
      }
      let n = 0;
      s.scene.traverse((o) => { if (o.isPointLight && drawn(o)) n++; });
      if (lights === null) lights = n;
      else if (n !== lights) bad.push(`progress ${p.toFixed(4)}: ${n} point lights drawn, ${lights} at the top`);
      const t = s.renderer.info.memory.textures;
      if (pictures === null) pictures = t;
      else if (t !== pictures) bad.push(`progress ${p.toFixed(4)}: ${t} pictures on the GPU, ${pictures} at the top`);
    }
    H.setProgress(null);
    return { wanted, loose, standins: standins.length, got: pairs.map(([f, l]) => `${l.spec.id}>${f.spec.id}`), bad };
  });
  test.skip(!out.wanted.length && !out.standins, 'the manifest hands no character over to another');
  expect(out.loose, 'hidden at the top, following no one').toEqual([]);
  expect(out.got.sort()).toEqual(out.wanted.sort());
  expect(out.bad).toEqual([]);
});

// A beforeunload that does not lead to leaving (a mailto link fires it in some browsers, and the page stays) must not
// cost the scene: the scene stops its loads on pagehide only (boot.js), which also keeps the page eligible for the
// back/forward cache. The event comes while the models load; the scene comes up all the same, with nothing logged.
test('tea-hero-28 a beforeunload that does not leave the page keeps the scene loading', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  const release = await gate(page, '**/*.glb');
  const asked = page.waitForRequest(/\.glb$/, { timeout: 60_000 });
  await page.goto('/tea/?hero=on');
  await asked;
  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  release();
  await settled(page);
  await expect(hero(page)).toHaveAttribute('data-3d', 'on');
  await expect(hero(page)).not.toHaveAttribute('data-3d-off', /./);
  expect(errors).toEqual([]);
});

// On a phone the title box spans the screen and scrolls up under the fixed day/night switch (top right): none of its
// text runs under the switch's column, on the static hero and over the scene (stage.css keeps a gutter there).
test('tea-hero-29 on a phone no line of the title box runs under the fixed day/night switch', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phones: under 561 px the box spans the screen');
  for (const url of ['/tea/?hero=off', '/tea/?hero=on']) {
    await page.goto(url);
    await settled(page);
    await holdScene(page);
    const under = await page.evaluate(() => {
      const sw = document.querySelector('#mode-toggle').getBoundingClientRect();
      const out = [];
      const walker = document.createTreeWalker(document.querySelector('.tea-hero-box'), NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.right > sw.left) out.push(`${n.textContent.trim().slice(0, 24)}: ${Math.round(r.right)} > ${Math.round(sw.left)}`);
      }
      return out;
    });
    expect(under, url).toEqual([]);
  }
});
