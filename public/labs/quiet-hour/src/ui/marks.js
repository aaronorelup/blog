// The marks on the time bar: what the rules make happen in THIS ending, read from engine.events (and engine.cues for
// the spoken lines). Nothing here decides anything: it picks which of the engine's events to show, words them, and
// shows the log values the engine says caused each one (e.values), so a reader sees which number did it.

import { clockText } from '../time.js';

const num = (x) => (typeof x === 'number' && Number.isFinite(x)
  ? (Math.abs(x) < 5e-4 ? '0' : String(Number(x.toPrecision(3)))) : null);
const has = (x) => typeof x === 'number' && Number.isFinite(x);

// kind -> [class, label, first only]. 'once-last' marks only the last of its kind, and only if nothing of the
// paired kind comes after it (the tears that heal for good).
const KINDS = {
  'chalk': ['k-bench', (e) => `The chalk mark at the limit measured at 20:00${has(e.values?.limit20) ? `: ${e.values.limit20.toFixed(2)}` : ''}`, false],
  'grip-on': ['k-bench', (e) => (has(e.values?.lr) && has(e.values?.lrBefore)
    ? `The maker turns the STEP knob from ${num(e.values.lrBefore)} to ${num(e.values.lr)}` : 'The maker turns the STEP knob'), true],
  'hands-out': ['k-room', () => 'The hands leave the bench', false],
  'hands-back': ['k-room', () => 'The hands come back', false],
  'window-dark': ['k-room', () => "The neighbour's window goes dark", false],
  'window-lit': ['k-room', () => "The neighbour's window lights again", false],
  'hum-off': ['k-room', () => 'The house hum stops', false],
  'hum-on': ['k-room', () => 'The house hum comes back', false],
  'warmth-full': ['k-bench', () => 'The picture reaches full colour', true],
  'warmth-zero': ['k-harm', () => 'The picture has gone grey', true],
  'hairlines-on': ['k-harm', () => 'First hairline in the strip', true],
  'tears-on': ['k-harm', () => 'The picture starts to tear', true],
  'tears-off': ['k-room', () => 'The tears heal', 'once-last'],
  'blocks-on': ['k-harm', () => 'Blocks in the picture', true],
  'hatch-gone': ['k-harm', () => 'The TOO FAR hatching disappears', true],
  'first-certain': ['k-harm', () => 'First perfectly sure pick', true],
  'lid': ['k-bench', (e) => (/stays open/.test(e.what || '') || e.values?.handsIn === false ? 'The lid stays open' : 'The lid closes'), false],
};
const PAIR = { 'tears-off': 'tears-on' };

// the log values that caused an event, as "field value" pairs (the line's own bookkeeping left out)
const SKIP = new Set(['seconds', 'recorded', 'waitedNotes', 'performed', 'gripping', 'handsIn', 'latched', 'times']);
const FIELD = { ln32: 'ln 32', tenLn32: '10 x ln 32', limit20: 'limit at 20:00', share20: 'share at 20:00', bestSoFar: 'best error so far',
  lrBefore: 'lr before', err6: 'error of 6 notes', meanVel6: 'mean velocity of 6', median3: 'median of 3 sharp', limitNow: 'edge now',
  ratioNow: 'step / edge', massInKey: 'mass in key', share: 'heldAcc', err: 'held', lr287: 'lr at 19:56', lr288: 'lr at 20:00' };
export function whyText(e) {
  if (e.format) return 'A fixed moment, the same in every ending.';
  const out = [];
  for (const [k, v] of Object.entries(e.values || {})) {
    if (SKIP.has(k)) continue;
    let t = null;
    if (Array.isArray(v)) { const xs = v.map(num).filter((x) => x !== null); if (xs.length) t = xs.length > 2 ? `${xs[0]} … ${xs[xs.length - 1]} (${xs.length} notes)` : xs.join(', '); }
    else t = typeof v === 'number' ? num(v) : null;
    if (t === null) continue;
    out.push(`${FIELD[k] || k} ${t}`);
  }
  return out.length ? `From the log: ${out.slice(0, 4).join(', ')}` : '';
}

/** [{ frame, cls, label, why }] sorted by frame, for one engine. */
export function marksFor(engine) {
  const out = [];
  const seen = new Set();
  const events = engine.events || [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.kind === 'line') {
      const text = (e.what || '').replace(/^"|"$/g, '');
      out.push({ frame: e.frame, cls: 'k-line', label: `The maker: "${text}"`, why: whyText(e) });
      continue;
    }
    const k = KINDS[e.kind];
    if (!k) continue;
    if (k[2] === 'once-last') {
      // only the last one, and only if its pair never comes back after it
      if (events.slice(i + 1).some((x) => x.kind === e.kind || x.kind === PAIR[e.kind])) continue;
    } else if (k[2]) { if (seen.has(e.kind)) continue; seen.add(e.kind); }
    // a tear at frame 0 is the picture's starting state, not something that happens
    if (e.kind === 'tears-on' && e.frame === 0) { seen.delete(e.kind); continue; }
    out.push({ frame: e.frame, cls: k[0], label: k[1](e), why: whyText(e) });
  }
  // no line events at all (an older engine): fall back to the cues
  if (!out.some((m) => m.cls === 'k-line')) {
    for (const c of engine.cues || []) out.push({ frame: c.frame, cls: 'k-line', label: `The maker: "${c.text}"`, why: '' });
  }
  out.sort((a, b) => a.frame - b.frame);
  for (const m of out) m.clock = clockText(Math.min(m.frame, 2159));
  return out;
}

/** Marks closer than `minFrames` merged into groups: [{ frame, cls, items: [mark] }]. */
export function groupMarks(marks, minFrames) {
  const groups = [];
  for (const m of marks) {
    const g = groups[groups.length - 1];
    if (g && m.frame - g.last <= minFrames) { g.items.push(m); g.last = m.frame; }
    else groups.push({ frame: m.frame, last: m.frame, items: [m] });
  }
  const rank = { 'k-harm': 0, 'k-room': 1, 'k-bench': 2, 'k-line': 3 };
  for (const g of groups) g.cls = g.items.map((m) => m.cls).sort((a, b) => rank[a] - rank[b])[0];
  return groups;
}
