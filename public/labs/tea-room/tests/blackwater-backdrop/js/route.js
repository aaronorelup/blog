/* The dive: where the camera is and where it looks, as a function of the chapter's progress q. Plain numbers, in the
   game's own world coordinates (metres; the open water's surface is at y = -1.5). The route is the game's own first
   descent: the sinkhole's open pool, the shaft (sink-pool to sink-shaft), and the first chamber, gal-entry. */

export const WATER_Y = -1.5;
export const HOLD_AT = 0.8; // from here on the camera has arrived and holds

// [q, position, look-at]
export const KEYS = [
  [0.0, [-4.2, 5.2, 6.4], [7.0, -1.2, 0.6]],
  [0.16, [-1.2, 0.9, 3.6], [1.2, -7.5, -3.0]],
  [0.3, [0.0, -4.2, 0.2], [-0.3, -12.5, -6.2]],
  [0.44, [0.0, -10.4, -2.2], [0.0, -17.5, -9.2]],
  [0.57, [0.0, -15.6, -7.2], [-0.2, -22.5, -12.4]],
  [0.69, [0.15, -20.3, -10.9], [-2.6, -24.6, -14.6]],
  [HOLD_AT, [0.9, -23.2, -12.4], [-6.5, -25.4, -15.9]],
];

// the things of the game that live in the chamber (positions checked against the cave's field: see the notes in scene.js)
export const FIGURE = [-9.6, -26.0, -16.4];   // one of the drowned crew, in the mouth of the west passage
export const CHEMLIGHT = [-1.6, null, -14.2]; // a dropped chemlight; y is found on the floor at mount
// the guide line, tied off at the pool's lip and run down the shaft into the chamber and on into the dark
export const LINE = [
  [3.6, -1.9, 1.6], [2.2, -7.5, -2.4], [1.0, -12.4, -5.6], [0.6, -16.6, -8.6], [0.2, -20.4, -11.4],
  [-1.2, -23.6, -13.4], [-4.6, -25.0, -15.6], [-8.4, -26.1, -16.4], [-13.0, -27.4, -17.0],
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
