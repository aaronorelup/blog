// The eval's browser stand-in against a running `wrangler dev`: session() mints an Ask token with Turnstile's test
// response (the dev Worker's always-pass secret), ask() posts a question and returns every event with its arrival
// time in ms. run.mjs and probe.mjs share it.
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
    if (r.ok) {
      const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const frame = buf.slice(0, i);
          buf = buf.slice(i + 2);
          if (frame.startsWith('data: ')) events.push({ at: Math.round(performance.now() - t0), ...JSON.parse(frame.slice(6)) });
        }
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }
  return { status, ms: Math.round(performance.now() - t0), events };
}
