// usage: node shot.mjs url out.png [w h]
import { chromium } from '/workspace/blog/node_modules/playwright/index.mjs';
const [url, out, w = 1600, h = 520, wait = 0] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await p.goto(url); await p.waitForFunction(() => window.DONE, null, { timeout: 180000 });
if (+wait) await p.waitForTimeout(+wait);
await p.screenshot({ path: out }); console.log('shot', out, await p.title()); await b.close();
