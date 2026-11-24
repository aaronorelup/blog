/* THE ART CHAPTER'S POSTS: THEIR HOME (art.js calls it every frame; the look is in chapters.css, "the posts' home").
   The four post cards and "All 6 art posts" stand in .art-home, a place the size of the screen (sticky in the section,
   so without this script they still ride in, rest and ride on). Here they are held still on the screen for as long
   as they are on it, and everything they do is a function of the scroll alone:
     A, the shelf (the default): the row comes up from below the screen as the sky settles, rests there while the sky
        holds, and rises away with the pictures ("they let go") before the camera tilts down to the tea house.
     B, the dock (?home=b): one card low in the middle, where the card under the pictures counted them; the four
        posts take turns in it, "Post 2 of 4", then the dock rises away the same way.
   Places are in screens from the section's top: a = the top of the posts' track (mark "picks"), f = the foot. */
var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
var io = function (t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

export var VARIANT = new URLSearchParams(location.search).get('home') === 'b' ? 'b' : 'a';
// the card under the pictures goes before the posts come (art.js): from a + DOCK_OUT[0] to a + DOCK_OUT[1]
export var DOCK_OUT = [-1.05, -0.85];
var IN = VARIANT === 'b' ? [-0.85, -0.3] : [-0.85, -0.2];   // (from a) coming up from below the screen
var OUT = [-1.08, -0.4];                                    // (from f) rising away, whole, off the top of the screen
var TW = 0.16;                                              // B: a change of post takes this much scroll

export function makeHome(section, RM) {
  var B = VARIANT === 'b';
  section.classList.toggle('home-b', B);
  var home = section.querySelector('.art-home');
  if (!home) return { frame: function () {}, dispose: function () {} };
  var picks = home.querySelector('.art-picks'), all = home.querySelector('.art-all');
  var items = Array.prototype.slice.call(home.querySelectorAll('.art-picks li'));
  var n = items.length;
  var was = {}, offWas = null, gWas = null, last = { a: 0, f: 0 };

  function set(el, key, tr, o) {
    var k = tr + '|' + o;
    if (was[key] === k) return;
    was[key] = k; el.style.transform = tr; el.style.opacity = o >= 1 ? '' : String(o);
  }
  // B: where the posts change, and which one is in the dock for a place p (a continuous index, 0..n-1)
  function slots(a, f) {
    var s0 = a + IN[1], s1 = f + OUT[0], step = (s1 - s0) / n, r = [];
    for (var i = 1; i < n; i++) r.push(s0 + i * step);
    return { s0: s0, step: step, edges: r };
  }
  function indexAt(p, a, f) {
    var e = slots(a, f).edges, u = 0;
    for (var i = 0; i < e.length; i++) u += RM ? (p >= e[i] ? 1 : 0) : io(ss(e[i] - TW / 2, e[i] + TW / 2, p));
    return u;
  }

  function frame(p, a, f, hidden) {
    var H = window.innerHeight;
    last.a = a; last.f = f;
    // (far from the posts, e.g. down the avenue: hidden once, and nothing measured)
    if (p < a + IN[0] - 0.25 || p > f) {
      set(picks, 'p', 'none', 0); if (all) set(all, 'a', 'none', 0);
      if (gWas !== 1) { picks.style.removeProperty('--gnd'); gWas = 1; }
      if (offWas !== true) { home.classList.add('off'); offWas = true; }
      return;
    }
    // in and out: k comes up 0..1, m goes 0..1
    var k = RM ? (p >= a + (IN[0] + IN[1]) / 2 ? 1 : 0) : io(ss(a + IN[0], a + IN[1], p));
    // (leaving: the cards stay whole and rise straight off the top of the screen, past the moon; only their dark ground
    // goes, in the first third, so no block hangs in mid-sky and nothing half-faded crosses the pictures)
    var mt = RM ? (p >= f + (OUT[0] + OUT[1]) / 2 ? 1 : 0) : ss(f + OUT[0], f + OUT[1], p);
    var m = mt * mt * (2 - mt);
    // (the home is sticky: where it actually stands now; the cards are held still against it)
    var y0 = home.getBoundingClientRect().top;
    var rise = picks.offsetHeight + (all ? all.offsetHeight : 0) + 60;
    var ty = -y0 + (1 - k) * rise - m * (H + 40);
    var o = m >= 1 ? 0 : clamp(k * 2.2);
    var g = Math.round((1 - ss(0, 0.35, mt)) * 100) / 100;
    if (g !== gWas) { if (g >= 1) picks.style.removeProperty('--gnd'); else picks.style.setProperty('--gnd', String(g)); gWas = g; }
    if (hidden) o = 0;
    o = Math.round(o * 1000) / 1000;
    var tyr = Math.round(ty), tr = tyr ? 'translate(0,' + tyr + 'px)' : 'none';   // (whole pixels: the words stay sharp, and land alike however the page got there)
    set(picks, 'p', tr, o);
    if (all) set(all, 'a', tr, o);
    var off = o < 0.5;
    if (off !== offWas) { home.classList.toggle('off', off); offWas = off; }
    if (!B) return;
    // B: the posts take turns in the one card, the one going slides out left as the next comes in from the right
    var u = indexAt(p, a, f), sh = 64 * (window.TEA && TEA.s ? TEA.s() : 1);
    for (var i = 0; i < n; i++) {
      var rel = i - u, io2 = clamp(1 - Math.abs(rel) * 1.7);
      set(items[i], 'i' + i, (Math.round(rel * sh) ? 'translate(' + Math.round(rel * sh) + 'px,0)' : 'none'), Math.round(io2 * 1000) / 1000);
      var on = Math.abs(rel) < 0.5;
      if (items[i]._on !== on) { items[i]._on = on; items[i].style.pointerEvents = on ? '' : 'none'; items[i].style.zIndex = on ? '1' : ''; }
    }
  }

  // a reader who comes by the keyboard: focus on a card that is not at rest brings the page to where it rests
  function onFocus(ev) {
    var li = ev.target.closest && ev.target.closest('li'), j = li ? items.indexOf(li) : -1;
    var a = last.a, f = last.f;
    if (!f) return;
    var want;
    if (B && j >= 0) { var s = slots(a, f); want = s.s0 + (j + 0.5) * s.step; }
    else want = (a + IN[1] + f + OUT[0]) / 2;
    var top = section.getBoundingClientRect().top + window.scrollY, H = window.innerHeight;
    var now = (window.scrollY - top) / H;
    var lo = B && j >= 0 ? want - slots(a, f).step / 2 + TW : a + IN[1], hi = B && j >= 0 ? want + slots(a, f).step / 2 - TW : f + OUT[0];
    if (now < lo || now > hi) window.scrollTo(0, Math.round(top + want * H));
  }
  home.addEventListener('focusin', onFocus);

  return {
    frame: frame,
    dispose: function () {
      home.removeEventListener('focusin', onFocus);
      [picks, all].concat(items).forEach(function (el) { if (el) { el.style.transform = ''; el.style.opacity = ''; el.style.pointerEvents = ''; el.style.zIndex = ''; } });
      if (picks) picks.style.removeProperty('--gnd');
      home.classList.remove('off'); was = {}; offWas = null; gWas = null;
    }
  };
}
