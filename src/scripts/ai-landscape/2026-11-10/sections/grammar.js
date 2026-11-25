// The nine layers, taught once (SPEC 2.2): the five stacks close into one stack of nine greys, light at the top and
// dark at the bottom, and a request drops through it as an ink thread, in three camera acts. A floor is triggered at
// its scroll boundary: its words, its glyph, its paper number, its object and the lifted floor change together. Then
// the answer climbs back, the stack sinks until two floors stand above the ground, and the five return around it.
import { Quaternion, Raycaster, Vector2, Vector3 } from 'three';
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
// nine floors, nine greys: no hue, because in the lesson a floor belongs to nobody. Ink glyphs on the three lightest
const GREYS = ['#C9CDD5', '#B6BBC4', '#A3A8B2', '#9096A0', '#7D838E', '#6A707B', '#585D68', '#464B55', '#353942'];
const INK = '#0C0D10', PAPER = '#F8F9FB';
const SINK = 7 * (FLOOR.h + FLOOR.gap0);                            // seven floors and seven gaps go under: two floors stay above the ground
// the close, in screens after the ninth floor: the stack shuts and the answer climbs, the thread leaves, the stack
// sinks, two floors hold, the camera goes back to the row (the five return over the section's last 0.2 screens)
const CLOSE = { shut: 0.1, answer: 0.11, thread: [0.1, 0.14], sink: [0.12, 0.26], back: [0.38, 0.52], still: 0.32 };
// the paper floor number: where its middle stands in the window and how tall it is, as shares of the window
const NUM = { wide: { x: 0.215, y: 0.36, h: 0.42 }, phone: { x: 0.8, y: 0.17, h: 0.2 }, far: 20, flip: 0.24 };
const SPIN = 0.6, GLOW = 0.9;                                       // the cores: radians a second, and seconds each one glows

export function create(ctx, el, sec) {
  const { rig, row, studio, labels, thread, input, prims } = ctx;
  const sp = createTower(ctx, { id: 'specimen', owner: owner('house'), cells: Array.from({ length: N }, () => ({ s: 'solid', g: [] })), ownerOf: owner });
  sp.group.visible = false;
  ctx.scene.add(sp.group);
  sp.floors.forEach((f, k) => ctx.mats.setOwner(f.mat, { glass: GREYS[k], rim: '#FFFFFF', glow: '#FFFFFF' }));
  const signs = LAYER_IDS.map((name, k) => { const m = ctx.textures.glyphPlane(name, 0.2, { tint: k < 3 ? INK : PAPER }); sp.group.add(m); return m; });
  const grow = new Array(N).fill(0);
  // the page's own objects, in house neutrals, each on the floor it belongs to: three doors on the interface, three
  // cores circling in the model, four sockets on the tools (three seated), three lamps lit on the compute floor
  const doors = prims.doors(sp, 3);
  const cores = prims.cores(sp, 4, [['house', 'released'], ['house', 'released'], ['house', 'released']], { ring: 0.55, radius: 0.078, ghost: true });
  const sockets = prims.sockets(sp, 5, [true, true, true, false]);
  const lamps = prims.lamps(sp, 6, ['yes', 'yes', 'yes'], { flat: true });
  for (const c of cores.items) c.mesh.material.uniforms.uColor.value.set('#C9CDD5');
  // (the lesson's camera is level with the tools floor and to its right, so its sockets are ports in its right side)
  const plugs = sockets.items[0].ring.parent, bulbs = lamps.items[0].mesh.parent;
  plugs.rotation.set(Math.PI / 2, 0, -Math.PI / 2); plugs.scale.setScalar(0.5); bulbs.scale.setScalar(0.9);
  for (const it of sockets.items) if (it.disc) it.disc.material.uniforms.uColor.value.set(PAPER);
  sockets.dark = 1;                                                  // paper rings: the tools floor is a dark grey
  const things = [{ i: 0, set: doors, k: 0 }, { i: 4, set: cores, k: 0 }, { i: 5, set: sockets, k: 0 }, { i: 6, set: lamps, k: 0 }];
  // the floor number, cut from paper: it rides the camera, far behind the stack, so it never slides across the frame
  const num = studio.word();
  if (!ctx.camera.parent) ctx.scene.add(ctx.camera);
  num.attach(ctx.camera);
  const still = new Quaternion();
  const fwd = new Vector3(), upV = new Vector3();
  const answer = ctx.createThread({ radius: 0.008 });
  const hands = [-1, 1].map((dir) => ({ dir, line: ctx.createThread({ max: 4, radius: 0.012 }), to: new Vector3() }));     // delegation: lines leave
  const ask = $('.ail-gram__ask', el), close = $('.ail-gram__close', el), chip = $('.ail-gram__chip', el);
  const items = $$('.ail-layer', el);
  const nums = items.map((li) => $('.ail-layer__n', li).textContent.trim());
  const past = $('.ail-gram__past', el);
  const passed = $$('li', past);
  const icons = $$('svg', chip);
  const cols = $$('.ail-map__col');
  const pts = Array.from({ length: N + 2 }, () => new Vector3());
  const back = [...pts].reverse();
  const raise = new Array(N).fill(0);
  const lamp = new Vector3();
  const tmp = new Vector3();
  const st = { a: -2, reached: -1, head: 0, from: 0, to: 0, t: 1, nto: -1, nt: 1, spin: 0 };
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
  // the test hook: the paper number on show, how far the stack has sunk, and each floor's grey and height over the ground
  ctx.state.lesson = {
    get number() { return num.show > 0.5 && num.squash > 0.5 ? num.text : ''; },
    get sunk() { return -sp.lift; },
    floors: () => sp.floors.map((f) => ({ grey: `#${f.u.uColor.value.getHexString()}`, y: +(f.mesh.position.y + sp.lift).toFixed(3) })),
  };

  // The camera for a point between the acts (0 to 2), looking at height y. Polar, so a move between acts is an arc.
  function stand(act, y) {
    const k0 = Math.min(1, Math.floor(act)), k = act - k0, a = ACTS[k0], b = ACTS[k0 + 1];
    const az = lerp(a.az, b.az, k) * RAD, r = lerp(a.r, b.r, k);
    lamp.set(...a.lamp).lerp(tmp.set(...b.lamp), k);
    return { pos: [r * Math.sin(az), lerp(a.y ?? y + a.up, b.y ?? y + b.up, k), r * Math.cos(az)], look: [0, y + lerp(a.look, b.look, k), 0],
      fov: 24, cx: ctx.phone ? 0.5 : 0.59, cy: 0.33, fit: 4.7, warm: lerp(a.warm, b.warm, k) };
  }

  return {
    stops: [0.18, ...Array.from({ length: N }, (_, k) => (BOUNDS[k] + BOUNDS[k + 1]) / 2), END + CLOSE.still].map((u) => u / sec.screens),
    leave() {
      sp.group.visible = false;
      answer.show = 0; answer.update();
      for (const h of hands) { h.line.show = 0; h.line.update(); }
      for (const th of things) { th.k = 0; th.set.show = 0; th.set.update(); }
      num.hide(); st.nto = -1; st.nt = 1;
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
      // the five come back over the last fifth of a screen, so the line-up arrives and never pops in
      const done = smooth(span(u, sec.screens - 0.2, sec.screens));
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
      // the close: once the answer is back the shut stack sinks until two floors stand above the ground
      const sink = easeIO(span(u, END + CLOSE.sink[0], END + CLOSE.sink[1]));
      sp.lift = -SINK * sink;
      const shut = 1 - smooth(span(u, END, END + CLOSE.shut));
      let sum = 0;
      for (let k = N - 2; k >= 0; k--) { sum += GAP * (1 - smooth(Math.abs(pf - (k + 0.5)) - 0.5)) * there * shut; raise[k] = sum; }
      const a = u >= LEAD && u < END ? i : -1;
      const reached = Math.floor(pf + 0.04);
      if (reached !== st.reached) { if (reached > st.reached && sp.floors[reached]) sp.floors[reached].pulse = 0.85; st.reached = reached; }
      const quick = ctx.reduced ? 1 : 1 - Math.exp(-dt / 0.07);          // a glyph grows, an object arrives: 0.2 s
      sp.floors.forEach((fl, k) => {
        fl.raise = raise[k];
        if (k === a) fl.lit = 0.26; else if (a >= 0) fl.dim = 0.12;
        grow[k] += ((k === a ? 1 : 0) - grow[k]) * quick;
        signs[k].position.set(0, yOf(k), FLOOR.w / 2 + 0.012);
        signs[k].scale.setScalar(1 + 0.5 * grow[k]);
        // (at the close the two floors left above the ground show their glyphs whole: they are the two you see)
        signs[k].material.uniforms.uOpacity.value = smooth(span(there, 0.5, 1)) * (k === a ? 1 : k < 2 ? lerp(0.34, 1, sink) : 0.34);
      });
      sp.apply(dt);
      // each floor's object stands only while its floor is read. The ajar door steps with the scroll, the cores circle
      doors.open = Math.min(2, Math.floor(span(u, BOUNDS[0], BOUNDS[1]) * 3));
      if (!ctx.reduced) st.spin += dt * SPIN;
      cores.spin = st.spin; cores.night = 0.05;
      const lit = ctx.reduced ? 0 : Math.floor(ctx.time / GLOW) % cores.items.length;
      cores.items.forEach((c, k) => { c.active += ((k === lit ? 1 : 0) - c.active) * (ctx.reduced ? 1 : 1 - Math.exp(-dt / 0.12)); });
      for (const th of things) {
        th.k += ((th.i === a ? 1 : 0) - th.k) * quick;
        th.set.show = there * th.k;
        th.set.update(dt);
      }
      doors.leaves[0].mesh.parent.position.x += 0.6;                     // right of the thread, which drops through the floor's middle
      const face = sp.floors[5].mesh.position;
      plugs.position.set(face.x + FLOOR.w / 2 + 0.02, face.y, 0);
      bulbs.position.x = sp.floors[6].mesh.position.x + 0.56;
      const lift = sp.lift;
      const topY = yOf(0) + FLOOR.h / 2;
      const cast = studio.casters[5];
      cast.x = 0; cast.z = 0; cast.h = topY + lift; cast.gap = (topY - N * FLOOR.h) / (N - 1); cast.amt = there; cast.color.set('#8C929C');

      // the thread: from the sentence, over the lid, through the centre of every floor. The answer comes back up it.
      // It is drawn over everything, so it has left before the stack sinks: no line shows under the floor
      pts[0].set(0, topY + 1.5 + lift, 0); pts[1].set(0, topY + 0.32 + lift, 0);
      for (let k = 0; k < N; k++) pts[k + 2].set(0, Math.max(0.02, yOf(k) + lift), 0);
      const drawn = there * smooth(span(u, 0.08, 0.14)) * (1 - smooth(span(u, END + CLOSE.thread[0], END + CLOSE.thread[1])));
      thread.points = pts; thread.at(ctx.reduced ? N + 1 : f); thread.show = drawn;
      const up = span(u, END, END + CLOSE.answer);
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
      // as the stack sinks the camera comes a fifth closer and half a unit up: the two floors left are the picture
      // (a phone, whose words stand at its foot, brings them down to the middle of the window)
      if (sink > 0) { stop.pos[0] *= 1 - 0.2 * sink; stop.pos[2] *= 1 - 0.2 * sink; stop.pos[1] += 0.5 * sink; stop.look[1] = lerp(stop.look[1], 0.5, sink); stop.cy = lerp(stop.cy, 0.5, sink); }
      const w = easeIO(span(u, 0.02, LEAD)) * (1 - easeIO(span(u, END + CLOSE.back[0], END + CLOSE.back[1])));
      rig.mix(rig.stops.row, stop, w);
      studio.lamp.set(...HOURS.hero).lerp(lamp, w);
      studio.warmth = stop.warm * w;

      // the floor number, far and large. It flips when the floor changes and steps out while the camera turns
      const place = ctx.phone ? NUM.phone : NUM.wide;
      if (a >= 0 && a !== st.nto) {
        const unseen = num.show < 0.05 || ctx.reduced || st.nto < 0;
        st.nto = a;
        if (unseen) { num.set(nums[a]); st.nt = 1; } else if (st.nt >= 0.5) st.nt = 1 - st.nt;
      }
      if (st.nt < 1) { const was = st.nt; st.nt = Math.min(1, st.nt + dt / NUM.flip); if (was < 0.5 && st.nt >= 0.5) num.set(nums[st.nto]); }
      const turning = TURNS.reduce((m, [from, to]) => { const p = span(u, from, to); return Math.min(m, p <= 0 || p >= 1 ? 1 : ctx.reduced ? 0 : Math.max(0, 1 - 3 * p, 3 * p - 2)); }, 1);
      num.show = there * turning * smooth(span(u, LEAD - 0.04, LEAD + 0.02)) * (1 - smooth(span(u, END - 0.03, END + 0.03)));
      num.squash = smooth(Math.abs(1 - 2 * st.nt));
      // it stands behind the stack and over the ground: as far as `far` (further on a phone, whose camera stands back),
      // nearer where the camera looks down and its foot would meet the floor
      const cam = ctx.camera, tan = Math.tan((cam.fov * RAD) / 2);
      const fy = 1 - 2 * (place.y - (rig.cur.cy - 0.5)), fx = 2 * (place.x - (rig.cur.cx - 0.5)) - 1;
      fwd.set(0, 0, -1).applyQuaternion(cam.quaternion); upV.set(0, 1, 0).applyQuaternion(cam.quaternion);
      const fall = -(tan * (fy - place.h) * upV.y + fwd.y);              // how fast its foot drops with distance
      let d = Math.max(NUM.far, ctx.phone ? rig.cur.dist + 3 : 0);
      if (fall > 0.001) d = Math.min(d, Math.max(1.5, (cam.position.y - 0.15) / fall));
      const nudge = input.touch || ctx.reduced ? 0 : 0.012 * d;              // a little parallax under the pointer: it is far away
      tmp.set(fx * tan * cam.aspect * d - input.x * nudge, fy * tan * d + input.y * nudge * 0.5, -d);
      num.place(tmp, still, place.h * 2 * tan * d);

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
      for (const th of things) th.set.dispose();
      num.dispose();
      delete ctx.state.lesson;
      sp.dispose();
      answer.dispose();
      for (const h of hands) h.line.dispose();
    },
  };
}
