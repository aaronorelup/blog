// One frame of the room, in device px: the ground, the tray rising out of it, the cup and its shadow (once risen,
// copied from one still picture, and only round the cup unless something outside it moves), then inside the rim the
// bottom and its sunk leaves, the tea over them (liquid.js: 'multiply' what it lets through, 'lighter' what it adds),
// the word-leaf's rings, the leaves still sinking (tinted by the tea above them) and the ones afloat, then what falls
// in (fall.js), the pour, the steam, a named leaf's thread to its label, and over it all the word-leaf on its way down.
// Nothing here changes the brew.
import { POUR, RISE } from './brew.js';
import { cupShadow } from './cup.js';
import { sample } from './dye.js';
import { drawFalling, drawRings, drawWordLeaf } from './fall.js';
import { ENTRY, FAN, WORD, WORD_LAND, depthAt } from './leaves.js';
import { SPAN_CUP, shade, through } from './liquid.js';
import { bodyColor, drawFannings, drawLeaf, lengthPx } from './paint-leaves.js';
import { drawSteam } from './steam.js';
import { drawStream } from './stream.js';

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

// The first frame, before anything is baked: the ground and the word-leaf just as the homepage let go of it.
export function paintEarly(ctx, room, leaf = true) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = room.pal.page;
  ctx.fillRect(0, 0, room.v.w, room.v.h);
  if (leaf && !room.reduce) drawWordLeaf(ctx, room, 0, true);
}

export function paint(ctx, room) {
  const { v, s, pal, bake, liquid, steam, focus } = room;
  const t = s.t, R = v.R, day = pal.mode === 'day', lit = LIT[pal.mode];
  const X = (x) => v.cx + x * R, Y = (y) => v.cy + y * R;
  const rise = ease(t / RISE);
  let clip = null;
  if (rise < 1) {
    stage(ctx, room, rise);
  } else {
    const base = still(room);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    if (bake.fresh || t < Math.max(POUR[1], WORD_LAND) + 0.45 || s.breath > 0 || room.breathed || focus || room.unfocused) {
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
    room.unfocused = !!focus;
  }

  const colorOf = (p, extra = 1) => bodyColor(p).map((c, i) => c * lit[i] * extra * (p.kind === WORD ? 1.14 : 1));
  const glint = `rgba(${day ? '255,252,236' : pal.light.join(',')},${day ? 0.55 : 0.7})`;
  const visible = (p) => p.landed;
  ctx.save();
  ctx.clip(bake.inner);
  // the bottom: shadows of the floating leaves, then the sunk ones, crisp
  // the word-leaf last, so it lies on top of any leaf it touches
  const big = s.leaves.filter((p) => p.kind === ENTRY && visible(p));
  if (s.leaves[0].landed) big.push(s.leaves[0]);
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
  // the tea (a slow device shades it every other frame)
  if (t > POUR[0]) {
    room.frameNo = (room.frameNo || 0) + 1;
    if (!room.thin || room.frameNo % 2 || !liquid.shaded) {
      shade(liquid.L, s, pal);
      liquid.tctx.putImageData(liquid.timg, 0, 0);
      liquid.actx.putImageData(liquid.aimg, 0, 0);
      liquid.shaded = true;
    }
    const span = SPAN_CUP * R;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(liquid.trans, v.cx - span, v.cy - span, span * 2, span * 2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(liquid.add, v.cx - span, v.cy - span, span * 2, span * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (s.rings.length) drawRings(ctx, room);
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
  if (focus) drawLeaf(ctx, X(focus.x), Y(focus.y), lengthPx(focus, R), focus.a, focus.unroll, colorOf(focus), focus.seed, { ring: pal.cream, alpha: 0 });
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawFalling(ctx, room, colorOf);
  drawStream(ctx, s, v, pal);
  drawSteam(ctx, steam, v, pal);
  if (s.breath > 0 && !day) {
    // the lantern breathes once: its light on the tray swells a few percent and settles
    const g = ctx.createRadialGradient(v.cx - 2.1 * R, v.cy - 2.5 * R, 0, v.cx - 2.1 * R, v.cy - 2.5 * R, 4.2 * R);
    g.addColorStop(0, `rgba(255,216,146,${s.breath * 0.9})`); g.addColorStop(1, 'rgba(255,216,146,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, v.w, v.h);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (focus && room.labelAt) thread(ctx, room, X(focus.x), Y(focus.y));
  if (!s.leaves[0].landed) drawWordLeaf(ctx, room, t);
  if (clip) ctx.restore();
}

// A named leaf's thread to its label: a hairline from the leaf to the paper's nearest edge, a dot on the leaf.
function thread(ctx, room, x, y) {
  const { v, pal } = room, day = pal.mode === 'day';
  const ax = room.labelAt.x * v.dpr, ay = room.labelAt.y * v.dpr;
  const color = day ? 'rgba(35,31,43,0.72)' : 'rgba(241,230,208,0.78)';
  const mx = (x + ax) / 2 + (ay - y) * 0.08, my = (y + ay) / 2 - (ax - x) * 0.08;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = color; ctx.lineWidth = v.dpr; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, ax, ay); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 2 * v.dpr, 0, Math.PI * 2); ctx.fill();
}
