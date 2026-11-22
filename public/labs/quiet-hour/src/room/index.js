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
// programme canvas's average, its shadow radius from S.shadowRadius (soft while the box is unsure, razor-hard
// when it is certain). A low, cool, static night fill so the room's shapes read. Nothing else lights the room:
// the moon at the windows and the neighbour's window are unlit decals and glows.
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
  spotGain: 14.0,          // spot intensity (cd) per unit of the canvas's mean luminance
  spotDecay: 1.35,        // a touch gentler than physical so the far wall holds the chair's shadow
  spotAngle: 1.42,        // rad: the beam's half-angle (the tube's spread), penumbra below
  spotPenumbra: 1.0,
  fillSky: 0x6f86ad, fillGround: 0x1e1d1f, fillIntensity: 0.46,   // the static night fill
  dustGain: 20.0,
});

export function createRoom({ renderer, programmeCanvas, width, height, quality = 'final' }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.03, 40);
  camera.userData.heightPx = height;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;                    // PCF honours shadow.radius

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
  const furniture = createFurniture({ ROOM });
  scene.add(furniture.group);
  const tea = createTea({ ROOM, programmeTexture: progTex });
  scene.add(tea.mesh);
  const dust = createDust({ quality, height });
  scene.add(dust.points);

  // ---- light: the screen spot (the only shadow caster) and the static night fill ----
  scene.add(new THREE.HemisphereLight(LIGHT.fillSky, LIGHT.fillGround, LIGHT.fillIntensity));
  const spot = new THREE.SpotLight(0xffffff, 0, 14, LIGHT.spotAngle, LIGHT.spotPenumbra, LIGHT.spotDecay);
  spot.position.set(S0.x, S0.y, S0.z + 0.04);
  spot.target.position.set(S0.x - 0.15, S0.y - 0.45, S0.z + 3);
  scene.add(spot); scene.add(spot.target);
  spot.castShadow = true;
  const sm = quality === 'draft' ? 1024 : 2048;
  spot.shadow.mapSize.set(sm, sm);
  spot.shadow.camera.near = 0.12; spot.shadow.camera.far = 7.5;
  spot.shadow.bias = -0.0004; spot.shadow.normalBias = 0.012;
  spot.shadow.focus = 0.62;                                       // the shadow map covers the beam's core (~100 deg)

  // canvas average for the spot (a 40x30 downsample, then a plain mean)
  const avgCanvas = document.createElement('canvas'); avgCanvas.width = 40; avgCanvas.height = 30;
  const actx = avgCanvas.getContext('2d', { willReadFrequently: true });
  const lightCol = new THREE.Color();

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
    spot.shadow.radius = S.shadowRadius;                           // 1 + 5 H / ln 32
    lightCol.copy(spot.color).multiplyScalar(lum);

    shell.update(S);
    furniture.update(S);
    tea.update(S, lightCol);
    dust.update(S, spot, lightCol, LIGHT.dustGain);
  }

  return {
    scene, camera, update,
    dispose() {
      scene.traverse((o) => { o.geometry?.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((mm) => { if (!mm) return; for (const k in mm) if (mm[k]?.isTexture) mm[k].dispose(); mm.dispose?.(); }); });
      progTex.dispose();
    },
  };
}
