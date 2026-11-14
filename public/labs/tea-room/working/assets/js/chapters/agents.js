/* WORKING WITH AI AGENTS: the terminal world (the tea room test tests/agent-terminal/, its scene made a chapter of the
   page: agents/*.js are the test's js, changed only where the head of agents/scene.js says).

   How it joins (join.js AGENTS, read it first): the machines chapter puts its bench away, and the room at night is left
   with the little television on the floor. Over that (this chapter's lead) the chapter's name comes on from the left
   wing, the set's glass turns from the machine's picture to the terminal's dark plane, and the camera goes straight at
   the glass until the glass is the frame: look B's own move into its television. The machines chapter moves its room;
   this chapter draws the set's body over its own picture (the same pixels as the machines chapter's set) and throws
   the terminal into the glass, as large as the glass, never larger than the screen. From there the test's own walk
   round the terminal: the cursor, one helper, a fan-out, a pipeline, an orchestrator, a writers' room, the wall of ten
   music videos, the watcher. At its end the cards go and the camera comes back out of the glass, the same move run
   backwards, into the same bare room, which this chapter then draws itself (the machines chapter is long gone), under
   the next chapter's name (closing.js).

   Everything on the screen is a function of q and the layout; what moves by itself (wings, chalk workers, the ten
   loops) follows the time. The ten loops play muted from /media/tea/agents/ on the site, only while the wall is seen and
   this chapter holds the screen; one of them with its sound only when the reader turns the sound on, in words.
   Motion off: the test's eight stills, one to a band of the walk; the way in and the way out are cuts. */
import { mount as mountScene } from './agents/scene.js';
import { AGENTS, TV_GLASS, tvPlace, tvDive } from './join.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var smooth = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
var ss = function (a, b, x) { return smooth((x - a) / (b - a)); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

// the test's walk: its 0..1 runs over LT screens, starting P0 screens from the section's top (the dive ends there)
var LT = 11.5, P0 = AGENTS.DIVE[1];
// after the walk (screens past its end): the cards go, then the camera comes back out of the glass into the room
var CARDS = [0.45, 0.75], OUT = [0.7, 2.15], RM_OUT = 1.3;
var T_HELD = 8.9;                                   // (the test's own held time: the frame its stills were made at)
var K = 1.4;                                         // (look B lays its type out larger than it is drawn)

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, root = document.documentElement;
  host.innerHTML =
    '<div class="ag-room"><img class="ag-room-img" src="' + IMG + 'room.webp" width="2752" height="1536" alt="" decoding="async"><div class="ag-lan"></div><div class="ag-vig"></div></div>' +
    '<div class="ag-glass"><div class="ag-box"></div></div>' +
    '<div class="ag-tvw"><div class="ag-tv"><div class="ag-tv-glow"></div><div class="ag-crt"></div><div class="ag-flash"></div><img class="ag-tv-body" src="' + IMG + 'tv-body.webp" width="1200" height="1093" alt=""></div></div>' +
    '<div class="flat word ag-word"></div><div class="flat say mono ag-say"></div>';
  var $ = function (s) { return host.querySelector(s); };
  var room = $('.ag-room'), roomImg = $('.ag-room-img'), lan = $('.ag-lan'), glass = $('.ag-glass'), box = $('.ag-box'), tvw = $('.ag-tvw'), tvEl = $('.ag-tv'),
    glowEl = $('.ag-tv-glow'), crt = $('.ag-crt'), flash = $('.ag-flash'), body = $('.ag-tv-body'), word = $('.ag-word'), say = $('.ag-say');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  word.style.visibility = say.style.visibility = 'hidden';

  var view = mountScene(box, { still: HELD, reducedMotion: RM, invalidate: options.redraw, top: options.top, inset: function () {
    var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null; return rb && rb.width && rb.right < root.clientWidth * 0.4 ? rb.right : 0; } });
  // the pictures the way in needs before its first frame is whole
  var pending = 0;
  [body, roomImg].forEach(function (im) { if (!(im.complete && im.naturalWidth)) { pending++; var done = function () { pending--; options.redraw(); }; im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } });

  var FOC = [0.5, 0.5], lastK = 0, lastP = -99, W = 0, H = 0, tv = null, narrow = false, left = 0, wy = 0, sx = 0, sy = 0, laid = false, active = false;
  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null;
    tv = tvPlace(W, H, rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null);
    Object.assign(tvEl.style, { left: tv.l + 'px', top: tv.t + 'px', width: tv.w + 'px', height: tv.h + 'px' });
    [crt, flash].forEach(function (e) { Object.assign(e.style, { left: (TV_GLASS.x0 * 100) + '%', top: (TV_GLASS.y0 * 100) + '%', width: ((TV_GLASS.x1 - TV_GLASS.x0) * 100) + '%', height: ((TV_GLASS.y1 - TV_GLASS.y0) * 100) + '%' }); });
    // the room: where the bench's room stands at the machines chapter's end (a phone's a little lower: its camera is
    // tilted up there, machines.js low)
    var R = tv.room;
    var Ry = R.ty + (tv.phone ? H * 0.05 : 0);
    roomImg.style.transform = 'translate(' + R.tx + 'px,' + Ry.toFixed(1) + 'px) scale(' + R.s + ')';
    // the standing lantern's warm light in the room the camera comes back out into (the bench and its lamp are gone):
    // round its shade, and a pool on the mats. Its place in the painting: x 1941, shade 929, floor 1060 of 2752 x 1536.
    // (a phone's frame ends left of the lantern: its light comes in from the right, as it would)
    var lx = R.tx + 1941 * R.s, ly = Ry + 929 * R.s, fy = Ry + 1065 * R.s, u = R.s;
    lan.style.background =
      'radial-gradient(' + (330 * u).toFixed(0) + 'px ' + (300 * u).toFixed(0) + 'px at ' + lx.toFixed(0) + 'px ' + ly.toFixed(0) + 'px, rgba(255, 196, 128, 0.34), rgba(255, 170, 100, 0.12) 50%, rgba(255, 160, 90, 0) 100%),' +
      'radial-gradient(' + (760 * u).toFixed(0) + 'px ' + (190 * u).toFixed(0) + 'px at ' + lx.toFixed(0) + 'px ' + fy.toFixed(0) + 'px, rgba(255, 186, 120, 0.3), rgba(255, 170, 100, 0.1) 55%, rgba(255, 160, 90, 0) 100%),' +
      'radial-gradient(' + (1500 * u).toFixed(0) + 'px ' + (900 * u).toFixed(0) + 'px at ' + lx.toFixed(0) + 'px ' + fy.toFixed(0) + 'px, rgba(255, 170, 105, 0.12), rgba(255, 160, 90, 0) 100%)';
    // the name: look B's rule (closing.js has the same)
    var tall = W / H < 0.9; narrow = W <= 820;
    var wp = clamp(W * (tall ? 0.15 : 0.115), 52, 190), sp = clamp(W * 0.0175, 17, 27);
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    // where the picture's subject is (fractions of the screen): see placeSet
    var rb2 = rr ? rr.getBoundingClientRect() : null, inset = !tall && rb2 && rb2.width && rb2.right < W * 0.4 ? rb2.right : 0;
    FOC = tall ? [0.5, 0.26] : [0.5 + inset / W / 2, 0.5];
    was = {};
    laid = true;
  }

  var was = {};
  function css(e, k, v) { var key = e.className + k; if (was[key] !== v) { was[key] = v; e.style[k] = v; } }
  // a name from the left wing (narrow: rising a little from below), k 0..1; up: how far it has gone up on its way out
  function putName(el, x, y, k, up, fade) {
    var tr, o = 1 - fade;
    if (narrow) { tr = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - k) * H * 0.07 - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o *= clamp((k - 0.06) * 5.5); }
    else { var w = el.offsetWidth / K; tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w + 30)).toFixed(1) + 'px,' + (y - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    css(el, 'transform', tr);
    css(el, 'visibility', k < 0.0005 || o <= 0 ? 'hidden' : '');
    css(el, 'opacity', o < 1 ? o.toFixed(3) : '');
  }

  // the set and the room at k of the dive (0: the room as it stands, 1: in the glass); glassOn: how much of the glass is
  // the terminal yet (it turns from the machine's picture)
  function placeSet(k, glassOn, withRoom, lift) {
    var d = tvDive(lift ? { l: tv.l, t: tv.t + lift, w: tv.w, h: tv.h, box: tv.box } : tv, W, H, k), g = d.glass;
    // (a flat transform and no will-change: the browser paints the set and the room again at each scale. A layer kept
    // for the move keeps the largest scale it was drawn at, and once the camera has come back out, a screen of it at
    // twelve times its size no longer fits the browser's tile memory: the last screens then went unpainted)
    var tr = 'translate(' + d.tx.toFixed(2) + 'px,' + d.ty.toFixed(2) + 'px) scale(' + d.Z.toFixed(5) + ')';
    var inside = g.x <= 0 && g.y <= 0 && g.x + g.w >= W && g.y + g.h >= H;
    css(tvw, 'transform', tr); css(tvw, 'visibility', inside ? 'hidden' : '');
    css(room, 'transform', tr); css(room, 'visibility', withRoom && !inside ? '' : 'hidden');
    // the terminal, as large as the glass (covering it), never larger than the screen, in the middle of the glass
    // (while the glass is small it shows the picture's own subject, not its middle: right of the rail on a wide screen,
    // the upper part on a tall one, where the test frames its scenes; the bias is gone by the time the glass is the frame)
    var kb = Math.min(1, Math.max(g.w / W, g.h / H)), b4 = Math.pow(kb, 4);
    var fx = FOC[0] + (0.5 - FOC[0]) * b4, fy = FOC[1] + (0.5 - FOC[1]) * b4;
    var bx = g.x + g.w / 2 - W * kb * fx, by = g.y + g.h / 2 - H * kb * fy;
    if (kb < 1) { bx = clamp(bx, g.x + g.w - W * kb, g.x); by = clamp(by, g.y + g.h - H * kb, g.y); }
    css(box, 'transform', kb >= 1 && Math.abs(bx) < 0.5 && Math.abs(by) < 0.5 ? '' :
      'translate3d(' + bx.toFixed(2) + 'px,' + by.toFixed(2) + 'px,0) scale(' + kb.toFixed(5) + ')');
    var m = 2 * d.Z / 10 + 1;                              // (a hair inside the body's rim, which is drawn over it)
    css(glass, 'clipPath', inside ? '' : 'inset(' + Math.max(0, g.y + m).toFixed(1) + 'px ' + Math.max(0, W - g.x - g.w + m).toFixed(1) + 'px ' + Math.max(0, H - g.y - g.h + m).toFixed(1) + 'px ' + Math.max(0, g.x + m).toFixed(1) + 'px)');
    css(glass, 'opacity', glassOn >= 1 ? '' : glassOn.toFixed(3));
    css(glass, 'visibility', glassOn <= 0.001 ? 'hidden' : '');
    // the glass's own sheen (a set's curved glass) goes as the glass becomes the frame
    // (by how much of the screen the glass fills, too: on a phone the glass fills the screen's height long before the
    // dive's end, and a sheen still on there washes the whole terminal blue-grey)
    css(crt, 'opacity', (glassOn * (1 - ss(0.45, 0.85, k)) * (1 - ss(0.3, 0.7, kb))).toFixed(3));
    // (the set's cold glow on the room goes as the camera comes near: magnified, it would lie over the terminal itself)
    css(glowEl, 'opacity', (1 - ss(0.12, 0.45, kb)).toFixed(3));
    return d;
  }

  function machinesWhole() {
    var m = window.TEA && window.TEA.list.filter(function (c) { return c.id === 'machines'; })[0];
    return !!(m && m.scene && m.whole);
  }

  function frame(q, t) {
    if (!laid) layout();
    if (pending > 0) return false;
    var p = q < 0 ? q : q * options.span();
    var time = HELD ? T_HELD : t;
    var D = AGENTS.DIVE, pe = p - (P0 + LT);
    // the dive (0..1), the glass turning, the way out (1 inside .. 0 the room)
    var k = RM ? (p > AGENTS.RM_CUT ? 1 : 0) : clamp((p - D[0]) / (D[1] - D[0]));      // (tvDive paces it)
    var tune = RM ? (p > AGENTS.RM_CUT ? 1 : 0) : ss(AGENTS.TUNE[0], AGENTS.TUNE[1], p);
    var out = RM ? (pe > RM_OUT ? 0 : 1) : 1 - clamp((pe - OUT[0]) / (OUT[1] - OUT[0]));
    var inLead = k < 1; lastK = k; lastP = p;
    // (in the lead this is drawn over the machines chapter's room: only once that is there, or a fresh load would show
    // the set over the chapter before it; once the glass is the frame it needs nothing under it)
    if (inLead && !machinesWhole()) return false;
    var dq = clamp((p - P0) / LT);
    if (RM) dq = view.stops[Math.min(view.stops.length - 1, Math.floor(dq * view.stops.length * 0.9999))];
    if (!view.frame(dq, time)) return false;

    // a phone's room has no set of its own in the machines chapter: there it comes up into the frame as the bench goes,
    // already showing the terminal (it has no machine's picture to change from)
    var rise = tv.phone && inLead ? (RM ? 1 : io(ss(AGENTS.PACK[0] + 0.2, AGENTS.PACK[1] + 0.1, p))) : 1;
    var lift = rise < 1 ? (1 - rise) * (H - tv.t + 40) : 0;
    css(tvEl, 'transform', lift ? 'translate3d(0,' + lift.toFixed(1) + 'px,0)' : '');
    if (inLead) placeSet(k, tv.phone ? 1 : tune, false, lift);
    else if (out < 1) placeSet(out, 1, true);
    else placeSet(1, 1, false);
    css(glowEl, 'visibility', tv.phone || !inLead ? '' : 'hidden');      // (the machines chapter's own set glows in its room)
    // the name: in from the left wing over the bare room; up and away as the camera goes for the glass (look B's word)
    var nk = RM ? (p > AGENTS.NAME[0] + 0.2 && p <= AGENTS.RM_CUT ? 1 : 0) : io(ss(AGENTS.NAME[0], AGENTS.NAME[1], p));
    // (a cold flash as the set changes what it shows: look B's own television goes cold before the camera goes in)
    var fl = RM ? 0 : Math.sin(Math.PI * clamp((p - AGENTS.TUNE[0] + 0.06) / (AGENTS.TUNE[1] - AGENTS.TUNE[0] + 0.2)));
    css(flash, 'opacity', inLead && fl > 0.002 ? (0.85 * fl).toFixed(3) : '0');
    // (narrow: the name stands just under the rail's pill, so it goes sooner and hardly rises, never through the pill)
    var gone = RM ? 0 : narrow ? ss(D[0], D[0] + 0.2, p) : ss(D[0] + 0.02, D[0] + 0.32, p);
    var up = RM ? 0 : ss(D[0], D[0] + 0.6, p) * H * (narrow ? 0.06 : 0.3);
    putName(word, left, wy, gone >= 1 ? 0 : nk, up, gone);
    putName(say, sx, sy, gone >= 1 ? 0 : nk, up * 0.7, gone);
    // the words and cards of the world: only while the world is the frame; they go before the camera leaves the glass
    var cardsOn = !inLead && (RM ? pe < (CARDS[0] + CARDS[1]) / 2 : pe < CARDS[1]);
    view.show(cardsOn);
    if (!RM && cardsOn && pe > CARDS[0]) css(options.top, 'opacity', (1 - ss(CARDS[0], CARDS[1], pe)).toFixed(3));
    else css(options.top, 'opacity', '');
    view.setActive(active && !document.hidden && !inLead && out >= 1);
    return true;
  }

  var onVis = function () { view.setActive(active && !document.hidden); };
  document.addEventListener('visibilitychange', onVis);
  return {
    frame: frame,
    resize: function () { view.resize(); if (laid) layout(); },
    setActive: function (on) { active = !!on; view.setActive(active && !document.hidden); },
    dispose: function () { document.removeEventListener('visibilitychange', onVis); view.setActive(false); view.dispose(); host.textContent = ''; },
    // (the rail and a phone's pill name this chapter as soon as its name is on the screen, not only once inside the glass)
    owns: function () { return lastK >= 1 || lastP >= (AGENTS.NAME[0] + AGENTS.NAME[1]) / 2; },
    get view() { return view; }
  };
}
