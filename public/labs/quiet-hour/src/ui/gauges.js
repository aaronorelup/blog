// The x-ray's list. engine.gauges(frame) -> [{ id, name, reads, value, rule }] when the engine has it; until then (or if it
// is missing) the same list is built here from engine.signals(frame), so the page never shows less than the film uses.
// Nothing here changes the film: it only reads, and words the engine's values for a reader (readable()).

const isNum = (x) => typeof x === 'number' && Number.isFinite(x);

/** A number for a reader: 3 significant figures, anything under 0.0005 either way is 0. */
function readableNumber(v) {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'not a number' : (v > 0 ? 'infinite' : 'minus infinite');
  if (Math.abs(v) < 5e-4) return '0';
  if (Number.isInteger(v)) return String(v);
  if (Math.abs(v) >= 1000) return v.toFixed(0);
  return String(Number(v.toPrecision(3)));
}

/**
 * The engine's value text, worded for a reader. The engine writes its numbers to 3 significant figures, so a stylus at
 * rest reads "wander -2.12e-29" and a value it cannot measure reads "-". Here: tiny numbers are 0, a minus zero is 0,
 * a missing value is a word, and "1 rings" is "1 ring". The film's own pixels never pass through this.
 */
export function readable(text) {
  if (typeof text !== 'string') return formatValue(text);
  let t = text
    // numbers in e-notation (only tiny or huge ones come out that way) and decimals under 0.0005 either way
    // (no lookbehind: older Safari cannot parse it)
    .replace(/(^|[^\w.])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?![\w.])/gi, (all, pre, m) => {
      if (/e/i.test(m)) return pre + readableNumber(Number(m));
      return pre + (m.includes('.') && Math.abs(Number(m)) < 5e-4 ? '0' : m);
    })
    // a minus zero left by rounding
    .replace(/(^|[^\w.])-0(?![\d.])/g, '$10')
    // a value the engine could not give
    .replace(/step \/ edge -(?=$|[,)])/g, 'no edge to measure')
    .replace(/(^|\s|\()-(?=$|[,)])/g, '$1none')
    .replace(/\bNaN\b/g, 'not a number')
    .replace(/\b1 (ring|band|tile)s\b/g, '1 $1');
  if (t === '' || t === '-') t = 'none';
  return t;
}

/** A value as the x-ray shows it: numbers to 3 significant figures, booleans as yes or no, nothing as "none". */
export function formatValue(v) {
  if (v === null || v === undefined) return 'none';
  if (typeof v === 'string') return readable(v);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (typeof v === 'number') return readableNumber(v);
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
    { id: 'clock', name: 'Clock on the TV', reads: [], value: S.clock },
    { id: 'pickP', name: 'Hole size: how sure the pick is', reads: ['ptok'], value: S.pickP },
    { id: 'entropy', name: 'Stylus wander, dust, shadow softness: how unsure the bet is', reads: ['entropy'], value: S.entropyN },
    { id: 'err', name: 'Error on tunes it never heard', reads: ['held'], value: S.err },
    { id: 'warmth', name: 'Colour of the picture', reads: ['held'], value: S.warmth },
    { id: 'share', name: 'NEW TUNES flags and counter', reads: ['heldAcc'], value: pct(S.share) },
    { id: 'lr', name: 'STEP dial needle', reads: ['lr'], value: S.lr },
    { id: 'limit', name: 'Where TOO FAR starts', reads: ['sharp'], value: S.limit === null ? 'gone' : S.limit },
    { id: 'ratio', name: 'Step against the edge (hairlines above 1)', reads: ['lr', 'sharp'], value: S.ratioNow },
    { id: 'tear', name: 'Tearing', reads: ['held'], value: S.tear },
    { id: 'blocks', name: 'Blocks', reads: ['held'], value: S.blocks },
    { id: 'hands', name: "Maker's hands on the bench", reads: ['held'], value: S.handsIn },
    { id: 'window', name: "Neighbour's window lit", reads: ['held'], value: S.windowLit },
    { id: 'hum', name: 'House hum', reads: ['lr'], value: S.humLevel },
    { id: 'steps', name: 'LESSONS counter', reads: ['step'], value: S.stepsText },
    { id: 'pick', name: 'Note punched', reads: ['tok'], value: S.pickName },
  ];
}
