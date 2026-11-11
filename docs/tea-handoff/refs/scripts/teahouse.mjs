import { chromium } from '/workspace/blog/node_modules/playwright/index.mjs';
const out = '/workspace/teahouse_alt/survey/design/teahouse/';
const B = 'https://aaronorelup.com';
const pages = [['home', '/'], ['ledger', '/ledger'], ['post', '/ledger/crimson-coil/'], ['projects', '/projects'], ['now', '/now'],
  ['about', '/about'], ['courses', '/courses'], ['eltv-course', '/courses/i-love-my-evening-television/']];
const runs = [
  ['desktop', 1440, 900, 'night', pages.map(p => p[0])],
  ['desktop', 1440, 900, 'day', pages.map(p => p[0])],
  ['phone', 390, 844, 'night', ['home', 'ledger', 'post']],
  ['phone', 390, 844, 'day', ['home', 'ledger']],
];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
for (const [dev, w, h, mode, which] of runs) {
  const mobile = w < 600;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((m) => { try { if (m === 'day') localStorage.setItem('scene-mode', 'day'); else localStorage.removeItem('scene-mode'); } catch {} }, mode);
  const page = await ctx.newPage();
  for (const [name, path] of pages.filter(p => which.includes(p[0]))) {
    try {
      await page.goto(B + path, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(name === 'home' ? 6000 : 1500);
      const base = `${out}${dev}-${mode}-${name}`;
      await page.screenshot({ path: `${base}.png` });
      if (name === 'home') {
        for (let i = 1; i <= 3; i++) { await page.mouse.wheel(0, h); await page.waitForTimeout(2500); await page.screenshot({ path: `${base}-stop${i}.png` }); }
      } else if (dev === 'desktop' && mode === 'night' || name === 'ledger') {
        await page.evaluate((h) => window.scrollTo(0, h * 1.5), h); await page.waitForTimeout(800);
        await page.screenshot({ path: `${base}-scrolled.png` });
      }
      console.log('ok', dev, mode, name);
    } catch (e) { console.log('fail', dev, mode, name, e.message.slice(0, 100)); }
  }
  await ctx.close();
}
await browser.close();
