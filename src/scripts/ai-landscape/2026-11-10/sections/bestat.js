// Best at (SPEC 2.8): one capability at a time on the podium. Clear: the leader rises on a frosted step, the
// runner-up a little (close behind when the margin is narrow). Contested: every contender to the same height on
// hatched steps. Tie: one shared low step. Unknown: nobody rises and fog rolls in. A leader outside the five takes a
// grey sixth plinth. It tours the owner's four guesses first, 6 s each, until touched. Never more certain than the data.
import { Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { createPodium } from '../scene/podium.js';
import { ROW_X } from '../scene/row.js';

const TOUR = 6;
const SQUEEZE = 2.85 / 4.2;
const VIEW = { pos: [1.0, 3.4, 31], look: [1.0, 2.95, 0], fov: 24, fit: 28.4, cy: 0.27 };
const PHONE = { pos: [1.1, 3.3, 30], look: [1.1, 2.7, 0], fov: 24, fit: 18.6, cy: 0.19 };

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const plinthX = ROW_X[4] * (phone ? SQUEEZE : 1) + (phone ? 2.35 : 3.0);    // a sixth place at the right end of the row, outside the five
  const podium = createPodium(ctx, { plinthX });
  const caps = $$('.ail-ba__cap', el);
  const groups = $$('.ail-ba__group', el);
  // step order: group by group, in the page's group order, so the arrows never jump back and forth between groups
  const seq = groups.flatMap((g) => caps.filter((li) => li.dataset.g === g.dataset.g)).map((li) => caps.indexOf(li));
  const tour = (el.dataset.tour || '').split(' ').map(Number).filter((n) => caps[n]);
  const st = { n: -1, touched: false, clock: 0, ti: 0, k: 0 };
  const v = new Vector3();

  // every label under a stack (or on the plinth) is pinned once. Only the shown capability's are switched on
  const foot = (id) => { const t = order.indexOf(id); return t < 0 ? null : () => v.set(towers[t].x + towers[t].shift, -0.02, 1.62); };
  const pins = caps.map((li) => {
    let outside = 0;
    return $$('.ail-ba__place, .ail-ba__empty', li).map((node) => {
      const id = node.dataset.p;
      const at = id === 'outside'
        ? ((k) => () => v.set(plinthX + podium.shift, Math.max(0.15, podium.plinthTop() * 0.55), 1.3 + k * 0.001))(outside++)
        : foot(id);
      const dy = id === 'outside' ? (outside - 1) * 30 : 10;
      const pin = phone ? null : labels.pin(node, at, { ax: 0.5, ay: id === 'outside' ? 0.5 : 0, dy });
      if (pin) pin.on = false;
      return pin;
    }).filter(Boolean);
  });

  function cellsFor(li) {
    const floor = Number(li.dataset.floor) - 1;
    const empty = Object.fromEntries($$('.ail-ba__empty', li).map((x) => [x.dataset.p, x.dataset.state]));
    towers.forEach((tw) => {
      const base = ctx.data.p[tw.id].stack;
      tw.setCells(base.map((c, i) => (i === floor && empty[tw.id] ? { s: empty[tw.id], g: [] } : c)));
    });
  }
  function show(n, quiet) {
    if (n === st.n || !caps[n]) return;
    if (st.n >= 0) pins[st.n].forEach((p) => { p.on = false; });
    st.n = n;
    const li = caps[n];
    caps.forEach((c, k) => c.classList.toggle('is-on', k === n));
    caps.forEach((c) => { const d = $('details', c); if (d) d.open = false; });
    groups.forEach((g) => g.setAttribute('aria-pressed', String(g.dataset.g === li.dataset.g)));
    const nav = $('.ail-ba__nav', el), on = groups.find((g) => g.dataset.g === li.dataset.g);
    if (phone && nav && on) nav.scrollLeft = Math.max(0, on.offsetLeft - nav.clientWidth / 2 + on.offsetWidth / 2);
    pins[n].forEach((p) => { p.on = true; });
    const places = $$('.ail-ba__place', li).map((x) => ({ p: x.dataset.p, h: Number(x.dataset.h), step: x.dataset.step, place: Number(x.dataset.place) || 0 }));
    podium.set(places, li.dataset.verdict);
    cellsFor(li);
    if (!quiet) announce([li.querySelector('.ail-ba__name'), li.querySelector('.ail-ba__stamp'), ...li.querySelectorAll('.ail-ba__place')].map((x) => x.textContent.trim()).join('. '));
  }
  const touch = () => { st.touched = true; };
  const stepBy = (d) => { touch(); const i = seq.indexOf(st.n); show(seq[(i + d + seq.length) % seq.length]); };
  const onClick = (e) => {
    const g = e.target.closest('.ail-ba__group');
    const a = e.target.closest('.ail-ba__arrow');
    if (g) { touch(); show(caps.findIndex((li) => li.id === g.dataset.first)); }
    if (a) stepBy(Number(a.dataset.step));
    if (e.target.closest('.ail-ba__stamp')) touch();
  };
  const onKey = (e) => {
    if (sec !== ctx.clock.current || !el.contains(document.activeElement)) return;
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d && !document.activeElement.closest('.ail-ba__groups')) { e.preventDefault(); stepBy(d); }
    if (e.key === 'Escape') $$('details[open]', el).forEach((x) => { x.open = false; });
  };
  el.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);

  ctx.state.compare = { ...(ctx.state.compare || {}), bestat: {
    get n() { return st.n; },
    get id() { return caps[st.n].id; },
    show: (id) => { touch(); show(caps.findIndex((li) => li.id === id)); },
    // how high each stack stands and the plinth, the fog, in world units
    heights: () => ({ ...Object.fromEntries(towers.map((tw) => [tw.id, +tw.lift.toFixed(3)])), outside: +podium.plinthTop().toFixed(3), fog: +podium.fog.toFixed(3) }),
  } };

  return {
    stops: [0.55],
    enter() { if (st.n >= 0) pins[st.n].forEach((p) => { p.on = true; }); },
    leave() {
      pins.flat().forEach((p) => { p.on = false; });
      podium.hide();
      towers.forEach((tw) => tw.setCells(ctx.data.p[tw.id].stack, true));
      st.n = -1;
    },
    update(t, dt, u) {
      const k = smooth(span(u, 0, 0.25)) * (1 - smooth(span(u, sec.screens - 0.25, sec.screens)));
      st.k = k;
      if (st.n < 0) show(tour[st.ti] ?? 0, true);
      rig.mix(rig.stops.row, phone ? PHONE : VIEW, k);
      if (!st.touched && !reduced && k > 0.95) {
        st.clock += dt;
        if (st.clock > TOUR) { st.clock = 0; st.ti = (st.ti + 1) % tour.length; show(tour[st.ti], true); }
      }
      const lit = Number(caps[st.n].dataset.floor) - 1;
      towers.forEach((tw, n) => {
        if (phone) tw.shift = ROW_X[n] * (SQUEEZE - 1) * k;
        if (phone) tw.char.show = 1 - k;
        tw.floors.forEach((f, i) => { if (i === lit) f.lit = 0.4 * k; else f.dim = Math.max(f.dim, 0.55 * k); });
      });
      podium.update(dt, k, reduced);
      pins[st.n].forEach((p) => { p.el.style.opacity = k.toFixed(3); });
    },
    dispose() {
      el.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      pins.flat().forEach((p) => p.drop());
      podium.dispose();
      towers.forEach((tw) => tw.setCells(ctx.data.p[tw.id].stack, true));
      if (ctx.state.compare) delete ctx.state.compare.bestat;
    },
  };
}
