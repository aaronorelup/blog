// The row of five (SPEC 4.1): one tower per company at x = -8.4 to 8.4, each with its lid plate (the official
// mark, always facing the screen) and its character. row.reset() restores every per-frame field, the active
// section sets what it needs, and row.update() draws that state and feeds the floor shadows.
import { BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, LineBasicMaterial, LineSegments, Mesh, PlaneGeometry, Raycaster, SphereGeometry, Vector2, Vector3 } from 'three';
import { lerp } from '../core/clock.js';
import { owner, world, ORDER } from '../worlds/index.js';
import { createTower, FLOOR } from './stack.js';

export const ROW_X = [-8.4, -4.2, 0, 4.2, 8.4];
const LEDGE = FLOOR.w / 2 + 0.62;
const BIG_WIDE = 1.6;     // how much larger a character stands when a world opens (pose "beside")

export function createRow(ctx) {
  const BIG = ctx.phone ? 1.15 : BIG_WIDE;
  const { scene, mats, textures, data } = ctx;
  const pale = (hex) => { const c = new Color(hex); return c.r + c.g + c.b > 2.2 ? new Color('#B9BEC8') : c; };

  const towers = ORDER.map((id, t) => {
    const cfg = world(id);
    const tower = createTower(ctx, { id, x: ROW_X[t], owner: owner(id), cells: data.p[id].stack, ownerOf: owner, ink: '#0C0D10' });
    tower.index = t; tower.cfg = cfg;
    tower.shadow = pale(owner(id).prism ? owner(id).prism[2] : owner(id).glass);
    scene.add(tower.group);

    // the lid plate: the official mark on its plate. It never tilts: it is always turned to the camera
    const plate = new Mesh(new PlaneGeometry(1, 1), mats.paper(null, { side: 0, blended: true }));
    plate.visible = false; plate.renderOrder = 8;
    scene.add(plate);
    tower.lid = { mesh: plate, lift: 1, show: 1, size: 1.1 };
    const name = document.querySelector(`.ail-world[data-world="${id}"] .ail-mark img`)?.alt || document.querySelector(`.ail-world[data-world="${id}"] .ail-mark__name`)?.textContent || id;
    textures.markPlate({ url: cfg.marks.lid, name, plate: cfg.marks.plate, clear: cfg.marks.clear }).then((tex) => {
      plate.material.uniforms.uMap.value = tex; plate.visible = true;
      if (!tex.userData.over) return;
      // a mark that cannot be drawn to a canvas: the official file itself rides the blank plate as an image
      const img = document.createElement('img');
      img.src = cfg.marks.lid; img.alt = ''; img.className = 'ail-lidmark';
      document.body.appendChild(img);
      tower.lid.dom = img; tower.lid.domK = tex.userData.over;
    });

    // the character: a real sphere for kind "orb3d", else the hero cut-out on a quad that faces the camera
    const kind = cfg.character.kind;
    const size = cfg.character.size;
    const body = kind === 'orb3d'
      ? new Mesh(new SphereGeometry(0.5, 48, 32), mats.orb())
      : new Mesh(new PlaneGeometry(1, 1), mats.paper(null, { side: 0, blended: true }));
    body.renderOrder = 7; body.visible = kind === 'orb3d';
    scene.add(body);
    if (kind !== 'orb3d') textures.load(cfg.art.hero).then((tex) => { if (tex) { body.material.uniforms.uMap.value = tex; body.visible = true; } });
    const ledge = new Mesh(new BoxGeometry(1.5, 0.05, 0.95).translate(-0.17, 0, 0), mats.glass(owner(id), { halfH: 0.025, alpha: 0.82 }));
    tower.group.add(ledge);
    tower.char = { mesh: body, ledge, kind, size, floor: cfg.character.floor - 1, from: 'floor', to: 'floor', t: 1, show: 1, scale: 1, pos: new Vector3(), blink: 2 + t };
    return tower;
  });

  // datum lines: the nine floor levels drawn across all five, like an elevation drawing
  const pts = [];
  for (let i = 0; i < FLOOR.n; i++) { const y = FLOOR.h / 2 + i * (FLOOR.h + FLOOR.gap0); pts.push(-10.4, y, -1.35, 10.4, y, -1.35); }
  const datumGeo = new BufferGeometry();
  datumGeo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  const datum = new LineSegments(datumGeo, new LineBasicMaterial({ color: '#0C0D10', transparent: true, opacity: 0 }));
  scene.add(datum);

  const ray = new Raycaster();
  const ndc = new Vector2();
  const a = new Vector3();
  const b = new Vector3();
  const floorsOf = (list) => list.flatMap((tw) => tw.floors.map((f) => f.mesh));

  // Where a character stands for each named pose, in world units.
  function pose(tower, name, out) {
    const c = tower.char;
    const x = tower.x + tower.shift;
    if (name === 'top') return out.set(x, tower.height + tower.lift + c.size * 0.5, tower.z + 0.2);
    // beside: large, on the ground to the right of the stack (on a phone, where there is no room, on its lid)
    if (name === 'beside') return ctx.phone ? out.set(x, tower.height + tower.lift + c.size * BIG * 0.5, tower.z + 0.2) : out.set(x + 2.9, c.size * BIG * 0.5 + 0.02, tower.z + 0.8);
    return out.set(x - LEDGE, tower.floors[c.floor].y + tower.lift + FLOOR.h / 2 + c.size * 0.5, tower.z + 0.25);
  }
  const big = (name) => (name === 'beside' ? BIG : name === 'top' ? 0.82 : 1);

  const row = {
    towers, datum: 0,
    tower: (id) => towers.find((tw) => tw.id === id),
    reset() {
      row.datum = 0;
      for (const tw of towers) {
        tw.reset();
        tw.lid.lift = 1; tw.lid.show = 1;
        tw.char.from = 'floor'; tw.char.to = 'floor'; tw.char.t = 1; tw.char.show = 1; tw.char.scale = 1;
      }
    },
    // The floor under a point of the screen: { tower, i } or null. `only` limits it to one tower.
    pick(px, py, only = null) {
      const r = ctx.canvas.getBoundingClientRect();
      ndc.set(((px - r.left) / r.width) * 2 - 1, -((py - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, ctx.camera);
      const hit = ray.intersectObjects(floorsOf(only ? [only] : towers.filter((tw) => tw.show > 0.5)), false)[0];
      return hit ? hit.object.userData : null;
    },
    update(dt, time, input) {
      const cam = ctx.camera;
      towers.forEach((tw, t) => {
        tw.apply(dt);
        const c = ctx.studio.casters[t];
        c.x = tw.x + tw.shift; c.z = tw.z; c.h = tw.height + tw.lift; c.gap = tw.gap; c.color.copy(tw.shadow);
        c.amt = tw.show * (1 - tw.dim * 0.72); c.inside = tw.side < 0 ? 0 : 1;

        const lid = tw.lid;
        const s = lid.size * (0.55 + 0.45 * lid.lift);
        lid.mesh.quaternion.copy(cam.quaternion);
        lid.mesh.scale.set(s, s, 1);
        lid.mesh.position.set(tw.x + tw.shift, tw.height + tw.lift + 0.02 + lid.lift * (lid.size * 0.5 + 0.42), tw.z);
        lid.mesh.material.uniforms.uOpacity.value = lid.show * tw.show * (1 - tw.dim * 0.8);
        lid.mesh.material.uniforms.uSide.value = tw.side;
        lid.mesh.visible = !!lid.mesh.material.uniforms.uMap.value && lid.show * tw.show > 0.01;
        if (lid.dom) {
          const o = lid.show * tw.show * (1 - tw.dim * 0.8) * (tw.side < 0 ? 1 - Math.min(1, (mats.irisOpen || 0) * 3) : 1);
          lid.dom.style.opacity = o.toFixed(3);
          if (o > 0.01) {
            const p = ctx.labels.project(lid.mesh.position);
            const depth = a.copy(lid.mesh.position).sub(cam.position).dot(cam.getWorldDirection(b));
            const px = (s * lid.domK * window.innerHeight) / (2 * depth * Math.tan((cam.fov * Math.PI) / 360));
            lid.dom.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) translate(-50%,-50%) scale(${(px / 100).toFixed(4)})`;
          }
        }

        const c2 = tw.char;
        pose(tw, c2.from, a); pose(tw, c2.to, b);
        const e = c2.t;
        c2.pos.lerpVectors(a, b, e);
        // it hops: high enough to clear the stack when it crosses from one side to the other
        if (c2.from !== c2.to) c2.pos.y += Math.sin(Math.PI * e) * Math.max(0.35, ctx.phone ? 0.35 : tw.height + tw.lift + c2.size * 0.5 + 0.35 - (a.y + b.y) / 2);
        const breathe = ctx.reduced ? 0 : Math.sin(time * 2 * Math.PI * 0.4 + t) * 0.015;
        const sc = c2.size * lerp(big(c2.from), big(c2.to), e) * c2.scale;
        const m = c2.mesh;
        m.position.copy(c2.pos);
        m.visible = c2.show * tw.show > 0.01 && (c2.kind === 'orb3d' || !!m.material.uniforms.uMap.value);
        m.material.uniforms.uSide.value = tw.side;
        if (c2.kind === 'orb3d') {
          m.scale.set(sc, sc * (1 + breathe), sc);
          m.lookAt(cam.position);
          c2.blink -= dt;
          if (c2.blink < -0.13) c2.blink = 2.6 + ((time * 7.3 + t * 3.1) % 3.2);
          m.material.uniforms.uBlink.value = c2.blink < 0 && !ctx.reduced ? 0.08 : 1;
          m.material.uniforms.uLook.value.set(input.x * 0.36, -input.y * 0.24 + 0.02, 1).normalize();   // the eyes follow the pointer
        } else {
          m.quaternion.copy(cam.quaternion);
          m.rotateZ(-input.x * 0.07);                                                       // it leans up to 4 degrees toward the pointer
          m.scale.set(sc, sc * (1 + breathe), 1);
          m.material.uniforms.uOpacity.value = c2.show * tw.show * (1 - tw.dim * 0.8);
        }
        const onLedge = (c2.to === 'floor' ? e : 0) + (c2.from === 'floor' ? 1 - e : 0);
        c2.ledge.visible = onLedge * c2.show > 0.02;
        c2.ledge.position.set(-LEDGE, tw.floors[c2.floor].y + FLOOR.h / 2 - 0.03, 0.25);
        const lu = c2.ledge.material.uniforms;
        lu.uShow.value = Math.min(1, onLedge) * tw.show * c2.show; lu.uDim.value = tw.dim; lu.uSide.value = tw.side;
      });
      datum.visible = row.datum > 0.01;
      datum.material.opacity = row.datum * 0.16;
    },
  };
  return row;
}
