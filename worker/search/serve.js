// GET /api/search?q=: the meaning half of search. No token: the answer is public data, bounded by the switch, a
// global and a per-query limiter, an hour's cache and the daily embedding cap. { v, hits: [{ id, title, url, slug,
// kind, anchor, heading, text, score }] }: the best 2 chunks of each of the best 8 posts, each citable on its own (id
// the AO id, url the page and its #anchor). A spent cap answers 503 until 00:00 UTC.
import { flags, spend, today } from '../lib/flags.js';
import { json, status } from '../lib/http.js';
import { normalize, sha256 } from '../lib/text.js';
import { count } from './counts.js';
import { buildJson } from '../lib/build-files.js';
import { byPost, MANIFEST, retrieve } from './retrieve.js';
import { indexVersion } from './sync.js';

const CACHE_FOR = 3600; // seconds
const SCHEMA = 2;       // the answer's shape, in the cache key: a cached answer of an older shape is never served
const SITE = 'https://aaronorelup.com';
let spentOn = null; // the UTC day this isolate saw search_daily spent

// Only chunks of a doc this deploy's manifest lists ('<kind>:<slug>'). The index and the cached answers trail a
// deploy by a minute or two (sync.js drops an unlisted post's vectors on its next run, and v moves a run later),
// and an unlisted or renamed post must be gone from the answers at once.
const listed = (docs, chunks) => chunks.filter(({ kind, slug }) => Object.hasOwn(docs, `${kind}:${slug}`));

// A chunk as the answer gives it: its AO id from the vector id (AO-083:4, AO-083n:4 for the notes page), its doc's
// title and the page to cite; never the voice or the vector id.
const citable = ({ vid = '', title, slug, kind, anchor, heading, text, score }) => ({
  id: String(vid).split(':')[0].replace(/n$/, ''), title,
  url: `${SITE}/ledger/${slug}/${kind === 'notes' ? 'notes/' : ''}${anchor ? `#${anchor}` : ''}`,
  slug, kind, anchor, heading, text, score,
});

export async function serve(request, env, ctx) {
  const [f, v] = await Promise.all([flags(env), indexVersion(env)]);
  if (f.search !== 'on') return status(503);
  const q = normalize(new URL(request.url).searchParams.get('q') ?? '');
  if (q.length < 3 || q.length > 200) return status(400);
  const [all, one] = await Promise.all([
    env.SEARCH_ALL.limit({ key: 'all' }),
    env.SEARCH_Q.limit({ key: (await sha256(q)).slice(0, 16) }),
  ]);
  if (!all.success || !one.success) return status(429);
  ctx.waitUntil(count(env, 'search', q));

  const { docs } = await buildJson(env, MANIFEST);
  const key = new Request(`https://cache.internal/search?s=${SCHEMA}&v=${v}&q=${encodeURIComponent(q)}`);
  const cached = await caches.default.match(key);
  if (cached) {
    const was = await cached.json();
    return json({ ...was, hits: listed(docs, was.hits) });
  }
  if (spentOn === today()) return status(503);
  const hits = byPost(listed(docs, await retrieve(env, q, 20)), 2, 8).map(citable);
  ctx.waitUntil(spend(env, 'search', 1, f.search_daily).then((ok) => { if (!ok) spentOn = today(); }));
  const body = { v, hits };
  ctx.waitUntil(caches.default.put(key, json(body, 200, { 'Cache-Control': `max-age=${CACHE_FOR}` })));
  return json(body);
}
