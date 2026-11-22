// The screen light's shadow (room-set): one variance shadow map whose blur is set, frame by frame, from
// S.shadowRadius. Soft while the box is unsure, a razor when it is certain (bible 4, v1.2).
//
// Why a variance map: the depth map is blurred in the light's own space (two box passes of three.js's VSM, 8-bit
// packed targets, never half-float), so a penumbra half a metre wide costs the same as a hard edge and is a smooth
// ramp with no bands and no noise. A PCF kernel that wide needs hundreds of taps per screen pixel.
//
// Two things here are the room's own:
//   1. softness(S): where S.shadowRadius sits between its floor and its ceiling. The two ends are read from the
//      engine's rule itself (its value when the box is certain and when it knows nothing), so the softest shadow is
//      always the softest the room draws, whatever range the rule has. The room never applies the rule to a frame.
//   2. the lookup (patched into three's shader chunk once, at load): three.js's Chebyshev test, but with the ramp
//      tightened round its middle when the blur is small. A one-texel blur then draws an edge a few millimetres
//      wide on the far wall, on the true outline, instead of a soft texel-wide step.

import * as THREE from 'three';
import * as RULES from '../rules.js';

export const SHADOW = Object.freeze({
  map: 768,            // texels across the light's view
  fov: 80,             // degrees of the beam the map covers: one texel is about 1.1 cm on the wall behind the chair
  blurMin: 1.0,        // texels: the razor (the blur that only takes the stair-steps off the map's edge)
  blurMax: 0.049,      // of the map's width: the softest edge, a ramp about 60 cm wide on that wall
  taps: 21,            // samples per blur pass (fixed: it is compiled into the blur)
  sharpBelow: [1.5, 6.0],   // texels of blur between which the lookup's ramp goes from razor to three's own
});

// S.shadowRadius's floor and ceiling (bible v1.2: 1 and 15)
const SIGNAL = (() => {
  const f = RULES.shadowRadius;
  const lo = typeof f === 'function' ? f(0) : NaN, hi = typeof f === 'function' ? f(1) : NaN;
  return Number.isFinite(lo) && Number.isFinite(hi) && hi > lo ? [lo, hi] : [1, 15];
})();

/** 0 (a razor) .. 1 (the softest): where this frame's S.shadowRadius sits in its range. */
export function softness(S) {
  return Math.min(1, Math.max(0, (S.shadowRadius - SIGNAL[0]) / (SIGNAL[1] - SIGNAL[0])));
}
/** The blur radius, in texels of the shadow map, for this frame. */
export function blurTexels(S) {
  return SHADOW.blurMin + softness(S) * SHADOW.blurMax * SHADOW.map;
}

const LOOKUP = /* glsl */`
  float qhVSMShadow( sampler2D shadow, vec2 uv, float compare, float radius ) {
    vec2 dist = texture2DDistribution( shadow, uv );
    float d = compare - dist.x;
    if ( d <= 0.0 ) return 1.0;                                   // no further than the mean depth: lit
    float variance = dist.y * dist.y;
    float p = variance / ( variance + d * d );                    // Chebyshev: the lit share of the blurred patch
    float sharp = 1.0 - smoothstep( ${SHADOW.sharpBelow[0].toFixed(2)}, ${SHADOW.sharpBelow[1].toFixed(2)}, radius );
    float lo = mix( 0.30, 0.42, sharp ), hi = mix( 0.95, 0.58, sharp );
    return clamp( ( p - lo ) / ( hi - lo ), 0.0, 1.0 );
  }`;

let patched = false;
/** Swap three's VSM lookup for the room's (once; a no-op if this three.js does not have the expected chunk). */
export function patchShadowLookup() {
  if (patched) return true;
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  const call = 'shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );', head = 'float getShadow(';
  if (typeof chunk !== 'string' || !chunk.includes(call) || !chunk.includes(head)) return false;
  THREE.ShaderChunk.shadowmap_pars_fragment = chunk
    .replace(head, `${LOOKUP}\n\t${head}`)
    .replace(call, 'shadow = qhVSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z, shadowRadius );');
  patched = true;
  return true;
}

/** Set a spot light up as the room's shadow caster. */
export function setupShadow(renderer, spot) {
  patchShadowLookup();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  spot.castShadow = true;
  spot.shadow.mapSize.set(SHADOW.map, SHADOW.map);
  spot.shadow.camera.near = 0.6; spot.shadow.camera.far = 7.5;    // nothing that casts a shadow is nearer than the table
  spot.shadow.bias = -0.0006; spot.shadow.normalBias = 0.01;
  spot.shadow.focus = (SHADOW.fov * Math.PI / 180) / (2 * spot.angle);   // three: shadow camera fov = 2 x angle x focus
  spot.shadow.blurSamples = SHADOW.taps;
}
