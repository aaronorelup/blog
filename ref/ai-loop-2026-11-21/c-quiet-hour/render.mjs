import puppeteer from 'puppeteer-core'; import fs from 'fs';
const dir=new URL('.',import.meta.url).pathname, FPS=+process.env.FPS||24, LIMIT=+process.env.LIMIT||1e9, ONLY=process.env.ONLY;
const files={'/index.html':['index.html','text/html'],'/three.module.js':['../node_modules/three/build/three.module.js','application/javascript'],'/symphony_log.json':['symphony_log.json','application/json']};
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage(); await p.setViewport({width:960,height:540});
await p.setRequestInterception(true);
p.on('request',r=>{const u=new URL(r.url()); const f=files[u.pathname]; if(u.host==='local'&&f) r.respond({status:200,contentType:f[1],body:fs.readFileSync(dir+f[0])}); else r.abort();});
p.on('console',m=>console.log('[page]',m.text())); p.on('pageerror',e=>console.log('[pageerror]',e.message));
await p.goto('http://local/index.html'); await p.waitForFunction('window.READY',{timeout:60000});
const {DUR,BREAK}=await p.evaluate(()=>window.FILM); console.log('film',DUR,'s; breaks at',BREAK.toFixed(1),'s');
fs.mkdirSync(dir+'frames',{recursive:true}); const t0=Date.now();
const times = ONLY ? ONLY.split(',').map(Number) : [...Array(Math.min(LIMIT,Math.floor(DUR*FPS))).keys()].map(i=>i/FPS);
for(const [i,t] of times.entries()){
  const url=await p.evaluate(t=>window.renderFrame(t),t);
  fs.writeFileSync(dir+(ONLY?`stills/t${t.toFixed(0).padStart(3,'0')}.jpg`:`frames/f${String(i).padStart(5,'0')}.jpg`),Buffer.from(url.split(',')[1],'base64'));
  if(i%240===0) console.log('frame',i,'of',times.length,((Date.now()-t0)/1000).toFixed(1)+'s');
}
console.log('render seconds',((Date.now()-t0)/1000).toFixed(1),'frames',times.length); await b.close();
