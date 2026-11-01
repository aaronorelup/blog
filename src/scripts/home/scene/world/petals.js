// The cherry petals, one instanced mesh falling past the open bay (never through the ceiling). The quality tier
// sets how many fall (setPetals); with none the scene redraws only when the camera moves.
import { CircleGeometry, DoubleSide, DynamicDrawUsage, InstancedMesh, MeshBasicMaterial, Object3D } from 'three';
import { P } from '../palette.js';

export function buildPetals(s, { reg }) {
  const max = s.petalMax = innerWidth < 640 ? 70 : 240;
  s.petalCount = max;
  const mat = new MeshBasicMaterial({ color: P.petal, side: DoubleSide });
  reg.push({ mat, key: 'petal', prop: 'color' });
  const mesh = s.petalMesh = new InstancedMesh(new CircleGeometry(0.05, 5), mat, max);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  mesh.frustumCulled = false;
  s.petalSeeds = [];
  for (let i = 0; i < max; i++) {
    // keep petals outdoors — they fall past the open bay, not through the ceiling
    let px = -15 + Math.random() * 30, pz = -6 + Math.random() * 32;
    if (Math.abs(px) < 7.5 && pz < 6) pz = 6.5 + Math.random() * 18;
    s.petalSeeds.push({
      x: px, z: pz,
      y: Math.random() * 11, fall: 0.22 + Math.random() * 0.3,
      sway: 0.4 + Math.random() * 1.1, phase: Math.random() * 6.28, spin: 0.4 + Math.random() * 1.2,
    });
  }
  s.petalDummy = new Object3D();
  return mesh;
}

// f of the most, 0 to 1.
export function setPetals(s, f) {
  const n = Math.max(0, Math.round(s.petalMax * f));
  s.petalCount = n;
  s.petalMesh.count = n;
  s.petalMesh.visible = n > 0;
}

export function updatePetals(s, time) {
  const d = s.petalDummy, mesh = s.petalMesh;
  for (let i = 0; i < s.petalCount; i++) {
    const p = s.petalSeeds[i];
    const y = 11 - ((p.y + time * p.fall * 2.2) % 11);
    d.position.set(p.x + Math.sin(time * 0.6 + p.phase) * p.sway, y, p.z + Math.cos(time * 0.4 + p.phase) * p.sway * 0.6);
    d.rotation.set(time * p.spin, time * p.spin * 0.7 + p.phase, p.phase);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
