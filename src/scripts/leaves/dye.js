// The color in the tea: a 64 by 64 grid over the cup ([-1, 1] each way). Leaves splat what they release as small
// Gaussians; the swirl carries it round semi-Lagrangianly (each cell looks back along its circle by omega(r) dt),
// with a little curl noise for eddies and a light blur every third step. Pure: (state, dt), no DOM.
import { RC } from './flow.js';
import { curl2 } from './rng.js';

export const N = 64;
const CELL = 2 / N;
const KERNEL = [];
for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) KERNEL.push([i, j, Math.exp(-(i * i + j * j) / 1.8)]);
const KSUM = KERNEL.reduce((n, k) => n + k[2], 0);

// Per cell, once: inside the cup or not, the swirl's angular speed per unit circulation (flow.js omega / gamma),
// and two fixed curl fields whose blend drifts with time, for eddies.
export function makeDye(seed = 0) {
  const inside = new Uint8Array(N * N), spin = new Float32Array(N * N), eddy = new Float32Array(N * N * 4);
  let cells = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = j * N + i, x = -1 + (i + 0.5) * CELL, y = -1 + (j + 0.5) * CELL, r2 = Math.max(x * x + y * y, 1e-3);
    if (r2 < 0.985) { inside[k] = 1; cells++; }
    spin[k] = (1 - Math.exp(-r2 / (RC * RC))) / (2 * Math.PI * r2);
    const [a, b] = curl2(x * 2.2, y * 2.2, seed), [c, d] = curl2(x * 2.2 + 9, y * 2.2 - 5, seed + 1);
    eddy.set([a, b, c, d], k * 4);
  }
  return { c: new Float32Array(N * N), tmp: new Float32Array(N * N), inside, spin, eddy, cells, frame: 0 };
}

// Adds `amount` (in mixed-cup units: spread evenly it raises every cell by amount / cells) around (x, y).
export function deposit(d, x, y, amount) {
  if (amount < 1e-7) return;
  const ci = Math.floor((x + 1) / CELL), cj = Math.floor((y + 1) / CELL);
  const per = amount * d.cells / KSUM;
  for (const [i, j, w] of KERNEL) {
    const ii = ci + i, jj = cj + j;
    if (ii < 0 || jj < 0 || ii >= N || jj >= N || !d.inside[jj * N + ii]) continue;
    d.c[jj * N + ii] += per * w;
  }
}

// Bilinear concentration at a point in cup units.
export function sample(c, x, y) {
  const fx = (x + 1) / CELL - 0.5, fy = (y + 1) / CELL - 0.5;
  let i = Math.floor(fx), j = Math.floor(fy);
  const tx = fx - i, ty = fy - j;
  if (i < 0) i = 0; if (j < 0) j = 0; if (i > N - 2) i = N - 2; if (j > N - 2) j = N - 2;
  const k = j * N + i;
  return (c[k] * (1 - tx) + c[k + 1] * tx) * (1 - ty) + (c[k + N] * (1 - tx) + c[k + N + 1] * tx) * ty;
}

export function advect(d, gamma, dt, t) {
  const { c, tmp, inside, spin, eddy } = d;
  const swirl = 0.8 * gamma * dt;   // the dye fills the whole depth: a little slower than the surface
  const m = 0.5 + 0.5 * Math.sin(t * 0.37), e = 0.04 * dt;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = j * N + i;
    if (!inside[k]) { tmp[k] = 0; continue; }
    const x = -1 + (i + 0.5) * CELL, y = -1 + (j + 0.5) * CELL;
    const a = -spin[k] * swirl, ca = 1 - a * a * 0.5, sa = a - a * a * a / 6;   // a stays under 0.2 rad
    const q = k * 4, ex = eddy[q] * (1 - m) + eddy[q + 2] * m, ey = eddy[q + 1] * (1 - m) + eddy[q + 3] * m;
    tmp[k] = sample(c, x * ca - y * sa - ex * e, x * sa + y * ca - ey * e);
  }
  d.c = tmp; d.tmp = c;
  if (++d.frame % 3 === 0) blur(d);
}

function blur(d) {
  const { c, tmp, inside } = d;
  for (let pass = 0; pass < 2; pass++) {
    const src = pass ? tmp : c, dst = pass ? c : tmp, step = pass ? N : 1;
    for (let k = 0; k < N * N; k++) {
      if (!inside[k]) { dst[k] = 0; continue; }
      const a = inside[k - step] ? src[k - step] : src[k], b = inside[k + step] ? src[k + step] : src[k];
      dst[k] = src[k] * 0.6 + (a + b) * 0.2;
    }
  }
}
