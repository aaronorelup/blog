// Never-publish matching, on made-up terms: whole words, case-sensitive, runs of up to 3 words, and hosts with their
// subdomains and deeper paths; a list line is stored under the same key the text offers.
import assert from 'node:assert/strict';
import test from 'node:test';
import { jsonKeys, keys, termKey } from '../../scripts/check/never-publish.mjs';

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

test('a host matches its subdomains and deeper paths, a path only below itself', () => {
  assert.ok(matches('secret.example.dev', 'see https://hq.secret.example.dev/api/rules.'));
  assert.ok(matches('https://secret.example.dev/', '(secret.example.dev)'));
  assert.ok(!matches('secret.example.dev', 'example.dev'));
  assert.ok(matches('github.com/someone/private-repo', 'https://github.com/someone/private-repo/blob/main/x.md'));
  assert.ok(!matches('github.com/someone/private-repo', 'https://github.com/someone/public-repo'));
});

test('list lines with more than 3 words cannot match and are refused', () => {
  assert.equal(termKey('one two three four'), null);
});

test('a .json file is read as its strings, decoded: a term after a line break, a tab or as a \\u escape matches', () => {
  const raw = `${JSON.stringify({ answer: 'First line.\nZorblax at a line start.', tool: 'id\tZorblax' })}\n{"cite":"\\u005aorblax"}`;
  const offered = (gen) => new Set([...gen].map(([key]) => key));
  assert.ok(!offered(keys(raw)).has('Zorblax'));   // the raw text reads "nZorblax", "tZorblax" and "u005aorblax"
  assert.ok(offered(jsonKeys(raw)).has('Zorblax'));
  assert.ok(offered(jsonKeys(raw)).has('Zorblax at a'));
  const lines = [...jsonKeys(raw)].filter(([key]) => key === 'Zorblax').map(([, i]) => raw.slice(0, i).split('\n').length);
  assert.deepEqual([...new Set(lines)], [1, 2]);   // reported at the line of its string
  assert.ok(offered(jsonKeys('["Zorblax", "rules"]')).has('Zorblax rules'));   // a run across two strings, as raw text reads it
});
