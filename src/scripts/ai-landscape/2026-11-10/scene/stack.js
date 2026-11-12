// One stack: nine floors of cast glass, each in one of the five states of SPEC 3.4, that pulls apart from the
// top. The same tower is used for the five companies, the neutral specimen and any product behind a door.
// Sections set the plain fields (open, dim, lift, floors[i].lit ...) every frame. row.js resets them first.
import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Group, LineDashedMaterial, LineSegments, Mesh, Shape, SphereGeometry, Vector3 } from 'three';
import { lerp, smooth } from '../core/clock.js';

export const FLOOR = { n: 9, w: 2.4, h: 0.26, r: 0.28, gap0: 0.045, gap1: 0.36 };
export const CLOSED = FLOOR.n * FLOOR.h + (FLOOR.n - 1) * FLOOR.gap0;      // 2.70
export const OPEN = FLOOR.n * FLOOR.h + (FLOOR.n - 1) * FLOOR.gap1;        // 5.22

// What each state looks like: glass fill, hatching, frost, and the outline (0 none, dash 1 = dotted).
const STATES = {
  solid: { alpha: 0.9, hatch: 0, frost: 0, line: 0, dash: 0, mark: 0 },
  hatch: { alpha: 0.9, hatch: 1, frost: 0, line: 0, dash: 0, mark: 0 },
  frost: { alpha: 0.97, hatch: 0, frost: 1, line: 0.85, dash: 1, mark: 0 },
  dotted: { alpha: 0, hatch: 0, frost: 0, line: 0.5, dash: 1, mark: 1 },
  hollow: { alpha: 0, hatch: 0, frost: 0, line: 0.8, dash: 0, mark: 0 },
};
const EASED = ['alpha', 'hatch', 'frost', 'line', 'mark'];

function roundedRect(w, r) {
  const h = w / 2;
  const s = new Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h); s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false);
  s.lineTo(h, h - r); s.absarc(h - r, h - r, r, 0, Math.PI / 2, false);
  s.lineTo(-h + r, h); s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-h, -h + r); s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

let slab = null;
let rim = null;
// The one shared slab: 2.4 by 0.26 by 2.4, corner radius 0.28, a small chamfer that catches the light.
export function slabGeometry() {
  if (slab) return slab;
  const b = 0.034;
  slab = new ExtrudeGeometry(roundedRect(FLOOR.w - 2 * b, FLOOR.r - b), { depth: FLOOR.h - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 7 });
  slab.translate(0, 0, -(FLOOR.h - 2 * b) / 2);
  slab.rotateX(-Math.PI / 2);
  slab.computeVertexNormals();
  return slab;
}
// Its outline: the top and bottom edges and four posts, as line segments, for the states with no glass.
function rimGeometry() {
  if (rim) return rim;
  const pts = roundedRect(FLOOR.w, FLOOR.r).getPoints(7);
  const out = [];
  for (const y of [FLOOR.h / 2, -FLOOR.h / 2]) {
    for (let k = 0; k < pts.length; k++) { const a = pts[k], b = pts[(k + 1) % pts.length]; out.push(a.x, y, -a.y, b.x, y, -b.y); }
  }
  const c = FLOOR.w / 2 - FLOOR.r * 0.29;
  for (const [x, z] of [[c, c], [-c, c], [c, -c], [-c, -c]]) out.push(x, FLOOR.h / 2, z, x, -FLOOR.h / 2, z);
  rim = new BufferGeometry();
  rim.setAttribute('position', new Float32BufferAttribute(out, 3));
  return rim;
}
const coreGeo = new SphereGeometry(0.082, 20, 14);

// ctx: { mats, textures }. owner: { glass, rim, glow, prism }. cells: [{ s: state, g: [guest owner ids] }] x 9.
export function createTower(ctx, { id, x = 0, z = 0, owner, cells, ownerOf, ink = '#0C0D10' }) {
  const group = new Group();
  group.position.set(x, 0, z);
  const tower = { id, x, z, group, owner, floors: [], open: 0, dim: 0, show: 1, lift: 0, side: 0, shift: 0, height: CLOSED, night: 0 };
  const v = new Vector3();

  for (let i = 0; i < FLOOR.n; i++) {
    const mat = ctx.mats.glass(owner, { halfH: FLOOR.h / 2 });
    const mesh = new Mesh(slabGeometry(), mat);
    mesh.userData = { tower, i };
    const lineMat = new LineDashedMaterial({ color: ink, transparent: true, opacity: 0, dashSize: 1, gapSize: 0 });
    const line = new LineSegments(rimGeometry(), lineMat);
    line.computeLineDistances();
    line.visible = false;
    group.add(mesh, line);
    tower.floors.push({ i, mesh, line, mat, u: mat.uniforms, state: 'solid', cur: { ...STATES.solid }, target: STATES.solid, y: 0,
      pulse: 0, dim: 0, lit: 0, slide: 0, raise: 0, frost: 0, guests: [], guestShow: 1, mark: null });
  }

  function setGuests(f, owners) {
    f.guests.forEach((g) => { group.remove(g); g.material.dispose(); });
    f.guests = (owners || []).slice(0, 3).map((o, k, all) => {
      const core = new Mesh(coreGeo, ctx.mats.core(ownerOf(o)));
      core.userData.dx = (k - (all.length - 1) / 2) * 0.42 + 0.55;
      group.add(core);
      return core;
    });
  }

  // Give the nine floors their states (and guests). Floors ease to a new state in about 0.7 s unless `now`.
  tower.setCells = (list, now = false) => {
    tower.floors.forEach((f, i) => {
      const c = list[i] || { s: 'solid', g: [] };
      f.state = STATES[c.s] ? c.s : 'solid';
      f.target = STATES[f.state];
      if (now) Object.assign(f.cur, f.target);
      const key = (c.g || []).join(' ');
      if (f.guestKey !== key) { f.guestKey = key; setGuests(f, c.g); }
    });
  };
  // A pale glass (milk white) needs an ink edge on every floor to read on paper: its rim is drawn as a line.
  const edged = (o) => { const n = parseInt(o.glass.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 200 ? 0.7 : 0; };
  tower.edge = edged(owner);
  tower.setOwner = (o) => { tower.owner = o; tower.edge = edged(o); tower.floors.forEach((f) => ctx.mats.setOwner(f.mat, o)); };
  tower.setInk = (hex) => tower.floors.forEach((f) => f.line.material.color.set(hex));

  // Floor heights from `open`: the top floors start first, 0.09 apart.
  tower.layout = () => {
    let y = FLOOR.h / 2 + 0.004;
    for (let i = FLOOR.n - 1; i >= 0; i--) {
      tower.floors[i].y = y;
      if (i > 0) y += FLOOR.h + lerp(FLOOR.gap0, FLOOR.gap1, smooth(tower.open * 1.7 - (i - 1) * 0.09));
    }
    tower.height = tower.floors[0].y + FLOOR.h / 2;
    tower.gap = (tower.height - FLOOR.n * FLOOR.h) / (FLOOR.n - 1);
  };

  // Write this frame's state to the meshes. Called by row.js after the active section has set the fields.
  tower.apply = (dt) => {
    tower.layout();
    group.position.set(tower.x + tower.shift, tower.lift, tower.z);
    group.visible = tower.show > 0.004;
    const k = 1 - Math.exp(-6 * dt);
    // a stack outside an open world: its glass is cut by the iris in the shader, its lines fade with it here
    const out = tower.side < 0 ? 1 - Math.min(1, (ctx.mats.irisOpen || 0) * 4) : 1;
    for (const f of tower.floors) {
      for (const key of EASED) f.cur[key] += (f.target[key] - f.cur[key]) * k;
      f.pulse = Math.max(0, f.pulse - dt * 1.6);
      const y = f.y + f.raise;
      const guests = f.guests.length && f.guestShow > 0.01;
      f.mesh.position.set(f.slide, y, 0);
      f.line.position.copy(f.mesh.position);
      f.u.uAlpha.value = guests ? Math.min(f.cur.alpha, 0.5) : f.cur.alpha;
      f.u.uHatch.value = f.cur.hatch;
      f.u.uFrost.value = Math.max(f.cur.frost, f.frost);
      f.u.uPulse.value = Math.max(smooth(f.pulse), f.lit);
      f.u.uDim.value = Math.max(tower.dim, f.dim);
      f.u.uShow.value = tower.show;
      f.u.uSide.value = tower.side;
      f.mesh.visible = f.cur.alpha > 0.012 || f.frost > 0.01;
      const lineA = Math.max(f.cur.line, f.frost * 0.85, tower.edge * Math.min(1, f.cur.alpha * 2)) * tower.show * out * (1 - Math.max(tower.dim, f.dim) * 0.7);
      f.line.visible = lineA > 0.012;
      f.line.material.opacity = lineA;
      const dotted = f.target.dash > 0.5 || f.frost > 0.5;
      f.line.material.dashSize = dotted ? 0.034 : 1;
      f.line.material.gapSize = dotted ? 0.062 : 0;
      if (f.cur.mark > 0.02 && !f.mark && ctx.textures) {
        f.mark = ctx.textures.glyphPlane('question', 0.2, { side: 0 });
        group.add(f.mark);
      }
      if (f.mark) {
        f.mark.visible = f.cur.mark > 0.02 && tower.show > 0.5;
        f.mark.position.set(f.slide, y, FLOOR.w / 2 + 0.01);
        f.mark.material.uniforms.uOpacity.value = f.cur.mark * 0.7 * (1 - tower.dim);
        f.mark.material.uniforms.uSide.value = tower.side;
      }
      f.guests.forEach((g) => {
        g.visible = guests && tower.show > 0.5;
        g.position.set(f.slide + g.userData.dx, y, 0.2);
        g.material.uniforms.uSide.value = tower.side;
        g.material.uniforms.uShow.value = f.guestShow;
      });
      f.dim = 0; f.lit = 0; f.slide = 0; f.raise = 0; f.frost = 0; f.guestShow = 1;
    }
  };

  // The world position of floor i: its centre, or `sx` half-widths to the side (1 right, -1 left).
  tower.point = (i, sx = 0, out = new Vector3()) => out.set(tower.x + tower.shift + sx * FLOOR.w / 2, tower.floors[i].y + tower.lift, tower.z);
  tower.topPoint = (out = new Vector3(), above = 0) => out.set(tower.x + tower.shift, tower.height + tower.lift + above, tower.z);
  // Where a leader line leaves floor i on screen: the furthest of its corners on that side, at its centre height.
  tower.anchor = (i, side, project) => {
    const f = tower.floors[i];
    const y = f.y + tower.lift;
    const x = tower.x + tower.shift + f.mesh.position.x;            // a floor that has slid out takes its label with it
    let best = -Infinity;
    for (const [cx, cz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const p = project(v.set(x + cx * FLOOR.w / 2, y, tower.z + cz * FLOOR.w / 2));
      best = Math.max(best, side * p.x);
    }
    return { x: side * best, y: project(v.set(x, y, tower.z)).y };
  };
  tower.reset = () => { tower.open = 0; tower.dim = 0; tower.show = 1; tower.lift = 0; tower.side = 0; tower.shift = 0; };
  tower.dispose = () => {
    tower.floors.forEach((f) => { f.mat.dispose(); f.line.material.dispose(); f.guests.forEach((g) => g.material.dispose()); });
    group.removeFromParent();
  };

  tower.setCells(cells || [], true);
  tower.layout();
  return tower;
}
