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
