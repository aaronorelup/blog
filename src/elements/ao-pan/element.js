// <ao-pan>: a picture far wider than the page (a panorama, a long strip, a storyboard), shown at a readable height
// and panned across instead of shrunk to a sliver: drag, swipe, a trackpad or the arrow keys; a minimap shows the
// whole picture and where the frame is. Glide pans slowly to the end, Full size opens the viewer. Attributes views,
// stops, height: docs/COMPONENTS.md. Without JS: the images and caption stack, at the page's width.
import { openViewer } from '../_core/viewer.js';
import { h } from '../_lib/dom.js';

class AoPan extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (!imgs.length) return;
    this._ready = true;
    this.imgs = imgs;
    const height = parseFloat(this.getAttribute('height') || '');
    if (height > 0) this.style.setProperty('--ao-pan-h', height + 'px');
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim());
    imgs.forEach((img, i) => { img.dataset.label = views[i] || img.alt || 'View ' + (i + 1); });

    const stage = h('div', { class: 'ao-pan-stage', tabindex: '0', role: 'region',
      'aria-label': 'Wide picture: drag, or use the arrow keys, to pan' }, h('div', { class: 'ao-pan-track' }, ...imgs));
    this.stage = stage;

    this.miniImg = h('img', { alt: '', draggable: 'false', 'data-no-zoom': '' });
    this.win = h('span', { class: 'ao-pan-win' });
    const mini = h('div', { class: 'ao-pan-mini', 'aria-hidden': 'true' }, this.miniImg, this.win);

    const bar = h('div', { class: 'ao-pan-bar' });
    const mk = (label, cls, fn, title) => {
      const b = h('button', { type: 'button', class: 'ao-pan-btn' + (cls ? ' ' + cls : ''), text: label, title: title || null, onclick: fn });
      bar.append(b);
      return b;
    };
    this.viewBtns = imgs.length > 1 ? imgs.map((img, i) => mk(img.dataset.label, 'ao-pan-view', () => this.show(i))) : [];
    for (const part of (this.getAttribute('stops') || '').split('|')) {
      const k = part.indexOf(':');
      const f = parseFloat(k < 0 ? part : part.slice(0, k));
      if (!isFinite(f)) continue;
      mk(k < 0 ? Math.round(f * 100) + '%' : part.slice(k + 1).trim(), 'ao-pan-stop', () => this.glideTo(f, 900), 'Pan to here');
    }
    this.glideBtn = mk('Glide', 'ao-pan-glide', () => (this.anim ? this.stop() : this.glide()), 'Pan slowly to the end');
    mk('Full size', 'ao-pan-zoom', () => openViewer(this.imgs[this.cur], this.imgs), 'Open the picture full size, to zoom in');

    const cap = this.querySelector(':scope > figcaption');
    this.insertBefore(bar, cap || null);
    this.insertBefore(mini, bar);
    this.insertBefore(stage, mini);

    // Mouse drag pans (touch and trackpads already scroll natively).
    let drag = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      this.stop();
      drag = { x: e.clientX, left: stage.scrollLeft };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('ao-pan-dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (drag) stage.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    const end = () => { drag = null; stage.classList.remove('ao-pan-dragging'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', () => this.stop(), { passive: true });
    stage.addEventListener('touchstart', () => this.stop(), { passive: true });
    stage.addEventListener('keydown', (e) => {
      const step = stage.clientWidth * (e.shiftKey ? 0.9 : 0.25);
      const go = { ArrowRight: step, ArrowLeft: -step, End: Infinity, Home: -Infinity }[e.key];
      if (go === undefined) return;
      e.preventDefault();
      this.stop();
      const to = isFinite(go) ? stage.scrollLeft + go : go > 0 ? stage.scrollWidth : 0;
      stage.scrollTo({ left: to, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    stage.addEventListener('scroll', () => this.paint(), { passive: true });

    const jump = (e) => {
      const r = mini.getBoundingClientRect();
      this.stop();
      this.centreAt((e.clientX - r.left) / r.width);
    };
    let miniDrag = false;
    mini.addEventListener('pointerdown', (e) => { miniDrag = true; mini.setPointerCapture(e.pointerId); jump(e); });
    mini.addEventListener('pointermove', (e) => { if (miniDrag) jump(e); });
    mini.addEventListener('pointerup', () => { miniDrag = false; });

    for (const img of imgs) img.addEventListener('load', () => this.paint());
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(stage);
    this.onStop = () => this.stop();
    document.addEventListener('ao-stop', this.onStop);
    this.cur = 0;
    this.show(0);
    this.classList.add('ao-pan-ready');
  }

  disconnectedCallback() {
    this.stop();
    if (this.ro) this.ro.disconnect();
    if (this.onStop) document.removeEventListener('ao-stop', this.onStop);
  }

  // Where the frame's centre sits, as a fraction of the picture's width.
  frac() {
    const s = this.stage;
    return s.scrollWidth > 0 ? (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth : 0;
  }

  centreAt(f) {
    const s = this.stage;
    s.scrollLeft = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
  }

  show(i) {
    const keep = this.frac();
    this.cur = i;
    this.imgs.forEach((img, k) => {
      const on = k === i;
      img.classList.toggle('ao-pan-off', !on);
      if (on) img.loading = 'eager';
    });
    this.viewBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const img = this.imgs[i];
    this.miniImg.src = img.currentSrc || img.src;
    const restore = () => {
      if (this._shown) this.centreAt(keep);
      this._shown = true;
      this.paint();
    };
    if (img.complete && img.naturalWidth) restore(); else img.addEventListener('load', restore, { once: true });
  }

  paint() {
    const s = this.stage;
    if (!s || !s.scrollWidth) return;
    this.win.style.left = (s.scrollLeft / s.scrollWidth) * 100 + '%';
    this.win.style.width = Math.min(100, (s.clientWidth / s.scrollWidth) * 100) + '%';
  }

  glideTo(f, ms) {
    this.stop();
    const s = this.stage;
    const to = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { s.scrollLeft = to; return; }
    this.run(s.scrollLeft, to, ms, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
  }

  // About 30 seconds for the whole width, the pace of a scroll video.
  glide() {
    const s = this.stage;
    const max = s.scrollWidth - s.clientWidth;
    if (max <= 0) return;
    const from = s.scrollLeft >= max - 2 ? 0 : s.scrollLeft;
    this.run(from, max, 30000 * ((max - from) / max), (t) => t);
    this.glideBtn.textContent = 'Stop';
    this.glideBtn.setAttribute('aria-pressed', 'true');
  }

  run(from, to, ms, ease) {
    const s = this.stage;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      s.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) this.anim = requestAnimationFrame(step); else this.stop();
    };
    this.anim = requestAnimationFrame(step);
  }

  stop() {
    if (this.anim) cancelAnimationFrame(this.anim);
    this.anim = 0;
    if (this.glideBtn) {
      this.glideBtn.textContent = 'Glide';
      this.glideBtn.setAttribute('aria-pressed', 'false');
    }
  }
}

customElements.define('ao-pan', AoPan);
