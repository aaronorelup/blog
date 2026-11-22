// Dust in the screen's beam (room-set). About 1,500 motes; each one's place is a closed form of S.dustDrift
// (the running sum of H / ln 32, in seconds): base + velocity x drift, plus a slow sway that is also a function of
// drift, wrapped inside the beam's box. So they slow as the box gets surer and hang still when it is certain.
// Each mote is lit by the beam it floats in: the spot's cone and distance, a forward-scattering phase (bright
// when you look toward the screen), its own size and reflectance. Opacity from S.dustOpacity. Motes fade near
// the box's faces so the wrap never pops.

import * as THREE from 'three';
import { hash01 } from '../rng.js';

export function createDust({ quality, height }) {
  const MOTES = quality === 'draft' ? 600 : 1500;
  const BOXMIN = [-1.0, 0.3, -2.3], BOXSIZE = [1.85, 1.3, 2.0];     // between the screen and the chair
  const base = new Float32Array(MOTES * 3), vel = new Float32Array(MOTES * 3), aux = new Float32Array(MOTES * 4);
  for (let i = 0; i < MOTES; i++) {
    for (let k = 0; k < 3; k++) {
      base[i * 3 + k] = BOXMIN[k] + hash01(7001, i, k, 0) * BOXSIZE[k];
      vel[i * 3 + k] = (hash01(7002, i, k, 0) * 2 - 1) * (k === 1 ? 0.013 : 0.024) + (k === 1 ? 0.003 : 0);  // m per second of drift; a faint updraught
    }
    const big = hash01(7003, i, 0, 0);
    aux[i * 4] = 0.55 + 1.3 * big * big * big;                // size factor (a few big flecks, mostly fine)
    const rr = hash01(7003, i, 1, 0); aux[i * 4 + 1] = 0.06 + 0.94 * rr * rr * rr;   // reflectance: most a faint haze, a few glints
    aux[i * 4 + 2] = hash01(7003, i, 2, 0) * 6.2832;          // sway phase
    aux[i * 4 + 3] = 0.25 + 0.5 * hash01(7003, i, 3, 0);      // sway rate (per second of drift)
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('vel', new THREE.BufferAttribute(vel, 3));
  geo.setAttribute('aux', new THREE.BufferAttribute(aux, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uDrift: { value: 0 }, uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(1, 1, 1) }, uGain: { value: 1 },
      uMin: { value: new THREE.Vector3(...BOXMIN) }, uSize: { value: new THREE.Vector3(...BOXSIZE) },
      uScale: { value: height / 1080 }, uSpot: { value: new THREE.Vector3() }, uSpotDir: { value: new THREE.Vector3(0, 0, 1) },
      uCone: { value: new THREE.Vector2(Math.cos(0.62), Math.cos(0.22)) },
    },
    vertexShader: `
      attribute vec3 vel; attribute vec4 aux;
      uniform float uDrift, uScale, uGain; uniform vec3 uMin, uSize, uSpot, uSpotDir, uColor; uniform vec2 uCone;
      varying vec3 vCol; varying float vSoft;
      void main(){
        float sway = aux.z + aux.w * uDrift;
        vec3 off = vel * uDrift + vec3(sin(sway), 0.6 * sin(sway * 0.7 + 1.3), cos(sway * 0.83)) * 0.035;
        vec3 q = mod(position - uMin + off, uSize);                // closed form: no stepping
        vec3 p = uMin + q;
        vec3 e = min(q, uSize - q);                                // fade near the box's faces
        float edge = smoothstep(0.0, 0.32, min(min(e.x, e.y), e.z));
        vec3 L = p - uSpot; float dist = length(L); L /= dist;
        float cone = smoothstep(uCone.x, uCone.y, dot(L, uSpotDir));
        float fall = 1.0 / (0.35 + dist * dist);
        vec3 V = normalize(cameraPosition - p);
        float g = dot(L, V);
        float phase = 0.5 + 2.6 * pow(max(g, 0.0), 6.0) + 1.4 * pow(max(-g, 0.0), 3.0);   // forward scatter, and a back-scatter glint
        vec4 mv = viewMatrix * vec4(p, 1.0);
        float z = -mv.z;
        float px = aux.x * 1.8 * uScale * (1.0 + 0.7 / max(z, 0.15));  // near motes a little bigger and softer
        gl_PointSize = clamp(px, 1.2, 9.0);
        vSoft = clamp(px / 6.0, 0.0, 1.0);
        float area = aux.x * aux.x / max(1.0, px * px / (4.8 * uScale * uScale));   // energy spread over a bigger disc
        vCol = uColor * uGain * cone * fall * phase * aux.y * edge * area * smoothstep(0.15, 0.45, z);
        vCol = vCol / (1.0 + max(max(vCol.r, vCol.g), vCol.b) * 0.8);       // glints roll off, never clip to white
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity; varying vec3 vCol; varying float vSoft;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = mix(exp(-r * r * 4.0), smoothstep(1.0, 0.55, r) * 0.6, vSoft);
        gl_FragColor = vec4(vCol * a * uOpacity, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false;
  function update(S, spot, lightColor, gain) {
    mat.uniforms.uDrift.value = S.dustDrift;
    mat.uniforms.uOpacity.value = S.dustOpacity;
    mat.uniforms.uColor.value.copy(lightColor);
    mat.uniforms.uGain.value = gain;
    mat.uniforms.uSpot.value.copy(spot.position);
    mat.uniforms.uSpotDir.value.copy(spot.target.position).sub(spot.position).normalize();
  }
  return { points, update };
}
