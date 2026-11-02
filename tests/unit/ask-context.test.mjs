// What one question is given (worker/ask/rank.js ranking(), context.js contextOf()): R is the planner's picks, the
// fused docs, then every other post newest first, the live notebook only when picked and ids no listed doc owns
// dropped; focus is the picks and 6 more; matched the picks and the fused top 6; in split mode the pack holding most
// of the focus, the focus outside it always, then R under ask_extra_tokens and the room; the user message's forms.
import test from 'node:test';
import assert from 'node:assert/strict';
import { indexOf } from '../../worker/ask/corpus.js';
import { contextOf } from '../../worker/ask/context.js';
import { built, doc, DOCS, id } from './ask-fixture.mjs';
import { loadWorker } from './worker-env.mjs';

const { ranking } = await loadWorker('ask/rank.js');
const whole = indexOf(built().manifest);

test('R: the picks first, then the fused docs, then every other post newest first; the live notebook only when picked', () => {
  const lists = [[id(3, 1), id(7, 2), id(2, 0), 'AO-099:1'], [id(2, 1), id(6, 1, true), id(3, 2)]];
  const r = ranking(whole, { picks: ['post-5'], lists });
  assert.deepEqual(r.R, [5, 3, 2, 6, 4, 1]);
  assert.deepEqual(r.focus, [5, 3, 2, 6, 4, 1]);
  assert.deepEqual(r.hint, [5, 3, 2, 6, 4, 1]);
  assert.deepEqual(r.fused, [3, 2, 7, 6], 'the notes chunk counts as its post; an unlisted id is dropped');
  assert.deepEqual(r.matched, [5, 3, 2, 6]);
  assert.deepEqual(ranking(whole, { picks: ['live-lab'], lists }).R.slice(0, 2), [7, 3]);
  assert.deepEqual(ranking(whole, {}).R, [6, 5, 4, 3, 2, 1]);
  assert.deepEqual(ranking(whole, {}).matched, []);
});

test('whole mode: every post in the pack, the live notebook after the catalog, and the user message', () => {
  const r = ranking(whole, { picks: ['post-2'], lists: [[id(3, 1)]] });
  const c = contextOf(whole, r, { q: 'what about {q}?', extraTokens: 80000 });
  assert.deepEqual([c.pack, c.extras, c.given, c.of, c.inPrompt], [0, [7], 7, 7, null]);
  assert.equal(c.user, 'This question matched 2 of the 7 posts closely. You have all 7 in full above.\n'
    + 'The most related, best first: [2] Title 2; [3] Title 3; [6] Title 6; [5] Title 5; [4] Title 4; [1] Title 1.\n\nQuestion: what about {q}?');
  const none = contextOf(whole, ranking(whole, { lists: [['AO-099:1']] }), { q: 'x', extraTokens: 0 });
  assert.match(none.user, /^No post matched this question closely\. You have all 7 in full above\.\nThe nearest, best first: \[6\]/);
  assert.equal(contextOf(whole, ranking(whole, {}), { q: 'x', blind: true }).user, 'You have all 7 in full above.\n\nQuestion: x');
});

// Packs of about two posts: AO 1-2, 3-4, 5-6; then 8 and 9, bigger.
const split = indexOf(built([...DOCS, doc(8), doc(9)], { caps: { WHOLE_CAP: 1, PACK_CAP: 280 } }).manifest);

test('split mode: the pack with most focus docs (a tie: the best-ranked, then the newer), focus outside it always', () => {
  const { m } = split;
  assert.equal(m.mode, 'split');
  const at = (n) => m.docs[n].pack;
  const r = ranking(split, { picks: ['post-3', 'post-4', 'post-1'] });
  const c = contextOf(split, r, { q: 'q', extraTokens: 0 });
  assert.equal(c.pack, at(3));
  assert.deepEqual(c.extras.filter((n) => r.focus.includes(n)).sort(), r.focus.filter((n) => at(n) !== at(3)).sort());
  assert.ok(c.extras.every((n) => r.focus.includes(n)), 'no fill under a 0 extra cap');
  const tie = contextOf(split, ranking(split, { picks: ['post-1', 'post-3'] }), { q: 'q', extraTokens: 0 });
  assert.equal(tie.pack, at(1), 'the best-ranked focus doc');
  assert.match(c.user, new RegExp(`^This question matched 3 of the 9 posts closely\\. You have ${c.given} of them in full: `
    + `${m.packs[c.pack].docs.length} in the first documents and ${c.extras.length} after the catalog\\. The catalog lists every post\\.`));
  for (const n of c.inPrompt) assert.ok(at(n) === c.pack || c.extras.includes(n));
});

test('split mode fills by R under ask_extra_tokens and keeps the live notebook last', () => {
  const r = ranking(split, { picks: ['live-lab'] });
  const big = contextOf(split, r, { q: 'q', extraTokens: 1e6 });
  assert.equal(big.extras.at(-1), 7, 'the live notebook after every stable doc');
  assert.ok(big.extras.length > contextOf(split, r, { q: 'q', extraTokens: 0 }).extras.length);
  const blind = contextOf(split, ranking(split, {}), { q: 'q', blind: true, extraTokens: 1e6 });
  assert.deepEqual([blind.pack, blind.extras], [split.m.packs.length - 1, []]);
  assert.match(blind.user, /^You have \d+ of the 9 posts in full\. The catalog lists every post\.\n\nQuestion: q$/);
});
