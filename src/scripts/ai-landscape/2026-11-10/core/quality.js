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

// sample(dt) every drawn frame. When frames average over the limit for 2 s: lower the pixel ratio by 0.25 down to 1,
// then drop the dust, then the props, then give up and call onStatic (the text version). The limit is 21 ms, or a
// quarter over the display's own pace when that is slower (`cadence`, seconds a frame, measured before the scene: a
// phone in a power mode that hands out 30 frames a second is not a slow one). After 10 s of good frames the last
// step is taken back, once.
export const LIMIT_MS = 21;
export function createWatchdog(rung, { apply, onStatic }, cadence = 0) {
  const q = { ...rung, ratio: Math.min(window.devicePixelRatio || 1, rung.ratio) };
  const limit = Math.max(LIMIT_MS, Math.min(45, cadence * 1250));      // (no display is slower than 30 a second: a stall while loading is not a pace)
  const undo = [];
  let t = 0;
  let n = 0;
  let good = 0;
  let back = true;
  apply(q);
  return {
    quality: q, limit,
    sample(dt) {
      if (rung.pinned || document.hidden) return;
      t += dt; n++;
      if (t < 2) return;
      const ms = (t / n) * 1000;
      const span = t;
      t = 0; n = 0;
      if (ms <= limit) {
        good = ms <= limit * 0.85 ? good + span : 0;
        if (good >= 10 && back && undo.length) { back = false; Object.assign(q, undo.pop()); apply(q); }
        return;
      }
      good = 0;
      if (q.ratio > 1) { undo.push({ ratio: q.ratio }); q.ratio = Math.max(1, q.ratio - 0.25); }
      else if (q.dust > 0) { undo.push({ dust: q.dust }); q.dust = 0; }
      else if (q.props > 0) { undo.push({ props: q.props }); q.props = 0; }
      else { onStatic(); return; }
      apply(q);
    },
  };
}
