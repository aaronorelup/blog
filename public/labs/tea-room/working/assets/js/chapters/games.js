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
import { PW, PH, FOCUS, GLOW, FILMQ, FILM_MID, FILM_HGT, JOIN, diveEnd, arenaOver, squared } from './join.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var CX = PW / 2, CY = PH / 2, GS = 0.5, LENS = [0.948, 0.467];
var T_HELD = 9.0;                                 // a held frame shows the arena at this moment (the test's own)
var A_LEAD = 0.26;                                // how far into the arena the camera has come when the dive ends
// the arena's light on the lawn: the storm's grey, a little blue (film.js lights the lawn the same while it dives)
var LIGHT = [154, 154, 184];

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, marks = options.marks;
  var root = document.documentElement, alive = true, active = false;

  host.innerHTML =
    '<div class="gm-garden">' +
      '<div class="gm-ext gm-sky"></div><div class="gm-ext gm-lawn"></div>' +
      '<img class="gm-plate" src="' + IMG + 'film/garden-night.webp" width="2752" height="1536" alt="" decoding="async">' +
      '<canvas class="gm-glow"></canvas>' +
    '</div>' +
    '<div class="gm-arena"><canvas class="gm-gl"></canvas><img class="gm-still" alt="" decoding="async"></div>' +
    '<canvas class="gm-light"></canvas>' +
    '<div class="gm-proj"><img src="' + IMG + 'prop-projector.webp" width="618" height="1009" alt="">' +
      '<img class="gm-reel gm-reel-a" src="' + IMG + 'film/reel-a.webp" width="206" height="230" alt="">' +
      '<img class="gm-reel gm-reel-b" src="' + IMG + 'film/reel-b.webp" width="176" height="216" alt=""></div>';
  var pick = function (sel) { return host.querySelector(sel); };
  var garden = pick('.gm-garden'), sky = pick('.gm-sky'), lawn = pick('.gm-lawn'), plate = pick('.gm-plate'), glow = pick('.gm-glow');
  var arenaBox = pick('.gm-arena'), canvas = pick('.gm-gl'), still = pick('.gm-still'), lightCv = pick('.gm-light'), proj = pick('.gm-proj');
  var reelA = pick('.gm-reel-a'), reelB = pick('.gm-reel-b');
  var lx = lightCv.getContext('2d'), gx = glow.getContext('2d');

  // ------------------------------------------------------------------ what has come in
  var got = { plate: false, glow: false, still: false }, arena = null, failed = false, flash = 0;
  function wait(im, key) {
    var done = function () { if (!alive) return; got[key] = true; options.redraw(); };
    if (im.complete && im.naturalWidth) { (im.decode ? im.decode() : Promise.resolve()).then(done, done); return; }
    im.addEventListener('load', function () { (im.decode ? im.decode() : Promise.resolve()).then(done, done); }, { once: true });
    im.addEventListener('error', done, { once: true });
  }
  wait(plate, 'plate');
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
  function useStill() {
    failed = true; canvas.hidden = true; still.hidden = false;
    still.src = IMG + 'games/' + (W / H < 0.82 ? 'still-hold-tall.webp' : 'still-hold-wide.webp');
    wait(still, 'still');
  }
  var W = root.clientWidth, H = window.innerHeight;
  if (RM) useStill();
  else {
    still.hidden = true;
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
  var tall = false, narrow = false, span = 1, KD, KE, PJE, PJI, T = {}, laid = false;
  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    tall = W / H < 0.9; narrow = W <= 820;
    host.classList.toggle('tall', tall);
    span = options.span();
    var cover = Math.max(W / PW, H / PH);
    var de = diveEnd(W, H);
    KD = camOf(de.s, W / 2, H / 2, FILM_MID);
    // the end: the night garden, the cloth to one side, room for the next chapter's name (closing.js) where it comes
    var rail = narrow ? 0 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172);
    if (!tall) {
      // the cloth stands right of the next chapter's name (its widest line, measured in the name's own type)
      // (never smaller than the screen: the plate's own edges must stay outside the frame)
      var right = W - Math.max(10, W * 0.008), left = Math.max(W * 0.5, nameRight() + W * 0.025);
      var s3 = clamp((right - left) / 752, cover * 1.0, cover * 1.15);
      var tx = clamp(right - 2199 * s3, W - PW * s3, 0), ty = clamp(0.5 * H - FOCUS[1] * s3, H - PH * s3, 0);
      KE = camOf(s3, tx + FOCUS[0] * s3, ty + FOCUS[1] * s3);
      var pw = clamp(H * 0.3, 150, 280);
      PJE = { x: Math.max(rail + 40 + pw * 0.5, W * 0.43), y: H * 1.08, w: pw };
    } else {
      // (the name is two lines here: "AI art / & images", its line and the note under it)
      var wordPx = clamp(W * 0.15, 52, 190), clothTop = H * 0.11 + wordPx * 0.9 * 2 + 136, clothBot = H * 0.68;
      var st = clamp((clothBot - clothTop) / 546, 0.5 * W / 752, 0.95 * W / 752);
      KE = camOf(st, 0.52 * W, (clothTop + clothBot) / 2);
      var pw3 = clamp(W * 0.34, 120, 210);
      PJE = { x: W * 0.17, y: H * 0.99, w: pw3 };
    }
    PJI = { x: PJE.x - (tall ? W * 0.5 : W * 0.32), y: PJE.y + H * 0.95, w: PJE.w * 2.2 };
    // when things happen, in screens from the section's top
    T.bell = marks.bell ? marks.bell.top : 0.7;               // the game's card has come up under the fighters
    T.picks = marks.picks ? marks.picks.top : 3;              // the first post's top
    T.all = marks.all ? marks.all.top : 5;
    T.out0 = marks.foot ? marks.foot.top - 0.45 : span - 1.2; // the camera starts back out of the cloth
    var d = Math.min(window.devicePixelRatio || 1, W > 1200 ? 1.5 : 2);
    lightCv.width = Math.round(W * d); lightCv.height = Math.round(H * d); lightCv.dpr = d;
    if (!still.hidden) still.src = IMG + 'games/' + (W / H < 0.82 ? 'still-hold-tall.webp' : 'still-hold-wide.webp');
    cache.clear();
  }

  // where the closing beat's name ends on a wide screen (closing.js sets it: look B's size, left of it the rail)
  function nameRight() {
    var el = document.getElementById('closing'), lines = el && el.dataset.word ? el.dataset.word.split('|') : [''];
    var px = clamp(W * 0.115, 52, 190), left = (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    var c = document.createElement('canvas').getContext('2d'), w = 0;
    c.font = '700 ' + px + 'px "Zen Maru Gothic", sans-serif';
    lines.forEach(function (l) { w = Math.max(w, c.measureText(l).width * 0.97); });     // (its letters are set 0.025em closer)
    return left + w;
  }
  var cache = new Map();
  function setT(el, tr) { if (cache.get(el) !== tr) { el.style.transform = tr; cache.set(el, tr); } }
  function setV(el, yes) { if (el.v_ !== yes) { el.style.visibility = yes ? '' : 'hidden'; el.v_ = yes; } }   // ('' never 'visible')
  function setO(el, o) { o = Math.round(o * 500) / 500; if (el.o_ !== o) { el.style.opacity = o; el.o_ = o; } }
  function box(x, y, w, lw) { return 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / lw).toFixed(5) + ')'; }
  function mixP(A, B, k) { return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), w: lerp(A.w, B.w, k) }; }

  // the arena's picture on the cloth: quad (the film's place, leaning with the cloth), mid and h (its middle and
  // height), sq (0: leaning with the cloth, 1: squared up to the frame). Returns the arena's lens and its clip.
  function onCloth(quad, mid, h, sq) {
    var w = h * (((quad[1][0] - quad[0][0]) + (quad[2][0] - quad[3][0])) / 2) / ((quad[3][1] - quad[0][1] + quad[2][1] - quad[1][1]) / 2);
    var rect = [[mid[0] - w / 2, mid[1] - h / 2], [mid[0] + w / 2, mid[1] - h / 2], [mid[0] + w / 2, mid[1] + h / 2], [mid[0] - w / 2, mid[1] + h / 2]];
    var P = quad.map(function (c, i) { return [lerp(c[0], rect[i][0], sq), lerp(c[1], rect[i][1], sq)]; });
    var full = P[0][0] <= 0.5 && P[3][0] <= 0.5 && P[0][1] <= 0.5 && P[1][1] <= 0.5 && P[1][0] >= W - 0.5 && P[2][0] >= W - 0.5 && P[2][1] >= H - 0.5 && P[3][1] >= H - 0.5;
    return { view: { h: h, cx: mid[0], cy: mid[1], wide: w / (h * W / H) }, clip: full ? 'none' : 'polygon(' + P.map(function (c) { return c[0].toFixed(1) + 'px ' + c[1].toFixed(1) + 'px'; }).join(',') + ')', quad: P };
  }
  var clipWas = '';
  function setClip(c) { if (c !== clipWas) { arenaBox.style.clipPath = c === 'none' ? '' : c; clipWas = c; } }
  function placeStill(view) {                       // the still covers the arena's frame, as the 3D picture would
    var fw = view.h * W / H, iw = still.naturalWidth || 1600, ih = still.naturalHeight || 1000, k = Math.max(fw / iw, view.h / ih);
    setT(still, box(view.cx - iw * k / 2, view.cy - ih * k / 2, iw * k, iw));
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
    var view = null, clip = 'none', aq, garden_ = false, quad = null, cam = null, e = 0;
    if (lead) {
      if (!JOIN.fresh || !JOIN.quad) { JOIN.arena = 0; return false; }      // the film did not draw this frame: nothing to throw onto
      JOIN.fresh = false;
      var k = JOIN.k, a = RM ? (k >= 0.5 ? 1 : 0) : arenaOver(k);
      if (a <= 0.002) { setV(arenaBox, false); JOIN.arena = 0; setV(garden, false); setV(proj, false); setV(lightCv, false); return true; }
      var oc = onCloth(JOIN.quad, JOIN.mid, JOIN.h, RM ? 1 : squared(k));
      view = oc.view; clip = oc.clip;
      setV(arenaBox, true); setO(arenaBox, a);
      aq = A_LEAD * clamp((p + 2.5) / 2.5);
      if (!arena && !failed) { JOIN.arena = 0; return false; }
      if (failed && !got.still) { JOIN.arena = 0; return false; }
      JOIN.arena = a;
    } else {
      setV(arenaBox, true); setO(arenaBox, 1);
      // on into the arena until the card is under the fighters, then a slow drift while the posts pass
      aq = p < T.bell ? lerp(A_LEAD, 0.62, io(clamp(p / T.bell))) : lerp(0.62, 1, ss(T.bell, T.out0 + 0.6, p));
      var shift = narrow ? 0 : io(ss(T.picks - 1.05, T.picks - 0.25, p)) * (1 - io(ss(T.all + 0.05, T.out0 + 0.25, p)));
      view = { h: H, cx: W / 2 + shift * W * 0.13, cy: H / 2 };
      // and back out of the cloth into the garden
      e = RM ? (p < (T.out0 + span) / 2 ? 0 : 1) : io(ss(T.out0, span, p));
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
    // the arena: its picture for this frame
    if (arena) flash = arena.frame(aq, tm, 0, 0, null, view) || 0;
    else if (failed) placeStill(view);
    setClip(clip);

    // the garden (only on the way out)
    setV(garden, garden_); setV(proj, garden_); setV(lightCv, garden_);
    if (garden_) {
      var sc = scaleOf(cam), o = plateXY([0, 0], cam);
      setT(plate, box(o[0], o[1], PW * sc, PW));
      setT(sky, 'translate3d(' + (o[0] - 3000 * sc).toFixed(2) + 'px,' + (o[1] - 3000 * sc).toFixed(2) + 'px,0) scale(' + sc.toFixed(5) + ')');
      setT(lawn, 'translate3d(' + (o[0] - 3000 * sc).toFixed(2) + 'px,' + (o[1] + 1380 * sc).toFixed(2) + 'px,0) scale(' + sc.toFixed(5) + ')');
      setT(glow, 'translate3d(' + (o[0] + GLOW.x * sc).toFixed(2) + 'px,' + (o[1] + GLOW.y * sc).toFixed(2) + 'px,0) scale(' + (sc / GS).toFixed(5) + ')');
      setO(glow, clamp(0.5 + 0.35 * Math.min(flash, 1.2)));
      var pjP = mixP(PJI, PJE, e), pj = { x: pjP.x - pjP.w / 2, y: pjP.y - pjP.w * 1009 / 618, w: pjP.w, h: pjP.w * 1009 / 618 };
      setT(proj, box(pj.x, pj.y, pj.w, 618));
      if (!HELD) {
        var spin = tm * 1.15;
        reelA.style.transform = 'scaleX(0.8919) rotate(' + (spin % 6.2832).toFixed(3) + 'rad) scaleX(1.1212)';
        reelB.style.transform = 'scaleX(0.8077) rotate(' + ((spin * 0.86 + 0.6) % 6.2832).toFixed(3) + 'rad) scaleX(1.2381)';
      }
      drawBeam([pj.x + pj.w * LENS[0], pj.y + pj.h * LENS[1]], quad, ss(0.35, 0.85, e), Math.min(flash, 1)); beamOn = true;
    } else if (beamOn) { lx.setTransform(1, 0, 0, 1, 0, 0); lx.clearRect(0, 0, lightCv.width, lightCv.height); beamOn = false; }

    // whole: the arena (or its still) is in; on the way out the garden's plate and light too
    var arenaIn = !!arena || (failed && got.still);
    return arenaIn && (!garden_ || (got.plate && got.glow));
  }

  // ------------------------------------------------------------------ a fighter pressed throws a move
  // (the arena is behind the page: a press anywhere that is not on a card or a link goes to the fighter under it)
  var lastTm = 0;
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
    arena: function () { return arena; },      // (for tests)
    dispose: function () {
      alive = false; JOIN.arena = 0;
      document.removeEventListener('click', onPress);
      if (arena) { try { arena.dispose(); } catch (err) { /* it is going anyway */ } arena = null; }
    }
  };
}
