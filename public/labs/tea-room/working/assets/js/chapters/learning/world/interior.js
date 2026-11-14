// Inside the tea house (from src/scripts/home/scene/world/interior.js, same measures and materials): the low tea
// table and its cushions, the tokonoma cut into the right-hand wall with its hanging painting and a single bloom,
// the writing desk and the bonsai. Each thing is its own piece (the copy this page started from, the tea house
// taken apart, moves them; here they stand still).
import {
  BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, ExtrudeGeometry, Shape, SphereGeometry, TorusGeometry,
} from 'three';

// where the writing desk stands and how it is turned (the homepage's own numbers); its top is DESK.top above DESK.at
export const DESK = { at: [-4.14, 0.56, 2.14], turn: 1.57, top: 0.57 };

export function buildInterior({ M, part, merge, at, piece }) {
  const out = [];

  // low tea table with runner, kettle and cups
  const T = [-4.1, 0.36, -3.3];
  out.push(piece('table', 'furniture', [at(T, 0, [
    part(new BoxGeometry(2.5, 0.16, 1.7), M.wood, [0, 0.72, 0], null, 1.015),
    merge([[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].map(p =>
      ({ geo: new BoxGeometry(0.2, 0.72, 0.2), pos: [p[0], 0.36, p[1]] })), M.woodDark),
  ])], { corner: 'now', seq: 20 }));
  out.push(piece('runner', 'furniture', [at(T, 0, [
    part(new BoxGeometry(1.5, 0.02, 1.0), M.paper, [0.15, 0.81, 0], null, 0),
  ])], { corner: 'now', up: 0.55, seq: 21 }));
  out.push(piece('kettle', 'furniture', [at(T, 0, [merge([
    { geo: new SphereGeometry(0.3, 12, 9), pos: [0.3, 1.06, 0] },
    { geo: new TorusGeometry(0.22, 0.035, 6, 12), pos: [0.3, 1.36, 0] },
    { geo: new CylinderGeometry(0.03, 0.06, 0.42, 6), pos: [0.72, 1.16, 0], rot: [0, 0, -1.0] },
  ], M.clay)])], { corner: 'now', up: 1.5, seq: 23 }));
  [[-0.62, -0.3, 'a'], [-0.78, 0.22, 'b']].forEach(([x, z, id], i) => {
    out.push(piece('cup-' + id, 'furniture', [at(T, 0, [
      merge([{ geo: new CylinderGeometry(0.15, 0.11, 0.16, 10), pos: [x, 0.9, z] }], M.clay),
      merge([{ geo: new CircleGeometry(0.13, 10), pos: [x, 0.985, z], rot: [-Math.PI / 2, 0, 0] }], M.tea, 0),
    ])], { corner: 'now', up: 1.0 + i * 0.3, dir: [-1, 0], out: 0.35 + i * 0.2, seq: 22 }));
  });

  // zabuton cushions: rounded corners and a soft bevelled edge, like stuffed cotton
  const zabuton = (w, t, r) => {
    const sh = new Shape(), a = -w / 2, b = a + w;
    sh.moveTo(a + r, a);
    sh.lineTo(b - r, a); sh.quadraticCurveTo(b, a, b, a + r);
    sh.lineTo(b, b - r); sh.quadraticCurveTo(b, b, b - r, b);
    sh.lineTo(a + r, b); sh.quadraticCurveTo(a, b, a, b - r);
    sh.lineTo(a, a + r); sh.quadraticCurveTo(a, a, a + r, a);
    const d = t - 0.09;
    const geo = new ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.045,
                                            bevelSize: 0.045, bevelOffset: 0, bevelSegments: 2, curveSegments: 5 });
    geo.translate(0, 0, -d / 2);
    return geo;
  };
  out.push(piece('cushion-a', 'furniture', [merge([{ geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -1.7], rot: [-Math.PI / 2, 0, 0.2] }], M.cushion)],
    { corner: 'now', up: -0.9, dir: [0, 1], out: 0.5, seq: 18 }));
  out.push(piece('cushion-b', 'furniture', [merge([{ geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -4.35], rot: [-Math.PI / 2, 0, -0.15] }], M.cushion)],
    { corner: 'now', up: -0.9, dir: [0, -1], out: 0.3, seq: 19 }));

  // tokonoma: a recess cut into the right-hand wall, centred on it
  const aH = 3.3;                                 // centre height of the otoshigake
  const aW = 1.55;                                // half-width of the opening, along z
  const kz = aW / 1.73;                           // how far the contents move in or out
  const aTop = aH - 0.15;                         // top of the recess shell
  const aMid = (0.72 + aH - 0.17) / 2;            // centre of the opening
  const aInner = aTop - 0.42;                     // shell height, sill board up to the ceiling
  out.push(piece('alcove-shell', 'furniture', [merge([
    { geo: new BoxGeometry(0.09, aInner, aW * 2 - 0.26), pos: [7.32, (0.42 + aTop) / 2, 0] },   // back of the recess
    { geo: new BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, -aW] },
    { geo: new BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, aW] },
    { geo: new BoxGeometry(1.2, 0.08, aW * 2 + 0.04), pos: [6.75, aH - 0.19, 0] },               // recess ceiling
  ], M.cream)], { corner: 'projects', dir: [1, 0], out: 2.2, seq: 0 }));
  out.push(piece('alcove-floor', 'furniture', [part(new BoxGeometry(1.06, 0.12, aW * 2 - 0.26), M.wood, [6.83, 0.48, 0])],
    { corner: 'projects', dir: [1, 0], out: 3.9, up: -0.5, seq: 2 }));
  out.push(piece('alcove-frame', 'furniture', [merge([
    { geo: new BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, aH, 0] },                    // otoshigake
    { geo: new BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, 0.55, 0] },                  // sill
    { geo: new BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, -aW] },                    // posts
    { geo: new BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, aW] },
  ], M.beam)], { corner: 'projects', dir: [1, 0], out: 0.9, seq: 4 }));

  // hanging painting: mounted paper, sumi mountain, vermilion sun
  const dy = aMid - 1.80;
  out.push(piece('painting', 'furniture', [
    part(new BoxGeometry(0.07, 1.62, 2.0), M.woodDark, [7.24, 1.9 + dy, 0.1 * kz]),
    part(new BoxGeometry(0.04, 1.4, 1.78), M.paper, [7.19, 1.9 + dy, 0.1 * kz], null, 0),
    part(new ConeGeometry(0.58, 0.72, 4), M.mtnNear, [7.06, 1.62 + dy, 0.16 * kz], [0, Math.PI / 4, 0]),
    part(new ConeGeometry(0.34, 0.44, 4), M.mtnFar, [7.06, 1.48 + dy, 0.82 * kz], [0, Math.PI / 4, 0]),
    part(new CircleGeometry(0.2, 12), M.verm, [7.15, 2.3 + dy, -0.42 * kz], [0, -Math.PI / 2, 0]),
  ], { corner: 'projects', dir: [1, 0], out: 4.7, up: 1.0, turn: 2.2, seq: 1 }));   // it comes out past its recess and turns to face the garden

  // vase and single bloom on the alcove floor
  out.push(piece('vase', 'furniture', [
    part(new CylinderGeometry(0.16, 0.22, 0.5, 10), M.clay, [6.85, 0.79, -1.0 * kz]),
    part(new CylinderGeometry(0.02, 0.02, 0.5, 5), M.leafDark, [6.85, 1.04, -1.0 * kz], null, 0),
    part(new SphereGeometry(0.13, 8, 6), M.petal, [6.85, 1.16, -1.0 * kz]),
  ], { corner: 'projects', dir: [1, 0], out: 3.9, up: 0.1, seq: 3 }));

  // writing desk: the ledger's desk. (The book, the brush and the ink pot are built by ../book.js, where the book
  // can open; the homepage's own are two closed boxes.)
  const K = DESK.at, KR = DESK.turn;
  out.push(piece('desk', 'furniture', [at(K, KR, [
    part(new BoxGeometry(1.9, 0.14, 1.0), M.woodDark, [0, 0.5, 0], null, 1.02),
    merge([-0.78, 0.78].map(x => ({ geo: new BoxGeometry(0.16, 0.5, 0.85), pos: [x, 0.25, 0] })), M.wood),
  ])], { corner: 'ledger', seq: 10 }));

  // bonsai on a stand, right side
  const B = [5.3, 0.36, 4.3];
  out.push(piece('bonsai-stand', 'furniture', [at(B, 0, [
    part(new BoxGeometry(0.9, 0.7, 0.9), M.wood, [0, 0.35, 0], null, 1.02),
  ])], { seq: 30 }));
  out.push(piece('bonsai', 'furniture', [at(B, 0, [
    part(new CylinderGeometry(0.28, 0.34, 0.26, 10), M.cream, [0, 0.83, 0]),
    part(new CylinderGeometry(0.06, 0.1, 0.6, 6), M.trunk, [0, 1.2, 0], [0, 0, 0.25]),
    merge([
      { geo: new SphereGeometry(0.42, 10, 7), pos: [0.18, 1.6, 0] },
      { geo: new SphereGeometry(0.3, 9, 7), pos: [-0.35, 1.42, 0.1] },
    ], M.leafDark),
  ])], { up: 0.9, seq: 31 }));
  return out;
}
