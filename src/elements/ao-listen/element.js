// <ao-listen>: several renders of the same audio, compared by ear at the same moment. One player for the whole set:
// picking another clip keeps the playhead where it was, so the reader hears the same word under each treatment, and
// A/B flips to the reference clip and back. It stops when the homepage swaps posts or closes the reader. Without JS
// the figures stack with native controls. Attribute ref, markup and keys: docs/COMPONENTS.md.
import { AO_LISTEN_PLAY, claim } from '../_core/player.js';
import { fmtTime } from '../_lib/time.js';

class AoListen extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const figs = [...this.querySelectorAll(':scope > figure')].filter((f) => f.querySelector('audio'));
    if (figs.length < 2) return;
    this._ready = true;
    const clips = figs.map((f, k) => {
      const audio = f.querySelector('audio');
      const cap = f.querySelector('figcaption');
      const title = cap?.querySelector('b')?.textContent.trim() || 'Clip ' + (k + 1);
      return { fig: f, id: f.dataset.id || String(k), audio, img: f.querySelector('img'), title, meta: cap?.querySelector('.ao-meta')?.textContent.trim() || '' };
    });
    const refId = this.getAttribute('ref');
    const ref = clips.find((c) => c.id === refId) || clips[0];
    let cur = clips[0];
    let back = null; // the clip A/B will return to while the reference is playing

    const stage = document.createElement('div');
    stage.className = 'ao-listen-stage';
    const now = document.createElement('p');
    now.className = 'ao-listen-now';
    const nowTitle = document.createElement('b');
    const nowMeta = document.createElement('span');
    nowMeta.className = 'ao-meta';
    now.append(nowTitle, nowMeta);
    const spec = document.createElement('div');
    spec.className = 'ao-listen-spec';
    spec.setAttribute('role', 'slider');
    spec.setAttribute('aria-label', 'Playback position');
    spec.tabIndex = 0;
    const specImg = document.createElement('img');
    specImg.alt = '';
    specImg.decoding = 'async';
    const head = document.createElement('i');
    head.className = 'ao-listen-head';
    spec.append(specImg, head);

    const bar = document.createElement('div');
    bar.className = 'ao-listen-bar';
    const mk = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    const play = mk('Play', 'Play or pause (space)', () => toggle());
    const ab = mk('A/B with ' + ref.title.split(/\s[··]\s/)[0], 'Switch to the reference at the same moment, and back (C)', () => flip());
    ab.setAttribute('aria-pressed', 'false');
    const clock = document.createElement('span');
    clock.className = 'ao-listen-clock';
    bar.append(clock);
    stage.append(now, spec, bar);

    const list = document.createElement('ol');
    list.className = 'ao-listen-list';
    list.tabIndex = 0;
    list.setAttribute('aria-label', 'Clips');
    const rows = clips.map((c) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      const t = document.createElement('b');
      t.textContent = c.title;
      b.append(t);
      if (c.meta) {
        const m = document.createElement('span');
        m.textContent = c.meta;
        b.append(m);
      }
      b.addEventListener('click', () => { back = null; select(c, true); });
      li.append(b);
      list.append(li);
      return b;
    });

    const pos = () => cur.audio.currentTime || 0;
    const draw = () => {
      const a = cur.audio;
      const d = a.duration;
      const p = isFinite(d) && d > 0 ? Math.min(1, a.currentTime / d) : 0;
      head.style.left = p * 100 + '%';
      spec.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      clock.textContent = fmtTime(a.currentTime) + ' / ' + fmtTime(d);
      play.textContent = a.paused ? 'Play' : 'Pause';
    };
    const loop = () => {
      // The homepage hides the reader rather than removing it when it closes; stop with it.
      if (!this.getClientRects().length) { cur.audio.pause(); return; }
      draw();
      if (!cur.audio.paused) this._raf = requestAnimationFrame(loop);
    };
    const show = () => {
      nowTitle.textContent = cur.title;
      nowMeta.textContent = cur.meta;
      if (cur.img) { specImg.src = cur.img.currentSrc || cur.img.src; spec.classList.remove('ao-listen-nospec'); }
      else { specImg.removeAttribute('src'); spec.classList.add('ao-listen-nospec'); }
      rows.forEach((b, k) => b.setAttribute('aria-current', String(clips[k] === cur)));
      ab.setAttribute('aria-pressed', String(back !== null));
      ab.disabled = cur === ref && back === null;
      draw();
    };
    // Move to clip c at time t, keeping play state. Metadata may not be loaded yet.
    const select = (c, keepTime) => {
      if (c === cur) { if (cur.audio.paused) start(); return; }
      const t = keepTime ? pos() : 0;
      const wasPlaying = !cur.audio.paused || keepTime;
      cur.audio.pause();
      cur = c;
      const a = c.audio;
      a.preload = 'auto';
      const seek = () => { try { a.currentTime = isFinite(a.duration) ? Math.min(t, Math.max(0, a.duration - 0.05)) : t; } catch (e) {} };
      if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true });
      show();
      if (wasPlaying) start();
    };
    const start = () => {
      claim(this);
      cur.audio.play().catch(() => {});
    };
    const toggle = () => (cur.audio.paused ? start() : cur.audio.pause());
    const flip = () => {
      if (back) { const b = back; back = null; select(b, true); }
      else if (cur !== ref) { back = cur; select(ref, true); }
      show();
    };
    const seekTo = (frac) => {
      const a = cur.audio;
      const go = () => { a.currentTime = Math.max(0, Math.min(1, frac)) * a.duration; draw(); };
      if (a.readyState >= 1) go(); else { a.preload = 'auto'; a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
    };

    for (const c of clips) {
      const a = c.audio;
      a.removeAttribute('controls');
      a.preload = 'metadata';
      a.addEventListener('play', () => { if (c === cur) loop(); });
      a.addEventListener('pause', () => c === cur && draw());
      a.addEventListener('loadedmetadata', () => c === cur && draw());
      a.addEventListener('ended', () => { if (c === cur) draw(); });
      c.fig.hidden = true;
    }
    spec.addEventListener('pointerdown', (e) => {
      const r = spec.getBoundingClientRect();
      seekTo((e.clientX - r.left) / r.width);
    });
    spec.addEventListener('keydown', (e) => {
      const a = cur.audio;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (isFinite(a.duration)) seekTo((a.currentTime + (e.key === 'ArrowLeft' ? -0.5 : 0.5)) / a.duration);
      }
    });
    this.addEventListener('keydown', (e) => {
      if (e.target.closest('button') && e.key === ' ') return;
      const k = clips.indexOf(cur);
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target === list) {
        e.preventDefault();
        back = null;
        select(clips[(k + (e.key === 'ArrowDown' ? 1 : clips.length - 1)) % clips.length], true);
      } else if (e.key === ' ' && (e.target === list || e.target === spec)) {
        e.preventDefault();
        toggle();
      } else if ((e.key === 'c' || e.key === 'C') && (e.target === list || e.target === spec)) {
        flip();
      }
    });
    this._onOther = (e) => { if (e.detail !== this) cur.audio.pause(); };
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => clips.forEach((c) => c.audio.pause());
    this.aoPlay = start;
    this.aoPause = () => cur.audio.pause();
    this.aoClock = () => cur.audio;
    this.aoTitle = () => cur.title;

    figs[0].before(stage, list);
    this.classList.add('ao-listen-ready');
    show();
  }

  disconnectedCallback() {
    if (this._stop) this._stop();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._onOther) document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    this._ready = false;
  }
}

customElements.define('ao-listen', AoListen);
