// The hero's 3D chunk (boot.js imports it after first paint): mount(section, stage) builds the scene from the
// manifest, pins the section (data-3d="on", stage.css), cross-fades from the poster on the first drawn frame, and
// runs the frame loop only while the hero is on screen and the tab is visible. Any failure throws before the pin,
// leaving the poster. window.__teaHero is the screenshot and console hook (setProgress, freeze, pointer, dispose).
import { ACESFilmicToneMapping, Color, Fog, Scene, WebGLRenderer } from 'three';
import { disposeTree, loadActors } from './actors.js';
import { loadBackdrop, paintBackdrop } from './backdrop.js';
import { createCamera, fitCamera, placeCamera } from './camera.js';
import { tickCrt } from './crt.js';
import { createInput } from './input.js';
import { buildLights, paintLights, skyEnvironment } from './lights.js';
import { loadManifest } from './manifest.js';
import { createMotes, tickMotes } from './motes.js';
import { pinSection, unpinSection, writeProgress } from './pin.js';
import { applyTracks, bindTracks } from './tracks.js';

const isNight = () => document.documentElement.dataset.mode !== 'day';

export async function mount(section, stage, opts = {}) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const manifest = await loadManifest(stage.dataset.manifest || '/tea/hero/manifest.json');
  const canvas = document.createElement('canvas');
  canvas.className = 'tea-stage-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  const s = { renderer, canvas, manifest, raf: 0, running: false, visible: true, onscreen: true, frozen: null };
  try {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse || small ? 1.5 : 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    const night = isNight();
    s.mix = night ? 1 : 0;
    s.target = s.mix;
    const scene = new Scene();
    s.scene = scene;
    s.camRig = createCamera(manifest);
    const w0 = stage.clientWidth || innerWidth;
    const h0 = stage.clientHeight || innerHeight;
    fitCamera(s.camRig, manifest.reference.aspect, w0, h0);
    const anis = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const [actors, backdrop] = await Promise.all([
      loadActors(manifest, s.camRig.portrait),
      loadBackdrop(manifest, night, anis),
    ]);
    s.actors = actors;
    s.backdrop = backdrop;
    for (const l of backdrop.layers) scene.add(l.mesh);
    for (const a of actors) scene.add(a.root);
    s.env = skyEnvironment(renderer, '#20284F', '#B98A6A', '#151726');
    scene.environment = s.env;
    s.lights = buildLights(manifest, actors, scene);
    s.bound = bindTracks(manifest, actors);
    s.motes = createMotes(manifest.motes, coarse || small ? manifest.motes.mobile : manifest.motes.count,
      renderer.getPixelRatio());
    scene.add(s.motes);
    s.fogN = new Color(manifest.look.night.fog);
    s.fogD = new Color(manifest.look.day.fog);
    scene.fog = new Fog(s.fogN.clone(), 9, 40);
    s.input = createInput(section, manifest.camera.parallax);
    s.size = [0, 0];
    resize(s, stage);
    stage.appendChild(canvas);
    // compile and draw once before anything changes on the page
    s.clock = performance.now();
    s.time = 0;
    pinSection(section);
    frame(s, section, 0);
  } catch (e) {
    canvas.remove();
    renderer.dispose();
    throw e;
  }
  // the poster gives way once a frame is really on the canvas
  requestAnimationFrame(() => { stage.dataset.ready = ''; });
  s.backdrop.later();
  wire(s, section, stage);
  if (!opts.noHook) window.__teaHero = hook(s, section, stage);
  return s;
}

function resize(s, stage) {
  const w = stage.clientWidth || innerWidth;
  const h = stage.clientHeight || innerHeight;
  if (w === s.size[0] && h === s.size[1]) return;
  s.size = [w, h];
  s.renderer.setSize(w, h, false);
  fitCamera(s.camRig, s.manifest.reference.aspect, w, h);
  // a tall screen sees more above and below than the picture was painted for: the layers grow to cover it
  for (const l of s.backdrop.layers) l.mesh.scale.setScalar(s.camRig.portrait ? l.spec.portraitScale : 1);
}

function frame(s, section, dt) {
  if (s.frozen == null) s.time += dt;
  const time = s.frozen ?? s.time;
  s.input.update(dt, time);
  const k = 1 - Math.exp(-dt * 3.2);
  s.mix += (s.target - s.mix) * (dt ? k : 1);
  if (Math.abs(s.target - s.mix) < 1e-3) s.mix = s.target;
  const p = s.input.st.p;
  writeProgress(section, s.input.st.raw);
  applyTracks(s.bound, p, time);
  placeCamera(s.camRig, p, s.input.st.par);
  const L = s.manifest.look;
  s.renderer.toneMappingExposure = L.day.exposure + (L.night.exposure - L.day.exposure) * s.mix;
  s.scene.fog.color.copy(s.fogD).lerp(s.fogN, s.mix);
  paintBackdrop(s.backdrop, s.mix, s.scene.fog.color);
  paintLights(s.lights, s.mix, time);
  for (const a of s.actors) for (const m of a.shaders) tickCrt(m, time);
  tickMotes(s.motes, time, s.mix);
  s.renderer.render(s.scene, s.camRig.cam);
}

function wire(s, section, stage) {
  const loop = (now) => {
    s.raf = 0;
    if (!s.running) return;
    const dt = Math.min(0.1, (now - s.clock) / 1000);
    s.clock = now;
    frame(s, section, dt);
    s.raf = requestAnimationFrame(loop);
  };
  s.play = () => {
    const on = s.visible && s.onscreen && !s.disposed;
    if (on && !s.running) { s.running = true; s.clock = performance.now(); s.raf = requestAnimationFrame(loop); }
    if (!on && s.running) { s.running = false; cancelAnimationFrame(s.raf); s.raf = 0; }
  };
  s.io = new IntersectionObserver(([e]) => { s.onscreen = e.isIntersecting; s.play(); });
  s.io.observe(section);
  s.onVis = () => { s.visible = document.visibilityState === 'visible'; s.play(); };
  document.addEventListener('visibilitychange', s.onVis);
  s.ro = new ResizeObserver(() => { resize(s, stage); if (!s.running) frame(s, section, 0); });
  s.ro.observe(stage);
  s.mo = new MutationObserver(() => { s.target = isNight() ? 1 : 0; });
  s.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  s.play();
}

export function dispose(s, section, stage) {
  s.disposed = true;
  s.running = false;
  cancelAnimationFrame(s.raf);
  s.io.disconnect(); s.ro.disconnect(); s.mo.disconnect();
  document.removeEventListener('visibilitychange', s.onVis);
  s.input.dispose();
  disposeTree(s.scene);
  s.lights.tex.dispose();
  s.env.dispose();
  s.renderer.dispose();
  s.canvas.remove();
  delete stage.dataset.ready;
  unpinSection(section);
}

function hook(s, section, stage) {
  return {
    state: s,
    get progress() { return s.input.st.p; },
    // a fixed progress (null gives the scroll back), applied at once
    setProgress(p) { s.input.st.forced = p; s.input.st.snap = true; frame(s, section, 0); s.input.st.snap = false; },
    // idle time held at t seconds (null lets it run); the pointer pinned at [x, y] in -1..1 (null releases)
    freeze(t) { s.frozen = t; },
    pointer(xy) { s.input.st.forcedPar = xy; },
    render() { s.input.st.snap = true; frame(s, section, 0); s.input.st.snap = false; },
    dispose: () => dispose(s, section, stage),
  };
}
