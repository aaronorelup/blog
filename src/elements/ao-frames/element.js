// <ao-frames>: a video the reader can step through one frame at a time, for animation where the point is a frame or
// two (an impact frame, a hit-stop, a smear) that playback hides: previous/next frame, play/pause, quarter speed, a
// frame counter and optional jumps to labelled frames; with the video focused, the arrow keys step too. Without JS
// it is the plain <video>. Attributes fps, marks: docs/COMPONENTS.md.

class AoFrames extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const video = this.querySelector(':scope > video');
    if (!video) return;
    this._ready = true;
    const fps = Math.max(1, parseFloat(this.getAttribute('fps') || '24'));
    const frameOf = () => Math.floor(video.currentTime * fps + 1e-3);
    const total = () => (isFinite(video.duration) ? Math.round(video.duration * fps) : 0);
    const seekFrame = (n) => {
      video.pause();
      const last = Math.max(0, total() - 1);
      const f = Math.min(Math.max(0, n), last || n);
      video.currentTime = (f + 0.5) / fps;
    };

    const bar = document.createElement('div');
    bar.className = 'ao-frames-bar';
    const btn = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    btn('\u2039 frame', 'Previous frame', () => seekFrame(frameOf() - 1));
    const play = btn('Play', 'Play or pause', () => (video.paused ? video.play().catch(() => {}) : video.pause()));
    btn('frame \u203a', 'Next frame', () => seekFrame(frameOf() + 1));
    const slow = btn('\u00bc speed', 'Toggle quarter speed', () => {
      video.playbackRate = video.playbackRate === 1 ? 0.25 : 1;
      slow.setAttribute('aria-pressed', String(video.playbackRate !== 1));
    });
    slow.setAttribute('aria-pressed', 'false');

    for (const part of (this.getAttribute('marks') || '').split('|')) {
      const i = part.indexOf(':');
      const n = parseInt(i < 0 ? part : part.slice(0, i), 10);
      if (!isFinite(n)) continue;
      const label = i < 0 ? 'Frame ' + n : part.slice(i + 1).trim();
      const b = btn(label, 'Jump to frame ' + n, () => seekFrame(n));
      b.className = 'ao-frames-mark';
    }

    const count = document.createElement('span');
    count.className = 'ao-frames-count';
    count.setAttribute('aria-live', 'off');
    bar.append(count);
    const show = () => {
      const t = total();
      count.textContent = 'frame ' + frameOf() + (t ? ' / ' + (t - 1) : '');
      play.textContent = video.paused ? 'Play' : 'Pause';
    };
    for (const ev of ['timeupdate', 'seeked', 'play', 'pause', 'loadedmetadata']) video.addEventListener(ev, show);
    // During playback timeupdate fires only ~4 times a second; follow every frame where we can.
    if ('requestVideoFrameCallback' in video) {
      const tick = () => { show(); video.requestVideoFrameCallback(tick); };
      video.requestVideoFrameCallback(tick);
    }
    video.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        seekFrame(frameOf() + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    if (!video.hasAttribute('tabindex')) video.tabIndex = 0;
    video.after(bar);
    show();
    this.classList.add('ao-frames-ready');
  }
}

customElements.define('ao-frames', AoFrames);
