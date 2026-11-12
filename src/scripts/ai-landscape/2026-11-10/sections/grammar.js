// The nine layers, taught once (SPEC 2.2): the five stacks close into one neutral grey stack and a request drops
// through it as an ink thread. Nine stops of 0.4 screens after a 0.3 lead-in, in three camera acts. One layer's
// words at a time, its glyph lit on its floor, a chip by the thread head that shows what the request has become.
// In the last 0.2 the answer climbs back as a pale line, and the five come back around the grey stack.
import { Raycaster, Vector2, Vector3 } from 'three';
import { easeIO, lerp, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { LAYER_IDS } from '../scene/glyphs.js';
import { createTower, FLOOR } from '../scene/stack.js';
import { HOURS } from '../scene/studio.js';
import { owner } from '../worlds/index.js';

const RAD = Math.PI / 180;
const LEAD = 0.3, STEP = 0.4, N = 9, END = LEAD + N * STEP;      // in screens: the lead-in, one floor, where the ninth ends
const GAP = 0.455;                                                 // the stack opens this much above and below the active floor
// The three acts: where the camera stands around the stack (degrees, distance, height over the active floor or a
// fixed height), how far above that floor it looks, and the lamp. Two acts are joined on an arc 0.25 screens long.
const ACTS = [
  { az: -23, r: 15.2, up: 3.9, look: -1.0, lamp: [0.05, 1, -0.12], warm: 0 },           // what you meet: front left, high, noon
  { az: 34, r: 12.2, up: 0.45, look: -0.1, lamp: [0.4, 0.75, 0.6], warm: 0.4 },         // what does the work: right, close, level
  { az: -22, r: 15.5, y: 0.6, look: 0.55, lamp: [-0.35, 0.34, -0.72], warm: 0.7 },       // where and with whom: low left, late
];
const TURNS = [[1.42, 1.67], [2.62, 2.87]];

export function create(ctx, el, sec) {
  const { rig, row, studio, labels, thread, input } = ctx;
  const sp = createTower(ctx, { id: 'specimen', owner: owner('house'), cells: Array.from({ length: N }, () => ({ s: 'solid', g: [] })), ownerOf: owner });
  sp.group.visible = false;
  ctx.scene.add(sp.group);
  const signs = LAYER_IDS.map((name) => { const m = ctx.textures.glyphPlane(name, 0.2, { tint: '#F8F9FB' }); sp.group.add(m); return m; });
  const answer = ctx.createThread({ radius: 0.008 });
  const hands = [-1, 1].map((dir) => ({ dir, line: ctx.createThread({ max: 4, radius: 0.012 }), to: new Vector3() }));     // delegation: lines leave
  const ask = $('.ail-gram__ask', el), close = $('.ail-gram__close', el), chip = $('.ail-gram__chip', el);
  const items = $$('.ail-layer', el);
  const icons = $$('svg', chip);
  const cols = $$('.ail-map__col');
  const pts = Array.from({ length: N + 2 }, () => new Vector3());
  const back = [...pts].reverse();
  const raise = new Array(N).fill(0);
  const lamp = new Vector3();
  const tmp = new Vector3();
  const st = { a: -2, reached: -1, sign: -1 };
  const yOf = (k) => sp.floors[k].y + raise[k];
  const askPin = ctx.phone ? null : labels.pin(ask, pts[0], { ax: 0.5, ay: 1, dy: -16 });
  // under reduced motion the thread is drawn whole, so the chip marks the floor being read and not the thread's end
  const chipPin = labels.pin(chip, () => (ctx.reduced && st.a >= 0 ? pts[st.a + 2] : thread.pos), { ax: 1, ay: 0.5, dx: -18 });

  const show = (node, o) => { node.style.opacity = o.toFixed(3); node.classList.toggle('is-on', o > 0.01); };
  function setActive(a) {
    if (a === st.a) return;
    st.a = a;
    items.forEach((li, k) => { li.classList.toggle('is-on', k === a); if (k !== a) $('details', li).open = false; });
    cols.forEach((col) => [...col.children].forEach((cell, k) => cell.toggleAttribute('data-row', k === a)));
    if (a >= 0) announce(['n', 'name', 'say'].map((part) => $(`.ail-layer__${part}`, items[a]).textContent.trim()).join(' '));
  }

  // click a floor: the thread jumps there. Escape closes a layer's second depth
  const ray = new Raycaster();
  const ndc = new Vector2();
  const pick = (x, y) => {
    const box = ctx.canvas.getBoundingClientRect();
    ndc.set(((x - box.left) / box.width) * 2 - 1, 1 - ((y - box.top) / box.height) * 2);
    ray.setFromCamera(ndc, ctx.camera);
    const hit = sp.group.visible ? ray.intersectObjects(sp.floors.map((f) => f.mesh), false)[0] : null;
    return hit ? hit.object.userData.i : -1;
  };
  const onClick = (e) => {             // on the window: a click on the scene lands on <main>, which lies over the canvas
    const k = ctx.clock.current === sec && !e.target.closest('a, button, summary, header, nav') ? pick(e.clientX, e.clientY) : -1;
    if (k >= 0) ctx.scrollTo(sec.id, LEAD + (k + 0.6) * STEP);
  };
  const onKey = (e) => { if (e.key === 'Escape' && ctx.clock.current === sec) $$('details[open]', el).forEach((d) => { d.open = false; }); };
  window.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);

  // The camera for a point between the acts (0 to 2), looking at height y. Polar, so a move between acts is an arc.
  function stand(act, y) {
    const k0 = Math.min(1, Math.floor(act)), k = act - k0, a = ACTS[k0], b = ACTS[k0 + 1];
    const az = lerp(a.az, b.az, k) * RAD, r = lerp(a.r, b.r, k);
    lamp.set(...a.lamp).lerp(tmp.set(...b.lamp), k);
    return { pos: [r * Math.sin(az), lerp(a.y ?? y + a.up, b.y ?? y + b.up, k), r * Math.cos(az)], look: [0, y + lerp(a.look, b.look, k), 0],
      fov: 24, cx: ctx.phone ? 0.5 : 0.59, cy: 0.33, fit: 4.7, warm: lerp(a.warm, b.warm, k) };
  }

  return {
    stops: [0.22, ...Array.from({ length: N }, (_, k) => LEAD + (k + 0.6) * STEP), END + 0.1].map((u) => u / sec.screens),
    leave() {
      sp.group.visible = false;
      answer.show = 0; answer.update();
      for (const h of hands) { h.line.show = 0; h.line.update(); }
      setActive(-1);
      for (const node of [ask, close, chip]) { node.style.opacity = ''; node.classList.remove('is-on'); }
      ctx.canvas.style.cursor = '';
    },
    update(t, dt, u) {
      const i = Math.min(N - 1, Math.max(0, Math.floor((u - LEAD) / STEP)));
      // where the thread's head is, as a point of its path: 0 the sentence, 1 over the lid, 2 the first floor
      const f = u < LEAD ? smooth(span(u, 0.1, 0.28)) : 1 + i + easeIO(span((u - LEAD - i * STEP) / STEP, 0, 0.35));
      const pf = f - 2;
      const done = smooth(span(u, END + 0.13, END + 0.2));
      const away = smooth(span(u, 0, 0.24)) * (1 - done);
      const there = smooth(span(away, 0.3, 0.85));

      // the five slide out to the sides. The middle one has nowhere to go: it gives its place to the grey stack
      for (const tw of row.towers) {
        const side = Math.sign(tw.x);
        tw.shift = side * 20 * away * away;
        if (side) continue;
        tw.show = 1 - there;
        tw.lid.show = 1 - smooth(span(away, 0, 0.35)); tw.char.scale = 1 - smooth(span(away, 0, 0.4));
      }
      row.datum = 1 - smooth(span(u, 0, 0.1));
      sp.reset(); sp.show = there;
      const shut = 1 - smooth(span(u, END, END + 0.1));
      let sum = 0;
      for (let k = N - 2; k >= 0; k--) { sum += GAP * (1 - smooth(Math.abs(pf - (k + 0.5)) - 0.5)) * there * shut; raise[k] = sum; }
      const a = u >= LEAD && u < END ? i : -1;
      const reached = Math.floor(pf + 0.04);
      if (reached !== st.reached) { if (reached > st.reached && sp.floors[reached]) sp.floors[reached].pulse = 0.85; st.reached = reached; }
      // the chip shows what the request has become: the sign of the floor its head is in, changed on arrival
      const sign = Math.max(0, Math.min(N - 1, Math.round(pf)));
      if (sign !== st.sign) { st.sign = sign; icons.forEach((svg, k) => svg.classList.toggle('is-on', k === sign)); }
      sp.floors.forEach((fl, k) => {
        fl.raise = raise[k];
        if (k === a) fl.lit = 0.26; else if (a >= 0) fl.dim = 0.12;
        signs[k].position.set(0, yOf(k), FLOOR.w / 2 + 0.012);
        signs[k].material.uniforms.uOpacity.value = there * (k === a ? 1 : 0.34);
      });
      sp.apply(dt);
      const topY = yOf(0) + FLOOR.h / 2;
      const cast = studio.casters[5];
      cast.x = 0; cast.z = 0; cast.h = topY; cast.gap = (topY - N * FLOOR.h) / (N - 1); cast.amt = there; cast.color.set('#8C929C');

      // the thread: from the sentence, over the lid, through the centre of every floor. The answer comes back up it
      pts[0].set(0, topY + 1.5, 0); pts[1].set(0, topY + 0.32, 0);
      for (let k = 0; k < N; k++) pts[k + 2].set(0, yOf(k), 0);
      const drawn = there * smooth(span(u, 0.08, 0.14)) * (1 - smooth(span(u, END + 0.1, END + 0.16)));
      thread.points = pts; thread.at(ctx.reduced ? N + 1 : f); thread.show = drawn;
      const up = span(u, END, END + 0.11);
      answer.points = back; answer.at(easeIO(up) * (N + 1)); answer.dark = 1; answer.show = up > 0 ? drawn : 0;
      answer.update();
      // on the delegation floor two lines leave the stack, one to each side: the work handed to other agents
      const out = a === 7 ? easeIO(span((u - LEAD - 7 * STEP) / STEP, 0.36, 0.86)) : 0;
      for (const h of hands) {
        h.line.points = [pts[9], h.to.set(h.dir * 4.4, pts[9].y, 0)];
        h.line.at(out); h.line.show = out > 0 ? drawn : 0;
        h.line.update();
      }

      // camera and lamp: three acts joined on arcs, in from the row and back out to it
      const y = pf <= 0 ? yOf(0) : lerp(yOf(Math.floor(pf)), yOf(Math.min(N - 1, Math.floor(pf) + 1)), pf - Math.floor(pf));
      const stop = stand(TURNS.reduce((n, [from, to]) => n + easeIO(span(u, from, to)), 0), y);
      const w = easeIO(span(u, 0.02, LEAD)) * (1 - easeIO(span(u, END - 0.02, END + 0.14)));
      rig.mix(rig.stops.row, stop, w);
      studio.lamp.set(...HOURS.hero).lerp(lamp, w);
      studio.warmth = stop.warm * w;

      // words: the request while the thread drops, then one layer at a time, then the closing line with the request
      setActive(a);
      const back2 = smooth(span(u, END + 0.03, END + 0.08)) * (1 - smooth(span(u, END + 0.15, END + 0.2)));
      show(ask, smooth(span(u, 0.05, 0.14)) * (1 - span(u, 0.23, 0.29)) + back2);
      show(close, smooth(span(u, END, END + 0.05)) * (1 - smooth(span(u, END + 0.15, END + 0.2))));
      show(chip, drawn * smooth(span(f, 1.5, 1.9)) * (1 - span(u, END, END + 0.03)));
      if (!input.touch && input.moved) ctx.canvas.style.cursor = pick(input.px, input.py) >= 0 ? 'pointer' : '';
    },
    dispose() {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      if (askPin) askPin.drop();
      chipPin.drop();
      for (const m of signs) { m.geometry.dispose(); m.material.dispose(); }
      sp.dispose();
      answer.dispose();
      for (const h of hands) h.line.dispose();
    },
  };
}
