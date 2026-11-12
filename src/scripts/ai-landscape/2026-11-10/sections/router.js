// The router idea (SPEC 2.9.3): three small diagrams in ink on the floor, lit one at a time as the page scrolls
// (or as the visitor picks). A dot for you, a glass block for each agent. Talks is a plain line, dispatches carries
// a bead, reports is a pale line back. When the third lights, the faint dashed line to the worker is snipped.
import { Group, Vector3 } from 'three';
import { clamp01, easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce, rove } from '../core/dom.js';
import { block, dot, drop, INK, ribbon, roundBox, setGlass, STOPS } from '../scene/bench.js';

const CX = [-6.6, 0, 6.6];
const CZ = 5.5;
const LEAVES = 3;                 // a team or a router hands out to several: three of each are drawn
const HUB = { w: 0.86, h: 0.56 };
const LEAF = { w: 0.62, h: 0.44 };

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced } = ctx;
  const items = $$('.ail-rt__shape', el);
  const list = $('.ail-rt__shapes', el);
  const more = $('.ail-rt__more', el);
  const group = new Group();
  ctx.scene.add(group);
  const hubGeo = roundBox(HUB.w, HUB.h, HUB.w, 0.1);
  const leafGeo = roundBox(LEAF.w, LEAF.h, LEAF.w, 0.08);
  const st = { lit: -1, chosen: -1, cut: 0, cutT: 0, time: 0, k: 0 };
  const v = new Vector3();

  // ---- each diagram from its edges: you on the left, the first one you talk to as the hub, the rest as leaves
  const shapes = items.map((li, i) => {
    const edges = JSON.parse(li.dataset.edges);
    const ids = [...new Set(edges.flatMap(([a, b]) => [a, b]))];
    const hub = ids.find((id) => id !== 'you');
    const leafIds = ids.filter((id) => id !== 'you' && id !== hub);
    const c = new Vector3(CX[i], 0, CZ);
    const nodes = new Map();
    const you = dot(ctx, 0.2);
    you.position.set(c.x - 2.1, 0.2, c.z + 0.75);
    nodes.set('you', [{ mesh: you, at: you.position }]);
    const hubMesh = block(ctx, hubGeo, 'house', HUB.h);
    hubMesh.position.set(c.x + (leafIds.length ? -0.2 : 1.3), HUB.h / 2, c.z - (leafIds.length ? 0.35 : 0.2));
    group.add(hubMesh);
    nodes.set(hub, [{ mesh: hubMesh, at: hubMesh.position }]);
    // a glyph of the layer grammar on each block: the router's fork on a router, the harness loop on any other agent
    const mark = (m, name, size, y) => { const g = ctx.textures.glyphPlane(name, size, { tint: '#0C0D10' }); g.rotation.x = -Math.PI / 2; g.position.set(0, y + 0.004, 0); m.add(g); return g; };
    mark(hubMesh, hub === 'router' ? 'router' : 'harness', 0.5, HUB.h / 2);
    for (const id of leafIds) {
      nodes.set(id, Array.from({ length: LEAVES }, (_, k) => {
        const m = block(ctx, leafGeo, 'house', LEAF.h);
        m.position.set(c.x + 1.95 + (k === 1 ? 0.25 : 0), LEAF.h / 2, c.z - 1.55 + k * 1.35);
        mark(m, 'harness', 0.38, LEAF.h / 2);
        group.add(m);
        return { mesh: m, at: m.position };
      }));
    }
    // one ribbon per edge and per copy of a leaf. Reports run back beside their dispatch, pale
    const lines = edges.flatMap(([a, b, kind]) => {
      const out = [];
      for (const A of nodes.get(a)) for (const B of nodes.get(b)) {
        const r = ribbon(ctx, { kind: kind === 'reports' ? 'pale' : '', width: kind === 'talks' ? 0.07 : 0.06 });
        r.a.copy(A.at); r.b.copy(B.at);
        if (kind === 'reports') { const side = v.subVectors(r.b, r.a).normalize(); r.a.add(new Vector3(-side.z, 0, side.x).multiplyScalar(0.16)); r.b.add(new Vector3(-side.z, 0, side.x).multiplyScalar(0.16)); }
        const bead = kind === 'dispatches' ? dot(ctx, 0.12) : null;
        out.push({ r, kind, bead, phase: out.length * 0.37 });
      }
      return out;
    });
    const meshes = [...nodes.values()].flat().map((n) => n.mesh).filter((m) => m !== you);
    return { li, c, edges, hub, leafIds, nodes, lines, meshes, name: $('.ail-rt__name', li), you: nodes.get('you')[0], workers: leafIds.length ? nodes.get(leafIds[0]) : [] };
  });

  // ---- the line he wants gone (2.9.2), faint and dashed from you to a worker, and the snip that cuts it
  const last = shapes[shapes.length - 1];
  const target = last.workers[1] || last.workers[0];
  const cutA = ribbon(ctx, { kind: 'dash', width: 0.04 });
  const cutB = ribbon(ctx, { kind: 'dash', width: 0.04 });
  const snip = [ribbon(ctx, { width: 0.035 }), ribbon(ctx, { width: 0.035 })];
  const mid = new Vector3();
  if (target) {
    mid.lerpVectors(last.you.at, target.at, 0.5).setY(0);
    cutA.a.copy(last.you.at); cutA.b.copy(mid); cutB.a.copy(target.at); cutB.b.copy(mid);
    snip[0].a.set(mid.x - 0.16, 0, mid.z - 0.16); snip[0].b.set(mid.x + 0.16, 0, mid.z + 0.16);
    snip[1].a.set(mid.x - 0.16, 0, mid.z + 0.16); snip[1].b.set(mid.x + 0.16, 0, mid.z - 0.16);
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

  const pins = phone ? [] : items.map((li, i) => labels.pin(li, () => v.set(CX[i] - 0.3, 0, CZ + 2.25), { ax: 0.5, ay: 0, dy: 6 }));
  pins.forEach((p) => { p.on = false; });
  const all = [...shapes.flatMap((s) => s.lines.map((l) => l.r)), cutA, cutB, ...snip];
  function hide() {
    group.visible = false;
    shapes.forEach((s) => { s.you.mesh.visible = false; s.lines.forEach((l) => { if (l.bead) l.bead.visible = false; }); });
    all.forEach((r) => { r.show = 0; r.update(); });
  }
  hide();

  return {
    stops: [0.25, 0.5, 0.82],
    enter() { group.visible = true; pins.forEach((p) => { p.on = true; }); },
    leave() { hide(); pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; }); st.chosen = -1; },
    update(t, dt, u) {
      st.time += dt;
      const lit = st.chosen >= 0 ? st.chosen : u < 0.36 ? 0 : u < 0.62 ? 1 : 2;
      light(lit);
      const k = smooth(span(u, 0, 0.16)) * (1 - smooth(span(u, 0.88, 1)));
      st.k = k;

      // camera: the floor from above. A phone follows the lit diagram. Then on to the lamp board
      if (phone) {
        v.set(CX[lit], 0, 0);
        const near = { pos: [v.x, 10.5, CZ + 10.5], look: [v.x + 0.1, 0.1, CZ - 0.1], fov: 24, fit: 6.6, cy: 0.42 };
        if (u < 0.9) rig.mix(STOPS.router, near, easeIO(span(u, 0, 0.14))); else rig.mix(near, STOPS.board, easeIO(span(u, 0.9, 1)));
      } else if (u < 0.88) rig.to(STOPS.router);
      else rig.mix(STOPS.router, STOPS.board, easeIO(span(u, 0.88, 1)));
      rig.yaw = 0.04; rig.pitch = 0.015;
      // the five stacks leave the floor to the diagrams: the idea is not any one company's
      for (const tw of row.towers) { tw.show = 1 - k; tw.char.show = 0; }

      // the diagrams: ink at full strength for the lit one, the others faint. Beads run along each dispatch
      shapes.forEach((s, i) => {
        const on = i === lit ? 1 : 0.22;
        const draw = smooth(span(u, 0.02 + i * 0.03, 0.14 + i * 0.03));
        s.meshes.forEach((m) => {
          setGlass(m, { show: k, dim: i === lit ? 0 : 0.55, lit: i === lit ? 0.12 : 0 });
          m.children.forEach((g) => { g.material.uniforms.uOpacity.value = k * (i === lit ? 0.9 : 0.3); g.visible = k > 0.01; });
        });
        s.you.mesh.visible = k > 0.01;
        s.you.mesh.material.uniforms.uShow.value = k;
        s.lines.forEach((l) => {
          l.r.draw = reduced ? 1 : draw;
          l.r.show = k * on;
          l.r.update();
          if (l.bead) {
            const p = reduced ? 0.5 : ((st.time * 0.55 + l.phase) % 1);
            l.bead.position.lerpVectors(l.r.a, l.r.b, easeIO(p)).setY(0.11);
            l.bead.visible = k * on > 0.5 && draw > 0.95;
          }
        });
      });

      // the cut: when the third lights, the dashed line shows, holds, then is snipped and pulls back to both ends
      if (lit === shapes.length - 1) st.cutT += dt;
      const shown = lit === shapes.length - 1 ? k : 0;
      const cut = reduced ? 1 : clamp01((st.cutT - 0.35) / 0.5);
      cutA.draw = 1 - cut; cutB.draw = 1 - cut;
      cutA.show = cutB.show = shown * 0.5 * (cutA.draw > 0.01 ? 1 : 0);
      snip.forEach((r) => { r.show = shown * (reduced ? 0 : smooth(cut * 3) * (1 - smooth((st.cutT - 1.6) / 0.5))); r.draw = 1; });
      [cutA, cutB, ...snip].forEach((r) => r.update());

      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
      el.style.setProperty('--rt-on', k.toFixed(3));
    },
    dispose() {
      list.removeEventListener('click', onPick);
      unrove(); window.removeEventListener('keydown', onEsc);
      pins.forEach((p) => p.drop());
      all.forEach((r) => r.dispose());
      shapes.forEach((s) => { drop(s.you.mesh); s.lines.forEach((l) => drop(l.bead)); });
      drop(group); hubGeo.dispose(); leafGeo.dispose();
    },
  };
}
