// Test the for-aaron measuring page in this box's headless Chromium: click both buttons, wait, save the JSON it
// prints. CDN requests are answered from the lane cache (scripts/cache_url.sh) or aborted and listed.
// Usage: node test_foraaron.mjs <out.json> [--metronome] [--model] [--no-cpu]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const out = process.argv[2]; const doMet = process.argv.includes('--metronome'), doModel = process.argv.includes('--model');
const CACHE = '/home/user/gtr/lanes/browser-audio-sync/dl/cache';
const PAGE = '/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/for-aaron/browser-timing-check.html';
const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext()).newPage();
const external = []; const consoleLines = [];
page.on('console', (m) => consoleLines.push(`${m.type()}: ${m.text()}`));
await page.route('**/*', async (route) => {
  const u = route.request().url();
  if (u.startsWith('http://127.0.0.1:18766/')) return route.fulfill({ status: 200, body: fs.readFileSync(PAGE), headers: { 'Content-Type': 'text/html' } });
  const f = path.join(CACHE, crypto.createHash('sha1').update(u).digest('hex'));
  if (fs.existsSync(f)) { external.push({ url: u, cached: true });
    return route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'Content-Type': fs.existsSync(f + '.type') ? fs.readFileSync(f + '.type', 'utf8') : 'application/octet-stream', 'Access-Control-Allow-Origin': '*' } }); }
  external.push({ url: u, cached: false }); return route.abort();
});
await page.goto('http://127.0.0.1:18766/browser-timing-check.html');
const t0 = Date.now();
const waitStatus = async (re, ms) => page.waitForFunction((r) => new RegExp(r).test(document.getElementById('status').textContent), re, { timeout: ms, polling: 1000 });
if (doMet) { await page.selectOption('#dur', '15'); await page.click('#runMet'); await waitStatus('metronome test done|error', 600000); }
if (doModel) { if (process.argv.includes('--no-cpu')) await page.uncheck('#cpuToo'); await page.click('#runBP'); await waitStatus('model test done|error', 900000); }
const status = await page.textContent('#status');
const json = await page.inputValue('#out');
fs.writeFileSync(out, JSON.stringify({ status, wall_s: (Date.now() - t0) / 1000, external, page_output: JSON.parse(json), console: consoleLines.slice(-30) }, null, 1));
console.log(status, ((Date.now() - t0) / 1000).toFixed(1) + 's');
await browser.close();
