// The page's state: which days (range), pages or files (unit), the reader's clock or UTC (tz),
// and where the reader is (route). One object, shallow-merged; listeners run synchronously in
// the order they subscribed, so the hero always hears a range change before the chapters do.

const same = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
};

export function createStore(initial) {
  let state = { ...initial };
  const subs = [];
  return {
    get: () => state,
    set(patch, opts = {}) {
      if (!patch) return;
      let changed = false;
      const next = { ...state };
      for (const k of Object.keys(patch)) {
        // range and route are small objects: compare their fields, so setting the same range
        // twice is a no-op instead of a full re-render
        if (!same(state[k], patch[k])) { next[k] = patch[k]; changed = true; }
      }
      if (!changed) return;
      const prev = state;
      state = next;
      for (const fn of subs.slice()) {
        try { fn(state, prev, opts); } catch (e) { console.error('[stats] store listener failed', e); }
      }
    },
    subscribe(fn) {
      subs.push(fn);
      return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); };
    },
  };
}
