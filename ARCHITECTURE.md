# How aaronorelup.com is built

The map a fresh agent reads before changing code. It describes the tree **as it is**. A file that a planned task
will add appears only as a row marked `(planned, T#.#)`. Each task updates its own rows when it lands. Writers read
`WRITING.md` and `PREVIEWS.md` instead.

## In one paragraph

An Astro static site. Markdown posts become pages at build time. Cloudflare serves `dist/` as Workers static
assets, and one small Worker (`worker/`) runs only for what needs a secret or state: video and audio from R2, the
reads counter and the `/stats` snapshot in D1. Every push to `main` is built by Workers Builds with
`npm run build` and deployed; any other branch fails its build on purpose (`astro.config.mjs`). There is no
framework in the browser: pages are server-rendered HTML, and behaviour is plain modules and custom elements.

## Where code runs (the folder tells you)

| Folder | Runs as |
|---|---|
| `src/pages/`, `src/layouts/`, `src/components/` | server-rendered markup, at build time |
| `src/scripts/` (and `src/elements/`, planned T1.2) | the browser |
| `src/lib/` | pure functions at build time: no DOM, no fs except `paths.js` |
| `src/data/` | hand-kept data files, one decision each; the generated ones say who writes them |
| `src/content/` | posts, notes and research as Markdown (`src/content/CLAUDE.md`) |
| `scripts/` | Node: build plugins (`build/`), checks (`check/`), media (`media/`), tools (`tools/`) |
| `worker/` | the edge (Cloudflare Worker `blog`) |
| `tests/` | `unit/` (node:test) and `e2e/` (Playwright) |
| `public/` | copied into `dist/` as is. Other people write much of it: never scanned by the checks |

Files under `src/`, `worker/` and `scripts/` stay under 400 lines and open with at most 5 lines of header (what it
does, who reads it, its contract). `npm run check` enforces the ceiling (`scripts/check/code.mjs`), with a
grandfather list that only shrinks (`scripts/check/grandfathered.mjs`).

## A request

1. Cloudflare matches the path against `run_worker_first` in `wrangler.jsonc`: video and audio extensions and
   `/api/*`. Everything else is a static file from `dist/`, served without running code. A miss gets
   `dist/404.html` with a 404.
2. The Worker (`worker/index.js`) routes:
   - `/api/reads` → `worker/reads.js` (D1 `DB`, limiter `READS_LIMIT`). The counter AO-057's demo uses.
   - `/api/stats` → `worker/stats.js` (D1 `DB`, limiter `STATS_LIMIT`). One stored snapshot; 503 until it exists.
   - anything else → `worker/media.js`: R2 `MEDIA` (bucket `aaronorelup-site-media`) first, with byte ranges
     and ETags, then the asset (`ASSETS`) for the media still in git, sized from `/media-sizes.json`.
3. The cron (every minute) runs one small step of the stats gatherer (`stats.js`, `worker/stats-shape.js`).

## A build

`npm run build` = `node scripts/check/index.mjs --deploy && astro build`.

1. **The checker, deploy level** (`scripts/check/`). Only the rules that guard the live site can stop a deploy.
   Everything else is a counted warning, so one agent's slip never blocks the AO-073 fleet or the course
   publishers. See "Checks" below.
2. **Content** (`src/content.config.ts`, `src/schemas/*`): the schemas hold types and caps. v1 posts (no `topic`)
   are lenient until W4; live notebooks (`src/data/exempt.js`) stay lenient for good.
3. **Markdown** goes through `scripts/rehype-post-images.mjs` (every picture gets its width, height and its
   `data-full` copy) and Shiki with both themes as CSS variables.
4. **Integrations** (`astro.config.mjs`), in order: `publicDirConstant` (the `__PUBLIC_DIR__` define),
   `statsPages`, `loreThumbs`, `media` (no file over 25 MiB, no video or audio in `public/` outside
   `STAYS_IN_GIT`), `verifyDist` (the frozen contracts over `dist/`, then the budgets, printed).

### What the build writes, and who reads it

| File | Made by | Read by |
|---|---|---|
| `/ledger/<slug>/`, `/ledger/<slug>/notes/` | `src/pages/ledger/[slug].astro`, `[slug]/notes.astro` | readers, the homepage overlay (it fetches the page and lifts `[data-post-article]`) |
| `/ledger/previews.json` | `src/pages/ledger/previews.json.js` | the hover card (`src/scripts/ledger-preview.js`), `worker/reads.js`, `worker/stats.js` |
| `/stats-pages.txt` | `scripts/build/stats-pages.mjs` | `worker/stats.js`: the only pages `/stats` may name |
| `/version.json` | `src/pages/version.json.js` | the live check after every push |
| `/media-sizes.json` | `src/pages/media-sizes.json.js` | `worker/media.js`, for media still in git |
| `/rss.xml`, `/sitemap.xml` | `src/pages/rss.xml.js`, `sitemap.xml.js` | feed readers, search engines |
| `/courses/i-love-my-evening-television/**/thumbs/` | `scripts/lore-thumbs.mjs` | the lore course's index cards |

## The tree

### Root

| Path | What |
|---|---|
| `CLAUDE.md` | the rules for any agent here: base, landing, hard rules, commands, doc map |
| `README.md` | what the site is and the commands |
| `WRITING.md`, `PREVIEWS.md` | how a post and its hover card are written |
| `docs/MEDIA.md` | video and audio in R2: `media:push`, `media:verify` |
| `docs/COMPONENTS.md`, `docs/WORKER.md` | (planned, T1.2 and T1.3) |
| `astro.config.mjs` | site, integrations, Markdown plugins, the main-only guard |
| `wrangler.jsonc` | the Worker, its bindings, `run_worker_first`, the cron. Its `name` becomes `blog` in T1.3 |
| `.node-version` | 22.23.4, the Node Workers Builds uses |
| `archive/2026-10-29-before-rework/` | every post as it was before the rework (read only) |

### `src/content/` and `src/data/`

| Path | What |
|---|---|
| `src/content.config.ts`, `src/schemas/{post,preview,note,project,research}.ts` | collections and their schemas |
| `src/content/posts/<slug>.md` | one post. The file name is the URL slug. `id` is `AO-###` from `npm run new-post` |
| `src/content/notes/<slug>.md` | the full making-of of a split post (`post`, `title`, `summary`) |
| `src/content/research/` | the research collection (`/research/`) |
| `src/data/taxonomy.js` | `TOPICS`, `PROJECTS`: the only place their names live. `SERIES_TO_PROJECT` until W4 |
| `src/data/picks.js` | `START_HERE` (T2.2 fills it with 5 listed slugs) and `REEL` |
| `src/data/limits.js` | every text cap and target, preview media, icon, project picture and og sizes |
| `src/data/exempt.js` | `LIVE_NOTEBOOKS`, `isLive()`, `isLivePath()`: what no rule may fail or touch |
| `src/data/banned-phrases.js` | the phrases and dead links WRITING.md bans (plain: nothing private) |
| `src/data/never-publish.json` | salted SHA-256 of the private never-publish terms (`npm run never-publish:hash`) |
| `src/data/media-manifest.json` | every file in the R2 bucket, its size and MD5 (`npm run media:push`) |
| `src/data/listed.js`, `preview-budget.js` | one-line re-exports until W4 (`isListed` lives in `src/lib/posts.js`) |
| `src/data/series.js`, `projects.js`, `courses.js` | v1 threads (until T2.1), the projects list (until T2.5), the courses |
| `src/data/courses/*.json`, `src/data/lore/*.json` | written by the course publishers in other repos: never by hand |

### `src/lib/`, `src/pages/`, `src/layouts/`, `src/components/`

| Path | What |
|---|---|
| `src/lib/content.js` | the only importer of `astro:content`: `allPosts`, `listedPosts`, `renderEntry`, `notesBySlug`, `slugOf` |
| `src/lib/{posts,cards,icons,dates,paths}.js` | listing and order, the card shape, icons by id, UTC dates, `PUBLIC_DIR` |
| `src/lib/lore*.js` | the lore course's data and drawings |
| `src/pages/index.astro` + `src/layouts/Home.astro` | the homepage: the tea house scene and its overlay |
| `src/pages/{ledger,projects,about,courses,stats,404}.astro`, `ledger/[slug].astro` | the panel pages |
| `src/pages/courses/**`, `src/pages/research/**` | the course and research pages |
| `src/layouts/PanelPage.astro` | head, mode script and chrome for every panel page |
| `src/components/panel/*View.astro`, `PanelChrome.astro` | each panel view, shared by its page and the homepage overlay (split into feature folders by T1.4, T2.2, T2.5, T3.1) |
| `src/components/lore/`, `courses/LessonList.astro`, `Coin.astro` | the lore course, the lesson list, the avatar coin |

### `src/scripts/` and `src/styles/` (the browser)

| Path | What |
|---|---|
| `src/scripts/post-components.js` + `src/styles/post-components.css` | every `<ao-*>` post component, the player, the now-playing bar and the image viewer (split into `src/elements/` by T1.2) |
| `src/scripts/demos/{synthid,cf}.js` + `src/styles/demos/` | the two `<ao-demo>` demos |
| `src/scripts/ledger-preview.js` + `.css` | the hover card (split into `scripts/cards/` by T2.2) |
| `src/scripts/home-scene.js` | the homepage scene and overlay (split into `scripts/home/` by T3.1 and T3.2) |
| `src/scripts/stats/**`, `src/styles/stats/**` | the `/stats` page: its own code, kept as is |
| `src/styles/panel.css` | the panel look and the `--pc-*` tokens (into `tokens.css` and `site.css` by T1.4) |
| `src/styles/lore.css`, `courses.css` | the course looks |

### `scripts/` (Node)

| Path | What |
|---|---|
| `scripts/check/` | the checker: `index.mjs` (CLI), `run.mjs` (levels), `repo.mjs`, `text.mjs`, one file per rule, `grandfathered.mjs` |
| `scripts/build/verify-dist.mjs` | at `astro:build:done`: `contracts.mjs` over `dist/`, then the budgets |
| `scripts/build/contracts.mjs` | pure checks of the frozen contracts over `dist/` |
| `scripts/build/stats-pages.mjs`, `dev-stats-fixture.mjs` | `/stats-pages.txt`; `/api/stats` for `astro dev` |
| `scripts/rehype-post-images.mjs`, `lore-thumbs.mjs` | the picture plugin, the lore thumbnails (move to `build/` in T1.1 and W4) |
| `scripts/media/` | `files.mjs` (what is media, `STAYS_IN_GIT`), `push.mjs`, `verify.mjs`, `integration.mjs` (the guard) |
| `scripts/tools/new-post.mjs` | `npm run new-post`: the next `AO-###`, the v2 frontmatter |
| `scripts/tools/never-publish-hash.mjs` | `npm run never-publish:hash`: the private list → `never-publish.json` |
| `scripts/tools/budgets.mjs` | the page-weight budgets (section "Budgets") |
| `scripts/tools/element-usage.mjs`, `dist-diff.mjs` | every `<ao-*>`, video and iframe per built page (`--diff` for rewrites); two builds compared |
| `scripts/preview-media.mjs` | a post's card still and loop (`PREVIEWS.md`) |
| `scripts/clawd-growth-montage/`, `scripts/presentations/` | one-off generators for two posts (W4 deletes them) |

### `worker/` and `tests/`

| Path | What |
|---|---|
| `worker/index.js` | the routes above, and the cron |
| `worker/media.js`, `reads.js` + `reads.sql`, `stats.js` + `stats-shape.js` + `stats.sql` | the three jobs (moved into feature folders with `worker/lib/` by T1.3) |
| `tests/unit/` | `live.test.mjs` (AO-073 through every rule), `live-checker.test.mjs`, `never-publish.test.mjs` |
| `tests/e2e/` | the behaviour suite: `INVENTORY.md`, `targets.json` (from `element-usage`), specs, fixtures |
| `tests/baseline/urls.txt` | every page and contract file a build must still produce |
| `src/scripts/stats/core/{agg,fmt}.test.mjs` | the two kept `/stats` tests |

## Checks

Two levels, so the deploy build guards only the live site. `npm run check` runs every rule at its full level in
about a second; run it before every landing, and with paths to see one post (`npm run check -- <file>`).

| Rule | Checks | Fails |
|---|---|---|
| `frontmatter.mjs` | YAML parses; a notes file's `post` is its own name and a built post; `START_HERE` empty or 5 unique listed slugs; v1 title and summary over the caps (warning) | deploy |
| `prose.mjs` | on what a reader reads: no em dash, no spaced en dash, no `;`, no banned phrase, takeaway at most 2 sentences. Targets, nested parentheses and `style=` only warn (the caps are the schema's) | check (v2 posts), warning (v1 until W4) |
| `never-publish.mjs` | whole words (case-sensitive), runs of 2 or 3, hosts and URL prefixes, hashed and compared; reports the words with `file:line` | deploy |
| `links.mjs` | `/ledger/<slug>/` goes to a listed post, `/notes/` to its notes; nothing under `public/ledger/`; no banned link | deploy |
| `elements.mjs` | each `src/elements/ao-*/` has its section in `docs/COMPONENTS.md` | check |
| `assets.mjs` | preview stills and loops exist and are under their caps, icon and project picture caps, every named video or audio is in R2 or in a `STAYS_IN_GIT` folder | deploy |
| `code.mjs` | 400 lines, no CSS imported by browser JS, no `style=` in components, layouts or pages, `astro:content` only in `lib/content.js` and the schemas, no IP under `worker/` | check |

Anything in a live notebook's paths is at most a warning, at either level. The never-publish terms themselves live in
the private agent kit (`skills/blog-post/never-publish.txt`); the repo holds only their hashes. Hashing hides the
names from a reader of the repo, not from someone set on guessing them.

**Budgets** (`scripts/tools/budgets.mjs`, gzipped, without fonts and media): a post page minus its prose ≤ 20 KB
(chrome HTML 4, CSS 15, JS up front 8), the ledger's chrome ≤ 6 KB and ≤ 220 B a row, the homepage before the
scene chunk ≤ 30 KB (HTML 12, entry JS 12). Printed by every build, never failing it. From W4 `npm test` fails at
20% over. On 2026-11-01 the worst post page was 53.4 KB and the homepage 71.7 KB.

## Contracts (frozen)

Other code, other repos and the live Worker key on these. Behind them, files move freely.

| Contract | Checked by |
|---|---|
| `/ledger/<slug>/` for every post, `public/_redirects`, RSS guid = `https://aaronorelup.com/ledger/<slug>/` | `verify-dist` against `tests/baseline/urls.txt` |
| the `<ao-*>` tag names and attributes (72 posts use them) | the e2e suite; from T1.1 an unknown tag fails the build |
| `/ledger/previews.json` = `{ posts: { slug: card } }`, keys = listed slugs | `verify-dist` |
| `/stats-pages.txt`: no unlisted slug, nothing deeper than `/ledger/<slug>/` except `/ledger/<listed>/notes/` | `verify-dist`, `agg.test.mjs` |
| `/version.json` and the main-only guard in `astro.config.mjs` | unchanged |
| what the course publishers write: `public/courses/**`, `src/data/courses/*.json`, `src/data/lore/*.json` | never moved |
| the overlay: `data-panel-view`, `data-panel-host`, `data-post-article`, `data-ledger-entry`, `data-close-reader`, `data-panel-home`, `data-no-fly`, the `ao-stop` event | `tests/e2e/` |
| AO-073's paths (`LIVE_NOTEBOOKS`) are never edited, and nothing about them fails a build | `exempt.js` read by every rule, `tests/unit/live*.test.mjs` |

## Data flows

- **A post.** `src/content/posts/<slug>.md` → schema → Markdown with the picture plugin → `PostView.astro` inside
  `PanelPage` at `/ledger/<slug>/`. The page loads `post-components.js`, which defines every `<ao-*>`. On the
  homepage the overlay fetches that page, copies `[data-post-article]` in and imports the same module, so the
  tags upgrade the same way. Notes pages render the same chrome with the note's content.
- **The hover card.** `previews.json` is built from listed posts' `preview:` (or their opening lines). On a device
  that can hover, `ledger-preview.js` fetches it once when idle and opens a card on any `/ledger/<slug>/` link.
- **Media.** Video and audio are uploaded by `npm run media:push` and listed in `media-manifest.json`; the Worker
  serves them from R2 at their normal URLs. Pictures and captions stay in `public/` (`docs/MEDIA.md`).
- **`/stats`.** The cron gathers Cloudflare analytics into D1 one step a minute (token: the `CF_ANALYTICS_TOKEN`
  secret); `/api/stats` serves the stored snapshot, naming only pages in `/stats-pages.txt`. Nothing is keyed on a
  visitor's IP address.
- **The lore course.** Every page under `/courses/i-love-my-evening-television/` is drawn from
  `src/data/lore/lore.json` and its pictures, which `lore.py publish` in the series repo writes. Change the series
  repo and publish again, never the files here.

## Recipes

- **A post component.** Today: a class in `src/scripts/post-components.js` with its CSS in
  `post-components.css`, and its markup in the file's header. From T1.2: a folder `src/elements/ao-<name>/` with
  `element.js` and `style.css`, and a `## <ao-<name>>` section in `docs/COMPONENTS.md` (`npm run check` asks for
  it). Add its behaviours to `tests/e2e/INVENTORY.md` with a spec.
- **A page type.** A file in `src/pages/` inside `PanelPage`, its view in `src/components/`, classes only (no
  `style=`). If the homepage overlay should open it, give its wrapper `data-panel-view="<name>"`. It goes into
  `stats-pages.txt` automatically if it is a public page.
- **A content kind.** A collection in `src/content.config.ts` with a schema in `src/schemas/`, read only through
  `src/lib/content.js`, and its files added to the checker's scopes (`never-publish.mjs`, `links.mjs`).
- **A Worker route.** A path in `worker/index.js`, its module beside it, the path in `run_worker_first` if it
  isn't under `/api/`. Errors are status codes; nothing reads a visitor's IP; every paid call has a cap, a timeout,
  no retry and a switch.
- **A cron job.** `scheduled()` in `worker/index.js` runs one bounded step per minute; give a new job its own step
  and keep each run small.
