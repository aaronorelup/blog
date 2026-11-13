// The stub chapters' placeholder pictures (piece 1): for each chapter that is still a stub, a painted field of its
// light with a floor and a pool of light, a paper floor lantern lit in its colour, the lantern's screen shadow
// (the painter's rule in docs/tea/gen/shared.md: three times its box each way, alpha 0 on every edge) and the
// two stills; for Start here, look B's room and its lantern cut out of it; for the hero, the garden plate cut at
// the door into the two halves that part. A chapter's builder replaces every one of these files.
//   node scripts/tools/tea/stub-art.mjs [id ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const out = (id, f) => path.join(ROOT, 'public/tea/scenes', id, f);
const NIGHT = [16, 18, 32];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => a.map((x, i) => Math.round(x + (b[i] - x) * k));
const css = (c) => `rgb(${c.join(',')})`;
const webp = (img, file, q = 86) => img.webp({ quality: q, effort: 6, smartSubsample: true }).toFile(file);

// The lantern, 600 x 900, its paper lit from inside. lit: only the paper (the shadow's lit part).
function lantern(light, { lit = false } = {}) {
  const L = hex(light), deep = mix(L, [60, 40, 46], 0.42), warm = mix(L, [255, 252, 240], 0.55);
  const ink = '#1d1620', wood = '#4a3329', dark = '#33241f';
  if (lit) return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><rect x="184" y="150" width="232" height="488" fill="#fff"/></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs><radialGradient id="p" cx="50%" cy="46%" r="64%"><stop offset="0" stop-color="${css(warm)}"/>
  <stop offset="0.5" stop-color="${css(L)}"/><stop offset="1" stop-color="${css(deep)}"/></radialGradient></defs>
  <g stroke="${ink}" stroke-linejoin="round" stroke-linecap="round">
  <path d="M232 66 L368 64 L370 104 L346 104 L345 86 L255 87 L254 105 L230 105 Z" fill="${dark}" stroke-width="7"/>
  <path d="M138 104 L462 102 L463 148 L137 150 Z" fill="${wood}" stroke-width="8"/>
  <path d="M162 148 L438 147 L439 642 L161 643 Z" fill="url(#p)" stroke-width="8"/>
  <path d="M296 150 L304 150 L304 640 L296 640 Z" fill="${dark}" stroke-width="4" opacity="0.55"/>
  <path d="M184 312 L416 310 M184 476 L416 475" fill="none" stroke="${dark}" stroke-width="9"/>
  <path d="M162 148 L186 148 L186 642 L161 643 Z M414 147 L438 147 L439 642 L414 642 Z" fill="${wood}" stroke-width="7"/>
  <path d="M138 642 L462 640 L463 686 L137 688 Z" fill="${wood}" stroke-width="8"/>
  <path d="M158 686 L186 686 L188 872 L160 873 Z M414 686 L442 686 L440 873 L412 872 Z" fill="${dark}" stroke-width="7"/>
  <path d="M186 800 L414 799" fill="none" stroke="${dark}" stroke-width="10"/></g></svg>`;
}

// The field: a back wall and a floor in the night, the chapter's light pooled round the lantern's foot and washed
// up the wall behind it, with a little grain so it reads as paint and never as a flat colour.
function field(light, [w, h], lamp) {
  // shadows stay indigo and plum (1.3): the wall and floor are the night's own colours, the light only in the pool
  // and on the papered panels it falls on
  const L = hex(light), PLUM = [62, 42, 66], wall = mix(mix(NIGHT, PLUM, 0.45), L, 0.05), floor = mix(mix(NIGHT, PLUM, 0.6), L, 0.09), ink = '#140f1c';
  const wood = css(mix([42, 28, 30], L, 0.05)), paper = css(mix(wall, L, 0.16));
  const fy = lamp.foot - lamp.h * 0.09, lw = Math.max(3, w * 0.0022);
  const upright = h > w;
  // the room: a beam under the ceiling, posts that frame the back wall, papered panels between them that the
  // lamp lights faintly, mats on the floor; all in the same ink line, softly shaded inside
  const posts = (upright ? [0.04, 0.96] : [0.06, 0.34, 0.66, 0.94]).map((x) => x * w);
  const pw = w * (upright ? 0.05 : 0.026), beam = h * (upright ? 0.07 : 0.12);
  const panels = posts.slice(0, -1).map((x, i) => [x + pw / 2, posts[i + 1] - pw / 2]);
  const lattice = (x0, x1) => {
    const out = [];
    const cols = Math.max(2, Math.round((x1 - x0) / (w * (upright ? 0.22 : 0.075))));
    for (let i = 1; i < cols; i++) out.push(`M${x0 + ((x1 - x0) * i) / cols} ${beam} L${x0 + ((x1 - x0) * i) / cols} ${fy}`);
    for (let j = 1; j < 5; j++) out.push(`M${x0} ${beam + ((fy - beam) * j) / 5} L${x1} ${beam + ((fy - beam) * j) / 5}`);
    return out.join(' ');
  };
  const mats = [0.33, 0.66].map((k) => `M0 ${fy + (h - fy) * k} L${w} ${fy + (h - fy) * k + 4}`).join(' ') +
    ` M${w * 0.5} ${fy} L${w * 0.47} ${h}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${w * 0.03}"/></filter>
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="${2.2 / w} ${1.4 / h}" numOctaves="3" seed="7"/>
  <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.5  0 0 0 0.09 0"/></filter>
  <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="${css(wall)}"/>
  ${panels.map(([a, b]) => `<rect x="${a}" y="${beam}" width="${b - a}" height="${fy - beam}" fill="${paper}"/>`).join('')}
  <path d="${panels.map(([a, b]) => lattice(a, b)).join(' ')}" stroke="${wood}" stroke-width="${lw * 1.6}" fill="none" opacity="0.9"/>
  <rect y="${fy}" width="${w}" height="${h - fy}" fill="${css(floor)}"/>
  <path d="${mats}" stroke="${ink}" stroke-width="${lw * 0.8}" fill="none" opacity="0.55"/>
  <ellipse cx="${lamp.cx}" cy="${lamp.cy}" rx="${lamp.h * 1.1}" ry="${lamp.h * 0.95}" fill="${light}" opacity="0.2" filter="url(#b)"/>
  <ellipse cx="${lamp.cx}" cy="${lamp.foot}" rx="${lamp.h * 1.25}" ry="${lamp.h * 0.26}" fill="${light}" opacity="0.32" filter="url(#b)"/>
  ${posts.map((x) => `<rect x="${x - pw / 2}" y="0" width="${pw}" height="${fy + lw}" fill="${wood}" stroke="${ink}" stroke-width="${lw}"/>`).join('')}
  <rect x="${-lw}" y="${-lw}" width="${w + 2 * lw}" height="${beam}" fill="${wood}" stroke="${ink}" stroke-width="${lw}"/>
  <rect y="${beam}" width="${w}" height="${h * 0.08}" fill="url(#s)"/>
  <rect width="${w}" height="${h}" filter="url(#g)"/>
  <path d="M0 ${fy} L${w} ${fy + 3}" stroke="${ink}" stroke-width="${lw}" fill="none"/></svg>`;
}

// A shadow picture for an object of size [w, h] px (rgba raw) whose lit part is litMask (one channel, same size):
// three times the object each way, the object in the middle third.
async function shadow(obj, litMask, [w, h], light, file) {
  const W = w * 3, H = h * 3, n = W * H;
  const place = async (buf, channels) => sharp(buf, { raw: { width: w, height: h, channels } })
    .extend({ top: h, bottom: h, left: w, right: w, background: channels === 4 ? { r: 0, g: 0, b: 0, alpha: 0 } : '#000' });
  const alpha = await (await place(obj, 4)).extractChannel(3).raw().toBuffer();
  const lit = await (await place(litMask, 1)).extractChannel(0).raw().toBuffer();
  const blur = (buf, s) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).blur(s).extractChannel(0).raw().toBuffer();
  const sil = await blur(alpha.map((a, i) => Math.max(0, a - lit[i])), Math.max(0.3, W * 0.004));
  const g1 = await blur(lit, W * 0.03), g2 = await blur(lit, W * 0.09);
  const L = hex(light), pale = L[2] > L[0] ? [238, 243, 255] : [255, 244, 222], ink = [38, 26, 42];
  const rgba = Buffer.alloc(n * 4);
  const ramp = (x, len) => { const t = Math.min(x, len - 1 - x) / (len * 0.1); return t >= 1 ? 1 : t <= 0 ? 0 : t * t * (3 - 2 * t); };
  for (let y = 0; y < H; y++) {
    const ry = ramp(y, H);
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      // back to front: the glow, the lit paper, the ink silhouette
      let a = Math.min(0.8, (g1[i] + g2[i]) / 255 * 0.9), c = L;
      const p = lit[i] / 255;
      if (p > 0) { c = mix(c, pale, p); a = a + (1 - a) * p; }
      const s = (sil[i] / 255) * 0.8;
      c = mix(c, ink, a + s > 0 ? s / (s + a * (1 - s)) : 0);
      a = s + a * (1 - s);
      a *= ry * ramp(x, W);
      rgba[i * 4] = c[0]; rgba[i * 4 + 1] = c[1]; rgba[i * 4 + 2] = c[2]; rgba[i * 4 + 3] = Math.round(a * 255);
    }
  }
  await webp(sharp(rgba, { raw: { width: W, height: H, channels: 4 } }), file, 82);
}

const SPARE_D = [-64, -36, 1728, 972], SPARE_P = [-36, -64, 972, 1728];
// Where a board box lands on a plate drawn over the plate's own box (both in board units).
const onPlate = (box, plateBox, [pw, ph]) => {
  const k = pw / plateBox[2];
  return { x: (box[0] - plateBox[0]) * k, y: (box[1] - plateBox[1]) * k, w: box[2] * k, h: box[3] * k };
};

async function stub(id) {
  const { scene } = await import(path.join(ROOT, 'src/data/tea', id, 'scene.js'));
  const light = scene.light.colour;
  fs.mkdirSync(path.dirname(out(id, 'x')), { recursive: true });
  const lampPng = await sharp(Buffer.from(lantern(light))).png().toBuffer();
  await webp(sharp(lampPng), out(id, 'lamp.webp'), 88);
  const obj = await sharp(lampPng).ensureAlpha().raw().toBuffer();
  const litMask = await sharp(Buffer.from(lantern(light, { lit: true }))).extractChannel(0).raw().toBuffer();
  await shadow(obj, litMask, [600, 900], light, out(id, 'shadow.webp'));
  for (const [comp, size, spare, file, still] of [['d', [2752, 1548], SPARE_D, 'field.webp', 'still.webp'], ['p', [1548, 2752], SPARE_P, 'field-p.webp', 'still-p.webp']]) {
    const lampFlat = scene[comp].flats.find((f) => f.name === 'lamp');
    const r = onPlate(lampFlat.box, spare, size);
    const png = await sharp(Buffer.from(field(light, size, { cx: r.x + r.w / 2, cy: r.y + r.h * 0.45, foot: r.y + r.h * 0.97, h: r.h }))).png().toBuffer();
    await webp(sharp(png), out(id, file), 84);
    const lamp = await sharp(lampPng).resize(Math.round(r.w), Math.round(r.h)).toBuffer();
    await webp(sharp(png).composite([{ input: lamp, left: Math.round(r.x), top: Math.round(r.y) }]), out(id, still), 82);
  }
  console.log(`${id}: field, lamp, shadow and stills in public/tea/scenes/${id}/`);
}

// Start here: look B's room (public/labs/tea-room/b/, read only), its lantern cut out with a soft edge so that at
// rest it lies exactly on the plate, a lantern's shadow, and a portrait still.
async function start() {
  const src = path.join(ROOT, 'public/labs/tea-room/b/assets/img/room.webp');
  fs.mkdirSync(path.dirname(out('start', 'x')), { recursive: true });
  fs.copyFileSync(src, out('start', 'room.webp'));
  const [x, y, w, h] = [1828, 756, 236, 330], f = 14;
  const crop = await sharp(src).extract({ left: x, top: y, width: w, height: h }).ensureAlpha().raw().toBuffer();
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i, e = Math.min(i, w - 1 - i, j, h - 1 - j);
    crop[k * 4 + 3] = Math.round(255 * Math.min(1, e / f));
  }
  await webp(sharp(crop, { raw: { width: w, height: h, channels: 4 } }), out('start', 'lantern.webp'), 92);
  // the shadow is the stub lantern's, drawn over the cut's box: the cut has no outline of its own to cast
  const lampPng = await sharp(Buffer.from(lantern('#FFD892'))).png().toBuffer();
  const obj = await sharp(lampPng).ensureAlpha().raw().toBuffer();
  const litMask = await sharp(Buffer.from(lantern('#FFD892', { lit: true }))).extractChannel(0).raw().toBuffer();
  await shadow(obj, litMask, [600, 900], '#FFD892', out('start', 'shadow.webp'));
  await webp(sharp(src).extract({ left: 1514, top: 0, width: 864, height: 1536 }), out('start', 'still-p.webp'), 86);
  console.log('start: room, lantern, shadow and portrait still in public/tea/scenes/start/');
}

// The hero: the garden plate cut at the door (x 1420 of 2816) into the two halves that part, and a portrait still.
async function hero() {
  const src = path.join(ROOT, 'public/tea/hero/bg-far-night.webp');
  fs.mkdirSync(path.dirname(out('hero', 'x')), { recursive: true });
  await webp(sharp(src).extract({ left: 0, top: 0, width: 1420, height: 1584 }), out('hero', 'garden-l.webp'), 90);
  await webp(sharp(src).extract({ left: 1420, top: 0, width: 1396, height: 1584 }), out('hero', 'garden-r.webp'), 90);
  await webp(sharp(src).extract({ left: 974, top: 0, width: 891, height: 1584 }), out('hero', 'still-p.webp'), 88);
  console.log('hero: the garden\'s two halves and a portrait still in public/tea/scenes/hero/');
}

const STUBS = ['tv', 'film', 'games', 'art', '3d', 'agents', 'learning', 'site', 'projects', 'courses', 'now', 'about'];
const want = process.argv.slice(2);
for (const id of want.length ? want : ['hero', 'start', ...STUBS]) {
  if (id === 'hero') await hero();
  else if (id === 'start') await start();
  else if (STUBS.includes(id)) await stub(id);
  else console.error(`no stub art for ${id}`);
}
