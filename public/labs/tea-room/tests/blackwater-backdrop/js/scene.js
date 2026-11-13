/* Blackwater's cave as a living backdrop. The rock is the game's own: its map (layout.json) and its own code (cave/cave.js,
   ported from the game's public repository) build it here, flat-shaded in its zone colours, and it is lit with the game's
   own numbers: the diver's head lamp (an 84 degree cone at the eye, 90 with a square falloff, turned down near rock the
   way the game does), the zone's ambient, the sun over the open pool, exponential fog that eats the distance, motes.
   The daylight fills the pool and is gone a few metres down the throat, so from there on every frame is the lamp's oval
   on the rock with black all round it, as in the game's own tunnel shots. This chapter's garden is at night, so above
   the water the sun is turned down to moonlight and the camp is lit by its own lantern and the diver's lamp.

   mount(host, options) -> { frame(q, time, pointer), resize(), setActive(on), dispose(), pace(ms), stats() }
   Everything on screen is a function of q (0..1, how far through the chapter), time (seconds) and pointer ({x, y} in
   -1..1, where the reader looks). Nothing here keeps a clock of its own: any frame can be asked for again and comes out
   the same. Nothing listens to the window: the host page reads the scroll and the mouse and hands them in. */
import * as THREE from '../lib/three.module.min.js';
import { initSdf, sdf } from './cave/cave.js';
import { camAt, lookAt, HOLD_AT, WATER_Y, FIGURE, CHEMLIGHT, LINE } from './route.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---- the game's numbers (src/main.ts, src/tuning.ts, src/effects/atmosphere.ts)
const LAMP = { color: 0xcfe0d4, intensity: 90, distance: 65, half: THREE.MathUtils.degToRad(84 / 2), penumbra: 0.65, decay: 2 };
const FOG_K = 1.7, CLEAR_VIS = 35, SHALLOW_VIS = 70, SUN = 700;                // fog density = fogK / visibility (FogExp2)
const ZONE = {
  sinkhole: { fog: new THREE.Color(0x0d3640), ambient: new THREE.Color(0x3a4a50), mote: new THREE.Color(0xc8d8d2) },
  galleries: { fog: new THREE.Color(0x08211e), ambient: new THREE.Color(0x33443f), mote: new THREE.Color(0xb8c8bc) },
};
const ABOVE = { bg: new THREE.Color(0x8fb6c4), fog: new THREE.Color(0x9fc3cf), density: 0.012, ambient: 0.65 };
// this chapter's garden is at night: above the water the sinkhole has moonlight, not the game's noon (its sun, turned down)
const NIGHT = { sun: 0.3, ambient: 0.32 };
const DEPTH_DARK = { start: 6, end: 45, floor: 0.12 };
const MOTES = { fadeNear: 1.6, fadeFar: 7.5, box: 10, size: 0.1, opacity: 0.55 };
const BOX = { min: [-20, -34, -26], max: [20, 12, 14] }; // the part of the cave that is built: around the route

// ------------------------------------------------------------------ small textures, drawn by code (as the game draws them)
function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function rayTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(235,250,240,0.85)'); v.addColorStop(0.55, 'rgba(190,230,220,0.30)'); v.addColorStop(1, 'rgba(160,210,200,0)');
  g.fillStyle = v; g.fillRect(0, 0, 64, 256);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.25, 'rgba(0,0,0,0)'); h.addColorStop(0.75, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = h; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ one of the drowned crew (src/zombies/drowned.ts: its boxes, its kit colours, its swim)
function buildDrowned() {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, flatShading: true });
  // the denim coverall kit, nudged the way the game nudges each man's colours; he is on the drill crew (the hard hat)
  const skin = mat(0x66765d), shirt = mat(0x22374a), pants = mat(0x1d2b39), accent = mat(0x3a2a1a), pale = mat(0x6e7263);
  const group = new THREE.Group(), body = new THREE.Group();
  group.add(body);
  const torsoW = 1.06, limbLen = 1.02;
  const part = (m, sx, sy, sz, x, y, z, parent) => { const o = new THREE.Mesh(box, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); parent.add(o); return o; };
  part(shirt, 0.52 * torsoW, 0.62, 0.3, 0, 0, 0, body);
  part(pants, 0.44 * torsoW, 0.34, 0.27, 0, -0.48, 0, body);
  part(accent, 0.5 * torsoW, 0.09, 0.33, 0, -0.33, 0, body); // the belt
  const head = part(skin, 0.24, 0.28, 0.25, 0, 0.5, 0.02, body);
  part(accent, 0.3, 0.1, 0.31, 0, 0.68, 0.02, body); // the drill crew's hard hat
  const limb = (m, mEnd, x, y, len, th) => {
    const g = new THREE.Group(); g.position.set(x, y, 0);
    part(m, th, len * 0.72, th, 0, -len * 0.36, 0, g); part(mEnd, th * 0.85, len * 0.3, th * 0.85, 0, -len * 0.85, 0, g);
    body.add(g); return g;
  };
  const armX = 0.33 * torsoW;
  const armL = limb(shirt, skin, -armX, 0.26, 0.62 * limbLen, 0.13), armR = limb(shirt, skin, armX, 0.26, 0.62 * limbLen, 0.13);
  const legL = limb(pants, accent, -0.14, -0.66, 0.7 * limbLen, 0.15), legR = limb(pants, accent, 0.14, -0.66, 0.7 * limbLen, 0.15);
  part(pale, 0.16, 0.42, 0.16, 0, 0.05, -0.26, body); // a canister on his back
  return { group, body, head, armL, armR, legL, legR, geos: [box], mats: [skin, shirt, pants, accent, pale] };
}
// the game's 'swim' pose (animateDrowned), as a pure function of time
function poseSwim(rig, t, speed) {
  const s = Math.sin(t * 1.7), c = Math.sin(t * 1.7 + Math.PI / 2);
  rig.body.rotation.set(1.15, 0, 0.1 * Math.sin(t * 0.9));
  rig.armL.rotation.set(-1.3 + 0.25 * s * (0.4 + speed), 0, 0.2);
  rig.armR.rotation.set(-1.3 + 0.25 * c * (0.4 + speed), 0, -0.2);
  rig.legL.rotation.set(0.3 * s * (0.5 + speed), 0, 0.06);
  rig.legR.rotation.set(-0.3 * s * (0.5 + speed), 0, -0.06);
  rig.head.rotation.set(-0.75 + 0.1 * c, 0, 0);
}

// ------------------------------------------------------------------ the camp on the shore shelf (as in the game's camp shots): a lamp post, a cot,
// a work table with papers, a crate, a stump for a stool, a jerrycan, a coil of line; all boxes, as the game builds them
function buildCamp(floorAt) {
  const g = new THREE.Group(), box = new THREE.BoxGeometry(1, 1, 1);
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3c2a, roughness: 0.9, flatShading: true });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.9, flatShading: true });
  const canvasM = new THREE.MeshStandardMaterial({ color: 0x4d5a3a, roughness: 0.95, flatShading: true });
  const paper = new THREE.MeshStandardMaterial({ color: 0xb9b29a, roughness: 0.95, flatShading: true });
  const iron = new THREE.MeshStandardMaterial({ color: 0x1c1f22, roughness: 0.6, metalness: 0.3, flatShading: true });
  const can = new THREE.MeshStandardMaterial({ color: 0x3f4a2c, roughness: 0.7, flatShading: true });
  const rope = new THREE.MeshStandardMaterial({ color: 0xd8d6c8, roughness: 0.8, flatShading: true });
  const bulb = new THREE.MeshBasicMaterial({ color: 0xffe2a8 });
  const put = (m, sx, sy, sz, x, z, y0, ry = 0) => { const o = new THREE.Mesh(box, m); o.scale.set(sx, sy, sz); o.position.set(x, floorAt(x, z) + y0 + sy / 2, z); o.rotation.y = ry; g.add(o); return o; };
  // the lamp post at the water's edge, its lamp lit
  const px = 9.4, pz = 2.4, py = floorAt(px, pz);
  put(iron, 0.08, 1.9, 0.08, px, pz, 0);
  put(iron, 0.36, 0.06, 0.36, px, pz, 0);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 8), iron); shade.position.set(px, py + 2.06, pz); g.add(shade);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.13), bulb); lamp.position.set(px, py + 1.9, pz); g.add(lamp);
  put(can, 0.26, 0.34, 0.18, px + 0.35, pz + 0.3, 0, 0.4); // the lamp's battery box at its foot
  // a cot, its canvas, its legs
  const cx = 10.0, cz = 3.9, cr = 0.25;
  put(wood, 1.9, 0.08, 0.72, cx, cz, 0.36, cr);
  put(canvasM, 1.6, 0.07, 0.62, cx, cz, 0.44, cr);
  put(canvasM, 0.42, 0.12, 0.5, cx - 0.62 * Math.cos(cr), cz + 0.62 * Math.sin(cr), 0.5, cr); // a rolled bag for a pillow
  for (const [dx, dz] of [[-0.8, -0.28], [0.8, -0.28], [-0.8, 0.28], [0.8, 0.28]]) {
    const c = Math.cos(cr), sn = Math.sin(cr);
    put(wood, 0.07, 0.38, 0.07, cx + dx * c + dz * sn, cz - dx * sn + dz * c, 0);
  }
  // the work table, papers and a mug on it, a stump for a stool
  const tx = 10.85, tz = 6.25, tr = -0.35;
  put(darkWood, 1.3, 0.07, 0.8, tx, tz, 0.72, tr);
  for (const [dx, dz] of [[-0.58, -0.34], [0.58, -0.34], [-0.58, 0.34], [0.58, 0.34]]) {
    const c = Math.cos(tr), sn = Math.sin(tr);
    put(darkWood, 0.07, 0.72, 0.07, tx + dx * c + dz * sn, tz - dx * sn + dz * c, 0);
  }
  put(paper, 0.34, 0.012, 0.26, tx - 0.25, tz - 0.05, 0.79, tr + 0.2);
  put(paper, 0.3, 0.012, 0.24, tx + 0.22, tz + 0.12, 0.79, tr - 0.3);
  put(iron, 0.09, 0.11, 0.09, tx + 0.4, tz - 0.25, 0.79);
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.46, 7), darkWood); stump.position.set(tx - 0.2, floorAt(tx - 0.2, tz - 0.9) + 0.23, tz - 0.9); g.add(stump);
  // a crate with a kit bag on it, a jerrycan, a coil of line
  put(wood, 0.6, 0.5, 0.5, 11.3, 2.0, 0, -0.3);
  put(canvasM, 0.36, 0.14, 0.26, 11.3, 2.0, 0.5, -0.1);
  put(can, 0.34, 0.46, 0.17, 12.0, 4.7, 0, 0.6);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 5, 10), rope); coil.rotation.x = Math.PI / 2; coil.position.set(8.9, floorAt(8.9, 3.2) + 0.05, 3.2); g.add(coil);
  return { group: g, lampPos: new THREE.Vector3(px, py + 1.9, pz), geos: [box, shade.geometry, lamp.geometry, stump.geometry, coil.geometry], mats: [wood, darkWood, canvasM, paper, iron, can, rope, bulb] };
}

// ------------------------------------------------------------------ motes in the water (src/effects/atmosphere.ts): a box that rides with the camera,
// bright close to the lens and gone by 7.5 m. Here they drift with time instead of being stepped, so a frame can be asked for again.
const moteVert = /* glsl */`
  uniform float uTime, uSize, uScale, uBox, uNear, uFar;
  uniform vec3 uCam;
  attribute vec4 seed;
  varying float vFade;
  void main() {
    vec3 drift = vec3(0.06, 0.012, -0.035) * uTime + vec3(sin(uTime * 0.21 + seed.x * 6.28), sin(uTime * 0.17 + seed.y * 6.28), cos(uTime * 0.19 + seed.z * 6.28)) * 0.25;
    vec3 p = position + drift - uCam + 0.5 * uBox;
    p = mod(p, uBox) - 0.5 * uBox + uCam;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    float d = length(mv.xyz);
    vFade = (1.0 - smoothstep(uNear, uFar, d)) * smoothstep(0.15, 0.5, d) * (0.5 + 0.5 * seed.w);
    gl_PointSize = uSize * uScale * (0.7 + 0.6 * seed.x) / max(d, 0.4);
    gl_Position = projectionMatrix * mv;
  }`;
const moteFrag = /* glsl */`
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    vec4 t = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor, uOpacity * vFade * t.a);
    if (gl_FragColor.a < 0.004) discard;
  }`;

// ------------------------------------------------------------------ mount
export async function mount(host, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = options.className || 'bw-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const dprCap = Math.min(window.devicePixelRatio || 1, options.maxDpr || 1.75);
  let scale = 1; // the share of the full resolution actually drawn (pace lowers it on a slow machine)
  renderer.setPixelRatio(dprCap);

  const scene = new THREE.Scene();
  scene.background = ABOVE.bg.clone();
  const fog = new THREE.FogExp2(ABOVE.fog.clone(), ABOVE.density);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 300);
  scene.add(camera);

  // ---- the cave, built by the game's own code in a worker; the same code here answers "how far to the rock" for the lamp
  const layoutUrl = new URL('./cave/layout.json', import.meta.url);
  const [built] = await Promise.all([
    new Promise((resolve, reject) => {
      const w = new Worker(new URL('./cave/worker.js', import.meta.url), { type: 'module' });
      w.onmessage = (e) => { w.terminate(); e.data.error ? reject(new Error(e.data.error)) : resolve(e.data); };
      w.onerror = (e) => { w.terminate(); reject(new Error(e.message || 'the cave could not be built')); };
      w.postMessage({ box: BOX, chem: [CHEMLIGHT[0], 0, CHEMLIGHT[2]] });
    }),
    fetch(layoutUrl).then((r) => r.json()).then((layout) => initSdf(layout)),
  ]);
  const caveGeo = new THREE.BufferGeometry();
  caveGeo.setAttribute('position', new THREE.BufferAttribute(built.positions, 3));
  caveGeo.setAttribute('color', new THREE.BufferAttribute(built.colors, 3));
  caveGeo.computeVertexNormals();
  const caveMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02, flatShading: true });
  const cave = new THREE.Mesh(caveGeo, caveMat);
  cave.frustumCulled = false;
  scene.add(cave);
  const floorAt = (x, z, from = 3) => { let y = from; while (sdf(x, y, z) < 0 && y > -40) y -= 0.05; return y; };
  // from a point in the open, march along a direction to the rock
  const toRock = (p, d, max = 12) => {
    let acc = 0;
    for (let i = 0; i < 40 && acc < max; i++) {
      const s = -sdf(p.x + d.x * acc, p.y + d.y * acc, p.z + d.z * acc);
      if (s < 0.05) return acc;
      acc += Math.max(0.12, s * 0.9);
    }
    return max;
  };

  // ---- lights: the game's ambient, its sun over the cenote, its head lamp; the camp's lamp on the shore
  const ambient = new THREE.AmbientLight(0x3a4a50, ABOVE.ambient);
  scene.add(ambient);
  const sun = new THREE.PointLight(0xfff2d6, SUN, 85, 2);
  sun.position.set(0, 18, 0);
  scene.add(sun);
  const headlamp = new THREE.SpotLight(LAMP.color, LAMP.intensity, LAMP.distance, LAMP.half, LAMP.penumbra, LAMP.decay);
  scene.add(headlamp, headlamp.target);

  const dot = softDot();
  const disposables = [caveGeo, caveMat, dot];

  const camp = buildCamp((x, z) => floorAt(x, z));
  scene.add(camp.group);
  disposables.push(...camp.geos, ...camp.mats);
  const campLight = new THREE.PointLight(0xffc27a, 6, 9, 2);
  campLight.position.copy(camp.lampPos);
  scene.add(campLight);
  const campGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffd08a, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
  campGlow.position.copy(camp.lampPos); campGlow.scale.setScalar(0.7);
  scene.add(campGlow);
  disposables.push(campGlow.material);

  // ---- the open water's surface (src/main.ts: the same colour, the same see-through, lit)
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2a5a66, transparent: true, opacity: 0.55, side: THREE.DoubleSide, roughness: 0.25, metalness: 0.1 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(16, 48), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y;
  scene.add(water);
  disposables.push(water.geometry, waterMat);

  // ---- god rays under the cenote mouth (atmosphere.ts buildGodRays: six additive planes, slanted like sun through water)
  const rays = new THREE.Group();
  {
    const tex = rayTexture();
    disposables.push(tex);
    for (let i = 0; i < 6; i++) {
      const w = 2.5 + (i % 3) * 1.6;
      const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.035 + (i % 2) * 0.02, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, 24), m);
      const ang = (i / 6) * Math.PI * 2 + 0.4, r = 10 * (0.15 + 0.55 * ((i * 0.37) % 1));
      plane.position.set(Math.cos(ang) * r, -9, Math.sin(ang) * r);
      plane.rotation.y = ang + Math.PI / 2 + (i - 3) * 0.12;
      plane.rotation.z = 0.1 + (i % 3) * 0.05;
      rays.add(plane);
      disposables.push(plane.geometry, m);
    }
    scene.add(rays);
  }

  // ---- motes
  const moteU = {
    uTime: { value: 0 }, uSize: { value: MOTES.size }, uScale: { value: 240 }, uMap: { value: dot }, uColor: { value: ZONE.sinkhole.mote.clone() },
    uOpacity: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: MOTES.box }, uNear: { value: MOTES.fadeNear }, uFar: { value: MOTES.fadeFar },
  };
  {
    const r = rng(11), n = 3600, p = new Float32Array(n * 3), s = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      p[i * 3] = r() * MOTES.box; p[i * 3 + 1] = r() * MOTES.box; p[i * 3 + 2] = r() * MOTES.box;
      s[i * 4] = r(); s[i * 4 + 1] = r(); s[i * 4 + 2] = r(); s[i * 4 + 3] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('seed', new THREE.BufferAttribute(s, 4));
    const m = new THREE.ShaderMaterial({ uniforms: moteU, vertexShader: moteVert, fragmentShader: moteFrag, transparent: true, depthWrite: false });
    const motes = new THREE.Points(g, m); motes.frustumCulled = false;
    scene.add(motes);
    disposables.push(g, m);
  }

  // ---- the guide line: white nylon as a real cord, tied off at yellow pins, laid low along the passage wall
  const pins = [];
  {
    const v = new THREE.Vector3(), d = new THREE.Vector3();
    const pts = LINE.map((c, i) => {
      v.set(c[0], c[1], c[2]);
      const next = LINE[Math.min(LINE.length - 1, i + 1)], prev = LINE[Math.max(0, i - 1)];
      const along = new THREE.Vector3(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]).normalize();
      // low and to the right of the way down: the side of the passage the lamp sweeps past
      const side = new THREE.Vector3().crossVectors(along, new THREE.Vector3(0, 1, 0));
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize();
      d.copy(side).multiplyScalar(1.0).add(new THREE.Vector3(0, -0.42, 0)).normalize();
      const reach = toRock(v, d, 6);
      return v.clone().addScaledVector(d, Math.max(0, Math.min(reach - 0.35, reach * 0.72, 1.6)));
    });
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    // a little slack between the tie-offs
    const sag = (u) => { const k = u * (pts.length - 1), f = k - Math.floor(k); return Math.sin(Math.PI * f) * 0.12; };
    const samples = [];
    const N = 420;
    for (let i = 0; i <= N; i++) { const u = i / N; const p = curve.getPoint(u); p.y -= sag(u); samples.push(p); }
    const rope = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(samples), 1200, 0.024, 6, false);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xf4f4ec, roughness: 0.7, emissive: 0x3a3c38 });
    scene.add(new THREE.Mesh(rope, ropeMat));
    disposables.push(rope, ropeMat);
    const pinGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07), pinMat = new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0x6a5420, roughness: 0.5 });
    for (const p of pts) { const m = new THREE.Mesh(pinGeo, pinMat); m.position.copy(p); m.rotation.set(0.6, 0.8, 0.2); scene.add(m); pins.push(m); }
    disposables.push(pinGeo, pinMat);
  }

  // ---- the dropped chemlight (src/player/chemlightRender.ts: cold green glow and a real light on the rock around it)
  const chemPos = new THREE.Vector3(CHEMLIGHT[0], built.chemY + 0.06, CHEMLIGHT[2]);
  const chemStick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 8), new THREE.MeshBasicMaterial({ color: 0xbaffcf }));
  chemStick.position.copy(chemPos); chemStick.rotation.set(0.2, 0.7, Math.PI / 2 - 0.15);
  const chemGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0x2fe86a, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  chemGlow.position.copy(chemPos); chemGlow.scale.setScalar(0.8);
  const chemLight = new THREE.PointLight(0x2fe86a, 1.4, 6, 2);
  chemLight.position.copy(chemPos).y += 0.3;
  scene.add(chemStick, chemGlow, chemLight);
  disposables.push(chemStick.geometry, chemStick.material, chemGlow.material);

  // ---- one of the drowned, swimming up the west passage towards the reader
  const fig = buildDrowned();
  scene.add(fig.group);
  disposables.push(...fig.geos, ...fig.mats);
  const holdCam = camAt(1);
  const figFace = Math.atan2(holdCam[0] - FIGURE[0], holdCam[2] - FIGURE[2]); // the yaw that brings him towards the reader

  // ------------------------------------------------------------------ one frame
  const v = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3(), upv = new THREE.Vector3();
  const aimDir = new THREE.Vector3(), probe = new THREE.Vector3(), beamDir = new THREE.Vector3(), zfog = new THREE.Color();
  let active = true, w = 1, h = 1, tall = false, viewShifted = false;

  function resize() {
    w = Math.max(1, host.clientWidth); h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(dprCap * scale);
    renderer.setSize(w, h);
    const aspect = w / h;
    tall = aspect < 0.8;
    camera.aspect = aspect;
    // the game's 75 degrees on a wide screen; a tall screen opens up so the lamp's oval still sits inside the frame
    camera.fov = aspect >= 1 ? 75 : lerp(100, 75, clamp((aspect - 0.45) / 0.55));
    camera.updateProjectionMatrix();
    moteU.uScale.value = renderer.getPixelRatio() * (h / 900) * 240 * (Math.tan(THREE.MathUtils.degToRad(37.5)) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }

  function frame(q, time = 0, pointer, shift = 0) {
    if (!active) return;
    q = clamp(q);
    // shift (pixels): where the visible part of the screen is centred, when only part of it shows; the picture follows
    if (Math.abs(shift) > 0.5) { camera.setViewOffset(w, h, 0, -shift, w, h); viewShifted = true; }
    else if (viewShifted) { camera.clearViewOffset(); viewShifted = false; }
    const px = pointer ? clamp(pointer.x, -1, 1) : 0, py = pointer ? clamp(pointer.y, -1, 1) : 0;

    // the camera on its route, breathing
    const p = camAt(q), l = lookAt(q);
    const under = ss(WATER_Y + 0.12, WATER_Y - 0.25, p[1]); // 0 above the water, 1 below
    const breath = Math.sin(time * 1.37) * 0.05 * (0.4 + 0.6 * under);
    camera.position.set(p[0], p[1] + breath, p[2]);
    v.set(l[0], l[1], l[2]);
    camera.lookAt(v);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0); upv.setFromMatrixColumn(camera.matrixWorld, 1);
    // the reader turns the diver's head: a little parallax, and the look follows the pointer
    const dist = v.distanceTo(camera.position);
    const room = q > 0.38 && q < 0.74 ? 0.05 : 0.12;
    camera.position.addScaledVector(right, px * room).addScaledVector(upv, -py * room * 0.6);
    const swing = tall ? 0.55 : 1; // a narrow screen has less room to look about
    v.addScaledVector(right, px * dist * 0.3 * swing).addScaledVector(upv, -py * dist * 0.2 * swing);
    // on a tall screen the card covers the lower third: the picture's subject sits higher
    if (tall) v.addScaledVector(upv, -dist * 0.12 * ss(0.62, HOLD_AT, q));
    // and at the water's edge a tall screen looks down into the pool, not up at the wall
    if (tall) v.addScaledVector(upv, -dist * 0.32 * ss(0.08, 0.13, q) * (1 - ss(0.19, 0.25, q)));
    camera.lookAt(v);
    camera.rotateZ(Math.sin(time * 0.31) * 0.01 * under);
    camera.updateMatrixWorld();

    // the head lamp: at the eye, as in the game; it leads the look a few degrees towards the pointer
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    right.setFromMatrixColumn(camera.matrixWorld, 0); upv.setFromMatrixColumn(camera.matrixWorld, 1);
    aimDir.copy(fwd).applyAxisAngle(upv, -px * 0.12).applyAxisAngle(right, -py * 0.08);
    if (tall) aimDir.applyAxisAngle(right, 0.08 * ss(0.62, HOLD_AT, q));
    aimDir.normalize();
    headlamp.position.copy(camera.position);
    headlamp.target.position.copy(headlamp.position).addScaledVector(aimDir, 10);
    headlamp.target.updateMatrixWorld();
    // close-wall exposure (src/main.ts): the lamp is turned down as the nearest lit rock in its cone comes close,
    // so point-blank rock never blows out; full power beyond about 4.5 m
    let wallT = 8;
    for (let ray = 0; ray < 5; ray++) {
      beamDir.copy(aimDir);
      if (ray === 1) beamDir.addScaledVector(right, 0.6); else if (ray === 2) beamDir.addScaledVector(right, -0.6);
      else if (ray === 3) beamDir.addScaledVector(upv, 0.6); else if (ray === 4) beamDir.addScaledVector(upv, -0.6);
      beamDir.normalize();
      probe.copy(headlamp.position);
      wallT = Math.min(wallT, toRock(probe, beamDir, wallT));
    }
    headlamp.intensity = LAMP.intensity * clamp((wallT * wallT) / 20, 0.03, 1);

    // water, fog and light: the game's above-water daylight, then its zone grades under, darker with depth
    const deep = ss(0.5, 0.68, q); // sinkhole -> galleries
    const depth = Math.max(0, -camera.position.y);
    const dark = lerp(1, DEPTH_DARK.floor, clamp((depth - DEPTH_DARK.start) / (DEPTH_DARK.end - DEPTH_DARK.start)));
    // the far end of a passage is the sinkhole's teal (as in the game's tunnel shots), only leaning to the galleries' green
    zfog.copy(ZONE.sinkhole.fog).lerp(ZONE.galleries.fog, deep * 0.3);
    fog.color.copy(ABOVE.fog).lerp(zfog, under);
    // the open pool is sunlit, clear water: you see across its bowl; the murk closes in from the throat down
    const vis = lerp(SHALLOW_VIS, CLEAR_VIS, ss(-4, -11, camera.position.y));
    fog.density = lerp(ABOVE.density, FOG_K / vis, under);
    // the daylight is a cenote's: it fills the pool and is gone a few metres down the throat, where the lamp takes over
    sun.intensity = SUN * NIGHT.sun * (1 - ss(-1.6, -9.0, camera.position.y));
    scene.background.copy(ABOVE.bg).lerp(zfog, under);
    ambient.color.copy(ZONE.sinkhole.ambient).lerp(ZONE.galleries.ambient, deep);
    ambient.intensity = lerp(NIGHT.ambient, 0.55 * dark, under);
    rays.visible = under > 0 && q < 0.5;
    campLight.intensity = 6 * (1 - under);
    campGlow.visible = q < 0.3;
    moteU.uTime.value = time;
    moteU.uOpacity.value = MOTES.opacity * under;
    moteU.uColor.value.copy(ZONE.sinkhole.mote).lerp(ZONE.galleries.mote, deep);
    moteU.uCam.value.copy(camera.position);

    // the chemlight's slow pulse
    const pulse = 0.85 + 0.15 * Math.sin(time * 0.9);
    chemLight.intensity = 1.4 * pulse * ss(0.6, 0.72, q);
    chemGlow.material.opacity = 0.45 * pulse;

    // the drowned man: the game's swim, drifting slowly up the passage and back, never quite arriving
    const g = fig.group;
    const drift = Math.sin(time * 0.19) * 0.2;
    g.position.set(FIGURE[0] - drift * 0.9, FIGURE[1] + Math.sin(time * 0.41) * 0.08 - drift * 0.2, FIGURE[2] - drift * 0.25);
    g.rotation.set(0, figFace + 0.8 + Math.sin(time * 0.13) * 0.12, 0);
    poseSwim(fig, time, 0.5);
    g.visible = q > 0.55;

    renderer.render(scene, camera);
  }

  function setActive(on) { active = !!on; }
  // a slow machine draws fewer pixels: ms is how long the last frame took
  let slow = 0, quick = 0;
  function pace(ms) {
    if (ms > 40) { slow++; quick = 0; } else if (ms < 22) { quick++; slow = 0; } else { slow = quick = 0; }
    let next = scale;
    if (slow > 8) next = Math.max(0.5, scale - 0.1);
    if (quick > 90) next = Math.min(1, scale + 0.1);
    if (next !== scale) { scale = next; slow = quick = 0; resize(); }
  }
  function stats() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, caveTris: built.tris, buildMs: Math.round(built.ms), w: canvas.width, h: canvas.height }; }
  function dispose() {
    active = false;
    for (const d of disposables) d.dispose();
    renderer.dispose();
    canvas.remove();
  }

  resize();
  return { frame, resize, setActive, dispose, pace, stats, canvas };
}
