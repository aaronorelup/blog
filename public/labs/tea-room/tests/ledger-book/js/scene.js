// "Learning": the ledger opens. One chapter of the tea room, written to be mounted by a host page.
//
//   const view = mount(hostElement, { reducedMotion, onSeek });
//   view.frame(q, time)   draws the chapter at progress q (0 to 1) and time (seconds; hold it for a still)
//   view.resize()         measures the host again
//   view.setActive(on)    false: frame() draws nothing until it is true again
//   view.dispose()
//
// The room is the homepage's tea house by night (world/, the homepage's own builders), drawn by three.js: the
// writing desk by its window, the andon beside it, the moonlit court outside. The book's pages are elements of the
// page (book.js), laid over the picture by the same camera, so their words are real text. The camera arrives once
// (q from 0 to TIME.arrive) and then stands still; every later change is a leaf turning.
// Everything drawn is a function of q, of time and of the host's size. The module keeps no clock and reads no
// scroll: the host does. onSeek(q) is how the book asks the host to go somewhere (a link focused by the keyboard
// on a page that is turned away).
import {
  AdditiveBlending, BoxGeometry, BufferGeometry, CanvasTexture, CircleGeometry, DoubleSide, Float32BufferAttribute, Group, Matrix4,
  Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, PointLight, Quaternion, Scene, Vector3, WebGLRenderer,
} from '../vendor/three.module.min.js';
import { buildBook, TIME, stopOf } from './book.js';
import { MORE, POSTS } from './posts.js';
import { buildGarden } from './world/garden.js';
import { buildHouse } from './world/house.js';
import { buildInterior, DESK } from './world/interior.js';
import { makeKit, OUTLINE } from './world/kit.js';
import { ANDON, buildLamps } from './world/lamps.js';
import { P, makeRig, setPalette } from './world/palette.js';
import { buildPetals } from './world/petals.js';
import { buildSky } from './world/sky.js';

export { TIME, stopOf };

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const rad = (d) => d * Math.PI / 180;

export function mount(host, options = {}) {
  const RM = !!options.reducedMotion;
  host.classList.add('lb');
  const canvas = document.createElement('canvas');
  canvas.className = 'lb-gl'; canvas.setAttribute('aria-hidden', 'true');
  const probe = document.createElement('div');           // as tall as the smallest window a phone will show
  probe.className = 'lb-probe';
  host.append(canvas, probe);

  setPalette(1);                                          // the same evening as the tea room: night
  const kit = makeKit();
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(P.cream, 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 400);

  const rig = makeRig(1);
  scene.add(rig.amb, rig.hemi, rig.dir);
  const sky = buildSky(kit, rnd(7));
  const heavens = new Group();
  heavens.add(sky.clouds, sky.stars, sky.moon);
  heavens.rotation.y = rad(48);                           // the moon stands over the court, in the ledger's window
  scene.add(sky.dome, heavens);
  scene.add(kit.part(new CircleGeometry(70, 40), kit.M.grass, [0, -0.02, 4], [-Math.PI / 2, 0, 0], 0));
  scene.add(buildGarden(kit));
  const lamps = buildLamps(kit);
  scene.add(lamps.fixed);
  [...buildHouse(kit), ...buildInterior(kit), ...lamps.pieces].forEach(p => scene.add(p.obj));
  const petals = buildPetals(rnd(11), 130);
  scene.add(petals.mesh);

  // lamplight lying on the mats round the andon: drawn light, added to what it falls on
  const glow = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)');
    r.addColorStop(0.7, 'rgba(255,255,255,0.14)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  })();
  const pool = (x, y, z, r, color, strength) => {
    const m = new Mesh(new CircleGeometry(1, 36), new MeshBasicMaterial({ map: glow, color, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.set(r, r, 1);
    scene.add(m);
    return m;
  };
  pool(ANDON[0], 0.372, ANDON[1], 2.4, 0xC97A32, 0.22);
  const andon = lamps.lights[0];                          // the floor lantern's light: it is turned down as the camera comes to the desk

  // Moonlight through the two open windows of the west wall: a soft-edged patch of cool light on whatever it
  // falls on (the mats, the desk's top), each the window's own shape thrown along the moon's direction.
  renderer.localClippingEnabled = true;
  const pane = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    g.shadowColor = '#fff'; g.shadowBlur = 4; g.fillStyle = '#fff'; g.fillRect(5, 5, 54, 54);
    return new CanvasTexture(c);
  })();
  const MOON = { tan: 0.6, turn: rad(40.5) };             // how steeply it comes down, and how far it leans along the wall
  const moonlight = (z0, z1, Y, strength, clip) => {
    const hit = (yw, zw) => { const t = (yw - Y) / MOON.tan; return [-6.31 + t * Math.cos(MOON.turn), Y, zw - t * Math.sin(MOON.turn)]; };
    const a = hit(1.86, z1), b = hit(1.86, z0), c = hit(3.24, z0), d = hit(3.24, z1);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    const m = new Mesh(g, new MeshBasicMaterial({ map: pane, color: 0x6488E2, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, clippingPlanes: clip || null }));
    m.renderOrder = 1;
    scene.add(m);
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
  const book = buildBook({ posts: POSTS, more: MORE, part: kit.part, onSeek: options.onSeek });
  deskGL.add(book.gl); deskCSS.add(book.css);
  scene.add(deskGL);

  // A small paper lantern on the desk's end, the andon's own shape made to stand by a book: the light the pages
  // are read by. Its glow lies on the desk as a soft pool.
  const lantern = new Group();
  {
    // (seen from above: its top is open paper, so the eye meets the light and not a lid)
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
    lamps.lights.push({ light, base: light.intensity });
    const halo = new Mesh(new CircleGeometry(1, 36), new MeshBasicMaterial({ map: glow, color: 0xE0903C, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.set(0.05, 0.004, 0.02); halo.scale.set(0.95, 0.95, 1);
    lantern.add(halo);
  }
  deskGL.add(lantern);
  // The pages' own elements, in reading order. Each is laid onto its leaf by one transform of its own (the
  // camera's and the leaf's together), so the page decides which lies over which.
  const layer = document.createElement('div');
  layer.className = 'lb-css';
  book.faces.forEach(f => layer.append(f.el));
  host.append(layer);
  const vw = new Matrix4();
  const n6 = (x) => (Math.abs(x) < 1e-9 ? 0 : +x.toFixed(7));
  function lay() {
    deskCSS.updateMatrixWorld(true);
    const fov = camera.projectionMatrix.elements[5] * H / 2;
    const head = `translate(${W / 2}px,${H / 2}px) perspective(${fov.toFixed(3)}px) translateZ(${fov.toFixed(3)}px) matrix3d(`;
    for (const f of book.faces) {
      const e = vw.multiplyMatrices(camera.matrixWorldInverse, f.obj.matrixWorld).elements;
      // the page's y runs down, the world's up: the middle row and the middle column change sign
      const t = head + n6(e[0]) + ',' + n6(-e[1]) + ',' + n6(e[2]) + ',' + n6(e[3]) + ',' + n6(-e[4]) + ',' + n6(e[5]) + ',' + n6(-e[6]) + ',' + n6(-e[7]) + ','
        + n6(e[8]) + ',' + n6(-e[9]) + ',' + n6(e[10]) + ',' + n6(e[11]) + ',' + n6(e[12]) + ',' + n6(-e[13]) + ',' + n6(e[14]) + ',' + n6(e[15])
        + `) translate(${-f.w / 2}px,${-f.h / 2}px)`;
      if (f.tf !== t) { f.tf = t; f.el.style.transform = t; }
    }
  }

  // the chapter's word, there when you arrive, gone as the camera comes down to the desk
  const word = document.createElement('h2');
  word.className = 'lb-word'; word.textContent = options.word || 'Learning';
  const say = document.createElement('p');
  say.className = 'lb-say'; say.textContent = options.say || 'The ledger on the writing desk, opened.';
  host.append(word, say);

  // ---------------------------------------------------------------- the camera
  // Two places: where it arrives from (the homepage's own view of this corner) and where it rests, over the
  // book. rest is fitted to the host's size, so a spread always fills the same share of the picture.
  let W = 1, H = 1, safeH = 1, tall = false, dpr = 1, sized = false, restInk = OUTLINE, restNear = 0.1;
  const from = { p: new Vector3(), q: new Quaternion(), fov: 60 }, rest = { p: new Vector3(), q: new Quaternion(), fov: 24 };
  const v = new Vector3(), up = new Vector3(), tmp = new PerspectiveCamera();
  const toWorld = (x, y, z) => deskGL.localToWorld(v.set(x, y, z)).clone();
  const aim = (o, p, target, upv) => { tmp.position.copy(p); tmp.up.copy(upv); tmp.lookAt(target); o.p.copy(p); o.q.copy(tmp.quaternion); };

  function fit() {
    deskGL.updateMatrixWorld(true);
    const M = book.M, t2 = 2 * Math.tan(rad(rest.fov) / 2);
    let PW, PH, sx, px;
    if (!tall) {
      // The reader's seat: above the desk's room side, looking down at the spread and a little away, so the
      // pages read without leaning and the desk still has depth.
      // The desk is seen whole: the lantern at its left end, the book, the brush and the ink pot at its right.
      PW = 0.54; PH = 0.63; sx = -0.07;
      const el = rad(58), w = 2 * (PW + M), h = (PH + 2 * M) * Math.sin(el);
      const fw = clamp(0.92 - 0.29 * (W / H - 0.9) / 0.7, 0.63, 0.92), fh = 0.64;
      const d = Math.max(w / (fw * t2 * W / H), h / (fh * t2));
      px = H / (d * t2);
      const cx = sx + (fw < 0.7 ? 0.005 : 0);
      const c = toWorld(cx, DESK.top + 0.03, -0.03);
      const p = toWorld(cx, DESK.top + 0.03 + d * Math.sin(el), -0.03 + d * Math.cos(el));
      lantern.position.set(-0.81, DESK.top, -0.16);
      aim(rest, p, c, up.set(0, 1, 0));
      aim(from, v.set(-2.43, 2.44, 1.93).clone(), new Vector3(-4.76, 1.52, 1.92), up.set(0, 1, 0));
      from.fov = W / H < 1.2 ? 78 : 70;
    } else {
      // The phone: straight above, the book turned a quarter so the spread stands upright and fills the screen.
      // Above the book the desk's end keeps room for the lantern; below it, for the brush and the ink pot.
      const mt = Math.max(80, safeH * 0.12), mb = Math.max(48, safeH * 0.08), mx = Math.max(12, W * 0.034);
      const ah = safeH - mt - mb, aw = W - 2 * mx;
      PH = 0.76;
      PW = (clamp(ah / aw, 1.68, 1.86) * (PH + 2 * M) - 2 * M) / 2;
      sx = 0;
      px = Math.min(aw / (PH + 2 * M), ah / (2 * (PW + M)));
      const d = H / (px * t2);
      // the spread's middle is put at the middle of the room it has: mt from the top, mb from the foot of safeH
      const off = ((mt + (safeH - mb)) / 2 - H / 2) / px;
      lantern.position.set(-(PW + M) - 0.092, DESK.top, -0.25);
      const c = toWorld(sx - off, DESK.top, 0);
      aim(rest, toWorld(sx - off, DESK.top + d, 0), c, up.set(0, 0, 1));
      aim(from, new Vector3(-3.9, 2.35, -0.5), new Vector3(-4.3, 1.25, 2.3), up.set(0, 1, 0));
      from.fov = 64;
    }
    restNear = Math.max(0.1, H / (px * t2) - 2.2);
    restInk = Math.min(OUTLINE, 4 / px);                   // about four pixels of line at the desk
    book.layout({ tall, PW, PH, sx, top: DESK.top, px, ink: restInk });
  }

  // ---------------------------------------------------------------- one frame
  let active = true, lastE = -1, lastGL = -1e9, glDirty = true, shown = false;
  const lastWord = { o: -1 };
  function frame(q, time = 0) {
    if (!active || !sized) return;
    q = clamp(q);
    const e = RM ? 1 : ss(0, 1, clamp(q / TIME.arrive));
    if (e !== lastE) {
      lastE = e;
      camera.position.lerpVectors(from.p, rest.p, e);
      camera.quaternion.slerpQuaternions(from.q, rest.q, e);
      camera.fov = from.fov + (rest.fov - from.fov) * e;
      camera.near = 0.1 + (restNear - 0.1) * e;          // at rest the camera may stand above the paper ceiling
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      // the ink line holds its weight on screen as the camera comes close
      kit.ink.uniforms.uW.value = OUTLINE + (restInk - OUTLINE) * e;
      glDirty = true;
    }
    if (book.pose(q, RM)) glDirty = true;

    const gone = RM ? (q > 0.04 ? 1 : 0) : ss(0.015, 0.075, q);
    if (gone !== lastWord.o) {
      lastWord.o = gone;
      const o = (1 - gone).toFixed(3);
      word.style.opacity = o; say.style.opacity = o;
      word.style.transform = `translate3d(0,${(-gone * 26).toFixed(1)}px,0)`;
      say.style.transform = `translate3d(0,${(-gone * 16).toFixed(1)}px,0)`;
      word.style.visibility = say.style.visibility = gone >= 1 ? 'hidden' : '';
    }

    // The room is drawn again only when it has changed: while the camera moves, every frame; once it rests, only
    // the lamps' flicker and the petals move, and twenty-four pictures a second carry those.
    if (glDirty || time - lastGL >= 1 / 24 || time < lastGL) {
      lamps.lights.forEach((l, i) => { l.light.intensity = l.base * (l === andon ? 1 - 0.55 * lastE : 1) * (1 + 0.045 * Math.sin(time * 6.1 + i * 2.3) * Math.sin(time * 2.7 + i * 1.1)); });
      petals.update(time);
      renderer.render(scene, camera);
      lastGL = time; glDirty = false;
    }
    lay();
    if (!shown) { shown = true; host.classList.add('lb-live'); }
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    const d = Math.min(window.devicePixelRatio || 1, options.maxPixelRatio || 2);
    const s = Math.min(h, probe.clientHeight || h);
    if (w === W && h === H && d === dpr && s === safeH && sized) return;
    W = w; H = h; dpr = d; safeH = s; sized = true;
    tall = w / h < 0.8;
    host.dataset.layout = tall ? 'tall' : 'wide';
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    sky.stars.material.size = 2.3 * dpr;
    fit();
    lastE = -1; glDirty = true;
  }

  function setActive(on) { active = !!on; if (active) glDirty = true; }
  function dispose() {
    active = false;
    renderer.dispose();
    [canvas, probe, layer, word, say].forEach(n => n.remove());
    host.classList.remove('lb', 'lb-live');
  }

  resize();
  return {
    frame, resize, setActive, dispose,
    info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, tall, W, H, safeH, faces: book.faces.length }),
    book,
  };
}
