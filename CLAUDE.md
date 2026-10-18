# aaronorelup.com

Astro static site. Every push to `main` is built by Cloudflare Workers Builds and deployed to
aaronorelup.com. The full working notes live outside this repo; this file is what a session
that only has the repo (a cloud session, a fresh clone) needs before it touches anything.

## Before you change anything

- **Work from `main`, and nothing else.** Run `git fetch origin && git checkout -B <your-branch> origin/main`
  first. `master` is a dead branch frozen at 2026-08-02 (AO-003); on 2026-10-08 a session that
  started from it pushed a branch, it was deployed, and the live site went back two months.
- Check you are current: `git log -1 origin/main` should be recent and `src/content/posts/`
  should hold dozens of posts, not three. If it doesn't, stop: you are on the wrong base.
- **Only `main` deploys.** A build of any other branch fails on purpose (`astro.config.mjs`).
  To publish from a branch, rebase it onto `origin/main` and merge it into `main` (fast-forward
  or a PR). Never force-push `main`.
- **After a push, ask the live site what it is running:** `curl -s https://aaronorelup.com/version.json`
  should show `"branch": "main"` and the commit you pushed, a few minutes after the push. If it
  shows another branch or an old commit, the deploy went wrong; say so instead of carrying on.

## Writing a post

```bash
npm install
npm run new-post "Title of the post"
```

That creates `src/content/posts/<slug>.md` with the next free `AO-###` and today's date. Never
pick an `AO-###` by hand. Put pictures under `public/media/<slug>/` as WebP, not multi-MB PNGs.
The full-size originals of anything you generate for a post (renders, clips, songs) are filed in Aaron's studio
library, not here: `studio push blog-posts <folder> --agent <you>` (how to get `studio`, the rules and the closed
lists: `curl -s https://hq.soul-orelup.workers.dev/api/library/rules`). The repo keeps only the web copy.
Every post needs a `preview:` block; `PREVIEWS.md` is the spec. Run `npm run build` before
pushing; it fails on a bad preview or a missing file.

## The stats page (/stats)

A public page of the site's own traffic, one snapshot a day. `src/pages/stats.astro` and
`src/scripts/stats/` draw it from `/api/stats`; `worker/stats.js` serves that from D1 and fills
it with a cron that runs every minute (`wrangler.jsonc`), one small step per run, because the
free plan gives a Worker 10 ms of CPU per run. Its token is the Worker secret
`CF_ANALYTICS_TOKEN`; without it `/api/stats` answers 503 and the page says the numbers aren't
connected. Never add anything keyed on a visitor's IP address, and never let an unlisted post
show there (the build's `/stats-pages.txt` is the list of pages it may name).
