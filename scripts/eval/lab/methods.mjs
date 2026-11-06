// The Goobie lab's three ways to give the model the blog, one question each, recorded step by step: inContext (every
// post in full in one prompt, which DeepSeek's prefix cache keeps), rag (the question embedded, the 8 nearest chunks,
// one answer from them) and agent (the model calls list_posts, grep and read in a loop until it answers). Same rules,
// model and settings for all three (words.mjs); every answer goes through the live Ask's cite pass (worker/ask/cite.js).
import { performance } from 'node:perf_hooks';
import { runTool, TOOLS } from '../../../src/lib/goobie-lab/tools.js';
import { cite } from '../../../worker/ask/cite.js';
import { embed, EMBED_USD_PER_M, step, streamed } from './llm.mjs';
import { LAST_STEP, passages, question, rules, SETTINGS } from './words.mjs';

export const RAG_K = 8;          // chunks given to the answer
export const RAG_KEEP = 25;      // nearest chunks kept in the record (the page's k slider)
export const AGENT_TURNS = 12;   // model turns before it must answer

const usageOf = (u) => ({ in: u?.prompt_tokens ?? 0, hit: u?.prompt_cache_hit_tokens ?? 0, out: u?.completion_tokens ?? 0 });
const answerOf = (raw, corpus) => ({ raw, ...cite(raw, corpus.resolve) });
const est = (chars) => Math.ceil(chars / 3.5);

export async function inContext(corpus, q, { pack, tag }) {
  const system = `${rules('context', { posts: corpus.posts.length })}\n\n${pack}`;
  const r = await streamed(`${tag}:context`, { ...SETTINGS, messages: [{ role: 'system', content: system }, { role: 'user', content: question(q) }] });
  const u = usageOf(r.usage);
  return { method: 'context', steps: [
    { kind: 'load', posts: corpus.posts.length, chars: pack.length, tokens: u.in },
    { kind: 'answer', ms: r.ms, firstMs: r.firstMs, usage: u, usd: r.usd, finish: r.finish },
  ], answer: answerOf(r.text, corpus),
  stats: { ms: r.ms, firstMs: r.firstMs, ...u, usd: r.usd, calls: 1, window: u.in + u.out } };
}

const cosine = (a, b) => {
  let d = 0; let x = 0; let y = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; }
  return d / Math.sqrt(x * y);
};

// index: { chunks, vectors } from chunksOf() and embed(), built once.
export async function rag(corpus, q, { index, tag }) {
  const t0 = performance.now();
  const e = await embed([q], { cache: false });
  const t1 = performance.now();
  const scored = index.chunks.map((c, i) => ({ c, score: cosine(e.vectors[0], index.vectors[i]) })).sort((a, b) => b.score - a.score);
  const t2 = performance.now();
  const top = scored.slice(0, RAG_KEEP).map(({ c, score }) => ({ mark: c.mark, slug: c.slug, title: c.title, date: c.date,
    heading: c.heading, score: Math.round(score * 1e4) / 1e4, text: c.text }));
  const given = top.slice(0, RAG_K);
  const system = `${rules('rag', { k: given.length })}\n\n${passages(given)}`;
  const r = await streamed(`${tag}:rag`, { ...SETTINGS, messages: [{ role: 'system', content: system }, { role: 'user', content: question(q) }] });
  const u = usageOf(r.usage);
  const embedUsd = (est(q.length) * EMBED_USD_PER_M) / 1e6;
  const searchMs = Math.round(t2 - t1);
  const retrieveMs = Math.round(t1 - t0) + searchMs;
  return { method: 'rag', steps: [
    { kind: 'embed', ms: Math.round(t1 - t0), tokens: est(q.length), usd: embedUsd },
    { kind: 'search', ms: searchMs, of: index.chunks.length, k: given.length, top },
    { kind: 'answer', ms: r.ms, firstMs: r.firstMs, usage: u, usd: r.usd, finish: r.finish },
  ], answer: answerOf(r.text, corpus),
  stats: { ms: retrieveMs + r.ms, firstMs: retrieveMs + r.firstMs, ...u, usd: r.usd + embedUsd, calls: 2, window: u.in + u.out } };
}

export async function agent(corpus, q, { tag }) {
  const messages = [{ role: 'system', content: rules('agent') }, { role: 'user', content: question(q) }];
  const steps = [];
  const start = performance.now();
  let raw = null;
  for (let turn = 0; raw === null; turn++) {
    const last = turn >= AGENT_TURNS;
    if (last) messages.push({ role: 'user', content: LAST_STEP });
    const r = await step(`${tag}:agent:${turn}`, { ...SETTINGS, messages, tools: TOOLS, tool_choice: last ? 'none' : 'auto' });
    const m = r.message;
    const calls = (m.tool_calls ?? []).map((c) => {
      const t = performance.now();
      const out = runTool(corpus, c.function.name, c.function.arguments);
      let args = c.function.arguments;
      try { args = JSON.parse(args || '{}'); } catch { /* kept as the model sent it */ }
      return { id: c.id, name: c.function.name, args, result: out.text, ms: Math.round(performance.now() - t) };
    });
    steps.push({ kind: 'turn', content: m.content ?? '', calls: calls.map(({ id, ...c }) => c), ms: r.ms,
      usage: usageOf(r.usage), usd: r.usd, finish: r.finish });
    if (!calls.length) { raw = m.content ?? ''; break; }
    messages.push({ role: 'assistant', content: m.content ?? '', tool_calls: m.tool_calls });
    for (const c of calls) messages.push({ role: 'tool', tool_call_id: c.id, content: c.result });
  }
  const turns = steps.map((s) => s.usage);
  const sum = (k) => turns.reduce((t, u) => t + u[k], 0);
  const ms = Math.round(performance.now() - start);
  return { method: 'agent', steps, answer: answerOf(raw, corpus),
    stats: { ms, firstMs: null, in: sum('in'), hit: sum('hit'), out: sum('out'),
      usd: steps.reduce((t, s) => t + s.usd, 0), calls: steps.length, tools: steps.reduce((t, s) => t + s.calls.length, 0),
      window: Math.max(...turns.map((u) => u.in + u.out)) } };
}
