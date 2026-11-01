// Night lighting, the way a tea house is actually lit: andon (paper floor lanterns), a chōchin (hanging paper
// lantern) in the room, a shokudai candle in the tokonoma, and the garden tōrō. Every fixture is a glowing paper
// shade plus its own point light, at full intensity at night and none by day (palette.js). syncLamps keeps only as
// many lights in the graph as the quality tier allows (lampBudget), and none in daylight. scene is the scene's state
// (scene.js), not three's Scene.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, PlaneGeometry, PointLight, SphereGeometry } from 'three';

export function buildLamps(scene, { M, part, merge }) {
  const g = new Group();
  const lights = scene.lampLights = [];
  const nightLamp = (light) => { light.userData.base = light.intensity; lights.push(light); };

  // andon: slim wood frame, paper on four sides, warm core inside
  const andon = (x, z, s, intensity) => {
    const a = new Group();
    const w = 0.44 * s, h = 0.78 * s;
    a.add(part(new BoxGeometry(w, h, w), M.lampPaper, [0, h / 2 + 0.34 * s, 0], null, 0));
    a.add(part(new SphereGeometry(0.1 * s, 8, 6), M.lampGlow, [0, h / 2 + 0.34 * s, 0], null, 0));
    a.add(merge([
      { geo: new BoxGeometry(w + 0.09 * s, 0.07 * s, w + 0.09 * s), pos: [0, 0.34 * s, 0] },
      { geo: new BoxGeometry(w + 0.11 * s, 0.08 * s, w + 0.11 * s), pos: [0, h + 0.34 * s, 0] },
      { geo: new BoxGeometry(w + 0.16 * s, 0.05 * s, w + 0.16 * s), pos: [0, 0.06 * s, 0] }
    ], M.woodDark));
    a.position.set(x, 0.44, z);
    a.userData.dynamic = true;        // exempt from the static collapse
    scene.lampGroup = a;               // staging tool moves this whole lantern
    g.add(a);
    const pl = new PointLight(0xFFC072, intensity * 2.4, 34 * s, 1.35);
    pl.position.set(x, 1.13 * s, z);
    pl.userData.dynamic = true;
    scene.lampLight = pl;              // follows the lantern when it is dragged
    nightLamp(pl); g.add(pl);
  };
  andon(-5.42, 4.26, 1, 5.5);         // tucked into the corner beside the writing desk

  // soft warm bounce off the paper ceiling, so the room reads lit rather than spotlit
  const bounce = new PointLight(0xFFC98A, 2.6, 34, 1.4);
  bounce.position.set(-1.0, 3.3, -1.0);
  nightLamp(bounce); g.add(bounce);

  // chōchin: round paper lanterns strung under the front eaves
  const chochin = (x, z, s, y) => {
    const c = new Group();
    const body = part(new SphereGeometry(0.3 * s, 12, 9), M.lampPaper, [0, 0, 0], null, 0);
    body.scale.set(1, 0.82, 1);
    c.add(body);
    c.add(merge([
      { geo: new CylinderGeometry(0.13 * s, 0.13 * s, 0.05 * s, 8), pos: [0, 0.25 * s, 0] },
      { geo: new CylinderGeometry(0.11 * s, 0.11 * s, 0.05 * s, 8), pos: [0, -0.25 * s, 0] },
      { geo: new CylinderGeometry(0.012, 0.012, 1.1 * s, 4), pos: [0, 0.82 * s, 0] }
    ], M.woodDark));
    c.position.set(x, y, z);
    g.add(c);
    const pl = new PointLight(0xFFB765, 5.5, 34 * s, 1.35);
    pl.position.set(x, y - 0.12, z);
    nightLamp(pl); g.add(pl);
  };
  chochin(0, 0, 1.0, 3.25);            // centred in the room

  // shokudai: a single candle on the tokonoma floor board, lighting the scroll
  const candle = new Group();
  candle.add(part(new CylinderGeometry(0.16, 0.2, 0.05, 8), M.woodDark, [0, 0.03, 0]));
  candle.add(part(new CylinderGeometry(0.035, 0.035, 0.34, 6), M.paper, [0, 0.22, 0], null, 0));
  candle.add(part(new ConeGeometry(0.05, 0.16, 6), M.flame, [0, 0.47, 0], null, 0));
  candle.position.set(6.9, 0.54, 1.15);
  g.add(candle);
  const cl = new PointLight(0xFFCE86, 1.8, 9, 2);
  cl.position.set(6.7, 1.15, 1.15);
  nightLamp(cl); g.add(cl);

  // garden tōrō: light the existing stone lanterns from inside their boxes
  [[3.2, 8.2, 1], [-9.6, 5.4, 0.88]].forEach(([x, z, s]) => {
    const y = 1.15 * s, d = 0.40 * s, w = 0.5 * s, h = 0.32 * s;
    // paper windows sit just outside the stone box's four faces, so they actually show
    const win = [
      { geo: new PlaneGeometry(w, h), pos: [x, y, z + d], rot: [0, 0, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x, y, z - d], rot: [0, Math.PI, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x + d, y, z], rot: [0, Math.PI / 2, 0] },
      { geo: new PlaneGeometry(w, h), pos: [x - d, y, z], rot: [0, -Math.PI / 2, 0] }
    ];
    g.add(merge(win, M.lampPaper, 0));
    const pl = new PointLight(0xFFB25C, 2.6, 11, 2);
    pl.position.set(x, y + 0.45 * s, z);
    nightLamp(pl); g.add(pl);
  });

  // remember where each lamp light belongs so the ladder can pull it out of the graph entirely: three bakes light
  // *counts* into every shader, so a zero-intensity light still costs the same as a lit one.
  lights.forEach(l => { l.userData.home = l.parent; });
  return g;
}

// Adding or removing a light recompiles every material, so this only touches
// the graph when the wanted count actually changes — never per frame.
export function syncLamps(s) {
  // in daylight every lamp sits at zero intensity, so pulling them is free
  const want = s.mix > 0.02 ? Math.min(s.lampBudget, s.lampLights.length) : 0;
  if (want === s.lampsOn) return;
  s.lampsOn = want;
  s.lampLights.forEach((l, i) => {
    const on = i < want;
    if (on && !l.parent && l.userData.home) l.userData.home.add(l);
    else if (!on && l.parent) l.parent.remove(l);
  });
}
