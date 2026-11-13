// The page: the scroll is the camera. Everything drawn is a function of the scroll position and of the time.
//   ?y=0.37     sets the scroll to that share of the page
//   ?still=1    holds the time and draws exactly the frame the scroll asks for (no glide)
//   ?t=12.4     holds the time at that second but leaves the scroll and its glide alive
// With prefers-reduced-motion nothing glides: the page shows still pictures, one to a screen, with a dissolve between.
import { ACT } from './camera.js';
import { mount } from './scene.js';

window.__apartBoot = true;        // the script and what it imports have loaded: the page below can run
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

// Where the browser cannot draw the scene at all, the page is the still picture and the card (css: .flat).
function canDraw() {
  try {
    const c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return true;
  } catch (e) { return false; }
}
let view = null;
if (canDraw()) { try { view = mount($('scene')); } catch (e) { view = null; } }
if (!view) root.classList.add('flat');

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
  { kind: 'chip', piece: 'painting', at: [0, 0.6, 0], title: 'Projects', sub: 'The alcove', wide: [24, 64, 'l'], tall: [-4, -58, 'r'] },
  { kind: 'chip', piece: 'desk', at: [0, 0.3, 0], title: 'The Ledger & Courses', sub: 'The writing desk', wide: [-64, -22, 'r'], tall: [-18, 58, 'l'] },
  { kind: 'chip', piece: 'table', at: [0, 0.6, 0], title: 'Right now', sub: 'The tea table', wide: [36, -72, 'l'], tall: [-30, -50, 'l'] },
  { kind: 'chip', fixed: [0, 5.15, 22], after: 'cabinet', title: 'On your way out', sub: 'The gate', wide: [44, -34, 'l'], tall: [26, 30, 'l'] },
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
const DPR_MAX = 2;
let W = 1, H = 1, trackLen = 1, readLen = 1, maxScroll = 1, dprCap = DPR_MAX, tall = false, stacked = false;
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
const seen = { T: 0, c: 0, y: 0, yCard: 0 };        // what the last frame was drawn from (for the tests)
function setStyle(el, key, val) { if (el['_' + key] !== val) { el['_' + key] = val; el.style[key] = val; } }
const snap = (x) => { const d = window.devicePixelRatio || 1; return Math.round(x * d) / d; };

// Readers who asked for less motion get still pictures, one to a screen: inside the room, the whole house, the
// house half apart, the house apart; and a fifth, the drawing moved over to make room for the card. Beside the
// drawing, the card gets its room the moment its top edge comes into the window, so it never lies over the
// drawing; under the drawing (a phone), when it has come a good third of the way up, so the screen is never
// left half empty. key names the picture.
const STILLS = [0, ACT.apart0, ACT.apart0 + (ACT.apart1 - ACT.apart0) * 0.47, 1];
function stills(y) {
  const s = clamp(y / trackLen), i = s < 0.2 ? 0 : s < 0.4 ? 1 : s < 0.6 ? 2 : 3;
  const c = i === 3 && cardBox.top + (maxScroll - y) < (stacked ? H * 0.62 : H - 6) ? 1 : 0;
  return { T: STILLS[i], c, key: i * 2 + c };
}

// y: where the camera is on the page (it glides after the scroll); yCard: where the page itself is. The card is
// part of the page, so the room the drawing leaves for it follows the page, and the two move as one.
function draw(y, t, yCard) {
  let T = clamp(y / trackLen);
  let c = clamp((yCard - trackLen) / readLen);                            // the card coming up
  if (RM) { const s = stills(yCard); T = s.T; c = s.c; }
  const u = clamp((T - ACT.apart0) / (ACT.apart1 - ACT.apart0));
  // The part of the window the drawing may use: all of it, less a margin, until the card comes; then the drawing
  // makes room, and it goes by where the card's top edge is at this moment, so the two never overlap. Beside the
  // card (a wide window) the drawing starts to move over just before the card shows and is clear of it when the
  // card is a fifth of the way up. Over the card (a phone) the drawing's foot rides on the card's top edge.
  // (On a phone too short to show both, the drawing keeps its place and the card comes up over it like a sheet.)
  const mx = Math.max(14, W * 0.045), my = Math.max(14, H * 0.055);
  safe.x0 = mx; safe.y0 = my; safe.x1 = W - mx; safe.y1 = H - my;
  const cardTop = cardBox.top + (maxScroll - yCard), rest = cardBox.top - 10, room = rest - safe.y0 >= 150;
  let e, close = 0;
  if (RM) e = c;
  else if (!stacked) e = io(clamp((H * 1.15 - cardTop) / (H * 0.3)));
  else if (room) e = clamp((safe.y1 - (cardTop - 10)) / Math.max(1, safe.y1 - rest));
  else e = io(c);
  if (!stacked) safe.x1 += (cardBox.left - 30 - safe.x1) * e;
  else if (room) { safe.y1 += (rest - safe.y1) * e; close = e; }
  if (view) view.render(T, t, safe, FROZEN ? null : sway, close);
  seen.T = T; seen.c = c; seen.y = y; seen.yCard = yCard;

  // the chapter's word, there when you arrive, gone as the camera backs away
  const gone = ss(0.02, 0.085, T), wx = tall ? W * 0.08 : W * 0.33, wy = tall ? H * 0.72 : H * 0.76;
  const wo = (1 - gone).toFixed(3);
  setStyle(word, 'opacity', wo);
  setStyle(word, 'transform', `translate3d(${snap(wx)}px,${snap(wy - word.h / 2 - gone * H * 0.06)}px,0) scale(${(1 + gone * 0.08).toFixed(4)})`);
  setStyle(say, 'opacity', wo);
  setStyle(say, 'transform', `translate3d(${snap(wx + 6)}px,${snap(wy + word.h / 2 + 18 - gone * H * 0.04)}px,0)`);
  setStyle(word, 'visibility', gone >= 1 ? 'hidden' : 'visible');
  setStyle(say, 'visibility', gone >= 1 ? 'hidden' : 'visible');
  setStyle(hint, 'opacity', (1 - ss(0.004, 0.03, T)).toFixed(3));

  // the names: each appears as its piece lifts and rides with it
  if (!view) return;
  NAMES.forEach((n) => {
    const p = view.piece(n.piece || n.after);
    // a tag is a passing caption: it comes with its layer and goes once the layer has settled; a chip stays
    let a = ss(0.25, 0.8, p.k);
    if (n.kind === 'tag') a *= (1 - ss(p.t1 + 0.035, p.t1 + 0.1, u)) * (1 - e);
    else if (stacked) a *= 1 - e;
    let ax = 0, ay = 0;
    if (a > 0.004) {
      if (n.fixed) view.project(n.fixed[0], n.fixed[1], n.fixed[2], pt);
      else { const q = p.obj.position; view.project(q.x + n.at[0], q.y + n.at[1], q.z + n.at[2], pt); }
      ax = pt.x; ay = pt.y;
      // a name whose thing has left the window goes with it
      a *= clamp((ax - 6) / 40) * clamp((W - 6 - ax) / 40) * clamp((ay - 6) / 40) * clamp((H - 6 - ay) / 40);
    }
    if (a <= 0.004) {
      if (n.shown !== false) { n.shown = false; n.el.style.visibility = 'hidden'; n.line.style.visibility = 'hidden'; n.dot.style.visibility = 'hidden'; }
      return;
    }
    if (n.shown !== true) { n.shown = true; n.el.style.visibility = 'visible'; n.line.style.visibility = 'visible'; n.dot.style.visibility = 'visible'; }
    const off = tall ? n.tall : n.wide;
    let jx = ax + off[0];                                          // where the line meets the name
    const jy = ay + off[1];
    let lx = off[2] === 'r' ? jx - n.w - 8 : jx + 8;
    if (lx < 12) { jx += 12 - lx; lx = 12; }                       // never off the window's edge
    if (lx + n.w > W - 12) { jx -= lx + n.w - (W - 12); lx = W - 12 - n.w; }
    // names sit on whole device pixels, so their type is drawn crisp and the same however the page got here
    n.el.style.transform = `translate3d(${snap(lx)}px,${snap(jy - n.h / 2)}px,0)`;
    n.el.style.opacity = a.toFixed(3);
    n.line.setAttribute('x1', ax.toFixed(1)); n.line.setAttribute('y1', ay.toFixed(1));
    n.line.setAttribute('x2', jx.toFixed(1)); n.line.setAttribute('y2', jy.toFixed(1));
    n.line.style.opacity = (a * 0.6).toFixed(3);
    n.dot.setAttribute('cx', ax.toFixed(1)); n.dot.setAttribute('cy', ay.toFixed(1));
    n.dot.style.opacity = a.toFixed(3);
  });
}

// ---------------------------------------------------------------- the pointer
// With a mouse, the camera leans a few degrees toward the pointer once it is outside the house: the drawing turns
// a little under the hand and shows its depth. The lean glides, and comes back to rest when the pointer leaves.
const sway = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
window.addEventListener('pointermove', (ev) => {
  if (ev.pointerType !== 'mouse') return;
  aim.x = clamp(ev.clientX / W, 0, 1) * 2 - 1; aim.y = clamp(ev.clientY / H, 0, 1) * 2 - 1;
}, { passive: true });
root.addEventListener('mouseleave', () => { aim.x = 0; aim.y = 0; });

// ---------------------------------------------------------------- the loop
let yS = 0, lastNow = 0, started = false, movedAt = -1e9, dprMove = DPR_MAX, spent = 0, frames = 0;
function time(now) { return !isNaN(HOLD) ? HOLD : FROZEN ? T_HELD : now / 1000; }
function frame(now) {
  const yT = window.scrollY, gap = now - lastNow, dt = Math.min(1, gap / 1000);
  // A machine that cannot keep up gets fewer pixels while the picture moves, never fewer frames of the move:
  // when forty frames of a move average under 28 a second, the move is drawn half a step coarser. The moment
  // the page comes to rest it is drawn at full sharpness again, so a place looks the same however it was reached.
  if (started && !FROZEN) {
    if (yS !== yT) movedAt = now;
    const rest = now - movedAt > 450, cap = rest ? DPR_MAX : dprMove;
    if (cap !== dprCap) { dprCap = cap; if (view) view.resize(W, H, Math.min(window.devicePixelRatio || 1, dprCap)); }
    if (!rest) {
      frames++; spent += Math.min(100, gap);
      if (frames >= 40) { if (spent / frames > 36 && dprMove > 1) dprMove = Math.max(1, dprMove - 0.5); frames = 0; spent = 0; }
    }
  }
  // the camera glides after the scroll and always arrives: yS chases the true position and lands on it (the
  // glide goes by the clock, so a slow machine arrives as soon as a fast one)
  if (FROZEN || !started) yS = yT; else { yS += (yT - yS) * (1 - Math.exp(-dt * 11)); if (Math.abs(yT - yS) < 0.3) yS = yT; }
  const g = started ? 1 - Math.exp(-dt * 4.5) : 1;
  sway.x += (aim.x - sway.x) * g; sway.y += (aim.y - sway.y) * g;
  if (Math.abs(aim.x - sway.x) < 0.001) sway.x = aim.x;
  if (Math.abs(aim.y - sway.y) < 0.001) sway.y = aim.y;
  lastNow = now; started = true;
  draw(yS, time(now), yT);
  if (!FROZEN) requestAnimationFrame(frame);
}

// Held still (?still=1, or less motion asked for): a frame is drawn when the page has scrolled, not on a clock.
// One still picture gives way to the next by a short dissolve through the night, never by a move.
let shown = -1, cut = 0;
function paint() { yS = window.scrollY; if (RM) shown = stills(yS).key; draw(yS, time(0), yS); }
function once() {
  if (RM && !STILL && shown !== -1 && stills(window.scrollY).key !== shown) {
    if (!cut) { stage.classList.add('cut'); cut = setTimeout(() => { cut = 0; paint(); stage.classList.remove('cut'); }, 170); }
    return;
  }
  paint();
}

function start() {
  layout();
  const yq = parseFloat(qs.get('y'));
  if (!isNaN(yq)) window.scrollTo(0, Math.round(clamp(yq) * maxScroll));
  if (FROZEN) {
    window.addEventListener('scroll', once, { passive: true });
    paint();
  } else requestAnimationFrame(frame);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add('ready');
    window.__apart = {
      ready: true, view, info: () => (view ? view.info() : null),
      state: () => ({ ...seen, sway: { ...sway }, safe: { ...safe }, dprCap, dprMove, W, H, tall, stacked }),
    };
  }));
}

let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); if (FROZEN) paint(); }, 80); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); if (FROZEN) paint(); });
if ('scrollRestoration' in history && !isNaN(parseFloat(qs.get('y')))) history.scrollRestoration = 'manual';
start();
