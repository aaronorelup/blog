// Provider-agnostic design and billing (SPEC 2.9.4, 2.9.5), two sections in front of the row. "board": twenty
// lamps on a dark glass board, one column under each stack, each the page's own lamp shape in paper white. "rail": a tank and a meter for each
// company on a rail, a bead that runs from the tank and switches to the meter when it runs dry. On the rail the
// scroll picks the company and the trend (no timer): a visitor's own pick holds for a tenth of a screen of scroll.
import { BoxGeometry, CylinderGeometry, Group, Mesh, Vector3 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { owner } from '../worlds/index.js';
import { block, dot, drop, roundBox, setGlass, shadow, STOPS } from '../scene/bench.js';

const ROWS_Y = [2.2, 1.56, 0.92, 0.28];
const BZ = 2.35;
const RZ = 4.6;
const DARK = { glass: '#2E3036', rim: '#6B707A', glow: '#2E3036' };
const BAND = 19.4;                    // the board's width: the five columns and a little air
const LABELS = 152;                   // CSS px the four row labels need at its left

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
    const slab = block(ctx, roundBox(BAND, 2.62, 0.14, 0.05), DARK, 2.62, { alpha: 0.86 });
    slab.position.set(0, 1.27, BZ);
    group.add(slab);
    const rows = $$('.ail-agn__row', el);
    // each lamp is the cell's own button, pinned on the board: the same shape the legend and the phone's table show
    const lamps = rows.flatMap((tr, c) => $$('.ail-agn__cell', tr).map((td, r) => {
      const btn = $('.ail-fact', td);
      pin(btn, new Vector3(ROW_X[c], ROWS_Y[r], BZ + 0.1), { ax: 0.5, ay: 0.5 });
      return { c, r, btn, lamp: $('.ail-lampx', btn), on: 0 };
    }));
    $$('.ail-agn__q', el).forEach((th, r) => pin(th, new Vector3(-BAND / 2 - 0.2, ROWS_Y[r], BZ), { ax: 1, ay: 0.5 }));
    $$('.ail-agn__p', el).forEach((th, c) => pin(th, new Vector3(ROW_X[c], 0, BZ + 0.1), { ax: 0.5, ay: 0, dy: 8 }));
    const shade = shadow(ctx, BAND, 0.5, { opacity: 0.14, soft: 0.6 });
    shade.position.set(0.3, 0.004, BZ + 0.3);
    group.add(shade);
    // The camera's seat, from the window: the row labels start clear of the rail (96 px at 1440), the band ends
    // 64 px inside the right edge, and band and labels sit as one centred block. A phone keeps the plain row
    const TAN = Math.tan((24 * Math.PI) / 360);
    const base = { ...STOPS.board };
    function seat() {
      if (ctx.phone) { STOPS.board.cx = 0.5; return; }
      const W = window.innerWidth, H = window.innerHeight;
      const left = Math.max(40, Math.min(96, W / 15)), right = Math.max(24, Math.min(64, W / 22.5));
      const room = Math.max(320, W - left - LABELS - right);
      const dist = Math.max(29.52, (BAND * H) / (2 * TAN * room) + BZ);
      const unit = H / (2 * TAN * (dist - BZ));                          // CSS px a world unit takes on the board
      STOPS.board.fit = Math.max(base.fit, dist * 2 * TAN * (W / H));
      STOPS.board.cx = (left + LABELS + (W - left - LABELS - right) / 2 + base.look[0] * unit) / W;
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
        shade.material.opacity = 0.14 * k;
        // the lamps come on row by row, left to right
        lamps.forEach((l) => {
          const on = reduced ? 1 : smooth(span(u, 0.06 + l.r * 0.04 + l.c * 0.012, 0.16 + l.r * 0.04 + l.c * 0.012));
          if (Math.abs(on - l.on) > 0.004 || on === 1) { l.on = on; l.lamp.style.transform = on < 1 ? `scale(${(0.4 + 0.6 * on).toFixed(3)})` : ''; l.lamp.style.opacity = on < 1 ? on.toFixed(3) : ''; }
        });
        return k;
      },
      dispose() { window.removeEventListener('resize', seat); Object.assign(STOPS.board, base); },
    };
  });
}

// ---- 2.9.5: the billing rail. Each company's cycle: the tank drains, the switch, the meter runs, a new month
const CYCLE = 7, DRAIN = 4.2, SWITCH = 4.4, METER = 6.4;
function rail(ctx, el, sec) {
  return frame(ctx, el, sec, (group, pin) => {
    const { rig, row, reduced } = ctx;
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
    const st = { active: 0, trend: 0, hold: null, holdT: null, u: 0, time: 0 };
    const S = sec.screens, FROM = 0.1, EACH = (S - 0.2) / rows.length, TREND = (S - 0.2) / Math.max(1, trends.length);
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
      // its dot stands on the floor in front of its tank and meter. The card of the picked company hangs at the top
      // right (the stylesheet places it): it never lies over a stack or a mark
      pin(pick, new Vector3(x, 0, RZ + 0.55), { ax: 0.5, ay: 0, dy: 2 });
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
      hide() { units.forEach((u) => { u.bead.visible = false; u.hand.visible = false; }); },
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
      dispose() { el.removeEventListener('click', onPick); window.removeEventListener('click', onStack); dots.forEach((d) => d.removeEventListener('click', onDot)); units.forEach((u) => { drop(u.bead); drop(u.hand); }); },
    };
  });
}

export function create(ctx, el, sec) {
  return el.dataset.kind === 'rail' ? rail(ctx, el, sec) : board(ctx, el, sec);
}
