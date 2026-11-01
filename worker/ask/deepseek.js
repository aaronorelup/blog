// complete(env, messages): one DeepSeek chat call, thinking off (on by default, it would spend the 400 tokens on
// reasoning, ignore temperature and run past the timeout), 20 s at most, no retry. The answer's text, or null when
// the call failed, was cut short or came back empty: the caller answers 'busy' and caches nothing.
export const MODEL = 'deepseek-flash'; // DeepSeek-V4.1-Flash, as GET https://api.deepseek.com/models lists it
const CUT_SHORT = new Set(['length', 'insufficient_system_resource']);

export async function complete(env, messages) {
  const start = Date.now();
  const out = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 400, temperature: 0.2,
                           thinking: { type: 'disabled' }, stream: false }),
    signal: AbortSignal.timeout(20e3),
  }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
    .catch((e) => { console.log('ask deepseek failed', e.message); return null; });
  if (!out) return null;
  const [choice] = out.choices ?? [];
  const u = out.usage ?? {};
  console.log('ask deepseek', choice?.finish_reason, `${u.prompt_tokens} in`, `${u.completion_tokens} out`,
    `${u.completion_tokens_details?.reasoning_tokens ?? 0} reasoning`, `${Date.now() - start} ms`);
  const text = choice?.message?.content?.trim();
  return text && !CUT_SHORT.has(choice.finish_reason) ? text : null;
}
