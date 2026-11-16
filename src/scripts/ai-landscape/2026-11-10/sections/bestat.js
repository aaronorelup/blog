// Best at (SPEC 2.8). The scroll is the tour: the title, then the owner's four guesses in his order (0.45 screens
// each, one capability on the podium with its stamp and its reason), then the board of all 22. A board row opens
// that capability on the podium, which holds until Escape, Back or 0.15 screens of scroll. No timer anywhere.
// Podium: clear, the leader rises. Contested, level hatched steps. Tie, one low step. Unknown, fog. Never surer than the data.
import { Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { createPodium } from '../scene/podium.js';
import { ROW_X } from '../scene/row.js';

const FIRST = 0.2, STEP = 0.45, BOARD = 2.0, HOLD = 0.15;
const SQUEEZE = 2.85 / 4.2;
const VIEW = { pos: [1.0, 3.4, 31], look: [1.0, 2.95, 0], fov: 24, fit: 28.4, cy: 0.27 };
const PHONE = { pos: [1.1, 3.3, 30], look: [1.1, 2.7, 0], fov: 24, fit: 18.6, cy: 0.19 };
// the board: the five stacks shrink to a strip of column heads at the top of the frame
const STRIP = { pos: [-0.5, 2.2, 31], look: [-0.5, 1.9, 0], fov: 24, fit: 46, cyd: 0.135, cy: 0.11 };

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const plinthX = ROW_X[4] * (phone ? SQUEEZE : 1) + (phone ? 2.35 : 3.0);    // a sixth place at the right end of the row, outside the five
  const podium = createPodium(ctx, { plinthX });
  const stage = $('.ail-stage', el);
  const caps = $$('.ail-ba__cap', el);
  const groups = $$('.ail-ba__group', el);
  const arrows = $$('.ail-ba__arrow', el);
  const board = $('.ail-bd', el);
  const back = $('.ail-ba__back', el);
  // step order: group by group, in the page's group order, so the arrows never jump back and forth between groups
  const seq = groups.flatMap((g) => caps.filter((li) => li.dataset.g === g.dataset.g)).map((li) => caps.indexOf(li));
  const guesses = (el.dataset.tour || '').split(' ').map(Number).filter((n) => caps[n]);
  const st = { n: -2, mode: '', pick: null, opener: null, u: 0 };
  const v = new Vector3();

  // every label under a stack (or on the plinth) is pinned once. Only the shown capability's are switched on
  const foot = (id) => { const t = order.indexOf(id); return t < 0 ? null : () => v.set(towers[t].x + towers[t].shift, -0.02, 1.62); };
  const pins = caps.map((li) => {
    const nodes = $$('.ail-ba__place, .ail-ba__empty', li);
    const out = nodes.filter((x) => x.dataset.p === 'outside');
    return nodes.map((node) => {
      const id = node.dataset.p;
      // labels outside the five sit on the plinth's face: one in its middle, two above and below its middle
      const k = out.indexOf(node);
      const at = id === 'outside' ? () => v.set(plinthX, Math.max(0.15, podium.plinthTop() * 0.5), 1.0) : foot(id);
      const place = id !== 'outside' ? { ax: 0.5, ay: 0, dy: 10 } : out.length === 1 ? { ax: 0.5, ay: 0.5 } : { ax: 0.5, ay: k === 0 ? 1 : 0, dy: k === 0 ? -2 : 2 };
      const pin = phone ? null : labels.pin(node, at, place);
      if (pin) pin.on = false;
      return pin;
    }).filter(Boolean);
  });

  function cellsFor(li) {
    const floor = li ? Number(li.dataset.floor) - 1 : -1;
    const empty = li ? Object.fromEntries($$('.ail-ba__empty', li).map((x) => [x.dataset.p, x.dataset.state])) : {};
    towers.forEach((tw) => {
      const base = ctx.data.p[tw.id].stack;
      tw.setCells(base.map((c, i) => (i === floor && empty[tw.id] ? { s: empty[tw.id], g: [] } : c)));
    });
  }
  // n: a capability on the podium, or -1 for none (the title and the board: the row stands level)
  function show(n, quiet) {
    if (n === st.n) return;
    if (st.n >= 0) pins[st.n].forEach((p) => { p.on = false; });
    st.n = n;
    const li = caps[n] || null;
    caps.forEach((c, k) => c.classList.toggle('is-on', k === n));
    caps.forEach((c) => { const d = $('details', c); if (d) d.open = false; });
    groups.forEach((g) => g.setAttribute('aria-pressed', String(!!li && g.dataset.g === li.dataset.g)));
    el.toggleAttribute('data-tabs', !!li && li.hasAttribute('data-tabs'));      // the group tabs show only where the words leave them room
    cellsFor(li);
    if (!li) { podium.set([], ''); return; }
    const strip = $('.ail-ba__groups', el), on = groups.find((g) => g.dataset.g === li.dataset.g);
    if (phone && strip && on) strip.scrollLeft = Math.max(0, on.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + on.offsetWidth / 2);
    pins[n].forEach((p) => { p.on = true; });
    const places = $$('.ail-ba__place', li).map((x) => ({ p: x.dataset.p, h: Number(x.dataset.h), step: x.dataset.step, place: Number(x.dataset.place) || 0 }));
    podium.set(places, li.dataset.verdict);
    // the arrows say where they go: the neighbouring capability's own name
    const i = seq.indexOf(n);
    arrows.forEach((a) => a.setAttribute('aria-label', $('.ail-ba__name', caps[seq[(i + Number(a.dataset.step) + seq.length) % seq.length]]).textContent.trim()));
    if (!quiet) announce([li.querySelector('.ail-ba__name'), li.querySelector('.ail-ba__stamp'), ...li.querySelectorAll('.ail-ba__place'), li.querySelector('.ail-ba__why')].map((x) => x.textContent.trim()).join('. '));
  }
  function setMode(mode, n, quiet = true) {
    if (mode !== st.mode) {
      st.mode = mode;
      el.dataset.mode = mode;
      stage.toggleAttribute('data-board', mode === 'board');
    }
    show(n, quiet);
  }
  // a row of the board opens its capability. It holds until Escape, Back or 0.15 screens of scroll
  function open(n, from) {
    if (!caps[n]) return;
    st.pick = { n, at: st.u };
    if (from) st.opener = from;
    setMode('cap', n, false);
    if (from && back) back.focus({ preventScroll: true });
  }
  function close(refocus) {
    if (!st.pick) return;
    st.pick = null;
    if (refocus && st.opener && st.opener.isConnected) requestAnimationFrame(() => st.opener.focus({ preventScroll: true }));
  }
  const stepBy = (d) => { const i = seq.indexOf(st.n); open(seq[(i + d + seq.length) % seq.length]); };
  const onClick = (e) => {
    const r = e.target.closest('.ail-bd__open');
    const g = e.target.closest('.ail-ba__group');
    const a = e.target.closest('.ail-ba__arrow');
    if (r) open(caps.findIndex((li) => li.id === r.dataset.cap), r);
    if (g) open(caps.findIndex((li) => li.id === g.dataset.first));
    if (a) stepBy(Number(a.dataset.step));
    if (e.target.closest('.ail-ba__back')) close(true);
  };
  const onKey = (e) => {
    if (sec !== ctx.clock.current) return;
    if (e.key === 'Escape') { if ($('details[open]', el)) $$('details[open]', el).forEach((x) => { x.open = false; }); else close(true); return; }
    if (!el.contains(document.activeElement) || st.mode !== 'cap') return;
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d && !document.activeElement.closest('.ail-ba__groups')) { e.preventDefault(); stepBy(d); }
  };
  el.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);

  ctx.state.compare = { ...(ctx.state.compare || {}), bestat: {
    get n() { return st.n; },
    get id() { return caps[st.n] ? caps[st.n].id : ''; },
    get mode() { return st.mode; },
    show: (id) => open(caps.findIndex((li) => li.id === id)),
    // how high each stack stands and the plinth, the fog, in world units
    heights: () => ({ ...Object.fromEntries(towers.map((tw) => [tw.id, +tw.lift.toFixed(3)])), outside: +podium.plinthTop().toFixed(3), fog: +podium.fog.toFixed(3) }),
  } };

  return {
    stops: [0.04, 0.16, 0.335, 0.51, 0.68, 0.885],
    enter() { if (st.n >= 0) pins[st.n].forEach((p) => { p.on = true; }); },
    leave() {
      pins.flat().forEach((p) => { p.on = false; });
      podium.hide();
      towers.forEach((tw) => tw.setCells(ctx.data.p[tw.id].stack, true));
      st.n = -2; st.mode = ''; st.pick = null;
      delete el.dataset.mode; stage.removeAttribute('data-board');
      caps.forEach((c) => c.classList.remove('is-on'));
    },
    update(t, dt, u) {
      st.u = u;
      if (st.pick && Math.abs(u - st.pick.at) > HOLD) close(false);
      // the scroll picks the state: title, his four guesses, the board
      if (st.pick) setMode('cap', st.pick.n);
      else if (u < FIRST) setMode('title', -1);
      else if (u < BOARD) setMode('guess', guesses[Math.min(guesses.length - 1, Math.floor((u - FIRST) / STEP))] ?? -1);
      else setMode('board', -1);

      const onBoard = st.mode === 'board';
      const k = smooth(span(u, 0, FIRST)) * (1 - smooth(span(u, sec.screens - 0.2, sec.screens)));
      if (onBoard) rig.mix(phone ? PHONE : STRIP, rig.stops.row, 1 - k);
      else rig.mix(rig.stops.row, phone ? PHONE : VIEW, k);
      const lit = st.n >= 0 ? Number(caps[st.n].dataset.floor) - 1 : -1;
      towers.forEach((tw, n) => {
        if (phone) tw.shift = ROW_X[n] * (SQUEEZE - 1) * k;
        if (phone || onBoard) tw.char.show = 1 - k;
        if (lit >= 0) tw.floors.forEach((f, i) => { if (i === lit) f.lit = 0.4 * k; else f.dim = Math.max(f.dim, 0.55 * k); });
      });
      podium.update(dt, k, reduced);
      if (st.n >= 0) pins[st.n].forEach((p) => { p.el.style.opacity = k.toFixed(3); });

      // the board's columns stand under the five stacks, the sixth one pitch further: read from the camera every frame
      board.style.opacity = onBoard ? k.toFixed(3) : '';
      if (onBoard && !phone) {
        const a = labels.project(v.set(towers[0].x, 0, 0)), b = labels.project(v.set(towers[1].x, 0, 0));
        const pitch = Math.max(40, b.x - a.x);
        const foot = labels.project(v.set(towers[0].x, -0.15, 1.3)).y;
        board.style.setProperty('--bd-pitch', `${pitch.toFixed(1)}px`);
        board.style.setProperty('--bd-x', `${(a.x - pitch / 2).toFixed(1)}px`);
        board.style.setProperty('--bd-y', `${Math.max(120, foot + 16).toFixed(1)}px`);
      }
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
