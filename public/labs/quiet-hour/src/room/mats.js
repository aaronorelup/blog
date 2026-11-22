// Shared material helpers for the room (room-set).
//
// roomAO(material, ROOM): bakes the darkening where surfaces meet (floor and wall, wall and wall, wall and
// ceiling) into a material, from the fragment's world position against the room's six planes. It multiplies
// ALL the light the surface gets (the screen spot too), so corners and skirting lines read even in the beam.
// Static: it reads no signal.

import * as THREE from 'three';

export function roomAO(mat, ROOM, strength = 0.55, reach = 0.28) {
  const { w, d, h } = ROOM.size, zB = ROOM.backWallZ;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uRoomMin = { value: new THREE.Vector3(-w / 2, 0, zB) };
    sh.uniforms.uRoomMax = { value: new THREE.Vector3(w / 2, h, zB + d) };
    sh.uniforms.uAO = { value: new THREE.Vector2(strength, reach) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRoomPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvRoomPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vRoomPos; uniform vec3 uRoomMin, uRoomMax; uniform vec2 uAO;
float roomOcc(vec3 p) {
  vec3 a = p - uRoomMin, b = uRoomMax - p;
  float o = 1.0;
  // distance to each plane; the plane the surface lies on (distance ~0) is skipped
  float ds[6]; ds[0] = a.x; ds[1] = b.x; ds[2] = a.y; ds[3] = b.y; ds[4] = a.z; ds[5] = b.z;
  for (int i = 0; i < 6; i++) { float dd = ds[i]; if (dd > 0.015) o *= 1.0 - uAO.x * exp(-dd / uAO.y); }
  return o;
}`)
      .replace('#include <opaque_fragment>', '#include <opaque_fragment>\ngl_FragColor.rgb *= roomOcc(vRoomPos);');
  };
  mat.customProgramCacheKey = () => 'roomAO';
  return mat;
}

/** A texture from a canvas: sRGB, mipmapped, optional repeat. */
export function tex(canvas, { repeat = null, srgb = true, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** A rounded box (bevelled extrusion), centred on the origin: w (x) by h (y) by d (z), corner radius r. */
export function roundedBox(w, h, d, r, segs = 3) {
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const s = new THREE.Shape(), x = w / 2 - r, y = h / 2 - r;
  s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(-x, y); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: segs, curveSegments: 4 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  g.computeVertexNormals();
  return g;
}

/** Box-projected UVs (metres -> texture units) for any geometry: u,v from the two axes the normal is not on. */
export function boxUV(g, scale = 1) {
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u * scale; uv[i * 2 + 1] = v * scale;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/** A contact shadow decal: a dark soft shape laid on the floor (or a wall), multiplying what is under it. */
export function contactShadow(alphaTex, w, d, opacity = 0.6) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({
    color: 0x000000, alphaMap: alphaTex, transparent: true, opacity, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1;
  return m;
}
