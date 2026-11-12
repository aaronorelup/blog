// xAI's signature moment, "whose light is it" (SPEC 2.5.5), and the pattern for the other four. Send a task:
// the thread drops and stops at the frosted model floor, where one of the models it may think with is picked.
// Lights out: the room takes the colour of that model's owner. Then the thread goes on to the delegation floor.
// Everything shown is read from the page's data (the model floor's parts, the agent's delegates) and its HTML.
import { Group, Mesh, BoxGeometry, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { announce } from '../core/dom.js';
import { owner } from '../worlds/index.js';
import { FLOOR } from '../scene/stack.js';

const MODEL = 4;
const HANDS = 7;
const DROP = 0.42;          // seconds a floor
const STOP = 1.25;          // seconds at the model floor
const AT_MODEL = DROP * (MODEL + 1);
const GO_ON = AT_MODEL + STOP;
const AT_HANDS = GO_ON + DROP * (HANDS - MODEL);

export function create(ctx, world) {
  const { tower, data, el } = world;
  const { prims, labels, studio, thread } = ctx;
  const parts = data.stack[MODEL].p;                                        // [owner, status, official] for each model
  const cores = prims.cores(tower, MODEL, parts, { ghost: true, ring: 0.62 });
  const names = world.items(0);                                             // the same parts as words, in the HTML
  // which core a press picks: released models only, another company's first, then alternating
  const order = parts.map((p, k) => k).filter((k) => parts[k][1] === 'released' && parts[k][0] !== 'outside')
    .sort((a, b) => (parts[a][0] === world.id) - (parts[b][0] === world.id));
  // the three lines from the delegation floor: its coding agents, solid when documented, dashed when not
  const hands = data.to.map((d, k) => ({ d, k })).filter(({ d }) => d[2] === 'coding-agent');
  const handNames = world.items(1);
  const group = new Group();
  tower.group.add(group);
  const sats = hands.map(({ d }, n) => {
    const own = owner(d[0]);
    const mesh = new Mesh(new BoxGeometry(0.42, 0.2, 0.42), ctx.mats.glass(own, { halfH: 0.1, alpha: d[1] === 'yes' ? 0.92 : 0.5 }));
    group.add(mesh);
    const from = new Vector3();
    const to = new Vector3();
    const arc = prims.arc(from, to, { official: d[1], lift: (1 - n) * 0.12, dots: false });
    const pin = handNames[n] && !ctx.phone ? labels.pin(handNames[n], () => to, { dx: 74, ax: 0, ay: 0.5 }) : null;
    return { mesh, arc, from, to, pin, n };
  });
  const pickPin = ctx.phone ? null : names.map((node, k) => labels.pin(node, () => tower.anchor(MODEL, -1, labels.project), { dx: -14, ax: 1, ay: 0.5 }));
  const go = world.button('go');
  const darkBtn = world.button('dark');
  const st = { t: -1, auto: false, press: 0, picked: -1, darkWant: 0, dark: 0, glow: 0, floor: -1, step: 0 };
  const sig = { lit: -1, dark: false };

  function start(auto) {
    st.t = 0; st.auto = auto; st.floor = -1;
    st.picked = order.length ? order[st.press % order.length] : -1;
    st.press++;
    cores.items.forEach((c) => { c.active = 0; });
  }
  function setDark(on) {
    st.darkWant = on ? 1 : 0;
    if (darkBtn) darkBtn.setAttribute('aria-pressed', String(on));
  }
  const onGo = () => { if (ctx.reduced) sig.step(); else start(false); };
  const onDark = () => setDark(!st.darkWant);
  if (go) go.addEventListener('click', onGo);
  if (darkBtn) { darkBtn.addEventListener('click', onDark); darkBtn.setAttribute('aria-pressed', 'false'); }

  sig.play = () => start(true);
  // Reduced motion: no flight. Each press of the button walks one stop: floor 1, the router, the model, the pick, the hand-off.
  sig.step = () => { st.step = (st.step % 5) + 1; st.t = [0, DROP, DROP * 3, AT_MODEL + 0.6, AT_HANDS + 2.2][st.step - 1]; st.auto = false; if (st.step === 1) { st.picked = order[st.press % Math.max(1, order.length)] ?? -1; st.press++; } };
  sig.still = () => { st.step = 4; st.picked = order[0] ?? -1; st.press = 1; st.t = AT_HANDS + 2.2; };
  sig.reset = () => {
    st.t = -1; st.picked = -1; st.dark = 0; st.glow = 0; st.step = 0; sig.lit = -1; sig.dark = false;
    setDark(false);
    names.concat(handNames).forEach((n) => { n.classList.remove('is-on'); n.removeAttribute('data-picked'); });
    sats.forEach((s) => { s.arc.draw = 0; s.arc.update(); });
  };
  // The catch (beat d): the model floor slides out, still frosted. You cannot see which model it is.
  sig.catch = (k) => { tower.floors[MODEL].frost = Math.max(tower.floors[MODEL].frost, k); };

  sig.update = (dt, amount) => {
    const f = tower.floors[MODEL];
    f.frost = Math.max(f.frost, amount);
    f.guestShow = 1 - amount;
    cores.spin += dt * (ctx.reduced ? 0 : 0.32);
    cores.show = amount; cores.fade = 0.3;
    const playing = st.t >= 0;
    if (playing && !ctx.reduced) st.t += dt;
    const t = st.t;

    // the thread: 0.42 s a floor, 1.25 s stopped at the model floor, then on to the delegation floor
    if (playing && amount > 0.01) {
      const pts = thread.through(tower, HANDS, 0.9);
      const at = t < AT_MODEL ? t / DROP : t < GO_ON ? MODEL + 1 : Math.min(HANDS + 1, MODEL + 1 + (t - GO_ON) / DROP);
      thread.at(Math.min(at, pts.length - 1));
      thread.show = amount * (1 - smooth(span(t, AT_HANDS + 3.6, AT_HANDS + 4.4)));
      const floor = Math.min(HANDS, Math.floor(at + 0.001) - 1);
      if (floor !== st.floor && floor >= 0) { st.floor = floor; tower.floors[floor].pulse = 1; }
      sig.lit = t < AT_HANDS ? Math.max(0, floor) : -1;            // at the hand-off the three names take the callout's place
    } else sig.lit = -1;

    // the pick: one released core glows, and its name stands beside the floor
    const picking = playing && t >= AT_MODEL && st.picked >= 0;
    cores.items.forEach((c, k) => { c.active += ((picking && k === st.picked ? 1 : 0) - c.active) * (1 - Math.exp(-5 * dt)); });
    names.forEach((n, k) => { const on = picking && k === st.picked && amount > 0.5; n.classList.toggle('is-on', on); n.toggleAttribute('data-picked', on); });
    if (picking && st.said !== st.press && names[st.picked]) { st.said = st.press; announce(names[st.picked].textContent.trim()); }      // the live region names the pick

    // lights out: the lamp is cut by a falloff that sweeps the room in 0.6 s, then the owner's colour blooms from
    // the model floor, radius 0 to 14 in 0.9 s. The play-through does it once by itself
    if (st.auto && playing) { if (t > AT_MODEL + 0.5 && t < AT_HANDS + 3.2) st.darkWant = 1; else if (t >= AT_HANDS + 3.2 && st.darkWant) setDark(false); if (darkBtn) darkBtn.setAttribute('aria-pressed', String(!!st.darkWant)); }
    const quick = ctx.reduced ? 1000 : 1;
    st.dark = Math.max(0, Math.min(1, st.dark + (st.darkWant ? dt / 0.6 : -dt / 0.45) * quick));
    st.glow = Math.max(0, Math.min(1, st.glow + (st.darkWant && st.dark > 0.4 ? dt / 0.9 : -dt / 0.3) * quick));
    const who = owner(st.picked >= 0 ? parts[st.picked][0] : world.id);
    studio.dark = st.dark * amount;
    studio.glow.amount = amount; studio.glow.radius = 14 * smooth(st.glow);
    studio.glow.color.set(who.glow);
    tower.point(MODEL, 0, studio.glow.pos);
    thread.dark = st.dark;
    cores.night = st.dark;
    cores.update();
    sig.dark = st.dark > 0.5;

    // the hand-off: three lines from the delegation floor to its coding agents
    const y = tower.floors[HANDS].y;
    sats.forEach((s) => {
      const k = playing ? smooth(span(t, AT_HANDS + s.n * 0.25, AT_HANDS + 0.6 + s.n * 0.25)) * amount : 0;
      // the three stand to the right of the delegation floor, where the callouts are quiet during the signature
      s.mesh.position.set(FLOOR.w / 2 + (ctx.phone ? 0.55 : 1.25), y + (1 - s.n) * (ctx.phone ? 0.34 : 0.56) + 0.1, 0.5);
      s.mesh.visible = k > 0.01;
      s.mesh.scale.setScalar(0.4 + 0.6 * k);
      s.mesh.material.uniforms.uShow.value = k;
      s.from.set(tower.x + FLOOR.w / 2, y + tower.lift, tower.z + 0.5);
      s.to.set(tower.x + s.mesh.position.x - 0.23, s.mesh.position.y + tower.lift, tower.z + s.mesh.position.z);
      s.arc.draw = k; s.arc.dark = st.dark; s.arc.show = amount; s.arc.update();
      if (handNames[s.n]) handNames[s.n].classList.toggle('is-on', k > 0.6);
    });
  };

  sig.dispose = () => {
    sig.reset();
    if (go) go.removeEventListener('click', onGo);
    if (darkBtn) darkBtn.removeEventListener('click', onDark);
    cores.dispose();
    sats.forEach((s) => { s.arc.dispose(); if (s.pin) s.pin.drop(); s.mesh.geometry.dispose(); s.mesh.material.dispose(); });
    if (pickPin) pickPin.forEach((p) => p.drop());
    group.removeFromParent();
  };
  return sig;
}
