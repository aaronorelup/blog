// The test page round the three chapters: it maps the page's scroll to q, fetches the scene when it is near, and asks
// it for a frame whenever the scroll moves. Each chapter is a third of q. Inside one, 0..0.7 runs while its card
// passes (from the chapter's top at the top of the screen until the card's foot is halfway up the screen) and
// 0.7..1 while the scene stands alone after it (until the next chapter's top, or the end of the page).
//   ?y=0.4      puts the page at that q (0 to 1)
//   ?still=1    holds the time (nothing here plays, so this only stops the page drawing on its own)
//   ?rm=1       as if the reader had asked for less motion
//   ?debug=1    q and the frame rate
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var DEBUG = qs.get('debug') === '1';
  var RM = qs.get('rm') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var stage = document.getElementById('stage'), dbg = document.getElementById('debug');
  var chaps = ['courses', 'now', 'about'].map(function (id) {
    var s = document.getElementById(id);
    return { s: s, card: s.querySelector('[data-mark="card"]'), a: 0, b: 0, c: 1 };
  });
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  if (RM) root.classList.add('rm');
  if (DEBUG && dbg) dbg.hidden = false;

  // where each chapter's marks stand, in page pixels of scroll
  function measure() {
    var H = window.innerHeight, sy = window.scrollY, end = document.documentElement.scrollHeight - H;
    chaps.forEach(function (c, i) {
      var r = c.s.getBoundingClientRect(), k = c.card.getBoundingClientRect();
      c.a = r.top + sy;
      c.b = Math.max(c.a + 1, k.bottom + sy - H * 0.5);
      c.c = i < chaps.length - 1 ? chaps[i + 1].s.getBoundingClientRect().top + sy : end;
      c.c = Math.max(c.b + 1, c.c);
    });
    root.classList.toggle('tall', window.innerWidth / H < 0.9);
  }
  function progress() {
    var y = window.scrollY, q = 0;
    for (var i = 0; i < chaps.length; i++) {
      var c = chaps[i];
      if (y < c.a) break;
      var u = y < c.b ? 0.7 * (y - c.a) / (c.b - c.a) : 0.7 + 0.3 * clamp((y - c.b) / (c.c - c.b));
      q = (i + clamp(u)) / chaps.length;
    }
    return clamp(q);
  }
  function scrollFor(q) {
    var n = chaps.length, i = Math.min(n - 1, Math.floor(q * n)), u = q * n - i, c = chaps[i];
    return u < 0.7 ? c.a + (u / 0.7) * (c.b - c.a) : c.b + ((u - 0.7) / 0.3) * (c.c - c.b);
  }

  measure();
  if (qs.has('y')) {
    try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
    var wantY = clamp(parseFloat(qs.get('y')) || 0);
    var goTo = function () { measure(); window.scrollTo(0, scrollFor(wantY)); };
    goTo();
    window.addEventListener('load', goTo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(goTo);
  }

  var api = null, loading = false, raf = 0, last = '', whole = false;
  var fps = { n: 0, since: 0, value: 0 };

  function load() {
    if (loading) return;
    loading = true;
    import('./scene.js').then(function (m) {
      api = m.mount(stage, { reduced: RM });
      window.__ending = api;
      root.classList.add('live');
      api.setActive(true);
      kick();
    }).catch(function (err) {
      root.dataset.ready = '1';
      if (window.console) console.warn('The scene could not be drawn: ' + (err && err.message || err));
    });
  }

  function draw(ts) {
    raf = 0;
    if (!api || document.hidden) return;
    var q = progress();
    var key = q.toFixed(5) + ':' + window.innerWidth + 'x' + window.innerHeight;
    if (key !== last || !whole) {
      whole = api.frame(q, 0, null);
      last = key;
      if (whole) root.dataset.ready = '1'; else kick();
      root.dataset.q = q.toFixed(4);
    }
    if (DEBUG && dbg) {
      fps.n++;
      if (ts - fps.since > 500) { fps.value = fps.n * 1000 / (ts - fps.since); fps.n = 0; fps.since = ts; }
      dbg.textContent = 'q ' + q.toFixed(3) + '  ' + fps.value.toFixed(0) + ' fps';
      kick();
    }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  // the scene is fetched when the chapters are within a screen and a half
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '150% 0px' }).observe(document.querySelector('main'));
  } else load();
  window.addEventListener('scroll', kick, { passive: true });
  function remeasure() { measure(); if (api) api.resize(); last = ''; kick(); }
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.querySelector('main'));
  document.addEventListener('visibilitychange', function () { if (api) api.setActive(!document.hidden); kick(); });
})();
