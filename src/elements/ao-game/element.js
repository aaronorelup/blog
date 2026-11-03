// <ao-game>: a game from public/games/ played inside the post. Like <ao-model>, nothing downloads until the reader
// asks: a poster and a Play button first, then an iframe of the game's own page, with Fullscreen, Stop and an "own
// tab" link under it. The inner markup (a link to the game) is the no-JS fallback. Attributes: docs/COMPONENTS.md.
import { AO_LISTEN_PLAY, AO_STOP, claim, current } from '../_core/player.js';
import { h } from '../_lib/dom.js';

// A running game is a player like a video (_core/player.js). It pauses, sound and
// drawing both, when it is scrolled off screen, when the tab is hidden, when anything else on
// the page starts playing, and when the homepage closes the reader; a veil over the frame says
// so and resumes it on a click, so a fight never restarts under hands that aren't on the keys.
// The game page is same-origin, so pausing needs nothing from the game: its window's
// requestAnimationFrame is held (no frames, no GPU) and every AudioContext it made is
// suspended. If that hook can't be made, the game is unloaded instead. Stop unloads it either way.
class AoGame extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this._src = this.getAttribute('src');
    this._label = this.getAttribute('label') || 'Game';
    const size = this.getAttribute('size');
    const note = this.getAttribute('note');
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', this._label);
    this.innerHTML = '';

    this._stage = h('div', { class: 'ao-game-stage' });
    this.appendChild(this._stage);

    const bar = h('div', { class: 'ao-game-bar' }, note ? h('span', { class: 'ao-game-note', text: note }) : null);
    const mk = (text, cls, fn) => {
      const b = h('button', { type: 'button', class: 'ao-game-btn ' + cls, text, hidden: true, onclick: fn });
      bar.appendChild(b);
      return b;
    };
    this._full = mk('Fullscreen', 'ao-game-full', () => {
      const f = this._frame;
      if (!f) return;
      if (this._paused) this.resume();
      (f.requestFullscreen || f.webkitRequestFullscreen)?.call(f);
      f.focus();
    });
    this._stopBtn = mk('Stop game', 'ao-game-stop', () => this.unload('Stopped. Play it again to start over.'));
    this._stopBtn.title = 'Unload the game: frees its memory and stops everything it was doing';
    bar.appendChild(h('a', { href: this._src, target: '_blank', rel: 'noopener', text: 'Open in its own tab ↗',
      onclick: () => this.unload('Opened in its own tab.') }));
    this.appendChild(bar);
    this._sizeText = size;
    this.poster();

    this.aoPause = () => this.pause('Paused while something else plays.');
    this.aoPlaying = () => !!this._frame && !this._paused;
    this._onOther = (e) => { if (e.detail !== this) this.aoPause(); };
    this._onStop = () => this.pause('Paused.');
    this._onVis = () => { if (document.hidden) this.pause('Paused while the tab was in the background.'); };
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    document.addEventListener(AO_STOP, this._onStop);
    document.addEventListener('visibilitychange', this._onVis);
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting || !this._frame) return;
        if (document.fullscreenElement === this._frame) return;
        this.pause(this.getClientRects().length ? 'Paused when you scrolled away.' : 'Paused.');
      });
      this._io.observe(this._stage);
    }
  }

  poster(message) {
    const stage = this._stage;
    stage.replaceChildren();
    const poster = this.getAttribute('poster');
    if (poster) {
      stage.appendChild(h('img', { src: poster, alt: this._label, loading: 'lazy', class: 'ao-game-poster' }));
    }
    stage.appendChild(h('button', { type: 'button', class: 'ao-game-load',
      text: (message ? 'Play again' : 'Play it here') + (this._sizeText ? ' (' + this._sizeText + ')' : ''),
      onclick: () => this.load() }));
    if (message) stage.appendChild(h('p', { class: 'ao-game-msg', text: message }));
    this._full.hidden = true;
    this._stopBtn.hidden = true;
  }

  load() {
    const frame = h('iframe', { src: this._src, title: this._label, allow: 'fullscreen; gamepad; autoplay', allowfullscreen: true });
    const veil = h('button', { type: 'button', class: 'ao-game-veil', hidden: true, onclick: () => this.resume() });
    veil.innerHTML = '<span class="ao-game-veil-msg"></span><span class="ao-game-veil-go">Resume</span>';
    this._stage.replaceChildren(frame, veil);
    this._frame = frame;
    this._veil = veil;
    this._paused = false;
    this._hook = null;
    frame.addEventListener('load', () => {
      this._hook = this.hookFrame(frame);
      if (!this._paused) frame.focus();
    });
    this._full.hidden = false;
    this._stopBtn.hidden = false;
    claim(this);
  }

  // Reach into the game's window (same origin) before its engine starts, which only happens
  // on the first key or click inside it: hold animation frames and track its AudioContexts.
  hookFrame(frame) {
    let w;
    try { w = frame.contentWindow; if (!w || !w.document) return null; } catch (e) { return null; }
    const hook = { held: [], ctxs: [], paused: false };
    const raf = w.requestAnimationFrame.bind(w);
    w.requestAnimationFrame = (cb) => {
      if (hook.paused) { hook.held.push(cb); return 0; }
      return raf(cb);
    };
    hook.raf = raf;
    // A link in the game's own page (its "back" link, say) would load the whole site inside the
    // frame; open those at the top level instead.
    try {
      const d = w.document;
      if (!d.querySelector('base[target]')) { const b = d.createElement('base'); b.target = '_top'; d.head.prepend(b); }
    } catch (e) { /* no head yet */ }
    for (const name of ['AudioContext', 'webkitAudioContext']) {
      const Real = w[name];
      if (typeof Real !== 'function') continue;
      w[name] = new Proxy(Real, {
        construct(target, args, newTarget) {
          const ctx = Reflect.construct(target, args, newTarget === w[name] ? target : newTarget);
          hook.ctxs.push(ctx);
          return ctx;
        },
      });
    }
    // Starting the game from inside its own frame counts as pressing play.
    w.addEventListener('pointerdown', () => claim(this), true);
    w.addEventListener('keydown', () => { if (current !== this) claim(this); }, true);
    return hook;
  }

  pause(message) {
    if (!this._frame || this._paused) return;
    const hook = this._hook;
    // No hook (the frame isn't loaded yet, or isn't reachable): stopping is the only pause.
    if (!hook) { this.unload(message.replace(/^Paused/, 'Stopped')); return; }
    this._paused = true;
    hook.paused = true;
    for (const c of hook.ctxs) if (c.state === 'running') c.suspend().catch(() => {});
    try { for (const m of this._frame.contentDocument.querySelectorAll('video, audio')) m.pause(); } catch (e) { /* gone */ }
    if (document.activeElement === this._frame) this._frame.blur();
    this._veil.querySelector('.ao-game-veil-msg').textContent = message;
    this._veil.hidden = false;
  }

  resume() {
    const hook = this._hook;
    if (!this._frame || !this._paused || !hook) return;
    this._paused = false;
    hook.paused = false;
    for (const cb of hook.held.splice(0)) hook.raf(cb);
    for (const c of hook.ctxs) if (c.state === 'suspended') c.resume().catch(() => {});
    this._veil.hidden = true;
    this._frame.focus();
    claim(this);
  }

  unload(message) {
    if (!this._frame) return;
    this._frame = null;
    this._hook = null;
    this._paused = false;
    this.poster(message);
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; stop the game when this one leaves.
    this._frame = null;
    this._stage?.replaceChildren();
    this._io?.disconnect();
    document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    document.removeEventListener(AO_STOP, this._onStop);
    document.removeEventListener('visibilitychange', this._onVis);
    this._ready = false;
  }
}

customElements.define('ao-game', AoGame);
