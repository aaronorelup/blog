// The ten shots (film bible section 6, v1.2) and the room anchors the cameras aim at.
//
// The cut list and the camera moves are AUTHORED (bible section 9: "the camera and the cuts"): they
// are the same in all four endings and are the only things here that read the frame number. Every
// cut falls on a bar line (30 frames). A shot is a pure function of the frame:
//
//   shotAt(frame) -> { index, name, from, to, t, camera: { pos, target, fov, lens }, viewName, view }
//
// Room units are metres, y up, the back wall at z = -3, the viewer's side at +z. Lenses are full-frame
// equivalents; fov is the VERTICAL field of view in degrees (what THREE.PerspectiveCamera wants); focus (metres, optional,
// default the distance to the target) is where the dust in the beam is sharp.

import { VIEWS, KNOB, STRIP, rowY, PUNCH } from './layout.js';
import { BAR_FRAMES } from './time.js';

// ---- room anchors (the room builder keeps its objects on these) ------------------------------
export const ROOM = {
  size: { w: 4.4, d: 5.4, h: 2.5 },                 // x -2.2..2.2, z -3..2.4, y 0..2.5 (a small front room)
  backWallZ: -3.0,
  cabinet: { x: 0, y: 0, z: -2.74, w: 1.3, h: 0.5, d: 0.48 },      // the low walnut sideboard the set stands on
  tv: { x: 0, y: 0.5, z: -2.74, w: 0.70, h: 0.56, d: 0.46 },       // the set's box (front face at z -2.51)
  // the picture tube's visible 4:3 face, centre and size (the screen quad)
  screen: { x: 0, y: 0.80, z: -2.505, w: 0.48, h: 0.36 },
  wallClock: { x: 0, y: 1.44, z: -2.985, r: 0.135 },   // low enough for WIDE A's long lens
  doorway: { x: -1.45, z: -3.0, w: 0.82, h: 2.0 },  // open, on the back wall's left; a dark hall beyond
  window: { x: 1.06, y: 1.3, z: -3.0, w: 0.66, h: 1.06 },           // back wall, right of the set: seen from WIDE A
  window2: { x: 1.25, y: 1.33, z: 2.4, w: 0.9, h: 1.12 },           // front wall (bay side): seen from the REVERSE
  // the warm window across the street; placed at load on the ray from WIDE A through `window` (and a twin
  // beyond window2 on the ray from the REVERSE), both driven by the one signal S.windowLit
  neighbour: { w: 0.42, h: 0.55, beyond: 7.0 },
  chair: { x: -0.15, z: -0.5, rotY: -0.19 },          // empty wing chair, back to WIDE A, turned to the set
  table: { x: -0.86, z: -1.06, h: 0.56, r: 0.23 },     // small walnut side table at the chair's front-left
  cup: { x: -0.79, y: 0.56, z: -1.09, r: 0.042, h: 0.065 },   // y = the table top; the saucer sits on it
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

// WIDE A: over the chair's right shoulder, a long lens from the back of the room so the lit screen is about 22% of
// the frame's width; the chair's back and wing a dark, rim-lit shape at the lower left, the clock, the window.
export const WIDE_A = { pos: [0.42, 1.25, 0.85], target: [0.4, 0.98, -2.6], fov: lensToFov(60), lens: 60 };
// TWO-SHOT: low past the chair's left arm, the blanket and the cup large, the set beyond.
export const TWO_SHOT = { pos: [-1.15, 0.93, -0.28], target: [0.6, 0.42, -2.62], fov: lensToFov(35), lens: 35 };
// REVERSE (v1.1): from beside the set, looking back at the empty chair and its shadow on the wall behind it.
export const REVERSE = { pos: [0.75, 1.05, -2.3], target: [-0.45, 0.7, 1.6], fov: lensToFov(28), lens: 28, focus: 1.9 };   // focused on the chair

// Where a bench point lands on the TV face for a given programme view (for aiming SCREEN shots).
function benchToScreenUV(view, bx, by) { return [(bx - view.x) / view.w, (by - view.y) / view.h]; }

// ---- the shot table --------------------------------------------------------------------------
// bars [from, to), the room camera as a function of t (0..1 through the shot), and the programme
// view as a function of the frame.
const B = BAR_FRAMES;
export const SHOTS = [
  { name: 'WIDE A', bars: [0, 4], cam: () => WIDE_A, view: () => 'P-WIDE' },
  {
    name: 'SCREEN', bars: [4, 20], cam: (t) => pushed(screenCam(50, 0.87), 0.03 * smooth(t)),
    view: (f) => (f >= 12 * B && f < 14 * B) ? 'P-DIAL' : f >= 14 * B ? 'P-STRIP' : 'P-WIDE',
  },
  { name: 'TWO-SHOT', bars: [20, 30], cam: (t) => pushed(TWO_SHOT, 0.02 * smooth(t)), view: () => 'P-WIDE' },
  {
    // framed low on the strip and the resting hand: the tube just overfills the height, aimed below centre so the
    // bottom of the bezel stays in frame
    name: 'SCREEN LOW', bars: [30, 42], cam: () => screenCam(50, 1.02, 0.5, 0.56),
    view: (f) => f >= 36 * B ? 'P-DIAL' : 'P-STRIP',
  },
  { name: 'WIDE A', bars: [42, 47], cam: () => WIDE_A, view: () => 'P-WIDE' },
  {
    // creeping 5% toward the knob as it appears in P-DIAL, held straight through 20:00
    name: 'SCREEN KNOB', bars: [47, 58],
    cam: (t) => {
      const [u, v] = benchToScreenUV(VIEWS['P-DIAL'], KNOB.x, KNOB.y);
      const c0 = screenCam(50, 0.88), k = screenPoint(u, v);
      return { ...c0, pos: lerp3(c0.pos, k, 0.05 * t), target: lerp3(c0.target, k, 0.05 * t) };
    },
    view: () => 'P-DIAL',
  },
  // REVERSE (v1.1): the set out of frame, only its light. LOCKED, and shot 9 uses exactly the same camera, so the
  // two REVERSE shots differ only by what the data does to the shadow, the dust and the window
  { name: 'REVERSE', bars: [58, 64], cam: () => REVERSE, view: () => 'P-WIDE' },
  { name: 'SCREEN', bars: [64, 69], cam: (t) => pushed(screenCam(50, 0.88), 0.02 * smooth(t)), view: () => 'P-WIDE' },
  { name: 'REVERSE', bars: [69, 71], cam: () => REVERSE, view: () => 'P-WIDE' },     // (v1.2) the payoff of shot 7
  { name: 'WIDE A', bars: [71, 72], cam: () => WIDE_A, view: () => 'P-WIDE' },      // (v1.2) the set in the dark room
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
