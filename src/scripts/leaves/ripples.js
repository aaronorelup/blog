// The tea's surface waves: a damped 2D wave equation on a 96 by 96 grid over the cup ([-1, 1] each way), masked to
// the cup's own uneven wall (the rim's radius at each angle), which reflects them. Leaves landing, the pour, sips and
// a finger all disturb it; liquid.js bends the lamp's reflection by its slope. Pure: no DOM.

export const M = 96;
const CELL = 2 / M;

// wall(angle) gives the wall's radius in cup units (cup.js perturbs the rim with the same function).
export function makeRipples(wall) {
  const inside = new Uint8Array(M * M);
  for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
    const x = -1 + (i + 0.5) * CELL, y = -1 + (j + 0.5) * CELL;
    if (Math.hypot(x, y) < wall(Math.atan2(y, x)) - CELL) inside[j * M + i] = 1;
  }
  return { h: new Float32Array(M * M), prev: new Float32Array(M * M), inside, energy: 0 };
}

// A drop of size `amp` (negative pushes the surface down) spread over `radius` cup units.
export function disturb(w, x, y, amp, radius = 0.05) {
  const ci = (x + 1) / CELL, cj = (y + 1) / CELL, rr = Math.max(1, radius / CELL);
  const lo = Math.floor(-rr * 2), hi = Math.ceil(rr * 2);
  for (let j = lo; j <= hi; j++) for (let i = lo; i <= hi; i++) {
    const ii = Math.floor(ci) + i, jj = Math.floor(cj) + j;
    if (ii < 1 || jj < 1 || ii >= M - 1 || jj >= M - 1) continue;
    const k = jj * M + ii;
    if (!w.inside[k]) continue;
    const dx = ii + 0.5 - ci, dy = jj + 0.5 - cj;
    w.h[k] += amp * Math.exp(-(dx * dx + dy * dy) / (rr * rr));
  }
}

// A slosh: the whole surface tipped toward (dx, dy), as a sip leaves it.
export function tip(w, dx, dy, amp) {
  for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
    const k = j * M + i;
    if (w.inside[k]) w.h[k] += amp * ((-1 + (i + 0.5) * CELL) * dx + (-1 + (j + 0.5) * CELL) * dy);
  }
}

export function stepRipples(w, damp = 0.986) {
  const { h, prev, inside } = w;
  const c2 = 0.36;
  let e = 0;
  for (let j = 1; j < M - 1; j++) for (let i = 1; i < M - 1; i++) {
    const k = j * M + i;
    if (!inside[k]) continue;
    const v = h[k];
    const l = inside[k - 1] ? h[k - 1] : v, r = inside[k + 1] ? h[k + 1] : v;
    const u = inside[k - M] ? h[k - M] : v, d = inside[k + M] ? h[k + M] : v;
    const next = (2 * v - prev[k] + c2 * (l + r + u + d - 4 * v)) * damp;
    prev[k] = next;
    e += next * next;
  }
  w.h = prev; w.prev = h;
  w.energy = e;
}

// The surface slope at a point, in height units per cup unit: [dh/dx, dh/dy].
export function slope(w, x, y) {
  const fi = (x + 1) / CELL - 0.5, fj = (y + 1) / CELL - 0.5;
  const i = Math.max(1, Math.min(M - 2, Math.round(fi))), j = Math.max(1, Math.min(M - 2, Math.round(fj)));
  const k = j * M + i, h = w.h;
  return [(h[k + 1] - h[k - 1]) / (2 * CELL), (h[k + M] - h[k - M]) / (2 * CELL)];
}
