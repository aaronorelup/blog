/* The test page round the scene: it decides how long the chapter is, turns the page's scroll into the chapter's
   progress q, fetches the scene only when the chapter is near, and asks it for one frame at a time.

   ?y=0.4 puts the chapter at that progress; ?still=1 holds the time, so one address is always one picture.
   ?debug=1 shows the frame rate. With motion turned off in the system, the page does not walk by the scroll: two
   buttons step from one lantern to the next. */
import { PROJECTS, SHELVES, TOTAL } from './projects.js';

const qs = new URLSearchParams(location.search);
const STILL = qs.get('still') === '1';
const DEBUG = qs.get('debug') === '1';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HELD = STILL || RM;
const T_HELD = 4.2;
const N = PROJECTS.length;
const PER = 0.95;                          // the scroll one project gets, in screen heights

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const chapter = $('chapter'), stage = $('stage'), sceneEl = $('scene'), track = $('track');
const lead = $('lead'), hint = $('hint'), dbg = $('debug'), steps = $('steps');
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

if (RM) root.classList.add('rm');
if (STILL) root.classList.add('still');
if (DEBUG) dbg.hidden = false;

// ------------------------------------------------------------------ how long the chapter is
let travel = 1;
function size() {
  const vh = stage.offsetHeight || window.innerHeight;
  track.style.height = RM ? '0px' : Math.round((N + 3) * PER * vh) + 'px';
  travel = Math.max(1, chapter.offsetHeight - vh);
}

// ------------------------------------------------------------------ where the reader is
let step = -1;                             // with motion off: -1 the start, 0..N-1 a lantern, N the house
function progress() {
  if (RM) return step < 0 ? 0 : step >= N ? 1 : scene ? scene.qOf(step) : 0;
  return clamp(-chapter.getBoundingClientRect().top / travel);
}
function near() { const r = chapter.getBoundingClientRect(), vh = window.innerHeight; return r.bottom > -20 && r.top < vh + 20; }

const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
if (!HELD) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    aim.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); aim.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
  }, { passive: true });
}

// ------------------------------------------------------------------ one frame
let scene = null, raf = 0, live = false, t0 = performance.now(), last = 0, ema = 0;
function draw(nowMs) {
  const q = progress();
  if (scene) {
    const on = near();
    if (on !== live) { live = on; scene.setActive(on); }
    if (on) {
      const ease = 1 - Math.exp(-Math.min(nowMs - last || 16, 200) / 260);
      at.x += (aim.x - at.x) * ease; at.y += (aim.y - at.y) * ease;
      const st = scene.frame(q, HELD ? T_HELD : (nowMs - t0) / 1000, HELD ? null : at);
      if (DEBUG && nowMs && last) { ema = ema ? ema * 0.95 + (nowMs - last) * 0.05 : nowMs - last; dbg.textContent = (1000 / ema).toFixed(0) + ' frames a second\n' + st.flats + ' flats on screen\nq ' + q.toFixed(4) + '  k ' + st.k.toFixed(3); }
      last = nowMs;
    }
  }
  const leadO = RM ? (step < 0 ? 1 : 0) : 1 - ss(0.012, 0.04, q);
  lead.style.opacity = leadO.toFixed(3); lead.style.visibility = leadO > 0.01 ? 'visible' : 'hidden';
  hint.style.opacity = (1 - ss(0.002, 0.014, q)).toFixed(3);
}
function tick(nowMs) { raf = 0; draw(nowMs); if (!HELD && live && !document.hidden) raf = requestAnimationFrame(tick); }
function kick() { if (!raf) raf = requestAnimationFrame(tick); }

// ------------------------------------------------------------------ ?y
size();
if (qs.has('y') && !RM) {
  try { history.scrollRestoration = 'manual'; } catch (e) { /* older browsers */ }
  const y = clamp(parseFloat(qs.get('y')) || 0);
  const jump = () => { size(); window.scrollTo(0, chapter.getBoundingClientRect().top + window.scrollY + y * travel); kick(); };
  jump(); window.addEventListener('load', jump);
}

// ------------------------------------------------------------------ the scene is fetched when the chapter is near
function start() {
  import('./scene.js').then((m) => {
    scene = m.mount(sceneEl, { projects: PROJECTS, shelves: SHELVES, total: TOTAL, still: HELD, onChange: kick });
    window.projectsWalk = scene;                            // for a look from the console, and for the tests
    kick();
  });
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '120% 0px' });
  io.observe(chapter);
} else start();

window.addEventListener('scroll', kick, { passive: true });
window.addEventListener('resize', () => { size(); if (scene) scene.resize(); kick(); });
window.addEventListener('load', () => { size(); kick(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

// ------------------------------------------------------------------ with motion off: two buttons, one lantern at a time
if (RM) {
  steps.hidden = false;
  const prev = $('prev'), next = $('next');
  const set = (s) => {
    step = clamp(s, -1, N); prev.disabled = step <= -1; next.disabled = step >= N;
    next.textContent = step === N - 1 ? 'To the tea house' : step < 0 ? 'First lantern' : 'Next lantern';
    kick();
  };
  prev.addEventListener('click', () => set(step - 1)); next.addEventListener('click', () => set(step + 1));
  set(-1);
}
kick();
