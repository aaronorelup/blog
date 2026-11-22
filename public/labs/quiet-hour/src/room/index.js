// The room (Three.js): GREY STUB (harness-builder).
//
// The room builder replaces the furniture and the materials; the interface stays:
//
//   const room = createRoom({ renderer, programmeCanvas, width, height, quality });
//   room.update(S, shot)   // S = engine.signals(frame), shot = shots.js shotAt(frame)
//   room.scene, room.camera
//
// Everything that moves reads S (or the shot): the screen shows the programme canvas, the screen spot
// light takes its colour from the canvas average, its shadow softness from the bet's entropy, the
// neighbour's window from the error, the motes from the running sum of entropy, the tea from the pluck
// velocity, the wall clock from the programme clock. No state is carried between frames.

import * as THREE from 'three';
import { ROOM } from '../shots.js';
import { NOTE_FRAMES } from '../time.js';
import { hash01 } from '../rng.js';

const LN32 = Math.log(32);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);

export function createRoom({ renderer, programmeCanvas, width, height, quality = 'final' }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 40);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;                    // PCF honours shadow.radius

  const grey = (v) => new THREE.MeshLambertMaterial({ color: new THREE.Color(v, v, v) });
  const tinted = (hex) => new THREE.MeshLambertMaterial({ color: hex });
  const box = (w, h, d, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m;
  };

  // ---- the shell: floor, ceiling, walls (the back wall has the doorway and the window cut out) ---
  const { w: RW, d: RD, h: RH } = ROOM.size, zB = ROOM.backWallZ, zF = zB + RD;
  const wallMat = tinted(0x56606e), floorMat = tinted(0x4a4038);
  const plane = (w, h, mat, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos); m.rotation.set(...rot); m.receiveShadow = true; scene.add(m); return m;
  };
  plane(RW, RD, floorMat, [0, 0, (zB + zF) / 2], [-Math.PI / 2, 0, 0]);
  plane(RW, RD, grey(0.25), [0, RH, (zB + zF) / 2], [Math.PI / 2, 0, 0]);
  plane(RD, RH, wallMat, [-RW / 2, RH / 2, (zB + zF) / 2], [0, Math.PI / 2, 0]);
  plane(RD, RH, wallMat, [RW / 2, RH / 2, (zB + zF) / 2], [0, -Math.PI / 2, 0]);
  plane(RW, RH, wallMat, [0, RH / 2, zF], [0, Math.PI, 0]);
  {
    const s = new THREE.Shape(); s.moveTo(-RW / 2, 0); s.lineTo(RW / 2, 0); s.lineTo(RW / 2, RH); s.lineTo(-RW / 2, RH); s.closePath();
    const D = ROOM.doorway, Wn = ROOM.window;
    const door = new THREE.Path(); door.moveTo(D.x - D.w / 2, 0.001); door.lineTo(D.x - D.w / 2, D.h); door.lineTo(D.x + D.w / 2, D.h); door.lineTo(D.x + D.w / 2, 0.001); door.closePath();
    const win = new THREE.Path(); win.moveTo(Wn.x - Wn.w / 2, Wn.y - Wn.h / 2); win.lineTo(Wn.x - Wn.w / 2, Wn.y + Wn.h / 2); win.lineTo(Wn.x + Wn.w / 2, Wn.y + Wn.h / 2); win.lineTo(Wn.x + Wn.w / 2, Wn.y - Wn.h / 2); win.closePath();
    s.holes.push(door, win);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), wallMat); m.position.z = zB; m.receiveShadow = true; scene.add(m);
    box(RW, 0.1, 0.02, grey(0.7), 0, 0.05, zB + 0.011, false);                            // skirting board
    // the dark hall beyond the doorway (nothing is ever there)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(D.w + 0.4, D.h + 0.3, 3), new THREE.MeshLambertMaterial({ color: 0x15171b, side: THREE.BackSide }));
    hall.position.set(D.x, (D.h + 0.3) / 2, zB - 1.5); scene.add(hall);
    // outside: the night street, and the neighbour's window across it
    plane(30, 14, new THREE.MeshBasicMaterial({ color: 0x07090d }), [0, 4, -15], [0, 0, 0]);
    // curtains either side of the window
    box(0.32, Wn.h + 0.35, 0.06, tinted(0x6a5e55), Wn.x - Wn.w / 2 + 0.1, Wn.y, zB + 0.06);
    box(0.32, Wn.h + 0.35, 0.06, tinted(0x6a5e55), Wn.x + Wn.w / 2 - 0.1, Wn.y, zB + 0.06);
  }
  const N = ROOM.neighbour;
  const neighbourMat = new THREE.MeshBasicMaterial({ color: 0xffc870 });
  const neighbour = plane(N.w, N.h, neighbourMat, [N.x, N.y, N.z], [0, 0, 0]);
  neighbour.receiveShadow = false;

  // ---- furniture ----------------------------------------------------------------------------
  plane(2.4, 1.7, tinted(0x5a4a44), [0, 0.004, -0.5], [-Math.PI / 2, 0, 0]);             // rug
  const C = ROOM.cabinet; box(C.w, C.h, C.d, tinted(0x4b3a2c), C.x, C.h / 2, C.z);
  const T = ROOM.tv; box(T.w, T.h, T.d, tinted(0x3d3128), T.x, T.y + T.h / 2, T.z);
  const Wc = ROOM.wallClock;
  const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(Wc.r, Wc.r, 0.03, 40), grey(0.75));
  clockFace.rotation.x = Math.PI / 2; clockFace.position.set(Wc.x, Wc.y, Wc.z + 0.015); scene.add(clockFace);
  const hand = (len, w) => {
    const g = new THREE.BoxGeometry(w, len, 0.006); g.translate(0, len / 2, 0);
    const m = new THREE.Mesh(g, grey(0.08)); m.position.set(Wc.x, Wc.y, Wc.z + 0.035); scene.add(m); return m;
  };
  const hourHand = hand(Wc.r * 0.55, 0.018), minuteHand = hand(Wc.r * 0.85, 0.012);
  // the empty wing chair, back to camera, with a folded blanket
  const ch = ROOM.chair, chairMat = tinted(0x50473f);
  box(0.8, 0.42, 0.75, chairMat, ch.x, 0.21, ch.z);
  box(0.8, 0.75, 0.16, chairMat, ch.x, 0.42 + 0.37, ch.z + 0.3);
  box(0.14, 0.25, 0.7, chairMat, ch.x - 0.4, 0.55, ch.z);
  box(0.14, 0.25, 0.7, chairMat, ch.x + 0.4, 0.55, ch.z);
  box(0.12, 0.35, 0.3, chairMat, ch.x - 0.38, 1.0, ch.z + 0.22);
  box(0.12, 0.35, 0.3, chairMat, ch.x + 0.38, 1.0, ch.z + 0.22);
  box(0.5, 0.06, 0.32, tinted(0x8a7f6c), ch.x + 0.05, 0.45, ch.z - 0.05);                  // blanket
  const tb = ROOM.table;
  const table = new THREE.Mesh(new THREE.CylinderGeometry(tb.r, tb.r, 0.03, 24), tinted(0x4b3a2c));
  table.position.set(tb.x, tb.h, tb.z); table.castShadow = table.receiveShadow = true; scene.add(table);
  box(0.04, tb.h, 0.04, tinted(0x4b3a2c), tb.x, tb.h / 2, tb.z);
  const cu = ROOM.cup;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(cu.r, cu.r * 0.8, cu.h, 20), grey(0.8));
  cup.position.set(cu.x, cu.y + cu.h / 2 + 0.015, cu.z); cup.castShadow = cup.receiveShadow = true; scene.add(cup);
  const tea = new THREE.Mesh(new THREE.CircleGeometry(cu.r * 0.92, 24), tinted(0x3a2616));
  tea.rotation.x = -Math.PI / 2; tea.position.set(cu.x, cu.y + cu.h + 0.005, cu.z); scene.add(tea);
  const rippleMat = new THREE.MeshBasicMaterial({ color: 0xd8c8a8, transparent: true, opacity: 0 });
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32), rippleMat);
  ripple.rotation.x = -Math.PI / 2; ripple.position.set(cu.x, cu.y + cu.h + 0.007, cu.z); scene.add(ripple);
  const spoon = box(0.008, 0.11, 0.008, grey(0.85), cu.x + 0.02, cu.y + cu.h + 0.03, cu.z, true);
  spoon.rotation.z = -0.35;

  // ---- the screen: the programme canvas on the tube, with a little CRT --------------------------
  const S0 = ROOM.screen;
  const progTex = new THREE.CanvasTexture(programmeCanvas);
  progTex.colorSpace = THREE.SRGBColorSpace; progTex.minFilter = THREE.LinearFilter; progTex.generateMipmaps = false;
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: progTex }, uLines: { value: 240 }, uScan: { value: 0 }, uWarp: { value: 0.08 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D map; uniform float uLines, uScan, uWarp; varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5; vec2 uv = vUv + c * uWarp * dot(c, c) * 4.0;        // barrel warp
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec3 col = texture2D(map, uv).rgb;
        float s = 0.5 + 0.5 * cos(uv.y * uLines * 6.2831853);                  // scanlines, faded by the shot
        col *= mix(1.0, 0.72 + 0.28 * s, uScan);
        vec2 e = uv - 0.5; col *= 1.0 - 0.55 * dot(e, e) * 2.2;                 // vignette
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(S0.w, S0.h), screenMat);
  screen.position.set(S0.x, S0.y, S0.z); scene.add(screen);

  // ---- lights: the screen spot (the only shadow caster) and a static night fill --------------
  scene.add(new THREE.HemisphereLight(0x8090b0, 0x202028, 0.22));
  const spot = new THREE.SpotLight(0xffffff, 0, 12, Math.PI / 2.4, 0.6, 1.2);
  spot.position.set(S0.x, S0.y, S0.z + 0.03);
  spot.target.position.set(S0.x, S0.y - 0.15, S0.z + 3); scene.add(spot); scene.add(spot.target);
  spot.castShadow = true;
  const sm = quality === 'draft' ? 512 : 1024;
  spot.shadow.mapSize.set(sm, sm); spot.shadow.camera.near = 0.1; spot.shadow.camera.far = 9; spot.shadow.bias = -0.0008;

  // canvas average for the spot light (40x30 downsample, then a plain mean)
  const avgCanvas = document.createElement('canvas'); avgCanvas.width = 40; avgCanvas.height = 30;
  const actx = avgCanvas.getContext('2d', { willReadFrequently: true });

  // ---- dust: ~1,500 motes in the beam; drift = velocity x running sum of H/ln32 ---------------
  const MOTES = quality === 'draft' ? 600 : 1500;
  const base = new Float32Array(MOTES * 3), vel = new Float32Array(MOTES * 3);
  const BOXMIN = [-0.9, 0.35, -2.3], BOXSIZE = [1.8, 1.3, 2.9];          // the beam's volume
  for (let i = 0; i < MOTES; i++) for (let k = 0; k < 3; k++) {
    base[i * 3 + k] = BOXMIN[k] + hash01(7001, i, k, 0) * BOXSIZE[k];
    vel[i * 3 + k] = (hash01(7002, i, k, 0) * 2 - 1) * (k === 1 ? 0.02 : 0.035);   // metres per unit of drift
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(base, 3));
  dustGeo.setAttribute('vel', new THREE.BufferAttribute(vel, 3));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uDrift: { value: 0 }, uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(1, 1, 1) },
      uMin: { value: new THREE.Vector3(...BOXMIN) }, uSize: { value: new THREE.Vector3(...BOXSIZE) }, uScale: { value: height } },
    vertexShader: `
      attribute vec3 vel; uniform float uDrift, uScale; uniform vec3 uMin, uSize;
      void main(){
        vec3 p = uMin + mod(position - uMin + vel * uDrift, uSize);           // closed form: no stepping
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = max(1.0, 0.004 * uScale / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity; uniform vec3 uColor;
      void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.1, length(d)); gl_FragColor = vec4(uColor * a * uOpacity * 0.35, 1.0); }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat); dust.frustumCulled = false; scene.add(dust);

  // ---- per frame ------------------------------------------------------------------------------
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function update(S, shot) {
    const cam = shot.camera;
    camera.fov = cam.fov; camera.aspect = width / height;
    camera.position.set(...cam.pos); camera.lookAt(...cam.target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();

    // the screen: new picture; scanlines fade out where a line would be under 2.5 output pixels
    progTex.needsUpdate = true;
    tmpA.set(S0.x, S0.y + S0.h / 2, S0.z).project(camera); tmpB.set(S0.x, S0.y - S0.h / 2, S0.z).project(camera);
    const screenPx = Math.abs(tmpA.y - tmpB.y) / 2 * height, linePx = screenPx / screenMat.uniforms.uLines.value;
    screenMat.uniforms.uScan.value = clamp((linePx - 2.5) / 1.0, 0, 1);

    // screen light: colour and intensity from the canvas average
    actx.drawImage(programmeCanvas, 0, 0, 40, 30);
    const px = actx.getImageData(0, 0, 40, 30).data;
    let r = 0, g = 0, b = 0; for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
    const n = px.length / 4 * 255; r /= n; g /= n; b /= n;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b, m = Math.max(r, g, b, 1e-4);
    spot.color.setRGB(r / m, g / m, b / m, THREE.SRGBColorSpace);
    spot.intensity = 14 * lum;
    // shadow softness from the entropy: radius 1 + 5 H/ln32
    const h = isNum(S.entropy) ? clamp(S.entropy / LN32, 0, 1) : 1;
    spot.shadow.radius = 1 + 5 * h;

    // neighbour's window: lit while err <= ln 32
    neighbourMat.color.set(S.windowLit ? 0xffc870 : 0x0b0c10);

    // dust
    dustMat.uniforms.uDrift.value = S.dustDrift || 0;
    dustMat.uniforms.uOpacity.value = 0.25 + 0.75 * h;
    dustMat.uniforms.uColor.value.copy(spot.color);

    // tea: a ripple per pluck sized by velocity squared, expanding across the note
    const v = isNum(S.pluckVel) ? S.pluckVel : 0, ph = S.phase ?? (S.frame % NOTE_FRAMES) / NOTE_FRAMES;
    const rr = cu.r * 0.9 * (0.2 + 0.8 * ph);
    ripple.scale.set(rr, rr, 1); rippleMat.opacity = clamp(v * v * (1 - ph) * 1.2, 0, 1);
    // spoon chatter when the mean velocity of the last 6 notes is 0.95 or more
    const chatter = S.spoonChatter ?? false;
    spoon.rotation.z = -0.35 + (chatter ? (hash01(7101, S.frame, 0, 0) * 2 - 1) * 0.06 : 0);

    // wall clock: 23:30 plus the programme clock
    const [mm, ss] = S.clock.split(':').map(Number);
    const minutes = 30 + mm + ss / 60;
    minuteHand.rotation.z = -(minutes / 60) * Math.PI * 2;
    hourHand.rotation.z = -((11 + minutes / 60) / 12) * Math.PI * 2;
  }

  return {
    scene, camera, update,
    dispose() { scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); }); progTex.dispose(); },
  };
}
