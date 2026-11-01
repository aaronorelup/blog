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
