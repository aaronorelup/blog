// The router idea (SPEC 2.9.3): a dark floor, one lamp, and under it one diagram in ink. The lamp moves from diagram
// to diagram as the page scrolls (or as the visitor picks), and the other two wait grey in the dark. A dot for you,
// a glass block for each agent. Talks is a plain line, dispatches carries a bead, reports is a pale line back.
// When the third lights, the faint dashed line to the worker is snipped.
import { Color, Group, Vector3 } from 'three';
import { clamp01, easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce, rove } from '../core/dom.js';
import { block, dot, drop, INK, LAMP, lampOn, ribbon, roundBox, setGlass, STOPS } from '../scene/bench.js';

const CX = [LAMP.first, 0, -LAMP.first];
const CZ = LAMP.z;
const BIG = 1.6;                  // the pieces of a diagram against their first size: they are read from across the room
const ink = new Color(INK), grey = new Color(LAMP.grey);
const LEAVES = 3;                 // a team or a router hands out to several: three of each are drawn
const HUB = { w: 0.86 * BIG, h: 0.56 * BIG };
const LEAF = { w: 0.62 * BIG, h: 0.44 * BIG };

export function create(ctx, el, sec) {
  const { rig, row, labels, studio, phone, reduced } = ctx;
  const items = $$('.ail-rt__shape', el);
  const list = $('.ail-rt__shapes', el);
  const more = $('.ail-rt__more', el);
  const group = new Group();
  ctx.scene.add(group);
  const hubGeo = roundBox(HUB.w, HUB.h, HUB.w, 0.14);
  const leafGeo = roundBox(LEAF.w, LEAF.h, LEAF.w, 0.11);
  const st = { lit: -1, chosen: -1, cut: 0, cutT: 0, time: 0, k: 0, spot: null };
  const v = new Vector3();

  // ---- each diagram from its edges: you on the left, the first one you talk to as the hub, the rest as leaves
  const shapes = items.map((li, i) => {
    const edges = li.dataset.edges.split(' ').map((e) => e.split(':'));        // "you:router:talks", one for each edge
    const ids = [...new Set(edges.flatMap(([a, b]) => [a, b]))];
    const hub = ids.find((id) => id !== 'you');
    const leafIds = ids.filter((id) => id !== 'you' && id !== hub);
    const c = new Vector3(CX[i], 0, CZ);
    const nodes = new Map();
    const you = dot(ctx, 0.2 * BIG);
    you.position.set(c.x - 2.35, 0.2 * BIG, c.z + 0.75);
    nodes.set('you', [{ mesh: you, at: you.position }]);
    const hubMesh = block(ctx, hubGeo, 'house', HUB.h);
    hubMesh.position.set(c.x + (leafIds.length ? -0.25 : 1.3), HUB.h / 2, c.z - (leafIds.length ? 0.35 : 0.2));
    group.add(hubMesh);
    nodes.set(hub, [{ mesh: hubMesh, at: hubMesh.position }]);
    // a glyph of the layer grammar on each block: the router's fork on a router, the harness loop on any other agent
    const mark = (m, name, size, y) => { const g = ctx.textures.glyphPlane(name, size, { tint: '#0C0D10' }); g.rotation.x = -Math.PI / 2; g.position.set(0, y + 0.004, 0); m.add(g); return g; };
    mark(hubMesh, hub === 'router' ? 'router' : 'harness', 0.5 * BIG, HUB.h / 2);
    for (const id of leafIds) {
      nodes.set(id, Array.from({ length: LEAVES }, (_, k) => {
        const m = block(ctx, leafGeo, 'house', LEAF.h);
        m.position.set(c.x + 2.1 + (k === 1 ? 0.3 : 0), LEAF.h / 2, c.z - 1.75 + k * 1.55);
        mark(m, 'harness', 0.38 * BIG, LEAF.h / 2);
        group.add(m);
        return { mesh: m, at: m.position };
      }));
    }
    // one ribbon per edge and per copy of a leaf. Reports run back beside their dispatch, pale
    const lines = edges.flatMap(([a, b, kind]) => {
      const out = [];
      for (const A of nodes.get(a)) for (const B of nodes.get(b)) {
        const r = ribbon(ctx, { kind: kind === 'reports' ? 'pale' : '', width: (kind === 'talks' ? 0.07 : 0.06) * BIG });
        r.a.copy(A.at); r.b.copy(B.at);
        if (kind === 'reports') { const side = v.subVectors(r.b, r.a).normalize(); r.a.add(new Vector3(-side.z, 0, side.x).multiplyScalar(0.2)); r.b.add(new Vector3(-side.z, 0, side.x).multiplyScalar(0.2)); }
        const bead = kind === 'dispatches' ? dot(ctx, 0.12 * BIG) : null;
        out.push({ r, kind, bead, phase: out.length * 0.37 });
      }
      return out;
    });
    const meshes = [...nodes.values()].flat().map((n) => n.mesh).filter((m) => m !== you);
    return { li, c, edges, hub, leafIds, nodes, lines, meshes, glow: 0, name: $('.ail-rt__name', li), you: nodes.get('you')[0], workers: leafIds.length ? nodes.get(leafIds[0]) : [] };
  });

  // ---- the line he wants gone (2.9.2), faint and dashed from you to a worker, and the snip that cuts it. It runs
  // to the nearest worker, in front of the router, so the cut and its mark lie in the open
  const last = shapes[shapes.length - 1];
  const target = last.workers[last.workers.length - 1];
  const cutA = ribbon(ctx, { kind: 'dash', width: 0.05 });
  const cutB = ribbon(ctx, { kind: 'dash', width: 0.05 });
  const snip = [ribbon(ctx, { width: 0.05 }), ribbon(ctx, { width: 0.05 })];
  const mid = new Vector3();
  if (target) {
    mid.lerpVectors(last.you.at, target.at, 0.5).setY(0);
    cutA.a.copy(last.you.at); cutA.b.copy(mid); cutB.a.copy(target.at); cutB.b.copy(mid);
    snip[0].a.set(mid.x - 0.2, 0, mid.z - 0.2); snip[0].b.set(mid.x + 0.2, 0, mid.z + 0.2);
    snip[1].a.set(mid.x - 0.2, 0, mid.z + 0.2); snip[1].b.set(mid.x + 0.2, 0, mid.z - 0.2);
  }

  function light(i, quiet = true) {
    if (i === st.lit) return;
    st.lit = i;
    items.forEach((li, k) => { li.classList.toggle('is-lit', k === i); $('.ail-rt__name', li).setAttribute('aria-pressed', String(k === i)); });
    more.classList.toggle('is-on', i === shapes.length - 1);
    if (i === shapes.length - 1) { st.cut = 0; st.cutT = 0; }
    if (!quiet) announce(`${shapes[i].name.textContent.trim()}. ${$('.ail-rt__limit', items[i]).textContent.trim()}`);
  }
  const onPick = (e) => { const b = e.target.closest('.ail-rt__name'); if (!b) return; st.chosen = items.indexOf(b.closest('.ail-rt__shape')); light(st.chosen, false); };
  list.addEventListener('click', onPick);
  const unrove = rove(list, '.ail-rt__name');
  // Escape steps back: every card this section opened closes
  const onEsc = (e) => { if (e.key === 'Escape' && sec === ctx.clock.current) $$('details[open]:not(.ail-ms__pairs)', el).forEach((d) => { d.open = false; }); };
  window.addEventListener('keydown', onEsc);

  const pins = phone ? [] : items.map((li, i) => labels.pin(li, () => v.set(CX[i] - 0.1, 0, CZ + 2.6), { ax: 0.5, ay: 0, dy: 6 }));
  pins.forEach((p) => { p.on = false; });
  const all = [...shapes.flatMap((s) => s.lines.map((l) => l.r)), cutA, cutB, ...snip];
  function hide() {
    group.visible = false;
    shapes.forEach((s) => { s.you.mesh.visible = false; s.lines.forEach((l) => { if (l.bead) l.bead.visible = false; }); });
    all.forEach((r) => { r.show = 0; r.update(); });
  }
  hide();
  // for the tests: where the lamp stands and which diagram it lights
  ctx.state.compare = { ...(ctx.state.compare || {}), router: { lamp: () => ({ lit: st.lit, x: st.spot == null ? null : +st.spot.toFixed(2), at: CX, dark: +studio.dark.toFixed(2), glow: +studio.glow.amount.toFixed(2) }) } };

  return {
    stops: [0.25, 0.5, 0.82],
    // (data-full: this section stands at the word cap, so the chrome's stamp chip drops its first word while it is on)
    enter() { group.visible = true; pins.forEach((p) => { p.on = true; }); document.documentElement.toggleAttribute('data-full', true); },
    leave() { hide(); pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; }); st.chosen = -1; st.spot = null; studio.dark = 0; document.documentElement.removeAttribute('data-full'); delete document.documentElement.dataset.chrome; },
    update(t, dt) {
      st.time += dt;
      const u = t;                                 // every stop below is a share of the section, whatever its length in screens
      const lit = st.chosen >= 0 ? st.chosen : u < 0.36 ? 0 : u < 0.62 ? 1 : 2;
      light(lit);
      // (the diagrams and the dark are gone before the five come back for the lamp board: the two never share the floor)
      // The dark and the lamp are on from the first step: my stack brought them in (W-1). The diagrams come up under it
      const out = 1 - smooth(span(u, 0.86, 0.94));
      const k = smooth(span(u, -0.02, 0.02)) * out;      // (half up as the section starts, whole in 27 px at 900: my stack's bench has just sunk, E-1)
      st.k = k;

      // camera: the floor from above. A phone follows the lit diagram. Then on to the lamp board
      if (phone) {
        v.set(CX[lit], 0, 0);
        const near = { pos: [v.x, 10.5, CZ + 10.5], look: [v.x + 0.1, 0.1, CZ - 0.1], fov: 24, fit: 6.6, cy: 0.42 };
        if (u < 0.9) rig.mix(STOPS.router, near, easeIO(span(u, 0, 0.14))); else rig.mix(near, STOPS.board, easeIO(span(u, 0.9, 1)));
      } else if (u < 0.88) rig.to(STOPS.router);
      else rig.mix(STOPS.router, STOPS.board, easeIO(span(u, 0.88, 1)));
      rig.yaw = 0.04; rig.pitch = 0.015;
      // the five stacks leave the floor to the diagrams: the idea is not any one company's. (My stack hands the floor
      // over empty. They come back for the lamp board.)
      for (const tw of row.towers) { tw.show = smooth(span(u, 0.94, 1)); tw.char.show = 0; }

      // the lamp: the room goes dark and one pool of light stands on the lit diagram. It follows the lit one at
      // 6 a second (reduced motion: it is there at once)
      st.spot = st.spot == null || reduced ? CX[lit] : st.spot + (CX[lit] - st.spot) * (1 - Math.exp(-LAMP.follow * dt));
      // the chrome and the words flip to paper on ink while the room is dark, as they do for the links at night: the
      // lamp's pool is then the one light in the frame, the lit diagram's name the one bright chip, and the rail shows
      lampOn(ctx, out, st.spot);

      // the diagrams: ink at full strength in the pool, the others grey in the dark. Beads run along each dispatch
      shapes.forEach((s, i) => {
        s.glow = reduced ? (i === lit ? 1 : 0) : s.glow + ((i === lit ? 1 : 0) - s.glow) * (1 - Math.exp(-LAMP.follow * dt));
        const on = s.glow;
        const draw = smooth(span(u, 0.02 + i * 0.03, 0.14 + i * 0.03));
        s.meshes.forEach((m) => {
          setGlass(m, { show: k, dim: (1 - on) * 0.08, lit: on * 0.5 });
          m.children.forEach((g) => { g.material.uniforms.uOpacity.value = k * (0.35 + 0.6 * on); g.visible = k > 0.01; });
        });
        s.you.mesh.visible = k > 0.01;
        s.you.mesh.material.uniforms.uShow.value = k;
        s.lines.forEach((l) => {
          l.r.draw = reduced ? 1 : draw;
          l.r.show = k * (0.5 + 0.5 * on);
          l.r.color.copy(grey).lerp(ink, on);
          l.r.update();
          if (l.bead) {
            const p = reduced ? 0.5 : ((st.time * 0.55 + l.phase) % 1);
            l.bead.position.lerpVectors(l.r.a, l.r.b, easeIO(p)).setY(0.11 * BIG);
            l.bead.visible = k * on > 0.5 && draw > 0.95;
          }
        });
      });

      // the cut: when the third lights, the dashed line shows, holds, then is snipped and pulls back from the cut. Its
      // two ends stay, with the gap and the mark of the cut between them: the line he no longer needs
      if (lit === shapes.length - 1) st.cutT += dt;
      const shown = lit === shapes.length - 1 ? k * last.glow : 0;
      const cut = reduced ? 1 : clamp01((st.cutT - 0.35) / 0.5);
      cutA.draw = 1 - cut * 0.4; cutB.draw = 1 - cut * 0.4;
      cutA.show = cutB.show = shown * 0.6;
      snip.forEach((r) => { r.show = shown * smooth(cut * 3); r.draw = 1; });
      [cutA, cutB, ...snip].forEach((r) => r.update());

      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
      el.style.setProperty('--rt-on', k.toFixed(3));
    },
    dispose() {
      if (ctx.state.compare) delete ctx.state.compare.router;
      list.removeEventListener('click', onPick);
      unrove(); window.removeEventListener('keydown', onEsc);
      pins.forEach((p) => p.drop());
      all.forEach((r) => r.dispose());
      shapes.forEach((s) => { drop(s.you.mesh); s.lines.forEach((l) => drop(l.bead)); });
      drop(group); hubGeo.dispose(); leafGeo.dispose();
      if (sec === ctx.clock.current) { document.documentElement.removeAttribute('data-full'); delete document.documentElement.dataset.chrome; }
    },
  };
}
