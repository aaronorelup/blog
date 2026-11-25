// Who made a post (src/schemas/credits.js): what the page prints of a credits block, what npm run check holds a post
// to, and that the schema hands the block to the page without ever failing a build over it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';
import { isHeld, isLive } from '../../src/data/exempt.js';
import { CREDITS_FROM, costLabel, costOf, creditParts, creditRules, creditsOf } from '../../src/schemas/credits.js';

const rules = (data) => {
  const found = [];
  creditRules(data, (key, message) => found.push(`${key}: ${message}`));
  return found;
};
const keys = (data) => rules(data).map((line) => line.split(':')[0]);

test('the line: owner, worker with its cost, orchestrator, writer, and only what is there', () => {
  assert.deepEqual(creditParts(creditsOf({ owner: 'Gages', worker: 'Opus 5.5 max', cost: 14.82 })),
    [['Owner', 'Gages'], ['Worker', 'Opus 5.5 max $15']]);
  assert.deepEqual(creditParts(creditsOf({ writer: 'Sonnet 5.5', orchestrator: 'Fable 5.2', worker: 'Anthropic fleet', owner: 'Aaron' })),
    [['Owner', 'Aaron'], ['Worker', 'Anthropic fleet'], ['Orchestrator', 'Fable 5.2'], ['Writer', 'Sonnet 5.5']]);
  assert.deepEqual(creditParts(creditsOf({ owner: '', worker: '' })), []);
  assert.deepEqual(creditParts(undefined), []);
});

test('a cost is dollars, printed whole', () => {
  assert.equal(costOf(35), 35);
  assert.equal(costOf('$14.82'), 14.82);
  assert.equal(costOf('35'), 35);
  for (const no of ['about 35', '35 dollars', -1, NaN, true, {}]) assert.equal(costOf(no), null);
  assert.equal(costLabel(14.82), '$15');
  assert.equal(costLabel(2430), '$2,430');
  assert.equal(costLabel(0.4), 'under $1');
});

test('the page never prints a value the rules refuse', () => {
  assert.equal(creditsOf('Gages'), undefined);
  assert.equal(creditsOf(['Gages']), undefined);
  assert.deepEqual(creditsOf({ owner: 'someone@example.com', worker: 'Opus 5.5', writer: 'https://example.com/x', cost: 'a lot' }),
    { worker: 'Opus 5.5' });
  assert.deepEqual(creditsOf({ owner: 'Gages', cost: 12 }), { owner: 'Gages' });
  assert.equal(creditsOf({ worker: 'x'.repeat(41) }), undefined);
});

test('the rules: short names, a number for the cost, and an owner and a worker from CREDITS_FROM on', () => {
  const before = '2026-11-26';
  assert.deepEqual(rules({ date: before }), []);
  assert.deepEqual(rules({ date: before, credits: { owner: '', worker: '' } }), []);
  assert.deepEqual(rules({ date: CREDITS_FROM, credits: { owner: 'Gages', worker: 'Opus 5.5 max', cost: 14.82 } }), []);
  assert.deepEqual(keys({ date: CREDITS_FROM }), ['credits']);
  assert.deepEqual(keys({ date: new Date(`${CREDITS_FROM}T00:00:00Z`), credits: { owner: 'Gages', worker: '' } }), ['credits']);
  assert.deepEqual(keys({ date: before, credits: 'Gages' }), ['credits']);
  assert.deepEqual(keys({ date: before, credits: { owner: 'a@b.c', worker: 'session_01AbCdEf', writer: 'x'.repeat(41), orchestrator: 5 } }),
    ['owner', 'worker', 'orchestrator', 'writer']);
  assert.deepEqual(keys({ date: before, credits: { owner: 'Aaron', worker: 'Opus 5.5', cost: 'a lot' } }), ['cost']);
  assert.deepEqual(keys({ date: before, credits: { owner: 'Aaron', cost: 3 } }), ['cost']);
});

const dir = new URL('../../src/content/posts/', import.meta.url);
const posts = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  .map((f) => ({ file: f, data: matter(fs.readFileSync(new URL(f, dir), 'utf8')).data }));

test('every post passes the credit rules, and the schema hands its credits to the page', () => {
  for (const { file, data } of posts.filter((p) => !isLive(p.data.id) && !isHeld(p.data.id))) {
    assert.deepEqual(rules(data), [], file);
    assert.deepEqual(collections.posts.schema.safeParse(data).data?.credits, creditsOf(data.credits), file);
  }
});

test('a credits block the rules refuse still builds', () => {
  const { data } = posts.find((p) => !isLive(p.data.id) && !isHeld(p.data.id));
  for (const credits of ['Gages', { owner: 5, cost: '$35 or so' }, null]) {
    const parsed = collections.posts.schema.safeParse({ ...data, credits });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.credits, undefined);
  }
});
