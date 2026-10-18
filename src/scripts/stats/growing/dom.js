// Small DOM helpers shared by the two growing charts: element builders, the little SVG chevrons
// that stand in for arrows (no Unicode symbols are ever drawn as text on this page), the post
// marks under an axis, and the scrub-and-keys behaviour both plots use.

import { motion as coreMotion, tween, EASE } from '../core/motion.js';
import { idList, clusterMarks } from './calc.js';

const SVGNS = 'http://www.w3.org/2000/svg';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid);
  return el;
}

export function s(tag, attrs = {}) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v));
  return el;
}

/** A small chevron, drawn: 'up' for "back to the gate", 'down' for "sorted below". */
export function chevron(dir = 'down', size = 10) {
  const svg = s('svg', { width: size, height: size, viewBox: '0 0 10 10', 'aria-hidden': 'true', class: 'st-grow-chev', focusable: 'false' });
  svg.append(s('path', { d: dir === 'up' ? 'M2 6.5 5 3.5 8 6.5' : 'M2 3.5 5 6.5 8 3.5', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return svg;
}

/** A pressed-state pill. */
export function pill(label, { pressed, cls = '' } = {}) {
  const b = h('button', { type: 'button', class: ('st-pill st-grow-pill ' + cls).trim() });
  if (pressed != null) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  if (typeof label === 'string') b.textContent = label; else b.append(label);
  return b;
}

export const finePointer = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * The post marks under an axis, as real links laid over the SVG. On a mouse they are the site's
 * own hover card (ledger-preview.js claims every /ledger/<slug>/ link), so pointing at a dot
 * shows the post. They're out of the tab order and hidden from screen readers: the readout above
 * the plot names the same post with a proper link, reached with the arrow keys.
 * Marks that would touch are merged into one ring first (clusterMarks), and [lo, hi] keeps the
 * last one from hanging past the plot.
 * @param {HTMLElement} layer  absolutely positioned over the plot
 * @param {{x:number, y:number, posts:{id,slug,title}[]}[]} marks
 * @param {number} lo  @param {number} hi  the plot's left and right edges, in px
 */
export function drawPostMarks(layer, marks, lo, hi) {
  layer.textContent = '';
  // the hit box is 14px wide, so its centre stays 7px inside each edge
  for (const m of clusterMarks(marks, 9, lo + 7, hi - 7)) {
    const p = m.posts[0];
    const a = h('a', {
      href: `/ledger/${p.slug}/`,
      class: 'st-grow-post' + (m.posts.length > 1 ? ' is-many' : ''),
      tabindex: '-1',
      'aria-hidden': 'true',
      'data-d': m.d,
    });
    a.style.left = m.x + 'px';
    a.style.top = m.y + 'px';
    a.append(h('span', { class: 'st-grow-post-dot' }));
    layer.append(a);
  }
}

/**
 * Pointer and keyboard on a plot. The whole band of a column is its hit area, a horizontal
 * drag scrubs (touch-action: pan-y keeps vertical page scroll for the finger), and a tap or
 * click that didn't travel is a pick.
 * @param {HTMLElement} plot   the focusable chart group
 * @param {{indexAt:(clientX:number)=>number, count:()=>number, onCursor:(i:number, src:string)=>void,
 *          onPick?:(i:number, src:string)=>void, onKey?:(e:KeyboardEvent, i:number)=>boolean,
 *          cursor:()=>number, onLeave?:()=>void}} o
 */
export function bindScrub(plot, o) {
  let down = null;
  const onDown = (e) => {
    if (e.button && e.button !== 0) return;
    // a post link under a fine pointer keeps its own click (it opens the post)
    if (e.target.closest && e.target.closest('a')) return;
    down = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    const i = o.indexAt(e.clientX);
    if (i >= 0) o.onCursor(i, e.pointerType || 'mouse');
  };
  const onMove = (e) => {
    if (down && down.id === e.pointerId && Math.abs(e.clientX - down.x) > 6) down.moved = true;
    // a mouse moves the readout just by passing over; a finger only while it is down
    if (e.pointerType !== 'mouse' && !down) return;
    const i = o.indexAt(e.clientX);
    if (i >= 0) o.onCursor(i, e.pointerType || 'mouse');
  };
  const onUp = (e) => {
    if (!down || down.id !== e.pointerId) return;
    const moved = down.moved || Math.abs(e.clientY - down.y) > 10;
    down = null;
    if (moved || !o.onPick) return;
    const i = o.indexAt(e.clientX);
    if (i >= 0) o.onPick(i, e.pointerType || 'mouse');
  };
  const onCancel = () => { down = null; };
  const onLeave = (e) => { if (e.pointerType === 'mouse') o.onLeave?.(); };
  const onKey = (e) => {
    const n = o.count();
    if (!n) return;
    let i = o.cursor();
    if (o.onKey && o.onKey(e, i)) { e.preventDefault(); return; }
    if (e.key === 'ArrowLeft') i = Math.max(0, i - 1);
    else if (e.key === 'ArrowRight') i = Math.min(n - 1, i + 1);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    o.onCursor(i, 'key');
  };
  plot.addEventListener('pointerdown', onDown);
  plot.addEventListener('pointermove', onMove);
  plot.addEventListener('pointerup', onUp);
  plot.addEventListener('pointercancel', onCancel);
  plot.addEventListener('pointerleave', onLeave);
  plot.addEventListener('keydown', onKey);
  return () => {
    plot.removeEventListener('pointerdown', onDown);
    plot.removeEventListener('pointermove', onMove);
    plot.removeEventListener('pointerup', onUp);
    plot.removeEventListener('pointercancel', onCancel);
    plot.removeEventListener('pointerleave', onLeave);
    plot.removeEventListener('keydown', onKey);
  };
}

/** Ticks for a 0-based axis: whichever of 3 or 4 nice ticks wastes less of the plot. */
export function axisTicks(niceTicks, max) {
  const a = niceTicks(max, 3), b = niceTicks(max, 4);
  return b[b.length - 1] < a[a.length - 1] ? b : a;
}

/** Calls fn once per frame at most, with the latest arguments. */
export function rafThrottle(fn) {
  let id = 0, args = null;
  return (...a) => {
    args = a;
    if (id) return;
    id = requestAnimationFrame(() => { id = 0; fn(...args); });
  };
}

/**
 * A readout as the chapter's live region should say it: the middle dots become commas and a
 * number range's dash becomes "to", so a screen reader doesn't read glyphs ("people 56 to 102").
 */
export const spoken = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim()
  .replace(/\s*·\s*/g, ', ').replace(/(\d)\s*[–—]\s*(?=[~\d])/g, '$1 to ');

/**
 * Motion for the growing charts: the live reduced-motion flag (ctx.motion, the shared motion
 * object) plus the tween and easing curves from core/motion.js, which every package may import.
 */
export function motionOf(ctx) {
  const live = ctx.motion || coreMotion;
  return {
    get reduced() { return !!live.reduced; },
    onChange: (fn) => (live.onChange ? live.onChange(fn) : () => {}),
    tween,
    EASE,
  };
}

/** ' · AO-029 went up', with real links (the site's hover card) for one or two posts. */
export function appendPosts(el, posts) {
  if (!posts || !posts.length) return;
  el.append(' · ');
  if (posts.length > 2) { el.append(`${idList(posts)} went up`); return; }
  posts.forEach((p, j) => {
    if (j) el.append(' and ');
    const a = h('a', { href: `/ledger/${p.slug}/`, text: p.id });
    a.title = p.title;
    el.append(a);
  });
  el.append(' went up');
}
