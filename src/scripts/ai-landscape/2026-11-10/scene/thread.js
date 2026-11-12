// The ink thread (SPEC 3.4): one request, travelling. A thin tube along a path, drawn over the glass so it is
// never lost, with a round head. Ink on a light ground, paper on a dark one. A section sets the path and how
// far the head has got every frame, and reads thread.pos to pin its chip. createThread makes more than one.
import { Color, CylinderGeometry, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three';

const INK = new Color('#0C0D10');
const PAPER = new Color('#F8F9FB');
const UP = new Vector3(0, 1, 0);

export function createThread(ctx, { max = 48, radius = 0.017 } = {}) {
  const geo = new CylinderGeometry(radius, radius, 1, 8, 1, false).translate(0, 0.5, 0);
  const mat = new MeshBasicMaterial({ color: INK.clone(), depthTest: false, transparent: true, toneMapped: false });
  const tube = new InstancedMesh(geo, mat, max);
  tube.renderOrder = 19; tube.frustumCulled = false; tube.count = 0;
  const headMat = new MeshBasicMaterial({ color: INK.clone(), depthTest: false, transparent: true, toneMapped: false });
  const ringMat = new MeshBasicMaterial({ color: PAPER.clone(), depthTest: false, transparent: true, toneMapped: false });
  const head = new Mesh(new SphereGeometry(0.075, 20, 14), headMat);
  const ring = new Mesh(new SphereGeometry(0.108, 20, 14), ringMat);
  head.renderOrder = 21; ring.renderOrder = 20;
  head.visible = false; ring.visible = false;
  ctx.scene.add(tube, ring, head);
  const dummy = new Object3D();
  const dir = new Vector3();
  const a = new Vector3();
  const b = new Vector3();

  const thread = {
    points: [],            // Vector3 list: the whole path
    from: 0, head: 0,      // the drawn part, as fractions of its length
    show: 0,               // 0 hidden .. 1
    dark: 0,               // 0 ink .. 1 paper (set from the room: lights out, a dark world)
    pos: new Vector3(),    // where the head is, for labels.pin
    length: 0,
    reset() { thread.show = 0; thread.from = 0; },
    // A straight drop through a tower: from `above` its lid to the centre of floor `to`, through every floor between.
    through(tower, to = 8, above = 1.0) {
      const pts = [tower.topPoint(new Vector3(), above)];
      for (let i = 0; i <= to; i++) pts.push(tower.point(i));
      thread.points = pts;
      return pts;
    },
    // Put the head at point index `f` of the path (2.5 is half way from the third point to the fourth).
    at(f) {
      const pts = thread.points;
      let total = 0;
      let upTo = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const l = pts[i].distanceTo(pts[i + 1]);
        upTo += l * Math.max(0, Math.min(1, f - i));
        total += l;
      }
      thread.head = total ? upTo / total : 0;
    },
    update() {
      const pts = thread.points;
      const on = thread.show > 0.01 && pts.length > 1;
      tube.visible = on; head.visible = on; ring.visible = on;
      if (!on) return;
      let total = 0;
      const lens = [];
      for (let i = 0; i < pts.length - 1; i++) { const l = pts[i].distanceTo(pts[i + 1]); lens.push(l); total += l; }
      thread.length = total;
      const start = Math.max(0, Math.min(1, thread.from)) * total;
      const end = Math.max(0, Math.min(1, thread.head)) * total;
      let at = 0;
      let n = 0;
      thread.pos.copy(pts[0]);
      for (let i = 0; i < lens.length && n < max; i++) {
        const s0 = at, s1 = at + lens[i];
        at = s1;
        if (s1 <= start || s0 >= end || lens[i] < 1e-5) continue;
        const u0 = Math.max(0, (start - s0) / lens[i]), u1 = Math.min(1, (end - s0) / lens[i]);
        a.lerpVectors(pts[i], pts[i + 1], u0); b.lerpVectors(pts[i], pts[i + 1], u1);
        dir.subVectors(b, a);
        const len = dir.length();
        if (len < 1e-5) continue;
        dummy.position.copy(a);
        dummy.quaternion.setFromUnitVectors(UP, dir.normalize());
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix();
        tube.setMatrixAt(n++, dummy.matrix);
        thread.pos.copy(b);
      }
      tube.count = n;
      tube.instanceMatrix.needsUpdate = true;
      mat.color.copy(INK).lerp(PAPER, thread.dark); mat.opacity = thread.show;
      headMat.color.copy(mat.color); headMat.opacity = thread.show;
      ringMat.color.copy(PAPER).lerp(INK, thread.dark); ringMat.opacity = thread.show * 0.92;
      head.position.copy(thread.pos); ring.position.copy(thread.pos);
    },
    dispose() { ctx.scene.remove(tube, head, ring); geo.dispose(); mat.dispose(); headMat.dispose(); ringMat.dispose(); },
  };
  return thread;
}
