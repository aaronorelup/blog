// <ao-shots>: a video with its shots laid out as a strip of thumbnails underneath, so a reader sees the whole edit
// at a glance and jumps to any shot. Children: one <video>, then an <ol> of <li data-t="m:ss.xx"> (a thumbnail and a
// label), then an optional <figcaption>. The shot playing is lit and kept in view inside the strip (never by
// scrolling the page); arrow keys move along it. docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';
import { parseTime } from '../_lib/time.js';

class AoShots extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const video = this.querySelector(':scope > video');
    const list = this.querySelector(':scope > ol');
    if (!video || !list) return;
    this._ready = true;
    const shots = [];
    for (const li of list.querySelectorAll(':scope > li')) {
      const t = parseTime(li.dataset.t);
      if (!isFinite(t)) continue;
      const b = h('button', { type: 'button', class: 'ao-shots-btn' });
      while (li.firstChild) b.append(li.firstChild);
      const at = h('span', { class: 'ao-shots-at' });
      const m = Math.floor(t / 60), sec = t - m * 60;
      at.textContent = m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
      b.append(at);
      b.title = 'Play from ' + at.textContent;
      li.append(b);
      shots.push({ t, li, b });
    }
    if (!shots.length) return;
    shots.sort((a, z) => a.t - z.t);
    list.classList.add('ao-shots-strip');
    const go = (s) => {
      video.currentTime = s.t + 0.02;
      video.play().catch(() => {});
    };
    shots.forEach((s, i) => {
      s.b.addEventListener('click', () => go(s));
      s.b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        shots[Math.min(shots.length - 1, Math.max(0, i + (e.key === 'ArrowLeft' ? -1 : 1)))].b.focus();
      });
    });
    let lit = null;
    const show = () => {
      const now = video.currentTime;
      let cur = shots[0];
      for (const s of shots) if (s.t <= now + 0.01) cur = s;
      if (cur === lit) return;
      if (lit) { lit.li.classList.remove('is-current'); lit.b.removeAttribute('aria-current'); }
      lit = cur;
      cur.li.classList.add('is-current');
      cur.b.setAttribute('aria-current', 'true');
      // Keep the lit shot in view inside the strip only; scrollIntoView would move the page.
      const l = cur.li.offsetLeft - list.offsetLeft, r = l + cur.li.offsetWidth;
      if (l < list.scrollLeft || r > list.scrollLeft + list.clientWidth) {
        list.scrollTo({ left: Math.max(0, l - (list.clientWidth - cur.li.offsetWidth) / 2), behavior: 'smooth' });
      }
    };
    for (const ev of ['timeupdate', 'seeked', 'loadedmetadata']) video.addEventListener(ev, show);
    show();
    this.classList.add('ao-shots-ready');
  }
}

customElements.define('ao-shots', AoShots);
