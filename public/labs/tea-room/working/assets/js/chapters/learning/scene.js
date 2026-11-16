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
import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { TIME, stopOf } from './book.js';
import { acquire, release } from './house.js';
import { DESK } from './world/interior.js';
import { OUTLINE } from './world/kit.js';
import { cameraAt } from '../site/camera.js';

export { TIME, stopOf };

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const rad = (d) => d * Math.PI / 180;

export function mount(host, options = {}) {
  const RM = !!options.reducedMotion;
  const top = options.top || host;                       // where the pages go (in front of the page, so they can be read and pressed)
  host.classList.add('lb'); if (top !== host) top.classList.add('lb');
  const probe = document.createElement('div');           // as tall as the smallest window a phone will show
  probe.className = 'lb-probe';
  host.append(probe);

  // the room is the tea house both this chapter and the next draw (house.js): one world, one renderer
  const HS = acquire();
  const { canvas, renderer, scene, camera, kit, sky, heavens, lamps, andon, petals, deskGL, deskCSS, book, lantern, petalsWide, petalsTall, coverGL } = HS;
  HS.seek.fn = options.onSeek || null;
  // the chapter's word, there when you arrive, gone as the camera comes down to the desk
  // (in the working copy the chapter's name is the page's own, drawn by ../learning.js: the test's word is not made)

  // The pages' own elements, in reading order. Each is laid onto its leaf by one transform of its own (the
  // camera's and the leaf's together), so the page decides which lies over which.
  const layer = document.createElement('div');
  layer.className = 'lb-css';
  book.faces.forEach(f => layer.append(f.el));      // (the faces are the shared book's: a chapter mounted again takes them back)
  book.strips.forEach(sp => layer.append(sp.el));         // the slices a bending leaf is shown as (book.js): no words for a reader
  top.append(layer);
  const vw = new Matrix4(), placed = [...book.faces, ...book.strips];
  const n6 = (x) => (Math.abs(x) < 1e-9 ? 0 : +x.toFixed(7));
  function lay() {
    deskCSS.updateMatrixWorld(true);
    const fov = camera.projectionMatrix.elements[5] * H / 2;
    const head = `translate(${((W + IN) / 2).toFixed(3)}px,${H / 2}px) perspective(${fov.toFixed(3)}px) translateZ(${fov.toFixed(3)}px) matrix3d(`;
    for (const f of placed) {
      if (f.on === false) continue;                       // a strip of a leaf that is not in the air
      const e = vw.multiplyMatrices(camera.matrixWorldInverse, f.obj.matrixWorld).elements;
      // the page's y runs down, the world's up: the middle row and the middle column change sign
      const t = head + n6(e[0]) + ',' + n6(-e[1]) + ',' + n6(e[2]) + ',' + n6(e[3]) + ',' + n6(-e[4]) + ',' + n6(e[5]) + ',' + n6(-e[6]) + ',' + n6(-e[7]) + ','
        + n6(e[8]) + ',' + n6(-e[9]) + ',' + n6(e[10]) + ',' + n6(e[11]) + ',' + n6(e[12]) + ',' + n6(-e[13]) + ',' + n6(e[14]) + ',' + n6(e[15])
        + `) translate(${-f.w / 2}px,${-f.h / 2}px)`;
      if (f.tf !== t) { f.tf = t; f.el.style.transform = t; }
      // a strip is shown only while its own side is turned to the camera (worked out here, not left to the
      // browser, which let parts of a turned-away slice show through)
      if (f.on === true) {
        const facing = e[8] * e[12] + e[9] * e[13] + e[10] * e[14] < 0;
        if (f.facing !== facing) { f.facing = facing; f.el.style.visibility = facing ? 'inherit' : ''; }
      }
    }
  }

  // ---------------------------------------------------------------- the camera
  // Two places: where it arrives from (the homepage's own view of this corner) and where it rests, over the
  // book. rest is fitted to the host's size, so a spread always fills the same share of the picture.
  let W = 1, H = 1, IN = 0, safeH = 1, tall = false, dpr = 1, sized = false, restInk = OUTLINE, restNear = 0.1;
  const from = { p: new Vector3(), q: new Quaternion(), fov: 60 }, match = { p: new Vector3(), q: new Quaternion(), fov: 60 }, rest = { p: new Vector3(), q: new Quaternion(), fov: 24 };
  const v = new Vector3(), up = new Vector3(), tmp = new PerspectiveCamera();
  const toWorld = (x, y, z) => deskGL.localToWorld(v.set(x, y, z)).clone();
  const aim = (o, p, target, upv) => { tmp.position.copy(p); tmp.up.copy(upv); tmp.lookAt(target); o.p.copy(p); o.q.copy(tmp.quaternion); };

  // where the camera arrives from: the host's pose (the place the painted room was seen from), or the test's own
  // (a phone keeps the test's own place to arrive from, the desk whole in the middle: the host's pose is then only
  // where the camera stands while the painting gives way (match), and frame()'s lead takes it from there to its own)
  function fromPose(isTall) {
    const f = options.from && options.from(isTall, W, H, IN);
    if (f) {
      aim(match, new Vector3(f.p[0], f.p[1], f.p[2]), new Vector3(f.t[0], f.t[1], f.t[2]), up.set(0, 1, 0));
      match.fov = f.fov;
      if (!isTall) { from.p.copy(match.p); from.q.copy(match.q); from.fov = match.fov; }
    } else { match.p.copy(from.p); match.q.copy(from.q); match.fov = from.fov; }
  }
  function fit() {
    deskGL.updateWorldMatrix(true, true);
    const M = book.M;
    rest.fov = tall ? 15 : 24;
    const t2 = 2 * Math.tan(rad(rest.fov) / 2);
    let PW, PH, sx, px;
    if (!tall) {
      // The reader's seat: above the desk's room side, looking down at the spread and a little away, so the
      // pages read without leaning and the desk still has depth.
      // The desk is seen whole: the lantern at its left end, the book, the brush and the ink pot at its right.
      PW = 0.54; PH = 0.63; sx = -0.07; rest.fov = 24;
      const el = rad(58), w = 2 * (PW + M), h = (PH + 2 * M) * Math.sin(el);
      const WI = W - IN;                                  // (the width right of the rail: the picture is framed there)
      const fw = clamp(0.92 - 0.29 * (WI / H - 0.9) / 0.7, 0.63, 0.92) * (IN > 0 ? 0.95 : 1), fh = 0.64 * (IN > 0 ? 0.95 : 1);
      const d = Math.max(w / (fw * t2 * WI / H), h / (fh * t2));
      px = H / (d * t2);
      let cx = sx + (fw < 0.7 ? 0.005 : 0);
      // (framed right of the rail: the lantern at the desk's left end may tuck a little under the rail's edge, as the
      // test's lantern is cut by the screen's edge, so that the ink pot and the brush stay whole at the right)
      if (IN > 0) cx -= Math.max(0, IN - 26 - ((W + IN) / 2 + (-0.94 - cx) * px)) / px;
      const c = toWorld(cx, DESK.top + 0.03, -0.03);
      const p = toWorld(cx, DESK.top + 0.03 + d * Math.sin(el), -0.03 + d * Math.cos(el));
      lantern.position.set(-0.81, DESK.top, -0.16);
      petalsWide.visible = true; petalsTall.visible = false;
      aim(rest, p, c, up.set(0, 1, 0)); restT.copy(c);
      aim(from, v.set(-2.43, 2.44, 1.93).clone(), new Vector3(-4.76, 1.52, 1.92), up.set(0, 1, 0));
      from.fov = W / H < 1.2 ? 78 : 70;
      fromPose(false);
    } else {
      // The phone: straight above, the book turned a quarter so the spread stands upright and fills the screen.
      // Above the book the desk's end keeps room for the lantern; below it, for the brush and the ink pot.
      const mt = Math.max(80, safeH * 0.12), mb = Math.max(48, safeH * 0.08), mx = Math.max(12, W * 0.034);
      rest.fov = 15;                                      // a long lens: a leaf rising toward the camera swells little
      const ah = safeH - mt - mb, aw = W - 2 * mx;
      PH = 0.76;
      PW = (clamp(ah / aw, 1.68, 1.86) * (PH + 2 * M) - 2 * M) / 2;
      sx = 0;
      px = Math.min(aw / (PH + 2 * M), ah / (2 * (PW + M)));
      const d = H / (px * t2);
      // the spread's middle is put at the middle of the room it has: mt from the top, mb from the foot of safeH
      const off = ((mt + (safeH - mb)) / 2 - H / 2) / px;
      lantern.position.set(-(PW + M) - 0.092, DESK.top, -0.25);
      petalsWide.visible = false; petalsTall.visible = true;
      const c = toWorld(sx - off, DESK.top, 0);
      aim(rest, toWorld(sx - off, DESK.top + d, 0), c, up.set(0, 0, 1)); restT.copy(c);
      aim(from, new Vector3(-3.9, 2.35, -0.5), new Vector3(-4.3, 1.25, 2.3), up.set(0, 1, 0));
      from.fov = 64;
      fromPose(true);
    }
    restNear = Math.max(0.1, H / (px * t2) - 2.2);
    restInk = Math.min(OUTLINE, 4 / px);                   // about four pixels of line at the desk
    book.layout({ tall, PW, PH, sx, top: DESK.top, px, ink: restInk });
  }

  // ---------------------------------------------------------------- one frame
  let active = true, lastE = -1, lastGL = -1e9, glDirty = true, shown = false;
  let lastLow = -1;
  // Pace: how long frames take here (only while the host's time runs; a held time is a still and is drawn whole).
  // A machine that cannot keep up gets the room at a lower resolution while the camera moves, and the whole
  // picture again the moment it stops; and it does without the lamps' flicker, so a turning leaf has the machine.
  const pace = { ms: 16, at: 0, time: NaN, scale: 1, since: 0, n: 0, slow: false };
  const setScale = (k) => { if (k !== pace.scale) { pace.scale = k; renderer.setPixelRatio(dpr * k); renderer.setSize(W, H, false); glDirty = true; } };
  let lastLead = -1, lastLift = -1, lastShut = -1, lastPf = -1;
  const dir = new Vector3(), restUp = new Vector3();
  const ctl = new Vector3(), restT = new Vector3(), lookT = new Vector3(), qq = new Quaternion(), to = { p: new Vector3(), q: new Quaternion(), fov: 60 }, toCam = { p: [0, 0, 0], q: [0, 0, 0], fov: 60 }, bz = new Vector3();
  // where the camera goes when it leaves the desk: the first place of the next chapter's camera (../site/camera.js)
  function toPose() {
    cameraAt(0, tall, toCam);
    aim(to, new Vector3(...toCam.p), new Vector3(...toCam.q), up.set(0, 1, 0));
    to.fov = toCam.fov;
  }
  // The house is the next chapter's too: when this chapter draws after it, everything it moved is put back.
  function takeBack() {
    for (const p of HS.pieces) { p.obj.position.copy(p.home); p.obj.rotation.set(0, 0, 0); p.k = -1; p.c = -1; }
    lamps.lights.forEach((l) => { if (l.home) l.light.position.copy(l.home); });
    camera.up.set(0, 1, 0);
    HS.moon(1, 0);
    HS.spill.material.opacity = HS.spill.userData.strength;
    petals.mesh.visible = true;
    renderer.shadowMap.needsUpdate = true;
    renderer.setPixelRatio(dpr * pace.scale); renderer.setSize(W, H, false);
    camera.aspect = (W - IN) / H;
    if (IN > 0) camera.setViewOffset(W - IN, H, -IN, 0, W, H); else camera.clearViewOffset();
    sky.stars.material.size = 2.3 * dpr;
    fit();
    lastE = -1; lastLift = -1; lastShut = -1; lastPf = -1; glDirty = true;
  }
  // q: the chapter's progress; lead: see the head of ../learning.js; shut: the book shuts (0 open, 1 shut); lift: the
  // camera leaves the desk for the next chapter's first place (0 at rest over the book, 1 there)
  function frame(q, time = 0, lead = 0, shut = 0, lift = 0) {
    if (!active || !sized) return false;
    if (HS.claim(host, 'learning')) takeBack();
    q = clamp(q);
    const e = RM ? 1 : ss(0, 1, clamp(q / TIME.arrive));
    lead = RM || e > 0 ? 0 : Math.round(clamp(lead) * 1000) / 1000;   // 1: at the host's pose (match), 0: at from
    shut = Math.round(clamp(shut) * 1000) / 1000; lift = Math.round(clamp(lift) * 10000) / 10000;
    if (lead !== lastLead || lift !== lastLift) { lastLead = lead; lastLift = lift; lastE = -1; }
    const running = time !== pace.time;
    pace.time = time;
    const moving = e !== lastE && lastE >= 0;
    if (running) {
      const now = performance.now(), dt = now - pace.at;
      if (pace.at && dt > 0) { pace.ms += (Math.min(dt, 250) - pace.ms) * 0.12; pace.n++; }
      pace.at = now;
      if (pace.n > 5 && pace.ms > 50) pace.slow = true;   // (it stays so: the flicker does not come and go)
      if (moving || lastE < 0) {                          // the camera is moving
        if (lastE >= 0 && pace.n > 3 && pace.ms > 60 && now - pace.since > 400 && pace.scale > 0.5) { pace.since = now; setScale(pace.scale - 0.25); }
      } else if (pace.scale < 1) setScale(1);             // it has stopped: the whole picture again
    } else if (pace.scale < 1) setScale(1);
    if (e !== lastE) {
      lastE = e;
      if (lift > 0) {
        // Leaving the desk, in one curve: it rises off the book, comes down under the paper ceiling and backs away
        // toward the room's middle, the next chapter's first place.
        toPose();
        // (a phone's reader's seat is high over the roof, straight above the book: there the camera first comes down,
        // under the paper ceiling, the lens widening so the book keeps its size; then it turns up to the room)
        const DOWN = tall ? 0.42 : 0, Y1 = 3.15;
        // (the heading the book is read at: straight down, the picture's top points that way)
        if (tall) restUp.set(0, 1, 0).applyQuaternion(rest.q);
        let s = lift, start = rest.p, fov0 = rest.fov;
        if (DOWN > 0) {
          const k = ss(0, DOWN, lift), d0 = rest.p.y - restT.y;
          bz.copy(rest.p); bz.y = rest.p.y + (Y1 - rest.p.y) * k;
          const fd = Math.min(50, 2 * Math.atan(Math.tan(rad(rest.fov) / 2) * d0 / (bz.y - restT.y)) * 180 / Math.PI);
          start = ctl.copy(rest.p); start.y = Y1; fov0 = Math.min(50, 2 * Math.atan(Math.tan(rad(rest.fov) / 2) * d0 / (Y1 - restT.y)) * 180 / Math.PI);
          s = clamp((lift - DOWN) / (1 - DOWN));
          if (s <= 0) {
            camera.position.copy(bz); camera.quaternion.copy(rest.q); camera.fov = fd;
            camera.near = Math.max(0.1, bz.y - 3.2);                // (nothing of the house above the camera's way down is drawn: its eaves come lower than the ceiling)
            kit.ink.uniforms.uW.value = restInk + (OUTLINE - restInk) * ss(0, 1, k) * 0.5;
            s = -1;
          }
        }
        if (s >= 0) {
          const a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s;
          const st = start === rest.p ? rest.p : bz.copy(start);
          const cp = new Vector3().copy(st).lerp(to.p, 0.45); cp.y = Math.max(to.p.y, Math.min(st.y, 2.45));
          const pos = new Vector3().copy(st).multiplyScalar(a).addScaledVector(cp, b).addScaledVector(to.p, c);
          camera.position.copy(pos);
          // (it keeps its eye on the book while it rises, then on the room's far corner, where the next chapter looks)
          lookT.copy(restT).lerp(new Vector3(...toCam.q), ss(0.12, 0.95, s));
          tmp.position.copy(pos); tmp.up.set(0, 1, 0); tmp.lookAt(lookT); qq.copy(tmp.quaternion);
          if (tall) {
            // A phone: the eye stays on the book all the way, but the picture's top is the one the book is read at
            // (straight down) and only turns to the sky's as the camera comes to look ahead: the picture never spins.
            dir.copy(restUp).multiplyScalar(1 - ss(0.05, 0.95, s)); dir.y += ss(0.05, 0.95, s);
            tmp.up.copy(dir.normalize()); tmp.lookAt(lookT); camera.quaternion.copy(tmp.quaternion);
          } else camera.quaternion.copy(qq);
          camera.fov = fov0 + (to.fov - fov0) * ss(0, 0.7, s);
          camera.near = DOWN > 0 ? 0.1 : restNear + (0.1 - restNear) * ss(0, 0.5, s);
          kit.ink.uniforms.uW.value = restInk + (OUTLINE - restInk) * (DOWN > 0 ? 0.5 + 0.5 * ss(0, 0.6, s) : ss(0, 0.6, s));
        }
      } else {
        if (lead > 0) {
          camera.position.lerpVectors(from.p, match.p, lead);
          camera.quaternion.slerpQuaternions(from.q, match.q, lead);
          camera.fov = from.fov + (match.fov - from.fov) * lead;
        } else {
          camera.position.lerpVectors(from.p, rest.p, e);
          camera.quaternion.slerpQuaternions(from.q, rest.q, e);
          // (the lens narrows only once the camera has turned down to the desk: narrowed on the way, it would close
          // in on whatever stands ahead, the andon)
          camera.fov = from.fov + (rest.fov - from.fov) * ss(0.3, 1, e);
        }
        camera.near = 0.1 + (restNear - 0.1) * e;          // at rest the camera may stand above the paper ceiling
        // the ink line holds its weight on screen as the camera comes close
        kit.ink.uniforms.uW.value = OUTLINE + (restInk - OUTLINE) * e;
      }
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      glDirty = true;
    }
    if (shut > 0) { if (shut !== lastShut) { book.shut(shut); glDirty = true; } }
    else if (book.pose(q, RM)) glDirty = true;
    if (shut !== lastShut) glDirty = true;
    lastShut = shut;
    // once the camera is well away from the desk, the shut book is drawn with the room (the next chapter's own)
    const gl = lift >= 0.5;
    if (coverGL.visible !== gl) { coverGL.visible = gl; layer.style.visibility = gl ? 'hidden' : ''; glDirty = true; }
    if (gl) { const f = book.faces[0]; if (coverGL.userData.paint(f.w, f.h, parseFloat(f.el.style.fontSize) || 10, tall)) glDirty = true; }
    // (the moon's patches on the mats go faint as the camera leaves the desk: from afar they read as a white rug)
    const pf = 1 - 0.55 * ss(0.3, 1, lift);
    const sf = ss(0.1, 0.6, lift);
    if (pf + sf * 10 !== lastPf) { lastPf = pf + sf * 10; HS.moon(pf, sf); glDirty = true; }
    // the light: the desk's corner; as the camera leaves, the far lamps come on and the andon burns up again
    HS.look(ss(0.3, 1, lift), rad(48));

    // The room is drawn again only when it has changed: while the camera moves, every frame; once it rests, only
    // the lamps' flicker moves in it, and ten pictures a second carry that (a leaf turning is the page's own work).
    const flicker = !pace.slow && time - lastGL >= (lastE < 1 || lift > 0 ? 1 / 30 : 1 / 10);
    if (glDirty || flicker || time < lastGL) {
      const down = 1 - 0.55 * lastE * (1 - ss(0.2, 0.9, lift));
      HS.burn(time, (l) => (l === andon ? down : 1), 0.045);
      petals.update(time);
      renderer.render(scene, camera);
      lastGL = time; glDirty = false;
    }
    lay();
    if (!shown) { shown = true; host.classList.add('lb-live'); top.classList.add('lb-live'); }
    return true;
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    const d = Math.min(window.devicePixelRatio || 1, options.maxPixelRatio || 2);
    const s = Math.min(h, probe.clientHeight || h);
    if (w === W && h === H && d === dpr && s === safeH && sized) return;
    W = w; H = h; dpr = d; safeH = s; sized = true;
    tall = w / h < 0.8;
    host.dataset.layout = top.dataset.layout = tall ? 'tall' : 'wide';
    IN = tall ? 0 : Math.max(0, Math.min(w * 0.3, options.inset ? options.inset() : 0));
    if (HS.owner() === 'learning') takeBack();
  }

  function setActive(on) { on = !!on; if (on && !active) glDirty = true; active = on; }
  function dispose() {
    active = false;
    if (HS.seek.fn === options.onSeek) HS.seek.fn = null;
    if (canvas.parentNode === host) canvas.remove();
    [probe, layer].forEach(n => n.remove());
    host.classList.remove('lb', 'lb-live'); top.classList.remove('lb');
    release();
  }

  resize();
  return {
    frame, resize, setActive, dispose,
    info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, tall, W, H, safeH, faces: book.faces.length }),
    book, camera,
  };
}
