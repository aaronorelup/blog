// The homepage's day and night. The switch (scripts/mode.js) asks for a mode with an ao-mode event; here the room
// tweens to it over 2.6 s instead of snapping: --mix runs from 0 (day) to 1 (night) on :root, html[data-tweening]
// makes the --pc-* and --home-* tokens follow it (tokens.css), and data-mode flips halfway, for Shiki's code colours,
// which can't tween. onMix(fn) lets the scene's 3D follow each frame. Once it ends the plain per-mode tokens hold.
const root = document.documentElement;
const DUR = 2600;
const listeners = new Set();
let mix = root.dataset.mode === 'day' ? 0 : 1;
let wanted = mix;
let raf = 0;

export const mixNow = () => mix;
export const wantsNight = () => wanted === 1;

// fn(mix) now and on every change; returns the unsubscribe.
export function onMix(fn) {
  listeners.add(fn);
  fn(mix);
  return () => listeners.delete(fn);
}

function set(m) {
  mix = m;
  root.style.setProperty('--mix', String(m));
  if (m < 0.5) root.dataset.mode = 'day';
  else delete root.dataset.mode;
  listeners.forEach((fn) => fn(m));
}

// sunset / sunrise in fast-forward: no rebuild, no veil — the world just changes time
function tween(to) {
  const from = mix, t0 = performance.now();
  cancelAnimationFrame(raf);
  root.dataset.tweening = '';
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / DUR);
    set(from + (to - from) * (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2));   // ease in-out
    if (p < 1) { raf = requestAnimationFrame(step); return; }
    root.style.removeProperty('--mix');
    delete root.dataset.tweening;
  };
  step();
}

addEventListener('ao-mode', (e) => {
  e.preventDefault();
  wanted = e.detail === 'night' ? 1 : 0;
  tween(wanted);
});
