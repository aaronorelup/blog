// Hero screenshots (node scripts/tools/tea-hero/shots.mjs [--url U] [--out DIR] [--p 0,0.25,...] [--sizes 1440x900,390x844]
// [--modes night,day] [--t 2.4] [--sheet]), against a running preview or dev server of /tea/ (default):
// scrolls the real page to each progress, freezes idle time and the pointer, saves <size>-<mode>-p<NNN>.png, and with
// --sheet one contact sheet a size and mode (sheet-<size>-<mode>.jpg). The title box stays in: it is the composition.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('url', 'http://localhost:4392/tea/?hero=on');
const out = arg('out', 'shots/hero');
const ps = arg('p', '0,0.1,0.2,0.25,0.3,0.45,0.6,0.8,1').split(',').map(Number);
const sizes = arg('sizes', '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
const modes = arg('modes', 'night,day').split(',');
const t = Number(arg('t', '2.4'));
const sheet = process.argv.includes('--sheet');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [w, h] of sizes) for (const mode of modes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 700, isMobile: w < 700 });
  await ctx.addInitScript((m) => { try { localStorage.setItem('scene-mode', m); } catch {} }, mode);
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  try {
    await page.waitForFunction(() => window.__teaHero && document.querySelector('[data-tea-stage][data-ready]'), null, { timeout: 90000 });
  } catch { console.log('NOT READY', w, h, mode, await page.evaluate(() => document.querySelector('[data-tea-hero]').dataset['3dOff'])); }
  // the dev toolbar out of the frame, and the box's dock without its tween, so each frame shows where it settles
  await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}.tea-hero-box,.tea-hero-box *{transition:none!important}' });
  await page.evaluate((t) => { const h = window.__teaHero; if (h) { h.freeze(t); h.pointer([0, 0]); h.hold(true); } }, t);
  const names = [];
  for (const p of ps) {
    await page.evaluate((p) => {
      const s = document.querySelector('[data-tea-hero]');
      const run = s.offsetHeight - innerHeight;
      window.scrollTo({ top: s.offsetTop + run * p, behavior: 'instant' });
    }, p);
    await page.waitForTimeout(150);
    await page.evaluate(() => window.__teaHero && window.__teaHero.render());
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__teaHero && window.__teaHero.render());
    const name = `${out}/${w}x${h}-${mode}-p${String(Math.round(p * 100)).padStart(3, '0')}.png`;
    await page.screenshot({ path: name, timeout: 120000 });
    names.push(name);
  }
  if (logs.length) console.log(w, h, mode, logs.slice(0, 8).join('\n'));
  await ctx.close();
  if (sheet) await contact(names, w, h, `${out}/sheet-${w}x${h}-${mode}.jpg`, ps);
}
await browser.close();

// One row of frames (portrait) or rows of three (landscape), each labelled with its progress in the file name order.
async function contact(files, w, h, file, ps) {
  const cols = w > h ? 3 : Math.min(files.length, 9);
  const tw = w > h ? 480 : 216;
  const th = Math.round(tw * h / w);
  const rows = Math.ceil(files.length / cols);
  const tiles = await Promise.all(files.map(async (f, i) => ({
    input: await sharp(f).resize(tw, th).toBuffer(), left: (i % cols) * (tw + 8), top: Math.floor(i / cols) * (th + 8),
  })));
  await sharp({ create: { width: cols * (tw + 8) - 8, height: rows * (th + 8) - 8, channels: 3, background: '#000' } })
    .composite(tiles).jpeg({ quality: 82 }).toFile(file);
  console.log(file, 'p =', ps.join(' '));
}
