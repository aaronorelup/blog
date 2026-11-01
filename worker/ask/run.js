// One question once its stream is open and its worst case reserved (serve.js): the planner beside the question's
// search, the planner's queries searched, the lists fused, the context chosen, the answer streamed with its cites;
// then both calls settled from their reported usage, the answer cached and one log line (never the question). Each
// step is bounded and a failed one is skipped; only a failed answer call ends the stream 'busy' (docs/ASK.md).
import { cost } from '../../src/lib/ask/price.js';
import { NO_CAP, spend } from '../lib/flags.js';
import { answerBody } from './body.js';
import { keep } from './cache.js';
import { cite, citer } from './cite.js';
import { contextOf, PARAMS } from './context.js';
import { call } from './deepseek.js';
import { plan } from './plan.js';
import { ranking, relatedOf, search } from './rank.js';

// What a call bills, in micro-dollars: its usage at its start's price; a refused call nothing; one whose usage never
// came (a timeout, a cut stream) its whole share of the reservation.
const billed = (r, at, share) => (r.usage ? cost(r.usage, at) : r.status && r.status !== 200 ? 0 : share);
const k = (t) => `${Math.round(t / 1000)}k`;

export async function run(env, { q, f, ix, out, key, day, start, variant }) {
  const { m } = ix;
  const { send } = out;
  const slug = (n) => ix.doc(n).slug;
  try {
    send('start', { posts: m.counts.posts, notes: m.counts.notes, mode: m.mode, packs: m.packs.length });
    const [planned, asked] = await Promise.all([plan(env, ix, q), search(env, f, [q])]);
    const p = planned.plan;
    send('plan', p ? { topics: p.topics, picks: p.picks.length } : { skipped: true });
    const more = p?.queries.length ? await search(env, f, p.queries) : null;
    const lists = [...(asked ?? []), ...(more ?? [])];
    const rank = ranking(ix, { picks: p?.picks ?? [], lists });
    send('found', lists.length ? { searches: lists.length, passages: rank.chunks.length, posts: rank.fused.length,
      matched: rank.matched.length, ranked: rank.R.slice(0, 20).map(slug) } : { skipped: true });
    const c = contextOf(ix, rank, { q, extraTokens: f.ask_extra_tokens, blind: !lists.length && !p?.picks.length, variant });
    send('read', { given: c.given, of: c.of, tokens: c.tokens, focus: rank.focus.map(slug) });

    const resolve = (mark) => ix.resolve(mark, c.inPrompt);
    const streamed = citer(resolve);
    const emit = ({ text, cites }) => {
      for (const x of cites) send('cite', x);
      if (text) send('text', { d: text });
    };
    const at = Date.now();
    let wrote = false;
    const r = await call(env, await answerBody(env, ix, { ...c, variant }), {
      stream: true, first: PARAMS.answer.first, total: PARAMS.answer.total,
      onText: (d) => {
        if (!wrote) send('write');
        wrote = true;
        emit(streamed.push(d));
      },
    });
    const spent = billed(planned, planned.at, m.reserve.plan) + billed(r, at, m.reserve.answer);
    const ok = r.status === 200 && r.finish === 'stop' && r.text.trim();
    let body = null;
    if (!ok) send('end', { reason: 'busy', related: relatedOf(ix, rank.hint) });
    else {
      emit(streamed.end());
      const a = cite(r.text, resolve);
      const cited = a.cites.map((x) => ix.n(x.slug));
      const usage = { tokens: r.usage?.prompt_tokens ?? c.tokens, hit: r.usage?.prompt_cache_hit_tokens ?? 0,
        out: r.usage?.completion_tokens ?? 0, usd: spent / 1e6 };
      body = { answer: a.answer, cites: a.cites, related: relatedOf(ix, [...cited, ...rank.hint]), took: Date.now() - start, usage };
      send('answer', { ...body, cached: false });
      const drew = new Set([...rank.focus, ...cited]);
      const live = ix.live.filter((n) => drew.has(n));
      if (live.length) body.live = Object.fromEntries(live.map((n) => [n, m.live[n]]));
    }
    await spend(env, 'ask_usd', spent - m.reserve.plan - m.reserve.answer, NO_CAP, day);
    if (body) await keep(env, key, body);
    const share = r.usage?.prompt_tokens ? r.usage.prompt_cache_hit_tokens / r.usage.prompt_tokens : 0;
    console.log(['ask', m.mode, `${Date.now() - start} ms`, `plan ${p ? 'ok' : 'failed'}`,
      lists.length ? `found ${rank.fused.length}` : 'found skipped', `given ${c.given}`, k(r.usage?.prompt_tokens ?? c.tokens),
      `${(100 * share).toFixed(1)}% hit`, `$${(spent / 1e6).toFixed(4)}`, ok ? 'answered' : `busy ${r.status || r.error} ${r.finish ?? ''}`.trim(),
      ...(ok && share < 0.5 ? ['cold'] : []), ...(out.gone() ? ['detached'] : [])].join(' '));
  } catch (e) {
    console.error('ask', e.message);
  } finally {
    out.close();
  }
}
