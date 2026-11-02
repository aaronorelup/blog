// npm run ask:eval -- --set <questions.json> --out <dir> [--base http://127.0.0.1:8787] [--ids f01,m04] [--again]:
// a question set against a running `wrangler dev` (docs/ASK.md "The eval"), one at a time (the cache stays warm, the
// limiters quiet), a new session every 5. Every event goes to <out>/events.jsonl with its arrival time; each question
// is reserved on the ledger (spend.mjs) at the manifest's worst case and settled to its usage.usd, and carries the
// sha256 of words.js and of the manifest. Questions already in the file are skipped unless --again.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { ask, session } from './client.mjs';
import { reserve, settle } from './spend.mjs';

const { values: o } = parseArgs({ options: { set: { type: 'string' }, out: { type: 'string' }, base: { type: 'string', default: 'http://127.0.0.1:8787' },
  ids: { type: 'string' }, again: { type: 'boolean' }, tag: { type: 'string', default: 'eval' } } });
const set = JSON.parse(fs.readFileSync(o.set, 'utf8'));
const questions = (set.questions ?? set).filter((x) => !o.ids || o.ids.split(',').includes(x.id));
const manifest = JSON.parse(fs.readFileSync(new URL('../../dist/ask/manifest.json', import.meta.url), 'utf8'));
const worst = manifest.reserve.plan + manifest.reserve.answer;
// The build each answer came from: words.js and the manifest, by sha256 (the report prints them).
const sha = (url) => createHash('sha256').update(fs.readFileSync(new URL(url, import.meta.url))).digest('hex');
const build = () => ({ words: sha('../../src/lib/ask/words.js'), manifest: sha('../../dist/ask/manifest.json') });
fs.mkdirSync(o.out, { recursive: true });
const file = path.join(o.out, 'events.jsonl');
const done = new Set(fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).qid) : []);

let token = null;
let asked = 0;
for (const x of questions) {
  if (done.has(x.id) && !o.again) continue;
  if (asked % 5 === 0) token = await session(o.base);
  asked++;
  const tag = `${o.tag}:${x.id}`;
  const id = reserve(tag, worst);
  // A dropped connection (wrangler dev reloading) stops the run, the question counted at its worst.
  const r = await ask(o.base, token, x.q).catch((e) => { settle(id, tag, worst, worst); throw e; });
  const last = r.events.at(-1) ?? {};
  const actual = last.t === 'answer' ? (last.cached ? 0 : Math.ceil(last.usage.usd * 1e6))
    : last.t === 'end' && last.reason !== 'busy' ? 0 : worst;
  settle(id, tag, worst, actual);
  fs.appendFileSync(file, `${JSON.stringify({ qid: x.id, q: x.q, type: x.type, at: new Date().toISOString(), build: build(), ...r })}\n`);
  const u = last.usage;
  console.log(x.id, r.status, `${r.ms} ms`, last.t, last.reason ?? '', u ? `${u.tokens} in ${((100 * u.hit) / u.tokens).toFixed(1)}% hit $${u.usd.toFixed(4)}` : '',
    (last.answer ?? '').slice(0, 90).replace(/\n/g, ' '));
}
