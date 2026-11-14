/* THE TOY BOX ITSELF: the approved test's js/main.js (tests/toy-box/), made a part of the long page.
   What is the test's, unchanged: the room's 3D camera measured to the painting, the box and its burst, the toys, their
   physics, the huddle, the hand (pick one up, throw it, it knocks the others over), the tag that names the toy held,
   the hint, the phone's picture, motion turned off.
   What the long page changes: the chapter (../toybox.js) says where the camera looks (a part of the painting, rect)
   and how far down the box's track the reader is (prog, 0..1, the test's own marks: the box bursts at 0.34 and shuts
   again above 0.3); time comes from the page's frame; the picture is drawn only when the chapter asks; and the hand
   is heard on the chapter's section (the picture is behind the page, which takes the presses). The camera's walk and
   the words over the picture are the chapter's. */

import * as THREE from 'three';
import { World, rng } from './physics.js';
import { ROSTER } from './roster.js';
import { makeRoom, PAINT, toPaint, rayAt } from './room.js';
import { makeBox } from './box.js';
import { loadToys, placeShadows, makeShadows } from './toys.js';

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

export const Y_BURST = 0.34;   // the box's track scrolled this far, the box bursts
export const Y_CLOSE = 0.3;    // scrolled back above this, the toys go home and the lid shuts
const H = 1 / 120;             // the physics' step

// o: { canvas, hand (the element the presses land on), top: { tag, hint, hintText, count }, held, reduced, img, back,
//      redraw, onReady }
export function mountPlay(o) {
  const canvas = o.canvas, STILL = o.held && !o.reduced, RM = o.reduced;
  const elTag = o.top.tag, elHint = o.top.hint, elHintText = o.top.hintText, elCount = o.top.count;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x1a1424, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(PAINT.fov, PAINT.FW / PAINT.FH, 0.05, 80);
  camera.position.set(0, PAINT.HC, 0);

  let roomIn = false, alive = true;
  const room = makeRoom(THREE, scene, renderer, { img: o.img, back: o.back, onBack: () => { dirty = true; o.redraw(); } });
  room.ready.then((ok) => { if (!alive) return; roomIn = true; dirty = true; o.redraw(); if (o.onReady) o.onReady(ok); });
  const world = new World();
  world.planes.push(
    { nx: 0, ny: 1, nz: 0, d: 0, mu: 0.7, e: 0.4, floor: true },
    { nx: 0, ny: 0, nz: 1, d: PAINT.D - 0.05, mu: 0.3, e: 0.45 },
    { nx: 1, ny: 0, nz: 0, d: -PAINT.XL - 0.02, mu: 0.3, e: 0.45 },
    { nx: -1, ny: 0, nz: 0, d: PAINT.XR - 0.02, mu: 0.3, e: 0.45 },
  );
  // the paper lamp is solid
  world.balls.push({ x: PAINT.LAMP.x, y: 0.16, z: PAINT.LAMP.z, r: 0.17 }, { x: PAINT.LAMP.x, y: 0.42, z: PAINT.LAMP.z, r: 0.15 });

  /* -------------------------------------------------------------- the two pictures: a desk's and a phone's */
  let vw = 1, vh = 1, phone = false, lay = null;
  function layout() {
    vw = canvas.clientWidth || window.innerWidth; vh = canvas.clientHeight || window.innerHeight;
    phone = vw <= 720 || vw / vh < 0.8;
    const asp = vw / vh;
    const wMax = Math.min(PAINT.W, PAINT.H * asp);
    if (!phone) {
      lay = {
        scale: 1,
        box: { x: -0.62, z: -2.3 },
        rows: [{ z: -1.5, x0: 0.0, x1: 0.94 }, { z: -1.8, x0: -0.08, x1: 1.16 }, { z: -2.1, x0: -0.12, x1: 1.34 }, { z: -2.4, x0: -0.08, x1: 1.0 }],
        keys: [
          { t: 0.0, cx: PAINT.W / 2, cy: PAINT.H / 2, w: wMax * 0.985 },
          { t: 0.06, cx: PAINT.W / 2, cy: PAINT.H / 2, w: wMax * 0.985 },
          { t: 0.3, cx: 1190, cy: 985, w: 1240 },
          { t: 0.46, cx: 1510, cy: 1000, w: 1580 },
          { t: 0.78, cx: 1510, cy: 1000, w: 1580 },
          { t: 1.0, cx: 1440, cy: 1010, w: 1760 },
        ],
      };
    } else {
      lay = {
        scale: 0.9,
        box: { x: 0.18, z: -2.44 },
        rows: [{ z: -1.42, x0: -0.01, x1: 0.53 }, { z: -1.64, x0: -0.05, x1: 0.58 }, { z: -1.87, x0: -0.1, x1: 0.63 }, { z: -2.11, x0: -0.15, x1: 0.68 }, { z: -2.4, x0: 0.52, x1: 0.86 }],
        keys: [
          { t: 0.0, cx: 1692, cy: PAINT.H / 2, w: wMax },
          { t: 0.06, cx: 1692, cy: PAINT.H / 2, w: wMax },
          { t: 0.3, cx: 1490, cy: 890, w: wMax * 0.6 },
          { t: 0.46, cx: 1574, cy: 2000, w: wMax * 0.77 },
          { t: 1.0, cx: 1574, cy: 2000, w: wMax * 0.77 },
        ],
      };
    }
    lay.asp = asp; lay.wMax = wMax;
  }
  // the test's camera at a point of its track (the chapter blends into it from look B's doorway)
  function rectAt(t, out) {
    const K = lay.keys;
    let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++;
    const a = K[i], b = K[i + 1], k = ss(a.t, b.t, t);
    let w = Math.min(lerp(a.w, b.w, k), lay.wMax), h = w / lay.asp;
    out.w = w; out.h = h;
    out.x = clamp(lerp(a.cx, b.cx, k) - w / 2, 0, PAINT.W - w);
    out.y = clamp(lerp(a.cy, b.cy, k) - h / 2, 0, PAINT.H - h);
    return out;
  }

  /* -------------------------------------------------------------- the box and what is in it */
  const box = makeBox(THREE, scene);
  const shadows = makeShadows(THREE, scene, ROSTER.length + 2);
  const toys = [];
  const rand = rng(7);
  let state = 'closed';      // closed | open | returning
  let forced = false, forcedAt = 0;
  let dirty = true;
  let simT = 0;
  const mouth = new THREE.Vector3();

  function slots() {
    const rows = lay.rows, nr = rows.length;
    const need = (t) => (Math.min(t.w0, t.def.h * 0.74) + 0.03) * lay.scale;
    const cast = toys.filter((t) => !t.def.side).sort((a, b) => a.def.h - b.def.h || a.index - b.index);
    const ends = rows.map(() => ({ l: [], r: [], w: 0 }));
    for (const t of toys) if (t.def.side) { const e = ends[Math.min(nr - 1, Math.round((t.def.back || 0) * (nr - 1)))]; (t.def.side < 0 ? e.l : e.r).push(t); e.w += need(t); }
    const roomW = rows.reduce((s, r, i) => s + Math.max(0.1, r.x1 - r.x0 - ends[i].w), 0), want = cast.reduce((s, t) => s + need(t), 0);
    let k = 0;
    for (let r = 0; r < nr; r++) {
      const R = rows[r], cap = Math.max(0.1, R.x1 - R.x0 - ends[r].w) * Math.max(1, want / roomW) + 0.02;
      const row = []; let sum = 0;
      while (k < cast.length && (r === nr - 1 || sum + need(cast[k]) <= cap)) { sum += need(cast[k]); row.push(cast[k++]); }
      const mid = []; row.slice().reverse().forEach((t, i) => { if (i % 2) mid.push(t); else mid.unshift(t); });
      const order = [...ends[r].l, ...mid, ...ends[r].r];
      const all = sum + ends[r].w, fit = Math.min(1, (R.x1 - R.x0) / all), c = (R.x0 + R.x1) / 2;
      let x = c - all * fit / 2;
      order.forEach((t) => {
        const w = need(t) * fit, cx = x + w / 2; x += w;
        const u = (cx - c) / Math.max(R.x1 - R.x0, 0.3);
        const j = ((t.index * 7919) % 13) / 13 - 0.5;
        const zz = R.z - Math.abs(u) * 0.12 + j * 0.03;
        t.body.slot = { x: cx, z: zz, yaw: Math.atan2(-cx, -zz) * 0.5 - u * 0.5 + j * 0.24 + (t.def.turn || 0) * (t.def.side || 0) };
      });
    }
    const n = toys.length;
    for (let it = 0; it < 40; it++) {
      let moved = false;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const A = toys[i].body, B = toys[j].body, a = A.slot, b = B.slot;
        const nd = A.foot + B.foot + 0.012; let dx = b.x - a.x, dz = b.z - a.z; const d = Math.hypot(dx, dz);
        if (d >= nd) continue;
        if (d < 1e-4) { dx = 1; dz = 0; } else { dx /= d; dz /= d; }
        const push = (nd - d) * 0.52;
        a.x -= dx * push; a.z -= dz * push * 0.7; b.x += dx * push; b.z += dz * push * 0.7; moved = true;
      }
      if (!moved) break;
    }
  }
  function settle() {
    slots();
    for (const t of toys) { const s = t.body.slot; t.body.place(s.x, s.z, s.yaw + t.body.yaw0); t.pop = 1; t.kin = null; t.launch = null; }
    state = 'open'; box.setOpen(1, true); dirty = true;
  }
  function launch(t, delay) {
    const b = t.body, s = b.slot;
    b.on = false; t.kin = null; t.launchAt = world.t + delay;
    t.launch = () => {
      const g = world.g, vy = 2.5 + rand() * 0.75, T = 2 * vy / g * 0.93;
      b.px = mouth.x + (rand() - 0.5) * 0.22; b.py = mouth.y - 0.08; b.pz = mouth.z + (rand() - 0.5) * 0.1;
      const tx = s.x + (rand() - 0.5) * 0.5, tz = s.z + (rand() - 0.3) * 0.4;
      b.vx = (tx - b.px) / T; b.vy = vy; b.vz = (tz - b.pz) / T;
      const a = rand() * 6.283, w = 5 + rand() * 6;
      b.wx = Math.cos(a) * w; b.wz = Math.sin(a) * w; b.wy = (rand() - 0.5) * 6;
      b.setYaw(rand() * 6.283);
      b.on = true; b.asleep = false; b.rest = 0; b.held = null; b.ghost = 0.4; b.knock = T + 0.2 + rand() * 0.35; b.hopT = rand() * 0.2;
      b.hot = T + 0.3; b.rise = 0; b.away = 0; b.pass = false; b.dock = null; b.stuck = 0; b.lastDist = 9;
      t.pop = 0.25; t.launch = null;
    };
  }
  function burst() {
    if (state === 'open') return;
    slots();
    state = 'open'; box.burst(simT);
    const order = toys.slice().sort((a, b) => a.def.h - b.def.h);
    order.forEach((t, i) => launch(t, 0.05 + i * 0.055));
    dirty = true;
  }
  function goHome() {
    if (state !== 'open') return;
    state = 'returning'; drop(false);
    toys.forEach((t, i) => {
      const b = t.body;
      t.launch = null;
      if (!b.on) { t.kin = null; return; }
      b.on = false;
      t.kin = { t0: simT + i * 0.022, dur: 0.4, x: b.px, y: b.py, z: b.pz, q: new THREE.Quaternion(b.qx, b.qy, b.qz, b.qw) };
    });
    box.closeAt = simT + 0.42 + toys.length * 0.022;
  }

  layout();
  const CAST = ROSTER.filter((d) => !(phone && d.desk));
  let loaded = false;
  loadToys(THREE, renderer, scene, CAST, (toy) => {
    if (!alive) return;
    // (a toy's place in the huddle follows its line in the roster, not the order the models happen to arrive in: so
    // the huddle is the same on every load, and after any scrolling)
    toy.index = CAST.indexOf(toy.def); toy.pop = 1; toy.kin = null; toy.launch = null;
    toys.push(toy); toys.sort((a, b) => a.index - b.index);
    world.bodies.push(toy.body); world.bodies.sort((a, b) => toys.findIndex((t) => t.body === a) - toys.findIndex((t) => t.body === b));
    slots();
    for (const t of toys) if (t.body.asleep && t.body.on) { const s = t.body.slot; t.body.place(s.x, s.z, s.yaw + t.body.yaw0); }
    if (state === 'open') {
      if (STILL || RM) { const s = toy.body.slot; toy.body.place(s.x, s.z, s.yaw + toy.body.yaw0); }
      else { launch(toy, 0.1); for (const t of toys) if (t !== toy && t.body.on) t.body.wake(); }
    } else if (state === 'returning') toy.pivot.visible = false;
    countText = toys.length < CAST.length ? `${toys.length} of ${CAST.length} toys in the box` : '';
    dirty = true; o.redraw();
  }, () => { loaded = true; dirty = true; o.redraw(); });

  /* -------------------------------------------------------------- the hand */
  const ray = { ox: 0, oy: PAINT.HC, oz: 0, dx: 0, dy: 0, dz: -1 };
  const rect = { x: 0, y: 0, w: 1, h: 1 };
  let hold = null;
  let tagToy = null, tagUntil = 0;
  let canHand = false;       // the chapter says the room is the picture on the screen (the hand is heard only then)
  function setRay(cx, cy) {
    const r = canvas.getBoundingClientRect();
    rayAt(rect.x + (cx - r.left) / r.width * rect.w, rect.y + (cy - r.top) / r.height * rect.h, ray);
  }
  function pick(grow, not) {
    let best = null, bt = 1e9, bs = 0;
    for (const t of toys) {
      const b = t.body; if (!b.on || t === not) continue;
      b.centres();
      for (let s = 0; s < b.spheres.length; s++) {
        const cx = b.wc[s * 3] - ray.ox, cy = b.wc[s * 3 + 1] - ray.oy, cz = b.wc[s * 3 + 2] - ray.oz;
        const r = b.spheres[s].r * grow, tc = cx * ray.dx + cy * ray.dy + cz * ray.dz;
        const d2 = cx * cx + cy * cy + cz * cz - tc * tc;
        if (tc > 0 && d2 < r * r) { const th = tc - Math.sqrt(r * r - d2); if (th < bt) { bt = th; best = t; bs = s; } }
      }
    }
    return best ? { toy: best, s: bs, z: best.body.pz } : null;
  }
  function overBox() {
    const X = box.bounds, m = 0.06;
    let t0 = 0, t1 = 1e9;
    for (const [oo, d, a, b] of [[ray.ox, ray.dx, X.x0 - m, X.x1 + m], [ray.oy, ray.dy, X.y0, X.y1 + 0.12], [ray.oz, ray.dz, X.z0 - m, X.z1 + m]]) {
      if (Math.abs(d) < 1e-9) { if (oo < a || oo > b) return false; continue; }
      let ta = (a - oo) / d, tb = (b - oo) / d; if (ta > tb) { const s = ta; ta = tb; tb = s; }
      if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false;
    }
    return true;
  }
  function target(h, dt) {
    const over = pick(1.0, h.toy);
    if (over) h.zWant = clamp(over.z, -PAINT.D + 0.3, -1.3);
    if (dt > 0) h.z += (h.zWant - h.z) * (1 - Math.exp(-dt * 9));
    const k = (h.z - ray.oz) / ray.dz, b = h.toy.body;
    b.held.tx = clamp(ray.ox + ray.dx * k, PAINT.XL + 0.1, PAINT.XR - 0.1);
    b.held.ty = clamp(ray.oy + ray.dy * k, b.spheres[h.s].r + 0.03, 2.2);
    b.held.tz = h.z;
    if (dt > 0) return;
    h.samples.push({ t: performance.now(), x: b.held.tx, y: b.held.ty });
    if (h.samples.length > 6) h.samples.shift();
  }
  function grab(hit, e) {
    const b = hit.toy.body;
    b.centres(); b.wake();
    const z = clamp(b.wc[hit.s * 3 + 2], -PAINT.D + 0.3, -1.25);
    b.held = { s: hit.s, tx: 0, ty: 0, tz: z };
    hold = { toy: hit.toy, s: hit.s, z, zWant: z, samples: [], id: e.pointerId, t0: performance.now(), x0: e.clientX, y0: e.clientY };
    target(hold, 0);
    for (const t of toys) if (t.body.on) t.body.wake();
    tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy);
    document.documentElement.classList.add('tb-grabbing');
    try { o.hand.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
    hinted = true; hint();
    dirty = true; o.redraw();
  }
  function drop(thrown) {
    if (!hold) return;
    const b = hold.toy.body, S = hold.samples;
    b.held = null; b.knock = 0.5; b.wake();
    if (thrown && S.length > 1) {
      const a = S[0], z = S[S.length - 1], dt = Math.max((z.t - a.t) / 1000, 0.016);
      let vx = (z.x - a.x) / dt, vy = (z.y - a.y) / dt;
      const v = Math.hypot(vx, vy), vmax = 8.5; if (v > vmax) { vx *= vmax / v; vy *= vmax / v; }
      if (v > 0.6) { b.hot = 1.6; b.vx = vx; b.vy = vy; b.vz = clamp((huddleZ() - b.pz) * 1.1, -1.4, 1.4); b.knock = 0.85; }
    }
    if (hold.toy.onDrop) hold.toy.onDrop();
    tagUntil = simT + 2.6;
    document.documentElement.classList.remove('tb-grabbing');
    hold = null; dirty = true; o.redraw();
  }
  const huddleZ = () => (lay.rows[0].z + lay.rows[Math.min(lay.rows.length - 1, 3)].z) / 2;
  const canPlay = () => state === 'open' && !STILL;
  // (the picture is behind the page: a press lands on the section, or on whatever of the page is there. A press on a
  // card, a link, a button or the rail is theirs.)
  const mine = (e) => canHand && !(e.target.closest && e.target.closest('a, button, input, .paper, #rail, .chapter-top'));
  let tap = null;
  function onDown(e) {
    if (e.button > 0 || !mine(e)) return;
    setRay(e.clientX, e.clientY);
    if (state === 'closed') { if (overBox()) { tap = { id: e.pointerId, x: e.clientX, y: e.clientY }; if (e.pointerType === 'mouse') e.preventDefault(); } return; }
    if (state !== 'open') return;
    const hit = pick(e.pointerType === 'mouse' ? 1.15 : 1.5);
    if (!hit) return;
    if (e.pointerType === 'mouse') e.preventDefault();       // (no text is selected by a drag that holds a toy)
    if (RM || STILL) { tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy); dirty = true; o.redraw(); return; }
    grab(hit, e);
  }
  function onMove(e) {
    if (hold && e.pointerId === hold.id) { setRay(e.clientX, e.clientY); target(hold, 0); hold.toy.body.wake(); dirty = true; return; }
    if (e.pointerType === 'mouse') {
      let over = false;
      if (mine(e)) { setRay(e.clientX, e.clientY); over = state === 'closed' ? overBox() : canPlay() && !!pick(1.15); }
      document.documentElement.classList.toggle('tb-grab', over);
    }
  }
  const up = (e) => {
    if (tap && e.pointerId === tap.id) { if (e.type === 'pointerup' && state === 'closed' && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 14) openByHand(); tap = null; }
    if (hold && e.pointerId === hold.id) drop(e.type === 'pointerup');
  };
  // A finger on a toy plays with the toy; a finger anywhere else scrolls the page. And so that the huddle is never a
  // trap for a thumb: a quick swipe up or down that merely starts on a toy is a scroll too. Only a finger that rests
  // a moment, or moves sideways, picks the toy up. (The test's own rule, word for word.)
  function onTouchMove(e) {
    if (!hold) return;
    if (hold.flick === undefined) {
      const t = e.touches[0], dx = t.clientX - hold.x0, dy = t.clientY - hold.y0;
      const ms = performance.now() - hold.t0;
      hold.flick = ms < 400 && Math.abs(dy) / Math.max(ms, 1) > 0.12 && Math.abs(dy) > Math.abs(dx) * 1.3;
      if (hold.flick) { drop(false); tagUntil = 0; return; }
    }
    e.preventDefault();
  }
  const lost = (e) => { if (hold && e.pointerId === hold.id) drop(false); };
  o.hand.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  o.hand.addEventListener('lostpointercapture', lost);
  o.hand.addEventListener('touchmove', onTouchMove, { passive: false });

  function openByHand() { forced = true; forcedAt = prog; burst(); hinted = false; hint(); o.redraw(); }
  const onHint = () => { if (state === 'closed') openByHand(); };
  elHint.addEventListener('click', onHint);

  /* -------------------------------------------------------------- the words over the picture */
  let hinted = false, lastHint = null;
  function hint() {
    let s = '';
    if (!canHand) s = '';
    else if (RM) s = toys.length ? 'Tap a toy to see where it came from' : '';
    else if (state === 'closed') s = prog < 0.12 ? '' : 'Open the box';
    else if (state === 'open' && !hinted && prog < 0.9) s = phone ? 'Pick one up. Throw it.' : 'Pick one up and throw it';
    if (STILL) s = '';
    if (s !== lastHint) { lastHint = s; if (s) elHintText.textContent = s; elHint.classList.toggle('off', !s); elHint.tabIndex = state === 'closed' && s ? 0 : -1; }
  }
  let countText = '', countWas = null;
  function count() { const c = canHand ? countText : ''; if (c !== countWas) { countWas = c; elCount.textContent = c; } }
  function showTag(toy) {
    elTag.querySelector('.tag-from').textContent = toy.def.from;
    elTag.querySelector('.tag-name').textContent = toy.def.name;
    elTag.querySelector('.tag-how').textContent = toy.def.how;
    elTag.classList.add('on');
  }
  const P2 = [0, 0];
  function placeTag() {
    if (!tagToy) return;
    if (simT > tagUntil || !tagToy.body.on || !canHand) { elTag.classList.remove('on'); tagToy = null; return; }
    const b = tagToy.body, tw = elTag.offsetWidth, th = elTag.offsetHeight;
    if (phone) {
      elTag.classList.add('pinned'); elTag.classList.remove('below');
      elTag.style.transform = `translate(${Math.round((vw - tw) / 2)}px, 46px)`;
      return;
    }
    elTag.classList.remove('pinned');
    toPaint(b.px, b.py + (b.h - b.com) + 0.04, b.pz, P2);
    let x = (P2[0] - rect.x) / rect.w * vw, y = (P2[1] - rect.y) / rect.h * vh;
    const below = y - th - 16 < 8;
    if (below) { toPaint(b.px, b.py - b.com - 0.03, b.pz, P2); y = (P2[1] - rect.y) / rect.h * vh + 16; } else y -= th + 16;
    const left = clamp(x - tw / 2, 10, vw - tw - 10);
    elTag.classList.toggle('below', below);
    elTag.style.setProperty('--tip', clamp(x - left, 22, tw - 22) + 'px');
    elTag.style.transform = `translate(${Math.round(left)}px, ${Math.round(clamp(y, 8, vh - th - 8))}px)`;
  }

  /* -------------------------------------------------------------- the frame */
  let prog = 0, lastProg = -1, acc = 0, frames = 0, firstFrame = true, need = false, lastRect = '';
  function resize() {
    layout();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
    box.setPlace(lay.box.x, lay.box.z, lay.scale);
    mouth.set(lay.box.x, box.bounds.y1 + 0.05, lay.box.z);
    world.boxes = [box.bounds];
    for (const t of toys) t.setScale(lay.scale);
    if (toys.length) { slots(); for (const t of toys) { const b = t.body; if (b.on && b.asleep) b.place(b.slot.x, b.slot.z, b.slot.yaw + b.yaw0); else b.wake(); } }
    dirty = true;
  }
  function viewPlanes() {
    // (the walls the picture's edges make: they follow the camera, within the painting)
    const rx = clamp(rect.x, 0, PAINT.W - 1), rw = Math.min(rect.w, PAINT.W - rx), ry = clamp(rect.y, 0, PAINT.H - 1), rh = Math.min(rect.h, PAINT.H - ry);
    const a = (rx - PAINT.VX) / PAINT.F, b = (rx + rw - PAINT.VX) / PAINT.F, c = (PAINT.VY - ry) / PAINT.F;
    const la = Math.hypot(1, a), lb = Math.hypot(1, b), lc = Math.hypot(1, c);
    const zf = Math.max(1.22, PAINT.HC * PAINT.F / (ry + rh - PAINT.VY) + 0.04);
    world.view = [
      { nx: 1 / la, ny: 0, nz: a / la, d: 0, k: 0.35 },
      { nx: -1 / lb, ny: 0, nz: -b / lb, d: 0, k: 0.35 },
      { nx: 0, ny: -1 / lc, nz: -c / lc, d: PAINT.HC / lc, k: 0.2 },
      { nx: 0, ny: 0, nz: -1, d: -zf, k: 1 },
    ];
  }
  function tick(dt) {
    if (prog !== lastProg) { lastProg = prog; dirty = true; }
    if (RM) { if (state !== 'open' && toys.length && prog >= Y_CLOSE) settle(); else if (state === 'open' && prog < Y_CLOSE) { for (const t of toys) { t.body.on = false; t.pivot.visible = false; } state = 'closed'; box.setOpen(0, true); dirty = true; } }
    else {
      if (forced && prog < Math.min(forcedAt - 0.04, Y_CLOSE)) forced = false;
      if (forced && prog < 0.004 && forcedAt > 0.03) forced = false;
      const want = prog >= Y_BURST || forced || (state === 'open' && prog >= Y_CLOSE);
      if (want && state !== 'open') { if (STILL || firstFrame) settle(); else burst(); }
      else if (!want && state === 'open') { if (STILL || firstFrame) { for (const t of toys) { t.body.on = false; t.pivot.visible = false; } state = 'closed'; box.setOpen(0, true); dirty = true; } else goHome(); }
    }
    firstFrame = false;
    simT += dt;

    let moving = false;
    if (state === 'open' && dt > 0) {
      viewPlanes();
      if (hold) { target(hold, dt); hold.toy.body.wake(); }
      for (const t of toys) if (t.launch && world.t >= t.launchAt) t.launch();
      acc += dt; let n = 0;
      while (acc >= H && n < 14) { world.step(H); acc -= H; n++; }
      if (n === 14) acc = 0;
      moving = world.awake > 0 || toys.some((t) => t.launch);
    } else if (state === 'returning') {
      moving = true;
      let all = true;
      for (const t of toys) {
        const k = t.kin; if (!k) continue;
        const u = clamp((simT - k.t0) / k.dur, 0, 1); if (u < 1) all = false;
        const e = u * u * (3 - 2 * u);
        t.pivot.position.set(lerp(k.x, mouth.x, e), lerp(k.y, mouth.y - 0.1, e) + Math.sin(Math.PI * u) * 0.55 * (1 - 0.3 * e), lerp(k.z, mouth.z, e));
        t.pivot.quaternion.copy(k.q); t.pivot.rotateX(e * 5);
        t.pop = 1 - 0.75 * e; t.pivot.visible = u < 1;
      }
      if ((all && simT >= box.closeAt) || dt === 0) { state = 'closed'; for (const t of toys) { t.kin = null; t.pivot.visible = false; } }
    }
    const playing = box.update(simT, dt, state, RM || STILL ? 0 : ss(0.1, Y_BURST - 0.01, prog), ss(0.14, Y_BURST - 0.01, prog));
    let anim = false;
    for (const t of toys) {
      const b = t.body;
      if (state !== 'returning') {
        t.pivot.visible = b.on;
        if (b.on) {
          if (t.pop < 1) { t.pop = Math.min(1, t.pop + dt * 5); moving = true; }
          const s = b.squash, upv = Math.cos(b.tilt);
          t.pivot.position.set(b.px, b.py + s * b.com * upv, b.pz);
          t.pivot.quaternion.set(b.qx, b.qy, b.qz, b.qw);
          t.pivot.scale.set((1 - s * 0.5) * t.pop, (1 + s) * t.pop, (1 - s * 0.5) * t.pop);
          if (Math.abs(b.squashV) > 0.02 || Math.abs(s) > 0.002) moving = true;
        }
      } else t.pivot.scale.setScalar(t.pop);
      if (t.tick && t.pivot.visible && dt > 0 && t.tick(dt, b)) anim = true;
    }
    if (dirty || moving || playing || anim || hold || tagToy) need = true;
    return moving || playing || anim || !!hold;
  }
  function draw() {
    camera.setViewOffset(PAINT.FW, PAINT.FH, rect.x + PAINT.OX, rect.y + PAINT.OY, rect.w, rect.h);
    placeShadows(shadows, toys, box, PAINT.LAMP);
    hint(); placeTag(); count();
    renderer.render(scene, camera);
    dirty = false; need = false; frames++;
  }

  return {
    rectAt: (t) => { layout(); return rectAt(t, {}); },
    get phone() { return phone; },
    get state() { return state; },
    get ready() { return roomIn; },
    resize,
    // one frame: r is the part of the painting the camera sees ({x, y, w, h}, painting pixels), p the box's track,
    // dt the time since the last frame (0 when time is held), hand: whether the room is the picture (the hand is
    // heard, the hint and the tag show). Returns true while something moves (the chapter keeps asking for frames).
    frame(r, p, dt, hand) {
      if (!alive) return false;
      const key = r.x.toFixed(2) + ',' + r.y.toFixed(2) + ',' + r.w.toFixed(2) + ',' + r.h.toFixed(2);
      if (key !== lastRect) { lastRect = key; dirty = true; }
      rect.x = r.x; rect.y = r.y; rect.w = r.w; rect.h = r.h;
      prog = p;
      if (hand !== canHand) { canHand = hand; if (!hand) { drop(false); document.documentElement.classList.remove('tb-grab'); } dirty = true; }
      const busy = tick(dt);
      if (need) draw();
      return busy;
    },
    hint, pause() { drop(false); },
    // the room is not the picture (the walk, the garden): nothing of the hand shows
    idle() { if (!canHand) return; canHand = false; drop(false); document.documentElement.classList.remove('tb-grab'); hint(); count(); placeTag(); dirty = true; },
    dispose() {
      alive = false; drop(false);
      o.hand.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      o.hand.removeEventListener('lostpointercapture', lost);
      o.hand.removeEventListener('touchmove', onTouchMove);
      elHint.removeEventListener('click', onHint);
      document.documentElement.classList.remove('tb-grab', 'tb-grabbing');
      scene.traverse((ob) => {
        if (ob.geometry) ob.geometry.dispose();
        const ms = ob.material ? (Array.isArray(ob.material) ? ob.material : [ob.material]) : [];
        for (const m of ms) { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); }
      });
      if (scene.environment) scene.environment.dispose();
      renderer.dispose(); renderer.forceContextLoss();
    },
    // for tests
    test: {
      get state() { return state; }, get awake() { return world.awake; }, get loaded() { return loaded; }, get frames() { return frames; },
      toys, world, rect,
      held: () => (hold ? hold.toy.def.id : null),
      advance: (sec) => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) tick(1 / 60); dirty = true; need = true; draw(); return { state, awake: world.awake }; },
      screenOf: (id) => { const t = toys.find((x) => x.def.id === id); if (!t) return null; const b = t.body, p = [0, 0]; toPaint(b.px, b.py, b.pz, p); const cr = canvas.getBoundingClientRect(); return { x: cr.left + (p[0] - rect.x) / rect.w * cr.width, y: cr.top + (p[1] - rect.y) / rect.h * cr.height, on: b.on, asleep: b.asleep }; },
      boxScreen: () => { const X = box.bounds, p = [0, 0]; toPaint((X.x0 + X.x1) / 2, X.y1 * 0.5, X.z1, p); const cr = canvas.getBoundingClientRect(); return { x: cr.left + (p[0] - rect.x) / rect.w * cr.width, y: cr.top + (p[1] - rect.y) / rect.h * cr.height }; },
    },
  };
}
