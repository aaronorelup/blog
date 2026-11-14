/* LEARNING TO BUILD WITH AI: the ledger opens (the tea room test tests/ledger-book/, its scene made a chapter of the
   page: learning/*.js are the test's js, changed only where the head of learning/scene.js says).

   How it joins (join.js LEARN, read it first): after the camera has come back out of the television, the agents
   chapter turns its painted room to the corner where the standing lantern is, by the shoji. Over that (this chapter's
   lead) the chapter's name comes on from the left wing (look B's flat word) and goes; then the modelled room, the
   homepage's own tea house by night, takes the painting's place under the lantern's light: the light grows until it
   fills the screen, the rooms change under it, and it draws back into the andon, which stands exactly where the
   painted lantern stood (LEARN's pose; the camera still). From there the test's
   own arrival: the camera comes down onto the writing desk, the ledger opens, and one post is read to a spread, a
   leaf turned for each. Once the book is open the camera stays still. At the end the ledger shuts and the camera
   leaves the desk for the first place of the next chapter's camera (join.js SITE), in the same modelled room
   (learning/house.js, shared with site.js), while the next chapter's name comes on.

   Everything on the screen is a function of q and the layout (the lamps' flicker and the petals follow the time).
   Motion off: the painting cuts to the desk, the book opens with a whole spread at a time (the test's own). */
import { mount as mountScene } from './learning/scene.js';
import { LEARN, SITE, learnPose, learnInset, learnRoom } from './join.js';

var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var smooth = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
var ss = function (a, b, x) { return smooth((x - a) / (b - a)); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

var LB = 8;                       // the test's 0..1 runs over LB screens from the section's top (its own track: 900vh)
var T_HELD = 7.3;                 // (the test's own held time; site.js holds the same, so the petals do not jump at the join)
var K = 1.4;                      // (look B lays its type out larger than it is drawn)

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, root = document.documentElement;
  host.innerHTML = '<div class="lr-gl"></div><div class="lr-flare"></div><div class="flat word lr-word"></div><div class="flat say mono lr-say"></div>';
  var $ = function (s) { return host.querySelector(s); };
  var glHost = $('.lr-gl'), flare = $('.lr-flare'), word = $('.lr-word'), say = $('.lr-say');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  word.style.visibility = say.style.visibility = 'hidden';
  var pagesTop = document.createElement('div'); pagesTop.className = 'lr-top'; options.top.appendChild(pagesTop);

  var railRect = function () { var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null; return rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null; };
  var W = 0, H = 0;
  var view = mountScene(glHost, {
    reducedMotion: RM, top: pagesTop,
    inset: function () { return learnInset(root.clientWidth, window.innerHeight, railRect()); },
    from: function () { return learnPose(root.clientWidth, window.innerHeight, railRect()); },
    onSeek: function (q) { var y = section.getBoundingClientRect().top + window.scrollY + q * LB * window.innerHeight; window.scrollTo({ top: Math.round(y), behavior: RM ? 'auto' : 'smooth' }); }
  });
  var pages = pagesTop.querySelector('.lb-css');

  // what must be in before a frame is whole: the fonts and the pictures on the pages (a fresh load at a place shows
  // the same picture as a reader who scrolled there)
  var pending = 1;
  var done = function () { pending--; options.redraw(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { view.resize(); done(); }, done);
  Array.prototype.forEach.call(pagesTop.querySelectorAll('img'), function (im) {
    im.loading = 'eager';
    if (!(im.complete && im.naturalWidth)) { pending++; im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); }
  });

  var narrow = false, left = 0, wy = 0, sx = 0, sy = 0, laid = false, active = false, lastP = -99, flareXY = null, wing = 0;
  // the lantern's light at e (0: none, 1: it fills the screen, every part of it opaque): a hot paper-white core at the
  // lantern's shade, warm amber round it, a deep ember brown at the screen's far corners
  function flareAt(e) {
    var x = flareXY[0].toFixed(0), y = flareXY[1].toFixed(0), far = flareXY[2], R = far * (0.3 + 0.75 * e);
    var a = function (k) { return Math.min(1, Math.pow(e, k)).toFixed(3); };   // (the far parts go opaque only as e reaches 1)
    return 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255, 244, 222, ' + a(0.5) + ') 0px, rgba(255, 214, 150, ' + a(0.8) + ') ' + (R * 0.07).toFixed(0) +
      'px, rgba(232, 150, 72, ' + a(1.4) + ') ' + (R * 0.28).toFixed(0) + 'px, rgba(128, 60, 34, ' + a(2.4) + ') ' + (R * 0.62).toFixed(0) + 'px, rgba(40, 20, 22, ' + a(3.2) + ') ' + R.toFixed(0) + 'px)';
  }
  function layout() {
    W = root.clientWidth; H = window.innerHeight;
    // the name: look B's rule (closing.js and agents.js have the same)
    var tall = W / H < 0.9; narrow = W <= 820;
    var wp = clamp(W * (tall ? 0.15 : 0.115), 52, 190), sp = clamp(W * 0.0175, 17, 27);
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    var rb = railRect(); wing = rb ? rb.right : 0;
    was = {}; laid = true; flareXY = null;
  }
  var was = {};
  function css(e, k, v) { var key = e.className + k; if (was[key] !== v) { was[key] = v; e.style[k] = v; } }
  function putName(el, x, y, k, up, fade) {
    var tr, o = 1 - fade;
    if (narrow) { tr = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - k) * H * 0.07 - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o *= clamp((k - 0.06) * 5.5); }
    else { var w = el.offsetWidth / K, xx = x - (1 - k) * (Math.max(x, 0) + w + 30); tr = 'translate3d(' + xx.toFixed(1) + 'px,' + (y - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    css(el, 'transform', tr);
    // (the left wing is the rail's right edge: what of the name is still left of it is not drawn, so no letter shows
    // above or below the rail, or passes under it)
    var cut = narrow ? 0 : (wing - xx) * K;
    css(el, 'clipPath', cut > 0 ? 'polygon(' + cut.toFixed(1) + 'px -9999px, 99999px -9999px, 99999px 99999px, ' + cut.toFixed(1) + 'px 99999px)' : '');
    css(el, 'visibility', k < 0.0005 || o <= 0 ? 'hidden' : '');
    css(el, 'opacity', o < 1 ? o.toFixed(3) : '');
  }
  function agentsWhole() {
    var a = window.TEA && window.TEA.list.filter(function (c) { return c.id === 'agents'; })[0];
    return !!(a && a.scene && a.whole);
  }

  function frame(q, t) {
    if (!laid) layout();
    var p = q < 0 ? q : q * options.span();
    lastP = p;
    // (in the lead this is drawn over the agents chapter's painted room: only once that is there)
    if (p < 0 && !agentsWhole()) return false;
    var melt = RM ? (p > LEARN.RM_CUT ? 1 : 0) : ss(LEARN.MELT[0], LEARN.MELT[1], p);
    // the name over the painted room: in from the left wing as the camera turns, up and away before the room melts
    var nk = RM ? (p > LEARN.NAME[0] + 0.2 && p <= LEARN.RM_CUT ? 1 : 0) : io(ss(LEARN.NAME[0], LEARN.NAME[1], p));
    // (it leaves the way it came, for the left wing, before the light spreads; narrow: up and out, as quickly)
    var out = RM ? 0 : io(ss(LEARN.MELT[0] - 0.5, LEARN.MELT[0] - 0.05, p));
    var gone = narrow ? out : 0, up = narrow ? out * H * 0.06 : 0;
    putName(word, left, wy, gone >= 1 ? 0 : narrow ? nk : nk * (1 - out), up, gone);
    putName(say, sx, sy, gone >= 1 ? 0 : narrow ? nk : nk * (1 - out), up * 0.7, gone);
    // THE LANTERN'S LIGHT (MELT): the painted lantern's glow grows until it fills the screen, wholly opaque; under it,
    // for a breath, the painting gives way to the modelled room (the andon stands where the lantern stood); then the
    // light draws back into the andon. Never are both rooms seen at once: a frame frozen anywhere is one room and a
    // light, or the light alone. The camera and the painting stand still the whole time.
    var mp = clamp((p - LEARN.MELT[0]) / (LEARN.MELT[1] - LEARN.MELT[0])), M = LEARN.MELT_PEAK;
    var e = RM ? 0 : mp < M[0] ? io(mp / M[0]) : mp <= M[1] ? 1 : io((1 - mp) / (1 - M[1]));
    var swapped = RM ? melt > 0 : mp > (M[0] + M[1]) / 2;
    if (melt > 0 && !RM) {
      if (!flareXY) { var A = learnRoom(W, H, railRect()).andon; flareXY = [A[0], A[1] + (A[2] - A[1]) * 0.36, Math.hypot(Math.max(A[0], W - A[0]), Math.max(A[1], H - A[1]))]; }
      css(flare, 'background', flareAt(e));
      css(flare, 'visibility', e > 0 ? 'inherit' : 'hidden');
    } else css(flare, 'visibility', 'hidden');
    if (!swapped) {
      css(glHost, 'visibility', 'hidden'); css(pagesTop, 'visibility', 'hidden');
      // (the modelled room is made ready under the light, so it is whole when the light covers the screen)
      if (melt > 0 && pending <= 0) { view.setActive(true); view.frame(0, HELD ? T_HELD : t, 1); }
      else view.setActive(false);
      return true;
    }
    if (pending > 0) return false;
    var dq = p <= 0 ? 0 : clamp(p / LB);
    // the end: the ledger shuts, and the camera leaves the desk for the next chapter's first place (join.js SITE)
    var shut = RM ? (p > SITE.RM_CUT ? 1 : 0) : ss(SITE.SHUT[0], SITE.SHUT[1], p);
    var lift = RM ? (p > SITE.RM_CUT ? 1 : 0) : io(ss(SITE.LIFT[0], SITE.LIFT[1], p));
    view.setActive(true);
    // (a phone: once the light has gone, the camera rises from the painting's place to the test's own, the desk whole)
    var lead = p >= 0 ? 0 : 1 - io(ss(LEARN.MELT[1], 0, p));
    if (!view.frame(dq, HELD ? T_HELD : t, lead, shut, lift)) return false;
    css(glHost, 'visibility', ''); css(pagesTop, 'visibility', '');
    // (the pages' layer lies over this chapter's layer, so over the light: it comes as the light leaves the desk)
    css(pagesTop, 'opacity', e > 0 ? Math.pow(1 - e, 2).toFixed(3) : '');
    // (the modelled room comes in as dim as the painting, and its lamps come up as the camera goes to the desk)
    var lit = RM ? 1 : ss(LEARN.MELT[0] + 0.3, 0.7, p), f = lit >= 1 ? '' : 'brightness(' + (0.64 + 0.36 * lit).toFixed(3) + ') saturate(' + (0.78 + 0.22 * lit).toFixed(3) + ')';
    css(glHost, 'filter', f); css(pagesTop, 'filter', f);

    return true;
  }

  return {
    frame: frame,
    resize: function () { view.resize(); if (laid) layout(); },
    setActive: function (on) { active = !!on; },
    dispose: function () { view.dispose(); pagesTop.remove(); host.textContent = ''; },
    // (the rail and a phone's pill name this chapter once its name is on the screen)
    owns: function () { return lastP >= (LEARN.NAME[0] + LEARN.NAME[1]) / 2; },
    get view() { return view; }
  };
}
