// Where the level row of five stands in a section that prints words left of it, above it and under it (the line-up,
// the agents table): right of a 270 px gutter and centred in what is left, never larger than the window's height can
// hold, and moved down or up each frame so the words above it and the table under it both clear it (level(), which
// best at uses too, for its own stop).
import { Vector3 } from 'three';

const GUT = 270;        // px kept left of the first stack: the axis, the table's row heads
const EDGE = 84;        // px kept right of the last stack: its answer never touches the window's edge
const SPAN = 19.2;      // the five stacks, edge to edge, in world units
const TALL = 1.3;       // the row is never wider than this many window heights: a short wide window keeps room for words

const v = new Vector3();

// Stand the row a camera stop frames (its `cyd`) with its highest piece, a lid plate, at or under `top` px, or, when
// there is room to spare above, with the ground its answers hang from at or above `feet` px. The words above win
// where both cannot hold. With room both ways the ground rests at `rest` of the window's height (the row stands on
// the floor, not in mid-air).
// `extra` is a height in world units above the lid plates that must clear the words too (the raised boards and their
// signs, scene/set.js). On a phone the same offset is the stop's `cy`.
export function level(ctx, stop, top, feet = Infinity, rest = 0, extra = 0) {
  const { rig, row, labels } = ctx;
  const H = window.innerHeight;
  const drift = (rig.cur.cy - 0.5) * H;                                               // what the last frame's offset already moved
  let hi = Infinity;
  for (const tw of row.towers) hi = Math.min(hi, labels.project(v.copy(tw.lid.mesh.position).setY(tw.lid.mesh.position.y + tw.lid.size / 2 + extra)).y);
  const lo = labels.project(v.set(row.towers[2].x, 0, 1.3)).y;
  const down = Math.max(0, top - (hi - drift));
  const up = Math.max(0, lo - drift - feet);
  const low = Math.max(0, Math.min(feet, rest * H) - (lo - drift));
  stop[ctx.phone ? 'cy' : 'cyd'] = 0.5 + (down > 0 || low > 0 ? Math.max(down, low) : -Math.min(up, Math.max(0, hi - drift - top))) / H;
}
export const ROW_SPAN = SPAN;

// Seat a camera stop so that a picture stands whole inside a box of the window: `points` are the world points that
// bound it, each [x, y, z, left, top, right, bottom] with the CSS px it needs around it (a label pinned there), and
// `box` is { l, t, r, b } in CSS px. The stop keeps `base`'s direction and never comes closer than `base` does: its
// distance (`fit`) and where the picture's middle stands (`cx`, `cyd`) are written. Returns the px a world unit takes.
const T24 = Math.tan((24 * Math.PI) / 360);
export function frameIn(stop, base, points, box, fy = 0.5) {
  const W = window.innerWidth, H = window.innerHeight;
  const d = base.pos.map((c, i) => c - base.look[i]), L = Math.hypot(...d);
  const f = d.map((c) => -c / L), n = Math.hypot(f[0], f[2]);
  const r = [-f[2] / n, 0, f[0] / n], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const span = (dist) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y, z, pl = 0, pt = 0, pr = 0, pb = 0] of points) {
      const q = [x - base.look[0] + f[0] * dist, y - base.look[1] + f[1] * dist, z - base.look[2] + f[2] * dist];      // from the eye
      const s = H / (2 * T24 * (q[0] * f[0] + q[1] * f[1] + q[2] * f[2]));
      const sx = (q[0] * r[0] + q[2] * r[2]) * s, sy = -(q[0] * u[0] + q[1] * u[1] + q[2] * u[2]) * s;
      x0 = Math.min(x0, sx - pl); x1 = Math.max(x1, sx + pr); y0 = Math.min(y0, sy - pt); y1 = Math.max(y1, sy + pb);
    }
    return [x0, x1, y0, y1];
  };
  const fits = (dist) => { const [x0, x1, y0, y1] = span(dist); return x1 - x0 <= box.r - box.l && y1 - y0 <= box.b - box.t; };
  let lo = Math.max(L, (base.fit || 0) / (2 * T24 * (W / H))), hi = lo * 4;
  if (!fits(lo)) { for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } lo = hi; }
  const [x0, x1, y0, y1] = span(lo);
  stop.fit = lo * 2 * T24 * (W / H);
  stop.cx = (box.l + (box.r - box.l - (x1 - x0)) / 2 - x0) / W;
  stop.cyd = (box.t + (box.b - box.t - (y1 - y0)) * fy - y0) / H;
  return H / (2 * T24 * lo);
}

export function createSeat(ctx) {
  const { rig } = ctx;
  const stop = { ...rig.stops.row };
  let cap = Infinity;
  function size() {
    const W = window.innerWidth, base = rig.stops.row;
    const px = Math.min((SPAN / base.fit) * W, W - GUT - EDGE, window.innerHeight * TALL, cap);
    stop.fit = (SPAN * W) / px;
    const natural = (0.5 - (SPAN / 2 + base.look[0]) / stop.fit) * W;                 // where the first stack's left edge would stand
    stop.cx = 0.5 + (GUT + (W - GUT - EDGE - px) / 2 - natural) / W;
  }
  size();
  window.addEventListener('resize', size);
  return {
    stop,
    level: (top, feet, rest, extra) => level(ctx, stop, top, feet, rest, extra),
    // the row no wider than `px` (a section that needs height for something over the row). Infinity lifts it
    limit(px) { if (px !== cap) { cap = px; size(); } },
    drop() { window.removeEventListener('resize', size); },
  };
}
