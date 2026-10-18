// /api/stats: the site's traffic, as one daily snapshot that every visitor of /stats gets.
//
//   GET /api/stats   the stored snapshot (contract v1, described on the page and in the brief),
//                    returned as the text it was stored as; 503 with { error, state } until the
//                    first one exists (plus lastError: { at, message } when the last try failed)
//
// The numbers come from Cloudflare's GraphQL Analytics API (token: the CF_ANALYTICS_TOKEN secret)
// and are gathered by a cron trigger that runs every minute (wrangler.jsonc). That sounds like a
// lot for a snapshot that changes once a day, but the free plan gives a Worker 10 ms of CPU per
// run, and parsing one big analytics answer would use all of it: two runs were already stopped for
// CPU on 17 Oct. So each run does at most ONE small step of the job below, keeps its place in D1
// (database blog-reads, tables in worker/stats.sql) and stops. Once everything is in, a run is
// one small D1 read that finds nothing to do.
//
//   1. totals    once per UTC day: daily totals since launch, and 30 days of Core Web Vitals
//   2. core      per day: bots by name, scanners, everyone else by user agent, Web Analytics
//   3. window    per day, one or more: the people's page views by page, country, device and hour
//   4. assemble  the day is put together from its parts (and the reader counter's table)
//   5. rebuild   the snapshot: the stored days' text joined, so no run ever parses thirty days
//
// No run both reads an analytics answer and rebuilds the snapshot. Newest missing complete day
// first, then back to 30 days (the free plan's detailed datasets keep 31). A day counts as complete
// 20 minutes after it ends. On a first backfill the snapshot appears within a few minutes and
// fills in over about two hours (three or four steps a day, one step a minute, republished every
// ten minutes); after that it changes once a day, shortly after 00:20 UTC.
//
// A step that keeps failing (an error, an answer too big to read, a run stopped for CPU) is rested
// for longer each time and the others carry on without it, so one bad day never blocks the rest.
//
// Nothing keyed on a visitor's IP address is queried or kept, and no person's user agent is
// stored: stats-shape.js turns them into classes and browser names before anything is written.
// (Cloudflare's daily `uniques` is one number per day that Cloudflare counts on its side; see
// totalsQuery.) Unlisted posts never appear: the build's list of public pages
// (/stats-pages.txt) decides what may be shown, and when a post is unlisted later, every stored
// day is cleaned again before the next snapshot goes out.

import {
  CLASSES, SITE, LAUNCH, LIMITS, LITE, WINDOWS,
  coreQuery, windowQuery, totalsQuery,
  buildCore, buildWindow, assembleDay, buildTotals,
  makeSite, mentionsUnlisted, scrubDay,
} from './stats-shape.js';

const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';
const MIN = 60e3;
const HOUR = 60 * MIN;
const DAY = 86400e3;
const WANTED = 30;          // days of detail in the snapshot
const SETTLE = 20 * MIN;    // a day's last requests take a few minutes to reach the analytics
const RETAIN = 31 * DAY;    // httpRequestsAdaptiveGroups.notOlderThan is 2,678,400 s
const EDGE = 30 * MIN;      // don't start a day that is about to age out of that
const LOCK = 2 * MIN;       // one run at a time, even if one overruns into the next minute
const PAUSE = 6 * MIN;      // after an error: the API's rate limit lifts after 5 minutes
const PAUSE_AUTH = HOUR;    // after the token is refused: every query would be, until someone fixes it
const PUBLISH = 10 * MIN;   // while days are still coming in, the snapshot is republished this often
const SCRUB_PER_RUN = 6;    // stored days cleaned per run after a post is unlisted
// Bytes. Parsing JSON is most of a run's CPU, and a run in a fresh isolate costs several times
// what the same work costs warm, so answers stay under 100 KB: one bigger than these is not parsed
// but asked for again in smaller pieces (a smaller core query, the day cut into more slices).
const CORE_MAX = 120e3;
const SPLIT_AT = 100e3;
const HARD_MAX = 300e3;     // past every smaller piece, an answer this big is an error, not data
// How long a step that keeps failing is left alone, by how many times in a row it has failed.
const rest = (n) => (n < 2 ? 0 : n === 2 ? 30 * MIN : n === 3 ? 2 * HOUR : 6 * HOUR);

// The same statements as worker/stats.sql, so a fresh database sets itself up on the first run.
export const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS stats_state (k TEXT PRIMARY KEY, v TEXT)',
  'CREATE TABLE IF NOT EXISTS stats_day (d TEXT PRIMARY KEY, body TEXT NOT NULL, at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS stats_part (d TEXT NOT NULL, step TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY (d, step))',
];

const iso = (t) => new Date(t).toISOString().replace(/\.\d{3}Z$/, 'Z');
const isoDay = (t) => new Date(t).toISOString().slice(0, 10);
const errText = (e) => String((e && e.message) || e || 'unknown error');
const missingTable = (e) => /no such table/i.test(errText(e));
const readJSON = (s, fallback) => { try { return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; } };
const json = (body, status, cache = 'no-store') => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
});
// An error that means the token is missing, wrong or not allowed to read the analytics.
const AUTH = /authenticat|unauthori[sz]ed|not authori[sz]ed|forbidden|permission|\b40[13]\b/i;

// ---------------------------------------------------------------------------------------------
// The endpoint. It never parses the snapshot: the cron stored it as text, it goes out as text.

export async function serveStats(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const url = new URL(request.url);
  // One cache entry per location whatever the query string, so ?x=1, ?x=2 … can't reach D1.
  const key = new Request(url.origin + url.pathname, { method: 'GET' });
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  let body = null, lastError = null;
  if (env.DB) {
    try {
      const { results } = await env.DB.prepare("SELECT k, v FROM stats_state WHERE k IN ('snapshot', 'lastError')").all();
      for (const r of results || []) {
        if (r.k === 'snapshot') body = r.v || null;
        else lastError = readJSON(r.v, null);
      }
    } catch (e) {
      if (!missingTable(e)) {
        console.error('stats: ' + errText(e));
        return json({ error: 'The traffic numbers could not be read just now.' }, 500);
      }
    }
  }
  if (!body) {
    // Still no snapshot: say why, including the last thing that went wrong, so a refused token
    // doesn't read as "still gathering" for ever.
    const extra = lastError && lastError.message ? { lastError } : {};
    if (!env.CF_ANALYTICS_TOKEN || (lastError && AUTH.test(lastError.message || ''))) {
      return json({ error: 'The traffic numbers aren’t connected yet.', state: 'not-connected', ...extra }, 503);
    }
    return json({ error: 'The first numbers are still being gathered. They start to appear a few minutes after the counter starts, and fill in over the next couple of hours.', state: 'gathering', ...extra }, 503);
  }
  const res = new Response(body, {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
  if (cache) await cache.put(key, res.clone());
  return res;
}

// ---------------------------------------------------------------------------------------------
// The cron. Returns a word saying what it did, for logs and tests.

// Once per isolate, an idle run checks whether a post has been unlisted since the last snapshot.
// A deploy always starts new isolates, so this catches the deploy that unlisted it, at the cost of
// reading one small file per isolate rather than per run.
let siteChecked = false;

export async function runStep(env, now = Date.now()) {
  if (!env.DB) return 'no-database';
  if (!env.CF_ANALYTICS_TOKEN) return 'not-connected';
  let st;
  try {
    st = await readStatus(env);
  } catch (e) {
    if (!missingTable(e)) throw e;
    // A new database, or one where someone dropped a table: make the tables and carry on.
    await env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)));
    st = await readStatus(env);
  }
  const days = wantedDays(now);
  // A lock nobody released means the last run was stopped mid-step, which on this plan means the
  // CPU limit. Remember which step it was, so plan() asks for that step in smaller pieces, and
  // count it against that step like any other failure.
  const died = st.busy && st.busy <= now && st.busyJob ? st.busyJob : '';
  if (died) {
    st.strikes = { job: died, n: st.strikes.job === died ? st.strikes.n + 1 : 1 };
    const target = targetOf(died);
    if (target) countFail(st, target, now);
    st.dirty = true;
    await env.DB.batch([
      put(env, 'busyJob', ''),
      put(env, 'strikes', JSON.stringify(st.strikes)),
      put(env, 'fails', JSON.stringify(st.fails)),
      put(env, 'dirty', '1'), // whatever it was doing, the snapshot may not have caught up
      put(env, 'lastError', JSON.stringify({ at: iso(now), message: `A run was stopped before it finished (${died}); asking for it in smaller pieces.` })),
    ]);
  }
  let job = plan(st, days, now);
  if (!job && !siteChecked && st.listedSeen) {
    try {
      const site = await siteInfo(env);
      siteChecked = true;
      if (lostPosts(st.listedSeen, site)) job = { kind: 'rebuild' };
    } catch (e) {
      console.error('stats: ' + errText(e));
    }
  }
  if (!job) return 'idle';
  if (job.kind !== 'rebuild' && st.pause > now) {
    if (!st.dirty) return 'paused';
    job = { kind: 'rebuild' }; // nothing may be fetched, but the page can still learn why
  }
  if (st.busy > now) return 'busy';
  const until = now + LOCK;
  if (!(await lock(env, now, until, jobKey(job)))) return 'busy';
  const ctx = { env, now, days, st, queried: false };
  try {
    return await work(ctx, job);
  } catch (e) {
    await fail(ctx, job, e);
    return 'error';
  } finally {
    await env.DB.batch([
      env.DB.prepare("UPDATE stats_state SET v = '0' WHERE k = 'busy' AND v = ?1").bind(String(until)),
      put(env, 'busyJob', ''),
    ]).catch(() => {});
  }
}

async function readStatus(env) {
  const { results } = await env.DB.prepare(
    "SELECT 's' AS t, k AS a, v AS b, NULL AS c FROM stats_state WHERE k IN ('busy', 'busyJob', 'pause', 'totalsThrough', 'dirty', 'strikes', 'fails', 'builtAt', 'listedSeen') " +
    "UNION ALL SELECT 'd', d, NULL, NULL FROM stats_day " +
    "UNION ALL SELECT 'p', d, step, CASE WHEN step = 'core' THEN json_extract(body, '$.win') END FROM stats_part",
  ).all();
  const st = {
    busy: 0, busyJob: '', pause: 0, totalsThrough: '', dirty: false, strikes: { job: '', n: 0 }, fails: {},
    builtAt: '', listedSeen: '', days: new Set(), parts: new Map(),
  };
  for (const r of results || []) {
    if (r.t === 's') {
      if (r.a === 'busy' || r.a === 'pause') st[r.a] = +r.b || 0;
      else if (r.a === 'dirty') st.dirty = r.b === '1';
      else if (r.a === 'strikes' || r.a === 'fails') st[r.a] = readJSON(r.b, st[r.a]) || st[r.a];
      else st[r.a] = r.b || '';
    } else if (r.t === 'd') st.days.add(r.a);
    else {
      if (!st.parts.has(r.a)) st.parts.set(r.a, { win: 0, steps: new Set() });
      const p = st.parts.get(r.a);
      if (r.b === 'core') p.win = +r.c || 0;
      else p.steps.add(r.b);
    }
  }
  return st;
}

// The complete UTC days the snapshot should hold, newest first.
function wantedDays(now) {
  const today = Date.parse(isoDay(now) + 'T00:00:00Z');
  const out = [];
  for (let i = 1; out.length < WANTED && i <= WANTED + 2; i++) {
    const start = today - i * DAY;
    if (now < start + DAY + SETTLE) continue; // not over yet, or only just
    if (start < now - RETAIN + EDGE) break; // older than the detailed datasets keep
    out.push(isoDay(start));
  }
  return out;
}

function plan(st, days, now) {
  // A snapshot that is waiting to go out goes first when there is none yet, or it is ten minutes
  // old: a backfill shows its first day within minutes instead of after two hours.
  if (st.dirty && (!st.builtAt || now - Date.parse(st.builtAt) >= PUBLISH)) return { kind: 'rebuild' };
  const through = days[0];
  if (!through) return st.dirty ? { kind: 'rebuild' } : null;
  const resting = (target) => {
    const f = (st.fails || {})[target];
    return !!f && f[0] >= 2 && now - f[1] < rest(f[0]);
  };
  // The totals don't hold the days up: if they keep failing, the days are fetched meanwhile.
  if (st.totalsThrough !== through && !resting('totals')) {
    const back = isoDay(Date.parse(through + 'T00:00:00Z') - 363 * DAY); // the 1d dataset keeps a year
    return {
      kind: 'totals',
      through,
      from: back > LAUNCH ? back : LAUNCH,
      vitalsFrom: isoDay(Date.parse(through + 'T00:00:00Z') - (WANTED - 1) * DAY),
    };
  }
  for (const d of days) {
    if (st.days.has(d) || resting(d)) continue;
    const p = st.parts.get(d);
    if (!p || !p.win) {
      const job = { kind: 'core', d };
      return struck(st, job) ? { ...job, lite: true } : job;
    }
    for (let i = 0; i < p.win; i++) {
      if (p.steps.has(`w${i}/${p.win}`)) continue;
      const job = { kind: 'window', d, i, n: p.win };
      return struck(st, job) && p.win < 24 ? { kind: 'split', d, n: p.win } : job;
    }
    return { kind: 'assemble', d, n: p.win };
  }
  return st.dirty ? { kind: 'rebuild' } : null;
}

const jobKey = (job) => [job.kind, job.d || '', job.i !== undefined ? `${job.i}/${job.n}` : ''].join(' ').trim();
const struck = (st, job) => st.strikes.n > 0 && st.strikes.job === jobKey(job);
// What a step's failures count against: the totals, or its day. A rebuild fetches nothing.
const targetOf = (key) => (key.startsWith('totals') ? 'totals' : key.startsWith('rebuild') ? '' : key.split(' ')[1] || '');
function countFail(st, target, now) {
  const n = st.fails[target] ? st.fails[target][0] + 1 : 1;
  st.fails[target] = [n, now];
}
// The writes that forget a target's failures once one of its steps works.
const cleared = (env, st, target) => {
  if (!st.fails[target]) return [];
  delete st.fails[target];
  return [put(env, 'fails', JSON.stringify(st.fails))];
};
const lostPosts = (seen, site) => (seen || '').split(' ').some((slug) => slug && !site.listed.has(slug));

// Takes the lock if it is free (or expired) and notes which step holds it, in one round trip.
async function lock(env, now, until, key) {
  const [r] = await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO stats_state (k, v) VALUES ('busy', ?1) " +
      'ON CONFLICT (k) DO UPDATE SET v = excluded.v WHERE CAST(stats_state.v AS INTEGER) <= ?2',
    ).bind(String(until), now),
    env.DB.prepare(
      "INSERT INTO stats_state (k, v) SELECT 'busyJob', ?2 WHERE (SELECT v FROM stats_state WHERE k = 'busy') = ?1 " +
      'ON CONFLICT (k) DO UPDATE SET v = excluded.v',
    ).bind(String(until), key),
  ]);
  return ((r && r.meta && r.meta.changes) || 0) > 0;
}

const put = (env, k, v) => env.DB.prepare(
  'INSERT INTO stats_state (k, v) VALUES (?1, ?2) ON CONFLICT (k) DO UPDATE SET v = excluded.v',
).bind(k, v);
const bump = (env) => env.DB.prepare(
  "INSERT INTO stats_state (k, v) VALUES ('queries', '1') ON CONFLICT (k) DO UPDATE SET v = CAST(CAST(v AS INTEGER) + 1 AS TEXT)",
);
const putPart = (env, d, step, body) => env.DB.prepare(
  'INSERT INTO stats_part (d, step, body) VALUES (?1, ?2, ?3) ON CONFLICT (d, step) DO UPDATE SET body = excluded.body',
).bind(d, step, body);

// ---------------------------------------------------------------------------------------------
// One step.

async function work(ctx, job) {
  const { env, st } = ctx;
  if (job.kind === 'rebuild') {
    await rebuild(ctx);
    return 'rebuild';
  }
  // The site's public pages come first: nothing is fetched that couldn't then be cleaned.
  const site = await siteInfo(env);
  const t = { zone: env.STATS_ZONE, account: env.STATS_ACCOUNT, site: env.STATS_SITE };

  if (job.kind === 'totals') {
    // Web Analytics refusing the vitals half doesn't cost the totals: the last vitals are kept.
    const { data } = await graphql(ctx, totalsQuery(job.from, job.through, job.vitalsFrom, t), CORE_MAX, { partialAccounts: true });
    needZone(data, false);
    const { totals, vitals } = buildTotals(data, job.vitalsFrom, job.through);
    await env.DB.batch([
      put(env, 'totals', JSON.stringify(totals)),
      ...(vitals ? [put(env, 'vitals', JSON.stringify(vitals))] : []),
      put(env, 'totalsThrough', job.through),
      put(env, 'lastError', ''),
      put(env, 'dirty', '1'),
      ...cleared(env, st, 'totals'),
      bump(env),
    ]);
    return 'totals';
  }

  if (job.kind === 'core') {
    const limits = job.lite ? LITE : LIMITS;
    const { data } = await graphql(ctx, coreQuery(job.d, t, limits), job.lite ? HARD_MAX : CORE_MAX);
    if (!data) {
      // Too big to read in the time a run has: ask again next minute with smaller limits.
      await env.DB.batch([put(env, 'strikes', JSON.stringify({ job: jobKey({ kind: 'core', d: job.d }), n: 1 })), bump(env)]);
      return 'too-big';
    }
    needZone(data, true);
    const core = buildCore(data, job.d, site, limits);
    await env.DB.batch([putPart(env, job.d, 'core', JSON.stringify(core)), put(env, 'lastError', ''), ...cleared(env, st, job.d), bump(env)]);
    return job.lite ? 'core-lite' : 'core';
  }

  const coreRow = await env.DB.prepare("SELECT body FROM stats_part WHERE d = ?1 AND step = 'core'").bind(job.d).first();
  const core = JSON.parse(coreRow.body);
  // Busier than the page count promised (or a run died reading it): cut the day finer and start
  // its slices again.
  const split = async (queried) => {
    core.win = WINDOWS[Math.min(WINDOWS.length - 1, WINDOWS.indexOf(core.win) + 1)];
    await env.DB.batch([
      env.DB.prepare("DELETE FROM stats_part WHERE d = ?1 AND step <> 'core'").bind(job.d),
      putPart(env, job.d, 'core', JSON.stringify(core)),
      put(env, 'lastError', ''),
      ...(queried ? [bump(env)] : []),
    ]);
    return 'split';
  };
  if (job.kind === 'split') return split(false);

  if (job.kind === 'window') {
    const { data } = await graphql(ctx, windowQuery(job.d, job.i, job.n, t), job.n < 24 ? SPLIT_AT : HARD_MAX);
    if (data) needZone(data, false);
    const rows = (data && data.viewer.zones[0].people) || [];
    if (!data || (rows.length >= LIMITS.people && job.n < 24)) return split(true);
    const w = buildWindow(data, core.ref, site);
    await env.DB.batch([putPart(env, job.d, `w${job.i}/${job.n}`, JSON.stringify(w)), put(env, 'lastError', ''), ...cleared(env, st, job.d), bump(env)]);
    return 'window'; // the next run puts the day together
  }

  // assemble: every slice is in.
  const { results } = await env.DB.prepare('SELECT step, body FROM stats_part WHERE d = ?1').bind(job.d).all();
  const windows = (results || []).filter((r) => r.step.endsWith(`/${core.win}`)).map((r) => JSON.parse(r.body));
  let reads = [];
  try {
    reads = (await env.DB.prepare('SELECT slug, SUM(n) AS n FROM reads WHERE day = ?1 GROUP BY slug').bind(job.d).all()).results || [];
  } catch (e) { /* no reader counter table here: no reads */ }
  const day = assembleDay(core, windows, reads, site);
  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO stats_day (d, body, at) VALUES (?1, ?2, ?3) ON CONFLICT (d) DO UPDATE SET body = excluded.body, at = excluded.at',
    ).bind(job.d, JSON.stringify(day), iso(ctx.now)),
    env.DB.prepare('DELETE FROM stats_part WHERE d = ?1').bind(job.d),
    put(env, 'dirty', '1'),
    put(env, 'lastError', ''),
    ...cleared(env, st, job.d),
  ]);
  return 'day';
}

// The snapshot: the stored pieces joined as text. The only parsing is of days that have to be
// cleaned again: all of them, a few a run, after a post is unlisted (a day waiting for that is
// left out of the snapshot meanwhile), or one that turns out to mention a post that isn't listed.
async function rebuild(ctx) {
  const { env, now, days } = ctx;
  const earliest = days[days.length - 1] || isoDay(now - WANTED * DAY);
  const [stateRes, dayRes] = await env.DB.batch([
    env.DB.prepare("SELECT k, v FROM stats_state WHERE k IN ('totals', 'vitals', 'queries', 'lastError', 'listedSeen', 'scrubPending')"),
    env.DB.prepare('SELECT d, body FROM stats_day WHERE d >= ?1 ORDER BY d').bind(earliest),
  ]);
  const s = Object.fromEntries((stateRes.results || []).map((r) => [r.k, r.v]));
  const stored = dayRes.results || [];
  const writes = [
    env.DB.prepare('DELETE FROM stats_day WHERE d < ?1').bind(earliest),
    env.DB.prepare('DELETE FROM stats_part WHERE d < ?1').bind(earliest),
  ];
  if (!s.totals || !stored.length) { // nothing to show yet
    writes.push(put(env, 'dirty', ''));
    await env.DB.batch(writes);
    return;
  }
  const site = await siteInfo(env);
  const pending = new Set(readJSON(s.scrubPending, []));
  if (lostPosts(s.listedSeen, site)) for (const r of stored) pending.add(r.d);
  const bodies = [];
  let scrubbed = 0;
  for (const r of stored) {
    let body = r.body;
    if (pending.has(r.d) || mentionsUnlisted(body, site)) {
      if (scrubbed >= SCRUB_PER_RUN) continue; // not clean yet: left out until a later run
      body = JSON.stringify(scrubDay(JSON.parse(body), site));
      scrubbed++;
      pending.delete(r.d);
      writes.push(env.DB.prepare('UPDATE stats_day SET body = ?2 WHERE d = ?1').bind(r.d, body));
    }
    bodies.push([r.d, body]);
  }
  for (const d of [...pending]) if (!stored.some((r) => r.d === d)) pending.delete(d);
  const lastError = readJSON(s.lastError, null);
  const totalsFirst = (/"rows":\[\["(\d{4}-\d{2}-\d{2})"/.exec(s.totals) || [])[1] || LAUNCH;
  const text =
    '{"v":1,"site":' + JSON.stringify(SITE) +
    ',"builtAt":' + JSON.stringify(iso(now)) +
    ',"through":' + JSON.stringify(bodies[bodies.length - 1][0]) +
    ',"coverage":' + JSON.stringify({ days: bodies.length, wanted: days.length || WANTED, first: bodies[0][0], totalsFirst }) +
    ',"run":' + JSON.stringify({ queries: +s.queries || 0, lastError }) +
    ',"totals":' + s.totals +
    ',"vitals":' + (s.vitals || 'null') +
    ',"posts":null,"days":[' + bodies.map(([, b]) => b).join(',') + ']}';
  writes.push(
    put(env, 'snapshot', text),
    put(env, 'builtAt', iso(now)),
    put(env, 'listedSeen', site.key),
    put(env, 'scrubPending', JSON.stringify([...pending])),
    put(env, 'dirty', pending.size ? '1' : ''),
  );
  await env.DB.batch(writes);
}

async function fail(ctx, job, e) {
  const { env, now, st } = ctx;
  let message = errText(e).replace(/\s+/g, ' ').trim();
  if (env.CF_ANALYTICS_TOKEN) message = message.split(env.CF_ANALYTICS_TOKEN).join('[token]');
  message = message.slice(0, 300);
  console.error('stats: ' + message);
  const target = targetOf(jobKey(job));
  if (target) countFail(st, target, now);
  const writes = [
    put(env, 'lastError', JSON.stringify({ at: iso(now), message })),
    put(env, 'pause', String(now + (AUTH.test(message) ? PAUSE_AUTH : PAUSE))),
    put(env, 'dirty', '1'), // so the next run republishes the snapshot with the error in it
    ...(target ? [put(env, 'fails', JSON.stringify(st.fails))] : []),
  ];
  if (ctx.queried) writes.push(bump(env));
  try { await env.DB.batch(writes); } catch (e2) { console.error('stats: could not record the error: ' + errText(e2)); }
}

// ---------------------------------------------------------------------------------------------
// Talking to Cloudflare.

// maxParse: an answer longer than this comes back as { data: null } without being parsed, so
// the caller can ask for less instead of spending the run's CPU on it. opts.partialAccounts: when
// every error is about the accounts half (Web Analytics), keep the zone half and drop that one.
async function graphql(ctx, query, maxParse, opts) {
  const { env } = ctx;
  // A local mock server stands in for the API in tests; the token never goes anywhere else.
  const local = env.CF_GRAPHQL_URL && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(env.CF_GRAPHQL_URL);
  ctx.queried = true;
  const res = await fetch(local ? env.CF_GRAPHQL_URL : GRAPHQL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.CF_ANALYTICS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (res.ok && text.length > maxParse && !/"errors":\s*\[\s*\{/.test(text.slice(0, 2000))) {
    if (maxParse >= HARD_MAX) throw new Error(`The analytics answer was too large to read (${text.length} bytes).`);
    return { data: null, size: text.length };
  }
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* reported below */ }
  if (body && Array.isArray(body.errors) && body.errors.length) {
    const accountsOnly = opts && opts.partialAccounts && body.data && body.data.viewer &&
      body.errors.every((x) => x && Array.isArray(x.path) && x.path.includes('accounts'));
    if (!accountsOnly) throw new Error(body.errors.map((x) => (x && x.message) || 'error').join('; '));
    body.data.viewer.accounts = null;
  }
  if (!res.ok) throw new Error(`The analytics API answered ${res.status}.`);
  if (!body || !body.data) throw new Error('The analytics API sent no data.');
  return { data: body.data, size: text.length };
}

// An answer with no zone (or, for the core step, no account) is a token or tag that can't see
// the site, not a day nobody visited: it is an error, so it is retried instead of kept as zeroes.
function needZone(data, account) {
  const v = data && data.viewer;
  if (!v || !Array.isArray(v.zones) || v.zones.length !== 1) {
    throw new Error('The analytics API answered with no data for the site (the zone tag, or what the token may read).');
  }
  if (account && (!Array.isArray(v.accounts) || v.accounts.length !== 1)) {
    throw new Error('The analytics API answered with no Web Analytics data (the account tag, or what the token may read).');
  }
}

// What may be shown: the build's list of public pages (stats-pages.txt, see astro.config.mjs), or,
// if a build somehow lacks it, the listed posts from previews.json. Read once per isolate.
let sitePromise = null;
function siteInfo(env) {
  sitePromise = sitePromise || (async () => {
    let r = await env.ASSETS.fetch(new Request(`https://${SITE}/stats-pages.txt`));
    if (!r.ok) r = await env.ASSETS.fetch(new Request(`https://${SITE}/ledger/previews.json`));
    if (!r.ok) throw new Error(`The list of the site's pages answered ${r.status}.`);
    return makeSite(await r.text());
  })().catch((e) => { sitePromise = null; throw e; }); // try again next run
  return sitePromise;
}

export const _test = {
  wantedDays, plan, readStatus, CLASSES,
  newIsolate: () => { siteChecked = false; sitePromise = null; },
};
