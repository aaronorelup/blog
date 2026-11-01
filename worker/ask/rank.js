// RAG Goobie's retrieval (docs/ASK.md "Retrieval"): the question and the planner's queries embedded in one Workers
// AI call each (counted in search_daily) and looked up in Vectorize as ids; then, pure, the lists fused by
// reciprocal rank at chunk level and R: the planner's picks, the fused docs, every other listed doc newest first.
// The live notebook enters R only when the planner picks it (it would take a top-6 slot in 23% of questions).
import { spend } from '../lib/flags.js';
import { embed, nearest } from '../search/retrieve.js';

export const RANK = { k: 60, topK: 100, timeout: 5e3, focusMore: 6, hint: 6, ranked: 20, close: 20, closeOne: 5, related: 4 };

const within = (ms, p) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error(`${ms} ms`)), ms))]);
const unique = (xs) => [...new Set(xs)];

// One id list per text, or null when search_daily is spent or a call fails or runs past 5 s.
export async function search(env, f, texts) {
  if (!texts.length || !(await spend(env, 'search', 1, f.search_daily))) return null;
  try {
    const vectors = await within(RANK.timeout, embed(env, texts));
    return await Promise.all(vectors.map((v) => within(RANK.timeout, nearest(env, v, RANK.topK))));
  } catch (e) {
    console.log('ask rank failed', e.message);
    return null;
  }
}

// ix: corpus.js's index. picks: the plan's slugs. lists: id lists (none when search failed).
export function ranking(ix, { picks = [], lists = [] }) {
  const score = new Map();
  for (const list of lists) list.forEach((id, i) => score.set(id, (score.get(id) ?? 0) + 1 / (RANK.k + i + 1)));
  const chunks = [...score].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const fused = unique(chunks.map(ix.ofId).filter((n) => n !== null));
  const picked = picks.map(ix.n);
  const live = new Set(ix.live.filter((n) => !picked.includes(n)));
  const R = unique([...picked, ...fused, ...[...ix.order].reverse()]).filter((n) => !live.has(n));
  // Posts with a chunk near the top of at least two lists (of one list, its top 5), and the picks.
  const [top, need] = lists.length > 1 ? [RANK.close, 2] : [RANK.closeOne, 1];
  const near = new Map();
  for (const list of lists) for (const n of unique(list.slice(0, top).map(ix.ofId))) near.set(n, (near.get(n) ?? 0) + 1);
  const matched = unique([...picked, ...[...near].filter(([n, c]) => n !== null && c >= need && !live.has(n)).map(([n]) => n)]);
  return { R, chunks, fused, picked, matched, focus: R.slice(0, picked.length + RANK.focusMore), hint: R.slice(0, RANK.hint) };
}

// The posts to show under a note: the cited ones, then the hint's, at most 4.
export const relatedOf = (ix, ns) => unique(ns).slice(0, RANK.related).map((n) => ix.doc(n).slug);
