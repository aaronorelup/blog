// The sky: a dome with a vertical gradient (vertex colours, no texture), repainted from the palette by tintSky, and
// puffy clouds, clustered spheres merged per cloud and unlit so they stay paper-white by day.
import { BackSide, Color, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
import { P } from '../palette.js';

// The dome and the clouds, for the scene's root.
export function buildSky(s, { reg, merge }) {
  const geo = s.skyGeo = new SphereGeometry(180, 20, 14);
  geo.setAttribute('color', new Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
  tintSky(s);
  return [new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false })), buildClouds({ reg, merge })];
}

export function tintSky(s) {
  const pos = s.skyGeo.attributes.position, col = s.skyGeo.attributes.color;
  const top = new Color(P.skyTop), low = new Color(P.skyLow), c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const y = Math.max(0, Math.min(1, (pos.getY(i) / 180) * 0.5 + 0.5));
    c.copy(low).lerp(top, Math.pow(y, 0.7));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}

function buildClouds({ reg, merge }) {
  const g = new Group();
  const body = new MeshBasicMaterial({ color: P.cloud });
  const shade = new MeshBasicMaterial({ color: P.cloudLow });
  reg.push({ mat: body, key: 'cloud', prop: 'color' }, { mat: shade, key: 'cloudLow', prop: 'color' });
  // ring of separated puffs, far enough back to sit in the sky rather than crowd the frame
  const specs = [
    [-70, 26, -125, 2.4], [58, 30, -140, 2.8], [-16, 48, -175, 3.0],
    [-115, 40, -95, 2.6], [110, 46, -120, 2.7], [8, 62, -200, 3.2],
    [135, 28, -55, 2.2], [-145, 42, 40, 2.5], [40, 32, 130, 2.3],
    [-60, 46, 150, 2.6], [155, 34, 95, 2.2],
    // low bank due west, sitting in the strip of sky the ledger window frames
    [-104, 13, -14, 2.1], [-118, 15, 26, 2.4], [-92, 11, 44, 1.9],
    [-132, 17, -46, 2.5], [-88, 12, -52, 2.0], [-124, 12, 62, 2.2]
  ];
  const tops = [], unders = [];
  specs.forEach(([x, y, z, s], n) => {
    const puffs = [[0, 0, 0, 1], [1.5, -0.25, 0.2, 0.78], [-1.55, -0.3, -0.15, 0.72],
                   [0.7, 0.55, -0.3, 0.66], [-0.75, 0.4, 0.3, 0.6], [2.6, -0.5, 0, 0.5], [-2.7, -0.45, 0.1, 0.46]];
    puffs.forEach(([px, py, pz, ps], i) => {
      const r = ps * s * 3.2;
      const pos = [x + px * s * 3.1, y + py * s * 2.4 + Math.sin(n) * 1.2, z + pz * s * 3.1];
      tops.push({ geo: new SphereGeometry(r, 9, 7), pos });
      if (i < 3) unders.push({ geo: new SphereGeometry(r * 0.82, 8, 6), pos: [pos[0], pos[1] - r * 0.5, pos[2]] });
    });
  });
  g.add(merge(unders, shade, 0));
  g.add(merge(tops, body, 0));
  return g;
}
