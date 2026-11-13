// The host page: it only maps the page's scroll to the chapter's progress and keeps the time. The chapter is
// js/scene.js, written to be put into the tea room's working copy as it is (see its first lines).
//   ?y=0.37     starts the page at that share of the chapter
//   ?still=1    stops the time and draws exactly the frame the scroll asks for (no glide)
//   ?fps=1      shows what the drawing costs
// With prefers-reduced-motion nothing glides and nothing plays: the chapter is eight still pictures, one to a screen.
const qs = new URLSearchParams(location.search);
const STILL = qs.get('still') === '1';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SHOW = qs.get('fps') === '1';
const T_HELD = 7.3;
const root = document.documentElement, chapter = document.getElementById('chapter'), stage = document.getElementById('stage'), hint = document.getElementById('hint');
if (RM) root.classList.add('rm');

const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
let view = null, q = 0, time = STILL || RM ? T_HELD : 0, last = 0, dirty = true, drawn = -1, onScreen = true, loading = false;
const want = () => { const len = chapter.offsetHeight - window.innerHeight; return len > 0 ? clamp((window.scrollY - chapter.offsetTop) / len) : 0; };

function canDraw() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
// Nothing heavy is fetched until the chapter is near the window.
function load() {
  if (loading) return; loading = true;
  if (!canDraw()) { root.classList.add('flat'); return; }
  import('./scene.js').then((m) => {
    view = m.mount(stage, { still: STILL, reducedMotion: RM, invalidate: () => { dirty = true; } });
    q = RM ? 0 : want(); dirty = true;
    window.__terminal = { view, get q() { return q; }, get time() { return time; } };
  }).catch((e) => { console.error(e); root.classList.add('flat'); });
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver((en) => { if (en.some((e) => e.isIntersecting)) load(); }, { rootMargin: '150% 0px' }).observe(chapter);
  new IntersectionObserver((en) => { onScreen = en[en.length - 1].isIntersecting; sync(); }).observe(chapter);
} else load();
function sync() { if (view) view.setActive(onScreen && !document.hidden); dirty = true; last = 0; }
document.addEventListener('visibilitychange', sync);
addEventListener('resize', () => { if (view) view.resize(); dirty = true; });
addEventListener('scroll', () => { dirty = true; }, { passive: true });

let dbg = null, frames = 0, since = 0, worst = 0;
function tick(now) {
  requestAnimationFrame(tick);
  if (!view || !onScreen || document.hidden) return;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
  const w = want();
  if (STILL) q = w;
  else if (RM) q = view.stops[Math.min(view.stops.length - 1, Math.floor(w * view.stops.length))];
  else { q += (w - q) * (1 - Math.exp(-dt * 7)); if (Math.abs(w - q) < 0.00004) q = w; time += dt; }
  if ((STILL || RM) && !dirty && q === drawn) return;
  dirty = false; drawn = q;
  view.frame(q, time);
  hint.classList.toggle('gone', w > 0.012);
  if (SHOW) {
    if (!dbg) { dbg = document.createElement('pre'); dbg.className = 'debug'; document.body.append(dbg); }
    frames++; since += dt; worst = Math.max(worst, dt);
    if (since >= 1) { const s = view.stats(); dbg.textContent = (frames / since).toFixed(1) + ' frames a second (slowest ' + (worst * 1000).toFixed(0) + ' ms)\n' + s.triangles + ' triangles, ' + s.calls + ' draw calls\nq ' + q.toFixed(4); frames = 0; since = 0; worst = 0; }
  }
}
// ?y= puts the page at a share of the chapter before the first frame
if (qs.has('y')) { history.scrollRestoration = 'manual'; const y = clamp(parseFloat(qs.get('y')) || 0); const go = () => window.scrollTo(0, chapter.offsetTop + y * (chapter.offsetHeight - window.innerHeight)); go(); addEventListener('load', go); }
requestAnimationFrame(tick);
