// The tablecloth trick, one input: the pull speed v (m/s). The simulation behind AO-092 and its <ao-demo>: the same
// file ran the experiment's 76-speed sweep, so the demo's numbers are the post's numbers.
//
// Model (one axis, x, along the pull; x = 0 is the far edge of the table, x = L the near edge
// the cloth is pulled over):
//   - The cloth moves at a constant speed v from t = 0. Its trailing edge starts at x = cloth.tail.
//   - While the cloth slides under a dish (the trailing edge has not passed the dish's centre),
//     kinetic friction drags the dish toward the puller at a = muCloth * g. That is the most
//     friction can give. If the dish ever reaches the cloth's speed, it rides with the cloth.
//   - Once the trailing edge has passed the dish's centre, the dish is on the bare table, which
//     brakes it at muTable * g until it stops.
//   - A dish whose centre passes the near edge (x > L) falls to the floor.
// Within a phase the acceleration is constant, so each time step is integrated exactly and every
// event (dish reaches cloth speed, cloth leaves the dish, dish stops, dish reaches the edge, dish
// lands) is found inside its step to floating point precision.

export const SETUP_MINE = {
  id: 'mine',
  title: 'My setup',
  g: 9.81,
  table: { length: 1.2, width: 0.8, height: 0.75, top: 0.04 },
  // A 0.60 m wide runner. Its trailing edge starts flush with the far edge (x = 0) and it hangs
  // over the near edge, where it is pulled.
  cloth: { tail: 0.0, width: 0.6 },
  dishes: [
    { id: 'plate', name: 'Plate', x0: 0.95, z: 0.0, muCloth: 0.3, muTable: 0.4, kind: 'plate', diameter: 0.27, mass: 0.6 },
    { id: 'glass', name: 'Glass', x0: 0.8, z: 0.2, muCloth: 0.25, muTable: 0.35, kind: 'glass', diameter: 0.07, height: 0.12, mass: 0.35 },
  ],
};

// One setup that matches the post's own numbers (used only for the comparison in the sweep):
// muCloth 0.25 is the post's "at most 0.25 g". 0.9 m of cloth behind the plate is what its
// "6 m/s frees the cloth in 0.15 s" implies (0.9 / 6). The bare table and the edge distance are
// fitted below by the sweep script from its 4.8 cm and 2.8 m/s, and flagged as inferred.
export function setupFromPost({ muTable, edge }) {
  const behind = 0.9;
  const L = behind + edge;
  return {
    id: 'post',
    title: 'A setup fitted to the post',
    g: 9.81,
    table: { length: L, width: 0.8, height: 0.75, top: 0.04 },
    cloth: { tail: 0.0, width: 0.6 },
    dishes: [{ id: 'plate', name: 'Plate', x0: behind, z: 0, muCloth: 0.25, muTable, kind: 'plate', diameter: 0.27, mass: 0.6 }],
  };
}

const EPS = 1e-13;

// Smallest root t > EPS of A t^2 + B t + C = 0, or Infinity.
export function firstRoot(A, B, C) {
  if (Math.abs(A) < 1e-15) {
    if (Math.abs(B) < 1e-15) return Infinity;
    const r = -C / B;
    return r > EPS ? r : Infinity;
  }
  const D = B * B - 4 * A * C;
  if (D < 0) return Infinity;
  const sq = Math.sqrt(D);
  const q = -0.5 * (B + (B >= 0 ? sq : -sq));
  const r1 = q / A;
  const r2 = q !== 0 ? C / q : Infinity;
  let best = Infinity;
  if (r1 > EPS && r1 < best) best = r1;
  if (r2 > EPS && r2 < best) best = r2;
  return best;
}

export const PHASE_LABEL = {
  cloth: 'sliding on the cloth',
  riding: 'riding with the cloth',
  table: 'braking on the table',
  stopped: 'stopped on the table',
  falling: 'falling',
  down: 'on the floor',
};

// Run one pull. Returns the summary per dish and, unless opts.trace === false, samples every
// opts.sampleEvery seconds for the page to play back.
export function simulate(setup, v, opts = {}) {
  const g = setup.g;
  const L = opts.edge ?? setup.table.length; // opts.edge = Infinity gives an endless table
  const H = setup.table.height;
  const dt = opts.dt ?? 1e-4;
  const every = opts.sampleEvery ?? 1e-3;
  const tMax = opts.tMax ?? 12;
  const keepTrace = opts.trace !== false;
  const clothGone = opts.clothGone ?? L + 0.6; // the run ends once the cloth's tail is this far along
  const c0 = setup.cloth.tail;

  const dishes = setup.dishes.map((spec) => ({
    spec,
    x: spec.x0,
    u: 0,
    y: H, // height of the dish's bottom
    vy: 0,
    a: spec.muCloth * g,
    phase: 'cloth',
    peakA: 0,
    peakDrag: 0,
    peakBrake: 0,
    topU: 0,
    ev: { tMatch: null, xMatch: null, tFree: null, uFree: null, xFree: null, tEdge: null, uEdge: null, tStop: null, tLand: null, tSettle: null },
  }));

  const settled = (d) => d.phase === 'stopped' || d.phase === 'down';

  function advance(d, t0, step) {
    let t = t0;
    let rem = step;
    for (let guard = 0; rem > 1e-15 && guard < 16; guard++) {
      if (settled(d)) return;
      const c = c0 + v * t;
      let a = 0;
      let tau = rem;
      let ev = null;
      if (d.phase === 'cloth') {
        a = d.spec.muCloth * g;
        const tm = (v - d.u) / a;
        if (tm <= tau) { tau = tm; ev = 'match'; }
        const tf = firstRoot(a / 2, d.u - v, d.x - c);
        if (tf <= tau) { tau = tf; ev = 'free'; }
        const te = firstRoot(a / 2, d.u, d.x - L);
        if (te <= tau) { tau = te; ev = 'edge'; }
      } else if (d.phase === 'riding') {
        a = 0;
        const te = (L - d.x) / v;
        if (te <= tau) { tau = te; ev = 'edge'; }
      } else if (d.phase === 'table') {
        a = -d.spec.muTable * g;
        const ts = d.u / -a;
        if (ts <= tau) { tau = ts; ev = 'stop'; }
        const te = firstRoot(a / 2, d.u, d.x - L);
        if (te <= tau) { tau = te; ev = 'edge'; }
      } else if (d.phase === 'falling') {
        const tl = firstRoot(-g / 2, d.vy, d.y);
        if (tl <= tau) { tau = tl; ev = 'land'; }
        d.x += d.u * tau;
        d.y += d.vy * tau - (g * tau * tau) / 2;
        d.vy -= g * tau;
        d.a = -g;
      }
      if (d.phase !== 'falling') {
        d.x += d.u * tau + (a * tau * tau) / 2;
        d.u += a * tau;
        d.a = a;
        if (Math.abs(a) > d.peakA) d.peakA = Math.abs(a);
        if (a > d.peakDrag) d.peakDrag = a;
        if (-a > d.peakBrake) d.peakBrake = -a;
      }
      if (d.u > d.topU) d.topU = d.u;
      t += tau;
      rem -= tau;
      if (ev === 'match') {
        d.u = v;
        d.a = 0;
        d.phase = 'riding';
        d.ev.tMatch = t;
        d.ev.xMatch = d.x;
      } else if (ev === 'free') {
        d.phase = 'table';
        d.a = -d.spec.muTable * g;
        d.ev.tFree = t;
        d.ev.uFree = d.u;
        d.ev.xFree = d.x;
      } else if (ev === 'stop') {
        d.u = 0;
        d.a = 0;
        d.phase = 'stopped';
        d.ev.tStop = t;
        d.ev.tSettle = t;
      } else if (ev === 'edge') {
        d.x = L;
        d.phase = 'falling';
        d.a = -g;
        d.ev.tEdge = t;
        d.ev.uEdge = d.u;
        d.vy = 0;
        d.y = H;
      } else if (ev === 'land') {
        d.y = 0;
        d.vy = 0;
        d.a = 0;
        d.u = 0;
        d.phase = 'down';
        d.ev.tLand = t;
        d.ev.tSettle = t;
      }
    }
  }

  const samples = [];
  const snap = (t) => ({
    t,
    c: c0 + v * t,
    d: dishes.map((d) => ({ x: d.x, u: d.u, y: d.y, a: d.a, f: d.phase === 'falling' || d.phase === 'down' ? 0 : d.a, phase: d.phase, slid: Math.min(d.x, L) - d.spec.x0 })),
  });

  let t = 0;
  let n = 0;
  let nextSample = every;
  if (keepTrace) samples.push(snap(0));
  while (t < tMax) {
    for (const d of dishes) advance(d, t, dt);
    n += 1;
    t = n * dt;
    if (keepTrace && t >= nextSample - 1e-12) {
      samples.push(snap(t));
      nextSample += every;
    }
    const allSettled = dishes.every(settled);
    if (allSettled && c0 + v * t >= clothGone) break;
    if (opts.stopWhenSettled && allSettled) break;
  }
  if (keepTrace && samples[samples.length - 1].t < t) samples.push(snap(t));

  const tSettled = Math.max(...dishes.map((d) => d.ev.tSettle ?? t));
  return {
    v,
    setupId: setup.id,
    edge: L,
    dt,
    every,
    tEnd: t,
    tSettled,
    steps: n,
    dishes: dishes.map((d) => {
      const fell = d.ev.tEdge !== null;
      return {
        id: d.spec.id,
        name: d.spec.name,
        x0: d.spec.x0,
        toEdge: L - d.spec.x0,
        clothBehind: d.spec.x0 - c0,
        muCloth: d.spec.muCloth,
        muTable: d.spec.muTable,
        fell,
        rode: d.ev.tMatch !== null,
        // how far its centre moved: to its stop, or to the edge for a dish that fell
        slid: (fell ? L : d.x) - d.spec.x0,
        slidOnCloth: (d.ev.xFree ?? d.ev.xMatch ?? (fell ? L : d.x)) - d.spec.x0,
        peakA: d.peakA,
        peakAg: d.peakA / g,
        peakDrag: d.peakDrag,
        peakDragG: d.peakDrag / g,
        peakBrake: d.peakBrake,
        topU: d.topU,
        ...d.ev,
      };
    }),
    samples,
  };
}

// The slowest pull at which a dish stays on the table, by bisection on the simulation itself.
export function cutoff(setup, dishId, { lo = 0.05, hi = 40, tol = 1e-4, dt } = {}) {
  const falls = (v) => simulate(setup, v, { trace: false, dt, stopWhenSettled: true }).dishes.find((d) => d.id === dishId).fell;
  if (!falls(lo)) return lo;
  if (falls(hi)) return Infinity;
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2;
    if (falls(mid)) lo = mid;
    else hi = mid;
  }
  return hi;
}

// The state at any time t of a run's trace, linearly interpolated between samples.
export function stateAt(run, t) {
  const s = run.samples;
  if (t <= s[0].t) return s[0];
  const last = s[s.length - 1];
  if (t >= last.t) return last;
  const i = Math.min(s.length - 2, Math.max(0, Math.floor(t / run.every)));
  let k = i;
  while (k < s.length - 2 && s[k + 1].t < t) k++;
  while (k > 0 && s[k].t > t) k--;
  const A = s[k];
  const B = s[k + 1];
  const f = (t - A.t) / (B.t - A.t || 1);
  return {
    t,
    c: A.c + (B.c - A.c) * f,
    d: A.d.map((da, j) => {
      const db = B.d[j];
      return {
        x: da.x + (db.x - da.x) * f,
        u: da.u + (db.u - da.u) * f,
        y: da.y + (db.y - da.y) * f,
        a: f < 0.5 ? da.a : db.a,
        f: f < 0.5 ? da.f : db.f,
        phase: f < 0.5 ? da.phase : db.phase,
        slid: da.slid + (db.slid - da.slid) * f,
      };
    }),
  };
}
