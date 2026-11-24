// The slip's seal: a square of vermilion ink stamped on washi, the number carved out of it in the same brush
// strokes the leaves settle on (glyphs.js), with a carved border and the speckle of a real stamp.
import { numberStrokes } from './glyphs.js';
import { mulberry32, noise2 } from './rng.js';
import { TEA } from './palette.js';

export function drawSeal(cv, digits, seed) {
  const css = cv.clientWidth || 44, dpr = Math.min(2, window.devicePixelRatio || 1), S = Math.round(css * dpr);
  cv.width = S; cv.height = S;
  const ctx = cv.getContext('2d'), rng = mulberry32(seed + 5);
  ctx.clearRect(0, 0, S, S);
  // the stamp: a square, its edges a little chewed
  const edge = (i, n) => (noise2(i * 0.9, n, seed) - 0.5) * S * 0.035;
  ctx.beginPath();
  const m = S * 0.06, side = S - 2 * m, steps = 12;
  for (let k = 0; k < 4; k++) for (let i = 0; i < steps; i++) {
    const t = i / steps, e = edge(i + k * steps, 1);
    const [x, y] = [[m + side * t, m + e], [S - m + e, m + side * t], [S - m - side * t, S - m + e], [m + e, S - m - side * t]][k];
    if (!k && !i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = TEA.vermilion;
  ctx.fill();
  // carved away: a border line and the digits
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = S * 0.035;
  ctx.strokeRect(m + S * 0.07, m + S * 0.07, side - S * 0.14, side - S * 0.14);
  const { strokes } = numberStrokes(digits, 1);
  const scale = S * 0.62, cx = S / 2, cy = S / 2;
  for (const st of strokes) {
    for (let i = 1; i < st.pts.length; i++) {
      const [x0, y0] = st.pts[i - 1], [x1, y1, w] = st.pts[i];
      ctx.lineWidth = S * (0.035 + 0.04 * w);
      ctx.beginPath(); ctx.moveTo(cx + x0 * scale, cy + y0 * scale); ctx.lineTo(cx + x1 * scale, cy + y1 * scale); ctx.stroke();
    }
  }
  // the ink took unevenly: specks of paper show through
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.25 + rng() * 0.6;
    ctx.beginPath(); ctx.arc(m + rng() * side, m + rng() * side, (0.3 + rng() * 1.1) * dpr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
