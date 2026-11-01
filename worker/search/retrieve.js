// The meaning half of search, and Ask's: a query embedded with the model the index was built with (the manifest's)
// and the nearest chunks from Vectorize, with the metadata sync.js stored (search) or as ids only (Ask's nearest()).
import { buildJson } from '../lib/build-files.js';

export const MANIFEST = '/search/manifest.json';

export async function embed(env, texts) {
  const { model } = await buildJson(env, MANIFEST);
  return (await env.AI.run(model, { text: texts })).data;
}

// The topK nearest chunks, best first: [{ slug, kind, anchor, heading, text, title, voice, score }], voice 'claude' on
// a post or notes page Claude tells as "I" and undefined on Aaron's.
export async function retrieve(env, q, topK) {
  const [vector] = await embed(env, [q]);
  const { matches } = await env.SEARCH_INDEX.query(vector, { topK, returnMetadata: 'all' });
  return matches.map(({ score, metadata: m }) => (
    { slug: m.s, kind: m.k, anchor: m.a, heading: m.h, text: m.t, title: m.T, voice: m.v, score }));
}

// The topK nearest chunks' ids (AO-063:4, AO-063n:4 for a notes page), best first: Vectorize's ids-only query, whose
// topK may be 100 where one with metadata stops at 50.
export async function nearest(env, vector, topK) {
  const { matches } = await env.SEARCH_INDEX.query(vector, { topK, returnMetadata: 'none' });
  return matches.map((m) => m.id);
}

// The best `per` chunks of each of the best `posts` posts, in score order (a post's notes count as the post).
export function byPost(chunks, per, posts) {
  const seen = new Map();
  return chunks.filter(({ slug }) => {
    const n = seen.get(slug) ?? 0;
    if (n >= per || (!n && seen.size >= posts)) return false;
    seen.set(slug, n + 1);
    return true;
  });
}
