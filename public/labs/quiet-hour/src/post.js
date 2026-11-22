// The final pass (bible 4 and 11): the film's grade, then the burned-in subtitles.
//
//   const post = createPost({ renderer, width, height, quality, grain });
//   post.render(scene, camera, overlayCanvas, overlayKey, frame)
//   post.grain   // 'static' | 'film' | 'off': the mode in force
//
// GRAIN has three modes (createPost's `grain` option; when the caller passes none, the page's ?grain= query
// parameter; when there is none of those either, 'static'):
//   'static'  the film's and the lab page's default. One fixed fine pattern that never changes with the frame:
//             pixel (x, y) (y counted up from the bottom row) gets hash01(GRAIN_SEED, x, y, 0) of ./rng.js (ported bit
//             for bit; checked against rng.js on rendered frames), used as a dither of one code value either way
//             (triangular) just before the frame is cut to 8 bits, so the dark walls do not band. It is not a texture:
//             it is under the eye's threshold and has no shape (its block means and autocorrelation are white
//             noise's), and because it never moves a video encoder pays for it in its key frames, not in every frame.
//   'film'    grain that changes with every frame (seeded by hash01(GRAIN_SEED, frame)): monochrome, multiplicative,
//             two staggered lattices of 2 px cells, 2% of the value. For comparison only.
//   'off'     neither. The 8-bit frames band in the dark walls.
// Measured on this box (36 frames at 1080p, x264 slow, CRF 20, frames after the first): a locked WIDE A costs
// 0.42 Mbit/s with 'off', 0.45 with 'static' and 0.53 with 'film'; a SCREEN shot 2.68, 2.69 and 2.66 (there the
// scrolling picture is the cost). The key frame grows by about 60% (wide) and 20% (SCREEN) with 'static'.
// Whatever the mode, the grade is a pure function of (frame, pixel): no feedback, no previous frame.
//
// Built for software WebGL, where every full-frame pass, render target, resolve or mip chain costs real time at
// 1080p (measured on this box: an 8-bit MSAA target with mip-chain halation added ~0.9 s of CPU per 720p frame; a
// separate multiply-blended grade quad still ~150 ms of wall time at 1080p). So the grade has no pass of its own: it
// lives in three's tone-mapping hook, and every tone-mapped surface runs it as the last step of its own shader:
//   - the curve (CustomToneMapping): a soft shoulder that rolls highlights over 1 into the top of the range
//     (1.0 -> 0.93), a small toe that keeps the blacks rich but leaves the room's 5..10% walls readable, a breath of
//     blue in the deepest shadow (night). Mid grey stays put;
//   - then a soft round vignette, and the grain or dither of the mode.
// Shaders that must keep their colours exact (the picture tube, src/room/screen.js) call qhFilm alone, so the picture
// gets the vignette and the dither but not the curve. Overlays that blend their own light into the frame (the set's
// glow, src/room/tv.js) call qhRand, a per-pixel number in [0, 1) from the same source, to dither themselves.
// Shaders find out that this grade is installed from the QH_GRADE define.
// Halation is not a pass either: the tube's own bloom (src/room/screen.js) and the haze round the set
// (src/room/tv.js) are the trace of light round the brightest thing in the frame.
// The subtitle overlay (a film-size 2D canvas) is drawn last with ordinary alpha, ungraded and grain-free.
//
// The frame size and the mode are baked into the grade when createPost runs (one film per page at a time). In 'film'
// mode the grain's seed arrives in toneMappingExposure (1 + hash01(GRAIN_SEED, frame)), which three sets on every
// draw and which nothing else in the film reads; in the other modes it stays 1. `frame` is the programme frame: if
// the caller does not pass it, the pass reads it from the TV group (src/room/tv.js writes S.frame onto
// group.userData.frame in its update, which runs before this in the same renderFrame).

import * as THREE from 'three';
import { hash01 } from './rng.js';

export const GRAIN_MODES = Object.freeze(['static', 'film', 'off']);
export const GRAIN_SEED = 9101;
export const LOOK = Object.freeze({
  dither: 1.0,         // 'static': the dither's reach in 8-bit code values (triangular: +-1 at every level)
  grain: 0.02,         // 'film': multiplicative grain range, the value times 0.98..1.00
  grainCell: 2.0,      // 'film': output pixels per grain cell at 1080 lines (scaled with the frame's height)
  vignette: 0.24,      // darkening in the far corners
});

/** The grain mode in force: the option, else the page's ?grain=, else 'static'. Throws on an unknown name. */
export function grainMode(option) {
  let g = option;
  if ((g === undefined || g === null) && typeof location !== 'undefined' && location.search) {
    g = new URLSearchParams(location.search).get('grain');
  }
  if (g === undefined || g === null || g === '') return 'static';
  if (!GRAIN_MODES.includes(g)) throw new Error(`post.js: unknown grain mode "${g}" (use static, film or off)`);
  return g;
}

function gradeChunk(width, height, look, mode) {
  const f = (x) => x.toFixed(6);
  const u = (x) => `${x >>> 0}u`;
  const vig = /* glsl */`
#define QH_GRADE 1
float qhVig() {
  vec2 res = vec2( ${f(width)}, ${f(height)} );
  vec2 c = ( gl_FragCoord.xy / res - 0.5 ) * vec2( res.x / res.y, 1.0 );
  float r = length( c ) * ${f(1 / Math.hypot(0.5 * width / height, 0.5))};
  return 1.0 - ${f(look.vignette)} * smoothstep( 0.38, 1.05, r );
}`;
  // the curve, up to its display-terms value d (gamma 2: sqrt and a square are cheap in software GL)
  const curve = /* glsl */`
  vec3 d = sqrt( max( color, 0.0 ) );
  vec3 over = max( d - 0.8, 0.0 );
  d = min( d, 0.8 ) + 0.2 * ( 1.0 - exp( -over / 0.2 ) );                  // shoulder
  d -= 0.10 * d * ( 1.0 - d ) * ( 1.0 - smoothstep( 0.0, 0.35, d ) );       // toe
  float l = dot( d, vec3( 0.2126, 0.7152, 0.0722 ) );
  d += vec3( -0.003, 0.0, 0.005 ) * ( 1.0 - smoothstep( 0.02, 0.16, l ) );  // night in the deep shadow
  d = max( d, 0.0 );`;

  if (mode === 'static') {
    // src/rng.js hash01, ported bit for bit: the seed's part of the first mix is folded into a constant
    return /* glsl */`${vig}
uint qhMix( uint h, uint k ) {
  k *= 0xcc9e2d51u; k = ( k << 15u ) | ( k >> 17u ); k *= 0x1b873593u;
  h ^= k; h = ( h << 13u ) | ( h >> 19u );
  return h * 5u + 0xe6546b64u;
}
uint qhPixel( uint k0 ) {                                                  // hash01( seed, x, y, 0 ) * 2^32
  uint h = qhMix( qhMix( k0, uint( gl_FragCoord.x ) ), uint( gl_FragCoord.y ) );
  h = ( h << 13u ) | ( h >> 19u ); h = h * 5u + 0xe6546b64u;               // mix( h, 0 )
  h ^= 16u;
  h ^= h >> 16u; h *= 0x85ebca6bu; h ^= h >> 13u; h *= 0xc2b2ae35u; h ^= h >> 16u;
  return h;
}
float qhRand() { return float( qhPixel( ${u(0x9e3779b9 ^ (GRAIN_SEED + 1))} ) >> 8u ) * ( 1.0 / 16777216.0 ); }
vec3 qhDither( vec3 d ) {                                                  // d in display terms (gamma 2)
  uint h = qhPixel( ${u(0x9e3779b9 ^ GRAIN_SEED)} );
  float tri = ( float( h >> 16u ) + float( h & 0xffffu ) ) * ( 1.0 / 65535.0 ) - 1.0;
  // one 8-bit code value at this level, in display terms: the sRGB curve's slope, in its linear toe (where one
  // code is a large step: 1.518e-4 / d) and above it (a straight-line fit), and never more than d itself, so
  // black stays black and the mean is kept
  vec3 one = mix( min( d, 1.518e-4 / max( d, 1e-4 ) ), 0.00263 + 0.00183 * d, step( 0.056, d ) );
  return d + tri * one * ${f(look.dither)};
}
vec3 qhFilm( vec3 color ) {
  vec3 d = qhDither( sqrt( max( color * qhVig(), 0.0 ) ) );
  return d * d;
}
vec3 CustomToneMapping( vec3 color ) {${curve}
  d = qhDither( d * sqrt( qhVig() ) );
  return d * d;
}`;
  }
  if (mode === 'film') {
    return /* glsl */`${vig}
uint qhHash( ivec2 p, uint s ) {
  uint h = ( uint( p.x + 8192 ) * 73856093u ) ^ ( uint( p.y + 8192 ) * 19349663u ) ^ ( s * 83492791u );
  h = ( h ^ ( h >> 16u ) ) * 0x45d9f3bu; h = ( h ^ ( h >> 16u ) ) * 0x45d9f3bu; h ^= h >> 16u;
  return h;
}
float qhRand() {
  uint s = uint( ( toneMappingExposure - 1.0 ) * 16777216.0 );
  return float( qhHash( ivec2( gl_FragCoord.xy ) + ivec2( 911, 577 ), s ) >> 8u ) * ( 1.0 / 16777216.0 );
}
vec3 qhFilm( vec3 color ) {
  float vig = qhVig();
  uint s = uint( ( toneMappingExposure - 1.0 ) * 16777216.0 );
  // two staggered lattices of 2 px cells, averaged: soft grain for two hashes a pixel
  vec2 q = gl_FragCoord.xy * ${f(1 / (look.grainCell * Math.max(0.5, height / 1080)))};
  float a = float( qhHash( ivec2( floor( q ) ), s ) & 0xffffu );
  float b = float( qhHash( ivec2( floor( q + 0.5 ) ) + ivec2( 4096, 0 ), s ) & 0xffffu );
  float n = ( a + b ) / 131070.0;
  n = clamp( ( n - 0.5 ) * 1.6 + 0.5, 0.0, 1.0 );
  return color * vig * ( 1.0 - ${f(look.grain)} * ( 1.0 - n ) );
}
vec3 CustomToneMapping( vec3 color ) {${curve}
  return qhFilm( d * d );
}`;
  }
  return /* glsl */`${vig}
float qhRand() { return 0.5; }
vec3 qhFilm( vec3 color ) { return color * qhVig(); }
vec3 CustomToneMapping( vec3 color ) {${curve}
  return qhFilm( d * d );
}`;
}
const STUB = 'vec3 CustomToneMapping( vec3 color ) { return color; }';
let pristine = null;
function installGrade(width, height, mode) {
  pristine ??= THREE.ShaderChunk.tonemapping_pars_fragment;
  if (!pristine.includes(STUB)) throw new Error('post.js: this three.js has no CustomToneMapping hook');
  THREE.ShaderChunk.tonemapping_pars_fragment = pristine.replace(STUB, gradeChunk(width, height, LOOK, mode));
}

export function createPost({ renderer, width, height, grain }) {
  const mode = grainMode(grain);
  installGrade(width, height, mode);
  renderer.toneMapping = THREE.CustomToneMapping;
  renderer.toneMappingExposure = 1;

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
    grain: mode,
    render(scene, camera, overlayCanvas, overlayKey, frame) {
      renderer.toneMapping = THREE.CustomToneMapping;
      // only 'film' grain reads the frame: its seed. In the other modes nothing in the grade changes with time
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
    dispose() { ovTex?.dispose(); ovMat.dispose(); quadGeo.dispose(); },
  };
}
