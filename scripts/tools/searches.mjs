// npm run searches [-- days]: the queries people typed into search and Ask in the last N days (default 30), most
// asked first, from the D1 table searches through the Cloudflare API. The counts are private: print, never publish.
import fs from 'node:fs';
import { cf } from '../lib/cfapi.mjs';

const days = Number(process.argv[2] || 30);
const DB = fs.readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8').match(/"database_id":\s*"([^"]+)"/)[1];
const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
const [{ results }] = await cf(`/d1/database/${DB}/query`, {
  method: 'POST',
  body: {
    sql: 'SELECT mode, q, SUM(n) AS n FROM searches WHERE day >= ?1 GROUP BY mode, q ORDER BY n DESC, q LIMIT 60',
    params: [since],
  },
});
console.log(`Top queries since ${since} (${results.length}):`);
for (const { mode, q, n } of results) console.log(`${String(n).padStart(5)}  ${mode.padEnd(6)}  ${q}`);
