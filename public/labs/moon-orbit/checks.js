// The checks the lesson runs on its own engine before the controls turn on. Each one flies the engine and compares
// what it did with an answer that doesn't come from stepping through time: the exact orbit formulas (kepler.js), a
// law that has to hold, or a number NASA published. Each returns { pass, line }, where line says what was measured.
//
// The first eight test the engine against the laws of motion for its own Moon, so their test throws are sized to it:
// on the real Moon a factor of exactly 1, so 1.67 km/s is 1.67 km/s. The ninth tests that Moon against the real one.
import { EDGE, GM, HEIGHT, energy, fly, inside, spin } from './engine.js';
import { landing, period, semiMajor, speedAt, vCirc, vEsc } from './kepler.js';

const num = (x, d) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
// A small distance in km, in the unit a person would use.
function small(km) {
  if (km >= 1) return `${num(km, 1)} km`;
  if (km >= 0.001) return `${num(km * 1000, 1)} m`;
  if (km >= 1e-5) return `${num(km * 1e5, 0)} cm`;
  if (km >= 1e-6) return `${num(km * 1e6, 0)} mm`;
  return 'under a millimetre';
}
const minutes = (s) => `${num(s / 60, 2)} min`;
const duration = (s) => (s < 120 ? `${num(s, 0)} s` : s < 7200 ? `${num(s / 60, 0)} min` : `${num(s / 3600, 1)} hours`);
// A relative change as "1 part in 40 million".
function parts(x) {
  if (!(x > 0) || x < 1e-12) return 'less than 1 part in a trillion';
  if (x >= 0.01) return `${num(x * 100, 1)}%`;
  const n = 1 / x;
  const [scale, word] = n >= 1e9 ? [1e9, ' billion'] : n >= 1e6 ? [1e6, ' million'] : n >= 1e3 ? [1e3, ' thousand'] : [1, ''];
  return `1 part in ${num(Math.floor(n / scale), 0)}${word}`;
}
const fell = (f) => (f.fate === 'landed'
  ? `It hit the ground ${num(Math.abs(f.along), 1)} km away after ${duration(f.t)}.`
  : f.fate === 'escaped' ? 'It flew off the Moon.' : `It was still going after ${duration(f.t)}.`);

// Test throws are the same orbits on the engine's own Moon: speeds scale with the square root of its GM, times
// inversely. On the real Moon both factors are 1.
const speed = (E) => Math.sqrt(E.GM / GM);

// Inside the step that starts at p, the moment the ball stops climbing (dir 1) or stops falling (dir -1).
const turning = (E, p, dir) => inside(E, p, E.dt, (m) => dir * (m.x * m.vx + m.y * m.vy));
const climbing = (s) => s.x * s.vx + s.y * s.vy > 0;

// Watches a flight for the top of its first lap: { onStep, r }.
function topOfLap(E) {
  const top = { r: 0 };
  top.onStep = (p, s) => {
    if (top.r || !climbing(p) || climbing(s)) return;
    const m = turning(E, p, 1);
    top.r = Math.sqrt(m.x * m.x + m.y * m.y);
  };
  return top;
}

// Watches a flight for its lowest point on the way back down after the top: { onStep, at }.
function lowAfterTop(E) {
  const low = { at: null, past: false };
  low.onStep = (p, s) => {
    if (!low.past) low.past = climbing(p) && !climbing(s);
    else if (!low.at && !climbing(p) && climbing(s)) low.at = turning(E, p, -1);
  };
  return low;
}

export const CHECKS = [
  {
    id: 'land',
    title: 'Lands where the exact math says',
    why: "Every throw slower than orbit speed has to come down where the shape of its orbit says. The lesson shows distances to a tenth of a km, so they have to be right to 0.05 km, up to the fastest throw the controls can make that still lands, 1.6791 km/s.",
    run(E) {
      let worst = 0;
      let hook = '';
      for (const v0 of [1.2, 1.67, 1.679, 1.6791]) {
        const v = v0 * speed(E);
        const want = landing(E.GM, E.R, E.R + HEIGHT, v);
        const f = fly(E, v, { tMax: 2 * want.t + 100 });
        if (f.fate !== 'landed') return { pass: false, line: `${num(v, 4)} km/s didn't come down. ${fell(f)}` };
        worst = Math.max(worst, Math.abs(f.along - want.along));
        if (v0 === 1.67) hook = `${num(v, 2)} km/s lands ${num(f.along, 2)} km away. The formula says ${num(want.along, 2)} km.`;
      }
      return { pass: worst < 0.05, line: `${hook} Four throws up to ${num(1.6791 * speed(E), 4)} km/s, the furthest off by ${small(worst)}.` };
    },
  },
  {
    id: 'circle',
    title: 'Orbit speed stays 1 km up',
    why: 'At orbit speed the ground curves away exactly as fast as the ball falls, so it should go all the way around without rising or sinking more than a metre.',
    run(E) {
      const r0 = E.R + HEIGHT;
      const v = vCirc(E.GM, r0);
      let worst = 0;
      const f = fly(E, v, { laps: 1, tMax: 1.5 * period(E.GM, r0),
        onStep: (p, s) => { worst = Math.max(worst, Math.abs(E.alt(s) - HEIGHT)); } });
      if (f.fate !== 'laps') return { pass: false, line: `At ${num(v, 4)} km/s: ${fell(f)}` };
      return { pass: worst < 0.001, line: `A full lap at ${num(v, 4)} km/s. The height ${worst < 1e-6 ? 'stayed within a millimetre of 1 km' : `changed by up to ${small(worst)}`}.` };
    },
  },
  {
    id: 'clock',
    title: 'Comes back around on time',
    why: "Kepler's formula says how long one lap at that height takes. The simulated lap has to match it to the second.",
    run(E) {
      const r0 = E.R + HEIGHT;
      const want = period(E.GM, r0);
      const f = fly(E, vCirc(E.GM, r0), { laps: 1, tMax: 1.5 * want });
      if (f.fate !== 'laps') return { pass: false, line: fell(f) };
      const got = f.lapTimes[0];
      return { pass: Math.abs(got - want) < 0.5, line: `Back around after ${minutes(got)}. Kepler says ${minutes(want)}.` };
    },
  },
  {
    id: 'energy',
    title: "Energy doesn't leak",
    why: 'With no air and nothing pushing, the speed it trades for height has to add up to the same total forever. Ten laps of a big oval, to 1 part in a million.',
    run(E) {
      const v = 2 * speed(E);
      const e0 = energy(E.start(v), E.GM);
      let worst = 0;
      const f = fly(E, v, { laps: 10, tMax: 1.6e5 / speed(E),
        onStep: (p, s) => { worst = Math.max(worst, Math.abs((energy(s, E.GM) - e0) / e0)); } });
      if (f.fate !== 'laps') return { pass: false, line: `Ten laps at ${num(v, 2)} km/s: ${fell(f)}` };
      return { pass: worst < 1e-6, line: `Ten laps out to ${num(f.highest, 0)} km up. The total moved ${parts(worst)}.` };
    },
  },
  {
    id: 'areas',
    title: 'Equal areas in equal times',
    why: "Kepler's second law: the line from the Moon's centre to the ball sweeps the same area every second, fast when low and slow when high. To 1 part in a billion.",
    run(E) {
      const v = 2 * speed(E);
      const L0 = spin(E.start(v));
      let worst = 0;
      const f = fly(E, v, { laps: 3, tMax: 5e4 / speed(E),
        onStep: (p, s) => { worst = Math.max(worst, Math.abs((spin(s) - L0) / L0)); } });
      if (f.fate !== 'laps') return { pass: false, line: `Three laps at ${num(v, 2)} km/s: ${fell(f)}` };
      return { pass: worst < 1e-9, line: `Three laps of the same oval. The area swept each second moved ${parts(worst)}.` };
    },
  },
  {
    id: 'third',
    title: 'Bigger orbits take longer, by the right amount',
    why: "Kepler's third law: a lap's time squared goes with the orbit's size cubed. The engine's own lap times and sizes, for three ovals, have to fit it to 0.01%.",
    run(E) {
      const r0 = E.R + HEIGHT;
      let worst = 0;
      const hours = [];
      for (const v of [1.75, 1.95, 2.15].map((x) => x * speed(E))) {
        const top = topOfLap(E);
        const f = fly(E, v, { laps: 1, tMax: 4e4 / speed(E), onStep: top.onStep });
        if (f.fate !== 'laps' || !top.r) return { pass: false, line: `At ${num(v, 2)} km/s: ${fell(f)}` };
        const a = 0.5 * (r0 + top.r);
        const T = f.lapTimes[0];
        worst = Math.max(worst, Math.abs((T * T * E.GM) / (4 * Math.PI * Math.PI * a * a * a) - 1));
        hours.push(num(T / 3600, 1));
      }
      return { pass: worst < 1e-4, line: `Laps of ${hours.join(', ')} hours. The furthest from the law is off by ${parts(worst)}.` };
    },
  },
  {
    id: 'escape',
    title: 'Escape speed is a hard line',
    why: "Just under escape speed the ball has to come back down to the same 1 km. Just over, it has to leave for good, still moving at the speed its energy says. Past 60,000 km, Earth's pull would take over.",
    run(E) {
      const r0 = E.R + HEIGHT;
      const ve = vEsc(E.GM, r0);
      const low = lowAfterTop(E);
      const back = fly(E, 0.95 * ve, { laps: 1, tMax: 1e5 / speed(E), onStep: low.onStep });
      if (back.fate !== 'laps' || !low.at) return { pass: false, line: `At 95% of escape speed: ${fell(back)}` };
      const missBy = Math.abs(E.alt(low.at) - HEIGHT);
      const out = fly(E, 1.01 * ve, { tMax: 1.2e5 / speed(E) });
      if (out.fate !== 'escaped') {
        return { pass: false, line: `95% came back. 1% over escape speed ${out.fate === 'landed' ? 'came back down' : `was still stuck after ${duration(out.t)}`}.` };
      }
      const got = Math.sqrt(out.end.vx * out.end.vx + out.end.vy * out.end.vy);
      const want = speedAt(E.GM, r0, 1.01 * ve, EDGE);
      return { pass: missBy < 0.001 && Math.abs(got / want - 1) < 0.001,
        line: `95% of escape speed came back to 1 km up, off by ${small(missBy)}. 1% over reached ${num(EDGE, 0)} km at ${num(got, 3)} km/s, energy says ${num(want, 3)}.` };
    },
  },
  {
    id: 'reverse',
    title: 'Runs backwards into your hand',
    why: "Newton's laws work the same with time running backwards. Fly one lap, turn the ball around, fly it back the same number of steps, and it has to land in your hand to the millimetre.",
    run(E) {
      const r0 = E.R + HEIGHT;
      const v = 1.75 * speed(E);
      const s = E.start(v);
      const steps = Math.round(period(E.GM, semiMajor(E.GM, r0, v)) / E.dt);
      for (let i = 0; i < steps; i++) E.step(s);
      s.vx = -s.vx;
      s.vy = -s.vy;
      for (let i = 0; i < steps; i++) E.step(s);
      const miss = Math.sqrt(s.x * s.x + (s.y - r0) * (s.y - r0));
      return { pass: miss < 1e-6, line: `${num(steps, 0)} steps out and ${num(steps, 0)} back. It came home ${small(miss)} from where it left.` };
    },
  },
  {
    id: 'real',
    title: "It's the real Moon",
    why: "The checks above test the engine against its own numbers. This one tests the numbers: NASA's surface gravity, 1.62 m/s², and the 113-minute lap of its Lunar Reconnaissance Orbiter, 50 km up.",
    run(E) {
      const drop = fly(E, 0, { h: 0.01, tMax: 100 });
      if (drop.fate !== 'landed') return { pass: false, line: "A dropped ball didn't fall." };
      const g = (2 * 0.01 * 1000) / (drop.t * drop.t);
      const r = E.R + 50;
      const lro = fly(E, vCirc(E.GM, r), { h: 50, laps: 1, tMax: 2e4 });
      const head = `A dropped ball falls at ${num(g, 2)} m/s² (NASA: 1.62).`;
      if (lro.fate !== 'laps') return { pass: false, line: `${head} The 50 km orbit: ${fell(lro)}` };
      const T = lro.lapTimes[0] / 60;
      return { pass: Math.abs(g - 1.62) <= 0.005 && Math.abs(T - 113) <= 1,
        line: `${head} A lap 50 km up takes ${num(T, 1)} min (NASA: about 113).` };
    },
  },
];

// Run one check, timing it. A check that throws has failed.
export function runCheck(check, E, now = () => performance.now()) {
  const t0 = now();
  let out;
  try {
    out = check.run(E);
  } catch (err) {
    out = { pass: false, line: `It crashed: ${err.message}` };
  }
  return { id: check.id, pass: !!out.pass, line: out.line, ms: now() - t0 };
}
