// Inside the tea house: the low tea table and its cushions, the tokonoma cut into the right-hand wall with its
// hanging painting and a single bloom, the writing desk (the ledger) and the bonsai.
import {
  BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, ExtrudeGeometry, Group, MeshLambertMaterial, Shape,
  SphereGeometry, TorusGeometry,
} from 'three';
import { P } from '../palette.js';

export function buildInterior({ M, part, merge }) {
  const g = new Group();

  // low tea table with runner, kettle and cups
  const table = new Group();
  table.add(part(new BoxGeometry(2.5, 0.16, 1.7), M.wood, [0, 0.72, 0], null, 1.015));
  table.add(merge([[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].map(p =>
    ({ geo: new BoxGeometry(0.2, 0.72, 0.2), pos: [p[0], 0.36, p[1]] })), M.woodDark));
  table.add(part(new BoxGeometry(1.5, 0.02, 1.0), M.paper, [0.15, 0.81, 0], null, 0));
  table.add(merge([
    { geo: new SphereGeometry(0.3, 12, 9), pos: [0.3, 1.06, 0] },
    { geo: new TorusGeometry(0.22, 0.035, 6, 12), pos: [0.3, 1.36, 0] },
    { geo: new CylinderGeometry(0.03, 0.06, 0.42, 6), pos: [0.72, 1.16, 0], rot: [0, 0, -1.0] },
    { geo: new CylinderGeometry(0.15, 0.11, 0.16, 10), pos: [-0.62, 0.9, -0.3] },
    { geo: new CylinderGeometry(0.15, 0.11, 0.16, 10), pos: [-0.78, 0.9, 0.22] }
  ], M.clay));
  table.add(merge([
    { geo: new CircleGeometry(0.13, 10), pos: [-0.62, 0.985, -0.3], rot: [-Math.PI / 2, 0, 0] },
    { geo: new CircleGeometry(0.13, 10), pos: [-0.78, 0.985, 0.22], rot: [-Math.PI / 2, 0, 0] }
  ], M.tea, 0));
  table.position.set(-4.1, 0.36, -3.3);
  g.add(table);

  // zabuton cushions — rounded corners and a soft bevelled edge, like stuffed cotton
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
  g.add(merge([
    { geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -1.7], rot: [-Math.PI / 2, 0, 0.2] },
    { geo: zabuton(1.1, 0.22, 0.17), pos: [-4.1, 0.47, -4.35], rot: [-Math.PI / 2, 0, -0.15] }
  ], M.cushion));

  // tokonoma: a recess cut into the right-hand wall, centred on it.
  // The shell is driven by head height and half-width, while everything hung or
  // stood inside keeps its own size and is simply re-placed to suit.
  const al = new Group();
  const aH = 3.3;                                 // centre height of the otoshigake
  const aW = 1.55;                                // half-width of the opening, along z
  const kz = aW / 1.73;                           // how far the contents move in or out
  const aTop = aH - 0.15;                         // top of the recess shell
  const aMid = (0.72 + aH - 0.17) / 2;            // centre of the opening
  const aInner = aTop - 0.42;                     // shell height, sill board up to the ceiling
  al.add(merge([
    { geo: new BoxGeometry(0.09, aInner, aW * 2 - 0.26), pos: [7.32, (0.42 + aTop) / 2, 0] },   // back of the recess
    // jambs overlap the wall in both axes so no faces sit coplanar (z-fighting)
    { geo: new BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, -aW] },
    { geo: new BoxGeometry(1.2, aInner, 0.32), pos: [6.75, (0.42 + aTop) / 2, aW] },
    { geo: new BoxGeometry(1.2, 0.08, aW * 2 + 0.04), pos: [6.75, aH - 0.19, 0] }               // recess ceiling
  ], M.cream));
  al.add(part(new BoxGeometry(1.06, 0.12, aW * 2 - 0.26), M.wood, [6.83, 0.48, 0]));            // raised floor board
  al.add(merge([
    // head, sill and posts share one x-depth and one z-extent so the frame mitres cleanly
    { geo: new BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, aH, 0] },                    // otoshigake
    { geo: new BoxGeometry(0.36, 0.34, aW * 2 + 0.36), pos: [6.26, 0.55, 0] },                  // sill
    { geo: new BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, -aW] },                    // posts
    { geo: new BoxGeometry(0.36, aH - 0.89, 0.36), pos: [6.26, aMid, aW] }
  ], M.beam));

  // hanging painting: mounted paper, sumi mountain, vermilion sun.
  // dy/kz re-hang it inside the new opening; the geometry itself is untouched
  const dy = aMid - 1.80;
  al.add(part(new BoxGeometry(0.07, 1.62, 2.0), M.woodDark, [7.24, 1.9 + dy, 0.1 * kz]));
  al.add(part(new BoxGeometry(0.04, 1.4, 1.78), M.paper, [7.19, 1.9 + dy, 0.1 * kz], null, 0));
  al.add(part(new ConeGeometry(0.58, 0.72, 4), M.mtnNear, [7.06, 1.62 + dy, 0.16 * kz], [0, Math.PI / 4, 0]));
  al.add(part(new ConeGeometry(0.34, 0.44, 4), M.mtnFar, [7.06, 1.48 + dy, 0.82 * kz], [0, Math.PI / 4, 0]));
  al.add(part(new CircleGeometry(0.2, 12), M.verm, [7.15, 2.3 + dy, -0.42 * kz], [0, -Math.PI / 2, 0]));

  // vase and single bloom on the alcove floor
  al.add(part(new CylinderGeometry(0.16, 0.22, 0.5, 10), M.clay, [6.85, 0.79, -1.0 * kz]));
  al.add(part(new CylinderGeometry(0.02, 0.02, 0.5, 5), M.leafDark, [6.85, 1.04, -1.0 * kz], null, 0));
  al.add(part(new SphereGeometry(0.13, 8, 6), new MeshLambertMaterial({ color: P.petal }), [6.85, 1.16, -1.0 * kz]));
  g.add(al);

  // writing desk: the ledger
  const desk = new Group();
  desk.add(part(new BoxGeometry(1.9, 0.14, 1.0), M.woodDark, [0, 0.5, 0], null, 1.02));
  desk.add(merge([-0.78, 0.78].map(x => ({ geo: new BoxGeometry(0.16, 0.5, 0.85), pos: [x, 0.25, 0] })), M.wood));
  desk.add(part(new BoxGeometry(0.72, 0.1, 0.52), M.paper, [-0.2, 0.62, 0.05], [0, 0.12, 0], 1.03));
  desk.add(part(new BoxGeometry(0.78, 0.06, 0.56), M.wall, [-0.2, 0.68, 0.05], [0, 0.12, 0], 1.03));
  desk.add(part(new CylinderGeometry(0.02, 0.025, 0.42, 6), M.trunk, [0.45, 0.62, -0.1], [0.1, 0, 1.35]));
  desk.add(part(new CylinderGeometry(0.13, 0.15, 0.12, 10), M.clay, [0.6, 0.62, 0.22]));
  desk.position.set(-4.14, 0.56, 2.14);
  desk.rotation.y = 1.57;
  desk.userData.dynamic = true;   // exempt from the static collapse
  g.add(desk);

  // bonsai on a stand, right side
  const b = new Group();
  b.add(part(new BoxGeometry(0.9, 0.7, 0.9), M.wood, [0, 0.35, 0], null, 1.02));
  b.add(part(new CylinderGeometry(0.28, 0.34, 0.26, 10), M.cream, [0, 0.83, 0]));
  b.add(part(new CylinderGeometry(0.06, 0.1, 0.6, 6), M.trunk, [0, 1.2, 0], [0, 0, 0.25]));
  b.add(merge([
    { geo: new SphereGeometry(0.42, 10, 7), pos: [0.18, 1.6, 0] },
    { geo: new SphereGeometry(0.3, 9, 7), pos: [-0.35, 1.42, 0.1] }
  ], M.leafDark));
  b.position.set(5.3, 0.36, 4.3);
  g.add(b);
  return g;
}
