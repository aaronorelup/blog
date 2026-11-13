// The cherry petals (from src/scripts/home/scene/world/petals.js): one instanced mesh falling through the garden,
// never through the house. Their places come from a seeded random, so the same moment always shows the same petals.
import { CircleGeometry, DoubleSide, DynamicDrawUsage, InstancedMesh, MeshBasicMaterial, Object3D } from '../../vendor/three.module.min.js';
import { P } from './palette.js';

export function buildPetals(rnd, max) {
  const mat = new MeshBasicMaterial({ color: P.petal, side: DoubleSide });
  mat.color.multiplyScalar(0.8);                       // by night they catch a little less light than the homepage gives them
  const mesh = new InstancedMesh(new CircleGeometry(0.05, 5), mat, max);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  mesh.frustumCulled = false;
  const seeds = [];
  for (let i = 0; i < max; i++) {
    // keep petals outdoors: they fall past the open bay, not through the ceiling
    let px = -17 + rnd() * 34, pz = -8 + rnd() * 36;
    if (Math.abs(px) < 8.6 && pz < 7.2) pz = 7.4 + rnd() * 18;
    seeds.push({
      x: px, z: pz,
      y: rnd() * 11, fall: 0.22 + rnd() * 0.3,
      sway: 0.4 + rnd() * 1.1, phase: rnd() * 6.28, spin: 0.4 + rnd() * 1.2,
    });
  }
  const d = new Object3D();
  const update = (time) => {
    for (let i = 0; i < max; i++) {
      const p = seeds[i];
      const y = 11 - ((p.y + time * p.fall * 2.2) % 11);
      d.position.set(p.x + Math.sin(time * 0.6 + p.phase) * p.sway, y, p.z + Math.cos(time * 0.4 + p.phase) * p.sway * 0.6);
      d.rotation.set(time * p.spin, time * p.spin * 0.7 + p.phase, p.phase);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return { mesh, update };
}
