// Cross-provider links (SPEC 2.7): the lights go down and every link between two owners is an arc from the floor
// of the thing that reaches out to the floor of the thing it reaches, in the colour of the target's owner. Solid,
// long dash or short dash by how official it is. An end outside the five lands on a grey block at the row's end.
// The arcs draw one kind at a time, the kind with most links first, 3 s each, until touched. Hover reads an arc.
import { BoxGeometry, Color, Mesh, Vector2, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { FLOOR } from '../scene/stack.js';
import { owner } from '../worlds/index.js';

const STEP = 3;
const SQUEEZE = 2.85 / 4.2;
const VIEW = { pos: [0, 2.7, 31], look: [0, 2.35, 0], fov: 24, fit: 26.6, cy: 0.27 };
const PHONE = { pos: [0, 3.1, 30], look: [0, 2.5, 0], fov: 24, fit: 18.4, cy: 0.21 };
// each owner's colour as a line on the dark: its glass, lifted where the glass is too dark to show at night
const NIGHT = { anthropic: '#E08A6C', openai: '#F3F3F3', google: '#5C9EFF', meta: '#3D8BEA', xai: '#FFFFFF', you: '#A6ABB5', outside: '#A6ABB5' };
const white = new Color('#FFFFFF');

export function create(ctx, el, sec) {
  const { rig, row, labels, prims, studio, input, phone, reduced } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const items = $$('.ail-ln__item', el);
  const chips = $$('.ail-ln__kind', el);
  const kinds = chips.map((c) => c.dataset.kind).filter((k) => items.some((li) => li.dataset.kind === k));
  // strongest first: the kind with the most links leads the tour
  const tour = [...kinds].sort((a, b) => items.filter((li) => li.dataset.kind === b).length - items.filter((li) => li.dataset.kind === a).length);
  const edgeX = phone ? 8.2 : 11.75;
  const blocks = { you: -edgeX, outside: edgeX };
  const st = { kind: tour[0], active: -1, hover: -1, touched: false, clock: 0, k: 0, drawn: new Map() };

  // the grey blocks: whatever is outside the five, and your own computer
  const blockGeo = new BoxGeometry(0.9, 2.7, 0.9).translate(0, 1.35, 0);
  const blockMesh = Object.fromEntries(Object.entries(blocks).map(([id, x]) => {
    const m = new Mesh(blockGeo, ctx.mats.glass(owner(id), { halfH: 1.35, alpha: 0.92 }));
    m.position.set(x, 0, 0); m.visible = false; ctx.scene.add(m);
    return [id, m];
  }));

  // one arc per link. Its ends sit on the floors' side faces that look at each other, spread in depth when several share a floor
  const yAt = (id, f) => { const tw = row.tower(id); return tw ? tw.floors[f - 1].y + tw.lift : FLOOR.h / 2 + (FLOOR.n - f) * (FLOOR.h + FLOOR.gap0); };
  const xAt = (id) => { const tw = row.tower(id); return tw ? tw.x + tw.shift : blocks[id] ?? blocks.outside; };
  const halfW = (id) => (row.tower(id) ? FLOOR.w / 2 : 0.45);
  const seat = new Map();
  const ends = items.map((li) => {
    const d = li.dataset;
    const a = { id: d.from, f: Number(d.ff) }, b = { id: d.to, f: Number(d.tf) };
    const ka = seat.get(`${a.id}:${a.f}`) || 0; seat.set(`${a.id}:${a.f}`, ka + 1);
    const kb = seat.get(`${b.id}:${b.f}`) || 0; seat.set(`${b.id}:${b.f}`, kb + 1);
    return { a, b, ka, kb };
  });
  const spread = (k, n) => (n <= 1 ? 0 : -0.95 + (1.9 * k) / (n - 1));
  function place(x) {
    const xa = xAt(x.a.id), xb = xAt(x.b.id), dir = Math.sign(xb - xa) || 1;
    x.from.set(xa + dir * halfW(x.a.id), yAt(x.a.id, x.a.f), spread(x.ka, seat.get(`${x.a.id}:${x.a.f}`)));
    x.to.set(xb - dir * halfW(x.b.id), yAt(x.b.id, x.b.f), spread(x.kb, seat.get(`${x.b.id}:${x.b.f}`)));
  }
  // over a stack an arc clears the lid plates. Between neighbours it stays low. Fixed once: the floors do not move here
  function liftOf(x, n) {
    const lo = Math.min(x.from.x, x.to.x), hi = Math.max(x.from.x, x.to.x);
    const over = towers.some((tw) => tw.x + tw.shift > lo + 0.1 && tw.x + tw.shift < hi - 0.1);
    const y = (x.from.y + x.to.y) / 2;
    return over ? 2 * ((phone ? 4.9 : 4.85) + 0.16 * (n % 6) - y) : 1.2 + 0.3 * (x.ka % 3);
  }
  if (phone) towers.forEach((tw, n) => { tw.shift = ROW_X[n] * (SQUEEZE - 1); });     // lifts are worked out on the layout they draw on
  const arcs = items.map((li, n) => {
    const d = li.dataset;
    const x = { li, n, kind: d.kind, ...ends[n], from: new Vector3(), to: new Vector3(), base: new Color(NIGHT[d.to] || NIGHT.outside) };
    place(x);
    x.arc = prims.arc(x.from, x.to, { color: NIGHT[d.to] || NIGHT.outside, official: d.official, lift: liftOf(x, n) });
    x.arc.show = 0; x.arc.update();
    return x;
  });
  towers.forEach((tw) => { tw.shift = 0; });

  function setKind(k, quiet) {
    st.kind = k;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === k)));
    const row = chips[0] && chips[0].parentElement, on = chips.find((c) => c.dataset.kind === k);
    if (phone && row && on) row.scrollLeft = Math.max(0, on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2);
    const first = arcs.find((x) => x.kind === k);
    setActive(first ? first.n : -1, quiet);
    arcs.forEach((x) => { if (x.kind === k) st.drawn.set(x.n, 0); });
  }
  function setActive(n, quiet) {
    if (n === st.active) return;
    st.active = n;
    items.forEach((li, k) => li.classList.toggle('is-on', k === n));
    if (!quiet && n >= 0) announce(items[n].textContent.replace(/\s+/g, ' ').trim());
  }
  const touch = () => { st.touched = true; };
  const onChip = (e) => { const c = e.target.closest('.ail-ln__kind'); if (c) { touch(); setKind(c.dataset.kind); } };
  const onKey = (e) => {
    if (sec !== ctx.clock.current || !el.contains(document.activeElement)) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault(); touch();
    const list = arcs.filter((x) => x.kind === st.kind);
    const i = list.findIndex((x) => x.n === st.active);
    setActive(list[(i + step + list.length) % list.length].n);
  };
  el.addEventListener('click', onChip);
  window.addEventListener('keydown', onKey);
  setKind(st.kind, true);

  // hover: the arc nearest the pointer, within 14 px, is the one read
  const p2 = new Vector2(), q = new Vector3();
  function nearest(px, py) {
    let best = -1, dist = 14;
    for (const x of arcs) {
      if (x.kind !== st.kind || x.arc.show < 0.2) continue;
      let prev = null;
      for (let s = 0; s <= 16; s++) {
        const u = s / 16, w0 = (1 - u) * (1 - u), w1 = 2 * (1 - u) * u, w2 = u * u;
        q.set(x.from.x * w0 + x.arc.mid.x * w1 + x.to.x * w2, x.from.y * w0 + x.arc.mid.y * w1 + x.to.y * w2, x.from.z * w0 + x.arc.mid.z * w1 + x.to.z * w2);
        const p = labels.project(q);
        if (prev) {
          p2.set(p.x - prev.x, p.y - prev.y);
          const len = p2.lengthSq() || 1;
          const t = Math.max(0, Math.min(1, ((px - prev.x) * p2.x + (py - prev.y) * p2.y) / len));
          const d = Math.hypot(px - (prev.x + p2.x * t), py - (prev.y + p2.y * t));
          if (d < dist) { dist = d; best = x.n; }
        }
        prev = p;
      }
    }
    return best;
  }

  ctx.state.compare = { ...(ctx.state.compare || {}), links: {
    count: arcs.length,
    drawn: () => arcs.filter((x) => x.arc.line.visible).length,
    dashes: () => arcs.map((x) => ({ n: x.n, official: x.li.dataset.official, dashed: !!x.arc.line.material.isLineDashedMaterial })),
    showAll() { arcs.forEach((x) => st.drawn.set(x.n, 1)); st.all = true; },
    show(n) { touch(); setKind(arcs[n].kind, true); setActive(n, true); },
  } };

  return {
    stops: [0.6],
    leave() {
      studio.dark = 0;
      delete document.documentElement.dataset.chrome;
      arcs.forEach((x) => { x.arc.show = 0; x.arc.update(); });
      Object.values(blockMesh).forEach((m) => { m.visible = false; });
      items.forEach((li) => li.classList.remove('is-on'));
      st.active = -1;
    },
    update(t, dt, u) {
      const k = smooth(span(u, 0, 0.25)) * (1 - smooth(span(u, sec.screens - 0.25, sec.screens)));
      st.k = k;
      if (phone) rig.mix(rig.stops.row, PHONE, k); else rig.mix(rig.stops.row, VIEW, k);
      // lights down: the room sweeps dark, a low wash of light keeps the glass and the floor readable
      studio.dark = 0.999 * k; studio.roomX = 0;
      studio.glow.amount = 0.62 * k; studio.glow.radius = 19; studio.glow.color.set('#9EA6B8'); studio.glow.pos.set(0, 3.5, 7);
      // the chrome and the words flip to paper on ink while the room is dark
      if ((k > 0.5) !== (document.documentElement.dataset.chrome === 'dark')) { if (k > 0.5) document.documentElement.dataset.chrome = 'dark'; else delete document.documentElement.dataset.chrome; }

      if (!st.touched && !reduced && k > 0.95) {
        st.clock += dt;
        if (st.clock > STEP) { st.clock = 0; setKind(tour[(tour.indexOf(st.kind) + 1) % tour.length], true); }
      }
      if (!phone && !input.touch && input.moved && k > 0.9) {
        const n = nearest(input.px, input.py);
        if (n >= 0) { touch(); setActive(n); }
        ctx.canvas.style.cursor = n >= 0 ? 'pointer' : '';
      }
      if (st.active < 0 && k > 0.5) setKind(st.kind, true);

      towers.forEach((tw, n) => {
        if (phone) tw.shift = ROW_X[n] * (SQUEEZE - 1) * k;
        tw.char.show = 1 - k;
        tw.lid.show = 1 - 0.55 * k;
        tw.layout();
      });
      Object.values(blockMesh).forEach((m) => { m.visible = k > 0.01; m.material.uniforms.uShow.value = k; });
      for (const x of arcs) {
        place(x);
        const mine = x.kind === st.kind || st.all;
        const d = Math.min(1, (st.drawn.get(x.n) ?? (mine ? 0 : 1)) + (reduced ? 1 : dt / 0.9));
        st.drawn.set(x.n, d);
        x.arc.draw = mine ? smooth(d * 1.4 - (x.n % 8) * 0.05) : 1;
        // the arc being read is brightest, its kind stays readable, the other kinds are a faint web behind
        x.arc.show = k * (x.n === st.active ? 1 : mine ? 0.5 : 0.09);
        x.arc.color.copy(x.base);
        if (x.n === st.active) x.arc.color.lerp(white, 0.25);
        x.arc.update();
      }
    },
    dispose() {
      el.removeEventListener('click', onChip);
      window.removeEventListener('keydown', onKey);
      arcs.forEach((x) => x.arc.dispose());
      Object.values(blockMesh).forEach((m) => { ctx.scene.remove(m); m.material.dispose(); });
      blockGeo.dispose();
      if (ctx.state.compare) delete ctx.state.compare.links;
    },
  };
}
