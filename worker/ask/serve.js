// POST /api/ask { q }, header X-AO-Session: RAG Goobie (docs/ASK.md). Before any paid call: the size, the token, the
// switch, the question, two limiters, the answer cache, then the day's question count and the dollar cap, which holds
// this question's worst case until run.js settles it. Bare statuses until then; after, one stream of events
// (events.js), ending in one 'answer' or one 'end' ({ reason: off | resting | busy, related }).
import { flags, NO_CAP, spend, today } from '../lib/flags.js';
import { readJson, status } from '../lib/http.js';
import { verify } from '../lib/session.js';
import { normalize } from '../lib/text.js';
import { count } from '../search/counts.js';
import { cached, keyOf } from './cache.js';
import { corpus } from './corpus.js';
import { once, sse } from './events.js';
import { ranking, relatedOf, search } from './rank.js';
import { run } from './run.js';

const MAX_BODY = 2048;

export async function serve(request, env, ctx) {
  const body = await readJson(request, MAX_BODY);
  if (!body) return status(413);
  const session = await verify(env, request.headers.get('X-AO-Session'));
  if (!session) return status(401);
  const f = await flags(env);
  if (f.ask !== 'on' || !env.DEEPSEEK_API_KEY) return once('end', { reason: 'off', related: [] });
  const q = normalize(typeof body.q === 'string' ? body.q : '');
  if (q.length < 3 || q.length > 300) return status(400);
  const [one, all] = await Promise.all([env.ASK_LIMIT.limit({ key: session.s }), env.ASK_ALL.limit({ key: 'all' })]);
  if (!one.success || !all.success) return status(429);
  ctx.waitUntil(count(env, 'ask', q));

  const start = Date.now();
  const ix = await corpus(env);
  const key = await keyOf(ix.m, f, q);
  const hit = await cached(env, key, ix.m);
  if (hit) {
    const { live, ...answer } = hit;
    return once('answer', { ...answer, cached: true, took: Date.now() - start });
  }
  const day = today();
  if (!(await spend(env, 'ask', 1, f.ask_daily, day))) return resting(env, f, ix, q);
  if (!(await spend(env, 'ask_usd', ix.m.reserve.plan + ix.m.reserve.answer, Math.round(f.ask_daily_usd * 1e6), day))) {
    ctx.waitUntil(spend(env, 'ask', -1, NO_CAP, day));
    return resting(env, f, ix, q);
  }
  const out = sse();
  ctx.waitUntil(run(env, { q, f, ix, out, key, day, start }));
  return out.response;
}

// A spent cap: the closest posts from one lookup of the question (none once search_daily is spent too).
async function resting(env, f, ix, q) {
  console.log('ask resting');
  const lists = await search(env, f, [q]);
  return once('end', { reason: 'resting', related: lists ? relatedOf(ix, ranking(ix, { lists }).fused.filter((n) => !ix.live.includes(n))) : [] });
}
