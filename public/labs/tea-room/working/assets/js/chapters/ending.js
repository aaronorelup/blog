/* THE ENDING: COURSES, NOW AND ABOUT, the page's last chapter (the tea room test tests/the-ending/ made a chapter of the
   page: ending/scene.js is its scene, ending/props.js what it draws by code). One section, #ending, holds three parts
   (#courses, #now, #about), each a card in the flow of the page and a line of its own in the rail (chapters.js parts).

   The pace is the test's (its js/host.js): q runs 0..1 over the three parts, a third each, and inside a part 0..0.7
   runs while its card passes (from the part's top at the top of the screen until the card's foot is halfway up the
   screen) and 0.7..1 while the scene stands alone after it, until the next part's top (or the page's end). The marks
   are the cards' and parts' places in the section (chapters.js measures them), so the cards set the pace.

   How it joins (join.js ENDING): the walk's camera goes on into the lit tea house, through its door (projects.js, in
   the projects section's foot), and ends on this chapter's first picture, the back room from its threshold. Over that
   picture, in this chapter's lead, its name comes on from the left wing, and leaves as the Courses card comes up.
   The page ends on the garden in the morning. Everything on the screen is a function of the scroll; nothing plays. */
import { mount as mountScene } from './ending/scene.js';
import { ENDING } from './join.js';

var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var K = 1.4;                                    // (look B lays its type out larger than it is drawn)
var PARTS = [['courses', 'c-card'], ['now', 'n-card'], ['about', 'a-card']];

export function mount(host, options) {
  var RM = options.reduced, section = options.section, root = document.documentElement;
  host.innerHTML = '<div class="en-scene"></div><div class="flat word en-nw"></div><div class="flat say mono en-ns"></div>';
  var sceneHost = host.querySelector('.en-scene'), word = host.querySelector('.en-nw'), say = host.querySelector('.en-ns');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  word.style.visibility = say.style.visibility = 'hidden';
  var scene = mountScene(sceneHost, { reduced: RM });

  var W = 1, H = 1, narrow = false, left = 0, wy = 0, sx = 0, sy = 0, wing = 0, laid = false, lastP = -99, marks = [];
  var was = {};
  function css(e, k, val) { var key = e.className + k; if (was[key] !== val) { was[key] = val; e.style[k] = val; } }

  function layout() {
    W = root.clientWidth; H = window.innerHeight; narrow = W <= 820;
    // the name: look B's rule (projects.js, site.js and the others have the same)
    var S = window.TEA && TEA.s ? TEA.s() : 1, wtall = W / H < 0.9, wp = clamp(W * (wtall ? 0.15 : 0.115), 52, 190 * S), sp = clamp(W * 0.0175, 17, 27 * S);
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null; wing = rb && rb.width ? rb.right : 0;
    // the parts' marks, in screens from the section's top (the test's a, b, c)
    var m = options.marks, span = options.span();
    marks = PARTS.map(function (pc, i) {
      var part = m[pc[0]] || { top: i * span / 3, h: span / 3 }, card = m[pc[1]] || { top: part.top + 0.5, h: 1 };
      var a = part.top, b = Math.max(a + 0.001, card.top + card.h - 0.5);
      return { a: a, b: b, c: 0 };
    });
    marks.forEach(function (mk, i) { mk.c = Math.max(mk.b + 0.001, i < marks.length - 1 ? marks[i + 1].a : span); });
    was = {}; laid = true;
  }
  // p (screens from the section's top) -> the scene's q, as the test's host.js has it
  function progress(p) {
    var q = 0;
    for (var i = 0; i < marks.length; i++) {
      var c = marks[i];
      if (p < c.a) break;
      var u = p < c.b ? 0.7 * (p - c.a) / (c.b - c.a) : 0.7 + 0.3 * clamp((p - c.b) / (c.c - c.b));
      q = (i + clamp(u)) / marks.length;
    }
    return clamp(q);
  }
  function putName(el, x, y, k, up, fade) {
    var tr, o = 1 - fade, xx = x;
    if (narrow) { tr = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - k) * H * 0.07 - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o *= clamp((k - 0.06) * 5.5); }
    else { var w = el.offsetWidth / K; xx = x - (1 - k) * (Math.max(x, 0) + w + 30); tr = 'translate3d(' + xx.toFixed(1) + 'px,' + (y - up).toFixed(1) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    css(el, 'transform', tr);
    // (the left wing is the rail's right edge: what of the name is still left of it is not drawn, melting over a few
    // dozen pixels, as every chapter's name does)
    var cut = narrow ? 0 : (wing - xx) * K;
    var fe = Math.max(8, Math.min(70, x - wing - 2)) * K, mk = !narrow && cut + fe > 0 ? 'linear-gradient(to right, transparent ' + cut.toFixed(1) + 'px, #000 ' + (cut + fe).toFixed(1) + 'px)' : '';
    css(el, 'maskImage', mk); css(el, 'webkitMaskImage', mk);
    css(el, 'visibility', k < 0.0005 || o <= 0 ? 'hidden' : '');
    css(el, 'opacity', o < 1 ? o.toFixed(3) : '');
  }

  function frame(q) {
    if (!laid) layout();
    var p = q < 0 ? q : q * options.span();
    lastP = p;
    // the name: in from the left wing over the room (the lead), out as the Courses card comes up
    var nk = RM ? (p > ENDING.NAME[0] + 0.3 && p < ENDING.OUT[1] ? 1 : 0) : io(ss(ENDING.NAME[0], ENDING.NAME[1], p));
    var outk = RM ? 0 : io(ss(ENDING.OUT[0], ENDING.OUT[1], p));
    var gone = narrow ? outk : 0, up = narrow ? outk * H * 0.06 : 0;
    var nkk = gone >= 1 ? 0 : narrow ? nk : nk * (1 - outk);
    putName(word, left, wy, nkk, up, gone);
    putName(say, sx, sy, nkk, up * 0.7, gone);
    // (for now: the room dissolves in over the walk's last picture)
    css(sceneHost, 'opacity', p < 0 ? ss(-1, -0.45, p).toFixed(3) : '');
    return scene.frame(p <= 0 ? 0 : progress(p));
  }

  layout();
  return {
    frame: frame,
    resize: function () { layout(); scene.resize(); },
    setActive: function () { /* nothing here plays: there is nothing to start or stop */ },
    dispose: function () { scene.dispose(); host.textContent = ''; },
    // (the rail names this chapter once its name is on the screen)
    owns: function () { return lastP >= (ENDING.NAME[0] + ENDING.NAME[1]) / 2; },
    progress: function (p) { return progress(p); }
  };
}
