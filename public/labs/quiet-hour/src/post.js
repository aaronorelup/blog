// The final pass: STUB (harness-builder). For now: the room straight to the canvas, then the
// subtitle overlay (a film-size 2D canvas drawn as a textured quad on top), so what the canvas
// shows, and what readPixels captures, is the whole film frame.
//
//   const post = createPost({ renderer, width, height, quality });
//   post.render(scene, camera, overlayCanvas, overlayKey)
//
// overlayKey says when the overlay's pixels changed (the texture is re-uploaded only then).
// Whoever grades the film (grain, bloom, the lens) replaces the middle of render(); keep it a pure
// function of its inputs: no feedback buffers, no previous frame.

import * as THREE from 'three';

export function createPost({ renderer, width, height }) {
  const overlayScene = new THREE.Scene();
  const overlayCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let tex = null, lastKey = null;
  const mat = new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  overlayScene.add(quad);

  return {
    render(scene, camera, overlayCanvas, overlayKey) {
      renderer.autoClear = true;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      if (!overlayCanvas || overlayKey == null) return;               // nothing on top this frame
      if (!tex || tex.image !== overlayCanvas) {
        tex = new THREE.CanvasTexture(overlayCanvas);
        tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
        mat.map = tex; mat.needsUpdate = true;                           // normal alpha blending
      }
      if (overlayKey !== lastKey) { tex.needsUpdate = true; lastKey = overlayKey; }
      renderer.autoClear = false;
      renderer.render(overlayScene, overlayCam);
      renderer.autoClear = true;
    },
    dispose() { tex?.dispose(); mat.dispose(); quad.geometry.dispose(); },
  };
}
