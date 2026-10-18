// Ranked bars: the page's workhorse list (companies, programs, doors, posts, countries). One
// shared scale per list, bars with no track behind them, the number at the end of each, and a
// "Show all" when there are more than fit. Rows are 44px or taller so a thumb can hit them.
//
// When the caller passes onSelect, each row gets a full-row button (behind the row's content, so
// a title link inside the label stays a real link) and an empty `.st-bars-more` slot under it the
// caller can fill. aria-expanded on that button is the caller's to set.
import { num, pct } from '../core/fmt.js';

let uid = 0;

function cell(cls, content) {
  const d = document.createElement('span');
  d.className = cls;
  if (content instanceof Node) d.append(content);
  else if (content != null) d.textContent = String(content);
  return d;
}

/**
 * @param {HTMLElement} el
 * @param {{rows:Array<{key:string,label:string|Node,sub?:string|Node,value:number,partial?:boolean,display?:string,meta?:string}>,
 *   color:string, unit:string, max?:number, top?:number, total?:number, stripeFrom?:(row)=>number,
 *   onSelect?:(row, rowEl:HTMLLIElement)=>void, label:string}} opts
 */
export function rankedBars(el, opts) {
  let o = { top: 8, ...opts };
  let showAll = false;
  const id = 'st-bars-' + ++uid;
  const list = document.createElement('ol');
  list.className = 'st-bars';
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'st-bars-all st-textbtn';
  more.addEventListener('click', () => { showAll = !showAll; draw(); if (showAll) list.children[o.top]?.querySelector('button, a')?.focus({ preventScroll: true }); });
  el.replaceChildren(list, more);
  el.classList.add('st-bars-host');

  function rowEl(row, i, max) {
    const li = document.createElement('li');
    li.className = 'st-bars-row' + (o.onSelect ? ' is-selectable' : '');
    li.dataset.key = row.key;
    const main = document.createElement('div');
    main.className = 'st-bars-main';
    if (o.onSelect) {
      const hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'st-bars-hit';
      hit.setAttribute('aria-expanded', 'false');
      hit.setAttribute('aria-controls', `${id}-more-${i}`);
      const labelText = row.label instanceof Node ? row.label.textContent : String(row.label);
      hit.setAttribute('aria-label', `${labelText}: ${row.partial ? 'at least ' : ''}${row.display || num(row.value) + ' ' + (o.unit || '')}`.trim());
      hit.addEventListener('click', () => o.onSelect(row, li));
      main.append(hit);
    }
    const lab = cell('st-bars-label', row.label);
    if (row.sub != null) {
      const sub = cell('st-bars-sub', row.sub);
      lab.append(sub);
    }
    const track = document.createElement('span');
    track.className = 'st-bars-track';
    track.setAttribute('aria-hidden', 'true');
    const w = max > 0 ? Math.max(0, Math.min(1, row.value / max)) : 0;
    const bar = document.createElement('span');
    bar.className = 'st-bars-bar';
    bar.style.width = (w * 100).toFixed(2) + '%';
    bar.style.background = o.color;
    if (o.stripeFrom) {
      const s = Math.max(0, Math.min(row.value, o.stripeFrom(row)));
      const solidShare = row.value > 0 ? s / row.value : 1;
      bar.style.background = `linear-gradient(90deg, ${o.color} 0 ${(solidShare * 100).toFixed(2)}%, transparent ${(solidShare * 100).toFixed(2)}%)`;
      if (solidShare < 1) {
        const stripe = document.createElement('span');
        stripe.className = 'st-bars-stripe';
        stripe.style.left = (solidShare * 100).toFixed(2) + '%';
        bar.append(stripe);
      }
    }
    track.append(bar);
    const val = document.createElement('span');
    val.className = 'st-bars-value';
    if (row.partial) val.append(cell('st-bars-atleast', 'at least '));
    val.append(row.display || num(row.value));
    if (row.meta) val.append(cell('st-bars-meta', ' ' + row.meta));
    main.append(lab, track, val);
    if (o.total) main.append(cell('st-bars-share', pct(row.value / o.total)));
    li.append(main);
    const slot = document.createElement('div');
    slot.className = 'st-bars-more';
    slot.id = `${id}-more-${i}`;
    slot.hidden = true;
    li.append(slot);
    return li;
  }

  function draw() {
    const rows = o.rows || [];
    const max = o.max ?? (rows[0]?.value || 0);
    list.setAttribute('aria-label', o.label || '');
    list.classList.toggle('has-share', !!o.total);
    const shown = showAll ? rows : rows.slice(0, o.top);
    list.replaceChildren(...shown.map((r, i) => rowEl(r, i, max)));
    more.hidden = rows.length <= o.top;
    more.textContent = showAll ? 'Show fewer' : `Show all ${num(rows.length)}`;
    more.setAttribute('aria-expanded', showAll ? 'true' : 'false');
  }
  draw();

  return {
    update(next) { o = { ...o, ...next }; draw(); },
    /** Reveal a row (opening "Show all" if it's below the fold), select it, focus it. */
    expand(key) {
      const rows = o.rows || [];
      const i = rows.findIndex((r) => r.key === key);
      if (i < 0) return null;
      if (i >= o.top && !showAll) { showAll = true; draw(); }
      const li = list.querySelector(`li[data-key="${CSS.escape(key)}"]`);
      if (!li) return null;
      if (o.onSelect) o.onSelect(rows[i], li);
      (li.querySelector('.st-bars-hit') || li.querySelector('a, button'))?.focus({ preventScroll: true });
      return li;
    },
    destroy() { el.replaceChildren(); el.classList.remove('st-bars-host'); },
  };
}

/**
 * The people range as two bars on one scale: the counter's low end (solid) and the server's
 * high end (striped, the "maybe" pattern).
 */
export function rangeBar(el, { lo, hi, max, loLabel, hiLabel }) {
  const wrap = document.createElement('div');
  wrap.className = 'st-rangebar';
  el.replaceChildren(wrap);
  function draw(p) {
    const m = p.max ?? Math.max(p.lo, p.hi, 1);
    const row = (label, value, cls) => {
      const r = document.createElement('div');
      r.className = 'st-rangebar-row';
      const l = cell('st-rangebar-label', label);
      const t = document.createElement('span');
      t.className = 'st-rangebar-track';
      t.setAttribute('aria-hidden', 'true');
      const b = document.createElement('span');
      b.className = 'st-rangebar-bar ' + cls;
      b.style.width = ((m > 0 ? Math.min(1, value / m) : 0) * 100).toFixed(2) + '%';
      t.append(b);
      r.append(l, t);
      return r;
    };
    wrap.replaceChildren(row(p.loLabel, p.lo, 'is-solid'), row(p.hiLabel, p.hi, 'is-stripe'));
  }
  let cur = { lo, hi, max, loLabel, hiLabel };
  draw(cur);
  return { update(next) { cur = { ...cur, ...next }; draw(cur); } };
}
