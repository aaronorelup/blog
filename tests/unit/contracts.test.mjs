// The frozen contracts over the dist/ the last `npm run build` wrote (P step 2 builds first), and each check shown
// failing on a seeded break, so a check that silently passes everything can't hide here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { check, previewsProblems, statsPagesProblems, rssProblems, baselineProblems, shareUrlProblems, jsonLdProblems } from '../../scripts/build/contracts.mjs';

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

test('a page: one canonical and one og:url, both its own address', () => {
  const head = (canonical, og) => `<html lang="en"><head>${canonical}${og}</head><body><link rel="canonical" href="x"></body></html>`;
  const canonical = '<link rel="canonical" href="https://aaronorelup.com/ledger/a/">';
  const og = '<meta property="og:url" content="https://aaronorelup.com/ledger/a/">';
  assert.deepEqual(shareUrlProblems(head(canonical, og), '/ledger/a/'), []);
  assert.equal(shareUrlProblems(head(canonical, ''), '/ledger/a/').length, 1);
  assert.equal(shareUrlProblems(head('', og), '/ledger/a/').length, 1);
  assert.equal(shareUrlProblems(head(canonical, og), '/ledger/b/').length, 2);
  assert.equal(shareUrlProblems(head(canonical + canonical, og), '/ledger/a/').length, 1);
  assert.equal(shareUrlProblems(head(canonical, og.replace('/ledger/a/', '/ledger/a')), '/ledger/a/').length, 1);
});

test('a listed post: one JSON-LD block that parses, its url the page address', () => {
  const block = (json) => `<script type="application/ld+json">${json}</script>`;
  const page = (...blocks) => `<html lang="en"><head><script>var a = 1;</script>${blocks.join('')}</head><body></body></html>`;
  const owner = '"author":{"@type":"Person","name":"Aaron Orelup","url":"https://aaronorelup.com/about/"}';
  const post = (author) => block(`{"@type":"BlogPosting","headline":"a \\u003c/script> b","url":"https://aaronorelup.com/ledger/a/"${author}}`);
  const good = post(`,${owner}`);
  assert.deepEqual(jsonLdProblems(page(good), '/ledger/a/'), []);
  assert.equal(jsonLdProblems(page(), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(page(good, good), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(page(good), '/ledger/b/').length, 1);
  assert.equal(jsonLdProblems(page(block(`{"@type":"BlogPosting",${owner}}`)), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(page(block('{"url":"https://aaronorelup.com/ledger/a/"')), '/ledger/a/').length, 1);
  // An unescaped </script> in a title ends the block early: what is left does not parse.
  assert.equal(jsonLdProblems(page(block('{"headline":"a </script> b","url":"https://aaronorelup.com/ledger/a/"}')), '/ledger/a/').length, 1);
});

test('a listed post: the author is the owner, and none where the page says Claude wrote it', () => {
  const block = (author) => `<head><script type="application/ld+json">{"url":"https://aaronorelup.com/ledger/a/"${author}}</script></head>`;
  const person = (name, url = 'https://aaronorelup.com/about/') => `,"author":{"@type":"Person","name":"${name}","url":"${url}"}`;
  // Aaron's post: exactly the owner, nothing less and nothing more.
  assert.deepEqual(jsonLdProblems(block(person('Aaron Orelup')), '/ledger/a/'), []);
  assert.equal(jsonLdProblems(block(''), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(block(person('Claude')), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(block(person('Aaron Orelup', 'https://aaronorelup.com/')), '/ledger/a/').length, 1);
  assert.equal(jsonLdProblems(block(`,"author":[${person('Aaron Orelup').slice(10)},${person('Claude').slice(10)}]`), '/ledger/a/').length, 1);
  // Claude's post: no author at all, not the owner and not a substitute.
  assert.deepEqual(jsonLdProblems(block(''), '/ledger/a/', true), []);
  assert.equal(jsonLdProblems(block(person('Aaron Orelup')), '/ledger/a/', true).length, 1);
  assert.equal(jsonLdProblems(block(person('Claude')), '/ledger/a/', true).length, 1);
  assert.equal(jsonLdProblems(block(',"author":null'), '/ledger/a/', true).length, 1);
});

test('the baseline: every path built or redirected', () => {
  const built = new Set(['/', '/ledger/a/']);
  assert.deepEqual(baselineProblems(['/', '/ledger/a/', '/posts/'], (p) => built.has(p), new Set(['/posts'])), []);
  assert.equal(baselineProblems(['/ledger/gone/'], (p) => built.has(p), new Set()).length, 1);
});
