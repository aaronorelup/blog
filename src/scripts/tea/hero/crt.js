// The television's screen: an emissive shader standing in for a broadcast (an evening sky with a moon, scanlines,
// a rolling bar, grain, the tube's vignette) and flicker(t), the same brightness curve the TV's light and glow
// follow. A manifest's `materials: { "<node>": { "shader": "crt" } }` puts it on that node's meshes.
import { Color, ShaderMaterial } from 'three';

export const flicker = (t) =>
  0.9 + 0.06 * Math.sin(t * 13.1) * Math.sin(t * 2.7) + 0.04 * Math.sin(t * 57.3 + Math.sin(t * 3.3) * 4);

const VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const FRAG = `
uniform float uTime; uniform float uMix; uniform float uGain; uniform vec3 uTop; uniform vec3 uLow; uniform vec3 uMoon;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  // barrel: the picture bulges with the glass
  uv = 0.5 + c * (1.0 + 0.18 * dot(c, c));
  vec3 col = mix(uLow, uTop, smoothstep(0.0, 1.0, uv.y));
  // a moon and its halo, a line of hills
  float d = length((uv - vec2(0.66, 0.68)) * vec2(1.25, 1.0));
  col += uMoon * (smoothstep(0.13, 0.11, d) * 0.9 + 0.25 * exp(-d * 7.0));
  float hill = 0.28 + 0.05 * sin(uv.x * 9.0 + 1.3) + 0.03 * sin(uv.x * 23.0);
  col = mix(col * 0.25, col, smoothstep(hill - 0.01, hill + 0.01, uv.y));
  // scanlines, a slow rolling bar, grain
  col *= 0.82 + 0.18 * sin(uv.y * 340.0);
  col *= 1.0 + 0.25 * smoothstep(0.08, 0.0, abs(fract(uv.y * 0.6 - uTime * 0.11) - 0.5));
  col += (hash(uv * 400.0 + fract(uTime * 7.0)) - 0.5) * 0.09;
  // the tube's dark corners
  float v = smoothstep(0.75, 0.32, length(c * vec2(1.0, 1.15)));
  col *= v * uGain;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export function crtMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uMix: { value: 1 }, uGain: { value: 1.6 },
      uTop: { value: new Color('#3E6FB8') }, uLow: { value: new Color('#F2A27A') }, uMoon: { value: new Color('#FFF3C8') },
    },
    vertexShader: VERT, fragmentShader: FRAG, toneMapped: false,
  });
}

export function tickCrt(mat, time) {
  mat.uniforms.uTime.value = time;
  mat.uniforms.uGain.value = 1.55 * flicker(time);
}
