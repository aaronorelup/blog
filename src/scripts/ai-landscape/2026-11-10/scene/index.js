// The engine: one renderer, one frame loop, and the context every section and signature is built with.
// Each frame it resets the shared pieces to their defaults, lets the section that owns the scroll position say
// what it wants, then draws that. A section module is loaded when its section is within 1.5 screens:
// sections/<data-sec>.js exports create(ctx, el, sec) and returns { enter, update(t, dt), leave, dispose }.
import { Scene, SRGBColorSpace, WebGLRenderer } from 'three';
import { createWatchdog } from '../core/quality.js';
import { createRig } from './camera.js';
import { createLabels } from './labels.js';
import { createMaterials } from './materials.js';
import { createPrims } from './primitives.js';
import { createRow } from './row.js';
import { createStudio } from './studio.js';
import { createTextures } from './textures.js';
import { createThread } from './thread.js';
import { createWorlds } from './world.js';

const SECTIONS = import.meta.glob('../sections/*.js');
const SIGNATURES = import.meta.glob('../signatures/*.js');
const FACES = ['400 120px "League Gothic"', '400 20px "JetBrains Mono"', 'italic 400 30px "Instrument Serif"'];

export async function mount(boot) {
  const { canvas, clock, input, state, rung, phone, reduced, query, data, toText } = boot;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.sortObjects = true;
  const scene = new Scene();
  await Promise.all(FACES.map((f) => document.fonts.load(f))).catch(() => {});

  const ctx = { canvas, renderer, scene, clock, input, state, data, phone, reduced, query, quality: { ...rung }, time: 0 };
  ctx.mats = createMaterials();
  ctx.textures = createTextures(ctx);
  ctx.rig = createRig(ctx);
  ctx.camera = ctx.rig.camera;
  ctx.studio = createStudio(ctx);
  ctx.labels = createLabels(ctx);
  ctx.row = createRow(ctx);
  ctx.thread = createThread(ctx);
  ctx.worlds = createWorlds(ctx);
  ctx.prims = createPrims(ctx);
  ctx.createThread = (options) => createThread(ctx, options);
  // The signature module for a world: signatures/<name>.js, or null. It exports create(ctx, world).
  ctx.signature = (name) => { const load = SIGNATURES[`../signatures/${name}.js`]; return load ? load() : Promise.resolve(null); };
  // Scroll the page to a section (by id), or to a point inside it: u screens from its start.
  ctx.scrollTo = (id, u = 0) => {
    const sec = clock.sections.find((x) => x.id === id);
    if (sec) window.scrollTo({ top: clock.pixels(sec.s0 + u), behavior: reduced ? 'auto' : 'smooth' });
  };

  const size = { w: 0, h: 0 };
  function resize() {
    size.w = window.innerWidth; size.h = window.innerHeight;
    renderer.setPixelRatio(watchdog.quality.ratio);
    renderer.setSize(size.w, size.h, false);
    ctx.rig.resize(size.w, size.h);
    ctx.labels.resize(size.w, size.h);
    ctx.worlds.resize(size.w, size.h, renderer.getPixelRatio());
  }
  let live = true;
  const giveUp = () => { if (live) toText(); };
  const watchdog = createWatchdog(rung, {
    apply(q) { Object.assign(ctx.quality, q); state.tier = q.name; if (size.w) resize(); },
    onStatic: giveUp,
  });
  resize();
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); giveUp(); });

  // ---- sections: loaded when near, built once per element, dropped when far
  const slots = new Map();
  function tend(sec) {
    let slot = slots.get(sec);
    if (!slot && sec.near) {
      const load = SECTIONS[`../sections/${sec.name}.js`];
      slot = { ctl: null, gone: false, inside: false };
      slots.set(sec, slot);
      if (load) load().then((m) => { if (!slot.gone && live) { slot.ctl = m.create(ctx, sec.el, sec); if (slot.ctl) slot.ctl.range = [sec.s0, sec.s1]; } }).catch((err) => console.warn('ai-landscape: a section did not load.', sec.name, err));
    } else if (slot && sec.far && clock.current !== sec) {
      slot.gone = true;
      if (slot.ctl && slot.ctl.dispose) slot.ctl.dispose();
      slots.delete(sec);
    }
    return slot;
  }

  let active = null;
  let lastStop = null;
  function frame(dt, time) {
    if (!live) return;
    ctx.time = time; ctx.dt = dt;
    ctx.mats.shared.uTime.value = time;
    ctx.row.reset(); ctx.studio.reset(); ctx.rig.reset(); ctx.thread.reset(); ctx.worlds.reset();

    let slot = null;
    for (const sec of clock.sections) { const s = tend(sec); if (sec === clock.current) slot = s; }
    const cur = clock.current;
    const next = slot && slot.ctl ? slot : null;
    if (next !== active) {
      if (active && active.ctl.leave) active.ctl.leave();
      if (next && next.ctl.enter) next.ctl.enter();
      if (!active || !next) ctx.rig.cut();          // a scene arriving or leaving cuts. Between two sections the rig eases
      active = next;
    }
    if (active) {
      // reduced motion: a section may name still stops (t values). The clock snaps to the nearest, with a short fade
      let t = cur.t;
      const stops = reduced && active.ctl.stops;
      if (stops && stops.length) {
        t = stops.reduce((a, b) => (Math.abs(b - cur.t) < Math.abs(a - cur.t) ? b : a));
        const key = `${cur.id}:${t}`;
        if (lastStop && lastStop !== key) { document.documentElement.classList.add('ail-cut'); setTimeout(() => document.documentElement.classList.remove('ail-cut'), 210); }
        lastStop = key;
      }
      active.ctl.update(t, dt, t * cur.screens);
    } else ctx.rig.to(ctx.rig.stops.row);

    ctx.rig.update(dt, input);
    ctx.row.update(dt, time, input);
    ctx.studio.update(dt);
    ctx.worlds.update();
    ctx.thread.update();
    ctx.labels.update();
    renderer.render(scene, ctx.camera);
    state.frames++;
    const c = ctx.camera.position;
    state.camera = { x: +c.x.toFixed(3), y: +c.y.toFixed(3), z: +c.z.toFixed(3), fov: +ctx.camera.fov.toFixed(2) };
    input.moved = false;
    watchdog.sample(dt);
  }

  // hooks for tests and screenshots: the context itself, and one stack shown in the five states
  state.debug = {
    ctx,
    states(id, list = ['solid', 'hatch', 'frost', 'dotted', 'hollow', 'solid', 'hatch', 'frost', 'hollow']) {
      ctx.row.tower(id).setCells(list.map((s) => ({ s, g: [] })), true);
    },
  };

  return {
    frame, resize,
    dispose() {
      live = false;
      for (const slot of slots.values()) { slot.gone = true; if (slot.ctl && slot.ctl.dispose) slot.ctl.dispose(); }
      slots.clear();
      renderer.dispose();
      const lose = renderer.getContext().getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    },
  };
}
