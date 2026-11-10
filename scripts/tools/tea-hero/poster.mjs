// The hero's posters (node scripts/tools/tea-hero/poster.mjs [--url U]): the opening frame of the 3D scene, rendered
// in headless Chromium (SwiftShader WebGL) from a page that mounts Stage.astro (the lab page by default, served by
// `npx astro dev --port 4392`), with the title box hidden, idle time at 0 and the pointer centred. Writes
// public/tea/hero/poster-{night,day}.webp (16:10) and poster-{night,day}-tall.webp (phones), each under 150 KB.
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg('url', 'http://localhost:4392/tea-lab/?hero=on');
const OUT = new URL('../../../public/tea/hero/', import.meta.url);
const CAP = 150 * 1024;
const SHOTS = [
  { suffix: '', width: 1600, height: 1000, scale: 1 },
  { suffix: '-tall', width: 430, height: 932, scale: 1.5 },
];

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
for (const mode of ['night', 'day']) {
  for (const s of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale });
    await ctx.addInitScript((m) => { try { localStorage.setItem('scene-mode', m); } catch {} }, mode);
    const page = await ctx.newPage();
    await page.goto(URL_, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__teaHero && document.querySelector('[data-tea-stage][data-ready]'),
      null, { timeout: 90000 });
    await page.addStyleTag({ content: '.tea-hero-box,.mode-toggle,.tea-stage-shade{visibility:hidden!important}astro-dev-toolbar{display:none!important}' });
    await page.evaluate(() => {
      scrollTo(0, 0);
      const h = window.__teaHero;
      h.freeze(0); h.pointer([0, 0]); h.setProgress(0);
      h.render();
    });
    await page.waitForTimeout(300);
    const png = await page.locator('[data-tea-stage]').screenshot();
    let q = 84;
    let webp;
    do {
      webp = await sharp(png).resize(Math.round(s.width * Math.min(s.scale, 1.5)))
        .webp({ quality: q, effort: 6 }).toBuffer();
      q -= 6;
    } while (webp.length > CAP && q > 30);
    const name = `poster-${mode}${s.suffix}.webp`;
    writeFileSync(new URL(name, OUT), webp);
    console.log(name, webp.length, 'bytes, quality', q + 6);
    await ctx.close();
  }
}
await browser.close();
