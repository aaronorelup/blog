// The eval's DeepSeek ledger (docs/ASK.md "The eval"): every paid call from scripts/eval/ and every Worker answer the
// runner gets is reserved at its worst case first and settled to its real price (src/lib/ask/price.js, at its start),
// in $ASK_EVAL_LEDGER (JSONL), and a call that could take the total past $ASK_EVAL_USD (default 3) is refused. A
// lock file serialises processes (the runner, the judge, the probe). chat() is the only way the scripts call DeepSeek.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cost } from '../../src/lib/ask/price.js';
import { secret } from '../lib/secrets.mjs';

const FILE = process.env.ASK_EVAL_LEDGER ?? path.join(os.homedir(), '.cache/ask-eval/spend.jsonl');
const CAP = Math.round(Number(process.env.ASK_EVAL_USD ?? 3) * 1e6);
fs.mkdirSync(path.dirname(FILE), { recursive: true });

function locked(fn) {
  const lock = `${FILE}.lock`;
  for (let i = 0; ; i++) {
    try { fs.closeSync(fs.openSync(lock, 'wx')); break; } catch { if (i > 2000) throw new Error(`${lock} is stuck`); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5); }
  }
  try { return fn(); } finally { fs.rmSync(lock, { force: true }); }
}
const lines = () => (fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
export const spent = () => lines().reduce((t, l) => t + l.micro, 0);   // micro-dollars, open reservations included
const write = (l) => fs.appendFileSync(FILE, `${JSON.stringify({ at: new Date().toISOString(), ...l })}\n`);

// A reservation of `worst` micro-dollars for `tag`, or an error when it could pass the cap.
export function reserve(tag, worst) {
  return locked(() => {
    const total = spent();
    if (total + worst > CAP) throw new Error(`ledger: $${(total / 1e6).toFixed(4)} spent; ${tag} could cost $${(worst / 1e6).toFixed(4)} more, past $${CAP / 1e6}`);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    write({ id, tag, kind: 'reserve', micro: worst });
    return id;
  });
}
export const settle = (id, tag, worst, actual) => locked(() => write({ id, tag, kind: 'settle', micro: actual - worst, actual }));

// One DeepSeek call (not streamed): reserved at worst(promptTokens, max_tokens), settled to its usage.
export async function chat(tag, body, worstMicro) {
  const id = reserve(tag, worstMicro);
  const at = Date.now();
  let usage = null;
  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${secret('DEEPSEEK_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(300e3),
    });
    if (!r.ok) { settle(id, tag, worstMicro, 0); throw new Error(`${tag}: DeepSeek answered ${r.status}`); }
    const j = await r.json();
    usage = j.usage;
    settle(id, tag, worstMicro, cost(usage, at));
    return { text: j.choices?.[0]?.message?.content ?? '', usage, ms: Date.now() - at };
  } catch (e) {
    if (usage === null && !/answered/.test(e.message)) settle(id, tag, worstMicro, worstMicro);   // unknown: count it all
    throw e;
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const all = lines();
  const by = {};
  for (const l of all) by[l.tag.split(':')[0]] = (by[l.tag.split(':')[0]] ?? 0) + l.micro;
  console.log(`ledger ${FILE}: $${(spent() / 1e6).toFixed(4)} of $${CAP / 1e6}`, Object.fromEntries(Object.entries(by).map(([k, v]) => [k, `$${(v / 1e6).toFixed(4)}`])));
}
