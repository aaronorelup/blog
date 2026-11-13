// The tea house (from src/scripts/home/scene/world/house.js, same measures and materials): the raised floor with
// its sunken genkan and the shoes left there, tatami, plaster walls, the shoji as real sliding windows, posts and
// beams, the paper ceiling and one hipped roof. The homepage merges all of it per material; here every board is
// its own piece (kit.piece), so the house can be taken apart: buildHouse returns the list of pieces.
import { BoxGeometry, BufferGeometry, CylinderGeometry, Float32BufferAttribute, SphereGeometry } from 'three';

export function buildHouse({ M, part, merge, at, piece }) {
  const out = [];
  const W = 6.4, D = 5.2, H = 3.1;
  const box = (w, h, d, pos, rot) => ({ geo: new BoxGeometry(w, h, d), pos, rot });

  // raised floor platform, notched at the front bay to leave a sunken genkan: three blocks
  const PX = W + 0.6, PZ = D + 0.7;          // platform half-extents
  const GX = 2.4, GZ = 3.3;                  // genkan mouth: |x| < GX, z > GZ
  out.push(piece('platform-left', 'floor', [merge([box(PX - GX, 0.5, PZ * 2, [-(GX + PX) / 2, 0.05, 0])], M.wood)],
    { dir: [-1, 0], out: 0.9, up: -1, seq: 20 }));
  out.push(piece('platform-right', 'floor', [merge([box(PX - GX, 0.5, PZ * 2, [(GX + PX) / 2, 0.05, 0])], M.wood)],
    { dir: [1, 0], out: 0.9, up: -1, seq: 21 }));
  out.push(piece('platform-mid', 'floor', [merge([box(GX * 2, 0.5, PZ + GZ, [0, 0.05, (GZ - PZ) / 2])], M.wood)],
    { dir: [0, -1], out: 0.9, up: -1, seq: 22 }));

  // tatami: six mats between the dark slats, the two middle ones cut short by the genkan
  const TX = W - 0.1, TZ = D - 0.1, step = W / 2.6;
  const edges = [-TX, -2 * step, -step, 0, step, 2 * step, TX];
  const slatOf = [-2 * step, -step, 0, null, step, 2 * step];     // the slat each mat carries with it
  for (let i = 0; i < 6; i++) {
    const x0 = edges[i], x1 = edges[i + 1], mid = i === 2 || i === 3;
    const len = mid ? TZ + GZ : TZ * 2, cz = mid ? (GZ - TZ) / 2 : 0;
    const parts = [merge([box(x1 - x0, 0.06, len, [(x0 + x1) / 2, 0.33, cz])], M.tatami)];
    if (slatOf[i] !== null) parts.push(merge([box(0.05, 0.02, len, [slatOf[i], 0.37, cz])], M.woodDark, 0));
    out.push(piece('mat-' + i, 'floor', parts, { dir: [i < 3 ? -1 : 1, 0], out: Math.abs(i - 2.5) * 0.42, up: 0.25 * (i % 2), seq: i }));
  }

  // genkan: packed-earth landing at ground level, stepped down from the room
  out.push(piece('tataki', 'floor', [part(new BoxGeometry(GX * 2, 0.1, PZ - GZ), M.tataki, [0, 0.05, (GZ + PZ) / 2])],
    { dir: [0, 1], out: 2.0, up: -0.75, seq: 12 }));
  // kamachi: the step edge you sit on to unlace
  out.push(piece('kamachi-front', 'floor', [merge([box(GX * 2 + 0.3, 0.42, 0.26, [0, 0.21, GZ])], M.beam)],
    { dir: [0, 1], out: 0.9, up: 0.5, seq: 8 }));
  out.push(piece('kamachi-left', 'floor', [merge([box(0.26, 0.42, PZ - GZ, [-GX - 0.02, 0.21, (GZ + PZ) / 2])], M.beam)],
    { dir: [0, 1], out: 2.0, up: 0.1, along: [-0.55, 0], seq: 9 }));
  out.push(piece('kamachi-right', 'floor', [merge([box(0.26, 0.42, PZ - GZ, [GX + 0.02, 0.21, (GZ + PZ) / 2])], M.beam)],
    { dir: [0, 1], out: 2.0, up: 0.1, along: [0.55, 0], seq: 10 }));

  // a pair of shoes below the step, turned to face back out at the garden
  const shoe = (x, z, ry) => at([x, 0, z], ry, [
    part(new BoxGeometry(0.24, 0.07, 0.56), M.clay, [0, 0.135, 0], null, 0),
    part(new BoxGeometry(0.26, 0.14, 0.24), M.clay, [0, 0.2, -0.14]),
  ]);
  out.push(piece('shoe-a', 'furniture', [shoe(-1.46, 4.42, 0.12)], { corner: 'gate', dir: [0, 1], out: 2.0, up: -1.3, seq: 40 }));
  out.push(piece('shoe-b', 'furniture', [shoe(-1.10, 4.48, -0.08)], { corner: 'gate', dir: [0, 1], out: 2.0, up: -1.0, seq: 41 }));

  // getabako: shoe cabinet against the side of the landing, a potted plant on it
  out.push(piece('cabinet', 'furniture', [
    merge([box(0.92, 0.86, 0.42, [1.72, 0.53, 4.5]), box(1.02, 0.08, 0.5, [1.72, 1.0, 4.5])], M.wood),
    merge([box(0.82, 0.03, 0.44, [1.72, 0.72, 4.5]), box(0.82, 0.03, 0.44, [1.72, 0.4, 4.5])], M.woodDark, 0),
  ], { corner: 'gate', dir: [0, 1], out: 2.0, up: -0.9, seq: 42 }));
  out.push(piece('cabinet-plant', 'furniture', [
    part(new CylinderGeometry(0.14, 0.17, 0.2, 10), M.clay, [1.72, 1.14, 4.5]),
    part(new SphereGeometry(0.22, 10, 8), M.leafDark, [1.72, 1.4, 4.5]),
  ], { corner: 'gate', dir: [0, 1], out: 2.0, up: -0.2, seq: 43 }));

  // back + side walls: pink plaster, one piece each
  const HP = Math.PI / 2;
  out.push(piece('wall-right-a', 'walls', [merge([box(3.55, 1.5, 0.18, [W, 1.05, 3.425], [0, HP, 0])], M.wall)], { dir: [1, 0], seq: 0 }));
  out.push(piece('wall-right-b', 'walls', [merge([box(3.55, 1.5, 0.18, [W, 1.05, -3.425], [0, HP, 0])], M.wall)], { dir: [1, 0], seq: 1 }));
  out.push(piece('wall-back', 'walls', [merge([box(W * 2, 1.5, 0.18, [0, 1.05, -D])], M.wall)], { dir: [0, -1], seq: 2 }));
  out.push(piece('wall-left', 'walls', [merge([box(D * 2, 1.5, 0.18, [-W, 1.05, 0], [0, HP, 0])], M.wall)], { dir: [-1, 0], seq: 3 }));

  // shoji as real sliding windows: each run is a track of leaves, some slid open to the garden.
  // Every leaf (its paper and its lattice) and every rail is a piece.
  let order = 0;
  const run = (id, cx, cy, cz, ry, len, ph, n, open, normal) => {
    const s = Math.sin(ry), c = Math.cos(ry);
    const P3 = (lx, ly, dz) => [cx + lx * c + dz * s, cy + ly, cz - lx * s + dz * c];
    const pw = len / n, shut = n - open.length;
    out.push(piece('rail-' + id + '-top', 'screens', [merge([box(len, 0.17, 0.3, P3(0, ph / 2 + 0.085, 0), [0, ry, 0])], M.beam)],
      { dir: normal, up: 0.5, seq: order++ }));
    let k = 0;
    for (let i = 0; i < n; i++) {
      if (open.indexOf(i) >= 0) continue;
      const boards = [], bars = [];
      const lx = -len / 2 + pw * (i + 0.5);
      // a leaf beside an opening has been slid into the outer track
      const dz = (open.indexOf(i + 1) >= 0 || open.indexOf(i - 1) >= 0) ? 0.075 : -0.045;
      const lw = pw + 0.12;   // leaves overlap so no light slips between them
      boards.push(box(lw, ph, 0.05, P3(lx, 0, dz), [0, ry, 0]));
      // stiles overhang the leaf edge a hair, so the wood wins the edge instead of z-fighting
      bars.push(box(0.09, ph + 0.004, 0.11, P3(lx - lw / 2 + 0.039, 0, dz), [0, ry, 0]));
      bars.push(box(0.09, ph + 0.004, 0.11, P3(lx + lw / 2 - 0.039, 0, dz), [0, ry, 0]));
      const cols = Math.max(2, Math.round(lw / 0.5)), rows = Math.max(2, Math.round(ph / 0.45));
      for (let j = 1; j < cols; j++) bars.push(box(0.05, ph, 0.1, P3(lx - lw / 2 + j * (lw / cols), 0, dz), [0, ry, 0]));
      for (let r = 1; r < rows; r++) bars.push(box(lw + 0.012, 0.05, 0.1, P3(lx, -ph / 2 + r * (ph / rows), dz), [0, ry, 0]));
      const slide = (k - (shut - 1) / 2) * 0.5;      // in the drawing the leaves stand a little apart along their track
      out.push(piece('shoji-' + id + '-' + i, 'screens', [merge(boards, M.shoji), merge(bars, M.woodDark, 0)],
        { dir: normal, along: [c * slide, -s * slide], seq: order++ }));
      k++;
    }
    out.push(piece('rail-' + id + '-bottom', 'screens', [merge([box(len, 0.15, 0.3, P3(0, -ph / 2 - 0.075, 0), [0, ry, 0])], M.beam)],
      { dir: normal, up: -0.5, seq: order++ }));
  };
  run('front-r', 4.4, 1.805, D, 0, 3.6, 2.94, 2, [], [0, 1]);                       // front, either side of the open bay
  run('front-l', -4.4, 1.805, D, 0, 3.6, 2.94, 2, [], [0, 1]);
  run('right-a', W, 2.55, 3.425, HP, 3.4, 1.5, 2, [], [1, 0]);                      // right wall, flanking the alcove
  run('right-b', W, 2.55, -3.425, HP, 3.4, 1.5, 2, [], [1, 0]);
  run('back', 0, 2.55, -D, 0, W * 2, 1.5, 6, [1, 4], [0, -1]);                      // back wall: two windows open
  run('left', -W, 2.55, 0, HP, D * 2, 1.5, 5, [1, 3], [-1, 0]);                     // left wall: two open

  // posts
  [[W, D, 4], [2.4, D, 5], [-2.4, D, 6], [-W, D, 7], [W, -D, 8], [-W, -D, 9]].forEach(([x, z, seq]) => {
    const corner = Math.abs(x) === W;
    const d = corner ? [Math.sign(x) * 0.7071, Math.sign(z) * 0.7071] : [0, 1];
    out.push(piece('post-' + seq, 'walls', [merge([box(0.34, H + 0.5, 0.34, [x, (H + 0.5) / 2, z])], M.beam)],
      { dir: d, out: corner ? 3.0 : 2.4, up: -0.9, along: corner ? null : [Math.sign(x) * 0.5, 0], seq }));
  });

  // head beams, and the frieze closing the gap between the shoji band and the ceiling
  out.push(piece('head-front', 'beams', [merge([box(W * 2 + 0.9, 0.4, 0.4, [0, H + 0.55, D])], M.beam)], { dir: [0, 1], out: 2.5, up: 0.9, seq: 0 }));
  out.push(piece('head-back', 'beams', [merge([box(W * 2 + 0.9, 0.4, 0.4, [0, H + 0.55, -D])], M.beam)], { dir: [0, -1], out: 2.5, up: 0.9, seq: 1 }));
  out.push(piece('frieze-front-r', 'beams', [merge([box(3.6, 0.69, 0.22, [4.4, 3.645, D])], M.beam)], { dir: [0, 1], seq: 2 }));
  out.push(piece('frieze-front-l', 'beams', [merge([box(3.6, 0.69, 0.22, [-4.4, 3.645, D])], M.beam)], { dir: [0, 1], seq: 3 }));
  out.push(piece('frieze-right', 'beams', [merge([box(D * 2, 0.69, 0.22, [W, 3.645, 0], [0, HP, 0])], M.beam)], { dir: [1, 0], seq: 4 }));
  out.push(piece('frieze-back', 'beams', [merge([box(W * 2, 0.69, 0.22, [0, 3.645, -D])], M.beam)], { dir: [0, -1], seq: 5 }));
  out.push(piece('frieze-left', 'beams', [merge([box(D * 2, 0.69, 0.22, [-W, 3.645, 0], [0, HP, 0])], M.beam)], { dir: [-1, 0], seq: 6 }));

  // pale ceiling so interior views don't read as a brown lid
  out.push(piece('ceiling', 'ceiling', [part(new BoxGeometry(W * 2 + 1.0, 0.12, D * 2 + 1.0), M.paper, [0, 4.06, 0])], { seq: 0 }));

  // one hipped roof, overhanging the plan on all four sides: four slopes and the ridge
  const rw = W * 2 + 3.2, rd = D * 2 + 3.2, rh = 3.1, ry0 = H + 0.80;
  const x = rw / 2, z = rd / 2, r = Math.max(0.2, x - z);
  const v = [[-x, ry0, z], [x, ry0, z], [x, ry0, -z], [-x, ry0, -z], [-r, ry0 + rh, 0], [r, ry0 + rh, 0]];
  out.push(piece('ridge', 'roof', [part(new BoxGeometry(rw - rd + 0.5, 0.34, 0.6), M.roofRidge, [0, ry0 + rh + 0.04, 0])], { up: 2.0, seq: 0 }));
  out.push(piece('roof-front', 'roof', [part(slab([v[0], v[1], v[5], v[4]], 0.2), M.roof)], { dir: [0, 1], seq: 1 }));
  out.push(piece('roof-right', 'roof', [part(slab([v[1], v[2], v[5]], 0.2), M.roof)], { dir: [1, 0], seq: 2 }));
  out.push(piece('roof-back', 'roof', [part(slab([v[2], v[3], v[4], v[5]], 0.2), M.roof)], { dir: [0, -1], seq: 3 }));
  out.push(piece('roof-left', 'roof', [part(slab([v[3], v[0], v[4]], 0.2), M.roof)], { dir: [-1, 0], seq: 4 }));
  return out;
}

// One slope of the hip roof as a thin closed solid: the outer face is the homepage roof's own face (corners given
// anticlockwise seen from outside), the inner face lies t below it along the face's normal.
function slab(poly, t) {
  const a = poly[0], b = poly[1], c = poly[2];
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  const len = Math.hypot(n[0], n[1], n[2]);
  n = [n[0] / len, n[1] / len, n[2] / len];
  const inner = poly.map(p => [p[0] - n[0] * t, p[1] - n[1] * t, p[2] - n[2] * t]);
  const pos = [];
  const tri = (p, q, s) => pos.push(p[0], p[1], p[2], q[0], q[1], q[2], s[0], s[1], s[2]);
  for (let i = 1; i < poly.length - 1; i++) { tri(poly[0], poly[i], poly[i + 1]); tri(inner[0], inner[i + 1], inner[i]); }
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    tri(poly[i], inner[i], inner[j]); tri(poly[i], inner[j], poly[j]);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
