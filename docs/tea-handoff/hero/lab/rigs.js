// Rigid-part rigs. Coordinates are normalised: feet at y=0, height 1, centred on x and z; the model faces +z.
// test(c, m): does a triangle centroid c belong to this part; m widens the region for the overlap band.
const S = Math.sin, PI = Math.PI;
const ease = t => t * t * (3 - 2 * t);
function tailParts(prefix, parent, n, root, axisSign, len, test0) {
  // tail along -z (behind) for the prior model: segment k covers z in [root - (k)*len/n, root - (k+1)*len/n]
  const out = [];
  for (let k = 0; k < n; k++) {
    const z0 = root - k * len / n;
    out.push({ name: `${prefix}${k}`, parent: k ? `${prefix}${k-1}` : parent, pivot: [0, 0.12, z0],
      test: (c, m) => test0(c) && c.z < z0 + m });
  }
  return out;
}
function polyTail(bb, n) {   // straight chain from the tail root to the tail tip, behind (-z)
  const z0 = -0.12, z1 = bb.min.z * 0.98, pts = [];
  for (let k = 0; k <= n; k++) pts.push([0, 0.3 - 0.22 * k / n, z0 + (z1 - z0) * k / n]);
  return pts;
}
export const RIGS = {
  prior: {
    src: '/raw/prior_jefrie_v2.glb', overlap: 0.02, yaw: 60, period: 2.4,
    parts: bb => [
      { name: 'body', parent: null, pivot: [0, 0.45, 0], test: () => true },
      { name: 'head', parent: 'body', pivot: [0, 0.74, 0], test: (c, m) => c.y > 0.74 - m },
      { name: 'armL', parent: 'body', pivot: [0.14, 0.66, 0], test: (c, m) => c.x > 0.15 - m && c.y > 0.38 && c.y < 0.74 },
      { name: 'armR', parent: 'body', pivot: [-0.14, 0.66, 0], test: (c, m) => c.x < -0.15 + m && c.y > 0.38 && c.y < 0.74 },
      ...tailParts('tail', 'body', 4, -0.12, -1, (-0.12 - bb.min.z) * 0.95, c => c.y < 0.4 && c.z < -0.1),
    ],
    showPoses: [0.0, 0.33, 0.66],
    pose: t => {
      const w = 2 * PI * t;
      return {
        body: { pos: [0, 0.12 * Math.max(0, S(w)), 0], rot: [0.25 * S(w), 0, 0], squash: -0.06 * S(w) },
        parts: {
          head: [-0.15 * S(w), 0.2 * S(w * 0.5), 0],
          armL: [0, 0, 0.9 * S(w) + 0.3], armR: [0, 0, -0.9 * S(w) - 0.3],
          tail0: [0.35 * S(w), 0, 0], tail1: [0.3 * S(w - 0.6), 0.15 * S(w), 0], tail2: [0.3 * S(w - 1.2), 0.2 * S(w), 0], tail3: [0.35 * S(w - 1.8), 0.25 * S(w), 0],
        },
      };
    },
  },
  prior_skin: null,
};
RIGS.prior_skin = { ...RIGS.prior, label: 'rigid parts + skinned tail chain', parts: bb => [
  ...RIGS.prior.parts(bb).filter(p => !p.name.startsWith('tail')),
  { name: 'tail', parent: 'body', chain: polyTail(bb, 5), test: (c, m) => c.y < 0.4 && c.z < -0.1 + m },
] };
// Yusef A-pose (TRELLIS.2, compressed 619 KB): rigid head and arms, each wing a skinned chain (bone 0 fixed at the shoulder blade).
const wing = s => [[0.04*s, 0.70, -0.06], [0.14*s, 0.78, -0.10], [0.24*s, 0.72, -0.12], [0.28*s, 0.52, -0.12], [0.27*s, 0.30, -0.10]];
RIGS.yusef = {
  src: '/spike/lab/yusef.glb', overlap: 0.015, yaw: 35, period: 2.6, label: 'rigid head/arms + skinned wing chains',
  parts: [
    { name: 'body', parent: null, pivot: [0, 0.5, 0], test: () => true },
    { name: 'head', parent: 'body', pivot: [0, 0.80, 0.0], test: (c, m) => c.y > 0.80 - m && Math.abs(c.x) < 0.11 },
    { name: 'wingL', parent: 'body', chain: wing(1), test: (c, m) => c.x > 0.02 - m && c.z < -0.02 + m && c.y > 0.22 && c.y < 0.92 },
    { name: 'wingR', parent: 'body', chain: wing(-1), test: (c, m) => c.x < -0.02 + m && c.z < -0.02 + m && c.y > 0.22 && c.y < 0.92 },
    { name: 'armL', parent: 'body', pivot: [0.12, 0.70, 0.02], test: (c, m) => c.x > 0.12 - m && c.z > -0.02 && c.y > 0.45 && c.y < 0.76 },
    { name: 'armR', parent: 'body', pivot: [-0.12, 0.70, 0.02], test: (c, m) => c.x < -0.12 + m && c.z > -0.02 && c.y > 0.45 && c.y < 0.76 },
  ],
  showPoses: [0.0, 0.25, 0.5],
  pose: t => {
    const w = 2 * PI * t, f = S(w);           // f: wing beat, down at t=0.25
    const beat = k => [0, -0.16 * f * (1 + 0.2 * k), 0.2 * f * (k ? 1 : 0.5)];
    const parts = { head: [-0.12 * f, 0.15 * S(w * 0.5), 0], armL: [0, -0.3 * f, 0.5 * f + 0.2], armR: [0, 0.3 * f, -0.5 * f - 0.2] };
    for (let k = 0; k < 4; k++) { const b = beat(k); parts[`wingL${k}`] = [b[0], b[1], b[2]]; parts[`wingR${k}`] = [b[0], -b[1], -b[2]]; }
    return { body: { pos: [0, 0.06 * S(w + 1.2), 0], rot: [0.12 * S(w), 0, 0.05 * S(w * 0.5)] }, parts };
  },
};
