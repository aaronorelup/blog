// The image viewer's dialog: it opens on a picture, pages through the post's others with their captions, swaps in
// the larger file when it arrives, and closes on Esc, Back or ao-stop. Zoom and gestures are zoom.js, mixed into the
// same object. Loaded by viewer.js on the first open.
import { AO_STOP } from './player.js';
import { viewable } from './viewer.js';
import { zoom } from './zoom.js';

const bestSrc = (img) => {
  if (img.dataset.full) return img.dataset.full;
  const set = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/))
    .filter((p) => p[0] && /^\d+w$/.test(p[1] || '')).sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10));
  return set.length ? set[0][0] : img.currentSrc || img.src;
};
const captionOf = (img) => {
  const cap = img.closest('figure, ao-slider')?.querySelector('figcaption');
  const title = cap?.querySelector('b')?.textContent.trim() || '';
  const meta = cap?.querySelector('.ao-meta')?.textContent.trim() || '';
  // A slider's two sides share one caption; each side's own label leads.
  if (img.dataset.label) return { title: img.dataset.label, meta: [title, meta].filter(Boolean).join(' · ') };
  if (title || meta) return { title, meta };
  return { title: cap ? cap.textContent.trim() : '', meta: cap ? '' : img.alt || '' };
};

export const viewer = {
  dlg: null,
  list: [],
  i: 0,
  s: 1, tx: 0, ty: 0, // zoom (1 = fitted to the screen) and pan from centre, in screen px
  fit: { w: 0, h: 0 },
  nat: { w: 0, h: 0 },
  build() {
    const d = document.createElement('dialog');
    d.className = 'ao-lb';
    d.setAttribute('aria-label', 'Image viewer');
    d.tabIndex = -1;
    d.innerHTML =
      '<div class="ao-lb-stage"><img class="ao-lb-img" alt="" draggable="false"><span class="ao-lb-wait" hidden>loading full size…</span></div>' +
      '<div class="ao-lb-top"><span class="ao-lb-count"></span><span class="ao-lb-tools">' +
      '<button type="button" data-act="out" aria-label="Zoom out" title="Zoom out (−)">−</button>' +
      '<button type="button" data-act="fit" class="ao-lb-zoom" title="Fit to screen (0)">fit</button>' +
      '<button type="button" data-act="in" aria-label="Zoom in" title="Zoom in (+)">+</button>' +
      '<a class="ao-lb-orig" target="_blank" rel="noopener" title="Open the file in a new tab">file ↗</a>' +
      '<button type="button" data-act="close" class="ao-lb-close" aria-label="Close" title="Close (Esc)">×</button>' +
      '</span></div>' +
      '<button type="button" class="ao-lb-nav ao-lb-prev" data-act="prev" aria-label="Previous picture" title="Previous (←)">‹</button>' +
      '<button type="button" class="ao-lb-nav ao-lb-next" data-act="next" aria-label="Next picture" title="Next (→)">›</button>' +
      '<div class="ao-lb-cap"><b></b><span></span></div>';
    document.body.appendChild(d);
    this.dlg = d;
    this.img = d.querySelector('.ao-lb-img');
    this.stage = d.querySelector('.ao-lb-stage');
    this.wait = d.querySelector('.ao-lb-wait');
    d.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'close') this.close();
      else if (act === 'prev') this.go(-1);
      else if (act === 'next') this.go(1);
      else if (act === 'in') this.zoomTo(this.s * 1.6);
      else if (act === 'out') this.zoomTo(this.s / 1.6);
      else if (act === 'fit') this.zoomTo(this.s > 1.01 ? 1 : this.actual());
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); this.close(); });
    // close() does the cleanup itself; this catches a close from anywhere else.
    d.addEventListener('close', () => { if (!d.open) this.cleanup(); }); // a late event after a quick reopen is ignored
    d.addEventListener('keydown', (e) => this.key(e));
    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 400 : 1;
      this.zoomAt(e.clientX, e.clientY, this.s * Math.exp(-e.deltaY * k * 0.0016));
    }, { passive: false });
    this.pointers();
    this.onResize = () => this.layout(true);
  },
  // list: the pictures to page through (default: every viewable one in the same post).
  open(img, list) {
    const root = img.closest('[data-post-article]') || img.closest('.pc-prose') || document;
    this.list = list || [...root.querySelectorAll('img')].filter(viewable);
    if (!this.list.includes(img)) this.list = [img];
    if (!this.dlg) this.build();
    this.opener = img;
    this.dlg.classList.toggle('ao-lb-single', this.list.length < 2);
    if (!this.dlg.open) {
      this.cleaned = false;
      this.dlg.showModal();
      this.dlg.focus();
      window.addEventListener('resize', this.onResize);
      // Back closes the viewer rather than leaving the post (what a phone user reaches for). The
      // homepage's router owns its history, so there the viewer only closes when the route moves.
      if (!document.querySelector('[data-view="reader"]')) {
        history.pushState(Object.assign({}, history.state, { aoViewer: true }), '');
        this.pushed = true;
      }
    }
    this.show(this.list.indexOf(img));
  },
  // Cleanup runs here, not only on the dialog's close event: that event is queued for the next
  // rendered frame, and history.back() must not wait on one.
  close() {
    if (!this.dlg?.open) return;
    this.dlg.close();
    this.cleanup();
  },
  cleanup() {
    if (this.cleaned) return;
    this.cleaned = true;
    window.removeEventListener('resize', this.onResize);
    if (this.pushed) { this.pushed = false; history.back(); }
    this.img.removeAttribute('src');
    // Back to the picture the viewer was opened from, without the page jumping to it.
    try { this.opener?.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
  },
  go(step) {
    if (this.list.length < 2) return;
    this.show((this.i + step + this.list.length) % this.list.length);
  },
  show(i) {
    this.i = i;
    const src = this.list[i];
    const shown = src.currentSrc || src.src;
    const full = bestSrc(src);
    this.nat = { w: src.naturalWidth || 1600, h: src.naturalHeight || 900 };
    this.img.alt = src.alt || '';
    this.img.src = shown;
    this.dlg.querySelector('.ao-lb-orig').href = full;
    this.dlg.querySelector('.ao-lb-count').textContent = this.list.length > 1 ? i + 1 + ' / ' + this.list.length : '';
    const cap = captionOf(src);
    this.dlg.querySelector('.ao-lb-cap b').textContent = cap.title;
    this.dlg.querySelector('.ao-lb-cap span').textContent = cap.meta;
    this.dlg.querySelector('.ao-lb-cap').hidden = !cap.title && !cap.meta;
    this.layout(false);
    this.wait.hidden = true;
    if (full !== shown) {
      const big = new Image();
      big.decoding = 'async';
      const slow = setTimeout(() => { if (this.i === i) this.wait.hidden = false; }, 250);
      big.onload = () => {
        clearTimeout(slow);
        if (this.i !== i || !this.dlg.open) return;
        this.wait.hidden = true;
        this.img.src = full;
        this.nat = { w: big.naturalWidth, h: big.naturalHeight };
        this.layout(this.s > 1.01);
      };
      big.onerror = () => { clearTimeout(slow); this.wait.hidden = true; };
      big.src = full;
    }
    // Have the neighbours ready, so paging never waits.
    for (const k of [i + 1, i - 1]) {
      const n = this.list[(k + this.list.length) % this.list.length];
      if (n && n !== src && !n.complete) { const pre = new Image(); pre.src = n.currentSrc || n.src; }
    }
  },
  key(e) {
    const k = e.key;
    // Keys the viewer uses stop here: the homepage closes its reader on Escape and would
    // otherwise close it under the viewer.
    if (['Escape', 'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', 'Home', 'End', '+', '=', '-', '_', '0', '1'].includes(k)) e.stopPropagation();
    if (k === 'Escape') { e.preventDefault(); this.close(); }
    else if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); this.go(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); this.go(-1); }
    else if (k === 'Home') { e.preventDefault(); this.show(0); }
    else if (k === 'End') { e.preventDefault(); this.show(this.list.length - 1); }
    else if (k === '+' || k === '=') { e.preventDefault(); this.zoomTo(this.s * 1.6); }
    else if (k === '-' || k === '_') { e.preventDefault(); this.zoomTo(this.s / 1.6); }
    else if (k === '0') { e.preventDefault(); this.zoomTo(1); }
    else if (k === '1') { e.preventDefault(); this.zoomTo(this.nat.w / this.fit.w); }
  },
  ...zoom,
};

window.addEventListener('popstate', () => {
  if (!viewer.dlg?.open) return;
  viewer.pushed = false; // that entry is already gone
  viewer.close();
});
document.addEventListener(AO_STOP, () => viewer.close());
