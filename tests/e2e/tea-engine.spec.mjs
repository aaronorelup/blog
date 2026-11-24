// The tea room's engine in a real browser (2.5, 5.2): the frame at a scroll position is the same however the reader
// got there (loaded directly, flicked to from the top, flicked to from the bottom, with scrollTo and with real mouse
// wheel turns), in state read back from the page and in pixels; no frame is empty; nothing scrolls sideways. The
// desktop project runs at 1440x900 and at 760 wide, the phone project at its own size.
import { CHAPTERS, TEA, differ, expect, flick, maxScroll, read, scrollToShare, sections, settle, test, wheelTo } from './tea/base.mjs';
import { judgePicture } from '../../scripts/tools/tea/sweep.mjs';

const SPOTS = [0.03, 0.11, 0.24, 0.37, 0.52, 0.68, 0.83, 0.97];

// Places in vh that matter beside the even spots: inside a screens change (half shut), at the door's handover, and
// in the middle of the door's opening. Turned into shares of the page once its sections are measured.
async function hardSpots(page) {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const secs = await sections(page);
  const max = await maxScroll(page);
  const at = (y) => Math.min(1, Math.max(0, y / max));
  const out = [];
  if (secs[1]) out.push(['the door, mid way', at(secs[1].top - 0.6 * secs[1].vh)], ['the door, its handover', at(secs[1].top)]);
  // every screens change: half shut before it, and half open after it
  secs.slice(2).forEach((s) => out.push([`before ${s.id}, half shut`, at(s.top - 0.3 * s.vh)], [`into ${s.id}, half open`, at(s.top + 0.3 * s.vh)]));
  const last = secs[secs.length - 1];
  if (last) out.push(['the house closing', at(last.top + last.height - 1.3 * last.vh)]);
  return out;
}

const SIZES = [{ width: 1440, height: 900 }, { width: 760, height: 1000 }, { width: 390, height: 844 }];

for (const size of SIZES) {
  test.describe(`purity at ${size.width} wide`, () => {
    test.beforeEach(({ isMobile }, info) => { info.skip(isMobile && size.width !== 1440, 'the phone runs at its own size once'); });
    test.use({});

    for (const p of SPOTS) {
      test(`the frame at ${p} is the same however you arrive (${size.width})`, async ({ page, isMobile }) => {
        if (!isMobile) await page.setViewportSize(size);
        await page.goto(`${TEA}?still=1&y=${p}`);
        const direct = await read(page);
        await page.goto(`${TEA}?still=1`);
        await settle(page);
        await flick(page, 0, p);
        const down = await read(page);
        await page.goto(`${TEA}?still=1&y=1`);
        await settle(page);
        await flick(page, 1, p);
        const up = await read(page);
        expect(down.y).toBe(direct.y);
        expect(up.y).toBe(direct.y);
        expect(down.state).toEqual(direct.state);
        expect(up.state).toEqual(direct.state);
        expect(await differ(down.shot, direct.shot, 'down')).toBeLessThan(0.001);
        expect(await differ(up.shot, direct.shot, 'up')).toBeLessThan(0.001);
      });
    }

    test(`the hard places (the door, the screens half shut, the house closing) are the same however you arrive (${size.width})`, async ({ page, isMobile }) => {
      test.setTimeout(600_000);
      if (!isMobile) await page.setViewportSize(size);
      for (const [name, p] of await hardSpots(page)) {
        await page.goto(`${TEA}?still=1&y=${p}`);
        const direct = await read(page);
        for (const from of [0, 1]) {
          await page.goto(`${TEA}?still=1&y=${from}`);
          await settle(page);
          await flick(page, from, p);
          const got = await read(page);
          expect(got.y, name).toBe(direct.y);
          expect(got.state, `${name}, from ${from}`).toEqual(direct.state);
          expect(await differ(got.shot, direct.shot, `${name} from ${from}`), `${name}, from ${from}`).toBeLessThan(0.001);
        }
      }
    });

    test(`real wheel turns, down and up, leave the same frame as one jump to where they stop (${size.width})`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'a phone has no wheel');
      test.setTimeout(180_000);
      await page.setViewportSize(size);
      for (const [from, to] of [[0, 0.24], [0.6, 0.37], [0.1, 0.52], [0.97, 0.68]]) {
        await page.goto(`${TEA}?still=1&y=${from}`);
        await settle(page);
        const y = await wheelTo(page, to);
        const wheeled = await read(page);
        expect(wheeled.y).toBe(y);
        await page.goto(`${TEA}?still=1`);
        await settle(page);
        await page.evaluate((y) => scrollTo(0, y), y);
        const direct = await read(page);
        expect(direct.y).toBe(y);
        expect(wheeled.state).toEqual(direct.state);
        expect(await differ(wheeled.shot, direct.shot, `wheel ${from} ${to}`)).toBeLessThan(0.001);
      }
    });
  });
}

test('the empty-frame sweep: no frame is nearly all dark, and no band is dark and flat (on a phone the lower 40%)', async ({ page, isMobile }) => {
  test.setTimeout(400_000);
  const n = isMobile ? 200 : 240;
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const bad = [];
  let closed = 0;
  for (let i = 0; i < n; i++) {
    const y = i / (n - 1);
    await scrollToShare(page, y);
    await settle(page);
    // the footer rises over the house shut dark at the end (1.6): a frame that is half footer is the page's end, not
    // a picture of the world, and is not swept
    // and the house shut dark under it (1.6) is by the brief's own design: those frames are counted, not failed
    if (await page.evaluate(() => document.querySelector('.room-end').getBoundingClientRect().top < innerHeight / 2
      || (window.__room.frame.screens.into === -1 && window.__room.frame.screens.shut === 1))) { closed++; continue; }
    const r = await judgePicture(await page.screenshot({ scale: 'css' }), { phone: isMobile });
    if (!r.ok) bad.push(`${y.toFixed(3)}: ${r.why}`);
  }
  expect(bad).toEqual([]);
  expect(closed).toBeLessThan(n * 0.05);
});

test('nothing scrolls sideways: at every half screen the page is no wider than the window, and html and body never set overflow', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const { overflow } = await page.evaluate(() => ({
    overflow: [document.documentElement, document.body].map((e) => [getComputedStyle(e).overflowX, getComputedStyle(e).overflowY]),
  }));
  expect(overflow).toEqual([['visible', 'visible'], ['visible', 'visible']]);
  const max = await maxScroll(page);
  const vh = await page.evaluate(() => innerHeight);
  const wide = [];
  for (let y = 0; y <= max; y += vh / 2) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await settle(page);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || scrollX !== 0)) wide.push(y);
  }
  expect(wide).toEqual([]);
});

test('the page holds every chapter the picks show, so the engine has every section to measure', async ({ page }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  expect((await sections(page)).map((s) => s.id)).toEqual(CHAPTERS.map((c) => c.id));
});
