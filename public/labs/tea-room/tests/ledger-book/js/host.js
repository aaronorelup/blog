// The test page round the chapter: it maps the page's scroll to the chapter's progress q, keeps the time, fetches
// the scene when the chapter is near, and asks it for one frame at a time.
//   ?y=0.4      puts the chapter at that progress (0 to 1)
//   ?still=1    holds the time: the same address always shows the same picture
//   ?t=12       holds the time at that second but leaves the scroll alive
//   ?rm=1       as if the reader had asked for less motion
//   ?debug=1    frame rate and what is drawn
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var STILL = qs.get('still') === '1', DEBUG = qs.get('debug') === '1';
  var RM = qs.get('rm') === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD = qs.has('t') ? parseFloat(qs.get('t')) : NaN;
  var T_HELD = 7.3;
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var chapter = $('chapter'), track = $('track'), stage = $('stage'), hint = $('hint'), dbg = $('debug'), plain = $('plain');
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  if (RM) root.classList.add('rm');
  if (DEBUG && dbg) dbg.hidden = false;

  // the chapter's progress: how far the track has gone past the top of the window
  function travel() { return Math.max(1, track.offsetHeight - stage.offsetHeight); }
  function progress() { return clamp(-track.getBoundingClientRect().top / travel()); }
  function goTo(q, smooth) {
    var y = track.getBoundingClientRect().top + window.scrollY + clamp(q) * travel();
    window.scrollTo({ top: y, behavior: smooth && !RM && !STILL ? 'smooth' : 'auto' });
  }
  if (qs.has('y')) {
    try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
    var wantY = clamp(parseFloat(qs.get('y')) || 0);
    goTo(wantY);
    window.addEventListener('load', function () { goTo(wantY); });
  }

  var api = null, loading = false, onScreen = false, raf = 0, t0 = performance.now(), drawn = '';
  var fps = { n: 0, since: 0, value: 0 };
  function now() { return STILL || RM ? T_HELD : HOLD === HOLD ? HOLD : (performance.now() - t0) / 1000; }

  function load() {
    if (loading) return;
    loading = true;
    import('./scene.js').then(function (m) {
      api = m.mount(stage, { reducedMotion: RM, onSeek: function (q) { goTo(q, true); } });
      window.__ledgerBook = api;
      if (plain) plain.remove();                       // the book carries the same words now
      root.classList.add('live');
      var settle = function () { api.resize(); drawn = ''; kick(); root.dataset.ready = '1'; };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(settle, settle);
      kick();
    }).catch(function (err) {
      root.classList.add('flat');
      root.dataset.ready = '1';
      if (window.console) console.warn('The book could not be drawn: ' + (err && err.message || err));
    });
  }

  function draw(ts) {
    raf = 0;
    if (!api || document.hidden) return;
    var q = progress(), t = now();
    if (hint) hint.style.opacity = q > 0.012 ? '0' : '';
    api.setActive(onScreen);
    if (!onScreen) return;
    // with the time held, the same place and the same size are the same picture: it is not drawn twice
    var key = q.toFixed(5) + ':' + stage.offsetWidth + 'x' + stage.offsetHeight;
    if (!(STILL || RM) || key !== drawn) { api.frame(q, t); drawn = key; }
    if (DEBUG && dbg) {
      fps.n++;
      if (ts - fps.since > 500) { fps.value = fps.n * 1000 / (ts - fps.since); fps.n = 0; fps.since = ts; }
      var i = api.info();
      dbg.textContent = 'q ' + q.toFixed(3) + '  ' + fps.value.toFixed(0) + ' fps  ' + i.calls + ' calls  ' + i.triangles + ' tris  ' + (i.tall ? 'tall' : 'wide');
    }
    if (!(STILL || RM)) kick();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(draw); }

  // nothing heavy is fetched until the chapter is within a screen and a half
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '150% 0px' }).observe(chapter);
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; kick(); }).observe(stage);
  } else { onScreen = true; load(); }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { if (api) api.resize(); drawn = ''; kick(); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { if (api) api.resize(); drawn = ''; kick(); }).observe(stage);
  document.addEventListener('visibilitychange', kick);
})();
