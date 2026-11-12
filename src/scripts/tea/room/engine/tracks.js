// Keys and easing for the tea room's engine (pure). A key stands at a place in its chapter: `at` is a number (vh
// into the chapter) or the name of a mark on paper (`data-room-mark`), with an optional `off` in vh. `each: 'ep'`
// stands for one key at each of the marks ep-1 to ep-n, n being the chapter's item count. A track is defined for
// every scroll position: before its first key it holds the first value, after its last the last, eased between.

// The one ease between keys: smooth at both ends, no overshoot.
export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// The screens' pace: even in the middle, eased only over the first and last share e of the travel.
export function easeEnds(x, e = 0.2) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  if (x < e) return (x * x) / (2 * e * (1 - e));
  if (x > 1 - e) return 1 - ((1 - x) * (1 - x)) / (2 * e * (1 - e));
  return (x - e / 2) / (1 - e);
}

// Where a key stands in its chapter, in vh: a number, or a mark the layout measured. null when it names a mark the
// page does not have (that key is dropped, never guessed).
export function keyPlace(at, marks, off = 0) {
  if (typeof at === 'number' && Number.isFinite(at)) return at + off;
  if (typeof at === 'string' && marks && Number.isFinite(marks[at])) return marks[at] + off;
  return null;
}

// Authored keys to [{ u, key, item }], `each` expanded (item is 1..n for those, 0 for the rest), keys whose mark is
// missing dropped, sorted by place. The sort is stable, so keys at the same place keep their authored order and
// the later one wins from that place on. A key out of order (marks that fell differently) is moved, not refused.
export function placeKeys(keys, marks, n) {
  const out = [];
  for (const key of keys ?? []) {
    if (key.each) {
      for (let i = 1; i <= n; i++) {
        const u = keyPlace(`${key.each}-${i}`, marks, key.off ?? 0);
        if (u !== null) out.push({ u, key, item: i });
      }
    } else {
      const u = keyPlace(key.at, marks, key.off ?? 0);
      if (u !== null) out.push({ u, key, item: 0 });
    }
  }
  return out.sort((a, b) => a.u - b.u);
}

// The value of placed numeric keys [{ u, v }] at u: held before the first and after the last, eased between.
// Keys at the same place make a step, never a division by zero. fallback when there are no keys.
export function valueAt(keys, u, fallback = 0) {
  if (!keys || !keys.length) return fallback;
  if (u <= keys[0].u) return keys[0].v;
  const last = keys[keys.length - 1];
  if (u >= last.u) return last.v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (u >= a.u && u < b.u) return a.v + (b.v - a.v) * ease((u - a.u) / (b.u - a.u));
  }
  return last.v;
}

// Whether u is inside a span [from, to) of placed numbers.
export const within = (span, u) => span[0] <= u && u < span[1];

// A small integer hash to [0, 1): the same input always gives the same number (no Math.random anywhere).
export function hash01(k) {
  let h = (Math.floor(k) | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
