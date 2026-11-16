/* One flick, one stop: the page plays itself from one resting place to the next, the way the homepage's camera
   flies from stop to stop. A trial, switched on by ?step=1 (kept for the tab; ?step=0 switches it off).

   The scroll position stays the only truth. A flight only calls scrollTo, frame after frame, by the time that has
   passed; the stop to fly to is always worked out from where the page IS, never from a remembered number. So the
   scrollbar, the chapter list, a link to a chapter, the keyboard's focus and every test that scrolls work as before,
   and any of them simply ends a flight.

   The stops are the page's own rests (steps-data.js): the stretches where the picture holds still while the scroll
   goes on. Each is [section id, where the rest begins, where it ends], in screens from the section's top. A flight
   leaves from the END of the rest it stands in (nothing changes on the way there, so that hop is not seen) and
   lands just inside the next one.

   A mouse wheel and the keyboard only. A phone scrolls as it always did. Ctrl + wheel still zooms; Alt + wheel
   scrolls freely by hand, and so does the scrollbar. */
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search), KEY = 'tea-step';
  var want = qs.get('step');
  try {
    if (want === '1' || want === '0') sessionStorage.setItem(KEY, want);
    else want = sessionStorage.getItem(KEY);
  } catch (err) { /* no storage: the address decides */ }
  if (want !== '1') return;
  if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;   // a phone: its own scrolling
  var STOPS = window.TEA_STOPS || [];
  if (!STOPS.length) return;
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var CRUISE = 1.25;        // screens a second, the pace of a flight
  var UP = 0.45, DOWN = 0.6; // seconds to reach that pace, and to come to rest
  var BOOST = 1.6, BOOST_MAX = 4;   // a second flick in the air: a stop further, this much faster
  var QUIET = 170;          // ms without a wheel event before the next one counts as a new flick
  var INSET = 0.12;         // screens inside a rest where a flight lands

  // ---- the stops in pixels, measured when asked (the page's length changes as chapters mount)
  var rests = [], measuredAt = -1, measuredH = 0;
  function measure() {
    var H = window.innerHeight, full = document.documentElement.scrollHeight;
    if (full === measuredAt && H === measuredH && rests.length) return;
    measuredAt = full; measuredH = H;
    var max = Math.max(0, full - H), tops = {}, out = [];
    STOPS.forEach(function (s) {
      var top = tops[s[0]];
      if (top === undefined) {
        var el = document.getElementById(s[0]);
        top = tops[s[0]] = el ? el.getBoundingClientRect().top + window.scrollY : null;
      }
      if (top === null) return;
      var a = Math.round(top + s[1] * H), b = Math.round(top + s[2] * H);
      a = Math.min(max, Math.max(0, a)); b = Math.min(max, Math.max(a, b));
      var at = Math.round(Math.min(a + INSET * H, (a + b) / 2));
      out.push({ a: a, b: b, at: at });
    });
    out.sort(function (p, q) { return p.at - q.at; });
    // (the page's two ends are always stops)
    if (!out.length || out[0].at > 4) out.unshift({ a: 0, b: 0, at: 0 });
    if (out[out.length - 1].at < max - 4) out.push({ a: max, b: max, at: max });
    rests = out.filter(function (r, i) { return i === 0 || r.at - out[i - 1].at > 24; });
  }
  // the rest the page stands in (or -1), and the stop a flick in a direction goes to from y
  function restAt(y) { for (var i = 0; i < rests.length; i++) if (y >= rests[i].a - 2 && y <= rests[i].b + 2) return i; return -1; }
  function nextFrom(y, dir) {
    var i;
    if (dir > 0) { for (i = 0; i < rests.length; i++) if (rests[i].at > y + 6 && !(y >= rests[i].a - 2 && y <= rests[i].b + 2)) return i; return -1; }
    for (i = rests.length - 1; i >= 0; i--) if (rests[i].at < y - 6 && !(y >= rests[i].a - 2 && y <= rests[i].b + 2)) return i;
    return -1;
  }

  // ---- a flight
  var fly = null, raf = 0, lastSet = -1;
  function put(y) { lastSet = Math.round(y); window.scrollTo(0, lastSet); }
  function land() { fly = null; if (raf) cancelAnimationFrame(raf); raf = 0; document.documentElement.removeAttribute('data-tea-flying'); }
  function tick(ts) {
    raf = 0;
    if (!fly) return;
    // (something else moved the page: the scrollbar, a link, the keyboard's focus. The flight is over)
    if (Math.abs(window.scrollY - lastSet) > 3) { land(); return; }
    var dt = Math.min(0.1, Math.max(0, (ts - fly.t) / 1000)); fly.t = ts;
    var H = window.innerHeight, t = rests[fly.to];
    if (!t) { land(); return; }
    var dir = fly.dir, y = fly.y;
    // (inside the rest it is flying to, nothing changes any more: it is there)
    if ((dir > 0 && y >= t.at) || (dir < 0 && y <= t.b)) { put(t.at); land(); return; }
    // (a rest on the way that is not the one it is going to: nothing changes across it, so it is crossed at once)
    var k = restAt(y);
    if (k >= 0 && k !== fly.to) y = dir > 0 ? Math.max(y, rests[k].b + 3) : Math.min(y, rests[k].a - 3);
    var left = Math.abs((dir > 0 ? t.at : t.b) - y);
    var top = CRUISE * H * fly.boost;
    var brake = Math.sqrt(2 * (top / DOWN) * left);          // the fastest it may go and still come to rest there
    var aim = Math.min(top, Math.max(brake, 0.04 * H));
    var dv = aim - fly.v;
    fly.v += dv > 0 ? Math.min(dv, (top / UP) * dt) : Math.max(dv, -(top / DOWN) * 2.2 * dt);
    y += dir * fly.v * dt;
    fly.y = y;
    put(y);
    raf = requestAnimationFrame(tick);
  }
  function go(dir) {
    measure();
    var y = window.scrollY;
    if (fly && fly.dir === dir) {                           // a flick in the air: a stop further, faster
      var further = fly.to + dir;
      if (rests[further]) fly.to = further;
      fly.boost = Math.min(BOOST_MAX, fly.boost * BOOST);
      return;
    }
    var here = fly ? -1 : restAt(y);
    var to = nextFrom(fly ? fly.y : y, dir);
    if (to < 0) return;                                      // an end of the page
    if (RM) { land(); put(rests[to].at); return; }
    var from = fly ? fly.y : y;
    // (leave from the far edge of the rest it stands in: the picture does not change on the way there)
    if (here >= 0) from = dir > 0 ? Math.max(from, rests[here].b - 1) : Math.min(from, rests[here].a + 1);
    fly = { dir: dir, to: to, y: from, v: fly && fly.dir === dir ? fly.v : 0, boost: 1, t: performance.now() };
    document.documentElement.setAttribute('data-tea-flying', dir > 0 ? 'down' : 'up');
    put(from);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // ---- what starts one
  // (an element under the pointer that scrolls by itself keeps the wheel)
  function scrollsItself(el, dy) {
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1) {
        var o = getComputedStyle(el).overflowY;
        if ((o === 'auto' || o === 'scroll') && (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true;
      }
    }
    return false;
  }
  var lastWheel = 0, lastDir = 0;
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) { if (fly && e.altKey) land(); return; }   // zoom; sideways; Alt: by hand
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    if (Math.abs(dy) < Math.abs(e.deltaX)) return;           // a sideways swipe is not ours
    if (scrollsItself(e.target, dy)) return;
    e.preventDefault();
    if (Math.abs(dy) < 2) return;
    var dir = dy > 0 ? 1 : -1, now = performance.now();
    var stream = now - lastWheel < QUIET && dir === lastDir; // the same flick still arriving (a wheel's run, a trackpad's glide)
    lastWheel = now; lastDir = dir;
    if (stream) return;
    go(dir);
  }, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') { if (fly) land(); return; }
    var a = document.activeElement;
    if (a && a !== document.body && a !== document.documentElement) return;   // a game, a button, a link has the keys
    var k = e.key, dir = 0;
    if (k === 'PageDown' || k === 'ArrowDown' || (k === ' ' && !e.shiftKey)) dir = 1;
    else if (k === 'PageUp' || k === 'ArrowUp' || (k === ' ' && e.shiftKey)) dir = -1;
    if (!dir) return;
    e.preventDefault();
    go(dir);
  });
  window.addEventListener('resize', function () { measuredAt = -1; });
  window.addEventListener('blur', function () { if (fly) land(); });

  // (for tests: the stops in pixels, whether a flight is on, and a flick without a wheel)
  window.TEA_STEP = {
    stops: function () { measure(); return rests.map(function (r) { return r.at; }); },
    rests: function () { measure(); return rests.slice(); },
    flying: function () { return !!fly; },
    go: go
  };
})();
