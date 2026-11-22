// The final pass (bible 4 and 11): the film's grade, then the burned-in subtitles.
//
//   const post = createPost({ renderer, width, height, quality });
//   post.render(scene, camera, overlayCanvas, overlayKey, frame)
//
// Built for software WebGL, where every full-frame render target, mip chain or resolve costs hundreds of ms at
// 1080p (measured: an 8-bit MSAA target + mip-chain halation added ~0.9 s of CPU per 720p frame). So there is no
// render target at all. The room is drawn straight into the canvas (its own MSAA), and the grade rides along:
//   - the filmic curve is the renderer's tone mapping (CustomToneMapping, set here), so every lit surface gets it
//     inside its own shader: a soft shoulder that rolls highlights over 1 into the top of the range, a small toe
//     that keeps the blacks rich but leaves the room's 5..10% walls readable, a breath of blue in the deepest
//     shadow (night). Mid grey stays put. Materials that must stay exact opt out with toneMapped: false;
//   - one full-frame quad, multiplied over the frame (blend DST_COLOR x src): a soft round vignette and grain.
//     The grain is monochrome, spatially soft (value noise on a ~1.6 px lattice at 1080 lines), about +-1% of the
//     value at most, seeded by hash01(GRAIN_SEED, frame) and nothing else;
//   - the subtitle overlay (a film-size 2D canvas), drawn last with ordinary alpha, ungraded and grain-free.
// Halation is not a separate pass either: the tube's own bloom (src/room/screen.js) and the haze round the tube
// (src/room/tv.js) are the trace of light round the brightest thing in the frame.
//
// `frame` is the programme frame. If the caller does not pass it, the pass reads it from the TV group
// (src/room/tv.js writes S.frame onto group.userData.frame in its update, which runs before this in the same
// renderFrame). Either way it is a pure function of this frame's inputs: no feedback buffer, no previous frame.

import * as THREE from 'three';
import { hash01 } from './rng.js';

export const GRAIN_SEED = 9101;
export const LOOK = Object.freeze({
  grain: 0.02,         // multiplicative grain range: the value times 0.98..1.00 (about +-1% round its mean)
  grainCell: 1.6,      // output pixels per grain lattice cell at 1080 lines (scaled with the frame's height)
  vignette: 0.24,      // darkening in the far corners
});

// The curve, in linear light in and out (three's tone-mapping hook); shaped in display terms (gamma 2.2).
const CURVE = /* glsl */`vec3 CustomToneMapping( vec3 color ) {
  vec3 d = pow( max( color, 0.0 ), vec3( 1.0 / 2.2 ) );
  vec3 over = max( d - 0.8, 0.0 );
  d = min( d, 0.8 ) + 0.2 * ( 1.0 - exp( -over / 0.2 ) );                           // shoulder: 1.0 -> 0.93, 1.3 -> 0.98
  d -= 0.10 * d * ( 1.0 - d ) * ( 1.0 - smoothstep( 0.0, 0.35, d ) );                 // toe: a touch deeper blacks
  float l = dot( d, vec3( 0.2126, 0.7152, 0.0722 ) );
  d += vec3( -0.003, 0.0, 0.005 ) * ( 1.0 - smoothstep( 0.02, 0.16, l ) );           // night in the deep shadow
  return pow( max( d, 0.0 ), vec3( 2.2 ) );
}`;
let curveInstalled = false;
function installCurve() {
  if (curveInstalled) return;
  const chunk = THREE.ShaderChunk.tonemapping_pars_fragment;
  const stub = 'vec3 CustomToneMapping( vec3 color ) { return color; }';
  if (!chunk.includes(stub)) throw new Error('post.js: this three.js has no CustomToneMapping hook');
  THREE.ShaderChunk.tonemapping_pars_fragment = chunk.replace(stub, CURVE);
  curveInstalled = true;
}

const VERT = /* glsl */`void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const GRADE_FRAG = /* glsl */`
  precision highp float;
  uniform vec2 uRes;
  uniform float uSeed, uGrain, uGrainCell, uVignette;

  // exact integer hash (same bits on every GPU): lattice point + frame seed -> [0, 1]
  float h2(ivec2 p, uint s) {
    uvec3 v = uvec3(uint(p.x + 4096), uint(p.y + 4096), s);
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return float(v.x & 0xffffu) / 65535.0;
  }
  float softNoise(vec2 px, uint s) {
    vec2 q = px / uGrainCell;
    ivec2 i = ivec2(floor(q)); vec2 f = fract(q);
    f = f * f * (3.0 - 2.0 * f);
    float a = h2(i, s), b = h2(i + ivec2(1, 0), s), c = h2(i + ivec2(0, 1), s), d = h2(i + ivec2(1, 1), s);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 c = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(c) / length(vec2(0.5 * uRes.x / uRes.y, 0.5));
    float vig = 1.0 - uVignette * smoothstep(0.38, 1.05, r);
    // value noise is narrow round 0.5: stretch it so the range is used, then clamp
    float n = clamp((softNoise(gl_FragCoord.xy, uint(uSeed * 16777216.0)) - 0.5) * 2.2 + 0.5, 0.0, 1.0);
    float m = vig * (1.0 - uGrain * (1.0 - n));
    gl_FragColor = vec4(m, m, m, 1.0);
  }`;

export function createPost({ renderer, width, height }) {
  installCurve();
  renderer.toneMapping = THREE.CustomToneMapping;
  renderer.toneMappingExposure = 1;

  const cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);

  // the grade quad: multiplied over the frame
  const gradeMat = new THREE.ShaderMaterial({
    uniforms: {
      uRes: { value: new THREE.Vector2(width, height) }, uSeed: { value: 0 },
      uGrain: { value: LOOK.grain }, uGrainCell: { value: LOOK.grainCell * Math.max(0.5, height / 1080) },
      uVignette: { value: LOOK.vignette },
    },
    vertexShader: VERT, fragmentShader: GRADE_FRAG,
    transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const gradeScene = new THREE.Scene();
  const gradeQuad = new THREE.Mesh(quadGeo, gradeMat); gradeQuad.frustumCulled = false; gradeScene.add(gradeQuad);

  // the subtitles: straight alpha over the graded frame
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
    uniforms: gradeMat.uniforms,
    render(scene, camera, overlayCanvas, overlayKey, frame) {
      gradeMat.uniforms.uSeed.value = hash01(GRAIN_SEED, frameOf(scene, frame), 0, 0);
      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.render(gradeScene, cam2);
      if (overlayCanvas && overlayKey != null) {
        if (!ovTex || ovTex.image !== overlayCanvas) {
          ovTex?.dispose();
          ovTex = new THREE.CanvasTexture(overlayCanvas);
          ovTex.colorSpace = THREE.SRGBColorSpace; ovTex.minFilter = THREE.LinearFilter; ovTex.generateMipmaps = false;
          ovMat.map = ovTex; ovMat.needsUpdate = true; lastKey = null;
        }
        if (overlayKey !== lastKey) { ovTex.needsUpdate = true; lastKey = overlayKey; }
        renderer.render(ovScene, cam2);
      }
      renderer.autoClear = true;
    },
    dispose() { ovTex?.dispose(); ovMat.dispose(); gradeMat.dispose(); quadGeo.dispose(); },
  };
}
