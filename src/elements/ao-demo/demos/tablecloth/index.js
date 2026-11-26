// <ao-demo name="tablecloth" part="…">: the tablecloth trick as pictures that move (AO-092). Every part runs sim.js,
// the simulation the post's experiment swept, and draws its side view with draw.js. Parts:
//   rub      a slow pull: the cloth drags the plate along and off the edge
//   weight   a light and a heavy plate: a bigger push, the same motion
//   time     a slow and a fast pull side by side, with their push-and-brake graphs (force times time)
//   lab      the playable one: pull speed, cloth friction and plate weight
//   compare  one number either side of each cutoff: the plate, the glass and the post's own table
import { h } from '../../../_lib/dom.js';
import { cutoff, simulate, stateAt } from './sim.js';
import { drawImpulse, drawLane, fit } from './draw.js';
import { button, events, f1, f2, f3, given, MY_GLASS, MY_PLATE, outcome, player, POST_PLATE, segmented, slider, stage } from './ui.js';

const FULL = (L) => ({ wx0: -0.03, wx1: L + 0.33, L });
const cap = (text) => h('div', { class: 'tcd-cap', 'aria-live': 'polite' }, text);

// A run of one dish at speed v, with what the pictures need.
function trial(setup, v, mass) {
  const run = simulate(setup, v);
  const d = run.dishes[0];
  const m = mass ?? setup.dishes[0].mass;
  return { v, run, d, spec: setup.dishes[0], L: setup.table.length, m, ev: events(d, m), speed: given(d, v), out: outcome(d) };
}
// Show a run until its dish has stopped, or a moment after it went over the edge.
const decided = (tr) => tr.d.tStop ?? tr.d.tEdge ?? tr.run.tEnd;
const lastMoment = (tr) => Math.min(tr.run.tEnd, tr.d.tStop != null ? tr.d.tStop + 0.04 : (tr.d.tEdge ?? tr.run.tEnd) + 0.3);

function lanes(root, label, trials, opts) {
  const st = stage(root, label, () => paint(play ? play.t : 0));
  let ended = false;
  function paint(t) {
    const W = st.width();
    const laneH = W < 520 ? 132 : 150;
    const ctx = fit(st.cv, W, laneH * trials.length);
    const P = st.colours();
    trials.forEach((tr, i) => {
      const box = { x: 0, y: i * laneH, w: W, h: laneH, ...(opts.view ?? FULL(tr.L)) };
      const fr = stateAt(tr.run, Math.min(t, tr.run.tEnd));
      const done = t >= decided(tr) - 1e-6;
      drawLane(ctx, P, box, { c: fr.c, d: fr.d[0] }, tr.spec, {
        arrows: true, room: true, backEdge: true, mass: tr.m, pxPerN: opts.pxPerN,
        title: opts.title(tr), outcome: done || ended ? tr.out : null,
      });
    });
  }
  const end = () => Math.max(...trials.map(lastMoment));
  const play = player(root, paint, { end, slow: () => opts.slow, loop: true, done: () => { ended = true; paint(end()); } });
  return { st, play, end, paint };
}

function rub(root) {
  const tr = trial(MY_PLATE, 1);
  const d = tr.d;
  const L = lanes(root, 'A side view of a 1 m/s pull: the cloth drags the plate along until it rides off the edge.', [tr], {
    slow: 6, view: { wx0: 0.5, wx1: 1.48, L: tr.L }, title: () => '1 m/s pull, at 1/6 speed',
  });
  root.append(cap(`The cloth drags the plate along at up to ${f2(d.peakDrag)} m/s more every second. At 1 m/s the plate catches up with the cloth after ${f1(d.slidOnCloth * 100)} cm, at ${f2(d.tMatch)} s, and rides it off the edge at ${f2(d.tEdge)} s.`));
  return start(root, L);
}

function weight(root) {
  const light = trial(MY_PLATE, 6, 0.3);
  const heavy = trial(MY_PLATE, 6, 1.5);
  const L = lanes(root, 'Two plates on the same 6 m/s pull: the heavy one gets a five times bigger push and moves exactly like the light one.', [light, heavy], {
    slow: 10, pxPerN: 18, title: (tr) => `${f1(tr.m)} kg plate, 6 m/s pull, at 1/10 speed`,
  });
  root.append(cap(`The cloth pushes the 1.5 kg plate with ${f2(heavy.ev.push)} N and the 0.3 kg plate with ${f2(light.ev.push)} N. The heavy plate is just as much harder to speed up, so both gain ${f2(light.d.peakDrag)} m/s every second, and both stop after ${f1(light.d.slid * 100)} cm.`));
  return start(root, L);
}

function time(root) {
  const trs = [trial(MY_PLATE, 3), trial(MY_PLATE, 6)];
  const scale = { T: 0.5, F: 2.6 };
  const st = stage(root, 'A 3 m/s pull and a 6 m/s pull, each with a graph of the push from the cloth and the brake from the table against time.', () => paint(play ? play.t : 0));
  let ended = false;
  function paint(t) {
    const W = st.width();
    const wide = W >= 640;
    const rowH = wide ? 168 : 150 + 128;
    const ctx = fit(st.cv, W, rowH * trs.length);
    const P = st.colours();
    trs.forEach((tr, i) => {
      const y = i * rowH;
      const laneW = wide ? Math.round(W * 0.56) : W;
      const fr = stateAt(tr.run, Math.min(t, tr.run.tEnd));
      const done = ended || t >= decided(tr) - 1e-6;
      drawLane(ctx, P, { x: 0, y, w: laneW, h: wide ? rowH : 150, ...FULL(tr.L) }, { c: fr.c, d: fr.d[0] }, tr.spec, {
        arrows: true, room: true, backEdge: true, mass: tr.m, title: `${tr.v} m/s pull, at 1/10 speed`, outcome: done ? tr.out : null,
      });
      const gb = wide ? { x: laneW + 14, y: y + 6, w: W - laneW - 14, h: rowH - 12 } : { x: 0, y: y + 150, w: W, h: 124 };
      drawImpulse(ctx, P, gb, tr.ev, t, scale, { speed: tr.speed });
    });
  }
  const end = () => Math.max(...trs.map(lastMoment));
  const play = player(root, paint, { end, slow: () => 10, loop: true, done: () => { ended = true; paint(end()); } });
  const [a, b] = trs;
  root.append(cap(`The push is the same ${f2(a.ev.push)} N in both: friction can't push harder. Only the time changes. At 3 m/s the cloth rubs the plate for ${f3(a.ev.pushEnd)} s and leaves it at ${f2(a.speed)} m/s, too fast to stop in the ${f1(a.d.toEdge * 100)} cm left. At 6 m/s it rubs for ${f3(b.ev.pushEnd)} s, the plate gets ${f2(b.speed)} m/s, and the table stops it after ${f1(b.d.slid * 100)} cm.`));
  return start(root, { st, play, end, paint });
}

function lab(root) {
  const s = { v: 3, mu: 0.3, m: 0.6, slow: true };
  let tr = null;
  let cut = null;
  const scale = { T: 0.8, F: 8 };
  const st = stage(root, 'The playable simulation: a side view of the pull and the graph of push and brake against time.', () => paint(play ? play.t : 0));
  function paint(t) {
    if (!tr) return;
    const W = st.width();
    const laneH = W < 520 ? 150 : 176;
    const ctx = fit(st.cv, W, laneH + 176);
    const P = st.colours();
    const fr = stateAt(tr.run, Math.min(t, tr.run.tEnd));
    const done = t >= decided(tr) - 1e-6;
    drawLane(ctx, P, { x: 0, y: 0, w: W, h: laneH, ...FULL(tr.L) }, { c: fr.c, d: fr.d[0] }, tr.spec, {
      arrows: true, room: true, backEdge: true, mass: s.m, pxPerN: 12,
      title: `${f2(s.v)} m/s pull${s.slow ? ', at 1/10 speed' : ''}`, outcome: done ? tr.out : null,
    });
    drawImpulse(ctx, P, { x: 0, y: laneH + 8, w: W, h: 164 }, tr.ev, t, scale, { speed: tr.speed });
  }
  const end = () => lastMoment(tr);
  const play = player(root, paint, { end, slow: () => (s.slow ? 10 : 1), loop: false, done: () => paint(end()) });
  const readout = cap('');
  const cutLine = h('div', { class: 'tcd-cut' });
  function rerun(again = true) {
    tr = trial({ ...MY_PLATE, dishes: [{ ...MY_PLATE.dishes[0], muCloth: s.mu, mass: s.m }] }, s.v, s.m);
    const d = tr.d;
    readout.textContent = `The cloth pushes with ${f2(tr.ev.push)} N for ${f3(tr.ev.pushEnd)} s, so the plate leaves it at ${f2(tr.speed)} m/s. It ${tr.out.text}.`;
    if (!d.fell) readout.textContent += ` It slid ${f1(d.slid * 100)} cm.`;
    if (again) play.play(0);
    else paint(end());
  }
  function recut() {
    cut = cutoff({ ...MY_PLATE, dishes: [{ ...MY_PLATE.dishes[0], muCloth: s.mu }] }, 'plate', { tol: 1e-4 });
    cutLine.textContent = `With friction ${f2(s.mu)} this plate stays from ${f2(cut)} m/s. Its weight doesn't move that number.`;
  }
  let wait = 0;
  const soon = (fn) => {
    clearTimeout(wait);
    wait = setTimeout(fn, 90);
  };
  const sv = slider({ name: 'Pull speed', min: 0.5, max: 8, step: 0.05, value: s.v, unit: 'm/s', digits: 2, oninput: (x) => { s.v = x; soon(rerun); } });
  const sm = slider({ name: 'Cloth friction', min: 0.1, max: 0.5, step: 0.01, value: s.mu, unit: '', digits: 2, oninput: (x) => { s.mu = x; soon(() => { recut(); rerun(); }); } });
  const sw = slider({ name: 'Plate weight', min: 0.2, max: 2, step: 0.1, value: s.m, unit: 'kg', digits: 1, oninput: (x) => { s.m = x; soon(rerun); } });
  const slowBtn = button('Slow motion: on', () => {
    s.slow = !s.slow;
    slowBtn.textContent = `Slow motion: ${s.slow ? 'on' : 'off'}`;
    slowBtn.setAttribute('aria-pressed', String(s.slow));
    rerun();
  }, { 'aria-pressed': 'true' });
  root.append(
    h('div', { class: 'tcd-sliders' }, sv.el, sm.el, sw.el),
    h('div', { class: 'tcd-row' }, button('Pull again', () => rerun()), slowBtn),
    readout,
    cutLine,
  );
  recut();
  rerun(!play.reduce);
  return { destroy() { clearTimeout(wait); play.destroy(); st.destroy(); } };
}

function compare(root) {
  const SETS = {
    plate: { setup: MY_PLATE, id: 'plate', name: 'My plate' },
    glass: { setup: MY_GLASS, id: 'glass', name: 'My glass' },
    post: { setup: POST_PLATE, id: 'plate', name: "The post's table" },
  };
  for (const k of Object.keys(SETS)) SETS[k].cut = cutoff(SETS[k].setup, SETS[k].id, { tol: 1e-6 });
  let which = 'plate';
  let trs = [];
  let ended = false;
  const st = stage(root, 'Two pulls a hair either side of the cutoff speed, side by side: one dish goes over the edge, the other stops.', () => paint(play ? play.t : 0));
  const note = cap('');
  function pick(k) {
    which = k;
    const S = SETS[k];
    const lo = Math.round((S.cut - 0.05) * 100) / 100;
    const hi = Math.round((S.cut + 0.05) * 100) / 100;
    trs = [trial(S.setup, lo), trial(S.setup, hi)];
    const [a, b] = trs;
    note.textContent = `${S.name} stays from ${f3(S.cut)} m/s. At ${f2(a.v)} m/s it ${a.out.text}. At ${f2(b.v)} m/s it ${b.out.text}.`;
    if (k === 'post') note.textContent += ` The post says 2.8 m/s. On the post's own values this code finds ${f3(S.cut)} m/s.`;
    ended = false;
    play.play(0);
  }
  function paint(t) {
    if (!trs.length) return;
    const W = st.width();
    const laneH = W < 520 ? 132 : 150;
    const ctx = fit(st.cv, W, laneH * 2);
    const P = st.colours();
    trs.forEach((tr, i) => {
      const fr = stateAt(tr.run, Math.min(t, tr.run.tEnd));
      const done = ended || t >= decided(tr) - 1e-6;
      drawLane(ctx, P, { x: 0, y: i * laneH, w: W, h: laneH, ...FULL(tr.L) }, { c: fr.c, d: fr.d[0] }, tr.spec, {
        arrows: true, room: true, backEdge: true, mass: tr.m, title: `${f2(tr.v)} m/s pull, at 1/10 speed`, outcome: done ? tr.out : null,
      });
    });
  }
  const end = () => Math.max(...trs.map(lastMoment));
  const play = player(root, paint, { end, slow: () => 10, loop: true, done: () => { ended = true; paint(end()); } });
  root.prepend(segmented([['plate', 'My plate'], ['glass', 'My glass'], ['post', "The post's table"]], which, pick, 'Which dish'));
  root.append(note);
  pick('plate');
  if (play.reduce) {
    play.stop();
    ended = true;
    paint(end());
  }
  return { destroy() { play.destroy(); st.destroy(); } };
}

// Start a looping part: it plays while on screen, or with reduced motion shows its last moment and a Play button.
function start(root, L) {
  if (L.play.reduce) {
    L.paint(L.end());
    root.append(h('div', { class: 'tcd-row' }, button('Play', () => L.play.play(0))));
  } else {
    L.play.play(0);
  }
  return { destroy() { L.play.destroy(); L.st.destroy(); } };
}

const PARTS = { rub, weight, time, lab, compare };

export function mount(host, part) {
  const make = PARTS[part];
  if (!make) return null;
  const root = h('div', { class: `tcd tcd-${part}` });
  host.replaceChildren(root);
  return make(root);
}
