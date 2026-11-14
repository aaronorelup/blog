/* THIS WEBSITE: the tea house, taken apart (the tea room test tests/tea-house-apart/, made a chapter of the page:
   site/camera.js and site/plan.js are the test's own, unchanged; the drawing below is its scene.js and apart.js).

   How it joins (join.js SITE): the learning chapter ends in the same modelled room (learning/house.js: one world, one
   renderer for both). There the ledger shuts and the camera leaves the desk, arriving, as that section ends, at this
   chapter's first place: inside the room by the lit andon. From there the test's own track: the camera backs out
   through the open front, down the stepping stones to the homepage's own first view of the house, out under the
   torii and up; the house comes apart layer by layer like an exploded drawing, its layers and the room's corners
   named; then the card (in the page, #site .site-card: three sentences and the four posts) comes up beside the
   drawing (a phone: under it), and the drawing makes room for it.
   The chapter's name comes on over the camera's lift (the lead) from the left wing, as every chapter's does, and
   leaves as the camera backs out of the room.

   Everything on the screen is a function of q, the layout and where the card is (the lamps' flicker, the petals and
   the pointer's lean follow the time). Motion off: four stills (inside, the whole house, half apart, apart), as the
   test has them. */
import { acquire, release } from './learning/house.js';
import { DESK } from './learning/world/interior.js';
import { OUTLINE } from './learning/world/kit.js';
import { ACT, cameraAt } from './site/camera.js';
import { plan, pose } from './site/plan.js';
import { SITE, PROJ, learnInset, projectsInset } from './join.js';
import { garden as walkGarden, layout as walkLayout, firstView } from './projects/plan.js';
import { PROJECTS, SHELVES } from './projects/data.js';
import { drawLantern } from './projects/scene.js';
import { build as buildGrove } from './projects/twin.js';
import { Quaternion, Vector3 } from 'three';

var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var rad = function (d) { return d * Math.PI / 180; };
var T_HELD = 7.3;                 // (the learning chapter's held time: the petals do not jump at the join)
var K = 1.4;                      // (look B lays its type out larger than it is drawn)
var SVG = 'http://www.w3.org/2000/svg';

// The names over the drawing (the test's own): a chip names a corner of the room with the meaning the homepage gave
// it; a tag names a layer as it lifts (wide: in one column beside the drawing, as on an exploded drawing).
var NAMES = [
  { kind: 'tag', piece: 'roof-left', at: [-2.2, 0.4, 2.2], text: 'Roof', tall: [-14, -34, 'r'], col: ['roof-right', [0.55, -0.55, -0.55]] },
  { kind: 'tag', piece: 'ceiling', at: [-6.9, 0, 5.7], text: 'Paper ceiling', tall: [-10, 26, 'r'], col: ['ceiling', [1, 0, -0.8]] },
  { kind: 'tag', piece: 'frieze-left', at: [0, 0, 5.2], text: 'Beams', tall: [-8, 24, 'r'], col: ['frieze-right', [0, 0, -0.8]] },
  { kind: 'tag', piece: 'shoji-front-l-0', at: [-0.95, 0, 0], text: 'Shoji screens', tall: [-6, 60, 'r'], col: ['shoji-right-b-1', [0, 0, -0.6]] },
  { kind: 'tag', piece: 'wall-left', at: [0, 0, 5.2], text: 'Plaster walls', tall: [-6, 30, 'r'], col: ['wall-right-b', [0, 0, -0.6]] },
  { kind: 'tag', piece: 'mat-0', at: [-0.7, 0, 5.1], text: 'Tatami floor', tall: [-6, 26, 'r'], col: ['platform-right', [1, 1, -0.2]] },
  { kind: 'chip', piece: 'painting', at: [0, 0.6, 0], title: 'Projects', sub: 'The alcove', wide: [-26, 84, 'r'], tall: [-4, -58, 'r'] },
  { kind: 'chip', piece: 'desk', at: [0, 0.3, 0], title: 'The Ledger & Courses', sub: 'The writing desk', wide: [-64, -22, 'r'], tall: [-18, 58, 'l'] },
  { kind: 'chip', piece: 'table', at: [0, 0.6, 0], title: 'Right now', sub: 'The tea table', wide: [36, -72, 'l'], tall: [-30, -50, 'l'] },
  { kind: 'chip', fixed: [0, 5.15, 22], after: 'cabinet', title: 'On your way out', sub: 'The gate', wide: [44, -34, 'l'], tall: [26, 30, 'l'] }
];
var TAGS = NAMES.filter(function (n) { return n.kind === 'tag'; });

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, root = document.documentElement;
  host.innerHTML = '<div class="st-gl"></div><div class="st-vig"></div><svg class="st-leaders" xmlns="http://www.w3.org/2000/svg"></svg><div class="st-labels"></div>' +
    '<div class="flat word st-word"></div><div class="flat say mono st-say"></div>';
  var $ = function (s) { return host.querySelector(s); };
  var vig = $('.st-vig'), glHost = $('.st-gl'), leaders = $('.st-leaders'), labelBox = $('.st-labels'), word = $('.st-word'), say = $('.st-say');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  word.style.visibility = say.style.visibility = 'hidden';
  var card = section.querySelector('.site-card');

  NAMES.forEach(function (n) {
    var el = document.createElement('div');
    el.className = 'st-' + n.kind;
    if (n.kind === 'chip') {
      var b = document.createElement('b'); b.textContent = n.title; el.appendChild(b);
      var s = document.createElement('span'); s.textContent = n.sub; el.appendChild(s);
    } else el.textContent = n.text;
    labelBox.appendChild(el);
    n.el = el; n.shown = null;
    n.line = document.createElementNS(SVG, 'line');
    n.dot = document.createElementNS(SVG, 'circle');
    n.dot.setAttribute('r', n.kind === 'chip' ? 3.5 : 2.5);
    leaders.appendChild(n.line); leaders.appendChild(n.dot);
  });

  // ------------------------------------------------------------------ the world (shared with the learning chapter)
  var HS = acquire();
  var renderer = HS.renderer, camera = HS.camera, pieces = HS.pieces, book = HS.book;
  var bounce = HS.lamps.lights.filter(function (l) { return l.follow === 'bounce'; })[0];
  var wallBack = HS.byName.get('wall-back'), deskPiece = HS.byName.get('desk');

  var W = 1, H = 1, dpr = 1, tall = false, narrow = false, IN = 0, pl = null, laid = false, active = false, lastP = -99;
  var left = 0, wy = 0, sx = 0, sy = 0, wing = 0, colW = 0, trackS = 5.4;
  var pillB = 0, lastMask = '';
  var lastU = -1, lastGaps = -1, lastGL = -1e9, dirty = true;
  var cam = { p: [0, 0, 0], q: [0, 0, 0], fov: 46 };
  var look = new Vector3(), v = new Vector3(), pt = { x: 0, y: 0, behind: false };
  var box = { x0: 0, y0: 0, x1: 0, y1: 0 }, safe = { x0: 0, y0: 0, x1: 1, y1: 1 };
  var drawing = false, sway = { x: 0, y: 0 }, lastT = NaN, lastZoom = 1, lastKey = '';
  var pace = { ms: 16, at: NaN, n: 0, slow: false, movedAt: -1e9, scale: 1 };
  // the join into the projects walk (join.js PROJ): its camera keys, the walk's first view, the grove
  var JG = walkGarden(PROJECTS, SHELVES), JL = null, JV = null, JK = null, grove = null, groveKey = '', hillFar = null;
  var cA = { p: [0, 0, 0], q: [0, 0, 0], fov: 46 }, jo = { zoom: 1, dx: 0, dy: 0 };

  var railRect = function () { var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null; return rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null; };

  // The shut ledger on the desk, as the learning chapter leaves it (its measures reckoned the way learning/scene.js
  // reckons them, from the window alone): drawn with the room from here on (house.js coverGL).
  function deskBook() {
    var M = book.M, PW, PH, sx0, px, t2;
    if (!tall) {
      PW = 0.54; PH = 0.63; sx0 = -0.07; t2 = 2 * Math.tan(rad(24) / 2);
      var el = rad(58), w = 2 * (PW + M), h = (PH + 2 * M) * Math.sin(el), WI = W - IN;
      var fw = clamp(0.92 - 0.29 * (WI / H - 0.9) / 0.7, 0.63, 0.92) * (IN > 0 ? 0.95 : 1), fh = 0.64 * (IN > 0 ? 0.95 : 1);
      var d = Math.max(w / (fw * t2 * WI / H), h / (fh * t2));
      px = H / (d * t2);
      HS.lantern.position.set(-0.81, DESK.top, -0.16);
    } else {
      var mt = Math.max(80, H * 0.12), mb = Math.max(48, H * 0.08), mx = Math.max(12, W * 0.034), ah = H - mt - mb, aw = W - 2 * mx;
      PH = 0.76; PW = (clamp(ah / aw, 1.68, 1.86) * (PH + 2 * M) - 2 * M) / 2; sx0 = 0;
      px = Math.min(aw / (PH + 2 * M), ah / (2 * (PW + M)));
      HS.lantern.position.set(-(PW + M) - 0.092, DESK.top, -0.25);
    }
    HS.petalsWide.visible = !tall; HS.petalsTall.visible = tall;
    book.layout({ tall: tall, PW: PW, PH: PH, sx: sx0, top: DESK.top, px: px, ink: Math.min(OUTLINE, 4 / px) });
    book.shut(1);
    var f = book.faces[0];
    HS.coverGL.userData.paint(f.w, f.h, parseFloat(f.el.style.fontSize) || 10, tall);
    HS.coverGL.visible = true;
  }

  // the learning chapter drew last: everything this chapter depends on is put back the way it wants it
  function takeOver() {
    pace.scale = 1; renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.near = 0.1;
    HS.sky.stars.material.size = 2.3 * dpr;
    pl = plan(pieces, tall);
    deskBook();
    lastU = -1; lastGaps = -1; dirty = true; lastKey = '';
  }

  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    tall = W / H < 0.8; narrow = W <= 820;
    IN = tall ? 0 : Math.max(0, Math.min(W * 0.3, learnInset(W, H, railRect())));
    // the name: look B's rule (learning.js, agents.js and closing.js have the same)
    var wtall = W / H < 0.9, wp = clamp(W * (wtall ? 0.15 : 0.115), 52, 190 * TEA.s()), sp = clamp(W * 0.0175, 17, 27 * TEA.s());
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    var rb = railRect(); wing = rb ? rb.right : 0; pillB = rb ? rb.bottom : 0;
    NAMES.forEach(function (n) { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; });
    colW = Math.max.apply(null, TAGS.map(function (n) { return n.w; })) + 52;
    // the track: the test's own (wide 5.4 screens, a phone 4.6), then a screen for the card (chapters.css)
    var m = options.marks.track; trackS = m ? Math.max(1, m.h - 1) : 5.4;
    was = {}; laid = true;
    if (HS.owner() === 'site') takeOver();
    joinLayout();
  }

  // ------------------------------------------------------------------ the join into the projects walk (join.js PROJ)
  // The walk's first view for this window (projects/plan.js, as the walk itself reckons it), and the camera's keys
  // from the taken-apart house (cameraAt(1)) round to the front, back over the lawn and down behind the grove to it.
  function joinLayout() {
    var rb = railRect();
    JL = walkLayout(JG, W, H, projectsInset(W, H, rb), W <= 820 && rb ? rb.bottom : 0);
    JV = firstView(JG, JL);
    var key = [W, H, JL.IN, JL.top].join();
    if (key !== groveKey) {
      groveKey = key;
      if (grove) grove.dispose();
      grove = buildGrove(HS.kit, JG, JL, JV, PROJ.HOUSE_Z, drawLantern(document, true), function () { dirty = true; options.redraw(); });
      grove.group.visible = false;
      HS.scene.add(grove.group);
      if (!hillFar) HS.scene.traverse(function (o) {
        if (hillFar || !o.isMesh || !o.geometry) return;
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
        var c = o.geometry.boundingSphere.center;
        if (Math.abs(c.z - 62) < 1 && Math.abs(c.x + 4) < 1) hillFar = o;
      });
    }
    var Zc = grove.Zc, ey = JV.y, x = JV.x;
    var tallJ = W / H < 0.8;
    // (the keys: t, where the camera is, what it looks at, its lens)
    JK = ([
      { t: 0, p: null, q: null, fov: 0 },                                       // (cameraAt(1), filled at each frame)
      // (back over the avenue, high, the house closed and far down it; then down behind the grove of the first view)
      tallJ ? { t: 0.42, p: [4, 30, Zc - 16], q: [0, 2.6, 2], fov: 44 } : { t: 0.42, p: [9, 24, Zc - 18], q: [0, 2.6, 2], fov: 34 },
      { t: 0.8, p: [x + (tallJ ? 0.4 : 1.2), ey + 6.2, Zc + 6.5], q: [x, ey - 0.6, Zc - 60], fov: JV.fov + 3 },
      { t: 1, p: [x, ey, Zc], q: [x, ey, Zc - 60], fov: JV.fov }
    ]);
  }
  // monotone tangents (as site/camera.js): the path never overshoots a key, and comes to rest at both ends
  function tangents(keys, get) {
    var n = keys.length, d = [], m = [];
    for (var i = 0; i < n - 1; i++) d.push((get(keys[i + 1]) - get(keys[i])) / (keys[i + 1].t - keys[i].t));
    for (i = 0; i < n; i++) m.push(0);
    for (i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) continue;
      var h0 = keys[i].t - keys[i - 1].t, h1 = keys[i + 1].t - keys[i].t, w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
      m[i] = (w0 + w1) / (w0 / d[i - 1] + w1 / d[i]);
    }
    return m;
  }
  function joinCam(j, out) {
    var keys = JK, k0 = keys[0];
    k0.p = [out.p[0], out.p[1], out.p[2]]; k0.q = [out.q[0], out.q[1], out.q[2]]; k0.fov = out.fov;
    var mp = [0, 1, 2].map(function (a) { return tangents(keys, function (k) { return k.p[a]; }); });
    var mq = [0, 1, 2].map(function (a) { return tangents(keys, function (k) { return k.q[a]; }); });
    var mf = tangents(keys, function (k) { return k.fov; });
    var x = clamp(j), i = 0;
    while (i < keys.length - 2 && x > keys[i + 1].t) i++;
    var a = keys[i], b = keys[i + 1], h = b.t - a.t, s = (x - a.t) / h, s2 = s * s, s3 = s2 * s;
    var h00 = 2 * s3 - 3 * s2 + 1, h10 = (s3 - 2 * s2 + s) * h, h01 = -2 * s3 + 3 * s2, h11 = (s3 - s2) * h;
    for (var n = 0; n < 3; n++) {
      out.p[n] = h00 * a.p[n] + h10 * mp[n][i] + h01 * b.p[n] + h11 * mp[n][i + 1];
      out.q[n] = h00 * a.q[n] + h10 * mq[n][i] + h01 * b.q[n] + h11 * mq[n][i + 1];
    }
    out.fov = h00 * a.fov + h10 * mf[i] + h01 * b.fov + h11 * mf[i + 1];
    return out;
  }
  var was = {};
  function css(e, k, val) { var key = e.className + k; if (was[key] !== val) { was[key] = val; e.style[k] = val; } }
  function putName(el, x, y, k, up, fade) {
    var tr, o = 1 - fade, xx = x;
    if (narrow) { tr = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - k) * H * 0.07 - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o *= clamp((k - 0.06) * 5.5); }
    else { var w = el.offsetWidth / K; xx = x - (1 - k) * (Math.max(x, 0) + w + 30); tr = 'translate3d(' + xx.toFixed(1) + 'px,' + (y - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    css(el, 'transform', tr);
    // (the left wing is the rail's right edge: what of the name is still left of it is not drawn)
    var cut = narrow ? 0 : (wing - xx) * K;
    // (not a hard edge: the letters melt into the wing over a few dozen pixels, so no clean-cut half letter shows)
    var fe = Math.max(8, Math.min(70, x - wing - 2)) * K, mk = !narrow && cut + fe > 0 ? 'linear-gradient(to right, transparent ' + cut.toFixed(1) + 'px, #000 ' + (cut + fe).toFixed(1) + 'px)' : '';
    css(el, 'maskImage', mk); css(el, 'webkitMaskImage', mk);
    css(el, 'visibility', k < 0.0005 || o <= 0 ? 'hidden' : '');
    css(el, 'opacity', o < 1 ? o.toFixed(3) : '');
  }

  // the rectangle of the window the house covers, every piece of it, as the camera stands
  function extent() {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (var j = 0; j < pieces.length; j++) {
      var p = pieces[j], c = p.obj.position, hy = p.size.y / 2, hx = p.size.x / 2, hz = p.size.z / 2;
      if (p.turn) hx = hz = Math.max(hx, hz);
      for (var i = 0; i < 8; i++) {
        v.set(c.x + (i & 1 ? hx : -hx), c.y + (i & 2 ? hy : -hy), c.z + (i & 4 ? hz : -hz)).project(camera);
        if (v.x < x0) x0 = v.x; if (v.x > x1) x1 = v.x; if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
      }
    }
    box.x0 = (x0 * 0.5 + 0.5) * W; box.x1 = (x1 * 0.5 + 0.5) * W; box.y0 = (-y1 * 0.5 + 0.5) * H; box.y1 = (-y0 * 0.5 + 0.5) * H;
    return box;
  }
  function project(x, y, z, out) {
    v.set(x, y, z).project(camera);
    out.x = (v.x * 0.5 + 0.5) * W; out.y = (-v.y * 0.5 + 0.5) * H; out.behind = v.z > 1;
    return out;
  }

  // The join's one moon: the sky's moon (learning/world/sky.js) leaves its place behind the house before the next
  // chapter's name comes in, going right and up to where the walk's painted moon stands on the screen (twin.js: its
  // middle and size at the walk's first view). There it turns into the walk's own moon (the same place and size, the
  // one fading as the other comes up), which grows to the painting's size and keeps that place on the screen while the
  // camera pulls back and comes down, set far down the view so the trees stand in front of it as in the painting. At
  // the walk's first view it is exactly where twin.js stands it. So the reader follows one moon from the house to the
  // walk, never under the name. The sky's moon is put back as it was whenever the join is not on (j 0).
  var mHome = null, mA = new Vector3(), mB = new Vector3(), mL = new Vector3(), mR = new Vector3(), mQ = new Quaternion();
  function px(v, out) { mL.copy(v).project(camera); out.x = (mL.x * 0.5 + 0.5) * W; out.y = (-mL.y * 0.5 + 0.5) * H; return out; }
  // stand a moon (its disc's radius in the world rw) at (sx, sy) on the screen, D down the view, r pixels in radius
  function standMoon(o, sx, sy, D, r, rw) {
    var cp = camera.position, right = mR.setFromMatrixColumn(camera.matrixWorld, 0);
    mL.set(sx / W * 2 - 1, 1 - sy / H * 2, 0.5).unproject(camera).sub(cp).normalize();
    mA.copy(cp).addScaledVector(mL, D);
    var c = px(mA, {}), e = px(mB.copy(mA).addScaledVector(right, 1), {}), k = Math.hypot(e.x - c.x, e.y - c.y), s = r / (rw * k);
    if (o.parent) o.parent.worldToLocal(mB.copy(mA)); else mB.copy(mA);
    o.position.copy(mB); o.scale.set(s, s, 1);
  }
  function moonTo(j) {
    var m = HS.sky.moon, hv = HS.heavens;
    if (!mHome) mHome = { p: m.position.clone(), q: m.quaternion.clone(), mats: m.children.map(function (c) { return { m: c.material, o: c.material.opacity, t: c.material.transparent }; }) };
    if (!(j > 0)) {
      if (mHome.moved) {
        m.position.copy(mHome.p); m.quaternion.copy(mHome.q); m.scale.set(1, 1, 1); m.visible = true;
        m.children.forEach(function (c) { c.renderOrder = 0; });
        mHome.mats.forEach(function (x) { x.m.opacity = x.o; x.m.transparent = x.t; x.m.needsUpdate = true; });
        mHome.moved = false;
      }
      return;
    }
    var tw = grove.moon, at = tw.userData.at, cp = camera.position;
    var wx = ss(0, 0.12, j), wy = ss(0.04, 0.26, j), turn = ss(0.2, 0.4, j), grow = ss(0.2, 0.7, j);
    hv.updateMatrixWorld(); grove.group.updateMatrixWorld(); camera.updateMatrixWorld();
    hv.localToWorld(mA.copy(mHome.p));
    // where the sky's moon stands on the screen now, and its radius there (3.75: the sky moon's disc)
    var h = px(mA, {}), e = px(mB.copy(mA).addScaledVector(mR.setFromMatrixColumn(camera.matrixWorld, 0), 3.75), {});
    var rh = Math.hypot(e.x - h.x, e.y - h.y), dA = mA.distanceTo(cp), dT = tw.userData.home.distanceTo(cp);
    var sx = h.x + (at[0] - h.x) * wx, sy = h.y + (at[1] - h.y) * wy, r = rh + (at[2] - rh) * grow;
    // the sky's moon, until it has turned into the walk's
    m.visible = turn < 0.997;
    if (m.visible) {
      standMoon(m, sx, sy, dA + (dT - dA) * wy, r, 3.75);
      hv.localToWorld(mL.set(0, 6, 0)); mL.lerp(cp, wx);
      m.lookAt(mL);
      // (its glow goes as it turns; the disc stays whole under the walk's moon, which is drawn over it)
      mHome.mats.forEach(function (x, i) { x.m.transparent = true; x.m.opacity = i === 0 ? x.o * (1 - turn) : x.o; x.m.needsUpdate = !mHome.moved; });
      // (drawn first, under the walk's moon and every tree: twin.js draws its moon at -1)
      m.children.forEach(function (c) { c.renderOrder = -2; });
    }
    mHome.moved = true;
    // the walk's moon (twin.js update() gave it its opacity by k; here it comes up as the sky's moon turns into it)
    tw.visible = turn > 0.003;
    if (tw.visible) {
      tw.material.opacity = turn; standMoon(tw, sx, sy, dT, r, tw.userData.r);
      // (it faces the camera as the sky's moon does, and is square to the first view again as the camera arrives)
      tw.lookAt(cp); tw.quaternion.slerp(mQ, ss(0.85, 1, j));
    }
  }

  // ------------------------------------------------------------------ the drawing (the test's scene.js render())
  function render(T, time, sw, close, shadowsNow, j) {
    var u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
    // (the join: the house closes again over its first half)
    if (j > 0) u *= 1 - io(ss(0.02, 0.5, j));
    var gaps = 1 - 0.3 * close;
    pose(pieces, pl, u, gaps);
    // the sky turns as the evening goes on; it starts where the learning chapter left it (the moon in the ledger's
    // window) and has come round to the test's own sky by the time the camera is out under the torii
    // (a phone: the moon comes to rest right of where the next chapter's name will stand, never under its lines)
    var hv = (tall ? -0.227 : 0) + (tall ? 0.023 : 0.384) * ss(0.3, 0.62, T);
    HS.look(1, rad(48) + (hv - rad(48)) * ss(0.03, 0.2, T));

    cameraAt(T, tall, cam);
    var out = sw ? ss(0.17, ACT.whole, T) : 0;
    if (out > 0 && (sw.x || sw.y)) {
      var dx0 = cam.p[0] - cam.q[0], dy0 = cam.p[1] - cam.q[1], dz0 = cam.p[2] - cam.q[2];
      var flat = Math.hypot(dx0, dz0), len = Math.hypot(flat, dy0);
      var a = Math.atan2(dx0, dz0) - sw.x * 0.075 * out, el = Math.min(1.2, Math.max(0.12, Math.atan2(dy0, flat) + sw.y * 0.04 * out));
      cam.p[0] = cam.q[0] + Math.sin(a) * Math.cos(el) * len; cam.p[1] = cam.q[1] + Math.sin(el) * len; cam.p[2] = cam.q[2] + Math.cos(a) * Math.cos(el) * len;
    }
    if (j > 0) joinCam(j, cam);
    camera.position.set(cam.p[0], cam.p[1], cam.p[2]);
    look.set(cam.q[0], cam.q[1], cam.q[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.fov = cam.fov; camera.near = 0.1; camera.aspect = W / H;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();

    // Once the camera is outside and the house starts to open, the drawing is kept whole inside the space it is given
    // (right of the rail, clear of the card): slid, and made smaller if it must be. Until then the picture is framed
    // as the learning chapter frames its own, its middle the middle of the part right of the rail.
    var zoom = 1, w = ss(ACT.whole, ACT.apart0 + 0.07, T) * (1 - ss(0, 0.42, j)), shift = IN / 2 * (1 - ss(ACT.whole, ACT.apart0 + 0.07, T)), dx = 0, dy = 0;
    if (w > 0) {
      camera.updateMatrixWorld();
      var b = extent(), bw = b.x1 - b.x0, bh = b.y1 - b.y0;
      var fit = Math.min(1, (safe.x1 - safe.x0) / bw, (safe.y1 - safe.y0) / bh);
      zoom = 1 + (fit - 1) * w;
      var cx = W / 2 + ((b.x0 + b.x1) / 2 - W / 2) * zoom;
      var top = H / 2 + (b.y0 - H / 2) * zoom, bottom = H / 2 + (b.y1 - H / 2) * zoom;
      dx = ((safe.x0 + safe.x1) / 2 - cx) * w;
      dy = (top < safe.y0 ? safe.y0 - top : bottom > safe.y1 ? safe.y1 - bottom : 0) * w;
    }
    // (the join: the walk's own framing comes in as the camera comes down: its middle right of the rail, its horizon
    // where the walk has it)
    if (j > 0 && JV) { var fj = ss(0.55, 1, j); dx += JV.dx * fj; dy += JV.dy * fj; }
    if (zoom !== 1 || dx || dy || shift) camera.setViewOffset(W, H, (W - W / zoom) / 2 - (dx + shift) / zoom, (H - H / zoom) / 2 - dy / zoom, W / zoom, H / zoom);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    lastZoom = zoom;

    // the ink line holds its weight on screen: never under the homepage's 3.5 cm, never under about 1.5 pixels
    var dist = camera.position.distanceTo(look);
    HS.kit.ink.uniforms.uW.value = Math.max(OUTLINE, 1.5 * 2 * dist * Math.tan(cam.fov * Math.PI / 360) / (H * zoom));

    // each lantern's light goes where its lantern went; the room's soft bounce rises to sit among the walls
    HS.lamps.lights.forEach(function (l) {
      if (!l.home) return;
      if (l === bounce) l.light.position.set(l.home.x, l.home.y + (wallBack.obj.position.y - wallBack.home.y) * 0.72, l.home.z);
      else if (l.follow) {
        var p = HS.byName.get(l.follow);
        l.light.position.set(l.home.x + p.obj.position.x - p.home.x, l.home.y + p.obj.position.y - p.home.y, l.home.z + p.obj.position.z - p.home.z);
      }
    });
    HS.burn(time, function (l) {
      if (l === bounce) return 1 + l.gain * wallBack.k;
      if (l.follow && l.gain) return 1 + l.gain * HS.byName.get(l.follow).k;
      return 1;
    }, 0.035);
    // the light on the path goes with the room that cast it; the moon's patches on the mats go as the roof lifts
    HS.spill.material.opacity = HS.spill.userData.strength * (1 - 0.75 * ss(0.12, 0.7, u));
    var mo = 0.45 * (1 - ss(0, 0.08, u));      // (as the learning chapter leaves them: learning/scene.js)
    HS.moon(mo, 1);
    // (the petals that lay on the desk and the mats stay behind once the furniture lifts)
    var keep = deskPiece.k <= 0;
    HS.petalsWide.visible = keep && !tall; HS.petalsTall.visible = keep && tall;

    // the grove of the walk (from the join's start, and only for this chapter: the learning chapter never sees it)
    if (grove) {
      grove.group.visible = j > 0;
      if (hillFar) hillFar.visible = !(j > 0);
      if (j > 0) grove.update(camera, ss(0.72, 1, j), j);
    }
    moonTo(grove && j > 0 ? j : 0);
    HS.petals.update(time);
    if ((u !== lastU || gaps !== lastGaps) && shadowsNow) { lastU = u; lastGaps = gaps; renderer.shadowMap.needsUpdate = true; }
    renderer.render(HS.scene, camera);
  }

  // ------------------------------------------------------------------ the still pictures (motion off), the test's
  var STILLS = [0, ACT.apart0, ACT.apart0 + (ACT.apart1 - ACT.apart0) * 0.47, 1];

  function frame(q, t, ptr) {
    if (!laid) layout();
    var p = q < 0 ? q : q * options.span();
    lastP = p;
    // the name: in from the left wing over the camera's lift (the learning chapter draws the room under it), out the
    // same way as the camera backs out of the room (narrow: it rises and fades)
    // (the track: from SITE.START, a screen before the section's top, to the card: join.js)
    var T = clamp((p - SITE.START) / (trackS - SITE.START));
    // the join into the projects walk: the section's last J screens (motion off: one cut, join.js PROJ.RM_CUT, in
    // screens before the projects section's top, which is a screen after this section's scroll ends)
    var span = options.span(), j = RM ? (p - span - 1 >= PROJ.RM_CUT ? 1 : 0) : clamp((p - (span - PROJ.J)) / PROJ.J);
    var nk = RM ? (p > SITE.NAME[0] + 0.3 && T < 0.2 ? 1 : 0) : io(ss(SITE.NAME[0], SITE.NAME[1], p));
    var outk = RM ? 0 : io(ss(SITE.OUT[0], SITE.OUT[1], T));
    var gone = narrow ? outk : 0, up = narrow ? outk * H * 0.06 : 0;
    putName(word, left, wy, gone >= 1 ? 0 : narrow ? nk : nk * (1 - outk), up, gone);
    putName(say, sx, sy, gone >= 1 ? 0 : narrow ? nk : nk * (1 - outk), up * 0.7, gone);
    drawing = p >= SITE.START;
    if (!drawing) {
      // (the lead: only the name; the room is the learning chapter's)
      css(glHost, 'visibility', 'hidden'); css(leaders, 'visibility', 'hidden'); css(labelBox, 'visibility', 'hidden');
      if (grove) grove.group.visible = false;
      if (hillFar) hillFar.visible = true;
      moonTo(0);
      return true;
    }
    if (HS.claim(glHost, 'site')) takeOver();
    // (the walk's own vignette comes on as the camera comes down to its first view)
    var vk = Math.round(ss(0.7, 1, j) * 200) / 200;
    css(vig, 'opacity', vk > 0 ? String(vk) : '0');
    var f0 = book.faces[0];
    if (HS.coverGL.userData.paint(f0.w, f0.h, parseFloat(f0.el.style.fontSize) || 10, tall)) dirty = true;
    css(glHost, 'visibility', ''); css(leaders, 'visibility', ''); css(labelBox, 'visibility', '');

    // where the card is (the page itself, not the camera's glide behind it): the drawing makes room for it
    var cr = card.getBoundingClientRect(), cardTop = cr.top, stacked = tall || W <= 759;
    // (a narrow screen: the rail is a little pill at the top left. As the card goes up past it, the card's top fades
    // away just under the pill, so no line of it ever passes under the pill's own words)
    var cut = 0;
    if (narrow && pillB > 0) cut = Math.round(pillB + 8 - cr.top);
    var mk = cut > -30 ? 'linear-gradient(to bottom, transparent ' + Math.max(0, cut) + 'px, #000 ' + (Math.max(0, cut) + 30) + 'px)' : '';
    if (mk !== lastMask) { lastMask = mk; card.style.webkitMaskImage = mk; card.style.maskImage = mk; }
    var rest = H - cr.height - 10;                     // where the card's top stands once it is all up (a phone)
    var c = clamp((H - cardTop) / Math.max(1, cr.height + 10));
    if (RM) {
      var i = T < 0.2 * 1.25 * 0.8 ? 0 : T < 0.4 ? 1 : T < 0.6 ? 2 : 3;
      T = STILLS[i];
      c = i === 3 && cardTop < (stacked ? H * 0.62 : H - 6) ? 1 : 0;
    }
    var u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
    var mx = Math.max(14, W * 0.045), my = Math.max(14, H * 0.055), x0 = Math.max(mx, IN > 0 ? IN + 18 : 0);
    safe.x0 = x0; safe.y0 = my; safe.x1 = W - mx; safe.y1 = H - my;
    var room = rest - safe.y0 >= 150, e, close = 0;
    // (the card leaving at the top, as the next chapter's name comes on: the drawing goes back to the middle)
    var leave = ss(H * 0.25, -H * 0.15, cr.bottom - H * 0.5);
    if (RM) e = stacked && leave > 0 ? 0 : c;   // (motion off, a phone: once the card starts to leave, the drawing is whole again: one cut)
    else if (!stacked) e = io(clamp((H * 1.15 - cardTop) / (H * 0.3))) * (1 - leave);
    else if (room) e = clamp((safe.y1 - (cardTop - 10)) / Math.max(1, safe.y1 - rest)) * (1 - leave);
    else e = io(c) * (1 - leave);
    // (once the card has gone, the next chapter's name stands at the top left: the drawing keeps below it)
    if (!stacked) safe.y0 += leave * H * 0.27;
    var column = !stacked;
    if (column) safe.x1 -= colW * ss(ACT.apart0, ACT.apart0 + 0.06, T);
    if (!stacked) safe.x1 += (cr.left - 30 - safe.x1) * e;
    else if (room) { safe.y1 += (rest - safe.y1) * e; close = e; }

    // the pointer: the camera leans a few degrees toward it once outside; the lean glides after the hand
    var sw = null;
    if (!HELD && !RM) {
      var dt = isNaN(lastT) ? 1 : clamp(t - lastT, 0, 1); lastT = t;
      var g = 1 - Math.exp(-dt * 4.5), ax = ptr && isFinite(ptr.x) ? ptr.x : 0, ay = ptr && isFinite(ptr.y) ? ptr.y : 0;
      // (the join: the lean goes as the camera comes down, so the last place is still under the dissolve)
      var jl = 1 - ss(0.3, 0.75, j); ax *= jl; ay *= jl;
      if (!isFinite(sway.x) || !isFinite(sway.y)) sway.x = sway.y = 0;
      sway.x += (ax - sway.x) * g; sway.y += (ay - sway.y) * g;
      if (Math.abs(ax - sway.x) < 0.001) sway.x = ax;
      if (Math.abs(ay - sway.y) < 0.001) sway.y = ay;
      if (Math.abs(ax - sway.x) > 0.001 || Math.abs(ay - sway.y) > 0.001) options.redraw();
      sw = sway;
    }
    // Pace (as the learning chapter keeps it): the drawing is drawn again only when something in it has changed, and
    // for the petals and the lamps' flicker fifteen times a second. A machine that cannot keep up (no graphics card)
    // gets the picture at half its pixels and without the moon's shadows moving while the camera moves, and does
    // without the flicker and the petals' fall; the moment the camera stops, the whole picture is drawn again, so a
    // place looks the same however it was reached.
    var running = !HELD && !RM, now = performance.now();
    if (running && !isNaN(pace.at)) { var gap = now - pace.at; if (gap > 0 && gap < 1000) { pace.ms += (gap - pace.ms) * 0.15; pace.n++; } if (pace.n > 6 && pace.ms > 50) pace.slow = true; }
    pace.at = running ? now : NaN;
    var key = T.toFixed(5) + ',' + j.toFixed(5) + ',' + close.toFixed(4) + ',' + (sw ? sw.x.toFixed(3) + sw.y.toFixed(3) : '') + ',' + Math.round(safe.x0) + ',' + Math.round(safe.y0) + ',' + Math.round(safe.x1) + ',' + Math.round(safe.y1) + ',' + W + ',' + H;
    var moved = key !== lastKey;
    if (moved) pace.movedAt = now;
    var resting = !running || now - pace.movedAt > 350;
    var scale = pace.slow && !resting ? 0.5 : 1;
    if (scale !== pace.scale) { pace.scale = scale; renderer.setPixelRatio(dpr * scale); renderer.setSize(W, H, false); dirty = true; }
    var tick = running && !pace.slow && j < 0.97 && (t - lastGL >= 1 / 15 || t < lastGL);
    if (dirty || moved || tick) {
      // (at the join's end the time stands still too: the picture under the dissolve does not move)
      render(T, HELD || j >= 0.97 ? T_HELD : pace.slow ? T_HELD : t, sw && j < 1 ? sw : null, close, resting || !pace.slow, j);
      lastGL = t; dirty = false; lastKey = key;
    }

    // the names: each appears as its piece lifts and rides with it
    var colX = 0, lastY = -1e9;
    if (column) {
      TAGS.forEach(function (n) {
        var pc = HS.byName.get(n.col[0]), qq = pc.obj.position, gg = n.col[1];
        project(qq.x + gg[0] * pc.size.x / 2, qq.y + gg[1] * pc.size.y / 2, qq.z + gg[2] * pc.size.z / 2, pt);
        n.cx = pt.x; n.cy = pt.y; n.ty = Math.max(pt.y, lastY + n.h + 6); lastY = n.ty;
        if (pt.x > colX) colX = pt.x;
      });
      colX = Math.min(colX + 44, W - 14 - (colW - 52));
    }
    var edge = stacked ? W - 12 : W - 12 + (cr.left - 10 - (W - 12)) * e;
    NAMES.forEach(function (n) {
      var inCol = column && n.kind === 'tag';
      var pc = HS.byName.get(inCol ? n.col[0] : n.piece || n.after);
      // (once the card has gone up and away the next chapter's name stands over the drawing: the names have been
      // read, and go with the card, so no word of the drawing stands beside it, the alcove's "Projects" least of all)
      var a = ss(0.25, 0.8, pc.k) * (1 - leave);
      if (inCol) a *= 1 - e;
      else if (n.kind === 'tag') a *= (1 - ss(pc.t1 + 0.035, pc.t1 + 0.1, u)) * (1 - e);
      else if (stacked) a *= 1 - e;
      var ax2 = 0, ay2 = 0;
      if (a > 0.004) {
        if (inCol) { pt.x = n.cx; pt.y = n.cy; }
        else if (n.fixed) project(n.fixed[0], n.fixed[1], n.fixed[2], pt);
        else { var qp = pc.obj.position; project(qp.x + n.at[0], qp.y + n.at[1], qp.z + n.at[2], pt); }
        ax2 = pt.x; ay2 = pt.y;
        a *= clamp((ax2 - 6 - x0 + mx) / 40) * clamp((W - 6 - ax2) / 40) * clamp((ay2 - 6) / 40) * clamp((H - 6 - ay2) / 40);
      }
      if (a <= 0.004) {
        if (n.shown !== false) { n.shown = false; n.el.style.visibility = 'hidden'; n.line.style.visibility = 'hidden'; n.dot.style.visibility = 'hidden'; }
        return;
      }
      if (n.shown !== true) { n.shown = true; n.el.style.visibility = 'inherit'; n.line.style.visibility = 'inherit'; n.dot.style.visibility = 'inherit'; }
      var off = inCol ? [colX - 8 - ax2, n.ty - ay2, 'l'] : tall || !n.wide ? n.tall : n.wide;
      var jx = ax2 + off[0], jy = ay2 + off[1];
      var lx = off[2] === 'r' ? jx - n.w - 8 : jx + 8;
      var minX = Math.max(12, x0 - 4);
      if (lx < minX) { jx += minX - lx; lx = minX; }
      if (lx + n.w > edge) { jx -= lx + n.w - edge; lx = edge - n.w; }
      var d = window.devicePixelRatio || 1, snap = function (x) { return Math.round(x * d) / d; };
      n.el.style.transform = 'translate3d(' + snap(lx) + 'px,' + snap(jy - n.h / 2) + 'px,0)';
      n.el.style.opacity = a.toFixed(3);
      n.line.setAttribute('x1', ax2.toFixed(1)); n.line.setAttribute('y1', ay2.toFixed(1));
      n.line.setAttribute('x2', jx.toFixed(1)); n.line.setAttribute('y2', jy.toFixed(1));
      n.line.style.opacity = (a * 0.6).toFixed(3);
      n.dot.setAttribute('cx', ax2.toFixed(1)); n.dot.setAttribute('cy', ay2.toFixed(1));
      n.dot.style.opacity = a.toFixed(3);
    });
    return true;
  }

  layout();
  return {
    frame: frame,
    resize: function () { layout(); },
    setActive: function (on) { active = !!on; },
    dispose: function () { card.style.webkitMaskImage = card.style.maskImage = ''; moonTo(0); if (grove) { grove.dispose(); grove = null; } if (hillFar) hillFar.visible = true; if (HS.canvas.parentNode === glHost) HS.canvas.remove(); host.textContent = ''; release(); },
    // (the rail and a phone's pill name this chapter once its name is on the screen)
    owns: function () { return lastP >= (SITE.NAME[0] + SITE.NAME[1]) / 2; },
    // (from SITE.START on this chapter draws the room: the learning chapter, at its end, stands aside)
    drawing: function () { return drawing; },
    info: function () { return { T: clamp((lastP - SITE.START) / (trackS - SITE.START)), zoom: lastZoom, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; }
  };
}
