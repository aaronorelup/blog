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
  const BOXMIN = [-1.1, 0.3, -2.3], BOXSIZE = [2.0, 1.35, 2.3];     // between the screen and the chair
  const base = new Float32Array(MOTES * 3), vel = new Float32Array(MOTES * 3), aux = new Float32Array(MOTES * 4);
  for (let i = 0; i < MOTES; i++) {
    for (let k = 0; k < 3; k++) {
      base[i * 3 + k] = BOXMIN[k] + hash01(7001, i, k, 0) * BOXSIZE[k];
      vel[i * 3 + k] = (hash01(7002, i, k, 0) * 2 - 1) * (k === 1 ? 0.026 : 0.045) + (k === 1 ? 0.006 : 0);  // m per second of drift; a faint updraught
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
      uCone: { value: new THREE.Vector2(Math.cos(0.62), Math.cos(0.22)) }, uFocus: { value: 2 },
      uShadow: { value: null }, uShadowMatrix: { value: new THREE.Matrix4() }, uShadowOn: { value: 0 }, uShadowBias: { value: 0 },
    },
    vertexShader: `
      #include <packing>
      attribute vec3 vel; attribute vec4 aux;
      uniform sampler2D uShadow; uniform mat4 uShadowMatrix; uniform float uShadowOn, uShadowBias;
      // the screen light's own (variance) shadow map: a mote in the chair's shadow is not lit, so the shadow is a
      // volume in the dust too, as soft or as hard as the shadow on the wall
      float lit(vec3 p) {
        if (uShadowOn < 0.5) return 1.0;
        vec4 sc = uShadowMatrix * vec4(p, 1.0); sc.xyz /= sc.w; sc.z += uShadowBias;
        if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0) return 1.0;
        vec2 m = unpackRGBATo2Half(texture2D(uShadow, sc.xy));
        if (sc.z <= m.x) return 1.0;
        float v = m.y * m.y, d = sc.z - m.x;
        return clamp((v / (v + d * d) - 0.3) / 0.65, 0.0, 1.0);
      }
      uniform float uDrift, uScale, uGain, uFocus; uniform vec3 uMin, uSize, uSpot, uSpotDir, uColor; uniform vec2 uCone;
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
        // a gentle forward lobe (looking into the screen the motes would otherwise snow over the whole frame) and a
        // stronger back-scatter glint (looking along the beam from beside the set, the REVERSE)
        float phase = 0.3 + 0.45 * pow(max(g, 0.0), 4.0) + 2.2 * pow(max(-g, 0.0), 3.0);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        float z = -mv.z;
        // a lens focused at uFocus: motes there are fine points, nearer ones open into soft discs (circle of confusion);
        // a mote's light is spread over its disc, so a big disc is dimmer per pixel
        float core = (1.1 + 1.5 * aux.x) * uScale;
        float coc = 16.0 * uScale * abs(1.0 / max(z, 0.1) - 1.0 / uFocus);
        float px = max(core, coc);
        gl_PointSize = clamp(px, 1.5, 28.0 * uScale + 1.0);
        vSoft = smoothstep(core, core * 3.0, px);
        float area = (core * core) / max(core * core, px * px) * aux.x;
        vCol = uColor * uGain * cone * fall * phase * aux.y * edge * area * smoothstep(0.25, 0.6, z) * lit(p);
        vCol = vCol / (1.0 + max(max(vCol.r, vCol.g), vCol.b) * 0.8);       // glints roll off, never clip to white
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity; varying vec3 vCol; varying float vSoft;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = mix(exp(-r * r * 3.0), smoothstep(1.0, 0.7, r) * 0.8, vSoft);
        gl_FragColor = vec4(vCol * a * uOpacity, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false;
  function update(S, spot, lightColor, gain, focus) {
    mat.uniforms.uFocus.value = focus;
    // the map exists from the first render on (film.js renders a warm-up frame before frame 0); the matrix is the
    // light's own object, so it carries this frame's values when the dust is drawn, after the shadow pass
    const map = spot.shadow.map;
    mat.uniforms.uShadowOn.value = map ? 1 : 0;
    mat.uniforms.uShadow.value = map ? map.texture : null;
    mat.uniforms.uShadowMatrix.value = spot.shadow.matrix;
    mat.uniforms.uShadowBias.value = spot.shadow.bias;
    mat.uniforms.uDrift.value = S.dustDrift;
    mat.uniforms.uOpacity.value = S.dustOpacity;
    mat.uniforms.uColor.value.copy(lightColor);
    mat.uniforms.uGain.value = gain;
    mat.uniforms.uSpot.value.copy(spot.position);
    mat.uniforms.uSpotDir.value.copy(spot.target.position).sub(spot.position).normalize();
  }
  return { points, update };
}
