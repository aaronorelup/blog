// The final pass (bible 4 and 11): one full-frame pass over the finished room, then the burned-in subtitles.
//
//   const post = createPost({ renderer, width, height, quality });
//   post.render(scene, camera, overlayCanvas, overlayKey, frame)
//
// The room is drawn into one 8-bit sRGB render target (MSAA 4, never half-float: bible 11), whose mip chain is the
// only blur there is. One shader then does, in display space:
//   - halation: a trace of warm glow round the brightest thing, from two levels of the target's own mip chain
//     (no bloom chain, no extra pass);
//   - a gentle filmic curve: a soft shoulder and a small toe that keeps the blacks rich but leaves the room's
//     5..10% walls readable, with the faintest cool cast in the deepest shadows (night);
//   - a soft vignette;
//   - grain: monochrome, spatially soft (value noise on a 1.6 px lattice), at most about 1.2% of full scale,
//     strongest in the mid-tones. Its seed is hash01(GRAIN_SEED, frame): nothing else about it moves;
//   - the subtitle overlay (a film-size 2D canvas, straight alpha), composited last, ungraded and grain-free.
//
// `frame` is the programme frame. If the caller does not pass it, the pass reads it from the TV group
// (src/room/tv.js writes S.frame onto group.userData.frame in its update, which runs before this in the same
// renderFrame). Either way it is a pure function of this frame's inputs: no feedback buffer, no previous frame.

import * as THREE from 'three';
import { hash01 } from './rng.js';

export const GRAIN_SEED = 9101;
export const LOOK = Object.freeze({
  grain: 0.012,        // peak grain amplitude, fraction of full scale (bible: under about 1.5%)
  grainCell: 1.6,      // output pixels per grain lattice cell at 1080 lines (scaled with the frame's height)
  vignette: 0.26,      // darkening in the far corners
  halation: 0.16,      // strength of the warm trace
  halThreshold: 0.42,  // linear luminance of the blurred image where halation starts
});

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D tScene;
  uniform sampler2D tOverlay;
  uniform float uOverlayOn;
  uniform vec2 uRes;
  uniform float uSeed;
  uniform float uGrain, uGrainCell, uVignette, uHalation, uHalThreshold;
  uniform float uLodA, uLodB;
  varying vec2 vUv;

  vec3 toSRGB(vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }
  float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

  // exact integer hash (same bits on every GPU): lattice point + frame seed -> [-1, 1]
  float h2(ivec2 p, uint s) {
    uvec3 v = uvec3(uint(p.x + 4096), uint(p.y + 4096), s);
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return float(v.x & 0xffffu) / 32767.5 - 1.0;
  }
  float softNoise(vec2 px, uint s) {
    vec2 q = px / uGrainCell;
    ivec2 i = ivec2(floor(q)); vec2 f = fract(q);
    f = f * f * (3.0 - 2.0 * f);
    float a = h2(i, s), b = h2(i + ivec2(1, 0), s), c = h2(i + ivec2(0, 1), s), d = h2(i + ivec2(1, 1), s);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 lin = textureLod(tScene, vUv, 0.0).rgb;

    // halation: a wide soft copy from the mip chain, only what is brighter than the threshold, warm
    vec2 o = 1.5 / uRes * exp2(uLodA);
    vec3 blur = textureLod(tScene, vUv, uLodA).rgb * 0.36
      + (textureLod(tScene, vUv + vec2(o.x, 0.0), uLodA).rgb + textureLod(tScene, vUv - vec2(o.x, 0.0), uLodA).rgb
       + textureLod(tScene, vUv + vec2(0.0, o.y), uLodA).rgb + textureLod(tScene, vUv - vec2(0.0, o.y), uLodA).rgb) * 0.09
      + textureLod(tScene, vUv, uLodB).rgb * 0.28;
    float bl = luma(blur);
    float k = smoothstep(uHalThreshold, uHalThreshold + 0.45, bl);
    lin += blur * k * uHalation * vec3(1.0, 0.62, 0.42);

    vec3 d = toSRGB(lin);

    // filmic curve in display space: a soft shoulder, a small toe; mid grey stays put
    vec3 sh = 1.0 - (1.0 - d) * (1.0 - d) * 0.5;                    // shoulder shape
    d = mix(d, sh, smoothstep(0.62, 1.0, d) * 0.35);
    d = d - 0.045 * d * (1.0 - d) * (1.0 - smoothstep(0.0, 0.35, d)) * 2.2;  // toe: deepens the blacks a touch
    d += vec3(-0.004, 0.0, 0.006) * (1.0 - smoothstep(0.02, 0.18, luma(d)));   // night: a breath of blue in the deep shadow
    d = max(d, 0.0);

    // vignette: round, soft, never in the centre third
    vec2 c = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(c) / length(vec2(0.5 * uRes.x / uRes.y, 0.5));
    d *= 1.0 - uVignette * smoothstep(0.38, 1.05, r);

    // grain: soft, monochrome, strongest in the mid-tones
    uint s = uint(uSeed * 16777216.0);
    float n = softNoise(gl_FragCoord.xy, s) * 0.72 + softNoise(gl_FragCoord.xy * 0.62 + 37.0, s ^ 0x5bd1e995u) * 0.28;
    float L = luma(d);
    float amt = uGrain * (0.45 + 0.55 * 4.0 * L * (1.0 - L));
    d += n * amt;

    // the subtitles: straight alpha over the graded frame
    if (uOverlayOn > 0.5) {
      vec4 ov = textureLod(tOverlay, vUv, 0.0);
      d = mix(d, ov.rgb, ov.a);
    }
    gl_FragColor = vec4(clamp(d, 0.0, 1.0), 1.0);
  }`;

export function createPost({ renderer, width, height, quality = 'final' }) {
  const rt = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.UnsignedByteType, format: THREE.RGBAFormat, colorSpace: THREE.SRGBColorSpace,
    samples: quality === 'draft' ? 0 : 4, depthBuffer: true, stencilBuffer: false,
    generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter,
  });
  rt.texture.colorSpace = THREE.SRGBColorSpace;                     // stored as SRGB8_ALPHA8: no banding in the dark room

  const emptyTex = new THREE.DataTexture(new Uint8Array(4), 1, 1); emptyTex.needsUpdate = true;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: rt.texture }, tOverlay: { value: emptyTex }, uOverlayOn: { value: 0 },
      uRes: { value: new THREE.Vector2(width, height) }, uSeed: { value: 0 },
      uGrain: { value: LOOK.grain }, uGrainCell: { value: LOOK.grainCell * Math.max(0.5, height / 1080) },
      uVignette: { value: LOOK.vignette }, uHalation: { value: LOOK.halation }, uHalThreshold: { value: LOOK.halThreshold },
      // mip levels that give the same blur in output pixels at any frame size (~24 px and ~90 px at 1080 lines)
      uLodA: { value: Math.log2(24 * height / 1080 / 1.5) }, uLodB: { value: Math.log2(90 * height / 1080 / 1.5) },
    },
    vertexShader: VERT, fragmentShader: FRAG,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  const scene2 = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; scene2.add(quad);
  const cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let ovTex = null, lastKey = null;
  const frameOf = (scene, frame) => {
    if (Number.isFinite(frame)) return frame;
    if (frame && Number.isFinite(frame.frame)) return frame.frame;  // S passed instead of the frame
    const tv = scene.getObjectByName('qh-tv');
    return tv && Number.isFinite(tv.userData.frame) ? tv.userData.frame : 0;
  };

  return {
    target: rt, uniforms: mat.uniforms,
    render(scene, camera, overlayCanvas, overlayKey, frame) {
      const f = frameOf(scene, frame);
      mat.uniforms.uSeed.value = hash01(GRAIN_SEED, f, 0, 0);

      renderer.setRenderTarget(rt);
      renderer.autoClear = true;
      renderer.render(scene, camera);                              // resolve + mipmaps happen on unbind

      if (overlayCanvas && overlayKey != null) {
        if (!ovTex || ovTex.image !== overlayCanvas) {
          ovTex?.dispose();
          ovTex = new THREE.CanvasTexture(overlayCanvas);
          ovTex.colorSpace = THREE.NoColorSpace;                     // composited in display space, as drawn
          ovTex.minFilter = THREE.LinearFilter; ovTex.magFilter = THREE.LinearFilter; ovTex.generateMipmaps = false;
          ovTex.flipY = true;
          lastKey = null;
        }
        if (overlayKey !== lastKey) { ovTex.needsUpdate = true; lastKey = overlayKey; }
        mat.uniforms.tOverlay.value = ovTex; mat.uniforms.uOverlayOn.value = 1;
      } else {
        mat.uniforms.tOverlay.value = emptyTex; mat.uniforms.uOverlayOn.value = 0;
      }

      renderer.setRenderTarget(null);
      renderer.render(scene2, cam2);
    },
    dispose() { rt.dispose(); ovTex?.dispose(); emptyTex.dispose(); mat.dispose(); quad.geometry.dispose(); },
  };
}
