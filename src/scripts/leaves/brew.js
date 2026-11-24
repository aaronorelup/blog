// The brew's timeline, in sim time (index.js keeps it on the wall clock): rise, pour, the word-leaf lands, infuse,
// swirl, settle, sip, reveal, slip, rest. One step(s, dt) moves the water line, the swirl, the leaves, the dye, the
// waves and the heat, and queues events (a tock, a landing, a sip) for sound and paint. Pure: a headless run
// (tests/unit/leaves.test.mjs) brews the same cup from the same seed. Stirring adds to the swirl, and the sips wait
// for it to die down.
import { advect, deposit, makeDye } from './dye.js';
import { spinDown, stir as addSpin, vTheta } from './flow.js';
import { sampleSlots } from './glyphs.js';
import { ASSIGN_AT, HB, WORD, assign, depthAt, makeLeaves, stepLeaves } from './leaves.js';
import { disturb, makeRipples, stepRipples, tip } from './ripples.js';
import { mulberry32, noise2, smooth } from './rng.js';
import { digitsOf } from '../../data/leaves.js';

export const DT = 1 / 60;
export const W_FULL = 3.0;                      // the water line when full, cm over the bottom's centre
const W_SIPS = [3.0, 2.05, 1.2, 0.5];           // after each of three sips
const W_END = 0.13;                             // a film over the middle: the waterline back at the foot
export const RISE = 0.5;                        // the tray and cup come up; the cup tocks on the wood
export const POUR = [0.55, 1.5];
// After the last sip, the reveal (at 12.6 s if nobody stirred), then the slip, the rest and the end, in seconds.
const REVEAL = 12.6, DRAIN = 3, SLIP = 2.6, REST = 5, END = 11;
const DYE_MIX = 0.85;
const SIP_LEN = 0.72, SIP_GAP = 1.25, FIRST_SIP = 9.2, SIP_FROM = 8.8;
export const PHASES = ['rise', 'pour', 'infuse', 'swirl', 'settle', 'sip', 'reveal', 'slip', 'rest'];

// The rim: a hand-thrown circle, the same at every size (cup.js draws it, the waves reflect off it).
export const wallOf = (seed) => (a) => 1 + (noise2(Math.cos(a) * 1.6 + 4, Math.sin(a) * 1.6 + 4, seed) - 0.5) * 0.045;

export function createBrew(data, seed, { quick = false } = {}) {
  const rng = mulberry32(seed);
  const s = {
    seed, rng, quick, data, t: 0, phase: 'rise', gamma: 0, W: 0, temp: 1, sips: 0, sipT: -1, sipFrom: 0,
    tilt: 0, next: data.next, digits: digitsOf(data.next), events: [], done: false, lastStir: -9,
    tides: [], dryFront: 1.02, breath: 0, pourAngle: 0, pourR: 0.56, spin: 1, revealT: Infinity, lastSip: 0, rings: [],
  };
  s.leaves = makeLeaves(data, rng);
  s.slots = sampleSlots(s.digits, Math.round(s.leaves.length * 0.9), rng);
  s.dye = makeDye(seed);
  // spread evenly, all the color the leaves hold makes the tea DYE_MIX strong
  s.dyeScale = DYE_MIX / Math.max(1e-6, s.leaves.reduce((n, p) => n + p.e0, 0));
  s.wall = wallOf(seed);
  s.ripples = quick ? null : makeRipples(s.wall);
  // the pour comes in from the upper left, today's angle, and lands off-centre on a tangent
  s.spin = rng() < 0.5 ? 1 : -1;
  s.pourAngle = -2.25 + (rng() - 0.5) * 0.6;
  // the word-leaf meets the tea across the cup from where the pour lands
  const P = pourPoint(s), word = s.leaves[0];
  word.x = -P.x * 0.55; word.y = -P.y * 0.55;
  return s;
}

// Where the pour lands (cup units) and which way it runs (dx, dy): it comes from the kettle up at pourAngle and
// passes the middle at pourR, so it lands on a tangent; turn is the sign of the spin it gives.
export function pourPoint(s) {
  const dx = -Math.cos(s.pourAngle), dy = -Math.sin(s.pourAngle);
  const x = s.pourR * s.spin * -dy, y = s.pourR * s.spin * dx;
  return { x, y, dx, dy, turn: Math.sign(x * dy - y * dx) };
}

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function phaseOf(s) {
  const t = s.t;
  if (t < POUR[0]) return 'rise';
  if (t < POUR[1]) return 'pour';
  if (t < 4.2) return 'infuse';
  if (t < SIP_FROM) return 'swirl';
  if (s.sips === 0 && s.sipT < 0) return 'settle';
  if (t < s.revealT) return 'sip';
  if (t < s.revealT + SLIP) return 'reveal';
  if (t < s.revealT + REST) return 'slip';
  return 'rest';
}

function startSip(s) {
  s.sipT = s.t; s.sipFrom = s.W; s.lastSip = s.t;
  s.events.push({ type: 'sip', n: s.sips });
  if (s.ripples) tip(s.ripples, 0.15, 1, 0.012);
}

function stepLevel(s) {
  const t = s.t;
  if (t < POUR[0]) s.W = 0;
  else if (t < POUR[1]) s.W = W_FULL * ease((t - POUR[0]) / (POUR[1] - POUR[0]) * 1.05);
  if (s.sipT >= 0) {
    const k = (t - s.sipT) / SIP_LEN;
    const to = W_SIPS[s.sips + 1];
    s.W = s.sipFrom + (to - s.sipFrom) * ease(k);
    s.tilt = Math.sin(Math.min(1, k) * Math.PI) * 0.22;
    if (k >= 1) {
      s.tides.push(Math.pow(Math.max(0, s.W) / HB, 0.25));
      s.sips++; s.sipT = -1; s.tilt = 0;
      if (s.sips === 3) s.revealT = Math.max(REVEAL, t + 0.3);
    }
  }
  if (t >= s.revealT) s.W = W_SIPS[3] + (W_END - W_SIPS[3]) * ease((t - s.revealT) / DRAIN);
}

function maybeSip(s, asked) {
  if (s.sipT >= 0 || s.sips >= 3) return;
  const calm = Math.abs(s.gamma) < 0.75 && s.t - s.lastStir > 1.2;
  if (s.t < SIP_FROM || !calm) return;
  const due = s.sips === 0 ? FIRST_SIP : s.lastSip + SIP_GAP;
  if (asked ? s.sips === 0 || s.t - s.lastSip > 0.4 : s.t >= due) startSip(s);
  // the reveal waits for the last sip
}

export function step(s, dt = DT) {
  if (s.done) return;
  s.t += dt;
  const t = s.t;
  if (s.t - dt < RISE && t >= RISE) s.events.push({ type: 'tock' });
  // the pour: a tangent jet that sets the spin
  if (t >= POUR[0] && t < POUR[1]) {
    const p = pourPoint(s);
    s.gamma = addSpin(s.gamma, p.turn * 4.6 * dt / (POUR[1] - POUR[0]) * 1.5);
    if (s.ripples && Math.floor(t * 30) !== Math.floor((t - dt) * 30)) disturb(s.ripples, p.x, p.y, -0.02, 0.06);
  }
  const depth = depthAt(s.W, 0);
  if (t >= POUR[1]) s.gamma = spinDown(s.gamma, depth, dt);
  maybeSip(s, false);
  stepLevel(s);
  if (t >= ASSIGN_AT && t - dt < ASSIGN_AT) assign(s.leaves, s.slots, s.rng);
  const before = s.events.length;
  stepLeaves(s, dt, s.dye, (d, x, y, a) => deposit(d, x, y, a * s.dyeScale));
  if (s.W > 0) advect(s.dye, s.gamma, dt, t);
  for (let i = before; i < s.events.length; i++) {
    const e = s.events[i];
    if (e.kind === WORD) s.rings.push({ x: e.x, y: e.y, t });
    if (!s.ripples || e.kind === 1 || depthAt(s.W, Math.hypot(e.x, e.y)) <= 0.05) continue;
    disturb(s.ripples, e.x, e.y, e.kind === WORD ? -0.05 : -0.014, e.kind === WORD ? 0.06 : 0.035);
  }
  if (s.ripples) stepRipples(s.ripples);
  // the word-leaf's rings ride the surface swirl, as the leaf does
  for (const g of s.rings) {
    const r = Math.hypot(g.x, g.y), a = vTheta(s.gamma, r) / Math.max(r, 0.05) * dt, c = Math.cos(a), sn = Math.sin(a);
    [g.x, g.y] = [g.x * c - g.y * sn, g.x * sn + g.y * c];
  }
  if (s.rings.length && t - s.rings[0].t > 2) s.rings.shift();
  // heat: Newton's law, sped up
  if (t > POUR[0]) s.temp = Math.exp(-(t - POUR[0]) / 7.5);
  // the wet sheen dries from the rim inward, a ring at a time, and the lantern breathes once
  const rest = t - s.revealT - REST;
  if (rest > 0) {
    const k = Math.min(1, rest / 5.5);
    s.dryFront = 1.02 - (Math.floor(k * 6) + smooth(0.7, 1, (k * 6) % 1)) / 6 * 0.6;
  }
  s.breath = rest > 1.5 && rest < 5.5 ? Math.sin((rest - 1.5) / 4 * Math.PI) ** 2 * 0.06 : 0;
  const was = s.phase;
  s.phase = phaseOf(s);
  if (was !== s.phase) s.events.push({ type: 'phase', phase: s.phase });
  if (s.phase === 'slip' && was !== 'slip') s.events.push({ type: 'slip' });
  if (s.phase === 'reveal' && was !== 'reveal') s.events.push({ type: 'reveal' });
  if (t >= s.revealT + END) s.done = true;
}

// The guest's hand. A stir is a turn of `turn` radians at radius r (positive is the cup's counterclockwise).
export function stir(s, turn, r = 0.6, x, y) {
  if (s.t < POUR[0] || s.W <= 0.1) return;
  s.gamma = addSpin(s.gamma, turn * r * r * 1.8);
  s.lastStir = s.t;
  if (s.ripples && x !== undefined) disturb(s.ripples, x, y, 0.01 * Math.sign(turn), 0.05);
}
export const sip = (s) => maybeSip(s, true);
export const poke = (s, x, y) => { if (s.ripples && s.W > 0.1) disturb(s.ripples, x, y, -0.02, 0.04); };

// Runs the brew to its end at once (reduced motion, __leaves.skip()); a quick brew takes 30 steps a second.
export function runToRest(s) {
  let guard = 0;
  const dt = s.quick ? DT * 2 : DT;
  while (!s.done && guard++ < 60 * 90) { step(s, dt); s.events.length = 0; }
}

export const surfaceSpeed = (s, r) => vTheta(s.gamma, r);
