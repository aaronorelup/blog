// <ao-matrix>: one subject run through a grid of settings (a method per row, a target per column), every cell the
// same size, with buttons that switch every cell between views of the same output at once (textured / clay, before /
// after). Switching views on one matrix switches every matrix on the page with the same views. Only the pictures in
// view open in the image viewer. Attributes cols, views, aspect and the rows: docs/COMPONENTS.md.
import { hookViewer } from '../_core/viewer.js';
import { h } from '../_lib/dom.js';

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

    const grid = h('div', { class: 'ao-matrix-grid', role: 'table' }, h('span', { class: 'ao-matrix-corner' }));
    for (let i = 0; i < n; i++) grid.append(h('span', { class: 'ao-matrix-col', role: 'columnheader', text: cols[i] || '' }));
    for (const r of rows) {
      const [label, note] = r.getAttribute('data-row').split('|');
      grid.append(h('div', { class: 'ao-matrix-row', role: 'rowheader' },
        h('b', { text: label.trim() }), note ? h('span', { text: note.trim() }) : null));
      const figs = [...r.querySelectorAll(':scope > figure')];
      for (let i = 0; i < n; i++) {
        const f = figs[i] || h('figure', { class: 'none' });
        f.classList.add('ao-matrix-cell');
        // On a phone the column heading sits above the grid, out of sight: each cell says it.
        if (cols[i]) f.dataset.col = cols[i];
        grid.append(f);
      }
      r.remove();
    }
    this.cells = [...grid.querySelectorAll('figure:not(.none)')];

    if (this.views.length > 1) {
      const bar = h('div', { class: 'ao-matrix-bar', role: 'group', 'aria-label': 'Show every cell as' });
      this.btns = this.views.map((v, i) => {
        const btn = h('button', { type: 'button', class: 'ao-matrix-btn', text: v, onclick: () => {
          this.show(i);
          document.dispatchEvent(new CustomEvent(MATRIX_VIEW, { detail: { from: this, views: this.views.join('|'), i } }));
        } });
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
    // enhance() makes a post's pictures focusable buttons and skips the ones a view hides. In the homepage's reader it
    // runs after this element has hidden them (the tag is defined from the second post on), so the pictures a view
    // brings in are made focusable here, or the keyboard could never open them.
    hookViewer(this);
  }
}

customElements.define('ao-matrix', AoMatrix);
