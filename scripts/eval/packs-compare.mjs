// npm run ask:packs -- --run <dir> (G3, free): which split-mode layout to build, from today's doc sizes (dist/ask) and
// a whole-mode run's R and focus (events.jsonl). At packs of 60k, 90k and 150k est., AO packs (packs.js, AO order)
// against topic shelves (docs grouped by topic, AO order inside, split the same way): per question the pack the
// Worker would choose (context.js), the focus docs inside it, the uncached tokens after it, and whether every gold doc
// is in the prompt. Topic shelves win only at 90k with focus-in-pack >= AO's + 2, extras <= 0.75 x AO's, gold 1.0.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { TOPIC_KEYS } from '../../src/data/taxonomy.js';
import { EXTRA_TOKENS } from '../../src/lib/ask/caps.js';
import { packsOf } from '../../src/lib/ask/packs.js';
import { contextOf } from '../../worker/ask/context.js';
import { indexOf } from '../../worker/ask/corpus.js';

const { values: o } = parseArgs({ options: { run: { type: 'string' }, set: { type: 'string', default: 'tests/ask/eval.json' },
  out: { type: 'string' } } });
const m = JSON.parse(fs.readFileSync(new URL('../../dist/ask/manifest.json', import.meta.url), 'utf8'));
const qs = new Map(JSON.parse(fs.readFileSync(o.set, 'utf8')).questions.map((q) => [q.id, q]));
const recs = fs.readFileSync(path.join(o.run, 'events.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  .filter((r) => qs.has(r.qid) && r.events.some((e) => e.t === 'read'));
const docs = Object.entries(m.docs).map(([n, d]) => ({ n: Number(n), ...d })).sort((a, b) => a.n - b.n);
const steady = docs.filter((d) => !d.live);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1]; };

const layouts = {
  ao: (P) => packsOf(steady, { pins: [1], whole: 0, pack: P, catalogTokens: m.catalog.tokens }).packs,
  topics: (P) => TOPIC_KEYS.flatMap((k) => packsOf(steady.filter((d) => d.topic === k), { pins: [1], whole: 0, pack: P, catalogTokens: m.catalog.tokens }).packs)
    .filter((p) => p.length),
};

function measure(packs) {
  const at = new Map(packs.flatMap((p, i) => p.map((n) => [n, i])));
  const fake = { ...m, mode: 'split', packs: packs.map((p) => ({ docs: p, tokens: p.reduce((t, n) => t + m.docs[n].tokens, 0) })),
    docs: Object.fromEntries(docs.map((d) => [d.n, { ...m.docs[d.n], pack: at.get(d.n) ?? null }])) };
  const ix = indexOf(fake);
  return recs.map((r) => {
    const read = r.events.find((e) => e.t === 'read');
    const found = r.events.find((e) => e.t === 'found');
    const focus = read.focus.map(ix.n);
    const ranked = [...new Set([...focus, ...(found.ranked ?? []).map(ix.n)])];
    const R = [...new Set([...ranked, ...[...ix.order].reverse().filter((n) => !ix.live.includes(n))])];
    const c = contextOf(ix, { R, focus, hint: R.slice(0, 6), matched: [], chunks: [] }, { q: r.q, extraTokens: EXTRA_TOKENS });
    const inPrompt = new Set([...fake.packs[c.pack].docs, ...c.extras]);
    return { inPack: focus.filter((n) => at.get(n) === c.pack).length, extras: c.extras.reduce((t, n) => t + m.docs[n].tokens, 0),
      gold: qs.get(r.qid).gold.every((g) => inPrompt.has(ix.n(g))) };
  });
}

const table = {};
for (const P of [60000, 90000, 150000]) {
  for (const [name, layout] of Object.entries(layouts)) {
    const packs = layout(P);
    const rows = measure(packs);
    table[`${name} ${P / 1000}k`] = { packs: packs.length, 'focus in pack (median)': median(rows.map((x) => x.inPack)),
      'uncached extras (median)': median(rows.map((x) => x.extras)), 'gold in context': +(rows.filter((x) => x.gold).length / rows.length).toFixed(3) };
  }
}
console.table(table);
const [ao, tp] = [table['ao 90k'], table['topics 90k']];
const topics = tp['focus in pack (median)'] >= ao['focus in pack (median)'] + 2 && tp['uncached extras (median)'] <= 0.75 * ao['uncached extras (median)']
  && ao['gold in context'] === 1 && tp['gold in context'] === 1;
console.log(`layout: ${topics ? 'topic shelves' : 'AO packs'} (the rule at 90k)`);
if (o.out) fs.writeFileSync(o.out, JSON.stringify({ table, layout: topics ? 'topics' : 'ao', questions: recs.length }, null, 1));
