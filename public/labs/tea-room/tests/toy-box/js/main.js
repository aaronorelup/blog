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
const Y_BURST = 0.34;   // scrolled this far, the box bursts
const Y_CLOSE = 0.3;    // scrolled back above this, the toys go home and the lid shuts
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
  let vw = 1, vh = 1, phone = false, lay = null;
  function layout() {
    vw = stage.clientWidth; vh = stage.clientHeight;
    phone = vw <= 720 || vw / vh < 0.8;
    const asp = vw / vh;
    const wMax = Math.min(PAINT.W, PAINT.H * asp);
    if (!phone) {
      // a desk: the box on the left, the huddle in the middle and right, the paper lamp behind it. Rows of the
      // huddle, front first: how deep each stands and from where to where it may spread (metres).
      lay = {
        scale: 1,
        box: { x: -0.62, z: -2.3 },
        rows: [{ z: -1.5, x0: 0.02, x1: 1.02 }, { z: -1.8, x0: -0.06, x1: 1.24 }, { z: -2.1, x0: -0.1, x1: 1.4 }, { z: -2.4, x0: -0.06, x1: 1.0 }],
        keys: [
          { t: 0.0, cx: PAINT.W / 2, cy: PAINT.H / 2, w: wMax * 0.985 },
          { t: 0.06, cx: PAINT.W / 2, cy: PAINT.H / 2, w: wMax * 0.985 },
          { t: 0.3, cx: 1190, cy: 985, w: 1240 },
          { t: 0.46, cx: 1500, cy: 1000, w: 1560 },
          { t: 0.78, cx: 1500, cy: 1000, w: 1560 },
          { t: 1.0, cx: 1440, cy: 1010, w: 1760 },     // the camera steps back and to the left: the card takes the left of the screen, the huddle keeps the right
        ],
      };
    } else {
      // a phone: a tall picture, so the huddle is deep instead of wide: a wedge coming toward the reader, the box
      // open behind it
      lay = {
        scale: 0.9,
        box: { x: -0.14, z: -2.44 },
        rows: [{ z: -1.42, x0: -0.28, x1: 0.31 }, { z: -1.64, x0: -0.33, x1: 0.36 }, { z: -1.87, x0: -0.38, x1: 0.41 }, { z: -2.11, x0: -0.43, x1: 0.46 }, { z: -2.4, x0: 0.2, x1: 0.56 }],
        keys: [
          { t: 0.0, cx: 1420, cy: PAINT.H / 2, w: wMax },
          { t: 0.06, cx: 1420, cy: PAINT.H / 2, w: wMax },
          { t: 0.3, cx: 1330, cy: 1010, w: wMax * 0.6 },
          { t: 0.46, cx: 1410, cy: 2000, w: wMax * 0.77 },
          { t: 1.0, cx: 1410, cy: 2000, w: wMax * 0.77 },
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
  const shadows = makeShadows(THREE, scene, ROSTER.length + 2);
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
    slots();
    state = 'open'; burstT = world.t; box.burst(simT);
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
  // a phone's picture is narrow: three of the props stay in the box there
  const CAST = ROSTER.filter((d) => !(phone && d.desk));
  loadToys(THREE, renderer, scene, CAST, (toy) => {
    toy.index = toys.length; toy.pop = 1; toy.kin = null; toy.launch = null;
    toys.push(toy); world.bodies.push(toy.body);
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
  function pick(grow) {
    let best = null, bt = 1e9, bs = 0;
    for (const t of toys) {
      const b = t.body; if (!b.on) continue;
      b.centres();
      for (let s = 0; s < b.spheres.length; s++) {
        const cx = b.wc[s * 3] - ray.ox, cy = b.wc[s * 3 + 1] - ray.oy, cz = b.wc[s * 3 + 2] - ray.oz;
        const r = b.spheres[s].r * grow, tc = cx * ray.dx + cy * ray.dy + cz * ray.dz;
        const d2 = cx * cx + cy * cy + cz * cz - tc * tc;
        if (tc > 0 && d2 < r * r) { const th = tc - Math.sqrt(r * r - d2); if (th < bt) { bt = th; best = t; bs = s; } }
      }
    }
    return best ? { toy: best, s: bs } : null;
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
  function target(h) {
    // where the pointer's ray meets the upright sheet of glass the toy was picked up on
    const k = (h.z - ray.oz) / ray.dz, b = h.toy.body;
    b.held.tx = clamp(ray.ox + ray.dx * k, PAINT.XL + 0.1, PAINT.XR - 0.1);
    b.held.ty = clamp(ray.oy + ray.dy * k, b.spheres[h.s].r + 0.03, 2.2);
    b.held.tz = h.z;
    h.samples.push({ t: performance.now(), x: b.held.tx, y: b.held.ty });
    if (h.samples.length > 6) h.samples.shift();
  }
  function grab(hit, e) {
    const b = hit.toy.body;
    b.centres(); b.wake();
    const z = clamp(b.wc[hit.s * 3 + 2], -PAINT.D + 0.3, -1.25);
    b.held = { s: hit.s, tx: 0, ty: 0, tz: z };
    hold = { toy: hit.toy, s: hit.s, z, samples: [], id: e.pointerId };
    target(hold);
    for (const t of toys) if (t.body.on) t.body.wake();
    tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy);
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
      if (v > 0.6) { b.hot = 1.6; b.vx = vx; b.vy = vy; b.vz = -Math.abs(vy) * 0.12 + (b.slot ? clamp((b.slot.z - b.pz) * 0.6, -0.6, 0.6) : 0); b.knock = 0.85; }
    }
    if (hold.toy.onDrop) hold.toy.onDrop();
    tagUntil = simT + 2.6;
    document.documentElement.classList.remove('grabbing');
    hold = null; dirty = true;
  }
  const canPlay = () => state === 'open' && !STILL;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    setRay(e.clientX, e.clientY);
    if (state === 'closed') { if (overBox()) { openByHand(); e.preventDefault(); } return; }
    if (state !== 'open') return;
    const hit = pick(e.pointerType === 'mouse' ? 1.15 : 1.5);
    if (!hit) return;
    if (RM || STILL) { tagToy = hit.toy; tagUntil = 1e9; showTag(hit.toy); dirty = true; return; }
    grab(hit, e);
  });
  canvas.addEventListener('pointermove', (e) => {
    setRay(e.clientX, e.clientY);
    if (hold && e.pointerId === hold.id) { target(hold); hold.toy.body.wake(); dirty = true; return; }
    if (e.pointerType === 'mouse') {
      const over = state === 'closed' ? overBox() : canPlay() && !!pick(1.15);
      document.documentElement.classList.toggle('grab', !!over);
    }
  });
  const up = (e) => { if (hold && e.pointerId === hold.id) drop(e.type === 'pointerup'); };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('lostpointercapture', (e) => { if (hold && e.pointerId === hold.id) drop(false); });
  // a finger on a toy plays with the toy; a finger anywhere else scrolls the page
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    setRay(e.touches[0].clientX, e.touches[0].clientY);
    if ((state === 'closed' && overBox()) || (canPlay() && !RM && pick(1.5))) e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { if (hold) e.preventDefault(); }, { passive: false });

  function openByHand() { forced = true; forcedAt = prog; burst(); hinted = false; hint(); }
  elHint.addEventListener('click', () => {
    if (state === 'closed') openByHand();
  });

  /* -------------------------------------------------------------- the words over the picture */
  let hinted = false, lastHint = null;
  function hint() {
    let s = '';
    if (RM) s = toys.length ? 'Tap a toy to see where it came from' : '';
    else if (state === 'closed') s = prog < 0.02 ? 'Scroll, or open the box' : 'Open the box';
    else if (state === 'open' && !hinted && prog < 0.9) s = phone ? 'Pick one up. Throw it.' : 'Pick one up and throw it';
    if (STILL) s = '';
    if (s !== lastHint) { lastHint = s; if (s) elHintText.textContent = s; elHint.classList.toggle('off', !s); elHint.tabIndex = state === 'closed' && s ? 0 : -1; }
  }
  function showTag(toy) {
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
    // the word stands on the left wall while the room is seen whole, and leaves as the camera goes to the box
    const o = 1 - ss(0.05, 0.16, t), dx = -ss(0.03, 0.2, t) * vw * 0.08;
    const wx = phone ? vw * 0.07 : vw * 0.075, wy = phone ? vh * 0.2 : vh * 0.36;
    elWord.style.opacity = o; elWord.style.transform = `translate(${wx + dx}px, ${wy}px) translateY(-50%)`;
    elSay.style.opacity = o; elSay.style.transform = `translate(${wx + dx * 0.6 + (phone ? 2 : 6)}px, ${wy + (phone ? vw * 0.17 : Math.min(vw * 0.07, 120))}px)`;
  }

  /* -------------------------------------------------------------- the frame */
  let prog = 0, lastProg = -1, visible = true, last = 0, acc = 0, frames = 0, fpsT = 0, fps = 0;
  function progress() {
    const max = track.offsetHeight - vh;
    return max > 0 ? clamp((window.scrollY - track.offsetTop) / max, 0, 1) : 0;
  }
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
    if (MANUAL ? was || dirty : need) draw();
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
      if (forced && prog < Math.min(forcedAt - 0.04, Y_CLOSE)) forced = false;
      if (forced && prog < 0.004 && forcedAt > 0.03) forced = false;
      const want = prog >= Y_BURST || forced || (state === 'open' && prog >= Y_CLOSE);
      if (want && state !== 'open') { if (STILL || firstFrame) { settle(); } else burst(); }
      else if (!want && state === 'open') { if (STILL) { for (const t of toys) t.body.on = false; state = 'closed'; box.setOpen(0, true); } else goHome(); }
    }
    firstFrame = false;

    rectAt(RM ? 0.6 : prog, rect);
    simT += dt;

    // the toys
    let moving = false;
    if (state === 'open' && dt > 0) {
      viewPlanes();
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
    const playing = box.update(simT, dt, state, RM || STILL ? 0 : ss(0.1, Y_BURST - 0.01, prog));
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
      if (t.tick && t.pivot.visible && dt > 0 && t.tick(dt, b)) anim = true;
    }

    if (dirty || moving || playing || anim || hold || tagToy) need = true;
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
    advance: (sec) => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) tick(1 / 60); dirty = true; need = true; draw(); return { state, awake: world.awake, t: +world.t.toFixed(2) }; },
    screenOf: (id) => { const t = toys.find((x) => x.def.id === id); if (!t) return null; const b = t.body, p = [0, 0]; toPaint(b.px, b.py, b.pz, p); const r = canvas.getBoundingClientRect(); return { x: r.left + (p[0] - rect.x) / rect.w * r.width, y: r.top + (p[1] - rect.y) / rect.h * r.height, on: b.on, asleep: b.asleep }; },
  };

  new IntersectionObserver((es) => { visible = es[0].isIntersecting && !document.hidden; if (visible) { last = performance.now(); dirty = true; } }).observe(stage);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); dirty = true; });
  window.addEventListener('resize', resize);
  resize();

  const yq = parseFloat(qs.get('y'));
  if (!Number.isNaN(yq)) {
    const go = () => window.scrollTo(0, Math.round(clamp(yq, 0, 1) * (document.documentElement.scrollHeight - window.innerHeight)));
    history.scrollRestoration = 'manual'; go(); requestAnimationFrame(go);
  }
  room.ready.then(() => { document.documentElement.classList.add('ready'); dirty = true; });
  last = performance.now();
  requestAnimationFrame(frame);
}
