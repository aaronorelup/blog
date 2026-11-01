// <ao-treemap>: parts of a whole whose parts have parts, drawn as nested rectangles with areas in proportion, from a
// plain <table> (first column the groups, every other a kind of part, cells the amounts) that stays for screen
// readers. A second view turns it inside out; pointing at a tile, or the arrow keys, reads it out. Attributes views,
// top, unit, aspect: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';
import { cellNumber, readTable } from '../_lib/table.js';

function squarify(items, x, y, w, h) {
  // items: [{v}], sorted descending, v > 0. Returns the same items with x, y, w, h set.
  const out = [];
  let rest = items.slice();
  const total = rest.reduce((a, b) => a + b.v, 0);
  if (!total || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  const worst = (row, side) => {
    const s = row.reduce((a, b) => a + b.v * scale, 0);
    let mx = 0, mn = Infinity;
    for (const r of row) { mx = Math.max(mx, r.v * scale); mn = Math.min(mn, r.v * scale); }
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) row.push(rest[i++]);
    rest = rest.slice(i);
    const area = row.reduce((a, b) => a + b.v * scale, 0);
    if (w >= h) {
      const cw = area / h;
      let cy = y;
      for (const r of row) { const ch = (r.v * scale) / cw; out.push(Object.assign(r, { x, y: cy, w: cw, h: ch })); cy += ch; }
      x += cw; w -= cw;
    } else {
      const ch = area / w;
      let cx = x;
      for (const r of row) { const cw = (r.v * scale) / ch; out.push(Object.assign(r, { x: cx, y, w: cw, h: ch })); cx += cw; }
      y += ch; h -= ch;
    }
  }
  return out;
}
class AoTreemap extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const { head, rows: cells } = readTable(table);
    const num = (c) => { const n = cellNumber(c); return Number.isFinite(n) && n > 0 ? n : 0; };
    let rows = cells.map((c) => ({ label: c[0] || '', values: c.slice(1).map((t) => num(t)) }))
      .filter((r) => r.values.some((v) => v > 0));
    if (!rows.length) return;
    this._ready = true;
    let cols = head.slice(1);
    // Fold the smaller columns into "Other" when `top` asks for it.
    const top = parseInt(this.getAttribute('top'), 10);
    if (top > 0 && cols.length > top) {
      const sums = cols.map((_, k) => rows.reduce((a, r) => a + (r.values[k] || 0), 0));
      const keep = sums.map((s, k) => [s, k]).sort((a, b) => b[0] - a[0]).slice(0, top).map((p) => p[1]).sort((a, b) => a - b);
      rows = rows.map((r) => ({
        label: r.label,
        values: [...keep.map((k) => r.values[k] || 0), r.values.reduce((a, v, k) => a + (keep.includes(k) ? 0 : v), 0)],
      }));
      cols = [...keep.map((k) => cols[k]), 'Other'];
    }
    this.cols = cols;
    this.rows = rows;
    this.total = rows.reduce((a, r) => a + r.values.reduce((x, y) => x + y, 0), 0);
    this.unit = this.getAttribute('unit') || '';
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);
    this.view = 0;

    const wrap = h('div', { class: 'ao-tm' });
    const bar = h('div', { class: 'ao-tm-bar' });
    if (views.length > 1) {
      this.viewBtns = views.slice(0, 2).map((label, i) => {
        const b = h('button', { type: 'button', text: label, 'aria-pressed': String(i === 0), onclick: () => this.setView(i) });
        bar.append(b);
        return b;
      });
    }
    const legend = h('div', { class: 'ao-tm-legend' });
    cols.forEach((c, k) => {
      const key = h('span', { class: 'ao-tm-key', text: c });
      key.style.setProperty('--tm', `var(--tm-${k % 8})`);
      legend.append(key);
    });
    bar.append(legend);
    this.stage = h('div', { class: 'ao-tm-stage', tabindex: '0', role: 'img',
      'aria-label': 'Treemap; the table it is drawn from follows. Arrow keys read the tiles.' });
    this.read = h('p', { class: 'ao-tm-read', 'aria-live': 'polite' });
    wrap.append(bar, this.stage, this.read);
    table.classList.add('ao-tm-table', 'visually-hidden');
    table.before(wrap);

    this.cur = -1;
    this.stage.addEventListener('pointermove', (e) => {
      const t = e.target.closest('.ao-tm-tile');
      if (t) this.focusTile(+t.dataset.i, false);
    });
    this.stage.addEventListener('pointerleave', () => { if (document.activeElement !== this.stage) this.focusTile(-1, false); });
    this.stage.addEventListener('keydown', (e) => {
      const n = this.tiles?.length || 0;
      if (!n) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); this.focusTile((this.cur + step + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); this.focusTile(0, true); }
      else if (e.key === 'End') { e.preventDefault(); this.focusTile(n - 1, true); }
    });
    this.stage.addEventListener('focus', () => { if (this.cur < 0) this.focusTile(0, true); });
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(this.stage);
    this.classList.add('ao-treemap-ready');
    this.paint();
  }
  disconnectedCallback() { this.ro?.disconnect(); }
  setView(i) {
    this.view = i;
    this.viewBtns?.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    this.cur = -1;
    this.paint();
    this.read.textContent = '';
  }
  groups() {
    // The outer blocks for the current view, each with its inner tiles, sorted descending.
    const { rows, cols } = this;
    const g = this.view === 0
      ? rows.map((r) => ({ label: r.label, parts: r.values.map((v, k) => ({ v, label: cols[k], k, group: r.label })) }))
      : cols.map((c, k) => ({ label: c, k, parts: rows.map((r) => ({ v: r.values[k] || 0, label: r.label, k, group: c })) }));
    for (const b of g) {
      b.parts = b.parts.filter((p) => p.v > 0).sort((a, b2) => b2.v - a.v);
      b.v = b.parts.reduce((a, p) => a + p.v, 0);
    }
    return g.filter((b) => b.v > 0).sort((a, b) => b.v - a.v);
  }
  fmt(v) { return v.toLocaleString('en-US') + (this.unit ? ' ' + this.unit : ''); }
  pct(v) { const p = (100 * v) / this.total; return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + '%'; }
  paint() {
    const W = this.stage.clientWidth, H = this.stage.clientHeight;
    if (!W || !H) return;
    const blocks = squarify(this.groups(), 0, 0, W, H);
    this.stage.textContent = '';
    this.tiles = [];
    const pad = 2, headH = 20;
    for (const b of blocks) {
      const el = h('div', { class: 'ao-tm-block' });
      Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      const labelled = b.w > 64 && b.h > 44;
      const inner = { x: pad, y: labelled ? headH : pad, w: b.w - 2 * pad, h: b.h - (labelled ? headH : pad) - pad };
      if (labelled) el.append(h('span', { class: 'ao-tm-name', text: b.label }));
      for (const p of squarify(b.parts.map((q) => ({ ...q })), inner.x, inner.y, inner.w, inner.h)) {
        const t = h('span', { class: 'ao-tm-tile', 'data-i': String(this.tiles.length) });
        t.style.setProperty('--tm', `var(--tm-${p.k % 8})`);
        Object.assign(t.style, { left: p.x + 'px', top: p.y + 'px', width: Math.max(0, p.w - 1) + 'px', height: Math.max(0, p.h - 1) + 'px' });
        if (p.w > 58 && p.h > 30) {
          t.append(h('span', { class: 'ao-tm-label', text: this.view === 0 && blocks.length > 1 && !labelled ? p.group : p.label }));
        }
        el.append(t);
        this.tiles.push({ el: t, p, block: b });
      }
      this.stage.append(el);
    }
    if (this.cur >= 0 && this.tiles[this.cur]) this.focusTile(this.cur, false);
  }
  focusTile(i, keyed) {
    this.tiles?.forEach((t, k) => t.el.classList.toggle('ao-tm-on', k === i));
    this.cur = i;
    const t = this.tiles?.[i];
    if (!t) { this.read.textContent = ''; return; }
    const { p, block } = t;
    const outer = this.view === 0 ? p.group : p.label;
    const part = this.view === 0 ? p.label : p.group;
    this.read.textContent = `${outer} · ${part}: ${this.fmt(p.v)} (${this.pct(p.v)} of all). ${block.label} in all: ${this.fmt(block.v)} (${this.pct(block.v)}).`;
  }
}

customElements.define('ao-treemap', AoTreemap);
