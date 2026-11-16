// The text version's wide tables (the line-up, the agents) scroll sideways inside themselves on a phone. Each one that
// does becomes a named region a keyboard can scroll (role, label, tabindex), with a fade at the edge (access.css) that
// goes when its end is reached. The words of the label are read from <main data-sideways>.
import { $, $$ } from '../core/dom.js';

const seen = new WeakSet();
export function markWide(on) {
  const label = ($('#ail-main') || document.body).dataset.sideways || '';
  for (const el of new Set($$('main table').map((t) => t.parentElement))) {
    const wide = on && el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX);
    if (!wide) { if (el.hasAttribute('data-sideways')) for (const a of ['data-sideways', 'data-end', 'role', 'aria-label', 'tabindex']) el.removeAttribute(a); continue; }
    el.dataset.sideways = '';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', label);
    el.tabIndex = 0;
    const end = () => el.toggleAttribute('data-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    end();
    if (!seen.has(el)) { seen.add(el); el.addEventListener('scroll', end, { passive: true }); }
  }
}
