// Playwright driver: open one trial page in the pre-installed headless Chromium, wait for it to finish,
// save what it returns.
// Usage: node drive.mjs <page path and query, e.g. /pages/probe.html?x=1> <result.json> [--timeout 600]
//        [--channel chromium] [--arg <chromium flag>]... [--port 8765]
// - The page sets window.__done = true and window.__result = {...} when it is finished.
// - Requests to hosts other than 127.0.0.1 are answered from the lane's download cache
//   (/home/user/gtr/lanes/browser-audio-sync/dl/cache/<sha1 of url>) when a file is there, and aborted otherwise,
//   so the browser itself never goes to the network; every such request is listed in the result.
// - Console output of the page goes to <result.json>.console.txt
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const args = process.argv.slice(2);
const pagePath = args[0], outFile = args[1];
let timeout = 600, channel = null, port = 8765; const extra = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--timeout') timeout = Number(args[++i]);
  else if (args[i] === '--channel') channel = args[++i];
  else if (args[i] === '--arg') extra.push(args[++i]);
  else if (args[i] === '--port') port = Number(args[++i]);
}
const CACHE = '/home/user/gtr/lanes/browser-audio-sync/dl/cache';
const consoleLines = [];
const external = [];
const t0 = Date.now();
const launchArgs = ['--autoplay-policy=no-user-gesture-required', ...extra];
const browser = await chromium.launch({ headless: true, channel: channel || undefined, args: launchArgs });
const version = browser.version();
const context = await browser.newContext();
const page = await context.newPage();
page.on('console', (m) => consoleLines.push(`[${((Date.now() - t0) / 1000).toFixed(3)}] ${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => consoleLines.push(`[${((Date.now() - t0) / 1000).toFixed(3)}] pageerror: ${e.message}`));
await context.route('**/*', async (route) => {
  const u = route.request().url();
  if (u.startsWith(`http://127.0.0.1:${port}/`) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
  const key = crypto.createHash('sha1').update(u).digest('hex');
  const f = path.join(CACHE, key);
  if (fs.existsSync(f)) {
    const meta = fs.existsSync(f + '.type') ? fs.readFileSync(f + '.type', 'utf8').trim() : 'application/octet-stream';
    external.push({ url: u, served_from_cache: true, bytes: fs.statSync(f).size });
    return route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'Content-Type': meta,
      'Access-Control-Allow-Origin': '*', 'Cross-Origin-Resource-Policy': 'cross-origin' } });
  }
  external.push({ url: u, served_from_cache: false, aborted: true });
  return route.abort();
});
let result = null, status = 'ok';
try {
  await page.goto(`http://127.0.0.1:${port}${pagePath}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__done === true, null, { timeout: timeout * 1000, polling: 500 });
  result = await page.evaluate(() => window.__result);
} catch (e) {
  status = 'driver error: ' + String(e.message || e).split('\n')[0];
  try { result = await page.evaluate(() => window.__result || window.__partial || null); } catch (e2) { /* page gone */ }
}
const wall = (Date.now() - t0) / 1000;
await browser.close();
const out = { page: pagePath, status, browser_version: version, channel: channel || 'default (chromium headless shell)',
  launch_args: launchArgs, driver_wall_s: wall, external_requests: external, result };
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
fs.writeFileSync(outFile + '.console.txt', consoleLines.join('\n') + '\n');
console.log(`${status} wall=${wall.toFixed(1)}s -> ${outFile}`);
process.exit(status === 'ok' ? 0 : 1);
