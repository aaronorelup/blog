// Drawing the leaves. Each leaf is a cached Path2D, one unit long along x: rolled (a twisted needle, as sencha
// leaves come from the tin) and open (a midrib, a width curve and a lightly serrated edge), cross-faded as it
// unrolls. Its color comes from its age (palette.js leafColor) and darkens as it wets. Fannings are 2 to 3 px flecks.
import { leafColor, mix, toCss } from './palette.js';
import { mulberry32 } from './rng.js';

const VARIANTS = 6;
const cache = [];

function build(v) {
  const rng = mulberry32(101 + v * 7);
  const bend = (rng() - 0.5) * 0.12, asym = 0.85 + rng() * 0.3, teeth = 9 + Math.floor(rng() * 5);
  const open = new Path2D(), rolled = new Path2D(), rib = new Path2D();
  const S = 40;
  const half = (u, side) => {
    const base = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.04)), 0.85) * (1 - 0.35 * u) * 0.24;
    const tooth = u > 0.12 && u < 0.92 ? Math.abs(((u * teeth) % 1) - 0.5) * 0.022 : 0;
    return (base + tooth) * (side > 0 ? asym : 1);
  };
  const mid = (u) => bend * Math.sin(Math.PI * u);
  open.moveTo(-0.5, 0);
  for (let i = 1; i <= S; i++) { const u = i / S; open.lineTo(u - 0.5, mid(u) - half(u, 1)); }
  for (let i = S; i >= 0; i--) { const u = i / S; open.lineTo(u - 0.5, mid(u) + half(u, -1)); }
  open.closePath();
  rib.moveTo(-0.56, 0.01);
  for (let i = 1; i <= 12; i++) { const u = i / 12; rib.lineTo(u * 0.94 - 0.5, mid(u * 0.94)); }
  // rolled: a narrow spindle with a twist in it
  const tw = (rng() - 0.5) * 0.08;
  rolled.moveTo(-0.36, 0);
  for (let i = 1; i <= 16; i++) { const u = i / 16; rolled.lineTo(u * 0.72 - 0.36, tw * Math.sin(u * 6) - Math.sin(Math.PI * u) ** 0.8 * 0.085); }
  for (let i = 16; i >= 0; i--) { const u = i / 16; rolled.lineTo(u * 0.72 - 0.36, tw * Math.sin(u * 6) + Math.sin(Math.PI * u) ** 0.8 * 0.07); }
  // the lamp's glint along a rolled leaf's back
  const glint = new Path2D();
  glint.moveTo(-0.22, tw * Math.sin(0.9) - 0.04);
  glint.quadraticCurveTo(0, -0.07, 0.2, tw * Math.sin(4.9) - 0.035);
  rolled.closePath();
  return { open, rolled, rib, glint };
}
const shape = (v) => cache[v] || (cache[v] = build(v));

// A leaf at screen (x, y) device px, `size` px long, angle a, unrolled u (0 to 1), in fill color rgb.
export function drawLeaf(ctx, x, y, size, a, u, rgb, seed, opts = {}) {
  const { open, rolled, rib, glint } = shape(seed % VARIANTS);
  const c = Math.cos(a) * size, s = Math.sin(a) * size;
  ctx.setTransform(c, s, -s, c, x, y);
  const ink = opts.ink ?? 0.5, lw = 1 / size;
  if (u < 0.98) {
    ctx.globalAlpha = (opts.alpha ?? 1) * (1 - u);
    ctx.fillStyle = toCss(mix(rgb, [24, 34, 14], 0.3));
    ctx.fill(rolled);
    ctx.lineWidth = lw * 0.8;
    ctx.strokeStyle = `rgba(30,26,22,${ink})`;
    ctx.stroke(rolled);
    if (opts.glint) { ctx.globalAlpha *= 0.55; ctx.lineWidth = lw * 0.8; ctx.strokeStyle = opts.glint; ctx.stroke(glint); }
  }
  if (u > 0.02) {
    ctx.globalAlpha = (opts.alpha ?? 1) * u;
    ctx.fillStyle = toCss(rgb);
    ctx.fill(open);
    ctx.lineWidth = lw * 0.9;
    ctx.strokeStyle = `rgba(28,24,20,${ink})`;
    ctx.stroke(open);
    ctx.lineWidth = lw * 0.9;
    ctx.strokeStyle = toCss(mix(rgb, [236, 226, 170], 0.32), 0.85);
    ctx.stroke(rib);
  }
  if (opts.ring) {
    ctx.globalAlpha = 1;
    ctx.lineWidth = lw * 2.2;
    ctx.strokeStyle = opts.ring;
    ctx.stroke(u > 0.5 ? open : rolled);
  }
  ctx.globalAlpha = 1;
}

// The leaf's body color: its age, darkened as it drinks.
export function bodyColor(p) {
  const base = leafColor(p.days);
  return mix(base, [base[0] * 0.62, base[1] * 0.7, base[2] * 0.5], Math.min(1, p.hyd) * 0.75);
}

// A leaf's on-screen length in device px.
export const lengthPx = (p, R) => p.len * R * (0.72 + 0.28 * p.unroll);

// Every fanning in one pass: small irregular flecks in two tones.
export function drawFannings(ctx, list, toX, toY, R, dpr, z0, z1, colorOf) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tones = [new Path2D(), new Path2D()];
  for (const p of list) {
    if (p.z < z0 || p.z > z1) continue;
    const w = Math.max(1.6 * dpr, p.len * R * 0.9), h = w * 0.55, x = toX(p.x), y = toY(p.y);
    const c = Math.cos(p.a), s = Math.sin(p.a), path = tones[p.seed % 2];
    path.moveTo(x + c * w * 0.5, y + s * w * 0.5);
    path.lineTo(x - s * h * 0.5, y + c * h * 0.5);
    path.lineTo(x - c * w * 0.5, y - s * w * 0.5);
    path.lineTo(x + s * h * 0.6, y - c * h * 0.6);
    path.closePath();
  }
  ctx.fillStyle = colorOf(0); ctx.fill(tones[0]);
  ctx.fillStyle = colorOf(1); ctx.fill(tones[1]);
}
