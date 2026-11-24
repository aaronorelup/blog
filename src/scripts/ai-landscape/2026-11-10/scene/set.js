// The house set (review round 1): what stands behind the row of five in the neutral studio, so a level row is a
// room and the mouse camera has depth to move against. A far wall with a floor join, one tall paper bay behind
// each stack, and slow dust. Unlit paper in the house neutrals only: it adds no hue, goes dark with the room, and
// is drawn only outside an open iris, so no world ever shows it. studio.js builds it, row.js tells the bays where.
import { BufferGeometry, Float32BufferAttribute, Mesh, PlaneGeometry, Points } from 'three';

const WALL = { z: -26, w: 80, h: 30, colour: '#E6E8ED', line: '#C9CDD5' };
const BAY = { z: -9, w: 3.4, h: 7.6, dx: 0.25, colour: '#F8F9FB', torn: 0.14, shade: 0.5 };

export function createSet(ctx, xs) {
  const { scene, mats } = ctx;
  const paper = (tint, opts = {}) => mats.paper(null, { side: -1, plain: true, tint, ...opts });
  const parts = [];
  const add = (mesh, order) => { mesh.renderOrder = order; scene.add(mesh); parts.push(mesh); return mesh; };

  // the wall: house paper with grain, 6 percent darker over its lowest 3 units, and a hairline where it meets the floor
  const wall = add(new Mesh(new PlaneGeometry(WALL.w, WALL.h), paper(WALL.colour, { foot: [3 / WALL.h, 0.06] })), -9.5);
  wall.position.set(0, WALL.h / 2, WALL.z);
  const join = add(new Mesh(new PlaneGeometry(WALL.w, 0.045), paper(WALL.line)), -9.4);
  join.position.set(0, 0.022, WALL.z + 0.02);

  // a bay behind each stack: a tall flat with a torn top edge, and its soft shadow half a unit to the right
  const flat = new PlaneGeometry(BAY.w, BAY.h);
  const bays = xs.map((x, k) => {
    const shade = add(new Mesh(flat, mats.paper(ctx.textures.soft(), { side: -1, blended: true, mask: true, tint: '#4A4E57', opacity: 0.13 })), -9.2);
    shade.scale.set(1.1, 1.03, 1);
    const mesh = add(new Mesh(flat, paper(BAY.colour, { torn: [0, BAY.torn / BAY.h, 5.5, k * 3.1 + 1] })), -9.1);
    return { mesh, shade, x, show: 1 };
  });

  // dust: a few slow motes of paper white between the row and the wall
  let dust = null;
  const n = ctx.reduced ? 0 : ctx.quality.small ? 60 : 120;
  if (n) {
    const pos = new Float32Array(n * 3), ph = new Float32Array(n);
    let seed = 4211;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 30; pos[i * 3 + 1] = 0.4 + rnd() * 8; pos[i * 3 + 2] = -8 + rnd() * 13; ph[i] = rnd() * 6.283; }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geo.setAttribute('aPh', new Float32BufferAttribute(ph, 1));
    dust = new Points(geo, mats.dust('#FFFFFF', 0.35, { side: -1 }));
    dust.frustumCulled = false; dust.renderOrder = 10;
    scene.add(dust);
  }

  return {
    bays,
    // Every frame: each bay follows its stack (row.js writes bay.x), and the set as a whole can step back (show 0..1).
    update(show = 1) {
      const on = show > 0.01;
      for (const m of parts) m.visible = on;
      for (const b of bays) {
        b.mesh.position.set(b.x + BAY.dx, BAY.h / 2, BAY.z);
        b.shade.position.set(b.x + BAY.dx + BAY.shade, BAY.h / 2 - 0.1, BAY.z - 0.06);
        b.mesh.visible = b.shade.visible = on && b.show > 0.01;
      }
      if (dust) { dust.visible = on; dust.material.uniforms.uPx.value = ctx.renderer.getPixelRatio() * window.innerHeight * 0.2; }
    },
  };
}
