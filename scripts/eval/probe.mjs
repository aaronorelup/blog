// npm run ask:probe -- idle | stall (docs/ASK.md "The eval", G11). idle, the eviction probe: the exact whole-mode
// prefix (dist/ask) with a fixed question, max_tokens 1, now and after 1, 2, 4 and 8 h of idle, each call's cache-hit
// share as JSONL in --log; run it detached, every call on the ledger. stall: a stub DeepSeek on 127.0.0.1:8799 (wrangler
// dev --var DEEPSEEK_URL:http://127.0.0.1:8799/chat/completions), then 25 s and 35 s to the first token and a reader who
// leaves, against --base.
import fs from 'node:fs';
import http from 'node:http';
import { parseArgs } from 'node:util';
import { worst } from '../../src/lib/ask/price.js';
import { WHOLE_RULES } from '../../src/lib/ask/words.js';
import { chat } from './spend.mjs';

const { values: o, positionals: [mode] } = parseArgs({ allowPositionals: true, options: {
  log: { type: 'string' }, base: { type: 'string', default: 'http://127.0.0.1:8787' }, hours: { type: 'string', default: '1,2,4,8' },
  'worker-log': { type: 'string' } } });
const DIST = new URL('../../dist/ask/', import.meta.url);
const text = (file) => JSON.parse(`"${fs.readFileSync(new URL(file, DIST), 'utf8')}"`);
const log = (line) => (o.log ? fs.appendFileSync(o.log, `${JSON.stringify({ at: new Date().toISOString(), ...line })}\n`) : console.log(line));

if (mode === 'idle') {
  const m = JSON.parse(fs.readFileSync(new URL('manifest.json', DIST), 'utf8'));
  const live = Object.keys(m.live).map((n) => text(m.docs[n].file));
  const system = [WHOLE_RULES, text(m.packs[0].file), ...(live.length ? [`<documents>\n${live.join('\n\n')}\n</documents>`] : []),
    text(m.overview.file)].join('\n\n');
  const body = { model: 'deepseek-flash', stream: false, max_tokens: 1, temperature: 0.2, thinking: { type: 'disabled' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: 'Question: what is this blog about?' }] };
  const tokens = Math.ceil(system.length / 3.5) + 50;
  const gaps = [0, ...o.hours.split(',').map(Number)];
  for (const [i, h] of gaps.entries()) {
    await new Promise((r) => setTimeout(r, h * 3600e3));
    try {
      const r = await chat(`probe:${h}h`, body, worst(tokens, 1));
      const u = r.usage;
      log({ call: i, idle_h: h, prompt: u.prompt_tokens, hit: u.prompt_cache_hit_tokens, share: +(u.prompt_cache_hit_tokens / u.prompt_tokens).toFixed(4), ms: r.ms });
    } catch (e) {
      log({ call: i, idle_h: h, error: e.message });
    }
  }
  log({ done: true });
}

if (mode === 'stall') {
  // The stub: the planner answers at once; the answer waits "stall N" seconds (from the question) for its first token,
  // sending keep-alive comments as DeepSeek does, then takes 6 s more to finish.
  const PLAN = JSON.stringify({ queries: ['renting a gpu'], topics: ['video'], picks: ['renting-a-gpu'] });
  const usage = { prompt_tokens: 1000, prompt_cache_hit_tokens: 0, prompt_cache_miss_tokens: 1000, completion_tokens: 20 };
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const body = JSON.parse(raw);
      if (!body.stream) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ choices: [{ message: { content: PLAN }, finish_reason: 'stop' }], usage }));
      }
      const wait = Number(/stall (\d+)/.exec(body.messages.at(-1).content)?.[1] ?? 0) * 1e3;
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const alive = setInterval(() => res.write(': keep-alive\n\n'), 2e3);
      const send = (x) => !res.destroyed && res.write(`data: ${JSON.stringify(x)}\n\n`);
      setTimeout(() => {
        clearInterval(alive);
        send({ choices: [{ delta: { content: 'Aaron rented a GPU [55.0].' } }] });
        setTimeout(() => {
          send({ choices: [{ delta: { content: ' It was 4 to 5 times faster [55.1].' } }] });
          send({ choices: [{ delta: {}, finish_reason: 'stop' }], usage });
          if (!res.destroyed) res.end('data: [DONE]\n\n');
        }, 6e3);
      }, wait);
      res.on('close', () => clearInterval(alive));
    });
  });
  await new Promise((r) => server.listen(8799, '127.0.0.1', r));
  if (o.base === 'none') await new Promise(() => {});   // --base none: only the stub, until killed
  const { ask, session } = await import('./client.mjs');
  const lines = () => (o['worker-log'] ? fs.readFileSync(o['worker-log'], 'utf8').split('\n').filter((l) => /\bask (whole|split) /.test(l)) : []);
  const token = await session(o.base);
  const checks = [];
  const scenario = async (name, q, opts, judge) => {
    const before = lines().length;
    const r = await ask(o.base, token, `${q} ${Date.now()}`, opts);   // never an answer-cache hit
    await new Promise((res) => setTimeout(res, opts.leaveAt ? 30e3 : 2e3));   // a reader who left: the run's own 20 s
    const logged = lines().slice(before);
    const ok = judge(r, logged);
    checks.push({ name, ok, events: r.events.map((e) => `${e.t}@${e.at}`).join(' '), logged });
    console.log(ok ? 'PASS' : 'FAIL', name, '|', r.events.map((e) => `${e.t}@${e.at}${e.reason ? `:${e.reason}` : ''}`).join(' '), '|', logged.join(' / '));
  };
  const kinds = (r) => r.events.map((e) => e.t);
  await scenario('25 s to the first token, answered past 30 s', 'stall 25 then answer', {},
    (r, logged) => kinds(r).filter((t) => t === 'wait').length >= 2 && kinds(r).at(-1) === 'answer' && r.ms > 30e3
      && logged.some((l) => / answered/.test(l)));
  await scenario('35 s to the first token: busy at 30 s', 'stall 35 then answer', {},
    (r, logged) => r.events.at(-1)?.reason === 'busy' && r.ms < 33e3 && logged.some((l) => /busy/.test(l)) && kinds(r).filter((t) => t === 'answer' || t === 'end').length === 1);
  await scenario('the reader leaves at 5 s: the run still settles', 'stall 8 leave', { leaveAt: 5e3 },
    (r, logged) => kinds(r).at(-1) !== 'answer' && logged.some((l) => / answered.*detached/.test(l)));
  server.close();
  if (o.log) fs.writeFileSync(o.log, JSON.stringify(checks, null, 1));
  process.exit(checks.every((c) => c.ok) ? 0 : 1);
}
