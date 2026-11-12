// The neutral studio (SPEC 3.1, 4.1): a floor that works out coloured shadows and reflections for up to eight
// casters, a paper cyclorama, one lamp, and the light state: lights out with a colour blooming from a point.
// Sections set lamp, warmth, dark, glow and ink every frame. reset() puts back the daylight defaults.
import { Color, CylinderGeometry, Mesh, PlaneGeometry, Vector3 } from 'three';
import { damp } from '../core/clock.js';

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
  const lampNow = new Vector3(...HOURS.hero).normalize();
  const tmp = new Vector3();
  let warmNow = 0;

  const studio = {
    ground, cyc,
    lamp: new Vector3(), warmth: 0,
    dark: 0, roomX: 0,                                              // lights out: the sweep 0..1 and the room it crosses
    glow: { amount: 0, radius: 0, color: new Color('#FFFFFF'), pos: new Vector3() },
    ink: 0,                                                         // how strongly the floor print shows (setInk)
    casters: Array.from({ length: 8 }, () => ({ x: 0, z: 0, h: 2.7, gap: 0.045, amt: 0, inside: 0, color: new Color('#8C929C') })),

    reset() {
      studio.lamp.set(...HOURS.hero); studio.warmth = 0; studio.dark = 0; studio.glow.amount = 0; studio.glow.radius = 0; studio.ink = 0;
      for (const c of studio.casters) { c.amt = 0; c.inside = 0; }
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
      sh.uDark.value.set(studio.dark, studio.roomX, studio.glow.radius, studio.glow.amount);
      sh.uGlowPos.value.copy(studio.glow.pos);
      sh.uGlowCol.value.copy(studio.glow.color);
      scene.background.copy(PAPER).lerp(NIGHT, studio.dark);
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
