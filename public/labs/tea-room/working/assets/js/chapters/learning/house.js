// THE TEA HOUSE, ONE FOR TWO CHAPTERS. The homepage's tea house by night (world/, the homepage's own builders), built
// once and drawn by one renderer for both "Learning to build with AI" (learning/scene.js: the desk and the ledger) and
// "This website" (../site.js: the camera backs out of the room and the house comes apart, the tea room test
// tests/tea-house-apart/). The camera simply goes on from one chapter into the next: no second room, no cut.
//
//   const H = acquire();   the world (built at the first call); every acquire() is answered by one release()
//   H.claim(host)          the canvas goes into that chapter's layer (the chapter that draws, draws there)
//   H.look(k)              the light of the room: 0 the learning chapter's (the desk's corner, the far lamps out),
//                          1 the take-apart test's (every lamp lit). Pure: everything it sets comes from k alone.
//
// Every piece of the house is its own movable piece (kit.piece) so it can be taken apart (site/plan.js); the desk's
// own things (the ledger, the little lantern, the petals on it) are carried by the desk piece.
// The number of lights and the shadows are the same from the first frame to the last (a change would make every
// material be built again, a long pause on a machine with no graphics card).
import {
  AdditiveBlending, BoxGeometry, BufferGeometry, CanvasTexture, CircleGeometry, DoubleSide, Float32BufferAttribute, Group,
  Mesh, MeshBasicMaterial, PCFSoftShadowMap, PerspectiveCamera, Plane, PlaneGeometry, PointLight, SRGBColorSpace, Scene, Vector3, WebGLRenderer,
} from 'three';
import { buildBook } from './book.js';
import { MORE, POSTS } from './posts.js';
import { buildGarden } from './world/garden.js';
import { buildHouse } from './world/house.js';
import { buildInterior, DESK } from './world/interior.js';
import { makeKit } from './world/kit.js';
import { ANDON, buildLamps } from './world/lamps.js';
import { P, makeRig, setPalette } from './world/palette.js';
import { buildPetals } from './world/petals.js';
import { buildSky } from './world/sky.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const rad = (d) => d * Math.PI / 180;

let world = null, refs = 0;

export function acquire() {
  if (!world) world = build();
  refs++;
  return world;
}
export function release() {
  refs = Math.max(0, refs - 1);
  if (refs > 0 || !world) return;
  const w = world; world = null;
  w.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? [].concat(o.material) : []; ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
  w.renderer.dispose(); w.renderer.forceContextLoss();
  w.canvas.remove();
}

function build() {
  const canvas = document.createElement('canvas');
  canvas.className = 'lb-gl'; canvas.setAttribute('aria-hidden', 'true');

  setPalette(1);                                          // the same evening as the tea room: night
  const kit = makeKit();
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(P.cream, 1);
  renderer.localClippingEnabled = true;
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 400);

  const rig = makeRig(1);
  scene.add(rig.amb, rig.hemi, rig.dir);
  const sky = buildSky(kit, rnd(7));
  const heavens = new Group();                            // what turns with the evening: the clouds, the stars, the moon
  heavens.add(sky.clouds, sky.stars, sky.moon);
  scene.add(sky.dome, heavens);
  const ground = kit.part(new CircleGeometry(70, 40), kit.M.grass, [0, -0.02, 4], [-Math.PI / 2, 0, 0], 0);
  scene.add(ground);
  const garden = buildGarden(kit);
  scene.add(garden);
  const lamps = buildLamps(kit);
  scene.add(lamps.fixed);
  // the lamps that never reach the desk's corner (the two under the front eaves, the alcove's candle, the stone lantern
  // in the front garden): out in the learning chapter, lit as the camera leaves the room (look())
  lamps.lights.forEach((l) => { l.far = l.follow === 'eave-l' || l.follow === 'eave-r' || l.follow === 'candle' || (!l.follow && l.light.position.x > 0); });
  const andon = lamps.lights[0];
  const pieces = [...buildHouse(kit), ...buildInterior(kit), ...lamps.pieces];
  const byName = new Map(pieces.map(p => [p.name, p]));
  pieces.forEach(p => scene.add(p.obj));
  const petals = buildPetals(rnd(11), 130);
  scene.add(petals.mesh);

  // drawn light: a soft round glow, laid on what it falls on
  const glow = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.52)');
    r.addColorStop(0.7, 'rgba(255,255,255,0.15)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  })();
  const pool = (x, y, z, rx, rz, color, strength) => {
    const m = new Mesh(new CircleGeometry(1, 36), new MeshBasicMaterial({ map: glow, color, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.set(rx, rz, 1); m.userData.strength = strength;
    scene.add(m);
    return m;
  };
  const matPool = pool(ANDON[0], 0.372, ANDON[1], 2.4, 2.4, 0xC97A32, 0.22);     // round the andon, on the mats
  // on the grass: where the open front spills onto the path, and under the stone lanterns (the test's own)
  const spill = pool(0, 0.02, 9.6, 6.2, 7.4, 0xC97A32, 0.5);
  pool(3.2, 0.02, 8.2, 3.4, 3.4, 0xD9822E, 0.42);
  pool(-9.6, 0.02, 5.4, 3.0, 3.0, 0xD9822E, 0.38);

  // Moonlight through the two open windows of the west wall: a soft-edged patch of cool light on whatever it falls
  // on (the mats, the desk's top), each the window's own shape thrown along the moon's direction.
  const pane = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    g.shadowColor = '#fff'; g.shadowBlur = 4; g.fillStyle = '#fff'; g.fillRect(5, 5, 54, 54);
    return new CanvasTexture(c);
  })();
  // (the same light seen from across the room: its edge melts over a third of the patch, so from afar it reads as
  // light lying on the mats, not as a pale rug; the camera's way out of the room crossfades to it)
  const softPane = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), img = g.createImageData(64, 64);
    const f = (x) => { const d = Math.min(x, 63 - x) / 22; const t = Math.max(0, Math.min(1, d)); return t * t * (3 - 2 * t); };
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const i = (y * 64 + x) * 4, a = f(x) * f(y); img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(255 * a); img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    return new CanvasTexture(c);
  })();
  const MOON = { tan: 0.6, turn: rad(40.5) };
  const patches = [];
  const moonlight = (z0, z1, Y, strength, clip, into) => {
    const hit = (yw, zw) => { const t = (yw - Y) / MOON.tan; return [-6.31 + t * Math.cos(MOON.turn), Y, zw - t * Math.sin(MOON.turn)]; };
    const a = hit(1.86, z1), b = hit(1.86, z0), c = hit(3.24, z0), d = hit(3.24, z1);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    const m = new Mesh(g, new MeshBasicMaterial({ map: pane, color: 0x6488E2, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, clippingPlanes: clip || null }));
    m.renderOrder = 1; m.userData.strength = strength; m.userData.desk = !!clip;
    (into || scene).add(m);
    patches.push(m);
    if (!clip) {                                          // (its soft twin, out until the camera leaves the desk)
      const s = new Mesh(g, m.material.clone()); s.material.map = softPane; s.material.opacity = 0;
      s.renderOrder = 1; s.userData.strength = strength * 1.15; s.userData.soft = true; s.visible = false;
      (into || scene).add(s); patches.push(s);
    }
    return m;
  };
  const dk = DESK.at, deskClip = [
    new Plane(new Vector3(1, 0, 0), -(dk[0] - 0.51)), new Plane(new Vector3(-1, 0, 0), dk[0] + 0.51),
    new Plane(new Vector3(0, 0, 1), -(dk[2] - 0.97)), new Plane(new Vector3(0, 0, -1), dk[2] + 0.97),
  ];
  moonlight(1.1, 3.06, 0.372, 0.34);
  moonlight(-3.06, -1.1, 0.372, 0.34);
  moonlight(1.1, 3.06, DESK.at[1] + DESK.top + 0.0015, 0.6, deskClip);

  // the desk's own frame: the book and what lies beside it are built in it
  const deskGL = new Group(), deskCSS = new Group();
  for (const g of [deskGL, deskCSS]) { g.position.set(DESK.at[0], DESK.at[1], DESK.at[2]); g.rotation.y = DESK.turn; }
  const seek = { fn: null };
  const book = buildBook({ posts: POSTS, more: MORE, part: kit.part, onSeek: (q) => { if (seek.fn) seek.fn(q); } });
  deskGL.add(book.gl); deskCSS.add(book.css);
  scene.add(deskGL, deskCSS);

  // A small paper lantern on the desk's end, the andon's own shape made to stand by a book: the light the pages are
  // read by. Its glow lies on the desk as a soft pool.
  const lantern = new Group();
  {
    const w = 0.15, h = 0.21;
    lantern.add(kit.part(new BoxGeometry(w, h, w), kit.M.lampPaper, [0, 0.05 + h / 2, 0], null, 0));
    lantern.add(kit.part(new BoxGeometry(w - 0.035, 0.012, w - 0.035), kit.M.lampGlow, [0, 0.062 + h, 0], null, 0));
    lantern.add(kit.merge([
      { geo: new BoxGeometry(w + 0.05, 0.035, w + 0.05), pos: [0, 0.045, 0] },
      { geo: new BoxGeometry(w + 0.03, 0.022, w + 0.03), pos: [0, 0.05 + h, 0] },
      { geo: new BoxGeometry(w + 0.09, 0.03, w + 0.09), pos: [0, 0.015, 0] },
    ], kit.M.woodDark));
    const light = new PointLight(0xFFC27A, 7.5, 9, 1.6);
    light.position.set(0.1, 0.42, 0.1);
    lantern.add(light);
    lamps.lights.push({ light, base: light.intensity, desk: true });
    const halo = new Mesh(new CircleGeometry(1, 36), new MeshBasicMaterial({ map: glow, color: 0xE0903C, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.set(0.05, 0.004, 0.02); halo.scale.set(0.95, 0.95, 1);
    lantern.add(halo);
  }
  deskGL.add(lantern);

  // Cherry petals that have come in by the open window and lie on the desk and on the mats behind it: one set for
  // the wide picture, one for the upright one.
  const scatter = (list) => {
    const r = rnd(23), ink = [], pink = [];
    for (const [x, z, onMat] of list) {
      const y = onMat ? 0.374 - DESK.at[1] : DESK.top + 0.0025, yaw = r() * 6.28, a = 0.021 * (0.85 + r() * 0.4), b = a * 0.56, edge = 0.0034;
      const leaf = new CircleGeometry(a, 12); leaf.scale(1, b / a, 1);
      const rim = new CircleGeometry(a + edge, 12); rim.scale(1, (b + edge) / (a + edge), 1);
      pink.push({ geo: leaf, pos: [x, y + 0.0012, z], rot: [-Math.PI / 2, 0, yaw] });
      ink.push({ geo: rim, pos: [x, y, z], rot: [-Math.PI / 2, 0, yaw] });
    }
    const g = new Group();
    g.add(kit.merge(ink, new MeshBasicMaterial({ color: P.ink }), 0), kit.merge(pink, new MeshBasicMaterial({ color: 0xE39AB2 }), 0));
    deskGL.add(g);
    return g;
  };
  const petalsWide = scatter([[0.6, -0.44], [0.9, -0.34], [0.67, -0.39], [0.87, 0.38], [-0.45, -0.445], [-0.2, -1.3, 1], [0.24, -1.4, 1], [0.6, -1.27, 1], [0.48, -1.36, 1], [-0.6, -1.38, 1], [0.03, -1.23, 1]]);
  const petalsTall = scatter([[-0.87, 0.22], [-0.9, 0.02], [-0.84, 0.38], [-0.9, 0.31], [0.92, -0.06]]);

  // The shut ledger's cover drawn with the room (once the camera has left the desk the page's own cover, an element,
  // gives way to it): the pink board and its cream label, painted by code, on the cover's own place (book.js lays
  // the cover's element there; this plane is the same size, in the same frame).
  const coverGL = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 640;
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;                      // (its colours are the page's own, as the cover element has them)
    const m = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: tex, transparent: true }));
    m.visible = false;
    book.faces[0].obj.add(m);
    let drawn = '';
    // w, h: the cover element's size in its own pixels; em: its font size; tall: the phone's book (learning.css)
    m.userData.paint = (w, h, em, tall) => {
      // (the label's type is the page's own: until it is in, the cover is painted again at every call)
      const ready = !document.fonts || document.fonts.check('700 20px "Zen Maru Gothic"');
      if (!ready && document.fonts) document.fonts.load('700 20px "Zen Maru Gothic"');
      const key = [w, h, em, tall, ready].join();
      if (key === drawn) return false;
      drawn = key;
      const s = 640 / Math.max(w, h); c.width = Math.round(w * s); c.height = Math.round(h * s);
      const g = c.getContext('2d'), E = em * s, r = 1.3 * E, bw = 0.17 * E, thin = 0.09 * E;
      const round = (x, y, ww, hh, rr) => {      // rr: [top-left, top-right, bottom-right, bottom-left]
        g.beginPath(); g.moveTo(x + rr[0], y); g.arcTo(x + ww, y, x + ww, y + hh, rr[1]); g.arcTo(x + ww, y + hh, x, y + hh, rr[2]);
        g.arcTo(x, y + hh, x, y, rr[3]); g.arcTo(x, y, x + ww, y, rr[0]); g.closePath();
      };
      g.clearRect(0, 0, c.width, c.height);
      const R = tall ? [0, 0, r, r] : [0, r, r, 0];
      g.fillStyle = '#15131c'; round(0, 0, c.width, c.height, R); g.fill();
      const L = tall ? bw : thin, T = tall ? thin : bw;
      g.fillStyle = '#c97b90'; round(L, T, c.width - L - bw, c.height - T - bw, R.map(x => Math.max(0.01, x - bw))); g.fill();
      const F = (tall ? 2 : 2.3) * E;
      g.font = `700 ${F.toFixed(1)}px "Zen Maru Gothic", sans-serif`;
      const tw = g.measureText('The Ledger').width, lw = tw + 3 * F + 0.28 * F, lh = 1.5 * F + 0.28 * F, x0 = (c.width - lw) / 2, y0 = (c.height - lh) / 2;
      const lr = 0.9 * F;
      g.fillStyle = '#15131c'; round(x0, y0, lw, lh, [lr, lr, lr, lr]); g.fill();
      const lb = 0.14 * F;
      g.fillStyle = 'rgb(251, 243, 232)'; round(x0 + lb, y0 + lb, lw - 2 * lb, lh - 2 * lb, [lr - lb, lr - lb, lr - lb, lr - lb]); g.fill();
      g.fillStyle = 'rgb(58, 58, 66)'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('The Ledger', c.width / 2, y0 + lb + 0.7 * F + 0.5 * F - 0.05 * F);
      tex.needsUpdate = true;
      m.scale.set(w, h, 1);
      return true;                         // (painted again: the room must be drawn again)
    };
    return m;
  })();

  // The moon stands behind the house, a little to the west, and is the one light that casts shadows (the test's own):
  // once the house is in the air, every floating layer lays its shadow on the one below and on the lawn. The shadow
  // map is drawn again only when a piece moves.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const DIR = { learn: rig.dir.intensity, apart: 2.2 };
  {
    const d = rig.dir, c = d.shadow.camera;
    d.target.position.set(3, 4, 8);
    d.position.set(3 - 0.25 * 100, 4 + 0.74 * 100, 8 - 0.62 * 100);
    scene.add(d.target);
    d.castShadow = true;
    d.shadow.mapSize.set(2048, 2048);
    c.left = -46; c.right = 46; c.top = 46; c.bottom = -46; c.near = 20; c.far = 190;
    c.updateProjectionMatrix();
    d.shadow.bias = -0.0005; d.shadow.normalBias = 0.045;
    const lit = (o, cast) => o.traverse(m => {
      if (!m.isMesh || !m.material.isMeshLambertMaterial) return;
      m.castShadow = cast; m.receiveShadow = true;
    });
    lit(ground, false); lit(garden, true); lit(lamps.fixed, false);
    pieces.forEach(p => lit(p.obj, true));
  }

  // The desk's things go with the desk when the furniture lifts: both frames are carried by the desk piece.
  const desk = byName.get('desk');
  desk.obj.updateMatrixWorld(true);
  desk.obj.attach(deskGL); desk.obj.attach(deskCSS);

  // the light of the room (see the head of this file)
  let lastLook = -1;
  function look(k, heavens0) {
    k = Math.round(clamp(k) * 1000) / 1000;
    if (heavens0 !== undefined) heavens.rotation.y = heavens0;
    if (k === lastLook) return;
    lastLook = k;
    lamps.lights.forEach((l) => { l.k = l.far ? k : 1; });
    rig.dir.intensity = DIR.learn + (DIR.apart - DIR.learn) * k;
    matPool.material.opacity = matPool.userData.strength;
  }

  let owner = null;
  return {
    canvas, renderer, scene, camera, kit, rig, sky, heavens, lamps, andon, pieces, byName, petals, spill, patches,
    // the moon's light on the mats: f its strength (1 as at the desk), soft 0 the sharp patch, 1 its soft twin
    moon(f, soft) {
      patches.forEach((m) => { const o = m.userData.strength * f * (m.userData.soft ? soft : m.userData.desk ? 1 : 1 - soft); m.material.opacity = o; m.visible = o > 0.0005; });
    },
    deskGL, deskCSS, book, lantern, petalsWide, petalsTall, coverGL, seek, look,
    // the canvas goes into the layer of the chapter that draws (it keeps its picture and its context when it moves)
    claim(host, who) {
      if (canvas.parentNode !== host) host.insertBefore(canvas, host.firstChild);
      const changed = owner !== who; owner = who;
      return changed;                       // true: the other chapter drew last (put back everything you depend on)
    },
    owner: () => owner,
    // the light of every lamp at a time (the flicker) times what the drawing asks of it: f(l) is its share
    burn(time, f, amp = 0.035) {
      lamps.lights.forEach((l, i) => { l.light.intensity = l.base * (l.k === undefined ? 1 : l.k) * f(l) * (1 + amp * Math.sin(time * 6.1 + i * 2.3) * Math.sin(time * 2.7 + i * 1.1)); });
    },
  };
}
