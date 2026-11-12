// The small glass and line pieces the five signature moments share (SPEC 2.4, 2.5, 3.4): doors on floor 1,
// cores inside a floor, sockets, lamps, arcs between floors, and a gate. Each call returns an object with the
// fields a signature sets, an update() it calls every frame, and a dispose(). All of them ride their tower.
import { AdditiveBlending, BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, Line, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, SphereGeometry, Sprite, SpriteMaterial, TorusGeometry, Vector3 } from 'three';
import { smooth } from '../core/clock.js';
import { owner as ownerOf } from '../worlds/index.js';
import { FLOOR } from './stack.js';

const INK = '#0C0D10';
// how a line says who stands behind a link: documented, partly documented, unofficial
const DASH = { yes: null, partial: [0.2, 0.12], no: [0.07, 0.07] };

export function createPrims(ctx) {
  const { mats, textures } = ctx;
  const drop = (group) => { group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); group.removeFromParent(); };

  return {
    // Spheres circling inside floor i: one per entry of `list` ([ownerId, status]). Released ones are solid in
    // their owner's colour, announced or preview ones hatched, outside ones grey. active[k] 0..1 makes one glow.
    cores(tower, i, list, { radius = 0.105, ring = 0.56, side = 0, ghost = false } = {}) {
      const group = new Group();
      tower.group.add(group);
      const geo = new SphereGeometry(radius, 26, 18);
      const items = list.map(([id, status], k) => {
        const own = ownerOf(id);
        const mesh = new Mesh(geo, mats.core(own, { side, ghost, hatch: status === 'announced' || status === 'preview' }));
        mesh.renderOrder = 14;
        const halo = new Sprite(new SpriteMaterial({ map: textures.halo(), color: new Color(own.glow), blending: AdditiveBlending, transparent: true, depthTest: false, opacity: 0 }));
        halo.renderOrder = 15;
        mesh.add(halo); group.add(mesh);
        return { mesh, halo, owner: id, status, angle: (k / list.length) * Math.PI * 2 - Math.PI / 2, active: 0 };
      });
      const set = {
        items, spin: 0, spread: 1, show: 1, night: 0, fade: 1,       // fade: how clearly an idle core shows (ghost cores)
        update() {
          const y = tower.floors[i].y;
          items.forEach((c) => {
            const a = c.angle + set.spin, r = ring * (0.72 + 0.28 * set.spread);
            c.mesh.position.set(tower.floors[i].mesh.position.x + Math.cos(a) * r, y, -Math.sin(a) * r * 0.82);
            c.mesh.scale.setScalar(1 + smooth(c.active) * 0.32);
            c.mesh.material.uniforms.uActive.value = smooth(c.active);
            c.mesh.material.uniforms.uShow.value = set.show;
            c.mesh.material.uniforms.uFade.value = ghost ? Math.min(1, set.fade + smooth(c.active)) : 1;
            c.mesh.visible = set.show > 0.01;
            c.halo.material.opacity = set.night * (0.16 + smooth(c.active) * 0.6) * set.show;
            c.halo.scale.setScalar(0.5 + smooth(c.active) * 1.6);
          });
        },
        dispose() { items.forEach((c) => c.halo.material.dispose()); drop(group); },
      };
      return set;
    },

    // A short row of n door slabs standing on floor 1: this company's products. `open` is the one that is ajar.
    doors(tower, n, { side = 0 } = {}) {
      const group = new Group();
      tower.group.add(group);
      const w = Math.min(0.2, (FLOOR.w - 0.5) / n - 0.05);
      const geo = new BoxGeometry(w, 0.32, 0.03).translate(w / 2, 0.16, 0);
      const leaves = Array.from({ length: n }, (_, k) => {
        const mesh = new Mesh(geo, mats.glass(tower.owner, { halfH: 0.16, side, alpha: 0.8 }));
        mesh.position.x = (k - n / 2) * (w + 0.05) + 0.025;
        group.add(mesh);
        return { mesh, swing: 0 };
      });
      const set = {
        leaves, open: 0, show: 1,
        update(dt = 0.016) {
          group.position.set(tower.floors[0].mesh.position.x, tower.floors[0].y + FLOOR.h / 2, FLOOR.w / 2 - 0.2);
          leaves.forEach((d, k) => {
            d.swing += ((k === set.open ? 1 : 0) - d.swing) * (1 - Math.exp(-9 * dt));
            d.mesh.rotation.y = -d.swing * 1.15;
            const u = d.mesh.material.uniforms;
            u.uShow.value = set.show * tower.show; u.uPulse.value = k === set.open ? 0.35 : 0; u.uDim.value = tower.dim;
            d.mesh.visible = set.show > 0.01;
          });
        },
        dispose() { drop(group); },
      };
      return set;
    },

    // Sockets on the top of floor i, in a row: a ring each. filled[k] true seats a glass disc in it.
    // The owning signature slides the floor out (floors[i].slide) so they show.
    sockets(tower, i, filled, { side = 0 } = {}) {
      const group = new Group();
      tower.group.add(group);
      const ringGeo = new TorusGeometry(0.2, 0.02, 10, 40).rotateX(Math.PI / 2);
      const discGeo = new SphereGeometry(0.15, 22, 12).scale(1, 0.22, 1);
      const items = filled.map((on, k) => {
        const ring = new Mesh(ringGeo, new MeshBasicMaterial({ color: INK, transparent: true }));
        const disc = on ? new Mesh(discGeo, mats.core(tower.owner, { side })) : null;
        ring.position.x = (k - (filled.length - 1) / 2) * 0.62;
        if (disc) ring.add(disc);
        group.add(ring);
        return { ring, disc };
      });
      const set = {
        items, show: 1, dark: 0,
        update() {
          group.position.set(tower.floors[i].mesh.position.x, tower.floors[i].y + FLOOR.h / 2 + 0.03, 0.25);
          items.forEach((s) => { s.ring.material.opacity = set.show; s.ring.material.color.set(INK).lerp(new Color('#F8F9FB'), set.dark); s.ring.visible = set.show > 0.01; });
        },
        dispose() { drop(group); },
      };
      return set;
    },

    // Small lamps on the front of floor i, one per value: yes lit, partial half (hatched), no dark, unknown a dotted ring.
    lamps(tower, i, values, { side = 0 } = {}) {
      const group = new Group();
      tower.group.add(group);
      const geo = new SphereGeometry(0.075, 18, 12);
      const ringGeo = new TorusGeometry(0.07, 0.012, 6, 14);
      const off = ownerOf('outside');
      const items = values.map((value, k) => {
        const mesh = value === 'unknown'
          ? new Mesh(ringGeo, new MeshBasicMaterial({ color: INK, transparent: true }))
          : new Mesh(geo, mats.core(value === 'no' ? { ...off, glass: '#3A3D44' } : tower.owner, { side, hatch: value === 'partial' }));
        mesh.position.set((k - (values.length - 1) / 2) * 0.34, 0, 0);
        group.add(mesh);
        return { mesh, value, lit: value === 'yes' ? 1 : value === 'partial' ? 0.5 : 0 };
      });
      const set = {
        items, show: 1, level: 1,
        update() {
          group.position.set(tower.floors[i].mesh.position.x + 0.3, tower.floors[i].y, FLOOR.w / 2 + 0.09);
          items.forEach((l) => {
            l.mesh.visible = set.show > 0.01;
            const u = l.mesh.material.uniforms;
            if (u) { u.uActive.value = l.lit * set.level; u.uShow.value = set.show; } else l.mesh.material.opacity = set.show * 0.7;
          });
        },
        dispose() { drop(group); },
      };
      return set;
    },

    // A curved line from one point to another (Vector3s, re-read every update), in `color`. official: yes, partial
    // or no picks solid, long dash or short dash. draw 0..1 runs it out from its start. lift bends it up or down.
    arc(from, to, { color = INK, official = 'yes', lift = 1.2, side = 0, dots = true } = {}) {
      const SEG = 44;
      const geo = new BufferGeometry();
      geo.setAttribute('position', new Float32BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
      const dash = DASH[official] || null;
      const mat = dash ? new LineDashedMaterial({ color, dashSize: dash[0], gapSize: dash[1], transparent: true }) : new LineBasicMaterial({ color, transparent: true });
      const line = new Line(geo, mat);
      line.frustumCulled = false; line.renderOrder = 16;
      const dotMat = new MeshBasicMaterial({ color, transparent: true });
      const ends = dots ? [0, 1].map(() => new Mesh(new SphereGeometry(0.06, 14, 10), dotMat)) : [];
      ctx.scene.add(line, ...ends);
      const mid = new Vector3();
      let key = '';
      const set = {
        line, draw: 1, show: 1, dark: 0, color: new Color(color), mid,
        update() {
          const on = set.show > 0.01 && set.draw > 0.005 && (side === 0 || mats.shared.uIris.value.z > 0.5);
          line.visible = on; ends.forEach((d) => { d.visible = on; });
          if (!on) return;
          const a = from, b = to;
          const k = `${a.x.toFixed(2)},${a.y.toFixed(2)},${a.z.toFixed(2)},${b.x.toFixed(2)},${b.y.toFixed(2)},${b.z.toFixed(2)}`;
          if (k !== key) {
            key = k;
            mid.addVectors(a, b).multiplyScalar(0.5); mid.y += lift;
            const pos = geo.attributes.position;
            for (let n = 0; n <= SEG; n++) {
              const u = n / SEG, w0 = (1 - u) * (1 - u), w1 = 2 * (1 - u) * u, w2 = u * u;
              pos.setXYZ(n, a.x * w0 + mid.x * w1 + b.x * w2, a.y * w0 + mid.y * w1 + b.y * w2, a.z * w0 + mid.z * w1 + b.z * w2);
            }
            pos.needsUpdate = true;
            if (dash) line.computeLineDistances();
          }
          geo.setDrawRange(0, Math.max(2, Math.round((SEG + 1) * smooth(set.draw))));
          mat.color.copy(set.color).lerp(new Color('#F8F9FB'), set.dark); mat.opacity = set.show * 0.9;
          dotMat.color.copy(mat.color); dotMat.opacity = set.show;
          if (ends.length) { ends[0].position.copy(a); ends[1].position.copy(b); ends[1].scale.setScalar(smooth(set.draw * 2 - 1)); }
        },
        dispose() { ctx.scene.remove(line, ...ends); geo.dispose(); mat.dispose(); dotMat.dispose(); ends.forEach((d) => d.geometry.dispose()); },
      };
      return set;
    },

    // A small gate on floor i with its bar down. lift 0..1 raises the bar.
    gate(tower, i, { side = 0 } = {}) {
      const group = new Group();
      tower.group.add(group);
      const glass = () => mats.glass(tower.owner, { halfH: 0.2, side, alpha: 0.88 });
      const posts = [-0.34, 0.34].map((x) => { const m = new Mesh(new BoxGeometry(0.07, 0.42, 0.07).translate(0, 0.21, 0), glass()); m.position.x = x; group.add(m); return m; });
      const bar = new Mesh(new BoxGeometry(0.72, 0.05, 0.05).translate(0.36, 0, 0), new MeshBasicMaterial({ color: INK, transparent: true }));
      bar.position.set(-0.34, 0.3, 0);
      group.add(bar);
      const set = {
        group, lift: 0, show: 1, x: 0,
        update() {
          group.position.set(tower.floors[i].mesh.position.x + set.x, tower.floors[i].y + FLOOR.h / 2, FLOOR.w / 2 - 0.25);
          bar.rotation.z = smooth(set.lift) * 1.35;
          bar.material.opacity = set.show; group.visible = set.show > 0.01;
          posts.forEach((p) => { p.material.uniforms.uShow.value = set.show; });
        },
        dispose() { drop(group); },
      };
      return set;
    },
  };
}
