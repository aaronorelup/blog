// Switches and caps: the D1 table flags (flags.sql) over the defaults below, re-read at most every 30 s per
// isolate, so a flip takes effect within 30 s and survives deploys. spend() is the atomic daily cap.
import { memo } from './memo.js';
import { ensure } from './sql.js';
import SCHEMA from './flags.sql';

// ask_daily_usd is dollars a UTC day for Ask's DeepSeek calls (usage_day 'ask_usd' counts micro-dollars);
// ask_extra_tokens is split mode's uncached docs per question (docs/ASK.md).
const DEFAULTS = {
  search: 'on', ask: 'on', tts: 'on', search_daily: 20000, ask_daily: 1000, ask_daily_usd: 2, ask_extra_tokens: 80000,
  tts_daily_credits: 15000, tts_credit_floor: 0.4,
};
export const NO_CAP = Number.MAX_SAFE_INTEGER;   // a settle, which may only ever lower a total

export const today = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

export const flags = memo(30e3, async (env) => {
  await ensure(env.DB, SCHEMA);
  const { results } = await env.DB.prepare('SELECT k, v FROM flags').all();
  const out = { ...DEFAULTS };
  for (const { k, v } of results) out[k] = typeof DEFAULTS[k] === 'number' ? Number(v) : v;
  return out;
});

// Adds n to day's total for `what` (today unless told), unless that would pass max: then nothing changes and the
// answer is false. One statement, so two requests can't both read "under" and both write past the cap, and the
// day's first spend is held to the cap too (a 0 cap means none).
export async function spend(env, what, n, max, day = today()) {
  await ensure(env.DB, SCHEMA);
  const row = await env.DB.prepare(
    'INSERT INTO usage_day (day, what, n) SELECT ?1, ?2, ?3 WHERE ?3 <= ?4 ' +
    'ON CONFLICT (day, what) DO UPDATE SET n = n + ?3 WHERE n + ?3 <= ?4 RETURNING n',
  ).bind(day, what, n, max).first();
  return row !== null;
}
