/* The chapter's own small script: it reads the scroll, decides when the game's files are worth fetching, and asks
   the scene for one frame at a time.
   ?y=0.5 puts the page at that fraction of its scroll; ?still=1 holds the time and centres the pointer, so the same
   address always shows the same picture. ?debug=1 shows the frame rate and what is being drawn. */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1';
  var DEBUG = qs.get('debug') === '1';
  var FIXED = qs.get('full') === '1';      // ?full=1: always every pixel, however slow the machine (for measuring)
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FROZEN = STILL || RM;
  var T_HELD = qs.has("t") ? parseFloat(qs.get("t")) : 9.0;
  var FORCE = null;                       // ?pose=heavy:0.25 holds both fighters in that move, that far in (a look at a move)
  if (qs.has('pose')) { var pp = qs.get('pose').split(':'); FORCE = { name: pp[0], t: parseFloat(pp[1]) || 0 }; }

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var chapter = $('chapter'), stage = $('stage'), canvas = $('scene'), card = $('card'), hint = $('hint'), dbg = $('debug');
  var clouds = $('lead-clouds');
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  if (RM) root.classList.add('rm');
  if (STILL) root.classList.add('is-still');
  if (DEBUG) dbg.hidden = false;

  // ------------------------------------------------------------------ where the reader is
  // enter: the chapter's top coming up the screen. pin: the travel while the screen is held. q joins the two.
  function measure() {
    var r = chapter.getBoundingClientRect();
    var vh = window.innerHeight;
    var enter = clamp((vh - r.top) / vh);
    var travel = Math.max(1, r.height - stage.offsetHeight);
    var pin = clamp(-r.top / travel);
    var q = RM ? 0.8 : enter * 0.1 + pin * 0.9;
    return { q: q, pin: RM ? 1 : pin, onScreen: r.bottom > 0 && r.top < vh };
  }

  // ------------------------------------------------------------------ ?y
  if (qs.has('y')) {
    try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
    var wantY = clamp(parseFloat(qs.get('y')) || 0);
    var jump = function () { window.scrollTo(0, wantY * (root.scrollHeight - window.innerHeight)); };
    jump();
    window.addEventListener('load', jump);
  }

  // ------------------------------------------------------------------ the pointer, a tilted phone, or a slow drift
  var aim = { x: 0, y: 0 }, at = { x: 0, y: 0 }, hasMouse = false, tilt = null, tilt0 = null;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    hasMouse = true;
    var r = stage.getBoundingClientRect();
    aim.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
    aim.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
    kick();
  }, { passive: true });
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma === null || e.beta === null) return;
    if (!tilt0) tilt0 = { g: e.gamma, b: e.beta };
    tilt = { x: clamp((e.gamma - tilt0.g) / 22, -1, 1), y: clamp((e.beta - tilt0.b) / 26, -1, 1) };
  }, { passive: true });

  // a click or a tap on a fighter makes it throw a move
  function pointAt(e) {
    var r = stage.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 2 - 1, y: -((e.clientY - r.top) / r.height * 2 - 1) };
  }
  canvas.addEventListener('click', function (e) {
    if (!api || FROZEN) return;
    var p = pointAt(e), who = api.pick(p.x, p.y);
    if (who) { api.tap(who, now()); tapped = true; kick(); }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!api || FROZEN || e.pointerType !== 'mouse') return;
    var p = pointAt(e);
    canvas.style.cursor = api.pick(p.x, p.y) ? 'pointer' : '';
  }, { passive: true });

  // ------------------------------------------------------------------ the scene: fetched when the chapter is near
  var api = null, loading = false, failed = false, visible = false, raf = 0, t0 = performance.now(), last = 0;
  var fps = { n: 0, since: 0, value: 0, worst: 0 };

  function load() {
    if (loading) return;
    loading = true;
    var plate = $('plate');
    if (plate) plate.src = plate.getAttribute('data-src');
    import('./scene.js').then(function (m) { return m.mount(canvas, {}); }).then(function (a) {
      api = a;
      window.__sb = a;
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stage.classList.remove('is-live'); api = null; });
      kick();
    }).catch(function (err) {
      failed = true;
      root.dataset.sb = 'still';
      if (DEBUG) dbg.textContent = String(err && err.stack || err);
      ready();
      if (window.console) console.warn('The backdrop could not start: ' + (err && err.message || err));
    });
  }

  function ready() { root.dataset.ready = '1'; }
  function now() { return FROZEN ? T_HELD : (performance.now() - t0) / 1000; }
  var wasClose = null, tapped = false;

  function draw(now) {
    raf = 0;
    var m = measure();
    place(m);
    if (!api || !(visible || m.onScreen) || document.hidden) return;
    var dt = Math.min(0.1, (now - last) / 1000 || 0.016);
    last = now;
    var t = FROZEN ? T_HELD : (now - t0) / 1000;
    // arriving at the close view sets off a strike and a flourish; a page opened already there does not
    var close = m.q > 0.6;
    if (wasClose === false && close && !FROZEN) api.arrive(t);
    wasClose = close;
    if (STILL || RM) { at.x = 0; at.y = 0; } else {
      var tx = aim.x, ty = aim.y;
      if (!hasMouse) {
        // no mouse: the phone's tilt if it reports one, and always a slow drift that the scroll leans on
        tx = Math.sin(t * 0.21) * 0.35 + (m.q - 0.5) * 0.5 + (tilt ? tilt.x * 0.8 : 0);
        ty = Math.sin(t * 0.17 + 1.3) * 0.2 + (tilt ? tilt.y * 0.6 : 0);
      }
      var k = 1 - Math.exp(-dt * 4);
      at.x += (clamp(tx, -1, 1) - at.x) * k; at.y += (clamp(ty, -1, 1) - at.y) * k;
    }
    if (!FROZEN && !FIXED) api.pace(dt * 1000);
    api.frame(m.q, t, at.x, at.y, FORCE);
    if (!stage.classList.contains('is-live')) { stage.classList.add('is-live'); ready(); }
    if (DEBUG) meter(now, dt);
    if (!FROZEN) raf = requestAnimationFrame(draw);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  function meter(now, dt) {
    fps.n++; fps.worst = Math.max(fps.worst, dt);
    if (now - fps.since > 1000) {
      fps.value = fps.n * 1000 / (now - fps.since); fps.n = 0; fps.since = now;
      var s = api.stats, b = api.bufferSize();
      dbg.textContent = fps.value.toFixed(1) + ' frames a second (slowest ' + (fps.worst * 1000).toFixed(0) + ' ms)\n' + s.calls + ' draw calls, ' + s.triangles + ' triangles\n' + b.x + ' x ' + b.y + ' pixels';
      window.__sbFps = { fps: fps.value, calls: s.calls, triangles: s.triangles, w: b.x, h: b.y };
      fps.worst = 0;
    }
  }

  // ------------------------------------------------------------------ what the scroll places besides the picture
  // before the scene is up the reader sees a still of it: the opening view on the way in, the close view further down
  var posterOpen = $('poster-open'), posterHold = $('poster'), openSet = false;
  function poster(m) {
    if (stage.classList.contains('is-live')) return;
    var open = !RM && m.q < 0.42;
    if (open && !openSet && (loading || m.onScreen)) {
      openSet = true;
      var src = posterOpen.parentNode.querySelector('source');
      src.srcset = src.getAttribute('data-srcset'); posterOpen.src = posterOpen.getAttribute('data-src');
    }
    posterOpen.hidden = !(open && openSet);
  }
  function place(m) {
    poster(m);
    // the card comes up once the camera has arrived, and stays
    var show = RM ? 1 : ss(0.56, 0.68, m.q);
    card.style.opacity = show.toFixed(3);
    card.style.visibility = show > 0.01 ? 'visible' : 'hidden';
    card.style.transform = 'translate3d(0,' + ((1 - show) * 26).toFixed(1) + 'px,0)';
    card.style.pointerEvents = show > 0.6 ? 'auto' : 'none';
    hint.style.opacity = (api && !FROZEN ? show * (tapped ? 0 : 1) : 0).toFixed(3);
    if (clouds && !RM) {
      var y = window.scrollY || 0;
      clouds.style.transform = 'translate3d(calc(-50% + ' + (-y * 0.06).toFixed(1) + 'px),' + (y * 0.18).toFixed(1) + 'px,0)';
    }
  }

  var near = new IntersectionObserver(function (es) {
    for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { near.disconnect(); load(); return; }
  }, { rootMargin: '15% 0px 15% 0px' });
  near.observe(chapter);
  new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; if (visible) { last = performance.now(); kick(); } }).observe(stage);

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = performance.now(); kick(); } });
  window.addEventListener('load', function () {
    kick();
    // a place on the page that is far from the chapter never fetches the game: the page is ready as it stands
    setTimeout(function () { if (!loading) ready(); }, 300);
  });
  place(measure());
})();
