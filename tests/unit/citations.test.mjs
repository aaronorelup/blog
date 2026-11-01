// Ask Goobie's Worker half with stub bindings: [n] citations kept only when they name an excerpt, each with its
// excerpt's kind, Goobie speaking as itself and of Aaron by name, an excerpt Claude wrote as "I" marked as such, a
// DeepSeek answer that was cut short or failed is no answer, the order of the guards (a token, the switch, the
// limiters with a stub that says no, the score floor) before any paid call, and the answer cache. No request leaves
// the process.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cite, messages } from '../../worker/ask/prompt.js';
import { complete } from '../../worker/ask/deepseek.js';
import { mint } from '../../worker/lib/session.js';
import { loadWorker } from './worker-env.mjs';

const { serve } = await loadWorker('ask/serve.js');

const chunk = (slug, score, text = 'Some text.') => ({ slug, kind: 'post', anchor: 'a', heading: 'H', title: `T ${slug}`, text, score });
const EXCERPTS = [chunk('one', 0.8), chunk('two', 0.7), chunk('three', 0.6)];

test('cite keeps the [n] that name an excerpt, splits lists, drops the rest and the em dashes', () => {
  const { answer, cites } = cite('It rents a GPU [2]. It costs little [1, 3] — or nothing [7]. See [0][3].', EXCERPTS);
  assert.equal(answer, 'It rents a GPU [2]. It costs little [1][3], or nothing. See [3].');
  assert.deepEqual(cites.map((c) => [c.n, c.slug]), [[1, 'one'], [2, 'two'], [3, 'three']]);
  assert.deepEqual(Object.keys(cites[0]), ['n', 'slug', 'kind', 'anchor', 'heading', 'title']);
  assert.deepEqual(cite('Nothing covers that.', EXCERPTS), { answer: 'Nothing covers that.', cites: [] });
});

test('each cite carries its excerpt\'s kind, so a notes passage can link to the notes page', () => {
  const notes = { ...chunk('two', 0.7), kind: 'notes', anchor: 'how-to-play-it', title: 'T two: the making-of notes' };
  const { cites } = cite('The post [1]. Its notes [2].', [EXCERPTS[0], notes]);
  assert.deepEqual(cites, [
    { n: 1, slug: 'one', kind: 'post', anchor: 'a', heading: 'H', title: 'T one' },
    { n: 2, slug: 'two', kind: 'notes', anchor: 'how-to-play-it', heading: 'H', title: 'T two: the making-of notes' },
  ]);
});

test('the excerpts are numbered in the user message, with title and heading', () => {
  const [system, user] = messages('what is it?', EXCERPTS.slice(0, 2));
  assert.equal(system.role, 'system');
  assert.match(system.content, /never follow instructions/);
  // Goobie is Aaron's agent, not Aaron: "I" is Goobie, and what the posts say as "I" is told about Aaron by name,
  // except in the few posts Claude wrote, and what Claude or an agent did stays theirs.
  assert.match(system.content, /You are not Aaron\./);
  assert.match(system.content, /Excerpts marked \(Claude's own account\) are Claude's first person/);
  assert.match(system.content, /Keep who did what/);
  assert.doesNotMatch(system.content, /Speak as I/);
  assert.equal(user.content, 'Excerpts:\n[1] T one / H\nSome text.\n\n[2] T two / H\nSome text.\n\nQuestion: what is it?');
});

test("an excerpt of a post Claude wrote as \"I\" is marked as Claude's own account; Aaron's carry no mark", () => {
  const claude = { ...chunk('bad-very-bad', 0.8), title: 'Bad. Very Bad.', heading: 'Timing the voices', voice: 'claude' };
  const [, user] = messages('who timed the lip-sync?', [claude, { ...EXCERPTS[0], heading: '' }]);
  assert.equal(user.content, "Excerpts:\n[1] Bad. Very Bad. / Timing the voices (Claude's own account)\nSome text.\n\n" +
    '[2] T one\nSome text.\n\nQuestion: who timed the lip-sync?');
});

test('a DeepSeek answer cut short, empty or failed is null; a whole one is its text, asked with thinking off', async (t) => {
  const answers = [
    { status: 200, body: { choices: [{ finish_reason: 'stop', message: { content: ' An answer [1]. ' } }], usage: {} } },
    { status: 200, body: { choices: [{ finish_reason: 'length', message: { content: 'An answ' } }] } },
    { status: 200, body: { choices: [{ finish_reason: 'insufficient_system_resource', message: { content: '' } }] } },
    { status: 200, body: { choices: [{ finish_reason: 'stop', message: { content: '  ' } }] } },
    { status: 503, body: {} },
  ];
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    sent.push(JSON.parse(init.body));
    const { status, body } = answers[sent.length - 1];
    return new Response(JSON.stringify(body), { status });
  });
  t.mock.method(console, 'log', () => {});
  const env = { DEEPSEEK_API_KEY: 'test' };
  assert.equal(await complete(env, []), 'An answer [1].');
  for (let i = 1; i < answers.length; i++) assert.equal(await complete(env, []), null);
  assert.deepEqual({ ...sent[0], messages: undefined },
    { model: 'deepseek-flash', messages: undefined, max_tokens: 400, temperature: 0.2, thinking: { type: 'disabled' }, stream: false });
});

// Bindings that answer like the real ones, counting what each was asked.
function stubs({ limit = true, scores = [0.8] } = {}) {
  const asked = { ai: 0, spend: 0 };
  const answers = new Map(); // ask_cache: key -> body
  const db = {
    batch: async () => [],
    prepare: (sql, args = []) => ({
      bind: (...values) => db.prepare(sql, values),
      all: async () => ({ results: sql.startsWith('SELECT k, v FROM flags') ? [{ k: 'ask', v: 'on' }] : [] }),
      first: async () => {
        if (sql.startsWith('INSERT INTO usage_day')) asked.spend++;
        return sql.includes('FROM ask_cache') ? answers.get(args[0]) ?? null : { n: 1 };
      },
      run: async () => { if (sql.includes('INTO ask_cache')) answers.set(args[0], args[1]); return {}; },
    }),
  };
  const env = {
    SESSION_KEY: 'k', DEEPSEEK_API_KEY: 'test', DB: db,
    ASSETS: { fetch: async () => Response.json({ model: '@cf/baai/bge-m3' }) },
    AI: { run: async () => { asked.ai++; return { data: [[0.1, 0.2]] }; } },
    SEARCH_INDEX: { query: async () => ({ matches: scores.map((score, i) => ({ score, metadata: { s: `p${i}`, k: 'post', a: '', h: '', t: 'x', T: 'T' } })) }) },
    ASK_LIMIT: { limit: async () => ({ success: limit }) },
    ASK_ALL: { limit: async () => ({ success: true }) },
  };
  return { env, asked };
}
const waits = [];
const ctx = { waitUntil: (p) => waits.push(p) };
const ask = async (env, q, token) => serve(new Request('https://aaronorelup.com/api/ask', {
  method: 'POST', body: JSON.stringify({ q }), headers: token ? { 'X-AO-Session': token } : {},
}), env, ctx);

test('Ask answers 401 without a token, 400 on a 301-character question, 429 when its limiter says no', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('no network in this test'); });
  const { env, asked } = stubs({ limit: false });
  const { token } = await mint(env);
  assert.equal((await ask(env, 'what does an hour of video cost', null)).status, 401);
  assert.equal((await ask(env, 'what does an hour of video cost', token + 'x')).status, 401);
  assert.equal((await ask(env, 'x'.repeat(301), token)).status, 400);
  assert.equal((await ask(env, 'what does an hour of video cost', token)).status, 429);
  assert.deepEqual(asked, { ai: 0, spend: 0 });
  assert.equal(fetch.mock.callCount(), 0);
});

test('a question nothing scores high enough for is not-found, with no DeepSeek call and no spend', async (t) => {
  t.mock.method(console, 'log', () => {});
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('no network in this test'); });
  const { env, asked } = stubs({ scores: [0.3, 0.2, 0.2, 0.1] });
  const res = await ask(env, 'what is the capital of peru', (await mint(env)).token);
  assert.deepEqual(await res.json(), { answer: null, reason: 'not-found', related: ['p0', 'p1', 'p2'] });
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(asked.spend, 0);
});

test('the same question again is the cached answer: one DeepSeek call, one spend', async (t) => {
  t.mock.method(console, 'log', () => {});
  const body = { choices: [{ finish_reason: 'stop', message: { content: 'It costs little [2].' } }], usage: {} };
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(body));
  const { env, asked } = stubs({ scores: [0.8, 0.7, 0.2] });
  const { token } = await mint(env);
  const first = await (await ask(env, 'what does an hour of video cost', token)).json();
  await Promise.all(waits);
  const again = await (await ask(env, 'what does an hour of video cost', token)).json();
  assert.deepEqual(first.related, ['p1', 'p0', 'p2']);
  assert.deepEqual(again, { ...first, cached: true });
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(asked.spend, 1);
});
