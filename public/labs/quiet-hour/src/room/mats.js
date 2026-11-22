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

/**
 * Weighted smooth normals for a non-indexed geometry: every corner takes the area-and-angle weighted mean of the
 * faces that meet at its position and lie within `creaseDeg` of its own face. Bevels turn into rounded edges, big
 * flat faces stay flat (they outweigh the bevel), sharper folds stay folds. Run boxUV first (it reads face normals).
 */
export function smoothNormals(g, creaseDeg = 55) {
  const geo = g.index ? g.toNonIndexed() : g;
  const p = geo.attributes.position, n3 = p.count, faces = n3 / 3, cosC = Math.cos(creaseDeg * Math.PI / 180);
  const fn = new Float32Array(faces * 3), w = new Float32Array(n3);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let f = 0; f < faces; f++) {
    a.fromBufferAttribute(p, f * 3); b.fromBufferAttribute(p, f * 3 + 1); c.fromBufferAttribute(p, f * 3 + 2);
    nn.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a));
    const area = nn.length() / 2; if (area > 0) nn.multiplyScalar(0.5 / area);
    fn[f * 3] = nn.x; fn[f * 3 + 1] = nn.y; fn[f * 3 + 2] = nn.z;
    const P = [a, b, c];
    for (let k = 0; k < 3; k++) {                                  // the corner's angle
      e1.subVectors(P[(k + 1) % 3], P[k]).normalize(); e2.subVectors(P[(k + 2) % 3], P[k]).normalize();
      w[f * 3 + k] = area * Math.acos(Math.min(1, Math.max(-1, e1.dot(e2))));
    }
  }
  const groups = new Map();
  for (let i = 0; i < n3; i++) {
    const k = `${Math.round(p.getX(i) * 5000)},${Math.round(p.getY(i) * 5000)},${Math.round(p.getZ(i) * 5000)}`;
    const gk = groups.get(k); if (gk) gk.push(i); else groups.set(k, [i]);
  }
  const out = new Float32Array(n3 * 3);
  for (const list of groups.values()) for (const i of list) {
    const f = (i / 3) | 0, nx = fn[f * 3], ny = fn[f * 3 + 1], nz = fn[f * 3 + 2];
    let sx = 0, sy = 0, sz = 0;
    for (const j of list) {
      const fj = (j / 3) | 0, jx = fn[fj * 3], jy = fn[fj * 3 + 1], jz = fn[fj * 3 + 2];
      if (nx * jx + ny * jy + nz * jz >= cosC) { sx += jx * w[j]; sy += jy * w[j]; sz += jz * w[j]; }
    }
    const l = Math.hypot(sx, sy, sz) || 1;
    out[i * 3] = sx / l; out[i * 3 + 1] = sy / l; out[i * 3 + 2] = sz / l;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  return geo;
}

/**
 * Pile: what makes cloth read as cloth by one small light. Fibres standing off a surface catch the screen where
 * the surface turns away from the eye: a soft sheen on every rounded edge the screen lights (seen from beside the
 * set), and a thin rim of screen light along the outline when the screen is behind the object (the chair's back in
 * WIDE A). `screen` holds the uniforms the room updates each frame: uScreenV (the light's place in view space) and
 * uScreenCol (the spot's colour times its intensity), uScreenDecay (the spot's distance decay). No shadow term: it
 * is a fringe, not a surface.
 */
export function pile(mat, screen, { rim = 0.5, sheen = 2.0, rimPower = 4.0, sheenPower = 2.6, key = 'pile' } = {}) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, renderer) => {
    if (prev) prev(sh, renderer);
    sh.uniforms.uScreenV = screen.uScreenV; sh.uniforms.uScreenCol = screen.uScreenCol; sh.uniforms.uScreenDecay = screen.uScreenDecay;
    sh.uniforms.uPile = { value: new THREE.Vector4(rim, sheen, rimPower, sheenPower) };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uScreenV, uScreenCol; uniform vec4 uPile; uniform float uScreenDecay;')
      .replace('#include <opaque_fragment>', `{
        vec3 pV = normalize( vViewPosition );
        vec3 pTo = uScreenV + vViewPosition; float pD = length( pTo ); vec3 pL = pTo / max( pD, 1e-4 );
        float pEdge = 1.0 - abs( dot( normal, pV ) );                      // 1 where the surface turns away from the eye
        float pNL = dot( normal, pL );
        vec3 pE = uScreenCol * ( RECIPROCAL_PI * pow( max( pD, 0.3 ), -uScreenDecay ) );
        // rim: the screen is behind this point and its light skims the surface here
        float pRim = pow( pEdge, uPile.z ) * smoothstep( 0.0, 0.85, dot( -pV, pL ) ) * smoothstep( -0.45, 0.05, pNL );
        // sheen: lit pile, brighter where it is seen edge-on
        float pSheen = pow( pEdge, uPile.w ) * max( pNL, 0.0 );
        outgoingLight += pE * ( uPile.x * pRim * mix( diffuseColor.rgb, vec3( 1.0 ), 0.25 ) + uPile.y * pSheen * diffuseColor.rgb );
      }
      #include <opaque_fragment>`);
  };
  const prevKey = mat.customProgramCacheKey?.bind(mat);
  mat.customProgramCacheKey = () => `${prevKey ? prevKey() : ''}|${key}`;
  return mat;
}
