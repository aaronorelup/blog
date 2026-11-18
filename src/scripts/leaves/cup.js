// The still things, baked once per size and mode to offscreen canvases: the cedar tray (grain, seams, the lamp's
// falloff at night, a shoji's lattice of morning sun by day, vignetted into --pc-page at the edges) and the
// hand-thrown chawan seen from straight above (a noise-perturbed rim, a lit lip, crackle, one broad glaze run down
// its far wall, the foot's well, the rim's own shadow inside), outlined in uneven ink.
import { fbm, mulberry32, noise2, smooth } from './rng.js';

const LAMP = [-2.1, -2.5];                         // the lamp, off frame, in cup units
const unit = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); };
const SUN = unit([-0.46, -0.56, 0.95]), LANTERN = unit([-0.5, -0.58, 0.82]);
export const lipOf = (seed) => (a) => 0.088 + (noise2(Math.cos(a) * 2.3 + 7, Math.sin(a) * 2.3, seed + 3) - 0.5) * 0.02;

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

// The tray fills the frame: computed small and scaled up, so the grain is soft, then seams in ink on top.
export function bakeTray(v, pal, seed) {
  const out = canvas(v.w, v.h), ctx = out.getContext('2d');
  const f = Math.max(1, Math.max(v.w, v.h) / 540), lw = Math.ceil(v.w / f), lh = Math.ceil(v.h / f);
  const low = canvas(lw, lh), lc = low.getContext('2d'), img = lc.createImageData(lw, lh), d = img.data;
  const R = v.R / f, cx = v.cx / f, cy = v.cy / f, short = Math.min(lw, lh);
  const board = 1.05, rnd = mulberry32(seed + 11), tilt = [0, 1, 2, 3, 4, 5].map(() => [rnd() * 6 - 3, rnd() * 0.6 - 0.3]);
  const [a, b] = pal.tray, page = pal.pageRgb, day = pal.mode === 'day';
  for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
    const u = (x - cx) / R, w = (y - cy) / R + 0.37;
    const bi = Math.floor(w / board), bw = w - bi * board, [bu, bt] = tilt[((bi % 6) + 6) % 6];
    // flat-sawn cedar: arched rings across the board, wavering, with dark thin latewood
    const g = (bw - 0.5) * 9 + ((u - bu) * 0.42) ** 2 * (2.2 + bt) + fbm(u * 0.5, w * 2.2, seed) * 2.6;
    const ring = g - Math.floor(g);
    const late = smooth(0.62, 0.9, ring) * (1 - smooth(0.9, 1, ring));
    const tone = 0.35 * fbm(u * 1.4, w * 7, seed + 4) + 0.55 * late + (bi % 2) * 0.06;
    let r = a[0] + (b[0] - a[0]) * tone, gg = a[1] + (b[1] - a[1]) * tone, bb = a[2] + (b[2] - a[2]) * tone;
    // the light: one lamp from the upper left by night; by day the sun through a shoji, in its lattice
    let L;
    if (!day) {
      const dl = Math.sqrt((u - LAMP[0]) ** 2 + ((y - cy) / R - LAMP[1]) ** 2);
      L = pal.ambient + (1 - pal.ambient) * Math.exp(-((dl - 1.6) ** 2) / 5.5);
    } else {
      const wx = (u + 0.42 * (y - cy) / R) * 0.9 + 0.2, wy = ((y - cy) / R) * 0.95 + 0.15;
      const inWin = smooth(2.1, 1.75, Math.abs(wx - 0.2)) * smooth(1.6, 1.25, Math.abs(wy + 0.1));
      const bar = (q, p) => smooth(0.05, 0.015, Math.abs((((q / p) % 1 + 1) % 1) - 0.5) * p);
      const lattice = Math.max(bar(wx + 0.25, 0.5), bar(wy + 0.3, 0.62) * 0.8);
      L = pal.ambient + (1 - pal.ambient) * inWin * (1 - 0.4 * lattice);
    }
    const lr = pal.light[0] / 255, lg = pal.light[1] / 255, lb = pal.light[2] / 255;
    r *= L * (day ? 1 : 0.55 + 0.45 * lr) + (day ? 0 : 0.04); gg *= L * (day ? 1 : 0.5 + 0.5 * lg); bb *= L * (day ? 1 : 0.42 + 0.58 * lb);
    // fade into the page at the edges
    const e = smooth(0, 0.2, Math.min(x, lw - x) / short) * smooth(0, 0.2, Math.min(y, lh - y) / short);
    const k = (y * lw + x) * 4;
    d[k] = page[0] + (r - page[0]) * e; d[k + 1] = page[1] + (gg - page[1]) * e; d[k + 2] = page[2] + (bb - page[2]) * e;
    d[k + 3] = 255;
  }
  lc.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(low, 0, 0, v.w, v.h);
  // seams between the boards: a dark joint, a lit bevel on the lamp's side, faded with the edges
  ctx.lineCap = 'round';
  for (let i = -6; i < 8; i++) {
    const y = v.cy + (i * board - 0.37) * v.R;
    if (y < 0 || y > v.h) continue;
    const fade = smooth(0, 0.2, Math.min(y, v.h - y) / Math.min(v.w, v.h));
    for (let x = 0; x < v.w; x += 24 * v.dpr) {
      const e = (fade * smooth(0, 0.2, Math.min(x, v.w - x) / Math.min(v.w, v.h))) ** 2;
      const wob = (noise2(x / (90 * v.dpr), i, seed) - 0.5) * 1.6 * v.dpr;
      ctx.strokeStyle = `rgba(${pal.seam.join(',')},${0.75 * e})`;
      ctx.lineWidth = (1.1 + noise2(x / (60 * v.dpr), i + 9, seed) * 1.4) * v.dpr;
      ctx.beginPath(); ctx.moveTo(x, y + wob); ctx.lineTo(x + 24 * v.dpr, y + wob * 0.6); ctx.stroke();
      ctx.strokeStyle = `rgba(255,236,200,${(day ? 0.18 : 0.07) * e})`;
      ctx.lineWidth = v.dpr;
      ctx.beginPath(); ctx.moveTo(x, y + wob + 2 * v.dpr); ctx.lineTo(x + 24 * v.dpr, y + wob * 0.6 + 2 * v.dpr); ctx.stroke();
    }
  }
  return out;
}

// A closed ring path round the rim, at radius fn(angle) cup units, in device px about (cx, cy).
export function ringPath(cx, cy, R, fn, steps = 180) {
  const p = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2, r = fn(a) * R;
    if (i) p.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); else p.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  p.closePath();
  return p;
}

// A function of the angle, tabled once: the bake asks the rim's radius at every pixel.
function table(fn, n = 2048) {
  const t = new Float32Array(n + 1);
  for (let i = 0; i <= n; i++) t[i] = fn((i / n) * 2 * Math.PI - Math.PI);
  return (a) => {
    let u = ((a + Math.PI) / (2 * Math.PI)) % 1;
    if (u < 0) u += 1;
    u *= n;
    const i = Math.min(n - 1, Math.floor(u));
    return t[i] + (t[i + 1] - t[i]) * (u - i);
  };
}

// The chawan on its own canvas, size x size device px, centred; R is its inner radius in device px. Its glaze is
// worked out on a canvas at most 440 px across and drawn up smooth; the ink and the crackle are drawn at full size.
export function bakeCup(R, dpr, pal, seed, wallFn) {
  const lip = table(lipOf(seed)), wall = table(wallFn);
  const size = Math.ceil(R * 2.3);
  const out = canvas(size, size), ctx = out.getContext('2d'), c = size / 2;
  const f = Math.max(1, size / 440), ls = Math.ceil(size / f), low = canvas(ls, ls), lc = low.getContext('2d');
  const img = lc.createImageData(ls, ls), d = img.data, Rl = R / f, cl = ls / 2;
  const rng = mulberry32(seed + 29);
  const runAt = -Math.PI / 2 + (rng() - 0.5) * 0.5, runEnd = 0.6 + rng() * 0.12;
  const day = pal.mode === 'day', L = day ? SUN : LANTERN;
  const H = unit([L[0], L[1], L[2] + 1]);
  const [g0, g1] = pal.glaze, light = pal.light.map((q) => q / 255);
  const tanE = L[2] / Math.hypot(L[0], L[1]), lx = L[0] / Math.hypot(L[0], L[1]), ly = L[1] / Math.hypot(L[0], L[1]);
  const zOf = (r) => 2.6 * r ** 4 + (r > 0.8 ? 30 * (r - 0.8) ** 2 : 0);
  const zRim = zOf(1);
  const [lip0, lip1, lip2] = pal.lip, [run0, run1, run2] = pal.run, [sh0, sh1, sh2] = pal.shade;
  const amb0 = pal.ambient, dif = (1 - amb0) * 1.25, specK = day ? 0.25 : 0.4;
  for (let y = 0; y < ls; y++) for (let x = 0; x < ls; x++) {
    const u = (x + 0.5 - cl) / Rl, w = (y + 0.5 - cl) / Rl, r = Math.sqrt(u * u + w * w), th = Math.atan2(w, u);
    const rim = wall(th), outer = rim + lip(th), k = (y * ls + x) * 4;
    if (r > outer + 0.02) { d[k + 3] = 0; continue; }
    const tone = fbm(u * 2.4, w * 2.4, seed + 6), speck = noise2(u * 16, w * 16, seed + 8);
    let c0 = g0[0] + (g1[0] - g0[0]) * tone, c1 = g0[1] + (g1[1] - g0[1]) * tone, c2 = g0[2] + (g1[2] - g0[2]) * tone;
    let nx, ny, nz, shadow = 0, ao = 1;
    if (r >= rim) {
      // the lip: a rounded bead, where the glaze runs thin and the iron of the clay shows
      const s = Math.min(1, (r - rim) / (outer - rim)), nr = (2 * s - 1) * 0.92;
      nx = nr * Math.cos(th); ny = nr * Math.sin(th); nz = Math.sqrt(1 - nr * nr);
      const iron = Math.exp(-(((s - 0.5) / 0.32) ** 2)) * (0.35 + 0.4 * noise2(th * 6, 1, seed));
      c0 += (lip0 - c0) * iron; c1 += (lip1 - c1) * iron; c2 += (lip2 - c2) * iron;
    } else {
      const slope = (10.4 * r ** 3 + (r > 0.8 ? 60 * (r - 0.8) : 0)) / 6;
      const nn = Math.sqrt(slope * slope + 1), rr = Math.max(r, 1e-4);
      nx = -slope * u / rr / nn; ny = -slope * w / rr / nn; nz = 1 / nn;
      // the rim's shadow: follow the ray toward the light until it clears the rim's height
      const run = (zRim - zOf(r)) / 6 / tanE, qx = u + lx * run, qy = w + ly * run;
      shadow = smooth(-0.06, 0.08, Math.sqrt(qx * qx + qy * qy) - wall(Math.atan2(qy, qx))) * 0.85;
      ao = 0.78 + 0.22 * r;
      // the well over the foot: a little glaze pooled, and the foot ring's shadow through it
      const well = smooth(0.48, 0.38, r), ring = Math.exp(-(((r - 0.44) / 0.018) ** 2));
      const dim = (1 - 0.06 * well) * (1 - 0.1 * ring);
      c0 *= dim; c1 *= dim; c2 = (c2 * (1 - 0.06 * well) - 4 * well) * (1 - 0.1 * ring);
      // the glaze run on the cup's far wall: a broad tongue of glaze that pooled thicker as it slid down, a shade
      // deeper and warmer, soft across, with a faint bright lip where its edge stands proud, ending in a round bead
      if (r > runEnd - 0.04) {
        let da = th - runAt - Math.sin(r * 4 + seed) * 0.035;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        const half = 0.12 * (0.5 + 0.5 * smooth(runEnd, 1, r)) + 0.035 * Math.exp(-(((r - runEnd - 0.05) / 0.05) ** 2));
        const across = Math.abs(da) * r / half, along = smooth(runEnd - 0.03, runEnd + 0.07, r);
        if (across < 1.4) {
          const m = Math.max(0, 1 - across * across) ** 1.4 * along * 0.2;
          const lift = Math.exp(-(((across - 0.95) / 0.12) ** 2)) * along * 0.06;
          c0 += (run0 - c0) * m + (255 - c0) * lift; c1 += (run1 - c1) * m + (255 - c1) * lift; c2 += (run2 - c2) * m + (255 - c2) * lift;
        }
      }
    }
    const sp = 0.97 + 0.06 * speck;
    const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]) * (1 - shadow);
    const spec = Math.pow(Math.max(0, nx * H[0] + ny * H[1] + nz * H[2]), 70) * (1 - shadow) * specK * 255;
    const amb = amb0 * ao;
    const lamp = day ? 1 : Math.exp(-((Math.sqrt((u - LAMP[0] * 0.3) ** 2 + (w - LAMP[1] * 0.3) ** 2) - 0.6) ** 2) / 3) * 0.35 + 0.75;
    // shadows keep the room's plum and indigo; only the light is amber
    const lit = dif * lam * lamp;
    d[k] = c0 * sp * (amb * sh0 + lit * light[0]) + spec * light[0];
    d[k + 1] = c1 * sp * (amb * sh1 + lit * light[1]) + spec * light[1] * 0.9;
    d[k + 2] = c2 * sp * (amb * sh2 + lit * light[2]) + spec * light[2] * 0.9;
    d[k + 3] = 255 * smooth(outer + 0.02, outer - 0.005, r);
  }
  lc.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(low, 0, 0, size, size);
  crackle(ctx, c, c, R, dpr, pal, seed, wall);
  // uneven ink: heavy round the outside, fine at the inner edge of the lip
  const ink = `rgba(${pal.line.join(',')},${day ? 0.85 : 0.95})`;
  ctx.fillStyle = ink;
  const thick = (a, base, vary, sd) => (base + vary * noise2(Math.cos(a) * 3 + sd, Math.sin(a) * 3, seed)) * dpr / R;
  const outerEdge = ringPath(c, c, R, (a) => wall(a) + lip(a) + thick(a, 0.7, 1.6, 2));
  outerEdge.addPath(ringPath(c, c, R, (a) => wall(a) + lip(a) - thick(a, 0.6, 1.2, 5)));
  ctx.fill(outerEdge, 'evenodd');
  ctx.globalAlpha = 0.7;
  const inner = ringPath(c, c, R, (a) => wall(a) + thick(a, 0.4, 0.9, 7));
  inner.addPath(ringPath(c, c, R, (a) => wall(a) - thick(a, 0.3, 0.8, 4)));
  ctx.fill(inner, 'evenodd');
  ctx.globalAlpha = 1;
  return { canvas: out, size };
}

// Crackle in the glaze: the dual of a jittered triangulation, so the cells read as irregular polygons, stained
// a little by tea where it sits longest.
function crackle(ctx, cx, cy, R, dpr, pal, seed, wall) {
  const rng = mulberry32(seed + 41), cell = 0.085, n = Math.ceil(2.2 / cell);
  const P = [];
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) P.push([-1.1 + (i + (rng() - 0.5) * 0.8) * cell, -1.1 + (j + (rng() - 0.5) * 0.8) * cell]);
  const at = (i, j) => P[j * (n + 1) + i];
  const mid = (...q) => [q.reduce((s, p) => s + p[0], 0) / q.length, q.reduce((s, p) => s + p[1], 0) / q.length];
  const sq = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    if (rng() < 0.5) { const A = mid(a, b, d), B = mid(a, d, c); sq.push({ A, B, top: A, right: A, left: B, bottom: B }); }
    else { const A = mid(a, b, c), B = mid(b, d, c); sq.push({ A, B, top: A, left: A, right: B, bottom: B }); }
  }
  const edges = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const s = sq[j * n + i];
    edges.push([s.A, s.B]);
    if (i < n - 1) edges.push([s.right, sq[j * n + i + 1].left]);
    if (j < n - 1) edges.push([s.bottom, sq[(j + 1) * n + i].top]);
  }
  ctx.save();
  ctx.clip(ringPath(cx, cy, R, (a) => wall(a) - 0.01));
  ctx.lineWidth = 0.8 * dpr;
  for (const [p, q] of edges) {
    const r = Math.hypot(p[0] + q[0], p[1] + q[1]) / 2;
    if (r > 1.02 || rng() < 0.12) continue;
    const alpha = (0.07 + 0.2 * smooth(0.95, 0.2, r)) * (0.5 + rng() * 0.7) * (pal.mode === 'day' ? 1 : 0.8);
    ctx.strokeStyle = `rgba(${pal.crackle.join(',')},${alpha})`;
    const mx = (p[0] + q[0]) / 2 + (rng() - 0.5) * 0.012, my = (p[1] + q[1]) / 2 + (rng() - 0.5) * 0.012;
    ctx.beginPath();
    ctx.moveTo(cx + p[0] * R, cy + p[1] * R);
    ctx.quadraticCurveTo(cx + mx * R, cy + my * R, cx + q[0] * R, cy + q[1] * R);
    ctx.stroke();
  }
  ctx.restore();
}

// The cup's huge, faint shadow on the tray, away from the light; k is the rise (0 to 1).
export function cupShadow(ctx, cx, cy, Ro, pal, k) {
  const day = pal.mode === 'day';
  const ox = cx + Ro * 0.17 * k, oy = cy + Ro * 0.21 * k;
  const g = ctx.createRadialGradient(ox, oy, Ro * 0.7, ox, oy, Ro * (1.25 + 0.35 * k));
  const a = (day ? 0.26 : 0.5) * k;
  g.addColorStop(0, `rgba(20,12,16,${a})`); g.addColorStop(1, 'rgba(20,12,16,0)');
  ctx.fillStyle = g;
  ctx.fillRect(ox - Ro * 2, oy - Ro * 2, Ro * 4, Ro * 4);
  const c = ctx.createRadialGradient(cx + Ro * 0.04, cy + Ro * 0.05, Ro * 0.92, cx + Ro * 0.04, cy + Ro * 0.05, Ro * 1.07);
  c.addColorStop(0, `rgba(16,10,14,${(day ? 0.3 : 0.45) * k})`); c.addColorStop(1, 'rgba(16,10,14,0)');
  ctx.fillStyle = c;
  ctx.fillRect(cx - Ro * 1.3, cy - Ro * 1.3, Ro * 2.6, Ro * 2.6);
}
