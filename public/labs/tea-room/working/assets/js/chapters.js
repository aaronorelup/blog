/* CHAPTERS: the page after look B's part.
   Look B (diorama.js) draws the hero, Start here and the television, and ends on the garden cinema's title shot.
   Every chapter after that is added here, and a chapter is three things:

     1. a <section class="chapter" id="NAME"> in index.html, after the one before it. Its height is its scroll length;
        everything read in it (cards, links) is plain HTML in the flow of the page, styled in assets/css/chapters.css.
     2. a scene, assets/js/chapters/NAME.js, that draws the chapter's pictures:
          export function mount(host, options) { ...; return { frame, resize, setActive, dispose }; }
     3. one line in LIST below.

   The scene draws into host, a layer the size of the screen that stays put behind the cards (pictures only), and
   puts whatever is pressed while the pictures move (a sound switch, a play button) into options.top, a layer the
   same size in front of the cards.
     frame(q, time, pointer)   draw the picture for q, the chapter's progress: 0 when the top of its section reaches
                               the top of the screen, 1 when its last line reaches the foot of the screen. time is in
                               seconds (it stands still under ?still=1 and with motion turned off), pointer is the
                               mouse, -1..1 each way. Return true once the picture is whole (its plates are in): until
                               then the chapter before stays on the screen.
     resize()                  the window changed, or the section was measured again
     setActive(on)             on: this chapter holds the screen (play what plays). off: pause everything
     dispose()                 the reader is far away: stop, and let go of what was loaded
   options: section (the chapter's own section), top, marks (where each [data-mark] element of the section stands,
   in screens from the section's top: { name: { top, h } }), span() (the section's scroll length in screens), held
   (time stands still), reduced (motion is turned off), redraw() (ask for a frame when the page is not drawing by
   itself: a picture came in, or a film plays while time is held).

   Two things a line in LIST may add:
     over: true   the chapter is drawn over the last picture of the chapter before it, which stays on and active
     lead: n      the chapter is on the screen for n screens before its own top; q runs from -n up to 0 there

   A scene is loaded when the reader is within a screen and a half of its section, and let go four screens away. A
   picture of the section written as <img data-src> is asked for at the same moment, and only if it is shown (one in
   a part that is display: none, as the film's stills are with motion on, is never fetched).
   Addresses: ?y=0.4 (that fraction of the whole page) and ?still=1 are look B's; ?c=film&q=0.4 opens one chapter
   at an exact frame. */
(function () {
  'use strict';

  var LIST = [
    { id: 'film', css: 'film.css' },
    { id: 'games', css: 'games.css', lead: 2.5 },   // (its lead: it is thrown onto the film's cloth during the film's dive, join.js)
    { id: 'closing', over: true, lead: 1 }      // the page's last beat for now: the next builder's chapter goes above this line
  ];

  var qs = new URLSearchParams(location.search);
  var HELD_Q = qs.get('still') === '1';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HELD = HELD_Q || RM;
  var root = document.documentElement;
  var here = document.currentScript.src.replace(/[^/]*$/, '');           // .../assets/js/
  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };

  // ------------------------------------------------------------------ the layers
  var under = document.createElement('div');
  under.id = 'chapters'; under.setAttribute('aria-hidden', 'true');
  document.getElementById('stage').after(under);
  LIST.forEach(function (c) {
    c.section = document.getElementById(c.id);
    c.host = document.createElement('div'); c.host.className = 'chapter-stage' + (c.over ? ' over' : ''); c.host.dataset.chapter = c.id;
    under.appendChild(c.host);
    c.topEl = document.createElement('div'); c.topEl.className = 'chapter-top';
    c.section.insertBefore(c.topEl, c.section.firstChild);
    c.marks = {}; c.state = 0; c.scene = null; c.whole = false; c.shown = false; c.active = false; c.top = 1e9; c.h = 1;
    var link = document.querySelector('#rail a[href="#' + c.id + '"]');
    c.rail = link ? link.closest('li') : null;
    // a picture written as <img data-src> is not asked for until its chapter is near (it holds a blank until then)
    Array.prototype.forEach.call(c.section.querySelectorAll('img[data-src]'), function (im) {
      if (!im.getAttribute('src')) im.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    });
  });
  var railItems = Array.prototype.slice.call(document.querySelectorAll('#rail li')), railNow = -1;

  // ------------------------------------------------------------------ measuring
  var W = 0, H = 1, started = false, lastY = 0, lastT = 0;
  function measure() {
    W = root.clientWidth; H = window.innerHeight;
    LIST.forEach(function (c) {
      var r = c.section.getBoundingClientRect();
      c.top = r.top + window.scrollY; c.h = r.height;
      Array.prototype.forEach.call(c.section.querySelectorAll('[data-mark]'), function (el) {
        var m = el.getBoundingClientRect();
        c.marks[el.dataset.mark] = { top: (m.top - r.top) / H, h: m.height / H };
      });
    });
  }
  function travel(c) { return Math.max(1, c.h - H); }

  // ------------------------------------------------------------------ loading and letting go
  function sheet(href) {
    return new Promise(function (done) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href;
      l.onload = done; l.onerror = done; document.head.appendChild(l);
    });
  }
  function load(c) {
    c.state = 1;
    // (a picture in a part of the section that is not shown, display: none, is not asked for at all: the film's
    // fourteen stills are shown only with motion turned off)
    Array.prototype.forEach.call(c.section.querySelectorAll('img[data-src]'), function (im) {
      if (!im.getClientRects().length) return;
      im.src = im.dataset.src; im.removeAttribute('data-src');
    });
    var waits = [import(here + 'chapters/' + c.id + '.js')];
    if (c.css && !c.cssIn) { c.cssIn = true; waits.push(sheet(here + '../css/chapters/' + c.css)); }
    Promise.all(waits).then(function (got) {
      if (c.state !== 1) return;
      c.scene = got[0].mount(c.host, {
        section: c.section, top: c.topEl, marks: c.marks, span: function () { return travel(c) / H; },
        held: HELD, reduced: RM, redraw: redraw
      });
      c.state = 2; c.whole = false; c.active = false;
      redraw();
    }).catch(function (err) {
      c.state = 3;                                   // the chapter before stays on the screen; the cards are still there to read
      if (window.console) console.warn('The ' + c.id + ' chapter did not load: ' + (err && err.message));
    });
  }
  function letGo(c) {
    if (c.scene) { try { c.scene.setActive(false); c.scene.dispose(); } catch (err) { /* it is going anyway */ } }
    c.scene = null; c.state = 0; c.whole = false; c.active = false;
    c.host.textContent = ''; c.topEl.textContent = '';
    show(c, false);
  }
  function show(c, yes) {
    if (c.shown === yes) return;
    c.shown = yes; c.host.style.visibility = yes ? 'visible' : ''; c.topEl.style.visibility = yes ? 'visible' : '';
  }
  function setActive(c, yes) {
    if (c.active === yes || !c.scene) return;
    c.active = yes; c.scene.setActive(yes);
  }

  // ------------------------------------------------------------------ the frame
  // y: the scroll position the camera is at (look B's own, a breath behind the reader's). Returns true when a
  // chapter's picture covers the screen, so look B's stage has nothing left to draw.
  var ptr = { x: 0, y: 0 };
  function frame(y, t) {
    if (!started) return false;
    lastY = y; lastT = t;
    var holder = -1, i, c;
    for (i = 0; i < LIST.length; i++) {
      c = LIST[i];
      var lead = (c.lead || 0) * H;
      if (c.state === 0 && y > c.top - lead - 1.5 * H && y < c.top + c.h + 1.5 * H) load(c);
      else if (c.state === 2 && (y < c.top - lead - 4 * H || y > c.top + c.h + 4 * H)) letGo(c);
      if (!c.over && y >= c.top - 1) holder = i;        // (a section's top is seldom a whole pixel: its own address must land in it)
    }
    // the chapter that holds the screen; while its picture is not whole yet, the one before it stays
    var base = -1;
    for (i = holder; i >= 0; i--) {
      c = LIST[i];
      if (c.over || !c.scene) continue;
      c.whole = !!c.scene.frame(clamp((y - c.top) / travel(c), 0, 1), t, ptr);
      if (c.whole) { base = i; break; }
    }
    // with it on the screen: a chapter drawn over it (over), and the next chapter while it comes on (its lead)
    for (i = 0; i < LIST.length; i++) {
      c = LIST[i];
      var on = i === base, guest = false;
      c.owns = false;
      if (!on && c.scene && y >= c.top - (c.lead || 0) * H && (c.over ? holder < i : y < c.top - 1)) {
        guest = true;
        c.whole = !!c.scene.frame(y < c.top ? (y - c.top) / H : clamp((y - c.top) / travel(c), 0, 1), t, ptr);
        on = c.whole;
        // (a guest whose picture already fills the screen, as the arena does once the film's cloth has left the frame,
        // is the chapter the reader is in: the rail names it)
        c.owns = on && !c.over && !!c.scene.owns && c.scene.owns();
      }
      show(c, on);
      setActive(c, on && (!guest || !!c.over));
    }
    // the rail: which chapter the middle of the screen is in
    var mid = y + H * 0.5, now = -1;
    for (i = 0; i < LIST.length; i++) if (LIST[i].rail && (mid >= LIST[i].top - H * 0.6 || LIST[i].owns)) now = i;
    // (look B's own stage marks its three chapters in the rail too, only when its own reckoning changes: so the mark
    // is checked every frame here, not only when this reckoning changes)
    if (now !== railNow || (now >= 0 && LIST[now].rail && !LIST[now].rail.classList.contains('now'))) {
      if (now >= 0) railItems.forEach(function (li) { li.classList.toggle('now', li === LIST[now].rail); });
      railNow = now;
    }
    return base >= 0;
  }
  var raf = 0;
  function redraw() {
    // look B draws every frame by itself unless time is held; then a chapter asks for its own frames
    if (!HELD || raf || !started) return;
    raf = requestAnimationFrame(function () { raf = 0; frame(window.scrollY, lastT); });
  }

  // ------------------------------------------------------------------ start (look B calls this when the page is laid out)
  function start() {
    measure(); started = true;
    var id = qs.get('c');
    if (id) {
      var c = LIST.filter(function (x) { return x.id === id; })[0];
      if (c) window.scrollTo(0, Math.round(c.top + clamp(parseFloat(qs.get('q')) || 0, 0, 1) * travel(c)));
    }
  }
  if (qs.has('c') && 'scrollRestoration' in history) history.scrollRestoration = 'manual';
  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (!started) return;
      measure();
      LIST.forEach(function (c) { if (c.scene) c.scene.resize(); });
      redraw();
    }, 120);
  });
  window.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    ptr.x = clamp(ev.clientX / W * 2 - 1, -1, 1); ptr.y = clamp(ev.clientY / H * 2 - 1, -1, 1);
  }, { passive: true });

  window.TEA = {
    start: start, frame: frame, list: LIST,
    // for tests and pictures: true when nothing near is still loading and the chapter on the screen is whole
    settled: function () {
      if (!started) return false;
      var y = window.scrollY, ok = true;
      LIST.forEach(function (c) {
        if (c.state === 1) ok = false;
        if (!c.over && y >= c.top && y <= c.top + c.h && c.state !== 3 && !(c.state === 2 && c.whole)) ok = false;
      });
      return ok;
    }
  };
})();
