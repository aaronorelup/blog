/* The Storm Bell arena as a living backdrop: the game's four painted layers at the game's own depths, its mud floor,
   its props and its two fighters, drawn with the game's shaders. Everything on screen is a function of three things
   handed in from outside: q (how far the reader has scrolled through the chapter), t (the time) and the pointer.
   Nothing here keeps a clock of its own, so any frame can be asked for again and comes out the same. */
import * as THREE from 'three';
import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';
import * as G from './glsl.js';

const ROOT = new URL('../', import.meta.url);

// ---- the game's stage numbers (src/stage/storm_bell_stage.gd)
const PX_PER_RAD = 1883.18;
const REF_EYE = { x: 0, y: 1.5, z: 7 };
const HORIZON_ROW = 750;
const PIC = { w: 3840, h: 1080 };
const layerScale = (depth, k) => k * (REF_EYE.z + depth) / PX_PER_RAD;
function layerRect(depth, k) {
  const s = layerScale(depth, k);
  return new THREE.Vector4(REF_EYE.x - PIC.w * 0.5 * s, REF_EYE.y + HORIZON_ROW * s, PIC.w * s, PIC.h * s);
}
// quads: where the layer stands, in picture pixels (they may run past the picture: sky and city are mirrored).
// store: the part of the picture kept in memory.
const LAYERS = [
  { key: 'sky', file: 'img/layer-0-sky.webp', depth: 160, k: 0.59, mirror: 1, topFade: 1, flash: [0.08, 0.9], drift: 0.14, order: -40,
    parts: [{ quad: [-2120, -864, 8080, 1944], store: [0, 0, 3840, 1080] }] },
  { key: 'city', file: 'img/layer-1-city.webp', depth: 75, k: 0.59, mirror: 1, flash: [0.03, 0.3], order: -30,
    parts: [{ quad: [-2220, 358, 8280, 534], store: [0, 354, 3840, 542] }] },
  { key: 'dome', file: 'img/layer-2-dome.webp', depth: 45, k: 0.59, haze: 0.16, flash: [0.02, 0.16], order: -20,
    parts: [{ quad: [1345, 52, 1098, 786], store: [1345, 52, 1098, 786] }] },
  { key: 'fore', file: 'img/layer-3-fore.webp', depth: 5, k: 1.0, edgeFade: 0.012, flash: [0.02, 0.2], order: -10,
    parts: [{ quad: [0, 540, 672, 540], store: [0, 540, 672, 540] }, { quad: [3196, 540, 644, 540], store: [3196, 540, 644, 540] }] },
];
const HAZE = [0.52, 0.52, 0.54];
const ZENITH = [0.2, 0.2, 0.21];

// ---- the game's light rig (src/fx/light_rig.tscn, fight_environment.tres), colours linear times energy
const LIGHT_DIR = [new THREE.Vector3(-0.4467, 0.7444, 0.4963), new THREE.Vector3(0.6046, 0.2519, 0.7557), new THREE.Vector3(0.303, 0.5051, -0.8081)];
const LIGHT_COL = [new THREE.Vector3(0.7225, 0.78, 0.895), new THREE.Vector3(0.0557, 0.0693, 0.0949), new THREE.Vector3(1.6, 0.1008, 0.1525)];
const LIGHT_SPEC = new THREE.Vector3(0.6, 0.0, 0.3);
const AMBIENT = new THREE.Vector3(0.0865, 0.0865, 0.0931);
const FIRE_LIN = new THREE.Vector3(1.0, 0.063, 0.0953);       // #FF4757
const FIRE_ENERGY = 1.5;
const START_X = 2.2, FACING_YAW = 70 * Math.PI / 180;

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ loading
async function loadPicture(file, parts, maxTex, signal) {
  const res = await fetch(new URL(file, ROOT), { signal });
  if (!res.ok) throw new Error(file + ' ' + res.status);
  const blob = await res.blob();
  const out = [];
  for (const p of parts) {
    const [sx, sy, sw, sh] = p.store;
    let source, crop = [sx / PIC.w, sy / PIC.h, sw / PIC.w, sh / PIC.h], premult = false;
    try {
      const opts = { premultiplyAlpha: 'premultiply', colorSpaceConversion: 'none' };
      if (sw > maxTex) { opts.resizeWidth = maxTex; opts.resizeHeight = Math.round(sh * maxTex / sw); opts.resizeQuality = 'high'; }
      source = await createImageBitmap(blob, sx, sy, sw, sh, opts);
    } catch (e) {
      // an older browser: the whole picture through a canvas
      const img = await createImageBitmap(blob);
      const c = document.createElement('canvas');
      const k = Math.min(1, maxTex / sw);
      c.width = Math.round(sw * k); c.height = Math.round(sh * k);
      c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      source = c; premult = true;
    }
    const tex = new THREE.Texture(source);
    tex.flipY = false; tex.premultiplyAlpha = premult; tex.colorSpace = THREE.NoColorSpace;
    tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    out.push({ tex, crop: new THREE.Vector4(...crop) });
  }
  return out;
}
function loadTile(file, aniso) {
  return new Promise((ok, bad) => new THREE.TextureLoader().load(new URL(file, ROOT).href, (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = aniso;
    tex.minFilter = THREE.LinearMipmapLinearFilter; ok(tex);
  }, undefined, bad));
}
const loadModel = (file) => new Promise((ok, bad) => new GLTFLoader().load(new URL(file, ROOT).href, ok, undefined, bad));

// ------------------------------------------------------------------ materials, by the game's naming contract
function toonMaterial(src, kind, shared) {
  const name = (src.name || '').toLowerCase();
  const map = src.map || null;
  if (map) { map.colorSpace = THREE.NoColorSpace; map.needsUpdate = true; }
  const lin = src.color ? src.color : new THREE.Color(0.62, 0.62, 0.64);
  if (name.includes('_emit')) {
    const em = src.emissive && (0.2126 * src.emissive.r + 0.7152 * src.emissive.g + 0.0722 * src.emissive.b) > 0.01 ? src.emissive : lin;
    const flame = name.includes('flame');
    return new THREE.ShaderMaterial({
      name: src.name, vertexShader: G.EMIT_VERT, fragmentShader: G.EMIT_FRAG, side: flame ? THREE.DoubleSide : THREE.FrontSide,
      uniforms: {
        color: { value: new THREE.Vector3(em.r, em.g, em.b) }, time: shared.time, flame: { value: flame ? 1 : 0 },
        energy: { value: flame ? 1.55 : clamp(1.8 * Math.max(src.emissiveIntensity || 1, 1), 1, 6) },
        pulse: { value: flame ? 0.2 : 0.15 }, phase: { value: (name.length * 1.7) % 6.28 },
      },
    });
  }
  const metal = name.includes('_metal'), stage = kind === 'stage' || name.includes('_stage');
  // none of the red rim on red cloth or on hair, as the game decides it
  let rimK = 1;
  if (!metal) {
    const redness = (lin.r - Math.max(lin.g, lin.b)) / Math.max(lin.r, 1e-6);
    rimK = name.includes('hair') ? 0 : 1 - ss(0.6, 0.85, redness);
  }
  const u = {
    albedo: { value: new THREE.Vector3(lin.r, lin.g, lin.b) }, map: { value: map }, useMap: { value: map ? 1 : 0 },
    vertexAlbedo: { value: src.vertexColors ? 1 : 0 },
    bandMid: { value: metal ? 0.5 : 0.45 },
    rimColor: { value: metal ? new THREE.Vector3(0.788, 0.816, 0.855) : new THREE.Vector3(1.0, 0.278, 0.341) },
    rimStrength: { value: stage ? 0 : metal ? 0.5 : 0.55 * rimK },
    rimLightStrength: { value: stage ? 0 : 1.4 * rimK },
    backLightDiffuse: { value: stage ? 0 : 0.15 },
    specStrength: { value: metal ? 1.3 : 0 }, specShininess: { value: 60 }, specThreshold: { value: 0.45 },
    lightDir: { value: LIGHT_DIR }, lightColor: { value: stage ? shared.stageLights : LIGHT_COL }, lightSpec: { value: LIGHT_SPEC },
    ambient: { value: AMBIENT }, firePos: shared.firePos, fireCol: stage ? { value: new THREE.Vector3() } : shared.fireCol, flash: shared.flash,
  };
  const m = new THREE.ShaderMaterial({
    name: src.name, vertexShader: G.TOON_VERT, fragmentShader: G.TOON_FRAG, uniforms: u,
    vertexColors: !!src.vertexColors, side: src.side === THREE.DoubleSide ? THREE.DoubleSide : THREE.FrontSide,
  });
  m.userData.outline = !stage && !name.includes('_nooutline');
  return m;
}

// ------------------------------------------------------------------ a fighter: the model, its ink line, its moves
class Fighter {
  constructor(gltf, x, facing, shared) {
    this.root = gltf.scene;
    this.root.position.set(x, 0, 0);
    this.root.rotation.y = FACING_YAW * facing;
    this.facing = facing;
    this.mixer = new THREE.AnimationMixer(this.root);
    this.clips = {};
    for (const c of gltf.animations) {
      const a = this.mixer.clipAction(c);
      a.setLoop(THREE.LoopRepeat, Infinity); a.play(); a.setEffectiveWeight(0);
      this.clips[c.name] = { action: a, dur: c.duration };
    }
    const outlines = [];
    this.root.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      o.material = toonMaterial(o.material, 'fighter', shared);
      if (o.material.userData.outline && o.isSkinnedMesh) outlines.push(o);
    });
    for (const o of outlines) {
      const line = new THREE.SkinnedMesh(o.geometry, shared.outlineMat);
      line.bind(o.skeleton, o.bindMatrix);
      line.frustumCulled = false;
      o.parent.add(line);
    }
  }
  // the pose at time t: the idle loop, with a move laid over it while one is on
  pose(t, move) {
    const idle = this.clips.idle;
    let w = 0;
    for (const k in this.clips) this.clips[k].action.setEffectiveWeight(0);
    if (move && this.clips[move.name]) {
      const m = this.clips[move.name];
      const u = move.t;
      if (u >= 0 && u <= m.dur + 0.18) {
        w = Math.min(ss(0, 0.07, u), 1 - ss(m.dur - 0.02, m.dur + 0.18, u));
        m.action.time = clamp(u, 0, m.dur - 1e-3);
        m.action.setEffectiveWeight(w);
      }
    }
    idle.action.time = t % idle.dur;
    idle.action.setEffectiveWeight(1 - w);
    this.mixer.update(0);
  }
}

// ------------------------------------------------------------------ the camera: wide, then in, then it holds
function cameraAt(q, portrait) {
  const e = ss(0.0, 0.62, q);                   // the push
  const h = clamp((q - 0.62) / 0.38);           // the hold: a slow drift
  if (portrait) {
    return {
      fov: 46,
      pos: [lerp(-1.6, 0, e) + h * 0.3, lerp(5.2, 2.7, e) - h * 0.1, lerp(27, 9.6, e) - h * 0.4],
      look: [lerp(0.4, 0, e), lerp(2.6, 0.6, e), 0],
    };
  }
  return {
    fov: 32,
    pos: [lerp(-3.4, 0, e) + h * 0.5, lerp(2.7, 1.42, e) - h * 0.05, lerp(24, 9.6, e) - h * 0.55],
    look: [lerp(0.6, 0, e), lerp(2.1, 0.78, e), 0],
  };
}

export async function mount(canvas, opts = {}) {
  const signal = opts.signal;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: true, powerPreference: 'high-performance' });
  const gl = renderer.getContext();
  const maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096);
  renderer.setClearColor(new THREE.Color(0.09, 0.09, 0.106).convertSRGBToLinear(), 1);
  renderer.info.autoReset = false;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const maxDpr = coarse ? 1.5 : 1.75;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 400);
  scene.add(camera);

  const shared = {
    time: { value: 0 }, flash: { value: 0 },
    firePos: { value: new THREE.Vector4(-5.9, 1.31, -2.65, 6.5) }, fireCol: { value: new THREE.Vector3() },
    stageLights: [LIGHT_COL[0], LIGHT_COL[1], new THREE.Vector3()],       // the red rim light paints fighters only
    outlineMat: null,
  };
  shared.outlineMat = new THREE.ShaderMaterial({
    vertexShader: G.OUTLINE_VERT, fragmentShader: G.OUTLINE_FRAG, side: THREE.BackSide,
    uniforms: { widthPx: { value: 2.6 }, viewH: { value: 1080 }, maxWorld: { value: 0.035 }, ink: { value: new THREE.Vector3(0.067, 0.067, 0.075) } },
  });

  // ---- everything is fetched together
  const [pics, mud, wet, propsG, jefG, btG] = await Promise.all([
    Promise.all(LAYERS.map((L) => loadPicture(L.file, L.parts, maxTex, signal))),
    loadTile('img/floor-mud.webp', Math.min(8, renderer.capabilities.getMaxAnisotropy())),
    loadTile('img/floor-mud-wet.webp', 1),
    loadModel('models/props.glb'), loadModel('models/jefrie.glb'), loadModel('models/bloodtailor.glb'),
  ]);

  // ---- the painted layers
  const layerMats = [];
  const byKey = {};
  LAYERS.forEach((L, i) => {
    const s = layerScale(L.depth, L.k);
    byKey[L.key] = { L, rect: layerRect(L.depth, L.k), pic: pics[i][0] };
    L.parts.forEach((p, j) => {
      const [qx, qy, qw, qh] = p.quad;
      const mat = new THREE.ShaderMaterial({
        vertexShader: G.LAYER_VERT, fragmentShader: G.LAYER_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: {
          map: { value: pics[i][j].tex }, crop: { value: pics[i][j].crop }, layerRect: { value: layerRect(L.depth, L.k) },
          mirror: { value: L.mirror || 0 }, edgeFade: { value: L.edgeFade || 0 }, topFade: { value: L.topFade || 0 },
          flash: shared.flash, flashResponse: { value: new THREE.Vector2(...L.flash) }, drift: { value: L.drift || 0 },
          time: shared.time, gain: { value: 1 }, veil: { value: 0 }, zenith: { value: new THREE.Vector3(...ZENITH) },
          haze: { value: new THREE.Vector4(...HAZE, L.haze || 0) },
        },
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(qw * s, qh * s), mat);
      mesh.position.set(REF_EYE.x + (qx + qw * 0.5 - PIC.w * 0.5) * s, REF_EYE.y - (qy + qh * 0.5 - HORIZON_ROW) * s, -L.depth);
      mesh.renderOrder = L.order; mesh.frustumCulled = false;
      scene.add(mesh); layerMats.push(mat);
    });
  });

  // ---- the mud
  const fireLinA = FIRE_LIN;
  const floorMat = new THREE.ShaderMaterial({
    vertexShader: G.FLOOR_VERT, fragmentShader: G.FLOOR_FRAG,
    uniforms: {
      mudTex: { value: mud }, wetTex: { value: wet },
      skyTex: { value: byKey.sky.pic.tex }, cityTex: { value: byKey.city.pic.tex }, domeTex: { value: byKey.dome.pic.tex },
      skyRect: { value: byKey.sky.rect }, cityRect: { value: byKey.city.rect }, domeRect: { value: byKey.dome.rect },
      skyCrop: { value: byKey.sky.pic.crop }, cityCrop: { value: byKey.city.pic.crop }, domeCrop: { value: byKey.dome.pic.crop },
      layerZ: { value: new THREE.Vector3(-160, -75, -45) }, domeHaze: { value: new THREE.Vector4(...HAZE, 0.16) },
      flash: shared.flash, time: shared.time, detail: { value: 1 },
      skyFlash: { value: new THREE.Vector2(0.08, 0.9) }, cityFlash: { value: new THREE.Vector2(0.03, 0.3) }, domeFlash: { value: new THREE.Vector2(0.02, 0.16) },
      fireA: { value: new THREE.Vector4(-5.9, 0, -3, 2.7) }, fireB: { value: new THREE.Vector4(6.3, 0, -4.2, 2.2) },
      fireColor: { value: new THREE.Vector4(fireLinA.x, fireLinA.y, fireLinA.z, 0.3) }, fireFlicker: { value: new THREE.Vector2(1, 1) },
      fogColor: { value: new THREE.Vector3(0.0452, 0.0452, 0.0562) }, fogParams: { value: new THREE.Vector4(9, 48, 0.7, 1) },
      floorLight: { value: new THREE.Vector3(0.95, 0.98, 1.03) },
      blobA: { value: new THREE.Vector4(-START_X, 0, 0.95, 0.5) }, blobB: { value: new THREE.Vector4(START_X, 0, 0.95, 0.5) },
    },
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 110).rotateX(-Math.PI / 2), floorMat);
  floor.position.set(0, 0, 15);             // from z -40 (under the dome) to well behind the widest camera
  floor.frustumCulled = false;
  scene.add(floor);

  // ---- the props: sandbags, stakes, wire, two braziers
  const flames = [];
  propsG.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    o.material = toonMaterial(o.material, 'stage', shared);
    if (/^Flame_/.test(o.name)) flames.push({ node: o, base: o.scale.clone(), x: o.position.x });
  });
  flames.sort((a, b) => a.x - b.x);
  scene.add(propsG.scene);

  // ---- the fighters
  const jefrie = new Fighter(jefG, -START_X, 1, shared);
  const tailor = new Fighter(btG, START_X, -1, shared);
  scene.add(jefrie.root, tailor.root);

  // ---- the rain: a dense sheet just behind the fighters, a sparse one near the lens
  function rainSheet(o, order) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: G.RAIN_VERT, fragmentShader: G.RAIN_FRAG, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      uniforms: {
        phase: { value: 0 }, aspect: { value: 1.78 }, scroll: { value: new THREE.Vector2() }, wind: { value: 0.16 },
        density: { value: o.density }, speed: { value: o.speed }, columns: { value: o.columns }, streak: { value: o.streak },
        thicknessPx: { value: o.thick }, alpha: { value: o.alpha }, seed: { value: o.seed }, color: { value: new THREE.Vector3(0.8, 0.82, 0.86) },
      },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    m.renderOrder = order; m.frustumCulled = false; m.userData.alpha = o.alpha;
    camera.add(m);
    return m;
  }
  const rainFar = rainSheet({ columns: 95, alpha: 0.3 * 0.65, thick: 1.1, streak: 0.4, speed: 1, density: lerp(0.35, 0.9, 0.65), seed: 3 }, 10);
  const rainNear = rainSheet({ columns: 36, alpha: 0.17 * 0.65, thick: 1.9, streak: 0.55, speed: 1.35, density: 0.45, seed: 11 }, 20);
  rainNear.material.depthTest = false;

  // ---- grain and the dark frame, laid over the finished picture
  const gradeMat = new THREE.ShaderMaterial({
    vertexShader: G.GRADE_VERT, fragmentShader: G.GRADE_FRAG, depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.DstColorFactor, blendDst: THREE.SrcColorFactor,
    uniforms: { time: shared.time, grain: { value: 0.035 }, vignette: { value: 0.17 }, aspect: { value: 1.6 }, res: { value: new THREE.Vector2(1, 1) } },
  });
  const gradeScene = new THREE.Scene();
  const gradeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  gradeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gradeMat));

  // ---- size
  let W = 1, H = 1, portrait = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W && h === H) return false;
    W = w; H = h; portrait = W / H < 0.82;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const buf = renderer.getDrawingBufferSize(new THREE.Vector2());
    shared.outlineMat.uniforms.viewH.value = buf.y;
    gradeMat.uniforms.res.value.copy(buf); gradeMat.uniforms.aspect.value = W / H;
    return true;
  }

  const fwd = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(), look = new THREE.Vector3();
  const stats = { calls: 0, triangles: 0 };

  // One frame. q: 0..1 through the chapter. t: seconds. px, py: the pointer, -1..1 from the middle of the picture.
  function frame(q, t, px = 0, py = 0) {
    resize();
    shared.time.value = t;

    // camera
    const c = cameraAt(q, portrait);
    camera.fov = c.fov;
    camera.position.set(c.pos[0], c.pos[1], c.pos[2]);
    look.set(c.look[0], c.look[1], c.look[2]);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
    const reach = portrait ? 0.55 : 0.75;
    camera.position.addScaledVector(right, px * reach).addScaledVector(up, -py * reach * 0.45);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.getWorldDirection(fwd);

    // fires
    const flick = [1, 1];
    flames.forEach((f, i) => {
      const ph = i * 2.1;
      const fl = 0.82 + 0.18 * Math.sin(t * 13 + ph) * Math.sin(t * 7.3 + 1 + ph) + 0.06 * Math.sin(t * 23 + ph * 3);
      f.node.scale.set(f.base.x * (0.95 + 0.08 * fl), f.base.y * (0.78 + 0.34 * fl), f.base.z * (0.95 + 0.08 * (1 - fl)));
      if (i < 2) flick[i] = fl;
    });
    floorMat.uniforms.fireFlicker.value.set(flick[0], flick[1]);
    shared.fireCol.value.copy(FIRE_LIN).multiplyScalar(FIRE_ENERGY * flick[0]);

    // fighters: on a tall screen they stand closer, at striking distance
    const sx = portrait ? 1.2 : START_X;
    jefrie.root.position.x = -sx; tailor.root.position.x = sx;
    floorMat.uniforms.blobA.value.x = -sx; floorMat.uniforms.blobB.value.x = sx;
    jefrie.pose(t, null);
    tailor.pose(t + 0.37, null);

    // rain
    const tanV = Math.tan(camera.fov * Math.PI / 360);
    const place = (m, d) => {
      const h = 2 * d * tanV * 1.08, w = h * camera.aspect;
      m.position.set(0, 0, -d); m.scale.set(w, h, 1);
      const u = m.material.uniforms;
      u.aspect.value = w / h; u.phase.value = t; u.scroll.value.set(camera.position.x / h, -camera.position.y / h);
    };
    place(rainFar, Math.max((camera.position.z + 2.2) / Math.max(-fwd.z, 0.2), 1));
    place(rainNear, 2.5);

    renderer.info.reset();
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(gradeScene, gradeCam);
    stats.calls = renderer.info.render.calls; stats.triangles = renderer.info.render.triangles;
  }

  function dispose() {
    renderer.dispose();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  resize();
  return { frame, resize, dispose, stats, renderer, clips: { jefrie: Object.keys(jefrie.clips), tailor: Object.keys(tailor.clips) } };
}
