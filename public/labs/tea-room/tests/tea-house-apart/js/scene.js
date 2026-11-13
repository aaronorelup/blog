// The tea house of the homepage, by night, built piece by piece so it can be taken apart.
// mount(canvas) builds the world once and returns a view whose render(T, time, o) draws one frame: everything in
// it is a function of T (the track's progress, 0 to 1), of time (seconds, for the petals and the lamps' flicker)
// and of o (where the picture sits in the window). Nothing is remembered from one frame to the next, so any T can
// be drawn at any moment, in any order.
import {
  AdditiveBlending, CanvasTexture, CircleGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3,
  WebGLRenderer,
} from 'three';
import { ACT, cameraAt } from './camera.js';
import { buildGarden } from './world/garden.js';
import { buildHouse } from './world/house.js';
import { buildInterior } from './world/interior.js';
import { makeKit, OUTLINE } from './world/kit.js';
import { buildLamps } from './world/lamps.js';
import { P, makeRig, setPalette } from './world/palette.js';
import { buildPetals } from './world/petals.js';
import { buildSky } from './world/sky.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// The layers of the exploded drawing, top down, which is also the order they leave in.
// lift: how high the layer ends above where it stood (metres); out: how far its pieces slide away from the house;
// win: when the layer moves, as a share of the take-apart; span: how much of that window one piece takes.
export const TIERS = {
  roof:      { lift: 16.4, out: 1.7, win: [0.00, 0.17], span: 0.62 },
  ceiling:   { lift: 14.0, out: 0,   win: [0.14, 0.25], span: 1 },
  beams:     { lift: 11.7, out: 1.3, win: [0.22, 0.37], span: 0.5 },
  screens:   { lift: 8.7,  out: 2.9, win: [0.33, 0.57], span: 0.3 },
  walls:     { lift: 5.9,  out: 2.1, win: [0.53, 0.69], span: 0.45 },
  furniture: { lift: 3.3,  out: 0,   win: [0.65, 0.87], span: 0.32 },
  floor:     { lift: 1.0,  out: 1.2, win: [0.83, 1.00], span: 0.42 },
};

export function mount(canvas) {
  setPalette(1);                                    // the same evening as the tea room: night
  const kit = makeKit();
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(P.cream, 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 400);

  const rig = makeRig(1);
  scene.add(rig.amb, rig.hemi, rig.dir);
  const sky = buildSky(kit, rnd(7));
  scene.add(sky.dome, sky.clouds, sky.stars);
  scene.add(kit.part(new CircleGeometry(70, 40), kit.M.grass, [0, -0.02, 4], [-Math.PI / 2, 0, 0], 0));   // the ground
  scene.add(buildGarden(kit));
  const lamps = buildLamps(kit);
  scene.add(lamps.fixed);
  const pieces = [...buildHouse(kit), ...buildInterior(kit), ...lamps.pieces];
  const byName = new Map(pieces.map(p => [p.name, p]));
  pieces.forEach(p => scene.add(p.obj));
  const petals = buildPetals(rnd(11), 130);
  scene.add(petals.mesh);

  // Lamplight lying on the grass, as the tea room's painted garden has it: a soft warm pool where the open front
  // spills onto the path, and one under each stone lantern. Drawn light, added to the ground; no picture file.
  const glow = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    r.addColorStop(0.7, 'rgba(255,255,255,0.16)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  })();
  const pool = (x, z, rx, rz, color, strength) => {
    const m = new Mesh(new CircleGeometry(1, 36), new MeshBasicMaterial({ map: glow, color, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false, fog: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); m.scale.set(rx, rz, 1); m.userData.strength = strength;
    scene.add(m);
    return m;
  };
  const spill = pool(0, 9.6, 6.2, 7.4, 0xC97A32, 0.5);
  pool(3.2, 8.2, 3.4, 3.4, 0xD9822E, 0.42);
  pool(-9.6, 5.4, 3.0, 3.0, 0xD9822E, 0.38);

  let W = 1, H = 1, tall = false;

  // Where every piece ends up, and when it goes. A tall window stacks the layers higher and spreads them less.
  function plan() {
    const V = tall ? 1.3 : 1, S = tall ? 0.5 : 1;
    const tiers = {};
    pieces.forEach(p => { if (!p.follow) (tiers[p.tier] = tiers[p.tier] || []).push(p); });
    for (const name of Object.keys(tiers)) {
      const T = TIERS[name], list = tiers[name];
      const seqs = [...new Set(list.map(p => p.seq || 0))].sort((a, b) => a - b);
      const n = seqs.length, a = T.win[0], b = T.win[1], d = n > 1 ? (b - a) * T.span : b - a;
      list.forEach(p => {
        const i = seqs.indexOf(p.seq || 0);
        p.t0 = n > 1 ? a + (b - a - d) * i / (n - 1) : a;
        p.t1 = p.t0 + d;
        const dir = p.dir || [0, 0], al = p.along || [0, 0], out = (p.out !== undefined ? p.out : T.out) * S;
        p.away = new Vector3(dir[0] * out + al[0] * S, (T.lift + (p.up || 0)) * V, dir[1] * out + al[1] * S);
      });
    }
    pieces.forEach(p => {
      if (p.follow) { const f = byName.get(p.follow); p.t0 = f.t0; p.t1 = f.t1; p.away = f.away; }
      // the lean a piece takes in mid-flight: the leading edge lifts, small things lean more
      const hx = p.away.x, hz = p.away.z, hl = Math.hypot(hx, hz);
      p.tx = hl > 0.05 ? hx / hl : 0.6; p.tz = hl > 0.05 ? hz / hl : 0.8;
      p.lean = Math.max(p.size.x, p.size.z) > 3 ? 0.035 : 0.09;
      p.k = -1;
    });
  }

  // Every piece at take-apart progress u: first it lifts clear, then it slides to its place, and it rests square.
  function pose(u) {
    for (const p of pieces) {
      const k = clamp((u - p.t0) / (p.t1 - p.t0));
      if (k === p.k) continue;
      p.k = k;
      const ky = io(clamp(k * 1.22)), kh = io(clamp((k - 0.22) / 0.78));
      p.obj.position.set(p.home.x + p.away.x * kh, p.home.y + p.away.y * ky, p.home.z + p.away.z * kh);
      const a = Math.sin(Math.PI * k) * p.lean;
      p.obj.rotation.set(a * p.tz, 0, -a * p.tx);
    }
  }

  const cam = { p: [0, 0, 0], q: [0, 0, 0], fov: 46 };
  const moon0 = rig.dir.intensity, MOON = 1.15;
  const look = new Vector3();
  const bounce = lamps.lights.find(l => l.follow === 'bounce');
  const wallBack = byName.get('wall-back');

  function render(T, time, o) {
    const u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
    pose(u);

    cameraAt(T, tall, cam);
    camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
    look.set(cam.q[0], cam.q[1], cam.q[2]);
    camera.lookAt(look);
    camera.fov = cam.fov;
    // where the picture sits in the window: sx and sy slide it, as shares of the window, without bending it
    const sx = (o && o.sx) || 0, sy = (o && o.sy) || 0;
    if (sx || sy) camera.setViewOffset(W, H, sx * W, sy * H, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // the ink line holds its weight on screen: never under the homepage's 3.5 cm, never under about 1.5 pixels
    const dist = camera.position.distanceTo(look);
    kit.ink.uniforms.uW.value = Math.max(OUTLINE, 1.5 * 2 * dist * Math.tan(cam.fov * Math.PI / 360) / H);

    // each lantern's light goes where its lantern went; the room's soft bounce rises to sit among the walls
    lamps.lights.forEach((l, i) => {
      if (l.follow === 'bounce') {
        l.light.position.y = l.home.y + (wallBack.obj.position.y - wallBack.home.y) * 0.72;
      } else if (l.follow) {
        const p = byName.get(l.follow);
        l.light.position.set(l.home.x + p.obj.position.x - p.home.x, l.home.y + p.obj.position.y - p.home.y, l.home.z + p.obj.position.z - p.home.z);
      }
      l.light.intensity = l.base * (1 + 0.035 * Math.sin(time * 6.1 + i * 2.3) * Math.sin(time * 2.7 + i * 1.1));
    });

    // outside, the moon does the drawing: it comes up as the camera leaves the room, and the light on the path
    // goes with the room that cast it
    rig.dir.intensity = moon0 + (MOON - moon0) * ss(0.085, ACT.whole, T);
    spill.material.opacity = spill.userData.strength * (1 - 0.75 * ss(0.12, 0.7, u));

    petals.update(time);
    renderer.render(scene, camera);
  }

  function resize(w, h, dpr) {
    W = w; H = h;
    const was = tall;
    tall = w / h < 0.8;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    sky.stars.material.size = 1.7 * dpr;
    if (was !== tall || !pieces[0].away) plan();
  }

  // a point of the world on the window, in CSS pixels (after the last render)
  const v = new Vector3();
  function project(x, y, z, out) {
    v.set(x, y, z).project(camera);
    out.x = (v.x * 0.5 + 0.5) * W; out.y = (-v.y * 0.5 + 0.5) * H; out.behind = v.z > 1;
    return out;
  }

  return {
    render, resize, project, pieces,
    piece: (name) => byName.get(name),
    isTall: () => tall,
    info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pieces: pieces.length, lights: lamps.lights.length + 3 }),
    dispose: () => renderer.dispose(),
  };
}
