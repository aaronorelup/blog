// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code is demos/<name>/index.js, its own
// chunk, fetched only when a post uses it (its CSS, demos/<name>/style.css, is inlined into that post's article). The
// module exports mount(host, part), which returns { destroy } or null; whatever the element held before is the no-JS
// fallback. docs/COMPONENTS.md.
import { lazy } from '../../scripts/lazy.js';

const DEMOS = Object.fromEntries(Object.entries(import.meta.glob('./demos/*/index.js'))
  .map(([path, load]) => [path.split('/')[2], load]));
class AoDemo extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const load = DEMOS[this.getAttribute('name')];
    if (!load) return;
    this._ready = true;
    lazy(load)
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

customElements.define('ao-demo', AoDemo);
