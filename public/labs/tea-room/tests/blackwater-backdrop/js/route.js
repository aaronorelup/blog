/* The dive: where the camera is and where it looks, as a function of the chapter's progress q. Plain numbers, in the
   game's own world coordinates (metres; the open water's surface is at y = -1.5). The route is the game's own first
   descent, and the camera keeps to the middle of the game's own passages (the node centres in layout.json), so the
   rock is always a few metres away and the lamp always has something to light:
   the camp on the shore shelf (sink-platform), the open pool (sink-pool), the throat down to sink-shaft, the passage on
   to the first chamber (gal-entry), and the west passage out of it (gal-entry to gal-ring-w), where the camera holds. */

export const WATER_Y = -1.5;
export const HOLD_AT = 0.8; // from here on the camera has arrived and holds

// [q, position, look-at]
export const KEYS = [
  [0.0, [13.0, 1.6, 7.0], [9.4, -1.0, 2.8]],        // the camp on the shore shelf: the table, the cot, the lamp post, the pool beyond
  [0.07, [12.9, 1.55, 6.9], [9.3, -1.1, 2.7]],      // (still there while the chapter comes into view)
  [0.13, [8.8, 0.4, 5.4], [1.0, -5.5, -1.0]],      // walking to the water's edge
  [0.2, [1.0, -7.0, 1.8], [0.0, -13.0, -5.0]],      // under: the pool's bowl, and the lamp finds the throat in its floor
  [0.31, [0.2, -10.8, -0.6], [0.0, -16.0, -6.6]],     // the throat opens below, in the lamp's oval
  [0.43, [0.0, -12.2, -3.6], [0.0, -17.6, -9.0]],   // down the throat
  [0.53, [0.0, -17.6, -8.8], [-1.0, -23.6, -13.4]],  // through sink-shaft, the next passage below
  [0.61, [-0.8, -22.7, -12.8], [-4.4, -25.0, -14.8]], // into the first chamber
  [HOLD_AT, [-1.25, -24.15, -13.95], [-9.5, -26.25, -16.05]], // in the mouth of the west passage, looking along it
];

// one of the drowned crew, swimming up the west passage towards the reader (about 2.8 m from the hold)
export const FIGURE = [-4.6, -24.6, -14.4]; // a little to the left of the passage's middle, so its far end shows past him
// a dropped chemlight far down the west passage, on its floor (y is found on the floor at mount)
export const CHEMLIGHT = [-10.4, null, -16.2];
// the guide line's tie-offs, from the shore down the dive and on into the west passage; at mount each is pushed out
// from the passage's middle to rest near its wall, low and to the right, the way a diver lays it
export const LINE = [
  [7.6, -1.2, 2.6], [3.2, -6.0, 0.8], [0.0, -9.8, -1.0], [0.0, -13.0, -4.4], [0.0, -16.2, -7.7],
  [0.0, -19.6, -10.4], [-0.3, -22.9, -12.9], [-2.7, -24.5, -14.3], [-5.4, -25.2, -15.0], [-9.4, -26.2, -16.0], [-13.0, -27.1, -16.8],
];

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (x) => x * x * (3 - 2 * x);

function cr(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function sample(which, q) {
  const n = KEYS.length;
  q = clamp(q, 0, HOLD_AT);
  let i = 0;
  while (i < n - 2 && q > KEYS[i + 1][0]) i++;
  const a = KEYS[i][0], b = KEYS[i + 1][0];
  let t = clamp((q - a) / (b - a));
  // the last leg settles into the hold instead of stopping dead
  if (i === n - 2) t = ss(t) * 0.5 + t * 0.5;
  const P = (k) => KEYS[clamp(k, 0, n - 1)][which];
  const out = [0, 0, 0];
  for (let c = 0; c < 3; c++) out[c] = cr(P(i - 1)[c], P(i)[c], P(i + 1)[c], P(i + 2)[c], t);
  return out;
}
export const camAt = (q) => sample(1, q);
export const lookAt = (q) => sample(2, q);
