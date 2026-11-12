// Cross-provider links (SPEC 2.7): the lights go down and a link between two owners is an arc from the floor of the
// thing that reaches out to the floor of the thing it reaches, in the colour of the target's owner, solid or dashed
// by how official it is. The scroll is the tour: "Thinks with", then "Hands work to", one arc at a time with its two
// names at its ends. Only the current kind is drawn. A chip, a hover or an arrow key holds until 0.15 screens of scroll.
import { BoxGeometry, Color, Mesh, Vector2, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { FLOOR } from '../scene/stack.js';
import { owner } from '../worlds/index.js';

const PLAN = [['thinks', 0.2, 0.75], ['hands', 0.75, 1.3]];      // which kind the scroll reads, from where to where (screens)
const HOLD = 0.15;
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
  const edgeX = phone ? 8.2 : 11.75;
  const blocks = { you: -edgeX, outside: edgeX };
  const st = { kind: '', active: -1, pick: null, u: 0, k: 0, drawn: new Map(), pins: [] };
  const outs = $$('.ail-ln__out', el);

  // the grey blocks: whatever is outside the five, and your own computer
  // (the block is centred on its own middle: the glass shader lights a slab from its middle outward)
  const blockGeo = new BoxGeometry(0.9, 2.7, 0.9);
  const blockMesh = Object.fromEntries(Object.entries(blocks).map(([id, x]) => {
    const m = new Mesh(blockGeo, ctx.mats.glass(owner(id), { halfH: 1.35, alpha: 0.92 }));
    m.position.set(x, 1.35, 0); m.visible = false; ctx.scene.add(m);
    return [id, m];
  }));
  const outPins = phone ? [] : outs.map((node) => { const p = labels.pin(node, new Vector3(blocks[node.dataset.at], 2.82, 0), { ax: node.dataset.at === 'you' ? 0 : 1, ay: 1, dx: node.dataset.at === 'you' ? -22 : 22 }); p.on = false; return p; });

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
    x.arc = prims.arc(x.from, x.to, { color: NIGHT[d.to] || NIGHT.outside, official: d.official, lift: liftOf(x, n), dots: false });
    x.arc.show = 0; x.arc.update();
    return x;
  });
  towers.forEach((tw) => { tw.shift = 0; });
  // each kind's arcs in the order the scroll reads them: links between companies first, hand-offs to your own computer last
  const lists = Object.fromEntries(kinds.map((k) => [k, arcs.filter((x) => x.kind === k).sort((a, b) => (a.b.id === 'you') - (b.b.id === 'you'))]));

  function setKind(k, quiet) {
    st.kind = k;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.kind === k)));
    const row = chips[0] && chips[0].parentElement, on = chips.find((c) => c.dataset.kind === k);
    if (phone && row && on) row.scrollLeft = Math.max(0, on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2);
    arcs.forEach((x) => { if (x.kind === k) st.drawn.set(x.n, 0); });
    void quiet;
  }
  // the arc being read: its sentence in the card, its two names at its two ends and the floor's name where it lands
  function setActive(n, quiet) {
    if (n === st.active) return;
    st.active = n;
    st.pins.forEach((p) => p.drop()); st.pins = [];
    items.forEach((li, k) => li.classList.toggle('is-on', k === n));
    const x = arcs[n];
    if (x && !phone) {
      const [a, b] = $$('.ail-ln__ends .ail-own', x.li), floor = $('.ail-ln__floor', x.li);
      const dir = Math.sign(x.to.x - x.from.x) || 1;
      st.pins.push(labels.pin(a, x.from, { ax: dir > 0 ? 1 : 0, ay: 1, dx: -dir * 6, dy: -8 }), labels.pin(b, x.to, { ax: dir > 0 ? 0 : 1, ay: 1, dx: dir * 6, dy: -8 }));
      if (floor) st.pins.push(labels.pin(floor, x.to, { ax: dir > 0 ? 0 : 1, ay: 0, dx: dir * 6, dy: 8 }));
    }
    if (!quiet && n >= 0) announce(items[n].textContent.replace(/\s+/g, ' ').trim());
  }
  // a visitor's own pick: a kind (its first arc), or one arc. It holds until the scroll has moved 0.15 screens
  const pick = (kind, n) => { const list = lists[kind] || []; st.pick = { kind, n: n ?? (list[0] ? list[0].n : -1), at: st.u }; };
  const onChip = (e) => { const c = e.target.closest('.ail-ln__kind'); if (c) pick(c.dataset.kind); };
  const onKey = (e) => {
    if (sec !== ctx.clock.current || !el.contains(document.activeElement)) return;
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const list = lists[st.kind] || [];
    const i = list.findIndex((x) => x.n === st.active);
    if (list.length) pick(st.kind, list[(i + step + list.length) % list.length].n);
  };
  el.addEventListener('click', onChip);
  window.addEventListener('keydown', onKey);

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
    show(n) { pick(arcs[n].kind, n); },
    get active() { return st.active; },
    get kind() { return st.kind; },
  } };

  return {
    stops: [0.31, 0.52, 0.7],
    enter() { outPins.forEach((p) => { p.on = true; }); },
    leave() {
      outPins.forEach((p) => { p.on = false; p.el.style.opacity = ''; });
      st.pins.forEach((p) => p.drop()); st.pins = []; st.pick = null; st.kind = '';
      studio.dark = 0;
      delete document.documentElement.dataset.chrome;
      arcs.forEach((x) => { x.arc.show = 0; x.arc.update(); });
      Object.values(blockMesh).forEach((m) => { m.visible = false; });
      items.forEach((li) => li.classList.remove('is-on'));
      st.active = -1;
    },
    update(t, dt, u) {
      const k = smooth(span(u, 0, 0.2)) * (1 - smooth(span(u, 1.3, sec.screens)));
      st.k = k; st.u = u;
      if (phone) rig.mix(rig.stops.row, PHONE, k); else rig.mix(rig.stops.row, VIEW, k);
      // lights down: the room sweeps dark, a low wash of light keeps the glass and the floor readable
      studio.dark = 0.999 * k; studio.roomX = 0;
      studio.glow.amount = 0.62 * k; studio.glow.radius = 19; studio.glow.color.set('#9EA6B8'); studio.glow.pos.set(0, 3.5, 7);
      // the chrome and the words flip to paper on ink while the room is dark. The sweep comes from the left, where
      // the title stands, so they flip as it reaches the title (a third of the way) and not at the middle of the room
      const night = k > 0.34;
      if (night !== (document.documentElement.dataset.chrome === 'dark')) { if (night) document.documentElement.dataset.chrome = 'dark'; else delete document.documentElement.dataset.chrome; }

      if (!phone && !input.touch && input.moved && k > 0.9) {
        const n = nearest(input.px, input.py);
        if (n >= 0 && n !== st.active) pick(st.kind, n);
        ctx.canvas.style.cursor = n >= 0 ? 'pointer' : '';
      }
      // the scroll picks the kind and, inside it, the arc: every arc owns an equal share of its kind's stretch
      if (st.pick && Math.abs(u - st.pick.at) > HOLD) st.pick = null;
      let kind = st.pick ? st.pick.kind : '', n = st.pick ? st.pick.n : -1;
      if (!st.pick) {
        const seg = PLAN.find(([, , to]) => u < to) || PLAN[PLAN.length - 1];
        const list = lists[seg[0]] || [];
        kind = seg[0];
        n = list.length ? list[Math.min(list.length - 1, Math.floor(span(u, seg[1], seg[2]) * list.length))].n : -1;
      }
      if (kind !== st.kind) setKind(kind, true);
      setActive(k > 0.3 ? n : -1, !st.pick);
      outPins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });

      towers.forEach((tw, n) => {
        if (phone) tw.shift = ROW_X[n] * (SQUEEZE - 1) * k;
        tw.char.show = 1 - k;                    // the five characters leave together. The mark plates stay, at full value
        tw.layout();
      });
      Object.values(blockMesh).forEach((m) => { m.visible = k > 0.01; m.material.uniforms.uShow.value = k; });
      for (const x of arcs) {
        place(x);
        const mine = x.kind === st.kind || st.all;
        const d = Math.min(1, (st.drawn.get(x.n) ?? (mine ? 0 : 1)) + (reduced ? 1 : dt / 0.9));
        st.drawn.set(x.n, d);
        x.arc.draw = mine ? smooth(d * 1.4 - (x.n % 8) * 0.05) : 1;
        // only the current kind is drawn: thin at 35 percent, the arc being read full. The other kinds wait behind their chips
        x.arc.show = k * (x.n === st.active ? 1 : mine ? 0.35 : 0);
        x.arc.color.copy(x.base);
        if (x.n === st.active) x.arc.color.lerp(white, 0.25);
        x.arc.update();
      }
    },
    dispose() {
      el.removeEventListener('click', onChip);
      window.removeEventListener('keydown', onKey);
      arcs.forEach((x) => x.arc.dispose());
      st.pins.forEach((p) => p.drop()); outPins.forEach((p) => p.drop());
      Object.values(blockMesh).forEach((m) => { ctx.scene.remove(m); m.material.dispose(); });
      blockGeo.dispose();
      if (ctx.state.compare) delete ctx.state.compare.links;
    },
  };
}
