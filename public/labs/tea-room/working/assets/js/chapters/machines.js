/* THE MACHINES ON THE BENCH: a short passage without words between the toy box and the agents chapter. Two of his
   machines from the teardown lab, DRAY and then MOLE-1, each its own page shown live by its own address in a frame
   this chapter works from outside (machines-live.js). Nothing of the lab's notebook is copied: its pages, stills and
   films are used by their addresses (machines-data.js).

   How it joins: the toy box's room is the same painting as this chapter's room (img/room.webp). Its toys go back into
   their box (toybox.js PACK), and over its last screens (this chapter's lead) the camera comes down a little onto the
   place of the bench (join.js benchLayout; toybox.js TURN moves the toys' room the same way) while the bench comes up
   in front of the closed box: the low table, the backdrop let down behind it and unrolled forward over it, the
   television on the floor. The room goes down to night, the lamp comes on, and DRAY is set down in the dark. (At the
   section's top CHAPTERS swaps the two rooms: they are the same painting.)

   Then each machine is on the table already working (DRAY drives up to its module and lifts a bag; MOLE-1 digs and
   dumps), its camera turning slowly round it, the mouse leaning the camera further round and over it. As the reader
   scrolls, it opens: its page's own cut-away and picked-out parts (machines-data.js open), then whole again; the lamp
   dips and the next is set down. Then the bench is put away and the camera goes into the little television on the
   floor, which has played the machine's film all along (join.js AGENTS: the agents chapter's way in).

   Scroll decides the bench, the lights, which machine and which state of it. Time decides only what the machine's own
   page does by itself in that state (its work, its sway, its eases), as a film would. With time held (?still=1),
   motion off or ?live=0 the machines are their stills and the television its poster; motion off: cuts. */
import { MACHINES } from './machines-data.js';
import { createLive } from './machines-live.js';
import { benchLayout, TABLE, AGENTS, tvPlace, tvDive } from './join.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var smooth = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
var ss = function (a, b, x) { return smooth((x - a) / (b - a)); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

// the one hanging lamp over the bench, inked like the room (its cord runs up out of the picture)
var LAMP_SVG = '<svg class="mc-lamp-svg" viewBox="0 0 100 160" width="100" height="160" aria-hidden="true">' +
  '<defs><radialGradient id="mcLampGlass" cx="50%" cy="58%" r="60%">' +
  '<stop offset="0" stop-color="#fff6dc"/><stop offset="0.45" stop-color="#ffd58c"/><stop offset="0.85" stop-color="#f09a48"/><stop offset="1" stop-color="#c8682e"/>' +
  '</radialGradient></defs>' +
  '<path d="M50 -1400 V22" stroke="#1d1520" stroke-width="2.4" fill="none"/>' +
  '<path d="M37 21 h26 l3 10 h-32 z" fill="#2b1e25" stroke="#1d1520" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<ellipse cx="50" cy="83" rx="39" ry="53" fill="url(#mcLampGlass)" stroke="#1d1520" stroke-width="3"/>' +
  '<g fill="none" stroke="#a5532a" stroke-opacity="0.5" stroke-width="1.3">' +
  '<path d="M24 44 Q50 50 76 44"/><path d="M16 58 Q50 66 84 58"/><path d="M12 73 Q50 82 88 73"/><path d="M11 88 Q50 97 89 88"/>' +
  '<path d="M14 103 Q50 111 86 103"/><path d="M21 118 Q50 125 79 118"/></g>' +
  '<path d="M34 134 h32 l-3 10 h-26 z" fill="#2b1e25" stroke="#1d1520" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<path d="M50 144 v9" stroke="#1d1520" stroke-width="2"/></svg>';

// ---- the scroll, in screens from the section's top (p; the lead is negative)
// the lead (the toy box's foot, toybox.js TURN and PACK, runs under it): the camera comes down onto the bench's place
// while the bench comes up, the lamp is let down and lit, the backdrop unrolls, and DRAY is set down in the dark
var LOWER = [-1.68, -1.1];                // the lantern and the backdrop's rod are let down from above the frame
var LIGHT = [-1.42, -0.91];               // the lantern comes on
var RISE = [-1.61, -0.88];                // the table comes up into the frame (the camera comes down to its height)
var TVRISE = [-1.39, -0.58];              // the television, nearest, comes up last and fastest
var UNROLL = [-1.1, -0.62];               // the backdrop unrolls from its rod down over the table (once it stands)
var APPEAR = [-0.67, -0.57];              // and the first machine is set down on it, in the dark:
var SETDOWN = [-0.82, -0.67, -0.57, -0.4]; // the lamp dips, the machine is there, the lamp comes up again
var DIM = [-1.61, -0.88];                 // the room goes down to the bench's night
// motion off: everything of the lead comes in one cut, at the toy box's own cut to the bench's place (its TURN's
// middle, ft = p + 2.2: its foot is 2.2 screens and ends at #machines)
var RM_CUT = -1.31;
// the machines: DRAY from where it is set down to SWAP, MOLE-1 from SWAP to the walk's end (LD). At SWAP the lamp dips
// and the next machine is set down in the dark (DIP screens each side); then the bench is put away (join.js AGENTS)
var LD = 3.4, SWAP = 1.6, DIP = 0.1, SPANS = [[-0.6, SWAP], [SWAP, LD + 0.05]];
// the live page is let in once the bench is coming up (it takes some seconds to wake), and let go as the bench goes
var LIVE_FROM = -1.5;

function stepOf(m, u) { var s = m.open[0]; m.open.forEach(function (o) { if (u >= o.at) s = o; }); return s; }

// a 1600 x 900 picture of the page (its still, the page itself) placed in a box so the crop shows
function cropRect(boxW, boxH, crop) {
  var s = Math.max(boxH / crop.vh, crop.vw ? boxW / crop.vw : 0);
  s = Math.max(s, boxW / 1600, boxH / 900);
  var W = 1600 * s, H = 900 * s;
  return { left: clamp(boxW / 2 - crop.cx * s, boxW - W, 0), top: clamp(boxH / 2 - crop.cy * s, boxH - H, 0), W: W, H: H };
}
// the console around a still's machine: everything outside its box
function outside(k) {
  var x = k[0], y = k[1], w = k[2], h = k[3];
  return [[0, 0, 1600, y], [0, y + h, 1600, 900 - y - h], [0, y, x, h], [x + w, y, 1600 - x - w, h]];
}

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, top = options.top;
  var params = new URLSearchParams(location.search);
  var LIVE = !HELD && params.get('live') !== '0';
  var root = document.documentElement, alive = true;

  host.innerHTML =
    '<div class="mc-dim"></div>' +
    '<div class="mc-world">' +
      '<div class="mc-room"><img class="mc-room-img" src="' + IMG + 'room.webp" width="2752" height="1536" alt="" decoding="async"></div>' +
      '<div class="mc-vig"></div>' +
      '<div class="mc-cone"></div>' +
        '<img class="mc-table mc-up" src="' + IMG + 'machines/bench-table.webp" width="873" height="682" alt="" decoding="async">' +
        '<div class="mc-sweep"></div>' +
        '<div class="mc-pool mc-up"></div><div class="mc-shade mc-up"></div>' +
        '<div class="mc-view mc-up">' +
          '<div class="mc-pics"><img class="mc-pic a" alt=""><img class="mc-pic b" alt=""><div class="mc-erase"></div></div>' +
          '<div class="mc-holder"></div>' +
        '</div>' +
      '<div class="mc-tv"><div class="mc-tv-glow"></div><div class="mc-tv-flip">' +
        '<div class="mc-tv-screen"><img class="mc-tv-still" alt=""><video class="mc-tv-film" muted playsinline loop preload="none" disableremoteplayback tabindex="-1"></video></div>' +
        '<img class="mc-tv-body" src="' + IMG + 'tv-body.webp" width="1200" height="1093" alt="">' +
      '</div></div>' +
      '<div class="mc-lamp">' + LAMP_SVG + '<div class="mc-lamp-glow"></div></div>' +
    '</div>';
  // the only words: the machine's own name, which is the way to its whole teardown
  top.innerHTML = '<a class="mc-name"></a>';

  var $ = function (s) { return host.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(host.querySelectorAll(s)); };
  var cone = $('.mc-cone'), dim = $('.mc-dim'), world = $('.mc-world'), roomEl = $('.mc-room'), roomImg = $('.mc-room-img'), vig = $('.mc-vig');
  var ups = $$('.mc-up'), sweep = $('.mc-sweep'), table = $('.mc-table'), view = $('.mc-view'), pics = $('.mc-pics');
  var picA = $('.mc-pic.a'), picB = $('.mc-pic.b'), erase = $('.mc-erase'), holder = $('.mc-holder');
  var tv = $('.mc-tv'), tvFilm = $('.mc-tv-film'), tvStill = $('.mc-tv-still'), lampEl = $('.mc-lamp');
  var nameEl = top.querySelector('.mc-name');
  if (HELD) host.classList.add('mc-held');
  tvFilm.addEventListener('playing', function () { tvFilm.classList.add('on'); });

  // the pictures this chapter needs before its first frame is whole: the table, the room
  var pending = 0;
  [roomImg, table].forEach(function (im) { if (!(im.complete && im.naturalWidth)) { pending++; im.addEventListener('load', function () { pending--; options.redraw(); }, { once: true }); im.addEventListener('error', function () { pending--; options.redraw(); }, { once: true }); } });

  var TVP = null, roll = null, rollG = null, sweepH = 0, W = 0, H = 0, L = null, phone = false, laid = false;
  var cur = -1, live = null, liveI = -1, liveTimer = null, pendingI = -1, failed = new Set();
  var tvOn = false, lean = { x: 0, y: 0 }, lastT = 0;
  var picShown = { a: '', b: '' }, picFront = 'a', picsIn = {};
  var viewW = 0, viewH = 0;

  // ---- layout: everything of the bench in screen pixels at the camera's place (join.js), the room behind it
  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null;
    L = benchLayout(W, H, rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null);
    phone = L.phone;
    host.classList.toggle('mc-phone', phone); top.classList.toggle('mc-phone', phone);
    var bx = L.bx, by = L.by, bw = L.bw, bh = L.bh;
    Object.assign(view.style, { left: bx + 'px', top: by + 'px', width: bw + 'px', height: bh + 'px' });
    // (the machine's page is multiplied onto the backdrop and the table: where neither is behind it, as over the toy
    // box's room in the lead, its pale studio would show; so it is cut to the backdrop's sides and top above the table)
    var cy = ((L.tcy - L.try * 0.55 - by) / bh * 100).toFixed(2);
    view.style.clipPath = 'polygon(10% 3%, 90% 3%, 90% ' + cy + '%, 100% ' + cy + '%, 100% 100%, 0 100%, 0 ' + cy + '%, 10% ' + cy + '%)';
    viewW = bw; viewH = bh;
    Object.assign(table.style, { left: (L.tcx - TABLE.cx * L.ts) + 'px', top: (L.tcy - TABLE.cy * L.ts) + 'px', width: L.tw + 'px' });
    [host, top].forEach(function (e) {
      e.style.setProperty('--tcx', L.tcx + 'px'); e.style.setProperty('--tcy', L.tcy + 'px');
      e.style.setProperty('--trx', L.trx + 'px'); e.style.setProperty('--try', L.try + 'px');
    });
    sweep.innerHTML = sweepSvg(bx, by, bw, bh, L.tcx, L.tcy, L.try, W);
    sweepH = Math.ceil(L.tcy + L.try * 0.42 + L.try); sweep.style.height = sweepH + 'px';
    // (the sheet's roll, while it is rolled up again at the end: a tube on its lower edge; see frame)
    roll = document.createElement('div'); roll.className = 'mc-roll'; sweep.appendChild(roll);
    rollG = { L: bx + bw * 0.1, R: bx + bw * 0.9, d: bw * 0.045, yB: L.tcy - L.try * 0.62, yF: L.tcy + L.try * 0.42, h: Math.round(Math.max(9, Math.min(26, bh * 0.034))) };
    Object.assign(roll.style, { height: rollG.h + 'px', borderRadius: (rollG.h / 2) + 'px', visibility: 'hidden' }); was.roll = '';
    var lw = L.lampW, ly = L.lampY;
    Object.assign(lampEl.style, { left: (L.tcx - lw / 2) + 'px', top: ly + 'px', width: lw + 'px' });
    host.style.setProperty('--lx', L.tcx + 'px'); host.style.setProperty('--ly', (ly + lw) + 'px');
    if (L.tv) Object.assign(tv.style, { width: L.tv.w + 'px', left: L.tv.l + 'px', top: L.tv.t + 'px' });
    roomImg._s = undefined;                          // (frame() places the room: the phone's tilt moves it)
    TVP = tvPlace(W, H, rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null);
    // the name: on the table's dark front edge, under the machine
    nameEl.style.left = L.tcx + 'px';
    nameEl.style.top = (L.tcy + L.try * 1.08) + 'px';
    placeAll();
    laid = true;
  }
  function placeMedia(node, c) {
    if (!node) return;
    var r = cropRect(viewW, viewH, c);
    Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
  }
  function cropFor(m) { return phone ? m.cropNarrow : m.crop; }
  // (the live page may be framed apart from the still: its camera is set by machines-live.js)
  function liveCropFor(m) { return (phone ? m.liveCropNarrow : m.liveCrop) || cropFor(m); }
  function placeAll() {
    var m = MACHINES[Math.max(0, cur)];
    placeMedia(picA, cropFor(m)); placeMedia(picB, cropFor(m));
    placeMedia(holder.querySelector('iframe'), liveCropFor(m));
    placeTv(m);
    placeErase(m);
  }
  // the television shows the same machine, closer: its film cropped to the machine, never to the page's console
  function placeTv(m) {
    if (phone || !L || !L.tv) return;
    var sw = L.tv.w * 0.504, sh = L.tv.h * 0.494;
    var c = { cx: m.crop.cx, cy: m.crop.cy, vh: m.crop.vh * 0.92, vw: m.crop.vw * 0.92 };
    [tvFilm, tvStill].forEach(function (node) {
      var r = cropRect(sw, sh, c);
      Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
    });
  }
  // the still is a picture of the whole page, console and all: white (nothing, on the bench) over what is not the
  // machine, and the page's labels over the machine smudged
  function placeErase(m) {
    var boxes = outside(m.keep).concat(m.erase.map(function (b) { return b.concat(['w']); }));
    var r = cropRect(viewW, viewH, cropFor(m)), k = r.W / 1600;
    erase.innerHTML = boxes.map(function (b) {
      return '<i' + (b[4] ? ' class="w"' : '') + ' style="left:' + (r.left + b[0] * k).toFixed(1) + 'px;top:' + (r.top + b[1] * k).toFixed(1) + 'px;width:' + (b[2] * k).toFixed(1) + 'px;height:' + (b[3] * k).toFixed(1) + 'px"></i>';
    }).join('');
  }
  // the still under the live page: two layers, cross-faded when the machine changes
  function showPic(src) {
    var front = picFront === 'a' ? picA : picB, back = picFront === 'a' ? picB : picA;
    if (picShown[picFront] === src) return;
    var backKey = picFront === 'a' ? 'b' : 'a';
    if (picShown[backKey] !== src) {
      back.src = src; picShown[backKey] = src;
      if (!picsIn[src]) back.addEventListener('load', function () { picsIn[src] = true; options.redraw(); }, { once: true });
    }
    back.classList.add('on'); front.classList.remove('on');
    picFront = backKey;
  }
  function setMachine(i) {
    cur = i;
    var m = MACHINES[i];
    showPic(m.still);
    placeAll();
    nameEl.textContent = m.name;
    nameEl.href = m.page;
    nameEl.setAttribute('aria-label', m.name + ': its whole teardown');
    if (!phone) tvStill.src = m.poster;
    tvFilm.classList.remove('on');
  }

  // ---- the live page in the frame: only one, only for the machine on the table, while the passage is on the screen
  function wantLive(i) {
    if (!LIVE || failed.has(i)) return dropLive();
    if (liveI === i || pendingI === i) return;
    dropLive();
    pendingI = i;
    liveTimer = setTimeout(function () { pendingI = -1; startLive(i); }, 160);
  }
  function startLive(i) {
    if (!alive || cur !== i) return;
    var m = MACHINES[i];
    liveI = i;
    live = createLive(m, holder, {
      onReady: function () { host.classList.add('mc-alive'); },
      onFail: function () { failed.add(i); live = null; liveI = -1; host.classList.remove('mc-alive'); }
    });
    placeMedia(holder.querySelector('iframe'), liveCropFor(m));
  }
  function dropLive() {
    clearTimeout(liveTimer); pendingI = -1;
    if (live) { live.dispose(); live = null; }
    liveI = -1; host.classList.remove('mc-alive');
  }
  // (nothing plays on unseen: once the host shows this chapter no more (CHAPTERS show()), the passage is off the screen)
  var watch = setInterval(function () {
    if (host.style.visibility !== 'visible') { dropLive(); if (tvOn) { tvOn = false; tvFilm.pause(); } }
  }, 500);

  // ---- every frame
  var was = {};
  function css(e, k, v) { if (e._s === undefined) e._s = {}; if (e._s[k] !== v) { e._s[k] = v; e.style[k] = v; } }
  function frame(q, t, pointer) {
    if (!alive) return false;
    if (!laid) layout();
    var p = q < 0 ? q : q * options.span(), isLead = q < 0;
    // (in the lead this is drawn over the toy box's last picture: only once that picture is there, or a fresh load
    // would show the bench over the chapter before it)
    if (isLead) {
      var tb = window.TEA && window.TEA.list.filter(function (c) { return c.id === 'toybox'; })[0];
      if (!tb || !tb.scene || !tb.whole) return false;
    }
    if (pending > 0) return false;
    var i = p < SWAP ? 0 : 1, m = MACHINES[i], sp = SPANS[i];
    if (i !== cur) setMachine(i);
    var u = clamp((p - sp[0]) / (sp[1] - sp[0]));
    // (screens before the agents section's top: the section ends one screen after q = 1)
    var pa = isLead ? -99 : (q - 1) * options.span() - 1;
    var pk = RM ? (pa > (AGENTS.PACK[0] + AGENTS.PACK[1]) / 2 ? 1 : 0) : clamp((pa - AGENTS.PACK[0]) / (AGENTS.PACK[1] - AGENTS.PACK[0]));
    var dive = RM ? (pa > AGENTS.RM_CUT ? 1 : 0) : clamp((pa - AGENTS.DIVE[0]) / (AGENTS.DIVE[1] - AGENTS.DIVE[0]));
    var packOut = function (a, b) { return RM ? pk : io(ss(a, b, pk)); };

    // ---- the machine itself: alive from the bench's rise until the bench is put away; its opening is the scroll's
    if (p > LIVE_FROM && pk < 0.2) wantLive(i); else dropLive();
    if (live) {
      var st = stepOf(m, u), tn = m.turn;
      live.set(st);
      // the camera: the scroll carries it round, a slow sway of its own, and the mouse leans it (on a phone, none)
      lean.x += ((pointer ? pointer.x : 0) - lean.x) * 0.12; lean.y += ((pointer ? pointer.y : 0) - lean.y) * 0.12;
      var az = lerp(tn.from, tn.to, smooth(u)) + tn.sway * Math.sin(t * Math.PI * 2 / 22) + tn.lean * lean.x;
      live.orbit(az, -tn.tilt * lean.y);
    }
    // the television plays the machine's film with no sound, from the moment the machine is on the table until its
    // glass turns to the terminal (the agents chapter, join.js AGENTS TUNE)
    var wantTv = !HELD && !phone && p > APPEAR[0] && pa < AGENTS.TUNE[1];
    if (wantTv !== tvOn || (wantTv && tvFilm.getAttribute('src') !== m.film)) {
      tvOn = wantTv;
      if (wantTv) { if (tvFilm.getAttribute('src') !== m.film) tvFilm.src = m.film; tvFilm.play().catch(function () {}); }
      else tvFilm.pause();
    }

    // ---- the lead: the crane, the bench coming up, the lights
    var cut = p > RM_CUT ? 1 : 0;
    var rise = RM ? cut : io(ss(RISE[0], RISE[1], p));
    var tvRise = RM ? rise : io(ss(TVRISE[0], TVRISE[1], p));
    var dimK = RM ? cut : ss(DIM[0], DIM[1], p);
    var lower = RM ? cut : io(ss(LOWER[0], LOWER[1], p));
    var light = RM ? cut : ss(LIGHT[0], LIGHT[1], p);
    var unroll = RM ? cut : io(ss(UNROLL[0], UNROLL[1], p));
    var appear = RM ? cut : ss(APPEAR[0], APPEAR[1], p);
    // put away, in the order it was set up backwards: the machine, the backdrop, the lamp and its rod, the table
    if (pk > 0) {
      appear *= 1 - (RM ? pk : ss(0, 0.25, pk));
      unroll *= 1 - packOut(0.1, 0.55);
      lower *= 1 - packOut(0.4, 0.85);
      rise *= 1 - packOut(0.5, 1);
      light *= 1 - packOut(0.3, 0.8);
    }
    // the room: the camera's place over the crane (in the lead the toy box draws the room; this chapter only its night)
    css(roomEl, 'visibility', isLead ? 'hidden' : '');
    css(dim, 'opacity', isLead ? dimK.toFixed(3) : '0');
    css(vig, 'opacity', (isLead ? dimK : 1).toFixed(3));
    // the near things come up from below the frame, the nearest fastest (the camera comes down to the table's height)
    // (a phone: the bench stands lower in the frame, the camera tilted up a little, as the agents chapter expects)
    var lowY = phone ? H * 0.16 : 0, roomLow = phone ? H * 0.05 : 0;
    var off = (1 - rise) * (H - L.by + 40) + lowY, tvOff = (1 - tvRise) * (H - (L.tv ? L.tv.t : H) + 60);
    var upTr = off > 0.05 ? 'translate3d(0,' + off.toFixed(1) + 'px,0)' : '', upVis = rise <= 0.0005 ? 'hidden' : '';
    ups.forEach(function (e) { css(e, 'transform', upTr); css(e, 'visibility', upVis); });
    css(tv, 'transform', tvOff > 0.05 ? 'translate3d(0,' + tvOff.toFixed(1) + 'px,0)' : '');
    css(tv, 'visibility', tvRise <= 0.0005 || phone ? 'hidden' : '');
    // the lantern: let down on its cord from above the frame; the backdrop's rod with it, then the sheet unrolls
    var lampOff = -(1 - lower) * (L.lampY + L.lampW * 1.6 + 30) + lowY;
    css(lampEl, 'visibility', lower <= 0.0005 ? 'hidden' : '');
    var rodY = L.by + L.bh * 0.03, rodOff = -(1 - lower) * (rodY + 30) + lowY, sheetH = sweepH - rodY;
    css(lampEl, 'transform', Math.abs(lampOff) > 0.05 ? 'translate3d(0,' + lampOff.toFixed(1) + 'px,0)' : '');
    css(roomImg, 'transform', dive > 0 ? 'translate(' + L.room.tx + 'px,' + (L.room.ty + roomLow).toFixed(1) + 'px) scale(' + L.room.s + ')'
      : 'translate3d(' + L.room.tx + 'px,' + (L.room.ty + roomLow).toFixed(1) + 'px,0) scale(' + L.room.s + ')');
    if (was.diving !== dive > 0) { was.diving = dive > 0; world.classList.toggle('mc-diving', dive > 0); }
    css(sweep, 'transform', Math.abs(rodOff) > 0.05 ? 'translate3d(0,' + rodOff.toFixed(1) + 'px,0)' : '');
    css(sweep, 'visibility', lower <= 0.0005 ? 'hidden' : '');
    // (put away at the end, the sheet rolls up onto a tube that climbs back to the rod: not a flat cut edge)
    var rolling = pk > 0 && unroll < 0.999 && lower > 0.0005 && !!roll;
    var rh = rolling ? rollG.h : 0, edgeY = rodY + sheetH * unroll;
    css(sweep, 'clipPath', unroll < 1 ? 'inset(-50px 0 ' + Math.max(0, sheetH * (1 - unroll) + (unroll > 0 || rolling ? 0 : 6) - rh * 0.9).toFixed(1) + 'px 0)' : '');
    if (rolling) {
      var wide = rollG.d * clamp((edgeY - rollG.yB) / (rollG.yF - rollG.yB)) + rh * 0.35;
      var rs = 'l' + (rollG.L - wide).toFixed(1) + 'w' + (rollG.R - rollG.L + 2 * wide).toFixed(1) + 't' + (edgeY - rh * 0.15).toFixed(1);
      if (was.roll !== rs) { was.roll = rs; Object.assign(roll.style, { left: (rollG.L - wide).toFixed(1) + 'px', width: (rollG.R - rollG.L + 2 * wide).toFixed(1) + 'px', top: (edgeY - rh * 0.15).toFixed(1) + 'px', visibility: '' }); }
    } else if (roll && was.roll !== '') { was.roll = ''; roll.style.visibility = 'hidden'; }

    // the lamp: lit over a machine, dipped while the next is set down in the dark, put away at the end
    var between = RM ? 1 : smooth(Math.abs(p - SWAP) / DIP);
    var lit = light * (0.2 + 0.8 * between);
    if (isLead) lit = light * (RM ? 1 : 1 - 0.8 * (ss(SETDOWN[0], SETDOWN[1], p) - ss(SETDOWN[2], SETDOWN[3], p)));
    css(cone, 'opacity', pk > 0 ? String(+(1 - packOut(0.3, 0.8)).toFixed(3) * (0.18 + 0.82 * lit)) : '');
    var litS = lit.toFixed(3);
    if (was.lit !== litS) { was.lit = litS; host.style.setProperty('--lit', litS); }
    // the machine: solid whenever it stands (the backdrop it is multiplied onto carries the lamp's light), gone only
    // at the swap, while the next is set down in the dark
    var vis = appear * (RM ? 1 : smooth(Math.abs(p - SWAP) / (DIP * 0.6)));
    var visS = vis.toFixed(3);
    if (was.vis !== visS) { was.vis = visS; host.style.setProperty('--vis', visS); }
    // its name on the table's edge, with it (never in the lead's first part, never once the bench goes)
    var nameOn = vis > 0.6 && pk < 0.05;
    if (was.name !== nameOn) { was.name = nameOn; nameEl.classList.toggle('up', nameOn); nameEl.tabIndex = nameOn ? 0 : -1; }
    css(nameEl, 'transform', 'translate3d(-50%,' + (lowY + (1 - rise) * (H - L.by + 40)).toFixed(1) + 'px,0)');
    // the still, while the page wakes or where there is none: it leans a little with the mouse, as the page would turn
    if (!RM && !HELD) {
      var lx = pointer ? pointer.x : 0;
      was.lx = (was.lx || 0) + (lx - (was.lx || 0)) * 0.08;
      css(pics, 'transform', Math.abs(was.lx) > 0.002 ? 'translate3d(' + (was.lx * viewW * -0.012).toFixed(1) + 'px,0,0)' : '');
    }
    // the camera: a slow push in on the bench over the whole passage, drawn back as the bench is put away
    var zoom = RM || isLead ? 1 : 1 + 0.035 * smooth(p / LD) * (1 - pk);
    if (dive > 0) {
      // into the television (join.js tvDive: the agents chapter reckons the same move); once its glass is the frame and
      // the agents chapter's picture is over it, this room is not drawn
      // (flat, with no will-change in the world while it moves (.mc-diving): a layer kept for the move keeps the largest
      // scale it was drawn at, and scrolled back up out of the dive it no longer fits the browser's tile memory)
      var d = tvDive(TVP, W, H, dive);
      css(world, 'transformOrigin', '0 0');
      css(world, 'transform', 'translate(' + d.tx.toFixed(2) + 'px,' + d.ty.toFixed(2) + 'px) scale(' + d.Z.toFixed(5) + ')');
      var ag = window.TEA && window.TEA.list.filter(function (c) { return c.id === 'agents'; })[0];
      css(world, 'visibility', dive >= 1 && ag && ag.scene && ag.whole ? 'hidden' : '');
    } else {
      css(world, 'transformOrigin', L.tcx + 'px ' + (L.tcy - L.bh * 0.35) + 'px'); css(world, 'visibility', '');
      css(world, 'transform', zoom !== 1 ? 'scale(' + zoom.toFixed(5) + ')' : '');
    }
    lastT = t;
    // whole: the bench's pictures and the machine's still are in
    var still = picShown[picFront];
    return !still || !!picsIn[still] || (picFront === 'a' ? picA : picB).complete;
  }

  function setActive(on) {
    if (!on && tvOn) { tvOn = false; tvFilm.pause(); }
  }
  var onVis = function () { if (document.hidden) { tvFilm.pause(); tvOn = false; } };
  document.addEventListener('visibilitychange', onVis);

  return {
    frame: frame,
    resize: function () { if (laid) layout(); },
    setActive: setActive,
    dispose: function () {
      alive = false; clearInterval(watch); dropLive(); tvFilm.pause(); tvOn = false;
      document.removeEventListener('visibilitychange', onVis);
      tvFilm.removeAttribute('src');
    },
    // (for tests)
    get state() { return { i: cur, live: !!(live && live.ready), liveI: liveI, failed: Array.from(failed), debug: live ? live.debug : null }; },
    LD: LD
  };
}

/* the backdrop behind and under the machine, in screen pixels: a sheet hung from a rod behind the table and run forward
   onto it, as models are lit on a bench, outlined in the room's ink and lit warm from the lamp above */
function sweepSvg(bx, by, bw, bh, tcx, tcy, tRy, W) {
  var L = bx + bw * 0.1, R = bx + bw * 0.9, T = by + bh * 0.03;
  var yB = tcy - tRy * 0.62, yF = tcy + tRy * 0.42, d = bw * 0.045;
  var f = function (v) { return v.toFixed(1); };
  var path = 'M' + f(L) + ' ' + f(T) + ' H' + f(R) + ' V' + f(yB) + ' C' + f(R) + ' ' + f(yB + tRy * 0.35) + ' ' + f(R + d) + ' ' + f(yF - tRy * 0.5) + ' ' + f(R + d) + ' ' + f(yF - tRy * 0.18) +
    ' Q' + f(tcx) + ' ' + f(yF + tRy * 0.22) + ' ' + f(L - d) + ' ' + f(yF - tRy * 0.18) + ' C' + f(L - d) + ' ' + f(yF - tRy * 0.5) + ' ' + f(L) + ' ' + f(yB + tRy * 0.35) + ' ' + f(L) + ' ' + f(yB) + ' Z';
  var bend = ((yB - T) / (yF - T)).toFixed(3), h = Math.ceil(yF + tRy);
  return '<svg width="' + Math.ceil(W) + '" height="' + h + '" viewBox="0 0 ' + Math.ceil(W) + ' ' + h + '" aria-hidden="true">' +
    '<defs><linearGradient id="mcSweepV" gradientUnits="userSpaceOnUse" x1="0" y1="' + T.toFixed(1) + '" x2="0" y2="' + f(yF) + '">' +
      '<stop offset="0" stop-color="#7a5658"/><stop offset="' + (bend * 0.45).toFixed(3) + '" stop-color="#d9ae86"/>' +
      '<stop offset="' + bend + '" stop-color="#f3cf9f"/><stop offset="1" stop-color="#f7d6a8"/></linearGradient>' +
    '<radialGradient id="mcSweepR" gradientUnits="userSpaceOnUse" cx="' + f(tcx) + '" cy="' + f(yB) + '" r="' + f((R - L) * 0.62) + '" gradientTransform="translate(' + f(tcx) + ' ' + f(yB) + ') scale(1 1.25) translate(' + f(-tcx) + ' ' + f(-yB) + ')">' +
      '<stop offset="0.38" stop-color="#2a1a26" stop-opacity="0"/><stop offset="1" stop-color="#2a1a26" stop-opacity="0.68"/></radialGradient></defs>' +
    '<path d="M' + f(L - 14) + ' ' + f(T) + ' V-20 M' + f(R + 14) + ' ' + f(T) + ' V-20" stroke="#1d1520" stroke-width="2"/>' +
    '<path d="' + path + '" fill="url(#mcSweepV)"/>' +
    '<path d="' + path + '" fill="url(#mcSweepR)" stroke="#1d1520" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="M' + f(L - 22) + ' ' + f(T) + ' H' + f(R + 22) + '" stroke="#1d1520" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M' + f(L - 20) + ' ' + f(T - 1) + ' H' + f(R + 20) + '" stroke="#6b4632" stroke-width="4" stroke-linecap="round"/></svg>';
}
