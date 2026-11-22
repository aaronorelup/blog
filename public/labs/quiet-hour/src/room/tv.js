// The television: the set's box on the cabinet, the tube (screen mesh) and its per-frame update.
// OWNER: tv-look (handed over by room-set). room-set never edits this file; the TV's place and size
// come from the ROOM anchors in shots.js (room-set's).
//
//   const tv = createTV({ THREE, programmeTexture, anchors });   // anchors = ROOM from shots.js
//   scene.add(tv.group);
//   tv.update(S, shot, camera)   // after the camera is placed for this frame
//   tv.screen                    // the tube's mesh (the room aims its light from it)
//
// The room marks programmeTexture.needsUpdate each frame before calling update.

import { createScreenMaterial } from './screen.js';

export function createTV({ THREE, programmeTexture, anchors }) {
  const group = new THREE.Group();
  const T = anchors.tv, S0 = anchors.screen;

  const body = new THREE.Mesh(new THREE.BoxGeometry(T.w, T.h, T.d), new THREE.MeshLambertMaterial({ color: 0x3d3128 }));
  body.position.set(T.x, T.y + T.h / 2, T.z); body.castShadow = true; body.receiveShadow = true; group.add(body);

  const screenMat = createScreenMaterial({ THREE, programmeTexture });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(S0.w, S0.h), screenMat);
  screen.position.set(S0.x, S0.y, S0.z); group.add(screen);

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function update(S, shot, camera) {
    // scanlines fade out where a line would be under 2.5 output pixels
    const height = camera.userData.heightPx || 1080;
    tmpA.set(S0.x, S0.y + S0.h / 2, S0.z).project(camera); tmpB.set(S0.x, S0.y - S0.h / 2, S0.z).project(camera);
    const screenPx = Math.abs(tmpA.y - tmpB.y) / 2 * height, linePx = screenPx / screenMat.uniforms.uLines.value;
    screenMat.uniforms.uScan.value = Math.min(1, Math.max(0, (linePx - 2.5) / 1.0));
  }

  return { group, screen, update };
}
