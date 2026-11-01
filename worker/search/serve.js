// GET /api/search?q=: the meaning half of search. No token: the answer is public data, bounded by the switch, a
// global and a per-query limiter, an hour's cache and the daily embedding cap. { v, hits: [{ slug, kind, anchor,
// heading, text, score }] }: the best 2 chunks of each of the best 8 posts. A spent cap answers 503 until 00:00 UTC.
import { flags, spend, today } from '../lib/flags.js';
import { json, status } from '../lib/http.js';
import { normalize, sha256 } from '../lib/text.js';
import { count } from './counts.js';
import { byPost, retrieve } from './retrieve.js';
import { indexVersion } from './sync.js';

const CACHE_FOR = 3600; // seconds
let spentOn = null; // the UTC day this isolate saw search_daily spent

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

  const key = new Request(`https://cache.internal/search?v=${v}&q=${encodeURIComponent(q)}`);
  const cached = await caches.default.match(key);
  if (cached) return json(await cached.json());
  if (spentOn === today()) return status(503);
  const hits = byPost(await retrieve(env, q, 20), 2, 8).map(({ title, voice, ...hit }) => hit);
  ctx.waitUntil(spend(env, 'search', 1, f.search_daily).then((ok) => { if (!ok) spentOn = today(); }));
  const body = { v, hits };
  ctx.waitUntil(caches.default.put(key, json(body, 200, { 'Cache-Control': `max-age=${CACHE_FOR}` })));
  return json(body);
}
