// The house's paper objects (art/house/obj-<layer>.webp): what a person keeps around the five, as grey cut-outs. One
// stands in the cabinet's open drawer (sections/around.js), seven on the bench's low plinths (sections/mystack.js).
// A cut-out faces the camera and sits on its base line, not on the bottom edge of its file: a ribbon, a key on a
// cord and a bracket hang below theirs. No words here: the page prints each one's name beside it.
import { Mesh, PlaneGeometry } from 'three';
import { art } from '../worlds/_default.js';

const BASE = { context: 0.84, secrets: 0.79, gpu: 0.78 };      // the base line, as a fraction of the file's height from its top
const SEAT = 0.94;                                             // every other one: only the front curve of its base is below

// layer: one of the cabinet's nine. Returns null where the house has no picture of it (the caller keeps its glyph).
export function createObject(ctx, layer, order = 7) {
  const url = art('house', `obj-${layer}`);
  if (!url) return null;
  const mesh = new Mesh(new PlaneGeometry(1, 1), ctx.mats.paper(null, { side: 0, blended: true, opacity: 0 }));
  mesh.renderOrder = order; mesh.visible = false;
  ctx.scene.add(mesh);
  const base = BASE[layer] || SEAT;
  let ratio = 1, ready = false;
  ctx.textures.load(url).then((tex) => { if (tex && mesh.parent) { mesh.material.uniforms.uMap.value = tex; ratio = tex.image.height / tex.image.width; ready = true; } });
  const obj = {
    mesh, layer, tall: 0,
    // Every frame: its base line at `foot` (a Vector3), its longer side `size` units long, `show` 0 to 1
    place(foot, size, show = 1) {
      mesh.visible = ready && show > 0.01 && size > 0.01;
      obj.tall = 0;
      if (!mesh.visible) return;
      const w = ratio > 1 ? size / ratio : size, h = w * ratio;
      obj.tall = h * base;
      mesh.quaternion.copy(ctx.camera.quaternion);
      mesh.scale.set(w, h, 1);
      mesh.position.copy(foot);
      mesh.translateY((base - 0.5) * h);
      mesh.material.uniforms.uOpacity.value = Math.min(1, show);
    },
    hide() { mesh.visible = false; obj.tall = 0; },
    dispose() { mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.dispose(); },
  };
  return obj;
}
