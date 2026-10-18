// The page's one popover: definition cards for plain words, provenance cards for the hero's
// numbers, the bot and door cards. One element, reused, appended to <body> (fixed, above the
// panel), so only one is ever open and nothing has to clean up after it.
//
// How it opens depends on the hand that asks:
// - a mouse resting on the trigger (only where (hover: hover) and (pointer: fine) match) opens it
//   after a short delay, and the pointer can cross into the card without it closing;
// - a tap toggles it;
// - keyboard focus opens a tooltip; Enter or Space opens the full card and moves focus inside.
// It closes on Escape (focus goes back to the trigger), a press outside, a scroll of the panel by
// the reader, a resize, or the tab being hidden. A scroll the page makes by itself (the router
// holding a routed chapter in place while the chapters above it mount) moves the card with its
// trigger instead of closing it: a card opened by a route used to vanish on a slow load.
//
// The card lives at the end of <body>, so Tab from inside it would run off the end of the
// document and back to "Skip to content". Tab and Shift+Tab at its edges close it and carry on
// from the trigger, in the page's own order.
import { motion, CSS_EASE } from '../core/motion.js';

const fine = typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };

let el = null;       // the popover element
let cur = null;      // { anchor, kind, pinned, onClose, scrollTop }
let closeT = 0;
let uid = 0;
let refocusing = false; // giving focus back after Escape must not reopen the tooltip
let lastInput = -1e9;    // when the reader last wheeled, touched or pressed a key on the scroller

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const shown = (n) => n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
function tabbables(root) {
  return [...root.querySelectorAll(TABBABLE)].filter((n) => n.tabIndex >= 0 && !n.closest('[hidden], [inert]') && shown(n));
}
// The first control after the trigger in document order (outside the card).
function nextAfter(anchor) {
  for (const n of tabbables(document)) {
    if (el && el.contains(n)) continue;
    if (n === anchor || anchor.contains(n)) continue;
    if (anchor.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING) return n;
  }
  return null;
}

function ensure() {
  if (el) return el;
  el = document.createElement('div');
  el.className = 'st-pop';
  el.hidden = true;
  el.tabIndex = -1;
  el.addEventListener('pointerenter', () => clearTimeout(closeT));
  el.addEventListener('pointerleave', (e) => {
    if (cur && !cur.pinned && e.pointerType === 'mouse') scheduleClose();
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closePop({ refocus: true }); return; }
    if (e.key === 'Tab' && cur) {
      const list = tabbables(el);
      const i = list.indexOf(document.activeElement);
      const atEnd = e.shiftKey ? i <= 0 : i === -1 || i === list.length - 1;
      if (!atEnd) return;
      e.preventDefault();
      const anchor = cur.anchor;
      if (e.shiftKey) { closePop({ refocus: true }); return; }
      const next = nextAfter(anchor);
      closePop();
      (next || anchor).focus();
    }
  });
  el.addEventListener('focusout', (e) => {
    // keyboard focus leaving the card for somewhere else on the page closes it
    if (!cur || cur.kind !== 'card') return;
    const to = e.relatedTarget;
    if (to && !el.contains(to) && to !== cur.anchor) closePop();
  });
  document.body.append(el);

  document.addEventListener('pointerdown', (e) => {
    if (!cur) return;
    if (el.contains(e.target) || cur.anchor.contains(e.target)) return;
    closePop();
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cur) closePop({ refocus: true });
  });
  const root = document.getElementById('panel-scroll');
  // the reader's hand on the scroller: wheel, touch, keys, a press on the scrollbar
  const touched = () => { lastInput = performance.now(); };
  for (const ev of ['wheel', 'touchmove', 'keydown', 'pointerdown']) root?.addEventListener(ev, touched, { passive: true });
  root?.addEventListener('scroll', () => {
    if (!cur || Math.abs(root.scrollTop - cur.scrollTop) <= 24) return;
    if (performance.now() - lastInput < 1000) { closePop(); return; }
    // the page scrolled itself: follow the trigger while it is still in view
    const a = cur.anchor.getBoundingClientRect(), box = root.getBoundingClientRect();
    if (!cur.anchor.isConnected || a.bottom < box.top || a.top > box.bottom) { closePop(); return; }
    cur.scrollTop = root.scrollTop;
    place(cur.anchor, cur.placement);
  }, { passive: true });
  window.addEventListener('resize', () => cur && closePop(), { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden && cur) closePop(); });
  return el;
}

function scheduleClose() {
  clearTimeout(closeT);
  closeT = setTimeout(() => closePop(), 120);
}

function toNode(content) {
  const c = typeof content === 'function' ? content() : content;
  if (c instanceof Node) return c;
  const p = document.createElement('p');
  p.className = 'st-pop-body';
  p.textContent = String(c ?? '');
  return p;
}

function place(anchor, placement) {
  const a = anchor.getBoundingClientRect();
  const root = document.getElementById('panel-scroll');
  const box = root ? root.getBoundingClientRect() : { left: 0, right: innerWidth, top: 0, bottom: innerHeight };
  const vw = document.documentElement.clientWidth;
  const maxW = Math.min(320, vw - 32);
  el.style.maxWidth = maxW + 'px';
  el.style.left = '0px';
  el.style.top = '0px';
  const w = el.offsetWidth, h = el.offsetHeight;
  const minX = Math.max(12, box.left + 12), maxX = Math.min(vw - 12, box.right - 12) - w;
  let x = a.left + a.width / 2 - w / 2;
  x = Math.max(minX, Math.min(maxX, x));
  // The visible page is the scroller's box under the sticky bar (the fixed header and footer sit
  // outside it): a card that hangs over the footer or tucks under the bar is half hidden.
  const bar = document.querySelector('[data-st-bar]');
  const barB = bar && getComputedStyle(bar).position === 'sticky' ? Math.max(box.top, bar.getBoundingClientRect().bottom) : box.top;
  const top = Math.max(12, barB + 8), bottom = Math.min(innerHeight - 12, box.bottom - 12);
  const below = a.bottom + 10, above = a.top - 10 - h;
  const roomBelow = bottom - below >= h;
  const roomAbove = above >= top;
  let y;
  if (roomBelow || roomAbove) {
    if (placement === 'above') y = roomAbove ? above : below;
    else y = roomBelow ? below : above;
  } else {
    // Neither side fits (a tall trigger: the phone frame of the speed figure). Beside it, when the
    // screen is wide enough, so the card covers nothing it explains; else the roomier side, held
    // inside the visible page.
    const right = a.right + 10, left = a.left - 10 - w;
    if (right + w <= Math.min(vw - 12, box.right - 12)) x = right;
    else if (left >= minX) x = left;
    y = x === right || x === left ? a.top + a.height / 2 - h / 2 : (bottom - a.bottom > a.top - top ? below : above);
  }
  y = Math.max(top, Math.min(bottom - h, y));
  if (y < top) y = top; // taller than the page itself: its top stays reachable
  el.style.left = Math.round(x) + 'px';
  el.style.top = Math.round(y) + 'px';
}

/**
 * @param {Element} anchor
 * @param {Node|string|(()=>Node|string)} content
 * @param {{kind?:'card'|'tip', label?:string, placement?:'below'|'above'|'auto', pinned?:boolean, focus?:boolean, onClose?:()=>void}} opts
 */
export function openPop(anchor, content, opts = {}) {
  const { kind = 'card', label = '', placement = 'below', pinned = false, focus = false, onClose = null } = opts;
  ensure();
  clearTimeout(closeT);
  if (cur) closePop({ silent: true });
  el.replaceChildren(toNode(content));
  el.className = 'st-pop st-pop-' + kind;
  el.removeAttribute('aria-label');
  el.removeAttribute('id');
  if (kind === 'card') {
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', label || anchor.textContent.trim().slice(0, 80));
  } else {
    el.setAttribute('role', 'tooltip');
    el.id = 'st-pop-tip-' + ++uid;
    anchor.setAttribute('aria-describedby', el.id);
  }
  el.hidden = false;
  place(anchor, placement);
  const root = document.getElementById('panel-scroll');
  cur = { anchor, kind, pinned, onClose, placement, scrollTop: root ? root.scrollTop : 0 };
  anchor.setAttribute('data-st-pop-open', '');
  if (!motion.reduced && typeof el.animate === 'function') {
    el.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: CSS_EASE.out });
  }
  if (focus && kind === 'card') {
    const first = el.querySelector('a[href], button, [tabindex]:not([tabindex="-1"])');
    (first || el).focus({ preventScroll: true });
  }
  return { close: () => closePop(), el };
}

export function closePop({ refocus = false } = {}) {
  clearTimeout(closeT);
  if (!cur || !el) return;
  const { anchor, kind, onClose } = cur;
  cur = null;
  el.hidden = true;
  el.replaceChildren();
  anchor.removeAttribute('data-st-pop-open');
  if (kind === 'tip') anchor.removeAttribute('aria-describedby');
  try { onClose?.(); } catch (e) { console.error(e); }
  if (refocus && anchor.isConnected) {
    refocusing = true;
    anchor.focus({ preventScroll: true });
    refocusing = false;
  }
}

export const isOpenFor = (anchor) => !!cur && cur.anchor === anchor;

/**
 * Wire a trigger (a <button>) to a popover. Returns an unbind function.
 * @param {HTMLElement} trigger
 * @param {()=>Node|string} contentFn
 */
export function bindPop(trigger, contentFn, opts = {}) {
  const { hover = true, focus = true, tap = true, delay = 120, kind = 'card', label = '', placement = 'below', onClose = null } = opts;
  let openT = 0;
  let lastPointer = '';
  const card = (moveFocus = false, pinned = true) =>
    openPop(trigger, contentFn, { kind, label, placement, pinned, focus: moveFocus, onClose });

  const onEnter = (e) => {
    if (!hover || e.pointerType !== 'mouse' || !fine.matches) return;
    clearTimeout(closeT);
    if (isOpenFor(trigger)) return;
    clearTimeout(openT);
    openT = setTimeout(() => openPop(trigger, contentFn, { kind, label, placement, pinned: false, onClose }), delay);
  };
  const onLeave = (e) => {
    clearTimeout(openT);
    if (e.pointerType !== 'mouse' || !isOpenFor(trigger) || cur.pinned) return;
    scheduleClose();
  };
  const onDown = (e) => { lastPointer = e.pointerType || ''; };
  const onClick = (e) => {
    clearTimeout(openT);
    if (e.detail === 0) {
      // Enter or Space: the full card, with focus inside it
      if (isOpenFor(trigger) && cur.kind === 'card' && cur.pinned) { closePop(); return; }
      card(true, true);
      return;
    }
    if (lastPointer === 'touch' || lastPointer === 'pen') {
      if (!tap) return;
      if (isOpenFor(trigger)) closePop(); else card(false, true);
      return;
    }
    // a mouse click pins the card the hover opened (or opens it), and a second click closes it
    if (isOpenFor(trigger) && cur.pinned) closePop();
    else card(false, true);
  };
  const onFocus = () => {
    if (!focus || refocusing || isOpenFor(trigger)) return;
    let kb = false;
    try { kb = trigger.matches(':focus-visible'); } catch (e) { kb = false; }
    if (kb) openPop(trigger, contentFn, { kind: 'tip', label, placement, pinned: false, onClose });
  };
  const onBlur = (e) => {
    if (!isOpenFor(trigger) || cur.kind !== 'tip') return;
    if (e.relatedTarget && el && el.contains(e.relatedTarget)) return;
    closePop();
  };
  trigger.addEventListener('pointerenter', onEnter);
  trigger.addEventListener('pointerleave', onLeave);
  trigger.addEventListener('pointerdown', onDown);
  trigger.addEventListener('click', onClick);
  trigger.addEventListener('focus', onFocus);
  trigger.addEventListener('blur', onBlur);
  if (kind === 'card') trigger.setAttribute('aria-haspopup', 'dialog');
  return () => {
    clearTimeout(openT);
    trigger.removeEventListener('pointerenter', onEnter);
    trigger.removeEventListener('pointerleave', onLeave);
    trigger.removeEventListener('pointerdown', onDown);
    trigger.removeEventListener('click', onClick);
    trigger.removeEventListener('focus', onFocus);
    trigger.removeEventListener('blur', onBlur);
    if (isOpenFor(trigger)) closePop();
  };
}

// A card body in the house style: an optional title, paragraphs, an optional meta line and links.
// Strings go in through textContent; pass Nodes for anything richer.
export function cardBody({ title, body = [], meta, links = [] } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'st-pop-card';
  if (title) {
    const t = document.createElement('p');
    t.className = 'st-pop-title';
    if (title instanceof Node) t.append(title); else t.textContent = title;
    wrap.append(t);
  }
  for (const b of [].concat(body)) {
    if (b == null) continue;
    if (b instanceof Node) { wrap.append(b); continue; }
    const p = document.createElement('p');
    p.className = 'st-pop-body';
    p.textContent = b;
    wrap.append(p);
  }
  if (meta) {
    const m = document.createElement('p');
    m.className = 'st-pop-meta';
    m.textContent = meta;
    wrap.append(m);
  }
  if (links.length) {
    const row = document.createElement('p');
    row.className = 'st-pop-links';
    for (const l of links) {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      // close after the click has been routed (the router looks for the link inside .st-pop)
      a.addEventListener('click', () => setTimeout(() => closePop(), 0));
      row.append(a);
    }
    wrap.append(row);
  }
  return wrap;
}
