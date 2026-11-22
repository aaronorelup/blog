// THE QUIET HOUR: the film as a pure function of (frame, ending).
//
//   import { createFilm } from './film.js';
//   const film = await createFilm({ canvas, width, height, ending: 'main', quality: 'final' });
//   await film.ready; film.renderFrame(1440);
//
// renderFrame(frame) does, in order (bible sections 3 to 7):
//   1. S = engine.signals(frame)                every number for this frame, from the log
//   2. shot = shotAt(frame)                     room camera + programme view (src/shots.js)
//   3. programme.draw(ctx, S, view)             the 4:3 programme canvas, 1280x960
//   4. room.update(S, shot)                     the room, with that canvas as the TV picture
//   5. post.render(...)                         the final pass + burned-in subtitles
// There is no animation loop here, no wall clock and no Math.random: whoever calls renderFrame owns
// time (the player page with requestAnimationFrame, the render harness frame by frame).
//
// It also sets window.QH = { ready, renderFrame, setEnding, info } for make/render.mjs.

import * as THREE from 'three';
import { PROGRAMME_FRAMES, TOTAL_FRAMES } from './src/time.js';
import { loadEngine } from './src/signals.js';
import { shotAt } from './src/shots.js';
import { PROGRAMME_W, PROGRAMME_H } from './src/layout.js';
import { createProgramme } from './src/programme/index.js';
import { createRoom } from './src/room/index.js';
import { createPost } from './src/post.js';
import { createSubtitles } from './src/subtitles.js';

export const ENDINGS = ['main', 'alone', 'x3', 'x10'];
const here = new URL('./', import.meta.url);

// The three faces (fonts/LICENSES.txt). Names are ours, so nothing falls back to a system font.
const FACES = [
  ['QH Serif', 'fonts/cormorant-garamond-400.woff2', { weight: '400', style: 'normal' }],
  ['QH Serif', 'fonts/cormorant-garamond-400.woff2', { weight: '400', style: 'italic' }], // synthesised slant
  ['QH Mono', 'fonts/courier-prime-400.woff2', { weight: '400', style: 'normal' }],
  ['QH Hand', 'fonts/caveat-400.woff2', { weight: '400', style: 'normal' }],
];
let fontsLoaded = null;
export function loadFonts() {
  fontsLoaded ||= (async () => {
    for (const [family, file, desc] of FACES) {
      const face = new FontFace(family, `url(${new URL(file, here)})`, desc);
      document.fonts.add(await face.load());
    }
    for (const fam of ['QH Serif', 'QH Mono', 'QH Hand']) await document.fonts.load(`40px "${fam}"`, 'THE QUIET HOUR 0123456789:');
    await document.fonts.load('italic 40px "QH Serif"', 'a music box');
    await document.fonts.ready;
  })();
  return fontsLoaded;
}

export async function createFilm({ canvas, width = 1280, height = 720, ending = 'main', quality = 'final', xrayText = null }) {
  if (!ENDINGS.includes(ending)) throw new Error(`unknown ending ${ending}`);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'draft', preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const progCanvas = document.createElement('canvas');
  progCanvas.width = PROGRAMME_W; progCanvas.height = PROGRAMME_H;
  const progCtx = progCanvas.getContext('2d', { alpha: false });
  const subCanvas = document.createElement('canvas');
  subCanvas.width = width; subCanvas.height = height;
  const subCtx = subCanvas.getContext('2d');

  const room = createRoom({ renderer, programmeCanvas: progCanvas, width, height, quality });
  const post = createPost({ renderer, width, height, quality });

  let engine = null, programme = null, subs = null, current = null;
  async function setEnding(name) {
    if (!ENDINGS.includes(name)) throw new Error(`unknown ending ${name}`);
    const e = await loadEngine(name, new URL('./', here).href);
    engine = e; subs = createSubtitles(engine);
    // xrayText (the lab page only): words the x-ray labels' values for a reader. The programme reads nothing else
    // from the engine, and without it (the film, ?render=1) it gets the engine itself, as before.
    programme = createProgramme({ engine: xrayText ? { gauges: (f) => e.gauges(f).map((g) => ({ ...g, value: xrayText(g.value) })) } : engine });
    current = name; film.engine = engine;
    return engine;
  }

  /** Draw frame `frame` (integer, 0..PROGRAMME_FRAMES-1) of the current ending. Returns the shot.
   *  opts.xray (the lab page only, never the film): the programme's x-ray labels on the TV picture. */
  function renderFrame(frame, opts) {
    const f = Math.max(0, Math.min(PROGRAMME_FRAMES - 1, Math.floor(frame)));
    const S = engine.signals(f);
    const shot = shotAt(f);
    if (opts && opts.xray) programme.draw(progCtx, S, shot.view, { xray: true });
    else programme.draw(progCtx, S, shot.view);
    room.update(S, shot);
    const cue = subs.at(f);
    const key = cue ? `${cue.id}|${cue.text}|${cue.alpha.toFixed(3)}` : null;
    if (key !== lastSubKey) { subs.draw(subCtx, width, height, cue); lastSubKey = key; }
    post.render(room.scene, room.camera, subCanvas, key);
    return shot;
  }
  let lastSubKey = undefined;

  const film = {
    engine: null, width, height,
    frames: PROGRAMME_FRAMES, totalFrames: TOTAL_FRAMES,
    renderFrame, setEnding,
    get ending() { return current; },
    renderer, programmeCanvas: progCanvas,
    dispose() { room.dispose(); post.dispose(); renderer.dispose(); },
  };
  film.ready = (async () => {
    await loadFonts();
    await setEnding(ending);
    // compile every shader and warm up once (the result is discarded: the next call redraws all)
    renderer.compile(room.scene, room.camera);
    renderFrame(0);
    return film;
  })();
  if (typeof window !== 'undefined') {
    window.QH = {
      ready: film.ready.then(() => info(film)),
      renderFrame, setEnding: async (n) => { await setEnding(n); return info(film); },
      info: () => info(film), film,
      gl: renderer.getContext(),
    };
  }
  return film;
}

/** Info for the harness: what this page will render. */
export function info(film) {
  return {
    ending: film.ending, width: film.width, height: film.height, frames: film.frames,
    three: THREE.REVISION, ua: navigator.userAgent,
    gl: (() => { const gl = film.renderer.getContext(); const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); })(),
  };
}
