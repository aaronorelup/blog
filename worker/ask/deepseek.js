// call(env, body, opts): one DeepSeek chat call to env.DEEPSEEK_URL, no retry. body is the request (body.js builds
// it, thinking off: on by default, it would spend the answer on reasoning and ignore temperature). With stream, each
// content delta goes to onText, `first` ms may pass before the first one and `total` ms in all; past either the call
// is aborted. Answers { status (0: no answer), text, finish, usage (null when it never came), ms, firstMs, error }.
export const MODEL = 'deepseek-flash';   // DeepSeek-V4.1-Flash, as GET https://api.deepseek.com/models lists it

export async function call(env, body, { stream = false, first = 0, total, onText = () => {} }) {
  const start = Date.now();
  const ctrl = new AbortController();
  const out = { status: 0, text: '', finish: null, usage: null, ms: 0, firstMs: null, error: null };
  const stop = (why) => () => { out.error = why; ctrl.abort(); };
  const totalT = setTimeout(stop('timeout'), total);
  let firstT = first ? setTimeout(stop('no first token'), first) : 0;
  try {
    const r = await fetch(env.DEEPSEEK_URL, {
      method: 'POST', body, signal: ctrl.signal,
      headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    });
    out.status = r.status;
    if (r.status === 402) console.error('ask deepseek 402: the account is out of balance');
    if (!r.ok) await r.body?.cancel();
    else if (!stream) {
      const j = await r.json();
      [out.text, out.finish, out.usage] = [j.choices?.[0]?.message?.content ?? '', j.choices?.[0]?.finish_reason, j.usage ?? null];
    } else {
      await events(r.body, (ev) => {
        if (ev.usage) out.usage = ev.usage;
        const [choice] = ev.choices ?? [];
        if (choice?.finish_reason) out.finish = choice.finish_reason;
        const d = choice?.delta?.content;
        if (!d) return;
        if (out.firstMs === null) { out.firstMs = Date.now() - start; clearTimeout(firstT); firstT = 0; }
        out.text += d;
        onText(d);
      });
    }
  } catch (e) {
    out.error ??= e.message;
  } finally {
    clearTimeout(totalT);
    clearTimeout(firstT);
    out.ms = Date.now() - start;
  }
  return out;
}

// The SSE body's JSON events, through "data: [DONE]"; keep-alive comments and blank lines skipped.
async function events(body, each) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buf += value;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') { await reader.cancel(); return; }
      each(JSON.parse(data));
    }
  }
}
