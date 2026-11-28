// Open a test page in headless Chromium (Playwright, pre-installed on the box), wait for a ready flag,
// save a full-page PNG screenshot, the page's window.__log and the console messages.
// Usage: node shot.cjs <url> <out-prefix> [readyExpr] [timeoutMs] [width]
//   readyExpr: a JS expression evaluated in the page, default "window.__rendered === true"
// The box's pre-installed Playwright 1.63.0 and its Chromium; the blog repo's own copy (1.64.1) expects a browser build that is not installed.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [, , url, outPrefix, readyExpr = 'window.__rendered === true', timeoutMs = '60000', width = '1240'] = process.argv;
  const t0 = Date.now();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: parseInt(width, 10), height: 900 } });
  const consoleMsgs = [];
  page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 500) }));
  page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e).slice(0, 500) }));
  await page.goto(url, { waitUntil: 'load' });
  let ready = true;
  try {
    await page.waitForFunction(readyExpr, null, { timeout: parseInt(timeoutMs, 10) });
  } catch (e) {
    ready = false;
  }
  const tReady = Date.now() - t0;
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPrefix + '.png', fullPage: true });
  const log = await page.evaluate(() => window.__log || null);
  const info = await page.evaluate(() => window.__info || null);
  fs.writeFileSync(outPrefix + '.log.json', JSON.stringify({ url, ready, readyExpr, ms_to_ready: tReady, info, log, console: consoleMsgs }, null, 1));
  console.log(JSON.stringify({ url, ready, ms_to_ready: tReady, info, console: consoleMsgs.slice(0, 8), n_log: log ? log.length : null }));
  await browser.close();
})();
