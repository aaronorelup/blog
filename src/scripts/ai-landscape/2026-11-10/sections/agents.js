// Personal agents (SPEC 2.6): the row again with only floors 3, 7 and 8 lit, one table under it: every agent a
// column under its stack, the row heads at the left. Three lamps on floor 7 and one on floor 3 repeat the table in
// ink. "Close your laptop" shuts the paper laptop: the cables to every part that needs your own machine, and the
// cells that do, fall to 15 percent. It tours itself once. On a phone the table is a list in the sheet, with no cable.
import { Color, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { ROW_X } from '../scene/row.js';
import { owner } from '../worlds/index.js';

const LIT = [2, 6, 7];                          // router, compute, delegation
const PHONE = { pos: [0, 2.9, 30], look: [0, 1.75, 0], fov: 24, fit: 15.2, cy: 0.2 };
const SQUEEZE = 2.85 / 4.2;
const YOU = owner('you').glass;
const DARK = '#2A2C31';

export function create(ctx, el, sec) {
  const { rig, row, labels, prims, phone, reduced, input } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const plates = $$('.ail-ag__row', el);
  const sw = $('.ail-ag__switch', el);
  const heads = $('.ail-ag__heads', el);
  const st = { closed: 0, want: false, toured: false, tour: 0, touched: false, k: 0 };
  // the row keeps clear of the table's row heads: they need 270 px left of the first stack, as the line-up's axis does
  const WIDE = { ...rig.stops.row };
  function seat() {
    const W = window.innerWidth, base = rig.stops.row;
    WIDE.fit = base.fit * Math.max(1, ((19.2 / base.fit) * W) / (W - 270 - 40));
    WIDE.cx = 0.5 + Math.max(0, 270 - (0.5 - (9.6 + base.look[0]) / WIDE.fit) * W) / W;
  }
  seat();
  window.addEventListener('resize', seat);
  const v = new Vector3();

  // the lamps: three on the compute floor from the primary cloud computer, one on the router floor from the agent
  const lamps = towers.flatMap((tw) => {
    const L = ctx.data.p[tw.id].lamps;
    return [prims.lamps(tw, 6, [L.terminal, L.browser, L.screen], { flat: true }), prims.lamps(tw, 2, [L.alwaysOn], { flat: true })];
  });
  lamps.forEach((l) => { l.items[0].mesh.parent.scale.setScalar(phone ? 2.2 : 1.55); l.show = 0; l.update(); });

  // every part whose owner is "you": the guest cores stack.js seats in a floor, in the order of the data's guests
  const you = towers.flatMap((tw) => ctx.data.p[tw.id].stack.map((c, i) => ({ tw, i, k: (c.g || []).slice(0, 3).indexOf('you') })).filter((x) => x.k >= 0));
  const core = (x) => x.tw.floors[x.i].guests[x.k] || null;

  // cables from the laptop on the switch to every part that needs your machine: dashed ink while it is open
  const NS = 'http://www.w3.org/2000/svg';
  const overlay = document.getElementById('ail-leaders');
  const cables = phone ? [] : you.map((x) => { const path = document.createElementNS(NS, 'path'); path.setAttribute('class', 'is-dash ail-cable'); overlay.appendChild(path); return { x, path }; });
  const dark = new Color(DARK);
  const port = $('.ail-ag__port', el);

  function setClosed(on, quiet) {
    st.want = on;
    sw.setAttribute('aria-pressed', String(on));
    el.toggleAttribute('data-closed', on);
    if (!quiet) announce(on ? sw.textContent.trim() : '');
  }
  const onSwitch = () => { st.touched = true; setClosed(!st.want); };
  sw.addEventListener('click', onSwitch);
  const stopTour = input.onInput((kind) => {
    if (sec !== ctx.clock.current || kind === 'wheel' || kind === 'move') return;
    st.touched = true;
  });

  // the table: every agent's row is a column under its stack, and the heads stand left of the first, on the same lines
  const pins = phone ? [] : plates.map((tr, t) => labels.pin(tr, () => v.set(towers[t].x + towers[t].shift, -0.02, 1.3), { ax: 0.5, ay: 0, dy: 10 }));
  if (!phone) pins.push(labels.pin(heads, () => { const r = plates[0].getBoundingClientRect(); return { x: r.left - 6, y: r.top }; }, { ax: 1, ay: 0 }));
  pins.forEach((p) => { p.on = false; });

  ctx.state.compare = { ...(ctx.state.compare || {}), agents: {
    get closed() { return st.want; },
    // every part owned by "you", how dark it is (1 = dark), and the lit level of every cloud floor
    parts: () => you.map((x) => { const m = core(x); return { p: x.tw.id, floor: x.i + 1, colour: m ? `#${m.material.uniforms.uColor.value.getHexString()}` : null, glow: m ? +m.material.uniforms.uActive.value.toFixed(2) : 0 }; }),
    lit: () => towers.map((tw) => ({ p: tw.id, floors: LIT.map((i) => +tw.floors[i].mat.uniforms.uPulse.value.toFixed(2)) })),
  } };

  return {
    stops: [0.6],
    enter() { pins.forEach((p) => { p.on = true; }); },
    leave() {
      pins.forEach((p) => { p.on = false; });
      if (st.tour > 0 && !st.toured) st.toured = true;
      setClosed(false, true); st.closed = 0;
      lamps.forEach((l) => { l.show = 0; l.update(); });
      cables.forEach((c) => { c.path.style.opacity = '0'; });
      you.forEach((x) => { const m = core(x); if (m) { m.material.uniforms.uColor.value.set(YOU); m.scale.setScalar(1); } });
    },
    update(t, dt, u) {
      const k = smooth(span(u, 0, 0.22)) * (1 - smooth(span(u, sec.screens - 0.22, sec.screens)));
      st.k = k;
      rig.mix(rig.stops.row, phone ? PHONE : WIDE, k);

      // it tours itself once: the laptop shuts, waits, opens. Any press, tap or key in the section ends the tour
      if (!st.toured && !reduced && k > 0.95) {
        st.tour += dt;
        if (st.touched) { st.toured = true; if (st.tour > 1.4 && st.tour < 4.6) setClosed(false, true); }
        else if (st.tour > 1.4 && st.tour < 4.6 && !st.want) setClosed(true, true);
        else if (st.tour >= 4.6) { setClosed(false, true); st.toured = true; }
      }
      st.closed += ((st.want ? 1 : 0) - st.closed) * (reduced ? 1 : 1 - Math.exp(-5 * dt));

      towers.forEach((tw, n) => {
        if (phone) { tw.shift = ROW_X[n] * (SQUEEZE - 1) * k; tw.char.show = 1 - k; } else tw.char.scale = 1 + 0.28 * k;
        tw.floors.forEach((f, i) => { if (LIT.includes(i)) f.lit = 0.34 * k; else f.dim = Math.max(f.dim, 0.74 * k); });
      });
      lamps.forEach((l) => { l.show = k; l.update(); });

      // the parts that need your machine: lit while it is open, dark once it is shut. Cloud floors keep their light
      you.forEach((x) => {
        const m = core(x);
        if (!m) return;
        m.material.uniforms.uColor.value.set(YOU).lerp(dark, st.closed * k);
        m.material.uniforms.uActive.value = (1 - st.closed) * 0.55 * k;
        m.scale.setScalar(1 + 0.7 * k);
      });
      // a cable sags from the laptop's back to the part, like a lead across the floor
      if (cables.length) {
        const r = port.getBoundingClientRect();
        const x0 = r.left + r.width / 2, y0 = r.top;
        cables.forEach((c) => {
          const m = core(c.x);
          if (!m) return;
          const p = labels.project(m.getWorldPosition(v));
          // it runs under the table, up the lane left of its agent's column, then across to the part: never over a label
          const plate = plates[towers.indexOf(c.x.tw)].getBoundingClientRect();
          const under = Math.max(plate.bottom, plates[0].getBoundingClientRect().bottom) + 9, lane = plate.left - 5;
          c.path.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}V${under.toFixed(1)}H${lane.toFixed(1)}V${p.y.toFixed(1)}H${p.x.toFixed(1)}`);
          c.path.style.opacity = (k * (0.62 - 0.53 * st.closed)).toFixed(3);
        });
      }
      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
    },
    dispose() {
      sw.removeEventListener('click', onSwitch);
      window.removeEventListener('resize', seat);
      stopTour();
      pins.forEach((p) => p.drop());
      lamps.forEach((l) => l.dispose());
      cables.forEach((c) => c.path.remove());
      if (ctx.state.compare) delete ctx.state.compare.agents;
    },
  };
}
