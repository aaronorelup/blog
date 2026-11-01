// The bar at the foot of the window while something with sound plays off screen: its title and clock, pause and
// play, back to it, and close. player.js calls nowPlaying.update(current) on every change of what plays; the bar is
// built the first time it shows.
import { fmtTime } from '../_lib/time.js';
import { isPlaying, isSilent, mediaOf, pausePlayer } from './media.js';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const titleOf = (p) => {
  if (p.aoTitle) return p.aoTitle();
  const own = p.querySelector?.(':scope > figcaption b');
  const fig = p.closest('figure')?.querySelector('figcaption b');
  const text = (own || fig)?.textContent.trim() || p.getAttribute('label') || p.title || p.getAttribute('aria-label');
  if (text) return text;
  // A bare video in the prose: name it after the section it sits in.
  let block = p;
  while (block.parentElement && !block.parentElement.classList.contains('pc-prose')) block = block.parentElement;
  for (let n = block.previousElementSibling; n; n = n.previousElementSibling) {
    if (/^H[2-4]$/.test(n.tagName)) return (p.tagName === 'AUDIO' ? 'Audio' : 'Video') + ' · ' + n.textContent.trim();
  }
  return p.tagName === 'AUDIO' ? 'Audio in this post' : 'Video in this post';
};
const clockOf = (p) => (p.aoClock ? p.aoClock() : mediaOf(p).find((m) => !m.paused) || mediaOf(p)[0]);

const ICON_PAUSE = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3.2 1.6v8.8L10.4 6z" fill="currentColor"/></svg>';
// Bring a player back into view. Smooth where the browser animates it; if it hasn't got there
// in a moment (reduced motion, a throttled pane), jump.
const reveal = (el) => {
  if (reducedMotion()) { el.scrollIntoView({ block: 'center' }); return; }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) el.scrollIntoView({ block: 'center' });
  }, 800);
};

export const nowPlaying = {
  el: null,
  showing: null,
  build() {
    const el = document.createElement('div');
    el.className = 'ao-np';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Now playing');
    el.hidden = true;
    el.innerHTML =
      '<button type="button" class="ao-np-toggle" aria-label="Pause"></button>' +
      '<span class="ao-np-what"><b></b><span class="ao-np-clock"></span></span>' +
      '<button type="button" class="ao-np-back">Back to it</button>' +
      '<button type="button" class="ao-np-close" aria-label="Stop and close">×</button>';
    el.querySelector('.ao-np-toggle').addEventListener('click', () => {
      const p = this.showing;
      if (!p) return;
      if (isPlaying(p)) { p._aoHeld = true; pausePlayer(p); }
      else if (p.aoPlay) p.aoPlay();
      else { const m = clockOf(p); if (m) m.play().catch(() => {}); }
      this.update(p);
    });
    el.querySelector('.ao-np-back').addEventListener('click', () => {
      const p = this.showing;
      if (p) reveal(p);
    });
    el.querySelector('.ao-np-close').addEventListener('click', () => {
      const p = this.showing;
      if (p) { p._aoHeld = false; p._aoResume = null; pausePlayer(p); }
      this.hide();
    });
    document.body.appendChild(el);
    this.el = el;
  },
  // p: the current player (the bar shows only it, so this.showing is p or null).
  update(p) {
    const off = p && p.isConnected && p._aoInView === false && !!p.getClientRects().length;
    const playing = off && isPlaying(p);
    if (p && !off) p._aoHeld = false;
    if (!off || !(playing ? !isSilent(p) : p._aoHeld)) { this.hide(); return; }
    if (!this.el) this.build();
    if (this.showing !== p) {
      this.showing = p;
      this.el.querySelector('.ao-np-what b').textContent = titleOf(p);
    }
    const t = this.el.querySelector('.ao-np-toggle');
    if (t.dataset.on !== String(playing)) { t.dataset.on = String(playing); t.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; }
    t.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    const m = clockOf(p);
    this.el.querySelector('.ao-np-clock').textContent = m ? fmtTime(m.currentTime) + ' / ' + fmtTime(m.duration) : '';
    if (this.el.hidden) {
      this.el.hidden = false;
      void this.el.offsetWidth; // start the slide-in from the hidden position
      this.el.classList.add('ao-np-in');
    }
  },
  hide() {
    this.showing = null;
    if (!this.el || this.el.hidden) return;
    this.el.classList.remove('ao-np-in');
    this.el.hidden = true;
  },
};
