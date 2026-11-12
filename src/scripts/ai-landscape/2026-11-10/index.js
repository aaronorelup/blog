// The page's entry: small, and enough to run the page before (or without) the scene. It checks what the
// machine can do, picks a quality rung, sizes the sections, runs the story clock and the chrome, then loads
// the three.js scene after first paint. With no WebGL, ?tier=static or the skip link, the text version stays.
// window.__landscape { ready, tier, progress, frames, section, camera, world } is the hook the tests read.
import { createClock } from './core/clock.js';
import { $, $$, readData, toggle } from './core/dom.js';
import { createInput } from './core/input.js';
import { pickRung } from './core/quality.js';

const root = document.documentElement;
const state = { ready: false, tier: 'static', progress: 0, frames: 0, section: '', camera: null, world: '' };
window.__landscape = state;
let scene = null;
let running = false;

// The site's lazy() rule (src/scripts/lazy.js), kept here so this page shares no chunk with the site's own
// pages: after a deploy an open tab's hashed chunks are gone, so a failed import reloads the page once.
function lazy(load) {
  return load().catch((err) => {
    if (!sessionStorage.getItem('ao-reloaded')) { sessionStorage.setItem('ao-reloaded', '1'); location.reload(); }
    throw err;
  });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch { return false; }
}

// The text version (SPEC 7.3): the page as Astro built it. Also where a lost context or a slow machine lands.
function toText() {
  running = false;
  if (scene) { scene.dispose(); scene = null; }
  root.classList.remove('ail-gl', 'ail-3d');
  root.removeAttribute('data-chrome');
  for (const el of $$('main > section[data-screens]')) el.style.height = '';
  for (const el of $$('.is-on')) el.classList.remove('is-on');
  state.tier = 'static'; state.ready = true; state.world = '';
}

function buildRail(clock) {
  const rail = $('.ail-rail');
  const list = rail && $('ol', rail);
  if (!list) return () => {};
  let last = '';
  const links = clock.sections.filter((sec) => sec.id).map((sec) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const name = document.createElement('span');
    a.href = `#${sec.id}`;
    name.textContent = sec.el.dataset.rail || sec.id;
    if (last && last !== sec.name) li.dataset.gap = '';
    last = sec.name;
    a.append(name); li.append(a); list.append(li);
    return { a, sec };
  });
  rail.hidden = false;
  return (current) => links.forEach(({ a, sec }) => a.setAttribute('aria-current', String(sec === current)));
}

function boot() {
  const query = new URLSearchParams(location.search);
  const phone = matchMedia('(max-width: 599px)').matches;
  const reduced = query.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rung = pickRung(query, phone);
  const main = $('#ail-main');

  for (const skip of $$('[data-ail-text]')) {
    skip.addEventListener('click', (e) => {
      e.preventDefault();
      toText();
      main.tabIndex = -1; main.focus();
      window.scrollTo(0, 0);
    });
  }
  if (rung.name === 'static' || !hasWebGL()) { toText(); return; }

  root.classList.add('ail-gl');
  const input = createInput({ reduced });
  const clock = createClock({ touch: input.touch, reduced });
  clock.measure();
  const markRail = buildRail(clock);
  const map = $('.ail-map');
  const cols = $$('.ail-map__col');
  // A link to a section lands where the section says it is worth arriving (data-land, in screens from its start):
  // a world's address opens on the world, not on the studio before it.
  const land = (hash, smooth) => {
    const sec = clock.sections.find((x) => x.id && x.id === hash.slice(1));
    if (!sec) return false;
    window.scrollTo({ top: clock.pixels(sec.s0 + (Number(sec.el.dataset.land) || 0)), behavior: smooth && !reduced ? 'smooth' : 'auto' });
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || state.tier === 'static' || !land(a.hash, true)) return;
    e.preventDefault();
    history.pushState(null, '', a.hash);
  });
  window.addEventListener('hashchange', () => { if (state.tier !== 'static') land(location.hash, false); });
  if (location.hash) land(location.hash, false);
  clock.update(0); clock.jump();
  state.tier = rung.name;

  let shown = null;
  let last = performance.now();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock.update(dt);
    input.update(dt);
    const cur = clock.current;
    if (cur !== shown) {
      if (shown) toggle($('.ail-stage', shown.el), false);
      if (cur) toggle($('.ail-stage', cur.el), true);
      shown = cur;
      markRail(cur);
      state.section = cur ? cur.id : '';
      state.world = cur ? cur.el.dataset.world || '' : '';
      if (map) {
        map.toggleAttribute('data-here', !!state.world);
        cols.forEach((c) => c.toggleAttribute('data-here', c.dataset.p === state.world));
      }
    }
    state.progress = clock.s / clock.max;
    if (scene) scene.frame(dt, now / 1000);
    if (!document.hidden) requestAnimationFrame(frame);
  }
  const start = () => { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.tier !== 'static') { running = false; start(); } });
  window.addEventListener('resize', () => { clock.measure(); if (scene) scene.resize(); });
  start();

  // After first paint, the scene. A chunk lost to a deploy reloads the page once, any other failure keeps the text.
  const load = () => lazy(() => import('./scene/index.js'))
    .then((m) => m.mount({ canvas: $('#ail-gl'), clock, input, state, rung, phone, reduced, query, data: readData(), toText }))
    .then((mounted) => { scene = mounted; root.classList.add('ail-3d'); state.ready = true; })
    .catch((err) => { console.warn('ai-landscape: the scene did not start, showing the text version.', err); toText(); });
  requestAnimationFrame(() => requestAnimationFrame(load));
}

boot();
