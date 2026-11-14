/* THE AI ART & IMAGES CHAPTER: the garden gallery (the test tests/garden-gallery/; its scene is art-scene.js).
   How it joins, at its start: the games chapter ends in the night garden by the cloth and holds there; its picture
   leaves the cloth and the projector leaves for the left wing (games.js). Over that (this chapter's lead) the name
   comes on from the left wing, and this chapter's own garden, the same plate at the same place (join.js endPlate),
   dissolves in over it. Then the gallery's own first move: the camera turns from the cloth to the trees, where his
   pictures hang as lit lanterns down an avenue; it drifts along it, each picture comes close, lets go and rises; the
   grove opens onto the tea house and the camera looks up into a sky of pictures, where the four posts pass.
   At its end: the camera tilts back down, and what comes up from below is look B's own garden, the tea house on its
   lawn (toybox-garden.js, the 3D chapter's walk), standing a little low in the frame. The 3D chapter starts from
   exactly that picture (toybox.js: TILT), so its walk up the stones and in through the doorway follows with no cut.
   Everything drawn is a function of the scroll (the camera) and the time (what sways, drifts and glows); a picture
   clicked comes forward until the reader scrolls. With motion turned off: cuts, one picture at a time. */
import { mount as mountScene } from './art-scene.js';
import { endPlate, nameRightOf, TILT_LOW, H0_TALL, skyUpLayout } from './join.js';
import { makeGarden } from './toybox-garden.js';
import { PICTURES } from './art-pictures.js';

var IMG = new URL('../../img/', import.meta.url).href;
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var lerp = function (a, b, t) { return a + (b - a) * t; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
var K = 1.4;                                       // (look B lays its type out larger than it is drawn)
var T_HELD = 7.3;                                  // a held frame shows this moment (the test's own)
var N = PICTURES.length;
// when things happen, in screens from the section's top (the lead runs from -2 to 0)
var L = (N + 1.8) * 0.15 / (0.845 - 0.055);       // the test's scroll for its whole camera, in screens (its host.js)
var QA = 0.055;                                    // (the test's turn, from the cloth to the trees: q 0..QA)
// The turn starts in the lead, as soon as the name has come on (no screen of scroll where nothing moves), and gets
// TURN screens, more than the test's QA * L: sq(p) eases from 0 to QA over them and leaves at the test's own rate
// (1 / L), so the walk after it is the test's walk, only begun earlier. The name leaves as the camera turns.
var P0 = -0.8, TURN = 1.05;
var NAME_IN = [-1.95, -1.35], SAY_IN = [-1.85, -1.25], NAME_OUT = [P0 + 0.02, P0 + 0.55];
// this chapter's garden dissolves in over the games chapter's: after games has taken its picture off the cloth and
// its projector away (games.js "bare", -1.65..-1.2 here), and before the turn
var MELT = [-1.22, -0.84];
// the tilt back down, in screens from the foot's top: it starts as the last card goes up, and look B's garden comes
// up from below the screen, from so deep that what comes first is the night above its sky (join.js SKY_UP), until it
// stands TILT_LOW of the screen's height low. The camera tilts so far that the pictures rise out of the top of the
// screen, and look B's sky covers it whole; there the 3D chapter's name comes on, and toybox.js lifts the rest of
// the way. One plain ease over two screens (an ease of an ease went from below the screen to its place in a quarter).
var DOWN = [-0.45, 1.6];
function sqOf(p) {
  var u = p - P0;
  if (u <= 0) return 0;
  if (u >= TURN) return Math.min(1, QA + (u - TURN) / L);
  var b = (1 / L - QA / TURN) / TURN, a = QA / TURN - b * TURN;      // a u + b u^2: QA at TURN, at the rate 1 / L
  return a * u + b * u * u;
}

export function mount(host, options) {
  var RM = options.reduced, HELD = options.held, section = options.section, top = options.top, marks = options.marks;
  var root = document.documentElement, alive = true, active = false;

  host.innerHTML =
    '<div class="ar-world"></div>' +
    '<div class="ar-sheet"><div class="ar-skyup"></div><div class="ar-sky"></div><div class="ar-garden"></div></div>' +
    '<div class="ar-name"><div class="flat word"></div><div class="flat say mono"></div></div>';
  top.innerHTML =
    '<div class="ar-dock"><div class="ar-now" role="status" aria-live="polite"><p class="ar-meta"><span class="ar-count"></span><span class="ar-hint"></span></p><p class="ar-title"></p></div></div>';
  var pick = function (el, sel) { return el.querySelector(sel); };
  var worldEl = pick(host, '.ar-world'), sheet = pick(host, '.ar-sheet'), skyEl = pick(host, '.ar-sky'), gardenEl = pick(host, '.ar-garden'), skyUpEl = pick(host, '.ar-skyup');
  var word = pick(host, '.word'), say = pick(host, '.say');
  var dock = pick(top, '.ar-dock'), nowCount = pick(top, '.ar-count'), nowHint = pick(top, '.ar-hint'), nowTitle = pick(top, '.ar-title');
  (section.dataset.word || '').split('|').forEach(function (line) { var l = document.createElement('span'); l.className = 'l'; l.textContent = line; word.appendChild(l); });
  say.textContent = section.dataset.say || '';
  var touch = window.matchMedia('(hover: none)').matches, WORD = touch ? 'Tap' : 'Click';

  var W = root.clientWidth, H = window.innerHeight;
  var scene = mountScene(worldEl, {
    pictures: PICTURES, still: HELD, onChange: function () { options.redraw(); },
    // (a picture brought forward stands right of the rail on a wide screen)
    inset: function () { var r = W > 820 && document.getElementById('rail'); return r ? Math.max(0, r.getBoundingClientRect().right) : 0; },
    // (the turn starts from the games chapter's last view: the same plate, at the same place)
    start: function (w, h) {
      return endPlate(w, h, nameRightOf((section.dataset.word || '').split('|'), w, parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172));
    }
  });
  var garden = makeGarden(skyEl, gardenEl, IMG);
  var gardenLaid = false;
  garden.imgs.forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { gardenLaid = false; options.redraw(); }, { once: true }); });

  // ------------------------------------------------------------------ the layout
  var narrow = false, portrait = false, laid = false, wx = 0, wy = 0, sx = 0, sy = 0, upAll = 0;
  function layout() {
    W = root.clientWidth; H = window.innerHeight; narrow = W <= 820; portrait = W / H < 0.9;
    host.classList.toggle('narrow', narrow);
    var wp = clamp(W * (portrait ? 0.15 : 0.115), 52, 190), spx = clamp(W * 0.0175, 17, 27);
    var left = narrow ? 16 : (parseFloat(getComputedStyle(root).getPropertyValue('--rail-w')) || 172) + Math.max(16, Math.min(46, W * 0.032)) * 2;
    word.style.fontSize = (wp * K) + 'px'; say.style.fontSize = (spx * 0.8 * K) + 'px';
    wx = left; wy = H * (narrow ? 0.11 : 0.1);
    sx = left + wp * 0.08; sy = wy + word.offsetHeight / K + spx * 0.7;
    upAll = sy + say.offsetHeight / K + 24;
    scene.resize();
    var st0 = worldEl.querySelector('.gg-stars');
    skyUpH = skyUpLayout(skyUpEl, H, st0 ? st0.style.backgroundImage : ''); imgTop = null;
    if (garden.whole()) { garden.layout(W, H); gardenLaid = true; }
    nameWas = sayWas = ''; sheetWas = '';
  }
  var nameWas = '', sayWas = '', sheetWas = '', skyUpH = 0, imgTop = null;
  // (look B's way with a name: from the left wing, and back to it; a narrow screen: it rises on, and goes up off the top)
  function put(el, x, y, k, out, was) {
    var tr, o = 1;
    if (out > 0 && narrow) {
      tr = 'translate3d(' + x.toFixed(2) + 'px,' + (y + (1 - k) * H * 0.07 - out * upAll).toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')';
      if (k < 1) o = clamp((k - 0.06) * 5.5);
    } else if (out > 0) { var w = el.offsetWidth / K; tr = 'translate3d(' + (x - out * (Math.max(x, 0) + w + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    else if (narrow) { tr = 'translate3d(' + x.toFixed(2) + 'px,' + (y + (1 - k) * H * 0.07).toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; o = clamp((k - 0.06) * 5.5); }
    else { var w2 = el.offsetWidth / K; tr = 'translate3d(' + (x - (1 - k) * (Math.max(x, 0) + w2 + 30)).toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (1 / K).toFixed(5) + ')'; }
    var key = tr + o;
    if (key !== was) {
      el.style.transform = tr; el.style.visibility = k < 0.0005 || o <= 0 || out > 0.9995 ? 'hidden' : '';
      el.style.opacity = o < 1 ? o.toFixed(3) : '';
    }
    return key;
  }
  var vis = {};
  function setV(el, key, yes) { if (vis[key] !== yes) { el.style.visibility = yes ? '' : 'hidden'; vis[key] = yes; } }
  var opWas = -1;
  // (the dissolve is the world's alone: the name over it comes on by its own way)
  function setOp(o) { o = Math.round(o * 500) / 500; if (o !== opWas) { worldEl.style.opacity = o >= 1 ? '' : o; opWas = o; } }


  // ------------------------------------------------------------------ the frame
  var shown = { i: -2, sky: false }, dockWas = -1, sheetY = 0;
  var owned = false, lastP = 0, openP = 0;
  function frame(q, t, ptr) {
    if (!alive) return false;
    if (!laid) { layout(); laid = true; }
    if (!gardenLaid && garden.whole()) { garden.layout(W, H); gardenLaid = true; }
    var tm = HELD ? T_HELD : t;
    var p = q < 0 ? q : q * options.span(), lead = q < 0;
    var foot = marks.foot ? marks.foot.top : options.span() - 2;
    var picks = marks.picks ? marks.picks.top : L + 0.6;

    // the name
    var kIn = RM ? (p > -1.6 ? 1 : 0) : narrow ? io(ss(NAME_IN[0] + 0.15, NAME_IN[1], p)) : io(ss(NAME_IN[0], NAME_IN[1], p));
    var kSay = RM ? kIn : narrow ? io(ss(SAY_IN[0] + 0.15, SAY_IN[1], p)) : io(ss(SAY_IN[0], SAY_IN[1], p));
    // (motion off: the name goes at the cut from the cloth to the first picture, never before it: no bare still)
    var kOut = RM ? (sqOf(p) >= 0.03 ? 1 : 0) : io(ss(NAME_OUT[0], NAME_OUT[1], p));
    var kSayOut = RM || narrow ? kOut : io(ss(NAME_OUT[0] - 0.05, NAME_OUT[1] - 0.05, p));
    nameWas = put(word, wx, wy, kIn, kOut, nameWas);
    sayWas = put(say, sx, sy, kSay, kSayOut, sayWas);

    // the camera: the test's own, by the scroll (with motion off: cut to the nearest picture)
    var sq = sqOf(p);
    if (RM) {
      var k = scene.kOf(sq);
      sq = sq < 0.03 ? 0 : sq >= 0.845 ? 1 : scene.qOf(Math.round(clamp(k, 0, N - 1)));
    }
    // the dissolve over the games chapter's garden (its lead)
    var melt = RM ? (p > (MELT[0] + MELT[1]) / 2 ? 1 : 0) : ss(MELT[0], MELT[1], p);
    // the tilt back down at the end: look B's garden comes up from below the screen to TILT_LOW
    var down = RM ? (p > foot + (DOWN[0] + DOWN[1]) / 2 ? 1 : 0) : ss(foot + DOWN[0], foot + DOWN[1], p);
    var lift = 0, sheetOn = down > 0.0005 && gardenLaid;
    if (sheetOn) {
      garden.draw(portrait ? H0_TALL : 0, t);   // (the time as the 3D chapter draws it, so the two pictures are one)
      // (where the sky painting's top stands in its layer: measured once a layout, it depends on the screen alone)
      if (imgTop === null) {
        var si = skyEl.querySelector('img'); imgTop = si ? Math.round(si.getBoundingClientRect().top - skyEl.getBoundingClientRect().top) : 0;
        skyUpEl.style.transform = 'translate3d(0,' + (imgTop - skyUpH + 2) + 'px,0)'; sheetWas = '';
      }
      // from: the sheet's place when the night above its sky (SKY_UP) just touches the foot of the screen
      var from = H + skyUpH - imgTop + 0.02 * H;
      sheetY = Math.round(lerp(from, H * TILT_LOW, down) * 10) / 10;
      lift = from - sheetY;
      var tr = 'translate3d(0,' + sheetY.toFixed(1) + 'px,0)';
      if (tr !== sheetWas) { sheet.style.transform = tr; sheetWas = tr; }
    }
    setV(sheet, 'sheet', sheetOn);
    // once look B's garden and its sky cover the whole screen the gallery is not drawn at all
    var covered = sheetOn && down >= 1 && garden.whole();
    setV(worldEl, 'world', !covered);
    // (a picture brought forward goes back as soon as the reader scrolls: in the sky the camera holds still while the
    // posts pass, so the scene alone would not see the scroll)
    lastP = p;
    if (scene.isOpen() >= 0 && Math.abs(p - openP) > 0.012) scene.close();
    var st = covered ? scene.state : scene.frame(sq, tm, HELD || RM ? null : ptr, lift);
    setOp(lead ? melt : 1);

    // the card under the pictures: which one is in front, or that they are all in the sky
    // (what it says depends on the place alone: while the camera still turns it already names the first picture, as
    // the test's card does, so it never comes up empty and never keeps what an earlier scroll left in it)
    var sky = st.k > N - 0.3, at = st.index >= 0 ? st.index : clamp(Math.round(st.k), 0, N - 1);
    if (at !== shown.i || sky !== shown.sky) {
      shown = { i: at, sky: sky };
      if (sky) { nowCount.textContent = 'All ' + N; nowTitle.textContent = 'They let go, and rise past the moon'; nowHint.textContent = WORD + ' any of them'; }
      else { nowCount.textContent = (at + 1) + ' of ' + N; nowTitle.textContent = PICTURES[at].title; nowHint.textContent = at < 3 ? WORD + ' a picture to bring it forward' : ''; }
    }
    var tEnd = P0 + TURN;                          // (the card comes up as the turn ends, as the test's does)
    var dockO = lead ? 0 : RM ? (st.index >= 0 || sky) && p < picks - 1.1 ? 1 : 0 : ss(tEnd - 0.17, tEnd + 0.03, p) * (1 - ss(picks - 1.3, picks - 1.05, p));
    if (st.open >= 0) dockO = 0;
    dockO = Math.round(dockO * 100) / 100;
    if (dockO !== dockWas) { dock.style.opacity = dockO; dock.style.visibility = dockO > 0.01 ? '' : 'hidden'; dockWas = dockO; }

    owned = !lead || p >= MELT[1];
    var whole = scene.whole() && (!sheetOn || garden.whole());
    return whole;
  }

  // ------------------------------------------------------------------ a picture clicked comes forward
  // (the pictures are behind the page: a press anywhere that is not on a card, a link or the rail goes to them)
  function onPress(ev) {
    if (!active || ev.button) return;
    if (ev.target.closest && ev.target.closest('a, button, input, .paper, #rail, .chapter-top')) return;
    var i = scene.pick(ev.clientX, ev.clientY);
    if (i < 0 && scene.isOpen() < 0) return;
    scene.toggle(i); openP = lastP; options.redraw();
  }
  function onKey(ev) { if (ev.key === 'Escape' && active && scene.isOpen() >= 0) { scene.close(); options.redraw(); } }
  // (over a picture the pointer says it can be brought forward)
  var hoverRaf = 0, hx = 0, hy = 0, zoom = false;
  function onMove(ev) {
    if (ev.pointerType !== 'mouse') return;
    hx = ev.clientX; hy = ev.clientY;
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(function () {
      hoverRaf = 0;
      var el = document.elementFromPoint(hx, hy);
      var z = active && !(el && el.closest && el.closest('a, button, input, .paper, #rail, .chapter-top')) && scene.pick(hx, hy) >= 0;
      if (z !== zoom) { zoom = z; root.classList.toggle('ar-zoom', z); }
    });
  }
  document.addEventListener('click', onPress);
  document.addEventListener('keydown', onKey);
  if (!RM && !HELD) document.addEventListener('pointermove', onMove, { passive: true });

  return {
    frame: frame,
    resize: function () { if (laid) layout(); },
    setActive: function (on) { active = on; scene.setActive(on); if (!on && zoom) { zoom = false; root.classList.remove('ar-zoom'); } },
    owns: function () { return owned; },        // (once its garden has dissolved in, the rail names this chapter)
    scene: function () { return scene; },          // (for tests)
    dispose: function () {
      alive = false;
      document.removeEventListener('click', onPress); document.removeEventListener('keydown', onKey); document.removeEventListener('pointermove', onMove);
      root.classList.remove('ar-zoom');
      scene.dispose();
    }
  };
}
