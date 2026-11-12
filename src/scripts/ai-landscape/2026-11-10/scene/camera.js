// The camera rig (SPEC 4.2): named stops, the dolly zoom, the mouse orbit with its deliberate weight, the
// push-in on a floor, and the phone framing. A section calls rig.to() or rig.mix() every frame with the stop it
// wants. The rig adds the pointer, eases, and frames. Lens 24 degrees everywhere except the poster (5).
import { PerspectiveCamera, Vector3 } from 'three';
import { easeIO, lerp } from '../core/clock.js';

const RAD = Math.PI / 180;
// Positions are world units. `fit` is a width that must stay in frame: on a narrow screen the camera backs off.
// `cy` is where the subject's centre sits on a phone, as a fraction of the height from the top.
export const STOPS = {
  poster: { pos: [0, 164, 0.6], look: [0, 0, 0], fov: 5, fit: 13.5, cy: 0.5 },
  quarter: { pos: [-6, 7.5, 27], look: [0, 1.4, 0], fov: 24, fit: 23, cy: 0.3 },
  row: { pos: [-0.5, 2.2, 31], look: [-0.5, 1.9, 0], fov: 24, fit: 24.4, cy: 0.25 },
  specimen1: { pos: [-5, 6.5, 12], look: [0, 4.2, 0], fov: 24 },
  specimen2: { pos: [6.5, 2.6, 10], look: [0, 2.6, 0], fov: 24 },
  specimen3: { pos: [-6, 0.6, 15], look: [0, 1.2, 0], fov: 24 },
  bench: { pos: [0, 3.4, 22], look: [0, 1.6, 0], fov: 24, fit: 14, cy: 0.4 },
};

export function createRig(ctx) {
  const camera = new PerspectiveCamera(24, 1, 0.5, 700);
  const want = { pos: new Vector3(0, 2.2, 31), look: new Vector3(0, 1.9, 0), fov: 24, fit: 0, cx: 0.5, cy: 0.5 };
  const cur = { pos: want.pos.clone(), look: want.look.clone(), fov: 24, dist: 1, cx: 0.5, cy: 0.5 };
  const off = new Vector3(), right = new Vector3(), a = new Vector3(), b = new Vector3();
  const UP = new Vector3(0, 1, 0);
  const size = { w: 1, h: 1 };
  let first = true;
  let t = 0;

  const read = (stop, out) => {
    out.pos.set(...stop.pos); out.look.set(...stop.look);
    out.fov = stop.fov || 24; out.fit = stop.fit || 0; out.cx = stop.cx ?? 0.5;
    out.cy = ctx.phone ? stop.cy ?? 0.5 : 0.5;                    // only a phone moves the subject up, to leave room for the sheet
    return out;
  };
  const A = { pos: new Vector3(), look: new Vector3() }, B = { pos: new Vector3(), look: new Vector3() };

  const rig = {
    camera, stops: STOPS, cur,
    yaw: 0.06, pitch: 0.025,                    // how far the pointer may swing it, in radians
    push: null,                                 // { point: Vector3, k: 0..1 } while a floor is pushed in on
    phone: ctx.phone,

    // The two stops of a world for a stack at x. On a phone the stack is centred in the top 55 percent.
    world(x, kind) {
      const open = kind === 'open';
      // a phone stands further back than the 1.45 of the first plan: the open stack and the chrome must fit in 55 percent
      if (rig.phone) return open ? { pos: [x - 0.5, 3.0, 31], look: [x, 2.7, 0], fov: 24, cy: 0.335 } : { pos: [x - 0.4, 2.3, 23.6], look: [x, 1.95, 0], fov: 24, cy: 0.335 };
      return open ? { pos: [x - 1.6, 3.0, 17.6], look: [x + 1.05, 2.8, 0], fov: 24 } : { pos: [x - 0.9, 2.4, 13.5], look: [x + 0.5, 2.2, 0], fov: 24 };
    },
    to(stop) { read(stop, want); },
    // Between two stops. `e` is already eased by the caller (easeIO for a scrubbed move).
    mix(from, to, e) {
      read(from, A); read(to, B);
      want.pos.lerpVectors(A.pos, B.pos, e); want.look.lerpVectors(A.look, B.look, e);
      want.fov = lerp(A.fov, B.fov, e); want.fit = lerp(A.fit, B.fit, e); want.cx = lerp(A.cx, B.cx, e); want.cy = lerp(A.cy, B.cy, e);
    },
    // The dolly zoom (opening, ending): the lens opens while the camera closes in, so the subject keeps its size.
    dolly(from, to, time) {
      const e = easeIO(time);
      read(from, A); read(to, B);
      const da = a.subVectors(A.pos, A.look).length(), db = b.subVectors(B.pos, B.look).length();
      const fov = lerp(A.fov, B.fov, Math.pow(e, 1.6));
      const width = lerp(da * 2 * Math.tan(A.fov * RAD / 2), db * 2 * Math.tan(B.fov * RAD / 2), e);
      a.normalize().lerp(b.normalize(), e).normalize();
      want.look.lerpVectors(A.look, B.look, e);
      want.pos.copy(want.look).addScaledVector(a, width / (2 * Math.tan(fov * RAD / 2)));
      want.fov = fov; want.fit = lerp(A.fit, B.fit, e); want.cx = 0.5; want.cy = lerp(A.cy, B.cy, e);
    },
    reset() { rig.yaw = 0.06; rig.pitch = 0.025; rig.push = null; },
    // Jump to the wanted pose with no easing (first frame, reduced motion, a cut).
    cut() { first = true; },
    resize(w, h) { size.w = w; size.h = h; camera.aspect = w / h; },

    update(dt, input) {
      t += dt;
      const p = a.copy(want.pos), l = b.copy(want.look);
      let fov = want.fov;
      // a width that must stay in frame decides the distance on a narrow screen
      off.subVectors(p, l);
      let dist = off.length();
      if (want.fit) dist = Math.max(dist, want.fit / (2 * Math.tan(fov * RAD / 2) * camera.aspect));
      off.normalize();
      // push-in: 5.5 units from the floor, 12 degrees above it, from the side the camera is already on
      if (rig.push && rig.push.k > 0.001) {
        const k = easeIO(rig.push.k), pt = rig.push.point;
        right.set(p.x - pt.x, 0, p.z - pt.z).normalize();
        const far = rig.phone ? 9 : 6.8;                 // a little further than the 5.5 of the plan: the card needs the right third
        right.multiplyScalar(far * Math.cos(12 * RAD)).setY(far * Math.sin(12 * RAD));
        p.copy(l).addScaledVector(off, dist).lerp(right.add(pt), k);
        l.lerp(right.copy(pt).setX(pt.x + (rig.phone ? 0 : 1.1)), k);    // look a little right of the floor, so it sits left of its card
        off.subVectors(p, l); dist = off.length(); off.normalize();
      }
      // the pointer orbits the camera around what it looks at. Touch and idle get a slow sway instead
      const quiet = ctx.reduced ? 0 : 1;
      const yaw = (input.touch ? Math.sin(t * 0.44) * 0.012 : input.x * rig.yaw + Math.sin(t * 0.44) * 0.008) * quiet;
      const pitch = (input.touch ? 0 : -input.y * rig.pitch) * quiet;
      if (off.y < 0.995) {
        off.applyAxisAngle(UP, yaw);
        right.crossVectors(UP, off).normalize();
        off.applyAxisAngle(right, -pitch);
      }
      p.copy(l).addScaledVector(off, dist);

      const k = first || ctx.reduced ? 1 : 1 - Math.exp(-9 * dt);
      first = false;
      cur.pos.lerp(p, k); cur.look.lerp(l, k);
      cur.fov += (fov - cur.fov) * k; cur.cx += (want.cx - cur.cx) * k; cur.cy += (want.cy - cur.cy) * k;
      camera.position.copy(cur.pos);
      camera.up.set(0, 1, 0);
      if (Math.abs(cur.pos.x - cur.look.x) + Math.abs(cur.pos.z - cur.look.z) < 1.2) camera.up.set(0, 0, -1);   // looking straight down
      camera.lookAt(cur.look);
      camera.fov = cur.fov;
      if (Math.abs(cur.cx - 0.5) + Math.abs(cur.cy - 0.5) > 0.002) camera.setViewOffset(size.w, size.h, (0.5 - cur.cx) * size.w, (0.5 - cur.cy) * size.h, size.w, size.h);
      else if (camera.view && camera.view.enabled) camera.clearViewOffset();
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      cur.dist = cur.pos.distanceTo(cur.look);
    },
  };
  return rig;
}
