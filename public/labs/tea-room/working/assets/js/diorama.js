/* DIORAMA: a painted theatre whose camera is the scroll.
   Everything drawn here is a function of two numbers: the scroll position and the time.
   ?still=1 holds the time; ?y=0.37 sets the scroll to that fraction of the page. */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FROZEN = STILL || RM;
  var T_HELD = 12.4;

  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var rnd = function (seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  var W = 0, H = 0, portrait = false, narrow = false;   // portrait: the camera's framing; narrow: the cards' layout (as the CSS)
  var T = {};            // tracks: document top and height of the sections that drive the stage
  var docH = 1;

  // ------------------------------------------------------------------ flats
  // A flat is a painted plane standing at a distance. b is where its anchor appears (in base pixels from the
  // optical axis) when the camera is at m = 0; r is its distance as a share of the back plate's distance.
  function Flat(id, o) {
    var f = { el: $(id), id: id, b: [0, 0], size: [100, 100], r: 1, a: [0.5, 0.5], lw: 100, last: '', lo: -1, shown: true, text: false };
    for (var k in o) f[k] = o[k];
    return f;
  }
  function hide(f) { if (f.shown) { f.el.style.visibility = 'hidden'; f.shown = false; } }
  function show(f) { if (!f.shown) { f.el.style.visibility = ''; f.shown = true; } }
  function setOp(f, o) { o = Math.round(o * 1000) / 1000; if (o !== f.lo) { f.el.style.opacity = o; f.lo = o; } }
  function setTr(f, tr) { if (tr !== f.last) { f.el.style.transform = tr; f.last = tr; } }
  function proj(b, r, cam) {
    var dz = r - cam.m;
    return { x: (b[0] * r - cam.C[0]) / dz - cam.o[0], y: (b[1] * r - cam.C[1]) / dz - cam.o[1], z: r / dz, dz: dz };
  }
  // sl: a flat sliding in its own plane to a wing. -1 is fully off to the left, +1 fully off to the right.
  function place(f, cam, S0, dx, dy, op, sl) {
    op = op === undefined ? 1 : op;
    var p = proj(f.b, f.r, cam);
    if (p.dz <= 0.016 || op <= 0.002 || (sl && Math.abs(sl) > 0.9995)) { hide(f); return null; }
    var w = f.size[0] * S0 * p.z, h = f.size[1] * S0 * p.z;
    var x = W / 2 + p.x * S0 - w * f.a[0] + (dx || 0), y = H / 2 + p.y * S0 - h * f.a[1] + (dy || 0);
    if (sl) x += sl < 0 ? sl * (Math.max(x, 0) + w + 30) : sl * (W - Math.min(x, W) + 30);
    var out = { x: x, y: y, w: w, h: h, z: p.z };
    if (x > W + 30 || y > H + 30 || x + w < -30 || y + h < -30) { hide(f); return out; }
    show(f);
    setTr(f, 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / f.lw).toFixed(5) + ')');
    setOp(f, op);
    return out;
  }
  // where must a flat stand so that it appears at screen point (sx, sy) for a given camera?
  function bAt(sx, sy, r, cam, S0) {
    var dz = r - cam.m;
    return [(((sx - W / 2) / S0 + cam.o[0]) * dz + cam.C[0]) / r, (((sy - H / 2) / S0 + cam.o[1]) * dz + cam.C[1]) / r];
  }
  function sizeImg(f) {            // images are laid out at their own pixel size so they are never scaled up early
    var nw = f.el.naturalWidth || 100, nh = f.el.naturalHeight || 100;
    f.lw = nw; f.el.style.width = nw + 'px'; f.el.style.height = nh + 'px';
    if (f.fit) { f.size = [f.fit, f.fit * nh / nw]; }
  }
  function sizeBox(f, k) {         // boxes (glows, the television) are laid out at k times their opening size
    f.lw = Math.max(8, f.size[0] * k); f.el.style.width = f.lw + 'px'; f.el.style.height = (f.lw * f.size[1] / f.size[0]) + 'px';
  }
  function sizeText(f, px, cam, S0) {   // type is laid out a little larger than it will ever be drawn
    var K = f.K || 1.4;
    f.el.style.fontSize = (px * K) + 'px';
    if (f.wrap) f.el.style.width = (f.wrap * px * K) + 'px';
    var w = f.el.offsetWidth, h = f.el.offsetHeight, z = f.r / (f.r - cam.m);
    f.lw = w; f.size = [w / (S0 * K * z), h / (S0 * K * z)];
  }

  // ------------------------------------------------------------------ scenes
  var SC = { sky: $('sc-sky'), room: $('sc-room'), box: $('sc-box'), front: $('sc-front'), garden: $('sc-garden'), cinema: $('sc-cinema') };
  var on = {};
  function sceneOn(name, yes) { if (on[name] !== yes) { on[name] = yes; SC[name].classList.toggle('on', yes); } }

  // garden -----------------------------------------------------------------
  // Base pixels are the far plate's own, measured from the point the opening camera looks along (1408, 786).
  var DOOR = [8, -44], DELTA = 0.5, D_PASS = 0.07;   // the doorway's centre; the room's depth behind it; where the door fills the frame
  var G = {
    S0: 1,
    sky: Flat('g-sky', { size: [2816, 1584], b: [0, 6], r: 4.049 }),
    clouds: Flat('g-clouds', { size: [2816, 509], b: [0, -509.5], r: 2.2195 }),
    veil: Flat('g-veil', { size: [115.25, 122], b: [1356.75 + 57.625 - 1408, 672.25 + 61 - 786], r: 1.0004 }),
    ground: Flat('g-ground', { size: [2816, 1297], b: [0, 149.5], r: 1 }),
    hi: Flat('g-doorhi', { size: [704, 396], b: [8, -44], r: 0.9999 }),
    glow: Flat('g-doorglow', { size: [560, 560], b: [8, -30], r: 0.996 }),
    mid: Flat('g-mid', { size: [787 * 1.335, 989 * 1.335], b: [0, 0], r: 0.7561 }),
    bush: Flat('g-bush', { size: [448 * 1.335, 170 * 1.335], b: [0, 0], r: 0.7561 }),
    tv: Flat('g-tv', { size: [263, 239.5], b: [-443, 347], r: 0.2866 }),
    nr: Flat('g-near-r', { size: [520, 271], b: [0, 0], r: 0.17 }),
    nl: Flat('g-near-l', { size: [420, 196], b: [0, 0], r: 0.15 })
  };
  var gCam0 = { m: 0, C: [0, 0], o: [0, 0] };
  function gCam(p) {
    // one line from the lawn to the threshold: the camera eases off and comes to rest in the doorway
    // the pace is even for the eye: the distance to the door shrinks by the same share with every step
    var m0 = portrait ? -0.9 : -0.28, L0 = portrait ? [0, 185] : [175, -24];
    var t = clamp((p - 0.05) / 0.88), e = lerp(t, t * t * (3 - 2 * t), 0.35), k = io(ss(0.05, 0.6, p));
    var d = (1 - m0) * Math.exp(-3.15 * e) * (1 - ss(0.9, 1, p));
    var m = 1 - d;
    return { m: m, C: [DOOR[0] * k, DOOR[1] * k], o: [L0[0] / (1 - m0) * (1 - k), L0[1] / (1 - m0) * (1 - k)] };
  }
  function layoutGarden() {
    G.S0 = Math.max(W / 1700, H / 1019);
    gCam0 = gCam(0);
    ['sky', 'clouds', 'ground', 'hi', 'veil', 'mid', 'bush', 'nr', 'nl'].forEach(function (k) { sizeImg(G[k]); });
    // the mid plate as the kit places it: 2403 base pixels wide, centred at (-139, -23)
    var mx = -139 - 2403 / 2, my = -23 - 1602 / 2, ms = 2403 / 1800;
    G.mid.b = [mx + (0 + 787 / 2) * ms, my + (94 + 989 / 2) * ms];
    // the television, the right-hand bushes and the near foliage are placed against the frame, whatever its shape
    var tvw = portrait ? W * 0.36 : clamp(W * 0.165, 180, 330);
    var z = G.tv.r / (G.tv.r - gCam0.m);
    G.tv.size = [tvw / (G.S0 * z), tvw / (G.S0 * z) * 1093 / 1200];
    G.tv.b = portrait ? bAt(W * 0.25, H * 0.515, G.tv.r, gCam0, G.S0) : bAt(W * 0.205, H * 0.80, G.tv.r, gCam0, G.S0);
    G.tv.lw = 800; G.tv.el.style.width = '800px'; G.tv.el.style.height = (800 * 1093 / 1200) + 'px';
    sizeBox(G.glow, G.S0 * 1.5);
    function at(f, sx, sy, wpx) {
      var zz = f.r / (f.r - gCam0.m); var nw = f.el.naturalWidth || 1, nh = f.el.naturalHeight || 1;
      f.size = [wpx / (G.S0 * zz), wpx / (G.S0 * zz) * nh / nw]; f.b = bAt(sx, sy, f.r, gCam0, G.S0);
    }
    at(G.bush, portrait ? W * 0.98 : W * 0.9, portrait ? H * 0.585 : H * 0.93, portrait ? W * 0.5 : W * 0.3);
    at(G.nr, W * 0.93, H * 0.985, portrait ? W * 0.7 : W * 0.33);
    at(G.nl, W * 0.035, H * 0.995, portrait ? W * 0.55 : W * 0.25);
  }
  var tvPic = $('g-tv-pic'), tvGlow = $('g-tv-glow');
  function flick(t, seed) {                 // the television's light: steps, unevenly, about eight times a second
    var k = Math.floor(t * 8) + seed * 131; var x = Math.sin(k * 12.9898) * 43758.5453; x = x - Math.floor(x);
    return 0.86 + 0.14 * x;
  }
  function drawSky(cam, t) {
    var seen = 1 / (1 - cam.m) < 5.2 ? 1 : 0;                  // the house front hides the sky from here on
    place(G.sky, cam, G.S0, 0, 0, seen);
    place(G.clouds, cam, G.S0, -(40 + 120 * Math.sin(t * 0.018)) * G.S0, 0, seen);
  }
  function drawGarden(cam, t) {
    var S0 = G.S0, zh = 1 / (1 - cam.m);            // how large the house stands
    // from the lawn the doorway is plain lamplight; coming close, the light thins and the room is there
    place(G.veil, cam, S0, 0, 0, 1 - ss(1.5, 6.5, zh));
    place(G.ground, cam, S0, 0, 0, zh > 2.7 ? 0 : 1);          // past here the sharp repaint covers the frame
    place(G.hi, cam, S0, 0, 0, ss(1.25, 1.7, zh));
    var breathe = 0.9 + 0.06 * Math.sin(t * 1.26) + 0.02 * Math.sin(t * 2.9);
    place(G.glow, cam, S0, 0, 0, breathe * (1 - ss(2.5, 7, zh)));
    place(G.mid, cam, S0, 0, 0, ss(0.02, 0.14, G.mid.r - cam.m));
    place(G.bush, cam, S0, 0, 0, ss(0.02, 0.14, G.bush.r - cam.m));
    var tv = place(G.tv, cam, S0, 0, 0, 1);
    if (tv) { var fl = flick(t, 1); tvPic.style.opacity = fl; tvGlow.style.opacity = 0.55 + 0.45 * fl; }
    place(G.nr, cam, S0, 0, 0, ss(0.015, 0.08, G.nr.r - cam.m));
    place(G.nl, cam, S0, 0, 0, ss(0.015, 0.08, G.nl.r - cam.m));
    var door = proj(DOOR, 1, cam);
    light.x = W / 2 + door.x * S0; light.y = H / 2 + door.y * S0; light.k = 1; light.cold = false;
  }

  // room -------------------------------------------------------------------
  // Base pixels are the room plate's own, from its centre. The room's camera at m = 0 stands in the doorway.
  var R = {
    S0: 1,
    back: Flat('r-back', { size: [2752 * 1.7, 1536 * 2.4], b: [0, 0], r: 1.0005 }),
    backTv: Flat('r-back-tv', { size: [2752 * 1.7, 1536 * 2.4], b: [0, 0], r: 1.0005 }),
    plate: Flat('r-plate', { size: [2752, 1536], b: [0, 0], r: 1 }),
    plateTv: Flat('r-plate-tv', { size: [2752, 1536], b: [0, 0], r: 1 }),
    lamp: Flat('r-lamp', { size: [1100, 1100], b: [564, 150], r: 0.998 }),
    vase: Flat('r-vase', { fit: 121, b: [-130, 180], r: 0.97, a: [0.5, 1] }),
    table: Flat('r-table', { fit: 460, b: [-455, 384], r: 0.62, a: [0.5, 1] }),
    cush: Flat('r-cushions', { fit: 400, b: [600, 529], r: 0.45, a: [0.5, 1] }),
    wStart: Flat('w-start', { r: 0.985, a: [0, 0], text: true }),
    sStart: Flat('s-start', { r: 0.985, a: [0, 0], text: true }),
    wTv: Flat('w-tv', { r: 0.9, a: [0, 0], text: true }),
    sTv: Flat('s-tv', { r: 0.9, a: [0, 0], text: true, wrap: 19 }),
    tv: Flat('r-tv', { size: [520, 473.6], b: [-378, 433], r: 0.55, a: [0.5, 1] })
  };
  var TVS = [424.5 / 1200, 647 / 1093];      // centre of the glass within the television's picture
  var GLASS = [124.5 / 1200, 372 / 1093, 600 / 1200, 550.5 / 1093];   // the glass, squared up, within that picture
  var rHome, tHome, M_IN = D_PASS / DELTA, M_S = M_IN + 0.05, M_T = M_IN + 0.08;
  function rLook(kind) {
    if (kind === 'start') return portrait ? [330, 60] : [110, 10];
    return portrait ? [-330, 120] : [110, 10];
  }
  function camC(m, L) { return { m: m, C: [L[0], L[1]], o: [0, 0] }; }     // the camera stands at L and looks straight ahead
  function wordPx() { return clamp(W * (portrait ? 0.15 : 0.115), 52, 190); }
  function sayPx() { return clamp(W * 0.0175, 17, 27); }
  var leftEdge = 0;
  function layoutRoom() {
    R.S0 = Math.max(W / 2752, H / 1536) * 1.2;
    ['back', 'backTv', 'plate', 'plateTv', 'vase', 'table', 'cush'].forEach(function (k) { sizeImg(R[k]); });
    sizeBox(R.lamp, R.S0 * 0.6);
    rHome = camC(M_S, rLook('start')); tHome = camC(M_T, rLook('tv'));
    var wp = wordPx(), sp = sayPx();
    sizeText(R.wStart, wp, rHome, R.S0); sizeText(R.sStart, sp, rHome, R.S0);
    R.wStart.b = bAt(leftEdge, portrait ? H * 0.12 : H * 0.11, R.wStart.r, rHome, R.S0);
    R.sStart.b = bAt(leftEdge + wp * 0.07, (portrait ? H * 0.12 : H * 0.11) + wp * 1.0, R.sStart.r, rHome, R.S0);
    // television chapter: the set stands on the mats; the word stands between it and the wall
    var tvw = portrait ? W * 0.62 : clamp(W * 0.27, 250, 560);
    var zt = R.tv.r / (R.tv.r - tHome.m);
    R.tv.size = [tvw / (R.S0 * zt), tvw / (R.S0 * zt) * 1093 / 1200];
    R.tv.b = portrait ? bAt(W * 0.5, H * 0.86, R.tv.r, tHome, R.S0) : bAt(leftEdge + tvw * 0.56, H * 0.955, R.tv.r, tHome, R.S0);
    R.tv.lw = 1200; R.tv.el.style.width = '1200px'; R.tv.el.style.height = '1093px';
    sizeText(R.wTv, wp, tHome, R.S0); sizeText(R.sTv, sp, tHome, R.S0);
    var wx = portrait ? leftEdge : leftEdge + tvw * 0.42, wy = portrait ? H * 0.11 : H * 0.085;
    R.wTv.b = bAt(wx, wy, R.wTv.r, tHome, R.S0);
    var wh = R.wTv.size[1] * R.S0 * (R.wTv.r / (R.wTv.r - tHome.m));
    R.sTv.b = portrait ? bAt(wx + 4, wy + wh + 10, R.sTv.r, tHome, R.S0) : bAt(wx + wp * 0.08, wy + wh + sp * 0.75, R.sTv.r, tHome, R.S0);
  }
  var rTvPic = $('r-tv-pic'), rTvCold = $('r-tv-cold'), rTvGlow = $('r-tv-glow'), boxTr = '', boxClip = '';
  var wipe = $('r-wipe'), wipeTr = '';
  // gcam: the garden camera while the walk is still on (the room is seen through the doorway), else null
  // v: viewports scrolled since the room was entered; w: viewports relative to the television chapter's start
  function drawRoom(gcam, v, w, t) {
    var S0 = R.S0;
    var change = ss(-1.35, -0.25, w);                 // the flats change between the two chapters
    var push = ss(0.55, 1.85, w);                     // the camera goes into the television
    var Ls = rLook('start'), Lt = rLook('tv'), ce = io(change);
    var cam;
    if (gcam) {
      cam = camC((D_PASS - (1 - gcam.m)) / DELTA, Ls);
      cam.o = [gcam.o[0] * G.S0 / S0, gcam.o[1] * G.S0 / S0];
    } else {
      var mS = lerp(M_IN, M_S, io(ss(0, 0.8, v))) + 0.03 * ss(0.8, 3.2, v);
      cam = camC(lerp(mS, M_T, change), [lerp(Ls[0], Lt[0], ce), lerp(Ls[1], Lt[1], ce)]);
    }
    var zT = R.tv.r / (R.tv.r - M_T);
    if (push > 0) {
      // straight at the glass, at an even pace for the eye, until the glass is the frame
      var endW = portrait ? BOX.w / GLASS[2] : W * 1.04 / GLASS[2];
      var zEnd = endW / (R.tv.size[0] * S0), z = zT * Math.pow(zEnd / zT, io(push));
      cam = camC(R.tv.r - R.tv.r / z, Lt);
      var gb = [R.tv.b[0] + (TVS[0] - 0.5) * R.tv.size[0], R.tv.b[1] + (TVS[1] - 1) * R.tv.size[1]];
      var g0 = proj(gb, R.tv.r, tHome), g1 = proj(gb, R.tv.r, cam), k = io(ss(0, 0.7, push));
      var want = [lerp(g0.x, (BOX.x + BOX.w / 2 - W / 2) / S0, k), lerp(g0.y, (BOX.y + BOX.h / 2 - H / 2) / S0, k)];
      cam.o = [g1.x - want[0], g1.y - want[1]];
    }
    var slide = function (a, b) { return io(ss(a, b, change)); };
    // the old flats leave, nearest first; then the dark comes across the room like a sliding screen
    var sp = slide(0.45, 1.0), wx = sp >= 0.9995 ? 0 : Math.round((1 - sp) * (W + 40));
    var wtr = sp <= 0.0005 ? 'translate3d(' + (W + 60) + 'px,0,0)' : 'translate3d(' + wx + 'px,0,0)';
    if (wtr !== wipeTr) { wipe.style.transform = wtr; wipeTr = wtr; }
    place(R.backTv, cam, S0, -wx, 0, push > 0 ? 1 : 0);
    place(R.plateTv, cam, S0, -wx, 0, sp > 0.0005 ? 1 : 0);
    place(R.back, cam, S0, 0, 0, gcam ? 1 : 0);
    place(R.plate, cam, S0, 0, 0, sp >= 0.9995 ? 0 : 1);
    var breathe = 0.9 + 0.06 * Math.sin(t * 1.26) + 0.025 * Math.sin(t * 3.1);
    place(R.lamp, cam, S0, 0, 0, sp >= 0.9995 ? 0 : breathe);
    // the word has the wall to itself; it leaves for the wing as the coin and the bubble come up the frame
    var vw = RM ? 0 : v;                             // at rest (reduced motion) the word keeps its wall
    var wl = Math.max(slide(0.3, 0.85), io(ss(0.56, 0.95, vw)));
    place(R.wStart, cam, S0, 0, 0, 1, -wl);
    place(R.sStart, cam, S0, 0, 0, 1, -Math.max(slide(0.34, 0.9), io(ss(0.52, 0.9, vw))));
    place(R.vase, cam, S0, 0, 0, 1, -slide(0.32, 0.9));
    place(R.table, cam, S0, 0, 0, 1, -slide(0.12, 0.62));
    place(R.cush, cam, S0, 0, 0, 1, slide(0.0, 0.45));
    // new flats arrive, farthest first
    var wordOut = ss(0.1, 0.6, push);
    place(R.wTv, cam, S0, 0, -wordOut * H * 0.3, 1 - ss(0.25, 0.6, push), 1 - slide(0.6, 1.0));
    place(R.sTv, cam, S0, 0, -wordOut * H * 0.2, 1 - ss(0.12, 0.4, push), 1 - slide(0.7, 1.0));
    var tv = change > 0.4 ? place(R.tv, cam, S0, 0, 0, 1, 1 - slide(0.5, 0.98)) : (hide(R.tv), null);
    if (tv) {
      var fl = flick(t, 2);
      rTvPic.style.opacity = fl * (1 - ss(0.06, 0.4, push));
      rTvCold.style.opacity = ss(0.04, 0.3, push) * (1 - ss(0.38, 0.8, push)) * 0.85;
      rTvGlow.style.opacity = (0.5 + 0.5 * fl) * slide(0.7, 1) * (1 - ss(0.5, 0.9, push));
      // what is inside the set stands behind the glass, and grows with it
      var S = { x: tv.x + tv.w * GLASS[0], y: tv.y + tv.h * GLASS[1], w: tv.w * GLASS[2], h: tv.h * GLASS[3] };
      var kb = Math.min(1, Math.max(S.w / BOX.w, S.h / BOX.h));
      var tx = S.x + S.w / 2 - BOX.w * kb / 2 - BOX.x, ty = S.y + S.h / 2 - BOX.h * kb / 2 - BOX.y;
      var l0 = (S.x - BOX.x - tx) / kb, t0 = (S.y - BOX.y - ty) / kb, r0 = BOX.w - (S.x + S.w - BOX.x - tx) / kb, b0 = BOX.h - (S.y + S.h - BOX.y - ty) / kb;
      var btr = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + kb.toFixed(5) + ')';
      var clip = (l0 <= 0 && t0 <= 0 && r0 <= 0 && b0 <= 0) ? 'none' : 'inset(' + Math.max(0, t0).toFixed(1) + 'px ' + Math.max(0, r0).toFixed(1) + 'px ' + Math.max(0, b0).toFixed(1) + 'px ' + Math.max(0, l0).toFixed(1) + 'px round ' + (S.w * 0.085 / kb).toFixed(1) + 'px)';
      if (btr !== boxTr) { boxEl.style.transform = btr; boxTr = btr; }
      if (clip !== boxClip) { boxEl.style.clipPath = clip; boxClip = clip; }
    }
    if (gcam || sp < 0.72) {
      var lp = proj(R.lamp.b, 1, cam); light.x = W / 2 + lp.x * S0; light.y = H / 2 + lp.y * S0; light.k = (W / 2 + lp.x * S0 < wx || sp < 0.001 ? 1 : 0) * (gcam ? 0 : 1); light.cold = false;
    } else if (tv) {
      light.x = tv.x + tv.w * TVS[0]; light.y = tv.y + tv.h * TVS[1]; light.k = slide(0.7, 1) * 0.8; light.cold = true;
    }
    return push;
  }
  function boxFree() {
    if (boxTr !== 'none') { boxEl.style.transform = 'none'; boxTr = 'none'; }
    if (boxClip !== 'none') { boxEl.style.clipPath = 'none'; boxClip = 'none'; }
  }

  // inside the television -----------------------------------------------------
  var boxEl = $('box'), dot = $('dot'), dotTr = '', sets = [], lvls = [], BOX = { x: 0, y: 0, w: 1, h: 1 };
  var DRO = { s: 0.13, f: [0.2264, 0.7389], asp: 1500 / 1376 };
  function layoutBox() {
    if (portrait) { BOX.w = W; BOX.h = Math.round(W / DRO.asp); BOX.x = 0; BOX.y = Math.round(Math.max(58, H * 0.085)); }
    else { BOX.x = 0; BOX.y = 0; BOX.w = W; BOX.h = H; }
    boxEl.style.left = BOX.x + 'px'; boxEl.style.top = BOX.y + 'px'; boxEl.style.width = BOX.w + 'px'; boxEl.style.height = BOX.h + 'px';
    boxEl.style.borderRadius = portrait ? '26px / 22px' : '0';
    sets = [1, 2, 3, 4, 5].map(function (i) {
      var el = $('set-e' + i), ins = el.querySelector('.inset'), d = ins.dataset;
      var wv = parseFloat(portrait ? d.pw : d.w) * BOX.w, asp = parseFloat(d.asp);
      ins.style.width = wv + 'px'; ins.style.height = (wv / asp) + 'px';
      ins.style.left = (parseFloat(portrait ? d.px : d.x) * BOX.w) + 'px'; ins.style.top = (parseFloat(portrait ? d.py : d.y) * BOX.h) + 'px';
      return { el: el, back: el.querySelector('.back'), ins: ins, rot: parseFloat(d.rot || 0), zoom: parseFloat(el.dataset.zoom || 1.05), last: '', li: '', vid: ins.tagName === 'VIDEO' ? ins : null };
    });
    // the garden picture covers the box, with the point everything falls into kept where the picture puts it
    var pw = Math.max(BOX.w, BOX.h * DRO.asp), ph = pw / DRO.asp;
    var fx = DRO.f[0] * pw, fy = DRO.f[1] * ph;
    var left = clamp(BOX.w * (portrait ? 0.2264 : 0.2264) - fx, BOX.w - pw, 0);
    var top = clamp(BOX.h * 0.72 - fy, BOX.h - ph, 0);
    DRO.pw = pw; DRO.ph = ph; DRO.left = left; DRO.top = top; DRO.fx = fx; DRO.fy = fy;
    lvls = [0, 1, 2, 3].map(function (j) {
      var el = $('lvl-' + j);
      el.style.width = pw + 'px'; el.style.height = ph + 'px'; el.style.left = left + 'px'; el.style.top = top + 'px';
      el.style.transformOrigin = fx + 'px ' + fy + 'px';
      return { el: el, last: '', vis: true, tv: j < 3 ? { el: $('ltv-' + j), last: '', vis: true } : null };
    });
    dot.style.left = (left + fx) + 'px'; dot.style.top = (top + fy) + 'px';
  }
  function setVis(o, yes) { if (o.vis !== yes) { o.el.style.visibility = yes ? '' : 'hidden'; o.vis = yes; } }
  // e: which episode the centre of the screen is on (0 = the first, fractions are between two); u: how far into the garden
  function drawBox(e, u, t) {
    var bw = BOX.w;
    for (var i = 0; i < 5; i++) {
      var s = sets[i], d = e - i;                         // d: -1 waiting on the right, 0 on screen, 1 gone left
      var off = d <= 0 ? -io(ss(-0.7, -0.3, d)) + 1 : -io(ss(0.3, 0.7, d));
      if (i === 0 && d < 0) off = 0;
      var vis = off > -0.999 && off < 0.999;
      if (s.vis !== vis) { s.el.style.visibility = vis ? '' : 'hidden'; s.vis = vis; }
      if (!vis) { if (s.vid && !s.vid.paused) s.vid.pause(); continue; }
      var tr = 'translate3d(' + (off * bw).toFixed(1) + 'px,0,0)';
      if (tr !== s.last) { s.el.style.transform = tr; s.last = tr; }
      // the nearer flat travels further, and never quite stops drifting
      var drift = FROZEN ? 0 : Math.sin(t * 0.21 + i) * 4;
      var ti = 'translate3d(' + (off * bw * 0.55 + (d * -26) + drift).toFixed(1) + 'px,' + (d * 10).toFixed(1) + 'px,0) rotate(' + s.rot + 'deg)';
      if (ti !== s.li) { s.ins.style.transform = ti; s.li = ti; }
      var tb = 'translate3d(' + (d * 18).toFixed(1) + 'px,0,0) scale(' + s.zoom + ')';
      if (tb !== s.lb) { s.back.style.transform = tb; s.lb = tb; }
      if (s.vid && !FROZEN && s.vid.paused && Math.abs(d) < 0.6) { var pr = s.vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }
    // the garden, and the garden inside it
    var dIn = e - 5;
    var offG = dIn <= 0 ? 1 - io(ss(-0.7, -0.3, dIn)) : 0;
    for (var j = 0; j < 4; j++) {
      var L = lvls[j];
      var sc = Math.pow(DRO.s, j - u);
      var visL = offG < 0.999 && sc < 1 / DRO.s + 0.001 && sc > 0.004 && (j - u) < 2.05;
      setVis(L, visL);
      if (!visL) continue;
      var trl = 'translate3d(' + (offG * bw).toFixed(1) + 'px,0,0) scale(' + sc.toFixed(5) + ')';
      if (trl !== L.last) { L.el.style.transform = trl; L.last = trl; }
    }
    // each garden's television is drawn from the full-size render, so it stays sharp however far in we are
    for (j = 0; j < 3; j++) {
      var Tv = lvls[j].tv, s2 = Math.pow(DRO.s, j - u), on2 = lvls[j].vis;
      setVis(Tv, on2);
      if (!on2) continue;
      var X = DRO.left + DRO.fx + s2 * (0.17 * DRO.pw - DRO.fx) + offG * bw, Y = DRO.top + DRO.fy + s2 * (0.555 * DRO.ph - DRO.fy);
      var trt = 'translate3d(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px,0) scale(' + (s2 * 0.26 * DRO.pw / 1200).toFixed(5) + ')';
      if (trt !== Tv.last) { Tv.el.style.transform = trt; Tv.last = trt; }
    }
  }
  // when the last set goes dark, the tube keeps one point of light for a moment
  function drawDot(zt, alsoA) {
    var k = ss(2.42, 2.6, zt) * (1 - ss(0.1, 0.34, alsoA));
    var tr = k <= 0.001 ? 'scale(0)' : 'scale(' + (0.25 + 0.75 * k * (1 - 0.6 * ss(2.6, 2.9, zt))).toFixed(4) + ')';
    if (tr !== dotTr) { dot.style.transform = tr; dot.style.opacity = k.toFixed(3); dotTr = tr; }
  }

  // garden cinema ----------------------------------------------------------------
  var Cn = {
    S0: 1,
    plate: Flat('c-plate', { size: [2752, 1536], b: [0, 0], r: 1 }),
    proj: Flat('c-proj', { fit: 300, b: [0, 0], r: 0.3, a: [0.5, 1] }),
    nr: Flat('c-near-r', { size: [520, 271], b: [0, 0], r: 0.2 }),
    wNext: Flat('w-next', { r: 0.96, a: [0, 0], text: true }),
    sNext: Flat('s-next', { r: 0.96, a: [0, 0], text: true })
  };
  var CLOTH = [[1453, 404], [2202, 370], [2207, 929], [1445, 877]].map(function (p) { return [p[0] - 1376, p[1] - 768]; });
  var cHome = { m: 0, C: [0, 0], o: [0, 0] };
  function cLook() { return portrait ? [455, -60] : [-225, -24]; }
  function layoutCinema() {
    Cn.S0 = Math.max(W / 2752, H / 1536) * (portrait ? 1.03 : 1.2);
    sizeImg(Cn.plate); sizeImg(Cn.proj); sizeImg(Cn.nr);
    cHome = camC(0.03, cLook());
    var pw = portrait ? W * 0.5 : clamp(W * 0.2, 190, 400), z = Cn.proj.r / (Cn.proj.r - cHome.m);
    var nw = Cn.proj.el.naturalWidth || 618, nh = Cn.proj.el.naturalHeight || 1009;
    Cn.proj.size = [pw / (Cn.S0 * z), pw / (Cn.S0 * z) * nh / nw];
    Cn.proj.b = bAt(portrait ? W * 0.24 : leftEdge + pw * 0.75, H * 1.1, Cn.proj.r, cHome, Cn.S0);
    var zz = Cn.nr.r / (Cn.nr.r - cHome.m), bwp = portrait ? W * 0.6 : W * 0.27;
    Cn.nr.size = [bwp / (Cn.S0 * zz), bwp / (Cn.S0 * zz) * 209 / 401];
    Cn.nr.b = bAt(W * 0.94, H * 0.99, Cn.nr.r, cHome, Cn.S0);
    var wp = wordPx(), sp = sayPx();
    sizeText(Cn.wNext, wp, cHome, Cn.S0); sizeText(Cn.sNext, sp * 0.8, cHome, Cn.S0);
    var wy = portrait ? H * 0.1 : H * 0.1;
    Cn.wNext.b = bAt(leftEdge, wy, Cn.wNext.r, cHome, Cn.S0);
    var wh = Cn.wNext.size[1] * Cn.S0 * (Cn.wNext.r / (Cn.wNext.r - cHome.m));
    Cn.sNext.b = bAt(leftEdge + wp * 0.08, wy + wh + sp * 0.7, Cn.sNext.r, cHome, Cn.S0);
  }
  var beam = null;
  // a: 0..1 as the closing strip crosses. The camera comes to rest on this title shot: from the top of the film
  // chapter on, that chapter's own scene draws the garden and takes the camera to the cloth (chapters/film.js opens
  // on this picture, from the numbers of layoutCinema above; change them there too).
  function drawCinema(a, t) {
    var S0 = Cn.S0, m = 0.03, cam = camC(m, cLook());
    var inP = io(ss(0.06, 0.5, a)), inJ = io(ss(0.36, 0.78, a)), inW = io(ss(0.4, 0.82, a)), inN = io(ss(0.5, 0.9, a));
    var pl = place(Cn.plate, cam, S0, 0, 0, 1, 1 - inP);
    place(Cn.wNext, cam, S0, 0, 0, 1, -(1 - inW));
    place(Cn.sNext, cam, S0, 0, 0, 1, -(1 - inW));
    var pj = place(Cn.proj, cam, S0, 0, 0, 1, -(1 - inJ));
    place(Cn.nr, cam, S0, 0, 0, ss(0.015, 0.08, Cn.nr.r - cam.m), 1 - inN);
    beam = null;
    if (pj && pl && inJ > 0.97) {
      var q = CLOTH.map(function (c) { var p = proj(c, 1, cam); return [W / 2 + p.x * S0, H / 2 + p.y * S0]; });
      beam = { lens: [pj.x + pj.w * 0.948, pj.y + pj.h * 0.467], q: q, k: ss(0.76, 0.9, a) };
      light.x = (q[0][0] + q[2][0]) / 2; light.y = (q[0][1] + q[2][1]) / 2; light.k = 0.85 * inP; light.cold = false;
    } else if (pl) {
      var c0 = proj([450, -120], 1, cam); light.x = W / 2 + c0.x * S0 + (1 - inP) * W * 1.2; light.y = H / 2 + c0.y * S0; light.k = 0.85 * inP; light.cold = false;
    }
    return cam;
  }

  // ------------------------------------------------------------------ petals, fireflies, dust, the beam
  var cv = $('motes'), cx = cv.getContext('2d'), CD = 1;
  var petals = [], flies = [], dust = [];
  (function seed() {
    var r = rnd(20261112);
    for (var i = 0; i < 46; i++) petals.push({ d: 0.1 + r() * 0.95, x: r() * 2 - 1, y: r(), sp: 0.018 + r() * 0.022, sw: 0.5 + r(), ph: r() * 6.283, rot: r() * 6.283, rs: (r() - 0.5) * 1.6, tone: r() });
    for (i = 0; i < 9; i++) flies.push({ x: r() * 2 - 1, y: r(), ph: r() * 6.283, sp: 0.2 + r() * 0.3, d: 0.5 + r() * 0.45 });
    for (i = 0; i < 26; i++) dust.push({ u: r(), v: r() * 2 - 1, ph: r() * 6.283, sp: 0.02 + r() * 0.05 });
  })();
  function layoutCanvas() {
    CD = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1 : 2);
    cv.width = Math.round(W * CD); cv.height = Math.round(H * CD);
  }
  function drawPetals(cam, S0, t, alpha, n) {
    // a field of petals that is always ahead of the camera: each keeps its place in depth until the camera passes it
    var span = 1.05;
    for (var i = 0; i < n; i++) {
      var p = petals[i];
      var dz = ((p.d - cam.m) % span + span) % span; if (dz < 0.035) continue;
      var r = dz + cam.m, z = 1 / dz;
      var fall = (p.y + t * p.sp) % 1;
      var wx = (p.x * 900 + Math.sin(t * p.sw * 0.6 + p.ph) * 38) * (0.4 + dz), wy = (fall * 1300 - 760) * (0.35 + dz * 0.8);
      var sx = W / 2 + ((wx - cam.C[0]) / dz - cam.o[0]) * S0, sy = H / 2 + ((wy - cam.C[1]) / dz - cam.o[1]) * S0;
      var size = 5.2 * z * S0; if (size > 70) continue;
      if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;
      var near = clamp((size - 9) / 40);
      cx.save();
      cx.translate(sx, sy); cx.rotate(p.rot + t * p.rs * 0.5);
      cx.scale(1, 0.62 + 0.3 * Math.sin(t * p.rs + p.ph));
      cx.globalAlpha = alpha * lerp(0.92, 0.3, near) * clamp((dz - 0.035) / 0.05);
      cx.fillStyle = p.tone > 0.5 ? '#f3b3c6' : '#cf8ea8';
      cx.beginPath(); cx.moveTo(-size, 0); cx.quadraticCurveTo(0, -size * 0.85, size, 0); cx.quadraticCurveTo(0, size * 0.55, -size, 0); cx.fill();
      cx.restore();
    }
  }
  function drawFlies(cam, S0, t, alpha) {
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], dz = f.d - cam.m; if (dz < 0.06) continue;
      var wx = (f.x * 700 + Math.sin(t * f.sp + f.ph) * 60) * f.d, wy = (60 + f.y * 260 + Math.cos(t * f.sp * 1.3 + f.ph) * 30) * f.d;
      var sx = W / 2 + ((wx - cam.C[0]) / dz - cam.o[0]) * S0, sy = H / 2 + ((wy - cam.C[1]) / dz - cam.o[1]) * S0;
      var tw = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9 + f.ph * 3), 2), rad = 1.5 * S0 / dz * 0.7;
      var gl = cx.createRadialGradient(sx, sy, 0, sx, sy, rad * 4.2);
      gl.addColorStop(0, 'rgba(255,224,160,0.95)'); gl.addColorStop(0.22, 'rgba(255,216,146,0.5)'); gl.addColorStop(1, 'rgba(255,216,146,0)');
      cx.globalAlpha = alpha * tw; cx.fillStyle = gl;
      cx.beginPath(); cx.arc(sx, sy, rad * 4.2, 0, 6.283); cx.fill();
    }
  }
  function drawBeam(t) {
    if (!beam) return;
    var b = beam, fl = 0.9 + 0.1 * (flick(t, 5) - 0.86) / 0.14, q = b.q, L = b.lens;
    var g = cx.createLinearGradient(L[0], L[1], (q[0][0] + q[3][0]) / 2, (q[0][1] + q[3][1]) / 2);
    g.addColorStop(0, 'rgba(255,244,214,' + (0.34 * b.k * fl) + ')'); g.addColorStop(1, 'rgba(255,244,214,' + (0.07 * b.k * fl) + ')');
    cx.globalAlpha = 1; cx.fillStyle = g;
    cx.beginPath(); cx.moveTo(L[0], L[1]); cx.lineTo(q[0][0], q[0][1]); cx.lineTo(q[1][0], q[1][1]); cx.lineTo(q[2][0], q[2][1]); cx.lineTo(q[3][0], q[3][1]); cx.closePath(); cx.fill();
    // dust turning over in the light
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], u = (d.u + t * d.sp * 0.25) % 1, v = d.v * 0.8 + Math.sin(t * 0.4 + d.ph) * 0.1;
      var top = [lerp(L[0], q[0][0], u), lerp(L[1], q[0][1], u)], bot = [lerp(L[0], q[3][0], u), lerp(L[1], q[3][1], u)];
      var x = lerp(top[0], bot[0], v * 0.5 + 0.5), y = lerp(top[1], bot[1], v * 0.5 + 0.5);
      cx.globalAlpha = b.k * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.ph * 5))) * (1 - u * 0.6);
      cx.fillStyle = '#fff3d2'; cx.beginPath(); cx.arc(x, y, 1.1 + (1 - u) * 1.4, 0, 6.283); cx.fill();
    }
    // the cloth itself breathes with the lamp
    cx.globalAlpha = 0.07 * b.k * fl; cx.fillStyle = '#fff6de';
    cx.beginPath(); cx.moveTo(q[0][0], q[0][1]); cx.lineTo(q[1][0], q[1][1]); cx.lineTo(q[2][0], q[2][1]); cx.lineTo(q[3][0], q[3][1]); cx.closePath(); cx.fill();
  }
  function drawRoomDust(t, alpha) {
    for (var i = 0; i < 14; i++) {
      var d = dust[i];
      var x = light.x + (d.v * 0.5) * W * 0.28 + Math.sin(t * 0.23 + d.ph) * 18, y = light.y - 30 - ((d.u + t * d.sp * 0.12) % 1) * H * 0.34;
      cx.globalAlpha = alpha * 0.5 * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.8 + d.ph * 4)));
      cx.fillStyle = '#ffdca0'; cx.beginPath(); cx.arc(x, y, 1.3, 0, 6.283); cx.fill();
    }
  }
  var canvasDirty = false;

  // ------------------------------------------------------------------ the scene's light
  // Where the lit thing of the scene stands in the frame (the doorway, the lamp, the television, the projector's
  // screen): the room's dust rises round it. The cards take no light from the scene: they are the site's own cards.
  var light = { x: 0, y: 0, k: 0, cold: false };

  // ------------------------------------------------------------------ the page's own furniture
  var slip = $('title-slip'), rail = $('rail'), clock = $('clock'), clockB = clock.querySelector('b');
  var dialDots = Array.prototype.slice.call(clock.querySelectorAll('.dial i')), dialNow = -2;
  var railItems = Array.prototype.slice.call(rail.querySelectorAll('li')), railNow = -2, slipTr = '', railTr = '', clockTr = '', clockTxt = '';
  var coin = null, wins = [], vids = [];
  function measureFurniture() {
    var c = document.querySelector('.coin'), rc = c.getBoundingClientRect();
    coin = { el: c, top: rc.top + window.scrollY, h: rc.height, imgs: c.querySelectorAll('img'), last: '' };
    wins = Array.prototype.map.call(document.querySelectorAll('.win'), function (el) {
      var r2 = el.getBoundingClientRect(), m = el.querySelector('.media');
      return { top: r2.top + window.scrollY, h: r2.height, vid: m && m.tagName === 'VIDEO' ? m : null };
    });
  }
  function drawFurniture(y, heroP, e) {
    // the dial: which of the five films is on. At 20:00 it is on none of them.
    var ch = (e > -0.7 && e < 4.5) ? Math.max(0, Math.round(e)) : -1;
    if (ch !== dialNow) { dialDots.forEach(function (d, i) { d.classList.toggle('on', i === ch); }); dialNow = ch; }
    // the title slip leaves to the right wing; the rail comes on from the left
    var out = RM ? 0 : io(ss(0.045, 0.2, heroP));
    var tr = narrow ? 'translate3d(0,' + (out * (H * 1.7)).toFixed(1) + 'px,0)' : 'translate3d(' + (out * (W * 0.42 + 60)).toFixed(1) + 'px,-50%,0)';
    // (on a narrow screen it leaves downward, and would come to rest in the next chapter: gone from the frame, it is hidden)
    if (tr !== slipTr) { slip.style.transform = tr; slip.style.visibility = narrow && out > 0.999 ? 'hidden' : ''; slipTr = tr; }
    var rin = (narrow || RM) ? (y >= T.startHead.top - 2 ? 1 : 0) : io(ss(0.12, 0.3, heroP));
    var rt = narrow ? 'translate3d(' + ((rin - 1) * 260).toFixed(1) + 'px,0,0)' : 'translate3d(' + ((rin - 1) * 220).toFixed(1) + 'px,-50%,0)';
    if (rt !== railTr) { rail.style.transform = rt; railTr = rt; }
    var mid = y + H * 0.5, now = -1;
    if (mid >= T.next.top - H * 0.6) now = 2; else if (mid >= T.tvHead.top - H * 0.9) now = 1; else if (mid >= T.startHead.top) now = 0;
    if (now !== railNow) { railItems.forEach(function (li, i) { li.classList.toggle('now', i === now); }); railNow = now; }
    // the clock: 19:40 when the chapter opens, a minute at a time, 20:00 when the fifth film ends
    var a = T.tvHead.top - H * 0.5, b = T.tvTurn.top - H * 0.5, q = clamp((y - a) / (b - a));
    var mins = Math.floor(q * 20 + 0.0001), txt = mins >= 20 ? '20:00' : '19:' + (40 + mins);
    if (txt !== clockTxt) { clockB.textContent = txt; clock.classList.toggle('at20', mins >= 20); clockTxt = txt; }
    var cin = io(ss(T.tvHead.top - H * 0.9, T.tvHead.top - H * 0.4, y)) * (1 - io(ss(T.also.top - H * 0.9, T.also.top - H * 0.5, y)));
    if (RM) cin = cin > 0.5 ? 1 : 0;
    var ct = 'translate3d(0,' + ((cin - 1) * 130).toFixed(1) + 'px,0)';
    if (ct !== clockTr) { clock.style.transform = ct; clockTr = ct; }
    // the portrait comes up out of its coin as the coin comes up the frame
    if (coin) {
      var cy = coin.top + coin.h / 2 - y;
      if (cy > -coin.h && cy < H + coin.h) {
        var pop = RM ? 1 : io(ss(H * 0.98, H * 0.52, cy));
        var ctr = 'translate3d(0,' + lerp(13, -15, pop).toFixed(2) + '%,0) scale(' + lerp(0.84, 1.04, pop).toFixed(4) + ')';
        if (ctr !== coin.last) { for (var i = 0; i < coin.imgs.length; i++) coin.imgs[i].style.transform = ctr; coin.last = ctr; }
      }
    }
    // a card's clip plays while its picture is in the frame
    for (var j = 0; j < wins.length; j++) {
      var wv = wins[j], top = wv.top - y, vis = top < H && top + wv.h > 0;
      if (!wv.vid) continue;
      if (vis && !FROZEN) { if (wv.vid.paused) { var pr = wv.vid.play(); if (pr && pr.catch) pr.catch(function () {}); } }
      else if (!wv.vid.paused) wv.vid.pause();
    }
  }

  // ------------------------------------------------------------------ layout and the frame
  function track(name, el) { var rc = el.getBoundingClientRect(); T[name] = { top: rc.top + window.scrollY, h: rc.height }; }
  function layout() {
    W = document.documentElement.clientWidth; H = window.innerHeight; portrait = W / H < 0.9; narrow = W <= 820;
    var cs = getComputedStyle(document.documentElement);
    leftEdge = narrow ? 16 : parseFloat(cs.getPropertyValue('--rail-w')) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    Array.prototype.forEach.call(document.querySelectorAll('[data-track]'), function (el) { track(el.dataset.track, el); });
    T.eps = Array.prototype.map.call(document.querySelectorAll('.ep'), function (el) { var rc = el.getBoundingClientRect(); return rc.top + window.scrollY + rc.height / 2; });
    docH = Math.max(1, document.documentElement.scrollHeight - H);
    layoutGarden(); layoutRoom(); layoutBox(); layoutCinema(); layoutCanvas();
    measureFurniture();
    [G, R, Cn].forEach(function (S) { for (var k in S) if (S[k] && S[k].el) { S[k].last = ''; S[k].lo = -1; } });
    boxTr = ''; boxClip = '';
  }

  var yS = 0, lastNow = 0, started = false;
  function frame(now) {
    var t = FROZEN ? T_HELD : now / 1000;
    var yT = window.scrollY, dt = Math.min(0.1, (now - lastNow) / 1000); lastNow = now;
    // the camera glides: it follows the scroll a breath behind. Held frames follow it exactly.
    if (FROZEN || !started) yS = yT; else { yS += (yT - yS) * (1 - Math.exp(-dt * 11)); if (Math.abs(yT - yS) < 0.3) yS = yT; }
    started = true;
    var y = yS;
    var heroP = clamp((y - T.hero.top) / T.hero.h);
    var v = (y - T.startHead.top) / H, w = (y - T.tvHead.top) / H;
    var e = (y + H / 2 - T.eps[0]) / (T.eps[1] - T.eps[0]);
    var zt = (y - T.tvTurn.top) / H, alsoA = (y + H - T.also.top) / (T.also.h + H), n = (y - T.next.top) / H;
    if (RM) {                                   // nothing glides: each scene rests at a key pose and scenes change by a cut
      heroP = heroP < 0.93 ? 0 : 1; v = v < 0 ? v : Math.max(v, 3.2); w = w < -0.8 ? -2 : (w < 1.72 ? 0.3 : Math.max(w, 2));
      e = Math.round(clamp(e, 0, 5)); alsoA = alsoA < 0.3 ? 0 : 1; n = n < 0 ? 0 : 0.2;
    }
    cx.setTransform(CD, 0, 0, CD, 0, 0);
    if (canvasDirty) { cx.clearRect(0, 0, W, H); canvasDirty = false; }

    var gcam = heroP < 1 ? gCam(heroP) : null;
    var pushing = w > 0.55, inside = w >= 1.85;
    var inGarden = !!gcam;
    var inRoom = gcam ? gcam.m > 0.33 : (portrait ? alsoA < 0.56 : !inside);
    var inBox = pushing && alsoA < 0.52;
    // past look B's part the chapters draw (chapters.js): they are given the camera's place on the page, and say
    // when a chapter's own picture covers this stage
    var covered = window.TEA ? window.TEA.frame(y, t) : false;
    var inCinema = alsoA > 0.04 && !covered;
    sceneOn('sky', inGarden); sceneOn('garden', inGarden); sceneOn('room', inRoom); sceneOn('front', inRoom && !gcam);
    sceneOn('box', inBox); sceneOn('cinema', inCinema);
    light.k = 0;
    if (inCinema) {
      var cc = drawCinema(clamp(alsoA), t);
      drawBeam(t); drawPetals(cc, Cn.S0, t, io(ss(0.45, 0.9, alsoA)) * 0.9, 16); canvasDirty = true;
    }
    if (inBox) {
      var u = 3 * io(ss(0.16, 2.6, zt)); if (RM) u = Math.round(u);
      drawBox(e, u, t); drawDot(zt, alsoA);
      if (inside && !portrait) boxFree();
      if (inside && !inCinema) { light.x = BOX.x + BOX.w * 0.6; light.y = BOX.y + BOX.h * 0.5; light.k = 0.55 * (1 - ss(2.1, 2.6, zt)); light.cold = e < 4.5; }
    }
    if (inRoom) {
      drawRoom(gcam, v, Math.min(w, 1.85), t);
      if (!gcam && w < -0.3) { drawRoomDust(t, 0.8 * (1 - ss(-1.3, -0.6, w))); canvasDirty = true; }
    }
    if (inGarden) {
      drawSky(gcam, t); drawGarden(gcam, t);
      var ga = 1 - ss(0.8, 0.9, heroP);
      if (ga > 0) { drawPetals(gcam, G.S0, t, ga, portrait ? 26 : 46); drawFlies(gcam, G.S0, t, ga * (1 - ss(0.3, 0.6, heroP))); canvasDirty = true; }
    }
    drawFurniture(y, heroP, e);
    if (!FROZEN) requestAnimationFrame(frame);
  }
  function render() { frame(performance.now()); }

  function ready() {
    layout();
    var yq = parseFloat(qs.get('y'));
    if (!isNaN(yq)) window.scrollTo(0, Math.round(clamp(yq) * docH));
    if (window.TEA) window.TEA.start();          // the chapters after look B's part measure themselves (?c=film&q=0.4 opens one at a frame)
    render();
    if (FROZEN) {
      window.addEventListener('scroll', render, { passive: true });
      document.documentElement.classList.add('held');
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () { window.__ready = true; document.documentElement.classList.add('ready'); }); });
  }
  var rz = 0;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (FROZEN) render(); }, 80); });
  if ('scrollRestoration' in history && qs.has('y')) history.scrollRestoration = 'manual';

  function whenLoaded() {
    var imgs = Array.prototype.slice.call(document.images);
    var waits = imgs.map(function (im) {
      if (im.complete && im.naturalWidth) return im.decode ? im.decode().catch(function () {}) : Promise.resolve();
      return new Promise(function (res) { im.addEventListener('load', res, { once: true }); im.addEventListener('error', res, { once: true }); });
    });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all(waits.concat([fonts])).then(function () {
      var need = ['700 40px "Zen Maru Gothic"', '600 12px Karla', '400 12px Karla', '500 12px "JetBrains Mono"'];
      return document.fonts && document.fonts.load ? Promise.all(need.map(function (f) { return document.fonts.load(f).catch(function () {}); })) : null;
    }).then(ready, ready);
  }
  if (document.readyState === 'complete') whenLoaded(); else window.addEventListener('load', whenLoaded);
})();
