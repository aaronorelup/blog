// Seeded randomness for the leaves room: mulberry32, a string hash for the day's seed, smooth value noise and its
// curl. Pure, so a headless brew (tests/unit/leaves.test.mjs) draws the same cup from the same seed.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// The visitor's own calendar day: each day pours differently, and every day reads the same number.
export const daySeed = (d = new Date()) =>
  hashString(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);

function lattice(x, y, s) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Value noise in [0, 1], smooth between integer lattice points.
export function noise2(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = lattice(xi, yi, s), b = lattice(xi + 1, yi, s);
  const c = lattice(xi, yi + 1, s), d = lattice(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x, y, s = 0, octaves = 3) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let o = 0; o < octaves; o++) { sum += amp * noise2(x * f, y * f, s + o * 17); norm += amp; amp *= 0.5; f *= 2.03; }
  return sum / norm;
}

// The curl of the noise field: a divergence-free stir, used for small eddies in the dye and the steam.
export function curl2(x, y, s = 0) {
  const e = 0.05;
  const dx = noise2(x + e, y, s) - noise2(x - e, y, s);
  const dy = noise2(x, y + e, s) - noise2(x, y - e, s);
  return [dy / (2 * e), -dx / (2 * e)];
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
