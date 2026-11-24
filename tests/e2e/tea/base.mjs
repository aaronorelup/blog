// The tea room's address in one constant, and the helpers its specs share (tea-next.spec.mjs, tea-engine.spec.mjs,
// tea/<id>.spec.mjs). The swap (piece 6a) changes TEA to '/tea/' and nothing else.
import fs from 'node:fs';
import sharp from 'sharp';
import { expect, test } from '../fixtures.mjs';
import { isLivePath } from '../../../src/data/exempt.js';
import { TEA_CHAPTERS } from '../../../src/data/tea-chapters.js';
import { COPY } from '../../../src/data/tea.js';

export const TEA = '/labs/tea-room/engine/';
export { expect, test };

// The chapters on the page, as the picks put them (the page reads them through teaChapters(); a spec reads the
// same file): [{ id, dom, title, short }], hidden ones left out, in order.
const picks = JSON.parse(fs.readFileSync(new URL('../../../src/data/tea-picks.json', import.meta.url), 'utf8'));
export const PICKS = picks;
export const CHAPTERS = picks.order.filter((id) => !picks.hidden?.[id]).map((id) => {
  const c = TEA_CHAPTERS.find((x) => x.id === id);
  return { id, dom: c.dom, kind: c.kind, title: COPY.room.chapters[id].title, short: COPY.room.chapters[id].short };
});
export const live = (url) => isLivePath(new URL(url, 'http://x').pathname);

export const settle = (page, timeout = 30_000) => page.waitForFunction(() => window.__room?.settled?.(), null, { timeout });
export async function read(page) {
  await settle(page);
  // what settled must also be what is on the screen: under load the browser may draw a picture that has just moved
  // a quicker way for a moment and redraw it at its settled quality. So the frame is read once two screenshots a
  // moment apart agree (with ?still=1 nothing else moves), then settled is asked again.
  let shot = await page.screenshot();
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(150);
    const next = await page.screenshot();
    if (Buffer.compare(shot, next) === 0) break;
    shot = next;
  }
  await settle(page);
  return { state: await page.evaluate(() => window.__room.state()), shot, y: await page.evaluate(() => scrollY) };
}
export const maxScroll = (page) => page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
export const scrollToShare = (page, s) => page.evaluate((s) => scrollTo(0, Math.round(Math.min(1, Math.max(0, s)) * (document.documentElement.scrollHeight - innerHeight))), s);

// Six uneven jumps inside a quarter of a second, overshooting by more than a chapter, then the exact place (2.5).
export const flick = (page, from, to) => page.evaluate(async ([a, b]) => {
  const max = document.documentElement.scrollHeight - innerHeight;
  for (const s of [a + (b - a) * 0.5, b + 0.2, b - 0.15, b + 0.06, b - 0.02, b]) {
    scrollTo(0, Math.round(Math.min(1, Math.max(0, s)) * max));
    await new Promise((r) => setTimeout(r, 40));
  }
}, [from, to]);

// The same with real mouse wheel events: uneven turns overshooting both ways, then the wheel turned by exactly what is
// left. Returns the scroll position it came to rest at.
export async function wheelTo(page, to) {
  const max = await maxScroll(page);
  const target = Math.round(Math.min(1, Math.max(0, to)) * max);
  await page.mouse.move(700, 450);
  const at = () => page.evaluate(() => scrollY);
  for (const s of [0.5, 1.2, 0.85, 1.06, 0.98]) {
    const now = await at();
    await page.mouse.wheel(0, Math.round((target - now) * s + (s > 1 ? max * 0.02 : 0)));
    await page.waitForTimeout(30);
  }
  for (let i = 0; i < 20; i++) {
    const before = await at();
    await page.waitForTimeout(60);
    const now = await at();
    if (now === before && now === target) break;
    if (now === before) await page.mouse.wheel(0, target - now);
  }
  return at();
}

// The share of a frame's pixels that differ between two screenshots (any channel by more than 24 of 255).
export async function pixelsThatDiffer(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => sharp(s).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (x.info.width !== y.info.width || x.info.height !== y.info.height) return 1;
  let n = 0;
  for (let i = 0; i < x.data.length; i += 3) {
    if (Math.abs(x.data[i] - y.data[i]) > 24 || Math.abs(x.data[i + 1] - y.data[i + 1]) > 24 || Math.abs(x.data[i + 2] - y.data[i + 2]) > 24) n++;
  }
  return n / (x.data.length / 3);
}

// The share that differs, with both frames kept beside the test's results when it is over the allowance.
export async function differ(a, b, label = 'frame') {
  const d = await pixelsThatDiffer(a, b);
  if (d >= 0.001) {
    const safe = label.replace(/[^a-z0-9]+/gi, '-');
    fs.writeFileSync(test.info().outputPath(`${safe}-a.png`), a);
    fs.writeFileSync(test.info().outputPath(`${safe}-b.png`), b);
  }
  return d;
}

// Every section's place, length and the marks of its paper, from the page.
export const sections = (page) => page.evaluate(() => [...document.querySelectorAll('[data-room-chapter]')].map((s) => {
  const r = s.getBoundingClientRect();
  return { id: s.dataset.roomChapter, top: r.top + scrollY, height: r.height, vh: document.querySelector('.room-lvh')?.getBoundingClientRect().height || innerHeight };
}));

// Console messages and failed requests, the live notebook's only warned about (section 5's first rule): a request
// for a live address that fails, and the console's "Failed to load resource" for it (the address is the message's
// location), are warnings, never problems.
export function watchConsole(page) {
  const problems = [];
  const warn = (m) => console.warn(`(live notebook, warned only) ${m}`);
  page.on('console', (m) => {
    if (!['error', 'warning'].includes(m.type())) return;
    const at = m.location()?.url;
    if (/Failed to load resource/.test(m.text()) && at && live(at)) return warn(`${m.text()} ${at}`);
    problems.push(`console ${m.type()}: ${m.text()}${at ? ` (${at})` : ''}`);
  });
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  // a picture whose address the engine changed before it arrived is abandoned, not failed
  page.on('requestfailed', (r) => {
    if (/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) return;
    if (live(r.url())) warn(`failed: ${r.url()}`); else problems.push(`failed: ${r.url()}`);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    if (live(r.url())) warn(`${r.status()}: ${r.url()}`); else problems.push(`${r.status()}: ${r.url()}`);
  });
  return problems;
}

// Every <img> that is displayed and within one screen of the frame has decoded. A live notebook's picture that has
// not is warned about and left out (section 5's first rule).
export async function undecoded(page) {
  const all = await page.evaluate(() => [...document.images].filter((img) => {
    if (!img.getAttribute('src') && !img.currentSrc) return false;
    if (img.closest('[hidden]') || getComputedStyle(img).display === 'none' || img.offsetParent === null && getComputedStyle(img).position !== 'fixed') return false;
    const r = img.getBoundingClientRect();
    if (r.width === 0 || r.bottom < -innerHeight || r.top > 2 * innerHeight) return false;
    return !(img.complete && img.naturalWidth > 0);
  }).map((img) => img.currentSrc || img.src));
  for (const u of all.filter(live)) console.warn(`(live notebook, warned only) not decoded: ${u}`);
  return all.filter((u) => !live(u));
}

// The shared checks every chapter's spec runs on its stub (and keeps when it is built): its section, anchor and
// heading; at its opening frame the screens are open, its scene is on, nothing is logged, nothing scrolls sideways
// and every picture in reach has decoded; with JavaScript off its heading and its links show.
export function chapterChecks(id) {
  const c = CHAPTERS.find((x) => x.id === id);
  test.describe(`chapter ${id}`, () => {
    test.skip(!c, `${id} is hidden by the picks`);
    test(`${id}: its section, anchor and heading, and its opening frame is clean`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto(`${TEA}?still=1#${c.dom}`);
      await settle(page);
      const sec = page.locator(`[data-room-chapter="${id}"]`);
      await expect(sec).toHaveAttribute('aria-labelledby', `${c.dom}-title`);
      await expect(sec.locator(`#${c.dom}`)).toHaveCount(1);
      const heading = id === 'hero' ? page.locator('h1') : sec.locator(`h2#${c.dom}-title`);
      await expect(heading).toHaveCount(1);
      if (id !== 'hero') expect((await heading.textContent()).replace(/\s+/g, ' ').trim()).toBe(c.title);
      const state = await page.evaluate(() => window.__room.state());
      expect(state.on.startsWith(`${id}/`)).toBe(true);
      expect(state.screens.every((s) => !s.shown)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await undecoded(page)).toEqual([]);
      expect(problems).toEqual([]);
    });
    test.describe('without JavaScript', () => {
      test.use({ javaScriptEnabled: false });
      test(`${id}: book mode shows its heading and every link`, async ({ page }) => {
        await page.goto(TEA);
        const sec = page.locator(`[data-room-chapter="${id}"]`);
        if (id !== 'hero') await expect(sec.locator('h2')).toBeVisible();
        for (const a of await sec.locator('a[href]').all()) await expect(a).toBeVisible();
      });
    });
  });
}
