// Stand-in models for the tea room hero (node scripts/tools/tea-hero/standins.mjs): an angel built from primitives
// with rig-convention part nodes (hips, chest, head, upperarm.L, wing.L...), a lantern prop, and a CRT television
// with a node named "screen". Written as small GLBs to public/tea/hero/standin-*.glb; the final TRELLIS assets
// replace them through the manifest. Exercises the real loader path: named nodes, props, material overrides.
import { writeFileSync } from 'node:fs';
import * as T from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const OUT = new URL('../../../public/tea/hero/', import.meta.url);

// GLTFExporter reads its blobs through FileReader, which Node lacks.
globalThis.FileReader = class {
  readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onloadend?.(); }); }
  readAsDataURL(b) {
    b.arrayBuffer().then((r) => {
      this.result = `data:${b.type || 'application/octet-stream'};base64,${Buffer.from(r).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const mat = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...o });
const node = (name, parent, pos = [0, 0, 0]) => {
  const g = new T.Group();
  g.name = name;
  g.position.fromArray(pos);
  parent.add(g);
  return g;
};
const mesh = (name, geo, m, parent, pos = [0, 0, 0], rot = [0, 0, 0]) => {
  const x = new T.Mesh(geo, m);
  x.name = name;
  x.position.fromArray(pos);
  x.rotation.set(...rot);
  parent.add(x);
  return x;
};
const lathe = (pts, seg = 28) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r, y)), seg);

// ---------- the angel (stand-in for Yusef): about 1.75 units tall, feet at y = 0, facing +z ----------
function angel() {
  const robe = mat('#E9E1CF');
  const robeShade = mat('#CFC4AE');
  const gold = mat('#B8913A', { metalness: 0.6, roughness: 0.4 });
  const skin = mat('#E8C9B0');
  const hair = mat('#6B5A48');
  const feather = mat('#EEE8DA', { side: T.DoubleSide, roughness: 0.9 });
  const root = new T.Group();
  root.name = 'yusef';
  const hips = node('hips', root, [0, 0.98, 0]);
  // the robe falls from the hips, flared and a little ragged at the hem
  mesh('robe', lathe([[0.001, -0.96], [0.36, -0.96], [0.34, -0.9], [0.27, -0.55], [0.2, -0.15], [0.17, 0.05], [0.001, 0.08]]), robe, hips);
  mesh('robe.trim', new T.TorusGeometry(0.35, 0.018, 6, 40), gold, hips, [0, -0.93, 0], [Math.PI / 2, 0, 0]);
  const spine = node('spine', hips, [0, 0.06, 0]);
  const chest = node('chest', spine, [0, 0.22, 0]);
  mesh('torso', lathe([[0.001, -0.24], [0.17, -0.22], [0.2, -0.02], [0.19, 0.14], [0.13, 0.22], [0.001, 0.24]]), robe, chest);
  mesh('sash', new T.TorusGeometry(0.175, 0.025, 6, 32), gold, chest, [0, -0.17, 0], [Math.PI / 2, 0, 0]);
  mesh('stole', new T.BoxGeometry(0.06, 0.5, 0.02), mat('#8E2B2B'), chest, [0.07, -0.12, 0.18], [0.12, 0, 0.05]);
  const neck = node('neck', chest, [0, 0.25, 0]);
  mesh('neck', new T.CylinderGeometry(0.05, 0.06, 0.08, 12), skin, neck, [0, 0.03, 0]);
  const head = node('head', neck, [0, 0.07, 0]);
  mesh('face', new T.SphereGeometry(0.115, 24, 18), skin, head, [0, 0.11, 0]);
  mesh('hair', new T.SphereGeometry(0.125, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), hair, head, [0, 0.125, -0.012]);
  mesh('halo', new T.TorusGeometry(0.16, 0.012, 8, 48), gold, head, [0, 0.3, -0.1], [Math.PI / 2.3, 0, 0]);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? 1 : -1;
    const up = node(`upperarm.${side}`, chest, [0.2 * s, 0.13, 0]);
    up.rotation.z = 0.18 * s;
    mesh('sleeve', lathe([[0.001, 0], [0.06, -0.02], [0.075, -0.26], [0.001, -0.27]], 14), robe, up);
    const fore = node(`forearm.${side}`, up, [0, -0.27, 0]);
    fore.rotation.x = -0.5;
    mesh('cuff', lathe([[0.001, 0], [0.07, -0.02], [0.1, -0.24], [0.001, -0.25]], 14), robeShade, fore);
    const hand = node(`hand.${side}`, fore, [0, -0.27, 0]);
    mesh('palm', new T.SphereGeometry(0.045, 12, 10), skin, hand);
    // wings: a fan of long feathers from a root at the shoulder blade, folded back
    const wing = node(`wing.${side}`, chest, [0.08 * s, 0.1, -0.15]);
    wing.rotation.set(0.2, -0.5 * s, 0.25 * s);
    for (let i = 0; i < 9; i++) {
      const len = 0.55 + i * 0.07;
      const shape = new T.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.06, len * 0.5, 0.012, len);
      shape.quadraticCurveTo(-0.05, len * 0.55, 0, 0);
      const f = mesh(`feather.${i}`, new T.ShapeGeometry(shape, 6), i % 2 ? feather : robeShade, wing);
      f.rotation.set(0, Math.PI / 2 * s, (-0.15 - i * 0.16) * s);
      f.position.set(0.02 * i * s, 0.01 * i, -0.01 * i);
    }
  }
  return root;
}

// ---------- the lantern prop: hangs from its ring (origin), glass glowing ----------
function lantern() {
  const iron = mat('#2A231E', { metalness: 0.5, roughness: 0.5 });
  const glass = mat('#FFD892', { emissive: new T.Color('#FFB54A'), emissiveIntensity: 2.2, roughness: 0.3 });
  const root = new T.Group();
  root.name = 'lantern';
  mesh('ring', new T.TorusGeometry(0.035, 0.008, 6, 20), iron, root, [0, -0.035, 0]);
  mesh('cap', new T.ConeGeometry(0.09, 0.07, 6), iron, root, [0, -0.1, 0]);
  mesh('glass', new T.CylinderGeometry(0.065, 0.065, 0.16, 6), glass, root, [0, -0.215, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    mesh('bar', new T.BoxGeometry(0.012, 0.17, 0.012), iron, root, [Math.cos(a) * 0.067, -0.215, Math.sin(a) * 0.067]);
  }
  mesh('base', new T.CylinderGeometry(0.08, 0.06, 0.03, 6), iron, root, [0, -0.31, 0]);
  return root;
}

// ---------- the television: about 1 unit wide, origin at the bottom of its legs, screen facing +z ----------
function television() {
  const wood = mat('#5A3622', { roughness: 0.6 });
  const cream = mat('#E8DCC2', { roughness: 0.55 });
  const dark = mat('#17151A', { roughness: 0.4 });
  const brass = mat('#C9A227', { metalness: 0.7, roughness: 0.35 });
  const root = new T.Group();
  root.name = 'tv';
  const body = node('body', root, [0, 0.62, 0]);
  mesh('cabinet', new RoundedBoxGeometry(1.0, 0.76, 0.78, 2, 0.07), wood, body);
  mesh('bezel', new RoundedBoxGeometry(0.7, 0.58, 0.06, 2, 0.05), cream, body, [-0.11, 0, 0.38]);
  mesh('tube', new T.BoxGeometry(0.6, 0.48, 0.02), dark, body, [-0.11, 0, 0.405]);
  // the screen: a plane bulged like glass, its own node so the runtime can swap its material
  const g = new T.PlaneGeometry(0.56, 0.44, 16, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / 0.28, y = p.getY(i) / 0.22;
    p.setZ(i, 0.025 * (1 - 0.5 * (x * x + y * y)));
  }
  g.computeVertexNormals();
  mesh('screen', g, mat('#0A0C12'), body, [-0.11, 0, 0.42]);
  mesh('panel', new RoundedBoxGeometry(0.2, 0.58, 0.04, 2, 0.03), cream, body, [0.37, 0, 0.38]);
  for (const [i, y] of [[1, 0.14], [2, -0.04]]) {
    mesh(`knob.${i}`, new T.CylinderGeometry(0.045, 0.05, 0.05, 20), brass, body, [0.37, y, 0.42], [Math.PI / 2, 0, 0]);
  }
  for (let i = 0; i < 5; i++) mesh('grille', new T.BoxGeometry(0.12, 0.012, 0.01), dark, body, [0.37, -0.16 - i * 0.026, 0.405]);
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const ant = node(`antenna.${side}`, body, [0.05 * s, 0.38, -0.05]);
    ant.rotation.z = -0.45 * s;
    mesh('rod', new T.CylinderGeometry(0.008, 0.01, 0.62, 8), brass, ant, [0, 0.31, 0]);
    mesh('tip', new T.SphereGeometry(0.02, 10, 8), brass, ant, [0, 0.63, 0]);
  }
  mesh('antenna.base', new T.SphereGeometry(0.06, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), dark, body, [0, 0.38, -0.05]);
  for (const [x, z] of [[-0.4, 0.28], [0.4, 0.28], [-0.4, -0.28], [0.4, -0.28]]) {
    mesh('leg', new T.CylinderGeometry(0.025, 0.015, 0.24, 8), wood, root, [x, 0.12, z], [z * 0.3, 0, -x * 0.25]);
  }
  return root;
}

// No textures anywhere, so only the screen keeps its UVs (its shader reads them); geometry merged to indexed form.
function slim(root) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name !== 'screen') o.geometry.deleteAttribute('uv');
    o.geometry = mergeVertices(o.geometry, 1e-4);
  });
  return root;
}

const exporter = new GLTFExporter();
for (const [name, build] of [['standin-angel', angel], ['standin-lantern', lantern], ['standin-tv', television]]) {
  const glb = await exporter.parseAsync(slim(build()), { binary: true });
  writeFileSync(new URL(name + '.glb', OUT), Buffer.from(glb));
  console.log(name + '.glb', glb.byteLength, 'bytes');
}
