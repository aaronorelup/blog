/* The test page round the scene: it decides how long the chapter is, turns the page's scroll into the chapter's
   progress q, fetches the scene only when the chapter is near, and asks it for one frame at a time.

   ?y=0.4 puts the chapter at that progress; ?still=1 holds the time and centres the pointer, so one address is
   always one picture. ?debug=1 shows the frame rate. With motion turned off in the system, the page does not move
   the camera by the scroll: two buttons cut from one picture to the next. */
import { PICTURES } from './pictures.js';

const qs = new URLSearchParams(location.search);
const STILL = qs.get('still') === '1';
const DEBUG = qs.get('debug') === '1';
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HELD = STILL || RM;                  // the time stands still
const T_HELD = 7.3;
const N = PICTURES.length;
const PER = 0.15;                          // the scroll one picture gets, in screen heights
const QA = 0.055, QB = 0.845;              // the scene's own three parts: the turn, the walk, the sky

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const chapter = $('chapter'), stage = $('stage'), sceneEl = $('scene'), track = $('track'), posts = $('posts');
const lead = $('lead'), dock = $('dock'), hint = $('hint'), dbg = $('debug'), steps = $('steps');
const nowCount = $('now-count'), nowHint = $('now-hint'), nowTitle = $('now-title');
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

if (RM) root.classList.add('rm');
if (STILL) root.classList.add('still');
if (DEBUG) dbg.hidden = false;
const touch = window.matchMedia('(hover: none)').matches;
const WORD = touch ? 'Tap' : 'Click';
nowHint.textContent = WORD + ' a picture to bring it forward';

// ------------------------------------------------------------------ how long the chapter is
let travel = 1, postsQ = 1;
function size() {
  const vh = stage.offsetHeight || window.innerHeight;
  const want = RM ? 0 : (N + 1.8) * PER * vh / (QB - QA);
  track.style.height = Math.max(0, Math.round(want - posts.offsetHeight)) + 'px';
  travel = Math.max(1, chapter.offsetHeight - vh);
  postsQ = 1 - posts.offsetHeight / travel;                 // where the post cards begin to come up the screen
}

// ------------------------------------------------------------------ where the reader is
let step = -1;                                              // with motion off: -1 the trees, 0..N-1 a picture, N the sky
function progress() {
  if (RM) return !scene ? 0.05 : step < 0 ? 0.05 : step >= N ? scene.skyQ : scene.qOf(step);
  return clamp(-chapter.getBoundingClientRect().top / travel);
}
function near() { const r = chapter.getBoundingClientRect(), vh = window.innerHeight; return r.bottom > -20 && r.top < vh + 20; }

// ------------------------------------------------------------------ the pointer leans the camera a little
const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
if (!HELD) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    aim.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); aim.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
  }, { passive: true });
}

// ------------------------------------------------------------------ one frame
let scene = null, raf = 0, live = false, t0 = performance.now(), last = 0, ema = 0, shown = { i: -2, sky: false };
function draw(nowMs) {
  const q = progress();
  if (scene) {
    const on = near();
    if (on !== live) { live = on; scene.setActive(on); }
    if (on) {
      at.x += (aim.x - at.x) * 0.07; at.y += (aim.y - at.y) * 0.07;
      const st = scene.frame(q, HELD ? T_HELD : (nowMs - t0) / 1000, HELD ? null : at);
      // the card under the pictures: which one is in front, or that they are all in the sky
      const sky = st.k > N - 0.3;
      if (st.index !== shown.i || sky !== shown.sky) {
        shown = { i: st.index, sky };
        if (sky) { nowCount.textContent = 'All ' + N; nowTitle.textContent = 'They let go, and rise past the moon'; nowHint.textContent = WORD + ' any of them'; }
        else if (st.index >= 0) { nowCount.textContent = (st.index + 1) + ' of ' + N; nowTitle.textContent = PICTURES[st.index].title; nowHint.textContent = WORD + ' a picture to bring it forward'; }
      }
      const dockO = RM ? 1 : ss(QA - 0.012, QA + 0.006, q) * (1 - ss(postsQ - 0.012, postsQ + 0.004, q)) * (st.open >= 0 ? 0 : 1);
      dock.style.opacity = dockO.toFixed(3); dock.style.visibility = dockO > 0.01 ? 'visible' : 'hidden';
      if (DEBUG && nowMs && last) { ema = ema ? ema * 0.95 + (nowMs - last) * 0.05 : nowMs - last; dbg.textContent = (1000 / ema).toFixed(0) + ' frames a second\n' + st.flats + ' flats on screen\nq ' + q.toFixed(4) + '  picture ' + (st.index + 1); }
      last = nowMs;
    }
  }
  const leadO = RM ? (step < 0 ? 1 : 0) : 1 - ss(0.01, 0.04, q);
  lead.style.opacity = leadO.toFixed(3); lead.style.visibility = leadO > 0.01 ? 'visible' : 'hidden';
  hint.style.opacity = (1 - ss(0.002, 0.012, q)).toFixed(3);
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
    scene = m.mount(sceneEl, { pictures: PICTURES, still: HELD, onChange: kick });
    sceneEl.classList.add('is-live');
    window.gardenGallery = scene;                           // for a look from the console, and for the tests
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
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && scene) scene.close(); });

// ------------------------------------------------------------------ with motion off: two buttons, one picture at a time
if (RM) {
  steps.hidden = false;
  const prev = $('prev'), next = $('next');
  const set = (s) => {
    step = clamp(s, -1, N); prev.disabled = step <= -1; next.disabled = step >= N;
    next.textContent = step === N - 1 ? 'See them all' : step < 0 ? 'First picture' : 'Next picture';
    if (step < 0) { nowCount.textContent = N + ' pictures'; nowTitle.textContent = 'The garden gallery'; nowHint.textContent = ''; shown = { i: -2, sky: false }; }
    if (scene) scene.close();
    kick();
  };
  prev.addEventListener('click', () => set(step - 1)); next.addEventListener('click', () => set(step + 1));
  set(-1);
}
kick();
