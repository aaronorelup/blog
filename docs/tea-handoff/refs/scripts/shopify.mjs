import { chromium } from '/workspace/blog/node_modules/playwright/index.mjs';
const out = '/workspace/teahouse_alt/survey/design/shopify/';
const browser = await chromium.launch();
for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1,
    userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  const r = await page.goto('https://www.shopify.com/editions/winter2026', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log(name, 'status', r.status(), await page.title());
  await page.waitForTimeout(4000);
  // dismiss cookie banners
  for (const t of ['Accept', 'Accept all', 'Got it', 'OK']) { const b = page.getByRole('button', { name: t, exact: true }); if (await b.count()) { await b.first().click().catch(()=>{}); } }
  await page.screenshot({ path: `${out}${name}-00-firstview.png` });
  // scroll gradually to trigger reveals, take viewport shots
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(name, 'height', H);
  let i = 1;
  for (let y = 0; y < H; y += vp.height * 0.9) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(700);
    if (i % (name === 'desktop' ? 2 : 3) === 1 || true) await page.screenshot({ path: `${out}${name}-scroll-${String(i).padStart(3, '0')}.png` });
    i++;
    if (i > 160) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1000);
  await page.screenshot({ path: `${out}${name}-full.png`, fullPage: true }).catch(e => console.log('full fail', e.message));
  // structure dump
  const info = await page.evaluate(() => {
    const pick = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName, id: el.id, cls: (el.className?.baseVal ?? el.className).toString().slice(0, 80), y: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.left), pos: cs.position, font: cs.fontFamily.slice(0, 40), fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, txt: (el.innerText || '').trim().slice(0, 60).replace(/\n/g, ' | ') }; };
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].slice(0, 400).map(pick);
    const sticky = [...document.querySelectorAll('*')].filter(e => ['sticky', 'fixed'].includes(getComputedStyle(e).position)).map(pick);
    const navs = [...document.querySelectorAll('nav')].map(pick);
    const sections = [...document.querySelectorAll('section')].map(pick);
    const ps = [...document.querySelectorAll('p')].slice(0, 30).map(pick);
    return { heads, sticky, navs, sections, ps, bg: getComputedStyle(document.body).backgroundColor };
  });
  const fs = await import('fs');
  fs.writeFileSync(`${out}${name}-structure.json`, JSON.stringify(info, null, 1));
  await ctx.close();
}
await browser.close();
