/* The toy box: the tea room at night, a box on the floor, and every Jefrie inside it.
   The scroll is the camera: where the page is scrolled decides the framing, whether the box is open, and what is
   written over the picture. Time only drives what plays (the burst, the toys' physics), the pointer only what is
   in the hand.   ?y=0.37 puts the scroll at that part of the page; ?still=1 stops the time; ?debug=1 draws the
   room's measured box over the painting; ?fps=1 shows the frame rate and the triangle count. */

import * as THREE from 'three';
import { World, rng } from './physics.js';
import { ROSTER } from './roster.js';
import { makeRoom, PAINT, toPaint, rayAt } from './room.js';
import { makeBox } from './box.js';
import { loadToys, placeShadows, makeShadows } from './toys.js';

const qs = new URLSearchParams(location.search);
const STILL = qs.get('still') === '1';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('rm') === '1';
const DEBUG = qs.get('debug') === '1';
const SHOWFPS = qs.get('fps') === '1';
const MANUAL = qs.get('manual') === '1';   // for tests: time only moves when the test says so

const stage = document.getElementById('stage');
const track = document.getElementById('track');
const canvas = document.getElementById('scene');
const elWord = document.getElementById('word');
const elSay = document.getElementById('say');
const elTag = document.getElementById('tag');
const elHint = document.getElementById('hint');
const elHintText = document.getElementById('hint-text');
const elCount = document.getElementById('count');

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------------------------------------------------------------- the scroll's marks (parts of the track) */
const Y_BURST = 0.34;   // scrolled this far, the box bursts; scrolled back above it, the toys go home and the lid shuts.
const Y_CLOSE = Y_BURST; // One line, not two: the same place on the page is the same picture whichever way it was reached.
const H = 1 / 120;      // the physics' step

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('flat');
}

if (renderer) start();

function start() {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x1a1424, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(PAINT.fov, PAINT.FW / PAINT.FH, 0.05, 80);
  camera.position.set(0, PAINT.HC, 0);

  const room = makeRoom(THREE, scene, renderer, { debug: DEBUG });
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
  const PHONE = window.matchMedia('(max-width: 720px), (max-aspect-ratio: 4/5)');
  let vw = 1, vh = 1, phone = false, lay = null;
  function layout() {
    vw = stage.clientWidth; vh = stage.clientHeight;
    phone = PHONE.matches;   // the same rule as the style sheet's, so the picture and the card always agree
    const asp = vw / vh;
    const wMax = Math.min(PAINT.W, PAINT.H * asp);
    if (!phone) {
      // a desk: the box on the left, the huddle in the middle and right, the paper lamp behind it. Rows of the
      // huddle, front first: how deep each stands and from where to where it may spread (metres).
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
          { t: 1.0, cx: 1440, cy: 1010, w: 1760 },     // the camera steps back and to the left: the card takes the left of the screen, the huddle keeps the right
        ],
      };
    } else {
      // a phone: a tall picture, so the huddle is deep instead of wide: a wedge coming toward the reader, the box
      // open behind it
      lay = {
        scale: 0.9,
        box: { x: 0.18, z: -2.44 },
        rows: [{ z: -1.42, x0: -0.01, x1: 0.53 }, { z: -1.64, x0: -0.05, x1: 0.58 }, { z: -1.87, x0: -0.1, x1: 0.63 }, { z: -2.11, x0: -0.15, x1: 0.68 }, { z: -2.4, x0: 0.52, x1: 0.86 }],
        keys: [
          { t: 0.0, cx: 1692, cy: PAINT.H / 2, w: wMax },          // the box and the paper lamp, the whole height of the room
          { t: 0.06, cx: 1692, cy: PAINT.H / 2, w: wMax },
          { t: 0.3, cx: 1490, cy: 890, w: Math.min(wMax * 0.6, 470) },    // (the caps keep a tall tablet as close to the toys as a phone is)            // the box, low in the picture: what comes out needs the room above it
          { t: 0.46, cx: 1574, cy: 2000, w: Math.min(wMax * 0.77, 640) },
          { t: 1.0, cx: 1574, cy: 2000, w: Math.min(wMax * 0.77, 640) },
        ],
      };
    }
    lay.asp = asp; lay.wMax = wMax;
  }
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
  const shadows = makeShadows(THREE, scene, ROSTER.length * 2 + 2);
  const toys = [];           // in the order they arrive
  const rand = rng(7);
  let state = 'closed';      // closed | open | returning
  let forced = false, forcedAt = 0;
  let burstT = -1;           // the physics clock at the burst
  let dirty = true;
  let simT = 0;              // the time that plays things, in seconds; it stands still for ?still=1
  const mouth = new THREE.Vector3();

  function slots() {
    // the huddle: a class photograph. Jefrie and Yusef in the middle, the small ones in front and the tall ones
    // behind; the props stand at the ends of the rows (js/roster.js says which end, and how far back). Each row
    // is as wide as the picture has room for at that depth.
    const rows = lay.rows, nr = rows.length;
    const need = (t) => (Math.min(t.w0, t.def.h * 0.74) + 0.03) * lay.scale;
    const cast = toys.filter((t) => !t.def.side).sort((a, b) => a.def.h - b.def.h || a.index - b.index);
    const ends = rows.map(() => ({ l: [], r: [], w: 0 }));
    for (const t of toys) if (t.def.side) { const e = ends[Math.min(nr - 1, Math.round((t.def.back || 0) * (nr - 1)))]; (t.def.side < 0 ? e.l : e.r).push(t); e.w += need(t); }
    const room = rows.reduce((s, r, i) => s + Math.max(0.1, r.x1 - r.x0 - ends[i].w), 0), want = cast.reduce((s, t) => s + need(t), 0);
    let k = 0;
    for (let r = 0; r < nr; r++) {
      const R = rows[r], cap = Math.max(0.1, R.x1 - R.x0 - ends[r].w) * Math.max(1, want / room) + 0.02;
      const row = []; let sum = 0;
      while (k < cast.length && (r === nr - 1 || sum + need(cast[k]) <= cap)) { sum += need(cast[k]); row.push(cast[k++]); }
      // tallest in the middle, then out to the sides in turn; the props outside them
      const mid = []; row.slice().reverse().forEach((t, i) => { if (i % 2) mid.push(t); else mid.unshift(t); });
      const order = [...ends[r].l, ...mid, ...ends[r].r];
      const all = sum + ends[r].w, fit = Math.min(1, (R.x1 - R.x0) / all), c = (R.x0 + R.x1) / 2;
      let x = c - all * fit / 2;
      order.forEach((t) => {
        const w = need(t) * fit, cx = x + w / 2; x += w;
        const u = (cx - c) / Math.max(R.x1 - R.x0, 0.3);
        const j = ((t.index * 7919) % 13) / 13 - 0.5;                 // the same small untidiness every time
        const zz = R.z - Math.abs(u) * 0.12 + j * 0.03;                // each row bends round a little
        t.body.slot = { x: cx, z: zz, yaw: Math.atan2(-cx, -zz) * 0.5 - u * 0.5 + j * 0.24 + (t.def.turn || 0) * (t.def.side || 0) };
      });
    }
    const n = toys.length;
    // no two may stand inside each other: any pair that would is eased apart, more sideways than in depth
    for (let it = 0; it < 40; it++) {
      let moved = false;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const A = toys[i].body, B = toys[j].body, a = A.slot, b = B.slot;
        const need = A.foot + B.foot + 0.012; let dx = b.x - a.x, dz = b.z - a.z; const d = Math.hypot(dx, dz);
        if (d >= need) continue;
        if (d < 1e-4) { dx = 1; dz = 0; } else { dx /= d; dz /= d; }
        const push = (need - d) * 0.52;
        a.x -= dx * push; a.z -= dz * push * 0.7; b.x += dx * push; b.z += dz * push * 0.7; moved = true;
      }
      if (!moved) break;
    }
  }
  function settle() {
    slots();
    for (const t of toys) { const s = t.body.slot; t.body.place(s.x, s.z, s.yaw + t.body.yaw0); t.pop = 1; t.kin = null; }
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
    const was = state;
    slots();
    state = 'open'; burstT = world.t; box.burst(simT, was === 'returning');
    const order = toys.slice().sort((a, b) => a.def.h - b.def.h);
    let i = 0;
    for (const t of order) {
      // scrolled back down while the toys were still flying home: those in the air turn round where they are,
      // only the ones already inside come out of the box again
      if (was === 'returning' && t.kin && t.pivot.visible && simT < t.kin.t0 + t.kin.dur) turnBack(t); else launch(t, 0.05 + i++ * 0.055);
    }
    dirty = true;
  }
  function turnBack(t) {
    const b = t.body, s = b.slot, p = t.pivot.position, q = t.pivot.quaternion, T = 0.55;
    b.px = p.x; b.py = Math.max(p.y, b.com); b.pz = p.z; b.qx = q.x; b.qy = q.y; b.qz = q.z; b.qw = q.w;
    b.vx = (s.x - b.px) / T; b.vz = (s.z - b.pz) / T; b.vy = 1.6; b.wx = (rand() - 0.5) * 6; b.wz = (rand() - 0.5) * 6; b.wy = 0;
    b.on = true; b.asleep = false; b.rest = 0; b.held = null; b.ghost = 0.4; b.knock = T + 0.2; b.hot = T; b.rise = 0; b.away = 0; b.pass = false; b.dock = null; b.stuck = 0; b.lastDist = 9;
    t.kin = null; t.launch = null;
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
  // a phone's picture is narrow: three of the props stay in the box there
  const CAST = ROSTER.filter((d) => !(phone && d.desk));
  loadToys(THREE, renderer, scene, CAST, (toy) => {
    // its number is its line in the roster, not the order it happened to arrive in: the huddle is the same every time
    toy.index = CAST.indexOf(toy.def); toy.pop = 1; toy.kin = null; toy.launch = null;
    toys.push(toy); toys.sort((a, b) => a.index - b.index);
    world.bodies.length = 0; for (const t of toys) world.bodies.push(t.body);
    slots();
    for (const t of toys) if (t.body.asleep && t.body.on) { const s = t.body.slot; t.body.place(s.x, s.z, s.yaw + t.body.yaw0); }
    if (state === 'open') {
      if (STILL || RM) { const s = toy.body.slot; toy.body.place(s.x, s.z, s.yaw + toy.body.yaw0); }
      else { launch(toy, 0.1); for (const t of toys) if (t !== toy && t.body.on) t.body.wake(); }   // a late one jumps out of the open box by itself
    }
    elCount.textContent = toys.length < CAST.length ? `${toys.length} of ${CAST.length} toys in the box` : '';
    dirty = true;
  }, () => { window.__toybox.loaded = true; dirty = true; });

  /* -------------------------------------------------------------- the hand */
  const ray = { ox: 0, oy: PAINT.HC, oz: 0, dx: 0, dy: 0, dz: -1 };
  const rect = { x: 0, y: 0, w: 1, h: 1 };
  let hold = null;     // { toy, z, samples: [{t,x,y}] }
  let tagToy = null, tagUntil = 0;
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
    for (const [o, d, a, b] of [[ray.ox, ray.dx, X.x0 - m, X.x1 + m], [ray.oy, ray.dy, X.y0, X.y1 + 0.12], [ray.oz, ray.dz, X.z0 - m, X.z1 + m]]) {
      if (Math.abs(d) < 1e-9) { if (o < a || o > b) return false; continue; }
      let ta = (a - o) / d, tb = (b - o) / d; if (ta > tb) { const s = ta; ta = tb; tb = s; }
      if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false;
    }
    return true;
  }
  function target(h, dt) {
    // The toy in the hand moves on an upright sheet of glass. Where the pointer is over another toy, the sheet
    // slides to that toy's depth: what overlaps on the screen then truly collides, so carrying one through the
    // huddle shoves the others and knocks them over.
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
    hover = null; tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy);
    document.documentElement.classList.add('grabbing');
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
    hinted = true; hint();
    dirty = true;
  }
  function drop(thrown) {
    if (!hold) return;
    const b = hold.toy.body, S = hold.samples;
    b.held = null; b.knock = 0.5; b.wake();
    if (thrown && S.length > 1) {
      const a = S[0], z = S[S.length - 1], dt = Math.max((z.t - a.t) / 1000, 0.016);
      let vx = (z.x - a.x) / dt, vy = (z.y - a.y) / dt;
      const v = Math.hypot(vx, vy), vmax = 8.5; if (v > vmax) { vx *= vmax / v; vy *= vmax / v; }
      // a throw goes where the hand went, and leans toward the middle of the huddle: thrown toys are bowling balls
      if (v > 0.6) { b.hot = 1.6; b.vx = vx; b.vy = vy; b.vz = clamp((huddleZ() - b.pz) * 1.1, -1.4, 1.4); b.knock = 0.85; }
    }
    if (hold.toy.onDrop) hold.toy.onDrop();
    tagUntil = simT + 2.6;
    document.documentElement.classList.remove('grabbing');
    hold = null; dirty = true;
  }
  const huddleZ = () => (lay.rows[0].z + lay.rows[Math.min(lay.rows.length - 1, 3)].z) / 2;
  const canPlay = () => state === 'open' && !STILL;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    setRay(e.clientX, e.clientY);
    if (state === 'closed') { if (overBox()) tap = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
    if (state !== 'open') return;
    const hit = pick(e.pointerType === 'mouse' ? 1.15 : 1.5);
    if (!hit) { if (RM || STILL) { tagUntil = 0; dirty = true; } return; }   // a click on nothing puts the name card away
    if (RM || STILL) { tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy); dirty = true; return; }
    grab(hit, e);
  });
  canvas.addEventListener('pointermove', (e) => {
    setRay(e.clientX, e.clientY);
    if (hold && e.pointerId === hold.id) { target(hold, 0); hold.toy.body.wake(); dirty = true; return; }
    if (e.pointerType === 'mouse') {
      const hit = state === 'open' ? pick(1.15) : null;
      const over = state === 'closed' ? overBox() : canPlay() && !!hit;
      document.documentElement.classList.toggle('grab', !!over);
      // a mouse that rests on a toy is told its name; the whole card comes when the toy is picked up
      if (state === 'open' && !RM && !STILL) {
        if (hit && hit.toy !== hover) { hover = hit.toy; tagToy = hover; tagUntil = 1e9; showTag(hover, true); dirty = true; }
        else if (!hit && hover) { if (tagToy === hover) tagUntil = simT + 0.12; hover = null; dirty = true; }
      }
    }
  });
  let hover = null; // the toy the mouse rests on
  canvas.addEventListener('pointerleave', () => { if (hover) { if (tagToy === hover) tagUntil = simT + 0.12; hover = null; dirty = true; } });
  let tap = null;   // a press that began on the shut box: if it ends where it began, it opens the box
  const up = (e) => {
    if (tap && e.pointerId === tap.id) { if (e.type === 'pointerup' && state === 'closed' && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 14) openByHand(); tap = null; }
    if (hold && e.pointerId === hold.id) drop(e.type === 'pointerup');
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('lostpointercapture', (e) => { if (hold && e.pointerId === hold.id) drop(false); });
  // A finger on a toy plays with the toy; a finger anywhere else scrolls the page. And so that the huddle is
  // never a trap for a thumb: a quick swipe up or down that merely starts on a toy is a scroll too. Only a
  // finger that rests a moment, or moves sideways, picks the toy up.
  canvas.addEventListener('touchmove', (e) => {
    if (!hold) return;
    if (hold.flick === undefined) {
      const t = e.touches[0], dx = t.clientX - hold.x0, dy = t.clientY - hold.y0;
      const ms = performance.now() - hold.t0;
      hold.flick = ms < 400 && Math.abs(dy) / Math.max(ms, 1) > 0.12 && Math.abs(dy) > Math.abs(dx) * 1.3;   // fast and upright: a scroll
      if (hold.flick) { drop(false); tagUntil = 0; return; }
    }
    e.preventDefault();
  }, { passive: false });

  function openByHand() { forced = true; forcedAt = prog; burst(); hinted = false; hint(); }
  // The pill at the foot of the picture opens the box; once it is open it calls the roll: each press names the
  // next toy (and the toy hops, to say "here"). It is also how a keyboard reaches the toys.
  let roll = -1;
  elHint.addEventListener('click', () => {
    if (state === 'closed') { openByHand(); return; }
    if (state !== 'open' || !toys.length) return;
    roll = (roll + 1) % toys.length;
    const t = toys[roll], b = t.body;
    hover = null; tagToy = t; tagUntil = RM || STILL ? 1e9 : simT + 4.5; showTag(t);
    if (!RM && !STILL && b.on && !b.held) { b.wake(); b.vy = 1.75; b.squashV += 2.4; b.rest = 0; }
    hinted = true; hint(); dirty = true;
  });

  /* -------------------------------------------------------------- the words over the picture */
  let hinted = false, lastHint = null;
  function hint() {
    let s = '';
    if (RM) s = !toys.length ? '' : roll >= 0 ? `Roll call · ${roll + 1} of ${toys.length}` : phone ? 'Tap a toy to see where it came from' : 'Click a toy to see where it came from';
    else if (state === 'closed') s = prog < 0.02 ? 'Scroll, or open the box' : 'Open the box';
    else if (state === 'open' && !hinted && prog < 0.9) s = phone ? 'Pick one up. Throw it.' : 'Pick one up and throw it';
    else if (state === 'open' && (phone || prog < 0.9)) s = roll < 0 ? 'Roll call' : `Roll call · ${roll + 1} of ${toys.length}`;
    if (STILL) s = '';
    if (s !== lastHint) { lastHint = s; if (s) elHintText.textContent = s; elHint.classList.toggle('off', !s); elHint.tabIndex = s ? 0 : -1; }
  }
  function showTag(toy, small) {
    elTag.classList.toggle('mini', !!small);
    elTag.querySelector('.tag-from').textContent = toy.def.from;
    elTag.querySelector('.tag-name').textContent = toy.def.name;
    elTag.querySelector('.tag-how').textContent = toy.def.how;
    elTag.classList.add('on');
  }
  const P2 = [0, 0];
  function placeTag() {
    if (!tagToy) return;
    if (simT > tagUntil || !tagToy.body.on) { elTag.classList.remove('on'); tagToy = null; return; }
    const b = tagToy.body, tw = elTag.offsetWidth, th = elTag.offsetHeight;
    if (phone) {
      // a finger covers the toy: the card sits at the top of the screen instead
      elTag.classList.add('pinned'); elTag.classList.remove('below');
      elTag.style.transform = `translate(${Math.round((vw - tw) / 2)}px, 46px)`;
      return;
    }
    elTag.classList.remove('pinned');
    toPaint(b.px, b.py + (b.h - b.com) + 0.04, b.pz, P2);
    let x = (P2[0] - rect.x) / rect.w * vw, y = (P2[1] - rect.y) / rect.h * vh;
    let below = y - th - 16 < 8;
    if (below) { toPaint(b.px, b.py - b.com - 0.03, b.pz, P2); y = (P2[1] - rect.y) / rect.h * vh + 16; } else y -= th + 16;
    const left = clamp(x - tw / 2, 10, vw - tw - 10);
    elTag.classList.toggle('below', below);
    elTag.style.setProperty('--tip', clamp(x - left, 22, tw - 22) + 'px');
    elTag.style.transform = `translate(${Math.round(left)}px, ${Math.round(clamp(y, 8, vh - th - 8))}px)`;
  }
  function words(t) {
    if (RM) return;   // the still version has no words over the picture: they would lie across the open box, and the card says them
    // the word stands on the left wall while the room is seen whole, and leaves as the camera goes to the box
    const o = 1 - ss(0.05, 0.16, t), dx = -ss(0.03, 0.2, t) * vw * 0.08;
    const wx = phone ? vw * 0.07 : vw * 0.075, wy = phone ? vh * 0.2 : vh * 0.36;
    elWord.style.opacity = o; elWord.style.transform = `translate(${wx + dx}px, ${wy}px) translateY(-50%)`;
    elSay.style.opacity = o; elSay.style.transform = `translate(${wx + dx * 0.6 + (phone ? 2 : 6)}px, ${wy + (phone ? vw * 0.17 : Math.min(vw * 0.07, 120))}px)`;
  }

  /* -------------------------------------------------------------- the frame */
  let boxBusy = false;
  // A device that cannot keep up at its full sharpness gets a slightly softer picture rather than a slow one:
  // when most of a run of frames took longer than two screen refreshes, the sharpness goes down one step.
  let ratioCap = 2, runN = 0, runSlow = 0;
  function pace(dt, drew) {
    if (!drew || dt <= 0 || dt > 1.5) { runN = 0; runSlow = 0; return; }
    runN++; if (dt > 0.034) runSlow++;
    if (runN < 45) return;
    const now = Math.min(window.devicePixelRatio || 1, 2, ratioCap);
    if (runSlow > 30 && now > 1) { ratioCap = Math.max(1, now - (now > 1.5 ? 0.5 : 0.25)); resize(); }
    runN = 0; runSlow = 0;
  }
  let prog = 0, lastProg = -1, visible = true, last = 0, acc = 0, frames = 0, fpsT = 0, fps = 0;
  function progress() {
    const max = track.offsetHeight - vh;
    return max > 0 ? clamp((window.scrollY - track.offsetTop) / max, 0, 1) : 0;
  }
  function resize() {
    layout();
    const dpr = Math.min(window.devicePixelRatio || 1, 2, ratioCap);
    renderer.setPixelRatio(dpr); renderer.setSize(vw, vh, false);
    box.setPlace(lay.box.x, lay.box.z, lay.scale);
    mouth.set(lay.box.x, box.bounds.y1 + 0.05, lay.box.z);
    world.boxes = [box.bounds];
    for (const t of toys) t.setScale(lay.scale);
    if (toys.length) { slots(); for (const t of toys) { const b = t.body; if (b.on && b.asleep) b.place(b.slot.x, b.slot.z, b.slot.yaw + b.yaw0); else b.wake(); } }
    dirty = true;
  }

  function viewPlanes() {
    const a = (rect.x - PAINT.VX) / PAINT.F, b = (rect.x + rect.w - PAINT.VX) / PAINT.F, c = (PAINT.VY - rect.y) / PAINT.F;
    const la = Math.hypot(1, a), lb = Math.hypot(1, b), lc = Math.hypot(1, c);
    const zf = Math.max(1.22, PAINT.HC * PAINT.F / (rect.y + rect.h - PAINT.VY) + 0.04);
    world.view = [
      { nx: 1 / la, ny: 0, nz: a / la, d: 0, k: 0.35 },
      { nx: -1 / lb, ny: 0, nz: -b / lb, d: 0, k: 0.35 },
      { nx: 0, ny: -1 / lc, nz: -c / lc, d: PAINT.HC / lc, k: 0.2 },
      { nx: 0, ny: 0, nz: -1, d: -zf, k: 1 },
    ];
  }

  const q = new THREE.Quaternion();
  let need = false;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) { last = now; return; }
    let dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (STILL || MANUAL) dt = 0;
    const was = dirty;
    tick(dt);
    const drew = MANUAL ? was || dirty : need;
    if (drew) draw();
    if (!MANUAL && !STILL) pace(dt, drew);
    if (SHOWFPS) {
      fpsT += (now - fpsLast) / 1000; fpsLast = now; fpsN++;
      if (fpsT >= 1) { fps = fpsN / fpsT; fpsT = 0; fpsN = 0; const i = renderer.info.render; elCount.textContent = `${fps.toFixed(1)} fps · ${i.triangles.toLocaleString('en')} triangles · ${i.calls} draw calls`; }
    }
    const T = window.__toybox; T.state = state; T.prog = prog; T.frames = frames; T.awake = world.awake; T.fps = fps;
  }
  /* everything that changes with the scroll and with time, for one step of time */
  function tick(dt) {
    prog = progress();
    if (prog !== lastProg) { lastProg = prog; dirty = true; }

    // what the scroll says the box should be
    if (RM) { if (state !== 'open' && toys.length) settle(); }
    else {
      if (forced && prog >= Y_BURST) forced = false;   // opened by hand, then scrolled past the burst: from here the scroll owns the box again
      if (forced && prog < Math.min(forcedAt - 0.04, Y_CLOSE)) forced = false;
      if (forced && prog < 0.004 && forcedAt > 0.03) forced = false;
      const want = prog >= Y_BURST || forced || (state === 'open' && prog >= Y_CLOSE);
      if (want && state !== 'open') { if (STILL || firstFrame) { settle(); } else burst(); }
      else if (!want && state === 'open') { if (STILL) { for (const t of toys) t.body.on = false; state = 'closed'; box.setOpen(0, true); } else goHome(); }
    }
    firstFrame = false;

    // with less motion asked for, the picture does not move at all: it is the last framing, where the card that
    // scrolls in over the left of the screen hides nothing of the huddle
    rectAt(RM ? 1 : prog, rect);
    simT += dt;

    // the toys
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
      if (all && simT >= box.closeAt) { state = 'closed'; for (const t of toys) { t.kin = null; t.pivot.visible = false; } }
    }
    const playing = boxBusy = box.update(simT, dt, state, RM || STILL ? 0 : ss(0.1, Y_BURST - 0.01, prog), ss(0.14, Y_BURST - 0.01, prog));
    let anim = false;
    for (const t of toys) {
      const b = t.body;
      if (state !== 'returning') {
        t.pivot.visible = b.on;
        if (b.on) {
          if (t.pop < 1) { t.pop = Math.min(1, t.pop + dt * 5); moving = true; }
          const s = b.squash, up = Math.cos(b.tilt);
          t.pivot.position.set(b.px, b.py + s * b.com * up, b.pz);
          t.pivot.quaternion.set(b.qx, b.qy, b.qz, b.qw);
          t.pivot.scale.set((1 - s * 0.5) * t.pop, (1 + s) * t.pop, (1 - s * 0.5) * t.pop);
          if (Math.abs(b.squashV) > 0.02 || Math.abs(s) > 0.002) moving = true;
        }
      } else t.pivot.scale.setScalar(t.pop);
      if (t.tick && t.pivot.visible && dt > 0 && !RM && t.tick(dt, b)) anim = true;   // nobody sways or waddles for a reader who asked for less motion
    }

    if (dirty || moving || playing || anim || hold || (tagToy && !RM)) need = true;
  }
  function draw() {
    camera.setViewOffset(PAINT.FW, PAINT.FH, rect.x + PAINT.OX, rect.y + PAINT.OY, rect.w, rect.h);
    placeShadows(shadows, toys, box, PAINT.LAMP);
    words(prog); hint(); placeTag();
    renderer.render(scene, camera);
    dirty = false; need = false; frames++;
  }
  let firstFrame = true, fpsLast = performance.now(), fpsN = 0;

  window.__toybox = {
    loaded: false, state, prog: 0, frames: 0, awake: 0, fps: 0, toys, world, renderer, rect,
    info: () => ({ triangles: renderer.info.render.triangles, calls: renderer.info.render.calls, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries }),
    held: () => (hold ? hold.toy.def.id : null),
    slow: () => { for (let i = 0; i < 46; i++) pace(0.05, true); return ratioCap; },
    lid: () => box.open,
    calm: () => { for (const t of toys) if (t.calm) t.calm(); dirty = true; need = true; draw(); },
    busy: () => (state === 'open' && world.awake > 0) || state === 'returning' || toys.some((t) => t.launch) || boxBusy,
    live: () => ({ visible, state, prog: progress(), hinted }),
    boxScreen: () => { const X = box.bounds, p = [0, 0]; toPaint((X.x0 + X.x1) / 2, X.y1 * 0.5, X.z1, p); const r = canvas.getBoundingClientRect(); return { x: r.left + (p[0] - rect.x) / rect.w * r.width, y: r.top + (p[1] - rect.y) / rect.h * r.height }; },
    advance: (sec) => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) tick(1 / 60); dirty = true; need = true; draw(); return { state, awake: world.awake, t: +world.t.toFixed(2) }; },
    screenOf: (id) => { const t = toys.find((x) => x.def.id === id); if (!t) return null; const b = t.body, p = [0, 0]; toPaint(b.px, b.py, b.pz, p); const r = canvas.getBoundingClientRect(); return { x: r.left + (p[0] - rect.x) / rect.w * r.width, y: r.top + (p[1] - rect.y) / rect.h * r.height, on: b.on, asleep: b.asleep }; },
  };

  new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting && !document.hidden; if (visible) { last = performance.now(); dirty = true; } }).observe(stage);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); dirty = true; });
  window.addEventListener('resize', resize);
  resize();

  const yq = parseFloat(qs.get('y'));
  if (!Number.isNaN(yq)) {
    const go = () => window.scrollTo(0, Math.round(clamp(yq, 0, 1) * (document.documentElement.scrollHeight - window.innerHeight)));
    history.scrollRestoration = 'manual'; go(); requestAnimationFrame(go);
  }
  if (RM) document.documentElement.classList.add('rm');
  room.ready.then(() => { document.documentElement.classList.add('ready'); dirty = true; });
  last = performance.now();
  requestAnimationFrame(frame);
}
