// Where the hero's actors stand on screen (node scripts/tools/tea-hero/silhouettes.mjs [--url U] [--sizes 390x844,...]
// [--p 0,0.05,...] [--out DIR]), against a running preview or dev server of /tea/: the real page scrolled to each
// progress, the scene's loop held, idle time and pointer frozen. Each actor is drawn alone as a flat white silhouette
// on black (no picture, glows, motes or fog), and the tool reports, per size and progress, the pixels where two actors'
// silhouettes overlap (as a share of the smaller) and each actor's share behind the title box. A tuned scene has no
// overlap and next to nothing behind the box once it has docked or scrolled away (docs/TEA_HERO.md, "Composition").
// --out also writes a mask per overlapping frame (red the first actor, green the second, white both).
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('url', 'http://localhost:4392/tea/?hero=on');
const sizes = arg('sizes', '390x844,360x740,768x1024,1366x768,1440x900').split(',').map((s) => s.split('x').map(Number));
const ps = arg('p', '0,0.1,0.2,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.8,0.9,1').split(',').map(Number);
const out = arg('out', null);
if (out) mkdirSync(out, { recursive: true });

// one actor alone, every material of it emissive white; null puts the scene back as it was
const draw = (page, which) => page.evaluate((which) => {
  const st = window.__teaHero.state;
  const M = window.__sil || (window.__sil = { fog: [st.scene.fog.near, st.scene.fog.far], n: st.clearN.clone(),
    d: st.clearD.clone(), saved: new Map() });
  const sil = which !== null;
  for (const l of st.backdrop.layers) l.mesh.visible = !sil;
  st.motes.visible = !sil;
  [st.scene.fog.near, st.scene.fog.far] = sil ? [1e5, 1e6] : M.fog;
  if (sil) { st.clearN.setRGB(0, 0, 0); st.clearD.setRGB(0, 0, 0); } else { st.clearN.copy(M.n); st.clearD.copy(M.d); }
  st.scene.traverse((o) => { if (o.isSprite) o.visible = !sil; });
  for (const a of st.actors) {
    const mine = a.spec.id === which;
    a.root.visible = !sil || mine;
    a.root.traverse((o) => {
      if (!o.isMesh) return;
      for (const m of [].concat(o.material)) {
        if (!m || !m.emissive) continue;
        if (!M.saved.has(m)) M.saved.set(m, [m.emissive.clone(), m.emissiveIntensity, m.emissiveMap || null]);
        const [e, i, map] = M.saved.get(m);
        if (sil && mine) { m.emissive.setRGB(1, 1, 1); m.emissiveIntensity = 1; } else { m.emissive.copy(e); m.emissiveIntensity = i; }
        const want = sil && mine ? null : map;
        if ((m.emissiveMap || null) !== want) { m.emissiveMap = want; m.needsUpdate = true; }
      }
    });
  }
  window.__teaHero.render();
}, which);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const report = [];
for (const [w, h] of sizes) {
  const mobile = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__teaHero && document.querySelector('[data-tea-hero][data-hero-settled]'), null,
    { timeout: 180000 });
  await page.addStyleTag({ content: '.tea-hero-box,.tea-hero-box *{transition:none!important}.tea-hero-box,.mode-toggle,'
    + '.tea-stage-shade,.tea-rail,.tea-hero-stage::after{visibility:hidden!important}' });
  const ids = await page.evaluate(() => { const hh = window.__teaHero; hh.hold(true); hh.freeze(0); hh.pointer([0, 0]);
    return hh.state.actors.map((a) => a.spec.id); });
  const shot = async () => sharp(await page.screenshot({ timeout: 120000 })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  await draw(page, ids[0]); await shot();   // the first silhouette frame of a page still shows the picture: thrown away
  for (const p of ps) {
    const at = await page.evaluate((p) => {
      const s = document.querySelector('[data-tea-hero]');
      scrollTo({ top: (s.offsetHeight - innerHeight) * p, behavior: 'instant' });
      window.__teaHero.render();
      const st = window.__teaHero.state;
      const r = s.querySelector('.tea-hero-box').getBoundingClientRect();
      return { scene: +Math.max(0, Math.min(1, (st.input.st.raw - st.lead) / (1 - st.lead))).toFixed(3),
        box: [r.left, r.top, r.right, r.bottom].map(Math.round), layout: s.dataset.heroLayout };
    }, p);
    const masks = {};
    for (const id of ids) {
      await draw(page, id);
      const { data, info } = await shot();
      const m = new Uint8Array(info.width * info.height);
      for (let k = 0, px = 0; k < data.length; k += info.channels, px++) m[px] = data[k] + data[k + 1] + data[k + 2] > 90 ? 1 : 0;
      masks[id] = { m, w: info.width };
    }
    const row = { size: `${w}x${h}`, layout: at.layout, raw: p, scene: at.scene, behind: {}, overlap: {} };
    const [x0, y0, x1, y1] = at.box;
    for (const id of ids) {
      const { m, w: mw } = masks[id];
      let n = 0, inBox = 0;
      for (let i = 0; i < m.length; i++) {
        if (!m[i]) continue;
        n++;
        const x = i % mw, y = Math.floor(i / mw);
        if (x >= x0 && x < x1 && y >= y0 && y < y1) inBox++;
      }
      row.behind[id] = +(inBox / Math.max(1, n)).toFixed(3);
      masks[id].n = n;
    }
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const A = masks[ids[a]], B = masks[ids[b]];
      let both = 0;
      for (let i = 0; i < A.m.length; i++) if (A.m[i] && B.m[i]) both++;
      if (!both) continue;
      row.overlap[ids[a] + '+' + ids[b]] = +(both / Math.max(1, Math.min(A.n, B.n))).toFixed(4);
      if (out) {
        const rgb = Buffer.alloc(A.m.length * 3);
        for (let i = 0; i < A.m.length; i++) { rgb[i * 3] = A.m[i] * 255; rgb[i * 3 + 1] = B.m[i] * 255; rgb[i * 3 + 2] = A.m[i] & B.m[i] ? 255 : 0; }
        await sharp(rgb, { raw: { width: A.w, height: A.m.length / A.w, channels: 3 } }).png()
          .toFile(`${out}/overlap-${w}x${h}-p${String(Math.round(p * 100)).padStart(3, '0')}-${ids[a]}-${ids[b]}.png`);
      }
    }
    await draw(page, null);
    report.push(row);
    console.log(JSON.stringify(row));
  }
  await ctx.close();
}
await browser.close();
if (out) writeFileSync(`${out}/silhouettes.json`, JSON.stringify(report, null, 1));
