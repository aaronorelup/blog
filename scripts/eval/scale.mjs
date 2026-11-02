// npm run ask:scale (G10, G6 before): a synthetic 1,000-post blog through the real build (src/lib/ask/manifest.js) and
// the Worker's per-question code (worker/ask/: rank, context, cite, body), from today's docs (dist/ask) sampled with
// replacement, today's topic mix, 7% by Claude and one live notebook at 60k est. simulate() is also what
// tests/unit/ask-scale.test.mjs asserts on (no timing there). Prints the gates and exits 1 on a failed one.
import fs from 'node:fs';
import { register } from 'node:module';
import { assemble } from '../../src/lib/ask/manifest.js';
import { BUDGET, CATALOG_CAP, DOC_CAP, EXTRA_TOKENS, LIVE_CAP, PACK_CAP, RULES_TOKENS, SLACK, USER_TOKENS } from '../../src/lib/ask/caps.js';
import { sectionsOf } from './sections.mjs';

// The Worker's modules import their .sql files as text, as wrangler bundles them.
register('data:text/javascript,' + encodeURIComponent(`export async function load(url, context, next) {
  if (!url.endsWith('.sql')) return next(url, context);
  return { format: 'module', shortCircuit: true, source: 'export default ""' };
}`));
const { answerBody } = await import('../../worker/ask/body.js');
const { cite } = await import('../../worker/ask/cite.js');
const { contextOf } = await import('../../worker/ask/context.js');
const { indexOf } = await import('../../worker/ask/corpus.js');
const { ranking } = await import('../../worker/ask/rank.js');

// A seeded random source, so a run is repeatable.
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Today's docs as askDocs() would give them, from the shipped files: their sections' text and their topic.
export function todaysDocs() {
  const { manifest: m, byMark } = sectionsOf();
  return Object.entries(m.docs).filter(([, d]) => !d.live).map(([n, d]) => {
    const part = (kind) => d.sections.filter(([, k]) => k === kind).map(([s]) => byMark.get(`${n}.${s}`))
      .filter(Boolean).map(({ anchor, heading, text }) => ({ anchor, heading, text }));
    const [short, ...sections] = part('post');
    const notes = part('notes');
    return { topic: d.topic, short, sections, notes: notes.length ? { summary: notes[0].text, sections: notes.slice(1) } : null };
  });
}

export function synthetic(base, posts = 1000, seed = 7) {
  const r = rng(seed);
  const pick = (xs) => xs[Math.floor(r() * xs.length)];
  const docs = Array.from({ length: posts - 1 }, (_, i) => {
    const n = i + 1;
    const b = pick(base);
    const by = r() < 0.07 ? 'Claude' : 'Aaron';
    return { n, slug: `post-${n}`, url: `/ledger/post-${n}/`, title: `A synthetic post number ${n} about what was built and measured`,
      topic: b.topic, by, takeaway: 'What it found, in one sentence of about the length the schema allows for a takeaway line, give or take.',
      short: b.short, sections: b.sections, live: false,
      notes: b.notes && { title: `Post ${n}: the making-of notes`, url: `/ledger/post-${n}/notes/`, by, ...b.notes } };
  });
  const words = 'the fleet wrote another round of notes on the machines and what it measured today '.repeat(40);
  const live = { n: posts, slug: 'live-lab', url: '/ledger/live-lab/', title: 'Live', topic: 'agents', by: 'Aaron', live: true,
    takeaway: '', short: { anchor: 'short', heading: 'The short version', text: 'A live notebook.' }, notes: null,
    sections: Array.from({ length: 80 }, (_, i) => ({ anchor: `round-${i}`, heading: `Round ${i}`, text: words.slice(0, 3400) })) };
  return [...docs, live];
}

// The build of a synthetic blog and one question's Worker work over it, with what the gates read.
export async function simulate({ posts = 1000, seed = 7, base = todaysDocs() } = {}) {
  const docs = synthetic(base, posts, seed);
  const first = assemble(docs, { pins: [1] });
  const { manifest: m, files } = assemble(docs, { pins: first.manifest.starts });   // pinned, as ask:pin leaves it
  const json = JSON.stringify(m);
  const t0 = performance.now();
  const ix = indexOf(JSON.parse(json));
  const parseMs = performance.now() - t0;
  // ASSETS answers with the files' bytes, as the binding does: its reads are I/O in the Worker, not CPU.
  const bytes = new Map([...files].map(([f, body]) => [f, new TextEncoder().encode(body)]));
  const env = { ASSETS: { fetch: async (req) => new Response(bytes.get(new URL(req.url).pathname.slice(5))) } };
  const r = rng(seed + 1);
  const ids = () => Array.from({ length: 100 }, () => `AO-${String(1 + Math.floor(r() * (posts - 1))).padStart(3, '0')}:${Math.floor(r() * 8)}`);
  const ask = async () => {
    const lists = Array.from({ length: 5 }, ids);
    const picks = Array.from({ length: 8 }, () => `post-${1 + Math.floor(r() * (posts - 1))}`);
    const rank = ranking(ix, { picks, lists });
    const c = contextOf(ix, rank, { q: 'how did it go?', extraTokens: EXTRA_TOKENS });
    const marks = rank.focus.slice(0, 6).map((n) => `[${n}.1]`).join(' then ');
    cite(`Aaron measured it ${marks}, and ${'more words '.repeat(60)}[${rank.focus[0]}.2].`, (x) => ix.resolve(x, c.inPrompt));
    await answerBody(env, ix, c);
    return c;
  };
  for (let i = 0; i < 5; i++) await ask();   // a warm isolate: its code compiled, the packs and catalog cached
  const t1 = performance.now();
  const contexts = [];
  for (let i = 0; i < 20; i++) contexts.push(await ask());
  const questionMs = (performance.now() - t1) / 20;
  const room = Math.min(...m.packs.map((p) => BUDGET - RULES_TOKENS - p.tokens - m.catalog.tokens - USER_TOKENS - SLACK));
  return { m, files, contexts, parseMs, questionMs, manifestBytes: Buffer.byteLength(json), room,
    prompts: contexts.map((c) => c.tokens) };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const s = await simulate();
  const { m } = s;
  const gates = [
    [`packs: ${m.packs.length} (11-12 expected), the largest ${Math.max(...m.packs.map((p) => p.tokens))} est.`, m.packs.every((p) => p.tokens <= PACK_CAP)],
    [`catalog: ${m.catalog.tokens} est. (<= ${CATALOG_CAP})`, m.catalog.tokens <= CATALOG_CAP],
    [`every question's prompt <= ${BUDGET}: the largest ${Math.max(...s.prompts)}`, Math.max(...s.prompts) <= BUDGET],
    [`6 docs at the caps fit the room: ${s.room} >= ${LIVE_CAP + 5 * DOC_CAP}`, s.room >= LIVE_CAP + 5 * DOC_CAP],
    [`reservation $${m.reserve_usd.toFixed(4)} (<= $0.25); ask_daily_usd should be >= $${(Math.ceil(m.reserve_usd * 1000) / 100).toFixed(2)}`, m.reserve_usd <= 0.25],
    [`manifest ${(s.manifestBytes / 1e6).toFixed(2)} MB on disk (<= 2 MB)`, s.manifestBytes <= 2e6],
    [`manifest parse ${s.parseMs.toFixed(1)} ms (<= 30)`, s.parseMs <= 30],
    [`per question (rank, context, cites, body) ${s.questionMs.toFixed(2)} ms (<= 20)`, s.questionMs <= 20],
  ];
  for (const [what, ok] of gates) console.log(ok ? 'pass' : 'FAIL', what);
  const out = process.env.ASK_SCALE_OUT;
  if (out) fs.writeFileSync(out, JSON.stringify({ gates, packs: m.packs.map((p) => [p.docs.length, p.tokens]), parseMs: s.parseMs, questionMs: s.questionMs }, null, 1));
  process.exit(gates.every(([, ok]) => ok) ? 0 : 1);
}
