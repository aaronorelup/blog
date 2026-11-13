/* The host page: it reads the scroll and the pointer, fetches the scene when the chapter is near, and asks it for one
   frame at a time. The scene itself (scene.js) knows nothing of the page.
   ?y=0.5 puts the page at that fraction of its scroll; ?still=1 holds the time and the lamp, so the same address
   always shows the same picture. ?debug=1 shows the frame rate and what is drawn. */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1';
  var DEBUG = qs.get('debug') === '1';
  var FIXED = qs.get('full') === '1';      // ?full=1: always every pixel, however slow the machine (for measuring)
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FROZEN = STILL || RM;
  var T_HELD = qs.has('t') ? parseFloat(qs.get('t')) : 6.0;
  var HELD_AIM = { x: -0.04, y: 0.08 };    // a held picture has the lamp on the drowned man
  if (qs.has('ax')) HELD_AIM.x = parseFloat(qs.get('ax')) || 0;  // ?ax=&ay=: hold the lamp somewhere else (for looking)
  if (qs.has('ay')) HELD_AIM.y = parseFloat(qs.get('ay')) || 0;

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var chapter = $('chapter'), stage = $('stage'), host = $('host'), card = $('card'), hint = $('hint'), dbg = $('debug'), veil = $('veil');
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  var Q_FORCE = qs.has('q') ? clamp(parseFloat(qs.get('q')) || 0) : null; // ?q=0.3: that place in the dive, wherever the page is (for looking)

  if (RM) root.classList.add('rm');
  if (STILL) root.classList.add('is-still');
  if (DEBUG) dbg.hidden = false;

  // ------------------------------------------------------------------ where the reader is
  function measure() {
    var r = chapter.getBoundingClientRect();
    var vh = window.innerHeight;
    var enter = clamp((vh - r.top) / vh);
    var travel = Math.max(1, r.height - stage.offsetHeight);
    var pin = clamp(-r.top / travel);
    var q = RM ? 0.9 : enter * 0.08 + pin * 0.92;
    if (Q_FORCE !== null) q = Q_FORCE;
    var leave = clamp((vh - r.bottom) / vh);
    return { q: q, leave: leave, onScreen: r.bottom > 1 && r.top < vh - 1 };
  }

  // ------------------------------------------------------------------ ?y
  if (qs.has('y')) {
    try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
    var wantY = clamp(parseFloat(qs.get('y')) || 0);
    var jump = function () { window.scrollTo(0, wantY * (root.scrollHeight - window.innerHeight)); };
    jump();
    window.addEventListener('load', jump);
  }

  // ------------------------------------------------------------------ the lamp: the mouse, a tap, a tilted phone, or a slow sweep
  var aim = { x: 0, y: 0 }, at = { x: HELD_AIM.x, y: HELD_AIM.y }, hasMouse = false, tapped = null, tilt = null, tilt0 = null, moved = false;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    hasMouse = true; moved = true;
    var r = stage.getBoundingClientRect();
    aim.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
    aim.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
    kick();
  }, { passive: true });
  // a tap on the water points the lamp there (a touch screen has no mouse to follow)
  stage.addEventListener('pointerup', function (e) {
    if (e.pointerType === 'mouse' || e.target.closest('a')) return;
    var r = stage.getBoundingClientRect();
    tapped = { x: clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1), y: clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1) };
    moved = true;
    kick();
  });
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma === null || e.beta === null) return;
    if (!tilt0) tilt0 = { g: e.gamma, b: e.beta };
    tilt = { x: clamp((e.gamma - tilt0.g) / 20, -1, 1), y: clamp((e.beta - tilt0.b) / 24, -1, 1) };
  }, { passive: true });

  // ------------------------------------------------------------------ the scene: fetched when the chapter is near
  var api = null, loading = false, raf = 0, t0 = performance.now(), last = 0, visible = false, drawn = null;
  var fps = { n: 0, since: 0, value: 0, worst: 0 };

  function load() {
    if (loading) return;
    loading = true;
    import('./scene.js').then(function (m) { return m.mount(host, {}); }).then(function (a) {
      api = a;
      window.__bw = a;
      a.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stage.classList.remove('is-live'); api = null; });
      kick();
    }).catch(function (err) {
      root.dataset.bw = 'still';
      if (DEBUG) dbg.textContent = String(err && err.stack || err);
      ready();
      if (window.console) console.warn('The cave could not start: ' + (err && err.message || err));
    });
  }
  function ready() { root.dataset.ready = '1'; }

  function draw(now) {
    raf = 0;
    var m = measure();
    place(m);
    var first = !!api && !stage.classList.contains('is-live');
    if (!api || document.hidden || !(m.onScreen || first)) { if (api) api.setActive(false); return; }
    api.setActive(true);
    var dt = Math.min(0.1, (now - last) / 1000 || 0.016);
    last = now;
    var t = FROZEN ? T_HELD : (now - t0) / 1000;
    if (FROZEN) { at.x = HELD_AIM.x; at.y = HELD_AIM.y; } else {
      var tx, ty;
      if (hasMouse) { tx = aim.x; ty = aim.y; }
      else if (tapped) { tx = tapped.x + (tilt ? tilt.x * 0.6 : 0); ty = tapped.y + (tilt ? tilt.y * 0.5 : 0); }
      else {
        // nothing to follow: the lamp sweeps the cave slowly by itself, and the scroll leans on it
        tx = Math.sin(t * 0.33) * 0.35 - 0.05 + Math.sin(m.q * 9.0) * 0.2 + (tilt ? tilt.x * 0.8 : 0);
        ty = Math.sin(t * 0.23 + 1.1) * 0.15 + 0.05 + Math.cos(m.q * 7.0) * 0.08 + (tilt ? tilt.y * 0.6 : 0);
      }
      var k = 1 - Math.exp(-dt * 5);
      at.x += (clamp(tx, -1, 1) - at.x) * k; at.y += (clamp(ty, -1, 1) - at.y) * k;
    }
    var key = FROZEN ? m.q.toFixed(5) + ':' + Math.round(stage.getBoundingClientRect().top) + ':' + stage.offsetWidth + 'x' + stage.offsetHeight : '';
    if (FROZEN && key === drawn) return;
    drawn = key;
    var t1 = performance.now();
    // while the chapter comes up into the screen only its top part shows: the picture is centred on that part
    var sr = stage.getBoundingClientRect(), vh = window.innerHeight;
    var shift = sr.top > 0 ? ((Math.max(0, -sr.top) + Math.min(sr.height, vh - sr.top)) / 2 - sr.height / 2) : 0;
    api.frame(m.q, t, at, shift);
    if (!FROZEN && !FIXED) api.pace(performance.now() - t1 + (dt * 1000 > 50 ? dt * 1000 : 0));
    if (!stage.classList.contains('is-live')) { stage.classList.add('is-live'); ready(); }
    if (DEBUG) meter(now, dt);
    if (!FROZEN) raf = requestAnimationFrame(draw);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  function meter(now, dt) {
    fps.n++; fps.worst = Math.max(fps.worst, dt);
    if (now - fps.since > 1000) {
      fps.value = fps.n * 1000 / (now - fps.since); fps.n = 0; fps.since = now;
      var s = api.stats();
      dbg.textContent = fps.value.toFixed(1) + ' frames a second (slowest ' + (fps.worst * 1000).toFixed(0) + ' ms)\n' + s.calls + ' draw calls, ' + s.triangles + ' triangles\ncave: ' + s.caveTris + ' triangles, built in ' + s.buildMs + ' ms\n' + s.w + ' x ' + s.h + ' pixels';
      window.__bwFps = { fps: fps.value, calls: s.calls, triangles: s.triangles, w: s.w, h: s.h };
      fps.worst = 0;
    }
  }

  // ------------------------------------------------------------------ what the scroll places besides the picture
  function place(m) {
    var show = RM ? 1 : ss(0.74, 0.84, m.q);
    card.style.opacity = show.toFixed(3);
    card.style.visibility = show > 0.01 ? 'visible' : 'hidden';
    var arrived = show > 0.999;
    card.style.transform = arrived ? 'none' : 'translate3d(0,' + ((1 - show) * 26).toFixed(1) + 'px,0)';
    card.style.willChange = arrived ? 'auto' : 'transform, opacity';
    card.style.pointerEvents = show > 0.6 ? 'auto' : 'none';
    veil.style.opacity = ss(0, 0.22, m.leave).toFixed(3);
    hint.style.opacity = (api && !FROZEN ? ss(0.3, 0.4, m.q) * (moved ? 0 : 1) : 0).toFixed(3);
  }

  var near = new IntersectionObserver(function (es) {
    for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { near.disconnect(); load(); return; }
  }, { rootMargin: '50% 0px 50% 0px' });
  near.observe(chapter);
  new IntersectionObserver(function (es) {
    visible = es[es.length - 1].isIntersecting;
    if (visible) { last = performance.now(); kick(); } else if (api) api.setActive(false);
  }).observe(stage);

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { if (api) api.resize(); drawn = null; kick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = performance.now(); kick(); } });
  window.addEventListener('load', function () {
    kick();
    setTimeout(function () { if (!loading) ready(); }, 300);
  });
  place(measure());
})();
