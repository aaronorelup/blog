// RAG Goobie's marks made readers' cites (worker/ask/cite.js): [n.s], [n.Ns] and [n] resolved through the manifest,
// runs split, distinct sections numbered in order of first use, unknown marks dropped with their space, em dashes
// gone, today's cite shape; the streaming citer gives exactly cite()'s text and cites over any chunking.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cite, citer } from '../../worker/ask/cite.js';
import { indexOf } from '../../worker/ask/corpus.js';
import { built } from './ask-fixture.mjs';

const ix = indexOf(built().manifest);
const resolve = (mark) => ix.resolve(mark);

test('[n.s], [n.Ns] and [n] resolve to their sections; distinct ones are numbered by first use', () => {
  const { answer, cites } = cite('It took 20 s [2.2]. The notes say so [6.N1]. Post 4 too [4]. Again [2.2].', resolve);
  assert.equal(answer, 'It took 20 s [1]. The notes say so [2]. Post 4 too [3]. Again [1].');
  assert.deepEqual(cites, [
    { n: 1, slug: 'post-2', kind: 'post', anchor: 'first', heading: 'First', title: 'Title 2' },
    { n: 2, slug: 'post-6', kind: 'notes', anchor: 'what-went-wrong', heading: 'What went wrong', title: 'Post 6: the making-of notes' },
    { n: 3, slug: 'post-4', kind: 'post', anchor: '', heading: '', title: 'Title 4' },
  ]);
  assert.deepEqual(Object.keys(cites[0]), ['n', 'slug', 'kind', 'anchor', 'heading', 'title']);
});

test('[n.0] is the short version, [n.1] the opening, and a mark of a post\'s top is the same cite as [n]', () => {
  const { answer, cites } = cite('A [3.0]. B [3.1]. C [3].', resolve);
  assert.equal(answer, 'A [1]. B [2]. C [2].');
  assert.deepEqual(cites.map((c) => c.anchor), ['short', '']);
});

test('runs split, unknown marks go with the space before them, and em dashes become commas', () => {
  const { answer, cites } = cite('One [2.2, 3.2]. Two [2.2; 99.1][3.2]. Gone [99.1] — and [8] [2.77] done.', resolve);
  assert.equal(answer, 'One [1][2]. Two [1][2]. Gone, and done.');
  assert.equal(cites.length, 2);
  assert.deepEqual(cite('Nothing covers that.', resolve), { answer: 'Nothing covers that.', cites: [] });
});

test('in split mode a section mark must name a doc in the prompt; a bare [n] may name any post', () => {
  const within = new Set([2]);
  const { answer } = cite('In [2.2]. Out [3.2]. Known [3].', (m) => ix.resolve(m, within));
  assert.equal(answer, 'In [1]. Out. Known [2].');
});

const ANSWERS = [
  'Aaron measured it [2.2]. Claude fixed it [6.N1] — fast [6.0][2.2].',
  ' [99.1] Leading junk, then [3.1, 4.2; 5.3]. Trailing [7.2]  ',
  'Text with [brackets] and [ 2 ] and [2.2 and a dash—here [3] [44.4][5].',
  '— start dash [1.0]   — end [2.3]',
  'Odd [', 'Odd [2.', 'Odd [2.2', 'A [6.N0][6.N1] [6] [6.N9].',
];

test('the streaming citer gives cite()\'s text and cites over every chunking', () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const text of ANSWERS) {
    const want = cite(text, resolve);
    for (let run = 0; run < 200; run++) {
      const c = citer(resolve);
      const got = { text: '', cites: [] };
      const take = ({ text: t, cites }) => { got.cites.push(...cites); got.text += t; };
      for (let i = 0; i < text.length;) {
        const n = 1 + Math.floor(rnd() * 6);
        take(c.push(text.slice(i, i + n)));
        i += n;
      }
      take(c.end());
      assert.equal(got.text, want.answer, `${JSON.stringify(text)} run ${run}`);
      assert.deepEqual(got.cites, want.cites);
    }
  }
});

test('a cite goes out before the text that uses it', () => {
  const c = citer(resolve);
  const first = c.push('It took 20 s [2.2');
  assert.deepEqual(first, { text: 'It took 20 s', cites: [] });
  const second = c.push('] then more.');
  assert.equal(second.cites[0].n, 1);
  assert.equal(second.text, ' [1] then more.');
});
