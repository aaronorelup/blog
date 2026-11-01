// What every part of the world is made with: the materials (one per palette key, registered in reg so the time of
// day can repaint them, palette.js), the ink outline shell, part() (a mesh and its outline) and merge() (many props
// of one material as one mesh). The look is flat and illustrated: an outline is a back-faced shell pushed along the
// normal in world units, so the line weight stays even on walls and small props alike.
import {
  BackSide, BufferGeometry, Color, DoubleSide, Euler, Float32BufferAttribute, Group, Matrix4, Mesh, MeshBasicMaterial,
  MeshLambertMaterial, Quaternion, ShaderMaterial, Vector3,
} from 'three';
import { P } from '../palette.js';

const OUTLINE = 0.035;

export function makeKit() {
  const reg = [];
  const R = (mat, key, prop) => { reg.push({ mat, key, prop: prop || 'color' }); return mat; };
  const L = (key, o) => R(new MeshLambertMaterial({ color: P[key], ...o }), key);
  const B = (key, o) => R(new MeshBasicMaterial({ color: P[key], ...o }), key);
  const ink = new ShaderMaterial({
    side: BackSide,
    uniforms: { uW: { value: OUTLINE }, uC: { value: new Color(P.ink) } },
    vertexShader: 'uniform float uW;\nvoid main(){ vec3 p = position + normalize(normal) * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
    fragmentShader: 'uniform vec3 uC;\nvoid main(){ gl_FragColor = vec4(uC,1.0); }',
  });

  const M = {
    grass: L('grass'), grassDark: L('grassDark'), leaf: L('leaf'), leafDark: L('leafDark'),
    trunk: L('trunk'), stone: L('stone'), wood: L('wood'), woodDark: L('woodDark'),
    beam: L('beam'), wall: L('wall'), wallDeep: L('wallDeep'),
    // paper is translucent: DoubleSide lets it take light from either face, and the warm
    // emissive (night only) stands in for lamplight scattering through from inside
    shoji: R(L('shoji', { side: DoubleSide, emissive: P.shojiEmis }), 'shojiEmis', 'emissive'),
    shojiLit: R(L('shojiLit', { side: DoubleSide, emissive: P.shojiLitEmis }), 'shojiLitEmis', 'emissive'),
    tatami: L('tatami'),
    lampPaper: B('lampPaper'), lampGlow: B('lampGlow'), flame: B('flame'),
    clay: L('clay'), tea: B('tea'), verm: L('vermilion'), paper: L('paper'), cream: L('cream'), petal: L('petal'),
    roof: L('roof'), roofRidge: L('roofRidge'),
    cushion: L('cushion'), tataki: L('tataki'), mtnNear: L('mtnNear'), mtnFar: L('mtnFar'),
  };

  // The shell is pushed along the vertex normal, and a box corner has three different
  // normals at the same point — so the shell tears open there. Welding coincident
  // vertices to one averaged normal sends the corner out along its diagonal instead,
  // and the three outline faces stay joined.
  const hullGeo = (geo) => {
    if (geo.userData.hull) return geo.userData.hull;
    const h = geo.index ? geo.toNonIndexed() : geo.clone();
    const pa = h.attributes.position, na = h.attributes.normal;
    if (!na) { geo.userData.hull = h; return h; }
    const bins = new Map();
    for (let i = 0; i < pa.count; i++) {
      const k = Math.round(pa.getX(i) * 2048) + ',' + Math.round(pa.getY(i) * 2048) + ',' + Math.round(pa.getZ(i) * 2048);
      let b = bins.get(k);
      if (!b) { b = { x: 0, y: 0, z: 0, at: [] }; bins.set(k, b); }
      b.x += na.getX(i); b.y += na.getY(i); b.z += na.getZ(i); b.at.push(i);
    }
    bins.forEach(b => {
      const len = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
      if (len < 1e-4) return;                       // opposed faces cancel: leave them be
      b.at.forEach(i => na.setXYZ(i, b.x / len, b.y / len, b.z / len));
    });
    na.needsUpdate = true;
    geo.userData.hull = h;
    return h;
  };

  // part(): mesh + backfaced expanded shell = the confident outline
  const part = (geo, material, pos, rot, noOutline) => {
    const g = new Group();
    g.add(new Mesh(geo, material));
    if (noOutline !== 0) g.add(new Mesh(hullGeo(geo), ink));
    if (pos) g.position.set(pos[0], pos[1], pos[2]);
    if (rot) g.rotation.set(rot[0], rot[1], rot[2]);
    return g;
  };

  // hand-rolled static merge: keeps repeated props (stones, mullions) to one draw call
  const merge = (items, material, noOutline) => {
    const m4 = new Matrix4(), q = new Quaternion(), e = new Euler();
    let pos = [], nor = [];
    items.forEach(it => {
      const g = (it.geo.index ? it.geo.toNonIndexed() : it.geo.clone());
      const p = it.pos || [0, 0, 0], r = it.rot || [0, 0, 0], s = it.scale || 1;
      e.set(r[0], r[1], r[2]);
      m4.compose(new Vector3(p[0], p[1], p[2]), q.setFromEuler(e), new Vector3(s, s, s));
      g.applyMatrix4(m4);
      pos = pos.concat(Array.from(g.attributes.position.array));
      nor = nor.concat(Array.from(g.attributes.normal.array));
      g.dispose();
      if (!it.geo.userData.hull) it.geo.dispose();
    });
    const out = new BufferGeometry();
    out.setAttribute('position', new Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    const grp = new Group();
    grp.add(new Mesh(out, material));
    if (noOutline !== 0) grp.add(new Mesh(hullGeo(out), ink));
    return grp;
  };

  return { M, reg, ink, part, merge };
}
