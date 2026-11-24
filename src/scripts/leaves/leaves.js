// The leaves: the word-leaf from the homepage's sentence (it lands first, on the hot water), one per filed entry
// (oldest first, the newest six last and one by one), and the fannings, the dust of the tin. Each lands, wets
// (hydration 1 - exp(-t / tau)), sinks once it is heavier than water, unrolls, turns along the shear (a simplified
// Jeffery orbit) and rides the swirl: floating leaves out to the rim, sunk ones in to the middle. Late in the
// spin-down a capped spring lets them catch on the number's slots. Pure.
import { radial, shear, vTheta } from './flow.js';
import { ageDays, extract } from '../../lib/leaves.js';
import { clamp, curl2, smooth } from './rng.js';

export const ENTRY = 0, FAN = 1, WORD = 2;
export const FANNINGS = 220;
export const HB = 2.6;                      // the bowl's bottom rises HB * r^4 cm toward the wall
export const ASSIGN_AT = 7.2;               // when the leaves find their slots
export const WORD_LAND = 1.65;              // when the word-leaf, falling since the room opened, meets the tea
export const NEWEST = 6;                    // the newest entries, poured last, one at a time
const DROP0 = 1.95, DROP_GAP = 0.021;
const RELEASE = 0.85;                       // how fast a wet leaf gives up its color, per second

const leafLength = (words) => clamp(0.056 + Math.sqrt(Math.max(0, words)) * 0.0007, 0.058, 0.1);

function particle(rng, o) {
  return { x: 0, y: 0, vr: 0, vt: 0, a: rng() * Math.PI * 2, z: 0, hyd: 0, wetT: -1, unroll: 0, sunk: false,
    tau: 1, sinkAt: 0.6, landed: false, slot: -1, tx: 0, ty: 0, ta: 0, dregs: false, released: 0, e0: 0, E: 0,
    seed: Math.floor(rng() * 6), days: 0, len: 0.06, heap: 0.04 + 0.26 * Math.sqrt(rng()), ...o };
}

export function makeLeaves(data, rng) {
  const ps = [];
  const sweep = rng() * Math.PI * 2;
  // the word-leaf: open, never rolled, a little larger than the rest (brew.js puts it across the cup from the pour)
  const wa = sweep + 2.4;
  ps.push(particle(rng, { kind: WORD, id: 'leaves', title: '', drop: WORD_LAND, len: 0.088, days: 0, unroll: 1,
    x: Math.cos(wa) * 0.3, y: Math.sin(wa) * 0.3, tau: 2.2, sinkAt: 0.62, seed: -1 }));
  const n = data.leaves.length;
  data.leaves.forEach((l, i) => {
    const days = ageDays(l.date, data.built);
    const e0 = extract(days);
    const j = i - (n - NEWEST);
    const drop = DROP0 + i * DROP_GAP + (j >= 0 ? 0.18 + j * 0.054 : 0);
    const ang = sweep + (drop - DROP0) * 3.6 + (rng() - 0.5) * 0.7;
    const r = 0.22 + rng() * 0.5;
    ps.push(particle(rng, { kind: ENTRY, idx: i, id: l.id, title: l.title, days, e0, E: e0, drop, newest: j >= 0,
      len: leafLength(l.words), x: Math.cos(ang) * r, y: Math.sin(ang) * r, tau: 1.0 + rng() * 2.0,
      sinkAt: 0.5 + rng() * 0.25 }));
  });
  for (let i = 0; i < FANNINGS; i++) {
    const drop = DROP0 + rng() * 1.6;
    const ang = sweep + (drop - DROP0) * 3.6 + (rng() - 0.5) * 1.6;
    const r = Math.sqrt(rng()) * 0.8;
    ps.push(particle(rng, { kind: FAN, drop, len: 0.008 + rng() * 0.006, x: Math.cos(ang) * r, y: Math.sin(ang) * r,
      tau: 0.4 + rng() * 0.9, sinkAt: 0.35 + rng() * 0.3, days: rng() * 120 }));
  }
  return ps;
}

// Depth of tea over the bottom at radius r, in cm, for a water line at W cm.
export const depthAt = (W, r) => Math.max(0, W - HB * r * r * r * r);

// Gives every leaf a slot: the entries (and the word-leaf) first, spread evenly along the strokes, then the
// fannings; each group matched to its slots by polar angle, so paths are short and run with the inward drift. The
// outermost tenth of the fannings stay free dregs past r = 0.55.
export function assign(ps, slots, rng) {
  const angle = (o) => Math.atan2(o.y, o.x);
  const big = ps.filter((p) => p.kind !== FAN), fans = ps.filter((p) => p.kind === FAN);
  const take = new Set();
  for (let k = 0; k < big.length; k++) take.add(Math.min(slots.length - 1, Math.floor((k + 0.5) * slots.length / big.length)));
  const bigSlots = [...take].map((i) => slots[i]);
  const fanSlots = slots.filter((_, i) => !take.has(i));
  const pair = (leaves, targets) => {
    const ls = [...leaves].sort((a, b) => angle(a) - angle(b));
    const ts = [...targets].sort((a, b) => angle(a) - angle(b));
    ls.forEach((p, i) => { const s = ts[i % ts.length]; p.slot = i; p.tx = s.x; p.ty = s.y; p.ta = s.angle; });
  };
  pair(big, bigSlots);
  const byR = [...fans].sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  const placed = byR.slice(0, fanSlots.length), dregs = byR.slice(fanSlots.length);
  pair(placed, fanSlots);
  for (const p of dregs) {
    const a = angle(p) + (rng() - 0.5) * 0.6, r = 0.6 + rng() * 0.24;
    p.dregs = true; p.slot = 0; p.tx = Math.cos(a) * r; p.ty = Math.sin(a) * r; p.ta = rng() * Math.PI;
  }
}

// How hard the slots pull: only in the spin-down's last seconds, and never while the tea still spins hard.
export function guideWeight(s) {
  if (s.t < ASSIGN_AT) return 0;
  const ramp = smooth(ASSIGN_AT, ASSIGN_AT + 2.5, s.t);
  return ramp * (1 - smooth(0.3, 2.1, Math.abs(s.gamma)));
}

export function stepLeaves(s, dt, dye, deposit) {
  const g = s.gamma, w = guideWeight(s), late = smooth(9, 12, s.t);
  const vmax = 0.22 + 0.3 * late;
  for (const p of s.leaves) {
    if (s.t < p.drop) continue;
    if (!p.landed) { p.landed = true; s.events.push({ type: 'land', kind: p.kind, x: p.x, y: p.y, len: p.len, newest: !!p.newest }); }
    const r = Math.hypot(p.x, p.y) || 1e-6;
    const D = depthAt(s.W, r);
    if (D > 0.04 && p.wetT < 0) p.wetT = s.t;
    if (p.wetT >= 0) p.hyd = 1 - Math.exp(-(s.t - p.wetT) / p.tau);
    if (!p.sunk && p.hyd > p.sinkAt) p.z = Math.min(1, p.z + dt * (0.5 + 1.6 * (p.hyd - p.sinkAt)));
    if (p.z >= 1) p.sunk = true;
    if (p.kind === ENTRY) p.unroll = smooth(0.3, 0.95, p.hyd) * smooth(0.1, 0.9, p.z);
    // color leaves a wet leaf while it is under the tea
    if (p.E > 0 && p.hyd > 0 && D > 0.04) {
      const out = p.E * (1 - Math.exp(-RELEASE * p.hyd * dt));
      p.E -= out; p.released += out;
      if (dye) deposit(dye, p.x, p.y, out);
    }
    if (D <= 0.02 && p.wetT < 0) continue;      // dry on a dry bottom: it stays put
    // ride the swirl in polar form (tangential, radial), so the circle itself adds no drift
    const z = p.z, bottom = p.sunk ? 0.7 : 1;
    const calm = 1 - 0.75 * (p.slot >= 0 ? w : 0);
    const [ex, ey] = curl2(p.x * 3 + s.t * 0.11, p.y * 3, s.seed + 5);
    const eddy = 0.02 + 0.05 * Math.min(1, Math.abs(g) / 3);
    const cx = p.x / r, cy = p.y / r;
    const ut = (vTheta(g, r) * (1 - 0.5 * z) * bottom + (-cy * ex + cx * ey) * eddy) * calm;
    // along the bottom the inflow stops where the heap is: each leaf has its place in it, out to r = 0.3
    const heap = smooth(p.heap - 0.03, p.heap + 0.08, r);
    const ur = ((radial(g, r, 'surface') * (1 - z) + radial(g, r, 'bottom') * z * heap) + (cx * ex + cy * ey) * eddy) * calm;
    const k = 1 - Math.exp(-dt / (p.sunk ? 0.12 : 0.3));
    p.vt += (ut - p.vt) * k; p.vr += (ur - p.vr) * k;
    const turn = p.vt * dt / r, ct = Math.cos(turn), st = Math.sin(turn);
    const nr0 = Math.max(0.002, r + p.vr * dt);
    p.x = (cx * ct - cy * st) * nr0; p.y = (cx * st + cy * ct) * nr0;
    if (p.slot >= 0 && w > 0) {
      const dx = p.tx - p.x, dy = p.ty - p.y, dist = Math.hypot(dx, dy);
      if (dist > 1e-5) {
        const pull = Math.min(dist * 2.4, vmax) * w * (p.dregs ? 0.6 : 1);
        p.x += dx / dist * pull * dt; p.y += dy / dist * pull * dt;
      }
    }
    const nr = Math.hypot(p.x, p.y), rmax = (p.sunk ? 0.93 : 0.9) - p.len * 0.45;
    if (nr > rmax) { p.x *= rmax / nr; p.y *= rmax / nr; if (p.vr > 0) p.vr = 0; }
    // turn along the shear: d(phi)/dt = zeta / 2 + lambda * strain / 2 * cos(2 (phi - theta))
    const { zeta, strain } = shear(g * (1 - 0.5 * z) * bottom, r);
    const th = Math.atan2(p.y, p.x);
    p.a += (zeta / 2 + 0.9 * strain / 2 * Math.cos(2 * (p.a - th))) * dt;
    if (p.slot >= 0 && w > 0.3 && !p.dregs) {
      let d = ((p.ta - p.a) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2;
      p.a += d * Math.min(1, dt * 2.2 * w);
    }
  }
}
