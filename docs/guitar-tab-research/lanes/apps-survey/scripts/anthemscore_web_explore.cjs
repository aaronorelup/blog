// Explore AnthemScore Web's public upload flow (https://www.lunaverus.com/transcribe/audio-to-guitar-tab)
// in headless Chromium, the way a person would use it without an account: open the page, choose a file,
// press Submit, and record the page that follows (the job settings page). Nothing is clicked after that.
// Usage: node anthemscore_web_explore.js <audio file> <out dir>
// Written for the apps-survey lane, 2026-11-10. Uses the box's Playwright 1.63.0 and its Chromium.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [audio, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const log = (...a) => { const s = `[${new Date().toISOString()}] ` + a.join(' '); console.log(s); fs.appendFileSync(path.join(outDir, 'explore.log'), s + '\n'); };
  const browser = await chromium.launch({ headless: true, proxy: { server: process.env.HTTPS_PROXY } });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('console', m => fs.appendFileSync(path.join(outDir, 'console.log'), `${m.type()}: ${m.text()}\n`));
  page.on('response', r => { const u = r.url(); if (u.includes('lunaverus.com/transcribe')) fs.appendFileSync(path.join(outDir, 'responses.log'), `${r.status()} ${r.request().method()} ${u}\n`); });
  const t0 = Date.now();
  await page.goto('https://www.lunaverus.com/transcribe/audio-to-guitar-tab', { waitUntil: 'load', timeout: 60000 });
  log('landing loaded', page.url());
  await page.screenshot({ path: path.join(outDir, '01_landing.png'), fullPage: false });
  fs.writeFileSync(path.join(outDir, '01_landing.txt'), await page.innerText('body'));
  const input = await page.$('input[type=file]');
  if (!input) { log('no file input found'); await browser.close(); return; }
  await input.setInputFiles(audio);
  log('file set', audio);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, '02_after_file.png') });
  fs.writeFileSync(path.join(outDir, '02_after_file.txt'), await page.innerText('body'));
  // Press the visible Submit button if there is one.
  const submit = page.locator('button:has-text("Submit"), input[type=submit]').first();
  if (await submit.count() && await submit.isVisible()) { await submit.click(); log('submit clicked'); }
  try {
    await page.waitForURL(/jobSettings|job|results|signin|signup/, { timeout: 180000 });
  } catch (e) { log('no navigation within 180 s:', e.message.split('\n')[0]); }
  await page.waitForTimeout(4000);
  log('now at', page.url(), 'after', ((Date.now() - t0) / 1000).toFixed(1), 's');
  await page.screenshot({ path: path.join(outDir, '03_next_page.png'), fullPage: true });
  fs.writeFileSync(path.join(outDir, '03_next_page.txt'), await page.innerText('body'));
  fs.writeFileSync(path.join(outDir, '03_next_page.html'), await page.content());
  await browser.close();
})();
