// The leaves door: select exactly "leaves" in the hero's "the leaves change" (a double-click, a long-press) and a
// rolled leaf peels off the word and falls, the page washes to its own ground and /leaves/ opens. It matches only a
// finished selection (no pointer down), so a drag across the word never fires. Stores nothing: where the leaf
// fell rides in the hash, which no server sees. The room: src/pages/leaves/, scripts/leaves/.
import { leaving } from '../lazy.js';

export function bindLeaves() {
  let down = 0, busy = 0;
  const doc = document, on = (type, fn, o) => doc.addEventListener(type, fn, o);
  const add = (css, html = '') => {
    const el = doc.body.appendChild(doc.createElement('div'));
    el.style.cssText = 'position:fixed;' + css;
    el.innerHTML = html;
    return el;
  };
  const check = () => {
    const sel = getSelection();
    if (busy || down || !sel.rangeCount || !/^\s*leaves\s*$/i.test(sel)) return;
    const range = sel.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (!node.closest) node = node.parentElement;
    if (!node.closest('.home-card-hero .home-lede')?.textContent.includes('leaves change')) return;
    busy = 1;
    doc.head.append(Object.assign(doc.createElement('link'), { rel: 'prefetch', href: '/leaves/' }));
    const r = range.getBoundingClientRect(), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x = r.left + r.width / 2, y = r.bottom - 4, fill = 'both';
    sel.removeAllRanges();
    const scrim = add('inset:0;z-index:98;background:var(--pc-page)');
    scrim.animate({ opacity: [0, 1] }, { delay: still ? 0 : 150, duration: still ? 200 : 550, easing: 'cubic-bezier(.4,0,.2,1)', fill });
    // a 120 ms peel (a lift and a 20 degree twist), then a sway down about 60 px
    const leaf = still ? scrim : add(`left:${x - 4.5}px;top:${y - 4.5}px;z-index:99`,
      '<svg width=9 height=9><path d="M1 7C2 4 5 2 8.4 1.3 7.5 4.5 5 7 1 7Z" fill=#7FA04A /></svg>');
    if (!still) {
      leaf.animate([{}, ...[0, 0.35, 0.7, 1].map((k) => ({ offset: 0.146 + 0.854 * k,
        transform: `translate(${Math.sin(k * 9) * 6 * (1 - k) + 4 * k}px,${k ? k * 56 : -5}px) rotate(${20 + Math.sin(k * 9) * 18}deg)` }))],
      { duration: 820, fill });
    }
    setTimeout(() => leaving() || location.assign(`/leaves/#from=${((x + 4) / innerWidth).toFixed(3)},${((y + 50) / innerHeight).toFixed(3)}`), still ? 220 : 720);
    // the next pageshow is Back restoring this page from the cache: take the scrim and the leaf away
    addEventListener('pageshow', () => { scrim.remove(); leaf.remove(); busy = 0; }, { once: true });
  };
  const opt = { passive: true, capture: true };
  on('selectionchange', () => down || check());
  on('pointerdown', () => { down = 1; }, opt);
  for (const type of ['pointerup', 'pointercancel']) on(type, () => { down = 0; check(); }, opt);
  on('keyup', check);
}
