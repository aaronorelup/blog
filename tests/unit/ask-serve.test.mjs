// POST /api/ask end to end through serve.js and run.js, with stub bindings over a small built blog (ask-fixture.mjs)
// and DeepSeek mocked: the guards before any paid call, the event stream and its order, the answer cache and the
// live-hash rule, the reservation, its settle and release, the caps (spend() fixed), ask_search_daily counting Ask's
// embeddings apart from /api/search's, nothing about the visitor or the planner's queries in any request or event,
// the binding-call budget of a cold isolate's first question.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mint } from '../../worker/lib/session.js';
import { cost } from '../../src/lib/ask/price.js';
import { built, env as stubEnv, id } from './ask-fixture.mjs';
import { loadWorker } from './worker-env.mjs';

const { serve } = await loadWorker('ask/serve.js');
const { flags, spend, today } = await loadWorker('lib/flags.js');
const { sse, HEARTBEAT } = await loadWorker('ask/events.js');

const blog = built();
const { env, asked, db } = stubEnv(blog);
const realNow = Date.now;
let skew = 0;
Date.now = () => realNow() + skew;
const fresh = () => { skew += 31e3; };   // past the flags' 30 s memo
const { token } = await mint(env);
const PLAN = { queries: ['secret planner words', 'second query'], topics: ['video', 'nope'], picks: ['post-3', 'unlisted-x', 'post-3'] };
const USAGE = { prompt_tokens: 1000, prompt_cache_hit_tokens: 900, prompt_cache_miss_tokens: 100, completion_tokens: 50 };
const ANSWER = ['Aaron measured 30 seconds [3.2]', '. Claude wrote the notes [6.N1] — fast [6.0].'];

// DeepSeek, as fetch sees it: the planner's JSON and the answer's SSE, each recorded.
function deepseek(t, { planner = { status: 200, json: { choices: [{ message: { content: JSON.stringify(PLAN) }, finish_reason: 'stop' }], usage: USAGE } },
  answer = { status: 200, deltas: ANSWER, finish: 'stop', usage: USAGE } } = {}) {
  const bodies = [];
  const mock = t.mock.method(globalThis, 'fetch', async (url, init) => {
    const text = await init.body.text();
    const body = JSON.parse(text);
    bodies.push({ url, text, body, headers: init.headers });
    const r = body.stream ? answer : planner;
    if (r.throws) throw new Error(r.throws);
    if (r.status !== 200) return new Response('{}', { status: r.status });
    if (!body.stream) return Response.json(r.json);
    const chunks = r.deltas.map((d) => ({ choices: [{ delta: { content: d } }] }));
    chunks.push({ choices: [{ delta: {}, finish_reason: r.finish }], ...(r.usage && { usage: r.usage }) });
    const sse = `: keep-alive\n\n${chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')}data: [DONE]\n\n`;
    return new Response(sse, { headers: { 'Content-Type': 'text/event-stream' } });
  });
  return { bodies, mock };
}

async function ask(q, { headers = { 'X-AO-Session': token }, raw } = {}) {
  const waits = [];
  const res = await serve(new Request('https://aaronorelup.com/api/ask', { method: 'POST', headers, body: raw ?? JSON.stringify({ q }) }),
    env, { waitUntil: (p) => waits.push(p) });
  const text = res.status === 200 ? await res.text() : '';
  await Promise.all(waits);
  return { status: res.status, type: res.headers.get('Content-Type'), events: text.split('\n\n').filter(Boolean).map((l) => JSON.parse(l.slice(6))) };
}
const total = async (what) => (await db.prepare('SELECT n FROM usage_day WHERE day = ?1 AND what = ?2').bind(today(), what).first('n')) ?? 0;
const setFlag = async (k, v) => { await db.prepare('INSERT OR REPLACE INTO flags VALUES (?1, ?2)').bind(k, String(v)).run(); fresh(); };
for (const f of ['lib/flags.sql', 'ask/ask.sql', 'search/search.sql']) {
  const sql = fs.readFileSync(new URL(`../../worker/${f}`, import.meta.url), 'utf8').replace(/--.*$/gm, '');
  for (const st of sql.split(';').map((x) => x.trim()).filter(Boolean)) await db.prepare(st).run();
}
const clear = async () => { await db.prepare('DELETE FROM usage_day').run(); await db.prepare('DELETE FROM ask_cache').run(); };

test('the guards come before any paid call: size, token, switch, question, limiters', async (t) => {
  t.mock.method(console, 'log', () => {});
  const { mock } = deepseek(t);
  await clear();
  const before = { ...asked };
  assert.equal((await ask('', { raw: 'x'.repeat(3000) })).status, 413);
  assert.equal((await ask('what did it cost', { headers: {} })).status, 401);
  assert.equal((await ask('what did it cost', { headers: { 'X-AO-Session': `${token}x` } })).status, 401);
  assert.equal((await ask('x'.repeat(301))).status, 400);
  assert.equal((await ask('hi')).status, 400);
  await setFlag('ask', 'off');
  const off = await ask('what did it cost');
  assert.deepEqual(off.events, [{ t: 'end', reason: 'off', related: [] }]);
  assert.equal(off.type, 'text/event-stream; charset=utf-8');
  await setFlag('ask', 'on');
  const limited = { ...env.ASK_LIMIT };
  env.ASK_LIMIT.limit = async () => ({ success: false });
  assert.equal((await ask('what did it cost')).status, 429);
  env.ASK_LIMIT.limit = limited.limit;
  assert.equal(mock.mock.callCount(), 0);
  assert.deepEqual([asked.ai, asked.vectorize], [before.ai, before.vectorize]);
  assert.equal(await total('ask_usd'), 0);
});

test('an answer streams start, plan, found, read, write, cites and text, then one answer; then it is settled and cached', async (t) => {
  t.mock.method(console, 'log', () => {});
  const { bodies } = deepseek(t);
  await clear();
  const before = { ...asked };   // the isolate's first question: no manifest, prompt file or answer-cache table yet
  const { events } = await ask('How long did post three take?');
  const used = Object.keys(asked).reduce((n, k) => n + asked[k] - before[k], 0);
  assert.ok(used <= 45, `${used} binding calls on a cold isolate`);
  const types = events.map((e) => e.t);
  assert.deepEqual(types.slice(0, 5), ['start', 'plan', 'found', 'read', 'write']);
  assert.equal(types.at(-1), 'answer');
  assert.equal(types.filter((x) => x === 'answer' || x === 'end').length, 1);
  assert.deepEqual(events[0], { t: 'start', posts: 7, notes: 1, mode: 'whole', packs: 1 });
  assert.deepEqual(events[1], { t: 'plan', topics: ['video'], picks: 1 });
  assert.equal(events[2].searches, 3);
  assert.deepEqual(events[2].ranked.slice(0, 3), ['post-3', 'post-2', 'post-6']);
  assert.deepEqual(events[3].focus.slice(0, 2), ['post-3', 'post-2']);
  assert.ok(!events[3].focus.includes('live-lab'), 'the live notebook only when picked');
  const answer = events.at(-1);
  assert.equal(answer.answer, 'Aaron measured 30 seconds [1]. Claude wrote the notes [2], fast [3].');
  assert.equal(events.filter((e) => e.t === 'text').map((e) => e.d).join(''), answer.answer);
  assert.deepEqual(events.filter((e) => e.t === 'cite').map(({ t: _, ...c }) => c), answer.cites);
  assert.ok(types.indexOf('cite') < types.indexOf('text') || events.find((e) => e.t === 'text').d.indexOf('[1]') < 0);
  assert.deepEqual(answer.related, ['post-3', 'post-6', 'post-2', 'post-5'], 'the cited posts, then the hint, 4 at most');
  const usd = (cost(USAGE, Date.now()) * 2) / 1e6;
  assert.equal(answer.usage.usd, usd);
  assert.deepEqual([answer.usage.tokens, answer.usage.hit, answer.cached], [1000, 900, false]);
  assert.equal(await total('ask_usd'), cost(USAGE, Date.now()) * 2, 'settled to the reported usage');
  assert.equal(await total('ask'), 1);
  assert.equal(await total('ask_search'), 2, 'two embedding calls a question, counted');
  assert.equal(await total('search'), 0, "none of them in /api/search's count");
  assert.equal(asked.ai - before.ai, 2);
  // Nothing about the visitor, no user_id, and the planner's queries go nowhere but the embedding.
  for (const b of bodies) {
    assert.ok(!('user_id' in b.body) && !b.text.includes('user_id'));
    assert.deepEqual(Object.keys(b.headers), ['Authorization', 'Content-Type']);
  }
  const answerBody = bodies.find((b) => b.body.stream);
  assert.ok(!answerBody.text.includes('secret planner words'));
  assert.ok(!JSON.stringify(events).includes('secret planner words'));
  assert.equal(answerBody.body.messages[1].content.split('\n').at(-1), 'Question: how long did post three take?');
  assert.match(answerBody.body.messages[1].content, /^This question matched \d+ of the 7 posts closely\. You have all 7 in full above\.\nThe most related, best first: \[3\] Title 3; \[2\] Title 2/);

  const again = await ask('How long did post three take?');
  assert.equal(again.events.length, 1);
  assert.deepEqual({ ...again.events[0], took: 0 }, { ...answer, cached: true, took: 0 });
  assert.equal(bodies.length, 2, 'a cached answer makes no DeepSeek call');
  assert.equal(await total('ask'), 1);
});

test('an answer that drew on the live notebook is a miss once its hash moves', async (t) => {
  t.mock.method(console, 'log', () => {});
  const { bodies } = deepseek(t, { answer: { status: 200, deltas: ['The fleet wrote it [7.2].'], finish: 'stop', usage: USAGE } });
  await clear();
  await ask('what is in the live lab notebook');
  const row = await db.prepare('SELECT key, body FROM ask_cache').first();
  assert.deepEqual(JSON.parse(row.body).live, { 7: blog.manifest.live[7] });
  await db.prepare('UPDATE ask_cache SET body = ?1').bind(row.body.replace(blog.manifest.live[7], 'pushed00')).run();
  await ask('what is in the live lab notebook');
  assert.equal(bodies.filter((b) => b.body.stream).length, 2);
});

test('a refused answer is busy and bills nothing; a cut stream keeps its share of the reservation', async (t) => {
  t.mock.method(console, 'log', () => {});
  await clear();
  deepseek(t, { answer: { status: 503 } });
  const busy = await ask('what broke first');
  assert.equal(busy.events.at(-1).t, 'end');
  assert.equal(busy.events.at(-1).reason, 'busy');
  assert.ok(busy.events.at(-1).related.length > 0);
  assert.equal(await total('ask_usd'), cost(USAGE, Date.now()), 'the planner only');
  assert.equal(await db.prepare('SELECT COUNT(*) AS n FROM ask_cache').first('n'), 0);
  t.mock.restoreAll();
  t.mock.method(console, 'log', () => {});
  await clear();
  deepseek(t, { planner: { throws: 'aborted' }, answer: { status: 200, deltas: ['Half an ans'], finish: null } });
  const cut = await ask('what broke second');
  assert.equal(cut.events[1].skipped, true);
  assert.equal(cut.events.at(-1).reason, 'busy');
  assert.equal(await total('ask_usd'), blog.manifest.reserve.plan + blog.manifest.reserve.answer, 'both shares kept');
});

test('a spent dollar cap rests with no DeepSeek call, the closest posts from one lookup, and the count given back', async (t) => {
  t.mock.method(console, 'log', () => {});
  const { mock } = deepseek(t);
  await clear();
  await setFlag('ask_daily_usd', (blog.manifest.reserve.plan + blog.manifest.reserve.answer - 1) / 1e6);   // under one reservation
  const r = await ask('what did it all cost');
  assert.deepEqual(r.events, [{ t: 'end', reason: 'resting', related: ['post-2', 'post-3'] }]);
  assert.equal(mock.mock.callCount(), 0);
  assert.equal(await total('ask'), 0);
  assert.equal(await total('ask_usd'), 0);
  assert.deepEqual([await total('search'), await total('ask_search')], [1, 0], "the resting lookup is search_daily's, not the questions'");
  await setFlag('ask_daily_usd', 2);
  await setFlag('ask_daily', 0);
  await setFlag('ask_search_daily', 0);   // the day's questions used every call of theirs
  assert.deepEqual((await ask('what did it all cost')).events, [{ t: 'end', reason: 'resting', related: ['post-2', 'post-3'] }]);
  assert.equal(await total('ask'), 0);
  await setFlag('search_daily', 1);
  assert.deepEqual((await ask('what did it all cost')).events[0].related, [], 'search_daily spent too');
  await db.prepare("DELETE FROM flags").run();
  fresh();
});

test("/api/search's spent cap leaves Ask its retrieval: the two counts are apart", async (t) => {
  t.mock.method(console, 'log', () => {});
  deepseek(t);
  await clear();
  await setFlag('search_daily', 3);
  for (let i = 0; i < 3; i++) assert.equal(await spend(env, 'search', 1, 3), true);   // what tokenless /api/search traffic does
  assert.equal(await spend(env, 'search', 1, 3), false, "search's day is spent");
  const { events } = await ask('How long did post three take?');
  assert.equal(events[2].t, 'found');
  assert.equal(events[2].searches, 3, 'the question and the planner\'s queries were still looked up');
  assert.equal(events.at(-1).t, 'answer');
  assert.deepEqual([await total('ask_search'), await total('search')], [2, 3]);
  await db.prepare("DELETE FROM flags").run();
  fresh();
});

test("ask_search_daily is by default 2 calls for each of ask_daily's questions, which covers them exactly", async (t) => {
  t.mock.method(console, 'log', () => {});
  deepseek(t);
  await clear();
  const f = await flags(env);
  assert.deepEqual([f.ask_daily, f.ask_search_daily, f.search_daily], [1000, 2000, 20000]);
  assert.equal(f.ask_search_daily, 2 * f.ask_daily, 'the question, then the planner\'s queries: 2 embedding calls at most');
  // The same ratio, small: each question the day's cap lets through has both its lookups, and none is left over.
  await setFlag('ask_daily', 3);
  await setFlag('ask_search_daily', 6);
  for (const q of ['what did the first cost', 'what did the second cost', 'what did the third cost']) {
    const before = asked.ai;
    const { events } = await ask(q);
    assert.equal(events[2].searches, 3, q);
    assert.equal(events.at(-1).t, 'answer', q);
    assert.equal(asked.ai - before, 2, `${q}: two embedding calls`);
  }
  assert.deepEqual([await total('ask'), await total('ask_search')], [3, 6]);
  const before = asked.ai;
  const rest = await ask('what did the fourth cost');
  assert.deepEqual(rest.events, [{ t: 'end', reason: 'resting', related: ['post-2', 'post-3'] }],
    "a rested Ask still shows the closest posts: its lookup is search_daily's, which has room");
  assert.deepEqual([await total('ask_search'), await total('search'), asked.ai - before], [6, 1, 1], "the questions' cap is never passed");
  await db.prepare("DELETE FROM flags").run();
  fresh();
});

test('spend() holds the day\'s first spend to the cap, and a 0 cap means none', async () => {
  await clear();
  assert.equal(await spend(env, 'x', 5, 0), false);
  assert.equal(await spend(env, 'x', 5, 4), false);
  assert.equal(await total('x'), 0);
  assert.equal(await spend(env, 'x', 4, 4), true);
  assert.equal(await spend(env, 'x', 1, 4), false);
  assert.equal(await spend(env, 'x', -2, Number.MAX_SAFE_INTEGER), true);
  assert.equal(await total('x'), 2);
  assert.equal(await spend(env, 'x', 3, 9, '2026-01-01'), true, 'a settle lands on its own day');
  assert.equal(await db.prepare("SELECT n FROM usage_day WHERE day = '2026-01-01'").first('n'), 3);
});

test('both the planner and the search failing still answers, from every post, with no hint', async (t) => {
  t.mock.method(console, 'log', () => {});
  const { bodies } = deepseek(t, { planner: { status: 200, json: { choices: [{ message: { content: '   ' } }], usage: USAGE } } });
  await clear();
  const query = env.SEARCH_INDEX.query;
  env.SEARCH_INDEX.query = async () => { throw new Error('down'); };
  const r = await ask('anything at all here');
  env.SEARCH_INDEX.query = query;
  assert.deepEqual([r.events[1], r.events[2]], [{ t: 'plan', skipped: true }, { t: 'found', skipped: true }]);
  assert.equal(r.events.at(-1).t, 'answer');
  assert.equal(bodies.find((b) => b.body.stream).body.messages[1].content, 'You have all 7 in full above.\n\nQuestion: anything at all here');
});

test('the stream sends a wait after 10 s without an event, and writes after a disconnect are no-ops', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const out = sse();
  const reader = out.response.body.getReader();
  out.send('start', { posts: 1 });
  t.mock.timers.tick(HEARTBEAT);
  const dec = new TextDecoder();
  assert.equal(dec.decode((await reader.read()).value), 'data: {"t":"start","posts":1}\n\n');
  assert.equal(dec.decode((await reader.read()).value), 'data: {"t":"wait"}\n\n');
  await reader.cancel();
  out.send('text', { d: 'x' });
  await new Promise(setImmediate);
  out.send('text', { d: 'y' });
  out.close();
  assert.equal(out.gone(), true);
});
