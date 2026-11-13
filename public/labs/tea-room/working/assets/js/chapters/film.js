/* THE FILM CHAPTER: the cinema in the garden, and on its cloth a reel of the best moments, playing by itself, muted,
   one after another, round and round. (Grown from the film reel test, tests/film-reel/.)

   It opens on exactly the picture look B ends on (the title shot: the lit cloth, the projector, "AI video & film"),
   drawn from look B's own numbers, so the reader cannot tell where look B's stage stops and this one starts. From
   there the camera walks on to the cloth, the lamp's white light gives way to the film, the card that names what is
   playing comes up; then it steps back to the whole garden while the four posts pass.

   Everything drawn is a function of three things: q (the chapter's progress, which is the camera), the time (what
   moves by itself) and which moment of the reel is on (the light). ?m=3 picks the moment a held frame shows. */
import { REEL } from './film-reel.js';

var IMG = new URL('../../img/', import.meta.url).href;
var CLIPS = REEL.clips, N = CLIPS.length;
var SITE = 'https://aaronorelup.com';

var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var rnd = function (seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// ------------------------------------------------------------------ the plate's geometry (in its own pixels)
var PW = 2752, PH = 1536, CX = PW / 2, CY = PH / 2;
var CLOTH = [[1447, 398], [2199, 362], [2199, 908], [1447, 872]];   // the cloth's corners: it hangs a little turned, its right edge nearer
var FOCUS = [1823, 634];                                            // the middle of the cloth: what the camera goes to
var GLOW = { x: 638, y: 290, w: 1899, h: 1246 };                    // where the lamp's light lies on the plate
var LAMP = [0.69, 0.50, 0.56];                                      // how much of each colour of that light a white picture throws
var LENS = [0.948, 0.467];                                          // the lens, within the projector's picture
// look B's own numbers for the title shot (diorama.js: layoutCinema, drawCinema, drawBeam)
var B_CLOTH = [[1453, 404], [2202, 370], [2207, 929], [1445, 877]], B_M = 0.03, B_WORD_R = 0.96, B_K = 1.4;

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
var clothH = homography([[0, 0], [1, 0], [1, 1], [0, 1]], CLOTH);
// the picture is thrown onto the middle of the cloth, 16 to 9 where it is widest, a band of bare cloth above and below
var FILM_UV = [0.045, 0.1225, 0.955, 0.8775];
var FILMQ = [carry(clothH, FILM_UV[0], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[1]), carry(clothH, FILM_UV[2], FILM_UV[3]), carry(clothH, FILM_UV[0], FILM_UV[3])];
var filmH = homography([[0, 0], [1280, 0], [1280, 720], [0, 720]], FILMQ);
function onFilm(u, v) { return carry(clothH, lerp(FILM_UV[0], FILM_UV[2], u), lerp(FILM_UV[1], FILM_UV[3], v)); }
function flick(t, seed) {                 // look B's lamp: steps, unevenly, about eight times a second
  var k = Math.floor(t * 8) + seed * 131; var x = Math.sin(k * 12.9898) * 43758.5453; x = x - Math.floor(x);
  return 0.86 + 0.14 * x;
}

// what drifts in the air. The first set is look B's own, seeded as look B seeds it, so its petals do not jump
var petals = [], bDust = [], flies = [], dust = [], stars = [];
(function seed() {
  var r = rnd(20261112), i;
  for (i = 0; i < 46; i++) petals.push({ d: 0.1 + r() * 0.95, x: r() * 2 - 1, y: r(), sp: 0.018 + r() * 0.022, sw: 0.5 + r(), ph: r() * 6.283, rot: r() * 6.283, rs: (r() - 0.5) * 1.6, tone: r() });
  for (i = 0; i < 9 * 5; i++) r();                                     // (look B's fireflies, which the cinema does not show)
  for (i = 0; i < 26; i++) bDust.push({ u: r(), v: r() * 2 - 1, ph: r() * 6.283, sp: 0.02 + r() * 0.05 });
  r = rnd(20261113);
  for (i = 0; i < 11; i++) flies.push({ x: 300 + r() * 1100, y: 640 + r() * 330, ph: r() * 6.283, sp: 0.2 + r() * 0.3, d: 0.9 + r() * 0.08 });
  for (i = 0; i < 34; i++) dust.push({ u: r(), v: r(), w: r(), ph: r() * 6.283, sp: 0.015 + r() * 0.04 });
  for (i = 0; i < 90; i++) stars.push({ x: -400 + r() * 3600, y: -1500 + r() * 1640, s: 0.5 + r() * 1.1, ph: r() * 6.283, sp: 0.4 + r() * 1.2 });
})();
var tracks = CLIPS.map(function (c) { var s = atob(c.light), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; });

export function mount(host, options) {
  var qs = new URLSearchParams(location.search);
  var RM = options.reduced, HELD = options.held, STILL = HELD && !RM;
  var root = document.documentElement, section = options.section, marks = options.marks;
  var alive = true;

  // ------------------------------------------------------------------ the pictures
  host.innerHTML =
    '<div class="fm-night">' +
      '<div class="fm-ext fm-sky"></div><div class="fm-ext fm-lawn"></div>' +
      '<img class="flat fm-plate" data-k="night" src="' + IMG + 'film/garden-night.webp" width="2752" height="1536" alt="" decoding="async">' +
      '<canvas class="fm-glow"></canvas>' +
      '<div class="fm-film"><img class="fm-shot" alt="" decoding="async">' +
        '<video class="fm-shot" muted playsinline preload="none" disableremoteplayback tabindex="-1"></video>' +
        '<video class="fm-shot" muted playsinline preload="none" disableremoteplayback tabindex="-1"></video></div>' +
    '</div>' +
    '<img class="flat fm-plate" data-k="lit" src="' + IMG + 'cinema.webp" width="2752" height="1536" alt="">' +
    '<canvas class="fm-layer" data-k="light"></canvas>' +
    '<div class="flat word" data-k="word"></div><div class="flat say mono" data-k="say"></div>' +
    '<div class="flat fm-proj"><img src="' + IMG + 'prop-projector.webp" width="618" height="1009" alt="">' +
      '<img class="fm-reel fm-reel-a" src="' + IMG + 'film/reel-a.webp" width="206" height="230" alt="">' +
      '<img class="fm-reel fm-reel-b" src="' + IMG + 'film/reel-b.webp" width="176" height="216" alt=""></div>' +
    '<img class="flat" data-k="bush" src="' + IMG + 'near-bush-r.webp" width="490" height="250" alt="">' +
    '<canvas class="fm-layer" data-k="air"></canvas>' +
    '<div class="fm-shade"></div>';
  var pick = function (sel) { return host.querySelector(sel); };
  var nightBox = pick('.fm-night'), sky = pick('.fm-sky'), lawn = pick('.fm-lawn'), nightImg = pick('[data-k=night]'), litImg = pick('[data-k=lit]');
  var glow = pick('.fm-glow'), film = pick('.fm-film'), poster = film.querySelector('img'), vids = film.querySelectorAll('video');
  var lightCv = pick('[data-k=light]'), airCv = pick('[data-k=air]'), shade = pick('.fm-shade');
  var wordEl = pick('[data-k=word]'), sayEl = pick('[data-k=say]'), projEl = pick('.fm-proj'), bushEl = pick('[data-k=bush]');
  var reelA = pick('.fm-reel-a'), reelB = pick('.fm-reel-b');
  var lx = lightCv.getContext('2d'), ax = airCv.getContext('2d'), gx = glow.getContext('2d');
  // the chapter's name, as look B prints it on its own stage
  var bWord = document.getElementById('w-next'), bSay = document.getElementById('s-next');
  wordEl.innerHTML = bWord ? bWord.innerHTML : '<span class="l">AI video</span><span class="l">&amp; film</span>';
  sayEl.textContent = bSay ? bSay.textContent : '';

  // what is pressed: the card that names what is on, the sound, and (with motion off) the button that plays
  var top = options.top;
  top.innerHTML =
    '<div class="fm-dock">' +
      '<div class="fm-card fm-sound"><p class="fm-sound-say">The reel has sound. It stays off until you turn it on.</p>' +
        '<div class="fm-switch" role="group" aria-label="Sound"><button type="button" aria-pressed="true">Sound off</button><button type="button" aria-pressed="false">Sound on</button></div></div>' +
      '<article class="fm-card fm-now" aria-label="Now playing">' +
        '<p class="fm-now-meta"><span>Now playing</span><span data-k="count"></span><span data-k="id"></span></p>' +
        '<h3 class="fm-now-title"></h3><p class="fm-now-what"></p>' +
        '<p class="fm-now-go"><a class="go" href="#">Read the post</a><span class="fm-none" hidden>No post about this one yet</span></p>' +
        '<ol class="fm-ticks" aria-hidden="true"></ol></article>' +
    '</div>' +
    '<button class="fm-play" type="button" hidden><span class="fm-play-mark" aria-hidden="true"></span><span data-k="play-word">Play the reel</span></button>';
  var dock = top.querySelector('.fm-dock'), nowCard = top.querySelector('.fm-now'), soundCard = top.querySelector('.fm-sound');
  var sndOff = top.querySelectorAll('.fm-switch button')[0], sndOn = top.querySelectorAll('.fm-switch button')[1];
  var nowCount = top.querySelector('[data-k=count]'), nowId = top.querySelector('[data-k=id]'), nowTitle = top.querySelector('.fm-now-title'), nowWhat = top.querySelector('.fm-now-what');
  var nowGo = top.querySelector('.fm-now-go a'), nowNone = top.querySelector('.fm-none'), ticksEl = top.querySelector('.fm-ticks');
  var playBtn = top.querySelector('.fm-play'), playWord = top.querySelector('[data-k=play-word]');
  var ticks = [], cardFor = -1;
  for (var ti = 0; ti < N; ti++) { var li = document.createElement('li'), bar = document.createElement('i'); li.appendChild(bar); ticksEl.appendChild(li); ticks.push({ li: li, bar: bar, last: '' }); }

  // which pictures are in (a picture that will not come is not waited for)
  var got = { lit: false, night: false, glow: false, poster: false };
  function wait(im, key) {
    var done = function () { if (!alive) return; got[key] = true; kDone[0] = -1; options.redraw(); };
    if (im.complete && im.naturalWidth) { (im.decode ? im.decode() : Promise.resolve()).then(done, done); return; }
    im.addEventListener('load', function () { (im.decode ? im.decode() : Promise.resolve()).then(done, done); }, { once: true });
    im.addEventListener('error', done, { once: true });
  }

  // ------------------------------------------------------------------ the camera
  // Look B's model: the plate stands at distance 1; a flat at distance r passes faster. The camera is at (C, m): C
  // where it stands sideways and in height (plate pixels from the plate's middle), m how far in it has come. It always
  // looks straight ahead, so a move between two places is a straight walk and every flat keeps true to it.
  var W = 0, H = 0, tall = false, narrow = false, S0 = 1, CD = 1, DPR = 1, span = 1;
  var K0, K1, K1b, K2, K3, PJ0, PJ1, BU0, wordB = [0, 0], sayB = [0, 0], wordPx = 100, sayPx = 20, wordW = 100, sayW = 50, leftEdge = 0;
  var T = { a0: 0.1, a1: 1.5, b0: 3, b1: 4, dockA: 1.42, dockB: 1.72 };
  function camOf(s, fx, fy) {                      // the camera from which the plate is as large as s, the middle of the cloth at (fx, fy)
    return { m: 1 - S0 / s, C: [(W / 2 - (fx - FOCUS[0] * s)) / s - CX, (H / 2 - (fy - FOCUS[1] * s)) / s - CY] };
  }
  function between(A, B, e) {                      // a straight walk; an even pace for the eye: the cloth grows by the same share with every step
    var sA = S0 / (1 - A.m), sB = S0 / (1 - B.m), g = e;
    if (Math.abs(sB / sA - 1) > 0.02) g = ((1 - S0 / (sA * Math.pow(sB / sA, e))) - A.m) / (B.m - A.m);
    return { m: lerp(A.m, B.m, g), C: [lerp(A.C[0], B.C[0], g), lerp(A.C[1], B.C[1], g)] };
  }
  function scaleOf(cam) { return S0 / (1 - cam.m); }
  function plateXY(p, cam) { var s = scaleOf(cam); return [W / 2 + (p[0] - CX - cam.C[0]) * s, H / 2 + (p[1] - CY - cam.C[1]) * s]; }
  function proj(b, r, cam) { var dz = r - cam.m; return { x: W / 2 + (b[0] * r - cam.C[0]) / dz * S0, y: H / 2 + (b[1] * r - cam.C[1]) / dz * S0, z: r / dz, dz: dz }; }
  function bAt(sx, sy, r, cam) { var dz = r - cam.m; return [((sx - W / 2) / S0 * dz + cam.C[0]) / r, ((sy - H / 2) / S0 * dz + cam.C[1]) / r]; }

  var cache = new Map();
  function setT(el, tr) { if (cache.get(el) !== tr) { el.style.transform = tr; cache.set(el, tr); } }
  function setO(el, o, key) { o = Math.round(o * 500) / 500; var k = key || 'o'; if (el[k + '_'] !== o) { el.style.opacity = o; el[k + '_'] = o; } }
  function setV(el, yes) { if (el.v_ !== yes) { el.style.visibility = yes ? '' : 'hidden'; el.v_ = yes; } }   // ('' and never 'visible': a hidden layer must hide what is in it)
  function box(x, y, w, lw) { return 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / lw).toFixed(5) + ')'; }

  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    tall = W / H < 0.9; narrow = W <= 820;
    host.classList.toggle('tall', tall); top.classList.toggle('tall', tall);
    span = options.span();
    var cover = Math.max(W / PW, H / PH);
    S0 = cover * (tall ? 1.03 : 1.2);
    var rail = narrow ? 0 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172);
    leftEdge = narrow ? 16 : rail + Math.max(16, Math.min(46, W * 0.032)) * 2;

    // 0: look B's title shot. The camera stands where look B's stands.
    K0 = { m: B_M, C: tall ? [455, -60] : [-225, -24] };
    // 1: before the cloth. Wide screens: the cloth is most of the frame beside the rail, a band of lawn under it for the
    // film's light to fall on. Tall screens: the picture runs edge to edge, sky above it and the lawn below.
    // 2, 3: the whole garden again, the cloth to one side, while the four posts pass and the page closes.
    if (!tall) {
      var s1 = Math.min(0.74 * W / 752, 0.84 * (W - rail) / 752, 0.86 * H / 546), f1y = (H < 760 ? 0.405 : 0.43) * H;
      K1 = camOf(s1, 0.5 * W + rail * 0.5, f1y); K1b = camOf(s1 * 1.035, 0.5 * W + rail * 0.5, f1y - H * 0.004);
      var s3 = cover * 1.1, tx = clamp(0.957 * W - 2240 * s3, W - PW * s3, 0), ty = clamp(0.5 * H - 800 * s3, H - PH * s3, 0);
      K3 = camOf(s3, tx + FOCUS[0] * s3, ty + FOCUS[1] * s3);
      var s2 = s3 * 1.09, tx2 = clamp(0.975 * W - 2240 * s2, W - PW * s2, 0), ty2 = clamp(0.47 * H - 800 * s2, H - PH * s2, 0);
      K2 = camOf(s2, tx2 + FOCUS[0] * s2, ty2 + FOCUS[1] * s2);
    } else {
      K1 = camOf(0.965 * W / 650, 0.5 * W, 0.325 * H); K1b = camOf(0.99 * W / 650, 0.5 * W, 0.322 * H);
      K3 = camOf(0.88 * W / 752, 0.5 * W, 0.56 * H);
      K2 = K3;
    }

    // the flats that stand nearer than the plate. At the title shot they are where look B has them; before the cloth
    // the projector is low in the left corner, seen from behind its shoulder, and the leaves are out of the frame.
    var pw0 = tall ? W * 0.5 : clamp(W * 0.2, 190, 400);
    PJ0 = { x: tall ? W * 0.24 : leftEdge + pw0 * 0.75, y: H * 1.1, w: pw0 };
    var pw1 = tall ? Math.min(W * 0.42, H * 0.2) : clamp(W * 0.235, 210, 470);
    PJ1 = tall ? { x: W * 0.2, y: H * 0.83, w: pw1 } : { x: W * 0.1 + rail * 0.5, y: H * 1.19, w: pw1 };
    var bw = tall ? W * 0.6 : W * 0.27;
    BU0 = { x: W * 0.94, y: H * 0.99, w: bw };

    // the chapter's name and its one line, sized and placed by look B's rule
    wordPx = clamp(W * (tall ? 0.15 : 0.115), 52, 190); sayPx = clamp(W * 0.0175, 17, 27) * 0.8;
    wordEl.style.fontSize = (wordPx * B_K) + 'px'; sayEl.style.fontSize = (sayPx * B_K) + 'px';
    var wy = H * 0.1, wh = wordEl.offsetHeight / B_K;
    wordW = wordEl.offsetWidth / B_K; sayW = sayEl.offsetWidth / B_K;
    wordB = bAt(leftEdge, wy, B_WORD_R, K0);
    sayB = bAt(leftEdge + wordPx * 0.08, wy + wh + sayPx / 0.8 * 0.7, B_WORD_R, K0);

    // when things happen, in screens from the section's top
    var picksIn = (marks.picks ? marks.picks.top : 4) - 1;                 // the first post's card is at the foot of the screen
    T.b0 = picksIn - 0.2; T.b1 = picksIn + (tall ? 1.1 : 0.8);
    T.rm1 = 0.7; T.rm2 = picksIn + 0.25;

    CD = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1 : 2);          // (look B's own rule for its air)
    DPR = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1.5 : 2);
    airCv.width = Math.round(W * CD); airCv.height = Math.round(H * CD);
    lightCv.width = Math.round(W * DPR); lightCv.height = Math.round(H * DPR);
    beamCv.width = Math.ceil(W / BS); beamCv.height = Math.ceil(H / BS);
    cache.clear(); kDone[0] = -1; dockK = -2; beamKey = ''; soundCard.style.transform = ''; nowCard.style.transform = '';
  }

  // ------------------------------------------------------------------ the reel's light
  // Each clip carries its own colour, six times a second, in a 3 x 2 grid: the garden is lit from that, never from the
  // video's pixels, so a held frame has the right light too.
  var cells = new Float32Array(18);            // the six colours now, 0..1
  function sample(i, tm) {
    var a = tracks[i], n = a.length / 18, x = clamp(tm * REEL.fps, 0, n - 1), k0 = Math.floor(x), k1 = Math.min(n - 1, k0 + 1), f = x - k0;
    for (var j = 0; j < 18; j++) cells[j] = lerp(a[k0 * 18 + j], a[k1 * 18 + j], f) / 255;
  }
  var want = [0, 0, 0], kNow = [0, 0, 0], kDone = [-1, -1, -1], lum = 0, beamCol = [255, 240, 210], cutAt = -100;
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
  var glowImg = new Image(), chan = null, glowAt = -1, GS = 0.5;
  glow.width = Math.round(GLOW.w * GS); glow.height = Math.round(GLOW.h * GS);
  glowImg.decoding = 'async'; glowImg.src = IMG + 'film/garden-glow.webp';
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
  }

  // ------------------------------------------------------------------ the reel: two players, the one on the cloth and the next one, ready
  var start = clamp(parseInt(qs.get('m'), 10) || 0, 0, N - 1);
  var P = vids[0], Q = vids[1];                      // P: the clip that is on, or about to be. Q: the other player
  // i: the moment the reel is on. shown, vis: the moment whose picture is on the cloth, and the player showing it
  // seen: the cloth shows the film (not look B's white light). active: this chapter holds the screen
  var reel = { i: start, shown: -1, vis: null, started: false, soundOn: false, active: false, seen: false, rmPlaying: false, fails: 0 };
  function clipUrl(i) { return '/media/tea/film/' + CLIPS[i].file + '.mp4'; }
  function posterUrl(i) { return IMG + 'film/poster/' + CLIPS[i].file + '.webp'; }
  function load(v, i) { v.dataset.i = String(i); v.muted = !reel.soundOn; v.preload = 'auto'; v.src = clipUrl(i); v.load(); }
  function wantsPlay() { return alive && reel.started && reel.active && reel.seen && !document.hidden && !STILL && (!RM || reel.rmPlaying); }
  function tryPlay(v) {
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function (err) {
      // a browser that will not play with sound without a fresh press: go on muted, and say so on the switch
      if (err && err.name === 'NotAllowedError' && !v.muted) { setSound(false); var again = v.play(); if (again && again.catch) again.catch(function () {}); }
    });
  }
  function showClip(v) {                              // this clip's first frame is on the cloth: now it is the one seen
    if (!alive || v !== P || (reel.vis === P && reel.shown === reel.i)) return;
    P.classList.add('on'); Q.classList.remove('on');
    reel.vis = P; reel.shown = reel.i; reel.fails = 0;
    cutAt = performance.now() / 1000;
    setCard(reel.i);
    load(Q, (reel.i + 1) % N);                         // only now does the next one start to load
  }
  function onPlaying(e) {
    var v = e.target;
    if (v !== P || (reel.vis === P && reel.shown === reel.i)) return;
    if (v.requestVideoFrameCallback) { v.requestVideoFrameCallback(function () { showClip(v); }); setTimeout(function () { showClip(v); }, 260); } else showClip(v);
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
    if (!alive || v !== P || !v.getAttribute('src')) return;
    reel.fails++;
    if (reel.fails <= N) advance();                    // a clip that will not load is passed over; if none will, the poster stays
  }
  [P, Q].forEach(function (v) {
    v.addEventListener('playing', onPlaying); v.addEventListener('ended', onEnded); v.addEventListener('error', onError);
    v.volume = 0.9;
  });
  function sync() {                                   // play when the film can be seen, pause when it cannot
    if (!reel.started) return;
    if (wantsPlay()) {
      if (P.dataset.i !== String(reel.i)) load(P, reel.i);
      if (P.paused && !P.ended) tryPlay(P);
    } else {
      if (!P.paused) P.pause();
      if (!Q.paused) Q.pause();
      // on the title shot the first clip is fetched, so the film is there when the camera reaches the cloth
      if (reel.active && !HELD && !document.hidden && P.dataset.i !== String(reel.i)) load(P, reel.i);
    }
  }
  function clipTime() { return reel.vis ? reel.vis.currentTime : 0; }

  // ------------------------------------------------------------------ the card that names what is on, and the sound
  function setCard(i) {
    if (cardFor === i) return;
    cardFor = i;
    var c = CLIPS[i];
    nowCount.textContent = (i + 1) + ' of ' + N; nowId.textContent = c.id;
    nowTitle.textContent = c.title; nowWhat.textContent = c.what;
    if (c.href) { nowGo.hidden = false; nowNone.hidden = true; nowGo.href = SITE + c.href; nowGo.setAttribute('aria-label', 'Read the post about ' + c.title); } else { nowGo.hidden = true; nowNone.hidden = false; }
    for (var j = 0; j < N; j++) { ticks[j].li.className = j < i ? 'done' : ''; if (j !== i) { ticks[j].bar.style.transform = ''; ticks[j].last = ''; } }
    if (!reel.vis && poster.getAttribute('src') !== posterUrl(i)) { got.poster = false; poster.src = posterUrl(i); wait(poster, 'poster'); }
    for (var s = 0; s < stillBtns.length; s++) stillBtns[s].setAttribute('aria-current', s === i ? 'true' : 'false');
  }
  function setTick(i, p) {
    var tr = 'scaleX(' + clamp(p).toFixed(3) + ')';
    if (ticks[i].last !== tr) { ticks[i].bar.style.transform = tr; ticks[i].last = tr; }
  }
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

  // ------------------------------------------------------------------ motion off: the stills in the page, and a button that plays
  var stillBtns = Array.prototype.slice.call(section.querySelectorAll('.film-stills button[data-m]')), rmRaf = 0;
  function rmLoop() { rmRaf = 0; if (!alive || !reel.rmPlaying) return; options.redraw(); rmRaf = requestAnimationFrame(rmLoop); }
  function setPlaying(on) {
    reel.rmPlaying = on;
    playBtn.classList.toggle('is-playing', on); playWord.textContent = on ? 'Pause' : 'Play the reel';
    if (on) { reel.started = true; if (!rmRaf) rmRaf = requestAnimationFrame(rmLoop); }
    sync(); options.redraw();
  }
  function pickStill(i) {                              // a still was pressed: it goes on the cloth, and the page goes to the cloth
    if (reel.rmPlaying && reel.started) advance(i);
    else {
      if (!P.paused) P.pause();
      reel.i = i; reel.shown = -1; reel.vis = null; P.classList.remove('on'); Q.classList.remove('on');
      cardFor = -1; setCard(i);
    }
    var r = section.getBoundingClientRect();
    window.scrollTo(0, Math.round(r.top + window.scrollY + (T.a1 + 0.25) * H));
    options.redraw();
  }
  function onStill(e) { var b = e.target.closest('button[data-m]'); if (b) pickStill(parseInt(b.dataset.m, 10) || 0); }
  var stillsEl = section.querySelector('.film-stills');
  if (RM) {
    playBtn.hidden = false;
    playBtn.addEventListener('click', function () { setPlaying(!reel.rmPlaying); });
    if (stillsEl) stillsEl.addEventListener('click', onStill);
  }
  function onVisibility() { sync(); options.redraw(); }
  document.addEventListener('visibilitychange', onVisibility);

  // ------------------------------------------------------------------ what drifts in the air
  // (look B's own petals, in look B's own hand: at the title shot the first sixteen are exactly its)
  function drawPetals(cam, t, a16, aRest) {
    var spanZ = 1.05, n = tall ? 26 : petals.length;
    for (var i = 0; i < n; i++) {
      var alpha = i < 16 ? a16 : aRest; if (alpha <= 0.003) continue;
      var p = petals[i];
      var dz = ((p.d - cam.m) % spanZ + spanZ) % spanZ; if (dz < 0.035) continue;
      var z = 1 / dz, fall = (p.y + t * p.sp) % 1;
      var wx = (p.x * 900 + Math.sin(t * p.sw * 0.6 + p.ph) * 38) * (0.4 + dz), wy = (fall * 1300 - 760) * (0.35 + dz * 0.8);
      var sx = W / 2 + (wx - cam.C[0]) / dz * S0, sy = H / 2 + (wy - cam.C[1]) / dz * S0;
      var size = 5.2 * z * S0; if (size > 70) continue;
      if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;
      var near = clamp((size - 9) / 40);
      ax.save();
      ax.translate(sx, sy); ax.rotate(p.rot + t * p.rs * 0.5);
      ax.scale(1, 0.62 + 0.3 * Math.sin(t * p.rs + p.ph));
      ax.globalAlpha = alpha * lerp(0.92, 0.3, near) * clamp((dz - 0.035) / 0.05);
      ax.fillStyle = p.tone > 0.5 ? '#f3b3c6' : '#cf8ea8';
      ax.beginPath(); ax.moveTo(-size, 0); ax.quadraticCurveTo(0, -size * 0.85, size, 0); ax.quadraticCurveTo(0, size * 0.55, -size, 0); ax.fill();
      ax.restore();
    }
  }
  function drawFlies(cam, t, alpha) {
    if (alpha <= 0.003) return;
    for (var i = 0; i < flies.length; i++) {
      var f = flies[i], dz = f.d - cam.m; if (dz < 0.1) continue;
      var bx0 = f.x - CX + Math.sin(t * f.sp + f.ph) * 46, by0 = f.y - CY + Math.cos(t * f.sp * 1.3 + f.ph) * 22;
      var p = proj([bx0, by0], f.d, cam);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
      var tw = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9 + f.ph * 3), 2), rad = Math.max(1.1, 2.6 * S0 * p.z);
      var gl = ax.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 4.2);
      gl.addColorStop(0, 'rgba(255,224,160,0.95)'); gl.addColorStop(0.22, 'rgba(255,216,146,0.5)'); gl.addColorStop(1, 'rgba(255,216,146,0)');
      ax.globalAlpha = alpha * tw; ax.fillStyle = gl;
      ax.beginPath(); ax.arc(p.x, p.y, rad * 4.2, 0, 6.283); ax.fill();
    }
  }
  function drawStars(cam, t, alpha) {                  // only a tall screen sees the sky above the plate
    if (alpha <= 0.003) return;
    ax.fillStyle = '#dfe3ff';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], xy = plateXY([s.x, s.y], cam);
      if (xy[0] < 0 || xy[0] > W || xy[1] < 0 || xy[1] > H) continue;
      ax.globalAlpha = alpha * (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)));
      ax.beginPath(); ax.arc(xy[0], xy[1], s.s, 0, 6.283); ax.fill();
    }
  }

  // ------------------------------------------------------------------ the beam
  // Look B's beam, as look B draws it over its title shot: one wedge of warm light and the dust turning in it.
  function drawBeamB(cam, t, L, k) {
    if (k <= 0.003) return;
    var q = B_CLOTH.map(function (c) { return plateXY(c, cam); }), fl = 0.9 + 0.1 * (flick(t, 5) - 0.86) / 0.14;
    var g = ax.createLinearGradient(L[0], L[1], (q[0][0] + q[3][0]) / 2, (q[0][1] + q[3][1]) / 2);
    g.addColorStop(0, 'rgba(255,244,214,' + (0.34 * k * fl) + ')'); g.addColorStop(1, 'rgba(255,244,214,' + (0.07 * k * fl) + ')');
    ax.globalAlpha = 1; ax.fillStyle = g;
    ax.beginPath(); ax.moveTo(L[0], L[1]); ax.lineTo(q[0][0], q[0][1]); ax.lineTo(q[1][0], q[1][1]); ax.lineTo(q[2][0], q[2][1]); ax.lineTo(q[3][0], q[3][1]); ax.closePath(); ax.fill();
    for (var i = 0; i < bDust.length; i++) {
      var d = bDust[i], u = (d.u + t * d.sp * 0.25) % 1, v = d.v * 0.8 + Math.sin(t * 0.4 + d.ph) * 0.1;
      var tp = [lerp(L[0], q[0][0], u), lerp(L[1], q[0][1], u)], bt = [lerp(L[0], q[3][0], u), lerp(L[1], q[3][1], u)];
      var x = lerp(tp[0], bt[0], v * 0.5 + 0.5), y = lerp(tp[1], bt[1], v * 0.5 + 0.5);
      ax.globalAlpha = k * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.ph * 5))) * (1 - u * 0.6);
      ax.fillStyle = '#fff3d2'; ax.beginPath(); ax.arc(x, y, 1.1 + (1 - u) * 1.4, 0, 6.283); ax.fill();
    }
    ax.globalAlpha = 0.07 * k * fl; ax.fillStyle = '#fff6de';
    ax.beginPath(); ax.moveTo(q[0][0], q[0][1]); ax.lineTo(q[1][0], q[1][1]); ax.lineTo(q[2][0], q[2][1]); ax.lineTo(q[3][0], q[3][1]); ax.closePath(); ax.fill();
    ax.globalAlpha = 1;
  }
  // The reel's beam is painted small and laid over the screen four times larger, so it has no edge anywhere: a fan of
  // light from the lens, in the colours of the picture it carries, thinning out as it nears the cloth. It is the
  // dearest thing in the chapter to paint, so while the camera stands still it is painted afresh twenty times a
  // second, not sixty.
  var beamCv = document.createElement('canvas'), bx = beamCv.getContext('2d'), BS = 4, canConic = !!bx.createConicGradient, beamAt = -1, beamKey = '';
  function wrapA(a) { while (a > Math.PI) a -= 6.2832; while (a < -Math.PI) a += 6.2832; return a; }
  function drawBeam(cam, t, lens, k, wide, pj) {
    var fq = FILMQ.map(function (p) { return plateXY(p, cam); }), i, j;
    var fl = HELD ? 1 : 0.94 + 0.06 * Math.sin(t * 23.0) * Math.sin(t * 7.3);          // the lamp is never quite steady
    var mid = plateXY(FOCUS, cam), ac = Math.atan2(mid[1] - lens[1], mid[0] - lens[0]), dist = Math.hypot(mid[0] - lens[0], mid[1] - lens[1]);
    var lo = 9, hi = -9;
    for (i = 0; i < 4; i++) { var d = wrapA(Math.atan2(fq[i][1] - lens[1], fq[i][0] - lens[0]) - ac); if (d < lo) lo = d; if (d > hi) hi = d; }
    var spanA = hi - lo, soft = spanA * 0.2;
    // the shadow the stool throws on the lawn
    if (pj) {
      var sx = pj.x + pj.w * 0.47, sy = pj.y + pj.h * 0.985, rx = pj.w * 0.42, ry = pj.w * 0.085;
      if (sy - ry < H) {
        lx.save(); lx.translate(sx, sy); lx.scale(1, ry / rx);
        var sh = lx.createRadialGradient(0, 0, 0, 0, 0, rx);
        sh.addColorStop(0, 'rgba(6,8,14,0.62)'); sh.addColorStop(0.55, 'rgba(6,8,14,0.34)'); sh.addColorStop(1, 'rgba(6,8,14,0)');
        lx.globalAlpha = clamp(k * 1.6); lx.fillStyle = sh; lx.beginPath(); lx.arc(0, 0, rx, 0, 6.2832); lx.fill(); lx.restore();
      }
    }
    if (canConic && spanA > 0.02 && spanA < 3) {
      var bw = beamCv.width, bh = beamCv.height, L0 = lens[0] / BS, L1 = lens[1] / BS;
      var key = scaleOf(cam).toFixed(4) + ':' + mid[0].toFixed(1) + ':' + mid[1].toFixed(1) + ':' + lens[0].toFixed(1) + ':' + lens[1].toFixed(1) + ':' + bw, nowMs = performance.now();
      if (key !== beamKey || nowMs - beamAt > 48 || HELD) {
        beamKey = key; beamAt = nowMs;
        bx.setTransform(1, 0, 0, 1, 0, 0); bx.globalCompositeOperation = 'source-over'; bx.globalAlpha = 1; bx.clearRect(0, 0, bw, bh);
        // where across the fan each sixth of the picture lies
        var ca = [];
        for (j = 0; j < 6; j++) { var cc = plateXY(onFilm((j % 3 + 0.5) / 3, (j < 3 ? 0.5 : 1.5) / 2), cam); ca.push((wrapA(Math.atan2(cc[1] - lens[1], cc[0] - lens[0]) - ac) - lo) / spanA); }
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
          cg.addColorStop((soft + u * spanA) / turn, 'rgba(' + Math.round(255 * (0.6 * r / mx + 0.4)) + ',' + Math.round(255 * (0.6 * g / mx + 0.38)) + ',' + Math.round(255 * (0.6 * b / mx + 0.34)) + ',' + al.toFixed(3) + ')');
        }
        cg.addColorStop(Math.min(0.999, (2 * soft + spanA) / turn + 0.0005), 'rgba(255,240,210,0)');
        bx.fillStyle = cg; bx.fillRect(0, 0, bw, bh);
        // along its length: brightest at the lens, nearly gone where it meets the cloth
        var D = dist / BS, rg = bx.createRadialGradient(L0, L1, 0, L0, L1, D * 1.12);
        rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.1, 'rgba(0,0,0,0.86)'); rg.addColorStop(0.45, 'rgba(0,0,0,0.62)'); rg.addColorStop(0.85, 'rgba(0,0,0,0.36)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        bx.globalCompositeOperation = 'destination-in'; bx.fillStyle = rg; bx.fillRect(0, 0, bw, bh);
        // the picture outshines the beam that crosses it
        bx.globalCompositeOperation = 'destination-out'; bx.fillStyle = 'rgba(0,0,0,0.82)';
        bx.beginPath(); bx.moveTo(fq[0][0] / BS, fq[0][1] / BS); bx.lineTo(fq[1][0] / BS, fq[1][1] / BS); bx.lineTo(fq[2][0] / BS, fq[2][1] / BS); bx.lineTo(fq[3][0] / BS, fq[3][1] / BS); bx.closePath(); bx.fill();
      }
      lx.globalAlpha = clamp(k * fl * (wide && tall ? 0.7 : 1)); lx.imageSmoothingEnabled = true;
      lx.drawImage(beamCv, 0, 0, bw, bh, 0, 0, bw * BS, bh * BS);
      lx.globalAlpha = 1;
    }
    // dust turning over in the light
    lx.fillStyle = 'rgb(' + beamCol[0] + ',' + beamCol[1] + ',' + beamCol[2] + ')';
    for (i = 0; i < dust.length; i++) {
      var du = dust[i], uu = HELD ? du.u : (du.u + t * du.sp * 0.3) % 1;
      var e = onFilm(clamp(du.v + (HELD ? 0 : Math.sin(t * 0.31 + du.ph) * 0.06)), clamp(du.w + (HELD ? 0 : Math.cos(t * 0.27 + du.ph) * 0.07)));
      var end = plateXY(e, cam), x = lerp(lens[0], end[0], 0.06 + uu * 0.8), y = lerp(lens[1], end[1], 0.06 + uu * 0.8);
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      lx.globalAlpha = k * (0.18 + 0.5 * (0.5 + 0.5 * Math.sin((HELD ? 0 : t * 1.3) + du.ph * 5))) * (1 - uu * 0.55);
      lx.beginPath(); lx.arc(x, y, (0.7 + (1 - uu) * 1.5) * (wide ? 0.8 : 1.25), 0, 6.283); lx.fill();
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
  var spin = 0, lastNow = 0, dockK = -2, shadeO = -1, filmTr = '', laid = false;
  function mixP(A, B, k) { return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), w: lerp(A.w, B.w, k) }; }
  function frame(q, t) {
    if (!alive) return false;
    if (!laid) { layout(); laid = true; setCard(reel.i); }
    var now = performance.now(), dt = Math.min(0.1, (now - lastNow) / 1000 || 0.016); lastNow = now;
    var p = q * span, e1, e2, e3;
    if (RM) { e1 = p < T.rm1 ? 0 : 1; e2 = p < T.rm2 ? 0 : 1; e3 = e2; }            // nothing glides: three stills, changed by a cut
    else { e1 = io(ss(T.a0, T.a1, p)); e2 = io(ss(T.b0, T.b1, p)); e3 = ss(T.b1, Math.max(T.b1 + 0.5, span), p); }
    // (before the cloth the camera never quite stands still: it creeps in while the reel is watched, as look B's does)
    var creep = RM ? 0 : ss(T.a1, T.b0 + 0.1, p), K1c = creep > 0 ? between(K1, K1b, creep) : K1;
    var cam = e2 <= 0 ? (e1 < 1 ? between(K0, K1, e1) : K1c) : e3 <= 0 ? between(K1c, K2, e2) : between(K2, K3, e3);
    var s = scaleOf(cam), o = plateXY([0, 0], cam), close = e1 * (1 - e2);

    // look B's white light gives way to the film
    var lit = 1 - ss(0.12, 0.5, e1), seen = lit < 0.999;
    if (seen !== reel.seen) { reel.seen = seen; sync(); }
    var plateTr = box(o[0], o[1], PW * s, PW);
    setT(litImg, plateTr); setO(litImg, lit); setV(litImg, lit > 0.002);
    setV(nightBox, seen);
    if (seen) {
      setT(nightImg, plateTr);
      setT(sky, 'translate3d(' + (o[0] - 3000 * s).toFixed(2) + 'px,' + (o[1] - 3000 * s).toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')');
      setT(lawn, 'translate3d(' + (o[0] - 3000 * s).toFixed(2) + 'px,' + (o[1] + 1380 * s).toFixed(2) + 'px,0) scale(' + s.toFixed(5) + ')');
      setT(glow, 'translate3d(' + (o[0] + GLOW.x * s).toFixed(2) + 'px,' + (o[1] + GLOW.y * s).toFixed(2) + 'px,0) scale(' + (s / GS).toFixed(5) + ')');
      // the picture on the cloth: 1280 x 720, leaned onto the cloth by one matrix
      var h = filmH, m3 = [s * h[0] + o[0] * h[6], s * h[3] + o[1] * h[6], 0, h[6], s * h[1] + o[0] * h[7], s * h[4] + o[1] * h[7], 0, h[7], 0, 0, 1, 0, s * h[2] + o[0], s * h[5] + o[1], 0, 1];
      var ftr = 'matrix3d(' + m3.map(function (v) { return +v.toFixed(7); }).join(',') + ')';
      if (ftr !== filmTr) { film.style.transform = ftr; filmTr = ftr; }
      // the light: what the film is showing now
      var pulse = HELD ? 0 : Math.exp(-(now / 1000 - cutAt) * 9);          // a splice passing the gate: the lamp dips for a blink
      var cur = reel.shown >= 0 ? reel.shown : reel.i;
      sample(cur, clipTime()); readLight();
      var rate = HELD ? 1 : 1 - Math.exp(-dt * 9);
      for (var c = 0; c < 3; c++) kNow[c] += (want[c] * (1 - 0.3 * pulse) - kNow[c]) * rate;
      paintGlow(now);
      setTick(cur, reel.vis && reel.vis.duration ? reel.vis.currentTime / reel.vis.duration : (HELD ? 0.4 : 0));
    }

    // the name leaves as look B's words do: whole, to the left wing, as the camera sets off
    var wl = e2 > 0 ? 1 : io(ss(0.015, 0.3, e1)), wsl = e2 > 0 ? 1 : io(ss(0.005, 0.24, e1));
    if (wl < 0.9995) {
      var wp = proj(wordB, B_WORD_R, cam), sp2 = proj(sayB, B_WORD_R, cam), zk = wp.z / (B_WORD_R / (B_WORD_R - B_M));
      setT(wordEl, 'translate3d(' + (wp.x - wl * (Math.max(wp.x, 0) + wordW * zk + 30)).toFixed(2) + 'px,' + wp.y.toFixed(2) + 'px,0) scale(' + (zk / B_K).toFixed(5) + ')');
      setT(sayEl, 'translate3d(' + (sp2.x - wsl * (Math.max(sp2.x, 0) + sayW * zk + 30)).toFixed(2) + 'px,' + sp2.y.toFixed(2) + 'px,0) scale(' + (zk / B_K).toFixed(5) + ')');
    }
    setV(wordEl, wl < 0.9995); setV(sayEl, wsl < 0.9995);

    // the projector and the near leaves
    var kp = e2 <= 0 ? io(e1) : 1 - io(e2), pjP = mixP(PJ0, PJ1, kp);
    var pj = { x: pjP.x - pjP.w / 2, y: pjP.y - pjP.w * 1009 / 618, w: pjP.w, h: pjP.w * 1009 / 618 };
    setT(projEl, box(pj.x, pj.y, pj.w, 618));
    var bk = clamp(e2 <= 0 ? e1 : 1 - e2), bw2 = BU0.w * (1 + 1.4 * bk), bxp = BU0.x + bk * W * 0.5, byp = BU0.y + bk * H * 0.42;
    setV(bushEl, bk < 0.97);
    if (bk < 0.97) setT(bushEl, box(bxp - bw2 / 2, byp - bw2 * 209 / 401 / 2, bw2, 490));
    // the reels turn while the film runs (their faces are leaning ovals: squared up, turned, leaned back). Under
    // look B's white light the projector is look B's own picture, its reels as painted
    setO(reelA, 1 - lit); setO(reelB, 1 - lit);
    if (!HELD && seen && reel.vis && !reel.vis.paused) {
      spin += dt * 1.15;
      reelA.style.transform = 'scaleX(0.8919) rotate(' + spin.toFixed(3) + 'rad) scaleX(1.1212)';
      reelB.style.transform = 'scaleX(0.8077) rotate(' + (spin * 0.86 + 0.6).toFixed(3) + 'rad) scaleX(1.2381)';
    }

    // the beams and what floats in them
    var lens = [pj.x + pj.w * LENS[0], pj.y + pj.h * LENS[1]];
    lx.setTransform(DPR, 0, 0, DPR, 0, 0); lx.clearRect(0, 0, W, H);
    var kD = ss(0.1, 0.45, e1);
    if (kD > 0.003) drawBeam(cam, t, lens, kD * (0.55 + 0.45 * (1 - (HELD ? 0 : Math.exp(-(now / 1000 - cutAt) * 9)))) * (0.75 + 0.25 * close), close < 0.5, pj);
    ax.setTransform(CD, 0, 0, CD, 0, 0); ax.clearRect(0, 0, W, H);
    if (tall) drawStars(cam, t, 1 - lit);
    drawBeamB(cam, t, lens, 1 - ss(0.04, 0.34, e1));
    drawFlies(cam, t, 0.9 * ss(0.2, 0.5, e1) * clamp(1 - ss(0.45, 0.8, e1) + e2));
    drawPetals(cam, t, lerp(0.9, 0.85, e1), 0.85 * ss(0.08, 0.5, e1));
    ax.globalAlpha = 1;

    // the page's own furniture
    var so = Math.round(close * 0.9 * 100) / 100;
    if (so !== shadeO) { shade.style.opacity = so; shadeO = so; }
    var dk = RM ? (e1 > 0 ? 1 : 0) : Math.round(io(ss(T.dockA, T.dockB, p)) * 200) / 200;
    if (dk !== dockK) {
      // the cards come up from under the frame, whole: never half-transparent over the lawn
      dock.style.visibility = dk > 0.005 ? '' : 'hidden';
      dock.style.transform = dk >= 1 ? 'none' : 'translate3d(0,' + ((1 - dk) * (dock.offsetHeight + 60)).toFixed(1) + 'px,0)';
      dockK = dk;
    }
    // on a wide screen the sound's card stands beside the other one; before the posts come up the left side it
    // steps over it, out of their way
    if (!tall) {
      var sk = RM ? e2 : io(ss(T.b0 - 0.25, T.b0 + 0.18, p));
      setT(soundCard, sk <= 0 ? 'none' : 'translate3d(' + (sk * (soundCard.offsetWidth + 12)).toFixed(1) + 'px,' + (-sk * (nowCard.offsetHeight + 10)).toFixed(1) + 'px,0)');
    } else {
      // on a tall screen the card that names the film steps down behind the sound while the posts pass, and comes
      // back for the page's last picture
      var nk = RM ? (e2 > 0 && p < span - 0.2 ? 1 : 0) : io(ss(T.b0 - 0.05, T.b0 + 0.22, p)) * (1 - io(ss(span - 0.42, span - 0.08, p)));
      setT(nowCard, nk <= 0 ? 'none' : 'translate3d(0,' + (nk * (nowCard.offsetHeight + soundCard.offsetHeight + 60)).toFixed(1) + 'px,0)');
    }
    if (RM) {                                          // the play button stands on the bare cloth under the picture, not on the picture
      var show = e1 > 0;
      if (playBtn.hidden === show) playBtn.hidden = !show;
      if (show) {
        var pb = plateXY(onFilm(0.5, 1), cam), pc = plateXY(carry(clothH, 0.5, 1), cam), mid = [(pb[0] + pc[0]) / 2, (pb[1] + pc[1]) / 2 - 2];
        setT(playBtn, 'translate3d(' + Math.round(mid[0] - playBtn.offsetWidth / 2) + 'px,' + Math.round(mid[1] - playBtn.offsetHeight / 2) + 'px,0)');
      }
    }
    // whole: look B's plate is in; and once the film shows, the night plate, its light and the first frame are in too
    return got.lit && (!seen || (got.night && got.glow && got.poster && (kDone[0] >= 0 || !glowImg.naturalWidth)));
  }

  wait(litImg, 'lit'); wait(nightImg, 'night'); wait(glowImg, 'glow');

  return {
    frame: frame,
    resize: function () { if (laid) layout(); },
    setActive: function (on) {
      reel.active = on;
      if (on && !HELD) reel.started = true;
      sync();
    },
    dispose: function () {
      alive = false;
      cancelAnimationFrame(rmRaf);
      document.removeEventListener('visibilitychange', onVisibility);
      if (stillsEl) stillsEl.removeEventListener('click', onStill);
      [P, Q].forEach(function (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (err) { /* it is going anyway */ } });
    },
    // for tests: hold the reel on one moment's first frame, so two pictures of the same place can be compared
    hold: function (i) {
      reel.started = false; [P, Q].forEach(function (v) { if (!v.paused) v.pause(); v.classList.remove('on'); });
      reel.i = i || 0; reel.shown = -1; reel.vis = null; cardFor = -1; setCard(reel.i); kDone[0] = -1;
      spin = 0; reelA.style.transform = ''; reelB.style.transform = ''; options.redraw();
    },
    reel: reel
  };
}
