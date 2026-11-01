// <ao-compare>: a grid of same-sized frames, so outputs can be judged side by side; with sync, its videos play,
// pause and seek together (one player: GROUPS in _core/player.js). Its stills open in the image viewer like every
// other picture in a post. Attributes cols, aspect, sync: docs/COMPONENTS.md.

class AoCompare extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const cols = parseInt(this.getAttribute('cols') || '2', 10);
    this.style.setProperty('--ao-cols', String(Math.max(1, cols)));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    if (this.hasAttribute('sync')) this.syncVideos();
  }

  syncVideos() {
    const vids = () => [...this.querySelectorAll('video')];
    // Driving the followers makes them fire play/pause/seeked of their own, a tick later.
    // Answering those echoes drives the leader back, and the videos ping-pong forever. So the
    // video the reader touched leads, and followers' events are ignored for a short window.
    let leader = null;
    let quietUntil = 0;
    const lead = (e, fn) => {
      const now = performance.now();
      if (e.target !== leader && now < quietUntil) return;
      leader = e.target;
      quietUntil = now + 400;
      for (const v of vids()) if (v !== leader) fn(v, leader);
    };
    const near = (v, t) => Math.abs(v.currentTime - t) < 0.08;
    this.addEventListener('play', (e) => lead(e, (v, l) => {
      if (!near(v, l.currentTime)) v.currentTime = l.currentTime;
      if (v.paused) v.play().catch(() => {});
    }), true);
    this.addEventListener('pause', (e) => lead(e, (v) => { if (!v.paused) v.pause(); }), true);
    this.addEventListener('seeked', (e) => lead(e, (v, l) => {
      if (!near(v, l.currentTime)) v.currentTime = l.currentTime;
    }), true);
  }
}

customElements.define('ao-compare', AoCompare);
