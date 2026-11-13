// The sky (from src/scripts/home/scene/world/sky.js): a dome with a vertical gradient (vertex colours, no texture)
// and puffy clouds, clustered spheres merged per cloud and unlit. Added for this page: the stars of the same
// evening as the tea room's painted garden, fixed points that keep their places from one visit to the next.
import {
  AdditiveBlending, BackSide, BufferGeometry, CanvasTexture, CircleGeometry, Color, Float32BufferAttribute, Group, Mesh,
  MeshBasicMaterial, Points, PointsMaterial, SphereGeometry,
} from 'three';
import { P } from './palette.js';

// The dome, the clouds and the stars, for the scene's root. rnd: a seeded random, so the sky is the same each time.
export function buildSky({ reg, merge }, rnd) {
  const geo = new SphereGeometry(180, 20, 14);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const top = new Color(P.skyTop), low = new Color(P.skyLow), c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const y = Math.max(0, Math.min(1, (pos.getY(i) / 180) * 0.5 + 0.5));
    c.copy(low).lerp(top, Math.pow(y, 0.7));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new Float32BufferAttribute(col, 3));
  const dome = new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false }));
  const stars = buildStars(rnd);
  return { dome, clouds: buildClouds({ reg, merge }), stars, moon: buildMoon() };
}

// The moon, low over the hills behind the house: a flat pale disc with its outline, and a soft ring of light
// round it drawn by code. It is where the moonlight in scene.js comes from, near enough.
function buildMoon() {
  const g = new Group();
  const az = -20 * Math.PI / 180, el = 6.5 * Math.PI / 180, r = 168;
  g.position.set(Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r, -Math.cos(az) * Math.cos(el) * r);
  g.lookAt(0, 6, 0);
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 6, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.4)');
  gr.addColorStop(0.65, 'rgba(255,255,255,0.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const halo = new Mesh(new CircleGeometry(22, 40), new MeshBasicMaterial({ map: new CanvasTexture(c), color: 0x6E7FD0, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, fog: false }));
  const rim = new Mesh(new CircleGeometry(4.0, 40), new MeshBasicMaterial({ color: 0x0E1019, fog: false }));
  const disc = new Mesh(new CircleGeometry(3.75, 40), new MeshBasicMaterial({ color: 0xF4ECD2, fog: false }));
  halo.position.z = -0.4; rim.position.z = 0.2; disc.position.z = 0.4;
  g.add(halo, rim, disc);
  return g;
}

function buildStars(rnd) {
  const n = 620, pos = [], col = [];
  const warm = new Color(0xFFF0C8), cool = new Color(0xC8D4FF), c = new Color();
  for (let i = 0; i < n; i++) {
    const az = rnd() * Math.PI * 2, el = Math.asin(0.04 + rnd() * 0.93), r = 172;
    pos.push(Math.cos(az) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(az) * Math.cos(el) * r);
    const b = 0.25 + Math.pow(rnd(), 2.2) * 0.75;
    c.copy(cool).lerp(warm, rnd()).multiplyScalar(b);
    col.push(c.r, c.g, c.b);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  const mat = new PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false });
  const p = new Points(g, mat);
  p.frustumCulled = false;
  return p;
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
