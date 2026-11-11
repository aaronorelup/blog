// The hero's 3D chunk (boot.js imports it after first paint): mount(section, stage) builds the scene from the
// manifest, pins the section (data-3d="on", stage.css), cross-fades from the poster on the first drawn frame, and
// runs the frame loop only while the hero is on screen and the tab is visible. Any failure throws before the pin,
// leaving the poster. window.__teaHero is the screenshot and console hook (setProgress, freeze, pointer, dispose).
import { ACESFilmicToneMapping, Color, Fog, Scene, WebGLRenderer } from './three.js';
import { disposeTree, loadActors, orientActors } from './actors.js';
import { loadBackdrop, paintBackdrop } from './backdrop.js';
import { createCamera, fitCamera, placeCamera } from './camera.js';
import { tickCrt } from './crt.js';
import { createInput } from './input.js';
import { buildLights, paintLights, skyEnvironment } from './lights.js';
import { loadManifest } from './manifest.js';
import { createMotes, tickMotes } from './motes.js';
import { leadOf, pinSection, relayout, unpinSection, whenPinnable, writeProgress } from './pin.js';
import { loadThree } from './three.js';
import { applyTracks, bindTracks, sample } from './tracks.js';

const isNight = () => document.documentElement.dataset.mode !== 'day';
const SKY = ['#20284F', '#B98A6A', '#151726'];   // the painted sky the models are lit by: top, horizon, ground

export async function mount(section, stage, opts = {}) {
  await loadThree();
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const manifest = await loadManifest(stage.dataset.manifest || '/tea/hero/manifest.json');
  const canvas = document.createElement('canvas');
  canvas.className = 'tea-stage-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  const s = {
    renderer, canvas, manifest, raf: 0, running: false, visible: true, onscreen: true, frozen: null, lead: 0, dock: 0,
  };
  try {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse || small ? 1.5 : 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    // the page's mode from now on, the switch pressed while the scene loads included
    s.mo = new MutationObserver(() => { s.target = isNight() ? 1 : 0; });
    s.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
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
    s.env = skyEnvironment(renderer, ...SKY);
    scene.environment = s.env;
    s.lights = buildLights(manifest, actors, scene);
    s.bound = bindTracks(manifest, actors);
    s.motes = createMotes(manifest.motes, coarse || small ? manifest.motes.mobile : manifest.motes.count,
      renderer.getPixelRatio());
    scene.add(s.motes);
    s.fogN = new Color(manifest.look.night.fog);
    s.fogD = new Color(manifest.look.day.fog);
    // behind everything, should a tall screen see past the picture's edge: the garden's own dark
    s.clearN = new Color(manifest.look.night.clear);
    s.clearD = new Color(manifest.look.day.clear);
    scene.background = s.clearN.clone();
    scene.fog = new Fog(s.fogN.clone(), 9, 40);
    s.input = createInput(section, manifest.camera.parallax);
    s.size = [0, 0];
    stage.appendChild(canvas);
    // the pin waits for a moment when it moves nothing on screen (pin.js); the poster stays till then. If the mode
    // changed while the scene loaded, the other mode's pictures come first, so the first frame is in the page's mode.
    for (;;) {
      await whenPinnable(section);
      if ((s.target === 1) === night || backdrop.tried) break;
      await backdrop.later();
    }
    s.mix = s.target;
    pinSection(section);
    resize(s, stage);
    s.lead = leadOf(section);
    // compile and draw once before anything else changes on the page
    s.clock = performance.now();
    s.time = 0;
    frame(s, section, 0);
  } catch (e) {
    if (s.mo) s.mo.disconnect();
    if (s.input) s.input.dispose();
    canvas.remove();
    renderer.dispose();
    unpinSection(section);   // a failure after the pin leaves the static hero, not a tall section holding a poster
    throw e;
  }
  // the poster gives way once a frame is really on the canvas; from then on the hero changes no layout by itself
  requestAnimationFrame(() => { reveal(s, stage); section.dataset.heroSettled = ''; });
  s.backdrop.later();
  wire(s, section, stage);
  if (!opts.noHook) window.__teaHero = hook(s, section, stage);
  return s;
}

// The canvas fades in over the poster (data-ready, 700 ms in stage.css); once it covers it the poster is taken away
// (data-covered), so a switch of mode fetches no other poster under an opaque canvas. Both come back together.
function reveal(s, stage) {
  stage.dataset.ready = '';
  clearTimeout(s.cover);
  s.cover = setTimeout(() => { if (stage.dataset.ready != null) stage.dataset.covered = ''; }, 800);
}

function conceal(s, stage) {
  clearTimeout(s.cover);
  delete stage.dataset.covered;
  delete stage.dataset.ready;
}

function resize(s, stage) {
  const w = stage.clientWidth || innerWidth;
  const h = stage.clientHeight || innerHeight;
  if (w === s.size[0] && h === s.size[1]) return;
  s.size = [w, h];
  s.renderer.setSize(w, h, false);
  const was = s.camRig.portrait;
  fitCamera(s.camRig, s.manifest.reference.aspect, w, h);
  if (s.actors && was !== s.camRig.portrait) orientActors(s.actors, s.manifest, s.camRig.portrait);
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
  // the scene's own progress: in the flow layout it waits for the title box to scroll away (s.lead)
  const p = Math.min(1, Math.max(0, (s.input.st.p - s.lead) / (1 - s.lead)));
  writeProgress(section, s.input.st.raw);
  // while the box is docked lower left (the dock layout) the picture slides right, eased like the box's own move
  const docked = section.dataset.heroLayout === 'dock' && section.dataset.heroPhase === 'docked' ? 1 : 0;
  s.dock += (docked - s.dock) * (dt ? 1 - Math.exp(-dt * 3.5) : 1);
  s.camRig.shift = s.dock * sample(s.manifest.camera.dock.shift, p, 'smooth');
  applyTracks(s.bound, p, time, s.camRig.portrait ? s.manifest.camera.portrait.travel : 1);
  placeCamera(s.camRig, p, s.input.st.par);
  const L = s.manifest.look;
  s.renderer.toneMappingExposure = L.day.exposure + (L.night.exposure - L.day.exposure) * s.mix;
  s.scene.fog.color.copy(s.fogD).lerp(s.fogN, s.mix);
  s.scene.background.copy(s.clearD).lerp(s.clearN, s.mix);
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
    // the clock restarts on resume, so no jump after a pause; a frame's timestamp is when it began, which after a long
    // task (the first draw's shader compile) is earlier than the performance.now() the clock was set from: never < 0
    const dt = Math.max(0, Math.min(0.25, (now - s.clock) / 1000));
    s.clock = now;
    frame(s, section, dt);
    s.raf = requestAnimationFrame(loop);
  };
  s.play = () => {
    const on = s.visible && s.onscreen && !s.disposed && !s.held && !s.lost;
    if (on && !s.running) { s.running = true; s.clock = performance.now(); s.raf = requestAnimationFrame(loop); }
    if (!on && s.running) { s.running = false; cancelAnimationFrame(s.raf); s.raf = 0; }
  };
  // the latest entry is the state now (a busy page can be told of a leave and a return at once)
  s.io = new IntersectionObserver((es) => { s.onscreen = es[es.length - 1].isIntersecting; s.play(); });
  s.io.observe(section);
  s.onVis = () => { s.visible = document.visibilityState === 'visible'; s.play(); };
  document.addEventListener('visibilitychange', s.onVis);
  s.ro = new ResizeObserver(() => {
    relayout(section);
    s.lead = leadOf(section);
    resize(s, stage);
    if (!s.running) frame(s, section, 0);
  });
  s.ro.observe(stage);
  s.ro.observe(section.querySelector('.tea-hero-box') || stage);
  // A lost WebGL context (a GPU reset, too many contexts): the poster shows again and nothing draws until it is back.
  // three remakes its own state then; the environment light only ever lived on the GPU (drawn once by PMREM), so it is
  // drawn again, or the characters come back lit blue-grey.
  s.onLost = () => { s.lost = true; conceal(s, stage); s.play(); };
  s.onBack = () => {
    s.lost = false;
    s.env = skyEnvironment(s.renderer, ...SKY);
    s.scene.environment = s.env;
    frame(s, section, 0);
    requestAnimationFrame(() => { if (!s.lost && !s.disposed) reveal(s, stage); });
    s.play();
  };
  s.canvas.addEventListener('webglcontextlost', s.onLost);
  s.canvas.addEventListener('webglcontextrestored', s.onBack);
  // Reduced motion asked for while the scene runs: the scene goes and the poster stays, as if it had been asked first
  // (the unpin keeps what the reader sees where it is).
  s.still = matchMedia('(prefers-reduced-motion: reduce)');
  s.onStill = () => {
    if (!s.still.matches || s.disposed) return;
    dispose(s, section, stage);
    section.dataset['3dOff'] = 'reduced motion';
  };
  s.still.addEventListener('change', s.onStill);
  s.play();
}

export function dispose(s, section, stage) {
  s.disposed = true;
  s.running = false;
  cancelAnimationFrame(s.raf);
  s.io.disconnect(); s.ro.disconnect(); s.mo.disconnect();
  document.removeEventListener('visibilitychange', s.onVis);
  s.canvas.removeEventListener('webglcontextlost', s.onLost);
  s.canvas.removeEventListener('webglcontextrestored', s.onBack);
  s.still.removeEventListener('change', s.onStill);
  s.input.dispose();
  disposeTree(s.scene);
  s.lights.tex.dispose();
  s.env.dispose();
  s.renderer.dispose();
  s.canvas.remove();
  conceal(s, stage);
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
    // no frame loop while held (render() still draws one): cheap, repeatable screenshots on a slow software GPU
    hold(on) { s.held = !!on; s.play(); },
    render() { s.input.st.snap = true; frame(s, section, 0); s.input.st.snap = false; },
    dispose: () => dispose(s, section, stage),
  };
}
