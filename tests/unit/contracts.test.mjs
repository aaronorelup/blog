// The frozen contracts over the dist/ the last `npm run build` wrote (P step 2 builds first), and each check shown
// failing on a seeded break, so a check that silently passes everything can't hide here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { check, previewsProblems, statsPagesProblems, rssProblems, baselineProblems, shareUrlProblems, shareImageProblems,
  imageSize, sitemapPaths } from '../../scripts/build/contracts.mjs';

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

test('a listed page: one twitter:card and one og:image, a picture of the build at the right size', () => {
  const head = (...tags) => `<html lang="en"><head>${tags.join('')}</head><body><meta property="og:image" content="x"></body></html>`;
  const card = '<meta name="twitter:card" content="summary_large_image">';
  const image = (p) => `<meta property="og:image" content="https://aaronorelup.com${p}">`;
  const sizes = { '/og/page/about.jpg': { width: 1200, height: 630 }, '/og/page/small.jpg': { width: 600, height: 315 },
    '/courses/night.jpg': { width: 1920, height: 1080 }, '/courses/thumb.png': { width: 200, height: 200 } };
  const sizeOf = (p) => sizes[p] ?? null;
  const problems = (...tags) => shareImageProblems(head(...tags), '/about/', sizeOf);
  assert.deepEqual(problems(card, image('/og/page/about.jpg?v=0a1b2c3d')), []);
  assert.deepEqual(problems(card, image('/courses/night.jpg')), []);
  assert.equal(problems(image('/og/page/about.jpg')).length, 1);                       // no twitter:card
  assert.equal(problems(card.replace('summary_large_image', 'summary'), image('/og/page/about.jpg')).length, 1);
  assert.equal(problems(card).length, 1);                                               // no og:image
  assert.equal(problems().length, 2);
  assert.equal(problems(card, image('/og/page/about.jpg'), image('/og/page/about.jpg')).length, 1);
  assert.equal(problems(card, image('/og/page/gone.jpg')).length, 1);                  // not in the build
  assert.equal(problems(card, image('/og/page/small.jpg')).length, 1);                 // a card of the wrong size
  assert.equal(problems(card, image('/courses/thumb.png')).length, 1);                 // too small for X
  assert.equal(problems(card, '<meta property="og:image" content="https://example.com/og/page/about.jpg">').length, 1);
});

test('imageSize: a JPEG frame header or a PNG header, and nothing else', () => {
  const jpeg = (sof) => Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 4, 1, 2, 0xff, 0xc4, 0, 3, 9, 0xff, sof, 0, 11, 8, 0x02, 0x76, 0x04, 0xb0, 3, 0, 0, 0]);
  assert.deepEqual(imageSize(jpeg(0xc0)), { width: 1200, height: 630 });
  assert.deepEqual(imageSize(jpeg(0xc2)), { width: 1200, height: 630 });               // progressive, as mozjpeg writes
  const png = Buffer.alloc(24);
  png.writeUInt32BE(0x89504e47, 0);
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(630, 20);
  assert.deepEqual(imageSize(png), { width: 1200, height: 630 });
  assert.equal(imageSize(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
  assert.equal(imageSize(Buffer.from([0xff, 0xd8, 0xff, 0xd9])), null);
  assert.equal(imageSize(Buffer.alloc(0)), null);
});

test('the sitemap: its pages as paths', () => {
  const xml = '<urlset><url><loc>https://aaronorelup.com/</loc></url><url><loc>https://aaronorelup.com/now/2026-11-08/</loc><lastmod>2026-11-08</lastmod></url></urlset>';
  assert.deepEqual(sitemapPaths(xml), ['/', '/now/2026-11-08/']);
});

test('the baseline: every path built or redirected', () => {
  const built = new Set(['/', '/ledger/a/']);
  assert.deepEqual(baselineProblems(['/', '/ledger/a/', '/posts/'], (p) => built.has(p), new Set(['/posts'])), []);
  assert.equal(baselineProblems(['/ledger/gone/'], (p) => built.has(p), new Set()).length, 1);
});
