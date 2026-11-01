// Everything in this scene is static, so it collapses to one mesh per material: all the ink outline shells end up
// as a single draw call. Anything marked userData.dynamic (the andon, its light, the desk) and the sky dome stay.
import { BufferGeometry, Float32BufferAttribute, Matrix3, Mesh, Vector3 } from 'three';

export function optimizeStatics(root) {
  const groups = new Map(), doomed = [];
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const g = o.geometry;
    if (!g || !g.attributes.position || g.attributes.color) return;   // leave the sky dome alone
    for (let a = o; a; a = a.parent) if (a.userData && a.userData.dynamic) return;   // things that still move
    const key = o.material.uuid;
    if (!groups.has(key)) groups.set(key, { material: o.material, meshes: [] });
    groups.get(key).meshes.push(o);
  });
  groups.forEach(({ material, meshes }) => {
    if (meshes.length < 2) return;
    let pos = [], nor = [];
    const nm = new Matrix3();
    meshes.forEach(m => {
      const src = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
      const p = src.attributes.position, n = src.attributes.normal;
      nm.getNormalMatrix(m.matrixWorld);
      const v = new Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        pos.push(v.x, v.y, v.z);
        v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize();
        nor.push(v.x, v.y, v.z);
      }
      if (src !== m.geometry) src.dispose();
      doomed.push(m);
    });
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    const merged = new Mesh(geo, material);
    merged.frustumCulled = false;   // one mesh spans the whole set, so culling it is all-or-nothing
    root.add(merged);
  });
  doomed.forEach(m => { if (m.parent) m.parent.remove(m); m.geometry.dispose(); });
}
