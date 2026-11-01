// The world, built once from the palette at the time of day it boots in (palette.js P): the sky and clouds, the
// light rig, the lamps, the ground, the garden, the house and its interior, the petals; then every static part
// collapsed into one mesh per material.
import { CircleGeometry } from 'three';
import { applyRig, makeRig } from '../palette.js';
import { buildGarden } from './garden.js';
import { buildHouse } from './house.js';
import { buildInterior } from './interior.js';
import { makeKit } from './kit.js';
import { buildLamps } from './lamps.js';
import { buildPetals } from './petals.js';
import { buildSky } from './sky.js';
import { optimizeStatics } from './statics.js';

export function buildWorld(s) {
  const kit = makeKit();
  const S = s.scene;
  s.reg = kit.reg;
  s.ink = kit.ink;
  S.add(...buildSky(s, kit));
  S.add(...makeRig(s));
  S.add(buildLamps(s, kit));
  applyRig(s, s.mix);
  S.add(kit.part(new CircleGeometry(70, 40), kit.M.grass, [0, -0.02, 4], [-Math.PI / 2, 0, 0], 0));   // the ground
  S.add(buildGarden(kit));
  S.add(buildHouse(kit));
  S.add(buildInterior(kit));
  S.add(buildPetals(s, kit));
  optimizeStatics(S);
}
