// render.js <slug> <url> [extraWaitMs]: open a JS-rendered page in headless Chromium (through the session proxy)
// and save its visible text to /home/user/gtr/lanes/apps-survey/raw/<slug>.r.txt . Run with NODE_PATH=/opt/node-tools/node_modules (the box's global playwright 1.63.0).
// The page is only read as text.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [slug, url, wait] = process.argv.slice(2);
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', proxy: proxy ? { server: proxy } : undefined });
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', locale: 'en-US' });
  let status = 'n/a';
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = resp ? resp.status() : 'n/a';
    try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch (e) {}
    await page.waitForTimeout(parseInt(wait || '3000', 10));
    const txt = await page.evaluate(() => document.body ? document.body.innerText : '');
    fs.writeFileSync(`/home/user/gtr/lanes/apps-survey/raw/${slug}.r.txt`, txt);
    fs.appendFileSync('/home/user/gtr/lanes/apps-survey/raw/_fetchlog.txt', `${new Date().toISOString()} ${status} ${page.url()} (rendered ${url})\n`);
    console.log(`${slug}: ${status} ${page.url()} chars=${txt.length}`);
  } catch (e) { console.log(`${slug}: ERROR ${e.message.split('\n')[0]}`); }
  await browser.close();
})();
