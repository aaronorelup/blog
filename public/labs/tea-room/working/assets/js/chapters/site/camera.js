// (the tea room test tests/tea-house-apart/, its js/camera.js: unchanged)
// The camera's path, a pure function of the track's progress T (0 at the top of the page, 1 when the house is
// fully apart). It starts inside the room by the lit andon, backs out through the open front bay under the head
// beam and the eaves, down the stepping stones to the homepage's own first view of the house, on out under the
// torii, and up; then it swings round to a long-lens three-quarter view that drifts back as the drawing grows.
// A wide window and a tall one (a phone) have their own framings.
//
// The acts, in T: until `inside` the camera barely moves; by `whole` the whole house and garden are in frame;
// from `apart0` to `apart1` the house comes apart; after that the drawing holds while the card comes up.
export const ACT = { inside: 0.045, whole: 0.25, apart0: 0.285, apart1: 0.94 };

// p: where the camera is, q: what it looks at, fov: vertical field of view in degrees
const WIDE = [
  { t: 0.00,  p: [1.75, 1.66, 2.15],  q: [-4.7, 1.22, 1.35],  fov: 60 },
  { t: 0.045, p: [1.55, 1.72, 2.75],  q: [-4.6, 1.25, 1.2],   fov: 59 },
  { t: 0.105, p: [0.45, 2.0, 6.1],    q: [-1.6, 1.6, -1.6],   fov: 54 },
  { t: 0.165, p: [0.0, 3.1, 19.0],    q: [0.0, 2.3, 3.0],     fov: 46 },   // the homepage's first view
  { t: 0.195, p: [0.15, 3.45, 23.6],  q: [0.0, 2.4, 3.0],     fov: 44 },   // out under the torii
  { t: 0.25,  p: [1.6, 9.2, 34.5],    q: [0.0, 2.9, 2.0],     fov: 39 },
  { t: 0.31,  p: [5.0, 12.0, 34.0],   q: [0.2, 4.0, 1.6],     fov: 37 },
  { t: 0.45,  p: [23.8, 15.5, 31.1],  q: [0.4, 6.0, 1.2],     fov: 35.5 },   // round the east sakura, to the alcove's side
  { t: 0.62,  p: [33.7, 20.0, 26.9],  q: [0.6, 8.6, 1.0],     fov: 34 },
  { t: 0.94,  p: [39.4, 25.0, 25.5],  q: [0.8, 12.6, 0.4],    fov: 32 },
  { t: 1.00,  p: [39.8, 25.2, 25.6],  q: [0.8, 12.7, 0.4],    fov: 32 },
];
const TALL = [
  { t: 0.00,  p: [-0.9, 2.15, 1.25],  q: [-4.9, 1.2, 3.25],   fov: 68 },
  { t: 0.045, p: [-0.6, 2.15, 1.6],   q: [-4.9, 1.2, 3.2],    fov: 68 },
  { t: 0.105, p: [0.2, 2.1, 6.1],     q: [-1.8, 1.6, -1.2],   fov: 64 },
  { t: 0.165, p: [0.0, 3.4, 19.0],    q: [0.0, 2.8, 3.0],     fov: 60 },   // the homepage's first view, a phone's
  { t: 0.19,  p: [0.0, 7.4, 23.0],    q: [0.0, 2.9, 3.0],     fov: 58 },   // up and over the torii (a narrow window
  { t: 0.21,  p: [0.3, 9.6, 31.0],    q: [0.0, 3.1, 2.6],     fov: 53 },   //  passing under it would see only its beam)
  { t: 0.25,  p: [1.0, 13.0, 50.0],   q: [0.0, 3.4, 2.0],     fov: 44 },
  { t: 0.31,  p: [3.0, 19.0, 55.0],   q: [0.1, 5.0, 1.6],     fov: 42 },
  { t: 0.62,  p: [9.0, 30.0, 63.0],   q: [0.3, 11.5, 0.8],    fov: 40 },
  { t: 0.94,  p: [14.0, 37.0, 70.0],  q: [0.4, 17.0, 0.4],    fov: 38 },
  { t: 1.00,  p: [14.2, 37.3, 70.8],  q: [0.4, 17.1, 0.4],    fov: 38 },
];

// tangents the monotone way (Fritsch and Carlson): the path has no corners and never overshoots a key, so the
// camera cannot swing past a framing and come back; the ends come to rest
function prepare(keys) {
  const n = keys.length;
  const val = (k, f, a) => (f === 'fov' ? k.fov : k[f][a]);
  const tangents = (f, a) => {
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((val(keys[i + 1], f, a) - val(keys[i], f, a)) / (keys[i + 1].t - keys[i].t));
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) continue;
      const h0 = keys[i].t - keys[i - 1].t, h1 = keys[i + 1].t - keys[i].t;
      const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
      m[i] = (w0 + w1) / (w0 / d[i - 1] + w1 / d[i]);
    }
    return m;
  };
  const mp = [0, 1, 2].map(a => tangents('p', a)), mq = [0, 1, 2].map(a => tangents('q', a)), mf = tangents('fov', 0);
  keys.forEach((k, i) => { k.m = { p: [mp[0][i], mp[1][i], mp[2][i]], q: [mq[0][i], mq[1][i], mq[2][i]], fov: mf[i] }; });
  return keys;
}
prepare(WIDE); prepare(TALL);

// The camera at T. out: { p: [x, y, z], q: [x, y, z], fov }
export function cameraAt(T, tall, out) {
  const keys = tall ? TALL : WIDE;
  const x = T < 0 ? 0 : T > 1 ? 1 : T;
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1], h = b.t - a.t, s = (x - a.t) / h, s2 = s * s, s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1, h10 = (s3 - 2 * s2 + s) * h, h01 = -2 * s3 + 3 * s2, h11 = (s3 - s2) * h;
  for (let n = 0; n < 3; n++) {
    out.p[n] = h00 * a.p[n] + h10 * a.m.p[n] + h01 * b.p[n] + h11 * b.m.p[n];
    out.q[n] = h00 * a.q[n] + h10 * a.m.q[n] + h01 * b.q[n] + h11 * b.m.q[n];
  }
  out.fov = h00 * a.fov + h10 * a.m.fov + h01 * b.fov + h11 * b.m.fov;
  return out;
}
