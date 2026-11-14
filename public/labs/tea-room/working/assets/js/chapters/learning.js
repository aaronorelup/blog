/* LEARNING TO BUILD WITH AI: the ledger opens (the tea room test tests/ledger-book/, its scene made a chapter of the
   page: learning/*.js are the test's js, changed only where the head of learning/scene.js says).

   How it joins (join.js LEARN, read it first): after the camera has come back out of the television, the agents
   chapter turns its painted room to the corner where the standing lantern is, by the shoji. Over that (this chapter's
   lead) the chapter's name comes on from the left wing (look B's flat word) and goes; then the modelled room, the
   homepage's own tea house by night, dissolves in over the painting, seen from the place where its andon stands
   exactly where the painted lantern stood (LEARN's pose; both pictures still while they melt). From there the test's
   own arrival: the camera comes down onto the writing desk, the ledger opens, and one post is read to a spread, a
   leaf turned for each. Once the book is open the camera never moves. At the end the lamps go low, and the next
   chapter's name (closing.js) comes on over the open book.

   Everything on the screen is a function of q and the layout (the lamps' flicker and the petals follow the time).
   Motion off: the painting cuts to the desk, the book opens with a whole spread at a time (the test's own). */
import { mount as mountScene } from './learning/scene.js';
import { LEARN, learnPose, learnInset, learnRoom } from './join.js';

var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var smooth = function (v) { v = clamp(v); return v * v * (3 - 2 * v); };
var ss = function (a, b, x) { return smooth((x - a) / (b - a)); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

var LB = 8;                       // the test's 0..1 runs over LB screens from the section's top (its own track: 900vh)
var LOW = [0.4, 1.3];             // screens after that: the lamps go low as the next chapter's name comes on (.learning-foot)
var T_HELD = 7.3;                 // (the test's own held time)
var K = 1.4;                      // (look B lays its type out larger than it is drawn)

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, root = document.documentElement;
  host.innerHTML = '<div class="lr-gl"></div><div class="lr-low"></div><div class="flat word lr-word"></div><div class="flat say mono lr-say"></div>';
  var $ = function (s) { return host.querySelector(s); };
  var glHost = $('.lr-gl'), lowEl = $('.lr-low'), word = $('.lr-word'), say = $('.lr-say');
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

  var narrow = false, left = 0, wy = 0, sx = 0, sy = 0, laid = false, active = false, lastP = -99;
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
    was = {}; laid = true;
  }
  var was = {};
  function css(e, k, v) { var key = e.className + k; if (was[key] !== v) { was[key] = v; e.style[k] = v; } }
  function putName(el, x, y, k, up, fade) {
    var tr, o = 1 - fade;
    if (narrow) { tr = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - k) * H * 0.07 - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o *= clamp((k - 0.06) * 5.5); }
    else { var w = el.offsetWidth / K; tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w + 30)).toFixed(1) + 'px,' + (y - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    css(el, 'transform', tr);
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
    if (melt <= 0) {
      css(glHost, 'visibility', 'hidden'); css(pagesTop, 'visibility', 'hidden');
      view.setActive(false);
      return true;
    }
    if (pending > 0) return false;
    var dq = p <= 0 ? 0 : clamp(p / LB);
    var low = RM ? (p > LB + (LOW[0] + LOW[1]) / 2 ? 1 : 0) : ss(LB + LOW[0], LB + LOW[1], p);
    view.setActive(true);
    if (!view.frame(dq, HELD ? T_HELD : t, low)) return false;
    css(glHost, 'visibility', ''); css(pagesTop, 'visibility', '');
    // The modelled room comes in as the lantern's light spreads: from the andon (where the painted lantern stands)
    // outward, a soft edge, until it has the whole screen; the camera and the painting still
    var mk = '';
    if (melt < 1) {
      var A = learnRoom(W, H, railRect()).andon, cx = A[0], cy = (A[1] + A[2]) / 2;
      var far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
      var r = clamp((p - LEARN.MELT[0]) / (LEARN.MELT[1] - LEARN.MELT[0])) * (far + 0.5 * H), soft = 0.45 * H;      // (at an even pace)
      mk = 'radial-gradient(circle at ' + cx.toFixed(0) + 'px ' + cy.toFixed(0) + 'px, #000 ' + Math.max(0, r - soft).toFixed(0) + 'px, rgba(0,0,0,0) ' + r.toFixed(0) + 'px)';
    }
    css(glHost, 'webkitMaskImage', mk); css(glHost, 'maskImage', mk);
    css(pagesTop, 'webkitMaskImage', mk); css(pagesTop, 'maskImage', mk);
    // (the modelled room comes in as dim as the painting, and its lamps come up as the camera goes to the desk)
    var lit = RM ? 1 : ss(LEARN.MELT[0] + 0.3, 0.7, p), f = lit >= 1 ? '' : 'brightness(' + (0.64 + 0.36 * lit).toFixed(3) + ') saturate(' + (0.78 + 0.22 * lit).toFixed(3) + ')';
    css(glHost, 'filter', f); css(pagesTop, 'filter', f);

    // the lamps low: the pages go down into the picture (behind the page, under the dark), so the next chapter's name,
    // drawn over this chapter, stands clear over them; back up in front, where they can be pressed, as the lamps come up
    var into = low > 0 ? glHost : pagesTop;
    if (pages && pages.parentNode !== into) into.appendChild(pages);
    css(lowEl, 'opacity', low > 0 ? low.toFixed(3) : '0');
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
