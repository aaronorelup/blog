// The quality rungs (SPEC 4.9) and the watchdog that steps down when frames run long. ?tier=high|low|static
// pins a rung and turns the watchdog off, which is what the tests do: software WebGL must never step mid-test.
export const RUNGS = {
  high: { name: 'high', ratio: 2, dust: 300, props: 3, small: false },
  low: { name: 'low', ratio: 1.5, dust: 120, props: 2, small: true },
};

export function pickRung(query, phone) {
  const asked = query.get('tier');
  if (asked === 'static') return { name: 'static', pinned: true };
  const pinned = asked === 'high' || asked === 'low';
  return { ...RUNGS[pinned ? asked : phone ? 'low' : 'high'], pinned };
}

// sample(dt) every drawn frame. When frames average over 21 ms for 2 s: lower the pixel ratio by 0.25 down
// to 1, then drop the dust, then the props, then give up and call onStatic (the text version).
export function createWatchdog(rung, { apply, onStatic }) {
  const q = { ...rung, ratio: Math.min(window.devicePixelRatio || 1, rung.ratio) };
  let t = 0;
  let n = 0;
  apply(q);
  return {
    quality: q,
    sample(dt) {
      if (rung.pinned || document.hidden) return;
      t += dt; n++;
      if (t < 2) return;
      const ms = (t / n) * 1000;
      t = 0; n = 0;
      if (ms <= 21) return;
      if (q.ratio > 1) q.ratio = Math.max(1, q.ratio - 0.25);
      else if (q.dust > 0) q.dust = 0;
      else if (q.props > 0) q.props = 0;
      else { onStatic(); return; }
      apply(q);
    },
  };
}
