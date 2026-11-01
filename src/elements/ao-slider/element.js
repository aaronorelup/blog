// <ao-slider>: two images of the same frame, one over the other, with a divider the reader drags (or moves with the
// arrow keys) to wipe between them: before/after pairs where the difference is in the detail. Full size opens both
// in the image viewer. Without JS the two images and the caption stack. Attributes: docs/COMPONENTS.md.
import { openViewer } from '../_core/viewer.js';

class AoSlider extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (imgs.length < 2) return;
    this._ready = true;
    const [a, b] = imgs;
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const labels = (this.getAttribute('labels') || '').split('|');
    const la = labels[0] || a.alt || 'Before';
    const lb = labels[1] || b.alt || 'After';

    const stage = document.createElement('div');
    stage.className = 'ao-slider-stage';
    a.classList.add('ao-slider-a');
    b.classList.add('ao-slider-b');
    // Both are in view the moment the frame is, so neither should wait on lazy loading.
    a.loading = 'eager';
    b.loading = 'eager';
    stage.append(a, b);

    const line = document.createElement('div');
    line.className = 'ao-slider-line';
    line.setAttribute('aria-hidden', 'true');
    const tagA = document.createElement('span');
    tagA.className = 'ao-slider-tag ao-slider-tag-a';
    tagA.textContent = la;
    const tagB = document.createElement('span');
    tagB.className = 'ao-slider-tag ao-slider-tag-b';
    tagB.textContent = lb;

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '0.5';
    range.value = String(Math.min(100, Math.max(0, parseFloat(this.getAttribute('start') || '50'))));
    range.className = 'ao-slider-range';
    range.setAttribute('aria-label', 'Divider between ' + la + ' and ' + lb);
    const set = () => this.style.setProperty('--ao-pos', range.value + '%');
    range.addEventListener('input', set);
    set();

    // The frame is all slider, so a click can't open the picture: this button does, both sides.
    a.dataset.label = la;
    b.dataset.label = lb;
    const zoom = document.createElement('button');
    zoom.type = 'button';
    zoom.className = 'ao-slider-zoom';
    zoom.textContent = 'Full size';
    zoom.title = 'Open both pictures full size, to zoom in';
    zoom.addEventListener('click', () => openViewer(parseFloat(range.value) < 50 ? b : a, [a, b]));

    stage.append(line, tagA, tagB, range, zoom);
    this.prepend(stage);
    this.classList.add('ao-slider-ready');
  }
}

customElements.define('ao-slider', AoSlider);
