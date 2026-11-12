// node scripts/eval/lab/judge.mjs --run <dir> [--passes 2] [--ids c1,a1]: grades every run in <dir>/runs.jsonl
// against questions.json, as RAG Goobie's judge does (scripts/eval/judge.mjs: the gold posts AND every post the answer
// cites, in full, then the must list), with method-neutral rules: the model with thinking on, temperature 0, each
// pass on the eval's ledger. Writes <dir>/judged.json: { "<qid>|<method>": { at, passes: [{ must, wrong, score }] } }.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { worst } from '../../../src/lib/ask/price.js';
import { sectionName } from '../../../src/lib/goobie-lab/corpus.js';
import { chat } from '../spend.mjs';
import { loadCorpus } from './load.mjs';
import { MODEL } from './llm.mjs';

export const JUDGE = `You grade answers to readers' questions about Aaron Orelup's blog. An answer must come only from his
posts, cite them, and stay under about 200 words. You get the posts that hold the answer (the gold posts) in full,
then the question, its type, the facts a good answer states ("must") and grader notes, then every other post the
answer cites, in full, and the answer, where each citation reads [post-slug] after the claim it supports.
A claim found in any of these posts is not invented. Reply with JSON only:
{"must": [one number per must item, in order: 1 stated (paraphrase is fine), 0.5 partly, 0 missing],
 "wrong": [claims that contradict the posts or are invented, and claims cited to a post that doesn't say them; [] if none],
 "score": 0-10 (how good and correct this answer is for a reader, 10 = complete, correct and well told),
 "why": "one sentence"}`;
export const JUDGE_SHA = createHash('sha256').update(JUDGE).digest('hex').slice(0, 12);
const OUT = 8000;

const page = (p) => `[${p.slug}] ${p.id}: ${p.title} (${p.date}, ${p.topic}, by ${p.by})\n${p.sections
  .map((s) => `## ${s.kind === 'notes' ? 'Notes: ' : ''}${sectionName(s)}\n${s.text}`).join('\n\n')}`;

// The answer as the judge reads it: every cite [n] as [slug].
const readable = (a) => a.answer.replace(/\[(\d+)\]/g, (m, n) => {
  const c = a.cites.find((x) => String(x.n) === n);
  return c ? `[${c.slug}]` : m;
});

export function userMessage(corpus, q, run) {
  const gold = q.gold.map((s) => corpus.bySlug.get(s)).filter(Boolean);
  const cited = [...new Set(run.answer.cites.map((c) => c.slug))].filter((s) => !q.gold.includes(s))
    .map((s) => corpus.bySlug.get(s)).filter(Boolean);
  return `Gold posts:\n${gold.map(page).join('\n\n')}\n\nQuestion: ${q.q}\nType: ${q.type}\nMust:\n`
    + `${q.must.map((m) => `- ${m}`).join('\n')}\nNotes: ${q.notes || '-'}\n\nOther posts the answer cites:\n`
    + `${cited.map(page).join('\n\n') || '(none)'}\n\nAnswer:\n${readable(run.answer)}`;
}

async function grade(corpus, q, run, tag) {
  const user = userMessage(corpus, q, run);
  const body = { model: MODEL, stream: false, max_tokens: OUT, temperature: 0, thinking: { type: 'enabled' },
    messages: [{ role: 'system', content: JUDGE }, { role: 'user', content: user }] };
  for (let i = 0; i < 2; i++) {
    const r = await chat(tag, body, worst(Math.ceil((JUDGE.length + user.length) / 3) + 20, OUT));
    let g = null;
    try { g = JSON.parse(/\{[\s\S]*\}/.exec(r.text)[0]); } catch { /* asked again */ }
    if (Array.isArray(g?.must) && g.must.length === q.must.length && typeof g.score === 'number') return { ...g, judge: JUDGE_SHA };
    console.log(tag, 'unusable reply, asking again');
  }
  return null;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { values: o } = parseArgs({ options: { run: { type: 'string' }, passes: { type: 'string', default: '2' },
    ids: { type: 'string' }, concurrency: { type: 'string', default: '4' } } });
  const qs = new Map(JSON.parse(fs.readFileSync(new URL('./questions.json', import.meta.url), 'utf8')).questions.map((q) => [q.id, q]));
  const runs = fs.readFileSync(path.join(o.run, 'runs.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((r) => !r.error && qs.has(r.qid) && (!o.ids || o.ids.split(',').includes(r.qid)));
  const latest = [...new Map(runs.map((r) => [`${r.qid}|${r.method}`, r])).values()];
  const file = path.join(o.run, 'judged.json');
  const done = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  for (const r of latest) if (done[`${r.qid}|${r.method}`]?.at !== r.at) delete done[`${r.qid}|${r.method}`];   // re-run: judged again
  const corpus = loadCorpus();
  const queue = latest.flatMap((r) => Array.from({ length: Number(o.passes) }, (_, i) => [r, i]))
    .filter(([r, i]) => (done[`${r.qid}|${r.method}`]?.passes?.length ?? 0) <= i);
  await Promise.all(Array.from({ length: Number(o.concurrency) }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const [r, i] = job;
      const key = `${r.qid}|${r.method}`;
      const g = await grade(corpus, qs.get(r.qid), r, `labjudge:${key}:${i + 1}`);
      if (!g) continue;
      done[key] = { at: r.at, passes: [...(done[key]?.passes ?? []), g] };
      fs.writeFileSync(file, JSON.stringify(done, null, 1));
      console.log(key, i + 1, g.must, 's', g.score, '|', (g.wrong ?? []).join('; ').slice(0, 200));
    }
  }));
}
