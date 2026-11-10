// Hero lab screenshots (node scripts/tools/tea-hero/shots.mjs, with `npx astro dev --port 4392` running): [--url U] [--out DIR] [--p 0,0.25,...] [--sizes 1440x900,390x844] [--modes night,day] [--t 2.4]
// Scrolls the real page to each progress, freezes idle time and the pointer, saves PNGs <size>-<mode>-p<NN>.png.
import { chromium } from '@playwright/test';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('url', 'http://localhost:4392/tea-lab/?hero=on');
const out = arg('out', 'shots/hero-lab');
const ps = arg('p', '0,0.25,0.5,0.75,1').split(',').map(Number);
const sizes = arg('sizes', '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
const modes = arg('modes', 'night,day').split(',');
const t = Number(arg('t', '2.4'));
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
    await page.waitForFunction(() => window.__teaHero && document.querySelector('[data-tea-stage][data-ready]'), null, { timeout: 60000 });
  } catch { console.log('NOT READY', w, h, mode, await page.evaluate(() => document.querySelector('[data-tea-hero]').dataset['3dOff'])); }
  await page.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
  await page.evaluate((t) => { window.__teaHero && (window.__teaHero.freeze(t), window.__teaHero.pointer([0, 0])); }, t);
  for (const p of ps) {
    await page.evaluate((p) => {
      const s = document.querySelector('[data-tea-hero]');
      const run = s.offsetHeight - innerHeight;
      window.scrollTo({ top: s.offsetTop + run * p, behavior: 'instant' });
    }, p);
    await page.waitForTimeout(150);
    await page.evaluate(() => window.__teaHero && window.__teaHero.render());
    await page.waitForTimeout(950); // let the title box's dock transition finish
    await page.evaluate(() => window.__teaHero && window.__teaHero.render());
    const name = `${out}/${w}x${h}-${mode}-p${String(Math.round(p * 100)).padStart(3, '0')}.png`;
    await page.screenshot({ path: name });
  }
  if (logs.length) console.log(w, h, mode, logs.slice(0, 8).join('\n'));
  await ctx.close();
}
await browser.close();
