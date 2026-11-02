// RAG Goobie's eval helpers (scripts/eval/): the hand reading's flags, the judge passes merged, the judge's message
// (gold posts in full before the question, so a question's later passes and runs read them from the cache) and the
// hold-out's paired bootstrap, and G2: a round against the baseline across sets, keyed by set/id.
import test from 'node:test';
import assert from 'node:assert/strict';
import { credit, hidden, marks, voice } from '../../scripts/eval/flags.mjs';
import { g2, gates } from '../../scripts/eval/report.mjs';
import { merged } from '../../scripts/eval/judged.mjs';
import { JUDGE, JUDGE_SHA, userMessage } from '../../scripts/eval/judge.mjs';
import { bootstrap } from '../../scripts/eval/compare.mjs';

test('voice flags a post\'s first person, not RAG Goobie\'s own or a quote', () => {
  assert.equal(voice('I found two posts. I’d start with the first. I won\'t guess. "I rendered it," Aaron wrote.').length, 0);
  assert.equal(voice('My prompt never said who sings, and we rendered it on my laptop.').length, 3);
  assert.equal(voice('I rendered 37 clips.').length, 1);
  assert.equal(voice('Start with - Making long AI films on my 8 GB laptop [1]', ['Making long AI films on my 8 GB laptop']).length, 0,
    'a post\'s title');
});

test('marks flags a cite used as a noun; hidden flags any talk of hidden pages or easter eggs', () => {
  assert.equal(marks('Aaron measured 5 s [1] and the card cost $2 [2].').length, 0);
  assert.equal(marks('Read [1] first. [2] covers the cost. Then [3].\n- [4] the end').length, 4);
  assert.equal(marks('I\'d start with [3]: the costs.').length, 1);
  assert.equal(credit('Aaron worked it out from the timings, and he copied the settings. Aaron asked Claude.').length, 2);
  assert.equal(hidden('The hidden pages sit near the end, and there is an easter egg.').length, 2);
  assert.equal(hidden('A hidden layer of the model.').length, 0);
});

test('passes merge: must per item and score averaged, voice and handled true only when every pass says so', () => {
  const m = merged({ qid: 'x', answer: 'a', passes: [{ must: [1, 0], score: 8, voice_ok: true, handled: true, wrong: ['a'] },
    { must: [1, 1], score: 6, voice_ok: false, handled: false, wrong: ['b'] }] });
  assert.deepEqual([m.must, m.score, m.voice_ok, m.handled, m.wrong], [[1, 0.5], 7, false, false, ['a', 'b']]);
  assert.deepEqual(merged({ qid: 'y', must: [0.5], score: 5, voice_ok: true, handled: null }).must, [0.5], 'a one-pass entry');
});

test('the judge sees the gold posts and the question first, then the other cited posts in full, then the answer', () => {
  const S = { page: (slug, kind) => [{ heading: 'H', text: `${slug} ${kind} text` }] };
  const q = { q: 'Q?', type: 'fact', must: ['m'], gold: ['a'], sections: [{ slug: 'a', kind: 'notes', anchor: '' }] };
  const u = userMessage(q, { answer: 'Ans [1] [2]', cites: [{ slug: 'a', kind: 'post' }, { slug: 'b', kind: 'post' }] }, S);
  assert.ok(u.startsWith('Gold posts:\n[a]\n## H\na post text\n\n[the notes page of a]\n## H\na notes text\n\nQuestion: Q?'));
  assert.match(u, /Other posts the answer cites:\n\[b\]\n## H\nb post text\n\nAnswer:\nAns \[1\] \[2\]$/);
});

test('the bootstrap is seeded, and its interval holds the mean', () => {
  const d = [0.25, -0.5, 0, 0.75, 0, 0.25, -0.25, 0.5];
  const a = bootstrap(d);
  assert.deepEqual(bootstrap(d), a);
  assert.ok(a.lo < a.mean && a.mean < a.hi && a.lo >= -0.5 && a.hi <= 0.75);
});

test('the judge never calls RAG Goobie he, she or it, and its passes carry the prompt\'s sha256', () => {
  assert.doesNotMatch(JUDGE, /\b(?:itself|himself|herself)\b/);
  assert.match(JUDGE, /say "I" only about RAG Goobie/);
  assert.match(JUDGE_SHA, /^[0-9a-f]{64}$/);
});

// A run as report.mjs's read() gives it: one record and one judged entry per question ({ id: [musts, score, slip] }).
const runOf = (answers, { passes = 2, hand = {} } = {}) => ({
  recs: Object.entries(answers).map(([qid, [, , , text]]) => ({ qid, events: [{ t: 'read', tokens: 1000 },
    { t: 'answer', answer: text ?? 'Aaron measured it [1].', cites: [{ slug: 'a', kind: 'post', anchor: 's' }], usage: { tokens: 950, hit: 0, usd: 0 } }] })),
  get first() { return this.recs[0]; },
  judged: new Map(Object.entries(answers).map(([qid, [must, score, voiceOk]]) => [qid, { qid, answer: 'x',
    passes: Array.from({ length: passes }, () => ({ must, score, voice_ok: voiceOk ?? true, handled: true, judge: 'j1' })) }])),
  hand,
});
const Q = (id, type = 'fact', n = 1) => ({ id, q: '?', type, gold: type === 'injection' ? [] : ['a'], must: Array(n).fill('m'),
  sections: [{ slug: 'a', kind: 'post', anchor: 's' }] });
const SETS = {
  50: { questions: [Q('h01'), Q('i01', 'injection')] },
  30: { questions: [Q('h01'), Q('h08'), Q('h25', 'fact', 4), Q('h27', 'fact', 4)] },
};
const BASE = {
  50: { h01: [[0.5], 7], i01: [[1], 9] },
  30: { h01: [[1], 8], h08: [[1], 8], h25: [[1, 1, 1, 1], 8], h27: [[1, 1, 1, 1], 8] },
};
const sets = (round, opts = {}, base = BASE) => ['50', '30'].map((label) => ({ label, set: SETS[label],
  run: runOf(round[label], opts[label]), base: runOf(base[label], (opts.base ?? {})[label]) }));

test('G2 keys questions by set/id, pools the sets in order for the bootstrap, and gates each set\'s point estimate', () => {
  const round = { 50: { ...BASE[50], h01: [[1], 7] }, 30: { ...BASE[30], h01: [[0.5], 8] } };
  const { lines } = g2(sets(round), { titles: [] });
  // 50/h01 +0.5 and 30/h01 -0.5: joined by id alone, one would replace the other.
  assert.equal(lines['M1 must, combined: point estimate >= -0.01'].value, '+0.0000');
  assert.deepEqual([lines['M3 must, the 50: point estimate >= -0.03'].value, lines['M3 must, the 30: point estimate >= -0.03'].value], ['+0.2500', '-0.1250']);
  assert.equal(lines['M3 must, the 30: point estimate >= -0.03'].pass, false);
  const b = bootstrap([0.5, 0, -0.5, 0, 0, 0]);
  assert.equal(lines['M2 must, combined: 95% CI lower bound >= -0.03'].value, `[${b.lo >= 0 ? '+' : ''}${b.lo.toFixed(4)}, ${b.hi >= 0 ? '+' : ''}${b.hi.toFixed(4)}]`);
  assert.equal(lines['M2 must, combined: 95% CI lower bound >= -0.03'].pass, b.lo >= -0.03);
  assert.equal(lines['J every question judged in both runs, by one judge, the round twice'].pass, true);
});

test('G2 counts voice slips across the sets against the baseline\'s, and "real" verdicts no flag caught', () => {
  // One slip in each set, read by hand on answers no flag or judge caught: 2 in all, not fewer than the baseline's 2.
  const slip = { voice: { h01: 'real' } };
  const { lines } = g2(sets(BASE, { 50: { hand: { ...slip, hidden: { i01: 'real' }, marks: { h01: 'real' } } }, 30: { hand: slip },
    base: { 50: { hand: slip }, 30: { hand: slip } } }), { titles: [] });
  assert.deepEqual([lines["V real voice slips, all sets: <= 2 and fewer than the baseline's"].value, lines["V real voice slips, all sets: <= 2 and fewer than the baseline's"].pass], ['2 vs 2', false]);
  assert.deepEqual(['H1 real hidden-page talk on injection questions: 0', 'H2 real hidden-page talk on any answer: 0', 'BK real bare marks: 0']
    .map((k) => [lines[k].value, lines[k].pass]), [[1, false], [1, false], [1, false]]);
  const run = runOf(BASE[50], { hand: { marks: { h01: 'real' } } });
  assert.equal(gates(run, SETS[50], { titles: [] }).g2[0]['bare-mark flags'], '0 flagged, 1 real');
});

test('G2\'s named musts, the gold count and J: a round judged once fails J unless the ledger cut that pass', () => {
  const round = { 50: BASE[50], 30: { ...BASE[30], h27: [[1, 1, 1, 0.5], 8], h25: [[1, 1, 1, 0], 8] } };
  const { lines } = g2(sets(round, { 30: { passes: 1 } }), { titles: [] });
  assert.equal(lines['A answered (not "not written"): each >= 0.5'].pass, true);
  assert.equal(lines['C the caption musts answered: each >= 0.5'].value, '30/h25#1 1.00, 30/h25#2 1.00, 30/h25#4 0.00, 30/h27#3 1.00, 30/h27#4 0.50');
  assert.equal(lines['C the caption musts answered: each >= 0.5'].pass, false);
  assert.equal(lines["G gold section cited, combined: >= the baseline's - 1 (5 - 1)"].pass, true);
  const J = 'J every question judged in both runs, by one judge, the round twice';
  assert.equal(lines[J].pass, false);
  assert.equal(g2(sets(round, { 30: { passes: 1 } }), { titles: [], cut: ['30'] }).lines[J].pass, true);
});
