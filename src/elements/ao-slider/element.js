// <ao-slider>: two images of the same frame, one over the other, with a divider the reader drags (or moves with the
// arrow keys) to wipe between them: before/after pairs where the difference is in the detail. Full size opens both
// in the image viewer. Without JS the two images and the caption stack. Attributes: docs/COMPONENTS.md.
import { openViewer } from '../_core/viewer.js';
import { h } from '../_lib/dom.js';

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

    const stage = h('div', { class: 'ao-slider-stage' });
    a.classList.add('ao-slider-a');
    b.classList.add('ao-slider-b');
    // Both are in view the moment the frame is, so neither should wait on lazy loading.
    a.loading = 'eager';
    b.loading = 'eager';
    stage.append(a, b);

    const line = h('div', { class: 'ao-slider-line', 'aria-hidden': 'true' });
    const tagA = h('span', { class: 'ao-slider-tag ao-slider-tag-a', text: la });
    const tagB = h('span', { class: 'ao-slider-tag ao-slider-tag-b', text: lb });

    const range = h('input', { type: 'range', min: '0', max: '100', step: '0.5', class: 'ao-slider-range',
      'aria-label': 'Divider between ' + la + ' and ' + lb });
    range.value = String(Math.min(100, Math.max(0, parseFloat(this.getAttribute('start') || '50'))));
    const set = () => this.style.setProperty('--ao-pos', range.value + '%');
    range.addEventListener('input', set);
    set();

    // The frame is all slider, so a click can't open the picture: this button does, both sides.
    a.dataset.label = la;
    b.dataset.label = lb;
    const zoom = h('button', { type: 'button', class: 'ao-slider-zoom', text: 'Full size',
      title: 'Open both pictures full size, to zoom in',
      onclick: () => openViewer(parseFloat(range.value) < 50 ? b : a, [a, b]) });

    stage.append(line, tagA, tagB, range, zoom);
    this.prepend(stage);
    this.classList.add('ao-slider-ready');
  }
}

customElements.define('ao-slider', AoSlider);
