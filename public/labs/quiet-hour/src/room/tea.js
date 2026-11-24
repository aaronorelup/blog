// The tea's surface (room-set): a dark disc that reflects the television's own picture, rippled by one ring
// per pluck (S.teaRings: age in frames, size = velocity squared). The rings are a closed form of their age:
// a travelling wave packet r = c * age, its height the pluck's size, fading as it spreads. The reflection is
// a ray from the eye bounced off the rippled surface and hit against the screen's rectangle, so every ring
// bends the picture. No state: everything comes from S.teaRings on this frame.

import * as THREE from 'three';

const MAX_RINGS = 8, RING_FRAMES = 36;

export function createTea({ ROOM, programmeTexture }) {
  const cu = ROOM.cup, S0 = ROOM.screen;
  const surfY = cu.y + 0.012 + cu.h * 0.8, rad = cu.r * 0.9;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uAge: { value: new Float32Array(MAX_RINGS).fill(-1) }, uSize: { value: new Float32Array(MAX_RINGS) },
      uRad: { value: rad }, uCentre: { value: new THREE.Vector3(cu.x, surfY, cu.z) },
      uScreenC: { value: new THREE.Vector3(S0.x, S0.y, S0.z) }, uScreenHalf: { value: new THREE.Vector2(S0.w / 2, S0.h / 2) },
      uProg: { value: programmeTexture }, uLight: { value: new THREE.Color(1, 1, 1) }, uFill: { value: new THREE.Color(0.02, 0.025, 0.035) },
    },
    vertexShader: `
      varying vec3 vW; varying vec2 vL;
      void main(){ vL = position.xy; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uAge[${MAX_RINGS}], uSize[${MAX_RINGS}], uRad;
      uniform vec3 uCentre, uScreenC, uLight, uFill; uniform vec2 uScreenHalf; uniform sampler2D uProg;
      varying vec3 vW; varying vec2 vL;
      void main(){
        // the disc lies in local xy (rotated flat): r from the cup's centre
        vec2 d = vW.xz - uCentre.xz; float r = length(d); vec2 dir = r > 1e-5 ? d / r : vec2(0.0);
        float slope = 0.0;
        for (int i = 0; i < ${MAX_RINGS}; i++) {
          float a = uAge[i]; if (a < 0.0) continue;
          float t = a / ${RING_FRAMES.toFixed(1)};
          float front = uRad * (0.08 + 1.05 * t);                         // the ring's radius
          float x = (r - front) / (uRad * 0.16);
          float env = exp(-x * x) * (1.0 - t) * (1.0 - t);
          slope += uSize[i] * env * cos(x * 3.2) * 0.55;                  // d(height)/dr, unitless
          // the wall reflects it back faintly
          float xr = (r - (2.0 * uRad - front)) / (uRad * 0.16);
          slope -= uSize[i] * exp(-xr * xr) * (1.0 - t) * 0.25 * cos(xr * 3.2) * step(0.5, t);
        }
        vec3 n = normalize(vec3(-slope * dir.x, 1.0, -slope * dir.y));
        vec3 v = normalize(vW - cameraPosition);
        vec3 rf = reflect(v, n);
        // hit the screen's plane (z = screen z) and look up the programme there
        vec3 col = vec3(0.045, 0.022, 0.01) * (0.4 + 0.6 * uFill * 20.0);   // tea: dark amber body
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-v, n), 0.0), 5.0);
        if (rf.z < -1e-4) {
          float t = (uScreenC.z - vW.z) / rf.z;
          vec3 h = vW + rf * t;
          vec2 q = (h.xy - uScreenC.xy) / uScreenHalf;                    // -1..1 on the tube
          vec2 e = smoothstep(vec2(1.0), vec2(0.9), abs(q));
          vec3 pic = texture2D(uProg, q * 0.5 + 0.5).rgb;
          col += pic * e.x * e.y * (0.05 + 0.5 * fres) * 1.6;
        }
        // the room as the tea sees it: the screen's light as a bright lobe toward the set, dark elsewhere.
        // Every ring tilts the surface, so it sweeps this highlight into bright and dark bands.
        vec3 Ls = normalize(uScreenC - vW);
        float c = max(dot(rf, Ls), 0.0);
        col += uLight * (0.9 * pow(c, 60.0) + 0.22 * pow(c, 10.0)) * (0.3 + 0.7 * fres);
        col += uFill * fres * 0.6;
        float edge = smoothstep(uRad, uRad * 0.94, r);                    // meniscus: darker at the china
        gl_FragColor = vec4(col * (0.6 + 0.4 * edge), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(rad, 48), mat);
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(cu.x, surfY, cu.z);
  function update(S, lightColor) {
    const age = mat.uniforms.uAge.value, size = mat.uniforms.uSize.value;
    for (let i = 0; i < MAX_RINGS; i++) {
      const ring = S.teaRings[i];
      age[i] = ring ? Math.min(ring.age, RING_FRAMES - 0.001) : -1;
      size[i] = ring ? ring.size : 0;
    }
    mat.uniforms.uLight.value.copy(lightColor);
  }
  return { mesh, update };
}
