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
import { AO_LISTEN_PLAY, AO_STOP, claim, current } from '../elements/_core/player.js';
import { openViewer } from '../elements/_core/viewer.js';
import { fmtTime } from '../elements/_lib/time.js';
import { enhance } from '../elements/enhance.js';

// The standalone page runs it by itself; the homepage calls it after it swaps a post in.
export { enhance };
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
    zoom.addEventListener('click', () => openViewer(parseFloat(range.value) < 50 ? b : a, [a, b]));

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
// data-show="body" on a row also prints the body (its first 4 KB, JSON indented) for small
// text answers worth reading, like /version.json.
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
      const showBody = li.dataset.show === 'body';
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
          const kept = [];
          if (res.body && method !== 'HEAD') {
            const reader = res.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (showBody && got < 4096) kept.push(value.slice(0, 4096 - got));
              got += value.byteLength;
              if (got >= cap) { stopped = true; reader.cancel().catch(() => {}); break; }
            }
          }
          if (showBody && kept.length) {
            let text = new TextDecoder().decode(await new Blob(kept).arrayBuffer());
            try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { /* not JSON, or cut short */ }
            lines.push('', text.trimEnd() + (got > 4096 ? '\n…' : ''));
          }
          const ms = Math.round(performance.now() - t0);
          lines.push('');
          lines.push(method === 'HEAD' ? 'No body asked for.'
            : 'Received: ' + fmtBytes(got) + (stopped ? ' (stopped reading here; the server was still sending)' : ''));
          lines.push('Time: ' + ms + ' ms');
          if (range && res.status === 200) lines.push('The Range header was ignored: this is the whole file.');
          out.textContent = lines.join('\n');
          out.classList.add(res.status === 206 || (showBody && !range && res.ok) ? 'ao-fetch-ok' : 'ao-fetch-whole');
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
// <ao-series>: numbers per day (or per any ordered label) drawn as one column each, from a plain
// <table>, so the figures are written once and the table stays for screen readers and readers
// without JS. The first column is the day (YYYY-MM-DD, read out as "Tue 30 Sep") or any label;
// every other column is a series named by its <th>, and a <th data-unit="MB"> prints its unit.
//   show="Name"  the series drawn first (default: the first); a button per series switches
//   avg="7"      also draws the trailing N-day average as a line over the columns
//   stack        every series stacked in one column per day instead; the legend's buttons hide
//                and show a layer, and the scale follows what is shown
// An optional <ol> of <li data-d="YYYY-MM-DD">…</li> marks days under the axis (a post going up,
// a deploy). Pointing at a day, or focusing the chart and using the arrow keys, reads out every
// series and any marks for that day.
const seriesDay = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
};
// UTC on purpose: the labels are bare dates, and a reader west of UTC must not see them a day early.
// Spelled out by hand because en-GB's short month is "Sept" in some browsers and "Sep" in others.
const SERIES_MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const SERIES_WEEKDAYS = 'Sun Mon Tue Wed Thu Fri Sat'.split(' ');
const SERIES_TICK = { format: (d) => d.getUTCDate() + ' ' + SERIES_MONTHS[d.getUTCMonth()] };
const SERIES_DAY = { format: (d) => SERIES_WEEKDAYS[d.getUTCDay()] + ' ' + SERIES_TICK.format(d) };
const SERIES_AXIS = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const seriesNum = (v) => v.toLocaleString('en-US', { maximumFractionDigits: Math.abs(v) < 100 ? 1 : 0 });
const niceStep = (v) => {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
};
class AoSeries extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const heads = [...table.querySelectorAll('thead th')];
    const names = heads.slice(1).map((th) => th.textContent.trim());
    const units = heads.slice(1).map((th) => th.dataset.unit || '');
    const rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const c = [...tr.children];
      const label = c[0]?.textContent.trim() || '';
      return {
        label,
        date: seriesDay(label),
        v: names.map((_, k) => {
          const n = parseFloat((c[k + 1]?.textContent || '').replace(/[^0-9.\-]/g, ''));
          return Number.isFinite(n) ? n : 0;
        }),
      };
    });
    if (!rows.length || !names.length) return;
    this._ready = true;
    const n = rows.length;
    const stack = this.hasAttribute('stack');
    const avgN = Math.max(0, parseInt(this.getAttribute('avg') || '0', 10));
    const dayName = (r) => (r.date ? SERIES_DAY.format(r.date) : r.label);
    const withUnit = (v, k) => seriesNum(v) + (units[k] ? ' ' + units[k] : '');

    const marks = new Map(); // row index -> the marks on that day
    const at = new Map(rows.map((r, i) => [r.label, i]));
    for (const li of this.querySelectorAll(':scope > ol > li[data-d]')) {
      const i = at.get(li.dataset.d.trim());
      if (i === undefined) continue;
      if (!marks.has(i)) marks.set(i, []);
      marks.get(i).push(li.textContent.trim());
    }

    let shown = Math.max(0, names.indexOf(this.getAttribute('show') || ''));
    const on = names.map(() => true); // stack mode: which layers are drawn
    let active = -1;

    const chart = document.createElement('div');
    chart.className = 'ao-series-chart';
    const top = document.createElement('div');
    top.className = 'ao-series-top';
    top.setAttribute('role', 'group');
    top.setAttribute('aria-label', stack ? 'Layers shown' : 'Series shown');
    const buttons = names.map((name, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      if (stack) b.className = 'ao-series-key ao-series-s' + (k % 4);
      b.addEventListener('click', () => {
        if (stack) {
          if (on[k] && on.filter(Boolean).length === 1) return; // keep one layer
          on[k] = !on[k];
        } else shown = k;
        draw();
        read();
      });
      top.append(b);
      return b;
    });
    if (names.length > 1 || stack) chart.append(top);

    const body = document.createElement('div');
    body.className = 'ao-series-body';
    const plot = document.createElement('div');
    plot.className = 'ao-series-plot';
    plot.tabIndex = 0;
    plot.setAttribute('role', 'group');
    plot.setAttribute('aria-roledescription', 'chart');
    plot.setAttribute('aria-label', (stack ? names.join(', ') : names.join(' / ')) + ', ' + n + ' days. Arrow keys move between days.');
    const grid = document.createElement('div');
    grid.className = 'ao-series-grids';
    grid.setAttribute('aria-hidden', 'true');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + n + ' 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const hl = document.createElement('div');
    hl.className = 'ao-series-hl';
    hl.style.width = 100 / n + '%';
    plot.append(grid, svg, hl);

    const xs = document.createElement('div');
    xs.className = 'ao-series-x';
    xs.setAttribute('aria-hidden', 'true');
    const ticks = [0];
    rows.forEach((r, i) => { if (i && r.date && r.date.getUTCDate() === 1) ticks.push(i); });
    if (!rows[0].date) for (let i = 1; i < 5; i++) ticks.push(Math.round((i * (n - 1)) / 5));
    ticks.push(n - 1);
    let last = -Infinity;
    ticks.forEach((i, j) => {
      const pct = ((i + 0.5) / n) * 100;
      const end = j === ticks.length - 1;
      if (!end && pct - last < 12) return; // two labels this close would overprint
      if (end && pct - last < 12) {
        // The last day wins over a month label just before it, never over the first label.
        if (xs.children.length > 1) xs.lastChild.remove();
        else return;
      }
      const t = document.createElement('span');
      t.textContent = rows[i].date ? SERIES_TICK.format(rows[i].date) : rows[i].label;
      t.style.left = pct + '%';
      if (j === 0) t.className = 'is-first';
      if (end) t.className = 'is-last';
      xs.append(t);
      last = pct;
    });

    const strip = document.createElement('div');
    strip.className = 'ao-series-marks';
    strip.setAttribute('aria-hidden', 'true');
    const dots = new Map();
    for (const [i, list] of marks) {
      const d = document.createElement('span');
      d.className = 'ao-series-mark' + (list.length > 1 ? ' is-many' : '');
      d.style.left = ((i + 0.5) / n) * 100 + '%';
      strip.append(d);
      dots.set(i, d);
    }
    body.append(plot, xs);
    if (marks.size) body.append(strip);
    chart.append(body);

    const out = document.createElement('p');
    out.className = 'ao-series-read';
    out.setAttribute('aria-live', 'polite');
    chart.append(out);

    let scaleTop = 1;
    const draw = () => {
      buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(stack ? on[k] : k === shown)));
      const keys = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown];
      const tot = rows.map((r) => keys.reduce((a, k) => a + Math.max(0, r.v[k]), 0));
      const max = Math.max(...tot, 0);
      const step = niceStep(max / 4);
      scaleTop = Math.max(step, Math.ceil(max / step) * step);
      grid.replaceChildren();
      for (let g = step; g <= scaleTop + step / 1000; g += step) {
        const line = document.createElement('div');
        line.className = 'ao-series-grid';
        line.style.bottom = (g / scaleTop) * 100 + '%';
        const lab = document.createElement('span');
        // "1K MB" reads badly: with a unit, the number is written out.
        lab.textContent = !stack && units[shown] ? seriesNum(g) + ' ' + units[shown] : SERIES_AXIS.format(g);
        line.append(lab);
        grid.append(line);
      }
      const y = (v) => 100 - (v / scaleTop) * 100;
      let html = '';
      if (stack) {
        rows.forEach((r, i) => {
          let base = 0;
          for (const k of keys) {
            const v = Math.max(0, r.v[k]);
            if (!v) continue;
            html += '<rect class="ao-series-s' + (k % 4) + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(base + v) +
              '" height="' + (v / scaleTop) * 100 + '"/>';
            base += v;
          }
        });
      } else {
        const muted = avgN > 1 ? ' ao-series-muted' : '';
        rows.forEach((r, i) => {
          const v = Math.max(0, r.v[shown]);
          if (v) html += '<rect class="ao-series-s0' + muted + '" x="' + (i + 0.1) + '" width="0.8" y="' + y(v) + '" height="' + (v / scaleTop) * 100 + '"/>';
        });
        if (avgN > 1) {
          const pts = rows.map((r, i) => {
            const from = Math.max(0, i - avgN + 1);
            let s = 0;
            for (let j = from; j <= i; j++) s += rows[j].v[shown];
            return (i + 0.5) + ',' + y(s / (i - from + 1));
          });
          html += '<polyline class="ao-series-avg" points="' + pts.join(' ') + '"/>';
        }
      }
      svg.innerHTML = html;
    };

    const summary = () => {
      if (stack) {
        const keys = names.map((_, k) => k).filter((k) => on[k]);
        const sums = keys.map((k) => rows.reduce((a, r) => a + r.v[k], 0));
        const all = sums.reduce((a, b) => a + b, 0);
        return [n + ' days', ...keys.map((k, j) => names[k] + ' ' + seriesNum(sums[j]) + ' (' + Math.round((sums[j] / (all || 1)) * 100) + '%)')].join(' · ');
      }
      const sum = rows.reduce((a, r) => a + r.v[shown], 0);
      const peak = rows.reduce((m, r, i) => (r.v[shown] > rows[m].v[shown] ? i : m), 0);
      return n + ' days · ' + names[shown] + ' ' + withUnit(sum, shown) + ' in all · busiest ' + dayName(rows[peak]) +
        ', ' + withUnit(rows[peak].v[shown], shown);
    };
    const read = () => {
      out.replaceChildren();
      for (const d of dots.values()) d.classList.remove('is-on');
      if (active < 0) {
        hl.hidden = true;
        out.append(summary());
        const hint = document.createElement('span');
        hint.className = 'ao-series-hint';
        hint.textContent = 'Point at a day, or focus the chart and use the arrow keys.';
        out.append(hint);
        return;
      }
      const r = rows[active];
      hl.hidden = false;
      hl.style.left = (active / n) * 100 + '%';
      const day = document.createElement('b');
      day.textContent = dayName(r);
      out.append(day);
      const order = stack ? names.map((_, k) => k).filter((k) => on[k]) : [shown, ...names.map((_, k) => k).filter((k) => k !== shown)];
      for (const k of order) {
        const s = document.createElement('span');
        s.className = 'ao-series-val' + (stack ? ' ao-series-s' + (k % 4) : k === shown ? ' is-shown' : '');
        s.textContent = names[k] + ' ' + withUnit(r.v[k], k);
        out.append(' · ', s);
      }
      if (stack) out.append(' · Total ' + seriesNum(order.reduce((a, k) => a + r.v[k], 0)));
      if (!stack && avgN > 1 && active >= avgN - 1) {
        let s = 0;
        for (let j = active - avgN + 1; j <= active; j++) s += rows[j].v[shown];
        out.append(' · ' + avgN + '-day average ' + withUnit(s / avgN, shown));
      }
      const m = marks.get(active);
      if (m) {
        dots.get(active)?.classList.add('is-on');
        for (const text of m) {
          const em = document.createElement('span');
          em.className = 'ao-series-note';
          em.textContent = text;
          out.append(em);
        }
      }
    };
    const pick = (i) => {
      active = i < 0 ? -1 : Math.max(0, Math.min(n - 1, i));
      read();
    };
    const fromPointer = (e) => {
      const box = plot.getBoundingClientRect();
      pick(Math.floor(((e.clientX - box.left) / box.width) * n));
    };
    body.addEventListener('pointermove', fromPointer);
    body.addEventListener('pointerdown', fromPointer);
    body.addEventListener('pointerleave', () => { if (document.activeElement !== plot) pick(-1); });
    plot.addEventListener('focus', () => { if (active < 0) pick(n - 1); });
    plot.addEventListener('blur', () => pick(-1));
    plot.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1, PageDown: 7, PageUp: -7 }[e.key];
      const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : d ? (active < 0 ? n - 1 : active + d) : null;
      if (to === null) return;
      e.preventDefault();
      pick(to);
    });

    draw();
    read();
    table.classList.add('ao-series-table');
    table.before(chart);
    this.classList.add('ao-series-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-funnel>: a total, then what each layer takes out of it, down to what is left: requests
// down to the ones that were people, renders down to the keepers. Children: an <ol> whose <li>
// each hold a <b> label, a <data value="…"> and a short note, optionally followed by a nested
// <ul> of examples that opens on request. The first value is the total; a negative value is what
// that layer removes; a positive value after the first is a count measured another way ("of
// these, about 290 ran the script"): what it leaves out is shown as unconfirmed, not as removed,
// so the end of the bar reads as a range. A value written "~290" is an estimate, and every figure
// after an estimate is rounded to tens. One bar at the top shows the whole split; each row shows
// what it took and what was left. Without JS: the list, with the numbers as written.
const funnelNum = (v) => Math.round(v).toLocaleString('en-US');
class AoFunnel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li')].filter((li) => li.querySelector(':scope > data'));
    if (items.length < 2) return;
    this._ready = true;
    const unit = this.getAttribute('unit') || '';
    const rows = items.map((li) => {
      const data = li.querySelector(':scope > data');
      const value = parseFloat(data.getAttribute('value'));
      const note = document.createElement('span');
      note.className = 'ao-funnel-note';
      for (const node of [...li.childNodes]) {
        if (node.nodeType === 1 && (node.tagName === 'B' || node.tagName === 'DATA' || node.tagName === 'UL')) continue;
        note.append(node.cloneNode(true));
      }
      return {
        label: li.querySelector(':scope > b')?.textContent.trim() || '',
        value,
        approx: /^\s*[~≈]/.test(data.textContent),
        note,
        examples: li.querySelector(':scope > ul'),
      };
    });
    const total = rows[0].value;
    let left = total;
    let rough = false;
    rows.forEach((r, i) => {
      r.before = left;
      if (i === 0) r.left = total;
      else if (r.value < 0) r.left = left + r.value;
      else r.left = r.value;
      r.measured = i > 0 && r.value >= 0;
      r.taken = i === 0 ? 0 : r.before - r.left;
      rough = rough || r.approx;
      r.rough = rough; // this figure, or one it was worked out from, is an estimate
      left = r.left;
    });
    const num = (v, r) => (r.rough ? '~' + funnelNum(Math.round(v / 10) * 10) : funnelNum(v));
    const share = (v) => (v / total < 0.01 ? '<1' : Math.round((v / total) * 100)) + '%';

    const box = document.createElement('div');
    box.className = 'ao-funnel-box';
    const bar = document.createElement('div');
    bar.className = 'ao-funnel-bar';
    bar.setAttribute('aria-hidden', 'true');
    const segs = [];
    rows.slice(1).forEach((r, j) => {
      const s = document.createElement('span');
      s.className = 'ao-funnel-seg ' + (r.measured ? 'ao-funnel-left is-maybe' : 'ao-funnel-f' + (j % 6));
      s.style.flexGrow = String(Math.max(0, r.taken));
      s.title = (r.measured ? 'Unconfirmed' : r.label) + ': ' + num(r.taken, r);
      bar.append(s);
      segs.push(s);
    });
    const rest = document.createElement('span');
    rest.className = 'ao-funnel-seg ao-funnel-left';
    rest.style.flexGrow = String(Math.max(0, left));
    const last = rows[rows.length - 1];
    rest.title = last.label + ': ' + num(left, last);
    bar.append(rest);
    const sum = document.createElement('p');
    sum.className = 'ao-funnel-sum';
    sum.textContent = funnelNum(total) + (unit ? ' ' + unit : '') + ' → ' + (last.measured
      ? num(last.left, last) + ' to ' + num(last.before, rows[rows.length - 2]) + ' left (' + share(last.left) + ' to ' + share(last.before) + ')'
      : num(left, last) + ' left (' + share(left) + ')');
    box.append(sum, bar);

    const list = document.createElement('ol');
    list.className = 'ao-funnel-rows';
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = 'ao-funnel-row' + (i === 0 ? ' is-total' : '');
      if (i > 0) li.classList.add('ao-funnel-f' + ((i - 1) % 6));
      const head = document.createElement('div');
      head.className = 'ao-funnel-head';
      const name = document.createElement('b');
      name.textContent = r.label;
      const nums = document.createElement('span');
      nums.className = 'ao-funnel-nums';
      if (i === 0) nums.textContent = funnelNum(total) + (unit ? ' ' + unit : '');
      else if (!r.measured) nums.textContent = (r.approx ? '~' : '') + '−' + funnelNum(r.approx ? Math.round(r.taken / 10) * 10 : r.taken) +
        ' → ' + num(r.left, r) + ' left';
      else nums.textContent = num(r.left, r) + ' of ' + num(r.before, rows[i - 1]) + ', counted another way';
      head.append(name, nums);
      const track = document.createElement('div');
      track.className = 'ao-funnel-track';
      track.setAttribute('aria-hidden', 'true');
      const keep = document.createElement('span');
      keep.className = 'ao-funnel-keep';
      keep.style.width = (r.left / total) * 100 + '%';
      track.append(keep);
      if (r.taken > 0) {
        const gone = document.createElement('span');
        gone.className = 'ao-funnel-gone' + (r.measured ? ' is-maybe' : '');
        gone.style.left = (r.left / total) * 100 + '%';
        gone.style.width = (r.taken / total) * 100 + '%';
        track.append(gone);
      }
      li.append(head, track, r.note);
      if (r.examples) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'ao-funnel-more';
        more.setAttribute('aria-expanded', 'false');
        more.textContent = 'What’s in it';
        const ex = r.examples.cloneNode(true);
        ex.className = 'ao-funnel-ex';
        ex.hidden = true;
        more.addEventListener('click', () => {
          const open = more.getAttribute('aria-expanded') !== 'true';
          more.setAttribute('aria-expanded', String(open));
          ex.hidden = !open;
        });
        li.append(more, ex);
      }
      if (i > 0) {
        const seg = segs[i - 1];
        const light = (v) => { seg.classList.toggle('is-on', v); li.classList.toggle('is-on', v); };
        li.addEventListener('pointerenter', () => light(true));
        li.addEventListener('pointerleave', () => light(false));
        li.addEventListener('focusin', () => light(true));
        li.addEventListener('focusout', () => light(false));
        seg.addEventListener('pointerenter', () => light(true));
        seg.addEventListener('pointerleave', () => light(false));
      }
      list.append(li);
    });
    box.append(list);
    this.querySelector(':scope > ol').before(box);
    this.classList.add('ao-funnel-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-ask>: questions put to an AI agent, each with the tool call it became and what came back,
// so a reader sees what a connection can answer and can take the question for their own. Each
// is a <details data-via="Connection" data-tool="tool_name"> holding a <summary> (the question as
// asked), then whatever shows the call (<pre>) and the answer (<p>, <ul>). With JS: a filter per
// connection, a Copy button on each question, and one question open at a time. Without JS: the
// details, which already open and close.
let askGroups = 0;
class AoAsk extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > details')];
    if (!items.length) return;
    this._ready = true;
    const group = 'ao-ask-' + ++askGroups;
    const vias = [];
    for (const d of items) {
      const via = d.dataset.via || '';
      if (via && !vias.includes(via)) vias.push(via);
      const sum = d.querySelector(':scope > summary');
      if (!sum) continue;
      const question = sum.textContent.trim();
      d.setAttribute('name', group); // one open at a time, natively where supported
      d.addEventListener('toggle', () => {
        if (d.open) for (const o of items) if (o !== d && o.open) o.open = false;
      });
      const q = document.createElement('span');
      q.className = 'ao-ask-q';
      q.append(...sum.childNodes);
      sum.append(q);
      if (via || d.dataset.tool) {
        const tag = document.createElement('span');
        tag.className = 'ao-ask-tag';
        if (via) tag.append(via);
        if (d.dataset.tool) {
          const code = document.createElement('code');
          code.textContent = d.dataset.tool;
          tag.append(code);
        }
        sum.append(tag);
      }
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'ao-ask-copy';
      copy.textContent = 'Copy the question';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(question);
          copy.textContent = 'Copied';
        } catch (e) {
          copy.textContent = 'Copy failed: select it instead';
        }
        setTimeout(() => { copy.textContent = 'Copy the question'; }, 1800);
      });
      sum.after(copy);
    }
    if (vias.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-ask-filter';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show questions for');
      const pick = (via) => {
        for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.via === via));
        for (const d of items) d.hidden = !!via && d.dataset.via !== via;
      };
      for (const via of ['', ...vias]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.via = via;
        const count = via ? items.filter((d) => d.dataset.via === via).length : items.length;
        b.textContent = (via || 'All') + ' · ' + count;
        b.addEventListener('click', () => pick(via));
        bar.append(b);
      }
      pick('');
      this.prepend(bar);
    }
    this.classList.add('ao-ask-ready');
  }
}

// ---------------------------------------------------------------------------------------
// <ao-demo name="x" part="y">: an interactive demo written for one post. Its code lives in
// src/scripts/demos/<name>.js and is a separate chunk, fetched only when a post uses it, so
// one post's demo never weighs on the others. The module exports mount(host, part), which
// returns { destroy } or null; whatever the element held before is the no-JS fallback.
// ---------------------------------------------------------------------------------------
// <ao-pan>: a picture far wider than the page (a panorama, a long strip, a storyboard), shown
// at a readable height and panned across instead of shrunk to a sliver. Drag it, swipe it,
// use a trackpad, or focus it and use the arrow keys (Home/End jump to the ends); a minimap
// under it shows the whole picture and where the frame is, and a click on it jumps there.
//   views="A|B"            two or more <img>s become views of one place, one button each; the
//                          frame keeps its place as a fraction of the width, so pictures of
//                          different lengths (an 8:1 and a 12:1 strip) are compared at the
//                          same point of their story
//   stops="0.3:Bridge|…"   buttons that glide the frame's centre to a fraction of the width
//   height="360"           the frame's height in px on wide screens (phones get less)
// Adds Glide (a slow pan to the end; any touch stops it) and Full size (the image viewer).
// Without JS: the images and caption stack, at the page's width.
class AoPan extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const imgs = [...this.querySelectorAll(':scope > img')];
    if (!imgs.length) return;
    this._ready = true;
    this.imgs = imgs;
    const h = parseFloat(this.getAttribute('height') || '');
    if (h > 0) this.style.setProperty('--ao-pan-h', h + 'px');
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim());
    imgs.forEach((img, i) => { img.dataset.label = views[i] || img.alt || 'View ' + (i + 1); });

    const stage = document.createElement('div');
    stage.className = 'ao-pan-stage';
    stage.tabIndex = 0;
    stage.setAttribute('role', 'region');
    stage.setAttribute('aria-label', 'Wide picture: drag, or use the arrow keys, to pan');
    const track = document.createElement('div');
    track.className = 'ao-pan-track';
    track.append(...imgs);
    stage.append(track);
    this.stage = stage;

    const mini = document.createElement('div');
    mini.className = 'ao-pan-mini';
    mini.setAttribute('aria-hidden', 'true');
    this.miniImg = document.createElement('img');
    this.miniImg.alt = '';
    this.miniImg.draggable = false;
    this.miniImg.setAttribute('data-no-zoom', '');
    this.win = document.createElement('span');
    this.win.className = 'ao-pan-win';
    mini.append(this.miniImg, this.win);

    const bar = document.createElement('div');
    bar.className = 'ao-pan-bar';
    const mk = (label, cls, fn, title) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ao-pan-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      if (title) b.title = title;
      b.addEventListener('click', fn);
      bar.append(b);
      return b;
    };
    this.viewBtns = imgs.length > 1 ? imgs.map((img, i) => mk(img.dataset.label, 'ao-pan-view', () => this.show(i))) : [];
    for (const part of (this.getAttribute('stops') || '').split('|')) {
      const k = part.indexOf(':');
      const f = parseFloat(k < 0 ? part : part.slice(0, k));
      if (!isFinite(f)) continue;
      mk(k < 0 ? Math.round(f * 100) + '%' : part.slice(k + 1).trim(), 'ao-pan-stop', () => this.glideTo(f, 900), 'Pan to here');
    }
    this.glideBtn = mk('Glide', 'ao-pan-glide', () => (this.anim ? this.stop() : this.glide()), 'Pan slowly to the end');
    mk('Full size', 'ao-pan-zoom', () => openViewer(this.imgs[this.cur], this.imgs), 'Open the picture full size, to zoom in');

    const cap = this.querySelector(':scope > figcaption');
    this.insertBefore(bar, cap || null);
    this.insertBefore(mini, bar);
    this.insertBefore(stage, mini);

    // Mouse drag pans (touch and trackpads already scroll natively).
    let drag = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      this.stop();
      drag = { x: e.clientX, left: stage.scrollLeft };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('ao-pan-dragging');
    });
    stage.addEventListener('pointermove', (e) => {
      if (drag) stage.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    const end = () => { drag = null; stage.classList.remove('ao-pan-dragging'); };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', () => this.stop(), { passive: true });
    stage.addEventListener('touchstart', () => this.stop(), { passive: true });
    stage.addEventListener('keydown', (e) => {
      const step = stage.clientWidth * (e.shiftKey ? 0.9 : 0.25);
      const go = { ArrowRight: step, ArrowLeft: -step, End: Infinity, Home: -Infinity }[e.key];
      if (go === undefined) return;
      e.preventDefault();
      this.stop();
      const to = isFinite(go) ? stage.scrollLeft + go : go > 0 ? stage.scrollWidth : 0;
      stage.scrollTo({ left: to, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    stage.addEventListener('scroll', () => this.paint(), { passive: true });

    const jump = (e) => {
      const r = mini.getBoundingClientRect();
      this.stop();
      this.centreAt((e.clientX - r.left) / r.width);
    };
    let miniDrag = false;
    mini.addEventListener('pointerdown', (e) => { miniDrag = true; mini.setPointerCapture(e.pointerId); jump(e); });
    mini.addEventListener('pointermove', (e) => { if (miniDrag) jump(e); });
    mini.addEventListener('pointerup', () => { miniDrag = false; });

    for (const img of imgs) img.addEventListener('load', () => this.paint());
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(stage);
    this.onStop = () => this.stop();
    document.addEventListener('ao-stop', this.onStop);
    this.cur = 0;
    this.show(0);
    this.classList.add('ao-pan-ready');
  }

  disconnectedCallback() {
    this.stop();
    if (this.ro) this.ro.disconnect();
    if (this.onStop) document.removeEventListener('ao-stop', this.onStop);
  }

  // Where the frame's centre sits, as a fraction of the picture's width.
  frac() {
    const s = this.stage;
    return s.scrollWidth > 0 ? (s.scrollLeft + s.clientWidth / 2) / s.scrollWidth : 0;
  }

  centreAt(f) {
    const s = this.stage;
    s.scrollLeft = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
  }

  show(i) {
    const keep = this.frac();
    this.cur = i;
    this.imgs.forEach((img, k) => {
      const on = k === i;
      img.classList.toggle('ao-pan-off', !on);
      if (on) img.loading = 'eager';
    });
    this.viewBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    const img = this.imgs[i];
    this.miniImg.src = img.currentSrc || img.src;
    const restore = () => {
      if (this._shown) this.centreAt(keep);
      this._shown = true;
      this.paint();
    };
    if (img.complete && img.naturalWidth) restore(); else img.addEventListener('load', restore, { once: true });
  }

  paint() {
    const s = this.stage;
    if (!s || !s.scrollWidth) return;
    this.win.style.left = (s.scrollLeft / s.scrollWidth) * 100 + '%';
    this.win.style.width = Math.min(100, (s.clientWidth / s.scrollWidth) * 100) + '%';
  }

  glideTo(f, ms) {
    this.stop();
    const s = this.stage;
    const to = Math.max(0, Math.min(s.scrollWidth - s.clientWidth, f * s.scrollWidth - s.clientWidth / 2));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { s.scrollLeft = to; return; }
    this.run(s.scrollLeft, to, ms, (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2));
  }

  // About 30 seconds for the whole width, the pace of a scroll video.
  glide() {
    const s = this.stage;
    const max = s.scrollWidth - s.clientWidth;
    if (max <= 0) return;
    const from = s.scrollLeft >= max - 2 ? 0 : s.scrollLeft;
    this.run(from, max, 30000 * ((max - from) / max), (t) => t);
    this.glideBtn.textContent = 'Stop';
    this.glideBtn.setAttribute('aria-pressed', 'true');
  }

  run(from, to, ms, ease) {
    const s = this.stage;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      s.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) this.anim = requestAnimationFrame(step); else this.stop();
    };
    this.anim = requestAnimationFrame(step);
  }

  stop() {
    if (this.anim) cancelAnimationFrame(this.anim);
    this.anim = 0;
    if (this.glideBtn) {
      this.glideBtn.textContent = 'Glide';
      this.glideBtn.setAttribute('aria-pressed', 'false');
    }
  }
}

// ---------------------------------------------------------------------------------------
// <ao-treemap>: parts of a whole whose parts have parts, drawn as nested rectangles with
// areas in proportion. Written once as a plain <table>: first column = the groups (projects),
// every other column = a kind of part (languages), cells = amounts. Each group is a block, its
// parts tiles coloured by column. A second view (`views="By project|By language"`) turns it
// inside out: one block per column, the groups as its tiles. `top="6"` keeps the six largest
// columns and folds the rest into "Other". Pointing at a tile, or focusing the chart and using
// the arrow keys, reads it out. The table stays for screen readers; without JS it is the table.
function squarify(items, x, y, w, h) {
  // items: [{v}], sorted descending, v > 0. Returns the same items with x, y, w, h set.
  const out = [];
  let rest = items.slice();
  const total = rest.reduce((a, b) => a + b.v, 0);
  if (!total || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  const worst = (row, side) => {
    const s = row.reduce((a, b) => a + b.v * scale, 0);
    let mx = 0, mn = Infinity;
    for (const r of row) { mx = Math.max(mx, r.v * scale); mn = Math.min(mn, r.v * scale); }
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (rest.length) {
    const side = Math.min(w, h);
    const row = [rest[0]];
    let i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) row.push(rest[i++]);
    rest = rest.slice(i);
    const area = row.reduce((a, b) => a + b.v * scale, 0);
    if (w >= h) {
      const cw = area / h;
      let cy = y;
      for (const r of row) { const ch = (r.v * scale) / cw; out.push(Object.assign(r, { x, y: cy, w: cw, h: ch })); cy += ch; }
      x += cw; w -= cw;
    } else {
      const ch = area / w;
      let cx = x;
      for (const r of row) { const cw = (r.v * scale) / ch; out.push(Object.assign(r, { x: cx, y, w: cw, h: ch })); cx += cw; }
      y += ch; h -= ch;
    }
  }
  return out;
}
class AoTreemap extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const table = this.querySelector(':scope > table');
    if (!table) return;
    const head = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const num = (c) => { const n = parseFloat(String(c || '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
    let rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      const cells = [...tr.children];
      return { label: cells[0]?.textContent.trim() || '', values: cells.slice(1).map((c) => num(c.textContent)) };
    }).filter((r) => r.values.some((v) => v > 0));
    if (!rows.length) return;
    this._ready = true;
    let cols = head.slice(1);
    // Fold the smaller columns into "Other" when `top` asks for it.
    const top = parseInt(this.getAttribute('top'), 10);
    if (top > 0 && cols.length > top) {
      const sums = cols.map((_, k) => rows.reduce((a, r) => a + (r.values[k] || 0), 0));
      const keep = sums.map((s, k) => [s, k]).sort((a, b) => b[0] - a[0]).slice(0, top).map((p) => p[1]).sort((a, b) => a - b);
      rows = rows.map((r) => ({
        label: r.label,
        values: [...keep.map((k) => r.values[k] || 0), r.values.reduce((a, v, k) => a + (keep.includes(k) ? 0 : v), 0)],
      }));
      cols = [...keep.map((k) => cols[k]), 'Other'];
    }
    this.cols = cols;
    this.rows = rows;
    this.total = rows.reduce((a, r) => a + r.values.reduce((x, y) => x + y, 0), 0);
    this.unit = this.getAttribute('unit') || '';
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    const views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);
    this.view = 0;

    const wrap = document.createElement('div');
    wrap.className = 'ao-tm';
    const bar = document.createElement('div');
    bar.className = 'ao-tm-bar';
    if (views.length > 1) {
      this.viewBtns = views.slice(0, 2).map((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.setAttribute('aria-pressed', String(i === 0));
        b.addEventListener('click', () => this.setView(i));
        bar.append(b);
        return b;
      });
    }
    const legend = document.createElement('div');
    legend.className = 'ao-tm-legend';
    cols.forEach((c, k) => {
      const key = document.createElement('span');
      key.className = 'ao-tm-key';
      key.style.setProperty('--tm', `var(--tm-${k % 8})`);
      key.textContent = c;
      legend.append(key);
    });
    bar.append(legend);
    this.stage = document.createElement('div');
    this.stage.className = 'ao-tm-stage';
    this.stage.tabIndex = 0;
    this.stage.setAttribute('role', 'img');
    this.stage.setAttribute('aria-label', 'Treemap; the table it is drawn from follows. Arrow keys read the tiles.');
    this.read = document.createElement('p');
    this.read.className = 'ao-tm-read';
    this.read.setAttribute('aria-live', 'polite');
    wrap.append(bar, this.stage, this.read);
    table.classList.add('ao-tm-table');
    table.before(wrap);

    this.cur = -1;
    this.stage.addEventListener('pointermove', (e) => {
      const t = e.target.closest('.ao-tm-tile');
      if (t) this.focusTile(+t.dataset.i, false);
    });
    this.stage.addEventListener('pointerleave', () => { if (document.activeElement !== this.stage) this.focusTile(-1, false); });
    this.stage.addEventListener('keydown', (e) => {
      const n = this.tiles?.length || 0;
      if (!n) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); this.focusTile((this.cur + step + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); this.focusTile(0, true); }
      else if (e.key === 'End') { e.preventDefault(); this.focusTile(n - 1, true); }
    });
    this.stage.addEventListener('focus', () => { if (this.cur < 0) this.focusTile(0, true); });
    this.ro = new ResizeObserver(() => this.paint());
    this.ro.observe(this.stage);
    this.classList.add('ao-treemap-ready');
    this.paint();
  }
  disconnectedCallback() { this.ro?.disconnect(); }
  setView(i) {
    this.view = i;
    this.viewBtns?.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    this.cur = -1;
    this.paint();
    this.read.textContent = '';
  }
  groups() {
    // The outer blocks for the current view, each with its inner tiles, sorted descending.
    const { rows, cols } = this;
    const g = this.view === 0
      ? rows.map((r) => ({ label: r.label, parts: r.values.map((v, k) => ({ v, label: cols[k], k, group: r.label })) }))
      : cols.map((c, k) => ({ label: c, k, parts: rows.map((r) => ({ v: r.values[k] || 0, label: r.label, k, group: c })) }));
    for (const b of g) {
      b.parts = b.parts.filter((p) => p.v > 0).sort((a, b2) => b2.v - a.v);
      b.v = b.parts.reduce((a, p) => a + p.v, 0);
    }
    return g.filter((b) => b.v > 0).sort((a, b) => b.v - a.v);
  }
  fmt(v) { return v.toLocaleString('en-US') + (this.unit ? ' ' + this.unit : ''); }
  pct(v) { const p = (100 * v) / this.total; return (p >= 10 ? p.toFixed(0) : p.toFixed(1)) + '%'; }
  paint() {
    const W = this.stage.clientWidth, H = this.stage.clientHeight;
    if (!W || !H) return;
    const blocks = squarify(this.groups(), 0, 0, W, H);
    this.stage.textContent = '';
    this.tiles = [];
    const pad = 2, headH = 20;
    for (const b of blocks) {
      const el = document.createElement('div');
      el.className = 'ao-tm-block';
      Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
      const labelled = b.w > 64 && b.h > 44;
      const inner = { x: pad, y: labelled ? headH : pad, w: b.w - 2 * pad, h: b.h - (labelled ? headH : pad) - pad };
      if (labelled) {
        const name = document.createElement('span');
        name.className = 'ao-tm-name';
        name.textContent = b.label;
        el.append(name);
      }
      for (const p of squarify(b.parts.map((q) => ({ ...q })), inner.x, inner.y, inner.w, inner.h)) {
        const t = document.createElement('span');
        t.className = 'ao-tm-tile';
        t.dataset.i = String(this.tiles.length);
        t.style.setProperty('--tm', `var(--tm-${p.k % 8})`);
        Object.assign(t.style, { left: p.x + 'px', top: p.y + 'px', width: Math.max(0, p.w - 1) + 'px', height: Math.max(0, p.h - 1) + 'px' });
        if (p.w > 58 && p.h > 30) {
          const l = document.createElement('span');
          l.className = 'ao-tm-label';
          l.textContent = this.view === 0 && blocks.length > 1 && !labelled ? p.group : p.label;
          t.append(l);
        }
        el.append(t);
        this.tiles.push({ el: t, p, block: b });
      }
      this.stage.append(el);
    }
    if (this.cur >= 0 && this.tiles[this.cur]) this.focusTile(this.cur, false);
  }
  focusTile(i, keyed) {
    this.tiles?.forEach((t, k) => t.el.classList.toggle('ao-tm-on', k === i));
    this.cur = i;
    const t = this.tiles?.[i];
    if (!t) { this.read.textContent = ''; return; }
    const { p, block } = t;
    const outer = this.view === 0 ? p.group : p.label;
    const part = this.view === 0 ? p.label : p.group;
    this.read.textContent = `${outer} · ${part}: ${this.fmt(p.v)} (${this.pct(p.v)} of all). ${block.label} in all: ${this.fmt(block.v)} (${this.pct(block.v)}).`;
  }
}


// ---------------------------------------------------------------------------------------
// <ao-matrix>: one subject run through a grid of settings (a method per row, a target per
// column), every cell shown the same size, with buttons that switch every cell between views of
// the same output at once (textured / clay, before / after, front / back).
//   cols="A|B|C"     column headings, left to right
//   views="X|Y"      one button per view; a cell's nth <img> is its nth view (default: one view)
//   aspect="w/h"     the frame every picture is fitted into (default 1/1)
// Each child <div data-row="Label|note"> is a row of <figure>s; <figure class="none">text</figure>
// is an empty cell. Switching views on one matrix switches every matrix on the page that has the
// same views, so a reader comparing two subjects keeps one look. Without JS: the rows, every
// picture showing. Only the pictures in view open in the image viewer, and page through in order.
const MATRIX_VIEW = 'ao-matrix-view';
class AoMatrix extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const rows = [...this.querySelectorAll(':scope > div[data-row]')];
    if (!rows.length) return;
    this._ready = true;
    const cols = (this.getAttribute('cols') || '').split('|').map((c) => c.trim()).filter(Boolean);
    const n = Math.max(cols.length, ...rows.map((r) => r.querySelectorAll(':scope > figure').length));
    this.style.setProperty('--ao-cols', String(n));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.views = (this.getAttribute('views') || '').split('|').map((v) => v.trim()).filter(Boolean);

    const grid = document.createElement('div');
    grid.className = 'ao-matrix-grid';
    grid.setAttribute('role', 'table');
    const corner = document.createElement('span');
    corner.className = 'ao-matrix-corner';
    grid.append(corner);
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'ao-matrix-col';
      h.setAttribute('role', 'columnheader');
      h.textContent = cols[i] || '';
      grid.append(h);
    }
    for (const r of rows) {
      const [label, note] = r.getAttribute('data-row').split('|');
      const head = document.createElement('div');
      head.className = 'ao-matrix-row';
      head.setAttribute('role', 'rowheader');
      const b = document.createElement('b');
      b.textContent = label.trim();
      head.append(b);
      if (note) {
        const s = document.createElement('span');
        s.textContent = note.trim();
        head.append(s);
      }
      grid.append(head);
      const figs = [...r.querySelectorAll(':scope > figure')];
      for (let i = 0; i < n; i++) {
        const f = figs[i] || document.createElement('figure');
        if (!figs[i]) f.className = 'none';
        f.classList.add('ao-matrix-cell');
        // On a phone the column heading sits above the grid, out of sight: each cell says it.
        if (cols[i]) f.dataset.col = cols[i];
        grid.append(f);
      }
      r.remove();
    }
    this.cells = [...grid.querySelectorAll('figure:not(.none)')];

    if (this.views.length > 1) {
      const bar = document.createElement('div');
      bar.className = 'ao-matrix-bar';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Show every cell as');
      this.btns = this.views.map((v, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ao-matrix-btn';
        btn.textContent = v;
        btn.addEventListener('click', () => {
          this.show(i);
          document.dispatchEvent(new CustomEvent(MATRIX_VIEW, { detail: { from: this, views: this.views.join('|'), i } }));
        });
        bar.append(btn);
        return btn;
      });
      this.prepend(bar);
      this.onView = (e) => {
        if (e.detail.from !== this && e.detail.views === this.views.join('|')) this.show(e.detail.i);
      };
      document.addEventListener(MATRIX_VIEW, this.onView);
    }
    const cap = this.querySelector(':scope > figcaption');
    if (cap) this.insertBefore(grid, cap); else this.append(grid);
    this.show(0);
    this.classList.add('ao-matrix-ready');
  }

  disconnectedCallback() {
    if (this.onView) document.removeEventListener(MATRIX_VIEW, this.onView);
  }

  show(i) {
    for (const f of this.cells) {
      const imgs = [...f.querySelectorAll(':scope > img')];
      const k = Math.min(i, imgs.length - 1);
      imgs.forEach((img, j) => {
        img.classList.toggle('ao-matrix-off', j !== k);
        // A view only fetches its pictures once someone asks for it.
        if (j === k && img.loading === 'lazy' && i > 0) img.loading = 'eager';
      });
    }
    (this.btns || []).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
  }
}

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
if (!customElements.get('ao-series')) customElements.define('ao-series', AoSeries);
if (!customElements.get('ao-funnel')) customElements.define('ao-funnel', AoFunnel);
if (!customElements.get('ao-ask')) customElements.define('ao-ask', AoAsk);
if (!customElements.get('ao-matrix')) customElements.define('ao-matrix', AoMatrix);
if (!customElements.get('ao-pan')) customElements.define('ao-pan', AoPan);
if (!customElements.get('ao-treemap')) customElements.define('ao-treemap', AoTreemap);
