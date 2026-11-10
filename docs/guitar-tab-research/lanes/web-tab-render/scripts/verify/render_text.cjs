// verify-docs-web-tab-render: open a page in headless Chromium (Playwright), wait for the network to go idle,
// and write document.body.innerText to a file. Usage: node render_text.cjs <url> <out.txt>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) research-verifier/1.0' });
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(3000);
  const text = await page.evaluate(() => document.body.innerText);
  require('fs').writeFileSync(out, text);
  console.log(resp ? resp.status() : 'no response', text.length);
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
