// The camera's path and how the visitor walks it. WAYPOINTS: one framing per section (a portrait one for tall
// windows), curves through them. One gesture is one stop (wheel, swipe, the arrow, Page, space, Home and End keys,
// the rail's dots); a stop flies there with an overshoot that settles, a refused one gives a short elastic shove,
// and past the last stop the camera leaves through the torii (exit.js). progress(s, ts, dt) is where along the
// path this frame is, and the cards' states with it; place(s, progress) puts the camera there.
import { CatmullRomCurve3, Vector3 } from 'three';
import { cardState, measureCards } from './cards.js';
import { startExit } from './exit.js';
import { syncRail } from './rail.js';

export const WAYPOINTS = [
  { name: 'garden',    pos: [0, 3.1, 19],    target: [0, 2.3, 3],     fov: 46, range: [0.00, 0.15],
    portrait: { pos: [0, 3.4, 21], target: [0, 2.8, 3], fov: 60 } },
  { name: 'threshold', pos: [0.2, 2.0, 8.6], target: [0, 1.7, -1],    fov: 44,  range: [0.185, 0.215],
    portrait: { pos: [0.2, 2.2, 10], target: [0, 1.9, -1], fov: 58 } },
  { name: 'alcove',    pos: [-1.4, 1.85, 2.4], target: [5.82, 1.8, -2.52], fov: 46, range: [0.25, 0.43],
    portrait: { pos: [-1.0, 2.0, 3.0], target: [5.9, 1.85, -1.6], fov: 60 } },
  { name: 'desk',      pos: [-2.43, 2.44, 1.93], target: [-4.76, 1.52, 1.92], fov: 70, range: [0.465, 0.645],
    portrait: { pos: [-2.2, 2.5, 2.0], target: [-4.7, 1.5, 1.95], fov: 78 } },
  { name: 'tea room',  pos: [1.1, 1.6, 1.4], target: [-2.48, 1.35, -4.63], fov: 46, range: [0.68, 0.825],
    portrait: { pos: [1.4, 1.8, 2.4], target: [-3.2, 1.5, -4.6], fov: 60 } },
  { name: 'gate',      pos: [0.6, 1.6, -1.2],target: [0, 2.4, 22],    fov: 48,  range: [0.86, 1.00],
    portrait: { pos: [0.6, 1.8, -1.2], target: [0, 2.6, 22], fov: 62 } },
];
const LAST = WAYPOINTS.length - 1;

export function buildCurves(s) {
  const key = (w) => (s.portrait && w.portrait) ? w.portrait : w;
  const v = (a) => new Vector3(a[0], a[1], a[2]);
  s.posCurve = new CatmullRomCurve3(WAYPOINTS.map(w => v(key(w).pos)), false, 'catmullrom', 0.4);
  s.tgtCurve = new CatmullRomCurve3(WAYPOINTS.map(w => v(key(w).target)), false, 'catmullrom', 0.4);
  s.fovs = WAYPOINTS.map(w => key(w).fov);
  s._p = new Vector3(); s._q = new Vector3();
}

export function place(s, progress) {
  const u = Math.max(0, Math.min(1, progress / LAST));
  s.posCurve.getPoint(u, s._p);
  s.tgtCurve.getPoint(u, s._q);
  s.camera.position.copy(s._p);
  s.camera.lookAt(s._q);
  const i0 = Math.max(0, Math.min(LAST, Math.floor(progress))), i1 = Math.min(LAST, i0 + 1);
  s.camera.fov = s.fovs[i0] + (s.fovs[i1] - s.fovs[i0]) * (progress - i0);
  s.camera.updateProjectionMatrix();
}

// Where along the path this frame is (in waypoints), with each card's state set to match.
export function progress(s, ts, dt) {
  if (s.reduced) {
    // static composed frame per section; the page scrolls normally
    if (!s.cardTops) measureCards(s);
    let best = 0, dist = Infinity;
    for (let i = 0; i < s.cardTops.length; i++) {
      const d = Math.abs(scrollY - s.cardTops[i]);
      if (d < dist) { dist = d; best = i; }
    }
    s.stopIdx = best;
    // cardState short-circuits when nothing changed, so this is free once settled
    s.cards.forEach(c => cardState(c.el, 1, 0, 0));
    return s.cards[best].wp;
  }
  if (s.motion === 'auto') {
    const a = s.auto;
    const p = Math.max(0, Math.min(1, (ts - a.t0) / a.dur));
    const e = bounce(p);
    const wpFrom = s.cards[a.from].wp, wpTo = s.cards[a.to].wp;
    const dir = a.to > a.from ? 1 : -1;
    const f = Math.max(0, Math.min(1, (p - 0.12) / 0.62));
    const g = f * f * (3 - 2 * f);
    cardState(s.cards[a.from].el, 1 - g, -dir * g * 64, g * 0.05);
    cardState(s.cards[a.to].el, g, dir * (1 - g) * 64, (1 - g) * 0.05);
    if (p >= 1) { s.motion = 'idle'; s.auto = null; }
    return wpFrom + (wpTo - wpFrom) * e;
  }
  const n = s.nudge;
  s.cards.forEach((c, i) => i === s.stopIdx
    ? cardState(c.el, 1 - Math.abs(n) * 0.12, -n * 12, Math.abs(n) * 0.012)
    : cardState(c.el, 0, 0, 0));
  if (n) s.nudge = Math.abs(n) < 0.004 ? 0 : n * Math.pow(0.86, dt * 60);
  return s.cards[s.stopIdx].wp + n * 0.06;
}

// overshoot-and-settle: the view springs past its mark, then eases back
const bounce = (x) => { const c1 = 1.15, c3 = c1 + 1, u = x - 1; return 1 + c3 * u * u * u + c1 * u * u; };

export function goTo(s, to) {
  if (s.motion === 'auto' || to === s.stopIdx || !s.cards[to]) return;
  const from = s.stopIdx;
  const dWp = Math.abs(s.cards[to].wp - s.cards[from].wp);
  s.auto = { from, to, t0: performance.now(), dur: 620 + 280 * dWp };
  s.motion = 'auto';
  s.stopIdx = to;
  syncRail(s);
}

function step(s, dir) {
  const to = s.stopIdx + dir;
  if (to >= s.cards.length) { startExit(s); return; }   // scroll past the last card: leave
  if (to < 0) { bump(s, dir); return; }
  s.locked = true;
  goTo(s, to);
}

// refused input still answers: a short elastic shove in the direction you pushed
const bump = (s, dir) => { s.nudge = Math.max(-1, Math.min(1, s.nudge + dir * 0.5)); };

export function bindInput(s) {
  if (s.panelUp || s.onWheel) return;   // the overlay's panel is over the scene (panelState), or bound
  const gate = (dir) => {
    const now = performance.now();
    const streaming = now - (s.lastInputAt || 0) < 170;
    s.lastInputAt = now;
    if (s.motion === 'exit') return;
    if (s.motion === 'auto' || (s.locked && streaming)) { bump(s, dir); return; }
    s.locked = false;
    step(s, dir);
  };
  s.onWheel = (e) => {
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (Math.abs(dy) < 2) return;
    gate(dy > 0 ? 1 : -1);
  };
  s.onKey = (e) => {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); gate(1); }
    else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); gate(-1); }
    else if (k === 'Home') { e.preventDefault(); goTo(s, 0); }
    else if (k === 'End') { e.preventDefault(); goTo(s, s.cards.length - 1); }
  };
  s.onTouchStart = (e) => { s.touchY = e.touches[0].clientY; };
  s.onTouchMove = (e) => { e.preventDefault(); };
  s.onTouchEnd = (e) => {
    if (s.touchY == null) return;
    const dy = s.touchY - (e.changedTouches[0] ? e.changedTouches[0].clientY : s.touchY);
    s.touchY = null;
    if (Math.abs(dy) > 34) gate(dy > 0 ? 1 : -1);
  };
  s.onRail = (e) => {
    const b = e.target.closest('[data-goto]');
    if (b) goTo(s, +b.dataset.goto);
  };
  addEventListener('wheel', s.onWheel, { passive: false });
  addEventListener('keydown', s.onKey);
  addEventListener('touchstart', s.onTouchStart, { passive: true });
  addEventListener('touchmove', s.onTouchMove, { passive: false });
  addEventListener('touchend', s.onTouchEnd);
  s.rail.addEventListener('click', s.onRail);
}

export function unbindInput(s) {
  if (!s.onWheel) return;
  removeEventListener('wheel', s.onWheel);
  removeEventListener('keydown', s.onKey);
  removeEventListener('touchstart', s.onTouchStart);
  removeEventListener('touchmove', s.onTouchMove);
  removeEventListener('touchend', s.onTouchEnd);
  s.rail.removeEventListener('click', s.onRail);
  s.onWheel = null;                    // cleared so bindInput() can re-arm on return
}
