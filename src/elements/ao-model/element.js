// <ao-model>: a GLB the reader can turn around. Nothing heavy loads until they ask: the poster and a button show
// first, and three.js plus the model arrive on the click. Drag to orbit, scroll or pinch to zoom; it turns slowly on
// its own until touched. Attributes src, poster, size, label, ratio: docs/COMPONENTS.md.

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

customElements.define('ao-model', AoModel);
