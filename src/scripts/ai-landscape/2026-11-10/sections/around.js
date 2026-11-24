// Around the five (SPEC 2.9.1): the camera rises until the five stacks are a short row at the top of the frame,
// and a cabinet of nine drawers rises under them one drawer at a time, lifting them: what a person keeps around
// the providers. Each front carries its glyph and its name. The scroll pulls one drawer after another open, with its
// sentence and the paper object kept in it (no timer). A visitor's own pick holds for a tenth of a screen of scroll.
import { Raycaster, Vector2, Vector3 } from 'three';
import { backOut, easeIO, smooth, span } from '../core/clock.js';
import { $, $$, announce, rove } from '../core/dom.js';
import { CABINET, createBase, STOPS } from '../scene/bench.js';
import { createObject } from '../scene/objects.js';

const AROUND = STOPS.around;
const FIRST = 0.12, EACH = 0.11;        // drawer k of nine is the open one for 0.11 screens, from 0.12
const PULL = 0.1;                       // seconds: a drawer is 97 percent of the way out after 0.35 s
const NAME = CABINET.up - CABINET.glyph / 2 - 0.25;      // a name stands under its glyph, this far from the front's middle
const THING = { size: 1.75, in: 0.07, from: 0.8 };       // an object's longer side, how much of it stays inside its open drawer, and how deep it starts
// A phone holds all nine as a strip. Once the cabinet has risen its camera moves in on the open drawer, three drawers
// wide, with the stack that stands on it, and out again before my stack takes the cabinet over
const NEAR = { ...AROUND, fit: 7.4, cy: 0.5 }, RISE = 0.32, RISE_PHONE = 0.16, EDGE = 6.4;

export function create(ctx, el, sec) {
  const { rig, row, labels, phone, reduced, input } = ctx;
  const base = createBase(ctx);
  const items = $$('.ail-ar__item', el);
  const tags = items.map((li) => $('.ail-ar__d', li));
  const list = $('.ail-ar__list', el);
  const head = $('.ail-ar__head', el);
  const st = { active: 0, hold: null, u: 0, hover: -1, k: 0, tick: 0, boxes: [], hid: false };
  const at = new Vector3();
  const pins = phone ? [] : tags.map((t, k) => labels.pin(t, () => at.copy(base.blocks[k].front).setY(base.blocks[k].front.y + NAME), { ax: 0.5, ay: 0.5 }));
  pins.forEach((p) => { p.on = false; });
  base.blocks.forEach((b) => { b.out = 0; });
  // what is kept in each drawer, as a paper object that comes up out of it while it stands open
  const things = items.map((li) => createObject(ctx, li.dataset.layer));
  // for the tests: how far each drawer stands out, and the glyph on each front
  ctx.state.compare = { ...(ctx.state.compare || {}), around: {
    drawers: () => base.blocks.map((b) => ({ out: +(b.push * CABINET.slide).toFixed(2), front: +b.front.z.toFixed(2), up: +b.rise.toFixed(2), glyph: !!(b.glyph && b.glyph.visible) })),
    things: () => things.map((o, k) => (o && o.mesh.visible ? { layer: o.layer, x: +o.mesh.position.x.toFixed(2), drawer: +base.blocks[k].x.toFixed(2), tall: +o.tall.toFixed(2) } : null)),
    glyphs: () => items.map((li) => li.dataset.layer),
  } };

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

  // the drawer under the pointer opens, and a click opens its card
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
    stops: items.map((_, k) => (FIRST + EACH * (k + 0.5)) / sec.screens),      // reduced motion: one still for each drawer
    enter() { pins.forEach((p) => { p.on = true; }); },
    leave() {
      pins.forEach((p) => { p.on = false; p.el.style.opacity = '0'; });
      tags.forEach((t) => { t.open = false; });
      st.hold = null;
      base.show = 0; base.update();
      things.forEach((o) => o && o.hide());
      ctx.canvas.style.cursor = '';
    },
    update(t, dt, u) {
      // camera: up from the level row to where the row is small at the top. It stays there for the bench
      const k = smooth(span(u, 0, 0.32));
      st.k = k; st.u = u;
      rig.mix(rig.stops.row, AROUND, easeIO(span(u, 0, phone ? RISE_PHONE : RISE)));
      if (phone && u > RISE_PHONE) {
        const x = Math.max(-EDGE, Math.min(EDGE, base.blocks[st.active].x));
        NEAR.pos = [x, AROUND.pos[1], AROUND.pos[2]]; NEAR.look = [x, AROUND.look[1], AROUND.look[2]];
        rig.mix(AROUND, NEAR, easeIO(span(u, RISE_PHONE, RISE_PHONE + 0.1)) * (1 - easeIO(span(u, sec.screens - 0.12, sec.screens - 0.03))));
      }
      rig.yaw = 0.05; rig.pitch = 0.02;

      // the drawers rise one at a time, left to right, and every stack stands on whatever has risen under it
      base.blocks.forEach((b, i) => { b.rise = reduced ? 1 : span(u, 0.04 + i * 0.032, 0.16 + i * 0.032); });
      // a mark is whole or absent: where a short window stands the title or the quote over a lid plate, all five
      // plates leave together (the words are measured twice a second: they do not move)
      st.tick -= dt;
      if (st.tick <= 0) { st.tick = 0.5; st.boxes = phone ? [] : [...head.children].map((c) => c.getBoundingClientRect()); }
      const pad = st.hid ? 8 : 0;
      st.hid = u > 0.03 && st.boxes.some((b) => row.towers.some((tw) => { const p = labels.project(tw.lid.mesh.position), r = tw.lid.px / 2 + pad; return p.x + r > b.left && p.x - r < b.right && p.y - r < b.bottom; }));
      for (const tw of row.towers) {
        tw.lift = base.under(tw.x - 1.2, tw.x + 1.2);
        tw.lid.show = st.hid ? 0 : 1;
        if (!phone) { tw.char.to = 'front'; tw.char.t = k; }       // the five figures step down onto the base, twice their size
      }
      row.datum = 0;

      // the scroll picks the drawer: each of the nine is the open one for its share of the section. A hover, a tap or
      // a key leads until the scroll has moved a tenth of a screen
      const up = span(u, 0.1, 0.18);
      if (st.hold != null && Math.abs(u - st.hold) > 0.1) st.hold = null;
      const want = Math.max(0, Math.min(items.length - 1, Math.floor((u - FIRST) / EACH)));
      if (st.hold == null && want !== st.active) pick(want, true);
      if (!phone && !input.touch && input.moved && st.k > 0.9) {
        const h = hit(input.px, input.py);
        if (h !== st.hover) { st.hover = h; ctx.canvas.style.cursor = h >= 0 ? 'pointer' : ''; if (h >= 0) { touch(); pick(h); } }
      }
      // the open drawer slides out toward the camera and glows, the other eight step back a tone. The last one is
      // pushed shut by the scroll before the section ends: my stack takes the cabinet over closed
      const shut = 1 - smooth(span(u, sec.screens - 0.08, sec.screens - 0.01));
      base.show = 1;
      base.blocks.forEach((b, i) => {
        const on = i === st.active ? up : 0;
        b.out = reduced ? on : b.out + (on - b.out) * (1 - Math.exp(-dt / PULL));
        b.push = Math.min(b.out, shut);
        b.lit = b.push * 0.42; b.dim = up * 0.22 * (1 - b.push);
      });
      base.update();
      // the open drawer's object comes up out of it: it stands in the part that is pulled out, its foot inside
      things.forEach((o, i) => {
        if (!o) return;
        const b = base.blocks[i], e = reduced ? (b.push > 0.5 ? 1 : 0) : backOut(Math.min(1, b.push * 1.15), 1.4);
        o.place(at.set(b.x, b.mesh.position.y + CABINET.h / 2 - THING.size * (THING.in + THING.from * (1 - e)), b.front.z - Math.max(0.3, b.push * CABINET.slide * 0.5)), THING.size, b.push > 0.04 ? 1 : 0);
      });

      // words: the names ride their fronts once each has risen. The sentence of the open drawer waits for all nine
      pins.forEach((p, i) => { p.el.style.opacity = smooth(base.blocks[i].rise * 1.6 - 0.6).toFixed(3); });
      el.style.setProperty('--ar-up', up.toFixed(3));
      head.style.opacity = smooth(span(u, 0.02, 0.2)).toFixed(3);
      list.classList.toggle('is-up', up > 0.5);
    },
    dispose() {
      if (ctx.state.compare) delete ctx.state.compare.around;
      unrove(); window.removeEventListener('keydown', onEsc);
      list.removeEventListener('focusin', onFocus);
      list.removeEventListener('toggle', onToggle, true);
      window.removeEventListener('click', onClick);
      pins.forEach((p) => p.drop());
      things.forEach((o) => o && o.dispose());
      base.dispose();
    },
  };
}
