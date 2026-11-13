// The chalk swarm: dozens of little stick workers drawn in chalk on the glass, running out from one point along the
// spokes of a fan, coming back with a box overhead, sweeping and stacking, at twelve drawings a second. Drawn new for
// this page: a sheet of small chalk drawings, and one flat card per worker that always faces the reader.
import * as THREE from 'three';
import { PAL, FOG, canvasTex, rng } from './kit.js';

const CELL = 96, COLS = 16, ROWS = 2;

// a chalk line: many small soft dabs along the way, some missing, as chalk skips on glass
function chalk(g, R, pts, w) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const n = Math.max(2, Math.hypot(x1 - x0, y1 - y0) / 1.3);
    for (let k = 0; k <= n; k++) {
      if (R() < 0.07) continue;
      const t = k / n;
      g.globalAlpha = 0.45 + R() * 0.55;
      g.beginPath(); g.arc(x0 + (x1 - x0) * t + (R() - 0.5) * 1.1, y0 + (y1 - y0) * t + (R() - 0.5) * 1.1, w * (0.34 + R() * 0.26), 0, 6.283); g.fill();
    }
  }
  g.globalAlpha = 1;
}
const ring = (cx, cy, r, n = 14) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.283) * r, cy + Math.sin(i / n * 6.283) * r]);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

// One worker in a cell. A limb is two bones; an angle is measured from straight down, forward is positive.
function worker(g, R, ox, oy, o) {
  const hip = [ox + 48 + o.lean * 5, oy + 60 - (o.bob || 0)], sh = [hip[0] + o.lean * 9, hip[1] - 23], head = [sh[0] + o.lean * 3, sh[1] - 11];
  const limb = (from, a, bend, len, w) => {
    const k = [from[0] + Math.sin(a) * len, from[1] + Math.cos(a) * len], e = [k[0] + Math.sin(a + bend) * len, k[1] + Math.cos(a + bend) * len];
    chalk(g, R, [from, k, e], w); return e;
  };
  chalk(g, R, [hip, sh], 4.4);
  chalk(g, R, ring(head[0], head[1], 7.5), 3.4);
  const ha = limb(sh, o.arm[0], o.elbow[0], 10, 3.6), hb = limb(sh, o.arm[1], o.elbow[1], 10, 3.6);
  limb(hip, o.leg[0], o.knee[0], 13.5, 3.8); limb(hip, o.leg[1], o.knee[1], 13.5, 3.8);
  if (o.box) { const bx = (ha[0] + hb[0]) / 2, by = Math.min(ha[1], hb[1]) - 8; chalk(g, R, rect(bx - 10, by - 9, 20, 17), 3.2); }
  if (o.broom) { const tip = [ha[0] + 15, oy + 86]; chalk(g, R, [[ha[0] - 4, ha[1] - 12], tip], 3); chalk(g, R, [[tip[0] - 6, tip[1]], [tip[0] + 8, tip[1]]], 4.4); }
  if (o.pile) { chalk(g, R, rect(ox + 66, oy + 68, 20, 17), 3.2); chalk(g, R, rect(ox + 68, oy + 50, 20, 17), 3.2); }
}

function sheet(seed) {
  return canvasTex(CELL * COLS, CELL * ROWS, (g) => {
    g.fillStyle = '#fff';
    for (let row = 0; row < ROWS; row++) {
      const R = rng(seed + row * 977);
      for (let f = 0; f < 6; f++) {
        const a = f / 6 * 6.283, s = Math.sin(a), c = Math.cos(a);
        const legs = { leg: [0.95 * s, -0.95 * s], knee: [-(0.35 + 0.9 * Math.max(0, -c)), -(0.35 + 0.9 * Math.max(0, c))], bob: 3.2 * Math.abs(c) };
        worker(g, R, f * CELL, row * CELL, { lean: 0.6, arm: [-0.9 * s + 0.2, 0.9 * s + 0.2], elbow: [1.1, 1.1], ...legs });
        worker(g, R, (6 + f) * CELL, row * CELL, { lean: 0.22, arm: [2.75, 3.25], elbow: [0.25, -0.25], box: true, ...legs, bob: legs.bob * 0.6 });
      }
      for (let f = 0; f < 2; f++) {
        worker(g, R, (12 + f) * CELL, row * CELL, { lean: 0.35, arm: [0.5 + f * 0.45, 0.8 + f * 0.45], elbow: [0.5, 0.4], leg: [0.3, -0.3], knee: [-0.1, -0.1], broom: true });
        worker(g, R, (14 + f) * CELL, row * CELL, { lean: 0.3 + f * 0.25, arm: f ? [1.5, 1.75] : [2.7, 3.2], elbow: f ? [0.3, 0.3] : [0.3, -0.3], leg: [0.3, -0.25], knee: [-0.2, -0.1], box: true, pile: true });
      }
    }
  }, { aniso: 4 });
}

// centre: where the work is handed out. fwd and side: the fan opens along fwd and spreads along side.
export function makeSwarm({ centre, fwd, side, spread = 60, reach = 8, count = 49 }) {
  const R = rng(4117), SPOKES = 7;
  const ends = [];
  for (let k = 0; k < SPOKES; k++) {
    const a = (-spread + (2 * spread * k) / (SPOKES - 1)) * Math.PI / 180, L = reach * (0.82 + 0.18 * Math.cos(a * 1.4));
    ends.push([centre.x + (fwd.x * Math.cos(a) + side.x * Math.sin(a)) * L, centre.z + (fwd.z * Math.cos(a) + side.z * Math.sin(a)) * L]);
  }
  const A = new Float32Array(count * 4), B = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const k = i % SPOKES, e = ends[k];
    let kind = 0;
    if (i >= count - 12) kind = i % 2 ? 1 : 2;                // the last twelve stand and work: six sweep, six stack
    const j = () => (R() - 0.5) * 0.9;
    let ax = centre.x + j(), az = centre.z + j(), bx, bz, speed = 1 / (4.6 + R() * 3.6);
    if (kind === 0) { const far = 0.5 + R() * 0.5; bx = centre.x + (e[0] - centre.x) * far + j(); bz = centre.z + (e[1] - centre.z) * far + j(); }
    else if (kind === 1) { bx = e[0] + j() * 1.6; bz = e[1] + j() * 1.6; }
    else { bx = centre.x + (e[0] - centre.x) * 0.13 + j(); bz = centre.z + (e[1] - centre.z) * 0.13 + j(); }
    A.set([ax, az, R(), kind], i * 4); B.set([bx, bz, speed, i], i * 4);
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.setAttribute('aA', new THREE.InstancedBufferAttribute(A, 4));
  geo.setAttribute('aB', new THREE.InstancedBufferAttribute(B, 4));
  geo.instanceCount = count;
  const uniforms = { uTime: { value: 0 }, uShow: { value: count }, uRight: { value: new THREE.Vector3(1, 0, 0) }, uSize: { value: 0.78 }, uMap: { value: sheet(77) }, uFog: { value: FOG }, uCam: { value: new THREE.Vector3() }, uDim: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `
      attribute vec4 aA; attribute vec4 aB;
      uniform float uTime, uShow, uSize; uniform vec3 uRight, uCam;
      varying vec2 vUv; varying float vD; varying float vOn;
      void main(){
        float st = floor(uTime * 12.0), kind = aA.w, idx = aB.w;
        float u = fract(st / 12.0 * aB.z + aA.z);
        float back = step(0.5, u);
        float s = back < 0.5 ? u * 2.0 : 2.0 - u * 2.0;
        vec2 xz = kind < 0.5 ? mix(aA.xy, aB.xy, s) : aB.xy;
        vec2 d = aB.xy - aA.xy;
        float face = sign(dot(vec3(d.x, 0.0, d.y), uRight) + 0.0001);
        if (kind < 0.5 && back > 0.5) face = -face;
        float col = kind < 0.5 ? mod(st + idx * 5.0, 6.0) + back * 6.0 : (kind < 1.5 ? 12.0 + mod(floor(st / 3.0) + idx, 2.0) : 14.0 + mod(floor(st / 4.0) + idx, 2.0));
        float row = mod(floor(st / 2.0) + idx, 2.0);
        float ux = face > 0.0 ? uv.x : 1.0 - uv.x;
        vUv = vec2((col + ux) / ${COLS}.0, 1.0 - (row + 1.0 - uv.y) / ${ROWS}.0);
        vOn = step(idx + 0.5, uShow);
        vec3 wp = vec3(xz.x, 0.0, xz.y) + uRight * (position.x * uSize) + vec3(0.0, 1.0, 0.0) * (position.y * uSize * vOn);
        vec4 w = modelMatrix * vec4(wp, 1.0);
        vD = distance(w.xyz, uCam);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uMap; uniform float uFog, uDim; varying vec2 vUv; varying float vD; varying float vOn;
      void main(){
        float a = texture2D(uMap, vUv).a * vOn;
        if (a < 0.03) discard;
        float fog = 1.0 - exp(-pow(vD * uFog, 2.0));
        gl_FragColor = vec4(mix(vec3(0.96, 0.97, 1.0) * uDim, vec3(0.027, 0.031, 0.043), fog), a);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 4;
  // the chalk marks where the work is: the spokes, a cross at each end, a square where the work is handed out
  const span = reach * 2.6, PX = 1024;
  const toPx = (x, z) => {
    const dx = x - centre.x, dz = z - centre.z;
    return [(dx * side.x + dz * side.z) / span * PX + PX / 2, PX - ((dx * fwd.x + dz * fwd.z) / span * PX + PX * 0.12)];
  };
  const marks = canvasTex(PX, PX, (g) => {
    const Rm = rng(91); g.fillStyle = '#fff';
    const c = toPx(centre.x, centre.z);
    ends.forEach((e) => {
      const p = toPx(e[0], e[1]);
      g.globalAlpha = 1; chalk(g, Rm, [[c[0] + (p[0] - c[0]) * 0.1, c[1] + (p[1] - c[1]) * 0.1], [c[0] + (p[0] - c[0]) * 0.93, c[1] + (p[1] - c[1]) * 0.93]], 2.2);
      chalk(g, Rm, [[p[0] - 13, p[1] - 13], [p[0] + 13, p[1] + 13]], 4); chalk(g, Rm, [[p[0] + 13, p[1] - 13], [p[0] - 13, p[1] + 13]], 4);
    });
    chalk(g, Rm, rect(c[0] - 26, c[1] - 26, 52, 52), 4.5);
  }, { aniso: 8 });
  const mm = new THREE.MeshBasicMaterial({ map: marks, transparent: true, opacity: 0.5, depthWrite: false, fog: true });
  const dm = new THREE.Mesh(new THREE.PlaneGeometry(span, span), mm);
  // lay the drawing on the glass with its up along fwd and its right along side
  const mid = new THREE.Vector3(centre.x, 0.004, centre.z).addScaledVector(fwd, span * 0.38);
  dm.position.copy(mid);
  const basis = new THREE.Matrix4().makeBasis(side.clone(), fwd.clone(), new THREE.Vector3().crossVectors(side, fwd));
  dm.quaternion.setFromRotationMatrix(basis);
  dm.renderOrder = -4;
  return {
    mesh, marks: dm, ends, count,
    update(t, show, cam, right, dim = 1) {
      uniforms.uTime.value = t; uniforms.uShow.value = show; uniforms.uCam.value.copy(cam.position); uniforms.uRight.value.copy(right); uniforms.uDim.value = dim;
      mm.opacity = 0.5 * dim;
    },
  };
}
