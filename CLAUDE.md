# aaronorelup.com

Astro static site. Every push to `main` is built by Cloudflare Workers Builds and deployed to aaronorelup.com.
This file is what a session that only has the repo (a cloud session, a fresh clone) needs before it touches
anything. `ARCHITECTURE.md` is the map of the code.

## Base: `origin/main`, and nothing else

- Start every change with `git fetch origin && git checkout -B <your-branch> origin/main`. `master` is a dead
  branch frozen at 2026-08-02. On 2026-10-08 a session that started from it pushed, it was deployed, and the live
  site went back two months. `git log -1 origin/main` should be recent and `src/content/posts/` should hold dozens
  of posts. If not, stop: you are on the wrong base.
- Only `main` deploys. A build of any other branch fails on purpose (`astro.config.mjs`).

## Landing

1. `npm run check && npm run build && npm test`, and the e2e specs your change touches
   (`npm run e2e -- <specs>` against `npm run preview`).
2. `git fetch origin && git rebase origin/main`. Other sessions push to `main` all day (the AO-073 fleet often).
   If the new commits touch only AO-073's paths, push without rebuilding; otherwise build again. On a
   `package-lock.json` conflict take `origin/main`'s and run `npm install` again. Never hand-merge a lockfile.
3. `git push origin HEAD:main`. Rejected: repeat from 2. Never force-push.
4. Within 10 minutes `curl -s https://aaronorelup.com/version.json` must show `"branch": "main"` and your commit or
   a newer one. If it shows another branch or an older commit, the deploy went wrong: say so, don't carry on.
   After a change to the Worker or to media, also `npm run media:verify`.
5. A live check that fails because of your change: push `git revert` of it at once, then report.

## Hard rules

- **AO-073 is not yours.** `src/content/posts/teardown-lab.md`, `public/media/teardown-lab/` and
  `public/labs/teardown/` are a live notebook other sessions write. Never edit, migrate, rewrite or record them.
  Every rule asks `isLive()` / `isLivePath()` (`src/data/exempt.js`) and at most warns about them.
- **The repo is public.** Never commit a key, a token, a private link or a never-publish name. The checker matches
  those names against hashes in `src/data/never-publish.json`; the plain list is in Aaron's private agent kit
  (`skills/blog-post/never-publish.txt`). Keys come from `python3 ~/.claude/bin/getkey.py NAME` inside a script and
  are never printed.
- **Every post waits for Aaron's OK.** Keep `draft: true` until he approves it in his own words (a request that
  already says "publish it" counts). No agent or scheduled job gives the OK.
- **No IP addresses.** Nothing in the Worker reads or keys on a visitor's IP. Never let an unlisted post appear
  in a list, a feed, a card or `/stats`.
- **Keep every behaviour.** The post components (synced videos, players, sliders, calculators, timelines) and the
  homepage overlay are the point of the site. A refactor keeps all of them, checked by `tests/e2e/`.
- **Other repos write some paths:** `public/courses/**`, `src/data/courses/*.json`, `src/data/lore/*.json`. Never
  edit them by hand or move them.
- Video and audio live in R2, not git (`docs/MEDIA.md`).

## Commands

| Command | Does |
|---|---|
| `npm run new-post "Title"` | `src/content/posts/<slug>.md` with the next free `AO-###`. Never pick an id by hand |
| `npm run check [-- <paths>]` | every post and code rule at its full level, in about a second; `-- --strict` fails on warnings too |
| `npm run build` | the deploy-level checks, then `astro build` (the contracts are checked at the end) |
| `npm test`, `npm run e2e` | unit tests, and the contracts and budgets of the last build's `dist/`; the Playwright behaviour suite |
| `npm run media:push`, `media:verify` | send new video and audio to R2; check the live site serves them |
| `npm run never-publish:hash -- <list>` | rehash the private list into `src/data/never-publish.json` |
| `npm run dev`, `npm run preview` | a local server; the built site |

`astro` is pinned to 7.4.1 with the `@astrojs/*` packages that match it. Every later release needs Node 22.23.4, and
agent boxes run 22.22.0 until the agent kit's `bin/install/node.sh` reaches them: a bump past 7.4.1 waits for that,
or every other agent's `npm run build` breaks.

## Docs

| File | Read it before |
|---|---|
| `WRITING.md`, `PREVIEWS.md` | writing or editing any post or its hover card |
| `src/content/CLAUDE.md` | touching anything under `src/content/` |
| `ARCHITECTURE.md` | changing code: the tree, the request and build flow, the checks, the contracts, recipes |
| `docs/MEDIA.md` | adding a video or a song, or touching `worker/media/serve.js` |
| `docs/WORKER.md`, `worker/CLAUDE.md` | touching `worker/` or `wrangler.jsonc`: routes, crons, bindings, secrets, tables, flags |
| `README.md` | the short version for people |
