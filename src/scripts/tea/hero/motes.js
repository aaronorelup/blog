// Drifting motes: fireflies and stray petals as one Points cloud, every movement in the vertex shader (one draw,
// no per-frame CPU work). They fall slowly, sway, and wrap inside the manifest's box; colour and glow follow the mode.
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial, Vector3 } from './three.js';

const VERT = `
uniform float uTime; uniform float uSize; uniform float uScale; uniform vec3 uMin; uniform vec3 uMax;
attribute float aSeed;
varying float vSeed; varying float vTw;
void main() {
  vec3 span = uMax - uMin;
  vec3 p = position;
  p.y = uMin.y + mod(p.y - uMin.y - uTime * (0.05 + aSeed * 0.08), span.y);
  p.x += sin(uTime * (0.3 + aSeed * 0.4) + aSeed * 40.0) * 0.35;
  p.z += cos(uTime * (0.2 + aSeed * 0.3) + aSeed * 17.0) * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uScale * (0.6 + aSeed) / -mv.z;
  vSeed = aSeed;
  vTw = 0.55 + 0.45 * sin(uTime * (1.5 + aSeed * 2.5) + aSeed * 90.0);
}
`;
const FRAG = `
uniform vec3 uFly; uniform vec3 uPetal; uniform float uMix;
varying float vSeed; varying float vTw;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float petal = step(0.5, fract(vSeed * 7.0));
  float glow = exp(-d * d * 28.0);
  vec3 col = mix(uPetal * 0.8, uFly * (0.6 + vTw), (1.0 - petal) * uMix);
  float a = mix(smoothstep(0.5, 0.3, d) * 0.55, glow * vTw, (1.0 - petal) * uMix);
  if (a < 0.01) discard;
  gl_FragColor = vec4(col * a, a);
  #include <colorspace_fragment>
}
`;

// a seeded generator, so two loads (and two screenshots) scatter the motes alike
function rand(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMotes(spec, count, pixelRatio) {
  const [min, max] = spec.box;
  const random = rand(7);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < 3; j++) pos[i * 3 + j] = min[j] + random() * (max[j] - min[j]);
    seed[i] = random();
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new Float32BufferAttribute(seed, 1));
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uSize: { value: spec.size * 1000 }, uScale: { value: pixelRatio },
      uMin: { value: new Vector3(...min) }, uMax: { value: new Vector3(...max) }, uMix: { value: 1 },
      uFly: { value: new Color(spec.fly || '#FFD892') }, uPetal: { value: new Color(spec.petal || '#F7B7C8') },
    },
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
    blending: AdditiveBlending, toneMapped: false,
  });
  const pts = new Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 4;
  return pts;
}

export function tickMotes(pts, time, mix) {
  pts.material.uniforms.uTime.value = time;
  pts.material.uniforms.uMix.value = mix;
}
