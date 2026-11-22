// The room (Three.js): a dark front room near midnight, lit by the television (room-set).
//
//   const room = createRoom({ renderer, programmeCanvas, width, height, quality });
//   room.update(S, shot)   // S = engine.signals(frame), shot = shots.js shotAt(frame)
//   room.scene, room.camera
//
// Parts: ./shell.js (walls, floor, doorway and hall, the two windows, the street, the neighbour's window, moon
// spill), ./furniture.js (sideboard, wing chair and blanket, side table, cup and spoon, clock, print, books),
// ./tea.js (the rippling, reflecting tea), ./dust.js (motes in the beam), ./tv.js + ./screen.js (the set and its
// tube: tv-look's files; this file only creates and updates them).
//
// The light: the screen is the light. One shadow-casting spot at the tube, its colour and strength from the
// programme canvas's average, aimed at the chair's seat as a pool (all penumbra, falling off toward the walls'
// edges). Its shadow's blur comes from S.shadowSoftness (bible v1.2): a broad soft gradient while the box is
// unsure, a razor when it is certain, drawn with three's variance shadow map blurred in the light's space (see
// LIGHT). The dust samples the same map, so the chair's shadow is a volume in the beam too. The night fill is
// static and low: a cool directional wash from the front of the room (it lies on the back wall and the chair's
// back for WIDE A and leaves the front wall to the screen for the REVERSE) over a very low ambient. Nothing else
// lights the room: the moon at the windows and the neighbour's window are unlit decals and glows.
//
// Everything that moves reads S (or the shot). No state is carried between frames.

import * as THREE from 'three';
import { ROOM, WIDE_A, REVERSE } from '../shots.js';
import { createTV } from './tv.js';
import { createShell } from './shell.js';
import { createFurniture } from './furniture.js';
import { createTea } from './tea.js';
import { createDust } from './dust.js';

export const LIGHT = Object.freeze({
  spotGain: 16.0,          // spot intensity (cd) per unit of the canvas's mean luminance
  spotDecay: 1.5,          // a pool: the chair bright, the wall behind it dimmer, its far edges falling toward dark
  spotAngle: 0.62,         // rad: the pool's half-angle, all of it penumbra (a smooth falloff from the centre)
  spotPenumbra: 1.0,
  aim: [-0.15, 0.55, -0.5],                                   // the pool's centre: the chair's seat
  // the static night fill: a cool wash from the front of the room (the bay window side) and above, so it lies on the
  // back wall and the chair's back (WIDE A) and leaves the front wall and the side walls (the REVERSE) to the screen;
  // under it a very low ambient so nothing is pure black
  fillColor: 0x7a8fb0, fillIntensity: 0.75, fillFrom: [0, 0.45, 1],
  fillAmbient: 0x6a7a96, fillAmbientIntensity: 0.12,
  dustGain: 130.0,
  pileGain: 30.0,           // the chair velvet's rim of screen light (furniture.js pile)
  // the shadow: three's variance shadow map (8-bit packed targets, no half floats), blurred in the light's space by
  // two separable box passes of shadowSamples bilinear taps over +-radius texels. radius = 1 + softness x shadowSpan.
  // The map is 768 over the middle 57 degrees of the beam (focus 0.8): about 7 mm a texel on the wall behind the
  // chair, so softness 0.45 is a ~50 cm gradient there and softness 0 a 1-2 px razor at 1080p. Measured at 1080p
  // (browser CPU per frame, interleaved, load 12-16): no shadow 1.7 s, this 2.2 s, 1024 x 25 taps 2.8 s, the old
  // 17-tap PCF 2.1 s.
  shadowMap: 768, shadowSamples: 17, shadowSpan: 80, shadowFocus: 0.8,
});

/** Softness 0..1 from S: the v1.2 engine's S.shadowSoftness, else derived from the old S.shadowRadius (1 + 5 H/ln 32). */
export function shadowSoftness(S) {
  if (typeof S.shadowSoftness === 'number') return Math.min(1, Math.max(0, S.shadowSoftness));
  return Math.min(1, Math.max(0, (S.shadowRadius - 1) / 5));
}

export function createRoom({ renderer, programmeCanvas, width, height, quality = 'final' }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.03, 40);
  camera.userData.heightPx = height;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;                    // a blurred variance map: soft to razor at one cost

  // ---- the programme texture (shared by the tube, the tea's reflection) ----
  const S0 = ROOM.screen;
  const progTex = new THREE.CanvasTexture(programmeCanvas);
  progTex.colorSpace = THREE.SRGBColorSpace; progTex.minFilter = THREE.LinearFilter; progTex.generateMipmaps = false;

  // ---- the set (tv-look) ----
  const tv = createTV({ THREE, programmeTexture: progTex, anchors: ROOM });
  scene.add(tv.group);

  // ---- the room ----
  const shell = createShell({ ROOM, wideCam: WIDE_A, reverseCam: REVERSE });
  scene.add(shell.group);
  // the room's own surfaces write the shadow map too, so the variance map's blur mixes the chair's depth with the
  // wall's (a true penumbra), not with empty space
  shell.group.traverse((o) => { if (o.isMesh && o.receiveShadow && !o.material.transparent) o.castShadow = true; });
  const furniture = createFurniture({ ROOM });
  scene.add(furniture.group);
  const tea = createTea({ ROOM, programmeTexture: progTex });
  scene.add(tea.mesh);
  const dust = createDust({ quality, height });
  scene.add(dust.points);

  // ---- light: the screen spot (the only shadow caster) and the static night fill ----
  const fill = new THREE.DirectionalLight(LIGHT.fillColor, LIGHT.fillIntensity);   // no shadow: a static wash
  fill.position.set(...LIGHT.fillFrom); fill.target.position.set(0, 0, 0);
  scene.add(fill); scene.add(fill.target);
  scene.add(new THREE.AmbientLight(LIGHT.fillAmbient, LIGHT.fillAmbientIntensity));
  const spot = new THREE.SpotLight(0xffffff, 0, 14, LIGHT.spotAngle, LIGHT.spotPenumbra, LIGHT.spotDecay);
  spot.position.set(S0.x, S0.y, S0.z + 0.04);
  spot.target.position.set(...LIGHT.aim);
  scene.add(spot); scene.add(spot.target);
  spot.castShadow = true;
  spot.shadow.mapSize.set(LIGHT.shadowMap, LIGHT.shadowMap);
  spot.shadow.blurSamples = LIGHT.shadowSamples;                  // fixed: one shader, only the radius changes
  spot.shadow.camera.near = 0.12; spot.shadow.camera.far = 7.5;
  spot.shadow.bias = -0.001; spot.shadow.normalBias = 0.0;
  spot.shadow.focus = LIGHT.shadowFocus;

  // canvas average for the spot (a 40x30 downsample, then a plain mean)
  const avgCanvas = document.createElement('canvas'); avgCanvas.width = 40; avgCanvas.height = 30;
  const actx = avgCanvas.getContext('2d', { willReadFrequently: true });
  const lightCol = new THREE.Color();
  const pileLight = { color: lightCol, gain: LIGHT.pileGain, fromView: new THREE.Vector3() };

  // ---- per frame ----
  function update(S, shot) {
    const cam = shot.camera;
    camera.fov = cam.fov; camera.aspect = width / height;
    camera.position.set(...cam.pos); camera.lookAt(...cam.target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();

    // the screen: new picture, then the set's own per-frame update
    progTex.needsUpdate = true;
    tv.update(S, shot, camera);

    // screen light: colour and strength from the canvas average
    actx.drawImage(programmeCanvas, 0, 0, 40, 30);
    const px = actx.getImageData(0, 0, 40, 30).data;
    let r = 0, g = 0, b = 0; for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
    const n = px.length / 4 * 255; r /= n; g /= n; b /= n;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b, m = Math.max(r, g, b, 1e-4);
    spot.color.setRGB(r / m, g / m, b / m, THREE.SRGBColorSpace);
    spot.intensity = LIGHT.spotGain * lum;
    spot.shadow.radius = 1 + shadowSoftness(S) * LIGHT.shadowSpan;   // texels of blur in the light's space
    lightCol.copy(spot.color).multiplyScalar(lum);

    shell.update(S);
    pileLight.fromView.copy(spot.position).applyMatrix4(camera.matrixWorldInverse);
    furniture.update(S, pileLight);
    tea.update(S, lightCol);
    dust.update(S, spot, lightCol, LIGHT.dustGain, cam.focus ?? Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]));
  }

  return {
    scene, camera, update,
    dispose() {
      scene.traverse((o) => { o.geometry?.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((mm) => { if (!mm) return; for (const k in mm) if (mm[k]?.isTexture) mm[k].dispose(); mm.dispose?.(); }); });
      progTex.dispose();
    },
  };
}
