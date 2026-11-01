// The frozen contracts over the dist/ the last `npm run build` wrote (P step 2 builds first), and each check shown
// failing on a seeded break, so a check that silently passes everything can't hide here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { check, previewsProblems, statsPagesProblems, rssProblems, baselineProblems } from '../../scripts/build/contracts.mjs';

const dist = fileURLToPath(new URL('../../dist', import.meta.url));
const listed = new Set(['a', 'b']);
const guid = (s) => `<guid isPermaLink="true">https://aaronorelup.com/ledger/${s}/</guid>`;

test('the built site keeps every contract', () => {
  assert.deepEqual(check(dist), []);
});

test('previews.json: its keys are exactly the listed posts, each card has an id and a title', () => {
  const card = { id: 'AO-001', title: 'A' };
  assert.deepEqual(previewsProblems({ posts: { a: card, b: card } }, listed), []);
  assert.equal(previewsProblems({ posts: { a: card } }, listed).length, 1);
  assert.equal(previewsProblems({ posts: { a: card, b: card, c: card } }, listed).length, 1);
  assert.equal(previewsProblems({ posts: { a: card, b: { id: 'AO-2' } } }, listed).length, 1);
  assert.equal(previewsProblems([], listed).length, 1);
});

test('stats-pages.txt: no unlisted post, nothing deeper than a post but its notes', () => {
  assert.deepEqual(statsPagesProblems('# x\n/\n/ledger/a/\n/ledger/b/notes/\n/courses/', listed), []);
  assert.equal(statsPagesProblems('/ledger/z/', listed).length, 1);
  assert.equal(statsPagesProblems('/ledger/z/notes/', listed).length, 1);
  assert.equal(statsPagesProblems('/ledger/a/private/', listed).length, 1);
});

test('rss.xml: one guid per listed post, each the post URL', () => {
  assert.deepEqual(rssProblems(guid('a') + guid('b'), listed), []);
  assert.equal(rssProblems(guid('a'), listed).length, 1);
  assert.equal(rssProblems(guid('a') + guid('b') + '<guid>https://aaronorelup.com/posts/a</guid>', listed).length, 1);
  assert.equal(rssProblems(guid('a') + guid('a') + guid('b'), listed).length, 1);
});

test('the baseline: every path built or redirected', () => {
  const built = new Set(['/', '/ledger/a/']);
  assert.deepEqual(baselineProblems(['/', '/ledger/a/', '/posts/'], (p) => built.has(p), new Set(['/posts'])), []);
  assert.equal(baselineProblems(['/ledger/gone/'], (p) => built.has(p), new Set()).length, 1);
});
