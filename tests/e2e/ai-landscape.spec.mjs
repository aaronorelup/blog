// The AI landscape (/ai-landscape/, its dated snapshots and their sources pages): a document of its own with none of
// the site's chrome, the newest snapshot at /ai-landscape/, a three.js scene that draws, follows the scroll and the
// pointer, a text version without WebGL, reduced motion with no scroll-jacking, nothing off the side or out of reach,
// the companies reachable by keyboard, at most 60 words on screen, and every string traced to the view model or the
// copy file and standing where it belongs. Rows 12 on hold the failure paths of review round 1: one frame loop
// however often the tab is hidden, the skip link before the scene, resizes and rotation, a lost context, a whole page
// by keyboard, a lost chunk, and the design pass's states that a scroll alone must change.
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
  test.setTimeout(900_000);   // 54 stops: alone about 1.5 min, several times that beside three other WebGL walks on 4 cores
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
    if (r.right > innerWidth + 1 || r.left < -1) out.outside.push(`${name(el)} ${Math.round(r.left)}..${Math.round(r.right)}`);
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
    const px = parseFloat(getComputedStyle(el).fontSize);
    const floor = el.closest('.ail-fact, .ail-sentence, p, li') && !el.closest('.ail-label') ? 14 : 12;      // a label is 12 px wherever it stands
    if (px < floor - 0.01) out.small.push(`${px}px < ${floor}: ${name(el)}`);
  }
  return out;
};

test('landscape-8 nothing runs off the side or stands out of reach, in any section, 3D or text: every stage piece inside the window, no invisible control, no other section under a finger, plates whole or gone, no small type, draw calls in budget', async ({ page }) => {
  test.setTimeout(900_000);   // 54 stops: alone about 2 min, several times that beside three other WebGL walks on 4 cores
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
  grammar: [0.1, 0.2, 0.39, 0.67, 0.95, 1.23, 1.58, 1.94, 2.22, 2.5, 2.78, 3.0, 3.15],
};
const stopsOf = (s) => (STOPS[s.name] || [0.05, 0.3, 0.6, 0.9].map((f) => +(f * s.screens).toFixed(2))).filter((u) => u <= s.screens);

test('landscape-10 never more than 60 words on screen at first depth (80 on a board), in any state of the walk, and a world\'s nine floors whole while they are open', async ({ page }) => {
  test.setTimeout(900_000);
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
      if (s.name === 'worlds' && u >= 0.95 && u <= 1.6) {
        const whole = await page.evaluate((id) => [...document.querySelectorAll(`#${id} .ail-doors [data-agent] .ail-stack > .ail-floor`)].filter((f) => {
          let o = 1; for (let n = f; n && n.nodeType === 1; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
          return o >= 0.98 && f.checkVisibility({ visibilityProperty: true });
        }).length, s.id);
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
  test.setTimeout(600_000);
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
  await page.waitForTimeout(5000);
  const fresh = await browser.newPage({ baseURL, viewport: { width: 768, height: 1024 } });
  await open(fresh);
  await fresh.waitForTimeout(5000);
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

test('landscape-16 Tab and Enter alone reach a control in every section, each one seen; a rail link puts focus on its section\'s heading', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a phone has no Tab key: the minimap and the scroll lead');
  test.setTimeout(600_000);
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
  const toward = async (id) => {
    const s0 = await page.evaluate((id) => window.__landscape.debug.ctx.clock.sections.find((q) => q.id === id).s0, id);
    for (const ds of [-2, -1, 1]) { await page.evaluate((s) => window.scrollTo(0, window.__landscape.debug.ctx.clock.pixels(s)), s0 + ds); await page.waitForTimeout(1200); }
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
