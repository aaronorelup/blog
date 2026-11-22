// The final pass (bible 4 and 11): the film's grade, then the burned-in subtitles.
//
//   const post = createPost({ renderer, width, height, quality, grain });   // grain: 'static' | 'film' | 'off'
//   post.render(scene, camera, overlayCanvas, overlayKey, frame)
//
// Built for software WebGL, where every full-frame pass, render target, resolve or mip chain costs real time at
// 1080p (measured on this box: an 8-bit MSAA target with mip-chain halation added ~0.9 s of CPU per 720p frame; a
// separate multiply-blended grade quad still ~150 ms of wall time at 1080p). So the grade has no pass of its own: it
// lives in three's tone-mapping hook, and every tone-mapped surface runs it as the last step of its own shader:
//   - the curve (CustomToneMapping): a soft shoulder that rolls highlights over 1 into the top of the range
//     (1.0 -> 0.93), a small toe that keeps the blacks rich but leaves the room's 5..10% walls readable, a breath of
//     blue in the deepest shadow (night). Mid grey stays put;
//   - then qhFilm: a soft round vignette, then the grain, in one of three modes (GRAIN_MODES):
//       'static' (the default): a dither, not a texture. One fixed pattern that never changes with the frame
//         (a triangular-PDF dither of about +-1 code value of the 8-bit output, monochrome, two integer hashes a
//         pixel, seeded once by hash01(GRAIN_SEED, 0, 1, 0)), so the dark walls and the halo do not band in the
//         8-bit frames. It is added in display space (gamma 2, which tracks sRGB within 0.9..1.4 code values in the
//         darks), fades to nothing below 2 code values so black stays black, and costs no bitrate on a locked shot;
//       'film': grain that changes every frame (monochrome, multiplicative so black stays black, two staggered
//         lattices of 2 px cells at 1080 lines, at most 2% of the value), seeded by hash01(GRAIN_SEED, frame).
//         Kept for comparison: it multiplies the H.264 bitrate several times over;
//       'off': none (the dark gradients band).
//     The mode comes from createPost's `grain` option, else the page URL's ?grain= parameter, else 'static'. The
//     render tools pass it inside their --quality value (it lands in the page's query string unescaped):
//       node make/render.mjs ... --quality 'final&grain=film'      node make/contact.mjs ... --quality 'draft&grain=off'
// Shaders that must keep their colours exact (the picture tube, src/room/screen.js) call qhFilm alone, so the picture
// gets the vignette and grain but not the curve. Additive glows and the subtitles take neither; the glows that
// need a dither (src/room/tv.js) include the chunk `qh_dither` (qhDither(salt): the same static pattern, another salt).
// Halation is not a pass either: the tube's own bloom (src/room/screen.js) and the haze round the tube
// (src/room/tv.js) are the trace of light round the brightest thing in the frame.
// The subtitle overlay (a film-size 2D canvas) is drawn last with ordinary alpha, ungraded and grain-free.
//
// The frame size and the grain mode are baked into the grade at load. Only 'film' reads the frame: its seed arrives
// in toneMappingExposure (1 + hash01(GRAIN_SEED, frame)), which three sets on every draw and which nothing else in
// the film reads ('static' and 'off' keep it at 1). `frame` is the programme frame. If the caller does not pass it,
// the pass reads it from the TV group (src/room/tv.js writes S.frame onto group.userData.frame in its update, which
// runs before this in the same renderFrame). Either way the frame is a pure function of this frame's inputs: no
// feedback, no previous frame.

import * as THREE from 'three';
import { hash01 } from './rng.js';

export const GRAIN_SEED = 9101;
export const GRAIN_MODES = Object.freeze(['static', 'film', 'off']);
export const LOOK = Object.freeze({
  grain: 0.02,         // 'film': multiplicative grain range, the value times 0.98..1.00
  grainCell: 2.0,      // 'film': output pixels per grain cell at 1080 lines (scaled with the frame's height)
  dither: 0.8,         // 'static': TPDF dither amplitude in gamma-2 code values (about +-1.1 sRGB codes in the darks)
  vignette: 0.24,      // darkening in the far corners
});
// the static pattern's seed: fixed, from hash01, never the frame
const DITHER_SEED = Math.floor(hash01(GRAIN_SEED, 0, 1, 0) * 16777216);

/** 'static' | 'film' | 'off': the option if valid, else the page's ?grain=, else 'static'. Read once, at load. */
export function grainMode(option) {
  if (GRAIN_MODES.includes(option)) return option;
  let q = null;
  try { q = new URLSearchParams(globalThis.location?.search || '').get('grain'); } catch { /* no page */ }
  return GRAIN_MODES.includes(q) ? q : 'static';
}

// The static dither, shared by the grade and by the additive glows (#include <qh_dither>). In 'off' it is zero.
function ditherChunk(mode) {
  return /* glsl */`
#ifndef QH_DITHER
#define QH_DITHER
uint qhHash( ivec2 p, uint s ) {
  uint h = ( uint( p.x + 8192 ) * 73856093u ) ^ ( uint( p.y + 8192 ) * 19349663u ) ^ ( s * 83492791u );
  h = ( h ^ ( h >> 16u ) ) * 0x45d9f3bu; h = ( h ^ ( h >> 16u ) ) * 0x45d9f3bu; h ^= h >> 16u;
  return h;
}
// triangular-PDF dither in [-1, 1] (code values), fixed to the output pixel; salt picks an independent pattern
float qhDither( uint salt ) {
${mode === 'off' ? '  return 0.0;' : `  ivec2 p = ivec2( gl_FragCoord.xy );
  uint h = qhHash( p, ${DITHER_SEED}u + salt * 7919u );
  return float( ( h & 0xffffu ) + ( h >> 16u ) ) / 65535.0 - 1.0;`}
}
#endif`;
}

function gradeChunk(width, height, look, mode) {
  const f = (x) => x.toFixed(6);
  const grain = {
    static: `  // the static dither, in display space (gamma 2); nothing below 2 code values, so black stays black
  vec3 d = sqrt( max( color * vig, 0.0 ) );
  float amp = ${f(look.dither / 255)} * smoothstep( 0.0, 0.025, max( d.r, max( d.g, d.b ) ) );
  d = max( d + qhDither( 0u ) * amp, 0.0 );
  return d * d;`,
    film: `  uint s = uint( ( toneMappingExposure - 1.0 ) * 16777216.0 );
  // two staggered lattices of 2 px cells, averaged: soft grain for two hashes a pixel, new every frame
  vec2 q = gl_FragCoord.xy * ${f(1 / (look.grainCell * Math.max(0.5, height / 1080)))};
  float a = float( qhHash( ivec2( floor( q ) ), s ) & 0xffffu );
  float b = float( qhHash( ivec2( floor( q + 0.5 ) ) + ivec2( 4096, 0 ), s ) & 0xffffu );
  float n = ( a + b ) / 131070.0;
  n = clamp( ( n - 0.5 ) * 1.6 + 0.5, 0.0, 1.0 );
  return color * vig * ( 1.0 - ${f(look.grain)} * ( 1.0 - n ) );`,
    off: '  return color * vig;',
  }[mode];
  return /* glsl */`${ditherChunk(mode)}
vec3 qhFilm( vec3 color ) {
  vec2 res = vec2( ${f(width)}, ${f(height)} );
  vec2 c = ( gl_FragCoord.xy / res - 0.5 ) * vec2( res.x / res.y, 1.0 );
  float r = length( c ) * ${f(1 / Math.hypot(0.5 * width / height, 0.5))};
  float vig = 1.0 - ${f(look.vignette)} * smoothstep( 0.38, 1.05, r );
${grain}
}
vec3 CustomToneMapping( vec3 color ) {
  vec3 d = sqrt( max( color, 0.0 ) );                                       // display terms (gamma 2: cheap)
  vec3 over = max( d - 0.8, 0.0 );
  d = min( d, 0.8 ) + 0.2 * ( 1.0 - exp( -over / 0.2 ) );                  // shoulder
  d -= 0.10 * d * ( 1.0 - d ) * ( 1.0 - smoothstep( 0.0, 0.35, d ) );       // toe
  float l = dot( d, vec3( 0.2126, 0.7152, 0.0722 ) );
  d += vec3( -0.003, 0.0, 0.005 ) * ( 1.0 - smoothstep( 0.02, 0.16, l ) );  // night in the deep shadow
  d = max( d, 0.0 );
  return qhFilm( d * d );
}`;
}
const STUB = 'vec3 CustomToneMapping( vec3 color ) { return color; }';
let pristine = null;
function installGrade(width, height, mode) {
  pristine ??= THREE.ShaderChunk.tonemapping_pars_fragment;
  if (!pristine.includes(STUB)) throw new Error('post.js: this three.js has no CustomToneMapping hook');
  THREE.ShaderChunk.tonemapping_pars_fragment = pristine.replace(STUB, gradeChunk(width, height, LOOK, mode));
  THREE.ShaderChunk.qh_dither = ditherChunk(mode);
}
// a default, so a glow that includes the chunk compiles even before createPost has run
THREE.ShaderChunk.qh_dither ??= ditherChunk('static');

export function createPost({ renderer, width, height, grain } = {}) {
  const mode = grainMode(grain);
  installGrade(width, height, mode);
  renderer.toneMapping = THREE.CustomToneMapping;

  // the subtitles: straight alpha over the graded frame
  const cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const ovMat = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const ovScene = new THREE.Scene();
  const ovQuad = new THREE.Mesh(quadGeo, ovMat); ovQuad.frustumCulled = false; ovScene.add(ovQuad);
  let ovTex = null, lastKey = null;

  const frameOf = (scene, frame) => {
    if (Number.isFinite(frame)) return frame;
    if (frame && Number.isFinite(frame.frame)) return frame.frame;  // S passed instead of the frame
    const tv = scene.getObjectByName('qh-tv');
    return tv && Number.isFinite(tv.userData.frame) ? tv.userData.frame : 0;
  };

  return {
    render(scene, camera, overlayCanvas, overlayKey, frame) {
      renderer.toneMapping = THREE.CustomToneMapping;
      // 'film' only: the grain's seed for this frame. 'static' and 'off' never read the frame
      renderer.toneMappingExposure = mode === 'film' ? 1 + hash01(GRAIN_SEED, frameOf(scene, frame), 0, 0) : 1;
      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.render(scene, camera);
      if (overlayCanvas && overlayKey != null) {
        if (!ovTex || ovTex.image !== overlayCanvas) {
          ovTex?.dispose();
          ovTex = new THREE.CanvasTexture(overlayCanvas);
          ovTex.colorSpace = THREE.SRGBColorSpace; ovTex.minFilter = THREE.LinearFilter; ovTex.generateMipmaps = false;
          ovMat.map = ovTex; ovMat.needsUpdate = true; lastKey = null;
        }
        if (overlayKey !== lastKey) { ovTex.needsUpdate = true; lastKey = overlayKey; }
        renderer.autoClear = false;
        renderer.render(ovScene, cam2);
        renderer.autoClear = true;
      }
    },
    grain: mode,
    dispose() { ovTex?.dispose(); ovMat.dispose(); quadGeo.dispose(); },
  };
}
