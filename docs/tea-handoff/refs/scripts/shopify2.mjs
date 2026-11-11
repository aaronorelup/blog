import { chromium } from '/workspace/blog/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/workspace/teahouse_alt/survey/design/shopify/';
const [name, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const mobile = w < 600;
const browser = await chromium.launch({ args: ['--disable-gpu', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile,
  userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
const page = await ctx.newPage();
page.on('crash', () => console.log('PAGE CRASH'));
await page.goto('https://www.shopify.com/editions/winter2026', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
const info = await page.evaluate(() => {
  const pick = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { tag: el.tagName, id: el.id, cls: String(el.className?.baseVal ?? el.className).slice(0, 60), y: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.left), pos: cs.position, font: cs.fontFamily.slice(0, 30), fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, color: cs.color, txt: (el.innerText || '').trim().slice(0, 50).replace(/\n/g, ' | ') }; };
  return {
    H: document.documentElement.scrollHeight,
    heads: [...document.querySelectorAll('h1,h2,h3,h4')].map(pick),
    sticky: [...document.querySelectorAll('body *')].filter(e => ['sticky', 'fixed'].includes(getComputedStyle(e).position)).slice(0, 40).map(pick),
    navs: [...document.querySelectorAll('nav')].map(pick),
    sections: [...document.querySelectorAll('section')].slice(0, 120).map(pick),
    ps: [...document.querySelectorAll('p')].slice(0, 40).map(pick),
    links: [...document.querySelectorAll('a')].filter(a => /help doc|Learn|Read/i.test(a.innerText)).slice(0, 5).map(pick),
  };
});
fs.writeFileSync(`${out}${name}-structure.json`, JSON.stringify(info, null, 1));
console.log('H', info.H, 'heads', info.heads.length);
const h2s = info.heads.filter(x => x.tag === 'H2');
let n = 0;
const shoot = async (y, label) => { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(1200); await page.screenshot({ path: `${out}${name}-${String(++n).padStart(2, '0')}-${label}.png` }); };
await shoot(0, 'hero');
await shoot(h, 'hero-scroll1');
for (const c of h2s) {
  const lab = c.txt.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 20) || 'x';
  try { await shoot(Math.max(0, c.y - h * 0.3), lab + '-a'); await shoot(c.y + h * 1.2, lab + '-b'); await shoot(c.y + h * 2.8, lab + '-c'); }
  catch (e) { console.log('fail', lab, e.message.slice(0, 80)); break; }
}
try { await shoot(info.H - h, 'footer'); } catch (e) { console.log('footer fail'); }
await browser.close();
