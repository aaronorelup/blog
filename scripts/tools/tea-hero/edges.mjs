// Whether the picture's layers cover the frame: `edges(manifest)` (tests/unit/tea-hero.test.mjs holds the shipped one to
// it) and `node scripts/tools/tea-hero/edges.mjs [--sizes 1440x900:dock:1,...] [--ptr 1] [--manifest <file>]`. With the
// runtime's own camera code (camera.js, no browser), every progress 0..1 in steps of 0.005, the pointer anywhere in
// -ptr..ptr on both axes and, docked, the lens shift off and at cover x its keys, traces the screen's border onto each
// layer's plane. Past an opaque layer's edge is a fault; past a cut-out's, only where its paint reaches that edge.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// a docked size's cover is the docked box's share over camera.dock.cover (the runtime's state.cover; at most 1.12)
export const SIZES = ['1920x1080:dock:0.76', '1536x864:dock:0.94', '1440x900:dock:1', '1366x768:dock:1.05',
  '1280x800:dock:1.12', '1280x720', '1440x700', '1024x768', '1180x820', '844x390', '1024x1024', '768x1024', '820x1180',
  '430x932', '390x844', '360x740', '360x640'];

globalThis.location ??= { href: 'http://localhost/tea/' };
const hero = (m) => import(pathToFileURL(ROOT + 'src/scripts/tea/hero/' + m).href);
const three = await hero('three.js');
await three.loadThree();
const { createCamera, fitCamera, placeCamera } = await hero('camera.js');
const { normalise } = await hero('manifest.js');
const { sample } = await hero('tracks.js');

// A cut-out's paint along each side of its images (night or day): left/right by row, top/bottom by column, 0..1.
async function paintOf(spec) {
  const sides = { left: new Set(), right: new Set(), top: new Set(), bottom: new Set() };
  for (const url of new Set([spec.night, spec.day])) {
    const { data, info } = await sharp(ROOT + 'public' + new URL(url).pathname).ensureAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: c } = info;
    const a = (x, y) => data[(y * w + x) * c + c - 1];
    for (let y = 0; y < h; y++) for (let k = 0; k < 4; k++) {
      if (a(k, y) > 8) sides.left.add(Math.floor((y / h) * 200));
      if (a(w - 1 - k, y) > 8) sides.right.add(Math.floor((y / h) * 200));
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) {
      if (a(x, k) > 8) sides.top.add(Math.floor((x / w) * 200));
      if (a(x, h - 1 - k) > 8) sides.bottom.add(Math.floor((x / w) * 200));
    }
  }
  return sides;
}

// The manifest's JSON (its images read from public/) at each size: { faults, lines }, a line a size naming each
// layer's smallest margin in units and where it was, with its faults.
export async function edges(json, { sizes = SIZES, ptr = 1 } = {}) {
  const m = normalise(json, '/tea/hero/manifest.json');
  const paint = new Map();
  for (const l of m.background) if (l.cutout) paint.set(l.id, await paintOf(l));
  const grid = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((v) => v * ptr);
  const border = [];
  for (let i = 0; i <= 20; i++) { const t = -1 + i / 10; border.push([t, -1], [t, 1], [-1, t], [1, t]); }
  let faults = 0;
  const lines = [];
  for (const size of sizes) {
    const [wh, layout = 'flow', cover = '1'] = size.split(':');
    const [w, h] = wh.split('x').map(Number);
    const rig = createCamera(m);
    fitCamera(rig, m.reference.aspect, w, h);
    const worst = new Map(m.background.map((l) => [l.id, { margin: Infinity, at: null, faults: 0 }]));
    for (let i = 0; i <= 200; i++) for (const dock of layout === 'dock' ? [0, 1] : [0]) for (const x of grid) for (const y of grid) {
      const p = i / 200;
      rig.shift = dock * sample(m.camera.dock.shift, p, 'smooth') * Number(cover);
      placeCamera(rig, p, { x, y });
      rig.cam.updateMatrixWorld();
      const o = rig.cam.position;
      for (const [nx, ny] of border) {
        const d = new three.Vector3(nx, ny, 0.5).unproject(rig.cam).sub(o);
        for (const l of m.background) {
          const s = rig.portrait ? l.portraitScale : 1;
          const t = (l.z - o.z) / d.z;
          const [hx, hy] = [o.x + d.x * t - l.x, o.y + d.y * t - l.y];   // from the layer's centre
          const [hw, hh] = [(l.size[0] * s) / 2, (l.size[1] * s) / 2];
          const margin = Math.min(hw - Math.abs(hx), hh - Math.abs(hy));
          const W = worst.get(l.id);
          let fault = margin < 0;
          if (fault && paint.has(l.id)) {
            const P = paint.get(l.id);
            const row = Math.floor(((hh - hy) / (2 * hh)) * 200);
            const col = Math.floor(((hx + hw) / (2 * hw)) * 200);
            fault = (hx < -hw && P.left.has(row)) || (hx > hw && P.right.has(row))
              || (hy > hh && P.top.has(col)) || (hy < -hh && P.bottom.has(col));
          }
          if (fault) W.faults++;
          if (margin < W.margin) { W.margin = margin; W.at = `p ${p} pointer ${x},${y}${dock ? ' docked' : ''}`; }
        }
      }
    }
    const line = [...worst].map(([id, W]) => `${id} ${W.margin.toFixed(3)} (${W.at})${W.faults ? ` ${W.faults} FAULTS` : ''}`);
    for (const [, W] of worst) faults += W.faults;
    lines.push(`${size} ${rig.portrait ? 'portrait' : 'landscape'}: ${line.join('; ')}`);
  }
  return { faults, lines };
}

// run as a tool: prints the lines and a verdict, exit 1 on any fault
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
  const file = arg('manifest', ROOT + 'public/tea/hero/manifest.json');
  const { faults, lines } = await edges(JSON.parse(readFileSync(file, 'utf8')),
    { sizes: arg('sizes', SIZES.join(',')).split(','), ptr: Number(arg('ptr', '1')) });
  for (const line of lines) console.log(line);
  console.log(faults ? `${faults} frames show past a layer's edge` : 'no frame shows past a layer\'s edge');
  process.exit(faults ? 1 : 0);
}
