// The architecture package's house glass (SPEC 2.9): rounded blocks, the nine-block base under the row (2.9.1),
// the owner's bench with five shelves and dovetailed pieces (2.9.2), a soft contact shadow, and floor ribbons
// for the ink diagrams of 2.9.3 to 2.9.5. Builders return plain fields a section sets every frame. No words here.
import { BufferGeometry, CanvasTexture, Color, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, Shape, SphereGeometry, Vector3 } from 'three';
import { smooth } from '../core/clock.js';
import { owner } from '../worlds/index.js';

export const INK = '#0C0D10';
// The camera stops of the five architecture sections, chained: each section starts where the one before it ends.
export const STOPS = {
  around: { pos: [0, 8.4, 30.5], look: [0, 2.35, 0.6], fov: 24, fit: 23.5, cy: 0.48 },
  bench: { pos: [0, 5.6, 27.5], look: [0, 2.05, 3.2], fov: 24, fit: 22.4, cy: 0.42 },
  router: { pos: [0, 17.8, 14.6], look: [0, 0, 4.15], fov: 24, fit: 20.5, cy: 0.42 },
  board: { pos: [-0.4, 2.7, 29.5], look: [-0.4, 1.75, 0], fov: 24, fit: 24.4, cx: 0.565, cy: 0.36 },
  rail: { pos: [-0.4, 3.0, 27], look: [-0.4, 2.05, 1.6], fov: 24, fit: 23.6, cy: 0.36 },
};
const shapeOf = (w, d, r) => {
  const x = w / 2, z = d / 2;
  r = Math.min(r, x, z);
  const s = new Shape();
  s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.absarc(x - r, -z + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x, z - r); s.absarc(x - r, z - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, z); s.absarc(-x + r, z - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-x, -z + r); s.absarc(-x + r, -z + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};

// A rounded block w x h x d centred on its origin, with the small chamfer the floors have (stack.js).
export function roundBox(w, h, d, r = 0.12) {
  const b = Math.min(0.03, h / 5);
  const g = new ExtrudeGeometry(shapeOf(w - 2 * b, d - 2 * b, Math.max(0.01, r - b)), { depth: h - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -(h - 2 * b) / 2);
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

// A dovetail: the trapezoid a borrowed piece is keyed into the bench with, wide at the bottom. Its front face
// is seen on the bench's front, and an ink line traces the seam.
export function dovetail(w, h, depth = 0.05) {
  const s = new Shape();
  s.moveTo(-w * 0.36, h / 2); s.lineTo(w * 0.36, h / 2); s.lineTo(w * 0.5, -h / 2); s.lineTo(-w * 0.5, -h / 2); s.lineTo(-w * 0.36, h / 2);
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false });
  const pts = [[-0.36, 0.5], [0.36, 0.5], [0.5, -0.5], [-0.5, -0.5], [-0.36, 0.5]].map(([x, y]) => new Vector3(x * w, y * h, depth + 0.004));
  return { geo: g, seam: new BufferGeometry().setFromPoints(pts) };
}

// A glass block of an owner's colour (or house grey) with fields: show, lit (glow), dim, hatch.
export function block(ctx, geo, who, h, { alpha = 0.9 } = {}) {
  const mesh = new Mesh(geo, ctx.mats.glass(typeof who === 'string' ? owner(who) : who, { halfH: h / 2, alpha }));
  return mesh;
}
export function setGlass(mesh, { show = 1, lit = 0, dim = 0, hatch = 0 } = {}) {
  const u = mesh.material.uniforms;
  u.uShow.value = show;
  if (u.uPulse) { u.uPulse.value = lit; u.uDim.value = dim; u.uHatch.value = hatch; } else u.uActive.value = lit;
  mesh.visible = show > 0.01;
}

// A soft dark rectangle on the floor under something long that the analytic ground cannot shade (it knows towers).
let shadowTex = null;
export function shadow(ctx, w, d, { opacity = 0.2, soft = 0.45 } = {}) {
  if (!shadowTex) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const g = c.getContext('2d');
    g.filter = 'blur(14px)'; g.fillStyle = '#000'; g.fillRect(26, 26, 76, 76);
    shadowTex = new CanvasTexture(c);
  }
  const mat = new MeshBasicMaterial({ color: INK, alphaMap: shadowTex, transparent: true, opacity, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(w * (1 + soft), d * (1 + soft * 1.6)).rotateX(-Math.PI / 2), mat);
  mesh.renderOrder = -5;
  mesh.userData.opacity = opacity;
  ctx.scene.add(mesh);
  return mesh;
}

// The nine-block base of 2.9.1: blocks along x under the five stacks. rise[k] 0..1 lifts block k out of the floor.
export function createBase(ctx, { n = 9, span = 20.6, h = 0.62, d = 3.2, z = 0, gap = 0.12 } = {}) {
  const group = new Group();
  ctx.scene.add(group);
  const w = (span - gap * (n - 1)) / n;
  const geo = roundBox(w, h, d, 0.16);
  const blocks = Array.from({ length: n }, (_, k) => {
    const mesh = block(ctx, geo, 'house', h, { alpha: 0.88 });
    mesh.position.set(-span / 2 + w / 2 + k * (w + gap), -h / 2, z);
    group.add(mesh);
    return { mesh, x: mesh.position.x, rise: 0, lit: 0, push: 0, dim: 0, front: new Vector3() };
  });
  const shade = shadow(ctx, span, d, { opacity: 0.16 });
  shade.position.set(0.9, 0.003, z + 0.7);
  const set = {
    blocks, w, h, d, z, show: 1, span,
    // how high the base under the span [x0, x1] stands right now: what a stack there must be lifted by
    under(x0, x1) {
      let top = 0;
      for (const b of blocks) if (b.x + w / 2 > x0 && b.x - w / 2 < x1) top = Math.max(top, b.rise * h);
      return top;
    },
    update() {
      let up = 0;
      blocks.forEach((b) => {
        const r = smooth(b.rise);
        b.mesh.position.set(b.x, h * (r - 0.5) + b.push * 0.12, z + b.push * 0.3);
        setGlass(b.mesh, { show: set.show * Math.min(1, b.rise * 6), lit: b.lit, dim: b.dim });
        b.front.set(b.x, b.mesh.position.y, z + d / 2 + b.push * 0.3);
        up += r;
      });
      shade.material.opacity = shade.userData.opacity * set.show * (up / n);
      shade.visible = shade.material.opacity > 0.004;
    },
    dispose() { group.removeFromParent(); geo.dispose(); blocks.forEach((b) => b.mesh.material.dispose()); shade.removeFromParent(); shade.geometry.dispose(); shade.material.dispose(); },
  };
  set.update();
  return set;
}

// A flat ink ribbon on the floor from a to b (Vector3s, y ignored). kind: '' solid, 'dash', 'pale'.
// draw 0..1 runs it out from a. A dashed ribbon keeps its dash in place as it grows.
let dashTex = null;
export function ribbon(ctx, { width = 0.05, kind = '', color = INK, y = 0.012 } = {}) {
  if (kind === 'dash' && !dashTex) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 4;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 34, 4);
    dashTex = new CanvasTexture(c); dashTex.wrapS = RepeatWrapping;
  }
  const geo = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0);
  const mat = new MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: DoubleSide, alphaMap: kind === 'dash' ? dashTex.clone() : null });
  if (mat.alphaMap) { mat.alphaMap.wrapS = RepeatWrapping; mat.alphaMap.needsUpdate = true; }
  const mesh = new Mesh(geo, mat);
  mesh.renderOrder = 4;
  ctx.scene.add(mesh);
  const a = new Vector3(), b = new Vector3();
  const set = {
    mesh, a, b, draw: 1, show: 1, opacity: kind === 'pale' ? 0.32 : 0.86, color: new Color(color),
    update() {
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const k = smooth(set.draw);
      mesh.position.set(a.x, y, a.z);
      mesh.rotation.set(0, -Math.atan2(b.z - a.z, b.x - a.x), 0);
      mesh.scale.set(Math.max(0.0001, len * k), 1, width);
      if (mat.alphaMap) { mat.alphaMap.repeat.set((len * k) / 0.2, 1); }
      mat.color.copy(set.color);
      mat.opacity = set.opacity * set.show;
      mesh.visible = set.show > 0.01 && k > 0.002;
    },
    dispose() { mesh.removeFromParent(); geo.dispose(); if (mat.alphaMap) mat.alphaMap.dispose(); mat.dispose(); },
  };
  return set;
}

// A small sphere: the dot that is you (ink) or a bead travelling a line (an owner's colour).
export function dot(ctx, radius, who = null, { segments = 22 } = {}) {
  const ink = { glass: INK, rim: '#4A4E57', glow: '#FFFFFF' };
  const mesh = new Mesh(new SphereGeometry(radius, segments, Math.round(segments * 0.7)), ctx.mats.core(who ? owner(who) : ink));
  mesh.renderOrder = 9;
  ctx.scene.add(mesh);
  return mesh;
}

// A thin ink polyline in the scene (a seam, a needle). points: Vector3[]
export function inkLine(points, opacity = 0.8) {
  const line = new Line(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: INK, transparent: true, opacity }));
  line.renderOrder = 12;
  return line;
}

// Free everything under a group or mesh.
export function drop(node) {
  if (!node) return;
  node.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.alphaMap) o.material.alphaMap.dispose(); o.material.dispose(); } });
  node.removeFromParent();
}
