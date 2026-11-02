// The eval's browser stand-in against a running `wrangler dev`: session() mints an Ask token with Turnstile's test
// response (the dev Worker's always-pass secret), ask() posts a question and reads its stream with the browser's own
// reader (src/scripts/search/ask-stream.js), every event with its arrival time in ms. run.mjs and probe.mjs share it.
import { events as read } from '../../src/scripts/search/ask-stream.js';

export async function session(base) {
  const r = await fetch(`${base}/api/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({ turnstile: 'XXXX.DUMMY.TOKEN.XXXX' }) });
  if (!r.ok) throw new Error(`POST /api/session answered ${r.status}`);
  return (await r.json()).token;
}

// { status, ms, events: [{ at, t, ... }] }; with leaveAt, the reader goes away at that many ms.
export async function ask(base, token, q, { leaveAt } = {}) {
  const t0 = performance.now();
  const ctrl = new AbortController();
  if (leaveAt) setTimeout(() => ctrl.abort(), leaveAt);
  const events = [];
  let status = 0;
  try {
    const r = await fetch(`${base}/api/ask`, { method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'X-AO-Session': token }, body: JSON.stringify({ q }) });
    status = r.status;
    if (r.ok) for await (const e of read(r.body)) events.push({ at: Math.round(performance.now() - t0), ...e });
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
  return { status, ms: Math.round(performance.now() - t0), events };
}
