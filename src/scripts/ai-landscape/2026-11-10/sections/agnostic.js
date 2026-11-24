// Provider-agnostic design and billing (SPEC 2.9.4, 2.9.5), two sections on the floor in front of the row, seen from
// above so the five stacks stay whole. "board": twenty lamps on a low desk, one column under each stack, each the
// page's own lamp shape in paper white on ink. "rail": a tank and a tray for each company, and beads that land in the
// tray once the tank is dry. The scroll picks the company and the trend (no timer). Both are seated from the window
// (seat.js frameIn): the whole picture stands between the words above it and the words under it, at any size.
import { BufferGeometry, CylinderGeometry, ExtrudeGeometry, Group, InstancedMesh, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Shape, SphereGeometry, Vector3 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { frameIn } from '../scene/seat.js';
import { BAY, LID_TOP } from '../scene/set.js';
import { owner, world } from '../worlds/index.js';
import { block, dot, drop, INK, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';

// The lamp desk: a low wedge of house glass on the floor in front of the row, its face an ink inlay tilted up to the
// camera. Its middle stands DESK.z in front of the row, the face is DESK.deep from its far edge to its near one
const DESK = { z: 9.6, deep: 5.2, tilt: (14 * Math.PI) / 180, lip: 0.1, pad: 0.8, inset: 0.12, rim: 0.16, ink: '#101114' };
const RZ = 8.6;                       // the billing rail stands this far in front of the row: from above, clear of the stacks' feet
const DARK = { glass: '#17181C', rim: '#5B606A', glow: '#17181C' };
const TAN = Math.tan((24 * Math.PI) / 360);
const PX_MIN = 36;                    // a window that would draw a unit smaller than this gives up the lid plates (a mark is whole or absent) and seats again
const BASE = { board: { ...STOPS.board }, rail: { ...STOPS.rail } };
const bare = { board: false, rail: false };      // the lid plates are away and the boards stand low
const edges = () => { const W = window.innerWidth; return [Math.max(40, Math.min(96, W / 15)), W - Math.max(24, Math.min(64, W / 22.5))]; };      // clear of the rail of dots, and of the right edge
// What bounds the five stacks: their lid plates (or, bare, the low boards) and their feet. (A board's paper may pass under a
// word's ground: a mark may not)
const stacks = (row, low) => [...ROW_X.map((x, c) => [x, row.towers[c].height + (low ? BAY.low + 0.3 : LID_TOP + 0.15), 0]), [ROW_X[0] - 1.4, 0, 1.2], [ROW_X[ROW_X.length - 1] + 1.4, 0.4, 1.2]];
// Where the camera of a stop stands in this window, and how much closer together things `z` in front of the row at
// height y must stand to be seen right under the stacks
function under(stop) {
  const look = new Vector3(...stop.look), fwd = new Vector3(...stop.pos).sub(look);
  const dist = Math.max(fwd.length(), stop.fit / (2 * TAN * (window.innerWidth / window.innerHeight)));
  fwd.normalize();
  const eye = look.addScaledVector(fwd, dist);
  fwd.negate();
  return (y, z) => ((y - eye.y) * fwd.y + (z - eye.z) * fwd.z) / ((1.35 - eye.y) * fwd.y - eye.z * fwd.z);
}

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
    const { rig, row, reduced, studio } = ctx;
    const mid = BASE.board.look[0];
    const claim = $('.ail-agn__claim', el), key = $('.ail-agn__key', el), more = $('.ail-agn__more', el);
    // each lamp is the cell's own button, pinned on the desk's face: the same shape the legend and the phone's table show
    const lamps = $$('.ail-agn__row', el).flatMap((tr, c) => $$('.ail-agn__cell', tr).map((td, r) => {
      const btn = $('.ail-fact', td), at = new Vector3();
      pin(btn, at, { ax: 0.5, ay: 0.5 });
      // a phone pins nothing (its lamps are the table in the sheet): there the scene prints the same shape on the desk
      const print = ctx.phone ? new Mesh(new PlaneGeometry(0.74, 0.74).rotateX(DESK.tilt - Math.PI / 2), ctx.mats.paper(ctx.textures.lamp(td.dataset.v), { side: 0, blended: true, opacity: 0 })) : null;
      if (print) { print.renderOrder = 6; group.add(print); }
      return { c, r, at, print, lamp: $('.ail-lampx', btn), on: 0 };
    }));
    const heads = $$('.ail-agn__q', el).map((th, r) => { const at = new Vector3(); pin(th, at, { ax: 1, ay: 0.5 }); return { r, at, th }; });
    const names = $$('.ail-agn__p', el).map((th, c) => { const at = new Vector3(); pin(th, at, { ax: 0.5, ay: 0, dy: 8 }); return { c, at, th }; });
    let slab = null, face = null, shade = null, wide = 0, half = 0;
    // The desk under this window's camera: as wide as its far row and a margin, each column right under its stack
    function place() {
      const squeeze = under(STOPS.board);
      const [yFar, zFar] = onDesk(0), [, zNear] = onDesk(1), [yMid, zMid] = onDesk(0.5);
      half = (ROW_X[ROW_X.length - 1] - mid) * squeeze(yFar, zFar) + DESK.pad;
      if (Math.abs(half * 2 - wide) > 0.05) {
        wide = half * 2;
        drop(slab); drop(face); drop(shade);
        slab = block(ctx, wedge(wide), DARK, DESK.lip + DESK.deep * Math.sin(DESK.tilt), { alpha: 0.9 });
        slab.position.set(mid, 0, DESK.z);
        face = new Mesh(new PlaneGeometry(wide - 2 * DESK.rim, DESK.deep - 2 * DESK.rim).rotateX(DESK.tilt - Math.PI / 2), ctx.mats.paper(null, { side: 0, plain: true, tint: DESK.ink, blended: true, opacity: 0 }));
        face.position.set(mid, yMid + 0.012, zMid); face.renderOrder = 5;
        shade = shadow(ctx, wide, DESK.deep, { opacity: 0.16, soft: 0.3 });
        shade.position.set(mid + 0.35, 0.004, DESK.z + 0.25);
        group.add(slab, face, shade);
      }
      const line = (r) => onDesk(DESK.inset + (1 - 2 * DESK.inset) * (r / Math.max(1, heads.length - 1)));
      lamps.forEach((l) => { const [y, z] = line(l.r); l.at.set(mid + (ROW_X[l.c] - mid) * squeeze(y, z), y + 0.03, z); if (l.print) l.print.position.copy(l.at); });
      heads.forEach((h) => { const [y, z] = line(h.r); h.at.set(mid - half - 0.25, y, z); });
      names.forEach((n) => n.at.set(mid + (ROW_X[n.c] - mid) * squeeze(DESK.lip, zNear), 0, zNear + 0.05));
    }
    // The camera's seat, from the window: stacks, desk, row labels and names stand as one block between the claim
    // above and the key under it. Too short a window for that at 36 px a unit: the lid plates leave. A phone keeps the plain row
    function seat() {
      Object.assign(STOPS.board, BASE.board);
      bare.board = false;
      if (ctx.phone) { STOPS.board.cx = 0.5; place(); return; }
      const [l, r] = edges();
      const box = { l, r, t: claim.getBoundingClientRect().bottom + 14, b: Math.min(key.getBoundingClientRect().top, more.getBoundingClientRect().top) - 10 };
      const label = Math.max(...heads.map((h) => h.th.offsetWidth)) + 4, name = names[0].th.offsetHeight + 12;
      for (const low of [false, true]) {
        bare.board = low;
        let px = 0;
        for (let i = 0; i < 3; i++) {
          place();
          px = frameIn(STOPS.board, BASE.board, [...stacks(row, low), ...heads.map((h) => [h.at.x, h.at.y, h.at.z, label, 16, 0, 16]),
            ...names.map((n) => [n.at.x, n.at.y, n.at.z, 44, 0, 44, name]), [mid + half, DESK.lip, onDesk(1)[1], 0, 0, 8, 8]], box);
        }
        place();
        if (px >= PX_MIN) break;
      }
      seatRail(ctx);
    }
    seat();
    window.addEventListener('resize', seat);
    // for the tests: how far each column of lamps stands from its stack on the screen (px), how far under the stacks'
    // feet the desk begins (px), and whether the lid plates are away
    const px = (x, y, z) => ctx.labels.project(new Vector3(x, y, z));
    ctx.state.compare = { ...(ctx.state.compare || {}), desk: () => ({
      low: bare.board, on: +slab.material.uniforms.uShow.value.toFixed(2),
      off: ROW_X.map((x, c) => Math.max(...lamps.filter((l) => l.c === c).map((l) => Math.abs(ctx.labels.project(l.at).x - px(x, 1.35, 0).x)))),
      under: px(mid, onDesk(0)[0], onDesk(0)[1]).y - px(ROW_X[2], 0, 1.2).y,
      mid: [lamps[0], lamps[1], lamps[4], lamps[5]].map((l) => ctx.labels.project(l.at)).reduce((m, p) => [m[0] + p.x / 4, m[1] + p.y / 4], [0, 0]),
    }) };
    return {
      stops: [0.42],
      update(dt, u) {
        // the desk leaves before the camera moves on to the rail, so no label rides the move
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, 0.5, 0.58)));
        if (u < 0.58) rig.to(STOPS.board); else rig.mix(STOPS.board, STOPS.rail, easeIO(span(u, 0.58, 0.7)));
        rig.yaw = 0.04; rig.pitch = 0.015;
        const low = u < 0.64 ? bare.board : bare.rail;
        row.towers.forEach((tw, c) => { tw.char.show = 0; if (low) { tw.lid.show = 0; studio.bays[c].low = true; } });
        setGlass(slab, { show: k });
        face.material.uniforms.uOpacity.value = k; face.visible = k > 0.01;
        shade.material.opacity = 0.16 * k;
        // the lamps come on row by row, left to right
        lamps.forEach((l) => {
          const on = reduced ? 1 : smooth(span(u, 0.06 + l.r * 0.04 + l.c * 0.012, 0.16 + l.r * 0.04 + l.c * 0.012));
          if (Math.abs(on - l.on) > 0.004 || on === 1) { l.on = on; l.lamp.style.transform = on < 1 ? `scale(${(0.4 + 0.6 * on).toFixed(3)})` : ''; l.lamp.style.opacity = on < 1 ? on.toFixed(3) : ''; }
          if (l.print) { l.print.material.uniforms.uOpacity.value = on * k; l.print.visible = on * k > 0.01; }
        });
        return k;
      },
      dispose() { window.removeEventListener('resize', seat); Object.assign(STOPS.board, BASE.board); if (ctx.state.compare) delete ctx.state.compare.desk; },
    };
  });
}

// ---- 2.9.5: the billing rail. One cycle, the same for every company and in step (the page's data gives all five a
// plan, pay per use and a rule at the limit, and no amounts: a frame in which one tray held more than another would
// compare what the data does not). The tank drains (what you bought), the switch, beads land in the tray one at a
// time (what you pay as you use), and a new month fills the one and clears the other
const CYCLE = 9, DRAIN = 4.2, SWITCH = 4.4, METER = 8, PILE = 8;
const TANK = { r: 0.46, h: 1.5, x: -0.62 }, TRAY = { w: 0.98, h: 0.1, d: 0.52, x: 0.76 }, BEAD = 0.1, RAIL = 0.12;
// The rail under this window's camera: how much closer its five places stand than the stacks, and its half length.
// (A phone's camera moves in on one company at a time, from straight in front: there each place stands before its stack)
const railAt = (phone) => { const k = phone ? 1 : under(STOPS.rail)(0.8, RZ); return [k, (ROW_X[ROW_X.length - 1] - BASE.rail.look[0]) * k + 1.5]; };
const NEAR = { ...BASE.rail, fit: 9.6, cy: 0.4 };      // a phone's stop on the picked company: its stack, its tank and its tray, the neighbours at the frame's edges
// Its camera's seat, from the window: stacks, tanks and rail stand as one block under the claim and the picked
// company's card (it hangs 200 px down from the claim's top: the stylesheet) and over the tallest trend sentence
function seatRail(ctx) {
  const el = document.getElementById('billing');
  Object.assign(STOPS.rail, BASE.rail);
  bare.rail = false;
  if (ctx.phone || !el) return;
  const mid = BASE.rail.look[0], [l, r] = edges();
  const claim = $('.ail-bill__claim', el).getBoundingClientRect(), list = $('.ail-bill__trends', el);
  const tall = Math.max(...$$('.ail-bill__trend', el).map((li) => { const on = li.classList.contains('is-on'); if (!on) li.style.display = 'block'; const h = li.offsetHeight; if (!on) li.style.display = ''; return h; }));
  const b = list.getBoundingClientRect().bottom - tall - 12;
  // two ways to stand: under the card, as wide as the window, or left of the card and as high as the claim lets it.
  // The larger picture wins (a laptop's short window takes the second)
  const boxes = [{ l, r, t: Math.max(claim.bottom, claim.top + 200) + 12, b, fy: 1 }, { l, r: window.innerWidth - claim.left - Math.min(window.innerWidth * 0.27, 330) - 16, t: claim.bottom + 12, b, fy: 0.5 }];
  const stand = (box, low) => {
    let px = 0;
    for (let i = 0; i < 3; i++) {
      const [k, half] = railAt(false);
      px = frameIn(STOPS.rail, BASE.rail, [...stacks(ctx.row, low), [mid - half, 0, RZ + 0.45, 6, 0, 0, 8], [mid + half, 0, RZ + 0.45, 0, 0, 6, 8],
        ...ROW_X.map((x) => [mid + (x - mid) * k + TANK.x, RAIL + TANK.h, RZ])], box, box.fy);
    }
    return px;
  };
  for (const low of [false, true]) {
    bare.rail = low;
    const px = boxes.map((box) => { Object.assign(STOPS.rail, BASE.rail); return stand(box, low); });
    Object.assign(STOPS.rail, BASE.rail);
    if (stand(boxes[px[1] > px[0] * 1.02 ? 1 : 0], low) >= PX_MIN) break;
  }
}
// where bead j lies in its tray, seen from the front: four, three on them, one on top. [x, y] from the tray's top middle
const HEAP = Array.from({ length: PILE }, (_, j) => { const [n, layer] = j < 4 ? [j - 1.5, 0] : j < 7 ? [j - 5, 1] : [0, 2]; return [n * BEAD * 2.1, BEAD * (0.95 + 1.73 * layer)]; });
function rail(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced, studio } = ctx;
    const mid = BASE.rail.look[0];
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
      return { id, x: ROW_X[c], c, tr, shell, fill, tray, bead, pick, at };
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
      seatRail(ctx);
      const [squeeze, half] = railAt(ctx.phone);
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
    // for the tests: each company's tank level and the beads in its tray this frame, and how far under its stack's
    // foot its tank's top stands on the screen (px)
    ctx.state.compare = { ...(ctx.state.compare || {}), rail: () => ({
      low: bare.rail, state: units.map((n) => [n.level, n.beads]),
      under: units.map((n) => ctx.labels.project(from.set(n.x + TANK.x, RAIL + TANK.h, RZ)).y - ctx.labels.project(to.set(ROW_X[n.c], 0, 1.2)).y),
    }) };
    return {
      stops: units.map((_, c) => (FROM + EACH * (c + 0.5)) / S),          // reduced motion: one still for each company
      hide() { units.forEach((u) => { u.bead.visible = false; }); },
      leave() { units.forEach((u) => { u.tr.querySelector('details').open = false; }); st.hold = st.holdT = null; },
      update(dt, u) {
        st.u = u;
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, S - 0.14, S)));
        if (ctx.phone) { const x = units[st.active].x; NEAR.pos = [x, BASE.rail.pos[1], BASE.rail.pos[2]]; NEAR.look = [x, BASE.rail.look[1] + 0.9, BASE.rail.look[2]]; }
        if (u >= S - 0.2) rig.mix(ctx.phone ? NEAR : STOPS.rail, rig.stops.row, easeIO(span(u, S - 0.2, S)));
        else if (ctx.phone) rig.mix(STOPS.rail, NEAR, easeIO(span(u, 0.04, 0.14)));
        else rig.to(STOPS.rail);
        rig.yaw = 0.05; rig.pitch = 0.02;
        const low = bare.rail && u < S - 0.1;
        row.towers.forEach((tw, c) => { tw.char.show = 1 - k; if (low) { tw.lid.show = 0; studio.bays[c].low = true; } });
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
          const p = reduced ? DRAIN / 2 : st.time % CYCLE;
          const level = p < DRAIN ? 1 - p / DRAIN : p < METER ? 0 : (p - METER) / (CYCLE - METER);
          const metered = p >= SWITCH && p < METER;
          n.level = +level.toFixed(3); n.beads = reduced ? 3 : p >= METER ? 0 : metered ? Math.floor(((p - SWITCH) / (METER - SWITCH)) * PILE) : 0;
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
      dispose() { el.removeEventListener('click', onPick); window.removeEventListener('click', onStack); window.removeEventListener('resize', place); Object.assign(STOPS.rail, BASE.rail); if (ctx.state.compare) delete ctx.state.compare.rail; dots.forEach((d) => d.removeEventListener('click', onDot)); units.forEach((u) => { drop(u.bead); u.pick.style.removeProperty('--o'); }); },
    };
  });
}

export function create(ctx, el, sec) {
  return el.dataset.kind === 'rail' ? rail(ctx, el, sec) : board(ctx, el, sec);
}
