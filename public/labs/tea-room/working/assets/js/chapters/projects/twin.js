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
import { BufferGeometry, CanvasTexture, CircleGeometry, DoubleSide, Euler, Float32BufferAttribute, Group, Matrix4, Quaternion, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { TREE, BUSH, LH, FAR, K0, ss } from './plan.js';

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
  // 0..1) on the ground; flip: the picture mirrored about its anchor, as the walk mirrors it. op: how much of it the
  // walk shows from its first view (flats it shows whole share one material for each picture)
  const shared = new Map();
  function flat(map, w, h, ax, ay, x, z, flip, op) {
    const g = new PlaneGeometry(w, h);
    g.translate(w / 2 - ax * w, ay * h - h / 2, 0);
    geos.push(g);
    let m = op >= 0.999 ? shared.get(map) : null;
    if (!m) {
      m = new MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: DoubleSide });
      m.toneMapped = false; mats.push(m);
      if (op >= 0.999) shared.set(map, m);
    }
    const mesh = new Mesh(g, m);
    mesh.position.set(x, 0, z);
    mesh.userData.op = op; mesh.userData.flip = flip ? -1 : 1;
    // (when it rises out of the lawn, from the house outwards as the camera pulls back: join.js PROJ)
    mesh.userData.rise = 0.06 + 0.4 * Math.min(1, Math.max(0, (z - houseZ - 24) / Math.max(1, Zc - houseZ - 24)));
    group.add(mesh); flats.push(mesh);
    return mesh;
  }

  // the trees: the whole avenue the walk goes down, from the first view to the house (those the walk does not show
  // from its first view, too near or past its far fade, fade away as the camera arrives there)
  for (const t of G.trees) {
    if (t.off) continue;
    const d = t.Z - view.z; if (d < 1.6 || t.Z > G.zHouse - 26) continue;     // (none in the modelled garden, the torii's side)
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
  // the projects' windows the walk shows from its first view: the wooden frame on its legs (a games' window wears
  // its little roof), drawn by code as the page draws it (css/chapters/projects.css .pw-win), with the project's
  // picture in it once that is in (the walk asks for the pictures of the two nearest)
  const canvases = [];
  G.S.forEach((s) => {
    const o = L.st[s.i], d = o.wZ - view.z; if (d > FAR || d < 0.8) return;
    const it = s.it, mpp = o.ww / o.bw, eave = it.shelf === 'play' ? 30 : 0, side = Math.round(0.04 * o.bw);
    const cw = o.bw + 2 * side, ch = Math.round(eave + o.bh + o.legLen + 4);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; canvases.push(t);
    const dim = s.i === 0 ? 0 : 0.3, watch = it.run === 'film';
    const paint = (pic) => {
      const g = c.getContext('2d'); g.clearRect(0, 0, cw, ch);
      const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
      const fx = side, fy = eave, ft = o.ft;
      // the legs
      const lw = L.tall ? 9 : 14;
      [fx + 0.07 * o.bw, fx + 0.93 * o.bw - lw].forEach((x) => { g.fillStyle = '#12131d'; g.fillRect(x - 3, fy + o.bh - 2, lw + 6, o.legLen + 6); g.fillStyle = watch ? '#2c3046' : '#4b3220'; g.fillRect(x, fy + o.bh - 2, lw, o.legLen + 3); });
      // the frame
      rr(fx - 3, fy - 3, o.bw + 6, o.bh + 6, 15); g.fillStyle = '#12131d'; g.fill();
      const gr = g.createLinearGradient(0, fy, 0, fy + o.bh);
      if (watch) { gr.addColorStop(0, '#252a40'); gr.addColorStop(1, '#191d30'); } else { gr.addColorStop(0, '#6b4a2e'); gr.addColorStop(1, '#4c3220'); }
      rr(fx, fy, o.bw, o.bh, 12); g.fillStyle = gr; g.fill();
      g.fillStyle = '#12131d'; g.fillRect(fx + ft - 2, fy + ft - 2, o.bw - 2 * ft + 4, o.bh - 2 * ft + 4);
      g.fillStyle = '#11142a'; g.fillRect(fx + ft, fy + ft, o.bw - 2 * ft, o.bh - 2 * ft);
      if (pic) g.drawImage(pic, fx + ft, fy + ft, o.bw - 2 * ft, o.bh - 2 * ft);
      if (eave) {
        const ex = fx - 0.04 * o.bw, ew = o.bw * 1.08, ey = fy - 30;
        g.beginPath(); g.ellipse(ex + ew / 2, ey + 34, ew / 2 + 3, 37, 0, Math.PI, 2 * Math.PI); g.closePath(); g.fillStyle = '#12131d'; g.fill();
        const eg = g.createLinearGradient(0, ey, 0, ey + 34); eg.addColorStop(0, '#2c3352'); eg.addColorStop(1, '#1d2238');
        g.beginPath(); g.ellipse(ex + ew / 2, ey + 34, ew / 2, 34, 0, Math.PI, 2 * Math.PI); g.closePath(); g.fillStyle = eg; g.fill();
      }
      if (dim) { g.globalAlpha = dim; g.fillStyle = '#0a0d22'; rr(fx - 3, fy - 3, o.bw + 6, o.bh + 6, 14); g.fill(); g.globalAlpha = 1; }
      t.needsUpdate = true;
    };
    paint(null);
    if (Math.abs(K0 - s.i) < 2.4) { const im = new Image(); im.onload = () => { paint(im); done(); }; im.src = it.pic.src; }
    const [x, z] = at(o.wX - side * mpp, o.wZ);
    flat(t, cw * mpp, ch * mpp, 0, 1, x, z, false, (1 - ss(FAR - 8, FAR, d)));
  });
  // the stepping stones, the whole path: the walk's own three ellipses (its shadow, the stone, its lit top), flattened
  // as the walk flattens them (0.62 of a true disc seen from the eye); one merged mesh for each of the three
  {
    const disc = new CircleGeometry(1, 22).toNonIndexed(); disc.rotateX(-Math.PI / 2);
    const src = disc.attributes.position.array, layers = [[], [], []];
    const m4 = new Matrix4(), qn = new Quaternion(), e3 = new Euler(), vp = new Vector3(), vs = new Vector3();
    for (const st of G.stones) {
      const d = st.Z - view.z; if (d < 0.45) continue;
      const X = L.pathAt(st.Z) + st.j, r = 0.34 * st.s, rz = 0.62 * r;
      const [x, z] = at(X, st.Z);
      const put = (li, sx, sz, dx, dz, y) => {
        m4.compose(vp.set(x + dx, y, z + dz), qn.setFromEuler(e3.set(0, -st.t * 0.2, 0)), vs.set(sx, 1, sz));
        const a = layers[li];
        for (let i = 0; i < src.length; i += 3) { vp.set(src[i], src[i + 1], src[i + 2]).applyMatrix4(m4); a.push(vp.x, vp.y, vp.z); }
      };
      put(0, r + 0.035, rz + 0.04, 0, 0.2 * rz, 0.01);
      put(1, r, rz, 0, 0, 0.02);
      put(2, r * 0.82, rz * 0.66, -0.05 * r, -0.18 * rz, 0.03);
    }
    disc.dispose();
    [0x0d1119, 0x2c3440, 0x3a4452].forEach((c, li) => {
      const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(layers[li], 3)); geos.push(g);
      const m = new MeshBasicMaterial({ color: c }); m.toneMapped = false; mats.push(m);
      group.add(new Mesh(g, m));
    });
  }
  // the lawn beyond the garden's own (the modelled ground is a disc of 70 m round the house): the walk's own lawn,
  // its colour by distance from the eye as the walk's gradient has it down the screen, so from the walk's first
  // view it is the painting's ground
  const lawnGeo = new PlaneGeometry(400, 400, 48, 48); lawnGeo.rotateX(-Math.PI / 2);
  {
    const pos = lawnGeo.attributes.position, col = new Float32Array(pos.count * 3), cz = (houseZ + Zc) / 2;
    const stops = [[0, [42, 55, 52]], [0.25, [35, 47, 46]], [1, [20, 28, 34]]];
    for (let i = 0; i < pos.count; i++) {
      const dx = pos.getX(i), dz = Zc - (pos.getZ(i) + cz), d = Math.max(0.3, Math.hypot(dx * 0.35, dz));
      const t = Math.min(1, L.f * view.y / (d * (L.H - L.hY)));
      let c = stops[2][1];
      for (let k = 1; k < stops.length; k++) if (t <= stops[k][0]) { const a0 = stops[k - 1], a1 = stops[k], e = (t - a0[0]) / (a1[0] - a0[0]); c = a0[1].map((v0, n) => v0 + (a1[1][n] - v0) * e); break; }
      // (the lawn's own colour is given in the page's colours: linear, as three wants them)
      for (let n = 0; n < 3; n++) col[i * 3 + n] = Math.pow(c[n] / 255, 2.2);
    }
    lawnGeo.setAttribute('color', new Float32BufferAttribute(col, 3));
  }
  const lawnMat = new MeshBasicMaterial({ vertexColors: true }); mats.push(lawnMat);
  const lawn = new Mesh(lawnGeo, lawnMat); lawn.position.set(0, -0.25, (houseZ + Zc) / 2);
  group.add(lawn);

  // the walk's moon (css/chapters/projects.css .pw-moon: it stands still on the screen, so it is set far down the
  // view, where the walk's first view sees it at the painting's place and size; the trees stand in front of it as in
  // the painting). It comes up only as the camera settles there (the modelled moon has been turned away by then).
  const moonMesh = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d'), R = 100, C = 256;
    const glow = (r, a) => { const gr = g.createRadialGradient(C, C, R * 0.9, C, C, r); gr.addColorStop(0, 'rgba(246,231,200,' + a + ')'); gr.addColorStop(1, 'rgba(246,231,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); };
    glow(256, 0.06); glow(R + 60, 0.14);
    g.beginPath(); g.arc(C, C, R + 3, 0, 6.3); g.fillStyle = '#1a1f4a'; g.fill();
    const body = g.createRadialGradient(C - 0.24 * R, C - 0.28 * R, 0, C, C, R);
    body.addColorStop(0, '#fff6dc'); body.addColorStop(0.46, '#f6e7c8'); body.addColorStop(0.72, '#e4d2ae'); body.addColorStop(1, '#d6c39e');
    g.beginPath(); g.arc(C, C, R, 0, 6.3); g.fillStyle = body; g.fill();
    g.fillStyle = 'rgba(190,172,140,0.55)';
    g.beginPath(); g.arc(C - R + 1.32 * R, C - R + 0.64 * R, 0.2 * R, 0, 6.3); g.fill();
    g.beginPath(); g.arc(C - R + 0.61 * R, C - R + 1.29 * R, 0.13 * R, 0, 6.3); g.fill();
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; canvases.push(t);
    const mr = L.tall ? 0.1 * L.W : 0.06 * L.W, D = 160, k = D / L.f;
    const sx = L.cx + ((L.tall ? 0.74 : 0.8) - 0.5) * L.W, sy = L.hY - (L.tall ? 0.3 : 0.36) * L.H;   // its middle on the screen
    const size = (2 * mr) * 512 / (2 * R) * k;
    const geo = new PlaneGeometry(size, size); geos.push(geo);
    const m = new MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0 }); m.toneMapped = false; mats.push(m);
    const mesh = new Mesh(geo, m);
    mesh.position.set((sx - L.cx) * k, view.y + (L.hY - sy) * k, Zc - D);
    mesh.renderOrder = -1; mesh.visible = false;
    group.add(mesh);
    return mesh;
  })();

  const v = new Vector3();
  // j: the join's progress (each flat rises out of the lawn in its turn), k: as above
  function update(camera, k, j) {
    moonMesh.material.opacity = k; moonMesh.visible = k > 0.003;
    // each flat turns round its upright to face the camera; at the walk's first view (k 1) it faces down the path,
    // as the painting's flats do, and takes the walk's own fading with distance
    camera.getWorldPosition(v);
    for (const m of flats) {
      const a = Math.atan2(v.x - m.position.x, v.z - m.position.z);
      m.rotation.y = a * (1 - k);
      const r0 = m.userData.rise, g = j >= r0 + 0.16 ? 1 : ss(r0, r0 + 0.16, j), e = g * g * (3 - 2 * g);
      m.scale.set(m.userData.flip * (0.55 + 0.45 * e), e, 1);
      let vis = e > 0.005;
      if (m.userData.op < 0.999) { m.material.opacity = 1 + (m.userData.op - 1) * k; vis = vis && m.material.opacity > 0.004; }
      m.visible = vis;
    }
  }
  function dispose() {
    geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); tex.forEach((t) => t.dispose()); canvases.forEach((t) => t.dispose()); if (lanTex) lanTex.dispose();
    lawnGeo.dispose();
    if (group.parent) group.parent.remove(group);
  }
  return { group, Zc, update, dispose };
}
