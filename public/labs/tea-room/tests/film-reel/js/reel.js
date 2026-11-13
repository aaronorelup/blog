/* THE FILM REEL: one chapter of the tea room, as a test. The outdoor cinema of look B's garden, and on its cloth a
   reel of the best moments, playing by itself, muted, one after another, round and round.

   Everything drawn is a function of three things: how far the page is scrolled (the camera), the time (what moves by
   itself), and which moment of the reel is on (the light). ?y=0.4 puts the page at that fraction of its scroll;
   ?still=1 holds the time and shows a moment's first frame (?m=3 picks which), so an address is always one picture.
   ?debug=1 shows the frame rate. */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1';
  var DEBUG = qs.get('debug') === '1';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HELD = STILL || RM;                    // the time stands still; nothing drifts, falls or flickers
  var T_HELD = 12.4;
  var REEL = window.REEL, CLIPS = REEL.clips, N = CLIPS.length;

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var rnd = function (seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  var chapter = $('chapter'), stage = $('stage'), world = $('world'), glow = $('glow'), film = $('film'), poster = $('poster');
  var lightCv = $('light'), airCv = $('air'), shade = $('shade'), dock = $('dock'), hint = $('hint'), dbg = $('debug'), playBtn = $('play');
  var lx = lightCv.getContext('2d'), ax = airCv.getContext('2d'), gx = glow.getContext('2d');
  if (RM) root.classList.add('rm');
  if (STILL) root.classList.add('still');
  if (DEBUG) dbg.hidden = false;

  // ------------------------------------------------------------------ the plate's geometry (in its own pixels)
  var PW = 2752, PH = 1536;
  var CLOTH = [[1447, 398], [2199, 362], [2199, 908], [1447, 872]];   // the cloth's corners: it hangs a little turned, its right edge nearer
  var FOCUS = [1823, 634];                                            // the middle of the cloth: what the camera goes to
  var GLOW = { x: 638, y: 290, w: 1899, h: 1246 };                    // where the lamp's light lies on the plate
  var LAMP = [0.69, 0.50, 0.56];                                      // how much of each colour of that light a white picture throws

  // a flat picture seen in perspective: the 3 x 3 matrix that carries four points to four points
  function homography(src, dst) {
    var A = [], i, j, k;
    for (i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], X = dst[i][0], Y = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X, X]);
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y, Y]);
    }
    for (i = 0; i < 8; i++) {
      var best = i;
      for (j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[best][i])) best = j;
      var tmp = A[i]; A[i] = A[best]; A[best] = tmp;
      for (j = 0; j < 8; j++) {
        if (j === i) continue;
        var f = A[j][i] / A[i][i];
        for (k = i; k < 9; k++) A[j][k] -= f * A[i][k];
      }
    }
    var h = [];
    for (i = 0; i < 8; i++) h.push(A[i][8] / A[i][i]);
    return h;
  }
  function carry(h, x, y) { var w = h[6] * x + h[7] * y + 1; return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w]; }
  var UNIT = [[0, 0], [1, 0], [1, 1], [0, 1]];
  var clothH = homography(UNIT, CLOTH);
  // the picture is thrown onto the middle of the cloth, 16 to 9 where it is widest, a band of bare cloth above and below
  var FILM_UV = [0.045, 0.1225, 0.955, 0.8775];
  var FILMQ = [carry(clothH, FILM_UV[0], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[3]), carry(clothH, FILM_UV[0], FILM_UV[3])];
  (function () {
    var h = homography([[0, 0], [1280, 0], [1280, 720], [0, 720]], FILMQ);
    film.style.transform = 'matrix3d(' + [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1].join(',') + ')';
  })();
  function onFilm(u, v) { return carry(clothH, lerp(FILM_UV[0], FILM_UV[2], u), lerp(FILM_UV[1], FILM_UV[3], v)); }

  // ------------------------------------------------------------------ the camera
  // The plate stands at distance 1. The camera starts at distance 0, high up and a little to one side, and comes down
  // and in to stand before the cloth: m is how far in it has come, C where it stands sideways and in height (in plate
  // pixels from the plate's middle), o which way it looks (how far the whole view is shifted on the screen).
  // A flat nearer than the plate (r < 1) passes faster and drops or climbs with the camera's height, as it would.
  var W = 0, H = 0, tall = false, S0 = 1, cam0, cam1, DPR = 1, RISE = [0, 0];
  function camOf(s, fx, fy) {                      // the plate as large as s, the middle of the cloth at (fx, fy) on the screen
    var tx = fx - FOCUS[0] * s, ty = fy - FOCUS[1] * s;
    return { s: s, tx: tx, ty: ty, m: 1 - S0 / s, C: [(W / 2 - tx) / s - PW / 2, (H / 2 - ty) / s - PH / 2], o: [0, 0] };
  }
  function camAt(e, px, py) {
    // an even pace for the eye: the cloth grows by the same share with every step
    var s = cam0.s * Math.pow(cam1.s / cam0.s, e), m = 1 - S0 / s, g = cam1.m > 0 ? m / cam1.m : 0;
    // what the plate does on the screen: the middle of the cloth travels from where it is far to where it is close
    var c = camOf(s, lerp(cam0.fx, cam1.fx, g), lerp(cam0.fy, cam1.fy, g));
    // where the camera itself stands: it ends on the cloth's own line, and starts off it by RISE
    var k = 1 - io(g);
    var Cb = [cam1.C[0] + RISE[0] * k, cam1.C[1] + RISE[1] * k];
    c.o = [(c.C[0] - Cb[0]) * s / S0, (c.C[1] - Cb[1]) * s / S0];
    // the pointer leans the camera a little: the plate gives a few pixels, whatever is nearer gives more
    c.C = [Cb[0] + px, Cb[1] + py]; c.tx -= px * s; c.ty -= py * s;
    return c;
  }
  function proj(b, r, cam) { var dz = r - cam.m; return { x: W / 2 + ((b[0] * r - cam.C[0]) / dz - cam.o[0]) * S0, y: H / 2 + ((b[1] * r - cam.C[1]) / dz - cam.o[1]) * S0, z: r / dz, dz: dz }; }
  function bAt(sx, sy, r, cam) { var dz = r - cam.m; return [(((sx - W / 2) / S0 + cam.o[0]) * dz + cam.C[0]) / r, (((sy - H / 2) / S0 + cam.o[1]) * dz + cam.C[1]) / r]; }
  function plateXY(p, cam) { return [cam.tx + p[0] * cam.s, cam.ty + p[1] * cam.s]; }

  // a flat: a picture standing at distance r. size is its width and height in plate pixels as seen from the start
  function Flat(id, r, a) { return { el: $(id), r: r, a: a || [0.5, 0.5], b: [0, 0], size: [100, 100], lw: 100, last: '', lo: -1, shown: true }; }
  function fit(f, cam, sx, sy, wpx, asp) {      // stand it so that, from this camera, it is wpx wide with its anchor at (sx, sy)
    var z = f.r / (f.r - cam.m);
    f.size = [wpx / (S0 * z), wpx / (S0 * z) * asp]; f.b = bAt(sx, sy, f.r, cam);
  }
  function place(f, cam, op) {
    var p = proj(f.b, f.r, cam);
    if (p.dz <= 0.012 || op <= 0.003) { if (f.shown) { f.el.style.visibility = 'hidden'; f.shown = false; } return null; }
    var w = f.size[0] * S0 * p.z, h = f.size[1] * S0 * p.z, x = p.x - w * f.a[0], y = p.y - h * f.a[1];
    var out = { x: x, y: y, w: w, h: h };
    if (x > W + 40 || y > H + 40 || x + w < -40 || y + h < -40) { if (f.shown) { f.el.style.visibility = 'hidden'; f.shown = false; } return out; }
    if (!f.shown) { f.el.style.visibility = ''; f.shown = true; }
    var tr = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / f.lw).toFixed(5) + ')';
    if (tr !== f.last) { f.el.style.transform = tr; f.last = tr; }
    op = Math.round(op * 500) / 500;
    if (op !== f.lo) { f.el.style.opacity = op; f.lo = op; }
    return out;
  }
  var F = { lead: Flat('lead', 0.86, [0, 0]), proj: Flat('proj', 0.8, [0.5, 1]), bl: Flat('bush-l', 0.4), br: Flat('bush-r', 0.44) };
  var LENS = [0.948, 0.467];                  // the lens, within the projector's picture

  function layout() {
    W = root.clientWidth; H = stage.clientHeight || window.innerHeight;
    tall = W / H < 0.9; root.classList.toggle('tall', tall);
    var s0, s1, f0, f1;
    if (!tall) {
      // wide: the whole evening. The plate just covers the frame; the cloth stands right of the middle, the lawn before it
      s0 = Math.max(W / PW, H / PH) * 1.04;
      var tx0 = clamp(0.94 * W - 2262 * s0, W - PW * s0, 0), ty0 = clamp(0.52 * H - 800 * s0, H - PH * s0, 0);
      f0 = [tx0 + FOCUS[0] * s0, ty0 + FOCUS[1] * s0];
      // close: the cloth is most of the frame, a band of lawn under it for the film's light to fall on
      s1 = Math.min(0.74 * W / 752, 0.86 * H / 546); f1 = [0.5 * W, 0.43 * H];
    } else {
      // tall: the cloth across the frame, sky above it and the lawn below. Close, the picture runs edge to edge
      s0 = 0.88 * W / 752; f0 = [0.5 * W, 0.585 * H];
      s1 = 0.965 * W / 650; f1 = [0.5 * W, 0.325 * H];
    }
    S0 = s0;
    cam0 = camOf(s0, f0[0], f0[1]); cam1 = camOf(s1, f1[0], f1[1]);
    cam0.fx = f0[0]; cam0.fy = f0[1]; cam1.fx = f1[0]; cam1.fy = f1[1];
    RISE = tall ? [-270, 25] : [900, -600];
    if (DEBUG && qs.has('rise')) RISE = qs.get('rise').split(',').map(Number);
    cam0 = camAt(0, 0, 0); cam0.fx = f0[0]; cam0.fy = f0[1];

    // the projector stands on the lawn between the camera and the cloth. Where it ends up when the camera is close
    // decides where it stands: low in the left corner, seen from behind its shoulder
    var grow = tall ? 1.85 : 3.2;                                       // how many times larger it is close than far
    F.proj.r = cam1.m * grow / (grow - 1);
    var pw = tall ? W * 0.42 : clamp(W * 0.235, 210, 470);
    if (tall) fit(F.proj, cam1, W * 0.2, H * 0.83, pw, 1009 / 618); else fit(F.proj, cam1, W * 0.1, H * 1.19, pw, 1009 / 618);
    F.proj.lw = 618;
    // the near leaves: out of focus in the bottom corners at the start, gone as soon as the camera moves in
    F.bl.r = cam1.m * 0.62; F.br.r = cam1.m * 0.7;
    fit(F.bl, cam0, W * 0.04, H * 0.99, tall ? W * 0.6 : W * 0.25, 250 / 550); F.bl.lw = 550;
    fit(F.br, cam0, W * 0.95, H * 0.985, tall ? W * 0.7 : W * 0.31, 250 / 490); F.br.lw = 490;
    // the chapter's name stands in the air this side of the trees
    var lead = F.lead.el; lead.style.transform = 'none';
    F.lead.lw = Math.max(1, lead.offsetWidth); F.lead.size = [F.lead.lw / S0, lead.offsetHeight / S0];
    F.lead.b = tall ? bAt(W * 0.06, H * 0.075, F.lead.r, cam0) : bAt(Math.max(26, W * 0.05), H * 0.105, F.lead.r, cam0);

    DPR = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1.5 : 2);
    [lightCv, airCv].forEach(function (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); });
    beamCv.width = Math.ceil(W / BS); beamCv.height = Math.ceil(H / BS);
    for (var k in F) { F[k].last = ''; F[k].lo = -1; }
    worldTr = '';
  }

  // ------------------------------------------------------------------ the reel's light
  // Each clip carries its own colour, six times a second, in a 3 x 2 grid: the garden is lit from that, never from the
  // video's pixels, so a held frame has the right light too.
  var tracks = CLIPS.map(function (c) { var s = atob(c.light), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; });
  var cells = new Float32Array(18);            // the six colours now, 0..1
  function sample(i, tm) {
    var a = tracks[i], n = a.length / 18, x = clamp(tm * REEL.fps, 0, n - 1), k0 = Math.floor(x), k1 = Math.min(n - 1, k0 + 1), f = x - k0;
    for (var j = 0; j < 18; j++) cells[j] = lerp(a[k0 * 18 + j], a[k1 * 18 + j], f) / 255;
  }
  var want = [0, 0, 0], kNow = [0, 0, 0], kDone = [-1, -1, -1], lum = 0, lumS = 0, beamCol = [255, 240, 210], cutAt = -100;
  function readLight() {
    var r = 0, g = 0, b = 0, j;
    for (j = 0; j < 6; j++) { var wgt = j < 3 ? 0.8 : 1.2; r += cells[j * 3] * wgt; g += cells[j * 3 + 1] * wgt; b += cells[j * 3 + 2] * wgt; }
    r /= 6; g /= 6; b /= 6;
    var lr = Math.pow(r, 1.5), lg = Math.pow(g, 1.5), lb = Math.pow(b, 1.5), mx = Math.max(lr, lg, lb, 0.02);
    lum = 0.3 * lr + 0.59 * lg + 0.11 * lb;
    var strength = 0.15 + 3.0 * Math.pow(lum, 0.75);
    want[0] = clamp(strength * (0.82 * lr / mx + 0.18) * LAMP[0]);
    want[1] = clamp(strength * (0.82 * lg / mx + 0.18) * LAMP[1]);
    want[2] = clamp(strength * (0.82 * lb / mx + 0.18) * LAMP[2]);
    var m2 = Math.max(r, g, b, 0.05);
    beamCol[0] = Math.round(255 * (0.55 * r / m2 + 0.45)); beamCol[1] = Math.round(255 * (0.55 * g / m2 + 0.42)); beamCol[2] = Math.round(255 * (0.55 * b / m2 + 0.36));
  }

  // the lawn's light: the lamp's own light, kept as a separate picture, is added to the night plate once for each
  // colour, as strong as the film is in that colour. It is painted at half size (light has no sharp edges of its own;
  // the plate under it keeps the lines) and only when the colour has changed.
  var nightImg = $('plate'), glowImg = new Image(), chan = null, glowAt = -1, GS = 0.5;
  glow.width = Math.round(GLOW.w * GS); glow.height = Math.round(GLOW.h * GS);
  glowImg.decoding = 'async'; glowImg.src = 'img/garden-glow.webp';
  function makeChannels() {
    if (chan || !glowImg.complete || !glowImg.naturalWidth) return;
    chan = ['#ff0000', '#00ff00', '#0000ff'].map(function (col) {
      var c = document.createElement('canvas'); c.width = glow.width; c.height = glow.height;
      var x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(glowImg, 0, 0, c.width, c.height);
      x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
      return c;
    });
  }
  function paintGlow(now) {
    if (!chan) { makeChannels(); if (!chan) return; }
    var d = Math.max(Math.abs(kNow[0] - kDone[0]), Math.abs(kNow[1] - kDone[1]), Math.abs(kNow[2] - kDone[2]));
    if (d < 0.008 || (now - glowAt < 55 && kDone[0] >= 0 && !HELD)) return;
    glowAt = now;
    gx.globalCompositeOperation = 'source-over'; gx.globalAlpha = 1; gx.fillStyle = '#000'; gx.fillRect(0, 0, glow.width, glow.height);
    gx.globalCompositeOperation = 'lighter';
    for (var c = 0; c < 3; c++) { if (kNow[c] > 0.004) { gx.globalAlpha = kNow[c]; gx.drawImage(chan[c], 0, 0); } kDone[c] = kNow[c]; }
    gx.globalAlpha = 1;
    if (!glow.classList.contains('on')) glow.classList.add('on');
    stats.glow++;
  }

  // ------------------------------------------------------------------ the reel: two players, the one on the cloth and the next one, ready
  var start = clamp(parseInt(qs.get('m'), 10) || 0, 0, N - 1);
  var P = $('va'), Q = $('vb');                      // P: the clip that is on, or about to be. Q: the other player
  // i: the moment the reel is on. shown, vis: the moment whose picture is on the cloth, and the player showing it
  var reel = { i: start, shown: -1, vis: null, started: false, soundOn: false, inView: true, rmPlaying: false, fails: 0 };
  function clipUrl(i) { return '/media/tea/film/' + CLIPS[i].file + '.mp4'; }
  function posterUrl(i) { return 'img/poster/' + CLIPS[i].file + '.webp'; }
  function load(v, i) { v.dataset.i = String(i); v.muted = !reel.soundOn; v.preload = 'auto'; v.src = clipUrl(i); v.load(); }
  function wantsPlay() { return reel.started && reel.inView && !document.hidden && !STILL && (!RM || reel.rmPlaying); }
  function tryPlay(v) {
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function (err) {
      // a browser that will not play with sound without a fresh press: go on muted, and say so on the switch
      if (err && err.name === 'NotAllowedError' && !v.muted) { setSound(false); v.play().catch(function () {}); }
    });
  }
  function show(v) {                                  // this clip's first frame is on the cloth: now it is the one seen
    if (v !== P || reel.vis === P && reel.shown === reel.i) return;
    P.classList.add('on'); Q.classList.remove('on');
    reel.vis = P; reel.shown = reel.i; reel.fails = 0;
    cutAt = performance.now() / 1000;
    setCard(reel.i);
    load(Q, (reel.i + 1) % N);                         // only now does the next one start to load
  }
  function onPlaying(e) {
    var v = e.target;
    if (v !== P || (reel.vis === P && reel.shown === reel.i)) return;
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(function () { show(v); }); else show(v);
  }
  function advance(to) {
    // the players change places. The one that has just ended keeps its last frame on the cloth until the new one has
    // a frame to show, so a slow connection gives a held picture, never a hole
    var n = to === undefined ? (reel.i + 1) % N : to;
    if (Q.dataset.i !== String(n)) load(Q, n);
    var old = P; P = Q; Q = old; reel.i = n;
    if (!old.paused) old.pause();
    P.muted = !reel.soundOn;
    sync();
  }
  function onEnded(e) { if (e.target === P && reel.vis === P) advance(); }
  function onError(e) {
    var v = e.target;
    if (v !== P || !v.getAttribute('src')) return;
    reel.fails++;
    if (reel.fails <= N) advance();                    // a clip that will not load is passed over; if none will, the poster stays
  }
  [P, Q].forEach(function (v) {
    v.addEventListener('playing', onPlaying); v.addEventListener('ended', onEnded); v.addEventListener('error', onError);
    v.volume = 0.9;
  });
  function startReel() { reel.started = true; sync(); }
  function sync() {                                   // play when the cloth can be seen, pause when it cannot
    if (!reel.started) return;
    if (wantsPlay()) {
      if (P.dataset.i !== String(reel.i)) load(P, reel.i);
      if (P.paused && !P.ended) tryPlay(P);
    } else if (!P.paused) P.pause();
  }
  function clipTime() { return reel.vis ? reel.vis.currentTime : 0; }

  // ------------------------------------------------------------------ the card that names what is on, and the sound
  var nowCount = $('now-count'), nowId = $('now-id'), nowTitle = $('now-title'), nowWhat = $('now-what'), nowGo = $('now-go'), ticksEl = $('ticks');
  var ticks = [], cardFor = -1;
  for (var ti = 0; ti < N; ti++) { var li = document.createElement('li'), bar = document.createElement('i'); li.appendChild(bar); ticksEl.appendChild(li); ticks.push({ li: li, bar: bar, last: '' }); }
  function setCard(i) {
    if (cardFor === i) return;
    cardFor = i;
    var c = CLIPS[i];
    nowCount.textContent = (i + 1) + ' of ' + N; nowId.textContent = c.id;
    nowTitle.textContent = c.title; nowWhat.textContent = c.what;
    if (c.href) { nowGo.hidden = false; nowGo.href = c.href; nowGo.setAttribute('aria-label', 'Read the post about ' + c.title); } else nowGo.hidden = true;
    for (var j = 0; j < N; j++) { ticks[j].li.className = j < i ? 'done' : ''; if (j !== i) { ticks[j].bar.style.transform = ''; ticks[j].last = ''; } }
    if (poster.getAttribute('src') !== posterUrl(i) && !reel.vis) poster.src = posterUrl(i);
    markStill(i);
  }
  function setTick(i, p) {
    var tr = 'scaleX(' + clamp(p).toFixed(3) + ')';
    if (ticks[i].last !== tr) { ticks[i].bar.style.transform = tr; ticks[i].last = tr; }
  }
  var sndOn = $('snd-on'), sndOff = $('snd-off');
  function setSound(on) {
    reel.soundOn = on;
    sndOn.setAttribute('aria-pressed', on ? 'true' : 'false'); sndOff.setAttribute('aria-pressed', on ? 'false' : 'true');
    P.muted = !on; Q.muted = !on;
  }
  sndOn.addEventListener('click', function () {
    setSound(true);
    if (RM && !reel.rmPlaying && !STILL) setPlaying(true);   // asking for sound is asking for the reel
    sync();
  });
  sndOff.addEventListener('click', function () { setSound(false); });

  // ------------------------------------------------------------------ motion off: a strip of stills, and a button that plays
  var stills = $('stills'), strip = $('strip'), stillBtns = [], playWord = $('play-word');
  function markStill(i) { for (var j = 0; j < stillBtns.length; j++) stillBtns[j].setAttribute('aria-current', j === i ? 'true' : 'false'); }
  function setPlaying(on) {
    reel.rmPlaying = on;
    playBtn.classList.toggle('is-playing', on); playWord.textContent = on ? 'Pause' : 'Play the reel';
    if (on) { startReel(); kick(); }
    sync();
  }
  function pick(i) {                                   // a still was pressed
    if (reel.rmPlaying && reel.started) { advance(i); return; }
    if (!P.paused) P.pause();
    reel.i = i; reel.shown = -1; reel.vis = null; P.classList.remove('on'); Q.classList.remove('on');
    cardFor = -1; setCard(i); render();
  }
  if (RM) {
    stills.hidden = false; playBtn.hidden = false;
    CLIPS.forEach(function (c, i) {
      var li = document.createElement('li'), b = document.createElement('button'), im = document.createElement('img'), sp = document.createElement('span');
      b.type = 'button'; im.src = posterUrl(i); im.alt = ''; im.width = 320; im.height = 180; im.loading = 'lazy'; im.decoding = 'async';
      sp.textContent = c.title; b.appendChild(im); b.appendChild(sp); li.appendChild(b); strip.appendChild(li);
      b.addEventListener('click', function () { pick(i); stage.scrollIntoView({ block: 'start' }); });
      stillBtns.push(b);
    });
    playBtn.addEventListener('click', function () { setPlaying(!reel.rmPlaying); });
  }

  // ------------------------------------------------------------------ what drifts in the air
  var petals = [], flies = [], dust = [], stars = [];
  (function seed() {
    var r = rnd(20261113), i;
    for (i = 0; i < 44; i++) petals.push({ d: 0.1 + r() * 0.95, x: r() * 2 - 1, y: r(), sp: 0.016 + r() * 0.02, sw: 0.5 + r(), ph: r() * 6.283, rot: r() * 6.283, rs: (r() - 0.5) * 1.6, tone: r() });
    for (i = 0; i < 11; i++) flies.push({ x: 300 + r() * 1100, y: 640 + r() * 330, ph: r() * 6.283, sp: 0.2 + r() * 0.3, d: 0.9 + r() * 0.08 });
    for (i = 0; i < 34; i++) dust.push({ u: r(), v: r(), w: r(), ph: r() * 6.283, sp: 0.015 + r() * 0.04 });
    for (i = 0; i < 90; i++) stars.push({ x: -400 + r() * 3600, y: -1500 + r() * 1640, s: 0.5 + r() * 1.1, ph: r() * 6.283, sp: 0.4 + r() * 1.2 });
  })();
  function drawPetals(cam, t, alpha) {
    var span = 1.05, n = tall ? 26 : petals.length;
    for (var i = 0; i < n; i++) {
      var p = petals[i];
      var dz = ((p.d - cam.m) % span + span) % span; if (dz < 0.035) continue;
      var z = 1 / dz, fall = (p.y + t * p.sp) % 1;
      var wx = (p.x * 900 + Math.sin(t * p.sw * 0.6 + p.ph) * 38) * (0.4 + dz), wy = (fall * 1300 - 760) * (0.35 + dz * 0.8);
      var sx = W / 2 + ((wx - cam.C[0]) / dz - cam.o[0]) * S0, sy = H / 2 + ((wy - cam.C[1]) / dz - cam.o[1]) * S0;
      var size = 5.2 * z * S0; if (size > 60) continue;
      if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;
      var near = clamp((size - 9) / 40);
      ax.save();
      ax.translate(sx, sy); ax.rotate(p.rot + t * p.rs * 0.5);
      ax.scale(1, 0.62 + 0.3 * Math.sin(t * p.rs + p.ph));
      ax.globalAlpha = alpha * lerp(0.9, 0.28, near) * clamp((dz - 0.035) / 0.05);
      ax.fillStyle = p.tone > 0.5 ? '#f3b3c6' : '#cf8ea8';
      ax.beginPath(); ax.moveTo(-size, 0); ax.quadraticCurveTo(0, -size * 0.85, size, 0); ax.quadraticCurveTo(0, size * 0.55, -size, 0); ax.fill();
      ax.restore();
    }
  }
  function drawFlies(cam, t, alpha) {
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], dz = f.d - cam.m; if (dz < 0.1) continue;
      var bx = f.x - PW / 2 + Math.sin(t * f.sp + f.ph) * 46, by = f.y - PH / 2 + Math.cos(t * f.sp * 1.3 + f.ph) * 22;
      var p = proj([bx, by], f.d, cam);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
      var tw = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9 + f.ph * 3), 2), rad = Math.max(1.1, 2.6 * S0 * p.z);
      var gl = ax.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 4.2);
      gl.addColorStop(0, 'rgba(255,224,160,0.95)'); gl.addColorStop(0.22, 'rgba(255,216,146,0.5)'); gl.addColorStop(1, 'rgba(255,216,146,0)');
      ax.globalAlpha = alpha * tw; ax.fillStyle = gl;
      ax.beginPath(); ax.arc(p.x, p.y, rad * 4.2, 0, 6.283); ax.fill();
    }
  }
  function drawStars(cam, t) {                         // only a tall screen sees the sky above the plate
    ax.fillStyle = '#dfe3ff';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], x = cam.tx + s.x * cam.s, y = cam.ty + s.y * cam.s;
      if (x < 0 || x > W || y < 0 || y > H) continue;
      ax.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      ax.beginPath(); ax.arc(x, y, s.s, 0, 6.283); ax.fill();
    }
  }

  // ------------------------------------------------------------------ the beam
  // The beam is painted small and laid over the screen three times larger, so it has no edge anywhere: a fan of light
  // from the lens, in the colours of the picture it carries, thinning out as it nears the cloth.
  var beamCv = document.createElement('canvas'), bx = beamCv.getContext('2d'), BS = 3, canConic = !!bx.createConicGradient;
  function wrapA(a) { while (a > Math.PI) a -= 6.2832; while (a < -Math.PI) a += 6.2832; return a; }
  function drawBeam(cam, t, lens, k, wide, pj) {
    var fq = FILMQ.map(function (p) { return plateXY(p, cam); }), i, j;
    var fl = HELD ? 1 : 0.94 + 0.06 * Math.sin(t * 23.0) * Math.sin(t * 7.3);          // the lamp is never quite steady
    var mid = plateXY(FOCUS, cam), ac = Math.atan2(mid[1] - lens[1], mid[0] - lens[0]), dist = Math.hypot(mid[0] - lens[0], mid[1] - lens[1]);
    var lo = 9, hi = -9;
    for (i = 0; i < 4; i++) { var d = wrapA(Math.atan2(fq[i][1] - lens[1], fq[i][0] - lens[0]) - ac); if (d < lo) lo = d; if (d > hi) hi = d; }
    var span = hi - lo, soft = span * 0.2;
    // the shadow the stool throws on the lawn
    if (pj) {
      var sx = pj.x + pj.w * 0.47, sy = pj.y + pj.h * 0.985, rx = pj.w * 0.42, ry = pj.w * 0.085;
      if (sy - ry < H) {
        lx.save(); lx.translate(sx, sy); lx.scale(1, ry / rx);
        var sh = lx.createRadialGradient(0, 0, 0, 0, 0, rx);
        sh.addColorStop(0, 'rgba(6,8,14,0.62)'); sh.addColorStop(0.55, 'rgba(6,8,14,0.34)'); sh.addColorStop(1, 'rgba(6,8,14,0)');
        lx.fillStyle = sh; lx.beginPath(); lx.arc(0, 0, rx, 0, 6.2832); lx.fill(); lx.restore();
      }
    }
    if (canConic && span > 0.02 && span < 3) {
      var bw = beamCv.width, bh = beamCv.height, L0 = lens[0] / BS, L1 = lens[1] / BS;
      bx.setTransform(1, 0, 0, 1, 0, 0); bx.globalCompositeOperation = 'source-over'; bx.globalAlpha = 1; bx.clearRect(0, 0, bw, bh);
      // where across the fan each sixth of the picture lies
      var ca = [];
      for (j = 0; j < 6; j++) { var cc = plateXY(onFilm((j % 3 + 0.5) / 3, (j < 3 ? 0.5 : 1.5) / 2), cam); ca.push((wrapA(Math.atan2(cc[1] - lens[1], cc[0] - lens[0]) - ac) - lo) / span); }
      var a0 = ac + lo - soft, cg = bx.createConicGradient(a0, L0, L1), n = 18, turn = 6.2832;
      cg.addColorStop(0, 'rgba(255,240,210,0)');
      for (i = 0; i <= n; i++) {
        var u = i / n, r = 0, g = 0, b = 0, ws = 0;
        for (j = 0; j < 6; j++) { var w = Math.exp(-Math.pow((u - ca[j]) / 0.24, 2)) + 0.02; r += cells[j * 3] * w; g += cells[j * 3 + 1] * w; b += cells[j * 3 + 2] * w; ws += w; }
        r /= ws; g /= ws; b /= ws;
        var mx = Math.max(r, g, b, 0.06), l = 0.3 * r + 0.59 * g + 0.11 * b;
        var edge = ss(0, 0.16, u) * ss(1, 0.84, u);
        var ray = HELD ? 0.86 + 0.14 * Math.sin(u * 23) : 0.84 + 0.16 * Math.sin(u * 23 + t * 0.4) * Math.sin(u * 7.1 - t * 0.23);
        var al = clamp((0.24 + 0.9 * Math.pow(l, 0.6)) * edge * ray);
        cg.addColorStop((soft + u * span) / turn, 'rgba(' + Math.round(255 * (0.6 * r / mx + 0.4)) + ',' + Math.round(255 * (0.6 * g / mx + 0.38)) + ',' + Math.round(255 * (0.6 * b / mx + 0.34)) + ',' + al.toFixed(3) + ')');
      }
      cg.addColorStop(Math.min(0.999, (2 * soft + span) / turn + 0.0005), 'rgba(255,240,210,0)');
      bx.fillStyle = cg; bx.fillRect(0, 0, bw, bh);
      // along its length: brightest at the lens, nearly gone where it meets the cloth
      var D = dist / BS, rg = bx.createRadialGradient(L0, L1, 0, L0, L1, D * 1.12);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.1, 'rgba(0,0,0,0.8)'); rg.addColorStop(0.45, 'rgba(0,0,0,0.5)'); rg.addColorStop(0.82, 'rgba(0,0,0,0.24)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      bx.globalCompositeOperation = 'destination-in'; bx.fillStyle = rg; bx.fillRect(0, 0, bw, bh);
      // the picture outshines the beam that crosses it
      bx.globalCompositeOperation = 'destination-out'; bx.fillStyle = 'rgba(0,0,0,0.82)';
      bx.beginPath(); bx.moveTo(fq[0][0] / BS, fq[0][1] / BS); bx.lineTo(fq[1][0] / BS, fq[1][1] / BS); bx.lineTo(fq[2][0] / BS, fq[2][1] / BS); bx.lineTo(fq[3][0] / BS, fq[3][1] / BS); bx.closePath(); bx.fill();
      lx.globalAlpha = clamp(k * fl * (wide ? (tall ? 0.6 : 0.95) : 0.8)); lx.imageSmoothingEnabled = true; lx.imageSmoothingQuality = 'high';
      lx.drawImage(beamCv, 0, 0, bw, bh, 0, 0, bw * BS, bh * BS);
      lx.globalAlpha = 1;
    }
    // dust turning over in the light
    var bc = 'rgb(' + beamCol[0] + ',' + beamCol[1] + ',' + beamCol[2] + ')';
    lx.fillStyle = bc;
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], u = HELD ? d.u : (d.u + t * d.sp * 0.3) % 1;
      var e = onFilm(clamp(d.v + (HELD ? 0 : Math.sin(t * 0.31 + d.ph) * 0.06)), clamp(d.w + (HELD ? 0 : Math.cos(t * 0.27 + d.ph) * 0.07)));
      var end = plateXY(e, cam), x = lerp(lens[0], end[0], 0.06 + u * 0.8), y = lerp(lens[1], end[1], 0.06 + u * 0.8);
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      lx.globalAlpha = k * (0.18 + 0.5 * (0.5 + 0.5 * Math.sin((HELD ? 0 : t * 1.3) + d.ph * 5))) * (1 - u * 0.55);
      lx.beginPath(); lx.arc(x, y, (0.7 + (1 - u) * 1.5) * (wide ? 0.8 : 1.25), 0, 6.283); lx.fill();
    }
    lx.globalAlpha = 1;
    // the lens itself
    if (lens[0] > -60 && lens[0] < W + 60 && lens[1] > -60 && lens[1] < H + 60) {
      var rad = Math.max(10, (wide ? 0.012 : 0.03) * W);
      var lg = lx.createRadialGradient(lens[0], lens[1], 0, lens[0], lens[1], rad);
      lg.addColorStop(0, 'rgba(255,250,235,' + (0.95 * k * fl).toFixed(3) + ')'); lg.addColorStop(0.25, 'rgba(' + beamCol.join(',') + ',' + (0.5 * k).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(' + beamCol.join(',') + ',0)');
      lx.fillStyle = lg; lx.beginPath(); lx.arc(lens[0], lens[1], rad, 0, 6.283); lx.fill();
    }
  }

  // ------------------------------------------------------------------ the frame
  var worldTr = '', yS = null, last = 0, raf = 0, visible = true, ptr = { x: 0, y: 0, tx: 0, ty: 0 }, dockK = -1, hintO = -1, shadeO = -1;
  var stats = { n: 0, since: 0, fps: 0, worst: 0, glow: 0 };
  function scrollQ(dt) {
    if (RM) return 1;
    var r = chapter.getBoundingClientRect(), travel = Math.max(1, r.height - H), yT = clamp(-r.top / travel);
    // the camera glides: it follows the scroll a breath behind. A held frame follows it exactly.
    if (HELD || yS === null) yS = yT; else { yS += (yT - yS) * (1 - Math.exp(-dt * 10)); if (Math.abs(yT - yS) < 0.0003) yS = yT; }
    return yS;
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.1, (now - last) / 1000 || 0.016); last = now;
    var t = HELD ? T_HELD : now / 1000;
    var q = scrollQ(dt), e = io(ss(0.03, 0.64, q));
    if (HELD) { ptr.x = 0; ptr.y = 0; } else { var pk = 1 - Math.exp(-dt * 3.5); ptr.x += (ptr.tx - ptr.x) * pk; ptr.y += (ptr.ty - ptr.y) * pk; }
    var cam = camAt(e, ptr.x * 16 * (1 - e * 0.55), ptr.y * 9 * (1 - e * 0.55));

    var tr = 'translate3d(' + cam.tx.toFixed(2) + 'px,' + cam.ty.toFixed(2) + 'px,0) scale(' + cam.s.toFixed(5) + ')';
    if (tr !== worldTr) { world.style.transform = tr; worldTr = tr; }

    // the light: what the film is showing now
    var pulse = HELD ? 0 : Math.exp(-(now / 1000 - cutAt) * 9);            // a splice passing the gate: the lamp dips for a blink
    var cur = reel.shown >= 0 ? reel.shown : reel.i;
    sample(cur, clipTime());
    readLight();
    var rate = HELD ? 1 : 1 - Math.exp(-dt * (RM ? 2 : 9));
    for (var c = 0; c < 3; c++) kNow[c] += (want[c] * (1 - 0.3 * pulse) - kNow[c]) * rate;
    lumS += (lum - lumS) * rate;
    paintGlow(now);

    // the flats
    if (!RM) place(F.lead, cam, 1 - ss(0.012, 0.075, e));        // the name is gone before the edge of the screen can cut it
    var pj = place(F.proj, cam, 1);
    place(F.bl, cam, ss(0.015, 0.07, F.bl.r - cam.m));
    place(F.br, cam, ss(0.015, 0.07, F.br.r - cam.m));

    // the beam and what floats in it
    lx.setTransform(DPR, 0, 0, DPR, 0, 0); lx.clearRect(0, 0, W, H);
    var lens = pj ? [pj.x + pj.w * LENS[0], pj.y + pj.h * LENS[1]] : [-W * 0.2, H * 1.2];
    drawBeam(cam, t, lens, (0.55 + 0.45 * (1 - pulse)) * (0.75 + 0.25 * e), e < 0.5, pj);

    ax.setTransform(DPR, 0, 0, DPR, 0, 0); ax.clearRect(0, 0, W, H);
    if (tall) drawStars(cam, t);
    drawFlies(cam, t, 0.9 * (1 - ss(0.45, 0.8, e)));
    drawPetals(cam, t, 0.85);
    ax.globalAlpha = 1;

    // the page's own furniture
    var ho = RM ? 0 : Math.round((1 - ss(0.0, 0.035, q)) * 100) / 100;
    if (ho !== hintO) { hint.style.opacity = ho; hintO = ho; }
    var so = Math.round(e * 0.9 * 100) / 100;
    if (so !== shadeO) { shade.style.opacity = so; shadeO = so; }
    var dk = Math.round(io(ss(0.5, 0.66, q)) * 200) / 200;
    if (dk !== dockK) {
      // the cards come up from under the frame, whole: never half-transparent over the lawn
      dock.style.visibility = dk > 0.005 ? 'visible' : 'hidden'; dock.style.opacity = 1;
      dock.style.transform = dk >= 1 ? 'none' : 'translate3d(0,' + ((1 - dk) * (dock.offsetHeight + 60)).toFixed(1) + 'px,0)';
      dockK = dk;
    }
    if (RM) {                                          // the play button stands on the bare cloth under the picture, not on the picture
      var pb = plateXY(onFilm(0.5, 1), cam), pc = plateXY(carry(clothH, 0.5, 1), cam), mid = [(pb[0] + pc[0]) / 2, (pb[1] + pc[1]) / 2 - 2];
      playBtn.style.transform = 'translate3d(' + Math.round(mid[0] - playBtn.offsetWidth / 2) + 'px,' + Math.round(mid[1] - playBtn.offsetHeight / 2) + 'px,0)';
    }
    setTick(cur, reel.vis && reel.vis.duration ? reel.vis.currentTime / reel.vis.duration : (HELD ? 0.4 : 0));

    if (DEBUG) meter(now, dt);
    if (DEBUG) window.__reel = { cam: cam, k: kNow.slice(), want: want.slice(), lum: lum, q: q, e: e, reel: reel };
    if (!window.__ready && nightImg.complete && kDone[0] >= 0) { window.__ready = true; root.dataset.ready = '1'; }
    if (running()) raf = requestAnimationFrame(frame);
  }
  function running() { return visible && !document.hidden && (!HELD || (RM && reel.rmPlaying) || !window.__ready); }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function render() { if (!raf) raf = requestAnimationFrame(frame); }
  function meter(now, dt) {
    stats.n++; stats.worst = Math.max(stats.worst, dt);
    if (now - stats.since > 1000) {
      stats.fps = stats.n * 1000 / (now - stats.since);
      dbg.textContent = stats.fps.toFixed(1) + ' frames a second (slowest ' + (stats.worst * 1000).toFixed(0) + ' ms)\n' + W + ' x ' + H + ' at ' + DPR + ', lawn repainted ' + stats.glow + ' times\nclip ' + (reel.shown + 1) + ' of ' + N + ', sound ' + (reel.soundOn ? 'on' : 'off');
      window.__fps = { fps: stats.fps, worst: stats.worst * 1000, glow: stats.glow };
      stats.n = 0; stats.since = now; stats.worst = 0; stats.glow = 0;
    }
  }

  // ------------------------------------------------------------------ start
  if (qs.has('y')) {
    try { history.scrollRestoration = 'manual'; } catch (err) { /* older browsers */ }
    var wantY = clamp(parseFloat(qs.get('y')) || 0);
    var jump = function () { window.scrollTo(0, Math.round(wantY * (root.scrollHeight - window.innerHeight))); yS = null; };
    jump(); window.addEventListener('load', function () { jump(); render(); });
  }
  layout();
  setCard(reel.i);
  if (start !== 0) poster.src = posterUrl(start);
  window.addEventListener('scroll', render, { passive: true });
  var rz = 0;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); kDone[0] = -1; render(); }, 90); });
  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse' || HELD) return;
    ptr.tx = clamp(ev.clientX / W * 2 - 1, -1, 1); ptr.ty = clamp(ev.clientY / H * 2 - 1, -1, 1);
  }, { passive: true });
  document.addEventListener('visibilitychange', function () { sync(); kick(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting; reel.inView = en[0].intersectionRatio > 0.2;
      sync(); if (visible) kick();
    }, { threshold: [0, 0.2, 0.5] }).observe(stage);
  }
  [nightImg, glowImg].forEach(function (im) { im.addEventListener('load', function () { kDone[0] = -1; render(); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); render(); });
  if (!HELD) startReel();
  kick();
})();
