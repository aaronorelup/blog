// Google's signature moment, "two doors, one index" (SPEC 2.5.3). Two of the doors on floor 1 grow tall. Pick
// one: its thread drops to its own picker on the model floor, and on to the one index at the foot of the stack.
// Then a picture is painted two ways under a dial that never settles, because the maker has not said which.
// The catch: name plates that were renamed, shut down or are about to expire. Every word is read from the page.
import { BoxGeometry, CanvasTexture, CircleGeometry, Group, Mesh, MeshBasicMaterial, SRGBColorSpace, TorusGeometry, Vector3 } from 'three';
import { backOut, clamp01, smooth } from '../core/clock.js';
import { $, $$, announce } from '../core/dom.js';
import { FLOOR } from '../scene/stack.js';
import { art } from '../worlds/_default.js';

const MODEL = 4;
const DROP = 0.42;                          // seconds a floor
const AT_PICK = DROP * 5;                   // the door, then floors 1 to 5
const GO_ON = AT_PICK + 1.25;               // 1.25 s at its picker
const AT_INDEX = GO_ON + DROP * 5;          // floors 6 to 9, then the index
const PAINT = 1.6;                          // seconds a picture takes, either way
const BACK = 1.2;                           // then the needle springs back to the middle
const TILES = 16;
const FRONT = FLOOR.w / 2 + 0.03;
const PAPER = '#F8F9FB';
const INK = '#0C0D10';
const SIDE = 0.95;                          // how far the needle leans, in radians
const STEP = 0.19;                          // between two models in a picker

export function create(ctx, world) {
  const { tower, data, el } = world;
  const { prims, labels, mats } = ctx;
  const night = world.cfg.theme.chrome === 'dark';
  const line = night ? PAPER : INK;                                           // lines are paper on a dark stage
  const flat = (color, over) => new MeshBasicMaterial({ color, transparent: true, depthTest: !over });
  const names = world.items(0);                                               // the two doors, as words
  const [sentence] = world.items(1);                                          // how its pictures are made
  const [indexName, stamp] = $$('.ail-sig__title', el);                     // the index's label, and the state word
  const plates = world.catchItems();
  const go = world.button('go');
  const dial = { a: world.button('dialA'), b: world.button('dialB') };
  // which door on floor 1 each name is (they stand where prims.doors puts them), and the models that door offers
  const tabs = $$('.ail-door__name', el).map((n) => n.textContent.trim());
  const w = Math.min(0.2, (FLOOR.w - 0.5) / tabs.length - 0.05);
  const which = names.map((n) => Math.max(0, tabs.indexOf($('.ail-own', n).textContent.trim())));
  const xs = which.map((k) => (k - tabs.length / 2) * (w + 0.05) + 0.025 + w / 2);
  const options = which.map((k) => (data.doors[k] ? data.doors[k].m : []).filter((m) => m[2] === 'option'));

  const group = new Group();
  group.visible = false;                                                      // built hidden: update() shows it, with an amount over 0
  tower.group.add(group);
  const lineMat = flat(line, true);
  // two tall doors in their frames, each over its small door
  const doors = xs.map((x) => {
    const pivot = new Group();
    const leaf = new Mesh(new BoxGeometry(0.24, 0.5, 0.035).translate(x, 0.25, 0), mats.glass(tower.owner, { halfH: 0.5, side: 1, alpha: 0.9 }));
    pivot.position.x = x - 0.12; leaf.position.x = 0.12 - x;
    pivot.add(leaf);
    const frame = new Group();
    for (const [px, py, sx, sy] of [[-0.145, 0.27, 0.026, 0.54], [0.145, 0.27, 0.026, 0.54], [0, 0.553, 0.316, 0.026]]) {
      const bar = new Mesh(new BoxGeometry(sx, sy, 0.05), lineMat);
      bar.position.set(x + px, py, 0); bar.renderOrder = 12;
      frame.add(bar);
    }
    group.add(pivot, frame);
    return { x, pivot, leaf, frame, swing: 0 };
  });
  // a picker for each door, on the face of the model floor beside its thread: a short menu with one core for
  // each model the door offers, and a ring that says which one it is on
  const pickers = xs.map((x, k) => {
    const cores = prims.cores(tower, MODEL, options[k].map((m) => [m[0], m[1]]), { ghost: true, radius: 0.068, side: 1 });
    const n = Math.max(1, cores.items.length);
    const menu = new Mesh(new TorusGeometry(0.13, 0.011, 6, 44), lineMat);
    menu.scale.y = (n * STEP + 0.09) / 0.26;
    const ring = new Mesh(new TorusGeometry(0.096, 0.014, 6, 30), flat(line, true));
    menu.renderOrder = 13; ring.renderOrder = 16;
    group.add(menu, ring);
    cores.items.forEach((c, j) => { c.dy = ((n - 1) / 2 - j) * STEP; });
    return { x: x + 0.23, cores, menu, ring, at: 0, on: 0, reach: ((n - 1) / 2) * STEP };
  });
  // the index: one low block at the foot of the stack, in this company's glass. It stands on the ground
  const slab = new Mesh(new BoxGeometry(2.7, 0.12, 0.95), mats.glass(tower.owner, { halfH: 0.06, side: 1, alpha: 0.94 }));
  slab.visible = false;
  ctx.scene.add(slab);
  const threads = [ctx.thread, ctx.createThread()];
  const paths = xs.map(() => Array.from({ length: 11 }, () => new Vector3()));

  // the picture: a framed still on its own ledge beside the model floor, redrawn on a canvas, with a dial under it
  const C = 320, M = 16, P = C - 2 * M, T = P / TILES;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = C;
  const g = canvas.getContext('2d');
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const url = art(world.id, 'paint');
  const pic = url ? prims.figure(tower, MODEL, url, { size: ctx.phone ? 1.25 : 1.05, at: -1 }) : null;
  let img = null;
  let drawn = '';
  const noise = document.createElement('canvas');
  noise.width = noise.height = 72;
  const ng = noise.getContext('2d');
  let seed = 48271;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function grain() { for (let i = 0; i < 72 * 72; i++) { ng.fillStyle = `hsl(${(rnd() * 360) | 0} 60% ${(18 + rnd() * 64) | 0}%)`; ng.fillRect(i % 72, (i / 72) | 0, 1, 1); } }
  // mode 'a': filled in tile by tile, 16 by 16. mode 'b': sharpened out of noise in 8 steps. Anything else: whole
  function draw(mode, p) {
    const step = mode === 'a' ? Math.floor(clamp01(p) * TILES * TILES) : mode === 'b' ? Math.min(8, Math.floor(clamp01(p) * 8) + 1) : 0;
    const key = `${mode}${step}`;
    if (!img || key === drawn) return;
    drawn = key;
    g.globalAlpha = 1;
    g.fillStyle = INK; g.fillRect(0, 0, C, C);
    g.fillStyle = '#FFFFFF'; g.fillRect(3, 3, C - 6, C - 6);
    g.fillStyle = '#17181C'; g.fillRect(M, M, P, P);
    const s = img.width / TILES;
    if (mode === 'a') {
      const rows = Math.floor(step / TILES), rest = step % TILES;
      if (rows) g.drawImage(img, 0, 0, img.width, rows * s, M, M, P, rows * T);
      if (rest) g.drawImage(img, 0, rows * s, rest * s, s, M, M + rows * T, rest * T, T);
    } else {
      g.drawImage(img, M, M, P, P);
      if (mode === 'b' && step < 8) { grain(); g.imageSmoothingEnabled = false; g.globalAlpha = Math.pow(1 - step / 8, 0.7); g.drawImage(noise, M, M, P, P); g.imageSmoothingEnabled = true; }
    }
    tex.needsUpdate = true;
  }
  ctx.textures.load(url).then((t) => { if (!t || !pic) return; img = t.image; draw('', 1); pic.body.material.uniforms.uMap.value = tex; });
  const gauge = new Group();
  const hand = new Mesh(new BoxGeometry(0.022, 0.2, 0.022).translate(0, 0.1, 0), flat(line));
  gauge.add(new Mesh(new TorusGeometry(0.21, 0.011, 6, 30, Math.PI), hand.material), new Mesh(new CircleGeometry(0.03, 12), hand.material), hand);
  group.add(gauge);

  const st = { runs: xs.map(() => -1), last: -1, press: 0, tour: -1, part: 1, paint: null, stamped: false, lean: 0, vel: 0, step: 0, more: false, ct: 0, inked: false, floor: -1 };
  const sig = { lit: -1, dark: false };
  const v = new Vector3();

  // reduced motion: a door picked by hand is drawn whole, down to the index, with no flight
  function pick(k) { st.runs[k] = ctx.reduced ? AT_INDEX : 0; st.last = k; st.part = 1; st.floor = -1; if (names[k]) announce(names[k].textContent.trim()); }
  function paint(mode) {
    st.part = 2;
    if (!ctx.reduced) st.paint = { mode, t: 0 };
    // reduced motion: a press shows the picture half made, the same press again shows it whole with its stamp
    else if (st.paint && st.paint.mode === mode) { st.paint = null; st.stamped = true; } else st.paint = { mode, t: PAINT / 2 };
    if (sentence) announce(sentence.textContent.trim());
  }
  const mine = () => { st.tour = -1; };                                       // the tour stops for good on the first input
  const onGo = () => { mine(); if (ctx.reduced) sig.step(); else pick(st.press++ % xs.length); };
  const onDial = { a: () => { mine(); paint('a'); }, b: () => { mine(); paint('b'); } };
  // which tall door a point of the screen is on, with a finger's width of grace around it (or -1)
  const hit = (e) => doors.findIndex((d) => {
    const p = labels.project(v.set(tower.x + tower.shift + d.x, tower.floors[0].y + tower.lift + FLOOR.h / 2 + 0.28, tower.z + FLOOR.w / 2 - 0.15));
    return Math.abs(e.clientX - p.x) < 30 && Math.abs(e.clientY - p.y) < 46;
  });
  const choose = (k) => { mine(); st.press = k + 1; pick(k); };
  const main = el.closest('main');
  const point = (on) => { for (const n of [ctx.canvas, main]) if (n) n.style.cursor = on ? 'pointer' : ''; };      // the pointer over a door shows it can be picked
  // a click on the scene itself, wherever it lands in the page: not one on a control or a callout
  const onScene = (e) => { if (!group.visible || e.target.closest('button, a, summary, li, [data-hit]')) return; const k = hit(e); if (k >= 0) choose(k); };
  const onName = names.map((n, k) => () => choose(k));
  const setMore = (on) => { st.more = on; if (stamp) stamp.setAttribute('aria-expanded', String(on)); };
  const onStamp = (e) => { if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMore(!st.more); } };
  const onKey = (e) => { if (e.key === 'Escape') setMore(false); };
  if (go) go.addEventListener('click', onGo);
  for (const m of ['a', 'b']) if (dial[m]) { dial[m].addEventListener('click', onDial[m]); dial[m].setAttribute('aria-pressed', 'false'); }
  window.addEventListener('click', onScene);
  names.forEach((n, k) => n.addEventListener('click', onName[k]));
  window.addEventListener('keydown', onKey);
  if (stamp) { stamp.tabIndex = 0; stamp.setAttribute('role', 'button'); stamp.dataset.hit = ''; stamp.addEventListener('click', onStamp); stamp.addEventListener('keydown', onStamp); setMore(false); }

  // back to ink lines: the stack is leaving this stage (the next frame of the world sets paper again)
  function unink() {
    if (st.inked) tower.setInk(INK);
    st.inked = false;
    tower.floors.forEach((f) => f.mark && f.mark.material.uniforms.uTint.value.set(INK));
  }
  sig.play = () => { st.tour = 0; };
  // Reduced motion: no flight. The button walks four stops: each door to its picker, then on to the index
  sig.step = () => {
    st.step = (st.step % 4) + 1;
    if (st.step === 1) st.runs.fill(-1);
    const k = st.step < 3 || xs.length < 2 ? 0 : 1;
    st.runs[k] = st.step % 2 ? AT_PICK + 0.6 : AT_INDEX; st.last = k; st.part = 1;
  };
  sig.still = () => { st.runs.fill(AT_INDEX); st.step = 4; st.last = xs.length - 1; st.part = 1; st.paint = null; st.stamped = true; };
  sig.reset = () => {
    st.runs.fill(-1); st.last = -1; st.press = 0; st.tour = -1; st.part = 1; st.paint = null; st.stamped = false; st.lean = 0; st.vel = 0; st.step = 0; sig.lit = -1;
    setMore(false);
    unink();
    [...names, indexName, stamp].forEach((n) => n && n.classList.remove('is-on'));
    for (const n of [indexName, stamp]) if (n) n.style.transform = '';
    if (world.ui) { delete world.ui.dataset.part; world.ui.removeAttribute('data-more'); }
    point(false);
    draw('', 1);
    threads[1].show = 0; threads[1].update();
  };

  sig.update = (dt, amount) => {
    // a dark stage: the outlines of empty floors and their question marks print in paper while the world is open
    const inked = night && (mats.irisOpen || 0) > 0.5;
    if (inked !== st.inked) { st.inked = inked; tower.setInk(inked ? PAPER : INK); }
    if (inked) tower.floors.forEach((f) => f.mark && f.mark.material.uniforms.uTint.value.set(PAPER));
    const on = amount > 0.01;
    group.visible = on; slab.visible = on;
    const f = tower.floors;
    const step = ctx.reduced ? 0 : dt;
    if (!on) { threads[1].show = 0; threads[1].update(); if (pic) { pic.show = 0; pic.update(); } pickers.forEach((p) => { p.cores.show = 0; p.cores.update(); }); return; }

    // the tour: both doors, then both ways of painting. Then it waits for the visitor
    if (st.tour >= 0) {
      const t0 = st.tour;
      st.tour += dt;
      const due = (at) => t0 < at && st.tour >= at;
      if (due(0.05)) pick(0);
      if (due(0.95) && xs.length > 1) pick(1);
      if (due(AT_INDEX + 2.2)) paint('a');
      if (due(AT_INDEX + 2.2 + PAINT + BACK + 0.7)) paint('b');
      if (st.tour > AT_INDEX + 2.2 + 2 * (PAINT + BACK) + 1) st.tour = -1;
    }

    // doors and threads: 0.42 s a floor, 1.25 s at the door's own picker, then down to the one index
    const top = f[0].y + FLOOR.h / 2;
    const base = tower.x + tower.shift;
    slab.position.set(base, 0.062, tower.z + 2.08);
    slab.material.uniforms.uShow.value = amount;
    let arrived = 0;
    sig.lit = -1;
    doors.forEach((d, k) => {
      if (st.runs[k] >= 0) st.runs[k] += step;
      const t = st.runs[k];
      const at = t < 0 ? 0 : t < AT_PICK ? t / DROP : t < GO_ON ? 5 : Math.min(10, 5 + (t - GO_ON) / DROP);
      d.swing += ((t >= 0 ? 1 : 0) - d.swing) * (ctx.reduced ? 1 : 1 - Math.exp(-8 * dt));
      d.pivot.rotation.y = -d.swing * 1.05;
      d.pivot.position.set(d.x - 0.12 + f[0].mesh.position.x, top, FLOOR.w / 2 - 0.15);
      d.frame.position.set(f[0].mesh.position.x, top, FLOOR.w / 2 - 0.15);
      d.leaf.material.uniforms.uShow.value = amount * tower.show;
      d.leaf.material.uniforms.uPulse.value = k === st.last && t >= 0 && t < AT_PICK ? 0.4 : 0;
      const path = paths[k];
      const x = base + d.x, z = tower.z + FRONT;
      path[0].set(x, top + tower.lift + 0.5, z);
      for (let i = 0; i < 9; i++) path[i + 1].set(x, f[i].y + tower.lift, z);
      path[10].set(base + d.x * 0.35 + (k - 0.5) * 0.3, 0.13, tower.z + 2.08);
      const th = threads[k];
      if (th) { th.points = path; th.at(at); th.show = t >= 0 ? amount : 0; th.dark = night ? 1 : 0; if (k) th.update(); }
      const floor = t >= 0 && at < 9.6 ? Math.max(0, Math.min(8, Math.floor(at + 0.001) - 1)) : -1;
      if (k === st.last && floor !== st.floor) { st.floor = floor; if (floor >= 0) f[floor].pulse = 1; }
      if (st.part === 1 && at > 4.2 && at < 6.4) sig.lit = MODEL;       // the one callout of this moment: the floor where each door picks
      if (at >= 10) arrived++;
      if (names[k] && !ctx.phone) names[k].classList.toggle('is-on', amount > 0.5 && st.part === 1);

      // its picker: the ring goes from model to model while the thread waits there, and never rests on one
      const p = pickers[k];
      const here = t >= AT_PICK - 0.2 && t < GO_ON + 0.3;
      const cx = p.x + f[MODEL].mesh.position.x, cy = f[MODEL].y;
      p.at = here && !ctx.reduced ? Math.sin((t - AT_PICK) * 4.4) * p.reach : 0;
      p.on += ((here ? 1 : 0) - p.on) * (ctx.reduced ? 1 : 1 - Math.exp(-7 * dt));
      p.menu.position.set(cx, cy, FRONT); p.ring.position.set(cx, cy + p.at, FRONT);
      p.ring.material.opacity = amount * p.on;
      p.cores.show = amount; p.cores.fade = t >= AT_PICK ? 0.95 : 0.55; p.cores.night = 0;
      p.cores.items.forEach((c) => { c.active = here ? Math.max(0, 1 - Math.abs(p.at - c.dy) / STEP) : 0; });
      p.cores.update();
      p.cores.items.forEach((c) => c.mesh.position.set(cx, cy + c.dy, FRONT));
    });
    lineMat.opacity = amount;
    if (ctx.input.moved && !ctx.input.touch) point(hit({ clientX: ctx.input.px, clientY: ctx.input.py }) >= 0);
    slab.material.uniforms.uPulse.value = arrived ? 0.25 : 0;
    if (!ctx.phone) for (const [n, k] of names.map((n, k) => [n, k])) n.style.transform = pinned(v.set(base + xs[k] + (k ? 0.08 : -0.08), top + tower.lift + 0.6, tower.z + FLOOR.w / 2 - 0.15), 0.5, 1);
    if (ctx.phone) names.forEach((n, k) => n.classList.toggle('is-on', st.runs[k] >= 0 && st.part === 1));
    if (indexName) {
      indexName.classList.toggle('is-on', arrived > 0 && st.part === 1 && amount > 0.5);
      if (!ctx.phone) indexName.style.transform = pinned(v.set(base + 1.42, 0.1, tower.z + 2.08), 0, 0.5, 8);
    }

    // the picture and its dial: either way takes 1.6 s, then the needle springs back and the stamp stays
    let want = 0;
    if (st.paint) {
      st.paint.t += step;
      draw(st.paint.mode, st.paint.t / PAINT);
      want = st.paint.mode === 'a' ? SIDE : -SIDE;
      if (st.paint.t > PAINT + BACK) { st.paint = null; st.stamped = true; }
    } else draw('', 1);
    for (const m of ['a', 'b']) if (dial[m]) dial[m].setAttribute('aria-pressed', String(!!st.paint && st.paint.mode === m));
    if (ctx.reduced) st.lean = want;
    else { st.vel += ((want - st.lean) * 90 - st.vel * 9) * dt; st.lean += st.vel * dt; }
    hand.rotation.z = st.lean;
    hand.material.opacity = amount;
    if (pic) {
      pic.show = amount; pic.update();
      gauge.position.set(pic.body.position.x - base, f[MODEL].y + FLOOR.h / 2 - 0.42, 0.62);
      const done = st.stamped && !st.paint && amount > 0.5;
      if (stamp) { stamp.classList.toggle('is-on', done); if (!ctx.phone) stamp.style.transform = `${pinned(pic.body.position, 0.5, 0.5, 20, 24)} rotate(-8deg)`; }
    }
    gauge.visible = !!pic;
    if (world.ui) { world.ui.dataset.part = String(st.part); world.ui.toggleAttribute('data-more', st.more && st.part === 2); }
  };
  // where an element sits for a world point: the same transform labels.pin writes, kept here so it can also turn
  function pinned(point, ax, ay, dx = 0, dy = 0) {
    const p = labels.project(point);
    return `translate3d(${(p.x + dx).toFixed(1)}px,${(p.y + dy).toFixed(1)}px,0) translate(${-ax * 100}%,${-ay * 100}%)`;
  }

  // The catch (beat d): plates on the wall. A renamed one flips to its new name, a shut-down one drops and hangs
  // by a corner, one whose claim carries an expiry date tilts
  sig.catch = (k) => {
    if (k <= 0) { st.ct = 0; plates.forEach((p) => { p.classList.remove('is-on'); p.removeAttribute('data-new'); p.style.transform = ''; }); return; }
    if (k > 0.55) st.ct += ctx.reduced ? 99 : ctx.dt || 0.016;
    plates.forEach((p, n) => {
      const e = clamp01((st.ct - 0.55 - n * 0.28) / 0.5);
      p.classList.toggle('is-on', k > 0.55 && st.ct > n * 0.07);
      const kind = p.dataset.kind;
      if (kind === 'renamed') p.toggleAttribute('data-new', e > 0.5);
      if (ctx.phone) return;
      const drop = kind === 'shut-down' ? backOut(e) : 0;
      const turn = kind === 'stale' ? (n % 2 ? -3 : 3.5) * smooth(e) : -11 * drop;
      const flip = kind === 'renamed' ? Math.max(0.05, Math.abs(Math.cos(e * Math.PI))) : 1;
      v.set(tower.x + tower.shift + 2.85 + (n % 3) * 1.62, 2.66 - Math.floor(n / 3) * 0.86, tower.z - 2.4);
      p.style.transform = `${pinned(v, 0.5, 0.5, 0, drop * 14)} rotate(${turn.toFixed(2)}deg) scaleY(${flip.toFixed(3)})`;
    });
  };

  sig.dispose = () => {
    sig.reset(); sig.catch(0);
    if (go) go.removeEventListener('click', onGo);
    for (const m of ['a', 'b']) if (dial[m]) dial[m].removeEventListener('click', onDial[m]);
    window.removeEventListener('click', onScene);
    names.forEach((n, k) => n.removeEventListener('click', onName[k]));
    window.removeEventListener('keydown', onKey);
    if (stamp) { stamp.removeEventListener('click', onStamp); stamp.removeEventListener('keydown', onStamp); stamp.removeAttribute('tabindex'); stamp.removeAttribute('role'); stamp.removeAttribute('aria-expanded'); delete stamp.dataset.hit; }
    pickers.forEach((p) => p.cores.dispose());
    if (pic) pic.dispose();
    threads[1].dispose();
    tex.dispose();
    for (const root of [group, slab]) { root.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); root.removeFromParent(); }
  };
  return sig;
}
