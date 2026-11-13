// THE ENDING: the pictures behind the page's last three chapters, Courses, Now and About.
// Pictures only: everything read is in the page's flow (index.html), over this.
//
//   mount(host, options) -> { frame(q, time, pointer), resize(), setActive(on), dispose() }
//
// q runs 0..1 over the three chapters, a third each: 0..1/3 Courses, 1/3..2/3 Now, 2/3..1 About. Inside a third,
// 0..0.7 is the stretch where its card passes and 0.7..1 the scene alone after it (the host measures both).
// Everything drawn is a function of q only: no time, no pointer, nothing that plays. The night is quiet on purpose.
//   Courses: the back room, not ready yet. The camera leans in a little; at the end the view slides over to the
//            veranda (look B's slide over to night).
//   Now:     the veranda over the still garden, the moon the only light. Nothing moves at all.
//   About:   the same garden as the first light comes. The night plate gives way to the morning one as the reader
//            goes down, and the camera steps back to the whole garden for the last frame.
// options.reduced: no camera moves; the slide and the dawn are single steps.
import { roomProps, veranda, moon } from './props.js';

var IMG = '/labs/tea-room/working/assets/img/', HERO = '/tea/hero/';
var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
var mix = function (a, b, t) { return a + (b - a) * t; };

function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
function svg(w, h, body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="position:absolute;left:0;top:0;overflow:visible">' + body + '</svg>';
}

export function mount(host, options) {
  options = options || {};
  var RM = !!options.reduced;
  var imgs = [];
  host.classList.add('end-host');

  // a scene is a window the size of the screen; its plate is the painting at its own pixel size, moved and scaled
  function scene(name, w, h, bg) {
    var s = el('div', 'end-scene end-' + name, host);
    s.style.background = bg;
    var p = el('div', 'end-plate', s);
    p.style.width = w + 'px'; p.style.height = h + 'px';
    return { el: s, plate: p, w: w, h: h, tr: '', vis: '', op: '' };
  }
  function img(parent, src, cls) {
    var i = el('img', cls || 'end-layer', parent);
    i.alt = ''; i.decoding = 'async'; i.draggable = false;
    i.src = src; imgs.push(i);
    return i;
  }
  function layer(parent, html, cls) { var d = el('div', cls || 'end-layer', parent); d.innerHTML = html; return d; }

  // --- Courses: the back room (look B's room plate) with what is drawn into it
  var A = scene('room', 2752, 1536, '#1d1520');
  img(A.plate, IMG + 'room.webp');
  layer(A.plate, svg(2752, 1536, roomProps()));
  var foot = layer(A.plate, '', 'end-layer end-room-foot');                 // the plate's foot fades to the floor (phone)

  // --- Now: the veranda. The sky and its hills, the moon, the garden's lawn and path (the far plate with the tea house
  // and its lit windows masked away: the moon is the only light), the near tree, the veranda's frame.
  var B = scene('now', 2400, 1350, '#211a26');        // under the plate: the veranda's boards
  img(B.plate, IMG + 'garden-sky.webp');
  img(B.plate, HERO + 'bg-far-night.webp', 'end-layer end-lawn');
  layer(B.plate, svg(2400, 1350, moon(1060, 300, 74)));
  img(B.plate, HERO + 'bg-mid-night.webp', 'end-layer end-tree');
  layer(B.plate, '', 'end-layer end-moonlight');
  var ver = layer(B.plate, svg(2400, 1350, veranda()), 'end-layer end-veranda');

  // --- About: the garden at dawn, night and morning plates on top of each other
  var C = scene('dawn', 2816, 1584, '#151b30');
  img(C.plate, HERO + 'bg-far-night.webp');
  var day = img(C.plate, HERO + 'bg-far-day.webp');
  var sky = layer(C.plate, '', 'end-layer end-sky');            // keeps the top of the sky the night's colour
  var band = layer(C.plate, '', 'end-layer end-band');          // the one band of warm light along the hills

  var W = 1, H = 1, tall = false;
  function resize() {
    W = host.clientWidth || window.innerWidth; H = host.clientHeight || window.innerHeight;
    tall = W / H < 0.9;
    [A, B, C].forEach(function (s) { s.tr = ''; });
  }

  // put a plate so that its point (fx, fy) (fractions of the plate) is at (sx, sy) (fractions of the screen), at k
  // times the size that covers the screen; cover: keep the screen covered (nothing of the page shows round it)
  function place(s, k, fx, fy, sx, sy, cover, dx) {
    var sc = Math.max(W / s.w, H / s.h) * k;
    var pw = s.w * sc, ph = s.h * sc;
    var tx = sx * W - fx * pw, ty = sy * H - fy * ph;
    tx = clamp(tx, Math.min(0, W - pw), 0);
    if (cover) ty = clamp(ty, Math.min(0, H - ph), 0); else ty = Math.min(ty, 0);
    var tr = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + sc.toFixed(5) + ')';
    if (tr !== s.tr) { s.plate.style.transform = tr; s.tr = tr; }
    // the slide between two scenes moves the whole window, its ground colour with it
    var sl = dx ? 'translate3d(' + dx.toFixed(2) + 'px,0,0)' : '';
    if (sl !== s.sl) { s.el.style.transform = sl; s.sl = sl; }
  }
  function show(s, on, op) {
    var v = on ? 'visible' : 'hidden';
    if (v !== s.vis) { s.el.style.visibility = v; s.vis = v; }
    var o = (op == null ? 1 : op).toFixed(3);
    if (o !== s.op) { s.el.style.opacity = o; s.op = o; }
  }
  var lastFoot = '', lastDay = '', lastSky = '', lastBand = '', lastVer = '';

  function frame(q) {
    q = clamp(q || 0, 0, 1);
    var uA = clamp(q * 3, 0, 1), uC = clamp(q * 3 - 2, 0, 1);

    // Courses -> Now: the view slides over to the veranda once the card has gone
    var slide = RM ? (uA >= 0.86 ? 1 : 0) : ss(0.72, 1, uA);
    // Now -> About: the veranda falls away as the reader steps down into the garden
    var step = RM ? (uC >= 0.06 ? 1 : 0) : ss(0, 0.13, uC);
    // the dawn itself: the reader's way through the About card
    var dawn = RM ? (uC >= 0.4 ? 1 : 0) : ss(0.1, 0.78, uC);
    // the last stretch: the camera steps back to the whole garden
    var rest = RM ? (uC >= 0.75 ? 1 : 0) : ss(0.68, 1, uC);

    // --- the room
    show(A, slide < 1 && q < 0.5);
    if (slide < 1) {
      var push = RM ? 0 : ss(0, 0.72, uA);
      // a phone: the props in the half screen above the card; as the card goes up and away the room grows to fill the
      // screen, so no empty floor opens under the card
      var fill = RM ? (uA >= 0.12 ? 1 : 0) : ss(0, 0.24, uA);
      var fo = (1 - fill).toFixed(3);
      if (fo !== lastFoot) { foot.style.opacity = fo; lastFoot = fo; }
      if (tall) place(A, mix(mix(0.62, 0.66, push), 1.0, fill), 0.6, 0.62, 0.5, mix(0.29, 0.62, fill), false, -slide * W);
      else place(A, mix(1.0, 1.07, push), 0.62, 0.6, 0.68, 0.6, true, -slide * W);
    }

    // --- the veranda: still. It is placed the same for every q.
    var bOn = slide > 0 && step < 1;
    show(B, bOn, 1 - step);
    if (bOn) {
      if (tall) place(B, 0.82, 0.44, 0.222, 0.5, 0.17, false, (1 - slide) * W);
      else place(B, 1.0, 0.42, 0.5, 0.38, 0.5, true, (1 - slide) * W);
      var vk = 'scale(' + (1 + step * 0.18).toFixed(4) + ')';
      if (vk !== lastVer) { ver.style.transform = vk; lastVer = vk; }
    }

    // --- the dawn
    var cOn = step > 0;
    show(C, cOn);
    if (cOn) {
      // a phone: the house in the half screen above the card while it is read, the whole screen once it has gone
      if (tall) place(C, mix(0.8, 1.0, rest), 0.5, 0.4, 0.5, mix(0.22, 0.4, rest), rest > 0.999);
      var g = 'rgb(' + [mix(20, 79, dawn), mix(30, 85, dawn), mix(35, 61, dawn)].map(Math.round).join(',') + ')';
      if (g !== C.bg) { C.el.style.background = g; C.bg = g; }
      else place(C, mix(1.14, 1.0, rest), 0.5, 0.45, mix(0.68, 0.5, rest), 0.5, true);
      var d = dawn.toFixed(3);
      if (d !== lastDay) { day.style.opacity = d; lastDay = d; }
      var sk = (dawn * 0.82).toFixed(3);
      if (sk !== lastSky) { sky.style.opacity = sk; lastSky = sk; }
      var bd = (Math.sin(Math.PI * clamp(dawn * 0.9 + 0.1, 0, 1)) * 0.5 + dawn * 0.35).toFixed(3);
      if (bd !== lastBand) { band.style.opacity = bd; lastBand = bd; }
    }
    return imgs.every(function (i) { return i.complete; });
  }

  resize();
  return {
    frame: frame,
    resize: resize,
    setActive: function () { /* nothing here plays: there is nothing to start or stop */ },
    dispose: function () { host.innerHTML = ''; host.classList.remove('end-host'); imgs = []; },
    info: function () { return { layers: host.querySelectorAll('.end-layer').length, tall: tall }; },
    ready: function () { return imgs.every(function (i) { return i.complete; }); },
  };
}
