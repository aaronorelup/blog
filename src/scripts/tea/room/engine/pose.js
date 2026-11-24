// A scene's pose at one place in its chapter (pure): where each flat stands, whether it is shown, and what each
// of its openings shows. frame.js asks for the scene that is on; the port of an opening asks for the scene behind
// at its own opening frame; plan.js asks for the shadow's place. One function, so all three agree to the pixel.
import { grow, leanOf, moved, overlap, placeRect, portScale, windowRect } from './project.js';
import { valueAt } from './tracks.js';

// The camera's push at u: its keys are numbers by now (plan.js resolved 'through' and 'fit:<slot>').
export const cameraAt = (S, u) => valueAt(S.camera, u, 0);

// A flat's own track values at u. Opacity is 1 and wipe 1 (the port fully uncovered) unless a track says
// otherwise; slide and lift are 0.
export function trackAt(S, fi, u) {
  const t = S.tracks[fi];
  return {
    slide: valueAt(t.slide, u, 0), lift: valueAt(t.lift, u, 0),
    o: Math.min(1, Math.max(0, valueAt(t.opacity, u, 1))), wipe: Math.min(1, Math.max(0, valueAt(t.wipe, u, 1))),
  };
}

// One flat's value. A flat behind the lens (m >= r) holds its rest place, unshown. shown: in front of the lens,
// not transparent, and some of it inside the window.
export function placeFlat(S, fi, u, m, ptr, L) {
  const f = S.flats[fi];
  const tr = trackAt(S, fi, u);
  // A flat with an opening never leans: its hole must cover the window exactly at the handover.
  const lean = f.through ? [0, 0] : leanOf(f.r, ptr, L.lean);
  const p = placeRect(f.rest, f.r, m, S.fit, L.vw, L.vh, { slide: tr.slide, lift: tr.lift, lean });
  if (!p) {
    return { out: { name: f.name, x: f.rest.x, y: f.rest.y, w: f.rest.w, h: f.rest.h, k: 1, tx: 0, ty: 0, o: tr.o, shown: false },
      s: Infinity, dx: 0, dy: 0, tr };
  }
  const { rect, s, dx, dy } = p;
  const shown = tr.o > 0 && overlap(rect, windowRect(L.vw, L.vh)) !== null;
  return { out: { name: f.name, x: rect.x, y: rect.y, w: rect.w, h: rect.h, k: s, tx: rect.x - f.rest.x, ty: rect.y - f.rest.y,
    o: tr.o, shown }, s, dx, dy, tr };
}

// The still of a scene, placed as its back plate stands at its opening frame (what a port two deep holds).
function stillOf(T, L, ptr) {
  const back = T.flats.findIndex((f) => f.r >= 1);
  if (back < 0) return { src: T.still, x: 0, y: 0, w: L.vw, h: L.vh };
  const { out } = placeFlat(T, back, T.part.from, cameraAt(T, T.part.from), ptr, L);
  return { src: T.still, x: out.x, y: out.y, w: out.w, h: out.h };
}

// The pose of scene S at u. depth 2: its flats and its ports, each port holding the scene behind at that scene's
// opening frame, whose own ports hold only a still. depth 0: flats only.
export function poseScene(S, u, ptr, L, depth = 2) {
  const m = cameraAt(S, u);
  const placed = S.flats.map((f, fi) => placeFlat(S, fi, u, m, ptr, L));
  const ports = depth > 0 ? S.ports.map((p) => portOf(S, p, placed[p.flat], m, ptr, L, depth)) : [];
  return { m, placed, flats: placed.map((p) => p.out), ports };
}

// One port. Its clip is the hole on the screen, or for an open door its frame (grown, never slid). Its
// content is the scene behind in window px, grown by k about the aim of S: screen = (x, y) + k * point. The port
// itself does not lean: the flats it holds lean as they will once their scene is on, so the handover holds.
function portOf(S, p, flat, m, ptr, L, depth) {
  const f = S.flats[p.flat];
  const T = L.scenes[p.to];
  const k = portScale(p.at, p.mh, m);
  const base = {
    flat: f.name, to: p.to, shown: false,
    clip: null, x: S.fit.ax * (1 - k), y: S.fit.ay * (1 - k), k, o: flat.tr.o, wipe: flat.tr.wipe,
  };
  if (p.hole && Number.isFinite(flat.s)) base.clip = moved(grow(p.hole, S.fit.ax, S.fit.ay, flat.s), flat.dx, flat.dy);
  else if (p.door && Number.isFinite(flat.s)) base.clip = grow(p.door, S.fit.ax, S.fit.ay, flat.s);
  else base.clip = { x: 0, y: 0, w: 0, h: 0 };
  // The port is the hole flat's sibling, not its child: it stays shown when an open door's own panels have left
  // the frame. It takes its flat's opacity (an open door comes in with the house front it is cut in), and it is
  // not shown while its wipe has not begun, once its flat is behind the lens, or when its hole is outside the window.
  base.shown = Boolean(T) && Number.isFinite(flat.s) && flat.tr.o > 0 && flat.tr.wipe > 0 &&
    overlap(base.clip, windowRect(L.vw, L.vh)) !== null;
  if (!T) return { ...base, inner: { flats: [], ports: [] }, still: null };
  if (depth > 1) {
    const inner = poseScene(T, T.part.from, ptr, L, depth - 1);
    return { ...base, inner: { flats: inner.flats, ports: inner.ports }, still: null };
  }
  return { ...base, inner: { flats: [], ports: [] }, still: stillOf(T, L, ptr) };
}

// Where a slot stands: its box rides its flat exactly (the same push, slide, lift and lean).
export function slotRect(S, slot, placed) {
  const fp = placed[slot.flat];
  if (!Number.isFinite(fp.s)) return null;
  return moved(grow(slot.rest, S.fit.ax, S.fit.ay, fp.s), fp.dx, fp.dy);
}

