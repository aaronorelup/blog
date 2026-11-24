// The lesson's physics: a ball thrown sideways from 1 km above a round, airless Moon that doesn't spin, pulled by
// the Moon alone. Units: km and seconds. The real engine and its deliberately broken twins share one shape, so the
// checks (checks.js) run on any of them without knowing which one they have.

export const GM = 4902.8;      // km^3/s^2, the Moon's gravity (JPL's DE440 ephemeris: 4902.8001)
export const R = 1737.4;       // km, the Moon's mean radius (NASA's Moon fact sheet)
export const HEIGHT = 1;       // km, the throw height
export const EDGE = 60000;     // km, about where Earth's pull takes over (the Moon's Hill sphere, about 61,500 km)
export const DT = 2;           // s, one step of the engine

// Gravity: each sets s.ax and s.ay from s.x and s.y.
const PULLS = {
  inverseSquare: (GMx) => (s) => {
    const r2 = s.x * s.x + s.y * s.y;
    const k = -GMx / (r2 * Math.sqrt(r2));
    s.ax = k * s.x;
    s.ay = k * s.y;
  },
  // Toward the centre, but as strong at every height as it is at the ground.
  constant: (GMx, Rx) => {
    const g = GMx / (Rx * Rx);
    return (s) => {
      const r = Math.sqrt(s.x * s.x + s.y * s.y);
      s.ax = (-g * s.x) / r;
      s.ay = (-g * s.y) / r;
    };
  },
  // Straight down, the same everywhere: the school projectile.
  flat: (GMx, Rx) => {
    const g = GMx / (Rx * Rx);
    return (s) => {
      s.ax = 0;
      s.ay = -g;
    };
  },
};

// One step of dt. Velocity Verlet keeps the acceleration from the end of the last step, and the real engine runs it
// three times a step at Yoshida's sizes, which is far more exact for the same work.
const CBRT2 = Math.cbrt(2);
const W1 = 1 / (2 - CBRT2);       // Yoshida's sizes for three Verlet steps that add up to one, the middle one
const W0 = -CBRT2 / (2 - CBRT2);  // backwards, so their errors cancel up to the fourth power of the step
const STEPS = {
  yoshida(s, dt, pull) {
    STEPS.verlet(s, W1 * dt, pull);
    STEPS.verlet(s, W0 * dt, pull);
    STEPS.verlet(s, W1 * dt, pull);
  },
  verlet(s, dt, pull) {
    s.vx += 0.5 * dt * s.ax;
    s.vy += 0.5 * dt * s.ay;
    s.x += dt * s.vx;
    s.y += dt * s.vy;
    pull(s);
    s.vx += 0.5 * dt * s.ax;
    s.vy += 0.5 * dt * s.ay;
    s.t += dt;
  },
  // Explicit Euler: moves with the old speed, then changes the speed with the old pull.
  euler(s, dt, pull) {
    pull(s);
    const vx = s.vx;
    const vy = s.vy;
    s.vx += dt * s.ax;
    s.vy += dt * s.ay;
    s.x += dt * vx;
    s.y += dt * vy;
    s.t += dt;
  },
};

function makeEngine({ id, label, note, GM: GMx = GM, R: Rx = R, dt = DT, pull = 'inverseSquare', step = 'yoshida',
  ground = 'round', touchdown = true }) {
  const pullFn = PULLS[pull](GMx, Rx);
  const stepFn = STEPS[step];
  const flat = ground === 'flat';
  const E = {
    id, label, note, GM: GMx, R: Rx, dt, touchdown, flat,
    // The ball in the hand, h km above the ground, moving sideways at v km/s.
    start(v, h = HEIGHT) {
      const s = { t: 0, x: 0, y: Rx + h, vx: v, vy: 0, ax: 0, ay: 0 };
      pullFn(s);
      return s;
    },
    step(s, d = dt) { stepFn(s, d, pullFn); },
    // A copy of s moved on by d seconds (d up to one step), for finding the moment something happens inside a step.
    partial(s, d) { const c = { ...s }; stepFn(c, d, pullFn); return c; },
    alt: flat ? (s) => s.y - Rx : (s) => Math.sqrt(s.x * s.x + s.y * s.y) - Rx,
    // Distance from the throw point, measured along the ground.
    along: flat ? (s) => s.x : (s) => Rx * turnOf(s),
  };
  return E;
}

// Angle around the Moon's centre from the throw point (straight up), clockwise, from -pi to pi.
export const turnOf = (s) => Math.atan2(s.x, s.y);

export const ENGINES = [
  makeEngine({ id: 'real', label: 'The real engine',
    note: 'Two-second steps of velocity Verlet done three times at Yoshida\'s sizes, gravity that weakens with the square of the distance, and the exact moment of touchdown.' }),
  makeEngine({ id: 'euler', label: 'Euler steps', step: 'euler',
    note: 'The textbook step: move with the old speed, then change the speed. Every orbit gains a little energy each step.' }),
  makeEngine({ id: 'flat', label: 'Flat Moon', pull: 'flat', ground: 'flat',
    note: 'Gravity straight down at 1.62 m/s² over flat ground, like a school projectile problem.' }),
  makeEngine({ id: 'constant', label: 'Same pull at every height', pull: 'constant',
    note: 'Gravity points at the centre but never weakens with height.' }),
  makeEngine({ id: 'late', label: 'Lands a step late', touchdown: false,
    note: 'Stops at the end of the first step underground instead of finding the moment it touched.' }),
  makeEngine({ id: 'typo', label: 'One typo in the Moon', GM: 4092.8,
    note: 'GM typed as 4092.8 instead of 4902.8. Every law still holds, for the wrong Moon.' }),
];
export const engineById = (id) => ENGINES.find((e) => e.id === id) || ENGINES[0];

// The moment inside one step (from `from`, dt long) where f(state) goes from >= 0 to < 0, by halving the step.
export function inside(E, from, dt, f) {
  let lo = 0;
  let hi = dt;
  for (let i = 0; i < 44; i++) {
    const mid = 0.5 * (lo + hi);
    if (f(E.partial(from, mid)) < 0) hi = mid;
    else lo = mid;
  }
  return E.partial(from, hi);
}

// Fly one throw. Stops when it lands, reaches the edge, finishes `laps` laps around the centre, or at tMax.
// onStep(prev, s) sees every step. With `path`, keeps up to about that many [t, x, y, vx, vy] points for drawing.
export function fly(E, v, { h = HEIGHT, laps = 0, tMax = 2e6, edge = EDGE, onStep = null, path = 0 } = {}) {
  const s = E.start(v, h);
  const p = { ...s };
  const lapTimes = [];
  const pts = path ? [[0, s.x, s.y, s.vx, s.vy]] : null;
  const edge2 = edge * edge;
  let every = 1;
  let n = 0;
  let highest = E.alt(s);
  const done = (fate, at, extra) => {
    if (pts && pts[pts.length - 1][0] !== at.t) pts.push([at.t, at.x, at.y, at.vx, at.vy]);
    return { fate, t: at.t, end: at, lapTimes, highest, path: pts, ...extra };
  };
  while (s.t < tMax) {
    p.t = s.t; p.x = s.x; p.y = s.y; p.vx = s.vx; p.vy = s.vy; p.ax = s.ax; p.ay = s.ay;
    E.step(s);
    n++;
    if (onStep) onStep(p, s);
    const a = E.alt(s);
    if (a > highest) highest = a;
    if (a < 0) {
      const hit = E.touchdown ? inside(E, p, E.dt, E.alt) : s;
      return done('landed', hit, { along: E.along(hit) });
    }
    if (s.x * s.x + s.y * s.y > edge2) {
      return done('escaped', inside(E, p, E.dt, (m) => edge - Math.sqrt(m.x * m.x + m.y * m.y)), {});
    }
    // A lap ends where the ball crosses the line from the centre up through the throw point again.
    if (p.x < 0 && s.x >= 0 && s.y > 0) {
      const at = inside(E, p, E.dt, (m) => -m.x);
      lapTimes.push(at.t);
      if (laps && lapTimes.length >= laps) return done('laps', at, {});
    }
    if (pts && n % every === 0) {
      pts.push([s.t, s.x, s.y, s.vx, s.vy]);
      if (pts.length > 2 * path) {
        for (let i = 1, j = 2; j < pts.length; i++, j += 2) pts[i] = pts[j];
        pts.length = Math.ceil(pts.length / 2);
        every *= 2;
      }
    }
  }
  return done('flying', s, {});
}

// Energy and angular momentum per kilogram, for a Moon of gravity GMx.
export const energy = (s, GMx) => 0.5 * (s.vx * s.vx + s.vy * s.vy) - GMx / Math.sqrt(s.x * s.x + s.y * s.y);
export const spin = (s) => s.x * s.vy - s.y * s.vx;
