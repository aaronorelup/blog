// The AI landscape (/ai-landscape/, its dated snapshots and their sources pages): a document of its own with none of
// the site's chrome, the newest snapshot at /ai-landscape/, a three.js scene that draws, follows the scroll and the
// pointer, a text version without WebGL, reduced motion with no scroll-jacking, nothing off the side or out of reach,
// the companies reachable by keyboard, at most 60 words on screen, and every string traced to the view model or the
// copy file and standing where it belongs. Rows 12 on hold the failure paths of review round 1: one frame loop
// however often the tab is hidden, the skip link before the scene, resizes and rotation, a lost context, a whole page
// by keyboard, a lost chunk, and the design pass's states that a scroll alone must change. Rows 20 on hold round 2's:
// a text version started inside the two frames before a scene loads, a frame that throws, no word printed over a word
// in a laptop's short window, a watchdog that knows a 30 a second display from a slow one, and a finger's targets.
// Rows 24 and 25 hold the studio pass of round 3: a board behind each stack, the line-up's signs, the lesson's nine
// greys, its paper number and its close, the cord of the link being read, and the agents' dusk. Row 26: a visitor who
// leaves while a chunk loads is let go. Row 27 holds the pass's workshop: the cabinet of nine drawers, the bench with
// its cast, cords and lenders, and the router floor's one lamp. Row 28 holds its rooms and art: the lamp desk on the
// floor, billing's five in step, the paper objects, the far wall's picture, Google's portrait and Meta's card. Rows 29
// on hold round 3's reviews: the text version after the 3D page is a fresh one, and my stack built again is his own.
import fs from 'node:fs';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { test, expect } from './fixtures.mjs';
import { LISTED, SNAPSHOTS } from '../../src/data/ai-landscape.js';

const NEWEST = SNAPSHOTS[0].date;
const DATED = SNAPSHOTS.map((s) => `/ai-landscape/${s.date}/`);
const PAGES = ['/ai-landscape/', ...DATED];
const SOURCES = SNAPSHOTS.map((s) => `/ai-landscape/${s.date}/sources/`);
const COMPANIES = ['anthropic', 'openai', 'google', 'meta', 'xai'];
const WORDS_MAX = 60;
const BOARD_MAX = 80;      // a board state: one table or one list of labels. Its stage carries data-board
const CALLS = { studio: 130, world: 120 };      // draw calls a frame (review round 1): the studio and links, a world

// ?tier=low pins the cheap animated rung and turns the watchdog off, so software WebGL never drops the page to its
// text version mid-test (the homepage precedent). The scene is up once window.__landscape says ready and it drew, and a
// 3D row asserts that it really is 3D: a scene that failed to mount falls to the text version, which is also "ready".
async function open(page, path = '/ai-landscape/', tier = 'low', more = '') {
  await page.goto(`${path}?tier=${tier}${more}`);
  await page.waitForFunction(() => window.__landscape && window.__landscape.ready && (window.__landscape.tier === 'static' || window.__landscape.frames > 1), null, { timeout: 60_000 });
  if (tier !== 'static') expect((await hook(page)).tier, 'the scene mounted').toBe(tier);
}
const hook = (page) => page.evaluate(() => { const l = window.__landscape; return { tier: l.tier, progress: l.progress, frames: l.frames, section: l.section, world: l.world, camera: l.camera }; });
// Wait until the scene has drawn n more frames (software WebGL draws a few a second while other tests run).
async function frames(page, n) {
  const f0 = await page.evaluate(() => window.__landscape.frames);
  await page.waitForFunction(([f, k]) => window.__landscape.frames >= f + k, [f0, n], { timeout: 60_000 });
}
// The sections in story order: id, kind, start and length in screens.
const sections = (page) => page.evaluate(() => window.__landscape.debug.ctx.clock.sections.map((s) => ({ id: s.id, name: s.name, s0: s.s0, screens: s.screens })));
// Scroll to u screens into a section and let the story clock arrive at once, as after a long scroll.
async function go(page, id, u, settle = 900) {
  await page.evaluate(([id, u]) => {
    const c = window.__landscape.debug.ctx.clock;
    window.scrollTo(0, c.pixels(c.sections.find((s) => s.id === id).s0 + u));
  }, [id, u]);
  await page.waitForFunction(() => { const c = window.__landscape.debug.ctx.clock; return Math.abs(window.scrollY - c.pixels(c.target)) < 2; });
  await page.evaluate(() => window.__landscape.debug.ctx.clock.jump());
  await frames(page, 3);
  if (settle) await page.waitForTimeout(settle);                     // the words' longest fade is 720 ms
  await frames(page, 2);
}
// The 3D in these walks is drawn at a pixel ratio of 0.25, so software WebGL keeps up with four of them at once. What
// they measure (words, the page's width, strings, focus, draw calls) is HTML or the scene's state, not its pixels.
const light = (page) => page.evaluate(() => {
  const c = window.__landscape.debug.ctx;
  c.quality.ratio = 0.25; c.renderer.setPixelRatio(0.25); c.renderer.setSize(innerWidth, innerHeight, false); c.worlds.resize(innerWidth, innerHeight, 0.25);
});

// The words a visitor sees: text in the window, not hidden, faded out or read only to screen readers (the counter of
// the builders' walks).
const onScreen = (page, root = 'body') => page.evaluate((root) => {
  const seen = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false;
      if (n.classList.contains('ail-vh') || cs.clipPath.includes('inset(50%)')) return false;
    }
    if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const words = [];
  const walk = document.createTreeWalker(document.querySelector(root), NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    const el = t.parentElement;
    if (!t.textContent.trim() || el.closest('script, style, .ail-live') || !seen(el)) continue;
    words.push(...t.textContent.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)));
  }
  return words;
}, root);

test('landscape-1 every page answers 200 with a clean console, fetches nothing from another origin, carries ao-build and none of the site\'s chrome', async ({ page, baseURL }) => {
  test.setTimeout(480_000);
  const origin = new URL(baseURL).origin;
  const errors = [];
  const away = [];
  // the page reports a section that crashed or did not load, and a signature that did not, as a warning of its own
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && m.text().startsWith('ai-landscape:'))) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { const u = new URL(r.url()); if (!['data:', 'blob:'].includes(u.protocol) && u.origin !== origin) away.push(r.url()); });
  for (const path of [...PAGES, ...SOURCES]) {
    const response = await page.goto(path);
    expect(response.status(), path).toBe(200);
    expect(await page.locator('meta[name="ao-build"]').getAttribute('content'), path).toMatch(/\S/);
    await expect(page.locator('#panel-screen'), path).toHaveCount(0);
    expect(await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]')].map((l) => l.href)
      .filter((h) => /PanelChrome|PanelPage|site\.|karla/i.test(h))), path).toEqual([]);
    if (SOURCES.includes(path)) continue;
    await page.waitForFunction(() => window.__landscape && window.__landscape.ready, null, { timeout: 60_000 });
  }
  // the scene loads each section's module and each world's art as it comes near: visit them all
  await open(page);
  await light(page);
  for (const s of await sections(page)) await go(page, s.id, s.screens / 2, 0);
  expect(errors).toEqual([]);
  expect(away).toEqual([]);
});

test('landscape-2 /ai-landscape/ is the newest snapshot, each dated page is its own and links back, the editions list them all, and the sitemap, the projects page and noindex follow LISTED', async ({ page, request }) => {
  // each page's share card is a real 1200x630 JPEG of this build, at its snapshot's fixed address
  const card = async (date) => {
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toBe(`https://aaronorelup.com/ai-landscape/${date}/og.jpg`);
    const meta = await sharp(await (await request.get(new URL(og).pathname)).body()).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1200, 630]);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  };
  await page.goto('/ai-landscape/?tier=static');
  await expect(page.locator('html')).toHaveAttribute('data-snapshot', NEWEST);
  expect(await page.locator('html').getAttribute('data-dated')).toBe(null);
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://aaronorelup.com/ai-landscape/');
  await card(NEWEST);
  const editions = (sel) => page.locator(sel).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  for (const date of SNAPSHOTS.map((s) => s.date)) {
    await page.goto(`/ai-landscape/${date}/?tier=static`);
    await expect(page.locator('html')).toHaveAttribute('data-snapshot', date);
    await expect(page.locator('html')).toHaveAttribute('data-dated', '');
    await expect(page.locator('.ail-chrome time').first()).toHaveText(date);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`https://aaronorelup.com/ai-landscape/${date}/`);
    await card(date);
    // "Newest" leads from an older snapshot to the newest, never from the newest to itself; the empty slot for the
    // next snapshot stands first, and only on the newest
    const newest = date === NEWEST;
    await expect(page.locator('a.ail-shelf__newest[href="/ai-landscape/"], a.ail-eds__newest[href="/ai-landscape/"]')).toHaveCount(newest ? 0 : 2);
    await expect(page.locator('.ail-slab--next')).toHaveCount(newest ? 1 : 0);
    await expect(page.locator('.ail-eds__next')).toHaveCount(newest ? 1 : 0);
    if (newest) await expect(page.locator('.ail-shelf__row > li').first().locator('.ail-slab--next')).toHaveCount(1);
    // the shelf and the edition list hold every snapshot, newest first, this one marked; no strip repeats them
    await expect(page.locator('.ail-strip')).toHaveCount(0);
    expect(await editions('.ail-shelf__row a')).toEqual(DATED);
    expect(await editions('.ail-eds__list a')).toEqual(DATED);
    await expect(page.locator(`.ail-shelf__row a[href="/ai-landscape/${date}/"]`)).toHaveAttribute('aria-current', 'page');
  }
  // LISTED off (a preview under review): every page and sources page says noindex, the sitemap and the projects page
  // leave it out. On: none of that, and the sitemap lists every page.
  for (const path of [...PAGES, ...SOURCES]) {
    await page.goto(path.endsWith('sources/') ? path : `${path}?tier=static`);
    await expect(page.locator('meta[name="robots"][content="noindex"]'), path).toHaveCount(LISTED ? 0 : 1);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of PAGES) {
    if (LISTED) expect(sitemap, path).toContain(`<loc>https://aaronorelup.com${path}</loc>`);
    else expect(sitemap, path).not.toContain(`<loc>https://aaronorelup.com${path}</loc>`);
  }
  await page.goto('/projects/');
  expect(await page.locator('a[href^="/ai-landscape/"]').count() > 0, 'the projects page links the AI landscape').toBe(LISTED);
});

// How much the canvas alone varies (the largest channel's standard deviation): 0 is one flat colour.
async function canvasSpread(page) {
  const hide = await page.addStyleTag({ content: 'body > :not(canvas) { visibility: hidden !important; }' });
  await frames(page, 2);
  const { channels } = await sharp(await page.screenshot()).stats();
  await hide.evaluate((el) => el.remove());
  return Math.max(...channels.slice(0, 3).map((c) => c.stdev));
}

test('landscape-3 WebGL draws: frames rise and the canvas is not one flat colour', async ({ page }) => {
  await open(page);
  await expect(page.locator('html')).toHaveClass(/ail-3d/);
  const f0 = (await hook(page)).frames;
  await frames(page, 3);
  expect((await hook(page)).frames).toBeGreaterThan(f0);
  // only the canvas: every word and the chrome hidden for the picture
  expect(await canvasSpread(page)).toBeGreaterThan(8);
});

test('landscape-4 scrolling moves the story forward and back: the wheel on a desktop, a scroll on a phone', async ({ page, isMobile }) => {
  test.setTimeout(180_000);
  // ?reduced: no idle sway, so the camera moves only because the story did (with the sway, it moves every frame)
  await open(page, '/ai-landscape/', 'low', '&reduced');
  // (the scene says ready before its first section has arrived: the opening sets the camera when it mounts, some
  // tenths of a second later, which on a quick machine is more than three frames. The measure starts once it has)
  await page.waitForFunction(() => window.__landscape.opening && window.__landscape.opening.t > 0, null, { timeout: 60_000 });
  await frames(page, 3);
  const still = await hook(page);
  await frames(page, 6);
  expect((await hook(page)).camera, 'with no scroll the camera holds').toEqual(still.camera);
  const before = await hook(page);
  expect(before.section).toBe('top');
  if (isMobile) await page.evaluate(() => window.scrollBy(0, innerHeight * 3));
  else {
    await page.mouse.move(720, 450);
    for (let k = 0; k < 3; k++) await page.mouse.wheel(0, 900);
  }
  await expect.poll(async () => (await hook(page)).section, { timeout: 30_000 }).toBe('layers');
  const after = await hook(page);
  expect(after.progress).toBeGreaterThan(before.progress + 0.05);
  expect(after.camera).not.toEqual(before.camera);
  if (isMobile) await page.evaluate(() => window.scrollTo(0, 0));
  else for (let k = 0; k < 3; k++) await page.mouse.wheel(0, -900);
  await expect.poll(async () => (await hook(page)).section, { timeout: 30_000 }).toBe('top');
  expect((await hook(page)).progress).toBeLessThan(after.progress);
});

test('landscape-5 moving the pointer turns the camera, and it comes back with the pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a phone has no pointer: touch gets the idle sway instead');
  test.setTimeout(180_000);
  await open(page);
  // the intro (a dolly zoom of about 3.5 s) first; a pointer move also ends the idle tour
  await page.waitForFunction(() => window.__landscape.opening && window.__landscape.opening.t > 4, null, { timeout: 60_000 });
  const x = async () => (await hook(page)).camera.x;
  // the orbit eases in with the page's weight: 30 frames is most of the way. Across the window the pointer turns the
  // camera 0.086 rad (about 2.4 units here), the idle sway at most 0.016 rad
  await page.mouse.move(200, 450);
  await frames(page, 30);
  const left = await x();
  await page.mouse.move(1240, 450);
  await expect.poll(async () => Math.abs(await x() - left), { timeout: 60_000 }).toBeGreaterThan(1.5);
  await page.mouse.move(200, 450);
  await expect.poll(async () => Math.abs(await x() - left), { timeout: 60_000 }).toBeLessThan(0.9);
});

// The text version reads on its own: every section's heading shows, words show in it, and each world shows its
// picture and its nine floors.
async function readable(page) {
  expect(await page.evaluate(() => document.documentElement.classList.contains('ail-gl'))).toBe(false);
  expect((await hook(page)).tier).toBe('static');
  await expect(page.locator('.ail-rail')).toBeHidden();
  const ids = await page.locator('main > section').evaluateAll((ss) => ss.map((s) => s.id));
  expect(ids.length).toBeGreaterThan(10);
  for (const id of ids) {
    const sec = page.locator(`main > section#${id}`);
    const head = page.locator(`#${await sec.getAttribute('aria-labelledby')}`);
    await head.scrollIntoViewIfNeeded();
    expect(await head.evaluate((h) => h.checkVisibility({ opacityProperty: true, visibilityProperty: true })), id).toBe(true);
    expect((await onScreen(page, `main > section#${id}`)).length, id).toBeGreaterThan(2);
    if (!COMPANIES.includes(id)) continue;
    const plate = sec.locator('.ail-world__plate');
    await plate.scrollIntoViewIfNeeded();
    await expect.poll(() => plate.evaluate((i) => i.complete && i.naturalWidth), { timeout: 15_000 }).toBeGreaterThan(0);
    const floors = sec.locator('.ail-doors [data-agent] .ail-stack > .ail-floor');
    await expect(floors).toHaveCount(9);
    await floors.first().scrollIntoViewIfNeeded();
    expect(await floors.evaluateAll((fs) => fs.every((f) => f.checkVisibility({ opacityProperty: true, visibilityProperty: true }))), id).toBe(true);
  }
}

test('landscape-6 without WebGL every section is still readable, as the text version', async ({ browserName, baseURL }) => {
  test.skip(browserName !== 'chromium', 'the switch is a Chromium flag');
  test.setTimeout(120_000);
  const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2'] });
  const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/ai-landscape/');
  await page.waitForFunction(() => window.__landscape && window.__landscape.ready, null, { timeout: 30_000 });
  await expect(page.locator('#ail-gl')).toBeHidden();
  await readable(page);
  expect(errors).toEqual([]);
  await browser.close();
});

test('landscape-6b the skip link, first on the page, switches to the same text version, even after the 3D has run and the window changes size', async ({ page, isMobile }) => {
  test.setTimeout(240_000);
  await open(page);
  await light(page);
  // walk into three worlds first: the sections write inline styles the text version must not keep
  for (const [id, u] of [['top', 0.8], ['anthropic', 1.2], ['anthropic', 2.2], ['openai', 1.2], ['google', 1.2], ['google', 2.0]]) await go(page, id, u, 300);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  if (isMobile) await page.locator('.ail-skip').focus(); else await page.keyboard.press('Tab');
  await expect(page.locator('.ail-skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await hook(page)).tier).toBe('static');
  // a resize in the text version keeps the text version's own layout (no 3D section heights come back)
  await page.setViewportSize(isMobile ? { width: 400, height: 800 } : { width: 1280, height: 800 });
  await page.waitForTimeout(800);
  expect(await page.locator('main [style]').evaluateAll((els) => els.map((e) => `${e.tagName}.${e.className}: ${e.getAttribute('style')}`))).toEqual([]);
  expect(await page.locator('main > section').evaluateAll((ss) => ss.filter((s) => s.style.height).map((s) => s.id))).toEqual([]);
  await readable(page);
});

test('landscape-7 reduced motion: the page scrolls natively, the story arrives at once, nothing moves by itself, and every section shows', async ({ page, isMobile }) => {
  test.setTimeout(1_800_000);   // 54 stops: alone about 1.5 min, many times that beside three other WebGL walks on 4 cores
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await light(page);
  // no scroll-jacking: the wheel scrolls the page by its own amount, and the story is where the page is, unlagged
  if (isMobile) await page.evaluate(() => window.scrollTo(0, 1800));
  else { await page.mouse.move(720, 450); await page.mouse.wheel(0, 1800); }
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 15_000 }).toBeGreaterThan(1700);
  await frames(page, 2);
  expect(await page.evaluate(() => { const c = window.__landscape.debug.ctx.clock; return Math.abs(c.s - c.target); })).toBe(0);
  // with no input nothing moves: no intro, orbit, sway or tour
  await frames(page, 4);
  const still = (await hook(page)).camera;
  await frames(page, 10);
  expect((await hook(page)).camera).toEqual(still);
  // no position shows an empty screen (SPEC 7.2): words in <main>, or where the scene speaks alone (the row of five
  // between the opening and the nine layers, the ending's first move) a picture on the canvas
  for (const s of await sections(page)) {
    for (const u of [0.15, 0.5, 0.85]) {
      await go(page, s.id, u * s.screens, 300);
      if ((await onScreen(page, 'main')).length > 0) continue;
      expect(await canvasSpread(page), `${s.id} at ${u}: no words, and the canvas`).toBeGreaterThan(8);
    }
  }
});

// What one stop of the 3D page must hold (review round 1): every visible piece of the lit stage inside the window (the
// stage is fixed, so the document's width never sees it), nothing that takes focus at an opacity under 0.1, nothing of
// another section under nine points of the window, a lid mark wholly shown or wholly gone, no type under 12 px (14 for
// a fact, a sentence, a paragraph or a list row), and the draw calls inside their budget.
const STOP = () => {
  const out = { outside: [], ghosts: [], foreign: [], lids: [], small: [], calls: window.__landscape.debug.ctx.renderer.info.render.calls };
  const cur = window.__landscape.section;
  const eff = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
  const seen = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05 || n.classList.contains('ail-vh') || cs.clipPath.includes('inset(50%)')) return false;
    }
    if (!el.checkVisibility()) return false;              // the inside of a closed <details> is laid out but not drawn
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  };
  const name = (el) => `${el.tagName}.${String(el.className).split(' ')[0]} "${(el.textContent || '').trim().slice(0, 24)}"`;
  const stage = document.querySelector('main .ail-stage.is-on');
  // (a piece inside a row that scrolls sideways is held by that row: the row is what must stay inside)
  const scrolled = (el) => { for (let n = el.parentElement; n && n !== stage; n = n.parentElement) if (getComputedStyle(n).overflowX !== 'visible') return true; return false; };
  for (const el of stage ? stage.querySelectorAll('*') : []) {
    if (!seen(el) || scrolled(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > innerWidth + 2 || r.left < -2) out.outside.push(`${name(el)} ${Math.round(r.left)}..${Math.round(r.right)}`);
  }
  for (const el of document.querySelectorAll('main a[href], main button, main summary, main [tabindex]:not([tabindex="-1"])')) {
    if (el.disabled || el.closest('[inert]') || !el.checkVisibility({ visibilityProperty: true }) || !el.getClientRects().length || el.classList.contains('ail-vh')) continue;
    if (eff(el) < 0.1) out.ghosts.push(`${el.closest('main > section').id} ${name(el)}`);
  }
  for (const fx of [0.1, 0.5, 0.9]) for (const fy of [0.15, 0.5, 0.85]) {
    const el = document.elementFromPoint(innerWidth * fx, innerHeight * fy);
    const sec = el && el.closest('main > section');
    if (sec && sec.id !== cur) out.foreign.push(`${fx},${fy}: ${sec.id} ${name(el)}`);
  }
  for (const img of document.querySelectorAll('.ail-lidmark')) { const o = Number(getComputedStyle(img).opacity); if (o > 0.001 && o < 0.999 && img.checkVisibility()) out.lids.push(o.toFixed(2)); }
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    const el = t.parentElement;
    if (!/[\p{L}\p{N}]/u.test(t.textContent) || el.closest('script, style, .ail-live') || !seen(el)) continue;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    // a label (the mono face: tags, keys, numbers, notes) is 12 px wherever it stands; words that state something are 14
    const label = /mono/i.test(cs.fontFamily) || el.closest('.ail-label');
    const floor = el.closest('.ail-fact, .ail-sentence, p, li') && !label ? 14 : 12;
    if (px < floor - 0.01) out.small.push(`${px}px < ${floor}: ${name(el)}`);
  }
  return out;
};

test('landscape-8 nothing runs off the side or stands out of reach, in any section, 3D or text: every stage piece inside the window, no invisible control, no other section under a finger, plates whole or gone, no small type, draw calls in budget', async ({ page }) => {
  test.setTimeout(1_800_000);   // 54 stops: alone about 2 min, many times that beside three other WebGL walks on 4 cores
  const wide = () => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
  await open(page);
  await light(page);
  const bad = [];
  for (const s of await sections(page)) {
    for (const u of [0.1, 0.5, 0.9]) {
      await go(page, s.id, u * s.screens, 500);
      expect(await wide(), `${s.id} at ${u}`).toBeLessThanOrEqual(0);
      const r = await page.evaluate(STOP);
      const budget = s.name === 'worlds' ? CALLS.world : CALLS.studio;
      for (const [k, list] of Object.entries(r)) if (Array.isArray(list) && list.length) bad.push(`${s.id} at ${u}: ${k}: ${list.slice(0, 4).join(' | ')}`);
      if (r.calls > budget) bad.push(`${s.id} at ${u}: ${r.calls} draw calls, over ${budget}`);
    }
  }
  expect(bad).toEqual([]);
  await open(page, '/ai-landscape/', 'static');
  for (const y of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((y) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * y), y);
    expect(await wide(), `text version at ${y}`).toBeLessThanOrEqual(0);
  }
  for (const path of SOURCES) { await page.goto(path); expect(await wide(), path).toBeLessThanOrEqual(0); }
});

test('landscape-9 the five companies are reachable from the keyboard, and every link on the page answers', async ({ page, request, baseURL }) => {
  test.setTimeout(480_000);
  await open(page);
  for (const id of COMPANIES) {
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
    let k = 0;
    while (k++ < 30 && !(await page.evaluate((id) => document.activeElement.matches(`.ail-map__col[data-p="${id}"]`), id))) await page.keyboard.press('Tab');
    await expect(page.locator(`.ail-map__col[data-p="${id}"]`)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await hook(page)).world, { timeout: 30_000 }).toBe(id);
    expect(new URL(page.url()).hash).toBe(`#${id}`);
  }
  // every link: a hash names an element of the page, an address of this site answers 200 (its fragment an element
  // of that page), and anything else is https
  const origin = new URL(baseURL).origin;
  for (const path of [...PAGES, ...SOURCES]) {
    await page.goto(path + (SOURCES.includes(path) ? '' : '?tier=static'));
    const hrefs = [...new Set(await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))];
    expect(hrefs.length, path).toBeGreaterThan(0);
    const pages = new Map();
    for (const href of hrefs) {
      if (href.startsWith('#')) { expect(await page.locator(`[id="${href.slice(1)}"]`).count(), `${path} ${href}`).toBe(1); continue; }
      const u = new URL(href, origin + path);
      if (u.origin !== origin) { expect(u.protocol, href).toBe('https:'); continue; }
      if (!pages.has(u.pathname)) pages.set(u.pathname, new Set());
      if (u.hash) pages.get(u.pathname).add(u.hash.slice(1));
    }
    for (const [p, frags] of pages) {
      const response = await request.get(p);
      expect(response.status(), `${path} links ${p}`).toBe(200);
      const html = await response.text();
      for (const f of frags) expect(html.includes(`id="${f}"`), `${path} links ${p}#${f}`).toBe(true);
    }
  }
});

// The stops of a walk, in screens from a section's start: every beat of a world, every step of the nine layers.
const STOPS = {
  worlds: [0.12, 0.34, 0.5, 0.62, 0.95, 1.3, 1.55, 2.0, 2.45, 2.62, 2.8, 2.93],
  opening: [0, 0.3, 0.6, 1.0, 1.4],
  grammar: [0.1, 0.2, 0.39, 0.67, 0.95, 1.23, 1.58, 1.94, 2.22, 2.5, 2.78, 3.0, 3.24, 3.36, 3.46],      // (3.24: the two floors left above the ground)
  lineup: [0.1, 0.25, 0.44, 0.63, 0.82, 1.01, 1.2, 1.39, 1.58, 1.77, 1.92],      // each of the nine floors, and the rest after them
};
const stopsOf = (s) => (STOPS[s.name] || [0.05, 0.3, 0.6, 0.9].map((f) => +(f * s.screens).toFixed(2))).filter((u) => u <= s.screens);

test('landscape-10 never more than 60 words on screen at first depth (80 on a board), in any state of the walk, and a world\'s nine floors whole while they are open', async ({ page }) => {
  test.setTimeout(1_800_000);   // 80 stops: alone about 4 min, many times that beside three other WebGL walks on 4 cores
  await open(page);
  await light(page);
  const over = [];
  let most = 0;
  for (const s of await sections(page)) {
    for (const u of stopsOf(s)) {
      await go(page, s.id, u);
      const words = await onScreen(page);
      const cap = await page.evaluate(() => !!document.querySelector('.ail-stage.is-on[data-board]')) ? BOARD_MAX : WORDS_MAX;
      most = Math.max(most, words.length);
      if (words.length > cap) over.push(`${s.id} at ${u}: ${words.length} words, over ${cap}: ${words.join(' ')}`);
      // a world's open beat holds its nine floors whole, from 0.95 to 1.6 screens: nothing rests half-faded (D06)
      // (they arrive on time, 0.77 s, counted in drawn frames: on a busy box the count is read again for up to 3 s)
      if (s.name === 'worlds' && u >= 0.95 && u <= 1.6) {
        const count = () => page.evaluate((id) => [...document.querySelectorAll(`#${id} .ail-doors [data-agent] .ail-stack > .ail-floor`)].filter((f) => {
          let o = 1; for (let n = f; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          return o >= 0.98 && f.checkVisibility({ visibilityProperty: true });
        }).length, s.id);
        let whole = await count();
        for (let k = 0; k < 6 && whole !== 9; k++) { await page.waitForTimeout(500); whole = await count(); }
        if (whole !== 9) over.push(`${s.id} at ${u}: ${whole} of nine floors whole`);
      }
    }
  }
  console.log(`landscape-10 ${test.info().project.name}: at most ${most} words on screen over the walk`);
  expect(over).toEqual([]);
  expect(most).toBeGreaterThan(0);
});

// ---- landscape-11: the strings of a snapshot, from its own view model and copy file
const VIEWS = new Map();
async function corpusOf(date) {
  if (VIEWS.has(date)) return VIEWS.get(date);
  const { view } = await import(`../../src/components/ai-landscape/${date}/data/view.js`);
  const { COPY } = await import(`../../src/components/ai-landscape/${date}/data/copy.js`);
  const strings = [];
  const seen = new Set();
  (function walk(n) {
    if (typeof n === 'string' || typeof n === 'number') return void strings.push(String(n));
    if (!n || typeof n !== 'object' || seen.has(n)) return;
    seen.add(n);
    Object.values(n).forEach(walk);
  })({ view: { ...view, json: null }, COPY, SNAPSHOTS });
  // the world configs hold no facts, only the pictures' descriptions (SPEC 6.3): alt text and a portrait's caption
  const dir = new URL(`../../src/scripts/ai-landscape/${date}/worlds/`, import.meta.url);
  const alt = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).flatMap((f) => [...fs.readFileSync(new URL(f, dir), 'utf8').matchAll(/\balt: \{([^}]*)\}/g)])
    .flatMap((m) => [...m[1].matchAll(/\w+: '((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'")));
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const out = { text: strings.map(norm).join('\n'), alt: alt.map(norm).join('\n'),
    entries: new Set(strings.map(norm).filter(Boolean).map((s) => s.replace(/[.:,;]+$/, '').toLowerCase())) };
  VIEWS.set(date, out);
  return out;
}
// A string traces when it stands in the corpus whole (between word edges), or splits at separators into pieces that
// are each a whole string of the corpus or a number the corpus holds: "4 more", "Claude Code + Opus 5.5.", "kind ·
// 2026-11-01". Made of the corpus's own names and numbers, a new name could still pass: this catches typed copy.
const SEP = /[\s·+“”‘’"()[\],.:;/$%=×–-]/u;
const LETTER = /[\p{L}\p{N}]/u;
function within(hay, s) {
  for (let i = hay.indexOf(s); i >= 0; i = hay.indexOf(s, i + 1)) {
    if (!LETTER.test(hay[i - 1] || ' ') && !LETTER.test(hay[i + s.length] || ' ')) return true;
  }
  return false;
}
function traces(s, { text, entries }) {
  if (within(text, s)) return true;
  const ok = new Array(s.length + 1).fill(false);
  ok[0] = true;
  for (let i = 0; i < s.length; i++) {
    if (!ok[i]) continue;
    if (SEP.test(s[i])) { ok[i + 1] = true; continue; }
    for (let j = i + 1; j <= s.length; j++) {
      if (j < s.length && !SEP.test(s[j])) continue;
      const piece = s.slice(i, j);
      if (entries.has(piece.toLowerCase()) || (/^\d[\d.-]*$/.test(piece) && within(text, piece))) ok[j] = true;
    }
  }
  return ok[s.length];
}
// Every text node of the document, hidden or not, and every alt, aria-label and title, with where it stands.
const strings = (page) => page.evaluate(() => {
  const out = [{ s: document.title, at: 'title' }, { s: document.querySelector('meta[name="description"]').content, at: 'description' }];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    if (t.parentElement.closest('script, style')) continue;
    out.push({ s: t.textContent, at: t.parentElement.className || t.parentElement.tagName });
  }
  for (const el of document.querySelectorAll('[alt], [aria-label], [title]')) {
    for (const a of ['alt', 'aria-label', 'title']) if (el.hasAttribute(a)) out.push({ s: el.getAttribute(a), at: `@${a}` });
  }
  return out.map((x) => ({ ...x, s: x.s.replace(/\s+/g, ' ').trim() })).filter((x) => /\p{L}/u.test(x.s));
});

test('landscape-11 every string on the page is found in the view model or the copy file, and every cell stands under its company and layer', async ({ page }) => {
  test.setTimeout(1_200_000);
  const missing = new Set();
  const check = (list, corpus, path) => {
    for (const { s, at } of list) {
      const picture = at === '@alt' || /\bail-world__caption\b/.test(at);
      if (!traces(s, picture ? { ...corpus, text: `${corpus.text}\n${corpus.alt}` } : corpus)) missing.add(`${path} [${at}] ${s}`);
    }
  };
  const misplaced = [];
  for (const date of SNAPSHOTS.map((x) => x.date)) {
    const corpus = await corpusOf(date);
    for (const path of [`/ai-landscape/${date}/?tier=static`, `/ai-landscape/${date}/sources/`]) {
      await page.goto(path);
      check(await strings(page), corpus, path);
    }
    // and each cell stands where the view puts it: the line-up's 45 and every world's nine floors, by company and layer
    // (a string can exist in the corpus and still sit under the wrong company)
    const { view } = await import(`../../src/components/ai-landscape/${date}/data/view.js`);
    await page.goto(`/ai-landscape/${date}/?tier=static`);
    const want = Object.fromEntries(view.providers.map((p) => [p.id, p.stack.map((c) => ({ name: c.name || c.word, fact: c.fact ? c.fact.id : null }))]));
    const got = await page.evaluate(() => ({
      lineup: [...document.querySelectorAll('tr.ail-lu__row')].map((tr) => [...tr.querySelectorAll('td.ail-lu__cell')].map((td) => ({ p: td.dataset.p,
        name: td.querySelector('.ail-lu__ans').textContent.trim(), fact: td.querySelector('.ail-fact') ? td.querySelector('.ail-fact').dataset.fact : null }))),
      worlds: Object.fromEntries([...document.querySelectorAll('main > section.ail-world')].map((s) => [s.id, [...s.querySelectorAll('.ail-doors [data-agent] .ail-stack > .ail-floor')]
        .map((f) => ({ i: Number(f.dataset.i), fact: f.querySelector('.ail-floor__v .ail-fact') ? f.querySelector('.ail-floor__v .ail-fact').dataset.fact : null }))])),
    }));
    expect(got.lineup.length, 'nine line-up rows').toBe(9);
    got.lineup.forEach((row, i) => row.forEach((c) => {
      const w = want[c.p][i];
      if (c.name !== w.name.replace(/\s+/g, ' ') || c.fact !== w.fact) misplaced.push(`${date} line-up ${c.p} floor ${i + 1}: "${c.name}" ${c.fact} where the view has "${w.name}" ${w.fact}`);
    }));
    for (const [id, floors] of Object.entries(got.worlds)) {
      expect(floors.length, `${id} has nine floors`).toBe(9);
      for (const f of floors) if (f.fact !== want[id][f.i].fact) misplaced.push(`${date} ${id} floor ${f.i + 1}: ${f.fact} where the view has ${want[id][f.i].fact}`);
    }
  }
  expect(misplaced).toEqual([]);
  // the 3D page writes words of its own (the rail, the live region, callouts): read them at every section
  const corpus = await corpusOf(NEWEST);
  await open(page);
  await light(page);
  for (const s of await sections(page)) {
    for (const u of [0.3, 0.7].map((f) => f * s.screens)) {
      await go(page, s.id, u, 300);
      check(await strings(page), corpus, `/ai-landscape/ ${s.id} at ${u.toFixed(2)}`);
    }
  }
  expect([...missing]).toEqual([]);
});

// ---- review round 1: the failure paths (E02 to E09) and the states a scroll alone must change (D01, D07, D08, D19)

// The scene's own chunk (the one that imports the sections), and a section's or a signature's, by their first word.
const chunkOf = (word) => fs.readdirSync('dist/_astro').filter((f) => f.startsWith(`${word}.`) && f.endsWith('.js'))
  .filter((f) => word !== 'scene' || /sections|signatures/.test(fs.readFileSync(`dist/_astro/${f}`, 'utf8')));

test('landscape-12 one frame loop however often the tab is hidden and shown again', async ({ page }) => {
  test.setTimeout(180_000);
  // Playwright never hides a tab, so this does what browsers do: document.hidden is true and frame callbacks already
  // asked for wait, without being dropped, until the tab is shown. Then the loop must run once a rendered frame.
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window);
    let hidden = false;
    const held = [];
    window.__stamps = new Set();
    Object.defineProperty(document, 'hidden', { get: () => hidden, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => (hidden ? 'hidden' : 'visible'), configurable: true });
    window.requestAnimationFrame = (cb) => raf(function tick(t) { if (hidden) { held.push(cb); return; } window.__stamps.add(t); cb(t); });
    window.__setHidden = (h) => {
      hidden = h;
      document.dispatchEvent(new Event('visibilitychange'));
      if (!h) held.splice(0).forEach((cb) => raf((t) => { window.__stamps.add(t); cb(t); }));
    };
  });
  await open(page);
  await light(page);
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => window.__setHidden(true));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__setHidden(false));
    await page.waitForTimeout(400);
  }
  const a = await page.evaluate(() => { window.__stamps.clear(); return window.__landscape.frames; });
  await frames(page, 20);
  const b = await page.evaluate(() => ({ f: window.__landscape.frames, n: window.__stamps.size }));
  expect((b.f - a) / b.n, 'loop runs a rendered frame').toBeLessThanOrEqual(1.1);
});

test('landscape-13 the skip link pressed before the scene arrives gives the whole text version, and the scene that arrives later stays out', async ({ page, isMobile }) => {
  test.setTimeout(180_000);
  const names = chunkOf('scene');
  expect(names.length).toBe(1);
  await page.route('**/_astro/*.js', async (route) => { if (names.some((n) => route.request().url().endsWith(n))) await new Promise((r) => setTimeout(r, 4000)); await route.continue(); });
  await page.goto('/ai-landscape/?tier=low');
  await page.waitForFunction(() => window.__landscape && window.__landscape.tier === 'low');
  if (isMobile) await page.locator('.ail-skip').focus(); else await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  expect(await page.evaluate(() => document.documentElement.className)).not.toMatch(/ail-3d|ail-gl/);
  expect((await hook(page)).tier).toBe('static');
  for (const id of COMPANIES) expect(await page.locator(`#${id}-name`).evaluate((h) => h.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && getComputedStyle(h).color !== 'rgba(0, 0, 0, 0)' && getComputedStyle(h).position !== 'fixed'), id).toBe(true);
  await page.evaluate(() => { location.hash = '#google'; });
  await expect.poll(() => page.locator('#google-name').evaluate((h) => Math.round(h.getBoundingClientRect().top))).toBeGreaterThanOrEqual(0);
  expect(await page.locator('#google-name').evaluate((h) => h.getBoundingClientRect().top)).toBeLessThan(await page.evaluate(() => innerHeight));
});

test('landscape-14 a resize keeps the place: a phone turned sideways reads the text version there and turns back into the 3D world; a tablet across 899 px equals a fresh load; a short window reads the text version', async ({ page, isMobile, browser, baseURL }) => {
  test.setTimeout(600_000);
  const mid = () => page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const s = e && e.closest('main > section'); return s ? s.id : null; });
  const size = isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  await page.setViewportSize(size);
  await open(page);
  await light(page);
  await go(page, 'google', 1.2, 600);
  await page.setViewportSize({ width: size.height, height: Math.min(size.width, 520) });       // sideways: under 540 px tall
  await expect.poll(async () => (await hook(page)).tier, { timeout: 15_000 }).toBe('static');
  expect(await mid()).toBe('google');
  await page.setViewportSize(size);
  await expect.poll(async () => (await hook(page)).world, { timeout: 30_000 }).toBe('google');
  await expect(page.locator('html')).toHaveClass(/ail-gl/);
  if (isMobile) return;
  // a tablet turned across the breakpoint builds the scene again for its new layout: the same words as a fresh load
  const shown = (p) => p.evaluate(() => { const out = []; const w = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT); for (let t = w.nextNode(); t; t = w.nextNode()) { const el = t.parentElement; if (!t.textContent.trim() || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue; const r = el.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) out.push(t.textContent.trim()); } return out.join(' | '); });
  await page.setViewportSize({ width: 1024, height: 768 });
  await go(page, 'top', 0, 0);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForFunction(() => window.__landscape.ready && window.__landscape.tier === 'low' && window.__landscape.frames > 0, null, { timeout: 60_000 });
  // the scene's canvas, made afresh after the text version and again across the breakpoint, is still the one Astro
  // built: fixed behind the page and hidden from a screen reader (one stripped of its attributes stood in the flow, a
  // screen tall, and pushed the reader a screen into the opening)
  expect(await page.evaluate(() => { const c = document.querySelector('canvas#ail-gl.ail-canvas[aria-hidden="true"]'); return c ? getComputedStyle(c).position : 'gone'; }), 'the canvas keeps its class, id and aria-hidden').toBe('fixed');
  expect(await page.evaluate(() => scrollY), 'the reader is still at the top').toBe(0);
  // both are read in the same state: the opening has drawn itself in and its tour has begun (4 s with no input), and
  // the tour's chip has faded in. A fixed wait of 5 s read one page just before its tour and the other just after,
  // on a machine quick enough to get there in 5 s; a fixed 900 ms after the tour began read a fresh page's chip still
  // at opacity 0 on a machine that draws three frames a second (a CSS fade moves only with the frames)
  const toured = async (p) => {
    await p.waitForFunction(() => window.__landscape.opening && window.__landscape.opening.tour === 'on', null, { timeout: 90_000 });
    await p.waitForFunction(() => getComputedStyle(document.querySelector('.ail-open__tour')).opacity === '1', null, { timeout: 30_000 });
    await p.waitForTimeout(400);
  };
  await toured(page);
  const fresh = await browser.newPage({ baseURL, viewport: { width: 768, height: 1024 } });
  await open(fresh);
  await toured(fresh);
  expect(await shown(page)).toBe(await shown(fresh));
  await fresh.close();
  // a desktop window made short (1440 by 900 at 200 percent) reads the text version, its boxes in flow
  await page.setViewportSize({ width: 720, height: 450 });
  await expect.poll(async () => (await hook(page)).tier, { timeout: 15_000 }).toBe('static');
  expect(await page.locator('main [style]').count()).toBe(0);
});

test('landscape-15 a lost WebGL context keeps the reader in the same section, with focus on its heading and a word in the live region; an unpinned page on software WebGL gives up within 10 s', async ({ page, browserName, browser, baseURL }) => {
  test.skip(browserName !== 'chromium', 'WEBGL_lose_context and the watchdog\'s timing are checked once');
  test.setTimeout(300_000);
  await open(page);
  await light(page);
  await go(page, 'google', 1.3, 600);
  await page.evaluate(() => window.__landscape.debug.ctx.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
  await expect.poll(async () => (await hook(page)).tier).toBe('static');
  expect(await page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return e && e.closest('main > section') && e.closest('main > section').id; })).toBe('google');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('google-name');
  expect(await page.locator('.ail-live').textContent()).toMatch(/\S/);
  // no ?tier=: the watchdog hears real frame times and steps down to the text version
  const unpinned = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 } });
  await unpinned.goto('/ai-landscape/');
  await unpinned.waitForFunction(() => window.__landscape && window.__landscape.ready && window.__landscape.frames > 0, null, { timeout: 60_000 });
  const t0 = Date.now();
  await unpinned.waitForFunction(() => window.__landscape.tier === 'static', null, { timeout: 30_000 });
  expect(Date.now() - t0, 'ms from the first frame to the text version').toBeLessThan(10_000);
  await unpinned.close();
});

test('landscape-22 the watchdog knows a display that hands out 30 frames a second from a machine that is slow: the first keeps its 3D page, the second steps down and then reads as text', async ({ page }) => {
  test.setTimeout(180_000);
  await open(page);
  // the shipped watchdog (core/quality.js), a fresh one, fed steady frames: judge(frame ms, the display's own pace in ms)
  const judge = (frame, pace, seconds = 60) => page.evaluate(([f, p, s]) => window.__landscape.debug.judge(f, p, s), [frame, pace, seconds]);
  for (const [frame, pace] of [[8.3, 8.3], [16.7, 16.7], [20, 16.7], [33.4, 33.4], [36, 33.4], [22.3, 22.3]]) {
    const r = await judge(frame, pace);
    expect(r.gaveUp, `${frame} ms frames on a ${pace} ms display keep the 3D page`).toBeNull();
    expect(r.steps, `${frame} ms frames on a ${pace} ms display step down nothing`).toBe(0);
  }
  // a slow machine: 33 ms frames on a 60 a second display, 60 ms frames on a 30 a second one, 100 ms frames anywhere
  for (const [frame, pace] of [[33.4, 16.7], [60, 33.4], [100, 16.7], [100, 0]]) {
    const r = await judge(frame, pace);
    expect(r.steps, `${frame} ms frames on a ${pace} ms display step down`).toBeGreaterThan(0);
    expect(r.gaveUp, `${frame} ms frames on a ${pace} ms display end in the text version`).not.toBeNull();
    expect(r.gaveUp).toBeLessThan(20);
  }
  // a machine that draws a frame in 0.7 s (software WebGL) is not walked through every rung, a window of a frozen page
  // each: one leap takes them all, and the next window as slow gives up
  const hopeless = await judge(700, 16.7);
  expect(hopeless.steps, '0.7 s frames take every step at once').toBe(1);
  expect(hopeless.gaveUp, '0.7 s frames read as text after two windows').toBeLessThan(4.5);
  // but a stall alone is not a slow machine: good frames after it give the whole leap back, and the page keeps its 3D
  const stall = await page.evaluate(() => window.__landscape.debug.judge([[700, 2.2], [16.7, 30]], 16.7));
  expect(stall.gaveUp, 'a 2 s stall then good frames keeps the 3D page').toBeNull();
  expect([stall.dust, stall.props], 'and gets its dust and props back').toEqual([120, 2]);
  // a stall while the page loads is not a display's pace: the limit never passes 45 ms, and with no pace known it is 21
  expect((await judge(16.7, 400)).limit).toBe(45);
  expect((await judge(16.7, 0)).limit).toBe(21);
  // and the page's own watchdog is handed the display's pace on every load, the fast ones from the cache too: a scene
  // that arrived within four frames left it with none, at 21 ms, and a 30 a second display read as a slow machine
  for (let load = 1; load <= 6; load++) {
    if (load > 1) await open(page);
    const { pace, limit } = await page.evaluate(() => ({ pace: window.__landscape.debug.pace, limit: window.__landscape.debug.limit }));
    expect(pace, `load ${load} knows the display's pace`).toBeGreaterThan(0);
    expect(limit, `load ${load}: the limit follows that pace`).toBeCloseTo(Math.max(21, Math.min(45, pace * 1250)), 6);
  }
});

test('landscape-16 Tab and Enter alone reach a control in every section, each one seen; a rail link puts focus on its section\'s heading', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a phone has no Tab key: the minimap and the scroll lead');
  test.setTimeout(1_500_000);   // some 240 Tabs, each read 600 ms later: alone about 7 min, longer beside other walks
  await open(page);
  await light(page);
  const snap = await page.locator('body').ariaSnapshot();
  expect(snap, 'the hidden heading link to the whole text version is in the tree at the top').toMatch(/heading "Text version[^\n]*\n\s*- '?link "Text version/);
  const ids = await page.locator('main > section').evaluateAll((ss) => ss.map((s) => s.id));
  const reached = new Set();
  const dim = [];
  let outside = 0;
  for (let k = 0; k < 600 && reached.size < ids.length; k++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(600);
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      const sec = el && el.closest('main > section');
      return { sec: sec ? sec.id : '', body: el === document.body, op: o, next: el.classList.contains('ail-next'), vh: el.classList.contains('ail-vh'), skip: el.tabIndex < 0, what: `${el.tagName}.${el.className} "${(el.textContent || '').trim().slice(0, 24)}"` };
    });
    if (s.body) outside++;
    if (!s.sec) continue;
    reached.add(s.sec);
    if (s.op < 0.9 && !s.vh && !s.skip) dim.push(`${s.sec} ${s.what} ${s.op.toFixed(2)}`);
    if (s.next) { await page.keyboard.press('Enter'); await page.waitForTimeout(1500); }
  }
  expect(ids.filter((id) => !reached.has(id)), 'sections no Tab reached').toEqual([]);
  expect(outside, 'times focus fell out of the page').toBe(0);
  expect(dim, 'Tab stops faded under 0.9').toEqual([]);
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.waitForTimeout(800);
  await page.locator('.ail-rail a[href="#anthropic"]').focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => document.activeElement.id), { timeout: 30_000 }).toBe('anthropic-name');
  // and that focus is seen the moment it lands: the name's head stands at once (round 3, N-8: it was at opacity 0)
  expect(await page.evaluate(() => { let o = 1; for (let n = document.activeElement; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; }), 'the focused name is seen').toBeGreaterThanOrEqual(0.9);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.closest('main > section') && document.activeElement.closest('main > section').id)).toBe('anthropic');
});

test('landscape-17 a chunk lost to a deploy reloads the page once; with the reload spent, the page reads as text at that section, and a lost signature leaves no unhandled rejection', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the same rule on both: checked once');
  test.setTimeout(480_000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const gone = [...chunkOf('bestat'), ...chunkOf('anthropic')];
  await page.route('**/_astro/*.js', (route) => (gone.some((n) => route.request().url().endsWith(n)) ? route.fulfill({ status: 404, body: 'gone' }) : route.continue()));
  let loads = 0;
  page.on('load', () => { loads++; });
  // scroll toward a section as a reader does (its module is asked for when it is near); the page may reload under it
  const toward = async (id) => {
    for (const ds of [-2, -1, 1]) {
      await page.evaluate(([id, ds]) => { const l = window.__landscape; const c = l && l.debug && l.debug.ctx.clock; const s = c && c.sections.find((q) => q.id === id); if (s) window.scrollTo(0, c.pixels(s.s0 + ds)); }, [id, ds]).catch(() => {});
      await page.waitForTimeout(1200);
    }
  };
  await page.goto('/ai-landscape/?tier=low');
  await page.evaluate(() => sessionStorage.removeItem('ao-reloaded'));
  await page.reload();
  await page.waitForFunction(() => window.__landscape && window.__landscape.ready && window.__landscape.frames > 1, null, { timeout: 60_000 });
  await light(page);
  // the signature first: the world keeps its words and drops the signature's buttons, and nothing is unhandled
  await page.evaluate(() => sessionStorage.setItem('ao-reloaded', '1'));
  await toward('anthropic');
  await expect.poll(() => page.locator('#anthropic .ail-sig__ui button').evaluateAll((bs) => bs.length > 0 && bs.every((b) => b.hidden)), { timeout: 15_000 }).toBe(true);
  expect((await hook(page)).tier).toBe('low');
  expect(errors).toEqual([]);
  // best at with the reload free: one reload
  await page.evaluate(() => sessionStorage.removeItem('ao-reloaded'));
  const before = loads;
  await toward('best-at');
  await expect.poll(() => loads, { timeout: 20_000 }).toBe(before + 1);
  // and with it spent: the text version, at best at, its 22 rows shown
  await page.waitForFunction(() => window.__landscape && window.__landscape.ready, null, { timeout: 60_000 });
  await light(page).catch(() => {});
  await toward('best-at');
  await expect.poll(async () => (await hook(page)).tier, { timeout: 20_000 }).toBe('static');
  expect(await page.locator('#best-at .ail-bd__row').evaluateAll((rs) => rs.filter((r) => r.checkVisibility({ opacityProperty: true, visibilityProperty: true })).length)).toBe(22);
  expect(errors).toEqual([]);
});

test('landscape-18 a jump into a world leaves no other world\'s signature standing in it (D01)', async ({ page }) => {
  test.setTimeout(600_000);
  await open(page);
  await light(page);
  for (const id of COMPANIES) {
    // one scrollTo from wherever the last world left the page, with no jump of the clock: the clock flies past worlds
    await page.evaluate((id) => { const c = window.__landscape.debug.ctx.clock; window.scrollTo(0, c.pixels(c.sections.find((s) => s.id === id).s0 + 1.42)); }, id);
    await expect.poll(async () => (await hook(page)).world, { timeout: 30_000 }).toBe(id);
    await frames(page, 3);
    await page.waitForTimeout(2000);
    const foreign = await page.evaluate((id) => { const out = []; window.__landscape.debug.ctx.scene.traverse((o) => { if (o.userData.sig && o.userData.sig !== id && o.visible && (o.isMesh || o.isPoints || o.isLine)) { let v = true; for (let p = o.parent; p; p = p.parent) if (!p.visible) v = false; if (v) out.push(`${o.userData.sig} ${o.type}`); } }); return out; }, id);
    expect(foreign, `in ${id}`).toEqual([]);
  }
});

test('landscape-19 a scroll alone steps the comparisons: nine floors in the line-up, his four guesses and the board in best at, nine blocks around the five, five companies in billing (D07, D08, D19)', async ({ page }) => {
  test.setTimeout(600_000);
  await open(page);
  await light(page);
  const states = async (id, us, read) => { const out = []; for (const u of us) { await go(page, id, u, 600); out.push(await page.evaluate(read)); } return out; };
  const lit = await states('line-up', [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => 0.25 + 0.19 * k), () => [...document.querySelectorAll('tr.ail-lu__row')].findIndex((tr) => tr.classList.contains('is-lit')));
  expect(lit).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  // with no input the lit floor holds: no timer
  await page.waitForTimeout(5000);
  expect(await page.evaluate(() => [...document.querySelectorAll('tr.ail-lu__row')].findIndex((tr) => tr.classList.contains('is-lit')))).toBe(8);
  const best = await states('best-at', [0.1, 0.4, 0.85, 1.3, 1.75, 2.3], () => `${document.querySelector('#best-at').dataset.mode}:${[...document.querySelectorAll('#best-at .ail-ba__cap')].findIndex((c) => c.classList.contains('is-on'))}`);
  expect(new Set(best).size, `best at steps through ${best.join(' ')}`).toBeGreaterThanOrEqual(6);
  expect(best[0].startsWith('title')).toBe(true);
  expect(best[best.length - 1].startsWith('board')).toBe(true);
  const around = await states('around', [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => 0.12 + 0.11 * (k + 0.5)), () => [...document.querySelectorAll('#around .ail-ar__item')].findIndex((li) => li.classList.contains('is-active')));
  expect(around).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const billing = await states('billing', [0, 1, 2, 3, 4].map((k) => 0.1 + 0.16 * (k + 0.5)), () => [...document.querySelectorAll('#billing .ail-bill__pick')].findIndex((d) => d.getAttribute('aria-pressed') === 'true'));
  expect(billing, 'billing picks the five companies in turn').toEqual([0, 1, 2, 3, 4]);
});

// A window's animation frames held back and let go again, as a busy page delivers them late: what the page asked
// for in between runs when the hold ends. Also every WebGL context a canvas of the page was given.
const HOLD = () => {
  const raf = window.requestAnimationFrame.bind(window);
  const held = [];
  window.__hold = false;
  window.requestAnimationFrame = (cb) => raf((t) => { if (window.__hold) held.push(cb); else cb(t); });
  window.__release = () => { window.__hold = false; held.splice(0).forEach((cb) => raf(cb)); };
  window.__ctxs = [];
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...rest) { const c = get.call(this, kind, ...rest); if (c && /webgl/.test(kind) && this.isConnected && !window.__ctxs.includes(c)) window.__ctxs.push(c); return c; };
};
const liveContexts = (page) => page.evaluate(() => window.__ctxs.filter((c) => !c.isContextLost()).length);

test('landscape-20 a text version that starts in the two frames before a scene loads stays a text version: no scene arrives on it, no context is left behind, and the 3D page comes back whole; a frame that throws does not stop the page', async ({ page, isMobile }) => {
  test.setTimeout(300_000);
  await page.addInitScript(HOLD);
  const tall = isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const short = { width: tall.width, height: 480 };
  await page.setViewportSize(tall);
  await open(page);
  expect(await liveContexts(page)).toBe(1);
  await page.setViewportSize(short);
  await expect.poll(async () => (await hook(page)).tier, { timeout: 15_000 }).toBe('static');
  // grow (the 3D page is asked for, its scene two frames away), then shrink again before those frames run
  await page.evaluate(() => { window.__hold = true; });
  await page.setViewportSize(tall);
  await expect(page.locator('html')).toHaveClass(/ail-gl/);
  await page.setViewportSize(short);
  await expect(page.locator('html')).not.toHaveClass(/ail-gl/);
  await page.evaluate(() => window.__release());
  await page.waitForTimeout(6000);
  expect(await page.evaluate(() => document.documentElement.className)).not.toMatch(/ail-3d|ail-gl/);
  expect((await hook(page)).tier).toBe('static');
  for (const id of COMPANIES) expect(await page.locator(`#${id}-name`).evaluate((h) => h.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && getComputedStyle(h).color !== 'rgba(0, 0, 0, 0)' && getComputedStyle(h).position !== 'fixed'), id).toBe(true);
  expect(await liveContexts(page), 'WebGL contexts alive under the text version').toBe(0);
  // and back: one scene, one context
  await page.setViewportSize(tall);
  await page.waitForFunction(() => window.__landscape.ready && window.__landscape.tier === 'low' && window.__landscape.frames > 1, null, { timeout: 60_000 });
  await expect(page.locator('html')).toHaveClass(/ail-3d/);
  expect(await liveContexts(page)).toBe(1);
  // one frame that throws is dropped and the next draws: the page still follows the scroll
  await light(page);
  await go(page, 'line-up', 0.5, 300);
  await page.evaluate(() => { const r = window.__landscape.debug.ctx.row; const u = r.update; let once = true; r.update = function (...a) { if (once) { once = false; throw new Error('one bad frame'); } return u.apply(this, a); }; });
  await frames(page, 4);
  await go(page, 'google', 1.2, 300);
  expect((await hook(page)).world).toBe('google');
  expect((await hook(page)).tier).toBe('low');
});

// Every pair of visible text boxes of the page that print over each other by more than 2 px both ways. Two lines of
// one block never count (a line box is taller than its ink), nor a word inside the block that holds it.
const OVERLAPS = () => {
  const seen = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.3 || n.classList.contains('ail-vh') || cs.clipPath.includes('inset(50%)')) return false;
    }
    return el.checkVisibility({ visibilityProperty: true });
  };
  const boxes = [];
  const range = document.createRange();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walk.nextNode(); t; t = walk.nextNode()) {
    const el = t.parentElement;
    if (!/[\p{L}\p{N}]/u.test(t.textContent) || el.closest('script, style, .ail-live') || !seen(el)) continue;
    const block = el.closest('p, li, h1, h2, h3, td, th, button, summary, figcaption, blockquote, a') || el;
    range.selectNodeContents(t);
    for (const r of range.getClientRects()) {
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const cut = r.height * 0.18;
      boxes.push({ l: r.left, r: r.right, t: r.top + cut, b: r.bottom - cut, block, s: t.textContent.trim().slice(0, 28) });
    }
  }
  const bad = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.block === b.block || a.block.contains(b.block) || b.block.contains(a.block)) continue;
    const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l), oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (ox > 2 && oy > 2) bad.push(`"${a.s}" over "${b.s}" by ${Math.round(ox)}x${Math.round(oy)}`);
  }
  return [...new Set(bad)];
};

// What OVERLAPS cannot see: a ground is not a word. Under the bench of my stack every name stands on a ground of its
// own, and so does the stamp a swap prints. A name is whole when no other name's ground lies over its words and a
// pointer on its first word finds it. A swap can be pressed when a pointer on its middle finds the swap. The stamp's
// words stand under no name's ground and under no swap, and its ground over no swap and over no name of a phone's
// list (a desktop's names are pinned above it).
// (What a pointer finds is asked only of what the page lets a pointer reach: five times a second index.js makes every
// control of the lit stage that is fainter than 0.9 inert and marks it data-faint, and a name fades while its piece
// is swapped. benchWords waits until nothing on the bench carries that mark.)
const BENCH_WORDS = () => {
  const seen = (el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); return [...r.getClientRects()].filter((b) => b.width > 2 && b.height > 2); };
  const over = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const bad = [];
  const names = [...document.querySelectorAll('#my-stack .ail-ms__piece[data-first]')].map((li) => ({ li, parts: [...li.querySelectorAll('.ail-ms__tag .ail-ms__name, .ail-ms__tag .ail-ms__role')].filter(seen) })).filter((n) => n.parts.length)
    .map((n) => ({ ...n, s: n.parts[0].textContent.trim(), words: n.parts.flatMap(lines), ground: n.li.querySelector('.ail-ms__tag').getBoundingClientRect() }));
  const swaps = [...document.querySelectorAll('#my-stack .ail-ms__swap')].filter(seen).map((b) => ({ b, s: b.dataset.swap, box: b.getBoundingClientRect() }));
  for (const a of names) for (const b of names) if (a !== b && b.words.some((w) => over(a.ground, w))) bad.push(`the ground of "${a.s}" lies over the name "${b.s}"`);
  for (const n of names) {
    const w = n.words[0], at = document.elementFromPoint(w.left + w.width / 2, w.top + w.height / 2);
    if (!at || !n.li.contains(at)) bad.push(`the name "${n.s}" is under ${at ? at.className || at.tagName : 'nothing: it is outside the window'}`);
  }
  for (const { b, s, box } of swaps) {
    // (the middle of a swap: a piece's small mark stands on the corner of the swap beside it)
    for (const [fx, fy] of [[0.5, 0.5], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]]) {
      const at = document.elementFromPoint(box.left + box.width * fx, box.top + box.height * fy);
      if (at && !b.contains(at)) { bad.push(`the swap of the ${s} is under ${at.className || at.tagName}`); break; }
    }
  }
  const say = document.querySelector('#my-stack .ail-ms__say.is-on');
  if (say && seen(say)) {
    const panel = say.getBoundingClientRect(), words = [...say.querySelectorAll('.ail-ms__stamp, .ail-ms__line')].flatMap(lines);
    for (const n of names) {
      if (words.some((w) => over(w, n.ground))) bad.push(`the stamp's words stand under the name "${n.s}"`);
      if (!n.li.classList.contains('ail-pin') && n.words.some((w) => over(w, panel))) bad.push(`the stamp stands over the name "${n.s}"`);
    }
    for (const { s, box } of swaps) if (over(panel, box)) bad.push(`the stamp stands on the swap of the ${s}`);
  }
  return bad;
};
// (a name a swap has just changed goes with the next frame and comes back with its piece, the page then lets a
// pointer reach it again, and the stamp takes its time to arrive: the measure waits for all three, or it would pass
// over what is not there yet. It is taken again, a few frames on, before a fault counts: what a pointer finds
// follows what is drawn)
const benchWords = async (page) => {
  await frames(page, 3);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#my-stack .ail-ms__piece[data-first], #my-stack .ail-ms__piece[data-first] .ail-ms__tag, #my-stack .ail-ms__say.is-on')].every((el) => Number(getComputedStyle(el).opacity) === 1)
    && !document.querySelector('#my-stack .ail-ms__piece[data-first] > * > [data-faint], #my-stack .ail-ms__piece[data-first] > [data-faint]')), { timeout: 60_000, message: 'every name under the bench is back and within reach, and the stamp has arrived' }).toBe(true);
  let bad = [];
  for (let k = 0; k < 6; k++) {
    await frames(page, 2);
    bad = await page.evaluate(BENCH_WORDS);
    if (!bad.length) break;
    await page.waitForTimeout(500);
  }
  return bad;
};

const SHORT_STOPS = { worlds: [0.5, 0.95, 1.3, 1.55, 2.0, 2.62, 2.8], opening: [0.6, 1.4], grammar: [0.39, 1.58, 3.0, 3.24], lineup: [0.25, 0.44, 0.63, 1.2, 1.58, 1.9] };
test('landscape-21 in a short window no word prints over a word: a laptop at 1366 by 660 and 1280 by 720, and a small phone at 375 by 667, every section, every beat of a world and every floor of the line-up', async ({ page, isMobile }) => {
  test.setTimeout(1_800_000);   // two walks of 70 stops
  const bad = [];
  if (isMobile) {
    // a small phone (round 3, N-5: the line-up's note line printed over its first answer, and the board of best at
    // over its title). Each of the line-up's nine floors, as the phone's chips step them
    await page.setViewportSize({ width: 375, height: 667 });
    await open(page);
    await light(page);
    for (const s of await sections(page)) {
      const stops = s.name === 'lineup' ? Array.from({ length: 9 }, (_, i) => +(0.25 + 0.19 * i).toFixed(2)) : SHORT_STOPS[s.name] || [0.3, 0.6, 0.9].map((f) => +(f * s.screens).toFixed(2));
      for (const u of stops) {
        await go(page, s.id, u, 700);
        const over = await page.evaluate(OVERLAPS);
        if (over.length) bad.push(`375x667 ${s.id} at ${u}: ${over.slice(0, 4).join(' | ')}`);
      }
    }
    expect(bad).toEqual([]);
    return;
  }
  for (const size of [{ width: 1366, height: 660 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    await open(page);
    await light(page);
    await page.mouse.move(size.width * 0.55, size.height * 0.5);
    for (const s of await sections(page)) {
      for (const u of (SHORT_STOPS[s.name] || [0.3, 0.6, 0.9].map((f) => +(f * s.screens).toFixed(2)))) {
        await go(page, s.id, u, 700);
        const over = await page.evaluate(OVERLAPS);
        if (over.length) bad.push(`${size.width}x${size.height} ${s.id} at ${u}: ${over.slice(0, 4).join(' | ')}`);
      }
      if (s.id !== 'my-stack') continue;
      // the bench: every name whole on its ground, and after each swap the stamp it prints clear of the names and the swaps
      await go(page, s.id, 0.7, 700);
      for (const kind of ['', 'router', 'worker']) {
        if (kind) await page.locator(`#my-stack .ail-ms__swap[data-swap="${kind}"]`).click();
        const whole = await benchWords(page);
        const over = [...await page.evaluate(OVERLAPS), ...whole];
        if (over.length) bad.push(`${size.width}x${size.height} my-stack${kind ? ` after a swap of the ${kind}` : ''}: ${over.slice(0, 4).join(' | ')}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

test('landscape-23 a finger gets targets it can hit: a touch tablet held sideways has the 44 px company button and no rail of dots, and a row of the best-at board is as tall as its row', async ({ browser, baseURL, browserName, page, isMobile }) => {
  test.setTimeout(300_000);
  const sizes = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !el.closest('[inert]')).map((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }).filter(([w]) => w > 0), sel);
  if (isMobile) {
    await open(page);
    await light(page);
    await go(page, 'best-at', 2.35, 600);
    const rows = await sizes(page, '#best-at .ail-bd__open');
    expect(rows.length).toBe(22);
    for (const [, h] of rows) expect(h, 'a board row under a finger').toBeGreaterThanOrEqual(20);
    return;
  }
  test.skip(browserName !== 'chromium', 'the emulated tablet is Chromium\'s');
  const tablet = await browser.newPage({ baseURL, viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await open(tablet);
  expect(await tablet.evaluate(() => matchMedia('(pointer: coarse)').matches), 'the tablet\'s pointer is coarse').toBe(true);
  await light(tablet);
  await go(tablet, 'top', 0.3, 600);
  expect(await sizes(tablet, '.ail-rail a'), 'no rail of 17 px dots under a finger').toEqual([]);
  expect(await sizes(tablet, '.ail-map__col'), 'the five company links wait behind their button').toEqual([]);
  for (const sel of ['.ail-map__open', '.ail-chrome__chip']) for (const [w, h] of await sizes(tablet, sel)) { expect(w, sel).toBeGreaterThanOrEqual(44); expect(h, sel).toBeGreaterThanOrEqual(44); }
  await tablet.locator('.ail-map__open').tap();
  const links = await sizes(tablet, '.ail-map__col');
  expect(links.length).toBe(5);
  for (const [w, h] of links) { expect(w).toBeGreaterThanOrEqual(44); expect(h).toBeGreaterThanOrEqual(44); }
  await go(tablet, 'best-at', 2.35, 600);
  const rows = await sizes(tablet, '#best-at .ail-bd__open');
  expect(rows.length).toBe(22);
  for (const [, h] of rows) expect(h, 'a board row under a finger').toBeGreaterThanOrEqual(18);
  await tablet.close();
});

// ---- landscape-24 and 25: the studio pass (review round 3)
// Where each board of the house set and what it stands behind are drawn, in CSS px: the board's own edges, its
// stack's, the top of that stack's lid plate, and the board's sign when one is out.
const BOARDS = () => {
  const c = window.__landscape.debug.ctx;
  const at = (x, y, z) => c.labels.project({ x, y, z });
  return c.studio.bays.map((b, i) => {
    const tw = c.row.towers[i], half = b.wide / 2, z = b.z;
    const top = tw.height + tw.lift, sx = tw.x + tw.shift, lid = tw.lid.mesh, sign = b.sign;
    const tall = sign.geometry.parameters.height * sign.scale.y / 2;
    return {
      p: tw.id, seen: b.seen, rise: b.rise, key: b.key, out: b.flip,
      left: at(b.at - half, b.top, z).x, right: at(b.at + half, b.top, z).x, top: at(b.at, b.top, z).y,
      stack: [at(sx - 1.2, top, tw.z).x, at(sx + 1.2, top, tw.z).x], lid: lid.visible ? at(lid.position.x, lid.position.y + lid.scale.y / 2, lid.position.z).y : null,
      sign: sign.visible ? [at(sign.position.x, sign.position.y + tall, sign.position.z).y, at(sign.position.x, sign.position.y - tall, sign.position.z).y] : null,
    };
  });
};
// What is drawn, read from the screen (review round 3, N-4: the reads above are the scene's own bookkeeping, and a
// sign repainted but never sent to the GPU passed them). A patch as a 24 by 24 grey grid, normalised so that light and
// shade do not count, only the drawing; and the mean colour of its top left corner (inside a sign's square).
const GRID = 24;
async function grid(png) {
  const px = [...(await sharp(png).flatten({ background: '#F8F9FB' }).resize(GRID, GRID, { fit: 'fill' }).removeAlpha().raw().toBuffer())];
  const g = [];
  for (let j = 0; j < px.length; j += 3) g.push(0.299 * px[j] + 0.587 * px[j + 1] + 0.114 * px[j + 2]);
  const m = g.reduce((a, b) => a + b, 0) / g.length, sd = Math.sqrt(g.reduce((a, b) => a + (b - m) ** 2, 0) / g.length) || 1;
  const corner = [0, 1, 2].map((c) => { let t = 0; for (let y = 3; y < 6; y++) for (let x = 3; x < 6; x++) t += px[(y * GRID + x) * 3 + c]; return t / 9; });
  return { z: g.map((v) => (v - m) / sd), corner };
}
const apart = (a, b) => a.reduce((t, v, j) => t + Math.abs(v - b[j]), 0) / a.length;
const ratio = (page, r) => page.evaluate((r) => { const c = window.__landscape.debug.ctx; c.quality.ratio = r; c.renderer.setPixelRatio(r); c.renderer.setSize(innerWidth, innerHeight, false); c.worlds.resize(innerWidth, innerHeight, r); }, r);
// Each raised sign where it is drawn (CSS px, from its place in the world) and the page's own drawing of it (the canvas
// its texture is made from)
const SHEETS = () => {
  const c = window.__landscape.debug.ctx;
  const at = (x, y, z) => c.labels.project({ x, y, z });
  return c.studio.bays.map((b, i) => {
    const s = b.sign;
    s.updateWorldMatrix(true, false);
    const k = s.getWorldScale(s.position.clone()), p = s.getWorldPosition(s.position.clone());
    const hw = s.geometry.parameters.width * k.x / 2, hh = s.geometry.parameters.height * k.y / 2;
    const [x0, x1, y0, y1] = [at(p.x - hw, p.y, p.z).x, at(p.x + hw, p.y, p.z).x, at(p.x, p.y + hh, p.z).y, at(p.x, p.y - hh, p.z).y];
    return { p: c.row.towers[i].id, key: b.key, box: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, drawn: b.sheet.texture.image.toDataURL() };
  });
};
// The five signs as the screen shows them, once nothing moves, drawn at a pixel ratio of 1 for the one look
async function signsSeen(page) {
  let was = await page.evaluate(SHEETS);
  for (let k = 0; k < 40; k++) {
    await frames(page, 1);
    const now = await page.evaluate(SHEETS);
    const moved = now.some((x, j) => Math.abs(x.box.x - was[j].box.x) + Math.abs(x.box.y - was[j].box.y) > 0.5);
    was = now;
    if (!moved) break;
  }
  await ratio(page, 1);
  await frames(page, 2);
  const out = [];
  for (const x of was) out.push({ p: x.p, key: x.key, screen: await grid(await page.screenshot({ clip: x.box })), drawn: await grid(Buffer.from(x.drawn.split(',')[1], 'base64')) });
  await ratio(page, 0.25);
  return out;
}
// The signs the page's own data asks for on floor i: a company, the layer, its state there and its parts.
// (a part's key: owner and status, and how official it is when it is not: "anthropicreleased:no")
const SIGNS = (i) => { const d = JSON.parse(document.getElementById('ail-data').textContent); return d.order.map((id) => `${id}|${d.layers[i]}|${d.p[id].stack[i].s}|${d.p[id].stack[i].p.slice(0, 6).map((q) => q[0] + q[1] + (q[2] && q[2] !== 'yes' ? `:${q[2]}` : '')).join(',')}`); };

test('landscape-24 a board stands right behind each stack and none in a gap; in the line-up the five rise with one sign each, the lit floor of each company as the page\'s data has it, whole, under the words and clear of every lid plate; with all nine at rest they go down, and a window too short for them leaves them at rest', async ({ page, isMobile }) => {
  test.setTimeout(900_000);
  await open(page);
  await light(page);
  await go(page, 'top', 1.5, 600);
  for (const b of await page.evaluate(BOARDS)) {
    const [l, r] = b.stack, w = r - l;
    expect(b.seen, `${b.p}: its board is there`).toBe(true);
    expect(Math.abs((b.left + b.right) / 2 - (l + r) / 2), `${b.p}: the board stands behind its own stack, not beside it`).toBeLessThan(w * 0.2);
    expect(b.right - b.left, `${b.p}: the board is as wide as its stack or wider`).toBeGreaterThan(w * 0.95);
    if (b.lid != null) expect(b.top, `${b.p}: the board ends above its lid plate`).toBeLessThan(b.lid);
    expect(b.rise, `${b.p}: at rest outside the line-up`).toBeLessThan(0.01);
    expect(b.sign, `${b.p}: no sign outside the line-up`).toBe(null);
  }
  // the line-up: voice, then the model floor, then all nine at rest
  const up = () => page.evaluate(() => window.__landscape.compare.lineup.signs().every((s) => s.rise > 0.99 && s.out > 0.99));
  const seen = {};
  for (const [u, i] of [[0.44, 1], [1.01, 4]]) {
    await go(page, 'line-up', u, 600);
    expect(await page.evaluate(() => window.__landscape.compare.lineup.tall), 'this window has the height for the signs').toBe(true);
    await expect.poll(up, { timeout: 30_000 }).toBe(true);
    await expect.poll(async () => (await page.evaluate(BOARDS)).map((b) => b.key), { timeout: 30_000 }).toEqual(await page.evaluate(SIGNS, i));
    await expect.poll(up, { timeout: 30_000 }).toBe(true);
    const words = await page.evaluate((phone) => (phone ? document.querySelector('.ail-chrome__side--id') : document.querySelector('.ail-lu__now')).getBoundingClientRect().bottom, isMobile);
    for (const b of await page.evaluate(BOARDS)) {
      expect(b.sign, `${b.p} floor ${i + 1}: its sign is out`).not.toBe(null);
      expect(b.sign[0], `${b.p} floor ${i + 1}: the sign stands under the words above it`).toBeGreaterThanOrEqual(words - 1);
      if (b.lid != null) expect(b.sign[1], `${b.p} floor ${i + 1}: the sign never touches the lid plate`).toBeLessThan(b.lid - 1);
      expect(Math.abs((b.left + b.right) / 2 - (b.stack[0] + b.stack[1]) / 2), `${b.p}: the raised board is still behind its stack`).toBeLessThan((b.stack[1] - b.stack[0]) * 0.2);
    }
    seen[i] = await signsSeen(page);
    // the key's sample of "someone else's part" is the colour of each guest on this floor, never a fixed one (F3-2)
    const guests = await page.evaluate((i) => { const d = JSON.parse(document.getElementById('ail-data').textContent); return [...new Set(d.order.flatMap((id) => d.p[id].stack[i].g || []))]; }, i);
    expect(await page.evaluate(() => [...document.querySelectorAll('#line-up .ail-sw--guest')].filter((x) => x.dataset.p && getComputedStyle(x).display !== 'none').map((x) => x.dataset.p)), `floor ${i + 1}: the key's swatches are its guests`).toEqual(guests);
  }
  // and the screen shows them: each sign looks more like the page's drawing of its own key than like the other floor's,
  // and its glass is its own company's colour, as drawn (not dimmed, not another's)
  for (const [i, j] of [[1, 4], [4, 1]]) {
    for (const x of seen[i]) {
      const other = seen[j].find((y) => y.p === x.p);
      if (x.key !== other.key) expect(apart(x.screen.z, x.drawn.z), `${x.p} floor ${i + 1}: the sign on screen is its own floor's, not floor ${j + 1}'s`).toBeLessThan(apart(x.screen.z, other.drawn.z));
      const nearest = seen[i].map((y) => [y.p, apart(x.screen.corner, y.drawn.corner)]).sort((a, b) => a[1] - b[1])[0][0];
      expect(nearest, `${x.p} floor ${i + 1}: its glass on screen is its own company's colour`).toBe(x.p);
      expect(Math.max(...x.screen.corner.map((v, c) => Math.abs(v - x.drawn.corner[c]))), `${x.p} floor ${i + 1}: as drawn, not dimmed or tinted`).toBeLessThan(30);
    }
  }
  expect((await page.evaluate(SIGNS, 4)).some((k) => /^xai\|.*anthropic/.test(k)), 'on the model floor one sign holds another company\'s bead').toBe(true);
  await go(page, 'line-up', 1.94, 600);
  await expect.poll(() => page.evaluate(() => window.__landscape.compare.lineup.signs().every((s) => s.rise < 0.01 && !s.sign && s.out === 0)), { timeout: 30_000 }).toBe(true);
  if (isMobile) return;
  // a window with no height for sign, plate, row and answers: the boards stay at rest and the row stands as before
  await page.setViewportSize({ width: 1280, height: 600 });
  await frames(page, 3);
  await go(page, 'line-up', 0.44, 900);
  expect(await page.evaluate(() => window.__landscape.compare.lineup.tall), 'a 600 px window has no room for the signs').toBe(false);
  for (const b of await page.evaluate(BOARDS)) { expect(b.rise, `${b.p}: at rest in a short window`).toBeLessThan(0.01); expect(b.sign).toBe(null); }
});

test('landscape-25 the lesson stands the read floor\'s number in paper behind nine greys, light to dark, and ends on two floors above the ground; the link being read is one cord, dashed as its link is documented, with no board behind it; a shut laptop dims the agents\' room and an open one lights it again', async ({ page }) => {
  test.setTimeout(900_000);
  await open(page);
  await light(page);
  const lesson = (read) => page.evaluate(read);
  await go(page, 'layers', 0.39, 600);
  const greys = (await lesson(() => window.__landscape.lesson.floors())).map((f) => f.grey);
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  expect(new Set(greys).size, 'nine floors, nine greys').toBe(9);
  for (let k = 1; k < 9; k++) expect(lum(greys[k]), `floor ${k + 1} is darker than floor ${k}`).toBeLessThan(lum(greys[k - 1]));
  for (const hex of greys) { const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255]; expect(ch[0] <= ch[1] && ch[1] <= ch[2] && ch[2] - ch[0] <= 20, `${hex} is a house grey, with the cool cast of the house's own neutrals and no more: no hue in the lesson`).toBe(true); }
  // the number is the read floor's own, as the page prints it
  for (const u of [0.39, 1.58, 2.78]) {
    await go(page, 'layers', u, 600);
    const want = await page.evaluate(() => document.querySelector('#layers .ail-layer.is-on .ail-layer__n').textContent.trim());
    await expect.poll(() => lesson(() => window.__landscape.lesson.number), { timeout: 30_000 }).toBe(want);
  }
  // the close: two floors above the ground, seven under it, under the closing line
  await go(page, 'layers', 3.24, 600);
  const floors = await lesson(() => window.__landscape.lesson.floors().map((f) => f.y));
  expect(floors.filter((y) => y > 0).length, `two floors stand above the ground: ${floors.join(' ')}`).toBe(2);
  expect(floors[0] > 0 && floors[1] > 0, 'and they are the top two').toBe(true);
  expect(await lesson(() => window.__landscape.lesson.number), 'no number at the close').toBe('');
  expect(await page.evaluate(() => { const h = document.querySelector('#layers .ail-gram__close'); return h.classList.contains('is-on') && Number(getComputedStyle(h).opacity) > 0.9; }), 'the closing line stands').toBe(true);

  // links: the cord is on the link being read, dashed by how official that link is, and the boards are down
  await go(page, 'links', 0.6, 900);
  expect(await page.evaluate(() => window.__landscape.debug.ctx.studio.bays.some((b) => b.seen)), 'no board behind the links').toBe(false);
  const DASH = { yes: null, partial: [3, 1], no: [1, 1] };
  const kinds = await page.evaluate(() => { const seen = {}; for (const x of window.__landscape.compare.links.dashes()) if (!(x.official in seen)) seen[x.official] = x.n; return seen; });
  expect(Object.keys(kinds).length, 'links of more than one standing').toBeGreaterThan(1);
  for (const [official, n] of Object.entries(kinds)) {
    await page.evaluate((n) => window.__landscape.compare.links.show(n), n);
    await expect.poll(() => page.evaluate(() => { const c = window.__landscape.compare.links.cord(); return c.draw >= 1 ? c.n : -2; }), { timeout: 30_000 }).toBe(n);
    expect((await page.evaluate(() => window.__landscape.compare.links.cord())).dash, `a link that is "${official}"`).toEqual(DASH[official]);
  }

  // agents: dusk follows the laptop
  await go(page, 'agents', 0.6, 900);
  const dusk = () => page.evaluate(() => window.__landscape.debug.ctx.studio.dusk);
  await page.locator('#agents .ail-ag__switch').click();
  for (let turn = 0; turn < 2; turn++) {
    const shut = await page.evaluate(() => window.__landscape.compare.agents.closed);
    if (shut) await expect.poll(dusk, { timeout: 30_000 }).toBeGreaterThan(0.5); else await expect.poll(dusk, { timeout: 30_000 }).toBeLessThan(0.2);
    if (shut) expect((await page.evaluate(() => window.__landscape.compare.agents.lit())).every((t) => t.floors.every((f) => f > 0.3)), 'the cloud floors keep their light at dusk').toBe(true);
    await page.locator('#agents .ail-ag__switch').click();
  }
});

// WebKit stops a page's loads the moment a navigation away begins, so an import still in flight fails while the
// visitor is leaving. That is not a chunk lost to a deploy: a reload then would take the visitor back to the page.
test('landscape-26 a visitor who leaves while a chunk is still loading is let go: no reload brings them back', async ({ page }) => {
  test.setTimeout(180_000);
  // every signature takes four seconds to arrive, so one is in flight when the visitor leaves its world
  await page.route(/\/_astro\/(anthropic|openai|google|meta|xai)\.[^/]*\.js$/, async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.continue().catch(() => {}); });
  await open(page);
  await light(page);
  await go(page, 'xai', 0.4, 300);
  expect((await hook(page)).world).toBe('xai');
  await page.goto(SOURCES[0]);
  expect(new URL(page.url()).pathname, 'the visitor arrived where they were going').toBe(SOURCES[0]);
  await page.waitForTimeout(1500);
  expect(new URL(page.url()).pathname, 'and stayed there').toBe(SOURCES[0]);
});

// The workshop of the studio pass (round 3, package 2): the cabinet, the bench and its cast, the router floor's lamp.
test('landscape-27 around the five is a cabinet of nine drawers, a glyph on every front, the one being read pulled out and shut again before my stack takes it over; on the bench his own pair carries its figures on the two largest blocks, cords join him, his router and his coding agent, the second dashed as the pair is stamped, only the lenders stand behind and each behind what it lends, and a swap takes the figure away and redraws or drops the cord; the router floor goes dark under one lamp that stands on the lit diagram', async ({ page, isMobile }) => {
  test.setTimeout(900_000);
  await open(page);
  await light(page);
  const compare = (read) => page.evaluate(read);

  // ---- around: nine fronts with a glyph each, one drawer out, and none at the hand-over
  const around = (await sections(page)).find((s) => s.id === 'around');
  await go(page, 'around', 0.12 + 0.11 * 4.5, 900);
  const active = await page.evaluate(() => [...document.querySelectorAll('#around .ail-ar__item')].findIndex((li) => li.classList.contains('is-active')));
  expect(active, 'the fifth drawer is being read').toBe(4);
  await expect.poll(() => compare(() => window.__landscape.compare.around.drawers().filter((d) => d.out > 1).length), { timeout: 30_000 }).toBe(1);
  const drawers = await compare(() => window.__landscape.compare.around.drawers());
  expect(drawers.length).toBe(9);
  expect(drawers.every((d) => d.glyph && d.up === 1), 'nine risen fronts, a glyph on each').toBe(true);
  expect(drawers.findIndex((d) => d.out > 1), 'the open drawer is the one being read').toBe(active);
  expect(drawers.filter((d, k) => k !== active).every((d) => d.out < 0.3), 'the other eight are in').toBe(true);
  expect(drawers[active].front, 'it stands out toward the camera').toBeGreaterThan(Math.max(...drawers.filter((d, k) => k !== active).map((d) => d.front)) + 1);
  await go(page, 'around', around.screens - 0.004, 300);
  expect((await compare(() => window.__landscape.compare.around.drawers())).every((d) => d.out === 0), 'every drawer is shut when my stack takes the cabinet over').toBe(true);

  // ---- my stack: the cast, the cords, the lenders
  await go(page, 'my-stack', 0.7, 600);
  const stack = () => compare(() => { const m = window.__landscape.compare.mystack; return { cast: m.cast(), cords: m.cords(), lenders: m.lenders(), sizes: m.sizes(), official: m.official() }; });
  await expect.poll(async () => (await stack()).cast.filter((c) => c.on).length, { timeout: 60_000, message: 'both figures stand on his own pair' }).toBe(2);
  await expect.poll(async () => (await stack()).cords.filter((c) => c.on).length, { timeout: 60_000 }).toBe(2);
  const dom = () => page.evaluate(() => {
    const pieces = [...document.querySelectorAll('#my-stack .ail-ms__piece[data-first]')];
    const pair = Object.fromEntries(['router', 'worker'].map((k) => { const li = document.querySelector(`#my-stack .ail-ms__piece[data-swap="${k}"]`); return [k, { id: li.dataset.node.replace(/^aaron-/, ''), owner: li.dataset.owner, name: li.querySelector('.ail-ms__name').textContent.trim() }]; }));
    const say = [...document.querySelectorAll('#my-stack .ail-ms__say.is-on')].map((li) => li.dataset.official);
    return { owners: pieces.map((li) => li.dataset.owner), pair, say, order: window.__landscape.debug.ctx.data.order };
  });
  const DASH = { yes: null, partial: [6, 2], no: [3, 3] };
  const first = await dom();
  let s = await stack();
  expect(s.cast.map((c) => c.piece).sort(), 'the figures stand on his router and his coding agent').toEqual([first.pair.router.id, first.pair.worker.id].sort());
  const big = s.sizes.filter((p) => [first.pair.router.id, first.pair.worker.id].includes(p.id)), rest = s.sizes.filter((p) => p.layer !== 'you' && !big.includes(p));
  expect(Math.min(...big.map((p) => p.w)), 'his pair stands on the two largest blocks').toBeGreaterThan(Math.max(...rest.map((p) => p.w)) * 1.5);
  // (a thing they use is a block, or the paper object on its plinth: whichever is wider)
  expect(s.sizes.find((p) => p.layer === 'you').w, 'and the dot that is him is no smaller than the things they use').toBeGreaterThanOrEqual(Math.max(...rest.map((p) => Math.max(p.w, p.thing))) * 0.8);
  const [toRouter, link] = [s.cords.find((c) => c.from === 'you'), s.cords.find((c) => c.from === first.pair.router.id)];
  expect(toRouter.to === first.pair.router.id && toRouter.dash === null && toRouter.bead === null, 'a solid cord from him to his router').toBe(true);
  expect(link.to, 'a cord from his router to his coding agent').toBe(first.pair.worker.id);
  expect(link.dash, `dashed as the pair is stamped ("${s.official}")`).toEqual(DASH[s.official]);
  expect(typeof link.bead, 'with a bead on it').toBe('number');
  // and his own pair's stamp ("Unofficial") stands at that cord while the pair is his (round 3, F3-3)
  const cordWord = () => page.evaluate(() => { const e = document.querySelector('#my-stack .ail-ms__cordword'); return e ? { text: e.textContent.trim(), on: Number(getComputedStyle(e).opacity) > 0.9 } : null; });
  const hisStamp = await page.evaluate(() => { const m = document.getElementById('my-stack').dataset.mine.split(' '); const say = [...document.querySelectorAll('#my-stack .ail-ms__say')].find((li) => li.dataset.r === m[0] && li.dataset.w === m[1]); return say ? say.querySelector('.ail-ms__stamp').textContent.trim() : null; });
  if (hisStamp) await expect.poll(cordWord, { timeout: 30_000, message: 'his pair\'s stamp stands at their cord' }).toEqual({ text: hisStamp, on: true });
  const lent = (d) => [...new Set(d.owners.filter((o) => d.order.includes(o)))].sort();
  const behind = (list) => list.every((l) => l.lends.length > 0 && Math.min(...l.lends.map((x) => Math.abs(x - l.x))) <= 2.4);
  expect(s.lenders.map((l) => l.id).sort(), 'only the companies that lend him a piece stand behind').toEqual(lent(first));
  expect(behind(s.lenders), `each lender stands behind what it lends: ${JSON.stringify(s.lenders)}`).toBe(true);
  expect(await benchWords(page), 'every name under the bench is whole, and both swaps can be pressed').toEqual([]);
  // and the screen shows both figures: one frame drawn with each and one without it differ where it stands (N-4)
  for (const c of s.cast) {
    const seen = await page.evaluate(([id, at]) => {
      const x = window.__landscape.debug.ctx, r = x.renderer, gl = r.getContext(), mesh = window.__landscape.compare.mystack.figure(id), k = r.getPixelRatio();
      const read = () => { r.render(x.scene, x.camera); const px = new Uint8Array(4 * 9); gl.readPixels(Math.round(at.x * k) - 1, Math.round((innerHeight - at.y) * k) - 1, 3, 3, gl.RGBA, gl.UNSIGNED_BYTE, px); return [0, 1, 2].map((ch) => px.filter((_, j) => j % 4 === ch).reduce((a, b) => a + b, 0) / 9); };
      const drawn = read();
      mesh.visible = false;
      const bare = read();
      mesh.visible = true;
      return Math.max(...drawn.map((v, ch) => Math.abs(v - bare[ch])));
    }, [c.piece, c.at]);
    expect(seen, `the figure on ${c.piece} is drawn where it stands`).toBeGreaterThan(25);
  }

  // a swap: the figure of a piece that is no longer his own leaves, the lenders follow, the cord follows the stamp
  for (const kind of ['router', 'worker', 'router']) {
    await page.locator(`#my-stack .ail-ms__swap[data-swap="${kind}"]`).click();
    const now = await dom();
    const mine = { router: now.pair.router.name === first.pair.router.name, worker: now.pair.worker.name === first.pair.worker.name };
    await expect.poll(async () => { const c = (await stack()).cast; return [c.find((x) => x.piece === first.pair.router.id).on, c.find((x) => x.piece === first.pair.worker.id).on]; }, { timeout: 60_000, message: `after a swap of the ${kind}: a figure stands only on a piece that is his own` }).toEqual([mine.router, mine.worker]);
    await expect.poll(async () => (await stack()).lenders.map((l) => l.id).sort(), { timeout: 60_000, message: 'the lenders are the owners of the pieces now on the bench' }).toEqual(lent(now));
    // (two lenders that stay and change places slide for about a second: the measure is of where they come to stand)
    await expect.poll(async () => { s = await stack(); return behind(s.lenders) || JSON.stringify(s.lenders); }, { timeout: 30_000, message: 'each lender comes to stand behind what it lends' }).toBe(true);
    if (!mine.router || !mine.worker) expect(now.say, 'the pair on the bench shows its stamp').toEqual([s.official]);
    if (hisStamp && (!mine.router || !mine.worker)) await expect.poll(async () => (await cordWord()).on, { timeout: 30_000, message: 'and his pair\'s stamp at the cord leaves' }).toBe(false);
    if (s.official === 'none') await expect.poll(async () => (await stack()).cords.find((c) => c.from === first.pair.router.id).on, { timeout: 30_000, message: 'no documented pair: no cord' }).toBe(false);
    else {
      await expect.poll(async () => (await stack()).cords.find((c) => c.from === first.pair.router.id).on, { timeout: 60_000, message: `a pair stamped "${s.official}" has its cord` }).toBe(true);
      expect((await stack()).cords.find((c) => c.from === first.pair.router.id).dash).toEqual(DASH[s.official]);
    }
    expect(await benchWords(page), `after a swap of the ${kind} the stamp it prints, every name and both swaps are whole`).toEqual([]);
  }

  // the swap from the keyboard: Enter on it swaps, the name beside it goes and comes back, and focus is still on the
  // swap, so the next Enter swaps again (a swap that faded with its name was hidden, and focus fell to the page)
  await page.locator('#my-stack .ail-ms__swap[data-swap="router"]').focus();
  for (const press of [1, 2]) {
    const was = (await dom()).pair.router.name;
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await dom()).pair.router.name, { timeout: 30_000, message: `Enter ${press} on the router's swap swaps it` }).not.toBe(was);
    expect(await benchWords(page), 'and the bench is whole again').toEqual([]);
    expect(await page.evaluate(() => document.activeElement.dataset.swap || document.activeElement.tagName), 'focus stays on the swap').toBe('router');
  }

  // a pointer, or a finger, that rests on a swap presses it again and again without moving, once round every piece
  // it offers: the swap keeps its place whatever the length of the name beside it, so every press lands on it (beside
  // a centred name it was pushed from under the pointer, and the next press opened a card or swapped the other piece)
  for (const kind of ['router', 'worker']) {
    const box = await page.locator(`#my-stack .ail-ms__swap[data-swap="${kind}"]`).boundingBox();
    const at = [box.x + box.width / 2, box.y + box.height / 2];
    const offers = await page.locator(`#my-stack .ail-ms__opts[data-for="${kind}"] li`).count();
    expect(offers, `the swap of the ${kind} offers more than one piece`).toBeGreaterThan(1);
    if (!isMobile) await page.mouse.move(...at);
    for (let press = 1; press <= offers; press++) {
      const was = await dom();
      if (isMobile) await page.touchscreen.tap(...at); else { await page.mouse.down(); await page.mouse.up(); }
      await expect.poll(async () => (await dom()).pair[kind].name, { timeout: 30_000, message: `press ${press} of ${offers} at the same place lands on the swap of the ${kind} (it shows ${was.pair[kind].name})` }).not.toBe(was.pair[kind].name);
      const other = kind === 'router' ? 'worker' : 'router';
      expect((await dom()).pair[other].name, `and leaves the ${other} as it was`).toBe(was.pair[other].name);
      await frames(page, 2);
    }
    expect(await page.evaluate(() => document.querySelectorAll('#my-stack .ail-ms__d[open]').length), 'no press opened a card').toBe(0);
    expect(await benchWords(page), `after a round of the ${kind}'s swap the bench is whole`).toEqual([]);
  }

  // ---- the router floor: dark, one lamp, on the lit diagram. A pick moves it. The light is back for the lamp board
  const router = (await sections(page)).find((s) => s.id === 'router');
  const lamp = () => compare(() => ({ ...window.__landscape.compare.router.lamp(), chrome: document.documentElement.dataset.chrome || '', pressed: [...document.querySelectorAll('#router .ail-rt__name')].findIndex((b) => b.getAttribute('aria-pressed') === 'true') }));
  for (const [t, want] of [[0.25, 0], [0.5, 1], [0.8, 2]]) {
    await go(page, 'router', t * router.screens, 300);
    await expect.poll(async () => { const l = await lamp(); return l.lit === want && Math.abs(l.x - l.at[want]) < 0.2 ? want : `lit ${l.lit}, lamp at ${l.x}`; }, { timeout: 30_000, message: `at ${t} the lamp stands on diagram ${want + 1}` }).toBe(want);
    const l = await lamp();
    expect(l.dark, 'the room is dark').toBeGreaterThan(0.8);
    expect(l.glow, 'and the lamp is lit').toBeGreaterThan(0.9);
    expect(l.chrome, 'the words are paper on ink while it is').toBe('dark');
    expect(l.pressed, 'the lit diagram is the one whose name is pressed').toBe(want);
    // and the screen shows the pool: the floor in front of the lit diagram is brighter than in front of the others (N-4)
    // (a phone frames the lit diagram: a floor out of the window is not compared)
    const floor = await page.evaluate((at) => at.map((x) => { const p = window.__landscape.debug.ctx.labels.project({ x, y: 0, z: 7.3 }); return p.x > 8 && p.x < innerWidth - 8 && p.y > 8 && p.y < innerHeight - 8 ? p : null; }), l.at);
    expect(floor[want], `at ${t} the lit diagram's floor is in the window`).not.toBe(null);
    const tones = [];
    for (const p of floor) tones.push(p ? await tone(page, [p.x, p.y]) : null);
    for (const [k, v] of tones.entries()) if (k !== want && v != null) expect(tones[want] - v, `at ${t} the pool on diagram ${want + 1} is brighter than the floor at diagram ${k + 1} (${tones.map((x) => x && Math.round(x))})`).toBeGreaterThan(25);
  }
  await page.locator('#router .ail-rt__name').first().click();
  await expect.poll(async () => { const l = await lamp(); return l.lit === 0 && Math.abs(l.x - l.at[0]) < 0.2; }, { timeout: 30_000, message: 'a pick moves the lamp' }).toBe(true);
  await go(page, 'agnostic', 0.35, 600);
  expect(await compare(() => ({ dark: window.__landscape.debug.ctx.studio.dark, chrome: document.documentElement.dataset.chrome || '' })), 'the lamp board stands in daylight').toEqual({ dark: 0, chrome: '' });

  // ---- reduced motion: each of these is there with its section, nothing runs out, slides or travels afterwards
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await light(page);
  await go(page, 'around', 0.12 + 0.11 * 2.5, 0);
  expect((await compare(() => window.__landscape.compare.around.drawers())).map((d) => d.out), 'the third drawer is out, whole, and the others are in').toEqual([0, 0, 1.4, 0, 0, 0, 0, 0, 0]);
  await go(page, 'my-stack', 0.78, 0);
  await expect.poll(async () => (await stack()).cast.every((c) => c.on), { timeout: 30_000, message: 'the figures stand with their blocks (the creature once its picture has loaded)' }).toBe(true);
  expect((await stack()).cords.map((c) => [c.on, c.bead]), 'the cords are drawn, and the bead rests at the coding agent').toEqual([[true, null], [true, 1]]);
  await go(page, 'router', 0.5 * router.screens, 0);
  const l = await lamp();
  expect([l.lit, l.x], 'the lamp is on the second diagram').toEqual([1, l.at[1]]);
});

// ---- landscape-28: the studio pass's rooms and art (review round 3, package 3)
// The mean tone (0 to 255) of what is drawn around a point of the window, words and all.
async function tone(page, [x, y]) {
  const { channels } = await sharp(await page.screenshot({ clip: { x: Math.round(x) - 5, y: Math.round(y) - 5, width: 10, height: 10 } })).stats();
  return (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
}
// What one picture adds to the screen (review round 4, T-1): a frame drawn with its mesh and one without, read at 49
// points across it. The largest change of any channel at any point, 0 to 255 (two frames of the same moment are the
// same, so a picture drawn at opacity 0 reads 0); -1 where the mesh is not shown. kind:
// 'around' (the object in drawer `arg`), 'bench' (the object on piece `arg`), 'wall', or the room's 'portrait' or 'card'.
async function drawnBy(page, kind, arg = null) {
  return page.evaluate(([kind, arg]) => {
    const x = window.__landscape.debug.ctx, r = x.renderer, gl = r.getContext(), k = r.getPixelRatio(), c = window.__landscape.compare, w = x.worlds.active;
    const mesh = { around: () => c.around.mesh(arg), bench: () => c.mystack.thing(arg), wall: () => x.studio.plate.mesh, portrait: () => w && w.parts.portrait, card: () => w && w.parts.sign }[kind]();
    if (!mesh || !mesh.visible) return -1;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const { min, max } = mesh.geometry.boundingBox;
    mesh.updateMatrixWorld();
    const at = [];
    const GRID = [0.15, 0.25, 0.35, 0.5, 0.65, 0.75, 0.85];
    for (const u of GRID) for (const v of GRID) {
      const p = min.clone().lerp(max, 0.5);
      p.x = min.x + (max.x - min.x) * u; p.y = min.y + (max.y - min.y) * v;
      p.applyMatrix4(mesh.matrixWorld).project(x.camera);
      const sx = ((p.x + 1) / 2) * innerWidth, sy = ((1 - p.y) / 2) * innerHeight;
      if (sx > 2 && sx < innerWidth - 2 && sy > 2 && sy < innerHeight - 2 && p.z < 1) at.push([sx, sy]);
    }
    const read = () => { r.render(x.scene, x.camera); return at.map(([sx, sy]) => { const px = new Uint8Array(4); gl.readPixels(Math.round(sx * k), Math.round((innerHeight - sy) * k), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; }); };
    const drawn = read();
    mesh.visible = false;
    const bare = read();
    mesh.visible = true;
    return Math.max(0, ...drawn.map((px, i) => Math.max(...[0, 1, 2].map((ch) => Math.abs(px[ch] - bare[i][ch])))));
  }, [kind, arg]);
}
test('landscape-28 the lamp desk lies on the floor in front of five whole stacks, a column of lamps under each, drawn in ink, and has left before the camera moves on; billing\'s five run in step, so no frame holds more in one tray than in another, and no tank stands over a floor; both keep every word clear in a 1280 by 560 window; the drawer being read holds its paper object and the bench\'s things stand as objects no larger than him; the far wall has its picture; a room hangs a portrait where its text version shows one, and Meta\'s grid panel is under a blank card', async ({ page, isMobile }) => {
  test.setTimeout(900_000);
  const compare = (read) => page.evaluate(read);
  const size = page.viewportSize();
  // (the pointer rests at the top, in the middle: over no lamp, whose card would open, and turning the camera to neither side)
  const start = async () => { await open(page); await light(page); if (!isMobile) await page.mouse.move(page.viewportSize().width / 2, 30); };
  await start();

  // ---- the lamp desk
  const desk = () => compare(() => ({ ...window.__landscape.compare.desk(), stacks: window.__landscape.debug.ctx.row.towers.map((tw) => +tw.show.toFixed(2)), lids: window.__landscape.debug.ctx.row.towers.map((tw) => tw.lid.k) }));
  const lamps = () => compare(() => [...document.querySelectorAll('#agnostic .ail-agn__cell .ail-fact')].filter((b) => b.checkVisibility({ opacityProperty: true, visibilityProperty: true })).length);
  await go(page, 'agnostic', 0.35, 600);
  await expect.poll(async () => (await desk()).on, { timeout: 30_000, message: 'the desk is there' }).toBe(1);
  await expect.poll(lamps, { timeout: 30_000, message: 'twenty lamps: five companies by four questions' }).toBe(20);
  let d = await desk();
  expect(d.stacks, 'five whole stacks stand behind it').toEqual([1, 1, 1, 1, 1]);
  expect(d.lids.every((k) => k === d.lids[0]) && [0, 1].includes(d.lids[0]) && !(d.low && d.lids[0]), `the five marks are whole or away together, and away where the window is short: ${d.lids}`).toBe(true);
  expect(Math.max(...d.off), `each column of lamps stands under its stack (px off: ${d.off.map((v) => Math.round(v))})`).toBeLessThan(14);
  expect(d.under, 'the desk begins under the stacks\' feet: it covers no floor').toBeGreaterThanOrEqual(-2);
  if (!isMobile) {
    // what is drawn, not only what the scene says: ink between the lamps, and the pale floor there once the desk has left
    const at = d.mid;
    expect(await tone(page, at), 'the desk\'s face is ink').toBeLessThan(70);
    await go(page, 'agnostic', 0.63, 300);
    await expect.poll(async () => (await desk()).on, { timeout: 30_000, message: 'the desk has left before the camera moves on to billing' }).toBe(0);
    expect(await lamps(), 'and its lamps with it').toBe(0);
    expect(await tone(page, at), 'the floor is where the desk was').toBeGreaterThan(150);
  }

  // ---- billing: one cycle, the same for all five at every moment
  const rail = () => compare(() => window.__landscape.compare.rail());
  await go(page, 'billing', 0.5, 600);
  const seen = new Set();
  for (let k = 0; k < 40 && (seen.size < 3 || k < 6); k++) {
    const r = await rail();
    expect(r.state.every((s) => s[0] === r.state[0][0] && s[1] === r.state[0][1]), `the five stand at the same level with the same beads: ${JSON.stringify(r.state)}`).toBe(true);
    seen.add(JSON.stringify(r.state[0]));
    await frames(page, 2);
    await page.waitForTimeout(300);
  }
  expect(seen.size, 'and the cycle runs').toBeGreaterThanOrEqual(3);
  expect(Math.min(...(await rail()).under), 'no tank stands over a floor of its stack (px under the stack\'s foot)').toBeGreaterThanOrEqual(-2);

  // ---- a laptop's shortest window: both pictures whole, no word over a word, a mark whole or away
  if (!isMobile) {
    await page.setViewportSize({ width: 1280, height: 560 });
    await start();
    for (const [id, u] of [['agnostic', 0.2], ['agnostic', 0.35], ['billing', 0.3], ['billing', 0.7]]) {
      await go(page, id, u, 700);
      expect(await page.evaluate(OVERLAPS), `1280x560 ${id} at ${u}: no word over a word`).toEqual([]);
      const lids = await compare(() => window.__landscape.debug.ctx.row.towers.map((tw) => tw.lid.k));
      expect(lids.every((k) => k === 0) || lids.every((k) => k === 1), `1280x560 ${id} at ${u}: the five marks are whole or away together: ${lids}`).toBe(true);
      if (id === 'agnostic') expect(Math.max(...(await desk()).off), '1280x560: the lamps still stand under their stacks').toBeLessThan(14);
    }
    await page.setViewportSize(size);
    await start();
  }

  // ---- the paper objects: one in the open drawer, none once it is shut. On the bench, an object for every piece
  // whose layer the cabinet keeps a drawer for, and a glyph on every other block
  const around = (await sections(page)).find((s) => s.id === 'around');
  await go(page, 'around', 0.12 + 0.11 * 4.5, 900);
  const things = () => compare(() => ({ things: window.__landscape.compare.around.things(), layers: window.__landscape.compare.around.glyphs(), active: [...document.querySelectorAll('#around .ail-ar__item')].findIndex((li) => li.classList.contains('is-active')) }));
  await expect.poll(async () => (await things()).things.filter(Boolean).length, { timeout: 60_000, message: 'one object stands in the cabinet (once its picture has loaded)' }).toBe(1);
  let a = await things();
  const thing = a.things[a.active];
  expect(thing && thing.layer, 'it is the open drawer\'s own').toBe(a.layers[a.active]);
  expect(Math.abs(thing.x - thing.drawer), 'and stands in it').toBeLessThan(0.01);
  await expect.poll(async () => { const now = (await things()).things[a.active]; return now ? now.tall : 0; }, { timeout: 30_000, message: 'it has come up out of the drawer' }).toBeGreaterThan(0.6);
  // (what is drawn, not only what the scene says: a frame without it differs where it stands, T-1)
  await expect.poll(() => drawnBy(page, 'around', a.active), { timeout: 30_000, message: 'the open drawer\'s object is drawn on the screen' }).toBeGreaterThan(25);
  await go(page, 'around', around.screens - 0.004, 300);
  expect((await things()).things.filter(Boolean), 'no object stands out when my stack takes the cabinet over').toEqual([]);
  await go(page, 'my-stack', 0.7, 600);
  const bench = () => compare(() => ({ sizes: window.__landscape.compare.mystack.sizes(), kept: [...document.querySelectorAll('#around .ail-ar__item')].map((li) => li.dataset.layer), swaps: [...document.querySelectorAll('#my-stack .ail-ms__piece[data-swap]')].map((li) => li.dataset.node.replace(/^aaron-/, '')) }));
  const wanted = (b) => b.sizes.filter((p) => b.kept.includes(p.layer) && !b.swaps.includes(p.id)).map((p) => p.id);
  await expect.poll(async () => { const b = await bench(); return b.sizes.filter((p) => p.thing > 0).map((p) => p.id).join() === wanted(b).join() ? 'all' : JSON.stringify(b.sizes); }, { timeout: 60_000, message: 'each thing the cabinet keeps stands on the bench as its paper object, and nothing else does' }).toBe('all');
  expect(wanted(await bench()).length, 'there are such things on his bench').toBeGreaterThan(0);
  for (const id of wanted(await bench())) expect(await drawnBy(page, 'bench', id), `the object on ${id} is drawn on the screen`).toBeGreaterThan(25);

  // ---- the far wall's picture hangs in the studio
  await go(page, 'top', 1.5, 300);
  await expect.poll(() => compare(() => window.__landscape.debug.ctx.studio.plate()), { timeout: 60_000, message: 'the wall\'s picture is up' }).toBe(true);
  expect(await drawnBy(page, 'wall'), 'and drawn on the screen (faintly: a far wall is quiet, seen through the room\'s air)').toBeGreaterThan(8);

  // ---- the rooms: a frame hangs in 3D where the text version shows that room's portrait (a desktop: a phone hangs
  // none), and the blank card stays on Meta's wall while the room's name stands in front of it
  const room = () => compare(() => {
    const w = window.__landscape.debug.ctx.worlds.active;
    return w ? { id: w.id, open: w.open, frame: !!(w.parts.portrait && w.parts.portrait.visible && w.portraitK === 1), card: w.parts.sign ? [w.parts.sign.visible, w.parts.sign.material.uniforms.uOpacity.value] : null, name: w.nameShow } : null;
  });
  if (!isMobile) {
    for (const id of ['google', 'meta']) {
      const hangs = await page.locator(`.ail-world[data-world="${id}"] .ail-world__portrait`).count() > 0;
      await go(page, id, 1.15, 600);
      // (Meta's frame hangs only where the window has room for it clear of the callouts: 1440 by 900 and wider)
      if (id === 'google') await expect.poll(async () => { const r = await room(); return r && r.id === id && r.open >= 0.999 ? r.frame : null; }, { timeout: 60_000, message: `${id}: the framed portrait hangs whole in its room, as its text version shows it (${hangs})` }).toBe(hangs);
      if (id === 'google' && hangs) expect(await drawnBy(page, 'portrait'), 'and is drawn on the screen').toBeGreaterThan(25);
    }
  }
  await go(page, 'meta', 1.15, 600);
  await expect.poll(async () => { const r = await room(); return r && r.id === 'meta' ? r.card : null; }, { timeout: 60_000, message: 'Meta\'s wall carries its blank card' }).toEqual([true, 1]);
  expect(await drawnBy(page, 'card'), 'and it is drawn on the screen, over the panel (white on a pale panel)').toBeGreaterThan(8);
  await go(page, 'meta', 0.5, 600);
  expect((await room()).card, 'and keeps it while the room\'s name stands on the wall').toEqual([true, 1]);

  // ---- reduced motion: every tank half full, three beads in every tray, and the open drawer's object out at once
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start();
  await go(page, 'billing', 0.5, 0);
  expect((await rail()).state, 'a still that compares nothing').toEqual([[0.5, 3], [0.5, 3], [0.5, 3], [0.5, 3], [0.5, 3]]);
  await go(page, 'around', 0.12 + 0.11 * 2.5, 0);
  await expect.poll(async () => { const now = (await things()).things[2]; return now ? now.tall : 0; }, { timeout: 60_000, message: 'the third drawer\'s object stands out whole' }).toBeGreaterThan(0.6);
});

// ---- landscape-29: the text version that follows the 3D page (review round 3: N-1, N-2)
// <main> as a list of elements: a short path, every attribute but a focus target's tabindex="-1", and its own text.
const markup = (page) => page.evaluate(() => {
  const main = document.querySelector('main'), out = [];
  const walk = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT);
  for (let e = walk.currentNode; e; e = walk.nextNode()) {
    const attrs = [...e.attributes].filter((a) => !(a.name === 'tabindex' && a.value === '-1')).map((a) => `${a.name}=${a.value}`).sort().join(' ');
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('|');
    const path = []; for (let p = e; p && p !== main; p = p.parentElement) path.unshift(p.tagName.toLowerCase() + (p.id ? `#${p.id}` : ''));
    out.push(`${path.slice(-3).join('>')} [${attrs}] ${own}`);
  }
  return out;
});
const differ = (a, b) => { const A = new Set(a), B = new Set(b); return [...a.filter((x) => !B.has(x)).map((x) => `- ${x}`), ...b.filter((x) => !A.has(x)).map((x) => `+ ${x}`)].slice(0, 12); };
test('landscape-29 the text version that follows the 3D page is the one a fresh load gives, whatever the reader did there: after the five worlds, a line-up floor, the laptop switch, a router pick and swaps in my stack, a short window and (Chromium) a lost context leave no attribute, state or name behind, his quote stands and his router is his own; and my stack built again after a swap and a far scroll stands his own companies\' figures on his pair', async ({ page, isMobile, browserName }) => {
  test.setTimeout(900_000);
  const fresh = await page.context().newPage();
  await fresh.setViewportSize(page.viewportSize());
  await fresh.goto('/ai-landscape/?tier=static');
  await fresh.waitForFunction(() => window.__landscape && window.__landscape.ready);
  const clean = await markup(fresh);
  const his = await fresh.evaluate(() => ({ quote: document.querySelector('#my-stack .ail-ms__quote').textContent.trim(), router: document.querySelector('#my-stack .ail-ms__piece[data-swap="router"] .ail-ms__name').textContent.trim() }));
  await fresh.close();
  const read = () => page.evaluate(() => { const q = document.querySelector('#my-stack .ail-ms__quote'); return { quote: q.checkVisibility({ visibilityProperty: true }) ? q.textContent.trim() : '', router: document.querySelector('#my-stack .ail-ms__piece[data-swap="router"] .ail-ms__name').textContent.trim() }; });
  const swap = (kind) => page.locator(`#my-stack .ail-ms__swap[data-swap="${kind}"]`).click();
  const cast = () => page.evaluate(() => window.__landscape.compare.mystack.cast().map((c) => ({ piece: c.piece, owner: c.owner, kind: c.kind, on: c.on })));
  let base = null;
  // the 3D page, used: every world opened, a floor of the line-up pressed, the laptop shut, a router picked, both swaps
  const use = async () => {
    await open(page);
    await light(page);
    for (const id of COMPANIES) await go(page, id, 1.3, 300);
    await go(page, 'line-up', 0.6, 300);
    await page.locator('#line-up button.ail-lu__layer').nth(6).click();
    await go(page, 'agents', 0.6, 300);
    if (await page.locator('#agents .ail-ag__switch').isVisible()) await page.locator('#agents .ail-ag__switch').click();
    await go(page, 'router', 0.7, 300);
    await page.locator('#router .ail-rt__name').first().click();
    await go(page, 'my-stack', 0.8, 1500);
    await expect.poll(async () => (await cast()).every((c) => c.on), { timeout: 60_000, message: 'both figures stand on his pair' }).toBe(true);
    base = await cast();
    await swap('router'); await swap('worker'); await swap('router');
    await frames(page, 4);
    expect(await read(), 'in 3D the swap stands in for his own pair').not.toEqual(his);
  };

  // a swap, a far scroll (my stack is let go) and back: built again, it stands his own pair and their own figures
  await use();
  const first = (await read()).router;
  await go(page, 'end', 0.5, 300);
  expect(await page.evaluate(() => !!window.__landscape.compare.mystack), 'my stack is let go at the end').toBe(false);
  await go(page, 'my-stack', 0.8, 1500);
  await expect.poll(async () => (await cast()).every((c) => c.on), { timeout: 60_000, message: 'both figures stand again' }).toBe(true);
  expect((await read()).router, `his router is his own again (it showed ${first} when the section was let go)`).toBe(his.router);
  const owners = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#my-stack .ail-ms__opts')].map((ul) => { const mine = document.getElementById('my-stack').dataset.mine.split(' '); const li = [...ul.querySelectorAll('li')].find((x) => mine.includes(x.dataset.ref)); return [ul.dataset.for, li.dataset.owner]; })));
  expect(base.map((c) => c.owner), 'on the first visit the figures are his router\'s and his coding agent\'s companies').toEqual([owners.router, owners.worker]);
  expect(await cast(), 'built again, the same figures stand on the same pieces (no other company\'s character on his router)').toEqual(base);
  await swap('router');
  await frames(page, 4);

  // a short window: the text version, as a fresh load gives it
  const size = page.viewportSize();
  await page.setViewportSize({ width: size.width, height: 480 });
  await expect.poll(async () => (await hook(page)).tier, { timeout: 60_000 }).toBe('static');
  expect(differ(clean, await markup(page)), 'after a short window the text version equals a fresh one').toEqual([]);
  expect(await read(), 'his quote stands and his router is his own').toEqual(his);
  // and outside <main>: no lid mark the scene laid over the page is left behind (review round 4, G-1)
  expect(await page.locator('body > img.ail-lidmark').count(), 'no lid mark image is left on the text version').toBe(0);
  if (browserName !== 'chromium') return;

  // a lost context, after the 3D page came back and was used again
  await page.setViewportSize(size);
  // (the 3D page built again without a reload lays one lid mark image over billing, not one more each time: G-1)
  await page.waitForFunction(() => window.__landscape.tier === 'low' && window.__landscape.ready && window.__landscape.frames > 2, null, { timeout: 90_000 });
  await go(page, 'billing', 0.5, 300);
  await expect.poll(() => page.locator('body > img.ail-lidmark').count(), { timeout: 30_000, message: 'the 3D page built again lays one lid mark image, not one more' }).toBe(1);
  await use();
  await page.evaluate(() => window.__landscape.debug.ctx.renderer.getContext().getExtension('WEBGL_lose_context').loseContext());
  await expect.poll(async () => (await hook(page)).tier, { timeout: 60_000 }).toBe('static');
  expect(differ(clean, await markup(page)), 'after a lost context the text version equals a fresh one').toEqual([]);
  expect(await page.locator('body > img.ail-lidmark').count(), 'and no lid mark image is left on it').toBe(0);
  expect(await read(), 'his quote stands and his router is his own').toEqual(his);
});

// ---- landscape-30: what a visit leaves on the GPU (review round 4, L-1)
test('landscape-30 a visit to my stack, billing or the line-up and back leaves nothing on the GPU: after the first, two more visits change neither the live buffers and vertex arrays nor three\'s geometries', async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'counts Chromium\'s WebGL calls, on a desktop');
  test.setTimeout(600_000);
  await page.addInitScript(() => {
    window.__gl = {};
    for (const P of [WebGL2RenderingContext.prototype, WebGLRenderingContext.prototype]) {
      for (const k of ['Buffer', 'VertexArray']) {
        const make = P[`create${k}`], free = P[`delete${k}`];
        if (!make || !free) continue;
        P[`create${k}`] = function (...a) { const o = make.apply(this, a); window.__gl[k] = (window.__gl[k] || 0) + 1; return o; };
        P[`delete${k}`] = function (o) { if (o) window.__gl[k] = (window.__gl[k] || 0) - 1; return free.call(this, o); };
      }
    }
  });
  await open(page);
  await light(page);
  const live = () => page.evaluate(() => ({ buffers: window.__gl.Buffer, arrays: window.__gl.VertexArray, geometries: window.__landscape.debug.ctx.renderer.info.memory.geometries }));
  for (const [id, u] of [['my-stack', 0.8], ['billing', 0.5], ['line-up', 0.6]]) {
    // (the first visit builds what stays: shared shapes, textures, programs)
    await go(page, id, u, 600);
    await go(page, 'top', 0.3, 600);
    const before = await live();
    for (let k = 0; k < 2; k++) { await go(page, id, u, 600); await go(page, 'top', 0.3, 600); }
    expect(await live(), `${id}: two more visits and back leave nothing behind`).toEqual(before);
  }
});
