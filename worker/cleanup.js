// The minute cron's daily sweep, which acts once a day, at 03:07 UTC: search counts past 180 days, cached answers
// past 7 days and daily totals past 60 days go. A missed run waits for the next day's.
import FLAGS from './lib/flags.sql';
import { ensure } from './lib/sql.js';
import SEARCH from './search/search.sql';
import ASK from './ask/ask.sql';

const DAY = 864e5;

export async function daily(env, scheduledTime) {
  const t = new Date(scheduledTime);
  if (t.getUTCHours() !== 3 || t.getUTCMinutes() !== 7) return;
  const before = (days) => new Date(scheduledTime - days * DAY).toISOString();
  await Promise.all([FLAGS, SEARCH, ASK].map((schema) => ensure(env.DB, schema)));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM searches WHERE day < ?1').bind(before(180).slice(0, 10)),
    env.DB.prepare('DELETE FROM ask_cache WHERE at < ?1').bind(before(7)),
    env.DB.prepare('DELETE FROM usage_day WHERE day < ?1').bind(before(60).slice(0, 10)),
  ]);
  return 'swept';
}
