// The cast of the owner's bench (studio pass, round 3): the figure that stands on a block of his own pair. For his
// router it is the character of that company's own agent (a real sphere where it is one, its cut-out otherwise), for
// his coding agent the creature its company drew for that tool (worlds/<id>.js `creature`). A figure steps on 0.3 s
// after its block has landed, with a small overshoot, and steps off when the piece is swapped. No words here.
import { Mesh, PlaneGeometry, SphereGeometry } from 'three';
import { backOut, clamp01 } from '../core/clock.js';

const SIZE = { orb: 1.25, cut: 1.5 };      // world units: a sphere's diameter, a cut-out's width
const WAIT = 0.3, GROW = 0.35, OFF = 0.15, BLINK = 4;

// cfg: the company's world configuration. role: 'agent' (its character) or 'tool' (its coding tool's creature).
// Returns null when that company has no such figure: the block then shows its glass alone.
export function createFigure(ctx, cfg, role) {
  const orb = role === 'agent' && cfg.character.kind === 'orb3d';
  const url = orb ? null : role === 'agent' ? cfg.art.heroSmall || cfg.art.hero : cfg.creature ? cfg.art.props[cfg.creature - 1] : null;
  if (!orb && !url) return null;
  const mesh = orb ? new Mesh(new SphereGeometry(0.5, 48, 32), ctx.mats.orb()) : new Mesh(new PlaneGeometry(1, 1), ctx.mats.paper(null, { side: 0, blended: true }));
  mesh.renderOrder = 7; mesh.visible = false;
  ctx.scene.add(mesh);
  let ratio = 1, ready = orb, t = 0, blink = BLINK;
  if (url) ctx.textures.load(url).then((tex) => { if (tex && mesh.parent) { mesh.material.uniforms.uMap.value = tex; ratio = tex.image.height / tex.image.width; ready = true; } });
  const fig = {
    mesh, orb, k: 0, tall: 0,
    // Every frame. on: its piece is his own and has landed. foot: where it stands (a Vector3, the middle of its block's top).
    update(dt, on, foot) {
      const here = on && ready;
      t = here ? t + dt : 0;
      fig.k = ctx.reduced ? (here ? 1 : 0) : here ? clamp01((t - WAIT) / GROW) : Math.max(0, fig.k - dt / OFF);
      const s = (orb ? SIZE.orb : SIZE.cut) * (ctx.reduced || !here ? fig.k : backOut(fig.k, 1.6));
      fig.tall = s * (orb ? 1 : ratio);
      mesh.visible = s > 0.01;
      if (!mesh.visible) return;
      mesh.position.set(foot.x, foot.y + fig.tall / 2 - (orb ? 0.03 : 0.012) * s, foot.z + (orb ? 0 : 0.05));
      if (orb) {
        blink -= dt;
        if (blink < -0.13) blink = BLINK;
        mesh.scale.setScalar(s);
        mesh.lookAt(ctx.camera.position);
        mesh.material.uniforms.uBlink.value = blink < 0 && !ctx.reduced ? 0.08 : 1;
        mesh.material.uniforms.uLook.value.set(0.46 + ctx.input.x * 0.06, 0.03 - ctx.input.y * 0.05, 1).normalize();      // it looks at the coding agent, on its right
      } else {
        mesh.quaternion.copy(ctx.camera.quaternion);
        mesh.rotateZ(-ctx.input.x * 0.05);                           // it leans a little toward the pointer, as the five do
        mesh.scale.set(s, fig.tall, 1);
        mesh.material.uniforms.uOpacity.value = Math.min(1, fig.k * 3);
      }
    },
    hide() { mesh.visible = false; fig.k = 0; fig.tall = 0; t = 0; },
    dispose() { mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.dispose(); },
  };
  return fig;
}
