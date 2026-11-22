// The nine shots (film bible section 6) and the room anchors the cameras aim at.
//
// The cut list and the camera moves are AUTHORED (bible section 9: "the camera and the cuts"): they
// are the same in all four endings and are the only things here that read the frame number. Every
// cut falls on a bar line (30 frames). A shot is a pure function of the frame:
//
//   shotAt(frame) -> { index, name, from, to, t, camera: { pos, target, fov, lens }, viewName, view }
//
// Room units are metres, y up, the back wall at z = -3, the viewer's side at +z. Lenses are full-frame
// equivalents; fov is the VERTICAL field of view in degrees (what THREE.PerspectiveCamera wants).

import { VIEWS, KNOB, STRIP, rowY, PUNCH } from './layout.js';
import { BAR_FRAMES } from './time.js';

// ---- room anchors (the room builder keeps its objects on these) ------------------------------
export const ROOM = {
  size: { w: 5.0, d: 6.0, h: 2.6 },                 // x -2.5..2.5, z -3..3, y 0..2.6
  backWallZ: -3.0,
  cabinet: { x: 0, y: 0, z: -2.62, w: 1.2, h: 0.55, d: 0.5 },
  tv: { x: 0, y: 0.55, z: -2.62, w: 0.66, h: 0.52, d: 0.46 },
  // the picture tube's visible 4:3 face, centre and size (the screen quad)
  screen: { x: 0, y: 0.83, z: -2.385, w: 0.44, h: 0.33 },
  wallClock: { x: 0, y: 1.82, z: -2.97, r: 0.17 },
  doorway: { x: -1.75, z: -2.99, w: 0.9, h: 2.05 },  // open, on the back wall's left; a dark hall beyond
  window: { x: 1.75, y: 1.35, z: -2.99, w: 1.0, h: 1.1 },
  neighbour: { x: 2.2, y: 1.9, z: -14, w: 0.7, h: 0.9 }, // the warm window across the street
  chair: { x: 0.05, z: 0.35, rotY: 0 },              // empty wing chair, back to camera, facing the TV
  table: { x: 0.78, z: 0.05, h: 0.55, r: 0.22 },
  cup: { x: 0.74, y: 0.55, z: 0.02, r: 0.045, h: 0.07 },
};

export const lensToFov = (mm) => 2 * Math.atan(12 / mm) * 180 / Math.PI;   // 24 mm sensor height

const S = ROOM.screen;
const screenPoint = (u, v) => [S.x + (u - 0.5) * S.w, S.y - (v - 0.5) * S.h, S.z]; // u,v in 0..1, v down

// a SCREEN camera: centred on the screen point (u,v), distance so the tube's height fills `fill` of the frame
function screenCam(lens, fill, u = 0.5, v = 0.5) {
  const fov = lensToFov(lens), d = (S.h / fill / 2) / Math.tan(fov * Math.PI / 360);
  const p = screenPoint(u, v);
  return { pos: [p[0], p[1], p[2] + d], target: p, fov, lens };
}
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (t) => t * t * (3 - 2 * t);
// push a camera toward its target by `amount` of the distance (3% push = 0.03)
function pushed(cam, amount) { return { ...cam, pos: lerp3(cam.pos, cam.target, amount) }; }

const WIDE_A = { pos: [0.22, 1.12, 2.15], target: [0, 0.98, -2.6], fov: lensToFov(32), lens: 32 };
const WIDE_B = { pos: [-1.55, 1.35, 1.6], target: [1.15, 1.05, -2.6], fov: lensToFov(28), lens: 28 };
const TWO_SHOT = { pos: [1.12, 0.92, 1.05], target: [0.05, 0.78, -2.5], fov: lensToFov(40), lens: 40 };

// Where a bench point lands on the TV face for a given programme view (for aiming SCREEN shots).
function benchToScreenUV(view, bx, by) { return [(bx - view.x) / view.w, (by - view.y) / view.h]; }

// ---- the shot table --------------------------------------------------------------------------
// bars [from, to), the room camera as a function of t (0..1 through the shot), and the programme
// view as a function of the frame.
const B = BAR_FRAMES;
export const SHOTS = [
  { name: 'WIDE A', bars: [0, 4], cam: () => WIDE_A, view: () => 'P-WIDE' },
  {
    name: 'SCREEN', bars: [4, 20], cam: (t) => pushed(screenCam(50, 0.96), 0.03 * smooth(t)),
    view: (f) => (f >= 12 * B && f < 14 * B) ? 'P-DIAL' : f >= 14 * B ? 'P-STRIP' : 'P-WIDE',
  },
  { name: 'TWO-SHOT', bars: [20, 30], cam: () => TWO_SHOT, view: () => 'P-WIDE' },
  {
    // framed low on the strip and the resting hand: the tube overfills the frame, aimed below centre
    name: 'SCREEN LOW', bars: [30, 42], cam: () => screenCam(50, 1.25, 0.5, 0.62),
    view: (f) => f >= 36 * B ? 'P-DIAL' : 'P-STRIP',
  },
  { name: 'WIDE A', bars: [42, 47], cam: () => WIDE_A, view: () => 'P-WIDE' },
  {
    // creeping 5% toward the knob as it appears in P-DIAL, held straight through 20:00
    name: 'SCREEN KNOB', bars: [47, 58],
    cam: (t) => {
      const [u, v] = benchToScreenUV(VIEWS['P-DIAL'], KNOB.x, KNOB.y);
      const c0 = screenCam(50, 0.96), k = screenPoint(u, v);
      return { ...c0, pos: lerp3(c0.pos, k, 0.05 * t), target: lerp3(c0.target, k, 0.05 * t) };
    },
    view: () => 'P-DIAL',
  },
  { name: 'WIDE B', bars: [58, 64], cam: () => WIDE_B, view: () => 'P-WIDE' },
  { name: 'SCREEN', bars: [64, 69], cam: () => screenCam(50, 0.96), view: () => 'P-WIDE' },
  { name: 'WIDE A', bars: [69, 72], cam: () => WIDE_A, view: () => 'P-STRIP' },
];

/** The shot live on `frame` (0..2159; frames past the programme hold the last shot). */
export function shotAt(frame) {
  const f = Math.max(0, frame);
  let i = SHOTS.findIndex((s) => f < s.bars[1] * B);
  if (i < 0) i = SHOTS.length - 1;
  const s = SHOTS[i], from = s.bars[0] * B, to = s.bars[1] * B;
  const t = Math.min(1, Math.max(0, (f - from) / (to - from - 1)));
  const viewName = s.view(f);
  return { index: i + 1, name: s.name, from, to, t, camera: s.cam(t), viewName, view: VIEWS[viewName] };
}

/** Every cut (first frame of each shot), for the player's scrub bar and the checks. */
export const CUTS = SHOTS.map((s) => s.bars[0] * B);

// handy for the x-ray / checks: the newest strip column's top on the TV face, per view
export function punchOnScreen(viewName) { return benchToScreenUV(VIEWS[viewName], PUNCH.x, rowY(29) - STRIP.rowH); }
