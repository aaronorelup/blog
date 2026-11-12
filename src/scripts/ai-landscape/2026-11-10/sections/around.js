// Around the five (SPEC 2.9.1): the camera rises until the five stacks are a short row at the top of the frame,
// and nine grey blocks rise under them one at a time, lifting them, as a base: what a person adds around the
// providers. One block is lit at a time with its sentence. It tours until touched. Phone: names in the sheet.
import { Raycaster, Vector2 } from 'three';
import { easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce, rove } from '../core/dom.js';
import { createBase, STOPS } from '../scene/bench.js';

const AROUND = STOPS.around;
const TOUR = 2.6;

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced, input } = ctx;
  const base = createBase(ctx);
  const items = $$('.ail-ar__item', el);
  const tags = items.map((li) => $('.ail-ar__d', li));
  const list = $('.ail-ar__list', el);
  const head = $('.ail-ar__head', el);
  const st = { active: 0, clock: 0, touched: false, hover: -1, k: 0 };
  const pins = phone ? [] : tags.map((t, k) => labels.pin(t, () => base.blocks[k].front, { ax: 0.5, ay: 0.5, dy: 2 }));
  pins.forEach((p) => { p.on = false; });

  function pick(k, quiet = false) {
    if (k < 0 || k >= items.length) return;
    st.active = k;
    items.forEach((li, i) => li.classList.toggle('is-active', i === k));
    if (!quiet) announce($('.ail-ar__say', items[k]).textContent.trim());
  }
  pick(0, true);
  const touch = () => { st.touched = true; };
  const onFocus = (e) => { const li = e.target.closest('.ail-ar__item'); if (li) { touch(); pick(items.indexOf(li)); } };
  const onToggle = (e) => { const li = e.target.closest('.ail-ar__item'); if (li && e.target.open) { touch(); pick(items.indexOf(li)); } };
  list.addEventListener('focusin', onFocus);
  list.addEventListener('toggle', onToggle, true);
  const unrove = rove(list, 'summary');
  const stopTour = input.onInput((kind) => { if (sec === ctx.clock.current && (kind === 'down' || kind === 'touch' || kind === 'key')) touch(); });

  // the block under the pointer lights, and a click opens its card
  const ray = new Raycaster();
  const ndc = new Vector2();
  const hit = (x, y) => {
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, ctx.camera);
    const h = ray.intersectObjects(base.blocks.map((b) => b.mesh), false)[0];
    return h ? base.blocks.findIndex((b) => b.mesh === h.object) : -1;
  };
  const onClick = (e) => {
    if (sec !== ctx.clock.current || st.k < 0.9) return;
    const k = hit(e.clientX, e.clientY);
    if (k < 0) return;
    touch(); pick(k);
    tags.forEach((t, i) => { t.open = i === k && !t.open; });
  };
  ctx.canvas.addEventListener('click', onClick);

  return {
    stops: [0.55],
    enter() { pins.forEach((p) => { p.on = true; }); },
    leave() {
      pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; });
      tags.forEach((t) => { t.open = false; });
      base.show = 0; base.update();
      ctx.canvas.style.cursor = '';
    },
    update(t, dt, u) {
      // camera: up from the level row to where the row is small at the top. It stays there for the bench
      const k = smooth(span(u, 0, 0.32));
      st.k = k;
      rig.mix(rig.stops.row, AROUND, easeIO(span(u, 0, 0.32)));
      rig.yaw = 0.05; rig.pitch = 0.02;

      // the blocks rise one at a time, left to right, and every stack stands on whatever has risen under it
      base.blocks.forEach((b, i) => { b.rise = reduced ? 1 : span(u, 0.04 + i * 0.032, 0.16 + i * 0.032); });
      for (const tw of row.towers) {
        tw.lift = base.under(tw.x - 1.2, tw.x + 1.2);
      }
      row.datum = 0;

      // the tour: one block at a time, until the visitor touches the section. Hover leads while it lasts
      const up = span(u, 0.36, 0.44);
      if (!reduced && !st.touched && up >= 1) {
        st.clock += dt;
        if (st.clock > TOUR) { st.clock = 0; pick((st.active + 1) % items.length, true); }
      }
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
      stopTour(); unrove();
      list.removeEventListener('focusin', onFocus);
      list.removeEventListener('toggle', onToggle, true);
      ctx.canvas.removeEventListener('click', onClick);
      pins.forEach((p) => p.drop());
      base.dispose();
    },
  };
}
