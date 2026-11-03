// <ao-cues>: one or more cuts of the same timeline (a music video and its re-edit, a film and its previs) played in
// lockstep beside a list of timed cues: lyric lines, shots, chapters. The cue being played is lit; a click on a cue
// sends every video there. The first video sets the clock and the others follow it; a Sound button per video picks
// the one heard. Without JS: the videos with their own controls, and the cues as a plain list. docs/COMPONENTS.md.
import { AO_LISTEN_PLAY, claim } from '../_core/player.js';
import { h } from '../_lib/dom.js';
import { fmtTime, parseTime } from '../_lib/time.js';

// Keeping two videos together: a follower that drifts a little is sped up or slowed down by a
// few percent until it's back (a seek on every timeupdate makes the browser drop its buffer
// and the follower stalls for good), and only a big gap gets a seek. If any cut runs out of
// buffered video, they all wait for it, and set off together again when it has caught up.
class AoCues extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const vids = [...this.querySelectorAll(':scope > video')];
    const ol = this.querySelector(':scope > ol');
    if (!vids.length || !ol) return;
    this._ready = true;
    const labels = (this.getAttribute('labels') || '').split('|').map((s) => s.trim());
    const name = (k) => labels[k] || vids[k].title || 'Cut ' + (k + 1);
    const lead = vids[0];
    const followers = vids.slice(1);
    const cues = [...ol.children]
      .map((li) => ({ li, t: parseTime(li.dataset.t) }))
      .filter((c) => isFinite(c.t))
      .sort((a, b) => a.t - b.t);

    this.style.setProperty('--ao-cues-n', String(Math.min(vids.length, 2)));
    const grid = h('div', { class: 'ao-cues-grid' });
    vids[0].before(grid);
    vids.forEach((v, k) => {
      const cell = h('div', { class: 'ao-cues-cell' });
      const tag = h('span', { class: 'ao-cues-tag', text: name(k) });
      v.removeAttribute('controls');
      v.removeAttribute('loop');
      v.playsInline = true;
      v.tabIndex = 0; // without its controls a video takes no focus, and space on a focused cut plays them all
      v.addEventListener('click', () => toggle());
      cell.append(v, tag);
      grid.append(cell);
    });

    const bar = h('div', { class: 'ao-cues-bar' });
    const btn = (label, title, fn) => {
      const b = h('button', { type: 'button', text: label, title, onclick: fn });
      bar.append(b);
      return b;
    };
    const play = btn('Play', 'Play or pause every cut (space)', () => toggle());
    const sound = vids.length > 1
      ? vids.map((v, k) => btn('Sound: ' + name(k), 'Hear this cut', () => hear(k)))
      : [];
    const scrub = h('input', { type: 'range', min: '0', max: '1', step: '0.01', 'aria-label': 'Position' });
    scrub.value = '0';
    const clock = h('span', { class: 'ao-cues-clock' });
    bar.append(scrub, clock);
    grid.after(bar);

    ol.classList.add('ao-cues-list');
    ol.setAttribute('aria-label', 'Cues: choose one to jump there');
    for (const c of cues) {
      c.li.prepend(h('time', { text: fmtTime(c.t) }));
      c.li.tabIndex = 0;
      c.li.setAttribute('role', 'button');
      c.li.addEventListener('click', () => seek(c.t, true));
      c.li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seek(c.t, true); }
      });
    }

    const each = (fn) => vids.forEach(fn);
    let heard = 0;
    const hear = (k) => {
      heard = k;
      each((v, i) => { v.muted = i !== k; });
      sound.forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
    };

    // What the reader asked for, which the videos' own paused flags can't say: while one cut
    // waits for data the others are paused on purpose, and that isn't the reader pausing.
    let want = false;
    const stalled = new Set();
    const ours = new WeakSet(); // pauses made here, so their pause events aren't read as the reader's
    const pauseOne = (v) => { if (!v.paused) { ours.add(v); v.pause(); } };
    // Line every follower up with the lead, then set them all off.
    const go = () => {
      for (const v of followers) {
        v.playbackRate = 1;
        if (Math.abs(v.currentTime - lead.currentTime) > 0.05) v.currentTime = lead.currentTime;
      }
      each((v) => { if (v.paused) v.play().catch(() => {}); });
    };
    const start = () => {
      want = true;
      stalled.clear();
      claim(this);
      each((v) => { v.preload = 'auto'; });
      go();
      show();
    };
    const stop = () => {
      want = false;
      stalled.clear();
      each((v) => { pauseOne(v); v.playbackRate = 1; });
      show();
    };
    const toggle = () => (want ? stop() : start());
    const seek = (t, play) => {
      each((v) => { v.currentTime = t; });
      show(t);
      if (play && !want) start();
    };
    scrub.addEventListener('input', () => seek(parseFloat(scrub.value), false));
    // A cut that runs dry while the others play: they wait for it, then all go on together.
    // Recovery is read from each cut's own buffer, not from its "playing" event: a cut that
    // stalls while another is also stalled gets paused, and a paused cut never fires one.
    const ready = (v) => v.readyState >= 3 && !v.seeking;
    const settle = () => {
      if (!want || !stalled.size) return;
      for (const v of [...stalled]) if (ready(v)) stalled.delete(v);
      if (!stalled.size) go();
      show();
    };
    for (const v of vids) {
      v.addEventListener('waiting', () => {
        if (!want) return;
        stalled.add(v);
        for (const o of vids) if (o !== v) pauseOne(o);
        show();
      });
      for (const ev of ['canplay', 'canplaythrough', 'seeked', 'playing']) v.addEventListener(ev, settle);
      v.addEventListener('pause', () => {
        if (ours.has(v)) { ours.delete(v); return; }
        // Paused from outside this element (the bar at the foot, a media key): the reader's pause.
        if (want && !v.ended) stop();
      });
    }
    lead.addEventListener('ended', () => stop());

    let lit = null;
    const show = (at) => {
      const t = typeof at === 'number' ? at : lead.currentTime;
      if (isFinite(lead.duration)) scrub.max = String(lead.duration);
      scrub.value = String(t);
      clock.textContent = want && stalled.size ? 'loading…' : fmtTime(t) + ' / ' + fmtTime(lead.duration);
      // Only when it changes: this runs every frame, and on WebKit a tap on a button whose text is replaced between
      // its press and its release fires no click.
      const label = want ? 'Pause' : 'Play';
      if (play.textContent !== label) play.textContent = label;
      let cur = null;
      for (const c of cues) if (c.t <= t + 0.05) cur = c; else break;
      if (cur === lit) return;
      if (lit) lit.li.removeAttribute('aria-current');
      lit = cur;
      if (!cur) return;
      cur.li.setAttribute('aria-current', 'true');
      // Scroll the list itself, never the page: scrollIntoView would yank the reader along.
      const top = cur.li.offsetTop - ol.offsetTop;
      if (top < ol.scrollTop || top + cur.li.offsetHeight > ol.scrollTop + ol.clientHeight) {
        ol.scrollTop = Math.max(0, top - ol.clientHeight / 3);
      }
    };
    // Followers drift on their own. Close a small gap with the playback rate (a few percent
    // either way, which nobody hears), and seek only when the gap is too big for that.
    const follow = () => {
      if (!want || stalled.size || lead.paused) return;
      for (const v of followers) {
        if (v.seeking || v.paused) continue;
        const gap = lead.currentTime - v.currentTime;
        if (Math.abs(gap) > 0.6) { v.playbackRate = 1; v.currentTime = lead.currentTime + 0.05; }
        else if (Math.abs(gap) > 0.04) v.playbackRate = 1 + Math.max(-0.08, Math.min(0.08, gap * 0.5));
        else if (v.playbackRate !== 1) v.playbackRate = 1;
      }
    };
    let lastFollow = 0;
    const loop = (now) => {
      show();
      if (now - lastFollow > 120) { lastFollow = now; follow(); }
      if (lead.paused) { this._raf = 0; return; }
      this._raf = requestAnimationFrame(loop);
    };
    for (const ev of ['play', 'pause', 'seeked', 'loadedmetadata', 'ended']) lead.addEventListener(ev, () => show());
    lead.addEventListener('play', () => { if (!this._raf) this._raf = requestAnimationFrame(loop); });
    // Animation frames stop in a background tab; timeupdate doesn't.
    lead.addEventListener('timeupdate', follow);
    this.addEventListener('keydown', (e) => {
      if (e.key === ' ' && (e.target === this || e.target.tagName === 'VIDEO')) { e.preventDefault(); toggle(); }
    });

    hear(0);
    this.aoPlay = start;
    this.aoPause = stop;
    this.aoPlaying = () => want;
    this.aoClock = () => lead;
    this.aoTitle = () => {
      const cap = this.querySelector(':scope > figcaption b')?.textContent.trim();
      return (cap ? cap + ' · ' : '') + 'sound: ' + name(heard);
    };
    this._onOther = (e) => { if (e.detail !== this && want) stop(); };
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => stop();
    this.classList.add('ao-cues-ready');
    show();
  }

  disconnectedCallback() {
    if (this._stop) this._stop();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._onOther) document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    this._raf = 0;
    this._ready = false;
  }
}

customElements.define('ao-cues', AoCues);
