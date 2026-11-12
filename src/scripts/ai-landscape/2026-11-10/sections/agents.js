// Personal agents (SPEC 2.6): the row again with only floors 3, 7 and 8 lit, each character large on its floor,
// three lamps on floor 7 (terminal, browser, screen) and the always-on lamp on floor 3. "Close your laptop" shuts the
// paper laptop on the switch: the cables to every part that needs your own machine go dark, cloud floors stay lit.
// It tours itself once. On a phone the plates are a list in the sheet and no cable is drawn.
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
  const brk = { from: $('.ail-ag__brk[data-at="from"]', el), month: $('.ail-ag__brk[data-at="month"]', el), per: $('.ail-ag__brk[data-at="per"]', el) };
  const prices = plates.map((p) => $('.ail-ag__price', p));
  const pers = plates.map((p) => $('.ail-ag__per', p));
  const st = { closed: 0, want: false, toured: false, tour: 0, touched: false, k: 0 };
  const v = new Vector3();

  // the lamps: three on the compute floor from the primary cloud computer, one on the router floor from the agent
  const lamps = towers.flatMap((tw) => {
    const L = ctx.data.p[tw.id].lamps;
    return [prims.lamps(tw, 6, [L.terminal, L.browser, L.screen]), prims.lamps(tw, 2, [L.alwaysOn])];
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

  // the words "from" and "a month" bracket the row of prices: one pair for five prices
  function bracket() {
    const a = prices[0].getBoundingClientRect(), b = prices[prices.length - 1].getBoundingClientRect();
    const plateA = plates[0].getBoundingClientRect();
    if (!a.width) return;
    brk.from.style.transform = `translate3d(${(Math.min(a.left, plateA.left) - 12).toFixed(1)}px,${(a.top + a.height / 2).toFixed(1)}px,0) translate(-100%,-50%)`;
    brk.month.style.transform = `translate3d(${(b.right + 10).toFixed(1)}px,${(b.top + b.height / 2).toFixed(1)}px,0) translate(0,-50%)`;
    const c = pers[0].getBoundingClientRect();
    brk.per.style.transform = `translate3d(${(Math.min(c.left, plateA.left) - 12).toFixed(1)}px,${(c.top + c.height / 2).toFixed(1)}px,0) translate(-100%,-50%)`;
  }

  const pins = phone ? [] : plates.map((tr, t) => labels.pin(tr, () => v.set(towers[t].x + towers[t].shift, -0.02, 1.3), { ax: 0.5, ay: 0, dy: 10 }));
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
      if (phone) rig.mix(rig.stops.row, PHONE, k); else rig.to(rig.stops.row);

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
          const mx = (x0 + p.x) / 2, my = Math.max(y0, p.y) + 70;
          c.path.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
          c.path.style.opacity = (k * (0.62 - 0.5 * st.closed)).toFixed(3);
        });
      }
      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
      if (!phone) { bracket(); Object.values(brk).forEach((b) => { b.style.opacity = k.toFixed(3); }); }
    },
    dispose() {
      sw.removeEventListener('click', onSwitch);
      stopTour();
      pins.forEach((p) => p.drop());
      lamps.forEach((l) => l.dispose());
      cables.forEach((c) => c.path.remove());
      if (ctx.state.compare) delete ctx.state.compare.agents;
    },
  };
}
