// The homepage's script (pages/index.astro), in order: the day/night tween (theme.js; the head script set data-mode
// before paint), the overlay, the coin and its lantern door; then, after first paint and only with WebGL, the scene
// as a chunk of its own. Without it the page stays the flat document, already in the right colours.
import './theme.js';
import { lazy } from '../lazy.js';
import { bindCoin } from './coin.js';
import { bindLeaves } from './leaves-door.js';
import { flat } from './flat.js';
import { mountOverlay, onPanel } from './overlay/panel.js';

const root = document.documentElement;
root.classList.remove('no-js');
mountOverlay();
// The day/night switch moves into the panel's header while the panel is up (home.css).
onPanel((state) => root.toggleAttribute('data-panel-up', state === 'open' || state === 'covered'));
bindCoin();
bindLeaves();

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

requestAnimationFrame(() => requestAnimationFrame(() => {
  if (!webgl()) { flat('no webgl'); return; }
  lazy(() => import('./scene/scene.js')).then(({ mount }) => {
    // the e2e hook, and handy from the console when tuning waypoints; a scene that throws on start (a renderer
    // WebGL refused after all) gives the flat page at once, not a staged first frame left pending
    try { window.__homeScene = mount(); } catch (e) { flat(`the scene failed to start: ${e?.message || e}`); }
  }, () => flat('the scene failed to load'));
}));
