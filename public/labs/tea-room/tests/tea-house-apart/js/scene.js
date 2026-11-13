// The tea house of the homepage, by night, built piece by piece so it can be taken apart.
// mount(canvas) builds the world once and returns a view whose render(T, time, safe) draws one frame: everything
// in it is a function of T (the track's progress, 0 to 1), of time (seconds, for the petals and the lamps'
// flicker) and of safe (the part of the window the drawing may use). Nothing is remembered from one frame to the
// next, so any T can be drawn at any moment, in any order.
import {
  AdditiveBlending, CanvasTexture, CircleGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3,
  WebGLRenderer,
} from 'three';
import { ACT, cameraAt } from './camera.js';
import { plan, pose } from './plan.js';
import { buildGarden } from './world/garden.js';
import { buildHouse } from './world/house.js';
import { buildInterior } from './world/interior.js';
import { makeKit, OUTLINE } from './world/kit.js';
import { buildLamps } from './world/lamps.js';
import { P, makeRig, setPalette } from './world/palette.js';
import { buildPetals } from './world/petals.js';
import { buildSky } from './world/sky.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

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

  let W = 1, H = 1, tall = false, pl = null;
  const cam = { p: [0, 0, 0], q: [0, 0, 0], fov: 46 };
  const look = new Vector3(), v = new Vector3();
  const moon0 = rig.dir.intensity, MOON = 2.0;
  const bounce = lamps.lights.find(l => l.follow === 'bounce');
  const wallBack = byName.get('wall-back');
  const box = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let lastZoom = 1;

  // the rectangle of the window the house covers, every piece of it, as the camera stands
  function extent() {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pieces) {
      const c = p.obj.position, hx = p.size.x / 2, hy = p.size.y / 2, hz = p.size.z / 2;
      for (let i = 0; i < 8; i++) {
        v.set(c.x + (i & 1 ? hx : -hx), c.y + (i & 2 ? hy : -hy), c.z + (i & 4 ? hz : -hz)).project(camera);
        if (v.x < x0) x0 = v.x; if (v.x > x1) x1 = v.x; if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
      }
    }
    box.x0 = (x0 * 0.5 + 0.5) * W; box.x1 = (x1 * 0.5 + 0.5) * W; box.y0 = (-y1 * 0.5 + 0.5) * H; box.y1 = (-y0 * 0.5 + 0.5) * H;
    return box;
  }

  // safe: { x0, y0, x1, y1 } in CSS pixels, the part of the window the drawing may use (the card takes the rest)
  function render(T, time, safe) {
    const u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
    pose(pieces, pl, u);

    cameraAt(T, tall, cam);
    camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
    look.set(cam.q[0], cam.q[1], cam.q[2]);
    camera.lookAt(look);
    camera.fov = cam.fov;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // Once the camera is outside and the house starts to open, the drawing is kept whole inside the space it is
    // given, whatever the window's shape: the picture is slid, and made smaller if it must be, without bending it.
    let zoom = 1;
    const w = ss(ACT.whole, ACT.apart0 + 0.07, T);
    if (w > 0 && safe) {
      camera.updateMatrixWorld();
      const b = extent(), bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      const fit = Math.min(1, (safe.x1 - safe.x0) / bw, (safe.y1 - safe.y0) / bh);
      zoom = 1 + (fit - 1) * w;
      const cx = W / 2 + ((b.x0 + b.x1) / 2 - W / 2) * zoom, cy = H / 2 + ((b.y0 + b.y1) / 2 - H / 2) * zoom;
      const dx = ((safe.x0 + safe.x1) / 2 - cx) * w, dy = ((safe.y0 + safe.y1) / 2 - cy) * w;
      camera.setViewOffset(W, H, (W - W / zoom) / 2 - dx / zoom, (H - H / zoom) / 2 - dy / zoom, W / zoom, H / zoom);
    }

    lastZoom = zoom;

    // the ink line holds its weight on screen: never under the homepage's 3.5 cm, never under about 1.5 pixels
    const dist = camera.position.distanceTo(look);
    kit.ink.uniforms.uW.value = Math.max(OUTLINE, 1.5 * 2 * dist * Math.tan(cam.fov * Math.PI / 360) / (H * zoom));

    // each lantern's light goes where its lantern went; the room's soft bounce rises to sit among the walls
    lamps.lights.forEach((l, i) => {
      if (l === bounce) {
        l.light.position.y = l.home.y + (wallBack.obj.position.y - wallBack.home.y) * 0.72;
      } else if (l.follow) {
        const p = byName.get(l.follow);
        l.light.position.set(l.home.x + p.obj.position.x - p.home.x, l.home.y + p.obj.position.y - p.home.y, l.home.z + p.obj.position.z - p.home.z);
      }
      l.light.intensity = l.base * (1 + 0.035 * Math.sin(time * 6.1 + i * 2.3) * Math.sin(time * 2.7 + i * 1.1));
    });

    // outside, the moon does the drawing: it comes up as the camera leaves the room, and the light on the path
    // goes with the room that cast it
    rig.dir.intensity = moon0 + (MOON - moon0) * ss(0.1, 0.2, T);
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
    if (was !== tall || !pl) pl = plan(pieces, tall);
  }

  // a point of the world on the window, in CSS pixels (after the last render)
  function project(x, y, z, out) {
    v.set(x, y, z).project(camera);
    out.x = (v.x * 0.5 + 0.5) * W; out.y = (-v.y * 0.5 + 0.5) * H; out.behind = v.z > 1;
    return out;
  }

  return {
    render, resize, project, pieces,
    piece: (name) => byName.get(name),
    isTall: () => tall,
    info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pieces: pieces.length, lights: lamps.lights.length + 3, zoom: +lastZoom.toFixed(3) }),
    dispose: () => renderer.dispose(),
  };
}
