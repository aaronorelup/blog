// The scene's cards (the sections of index.astro) and the staged page: no scrollbar, every section laid over the
// window and one shown at a time (enableStage), and back to the plain document (disableStage). cardState shows a
// card at an opacity, shifted and squashed; an unseen card leaves the tab order and the hit test (inert).
import { showRail, syncRail } from './rail.js';

// The sections in staged form, their document-flow styling kept so disableStage can put it back.
export function enableStage(s) {
  const html = document.documentElement, body = document.body;
  s.restore = { h: html.style.overflow, b: body.style.overflow, m: s.main.getAttribute('style') };
  scrollTo(0, 0);
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  s.main.style.cssText = 'position:fixed;inset:0;margin:0;z-index:1;display:block';
  s.cards.forEach(c => {
    // remember the document-flow styling; disableStage() has to put it back or
    // the flat fallback stacks every section on top of the first one
    if (c.el._stage0 === undefined) c.el._stage0 = c.el.getAttribute('style');
    c.el.style.position = 'absolute';
    c.el.style.inset = '0';
    c.el.style.minHeight = '0';
  });
  s.spacer.style.display = 'none';
  showRail(s, true);
  s.stopIdx = 0;
  s.cards.forEach((c, i) => cardState(c.el, i === 0 ? 1 : 0, 0, 0));
  syncRail(s);
}

export function disableStage(s) {
  if (!s.restore) return;
  document.documentElement.style.overflow = s.restore.h;
  document.body.style.overflow = s.restore.b;
  if (s.restore.m) s.main.setAttribute('style', s.restore.m);
  else s.main.removeAttribute('style');
  s.cards.forEach(c => {
    if (c.el._stage0 === undefined) return;
    if (c.el._stage0 === null) c.el.removeAttribute('style');
    else c.el.setAttribute('style', c.el._stage0);
    c.el._stage0 = undefined;
    c.el._o = c.el._s = undefined;     // cardState's cache is now stale
  });
  s.spacer.style.display = '';
  showRail(s, false);
  s.restore = null;
}

export function cardState(el, opacity, shift, squash) {
  const o = Math.max(0, Math.min(1, opacity)).toFixed(3);
  if (el._o === o && el._s === shift) return;
  el._o = o; el._s = shift;
  el.style.opacity = o;
  el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(' + (1 - (squash || 0)).toFixed(4) + ')';
  // an unseen card must also leave the tab order — there is no scrolling to it
  const off = opacity <= 0.5;
  if (el._off !== off) {
    el._off = off;
    el.inert = off;
    if (off) el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  }
}

// Reduced mode used to read getBoundingClientRect for every card on every
// frame, which is a forced layout per card per frame even when nothing moved.
// The offsets only change on resize, so they are cached here instead.
export function measureCards(s) {
  s.cardTops = s.cards.map(c => c.el.getBoundingClientRect().top + scrollY);
}
