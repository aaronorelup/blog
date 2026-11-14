/* THE GROVE IN THE MODELLED GARDEN: the projects walk's first view, stood up in the site chapter's world so that its
   camera can come down into it (join.js PROJ). Built from projects/plan.js, the same numbers the painted walk draws
   from: every tree, bush and stone the walk shows at its start, and its first lantern, at the same place, of the same
   size, as flats carrying the walk's own pictures. Seen from the walk's first view (firstView, facing back down the
   path to the house: -Z in the modelled garden) each flat lands exactly where the painting has it; from anywhere else
   it turns to face the camera (round its upright), so the grove reads as standing trees from above too.

   A painted point (X, Y, Z) of the walk stands in the modelled garden at (X - view.x, Y, Zc - (Z - view.z)), where Zc
   is the camera's own place: the painted house (G.zHouse) lands on the modelled house (PROJ.HOUSE_Z).

   build(kit, G, L, view, houseZ, lantern, onLoad) -> { group, Zc, update(camera, k), dispose() }
     lantern: the walk's lit lantern drawn by code ({ url, w, h, U }, projects/scene.js drawLantern); onLoad(): a
     picture came in (draw again). update: k 0..1, how far the flats have turned to face the walk's first view (1
     there) and taken the walk's own fading with distance. */
import { CanvasTexture, CircleGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { TREE, BUSH, LH, FAR, ss } from './plan.js';

const IMG = (p) => new URL('../../../img/projects/' + p, import.meta.url).href;
const PICS = ['tree-night.webp', 'tree-blossom.webp', 'near-bush-l.webp', 'near-bush-r.webp'];

export function build(kit, G, L, view, houseZ, lantern, onLoad) {
  const group = new Group(); group.name = 'projects-grove';
  const Zc = houseZ + (G.zHouse - view.z);
  const at = (X, Z) => [X - view.x, Zc - (Z - view.z)];
  const loader = new TextureLoader();
  const done = () => { if (onLoad) onLoad(); };
  const tex = PICS.map((n) => { const t = loader.load(IMG(n), done, undefined, done); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; return t; });
  const mats = [], geos = [];
  let lanTex = null;
  const flats = [];
  // a flat: a picture w x h metres standing on the ground at (x, z), its anchor (ax from its left, ay from its top,
  // 0..1) on the ground; flip: the picture mirrored about its anchor, as the walk mirrors it
  function flat(map, w, h, ax, ay, x, z, flip, op) {
    const g = new PlaneGeometry(w, h);
    g.translate(w / 2 - ax * w, ay * h - h / 2, 0);
    geos.push(g);
    const m = new MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: DoubleSide });
    m.toneMapped = false;
    mats.push(m);
    const mesh = new Mesh(g, m);
    if (flip) mesh.scale.x = -1;
    mesh.position.set(x, 0, z);
    mesh.userData.op = op;
    group.add(mesh); flats.push(mesh);
    return mesh;
  }

  // the trees the walk shows at its start (plan.js: planted, not too near, not past the far fade)
  for (const t of G.trees) {
    if (t.off) continue;
    const d = t.Z - view.z; if (d < 0.8 || d > FAR + 6) continue;
    const op = (1 - ss(FAR - 6, FAR + 6, d)) * ss(1.6, 3.4, d);
    const h = t.h, w = h * TREE.w / TREE.h;           // (the picture is h tall, its foot ay of the way down)
    const [x, z] = at(t.X, t.Z);
    flat(tex[t.pink ? 1 : 0], w, h, TREE.ax, TREE.ay, x, z, t.flip, op);
  }
  // the bushes close to the eye
  for (const b of G.bushes) {
    const d = b.Z - view.z; if (d < 0.9 || d > 5) continue;
    const op = ss(1, 2, d) * (1 - ss(3.4, 5, d));
    const w = b.w, h = w * BUSH.h / BUSH.w;
    const [x, z] = at(b.X, b.Z);
    flat(tex[b.side < 0 ? 2 : 3], w, h, 0.5, 0.8, x, z, false, op);
  }
  // the first lantern, lit
  if (lantern) {
    lanTex = loader.load(lantern.url, done, undefined, done); lanTex.colorSpace = SRGBColorSpace;
    const o = L.st[0], hh = (LH + 0.06), ww = hh * lantern.w / lantern.h;
    const [x, z] = at(o.lX, o.lZ);
    flat(lanTex, ww, hh, 0.5, 1 - 0.02 * lantern.U / lantern.h, x, z, false, 1);
  }
  // the stepping stones along the path, to past the far fade
  const stoneGeo = new CircleGeometry(1, 20); stoneGeo.rotateX(-Math.PI / 2);
  const stoneMat = new MeshBasicMaterial({ color: 0x3a4452 }), rimMat = new MeshBasicMaterial({ color: 0x0d1119 });
  mats.push(stoneMat, rimMat);
  for (const st of G.stones) {
    const d = st.Z - view.z; if (d < 0.45 || d > FAR + 30) continue;
    const X = L.pathAt(st.Z) + st.j, r = 0.34 * st.s;
    const [x, z] = at(X, st.Z);
    const rim = new Mesh(stoneGeo, rimMat); rim.scale.set(r + 0.03, 1, (r + 0.03) * 0.9); rim.position.set(x, 0.012, z); rim.rotation.y = st.t * 0.2;
    const top = new Mesh(stoneGeo, stoneMat); top.scale.set(r, 1, r * 0.9); top.position.set(x, 0.03, z); top.rotation.y = st.t * 0.2;
    group.add(rim, top);
  }
  // the lawn beyond the garden's own (the modelled ground is a disc of 70 m round the house)
  const lawnGeo = new CircleGeometry(150, 48); lawnGeo.rotateX(-Math.PI / 2);
  const lawn = new Mesh(lawnGeo, kit.M.grass); lawn.position.set(0, -0.25, (houseZ + Zc) / 2);
  lawn.receiveShadow = false;
  group.add(lawn);

  const v = new Vector3();
  function update(camera, k) {
    // each flat turns round its upright to face the camera; at the walk's first view (k 1) it faces down the path,
    // as the painting's flats do, and takes the walk's own fading with distance
    camera.getWorldPosition(v);
    for (const m of flats) {
      const a = Math.atan2(v.x - m.position.x, v.z - m.position.z);
      m.rotation.y = a * (1 - k);
      m.material.opacity = 1 + (m.userData.op - 1) * k;
    }
  }
  function dispose() {
    geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); tex.forEach((t) => t.dispose()); if (lanTex) lanTex.dispose();
    stoneGeo.dispose(); lawnGeo.dispose();
    if (group.parent) group.parent.remove(group);
  }
  return { group, Zc, update, dispose };
}
