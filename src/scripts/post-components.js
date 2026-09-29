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

if (!customElements.get('ao-compare')) customElements.define('ao-compare', AoCompare);
if (!customElements.get('ao-game')) customElements.define('ao-game', AoGame);
if (!customElements.get('ao-model')) customElements.define('ao-model', AoModel);
if (!customElements.get('ao-timeline')) customElements.define('ao-timeline', AoTimeline);
if (!customElements.get('ao-slider')) customElements.define('ao-slider', AoSlider);
