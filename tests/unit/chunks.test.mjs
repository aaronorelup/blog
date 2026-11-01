// src/lib/search/chunks.js: a post's lead and h2 sections become chunks of at most MAX characters, cut at block
// boundaries (a long block at its sentences, a pasted run with no spaces every MAX characters); the manifest's v
// moves with every doc (live.test.mjs: but a live notebook's).
import test from 'node:test';
import assert from 'node:assert/strict';
import { docOf, manifestOf, MAX, shortVersion } from '../../src/lib/search/chunks.js';

const para = (n, len = 400) => `Paragraph ${n} ${'word '.repeat(len / 5)}`.trim();
const lead = shortVersion('A summary.', { verdict: 'Yes', takeaway: 'It works.', points: ['One.', 'Two.'] });
const sections = [
  { anchor: '', heading: '', text: para(0), folded: false },
  { anchor: 'long', heading: 'Long', text: [1, 2, 3, 4, 5].map((n) => para(n)).join('\n\n'), folded: false },
  { anchor: 'empty', heading: 'Empty', text: '', folded: false },
  { anchor: 'huge', heading: 'Huge', text: Array.from({ length: 40 }, (_, i) => `Sentence ${i} is here.`).join(' ').repeat(3), folded: true },
  { anchor: 'blob', heading: 'Blob', text: `Pasted: ${'x'.repeat(4000)}`, folded: false },
];
const post = (slug, secs = sections) => docOf({ kind: 'post', id: 'AO-045', slug, title: 'T', lead, text: { sections: secs } });

test('a post is its short version, then its sections in pieces of at most MAX characters', () => {
  const { id, chunks } = post('x');
  assert.equal(id, 'AO-045');
  assert.equal(chunks[0].anchor, 'short');
  assert.equal(chunks[0].text, 'A summary.\n\nYes\n\nIt works.\n\nOne.\n\nTwo.');
  assert.deepEqual(chunks.map((c) => c.n), chunks.map((_, i) => i));
  assert.ok(chunks.every((c) => c.text.length <= MAX && c.text));
  assert.ok(!chunks.some((c) => c.anchor === 'empty'));
  const long = chunks.filter((c) => c.anchor === 'long');
  assert.deepEqual(long.map((c) => c.text.split('\n\n').length), [3, 2]);
  assert.ok(chunks.filter((c) => c.anchor === 'huge').every((c) => /^Sentence \d+ is here\./.test(c.text)));
  assert.deepEqual(chunks.filter((c) => c.anchor === 'blob').map((c) => c.text.length), [7, MAX, MAX, 1000]);
});

test('notes get their own id', () => {
  const notes = docOf({ kind: 'notes', id: 'AO-045', slug: 'x', title: 'N', lead: { anchor: '', heading: '', text: 'S.' }, text: { sections } });
  assert.equal(notes.id, 'AO-045n');
});

test("the manifest's v moves with any doc's chunks, and each doc keeps its own hash", () => {
  const base = manifestOf([post('a'), post('b')]);
  const edited = manifestOf([post('a', [{ ...sections[0], text: 'Changed.' }]), post('b')]);
  assert.deepEqual(base.live, []);
  assert.notEqual(edited.v, base.v);
  assert.notEqual(edited.docs['post:a'], base.docs['post:a']);
  assert.equal(edited.docs['post:b'], base.docs['post:b']);
});
