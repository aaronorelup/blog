// The page's one event bus. Modules never import each other; when the hero needs to know a kind
// word was pointed at, or Noticed wants to wait for the gate to settle, it hears it here.
//
//   brush      {kind, from:'term'|'pile'}   light up that kind (null = nothing lit)
//   mode       {}                           day/night changed; ctx.palette() is already fresh
//   route      {route}                      after router.go
//   gate:done  {rangeKey}                   the hero's replay settled

export function createBus() {
  const map = new Map();
  return {
    on(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      return () => map.get(type)?.delete(fn);
    },
    emit(type, detail = {}) {
      const set = map.get(type);
      if (!set) return;
      // a copy, so a listener that unsubscribes itself doesn't skip the next one
      for (const fn of [...set]) {
        try { fn(detail); } catch (e) { console.error('[stats] bus listener for ' + type + ' failed', e); }
      }
    },
  };
}
