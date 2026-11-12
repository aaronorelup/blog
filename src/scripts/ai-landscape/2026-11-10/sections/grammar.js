// The nine layers, taught once (SPEC 2.2): the five stacks close into one neutral grey stack and a request drops
// through it as an ink thread, in three camera acts. A floor is triggered at its scroll boundary: its words, its
// glyph, the chip and the lifted floor change together and the thread head eases there in 0.42 s. The request stays
// pinned, the passed floors stay listed. Then the answer climbs back and the five return around the grey stack.
import { Raycaster, Vector2, Vector3 } from 'three';
import { easeIO, lerp, smooth, span } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { LAYER_IDS } from '../scene/glyphs.js';
import { createTower, FLOOR } from '../scene/stack.js';
import { HOURS } from '../scene/studio.js';
import { owner } from '../worlds/index.js';

const RAD = Math.PI / 180;
// in screens: where each floor starts, and where the ninth ends. 0.28 a floor, and half as much again for Model
const BOUNDS = [0.25, 0.53, 0.81, 1.09, 1.37, 1.80, 2.08, 2.36, 2.64, 2.92];
const N = 9, LEAD = BOUNDS[0], END = BOUNDS[N];
const HEAD = 0.42;                                                 // seconds the thread head takes to reach a new floor
const GAP = 0.455;                                                 // the stack opens this much above and below the active floor
// The three acts: where the camera stands around the stack (degrees, distance, height over the active floor or a
// fixed height), how far above that floor it looks, and the lamp. Two acts are joined on an arc 0.25 screens long.
const ACTS = [
  { az: -23, r: 15.2, up: 3.9, look: -1.0, lamp: [0.05, 1, -0.12], warm: 0 },           // what you meet: front left, high, noon
  { az: 34, r: 12.2, up: 0.45, look: -0.1, lamp: [0.4, 0.75, 0.6], warm: 0.4 },         // what does the work: right, close, level
  { az: -22, r: 15.5, y: 0.6, look: 0.55, lamp: [-0.35, 0.34, -0.72], warm: 0.7 },       // where and with whom: low left, late
];
const TURNS = [[0.965, 1.215], [1.955, 2.205]];                    // a quarter screen each, centred on the fourth and the seventh floor's start

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
  const past = $('.ail-gram__past', el);
  const passed = $$('li', past);
  const icons = $$('svg', chip);
  const cols = $$('.ail-map__col');
  const pts = Array.from({ length: N + 2 }, () => new Vector3());
  const back = [...pts].reverse();
  const raise = new Array(N).fill(0);
  const lamp = new Vector3();
  const tmp = new Vector3();
  const st = { a: -2, reached: -1, head: 0, from: 0, to: 0, t: 1 };
  const yOf = (k) => sp.floors[k].y + raise[k];
  // under reduced motion the thread is drawn whole, so the chip marks the floor being read and not the thread's end
  const chipPin = labels.pin(chip, () => (ctx.reduced && st.a >= 0 ? pts[st.a + 2] : thread.pos), { ax: 1, ay: 0.5, dx: -18 });

  const show = (node, o) => { node.style.opacity = o.toFixed(3); node.classList.toggle('is-on', o > 0.01); };
  function setActive(a) {
    if (a === st.a) return;
    st.a = a;
    items.forEach((li, k) => { li.classList.toggle('is-on', k === a); if (k !== a) $('details', li).open = false; });
    cols.forEach((col) => [...col.children].forEach((cell, k) => cell.toggleAttribute('data-row', k === a)));
    icons.forEach((svg, k) => svg.classList.toggle('is-on', k === a));          // the chip shows the floor being read
    // the floors already passed stay listed above the caption (on a phone, as a row in the sheet)
    passed.forEach((li, k) => li.classList.toggle('is-on', a >= 0 && k < a));
    if (!ctx.phone && a >= 0) past.style.bottom = `${(window.innerHeight - items[a].getBoundingClientRect().top + 16).toFixed(0)}px`;
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
    const b = e.target.closest('.ail-gram__past button');
    const k = b ? Number(b.dataset.i) : ctx.clock.current === sec && !e.target.closest('a, button, summary, header, nav') ? pick(e.clientX, e.clientY) : -1;
    if (k >= 0) ctx.scrollTo(sec.id, BOUNDS[k] + 0.1);
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
    stops: [0.18, ...Array.from({ length: N }, (_, k) => (BOUNDS[k] + BOUNDS[k + 1]) / 2), END + 0.12].map((u) => u / sec.screens),
    leave() {
      sp.group.visible = false;
      answer.show = 0; answer.update();
      for (const h of hands) { h.line.show = 0; h.line.update(); }
      setActive(-1);
      for (const node of [ask, close, chip]) { node.style.opacity = ''; node.classList.remove('is-on'); }
      st.to = 0; st.head = 0; st.t = 1;
      ctx.canvas.style.cursor = '';
    },
    update(t, dt, u) {
      const i = Math.min(N - 1, Math.max(0, BOUNDS.findIndex((b) => u < b) - 1 + (u >= END ? N + 1 : 0)));
      // where the thread's head is, as a point of its path: 0 the sentence, 1 over the lid, 2 the first floor. The
      // lead-in follows the scroll. From the first floor on a boundary sets the target and the head eases there on time
      const want = u < LEAD ? smooth(span(u, 0.1, LEAD)) : 2 + i;
      if (u < LEAD) { st.head = want; st.to = want; st.t = 1; }
      else if (want !== st.to) { st.from = st.head; st.to = want; st.t = 0; }
      if (st.t < 1) { st.t = ctx.reduced ? 1 : Math.min(1, st.t + dt / HEAD); st.head = lerp(st.from, st.to, easeIO(st.t)); }
      const f = st.head;
      const pf = f - 2;
      // the five come back over the last quarter of a screen, so the line-up arrives and never pops in
      const done = smooth(span(u, sec.screens - 0.25, sec.screens));
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
      const shut = 1 - smooth(span(u, END, END + 0.12));
      let sum = 0;
      for (let k = N - 2; k >= 0; k--) { sum += GAP * (1 - smooth(Math.abs(pf - (k + 0.5)) - 0.5)) * there * shut; raise[k] = sum; }
      const a = u >= LEAD && u < END ? i : -1;
      const reached = Math.floor(pf + 0.04);
      if (reached !== st.reached) { if (reached > st.reached && sp.floors[reached]) sp.floors[reached].pulse = 0.85; st.reached = reached; }
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
      const drawn = there * smooth(span(u, 0.08, 0.14)) * (1 - smooth(span(u, END + 0.16, END + 0.24)));
      thread.points = pts; thread.at(ctx.reduced ? N + 1 : f); thread.show = drawn;
      const up = span(u, END, END + 0.15);
      answer.points = back; answer.at(easeIO(up) * (N + 1)); answer.dark = 1; answer.show = up > 0 ? drawn : 0;
      answer.update();
      // on the delegation floor two lines leave the stack, one to each side: the work handed to other agents
      const out = a === 7 ? easeIO(span(u, BOUNDS[7] + 0.08, BOUNDS[7] + 0.2)) : 0;
      for (const h of hands) {
        h.line.points = [pts[9], h.to.set(h.dir * 4.4, pts[9].y, 0)];
        h.line.at(out); h.line.show = out > 0 ? drawn : 0;
        h.line.update();
      }

      // camera and lamp: three acts joined on arcs, in from the row and back out to it
      const y = pf <= 0 ? yOf(0) : lerp(yOf(Math.floor(pf)), yOf(Math.min(N - 1, Math.floor(pf) + 1)), pf - Math.floor(pf));
      const stop = stand(TURNS.reduce((n, [from, to]) => n + easeIO(span(u, from, to)), 0), y);
      const w = easeIO(span(u, 0.02, LEAD)) * (1 - easeIO(span(u, END, END + 0.22)));
      rig.mix(rig.stops.row, stop, w);
      studio.lamp.set(...HOURS.hero).lerp(lamp, w);
      studio.warmth = stop.warm * w;

      // words: the request while the thread drops, then one layer at a time, then the closing line with the request
      setActive(a);
      // the request is the premise: in by 0.12, pinned under the chrome until the answer has come back
      show(ask, smooth(span(u, 0.05, 0.12)) * (1 - smooth(span(u, 2.95, 3.0))));
      show(close, smooth(span(u, END, END + 0.05)) * (1 - smooth(span(u, sec.screens - 0.1, sec.screens))));
      show(chip, drawn * smooth(span(f, 1.5, 1.9)) * (1 - span(u, END, END + 0.03)));
      if (!input.touch && input.moved) ctx.canvas.style.cursor = pick(input.px, input.py) >= 0 ? 'pointer' : '';
    },
    dispose() {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      chipPin.drop();
      for (const m of signs) { m.geometry.dispose(); m.material.dispose(); }
      sp.dispose();
      answer.dispose();
      for (const h of hands) h.line.dispose();
    },
  };
}
