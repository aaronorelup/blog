// The pour, seen from above: a thread of hot water from an unseen kettle off the upper left. It narrows as it
// falls (continuity: width ~ 1 / sqrt(fall)), wobbles, beads near its end (a hint of Rayleigh-Plateau), lands
// off-centre on a tangent and casts a shadow away from the light. Drawn in device px; s is the brew (brew.js).
import { POUR, pourPoint } from './brew.js';
import { smooth } from './rng.js';

const pts = (n) => Array.from({ length: n }, () => [0, 0]);
const L = pts(48), Rt = pts(48);

export function drawStream(ctx, s, v, pal) {
  const t = s.t;
  if (t < POUR[0] - 0.02 || t > POUR[1] + 0.4) return;
  const P = pourPoint(s), R = v.R;
  const px = v.cx + P.x * R, py = v.cy + P.y * R;
  // back along the stream to beyond the frame's edge
  const mx = -P.dx, my = -P.dy, ks = [];
  if (mx < 0) ks.push(px / -mx); if (mx > 0) ks.push((v.w - px) / mx);
  if (my < 0) ks.push(py / -my); if (my > 0) ks.push((v.h - py) / my);
  const reach = Math.min(...ks, 4 * R) + 60 * v.dpr;
  const sx = px - P.dx * reach, sy = py - P.dy * reach;
  const head = smooth(POUR[0] - 0.02, POUR[0] + 0.2, t), tail = smooth(POUR[1] - 0.04, POUR[1] + 0.34, t);
  if (head <= tail) return;
  const thin = 1 - 0.6 * smooth(POUR[1] - 0.6, POUR[1], t);
  const w0 = 0.12 * R * thin, n = L.length;
  const nx = -P.dy, ny = P.dx;                     // across the stream
  const lit = Math.sign(nx * -0.6 + ny * -0.78) || 1;   // the side that faces the lamp
  for (let i = 0; i < n; i++) {
    const u = tail + (head - tail) * (i / (n - 1));
    const bow = Math.sin(Math.PI * u) * 0.05 * reach;
    const sway = Math.sin(u * 11 - t * 14) * 0.006 * R * u + Math.sin(t * 23 + u * 5) * 0.002 * R;
    const bead = 1 + 0.24 * Math.sin(u * 52 - t * 44) * smooth(0.55, 1, u);
    const w = w0 / Math.sqrt(1 + 3 * u) * (1.15 - 0.15 * u) * bead;
    const cx = sx + (px - sx) * u + nx * (bow + sway), cy = sy + (py - sy) * u + ny * (bow + sway);
    L[i][0] = cx + nx * w / 2; L[i][1] = cy + ny * w / 2;
    Rt[i][0] = cx - nx * w / 2; Rt[i][1] = cy - ny * w / 2;
  }
  const body = (ox, oy, k) => {
    const p = new Path2D();
    p.moveTo(L[0][0] + ox(0) * k, L[0][1] + oy(0) * k);
    for (let i = 1; i < n; i++) p.lineTo(L[i][0] + ox(i) * k, L[i][1] + oy(i) * k);
    for (let i = n - 1; i >= 0; i--) p.lineTo(Rt[i][0] + ox(i) * k, Rt[i][1] + oy(i) * k);
    p.closePath();
    return p;
  };
  const day = pal.mode === 'day';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // its shadow, further from it the higher the water still is; only once the water has landed, so it never runs
  // ahead of the stream
  const off = (i) => (1 - (tail + (head - tail) * i / (n - 1))) * R;
  ctx.globalAlpha = smooth(0.9, 1, head);
  ctx.fillStyle = day ? 'rgba(70,45,30,0.12)' : 'rgba(6,6,14,0.22)';
  if (ctx.globalAlpha > 0) ctx.fill(body((i) => off(i) * 0.16, (i) => off(i) * 0.2, 1));
  ctx.globalAlpha = 1;
  // glass: nearly clear in the middle, a soft sheen across it, a bright thread on the lamp's side and a dark
  // refracted edge on the other
  ctx.fillStyle = day ? 'rgba(255,252,240,0.2)' : 'rgba(255,226,170,0.14)';
  ctx.fill(body(() => 0, () => 0, 1));
  const edge = (side, at, style, width) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = side > 0 ? L[i] : Rt[i], b = side > 0 ? Rt[i] : L[i];
      const x = a[0] + (b[0] - a[0]) * at, y = a[1] + (b[1] - a[1]) * at;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
  };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const glow = day ? '255,255,250' : pal.light.join(',');
  edge(lit, 0.32, `rgba(${glow},0.16)`, w0 * 0.35);
  edge(lit, 0.24, `rgba(${glow},0.85)`, 1.4 * v.dpr);
  edge(-lit, 0.08, day ? 'rgba(90,70,50,0.35)' : 'rgba(20,14,20,0.5)', 1.2 * v.dpr);
  edge(lit, 0.04, day ? 'rgba(90,70,50,0.2)' : 'rgba(20,14,20,0.3)', 1 * v.dpr);
  // where it lands: a churned crown of small bubbles, while it still falls
  if (head > 0.98 && tail < 0.95) {
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4 + t * 9, rr = (0.025 + 0.03 * ((i * 0.37 + t * 3) % 1)) * R;
      ctx.beginPath();
      ctx.arc(px + Math.cos(a) * rr, py + Math.sin(a) * rr, (1 + (i % 3)) * v.dpr, 0, Math.PI * 2);
      ctx.fillStyle = day ? 'rgba(255,255,250,0.55)' : 'rgba(255,236,196,0.45)';
      ctx.fill();
    }
  }
}
