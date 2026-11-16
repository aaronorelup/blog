/* LOOK B'S OPENING MOVE, AGAIN: the tea house at night from the lawn, and the camera's walk up the stepping stones
   and in through the doorway. This is look B's own garden (diorama.js: its flats G, gCam, layoutGarden, drawSky,
   drawGarden, the petals and the fireflies), copied number for number so that the 3D chapter can make the same move
   on its own layer: look B's stage is never driven from here. Change a number there, change it here.
   The pictures are look B's own (assets/img/garden-*.webp), already in the reader's cache from the top of the page.
   roomCam(gcam) is look B's room camera while the walk is on (drawRoom's gcam branch): the room seen through the
   doorway. The toy box chapter turns it into the part of the room's painting its 3D camera shows. */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var rnd = function (seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// (look B's numbers: the doorway, the room's depth behind it, where the door fills the frame, the room's looks)
export var DOOR = [8, -44], DELTA = 0.5, D_PASS = 0.07, M_IN = D_PASS / DELTA;
export function rLook(portrait) { return portrait ? [330, 60] : [110, 10]; }
export function roomS0(W, H) { return Math.max(W / 2752, H / 1536) * 1.2; }

export function makeGarden(skyEl, el, IMG) {
  // (two layers, as look B's stage has them: the sky under the room, the house and the lawn over it: the doorway is
  // a hole in the house, and the room is seen through it)
  skyEl.innerHTML =
    '<img class="flat" data-k="sky" src="' + IMG + 'garden-sky.webp" alt="">' +
    '<img class="flat" data-k="clouds" src="' + IMG + 'garden-clouds.webp" alt="">';
  el.innerHTML =
    '<img class="flat" data-k="veil" src="' + IMG + 'garden-veil.webp" alt="">' +
    '<img class="flat" data-k="ground" src="' + IMG + 'garden-ground.webp" alt="">' +
    '<img class="flat" data-k="hi" src="' + IMG + 'garden-doorhi.webp" alt="">' +
    '<div class="flat glow tb-doorglow" data-k="glow"></div>' +
    '<img class="flat" data-k="mid" src="' + IMG + 'garden-mid.webp" alt="">' +
    '<img class="flat" data-k="bush" src="' + IMG + 'garden-bush.webp" alt="">' +
    '<div class="flat tvset" data-k="tv"><div class="tvshade"></div><div class="tvglow"></div><img class="tb-tvpic" src="' + IMG + 'tv-moon.webp" alt=""><img src="' + IMG + 'tv-body.webp" alt=""></div>' +
    '<img class="flat" data-k="nr" src="' + IMG + 'near-bush-r.webp" alt="">' +
    '<img class="flat" data-k="nl" src="' + IMG + 'near-bush-l.webp" alt="">' +
    '<canvas class="tb-motes"></canvas>';
  var $ = function (k) { return el.querySelector('[data-k=' + k + ']') || skyEl.querySelector('[data-k=' + k + ']'); };
  function Flat(k, o) { var f = { el: $(k), b: [0, 0], size: [100, 100], r: 1, a: [0.5, 0.5], lw: 100, last: '', lo: -1, shown: true }; for (var key in o) f[key] = o[key]; return f; }
  var G = {
    S0: 1,
    sky: Flat('sky', { size: [2816, 1584], b: [0, 6], r: 4.049 }),
    clouds: Flat('clouds', { size: [2816, 509], b: [0, -509.5], r: 2.2195 }),
    veil: Flat('veil', { size: [115.25, 122], b: [1356.75 + 57.625 - 1408, 672.25 + 61 - 786], r: 1.0004 }),
    ground: Flat('ground', { size: [2816, 1297], b: [0, 149.5], r: 1 }),
    hi: Flat('hi', { size: [704, 396], b: [8, -44], r: 0.9999 }),
    glow: Flat('glow', { size: [560, 560], b: [8, -30], r: 0.996 }),
    mid: Flat('mid', { size: [787 * 1.335, 989 * 1.335], b: [0, 0], r: 0.7561 }),
    bush: Flat('bush', { size: [448 * 1.335, 170 * 1.335], b: [0, 0], r: 0.7561 }),
    tv: Flat('tv', { size: [263, 239.5], b: [-443, 347], r: 0.2866 }),
    nr: Flat('nr', { size: [520, 271], b: [0, 0], r: 0.17 }),
    nl: Flat('nl', { size: [420, 196], b: [0, 0], r: 0.15 })
  };
  var tvPic = el.querySelector('.tb-tvpic'), tvGlow = el.querySelector('.tvglow');
  var cv = el.querySelector('.tb-motes'), cx = cv.getContext('2d'), CD = 1;
  var W = 1, H = 1, portrait = false, gCam0 = null;

  function hide(f) { if (f.shown) { f.el.style.visibility = 'hidden'; f.shown = false; } }
  function show(f) { if (!f.shown) { f.el.style.visibility = ''; f.shown = true; } }
  function setOp(f, o) { o = Math.round(o * 1000) / 1000; if (o !== f.lo) { f.el.style.opacity = o; f.lo = o; } }
  function setTr(f, tr) { if (tr !== f.last) { f.el.style.transform = tr; f.last = tr; } }
  function proj(b, r, cam) { var dz = r - cam.m; return { x: (b[0] * r - cam.C[0]) / dz - cam.o[0], y: (b[1] * r - cam.C[1]) / dz - cam.o[1], z: r / dz, dz: dz }; }
  function place(f, cam, S0, dx, dy, op) {
    op = op === undefined ? 1 : op;
    var p = proj(f.b, f.r, cam);
    if (p.dz <= 0.016 || op <= 0.002) { hide(f); return null; }
    var w = f.size[0] * S0 * p.z, h = f.size[1] * S0 * p.z;
    var x = W / 2 + p.x * S0 - w * f.a[0] + (dx || 0), y = H / 2 + p.y * S0 - h * f.a[1] + (dy || 0);
    var out = { x: x, y: y, w: w, h: h, z: p.z };
    if (x > W + 30 || y > H + 30 || x + w < -30 || y + h < -30) { hide(f); return out; }
    show(f);
    setTr(f, 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / f.lw).toFixed(5) + ')');
    setOp(f, op);
    return out;
  }
  function bAt(sx, sy, r, cam, S0) { var dz = r - cam.m; return [(((sx - W / 2) / S0 + cam.o[0]) * dz + cam.C[0]) / r, (((sy - H / 2) / S0 + cam.o[1]) * dz + cam.C[1]) / r]; }
  function sizeImg(f) { var nw = f.el.naturalWidth || 100, nh = f.el.naturalHeight || 100; f.lw = nw; f.el.style.width = nw + 'px'; f.el.style.height = nh + 'px'; }
  function sizeBox(f, k) { f.lw = Math.max(8, f.size[0] * k); f.el.style.width = f.lw + 'px'; f.el.style.height = (f.lw * f.size[1] / f.size[0]) + 'px'; }

  function gCam(p) {
    var m0 = portrait ? -0.9 : -0.28, L0 = portrait ? [0, 185] : [175, -24];
    var t = clamp((p - 0.05) / 0.88), e = lerp(t, t * t * (3 - 2 * t), 0.35), k = io(ss(0.05, 0.6, p));
    var d = (1 - m0) * Math.exp(-3.15 * e) * (1 - ss(0.9, 1, p));
    var m = 1 - d;
    return { m: m, C: [DOOR[0] * k, DOOR[1] * k], o: [L0[0] / (1 - m0) * (1 - k), L0[1] / (1 - m0) * (1 - k)] };
  }
  function layout(w, h) {
    W = w; H = h; portrait = W / H < 0.9;
    G.S0 = Math.max(W / 1700, H / 1019);
    gCam0 = gCam(0);
    ['sky', 'clouds', 'ground', 'hi', 'veil', 'mid', 'bush', 'nr', 'nl'].forEach(function (k) { sizeImg(G[k]); });
    var mx = -139 - 2403 / 2, my = -23 - 1602 / 2, ms = 2403 / 1800;
    G.mid.b = [mx + (0 + 787 / 2) * ms, my + (94 + 989 / 2) * ms];
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
    CD = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1 : 2);
    cv.width = Math.round(W * CD); cv.height = Math.round(H * CD);
    for (var k in G) if (G[k] && G[k].el) { G[k].last = ''; G[k].lo = -1; }
  }
  function flick(t, seed) { var k = Math.floor(t * 8) + seed * 131; var x = Math.sin(k * 12.9898) * 43758.5453; x = x - Math.floor(x); return 0.86 + 0.14 * x; }

  // the petals and the fireflies (look B's, the same seed)
  var petals = [], flies = [];
  (function seed() {
    var r = rnd(20261112);
    for (var i = 0; i < 46; i++) petals.push({ d: 0.1 + r() * 0.95, x: r() * 2 - 1, y: r(), sp: 0.018 + r() * 0.022, sw: 0.5 + r(), ph: r() * 6.283, rot: r() * 6.283, rs: (r() - 0.5) * 1.6, tone: r() });
    for (i = 0; i < 9; i++) flies.push({ x: r() * 2 - 1, y: r(), ph: r() * 6.283, sp: 0.2 + r() * 0.3, d: 0.5 + r() * 0.45 });
  })();
  function drawPetals(cam, S0, t, alpha, n) {
    var span = 1.05;
    for (var i = 0; i < n; i++) {
      var p = petals[i];
      var dz = ((p.d - cam.m) % span + span) % span; if (dz < 0.035) continue;
      var z = 1 / dz, fall = (p.y + t * p.sp) % 1;
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

  // p: look B's hero progress (0 the lawn, 1 through the doorway). Returns the garden camera, or null once through.
  function draw(p, t) {
    cx.setTransform(CD, 0, 0, CD, 0, 0); cx.clearRect(0, 0, W, H);
    if (p >= 1) { for (var k in G) if (G[k] && G[k].el) hide(G[k]); return null; }
    var cam = gCam(p), S0 = G.S0, zh = 1 / (1 - cam.m);
    var seen = zh < 5.2 ? 1 : 0;
    place(G.sky, cam, S0, 0, 0, seen);
    place(G.clouds, cam, S0, -(40 + 120 * Math.sin(t * 0.018)) * S0, 0, seen);
    place(G.veil, cam, S0, 0, 0, 1 - ss(1.5, 6.5, zh));
    place(G.ground, cam, S0, 0, 0, zh > 2.7 ? 0 : 1);
    place(G.hi, cam, S0, 0, 0, ss(1.25, 1.7, zh));
    var breathe = 0.9 + 0.06 * Math.sin(t * 1.26) + 0.02 * Math.sin(t * 2.9);
    place(G.glow, cam, S0, 0, 0, breathe * (1 - ss(2.5, 7, zh)));
    place(G.mid, cam, S0, 0, 0, ss(0.02, 0.14, G.mid.r - cam.m));
    place(G.bush, cam, S0, 0, 0, ss(0.02, 0.14, G.bush.r - cam.m));
    var tv = place(G.tv, cam, S0, 0, 0, 1);
    if (tv) { var fl = flick(t, 1); tvPic.style.opacity = fl; tvGlow.style.opacity = 0.55 + 0.45 * fl; }
    place(G.nr, cam, S0, 0, 0, ss(0.015, 0.08, G.nr.r - cam.m));
    place(G.nl, cam, S0, 0, 0, ss(0.015, 0.08, G.nl.r - cam.m));
    var ga = 1 - ss(0.8, 0.9, p);
    if (ga > 0) { drawPetals(cam, S0, t, ga, portrait ? 26 : 46); drawFlies(cam, S0, t, ga * (1 - ss(0.3, 0.6, p))); }
    return cam;
  }
  // look B's room camera for a garden camera (drawRoom's gcam branch), or the room's first camera once through
  function roomCam(gcam) {
    var L = rLook(portrait), RS = roomS0(W, H);
    if (!gcam) return { m: M_IN, C: [L[0], L[1]], o: [0, 0] };
    return { m: (D_PASS - (1 - gcam.m)) / DELTA, C: [L[0], L[1]], o: [gcam.o[0] * G.S0 / RS, gcam.o[1] * G.S0 / RS] };
  }
  var imgs = Array.prototype.slice.call(skyEl.querySelectorAll('img')).concat(Array.prototype.slice.call(el.querySelectorAll('img')));
  function whole() { return imgs.every(function (im) { return im.complete && im.naturalWidth > 0; }); }
  return { layout: layout, draw: draw, roomCam: roomCam, whole: whole, imgs: imgs };
}
