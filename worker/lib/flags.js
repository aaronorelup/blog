// Switches and caps: the D1 table flags (flags.sql) over the defaults below, re-read at most every 30 s per
// isolate, so a flip takes effect within 30 s and survives deploys. spend() is the atomic daily cap.
import { memo } from './memo.js';
import { ensure } from './sql.js';
import SCHEMA from './flags.sql';

const DEFAULTS = {
  search: 'on', ask: 'on', tts: 'on', search_daily: 20000, ask_daily: 1000,
  ask_min_score: 0.45, tts_daily_credits: 15000, tts_credit_floor: 0.4,
};

export const today = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

export const flags = memo(30e3, async (env) => {
  await ensure(env.DB, SCHEMA);
  const { results } = await env.DB.prepare('SELECT k, v FROM flags').all();
  const out = { ...DEFAULTS };
  for (const { k, v } of results) out[k] = typeof DEFAULTS[k] === 'number' ? Number(v) : v;
  return out;
});

// Adds n to today's total for `what`, unless that would pass max: then nothing changes and the answer is false.
// One statement, so two requests can't both read "under" and both write past the cap.
export async function spend(env, what, n, max) {
  await ensure(env.DB, SCHEMA);
  const row = await env.DB.prepare(
    'INSERT INTO usage_day (day, what, n) VALUES (?1, ?2, ?3) ' +
    'ON CONFLICT (day, what) DO UPDATE SET n = n + ?3 WHERE n + ?3 <= ?4 RETURNING n',
  ).bind(today(), what, n, max).first();
  return row !== null;
}
