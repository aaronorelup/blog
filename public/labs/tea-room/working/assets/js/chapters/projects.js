/* PROJECTS: a walk down the garden path (the tea room test tests/projects-walk/, made a chapter of the page:
   projects/scene.js is its scene, projects/plan.js its numbers, projects/data.js its twelve projects).

   How it joins (join.js PROJ): the site chapter's camera closes the house and comes down into the garden, to the
   walk's own first view, where the walk's grove already stands as flats in the modelled garden (projects/twin.js).
   This chapter's lead: its name in the giant type, in from the left wing over the taken-apart house (where the
   closing beat named it), out as the house closes; then, while the site chapter's picture holds still for its last
   screen, the painted walk dissolves in over it. From the section's top the walk itself: q 0..1 over .projects-walk.
   In .projects-foot the end card goes up and away before the closing beat names the next chapter over the house.

   Everything on the screen is a function of the scroll and the layout; the time moves only the fireflies, the clouds
   and the flames. Motion off: the walk stands still at each lantern in turn (the scroll picks the nearest stop), and
   the join and the dissolve are cuts. */
import { mount as mountScene } from './projects/scene.js';
import { PROJECTS, SHELVES, TOTAL } from './projects/data.js';
import { PROJ, projectsInset } from './join.js';

var clamp = function (v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v < a ? a : v > b ? b : v; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var K = 1.4;                                    // (look B lays its type out larger than it is drawn)
var T_HELD = 4.2;

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, root = document.documentElement;
  host.innerHTML = '<div class="pj-scene"></div><div class="flat word pj-word"></div><div class="flat say mono pj-say"></div>';
  var sceneHost = host.querySelector('.pj-scene'), word = host.querySelector('.pj-word'), say = host.querySelector('.pj-say');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  word.style.visibility = say.style.visibility = 'hidden';

  var railRect = function () { var rr = document.getElementById('rail'), rb = rr ? rr.getBoundingClientRect() : null; return rb && rb.width ? { right: rb.right, bottom: rb.bottom } : null; };
  var W = 1, H = 1, narrow = false, left = 0, wy = 0, sx = 0, sy = 0, wing = 0, walkS = 14.25, laid = false, lastP = -99;
  var scene = mountScene(sceneHost, {
    projects: PROJECTS, shelves: SHELVES, total: TOTAL, still: HELD, top: options.top, onChange: options.redraw,
    inset: function () {
      var rb = railRect(), w = root.clientWidth, h = window.innerHeight;
      return { left: projectsInset(w, h, rb), top: w <= 820 && rb ? rb.bottom : 0 };
    }
  });
  var was = {};
  function css(e, k, val) { var key = e.className + k; if (was[key] !== val) { was[key] = val; e.style[k] = val; } }

  function layout() {
    W = root.clientWidth; H = window.innerHeight; narrow = W <= 820;
    // the name: look B's rule (closing.js, site.js and the others have the same)
    var S = window.TEA && TEA.s ? TEA.s() : 1, wtall = W / H < 0.9, wp = clamp(W * (wtall ? 0.15 : 0.115), 52, 190 * S), sp = clamp(W * 0.0175, 17, 27 * S);
    if (!narrow) wp = Math.min(wp, H * 0.19);
    left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (sp * 0.8 * K) + 'px';
    wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + sp * 0.7;
    var rb = railRect(); wing = rb ? rb.right : 0;
    var m = options.marks.walk; walkS = m ? Math.max(1, m.h) : 14.25;
    was = {}; laid = true;
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

  // the stops with motion off: the first view, each lantern, the house
  function stopQ(q) {
    var L = scene.plan(), N = PROJECTS.length, stops = [0];
    for (var i = 0; i < N; i++) stops.push(L.qOf(i));
    stops.push(1);
    var best = 0;
    for (var j = 1; j < stops.length; j++) if (q >= (stops[j - 1] + stops[j]) / 2) best = j;
    return stops[best];
  }

  function frame(q, t, ptr) {
    if (!laid) layout();
    var p = q < 0 ? q : q * options.span();
    lastP = p;
    // the name, in the lead
    var nk = RM ? (p > PROJ.NAME[0] + 0.3 && p < PROJ.RM_CUT ? 1 : 0) : io(ss(PROJ.NAME[0], PROJ.NAME[1], p));
    var outk = RM ? 0 : io(ss(PROJ.OUT[0], PROJ.OUT[1], p));
    var gone = narrow ? outk : 0, up = narrow ? outk * H * 0.06 : 0;
    var nkk = gone >= 1 ? 0 : narrow ? nk : nk * (1 - outk);
    putName(word, left, wy, nkk, up, gone);
    putName(say, sx, sy, nkk, up * 0.7, gone);

    // the painted walk: dissolving in over the site chapter's last still picture, then the walk
    var e = RM ? (p >= PROJ.RM_SWAP ? 1 : 0) : ss(PROJ.DISSOLVE[0], PROJ.DISSOLVE[1], p);
    if (e <= 0) {
      css(sceneHost, 'visibility', 'hidden');
      scene.setActive(false);
      return true;
    }
    css(sceneHost, 'visibility', '');
    css(sceneHost, 'opacity', e < 1 ? e.toFixed(3) : '');
    scene.setActive(true);
    var qw = p <= 0 ? 0 : clamp(p / walkS);
    if (RM) qw = stopQ(qw);
    // the cards: away, up, in the foot (before the closing beat's name)
    var cards = p <= 0 ? 0 : 1 - ss(walkS + 0.25, walkS + 0.75, p);
    // (the far garden's lean with the mouse comes in only once the walk has begun: the dissolve is between two stills)
    var lean = HELD || RM ? null : { x: (ptr && isFinite(ptr.x) ? ptr.x : 0) * ss(0.05, 0.6, p), y: 0 };
    scene.frame(qw, HELD ? T_HELD : t, lean, cards);
    return scene.ready();
  }

  layout();
  return {
    frame: frame,
    resize: function () { layout(); scene.resize(); },
    setActive: function (on) { if (!on) scene.setActive(false); },
    dispose: function () { scene.dispose(); host.textContent = ''; },
    // (the rail and a phone's pill name this chapter once its name is on the screen)
    owns: function () { return lastP >= (PROJ.NAME[0] + PROJ.NAME[1]) / 2; },
    // (for tests: the projects' pictures are in too)
    picsReady: function () { return scene.picsReady(); }
  };
}
