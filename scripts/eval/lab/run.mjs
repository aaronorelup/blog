// node scripts/eval/lab/run.mjs [--ids c1,r1] [--methods context,rag,agent] [--out <dir>]: the Goobie lab's runs.
// Every question of questions.json through every method, one at a time (so a time is the method's, not the box's),
// appended to <dir>/runs.jsonl (default ~/.cache/goobie-lab/runs/<time>/, private: never in the repo). The chunks are
// embedded once and cached; every DeepSeek call is on the eval's ledger ($ASK_EVAL_LEDGER, capped at $ASK_EVAL_USD).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chunksOf, loadCorpus, packText } from './load.mjs';
import { embed, HOME } from './llm.mjs';
import { agent, inContext, rag } from './methods.mjs';

const { values: o } = parseArgs({ options: { ids: { type: 'string' }, methods: { type: 'string', default: 'context,rag,agent' },
  out: { type: 'string' } } });
const set = JSON.parse(fs.readFileSync(new URL('./questions.json', import.meta.url), 'utf8'));
const qs = set.questions.filter((q) => !o.ids || o.ids.split(',').includes(q.id));
const methods = o.methods.split(',');
const out = o.out ?? path.join(HOME, 'runs', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(out, { recursive: true });

const corpus = loadCorpus();
const pack = packText(corpus);
let index = null;
if (methods.includes('rag')) {
  const chunks = chunksOf(corpus);
  const e = await embed(chunks.map((c) => c.embedText));
  index = { chunks, vectors: e.vectors };
  console.log(`index: ${chunks.length} chunks (${e.calls} embedding calls, ${e.ms} ms)`);
}
const RUN = { context: (q, tag) => inContext(corpus, q, { pack, tag }), rag: (q, tag) => rag(corpus, q, { index, tag }),
  agent: (q, tag) => agent(corpus, q, { tag }) };
const base = { commit: corpus.built.commit, posts: corpus.posts.length, chunks: index?.chunks.length ?? null, packChars: pack.length };

for (const q of qs) {
  for (const method of methods) {
    const at = new Date().toISOString();
    try {
      const r = await RUN[method](q.q, `lab:${q.id}`);
      const rec = { qid: q.id, for: q.for, q: q.q, at, corpus: base, ...r };
      fs.appendFileSync(path.join(out, 'runs.jsonl'), `${JSON.stringify(rec)}\n`);
      const s = r.stats;
      console.log([q.id, method.padEnd(7), `${(s.ms / 1e3).toFixed(1)} s`, `in ${s.in} (hit ${s.hit})`, `out ${s.out}`,
        `$${s.usd.toFixed(4)}`, `${s.calls} calls`, `${r.answer.cites.length} cites`].join(' | '));
    } catch (e) {
      console.log(q.id, method, 'failed:', e.message);
      fs.appendFileSync(path.join(out, 'runs.jsonl'), `${JSON.stringify({ qid: q.id, q: q.q, method, at, error: e.message })}\n`);
    }
  }
}
console.log(`runs in ${out}`);
