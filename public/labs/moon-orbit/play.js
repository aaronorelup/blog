// Throwing: each throw is flown once, whole, by the engine the checks passed, then played back faster than life with
// the camera following. The picture only replays those points. It never steps the physics itself.
import { GM, HEIGHT, R, fly } from './engine.js';
import { vEsc } from './kepler.js';
import { at, fmtKm } from './view.js';

const V_ESC = vEsc(GM, R + HEIGHT);
const G0 = GM / (R * R);
const ROUND = 2 * Math.PI * R;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const wrap = (a) => (a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a);
const num = (x, d) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export function clock(s) {
  if (s < 90) return `${Math.round(s)} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
  if (s < 172800) return `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`;
  return `${num(s / 86400, 1)} days`;
}

// One throw, flown whole. fate: landed, orbit, gone (past escape speed), or hill (bound, but out past 60,000 km).
export function flight(E, v) {
  let lowest = HEIGHT;
  const f = fly(E, v, { laps: 1, tMax: 6e5, path: 2400,
    onStep: (p, s) => { const a = E.alt(s); if (a < lowest) lowest = a; } });
  const fate = f.fate === 'landed' ? 'landed' : f.fate === 'laps' ? 'orbit' : v >= V_ESC ? 'gone' : 'hill';
  const T = fate === 'orbit' ? f.lapTimes[0] : f.t;
  const strip = [];
  let turn = 0;
  let prev = 0;
  for (const [t, x, y] of f.path) {
    const a = Math.atan2(x, y);
    turn += wrap(a - prev);
    prev = a;
    strip.push([t, R * turn, Math.sqrt(x * x + y * y) - R]);
  }
  const out = Math.sqrt(f.end.vx * f.end.vx + f.end.vy * f.end.vy);
  return { v, fate, T, path: f.path, strip, end: f.end, along: f.along, highest: f.highest, lowest, lapT: f.lapTimes[0],
    flat: v * Math.sqrt((2 * HEIGHT) / G0), out };
}

export function createPlayer({ view, S, reduce, mode, readout, onDone }) {
  let raf = 0;
  let last = 0;
  let snap = true;
  const kick = () => { if (!raf) raf = window.requestAnimationFrame(tick); };
  // How far down the readout reaches, measured after this frame's text is in, so the camera frames below it.
  const textBottom = () => (readout.hidden || !readout.textContent ? 0 : readout.offsetTop + readout.offsetHeight);

  function start(F) {
    if (S.current) S.old.unshift(S.current.F);
    S.old.length = Math.min(S.old.length, 5);
    const dur = reduce ? 0 : clamp(1.4 + 1.15 * Math.log10(Math.max(F.T, 35) / 35), 1.4, 7.5);
    S.current = { F, dur, warp: dur ? F.T / dur : Infinity, start: performance.now(), done: false };
    kick();
  }

  // The points the camera should frame: the thrower and the throw, all of it for a landing, so far for the rest.
  function box(F, t) {
    const b = { x0: -0.6, x1: 0.6, y0: R - 0.3, y1: R + HEIGHT + 0.3 };
    for (const p of F.path) {
      if (p[0] > t) break;
      if (p[1] < b.x0) b.x0 = p[1];
      if (p[1] > b.x1) b.x1 = p[1];
      if (p[2] < b.y0) b.y0 = p[2];
      if (p[2] > b.y1) b.y1 = p[2];
    }
    return b;
  }

  // The height strip up to time t, its last point placed exactly where the ball is.
  function strip(F, t) {
    const pts = [];
    let i = 0;
    for (; i < F.strip.length && F.strip[i][0] <= t; i++) pts.push([F.strip[i][1], F.strip[i][2]]);
    if (i > 0 && i < F.strip.length) {
      const [x, y] = at(F.path, t);
      const p = F.path[i - 1];
      pts.push([F.strip[i - 1][1] + R * wrap(Math.atan2(x, y) - Math.atan2(p[1], p[2])), Math.sqrt(x * x + y * y) - R]);
    }
    const xMax = F.fate === 'orbit' ? ROUND : Math.max(F.along, F.flat, 0.5) * 1.04;
    return { xMax, yMax: Math.max(HEIGHT, F.highest) * 1.2, flat: { range: F.flat }, points: pts };
  }

  function finish(C) {
    C.done = true;
    const F = C.F;
    let html;
    let text;
    if (F.fate === 'landed' && F.along < 0.05) {
      text = `Dropped, it hits the ground after ${clock(F.T)}.`;
      html = `<b>${text}</b><span class="sub">The Moon's gravity is about a sixth of Earth's, so a 1 km fall takes 35 s.</span>`;
    } else if (F.fate === 'landed') {
      const times = F.along / F.flat;
      text = `Landed ${num(F.along, 1)} km away after ${clock(F.T)}.`;
      const sub = `On flat ground it would land ${num(F.flat, 1)} km away${times >= 1.25 ? `. The ground curving away under it carried it ${num(times, 1)} times as far.` : '.'}`;
      html = `<b>${text}</b><span class="sub">${sub}</span>`;
    } else if (F.fate === 'orbit') {
      const near = F.highest - F.lowest < 3;
      text = `It never lands. It comes back around every ${clock(F.lapT)}, from behind you.`;
      const sub = near ? `It stays between ${num(F.lowest, 2)} and ${num(F.highest, 2)} km up the whole way round.`
        : `Lowest ${num(F.lowest, 1)} km up, highest ${fmtKm(F.highest)}.`;
      html = `<b>It never lands.</b> It comes back around every ${clock(F.lapT)}, from behind you.<span class="sub">${sub}</span>`;
    } else if (F.fate === 'gone') {
      text = `Gone for good. It passes 60,000 km after ${clock(F.T)}, still doing ${num(F.out, 2)} km/s.`;
      html = `<b>Gone for good.</b> It passes 60,000 km after ${clock(F.T)}, still doing ${num(F.out, 2)} km/s.<span class="sub">Escape speed from 1 km up is ${num(V_ESC, 4)} km/s.</span>`;
    } else {
      text = `It reaches 60,000 km after ${clock(F.T)}, where Earth's pull takes over.`;
      html = `<b>It reaches 60,000 km</b> after ${clock(F.T)}, where Earth's pull takes over.<span class="sub">Around a Moon on its own it would fall back. This lesson leaves Earth out, so it stops here.</span>`;
    }
    readout.innerHTML = html;
    onDone(F, text);
  }

  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
    last = now;
    const C = S.current;
    const scene = { mode: mode(), old: S.old, current: null, strip: null };
    let busy = false;
    let target;
    if (C) {
      const F = C.F;
      const sim = C.dur ? ((now - C.start) / 1000) * C.warp : Infinity;
      let trailT;
      let ballT;
      if (F.fate === 'orbit') {
        trailT = sim >= F.lapT ? Infinity : sim;
        ballT = sim === Infinity ? 0 : sim % F.lapT;
        busy = !reduce;
        if (!C.done && sim >= F.lapT) finish(C);
      } else {
        const end = F.path[F.path.length - 1][0];
        trailT = Math.min(sim, end);
        ballT = trailT;
        if (sim < end) busy = true;
        else if (!C.done) finish(C);
      }
      if (!C.done) {
        readout.innerHTML = `<b>${F.v.toFixed(4)} km/s</b>, ${clock(Math.min(trailT, F.T))} in the air<span class="sub">shown ${Math.round(C.warp).toLocaleString('en-US')} times faster than real time</span>`;
      }
      const [x, y] = at(F.path, ballT);
      scene.current = { path: F.path, t: trailT, x, y, end: F.end, mark: C.done && F.fate === 'landed' ? `${num(F.along, 1)} km` : '' };
      if (F.fate === 'landed' || F.fate === 'orbit') scene.strip = strip(F, trailT);
      view.box.text = textBottom();
      target = view.fit(box(F, F.fate === 'landed' ? Infinity : trailT), !!scene.strip);
    } else {
      view.box.text = textBottom();
      target = view.fit({ x0: -R, x1: R, y0: -R, y1: R + HEIGHT }, false);
    }
    const settled = view.follow(target, dt, reduce || snap);
    snap = false;
    view.draw(scene);
    if (busy || !settled) kick();
    else last = 0;
  }

  return { start, kick };
}
