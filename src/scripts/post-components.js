// Custom elements that posts can use from plain Markdown (raw HTML is allowed there).
// A post reaches readers two ways: its own /ledger/<slug>/ page, and the homepage panel,
// where openPost() copies the article in with innerHTML. Scripts inside that HTML never run,
// so behaviour lives here as custom elements: PostView loads this module on the standalone
// page and openPost() imports it on the homepage, and the browser upgrades the tags either way.
// The stylesheet is imported by this module, so it reaches both surfaces with it.
//
//   <ao-compare cols="3" aspect="4/3" sync> <figure>…</figure> … </ao-compare>
//   <ao-model src="/media/x/model.glb" poster="/media/x/model.webp" size="2.1 MB" label="…">
//   <ao-timeline lanes="a:Session A|b:Session B" views="b:What B saw"> <ol><li data-lane="a">…
//   <ao-game src="/games/x/" poster="/media/x/poster.jpg" size="12 MB" label="…" note="…">
//   <ao-slider aspect="16/9" labels="Before|After"> <img …> <img …> <figcaption>…</figcaption>
//   <ao-frames fps="24" marks="46:Impact|47:Red frame"> <video …></video> <figcaption>…
//   <ao-diff labels="Draft|Final"> <blockquote>…</blockquote> <blockquote>…</blockquote> <figcaption>…
//   <ao-listen ref="a"> <figure data-id="a"><audio …></audio><img …><figcaption>…</figure> …
//   <ao-cues labels="v1|v2"> <video …></video> <video …></video> <ol><li data-t="1:44.97">…</li></ol> <figcaption>…
//   <ao-demo name="synthid" part="tournament"> fallback text </ao-demo>
//
// Two behaviours need no tag at all and apply to every post: one player at a time (below),
// and the image viewer (every picture in a post opens full size, zooms and pages through the
// post's other pictures). Usage notes live in the blog's CLAUDE.md, "Post components".
import '../styles/post-components.css';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtTime = (s) => (isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00');

// ---------------------------------------------------------------------------------------
// One player at a time, across the whole page. A "player" is whatever plays as one unit: a
// lone <video> or <audio>, a component that drives several in step (a synced <ao-compare>,
// <ao-cues>, <ao-listen>), a same-origin iframe with its own player in it, or a running
// <ao-game>. Starting one pauses every other, so a reader never has two soundtracks at once
// and a forgotten loop never keeps decoding three screens up.
//
// What a playing player does when it leaves the screen depends on what it is:
//   - hidden outright (the homepage closed the reader or switched views): it stops.
//   - scrolled away and silent (a muted loop, a B-roll clip): it pauses, and carries on when
//     it is scrolled back to, unless something else has played since.
//   - scrolled away with sound: it keeps playing, because the reader may be listening while
//     they read on, and a small bar at the foot of the window says what's playing, with
//     pause, a way back to it, and close.
//   - a game pauses itself (see <ao-game>).
// Components can give their element aoPlay()/aoPause() (and aoTitle()/aoClock() for the bar);
// anything else is driven through the media elements inside it.
const AO_LISTEN_PLAY = 'ao-listen-play'; // detail: the player that just started
const AO_STOP = 'ao-stop'; // the homepage closing the reader: stop everything
const GROUPS = 'ao-cues, ao-compare[sync], ao-listen, ao-game';
const isMediaEl = (el) => !!el && (el.tagName === 'VIDEO' || el.tagName === 'AUDIO');
const playerOf = (el) => (el.closest && el.closest(GROUPS)) || frameOf.get(el.ownerDocument) || el;
const frameOf = new WeakMap(); // an iframe's document -> the iframe, for media inside it
const frames = new Set();
let current = null;

const mediaOf = (p) => {
  if (isMediaEl(p)) return [p];
  if (p.tagName === 'IFRAME') {
    try { return [...p.contentDocument.querySelectorAll('video, audio')]; } catch (e) { return []; }
  }
  return [...p.querySelectorAll('video, audio')];
};
const isPlaying = (p) => (p.aoPlaying ? p.aoPlaying() : mediaOf(p).some((m) => !m.paused && !m.ended));
// Silent: everything playing is muted, at zero volume, or a video that has played a while and
// decoded no sound. A player whose media are all paused for a moment (cuts waiting on a stalled
// one) isn't silent, it's waiting.
const isSilent = (p) => {
  const on = mediaOf(p).filter((m) => !m.paused);
  return on.length > 0 && on.every((m) => m.muted || m.volume === 0 || (m.tagName === 'VIDEO' &&
    (m.mozHasAudio === false || (m.webkitAudioDecodedByteCount === 0 && m.currentTime > 1))));
};
const pausePlayer = (p) => (p.aoPause ? p.aoPause() : mediaOf(p).forEach((m) => { if (!m.paused) m.pause(); }));

function claim(p) {
  const changed = current !== p;
  if (changed && current) {
    current._aoResume = null;
    pausePlayer(current);
  }
  current = p;
  // Anything else still playing stops too: a player that started before this module loaded,
  // or one inside a frame that was never seen starting.
  for (const m of document.querySelectorAll('video, audio')) if (!m.paused && playerOf(m) !== p) m.pause();
  for (const f of frames) if (f !== p) mediaOf(f).forEach((m) => { if (!m.paused) m.pause(); });
  if (changed) document.dispatchEvent(new CustomEvent(AO_LISTEN_PLAY, { detail: p }));
  watch(p);
  nowPlaying.update();
}

const onMediaPlay = (e) => { if (isMediaEl(e.target)) claim(playerOf(e.target)); };
document.addEventListener('play', onMediaPlay, true);
// The bar's clock and buttons follow whatever the current player's media do.
for (const type of ['pause', 'ended', 'timeupdate', 'volumechange']) {
  document.addEventListener(type, (e) => { if (current && isMediaEl(e.target) && playerOf(e.target) === current) nowPlaying.update(type); }, true);
}
document.addEventListener(AO_STOP, () => {
  for (const m of document.querySelectorAll('video, audio')) if (!m.paused) m.pause();
  for (const f of frames) mediaOf(f).forEach((m) => m.pause());
  if (current) { current._aoResume = null; pausePlayer(current); }
  nowPlaying.update();
});

// A same-origin iframe (the BLACKWATER player page, say) is a player too: its media are
// reachable, so starting one pauses the post's and the other way round.
function hookFrame(f) {
  if (frames.has(f) || f.closest('ao-game')) return;
  let doc;
  try { doc = f.contentDocument; } catch (e) { return; }
  if (!doc || doc.URL === 'about:blank') return;
  frames.add(f);
  frameOf.set(doc, f);
  doc.addEventListener('play', (e) => { if (isMediaEl(e.target)) claim(f); }, true);
  for (const type of ['pause', 'ended', 'timeupdate']) doc.addEventListener(type, () => { if (current === f) nowPlaying.update(type); }, true);
}
document.addEventListener('load', (e) => { if (e.target && e.target.tagName === 'IFRAME') hookFrame(e.target); }, true);

// Where the current player is, relative to the screen.
const sight = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => onSight(e.target, e.isIntersecting)))
  : null;
const watched = new WeakSet();
function watch(p) {
  if (!sight || watched.has(p) || p.localName === 'ao-game') return;
  watched.add(p);
  sight.observe(p);
}
function onSight(p, inView) {
  p._aoInView = inView;
  if (inView) {
    const resume = p._aoResume;
    p._aoResume = null;
    if (resume && p === current) (p.aoPlay ? p.aoPlay() : resume.forEach((m) => m.play().catch(() => {})));
  } else if (!p.isConnected || !p.getClientRects().length) {
    p._aoResume = null;
    pausePlayer(p);
  } else if (p === current && isPlaying(p) && isSilent(p)) {
    p._aoResume = mediaOf(p).filter((m) => !m.paused);
    pausePlayer(p);
  }
  nowPlaying.update();
}

// The bar at the foot of the window while something with sound plays off screen.
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

const nowPlaying = {
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
      this.update();
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
  update(type) {
    const p = current;
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

// ---------------------------------------------------------------------------------------
// The image viewer. Every picture in a post opens full size on click (or Enter), in a viewer
// that zooms (wheel, pinch, double-tap, +/-, or a click on the picture) around the pointer,
// pans by dragging, and pages through the post's other pictures in reading order (arrows,
// swipe, the side buttons), so the frames of one comparison or the sheets of one film are a
// keypress apart. The post's own copy shows at once; a larger file, if the image names one in
// data-full="…" (or in srcset), replaces it at the same size when it arrives. Pictures inside
// links, sliders, model and game posters and spectrograms keep their own click.
const NO_VIEWER = 'a[href], button, ao-slider, ao-model, ao-game, ao-listen, [data-no-zoom]';
const viewable = (img) =>
  img.tagName === 'IMG' && !!img.closest('[data-post-article], .pc-prose') && !img.closest(NO_VIEWER);
const bestSrc = (img) => {
  if (img.dataset.full) return img.dataset.full;
  const set = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/))
    .filter((p) => p[0] && /^\d+w$/.test(p[1] || '')).sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10));
  return set.length ? set[0][0] : img.currentSrc || img.src;
};
const captionOf = (img) => {
  const cap = img.closest('figure, ao-slider')?.querySelector('figcaption');
  const title = cap?.querySelector('b')?.textContent.trim() || '';
  const meta = cap?.querySelector('.ao-meta')?.textContent.trim() || '';
  // A slider's two sides share one caption; each side's own label leads.
  if (img.dataset.label) return { title: img.dataset.label, meta: [title, meta].filter(Boolean).join(' · ') };
  if (title || meta) return { title, meta };
  return { title: cap ? cap.textContent.trim() : '', meta: cap ? '' : img.alt || '' };
};

const viewer = {
  dlg: null,
  list: [],
  i: 0,
  s: 1, tx: 0, ty: 0, // zoom (1 = fitted to the screen) and pan from centre, in screen px
  fit: { w: 0, h: 0 },
  nat: { w: 0, h: 0 },
  build() {
    const d = document.createElement('dialog');
    d.className = 'ao-lb';
    d.setAttribute('aria-label', 'Image viewer');
    d.tabIndex = -1;
    d.innerHTML =
      '<div class="ao-lb-stage"><img class="ao-lb-img" alt="" draggable="false"><span class="ao-lb-wait" hidden>loading full size…</span></div>' +
      '<div class="ao-lb-top"><span class="ao-lb-count"></span><span class="ao-lb-tools">' +
      '<button type="button" data-act="out" aria-label="Zoom out" title="Zoom out (−)">−</button>' +
      '<button type="button" data-act="fit" class="ao-lb-zoom" title="Fit to screen (0)">fit</button>' +
      '<button type="button" data-act="in" aria-label="Zoom in" title="Zoom in (+)">+</button>' +
      '<a class="ao-lb-orig" target="_blank" rel="noopener" title="Open the file in a new tab">file ↗</a>' +
      '<button type="button" data-act="close" class="ao-lb-close" aria-label="Close" title="Close (Esc)">×</button>' +
      '</span></div>' +
      '<button type="button" class="ao-lb-nav ao-lb-prev" data-act="prev" aria-label="Previous picture" title="Previous (←)">‹</button>' +
      '<button type="button" class="ao-lb-nav ao-lb-next" data-act="next" aria-label="Next picture" title="Next (→)">›</button>' +
      '<div class="ao-lb-cap"><b></b><span></span></div>';
    document.body.appendChild(d);
    this.dlg = d;
    this.img = d.querySelector('.ao-lb-img');
    this.stage = d.querySelector('.ao-lb-stage');
    this.wait = d.querySelector('.ao-lb-wait');
    d.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'close') this.close();
      else if (act === 'prev') this.go(-1);
      else if (act === 'next') this.go(1);
      else if (act === 'in') this.zoomTo(this.s * 1.6);
      else if (act === 'out') this.zoomTo(this.s / 1.6);
      else if (act === 'fit') this.zoomTo(this.s > 1.01 ? 1 : this.actual());
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); this.close(); });
    // close() does the cleanup itself; this catches a close from anywhere else.
    d.addEventListener('close', () => { if (!d.open) this.cleanup(); }); // a late event after a quick reopen is ignored
    d.addEventListener('keydown', (e) => this.key(e));
    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 400 : 1;
      this.zoomAt(e.clientX, e.clientY, this.s * Math.exp(-e.deltaY * k * 0.0016));
    }, { passive: false });
    this.pointers();
    this.onResize = () => this.layout(true);
  },
  // list: the pictures to page through (default: every viewable one in the same post).
  open(img, list) {
    const root = img.closest('[data-post-article]') || img.closest('.pc-prose') || document;
    this.list = list || [...root.querySelectorAll('img')].filter(viewable);
    if (!this.list.includes(img)) this.list = [img];
    if (!this.dlg) this.build();
    this.opener = img;
    this.dlg.classList.toggle('ao-lb-single', this.list.length < 2);
    if (!this.dlg.open) {
      this.cleaned = false;
      this.dlg.showModal();
      this.dlg.focus();
      window.addEventListener('resize', this.onResize);
      // Back closes the viewer rather than leaving the post (what a phone user reaches for). The
      // homepage's router owns its history, so there the viewer only closes when the route moves.
      if (!document.querySelector('[data-view="reader"]')) {
        history.pushState(Object.assign({}, history.state, { aoViewer: true }), '');
        this.pushed = true;
      }
    }
    this.show(this.list.indexOf(img));
  },
  // Cleanup runs here, not only on the dialog's close event: that event is queued for the next
  // rendered frame, and history.back() must not wait on one.
  close() {
    if (!this.dlg?.open) return;
    this.dlg.close();
    this.cleanup();
  },
  cleanup() {
    if (this.cleaned) return;
    this.cleaned = true;
    window.removeEventListener('resize', this.onResize);
    if (this.pushed) { this.pushed = false; history.back(); }
    this.img.removeAttribute('src');
    // Back to the picture the viewer was opened from, without the page jumping to it.
    try { this.opener?.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
  },
  go(step) {
    if (this.list.length < 2) return;
    this.show((this.i + step + this.list.length) % this.list.length);
  },
  show(i) {
    this.i = i;
    const src = this.list[i];
    const shown = src.currentSrc || src.src;
    const full = bestSrc(src);
    this.nat = { w: src.naturalWidth || 1600, h: src.naturalHeight || 900 };
    this.img.alt = src.alt || '';
    this.img.src = shown;
    this.dlg.querySelector('.ao-lb-orig').href = full;
    this.dlg.querySelector('.ao-lb-count').textContent = this.list.length > 1 ? i + 1 + ' / ' + this.list.length : '';
    const cap = captionOf(src);
    this.dlg.querySelector('.ao-lb-cap b').textContent = cap.title;
    this.dlg.querySelector('.ao-lb-cap span').textContent = cap.meta;
    this.dlg.querySelector('.ao-lb-cap').hidden = !cap.title && !cap.meta;
    this.layout(false);
    this.wait.hidden = true;
    if (full !== shown) {
      const big = new Image();
      big.decoding = 'async';
      const slow = setTimeout(() => { if (this.i === i) this.wait.hidden = false; }, 250);
      big.onload = () => {
        clearTimeout(slow);
        if (this.i !== i || !this.dlg.open) return;
        this.wait.hidden = true;
        this.img.src = full;
        this.nat = { w: big.naturalWidth, h: big.naturalHeight };
        this.layout(this.s > 1.01);
      };
      big.onerror = () => { clearTimeout(slow); this.wait.hidden = true; };
      big.src = full;
    }
    // Have the neighbours ready, so paging never waits.
    for (const k of [i + 1, i - 1]) {
      const n = this.list[(k + this.list.length) % this.list.length];
      if (n && n !== src && !n.complete) { const pre = new Image(); pre.src = n.currentSrc || n.src; }
    }
  },
  // Fit the picture into the space between the toolbar and the caption, never past its own
  // pixels. keep=true leaves the zoom where it is (a larger file arrived, or the window moved).
  layout(keep) {
    const r = this.stage.getBoundingClientRect();
    const scale = Math.min(r.width / this.nat.w, r.height / this.nat.h, 1);
    const prev = this.fit.w;
    this.fit = { w: Math.max(1, this.nat.w * scale), h: Math.max(1, this.nat.h * scale) };
    this.img.style.width = this.fit.w + 'px';
    this.img.style.height = this.fit.h + 'px';
    if (keep && prev) {
      const k = prev / this.fit.w;
      this.s *= k;
    } else {
      this.s = 1; this.tx = 0; this.ty = 0;
    }
    this.apply();
  },
  actual() { return Math.max(2, this.nat.w / this.fit.w); },
  max() { return Math.max(4, (this.nat.w / this.fit.w) * 3); },
  zoomTo(s) {
    const r = this.stage.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, s);
  },
  // Zoom so the point under (x, y) stays under it.
  zoomAt(x, y, s) {
    const r = this.stage.getBoundingClientRect();
    const next = Math.min(this.max(), Math.max(1, s));
    const cx = r.left + r.width / 2 + this.tx;
    const cy = r.top + r.height / 2 + this.ty;
    const k = next / this.s;
    this.tx = x - (x - cx) * k - (r.left + r.width / 2);
    this.ty = y - (y - cy) * k - (r.top + r.height / 2);
    this.s = next;
    this.apply();
  },
  apply(drag) {
    const r = this.stage.getBoundingClientRect();
    const w = this.fit.w * this.s;
    const h = this.fit.h * this.s;
    // Keep the picture over the stage: centred on an axis where it fits, edge to edge where not.
    const mx = Math.max(0, (w - r.width) / 2);
    const my = Math.max(0, (h - r.height) / 2);
    if (this.s <= 1.001) { this.s = 1; if (!drag) { this.tx = 0; this.ty = 0; } }
    else { this.tx = Math.min(mx, Math.max(-mx, this.tx)); this.ty = Math.min(my, Math.max(-my, this.ty)); }
    this.img.style.transform = `translate(-50%, -50%) translate(${this.tx}px, ${this.ty}px) scale(${this.s})`;
    this.dlg.classList.toggle('ao-lb-zoomed', this.s > 1.01);
    const z = this.dlg.querySelector('.ao-lb-zoom');
    z.textContent = this.s > 1.01 ? Math.round((this.s * this.fit.w / this.nat.w) * 100) + '%' : 'fit';
    z.setAttribute('aria-label', this.s > 1.01 ? 'Zoomed to ' + z.textContent + '; fit to screen' : 'Show at full size');
  },
  key(e) {
    const k = e.key;
    // Keys the viewer uses stop here: the homepage closes its reader on Escape and would
    // otherwise close it under the viewer.
    if (['Escape', 'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', 'Home', 'End', '+', '=', '-', '_', '0', '1'].includes(k)) e.stopPropagation();
    if (k === 'Escape') { e.preventDefault(); this.close(); }
    else if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); this.go(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); this.go(-1); }
    else if (k === 'Home') { e.preventDefault(); this.show(0); }
    else if (k === 'End') { e.preventDefault(); this.show(this.list.length - 1); }
    else if (k === '+' || k === '=') { e.preventDefault(); this.zoomTo(this.s * 1.6); }
    else if (k === '-' || k === '_') { e.preventDefault(); this.zoomTo(this.s / 1.6); }
    else if (k === '0') { e.preventDefault(); this.zoomTo(1); }
    else if (k === '1') { e.preventDefault(); this.zoomTo(this.nat.w / this.fit.w); }
  },
  // Mouse: click the picture to zoom in there, click again to fit; drag to pan when zoomed;
  // click the dark around it to close. Touch: double-tap zooms, pinch zooms, one finger pans
  // when zoomed and swipes to the next picture (or down, to close) when not.
  pointers() {
    const pts = new Map();
    let start = null; // gesture start: pointer positions, zoom, pan
    let lastTap = 0;
    const st = this.stage;
    const mid = () => {
      const v = [...pts.values()];
      return { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2, d: Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) || 1 };
    };
    st.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      st.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      start = { x: e.clientX, y: e.clientY, s: this.s, tx: this.tx, ty: this.ty, moved: false, onImg: e.target === this.img, type: e.pointerType, two: pts.size === 2 ? mid() : null };
      this.dlg.classList.add('ao-lb-active');
    });
    st.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const m = mid();
        if (!start.two) start = { ...start, two: m, s: this.s, tx: this.tx, ty: this.ty };
        start.moved = true;
        const r = st.getBoundingClientRect();
        // Pinch: scale about the starting midpoint, then follow the midpoint as it moves.
        const k = Math.min(this.max(), Math.max(1, start.s * (m.d / start.two.d))) / start.s;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        this.s = start.s * k;
        this.tx = start.two.x - (start.two.x - (cx + start.tx)) * k - cx + (m.x - start.two.x);
        this.ty = start.two.y - (start.two.y - (cy + start.ty)) * k - cy + (m.y - start.two.y);
        this.apply(true);
        return;
      }
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > 6) start.moved = true;
      if (!start.moved) return;
      if (this.s > 1.01) { this.tx = start.tx + dx; this.ty = start.ty + dy; this.apply(); }
      else if (start.type !== 'mouse') {
        // Swipe preview: the picture follows the finger.
        this.img.style.transform = `translate(-50%, -50%) translate(${Math.abs(dx) > Math.abs(dy) ? dx : 0}px, ${Math.abs(dy) > Math.abs(dx) ? Math.max(0, dy) : 0}px)`;
      }
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      const was = pts.get(e.pointerId);
      pts.delete(e.pointerId);
      if (pts.size) { start = { ...start, x: [...pts.values()][0].x, y: [...pts.values()][0].y, s: this.s, tx: this.tx, ty: this.ty, two: null }; return; }
      this.dlg.classList.remove('ao-lb-active');
      const g = start;
      start = null;
      if (!g || e.type === 'pointercancel') { this.apply(); return; }
      const dx = was.x - g.x;
      const dy = was.y - g.y;
      if (g.moved) {
        if (g.two || this.s > 1.01 || g.type === 'mouse') { this.apply(); return; }
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { this.go(dx < 0 ? 1 : -1); return; }
        if (dy > 90 && dy > Math.abs(dx) * 1.3) { this.close(); return; }
        this.apply();
        return;
      }
      // A tap or a click.
      if (g.type === 'mouse') {
        if (!g.onImg) { if (this.s <= 1.01) this.close(); return; }
        if (this.s > 1.01) this.zoomTo(1);
        else this.zoomAt(g.x, g.y, this.actual());
        return;
      }
      const now = performance.now();
      if (now - lastTap < 320) {
        lastTap = 0;
        if (this.s > 1.01) this.zoomTo(1); else this.zoomAt(g.x, g.y, Math.max(2.5, this.actual()));
        return;
      }
      lastTap = now;
      if (!g.onImg && this.s <= 1.01) setTimeout(() => { if (lastTap === now) this.close(); }, 330);
    };
    st.addEventListener('pointerup', end);
    st.addEventListener('pointercancel', end);
  },
};

window.addEventListener('popstate', () => {
  if (!viewer.dlg?.open) return;
  viewer.pushed = false; // that entry is already gone
  viewer.close();
});
document.addEventListener(AO_STOP, () => viewer.close());
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button > 0) return;
  const img = e.target.closest && e.target.closest('img');
  if (img && viewable(img)) { e.preventDefault(); viewer.open(img); }
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'IMG' && viewable(e.target)) {
    e.preventDefault();
    viewer.open(e.target);
  }
});

// Make a post's pictures reachable from the keyboard and hook its same-origin frames. Runs on
// the standalone page by itself; the homepage calls it after it swaps a post in.
export function enhance(root = document) {
  for (const img of root.querySelectorAll('img')) {
    if (!viewable(img) || img.hasAttribute('tabindex')) continue;
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  }
  for (const f of root.querySelectorAll('iframe')) {
    try { if (f.contentDocument?.readyState === 'complete') hookFrame(f); } catch (e) { /* cross-origin */ }
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance());
else enhance();

// ---------------------------------------------------------------------------------------
// <ao-compare>: a grid of same-sized frames, so outputs can be judged side by side.
//   cols="N"      columns on wide screens (default 2; phones always get 1, tablets 2)
//   aspect="w/h"  the frame every item is fitted into, letterboxed on one background
//   sync          videos inside play, pause and seek together
// Its stills open in the image viewer like every other picture in a post.
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

// ---------------------------------------------------------------------------------------
// <ao-model>: a GLB the reader can turn around. Nothing heavy loads until they ask: the
// poster and a button show first, and three.js plus the model arrive on click. Drag to
// orbit, scroll or pinch to zoom; it turns slowly on its own until touched.
//   src     the .glb (keep it a few MB: 1K textures, ~30k triangles is plenty)
//   poster  still shown before loading
//   size    shown on the button so the reader knows what the click costs
//   label   what it is, for the button and for screen readers
class AoModel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const poster = this.getAttribute('poster');
    const label = this.getAttribute('label') || '3D model';
    const size = this.getAttribute('size');
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', label);
    this.innerHTML = '';
    if (poster) {
      const img = document.createElement('img');
      img.src = poster; img.alt = label; img.loading = 'lazy'; img.className = 'ao-model-poster';
      this.appendChild(img);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ao-model-load';
    btn.textContent = 'Turn it around in 3D' + (size ? ' (' + size + ')' : '');
    btn.addEventListener('click', () => this.load(btn));
    this.appendChild(btn);
  }

  async load(btn) {
    btn.disabled = true;
    btn.textContent = 'Loading…';
    try {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      const gltf = await new GLTFLoader().loadAsync(this.getAttribute('src'));
      if (!this.isConnected) return;
      this.mount(THREE, OrbitControls, RoomEnvironment, gltf);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Could not load the model. Try again';
      console.error(err);
    }
  }

  mount(THREE, OrbitControls, RoomEnvironment, gltf) {
    this.querySelector('.ao-model-poster')?.remove();
    this.querySelector('.ao-model-load')?.remove();
    const canvas = document.createElement('canvas');
    canvas.className = 'ao-model-canvas';
    this.appendChild(canvas);
    const hint = document.createElement('div');
    hint.className = 'ao-model-hint';
    hint.textContent = 'drag to turn · scroll or pinch to zoom';
    this.appendChild(hint);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2, 3, 2.5);
    scene.add(key, new THREE.HemisphereLight(0xfff4e0, 0x202030, 0.6));

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const dim = box.getSize(new THREE.Vector3());
    const radius = Math.max(dim.x, dim.y, dim.z) * 0.62;
    model.position.sub(center);
    scene.add(model);

    const camera = new THREE.PerspectiveCamera(32, 1, radius / 50, radius * 50);
    camera.position.set(0, radius * 0.25, radius * 3.4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.4;
    controls.minDistance = radius * 0.8;
    controls.maxDistance = radius * 8;
    controls.addEventListener('start', () => { controls.autoRotate = false; hint.remove(); });

    const resize = () => {
      const w = this.clientWidth || 600;
      const h = Math.round(w * (this.getAttribute('ratio') === 'wide' ? 0.56 : 0.8));
      renderer.setSize(w, h, false);
      canvas.style.height = h + 'px';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    this._ro = new ResizeObserver(resize);
    this._ro.observe(this);

    // Only draw while on screen; a post can hold several of these.
    let visible = true;
    this._io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    this._io.observe(this);
    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      if (!visible) return;
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    this._dispose = () => {
      cancelAnimationFrame(this._raf);
      this._ro?.disconnect();
      this._io?.disconnect();
      controls.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; free the GPU when this one leaves.
    if (this._dispose) { this._dispose(); this._dispose = null; }
  }
}

// ---------------------------------------------------------------------------------------
// <ao-timeline>: events from several concurrent sources (sessions, agents, people) in one
// time order, each on its own rail, so what overlapped is visible at a glance.
//   lanes="a:Session A|b:Session B"   rail key and label, left to right
//   views="b:What B could see"        optional buttons that dim every event not tagged with
//                                     that key in its data-in, to show one party's view
// Each event is an <li data-lane="a" data-in="b c"> inside one <ol>, with a <time> first.
// Without JS it is still an ordered list with times, which is the whole content.
class AoTimeline extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const parse = (s) => (s || '').split('|').map((p) => {
      const i = p.indexOf(':');
      return { key: p.slice(0, i).trim(), label: p.slice(i + 1).trim() };
    }).filter((x) => x.key);
    const lanes = parse(this.getAttribute('lanes'));
    const views = parse(this.getAttribute('views'));
    const list = this.querySelector('ol');
    if (!list || !lanes.length) return;
    this.style.setProperty('--ao-lanes', String(lanes.length));

    const head = document.createElement('div');
    head.className = 'ao-tl-head';
    const legend = document.createElement('ul');
    legend.className = 'ao-tl-legend';
    lanes.forEach((l, i) => {
      const li = document.createElement('li');
      li.dataset.laneIdx = String(i);
      li.textContent = l.label;
      legend.appendChild(li);
    });
    head.appendChild(legend);

    for (const ev of list.children) {
      const idx = Math.max(0, lanes.findIndex((l) => l.key === ev.dataset.lane));
      ev.dataset.laneIdx = String(idx);
      const rail = document.createElement('span');
      rail.className = 'ao-tl-rail';
      rail.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < lanes.length; i++) {
        const r = document.createElement('i');
        r.dataset.laneIdx = String(i);
        if (i === idx) r.className = 'on';
        rail.appendChild(r);
      }
      const body = document.createElement('div');
      body.className = 'ao-tl-body';
      const who = document.createElement('span');
      who.className = 'ao-tl-who';
      who.textContent = lanes[idx].label;
      while (ev.firstChild) body.appendChild(ev.firstChild);
      const t = body.querySelector('time');
      if (t) t.after(who); else body.prepend(who);
      ev.append(rail, body);
    }

    if (views.length) {
      const bar = document.createElement('div');
      bar.className = 'ao-tl-views';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show whose view');
      const all = [{ key: '', label: 'Everything' }, ...views];
      const buttons = all.map((v) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = v.label;
        b.setAttribute('aria-pressed', v.key ? 'false' : 'true');
        b.addEventListener('click', () => {
          for (const o of buttons) o.setAttribute('aria-pressed', String(o === b));
          for (const ev of list.children) {
            const keys = (ev.dataset.in || '').split(/\s+/);
            ev.classList.toggle('ao-tl-out', !!v.key && !keys.includes(v.key));
          }
          this.toggleAttribute('filtered', !!v.key);
        });
        bar.appendChild(b);
        return b;
      });
      head.appendChild(bar);
    }
    this.prepend(head);
  }
}

// ---------------------------------------------------------------------------------------
// <ao-game>: a game from public/games/ played inside the post. Like <ao-model>, nothing
// downloads until the reader asks: a poster and a Play button first, then an iframe of the
// game's own page. Fullscreen, Stop and an "own tab" link sit under the frame.
//   src     the game's page, e.g. /games/storm-bell/
//   poster  still shown before loading
//   size    shown on the button so the reader knows what the click costs
//   label   what it is, for the button and for screen readers
//   aspect  the frame, default 16/9
//   note    one line under the frame (controls, what it needs)
// The inner markup (a link to the game) is the no-JS fallback.
//
// A running game is a player like a video (see "One player at a time"). It pauses, sound and
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

    this._stage = document.createElement('div');
    this._stage.className = 'ao-game-stage';
    this.appendChild(this._stage);

    const bar = document.createElement('div');
    bar.className = 'ao-game-bar';
    if (note) {
      const n = document.createElement('span');
      n.className = 'ao-game-note';
      n.textContent = note;
      bar.appendChild(n);
    }
    const mk = (text, cls, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ao-game-btn ' + cls;
      b.textContent = text;
      b.hidden = true;
      b.addEventListener('click', fn);
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
    const tab = document.createElement('a');
    tab.href = this._src;
    tab.target = '_blank';
    tab.rel = 'noopener';
    tab.textContent = 'Open in its own tab ↗';
    tab.addEventListener('click', () => this.unload('Opened in its own tab.'));
    bar.appendChild(tab);
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
      const img = document.createElement('img');
      img.src = poster; img.alt = this._label; img.loading = 'lazy'; img.className = 'ao-game-poster';
      stage.appendChild(img);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ao-model-load ao-game-load';
    btn.textContent = (message ? 'Play again' : 'Play it here') + (this._sizeText ? ' (' + this._sizeText + ')' : '');
    btn.addEventListener('click', () => this.load());
    stage.appendChild(btn);
    if (message) {
      const m = document.createElement('p');
      m.className = 'ao-game-msg';
      m.textContent = message;
      stage.appendChild(m);
    }
    this._full.hidden = true;
    this._stopBtn.hidden = true;
  }

  load() {
    const frame = document.createElement('iframe');
    frame.src = this._src;
    frame.title = this._label;
    frame.allow = 'fullscreen; gamepad; autoplay';
    frame.allowFullscreen = true;
    const veil = document.createElement('button');
    veil.type = 'button';
    veil.className = 'ao-game-veil';
    veil.hidden = true;
    veil.innerHTML = '<span class="ao-game-veil-msg"></span><span class="ao-game-veil-go">Resume</span>';
    veil.addEventListener('click', () => this.resume());
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

// ---------------------------------------------------------------------------------------
// <ao-slider>: two images of the same frame, one over the other, with a divider the reader
// drags (or moves with the arrow keys) to wipe between them. For before/after pairs where the
// difference is in the detail: a mask, a fill, a fix.
//   aspect="w/h"      the frame both images are fitted into (default 16/9)
//   labels="A|B"      tags for the left and right image (default: each image's alt)
//   start="50"        where the divider starts, in percent
// The first <img> is the left side, the second the right; an optional <figcaption> sits under
// the frame. Without JS the two images and the caption just stack.
class AoSlider extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (imgs.length < 2) return;
    this._ready = true;
    const [a, b] = imgs;
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const labels = (this.getAttribute('labels') || '').split('|');
    const la = labels[0] || a.alt || 'Before';
    const lb = labels[1] || b.alt || 'After';

    const stage = document.createElement('div');
    stage.className = 'ao-slider-stage';
    a.classList.add('ao-slider-a');
    b.classList.add('ao-slider-b');
    // Both are in view the moment the frame is, so neither should wait on lazy loading.
    a.loading = 'eager';
    b.loading = 'eager';
    stage.append(a, b);

    const line = document.createElement('div');
    line.className = 'ao-slider-line';
    line.setAttribute('aria-hidden', 'true');
    const tagA = document.createElement('span');
    tagA.className = 'ao-slider-tag ao-slider-tag-a';
    tagA.textContent = la;
    const tagB = document.createElement('span');
    tagB.className = 'ao-slider-tag ao-slider-tag-b';
    tagB.textContent = lb;

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '0.5';
    range.value = String(Math.min(100, Math.max(0, parseFloat(this.getAttribute('start') || '50'))));
    range.className = 'ao-slider-range';
    range.setAttribute('aria-label', 'Divider between ' + la + ' and ' + lb);
    const set = () => this.style.setProperty('--ao-pos', range.value + '%');
    range.addEventListener('input', set);
    set();

    // The frame is all slider, so a click can't open the picture: this button does, both sides.
    a.dataset.label = la;
    b.dataset.label = lb;
    const zoom = document.createElement('button');
    zoom.type = 'button';
    zoom.className = 'ao-slider-zoom';
    zoom.textContent = 'Full size';
    zoom.title = 'Open both pictures full size, to zoom in';
    zoom.addEventListener('click', () => viewer.open(parseFloat(range.value) < 50 ? b : a, [a, b]));

    stage.append(line, tagA, tagB, range, zoom);
    this.prepend(stage);
    this.classList.add('ao-slider-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-frames>: a video the reader can step through one frame at a time, for animation where
// the point is a frame or two (an impact frame, a hit-stop, a smear) that playback hides.
//   fps="24"             the clip's frame rate (default 24); frame n is shown at (n + 0.5)/fps
//   marks="46:Impact|…"  optional buttons that jump straight to a labelled frame
// Adds: previous/next frame, play/pause, a quarter-speed toggle and a frame counter. With the
// video focused, the left and right arrow keys step too. Without JS it is the plain <video>.
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

// ---------------------------------------------------------------------------------------
// <ao-diff>: versions of the same text, with the words that changed marked, so a reader can
// see exactly what an edit, a fact-check or a judge did to a line instead of being told.
//   labels="A|B|…"   one tag per version, in order (default: Version 1, 2, …)
// Each child <blockquote> is one version; the LAST is the one the others are compared to.
// A button per version: an earlier one shows its words struck through where they were cut and
// the last version's new words underlined; the last one shows that version clean. An optional
// <figcaption> sits underneath. Without JS the blockquotes and caption simply stack.
const diffWords = (a, b) => {
  // Word-level LCS. Tokens keep their trailing space, so joining them rebuilds the text.
  const tok = (s) => s.replace(/\s+/g, ' ').trim().match(/\S+\s*/g) || [];
  const A = tok(a), B = tok(b);
  const key = (w) => w.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = key(A[i]) === key(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  const out = [];
  const push = (type, w) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += w;
    else out.push({ type, text: w });
  };
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (key(A[i]) === key(B[j])) { push('same', B[j]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) push('del', A[i++]);
    else push('ins', B[j++]);
  }
  while (i < n) push('del', A[i++]);
  while (j < m) push('ins', B[j++]);
  return out;
};

class AoDiff extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const quotes = [...this.querySelectorAll(':scope > blockquote')];
    if (quotes.length < 2) return;
    this._ready = true;
    const labels = (this.getAttribute('labels') || '').split('|');
    const texts = quotes.map((q) => q.textContent);
    const name = (k) => (labels[k] || '').trim() || 'Version ' + (k + 1);
    const last = quotes.length - 1;

    const bar = document.createElement('div');
    bar.className = 'ao-diff-bar';
    const view = document.createElement('div');
    view.className = 'ao-diff-view';
    view.setAttribute('aria-live', 'polite');
    const legend = document.createElement('p');
    legend.className = 'ao-diff-legend';

    const buttons = [];
    const show = (k) => {
      buttons.forEach((b, x) => b.setAttribute('aria-pressed', String(x === k)));
      view.replaceChildren();
      if (k === last) {
        view.append(texts[last].replace(/\s+/g, ' ').trim());
        legend.textContent = name(last) + ', as it stands.';
        return;
      }
      for (const part of diffWords(texts[k], texts[last])) {
        if (part.type === 'same') { view.append(part.text); continue; }
        const el = document.createElement(part.type);
        el.textContent = part.text.trimEnd();
        view.append(el, part.text.endsWith(' ') ? ' ' : '');
      }
      legend.textContent = 'Struck through: only in ' + name(k) + '. Underlined: only in ' + name(last) + '.';
    };
    quotes.forEach((q, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = k === last ? name(k) : name(k) + ' \u2192 ' + name(last);
      b.addEventListener('click', () => show(k));
      bar.append(b);
      buttons.push(b);
      q.hidden = true;
    });

    quotes[0].before(bar, view, legend);
    this.classList.add('ao-diff-ready');
    show(0);
  }
}

// ---------------------------------------------------------------------------------------
// <ao-listen>: several renders of the same audio, compared by ear at the same moment. One
// player for the whole set: picking another clip keeps the playhead where it was, so the reader
// hears the same word under each treatment, and "A/B" flips to the reference clip and back.
//   ref="id"   the clip A/B compares against (default: the first)
// Each child <figure data-id="…"> holds an <audio>, an optional spectrogram <img> spanning
// the clip's full length (the playhead runs across it; click it to seek) and a <figcaption>.
// A direct child <figcaption> captions the set. Keys, with the list focused: up/down pick a
// clip, space plays, C toggles A/B. Only one clip on the page plays at a time, and the element
// stops when the homepage swaps posts or closes the reader. Without JS the figures stack with native controls.

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

// ---------------------------------------------------------------------------------------
// <ao-cues>: one or more cuts of the same timeline (a music video and its re-edit, a film
// and its previs) played in lockstep beside a list of timed cues: lyric lines, shots, chapters.
// The cue being played is lit; clicking a cue sends every video there. Two cuts of a song are
// compared at the same bar instead of from memory.
//   labels="A|B"   one tag per video (default: each video's title, else Cut 1, Cut 2)
// Children: one or more <video>, then an <ol> whose <li data-t="m:ss.xx"> are the cues, then
// an optional <figcaption>. The first video sets the clock and the others follow it. Only one
// video is heard at a time; a Sound button per video picks which. Without JS: the videos with
// their own controls, and the cue list as a plain ordered list.
//
// Keeping two videos together: a follower that drifts a little is sped up or slowed down by a
// few percent until it's back (a seek on every timeupdate makes the browser drop its buffer
// and the follower stalls for good), and only a big gap gets a seek. If any cut runs out of
// buffered video, they all wait for it, and set off together again when it has caught up.
const parseCue = (v) => {
  const parts = String(v || '').trim().split(':').map(Number);
  if (!parts.length || parts.some((n) => !isFinite(n))) return NaN;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

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
      .map((li) => ({ li, t: parseCue(li.dataset.t) }))
      .filter((c) => isFinite(c.t))
      .sort((a, b) => a.t - b.t);

    this.style.setProperty('--ao-cues-n', String(Math.min(vids.length, 2)));
    const grid = document.createElement('div');
    grid.className = 'ao-cues-grid';
    vids[0].before(grid);
    vids.forEach((v, k) => {
      const cell = document.createElement('div');
      cell.className = 'ao-cues-cell';
      const tag = document.createElement('span');
      tag.className = 'ao-cues-tag';
      tag.textContent = name(k);
      v.removeAttribute('controls');
      v.removeAttribute('loop');
      v.playsInline = true;
      v.addEventListener('click', () => toggle());
      cell.append(v, tag);
      grid.append(cell);
    });

    const bar = document.createElement('div');
    bar.className = 'ao-cues-bar';
    const btn = (label, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    const play = btn('Play', 'Play or pause every cut (space)', () => toggle());
    const sound = vids.length > 1
      ? vids.map((v, k) => btn('Sound: ' + name(k), 'Hear this cut', () => hear(k)))
      : [];
    const scrub = document.createElement('input');
    scrub.type = 'range';
    scrub.min = '0';
    scrub.max = '1';
    scrub.step = '0.01';
    scrub.value = '0';
    scrub.setAttribute('aria-label', 'Position');
    const clock = document.createElement('span');
    clock.className = 'ao-cues-clock';
    bar.append(scrub, clock);
    grid.after(bar);

    ol.classList.add('ao-cues-list');
    ol.setAttribute('aria-label', 'Cues: choose one to jump there');
    for (const c of cues) {
      const time = document.createElement('time');
      time.textContent = fmtTime(c.t);
      c.li.prepend(time);
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
      play.textContent = want ? 'Pause' : 'Play';
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

// <ao-transcript>: narrated videos with their captions laid out as a transcript you can read,
// search and click, so two versions of one lesson can be compared by what they actually say.
//   find="cache|security"   preset search terms, one button each
// Children: one or more <figure>, each a <video> carrying <track kind="captions" src="….vtt">
// and a <figcaption>; then an optional <figcaption> for the set. The search box counts and marks
// a term in every transcript at once. Clicking a line plays that video from there; the line
// being spoken is lit. Without JS: the videos, with the captions as native subtitles.
const parseVtt = (text) => {
  const out = [];
  const stamp = (s) => s.trim().split(':').reduce((acc, n) => acc * 60 + parseFloat(n), 0);
  for (const block of String(text).replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n');
    const at = lines.findIndex((l) => l.includes('-->'));
    if (at < 0) continue;
    const [a, b] = lines[at].split('-->');
    const words = lines.slice(at + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    if (words) out.push({ start: stamp(a), end: stamp(b.trim().split(/\s/)[0]), text: words });
  }
  return out.sort((x, y) => x.start - y.start);
};

class AoTranscript extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const figs = [...this.querySelectorAll(':scope > figure')].filter((f) => f.querySelector('video track[src]'));
    if (!figs.length) return;
    this._ready = true;
    this.style.setProperty('--ao-tr-n', String(Math.min(figs.length, 2)));
    const grid = document.createElement('div');
    grid.className = 'ao-tr-grid';
    figs[0].before(grid);

    const bar = document.createElement('div');
    bar.className = 'ao-tr-bar';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Search every transcript';
    input.setAttribute('aria-label', 'Search every transcript');
    bar.append(input);
    const presets = (this.getAttribute('find') || '').split('|').map((s) => s.trim()).filter(Boolean);
    const chips = presets.map((word) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = word;
      b.addEventListener('click', () => {
        input.value = input.value === word ? '' : word;
        mark();
      });
      bar.append(b);
      return b;
    });
    grid.before(bar);

    const panes = figs.map((fig) => {
      grid.append(fig);
      const v = fig.querySelector('video');
      const track = v.querySelector('track[src]');
      v.removeAttribute('loop');
      const box = document.createElement('div');
      box.className = 'ao-tr-text';
      box.setAttribute('aria-label', 'Transcript: choose a line to play from there');
      box.textContent = 'loading the transcript…';
      const count = document.createElement('span');
      count.className = 'ao-tr-count';
      const cap = fig.querySelector('figcaption');
      if (cap) cap.append(count);
      v.after(box);
      const pane = { fig, v, box, count, lines: [], lit: null };
      fetch(track.src).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((text) => {
        box.textContent = '';
        let para = null;
        let prev = null;
        let words = 0;
        for (const cue of parseVtt(text)) {
          // Caption cues usually run back to back, so a new paragraph starts at the first sentence
          // end after about 40 words, or wherever the narrator pauses for a second or more.
          const ended = prev && /[.?!]["'”’)]?$/.test(prev.text);
          if (!para || (prev && cue.start - prev.end >= 1) || (ended && words >= 40)) {
            words = 0;
            para = document.createElement('p');
            const time = document.createElement('time');
            time.textContent = fmtTime(cue.start);
            para.append(time);
            box.append(para);
          }
          const span = document.createElement('span');
          span.textContent = cue.text + ' ';
          span.tabIndex = 0;
          span.setAttribute('role', 'button');
          span.title = fmtTime(cue.start);
          span.addEventListener('click', () => seek(pane, cue.start));
          span.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seek(pane, cue.start); }
          });
          para.append(span);
          words += cue.text.split(/\s+/).length;
          pane.lines.push({ ...cue, span });
          prev = cue;
        }
        mark();
      }, () => { box.textContent = 'The transcript could not be loaded.'; });
      v.addEventListener('play', () => { if (!pane.raf) loop(pane); });
      v.addEventListener('seeked', () => light(pane));
      // timeupdate fires even where animation frames don't (a background tab), so check here too.
      v.addEventListener('timeupdate', () => { if (!this.getClientRects().length) v.pause(); });
      return pane;
    });

    // Jump to a line and play from there. A video that hasn't loaded yet (preload="none") takes
    // the time once its metadata is in; play() is what starts that load.
    const seek = (pane, t) => {
      const { v } = pane;
      light(pane, t);
      if (v.readyState >= 1) v.currentTime = t;
      else v.addEventListener('loadedmetadata', () => { v.currentTime = t; }, { once: true });
      v.play().catch(() => {});
    };

    const light = (pane, at) => {
      const t = typeof at === 'number' ? at : pane.v.currentTime;
      let cur = null;
      for (const l of pane.lines) if (l.start <= t + 0.05) cur = l; else break;
      if (cur === pane.lit) return;
      if (pane.lit) pane.lit.span.removeAttribute('aria-current');
      pane.lit = cur;
      if (!cur) return;
      cur.span.setAttribute('aria-current', 'true');
      // Scroll the transcript box only, never the page.
      const box = pane.box;
      // The box is position: relative, so offsetTop is already measured from its top edge.
      const top = cur.span.offsetTop;
      if (top < box.scrollTop || top + cur.span.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTop = Math.max(0, top - box.clientHeight / 3);
      }
    };
    const loop = (pane) => {
      // The homepage hides the reader rather than removing it when it closes; stop with it.
      if (!this.getClientRects().length) { pane.v.pause(); pane.raf = 0; return; }
      light(pane);
      if (pane.v.paused) { pane.raf = 0; return; }
      pane.raf = requestAnimationFrame(() => loop(pane));
    };

    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const paint = (pane) => {
      const q = input.value.trim();
      pane.count.textContent = (q ? `“${q}”: ${pane.hits || 0} ${pane.hits === 1 ? 'time' : 'times'}` : '');
    };
    const mark = () => {
      const q = input.value.trim();
      const re = q ? new RegExp(esc(q), 'gi') : null;
      chips.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === q)));
      for (const pane of panes) {
        let hits = 0;
        let first = null;
        for (const l of pane.lines) {
          const found = re ? l.text.match(re) : null;
          if (!found) { l.span.textContent = l.text + ' '; continue; }
          hits += found.length;
          if (!first) first = l;
          l.span.textContent = '';
          let i = 0;
          l.text.replace(re, (m, at) => {
            l.span.append(l.text.slice(i, at));
            const mk = document.createElement('mark');
            mk.textContent = m;
            l.span.append(mk);
            i = at + m.length;
            return m;
          });
          l.span.append(l.text.slice(i) + ' ');
        }
        pane.hits = hits;
        paint(pane);
        if (first) pane.box.scrollTop = Math.max(0, first.span.offsetTop - 12);
      }
    };
    input.addEventListener('input', mark);

    this._onOther = (e) => panes.forEach((p) => { if (p.v !== e.detail && !p.v.paused) p.v.pause(); });
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => {
      panes.forEach((p) => { p.v.pause(); if (p.raf) cancelAnimationFrame(p.raf); p.raf = 0; });
    };
    this.classList.add('ao-tr-ready');
  }

  disconnectedCallback() {
    if (this._stop) this._stop();
    if (this._onOther) document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    this._ready = false;
  }
}

// ---------------------------------------------------------------------------------------
// <ao-fetch>: HTTP requests the reader sends from their own browser, with the answer shown as
// it arrives: status, the headers that matter, bytes received and time taken. For posts where
// the claim is about what a server does, so the reader can check it live instead of trusting
// a pasted curl. Same-origin only (the site's own files); nothing is sent until a click.
// Children: an <ol> of <li data-url="/path" data-range="bytes=a-b"> (data-range optional,
// data-method="HEAD" optional) whose text is the label, then an optional <figcaption>.
// A body is counted, not kept, and reading stops at cap bytes (default 2 MB): an ignored
// Range on a 25 MB video then costs the reader 2 MB, and the row says where it stopped.
const FETCH_HEADERS = ['content-range', 'content-length', 'accept-ranges', 'content-type'];
// HTTP/2 carries no reason phrase, so res.statusText is empty there; these are the usual ones.
const STATUS_TEXT = { 200: 'OK', 206: 'Partial Content', 304: 'Not Modified', 404: 'Not Found', 416: 'Range Not Satisfiable' };
const fmtBytes = (n) => (n < 10000 ? n.toLocaleString('en-US') + ' bytes'
  : n < 1e6 ? (n / 1000).toFixed(1) + ' KB' : (n / 1e6).toFixed(2) + ' MB');
class AoFetch extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li[data-url]')];
    if (!items.length) return;
    this._ready = true;
    const cap = parseInt(this.getAttribute('cap') || '2000000', 10);
    const rows = items.map((li) => {
      const url = li.dataset.url;
      let same = false;
      try { same = new URL(url, location.href).origin === location.origin; } catch (e) { /* bad url */ }
      const method = (li.dataset.method || 'GET').toUpperCase();
      const range = li.dataset.range || '';
      const label = li.textContent.trim();
      li.replaceChildren();
      const head = document.createElement('div');
      head.className = 'ao-fetch-head';
      const name = document.createElement('span');
      name.className = 'ao-fetch-label';
      name.textContent = label;
      const go = document.createElement('button');
      go.type = 'button';
      go.textContent = 'Send it';
      go.disabled = !same;
      head.append(name, go);
      const req = document.createElement('pre');
      req.className = 'ao-fetch-req';
      req.textContent = method + ' ' + url + (range ? '\nRange: ' + range : '');
      const out = document.createElement('pre');
      out.className = 'ao-fetch-out';
      out.setAttribute('aria-live', 'polite');
      out.textContent = same ? 'Not sent yet.' : "Only this site's own files can be requested.";
      li.append(head, req, out);
      let busy = false;
      const run = async () => {
        if (!same || busy) return;
        busy = true;
        go.disabled = true;
        out.textContent = 'Sending…';
        out.classList.remove('ao-fetch-ok', 'ao-fetch-whole');
        const t0 = performance.now();
        const ctl = new AbortController();
        this._ctl = ctl;
        try {
          const headers = range ? { Range: range } : {};
          const res = await fetch(url, { method, headers, cache: 'no-store', signal: ctl.signal });
          const lines = ['HTTP ' + res.status + ' ' + (res.statusText || STATUS_TEXT[res.status] || '')];
          for (const h of FETCH_HEADERS) {
            const v = res.headers.get(h);
            if (v) lines.push(h.replace(/(^|-)\w/g, (m) => m.toUpperCase()) + ': ' + v);
          }
          let got = 0;
          let stopped = false;
          if (res.body && method !== 'HEAD') {
            const reader = res.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              got += value.byteLength;
              if (got >= cap) { stopped = true; reader.cancel().catch(() => {}); break; }
            }
          }
          const ms = Math.round(performance.now() - t0);
          lines.push('');
          lines.push(method === 'HEAD' ? 'No body asked for.'
            : 'Received: ' + fmtBytes(got) + (stopped ? ' (stopped reading here; the server was still sending)' : ''));
          lines.push('Time: ' + ms + ' ms');
          if (range && res.status === 200) lines.push('The Range header was ignored: this is the whole file.');
          out.textContent = lines.join('\n');
          out.classList.add(res.status === 206 ? 'ao-fetch-ok' : 'ao-fetch-whole');
        } catch (e) {
          out.textContent = ctl.signal.aborted ? 'Stopped.' : 'The request failed: ' + ((e && e.message) || e);
        } finally {
          busy = false;
          go.disabled = false;
          go.textContent = 'Send it again';
        }
      };
      go.addEventListener('click', run);
      return run;
    });
    if (rows.length > 1) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'ao-fetch-all';
      all.textContent = 'Send all ' + rows.length;
      all.addEventListener('click', async () => { for (const run of rows) await run(); });
      this.querySelector(':scope > ol').before(all);
    }
    this.classList.add('ao-fetch-ready');
  }

  disconnectedCallback() {
    // The homepage swaps posts out; don't keep reading a body nobody will see.
    this._ctl?.abort();
  }
}

// ---------------------------------------------------------------------------------------
// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code lives in
// src/scripts/demos/<name>.js and is a separate chunk, fetched only when a post uses it, so
// one post's demo never weighs on the others. The module exports mount(host, part), which
// returns { destroy } or null; whatever the element held before is the no-JS fallback.
const DEMOS = {
  synthid: () => import('./demos/synthid.js'),
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

if (!customElements.get('ao-compare')) customElements.define('ao-compare', AoCompare);
if (!customElements.get('ao-demo')) customElements.define('ao-demo', AoDemo);
if (!customElements.get('ao-transcript')) customElements.define('ao-transcript', AoTranscript);
if (!customElements.get('ao-game')) customElements.define('ao-game', AoGame);
if (!customElements.get('ao-model')) customElements.define('ao-model', AoModel);
if (!customElements.get('ao-timeline')) customElements.define('ao-timeline', AoTimeline);
if (!customElements.get('ao-slider')) customElements.define('ao-slider', AoSlider);
if (!customElements.get('ao-frames')) customElements.define('ao-frames', AoFrames);
if (!customElements.get('ao-diff')) customElements.define('ao-diff', AoDiff);
if (!customElements.get('ao-listen')) customElements.define('ao-listen', AoListen);
if (!customElements.get('ao-cues')) customElements.define('ao-cues', AoCues);
if (!customElements.get('ao-fetch')) customElements.define('ao-fetch', AoFetch);
