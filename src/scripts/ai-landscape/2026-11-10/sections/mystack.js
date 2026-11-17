// My stack (SPEC 2.9.2): the cabinet sinks, and a long low bench rises with five shelves and a cast. A large dot
// (him), his router and his coding agent on two large blocks with their companies' own figures standing on them,
// and a row of small grey things they use. Ink cords say who talks to whom. Only the stacks that lend him a piece
// stay behind. Borrowed pieces fly in from their stacks and key into the bench. The swap judges a pair.
import { Line, LineBasicMaterial, Mesh, Vector3 } from 'three';
import { backOut, clamp01, easeIO, easeOut, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ORDER, owner, world } from '../worlds/index.js';
import { block, createBase, dot, dovetail, INK, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';
import { createFigure } from '../scene/cast.js';
import { GLYPHS } from '../scene/glyphs.js';

const Z = 3.3, H = 0.46, DEPTH = 1.9;
const P = { w: 1.02, h: 0.68, d: 0.9 };
const LEAD = { w: 1.79, h: 1.02, d: 1.08 };                  // his router and his coding agent: the two that do the work
const ME = 0.42;                                             // the dot that is him
const SLOT = { you: 1.5, router: 2.7, harness: 2.7, model: 1.5 }, REST = 1.36, PAD = 0.28, GAP = 0.16;
const FLOOR = { router: 2, harness: 3, model: 4 };           // the floor a borrowed piece leaves its company's stack from
const FLY = 0.8, STAGGER = 0.07, SWAP = 0.7;
// the cord from router to coding agent: dashed as the pair is documented (44ths of its length), a bead every 1.4 s
const CORD = { dash: { yes: null, partial: [6, 2], no: [3, 3] }, out: 0.35, run: 1.4, sag: -0.14 };
// the names stand in two rows under the bench's foot (px): the second begins where the first one's ground ends (a
// name is 48 px high), so no ground of one row lies over a name of the other
const ROWS = [12, 60];

export function create(ctx, el, sec) {
  const { rig, row, labels, prims, phone, reduced, mats, textures } = ctx;
  const read = (li) => ({ ref: li.dataset.ref, owner: li.dataset.owner, status: li.dataset.status, name: li.textContent.trim() });
  const opts = { router: $$('.ail-ms__opts[data-for="router"] li', el).map(read), worker: $$('.ail-ms__opts[data-for="worker"] li', el).map(read) };
  const [mineR, mineW] = (el.dataset.mine || '').split(' ');
  const quote = $('.ail-ms__quote', el);
  const pairsEl = $('.ail-ms__pairs', el);
  pairsEl.open = true;
  const says = $$('.ail-ms__say', el);
  const st = { r: 0, w: 0, flown: false, fly: 0, last: null, official: 'no', time: 0, tick: 0 };
  const made = [];
  const keep = (m) => { ctx.scene.add(m); made.push(m); return m; };

  // ---- layout: shelves left to right in band order, one slot for each piece shown at first depth. The two that do
  // the work get a wide slot and a large block, the dot and the model a middle one, everything else a narrow one
  const shelves = [];
  const pieces = [];
  let x = 0;
  for (const band of $$('.ail-ms__band', el)) {
    const lis = $$('.ail-ms__piece[data-first]', band);
    if (!lis.length) continue;
    const x0 = x;
    x += PAD;
    for (const li of lis) {
      const layer = li.dataset.layer, w = SLOT[layer] || REST;
      pieces.push({ li, x: x + w / 2, id: li.dataset.node.replace(/^aaron-/, ''), layer, owner: li.dataset.owner, swap: li.dataset.swap || null, box: li.dataset.swap ? LEAD : P });
      x += w;
    }
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
  const geo = roundBox(P.w, P.h, P.d, 0.12), bigGeo = roundBox(LEAD.w, LEAD.h, LEAD.d, 0.16);
  const tail = dovetail(P.w, H * 0.78), bigTail = dovetail(LEAD.w, H * 0.78);
  const provider = (o) => ORDER.includes(o);
  pieces.forEach((p, k) => {
    const me = p.layer === 'you', big = p.box === LEAD;
    p.half = me ? ME : p.box.h / 2;
    p.to = new Vector3(p.x, H + p.half, Z);
    p.pos = p.to.clone(); p.from = p.to.clone();
    p.top = new Vector3(); p.out = new Vector3(); p.head = new Vector3(); p.left = new Vector3(); p.right = new Vector3();
    p.t = reduced ? 1 : 0; p.delay = k * STAGGER; p.dur = FLY; p.float = 0; p.lift = 0; p.hover = 0; p.tall = 0;
    p.mesh = me ? dot(ctx, ME, null, { segments: 32 }) : keep(block(ctx, big ? bigGeo : geo, owner(p.owner), p.box.h));
    if (me) made.push(p.mesh);
    // each block's front says what it is in the page's own glyphs: the layer's (fork, loop, core) or the drawer's it came from
    if (!me && GLYPHS[p.layer]) { p.glyph = textures.glyphPlane(p.layer, big ? 0.52 : 0.4); p.glyph.position.z = p.box.d / 2 + 0.006; p.mesh.add(p.glyph); }
    const t = big ? bigTail : tail;
    p.inlay = keep(new Mesh(t.geo, mats.glass(owner(p.owner), { halfH: H * 0.39 })));
    p.seam = keep(new Line(t.seam, new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.7 })));
    p.inlay.position.set(p.x, H * 0.61, Z + DEPTH / 2 - 0.045); p.seam.position.copy(p.inlay.position);
    p.name = $('.ail-ms__name', p.li); p.tag = $('.ail-ms__tag', p.li);
    p.over = () => { p.hover = 1; }; p.leave = () => { p.hover = 0; };       // kept, so dispose() can take them off again
    p.li.addEventListener('pointerenter', p.over);
    p.li.addEventListener('pointerleave', p.leave);
  });
  const byId = new Map(pieces.map((p) => [p.id, p]));
  pieces[0].li.dataset.edge = 'start'; pieces[pieces.length - 1].li.dataset.edge = 'end';      // cards at the ends open inward
  const swapped = { router: pieces.find((p) => p.swap === 'router'), worker: pieces.find((p) => p.swap === 'worker') };
  st.r = Math.max(0, opts.router.findIndex((o) => o.ref === mineR));
  st.w = Math.max(0, opts.worker.findIndex((o) => o.ref === mineW));

  // ---- the cast, on his own pair only (scene/cast.js): the character of his router's company on the router, the
  // creature of his coding agent's company on the coding agent. A piece that is swapped in shows its glass alone
  const cast = [[swapped.router, mineR, 'agent'], [swapped.worker, mineW, 'tool']]
    .map(([p, mine, role]) => ({ p, mine, fig: p && provider(p.owner) ? createFigure(ctx, world(p.owner), role) : null })).filter((c) => c.fig);

  // a borrowed piece leaves its company's stack at the floor of its layer. An outside one rises through the floor
  const source = (p, own, out) => (provider(own) && FLOOR[p.layer] !== undefined ? row.tower(own).point(FLOOR[p.layer], 0, out) : out.set(p.x, -1.1, Z));
  // the glyph on a block's front is printed in its glass's own edge colour (paper on black, ink on milk), ink on grey
  const print = (p) => { if (p.glyph) p.glyph.material.uniforms.uTint.value.set(provider(p.owner) ? owner(p.owner).rim : INK); };
  pieces.forEach(print);
  function dress(p, o) {
    p.owner = o.owner; p.ref = o.ref;
    const glass = owner(o.owner);
    mats.setOwner(p.mesh.material, glass); mats.setOwner(p.inlay.material, glass); print(p);
    p.hatch = o.status === 'preview' || o.status === 'announced' ? 1 : 0;
    if (p.name) { p.name.textContent = o.name; p.name.dataset.owner = o.owner; }
    p.li.dataset.owner = o.owner;
  }

  // ---- the lines between his pieces. Him to his router and the router to the coding agent are ink cords (the
  // second dashed as the pair is documented, with a bead). The line he wants gone leaps the router, faint and
  // dashed. What the coding agent uses are thin arcs from its block's corner.
  const lines = (el.dataset.arrows || '').split(' ').map((pair) => {
    const target = pair.endsWith('!');
    const [a, b] = pair.replace('!', '').split(':');
    const pa = byId.get(a), pb = byId.get(b);
    if (!pa || !pb || (phone && Math.max(pieces.indexOf(pa), pieces.indexOf(pb)) > 3)) return null;      // (a phone's picture holds the first four)
    const link = pa.layer === 'router' && pb.layer === 'harness';
    if (link || (pa.layer === 'you' && pb.layer === 'router')) {
      const cord = prims.cord(pa.right, pb.left, { color: INK, lift: CORD.sag, radius: phone ? 0.05 : 0.03, bead: phone ? 0.14 : 0.1 });
      cord.show = 0; cord.update();
      return { pa, pb, link, cord, out: 0 };
    }
    const dx = Math.abs(pa.x - pb.x);
    const from = pa.box === LEAD ? pa.out : pa.top, to = target ? pb.head : pb.top;
    const arc = prims.arc(from, to, { color: INK, official: target ? 'no' : 'yes', lift: target ? 1.1 + dx * 0.24 : 0.45 + dx * 0.1, dots: false });
    return { pa, pb, target, arc };
  }).filter(Boolean);

  // a desktop prints the stamp bottom left, under the names. A short window has no room there: where the stamp would
  // stand over the first row of names and the two swaps, it stands where his sentence stood, under the title (the
  // sentence is away while the pair on the bench is not his)
  const v = new Vector3();
  function place() {
    if (phone || !pairsEl.classList.contains('is-on')) return;
    const frame = pairsEl.offsetParent.getBoundingClientRect();
    const names = labels.project(v.set(pieces[0].x, 0.02, Z + DEPTH / 2)).y + ROWS[1];
    const up = frame.bottom - pairsEl.offsetLeft - pairsEl.offsetHeight < names;
    const top = up ? `${Math.round(quote.getBoundingClientRect().top - frame.top)}px` : '';
    if (pairsEl.style.top !== top) { pairsEl.style.top = top; pairsEl.style.bottom = up ? 'auto' : ''; }
  }

  // ---- the swap: cycle the router through the personal agents and outside routers, the worker through the coding agents
  function verdict(quiet) {
    const r = opts.router[st.r], w = opts.worker[st.w];
    const mine = r.ref === mineR && w.ref === mineW;
    const say = says.find((li) => li.dataset.r === r.ref && li.dataset.w === w.ref) || says.find((li) => li.dataset.r === r.ref && 'none' in li.dataset);
    says.forEach((li) => li.classList.toggle('is-on', li === say && !mine));
    quote.classList.toggle('is-gone', !mine);
    pairsEl.classList.toggle('is-on', !mine);
    // a phone prints the stamp just over the list of pieces, however many rows that list takes in this window (the
    // sheet's fixed place stood it over the first row, and a finger could not reach the router's swap a second time)
    if (phone && !mine) pairsEl.style.bottom = `${Math.round(window.innerHeight - $('.ail-ms__bands', el).getBoundingClientRect().top + 8)}px`;
    place();
    st.official = say ? say.dataset.official : 'none';
    // no documented pair: no cord, and the piece that was just swapped in hangs clear of the bench
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
    // a lender that was away takes its place behind the piece before the piece leaves it
    lenders(0);
    row.towers.forEach((tw, i) => { tw.shift = seat[i] - tw.x; });
    source(p, o.owner, p.from);
    p.t = reduced ? 1 : 0; p.delay = 0; p.dur = SWAP;
    st.last = p; p.again = true;
    verdict(false);
  }
  const buttons = $$('.ail-ms__swap', el);
  const onSwap = (e) => swap(e.currentTarget.dataset.swap);
  buttons.forEach((b) => { b.hidden = false; b.addEventListener('click', onSwap); });
  pieces.forEach((p) => { if (p.swap) dress(p, opts[p.swap][p.swap === 'router' ? st.r : st.w]); });
  verdict(true);
  // pieces past first depth leave their bands for the list behind the "more" button, and go back on dispose
  const restList = $('.ail-ms__restlist', el);
  const later = $$('.ail-ms__piece:not([data-first])', el).map((li) => [li, li.parentNode, li.nextSibling]);
  if (restList) later.forEach(([li]) => restList.append(li));
  // Escape steps back: every card this section opened closes
  const onEsc = (e) => { if (e.key === 'Escape' && sec === ctx.clock.current) $$('details[open]:not(.ail-ms__pairs)', el).forEach((d) => { d.open = false; }); };
  window.addEventListener('keydown', onEsc);

  // ---- labels: names under the bench in two staggered rows on a desktop (his pair has room in the first row, at
  // the feet of the two large blocks). A phone lists them in the sheet
  const w0 = new Vector3();
  const low = (p, k) => k % 2 === 1 && p.box !== LEAD;
  const pins = phone ? [] : pieces.map((p, k) => labels.pin(p.li, () => v.set(p.x, 0.02, Z + DEPTH / 2), { ax: 0.5, ay: 0, dy: ROWS[low(p, k) ? 1 : 0] }));
  const leads = phone ? [] : pieces.map((p, k) => (low(p, k) ? labels.line('dot') : null));
  pins.forEach((p) => { p.on = false; });
  // a phone's picture is small: it frames him, his router, his coding agent and its model, so the cast stands large
  const lead4 = pieces.slice(0, 4), mx = (lead4[0].x + lead4[lead4.length - 1].x) / 2;
  const BENCH = phone ? { pos: [mx, 4.6, 27.5], look: [mx, 1.9, 3.2], fov: 24, fit: lead4[lead4.length - 1].x - lead4[0].x + (SLOT.you + SLOT.model) / 2 + 1.6, cy: 0.44 } : STOPS.bench;      // (cy: clear of the stamp a swap prints over the list)
  // the stacks that lend him a piece come back behind the bench, dimmed, each right behind what it lends (the
  // middle of its first pieces that stand side by side, a board's width clear of the next lender). The others stay
  // away. A swap changes who lends
  const lend = row.towers.map(() => 0), seat = row.towers.map((tw) => tw.x);
  function lenders(dt) {
    const at = row.towers.map((tw) => {
      const k = pieces.findIndex((p) => p.owner === tw.id);
      if (k < 0) return null;
      let n = k;
      while (pieces[n + 1] && pieces[n + 1].owner === tw.id) n++;
      return (pieces[k].x + pieces[n].x) / 2;
    });
    const order = at.map((x, i) => [x, i]).filter(([x]) => x != null).sort((a, b) => a[0] - b[0]);
    order.forEach((o, k) => { if (k) o[0] = Math.max(o[0], order[k - 1][0] + 3.6); at[o[1]] = o[0]; });
    row.towers.forEach((_, i) => {
      const on = at[i] == null ? 0 : 1, snap = reduced || dt == null;
      if (on) seat[i] = snap || lend[i] < 0.08 ? at[i] : seat[i] + (at[i] - seat[i]) * (1 - Math.exp(-5 * dt));
      lend[i] = snap ? on : lend[i] + (on - lend[i]) * (1 - Math.exp(-7 * dt));
    });
  }

  function show(on) {
    made.forEach((m) => { m.visible = on; });
    cast.forEach((c) => c.fig.hide());
    lines.forEach((l) => { const d = l.cord || l.arc; d.show = 0; d.update(); });
    pins.forEach((p) => { p.on = on; p.el.style.opacity = on ? '' : '0'; });
    leads.forEach((l) => l && l.set(0, 0, 0, 0, 0));
    lenders(null);
  }
  const base = createBase(ctx);
  base.show = 0; base.update();
  show(false);

  // for the tests: the figures standing, the cord between the pair, who lends
  ctx.state.compare = { ...(ctx.state.compare || {}), mystack: {
    cast: () => cast.map((c) => ({ on: c.fig.mesh.visible && c.fig.k > 0.9, kind: c.fig.orb ? 'orb' : 'cut', piece: c.p.id, owner: c.p.owner })),
    cords: () => lines.filter((l) => l.cord).map((l) => ({ from: l.pa.id, to: l.pb.id, on: l.cord.show > 0.01 && l.cord.draw >= 1, dash: l.cord.dash, bead: l.cord.bead == null ? null : +l.cord.bead.toFixed(2) })),
    lenders: () => row.towers.filter((tw) => tw.show > 0.5).map((tw) => ({ id: tw.id, x: +(tw.x + tw.shift).toFixed(2), lends: pieces.filter((p) => p.owner === tw.id).map((p) => +p.x.toFixed(2)) })),
    sizes: () => pieces.map((p) => ({ id: p.id, layer: p.layer, w: p.layer === 'you' ? ME * 2 : p.box.w })),
    official: () => st.official,
  } };

  return {
    stops: [0.6],
    enter() { show(true); },
    leave() { show(false); base.show = 0; base.update(); pieces.forEach((p) => { p.li.querySelector('details').open = false; }); },
    update(t, dt, u) {
      st.time += dt;
      // camera: from the cabinet down to the bench, hold, then on to the floor where the router idea is drawn
      if (u < 1.08) rig.mix(STOPS.around, BENCH, easeIO(span(u, 0, 0.32)));
      else rig.mix(BENCH, STOPS.router, easeIO(span(u, 1.08, 1.3)));
      rig.yaw = 0.045; rig.pitch = 0.02;

      // the cabinet of 2.9.1 sinks right to left and lets the stacks down. The lenders step back and dim behind the
      // bench, the others leave. All of them are gone when the floor is handed to the router's diagrams
      base.show = 1;
      base.blocks.forEach((b, i) => { b.rise = 1 - span(u, 0.02 + (8 - i) * 0.017, 0.11 + (8 - i) * 0.017); });
      base.update();
      const back = smooth(span(u, 0.06, 0.3));
      const gone = smooth(span(u, 1.1, 1.26));
      // an open card hides the lids: a mark is never covered, and one drawn as an image would sit over the card
      const carded = el.querySelector('details[open]:not(.ail-ms__pairs)') ? 0 : 1;
      lenders(dt);
      row.towers.forEach((tw, i) => {
        // the five leave where they stand (the first half of the step back), then the lenders return in their places
        tw.shift = back > 0.5 ? seat[i] - tw.x : 0;
        tw.show = (1 - smooth(Math.min(1, back * 2)) + smooth(Math.max(0, back * 2 - 1)) * lend[i]) * (1 - gone);
        tw.lift = base.under(tw.x + tw.shift - 1.2, tw.x + tw.shift + 1.2); tw.dim = 0.74 * back;
        // the five figures stay where the cabinet had them and shrink away with their stacks: the cast is on the bench
        if (!phone) { tw.char.to = 'front'; tw.char.t = 1; }
        tw.char.scale = 1 - smooth(Math.min(1, back * 2)); tw.char.show = back < 0.5 ? 1 : 0;
        tw.lid.show = back > 0.3 ? 0 : carded;      // a mark is full or absent: it leaves when its stack becomes background (u 0.15)
        for (const f of tw.floors) f.guestShow = 1 - back;      // and a lender stands there as one colour: the parts inside its floors would be stray beads behind the cast
      });

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
        if (p.glyph) { p.glyph.material.uniforms.uOpacity.value = on * 0.9; p.glyph.visible = on > 0.01; }
        const keyed = provider(p.owner) && p.layer !== 'you' && p.lift < 0.05 && p.t > 0.92;
        setGlass(p.inlay, { show: keyed ? rise : 0, hatch: p.hatch || 0 });
        p.inlay.position.y = H * 0.61 + H * (rise - 1);
        p.seam.visible = keyed && rise > 0.5; p.seam.position.copy(p.inlay.position);
        p.landed = st.flown && p.t >= 1 && away < 0.1;
      });

      // the cast: each steps onto its block once the block has landed. A piece that was swapped for another loses it
      cast.forEach((c) => { c.fig.update(dt, c.p.ref === c.mine && c.p.landed, v.set(c.p.pos.x, c.p.pos.y + c.p.half, Z)); c.p.tall = c.fig.tall; });
      // where a line may touch a piece: its top, its sides, the right corner of a large block, and the head of
      // whoever stands on it
      pieces.forEach((p) => {
        const w = p.layer === 'you' ? ME : p.box.w / 2;
        p.top.set(p.pos.x, p.pos.y + p.half + 0.02, p.pos.z);
        p.left.set(p.pos.x - w, p.pos.y, p.pos.z); p.right.set(p.pos.x + w, p.pos.y, p.pos.z);
        p.out.set(p.pos.x + w - 0.16, p.pos.y + p.half + 0.02, p.pos.z);
        p.head.set(p.pos.x, p.pos.y + p.half + p.tall + 0.04, p.pos.z);
      });

      // lines run out once the pieces have landed. A cord waits for both its ends, runs out in 0.35 s, and the one
      // between the pair is dashed as the swap's verdict says, or absent
      const drawn = (reduced ? 1 : smooth((st.fly - FLY - pieces.length * STAGGER) / 0.7)) * (1 - away);      // (reduced motion: they are there with the pieces)
      lines.forEach((l) => {
        if (l.cord) {
          const there = l.pa.landed && l.pb.landed && drawn > 0.2 && !(l.link && st.official === 'none');
          l.out = reduced ? (there ? 1 : 0) : there ? Math.min(1, l.out + dt / CORD.out) : 0;
          l.cord.dash = l.link ? CORD.dash[st.official] || null : null;
          l.cord.draw = l.out; l.cord.show = there ? 1 - away : 0;
          l.cord.bead = !l.link || l.out < 1 ? null : reduced ? 1 : (st.time % CORD.run) / CORD.run;
          l.cord.update();
          return;
        }
        l.arc.draw = reduced ? 1 : drawn;
        l.arc.show = (l.target ? 0.42 : 0.62) * (st.flown && l.pa.landed && l.pb.landed ? 1 : 0) * (1 - away);
        l.arc.update();
      });

      // words: the head arrives with the bench, the labels with their pieces
      const words = smooth(span(u, 0.12, 0.3)) * (1 - smooth(span(u, 1.1, 1.24)));
      el.style.setProperty('--ms-on', words.toFixed(3));
      // (the stamp's place is measured again twice a second while the camera holds: a window can change its size)
      st.tick -= dt;
      if (st.tick <= 0 && u > 0.32 && u < 1.08) { st.tick = 0.5; place(); }
      pins.forEach((pin, k) => {
        const p = pieces[k], o = smooth(p.t * 3 - 1.4);
        // a name arrives with its piece. At a swap only the name goes and comes back: the swap beside it stays (a pin
        // that has faded out is hidden, and a hidden button loses its focus and the pointer that rests on it)
        pin.el.style.opacity = (words * (p.again ? 1 : o)).toFixed(3);
        if (p.again) p.tag.style.opacity = o.toFixed(3);
        const lead = leads[k];
        if (lead) {
          const a = labels.project(v.set(p.x, 0.02, Z + DEPTH / 2));
          lead.set(a.x, a.y + 3, a.x, a.y + ROWS[1] - 2, Number(pin.el.style.opacity) * 0.6);
        }
      });
    },
    dispose() {
      if (ctx.state.compare) delete ctx.state.compare.mystack;
      pieces.forEach((p) => { p.li.removeEventListener('pointerenter', p.over); p.li.removeEventListener('pointerleave', p.leave); });
      buttons.forEach((b) => { b.removeEventListener('click', onSwap); b.hidden = true; });
      window.removeEventListener('keydown', onEsc);
      later.forEach(([li, parent, next]) => parent.insertBefore(li, next && next.parentNode === parent ? next : null));
      pairsEl.open = false; pairsEl.style.bottom = ''; pairsEl.style.top = '';
      pins.forEach((p) => p.drop());
      pieces.forEach((p) => { p.tag.style.opacity = ''; });
      leads.forEach((l) => l && l.drop());
      lines.forEach((l) => (l.cord || l.arc).dispose());
      cast.forEach((c) => c.fig.dispose());
      pieces.forEach((p) => { if (p.glyph) { p.glyph.geometry.dispose(); p.glyph.material.dispose(); } });
      made.forEach((m) => { if (m.material) m.material.dispose(); m.removeFromParent(); });
      geo.dispose(); bigGeo.dispose(); tail.geo.dispose(); tail.seam.dispose(); bigTail.geo.dispose(); bigTail.seam.dispose(); shade.geometry.dispose();
      bench.forEach((m) => m.geometry.dispose());
      pieces.forEach((p) => { if (p.layer === 'you') p.mesh.geometry.dispose(); });
      base.dispose();
    },
  };
}
