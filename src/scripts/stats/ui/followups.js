// "Next questions" under a chapter's answer: up to three hash links, so the router takes them
// (keeping the reader's range) and Back undoes them.
import { arrowSVG } from './glyph.js';

/** @param {HTMLElement} el @param {Array<{label:string, href:string}>} items */
export function followups(el, items) {
  if (!el) return;
  const list = (items || []).filter((x) => x && x.label && x.href).slice(0, 3);
  el.replaceChildren(...list.map((it) => {
    const a = document.createElement('a');
    a.className = 'st-follow-link';
    a.href = it.href;
    const t = document.createElement('span');
    t.textContent = it.label;
    a.append(arrowSVG('right'), t);
    return a;
  }));
  el.hidden = list.length === 0;
}
