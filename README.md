# aaronorelup.com

Aaron Orelup's ledger of what he's learning about AI: posts, films, games, courses and the projects behind them.
The homepage is a scroll-driven Three.js tea house, and every other page is the panel that grows out of its cards.

## Stack

- **Astro**, static output. Posts are Markdown in `src/content/posts/`. Behaviour in the browser is plain modules
  and custom elements (`<ao-compare>`, `<ao-slider>` and the rest), no framework.
- **Cloudflare Workers static assets** serve `dist/`.
- **One Worker** (`worker/`, named `blog`) for what needs state or a secret: video and audio from R2 with byte
  ranges, the reads counter and the `/stats` snapshot in D1. A route table in `worker/index.js`, shared helpers in
  `worker/lib/`, one folder per feature; `docs/WORKER.md` is its map.
- **Workers Builds** builds and deploys every push to `main` with `npm run build`. Builds of other branches fail on
  purpose.

`ARCHITECTURE.md` is the map of the code. `CLAUDE.md` has the rules for agents working here.

## Commands

```bash
npm install
npm run dev                      # local server (video and audio come from the live site)
npm run new-post "Title"         # a new post with the next AO-### id
npm run check                    # the post and code checker
npm run build                    # deploy-level checks, then the build into dist/
npm test                         # unit tests
npm run e2e                      # the Playwright behaviour suite
npm run media:push               # new video and audio to R2 (docs/MEDIA.md)
```

Writing a post: `WRITING.md` (how it's written) and `PREVIEWS.md` (its hover card). Every post stays a draft until
Aaron says it can go out.

## Deploying

Push to `main`. A few minutes later this shows the commit and `"branch": "main"`:

```bash
curl -s https://aaronorelup.com/version.json
```

If it shows another branch or an older commit, the deploy went wrong. After a change to the Worker or to media,
`npm run media:verify` checks that every file in R2 is served whole and seekable.

## The Now page

`/now` ("Now + Setup") shows the newest file in `src/content/now/`. Every file stays readable at `/now/<date>/`,
and the page's History lists them all by date. To update it, copy the newest file to
`src/content/now/YYYY-MM-DD.md` (today's date), rewrite it and its one-line `summary`, and push. Leave the old files
as they are: they are the history. A snapshot an agent writes keeps `draft: true` until Aaron OKs it, as a post does.

## Post URLs

Posts live at `/ledger/<slug>/`. They used to live at `/posts/<slug>/`; `public/_redirects` sends the old paths on
for good, because AO-004 and AO-005 were shared under them.
