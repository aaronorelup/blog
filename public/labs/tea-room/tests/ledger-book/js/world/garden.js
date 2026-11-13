// The garden and the court (copied whole from src/scripts/home/scene/world/garden.js): stepping stones, mounds, every
// tree, the stone lanterns, the torii at the garden's mouth, the walled court on the west, the neighbours' roofs
// beyond it, and the hills. One bucket per material, merged: the garden stays where it is while the house lifts.
import {
  BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, Group, MeshBasicMaterial, SphereGeometry,
} from '../../vendor/three.module.min.js';
import { P } from './palette.js';

export function buildGarden({ M, reg, merge }) {
  const g = new Group();

  // one bucket per material for the whole garden + court, so each becomes a single
  // merged fill + a single ink shell rather than a draw call per prop
  const stone = [], grassDark = [], trunk = [], petal = [], leaf = [],
        verm = [], cream = [], roof = [], ridge = [], beam = [];

  for (let i = 0; i < 9; i++) {
    stone.push({ geo: new CylinderGeometry(0.55, 0.55, 0.14, 8), pos: [Math.sin(i * 0.8) * 0.5, 0.06, 6.5 + i * 1.9], rot: [0, i * 0.4, 0] });
  }
  for (let i = 0; i < 7; i++) {
    const a = i * 1.4, r = 6 + (i % 3) * 2.2;
    let mx = Math.cos(a) * r * 1.3, mz = 8 + Math.sin(a) * r;
    if (Math.abs(mx) < 9 && mz < 8) mz = 8 + Math.abs(mz - 8);   // never inside the house
    grassDark.push({ geo: new SphereGeometry(1.1 + (i % 2) * 0.5, 10, 7), pos: [mx, -0.5, mz] });
  }

  // every tree in the scene: front garden sakura, one green tree, five in the court
  const sakura = [
    treeSpec(-5.4, 10.5, 1.0), treeSpec(5.8, 13.0, 1.2),
    treeSpec(-14.4, 6.6, 1.3), treeSpec(-16.8, -1.6, 1.15),
    treeSpec(-10.6, -9.4, 1.05), treeSpec(-16.0, 11.0, 1.2),
    treeSpec(-11.4, 12.6, 1.0)
  ];
  const green = treeSpec(-8.5, 17.5, 0.9);
  sakura.forEach(t => { trunk.push(...t.wood); petal.push(...t.leaves); });
  trunk.push(...green.wood);
  leaf.push(...green.leaves);

  // two stone lanterns, offsets baked in so they share the stone bucket
  const lantern = (x, z, s) => {
    stone.push({ geo: new CylinderGeometry(0.26 * s, 0.34 * s, 0.9 * s, 7), pos: [x, 0.45 * s, z] });
    stone.push({ geo: new BoxGeometry(0.7 * s, 0.5 * s, 0.7 * s), pos: [x, 1.15 * s, z] });
    stone.push({ geo: new ConeGeometry(0.72 * s, 0.42 * s, 4), pos: [x, 1.6 * s, z], rot: [0, Math.PI / 4, 0] });
  };
  lantern(3.2, 8.2, 1);
  lantern(-9.6, 5.4, 0.88);

  // torii at the garden mouth
  verm.push(
    { geo: new CylinderGeometry(0.22, 0.27, 4.6, 10), pos: [-2.4, 2.3, 22] },
    { geo: new CylinderGeometry(0.22, 0.27, 4.6, 10), pos: [2.4, 2.3, 22] },
    { geo: new BoxGeometry(6.4, 0.34, 0.5), pos: [0, 4.5, 22] },
    { geo: new BoxGeometry(7.2, 0.3, 0.62), pos: [0, 4.95, 22], rot: [0, 0, 0.02] }
  );

  // walled court on the west side — what you see through the ledger window
  const wallH = 2.7, wx = -20.5;
  for (let z = -20; z <= 20; z += 4) {
    cream.push({ geo: new BoxGeometry(0.34, wallH, 4.0), pos: [wx, wallH / 2, z] });
    roof.push({ geo: new BoxGeometry(0.72, 0.2, 4.06), pos: [wx, wallH + 0.1, z] });
    roof.push({ geo: new BoxGeometry(0.62, 0.16, 0.24), pos: [wx, wallH + 0.28, z - 1.9] });
  }
  for (let i = 0; i < 4; i++) {   // returns, so the court reads as enclosed
    [-22, 22].forEach(z => {
      cream.push({ geo: new BoxGeometry(4.0, wallH, 0.34), pos: [wx + 2 + i * 4, wallH / 2, z] });
      roof.push({ geo: new BoxGeometry(4.06, 0.2, 0.72), pos: [wx + 2 + i * 4, wallH + 0.1, z] });
    });
  }
  // the court gate stands clear of the wall face instead of intersecting it
  const gx = wx + 0.62;
  beam.push(
    { geo: new BoxGeometry(0.5, 3.3, 0.5), pos: [gx, 1.65, -9.6] },
    { geo: new BoxGeometry(0.5, 3.3, 0.5), pos: [gx, 1.65, -6.4] },
    { geo: new BoxGeometry(0.62, 0.3, 3.9), pos: [gx, 3.35, -8.0] }
  );

  // clipped shrubs along the court path
  [[-9.4, 9.6, 0.9], [-12.4, -5.0, 0.7], [-10.2, -1.8, 0.8], [-15.6, 6.4, 0.65], [-9.6, -6.6, 0.75], [-17.8, 1.0, 0.8]]
    .forEach(([x, z, r]) => grassDark.push({ geo: new SphereGeometry(r, 9, 7), pos: [x, r * 0.55, z] }));

  // neighbouring rooftops beyond the wall — mass, roof, ridge, no detail
  [[-48, -16, 8.0, 3.4, 0.5], [-56, 8, 9.5, 4.0, -0.35], [-44, 26, 7.0, 3.0, 0.2],
   [-68, -4, 11.0, 4.6, 0.15], [-62, -34, 8.5, 3.6, -0.5], [-52, 44, 8.0, 3.4, 0.4]]
    .forEach(([x, z, w, hgt, ry]) => {
      cream.push({ geo: new BoxGeometry(w, hgt, w * 0.7), pos: [x, hgt / 2, z], rot: [0, ry, 0] });
      // solid four-sided hip, so the roof never gaps or self-intersects at the ridge
      roof.push({ geo: new ConeGeometry(w * 0.86, w * 0.52, 4), pos: [x, hgt + w * 0.25, z], rot: [0, ry + Math.PI / 4, 0] });
      ridge.push({ geo: new BoxGeometry(w * 0.3, 0.3, 0.46), pos: [x, hgt + w * 0.5, z], rot: [0, ry, 0] });
    });

  g.add(merge(stone, M.stone));
  g.add(merge(grassDark, M.grassDark));
  g.add(merge(trunk, M.trunk));
  g.add(merge(petal, M.petal));
  g.add(merge(leaf, M.leaf));
  g.add(merge(verm, M.verm));
  g.add(merge(cream, M.cream));
  g.add(merge(roof, M.roof));
  g.add(merge(ridge, M.roofRidge));
  g.add(merge(beam, M.beam));

  // distant hills as painted half-discs, one merged mesh per colour
  const hills = {};
  const hill = (x, z, w, ht, key) => {
    const geo = new CircleGeometry(w, 14, 0, Math.PI);
    geo.scale(1, ht / w, 1);
    (hills[key] = hills[key] || []).push({ geo, pos: [x, 0, z] });
  };
  hill(-22, -48, 26, 12, 'hillBack');
  hill(-78, -30, 40, 18, 'hillBack');
  hill(-62, 4, 34, 14, 'hillNear');
  hill(18, -56, 32, 15, 'hillMid');
  hill(-4, 62, 40, 16, 'hillFar');
  Object.keys(hills).forEach(k => {
    const mat = new MeshBasicMaterial({ color: P[k] });
    reg.push({ mat, key: k, prop: 'color' });
    g.add(merge(hills[k], mat, 0));
  });
  return g;
}

function treeSpec(x, z, s) {
  const at = (p) => [x + p[0] * s, p[1] * s, z + p[2] * s];
  return {
    wood: [
      { geo: new CylinderGeometry(0.18, 0.42, 2.6, 7), pos: at([0, 1.3, 0]), scale: s },
      { geo: new CylinderGeometry(0.1, 0.16, 1.4, 6), pos: at([-0.5, 2.4, 0.1]), rot: [0, 0, 0.6], scale: s }
    ],
    leaves: [
      { geo: new SphereGeometry(1.5, 12, 9), pos: at([0, 3.4, 0]), scale: s },
      { geo: new SphereGeometry(1.0, 10, 8), pos: at([-1.4, 2.9, 0.4]), scale: s },
      { geo: new SphereGeometry(0.9, 10, 8), pos: at([1.3, 3.1, -0.3]), scale: s }
    ]
  };
}
