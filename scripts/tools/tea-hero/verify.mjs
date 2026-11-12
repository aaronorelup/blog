// Behaviour checks for the hero (node scripts/tools/tea-hero/verify.mjs [--url U], a preview or dev server running;
// U is /tea/, ?hero=on is added): reduced motion and no WebGL keep the poster, load none of the 3D and log
// no error; the 3D path logs no error, shifts no layout as the canvas comes in (both layouts), follows the switch with
// a tween, stops drawing off screen, and the title box's skip link still reaches the first chapter through the pin.
import { chromium } from '@playwright/test';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = new URL(arg('url', 'http://localhost:4392/tea/'));
PAGE.searchParams.delete('hero');
const ON = new URL(PAGE); ON.searchParams.set('hero', 'on');
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const THREE_D = /\/_astro\/(stage|three\.module|GLTFLoader)\.|\.glb$|\/tea\/hero\/.*\.json$|\/tea\/hero\/bg-/;
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? 'ok   ' : 'FAIL ') + msg); if (!cond) failed++; };

async function open(args, ctxOpts, url) {
  const browser = await chromium.launch({ args });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOpts });
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => requests.push(new URL(r.url()).pathname));
  await page.addInitScript(() => {
    // every layout shift, and when the scene began to mount (data-3d set), so the shifts it caused can be told apart
    // from the page's own (a web font swapping in moves the title a few px at load, scene or not)
    window.__shifts = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shifts.push([e.startTime, e.value]);
    }).observe({ type: 'layout-shift', buffered: true });
    new MutationObserver(() => {
      if (window.__pinAt == null && document.querySelector('[data-tea-hero][data-3d]')) window.__pinAt = performance.now();
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-3d'] });
  });
  await page.goto(String(url), { waitUntil: 'networkidle' });
  return { browser, page, errors, requests };
}

const state = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-tea-hero]');
  const poster = s.querySelector('.tea-stage-poster');
  return { on: s.dataset['3d'] || null, off: s.dataset['3dOff'] || null, layout: s.dataset.heroLayout || null,
    canvas: !!s.querySelector('canvas'), poster: getComputedStyle(poster).backgroundImage,
    shown: poster.getBoundingClientRect().height > 0 && getComputedStyle(poster).visibility === 'visible' };
});
const clsSince = () => {
  const at = window.__pinAt ?? Infinity;
  const sum = (f) => window.__shifts.filter(f).reduce((n, [, v]) => n + v, 0);
  return { scene: sum(([t]) => t >= at - 50), before: sum(([t]) => t < at - 50) };
};
const ready = (page) => page.waitForFunction(() => document.querySelector('[data-tea-stage][data-ready]'), null,
  { timeout: 120000 });
for (const [name, args, opts, want] of [
  ['reduced motion', GL, { reducedMotion: 'reduce' }, 'reduced motion'],
  ['no WebGL', ['--disable-webgl', '--disable-3d-apis'], {}, 'no webgl'],
]) {
  const { browser, page, errors, requests } = await open(args, opts, PAGE);
  await page.waitForTimeout(2500);
  const s = await state(page);
  ok(!s.on && s.off === want && !s.canvas, `${name} keeps the poster: ${JSON.stringify({ ...s, poster: undefined })}`);
  ok(/poster-night\.webp/.test(s.poster) && s.shown, `${name}: the night poster is the picture shown`);
  const three = requests.filter((p) => THREE_D.test(p));
  ok(three.length === 0, `${name}: none of the 3D loaded ${three.join(' ')}`);
  ok(errors.length === 0, `${name}: no console errors ${errors.join(' | ')}`);
  await browser.close();
}

{ // the 3D path, wide screen: the dock layout
  const { browser, page, errors } = await open(GL, {}, ON);
  await ready(page);
  await page.waitForTimeout(1000);
  const s = await state(page);
  ok(s.on === 'on' && s.canvas && s.layout === 'dock', '3D mounted and pinned, dock layout: ' + s.layout);
  ok(errors.length === 0, '3D: no console errors ' + errors.join(' | '));
  const cls = await page.evaluate(clsSince);
  ok(cls.scene < 0.001, `no layout shift as the scene comes in: CLS ${cls.scene} (the page's own, before: ${cls.before})`);
  await page.click('#mode-toggle');
  const seen = [];
  for (let i = 0; i < 40; i++) {
    seen.push(await page.evaluate(() => window.__teaHero.state.mix));
    if (seen.at(-1) < 0.05) break;
    await page.waitForTimeout(250);
  }
  ok(seen.at(-1) < 0.05 && seen.some((m) => m > 0.05 && m < 0.95),
    'day toggle tweens the scene live: mix ' + seen.map((m) => m.toFixed(2)).join(' '));
  await page.click('#mode-toggle');
  // an IntersectionObserver turns the loop off and on: give a busy page up to 10 s to hear about it
  const drawing = async (want) => {
    for (let i = 0; i < 40; i++) {
      if (await page.evaluate(() => window.__teaHero.state.running) === want) return true;
      await page.waitForTimeout(250);
    }
    return false;
  };
  await page.evaluate(() => scrollTo({ top: document.querySelector('#projects').offsetTop, behavior: 'instant' }));
  ok(await drawing(false), 'drawing stops once the hero is off screen');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  ok(await drawing(true), 'drawing resumes back at the top');
  await page.focus('.tea-skip');
  await page.keyboard.press('Enter');
  // the tea room scrolls smoothly, and a software GPU keeps the page busy: wait for the landing, up to 20 s
  const tops = () => page.evaluate(() => {
    const to = document.querySelector(document.querySelector('.tea-skip').getAttribute('href'));
    const first = document.querySelector('[data-tea-chapter]');
    return [to, first].map((el) => Math.round(Math.abs(el.getBoundingClientRect().top)));
  });
  let y = await tops();
  for (let i = 0; i < 80 && !(y[0] < 4 && y[1] < 4); i++) { await page.waitForTimeout(250); y = await tops(); }
  ok(y[0] < 4 && y[1] < 4, 'the skip link lands on the chapters past the pin (tops ' + y.join(', ') + ')');
  await browser.close();
}

{ // the 3D path, a phone: the flow layout, the switch on screen through the hero
  const { browser, page, errors } = await open(GL, { viewport: { width: 390, height: 844 }, isMobile: true,
    hasTouch: true }, ON);
  await ready(page);
  await page.waitForTimeout(1000);
  const s = await state(page);
  ok(s.on === 'on' && s.canvas && s.layout === 'flow', 'phone: 3D mounted, flow layout: ' + s.layout);
  const cls = await page.evaluate(clsSince);
  ok(cls.scene < 0.001, `phone: no layout shift as the scene comes in: CLS ${cls.scene} (before: ${cls.before})`);
  for (const p of [0, 0.5]) {
    await page.evaluate((p) => {
      const h = document.querySelector('[data-tea-hero]');
      scrollTo({ top: (h.offsetHeight - innerHeight) * p, behavior: 'instant' });
    }, p);
    await page.waitForTimeout(300);
    const inView = await page.evaluate(() => {
      const r = document.querySelector('#mode-toggle').getBoundingClientRect();
      const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return r.top >= 0 && r.bottom <= innerHeight && !!at && !!at.closest('#mode-toggle');
    });
    ok(inView, `phone: the day/night switch is on screen and on top at hero progress ${p}`);
  }
  ok(errors.length === 0, 'phone: no console errors ' + errors.join(' | '));
  await browser.close();
}
process.exit(failed ? 1 : 0);
