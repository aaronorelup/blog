// The ending (SPEC 2.12): the opening's dolly zoom run backwards over 0.5 screens of scroll. The camera rises from
// the level row to straight above while the lens closes to 5 degrees, the mark plates settle back on their lids,
// and the snapshot's date is printed on the floor where the title was. Then the owner's line, the disclaimer, the links.
import { Vector3 } from 'three';
import { easeIO, lerp, smooth, span } from '../core/clock.js';
import { $, fade } from '../core/dom.js';
import { HOURS } from '../scene/studio.js';
import { LID, place, pose, print } from './opening.js';

export function create(ctx, el) {
  const { rig, row, studio } = ctx;
  const ruler = $('.ail-print span', el);
  const quote = $('.ail-end__quote', el);
  const foot = $('.ail-end__foot', el);
  const st = { type: null, laid: false, z0: 0 };
  const v = new Vector3();
  const layout = () => { st.z0 = Number(getComputedStyle(el).getPropertyValue('--z0')) || 0; st.type = print(ctx, ruler, st.z0, st.type); st.laid = true; };
  const onResize = () => { st.laid = false; };
  window.addEventListener('resize', onResize);

  return {
    stops: [0, 1],
    enter() { st.laid = false; },
    leave() {
      for (const tw of row.towers) tw.lid.size = 1.1;
      for (const node of [quote, foot]) { node.style.opacity = ''; node.style.visibility = ''; node.style.transform = ''; }
    },
    update(t, dt, u) {
      if (!st.laid) layout();
      const p = span(u, 0, 0.5);
      const e = 1 - easeIO(p);                                  // 1 the three-quarter row, 0 the poster from above
      const top = pose(ctx, e, st.z0);
      rig.mix(rig.stops.row, top, smooth(span(p, 0, 0.3)));
      rig.yaw = 0.06 * smooth(span(e, 0.3, 0.9));
      rig.pitch = 0.025 * smooth(span(e, 0.3, 0.9));
      studio.lamp.set(...HOURS.noon).lerp(v.set(...HOURS.hero), smooth(e));
      studio.ink = smooth(span(p, 0.3, 0.75));

      const flat = easeIO(span(p, 0.3, 0.9));
      for (const tw of row.towers) {
        const wide = lerp(1.1, LID.flat, flat);
        place(tw.lid, wide, Math.max(0.97 * (1 - flat), 0.5 * wide * Math.sin(top.tilt) * smooth(span(p, 0.1, 0.4)) + (flat < 1 ? 0.03 : 0)));
        tw.char.scale = 1 - smooth(span(p, 0.08, 0.42));        // a cut-out seen from above reads as lying down: it leaves first
        if (tw.char.scale < 0.02) tw.char.show = 0;
      }
      const words = smooth(span(p, 0.7, 1));
      fade(quote, words, 16 * (1 - words));
      fade(foot, words, 16 * (1 - words));
    },
    dispose() {
      window.removeEventListener('resize', onResize);
      for (const tw of row.towers) tw.lid.size = 1.1;
      const ink = studio.ground.material.uniforms.uInk;
      if (st.type) { if (ink.value === st.type.texture) ink.value = null; st.type.texture.dispose(); }
    },
  };
}
