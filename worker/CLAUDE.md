# worker/: the edge (Cloudflare Worker `blog`)

Read `docs/WORKER.md` first: the map, every route's answers, the crons, bindings, secrets, tables and flags.

## Rules

- **No IP address, ever.** Nothing here reads `CF-Connecting-IP` or sends one anywhere; limiters are keyed on the
  post, the query hash, the Ask session or `'all'`. `scripts/check/code.mjs` fails on it.
- **Errors are status codes.** `status(code)` from `lib/http.js`, no sentences; the page words its own failure. Only
  `/api/stats` keeps its `{ error, state }` bodies. A thrown error becomes a `503` in `index.js`; a `catch` exists
  only where it changes the answer.
- **Validate at the edge only:** method, size, origin, token, limits, and third-party answers. Bindings, vars and
  build files are always there: no `if (env.DB)`, no fallback for a file the build writes.
- **Every paid call** (Workers AI, DeepSeek, ElevenLabs) has a cap (`spend()` in `lib/flags.js`), a timeout, no
  retry and a switch (a `flags` row).
- **Bindings per module:** a feature touches only the bindings its row in `docs/WORKER.md` lists.

## Adding things

- **A route:** a line in `ROUTES` (`index.js`), the handler in its feature folder as `(request, env, ctx)`, and its
  path under `run_worker_first` in `wrangler.jsonc` if `/api/*` doesn't cover it.
- **A cron job:** a named entry in `CRONS`, `(env, scheduledTime)`, one bounded step a run, returning a word to log.
- **A table:** `CREATE TABLE IF NOT EXISTS` in the feature's `.sql` file, imported as text and run by
  `ensure(env.DB, SCHEMA)` before its first query. Tables are only ever added: never alter or drop one.
- **A switch or cap:** its default in `lib/flags.js`'s `DEFAULTS`; a `flags` row overrides it without a deploy.
- **A binding or secret:** `wrangler.jsonc` (secrets only by name, set with `scripts/tools/put-secret.mjs`) and the
  tables in `docs/WORKER.md`.

Check a change with `npm run build && npx wrangler deploy --dry-run`, then `npx wrangler dev` (`docs/WORKER.md`).
