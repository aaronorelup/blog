// The neutral studio (SPEC 3.1, 4.1): a floor that works out coloured shadows and reflections for up to eight
// casters, a paper cyclorama, one lamp, and the light state: lights out with a colour blooming from a point, or the
// whole room dimmed evenly (dusk). Sections set lamp, warmth, dark, dusk, glow, ink and the boards of the house set
// (bays: up, show, tile) every frame. reset() puts back the daylight defaults.
import { Color, CylinderGeometry, Mesh, PlaneGeometry, Vector3 } from 'three';
import { damp } from '../core/clock.js';
import { createSet } from './set.js';

// Named lamp directions (toward the lamp). The studio stands at "hero": the lamp is behind and to the left,
// so the coloured shadows fall toward the viewer. A world sets its own hour.
export const HOURS = { noon: [0, 1, -0.02], hero: [-0.34, 0.8, -0.5], low: [-0.3, 0.56, -0.74], side: [-0.62, 0.66, -0.42] };
const PAPER = new Color('#E6E8ED');
const FLOOR = new Color('#F8F9FB');
const WARM = new Color('#FFF1DE');
const NIGHT = new Color('#050608');

export function createStudio(ctx) {
  const { mats, scene } = ctx;
  const sh = mats.shared;
  const ground = new Mesh(new PlaneGeometry(420, 420).rotateX(-Math.PI / 2), mats.ground());
  ground.renderOrder = -10;
  const cyc = new Mesh(new CylinderGeometry(60, 60, 70, 72, 1, true), mats.cyc());
  cyc.position.y = 35 - 0.02;
  cyc.renderOrder = -11;
  scene.add(cyc, ground);
  scene.background = PAPER.clone();
  const gu = ground.material.uniforms;
  const set = createSet(ctx, [-8.4, -4.2, 0, 4.2, 8.4]);          // the house set: a wall, dust, and a board behind each stack
  const lampNow = new Vector3(...HOURS.hero).normalize();
  const tmp = new Vector3();
  let warmNow = 0;

  const studio = {
    ground, cyc,
    lamp: new Vector3(), warmth: 0,
    dark: 0, roomX: 0,                                              // lights out: the sweep 0..1 and the room it crosses
    dusk: 0,                                                        // the whole room dimmed evenly, 0..1 (1 is night). Used while dark is 0
    glow: { amount: 0, radius: 0, color: new Color('#FFFFFF'), pos: new Vector3(), cap: 0.5, lamp: 0 },      // (cap: how bright its colour may be. 1 lets a white lamp light the paper white. lamp 1: a pool with an edge, not a bloom)
    ink: 0,                                                         // how strongly the floor print shows (setInk)
    bays: set.bays, set: 1,                                         // the house set: its boards (row.js gives each its stack), and 0 to step the set back
    word: set.word,                                                 // a paper word standing in the room (scene/set.js)
    casters: Array.from({ length: 8 }, () => ({ x: 0, z: 0, h: 2.7, gap: 0.045, amt: 0, inside: 0, color: new Color('#8C929C') })),

    reset() {
      studio.lamp.set(...HOURS.hero); studio.warmth = 0; studio.dark = 0; studio.dusk = 0; studio.glow.amount = 0; studio.glow.radius = 0; studio.glow.cap = 0.5; studio.glow.lamp = 0; studio.ink = 0; studio.set = 1;
      for (const c of studio.casters) { c.amt = 0; c.inside = 0; }
      for (const b of studio.bays) { b.up = 0; b.show = 1; b.tile = null; b.low = false; }
    },
    // Print on the floor: a canvas texture (ink coverage in red) over the world rectangle [x0, z0, width, depth].
    setInk(texture, rect) { gu.uInk.value = texture; gu.uInkRect.value.set(...rect); },
    // Cut the lamp at once (reduced motion, a section leaving).
    snap() { lampNow.copy(tmp.copy(studio.lamp).normalize()); warmNow = studio.warmth; },

    update(dt) {
      lampNow.lerp(tmp.copy(studio.lamp).normalize(), 1 - Math.exp(-3 * dt)).normalize();
      warmNow = damp(warmNow, studio.warmth, 3, dt);
      sh.uLight.value.copy(lampNow);
      gu.uNear.value.copy(FLOOR).lerp(WARM, warmNow * 0.5);
      gu.uFar.value.copy(PAPER).lerp(WARM, warmNow * 0.22);
      cyc.material.uniforms.uFar.value.copy(gu.uFar.value);
      gu.uInkAmt.value = gu.uInk.value ? studio.ink : 0;
      // dusk is the same falloff with the sweep parked far to the left, so every point of the room is equally far in
      const dusk = studio.dark > 0 ? 0 : Math.max(0, Math.min(1, studio.dusk));
      if (dusk > 0) sh.uDark.value.set((76 + 8 * dusk) / 84, -1000, studio.glow.radius, studio.glow.amount);
      else sh.uDark.value.set(studio.dark, studio.roomX, studio.glow.radius, studio.glow.amount);
      sh.uGlowPos.value.copy(studio.glow.pos); sh.uLamp.value = studio.glow.lamp;
      sh.uGlowCol.value.copy(studio.glow.color);
      // lights out stays dark whatever the colour: a very bright glow (white) is held to half strength, unless the
      // section asks for a lamp (glow.cap 1: the router floor's one pool of light)
      const g = sh.uGlowCol.value;
      const bright = 0.2126 * g.r + 0.7152 * g.g + 0.0722 * g.b;
      if (bright > studio.glow.cap) g.multiplyScalar(studio.glow.cap / bright);
      scene.background.copy(PAPER).lerp(NIGHT, Math.max(studio.dark, dusk * dusk * (3 - 2 * dusk)));
      set.update(studio.set, dt);
      studio.casters.forEach((c, i) => {
        gu.uTPos.value[i].set(c.x, c.z);
        gu.uTCol.value[i].copy(c.color);
        gu.uTH.value[i] = c.h; gu.uTGap.value[i] = c.gap; gu.uTAmt.value[i] = c.amt; gu.uTIn.value[i] = c.inside;
      });
    },
  };
  studio.reset();
  return studio;
}
