// The camera's path, a pure function of the track's progress T (0 at the top of the page, 1 when the house is
// fully apart). It starts inside the room by the lit andon, backs out through the open front bay under the head
// beam and the eaves, rises over the roof line, and settles on a long-lens three-quarter view that drifts back as
// the drawing grows. A wide window and a tall one (a phone) have their own framings.
//
// The acts, in T: until `inside` the camera barely moves; by `whole` the whole house and garden are in frame;
// from `apart0` to `apart1` the house comes apart; after that the drawing holds while the card comes up.
export const ACT = { inside: 0.045, whole: 0.25, apart0: 0.285, apart1: 0.94 };

// p: where the camera is, q: what it looks at, fov: vertical field of view in degrees
const WIDE = [
  { t: 0.00,  p: [1.75, 1.66, 2.15],  q: [-4.7, 1.22, 1.35],  fov: 60 },
  { t: 0.045, p: [1.55, 1.72, 2.75],  q: [-4.6, 1.25, 1.2],   fov: 59 },
  { t: 0.105, p: [0.55, 2.05, 6.1],   q: [-2.2, 1.6, -1.2],   fov: 54 },
  { t: 0.155, p: [3.2, 4.6, 13.2],    q: [-0.2, 2.3, 0.4],    fov: 47 },
  { t: 0.25,  p: [20.5, 20.0, 29.0],  q: [0.0, 1.6, 2.6],     fov: 35 },
  { t: 0.30,  p: [22.0, 21.2, 31.0],  q: [0.2, 2.8, 2.0],     fov: 34.5 },
  { t: 0.62,  p: [28.0, 24.5, 39.0],  q: [0.6, 7.2, 1.0],     fov: 33 },
  { t: 0.94,  p: [33.0, 27.0, 46.0],  q: [0.8, 10.4, 0.4],    fov: 32 },
  { t: 1.00,  p: [33.4, 27.2, 46.6],  q: [0.8, 10.5, 0.4],    fov: 32 },
];
const TALL = [
  { t: 0.00,  p: [-0.9, 2.15, 1.25],  q: [-4.9, 1.2, 3.25],   fov: 68 },
  { t: 0.045, p: [-0.6, 2.15, 1.6],   q: [-4.9, 1.2, 3.2],    fov: 68 },
  { t: 0.105, p: [0.2, 2.1, 6.1],     q: [-2.4, 1.6, -0.6],   fov: 64 },
  { t: 0.155, p: [1.6, 4.6, 15.5],    q: [0, 2.4, 0.4],       fov: 56 },
  { t: 0.25,  p: [19.0, 26.0, 44.0],  q: [0.2, 2.6, 2.4],     fov: 40 },
  { t: 0.30,  p: [20.0, 27.5, 46.5],  q: [0.2, 4.6, 1.6],     fov: 40 },
  { t: 0.62,  p: [24.0, 33.0, 56.0],  q: [0.3, 11.5, 0.8],    fov: 39 },
  { t: 0.94,  p: [27.0, 38.0, 64.0],  q: [0.4, 17.0, 0.4],    fov: 38 },
  { t: 1.00,  p: [27.4, 38.4, 65.0],  q: [0.4, 17.1, 0.4],    fov: 38 },
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
