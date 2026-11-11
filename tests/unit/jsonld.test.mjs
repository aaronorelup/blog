// The schema.org data of a listed post and of the homepage (src/lib/jsonld.js), and the text it is written as: no
// title can break out of the script element.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blogPosting, scriptText, webSite } from '../../src/lib/jsonld.js';
import { OWNER } from '../../src/data/site.js';

const url = 'https://aaronorelup.com/ledger/a/';
const post = {
  headline: 'A title',
  description: 'What happened.',
  published: new Date('2026-11-10'),
  url,
  image: 'https://aaronorelup.com/og/a.jpg?v=12345678',
};

test('a listed post: a BlogPosting of what the page already states, and nothing else', () => {
  assert.deepEqual(blogPosting(post), {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'A title',
    description: 'What happened.',
    datePublished: '2026-11-10T00:00:00.000Z',
    url,
    mainEntityOfPage: url,
    image: 'https://aaronorelup.com/og/a.jpg?v=12345678',
    author: { '@type': 'Person', name: 'Aaron Orelup', url: 'https://aaronorelup.com/about/' },
  });
  assert.equal(blogPosting(post).author.name, OWNER.name);
  assert.equal('dateModified' in blogPosting(post), false);
});

test('a post Claude wrote as "I" names no author, and is the same otherwise', () => {
  const byClaude = blogPosting({ ...post, voice: 'claude' });
  assert.equal('author' in byClaude, false);
  assert.equal(scriptText(byClaude).includes('author'), false);
  const { author, ...rest } = blogPosting(post);
  assert.deepEqual(author, { '@type': 'Person', name: OWNER.name, url: 'https://aaronorelup.com/about/' });
  assert.deepEqual(byClaude, rest);
  // Only 'claude' is a voice (src/schemas/post.ts): with none, the author is the owner.
  assert.deepEqual(blogPosting({ ...post, voice: undefined }).author, author);
});

test('a post with no share image claims none', () => {
  assert.equal('image' in blogPosting({ ...post, image: undefined }), false);
});

test('the homepage: a WebSite with a name and a url, no SearchAction', () => {
  assert.deepEqual(webSite('https://aaronorelup.com/'),
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Aaron Orelup', url: 'https://aaronorelup.com/' });
});

test('the script text: no "<" survives, and it parses back to the same data', () => {
  const hostile = { ...post, headline: 'He said "stop" </script><script>alert(1)</script> <!-- \\  ', description: "it's <b>&amp;" };
  const text = scriptText(blogPosting(hostile));
  assert.equal(text.includes('<'), false);
  assert.deepEqual(JSON.parse(text), blogPosting(hostile));
  assert.equal(JSON.parse(text).headline, hostile.headline);
  // A "<" is written as the six characters <, not as a doubled backslash.
  assert.equal(scriptText({ a: '<' }), '{"a":"\\u003c"}');
});
