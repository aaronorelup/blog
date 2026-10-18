// Visibility, measured against the right box. This page scrolls inside #panel-scroll, not the
// window, so every IntersectionObserver here is rooted there; one rooted at the viewport would
// still fire, but at the wrong moments.

export const scrollRoot = () => document.getElementById('panel-scroll');

const hasIO = () => typeof IntersectionObserver === 'function';

// Once, when el comes within `margin` of the visible area: used to import a chapter before the
// reader reaches it.
export function onNear(el, fn, margin = '150% 0px') {
  if (!el) return () => {};
  if (!hasIO()) { fn(); return () => {}; }
  let done = false;
  const io = new IntersectionObserver((entries) => {
    if (done) return;
    if (entries.some((e) => e.isIntersecting)) { done = true; io.disconnect(); fn(); }
  }, { root: scrollRoot(), rootMargin: margin });
  io.observe(el);
  return () => { done = true; io.disconnect(); };
}

// When a share of el is visible (25% by default): chapter entrances, the gate's first replay.
export function onEnter(el, fn, { threshold = 0.25, once = true } = {}) {
  if (!el) return () => {};
  if (!hasIO()) { fn(); return () => {}; }
  let stopped = false;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (stopped || !e.isIntersecting || e.intersectionRatio < threshold - 0.001) continue;
      if (once) { stopped = true; io.disconnect(); }
      fn(e);
    }
  }, { root: scrollRoot(), threshold: [threshold] });
  io.observe(el);
  return () => { stopped = true; io.disconnect(); };
}

// On and off screen, for pausing loops nobody can see.
export function watchVisible(el, fn, threshold = 0) {
  if (!el) return () => {};
  if (!hasIO()) { fn(true); return () => {}; }
  let last = null;
  const io = new IntersectionObserver((entries) => {
    const e = entries[entries.length - 1];
    const v = e.isIntersecting && e.intersectionRatio >= threshold;
    if (v !== last) { last = v; fn(v); }
  }, { root: scrollRoot(), threshold: [threshold] });
  io.observe(el);
  return () => io.disconnect();
}
