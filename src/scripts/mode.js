// Day and night on the panel pages. Head.astro's inline script has set data-mode before first paint; this binds the
// one toggle (chrome/ModeToggle.astro), stores the choice where the homepage reads it too, and keeps aria-pressed
// true at night. The homepage's toggle is still home-scene.js's until T3.2.
const KEY = 'scene-mode';
const root = document.documentElement;
const toggle = document.getElementById('mode-toggle');
const night = () => root.dataset.mode !== 'day';
const paint = () => toggle.setAttribute('aria-pressed', String(night()));

toggle.addEventListener('click', () => {
  if (night()) root.dataset.mode = 'day';
  else delete root.dataset.mode;
  // Blocked storage throws; the switch still works for this page.
  try { localStorage.setItem(KEY, night() ? 'night' : 'day'); } catch {}
  paint();
});
paint();
