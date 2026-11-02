// <ao-listen>: several renders of the same audio, compared by ear at the same moment. One player for the whole set:
// picking another clip keeps the playhead where it was, so the reader hears the same word under each treatment, and
// A/B flips to the reference clip and back. It stops when the homepage swaps posts or closes the reader. Without JS
// the figures stack with native controls. Attribute ref, markup and keys: docs/COMPONENTS.md.
import { AO_LISTEN_PLAY, claim } from '../_core/player.js';
import { h } from '../_lib/dom.js';
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

    const nowTitle = h('b');
    const nowMeta = h('span', { class: 'ao-meta' });
    const now = h('p', { class: 'ao-listen-now' }, nowTitle, nowMeta);
    const specImg = h('img', { alt: '', decoding: 'async' });
    const head = h('i', { class: 'ao-listen-head' });
    const spec = h('div', { class: 'ao-listen-spec', role: 'slider', 'aria-label': 'Playback position', tabindex: '0' },
      specImg, head);

    const bar = h('div', { class: 'ao-listen-bar' });
    const mk = (label, title, fn) => {
      const b = h('button', { type: 'button', text: label, title, onclick: fn });
      bar.append(b);
      return b;
    };
    const play = mk('Play', 'Play or pause (space)', () => toggle());
    const ab = mk('A/B with ' + ref.title.split(/\s[··]\s/)[0], 'Switch to the reference at the same moment, and back (C)', () => flip());
    ab.setAttribute('aria-pressed', 'false');
    const clock = h('span', { class: 'ao-listen-clock' });
    bar.append(clock);
    const stage = h('div', { class: 'ao-listen-stage' }, now, spec, bar);

    const list = h('ol', { class: 'ao-listen-list', tabindex: '0', 'aria-label': 'Clips' });
    const rows = clips.map((c) => {
      const b = h('button', { type: 'button', tabindex: '-1', onclick: () => { back = null; select(c, true); } },
        h('b', { text: c.title }), c.meta ? h('span', { text: c.meta }) : null);
      list.append(h('li', null, b));
      return b;
    });

    const pos = () => cur.audio.currentTime || 0;
    // WebKit's GStreamer player plays a clip again, even after pause(), when the pause came before the clip was under
    // way: while it seeks, while it waits for data, or while its clock still stands where it last played, seeked or
    // waited (the phone project caught a Pause mid-seek, and A/B at a clip that had just seeked, the clip going on
    // beside the reference). That play comes 80-150 ms after the pause, or as a seek running across it ends. A pause
    // asked for then holds: a play of that clip in that time is paused at once. The hold ends at the first such play
    // once the clip neither seeks nor waits, at start(), or HOLD ms after the pause (after its seek, for one asked for
    // mid-seek): a play after that is the reader's own, from a media key, the lock screen or headphones, and plays.
    const HOLD = 400;
    const held = new Map(); // each held clip and when its hold ends (Infinity while the seek it was asked in runs)
    const mark = new Map(); // each clip's clock at its last play, seek or wait
    const settled = (a) => !a.seeking && a.readyState >= a.HAVE_FUTURE_DATA;
    const halt = (a) => {
      if (!a.paused && (!settled(a) || a.currentTime === mark.get(a))) held.set(a, a.seeking ? Infinity : performance.now() + HOLD);
      a.pause();
    };
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
      if (!this.getClientRects().length) { halt(cur.audio); return; }
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
      halt(cur.audio);
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
      held.delete(cur.audio);
      cur.audio.play().catch(() => {});
    };
    const toggle = () => (cur.audio.paused ? start() : halt(cur.audio));
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
      for (const t of ['seeking', 'seeked', 'waiting', 'playing']) a.addEventListener(t, () => mark.set(a, a.currentTime));
      a.addEventListener('seeked', () => { if (held.get(a) === Infinity) held.set(a, performance.now() + HOLD); });
      a.addEventListener('play', () => {
        if (performance.now() < (held.get(a) ?? 0)) {
          a.pause();
          if (settled(a)) held.delete(a);
        } else {
          held.delete(a);
          mark.set(a, a.currentTime);
          if (c === cur) loop();
        }
      });
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
    this._onOther = (e) => { if (e.detail !== this) halt(cur.audio); };
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => clips.forEach((c) => halt(c.audio));
    this.aoPlay = start;
    this.aoPause = () => halt(cur.audio);
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
