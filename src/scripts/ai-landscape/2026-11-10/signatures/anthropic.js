// Anthropic's signature moment, "the plug" (SPEC 2.5.1). A plug on its cord and a card wait at the tools floor: the
// two standards it made. The plug visits the other four companies' lids and seats by each one's own answer (full,
// half, or a bounce), the card follows it. Then the model floor slides out three hollow media sockets.
// Everything shown is read from the page's data (each company's `ext`, its own `media`) and from its HTML.
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, TorusGeometry, Vector3 } from 'three';
import { damp, easeIO, easeOut, lerp, smooth, span } from '../core/clock.js';
import { $, announce } from '../core/dom.js';
import { owner, world as configOf } from '../worlds/index.js';
import { FLOOR, slabGeometry } from '../scene/stack.js';

const MODEL = 4, TOOLS = 5, HANDS = 7;
const HOP = 0.5, REST = 0.25;                  // seconds a flight, and seated before the next one
const SEATED = { yes: 1, partial: 0.5 };       // how far the plug goes in. Any other answer keeps it out
const FILLED = { solid: 1, hatch: 1 };         // the states of a media socket that hold something
const PLATE = 0.66;                            // a lid's mark plate, in world units

export function create(ctx, world) {
  const { tower, cfg, el, inst, data } = world;
  const { prims, labels, mats, textures, camera } = ctx;
  const clay = owner(world.id);
  const lids = world.items(0);                                // the other four companies, as words in the page
  const reasons = world.items(1);                             // why each media socket is empty
  const title = $('.ail-sig__list[data-list="0"] h3', el);    // the two standards, by name
  const go = world.button('go');
  const st = { run: [], hop: null, rest: 0, at: -1, cardAt: -1, mode: '', tour: false, auto: false, ledge: 0, hold: 0, catching: false, sel: -1, drag: null, dragged: false, step: 0, hung: 0, on: false, gone: false };
  const sig = { lit: -1, dark: false };
  const root = new Group();                                   // the room's own coordinates: x and z from the stack's foot
  root.visible = false;
  ctx.scene.add(root);
  const v = new Vector3(), pos = new Vector3(), home = new Vector3(), from = new Vector3(), to = new Vector3(), bend = new Vector3();
  const cardPos = new Vector3(), cardGoal = new Vector3(), cordA = new Vector3(), cordB = new Vector3();
  const say = (li) => [...li.querySelectorAll('.ail-own, .ail-note, .ail-tag')].map((n) => n.textContent.trim()).filter(Boolean).join('. ');

  // ---- the four lids: each a small slab of its owner's glass under its mark plate, with room for two clay pieces
  const seatGeo = new SphereGeometry(0.066, 20, 14);
  const chipGeo = new BoxGeometry(0.15, 0.11, 0.03);
  const stations = lids.map((li, k) => {
    const id = $('.ail-own', li).dataset.owner;
    const ext = ctx.data.p[id].ext;                           // that company's own answers: mcp, skills
    const slab = new Mesh(slabGeometry(), mats.glass(owner(id), { side: 1, alpha: 0.62 }));
    slab.scale.set(0.36, 0.62, 0.26);
    const plate = new Mesh(new PlaneGeometry(PLATE, PLATE), mats.paper(null, { side: 1, blended: true }));
    plate.renderOrder = 8; plate.visible = false;
    const seat = new Mesh(seatGeo, mats.core(clay, { side: 1, ghost: true, hatch: ext.mcp === 'partial' }));
    const chip = new Mesh(chipGeo, mats.core(clay, { side: 1, ghost: true }));
    root.add(slab, plate, seat, chip);
    const s = { id, k, li, ext, slab, plate, seat, chip, pos: new Vector3(), in: 0, inK: 0, card: 0, cardK: 0, seen: false, pulse: 0, img: null, over: 0, tex: null, pin: null };
    const marks = configOf(id).marks;
    const head = `.ail-world[data-world="${id}"] .ail-mark`;
    const name = $(`${head} img`)?.alt || $(`${head} .ail-mark__name`)?.textContent || id;
    textures.markPlate({ url: marks.lid, name, plate: marks.plate, clear: marks.clear }).then((tex) => {
      if (st.gone) { tex.dispose(); return; }
      s.tex = tex; plate.material.uniforms.uMap.value = tex; plate.visible = true;
      if (!tex.userData.over) return;
      // a mark that cannot be drawn to a canvas rides its blank plate as the file itself, as on the row of five
      s.img = document.createElement('img');
      s.img.src = marks.lid; s.img.alt = ''; s.img.className = 'ail-lidmark';
      document.body.appendChild(s.img);
      s.over = tex.userData.over;
    });
    if (!ctx.phone) s.pin = labels.pin(li, () => v.copy(s.pos).add(root.position).setY(s.pos.y - 0.08), { ax: 0.5, ay: 0, dy: 9 });
    return s;
  });
  // a shelf to the upper right on a wide screen, a column beside the stack on a phone
  function layout() {
    const stop = ctx.rig.world(0, 'open');
    const depth = stop.pos[2] + 0.4;
    const right = stop.pos[0] + ((stop.look[0] - stop.pos[0]) * depth) / stop.pos[2] + depth * Math.tan((stop.fov * Math.PI) / 360) * camera.aspect;
    const gap = Math.max(0.8, Math.min(1.24, (right - 3.72) / Math.max(1, stations.length - 1)));
    stations.forEach((s, k) => (ctx.phone ? s.pos.set(2.2, 4.86 - k * 1.14, 0.2) : s.pos.set(2.95 + k * gap, 4.42, -0.4)));
  }
  layout();
  window.addEventListener('resize', layout);

  // ---- the plug on its cord and the card: the two standards, in the glass of the company that made them
  const plug = new Group();
  plug.add(new Mesh(new CylinderGeometry(0.115, 0.075, 0.3, 28).rotateZ(-Math.PI / 2), mats.glass(clay, { halfH: 0.115, side: 1, alpha: 0.97 })));
  const pinMat = new MeshBasicMaterial({ color: cfg.theme.ink, transparent: true });
  const pinGeo = new BoxGeometry(0.13, 0.034, 0.034);
  for (const y of [-0.052, 0.052]) { const pin = new Mesh(pinGeo, pinMat); pin.position.set(0.215, y, 0); plug.add(pin); }
  const card = new Mesh(new BoxGeometry(0.2, 0.26, 0.035), mats.glass(clay, { side: 1, alpha: 0.96 }));
  root.add(plug, card);
  const cord = prims.arc(cordA, cordB, { color: cfg.theme.ink, lift: -0.42, side: 1, dots: false });
  const titlePin = title && !ctx.phone ? labels.pin(title, () => v.copy(home).add(root.position), { dx: 40, ay: 0.5 }) : null;

  // ---- the media sockets: hoops in a plain strip that stands on the model floor. A filled one holds a ball, a hollow
  // one holds nothing. The strip is house paper, like a mark's plate, so the hoops read against any backdrop
  const hoopGeo = new TorusGeometry(0.105, 0.012, 8, 40);
  const hoopMat = new MeshBasicMaterial({ color: cfg.theme.ink, transparent: true });
  const strip = new Mesh(new PlaneGeometry(0.3 * data.media.length + 0.08, 0.31), new MeshBasicMaterial({ color: '#F8F9FB', transparent: true }));
  strip.visible = false;
  tower.group.add(strip);
  const hoops = data.media.map((state) => {
    const mesh = new Mesh(hoopGeo, hoopMat);
    if (FILLED[state]) mesh.add(new Mesh(new SphereGeometry(0.07, 18, 12), mats.core(clay, { side: 1, hatch: state === 'hatch' })));
    mesh.visible = false;
    tower.group.add(mesh);
    return mesh;
  });
  const reasonPins = ctx.phone ? [] : reasons.map((li) => labels.pin(li, () => tower.anchor(MODEL, 1, labels.project), { ay: 0.5 }));
  // k 0 to 1: how far the model floor is out. `under` leaves the floor's own callout its place (beat d)
  function sockets(k, under = false) {
    const f = tower.floors[MODEL];
    if (k > 0.001) f.slide = Math.max(f.slide, k * (ctx.phone ? 0.55 : 0.95));
    hoops.forEach((mesh, n) => { mesh.visible = k > 0.02; mesh.position.set(f.slide + 0.44 + n * 0.3, f.y + FLOOR.h / 2 + 0.155, 0.76); });
    strip.visible = k > 0.02;
    strip.position.set(f.slide + 0.44 + (hoops.length - 1) * 0.15, f.y + FLOOR.h / 2 + 0.155, 0.74);
    hoopMat.opacity = Math.min(1, k * 1.4); strip.material.opacity = Math.min(1, k * 1.4) * 0.94;
    reasons.forEach((li, n) => li.classList.toggle('is-on', k > 0.5 + n * 0.14));
    reasonPins.forEach((pin, n) => { pin.dx = under ? 46 : 18; pin.dy = under ? 46 + n * 31 : (n - (reasons.length - 1) / 2) * 31; });
  }

  // ---- the small pixel creature of its command-line tool lives on floor 8, the floor the agent steers it from
  const pet = new Mesh(new PlaneGeometry(1, 1), mats.paper(null, { side: 1, blended: true }));
  pet.renderOrder = 7; pet.visible = false;
  tower.group.add(pet);
  textures.load(cfg.art.props[0]).then((tex) => { if (tex && !st.gone) { pet.material.uniforms.uMap.value = tex; pet.scale.set(0.44, (0.44 * tex.image.height) / tex.image.width, 1); } });

  // ---- flights. A seat is decided by the lid's own data, never by the visitor
  const homeAt = (out) => out.set(FLOOR.w / 2 + 0.42, tower.floors[TOOLS].y + tower.lift, 0.5);
  const dockAt = (s, out) => { const r = SEATED[s.ext.mcp] || 0; return out.set(s.pos.x - 0.585 - (r ? (1 - r) * 0.13 : 0.34), s.pos.y, s.pos.z); };
  const fly = (k) => { from.copy(pos); st.hop = { k, t: 0 }; st.at = -1; };
  function arrive(k) {
    st.hop = null; st.at = k; st.cardAt = k; st.rest = REST;                  // the card sets off for a lid when the plug has reached it
    const s = stations[k];
    if (!s) { if (st.tour) { st.tour = false; st.auto = false; st.mode = 'sockets'; } return; }
    s.in = SEATED[s.ext.mcp] || 0; s.seen = true; s.pulse = s.in === 1 ? 1 : 0;
    announce(say(s.li));
  }
  function start(auto) {                                       // the whole tour: four lids in turn, home, then the sockets
    stations.forEach((s) => { s.in = 0; s.card = 0; s.seen = false; });
    st.run = [...stations.keys(), -1]; st.tour = true; st.auto = auto; st.mode = 'lids'; st.sel = -1; st.rest = 0.35; st.cardAt = -1;
    tower.floors[TOOLS].pulse = 1;
  }
  const takeOver = () => { st.auto = false; st.tour = false; st.run.length = 0; };
  function plugTo(k, always = false) { takeOver(); st.mode = 'lids'; if (always || k !== st.at || st.hop) { st.run = [k]; st.rest = 0; } }

  // ---- the visitor: the button, the arrow keys on it, a tap on a lid, or the plug dragged by mouse
  const onGo = () => { if (ctx.reduced) sig.step(); else if (st.sel >= 0) plugTo(st.sel); else start(false); };
  const onKey = (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === 'Escape') st.sel = -1;
    if (!d || ctx.reduced) return;
    e.preventDefault(); takeOver(); st.mode = 'lids';
    st.sel = st.sel < 0 ? (d > 0 ? 0 : stations.length - 1) : (st.sel + d + stations.length) % stations.length;
    announce(say(stations[st.sel].li));
  };
  // The scene lies under the page's own layers, so the pointer is heard on the window: anywhere but on a control
  const near = (e, p, r) => { const q = labels.project(p); return Math.hypot(q.x - e.clientX, q.y - e.clientY) < r; };
  const free = (e) => st.on && !ctx.reduced && !(e.target.closest && e.target.closest('button, a, summary, [data-hit]'));
  const onDown = (e) => {
    if (!free(e) || e.pointerType === 'touch' || !near(e, v.copy(pos).add(root.position), 38)) return;
    e.preventDefault();
    st.drag = e.pointerId; st.dragged = true; st.hop = null; st.at = -1; st.cardAt = -1;
    takeOver(); st.mode = 'lids';
  };
  const onMove = (e) => {
    if (st.drag !== e.pointerId) { if (e.pointerType === 'mouse' && st.on) document.body.style.cursor = free(e) && near(e, v.copy(pos).add(root.position), 38) ? 'grab' : ''; return; }
    if (e.buttons === 0) { onUp(e); return; }                   // let go outside the window
    // the pointer, on the upright plane the shelf stands in
    v.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position);
    pos.copy(camera.position).addScaledVector(v, (root.position.z + stations[0].pos.z - camera.position.z) / v.z).sub(root.position);
  };
  const onUp = (e) => {
    if (st.drag !== e.pointerId) return;
    st.drag = null;
    const s = stations.find((x) => x.pos.distanceTo(pos) < 0.95);
    plugTo(s ? s.k : -1, true);
  };
  const onClick = (e) => {
    if (st.dragged) { st.dragged = false; return; }
    const s = free(e) && stations.find((x) => near(e, v.copy(x.pos).add(root.position).setY(x.pos.y + 0.3), ctx.phone ? 34 : 54));
    if (s) plugTo(s.k);
  };
  if (go) { go.addEventListener('click', onGo); go.addEventListener('keydown', onKey); }
  const heard = [['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['pointercancel', onUp], ['click', onClick]];
  heard.forEach(([name, fn]) => window.addEventListener(name, fn));
  // the play-through stops for good on the first press, touch or key. The flight in the air still lands
  const unhear = ctx.input.onInput((kind) => { if (st.auto && kind !== 'move' && kind !== 'wheel') takeOver(); });

  sig.play = () => start(true);
  // Reduced motion: no flight. Each press seats the next lid, the fifth shows the sockets
  sig.step = () => {
    st.step = (st.step % (stations.length + 1)) + 1;
    const last = st.step > stations.length;
    stations.forEach((s, k) => { const on = last || k < st.step; s.in = on ? SEATED[s.ext.mcp] || 0 : 0; s.card = on && s.ext.skills ? 1 : 0; s.seen = on; });
    st.hop = null; st.run.length = 0; st.at = last ? -1 : st.step - 1; st.cardAt = st.at; st.mode = last ? 'sockets' : 'lids';
    if (!last) announce(say(stations[st.at].li));
  };
  sig.still = () => { st.step = stations.length; sig.step(); };        // the end state: four lids seated as the data says, three hollow sockets
  sig.reset = () => {
    st.hold = st.ledge;                                                // a floor that is out stays out into the catch
    Object.assign(st, { run: [], hop: null, rest: 0, at: -1, cardAt: -1, mode: '', tour: false, auto: false, ledge: 0, sel: -1, drag: null, step: 0, on: false });
    stations.forEach((s) => { s.in = 0; s.inK = 0; s.card = 0; s.cardK = 0; s.seen = false; s.pulse = 0; s.li.classList.remove('is-on'); s.li.removeAttribute('data-picked'); s.li.removeAttribute('data-seen'); if (s.img) s.img.style.opacity = '0'; });
    if (title) title.classList.remove('is-on');
    root.visible = false; cord.draw = 0; cord.update(); pet.visible = false; document.body.style.cursor = '';
    sockets(0);
  };
  // The catch (beat d): the same three sockets, on the floor the section slides out
  sig.catch = (k) => {
    st.catching = k > 0;
    if (!k) { st.hold = 0; sockets(0); return; }
    if (k >= st.hold) st.hold = 0;
    sockets(Math.max(k, st.hold), true);
  };

  sig.update = (dt, amount) => {
    const quick = ctx.reduced ? 1 : 0;
    root.position.set(tower.x + tower.shift, 0, tower.z);
    // the frame is lowered onto the plain wall once the name has left the room, and lifted before it returns
    const frame = inst.parts.portrait;
    if (frame && cfg.portrait.hangs != null) {
      if (inst.open > 0.02) st.hung = ctx.phone ? 0 : 1 - Math.min(1, inst.nameShow / inst.open);        // a phone has no clear wall beside the stack
      frame.position.y = lerp(cfg.portrait.y, cfg.portrait.hangs, easeOut(st.hung));
    }
    pet.visible = tower.open > 0.6 && !!pet.material.uniforms.uMap.value;
    if (pet.visible) {
      pet.position.set(0.72, tower.floors[HANDS].y + FLOOR.h / 2 + pet.scale.y / 2, 0.98);
      pet.quaternion.copy(camera.quaternion);
      pet.material.uniforms.uOpacity.value = smooth(span(tower.open, 0.6, 0.95)) * tower.show;
    }
    st.on = amount > 0.5;
    root.visible = amount > 0.01;
    if (!root.visible) { if (!st.catching) st.hold = 0; cord.draw = 0; cord.update(); stations.forEach((s) => { if (s.img) s.img.style.opacity = '0'; }); return; }

    // the plug: dragged, in flight, seated, or at home beside the tools floor
    homeAt(home);
    if (!st.hop && st.drag == null && st.run.length && (st.rest -= dt) <= 0) fly(st.run.shift());
    if (st.hop) {
      const h = st.hop, s = stations[h.k];
      h.t += quick ? HOP : dt;
      const u = easeIO(h.t / HOP);
      if (s) dockAt(s, to); else to.copy(home);
      bend.lerpVectors(from, to, 0.5); bend.y -= 0.4;                   // it swoops under the shelf and comes in from the side
      pos.copy(from).multiplyScalar((1 - u) * (1 - u)).addScaledVector(bend, 2 * (1 - u) * u).addScaledVector(to, u * u);
      if (s && !SEATED[s.ext.mcp]) pos.x += 0.34 * Math.sin(Math.PI * span(u, 0.55, 1));      // no seat: it touches the lid and springs back
      if (h.t >= HOP) arrive(h.k);
    } else if (st.drag == null) { if (st.at >= 0) dockAt(stations[st.at], pos); else pos.copy(home); }
    plug.position.copy(pos);
    plug.children.forEach((m) => { if (m.material.uniforms) m.material.uniforms.uShow.value = amount; });
    pinMat.opacity = amount;
    tower.point(TOOLS, 1, cordA).setZ(tower.z + 0.5);
    cordB.copy(pos).add(root.position); cordB.x -= 0.15;
    cord.draw = 1; cord.show = amount; cord.update();

    // the card follows one lid behind: it stands in a lid whose company has taken the format, and hovers over one that has not
    const lid = stations[st.cardAt];
    if (lid) cardGoal.set(lid.pos.x + 0.2, lid.pos.y + (lid.ext.skills ? 0.13 : 0.44), lid.pos.z + 0.02);
    else if (st.hop || st.drag != null) cardGoal.set(pos.x - 0.05, pos.y + 0.36, pos.z);
    else cardGoal.set(pos.x + 0.02, pos.y - 0.36, pos.z);
    cardPos.lerp(cardGoal, quick || 1 - Math.exp(-9 * dt));
    if (lid && lid.ext.skills && cardPos.distanceTo(cardGoal) < 0.07) lid.card = 1;
    card.position.copy(cardPos);
    card.material.uniforms.uShow.value = amount;

    // the lids, and what each one keeps of a visit: a clay bead for the plug, a clay chip for the card
    const active = st.sel >= 0 ? st.sel : st.hop ? st.hop.k : st.at;
    const words = st.on && st.mode !== 'sockets';
    stations.forEach((s, k) => {
      s.inK = quick ? (s.in ? 1 : 0) : damp(s.inK, s.in ? 1 : 0, 10, dt);
      s.cardK = quick ? s.card : damp(s.cardK, s.card, 10, dt);
      s.pulse = Math.max(0, s.pulse - dt * 1.4);
      s.slab.position.copy(s.pos);
      const u = s.slab.material.uniforms;
      u.uShow.value = amount; u.uPulse.value = smooth(s.pulse); u.uHatch.value = s.in === 0.5 ? 1 : 0; u.uFrost.value = s.seen && !(s.ext.mcp in { yes: 1, partial: 1, no: 1 }) ? 1 : 0;
      s.plate.position.set(s.pos.x, s.pos.y + 0.7, s.pos.z);
      s.plate.quaternion.copy(camera.quaternion);
      s.plate.material.uniforms.uOpacity.value = amount;
      s.seat.position.set(s.pos.x - 0.22, s.pos.y, s.pos.z + 0.3);
      s.seat.scale.setScalar(Math.max(0.001, smooth(s.inK)));
      s.seat.material.uniforms.uShow.value = amount; s.seat.material.uniforms.uActive.value = smooth(s.pulse);
      s.chip.position.set(s.pos.x + 0.2, s.pos.y, s.pos.z + 0.3);
      s.chip.scale.setScalar(Math.max(0.001, smooth(s.cardK)));
      s.chip.material.uniforms.uShow.value = amount;
      s.li.classList.toggle('is-on', words);
      s.li.toggleAttribute('data-picked', words && k === active);
      s.li.toggleAttribute('data-seen', s.seen);
      if (s.img) {                                                      // the same sums as the row's own lid image
        const p = labels.project(v.copy(s.plate.position).add(root.position));
        const px = (PLATE * s.over * window.innerHeight) / (2 * v.sub(camera.position).dot(camera.getWorldDirection(bend)) * Math.tan((camera.fov * Math.PI) / 360));
        s.img.style.opacity = amount.toFixed(3);
        s.img.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) translate(-50%,-50%) scale(${(px / 100).toFixed(4)})`;
      }
    });
    if (title) title.classList.toggle('is-on', words);

    // then the model floor slides out its three sockets, each with the reason it is empty
    st.ledge = quick ? (st.mode === 'sockets' ? 1 : 0) : damp(st.ledge, st.mode === 'sockets' ? 1 : 0, 5, dt);
    sockets(st.on ? st.ledge : 0);
  };

  sig.dispose = () => {
    st.gone = true;
    sig.reset(); sig.catch(0);
    if (go) { go.removeEventListener('click', onGo); go.removeEventListener('keydown', onKey); }
    heard.forEach(([name, fn]) => window.removeEventListener(name, fn));
    window.removeEventListener('resize', layout);
    unhear();
    stations.forEach((s) => { if (s.pin) s.pin.drop(); if (s.img) s.img.remove(); if (s.tex) s.tex.dispose(); });
    reasonPins.forEach((p) => p.drop());
    if (titlePin) titlePin.drop();
    // the slab is the stack's own shared shape: its materials go, the shape stays
    root.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry && o.geometry !== slabGeometry()) o.geometry.dispose(); });
    root.removeFromParent();
    cord.dispose();
    for (const mesh of [...hoops, pet, strip]) { mesh.traverse((o) => { if (o.material && o.material !== hoopMat) o.material.dispose(); if (o.geometry !== hoopGeo) o.geometry.dispose(); }); mesh.removeFromParent(); }
    hoopGeo.dispose(); hoopMat.dispose();
    textures.release(cfg.art.props[0]);
  };
  return sig;
}
