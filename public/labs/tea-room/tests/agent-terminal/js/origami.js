// The paper helpers. Each is a handful of flat facets drawn new for this page: a boat, a fan, a fox, a star and a
// crane, in that order of how much folding they take. A figure starts as a flat cut-out lying on the glass and folds
// up fold by fold; fold 0 is the flat sheet, fold 1 the finished animal.
import * as THREE from 'three';
import { PAL, clamp, canvasTex } from './kit.js';

const R = Math.PI / 180;
function fan() {
  const V = [[0, 0.04, 0]], F = [], st = [0];
  for (let i = 0; i < 6; i++) { const a = (22 + i * 27.2) * R; V.push([Math.cos(a), 0.04 + Math.sin(a), i % 2 ? 0.08 : -0.08]); st.push(i); }
  for (let i = 1; i < 6; i++) F.push([0, i, i + 1]);
  return { V, F, st, flat: (p) => [p[0], 0, -p[1]] };
}
function star() {
  const cy = 0.78, V = [[0, cy, 0.2], [0, cy, -0.2]], F = [], st = [0, 0];
  for (let i = 0; i < 5; i++) { const a = (90 + 72 * i) * R; V.push([Math.cos(a) * 0.95, cy + Math.sin(a) * 0.95, 0]); st.push(1 + i * 2); }
  for (let i = 0; i < 5; i++) { const a = (126 + 72 * i) * R; V.push([Math.cos(a) * 0.4, cy + Math.sin(a) * 0.4, 0]); st.push(2 + i * 2); }
  for (let i = 0; i < 5; i++) {
    const o = 2 + i, n = 7 + i, o2 = 2 + ((i + 1) % 5);
    F.push([0, o, n], [0, n, o2], [1, n, o], [1, o2, n]);
  }
  return { V, F, st, flat: (p) => [p[0], 0, -(p[1] - cy) * 1.05 + (p[2] > 0 ? 0.001 : 0)] };
}
const FIGS = {
  boat: {
    V: [[1, 0.42, 0], [-1, 0.42, 0], [0.45, 0, 0], [-0.45, 0, 0], [0, 0.36, 0.26], [0, 0.36, -0.26], [0, 1.02, 0], [0.4, 0.38, 0], [-0.4, 0.38, 0]],
    F: [[0, 2, 4], [2, 3, 4], [3, 1, 4], [0, 5, 2], [2, 5, 3], [3, 5, 1], [7, 6, 8]],
    st: [1, 1, 0, 0, 0, 0, 2, 2, 2],
    flat: (p) => [p[0], 0, -p[1] + p[2] * 0.8],
  },
  fan: fan(),
  fox: {
    V: [[0.36, 0, 0], [-0.46, 0, 0.28], [-0.46, 0, -0.28], [-0.05, 0.78, 0], [0.8, 0.6, 0], [0.2, 1.2, 0.2], [0.2, 1.2, -0.2], [0.32, 0.86, 0],
      [0.28, 0.6, 0.22], [0.28, 0.6, -0.22], [-1.06, 0.52, 0], [-0.4, 0.3, 0], [0.36, 0.44, 0]],
    F: [[0, 3, 1], [0, 2, 3], [1, 3, 2], [3, 8, 7], [3, 7, 9], [3, 12, 8], [3, 9, 12], [7, 8, 4], [7, 4, 9], [8, 12, 4], [9, 4, 12], [7, 5, 8], [7, 9, 6], [11, 10, 1], [11, 2, 10]],
    st: [0, 0, 0, 1, 4, 6, 6, 3, 3, 3, 7, 7, 2],
    flat: (p) => [p[0], 0, -p[1] + p[2] * 0.9],
  },
  star: star(),
  crane: {
    V: [[0, 0, 0], [0, 0.32, 0], [0.36, 0.18, 0], [-0.36, 0.18, 0], [0, 0.18, 0.15], [0, 0.18, -0.15], [-0.12, 0.86, 1.2], [-0.12, 0.86, -1.2],
      [0.98, 0.9, 0], [0.6, 0.38, 0.05], [0.6, 0.38, -0.05], [1.3, 0.66, 0], [-1.08, 1.02, 0], [-0.62, 0.4, 0.05], [-0.62, 0.4, -0.05]],
    F: [[0, 2, 4], [0, 4, 3], [0, 5, 2], [0, 3, 5], [2, 1, 4], [4, 1, 3], [2, 5, 1], [5, 3, 1], [2, 6, 1], [1, 6, 3], [2, 1, 7], [1, 3, 7],
      [2, 8, 9], [2, 10, 8], [8, 11, 9], [8, 10, 11], [3, 13, 12], [3, 12, 14]],
    st: [0, 2, 1, 1, 0, 0, 5, 6, 9, 8, 8, 11, 14, 13, 13],
    flat: (p) => [p[0] + Math.sign(p[0]) * p[1] * 0.35, 0, p[2]],
    wings: [6, 7],
  },
};
export const FOLDS = { boat: 3, fan: 6, fox: 8, star: 11, crane: 15 };

// the paper's own print: faint lines of the brief it was cut from
let printTex = null;
function paperPrint() {
  if (!printTex) {
    printTex = canvasTex(64, 64, (g) => {
      g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64);
      g.fillStyle = 'rgba(0,0,0,0.16)';
      for (let y = 6; y < 64; y += 9) g.fillRect(5, y, 22 + ((y * 7) % 30), 1.6);
    });
    printTex.wrapS = printTex.wrapT = THREE.RepeatWrapping;
  }
  return printTex;
}

export function makeFigure(kind, { paper = PAL.paper, line = PAL.amber, lineOpacity = 0.9, glowAmt = 0.22, print = true } = {}) {
  const fig = FIGS[kind], nV = fig.V.length, nF = fig.F.length;
  const flatV = fig.V.map(fig.flat);
  const stages = Math.max(...fig.st) + 1;
  const pos = new Float32Array(nF * 9), uv = new Float32Array(nF * 6);
  fig.F.forEach((f, i) => f.forEach((v, k) => { uv[i * 6 + k * 2] = flatV[v][0] * 0.9; uv[i * 6 + k * 2 + 1] = flatV[v][2] * 0.9; }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const col = new THREE.Color(paper);
  const mat = new THREE.MeshLambertMaterial({ color: paper, emissive: col.clone().multiplyScalar(glowAmt), side: THREE.DoubleSide, map: print ? paperPrint() : null });
  const mesh = new THREE.Mesh(geo, mat);
  // every edge once: the creases and the outline, which catch the light
  const seen = new Set(), edges = [];
  fig.F.forEach((f) => [[f[0], f[1]], [f[1], f[2]], [f[2], f[0]]].forEach(([a, b]) => { const k = a < b ? a + '_' + b : b + '_' + a; if (!seen.has(k)) { seen.add(k); edges.push([a, b]); } }));
  const lpos = new Float32Array(edges.length * 6);
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
  const lmat = new THREE.LineBasicMaterial({ color: line, transparent: true, opacity: lineOpacity });
  const lines = new THREE.LineSegments(lgeo, lmat);
  const group = new THREE.Group(); group.add(mesh, lines);
  const cur = fig.V.map(() => [0, 0, 0]);
  let last = '';
  function set(fold, flap = 0) {
    // a fold moves in steps, as paper folded by hand does
    const f = Math.round(clamp(fold) * stages * 3) / (stages * 3);
    const fl = Math.round(flap * 40) / 40;
    const key = f + '|' + fl; if (key === last) return; last = key;
    const u = f * (stages + 0.6);
    for (let i = 0; i < nV; i++) {
      let e = clamp(u - fig.st[i]); e = e * e * (3 - 2 * e);
      const a = flatV[i]; let bx = fig.V[i][0], by = fig.V[i][1], bz = fig.V[i][2];
      if (fig.wings && fig.wings.includes(i)) { const s = Math.sin(fl), c = Math.cos(fl); const z0 = Math.abs(bz), y0 = by - 0.32; const y1 = y0 * c + z0 * s * 0.55, z1 = z0 * c - y0 * s * 0.4; by = 0.32 + y1; bz = Math.sign(bz) * z1; }
      cur[i][0] = a[0] + (bx - a[0]) * e; cur[i][1] = 0.012 + (by - 0.012) * e; cur[i][2] = a[2] + (bz - a[2]) * e;
    }
    for (let i = 0; i < nF; i++) for (let k = 0; k < 3; k++) { const v = cur[fig.F[i][k]]; pos[i * 9 + k * 3] = v[0]; pos[i * 9 + k * 3 + 1] = v[1]; pos[i * 9 + k * 3 + 2] = v[2]; }
    for (let i = 0; i < edges.length; i++) { const a = cur[edges[i][0]], b = cur[edges[i][1]]; lpos.set(a, i * 6); lpos.set(b, i * 6 + 3); }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    lgeo.attributes.position.needsUpdate = true; lgeo.computeBoundingSphere();
  }
  set(1, 0);
  return { group, set, kind, tris: nF, mat, lmat, folds: FOLDS[kind] };
}

// The mark a helper is started from: a ring that burns itself into the glass clockwise, with tick marks round it.
let ringGlow = null;
export function makeRing(radius = 1) {
  const group = new THREE.Group();
  const SEG = 72;
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.93, radius, SEG, 1), new THREE.MeshBasicMaterial({ color: PAL.amber, side: THREE.DoubleSide, transparent: true }));
  ring.rotation.x = Math.PI / 2; ring.rotation.z = -Math.PI / 2; ring.position.y = 0.006;
  // ticks: 24 short strokes outside the ring, built in the order the ring draws
  const TICKS = 24, tp = [];
  for (let i = 0; i < TICKS; i++) {
    const a = (i / TICKS) * Math.PI * 2, w = 0.012 * radius * 2.2;
    const c = Math.cos(a), s = Math.sin(a), r0 = radius * 1.07, r1 = radius * (i % 6 === 0 ? 1.22 : 1.14);
    const px = -s * w, pz = c * w;
    const q = [[c * r0 - px, s * r0 - pz], [c * r0 + px, s * r0 + pz], [c * r1 + px, s * r1 + pz], [c * r1 - px, s * r1 - pz]];
    [0, 1, 2, 0, 2, 3].forEach((k) => tp.push(q[k][0], 0.006, q[k][1]));
  }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
  const ticks = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: PAL.amber, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
  ticks.rotation.y = Math.PI / 2;
  if (!ringGlow) {
    ringGlow = canvasTex(256, 256, (g) => {
      const r = g.createRadialGradient(128, 128, 40, 128, 128, 128);
      r.addColorStop(0, 'rgba(255,200,112,0)'); r.addColorStop(0.5, 'rgba(255,200,112,0.0)'); r.addColorStop(0.7, 'rgba(255,200,112,0.55)');
      r.addColorStop(0.78, 'rgba(255,190,100,0.3)'); r.addColorStop(1, 'rgba(255,160,80,0)');
      g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    });
  }
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.74, radius * 2.74), new THREE.MeshBasicMaterial({ map: ringGlow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = 0.005; halo.renderOrder = 2;
  ring.renderOrder = 3; ticks.renderOrder = 3;
  group.add(halo, ring, ticks);
  function set(draw, bright = 1) {
    const d = clamp(draw);
    ring.geometry.setDrawRange(0, Math.round(SEG * d) * 6);
    tg.setDrawRange(0, Math.round(TICKS * d) * 6);
    ring.material.opacity = bright; ticks.material.opacity = 0.8 * bright;
    halo.material.opacity = d * bright * 0.9;
    group.visible = d > 0.001;
  }
  set(1);
  return { group, set };
}
