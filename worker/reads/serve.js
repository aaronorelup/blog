// /api/reads, the reader counter AO-057's demo shows (src/scripts/demos/cf.js). POST {slug} counts one read, GET
// ?slug= gives the counts. Stored (reads.sql): post, UTC day, the edge's country, a count; never an address, a
// browser, a cookie or a time of day. A read counts only from this site's own pages, from something that doesn't
// call itself a bot, for a listed post. The limiters are keyed on the post, so one script can add at most about
// 30 reads a minute to one post per Cloudflare location (the post says a patient script can inflate it).
import { json, status, sameOrigin } from '../lib/http.js';
import { ensure } from '../lib/sql.js';
import { buildJson } from '../lib/build-files.js';
import SCHEMA from './reads.sql';

const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const BOTS = /bot|crawl|spider|slurp|headless|python|curl|wget|httpclient|okhttp|java\/|go-http|lighthouse|preview/i;
const DAY = 86400e3;
const isoDay = (t) => new Date(t).toISOString().slice(0, 10);
const isListed = async (env, slug) => Object.hasOwn((await buildJson(env, '/ledger/previews.json')).posts, slug);

export async function count(request, env) {
  if (!sameOrigin(request)) return status(403);
  const slug = await request.json().then((b) => String(b?.slug ?? ''), () => '');
  if (!SLUG.test(slug)) return status(400);
  const ua = request.headers.get('User-Agent') || '';
  if (!ua || BOTS.test(ua) || request.cf?.verifiedBotCategory) return status(204); // skipped, quietly
  if (!(await isListed(env, slug))) return status(404);
  if (!(await env.READS_LIMIT.limit({ key: slug })).success) return status(429);
  const country = /^[A-Z0-9]{2}$/.test(request.cf?.country || '') ? request.cf.country : 'XX';
  await ensure(env.DB, SCHEMA);
  await env.DB.prepare(
    'INSERT INTO reads (slug, day, country, n) VALUES (?1, ?2, ?3, 1) ' +
    'ON CONFLICT (slug, day, country) DO UPDATE SET n = n + 1',
  ).bind(slug, isoDay(Date.now()), country).run();
  return status(204);
}

export async function counts(request, env) {
  const slug = new URL(request.url).searchParams.get('slug') || '';
  if (!SLUG.test(slug)) return status(400);
  if (!(await env.STATS_LIMIT.limit({ key: slug })).success) return status(429);
  const now = Date.now();
  await ensure(env.DB, SCHEMA);
  const [all, days, countries] = await env.DB.batch([
    env.DB.prepare('SELECT COALESCE(SUM(n), 0) AS total, MIN(day) AS first FROM reads WHERE slug = ?1').bind(slug),
    env.DB.prepare('SELECT day, SUM(n) AS n FROM reads WHERE slug = ?1 AND day >= ?2 GROUP BY day ORDER BY day')
      .bind(slug, isoDay(now - 29 * DAY)),
    env.DB.prepare('SELECT country, SUM(n) AS n FROM reads WHERE slug = ?1 GROUP BY country ORDER BY n DESC, country LIMIT 8')
      .bind(slug),
  ]);
  const t = isoDay(now);
  return json({
    slug,
    total: all.results[0].total,
    first: all.results[0].first,
    today: days.results.find((d) => d.day === t)?.n || 0,
    days: days.results,
    countries: countries.results,
    asOf: new Date(now).toISOString(),
  });
}
