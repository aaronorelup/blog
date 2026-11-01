// POST /api/ask { q }, header X-AO-Session: Ask Goobie. At most one DeepSeek call a question, and only past the
// token, the switch, two limiters, the score floor, the answer cache and the daily cap. 200 { answer, cites,
// related, cached } or { answer: null, reason: 'not-found' | 'resting' | 'busy' | 'off', related }; else a status.
import { flags, spend } from '../lib/flags.js';
import { json, readJson, status } from '../lib/http.js';
import { verify } from '../lib/session.js';
import { ensure } from '../lib/sql.js';
import { normalize, sha256 } from '../lib/text.js';
import { count } from '../search/counts.js';
import { retrieve } from '../search/retrieve.js';
import { complete, MODEL } from './deepseek.js';
import { cite, messages } from './prompt.js';
import SCHEMA from './ask.sql';

const MAX_BODY = 2048;
const KEEP_FOR = 7 * 864e5; // a cached answer, in ms
const EXCERPTS = { chunks: 6, chars: 6000 };

// The chunks an answer may use: those scoring at least min, best first, at most 6 or 6,000 characters.
function excerpts(chunks, min) {
  const out = [];
  let chars = 0;
  for (const c of chunks) {
    if (c.score < min || out.length === EXCERPTS.chunks || chars + c.text.length > EXCERPTS.chars) break;
    out.push(c);
    chars += c.text.length;
  }
  return out;
}
// The distinct posts retrieved, the cited ones first.
const relatedOf = (chunks, cited = [], max = 4) => [...new Set([...cited, ...chunks.map((c) => c.slug)])].slice(0, max);
const reply = (reason, related) => json({ answer: null, reason, related });

export async function serve(request, env, ctx) {
  const body = await readJson(request, MAX_BODY);
  if (!body) return status(413);
  const session = await verify(env, request.headers.get('X-AO-Session'));
  if (!session) return status(401);
  const f = await flags(env);
  if (f.ask !== 'on' || !env.DEEPSEEK_API_KEY) return reply('off', []);
  const q = normalize(typeof body.q === 'string' ? body.q : '');
  if (q.length < 3 || q.length > 300) return status(400);
  const [one, all] = await Promise.all([env.ASK_LIMIT.limit({ key: session.s }), env.ASK_ALL.limit({ key: 'all' })]);
  if (!one.success || !all.success) return status(429);
  ctx.waitUntil(count(env, 'ask', q));

  const chunks = await retrieve(env, q, 12);
  const used = excerpts(chunks, f.ask_min_score);
  if (!used.length) {
    console.log('ask not-found', chunks[0]?.score ?? 0);
    return reply('not-found', relatedOf(chunks, [], 3));
  }
  // { answer, cites } is cached; related comes from this retrieval, so it never names a post since unlisted.
  const answered = (a, cached) => json({ ...a, related: relatedOf(chunks, a.cites.map((c) => c.slug)), cached });
  const prompt = messages(q, used);
  const key = await sha256(MODEL + JSON.stringify(prompt)); // moves with the question, its excerpts, or the prompt
  await ensure(env.DB, SCHEMA);
  const hit = await env.DB.prepare('SELECT body FROM ask_cache WHERE key = ?1 AND at > ?2')
    .bind(key, new Date(Date.now() - KEEP_FOR).toISOString()).first('body');
  if (hit) return answered(JSON.parse(hit), true);
  if (!(await spend(env, 'ask', 1, f.ask_daily))) return reply('resting', relatedOf(chunks));

  const text = await complete(env, prompt);
  if (!text) return reply('busy', relatedOf(chunks));
  const a = cite(text, used);
  ctx.waitUntil(env.DB.prepare('INSERT OR REPLACE INTO ask_cache (key, body, at) VALUES (?1, ?2, ?3)')
    .bind(key, JSON.stringify(a), new Date().toISOString()).run());
  return answered(a, false);
}
