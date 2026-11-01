// The tea house: the raised floor with its sunken genkan and the shoes left there, tatami, plaster walls, the shoji
// as real sliding windows (some slid open to the garden), posts and beams, the paper ceiling and one hipped roof.
import { BoxGeometry, BufferGeometry, CylinderGeometry, Float32BufferAttribute, Group, SphereGeometry } from 'three';

export function buildHouse({ M, part, merge }) {
  const g = new Group();
  const W = 6.4, D = 5.2, H = 3.1;

  // raised floor platform, notched at the front bay to leave a sunken genkan
  const PX = W + 0.6, PZ = D + 0.7;          // platform half-extents
  const GX = 2.4, GZ = 3.3;                  // genkan mouth: |x| < GX, z > GZ
  g.add(merge([
    { geo: new BoxGeometry(PX - GX, 0.5, PZ * 2), pos: [-(GX + PX) / 2, 0.05, 0] },
    { geo: new BoxGeometry(PX - GX, 0.5, PZ * 2), pos: [(GX + PX) / 2, 0.05, 0] },
    { geo: new BoxGeometry(GX * 2, 0.5, PZ + GZ), pos: [0, 0.05, (GZ - PZ) / 2] }
  ], M.wood));

  // tatami, notched to match
  const TX = W - 0.1, TZ = D - 0.1;
  g.add(merge([
    { geo: new BoxGeometry(TX - GX, 0.06, TZ * 2), pos: [-(GX + TX) / 2, 0.33, 0] },
    { geo: new BoxGeometry(TX - GX, 0.06, TZ * 2), pos: [(GX + TX) / 2, 0.33, 0] },
    { geo: new BoxGeometry(GX * 2, 0.06, TZ + GZ), pos: [0, 0.33, (GZ - TZ) / 2] }
  ], M.tatami, 0));
  const slats = [];
  for (let i = -2; i <= 2; i++) {
    const x = i * (W / 2.6), clear = Math.abs(x) > GX;
    slats.push({ geo: new BoxGeometry(0.05, 0.02, clear ? TZ * 2 : TZ + GZ), pos: [x, 0.37, clear ? 0 : (GZ - TZ) / 2] });
  }
  g.add(merge(slats, M.woodDark, 0));

  // genkan: packed-earth landing at ground level, stepped down from the room
  const tataki = M.tataki;
  g.add(part(new BoxGeometry(GX * 2, 0.1, PZ - GZ), tataki, [0, 0.05, (GZ + PZ) / 2], null, 0));
  // kamachi — the step edge you sit on to unlace
  g.add(merge([
    { geo: new BoxGeometry(GX * 2 + 0.3, 0.42, 0.26), pos: [0, 0.21, GZ] },
    { geo: new BoxGeometry(0.26, 0.42, PZ - GZ), pos: [-GX - 0.02, 0.21, (GZ + PZ) / 2] },
    { geo: new BoxGeometry(0.26, 0.42, PZ - GZ), pos: [GX + 0.02, 0.21, (GZ + PZ) / 2] }
  ], M.beam));

  // a pair of shoes below the step, turned to face back out at the garden
  const shoe = (x, z, ry) => {
    const s = new Group();
    s.add(part(new BoxGeometry(0.24, 0.07, 0.56), M.clay, [0, 0.135, 0], null, 0));
    s.add(part(new BoxGeometry(0.26, 0.14, 0.24), M.clay, [0, 0.2, -0.14]));
    s.position.set(x, 0, z); s.rotation.y = ry;
    return s;
  };
  g.add(shoe(-1.46, 4.42, 0.12));
  g.add(shoe(-1.10, 4.48, -0.08));

  // getabako — shoe cabinet against the side of the landing
  g.add(merge([
    { geo: new BoxGeometry(0.92, 0.86, 0.42), pos: [1.72, 0.53, 4.5] },
    { geo: new BoxGeometry(1.02, 0.08, 0.5), pos: [1.72, 1.0, 4.5] }
  ], M.wood));
  g.add(merge([
    { geo: new BoxGeometry(0.82, 0.03, 0.44), pos: [1.72, 0.72, 4.5] },
    { geo: new BoxGeometry(0.82, 0.03, 0.44), pos: [1.72, 0.4, 4.5] }
  ], M.woodDark, 0));
  g.add(part(new CylinderGeometry(0.14, 0.17, 0.2, 10), M.clay, [1.72, 1.14, 4.5]));
  g.add(part(new SphereGeometry(0.22, 10, 8), M.leafDark, [1.72, 1.4, 4.5]));

  // back + side walls: pink plaster, merged to one draw pair
  g.add(merge([
    { geo: new BoxGeometry(W * 2, 1.5, 0.18), pos: [0, 1.05, -D] },
    { geo: new BoxGeometry(D * 2, 1.5, 0.18), pos: [-W, 1.05, 0], rot: [0, Math.PI / 2, 0] },
    { geo: new BoxGeometry(3.55, 1.5, 0.18), pos: [W, 1.05, -3.425], rot: [0, Math.PI / 2, 0] },
    { geo: new BoxGeometry(3.55, 1.5, 0.18), pos: [W, 1.05, 3.425], rot: [0, Math.PI / 2, 0] }
    // nothing above the alcove opening: the otoshigake and the frieze already close it
  ], M.wall));

  // shoji as real sliding windows: each run is a track of leaves, some slid open to the garden
  const boards = [], bars = [], rails = [];
  const run = (cx, cy, cz, ry, len, ph, n, open) => {
    const s = Math.sin(ry), c = Math.cos(ry);
    const at = (lx, ly, dz) => [cx + lx * c + dz * s, cy + ly, cz - lx * s + dz * c];
    const pw = len / n;
    for (let i = 0; i < n; i++) {
      if (open.indexOf(i) >= 0) continue;
      const lx = -len / 2 + pw * (i + 0.5);
      // a leaf beside an opening has been slid into the outer track
      const dz = (open.indexOf(i + 1) >= 0 || open.indexOf(i - 1) >= 0) ? 0.075 : -0.045;
      const lw = pw + 0.12;   // leaves overlap so no daylight slips between them
      boards.push({ geo: new BoxGeometry(lw, ph, 0.05), pos: at(lx, 0, dz), rot: [0, ry, 0] });
      // stiles overhang the leaf edge a hair, so the wood wins the edge instead of z-fighting
      bars.push({ geo: new BoxGeometry(0.09, ph + 0.004, 0.11), pos: at(lx - lw / 2 + 0.039, 0, dz), rot: [0, ry, 0] });
      bars.push({ geo: new BoxGeometry(0.09, ph + 0.004, 0.11), pos: at(lx + lw / 2 - 0.039, 0, dz), rot: [0, ry, 0] });
      const cols = Math.max(2, Math.round(lw / 0.5)), rows = Math.max(2, Math.round(ph / 0.45));
      for (let j = 1; j < cols; j++) bars.push({ geo: new BoxGeometry(0.05, ph, 0.1), pos: at(lx - lw / 2 + j * (lw / cols), 0, dz), rot: [0, ry, 0] });
      for (let k = 1; k < rows; k++) bars.push({ geo: new BoxGeometry(lw + 0.012, 0.05, 0.1), pos: at(lx, -ph / 2 + k * (ph / rows), dz), rot: [0, ry, 0] });
    }
    rails.push({ geo: new BoxGeometry(len, 0.17, 0.3), pos: at(0, ph / 2 + 0.085, 0), rot: [0, ry, 0] });
    rails.push({ geo: new BoxGeometry(len, 0.15, 0.3), pos: at(0, -ph / 2 - 0.075, 0), rot: [0, ry, 0] });
  };
  run(0, 2.55, -D, 0, W * 2, 1.5, 6, [1, 4]);                    // back wall: two windows open
  run(-W, 2.55, 0, Math.PI / 2, D * 2, 1.5, 5, [1, 3]);          // left wall: two open
  run(W, 2.55, -3.425, Math.PI / 2, 3.4, 1.5, 2, []);            // right wall, flanking the alcove
  run(W, 2.55, 3.425, Math.PI / 2, 3.4, 1.5, 2, []);
  run(-4.4, 1.805, D, 0, 3.6, 2.94, 2, []);                      // front, either side of the open bay
  run(4.4, 1.805, D, 0, 3.6, 2.94, 2, []);
  g.add(merge(boards, M.shoji));
  g.add(merge(bars, M.woodDark, 0));
  g.add(merge(rails, M.beam));

  // posts + head beam
  g.add(merge([[-W, -D], [W, -D], [-W, D], [W, D], [-2.4, D], [2.4, D]].map(p =>
    ({ geo: new BoxGeometry(0.34, H + 0.5, 0.34), pos: [p[0], (H + 0.5) / 2, p[1]] })), M.beam));
  g.add(merge([
    { geo: new BoxGeometry(W * 2 + 0.9, 0.4, 0.4), pos: [0, H + 0.55, D] },
    { geo: new BoxGeometry(W * 2 + 0.9, 0.4, 0.4), pos: [0, H + 0.55, -D] }
  ], M.beam));

  // frieze closing the gap between the shoji band and the ceiling — no sky leaks in
  g.add(merge([
    { geo: new BoxGeometry(W * 2, 0.69, 0.22), pos: [0, 3.645, -D] },
    { geo: new BoxGeometry(D * 2, 0.69, 0.22), pos: [-W, 3.645, 0], rot: [0, Math.PI / 2, 0] },
    { geo: new BoxGeometry(D * 2, 0.69, 0.22), pos: [W, 3.645, 0], rot: [0, Math.PI / 2, 0] },
    { geo: new BoxGeometry(3.6, 0.69, 0.22), pos: [-4.4, 3.645, D] },
    { geo: new BoxGeometry(3.6, 0.69, 0.22), pos: [4.4, 3.645, D] }
  ], M.beam));

  // pale ceiling so interior views don't read as a brown lid
  g.add(part(new BoxGeometry(W * 2 + 1.0, 0.12, D * 2 + 1.0), M.paper, [0, 4.06, 0]));

  // one solid hipped roof, overhanging the plan on all four sides
  const rw = W * 2 + 3.2, rd = D * 2 + 3.2, rh = 3.1, ry0 = H + 0.80;
  g.add(part(hipRoof(rw, rd, rh), M.roof, [0, ry0, 0]));
  g.add(part(new BoxGeometry(rw - rd + 0.5, 0.34, 0.6), M.roofRidge, [0, ry0 + rh + 0.04, 0]));
  return g;
}

// proper hip: rectangular eaves, a ridge along X, four sloping faces that meet exactly
function hipRoof(w, d, h) {
  const x = w / 2, z = d / 2, r = Math.max(0.2, x - z);
  const v = [
    [-x, 0, z], [x, 0, z], [x, 0, -z], [-x, 0, -z],   // eave corners
    [-r, h, 0], [r, h, 0]                              // ridge ends
  ];
  const tri = [
    [0, 1, 5], [0, 5, 4],   // front slope
    [2, 3, 4], [2, 4, 5],   // back slope
    [3, 0, 4],              // left hip
    [1, 2, 5],              // right hip
    [0, 3, 2], [0, 2, 1]    // soffit, so the solid is closed
  ];
  const pos = [];
  tri.forEach(t => t.forEach(i => pos.push(v[i][0], v[i][1], v[i][2])));
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
