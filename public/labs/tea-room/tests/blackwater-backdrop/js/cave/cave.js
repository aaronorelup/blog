/* Blackwater's own cave, ported to plain JavaScript from the game's public repository (github.com/aaronorelup/blackwater):
   - src/util/noise.ts   n3, fbm                                  (as it is)
   - src/cave/data.ts    the layout loader and SKY_SHAFT            (the part that reads layout.json; no editor drafts)
   - src/cave/sdf.ts     initSdf, sdf, regionAt                     (as it is, without the doors and the collision helpers)
   - src/cave/mesh.ts    buildCaveMesh: surface nets over the field, per-zone rock colours, flat faces
                         (as it is, with one change: it meshes only a box around the route, not the whole cave)
   - src/tuning.ts       the geometry numbers it reads
   layout.json beside this file is the game's own map, unchanged. No three.js in here: it returns plain arrays. */

// ---------------------------------------------------------------- src/tuning.ts (geometry)
const G = {
  cellSize: 0.5, radiusOpen: 2.4, radiusNormal: 1.6, radiusSqueeze: 0.75,
  noiseFreq: 0.35, noiseAmpFactor: 0.15, noiseAmpMax: 0.9,
};

// ---------------------------------------------------------------- src/util/noise.ts
export function n3(x, y, z) {
  return (Math.sin(x * 1.7 + Math.sin(y * 2.1)) + Math.sin(y * 1.3 + Math.sin(z * 1.9)) + Math.sin(z * 1.5 + Math.sin(x * 2.3))) / 3;
}
export function fbm(x, y, z, octaves = 3) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) { sum += n3(x * freq, y * freq, z * freq) * amp; norm += amp; amp *= 0.5; freq *= 2.1; }
  return sum / norm;
}

// ---------------------------------------------------------------- src/cave/data.ts (the loader)
export const SKY_SHAFT = { a: [0, 1, 0], b: [0, 26, 0], r: 10 };
let NODES = [], EDGES = [], nodeMap = new Map();
function getNode(id) { const n = nodeMap.get(id); if (!n) throw new Error('unknown cave node: ' + id); return n; }
function loadLayout(layout) {
  NODES = layout.nodes; EDGES = layout.edges;
  const norm = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  for (const n of NODES) if (n.falseUp) n.falseUp = norm(n.falseUp);
  nodeMap = new Map(NODES.map((n) => [n.id, n]));
}
export { getNode };

// ---------------------------------------------------------------- src/cave/sdf.ts
const BIG = 8, HASH_CELL = 4;
let prims = [], hash = new Map();
export let bounds = { min: [0, 0, 0], max: [0, 0, 0] };
const widthRadius = (w) => (w === 'open' ? G.radiusOpen : w === 'squeeze' ? G.radiusSqueeze : G.radiusNormal);
const noiseAmpFor = (r) => Math.min(Math.max(r * G.noiseAmpFactor, 0.12), G.noiseAmpMax);
const hashKey = (ix, iy, iz) => (ix + 128) + (iy + 128) * 512 + (iz + 128) * 262144;
function segPrim(base, solid = false) {
  return { ...base, rb: base.rb ?? base.r, rx: base.r, ry: base.r, rz: base.r, ellipsoid: false, solid, broad: 0 };
}
function smax(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * 0.25; }

export function initSdf(layout) {
  loadLayout(layout);
  prims = [];
  const pathSamples = [];
  for (const e of EDGES) {
    const pts = [getNode(e.a).pos, ...(e.waypoints ?? []), getNode(e.b).pos];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay, az] = pts[i - 1], [bx, by, bz] = pts[i];
      const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay, bz - az)));
      for (let s = 0; s <= steps; s++) { const t = s / steps; pathSamples.push([ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t]); }
    }
  }
  const horizClearanceTo = (px, pz, yLo, yHi) => {
    let best = Infinity;
    for (const [sx, sy, sz] of pathSamples) {
      if (sy < yLo - 2 || sy > yHi + 2) continue;
      const d = Math.hypot(sx - px, sz - pz);
      if (d < best) best = d;
    }
    return best;
  };
  for (const n of NODES) {
    if (n.kind === 'audio') continue;
    const s = n.stretch ?? [1, 1, 1];
    const rx = n.radius * s[0], ry = n.radius * s[1], rz = n.radius * s[2];
    const maxR = Math.max(rx, ry, rz);
    const up = n.falseUp ?? [0, 1, 0];
    let floorN, floorD;
    if (n.floor !== undefined) {
      floorN = up;
      const px = n.pos[0] - up[0] * ry * n.floor, py = n.pos[1] - up[1] * ry * n.floor, pz = n.pos[2] - up[2] * ry * n.floor;
      floorD = up[0] * px + up[1] * py + up[2] * pz;
    }
    prims.push({
      ax: n.pos[0], ay: n.pos[1], az: n.pos[2], bx: n.pos[0], by: n.pos[1], bz: n.pos[2],
      r: n.radius, rb: n.radius, rx, ry, rz, ellipsoid: true, solid: false,
      broad: n.radius >= 4 ? Math.min(maxR * 0.15, 3.5) : 0, floorN, floorD,
      noiseAmp: noiseAmpFor(Math.min(rx, ry, rz)), zone: n.zone, width: 'chamber', ref: n.id,
    });
    if (n.spikes) {
      const t1 = Math.abs(up[1]) < 0.95 ? [up[2] === 0 && up[0] === 0 ? 1 : -up[2], 0, up[0]] : [1, 0, 0];
      const l1 = Math.hypot(...t1) || 1; t1[0] /= l1; t1[1] /= l1; t1[2] /= l1;
      const t2 = [up[1] * t1[2] - up[2] * t1[1], up[2] * t1[0] - up[0] * t1[2], up[0] * t1[1] - up[1] * t1[0]];
      for (let i = 0; i < n.spikes; i++) {
        const ang = i * 2.399 + n.pos[2] * 0.31;
        const rr = 0.15 + 0.6 * Math.abs(Math.sin(i * 12.99 + n.pos[0]));
        const a = Math.cos(ang) * rx * rr, b = Math.sin(ang) * rz * rr;
        const px = n.pos[0] + t1[0] * a + t2[0] * b, py = n.pos[1] + t1[1] * a + t2[1] * b, pz = n.pos[2] + t1[2] * a + t2[2] * b;
        const frac = (a / rx) ** 2 + (b / rz) ** 2;
        if (frac > 0.72) continue;
        if (horizClearanceTo(px, pz, n.pos[1] - ry, n.pos[1] + ry) < 1.0) continue;
        const vary = Math.abs(Math.sin(i * 3.37 + n.pos[2]));
        const reach = ry * Math.sqrt(1 - frac);
        if (i % 2 === 0) {
          const len = 0.7 + 1.2 * vary;
          prims.push(segPrim({
            ax: px + up[0] * (reach + 0.8), ay: py + up[1] * (reach + 0.8), az: pz + up[2] * (reach + 0.8),
            bx: px + up[0] * (reach - len), by: py + up[1] * (reach - len), bz: pz + up[2] * (reach - len),
            r: 0.42, rb: 0.12, noiseAmp: 0.1, zone: n.zone, width: 'chamber', ref: n.id + '-tite' + i,
          }, true));
        } else if (floorD !== undefined) {
          const over = up[0] * px + up[1] * py + up[2] * pz - floorD;
          const fx = px - up[0] * over, fy = py - up[1] * over, fz = pz - up[2] * over;
          const len = 0.4 + 0.7 * vary;
          prims.push(segPrim({
            ax: fx - up[0] * 0.6, ay: fy - up[1] * 0.6, az: fz - up[2] * 0.6,
            bx: fx + up[0] * len, by: fy + up[1] * len, bz: fz + up[2] * len,
            r: 0.5, rb: 0.14, noiseAmp: 0.1, zone: n.zone, width: 'chamber', ref: n.id + '-mite' + i,
          }, true));
        }
      }
    }
    if (n.pillars) {
      const yLo = n.pos[1] - ry, yHi = n.pos[1] + ry;
      for (let i = 0; i < n.pillars; i++) {
        const ang = i * 2.399 + n.pos[0] * 0.7 + n.pos[2] * 0.3;
        const rr = 0.3 + 0.3 * Math.abs(Math.sin(i * 5.7 + n.pos[1]));
        const px = n.pos[0] + Math.cos(ang) * rx * rr, pz = n.pos[2] + Math.sin(ang) * rz * rr;
        const want = 0.7 + 0.7 * Math.abs(Math.sin(i * 3.1 + n.pos[2]));
        const pr = Math.min(want, horizClearanceTo(px, pz, yLo, yHi) - 1.1);
        if (pr < 0.4) continue;
        prims.push(segPrim({
          ax: px, ay: n.pos[1] - ry * 0.95, az: pz, bx: px, by: n.pos[1] + ry * 0.95, bz: pz,
          r: pr, noiseAmp: 0.3, zone: n.zone, width: 'chamber', ref: n.id + '-pillar' + i,
        }, true));
      }
    }
  }
  prims.push(segPrim({
    ax: SKY_SHAFT.a[0], ay: SKY_SHAFT.a[1], az: SKY_SHAFT.a[2], bx: SKY_SHAFT.b[0], by: SKY_SHAFT.b[1], bz: SKY_SHAFT.b[2],
    r: SKY_SHAFT.r, noiseAmp: noiseAmpFor(SKY_SHAFT.r), zone: 'sinkhole', width: 'chamber', ref: 'sky-shaft',
  }));
  for (const e of EDGES) {
    const pts = [getNode(e.a).pos, ...(e.waypoints ?? []), getNode(e.b).pos];
    const r = widthRadius(e.width);
    for (let i = 1; i < pts.length; i++) {
      prims.push(segPrim({
        ax: pts[i - 1][0], ay: pts[i - 1][1], az: pts[i - 1][2], bx: pts[i][0], by: pts[i][1], bz: pts[i][2],
        r, noiseAmp: noiseAmpFor(r), zone: getNode(e.a).zone, width: e.width, ref: e.a + '~' + e.b,
      }));
    }
  }
  hash = new Map();
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  prims.forEach((p, idx) => {
    const maxR = Math.max(p.rx, p.ry, p.rz);
    const pad = maxR + p.broad + G.noiseAmpMax + 1.2;
    const lo = [Math.min(p.ax, p.bx) - pad, Math.min(p.ay, p.by) - pad, Math.min(p.az, p.bz) - pad];
    const hi = [Math.max(p.ax, p.bx) + pad, Math.max(p.ay, p.by) + pad, Math.max(p.az, p.bz) + pad];
    if (!p.solid) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], lo[a]); mx[a] = Math.max(mx[a], hi[a]); }
    for (let ix = Math.floor(lo[0] / HASH_CELL); ix <= Math.floor(hi[0] / HASH_CELL); ix++)
      for (let iy = Math.floor(lo[1] / HASH_CELL); iy <= Math.floor(hi[1] / HASH_CELL); iy++)
        for (let iz = Math.floor(lo[2] / HASH_CELL); iz <= Math.floor(hi[2] / HASH_CELL); iz++) {
          const key = hashKey(ix, iy, iz), list = hash.get(key);
          if (list) list.push(idx); else hash.set(key, [idx]);
        }
  });
  bounds = { min: mn, max: mx };
}

function capsuleDist(px, py, pz, p) {
  const abx = p.bx - p.ax, aby = p.by - p.ay, abz = p.bz - p.az;
  const apx = px - p.ax, apy = py - p.ay, apz = pz - p.az;
  const len2 = abx * abx + aby * aby + abz * abz;
  let t = len2 > 0 ? (apx * abx + apy * aby + apz * abz) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = apx - abx * t, dy = apy - aby * t, dz = apz - abz * t;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) - (p.r + (p.rb - p.r) * t);
}
function ellipsoidDist(px, py, pz, p) {
  const dx = px - p.ax, dy = py - p.ay, dz = pz - p.az;
  const k0 = Math.sqrt((dx / p.rx) ** 2 + (dy / p.ry) ** 2 + (dz / p.rz) ** 2);
  if (k0 < 1e-4) return -Math.min(p.rx, p.ry, p.rz);
  const k1 = Math.sqrt((dx / (p.rx * p.rx)) ** 2 + (dy / (p.ry * p.ry)) ** 2 + (dz / (p.rz * p.rz)) ** 2);
  return (k0 * (k0 - 1)) / k1;
}

/** The field: d < 0 in water (passable), d > 0 in rock. */
export function sdf(x, y, z) {
  const list = hash.get(hashKey(Math.floor(x / HASH_CELL), Math.floor(y / HASH_CELL), Math.floor(z / HASH_CELL)));
  let d = BIG;
  if (list) {
    const noise = fbm(x * G.noiseFreq, y * G.noiseFreq, z * G.noiseFreq);
    let broadNoise = null;
    for (const idx of list) {
      const p = prims[idx];
      if (p.solid) continue;
      const base = p.ellipsoid ? ellipsoidDist(x, y, z, p) : capsuleDist(x, y, z, p);
      let di = base - noise * p.noiseAmp;
      if (p.broad > 0) {
        if (broadNoise === null) broadNoise = fbm(x * 0.06 + 31.7, y * 0.06, z * 0.06, 2);
        di -= broadNoise * p.broad;
      }
      if (p.floorN !== undefined && p.floorD !== undefined) {
        const along = p.floorN[0] * x + p.floorN[1] * y + p.floorN[2] * z;
        di = smax(di, p.floorD - along - noise * p.noiseAmp * 0.25, 1.2);
      }
      if (di < d) d = di;
    }
    for (const idx of list) {
      const p = prims[idx];
      if (!p.solid) continue;
      const base = p.ellipsoid ? ellipsoidDist(x, y, z, p) : capsuleDist(x, y, z, p);
      const ds = base - noise * p.noiseAmp;
      if (-ds > d) d = -ds;
    }
  }
  return d;
}

export function regionAt(x, y, z) {
  const list = hash.get(hashKey(Math.floor(x / HASH_CELL), Math.floor(y / HASH_CELL), Math.floor(z / HASH_CELL)));
  if (!list || list.length === 0) return null;
  let best = Infinity, bestPrim = null;
  for (const idx of list) {
    const p = prims[idx];
    if (p.solid) continue;
    const di = p.ellipsoid ? ellipsoidDist(x, y, z, p) : capsuleDist(x, y, z, p);
    if (di < best) { best = di; bestPrim = p; }
  }
  return bestPrim ? { zone: bestPrim.zone, width: bestPrim.width, ref: bestPrim.ref } : null;
}

// ---------------------------------------------------------------- src/cave/mesh.ts
const ZONE_ROCK = {
  sinkhole: [0.47, 0.58, 0.53], galleries: [0.43, 0.46, 0.4], maze: [0.55, 0.52, 0.44],
  throat: [0.34, 0.36, 0.4], abyss: [0.3, 0.35, 0.45],
};

/** Surface nets over the field inside box {min,max}. Returns flat (non-indexed) positions and colours.
 *  keep(x,y,z) may drop faces the camera can never see (rock beyond the route). */
export function buildCaveMesh(box, keep) {
  const cs = G.cellSize;
  const min = [Math.max(bounds.min[0] - 1.5, box.min[0]), Math.max(bounds.min[1] - 1.5, box.min[1]), Math.max(bounds.min[2] - 1.5, box.min[2])];
  const max = [Math.min(bounds.max[0] + 1.5, box.max[0]), Math.min(bounds.max[1] + 1.5, box.max[1]), Math.min(bounds.max[2] + 1.5, box.max[2])];
  const nx = Math.ceil((max[0] - min[0]) / cs), ny = Math.ceil((max[1] - min[1]) / cs), nz = Math.ceil((max[2] - min[2]) / cs);
  const fw = nx + 1, fh = ny + 1;
  const field = new Float32Array(fw * fh * (nz + 1));
  const fi = (i, j, k) => (k * fh + j) * fw + i;
  for (let k = 0; k <= nz; k++) {
    const z = min[2] + k * cs;
    for (let j = 0; j <= ny; j++) {
      const y = min[1] + j * cs;
      for (let i = 0; i <= nx; i++) field[fi(i, j, k)] = sdf(min[0] + i * cs, y, z);
    }
  }
  const CELL_EDGES = [];
  for (const axis of [0, 1, 2]) for (const u of [0, 1]) for (const v of [0, 1]) {
    const a = [0, 0, 0]; a[(axis + 1) % 3] = u; a[(axis + 2) % 3] = v;
    const b = [...a]; b[axis] = 1; CELL_EDGES.push([a, b]);
  }
  const cellVert = new Int32Array(nx * ny * nz).fill(-1);
  const ci = (i, j, k) => (k * ny + j) * nx + i;
  const vertPos = [], vertCol = [];
  let vertCount = 0;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let neg = false, pos = false;
    for (let c = 0; c < 8; c++) { const v = field[fi(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]; if (v < 0) neg = true; else pos = true; }
    if (!neg || !pos) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [a, b] of CELL_EDGES) {
      const va = field[fi(i + a[0], j + a[1], k + a[2])], vb = field[fi(i + b[0], j + b[1], k + b[2])];
      if (va < 0 === vb < 0) continue;
      const t = va / (va - vb);
      sx += i + a[0] + (b[0] - a[0]) * t; sy += j + a[1] + (b[1] - a[1]) * t; sz += k + a[2] + (b[2] - a[2]) * t; cnt++;
    }
    if (!cnt) continue;
    const wx = min[0] + (sx / cnt) * cs, wy = min[1] + (sy / cnt) * cs, wz = min[2] + (sz / cnt) * cs;
    cellVert[ci(i, j, k)] = vertCount++;
    vertPos.push(wx, wy, wz);
    const zone = regionAt(wx, wy, wz)?.zone ?? 'galleries';
    const base = ZONE_ROCK[zone];
    const broad = fbm(wx * 0.16, wy * 0.16, wz * 0.16);
    const fine = fbm(wx * 0.75 + 11.3, wy * 0.75, wz * 0.75);
    const shade = Math.min(1.6, Math.max(0.4, 1 + broad * 0.25 + fine * 0.45));
    vertCol.push(base[0] * shade, base[1] * shade, base[2] * shade);
  }
  const triIdx = [];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (keep) {
      const cx = (vertPos[a * 3] + vertPos[c * 3]) * 0.5, cy = (vertPos[a * 3 + 1] + vertPos[c * 3 + 1]) * 0.5, cz = (vertPos[a * 3 + 2] + vertPos[c * 3 + 2]) * 0.5;
      if (!keep(cx, cy, cz)) return;
    }
    if (flip) triIdx.push(a, c, b, a, d, c); else triIdx.push(a, b, c, a, c, d);
  };
  for (let k = 1; k < nz; k++) for (let j = 1; j < ny; j++) for (let i = 1; i < nx; i++) {
    const f0 = field[fi(i, j, k)];
    const fx = field[fi(i + 1, j, k)];
    if (f0 < 0 !== fx < 0 && i < nx - 1) quad(cellVert[ci(i, j - 1, k - 1)], cellVert[ci(i, j, k - 1)], cellVert[ci(i, j, k)], cellVert[ci(i, j - 1, k)], f0 < 0);
    const fy = field[fi(i, j + 1, k)];
    if (f0 < 0 !== fy < 0 && j < ny - 1) quad(cellVert[ci(i - 1, j, k - 1)], cellVert[ci(i - 1, j, k)], cellVert[ci(i, j, k)], cellVert[ci(i, j, k - 1)], f0 < 0);
    const fz = field[fi(i, j, k + 1)];
    if (f0 < 0 !== fz < 0 && k < nz - 1) quad(cellVert[ci(i - 1, j - 1, k)], cellVert[ci(i, j - 1, k)], cellVert[ci(i, j, k)], cellVert[ci(i - 1, j, k)], f0 < 0);
  }
  const positions = new Float32Array(triIdx.length * 3), colors = new Float32Array(triIdx.length * 3);
  for (let t = 0; t < triIdx.length; t++) {
    const v = triIdx[t];
    positions[t * 3] = vertPos[v * 3]; positions[t * 3 + 1] = vertPos[v * 3 + 1]; positions[t * 3 + 2] = vertPos[v * 3 + 2];
    colors[t * 3] = vertCol[v * 3]; colors[t * 3 + 1] = vertCol[v * 3 + 1]; colors[t * 3 + 2] = vertCol[v * 3 + 2];
  }
  return { positions, colors, tris: triIdx.length / 3 };
}
