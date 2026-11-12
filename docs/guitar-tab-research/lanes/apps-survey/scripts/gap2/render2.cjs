// render2.cjs <url> [waitMs] : gap round 2 (gapfill-apps-survey, 2026-11-11). Opens one page in headless Chromium
// (through the session proxy), waits, and saves its visible text and rendered HTML to
// /home/user/gtr/lanes/apps-survey/gap2/rendered/<slug>.txt / .html, with the main document's HTTP status in
// _renderlog.txt. Clicks nothing, fills nothing. Run with NODE_PATH=/opt/node-tools/node_modules (playwright 1.63.0).
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '/home/user/gtr/lanes/apps-survey/gap2/rendered';
const slugOf = (u) => u.replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+$/, '').slice(0, 120);
(async () => {
  const [url, wait] = process.argv.slice(2);
  const slug = slugOf(url);
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({ headless: true,
    executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
    proxy: proxy ? { server: proxy } : undefined });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale: 'en-US' });
  const page = await ctx.newPage();
  let status = 'n/a';
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = resp ? resp.status() : 'n/a';
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
    await page.waitForTimeout(parseInt(wait || '8000', 10));
    const txt = await page.evaluate(() => document.body ? document.body.innerText : '');
    fs.writeFileSync(`${OUT}/${slug}.txt`, txt);
    fs.writeFileSync(`${OUT}/${slug}.html`, await page.content());
    const line = `${new Date().toISOString()} ${status} ${page.url()} (rendered ${url}) title=${JSON.stringify(await page.title())} chars=${txt.length}`;
    fs.appendFileSync(`${OUT}/_renderlog.txt`, line + '\n');
    console.log(line);
  } catch (e) {
    const line = `${new Date().toISOString()} ERROR ${url} ${e.message.split('\n')[0]}`;
    fs.appendFileSync(`${OUT}/_renderlog.txt`, line + '\n');
    console.log(line);
  }
  await browser.close();
})();
