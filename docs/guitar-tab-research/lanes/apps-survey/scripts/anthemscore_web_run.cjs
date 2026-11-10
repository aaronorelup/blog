// One AnthemScore Web transcription without an account (the free plan's 30-second limit), driven the way a
// person uses https://www.lunaverus.com/transcribe/audio-to-guitar-tab : choose the file, Submit, keep the
// default job settings (format "tablature", instrument "guitar", time signature, key and smallest note on
// their defaults) unless overridden below, tick the rights box, press Transcribe, wait for the result page.
// Records the times and saves screenshots, the visible text, and the labels of the Download menu.
// It does not save or decode any score data from the page: downloads are not part of the free plan.
// Usage: node anthemscore_web_run.cjs <audio file> <out dir> [format: tablature|sheetMusic]
// Written for the apps-survey lane, 2026-11-10. Uses the box's Playwright 1.63.0 and its Chromium.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [audio, outDir, format = 'tablature'] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const times = {};
  const mark = (k) => { times[k] = Date.now(); };
  const log = (...a) => { const s = `[${new Date().toISOString()}] ` + a.join(' '); console.log(s); fs.appendFileSync(path.join(outDir, 'run.log'), s + '\n'); };
  const browser = await chromium.launch({ headless: true, proxy: { server: process.env.HTTPS_PROXY } });
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();
  page.on('console', m => fs.appendFileSync(path.join(outDir, 'console.log'), `${m.type()}: ${m.text()}\n`));
  page.on('response', r => { const u = r.url(); if (u.includes('lunaverus')) fs.appendFileSync(path.join(outDir, 'responses.log'), `${new Date().toISOString()} ${r.status()} ${r.request().method()} ${u}\n`); });
  try {
    mark('start');
    await page.goto('https://www.lunaverus.com/transcribe/audio-to-guitar-tab', { waitUntil: 'load', timeout: 60000 });
    await (await page.$('input[type=file]')).setInputFiles(audio);
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Submit"), input[type=submit]').first().click();
    await page.waitForURL(/jobSettings/, { timeout: 180000 });
    mark('settings_page');
    await page.waitForTimeout(2000);
    log('settings page', page.url());
    await page.check(`input[name=format][value=${format}]`);
    await page.check('input[name=transcription_rights]');
    fs.writeFileSync(path.join(outDir, '01_settings.txt'), await page.innerText('body'));
    await page.screenshot({ path: path.join(outDir, '01_settings.png'), fullPage: true });
    const settingsUrl = page.url();
    await page.locator('input[type=submit][value=Transcribe]').click();
    mark('transcribe_clicked');
    log('Transcribe clicked');
    // Wait for the page to leave the settings URL, then for a rendered score (an SVG with many paths) or a
    // Download control, up to 15 minutes.
    await page.waitForURL(u => u.toString() !== settingsUrl, { timeout: 300000 });
    log('navigated to', page.url());
    mark('left_settings');
    let ready = false;
    for (let i = 0; i < 180 && !ready; i++) {
      await page.waitForTimeout(5000);
      const n = await page.evaluate(() => document.querySelectorAll('svg path').length);
      const dl = await page.locator('text=Download').count();
      const txt = (await page.innerText('body')).slice(0, 4000);
      if (i % 6 === 0) log(`poll ${i}: svg paths=${n} download=${dl} url=${page.url()}`);
      if (n > 200 && dl > 0) ready = true;
      if (/error|failed|sign up to/i.test(txt) && i > 6 && n < 50) { log('page text suggests a stop:', txt.slice(0, 300).replace(/\n/g, ' | ')); }
    }
    mark('ready');
    log('ready =', ready, 'url', page.url());
    await page.waitForTimeout(3000);
    fs.writeFileSync(path.join(outDir, '02_result.txt'), await page.innerText('body'));
    await page.screenshot({ path: path.join(outDir, '02_result_view.png') });
    await page.screenshot({ path: path.join(outDir, '02_result_full.png'), fullPage: true });
    // Open the Download menu only to read its labels (locked items carry a padlock and lead to pricing).
    const dlb = page.locator('button:has-text("Download")').first();
    if (await dlb.count()) {
      await dlb.click();
      await page.waitForTimeout(1000);
      const items = await page.$$eval('#downloadMenu .menu-item', els => els.map(e => `${e.className} :: ${e.innerText.trim()}`));
      fs.writeFileSync(path.join(outDir, '03_download_menu.txt'), items.join('\n') + '\n');
      await page.screenshot({ path: path.join(outDir, '03_download_menu.png') });
    }
  } catch (e) {
    log('ERROR', e.message.split('\n')[0]);
    try { await page.screenshot({ path: path.join(outDir, 'error.png'), fullPage: true }); fs.writeFileSync(path.join(outDir, 'error.txt'), await page.innerText('body')); } catch (_) {}
  }
  const s = (a, b) => (times[a] && times[b]) ? ((times[b] - times[a]) / 1000).toFixed(1) : null;
  const summary = { audio, format, result_url: page.url(), upload_to_settings_s: s('start', 'settings_page'),
    transcribe_click_to_ready_s: s('transcribe_clicked', 'ready'), total_s: s('start', 'ready') };
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  log(JSON.stringify(summary));
  await browser.close();
})();
