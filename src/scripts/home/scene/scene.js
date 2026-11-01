// The tea house: a three.js scene behind the homepage's cards, its own chunk (home/index.js loads it after first
// paint, on WebGL only). mount() builds the world at the time of day the page is in, stages the page (one stop per
// gesture, cards.js and camera.js) and runs the frame loop, which draws only when something moved or petals fall.
// It follows the theme (home/theme.js, palette.js) and the overlay's panel (panelState: no input while it is up, no
// drawing while it covers the window). bail(why) gives the page back as the flat document. Backtick opens the
// staging tool, ?stats and ?diag the diagnostics (dev/, loaded only then). mount() returns the state, the e2e hook.
import { flat } from '../flat.js';
import { lazy } from '../../lazy.js';
import { onPanel } from '../overlay/panel.js';
import { mixNow, onMix } from '../theme.js';
import { bindInput, buildCurves, place, progress, unbindInput } from './camera.js';
import { disableStage, enableStage, measureCards } from './cards.js';
import { bindOutbound, exitStep } from './exit.js';
import { paint, setPalette } from './palette.js';
import { applyTier, pickTier, sampleQuality } from './quality.js';
import { fadeRail } from './rail.js';
import { createView, fit } from './renderer.js';
import { buildWorld } from './world/index.js';
import { updatePetals } from './world/petals.js';

export function mount() {
  const sections = [...document.querySelectorAll('section[data-wp]')];
  const s = {
    canvas: document.getElementById('home-scene-canvas'),
    main: document.getElementById('content'),
    rail: document.getElementById('stop-rail'),
    flash: document.getElementById('scene-flash'),
    spacer: sections.find(el => el.dataset.wp === '1'),
    cards: sections.filter(el => el.dataset.wp !== '1').map(el => ({ el, wp: +el.dataset.wp })),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    motion: 'idle', stopIdx: 0, nudge: 0, alive: true,
  };
  const query = new URLSearchParams(location.search);
  pickTier(s, query);
  createView(s);
  s.mix = mixNow();                       // the time of day the world is built in
  setPalette(s.mix);
  buildWorld(s);
  buildCurves(s);
  applyTier(s);
  if (query.has('stats') || query.has('diag')) {
    lazy(() => import('../dev/diagnostics.js')).then((d) => d.start(s, query));
  }
  s.onResize = () => resize(s);
  addEventListener('resize', s.onResize);
  if (!s.reduced) { enableStage(s); bindInput(s); }
  // backtick toggles the staging tool
  s.onStageHotkey = (e) => {
    if (e.key !== '`' && e.key !== '~') return;
    e.preventDefault();
    lazy(() => import('../dev/staging.js')).then((d) => d.toggle(s));
  };
  addEventListener('keydown', s.onStageHotkey);
  s.onLost = (e) => { e.preventDefault(); bail(s, 'context lost'); };
  s.canvas.addEventListener('webglcontextlost', s.onLost);
  bindOutbound(s);
  resize(s);
  s.offMix = onMix((m) => paint(s, m));
  s.loop = (ts) => frame(s, ts);
  s.raf = requestAnimationFrame(s.loop);
  s.offPanel = onPanel((state) => panelState(s, state));
  return s;
}

function resize(s) {
  if (s.cardTops) measureCards(s);
  fit(s);
  s.camera.aspect = innerWidth / innerHeight;
  s.portrait = s.camera.aspect < 0.9;
  buildCurves(s);
  s.lastProgress = -9;
}

// The overlay's panel (home/overlay/panel.js) over the scene: from 'open' until 'closed' nothing walks the scene and
// the rail fades, and while it is 'covered' (the whole window) nothing is drawn; 'closing' draws again.
function panelState(s, state) {
  const up = state !== 'closed';
  if (up !== !!s.panelUp) {
    s.panelUp = up;
    s.locked = up;
    if (up) unbindInput(s);
    else if (!s.reduced && s.renderer) bindInput(s);
    fadeRail(s, up);
  }
  s.paused = state === 'covered';
  if (!s.paused && s.alive && !s.raf) {
    s.lastProgress = -9;
    s.raf = requestAnimationFrame(s.loop);
  }
}

function frame(s, ts) {
  if (!s.alive) return;
  if (s.paused) { s.raf = null; return; }
  s.raf = requestAnimationFrame(s.loop);
  const dt = Math.min(0.05, (ts - (s.lastTs || ts)) / 1000);
  s.lastTs = ts;

  if (s.staging) {
    s.staging.step(dt);
    if (!document.hidden) {
      if (s.petalCount > 0) updatePetals(s, ts / 1000);
      s.renderer.render(s.scene, s.camera);
    }
    return;
  }
  if (s.motion === 'exit') { exitStep(s, ts); return; }

  const at = progress(s, ts, dt);
  if (document.hidden) return;
  const moved = Math.abs(at - (s.lastProgress ?? -9)) > 0.0002;
  const petalsLive = !s.reduced && s.petalCount > 0;
  if (!moved && !petalsLive) return;
  s.lastProgress = at;
  place(s, at);
  if (petalsLive) updatePetals(s, ts / 1000);
  s.renderer.render(s.scene, s.camera);
  if (sampleQuality(s, ts)) { bail(s, 'below 22fps even as a static frame'); return; }
  s.readout?.(at);
}

// Stop the loop and hand the GPU back (a bail that keeps rendering into a hidden canvas is the one thing worse than
// the scene we just gave up on), then the flat page.
function bail(s, why) {
  s.alive = false;
  cancelAnimationFrame(s.raf);
  s.raf = null;
  unbindInput(s);
  removeEventListener('keydown', s.onStageHotkey);
  removeEventListener('resize', s.onResize);
  s.canvas.removeEventListener('webglcontextlost', s.onLost);
  s.staging?.off();
  s.offMix();
  s.offPanel();
  disableStage(s);
  s.renderer.dispose();
  s.renderer = null;
  flat(why);
}
