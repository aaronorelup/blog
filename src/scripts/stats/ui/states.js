// What the page says when there are no numbers to show: before the first filing, while the
// backfill is still running, when the network or the Worker failed, or when the filing has a
// shape this page doesn't know. Warm, short, never an error message in red. The H1 and the
// four-question list in "How was this counted?" stay; the chapters that need numbers hide.
// DESIGN.md §A.5 is the copy.
import { motion } from '../core/motion.js';

const AO057 = '/ledger/who-visits-a-new-website/';

function lede(parts) {
  const el = document.querySelector('[data-st-lede]');
  if (!el) return null;
  el.classList.remove('is-loading');
  el.classList.add('st-state-lede');
  el.replaceChildren(...parts.map((p) => {
    if (typeof p === 'string') return document.createTextNode(p);
    if (p.b) { const s = document.createElement('strong'); s.textContent = p.b; return s; }
    if (p.link) { const a = document.createElement('a'); a.href = p.link; a.textContent = p.label; return a; }
    return p;
  }));
  return el;
}

// The gate with nobody on it. It is the hero's own scenery (hero/gate-art.js and its layout), drawn
// for a filing with no pages, so a visitor before the first filing sees the same torii, lanterns
// and doorway they will see later, and a phone gets the same rail with its four questions. This
// file is only loaded when there is a failure to show, so the art costs nothing otherwise.
const STATIONS = [['Badge?', 'Named bots'], ['Wrong door?', 'Scanners'], ['A program?', 'Scripts & agents'], ['Old browser?', 'Old browsers'], ['Everyone left', 'People']];
const PAL_VARS = { page: '--pc-page', bg: '--pc-bg', line: '--pc-line', line2: '--pc-line2', quiet: '--pc-quiet', head: '--pc-head', accent: '--pc-accent' };
let drawn = null;
async function emptyGate() {
  const gate = document.querySelector('[data-st-gate]');
  if (!gate) return;
  let art, lay;
  try { [art, lay] = await Promise.all([import('../hero/gate-art.js'), import('../hero/gate-layout.js')]); }
  catch (e) { gate.replaceChildren(); gate.style.height = '0px'; return; }
  const wrap = document.createElement('div');
  wrap.className = 'st-empty-gate';
  wrap.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  wrap.append(canvas);
  gate.replaceChildren(wrap);
  const draw = () => {
    const W = Math.max(240, Math.floor(gate.clientWidth || 320));
    const geo = lay.layout(W, [0, 0, 0, 0, 0]);
    const cs = getComputedStyle(gate);
    const pal = { mode: document.documentElement.dataset.mode === 'day' ? 'day' : 'night' };
    for (const [k, v] of Object.entries(PAL_VARS)) pal[k] = cs.getPropertyValue(v).trim();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(geo.H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = geo.H + 'px';
    gate.style.height = geo.H + 'px';
    const g = canvas.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, geo.H);
    art.drawArt(g, geo, pal, 1);
    // the rail carries its questions and pile names in the DOM, as the live gate does
    wrap.querySelectorAll('.st-empty-label').forEach((n) => n.remove());
    if (geo.tall) {
      geo.piles.forEach((pl, k) => {
        const p = document.createElement('p');
        p.className = 'st-empty-label';
        p.style.top = pl.y + 'px';
        const b = document.createElement('b');
        b.textContent = STATIONS[k][1];
        p.append(STATIONS[k][0], b);
        wrap.append(p);
      });
    }
  };
  draw();
  drawn?.disconnect?.();
  if (typeof ResizeObserver === 'function') {
    let w = gate.clientWidth;
    drawn = new ResizeObserver(() => { if (gate.clientWidth !== w) { w = gate.clientWidth; draw(); } });
    drawn.observe(gate);
  }
  drawn = drawn || {};
  drawn.redraw = draw;
}
// day and night redraw it
if (typeof MutationObserver === 'function') {
  new MutationObserver(() => drawn?.redraw?.()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
}

function hideChapters() {
  for (const key of ['machines', 'growing', 'people', 'rhythm']) {
    const s = document.getElementById('st-' + key);
    if (s) s.hidden = true;
  }
  for (const slot of document.querySelectorAll('[data-st-slot], [data-st-drawer]')) slot.hidden = true;
}

function disableBar() {
  const bar = document.querySelector('[data-st-bar]');
  if (!bar) return;
  bar.setAttribute('aria-disabled', 'true');
  for (const b of bar.querySelectorAll('button')) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
}

function leaves() {
  const s = document.createElement('span');
  s.className = 'st-leaves';
  s.setAttribute('aria-hidden', 'true');
  s.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
  return s;
}

export function showLoading() {
  const el = document.querySelector('[data-st-lede]');
  if (!el) return;
  el.classList.add('is-loading');
  el.textContent = 'Sorting the latest filing…';
  const eyebrow = document.querySelector('[data-st-eyebrow]');
  if (eyebrow) eyebrow.textContent = 'TRAFFIC · FILED DAILY';
}

/**
 * @param {{state:string, message?:string}} loaded
 * @param {{onRetry?:()=>void}} hooks
 */
export function showState(loaded, { onRetry } = {}) {
  // a retry that failed again says so in the same place: one Try again, never a stack of them.
  // A reader who pressed it keeps their place: focus goes to the new pill (or, for an answer
  // with no pill, to the sentence that says what happened), never to <body>.
  const hadFocus = !!document.activeElement?.closest?.('.st-state-actions');
  document.querySelectorAll('.st-state-actions').forEach((n) => n.remove());
  disableBar();
  hideChapters();
  const sub = document.querySelector('[data-st-sub]');
  if (sub) sub.replaceChildren();
  const eyebrow = document.querySelector('[data-st-eyebrow]');
  if (eyebrow) eyebrow.textContent = 'TRAFFIC · FILED DAILY';
  switch (loaded.state) {
    case 'gathering': {
      const el = lede([{ b: 'Still gathering the numbers' }, ', about a day a minute. Give it an hour and the month will be here.']);
      el?.append(leaves());
      emptyGate();
      break;
    }
    case 'unknown-version':
      lede([{ b: "The numbers changed shape, and this page hasn't caught up yet." }, ' ', { link: AO057, label: 'AO-057' }, ' has the October version.']);
      emptyGate();
      break;
    case 'error':
    case 'offline': {
      const el = lede([{ b: "Couldn't reach the numbers just now." }, " They're still there; try again in a moment."]);
      if (el && onRetry) {
        const wrap = document.createElement('p');
        wrap.className = 'st-state-actions';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'st-pill';
        b.textContent = 'Try again';
        retryPill(b, onRetry);
        wrap.append(b);
        el.after(wrap);
      }
      emptyGate();
      break;
    }
    default: // not-connected
      lede([{ b: "The numbers aren't connected yet." }, " Cloudflare has been counting since August; this page starts showing it after its first nightly filing. Meanwhile, ", { link: AO057, label: 'AO-057' }, " has October's."]);
      emptyGate();
      break;
  }
  if (motion.reduced) document.querySelectorAll('.st-leaves i').forEach((i) => { i.style.animation = 'none'; });
  if (hadFocus) {
    const to = document.querySelector('.st-state-actions button') || document.querySelector('[data-st-lede]');
    if (to) {
      if (!to.matches('button') && !to.hasAttribute('tabindex')) to.setAttribute('tabindex', '-1');
      to.focus({ preventScroll: true });
    }
  }
}

/**
 * The Try again pill's press. It stays focusable while trying (aria-disabled, not disabled: a
 * focused button that is disabled drops focus to <body>), and a second press meanwhile is ignored.
 * main.js has the same few lines for the plain fallback, which can't import this chunk.
 */
export function retryPill(b, onRetry) {
  b.addEventListener('click', () => {
    if (b.getAttribute('aria-disabled') === 'true') return;
    b.setAttribute('aria-disabled', 'true');
    b.textContent = 'Trying…';
    onRetry();
  });
}

/** Undo a failure state before a retry succeeds and the page boots for real. */
export function clearState() {
  document.querySelector('.st-state-actions')?.remove();
  drawn?.disconnect?.();
  drawn = null;
  const gate = document.querySelector('[data-st-gate]');
  if (gate) { gate.replaceChildren(); gate.style.height = ''; gate.style.maxHeight = ''; }
  for (const key of ['machines', 'growing', 'people', 'rhythm']) {
    const s = document.getElementById('st-' + key);
    if (s) s.hidden = false;
  }
  for (const slot of document.querySelectorAll('[data-st-slot], [data-st-drawer]')) slot.hidden = false;
  const bar = document.querySelector('[data-st-bar]');
  bar?.removeAttribute('aria-disabled');
  document.querySelector('[data-st-lede]')?.classList.remove('st-state-lede');
}
