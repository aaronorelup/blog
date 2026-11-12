// The line-up (SPEC 2.3): the five stacks at level elevation, read one floor at a time. The lit floor tours down
// the nine until touched. Its name and sentence stay on screen, nine datum lines run from the left axis between the
// floors, the five answers stand under the stacks, and the lens shows the inside of the stack under the pointer.
// A phone pulls the five closer into the top third and lists the axis and the answers in a sheet.
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { createLens } from '../scene/lens.js';
import { ROW_X } from '../scene/row.js';
import { FLOOR } from '../scene/stack.js';

const TOUR = 2.5;                       // seconds a floor stays lit while the line-up tours
const N = FLOOR.n;
const PHONE = { pos: [0, 2.9, 30], look: [0, 1.75, 0], fov: 24, fit: 15.2, cy: 0.2 };
const SQUEEZE = 2.85 / 4.2;              // a phone's row spacing, as a share of the desktop's
const STUB = 0.55;                       // how far the datum lines reach past the outer stacks

export function create(ctx, el, sec) {
  const { rig, row, labels, input, phone, reduced } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const says = $$('.ail-lu__say', el);
  const heads = $$('.ail-lu__th', el);
  const layers = $$('.ail-lu__layer', el);
  const rowsEl = $$('.ail-lu__row', el);
  const cells = rowsEl.map((tr) => $$('.ail-lu__cell', tr));
  const guestLine = $('.ail-lu__guest', el);
  const words = [$('.ail-lu__now', el), $('.ail-lu__foot', el)];
  const st = { sel: 0, hover: -1, co: -1, lit: -1, touched: false, clock: 0, k: 0 };
  const v = new Vector3();

  // ---- the nine datum lines: from the left axis to the first stack, between every two, and a stub past the last.
  // They run through the floors' own side faces (z = 0), so each one meets its floor exactly on every stack
  const SEG = (towers.length + 1) * N;
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(SEG * 6), 3));
  const lines = new LineSegments(geo, new LineBasicMaterial({ color: '#0C0D10', transparent: true, opacity: 0, depthWrite: false }));
  const litGeo = new BufferGeometry();
  litGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array((towers.length + 1) * 6), 3));
  const litLine = new LineSegments(litGeo, new LineBasicMaterial({ color: '#0C0D10', transparent: true, opacity: 0, depthWrite: false }));
  lines.frustumCulled = false; litLine.frustumCulled = false;
  lines.renderOrder = 4; litLine.renderOrder = 5;
  ctx.scene.add(lines, litLine);
  const edge = (tw, side) => tw.x + tw.shift + side * FLOOR.w / 2;
  const yOf = (tw, i) => tw.floors[i].y + tw.lift;
  const axisX = () => edge(towers[0], -1) - (phone ? STUB : 1.75);
  function writeLines() {
    const pos = geo.attributes.position;
    const lit = litGeo.attributes.position;
    let n = 0;
    for (let i = 0; i < N; i++) {
      for (let t = 0; t <= towers.length; t++) {
        const x0 = t === 0 ? axisX() : edge(towers[t - 1], 1);
        const x1 = t === towers.length ? edge(towers[t - 1], 1) + STUB : edge(towers[t], -1);
        const y0 = t === 0 ? yOf(towers[0], i) : yOf(towers[t - 1], i);
        const y1 = t === towers.length ? y0 : yOf(towers[t], i);
        pos.setXYZ(n * 2, x0, y0, 0); pos.setXYZ(n * 2 + 1, x1, y1, 0);
        if (i === st.lit) { lit.setXYZ(t * 2, x0, y0, 0); lit.setXYZ(t * 2 + 1, x1, y1, 0); }
        n++;
      }
    }
    pos.needsUpdate = true; lit.needsUpdate = true;
  }

  // ---- pins: the axis on the datum lines' left ends, the lit row's answers under the stacks (desktop only)
  const pins = [];
  if (!phone) {
    heads.forEach((th, i) => pins.push(labels.pin(th, () => v.set(axisX(), yOf(towers[0], i), 0), { ax: 1, ay: 0.5 })));
    cells.forEach((list) => list.forEach((td, t) => pins.push(labels.pin(td, () => v.set(edge(towers[t], 0), -0.02, 1.3), { ax: 0.5, ay: 0, dy: 10 }))));
  }
  pins.forEach((p) => { p.on = false; });

  // ---- the lens: desktop with a pointer only
  const lens = !phone && !input.touch ? createLens(ctx, $('.ail-lens', el), towers) : null;

  function light(i, quiet) {
    if (i === st.lit) return;
    st.lit = i;
    says.forEach((p, k) => p.classList.toggle('is-on', k === i));
    rowsEl.forEach((tr, k) => tr.classList.toggle('is-lit', k === i));
    layers.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    guestLine.classList.toggle('is-on', rowsEl[i].hasAttribute('data-guest'));
    $$('.ail-map__col').forEach((col) => [...col.children].forEach((cell, k) => cell.toggleAttribute('data-row', k === i)));
    if (!quiet) announce(says[i].textContent.trim());
  }
  const touch = () => { st.touched = true; };
  const pick = (i) => { touch(); st.sel = (i + N) % N; light(st.sel); };
  const company = (t) => { st.co = t; cells.forEach((list) => list.forEach((td, k) => td.classList.toggle('is-dim', t >= 0 && k !== t))); };

  const onAxis = (e) => { const b = e.target.closest('.ail-lu__layer'); if (b) pick(Number(b.dataset.i)); };
  const onOver = (e) => { const b = e.target.closest('.ail-lu__layer'); if (b && !phone) { touch(); st.hover = Number(b.dataset.i); } };
  const onOut = (e) => { if (e.target.closest('.ail-lu__layer')) st.hover = -1; };
  const onToggle = (e) => { if (e.target.open) { touch(); company(cells[st.lit].indexOf(e.target.closest('td'))); } };
  // arrows: up and down move the floor, left and right the company in focus (SPEC 2.3)
  const onKey = (e) => {
    if (sec !== ctx.clock.current || !el.contains(document.activeElement)) return;
    const dy = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    const dx = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (dy) { e.preventDefault(); pick(st.sel + dy); (phone ? layers[st.sel] : document.activeElement.closest('td') ? $('summary', cells[st.sel][Math.max(0, st.co)]) : layers[st.sel]).focus(); }
    if (dx) { e.preventDefault(); touch(); const t = (Math.max(-1, st.co) + dx + order.length) % order.length; company(t); $('summary', cells[st.sel][t]).focus(); }
    if (e.key === 'Escape') { $$('details[open]', el).forEach((d) => { d.open = false; }); company(-1); }
  };
  // a click on a stack opens its world: the lens grows into the iris on the way
  const onClick = (e) => {
    if (sec !== ctx.clock.current || e.target.closest('a, button, summary, details, header, nav')) return;
    const hit = row.pick(e.clientX, e.clientY);
    if (!hit) return;
    touch();
    if (lens) lens.grow();
    const world = document.getElementById(hit.tower.id);
    ctx.scrollTo(hit.tower.id, world ? Number(world.dataset.land) || 0 : 0);
  };
  el.addEventListener('click', onAxis);
  el.addEventListener('pointerover', onOver);
  el.addEventListener('pointerout', onOut);
  el.addEventListener('toggle', onToggle, true);
  window.addEventListener('keydown', onKey);
  window.addEventListener('click', onClick);
  light(0, true);

  // the test hook: where each datum line and each floor land on screen, in CSS pixels
  const probe = () => towers.map((tw) => Array.from({ length: N }, (_, i) => {
    const f = labels.project(v.set(edge(tw, -1), yOf(tw, i), 0));
    const pos = geo.attributes.position;
    const t = towers.indexOf(tw);
    const k = (i * (towers.length + 1) + t) * 2 + 1;              // the segment that ends at this stack's left side
    const d = labels.project(v.set(pos.getX(k), pos.getY(k), pos.getZ(k)));
    return { floor: [+f.x.toFixed(1), +f.y.toFixed(1)], line: [+d.x.toFixed(1), +d.y.toFixed(1)] };
  }));
  ctx.state.compare = { ...(ctx.state.compare || {}), lineup: { get lit() { return st.lit; }, probe, show: (i) => pick(i) } };

  return {
    stops: [0.5],
    enter() { pins.forEach((p) => { p.on = true; }); st.clock = 0; },
    leave() {
      pins.forEach((p) => { p.on = false; });
      lines.visible = false; litLine.visible = false;
      if (lens) lens.close(true);
      company(-1);
      $$('.ail-map__col i[data-row]').forEach((c) => c.removeAttribute('data-row'));
    },
    update(t, dt, u) {
      // in and out over the section's edges, so the neighbours meet it with nothing jumping
      const k = smooth(span(u, 0, 0.22)) * (1 - smooth(span(u, sec.screens - 0.22, sec.screens)));
      st.k = k;
      if (phone) rig.mix(rig.stops.row, PHONE, k); else rig.to(rig.stops.row);

      // the tour: one floor every 2.5 s until the visitor takes over. Never under reduced motion
      if (!st.touched && !reduced && k > 0.9) {
        st.clock += dt;
        if (st.clock > TOUR) { st.clock = 0; st.sel = (st.sel + 1) % N; }
      }
      // hover a floor of any stack: that floor lights across all five, and that company comes forward
      if (!phone && !input.touch && input.moved && k > 0.5) {
        const hit = row.pick(input.px, input.py);
        if (hit) { touch(); st.hover = hit.i; company(order.indexOf(hit.tower.id)); }
        else if (st.hover >= 0 && !el.querySelector('.ail-lu__layer:hover')) { st.hover = -1; if (!el.querySelector('details[open]')) company(-1); }
        ctx.canvas.style.cursor = hit ? 'pointer' : '';
      }
      const lit = st.hover >= 0 ? st.hover : st.sel;
      light(lit, !st.touched);

      towers.forEach((tw, n) => {
        if (phone) { tw.shift = ROW_X[n] * (SQUEEZE - 1) * k; tw.char.show = 1 - k; }
        if (st.co >= 0 && n !== st.co) tw.dim = 0.35 * k;
        tw.floors.forEach((f, i) => {
          if (i === lit) f.lit = 0.4 * k; else f.dim = Math.max(f.dim, 0.7 * k);
        });
      });
      for (const tw of towers) tw.layout();                      // floors at this frame's heights before lines and pins read them
      writeLines();
      lines.visible = k > 0.01; litLine.visible = k > 0.01;
      lines.material.opacity = 0.14 * k; litLine.material.opacity = 0.62 * k;
      words.forEach((w) => { w.style.opacity = k.toFixed(3); });
      pins.forEach((p) => { p.el.style.opacity = k.toFixed(3); });
      if (lens) lens.update(dt, k > 0.9, ctx.data.p);
    },
    dispose() {
      el.removeEventListener('click', onAxis);
      el.removeEventListener('pointerover', onOver);
      el.removeEventListener('pointerout', onOut);
      el.removeEventListener('toggle', onToggle, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      pins.forEach((p) => p.drop());
      if (lens) lens.drop();
      ctx.scene.remove(lines, litLine);
      geo.dispose(); litGeo.dispose(); lines.material.dispose(); litLine.material.dispose();
      if (ctx.state.compare) delete ctx.state.compare.lineup;
    },
  };
}
