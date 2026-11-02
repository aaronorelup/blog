// The two requests' bodies as Blobs: prompt.js's escaped pieces around the build's fragments, which are fetched
// from ASSETS once and kept as bytes (the 2 packs, 64 docs and the catalog last used), never parsed or re-encoded.
// A Blob gives fetch its Content-Length and costs no CPU however big the prompt (docs/ASK.md "The request").
import { asset } from '../lib/build-files.js';
import { answerHead, CLOSE, OPEN, plannerHead, plannerUser, SEP, tail } from './prompt.js';

const kept = { pack: lru(2), doc: lru(64), catalog: lru(1), overview: lru(1) };

function lru(max) {
  const map = new Map();
  return (key, make) => {
    if (map.has(key)) {
      const v = map.get(key);
      map.delete(key);
      map.set(key, v);
      return v;
    }
    const v = make();
    v.catch(() => map.delete(key));
    map.set(key, v);
    if (map.size > max) map.delete(map.keys().next().value);
    return v;
  };
}

const piece = (env, file) => kept[file.slice(0, file.indexOf('-'))](file, () => asset(env, `/ask/${file}`).then((r) => r.arrayBuffer()));

// ix: corpus.js's index; pack: its index; extras: doc numbers, in order; user: the user message. Whole mode: the pack,
// the live notebook, the overview. Split mode: the pack, the catalog, the extras.
export async function answerBody(env, ix, { pack, extras, user }) {
  const { m } = ix;
  const files = [m.packs[pack].file, m.mode === 'whole' ? m.overview.file : m.catalog.file, ...extras.map((n) => ix.doc(n).file)];
  const [packBytes, closing, ...docs] = await Promise.all(files.map((f) => piece(env, f)));
  const extra = docs.length ? [SEP, OPEN, ...docs.flatMap((d, i) => (i ? [SEP, d] : [d])), CLOSE] : [];
  const middle = m.mode === 'whole' ? [...extra, SEP, closing] : [SEP, closing, ...extra];
  return new Blob([answerHead(m.mode), packBytes, ...middle, tail(user)]);
}

export async function plannerBody(env, ix, q) {
  return new Blob([plannerHead, await piece(env, ix.m.catalog.file), tail(plannerUser(q))]);
}
