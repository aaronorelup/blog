// The AI landscape (/ai-landscape/, its dated snapshots and their sources pages): a document of its own with none of
// the site's chrome, the newest snapshot at /ai-landscape/, a three.js scene that draws, follows the scroll and the
// pointer, a text version without WebGL, reduced motion with no scroll-jacking, no sideways overflow, the companies
// reachable by keyboard, at most 60 words on screen, and every string traced to the view model or the copy file.
import fs from 'node:fs';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { test, expect } from './fixtures.mjs';
import { SNAPSHOTS } from '../../src/data/ai-landscape.js';

const NEWEST = SNAPSHOTS[0].date;
const DATED = SNAPSHOTS.map((s) => `/ai-landscape/${s.date}/`);
const PAGES = ['/ai-landscape/', ...DATED];
const SOURCES = SNAPSHOTS.map((s) => `/ai-landscape/${s.date}/sources/`);
const COMPANIES = ['anthropic', 'openai', 'google', 'meta', 'xai'];
const WORDS_MAX = 60;

// ?tier=low pins the cheap animated rung and turns the watchdog off, so software WebGL never drops the page to its
// text version mid-test (the homepage precedent). The scene is up once window.__landscape says ready and it drew.
async function open(page, path = '/ai-landscape/', tier = 'low') {
  await page.goto(`${path}?tier=${tier}`);
  await page.waitForFunction(() => window.__landscape && window.__landscape.ready && (window.__landscape.tier === 'static' || window.__landscape.frames > 1), null, { timeout: 60_000 });
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
// The 3D in these walks is drawn at a pixel ratio of 0.5, so software WebGL keeps up. What they measure (words, the
// page's width, strings) is HTML and does not depend on it.
const light = (page) => page.evaluate(() => {
  const c = window.__landscape.debug.ctx;
  c.quality.ratio = 0.5; c.renderer.setPixelRatio(0.5); c.renderer.setSize(innerWidth, innerHeight, false); c.worlds.resize(innerWidth, innerHeight, 0.5);
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
  test.setTimeout(240_000);
  const origin = new URL(baseURL).origin;
  const errors = [];
  const away = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
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

test('landscape-2 /ai-landscape/ is the newest snapshot, each dated page is its own and links back, the editions and the sitemap list them all', async ({ page, request }) => {
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
    await expect(page.locator('.ail-strip a[href="/ai-landscape/"]')).toHaveCount(1);
    await expect(page.locator('.ail-eds__newest[href="/ai-landscape/"]')).toHaveCount(1);
    // the strip and the edition list hold every snapshot, newest first, this one marked
    expect(await editions('.ail-strip a[href^="/ai-landscape/2"]')).toEqual(DATED);
    expect(await editions('.ail-eds__list a')).toEqual(DATED);
    await expect(page.locator(`.ail-strip a[href="/ai-landscape/${date}/"]`)).toHaveAttribute('aria-current', 'page');
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of PAGES) expect(sitemap, path).toContain(`<loc>https://aaronorelup.com${path}</loc>`);
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
  await open(page);
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

test('landscape-6b the skip link, first on the page, switches to the same text version', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.ail-skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await hook(page)).tier).toBe('static');
  await readable(page);
});

test('landscape-7 reduced motion: the page scrolls natively, the story arrives at once, nothing moves by itself, and every section shows', async ({ page, isMobile }) => {
  test.setTimeout(240_000);
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

test('landscape-8 nothing runs off the side of the screen, in any section, 3D or text', async ({ page }) => {
  test.setTimeout(240_000);
  const wide = () => page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
  await open(page);
  await light(page);
  for (const s of await sections(page)) {
    for (const u of [0.1, 0.5, 0.9]) {
      await go(page, s.id, u * s.screens, 0);
      expect(await wide(), `${s.id} at ${u}`).toBeLessThanOrEqual(0);
    }
  }
  await open(page, '/ai-landscape/', 'static');
  for (const y of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((y) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * y), y);
    expect(await wide(), `text version at ${y}`).toBeLessThanOrEqual(0);
  }
  for (const path of SOURCES) { await page.goto(path); expect(await wide(), path).toBeLessThanOrEqual(0); }
});

test('landscape-9 the five companies are reachable from the keyboard, and every link on the page answers', async ({ page, request, baseURL }) => {
  test.setTimeout(240_000);
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
  grammar: [0.1, 0.35, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 3.95, 4.2],
};
const stopsOf = (s) => (STOPS[s.name] || [0.05, 0.3, 0.6, 0.9].map((f) => +(f * s.screens).toFixed(2))).filter((u) => u <= s.screens);

test('landscape-10 never more than 60 words on screen at first depth, in any state of the walk', async ({ page }) => {
  test.setTimeout(600_000);
  await open(page);
  await light(page);
  const over = [];
  let most = 0;
  for (const s of await sections(page)) {
    for (const u of stopsOf(s)) {
      await go(page, s.id, u);
      const words = await onScreen(page);
      most = Math.max(most, words.length);
      if (words.length > WORDS_MAX) over.push(`${s.id} at ${u}: ${words.length} words: ${words.join(' ')}`);
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

test('landscape-11 every string on the page is found in the view model or the copy file', async ({ page }) => {
  test.setTimeout(300_000);
  const missing = new Set();
  const check = (list, corpus, path) => {
    for (const { s, at } of list) {
      const picture = at === '@alt' || /\bail-world__caption\b/.test(at);
      if (!traces(s, picture ? { ...corpus, text: `${corpus.text}\n${corpus.alt}` } : corpus)) missing.add(`${path} [${at}] ${s}`);
    }
  };
  for (const date of SNAPSHOTS.map((x) => x.date)) {
    const corpus = await corpusOf(date);
    for (const path of [`/ai-landscape/${date}/?tier=static`, `/ai-landscape/${date}/sources/`]) {
      await page.goto(path);
      check(await strings(page), corpus, path);
    }
  }
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
