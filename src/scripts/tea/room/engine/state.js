// The frame as window.__room.state() reports it (pure): every number rounded to a hundredth, -0 as 0, and what is
// not the page's state (the ambient clock values) left out. The DOM read-back in boot.js must give exactly this
// for the frame apply.js last wrote, so the e2e purity test can compare a page with frame() itself.
export const round = (x) => {
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
};

export function roundDeep(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? round(v) : v;
  if (Array.isArray(v)) return v.map(roundDeep);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, roundDeep(x)]));
  return v;
}

export function stateOf(f) {
  const { ambient, ...state } = f;
  return roundDeep(state);
}
