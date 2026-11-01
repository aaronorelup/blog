// Every same-origin page a post links, iframes or plays in <ao-game> (targets.json "standalone"): it loads with a clean
// console and its ?v= variants switch. The HLS player pages stream from R2, seek and show captions; the BAD. VERY BAD.
// making-of page keeps its own lightbox. INVENTORY rows standalone-*, hls-*, making-*.
import fs from 'node:fs';
import { test, expect } from './fixtures.mjs';
import { targets, play, expectPlaying } from './helpers.mjs';

const pages = Object.entries(targets.standalone).filter(([, s]) => !s.live);
const publicFile = (p) => new URL('../../public' + p + 'index.html', import.meta.url);

// Console errors and uncaught exceptions while a page loads and settles.
async function visit(page, href) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(href, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  return { status: res.status(), errors };
}

for (const [path, s] of pages) {
  for (const href of s.hrefs) {
    test(`standalone-1 ${href} loads with a clean console`, async ({ page }) => {
      const { status, errors } = await visit(page, href);
      expect(status).toBe(200);
      expect(errors).toEqual([]);
    });
  }
  const variants = s.hrefs.filter((h) => /[?&]v=/.test(h));
  if (variants.length) {
    test(`standalone-2 ${path} switches to its ?v= variants`, async ({ page }) => {
      const shown = async (href) => {
        await page.goto(href);
        return page.locator('video').first().evaluate((v) => [v.getAttribute('src') || v.currentSrc, v.poster].join(' '));
      };
      const base = await shown(s.hrefs.find((h) => !/[?&]v=/.test(h)));
      for (const v of variants) expect(await shown(v)).not.toBe(base);
    });
  }
}

// Player pages under /media/ that stream HLS (their own script loads master.m3u8), linked or not.
const hls = Object.entries(targets.pages)
  .filter(([p, info]) => !info.live && info.kind === 'public' && info.video > 0 && p.startsWith('/media/') &&
    fs.readFileSync(publicFile(p), 'utf8').includes('master.m3u8'))
  .map(([p]) => p);

for (const path of hls) {
  test(`hls-1 ${path} streams, a seek to the middle is answered from R2, captions show`, async ({ page }) => {
    test.slow();
    await page.goto(path + '?embed');
    const v = page.locator('video').first();
    await expect.poll(() => v.evaluate((m) => (isFinite(m.duration) ? m.duration : 0)), { timeout: 30_000 }).toBeGreaterThan(5);
    await v.evaluate((m) => { m.muted = true; m.play().catch(() => {}); });
    await expectPlaying(v);
    const seek = page.waitForResponse((r) => /\.(ts|mp4|m4s)(\?|$)/.test(new URL(r.url()).pathname), { timeout: 30_000 });
    await v.evaluate((m) => { m.currentTime = m.duration / 2; });
    const res = await seek;
    expect([200, 206]).toContain(res.status());
    expect(res.headers()['x-media-source']).toBe('r2');
    await expect.poll(() => v.evaluate((m) => m.currentTime), { timeout: 30_000 }).toBeGreaterThan(1);
    const tracks = await v.evaluate((m) => m.textTracks.length);
    if (tracks) {
      await v.evaluate((m) => { m.textTracks[0].mode = 'showing'; });
      await expect.poll(() => v.evaluate((m) => m.textTracks[0].cues?.length || 0)).toBeGreaterThan(0);
    }
  });
}

test.describe('the making-of page', () => {
  const making = pages.map(([p]) => p).find((p) => p.endsWith('/making-of/'));
  test.beforeEach(async ({ page }) => page.goto(making));

  test('making-1 a thumbnail opens the lightbox, arrows page its group, Esc closes', async ({ page }) => {
    const th = page.locator('.th').first();
    const g = await th.getAttribute('data-g');
    const n = await page.locator(`.th[data-g="${g}"]`).count();
    await th.click();
    const lb = page.locator('#lb');
    await expect(lb).toBeVisible();
    await expect(page.locator('#lbc')).toContainText(`(1 / ${n})`);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#lbc')).toContainText(`(${n > 1 ? 2 : 1} / ${n})`);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#lbc')).toContainText(`(1 / ${n})`);
    await page.keyboard.press('Escape');
    await expect(lb).toBeHidden();
  });

  test('making-2 the side buttons page, the close button and the backdrop close', async ({ page }) => {
    await page.locator('.th').first().click();
    await page.locator('#lbn').click();
    await expect(page.locator('#lbc')).toContainText('(2 /');
    await page.locator('#lbp').click();
    await expect(page.locator('#lbc')).toContainText('(1 /');
    await page.locator('#lbx').click();
    await expect(page.locator('#lb')).toBeHidden();
    await page.locator('.th').first().click();
    await page.locator('#lb').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#lb')).toBeHidden();
  });

  test('making-3 its clips play, served in byte ranges', async ({ page }) => {
    const a = page.locator('audio').first();
    const media = page.waitForResponse((r) => /\.(mp3|m4a|mp4)$/.test(new URL(r.url()).pathname));
    await play(a);
    expect([200, 206]).toContain((await media).status());
    await expectPlaying(a);
  });
});
