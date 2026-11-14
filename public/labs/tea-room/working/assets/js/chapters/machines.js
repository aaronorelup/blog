/* THE MACHINES ON THE BENCH: the second half of the 3D & animation chapter (the tea room test tests/teardown-bench/,
   its scene made a chapter of the page). His four Moon-base machines from the teardown lab, each its own page shown by
   its own address in a frame this chapter works from outside (machines-live.js), part by part, without its console.
   Nothing of the lab's notebook is copied: its pages, stills and films are used by their addresses (machines-data.js).

   How it joins: the toy box's room is the same painting as this chapter's room (img/room.webp). The 3D chapter ends on
   the room seen whole; over its last picture (this chapter's lead) the camera cranes down a little onto the place of
   the bench (join.js benchLayout: both chapters reckon it from the layout alone, toybox.js TURN moves the toys' room
   the same way). Just before, the toys have gone back into their box and its lid has shut (toybox.js PACK), so the
   room the bench is set up in is tidy. The bench comes up into the frame in front of the closed box: the low table,
   the backdrop let down behind it and unrolled forward over it, the television on the floor. The room goes down to
   night, the lantern comes on, and the toy box's room becomes this chapter's own (at the section's top CHAPTERS swaps
   the two pictures: the box is behind the backdrop there, and the rooms are the same painting). Then the test's own
   scroll: the four machines one after another, each: arrives whole, its parts one at a time (picked out, then cut
   open), "break it", its film and its page. At the end the cards go (the film the reader opened goes with its card)
   and the lamp goes low, the last machine still on the bench, under the next chapter's name (closing.js).

   Everything on the screen is a function of q and the layout, but the machine's own page (alive in the frame only
   once the scroll rests on a machine), the television's film and the film the reader asks for. With time held
   (?still=1, motion off) or ?live=0 the machines are their stills. Motion off: no push-in, no rise, cuts. */
import { MACHINES, LAB_POST } from './machines-data.js';
import { createLive } from './machines-live.js';
import { benchLayout, TABLE, PW, PH } from './join.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var smooth = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
var ss = function (a, b, x) { return smooth((x - a) / (b - a)); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

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

// the test's own scroll: its 0..1 runs over LD screens from the section's top (the test's 2200vh)
var LD = 22;
var INTRO = 0.045;                       // the first screen: the title over the bench
var SEG = (1 - INTRO) / MACHINES.length; // one machine's share
var ARRIVE = 0.13, PARTS_END = 0.68, BREAK_END = 0.86;
// the lead (screens before the section's top): the crane onto the bench, the bench coming up, the lights
// (CRANE [-2.5, -1.1]: the toy box's room comes down onto the bench's place, toybox.js TURN, in its own screens)
var LOWER = [-2.3, -1.5];                 // the lantern and the backdrop's rod are let down from above the frame
var LIGHT = [-1.95, -1.25];               // the lantern comes on
var RISE = [-2.2, -1.2];                  // the table comes up into the frame (the camera comes down to its height)
var TVRISE = [-1.9, -0.8];                // the television, nearest, comes up last and fastest
var UNROLL = [-1.5, -0.85];               // the backdrop unrolls from its rod down over the table (once it stands)
var APPEAR = [-0.92, -0.78];              // and the first machine is set down on it, in the dark (as between two machines):
var SETDOWN = [-1.12, -0.92, -0.78, -0.55]; // the lamp dips, the machine is there, the lamp comes up again
var DIM = [-2.2, -1.2];                   // the room goes down to the bench's night
var CARD = [-0.55, -0.1];                 // the first card comes up
// (the toys have gone back into their box before all this: toybox.js PACK; the box stands behind the backdrop)
// motion off: everything of the lead comes in one cut, at the toy box's own cut to the bench's place (its TURN's middle,
// 1.2 screens into its 3-screen foot)
var RM_CUT = -1.8;
// the end (screens after LD): the cards go, the lamp goes down, the camera draws back to the bench's first view
// (the last machine stays on the table, lit low, under the next chapter's name: never an empty bench)
var END = [0.05, 0.45];

function placeOf(q) {
  if (q < INTRO) return { i: 0, t: 0, step: 'intro', intro: 1 - q / INTRO };
  var i = Math.min(MACHINES.length - 1, Math.floor((q - INTRO) / SEG));
  var t = clamp((q - INTRO - i * SEG) / SEG);
  var m = MACHINES[i];
  if (t < ARRIVE) return { i: i, t: t, step: 'arrive' };
  if (t < PARTS_END) {
    var n = m.parts.length, u = (t - ARRIVE) / (PARTS_END - ARRIVE) * n;
    var k = Math.min(n - 1, Math.floor(u));
    return { i: i, t: t, step: 'part', k: k, mode: u - k < 0.5 ? 'isolate' : (m.parts[k].second || 'cut') };
  }
  if (t < BREAK_END) return { i: i, t: t, step: 'break' };
  return { i: i, t: t, step: 'end' };
}
var qOf = function (i, t) { return INTRO + (i + (t || 0)) * SEG; };

// a 1600 x 900 picture of the page (its stills, its film, the page itself) placed in a box so the crop shows
function cropRect(boxW, boxH, crop) {
  var s = Math.max(boxH / crop.vh, crop.vw ? boxW / crop.vw : 0);
  s = Math.max(s, boxW / 1600, boxH / 900);
  var W = 1600 * s, H = 900 * s;
  return { left: clamp(boxW / 2 - crop.cx * s, boxW - W, 0), top: clamp(boxH / 2 - crop.cy * s, boxH - H, 0), W: W, H: H };
}
// the console around a still's machine: everything outside its box
function outside(k) {
  if (!k) return [];
  var x = k[0], y = k[1], w = k[2], h = k[3];
  return [[0, 0, 1600, y], [0, y + h, 1600, 900 - y - h], [0, y, x, h], [x + w, y, 1600 - x - w, h]];
}

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, top = options.top;
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
          '<div class="mc-film-box" hidden><video class="mc-film" muted playsinline preload="none" disableremoteplayback></video></div>' +
        '</div>' +
      '<div class="mc-tv"><div class="mc-tv-glow"></div><div class="mc-tv-flip">' +
        '<div class="mc-tv-screen"><img class="mc-tv-still" alt=""><video class="mc-tv-film" muted playsinline loop preload="none" disableremoteplayback tabindex="-1"></video></div>' +
        '<img class="mc-tv-body" src="' + IMG + 'tv-body.webp" width="1200" height="1093" alt="">' +
      '</div></div>' +
      '<div class="mc-lamp">' + LAMP_SVG + '<div class="mc-lamp-glow"></div></div>' +
    '</div>';
  top.innerHTML =
    '<nav class="mc-tabs" aria-label="The four machines"></nav>' +
    '<p class="mc-plate"><span class="mc-plate-name"></span><span class="mc-plate-what"></span>' +
      '<button type="button" class="mc-turn" hidden>Turn it yourself</button></p>' +
    '<p class="mc-waking" hidden>Waking the machine…</p>' +
    '<div class="mc-dock">' +
      '<header class="mc-card mc-lead">' +
        '<p class="mc-meta"><span>3D &amp; animation</span><span>The teardowns</span></p>' +
        '<h2 class="mc-lead-title">The machines on the bench</h2>' +
        '<p class="mc-say">Four machines from the Moon base of <em>Earthlight</em>, each its own page, taken apart one part at a time on the low table, under the lamp.</p>' +
        '<p class="mc-lead-go">Scroll, and the first one arrives.</p>' +
      '</header>' +
      '<article class="mc-card mc-part" aria-live="polite">' +
        '<p class="mc-meta"><span class="mc-m-name"></span><span class="mc-m-step"></span></p>' +
        '<h3 class="mc-p-name"></h3>' +
        '<p class="mc-num"><b></b><span></span></p>' +
        '<p class="mc-say mc-p-say"></p>' +
        '<p class="mc-modes"><span class="mc-chip mc-c-iso">Isolated</span><span class="mc-chip mc-c-cut">Cut open</span></p>' +
      '</article>' +
      '<article class="mc-card mc-brk">' +
        '<p class="mc-meta"><span class="mc-m-name"></span><span>Break it</span></p>' +
        '<h3 class="mc-b-title"></h3>' +
        '<p class="mc-say mc-b-say"></p>' +
        '<label class="mc-range"><span class="mc-b-label"></span><input type="range" class="mc-b-input"><span class="mc-b-marks"></span></label>' +
        '<p class="mc-out"><span class="mc-b-val"></span><b class="mc-b-read"></b><span class="mc-b-small"></span></p>' +
      '</article>' +
      '<article class="mc-card mc-end">' +
        '<p class="mc-meta"><span class="mc-m-name"></span><span>The film and the page</span></p>' +
        '<h3 class="mc-e-title"></h3>' +
        '<p class="mc-say mc-e-say"></p>' +
        '<div class="mc-btns"><button type="button" class="mc-btn mc-e-film">Watch its film</button><a class="mc-btn mc-e-open">Open the full teardown</a></div>' +
        '<div class="mc-sound" hidden><span class="mc-sound-say">The film has sound. It stays off until you turn it on.</span>' +
          '<span class="mc-switch"><button type="button" class="mc-snd-off" aria-pressed="true">Sound off</button><button type="button" class="mc-snd-on" aria-pressed="false">Sound on</button></span></div>' +
        '<p class="mc-post"><a class="mc-go" href="' + LAB_POST + '">Read the lab’s post: how these were built</a></p>' +
      '</article>' +
    '</div>' +
    '<p class="mc-hint" aria-hidden="true">Scroll</p>';

  var $ = function (s, r) { return (r || host).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || host).querySelectorAll(s)); };
  var T = function (s) { return top.querySelector(s); };
  var TT = function (s) { return Array.prototype.slice.call(top.querySelectorAll(s)); };
  var dim = $('.mc-dim'), world = $('.mc-world'), roomEl = $('.mc-room'), roomImg = $('.mc-room-img'), vig = $('.mc-vig');
  var ups = $$('.mc-up'), sweep = $('.mc-sweep'), table = $('.mc-table'), view = $('.mc-view');
  var picA = $('.mc-pic.a'), picB = $('.mc-pic.b'), erase = $('.mc-erase'), holder = $('.mc-holder');
  var filmBox = $('.mc-film-box'), film = $('.mc-film');
  var tv = $('.mc-tv'), tvFilm = $('.mc-tv-film'), tvStill = $('.mc-tv-still'), lampEl = $('.mc-lamp');
  var tabs = T('.mc-tabs'), plate = T('.mc-plate'), turnBtn = T('.mc-turn'), waking = T('.mc-waking'), dock = T('.mc-dock');
  var lead = T('.mc-lead'), cPart = T('.mc-part'), cBrk = T('.mc-brk'), cEnd = T('.mc-end'), hint = T('.mc-hint');
  var range = T('.mc-b-input');
  if (HELD) host.classList.add('mc-held'), top.classList.add('mc-held');
  tvFilm.addEventListener('playing', function () { tvFilm.classList.add('on'); });

  // the pictures this chapter needs before its first frame is whole: the table, the room, the first still
  var need = [roomImg, table], pending = 0;
  need.forEach(function (im) { if (!(im.complete && im.naturalWidth)) { pending++; im.addEventListener('load', function () { pending--; options.redraw(); }, { once: true }); im.addEventListener('error', function () { pending--; options.redraw(); }, { once: true }); } });

  // ---- the tabs: one per machine, each a link to its place in the scroll
  MACHINES.forEach(function (m, i) {
    var b = el('button', 'mc-tab', '<span>' + m.name + '</span><i><b></b></i>');
    b.type = 'button';
    b.addEventListener('click', function () { seek(qOf(i, 0.02)); });
    tabs.appendChild(b);
  });
  var tabEls = TT('.mc-tab');
  function seek(qd) {
    var st = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(st + qd * LD * window.innerHeight), behavior: RM ? 'auto' : 'smooth' });
  }

  var sweepH = 0, W = 0, H = 0, L = null, phone = false, active = false, laid = false;
  var cur = { i: -1, step: '', k: -1, mode: '' };
  var live = null, liveI = -1, liveTimer = null, pendingI = -1;
  var failed = new Set();
  var held = false, heldQ = 0, lastQ = 0;
  var filmOn = false, sliderVal = {}, readTimer = null, tvOn = false;
  var picShown = { a: '', b: '' }, picFront = 'a';
  var crop = MACHINES[0].crop, viewW = 0, viewH = 0;

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
      e.style.setProperty('--bench-bottom', (by + bh) + 'px');
    });
    sweep.innerHTML = sweepSvg(bx, by, bw, bh, L.tcx, L.tcy, L.try, W);
    sweepH = Math.ceil(L.tcy + L.try * 0.42 + L.try); sweep.style.height = sweepH + 'px';
    var lw = L.lampW, ly = L.lampY;
    Object.assign(lampEl.style, { left: (L.tcx - lw / 2) + 'px', top: ly + 'px', width: lw + 'px' });
    host.style.setProperty('--lx', L.tcx + 'px'); host.style.setProperty('--ly', (ly + lw) + 'px');
    if (L.tv) Object.assign(tv.style, { width: L.tv.w + 'px', left: L.tv.l + 'px', top: L.tv.t + 'px' });
    roomImg._s = undefined;                          // (frame() places the room: the phone's tilt moves it)
    world.style.transformOrigin = L.tcx + 'px ' + (L.tcy - bh * 0.35) + 'px';
    // the cards: on the right (wide), under the bench (a phone)
    if (phone) {
      Object.assign(dock.style, { left: '12px', right: '12px', width: 'auto', top: (by + bh + 40) + 'px', bottom: '10px' });
      Object.assign(tabs.style, { left: '12px', right: '12px', top: L.tabsTop + 'px' });
    } else {
      Object.assign(dock.style, { left: L.dock.l + 'px', width: L.dock.w + 'px', right: '', top: '0', bottom: '0' });
      Object.assign(tabs.style, { left: L.dock.l + 'px', right: '', top: Math.round(H * 0.032) + 'px' });
    }
    Object.assign(plate.style, { left: L.tcx + 'px', top: (by + bh - (phone ? 4 : 8)) + 'px' });
    Object.assign(waking.style, { left: L.tcx + 'px', top: (by + bh * 0.84) + 'px' });
    placeAll();
    laid = true;
  }
  function placeMedia(node, c) {
    if (!node) return;
    var r = cropRect(viewW, viewH, c);
    Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.W + 'px', height: r.H + 'px' });
  }
  function cropFor(m) { return phone ? m.cropNarrow : m.crop; }
  function placeAll() {
    var m = MACHINES[Math.max(0, cur.i)];
    crop = cropFor(m);
    placeMedia(picA, crop); placeMedia(picB, crop);
    placeMedia(holder.querySelector('iframe'), crop);
    placeMedia(film, crop);
    placeTv(m);
    if (picShown[picFront]) placeErase(picShown[picFront]);
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
  // the stills are pictures of the whole page, console and all: white (nothing, on the bench) over what is not the machine
  function placeErase(src) {
    var m = MACHINES[Math.max(0, cur.i)];
    var key = src.replace(/^.*teardown-lab\//, '').replace(/\.webp$/, '');
    var boxes = outside(m.keep && m.keep[key]).concat(((m.erase && m.erase[key]) || []).map(function (b) { return b.concat(['w']); }));
    var r = cropRect(viewW, viewH, crop), k = r.W / 1600;
    erase.innerHTML = boxes.map(function (b) {
      return '<i' + (b[4] ? ' class="w"' : '') + ' style="left:' + (r.left + b[0] * k).toFixed(1) + 'px;top:' + (r.top + b[1] * k).toFixed(1) + 'px;width:' + (b[2] * k).toFixed(1) + 'px;height:' + (b[3] * k).toFixed(1) + 'px"></i>';
    }).join('');
  }

  // ---- the pictures under the live page: two layers, cross-faded when the picture changes
  var picsIn = {};
  function showPic(src) {
    var front = picFront === 'a' ? picA : picB, back = picFront === 'a' ? picB : picA;
    if (picShown[picFront] === src) return;
    placeErase(src);
    var backKey = picFront === 'a' ? 'b' : 'a';
    if (picShown[backKey] !== src) {
      back.src = src; picShown[backKey] = src;
      if (!picsIn[src]) back.addEventListener('load', function () { picsIn[src] = true; options.redraw(); }, { once: true });
    }
    back.classList.add('on'); front.classList.remove('on');
    picFront = backKey;
  }

  // ---- the live page in the frame: only one, only for the machine on the table, only once the scroll rests there
  function wantLive(i) {
    if (!LIVE || !active || failed.has(i)) return dropLive();
    if (liveI === i || pendingI === i) return;
    dropLive();
    pendingI = i;
    liveTimer = setTimeout(function () { pendingI = -1; startLive(i); }, 420);
  }
  function startLive(i) {
    if (!active || cur.i !== i || cur.step === 'intro' || !alive) return;
    var m = MACHINES[i];
    liveI = i;
    waking.hidden = false;
    live = createLive(m, holder, {
      onReady: function () { waking.hidden = true; turnBtn.hidden = false; host.classList.add('mc-alive'); applyLive(); },
      onFail: function () { failed.add(i); waking.hidden = true; turnBtn.hidden = true; live = null; liveI = -1; host.classList.remove('mc-alive'); },
      onWheel: function () { release(); }
    });
    placeMedia(holder.querySelector('iframe'), cropFor(m));
    applyLive();
  }
  function dropLive() {
    clearTimeout(liveTimer); pendingI = -1;
    if (live) { live.dispose(); live = null; }
    liveI = -1; waking.hidden = true; turnBtn.hidden = true; host.classList.remove('mc-alive');
    if (held) release();
  }
  function applyLive() {
    if (!live || cur.i < 0) return;
    var m = MACHINES[cur.i];
    if (cur.step === 'part') live.set({ view: m.hero.view, part: m.parts[cur.k].button, mode: cur.mode });
    else if (cur.step === 'break') live.set({ view: m.breakIt.view || m.hero.view, part: null, mode: null });
    else live.set({ view: m.hero.view, part: null, mode: null });
    var br = m.breakIt;
    live.breakSetup(cur.step === 'break');
    if (cur.step === 'break') live.slide(sliderVal[m.key] != null ? sliderVal[m.key] : br.value);
    else if (br.resetOnLeave) live.slide(br.value);
  }

  // ---- "Turn it yourself": the frame takes the pointer only when asked, and gives it back on scroll. (The frame is
  // in the picture layer, behind the page: while it is held the page lets the pointer through to it.)
  var mainEl = document.getElementById('main');
  function hold() {
    if (!live || !live.ready) return;
    held = true; heldQ = lastQ; live.hold(true); host.classList.add('mc-hand'); top.classList.add('mc-hand');
    if (mainEl) mainEl.style.pointerEvents = 'none';
    section.style.pointerEvents = 'none';
    turnBtn.textContent = 'Done turning'; turnBtn.setAttribute('aria-pressed', 'true');
  }
  function release() {
    if (!held) return;
    held = false; if (live) live.hold(false); host.classList.remove('mc-hand'); top.classList.remove('mc-hand');
    if (mainEl) mainEl.style.pointerEvents = '';
    section.style.pointerEvents = '';
    turnBtn.textContent = 'Turn it yourself'; turnBtn.setAttribute('aria-pressed', 'false');
  }
  turnBtn.addEventListener('click', function () { if (held) release(); else hold(); });

  // ---- the film: on the television (muted, always), and on the bench when asked (muted until the reader turns it on)
  var sndOn = T('.mc-snd-on'), sndOff = T('.mc-snd-off'), sound = T('.mc-sound'), filmBtn = T('.mc-e-film');
  function setSound(on) {
    film.muted = !on;
    sndOn.setAttribute('aria-pressed', String(on)); sndOff.setAttribute('aria-pressed', String(!on));
  }
  sndOn.addEventListener('click', function () { setSound(true); });
  sndOff.addEventListener('click', function () { setSound(false); });
  function openFilm(on) {
    filmOn = on;
    var m = MACHINES[Math.max(0, cur.i)];
    if (on) {
      if (film.getAttribute('src') !== m.film) { film.src = m.film; film.poster = m.poster; }
      film.muted = true; setSound(false);
      filmBox.hidden = false; sound.hidden = false;
      film.currentTime = 0;
      film.play().catch(function () {});
      filmBtn.textContent = 'Back to the machine';
    } else {
      film.pause(); filmBox.hidden = true; sound.hidden = true; setSound(false);
      filmBtn.textContent = 'Watch its film';
    }
  }
  filmBtn.addEventListener('click', function () { openFilm(!filmOn); });
  film.addEventListener('ended', function () { openFilm(false); });

  // ---- break it: the page's one slider, offered big
  range.addEventListener('input', function () {
    var m = MACHINES[cur.i], v = parseFloat(range.value);
    sliderVal[m.key] = v;
    if (live) live.slide(v);
    paintBreak();
  });
  function fmt(v, br) { return br.unit ? v.toFixed(br.step < 0.1 ? 2 : br.step < 1 ? 1 : 0) + ' ' + br.unit : Math.round(v * 100) + ' %'; }
  function paintBreak() {
    if (cur.i < 0) return;
    var m = MACHINES[cur.i], br = m.breakIt;
    var v = sliderVal[m.key] != null ? sliderVal[m.key] : br.value;
    T('.mc-b-val').textContent = br.label + ': ' + fmt(v, br);
    var r = live && live.ready ? live.reading() : null;
    var big = T('.mc-b-read'), small = T('.mc-b-small');
    if (r && r.big) {
      var b = br.readout.tidy ? br.readout.tidy(r.big) : r.big;
      big.textContent = b.replace(/ MM$/, ' mm').replace(/ CM$/, ' cm').replace(/ M$/, ' m').replace(/ M /, ' m ');
      small.textContent = br.readout.label + (r.small ? ' · ' + r.small : '');
    } else { big.textContent = br.offline(v); small.textContent = ''; }
    if (!live || !live.ready) showPic(m.stills[br.stills[v >= br.at ? 1 : 0]]);
  }

  // ---- the cards
  function fillMachine(m, i) {
    TT('.mc-m-name').forEach(function (e) { e.textContent = m.name + ' · ' + (i + 1) + ' of ' + MACHINES.length; });
    T('.mc-plate-name').textContent = m.name;
    T('.mc-plate-what').textContent = m.what;
    T('.mc-e-title').textContent = m.name + ': the whole teardown';
    T('.mc-e-say').textContent = 'Its ' + m.filmLength + ' film, and its own page, where every part, view and number is yours to try.';
    T('.mc-e-open').href = m.page;
    filmBtn.textContent = 'Watch its film';
    var br = m.breakIt;
    T('.mc-b-title').textContent = br.label;
    T('.mc-b-say').textContent = br.say;
    T('.mc-b-label').textContent = br.label + ', from ' + fmt(br.min, br) + ' to ' + fmt(br.max, br);
    range.min = br.min; range.max = br.max; range.step = br.step;
    range.value = sliderVal[m.key] != null ? sliderVal[m.key] : br.value;
    T('.mc-b-marks').innerHTML = br.marks.map(function (mk) { return '<i style="left:' + ((mk[0] - br.min) / (br.max - br.min)) * 100 + '%">' + mk[1] + '</i>'; }).join('');
    if (!phone) tvStill.src = m.poster;
    tvFilm.classList.remove('on');
  }
  function fillStep(p) {
    var m = MACHINES[p.i];
    if (p.step === 'arrive') {
      T('.mc-m-step').textContent = 'Arrived whole';
      T('.mc-p-name').textContent = m.name;
      T('.mc-num b').textContent = '';
      T('.mc-num span').textContent = m.what;
      T('.mc-p-say').textContent = m.parts.length + ' of its parts next, one at a time: picked out, then cut open. Then you get to break it.';
      cPart.classList.add('mc-whole');
      showPic(m.stills[0]);
    } else if (p.step === 'part') {
      var part = m.parts[p.k];
      T('.mc-m-step').textContent = 'Part ' + (p.k + 1) + ' of ' + m.parts.length;
      T('.mc-p-name').textContent = part.name;
      T('.mc-num b').textContent = part.num;
      T('.mc-num span').textContent = part.unit;
      T('.mc-p-say').textContent = part.say;
      cPart.classList.remove('mc-whole');
      T('.mc-c-iso').classList.toggle('on', p.mode === 'isolate');
      T('.mc-c-cut').classList.toggle('on', p.mode !== 'isolate');
      T('.mc-c-cut').textContent = part.second === 'alone' ? 'Shown alone' : 'Cut open';
      showPic(m.stills[part.still]);
    } else if (p.step === 'break') {
      paintBreak();
    } else {
      showPic(m.stills[0]);
    }
  }
  function setCard(e, on) { if (e._on !== on) { e._on = on; e.classList.toggle('up', on); } }

  // ---- every frame
  var was = {};
  function css(e, k, v) { var key = k; if (e._s === undefined) e._s = {}; if (e._s[key] !== v) { e._s[key] = v; e.style[k] = v; } }
  function frame(q, t) {
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
    var qd = clamp(p / LD); lastQ = qd;
    if (held && Math.abs(qd - heldQ) > 0.0015) release();
    var pl = placeOf(qd), m = MACHINES[pl.i];
    if (pl.i !== cur.i) {
      if (filmOn) openFilm(false);
      cur.i = pl.i; cur.step = ''; fillMachine(m, pl.i); placeAll();
    }
    if (pl.step !== cur.step || (pl.k == null ? -1 : pl.k) !== cur.k || (pl.mode || '') !== cur.mode) {
      if (filmOn && pl.step !== 'end') openFilm(false);
      cur.step = pl.step; cur.k = pl.k == null ? -1 : pl.k; cur.mode = pl.mode || '';
      fillStep(pl);
      applyLive();
    }
    var pe = p - LD;                                     // (after the test's scroll: the end)
    var ending = RM ? (pe > (END[0] + END[1]) / 2 ? 1 : 0) : io(ss(END[0], END[1], pe));
    if (active && !isLead && pl.step !== 'intro' && ending < 0.5) wantLive(pl.i); else dropLive();
    // the television plays the machine's film with no sound, once the machine is on the table
    var wantTv = active && !HELD && !phone && pl.step !== 'intro' && ending < 0.5;
    if (wantTv !== tvOn || (wantTv && tvFilm.getAttribute('src') !== m.film)) {
      tvOn = wantTv;
      if (wantTv) { if (tvFilm.getAttribute('src') !== m.film) tvFilm.src = m.film; tvFilm.play().catch(function () {}); }
      else tvFilm.pause();
    }

    // ---- the lead: the crane, the bench coming up, the lights
    var rise = RM ? (p > RM_CUT ? 1 : 0) : io(ss(RISE[0], RISE[1], p));
    var tvRise = RM ? rise : io(ss(TVRISE[0], TVRISE[1], p));
    var dimK = RM ? (p > RM_CUT ? 1 : 0) : ss(DIM[0], DIM[1], p);
    var lower = RM ? (p > RM_CUT ? 1 : 0) : io(ss(LOWER[0], LOWER[1], p));
    var light = RM ? (p > RM_CUT ? 1 : 0) : ss(LIGHT[0], LIGHT[1], p);
    var unroll = RM ? (p > RM_CUT ? 1 : 0) : io(ss(UNROLL[0], UNROLL[1], p));
    var appear = RM ? (p > RM_CUT ? 1 : 0) : ss(APPEAR[0], APPEAR[1], p);
    // the room: the camera's place over the crane (in the lead the toy box draws the room; this chapter only its night)
    css(roomEl, 'visibility', isLead ? 'hidden' : '');
    css(dim, 'opacity', isLead ? dimK.toFixed(3) : '0');
    css(vig, 'opacity', (isLead ? dimK : 1).toFixed(3));
    // the near things come up from below the frame, the nearest fastest (the camera comes down to the table's height)
    var off = (1 - rise) * (H - L.by + 40), tvOff = (1 - tvRise) * (H - (L.tv ? L.tv.t : H) + 60) * 1.0;
    // (a phone: while no card stands under the bench, in the lead and at the end, the bench stands lower in the frame,
    // the camera tilted up a little; it comes up to make room as the first card comes, and goes down again at the end)
    var low = phone ? (RM ? ((isLead && p <= -0.5) || ending > 0.5 ? 1 : 0) : Math.max(1 - io(ss(CARD[0] - 0.35, CARD[1], p)), ending)) : 0;
    var lowY = low * H * 0.16, roomLow = low * H * 0.05;
    off += lowY;
    css(plate, 'transform', 'translate3d(-50%,' + lowY.toFixed(1) + 'px,0)');          // (the name on the bench's edge goes with it)
    var upTr = off > 0.05 ? 'translate3d(0,' + off.toFixed(1) + 'px,0)' : '', upVis = rise <= 0.0005 ? 'hidden' : '';
    ups.forEach(function (e) { css(e, 'transform', upTr); css(e, 'visibility', upVis); });
    css(tv, 'transform', tvOff > 0.05 ? 'translate3d(0,' + tvOff.toFixed(1) + 'px,0)' : '');
    css(tv, 'visibility', tvRise <= 0.0005 || phone ? 'hidden' : '');
    // the lantern: let down on its cord from above the frame; the backdrop's rod with it, then the sheet unrolls
    var lampOff = -(1 - lower) * (L.lampY + L.lampW * 1.6 + 30);
    css(lampEl, 'visibility', lower <= 0.0005 ? 'hidden' : '');
    var rodY = L.by + L.bh * 0.03, rodOff = -(1 - lower) * (rodY + 30) + lowY, sheetH = sweepH - rodY;
    lampOff += lowY;
    css(lampEl, 'transform', Math.abs(lampOff) > 0.05 ? 'translate3d(0,' + lampOff.toFixed(1) + 'px,0)' : '');
    css(roomImg, 'transform', 'translate3d(' + L.room.tx + 'px,' + (L.room.ty + roomLow).toFixed(1) + 'px,0) scale(' + L.room.s + ')');
    css(sweep, 'transform', Math.abs(rodOff) > 0.05 ? 'translate3d(0,' + rodOff.toFixed(1) + 'px,0)' : '');
    css(sweep, 'visibility', lower <= 0.0005 ? 'hidden' : '');
    css(sweep, 'clipPath', unroll < 1 ? 'inset(-50px 0 ' + (sheetH * (1 - unroll) + (unroll > 0 ? 0 : 6)).toFixed(1) + 'px 0)' : '');

    // the lamp: lit over a machine, dimmed between two (the next one is set down in the dark), out at the end
    var edge = pl.step === 'intro' ? 1 - 0.35 * pl.intro : Math.min(pl.i === 0 ? 1 : pl.t / 0.025, pl.i === MACHINES.length - 1 ? 1 : (1 - pl.t) / 0.025);
    var lit = smooth(edge) * light * (1 - 0.8 * ending);
    if (isLead) lit = light * 0.65 * (RM ? 1 : 1 - 0.8 * (ss(SETDOWN[0], SETDOWN[1], p) - ss(SETDOWN[2], SETDOWN[3], p)));
    var litS = lit.toFixed(3);
    if (was.lit !== litS) { was.lit = litS; host.style.setProperty('--lit', litS); }
    // the machine itself: solid whenever it stands (the backdrop it is multiplied onto carries the lamp's light), and
    // gone only between two machines, while the next is set down in the dark
    var between = pl.step === 'intro' ? 1 : Math.min(pl.i === 0 ? 1 : pl.t / 0.025, pl.i === MACHINES.length - 1 ? 1 : (1 - pl.t) / 0.025);
    var vis = (appear * smooth(between)).toFixed(3);
    if (was.vis !== vis) { was.vis = vis; host.style.setProperty('--vis', vis); }
    // the machine comes up onto the table with the bench, and stands; the still under the page turns a little
    var kb = 1 + 0.035 * smooth(pl.step === 'arrive' ? pl.t / ARRIVE : pl.step === 'intro' ? 0 : 1);
    css(picA, 'transform', RM ? '' : 'scale(' + kb.toFixed(4) + ')'); css(picB, 'transform', RM ? '' : 'scale(' + kb.toFixed(4) + ')');
    // the camera: a slow push in on the bench through each machine; at the end it draws back a little
    var g = pl.step === 'intro' ? 0 : pl.t;
    var zoom = RM ? 1 : (pl.step === 'intro' ? 1.0 + 0.01 * (1 - pl.intro) : lerp(1.01, 1.04, smooth(g)));
    zoom = lerp(zoom, 1, ending);                     // (never below 1: the room's edges would show)
    if (!isLead) {
      css(world, 'transform', zoom !== 1 ? 'scale(' + zoom.toFixed(5) + ')' : '');
    } else {
      // (the crane: the room moves from the toy box's last view to the bench's; the bench, nearer, moves with it, more)
      css(world, 'transform', '');
    }

    // which card is up (a fresh load at the same place shows the same)
    var cardOn = isLead ? (RM ? p > -0.5 : p > CARD[0]) : ending < 0.5;
    // (the film the reader asked for goes with its card: it never plays on unseen, with no control left to stop it)
    if (filmOn && !(cardOn && !isLead && pl.step === 'end')) openFilm(false);
    setCard(lead, cardOn && pl.step === 'intro');
    setCard(cPart, cardOn && !isLead && (pl.step === 'arrive' || pl.step === 'part'));
    setCard(cBrk, cardOn && !isLead && pl.step === 'break');
    setCard(cEnd, cardOn && !isLead && pl.step === 'end');
    var chrome = !isLead && ending < 0.5;
    css(tabs, 'visibility', chrome || (isLead && p > CARD[0]) ? '' : 'hidden');
    tabs.classList.toggle('up', chrome || (isLead && p > CARD[0]));
    css(plate, 'visibility', (chrome || (isLead && p > CARD[0])) ? '' : 'hidden');
    plate.classList.toggle('up', chrome || (isLead && p > CARD[0]));
    hint.classList.toggle('up', !isLead && qd < 0.012 && !RM);
    tabEls.forEach(function (b, i) {
      var f = clamp((qd - qOf(i)) / SEG);
      b.classList.toggle('on', i === pl.i && pl.step !== 'intro');
      var tr = 'scaleX(' + f.toFixed(3) + ')', bar = b.querySelector('b');
      if (bar._tr !== tr) { bar._tr = tr; bar.style.transform = tr; }
    });
    // whole: the bench's pictures and the machine's still are in
    var still = picShown[picFront];
    return !still || !!picsIn[still] || (picFront === 'a' ? picA : picB).complete;
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    if (!on) {
      dropLive(); tvFilm.pause(); tvOn = false; if (filmOn) openFilm(false);
      clearInterval(readTimer); readTimer = null;
    } else if (!readTimer) readTimer = setInterval(function () { if (cur.step === 'break') paintBreak(); }, 300);
  }
  var onVis = function () { if (document.hidden) { tvFilm.pause(); if (filmOn) film.pause(); tvOn = false; } };
  document.addEventListener('visibilitychange', onVis);

  return {
    frame: frame,
    resize: function () { if (laid) layout(); },
    setActive: setActive,
    dispose: function () {
      alive = false; setActive(false); release();
      document.removeEventListener('visibilitychange', onVis);
      tvFilm.removeAttribute('src'); film.removeAttribute('src');
    },
    // (for tests)
    get state() { return { i: cur.i, step: cur.step, k: cur.k, mode: cur.mode, live: !!(live && live.ready), liveI: liveI, failed: Array.from(failed) }; },
    qOf: qOf, LD: LD
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
