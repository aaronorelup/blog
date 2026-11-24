// The house set, version 2 (studio pass, round 3): a far wall with its picture, slow dust, and one paper board right
// behind each stack as its backing card. A section may raise the boards (bay.up) and give each one sign (bay.tile, scene/sign.js),
// send them down into the floor (bay.show), or stand a paper word in the room (word()). Unlit house paper only: it
// adds no hue, goes dark with the room, and is drawn outside an open iris. studio.js builds it, row.js tells the bays.
import { BufferGeometry, Float32BufferAttribute, Mesh, PlaneGeometry, Points, Vector3 } from 'three';
import { smooth } from '../core/clock.js';
import { owner } from '../worlds/index.js';
import { art } from '../worlds/_default.js';
import { drawSign, signKey } from './sign.js';

const WALL = { z: -26, w: 80, h: 30, colour: '#E6E8ED', line: '#C9CDD5' };
// The wall's picture (art/house/plate): white paper, one long shelf of small blank models, bars of window light. The
// shelf's front edge is `at` of the picture's height from its top, and hangs `shelf` above the floor: over the boards
// from the row. The picture melts into the plain wall at its edges, so a window of any shape sees wall and no end of it
const PLATE = { w: 50, h: 28.125, at: 0.575, shelf: 9.3, soft: 0.07, haze: 0.6 };      // (haze: how much of it shows through the room's air. A far wall is quiet, and words stand in front of it)
// A board: 3.2 behind its stack, as tall as the stack's lid plate and `over` more, seen from the row stop (its eye
// height and middle). Raised it is `rise` taller and carries a sign `sign` square, `head` under its top edge.
export const BAY = { z: -3.2, w: 3.3, tall: 14, colour: '#F8F9FB', torn: 0.14, over: 0.45, low: 0.3, rise: 2.6, sign: 2.3, head: 0.25, eye: 2.2, mid: -0.5 };
export const LID_TOP = 1.54;      // a lid plate's top edge above its stack (row.js: 0.02 + 0.55 + 0.42 + 0.55)
const RISE = 0.085;               // seconds: a board is 97 percent of the way after 0.3 s
const LAG = 0.06, FLIP = [0.09, 0.15, 0.04];      // each board 60 ms after its left neighbour. A sign: out, in, 40 ms apart
const SHADE = 9;                  // a board's shadow is this tall: its soft edge is a sixth of that

export function createSet(ctx, xs) {
  const { scene, mats, textures } = ctx;
  const paper = (tint, opts = {}) => mats.paper(null, { side: -1, plain: true, tint, ...opts });
  const add = (mesh, order) => { mesh.renderOrder = order; scene.add(mesh); return mesh; };

  // the wall: house paper with grain, 6 percent darker over its lowest 3 units, and a hairline where it meets the floor
  const wall = add(new Mesh(new PlaneGeometry(WALL.w, WALL.h), paper(WALL.colour, { foot: [3 / WALL.h, 0.06] })), -9.5);
  wall.position.set(0, WALL.h / 2, WALL.z);
  const join = add(new Mesh(new PlaneGeometry(WALL.w, 0.045), paper(WALL.line)), -9.4);
  join.position.set(0, 0.022, WALL.z + 0.08);
  const plate = add(new Mesh(new PlaneGeometry(PLATE.w, PLATE.h), mats.paper(null, { side: -1, blended: true, soft: PLATE.soft, opacity: PLATE.haze })), -9.45);
  plate.position.set(0, PLATE.shelf - PLATE.h * (0.5 - PLATE.at), WALL.z + 0.04);
  let hung = false;
  textures.load((ctx.quality.small && art('house', 'plate-s')) || art('house', 'plate')).then((tex) => { if (tex) { plate.material.uniforms.uMap.value = tex; hung = true; } });

  // a board behind each stack: a flat with a torn top edge, its soft shadow a little to the right, and the plane its
  // sign is drawn on. The five boards are one mesh and their five shadows another (two draw calls): four corners
  // each, written every frame. A board's u runs from its own whole number, so no two tear alike
  const quads = (n) => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(n * 12), 3));
    geo.setAttribute('uv', new Float32BufferAttribute(new Float32Array(n * 8), 2));
    geo.setAttribute('normal', new Float32BufferAttribute(new Float32Array(n * 12).map((_, i) => (i % 3 === 2 ? 1 : 0)), 3));
    geo.setIndex(Array.from({ length: n }, (_, k) => [0, 1, 2, 2, 1, 3].map((c) => k * 4 + c)).flat());
    return geo;
  };
  // corners of quad k: x0..x1, y0..y1 at depth z, with the texture from (u0, v0) to (u1, v1)
  const put = (geo, k, x0, x1, y0, y1, z, u0, u1, v0, v1) => {
    const p = geo.attributes.position, t = geo.attributes.uv;
    [[x0, y0, u0, v0], [x1, y0, u1, v0], [x0, y1, u0, v1], [x1, y1, u1, v1]].forEach(([x, y, u, v], c) => { p.setXYZ(k * 4 + c, x, y, z); t.setXY(k * 4 + c, u, v); });
  };
  const flats = add(new Mesh(quads(xs.length), paper(BAY.colour, { torn: [0, BAY.torn / BAY.tall, 5.5, 1] })), -9.1);
  const shades = add(new Mesh(quads(xs.length), mats.paper(textures.soft(), { side: -1, blended: true, mask: true, tint: '#4A4E57', opacity: 0.15 })), -9.2);
  flats.frustumCulled = shades.frustumCulled = false;
  const px = ctx.quality.small ? 256 : 512;
  const bays = xs.map((x) => {
    const sheet = textures.sheet(px);
    const sign = add(new Mesh(new PlaneGeometry(BAY.sign, BAY.sign), mats.paper(sheet.texture, { side: -1, blended: true })), -9);
    sign.visible = false;
    // (at, z, wide, top, seen: where the board was drawn last frame, for whoever asks: its middle, depth, width, top edge)
    return { sign, sheet, x, tower: null, show: 1, up: 0, tile: null, low: false, at: x, z: BAY.z, wide: BAY.w, top: 0, seen: false, rise: 0, goal: 0, wait: 0, key: '', next: '', hold: 0, flip: 0, sunk: 0 };
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

  // How far the row stop stands from the row in this window (camera.js backs off to keep its `fit` in frame): a
  // board is placed and sized so that from there it stands exactly behind its stack. Fixed for a window's shape,
  // so nothing slides when the camera moves.
  const reach = () => { const s = ctx.rig.stops.row; return Math.max(s.pos[2], s.fit / (2 * Math.tan((s.fov * Math.PI) / 360) * ctx.camera.aspect)); };

  const paint = (b, key) => { b.key = key; if (key) { drawSign(b.sheet.g, px, b.tile, owner); b.sheet.texture.needsUpdate = true; } };
  const up = new Vector3(), right = new Vector3(), back = new Vector3();

  return {
    bays,
    // A word or a number cut from paper, standing in the room: its ink mask in light grey, and the same mask as its
    // shadow on whatever is behind. set(text) with text read from the page, place(position, quaternion, height).
    word() {
      const geo = new PlaneGeometry(1, 1);
      const face = new Mesh(geo, mats.paper(null, { side: -1, blended: true, mask: true, tint: '#BFC4CC' }));
      const shade = new Mesh(geo, mats.paper(null, { side: -1, blended: true, mask: true, tint: '#4A4E57', opacity: 0.16 }));
      face.renderOrder = -8.7; shade.renderOrder = -8.8;
      face.visible = shade.visible = false;
      scene.add(shade, face);
      const cut = new Map();
      let cur = null;
      const word = {
        show: 0, squash: 1, text: '',
        set(text) {
          if (text === word.text) return;
          if (!cut.has(text)) cut.set(text, textures.title(text));
          word.text = text; cur = cut.get(text);
          face.material.uniforms.uMap.value = cur.texture; shade.material.uniforms.uMap.value = cur.texture;
        },
        place(position, quaternion, height) {
          if (!cur) return;
          const on = word.show > 0.01 && word.squash > 0.01;
          face.visible = shade.visible = on;
          if (!on) return;
          up.set(0, 1, 0).applyQuaternion(quaternion); right.set(1, 0, 0).applyQuaternion(quaternion); back.set(0, 0, -1).applyQuaternion(quaternion);
          for (const m of [face, shade]) { m.quaternion.copy(quaternion); m.scale.set(height * cur.aspect, height * word.squash, 1); }
          face.position.copy(position);
          shade.position.copy(position).addScaledVector(right, 0.035 * height).addScaledVector(up, -0.018 * height).addScaledVector(back, 0.05);
          face.material.uniforms.uOpacity.value = word.show; shade.material.uniforms.uOpacity.value = 0.16 * word.show;
        },
        hide() { face.visible = shade.visible = false; },
        // ride another object (the camera): place() is then in that object's own space
        attach(parent) { parent.add(shade, face); },
        dispose() { face.removeFromParent(); shade.removeFromParent(); geo.dispose(); face.material.dispose(); shade.material.dispose(); for (const c of cut.values()) c.texture.dispose(); },
      };
      return word;
    },

    // Every frame: each board follows its stack (row.js writes bay.x and bay.tower) and what its section asked of it,
    // and the set as a whole can step back (show 0..1).
    update(show = 1, dt = 0.016) {
      const on = show > 0.01;
      wall.visible = join.visible = on;
      plate.visible = on && hung;
      const near = 1 / (1 + -BAY.z / reach());
      // on a narrow window the stacks of some sections stand closer: a board is never wider than its place in the row
      // (the row of the boards that are there: in my stack two lenders stand alone, wherever the other three were)
      let pitch = Infinity;
      const there = bays.filter((b) => b.show * (b.tower ? b.tower.show : 1) > 0.01).map((b) => b.x).sort((a, c) => a - c);
      for (let k = 1; k < there.length; k++) pitch = Math.min(pitch, there[k] - there[k - 1]);
      const w = Math.min(BAY.w, pitch / near - 0.3);
      bays.forEach((b, k) => {
        const tw = b.tower;
        // rest: the stack's lid plate and a little more, or (bay.low, where the plate is away) just over the stack
        b.sunk += ((b.low ? 1 : 0) - b.sunk) * (ctx.reduced ? 1 : 1 - Math.exp(-dt / RISE));
        const rest = BAY.eye + ((tw ? tw.height + tw.lift : 2.7) + BAY.low * b.sunk + (LID_TOP + BAY.over) * (1 - b.sunk) - BAY.eye) / near;
        // raised 0.3 s after it is asked, each board a little after its left neighbour. A sign waits for its board to
        // be up, leaves and comes back by scale alone, and its board goes down only once it has left
        const goal = b.up > 0.5 ? 1 : 0;
        if (goal !== b.goal) { b.goal = goal; b.wait = k * LAG; }
        const want = signKey(goal && (ctx.reduced || b.rise > 0.96) ? b.tile : null);
        if (want !== b.next) { b.next = want; b.hold = k * FLIP[2]; }
        if (ctx.reduced) { b.rise = goal; if (b.key !== want) paint(b, want); b.flip = want ? 1 : 0; }
        else {
          if (b.wait > 0) b.wait -= dt;
          else if (goal || b.flip < 0.01) b.rise += (goal - b.rise) * (1 - Math.exp(-dt / RISE));
          if (b.key === want) b.flip = want ? Math.min(1, b.flip + dt / FLIP[1]) : 0;
          else if (b.hold > 0) b.hold -= dt;
          else { b.flip = Math.max(0, b.flip - dt / FLIP[0]); if (b.flip <= 0) paint(b, want); }
        }
        const seen = smooth(b.show * (tw ? tw.show : 1));
        const x = BAY.mid + (b.x - BAY.mid) / near;
        b.at = x; b.wide = w; b.seen = on && seen > 0.01;
        b.top = b.seen ? (rest + BAY.rise * b.rise) * seen : 0;
        // the board from the floor to its top (its tear keeps its size whatever the height), and its shadow, whose
        // soft block is as wide as the board and starts just under the board's top. An unseen board has no height
        put(flats.geometry, k, x - w / 2, x + w / 2, 0, b.top, BAY.z, k, k + 1, 1 - b.top / BAY.tall, 1);
        const sx = x + 0.15 * w, sy = b.seen ? b.top + 0.2 : 0;
        put(shades.geometry, k, sx - 0.65 * w, sx + 0.65 * w, b.seen ? sy - SHADE : 0, sy, BAY.z - 0.06, 0, 1, 0, 1);
        b.sign.visible = b.seen && b.flip > 0.01 && !!b.key;
        const s = Math.min(1, (w - 0.2) / BAY.sign);
        if (b.sign.visible) { b.sign.position.set(x, b.top - BAY.head - (BAY.sign * s) / 2, BAY.z + 0.03); b.sign.scale.set(s, s * smooth(b.flip), 1); }
      });
      for (const m of [flats, shades]) { m.visible = on && bays.some((b) => b.seen); m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.uv.needsUpdate = true; }
      if (dust) { dust.visible = on; dust.material.uniforms.uPx.value = ctx.renderer.getPixelRatio() * window.innerHeight * 0.2; }
    },
  };
}
