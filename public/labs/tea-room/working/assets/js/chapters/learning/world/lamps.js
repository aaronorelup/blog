// Night lighting, the way the homepage lights the tea house (from src/scripts/home/scene/world/lamps.js): the andon
// (paper floor lantern) by the desk, the chochin (hanging paper lantern) in the room, the candle in the tokonoma and
// the garden toro. Every fixture is a glowing paper shade plus its own point light. Here each lantern is a piece
// that travels with its layer of the drawing, and its light follows it. Two more chochin hang under the front
// eaves (the homepage's own lantern, strung where its notes say they belong): they leave with the roof and light
// the layer under it. The number of lights never changes while the page runs.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, PlaneGeometry, PointLight, SphereGeometry } from 'three';

// where the andon stands (the homepage's own place for it, left of the writing desk)
export const ANDON = [-5.42, 4.26];
const GAIN = 1.5;       // lifted out into the night with its layer, a lantern burns up: it is that layer's light now
export function buildLamps({ M, part, merge, at, piece }) {
  const pieces = [], lights = [], fixed = new Group();
  // follow: the piece the light travels with (null: it stays put)
  // gain: how much brighter it burns once its piece has reached its place in the drawing (0: no brighter)
  const lamp = (light, follow, gain) => { lights.push({ light, follow, gain: gain || 0, home: light.position.clone(), base: light.intensity }); fixed.add(light); };

  // andon: slim wood frame, paper on four sides, warm core inside
  {
    const x = ANDON[0], z = ANDON[1], s = 1, w = 0.44 * s, h = 0.78 * s;
    pieces.push(piece('andon', 'furniture', [at([x, 0.44, z], 0, [
      part(new BoxGeometry(w, h, w), M.lampPaper, [0, h / 2 + 0.34 * s, 0], null, 0),
      part(new SphereGeometry(0.1 * s, 8, 6), M.lampGlow, [0, h / 2 + 0.34 * s, 0], null, 0),
      merge([
        { geo: new BoxGeometry(w + 0.09 * s, 0.07 * s, w + 0.09 * s), pos: [0, 0.34 * s, 0] },
        { geo: new BoxGeometry(w + 0.11 * s, 0.08 * s, w + 0.11 * s), pos: [0, h + 0.34 * s, 0] },
        { geo: new BoxGeometry(w + 0.16 * s, 0.05 * s, w + 0.16 * s), pos: [0, 0.06 * s, 0] },
      ], M.woodDark),
    ])], { corner: 'ledger', up: 0.35, dir: [-0.6, 0.8], out: 0.5, seq: 11 }));
    const pl = new PointLight(0xFFC072, 5.5 * 2.4, 34 * s, 1.35);
    pl.position.set(x, 1.13 * s, z);
    lamp(pl, 'andon');
  }

  // soft warm bounce off the paper ceiling, so the room reads lit rather than spotlit
  {
    const bounce = new PointLight(0xFFC98A, 2.6, 34, 1.4);
    bounce.position.set(-1.0, 3.3, -1.0);
    lamp(bounce, 'bounce', GAIN);
  }

  // chochin: a round paper lantern
  const chochin = (name, x, z, s, y, tier, o) => {
    const body = part(new SphereGeometry(0.3 * s, 12, 9), M.lampPaper, [0, 0, 0], null, 0);
    body.scale.set(1, 0.82, 1);
    pieces.push(piece(name, tier, [at([x, y, z], 0, [
      body,
      merge([
        { geo: new CylinderGeometry(0.13 * s, 0.13 * s, 0.05 * s, 8), pos: [0, 0.25 * s, 0] },
        { geo: new CylinderGeometry(0.11 * s, 0.11 * s, 0.05 * s, 8), pos: [0, -0.25 * s, 0] },
        { geo: new CylinderGeometry(0.012, 0.012, 1.1 * s, 4), pos: [0, 0.82 * s, 0] },
      ], M.woodDark),
    ])], o));
  };
  chochin('chochin', 0, 0, 1.0, 3.25, 'ceiling', { follow: 'ceiling' });            // centred in the room
  {
    const pl = new PointLight(0xFFB765, 5.5, 34, 1.35);
    pl.position.set(0, 3.13, 0);
    lamp(pl, 'chochin', GAIN);
  }
  [[-4.4, 'l'], [4.4, 'r']].forEach(([x, id]) => {                                   // under the front eaves
    chochin('eave-' + id, x, 6.25, 0.8, 2.86, 'roof', { follow: 'roof-front' });
    const pl = new PointLight(0xFFB765, 3.4, 22, 1.5);
    pl.position.set(x, 2.76, 6.25);
    lamp(pl, 'eave-' + id, GAIN);
  });

  // shokudai: a single candle on the tokonoma floor board, lighting the scroll
  pieces.push(piece('candle', 'furniture', [at([6.9, 0.54, 1.15], 0, [
    part(new CylinderGeometry(0.16, 0.2, 0.05, 8), M.woodDark, [0, 0.03, 0]),
    part(new CylinderGeometry(0.035, 0.035, 0.34, 6), M.paper, [0, 0.22, 0], null, 0),
    part(new ConeGeometry(0.05, 0.16, 6), M.flame, [0, 0.47, 0], null, 0),
  ])], { corner: 'projects', dir: [1, 0], out: 4.9, up: 0.7, along: [0.3, 1.2], seq: 3 }));   // it ends in front of the painting
  {
    const cl = new PointLight(0xFFCE86, 1.8, 9, 2);
    cl.position.set(6.7, 1.15, 1.15);
    lamp(cl, 'candle', 1.6);          // out in the open it has only the painting to light, and burns up a little
  }

  // garden toro: light the existing stone lanterns from inside their boxes
  [[3.2, 8.2, 1], [-9.6, 5.4, 0.88]].forEach(([x, z, s]) => {
    const y = 1.15 * s, d = 0.40 * s, w = 0.5 * s, h = 0.32 * s;
    // paper windows sit just outside the stone box's four faces, so they actually show
    fixed.add(merge([
      { geo: new PlaneGeometry(w, h), pos: [x, y, z + d], rot: [0, 0, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x, y, z - d], rot: [0, Math.PI, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x + d, y, z], rot: [0, Math.PI / 2, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x - d, y, z], rot: [0, -Math.PI / 2, 0] },
    ], M.lampPaper, 0));
    const pl = new PointLight(0xFFB25C, 2.6, 11, 2);
    pl.position.set(x, y + 0.45 * s, z);
    lamp(pl, null);
  });

  return { pieces, lights, fixed };
}
