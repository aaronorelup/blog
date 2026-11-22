// The furniture (room-set): the low walnut sideboard the set stands on, the empty wing chair with its folded
// knitted blanket, the side table with the tea (cup, saucer, spoon, the listings magazine), the wall clock, a
// framed print and a few books. update(S) moves the clock's hands and the spoon; the tea is ./tea.js.

import * as THREE from 'three';
import { tex, roundedBox, boxUV, contactShadow } from './mats.js';
import * as T from './textures.js';
import { hash01 } from '../rng.js';

export function createFurniture({ ROOM }) {
  const group = new THREE.Group();
  const add = (m, parent = group, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; };
  const walnutTex = tex(T.walnut(), { repeat: [1.6, 1.6] });
  const walnut = new THREE.MeshPhongMaterial({ map: walnutTex, specular: 0x3a3028, shininess: 40 });
  const walnutDark = new THREE.MeshPhongMaterial({ color: 0x2a1a10, specular: 0x221a14, shininess: 30 });
  const brass = new THREE.MeshPhongMaterial({ color: 0x8a6a30, specular: 0xb89858, shininess: 60 });
  const blobTex = tex(T.blob(), { srgb: false }), rectTex = tex(T.softRect(), { srgb: false });

  // ---- the sideboard ----
  {
    const C = ROOM.cabinet, legH = 0.1, topT = 0.028, bodyH = C.h - legH - topT;
    const g = new THREE.Group(); g.position.set(C.x, 0, C.z); group.add(g);
    const body = add(new THREE.Mesh(boxUV(roundedBox(C.w - 0.04, bodyH, C.d - 0.03, 0.012), 1.2), walnut), g);
    body.position.set(0, legH + bodyH / 2, -0.01);
    const top = add(new THREE.Mesh(boxUV(roundedBox(C.w, topT, C.d, 0.01), 1.2), walnut), g);
    top.position.set(0, C.h - topT / 2, 0);
    // door seams and knobs on the front
    const seam = new THREE.MeshBasicMaterial({ color: 0x120a06 });
    for (const x of [-C.w / 6, C.w / 6, 0]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.004, bodyH - 0.04, 0.004), seam);
      m.position.set(x * (x === 0 ? 1 : 3) * 0 + x, legH + bodyH / 2, C.d / 2 - 0.023); g.add(m);
    }
    for (const x of [-0.08, 0.08]) {
      const k = add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), brass), g, false); k.position.set(x * 2.4, legH + bodyH * 0.62, C.d / 2 - 0.012);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.011, legH, 10), walnutDark), g);
      leg.position.set(sx * (C.w / 2 - 0.09), legH / 2, sz * (C.d / 2 - 0.07)); leg.rotation.z = sx * 0.12; leg.rotation.x = -sz * 0.1;
    }
    const cs = contactShadow(rectTex, C.w + 0.25, C.d + 0.22, 0.55); cs.position.set(C.x, 0.002, C.z + 0.04); group.add(cs);
    // books at the left end, a bookend, and a small brass dish
    const bookCols = [0x2e3f4f, 0x4a3b2a, 0x5c5a3a, 0x2f2a26, 0x6a5a40, 0x34463a, 0x4f3d3a];
    let bx = -C.w / 2 + 0.05;
    for (let i = 0; i < 7; i++) {
      const bw = 0.022 + hash01(5101, i) * 0.02, bh = 0.17 + hash01(5102, i) * 0.07, bd = 0.13 + hash01(5103, i) * 0.04;
      const m = add(new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), new THREE.MeshLambertMaterial({ color: bookCols[i] })), g);
      m.position.set(bx + bw / 2, C.h + bh / 2, -0.06); m.rotation.z = i === 6 ? -0.18 : 0; bx += bw + 0.002;
    }
    const lie = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.14), new THREE.MeshLambertMaterial({ color: 0x3c4a5a })), g);
    lie.position.set(-C.w / 2 + 0.36, C.h + 0.015, -0.02); lie.rotation.y = 0.15;
    const dish = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.02, 20), brass), g);
    dish.position.set(C.w / 2 - 0.15, C.h + 0.01, 0.02);
  }

  // ---- the rug, under the chair and in front of the set (a hair above the boards) ----
  {
    const rg = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.45), new THREE.MeshLambertMaterial({ map: tex(T.rug(), { aniso: 8 }) }));
    rg.rotation.x = -Math.PI / 2; rg.rotation.z = Math.PI / 2 + 0.04; rg.position.set(-0.2, 0.004, -1.25);
    rg.receiveShadow = true; group.add(rg);
  }

  // ---- the wall clock above the set: dark wood rim, cream face, hands from S ----
  const Wc = ROOM.wallClock;
  const clock = new THREE.Group(); clock.position.set(Wc.x, Wc.y, Wc.z); group.add(clock);
  {
    const rim = add(new THREE.Mesh(new THREE.TorusGeometry(Wc.r, 0.018, 10, 48), walnutDark), clock);
    rim.position.z = 0.02;
    const back = add(new THREE.Mesh(new THREE.CylinderGeometry(Wc.r, Wc.r, 0.03, 48), walnutDark), clock);
    back.rotation.x = Math.PI / 2; back.position.z = 0.0;
    const face = add(new THREE.Mesh(new THREE.CircleGeometry(Wc.r * 0.98, 48), new THREE.MeshLambertMaterial({ map: tex(T.clockFace()) })), clock, false);
    face.position.z = 0.016;
  }
  const handMat = new THREE.MeshLambertMaterial({ color: 0x15120f });
  const hand = (len, w, z) => {
    const s = new THREE.Shape(); s.moveTo(-w / 2, -len * 0.18); s.lineTo(w / 2, -len * 0.18); s.lineTo(w * 0.32, len); s.lineTo(-w * 0.32, len); s.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), handMat); m.position.z = z; clock.add(m); return m;
  };
  const hourHand = hand(Wc.r * 0.52, 0.016, 0.022), minuteHand = hand(Wc.r * 0.8, 0.011, 0.025);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), brass); cap.position.z = 0.027; clock.add(cap);

  // ---- a framed print on the left wall ----
  {
    const pr = new THREE.Group(); pr.position.set(-ROOM.size.w / 2 + 0.02, 1.45, -1.25); pr.rotation.y = Math.PI / 2; group.add(pr);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.025), walnutDark), pr).position.z = 0.0125;
    const pic = add(new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.47), new THREE.MeshLambertMaterial({ map: tex(T.print()) })), pr, false);
    pic.position.z = 0.026;
  }

  // ---- the empty wing chair: back to WIDE A, turned to the set ----
  const ch = ROOM.chair;
  const chair = new THREE.Group(); chair.position.set(ch.x, 0, ch.z); chair.rotation.y = ch.rotY; group.add(chair);
  const velvetTex = tex(T.velvet(), { repeat: [2, 2] });
  const uph = new THREE.MeshLambertMaterial({ map: velvetTex });
  {
    const part = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = add(new THREE.Mesh(boxUV(geo, 2), uph), chair); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
    // chair local: faces -z (the set), back at +z
    part(roundedBox(0.8, 0.26, 0.78, 0.04), 0, 0.24, 0);                       // base
    part(roundedBox(0.56, 0.12, 0.62, 0.05), 0, 0.42, -0.05);                  // seat cushion
    part(roundedBox(0.66, 0.74, 0.16, 0.05), 0, 0.76, 0.33, -0.12);            // back
    part(roundedBox(0.5, 0.3, 0.12, 0.05), 0, 0.6, 0.22, -0.2);                // back cushion (lumbar)
    for (const sx of [-1, 1]) {
      part(roundedBox(0.12, 0.3, 0.7, 0.04), sx * 0.34, 0.5, -0.02);           // arm panel
      const roll = add(new THREE.Mesh(boxUV(new THREE.CylinderGeometry(0.075, 0.075, 0.72, 16), 2), uph), chair);
      roll.rotation.x = Math.PI / 2; roll.position.set(sx * 0.35, 0.65, -0.03);
      // the wing: a curved panel from the back forward, high at the back
      const ws = new THREE.Shape();
      ws.moveTo(0, 0); ws.lineTo(0.0, 0.4); ws.quadraticCurveTo(0.02, 0.5, -0.1, 0.52);
      ws.quadraticCurveTo(-0.27, 0.5, -0.3, 0.3); ws.quadraticCurveTo(-0.31, 0.15, -0.26, 0.0); ws.closePath();
      const wg = new THREE.ExtrudeGeometry(ws, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 10 });
      wg.computeVertexNormals();
      const wing = add(new THREE.Mesh(boxUV(wg, 2), uph), chair);
      wing.rotation.y = -Math.PI / 2; wing.position.set(sx * 0.37 - 0.03, 0.6, 0.36);
    }
    const legMat = walnutDark;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.11, 10), legMat), chair);
      leg.position.set(sx * 0.34, 0.055, sz * 0.32);
    }
    const cs = contactShadow(rectTex, 1.05, 1.05, 0.6); cs.position.set(0, 0.003, 0.02); chair.add(cs);
  }

  // ---- the folded blanket over the chair's left arm (cream knit, three layers thick) ----
  {
    const knitTex = tex(T.knit(), { repeat: [7, 7] });
    const prof = [];                                         // profile in chair-local (x, y): inside on the seat, over the arm, down outside
    const P = [[-0.16, 0.49], [-0.24, 0.52], [-0.3, 0.66], [-0.35, 0.735], [-0.42, 0.7], [-0.445, 0.58], [-0.445, 0.36]];
    const curve = new THREE.CatmullRomCurve3(P.map(([x, y]) => new THREE.Vector3(x, y, 0)));
    const pts = curve.getPoints(28);
    const th = 0.035, s = new THREE.Shape();
    const norm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const t = b.clone().sub(a).normalize(); return new THREE.Vector2(-t.y, t.x); };
    pts.forEach((p, i) => { const n = norm(i); (i ? s.lineTo.bind(s) : s.moveTo.bind(s))(p.x + n.x * th / 2, p.y + n.y * th / 2); });
    for (let i = pts.length - 1; i >= 0; i--) { const n = norm(i), p = pts[i]; s.lineTo(p.x - n.x * th / 2, p.y - n.y * th / 2); }
    s.closePath(); void prof;
    const bg = new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 4 });
    bg.translate(0, 0, -0.18 - 0.08);
    // soft lumps: displace along the extrusion with a few seeded waves so the fold is not a machined shape
    const p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i), x = p.getX(i);
      p.setY(i, p.getY(i) + 0.008 * Math.sin(z * 31 + x * 9) + 0.006 * Math.sin(z * 13 + 1.3));
    }
    bg.computeVertexNormals(); boxUV(bg, 6);
    const blanket = add(new THREE.Mesh(bg, new THREE.MeshLambertMaterial({ map: knitTex })), chair);
    blanket.position.set(0.0, 0.0, 0.0);
  }

  // ---- the side table: round walnut top on a turned pedestal ----
  const tb = ROOM.table;
  {
    const g = new THREE.Group(); g.position.set(tb.x, 0, tb.z); group.add(g);
    const top = add(new THREE.Mesh(new THREE.CylinderGeometry(tb.r, tb.r - 0.005, 0.024, 40), walnut), g); top.position.y = tb.h - 0.012;
    const lp = [[0.0, 0], [0.12, 0], [0.12, 0.02], [0.05, 0.04], [0.032, 0.09], [0.026, 0.2], [0.034, 0.3], [0.024, 0.42], [0.03, 0.5], [0.05, tb.h - 0.024], [0, tb.h - 0.024]];
    const ped = add(new THREE.Mesh(new THREE.LatheGeometry(lp.map(([r, y]) => new THREE.Vector2(r, y)), 20), walnut), g);
    void ped;
    const cs = contactShadow(blobTex, 0.7, 0.7, 0.55); cs.position.set(tb.x, 0.004, tb.z); group.add(cs);
  }
  // the listings magazine, a little askew, half under the saucer
  {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.004, 0.2), [0, 0, new THREE.MeshLambertMaterial({ map: tex(T.magazine()) }), 0, 0, 0].map((x) => x || new THREE.MeshLambertMaterial({ color: 0xd8d2c2 }))), group);
    m.position.set(tb.x - 0.07, tb.h + 0.002, tb.z + 0.04); m.rotation.y = 0.5;
  }

  // ---- cup and saucer (china), the spoon on the saucer ----
  const cu = ROOM.cup;
  const china = new THREE.MeshPhongMaterial({ color: 0xe9e4d8, specular: 0x666666, shininess: 80 });
  const cupG = new THREE.Group(); cupG.position.set(cu.x, cu.y, cu.z); group.add(cupG);
  {
    const sp = [[0, 0.004], [0.04, 0.004], [0.05, 0.007], [0.075, 0.012], [0.08, 0.016], [0.078, 0.017], [0.07, 0.013], [0.045, 0.01], [0, 0.01]];
    add(new THREE.Mesh(new THREE.LatheGeometry(sp.map(([r, y]) => new THREE.Vector2(r, y)), 36), china), cupG);
    const r = cu.r, h = cu.h, base = 0.012;
    const cp = [[0, base], [r * 0.55, base], [r * 0.62, base + 0.004], [r * 0.8, base + h * 0.3], [r * 0.97, base + h * 0.75], [r, base + h], [r * 0.93, base + h], [r * 0.9, base + h * 0.75], [r * 0.72, base + h * 0.3], [0, base + 0.008]];
    add(new THREE.Mesh(new THREE.LatheGeometry(cp.map(([a, b]) => new THREE.Vector2(a, b)), 36), china), cupG);
    const handle = add(new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0045, 8, 16, Math.PI * 1.3), china), cupG);
    handle.position.set(r * 0.95 + 0.006, base + h * 0.55, 0); handle.rotation.z = -Math.PI * 0.65;
    // a thin gilt band under the rim
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.995, r * 0.985, 0.003, 36, 1, true), brass);
    band.position.y = base + h - 0.008; cupG.add(band);
  }
  const spoonG = new THREE.Group(); spoonG.position.set(0.02, 0.0165, 0.05); spoonG.rotation.y = Math.PI / 2; cupG.add(spoonG);
  const silver = new THREE.MeshPhongMaterial({ color: 0xb8b8b4, specular: 0xffffff, shininess: 90 });
  {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 8), silver); bowl.scale.set(0.7, 0.25, 1.1); bowl.position.set(0, 0.003, 0.012); spoonG.add(bowl);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.0045, 0.0022, 0.07), silver); stem.position.set(0, 0.002, -0.03); stem.rotation.x = -0.05; spoonG.add(stem);
    bowl.castShadow = stem.castShadow = true;
  }

  // ---- per frame: the clock's hands, the spoon's chatter ----
  function update(S) {
    minuteHand.rotation.z = -S.minuteAngle;
    hourHand.rotation.z = -S.hourAngle;
    // the spoon chatters on the saucer while S says so: a small seeded rattle (shape only; S decides when)
    const c = S.spoonChatter ? 1 : 0;
    spoonG.rotation.y = Math.PI / 2 + c * (hash01(5201, S.frame, 0, 0) * 2 - 1) * 0.05;
    spoonG.position.y = 0.0165 + c * hash01(5201, S.frame, 1, 0) * 0.0025;
    spoonG.rotation.z = c * (hash01(5201, S.frame, 2, 0) * 2 - 1) * 0.06;
  }
  return { group, update, cupGroup: cupG, chair };
}
