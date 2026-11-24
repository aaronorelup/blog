// Provider-agnostic design and billing (SPEC 2.9.4, 2.9.5), two sections in front of the row. "board": twenty
// lamps on a dark glass desk on the floor, one column under each whole stack, each the page's own lamp shape in paper white. "rail": a tank and a meter for each
// company on a rail, a bead that runs from the tank and switches to the meter when it runs dry. On the rail the
// scroll picks the company and the trend (no timer): a visitor's own pick holds for a tenth of a screen of scroll.
import { BufferGeometry, CylinderGeometry, ExtrudeGeometry, Group, InstancedMesh, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Shape, SphereGeometry, Vector3 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { owner, world } from '../worlds/index.js';
import { block, dot, drop, INK, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';

// The lamp desk: a low wedge of dark glass on the floor in front of the row, its face tilted up to the camera. Its
// middle stands DESK.z in front of the row, the face is DESK.deep from its far edge to its near one, DESK.lip high there
const DESK = { z: 9.6, deep: 5.2, tilt: (14 * Math.PI) / 180, lip: 0.1, pad: 0.8, inset: 0.12 };
const RZ = 8.6;                       // the billing rail stands this far in front of the row: from above, clear of the stacks' feet
const DARK = { glass: '#17181C', rim: '#5B606A', glow: '#17181C' };
const LABELS = 152;                   // CSS px the four row labels need at the desk's left
const TAN = Math.tan((24 * Math.PI) / 360);

// A wedge w wide: a flat foot, an upright back, and the tilted face from the back's top down to the near lip.
function wedge(w) {
  const run = DESK.deep * Math.cos(DESK.tilt), rise = DESK.deep * Math.sin(DESK.tilt);
  const side = new Shape();
  side.moveTo(-run / 2, 0); side.lineTo(run / 2, 0); side.lineTo(run / 2, DESK.lip); side.lineTo(-run / 2, DESK.lip + rise); side.lineTo(-run / 2, 0);
  return new ExtrudeGeometry(side, { depth: w, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(w / 2, 0, 0);
}
// A point on the desk's face, k 0 (far edge) to 1 (near edge), as [y, z]
const onDesk = (k) => [DESK.lip + DESK.deep * Math.sin(DESK.tilt) * (1 - k), DESK.z + DESK.deep * Math.cos(DESK.tilt) * (k - 0.5)];

function frame(ctx, el, sec, build) {
  const group = new Group();
  ctx.scene.add(group);
  const pins = [];
  const pin = (node, at, o) => { if (ctx.phone) return; const p = ctx.labels.pin(node, at, o); p.on = false; pins.push(p); };
  const api = build(group, pin);
  // Escape steps back: every card this section opened closes
  const onEsc = (e) => { if (e.key === 'Escape' && sec === ctx.clock.current) $$('details[open]:not(.ail-ms__pairs)', el).forEach((d) => { d.open = false; }); };
  window.addEventListener('keydown', onEsc);
  const hide = () => { group.visible = false; if (api.hide) api.hide(); pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; }); };
  hide();
  return {
    stops: api.stops,
    enter() { group.visible = true; pins.forEach((p) => { p.on = true; }); },
    leave() { hide(); if (api.leave) api.leave(); },
    update(t, dt, u) {
      const k = api.update(dt, u);
      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
      el.style.setProperty('--an-on', k.toFixed(3));
    },
    dispose() { window.removeEventListener('keydown', onEsc); if (api.dispose) api.dispose(); pins.forEach((p) => p.drop()); drop(group); },
  };
}

// ---- 2.9.4: the lamp desk
function board(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced } = ctx;
    const base = { ...STOPS.board };
    const mid = base.look[0];
    // each lamp is the cell's own button, pinned on the desk's face: the same shape the legend and the phone's table show
    const lamps = $$('.ail-agn__row', el).flatMap((tr, c) => $$('.ail-agn__cell', tr).map((td, r) => {
      const btn = $('.ail-fact', td), at = new Vector3();
      pin(btn, at, { ax: 0.5, ay: 0.5 });
      // a phone pins nothing (its lamps are the table in the sheet): there the scene prints the same shape on the desk
      const print = ctx.phone ? new Mesh(new PlaneGeometry(0.74, 0.74).rotateX(DESK.tilt - Math.PI / 2), ctx.mats.paper(ctx.textures.lamp(td.dataset.v), { side: 0, blended: true, opacity: 0 })) : null;
      if (print) { print.renderOrder = 6; group.add(print); }
      return { c, r, at, print, lamp: $('.ail-lampx', btn), on: 0 };
    }));
    const heads = $$('.ail-agn__q', el).map((th, r) => { const at = new Vector3(); pin(th, at, { ax: 1, ay: 0.5 }); return { r, at }; });
    const names = $$('.ail-agn__p', el).map((th, c) => { const at = new Vector3(); pin(th, at, { ax: 0.5, ay: 0, dy: 8 }); return { c, at }; });
    // Where a thing stands on the desk to be seen right under a stack: the desk is nearer the camera than the row,
    // so its columns stand closer together, a little more with every row toward the camera
    const eye = new Vector3(), fwd = new Vector3(), look = new Vector3();
    const squeeze = (y, z) => ((y - eye.y) * fwd.y + (z - eye.z) * fwd.z) / ((1.35 - eye.y) * fwd.y - eye.z * fwd.z);
    let slab = null, shade = null, wide = 0;
    function place() {
      const s = STOPS.board;
      look.set(...s.look); fwd.set(...s.pos).sub(look);
      const dist = Math.max(fwd.length(), s.fit / (2 * TAN * (window.innerWidth / window.innerHeight)));
      fwd.normalize(); eye.copy(look).addScaledVector(fwd, dist); fwd.negate();
      const [yFar, zFar] = onDesk(0), [, zNear] = onDesk(1);
      const half = (ROW_X[ROW_X.length - 1] - mid) * squeeze(yFar, zFar) + DESK.pad;      // as wide as its far row, and a margin
      if (Math.abs(half * 2 - wide) > 0.05) {
        wide = half * 2;
        drop(slab); drop(shade);
        slab = block(ctx, wedge(wide), DARK, DESK.lip + DESK.deep * Math.sin(DESK.tilt), { alpha: 0.9 });
        slab.position.set(mid, 0, DESK.z);
        shade = shadow(ctx, wide, DESK.deep, { opacity: 0.16, soft: 0.3 });
        shade.position.set(mid + 0.35, 0.004, DESK.z + 0.25);
        group.add(slab, shade);
      }
      const line = (r) => onDesk(DESK.inset + (1 - 2 * DESK.inset) * (r / Math.max(1, heads.length - 1)));
      lamps.forEach((l) => { const [y, z] = line(l.r); l.at.set(mid + (ROW_X[l.c] - mid) * squeeze(y, z), y + 0.02, z); if (l.print) l.print.position.copy(l.at); });
      heads.forEach((h) => { const [y, z] = line(h.r); h.at.set(mid - half - 0.25, y, z); });
      names.forEach((n) => n.at.set(mid + (ROW_X[n.c] - mid) * squeeze(DESK.lip, zNear), 0, zNear + 0.05));
    }
    // The camera's seat, from the window: the row labels start clear of the rail (96 px at 1440), the stacks end
    // 64 px inside the right edge, and stacks and labels sit as one centred block. A phone keeps the plain row
    function seat() {
      Object.assign(STOPS.board, base);
      if (ctx.phone) STOPS.board.cx = 0.5;
      else {
        const W = window.innerWidth, H = window.innerHeight;
        const left = Math.max(40, Math.min(96, W / 15)), right = Math.max(24, Math.min(64, W / 22.5));
        const room = Math.max(320, W - left - LABELS - right);
        const band = ROW_X[ROW_X.length - 1] - ROW_X[0] + 2.8;                // the five stacks and a little air
        const dist = Math.max(Math.hypot(base.pos[1] - base.look[1], base.pos[2] - base.look[2]), (band * H) / (2 * TAN * room));
        STOPS.board.fit = Math.max(base.fit, dist * 2 * TAN * (W / H));
        STOPS.board.cx = (left + LABELS + room / 2 + (mid * H) / (2 * TAN * dist)) / W;      // (the last term: where x = 0 stands)
      }
      place();
    }
    seat();
    window.addEventListener('resize', seat);
    return {
      stops: [0.42],
      update(dt, u) {
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, 0.6, 0.7)));
        if (u < 0.56) rig.to(STOPS.board); else rig.mix(STOPS.board, STOPS.rail, easeIO(span(u, 0.56, 0.7)));
        rig.yaw = 0.04; rig.pitch = 0.015;
        for (const tw of row.towers) tw.char.show = 0;
        setGlass(slab, { show: k });
        shade.material.opacity = 0.16 * k;
        // the lamps come on row by row, left to right
        lamps.forEach((l) => {
          const on = reduced ? 1 : smooth(span(u, 0.06 + l.r * 0.04 + l.c * 0.012, 0.16 + l.r * 0.04 + l.c * 0.012));
          if (Math.abs(on - l.on) > 0.004 || on === 1) { l.on = on; l.lamp.style.transform = on < 1 ? `scale(${(0.4 + 0.6 * on).toFixed(3)})` : ''; l.lamp.style.opacity = on < 1 ? on.toFixed(3) : ''; }
          if (l.print) { l.print.material.uniforms.uOpacity.value = on * k; l.print.visible = on * k > 0.01; }
        });
        return k;
      },
      dispose() { window.removeEventListener('resize', seat); Object.assign(STOPS.board, base); },
    };
  });
}

// ---- 2.9.5: the billing rail. Each company's cycle: the tank drains (what you bought), the switch, beads land in
// the tray one at a time (what you pay as you use), and a new month fills the one and clears the other
const CYCLE = 9, DRAIN = 4.2, SWITCH = 4.4, METER = 8, PILE = 8;
const TANK = { r: 0.46, h: 1.5, x: -0.62 }, TRAY = { w: 0.98, h: 0.1, d: 0.52, x: 0.76 }, BEAD = 0.1, RAIL = 0.12;
// where bead j lies in its tray, seen from the front: four, three on them, one on top. [x, y] from the tray's top middle
const HEAP = Array.from({ length: PILE }, (_, j) => { const [n, layer] = j < 4 ? [j - 1.5, 0] : j < 7 ? [j - 5, 1] : [0, 2]; return [n * BEAD * 2.1, BEAD * (0.95 + 1.73 * layer)]; });
function rail(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced } = ctx;
    const mid = STOPS.rail.look[0];
    const shellGeo = new CylinderGeometry(TANK.r, TANK.r, TANK.h, 32);
    const fillGeo = new CylinderGeometry(TANK.r - 0.07, TANK.r - 0.07, 1, 32).translate(0, 0.5, 0);
    const trayGeo = roundBox(TRAY.w, TRAY.h, TRAY.d, 0.08);
    const rows = $$('.ail-bill__row', el);
    const trends = $$('.ail-bill__trend', el);
    const dots = $$('.ail-bill__dot', el);
    const st = { active: 0, trend: 0, hold: null, holdT: null, u: 0, time: 0 };
    const S = sec.screens, FROM = 0.1, EACH = (S - 0.2) / rows.length, TREND = (S - 0.2) / Math.max(1, trends.length);
    const units = rows.map((tr, c) => {
      const id = tr.dataset.p;
      const shell = block(ctx, shellGeo, owner(id), TANK.h, { alpha: 0.4 });
      const fill = block(ctx, fillGeo, owner(id), 1);
      const tray = block(ctx, trayGeo, owner(id), TRAY.h, { alpha: 0.7 });
      group.add(shell, fill, tray);
      const bead = dot(ctx, 0.1, id);
      const pick = $('.ail-bill__pick', tr);
      // its dot stands on the rail between its tank and its tray. The card of the picked company hangs at the top
      // right (the stylesheet places it): it never lies over a stack or a mark
      const at = new Vector3();
      pin(pick, at, { ax: 0.5, ay: 1, dy: 3 });
      // on a phone the five picks are the five marks, each official file whole on a small plain tile (the stylesheet
      // draws the tile from --o). A company with no mark file keeps its colour
      const m = world(id).marks;
      if (ctx.phone && m.lid) pick.style.setProperty('--o', `${m.plate === 'ink' ? INK : '#FFF'} url(${m.lid}) center / auto ${m.clear === 'own' ? 26 : m.clear === 1 ? 22 : 16}px no-repeat`);
      return { id, x: ROW_X[c], c, tr, shell, fill, tray, bead, pick, at, phase: c * 1.7 };
    });
    // the beads of the five trays are one mesh, in ink: what is paid belongs to nobody yet
    // (the last five instances are the beads in the air)
    const pile = new InstancedMesh(new SphereGeometry(BEAD, 14, 10), new MeshBasicMaterial({ color: INK, transparent: true }), units.length * (PILE + 1));
    pile.renderOrder = 9; pile.frustumCulled = false;
    group.add(pile);
    const slot = new Object3D();
    // four hairlines on each tank, the weeks of a month: one set of lines for all five
    const marks = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.5 }));
    marks.renderOrder = 12;
    group.add(marks);
    let bar = null;
    // Tank and tray stand right under their stack as the camera sees it: the rail is nearer the camera than the row,
    // so its five places stand closer together
    function place() {
      const s = STOPS.rail, v = new Vector3(...s.pos).sub(new Vector3(...s.look));
      const dist = Math.max(v.length(), s.fit / (2 * TAN * (window.innerWidth / window.innerHeight)));
      v.normalize();
      const eye = new Vector3(...s.look).addScaledVector(v, dist);
      const squeeze = ((0.8 - eye.y) * -v.y + (RZ - eye.z) * -v.z) / ((1.35 - eye.y) * -v.y - eye.z * -v.z);
      const half = (ROW_X[ROW_X.length - 1] - mid) * squeeze + 1.5;
      drop(bar);
      bar = block(ctx, roundBox(half * 2, RAIL, 0.9, 0.06), 'house', RAIL);
      bar.position.set(mid, RAIL / 2, RZ);
      group.add(bar);
      const ticks = [];
      units.forEach((n) => {
        n.x = mid + (ROW_X[n.c] - mid) * squeeze;
        n.shell.position.set(n.x + TANK.x, RAIL + TANK.h / 2, RZ);
        n.fill.position.set(n.x + TANK.x, RAIL + 0.04, RZ);
        n.tray.position.set(n.x + TRAY.x, RAIL + TRAY.h / 2, RZ);
        n.at.set(n.x + (TANK.x + TANK.r + TRAY.x - TRAY.w / 2) / 2, RAIL, RZ + 0.45);
        for (let w = 1; w <= 4; w++) ticks.push(new Vector3(n.x + TANK.x - 0.2, RAIL + 0.04 + (TANK.h - 0.12) * (w / 4), RZ + TANK.r + 0.01), new Vector3(n.x + TANK.x + 0.2, RAIL + 0.04 + (TANK.h - 0.12) * (w / 4), RZ + TANK.r + 0.01));
      });
      marks.geometry.dispose();
      marks.geometry = new BufferGeometry().setFromPoints(ticks);
    }
    place();
    window.addEventListener('resize', place);
    function choose(c, quiet) {
      st.active = c;
      units.forEach((u, i) => { u.tr.classList.toggle('is-on', i === c); u.pick.setAttribute('aria-pressed', String(i === c)); });
      if (!quiet) announce($$('.ail-bill__cell .ail-fact', rows[c]).map((b) => b.textContent.trim()).join('. '));
    }
    function trend(i) {
      st.trend = i;
      trends.forEach((li, k) => li.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
    }
    choose(0, true); trend(0);
    const onPick = (e) => { const b = e.target.closest('.ail-bill__pick'); if (!b) return; st.hold = st.u; choose(units.findIndex((u) => u.pick === b), false); };
    const onDot = (e) => { st.holdT = st.u; trend(Number(e.currentTarget.dataset.i)); };
    el.addEventListener('click', onPick);
    // a click on a stack picks its company too (<main> lies over the canvas, so the click is heard on the window)
    const onStack = (e) => {
      if (sec !== ctx.clock.current || e.target.closest('a, button, summary, details, header, nav, dialog')) return;
      const hit = row.pick(e.clientX, e.clientY);
      if (hit) { st.hold = st.u; choose(hit.tower.index, false); }
    };
    window.addEventListener('click', onStack);
    $('.ail-bill__pager', el).hidden = false;
    dots.forEach((d) => d.addEventListener('click', onDot));
    const from = new Vector3(), to = new Vector3(), ctl = new Vector3();
    return {
      stops: units.map((_, c) => (FROM + EACH * (c + 0.5)) / S),          // reduced motion: one still for each company
      hide() { units.forEach((u) => { u.bead.visible = false; }); },
      leave() { units.forEach((u) => { u.tr.querySelector('details').open = false; }); st.hold = st.holdT = null; },
      update(dt, u) {
        st.u = u;
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, S - 0.14, S)));
        if (u < S - 0.2) rig.to(STOPS.rail); else rig.mix(STOPS.rail, rig.stops.row, easeIO(span(u, S - 0.2, S)));
        rig.yaw = 0.05; rig.pitch = 0.02;
        row.towers.forEach((tw) => { tw.char.show = 1 - k; });
        st.time += reduced ? 0 : dt;
        // the scroll picks the company and the trend, each for its share of the section. A pick by hand holds until
        // the scroll has moved a tenth of a screen
        if (st.hold != null && Math.abs(u - st.hold) > 0.1) st.hold = null;
        if (st.holdT != null && Math.abs(u - st.holdT) > 0.1) st.holdT = null;
        const want = Math.max(0, Math.min(units.length - 1, Math.floor((u - FROM) / EACH)));
        if (st.hold == null && want !== st.active) choose(want, true);
        const wantT = Math.max(0, Math.min(trends.length - 1, Math.floor((u - FROM) / TREND)));
        if (st.holdT == null && wantT !== st.trend) trend(wantT);
        setGlass(bar, { show: k });
        marks.material.opacity = 0.5 * k; marks.visible = k > 0.01;
        pile.material.opacity = k; pile.visible = k > 0.01;
        units.forEach((n, c) => {
          // reduced motion: every tank half full, three beads in every tray, nothing in the air
          const p = reduced ? DRAIN / 2 : (st.time + n.phase) % CYCLE;
          const level = p < DRAIN ? 1 - p / DRAIN : p < METER ? 0 : (p - METER) / (CYCLE - METER);
          const metered = p >= SWITCH && p < METER;
          const paid = reduced ? 3 : metered ? ((p - SWITCH) / (METER - SWITCH)) * PILE : 0;      // beads landed, and how far the next one is
          const lit = c === st.active ? 0.3 : 0;
          const dim = c === st.active ? 0 : 0.35;
          setGlass(n.shell, { show: k, lit, dim });
          setGlass(n.fill, { show: k * (level > 0.01 ? 1 : 0), dim });
          n.fill.scale.set(1, Math.max(0.001, level * (TANK.h - 0.12)), 1);
          setGlass(n.tray, { show: k, lit: lit + (metered ? 0.25 : 0), dim });
          // the pile: a heap that grows bead by bead. The new month takes it away with the tank's first quarter
          const gone = p >= METER ? Math.min(1, (p - METER) / ((CYCLE - METER) * 0.25)) : 0;
          for (let j = 0; j < PILE; j++) {
            const there = p >= METER ? 1 - gone : j < Math.floor(paid) ? 1 : 0;
            slot.position.set(n.x + TRAY.x + HEAP[j][0], RAIL + TRAY.h + HEAP[j][1], RZ);
            slot.scale.setScalar(there > 0.01 ? there : 0.0001);
            slot.updateMatrix();
            pile.setMatrixAt(c * PILE + j, slot.matrix);
          }
          // the bead in the air. While the tank holds, one of the company's glass runs from the tank to the foot of the
          // stack. Once it is dry, an ink one comes from the foot of the stack to its place in the tray
          const next = Math.min(PILE - 1, Math.floor(paid));
          if (metered) { from.set(ROW_X[c], 0.12, 1.3); to.set(n.x + TRAY.x + HEAP[next][0], RAIL + TRAY.h + HEAP[next][1], RZ); }
          else { from.set(n.x + TANK.x, RAIL + 0.04 + (TANK.h - 0.12) * level + 0.06, RZ); to.set(ROW_X[c], 0.12, 1.3); }
          ctl.lerpVectors(from, to, 0.5).setY(Math.max(from.y, to.y, 0.6) + 0.7);
          const b = metered ? paid % 1 : (st.time * 1.1 + c * 0.3) % 1;
          const a = 1 - b;
          slot.position.set(a * a * from.x + 2 * a * b * ctl.x + b * b * to.x, a * a * from.y + 2 * a * b * ctl.y + b * b * to.y, a * a * from.z + 2 * a * b * ctl.z + b * b * to.z);
          n.bead.position.copy(slot.position);
          n.bead.visible = k > 0.5 && !reduced && !metered && level > 0.02;
          slot.scale.setScalar(metered && !reduced ? 1 : 0.0001);
          slot.updateMatrix();
          pile.setMatrixAt(units.length * PILE + c, slot.matrix);
        });
        pile.instanceMatrix.needsUpdate = true;
        return k;
      },
      dispose() { el.removeEventListener('click', onPick); window.removeEventListener('click', onStack); window.removeEventListener('resize', place); dots.forEach((d) => d.removeEventListener('click', onDot)); units.forEach((u) => { drop(u.bead); u.pick.style.removeProperty('--o'); }); },
    };
  });
}

export function create(ctx, el, sec) {
  return el.dataset.kind === 'rail' ? rail(ctx, el, sec) : board(ctx, el, sec);
}
