// RAG Goobie's eval helpers (scripts/eval/): the hand reading's flags, the judge passes merged, the judge's message
// (gold posts in full before the question, so a question's later passes and runs read them from the cache) and the
// hold-out's paired bootstrap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { hidden, marks, voice } from '../../scripts/eval/flags.mjs';
import { merged } from '../../scripts/eval/judged.mjs';
import { userMessage } from '../../scripts/eval/judge.mjs';
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
