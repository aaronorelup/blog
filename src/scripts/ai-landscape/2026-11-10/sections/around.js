// Around the five (SPEC 2.9.1): the camera rises until the five stacks are a short row at the top of the frame,
// and nine grey blocks rise under them one at a time, lifting them, as a base: what a person adds around the
// providers. The scroll lights one block after another with its sentence (no timer). A visitor's own pick holds
// until the scroll has moved a tenth of a screen. Phone: names in the sheet.
import { Raycaster, Vector2 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce, rove } from '../core/dom.js';
import { createBase, STOPS } from '../scene/bench.js';

const AROUND = STOPS.around;
const FIRST = 0.12, EACH = 0.11;        // block k of nine is the active one for 0.11 screens, from 0.12

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced, input } = ctx;
  const base = createBase(ctx);
  const items = $$('.ail-ar__item', el);
  const tags = items.map((li) => $('.ail-ar__d', li));
  const list = $('.ail-ar__list', el);
  const head = $('.ail-ar__head', el);
  const st = { active: 0, hold: null, u: 0, hover: -1, k: 0 };
  const pins = phone ? [] : tags.map((t, k) => labels.pin(t, () => base.blocks[k].front, { ax: 0.5, ay: 0.5, dy: 2 }));
  pins.forEach((p) => { p.on = false; });

  function pick(k, quiet = false) {
    if (k < 0 || k >= items.length) return;
    st.active = k;
    items.forEach((li, i) => li.classList.toggle('is-active', i === k));
    if (!quiet) announce($('.ail-ar__say', items[k]).textContent.trim());
  }
  pick(0, true);
  const touch = () => { st.hold = st.u; };
  const onFocus = (e) => { const li = e.target.closest('.ail-ar__item'); if (li) { touch(); pick(items.indexOf(li)); } };
  const onToggle = (e) => { const li = e.target.closest('.ail-ar__item'); if (li && e.target.open) { touch(); pick(items.indexOf(li)); } };
  list.addEventListener('focusin', onFocus);
  list.addEventListener('toggle', onToggle, true);
  const unrove = rove(list, 'summary');

  // the block under the pointer lights, and a click opens its card
  const ray = new Raycaster();
  const ndc = new Vector2();
  const hit = (x, y) => {
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, ctx.camera);
    const h = ray.intersectObjects(base.blocks.map((b) => b.mesh), false)[0];
    return h ? base.blocks.findIndex((b) => b.mesh === h.object) : -1;
  };
  // <main> lies over the canvas, so the click is heard on the window. A control keeps its own click
  const onClick = (e) => {
    if (sec !== ctx.clock.current || st.k < 0.9 || e.target.closest('a, button, summary, details, header, nav, dialog')) return;
    const k = hit(e.clientX, e.clientY);
    if (k < 0) return;
    touch(); pick(k);
    tags.forEach((t, i) => { t.open = i === k && !t.open; });
  };
  window.addEventListener('click', onClick);
  // Escape steps back: every card this section opened closes
  const onEsc = (e) => { if (e.key === 'Escape' && sec === ctx.clock.current) $$('details[open]:not(.ail-ms__pairs)', el).forEach((d) => { d.open = false; }); };
  window.addEventListener('keydown', onEsc);

  return {
    stops: items.map((_, k) => (FIRST + EACH * (k + 0.5)) / sec.screens),      // reduced motion: one still for each block
    enter() { pins.forEach((p) => { p.on = true; }); },
    leave() {
      pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; });
      tags.forEach((t) => { t.open = false; });
      st.hold = null;
      base.show = 0; base.update();
      ctx.canvas.style.cursor = '';
    },
    update(t, dt, u) {
      // camera: up from the level row to where the row is small at the top. It stays there for the bench
      const k = smooth(span(u, 0, 0.32));
      st.k = k; st.u = u;
      rig.mix(rig.stops.row, AROUND, easeIO(span(u, 0, 0.32)));
      rig.yaw = 0.05; rig.pitch = 0.02;

      // the blocks rise one at a time, left to right, and every stack stands on whatever has risen under it
      base.blocks.forEach((b, i) => { b.rise = reduced ? 1 : span(u, 0.04 + i * 0.032, 0.16 + i * 0.032); });
      for (const tw of row.towers) {
        tw.lift = base.under(tw.x - 1.2, tw.x + 1.2);
        if (!phone) { tw.char.to = 'front'; tw.char.t = k; }       // the five figures step down onto the base, twice their size
      }
      row.datum = 0;

      // the scroll picks the block: each of the nine is the active one for its share of the section. A hover, a tap or
      // a key leads until the scroll has moved a tenth of a screen
      const up = span(u, 0.1, 0.18);
      if (st.hold != null && Math.abs(u - st.hold) > 0.1) st.hold = null;
      const want = Math.max(0, Math.min(items.length - 1, Math.floor((u - FIRST) / EACH)));
      if (st.hold == null && want !== st.active) pick(want, true);
      if (!phone && !input.touch && input.moved && st.k > 0.9) {
        const h = hit(input.px, input.py);
        if (h !== st.hover) { st.hover = h; ctx.canvas.style.cursor = h >= 0 ? 'pointer' : ''; if (h >= 0) { touch(); pick(h); } }
      }
      base.show = 1;
      base.blocks.forEach((b, i) => {
        const on = i === st.active ? up : 0;
        b.lit = on * 0.42; b.push = on; b.dim = up * 0.25 * (i === st.active ? 0 : 1);
      });
      base.update();

      // words: the names ride their blocks once each has risen. The sentence of the lit block waits for all nine
      pins.forEach((p, i) => { p.el.style.opacity = smooth(base.blocks[i].rise * 1.6 - 0.6).toFixed(3); });
      el.style.setProperty('--ar-up', up.toFixed(3));
      head.style.opacity = smooth(span(u, 0.02, 0.2)).toFixed(3);
      list.classList.toggle('is-up', up > 0.5);
    },
    dispose() {
      unrove(); window.removeEventListener('keydown', onEsc);
      list.removeEventListener('focusin', onFocus);
      list.removeEventListener('toggle', onToggle, true);
      window.removeEventListener('click', onClick);
      pins.forEach((p) => p.drop());
      base.dispose();
    },
  };
}
