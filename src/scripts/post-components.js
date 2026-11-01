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
