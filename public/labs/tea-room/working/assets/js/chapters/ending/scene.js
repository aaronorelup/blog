// THE ENDING: the pictures behind the page's last three chapters, Courses, Now and About (the tea room test
// tests/the-ending/, its js/scene.js, made a part of the page: ../ending.js drives it). Pictures only: everything read
// is on the cards in the page's flow, over this.
//
//   mount(host, options) -> { frame(q), resize(), dispose(), ready(), room() }
//
// q runs 0..1 over the three chapters, a third each: 0..1/3 Courses, 1/3..2/3 Now, 2/3..1 About. Inside a third,
// 0..0.7 is the stretch where its card passes and 0.7..1 the scene alone after it (../ending.js measures both, as the
// test's host.js did). Everything drawn is a function of q only: no time, no pointer, nothing that plays. The night
// is quiet on purpose.
//   Courses: the back room, not ready yet. The camera leans in a little; at the end the view slides over to the
//            veranda (look B's slide over to night).
//   Now:     the veranda over the still garden, the moon the only light. Nothing moves at all.
//   About:   the same garden as the first light comes. The night plate gives way to the morning one as the reader
//            goes down, and the camera steps back to the whole garden for the last frame.
// options.reduced: no camera moves; the slide and the dawn are single steps.
// Changed from the test: the plates by addresses relative to this file (look B's own copies) or the site's own
// (/tea/hero/), the room's framing shared with the walk's door (room()), and lead: q below 0 is the camera still
// coming in through the door into the room (../ending.js: the join).
import { roomProps, veranda, moon } from './props.js';

var IMG = new URL('../../../img/', import.meta.url).href, HERO = '/tea/hero/';
var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
var mix = function (a, b, t) { return a + (b - a) * t; };

function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
function svg(w, h, body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="position:absolute;left:0;top:0;overflow:visible">' + body + '</svg>';
}

// The room's framing: where the room plate stands on a screen W x H at the Courses chapter's push (0 at its top, 1
// once its card has passed). Shared with the walk's door (join.js), which ends on exactly this picture at push 0.
export function roomPlace(W, H, push, fill) {
  var tall = W / H < 0.9, s;
  if (tall) s = { k: mix(mix(0.62, 0.66, push), 1.0, fill), fx: 0.6, fy: 0.62, sx: 0.5, sy: mix(0.29, 0.62, fill), cover: false };
  else s = { k: mix(1.0, 1.07, push), fx: 0.62, fy: 0.6, sx: 0.68, sy: 0.6, cover: true };
  return placeOf(2752, 1536, W, H, s.k, s.fx, s.fy, s.sx, s.sy, s.cover);
}
// a plate w x h so that its point (fx, fy) (fractions of the plate) is at (sx, sy) (fractions of the screen), at k
// times the size that covers the screen; cover: keep the screen covered (nothing of the page shows round it)
function placeOf(w, h, W, H, k, fx, fy, sx, sy, cover) {
  var sc = Math.max(W / w, H / h) * k;
  var pw = w * sc, ph = h * sc;
  var tx = sx * W - fx * pw, ty = sy * H - fy * ph;
  tx = clamp(tx, Math.min(0, W - pw), 0);
  if (cover) ty = clamp(ty, Math.min(0, H - ph), 0); else ty = Math.min(ty, 0);
  return { x: tx, y: ty, s: sc };
}

// The back room alone, as the walk's door shows it (join.js ENDING): the same room, its drawn props and its foot, styled
// inline (this chapter's style sheet is not in yet while the walk's camera comes up to the door). put(pl, tall) places
// it as roomPlace() gives it; ready() once its plate is in.
export function roomScene(parent) {
  var s = el('div', '', parent);
  s.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;background:#1d1520';
  var p = el('div', '', s);
  p.style.cssText = 'position:absolute;left:0;top:0;width:2752px;height:1536px;transform-origin:0 0';
  var i = el('img', '', p); i.alt = ''; i.decoding = 'async'; i.draggable = false; i.src = IMG + 'room.webp';
  i.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;max-width:none';
  var g = el('div', '', p); g.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; g.innerHTML = svg(2752, 1536, roomProps());
  var foot = el('div', '', p);
  foot.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(29, 21, 32, 0) 84%, #1d1520 99%)';
  var tr = '', ft = '';
  return {
    el: s,
    put: function (pl, tall) {
      var t = 'translate3d(' + pl.x.toFixed(2) + 'px,' + pl.y.toFixed(2) + 'px,0) scale(' + pl.s.toFixed(5) + ')';
      if (t !== tr) { p.style.transform = t; tr = t; }
      var f = tall ? 'block' : 'none';
      if (f !== ft) { foot.style.display = f; ft = f; }
    },
    ready: function () { return i.complete; }
  };
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
    return { el: s, plate: p, w: w, h: h, tr: '', vis: '', op: '', sl: '' };
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
    host.classList.toggle('tall', tall);
    [A, B, C].forEach(function (s) { s.tr = ''; s.sl = ''; });
  }

  function put(s, pl, dx) {
    var tr = 'translate3d(' + pl.x.toFixed(2) + 'px,' + pl.y.toFixed(2) + 'px,0) scale(' + pl.s.toFixed(5) + ')';
    if (tr !== s.tr) { s.plate.style.transform = tr; s.tr = tr; }
    // the slide between two scenes moves the whole window, its ground colour with it
    var sl = dx ? 'translate3d(' + dx.toFixed(2) + 'px,0,0)' : '';
    if (sl !== s.sl) { s.el.style.transform = sl; s.sl = sl; }
  }
  function place(s, k, fx, fy, sx, sy, cover, dx) { put(s, placeOf(s.w, s.h, W, H, k, fx, fy, sx, sy, cover), dx); }
  function show(s, on, op) {
    var v = on ? 'inherit' : 'hidden';           // (inherit, never visible: the chapter's layer is switched by chapters.js)
    if (v !== s.vis) { s.el.style.visibility = v; s.vis = v; }
    var o = (op == null ? 1 : op).toFixed(3);
    if (o !== s.op) { s.el.style.opacity = o; s.op = o; }
  }
  var lastFoot = '', lastDay = '', lastSky = '', lastBand = '', lastVer = '';

  // q: as above. room: a placement of the room plate to use instead of the chapter's own (the camera still coming in
  // through the door, in the lead)
  function frame(q, room) {
    q = clamp(q || 0, 0, 1);
    var uA = clamp(q * 3, 0, 1), uC = clamp(q * 3 - 2, 0, 1);

    // Courses -> Now: the view slides over to the veranda once the card has gone
    var slide = RM ? (uA >= 0.88 ? 1 : 0) : ss(0.8, 1, uA);
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
      put(A, room || roomPlace(W, H, push, fill), -slide * W);
    }

    // --- the veranda: still. It is placed the same for every q.
    var bOn = slide > 0 && step < 1;
    show(B, bOn);
    if (bOn) {
      if (tall) place(B, 0.82, 0.44, 0.222, 0.5, 0.17, false, (1 - slide) * W);
      else place(B, 1.0, 0.42, 0.5, 0.38, 0.5, true, (1 - slide) * W);
      var vk = 'scale(' + (1 + step * 0.18).toFixed(4) + ')';
      if (vk !== lastVer) { ver.style.transform = vk; lastVer = vk; }
    }

    // --- the dawn
    var cOn = step > 0;
    show(C, cOn, step);          // the garden comes up over the veranda
    if (cOn) {
      // a phone: the house in the half screen above the card while it is read, the whole screen once it has gone
      if (tall) place(C, mix(0.8, 1.0, rest), 0.5, 0.4, 0.5, mix(0.22, 0.4, rest), rest > 0.999);
      else place(C, mix(1.14, 1.0, rest), 0.5, 0.45, mix(0.68, 0.5, rest), 0.5, true);
      // under the plate (a phone, while the card is read): the lawn's own colour, by night and by morning
      var g = 'rgb(' + [mix(20, 79, dawn), mix(30, 85, dawn), mix(35, 61, dawn)].map(Math.round).join(',') + ')';
      if (g !== C.bg) { C.el.style.background = g; C.bg = g; }
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
    dispose: function () { host.innerHTML = ''; host.classList.remove('end-host'); imgs = []; },
    ready: function () { return imgs.every(function (i) { return i.complete; }); },
    size: function () { return { W: W, H: H, tall: tall }; }
  };
}
