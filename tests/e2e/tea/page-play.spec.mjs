// The page-level checks of what plays and what loads (5.2), piece 1's (no chapter has the id "page-play"): one
// button, one thing plays, the weight of the first paint, 3D stays lazy, and not the frame before. Loops are not
// on the page yet (no chapter has landed a clip in R2), so "three loops in view play together" and "no loop plays
// while a film plays" are not tested here: the first chapter that lands a loop adds them (docs/TEA_ROOM.md).
import fs from 'node:fs';
import { CHAPTERS, TEA, expect, settle, test } from './base.mjs';
import { CALM, FLOORS, comparePictures, verdict } from '../../../scripts/tools/tea/differ.mjs';

const go = async (page, id) => {
  const c = CHAPTERS.find((x) => x.id === id);
  await page.evaluate((dom) => { location.hash = dom; }, c.dom);
  await settle(page);
};
const press = async (page, key) => {
  const button = page.locator(`[data-room-embed="${key}"] [data-room-play]`);
  await button.scrollIntoViewIfNeeded();
  await settle(page);
  await button.click();
};

test('tea-next-30 one button: an embed shows one paper button and nothing of the thing before a press, and a game mounts with none of its own', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a game is for a desktop');
  test.setTimeout(120_000);
  const asked = [];
  page.on('request', (r) => asked.push(new URL(r.url()).pathname));
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  await go(page, 'games');
  const box = page.locator('[data-room-embed="storm-bell-fighter"]');
  await expect(box.locator('button')).toHaveCount(1);
  await expect(box.locator('ao-game')).toHaveCount(0);
  expect(asked.filter((u) => u.startsWith('/games/storm-bell/'))).toEqual([]);
  await press(page, 'storm-bell-fighter');
  await expect(box.locator('ao-game iframe')).toHaveCount(1);
  await expect(box.locator('.ao-game-load, .ao-game-poster')).toHaveCount(0);
  await expect(box.locator('[data-room-play]')).toBeHidden();
});

// A lab machine draws in WebGL, which this box does in software: under four workers a wheel event waits for the
// machine's frame, so this test has room to run.
test('tea-next-30 one button: a machine opens in a sheet, the wheel over the sheet (its paper and its machine) never scrolls the page behind, and Esc closes it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the lab\'s machines are for a desktop');
  test.setTimeout(300_000);
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  await go(page, 'tv');
  await press(page, 'dray');
  const sheet = page.locator('dialog.room-sheet[open]');
  await expect(sheet.locator('ao-game iframe')).toHaveCount(1);
  const y = await page.evaluate(() => scrollY);
  const r = await sheet.boundingBox();
  const f = await sheet.locator('ao-game iframe').boundingBox();
  for (const [x, yy] of [[r.x + r.width - 30, r.y + 8], [f.x + f.width / 2, f.y + f.height / 2]]) {
    await page.mouse.move(x, yy);
    for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(80); }
    expect(await page.evaluate(() => scrollY), `wheel at ${Math.round(x)},${Math.round(yy)}`).toBe(y);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.room-sheet')).toHaveCount(0);
});

test('tea-next-31 one thing plays: starting a film pauses a running game, and with ?still=1 no video plays anywhere', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a game is for a desktop');
  test.setTimeout(120_000);
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  for (const s of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    await page.evaluate((s) => scrollTo(0, Math.round(s * (document.documentElement.scrollHeight - innerHeight))), s);
    await settle(page);
    expect(await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length), `at ${s}`).toBe(0);
  }
  await go(page, 'games');
  await press(page, 'storm-bell-fighter');
  const game = page.locator('[data-room-embed="storm-bell-fighter"] ao-game');
  await expect(game.locator('iframe')).toHaveCount(1);
  expect(await game.evaluate((g) => g.aoPlaying())).toBe(true);
  await go(page, 'film');
  await press(page, 'bad-very-bad');
  await expect(page.locator('[data-room-embed="bad-very-bad"] video')).toHaveCount(1);
  await expect.poll(() => game.evaluate((g) => g.aoPlaying())).toBe(false);
});

// Every request the top of the page makes, beside 2.9's list: the HTML, the CSS and the engine (/_astro/), the
// fonts, the hero's plates and the television's (/tea/hero/, /tea/scenes/hero/), the shared paper and screens, and
// straight after first paint the room behind the door. The screens' shadow of the next change is the screens'
// own. Nothing of a scene more than one and a half chapters away.
test('tea-next-32 weight: the top of the page fetches only what 2.9 lists, and the bytes are printed beside their targets', async ({ page, baseURL }) => {
  const got = [];
  page.on('response', async (r) => {
    const u = new URL(r.url());
    if (u.host !== new URL(baseURL).host) return;
    const n = Number(r.headers()['content-length'] || 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
    got.push([u.pathname, n]);
  });
  await page.goto(TEA);
  await settle(page);
  await page.waitForTimeout(1000);
  const [hero, door, next] = CHAPTERS;
  const allowed = [/^\/tea-next\/$/, /^\/_astro\//, /^\/fonts\//, /^\/tea\/hero\//, /^\/tea\/shared\//, /^\/favicon/,
    new RegExp(`^/tea/scenes/(${hero.id}|${door.id})/`), new RegExp(`^/tea/scenes/${next?.id}/shadow\\.webp$`)];
  const extra = got.filter(([u]) => !allowed.some((re) => re.test(u)));
  const total = got.reduce((n, [, b]) => n + b, 0);
  console.log(`first paint and straight after, ${page.viewportSize().width}x${page.viewportSize().height}: ${(total / 1024).toFixed(1)} KB (targets 800 KB + 700 KB; text counted as served, not gzip)`);
  expect(extra).toEqual([]);
});

const NO3D = /three|GLTFLoader|\.glb(\?|$)/;
for (const [name, opts] of [['live', {}], ['reduced motion', { reducedMotion: 'reduce' }], ['Save-Data', { saveData: true }], ['no WebGL', { noGl: true }]]) {
  test(`tea-next-33 3D stays lazy (${name}): no request for three, GLTFLoader or a model at load`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...(opts.reducedMotion ? { reducedMotion: 'reduce' } : {}) });
    const page = await ctx.newPage();
    if (opts.saveData) await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }));
    if (opts.noGl) await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, ...a) { return /webgl/.test(k) ? null : get.call(this, k, ...a); }; });
    const asked = [];
    page.on('request', (r) => { if (NO3D.test(new URL(r.url()).pathname)) asked.push(r.url()); });
    await page.goto(new URL(TEA, test.info().project.use.baseURL).href);
    await page.waitForLoadState('networkidle');
    expect(asked).toEqual([]);
    await ctx.close();
  });
}

// Not the frame before (1.12, 5.2), with ?words=0: inside a chapter, frames one screen apart differ; a chapter's
// opening frame differs from the chapter's before it. A stub chapter (its component still RoomStub's) is a
// placeholder and is not held to the bar: the check turns on for a chapter when its builder replaces the stub.
// TEA_DIFFER_STUBS=1 holds the stubs to it too.
const PART = { '3d': 'ThreeD' };
const stub = (id) => fs.readFileSync(new URL(`../../../src/components/tea/room/chapters/${PART[id] ?? id[0].toUpperCase() + id.slice(1)}.astro`, import.meta.url), 'utf8').includes('RoomStub');
for (const [i, c] of CHAPTERS.entries()) {
  if (c.id === 'hero') continue;
  test(`tea-next-34 not the frame before: ${c.id}`, async ({ page }) => {
    test.fixme(stub(c.id) && process.env.TEA_DIFFER_STUBS !== '1', `${c.id} is still a stub`);
    test.setTimeout(240_000);
    await page.goto(`${TEA}?still=1&words=0`);
    await settle(page);
    const shot = async (y) => { await page.evaluate((y) => scrollTo(0, Math.round(y)), y); await settle(page); return page.screenshot(); };
    const top = async (id) => page.evaluate((id) => { const s = document.querySelector(`[data-room-chapter="${id}"]`); return s.getBoundingClientRect().top + scrollY; }, id);
    const vh = await page.evaluate(() => document.querySelector('.room-lvh').getBoundingClientRect().height);
    const open = async (j) => shot((await top(CHAPTERS[j].id)) + (j <= 1 ? 0 : 0.5 * vh) + 2);
    const bad = [];
    const r = await comparePictures(await open(i - 1), await open(i));
    const v = verdict(r, 'chapter', FLOORS);
    if (!v.ok) bad.push(`${CHAPTERS[i - 1].id} -> ${c.id}: ${v.why}`);
    if (!CALM.includes(c.id)) {
      const t = await top(c.id);
      const end = t + (await page.evaluate((id) => document.querySelector(`[data-room-chapter="${id}"]`).getBoundingClientRect().height, c.id)) - vh;
      let prev = await shot(t + 0.5 * vh + 2);
      for (let y = t + 1.5 * vh + 2; y <= end; y += vh) {
        const now = await shot(y);
        const s = verdict(await comparePictures(prev, now), 'step', FLOORS);
        if (!s.ok) bad.push(`${c.id} at ${((y - t) / vh).toFixed(1)} vh: ${s.why}`);
        prev = now;
      }
    }
    expect(bad).toEqual([]);
  });
}
