# The Worker

The site is static files. One Worker, `blog` (`worker/index.js`, configured by `wrangler.jsonc`), runs only for what
needs a secret or state. Only the paths `run_worker_first` names reach it: video, audio and HLS, `/read/*`, and
`/api/*`. Every other request is a static asset, served without running any code. The rules for changing it are in
`worker/CLAUDE.md`.

## Map

| Path | What it does |
|---|---|
| `worker/index.js` | `ROUTES` (path → method → handler) and `CRONS` (schedule → named jobs). A thrown error is logged and answered `503`. Any other `/api/` path is `404`, a known path with the wrong method `405` with `Allow`. |
| `worker/lib/http.js` | `json(body, status, headers)`, `status(code, headers)` (both `no-store` unless told otherwise), `sameOrigin(request)` |
| `worker/lib/sql.js` | `ensure(db, schema)`: runs a feature's `.sql` file once per isolate, before its first query |
| `worker/lib/flags.js` + `flags.sql` | `flags(env)`: switches and caps; `spend(env, what, n, max)`: the atomic daily cap; `today()` |
| `worker/lib/session.js` | `mint(env)` and `verify(env, token)`: Ask tokens, HMAC-signed with `SESSION_KEY`, valid 30 minutes |
| `worker/lib/text.js` | `normalize(q)` and `scrub(q)` for search and Ask queries |
| `worker/lib/build-files.js` | `buildJson(env, path)`: a build file through `ASSETS`, parsed once per isolate |
| `worker/media/serve.js` | everything that isn't `/api/`: R2 first, then the asset, with byte ranges |
| `worker/reads/` | `GET` and `POST /api/reads`, the reader counter (AO-057's demo) |
| `worker/stats/` | `GET` and `HEAD /api/stats`, and `runStep`, the traffic snapshot's cron (`shape.js` is its pure half) |
| `worker/session/`, `search/`, `ask/`, `cleanup.js` | stubs (`503`, or a step that does nothing) until T2.3 |
| `worker/read/` | a stub step until T2.4 records read-aloud |

## Routes

| Route | Answers |
|---|---|
| `POST /api/reads {slug}` | `204` counted (or skipped quietly for a self-declared bot); `403` not from one of the site's pages; `400` no slug; `404` not a listed post; `429` that post had 30 reads in the last minute here |
| `GET /api/reads?slug=` | `200 { slug, total, first, today, days: [{ day, n }], countries: [{ country, n }], asOf }`; `400`; `429` past 60 a minute for that post |
| `GET`, `HEAD /api/stats` | `200` the stored snapshot (cached 5 minutes per location); `503 { error, state }` (`gathering` or `not-connected`) until one exists; `500 { error }` when D1 can't be read |
| `GET`, `POST /api/session`, `GET /api/search`, `POST /api/ask` | `503` until T2.3 |
| any media path, `/read/*` | R2 (`MEDIA`) when it has the object, cutting ranges and checking `If-*` itself; else the asset, with ranges cut from `/media-sizes.json` (a length it can't learn means the whole file, `200`, `Accept-Ranges: bytes`); a `/read/<slug>/<hash>.json` that isn't recorded yet is `200 { ready: false }`, `no-store` |

R2 objects under `read/` go out `immutable`: their names are hashes of their text.

## Crons

| Schedule | Jobs |
|---|---|
| `* * * * *` | `stats.runStep`, `search.sync` (stub), `cleanup.daily` (stub; T2.3 makes it act once a day, at 03:07 UTC) |
| `*/10 * * * *` | `read.step` (stub until T2.4) |

Each job gets `(env, scheduledTime)`, does one bounded step and returns a word, which Workers Logs show as
`stats.runStep idle`. A job that throws is logged as `stats.runStep <message>` and the others carry on.

**The traffic snapshot** (`stats/index.js`). Each run does at most one small step, keeps its place in D1 and stops.
Once everything is in, a run is one small D1 read that finds nothing to do (`idle`). The step machine came from the
free plan's 10 ms of CPU a run; it stays on Paid because it works.
1. `totals`, once per UTC day: daily totals since launch, and 30 days of Core Web Vitals.
2. `core`, per day: bots by name, scanners, everyone else by user agent, Web Analytics.
3. `window`, per day, one or more: the people's page views by page, country, device and hour.
4. `assemble`: the day put together from its parts and the reader counter's table.
5. `rebuild`: the snapshot, the stored days' text joined, so no run ever parses thirty days.

Newest missing complete day first, then back to 30 days. A day counts as complete 20 minutes after it ends, so the
snapshot changes once a day, shortly after 00:20 UTC. A step that keeps failing is rested for longer each time and
the others carry on without it. Only the build's `/stats-pages.txt` decides which pages may be named, and when a post
is unlisted later every stored day is cleaned again before the next snapshot goes out.

## Bindings

| Binding | What | Used by |
|---|---|---|
| `ASSETS` | the build (`dist/`) | media, reads (`/ledger/previews.json`), stats (`/stats-pages.txt`), later search and read |
| `MEDIA` | R2 bucket `aaronorelup-site-media` (video, audio, `read/`) | media, later read |
| `DB` | D1 `blog-reads` | reads, stats, flags, later search, ask, read, cleanup |
| `AI` | Workers AI (`@cf/baai/bge-m3`) | T2.3 |
| `SEARCH_INDEX` | Vectorize `blog-search`, 1024 dimensions, cosine | T2.3 |
| `READS_LIMIT`, `STATS_LIMIT` | 30 and 60 a minute, per post | reads |
| `SEARCH_Q`, `SEARCH_ALL` | 20 a minute per query hash, 600 a minute in all | T2.3 |
| `ASK_LIMIT`, `ASK_ALL` | 6 a minute per Ask session, 60 a minute in all | T2.3 |
| var `TURNSTILE_HOSTNAMES` | where a Turnstile solve may come from: `aaronorelup.com` (`.dev.vars`: `localhost`) | T2.3 |

Every limiter is `simple`, counted per Cloudflare location and approximate. None is keyed on an address: nothing in
`worker/` reads one (`scripts/check/code.mjs` keeps it that way).

**Secrets** (never in a file; set with `node scripts/tools/put-secret.mjs NAME [FROM]`, which never prints a value):

| Secret | Where its value comes from |
|---|---|
| `CF_ANALYTICS_TOKEN` | the snapshot's read-only analytics token (set) |
| `SESSION_KEY` | `put-secret.mjs SESSION_KEY` makes 32 random bytes; rotating it ends every Ask session |
| `TURNSTILE_SECRET` | `put-secret.mjs TURNSTILE_SECRET` reads it from the widget |
| `DEEPSEEK_API_KEY` | T2.3, from Infisical |
| `ELEVENLABS_API_KEY` | T2.4: the Worker's own restricted key (Text to Speech and User read, a monthly credit quota), never Aaron's main key, so `put-secret.mjs ELEVENLABS_API_KEY <its Infisical name>` |

## D1 tables

Each feature keeps its tables in a `.sql` file beside its code (`CREATE TABLE IF NOT EXISTS` only), and
`ensure(env.DB, SCHEMA)` runs it once per isolate before the first query. Deploys are git pushes with no migration
step, so tables are only ever added, never changed or dropped.

| File | Tables |
|---|---|
| `worker/reads/reads.sql` | `reads (slug, day, country, n)` |
| `worker/stats/stats.sql` | `stats_state`, `stats_day`, `stats_part` |
| `worker/lib/flags.sql` | `flags (k, v)`, `usage_day (day, what, n)` |
| T2.3 `worker/search/search.sql`, `worker/ask/ask.sql`; T2.4 `worker/read/read.sql` | `search_state`, `search_docs`, `searches`, `ask_cache`, `read_state` |

## Switches and caps

`flags(env)` merges the `flags` table over these defaults, re-read at most every 30 seconds per isolate:

```
search: on   ask: on   tts: on   search_daily: 20000   ask_daily: 1000
ask_min_score: 0.45   tts_daily_credits: 15000   tts_credit_floor: 0.4
```

A row overrides one, takes effect within 30 seconds and survives deploys:

```bash
npx wrangler d1 execute blog-reads --remote --command "INSERT OR REPLACE INTO flags VALUES ('ask','off')"
npx wrangler d1 execute blog-reads --remote --command "DELETE FROM flags WHERE k = 'ask'"   # back to the default
```

## Running it from the box

Every `wrangler` command needs the account token in the environment, read inside the shell, never typed or echoed:

```bash
export CLOUDFLARE_API_TOKEN="$(python3 ~/.claude/bin/getkey.py CLOUDFLARE_R2_API_TOKEN)"
npx wrangler deployments list        # the live Worker blog, newest last
npx wrangler versions list
npx wrangler tail                    # live logs
npx wrangler deploy --dry-run        # after npm run build: bundles and lists every binding, uploads nothing
```

`npx wrangler rollback` has no dry run, and without a terminal it accepts its own prompt, so it rolls back at once.
Run it only as the bridge in the landing protocol's rollback step.

**Locally:** `cp .dev.vars.example .dev.vars`, `npm run build`, then `npx wrangler dev`. D1 is a local copy that
`ensure` fills with empty tables; AI, the index and the bucket are the real ones (`"remote": true`), and
`npx wrangler dev --local` turns those off. `.dev.vars` holds Cloudflare's always-pass Turnstile test secret, so with
the test site key from `src/data/public-keys.js` the dummy response `XXXX.DUMMY.TOKEN.XXXX` verifies. Add `--test-scheduled`
and fetch `/cdn-cgi/handler/scheduled?cron=*+*+*+*+*` to run a cron.

**The resources** the Worker binds that wrangler doesn't make are made by `node scripts/lib/cfapi.mjs`, which finds
or makes the Vectorize index `blog-search` and Ask's Turnstile widget ("aaronorelup.com Ask Goobie", managed,
`aaronorelup.com`) and prints only names and the public site key. The site key lives in `src/data/public-keys.js`.
