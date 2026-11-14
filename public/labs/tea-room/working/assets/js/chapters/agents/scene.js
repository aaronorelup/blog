// "Working with AI agents": the terminal world, as one chapter the host page drives.
//
//   const view = mount(hostElement, { still, reducedMotion, invalidate, top });   top: where what is read and pressed goes
//   view.frame(q, time, pointer)   q: the chapter's progress, 0 to 1. time: seconds (the host stops it for a still).
//                                  pointer: optional { x, y } in the host's own pixels; left out, the scene listens itself
//   view.resize()                  the host's box changed
//   view.setActive(on)             off: nothing is drawn and nothing plays
//   view.dispose()
//
// Everything on screen is worked out again each frame from q (where the camera is, how far each scene has got, how
// far each card has unfolded), from the time (what moves by itself: wings, chalk workers, the videos) and from the
// pointer (which screen of the wall is chosen). Nothing is kept from one frame to the next, so scrolling fast in
// either direction always lands on the same picture.
//
// The reader stands at the cursor and looks round. Eight stops lie in a ring on the glass, one after another:
// arriving, one helper at a time, a fan-out, a pipeline, an orchestrator and its workers, a writers' room, the wall
// of ten music videos, and the watcher.
import * as THREE from 'three';
import { PAL, FOG, clamp, lerp, ss, io, twelve, hash, rng, track, glowSprite, glow, decal, box, lit, flat, canvasTex } from './kit.js';
import { makePlane, makeLog, makeCursor, makeEvening, makeWind, makeFar, makeDusk, makeTyped } from './ground.js';
import { makeFigure, makeRing, strokeWindow, forgetStrokes } from './origami.js';
import { makeSwarm } from './swarm.js';
import { makeWatcher } from './watcher.js';
import { makeWall, SW, SH } from './wall.js';
import { WALL, WALL_WORDS } from './data.js';
import { buildUI } from './ui.js';

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);

// The eight stops. th: which way it lies from the cursor (degrees, clockwise from straight ahead); R: how far;
// q: the part of the scroll that is its own. wide and tall: the camera at the start and the end of its part, as
// [back from the stop, height, to the side, then the point looked at: beyond, to the side, height, and the lens].
const STOPS = [
  { key: 'entry', th: 0, R: 0, q: [0, 0.058], wide: [[4.3, 1.2, -0.5, 9, 1.3, 0.5, 40], [5.3, 1.9, 0.2, 6, 1.5, 0.3, 40]], tall: [[5.4, 1.9, -0.5, 7, -0.9, 0.3, 60], [6.4, 2.6, -0.3, 4, -0.6, 0.2, 60]] },
  { key: 'helper', th: 38, R: 10, q: [0.088, 0.215], post: 'cost', wide: [[7.2, 3, -0.7, 0.5, 0.8, 0.2, 38], [5.9, 2.5, 0.3, 0.5, 1.5, 0.35, 38]], tall: [[9, 4.3, 0.2, -1.2, 0.1, 0.2, 58], [7.9, 3.8, 0.3, -1.2, 0.15, 0.3, 58]], labelY: 0.68 },
  { key: 'fanout', th: 84, R: 17, q: [0.25, 0.352], wide: [[16.5, 7.6, -1, 0, 0, -0.6, 40], [13, 6, 1, 0.5, 0, -0.5, 40]], tall: [[19, 9.5, 0, 0.5, 0, 0, 60], [16.6, 8.4, 0.6, 1, 0, 0, 60]], labelY: 0.83 },
  { key: 'pipeline', th: 128, R: 11, q: [0.386, 0.476], wide: [[9.8, 3.4, -1.2, 0, 0, 0.25, 38], [8.8, 3, 1, 0, 0, 0.3, 38]], tall: [[9.6, 4.6, -1.6, 2.2, 0, 0.2, 58], [8.6, 4.1, -0.8, 2.2, 0, 0.3, 58]], labelY: 0.83 },
  { key: 'orchestrator', th: 170, R: 13, q: [0.51, 0.592], wide: [[10.6, 4, -1.2, 0, 0, 0.9, 38], [9, 3.4, 1, 0, 0, 1, 38]], tall: [[11.6, 5.4, 0, 2.6, 0, 0.9, 58], [10.2, 4.7, 0.4, 2.6, 0, 1, 58]], labelY: 0.83 },
  { key: 'writers', th: 214, R: 10, q: [0.626, 0.716], post: 'lie', wide: [[8.4, 3.5, -0.9, 0, 1.1, 0.95, 36], [7, 3.1, 0.2, 0, 1.5, 1, 36]], tall: [[10.4, 4.9, 0, 0, 0, 0.5, 58], [9, 4.3, 0.3, 0, 0, 0.6, 58]], labelY: 0.68 },
  { key: 'wall', th: 260, R: 18, q: [0.75, 0.888], post: 'gauntlet', wide: [[17.2, 3.5, 0, 0, 0, 1.25, 40], [15.4, 3.2, 0.3, 0, 0, 1.2, 40]], tall: [[21.5, 5.4, 0, 0, 0, 5.6, 60], [20, 5.2, 0, 0, 0, 5.6, 60]], labelY: 0.688 },
  { key: 'watcher', th: 306, R: 10, q: [0.922, 1], post: 'clock', wide: [[6.6, 2.9, 2.6, -0.6, 0.5, 0.7, 36], [5.4, 2.45, 2.9, -0.8, 0.8, 0.75, 36]], tall: [[8.4, 3.9, 1.5, -0.6, -0.5, 0.6, 58], [7.3, 3.4, 1.7, -0.6, -0.4, 0.7, 58]], labelY: 0.68 },
];
STOPS.forEach((s) => {
  const a = s.th * DEG;
  s.fwd = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a)); s.side = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  s.C = s.fwd.clone().multiplyScalar(s.R);
});
const at = (s, f, d, h = 0) => s.C.clone().addScaledVector(s.fwd, f).addScaledVector(s.side, d).addScaledVector(UP, h);
const bez = (out, a, m, b, e) => out.set(0, 0, 0).addScaledVector(a, (1 - e) * (1 - e)).addScaledVector(m, 2 * (1 - e) * e).addScaledVector(b, e * e);
const yawTo = (dx, dz) => Math.atan2(-dz, dx);        // the paper animals are drawn facing along x
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3();

export function mount(host, options = {}) {
  const still = !!options.still, calm = !!options.reducedMotion, uiHost = options.top || host;
  const invalidate = options.invalidate || (() => {});
  host.classList.add('at-host');
  const canvas = document.createElement('canvas'); canvas.className = 'at-canvas'; canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  const grain = document.createElement('div'); grain.className = 'at-grain'; grain.setAttribute('aria-hidden', 'true'); host.append(grain);
  {
    // the grain: one small square of noise, thrown anew twelve times a second
    const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'), d = g.createImageData(160, 160), R = rng(7);
    for (let i = 0; i < d.data.length; i += 4) { const v = 90 + R() * 165; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 * R(); }
    g.putImageData(d, 0, 0); grain.style.backgroundImage = 'url(' + c.toDataURL() + ')';
  }
  const ui = buildUI(uiHost);
  const holder = document.createElement('div'); holder.className = 'at-holder'; holder.setAttribute('aria-hidden', 'true'); host.append(holder);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(PAL.night, 1); renderer.autoClear = false; renderer.info.autoReset = false;
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(PAL.night, FOG);
  const camera = new THREE.PerspectiveCamera(40, 1.6, 0.1, 400);
  const world = new THREE.Group(), flatland = new THREE.Group();     // flatland: what lies in the glass and is not mirrored
  scene.add(world, flatland);
  const plane = makePlane(); scene.add(plane.mesh);
  scene.add(new THREE.HemisphereLight(0x39436a, 0x0b0b12, 1.1));
  const key = new THREE.PointLight(0xffd3a0, 0, 0, 1.5); world.add(key);

  let W = 1, H = 1, IN = 0, tall = false, active = true, built = null, shown = true;
  const root = document.documentElement;
  const texts = [];                                                  // drawings that hold words: drawn again when the font arrives

  // ------------------------------------------------------------------------------------------------ the world
  function build() {
    const S = Object.fromEntries(STOPS.map((s) => [s.key, s]));
    const parts = [], disposers = [];
    const add = (o) => { world.add(o); return o; };

    // ---- the ground: log, cursor, the evening's window, wind
    const R = rng(20261113), spots = [];
    for (let i = 0; i < 70; i++) {
      const a = R() * 6.283, r = 7.5 + R() * R() * 46, x = Math.sin(a) * r, z = -Math.cos(a) * r, w = (3 + R() * 2.4) * (tall ? 0.7 : 1);
      if (STOPS.some((s) => s.R && (Math.hypot(x - s.C.x, z - s.C.z) < 4.2 || Math.hypot(x - s.C.x + s.fwd.x * 4, z - s.C.z + s.fwd.z * 4) < 4.6 || Math.hypot(x - s.C.x + s.fwd.x * 7.5, z - s.C.z + s.fwd.z * 7.5) < 3.4))) continue;
      spots.push({ x, z, w, i, rot: -a, o: 0.55 + R() * 0.4 });
    }
    spots.push({ x: -2.9, z: -4.9, w: 3.4, i: 0, rot: 0, o: 0.9 }, { x: 1.6, z: -12.5, w: 4.4, i: 2, rot: 0, o: 0.8 });
    const log = makeLog(spots); flatland.add(log.group); texts.push(log);
    const cursor = makeCursor(); add(cursor.group);
    const evening = makeEvening(invalidate); evening.group.position.set(tall ? -2 : 9, 0, -78); add(evening.group);
    const typed = makeTyped(tall ? 2 : 2.6); flatland.add(typed.mesh); texts.push(typed);
    const wind = makeWind(); scene.add(wind.lines);
    add(makeFar()); add(makeDusk());

    // a helper that comes down out of the dark with a card and sets it on the glass at L
    function courier(L, s, perchSide = 0.85) {
      const fig = makeFigure('crane'); fig.group.scale.setScalar(0.5);
      const g = new THREE.Group(); g.add(fig.group); add(g);
      const sheet = decal(0.7, 0.46, flat(0x1a1c2a, { transparent: true })); const edge = decal(0.74, 0.5, flat(PAL.amber, { transparent: true, opacity: 0.85 })); edge.position.y = -0.001;
      const sg = new THREE.Group(); sg.add(edge, sheet); add(sg);
      const from = L.clone().addScaledVector(s.fwd, 9).addScaledVector(s.side, -4).addScaledVector(UP, 8.5);
      const perch = L.clone().addScaledVector(s.side, perchSide).addScaledVector(s.fwd, 0.25);
      const mid = L.clone().addScaledVector(s.fwd, 3).addScaledVector(UP, 1.2);
      return (u, t, gone = 0) => {
        const on = u > 0.001; g.visible = on; sg.visible = on && gone < 0.99; if (!on) return;
        sheet.material.opacity = 1 - gone; edge.material.opacity = 0.85 * (1 - gone);
        const e = io(clamp(u / 0.86)), land = ss(0.86, 1, u);
        bez(tmp, from, mid, perch, e); tmp.y += 0.02 + (1 - land) * 0.12 * Math.sin(twelve(t) * 5);
        g.position.copy(tmp);
        g.rotation.y = lerp(yawTo(perch.x - from.x, perch.z - from.z), yawTo(-s.fwd.x - s.side.x * 0.6, -s.fwd.z - s.side.z * 0.6), land);
        fig.set(1, (1 - land) * Math.sin(twelve(t) * 11) * 0.6 + land * Math.sin(twelve(t) * 1.4) * 0.06);
        // the card rides under it, then lies where it lands
        bez(tmp2, from, mid, L, e); tmp2.y = Math.max(0.006, tmp.y - 0.34) * (1 - land) + 0.006;
        sg.position.copy(tmp2); sg.rotation.y = g.rotation.y * (1 - land) + land * (-s.th * DEG);
      };
    }

    // ---- 1. one helper at a time
    {
      const s = S.helper, ring = makeRing(0.95); ring.group.position.copy(s.C); add(ring.group);
      const fig = makeFigure('crane'); fig.group.scale.setScalar(tall ? 0.66 : 0.82); const g = new THREE.Group(); g.add(fig.group); add(g);
      const I = at(s, 21, -6.5), L = tall ? at(s, -2.2, -0.5) : at(s, -0.2, 2.2), perch = tall ? at(s, -1.4, 0.3) : L.clone().addScaledVector(s.side, 0.9).addScaledVector(s.fwd, 0.5);
      const isle = decal(3.2, 3.2, flat(0x1d1f28, { transparent: true, opacity: 0.9, fog: true })); isle.position.set(I.x, 0.003, I.z); isle.rotation.z = -s.th * DEG; flatland.add(isle);
      const fire = glowSprite(PAL.ember, 2.2, 0.8); fire.position.set(I.x + 0.7, 0.35, I.z); add(fire);
      const sheet = decal(0.7, 0.46, flat(0x1a1c2a, { transparent: true })), edge = decal(0.74, 0.5, flat(PAL.amber, { transparent: true, opacity: 0.85 })); edge.position.y = -0.001;
      const sg = new THREE.Group(); sg.add(edge, sheet); add(sg);
      const A = at(s, 0, 0, 0.6), M1 = at(s, 9, -1, 4.2), Iu = I.clone().setY(0.55), M2 = at(s, 9, 2.5, 3.8);
      s.lamp = at(s, -1.4, 0.9, 2.7); s.card = L; s.label = tall ? null : at(s, -1.9, 0.1);
      parts.push((q, t) => {
        const p = s.p, a = s.a, tw = twelve(t);
        ring.set(ss(0, 0.1, p), 0.5 + 0.5 * a);
        const fold = ss(0.1, 0.25, p), out = io(clamp((p - 0.27) / 0.16)), home = io(clamp((p - 0.46) / 0.16)), land = ss(0.62, 0.67, p);
        if (p < 0.27) { g.position.copy(s.C); g.position.y = 0.6 * ss(0.2, 0.27, p) + 0.04 * Math.sin(tw * 3) * fold; g.rotation.y = yawTo(s.fwd.x, s.fwd.z) + 0.5; }
        else if (p < 0.46) { bez(g.position, A, M1, Iu, out); g.rotation.y = yawTo(I.x - s.C.x, I.z - s.C.z); }
        else { bez(g.position, Iu, M2, perch, home); g.position.y += 0.02; g.rotation.y = lerp(yawTo(perch.x - I.x, perch.z - I.z), yawTo(-s.fwd.x - s.side.x, -s.fwd.z - s.side.z), land); }
        const flying = ss(0.25, 0.29, p) * (1 - land);
        fig.set(fold, flying * Math.sin(tw * 11) * 0.6 + (1 - flying) * Math.sin(tw * 1.4) * 0.06);
        const gone = tall ? ss(0.67, 0.72, p) : 0, carry = p > 0.46 && gone < 0.99; sg.visible = carry; sheet.material.opacity = 1 - gone; edge.material.opacity = 0.85 * (1 - gone);
        if (carry) { bez(tmp, Iu, M2, L, home); tmp.y = Math.max(0.006, g.position.y - 0.5) * (1 - land) + 0.006; sg.position.copy(tmp); sg.rotation.y = lerp(g.rotation.y, -s.th * DEG, land); }
        const flick = 0.75 + 0.25 * hash(Math.floor(t * 12)), there = ss(0.38, 0.44, p) * (1 - ss(0.47, 0.54, p));
        fire.material.opacity = (0.5 + 0.5 * there) * flick; fire.scale.setScalar(1.8 + 1.2 * there + flick * 0.3);
        plane.pool(s.C.x, s.C.z, 2.0, [1, 0.72, 0.36], 0.11 * ss(0, 0.1, p) * (0.4 + 0.6 * a));
        plane.pool(I.x, I.z, 2.6, [1, 0.5, 0.2], (0.12 + 0.2 * there) * flick);
        plane.pool(L.x, L.z, 2.2, [0.55, 0.6, 0.9], 0.07 * ss(0.62, 0.75, p) * a);
        s.u = ss(0.67, 0.8, p);
      });
    }

    // ---- 2. a fan-out: the chalk swarm
    {
      const s = S.fanout, centre = at(s, tall ? -7.5 : -4.2, 0);
      const swarm = makeSwarm({ centre, fwd: s.fwd, side: s.side, spread: tall ? 27 : 62, reach: tall ? 14 : 8.6 });
      add(swarm.mesh); flatland.add(swarm.marks);
      const task = decal(0.9, 0.9, flat(PAL.amber, { transparent: true, opacity: 0.9 })); task.position.set(centre.x, 0.007, centre.z); task.rotation.z = -s.th * DEG; flatland.add(task);
      const lift = glowSprite(PAL.amber, 1.4, 0.4); lift.position.set(centre.x, 0.25, centre.z); add(lift);
      s.lamp = at(s, -2, 0, 5); s.label = tall ? null : centre.clone().addScaledVector(s.fwd, -1.6);
      parts.push((q, t) => {
        swarm.update(t, 1 + 48 * ss(0.03, 0.62, s.p), camera, right, 0.3 + 0.7 * s.a);
        task.material.opacity = 0.35 + 0.55 * s.a;
        plane.pool(centre.x + s.fwd.x * 4, centre.z + s.fwd.z * 4, tall ? 9 : 7.5, [0.5, 0.56, 0.75], 0.055 * s.a);
        plane.pool(centre.x, centre.z, 1.6, [1, 0.72, 0.36], 0.1 * (0.3 + 0.7 * s.a));
      });
    }

    // ---- 3. a pipeline: one card down a line, each hand folding it once more
    {
      const s = S.pipeline, N = 5, gap = tall ? 1.9 : 1.75;
      const dir = tall ? s.fwd.clone().multiplyScalar(0.93).addScaledVector(s.side, 0.37).normalize() : s.side.clone();
      const P = Array.from({ length: N }, (_, k) => s.C.clone().addScaledVector(dir, (k - 2) * gap));
      const toCam = tall ? s.side.clone().multiplyScalar(-1) : s.fwd.clone().multiplyScalar(-1);
      const hands = P.map((p) => {
        const ring = makeRing(0.5); ring.group.position.copy(p); add(ring.group);
        const fig = makeFigure('fox'); fig.group.scale.setScalar(0.62); const g = new THREE.Group(); g.add(fig.group); g.position.copy(p);
        g.rotation.y = yawTo(dir.x + toCam.x * 0.5, dir.z + toCam.z * 0.5); add(g);
        return { ring, fig, g };
      });
      const piece = makeFigure('crane', { paper: PAL.cream, line: 0x6b5f4a, glowAmt: 0.55, print: false }); const pg = new THREE.Group(); pg.add(piece.group); add(pg);
      const start = P[0].clone().addScaledVector(dir, -gap), carry = toCam.clone().multiplyScalar(0.55).addScaledVector(dir, 0.55);
      s.lamp = at(s, -2.4, 0, 2.8); s.label = tall ? null : at(s, -1.7, 0);
      parts.push((q, t) => {
        const p = s.p, tw = twelve(t), STEP = 1.25, T = STEP * (N + 1), tau = tw % T, k = Math.min(N, Math.floor(tau / STEP)), f = (tau - k * STEP) / STEP;
        hands.forEach((h, i) => {
          h.ring.set(ss(i * 0.11, 0.1 + i * 0.11, p), 0.45 + 0.55 * s.a);
          h.fig.set(ss(0.06 + i * 0.11, 0.24 + i * 0.11, p));
          const bow = i === k ? Math.sin(Math.PI * ss(0.6, 1, f)) : 0;
          h.g.rotation.z = -0.3 * bow; h.g.position.y = 0.02 * Math.sin(tw * 2 + i);
        });
        const on = ss(0.6, 0.7, p); pg.visible = on > 0.01;
        if (pg.visible) {
          if (k < N) {
            const a = k === 0 ? start : P[k - 1], b = P[k], e = io(clamp(f / 0.6));
            tmp.copy(a).lerp(b, e).add(carry); tmp.y = 0.62 + Math.sin(Math.PI * e) * 0.75;
            piece.set((k + ss(0.6, 0.95, f)) / N, 0); pg.scale.setScalar(0.62 * on);
          } else {
            tmp.copy(P[N - 1]).add(carry).addScaledVector(dir, 2.6 * f).addScaledVector(UP, 0.62 + 3.2 * f * f);
            piece.set(1, Math.sin(tw * 11) * 0.6); pg.scale.setScalar(0.62 * on * (1 - ss(0.6, 1, f)));
          }
          pg.position.copy(tmp); pg.rotation.y = yawTo(dir.x, dir.z);
        }
        plane.pool(s.C.x, s.C.z, tall ? 5 : 5.5, [1, 0.74, 0.42], 0.075 * (0.25 + 0.75 * s.a));
      });
    }

    // ---- 4. an orchestrator and its workers
    {
      const s = S.orchestrator, N = 6, rx = tall ? 1.9 : 3.3, rz = tall ? 3.1 : 2.3;
      const big = makeFigure('crane', { glowAmt: 0.3 }); const bg = new THREE.Group(); bg.add(big.group); big.group.scale.setScalar(1.9); add(bg);
      const Wk = Array.from({ length: N }, (_, k) => { const a = (k * 60 + 30) * DEG; return s.C.clone().addScaledVector(s.side, Math.cos(a) * rx).addScaledVector(s.fwd, Math.sin(a) * rz); });
      const workers = Wk.map((p, k) => {
        const ring = makeRing(0.46); ring.group.position.copy(p); add(ring.group);
        const fig = makeFigure('boat'); fig.group.scale.setScalar(0.42); const g = new THREE.Group(); g.add(fig.group); g.position.copy(p); g.rotation.y = yawTo(s.side.x, s.side.z) + (k % 2 ? 0.5 : -0.4); add(g);
        const bead = glowSprite(PAL.amber, 0.42, 0); add(bead);
        return { ring, fig, g, bead };
      });
      const lp = new Float32Array(N * 6), lc = new Float32Array(N * 6);
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('color', new THREE.BufferAttribute(lc, 3));
      const threads = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); threads.frustumCulled = false; add(threads);
      s.lamp = at(s, -2.6, 0.6, 4.2); s.label = tall ? null : at(s, -3.6, 0);
      parts.push((q, t) => {
        const p = s.p, tw = twelve(t), fold = ss(0.02, 0.28, p), up = ss(0.2, 0.36, p);
        const hy = 0.02 + up * (2.0 + 0.1 * Math.sin(tw * 1.6));
        bg.position.copy(s.C); bg.position.y = hy; bg.rotation.y = yawTo(-s.fwd.x + s.side.x * 0.8, -s.fwd.z + s.side.z * 0.8);
        big.set(fold, up * Math.sin(tw * 3.2) * 0.22);
        workers.forEach((w, k) => {
          const e = ss(0.32 + k * 0.07, 0.46 + k * 0.07, p);
          w.ring.set(ss(0.26 + k * 0.07, 0.36 + k * 0.07, p), 0.45 + 0.55 * s.a); w.fig.set(e);
          const u = (tw / 3.4 + k / N) % 1, go = u < 0.42 ? u / 0.42 : u < 0.58 ? 1 : 1 - (u - 0.58) / 0.42, work = u >= 0.42 && u < 0.58 ? 1 : 0;
          w.g.position.y = 0.03 + work * 0.07 * Math.abs(Math.sin(tw * 9)); w.g.rotation.z = work * 0.12 * Math.sin(tw * 9);
          tmp.set(s.C.x, hy + 0.2, s.C.z); tmp2.copy(Wk[k]).setY(0.36);
          lp.set([tmp.x, tmp.y, tmp.z, tmp2.x, tmp2.y, tmp2.z], k * 6);
          const c = 0.42 * e * (0.3 + 0.7 * s.a); lc.set([c, c * 0.78, c * 0.44, c, c * 0.78, c * 0.44], k * 6);
          w.bead.position.copy(tmp).lerp(tmp2, io(go)); w.bead.material.opacity = 0.9 * e * (0.3 + 0.7 * s.a);
        });
        lg.attributes.position.needsUpdate = true; lg.attributes.color.needsUpdate = true;
        plane.pool(s.C.x, s.C.z, 4.4, [1, 0.74, 0.42], 0.085 * (0.25 + 0.75 * s.a) * (0.4 + 0.6 * fold));
      });
    }

    // ---- 5. a writers' room: six at one table
    {
      const s = S.writers, g0 = new THREE.Group(); g0.position.copy(s.C); g0.rotation.y = -s.th * DEG; add(g0);
      const wood = lit(0x4a3a2d), rimM = lit(0x241c17), dark = lit(0x1a1b22), TOP = 0.7;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.07, 40), wood); top.position.y = TOP - 0.035;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.86, 1.78, 0.13, 40), rimM); rim.position.y = TOP - 0.085;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.6, 12), dark); leg.position.y = 0.32;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.76, 0.04, 20), dark); foot.position.y = 0.02;
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.26, 20, 1, true), lit(0x2a2c36, { side: THREE.DoubleSide, emissive: 0x5a3e1a })); shade.position.y = 2.0;
      const wire = box(0.012, 7, 0.012, dark); wire.position.y = 5.62;
      const bulb = glowSprite(0xffd9a0, 0.8, 0.95); bulb.position.y = 1.88;
      const poolM = new THREE.MeshBasicMaterial({ map: glow(), color: 0xffc98a, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), poolM); pool.rotation.x = -Math.PI / 2; pool.position.y = TOP + 0.004; pool.renderOrder = 2;
      g0.add(rim, top, leg, foot, shade, wire, bulb, pool);
      // a written page: lines of ink, the last one still short
      const page = (n, mark) => { const t = canvasTex(128, 96, (c) => {
        c.fillStyle = '#efe6d4'; c.fillRect(0, 0, 128, 96); c.fillStyle = 'rgba(40, 38, 50, 0.7)';
        for (let i = 0; i < 6; i++) c.fillRect(12, 12 + i * 13, i === 5 ? 30 + n * 9 : 78 + ((i * 37 + n * 23) % 26), 4);
        if (mark) { c.fillStyle = 'rgba(226, 100, 70, 0.55)'; c.fillRect(10, 35, 108, 10); }
      }); return t; };
      const kinds = ['crane', 'fox', 'boat', 'fan', 'star', 'fox'];
      const seats = kinds.map((kind, k) => {
        const a = (k * 60 + 200) * DEG, x = Math.cos(a) * 1.36, z = Math.sin(a) * 1.36;
        // one of the six is on different paper: the one who was asked to slip in a fake fact
        const fig = makeFigure(kind, k === 0 ? { paper: PAL.cream, line: 0x6b5f4a, glowAmt: 0.42, print: false } : { glowAmt: 0.36 });
        fig.group.scale.setScalar(kind === 'crane' ? 0.4 : kind === 'star' ? 0.44 : 0.5); const g = new THREE.Group(); g.add(fig.group); g.position.set(x, TOP + 0.005, z); g.rotation.y = yawTo(-x, -z); g0.add(g);
        const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.375), new THREE.MeshLambertMaterial({ map: page(k, k === 0), emissive: 0x2a2620 })); sheet.rotation.x = -Math.PI / 2; sheet.rotation.z = -a - Math.PI / 2; sheet.position.set(x * 0.52, TOP + 0.006 + k * 0.0004, z * 0.52); g0.add(sheet);
        return { fig, g, x, z, a };
      });
      const flags = [1, 2, 3, 4, 5].map((k, i) => {
        const f = new THREE.Group();
        const pin = box(0.016, 0.42, 0.016, flat(0xe9e4da)); pin.position.y = 0.21;
        const tri = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0.42, 0, 0, 0.27, 0, 0.24, 0.345, 0], 3)), flat(0xff7a4a, { side: THREE.DoubleSide }));
        f.add(pin, tri); g0.add(f);
        // the five flags stand in an arc round the page they are about
        const b = seats[0].a + (i - 2) * 0.42, r = 0.42;
        const from = new THREE.Vector3(seats[k].x, TOP + 0.45, seats[k].z), to = new THREE.Vector3(seats[0].x * 0.52 - Math.cos(b) * r, TOP + 0.005, seats[0].z * 0.52 - Math.sin(b) * r);
        return { f, from, to, mid: from.clone().lerp(to, 0.5).setY(TOP + 1.25) };
      });
      const L = tall ? at(s, -3.1, -0.3) : at(s, -0.7, 3.4); const drop = courier(L, s, 0.95);
      s.lamp = at(s, -1.1, 0.4, 2.6); s.card = L; s.label = tall ? null : at(s, -3, -0.4);
      parts.push((q, t) => {
        const p = s.p, tw = twelve(t);
        seats.forEach((w, k) => { w.fig.set(ss(k * 0.03, 0.14 + k * 0.03, p)); w.g.rotation.z = Math.sin(tw * (1.3 + k * 0.23) + k * 2) * 0.05; w.g.position.y = TOP + 0.005 + Math.max(0, Math.sin(tw * (2.1 + k * 0.31) + k)) * 0.025; });
        flags.forEach((fl, i) => { const e = ss(0.22 + i * 0.045, 0.32 + i * 0.045, p); fl.f.visible = e > 0.001; bez(fl.f.position, fl.from, fl.mid, fl.to, io(e)); fl.f.rotation.y = i * 1.3 + (1 - e) * 4; });
        const k = 0.35 + 0.65 * s.a; bulb.material.opacity = 0.95 * k; poolM.opacity = 0.4 * k;
        drop(ss(0.32, 0.56, p), t, tall ? ss(0.56, 0.62, p) : 0);
        plane.pool(s.C.x, s.C.z, 4, [1, 0.72, 0.4], 0.12 * k);
        plane.pool(L.x, L.z, 2.2, [0.55, 0.6, 0.9], 0.07 * ss(0.52, 0.66, p) * s.a);
        s.u = ss(0.56, 0.7, p);
      });
    }

    // ---- 6. the wall of ten
    let wall;
    {
      const s = S.wall;
      wall = makeWall({ tall, canPlay: !still && !calm, invalidate, holder });
      wall.group.position.copy(s.C); wall.group.rotation.y = -s.th * DEG; add(wall.group);
      const L = tall ? at(s, -8.2, -0.6) : at(s, -9.6, -4.3); const drop = courier(L, s, 0.95);
      s.lamp = at(s, -6, 0, 3.4); s.card = L; s.label = tall ? null : at(s, -7.6, -0.6);
      s.wall = wall;
      parts.push((q, t) => {
        const p = s.p, rise = ss(-0.12, 0.34, p);
        s.rise = rise;
        if (q > s.q[0] - 0.09 && q < s.q[1] + 0.06) wall.load();
        wall.setPlaying(active && s.a > 0.12 && rise > 0.04);
        wall.update(rise, t, 0.35 + 0.65 * s.a);
        drop(ss(0.2, 0.42, p), t, tall ? ss(0.42, 0.52, p) : 0);
        const k = rise * (0.3 + 0.7 * s.a), w = wall.size.w;
        for (let i = -1; i <= 1; i++) plane.pool(s.C.x - s.fwd.x * 2 + s.side.x * i * w * 0.3, s.C.z - s.fwd.z * 2 + s.side.z * i * w * 0.3, tall ? 4 : 5, i === 0 ? [0.5, 0.42, 0.85] : i < 0 ? [0.85, 0.4, 0.7] : [0.4, 0.55, 0.9], 0.085 * k);
        plane.pool(L.x, L.z, 2.2, [0.55, 0.6, 0.9], 0.07 * ss(0.38, 0.5, p) * s.a);
        s.u = ss(0.42, 0.56, p);
      });
      disposers.push(() => wall.dispose());
    }

    // ---- 7. the watcher
    {
      const s = S.watcher, watcher = makeWatcher(); watcher.group.position.copy(s.C); watcher.group.rotation.y = -s.th * DEG; add(watcher.group); texts.push(watcher);
      watcher.group.updateMatrixWorld(true); s.lamp = watcher.group.localToWorld(watcher.lamp.clone());
      const L = tall ? at(s, -3, -0.2) : at(s, -1.2, 2.9); const drop = courier(L, s, 0.95);
      s.card = L; s.label = tall ? null : at(s, -2.3, 0.9);
      parts.push((q, t) => {
        const p = s.p;
        watcher.update(t, ss(0.74, 0.94, p), s.a > 0.05 && !still && !calm);
        drop(ss(0.2, 0.46, p), t, tall ? ss(0.46, 0.58, p) : 0);
        const k = 0.3 + 0.7 * s.a;
        plane.pool(s.C.x - s.fwd.x * 0.6, s.C.z - s.fwd.z * 0.6, 3.6, [1, 0.72, 0.4], 0.12 * k);
        plane.pool(L.x, L.z, 2.2, [0.55, 0.6, 0.9], 0.07 * ss(0.42, 0.6, p) * s.a);
        s.u = ss(0.46, 0.6, p);
      });
    }

    // ---- 0. arriving: the cursor, and the evening left behind
    {
      const s = S.entry; s.lamp = new THREE.Vector3(0.4, 1.4, 0.6);
      parts.push((q, t) => {
        const b = cursor.update(t);
        plane.pool(0, 0, 2.4, [1, 0.74, 0.4], 0.2 * b);
        plane.pool(evening.group.position.x, evening.group.position.z + 6, 16, [1, 0.72, 0.5], 0.09);
        wind.update(t, camera);
      });
    }

    // ---- the camera's way through the eight stops, for this shape of window. At a stop it drifts slowly from its
    // first place to its second; it reaches the stop already at that slow pace and leaves it at the same, so the
    // picture is held while the stop plays and there is no jolt going in or out.
    const keys = [], slopes = [];
    STOPS.forEach((s) => {
      const poses = tall ? s.tall : s.wide, mine = [];
      poses.forEach((c, i) => {
        const pos = at(s, -c[0], c[2], c[1]), tg = at(s, c[3], c[4], c[5]);
        mine.push([s.q[i], pos.x, pos.y, pos.z, tg.x, tg.y, tg.z, c[6]]);
      });
      const slow = mine[0].slice(1).map((v, d) => (mine[1][d + 1] - v) / (s.q[1] - s.q[0]));
      mine.forEach((k) => { keys.push(k); slopes.push(slow); });
    });
    return { parts, cam: track(keys, slopes), wall, dispose() { disposers.forEach((d) => d()); } };
  }

  // ------------------------------------------------------------------------------------------------ one frame
  const right = new THREE.Vector3(1, 0, 0), target = new THREE.Vector3();
  const pt = { x: 0, y: 0, behind: false };
  function project(v) {
    tmp3.copy(v).project(camera);
    pt.behind = tmp3.z > 1 || tmp3.z < -1; pt.x = (tmp3.x * 0.5 + 0.5) * W; pt.y = (-tmp3.y * 0.5 + 0.5) * H;
    return pt;
  }
  let mouse = null, hot = -1, lastQ = 0, lastT = 0;
  const quad = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  function frame(q, time, pointer) {
    if (!built) return false;
    q = clamp(q); lastQ = q; lastT = time;
    const S = STOPS;
    S.forEach((s) => {
      s.p = clamp((q - s.q[0]) / (s.q[1] - s.q[0]));
      s.a = s.key === 'entry' ? 1 - ss(s.q[1], s.q[1] + 0.03, q) : ss(s.q[0] - 0.036, s.q[0] + 0.004, q) * (s.key === 'watcher' ? 1 : 1 - ss(s.q[1] - 0.002, s.q[1] + 0.034, q));
    });
    // the camera
    const c = built.cam(q);
    camera.position.set(c[0], Math.max(0.3, c[1]), c[2]); target.set(c[3], c[4], c[5]);
    camera.fov = c[6]; camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    // the scenes, and the light of whichever the camera is with
    plane.begin(camera);
    for (let i = 0; i < built.parts.length; i++) built.parts[i](q, time);
    plane.end();
    let wsum = 0; tmp.set(0, 0, 0);
    S.forEach((s) => { const w = s.a * s.a; if (s.lamp && w > 0) { tmp.addScaledVector(s.lamp, w); wsum += w; } });
    if (wsum > 0.0001) { key.position.copy(tmp.multiplyScalar(1 / wsum)); key.intensity = 60 * Math.min(1, wsum); } else key.intensity = 0;
    // draw: first the world upside down, which is what the glass mirrors; then the glass over it, and the world
    renderer.info.reset();
    renderer.clear();
    world.scale.y = -1; plane.mesh.visible = false; flatland.visible = false;
    renderer.render(scene, camera);
    renderer.clearDepth();
    world.scale.y = 1; plane.mesh.visible = true; flatland.visible = true;
    renderer.render(scene, camera);
    layoutUI(q, time, pointer);
    // a page that draws only when asked keeps drawing while one video is being played with its sound
    if ((still || calm) && built.wall.heard >= 0) invalidate();
    return true;
  }

  // ------------------------------------------------------------------------------------------------ the words
  function layoutUI(q, time, pointer) {
    const S = Object.fromEntries(STOPS.map((s) => [s.key, s]));
    // the chapter's name, over the arrival
    const la = 1 - ss(0.024, 0.052, q);
    ui.place(ui.lead, 0, -(1 - la) * 40, la);
    // the labels: under each scene on a wide window; on a tall one, in a fixed place under the picture
    Object.entries(ui.labels).forEach(([k, e]) => {
      const s = S[k], a = s.a * ss(0.02, 0.12, s.p);
      if (a <= 0.01) { ui.place(e, 0, 0, 0); return; }
      const b = ui.size(e);
      if (tall || !s.label) { ui.place(e, Math.round((W - b.w) / 2), Math.round(H * s.labelY), a); return; }
      const p = project(s.label);
      ui.place(e, clamp(p.x - b.w / 2, IN + 16, W - b.w - 16), Math.min(p.y, H - b.h - 18), p.behind ? 0 : a);
    });
    // the post cards: each stands where its helper set it down
    Object.entries(ui.posts).forEach(([k, card]) => {
      const s = STOPS.find((x) => x.post === k), u = s.u || 0;
      let a = s.a * (u > 0.001 ? 1 : 0);
      if (a <= 0.01) { ui.place(card.a, 0, 0, 0); return; }
      ui.fold(k, u);
      const w = ui.size(card.a).w, h = ui.size(card.a).h;
      if (tall) {
        // docked at the foot of the window; at the wall it makes room for the screens once they are up
        const away = k === 'gauntlet' ? ss(0.7, 0.8, s.p) : 0;
        ui.place(card.a, Math.round((W - w) / 2), H - h - 14 + away * (h + 30), a * (1 - away));
        return;
      }
      const p = project(s.card), dist = camera.position.distanceTo(s.card), sc = clamp(7.2 / dist, 0.74, k === 'gauntlet' ? 0.8 : 1);
      if (k === 'gauntlet') a *= 1 - ss(0.82, 0.97, s.p) * 0;
      const half = w * sc / 2, cx = s.a > 0.98 ? clamp(p.x, IN + half + 20, W - half - 20) : p.x;
      ui.place(card.a, cx - w / 2, Math.min(p.y + 4, H - 16) - h, p.behind ? 0 : a, sc);
    });
    // the wall: the names under the ten screens, the key, the sound switch
    const ws = S.wall, wall = built.wall, wa = ws.a * (ws.rise || 0);
    let over = -1;
    const px = pointer ? pointer.x : mouse ? mouse.x : -1, py = pointer ? pointer.y : mouse ? mouse.y : -1;
    wall.screens.forEach((sc, i) => {
      const e = ui.tags[i];
      const up = clamp((ws.rise || 0) * 1.9 - sc.w.level * 0.18 - sc.w.row * 0.08);
      if (wa <= 0.01 || up < 0.9) { ui.place(e, 0, 0, 0); return; }
      // the four corners of the picture, on the window
      const m = sc.pic.matrixWorld;
      quad[0].set(-SW / 2, 0, 0).applyMatrix4(m); quad[1].set(SW / 2, 0, 0).applyMatrix4(m); quad[2].set(SW / 2, SH, 0).applyMatrix4(m); quad[3].set(-SW / 2, SH, 0).applyMatrix4(m);
      const a = project(quad[0]), ax = a.x, ay = a.y, b = project(quad[1]), bx = b.x, by = b.y, c2 = project(quad[2]), cx = c2.x, cy = c2.y, d = project(quad[3]), dx = d.x, dy = d.y;
      if (px >= Math.min(ax, dx) && px <= Math.max(bx, cx) && py >= Math.min(cy, dy) && py <= Math.max(ay, by)) over = i;
      ui.place(e, Math.min(ax, dx) + 1, Math.max(ay, by) + (tall ? 3 : 6), wa * ss(0.9, 1, up));
    });
    hot = wa > 0.3 && shown ? over : -1;
    if (!('ontouchstart' in window) && hot >= 0 && hot !== wall.picked) choose(hot);
    root.classList.toggle('at-hot', hot >= 0 && shown);
    const keyA = wa * ss(0.75, 1, ws.rise || 0) * (tall ? ss(0.78, 0.88, ws.p) : 1);
    const sb = ui.size(ui.sound), kb = ui.size(ui.key);
    if (tall) { ui.place(ui.key, 14, H - sb.h - kb.h - 22, keyA); ui.place(ui.sound, 14, H - sb.h - 14, keyA); ui.place(ui.now, 0, 0, 0); }
    else {
      ui.place(ui.sound, W - sb.w - 24, H - sb.h - 22, keyA);
      ui.place(ui.key, W - kb.w - 24, H - sb.h - kb.h - 36, keyA);
      ui.place(ui.now, 0, 0, 0);
    }
    // grain: a new throw twelve times a second
    const gs = Math.floor(time * 12);
    ui.put(grain, 'backgroundPosition', Math.round(hash(gs) * 160) + 'px ' + Math.round(hash(gs + 0.5) * 160) + 'px');
  }

  // ------------------------------------------------------------------------------------------------ choosing a screen, and the sound
  function choose(i) {
    const wall = built.wall; wall.pick(i);
    ui.tags.forEach((b, k) => { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    say(); if (still || calm) invalidate();
  }
  function say() {
    const wall = built.wall, on = wall.soundOn, i = wall.picked;
    ui.off.setAttribute('aria-pressed', on ? 'false' : 'true'); ui.on.setAttribute('aria-pressed', on ? 'true' : 'false');
    ui.soundSay.textContent = on && i >= 0 ? 'Playing ' + WALL[i].title + ', by ' + WALL[i].model + ' at ' + WALL[i].effort + '. ' + WALL_WORDS.pickSay : WALL_WORDS.soundSay;
    ui.forget();
  }
  // (the canvas lies behind the page's cards: the pointer is read from the document. A press on a card, a link, a
  // button or the rail is theirs; only the world's own screens are chosen here, and only while the world is shown)
  const free = (e) => !(e.target && e.target.closest && e.target.closest('a, button, input, label, #rail, .at-post, .at-sound'));
  const onMove = (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; mouse = { x: e.clientX, y: e.clientY }; if (still || calm) invalidate(); };
  const onLeave = () => { mouse = null; };
  const onClick = (e) => { if (!built || !shown || !free(e)) return; mouse = { x: e.clientX, y: e.clientY }; layoutUI(lastQ, lastT); if (hot >= 0) choose(hot); };
  document.addEventListener('pointermove', onMove, { passive: true }); document.documentElement.addEventListener('pointerleave', onLeave); document.addEventListener('click', onClick);
  ui.tags.forEach((b, i) => { b.addEventListener('click', () => choose(i)); b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') choose(i); }); b.addEventListener('focus', () => choose(i)); });
  ui.on.addEventListener('click', () => { built.wall.setSound(true); choose(built.wall.picked); say(); });
  ui.off.addEventListener('click', () => { built.wall.setSound(false); say(); });

  // ------------------------------------------------------------------------------------------------ size, life
  function resize() {
    W = host.clientWidth || 1; H = host.clientHeight || 1;
    const wasTall = tall; tall = W / H < 0.8;
    host.classList.toggle('at-tall', tall); uiHost.classList.toggle('at-tall', tall);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxDpr || 2));
    renderer.setSize(W, H, false); strokeWindow(W, H);
    // (the page's rail stands over the left of a wide window: the picture is framed for the part right of it, IN wide)
    IN = tall ? 0 : Math.max(0, Math.min(W * 0.3, options.inset ? options.inset() : 0));
    camera.aspect = tall ? W / (H * 1.3) : (W - IN) / H;
    // on a tall window the picture's middle sits in the upper part, and the words have the foot
    if (tall) camera.setViewOffset(W, H * 1.3, 0, H * 0.3, W, H); else if (IN > 0) camera.setViewOffset(W - IN, H, -IN, 0, W, H); else camera.clearViewOffset();
    ui.forget();
    if (!built || wasTall !== tall) {
      if (built) { built.dispose(); forgetStrokes(); world.clear(); world.add(key); flatland.clear(); texts.length = 0; holder.textContent = ''; scene.children.filter((o) => o.isLineSegments).forEach((o) => scene.remove(o)); }
      built = build();
    }
  }
  resize();
  // the words drawn into the world wait for the site's own monospace
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('500 44px "JetBrains Mono"'), document.fonts.load('700 21px "JetBrains Mono"')]).then(() => { texts.forEach((t) => t.redraw()); ui.forget(); invalidate(); }).catch(() => {});
  }

  return {
    frame, resize,
    // the words and cards over the world: off while the world is only a picture in the television's glass
    show(on) { on = !!on; if (on === shown) return; shown = on; ui.ui.style.visibility = on ? '' : 'hidden'; if (!on) root.classList.remove('at-hot'); },
    setActive(on) { active = !!on; if (!on && built) built.wall.setPlaying(false); },
    // where each stop is at its best, for a page that shows stills
    stops: STOPS.map((s) => (s.key === 'entry' ? 0.012 : lerp(s.q[0], s.q[1], s.key === 'watcher' ? 0.7 : 0.96))),
    stats() { const i = renderer.info.render; return { calls: i.calls, triangles: i.triangles, lines: i.lines }; },
    dispose() {
      document.removeEventListener('pointermove', onMove); document.documentElement.removeEventListener('pointerleave', onLeave); document.removeEventListener('click', onClick); root.classList.remove('at-hot');
      if (built) built.dispose(); renderer.dispose(); canvas.remove(); grain.remove(); ui.ui.remove(); holder.remove(); host.classList.remove('at-host', 'at-tall'); uiHost.classList.remove('at-tall');
    },
  };
}
