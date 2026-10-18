// A drawer that opens in place under whatever opened it (the hero's piles): the height grows from
// nothing with a grid-rows transition, so no measuring, and the content fades in after. One per
// host; opening another key swaps the content without closing first. Escape closes it and gives
// focus back to the opener.
import { motion, CSS_EASE } from '../core/motion.js';

let uid = 0;

export function createDrawer(host) {
  host.classList.add('st-drawer');
  if (!host.id) host.id = 'st-drawer-' + ++uid;
  const inner = document.createElement('div');
  inner.className = 'st-drawer-inner';
  const body = document.createElement('div');
  body.className = 'st-drawer-body';
  inner.append(body);
  host.replaceChildren(inner);
  host.dataset.open = 'false';

  let current = null, opener = null, closeT = 0;

  function setOpener(next) {
    if (opener && opener !== next) opener.setAttribute('aria-expanded', 'false');
    opener = next || null;
    if (opener) { opener.setAttribute('aria-expanded', 'true'); opener.setAttribute('aria-controls', host.id); }
  }

  function open(key, node, by) {
    clearTimeout(closeT);
    const swapping = current != null;
    current = key;
    setOpener(by);
    body.replaceChildren(node);
    host.dataset.open = 'true';
    host.dataset.key = key;
    if (!motion.reduced && typeof body.animate === 'function') {
      body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: swapping ? 0 : 120, easing: CSS_EASE.out, fill: 'backwards' });
    }
  }

  function close({ refocus = false } = {}) {
    if (current == null) return;
    const by = opener;
    current = null;
    host.dataset.open = 'false';
    delete host.dataset.key;
    if (by) by.setAttribute('aria-expanded', 'false');
    opener = null;
    clearTimeout(closeT);
    // empty the body once the height has gone, so nothing hidden stays focusable
    closeT = setTimeout(() => { if (current == null) body.replaceChildren(); }, motion.reduced ? 0 : 300);
    // no preventScroll: a reader deep in a long drawer would get focus on an opener scrolled out
    // of sight; the scroller's scroll-padding keeps it clear of the sticky bar
    if (refocus && by?.isConnected) by.focus();
  }

  host.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current != null) { e.stopPropagation(); close({ refocus: true }); }
  });

  return {
    open,
    close,
    toggle(key, makeNode, by) {
      if (current === key) { close(); return false; }
      open(key, typeof makeNode === 'function' ? makeNode() : makeNode, by);
      return true;
    },
    get current() { return current; },
    get opener() { return opener; },
  };
}
