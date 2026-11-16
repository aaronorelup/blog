// The snapshot's stamp (SPEC 2.10): the words are the section's own (80-stamp.astro). The scene is the level row at
// rest, with the five figures standing free on the ground in front of their stacks, twice their size.
import { smooth, span } from '../core/clock.js';

export function create(ctx, el, sec) {
  const { rig, row } = ctx;
  return {
    stops: [0.5],
    update(t, dt, u) {
      const k = smooth(span(u, 0, 0.25)) * (1 - smooth(span(u, sec.screens - 0.25, sec.screens)));
      rig.to(rig.stops.row);
      if (!ctx.phone) for (const tw of row.towers) { tw.char.to = 'front'; tw.char.t = k; }
    },
  };
}
