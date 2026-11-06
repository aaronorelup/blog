// node scripts/eval/lab/record.mjs --run <dir> --cold <dir> --pick context=c1,c2,c3 --pick rag=r1,r2,r4 --pick agent=a1,a2,a3:
// the Goobie lab demo's fixtures from a judged run (run.mjs, judge.mjs): runs/blog.json (the corpus as the page's map
// draws it, and the run's facts) and runs/<method>.json (each picked question's run, its grade, and in one line how
// the other two methods did on it). Refuses to write a never-publish term, a live notebook or anything like an IP.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PRICES } from '../../../src/lib/ask/price.js';
import { isLive, LIVE_NOTEBOOKS } from '../../../src/data/exempt.js';
import { hash, keys } from '../../check/never-publish.mjs';
import { loadCorpus } from './load.mjs';
import { AGENT_TURNS, RAG_K } from './methods.mjs';

const OUT = new URL('../../../src/elements/ao-demo/demos/goobie-lab/runs/', import.meta.url);
const WINDOW = 1_000_000;   // the model's context window, in tokens (docs/ASK.md)
const { values: o } = parseArgs({ options: { run: { type: 'string' }, cold: { type: 'string' }, pick: { type: 'string', multiple: true } } });
const lines = (dir) => fs.readFileSync(path.join(dir, 'runs.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => !r.error);
const runs = new Map(lines(o.run).map((r) => [`${r.qid}|${r.method}`, r]));
const judged = JSON.parse(fs.readFileSync(path.join(o.run, 'judged.json'), 'utf8'));
const qs = new Map(JSON.parse(fs.readFileSync(new URL('./questions.json', import.meta.url), 'utf8')).questions.map((q) => [q.id, q]));
const corpus = loadCorpus();

const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
// A run's grade: the judge passes' mean of each must, summed; the score's mean.
function grade(key) {
  const j = judged[key];
  if (!j || j.at !== runs.get(key)?.at) throw new Error(`${key}: not judged (run judge.mjs)`);
  const n = j.passes[0].must.length;
  const must = j.passes.reduce((t, p) => t + p.must.reduce((a, b) => a + b, 0), 0) / j.passes.length;
  return { must: round(must, 2), of: n, score: round(j.passes.reduce((t, p) => t + p.score, 0) / j.passes.length), passes: j.passes.length };
}
const brief = (key) => {
  const r = runs.get(key);
  return { ...grade(key), ms: r.stats.ms, usd: round(r.stats.usd, 5), in: r.stats.in };
};
const answerOf = (r) => ({ text: r.answer.answer, cites: r.answer.cites });
const stepsOf = (r) => (r.method === 'agent'
  ? r.steps.map((s) => ({ ...s, usd: round(s.usd, 6), calls: s.calls.map(({ name, args, result, ms }) => ({ name, args, result, ms })) }))
  : r.steps.map((s) => ({ ...s, ...(s.usd !== undefined && { usd: round(s.usd, 7) }) })));

function file(method, ids) {
  const out = ids.map((id) => {
    const key = `${id}|${method}`;
    const r = runs.get(key);
    if (!r) throw new Error(`${key}: no run`);
    const others = Object.fromEntries(['context', 'rag', 'agent'].filter((m) => m !== method && runs.has(`${id}|${m}`)).map((m) => [m, brief(`${id}|${m}`)]));
    return { qid: id, q: r.q, type: qs.get(id).type, at: r.at, steps: stepsOf(r), answer: answerOf(r),
      stats: { ...r.stats, usd: round(r.stats.usd, 6) }, grade: grade(key), others };
  });
  return { method, runs: out };
}

const picks = Object.fromEntries((o.pick ?? []).map((p) => p.split('=')).map(([m, ids]) => [m, ids.split(',')]));
const first = runs.values().next().value;
const blog = {
  recorded: first.at.slice(0, 10), commit: first.corpus.commit.slice(0, 7), window: WINDOW, ragK: RAG_K, agentTurns: AGENT_TURNS,
  chunks: first.corpus.chunks, packChars: first.corpus.packChars, prices: PRICES,
  posts: corpus.posts.map((p) => [p.n, p.slug, p.title, p.date, p.topic, p.by, p.sections.reduce((t, s) => t + s.text.length, 0)]),
};
if (o.cold) {
  const c = lines(o.cold).find((r) => r.method === 'context' && r.stats.hit === 0);
  if (!c) throw new Error('--cold: no context run that missed the cache');
  blog.cold = { qid: c.qid, at: c.at, ms: c.stats.ms, firstMs: c.stats.firstMs, in: c.stats.in, hit: c.stats.hit, usd: round(c.stats.usd, 5) };
}
const files = { blog, ...Object.fromEntries(Object.entries(picks).map(([m, ids]) => [m, file(m, ids)])) };

// Nothing private, nothing of a live notebook, nothing shaped like an address: or nothing is written.
const banned = new Set(JSON.parse(fs.readFileSync(new URL('../../../src/data/never-publish.json', import.meta.url), 'utf8')));
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
for (const [name, data] of Object.entries(files)) {
  const text = JSON.stringify(data);
  const hits = [...keys(text)].filter(([k]) => banned.has(hash(k))).map(([k]) => k);
  if (hits.length) throw new Error(`${name}: a never-publish term (${hits.length} hits): not written`);
  const live = Object.entries(LIVE_NOTEBOOKS).find(([id, n]) => text.includes(n.slug) || text.includes(`"${id}"`));
  if (live || corpus.posts.some((p) => isLive(p.slug))) throw new Error(`${name}: names a live notebook: not written`);
  if (IPV4.test(text)) throw new Error(`${name}: something shaped like an IP address: not written`);
}
fs.mkdirSync(OUT, { recursive: true });
for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(new URL(`${name}.json`, OUT), `${JSON.stringify(data)}\n`);
  console.log(`runs/${name}.json: ${(JSON.stringify(data).length / 1024).toFixed(1)} KB`);
}
