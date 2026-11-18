// What falls into the cup, seen from straight above, and the rings it leaves. The word-leaf first: it starts where
// the homepage let go of it (#from: the point, the angle and the size it had grown to as it lifted toward the guest)
// and falls away from the eye into the tea, shrinking in perspective, rocking side to side as a leaf does, its soft
// shadow closing on it and sharpening as it nears, until it meets the hot water with a ring and a plip. Then the
// archive, one rolled leaf per entry, oldest first, each dropping from above the rim with its own short shadow.
// Drawn in device px; nothing here changes the brew.
import { RISE } from './brew.js';
import { FAN, WORD, WORD_LAND } from './leaves.js';
import { bodyColor, drawLeaf, lengthPx, leafShadow } from './paint-leaves.js';
import { smooth } from './rng.js';

const FALL = 0.42;                     // seconds an archive leaf is in the air
const SWINGS = 1.6;                    // half-periods of the word-leaf's rocking on its way down
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// The word-leaf's pose at sim time t: where it is (device px), its size and angle, how tilted (squash), and its
// height over the tea (1 where it starts, 0 on the water).
export function wordPose(room, t) {
  const { v, s, from } = room, p = s.leaves[0];
  const s1 = lengthPx(p, v.R);
  const f = from || { x: 0.5, y: -0.06, a: 0.3, size: 0 };
  const s0 = f.size ? f.size * v.dpr : s1 * 3.5, G = Math.max(1.01, s0 / s1);
  // it starts from rest (it hung there a moment) and settles onto the water as gently
  const tl = Math.min(1, Math.max(0, t / WORD_LAND)), k = ease(tl), h = 1 - k;
  // it falls away from the eye: apparent size goes as 1 / (the eye's height - the leaf's height)
  const scale = 1 / (1 - (1 - 1 / G) * h);
  const tx = v.cx + p.x * v.R, ty = v.cy + p.y * v.R, fx = f.x * v.w, fy = f.y * v.h;
  // and glides there on a shallow arc, rocking side to side across its path as a falling leaf does
  const dx = tx - fx, dy = ty - fy, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
  const bow = 0.14 * dl * (fx < tx ? 1 : -1), mx = (fx + tx) / 2 + nx * bow, my = (fy + ty) / 2 + ny * bow;
  const ph = tl * Math.PI * SWINGS, rock = Math.sin(ph) * smooth(0, 0.25, tl) * h;
  const sway = rock * 0.16 * v.R;
  const a1 = p.a, a0 = f.a;
  let da = a1 - a0; da = Math.atan2(Math.sin(da), Math.cos(da));
  const u = 1 - k;
  return {
    x: u * u * fx + 2 * u * k * mx + k * k * tx + nx * sway, y: u * u * fy + 2 * u * k * my + k * k * ty + ny * sway,
    size: s1 * scale, a: a0 + da * ease(k) + rock * 0.45, squash: 1 - 0.42 * Math.abs(rock), h, k,
  };
}

// The word-leaf in the air, with its shadow on whatever is under it. `early` is the frame before the room is baked:
// only the leaf, as the homepage left it.
export function drawWordLeaf(ctx, room, t, early = false) {
  const { v, pal } = room, p = room.s.leaves[0], P = wordPose(room, t), day = pal.mode === 'day';
  const lit = day ? [1, 0.98, 0.95] : [0.92, 0.8, 0.62], warm = smooth(0, RISE * 1.6, t);
  const rgb = bodyColor(p).map((c, i) => c * (1 + (lit[i] * 1.12 - 1) * warm));
  // its shadow: as the homepage drew it at first, then thrown by the lamp, far and soft when high, close and sharp
  const toLamp = smooth(0, 0.35, t), dpr = v.dpr;
  const ox = (10 + (P.h * 0.26 * v.R / dpr - 10) * toLamp) * dpr, oy = (14 + (P.h * 0.34 * v.R / dpr - 14) * toLamp) * dpr;
  const blur = (7 + (1.5 + 20 * P.h - 7) * toLamp) * dpr;
  const alpha = 0.32 + (0.16 + 0.34 * (1 - P.h) - 0.32) * toLamp;
  leafShadow(ctx, P.x, P.y, P.size * (1 + 0.15 * P.h * toLamp), P.a, p.seed, { color: `rgba(${day ? '70,45,30' : '8,6,14'},${alpha})`,
    blur, ox, oy, squash: P.squash, far: v.w * 3 });
  drawLeaf(ctx, P.x, P.y, P.size, P.a, 1, rgb, p.seed, { ink: 0.55, squash: P.squash,
    glint: early ? null : `rgba(${pal.light.join(',')},0.7)` });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// The archive and the dust still in the air: each starts higher (bigger, further out from the middle, toward the
// pot up on the left) and drops onto its place, its shadow sliding in under it.
export function drawFalling(ctx, room, colorOf) {
  const { v, s, pal } = room, t = s.t, R = v.R, day = pal.mode === 'day';
  const shade = day ? [70, 45, 30] : [12, 8, 14];
  const dust = new Path2D();
  for (const p of s.leaves) {
    if (p.landed || p.kind === WORD || t < p.drop - FALL) continue;
    const k = (p.drop - t) / FALL, gx = v.cx + p.x * R, gy = v.cy + p.y * R;
    const out = 1 + 0.22 * k, x = v.cx + (gx - v.cx) * out - k * 0.08 * R, y = v.cy + (gy - v.cy) * out - k * 0.12 * R;
    if (p.kind === FAN) {
      const w = (2 + 2.4 * k) * v.dpr;
      dust.moveTo(x + w, y); dust.arc(x, y, w * 0.5, 0, Math.PI * 2);
      continue;
    }
    const size = lengthPx(p, R) * (1 + 1.1 * k), spin = p.a + k * 2.2;
    drawLeaf(ctx, gx + k * 0.1 * R, gy + k * 0.13 * R, size * (1 + 0.15 * k), spin, 0, shade, p.seed,
      { alpha: (day ? 0.16 : 0.3) * (1 - k * 0.7) * Math.min(1, (1 - k) * 4), ink: 0 });
    drawLeaf(ctx, x, y, size, spin, 0, colorOf(p, p.newest ? 1.22 : 1.1), p.seed,
      { alpha: Math.min(1, (1 - k) * 3), ink: 0.5, glint: `rgba(${day ? '255,252,236' : pal.light.join(',')},${p.newest ? 0.9 : 0.6})` });
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = day ? 'rgba(92,80,44,0.8)' : 'rgba(84,80,40,0.85)';
  ctx.fill(dust);
}

// The rings the word-leaf leaves on the tea: two, one after the other, each a lit crest on the lamp's side and a
// dark trough beside it, spreading and fading over a second and a half.
export function drawRings(ctx, room) {
  const { v, s, pal } = room, day = pal.mode === 'day';
  const hi = day ? '255,252,240' : pal.light.join(','), lo = day ? '60,40,25' : '18,10,8';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const ring of s.rings) {
    const x = v.cx + ring.x * v.R, y = v.cy + ring.y * v.R;
    for (let j = 0; j < 2; j++) {
      const u = (s.t - ring.t - j * 0.2) / 1.6;
      if (u <= 0 || u >= 1) continue;
      const r = (0.03 + 0.5 * u ** 0.6) * v.R, a = 0.7 * (1 - u) ** 1.4 * (1 - j * 0.3);
      ctx.lineWidth = (1.8 - j * 0.5) * (1 - 0.5 * u) * v.dpr;
      ctx.strokeStyle = `rgba(${lo},${a * 0.6})`;
      ctx.beginPath(); ctx.arc(x + v.dpr, y + 1.3 * v.dpr, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${hi},${a})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    }
  }
}
