// One frame of the room, in device px: the ground, the tray rising out of it, the cup and its shadow (once risen,
// copied from one still picture, and only round the cup unless the pour or the lamp reaches further), then inside
// the rim the bottom and its sunk leaves, the tea over them (liquid.js: 'multiply' what it lets through, 'lighter'
// what it adds), the leaves still sinking (tinted by the tea above them) and the ones afloat, then what falls in,
// the pour and the steam. Nothing here changes the brew.
import { POUR } from './brew.js';
import { cupShadow } from './cup.js';
import { sample } from './dye.js';
import { FAN, WORD, depthAt } from './leaves.js';
import { SPAN_CUP, shade, through } from './liquid.js';
import { bodyColor, drawFannings, drawLeaf, lengthPx } from './paint-leaves.js';
import { drawSteam } from './steam.js';
import { drawStream } from './stream.js';
import { smooth } from './rng.js';

const LIT = { night: [0.92, 0.8, 0.62], day: [1, 0.98, 0.95] };
const ease = (x) => { const t = Math.min(1, Math.max(0, x)); return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; };

// The ground, the tray and the cup with its shadow, risen by `rise` (0 to 1).
function stage(ctx, { v, pal, bake }, rise) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = pal.page;
  ctx.fillRect(0, 0, v.w, v.h);
  if (rise <= 0) return;
  ctx.globalAlpha = rise;
  ctx.drawImage(bake.tray, 0, 0);
  const sc = 0.96 + 0.04 * rise;
  cupShadow(ctx, v.cx, v.cy, v.Ro * sc, pal, rise);
  ctx.setTransform(sc, 0, 0, sc, v.cx * (1 - sc), v.cy * (1 - sc));
  ctx.drawImage(bake.cup.canvas, v.cx - bake.cup.size / 2, v.cy - bake.cup.size / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

function still(room) {
  const { v, bake } = room;
  if (!bake.base) {
    bake.base = document.createElement('canvas');
    bake.base.width = v.w; bake.base.height = v.h;
    stage(bake.base.getContext('2d'), room, 1);
  }
  return bake.base;
}

export function paint(ctx, room) {
  const { v, s, pal, bake, liquid, steam, focus } = room;
  const t = s.t, R = v.R, day = pal.mode === 'day', lit = LIT[pal.mode];
  const X = (x) => v.cx + x * R, Y = (y) => v.cy + y * R;
  const rise = ease(t / 0.6);
  let clip = null;
  if (rise < 1) {
    stage(ctx, room, rise);
    if (rise <= 0) return;
  } else {
    const base = still(room);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    if (bake.fresh || t < POUR[1] + 0.45 || s.breath > 0 || room.breathed) {
      ctx.drawImage(base, 0, 0);
    } else {
      // only round the cup: the rest of the frame has not changed
      const x0 = Math.max(0, Math.floor(v.cx - 1.4 * R)), y0 = Math.max(0, Math.floor(v.cy - 1.4 * R));
      clip = [x0, y0, Math.min(v.w, Math.ceil(v.cx + 1.6 * R)) - x0, Math.min(v.h, Math.ceil(v.cy + 1.65 * R)) - y0];
      ctx.save();
      ctx.beginPath(); ctx.rect(...clip); ctx.clip();
      ctx.drawImage(base, ...clip, ...clip);
    }
    bake.fresh = false;
    room.breathed = s.breath > 0;
  }
  if (t < 0.6 && !s.leaves.some((p) => p.kind === WORD && p.landed)) { flight(ctx, room); return; }

  const colorOf = (p, extra = 1) => bodyColor(p).map((c, i) => c * lit[i] * extra);
  const glint = `rgba(${day ? '255,252,236' : pal.light.join(',')},${day ? 0.55 : 0.7})`;
  const visible = (p) => p.landed;
  ctx.save();
  ctx.clip(bake.inner);
  // the bottom: shadows of the floating leaves, then the sunk ones, crisp
  const big = s.leaves.filter((p) => p.kind !== FAN && visible(p));
  const fans = s.leaves.filter((p) => p.kind === FAN && visible(p));
  for (const p of big) {
    if (p.sunk) continue;
    const D = depthAt(s.W, Math.hypot(p.x, p.y)) * (1 - p.z);
    if (D <= 0.05) continue;
    drawLeaf(ctx, X(p.x) + D * 0.05 * R, Y(p.y) + D * 0.065 * R, lengthPx(p, R) * 1.05, p.a, p.unroll, [24, 16, 18], p.seed,
      { alpha: (day ? 0.16 : 0.26) * Math.min(1, D), ink: 0 });
  }
  for (const p of big) if (p.sunk) drawLeaf(ctx, X(p.x), Y(p.y), lengthPx(p, R), p.a, p.unroll, colorOf(p), p.seed, { ink: 0.3 });
  drawFannings(ctx, fans.filter((p) => p.sunk), X, Y, R, v.dpr, 0, 2, (i) => (i ? 'rgba(74,52,32,0.9)' : 'rgba(96,104,50,0.85)'));
  // the tea
  if (t > POUR[0]) {
    shade(liquid.L, s, pal);
    liquid.tctx.putImageData(new ImageData(liquid.L.trans, liquid.L.n, liquid.L.n), 0, 0);
    liquid.actx.putImageData(new ImageData(liquid.L.add, liquid.L.n, liquid.L.n), 0, 0);
    const span = SPAN_CUP * R;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(liquid.trans, v.cx - span, v.cy - span, span * 2, span * 2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(liquid.add, v.cx - span, v.cy - span, span * 2, span * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
  // leaves on their way down, tinted by the tea over them; then the ones afloat
  for (const p of big) {
    if (p.sunk || p.z <= 0.02) continue;
    const D = depthAt(s.W, Math.hypot(p.x, p.y));
    drawLeaf(ctx, X(p.x), Y(p.y), lengthPx(p, R), p.a, p.unroll, through(s, colorOf(p), p.x, p.y, D * p.z, pal, sample), p.seed);
  }
  drawFannings(ctx, fans.filter((p) => !p.sunk), X, Y, R, v.dpr, 0, 0.99, (i) => (i ? 'rgba(60,48,30,0.95)' : 'rgba(70,84,40,0.95)'));
  for (const p of big) {
    if (p.sunk || p.z > 0.02) continue;
    drawLeaf(ctx, X(p.x), Y(p.y), lengthPx(p, R), p.a, p.unroll, colorOf(p, 1.12), p.seed, { ink: 0.55, glint });
  }
  if (focus) {
    const p = s.leaves.find((q) => q === focus);
    if (p) drawLeaf(ctx, X(p.x), Y(p.y), lengthPx(p, R), p.a, p.unroll, colorOf(p), p.seed, { ring: pal.cream, alpha: 0 });
  }
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // what is still falling in, seen from above: big, then smaller as it drops, its shadow closing on it
  for (const p of s.leaves) {
    if (p.landed || p.kind === WORD || t < p.drop - 0.3) continue;
    const k = (p.drop - t) / 0.3, size = (p.kind === FAN ? 3 * v.dpr : lengthPx(p, R)) * (1 + 1.3 * k);
    const x = X(p.x) - k * 0.06 * R, y = Y(p.y) - k * 0.1 * R;
    drawLeaf(ctx, x + k * 0.14 * R, y + k * 0.18 * R, size, p.a + k * 2, 0, [20, 14, 16], p.seed, { alpha: 0.18 * (1 - k), ink: 0 });
    drawLeaf(ctx, x, y, size, p.a + k * 2, 0, colorOf(p, 1.12), p.seed, { alpha: Math.min(1, (1 - k) * 2.5), glint });
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawStream(ctx, s, v, pal);
  drawSteam(ctx, steam, v, pal);
  if (s.breath > 0 && !day) {
    // the lantern breathes once: its light on the tray swells a few percent and settles
    const g = ctx.createRadialGradient(v.cx - 2.1 * R, v.cy - 2.5 * R, 0, v.cx - 2.1 * R, v.cy - 2.5 * R, 4.2 * R);
    g.addColorStop(0, `rgba(255,216,146,${s.breath * 0.9})`); g.addColorStop(1, 'rgba(255,216,146,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, v.w, v.h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (clip) ctx.restore();
}

// The word-leaf, still falling from the sentence on the homepage into the empty cup.
function flight(ctx, room) {
  const { v, s, pal } = room;
  const p = s.leaves.find((q) => q.kind === WORD);
  const k = smooth(0, 1, s.t / 0.6);
  const f = p.from || [0.5, -0.04];
  const fx = f[0] * v.w, fy = f[1] * v.h, tx = v.cx + p.x * v.R, ty = v.cy + p.y * v.R;
  const x = fx + (tx - fx) * k + Math.sin(k * Math.PI * 2.2) * 14 * v.dpr * (1 - k);
  const y = fy + (ty - fy) * k;
  const size = 9 * v.dpr + (lengthPx(p, v.R) - 9 * v.dpr) * k;
  const lit = LIT[pal.mode];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawLeaf(ctx, x + (1 - k) * 0.08 * v.R, y + (1 - k) * 0.1 * v.R, size, p.a + (1 - k) * 3, 0, [20, 14, 16], p.seed, { alpha: 0.2 * k, ink: 0 });
  drawLeaf(ctx, x, y, size, p.a + (1 - k) * 3, 0, bodyColor(p).map((c, i) => c * (0.4 + 0.6 * lit[i]) * 1.15), p.seed,
    { glint: `rgba(${pal.light.join(',')},0.8)`, ink: 0.4 });
}
