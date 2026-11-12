// Provider-agnostic design and billing (SPEC 2.9.4, 2.9.5), two sections in front of the row. "board": twenty
// lamps on a glass board, one column under each stack, lit, half lit or dark. "rail": a tank and a meter for each
// company on a rail, a bead that runs from the tank and switches to the meter when it runs dry. Both tour.
import { BoxGeometry, CylinderGeometry, Group, Mesh, SphereGeometry, Vector3 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { owner } from '../worlds/index.js';
import { block, dot, drop, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';

const ROWS_Y = [2.2, 1.56, 0.92, 0.28];
const BZ = 2.35;
const RZ = 4.6;
const DARK = { glass: '#2E3036', rim: '#6B707A', glow: '#2E3036' };

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

// ---- 2.9.4: the lamp board
function board(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced } = ctx;
    // a standing board of house glass in front of the stacks: one column of lamps under each company's lid
    const slab = block(ctx, roundBox(20.6, 2.62, 0.14, 0.05), 'house', 2.62, { alpha: 0.34 });
    slab.position.set(0, 1.27, BZ);
    group.add(slab);
    const halfAt = (start) => new SphereGeometry(0.21, 24, 12, start, Math.PI, 0, Math.PI / 2).rotateX(Math.PI / 2);
    const domes = [halfAt(Math.PI * 1.5), halfAt(Math.PI / 2)];          // the left half, then the right
    const rows = $$('.ail-agn__row', el);
    const lamps = rows.flatMap((tr, c) => $$('.ail-agn__cell', tr).map((td, r) => {
      const v = td.dataset.v;
      const own = owner(tr.dataset.p);
      // two halves of a dome: both lit for yes, the left one for partly, none for no
      const halves = domes.map((geo, h) => {
        const lit = v === 'yes' || (v === 'partial' && h === 0);
        const m = new Mesh(geo, ctx.mats.core(lit ? own : DARK));
        m.position.set(ROW_X[c], ROWS_Y[r], BZ + 0.06);
        m.scale.set(1, 1, 0.6);
        group.add(m);
        return { m, lit };
      });
      const btn = $('.ail-fact', td);
      pin(btn, new Vector3(ROW_X[c], ROWS_Y[r], BZ + 0.1), { ax: 0.5, ay: 0.5 });
      return { halves, c, r, btn, on: 0 };
    }));
    $$('.ail-agn__q', el).forEach((th, r) => pin(th, new Vector3(-10.45, ROWS_Y[r], BZ), { ax: 1, ay: 0.5 }));
    $$('.ail-agn__p', el).forEach((th, c) => pin(th, new Vector3(ROW_X[c], 0, BZ + 0.1), { ax: 0.5, ay: 0, dy: 8 }));
    const shade = shadow(ctx, 20.6, 0.5, { opacity: 0.14, soft: 0.6 });
    shade.position.set(0.3, 0.004, BZ + 0.3);
    group.add(shade);
    return {
      stops: [0.42],
      update(dt, u) {
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, 0.6, 0.7)));
        if (u < 0.56) rig.to(STOPS.board); else rig.mix(STOPS.board, STOPS.rail, easeIO(span(u, 0.56, 0.7)));
        rig.yaw = 0.04; rig.pitch = 0.015;
        for (const tw of row.towers) tw.char.show = 0;
        setGlass(slab, { show: k });
        shade.material.opacity = 0.14 * k;
        // the lamps come on row by row, left to right
        lamps.forEach((l) => {
          l.on = reduced ? 1 : smooth(span(u, 0.06 + l.r * 0.04 + l.c * 0.012, 0.16 + l.r * 0.04 + l.c * 0.012));
          const hot = l.btn.matches(':hover, :focus-visible') ? 0.25 : 0;
          l.halves.forEach((h) => {
            const un = h.m.material.uniforms;
            un.uShow.value = k; un.uActive.value = h.lit ? l.on * 0.85 + hot : 0;
            h.m.visible = k > 0.01;
          });
        });
        return k;
      },
    };
  });
}

// ---- 2.9.5: the billing rail. Each company's cycle: the tank drains, the switch, the meter runs, a new month
const CYCLE = 7, DRAIN = 4.2, SWITCH = 4.4, METER = 6.4;
function rail(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced, input } = ctx;
    const bar = block(ctx, roundBox(21, 0.12, 0.36, 0.06), 'house', 0.12);
    bar.position.set(0, 0.06, RZ);
    group.add(bar);
    const shellGeo = new CylinderGeometry(0.34, 0.34, 1.1, 32);
    const fillGeo = new CylinderGeometry(0.28, 0.28, 1, 32).translate(0, 0.5, 0);
    const dialGeo = new CylinderGeometry(0.36, 0.36, 0.09, 40).rotateX(Math.PI / 2);
    const needleGeo = new BoxGeometry(0.035, 0.3, 0.014).translate(0, 0.13, 0);
    const rows = $$('.ail-bill__row', el);
    const trends = $$('.ail-bill__trend', el);
    const dots = $$('.ail-bill__dot', el);
    const st = { active: 0, clock: 0, trend: 0, tclock: 0, touched: false, time: 0 };
    const units = rows.map((tr, c) => {
      const id = tr.dataset.p;
      const x = ROW_X[c];
      const shell = block(ctx, shellGeo, owner(id), 1.1, { alpha: 0.4 });
      shell.position.set(x - 0.66, 0.12 + 0.55, RZ);
      const fill = block(ctx, fillGeo, owner(id), 1);
      fill.position.set(x - 0.66, 0.16, RZ);
      const dial = block(ctx, dialGeo, owner(id), 0.72);
      dial.position.set(x + 0.66, 0.12 + 0.4, RZ);
      const hand = dot(ctx, 0.045);
      const pointer = new Mesh(needleGeo, hand.material);
      pointer.position.set(x + 0.66, 0.52, RZ + 0.06);
      hand.position.copy(pointer.position);
      group.add(shell, fill, dial, pointer);
      const bead = dot(ctx, 0.1, id);
      const pick = $('.ail-bill__pick', tr);
      const top = new Vector3(x, 1.38, RZ);
      const edge = c === 0 ? 0.12 : c === rows.length - 1 ? 0.88 : 0.5;
      pin(pick, new Vector3(x, 0.55, RZ), { ax: 0.5, ay: 0.5 });
      // the company's card stands over its tank and meter: name, plan, meter, at the limit
      [$('.ail-bill__nm', tr), ...$$('.ail-bill__cell', tr)].forEach((node, n) => pin(node, top, { ax: edge, ay: 1, dy: -8 - (3 - n) * 50 }));
      return { id, x, tr, shell, fill, dial, pointer, hand, bead, pick, phase: c * 1.35 };
    });
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
    const onPick = (e) => { const b = e.target.closest('.ail-bill__pick'); if (!b) return; st.touched = true; choose(units.findIndex((u) => u.pick === b), false); };
    const onDot = (e) => { st.touched = true; trend(Number(e.currentTarget.dataset.i)); };
    el.addEventListener('click', onPick);
    $('.ail-bill__pager', el).hidden = false;
    dots.forEach((d) => d.addEventListener('click', onDot));
    const stopTour = input.onInput((kind) => { if (sec === ctx.clock.current && (kind === 'down' || kind === 'touch' || kind === 'key')) st.touched = true; });
    const from = new Vector3(), to = new Vector3(), ctl = new Vector3();
    return {
      stops: [0.42],
      hide() { units.forEach((u) => { u.bead.visible = false; u.hand.visible = false; }); },
      leave() { units.forEach((u) => { u.tr.querySelector('details').open = false; }); },
      update(dt, u) {
        const k = smooth(span(u, 0, 0.14)) * (1 - smooth(span(u, 0.56, 0.7)));
        if (u < 0.5) rig.to(STOPS.rail); else rig.mix(STOPS.rail, rig.stops.row, easeIO(span(u, 0.5, 0.7)));
        rig.yaw = 0.05; rig.pitch = 0.02;
        // the open card stands where that company's lid would be: it carries the name, so the mark steps aside
        row.towers.forEach((tw, c) => { tw.char.show = 1 - k; if (c === st.active && !ctx.phone) tw.lid.show = 1 - k; });
        st.time += reduced ? 0 : dt;
        // the tour: one company's lines at a time, and one trend at a time, until the visitor takes over
        if (!reduced && !st.touched && k > 0.9) {
          st.clock += dt; st.tclock += dt;
          if (st.clock > 5.2) { st.clock = 0; choose((st.active + 1) % units.length, true); }
          if (st.tclock > 7.5) { st.tclock = 0; trend((st.trend + 1) % trends.length); }
        }
        setGlass(bar, { show: k });
        units.forEach((n, c) => {
          const p = reduced ? 3.2 : (st.time + n.phase) % CYCLE;
          const level = p < DRAIN ? 1 - p / DRAIN : p < METER ? 0 : (p - METER) / (CYCLE - METER);
          const metered = p >= SWITCH && p < METER;
          const lit = c === st.active ? 0.3 : 0;
          const dim = c === st.active ? 0 : 0.35;
          setGlass(n.shell, { show: k, lit, dim });
          setGlass(n.fill, { show: k * (level > 0.01 ? 1 : 0), dim });
          n.fill.scale.set(1, Math.max(0.001, level * 0.84), 1);
          setGlass(n.dial, { show: k, lit: lit + (metered ? 0.25 : 0), dim });
          n.pointer.rotation.z = -((metered ? (p - SWITCH) * 4.2 : 0) + 0.6);
          n.pointer.visible = n.hand.visible = k > 0.5;
          // the bead: from the tank while it holds, from the meter once it is dry, to the foot of the stack
          if (metered) from.set(n.x + 0.66, 0.92, RZ); else from.set(n.x - 0.66, 0.16 + 0.93 * level + 0.06, RZ);
          to.set(n.x, 0.12, 1.3);
          ctl.lerpVectors(from, to, 0.5).setY(Math.max(from.y, 0.6) + 0.55);
          const b = (st.time * 1.1 + c * 0.3) % 1;
          const a = 1 - b;
          n.bead.position.set(a * a * from.x + 2 * a * b * ctl.x + b * b * to.x, a * a * from.y + 2 * a * b * ctl.y + b * b * to.y, a * a * from.z + 2 * a * b * ctl.z + b * b * to.z);
          n.bead.visible = k > 0.5 && !reduced && (level > 0.02 || metered);
        });
        return k;
      },
      dispose() { el.removeEventListener('click', onPick); dots.forEach((d) => d.removeEventListener('click', onDot)); stopTour(); units.forEach((u) => { drop(u.bead); drop(u.hand); }); },
    };
  });
}

export function create(ctx, el, sec) {
  return el.dataset.kind === 'rail' ? rail(ctx, el, sec) : board(ctx, el, sec);
}
