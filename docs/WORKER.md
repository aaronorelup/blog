# The Worker

The site is static files. One Worker, `blog` (`worker/index.js`, configured by `wrangler.jsonc`), runs only for what
needs a secret or state. Only the paths `run_worker_first` names reach it: video, audio and HLS, `/read/*`, and
`/api/*`. Every other request is a static asset, served without running any code. The rules for changing it are in
`worker/CLAUDE.md`.

## Map

| Path | What it does |
|---|---|
| `worker/index.js` | `ROUTES` (path → method → handler) and `CRONS` (schedule → named jobs). A thrown error is logged and answered `503`. Any other `/api/` path is `404`, a known path with the wrong method `405` with `Allow`. |
| `worker/lib/http.js` | `json(body, status, headers)`, `status(code, headers)` (both `no-store` unless told otherwise), `sameOrigin(request)`, `readJson(request, max)` (a POST body, `null` when over `max` bytes) |
| `worker/lib/sql.js` | `ensure(db, schema)`: runs a feature's `.sql` file once per isolate, before its first query |
| `worker/lib/flags.js` + `flags.sql` | `flags(env)`: switches and caps; `spend(env, what, n, max, day)`: the atomic daily cap (a day's first spend is held to it too; `NO_CAP` for a settle); `today()` |
| `worker/lib/memo.js` | `memo(ms, read)`: a D1 read shared for `ms` per isolate (the switches, the search index's `v`) |
| `worker/lib/session.js` | `mint(env)` and `verify(env, token)`: Ask tokens, HMAC-signed with `SESSION_KEY`, valid 30 minutes |
| `worker/lib/text.js` | `normalize(q)`, `scrub(q)` and `sha256(s)` for search and Ask queries |
| `worker/lib/build-files.js` | `buildJson(env, path)`: a build file through `ASSETS`, parsed once per isolate |
| `worker/media/serve.js` | everything that isn't `/api/`: R2 first, then the asset, with byte ranges |
| `worker/lantern.js` | `GET /api/lantern`, the homepage's lantern door: a redirect to `LANTERN_URL` |
| `worker/reads/` | `GET` and `POST /api/reads`, the reader counter (AO-057's demo) |
| `worker/stats/` | `GET` and `HEAD /api/stats`, and `runStep`, the traffic snapshot's cron (`shape.js` is its pure half) |
| `worker/session/serve.js` | `GET`, `POST /api/session`: whether Ask is on; a Turnstile solve becomes an Ask token |
| `worker/search/` | `serve.js` (`GET /api/search`), `retrieve.js` (embed a query, ask Vectorize; `nearest()`, ids only, is Ask's), `sync.js` (`search.sync`, and `indexVersion()`), `counts.js` (the anonymous counts), `search.sql` |
| `worker/ask/` | RAG Goobie (docs/ASK.md): `serve.js` (`POST /api/ask`: the guards, the answer cache, both caps, the resting path, the stream), `run.js` (one question's steps, settle, cache write, log line), `plan.js` (the planner call), `rank.js` (embeddings counted in `search_daily`, ids-only lookups, fusion, R, focus, hint, matched), `context.js` (what the answer is given, the user message), `body.js` (the requests as Blobs of the build's `/ask/*.txt`), `prompt.js` (their escaped pieces, `PROMPT_V`), `deepseek.js` (one call, timeouts, the stream), `cite.js` (marks to cites, streamed too), `corpus.js` (`/ask/manifest.json`'s lookups), `events.js` (the event stream, the heartbeat), `cache.js` (the answer cache), `ask.sql` |
| `worker/cleanup.js` | `cleanup.daily`, the sweep of old counts, answers and totals |
| `worker/read/` | `step.js` (`read.step`, the read-aloud recorder), `voice.js` (the ElevenLabs calls), `read.sql` |

## Routes

| Route | Answers |
|---|---|
| `POST /api/reads {slug}` | `204` counted (or skipped quietly for a self-declared bot); `403` not from one of the site's pages; `400` no slug; `404` not a listed post; `429` that post had 30 reads in the last minute here |
| `GET /api/reads?slug=` | `200 { slug, total, first, today, days: [{ day, n }], countries: [{ country, n }], asOf }`; `400`; `429` past 60 a minute for that post |
| `GET`, `HEAD /api/stats` | `200` the stored snapshot (cached 5 minutes per location); `503 { error, state }` (`gathering` or `not-connected`) until one exists; `500 { error }` when D1 can't be read |
| `GET /api/session` | `200 { ask }`, cached 30 s: `true` when the `ask` flag is on and `DEEPSEEK_API_KEY` is set |
| `POST /api/session {turnstile}` | `200 { token, exp }`, an Ask token for 30 minutes; `403` not from one of the site's pages; `413` a body over 3 KB (a Turnstile response can be 2,048 characters); `401` siteverify says no, or the solve's hostname isn't in `TURNSTILE_HOSTNAMES`, or its action isn't `ask` |
| `GET /api/search?q=` | `200 { v, hits: [{ slug, kind, anchor, heading, text, score }] }`, the best 2 chunks of each of the best 8 posts (`kind` is `post` or `notes`; `anchor` `''` is the top of the page, `short` the short version); `400` `q` under 3 or over 200 characters once normalised; `429` past 600 a minute here, or 20 a minute for that query; `503` the `search` flag is off, or `search_daily` is spent (until 00:00 UTC). No token |
| `POST /api/ask {q}`, header `X-AO-Session` | `200`, `text/event-stream`: events `data: <json>\n\n`, each with its type in `t`: `start { posts, notes, mode, packs }`, `plan { topics, picks }` or `{ skipped }`, `found { searches, passages, posts, matched, ranked }` or `{ skipped }`, `read { given, of, tokens, focus }`, `write`, `cite { n, slug, kind, anchor, heading, title }` before the `text { d }` that first uses it, `wait` (after 10 s without another), and exactly one last `answer { answer, cites, related, cached, took, usage: { tokens, hit, out, usd } }` or `end { reason, related }`, `reason` `off` (the flag, or no key), `resting` (`ask_daily` or `ask_daily_usd` spent: no DeepSeek call, the closest posts from one lookup) or `busy` (DeepSeek refused, timed out or was cut short; nothing cached). A cached answer is one `answer` event. `kind` is `post` or `notes` (a notes cite links to `/ledger/<slug>/notes/#<anchor>`). Before the stream, bare statuses: `413` a body over 2 KB; `401` no valid token; `400` `q` under 3 or over 300 characters; `429` past 6 a minute in that session, or 60 a minute here |
| `GET /api/lantern` | `302` to `LANTERN_URL`, `no-store`: the lantern door on the homepage's coin (five night tosses in a row) opens here, so its address is in no file of this public repo |
| any media path, `/read/*` | R2 (`MEDIA`) when it has the object, cutting ranges and checking `If-*` itself; else the asset, with ranges cut from `/media-sizes.json` (a length it can't learn means the whole file, `200`, `Accept-Ranges: bytes`); a `/read/<slug>/<hash>.json` that isn't recorded yet is `200 { ready: false }`, `no-store` |

R2 objects under `read/` go out `immutable`: their names are hashes of their text.

## Crons

| Schedule | Jobs |
|---|---|
| `* * * * *` | `stats.runStep`, `search.sync`, `cleanup.daily` (acts once a day, at 03:07 UTC) |
| `*/10 * * * *` | `read.step` |

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

**The search index** (`search/sync.js`). The build writes `/search/manifest.json`, `{ v, model, live, docs: {
'<kind>:<slug>': hash } }`, and one `/search/docs/<kind>-<slug>.json` per listed post and notes page
(`src/lib/search/chunks.js`). A run reads the manifest and stops (`idle`) when `search_state`'s `v` is the manifest's
and each live notebook (`live`, whose hash `v` leaves out) has its hash in `search_docs`. Otherwise it drops the vectors and rows
of removed docs (an unlisted post; deletes go 100 ids at a time, Vectorize's most), then embeds up to 10 changed
docs, a live notebook last, 50 chunks an AI call and an upsert, as
`"<title>. <heading>\n<text>"`, upserting ids `<AO-id>:<n>` (`<AO-id>n:<n>` for notes) with metadata `{ s: slug, k:
kind, a: anchor, h: heading, t: text, T: title }`, plus `v: 'claude'` on a post or notes page Claude tells as "I"
(frontmatter `voice`, which Ask's excerpt header marks), and deletes the doc's ids past its new count. The run that
finds nothing left stores `v`, a minute after the last upserts, which gives Vectorize that minute to apply them. `v`
keys `/api/search`'s cache, so cached results turn over once the index is whole again. The first full sync is
about 1,000 chunks in 9 runs (10 minutes on 2026-11-01); an AO-073 push re-embeds that one doc and touches no cache.

**The daily sweep** (`cleanup.js`, 03:07 UTC): `searches` rows past 180 days, `ask_cache` past 7 days, `usage_day`
past 60 days. A missed run waits for the next day's.

**Read-aloud** (`read/step.js`, every 10 minutes). The build writes `/read/index.json`, `{ voice, model, format,
settings, posts: { slug: { hash, chars, rank } } }` for the posts it records (`src/lib/read/posts.js`: listed, never a
live notebook; rank 0 first: Start here, then newest), and one `/read/<slug>.json`, `{ slug, hash, voice, model,
sections: [{ hash, chars, blocks: [[r, kind, text]] }] }`, for each of them (`src/lib/read/sections.js`: the title, summary and opening, then one section
per h2, split above 2,500 spoken characters; a section's hash covers the voice, model, settings and its text). A run:
1. Stops (`off`) unless the `tts` flag is on and `ELEVENLABS_API_KEY` is set.
2. Takes the first post by rank whose `read_state` isn't `done` at its hash and has failed fewer than 3 times there
   (`idle` when none). Its sections already in R2 (`read/<slug>/<section hash>.json`) are kept.
3. Before voicing: `GET /v1/user/subscription` must answer (else it stops and counts no try) and leave at least
   `tts_credit_floor` of the account's credit after this run's estimate (half a credit a character); the estimate
   must fit under `tts_daily_credits` (`spend`), and is settled to what the answers said they cost (`character-cost`).
4. Voices the missing sections in order, up to 10,000 spoken characters a run (`voice.js`: with-timestamps, the
   neighbours' text as `previous_text`/`next_text`, 120 s timeout, no retry). The copy sent is
   `src/lib/read/speak.js`'s (numbers, money, units, dates, clock times and lengths spelled out); `align.js` turns the character times into
   words `[j, c0, c1, t0, t1]` on the display text. Each section goes to R2 as `read/<slug>/<hash>.mp3` and
   `.json` (`{ dur, words }`). A failed call or an answer without a usable alignment counts one try.
5. With every section in R2 it writes `read/<slug>/<post hash>.json`, `{ v: 1, hash, parts: [{ src, dur, words:
   [[r, c0, c1, t0, t1]] }] }`, whose existence means the recording is whole, and marks the post `done`.

Each run logs what it did (`read.step what-drives-claude-code-cost: 3 sections, 4210 characters, 1050 credits, 5
sections to go`) or why it stopped. Old hashes are never deleted, so a rolled-back deploy still finds its audio.

## Bindings

| Binding | What | Used by |
|---|---|---|
| `ASSETS` | the build (`dist/`) | media, reads (`/ledger/previews.json`), stats (`/stats-pages.txt`), search and ask (`/search/manifest.json`'s model, the docs), ask (`/ask/manifest.json` and the prompt's `/ask/*.txt`), read (`/read/index.json`, `/read/<slug>.json`) |
| `MEDIA` | R2 bucket `aaronorelup-site-media` (video, audio, `read/`) | media, read (writes `read/` only) |
| `DB` | D1 `blog-reads` | reads, stats, flags, session (flags), search, ask, cleanup, read |
| `AI` | Workers AI (`@cf/baai/bge-m3`) | search (queries and the sync), ask (the question and the planner's queries, counted in `search_daily`) |
| `SEARCH_INDEX` | Vectorize `blog-search`, 1024 dimensions, cosine | search, ask |
| `READS_LIMIT`, `STATS_LIMIT` | 30 and 60 a minute, per post | reads |
| `SEARCH_Q`, `SEARCH_ALL` | 20 a minute per query (16 hex of its SHA-256), 600 a minute in all | search |
| `ASK_LIMIT`, `ASK_ALL` | 6 a minute per Ask session (its random `s`), 60 a minute in all | ask |
| var `TURNSTILE_HOSTNAMES` | where a Turnstile solve may come from, comma-separated: `aaronorelup.com` (`.dev.vars`: `example.com`, what the test secret answers) | session |
| var `DEEPSEEK_URL` | DeepSeek's chat endpoint; the stall test points `wrangler dev --var DEEPSEEK_URL:...` at a stub (docs/ASK.md) | ask |

Every limiter is `simple`, counted per Cloudflare location and approximate. None is keyed on an address: nothing in
`worker/` reads one (`scripts/check/code.mjs` keeps it that way).

**Secrets** (never in a file; set with `node scripts/tools/put-secret.mjs NAME [FROM]`, which never prints a value):

| Secret | Where its value comes from |
|---|---|
| `CF_ANALYTICS_TOKEN` | the snapshot's read-only analytics token (set) |
| `LANTERN_URL` | where the lantern door goes (`GET /api/lantern`); Aaron's own address, set from the box, never written in a file (set) |
| `SESSION_KEY` | `put-secret.mjs SESSION_KEY` makes 32 random bytes; rotating it ends every Ask session |
| `TURNSTILE_SECRET` | `put-secret.mjs TURNSTILE_SECRET` reads it from the widget |
| `DEEPSEEK_API_KEY` | Ask's DeepSeek key, from Infisical (`put-secret.mjs DEEPSEEK_API_KEY`; set). Without it Ask is `off` |
| `ELEVENLABS_API_KEY` | read-aloud: the Worker's own restricted key (Text to Speech and User read, a monthly credit quota), never Aaron's main key, so `put-secret.mjs ELEVENLABS_API_KEY <its Infisical name>`. Without it `read.step` is `off` |

## D1 tables

Each feature keeps its tables in a `.sql` file beside its code (`CREATE TABLE IF NOT EXISTS` only), and
`ensure(env.DB, SCHEMA)` runs it once per isolate before the first query. Deploys are git pushes with no migration
step, so tables are only ever added, never changed or dropped.

| File | Tables |
|---|---|
| `worker/reads/reads.sql` | `reads (slug, day, country, n)` |
| `worker/stats/stats.sql` | `stats_state`, `stats_day`, `stats_part` |
| `worker/lib/flags.sql` | `flags (k, v)`, `usage_day (day, what, n)`: `what` is `search` (Workers AI embedding calls, search's and Ask's), `ask` (questions that reached DeepSeek), `ask_usd` (Ask's DeepSeek spend in micro-dollars: a worst-case reservation, settled to the reported usage) or `tts_credits` (ElevenLabs credits) |
| `worker/search/search.sql` | `search_state (k, v)`, `search_docs (doc, id, hash, n)` (each embedded doc, its vector id prefix and chunk count), `searches (day, mode, q, n)` (no address, token, session, country or browser; `q` normalised, scrubbed, at most 80 characters) |
| `worker/ask/ask.sql` | `ask_cache (key, body, at)`: `key` is the SHA-256 of the model, `PROMPT_V` (every word and setting of the prompts), `/ask/manifest.json`'s `v`, `ask_extra_tokens` and the question; `body` is `{ answer, cites, related, took, usage, live? }`, `live` the live notebook's hash when the answer drew on it (a push makes it a miss). Any change to the prompt, a stable post or the listed set moves every key, so old answers are never served again and age out after 7 days |
| `worker/read/read.sql` | `read_state (slug, hash, state, tries, at)`: each post's recording at the hash `/read/index.json` names; `state` `partial`, `failed` (`tries` failed runs at that hash; 3 and it waits for new text) or `done` |

## Switches and caps

`flags(env)` merges the `flags` table over these defaults, re-read at most every 30 seconds per isolate:

```
search: on   ask: on   tts: on   search_daily: 20000   ask_daily: 1000   ask_daily_usd: 2   ask_extra_tokens: 40000
tts_daily_credits: 15000   tts_credit_floor: 0.4
```

`ask_daily_usd` is dollars a UTC day for RAG Goobie's DeepSeek calls (each question reserves its worst case first, so
the cap can't be passed); `ask_daily` (questions a day reaching DeepSeek) is a backstop in case prices move before
`src/lib/ask/price.js` does; `ask_extra_tokens` is split mode's uncached docs a question. Raise `ask_daily_usd` to what
the build's `ask:` line suggests, and before split mode switches on (docs/ASK.md). Rows set today: `tts` `off`
(2026-11-01, until the Worker has its own ElevenLabs key; then `DELETE FROM flags WHERE k = 'tts'` turns read-aloud's
recording on). The old `ask_min_score` row is read by nothing since RAG Goobie v2; delete it (`DELETE FROM flags WHERE
k = 'ask_min_score'`). A row overrides one, takes effect within 30 seconds and survives deploys:

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
and fetch `/cdn-cgi/handler/scheduled?cron=*+*+*+*+*` to run a cron (each run is one `search.sync` step, into the
real index). Ask answers `off` without `DEEPSEEK_API_KEY`. To run it with the key, which never goes in a file, give
wrangler no `.dev.vars` and the vars in the process environment instead, read inside the shell:

```bash
env -i PATH="$PATH" HOME="$HOME" HTTPS_PROXY="$HTTPS_PROXY" NODE_EXTRA_CA_CERTS="$NODE_EXTRA_CA_CERTS" \
  CLOUDFLARE_API_TOKEN="$(python3 ~/.claude/bin/getkey.py CLOUDFLARE_R2_API_TOKEN)" \
  DEEPSEEK_API_KEY="$(python3 ~/.claude/bin/getkey.py DEEPSEEK_API_KEY)" \
  TURNSTILE_SECRET=1x0000000000000000000000000000000AA TURNSTILE_HOSTNAMES=example.com SESSION_KEY=local-only \
  CLOUDFLARE_INCLUDE_PROCESS_ENV=true npx wrangler dev --test-scheduled
```

Wrangler lists each of those as `(hidden)`. RAG Goobie's eval runs this way, without `--test-scheduled`, its local D1
capped at `ask_daily_usd` 3 (docs/ASK.md, "The eval"). The index is the live one (`"remote": true`) but D1 is local, so a local
`search.sync` writes the live index without the live `search_docs` knowing. Run crons locally only on a build of the
deployed `origin/main`, whose chunks are the ones the live index already holds; a sync of any other build leaves
its text in live search until that doc next changes on `main`.

**The resources** the Worker binds that wrangler doesn't make are made by `node scripts/lib/cfapi.mjs`, which finds
or makes the Vectorize index `blog-search` and Ask's Turnstile widget ("aaronorelup.com Ask Goobie", managed,
`aaronorelup.com`) and prints only names and the public site key. The site key lives in `src/data/public-keys.js`.
