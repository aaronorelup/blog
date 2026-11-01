// Custom elements that posts can use from plain Markdown (raw HTML is allowed there).
// A post reaches readers two ways: its own /ledger/<slug>/ page, and the homepage panel,
// where openPost() copies the article in with innerHTML. Scripts inside that HTML never run,
// so behaviour lives here as custom elements: PostView loads this module on the standalone
// page and openPost() imports it on the homepage, and the browser upgrades the tags either way.
// The stylesheet is imported by this module, so it reaches both surfaces with it.
//
//   <ao-shots> <video …></video> <ol><li data-t="0:05.4"><img …>Label</li></ol> <figcaption>…
//   <ao-demo name="synthid" part="tournament"> fallback text </ao-demo>
//   <ao-series avg="7"> <table>day, then one column per series</table> <ol><li data-d="2026-09-30">…</li></ol> <figcaption>…
//   <ao-funnel unit="pages"> <ol><li><b>Label</b> <data value="-1634">−1,634</data> note <ul>…</ul></li></ol> <figcaption>…
//   <ao-ask> <details data-via="Connection" data-tool="tool"><summary>Question</summary><pre>call</pre><p>answer</p></details> …
//
// Two behaviours need no tag at all and apply to every post: one player at a time and the image viewer (every
// picture in a post opens full size, zooms and pages through the post's other pictures). They live in
// src/elements/_core/, and enhance() in src/elements/enhance.js; the elements below move to src/elements/ one by one.
// Usage notes: docs/COMPONENTS.md.
import '../styles/post-components.css';
import { AO_LISTEN_PLAY, claim } from '../elements/_core/player.js';
import { openViewer } from '../elements/_core/viewer.js';
import { fmtTime } from '../elements/_lib/time.js';
import { enhance } from '../elements/enhance.js';

// The standalone page runs it by itself; the homepage calls it after it swaps a post in.
export { enhance };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance());
else enhance();

// ---------------------------------------------------------------------------------------
// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code lives in
// src/scripts/demos/<name>.js and is a separate chunk, fetched only when a post uses it, so
// one post's demo never weighs on the others. The module exports mount(host, part), which
// returns { destroy } or null; whatever the element held before is the no-JS fallback.
// ---------------------------------------------------------------------------------------
// <ao-treemap>: parts of a whole whose parts have parts, drawn as nested rectangles with
// areas in proportion. Written once as a plain <table>: first column = the groups (projects),
// every other column = a kind of part (languages), cells = amounts. Each group is a block, its
// parts tiles coloured by column. A second view (`views="By project|By language"`) turns it
// inside out: one block per column, the groups as its tiles. `top="6"` keeps the six largest
// columns and folds the rest into "Other". Pointing at a tile, or focusing the chart and using
// the arrow keys, reads it out. The table stays for screen readers; without JS it is the table.
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
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const num = (c) => { const n = parseFloat(String(c || '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
    let rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const cells = [...tr.children];
      return { label: cells[0]?.textContent.trim() || '', values: cells.slice(1).map((c) => num(c.textContent)) };
    }).filter((r) => r.values.some((v) => v > 0));
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

    const wrap = document.createElement('div');
    wrap.className = 'ao-tm';
    const bar = document.createElement('div');
    bar.className = 'ao-tm-bar';
    if (views.length > 1) {
      this.viewBtns = views.slice(0, 2).map((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => this.setView(i));
        bar.append(b);
        return b;
      });
    }
    const legend = document.createElement('div');
    legend.className = 'ao-tm-legend';
    cols.forEach((c, k) => {
      const key = document.createElement('span');
      key.className = 'ao-tm-key';
      key.style.setProperty('--tm', `var(--tm-${k % 8})`);
      key.textContent = c;
      legend.append(key);
    });
    bar.append(legend);
    this.stage = document.createElement('div');
    this.stage.className = 'ao-tm-stage';
    this.stage.tabIndex = 0;
    this.stage.setAttribute('role', 'img');
    this.stage.setAttribute('aria-label', 'Treemap; the table it is drawn from follows. Arrow keys read the tiles.');
    this.read = document.createElement('p');
    this.read.className = 'ao-tm-read';
    this.read.setAttribute('aria-live', 'polite');
    wrap.append(bar, this.stage, this.read);
    table.classList.add('ao-tm-table');
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
      const el = document.createElement('div');
      el.className = 'ao-tm-block';
      Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      const labelled = b.w > 64 && b.h > 44;
      const inner = { x: pad, y: labelled ? headH : pad, w: b.w - 2 * pad, h: b.h - (labelled ? headH : pad) - pad };
      if (labelled) {
        const name = document.createElement('span');
        name.className = 'ao-tm-name';
        name.textContent = b.label;
        el.append(name);
      }
      for (const p of squarify(b.parts.map((q) => ({ ...q })), inner.x, inner.y, inner.w, inner.h)) {
        const t = document.createElement('span');
        t.className = 'ao-tm-tile';
        t.dataset.i = String(this.tiles.length);
        t.style.setProperty('--tm', `var(--tm-${p.k % 8})`);
        Object.assign(t.style, { left: p.x + 'px', top: p.y + 'px', width: Math.max(0, p.w - 1) + 'px', height: Math.max(0, p.h - 1) + 'px' });
        if (p.w > 58 && p.h > 30) {
          const l = document.createElement('span');
          l.className = 'ao-tm-label';
          l.textContent = this.view === 0 && blocks.length > 1 && !labelled ? p.group : p.label;
          t.append(l);
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


// ---------------------------------------------------------------------------------------
// <ao-matrix>: one subject run through a grid of settings (a method per row, a target per
// column), every cell shown the same size, with buttons that switch every cell between views of
// the same output at once (textured / clay, before / after, front / back).
//   cols="A|B|C"     column headings, left to right
//   views="X|Y"      one button per view; a cell's nth <img> is its nth view (default: one view)
//   aspect="w/h"     the frame every picture is fitted into (default 1/1)
// Each child <div data-row="Label|note"> is a row of <figure>s; <figure class="none">text</figure>
// is an empty cell. Switching views on one matrix switches every matrix on the page that has the
// same views, so a reader comparing two subjects keeps one look. Without JS: the rows, every
// picture showing. Only the pictures in view open in the image viewer, and page through in order.
const MATRIX_VIEW = 'ao-matrix-view';
class AoMatrix extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const rows = [...this.querySelectorAll(':scope > div[data-row]')];
    if (!rows.length) return;
    this._ready = true;
    const cols = (this.getAttribute('cols') || '').split('|').map((c) => c.trim()).filter(Boolean);
    const n = Math.max(cols.length, ...rows.map((r) => r.querySelectorAll(':scope > figure').length));
    this.style.setProperty('--ao-cols', String(n));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);

    const grid = document.createElement('div');
    grid.className = 'ao-matrix-grid';
    grid.setAttribute('role', 'table');
    const corner = document.createElement('span');
    corner.className = 'ao-matrix-corner';
    grid.append(corner);
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'ao-matrix-col';
      h.setAttribute('role', 'columnheader');
      h.textContent = cols[i] || '';
      grid.append(h);
    }
    for (const r of rows) {
      const [label, note] = r.getAttribute('data-row').split('|');
      const head = document.createElement('div');
      head.className = 'ao-matrix-row';
      head.setAttribute('role', 'rowheader');
      const b = document.createElement('b');
      b.textContent = label.trim();
      head.append(b);
      if (note) {
        const s = document.createElement('span');
        s.textContent = note.trim();
        head.append(s);
      }
      grid.append(head);
      const figs = [...r.querySelectorAll(':scope > figure')];
      for (let i = 0; i < n; i++) {
        const f = figs[i] || document.createElement('figure');
        if (!figs[i]) f.className = 'none';
        f.classList.add('ao-matrix-cell');
        // On a phone the column heading sits above the grid, out of sight: each cell says it.
        if (cols[i]) f.dataset.col = cols[i];
        grid.append(f);
      }
      r.remove();
    }
    this.cells = [...grid.querySelectorAll('figure:not(.none)')];

    if (this.views.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-matrix-bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show every cell as');
      this.btns = this.views.map((v, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ao-matrix-btn';
        btn.textContent = v;
        btn.addEventListener('click', () => {
          this.show(i);
          document.dispatchEvent(new CustomEvent(MATRIX_VIEW, { detail: { from: this, views: this.views.join('|'), i } }));
        });
        bar.append(btn);
        return btn;
      });
      this.prepend(bar);
      this.onView = (e) => {
        if (e.detail.from !== this && e.detail.views === this.views.join('|')) this.show(e.detail.i);
      };
      document.addEventListener(MATRIX_VIEW, this.onView);
    }
    const cap = this.querySelector(':scope > figcaption');
    if (cap) this.insertBefore(grid, cap); else this.append(grid);
    this.show(0);
    this.classList.add('ao-matrix-ready');
  }

  disconnectedCallback() {
    if (this.onView) document.removeEventListener(MATRIX_VIEW, this.onView);
  }

  show(i) {
    for (const f of this.cells) {
      const imgs = [...f.querySelectorAll(':scope > img')];
      const k = Math.min(i, imgs.length - 1);
      imgs.forEach((img, j) => {
        img.classList.toggle('ao-matrix-off', j !== k);
        // A view only fetches its pictures once someone asks for it.
        if (j === k && img.loading === 'lazy' && i > 0) img.loading = 'eager';
      });
    }
    (this.btns || []).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  }
}

const DEMOS = {
  synthid: () => import('./demos/synthid.js'),
  cf: () => import('./demos/cf.js'),
};
class AoDemo extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const load = DEMOS[this.getAttribute('name')];
    if (!load) return;
    this._ready = true;
    load()
      .then((mod) => {
        if (this.isConnected) this._demo = mod.mount(this, this.getAttribute('part'));
      })
      .catch(() => { this._ready = false; });
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; stop timers when this one leaves.
    this._demo?.destroy?.();
  }
}

if (!customElements.get('ao-demo')) customElements.define('ao-demo', AoDemo);
if (!customElements.get('ao-matrix')) customElements.define('ao-matrix', AoMatrix);
if (!customElements.get('ao-treemap')) customElements.define('ao-treemap', AoTreemap);
