// My stack (SPEC 2.9.2): the base sinks, the five stacks step back, and a long low bench rises with five shelves.
// His pieces fly in on arcs, 70 ms apart: borrowed ones leave their company's stack in its glass and key into the
// bench with a dovetail, outside ones rise in house grey. The swap judges a router and coding-agent pair.
import { Line, LineBasicMaterial, Mesh, Vector3 } from 'three';
import { backOut, clamp01, easeIO, easeOut, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ORDER, owner } from '../worlds/index.js';
import { block, createBase, dot, dovetail, INK, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';

const Z = 3.3, H = 0.46, DEPTH = 1.9;
const P = { w: 1.02, h: 0.68, d: 0.9 };
const SLOT = 1.5, PAD = 0.28, GAP = 0.16;
const FLOOR = { router: 2, harness: 3, model: 4 };           // the floor a borrowed piece leaves its company's stack from
const FLY = 0.8, STAGGER = 0.07, SWAP = 0.7;
const LINE = { yes: 'yes', partial: 'partial', no: 'no' };

export function create(ctx, el, sec) {
  const { rig, row, labels, prims, phone, reduced, mats } = ctx;
  const read = (li) => ({ ref: li.dataset.ref, owner: li.dataset.owner, status: li.dataset.status, name: li.textContent.trim() });
  const opts = { router: $$('.ail-ms__opts[data-for="router"] li', el).map(read), worker: $$('.ail-ms__opts[data-for="worker"] li', el).map(read) };
  const [mineR, mineW] = (el.dataset.mine || '').split(' ');
  const quote = $('.ail-ms__quote', el);
  const pairsEl = $('.ail-ms__pairs', el);
  pairsEl.open = true;
  const says = $$('.ail-ms__say', el);
  const st = { r: 0, w: 0, flown: false, fly: 0, out: 0, last: null, official: 'no', visible: true };
  const made = [];
  const keep = (m) => { ctx.scene.add(m); made.push(m); return m; };

  // ---- layout: shelves left to right in band order, one slot for each piece shown at first depth
  const shelves = [];
  const pieces = [];
  let x = 0;
  for (const band of $$('.ail-ms__band', el)) {
    const lis = $$('.ail-ms__piece[data-first]', band);
    if (!lis.length) continue;
    const x0 = x;
    x += PAD;
    for (const li of lis) { pieces.push({ li, x: x + SLOT / 2, id: li.dataset.node, layer: li.dataset.layer, owner: li.dataset.owner, swap: li.dataset.swap || null }); x += SLOT; }
    x += PAD;
    shelves.push([x0, x]);
    x += GAP;
  }
  const span0 = x - GAP;
  shelves.forEach((s) => { s[0] -= span0 / 2; s[1] -= span0 / 2; });
  pieces.forEach((p) => { p.x -= span0 / 2; });

  // ---- the bench: five shelves of house glass, and the shadow the analytic floor cannot give it
  const bench = shelves.map(([a, b]) => { const m = keep(block(ctx, roundBox(b - a, H, DEPTH, 0.16), 'house', H)); m.position.set((a + b) / 2, H / 2, Z); return m; });
  const shade = shadow(ctx, span0, DEPTH, { opacity: 0.2 });
  shade.position.set(0.6, 0.003, Z + 0.55);
  made.push(shade);

  // ---- the pieces: an ink dot for him, a block of glass for anything else. Borrowed glass keys in with a dovetail
  const geo = roundBox(P.w, P.h, P.d, 0.12);
  const tail = dovetail(P.w, H * 0.78);
  const provider = (o) => ORDER.includes(o);
  pieces.forEach((p, k) => {
    p.to = new Vector3(p.x, p.layer === 'you' ? H + 0.27 : H + P.h / 2, Z);
    p.pos = p.to.clone(); p.from = p.to.clone(); p.top = new Vector3();
    p.t = reduced ? 1 : 0; p.delay = k * STAGGER; p.dur = FLY; p.float = 0; p.lift = 0; p.hover = 0;
    p.mesh = p.layer === 'you' ? dot(ctx, 0.27) : keep(block(ctx, geo, owner(p.owner), P.h));
    if (p.layer === 'you') made.push(p.mesh);
    p.inlay = keep(new Mesh(tail.geo, mats.glass(owner(p.owner), { halfH: H * 0.39 })));
    p.seam = keep(new Line(tail.seam, new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.7 })));
    p.inlay.position.set(p.x, H * 0.61, Z + DEPTH / 2 - 0.045); p.seam.position.copy(p.inlay.position);
    p.name = $('.ail-ms__name', p.li);
    p.li.addEventListener('pointerenter', () => { p.hover = 1; });
    p.li.addEventListener('pointerleave', () => { p.hover = 0; });
  });
  const byId = new Map(pieces.map((p) => [p.id, p]));
  const swapped = { router: pieces.find((p) => p.swap === 'router'), worker: pieces.find((p) => p.swap === 'worker') };
  st.r = Math.max(0, opts.router.findIndex((o) => o.ref === mineR));
  st.w = Math.max(0, opts.worker.findIndex((o) => o.ref === mineW));

  // a borrowed piece leaves its company's stack at the floor of its layer. An outside one rises through the floor
  const source = (p, own, out) => (provider(own) && FLOOR[p.layer] !== undefined ? row.tower(own).point(FLOOR[p.layer], 0, out) : out.set(p.x, -1.1, Z));
  function dress(p, o) {
    p.owner = o.owner;
    const glass = owner(o.owner);
    mats.setOwner(p.mesh.material, glass); mats.setOwner(p.inlay.material, glass);
    p.hatch = o.status === 'preview' || o.status === 'announced' ? 1 : 0;
    if (p.name) { p.name.textContent = o.name; p.name.dataset.owner = o.owner; }
    p.li.dataset.owner = o.owner;
  }

  // ---- the lines between his pieces: documented arrows in ink, and the one he wants gone, faint and dashed
  const arcs = JSON.parse(el.dataset.arrows || '[]').map(([a, b, state]) => {
    const pa = byId.get(a), pb = byId.get(b);
    if (!pa || !pb) return null;
    const target = state === 'target';
    const link = pa.layer === 'router' && pb.layer === 'harness';
    const lift = 0.45 + Math.abs(pa.x - pb.x) * 0.1 + (target ? 0.95 : 0);
    const make = (official) => prims.arc(pa.top, pb.top, { color: INK, official, lift, dots: false });
    return { pa, pb, target, link, make, arc: make(target ? 'no' : 'yes'), official: target ? 'no' : 'yes' };
  }).filter(Boolean);

  // ---- the swap: cycle the router through the personal agents and outside routers, the worker through the coding agents
  function verdict(quiet) {
    const r = opts.router[st.r], w = opts.worker[st.w];
    const mine = r.ref === mineR && w.ref === mineW;
    const say = says.find((li) => li.dataset.r === r.ref && li.dataset.w === w.ref);
    says.forEach((li) => li.classList.toggle('is-on', li === say && !mine));
    quote.classList.toggle('is-gone', !mine);
    pairsEl.classList.toggle('is-on', !mine);
    st.official = say ? say.dataset.official : 'none';
    for (const a of arcs) {
      if (!a.link) continue;
      const want = LINE[st.official] || 'no';
      if (want !== a.official) { a.arc.dispose(); a.arc = a.make(want); a.official = want; }
    }
    // no documented pair: no line, and the piece that was just swapped in hangs clear of the bench
    pieces.forEach((p) => { p.float = st.official === 'none' && p === st.last ? 1 : 0; });
    if (!quiet && say) announce(`${r.name}, ${w.name}. ${$('.ail-ms__stamp', say).textContent.trim()}. ${$('.ail-ms__line', say).textContent.trim()}`);
  }
  function swap(kind) {
    const list = opts[kind];
    const p = swapped[kind];
    if (!p || !list.length) return;
    const key = kind === 'router' ? 'r' : 'w';
    st[key] = (st[key] + 1) % list.length;
    const o = list[st[key]];
    dress(p, o);
    source(p, o.owner, p.from);
    p.t = reduced ? 1 : 0; p.delay = 0; p.dur = SWAP;
    st.last = p;
    verdict(false);
  }
  const buttons = $$('.ail-ms__swap', el);
  const onSwap = (e) => swap(e.currentTarget.dataset.swap);
  buttons.forEach((b) => { b.hidden = false; b.addEventListener('click', onSwap); });
  pieces.forEach((p) => { if (p.swap) dress(p, opts[p.swap][p.swap === 'router' ? st.r : st.w]); });
  verdict(true);

  // ---- labels: names under the bench in two staggered rows on a desktop. A phone lists them in the sheet
  const v = new Vector3();
  const w0 = new Vector3();
  const pins = phone ? [] : pieces.map((p, k) => labels.pin(p.li, () => v.set(p.x, 0.02, Z + DEPTH / 2), { ax: 0.5, ay: 0, dy: k % 2 ? 50 : 12 }));
  const leads = phone ? [] : pieces.map((_, k) => (k % 2 ? labels.line('dot') : null));
  pins.forEach((p) => { p.on = false; });

  function show(on) {
    st.visible = on;
    made.forEach((m) => { m.visible = on; });
    arcs.forEach((a) => { a.arc.show = 0; a.arc.update(); });
    pins.forEach((p) => { p.on = on; p.el.style.opacity = on ? '' : '0'; });
    leads.forEach((l) => l && l.set(0, 0, 0, 0, 0));
  }
  const base = createBase(ctx);
  base.show = 0; base.update();
  show(false);

  return {
    stops: [0.6],
    enter() { show(true); },
    leave() { show(false); base.show = 0; base.update(); pieces.forEach((p) => { p.li.querySelector('details').open = false; }); },
    update(t, dt, u) {
      // camera: from the base down to the bench, hold, then on to the floor where the router idea is drawn
      if (u < 1.08) rig.mix(STOPS.around, STOPS.bench, easeIO(span(u, 0, 0.32)));
      else rig.mix(STOPS.bench, STOPS.router, easeIO(span(u, 1.08, 1.3)));
      rig.yaw = 0.045; rig.pitch = 0.02;

      // the base of 2.9.1 sinks right to left and lets the stacks down. They step back and dim behind the bench
      base.show = 1;
      base.blocks.forEach((b, i) => { b.rise = 1 - span(u, 0.02 + (8 - i) * 0.017, 0.11 + (8 - i) * 0.017); });
      base.update();
      const back = smooth(span(u, 0.06, 0.3));
      for (const tw of row.towers) { tw.lift = base.under(tw.x - 1.2, tw.x + 1.2); tw.dim = 0.74 * back; tw.char.show = 1 - back; tw.lid.show = 1 - back * 0.45; }

      // the bench rises, then the pieces fly in once, 70 ms apart, and settle with a small overshoot
      const rise = smooth(span(u, 0.14, 0.3)) * (1 - smooth(span(u, 1.12, 1.28)));
      bench.forEach((m) => { m.position.y = H * (rise - 0.5); setGlass(m, { show: Math.min(1, rise * 4) }); });
      shade.material.opacity = 0.2 * rise;
      if (!st.flown && u > 0.24) {
        st.flown = true;
        if (!reduced) pieces.forEach((p) => { if (p.t < 1) source(p, p.owner, p.from); });
      }
      if (st.flown) st.fly += dt;
      const away = 1 - rise;
      pieces.forEach((p) => {
        if (st.flown && p.t < 1) p.t = reduced ? 1 : clamp01(p.t + (p.delay > 0 && st.fly < p.delay ? 0 : dt / p.dur));
        if (st.fly >= p.delay) p.delay = 0;
        const e = easeOut(p.t);
        const lift = (p.lift += ((p.float ? 0.4 : 0) - p.lift) * (1 - Math.exp(-5 * dt)));
        w0.copy(p.from).add(p.to).multiplyScalar(0.5); w0.y = Math.max(p.from.y, p.to.y) + 2.1;
        const a = 1 - e;
        p.pos.set(a * a * p.from.x + 2 * a * e * w0.x + e * e * p.to.x, a * a * p.from.y + 2 * a * e * w0.y + e * e * p.to.y, a * a * p.from.z + 2 * a * e * w0.z + e * e * p.to.z);
        p.pos.y += lift + (p.float && !reduced ? Math.sin(ctx.time * 1.6) * 0.03 : 0) - away * 1.4;
        const s = backOut(clamp01(p.t * 1.3 - 0.3), 1.6) * 0.42 + 0.58;
        p.mesh.position.copy(p.pos);
        p.mesh.scale.set(s, s, s);
        const on = st.flown ? smooth(p.t * 6) * (1 - away) : 0;
        if (p.layer === 'you') { p.mesh.material.uniforms.uShow.value = on; p.mesh.visible = on > 0.01; }
        else setGlass(p.mesh, { show: on, lit: p.hover * 0.3, hatch: p.hatch || 0 });
        const keyed = provider(p.owner) && p.layer !== 'you' && p.lift < 0.05 && p.t > 0.92;
        setGlass(p.inlay, { show: keyed ? rise : 0, hatch: p.hatch || 0 });
        p.inlay.position.y = H * 0.61 + H * (rise - 1);
        p.seam.visible = keyed && rise > 0.5; p.seam.position.copy(p.inlay.position);
        p.top.set(p.pos.x, p.pos.y + (p.layer === 'you' ? 0.27 : P.h / 2) + 0.02, p.pos.z);
      });

      // lines run out once the pieces have landed. The pair's line follows the swap's verdict
      const drawn = smooth((st.fly - FLY - pieces.length * STAGGER) / 0.7) * (1 - away);
      arcs.forEach((a) => {
        a.arc.draw = reduced ? 1 : drawn;
        a.arc.show = (a.target ? 0.38 : 0.62) * (a.link && st.official === 'none' ? 0 : 1) * (st.flown ? 1 : 0) * (1 - away);
        a.arc.update();
      });

      // words: the head arrives with the bench, the labels with their pieces
      const words = smooth(span(u, 0.12, 0.3)) * (1 - smooth(span(u, 1.1, 1.24)));
      el.style.setProperty('--ms-on', words.toFixed(3));
      pins.forEach((pin, k) => {
        const p = pieces[k];
        pin.el.style.opacity = (words * smooth(p.t * 3 - 1.4)).toFixed(3);
        const lead = leads[k];
        if (lead) {
          const a = labels.project(v.set(p.x, 0.02, Z + DEPTH / 2));
          lead.set(a.x, a.y + 3, a.x, a.y + 48, Number(pin.el.style.opacity) * 0.6);
        }
      });
    },
    dispose() {
      buttons.forEach((b) => { b.removeEventListener('click', onSwap); b.hidden = true; });
      pairsEl.open = false;
      pins.forEach((p) => p.drop());
      leads.forEach((l) => l && l.drop());
      arcs.forEach((a) => a.arc.dispose());
      made.forEach((m) => { if (m.material) m.material.dispose(); m.removeFromParent(); });
      geo.dispose(); tail.geo.dispose(); tail.seam.dispose(); shade.geometry.dispose();
      bench.forEach((m) => m.geometry.dispose());
      pieces.forEach((p) => { if (p.layer === 'you') p.mesh.geometry.dispose(); });
      base.dispose();
    },
  };
}
