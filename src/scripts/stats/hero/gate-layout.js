// The Gate's geometry, with no DOM: where the road runs, where each pile stands, how many pages
// one dot stands for, and which slot every dot lands in. Pure, so it runs under `node --test`
// (gate-layout.test.mjs) and so a resize mid-replay is just "lay it out again and carry on".
//
// Two shapes share one model:
// - wide (stage 720px and up): a garden road left to right, four lanterns, five piles standing on
//   one baseline, the people pile in the tea-house doorway at the end;
// - tall (phones): a rail down the left edge, one row per pile, each pile a three-dot band.
// In both, every pile uses the same unit and the same pitch, so heights (or band lengths)
// compare directly. That is the whole point of a unit chart.

export const KIND_ORDER = ['bot', 'scanner', 'agent', 'stale', 'person'];
export const LADDER = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
export const WIDE_MIN = 720;
const WIDE_BUDGET = 1600;   // dots, wide stage (canvas cost and legibility both cap it)
const TALL_BUDGET = 700;
const CENTRES = [0.14, 0.30, 0.46, 0.62, 0.78];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Fallback for agg.largestRemainder, so this file stands alone in tests. The hero passes the
// real one in; both give Σ = target and at least one dot to every non-zero value when they can.
export function largestRemainderLocal(values, target) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (!sum || target <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / sum) * target);
  const out = raw.map(Math.floor);
  const nz = values.filter((v) => v > 0).length;
  if (target >= nz) values.forEach((v, i) => { if (v > 0 && out[i] === 0) out[i] = 1; });
  let left = target - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let j = 0; left > 0 && j < order.length * 4; j++) {
    const i = order[j % order.length][1];
    if (values[i] > 0) { out[i]++; left--; }
  }
  // Forcing the small ones up can overshoot: take the excess back from the biggest piles.
  while (left < 0) {
    let big = 0;
    out.forEach((v, i) => { if (v > out[big]) big = i; });
    if (out[big] <= 1) break;
    out[big]--; left++;
  }
  return out;
}

/**
 * The parts of the stage that don't depend on the unit. W is the stage width in CSS px; maxH
 * (wide only) is the most height the stage may take and still have its numbers row and the
 * button row under it above the window's bottom edge.
 */
export function frame(W, { maxH = Infinity } = {}) {
  W = Math.max(240, Math.floor(W));
  if (W >= WIDE_MIN) {
    // Shorter than the first spec's 0.34 W (320 to 380): at 340 the piles, their labels and the
    // first row of question chips all fit above a 1440x900 laptop's fold, and the tallest
    // fixture pile still has room under the road at a 6px pitch.
    // The width alone doesn't know the window: a 1280x720 laptop has the same stage width as a
    // 1440x900 one and 180px less height, and at 340 every pile number sat behind the fixed
    // footer. So a short window takes height off the stage, down to 280 (the solver then picks a
    // coarser unit so the tallest pile still fits under the road).
    const H = clamp(Math.min(Math.max(Math.round(W * 0.30), 300), Math.floor(maxH)), 280, 340);
    const yPath = 64;
    const yBase = H - 92;
    const xc = CENTRES.map((f) => Math.round(W * f));
    const wp = Math.min(Math.round(W * 0.115), 128);
    return {
      tall: false, W, H, yPath, yBase, xc, wp,
      colW: Math.round(W * 0.16),                 // a pile's hit column and label width budget
      labelW: Math.round(W * 0.15),
      torii: Math.round(W * 0.035),
      roadStart: -20, roadEnd: Math.round(W * 0.86),
      pileRoom: yBase - yPath - 36,              // the tallest pile must fit under this
    };
  }
  return { tall: true, W, bandX: 30, railX: 10, bandW: W - 34 };
}

/**
 * Pick the unit u (pages per dot) and the pitch p (px between dot centres), then the dots per
 * kind. The smallest unit that fits wins (more dots = finer truth), and for that unit the largest
 * pitch that fits (bigger dots = easier to see).
 * values: numbers in KIND_ORDER. Returns { u, p, r, dots[], crumbs[], cols? }.
 */
export function solve(f, values, { ladder = LADDER, alloc = largestRemainderLocal } = {}) {
  const total = values.reduce((a, b) => a + b, 0);
  const pick = (u, p, extra) => {
    const dots = alloc(values, Math.round(total / u));
    const crumbs = values.map(() => 0);
    values.forEach((v, i) => {
      if (v > 0 && v < u) { dots[i] = 1; crumbs[i] = Math.sqrt(v / u); }
      if (v === 0) dots[i] = 0;
    });
    return { u, p, r: 0.38 * p, dots, crumbs, total, ...extra };
  };
  if (!total) return pick(ladder[0], f.tall ? 8 : 9, f.tall ? {} : { cols: Math.floor(f.wp / 9) });

  let last = null;
  for (const u of ladder) {
    const n = Math.round(total / u);
    if (n > (f.tall ? TALL_BUDGET : WIDE_BUDGET) * 1.05) continue;   // cheap early skip
    const dots = alloc(values, n);
    values.forEach((v, i) => { if (v > 0 && v < u) dots[i] = 1; });
    const sum = dots.reduce((a, b) => a + b, 0);
    const most = Math.max(...dots);
    if (f.tall) {
      if (sum > TALL_BUDGET) continue;
      for (let p = 8; p >= 5; p--) {
        const cap = Math.floor(f.bandW / p) * 3;
        if (most <= cap) return pick(u, p);
      }
    } else {
      if (sum > WIDE_BUDGET) continue;
      for (let p = 9; p >= 5; p--) {
        const cols = Math.floor(f.wp / p);
        if (Math.ceil(most / cols) * p <= f.pileRoom) return pick(u, p, { cols });
      }
    }
    last = u;
  }
  // Nothing on the ladder fits (a freak day with millions): the biggest unit at the finest pitch.
  const u = ladder[ladder.length - 1];
  return pick(u, 5, f.tall ? {} : { cols: Math.floor(f.wp / 5) });
}

/**
 * The full layout: frame + solve + rows (tall) + where every dot lands.
 * lo: the people the counter heard, in the same unit. That many people dots (lo/u, rounded) are
 * filled; the rest of the people pile is rings: pages that only looked like a person's.
 */
export function layout(W, values, { lo = 0, ladder, alloc, maxH } = {}) {
  const f = frame(W, { maxH });
  const s = solve(f, values, { ladder, alloc });
  const g = { ...f, ...s, values };
  const p = s.p;
  g.solid = Math.max(0, Math.min(s.dots[4], Math.round(lo / s.u)));

  if (!f.tall) {
    const cols = s.cols;
    g.gridW = cols * p;
    g.piles = KIND_ORDER.map((kind, k) => {
      const n = s.dots[k];
      const rows = Math.ceil(n / cols);
      const left = f.xc[k] - g.gridW / 2;
      return {
        kind, k, n, cols, left, right: left + g.gridW,
        top: f.yBase - rows * p,
        station: { x: f.xc[k], y: f.yPath },
        hit: { x: f.xc[k] - f.colW / 2, y: f.yPath - 26, w: f.colW, h: f.H - f.yPath + 26 },
      };
    });
    const pp = g.piles[4];
    g.bracket = {
      x: pp.right + 8,
      top: pp.top,
      seam: f.yBase - (g.solid / cols) * p,
      labelX: pp.right + 18,
      labelW: f.W - 8 - (pp.right + 18),
    };
    g.path = wideRoad(f);
  } else {
    // Rows: question (13) + name line (20) + three-dot band + gap, kept tight so all five rows
    // and the reader's own button sit above the fold on a phone. The people row also carries the
    // bracket under its band.
    const top0 = 4;
    const rowH = 13 + 21 + 3 * p + 7;
    g.rowH = rowH;
    g.piles = KIND_ORDER.map((kind, k) => {
      const y = top0 + k * rowH;
      const n = s.dots[k];
      return {
        kind, k, n, y,
        lineY: y + 13,
        junction: y + 23,
        bandTop: y + 34,
        bandEnd: f.bandX + Math.ceil(n / 3) * p,
        station: { x: f.railX, y: y + 23 },
        hit: { x: 0, y, w: f.W, h: rowH },
      };
    });
    const pp = g.piles[4];
    g.bracket = {
      y: pp.bandTop + 3 * p + 8,
      seam: f.bandX + (g.solid / 3) * p,
      end: f.bandX + (s.dots[4] / 3) * p,
    };
    g.H = pp.bandTop + 3 * p + 24;
    g.path = polyline([[f.railX, -10], [f.railX, pp.junction]]);
  }
  // Arc length of each station along the road.
  g.stationS = g.piles.map((pl) => nearestS(g.path, pl.station.x, pl.station.y));
  return g;
}

/** Slot centre for the j-th dot of pile k (j counts in landing order). */
export function slotXY(g, k, j) {
  const p = g.p;
  if (!g.tall) {
    const pl = g.piles[k];
    const col = j % g.cols, row = Math.floor(j / g.cols);
    return [pl.left + p / 2 + col * p, g.yBase - p / 2 - row * p];
  }
  // Column-major: each column of three fills before the next, so a band's length is its value.
  const pl = g.piles[k];
  const col = Math.floor(j / 3), row = j % 3;
  return [g.bandX + p / 2 + col * p, pl.bandTop + p / 2 + row * p];
}

// The garden road: a very gentle meander, flattening as it reaches the doorway so the people
// walk in straight. Amplitude 3px: enough to read as a path, not enough to look wobbly.
function wideRoad(f) {
  const pts = [];
  const x0 = f.roadStart, x1 = f.xc[4];
  const lam = f.W * 0.32;
  for (let i = 0; i <= 96; i++) {
    const x = x0 + ((x1 - x0) * i) / 96;
    const damp = 1 - Math.pow(i / 96, 3);
    pts.push([x, f.yPath + 3 * Math.sin((2 * Math.PI * (x - x0)) / lam) * damp]);
  }
  return polyline(pts);
}

/** y of the road at x (for the art: stones and lanterns sit on it). */
export function roadY(g, x) {
  if (g.tall) return 0;
  const x0 = g.roadStart, x1 = g.xc[4];
  if (x >= x1) return g.yPath;
  const i = Math.max(0, (x - x0) / (x1 - x0));
  const lam = g.W * 0.32;
  const damp = 1 - Math.pow(Math.min(1, i), 3);
  return g.yPath + 3 * Math.sin((2 * Math.PI * (x - x0)) / lam) * damp;
}

/**
 * Arc-length lookup table: 256 samples, evenly spaced in distance, each with a unit normal.
 * Walking dots read position and normal from it with one multiply and one lerp.
 */
export function polyline(pts, samples = 256) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const len = cum[cum.length - 1] || 1;
  const xs = new Float32Array(samples + 1), ys = new Float32Array(samples + 1);
  const nx = new Float32Array(samples + 1), ny = new Float32Array(samples + 1);
  let seg = 1;
  for (let i = 0; i <= samples; i++) {
    const s = (len * i) / samples;
    while (seg < pts.length - 1 && cum[seg] < s) seg++;
    const a = pts[seg - 1], b = pts[seg];
    const sl = cum[seg] - cum[seg - 1] || 1;
    const t = Math.max(0, Math.min(1, (s - cum[seg - 1]) / sl));
    xs[i] = a[0] + (b[0] - a[0]) * t;
    ys[i] = a[1] + (b[1] - a[1]) * t;
    const dx = (b[0] - a[0]) / sl, dy = (b[1] - a[1]) / sl;
    nx[i] = -dy; ny[i] = dx;
  }
  return { len, samples, xs, ys, nx, ny };
}

/** Position and normal at arc length s (clamped to the path). Writes into out[0..3]. */
export function at(path, s, out) {
  const f = Math.max(0, Math.min(1, s / path.len)) * path.samples;
  const i = Math.min(path.samples - 1, f | 0), t = f - i;
  out[0] = path.xs[i] + (path.xs[i + 1] - path.xs[i]) * t;
  out[1] = path.ys[i] + (path.ys[i + 1] - path.ys[i]) * t;
  out[2] = path.nx[i];
  out[3] = path.ny[i];
  return out;
}

function nearestS(path, x, y) {
  let best = 0, bd = Infinity;
  for (let i = 0; i <= path.samples; i++) {
    const d = (path.xs[i] - x) ** 2 + (path.ys[i] - y) ** 2;
    if (d < bd) { bd = d; best = i; }
  }
  return (path.len * best) / path.samples;
}

/** Which pile is under (x, y)? -1 for none. */
export function hitTest(g, x, y) {
  for (const pl of g.piles) {
    const h = pl.hit;
    if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return pl.k;
  }
  return -1;
}
