// The page-level loading checks (piece 1's, not a chapter's: no chapter has the id "page-load"). What the reader
// sees while pictures are on their way (2.5 "Loading", 2.9): a jump never shows an empty stage, a picture that fails
// is never a broken box and comes back, a window loads only its own composition's pictures and the scene on screen
// first, book mode fetches nothing only the stage draws, and a slow network shifts nothing.
import { judgePicture } from '../../../scripts/tools/tea/sweep.mjs';
import { CHAPTERS, TEA, expect, settle, test, undecoded } from './base.mjs';

const SCENES = '**/tea/scenes/**';
const frames = (page, n = 2) => page.evaluate((n) => new Promise((done) => {
  const step = (k) => (k ? requestAnimationFrame(() => step(k - 1)) : done());
  step(n);
}), n);
// the pictures shown in the stage that are broken: an address set, the load over, and nothing to draw
const broken = (page) => page.evaluate(() => [...document.querySelectorAll('.room-stage img')]
  .filter((el) => !el.closest('[hidden]') && el.offsetParent !== null && el.getAttribute('src') && el.complete && el.naturalWidth === 0)
  .map((el) => el.getAttribute('src')));
// every address under the stage that a composition holds, by composition
const stageUrls = (page) => page.evaluate(() => {
  const of = (sel) => new Set([...document.querySelectorAll(sel)].map((el) => el.dataset.src || el.getAttribute('src'))
    .filter((u) => u && !u.startsWith('data:')).map((u) => new URL(u, location.href).pathname));
  return { d: [...of('.room-comp[data-comp="d"] img')], p: [...of('.room-comp[data-comp="p"] img')] };
});
const far = CHAPTERS.slice(4).filter((c) => ['courses', 'games', 'about', 'tv'].includes(c.id));

test('tea-next-25 a jump to a chapter far off shows its room at once, never the night ground, while its pictures are still on their way', async ({ page }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const held = [];
  await page.route(SCENES, (route) => { held.push(route); });
  for (const c of far) {
    await page.evaluate((dom) => { location.hash = dom; }, c.dom);
    await frames(page);
    const v = await judgePicture(await page.screenshot(), { phone: page.viewportSize().height > page.viewportSize().width });
    expect(v.bright, `${c.id}: ${v.why}`).toBeGreaterThan(0.3);
    expect(await broken(page)).toEqual([]);
  }
  await page.unroute(SCENES);
  for (const r of held) await r.continue().catch(() => {});
});

test('tea-next-26 a picture that fails to load is never a broken box, and its scene comes back when the network does', async ({ page }) => {
  test.setTimeout(120_000);
  const art = CHAPTERS.find((c) => c.id === 'art');
  test.skip(!art, 'art is hidden by the picks');
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  await page.route('**/tea/scenes/art/**', (route) => route.abort('internetdisconnected'));
  await page.evaluate((dom) => { location.hash = dom; }, art.dom);
  await page.waitForTimeout(2500);
  expect(await broken(page)).toEqual([]);
  const v = await judgePicture(await page.screenshot(), { phone: page.viewportSize().height > page.viewportSize().width });
  expect(v.bright, v.why).toBeGreaterThan(0.3);
  await page.unroute('**/tea/scenes/art/**');
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await settle(page, 30_000);
  expect(await broken(page)).toEqual([]);
  expect(await undecoded(page)).toEqual([]);
  expect((await page.evaluate(() => window.__room.state())).on.startsWith('art/')).toBe(true);
});

test('tea-next-27 a window fetches only its own composition\'s pictures, the scene on screen first, and the other one after a turn', async ({ page }) => {
  test.setTimeout(120_000);
  const asked = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.pathname.startsWith('/tea/')) asked.push(u.pathname); });
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const urls = await stageUrls(page);
  const wide = page.viewportSize().width > page.viewportSize().height;
  const mine = new Set(wide ? urls.d : urls.p);
  const other = (wide ? urls.p : urls.d).filter((u) => !mine.has(u));
  const games = CHAPTERS.find((c) => c.id === 'games');
  asked.length = 0;
  await page.evaluate((dom) => { location.hash = dom; }, games.dom);
  await settle(page);
  const scenes = asked.filter((u) => u.startsWith('/tea/scenes/'));
  expect(scenes[0], `first after the jump: ${scenes.slice(0, 4).join(', ')}`).toMatch(/^\/tea\/scenes\/games\//);
  for (const c of CHAPTERS) {
    if (c.id === 'hero') continue;
    await page.evaluate((dom) => { location.hash = dom; }, c.dom);
    await settle(page);
  }
  expect(asked.filter((u) => other.includes(u))).toEqual([]);
  // turned the other way, the window draws the other composition, and its pictures come
  await page.evaluate((dom) => { location.hash = dom; }, games.dom);
  await settle(page);
  const size = page.viewportSize();
  await page.setViewportSize({ width: size.height, height: size.width });
  await settle(page, 30_000);
  expect(await undecoded(page)).toEqual([]);
  expect(await broken(page)).toEqual([]);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('tea-next-28 book mode fetches no picture that only the stage draws', async ({ page }) => {
    const asked = [];
    page.on('request', (r) => asked.push(new URL(r.url()).pathname));
    await page.goto(TEA);
    await page.waitForLoadState('networkidle');
    const { stage, book } = await page.evaluate(() => {
      const path = (u) => new URL(u, location.href).pathname;
      const book = new Set([...document.querySelectorAll('.room-still img, .room-still source')]
        .flatMap((el) => [el.getAttribute('src'), el.getAttribute('srcset')]).filter(Boolean).map(path));
      const stage = [...document.querySelectorAll('.room-stage img')].map((el) => el.dataset.src || el.getAttribute('src'))
        .filter((u) => u && !u.startsWith('data:')).map(path);
      return { stage: [...new Set(stage)], book: [...book] };
    });
    expect(asked.filter((u) => stage.includes(u) && !book.includes(u))).toEqual([]);
  });
});

test('tea-next-29 on a slow network the first paint is a picture and nothing shifts from load to settled', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'the network is slowed through the Chromium protocol');
  test.setTimeout(150_000);
  await page.addInitScript(() => {
    window.__shift = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shift.push([e.value, e.sources?.map((s) => s.node?.className || s.node?.nodeName)]); })
      .observe({ type: 'layout-shift', buffered: true });
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 62_500, uploadThroughput: 62_500 });
  await page.goto(`${TEA}?still=1`, { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  const first = await judgePicture(await page.screenshot(), { phone: page.viewportSize().height > page.viewportSize().width });
  await settle(page, 120_000);
  expect(await page.evaluate(() => window.__shift)).toEqual([]);
  expect(first.bright, `the frame 1.5 s in: ${first.why}`).toBeGreaterThan(0.3);
});
