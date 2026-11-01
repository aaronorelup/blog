// Day and night, on every page. Head.astro's inline script has set data-mode before first paint; this binds the one
// switch (chrome/ModeToggle.astro), stores the choice where every page reads it, and keeps aria-pressed true while
// night is the mode asked for. A click dispatches ao-mode ('day' or 'night'): a page that takes it over (the
// homepage, home/theme.js, tweens the room to it) cancels it; otherwise data-mode flips at once.
const KEY = 'scene-mode';
const root = document.documentElement;
const toggle = document.getElementById('mode-toggle');
let night = root.dataset.mode !== 'day';
const paint = () => toggle.setAttribute('aria-pressed', String(night));

toggle.addEventListener('click', () => {
  night = !night;
  const mode = night ? 'night' : 'day';
  // Blocked storage throws; the switch still works for this page.
  try { localStorage.setItem(KEY, mode); } catch {}
  paint();
  if (!dispatchEvent(new CustomEvent('ao-mode', { detail: mode, cancelable: true }))) return;
  if (night) delete root.dataset.mode;
  else root.dataset.mode = 'day';
});
paint();
