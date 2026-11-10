// The camera: a Catmull-Rom path through the manifest's keys (position and look-at, keyed on scroll progress), a
// field of view that crops like object-fit: cover of the reference aspect (so the poster lines up at any desktop
// size; a portrait screen gets its own wider shot), and the pointer's parallax, an eased offset in screen space.
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three';

export function createCamera(manifest) {
  const c = manifest.camera;
  const cam = new PerspectiveCamera(c.fov, 1, c.near, c.far);
  const times = c.keys.map((k) => k.t);
  const pos = new CatmullRomCurve3(c.keys.map((k) => new Vector3().fromArray(k.pos)), false, 'centripetal');
  const look = new CatmullRomCurve3(c.keys.map((k) => new Vector3().fromArray(k.look)), false, 'centripetal');
  return { cam, times, pos, look, spec: c, portrait: false, par: { x: 0, y: 0 } };
}

// progress (0..1) to the curves' own parameter: linear between key times, so keys may be spaced unevenly
function curveT(times, p) {
  const n = times.length;
  if (p <= times[0]) return 0;
  if (p >= times[n - 1]) return 1;
  let i = 0;
  while (p > times[i + 1]) i++;
  return (i + (p - times[i]) / (times[i + 1] - times[i] || 1)) / (n - 1);
}

export function fitCamera(rig, ref, w, h) {
  const a = w / h;
  rig.cam.aspect = a;
  rig.portrait = a < 1;
  const v = rig.spec.fov;
  if (rig.portrait) rig.cam.fov = rig.spec.portrait.fov;
  else if (a >= ref) rig.cam.fov = MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(v) / 2) * ref / a));
  else rig.cam.fov = v;
  rig.cam.updateProjectionMatrix();
}

const _p = new Vector3();
const _l = new Vector3();
const _f = new Vector3();
const _r = new Vector3();
const _u = new Vector3();
const UP = new Vector3(0, 1, 0);

// p: smoothed progress; par: eased pointer offset, -1..1 each axis
export function placeCamera(rig, p, par) {
  const t = curveT(rig.times, p);
  rig.pos.getPoint(t, _p);
  rig.look.getPoint(t, _l);
  if (rig.portrait) {
    // pulled back along the view on a tall screen, more at the start than once the camera is in close
    _f.subVectors(_p, _l).normalize();
    _p.addScaledVector(_f, rig.spec.portrait.pull * (1 - p * 0.7));
  }
  _f.subVectors(_l, _p).normalize();
  _r.crossVectors(_f, UP).normalize();
  _u.crossVectors(_r, _f);
  const k = rig.spec.parallax;
  _p.addScaledVector(_r, par.x * k.x).addScaledVector(_u, par.y * k.y);
  rig.cam.position.copy(_p);
  rig.cam.lookAt(_l);
}
