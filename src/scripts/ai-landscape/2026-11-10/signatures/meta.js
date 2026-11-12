// Meta's signature moment, "the gate" (SPEC 2.5.4). Ask it to pay: the thread comes in at the open door, passes
// the router and stops at a gate on the harness floor. Beside the gate a key sits behind glass and stays there:
// a blank token slides onto the thread in its place. Only the visitor's approval lifts the bar. Then the catch:
// the model floor is a drawer with a lock on it. Every word is read from the page (the three steps, the drawer).
import { BoxGeometry, CircleGeometry, Group, Mesh, MeshBasicMaterial, TorusGeometry, Vector3 } from 'three';
import { smooth, span } from '../core/clock.js';
import { $, announce } from '../core/dom.js';
import { FLOOR } from '../scene/stack.js';

const HARNESS = 3;
const MODEL = 4;
const LAST = 6;                       // the computer: where an approved action ends up
const DROP = 0.42;                    // seconds a floor
const AT_GATE = DROP * 4;             // above the door, floors 1 to 3, the gate
const ASK = AT_GATE + 1.15;           // the token is on: the gate asks
const DONE = 0.35 + DROP * 3;         // after the approval: the bar, then three more floors
const INK = '#0C0D10';
const OUT = FLOOR.w / 2 + 0.36;       // the gate stands on a balcony in front of the harness floor, clear of the floors above
const SCALE = 1.35;
const VAULT = 1.02;                   // the vault's centre, right of the gate
const BAR = 0.3 * SCALE;              // how high the bar hangs over the balcony

export function create(ctx, world) {
  const { tower, el } = world;
  const { prims, labels, thread, mats } = ctx;
  const steps = world.items(0);                               // 0 the doors, 1 the harness sentence, 2 the approval sentence
  const [drawer] = world.catchItems();                        // the flagship and its access line
  const myth = $('.ail-myth', el);                            // what people say of that model: struck through at the catch
  const card = $('.ail-catch', el);
  const go = world.button('go');
  const ok = world.button('approve');
  const flat = (color, over) => new MeshBasicMaterial({ color, transparent: true, depthTest: !over });

  // the balcony, the gate on it, and the vault beside the gate with the key inside
  const group = new Group();
  group.visible = false;                                      // built hidden: update() shows it, with an amount over 0
  tower.group.add(group);
  const ledge = new Mesh(new BoxGeometry(2.3, 0.05, 0.7), mats.glass(tower.owner, { halfH: 0.025, alpha: 0.82, side: 1 }));
  ledge.position.set(0.32, -0.03, 0);
  const gate = prims.gate(tower, HARNESS, { side: 1 });
  const box = new Mesh(new BoxGeometry(0.56, 0.46, 0.34), mats.glass(tower.owner, { halfH: 0.23, alpha: 0.26, side: 1 }));
  box.position.set(VAULT, 0.24, 0);
  const keyMat = flat(INK);
  const key = new Group();
  const bow = new Mesh(new TorusGeometry(0.075, 0.026, 8, 24), keyMat);
  bow.position.x = -0.11;
  const shank = new Mesh(new BoxGeometry(0.23, 0.04, 0.04), keyMat);
  shank.position.x = 0.075;
  const bits = [0.11, 0.165].map((x) => { const m = new Mesh(new BoxGeometry(0.04, 0.085, 0.04), keyMat); m.position.set(x, -0.05, 0); return m; });
  key.add(bow, shank, ...bits);
  key.position.set(VAULT, 0.25, 0);
  key.traverse((o) => { o.renderOrder = -1; });               // drawn before the glass it sits behind
  group.add(ledge, box, key);

  // the stand-in: a blank disc with an ink edge. It faces the screen and rides the head of the thread
  const token = new Group();
  const disc = new Mesh(new CircleGeometry(0.12, 28), flat('#FFFFFF', true));
  const edge = new Mesh(new TorusGeometry(0.12, 0.017, 6, 28), flat(INK, true));
  disc.renderOrder = 22; edge.renderOrder = 23;
  token.add(disc, edge);
  token.visible = false;
  ctx.scene.add(token);

  // the catch: a lock on the front of the model floor, which slides out like a drawer and shows nothing
  const lock = new Group();
  const lockMat = flat(INK);
  const shackle = new Mesh(new TorusGeometry(0.075, 0.02, 8, 20, Math.PI), lockMat);
  shackle.position.y = 0.06;
  const hole = new Mesh(new CircleGeometry(0.026, 14), flat('#FFFFFF'));
  hole.position.set(0, -0.04, 0.034);
  lock.add(new Mesh(new BoxGeometry(0.24, 0.19, 0.06).translate(0, -0.035, 0), lockMat), shackle, hole);
  lock.visible = false;
  tower.group.add(lock);

  // the drawer's label hangs under the model callout. On a phone it lists in the sheet
  const under = () => { const c = world.calls(); return c && c.anchors[MODEL] ? { x: c.column, y: c.anchors[MODEL].y + 34 } : null; };
  const pin = drawer && !ctx.phone ? labels.pin(drawer, under, { ax: 0, ay: 0 }) : null;

  const st = { t: -1, ta: -1, bar: 0, floor: -1, step: 0, said: 0 };
  const sig = { lit: -1, dark: false };
  const a = new Vector3();
  const b = new Vector3();
  const pts = Array.from({ length: 8 }, () => new Vector3());

  const start = () => { st.t = 0; st.ta = -1; st.floor = -1; st.said = 0; };
  const onGo = () => { if (ctx.reduced) sig.step(); else start(); };
  const onOk = () => { if (st.t >= ASK && st.ta < 0) st.ta = ctx.reduced ? DONE : 0; };
  if (go) go.addEventListener('click', onGo);
  if (ok) { ok.addEventListener('click', onOk); ok.hidden = true; }

  sig.play = () => start();
  // Reduced motion: no flight. The button walks three stops: the door, the router, the closed gate with the token on
  sig.step = () => { st.step = (st.step % 3) + 1; st.ta = -1; st.said = 0; st.t = [DROP, DROP * 3, ASK + 1][st.step - 1]; };
  sig.still = () => { st.step = 3; st.ta = -1; st.t = ASK + 1; };
  sig.reset = () => {
    st.t = -1; st.ta = -1; st.bar = 0; st.step = 0; sig.lit = -1;
    steps.forEach((n) => n.classList.remove('is-on'));
    if (world.ui) world.ui.removeAttribute('data-idle');
    token.visible = false;
    if (ok) { ok.hidden = true; ok.disabled = false; }
  };

  sig.update = (dt, amount) => {
    const f = tower.floors;
    const top = f[HARNESS].y + FLOOR.h / 2;
    const on = amount > 0.01;
    group.visible = on;
    group.position.set(f[HARNESS].mesh.position.x, top, OUT);
    ledge.material.uniforms.uShow.value = amount * tower.show;
    box.material.uniforms.uShow.value = amount * tower.show;
    keyMat.opacity = amount;

    const playing = st.t >= 0 && on;
    if (playing && !ctx.reduced) { st.t += dt; if (st.ta >= 0) st.ta += dt; }
    const waiting = playing && st.t >= AT_GATE && st.ta < 0;
    const passed = playing && st.ta >= 0;

    st.bar += ((passed ? 1 : 0) - st.bar) * (ctx.reduced ? 1 : 1 - Math.exp(-7 * dt));
    gate.show = amount; gate.lift = st.bar; gate.update();
    gate.group.position.z = OUT; gate.group.scale.setScalar(SCALE);

    // the thread runs down the front of the stack: 0.42 s a floor, and it stops at the bar until the visitor approves
    const x = tower.x + tower.shift + f[HARNESS].mesh.position.x;
    const z = tower.z + OUT;
    const at = !playing ? 0 : !passed ? Math.min(4, st.t / DROP) : 4 + Math.max(0, Math.min(3, (st.ta - 0.35) / DROP));
    pts[0].set(x, f[0].y + tower.lift + 1.05, z);
    [0, 1, 2].forEach((i) => pts[i + 1].set(x, f[i].y + tower.lift, z));
    pts[4].set(x, top + tower.lift + BAR + 0.15, z);
    [4, 5, 6].forEach((i) => pts[i + 1].set(x, f[i].y + tower.lift, z));
    if (playing) {
      thread.points = pts;
      thread.at(at);
      thread.dark = 0;
      thread.show = amount;
      const floor = Math.min(LAST, Math.floor(at + 0.001) - 1);
      if (floor !== st.floor && floor >= 0) { st.floor = floor; f[floor].pulse = 1; }
      sig.lit = floor < 1 ? -1 : Math.min(HARNESS, floor);         // step one names floor 1. Past the gate the harness keeps the callout
    } else sig.lit = -1;

    // the key never moves. When the thread reaches the gate the vault lights, and a blank token slides out to the head
    const e = waiting || passed ? smooth(span(st.t, AT_GATE + 0.3, AT_GATE + 0.95)) : 0;
    box.material.uniforms.uPulse.value = waiting ? 0.5 * (1 - smooth(span(st.t, AT_GATE, AT_GATE + 1.6))) : 0;
    token.visible = e > 0.001 && on;
    if (token.visible) {
      a.set(x + VAULT - 0.34, top + tower.lift + 0.25, z + 0.2);
      b.copy(passed ? thread.pos : pts[4]);
      token.position.lerpVectors(a, b, e);
      token.quaternion.copy(ctx.camera.quaternion);
      token.scale.setScalar(0.45 + 0.55 * e);
      disc.material.opacity = edge.material.opacity = Math.min(1, e * 4) * thread.show;
    }

    // the words and the button, one step at a time in the console: where it came in, the harness sentence while the
    // gate waits (and before anything is asked: it is what the gate and the key are), the approval sentence once given
    const asked = waiting && st.t >= ASK;
    if (ok) { ok.hidden = !(asked || passed); ok.disabled = passed; }
    const show = [playing && !waiting && !passed, waiting || !playing, passed];
    steps.forEach((n, k) => n.classList.toggle('is-on', show[k] && on));
    if (world.ui) world.ui.toggleAttribute('data-idle', !playing);
    const say = passed ? 2 : waiting ? 1 : 0;
    if (say && say !== st.said) { st.said = say; announce(steps[say].textContent.trim()); }
  };

  // The catch (beat d): the section slides the model floor out. It is a drawer, and it is locked
  sig.catch = (k) => {
    const f = tower.floors[MODEL];
    lock.visible = k > 0.01;
    lock.position.set(f.mesh.position.x + FLOOR.w / 2 - 0.42, f.y, FLOOR.w / 2 + 0.04);
    lock.scale.setScalar(1.25 * smooth(k * 1.6));
    lockMat.opacity = Math.min(1, k * 2);
    if (drawer) drawer.classList.toggle('is-on', k > 0.6);
    // the myth this drawer answers sits struck through on top of the catch, where the truth is the catch itself
    if (!myth) return;
    myth.classList.toggle('is-on', k > 0.6);
    if (k <= 0 || ctx.phone || !card) { myth.style.transform = ''; myth.style.width = ''; return; }
    const r = card.getBoundingClientRect();
    myth.style.width = `${r.width.toFixed(0)}px`;
    myth.style.transform = `translate3d(${r.left.toFixed(1)}px,${(r.top - 4).toFixed(1)}px,0) translateY(-100%)`;
  };

  sig.dispose = () => {
    sig.reset();
    if (go) go.removeEventListener('click', onGo);
    if (ok) { ok.removeEventListener('click', onOk); ok.hidden = false; }
    sig.catch(0);
    if (pin) pin.drop();
    gate.dispose();
    for (const root of [group, token, lock]) {
      root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      root.removeFromParent();
    }
  };
  return sig;
}
