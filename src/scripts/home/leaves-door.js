// The leaves door: select exactly "leaves" in the hero's "the leaves change" (a double-click, a long-press) and a
// leaf peels off the word, lifts toward the guest as the page washes to its own ground, and /leaves/ opens with the
// leaf where it hung (#from=x,y,angle,size), where the room picks it up and lets it fall into the tea. It matches
// only a finished selection (no pointer down), so a drag across the word never fires; a press on the word itself
// already asks for the room's page. Stores nothing: the hash never reaches a server. The room: src/pages/leaves/,
// scripts/leaves/.
import { leaving } from '../lazy.js';
import { LEAF, handoffSize } from '../../data/leaf.js';

const S0 = 15;                     // the leaf as it peels off the 17 px line, in px
const LEDE = '.home-card-hero .home-lede';

export function bindLeaves() {
  let down = 0, busy = 0, asked = 0;
  const doc = document, on = (type, fn, o) => doc.addEventListener(type, fn, o);
  const add = (css, html = '') => {
    const el = doc.body.appendChild(doc.createElement('div'));
    el.style.cssText = 'position:fixed;' + css;
    el.innerHTML = html;
    return el;
  };
  const prefetch = () => {
    if (asked) return;
    asked = 1;
    doc.head.append(Object.assign(doc.createElement('link'), { rel: 'prefetch', href: '/leaves/' }));
  };
  // A press on the word itself: the first half of a double-click, so the page is on its way before the second.
  const pressed = (e) => {
    const lede = e.target.closest?.(LEDE);
    if (!lede || !lede.textContent.includes('leaves change')) return;
    const at = doc.caretRangeFromPoint?.(e.clientX, e.clientY) || doc.caretPositionFromPoint?.(e.clientX, e.clientY);
    const node = at && (at.startContainer || at.offsetNode), i = at && (at.startOffset ?? at.offset);
    if (!node || node.nodeType !== 3) return;
    const before = node.data.slice(0, i).match(/\w*$/)[0], after = node.data.slice(i).match(/^\w*/)[0];
    if ((before + after).toLowerCase() === 'leaves') prefetch();
  };
  const check = () => {
    const sel = getSelection();
    if (busy || down || !sel.rangeCount || !/^\s*leaves\s*$/i.test(sel)) return;
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (!node.closest) node = node.parentElement;
    if (!node.closest(LEDE)?.textContent.includes('leaves change')) return;
    busy = 1;
    prefetch();
    const r = range.getBoundingClientRect(), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x = r.left + r.width / 2, y = r.bottom - 5, fill = 'both', ease = 'cubic-bezier(.4,0,.2,1)';
    sel.removeAllRanges();
    const scrim = add('inset:0;z-index:98;background:var(--pc-page)');
    scrim.animate({ opacity: [0, 1] }, { duration: still ? 200 : 350, easing: ease, fill });
    let from = '', leaf = scrim;
    if (!still) {
      // a 15 px leaf on the line; it peels (a lift and a twist), sways, and grows as it lifts toward the guest
      const size = handoffSize(innerWidth, innerHeight), g = size / S0, dx = 3, dy = 30, turn = 16;
      leaf = add(`left:${x - 0.6 * S0}px;top:${y - 0.3 * S0}px;z-index:99;width:${1.2 * S0}px;height:${0.6 * S0}px`,
        `<svg width="${1.2 * S0}" height="${0.6 * S0}" viewBox="${LEAF.view}" style="display:block;overflow:visible;transform-origin:50% 50%">`
        + `<path d="${LEAF.body}" fill="${LEAF.fill}" stroke="${LEAF.edge}" stroke-width="${LEAF.line}"/>`
        + `<path d="${LEAF.veins}" fill="none" stroke="${LEAF.vein}" stroke-width="${LEAF.line * 0.9}" stroke-linecap="round"/></svg>`);
      const dark = doc.documentElement.dataset.mode === 'day' ? '70,45,30' : '8,6,14';
      leaf.animate({ filter: [`drop-shadow(0.5px 1px 0.5px rgba(${dark},.4))`, `drop-shadow(10px 14px 7px rgba(${dark},.32))`] },
        { duration: 600, easing: ease, fill });
      leaf.firstChild.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)' },
        { offset: 0.18, transform: 'translate(2px,-8px) rotate(-14deg) scale(1.3)' },
        { offset: 0.5, transform: `translate(-5px,${dy * 0.3}px) rotate(9deg) scale(${1 + (g - 1) * 0.55})` },
        { offset: 0.78, transform: `translate(6px,${dy * 0.75}px) rotate(${turn + 10}deg) scale(${1 + (g - 1) * 0.88})` },
        { transform: `translate(${dx}px,${dy}px) rotate(${turn}deg) scale(${g})` },
      ], { duration: 600, easing: 'cubic-bezier(.3,0,.3,1)', fill });
      from = `${((x + dx) / innerWidth).toFixed(4)},${((y + dy) / innerHeight).toFixed(4)},${turn},${size}`;
    }
    setTimeout(() => leaving() || location.assign(`/leaves/${from ? '#from=' + from : ''}`), still ? 220 : 580);
    // the next pageshow is Back restoring this page from the cache: take the scrim and the leaf away
    addEventListener('pageshow', () => { scrim.remove(); leaf.remove(); busy = 0; }, { once: true });
  };
  const opt = { passive: true, capture: true };
  on('selectionchange', () => down || check());
  on('pointerdown', (e) => { down = 1; pressed(e); }, opt);
  for (const type of ['pointerup', 'pointercancel']) on(type, () => { down = 0; check(); }, opt);
  on('keyup', check);
}
