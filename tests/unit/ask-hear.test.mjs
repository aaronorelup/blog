// POST /api/ask/hear (worker/ask/hear.js): the guards before the paid call (origin, type, size, token, the switches,
// the limiters, the day's cap), the Whisper call as sent, a mocked answer as { text }, an AI error or a timeout as a
// bare 502, and nothing of the audio or the text in usage_day or a log line.
import test from 'node:test';
import assert from 'node:assert/strict';
import { d1, loadWorker } from './worker-env.mjs';

const { serve, MODEL, MAX_AUDIO } = await loadWorker('ask/hear.js');
const { today } = await loadWorker('lib/flags.js');
const { mint } = await loadWorker('lib/session.js');

const realNow = Date.now;
let skew = 0;
Date.now = () => realNow() + skew;
const fresh = () => { skew += 31e3; };   // past the flags' 30 s memo

const runs = [];
let answer = async () => ({ text: '  How much did   the GPU cost? ' });
const env = {
  DB: d1(), SESSION_KEY: 'unit-only',
  AI: { run: async (model, input) => { runs.push({ model, input }); return answer(); } },
  HEAR_LIMIT: { limit: async ({ key }) => ({ success: env.one !== false && typeof key === 'string' }) },
  HEAR_ALL: { limit: async ({ key }) => ({ success: key === 'all' }) },
};
const { token } = await mint(env);
const AUDIO = new Uint8Array(4096).map((_, i) => i % 251);

function hear({ body = AUDIO, type = 'audio/webm;codecs=opus', session = token, origin = 'https://aaronorelup.com', headers = {} } = {}) {
  const h = { 'Content-Type': type, ...headers };
  if (session !== null) h['X-AO-Session'] = session;
  if (origin !== null) h.Origin = origin;
  return serve(new Request('https://aaronorelup.com/api/ask/hear', { method: 'POST', headers: h, body }), env);
}
const used = async () => (await env.DB.prepare("SELECT n FROM usage_day WHERE day = ?1 AND what = 'hear'").bind(today()).first('n')) ?? 0;
const setFlag = async (k, v) => { await env.DB.prepare('INSERT OR REPLACE INTO flags VALUES (?1, ?2)').bind(k, String(v)).run(); fresh(); };
const clear = async () => { runs.length = 0; await env.DB.prepare('DELETE FROM usage_day').run(); };

test('a recording is transcribed once, with the reference call, and answered as { text }', async () => {
  const r = await hear();
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await r.json(), { text: 'How much did the GPU cost?' });
  assert.equal(runs.length, 1);
  const { model, input } = runs[0];
  assert.equal(model, MODEL);
  assert.deepEqual({ ...input, audio: undefined }, { audio: undefined, task: 'transcribe', language: 'en', vad_filter: true });
  assert.deepEqual(Uint8Array.from(Buffer.from(input.audio, 'base64')), AUDIO, 'the bytes, base64');
  assert.equal(await used(), 1, 'one anonymous count');
  const rows = await env.DB.prepare('SELECT * FROM usage_day').all();
  assert.ok(!JSON.stringify(rows).includes('GPU'), 'the text is stored nowhere');
  for (const type of ['audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) assert.equal((await hear({ type })).status, 200, type);
});

test('the guards come before the paid call: origin, type, size, token, switches, limiters', async (t) => {
  await clear();
  assert.equal((await hear({ origin: null })).status, 403);
  assert.equal((await hear({ origin: 'https://example.com' })).status, 403);
  assert.equal((await hear({ type: 'application/json' })).status, 415);
  assert.equal((await hear({ type: 'video/webm' })).status, 415);
  assert.equal((await hear({ body: new Uint8Array(MAX_AUDIO + 1) })).status, 413);
  assert.equal((await hear({ session: null })).status, 401);
  assert.equal((await hear({ session: `${token}x` })).status, 401);
  assert.equal((await hear({ session: 'not.a-token' })).status, 401);
  assert.equal((await hear({ body: new Uint8Array(100) })).status, 400, 'too short to hold speech');
  await setFlag('ask_voice', 'off');
  assert.equal((await hear()).status, 503);
  await setFlag('ask_voice', 'on');
  await setFlag('ask', 'off');
  assert.equal((await hear()).status, 503, 'no voice while Ask is off');
  await setFlag('ask', 'on');
  env.one = false;
  assert.equal((await hear()).status, 429);
  env.one = true;
  assert.equal(runs.length, 0);
  assert.equal(await used(), 0);
  t.mock.method(console, 'log', () => {});
});

test('the daily cap: hear_daily calls, then 503 with no model call', async () => {
  await clear();
  await setFlag('hear_daily', 2);
  assert.equal((await hear()).status, 200);
  assert.equal((await hear()).status, 200);
  assert.equal((await hear()).status, 503);
  assert.equal(runs.length, 2);
  assert.equal(await used(), 2);
  await env.DB.prepare("DELETE FROM flags WHERE k = 'hear_daily'").run();
  fresh();
});

test('an AI error, a timeout or an answer without text is a bare 502, logged without the audio or the text', async (t) => {
  await clear();
  const logs = [];
  t.mock.method(console, 'log', (...a) => logs.push(a.join(' ')));
  answer = async () => { throw new Error('AiError: 3010: invalid audio How much did'); };
  let r = await hear();
  assert.equal(r.status, 502);
  assert.equal(await r.text(), '');
  answer = async () => ({ vtt: '' });
  assert.equal((await hear()).status, 502);
  t.mock.timers.enable({ apis: ['setTimeout'] });
  answer = () => new Promise(() => {});
  const pending = hear();
  await new Promise((res) => setImmediate(res));
  for (let i = 0; i < 5; i++) { t.mock.timers.tick(5e3); await new Promise((res) => setImmediate(res)); }
  r = await pending;
  t.mock.timers.reset();
  assert.equal(r.status, 502);
  assert.equal(runs.length, 3, 'no retry');
  assert.ok(logs.every((l) => !l.includes('How much') && !l.includes(runs[0].input.audio.slice(0, 20))), logs.join('\n'));
  answer = async () => ({ text: 'x'.repeat(500) });
  assert.equal((await (await hear()).json()).text.length, 300, 'cut to what /api/ask takes');
});
