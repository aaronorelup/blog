// The room's shell (room-set): floor, walls, ceiling, skirting and picture rail, the open doorway and its dark
// hall, the two windows with their curtains, the night street beyond them, the neighbour's warm window and the
// moonlight spill. Static except the neighbour's window, which update(S) switches from S.windowLit.

import * as THREE from 'three';
import { roomAO, tex, contactShadow } from './mats.js';
import * as T from './textures.js';
import { hash01 } from '../rng.js';

export function createShell({ ROOM, wideCam, reverseCam }) {
  const group = new THREE.Group();
  const { w: RW, d: RD, h: RH } = ROOM.size, zB = ROOM.backWallZ, zF = zB + RD;
  const D = ROOM.doorway, W1 = ROOM.window, W2 = ROOM.window2;

  const paper = T.wallPaper();
  const wallTex = tex(paper, { repeat: [1, 1] });
  const wallMat = roomAO(new THREE.MeshLambertMaterial({ map: wallTex }), ROOM);
  const floorTex = tex(T.woodFloor(), { repeat: [1 / 1.2, 1 / 1.2], aniso: 8 });
  const floorMat = roomAO(new THREE.MeshPhongMaterial({ map: floorTex, specular: 0x2a2520, shininess: 28 }), ROOM, 0.6, 0.25);
  const ceilMat = roomAO(new THREE.MeshLambertMaterial({ color: 0x8e8c86 }), ROOM, 0.5, 0.35);
  const paint = new THREE.MeshLambertMaterial({ color: 0xc9c1ae });                     // skirting, architraves, sashes
  const add = (m, cast = false, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; group.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, cast = false) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return add(m, cast);
  };

  // ---- floor, ceiling ----
  {
    const g = new THREE.PlaneGeometry(RW, RD); g.rotateX(-Math.PI / 2);
    const uv = g.attributes.uv, p = g.attributes.position;                      // world-metre UVs
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), -p.getZ(i));
    const m = add(new THREE.Mesh(g, floorMat)); m.position.set(0, 0, (zB + zF) / 2);
    const c = add(new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat)); c.rotation.x = Math.PI / 2; c.position.set(0, RH, (zB + zF) / 2);
  }

  // ---- walls: shapes with holes, UVs in metres so the 1 m paper tiles ----
  const wallWithHoles = (width, holes, mat) => {
    const s = new THREE.Shape(); s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, RH); s.lineTo(-width / 2, RH); s.closePath();
    for (const [x0, y0, x1, y1] of holes) {
      const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.closePath(); s.holes.push(h);
    }
    return new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  };
  const dx0 = D.x - D.w / 2, dx1 = D.x + D.w / 2;
  const w1 = [W1.x - W1.w / 2, W1.y - W1.h / 2, W1.x + W1.w / 2, W1.y + W1.h / 2];
  const back = add(wallWithHoles(RW, [[dx0, 0.0005, dx1, D.h], w1], wallMat)); back.position.z = zB;
  // front wall: seen from behind, so mirror x (its local +x is world -x)
  const w2 = [-(W2.x + W2.w / 2), W2.y - W2.h / 2, -(W2.x - W2.w / 2), W2.y + W2.h / 2];
  const front = add(wallWithHoles(RW, [w2], wallMat)); front.rotation.y = Math.PI; front.position.z = zF;
  const left = add(wallWithHoles(RD, [], wallMat)); left.rotation.y = Math.PI / 2; left.position.set(-RW / 2, 0, (zB + zF) / 2);
  const right = add(wallWithHoles(RD, [], wallMat)); right.rotation.y = -Math.PI / 2; right.position.set(RW / 2, 0, (zB + zF) / 2);

  // ---- skirting board and picture rail on every wall (cut at the doorway) ----
  const SK = 0.15, SKD = 0.018, PR = 2.02;
  const run = (len, x, z, rotY, y, h, d) => { const m = box(len, h, d, paint, 0, 0, 0); m.position.set(x, y, z); m.rotation.y = rotY; return m; };
  run(dx0 + RW / 2, (-RW / 2 + dx0) / 2, zB + SKD / 2, 0, SK / 2, SK, SKD);
  run(RW / 2 - dx1, (dx1 + RW / 2) / 2, zB + SKD / 2, 0, SK / 2, SK, SKD);
  run(RW, 0, zF - SKD / 2, 0, SK / 2, SK, SKD);
  run(RD, -RW / 2 + SKD / 2, (zB + zF) / 2, Math.PI / 2, SK / 2, SK, SKD);
  run(RD, RW / 2 - SKD / 2, (zB + zF) / 2, Math.PI / 2, SK / 2, SK, SKD);
  run(RW, 0, zB + 0.012, 0, PR, 0.035, 0.024); run(RW, 0, zF - 0.012, 0, PR, 0.035, 0.024);
  run(RD, -RW / 2 + 0.012, (zB + zF) / 2, Math.PI / 2, PR, 0.035, 0.024); run(RD, RW / 2 - 0.012, (zB + zF) / 2, Math.PI / 2, PR, 0.035, 0.024);

  // ---- doorway: architrave, reveal linings, and the dark hall where nothing ever is ----
  {
    const A = 0.07, AD = 0.022, REV = 0.12;
    box(A, D.h + A, AD, paint, dx0 - A / 2, (D.h + A) / 2, zB + AD / 2);
    box(A, D.h + A, AD, paint, dx1 + A / 2, (D.h + A) / 2, zB + AD / 2);
    box(D.w + 2 * A, A, AD, paint, D.x, D.h + A / 2, zB + AD / 2);
    box(0.02, D.h, REV, paint, dx0 + 0.01, D.h / 2, zB - REV / 2);
    box(0.02, D.h, REV, paint, dx1 - 0.01, D.h / 2, zB - REV / 2);
    box(D.w, 0.02, REV, paint, D.x, D.h - 0.01, zB - REV / 2);
    const hallMat = new THREE.MeshLambertMaterial({ color: 0x5a6470, map: wallTex, side: THREE.BackSide });
    const hall = new THREE.Mesh(new THREE.BoxGeometry(2.2, RH, 3.2), hallMat);
    hall.position.set(D.x - 0.2, RH / 2, zB - REV - 1.6); add(hall);
    const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), new THREE.MeshLambertMaterial({ color: 0x3a3a3a, map: floorTex }));
    hallFloor.rotation.x = -Math.PI / 2; hallFloor.position.set(D.x - 0.2, 0.002, zB - REV - 1.6); add(hallFloor);
    // a coat on a hook on the hall's far wall and a newel post: shapes that are only ever shapes
    box(0.08, 1.05, 0.08, new THREE.MeshLambertMaterial({ color: 0x2b211a }), D.x + 0.55, 0.52, zB - 1.2);
    box(0.11, 0.06, 0.11, new THREE.MeshLambertMaterial({ color: 0x2b211a }), D.x + 0.55, 1.07, zB - 1.2);
  }

  // ---- windows: reveal, sash frame with glazing bars, sill; the street beyond; curtains ----
  const linenTex = tex(T.linen(), { repeat: [2.5, 2] });
  const curtainMat = new THREE.MeshLambertMaterial({ map: linenTex, side: THREE.DoubleSide });
  const streetTex = tex(T.street());
  const warmTex = tex(T.warmWindow());
  const glowTex = tex(T.glow());
  const neighbourMats = [];
  // build one window in a local frame: x along the wall, y up, +z into the room; returns the group
  function windowAt(Wn, flip) {
    const g = new THREE.Group();
    const REV = 0.2, F = 0.05;
    // reveal linings (wall thickness)
    const lining = new THREE.MeshLambertMaterial({ color: 0x8f97a0 });
    const lin = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lining); m.position.set(x, y, z); m.receiveShadow = true; g.add(m); };
    lin(0.02, Wn.h, REV, -Wn.w / 2 - 0.01, 0, -REV / 2); lin(0.02, Wn.h, REV, Wn.w / 2 + 0.01, 0, -REV / 2);
    lin(Wn.w, 0.02, REV, 0, Wn.h / 2 + 0.01, -REV / 2);
    // sill board, proud of the wall, and the architrave
    const sill = new THREE.Mesh(new THREE.BoxGeometry(Wn.w + 0.2, 0.03, REV + 0.06), paint);
    sill.position.set(0, -Wn.h / 2 - 0.015, -REV / 2 + 0.03); sill.receiveShadow = true; sill.castShadow = true; g.add(sill);
    const fr = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), paint); m.position.set(x, y, z); m.receiveShadow = true; g.add(m); };
    fr(0.06, Wn.h + 0.06, 0.02, -Wn.w / 2 - 0.03, 0.03, 0.01); fr(0.06, Wn.h + 0.06, 0.02, Wn.w / 2 + 0.03, 0.03, 0.01);
    fr(Wn.w + 0.18, 0.06, 0.02, 0, Wn.h / 2 + 0.03, 0.01);
    // the sash: outer frame, a meeting rail, glazing bars (two over two)
    const zs = -REV + 0.05;
    fr(F, Wn.h, 0.04, -Wn.w / 2 + F / 2, 0, zs); fr(F, Wn.h, 0.04, Wn.w / 2 - F / 2, 0, zs);
    fr(Wn.w, F, 0.04, 0, Wn.h / 2 - F / 2, zs); fr(Wn.w, F, 0.04, 0, -Wn.h / 2 + F / 2, zs);
    fr(Wn.w, 0.045, 0.05, 0, 0, zs + 0.01);
    fr(0.022, Wn.h, 0.03, 0, 0, zs);
    // glass: the faintest cool sheen (a reflection, not a light)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(Wn.w, Wn.h), new THREE.MeshBasicMaterial({ color: 0x4a5a70, transparent: true, opacity: 0.07, depthWrite: false }));
    glass.position.z = zs - 0.005; g.add(glass);
    // curtains on a pole: one drawn a third across, one gathered back (half-drawn), linen with folds
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, Wn.w + 0.6, 10), new THREE.MeshLambertMaterial({ color: 0x3b2a1c }));
    pole.rotation.z = Math.PI / 2; pole.position.set(0, Wn.h / 2 + 0.16, 0.08); g.add(pole);
    const ch = Wn.h + 0.16 + Wn.h / 2 + 0.6 - 0.02;                       // curtain drop: pole to below the sill
    const curtain = (width, folds, x, seed) => {
      const cg = new THREE.PlaneGeometry(width, Wn.h + 0.5, 28, 6), p = cg.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = (p.getX(i) / width) + 0.5, v = (p.getY(i) / (Wn.h + 0.5)) + 0.5;
        const z = 0.05 * Math.sin(u * folds * Math.PI * 2 + hash01(seed, 0) * 6) + 0.015 * Math.sin(u * folds * 5.1 + v * 2);
        p.setZ(i, z * (0.7 + 0.3 * (1 - v)));
      }
      cg.computeVertexNormals();
      const m = new THREE.Mesh(cg, curtainMat); m.castShadow = true; m.receiveShadow = true;
      m.position.set(x, Wn.h / 2 + 0.15 - (Wn.h + 0.5) / 2, 0.09); g.add(m); return m;
    };
    curtain(0.36, 5, -Wn.w / 2 + 0.0, 11);                                // drawn a little over the left pane
    curtain(0.26, 4.5, Wn.w / 2 + 0.15, 12);                                    // gathered at the right
    void ch;
    // the street beyond and the neighbour's window (positioned by the caller in world space)
    const streetMat = new THREE.MeshBasicMaterial({ map: streetTex });
    const nMat = new THREE.MeshBasicMaterial({ map: warmTex, color: 0xffffff });
    const gMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    neighbourMats.push({ nMat, gMat });
    g.userData = { streetMat, nMat, gMat };
    void flip;
    return g;
  }
  const win1 = windowAt(W1); win1.position.set(W1.x, W1.y, zB); group.add(win1);
  const win2 = windowAt(W2); win2.rotation.y = Math.PI; win2.position.set(W2.x, W2.y, zF); group.add(win2);

  // street backdrops and the neighbour's window, on the ray from the camera that sees each window
  const N = ROOM.neighbour;
  function outside(win, Wn, wallZ, dirZ, cam, aimLocal) {
    // aim point in the window aperture (world), then out along the camera ray to `beyond` metres past the wall
    const aim = new THREE.Vector3(Wn.x + aimLocal[0] * (dirZ < 0 ? 1 : -1), Wn.y + aimLocal[1], wallZ);
    const c = new THREE.Vector3(...cam.pos), ray = aim.clone().sub(c).normalize();
    const t = N.beyond / Math.abs(ray.z), p = aim.clone().addScaledVector(ray, t);
    const facade = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), win.userData.streetMat);
    facade.position.set(p.x, p.y + 1.6, p.z + dirZ * 0.05); if (dirZ > 0) facade.rotation.y = Math.PI; group.add(facade);
    const nw = new THREE.Mesh(new THREE.PlaneGeometry(N.w, N.h), win.userData.nMat);
    nw.position.copy(p); if (dirZ > 0) nw.rotation.y = Math.PI; group.add(nw);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(N.w * 3.2, N.h * 2.6), win.userData.gMat);
    halo.position.copy(p); halo.position.z -= dirZ * 0.03; if (dirZ > 0) halo.rotation.y = Math.PI; group.add(halo);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ color: 0x0c1626 }));
    sky.position.set(p.x, p.y + 6, p.z + dirZ * 3); if (dirZ > 0) sky.rotation.y = Math.PI; group.add(sky);
    return { nw, halo };
  }
  const out1 = outside(win1, W1, zB, -1, wideCam, [0.2, 0.26]);
  const out2 = outside(win2, W2, zF, +1, reverseCam, [0.2, 0.25]);

  // ---- moonlight spill: a cool patch under each window (no light: an additive decal) ----
  const spillTex = tex(T.moonSpill(), { srgb: false });
  const spillMat = new THREE.MeshBasicMaterial({ color: 0x5a6c8c, alphaMap: spillTex, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending });
  const spill1 = new THREE.Mesh(new THREE.PlaneGeometry(W1.w * 0.95, 0.9), spillMat);
  spill1.rotation.x = -Math.PI / 2; spill1.position.set(W1.x - 0.05, 0.003, zB + 0.55); group.add(spill1);
  const spill2 = new THREE.Mesh(new THREE.PlaneGeometry(W2.w * 0.95, 0.9), spillMat);
  spill2.rotation.x = -Math.PI / 2; spill2.rotation.z = Math.PI; spill2.position.set(W2.x + 0.05, 0.003, zF - 0.55); group.add(spill2);
  const sillGlow = new THREE.Mesh(new THREE.PlaneGeometry(W1.w * 0.9, 0.16), new THREE.MeshBasicMaterial({ color: 0x3c4c66, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  sillGlow.rotation.x = -Math.PI / 2; sillGlow.position.set(W1.x, W1.y - W1.h / 2 + 0.002, zB + 0.03); group.add(sillGlow);

  // contact shadows along the room's base are in roomAO; the shell needs no decals
  void contactShadow;

  const LIT = new THREE.Color(0xffffff), DARK = new THREE.Color(0x10131a);
  function update(S) {
    const lit = !!S.windowLit;
    for (const { nMat, gMat } of neighbourMats) { nMat.color.copy(lit ? LIT : DARK); gMat.opacity = lit ? 1 : 0; }
    out1.halo.visible = out2.halo.visible = lit;
  }
  return { group, update };
}
