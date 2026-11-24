// The tea, per pixel, on a small CPU buffer over the cup (n x n, [-1.02, 1.02] each way): Beer-Lambert through the
// depth over the bowl (bottom * exp(-sigma * c * depth), sigma 0.6, 1.2, 3.4 per cm for red, green, blue), the
// tea's own glow, a bright meniscus, and the lamp mirrored in a surface bent by the swirl's dip, the sips and the
// waves. It fills two buffers: what the tea lets through (drawn with 'multiply' over the crisp bottom and its leaves)
// and what it adds (drawn 'lighter'). shade() is pure: arrays in, arrays out; paint.js puts them on the canvas.
import { N as DN } from './dye.js';
import { HB } from './leaves.js';
import { M as RM } from './ripples.js';

const SIGMA = [0.6, 1.2, 3.4];
const EYE = 1.6;                                  // the eye, above the cup's middle, in cup units
const SPAN = 1.02;
const LD = (() => { const v = [-0.4, -0.36, 1.6], n = Math.hypot(...v); return v.map((c) => c / n); })();
const E1 = (() => { const v = [LD[2], 0, -LD[0]], n = Math.hypot(...v); return v.map((c) => c / n); })();
const E2 = [LD[1] * E1[2] - LD[2] * E1[1], LD[2] * E1[0] - LD[0] * E1[2], LD[0] * E1[1] - LD[1] * E1[0]];

export function makeLiquid(n, wall) {
  const px = n * n, xs = new Float32Array(px), ys = new Float32Array(px), rs = new Float32Array(px);
  const hb = new Float32Array(px), inside = new Uint8Array(px), view = new Float32Array(px * 3);
  const di = new Int32Array(px), dt = new Float32Array(px * 2), ri = new Int32Array(px), rt = new Float32Array(px * 2);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i, x = -SPAN + (i + 0.5) * (2 * SPAN / n), y = -SPAN + (j + 0.5) * (2 * SPAN / n), r = Math.hypot(x, y);
    xs[k] = x; ys[k] = y; rs[k] = r; hb[k] = HB * r ** 4;
    inside[k] = r < wall(Math.atan2(y, x)) + 0.004 ? 1 : 0;
    const vn = Math.hypot(x, y, EYE);
    view[k * 3] = -x / vn; view[k * 3 + 1] = -y / vn; view[k * 3 + 2] = EYE / vn;
    const fx = Math.min(DN - 1.001, Math.max(0, (x + 1) * DN / 2 - 0.5)), fy = Math.min(DN - 1.001, Math.max(0, (y + 1) * DN / 2 - 0.5));
    di[k] = Math.floor(fy) * DN + Math.floor(fx); dt[k * 2] = fx - Math.floor(fx); dt[k * 2 + 1] = fy - Math.floor(fy);
    const gx = Math.min(RM - 2.001, Math.max(0, (x + 1) * RM / 2 - 0.5)), gy = Math.min(RM - 2.001, Math.max(0, (y + 1) * RM / 2 - 0.5));
    ri[k] = Math.floor(gy) * RM + Math.floor(gx); rt[k * 2] = gx - Math.floor(gx); rt[k * 2 + 1] = gy - Math.floor(gy);
  }
  return { n, xs, ys, rs, hb, inside, view, di, dt, ri, rt, gxR: new Float32Array(RM * RM), gyR: new Float32Array(RM * RM),
    trans: new Uint8ClampedArray(px * 4), add: new Uint8ClampedArray(px * 4) };
}

// Fills L.trans and L.add from the brew s. pal: the mode's materials (palette.js).
export function shade(L, s, pal) {
  const { n, xs, ys, rs, hb, inside, view, di, dt, ri, rt, gxR, gyR, trans, add } = L;
  const W = s.W, c0 = W > 0 ? 0.24 : 0, dye = s.dye.c, rip = s.ripples ? s.ripples.h : null;
  // the swirl's dip: deepest in the middle, saturating; its slope bends the lamp's image into an arc
  const dip = 0.45 * Math.tanh(s.gamma * s.gamma / 10), tilt = s.tilt * 1.4, bend = 3.2;
  const breath = 1 + s.breath, night = pal.spec === 'moon';
  const lr = pal.light[0] / 255 * breath, lg = pal.light[1] / 255 * breath, lb = pal.light[2] / 255 * breath;
  const [sr, sg, sb] = pal.scatter, [er, eg, eb] = pal.env;
  const wet = s.t > 1.2, dry = s.dryFront, tides = s.tides;
  const RS = 9;                                   // how far a wave's slope tips the surface
  if (rip) {
    for (let j = 1; j < RM - 1; j++) for (let i = 1; i < RM - 1; i++) {
      const m = j * RM + i;
      gxR[m] = (rip[m + 1] - rip[m - 1]) * RS; gyR[m] = (rip[m + RM] - rip[m - RM]) * RS;
    }
  }
  const lerp2 = (g, m, fx, fy) => (g[m] * (1 - fx) + g[m + 1] * fx) * (1 - fy) + (g[m + RM] * (1 - fx) + g[m + RM + 1] * fx) * fy;
  for (let k = 0, q = 0; k < n * n; k++, q += 4) {
    if (!inside[k]) { trans[q] = trans[q + 1] = trans[q + 2] = 255; trans[q + 3] = 255; add[q] = add[q + 1] = add[q + 2] = 0; add[q + 3] = 255; continue; }
    const x = xs[k], y = ys[k], r = rs[k];
    const eta = dip * (r * r - 0.4) + tilt * y;
    const D = W - hb[k] + eta;
    let tr = 1, tg = 1, tb = 1, ar = 0, ag = 0, ab = 0;
    let gx = (2 * dip * x) / 6 * bend, gy = (2 * dip * y + tilt) / 6 * bend;
    if (rip) { const m = ri[k], fx = rt[k * 2], fy = rt[k * 2 + 1]; gx += lerp2(gxR, m, fx, fy); gy += lerp2(gyR, m, fx, fy); }
    const nn = 1 / Math.sqrt(gx * gx + gy * gy + 1), nx = -gx * nn, ny = -gy * nn, nz = nn;
    const vx = view[k * 3], vy = view[k * 3 + 1], vz = view[k * 3 + 2];
    const nv = nx * vx + ny * vy + nz * vz;
    const Rx = 2 * nv * nx - vx, Ry = 2 * nv * ny - vy, Rz = 2 * nv * nz - vz;
    let spec;
    if (night) {
      // the lantern: a soft round moon and its halo
      const th = Math.sqrt(Math.max(0, 2 * (1 - (Rx * LD[0] + Ry * LD[1] + Rz * LD[2]))));
      const e = (th - 0.05) / 0.032;
      spec = (e < -1 ? 1 : e > 1 ? 0 : 0.5 - 0.5 * Math.sin(e * 1.5708)) * 1.05 + Math.exp(-th * th / 0.01) * 0.2;
    } else {
      // the morning window, its shoji lattice in it
      const a = Rx * E1[0] + Ry * E1[1] + Rz * E1[2], b = Rx * E2[0] + Ry * E2[1] + Rz * E2[2];
      const box = Math.max(0, Math.min(1, (0.085 - Math.abs(a)) * 15)) * Math.max(0, Math.min(1, (0.065 - Math.abs(b)) * 15));
      const ma = Math.abs(((a + 0.085) / 0.0425) % 1 - 0.5), mb = Math.abs(((b + 0.065) / 0.043) % 1 - 0.5);
      spec = box * (1 - 0.6 * Math.max(0, 1 - Math.min(ma, mb) / 0.1)) * 0.8 + Math.exp(-(a * a + b * b) / 0.02) * 0.1;
    }
    if (wet && r < dry) {
      // wet glaze: a touch darker and glossy, until it dries
      tr = 0.9; tg = 0.89; tb = 0.88;
      ar = spec * lr * 0.06; ag = spec * lg * 0.06; ab = spec * lb * 0.06;
    }
    if (D > 0) {
      // the water's edge blends into the glaze over a few hundredths of a cm, so the waterline is never stepped
      const f = D > 0.035 ? 1 : D / 0.035, o = 1 - f;
      const m = di[k], fx = dt[k * 2], fy = dt[k * 2 + 1];
      const c = c0 + (dye[m] * (1 - fx) + dye[m + 1] * fx) * (1 - fy) + (dye[m + DN] * (1 - fx) + dye[m + DN + 1] * fx) * fy;
      const cd = Math.max(0, c) * D;
      const wr = Math.exp(-SIGMA[0] * cd), wg = Math.exp(-SIGMA[1] * cd), wb = Math.exp(-SIGMA[2] * cd);
      // its own glow, brighter toward the lamp; a meniscus where it thins against the glaze
      const glow = night ? 0.55 + 0.45 * Math.max(0, -(x * 0.62 + y * 0.78)) : 0.85;
      const men = Math.exp(-D / 0.05) * 0.55 * f;
      tr = tr * o + wr * f; tg = tg * o + wg * f; tb = tb * o + wb * f;
      ar = ar * o + (sr * (1 - wg) * glow + er * men + spec * lr) * f;
      ag = ag * o + (sg * (1 - wg) * glow + eg * men + spec * lg) * f;
      ab = ab * o + (sb * (1 - wg) * glow + eb * men + spec * lb) * f;
    }
    // tide lines where each sip left the tea standing, a little off true toward the drinker
    for (let i = 0; i < tides.length; i++) {
      if (Math.abs(r - tides[i]) > 0.05) continue;
      const e = (Math.hypot(x, y - 0.012 * (i + 1)) - tides[i]) / 0.006;
      if (e > -3 && e < 3) { const ring = Math.exp(-e * e) * 0.11; tr *= 1 - ring * 0.5; tg *= 1 - ring * 0.8; tb *= 1 - ring * 1.3; }
    }
    trans[q] = tr * 255; trans[q + 1] = tg * 255; trans[q + 2] = tb * 255; trans[q + 3] = 255;
    add[q] = ar * 255; add[q + 1] = ag * 255; add[q + 2] = ab * 255; add[q + 3] = 255;
  }
}

// Beer-Lambert: the share of red, green and blue light that crosses `depth` cm of tea at strength c.
export const transmit = (c, depth) => SIGMA.map((g) => Math.exp(-g * Math.max(0, c * depth)));

// What the tea does to a color at depth `deep` cm under the surface at (x, y): for a sinking leaf.
export function through(s, rgb, x, y, deep, pal, sampleDye) {
  const t = transmit((s.W > 0 ? 0.24 : 0) + sampleDye(s.dye.c, x, y), deep), tg = t[1];
  return rgb.map((v, i) => v * t[i] + pal.scatter[i] * 255 * (1 - tg) * 0.8);
}

export const SPAN_CUP = SPAN;
