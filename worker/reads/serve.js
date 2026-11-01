// /api/reads: a reader counter for posts, kept in D1 (binding DB, the database blog-reads; its
// one table is worker/reads.sql). First used in AO-057, whose "count" demo part is the browser
// side (src/scripts/demos/cf.js).
//
//   POST {"slug": "…"}   counts one read of that post
//   GET  ?slug=…         the counts: in all, today, by day for 30 days, the top countries
//
// What is stored: the post, the day (UTC) and the country Cloudflare's edge put on the request,
// as a running count. What is not: the IP address, the browser, a cookie, the time of day. The
// address is used for one thing, in memory: the rate limits (READS_LIMIT, STATS_LIMIT in
// wrangler.jsonc), counted per Cloudflare location, so one script can't run a number up in one
// go. A patient script can still add a read every ten seconds; the post says so.
//
// The browser sends a read once per post per day, after the page has been visible for a few
// seconds and never from an automated browser. Here a read must come from this site's own pages
// (same Origin), from something that doesn't call itself a bot, for a post that is listed (it is
// in the build's /ledger/previews.json), so the table can't fill with made-up slugs.

const SLUG = /^[a-z0-9][a-z0-9-]{0,99}$/;
const BOTS = /bot|crawl|spider|slurp|headless|python|curl|wget|httpclient|okhttp|java\/|go-http|lighthouse|preview/i;
const today = () => new Date().toISOString().slice(0, 10);
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const counted = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

let listed = null; // slug -> card, from the build's previews.json, read once per isolate
const isListed = (env, origin, slug) => {
  listed = listed || env.ASSETS.fetch(new Request(origin + '/ledger/previews.json'))
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((j) => j.posts || {})
    .catch(() => { listed = null; return {}; }); // try again on the next request
  return listed.then((posts) => Object.prototype.hasOwnProperty.call(posts, slug));
};

export async function serveReads(request, env) {
  const url = new URL(request.url);
  if (!env.DB) return json({ error: 'The counter has no database here.' }, 503);
  try {
    if (request.method === 'POST') return await count(request, url, env);
    if (request.method === 'GET') return await counts(request, url, env);
  } catch (e) {
    // D1 refuses queries past the free plan's daily limits, among other things; say so plainly.
    console.error('reads: ' + ((e && e.message) || e));
    return json({ error: 'The counter could not reach its database.' }, 503);
  }
  return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
}

async function count(request, url, env) {
  const origin = request.headers.get('Origin') || '';
  let sameOrigin = false;
  try { sameOrigin = new URL(origin).host === url.host; } catch (e) { /* no Origin, or not a URL */ }
  if (!sameOrigin) return json({ error: 'Reads are counted from this site’s own pages only.' }, 403);
  let slug = '';
  try { slug = String((await request.json()).slug || ''); } catch (e) { /* not JSON */ }
  if (!SLUG.test(slug)) return json({ error: 'Unknown post.' }, 400);
  const ua = request.headers.get('User-Agent') || '';
  if (!ua || BOTS.test(ua) || request.cf?.verifiedBotCategory) return counted(); // skipped, quietly
  if (!(await isListed(env, url.origin, slug))) return json({ error: 'Unknown post.' }, 404);
  if (env.READS_LIMIT) {
    const { success } = await env.READS_LIMIT.limit({ key: (request.headers.get('CF-Connecting-IP') || '') + ' ' + slug });
    if (!success) return json({ error: 'Too many reads from one address; try again in a minute.' }, 429);
  }
  const country = /^[A-Z0-9]{2}$/.test(request.cf?.country || '') ? request.cf.country : 'XX';
  await env.DB.prepare(
    'INSERT INTO reads (slug, day, country, n) VALUES (?1, ?2, ?3, 1) ' +
    'ON CONFLICT (slug, day, country) DO UPDATE SET n = n + 1',
  ).bind(slug, today(), country).run();
  return counted();
}

async function counts(request, url, env) {
  const slug = url.searchParams.get('slug') || '';
  if (!SLUG.test(slug)) return json({ error: 'Unknown post.' }, 400);
  if (env.STATS_LIMIT) {
    const { success } = await env.STATS_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') || '' });
    if (!success) return json({ error: 'Too many requests; try again in a minute.' }, 429);
  }
  const since = new Date(Date.now() - 29 * 86400e3).toISOString().slice(0, 10);
  const [all, days, countries] = await env.DB.batch([
    env.DB.prepare('SELECT COALESCE(SUM(n), 0) AS total, MIN(day) AS first FROM reads WHERE slug = ?1').bind(slug),
    env.DB.prepare('SELECT day, SUM(n) AS n FROM reads WHERE slug = ?1 AND day >= ?2 GROUP BY day ORDER BY day').bind(slug, since),
    env.DB.prepare('SELECT country, SUM(n) AS n FROM reads WHERE slug = ?1 GROUP BY country ORDER BY n DESC, country LIMIT 8').bind(slug),
  ]);
  const dayRows = days.results || [];
  const t = today();
  return json({
    slug,
    total: all.results?.[0]?.total || 0,
    first: all.results?.[0]?.first || null,
    today: dayRows.find((d) => d.day === t)?.n || 0,
    days: dayRows,
    countries: countries.results || [],
    asOf: new Date().toISOString(),
  });
}
