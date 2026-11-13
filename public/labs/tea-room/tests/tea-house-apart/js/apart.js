// The page: the scroll is the camera. Everything drawn is a function of the scroll position and of the time.
//   ?y=0.37     sets the scroll to that share of the page
//   ?still=1    holds the time and draws exactly the frame the scroll asks for (no glide)
//   ?t=12.4     holds the time at that second but leaves the scroll and its glide alive
// With prefers-reduced-motion nothing glides: the page shows three still pictures, one to a screen.
import { ACT } from './camera.js';
import { mount } from './scene.js';

const qs = new URLSearchParams(location.search);
const STILL = qs.get('still') === '1';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOLD = qs.has('t') ? parseFloat(qs.get('t')) : NaN;
const FROZEN = STILL || RM;
const T_HELD = 12.4;

const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const io = (t) => { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

const root = document.documentElement, stage = $('stage'), track = $('track');
const word = $('word'), say = $('say'), hint = $('hint'), leaders = $('leaders'), labelBox = $('labels'), card = $('card');

let view;
try { view = mount($('scene')); } catch (e) { root.classList.add('flat'); }

// ---------------------------------------------------------------- the names over the picture
// A chip names a corner of the room with the meaning the homepage gave it; a tag names a layer of the drawing.
// piece: the piece it points at; at: a point on that piece, in metres from its middle; wide and tall: where the
// name sits from that point on the window, in pixels, and which of its sides the line meets (l or r).
const NAMES = [
  { kind: 'tag', piece: 'roof-left', at: [-2.2, 0.4, 2.2], text: 'Roof', wide: [-46, -18, 'r'], tall: [-14, -34, 'r'] },
  { kind: 'tag', piece: 'ceiling', at: [-6.9, 0, 5.7], text: 'Paper ceiling', wide: [-46, 0, 'r'], tall: [-10, 26, 'r'] },
  { kind: 'tag', piece: 'frieze-left', at: [0, 0, 5.2], text: 'Beams', wide: [-46, 0, 'r'], tall: [-8, 24, 'r'] },
  { kind: 'tag', piece: 'shoji-front-l-0', at: [-0.95, 0, 0], text: 'Shoji screens', wide: [-46, 0, 'r'], tall: [-6, 60, 'r'] },
  { kind: 'tag', piece: 'wall-left', at: [0, 0, 5.2], text: 'Plaster walls', wide: [-46, 0, 'r'], tall: [-6, 30, 'r'] },
  { kind: 'tag', piece: 'mat-0', at: [-0.7, 0, 5.1], text: 'Tatami', wide: [-46, 8, 'r'], tall: [-6, 26, 'r'] },
  { kind: 'chip', piece: 'painting', at: [0, 0.6, 0], title: 'Projects', sub: 'The alcove', wide: [24, 64, 'l'], tall: [14, -44, 'r'] },
  { kind: 'chip', piece: 'desk', at: [0, 0.3, 0], title: 'The Ledger & Courses', sub: 'The writing desk', wide: [-64, -22, 'r'], tall: [-10, 46, 'l'] },
  { kind: 'chip', piece: 'table', at: [0, 0.6, 0], title: 'Right now', sub: 'The tea table', wide: [36, -72, 'l'], tall: [-24, -52, 'l'] },
  { kind: 'chip', fixed: [0, 5.15, 22], after: 'cabinet', title: 'On your way out', sub: 'The gate', wide: [44, -34, 'l'], tall: [-6, 44, 'l'] },
];
const SVG = 'http://www.w3.org/2000/svg';
NAMES.forEach((n) => {
  const el = document.createElement('div');
  el.className = n.kind;
  if (n.kind === 'chip') {
    const b = document.createElement('b'); b.textContent = n.title; el.appendChild(b);
    const s = document.createElement('span'); s.textContent = n.sub; el.appendChild(s);
  } else el.textContent = n.text;
  labelBox.appendChild(el);
  n.el = el;
  n.line = document.createElementNS(SVG, 'line');
  n.dot = document.createElementNS(SVG, 'circle');
  n.dot.setAttribute('r', n.kind === 'chip' ? 3.5 : 2.5);
  leaders.appendChild(n.line); leaders.appendChild(n.dot);
  n.shown = null;
});

// ---------------------------------------------------------------- layout
// tall: the camera's framing (a phone held upright); stacked: the card sits under the drawing, not beside it
let W = 1, H = 1, trackLen = 1, readLen = 1, maxScroll = 1, dprCap = 2, tall = false, stacked = false;
const cardBox = { left: 0, top: 0, h: 0 };
const safe = { x0: 0, y0: 0, x1: 1, y1: 1 };
function layout() {
  W = stage.clientWidth; H = stage.clientHeight;
  const vh = window.innerHeight;
  trackLen = Math.max(1, track.offsetHeight - (RM ? 0 : vh));
  maxScroll = Math.max(1, root.scrollHeight - vh);
  readLen = Math.max(1, maxScroll - trackLen);
  if (view) { view.resize(W, H, Math.min(window.devicePixelRatio || 1, dprCap)); tall = view.isTall(); }
  stacked = window.matchMedia('(max-aspect-ratio: 4/5), (max-width: 759px)').matches;
  const cr = card.getBoundingClientRect();
  cardBox.left = cr.left; cardBox.h = cr.height;
  cardBox.top = cr.top + window.scrollY - maxScroll;      // where its top edge rests when the page is at its end
  NAMES.forEach((n) => { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; });
  // the word stands on the room's dark wall: left of centre on a wide window, low on a tall one
  word.w = word.offsetWidth; word.h = word.offsetHeight; say.h = say.offsetHeight;
}

// ---------------------------------------------------------------- one frame
const pt = { x: 0, y: 0, behind: false };
function setStyle(el, key, val) { if (el['_' + key] !== val) { el['_' + key] = val; el.style[key] = val; } }

function draw(y, t) {
  let T = clamp(y / trackLen);
  // readers who asked for less motion get three still pictures: inside, the whole house, the house apart
  if (RM) T = T < 0.3 ? 0 : T < 0.68 ? ACT.whole : 1;
  const c = RM ? (T === 1 ? 1 : 0) : clamp((y - trackLen) / readLen);     // the card coming up
  const u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
  const e = io(c);
  // the part of the window the drawing may use: all of it, less a margin, until the card comes up; then the
  // drawing makes room, aside on a wide window, upward when the card sits under it
  const mx = Math.max(14, W * 0.045), my = Math.max(14, H * 0.055);
  safe.x0 = mx; safe.y0 = my + (stacked ? 16 : 0); safe.x1 = W - mx; safe.y1 = H - my;
  if (stacked) safe.y1 += (Math.max(H * 0.3, cardBox.top - 14) - safe.y1) * e;
  else safe.x1 += (cardBox.left - 30 - safe.x1) * e;
  if (view) view.render(T, t, safe);

  // the chapter's word, there when you arrive, gone as the camera backs away
  const gone = ss(0.02, 0.085, T), wx = tall ? W * 0.08 : W * 0.33, wy = tall ? H * 0.72 : H * 0.76;
  const wo = (1 - gone).toFixed(3);
  setStyle(word, 'opacity', wo);
  setStyle(word, 'transform', `translate3d(${wx.toFixed(1)}px,${(wy - word.h / 2 - gone * H * 0.06).toFixed(1)}px,0) scale(${(1 + gone * 0.08).toFixed(4)})`);
  setStyle(say, 'opacity', wo);
  setStyle(say, 'transform', `translate3d(${(wx + 6).toFixed(1)}px,${(wy + word.h / 2 + 18 - gone * H * 0.04).toFixed(1)}px,0)`);
  setStyle(word, 'visibility', gone >= 1 ? 'hidden' : 'visible');
  setStyle(say, 'visibility', gone >= 1 ? 'hidden' : 'visible');
  setStyle(hint, 'opacity', (1 - ss(0.004, 0.03, T)).toFixed(3));

  // the names: each appears as its piece lifts and rides with it
  if (!view) return;
  NAMES.forEach((n) => {
    const p = view.piece(n.piece || n.after);
    // a tag is a passing caption: it comes with its layer and goes once the layer has settled; a chip stays
    let a = ss(0.25, 0.8, p.k);
    if (n.kind === 'tag') a *= 0.92 * (1 - ss(p.t1 + 0.035, p.t1 + 0.1, u)) * (1 - e);
    else if (stacked) a *= 1 - e;
    if (a <= 0.004) {
      if (n.shown !== false) { n.shown = false; n.el.style.visibility = 'hidden'; n.line.style.visibility = 'hidden'; n.dot.style.visibility = 'hidden'; }
      return;
    }
    if (n.shown !== true) { n.shown = true; n.el.style.visibility = 'visible'; n.line.style.visibility = 'visible'; n.dot.style.visibility = 'visible'; }
    if (n.fixed) view.project(n.fixed[0], n.fixed[1], n.fixed[2], pt);
    else { const q = p.obj.position; view.project(q.x + n.at[0], q.y + n.at[1], q.z + n.at[2], pt); }
    const off = tall ? n.tall : n.wide, ax = pt.x, ay = pt.y;
    let jx = ax + off[0];                                          // where the line meets the name
    const jy = ay + off[1];
    let lx = off[2] === 'r' ? jx - n.w - 8 : jx + 8;
    if (lx < 12) { jx += 12 - lx; lx = 12; }                       // never off the window's edge
    if (lx + n.w > W - 12) { jx -= lx + n.w - (W - 12); lx = W - 12 - n.w; }
    n.el.style.transform = `translate3d(${lx.toFixed(1)}px,${(jy - n.h / 2).toFixed(1)}px,0)`;
    n.el.style.opacity = a.toFixed(3);
    n.line.setAttribute('x1', ax.toFixed(1)); n.line.setAttribute('y1', ay.toFixed(1));
    n.line.setAttribute('x2', jx.toFixed(1)); n.line.setAttribute('y2', jy.toFixed(1));
    n.line.style.opacity = (a * 0.6).toFixed(3);
    n.dot.setAttribute('cx', ax.toFixed(1)); n.dot.setAttribute('cy', ay.toFixed(1));
    n.dot.style.opacity = a.toFixed(3);
  });
}

// ---------------------------------------------------------------- the loop
let yS = 0, lastNow = 0, started = false, slow = 0, frames = 0;
function time(now) { return !isNaN(HOLD) ? HOLD : FROZEN ? T_HELD : now / 1000; }
function frame(now) {
  const yT = window.scrollY, dt = Math.min(0.1, (now - lastNow) / 1000);
  // the camera glides after the scroll and always arrives: yS chases the true position and lands on it
  if (FROZEN || !started) yS = yT; else { yS += (yT - yS) * (1 - Math.exp(-dt * 11)); if (Math.abs(yT - yS) < 0.3) yS = yT; }
  // a machine that cannot keep up gets fewer pixels, never fewer frames of the move
  if (started && !FROZEN) {
    frames++; if (now - lastNow > 34) slow++;
    if (frames >= 50) { if (slow > 30 && dprCap > 1) { dprCap = Math.max(1, dprCap - 0.5); layout(); } frames = 0; slow = 0; }
  }
  lastNow = now; started = true;
  draw(yS, time(now));
  if (!FROZEN) requestAnimationFrame(frame);
}

function start() {
  layout();
  const yq = parseFloat(qs.get('y'));
  if (!isNaN(yq)) window.scrollTo(0, Math.round(clamp(yq) * maxScroll));
  if (FROZEN) {
    const once = () => { yS = window.scrollY; draw(yS, time(0)); };
    window.addEventListener('scroll', once, { passive: true });
    once();
  } else requestAnimationFrame(frame);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add('ready');
    window.__apart = { ready: true, info: () => (view ? view.info() : null), view };
  }));
}

let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); if (FROZEN) draw(window.scrollY, time(0)); }, 80); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); if (FROZEN) draw(window.scrollY, time(0)); });
if ('scrollRestoration' in history && !isNaN(parseFloat(qs.get('y')))) history.scrollRestoration = 'manual';
start();
