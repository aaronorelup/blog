// The tablecloth demo's shared pieces (AO-092): the setups, a run's numbers in words, a canvas that follows its
// width, the player that turns simulated seconds into slow motion, and the controls. Read by index.js.
import { h } from '../../../_lib/dom.js';
import { SETUP_MINE, setupFromPost } from './sim.js';
import { palette } from './draw.js';

export const f1 = (x) => x.toFixed(1);
export const f2 = (x) => x.toFixed(2);
export const f3 = (x) => x.toFixed(3);

// One dish of a setup, with any of its values changed.
export function only(setup, id, patch = {}) {
  return { ...setup, dishes: setup.dishes.filter((d) => d.id === id).map((d) => ({ ...d, ...patch })) };
}
export const MY_PLATE = only(SETUP_MINE, 'plate');
export const MY_GLASS = only(SETUP_MINE, 'glass');
// The post's own values: 0.25 on the cloth (its text), the edge 30 cm away and the table braking at 0.4 (its video).
// The cloth behind the plate, 0.9005 m, is the one inferred value: it makes the post's 0.155 s at 6 m/s come out.
export const POST_PLATE = (() => {
  const s = setupFromPost({ muTable: 0.4, edge: 0.3 });
  s.table.length = 0.9005 + 0.3;
  s.dishes[0].x0 = 0.9005;
  return s;
})();

// What the cloth and the table did to a dish in one run, for the graph: forces are the simulation's accelerations
// times the dish's mass.
export function events(d, mass) {
  const pushEnd = d.tFree ?? d.tMatch ?? d.tEdge ?? 0;
  return {
    push: mass * d.peakDrag,
    pushEnd,
    brake: d.tFree != null ? mass * d.peakBrake : 0,
    brakeEnd: d.tStop ?? d.tEdge ?? pushEnd,
    over: d.tEdge,
  };
}
// The dish's speed when the cloth stopped pushing it.
export const given = (d, v) => d.uFree ?? (d.tMatch != null ? v : d.uEdge ?? 0);

export function outcome(d) {
  if (!d.fell) return { text: `stops ${f1((d.toEdge - d.slid) * 100)} cm short of the edge`, bad: false };
  if (d.rode) return { text: 'rides the cloth off the edge', bad: true };
  if (d.tFree == null) return { text: 'dragged off the edge', bad: true };
  return { text: 'slides off the edge', bad: true };
}

// A canvas that redraws when its width or the page's day/night mode changes.
export function stage(root, label, redraw) {
  const cv = h('canvas', { class: 'tcd-canvas', role: 'img', 'aria-label': label });
  root.append(cv);
  let last = 0;
  const ro = new ResizeObserver(() => {
    const w = Math.round(root.clientWidth);
    if (w && w !== last) {
      last = w;
      redraw();
    }
  });
  ro.observe(root);
  const mo = new MutationObserver(() => redraw());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  return {
    cv,
    width: () => Math.max(260, Math.round(root.clientWidth)),
    colours: () => palette(root),
    destroy() {
      ro.disconnect();
      mo.disconnect();
    },
  };
}

const REDUCE = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Plays simulated time at 1/slow of real speed while the demo is on screen. draw(t) paints the moment t.
// opts: {end() last second to show, slow() real seconds per simulated second, loop, hold (s) before a loop restarts}.
export function player(host, draw, opts) {
  let raf = 0;
  let t0 = 0;
  let simT = 0;
  let on = false;
  let seen = false;
  const io = new IntersectionObserver((es) => {
    seen = es.some((e) => e.isIntersecting);
    if (seen && on) go();
  }, { rootMargin: '120px' });
  io.observe(host);
  const go = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  function frame(now) {
    raf = 0;
    if (!on || !seen) {
      t0 = 0;
      return;
    }
    if (!t0) t0 = now - simT * opts.slow() * 1000;
    const real = (now - t0) / 1000;
    const end = opts.end();
    simT = Math.min(end, real / opts.slow());
    draw(simT);
    if (real >= end * opts.slow() + (opts.loop ? opts.hold ?? 1.6 : 0)) {
      if (opts.loop && !REDUCE) {
        t0 = now;
        simT = 0;
      } else {
        on = false;
        opts.done?.();
        return;
      }
    }
    go();
  }
  return {
    reduce: REDUCE,
    play(from = 0) {
      simT = from;
      t0 = 0;
      on = true;
      go();
    },
    stop() {
      on = false;
    },
    get t() {
      return simT;
    },
    destroy() {
      on = false;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    },
  };
}

export const button = (text, onclick, extra = {}) => h('button', { type: 'button', class: 'tcd-btn', onclick, ...extra }, text);

// A labelled slider: its value shown beside its name.
export function slider({ name, min, max, step, value, unit, digits, oninput }) {
  const out = h('span', { class: 'tcd-val' });
  const input = h('input', { type: 'range', min, max, step, value, 'aria-label': name });
  const show = () => {
    out.textContent = `${Number(input.value).toFixed(digits)} ${unit}`;
  };
  input.addEventListener('input', () => {
    show();
    oninput(Number(input.value));
  });
  show();
  return { el: h('label', { class: 'tcd-slider' }, h('span', { class: 'tcd-name' }, name, out), input), input };
}

export function segmented(options, value, onchange, label) {
  const row = h('div', { class: 'tcd-seg', role: 'group', 'aria-label': label });
  const buttons = options.map(([v, text]) =>
    button(text, () => {
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i][0] === v)));
      onchange(v);
    }, { 'aria-pressed': String(v === value) }),
  );
  row.append(...buttons);
  return row;
}
