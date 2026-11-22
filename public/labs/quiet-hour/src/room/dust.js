// Dust in the screen's beam (room-set). About 1,500 motes; each one's place is a closed form of S.dustDrift
// (the running sum of H / ln 32, in seconds): base + velocity x drift, plus a slow sway that is also a function of
// drift, wrapped inside the beam's box. So they slow as the box gets surer and hang still when it is certain.
//
// Each mote is lit by the beam it floats in (the spot's own cone and distance falloff) and scatters that light
// forward and back along the beam more than sideways, so it shows both from behind the chair (WIDE A) and from beside
// the set (the REVERSE, the dust shot). Opacity from S.dustOpacity. What keeps it from being snow: nothing falls (each mote has its own slow heading), most motes are
// faint and only a few glint, and the lens does the rest: a mote near the camera is a wide, soft, dim disc (out
// of focus), a far one a fine point. Motes within arm's reach of the lens fade out, so the SCREEN shots stay clean.
// They also fade near the box's faces, so the wrap never pops.

import * as THREE from 'three';
import { hash01 } from '../rng.js';

export const DUST = Object.freeze({
  speed: 0.05,           // m per second of drift, the fastest mote (x and z; y is slower, with a faint updraught)
  sway: 0.035,           // m: the slow wander round the straight path
  size: [1.7, 7.0, 1.4], // px at 1080 lines: fine point + bokeh / distance^power (distance from the lens, m)
  near: [0.35, 0.85],    // m from the lens: gone .. fully there
});

export function createDust({ ROOM, quality, height }) {
  const MOTES = quality === 'draft' ? 600 : 1500;
  // the beam's volume: from the screen to the chair's back, the pool's width, a little more toward the window
  const z0 = ROOM.screen.z + 0.12, z1 = ROOM.chair.z + 0.2;
  const BOXMIN = [ROOM.chair.x - 0.95, 0.25, z0], BOXSIZE = [2.25, 1.4, z1 - z0];
  const base = new Float32Array(MOTES * 3), vel = new Float32Array(MOTES * 3), aux = new Float32Array(MOTES * 4);
  for (let i = 0; i < MOTES; i++) {
    for (let k = 0; k < 3; k++) {
      base[i * 3 + k] = BOXMIN[k] + hash01(7001, i, k, 0) * BOXSIZE[k];
      vel[i * 3 + k] = (hash01(7002, i, k, 0) * 2 - 1) * DUST.speed * (k === 1 ? 0.55 : 1) + (k === 1 ? 0.003 : 0);
    }
    const big = hash01(7003, i, 0, 0), rr = hash01(7003, i, 1, 0);
    aux[i * 4] = 0.6 + 0.9 * big * big;                       // size factor
    aux[i * 4 + 1] = 0.07 + 0.93 * rr * rr * rr;              // reflectance: most are a faint haze, a few glint
    aux[i * 4 + 2] = hash01(7003, i, 2, 0) * 6.2832;          // sway phase
    aux[i * 4 + 3] = 0.25 + 0.5 * hash01(7003, i, 3, 0);      // sway rate (rad per second of drift)
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('vel', new THREE.BufferAttribute(vel, 3));
  geo.setAttribute('aux', new THREE.BufferAttribute(aux, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uDrift: { value: 0 }, uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color(1, 1, 1) },
      uMin: { value: new THREE.Vector3(...BOXMIN) }, uSize: { value: new THREE.Vector3(...BOXSIZE) },
      uScale: { value: height / 1080 }, uSpot: { value: new THREE.Vector3() }, uSpotDir: { value: new THREE.Vector3(0, 0, 1) },
      uCone: { value: new THREE.Vector3(0, 1, 1.5) },         // cos(cone edge), cos(full strength), distance decay
      uSway: { value: DUST.sway }, uPx: { value: new THREE.Vector3(...DUST.size) }, uNear: { value: new THREE.Vector2(...DUST.near) },
    },
    vertexShader: `
      attribute vec3 vel; attribute vec4 aux;
      uniform float uDrift, uScale, uSway; uniform vec3 uMin, uSize, uSpot, uSpotDir, uColor, uCone, uPx; uniform vec2 uNear;
      varying vec3 vCol; varying float vDisc;
      void main(){
        float sway = aux.z + aux.w * uDrift;
        vec3 off = vel * uDrift + vec3(sin(sway), 0.6 * sin(sway * 0.7 + 1.3), cos(sway * 0.83)) * uSway;
        vec3 q = mod(position - uMin + off, uSize);                // closed form: no stepping
        vec3 p = uMin + q;
        vec3 e = min(q, uSize - q);                                // fade near the box's faces
        float edge = smoothstep(0.0, 0.3, min(min(e.x, e.y), e.z));
        // the light this mote stands in: the spot's own cone and falloff
        vec3 L = p - uSpot; float dist = length(L); L /= dist;
        float beam = smoothstep(uCone.x, uCone.y, dot(L, uSpotDir)) * pow(max(dist, 0.35), -uCone.z);
        // scattering: forward (a camera looking into the screen) and back (a camera standing by the set), least sideways
        float g = dot(L, normalize(cameraPosition - p));
        float phase = 0.3 + 1.1 * pow(max(g, 0.0), 4.0) + 1.0 * pow(max(-g, 0.0), 1.5);
        vec4 mv = viewMatrix * vec4(p, 1.0);
        float z = max(-mv.z, 0.05);
        float px = aux.x * (uPx.x + uPx.y * pow(z, -uPx.z)) * uScale;   // out of focus near the lens
        gl_PointSize = clamp(px, 1.5, 48.0 * uScale);
        vDisc = smoothstep(5.0, 11.0, px / uScale);                // a point's soft glow .. a flat bokeh disc
        // the same light over a wider disc (a real lens keeps a disc's brightness; a little less here, so the big
        // ones stay quiet), and less of it from a mote far from the lens
        float spread = pow(max(px / (3.0 * uScale), 1.0), -0.8) * pow(min(1.0, 1.3 / z), 1.3);
        vCol = uColor * (beam * phase * aux.y * edge * spread * smoothstep(uNear.x, uNear.y, z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity; varying vec3 vCol; varying float vDisc;
      void main(){
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float point = exp(-r * r * 3.5) * (1.0 - smoothstep(0.85, 1.0, r));
        float disc = (1.0 - smoothstep(0.78, 1.0, r)) * (0.8 + 0.2 * smoothstep(0.4, 0.9, r));
        vec3 c = vCol * (mix(point, disc, vDisc) * uOpacity);
        gl_FragColor = vec4(c / (1.0 + max(max(c.r, c.g), c.b) * 2.4), 1.0);   // glints roll off: a mote never clips to white
      }`,
  });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false;
  /** spot: the screen light. lightColor: its colour x the canvas's mean brightness. gain: the room's dust level. */
  function update(S, spot, lightColor, gain) {
    mat.uniforms.uDrift.value = S.dustDrift;
    mat.uniforms.uOpacity.value = S.dustOpacity;
    mat.uniforms.uColor.value.copy(lightColor).multiplyScalar(gain);
    mat.uniforms.uSpot.value.copy(spot.position);
    mat.uniforms.uSpotDir.value.copy(spot.target.position).sub(spot.position).normalize();
    mat.uniforms.uCone.value.set(Math.cos(spot.angle), Math.cos(spot.angle * (1 - spot.penumbra)), spot.decay);
  }
  return { points, update };
}
