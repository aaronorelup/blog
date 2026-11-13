/* Blackwater's cave as a living backdrop. The rock is the game's own: its map (layout.json) and its own code (cave/cave.js,
   ported from the game's public repository) build it here, flat-shaded in its zone colours, lit the way the game lights
   it: a diver's head lamp, a low ambient, exponential fog that eats the distance, motes in the water.

   mount(host, options) -> { frame(q, time, pointer), resize(), setActive(on), dispose(), pace(ms), stats() }
   Everything on screen is a function of q (0..1, how far through the chapter), time (seconds) and pointer ({x, y} in
   -1..1, where the lamp points). Nothing here keeps a clock of its own: any frame can be asked for again and comes out
   the same. Nothing listens to the window: the host page reads the scroll and the mouse and hands them in. */
import * as THREE from '../lib/three.module.min.js';
import { camAt, lookAt, HOLD_AT, WATER_Y, FIGURE, CHEMLIGHT, LINE } from './route.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---- the game's numbers (src/main.ts, src/effects/atmosphere.ts, src/tuning.ts)
const LAMP = { color: 0xcfe0d4, intensity: 55, distance: 65, decay: 2 };
// the game's beam is 84 degrees across; here it is narrowed to 50, so that where the reader points it is plain to see
const LAMP_HALF = THREE.MathUtils.degToRad(25);
const FOG = {
  night: new THREE.Color(0x0a1322), // above the water: the same evening as the tea house
  sinkhole: new THREE.Color(0x0d3640),
  galleries: new THREE.Color(0x08211e),
};
const MOTE = new THREE.Color(0xc8d8d2);
const BOX = { min: [-20, -34, -26], max: [20, 12, 14] }; // the part of the cave that is built: around the route

// ------------------------------------------------------------------ small textures, drawn by code
function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 2, 16, 16, 15);
  r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(0.5, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ one of the drowned crew (src/zombies/drowned.ts, its boxes and its colours)
function buildDrowned() {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, flatShading: true });
  const skin = mat(0x5f6d58), shirt = mat(0x1e2b38), pants = mat(0x1b2530), accent = mat(0x120e09), pale = mat(0x6e7263);
  const group = new THREE.Group(), body = new THREE.Group();
  group.add(body);
  const part = (m, sx, sy, sz, x, y, z, parent) => { const o = new THREE.Mesh(box, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); parent.add(o); return o; };
  const tw = 1.02;
  part(shirt, 0.52 * tw, 0.62, 0.3, 0, 0, 0, body);
  part(pants, 0.44 * tw, 0.34, 0.27, 0, -0.48, 0, body);
  part(accent, 0.5 * tw, 0.09, 0.33, 0, -0.33, 0, body);
  const neck = new THREE.Group(); neck.position.set(0, 0.36, 0.02); body.add(neck);
  const head = part(skin, 0.24, 0.28, 0.25, 0, 0.14, 0, neck);
  part(accent, 0.3, 0.1, 0.31, 0, 0.32, 0, neck); // the drill crew's hard hat
  // two pale eyes: the only thing that catches the lamp
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xd8e6c8 });
  part(eyeM, 0.045, 0.03, 0.02, -0.055, 0.16, 0.128, neck); part(eyeM, 0.045, 0.03, 0.02, 0.055, 0.16, 0.128, neck);
  const limb = (m, mEnd, x, y, len, th) => {
    const g = new THREE.Group(); g.position.set(x, y, 0);
    part(m, th, len * 0.72, th, 0, -len * 0.36, 0, g); part(mEnd, th * 0.85, len * 0.3, th * 0.85, 0, -len * 0.85, 0, g);
    body.add(g); return g;
  };
  const armL = limb(shirt, skin, -0.33 * tw, 0.26, 0.62, 0.13), armR = limb(shirt, skin, 0.33 * tw, 0.26, 0.62, 0.13);
  const legL = limb(pants, accent, -0.14, -0.66, 0.7, 0.15), legR = limb(pants, accent, 0.14, -0.66, 0.7, 0.15);
  part(pale, 0.14, 0.44, 0.14, -0.12, 0.02, -0.25, body); // a spare bottle on his back
  return { group, body, neck, head, armL, armR, legL, legR, geos: [box], mats: [skin, shirt, pants, accent, pale, eyeM] };
}

// ------------------------------------------------------------------ the guide line (src/player/lineRender.ts): white nylon, dots along it, yellow tie-off pins
function buildLine() {
  const pts = [];
  for (let i = 1; i < LINE.length; i++) {
    const a = LINE[i - 1], b = LINE[i];
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 0.25));
    for (let s = i === 1 ? 0 : 1; s <= n; s++) {
      const t = s / n, sag = Math.sin(Math.PI * t) * 0.18; // a little slack between tie-offs
      pts.push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag, a[2] + (b[2] - a[2]) * t);
    }
  }
  const seg = [];
  for (let i = 3; i < pts.length; i += 3) seg.push(pts[i - 3], pts[i - 2], pts[i - 1], pts[i], pts[i + 1], pts[i + 2]);
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(LINE.flat(), 3));
  return { lg, dg, pg };
}

// ------------------------------------------------------------------ motes in the water: brighter where the lamp is
const moteVert = /* glsl */`
  uniform float uTime, uSize, uScale;
  uniform vec3 uLampPos, uLampDir;
  uniform float uCos;
  attribute vec4 seed;
  varying float vA;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.11 * (0.6 + seed.x) + seed.y * 6.28) * 0.45;
    p.y += sin(uTime * 0.07 * (0.6 + seed.z) + seed.x * 6.28) * 0.35 + uTime * 0.03 * (seed.w - 0.3);
    p.z += cos(uTime * 0.09 * (0.6 + seed.y) + seed.z * 6.28) * 0.45;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = length(mv.xyz);
    vec3 toP = p - uLampPos;
    float dl = length(toP);
    float inBeam = smoothstep(uCos - 0.06, uCos + 0.04, dot(toP / max(dl, 1e-3), uLampDir)) * (1.0 - smoothstep(4.0, 22.0, dl));
    vA = (0.12 + 0.88 * inBeam) * smoothstep(0.25, 0.9, d) * (1.0 - smoothstep(9.0, 26.0, d)) * (0.45 + 0.55 * seed.w);
    gl_PointSize = uSize * uScale * (0.6 + seed.x) / max(d, 0.4);
    gl_Position = projectionMatrix * mv;
  }`;
const moteFrag = /* glsl */`
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vA;
  void main() {
    vec4 t = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor, t.a * vA * uOpacity);
    if (gl_FragColor.a < 0.004) discard;
  }`;

const dotVert = /* glsl */`
  uniform float uSize, uScale, uMax;
  varying float vA;
  #include <fog_pars_vertex>
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float d = length(mvPosition.xyz);
    vA = smoothstep(0.6, 2.2, d);
    gl_PointSize = min(uSize * uScale / max(d, 0.3), uMax);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
const dotFrag = /* glsl */`
  uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity;
  varying float vA;
  #include <fog_pars_fragment>
  void main() {
    gl_FragColor = vec4(uColor, texture2D(uMap, gl_PointCoord).a * uOpacity * vA);
    if (gl_FragColor.a < 0.004) discard;
    #include <fog_fragment>
  }`;

// ------------------------------------------------------------------ moonlight falling through the open water: a few soft shafts
const shaftFrag = /* glsl */`
  uniform vec3 uColor; uniform float uOpacity, uLen;
  varying float vAlong; varying vec3 vN; varying vec3 vV;
  void main() {
    float a = clamp(vAlong / uLen, 0.0, 1.0);
    float fall = smoothstep(0.0, 0.1, a) * (1.0 - smoothstep(0.2, 1.0, a));
    float rim = pow(abs(dot(vN, vV)), 2.2);
    gl_FragColor = vec4(uColor, fall * rim * uOpacity);
  }`;

// ------------------------------------------------------------------ the lamp's beam in the water: a faint cone, no glare
const beamVert = /* glsl */`
  varying float vAlong; varying vec3 vN; varying vec3 vV;
  void main() {
    vAlong = -position.y;           // the cone's apex is at the lamp, its axis runs down -y before it is turned
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const beamFrag = /* glsl */`
  uniform vec3 uColor; uniform float uOpacity, uLen;
  varying float vAlong; varying vec3 vN; varying vec3 vV;
  void main() {
    float a = clamp(vAlong / uLen, 0.0, 1.0);
    float fall = smoothstep(0.0, 0.08, a) * (1.0 - smoothstep(0.25, 1.0, a));
    float rim = pow(abs(dot(vN, vV)), 1.6);
    gl_FragColor = vec4(uColor, fall * rim * uOpacity);
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
  scene.background = FOG.night.clone();
  const fog = new THREE.FogExp2(FOG.night.clone(), 0.012);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 160);
  scene.add(camera);

  // ---- the cave, built by the game's own code in a worker
  const built = await new Promise((resolve, reject) => {
    const w = new Worker(new URL('./cave/worker.js', import.meta.url), { type: 'module' });
    w.onmessage = (e) => { w.terminate(); e.data.error ? reject(new Error(e.data.error)) : resolve(e.data); };
    w.onerror = (e) => { w.terminate(); reject(new Error(e.message || 'the cave could not be built')); };
    w.postMessage({ box: BOX, chem: [CHEMLIGHT[0], 0, CHEMLIGHT[2]] });
  });
  const caveGeo = new THREE.BufferGeometry();
  caveGeo.setAttribute('position', new THREE.BufferAttribute(built.positions, 3));
  caveGeo.setAttribute('color', new THREE.BufferAttribute(built.colors, 3));
  caveGeo.computeVertexNormals();
  const caveMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02, flatShading: true });
  const cave = new THREE.Mesh(caveGeo, caveMat);
  cave.frustumCulled = false;
  scene.add(cave);

  // ---- lights: the game's ambient and its head lamp; the open shaft's sky is the night's, with the camp's lantern on the rim
  const ambient = new THREE.AmbientLight(0x3a4a50, 0.5);
  scene.add(ambient);
  const moon = new THREE.PointLight(0x8fa6cc, 260, 85, 2);
  moon.position.set(-2, 20, 2);
  scene.add(moon);
  const lantern = new THREE.PointLight(0xffc27a, 44, 28, 2);
  lantern.position.set(9.6, -0.62, 1.4); // standing on the camp platform's floor, by the water
  scene.add(lantern);
  const headlamp = new THREE.SpotLight(LAMP.color, LAMP.intensity, LAMP.distance, LAMP_HALF, 0.85, LAMP.decay);
  scene.add(headlamp, headlamp.target);

  const dot = softDot();
  const disposables = [caveGeo, caveMat, dot];

  // the lantern itself, a warm point on the rim
  const lanternGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffd08a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  lanternGlow.position.copy(lantern.position); lanternGlow.scale.setScalar(1.0);
  scene.add(lanternGlow);
  const lanternBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
  lanternBody.position.copy(lantern.position);
  scene.add(lanternBody);
  disposables.push(lanternBody.geometry, lanternBody.material);
  disposables.push(lanternGlow.material);

  // ---- the open water's surface (src/main.ts: the same colour and the same see-through)
  // unlit here, so the lamp does not make a glaring disc on it as the diver goes through
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x2a5a66, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  const water = new THREE.Mesh(new THREE.CircleGeometry(15, 48), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.y = WATER_Y;
  scene.add(water);
  disposables.push(water.geometry, waterMat);

  // ---- stars over the shaft
  let starsMat = null;
  {
    const r = rng(7), n = 420, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = r() * 6.283, el = 0.08 + Math.pow(r(), 0.7) * 1.4; p[i * 3] = Math.cos(a) * Math.cos(el) * 120; p[i * 3 + 1] = 8 + Math.sin(el) * 120; p[i * 3 + 2] = Math.sin(a) * Math.cos(el) * 120; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ map: dot, color: 0xe6ecff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, fog: false });
    starsMat = m;
    scene.add(new THREE.Points(g, m));
    disposables.push(g, m);
  }

  // ---- motes
  const moteU = {
    uTime: { value: 0 }, uSize: { value: 0.11 }, uScale: { value: 240 }, uMap: { value: dot }, uColor: { value: MOTE.clone() },
    uOpacity: { value: 0.0 }, uLampPos: { value: new THREE.Vector3() }, uLampDir: { value: new THREE.Vector3(0, 0, -1) }, uCos: { value: Math.cos(LAMP_HALF) },
  };
  {
    const r = rng(11), n = 2600, p = new Float32Array(n * 3), s = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      p[i * 3] = lerp(-12, 12, r()); p[i * 3 + 1] = lerp(-30, WATER_Y - 0.4, r()); p[i * 3 + 2] = lerp(-21, 6, r());
      s[i * 4] = r(); s[i * 4 + 1] = r(); s[i * 4 + 2] = r(); s[i * 4 + 3] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('seed', new THREE.BufferAttribute(s, 4));
    const m = new THREE.ShaderMaterial({ uniforms: moteU, vertexShader: moteVert, fragmentShader: moteFrag, transparent: true, depthWrite: false });
    const motes = new THREE.Points(g, m); motes.frustumCulled = false;
    scene.add(motes);
    disposables.push(g, m);
  }

  // ---- the beam
  const beamU = { uColor: { value: new THREE.Color(0xcfe0d4) }, uOpacity: { value: 0 }, uLen: { value: 16 } };
  const beamGeo = new THREE.ConeGeometry(Math.tan(LAMP_HALF * 0.9) * 16, 16, 40, 1, true);
  beamGeo.translate(0, -8, 0); // apex at the origin, opening down -y
  const beamMat = new THREE.ShaderMaterial({ uniforms: beamU, vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const beam = new THREE.Mesh(beamGeo, beamMat); beam.frustumCulled = false;
  scene.add(beam);
  disposables.push(beamGeo, beamMat);

  // ---- moonlight shafts in the open pool
  const shaftU = { uColor: { value: new THREE.Color(0x9fb8dc) }, uOpacity: { value: 0 }, uLen: { value: 15 } };
  const shaftMat = new THREE.ShaderMaterial({ uniforms: shaftU, vertexShader: beamVert, fragmentShader: shaftFrag, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  {
    const r = rng(23);
    for (let i = 0; i < 6; i++) {
      const g = new THREE.CylinderGeometry(0.5 + r() * 0.5, 1.4 + r() * 1.2, 15, 24, 1, true);
      g.translate(0, -7.5, 0);
      const m = new THREE.Mesh(g, shaftMat);
      const a = i * 1.05 + r(), d = 2 + r() * 5.5;
      m.position.set(Math.cos(a) * d, WATER_Y, Math.sin(a) * d - 1);
      m.rotation.set((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25 + 0.12);
      m.frustumCulled = false;
      scene.add(m);
      disposables.push(g);
    }
    disposables.push(shaftMat);
  }

  // ---- the guide line
  const L = buildLine();
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf4f4ec, transparent: true, opacity: 0.9 });
  // the dots and pins keep a modest size close to the lens, and fade there, so the line never swells into blobs
  const dotU = (color, size, opacity) => ({ uMap: { value: dot }, uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uScale: moteU.uScale, uOpacity: { value: opacity }, uMax: { value: 9 } });
  const dotsMat = new THREE.ShaderMaterial({ uniforms: dotU(0xf4f4ec, 0.07, 0.85), vertexShader: dotVert, fragmentShader: dotFrag, transparent: true, depthWrite: false, fog: true });
  const pinsMat = new THREE.ShaderMaterial({ uniforms: dotU(0xffe9a8, 0.2, 0.95), vertexShader: dotVert, fragmentShader: dotFrag, transparent: true, depthWrite: false, fog: true });
  pinsMat.uniforms.uMax.value = 16;
  for (const m of [dotsMat, pinsMat]) Object.assign(m.uniforms, THREE.UniformsUtils.clone(THREE.UniformsLib.fog));
  scene.add(new THREE.LineSegments(L.lg, lineMat), new THREE.Points(L.dg, dotsMat), new THREE.Points(L.pg, pinsMat));
  disposables.push(L.lg, L.dg, L.pg, lineMat, dotsMat, pinsMat);

  // ---- the dropped chemlight (src/player/chemlightRender.ts: cold green glow and a real light on the rock around it)
  const chemPos = new THREE.Vector3(CHEMLIGHT[0], built.chemY + 0.12, CHEMLIGHT[2]);
  const chemStick = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 8), new THREE.MeshBasicMaterial({ color: 0xbaffcf }));
  chemStick.position.copy(chemPos); chemStick.rotation.set(0.2, 0.7, Math.PI / 2 - 0.15);
  const chemGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0x2fe86a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  chemGlow.position.copy(chemPos); chemGlow.scale.setScalar(0.9);
  const chemLight = new THREE.PointLight(0x2fe86a, 1.1, 4.5, 2);
  chemLight.position.copy(chemPos).y += 0.25;
  scene.add(chemStick, chemGlow, chemLight);
  disposables.push(chemStick.geometry, chemStick.material, chemGlow.material);

  // ---- the far shape: one of the drowned, standing in the mouth of the west passage
  const fig = buildDrowned();
  fig.group.position.set(FIGURE[0], FIGURE[1], FIGURE[2]);
  scene.add(fig.group);
  disposables.push(...fig.geos, ...fig.mats);
  const figFace = Math.atan2(camAt(1)[0] - FIGURE[0], camAt(1)[2] - FIGURE[2]); // the yaw that faces the reader at the hold

  // ------------------------------------------------------------------ one frame
  const v = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3(), upv = new THREE.Vector3(), aimDir = new THREE.Vector3();
  const toFig = new THREE.Vector3();
  let active = true, w = 1, h = 1;

  function resize() {
    w = Math.max(1, host.clientWidth); h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(dprCap * scale);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // a tall screen keeps about the same width of cave in view as a wide one would show in its middle
    camera.fov = aspect >= 1 ? 62 : lerp(84, 62, clamp((aspect - 0.45) / 0.55));
    camera.updateProjectionMatrix();
    moteU.uScale.value = h * renderer.getPixelRatio() * 0.5 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.28;
  }

  function frame(q, time = 0, pointer) {
    if (!active) return;
    q = clamp(q);
    const px = pointer ? clamp(pointer.x, -1, 1) : 0, py = pointer ? clamp(pointer.y, -1, 1) : 0;
    const tall = w / h < 0.8;

    // the camera on its route, breathing
    const p = camAt(q), l = lookAt(q);
    const under = ss(0.15, 0.24, q); // 0 above the water, 1 below
    const breath = Math.sin(time * 1.37) * 0.07 * (0.4 + 0.6 * under);
    camera.position.set(p[0], p[1] + breath, p[2]);
    // the pointer leans the head a little (parallax), and less in the tight shaft
    const room = q > 0.42 && q < 0.74 ? 0.06 : 0.15;
    v.set(l[0], l[1] + (tall ? -1.3 * ss(0.6, HOLD_AT, q) : 0), l[2]);
    camera.lookAt(v);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0); upv.setFromMatrixColumn(camera.matrixWorld, 1);
    camera.position.addScaledVector(right, px * room).addScaledVector(upv, -py * room * 0.6);
    camera.lookAt(v.addScaledVector(right, px * 0.9).addScaledVector(upv, -py * 0.5));
    camera.rotateZ(Math.sin(time * 0.31) * 0.012 * under);
    camera.updateMatrixWorld();

    // the head lamp: on the diver's brow, aimed where the pointer is
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    right.setFromMatrixColumn(camera.matrixWorld, 0); upv.setFromMatrixColumn(camera.matrixWorld, 1);
    const yaw = px * 0.62, pitch = -py * 0.42;
    aimDir.copy(fwd).applyAxisAngle(upv, -yaw).applyAxisAngle(right, pitch).normalize();
    headlamp.position.copy(camera.position).addScaledVector(upv, 0.12).addScaledVector(right, 0.08);
    headlamp.target.position.copy(headlamp.position).addScaledVector(aimDir, 10);
    headlamp.target.updateMatrixWorld();
    // the lamp comes on as the diver goes under; above the water it is still the night's
    headlamp.intensity = LAMP.intensity;
    beam.position.copy(headlamp.position).addScaledVector(aimDir, 0.35);
    beam.quaternion.setFromUnitVectors(v.set(0, -1, 0), aimDir);
    beamU.uOpacity.value = 0.09 * under;
    shaftU.uOpacity.value = 0.16 * under * (1 - ss(0.38, 0.52, q));

    // water, fog and light change with the depth
    const deep = ss(0.42, 0.72, q);
    fog.color.copy(FOG.night).lerp(FOG.sinkhole, under).lerp(FOG.galleries, deep);
    fog.density = lerp(0.012, 0.035, under);
    scene.background.copy(fog.color);
    ambient.intensity = lerp(0.3, 0.3, under) + 0.16 * ss(0.62, HOLD_AT, q);
    moon.intensity = lerp(150, 260, under) * (1 - deep);
    lantern.intensity = 44 * (1 - ss(0.3, 0.45, q));
    lanternGlow.visible = lanternBody.visible = q < 0.45;
    starsMat.opacity = 0.8 * (1 - under);
    // from above, night water: dark, the lamp's pool and the rock below just showing through; from below, the lit roof of the world
    if (camera.position.y > WATER_Y) { waterMat.color.setHex(0x0a1c24); waterMat.opacity = 0.4; } else { waterMat.color.setHex(0x3d7584); waterMat.opacity = 0.42; }
    moteU.uTime.value = time;
    moteU.uOpacity.value = 0.75 * under;
    moteU.uLampPos.value.copy(headlamp.position);
    moteU.uLampDir.value.copy(aimDir);

    // the chemlight's slow pulse
    const pulse = 0.85 + 0.15 * Math.sin(time * 0.9);
    chemLight.intensity = 1.1 * pulse * ss(0.45, 0.6, q);
    chemGlow.material.opacity = 0.42 * pulse;

    // the drowned man: a slow drift, his head turning in the dark; caught in the lamp, he looks at the reader
    toFig.set(FIGURE[0], FIGURE[1] + 0.4, FIGURE[2]).sub(headlamp.position);
    const dist = toFig.length();
    const lit = ss(Math.cos(LAMP_HALF * 1.25), Math.cos(LAMP_HALF * 0.55), toFig.normalize().dot(aimDir)) * ss(0.62, 0.76, q);
    const g = fig.group;
    g.position.set(FIGURE[0] + Math.sin(time * 0.23) * 0.12, FIGURE[1] + Math.sin(time * 0.41) * 0.1, FIGURE[2]);
    g.rotation.set(0, figFace + 0.9 + Math.sin(time * 0.13) * 0.25, 0);
    fig.body.rotation.set(0.12 + Math.sin(time * 0.37) * 0.04, 0, Math.sin(time * 0.29) * 0.05);
    const idle = Math.sin(time * 0.21) * 0.9 + Math.sin(time * 0.53) * 0.25; // looking about, unhurried
    fig.neck.rotation.set(lerp(Math.sin(time * 0.33) * 0.12, -0.08, lit), lerp(idle, -0.9 - Math.sin(time * 0.13) * 0.25, lit), 0);
    const reach = lit * 0.5;
    fig.armL.rotation.set(-0.35 - reach + Math.sin(time * 0.6) * 0.12, 0, -0.12);
    fig.armR.rotation.set(-0.25 - reach * 0.8 + Math.sin(time * 0.6 + 1.7) * 0.12, 0, 0.12);
    fig.legL.rotation.set(Math.sin(time * 0.5) * 0.18, 0, 0);
    fig.legR.rotation.set(Math.sin(time * 0.5 + Math.PI) * 0.18, 0, 0);
    g.visible = q > 0.5 && dist < 40;

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
