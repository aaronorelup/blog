/* THE 3D & ANIMATION CHAPTER: the toy box (the approved test tests/toy-box/, its play in toybox/play.js).
   How it joins: the games chapter ends in the night garden by the cloth, and holds there. Over it (this chapter's
   lead, chapters.js) the chapter's name comes on from the left wing, as look B's names do, the projector leaves for
   the left wing (games.js), and the tea house at night slides across from the right with one straight edge, as look
   B's night comes across its room. Then look B's own opening move, again: the camera walks up the stepping stones and
   in through the doorway (toybox-garden.js: look B's garden, number for number), and the room behind the doorway is
   the toy box's room, the box on the floor. Through the doorway the 3D camera is look B's room camera (drawRoom's
   garden branch); inside, it eases into the test's own camera: on to the box, which shakes, bursts, and the toys
   tumble out and huddle; then it steps back so that the posts pass up the left beside the huddle.
   Everything drawn is a function of q (the camera) and the time, except what the reader's hand does to the toys
   and the physics that follows (it settles back to the same huddle). With motion turned off: cuts between stills
   (the garden from the lawn, the room with the box open and the toys in their huddle). */
import { makeGarden, roomS0, M_IN, rLook } from './toybox-garden.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var PW = 2752, PH = 1536;                          // the room's painting
var K = 1.4;                                       // (look B lays its type out larger than it is drawn)
// when things happen, in screens from the section's top (the lead runs from -1.8 to 0)
var NAME_IN = [-1.75, -1.15], SAY_IN = [-1.65, -1.05];
var SLIDE = [-0.85, -0.05];                        // the tea house slides across (games holds still under it)
var WALK = [0.25, 2.85];                           // look B's walk from the lawn through the doorway
// (the name leaves for the left wing as the walk begins, as look B's title leaves its lawn; it stands again on the
// room's wall once the camera is through the doorway, as look B's "Start here" does, and leaves as it goes to the box)
var NAME_WALK = [0.3, 0.85], NAME_ROOM = [2.45, 2.85], NAME_OUT = [3.05, 3.6];
// the box's track after the walk (r: screens since the walk ended) -> the test's own track (0..1)
var TRACK = [[0, 0.06], [1.0, 0.3], [1.9, 0.46], [2.5, 0.78], [3.2, 1.0]];

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, top = options.top, marks = options.marks;
  var root = document.documentElement, alive = true, active = false;

  host.innerHTML =
    '<div class="tb-sky"></div>' +
    '<div class="tb-room"><canvas class="tb-gl"></canvas><img class="tb-flat" src="' + IMG + 'room.webp" width="2752" height="1536" alt="" decoding="async" hidden></div>' +
    '<div class="tb-garden"></div>' +
    '<div class="tb-name"><div class="flat word"></div><div class="flat say"></div></div>';
  top.innerHTML =
    '<div class="tb-tag" role="status" aria-live="polite"><p class="tag-from"></p><b class="tag-name"></b><p class="tag-how"></p></div>' +
    '<button class="tb-hint off" type="button" tabindex="-1"><span></span></button>' +
    '<p class="tb-count" aria-hidden="true"></p>';
  var pick = function (el, sel) { return el.querySelector(sel); };
  var skyEl = pick(host, '.tb-sky'), roomEl = pick(host, '.tb-room'), canvas = pick(host, '.tb-gl'), flatRoom = pick(host, '.tb-flat'), gardenEl = pick(host, '.tb-garden');
  var word = pick(host, '.word'), say = pick(host, '.say');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  var garden = makeGarden(skyEl, gardenEl, IMG);
  var gardenLaid = false;
  garden.imgs.forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { gardenLaid = false; options.redraw(); }, { once: true }); });

  // ------------------------------------------------------------------ the toy box (three.js: fetched now, with the chapter)
  var play = null, glFailed = false, flatIn = false;
  flatRoom.addEventListener('load', function () { flatIn = true; options.redraw(); }, { once: true });
  if (flatRoom.complete && flatRoom.naturalWidth) flatIn = true;
  import('./toybox/play.js').then(function (m) {
    if (!alive) return;
    try {
      play = m.mountPlay({
        canvas: canvas, hand: section, held: HELD, reduced: RM, img: IMG + 'room.webp', back: IMG + 'room-back.webp', redraw: options.redraw,
        top: { tag: pick(top, '.tb-tag'), hint: pick(top, '.tb-hint'), hintText: pick(top, '.tb-hint span'), count: pick(top, '.tb-count') }
      });
      play.resize();
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); useFlat(); });
    } catch (err) { useFlat(); }
    options.redraw();
  }).catch(function (err) {
    if (window.console) console.warn('The toy box could not start, the room stands in: ' + (err && err.message || err));
    useFlat();
  });
  function useFlat() {
    if (play) { try { play.dispose(); } catch (e) { /* going anyway */ } play = null; }
    glFailed = true; canvas.hidden = true; flatRoom.hidden = false; options.redraw();
  }

  // ------------------------------------------------------------------ the layout
  var W = 1, H = 1, narrow = false, portrait = false, laid = false, wx = 0, wy = 0, sx = 0, sy = 0, pTrack = 7;
  function layout() {
    W = root.clientWidth; H = window.innerHeight; narrow = W <= 820; portrait = W / H < 0.9;
    host.classList.toggle('narrow', narrow);
    if (garden.whole()) { garden.layout(W, H); gardenLaid = true; }
    // the name: look B's rule for a chapter's name (as closing.js has it): its size, clear of the rail, high up
    var wp = clamp(W * (portrait ? 0.15 : 0.115), 52, 190), sp = clamp(W * 0.0175, 17, 27);
    var left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * K) + 'px'; say.style.width = (sp * K * (narrow ? 13 : 17)) + 'px';
    wx = left; wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    // the end of the box's track: the first post's top comes up at the foot of the screen
    pTrack = (marks.picks ? marks.picks.top : 7.1) - 1 - WALK[1];
    if (play) play.resize();
    nameWas = sayWas = ''; rectWas = '';
  }
  var nameWas = '', sayWas = '', rectWas = '';
  // k: 0 off in the left wing (narrow, coming on: a little below, unseen), 1 in its place; out: leaving for the wing
  function put(el, x, y, k, out, was) {
    var tr, o = 1;
    if (out > 0) { var w = el.offsetWidth / K; tr = 'translate3d(' + (x - out * (Math.max(x, 0) + w + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    else if (narrow) { tr = 'translate3d(' + x.toFixed(2) + 'px,' + (y + (1 - k) * H * 0.07).toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o = clamp((k - 0.06) * 5.5); }
    else { var w2 = el.offsetWidth / K; tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w2 + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    var key = tr + o;
    if (key !== was) {
      el.style.transform = tr; el.style.visibility = k < 0.0005 || o <= 0 || out > 0.9995 ? 'hidden' : '';
      el.style.opacity = o < 1 ? o.toFixed(3) : '';
    }
    return key;
  }
  var slideWas = '';
  function setSlide(x) {                        // the tea house's sheet: x pixels in from the right edge's left (0: whole)
    var tr = 'translate3d(' + x + 'px,0,0)';
    if (tr === slideWas) return; slideWas = tr;
    skyEl.style.transform = tr; gardenEl.style.transform = tr;
    skyEl.classList.toggle('moving', x > 0);
  }
  var vis = {};
  function setV(el, key, yes) { if (vis[key] !== yes) { el.style.visibility = yes ? '' : 'hidden'; vis[key] = yes; } }

  // a camera of look B's room (m, C, o) -> the part of the painting it shows (painting pixels)
  function rectOfCam(cam) {
    var S0 = roomS0(W, H), z = 1 / (1 - cam.m), w = PW * S0 * z, h = PH * S0 * z;
    var px = (0 - cam.C[0]) / (1 - cam.m) - cam.o[0], py = (0 - cam.C[1]) / (1 - cam.m) - cam.o[1];
    var X0 = W / 2 + px * S0 - w / 2, Y0 = H / 2 + py * S0 - h / 2, k = PW / w;
    return { x: -X0 * k, y: -Y0 * k, w: W * k, h: H * k };
  }
  function mixRect(a, b, e) {
    // (an even pace for the eye: the width changes by the same share with every step)
    var w = a.w * Math.pow(b.w / a.w, e), f = (w - a.w) / ((b.w - a.w) || 1);
    if (Math.abs(b.w - a.w) < 0.5) f = e;
    var cx = lerp(a.x + a.w / 2, b.x + b.w / 2, f), cy = lerp(a.y + a.h / 2, b.y + b.h / 2, f), h = w * H / W;
    return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
  }
  function trackAt(r) {
    if (r <= 0) return TRACK[0][1];
    for (var i = 1; i < TRACK.length; i++) if (r <= TRACK[i][0]) return lerp(TRACK[i - 1][1], TRACK[i][1], (r - TRACK[i - 1][0]) / (TRACK[i][0] - TRACK[i - 1][0]));
    return 1;
  }

  // ------------------------------------------------------------------ the frame
  var lastT = -1, owns = false;
  function frame(q, t) {
    if (!alive) return false;
    if (!laid) { layout(); laid = true; }
    if (!gardenLaid && garden.whole()) { garden.layout(W, H); gardenLaid = true; }
    var p = q < 0 ? q : q * options.span(), lead = q < 0;
    var dt = lastT < 0 || HELD ? 0 : clamp(t - lastT, 0, 0.1); lastT = t;
    if (!gardenLaid) return false;

    // the name
    var kIn, kSay, kOut, kSayOut;
    if (p < (NAME_WALK[1] + NAME_ROOM[0]) / 2) {
      kIn = RM ? (p > -1.4 ? 1 : 0) : narrow ? io(ss(NAME_IN[0] + 0.15, NAME_IN[1], p)) : io(ss(NAME_IN[0], NAME_IN[1], p));
      kSay = RM ? kIn : narrow ? io(ss(SAY_IN[0] + 0.15, SAY_IN[1], p)) : io(ss(SAY_IN[0], SAY_IN[1], p));
      kOut = RM ? (p > WALK[0] ? 1 : 0) : io(ss(NAME_WALK[0], NAME_WALK[1], p)); kSayOut = RM ? kOut : io(ss(NAME_WALK[0] - 0.05, NAME_WALK[1] - 0.1, p));
    } else {
      // (back on the room's wall: it comes on from the left wing, on every screen)
      kIn = kSay = 1;
      kOut = RM ? (p > NAME_OUT[1] || p < (WALK[0] + WALK[1]) / 2 ? 1 : 0) : Math.max(1 - io(ss(NAME_ROOM[0], NAME_ROOM[1], p)), io(ss(NAME_OUT[0], NAME_OUT[1], p)));
      kSayOut = RM ? kOut : Math.max(1 - io(ss(NAME_ROOM[0] + 0.05, NAME_ROOM[1] + 0.05, p)), io(ss(NAME_OUT[0] - 0.05, NAME_OUT[1] - 0.1, p)));
    }
    nameWas = put(word, wx, wy, kIn, kOut, nameWas);
    sayWas = put(say, sx, sy, kSay, kSayOut, sayWas);

    // the tea house slides across, then the walk
    var sl = RM ? (p > -0.45 ? 1 : 0) : io(ss(SLIDE[0], SLIDE[1], p));
    var hp = RM ? (p < (WALK[0] + WALK[1]) / 2 ? 0 : 1) : clamp((p - WALK[0]) / (WALK[1] - WALK[0]));
    var sheetOn = sl > 0.0005 && hp < 1;
    setV(skyEl, 'sky', sheetOn); setV(gardenEl, 'garden', sheetOn);
    var gcam = null;
    if (sheetOn) {
      setSlide(sl >= 0.9995 ? 0 : Math.round((1 - sl) * (W + 40)));
      gcam = garden.draw(hp, t);
    }
    // the room: seen through the doorway once the walk has come close (look B's own rule), then the picture
    var roomOn = !lead && (hp >= 1 || (gcam && gcam.m > 0.33));
    setV(roomEl, 'room', roomOn);
    var r = p - WALK[1], prog = 0, rect = null;
    if (roomOn) {
      if (hp < 1) rect = rectOfCam(garden.roomCam(gcam));
      else {
        var door = rectOfCam(garden.roomCam(null));
        // the track: stretched so that its end comes as the first post comes up (the posts pass beside the huddle)
        var rr = r * 3.2 / Math.max(1.5, pTrack);
        // (motion off: the doorway's view with the box shut, then cuts to the huddle, and to the step back for the posts)
        prog = RM ? (rr < 0.5 ? 0 : rr < 2.5 ? 0.6 : 1.0) : trackAt(rr);
        if (RM) rect = prog === 0 || !play ? door : play.rectAt(prog);
        else if (rr < 1.0) rect = mixRect(door, play ? play.rectAt(0.3) : door, ss(0, 1, rr));
        else rect = play ? play.rectAt(prog) : door;
      }
    }
    var hand = roomOn && hp >= 1 && active;
    if (play && roomOn) play.frame(rect, prog, active ? dt : 0, hand);
    else if (play) play.idle();
    // the painting itself, where three.js is not (no WebGL, or until it has started)
    var useFlat = roomOn && (glFailed || !play || !play.ready);
    setV(flatRoom, 'flat', useFlat); setV(canvas, 'gl', roomOn && !useFlat);
    if (useFlat && rect) {
      var k = W / rect.w, tr = 'translate3d(' + (-rect.x * k).toFixed(2) + 'px,' + (-rect.y * k).toFixed(2) + 'px,0) scale(' + k.toFixed(5) + ')';
      if (tr !== rectWas) { flatRoom.style.transform = tr; rectWas = tr; }
    }
    owns = !lead || sl >= 0.9995;
    // whole: the garden's pictures are in (the lead and the walk); in the room, its painting (three.js's or the flat)
    if (roomOn) return (play && play.ready) || (useFlat && flatIn);
    return true;
  }

  return {
    frame: frame,
    resize: function () { if (laid) layout(); },
    setActive: function (on) { active = on; if (!on && play) play.pause(); if (on) lastT = -1; },
    owns: function () { return owns; },          // (once the tea house has come across, the rail names this chapter)
    play: function () { return play; },           // (for tests)
    dispose: function () {
      alive = false;
      if (play) { try { play.dispose(); } catch (err) { /* it is going anyway */ } play = null; }
    }
  };
}
