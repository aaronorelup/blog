import puppeteer from 'puppeteer-core';
import fs from 'fs';
const dir = new URL('.', import.meta.url).pathname;
const browser = await puppeteer.launch({executablePath:'/usr/bin/google-chrome', headless:true, args:['--no-sandbox','--use-gl=swiftshader']});
const out = {};
for (const mode of ['verlet','euler']){
  const page = await browser.newPage(); await page.setViewport({width:1400,height:820});
  const t=Date.now(); await page.goto('file://'+dir+'index.html'+(mode==='euler'?'?integrator=euler':''));
  await page.waitForFunction('window.__PROOFS__', {timeout:120000});
  const r = await page.evaluate(()=>window.__PROOFS__); r.wallMs = Date.now()-t; out[mode]=r;
  if (mode==='verlet'){ await page.click('#circ'); await new Promise(r=>setTimeout(r,2500)); }
  await page.screenshot({path: dir+`out/${mode}.png`});
  if (mode==='verlet'){ await page.evaluate(()=>{const v=document.getElementById('v'); v.value='1.2'; v.dispatchEvent(new Event('input'));}); await page.click('#throw'); await new Promise(r=>setTimeout(r,2500)); await page.screenshot({path: dir+'out/verlet-too-slow.png'}); }
}
await browser.close();
fs.writeFileSync(dir+'out/proofs.json', JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
