// The Goobie lab's model calls, each through the eval's DeepSeek ledger (scripts/eval/spend.mjs: reserved at its worst
// case, settled to its price) with the live RAG Goobie's model and client (worker/ask/deepseek.js): streamed() times
// the first words of an answer, step() is one agent turn with its tool calls. embed() is Workers AI's embedding model
// of the live search index (dist/search/manifest.json names it), its vectors kept in a private cache. Its calls are not
// on the ledger: a whole run's embeddings cost well under a cent (EMBED_USD_PER_M).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cost, worst } from '../../../src/lib/ask/price.js';
import { call, MODEL } from '../../../worker/ask/deepseek.js';
import { cf } from '../../lib/cfapi.mjs';
import { secret } from '../../lib/secrets.mjs';
import { reserve, settle } from '../spend.mjs';

export { MODEL };
export const HOME = process.env.LAB_DIR ?? path.join(os.homedir(), '.cache/goobie-lab');
const URL_ = 'https://api.deepseek.com/chat/completions';
const env = () => ({ DEEPSEEK_URL: URL_, DEEPSEEK_API_KEY: secret('DEEPSEEK_API_KEY') });
const worstOf = (body) => worst(Math.ceil(JSON.stringify(body.messages).length / 3) + (body.tools ? 1500 : 0), body.max_tokens);
const priced = (usage, at) => (usage ? cost(usage, at) : 0);

// One streamed answer: { text, finish, usage, ms, firstMs, usd }.
export async function streamed(tag, body) {
  const full = { model: MODEL, stream: true, stream_options: { include_usage: true }, ...body };
  const w = worstOf(full);
  const id = reserve(tag, w);
  const at = Date.now();
  const r = await call(env(), JSON.stringify(full), { stream: true, first: 120e3, total: 300e3 });
  const micro = r.usage ? priced(r.usage, at) : r.status === 200 ? w : 0;
  settle(id, tag, w, micro);
  if (r.status !== 200 || !r.text) throw new Error(`${tag}: DeepSeek ${r.status || r.error}`);
  return { text: r.text, finish: r.finish, usage: r.usage, ms: r.ms, firstMs: r.firstMs, usd: micro / 1e6, at };
}

// One agent turn, not streamed: { message: { content, tool_calls }, finish, usage, ms, usd }.
export async function step(tag, body) {
  const full = { model: MODEL, stream: false, ...body };
  const w = worstOf(full);
  const id = reserve(tag, w);
  const at = Date.now();
  let usage = null;
  try {
    const r = await fetch(URL_, { method: 'POST', body: JSON.stringify(full), signal: AbortSignal.timeout(300e3),
      headers: { Authorization: `Bearer ${secret('DEEPSEEK_API_KEY')}`, 'Content-Type': 'application/json' } });
    if (!r.ok) { settle(id, tag, w, 0); throw new Error(`${tag}: DeepSeek ${r.status} ${(await r.text()).slice(0, 200)}`); }
    const j = await r.json();
    usage = j.usage ?? null;
    const micro = priced(usage, at);
    settle(id, tag, w, micro);
    return { message: j.choices[0].message, finish: j.choices[0].finish_reason, usage, ms: Date.now() - at, usd: micro / 1e6, at };
  } catch (e) {
    if (usage === null && !/DeepSeek \d/.test(e.message)) settle(id, tag, w, w);
    throw e;
  }
}

// Workers AI's price for the search index's embedding model: $0.012 per million input tokens
// (developers.cloudflare.com/workers-ai/platform/pricing, read 2026-11-06), est. 3.5 characters a token.
export const EMBED_USD_PER_M = 0.012;
const MODEL_OF = () => JSON.parse(fs.readFileSync(new URL('../../../dist/search/manifest.json', import.meta.url), 'utf8')).model;
const CACHE = path.join(HOME, 'vectors.json');
let kept = null;
const keyOf = (model, text) => createHash('sha256').update(`${model}\n${text}`).digest('hex').slice(0, 32);

// texts -> { vectors, ms, calls }: cached ones from disk, the rest 50 a call.
export async function embed(texts, { cache = true } = {}) {
  const model = MODEL_OF();
  kept ??= fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  const keys = texts.map((t) => keyOf(model, t));
  const todo = cache ? [...new Set(keys.map((k, i) => (kept[k] ? null : i)).filter((i) => i !== null))] : texts.map((_, i) => i);
  const fresh = {};
  const start = Date.now();
  let calls = 0;
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const r = await cf(`/ai/run/${model}`, { method: 'POST', body: { text: batch.map((j) => texts[j]) } });
    calls += 1;
    batch.forEach((j, b) => { fresh[keys[j]] = r.data[b]; });
  }
  const ms = Date.now() - start;
  if (cache && calls) {
    Object.assign(kept, fresh);
    fs.mkdirSync(HOME, { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify(kept));
  }
  return { vectors: keys.map((k) => fresh[k] ?? kept[k]), ms, calls, model };
}
