// Ranked rows for the machines shelves, on top of the page's shared ui/bars.js, so a company in
// the library looks exactly like a post in the reading list. This file adds what the shelves
// need on top of it:
// - a row that opens in place (a company into its bots), one open at a time, kept open when the
//   list redraws for "Show all";
// - folded remainders ("Other named bots", "Other programs") said as a quiet line under the
//   list rather than drawn as a bar, because they aren't one thing and can't be opened;
// - the bars pouring in from the left the first time a shelf is shown.
import { h, animate } from './dom.js';

/**
 * @param {HTMLElement} host
 * @param {{ ranked:Function, rows:{key,label,sub?,value,display?,meta?,partial?,folded?,tag?}[], color:string,
 *   label:string, unit:string, num:(n)=>string, top?:number, open?:(row)=>Node, reduced?:()=>boolean,
 *   onOpen?:(key:string|null)=>void }} opts
 */
export function rankRows(host, opts) {
  let o = opts;
  let openKey = null;
  const listHost = h('div', { class: 'st-mach-list' });
  const otherLine = h('p', { class: 'st-mach-otherline', hidden: true });
  host.append(listHost, otherLine);

  const split = () => {
    const rows = o.rows || [];
    return { live: rows.filter((r) => !r.folded), folded: rows.filter((r) => r.folded) };
  };
  const toBar = (r) => ({
    key: r.key, value: r.value, display: r.display, meta: r.meta, partial: r.partial, sub: r.sub,
    label: r.tag ? h('span', { class: 'st-mach-name' }, h('span', null, r.label), h('span', { class: 'st-mach-tag' }, r.tag)) : r.label,
    _row: r,
  });

  const bars = o.ranked(listHost, {
    rows: split().live.map(toBar), color: o.color, unit: o.unit, label: o.label, top: o.top || 10,
    onSelect: o.open ? (row, li) => toggle(row.key, li) : undefined,
  });

  function drawOther() {
    const { folded } = split();
    otherLine.hidden = !folded.length;
    otherLine.textContent = folded.map((r) => `${r.label}: ${r.partial ? 'at least ' : ''}${o.num(r.value)}${r.meta ? ' ' + r.meta : ''}`).join(' · ');
  }

  const liOf = (key) => [...listHost.querySelectorAll('li.st-bars-row')].find((li) => li.dataset.key === key) || null;

  function setOpen(li, on) {
    if (!li) return;
    const slot = li.querySelector('.st-bars-more');
    const hit = li.querySelector('.st-bars-hit');
    li.classList.toggle('is-open', on);
    if (hit) hit.setAttribute('aria-expanded', String(on));
    if (!slot) return;
    if (on) {
      const row = split().live.find((r) => r.key === li.dataset.key);
      slot.replaceChildren(row && o.open ? o.open(row) : '');
      slot.hidden = false;
    } else {
      slot.hidden = true;
      slot.replaceChildren();
    }
  }

  function toggle(key, li) {
    const was = openKey;
    if (was && was !== key) setOpen(liOf(was), false);
    openKey = was === key ? null : key;
    setOpen(li || liOf(key), openKey === key);
    if (openKey === key) {
      const slot = (li || liOf(key))?.querySelector('.st-bars-more');
      animate(slot, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(0,0,.2,1)' }, o.reduced && o.reduced());
    }
    if (o.onOpen) o.onOpen(openKey);
  }

  // "Show all" and "Show fewer" redraw the list; put the open row back as it was
  listHost.addEventListener('click', (e) => {
    if (!e.target.closest('.st-bars-all')) return;
    queueMicrotask(() => { if (openKey) setOpen(liOf(openKey), true); });
  });

  // The bars pour in from the left when a shelf is first shown: the ranking forms as the eye
  // reads it. Nothing moves under reduced motion.
  function grow() {
    const reduced = o.reduced && o.reduced();
    listHost.querySelectorAll('.st-bars-bar').forEach((b, i) => {
      b.style.transformOrigin = 'left center';
      animate(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 500, delay: Math.min(i, 12) * 22, easing: 'cubic-bezier(0,0,.2,1)', fill: 'backwards' }, reduced);
    });
  }

  drawOther();
  return {
    update(next, { grow: g = false, keepOpen = true } = {}) {
      o = { ...o, ...next };
      const live = split().live;
      if (!keepOpen || !live.some((r) => r.key === openKey)) openKey = null;
      bars.update({ rows: live.map(toBar) });
      drawOther();
      if (openKey) setOpen(liOf(openKey), true);
      if (g) grow();
    },
    grow,
    // open one row (from a route), put focus on it, and hand back its element
    open(key) {
      if (openKey === key) return liOf(key);
      if (!split().live.some((r) => r.key === key)) return null;
      return bars.expand(key);
    },
    get openKey() { return openKey; },
    destroy() { bars.destroy(); host.replaceChildren(); },
  };
}
