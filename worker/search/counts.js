// count(env, mode, q): one more of today's (mode, q) in searches, mode 'search' or 'ask'. Only the day, the mode,
// the normalised query (scrubbed, cut to 80 characters) and a count: no address, token, session, country or browser.
// Private: `npm run searches` prints the top ones for Aaron.
import { today } from '../lib/flags.js';
import { ensure } from '../lib/sql.js';
import { scrub } from '../lib/text.js';
import SCHEMA from './search.sql';

export async function count(env, mode, q) {
  await ensure(env.DB, SCHEMA);
  await env.DB.prepare(
    'INSERT INTO searches (day, mode, q, n) VALUES (?1, ?2, ?3, 1) ' +
    'ON CONFLICT (day, mode, q) DO UPDATE SET n = n + 1',
  ).bind(today(), mode, scrub(q).slice(0, 80)).run();
}
