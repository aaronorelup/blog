// Behaviour checks for the hero (node scripts/tools/tea-hero/verify.mjs [--url U], `npx astro dev --port 4392` running):
// reduced motion and no WebGL keep the poster with no console errors; the 3D path has no errors and no layout shift,
// follows the mode switch live, stops drawing off screen, and the title box's skip link still moves the reader.
import { chromium } from '@playwright/test';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg('url', 'http://localhost:4392/tea-lab/');
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) failed++; };

async function open(args, ctxOpts, url = URL_ + '?hero=on') {
  const browser = await chromium.launch({ args });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  return { browser, page, errors };
}

const state = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-tea-hero]');
  return { on: s.dataset['3d'] || null, off: s.dataset['3dOff'] || null, canvas: !!s.querySelector('canvas'),
    poster: getComputedStyle(s.querySelector('.tea-stage-poster')).backgroundImage };
});

{ // reduced motion
  const { browser, page, errors } = await open(GL, { reducedMotion: 'reduce' }, URL_);
  await page.waitForTimeout(2500);
  const s = await state(page);
  ok(!s.on && s.off === 'reduced motion' && !s.canvas, 'reduced motion keeps the poster: ' + JSON.stringify(s));
  ok(/poster-night\.webp/.test(s.poster), 'the night poster is the one shown');
  ok(errors.length === 0, 'reduced motion: no console errors ' + errors.join(' | '));
  await browser.close();
}
{ // no WebGL
  const { browser, page, errors } = await open(['--disable-webgl', '--disable-3d-apis'], {}, URL_);
  await page.waitForTimeout(2500);
  const s = await state(page);
  ok(!s.on && s.off === 'no webgl' && !s.canvas, 'no WebGL keeps the poster: ' + JSON.stringify(s));
  ok(errors.length === 0, 'no WebGL: no console errors ' + errors.join(' | '));
  await browser.close();
}
{ // the 3D path
  const { browser, page, errors } = await open(GL, {});
  await page.waitForFunction(() => document.querySelector('[data-tea-stage][data-ready]'), null, { timeout: 90000 });
  await page.waitForTimeout(1000);
  const s = await state(page);
  ok(s.on === 'on' && s.canvas, '3D mounted and pinned');
  ok(errors.length === 0, '3D: no console errors ' + errors.join(' | '));
  ok(await page.evaluate(() => window.__cls) < 0.01, 'no layout shift: CLS ' + await page.evaluate(() => window.__cls));
  await page.click('#mode-toggle');
  await page.waitForTimeout(2500);
  const mix = await page.evaluate(() => window.__teaHero.state.mix);
  ok(mix < 0.05, 'day toggle tweens the scene live: mix ' + mix.toFixed(3));
  await page.click('#mode-toggle');
  await page.evaluate(() => scrollTo(0, document.querySelector('#c3').offsetTop));
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => !window.__teaHero.state.running), 'drawing stops once the hero is off screen');
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => window.__teaHero.state.running), 'drawing resumes back at the top');
  await page.focus('.lab-skip');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  const y = await page.evaluate(() => Math.abs(document.querySelector('#c1').getBoundingClientRect().top));
  ok(y < 4, 'the skip link lands on the first chapter past the pin (top ' + y + ')');
  await browser.close();
}
process.exit(failed ? 1 : 0);
