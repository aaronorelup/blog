// The hard word limits of the fact base (SCHEMA rule 5) and the character range the page may print.
// view.js runs misses() over the data at build time and fails the build on any. Pure: no DOM, no fs.
export const words = (s) => String(s).split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

export const LIMITS = { sentence: 18, paragraph: 12, myth: 10, tension: 8, label: 6, short: 4, verb: 3, quote: 40 };

const EIGHTEEN = new Set(['text', 'sentence', 'without', 'why', 'note', 'asks']);
const TWELVE = new Set(['definition', 'what', 'limit']);
const TEN = new Set(['myth', 'question']);
const SIX = new Set(['access', 'toName', 'subject', 'label', 'area', 'headline', 'usage', 'when', 'leadsOn']);

// The limit for `key` on `node`, or 0 when the schema sets none. `parentKey` names the field that holds `node`.
export function limitFor(key, node, parentKey) {
  if (EIGHTEEN.has(key)) return LIMITS.sentence;
  if (TWELVE.has(key)) return LIMITS.paragraph;
  if (TEN.has(key)) return LIMITS.myth;
  if (SIX.has(key)) return LIMITS.label;
  if (key === 'reason') return node.status === 'none' ? LIMITS.paragraph : LIMITS.sentence;
  if (key === 'line') return parentKey === 'tension' ? LIMITS.tension : LIMITS.label;
  if (key === 'short' || key === 'nameNote') return LIMITS.short;
  if (key === 'verb') return LIMITS.verb;
  if (key === 'quote') return LIMITS.quote;
  if (key === 'name') {
    if ('layer' in node || parentKey === 'parts') return LIMITS.label;          // a layer or a part
    if ('question' in node || 'sentence' in node) return LIMITS.short;         // a capability or a layer definition
  }
  return 0;
}

// Every string under `root` that breaks its limit: [{ path, limit, count, value }].
export function misses(root, at = '') {
  const found = [];
  (function walk(node, path, parentKey) {
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, parentKey));
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        const limit = limitFor(key, node, parentKey);
        const count = limit ? words(value) : 0;
        if (count > limit) found.push({ path: `${path}.${key}`, limit, count, value });
      } else walk(value, `${path}.${key}`, key);
    }
  })(root, at, '');
  return found;
}

// Code points the page may print: Latin-1 and general punctuation (the site's font check fails on others).
export const printable = (s) => [...String(s)].every((ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x20 && c <= 0xff) || (c >= 0x2000 && c <= 0x206f);
});

// Cuts a display string to `limit` words. Official names are never cut: callers pass only free text.
export function within(s, limit) {
  if (words(s) > limit) throw new Error(`ai-landscape: "${s}" is over its ${limit}-word limit`);
  return s;
}
