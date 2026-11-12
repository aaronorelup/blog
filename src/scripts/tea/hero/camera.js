// The camera: a Catmull-Rom path through the manifest's keys (position and look-at, keyed on scroll progress), a
// field of view that crops like object-fit: cover of the poster's aspect (so the poster lines up at any size; a
// portrait screen has its own shot and poster), and the pointer's parallax, an eased offset in screen space.
import { CatmullRomCurve3, MathUtils, PerspectiveCamera, Vector3 } from './three.js';

// A path through keys on the scene's progress: Catmull-Rom curves of the camera's place and of the point it looks at.
function path(keys) {
  return {
    times: keys.map((k) => k.t),
    pos: new CatmullRomCurve3(keys.map((k) => new Vector3().fromArray(k.pos)), false, 'centripetal'),
    look: new CatmullRomCurve3(keys.map((k) => new Vector3().fromArray(k.look)), false, 'centripetal'),
  };
}

// The landscape path (camera.keys), and a portrait screen's own when the manifest gives one (camera.portrait.keys: a
// composition of its own for the tall frame); without it a portrait screen pulls the landscape path back (placeCamera).
export function createCamera(manifest) {
  const c = manifest.camera;
  const cam = new PerspectiveCamera(c.fov, 1, c.near, c.far);
  const tall = c.portrait.keys ? path(c.portrait.keys) : null;
  return { cam, wide: path(c.keys), tall, spec: c, portrait: false, par: { x: 0, y: 0 }, shift: 0 };
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
  rig.portrait = a <= 1;   // a square screen too, as stage.css's (max-aspect-ratio: 1/1) gives it the tall poster
  // like object-fit: cover of a picture of aspect r (the poster's): a wider screen keeps its horizontal field and crops
  // top and bottom, a narrower one keeps its vertical field and crops the sides. Portrait has its own picture.
  const [v, r] = rig.portrait ? [rig.spec.portrait.fov, rig.spec.portrait.aspect] : [rig.spec.fov, ref];
  rig.cam.fov = a > r ? MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(v) / 2) * r / a)) : v;
  rig.cam.updateProjectionMatrix();
}

let V = null;   // scratch vectors, made on first use (three arrives with the scene: three.js)
const scratch = () => V || (V = {
  p: new Vector3(), l: new Vector3(), f: new Vector3(), r: new Vector3(), u: new Vector3(), up: new Vector3(0, 1, 0),
});

// p: smoothed progress; par: eased pointer offset, -1..1 each axis
export function placeCamera(rig, p, par) {
  const { p: _p, l: _l, f: _f, r: _r, u: _u, up: UP } = scratch();
  const own = rig.portrait && rig.tall;
  const way = own ? rig.tall : rig.wide;
  const t = curveT(way.times, p);
  way.pos.getPoint(t, _p);
  way.look.getPoint(t, _l);
  if (rig.portrait && !own) {
    // pulled back along the view on a tall screen, more at the start than once the camera is in close
    _f.subVectors(_p, _l).normalize();
    _p.addScaledVector(_f, rig.spec.portrait.pull * (1 - p * 0.7));
    // and aimed lower while the title box waits at the bottom, so the characters stand in the top half
    _l.y -= rig.spec.portrait.drop * (1 - p);
  }
  _f.subVectors(_l, _p).normalize();
  _r.crossVectors(_f, UP).normalize();
  _u.crossVectors(_r, _f);
  const k = rig.spec.parallax;
  _p.addScaledVector(_r, par.x * k.x).addScaledVector(_u, par.y * k.y);
  rig.cam.position.copy(_p);
  rig.cam.lookAt(_l);
  // a lens shift: the picture slides right by rig.shift of its width (the docked title box covers the left)
  const e = rig.cam.projectionMatrix.elements;
  if (e[8] !== -2 * rig.shift) {
    e[8] = -2 * rig.shift;
    rig.cam.projectionMatrixInverse.copy(rig.cam.projectionMatrix).invert();
  }
}
