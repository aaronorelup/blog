// The tea room's one projection (pure: no DOM, no state). A scene is drawn on a board of 1600x900 units (d) or
// 900x1600 (p), fitted to cover the window. The camera is a pinhole that pushes by m toward the scene's aim: a
// flat standing at distance r is drawn r / (r - m) times its rest size, about the aim's place on the screen.
// frame.js places flats, slots and ports with it, plan.js resolves the named pushes with it, and
// src/lib/tea-scene.js checks sharpness and cover with it, so the page and the checks can never disagree.

export const BOARD = Object.freeze({ d: Object.freeze([1600, 900]), p: Object.freeze([900, 1600]) });
// The aim is kept at least this share of the window inside each edge (when the board allows it).
export const AIM_MARGIN = 0.1;

// d for a window wider than it is tall, p otherwise (a square window is upright).
export const compOf = (vw, vh) => (vw > vh ? 'd' : 'p');

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// The board fitted to cover the window: centred, then moved as little as needed to bring the aim AIM_MARGIN
// inside the window, never so far that the board stops covering it. Returns the scale c (px per board unit),
// the board's offset (ox, oy) and the aim on the screen (ax, ay).
export function fitBoard(vw, vh, comp, aim) {
  const [bw, bh] = BOARD[comp];
  const c = Math.max(vw / bw, vh / bh);
  const along = (view, size, at) => {
    const lo = view - size * c; // the most the board may move toward negative and still cover
    let o = (view - size * c) / 2;
    const a = o + at * c;
    if (a < view * AIM_MARGIN) o += view * AIM_MARGIN - a;
    else if (a > view * (1 - AIM_MARGIN)) o -= a - view * (1 - AIM_MARGIN);
    return clamp(o, lo, 0);
  };
  const ox = along(vw, bw, aim[0]);
  const oy = along(vh, bh, aim[1]);
  return { c, ox, oy, ax: ox + aim[0] * c, ay: oy + aim[1] * c };
}

// A box in board units [x, y, w, h] as a rectangle on the screen at rest.
export const rectOf = (box, fit) => ({ x: fit.ox + box[0] * fit.c, y: fit.oy + box[1] * fit.c, w: box[2] * fit.c, h: box[3] * fit.c });

// How much a flat at distance r has grown when the camera has pushed by m. Infinity once the camera has reached
// or passed it: the flat is behind the lens and is not drawn.
export const pushScale = (r, m) => (m < r ? r / (r - m) : Infinity);
// The push that grows a flat at distance r by s.
export const pushFor = (r, s) => r - r / s;

// A rectangle grown by s about the screen point (ax, ay).
export const grow = (rect, ax, ay, s) => ({ x: ax + (rect.x - ax) * s, y: ay + (rect.y - ay) * s, w: rect.w * s, h: rect.h * s });
export const moved = (rect, dx, dy) => ({ x: rect.x + dx, y: rect.y + dy, w: rect.w, h: rect.h });

// Whether outer holds inner, to a small tolerance in px.
export const holds = (outer, inner, eps = 0.01) => outer.x <= inner.x + eps && outer.y <= inner.y + eps &&
  outer.x + outer.w >= inner.x + inner.w - eps && outer.y + outer.h >= inner.y + inner.h - eps;
// The overlap of two rectangles, or null (a sliver thinner than eps px is no overlap).
export function overlap(a, b, eps = 1e-6) {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x, h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > eps && h > eps ? { x, y, w, h } : null;
}
export const windowRect = (vw, vh) => ({ x: 0, y: 0, w: vw, h: vh });

// The least growth about (ax, ay) at which rect covers the window [0, vw] x [0, vh]: below 1 when it already
// does at rest. Infinity when growing about that point can never cover it (the point is not inside rect).
export function coverScale(rect, ax, ay, vw, vh) {
  const inside = ax > rect.x && ax < rect.x + rect.w && ay > rect.y && ay < rect.y + rect.h;
  if (!inside) return holds(rect, windowRect(vw, vh), 0) ? 1 : Infinity;
  return Math.max(ax / (ax - rect.x), (vw - ax) / (rect.x + rect.w - ax), ay / (ay - rect.y), (vh - ay) / (rect.y + rect.h - ay));
}

// Where a flat stands for a camera push m, a slide (x toward a wing, -1 left, +1 right), a lift (y, -1 off the
// top, +1 off the bottom) and a lean in px. A slide of +-1 puts the flat just outside the frame, whatever the push.
export function placeRect(rest, r, m, fit, vw, vh, { slide = 0, lift = 0, lean = [0, 0] } = {}) {
  const s = pushScale(r, m);
  if (!Number.isFinite(s)) return null;
  const g = grow(rest, fit.ax, fit.ay, s);
  const dx = (slide < 0 ? slide * (g.x + g.w) : slide * (vw - g.x)) + lean[0];
  const dy = (lift < 0 ? lift * (g.y + g.h) : lift * (vh - g.y)) + lean[1];
  return { rect: moved(g, dx, dy), s, dx, dy };
}

// The pointer lean of a flat at distance r: 8 px at most, the nearest most, nothing for the far plates (r >= 1).
// lean is 0 as built (?lean=1 turns it on), ptr is the pointer from the window's centre, each axis -1 to 1.
export const LEAN_PX = 8;
export function leanOf(r, ptr, lean) {
  if (!lean || r >= 1) return [0, 0];
  const w = clamp((1 - r) / 0.7, 0, 1) * LEAN_PX * lean;
  return [clamp(ptr[0], -1, 1) * w, clamp(ptr[1], -1, 1) * w];
}

// The push at which a hole (a rectangle at rest, on a flat at distance r) just covers the window: the 'through'
// key. Infinity when the aim is not inside the hole, so it never can.
export function throughPush(holeRest, r, fit, vw, vh) {
  const s = coverScale(holeRest, fit.ax, fit.ay, vw, vh);
  return Number.isFinite(s) ? Math.max(0, pushFor(r, s)) : Infinity;
}

// The push for 'fit:<slot>': the smaller of the push at which the slot covers the window and the push at which
// it is 1.25 CSS px wide for each pixel of the picture it holds (pw, the picture's width in pixels).
export const SHARP = 1.25;
export function fitPush(slotRest, r, pw, fit, vw, vh) {
  const cover = coverScale(slotRest, fit.ax, fit.ay, vw, vh);
  const sharp = pw > 0 ? (SHARP * pw) / slotRest.w : Infinity;
  const s = Math.min(cover, sharp);
  return Number.isFinite(s) ? Math.max(0, pushFor(r, s)) : 0;
}

// The port of an opening: the scene behind, held at its opening frame (in window px), stands at distance at and
// is grown by k about the aim of the scene in front. k is 1 exactly at the handover push mh, so the port's
// content is then the frame itself.
export const portScale = (at, mh, m) => (at - mh) / (at - m);
