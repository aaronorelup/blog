// Verifier's re-run of the apps-survey lane's AnthemScore Web trial (r0062), with one change: nothing is clicked.
// Same page, same file input, same headless Chromium as scripts/anthemscore_web_explore.cjs, but this copy never
// presses a submit or "Transcribe" control, never ticks the rights box, and stops once the job settings page has
// loaded. It records the page text, the form fields and the network requests (method, status, host and path only;
// query strings are dropped so no signed upload URL is written down).
// Usage: node anthemscore_web_verify_noclick.cjs <audio file> <out dir>
// Written by verify-trials-apps-survey, 2026-11-10. Uses the box's Playwright 1.63.0 and its Chromium.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [audio, outDir] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const t0 = Date.now();
  const log = (...a) => { const s = `[${((Date.now() - t0) / 1000).toFixed(2)} s] ` + a.join(' '); console.log(s); fs.appendFileSync(path.join(outDir, 'verify.log'), s + '\n'); };
  const net = (s) => fs.appendFileSync(path.join(outDir, 'network.log'), s + '\n');
  const browser = await chromium.launch({ headless: true, proxy: { server: process.env.HTTPS_PROXY } });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const strip = (u) => { try { const x = new URL(u); return x.host + x.pathname; } catch (e) { return '?'; } };
  const asset = (u) => { try { return /\.(png|svg|css|js|woff2?|ico|jpg|webp)$/i.test(new URL(u).pathname) || u.startsWith('data:'); } catch (e) { return true; } };
  page.on('request', r => { if (!asset(r.url())) net(`REQ  ${((Date.now() - t0) / 1000).toFixed(2)} ${r.method()} ${strip(r.url())}`); });
  page.on('response', r => { if (!asset(r.url())) net(`RESP ${((Date.now() - t0) / 1000).toFixed(2)} ${r.status()} ${r.request().method()} ${strip(r.url())}`); });
  await page.goto('https://www.lunaverus.com/transcribe/audio-to-guitar-tab', { waitUntil: 'load', timeout: 60000 });
  log('landing loaded', strip(page.url()));
  const input = await page.$('input[type=file]');
  if (!input) { log('no file input found'); await browser.close(); return; }
  await input.setInputFiles(audio);
  log('file set', path.basename(audio));
  try {
    await page.waitForURL(/jobSettings/, { timeout: 120000 });
    log('job settings page reached:', strip(page.url()).replace(/jobSettings\/.*/, 'jobSettings/<job code>'));
  } catch (e) { log('no job settings page within 120 s'); }
  await page.waitForTimeout(4000);
  const text = await page.innerText('body');
  fs.writeFileSync(path.join(outDir, 'settings_page.txt'), text);
  await page.screenshot({ path: path.join(outDir, 'settings_page.png'), fullPage: true });
  const fields = await page.evaluate(() => {
    const out = {};
    for (const el of document.querySelectorAll('form#jobSettingsForm input, form#jobSettingsForm select')) {
      const n = el.name || el.id || '(unnamed)';
      if (n === 'csrfmiddlewaretoken') continue;
      if (!out[n]) out[n] = { tag: el.tagName.toLowerCase(), type: el.type || null, required: !!el.required, values: [] };
      if (el.tagName === 'SELECT') { out[n].values = [...el.options].map(o => o.value + (o.selected ? ' (selected)' : '')); }
      else if (el.type === 'checkbox' || el.type === 'radio') { out[n].values.push((el.value || '') + (el.checked ? ' (checked)' : '')); }
      else { out[n].values.push(el.value); }
    }
    const submit = [...document.querySelectorAll('form#jobSettingsForm [type=submit]')].map(b => b.value || b.innerText);
    return { fields: out, submit };
  });
  fs.writeFileSync(path.join(outDir, 'form_fields.json'), JSON.stringify(fields, null, 1));
  log('form fields:', Object.keys(fields.fields).join(','), '| submit controls:', fields.submit.join(','));
  log('nothing clicked; closing');
  await browser.close();
})();
