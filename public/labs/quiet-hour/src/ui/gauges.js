// The x-ray's list. engine.gauges(frame) -> [{ id, name, reads, value }] when the engine has it; until then (or if it
// is missing) the same list is built here from engine.signals(frame), so the page never shows less than the film uses.
// Nothing here changes the film: it only reads.

const isNum = (x) => typeof x === 'number' && Number.isFinite(x);

/** A value as the x-ray shows it: numbers to 3 significant figures, booleans as yes or no, nothing as a dash. */
export function formatValue(v) {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return String(v);
    if (Number.isInteger(v)) return String(v);
    const a = Math.abs(v);
    if (a >= 1000) return v.toFixed(0);
    if (a >= 0.001) return String(Number(v.toPrecision(3)));
    if (a < 1e-4) return v === 0 ? '0' : (v > 0 ? 'under 0.0001' : 'above -0.0001');
    return v.toExponential(2);
  }
  if (Array.isArray(v)) return v.map(formatValue).join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/** The reads field as text: a string, or a list of log fields. */
export function formatReads(r) {
  if (!r) return '';
  return Array.isArray(r) ? r.join(', ') : String(r);
}

/** The list for one frame, from the engine's own gauges when it has them. */
export function gaugesAt(engine, frame) {
  if (engine && typeof engine.gauges === 'function') {
    try {
      const g = engine.gauges(frame);
      if (Array.isArray(g) && g.length) return g;
    } catch { /* fall through to the page's own list */ }
  }
  return fallbackGauges(engine.signals(frame));
}

function fallbackGauges(S) {
  const pct = (x) => (isNum(x) ? Math.round(100 * x) + ' in 100' : null);
  return [
    { id: 'clock', name: 'Clock on the TV', reads: 'frame', value: S.clock },
    { id: 'pickP', name: 'Hole size: how sure the pick is', reads: 'ptok', value: S.pickP },
    { id: 'entropy', name: 'Stylus wander, dust, shadow softness: how unsure the bet is', reads: 'entropy', value: S.entropyN },
    { id: 'err', name: 'Error on tunes it never heard', reads: 'held', value: S.err },
    { id: 'warmth', name: 'Colour of the picture', reads: 'held', value: S.warmth },
    { id: 'share', name: 'NEW TUNES flags and counter', reads: 'heldAcc', value: pct(S.share) },
    { id: 'lr', name: 'STEP dial needle', reads: 'lr', value: S.lr },
    { id: 'limit', name: 'Where TOO FAR starts', reads: 'sharp', value: S.hatchGone ? 'gone' : S.limit },
    { id: 'ratio', name: 'Step against the edge (hairlines above 1)', reads: 'lr, sharp', value: S.ratio },
    { id: 'tear', name: 'Tearing', reads: 'held', value: S.tear },
    { id: 'blocks', name: 'Blocks', reads: 'held', value: S.blocks },
    { id: 'hands', name: "Maker's hands on the bench", reads: 'held', value: S.handsPresent },
    { id: 'window', name: "Neighbour's window lit", reads: 'held', value: S.windowLit },
    { id: 'hum', name: 'House hum', reads: 'lr', value: S.humLevel },
    { id: 'steps', name: 'LESSONS counter', reads: 'step', value: S.steps },
    { id: 'pick', name: 'Note punched', reads: 'tok', value: S.pickName },
  ];
}
