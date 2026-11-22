// The marks on the time bar: what the rules make happen in THIS ending, read from engine.events (and engine.cues for
// the spoken lines). Nothing here decides anything: it picks which of the engine's events to show and words them.

import { clockText } from '../time.js';

// kind -> [class, label, first only]
const KINDS = {
  'chalk': ['k-bench', () => 'The chalk mark at the measured limit', false],
  'hands-out': ['k-room', () => 'The hands leave the bench', false],
  'hands-back': ['k-room', () => 'The hands come back', false],
  'window-dark': ['k-room', () => "The neighbour's window goes dark", false],
  'window-lit': ['k-room', () => "The neighbour's window lights again", false],
  'hum-off': ['k-room', () => 'The house hum stops', false],
  'hairlines-on': ['k-harm', () => 'First hairline in the strip', true],
  'tears-on': ['k-harm', () => 'The picture starts to tear', true],
  'blocks-on': ['k-harm', () => 'Blocks in the picture', true],
  'hatch-gone': ['k-harm', () => 'The TOO FAR hatching disappears', true],
  'first-certain': ['k-harm', () => 'First perfectly sure pick', true],
  'lid': ['k-bench', (e) => (/stays open/.test(e.what || '') || e.values?.handsIn === false ? 'The lid stays open' : 'The lid closes'), false],
};

/** [{ frame, cls, label }] sorted by frame, for one engine. */
export function marksFor(engine) {
  const out = [];
  const seen = new Set();
  for (const e of engine.events || []) {
    if (e.kind === 'line') {
      const text = (e.what || '').replace(/^"|"$/g, '');
      out.push({ frame: e.frame, cls: 'k-line', label: `The maker: "${text}"` });
      continue;
    }
    const k = KINDS[e.kind];
    if (!k) continue;
    if (k[2]) { if (seen.has(e.kind)) continue; seen.add(e.kind); }
    // a tear at frame 0 is the picture's starting state, not something that happens
    if (e.kind === 'tears-on' && e.frame === 0) { seen.delete(e.kind); continue; }
    out.push({ frame: e.frame, cls: k[0], label: k[1](e) });
  }
  // no line events at all (an older engine): fall back to the cues
  if (!out.some((m) => m.cls === 'k-line')) {
    for (const c of engine.cues || []) out.push({ frame: c.frame, cls: 'k-line', label: `The maker: "${c.text}"` });
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
