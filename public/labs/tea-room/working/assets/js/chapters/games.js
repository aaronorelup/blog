/* THE GAMES CHAPTER: Storm Bell Fighter's own arena, alive (grown from the test tests/storm-bell-backdrop/; the arena
   itself is games-arena.js, the game's layers, mud, props, fighters and shaders, as the test has them).

   How it joins: the film chapter ends by going into its cloth (film.js, its .film-dive). Through that dive this
   chapter is drawn over the film's picture (its lead in chapters.js), and throws the arena onto exactly the place on
   the cloth where the film's picture is (join.js: JOIN, written by film.js in the same frame): the reel gives way to
   the arena on the cloth, the camera goes on in until the cloth's edges have left the frame, and the arena is the
   world. Then the camera goes on into the arena, the game's card waits under the two fighters, the four posts pass
   beside them; and at the end the camera comes back out of the cloth into the night garden (drawn here: the film
   chapter is let go by then), where the arena goes on playing on the cloth under the closing beat.

   Everything drawn is a function of q (the chapter's progress, which is the camera) and the time (the rain, the
   fires, the fighters' timetable). With motion turned off there is no 3D at all: a still of the arena, changed by
   cuts. */
import { PW, PH, FOCUS, GLOW, FILMQ, FILM_MID, FILM_HGT, JOIN, diveEnd, arenaAt, squared, endPlate, nameRightOf } from './join.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var CX = PW / 2, CY = PH / 2, GS = 0.5, LENS = [0.948, 0.467];
var T_HELD = 9.0;                                 // a held frame shows the arena at this moment (the test's own)
var SHIFT = 0.24;                                  // how far the fighters step right while the posts pass (of the screen's width)
var A_LEAD = 0.26;                                // how far into the arena the camera has come when the dive ends
// the arena's light on the lawn: the storm's grey, a little blue (film.js lights the lawn the same while it dives)
var LIGHT = [154, 154, 184];
var HOLD = 1.0;                                    // the garden holds this many screens at the end (chapters.css: .games-foot), under
                                                  // the next chapter's name; the projector leaves for the left wing in it
var EDGE = 600;                                   // how far left of the plate the plain sky and lawn reach (plate pixels; on under
                                                  // the plate's faded first 260, games.css)

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, marks = options.marks;
  var root = document.documentElement, alive = true, active = false;

  host.innerHTML =
    '<div class="gm-garden">' +
      '<div class="gm-ext gm-sky"></div><div class="gm-ext gm-lawn"></div><canvas class="gm-edge" width="60" height="768"></canvas>' +
      '<img class="gm-plate" src="' + IMG + 'film/garden-night.webp" width="2752" height="1536" alt="" decoding="async">' +
      '<canvas class="gm-glow"></canvas>' +
    '</div>' +
    '<div class="gm-arena"><canvas class="gm-gl"></canvas><img class="gm-still" data-k="wide" alt="" decoding="async" hidden><img class="gm-still" data-k="tall" alt="" decoding="async" hidden><img class="gm-still" data-k="aside" alt="" decoding="async" hidden></div>' +
    '<canvas class="gm-light"></canvas>' +
    '<div class="gm-proj"><img src="' + IMG + 'prop-projector.webp" width="618" height="1009" alt="">' +
      '<img class="gm-reel gm-reel-a" src="' + IMG + 'film/reel-a.webp" width="206" height="230" alt="">' +
      '<img class="gm-reel gm-reel-b" src="' + IMG + 'film/reel-b.webp" width="176" height="216" alt=""></div>';
  var pick = function (sel) { return host.querySelector(sel); };
  var edge = pick('.gm-edge'), garden = pick('.gm-garden'), sky = pick('.gm-sky'), lawn = pick('.gm-lawn'), plate = pick('.gm-plate'), glow = pick('.gm-glow');
  var arenaBox = pick('.gm-arena'), canvas = pick('.gm-gl'), stillW = pick('.gm-still[data-k=wide]'), stillT = pick('.gm-still[data-k=tall]'), stillA = pick('.gm-still[data-k=aside]'), still = null, lightCv = pick('.gm-light'), proj = pick('.gm-proj');
  var reelA = pick('.gm-reel-a'), reelB = pick('.gm-reel-b');
  var lx = lightCv.getContext('2d'), gx = glow.getContext('2d');

  // ------------------------------------------------------------------ what has come in
  var got = { plate: false, glow: false, wide: false, tall: false, aside: false }, arena = null, failed = false, flash = 0;
  function wait(im, key) {
    var done = function () { if (!alive) return; got[key] = true; options.redraw(); };
    if (im.complete && im.naturalWidth) { (im.decode ? im.decode() : Promise.resolve()).then(done, done); return; }
    im.addEventListener('load', function () { (im.decode ? im.decode() : Promise.resolve()).then(done, done); }, { once: true });
    im.addEventListener('error', done, { once: true });
  }
  wait(plate, 'plate');
  // (what the end's camera sees left of the plate: plain sky over plain lawn, each row the colour of the plate's own
  // left part without its clouds, stars and petals (a darker-than-most pixel of the row); the plate's left edge fades
  // into it, games.css)
  var edgeDone = false;
  function drawEdge() {
    if (edgeDone || !plate.naturalWidth) return; edgeDone = true;
    var c = document.createElement('canvas'), SW = 200, x = c.getContext('2d', { willReadFrequently: true }), ex = edge.getContext('2d');
    c.width = SW; c.height = edge.height;
    x.drawImage(plate, 0, 0, 400, PH, 0, 0, SW, edge.height);
    var px = x.getImageData(0, 0, SW, edge.height).data, row = new Array(SW), out = ex.createImageData(1, edge.height);
    for (var y = 0; y < edge.height; y++) {
      for (var i = 0; i < SW; i++) { var o = (y * SW + i) * 4; row[i] = [px[o] * 0.3 + px[o + 1] * 0.59 + px[o + 2] * 0.11, o]; }
      row.sort(function (a, b) { return a[0] - b[0]; });
      var p = row[Math.floor(SW * 0.3)][1];
      out.data[y * 4] = px[p]; out.data[y * 4 + 1] = px[p + 1]; out.data[y * 4 + 2] = px[p + 2]; out.data[y * 4 + 3] = 255;
    }
    ex.putImageData(out, 0, 0); ex.imageSmoothingEnabled = false; ex.drawImage(edge, 0, 0, 1, edge.height, 0, 0, edge.width, edge.height);
  }
  // the lamp's light, once, in the arena's colour (added to the night plate; the lightning brightens it)
  var glowImg = new Image();
  glow.width = Math.round(GLOW.w * GS); glow.height = Math.round(GLOW.h * GS);
  glowImg.decoding = 'async';
  glowImg.onload = function () {
    if (!alive) return;
    gx.imageSmoothingQuality = 'high'; gx.drawImage(glowImg, 0, 0, glow.width, glow.height);
    gx.globalCompositeOperation = 'multiply'; gx.fillStyle = 'rgb(' + LIGHT.join(',') + ')'; gx.fillRect(0, 0, glow.width, glow.height);
    got.glow = true; options.redraw();
  };
  glowImg.onerror = function () { got.glow = true; };
  glowImg.src = IMG + 'film/garden-glow.webp';

  // the arena: the 3D scene (fetched now, with the chapter), or with motion off (or no WebGL) a still of it
  // (two stills: the arena as a wide screen and as a tall one sees it. The cloth is always wide: on a tall screen the
  // wide one is on the cloth and the tall one fills the screen)
  function useStill() {
    failed = true; canvas.hidden = true;
    stillW.src = IMG + 'games/still-hold-wide.webp'; wait(stillW, 'wide');
    if (W / H < 0.82) { stillT.src = IMG + 'games/still-hold-tall.webp'; wait(stillT, 'tall'); }
    if (W > 820) { stillA.src = IMG + 'games/still-aside-wide.webp'; wait(stillA, 'aside'); }
  }
  var W = root.clientWidth, H = window.innerHeight;
  if (RM) useStill();
  else {
    import('./games-arena.js').then(function (m) { return m.mount(canvas, {}); }).then(function (a) {
      if (!alive) { a.dispose(); return; }
      arena = a;
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); arena = null; if (alive) { useStill(); options.redraw(); } });
      options.redraw();
    }).catch(function (err) {
      if (!alive) return;
      if (window.console) console.warn('The arena could not start, a still stands in: ' + (err && err.message || err));
      useStill(); options.redraw();
    });
  }

  // ------------------------------------------------------------------ the garden's camera (as film.js has it)
  // The plate stands at distance 1; the camera is at (C, m), m how far in it has come; the plate is then 1 / (1 - m)
  // times its own size. A move between two places is a straight walk, at an even pace for the eye.
  function camOf(s, fx, fy, P) { P = P || FOCUS; return { m: 1 - 1 / s, C: [(W / 2 - (fx - P[0] * s)) / s - CX, (H / 2 - (fy - P[1] * s)) / s - CY] }; }
  function between(A, B, e) {
    var sA = 1 / (1 - A.m), sB = 1 / (1 - B.m), g = e;
    if (Math.abs(sB / sA - 1) > 0.02) g = ((1 - 1 / (sA * Math.pow(sB / sA, e))) - A.m) / (B.m - A.m);
    return { m: lerp(A.m, B.m, g), C: [lerp(A.C[0], B.C[0], g), lerp(A.C[1], B.C[1], g)] };
  }
  function scaleOf(cam) { return 1 / (1 - cam.m); }
  function plateXY(p, cam) { var s = scaleOf(cam); return [W / 2 + (p[0] - CX - cam.C[0]) * s, H / 2 + (p[1] - CY - cam.C[1]) * s]; }

  // ------------------------------------------------------------------ the layout
  var tall = false, narrow = false, span = 1, aLead = A_LEAD, aFrom = 0, KD, KE, PJE, PJI, T = {}, laid = false;
  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    tall = W / H < 0.9; narrow = W <= 820;
    host.classList.toggle('tall', tall);
    // (a tall screen's arena starts past the trench's wire posts, which would stand across the fighters on the cloth)
    aLead = W / H < 0.82 ? 0.44 : A_LEAD; aFrom = W / H < 0.82 ? 0.34 : 0;
    span = options.span();
    var cover = Math.max(W / PW, H / PH);
    var de = diveEnd(W, H);
    KD = camOf(de.s, W / 2, H / 2, FILM_MID);
    // the end: the night garden, the cloth to one side, room for the next chapter's name (closing.js) where it comes
    var rail = narrow ? 0 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172);
    // (the end's view is reckoned in join.js, endPlate: the art chapter's turn starts from exactly this picture)
    var ep = endPlate(W, H, nameRight());
    KE = camOf(ep.s, ep.x + FOCUS[0] * ep.s, ep.y + FOCUS[1] * ep.s);
    if (!tall) {
      var pw = clamp(H * 0.3, 150, 280);
      PJE = { x: Math.max(rail + 40 + pw * 0.5, W * 0.43), y: H * 1.08, w: pw };
    } else {
      var pw3 = clamp(W * 0.34, 120, 210);
      PJE = { x: Math.max(W * 0.26, pw3 * 0.62), y: H * 0.99, w: pw3 };
    }
    PJI = { x: PJE.x - (tall ? W * 0.5 : W * 0.32), y: PJE.y + H * 0.95, w: PJE.w * 2.2 };
    // when things happen, in screens from the section's top
    T.bell = marks.bell ? marks.bell.top : 0.7;               // the game's card has come up under the fighters
    T.picks = marks.picks ? marks.picks.top : 3;              // the first post's top
    T.all = marks.all ? marks.all.top : 5;
    T.out0 = marks.foot ? marks.foot.top - 0.45 : span - 1.2; // the camera starts back out of the cloth
    var d = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1.5 : 2);
    lightCv.width = Math.round(W * d); lightCv.height = Math.round(H * d); lightCv.dpr = d;
    if (failed && W / H < 0.82 && !stillT.getAttribute('src')) { stillT.src = IMG + 'games/still-hold-tall.webp'; wait(stillT, 'tall'); }
    if (failed && W > 820 && !stillA.getAttribute('src')) { stillA.src = IMG + 'games/still-aside-wide.webp'; wait(stillA, 'aside'); }
    cache.clear(); projWas = '';
  }

  // where the next chapter's name ends on a wide screen (the section after this one names itself, data-word; it sets
  // the name at look B's size, left of it the rail)
  function nameRight() {
    var el = section.nextElementSibling;
    while (el && !(el.dataset && el.dataset.word)) el = el.nextElementSibling;
    return nameRightOf(el ? el.dataset.word.split('|') : [''], W, parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172);
  }
  var cache = new Map();
  function setT(el, tr) { if (cache.get(el) !== tr) { el.style.transform = tr; cache.set(el, tr); } }
  function setV(el, yes) { if (el.v_ !== yes) { el.style.visibility = yes ? '' : 'hidden'; el.v_ = yes; } }   // ('' never 'visible')
  function setO(el, o) { o = Math.round(o * 500) / 500; if (el.o_ !== o) { el.style.opacity = o; el.o_ = o; } }
  function box(x, y, w, lw) { return 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / lw).toFixed(5) + ')'; }
  var projWas = '';
  function placeProj(pj) {                          // (moved and sized, never scaled: games.css)
    var k = [pj.x.toFixed(2), pj.y.toFixed(2), pj.w.toFixed(2), pj.h.toFixed(2)].join();
    if (k === projWas) return; projWas = k;
    proj.style.width = pj.w.toFixed(2) + 'px'; proj.style.height = pj.h.toFixed(2) + 'px';
    proj.style.transform = 'translate3d(' + pj.x.toFixed(2) + 'px,' + pj.y.toFixed(2) + 'px,0)';
  }
  function mixP(A, B, k) { return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), w: lerp(A.w, B.w, k) }; }

  // the arena's picture on the cloth: quad (the film's place, leaning with the cloth), mid and h (its middle and
  // height), sq (0: leaning with the cloth, 1: squared up to the frame). Returns the arena's lens and its clip.
  function onCloth(quad, mid, h, sq, wipe) {
    var w = h * (((quad[1][0] - quad[0][0]) + (quad[2][0] - quad[3][0])) / 2) / ((quad[3][1] - quad[0][1] + quad[2][1] - quad[1][1]) / 2);
    var rect = [[mid[0] - w / 2, mid[1] - h / 2], [mid[0] + w / 2, mid[1] - h / 2], [mid[0] + w / 2, mid[1] + h / 2], [mid[0] - w / 2, mid[1] + h / 2]];
    var P = quad.map(function (c, i) { return [lerp(c[0], rect[i][0], sq), lerp(c[1], rect[i][1], sq)]; });
    // (wipe < 1: the arena has come only that far across the cloth from its left edge: one clean edge, as look B's
    // night comes across its room)
    if (wipe !== undefined && wipe < 1) { P[1] = [lerp(P[0][0], P[1][0], wipe), lerp(P[0][1], P[1][1], wipe)]; P[2] = [lerp(P[3][0], P[2][0], wipe), lerp(P[3][1], P[2][1], wipe)]; }
    var full = P[0][0] <= 0.5 && P[3][0] <= 0.5 && P[0][1] <= 0.5 && P[1][1] <= 0.5 && P[1][0] >= W - 0.5 && P[2][0] >= W - 0.5 && P[2][1] >= H - 0.5 && P[3][1] >= H - 0.5;
    return { view: { h: h, cx: mid[0], cy: mid[1], wide: 1.15 * w / (h * W / H) }, clip: full ? 'none' : 'polygon(' + P.map(function (c) { return c[0].toFixed(1) + 'px ' + c[1].toFixed(1) + 'px'; }).join(',') + ')', quad: P };
  }
  var clipWas = '';
  function setClip(c) { if (c !== clipWas) { arenaBox.style.clipPath = c === 'none' ? '' : c; clipWas = c; } }
  // (aside: the fighters stepped aside while the posts pass up the left, its own still)
  function placeStill(view, clip, aside) {
    var use, iw, ih, k, x, y;
    if (clip === 'none') {
      // the arena is the world: the still is fitted to the screen, not to the lens (a tall screen's lens is wide here,
      // and the middle of the wide still is bare mud between the fighters)
      use = aside && got.aside ? stillA : W / H < 0.82 && got.tall ? stillT : stillW;
      iw = use === stillT ? 780 : use === stillA ? 1440 : 1600; ih = use === stillT ? 1688 : use === stillA ? 900 : 1000;
      k = Math.max(W * 1.04 / iw, H * 1.04 / ih);
      // (the aside still keeps its right side, where the fighters stand, when the screen is narrower than it)
      x = use === stillA ? W - iw * k : (W - iw * k) / 2; y = (H - ih * k) / 2;
    } else {                                         // on the cloth: it covers the arena's frame, as the 3D picture would
      var fw = view.h * W / H * Math.max(1, view.wide || 1) * 1.04;
      use = fw / view.h < 0.82 && got.tall ? stillT : stillW;
      iw = use === stillT ? 780 : 1600; ih = use === stillT ? 1688 : 1000; k = Math.max(fw / iw, view.h / ih);
      x = view.cx - iw * k / 2; y = view.cy - ih * k / 2;
    }
    if (use !== still) { if (still) still.hidden = true; use.hidden = false; still = use; }
    setT(use, box(x, y, iw * k, iw));
  }

  // ------------------------------------------------------------------ the beam (the end, in the garden)
  function hull(pts) {                             // (the outline of the lens and the four corners of the picture)
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function drawBeam(lens, quad, k, fl) {
    var d = lightCv.dpr || 1;
    lx.setTransform(d, 0, 0, d, 0, 0); lx.clearRect(0, 0, W, H);
    if (k <= 0.003) return;
    var mid = [(quad[0][0] + quad[2][0]) / 2, (quad[0][1] + quad[2][1]) / 2], dist = Math.hypot(mid[0] - lens[0], mid[1] - lens[1]);
    var g = lx.createRadialGradient(lens[0], lens[1], 0, lens[0], lens[1], dist * 1.1);
    var a = k * (0.8 + 0.4 * fl);
    g.addColorStop(0, 'rgba(226,230,244,' + (0.42 * a).toFixed(3) + ')'); g.addColorStop(0.12, 'rgba(214,218,236,' + (0.24 * a).toFixed(3) + ')');
    g.addColorStop(0.6, 'rgba(206,210,232,' + (0.1 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(206,210,232,0)');
    var h = hull([lens].concat(quad));
    lx.fillStyle = g; lx.beginPath(); lx.moveTo(h[0][0], h[0][1]);
    for (var i = 1; i < h.length; i++) lx.lineTo(h[i][0], h[i][1]);
    lx.closePath(); lx.fill();
    // the picture outshines the beam that crosses it
    lx.globalCompositeOperation = 'destination-out'; lx.fillStyle = '#000';
    lx.beginPath(); lx.moveTo(quad[0][0], quad[0][1]); lx.lineTo(quad[1][0], quad[1][1]); lx.lineTo(quad[2][0], quad[2][1]); lx.lineTo(quad[3][0], quad[3][1]); lx.closePath(); lx.fill();
    lx.globalCompositeOperation = 'source-over';
    // the lens
    var rad = Math.max(10, (tall ? 0.03 : 0.012) * W), lg = lx.createRadialGradient(lens[0], lens[1], 0, lens[0], lens[1], rad);
    lg.addColorStop(0, 'rgba(244,246,255,' + (0.9 * k).toFixed(3) + ')'); lg.addColorStop(0.3, 'rgba(214,218,236,' + (0.4 * k).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(214,218,236,0)');
    lx.fillStyle = lg; lx.beginPath(); lx.arc(lens[0], lens[1], rad, 0, 6.283); lx.fill();
  }
  var beamOn = false;

  // ------------------------------------------------------------------ the frame
  function frame(q, t) {
    if (!alive) return false;
    if (!laid) { layout(); laid = true; }
    var tm = HELD ? T_HELD : t; lastTm = tm;
    // where the reader is, in screens from the section's top (the lead: from -2.5 to 0, the film's dive above it)
    var p = q < 0 ? q : q * span, lead = q < 0;
    var view = null, clip = 'none', aq, garden_ = false, quad = null, cam = null, e = 0, shift = 0;
    if (lead) {
      owns = false;
      if (!JOIN.fresh || !JOIN.quad) { JOIN.arena = 0; return false; }      // the film did not draw this frame: nothing to throw onto
      JOIN.fresh = false;
      var k = JOIN.k, a = arenaAt(k, RM);
      if (a <= 0.002) { setV(arenaBox, false); JOIN.arena = 0; setV(garden, false); setV(proj, false); setV(lightCv, false); return true; }
      var oc = onCloth(JOIN.quad, JOIN.mid, JOIN.h, RM ? 1 : squared(k), a);
      view = oc.view; clip = oc.clip;
      setV(arenaBox, true); setO(arenaBox, 1);
      aq = lerp(aFrom, aLead, clamp((p + 2.5) / 2.5));
      if (!arena && !failed) { JOIN.arena = 0; JOIN.ready = false; return false; }
      if (failed && !got.wide) { JOIN.arena = 0; JOIN.ready = false; return false; }
      if (!JOIN.ready) { JOIN.ready = true; options.redraw(); }   // (the film lights its lawn for the arena from its next frame)
      JOIN.arena = a;
    } else {
      setV(arenaBox, true); setO(arenaBox, 1);
      // on into the arena until the card is under the fighters, then a slow drift while the posts pass
      // (a wide screen: while the posts pass up the left the camera steps back a little and the picture slides right,
      // so both fighters stand clear of the column)
      // (it is done before the game's card leaves its place under them and goes up the column: T.picks - 1)
      shift = narrow ? 0 : io(ss(T.picks - 1.6, T.picks - 1.0, p)) * (1 - io(ss(T.out0 - 0.3, T.out0 + 0.3, p)));
      if (RM || failed) shift = shift >= 0.5 ? 1 : 0;   // (stills: changed by a cut)
      aq = p < T.bell ? lerp(aLead, 0.62, io(clamp(p / T.bell))) : lerp(0.62, 0.8, ss(T.bell, T.out0 + 0.6, p)) - shift * 0.26;
      view = { h: H, cx: W / 2 + shift * W * SHIFT, cy: H / 2 };
      // and back out of the cloth into the garden
      e = RM ? (p < (T.out0 + span - HOLD) / 2 ? 0 : 1) : ss(T.out0, span - HOLD, p);
      if (e > 0) {
        garden_ = true;
        cam = between(KD, KE, e);
        var s = scaleOf(cam), mid = plateXY(FILM_MID, cam);
        var oc2 = onCloth(FILMQ.map(function (c) { return plateXY(c, cam); }), mid, FILM_HGT * s, RM ? 0 : 1 - squared(1 - e));
        // (the lens shift for the posts is let go before the walk out)
        view = { h: oc2.view.h, cx: oc2.view.cx + (view.cx - W / 2) * (1 - e), cy: oc2.view.cy, wide: oc2.view.wide };
        clip = oc2.clip; quad = oc2.quad;
      }
    }
    // (at the very end the show is over: the projector has gone and the picture leaves the cloth, so the art chapter
    // turns away from a bare cloth, join.js)
    var bare = !garden_ ? 0 : RM ? (p > span - 0.4 ? 1 : 0) : io(ss(span - 0.65, span - 0.2, p));
    if (bare > 0) { setO(arenaBox, 1 - bare); setV(arenaBox, bare < 0.999); }
    // the arena: its picture for this frame
    if (bare >= 0.999) flash = 0;
    else if (arena) flash = arena.frame(aq, tm, 0, 0, null, view) || 0;
    else if (failed) placeStill(view, clip, !lead && shift >= 0.5 && !garden_);
    owns = lead ? clip === 'none' && JOIN.arena >= 1 : true;
    setClip(clip);

    // the garden (only on the way out)
    setV(garden, garden_); setV(proj, garden_); setV(lightCv, garden_);
    if (garden_) {
      var sc = scaleOf(cam), o = plateXY([0, 0], cam);
      setT(plate, box(o[0], o[1], PW * sc, PW));
      drawEdge();
      setT(edge, 'translate3d(' + (o[0] - EDGE * sc).toFixed(2) + 'px,' + o[1].toFixed(2) + 'px,0) scale(' + ((EDGE + 260) * sc / edge.width).toFixed(5) + ',' + (PH * sc / edge.height).toFixed(5) + ')');
      setT(sky, 'translate3d(' + (o[0] - 3000 * sc).toFixed(2) + 'px,' + (o[1] - 3000 * sc).toFixed(2) + 'px,0) scale(' + sc.toFixed(5) + ')');
      setT(lawn, 'translate3d(' + (o[0] - 3000 * sc).toFixed(2) + 'px,' + (o[1] + 1380 * sc).toFixed(2) + 'px,0) scale(' + sc.toFixed(5) + ')');
      setT(glow, 'translate3d(' + (o[0] + GLOW.x * sc).toFixed(2) + 'px,' + (o[1] + GLOW.y * sc).toFixed(2) + 'px,0) scale(' + (sc / GS).toFixed(5) + ')');
      setO(glow, clamp(0.5 + 0.35 * Math.min(flash, 1.2)));
      var pjP = mixP(PJI, PJE, e), pj = { x: pjP.x - pjP.w / 2, y: pjP.y - pjP.w * 1009 / 618, w: pjP.w, h: pjP.w * 1009 / 618 };
      // (in the hold, before the next chapter's picture comes across: the projector, the nearest thing, leaves for the
      // left wing first, as look B's flats leave before its night comes across the room; its beam goes with it)
      var leave = RM ? (p > span - 0.3 ? 1 : 0) : io(ss(span - 0.45, span - 0.1, p));
      pj.x -= leave * (Math.max(pj.x, 0) + pj.w + 30);
      placeProj(pj);
      if (!HELD) {
        var spin = tm * 1.15;
        reelA.style.transform = 'scaleX(0.8919) rotate(' + (spin % 6.2832).toFixed(3) + 'rad) scaleX(1.1212)';
        reelB.style.transform = 'scaleX(0.8077) rotate(' + ((spin * 0.86 + 0.6) % 6.2832).toFixed(3) + 'rad) scaleX(1.2381)';
      }
      drawBeam([pj.x + pj.w * LENS[0], pj.y + pj.h * LENS[1]], quad, ss(0.35, 0.85, e) * (1 - ss(0, 0.6, leave)) * (1 - bare), Math.min(flash, 1)); beamOn = true;
    } else if (beamOn) { lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, lightCv.width, lightCv.height); beamOn = false; }

    // whole: the arena (or its still) is in; on the way out the garden's plate and light too
    var arenaIn = !!arena || (failed && got.wide && (W / H >= 0.82 || got.tall) && (W <= 820 || got.aside));
    return arenaIn && (!garden_ || (got.plate && got.glow));
  }

  // ------------------------------------------------------------------ a fighter pressed throws a move
  // (the arena is behind the page: a press anywhere that is not on a card or a link goes to the fighter under it)
  var lastTm = 0, owns = false;
  function onPress(ev) {
    if (!active || !arena || RM || HELD || ev.button) return;
    if (ev.target.closest && ev.target.closest('a, button, input, .paper, #rail, .chapter-top')) return;
    var nx = ev.clientX / W * 2 - 1, ny = -(ev.clientY / H * 2 - 1), who = arena.pick(nx, ny);
    if (who) { arena.tap(who, lastTm + 0.03); options.redraw(); }
  }
  document.addEventListener('click', onPress);

  return {
    frame: frame,
    resize: function () { if (laid) layout(); if (arena) arena.resize(); },
    setActive: function (on) { active = on; },
    owns: function () { return owns; },        // (the arena is the whole world on the screen: the rail names Games)
    arena: function () { return arena; },      // (for tests: the arena, and the time of the last frame drawn)
    time: function () { return lastTm; },
    dispose: function () {
      alive = false; JOIN.arena = 0; JOIN.ready = false;
      document.removeEventListener('click', onPress);
      if (arena) { try { arena.dispose(); } catch (err) { /* it is going anyway */ } arena = null; }
    }
  };
}
