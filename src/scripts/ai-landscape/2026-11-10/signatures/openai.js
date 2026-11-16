// OpenAI's signature moment, "hold to talk" (SPEC 2.5.2). While the button or the space bar is held, the voice
// floor lifts off the stack and a ring of sound moves on it. A second thread leaves it, drops to the delegation
// floor and splits into the workers. Letting go settles the ring at once, and the workers keep going.
// The ring is seeded noise: no microphone is ever asked for. Names and lamps are read from the page's data and HTML.
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, TorusGeometry, Vector3 } from 'three';
import { damp, smooth, span } from '../core/clock.js';
import { $, announce } from '../core/dom.js';
import { HOUSE, owner } from '../worlds/index.js';
import { FLOOR } from '../scene/stack.js';

const VOICE = 1, MODEL = 4, HANDS = 7;
const DROP = 0.42;                             // seconds a floor: the house speed of a thread
const REACH = DROP * (HANDS - VOICE);          // the second thread, from the voice floor to the delegation floor
const FAN = 0.6, WORK = 2.5, BACK = 1.0;       // it splits, the workers keep going after release, the pulse comes back
const TALK = 2.2;                              // how long the play-through holds the button by itself
const FILLED = { solid: 1, hatch: 1 };         // the states of a media socket that hold something
const SEG = 72;

export function create(ctx, world) {
  const { tower, data, cfg } = world;
  const { prims, labels, mats, thread, camera } = ctx;
  const talks = world.items(0);                // [0] the voice product the myth is about, [1] this agent's own voice
  const works = world.items(1);                // the workers the agent hands work to
  const empty = world.catchItems();            // the reason beside the empty media socket
  const worksTitle = ctx.phone ? $('.ail-sig__list[data-list="1"] .ail-sig__title', world.el) : null;      // in the phone's sheet the workers get their heading
  const go = world.button('go');
  const st = { held: false, manual: false, auto: 0, lift: 0, level: 0, t: -1, free: -1, said: false, step: 0, floor: -1, back: false, told: false, age: 0, caught: 0 };
  const sig = { lit: -1, dark: false };
  const at = new Vector3();
  const say = (li) => [...li.querySelectorAll('.ail-own, .ail-note, .ail-tag')].map((n) => n.textContent.trim()).filter(Boolean).join('. ');

  // ---- the ring of sound: three thin ribbons round the head of the visitor's thread, shaken by seeded noise
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647) * Math.PI * 2; };
  const index = [];
  for (let i = 0; i < SEG; i++) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const waves = [[0.25, 0.022, 0.9], [0.36, 0.045, 0.6], [0.47, 0.07, 0.34]].map(([radius, shake, alpha]) => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(new Float32Array((SEG + 1) * 6), 3));
    geo.setIndex(index);
    const mesh = new Mesh(geo, new MeshBasicMaterial({ color: cfg.theme.ink, transparent: true, depthTest: false, side: DoubleSide }));
    mesh.renderOrder = 18; mesh.frustumCulled = false; mesh.visible = false;
    ctx.scene.add(mesh);
    return { mesh, geo, radius, shake, alpha, ph: [rnd(), rnd(), rnd(), rnd()] };
  });
  function ring(w, level, time) {
    const p = w.geo.attributes.position;
    const loud = level * (0.3 + 0.7 * Math.pow(Math.abs(Math.sin(time * 2.1 + w.ph[3]) * Math.sin(time * 3.7 + w.ph[0])), 0.6));
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const r = w.radius + loud * w.shake * (Math.sin(3 * a + w.ph[0] + time * 4.3) * 0.5 + Math.sin(5 * a + w.ph[1] - time * 6.1) * 0.3 + Math.sin(9 * a + w.ph[2] + time * 8.7) * 0.2) * 2;
      p.setXYZ(i * 2, Math.cos(a) * (r - 0.009), Math.sin(a) * (r - 0.009), 0);
      p.setXYZ(i * 2 + 1, Math.cos(a) * (r + 0.009), Math.sin(a) * (r + 0.009), 0);
    }
    p.needsUpdate = true;
  }

  // ---- the voice floor's lamp for "calls tools itself", and the second thread that carries the work away
  const lamp = prims.lamps(tower, VOICE, [data.voice[0].tools], { side: 1 });
  const second = ctx.createThread({ max: 16 });
  const path = Array.from({ length: HANDS - VOICE + 2 }, () => new Vector3());
  const talkPins = ctx.phone ? [] : talks.map((li, n) => labels.pin(li, () => at, { dx: 18, dy: (n - (talks.length - 1) / 2) * 34, ay: 0.5 }));

  // ---- the workers: one ball for each entry of the agent's delegates, in its owner's glass, on a line from floor 8
  const ballGeo = new SphereGeometry(0.13, 28, 18);
  const rimGeo = new TorusGeometry(0.15, 0.011, 8, 44);
  const rimMat = new MeshBasicMaterial({ color: cfg.theme.ink, transparent: true });
  const hands = data.to.map((d, n) => {
    const mesh = new Mesh(ballGeo, mats.core(owner(d[0]), { side: 1 }));
    mesh.add(new Mesh(rimGeo, rimMat));                         // an ink rim, like the dot beside each name: a pale ball needs its edge
    mesh.visible = false;
    tower.group.add(mesh);
    const a = new Vector3(), b = new Vector3(), c = new Vector3();
    const arc = prims.arc(a, b, { official: d[1], lift: 0, side: 1, dots: false });
    const pin = works[n] && !ctx.phone ? labels.pin(works[n], () => c, { dx: 24, ay: 0.5 }) : null;
    return { mesh, arc, a, b, c, pin, n, k: 0, busy: 0 };
  });

  // ---- the media sockets of the catch: hoops in a plain strip that stands on the model floor. A filled one holds a
  // ball. The strip is house paper, like a mark's plate, so the hoops read against any backdrop
  const hoopGeo = new TorusGeometry(0.105, 0.012, 8, 40);
  const hoopMat = new MeshBasicMaterial({ color: cfg.theme.ink, transparent: true });
  const strip = new Mesh(new PlaneGeometry(0.3 * data.media.length + 0.08, 0.31), new MeshBasicMaterial({ color: HOUSE.floor, transparent: true }));
  strip.visible = false;
  tower.group.add(strip);
  const hoops = data.media.map((state) => {
    const mesh = new Mesh(hoopGeo, hoopMat);
    if (FILLED[state]) mesh.add(new Mesh(new SphereGeometry(0.066, 18, 12), mats.core(tower.owner, { side: 1, hatch: state === 'hatch' })), new Mesh(new TorusGeometry(0.073, 0.008, 6, 32), hoopMat));
    mesh.visible = false;
    tower.group.add(mesh);
    return mesh;
  });
  const emptyPins = ctx.phone ? [] : empty.map((li, n) => labels.pin(li, () => tower.anchor(MODEL, 1, labels.project), { dx: 46, dy: 46 + n * 31, ay: 0.5 }));
  function sockets(k) {
    const f = tower.floors[MODEL];
    hoops.forEach((mesh, n) => { mesh.visible = k > 0.02; mesh.position.set(f.slide + 0.44 + n * 0.3, f.y + FLOOR.h / 2 + 0.155, 0.76); });
    strip.visible = k > 0.02;
    strip.position.set(f.slide + 0.44 + (hoops.length - 1) * 0.15, f.y + FLOOR.h / 2 + 0.155, 0.74);
    hoopMat.opacity = Math.min(1, k * 1.4); strip.material.opacity = Math.min(1, k * 1.4) * 0.94;
    st.caught = k > 0.001 ? st.caught + (ctx.dt || 0) : 0;      // its words wait until the catch's own block has settled
    empty.forEach((li) => li.classList.toggle('is-on', k > 0.5 && (st.caught > 0.5 || ctx.reduced)));
  }

  // ---- holding and letting go. A task that has left the voice floor is nobody's to stop
  const until = () => (st.free < 0 ? 1e9 : Math.max(st.free, REACH + FAN) + WORK);              // while it is held there is no end in sight
  function press() {
    st.held = true; st.said = true;
    if (go) go.setAttribute('aria-pressed', 'true');
    if (st.t < 0 || st.t >= until()) Object.assign(st, { t: 0, floor: -1, back: false, told: false });      // a new task leaves the voice floor
    st.free = -1;                                                  // held again: the workers are not on the clock yet
    if (talks[0]) announce(say(talks[0]));
  }
  function release() {
    if (!st.held) return;
    st.held = false;
    if (go) go.setAttribute('aria-pressed', 'false');
    if (st.t >= 0 && st.free < 0) st.free = st.t;
  }
  const mine = () => { st.manual = true; st.auto = 0; };
  const onDown = (e) => { if (ctx.reduced || e.button > 0) return; mine(); go.setPointerCapture(e.pointerId); press(); };
  const onKeyDown = (e) => { if (ctx.reduced || e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return; mine(); press(); };
  const onKeyUp = (e) => { if (e.key === ' ' || e.key === 'Enter') release(); };
  // a press that was never held (a screen reader's activation) talks for a moment by itself
  const onClick = () => { if (ctx.reduced) sig.step(); else if (!st.manual) { st.auto = TALK; press(); } st.manual = false; };
  const onMenu = (e) => e.preventDefault();
  const events = [['pointerdown', onDown], ['pointerup', release], ['pointercancel', release], ['lostpointercapture', release], ['keydown', onKeyDown], ['keyup', onKeyUp], ['blur', release], ['click', onClick], ['contextmenu', onMenu]];
  if (go) { events.forEach(([name, fn]) => go.addEventListener(name, fn)); go.setAttribute('aria-pressed', 'false'); }
  // the play-through lets go for good on the first press, touch or key
  const unhear = ctx.input.onInput((kind) => { if (st.auto > 0 && kind !== 'move' && kind !== 'wheel') { st.auto = 0; release(); } });

  sig.play = () => { st.auto = TALK; press(); };
  // Reduced motion: no flight. Each press walks one stop: talking, the router, the workers, let go, the pulse home
  sig.step = () => {
    st.step = (st.step % 5) + 1;
    st.said = true; st.held = st.step < 4; st.back = st.step === 5;
    st.t = [0, DROP, REACH + FAN, REACH + FAN, REACH + FAN + WORK + BACK][st.step - 1];
    st.free = st.step < 4 ? -1 : REACH + FAN;
    if (go) go.setAttribute('aria-pressed', String(st.held));
    announce(st.step === 3 || st.step === 4 ? works.map(say).join(', ') : say(talks[0]));
  };
  sig.still = () => { st.step = 2; sig.step(); };                // the end state: both threads drawn, the voice floor lifted, no ring
  sig.reset = () => {
    Object.assign(st, { held: false, manual: false, auto: 0, lift: 0, level: 0, t: -1, free: -1, said: false, step: 0, floor: -1, back: false, told: false });
    if (go) go.setAttribute('aria-pressed', 'false');
    talks.concat(works).forEach((li) => { li.classList.remove('is-on'); li.removeAttribute('data-picked'); li.removeAttribute('data-noted'); });
    if (worksTitle) worksTitle.classList.remove('is-on');
    waves.forEach((w) => { w.mesh.visible = false; });
    hands.forEach((h) => { h.k = 0; h.mesh.visible = false; h.arc.draw = 0; h.arc.update(); });
    second.show = 0; second.update();
    lamp.show = 0; lamp.update();
  };
  // The catch (beat d): the model floor is out, and the socket between two filled ones is empty
  sig.catch = (k) => sockets(k);

  sig.update = (dt, amount) => {
    const now = ctx.reduced ? 1 : 0;
    if (st.auto > 0 && (st.auto -= dt) <= 0) release();
    st.lift = now ? (st.held ? 1 : 0) : damp(st.lift, st.held ? 1 : 0, 7, dt);
    st.level = now ? 0 : damp(st.level, st.held ? 1 : 0, st.held ? 8 : 26, dt);       // let go: the ring settles at once
    if (st.t >= 0 && !now) st.t += dt;
    const t = st.t;
    const end = until();
    // words wait half a second after the beat's own block has settled: until then a pinned word would sit askew
    st.age = amount > 0.01 ? st.age + dt : 0;
    const on = amount > 0.5 && (st.age > 0.5 || ctx.reduced);

    // the voice floor, and the interface above it, lift half a unit. The visitor's own thread stops there, talking
    const up = 0.5 * smooth(st.lift) * amount;
    tower.floors[0].raise = up; tower.floors[VOICE].raise = up;
    tower.floors[VOICE].lit = Math.max(tower.floors[VOICE].lit, 0.55 * st.lift * amount);
    const pts = thread.through(tower, VOICE, 0.9);
    pts.forEach((p) => { p.y += up; });
    thread.at(pts.length - 1);
    thread.show = amount * smooth(st.lift);
    const head = pts[pts.length - 1];
    waves.forEach((w) => {
      w.mesh.visible = !now && amount * st.lift > 0.02;
      if (!w.mesh.visible) return;
      ring(w, st.level, ctx.time);
      w.mesh.position.copy(head); w.mesh.quaternion.copy(camera.quaternion);
      w.mesh.material.opacity = w.alpha * amount * smooth(st.lift);
    });
    lamp.show = st.said ? amount : 0; lamp.update();
    tower.point(VOICE, 1, at).y += up;
    // its ring says it is talking. What its lamp means stands beside it until the workers' own names arrive
    talks.forEach((li, n) => { li.classList.toggle('is-on', on && (n > 0 || st.said)); li.toggleAttribute('data-picked', on && n === 0 && st.held); li.toggleAttribute('data-noted', on && n === 0 && st.held && t < REACH + FAN * 0.6); });

    // the second thread: 0.42 s a floor down past the router to floor 8, out to its edge, and at the end back up
    const x = tower.x + tower.shift + 0.55, z = tower.z + 0.3;
    path.forEach((p, n) => p.set(x, tower.floors[Math.min(HANDS, VOICE + n)].y + tower.lift + (n ? 0 : up), z));
    path[path.length - 1].x = tower.x + tower.shift + FLOOR.w / 2;
    const back = t < 0 ? 0 : smooth(span(t, end, end + BACK));
    const reach = t < 0 ? 0 : Math.min(t / DROP, HANDS - VOICE) + span(t, REACH, REACH + FAN * 0.4);
    second.points = path; second.at(reach * (1 - back));
    second.show = t >= 0 && back < 0.999 ? amount : 0;
    second.update();
    const floor = t < 0 || back >= 0.999 ? -1 : VOICE + Math.floor(Math.min(HANDS - VOICE, reach * (1 - back)) + 0.001);
    if (floor !== st.floor) { if (floor > VOICE) tower.floors[floor].pulse = 1; st.floor = floor; }
    if (back >= 0.999 && !st.back) { st.back = true; tower.floors[VOICE].pulse = 1; }      // the pulse has come home

    // the workers start when the thread arrives and keep going until 2.5 s after the button is let go
    const busy = t >= REACH + FAN * 0.5 && t < end;
    if (busy && !st.told) { st.told = true; announce(works.map(say).join(', ')); }
    const y8 = tower.floors[HANDS].y;
    hands.forEach((h) => {
      const k = t < 0 ? 0 : smooth(span(t, REACH + h.n * 0.08, REACH + FAN * 0.6 + h.n * 0.08)) * amount;
      h.busy = now ? 0 : damp(h.busy, busy ? 1 : 0, 6, dt);
      const bob = Math.abs(Math.sin(ctx.time * 7 + h.n * 1.7)) * 0.11 * h.busy;
      h.mesh.position.set(FLOOR.w / 2 + (ctx.phone ? 0.62 : 1.25), y8 + 0.24 + ((hands.length - 1) / 2 - h.n) * (ctx.phone ? 0.34 : 0.48) + bob, 0.3);
      h.mesh.visible = k > 0.01;
      h.mesh.scale.setScalar(0.4 + 0.6 * k);
      h.mesh.material.uniforms.uShow.value = k; h.mesh.material.uniforms.uActive.value = 0.5 * h.busy;
      rimMat.opacity = amount;
      h.a.set(tower.x + tower.shift + FLOOR.w / 2, y8 + tower.lift, tower.z + 0.3);
      h.c.set(tower.x + tower.shift + h.mesh.position.x, h.mesh.position.y + tower.lift - bob, tower.z + 0.3);
      h.b.copy(h.c); h.b.x -= 0.15; h.b.y += bob;
      h.arc.draw = k; h.arc.show = amount; h.arc.update();
      if (works[h.n]) works[h.n].classList.toggle('is-on', on && k > 0.6);
    });
    if (worksTitle) worksTitle.classList.toggle('is-on', on && hands.length > 0 && t >= REACH + FAN * 0.6);
  };

  sig.dispose = () => {
    sig.reset(); sockets(0);
    if (go) events.forEach(([name, fn]) => go.removeEventListener(name, fn));
    unhear();
    talkPins.concat(emptyPins).forEach((p) => p.drop());
    waves.forEach((w) => { ctx.scene.remove(w.mesh); w.geo.dispose(); w.mesh.material.dispose(); });
    hands.forEach((h) => { h.arc.dispose(); if (h.pin) h.pin.drop(); h.mesh.material.dispose(); h.mesh.removeFromParent(); });
    hoops.forEach((mesh) => { mesh.children.forEach((b) => { b.geometry.dispose(); if (b.material !== hoopMat) b.material.dispose(); }); mesh.removeFromParent(); });
    ballGeo.dispose(); hoopGeo.dispose(); hoopMat.dispose(); rimGeo.dispose(); rimMat.dispose();
    strip.geometry.dispose(); strip.material.dispose(); strip.removeFromParent();
    second.dispose(); lamp.dispose();
  };
  return sig;
}
