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
//
// Usage notes live in the blog's CLAUDE.md, "Post components".
import '../styles/post-components.css';

// ---------------------------------------------------------------------------------------
// <ao-compare>: a grid of same-sized frames, so outputs can be judged side by side.
//   cols="N"      columns on wide screens (default 2; phones always get 1, tablets 2)
//   aspect="w/h"  the frame every item is fitted into, letterboxed on one background
//   sync          videos inside play, pause and seek together
// Clicking a still opens it full size in a <dialog>.
class AoCompare extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const cols = parseInt(this.getAttribute('cols') || '2', 10);
    this.style.setProperty('--ao-cols', String(Math.max(1, cols)));
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);

    this.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img || !this.contains(img)) return;
      openLightbox(img.currentSrc || img.src, img.alt);
    });

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

let lightbox;
function openLightbox(src, alt) {
  if (!lightbox) {
    lightbox = document.createElement('dialog');
    lightbox.className = 'ao-lightbox';
    lightbox.innerHTML = '<img alt=""><button type="button" aria-label="Close">×</button>';
    lightbox.addEventListener('click', () => lightbox.close());
    document.body.appendChild(lightbox);
  }
  const img = lightbox.querySelector('img');
  img.src = src;
  img.alt = alt || '';
  lightbox.showModal();
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
// game's own page. A fullscreen button and an "own tab" link sit under the frame.
//   src     the game's page, e.g. /games/storm-bell/
//   poster  still shown before loading
//   size    shown on the button so the reader knows what the click costs
//   label   what it is, for the button and for screen readers
//   aspect  the frame, default 16/9
//   note    one line under the frame (controls, what it needs)
// The inner markup (a link to the game) is the no-JS fallback.
class AoGame extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    const src = this.getAttribute('src');
    const poster = this.getAttribute('poster');
    const label = this.getAttribute('label') || 'Game';
    const size = this.getAttribute('size');
    const note = this.getAttribute('note');
    const aspect = this.getAttribute('aspect');
    if (aspect) this.style.setProperty('--ao-aspect', aspect);
    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', label);
    this.innerHTML = '';

    const stage = document.createElement('div');
    stage.className = 'ao-game-stage';
    if (poster) {
      const img = document.createElement('img');
      img.src = poster; img.alt = label; img.loading = 'lazy'; img.className = 'ao-game-poster';
      stage.appendChild(img);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ao-model-load ao-game-load';
    btn.textContent = 'Play it here' + (size ? ' (' + size + ')' : '');
    btn.addEventListener('click', () => this.load(src, label));
    stage.appendChild(btn);
    this.appendChild(stage);

    const bar = document.createElement('div');
    bar.className = 'ao-game-bar';
    if (note) {
      const n = document.createElement('span');
      n.className = 'ao-game-note';
      n.textContent = note;
      bar.appendChild(n);
    }
    const full = document.createElement('button');
    full.type = 'button';
    full.className = 'ao-game-full';
    full.textContent = 'Fullscreen';
    full.hidden = true;
    full.addEventListener('click', () => {
      const f = this.querySelector('iframe');
      (f?.requestFullscreen || f?.webkitRequestFullscreen)?.call(f);
      f?.focus();
    });
    bar.appendChild(full);
    const tab = document.createElement('a');
    tab.href = src;
    tab.target = '_blank';
    tab.rel = 'noopener';
    tab.textContent = 'Open in its own tab ↗';
    bar.appendChild(tab);
    this.appendChild(bar);
  }

  load(src, label) {
    const stage = this.querySelector('.ao-game-stage');
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = label;
    frame.allow = 'fullscreen; gamepad; autoplay';
    frame.allowFullscreen = true;
    stage.replaceChildren(frame);
    frame.addEventListener('load', () => frame.focus());
    const full = this.querySelector('.ao-game-full');
    if (full) full.hidden = false;
  }

  disconnectedCallback() {
    // The homepage swaps posts in and out of one host; stop the game when this one leaves.
    this.querySelector('iframe')?.remove();
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

    stage.append(line, tagA, tagB, range);
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
const AO_LISTEN_PLAY = 'ao-listen-play';
const fmtTime = (s) => (isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00');

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
      document.dispatchEvent(new CustomEvent(AO_LISTEN_PLAY, { detail: this }));
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
    const play = btn('Play', 'Play or pause every cut', () => toggle());
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
    const hear = (k) => {
      each((v, i) => { v.muted = i !== k; });
      sound.forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
    };
    // The host answers Range requests with the whole file (200, not 206), so a browser can only
    // seek inside what it has already buffered; a seek past that lands on 0. When a seek needs
    // more than is buffered, each cut is fetched once in full and played from a blob, which
    // seeks anywhere. `want` holds the target meanwhile, and nothing resyncs to the lead.
    let want = null;
    const urls = [];
    const whole = new Map();
    const canSeek = (v, t) => {
      if (v.readyState < 1) return false;
      for (let i = 0; i < v.seekable.length; i++) if (v.seekable.start(i) <= t && t <= v.seekable.end(i) + 0.05) return true;
      return false;
    };
    const loadWhole = (v) => {
      if (!whole.has(v)) {
        whole.set(v, fetch(v.currentSrc || v.src)
          .then((r) => r.blob())
          .then((blob) => new Promise((res) => {
            const u = URL.createObjectURL(blob);
            urls.push(u);
            v.addEventListener('loadedmetadata', res, { once: true });
            v.src = u;
          })));
      }
      return whole.get(v);
    };
    const start = () => {
      document.dispatchEvent(new CustomEvent(AO_LISTEN_PLAY, { detail: this }));
      each((v) => {
        v.preload = 'auto';
        if (want === null && v !== lead && Math.abs(v.currentTime - lead.currentTime) > 0.1) v.currentTime = lead.currentTime;
        v.play().catch(() => {});
      });
    };
    const stop = () => each((v) => v.pause());
    const toggle = () => (lead.paused ? start() : stop());
    const seek = (t, go) => {
      if (vids.every((v) => canSeek(v, t))) {
        want = null;
        each((v) => { v.currentTime = t; });
        show(t);
        if (go) start();
        return;
      }
      const resume = go || !lead.paused;
      want = t;
      stop();
      show(t);
      clock.textContent = 'loading the cuts…';
      Promise.all(vids.map(loadWhole)).then(() => {
        if (want !== t) return;
        want = null;
        each((v) => { v.currentTime = t; });
        show(t);
        if (resume) start();
      }, () => { want = null; show(); });
    };
    scrub.addEventListener('input', () => seek(parseFloat(scrub.value), false));

    let lit = null;
    const show = (at) => {
      const t = typeof at === 'number' ? at : want !== null ? want : lead.currentTime;
      if (isFinite(lead.duration)) scrub.max = String(lead.duration);
      scrub.value = String(t);
      clock.textContent = want !== null ? 'loading the cuts…' : fmtTime(t) + ' / ' + fmtTime(lead.duration);
      play.textContent = lead.paused ? 'Play' : 'Pause';
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
    // Followers drift a little on their own; nudge them back to the lead clock.
    const follow = () => {
      if (want !== null) return;
      for (const v of vids) {
        if (v === lead) continue;
        if (Math.abs(v.currentTime - lead.currentTime) > 0.15) v.currentTime = lead.currentTime;
        if (lead.paused !== v.paused) (lead.paused ? v.pause() : v.play().catch(() => {}));
      }
    };
    const loop = () => {
      show();
      if (lead.paused) { this._raf = 0; return; }
      this._raf = requestAnimationFrame(loop);
    };
    for (const ev of ['play', 'pause', 'seeked', 'loadedmetadata', 'ended']) lead.addEventListener(ev, () => show());
    lead.addEventListener('play', () => { if (!this._raf) loop(); });
    lead.addEventListener('timeupdate', follow);
    lead.addEventListener('pause', follow);

    hear(0);
    this._onOther = (e) => { if (e.detail !== this) stop(); };
    document.addEventListener(AO_LISTEN_PLAY, this._onOther);
    this._stop = () => { stop(); urls.forEach((u) => URL.revokeObjectURL(u)); };
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
      const pane = { fig, v, box, count, lines: [], lit: null, whole: null };
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
      v.addEventListener('play', () => {
        document.dispatchEvent(new CustomEvent(AO_LISTEN_PLAY, { detail: v }));
        if (!pane.raf) loop(pane);
      });
      v.addEventListener('seeked', () => light(pane));
      // timeupdate fires even where animation frames don't (a background tab), so check here too.
      v.addEventListener('timeupdate', () => { if (!this.getClientRects().length) v.pause(); });
      return pane;
    });

    // The host answers Range requests with the whole file (200, not 206), so a seek past what is
    // buffered lands on 0. Then the video is fetched once in full and played from a blob.
    const urls = [];
    const inside = (ranges, t) => {
      for (let i = 0; i < ranges.length; i++) if (ranges.start(i) <= t && t <= ranges.end(i) - 0.25) return true;
      return false;
    };
    const canSeek = (v, t) => v.readyState >= 1 && (inside(v.seekable, t) || inside(v.buffered, t));
    const seek = (pane, t) => {
      const { v } = pane;
      const go = () => { v.currentTime = t; v.play().catch(() => {}); light(pane, t); };
      if (canSeek(v, t) || pane.whole === 'done') { go(); return; }
      if (v.readyState < 1) {
        v.preload = 'metadata';
        v.addEventListener('loadedmetadata', () => seek(pane, t), { once: true });
        v.load();
        return;
      }
      pane.count.dataset.note = 'loading the whole video…';
      paint(pane);
      if (!pane.whole) {
        pane.whole = fetch(v.currentSrc || v.src).then((r) => r.blob()).then((blob) => new Promise((res) => {
          const u = URL.createObjectURL(blob);
          urls.push(u);
          v.addEventListener('loadedmetadata', res, { once: true });
          v.src = u;
        }));
      }
      pane.whole.then(() => {
        pane.whole = 'done';
        delete pane.count.dataset.note;
        paint(pane);
        go();
      }, () => { pane.whole = null; delete pane.count.dataset.note; paint(pane); });
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
      const note = pane.count.dataset.note;
      const q = input.value.trim();
      pane.count.textContent = note || (q ? `“${q}”: ${pane.hits || 0} ${pane.hits === 1 ? 'time' : 'times'}` : '');
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
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    this.classList.add('ao-tr-ready');
  }

  disconnectedCallback() {
    if (this._stop) this._stop();
    if (this._onOther) document.removeEventListener(AO_LISTEN_PLAY, this._onOther);
    this._ready = false;
  }
}

if (!customElements.get('ao-compare')) customElements.define('ao-compare', AoCompare);
if (!customElements.get('ao-transcript')) customElements.define('ao-transcript', AoTranscript);
if (!customElements.get('ao-game')) customElements.define('ao-game', AoGame);
if (!customElements.get('ao-model')) customElements.define('ao-model', AoModel);
if (!customElements.get('ao-timeline')) customElements.define('ao-timeline', AoTimeline);
if (!customElements.get('ao-slider')) customElements.define('ao-slider', AoSlider);
if (!customElements.get('ao-frames')) customElements.define('ao-frames', AoFrames);
if (!customElements.get('ao-diff')) customElements.define('ao-diff', AoDiff);
if (!customElements.get('ao-listen')) customElements.define('ao-listen', AoListen);
if (!customElements.get('ao-cues')) customElements.define('ao-cues', AoCues);
