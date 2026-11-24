// Hand-drawn brush digits 0 to 9, as strokes of [x, y, width] in a box one unit tall (y down, x from 0 to 1 of the
// digit's own width), smoothed through Catmull-Rom and sampled along their length. The leaves settle on these slots
// to write the next entry's number, upright on screen; the slip's seal carves the same strokes (seal.js).

const D = {
  0: [[[0.62, 0.05, 0.7], [0.35, 0.04, 0.85], [0.12, 0.2, 1], [0.04, 0.5, 1], [0.13, 0.8, 0.95], [0.42, 0.97, 0.85],
    [0.76, 0.88, 0.8], [0.95, 0.55, 0.85], [0.9, 0.22, 0.75], [0.7, 0.06, 0.6], [0.5, 0.07, 0.4]]],
  1: [[[0.22, 0.2, 0.55], [0.56, 0.02, 0.9], [0.57, 0.5, 1], [0.54, 0.98, 0.8]]],
  2: [[[0.08, 0.25, 0.7], [0.3, 0.04, 0.9], [0.7, 0.04, 0.9], [0.9, 0.25, 0.85], [0.75, 0.52, 0.9], [0.4, 0.78, 1],
    [0.06, 0.97, 1], [0.5, 0.95, 0.85], [0.96, 0.96, 0.6]]],
  3: [[[0.1, 0.12, 0.7], [0.45, 0.02, 0.85], [0.85, 0.15, 0.9], [0.75, 0.4, 0.85], [0.42, 0.48, 0.7], [0.8, 0.56, 0.85],
    [0.94, 0.78, 0.95], [0.6, 0.98, 0.85], [0.08, 0.88, 0.6]]],
  4: [[[0.62, 0.04, 0.8], [0.3, 0.4, 0.95], [0.04, 0.7, 1], [0.5, 0.7, 0.9], [0.98, 0.68, 0.6]],
    [[0.73, 0.3, 0.8], [0.73, 0.65, 1], [0.71, 0.98, 0.85]]],
  5: [[[0.92, 0.05, 0.55], [0.55, 0.05, 0.85], [0.22, 0.07, 0.95]],
    [[0.22, 0.07, 0.95], [0.17, 0.46, 1], [0.45, 0.38, 0.85], [0.82, 0.46, 0.9], [0.96, 0.72, 1], [0.76, 0.94, 0.9],
      [0.4, 0.99, 0.75], [0.06, 0.86, 0.55]]],
  6: [[[0.82, 0.04, 0.6], [0.45, 0.18, 0.9], [0.12, 0.5, 1], [0.1, 0.8, 1], [0.4, 0.98, 0.9], [0.8, 0.88, 0.85],
    [0.9, 0.62, 0.85], [0.6, 0.46, 0.8], [0.25, 0.55, 0.7], [0.12, 0.7, 0.5]]],
  7: [[[0.06, 0.06, 0.7], [0.5, 0.04, 0.9], [0.95, 0.05, 0.9], [0.7, 0.4, 1], [0.45, 0.98, 0.8]]],
  8: [[[0.72, 0.1, 0.6], [0.45, 0.03, 0.85], [0.18, 0.14, 0.9], [0.22, 0.36, 0.95], [0.55, 0.5, 1], [0.88, 0.68, 1],
    [0.8, 0.92, 0.95], [0.45, 0.98, 0.9], [0.12, 0.86, 0.9], [0.18, 0.64, 0.95], [0.55, 0.48, 1], [0.82, 0.3, 0.9],
    [0.78, 0.1, 0.7], [0.55, 0.04, 0.5]]],
  9: [[[0.85, 0.3, 0.8], [0.6, 0.06, 0.9], [0.25, 0.08, 0.9], [0.1, 0.32, 0.95], [0.35, 0.52, 0.9], [0.75, 0.45, 0.85],
    [0.88, 0.3, 0.9], [0.85, 0.65, 1], [0.6, 0.98, 0.75]]],
};

export const ASPECT = 0.62;     // a digit's width over its height
const GAP = 0.17;               // between digits, in heights

// A stroke's control points through a uniform Catmull-Rom spline, densely: [[x, y, w], ...].
function spline(pts, per = 18) {
  const out = [];
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const c = (a, b, cc, d) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), p1[2] + (p2[2] - p1[2]) * t]);
    }
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}

// The number's strokes in cup units, centred on the cup, `width` across: [{ pts: [[x, y, w]], len, cum }].
export function numberStrokes(digits, width = 0.92) {
  const n = digits.length;
  const h = width / (n * ASPECT + (n - 1) * GAP);
  const x0 = -width / 2, y0 = -h / 2;
  const strokes = [];
  [...digits].forEach((ch, i) => {
    for (const s of D[ch] || []) {
      const pts = spline(s).map(([x, y, w]) => [x0 + (i * (ASPECT + GAP) + x * ASPECT) * h, y0 + y * h, w]);
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      strokes.push({ pts, cum, len: cum[cum.length - 1], digit: i });
    }
  });
  return { strokes, height: h };
}

// The point at arc length `s` along a stroke, with its tangent angle.
export function pointAt(stroke, s) {
  const { pts, cum } = stroke;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < s) i++;
  const a = pts[i - 1], b = pts[i];
  const t = (s - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
  return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, w: a[2] + (b[2] - a[2]) * t,
    angle: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}

// `count` slots spread evenly along all strokes, in reading order, each nudged across its stroke by the brush
// width (seeded): [{ x, y, angle, w }].
export function sampleSlots(digits, count, rng, thick = 0.08) {
  const { strokes } = numberStrokes(digits);
  const total = strokes.reduce((n, s) => n + s.len, 0);
  const step = total / count;
  const slots = [];
  let carry = step * 0.5;
  for (const st of strokes) {
    let s = carry;
    for (; s < st.len; s += step) {
      const j = (rng() - 0.5) * step * 0.6;
      const p = pointAt(st, Math.min(st.len, Math.max(0, s + j)));
      const across = (rng() - 0.5) * thick * (0.45 + 0.55 * p.w);
      slots.push({ x: p.x - Math.sin(p.angle) * across, y: p.y + Math.cos(p.angle) * across, angle: p.angle, w: p.w });
    }
    carry = s - st.len;
  }
  while (slots.length > count) slots.splice(Math.floor(rng() * slots.length), 1);
  while (slots.length < count) {
    const st = strokes[Math.floor(rng() * strokes.length)];
    const p = pointAt(st, rng() * st.len);
    slots.push({ x: p.x, y: p.y, angle: p.angle, w: p.w });
  }
  return slots;
}
