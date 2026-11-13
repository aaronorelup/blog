// The tea room's engine, started (2.5). Scroll only asks for a frame; nothing is carried from one frame to the next.
// In live mode: measure after the fonts are ready, lay out (plan), find the elements (bind), then on every scroll,
// and every tick while something time-driven is in view, draw: frame() works out the whole frame from the scroll
// position, the time, the pointer and the layout, and apply() writes it. Test hooks, kept in the shipped page:
// ?y= (a share of the page, after the first measurement), ?still=1, ?book=1 (the head script), ?meter=1,
// ?words=0 (CSS), ?lean=1, ?gl=0 (the 3D chapter's), and window.__room: settled(), state(), and frame (the last
// frame as frame() gave it, for a test to compare with what state() reads back).
import { drawAmbient } from './ambient.js';
import { apply, bind, place, readBack } from './apply.js';
import { clockOf, pointerOf } from './clock.js';
import { frame } from './frame.js';
import { wireIndex } from './index.js';
import { measure, watch } from './layout.js';
import { loader } from './load.js';
import { PIECES } from './pieces.js';
import { plan } from './plan.js';
import { media } from '../media.js';

const doc = document;
const root = doc.documentElement;
const q = new URLSearchParams(location.search);
const live = root.dataset.room === 'live';
const still = q.get('still') === '1';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

wireIndex(doc);
media(doc, { live, still: () => still || reduced.matches || !live });
if (q.get('meter') === '1') import('./meter.js').then((m) => m.meter(doc));
const hooks = { settled: () => !live && doc.readyState === 'complete', state: () => null, frame: null };
window.__room = hooks;
if (live) start();

async function start() {
  const room = JSON.parse(doc.getElementById('tea-room-scenes').textContent);
  const lean = q.get('lean') === '1' ? 1 : 0;
  const touch = matchMedia('(hover: none)').matches;
  const pieces = {};
  const pending = new Set();
  const mouse = { x: 0, y: 0, moved: false };
  let L = null, page = null, m = null, last = null, asked = 0, fresh = false, drawnAt = NaN, fonts = false;
  const load = loader(doc, () => ask());

  const ask = () => { asked ||= requestAnimationFrame(draw); };
  const layout = (again = true) => {
    if (again || !m) m = measure(doc);
    root.dataset.comp = m.vw > m.vh ? 'd' : 'p';
    L = plan(room, { w: m.vw, h: m.vh }, { marks: m.marks, lens: m.lens, pieces, lean });
    page = bind(doc, L);
    place(page, L);
    draw();
  };
  const pointer = () => pointerOf({ x: mouse.x, y: mouse.y, vw: L.vw, vh: L.vh, moved: mouse.moved, touch, still, reduced: reduced.matches });

  // A chapter's set piece loads when the reader nears it, with its plates; the layout is planned again with it.
  const want = (i) => {
    L.chapters.forEach((c, j) => {
      if (Math.abs(j - i) > 1.5 || pieces[c.id] || pending.has(c.id) || !PIECES[c.id]) return;
      pending.add(c.id);
      PIECES[c.id]().then((mod) => {
        pending.delete(c.id);
        if (typeof mod.piece === 'function') { pieces[c.id] = mod.piece; layout(false); }
        mod.mount?.(doc.querySelector(`[data-room-chapter="${c.id}"]`));
      }, () => pending.delete(c.id));
    });
  };

  function draw() {
    asked = 0;
    const t = clockOf({ now: performance.now(), still, reduced: reduced.matches });
    drawnAt = scrollY;
    const f = frame(drawnAt, t, pointer(), L);
    apply(f, page, L);
    last = f;
    fresh = true;
    load.near(f.index.i, L, page);
    want(f.index.i);
    const timed = drawAmbient(page.canvas, f.ambient, L);
    if (timed && !still && !reduced.matches && !doc.hidden) ask();
  }

  layout();
  root.dataset.roomPlaced = '';
  await doc.fonts.ready;
  fonts = true;
  layout();
  load.shared();
  watch(doc, () => { layout(); load.shared(); });
  const y = parseFloat(q.get('y'));
  if (Number.isFinite(y)) scrollTo(0, Math.round(Math.min(1, Math.max(0, y)) * (root.scrollHeight - innerHeight)));
  addEventListener('scroll', () => { fresh = false; ask(); }, { passive: true });
  addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true; if (lean) ask(); }, { passive: true });
  doc.addEventListener('visibilitychange', () => ask());
  reduced.addEventListener?.('change', () => ask());
  // An off slot that takes keyboard focus: the page jumps to the first place where it is on.
  doc.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-room-slot][data-off]');
    const i = el ? page.slots.indexOf(el) : -1;
    if (i < 0) return;
    const k = L.slots[i];
    if (Number.isFinite(k.show[0])) scrollTo(0, Math.ceil(L.chapters[k.chapter].top + (k.show[0] + 0.01) * L.vh));
  });
  ask();

  hooks.settled = () => Boolean(fonts && L && last && fresh && drawnAt === scrollY && !pending.size && load.decoded(last.on, page) &&
    L.chapters.every((c, j) => Math.abs(j - last.index.i) > 1 || !PIECES[c.id] || pieces[c.id]));
  hooks.state = () => (L && last ? readBack(page, L, last.on) : null);
  Object.defineProperty(hooks, 'frame', { get: () => last, configurable: true });
}
