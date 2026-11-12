// node scripts/eval/lab/report.mjs --run <dir>: the Goobie lab's matrix from runs.jsonl and judged.json: every
// question by every method, its key facts (the judge passes' mean), score, time, tokens read, cost and model calls,
// RAG's rank of the first gold chunk, and each method's medians and totals. Free: it only reads the files.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values: o } = parseArgs({ options: { run: { type: 'string' }, json: { type: 'boolean' } } });
const qs = JSON.parse(fs.readFileSync(new URL('./questions.json', import.meta.url), 'utf8')).questions;
const runs = new Map(fs.readFileSync(path.join(o.run, 'runs.jsonl'), 'utf8').split('\n').filter(Boolean)
  .map((l) => JSON.parse(l)).filter((r) => !r.error).map((r) => [`${r.qid}|${r.method}`, r]));
const judged = JSON.parse(fs.readFileSync(path.join(o.run, 'judged.json'), 'utf8'));
const METHODS = ['context', 'rag', 'agent'];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

const rows = [];
for (const q of qs) {
  for (const m of METHODS) {
    const r = runs.get(`${q.id}|${m}`);
    const j = judged[`${q.id}|${m}`];
    if (!r) continue;
    const ok = j && j.at === r.at;
    const must = ok ? mean(j.passes.map((p) => p.must.reduce((a, b) => a + b, 0))) : null;
    const score = ok ? mean(j.passes.map((p) => p.score)) : null;
    const top = r.steps.find((s) => s.kind === 'search')?.top;
    const rank = top ? top.findIndex((c) => q.gold.includes(c.slug)) : null;
    rows.push({ q: q.id, for: q.for, m, must, of: q.must.length, score, ms: r.stats.ms, in: r.stats.in, hit: r.stats.hit,
      usd: r.stats.usd, calls: r.stats.calls, tools: r.stats.tools ?? null, rank, passes: ok ? j.passes.length : 0 });
  }
}
if (o.json) { console.log(JSON.stringify(rows)); process.exit(0); }
const f = (x, d = 1) => (x === null || x === undefined ? '-' : Number(x).toFixed(d));
console.log('q   for     method   facts   score  time     in        cost      calls  rank');
for (const r of rows) {
  console.log([r.q.padEnd(3), r.for.padEnd(7), r.m.padEnd(8), `${f(r.must, 2)}/${r.of}`.padEnd(7), f(r.score).padStart(5),
    `${f(r.ms / 1e3)} s`.padStart(7), String(r.in).padStart(8), `$${r.usd.toFixed(4)}`.padStart(9), String(r.calls).padStart(5),
    r.rank === null ? '' : String(r.rank)].join('  '));
}
console.log('\nby method, over every question: key-fact share mean, score mean, time median, tokens median, cost median and total');
for (const m of METHODS) {
  const rs = rows.filter((r) => r.m === m && r.must !== null);
  console.log(m.padEnd(8), f(mean(rs.map((r) => r.must / r.of)), 3), f(mean(rs.map((r) => r.score)), 2),
    `${f(median(rs.map((r) => r.ms)) / 1e3)} s`, median(rs.map((r) => r.in)), `$${median(rs.map((r) => r.usd)).toFixed(4)}`, `$${rs.reduce((t, r) => t + r.usd, 0).toFixed(4)}`);
}
console.log('\nby the method each question is for (key-fact share mean of that group)');
for (const g of METHODS) {
  console.log(`${g} questions:`, METHODS.map((m) => {
    const rs = rows.filter((r) => r.for === g && r.m === m && r.must !== null);
    return `${m} ${f(mean(rs.map((r) => r.must / r.of)), 2)}`;
  }).join(', '));
}
