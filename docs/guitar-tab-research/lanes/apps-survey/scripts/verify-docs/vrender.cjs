// vrender.cjs <url-list-file> : verify-docs-apps-survey. Opens each URL in headless Chromium (through the session
// proxy), scrolls to the end, and saves the page's visible text (document.body.innerText) and the rendered HTML to
// /home/user/gtr/lanes/apps-survey/verify-docs/rendered/<slug>.txt / .html . Pages are only read as text.
// Run with NODE_PATH=/opt/node-tools/node_modules (the box's playwright 1.63.0).
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '/home/user/gtr/lanes/apps-survey/verify-docs/rendered';
const slugOf = (u) => u.replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+$/, '').slice(0, 120);
(async () => {
  const urls = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({ headless: true,
    executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
    proxy: proxy ? { server: proxy } : undefined });
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale: 'en-US' });
  for (const url of urls) {
    const slug = slugOf(url);
    const page = await ctx.newPage();
    let status = 'n/a';
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = resp ? resp.status() : 'n/a';
      try { await page.waitForLoadState('networkidle', { timeout: 12000 }); } catch (e) {}
      for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 2500); await page.waitForTimeout(250); }
      await page.waitForTimeout(2500);
      const txt = await page.evaluate(() => document.body ? document.body.innerText : '');
      fs.writeFileSync(`${OUT}/${slug}.txt`, txt);
      fs.writeFileSync(`${OUT}/${slug}.html`, await page.content());
      const line = `${new Date().toISOString()} ${status} ${page.url()} (rendered ${url}) chars=${txt.length}`;
      fs.appendFileSync(`${OUT}/_vrenderlog.txt`, line + '\n');
      console.log(line);
    } catch (e) {
      const line = `${new Date().toISOString()} ERROR ${url} ${e.message.split('\n')[0]}`;
      fs.appendFileSync(`${OUT}/_vrenderlog.txt`, line + '\n');
      console.log(line);
    }
    await page.close();
  }
  await browser.close();
})();
