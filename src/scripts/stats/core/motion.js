// Every animation on /stats goes through here, so reduced motion is one switch, read live.
// The easing names are the page's whole vocabulary (DESIGN.md §A.6): std for most things,
// enter for chapter text, out for numbers settling, in for gravity, and overshoot exactly once,
// for the gate's catch pop.
import { num } from './fmt.js';

const hasWindow = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
const mqReduce = hasWindow ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const reducedSubs = new Set();
mqReduce?.addEventListener?.('change', () => {
  for (const fn of [...reducedSubs]) { try { fn(mqReduce.matches); } catch (e) { console.error(e); } }
});

export const motion = {
  get reduced() { return !!mqReduce?.matches; },
  onChange(fn) { reducedSubs.add(fn); return () => reducedSubs.delete(fn); },
  // Save-Data or a 2G link: the decorative extras (the petal) stay home. The data itself
  // (playback timings, replays) still runs, because it is the point.
  get saveData() {
    const c = typeof navigator !== 'undefined' ? navigator.connection : null;
    return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
  },
};

// A cubic-bezier solver, the same curve CSS uses, so a canvas tween and a CSS transition with
// the same name move identically. Newton steps with a bisection fallback.
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return t;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
}

export const EASE = {
  std: cubicBezier(0.4, 0, 0.2, 1),
  enter: cubicBezier(0.2, 0.8, 0.2, 1),
  out: cubicBezier(0, 0, 0.2, 1),
  in: cubicBezier(0.4, 0, 1, 1),
  overshoot: cubicBezier(0.34, 1.56, 0.64, 1),
  linear: (t) => t,
};

export const CSS_EASE = {
  std: 'cubic-bezier(.4,0,.2,1)',
  enter: 'cubic-bezier(.2,.8,.2,1)',
  out: 'cubic-bezier(0,0,.2,1)',
  in: 'cubic-bezier(.4,0,1,1)',
  overshoot: 'cubic-bezier(.34,1.56,.64,1)',
};

const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(() => fn(Date.now()), 16));
const caf = (id) => (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : clearTimeout(id));
const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// A value from `from` to `to` over `dur` ms. Under reduced motion it lands at once, in the same
// call, so a caller never has to write a second code path for the final state.
export function tween({ from = 0, to = 1, dur = 450, ease = EASE.out, delay = 0, onUpdate, onDone } = {}) {
  let id = 0, cancelled = false, timer = 0;
  if (motion.reduced || dur <= 0) {
    onUpdate?.(to);
    onDone?.();
    return { cancel() {} };
  }
  const start = () => {
    const t0 = nowMs();
    const step = () => {
      if (cancelled) return;
      const p = Math.min(1, (nowMs() - t0) / dur);
      onUpdate?.(from + (to - from) * ease(p));
      if (p < 1) id = raf(step);
      else onDone?.();
    };
    id = raf(step);
  };
  if (delay > 0) timer = setTimeout(start, delay); else start();
  return { cancel() { cancelled = true; caf(id); clearTimeout(timer); } };
}

// A number in the DOM that rolls to its new value. It remembers what each element last showed,
// so a range change rolls from the old figure, and it holds tabular digits while moving so the
// line doesn't shimmy.
const shown = new WeakMap();
const running = new WeakMap();
export function tweenNumber(el, to, { from, dur = 450, fmt = num, ease = EASE.out } = {}) {
  if (!el) return { cancel() {} };
  running.get(el)?.cancel();
  const start = from ?? shown.get(el) ?? to;
  shown.set(el, to);
  if (start === to || motion.reduced) {
    el.textContent = fmt(to);
    el.classList?.remove('st-tab');
    return { cancel() {} };
  }
  el.classList?.add('st-tab');
  const t = tween({
    from: start, to, dur, ease,
    onUpdate: (v) => { el.textContent = fmt(v); },
    onDone: () => { el.textContent = fmt(to); el.classList?.remove('st-tab'); running.delete(el); },
  });
  running.set(el, t);
  return t;
}

// One requestAnimationFrame loop per caller. It sleeps while the tab is hidden (the loop simply
// isn't rescheduled) and wakes when it comes back, and it stops for good when step returns false.
export function frameLoop(step) {
  let id = 0, on = false, last = 0, parked = false;
  const tick = (now) => {
    if (!on) return;
    if (typeof document !== 'undefined' && document.hidden) { parked = true; id = 0; return; }
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    let keep = false;
    try { keep = step(dt, now) !== false; } catch (e) { console.error('[stats] frame step failed', e); keep = false; }
    if (keep) id = raf(tick);
    else { on = false; id = 0; }
  };
  const wake = () => {
    if (parked && on && typeof document !== 'undefined' && !document.hidden) { parked = false; last = 0; id = raf(tick); }
  };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', wake);
  return {
    start() { if (on) return; on = true; parked = false; last = 0; id = raf(tick); },
    stop() { on = false; parked = false; if (id) caf(id); id = 0; },
    get running() { return on; },
  };
}

// Chapter text arriving: a short rise and fade with the Web Animations API. Resolves at once
// under reduced motion, and leaves no inline style behind either way.
export function enter(el, { y = 12, dur = 420, delay = 0 } = {}) {
  if (!el || motion.reduced || typeof el.animate !== 'function') return Promise.resolve();
  const a = el.animate(
    [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }],
    { duration: dur, delay, easing: CSS_EASE.enter, fill: 'backwards' },
  );
  return a.finished.then(() => {}, () => {});
}

// "Here it is": two gold rings around an element a route just landed on. Reduced motion gets a
// still outline for a moment instead.
export function pulse(el) {
  if (!el) return;
  if (motion.reduced || typeof el.animate !== 'function') {
    const prev = el.style.outline;
    el.style.outline = '2px solid var(--pc-head)';
    el.style.outlineOffset = '4px';
    setTimeout(() => { el.style.outline = prev; el.style.outlineOffset = ''; }, 1500);
    return;
  }
  el.animate(
    [
      { boxShadow: '0 0 0 0 rgba(0,0,0,0), 0 0 0 0 var(--pc-head)' },
      { boxShadow: '0 0 0 0 rgba(0,0,0,0), 0 0 0 3px var(--pc-head)', offset: 0.35 },
      { boxShadow: '0 0 0 0 rgba(0,0,0,0), 0 0 0 10px transparent' },
    ],
    { duration: 450, iterations: 2, easing: CSS_EASE.out },
  );
}
