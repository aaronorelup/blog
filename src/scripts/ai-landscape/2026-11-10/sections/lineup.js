// The line-up (SPEC 2.3): the five stacks at level elevation, semi-open, read one floor at a time. The scroll picks
// the floor (0.19 screens each from 0.15): no timer. A hover, a tap or an arrow key holds its own floor until the
// scroll has moved a tenth of a screen. The nine names stand as the left axis, the five answers under the stacks, and
// behind each stack its board rises with one sign: the lit floor in that company's glass, state and parts.
// A phone pulls the five closer into the top third and lists the axis and the answers in a sheet.
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { createLens } from '../scene/lens.js';
import { createSeat, level, ROW_SPAN } from '../scene/seat.js';
import { BAY, LID_TOP } from '../scene/set.js';
import { ROW_X } from '../scene/row.js';
import { FLOOR, SEMI } from '../scene/stack.js';

const FIRST = 0.15, STEP = 0.19;         // floor k is lit while u is in [FIRST + STEP (k - 1), FIRST + STEP k)
const HOLD = 0.1;                       // screens of scroll a visitor's own pick survives
const N = FLOOR.n;
const PHONE = { pos: [0, 2.9, 30], look: [0, 1.75, 0], fov: 24, fit: 15.2, cy: 0.2 };
const SQUEEZE = 2.85 / 4.2;              // a phone's row spacing, as a share of the desktop's
const STUB = 0.55;                       // how far the datum lines reach past the outer stacks
const STACK_H = N * FLOOR.h + (N - 1) * SEMI;              // a semi-open stack: 3.62
// What a raised board adds over the row, as it looks at the row's depth. On a desktop: the lid plate, then the whole
// board, which must clear the words above. On a phone up to the sign's top (the board's last strip may stand behind
// the chrome), over the lid plate or, where a phone is too short for both, in the plate's place (`bare`)
const OVER = { wide: LID_TOP + BAY.over + BAY.rise * 0.93, phone: LID_TOP + BAY.over + (BAY.rise - BAY.head) * 0.98, bare: BAY.low + (BAY.rise - BAY.head) * 0.98 };
// a row with signs may be drawn smaller to fit a window's height, down to this many px a world unit. Under that the
// boards stay at rest and the row stands as it always did
const SMALL = { wide: 40, phone: 19 };

export function create(ctx, el, sec) {
  const { rig, row, labels, input, phone, studio } = ctx;
  const order = ctx.data.order;
  const towers = order.map((id) => row.tower(id));
  const bays = towers.map((tw) => studio.bays[tw.index]);
  // every sign the boards can carry: a company's floor as its glyph, its state and its parts (all the page's data)
  const tiles = towers.map((tw) => ctx.data.p[tw.id].stack.map((c, i) => ({ glyph: ctx.data.layers[i], state: c.s, owner: tw.id, parts: c.p })));
  const far = { ...PHONE };
  const chrome = document.querySelector('.ail-chrome__side--id');
  const sheet = $('.ail-lu__wrap', el);
  const says = $$('.ail-lu__say', el);
  const heads = $$('.ail-lu__th', el);
  const layers = $$('.ail-lu__layer', el);
  const rowsEl = $$('.ail-lu__row', el);
  const cells = rowsEl.map((tr) => $$('.ail-lu__cell', tr));
  const guestLine = $('.ail-lu__guest', el);
  const words = [$('.ail-lu__now', el), $('.ail-lu__foot', el)];
  const st = { sel: -1, selAt: 0, hover: -1, hoverAt: 0, co: -1, lit: -1, k: 0, u: 0, tall: false, bare: false, laid: false, top: 0, feet: 0, over: 0 };
  // the row keeps clear of the axis (the nine names stand left of the first stack's character), of the lit floor's
  // words above it and of the legend under its answers, in a window of any height (scene/seat.js)
  const seat = createSeat(ctx);
  const WIDE = seat.stop;
  const v = new Vector3();

  // ---- where the row stands, worked out once for a window and the same for all nine floors (so it never moves
  // between them): under the tallest the words above it get, over the highest the legend reaches. Where sign, plate,
  // row and answers fit between the two, drawn smaller if need be, the boards rise. A phone that has no room for
  // sign and plate drops the plate
  function ghost(node, each) {
    const copy = node.cloneNode(true);
    copy.style.visibility = 'hidden';
    node.after(copy);
    const got = each(copy);
    copy.remove();
    return got;
  }
  function lay() {
    const W = window.innerWidth;
    if (!words[0].offsetHeight && !sheet.offsetHeight) return;             // the stage is not laid out yet: next frame
    st.laid = true;
    if (phone) {
      st.top = (chrome ? chrome.getBoundingClientRect().bottom : 78) + 2; st.feet = sheet.getBoundingClientRect().top - 18;
      const room = st.feet - st.top, natural = W / PHONE.fit;
      st.bare = room < (STACK_H + OVER.phone) * natural;
      st.over = st.bare ? OVER.bare : OVER.phone;
      const pxu = Math.min(natural, room / (STACK_H + st.over));
      st.tall = pxu >= SMALL.phone;
      far.fit = st.tall ? W / pxu : PHONE.fit;
      if (!st.tall) { far.cy = PHONE.cy; st.bare = false; }
      return;
    }
    const deep = ghost(words[0], (copy) => {
      const ps = [...copy.children];
      let low = 0;
      ps.forEach((p, i) => { ps.forEach((q, j) => { q.style.animation = 'none'; q.classList.toggle('is-on', i === j); }); low = Math.max(low, copy.getBoundingClientRect().bottom); });
      return low;
    });
    const high = ghost(words[1], (copy) => { copy.querySelector('.ail-lu__guest').classList.remove('is-on'); return copy.getBoundingClientRect().top; });
    st.top = deep + 12; st.feet = high - 92;                                 // 92: an answer of two lines and its lamp
    st.over = OVER.wide;
    const pxu = (st.feet - st.top) / (STACK_H + st.over);
    st.tall = pxu >= SMALL.wide;
    seat.limit(st.tall ? pxu * ROW_SPAN : Infinity);
  }
  const onResize = () => { st.laid = false; };
  window.addEventListener('resize', onResize);

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
  const axisX = () => edge(towers[0], -1) - (phone ? STUB : 1.8);      // left of the first stack's ledge and its character
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

  // i is the lit floor, or -1 when all nine rest (the section's last stretch)
  function light(i, quiet) {
    if (i === st.lit) return;
    st.lit = i;
    says.forEach((p, k) => p.classList.toggle('is-on', k === i));
    rowsEl.forEach((tr, k) => tr.classList.toggle('is-lit', k === i));
    layers.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    guestLine.classList.toggle('is-on', i >= 0 && rowsEl[i].hasAttribute('data-guest'));
    // its swatches are the other colours on this floor's signs, whoever's they are (round 3, F3-2: it was always clay)
    const others = i < 0 ? [] : [...new Set($$('.ail-lu__cell[data-guest]', rowsEl[i]).flatMap((td) => td.dataset.guest.split(' ')))];
    $$('.ail-sw--guest', guestLine).forEach((sw, k) => { if (others[k]) sw.dataset.p = others[k]; else sw.removeAttribute('data-p'); });
    $$('.ail-map__col').forEach((col) => [...col.children].forEach((cell, k) => cell.toggleAttribute('data-row', k === i)));
    if (!quiet && i >= 0) announce(says[i].textContent.trim());
  }
  const fromScroll = (u) => (u >= FIRST + STEP * N ? -1 : Math.max(0, Math.min(N - 1, Math.floor((u - FIRST) / STEP))));
  const pick = (i) => { st.sel = (i + N) % N; st.selAt = st.u; light(st.sel); };
  const company = (t) => { st.co = t; cells.forEach((list) => list.forEach((td, k) => td.classList.toggle('is-dim', t >= 0 && k !== t))); };

  const onAxis = (e) => { const b = e.target.closest('.ail-lu__layer'); if (b) pick(Number(b.dataset.i)); };
  const onOver = (e) => { const b = e.target.closest('.ail-lu__layer'); if (b && !phone) { st.hover = Number(b.dataset.i); st.hoverAt = st.u; } };
  const onOut = (e) => { if (e.target.closest('.ail-lu__layer')) st.hover = -1; };
  const onToggle = (e) => { if (e.target.open && st.lit >= 0) { pick(st.lit); company(cells[st.lit].indexOf(e.target.closest('td'))); } };
  // arrows: up and down move the floor, left and right the company in focus (SPEC 2.3)
  const onKey = (e) => {
    if (sec !== ctx.clock.current || !el.contains(document.activeElement)) return;
    const dy = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    const dx = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (dy) { e.preventDefault(); pick(Math.max(0, st.lit) + dy); (phone ? layers[st.sel] : document.activeElement.closest('td') ? $('summary', cells[st.sel][Math.max(0, st.co)]) : layers[st.sel]).focus(); }
    if (dx) { e.preventDefault(); pick(Math.max(0, st.lit)); const t = (Math.max(-1, st.co) + dx + order.length) % order.length; company(t); $('summary', cells[st.sel][t]).focus(); }
    if (e.key === 'Escape') { $$('details[open]', el).forEach((d) => { d.open = false; }); company(-1); }
  };
  // a click on a stack opens its world: the lens grows into the iris on the way
  const onClick = (e) => {
    if (sec !== ctx.clock.current || e.target.closest('a, button, summary, details, header, nav')) return;
    const hit = row.pick(e.clientX, e.clientY);
    if (!hit) return;
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
    const f = labels.project(tw.floors[i].mesh.getWorldPosition(v).setX(v.x - FLOOR.w / 2));       // the drawn slab itself
    const pos = geo.attributes.position;
    const t = towers.indexOf(tw);
    const k = (i * (towers.length + 1) + t) * 2 + 1;              // the segment that ends at this stack's left side
    const d = labels.project(v.set(pos.getX(k), pos.getY(k), pos.getZ(k)));
    return { floor: [+f.x.toFixed(1), +f.y.toFixed(1)], line: [+d.x.toFixed(1), +d.y.toFixed(1)] };
  }));
  // (signs: what each board shows now: how far it is raised, the sign drawn on it and how much of that sign is out)
  const signs = () => bays.map((b) => ({ rise: +b.rise.toFixed(2), sign: b.key, out: +b.flip.toFixed(2) }));
  ctx.state.compare = { ...(ctx.state.compare || {}), lineup: { get lit() { return st.lit; }, get tall() { return st.tall; }, probe, signs, show: (i) => pick(i), floorAt: fromScroll } };

  return {
    stops: [0.12, 0.31, 0.5, 0.69, 0.88],
    enter() { pins.forEach((p) => { p.on = true; }); st.sel = -1; st.hover = -1; st.laid = false; },
    leave() {
      pins.forEach((p) => { p.on = false; });
      if (st.full) { st.full = false; document.documentElement.removeAttribute('data-full'); }
      lines.visible = false; litLine.visible = false;
      if (lens) lens.close(true);
      company(-1);
      $$('.ail-map__col i[data-row]').forEach((c) => c.removeAttribute('data-row'));
    },
    update(t, dt, u) {
      // in and out over the section's edges, so the neighbours meet it with nothing jumping
      const k = smooth(span(u, 0, FIRST)) * (1 - smooth(span(u, FIRST + STEP * N, sec.screens)));
      st.k = k; st.u = u;
      if (!st.laid) lay();
      // a lid plate's top is what level() keeps under the words: with the boards raised, the sign's or the board's
      const extra = st.tall ? st.over - LID_TOP : 0;
      if (!phone) seat.level(st.top, st.feet, 0.7, extra);
      else if (st.tall) level(ctx, far, st.top, st.feet, st.feet / window.innerHeight, extra);
      rig.mix(rig.stops.row, phone ? far : WIDE, k);

      // hover a floor of any stack: that floor lights across all five, and that company comes forward
      if (!phone && !input.touch && input.moved && k > 0.5) {
        const hit = row.pick(input.px, input.py);
        if (hit) { st.hover = hit.i; st.hoverAt = u; company(order.indexOf(hit.tower.id)); }
        else if (st.hover >= 0 && !el.querySelector('.ail-lu__layer:hover')) { st.hover = -1; if (!el.querySelector('details[open]')) company(-1); }
        ctx.canvas.style.cursor = hit ? 'pointer' : '';
      }
      // the scroll picks the floor. A visitor's own pick holds until the scroll has moved a tenth of a screen
      if (st.hover >= 0 && Math.abs(u - st.hoverAt) > HOLD) st.hover = -1;
      if (st.sel >= 0 && Math.abs(u - st.selAt) > HOLD) { st.sel = -1; $$('details[open]', el).forEach((d) => { d.open = false; }); company(-1); }
      const lit = st.hover >= 0 ? st.hover : st.sel >= 0 ? st.sel : fromScroll(u);
      light(lit, st.sel < 0);
      // a floor that also explains a guest's colour stands at the word cap: the chrome's chip drops a word there
      const full = guestLine.classList.contains('is-on');
      if (full !== st.full) { st.full = full; document.documentElement.toggleAttribute('data-full', full); }

      // whatever lights a floor changes the signs. With all nine at rest (the section's end) the boards go down
      const up = st.tall && lit >= 0 && k > 0.5;
      bays.forEach((b, n) => { b.up = up ? 1 : 0; b.tile = up ? tiles[n][lit] : null; b.low = st.bare && k > 0.5; });
      const open = smooth(span(u, 0, 0.25)) * (1 - smooth(span(u, sec.screens - 0.14, sec.screens)));
      towers.forEach((tw, n) => {
        tw.spread = open;                                          // semi-open: the nine floors read apart
        if (st.co >= 0 && n !== st.co) tw.dim = 0.35 * k;         // the glass of the other four falls back. A mark plate never dims
        if (phone) { tw.shift = ROW_X[n] * (SQUEEZE - 1) * k; tw.char.show = 1 - k; if (st.bare && k > 0.5) tw.lid.show = 0; }
        tw.floors.forEach((f, i) => {
          if (lit < 0) return;
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
      window.removeEventListener('resize', onResize);
      seat.drop();
      if (st.full) document.documentElement.removeAttribute('data-full');
      pins.forEach((p) => p.drop());
      if (lens) lens.drop();
      ctx.scene.remove(lines, litLine);
      geo.dispose(); litGeo.dispose(); lines.material.dispose(); litLine.material.dispose();
      if (ctx.state.compare) delete ctx.state.compare.lineup;
    },
  };
}
