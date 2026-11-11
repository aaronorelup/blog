// Never-publish matching, on made-up terms: whole words, case-sensitive, runs of up to 3 words, and hosts with their
// subdomains and deeper paths; a list line is stored under the same key the text offers.
import assert from 'node:assert/strict';
import test from 'node:test';
import { keys, termKey } from '../../scripts/check/never-publish.mjs';

const offered = (text) => new Set([...keys(text)].map(([key]) => key));
const matches = (term, text) => offered(text).has(termKey(term));

test('words match whole and case-sensitively', () => {
  assert.ok(matches('Zorblax', "I worked at Zorblax's lab."));
  assert.ok(matches('Zorblax', 'the Zorblax-funded study'));
  assert.ok(!matches('Zorblax', 'zorblax, ZORBLAX and Zorblaxian'));
  assert.ok(matches('ZB', 'the ZB program'));
  assert.ok(!matches('ZB', 'a Zb test'));
});

test('runs of 2 and 3 words match across punctuation and line breaks', () => {
  assert.ok(matches('Acme Widget Co', 'At Acme\nWidget, Co. we'));
  assert.ok(!matches('Acme Widget Co', 'Acme widget Co'));
});

test("an underscore beside a word doesn't hide it: Markdown's _emphasis_, a file name", () => {
  assert.ok(matches('Zorblax', 'I worked at _Zorblax_ then.'));
  assert.ok(matches('Zorblax', 'I worked at __Zorblax__ then.'));
  assert.ok(matches('Acme Widget', 'at _Acme Widget_ we'));
  assert.ok(matches('Zorblax', '![the team](/media/x/Zorblax_team.webp)'));
  assert.ok(!matches('Zorblax', 'zorblax_team and Zorblaxian_team'));
  // A term written with an underscore still matches as written, and only as written.
  assert.ok(matches('zb_internal', 'the zb_internal flag'));
  assert.ok(!matches('zb_internal', 'the zb internal flag'));
});

test('a host matches its subdomains and deeper paths, a path only below itself', () => {
  assert.ok(matches('secret.example.dev', 'see https://hq.secret.example.dev/api/rules.'));
  assert.ok(matches('https://secret.example.dev/', '(secret.example.dev)'));
  assert.ok(!matches('secret.example.dev', 'example.dev'));
  assert.ok(matches('github.com/someone/private-repo', 'https://github.com/someone/private-repo/blob/main/x.md'));
  assert.ok(!matches('github.com/someone/private-repo', 'https://github.com/someone/public-repo'));
});

test('a path still matches with a query or a fragment after it', () => {
  assert.ok(matches('code.example.dev/someone/private-repo', 'https://code.example.dev/someone/private-repo?tab=readme'));
  assert.ok(matches('code.example.dev/someone/private-repo', '[x](https://code.example.dev/someone/private-repo#readme)'));
  assert.ok(!matches('code.example.dev/someone/private-repo', 'https://code.example.dev/someone/private-repository?tab=readme'));
  assert.ok(matches('video.example.dev/watch?v=abc123', 'https://www.video.example.dev/watch?v=abc123'));
  assert.ok(matches('video.example.dev/watch?v=abc123', 'https://www.video.example.dev/watch?v=abc123&t=30s'));
  assert.ok(matches('video.example.dev/watch?v=abc123', '<a href="https://video.example.dev/watch?v=abc123&amp;t=30s">'));
  assert.ok(!matches('video.example.dev/watch?v=abc123', 'https://video.example.dev/watch?v=abc1234&t=30s'));
});

test('a path still matches behind a port', () => {
  assert.ok(matches('secret.example.dev/admin', 'http://secret.example.dev:8443/admin/users'));
  assert.ok(matches('secret.example.dev', 'secret.example.dev:8443'));
  assert.ok(!matches('secret.example.dev/admin', 'http://secret.example.dev:8443/public'));
});

test('list lines with more than 3 words cannot match and are refused', () => {
  assert.equal(termKey('one two three four'), null);
});
