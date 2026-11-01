# How aaronorelup.com is built

The map a fresh agent reads before changing code. It describes the tree **as it is**. A file that a planned task
will add appears only as a row marked `(planned, T#.#)`. Each task updates its own rows when it lands. Writers read
`WRITING.md` and `PREVIEWS.md` instead.

## In one paragraph

An Astro static site. Markdown posts become pages at build time. Cloudflare serves `dist/` as Workers static
assets, and one small Worker (`worker/`) runs only for what needs a secret or state: video and audio from R2, the
reads counter and the `/stats` snapshot in D1, the meaning half of search and Ask Goobie (Workers AI, Vectorize,
DeepSeek; read-aloud is a stub until T2.4). Every push to
`main` is built by Workers Builds with `npm run build` and deployed; any other branch fails its build on purpose
(`astro.config.mjs`). There is no framework in the browser: pages are server-rendered HTML, and behaviour is plain
modules and custom elements.

## Where code runs (the folder tells you)

| Folder | Runs as |
|---|---|
| `src/pages/`, `src/layouts/`, `src/components/` | server-rendered markup, at build time |
| `src/scripts/`, `src/elements/` | the browser |
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

1. Cloudflare matches the path against `run_worker_first` in `wrangler.jsonc`: video, audio and HLS extensions,
   `/read/*` and `/api/*`. Everything else is a static file from `dist/`, served without running code. A miss gets
   `dist/404.html` with a 404.
2. The Worker (`worker/index.js`, map and answers in `docs/WORKER.md`) looks the path up in `ROUTES`:
   - `/api/reads` → `worker/reads/serve.js` (D1 `DB`, limiter `READS_LIMIT` keyed on the post). The counter
     AO-057's demo uses.
   - `/api/stats` → `worker/stats/index.js` (D1 `DB`, limiter `STATS_LIMIT`). One stored snapshot; 503 until it
     exists.
   - `/api/session` → `worker/session/serve.js`: whether Ask is on; a Turnstile solve becomes a 30-minute Ask token.
   - `/api/search` → `worker/search/serve.js` (`AI`, `SEARCH_INDEX`, limiters `SEARCH_ALL` and `SEARCH_Q`, the Cache
     API, D1): no token; the nearest chunks of the query.
   - `/api/ask` → `worker/ask/serve.js` (the same retrieval, limiters `ASK_LIMIT` keyed on the session and
     `ASK_ALL`, D1's answer cache, one DeepSeek call at most). Any other `/api/` path is 404, a wrong method 405.
   - anything else → `worker/media/serve.js`: R2 `MEDIA` (bucket `aaronorelup-site-media`) first, with byte ranges
     and ETags, then the asset (`ASSETS`) for the media still in git, sized from `/media-sizes.json`. A
     `/read/<slug>/<hash>.json` not recorded yet is `200 { ready: false }`.
3. The crons (`CRONS` in `worker/index.js`): every minute one small step of the stats gatherer
   (`worker/stats/index.js`, its pure half `worker/stats/shape.js`), of the search index sync
   (`worker/search/sync.js`) and of the daily sweep (`worker/cleanup.js`, at 03:07 UTC); every ten minutes one
   read-aloud step (a stub until T2.4).

## A build

`npm run build` = `node scripts/check/index.mjs --deploy && astro build`.

1. **The checker, deploy level** (`scripts/check/`). Only the rules that guard the live site can stop a deploy.
   Everything else is a counted warning, so one agent's slip never blocks the AO-073 fleet or the course
   publishers. See "Checks" below.
2. **Content** (`src/content.config.ts`, `src/schemas/*`): the schemas hold types and caps. v1 posts (no `topic`)
   are lenient until W4; live notebooks (`src/data/exempt.js`) stay lenient for good.
3. **Markdown** (posts, notes, research) goes through Shiki with both themes as CSS variables, then the rehype
   plugins in `scripts/build/markdown.mjs`, in order: `rehype-post-images` (raw HTML parsed; every picture gets its
   width, height and its `data-full` copy), `rehype-heading-ids` (github-slugger ids, pinned; an id the page uses
   gets `-1`) and `rehype-post-text`, the one extraction every feature reads (below). A Markdown file that fails to
   render fails its page (`renderEntry`), since Astro itself only logs it; a live notebook's page builds blank.
4. **Integrations** (`astro.config.mjs`), in order: `statsPages`, `loreThumbs`, `media` (no file over 25 MiB,
   no video or audio in `public/` outside `STAYS_IN_GIT`), `pagefind` (the words index of the listed posts and
   notes, `dist/pagefind/`; lenient until a main build has written it), `verifyDist` (the frozen contracts over
   `dist/`, then the budgets, printed). The config also defines `__PUBLIC_DIR__` (read by `src/lib/paths.js`) and, for
   `astro dev` only, the `/api/stats` fixture.

### What the build writes, and who reads it

| File | Made by | Read by |
|---|---|---|
| `/ledger/<slug>/`, `/ledger/<slug>/notes/` | `src/pages/ledger/[slug].astro`, `[slug]/notes.astro` | readers, the homepage overlay (it fetches the page and lifts `[data-post-article]`) |
| `/ledger/previews.json` | `src/pages/ledger/previews.json.js` | `src/scripts/cards/data.js` (the hover card, search results, Goobie's related posts), `worker/reads/serve.js`, `worker/stats/index.js` |
| `/pagefind/` | `scripts/build/pagefind.mjs` (Pagefind's Node API over `dist/ledger/**/*.html`) | `src/scripts/search/keyword.js`: only what carries `data-pagefind-body` (a listed post's or notes page's text) is in it |
| `/stats-pages.txt` | `scripts/build/stats-pages.mjs` | `worker/stats/index.js`: the only pages `/stats` may name |
| `/version.json` | `src/pages/version.json.js` | the live check after every push |
| `/media-sizes.json` | `src/pages/media-sizes.json.js` | `worker/media/serve.js`, for media still in git |
| `/rss.xml`, `/sitemap.xml` | `src/pages/rss.xml.js`, `sitemap.xml.js` | feed readers, search engines |
| `/courses/i-love-my-evening-television/**/thumbs/` | `scripts/lore-thumbs.mjs` | the lore course's index cards |
| `/search/manifest.json`, `/search/docs/<kind>-<slug>.json` | `src/pages/search/`, from `src/lib/search/` | `worker/search/sync.js`, which embeds the docs whose hash moved |

### The extraction: `text`

`rehype-post-text` walks each rendered post, note and research page once. A page reads the result as
`(await renderEntry(entry)).remarkPluginFrontmatter.text`; nothing re-parses Markdown with regexes.

```ts
type Text = {
  words: number;                                  // the main read: what read.blocks hold
  headings: { depth: 2 | 3; id: string; text: string }[];
  sections: { anchor: string; heading: string; text: string; folded: boolean }[];
    // the opening (anchor '') then one per h2; blocks joined by "\n\n"; <details> text kept, and the section folded
  read: { blocks: ['h' | 'p' | 'li' | 'q', string][] };   // block i is the element stamped data-r="i"
  elements: string[];                             // the post components used: ['ao-compare', 'ao-demo/synthid']
  links: string[];                                // same-site hrefs of <a>, as written
};
```

What is read is `src/lib/text/rules.js`, which the browser uses too: `p`, `li` (its own text), `h2`-`h4`,
`blockquote > p`, `dt`, `dd`; never `pre`, `table`, `figure`, media, `<details>`, `sup`, `<ao-*>`, `.ao-meta`,
`[aria-hidden]`, `[data-noread]`, inline code that isn't a plain word (stamped `data-noread`), or a list whose items
are mostly numbers. Every `<ao-*>` is stamped `data-pagefind-ignore`. A tag not in `TAGS` fails the build, or only
warns in a live notebook.

## The tree

### Root

| Path | What |
|---|---|
| `CLAUDE.md` | the rules for any agent here: base, landing, hard rules, commands, doc map |
| `README.md` | what the site is and the commands |
| `WRITING.md`, `PREVIEWS.md` | how a post and its hover card are written |
| `docs/MEDIA.md` | video and audio in R2: `media:push`, `media:verify` |
| `docs/WORKER.md`, `worker/CLAUDE.md` | the Worker: routes and their answers, crons, bindings, secrets, tables, flags; its rules |
| `docs/COMPONENTS.md` | (planned, T1.2) |
| `astro.config.mjs` | site, integrations, Markdown plugins, the main-only guard |
| `wrangler.jsonc` | the Worker `blog`, every binding, `run_worker_first`, both crons, the vars (secrets by name only) |
| `.dev.vars.example` | the local test keys for `wrangler dev` (copy to the git-ignored `.dev.vars`) |
| `.node-version` | 22.23.4, the Node Workers Builds uses |
| `public/_headers` | noindex for two hidden pages; a year, `immutable`, for the content-hashed `/_astro/*` and `/fonts/*`; a day for `/media/icons/*` |
| `archive/2026-10-29-before-rework/` | every post as it was before the rework (read only) |

### `src/content/` and `src/data/`

| Path | What |
|---|---|
| `src/content.config.ts`, `src/schemas/{post,preview,note,project,research}.ts` | collections and their schemas |
| `src/content/posts/<slug>.md` | one post. The file name is the URL slug. `id` is `AO-###` from `npm run new-post` |
| `src/content/notes/<slug>.md` | the full making-of of a split post (`post`, `title`, `summary`) |
| `src/content/research/` | the research collection (`/research/`) |
| `src/content/projects/<name>.yaml` | one card of `/projects` (`src/schemas/project.ts`): section, state, needs, picture, links, posts; private cards link only to this site |
| `src/data/taxonomy.js` | `TOPICS`, `PROJECTS`: the only place their names live. `SERIES_TO_PROJECT` until W4 |
| `src/data/picks.js` | `START_HERE` (the ledger's five Start here posts) and `REEL` |
| `src/data/limits.js` | every text cap and target, preview media, icon, project picture and og sizes |
| `src/data/exempt.js` | `LIVE_NOTEBOOKS`, `isLive()`, `isLivePath()`: what no rule may fail or touch |
| `src/data/site.js` | `NAV` (key, href, label, overlay) and `SOCIAL`: the chrome's links; a NAV key is also a view's name |
| `src/data/fonts.json` | written by `scripts/tools/fonts.mjs`: the font preload, each self-hosted face's range, the code points no family has |
| `src/data/banned-phrases.js` | the phrases and dead links WRITING.md bans (plain: nothing private) |
| `src/data/never-publish.json` | salted SHA-256 of the private never-publish terms (`npm run never-publish:hash`) |
| `src/data/public-keys.js` | keys meant to be public: Ask's Turnstile site key |
| `src/data/media-manifest.json` | every file in the R2 bucket, its size and MD5 (`npm run media:push`) |
| `src/data/listed.js`, `preview-budget.js` | one-line re-exports until W4 (`isListed` lives in `src/lib/posts.js`) |
| `src/data/series.js`, `courses.js` | v1 threads (until T2.1), the courses |
| `src/data/courses/*.json`, `src/data/lore/*.json` | written by the course publishers in other repos: never by hand |

### `src/lib/`, `src/pages/`, `src/layouts/`, `src/components/`

| Path | What |
|---|---|
| `src/lib/content.js` | the only importer of `astro:content`: `allPosts`, `listedPosts`, `notesBySlug`, `research`, `projects`, `renderEntry`, `slugOf` |
| `src/lib/{posts,cards,icons,dates,paths}.js` | listing and order, the card shape, icons by id, UTC dates, `PUBLIC_DIR` |
| `src/lib/glyphs.js` | the line drawings: a topic's glyph (where a post has no icon) and the search lens; Astro and the browser read it |
| `src/lib/text/rules.js`, `hash.js` | what a reader reads (shared with the browser's read-aloud), content hashes |
| `src/lib/text/plain.js` | a post's Markdown as plain words, and its reading minutes (the card's and the ledger row's) |
| `src/lib/build.js` | `COMMIT`, the commit a build is made from (the `ao-build` meta) |
| `src/lib/search/chunks.js`, `docs.js` | a listed post or its notes → search chunks (the short version, then each h2 section, at most 1,500 characters) and the manifest; `docs.js` reads the build's posts once |
| `src/lib/lore*.js` | the lore course's data and drawings |
| `src/lib/projects.js` | the projects page's data: `SECTIONS`, order, state chips, needs glyphs, pictures or icons, `DERIVED` (the course's live lesson count); a card linking an unlisted post fails the build |
| `src/pages/index.astro` + `src/layouts/Home.astro` | the homepage: the tea house scene and its overlay |
| `src/pages/{ledger,projects,about,courses,stats,404}.astro`, `ledger/[slug].astro` | the panel pages |
| `src/pages/courses/**`, `src/pages/research/**` | the course and research pages |
| `src/pages/search/` | `manifest.json.js`, `docs/[doc].json.js`: search's build files |
| `src/layouts/PanelPage.astro` | every panel page: `site.css`, `chrome/Head`, `ModeToggle`, `PanelChrome` (`active` lights the nav, `view` names the view) |
| `src/components/chrome/` | `Head` (share tags, `ao-build` meta, font preload, the pre-paint mode script; both layouts), `PanelChrome` (header, nav, scroller, footer; `data-active-view`, and `data-panel-view` on a standalone page's view wrapper), `ModeToggle`, `Glyph` |
| `src/components/ledger/` | `LedgerView` (`/ledger/`), `SearchBox` (the box and its Search \| Ask Goobie switch), `StartHere`, `Chips` (topic and project counts, real links `?topic=`), `LedgerRow` (icon or glyph, title link with `data-ledger-entry`, summary, meta, the stamp's `<details>` short version) |
| `src/components/{about,courses,research}/` | `AboutView`; `CoursesView`, `LessonList`, `Coin`; `ResearchView` |
| `src/components/projects/` | `ProjectsView` (`/projects`), `JumpRow`, `Highlights` (the reel from `picks.js REEL` and the cards marked `highlight`), `ProjectSection`, `ProjectCard`, `NeedsGlyph` |
| `src/components/panel/*View.astro` | the post view (into `post/` by T2.1); `PanelChrome`, `AboutView`, `CoursesView`, `ProjectsView` and `LedgerView` are stubs for `index.astro` until T3.1 (`LedgerView`'s also mounts `views/ledger.js` in the overlay) |
| `src/components/lore/` | the lore course |

### `src/scripts/` and `src/styles/` (the browser)

| Path | What |
|---|---|
| `src/scripts/post-components.js` | a shim, `export { enhance }` from `src/elements/enhance.js`, for `home-scene.js` until T3.1 (deleted by T3.2) |
| `src/elements/` | the post components (`src/elements/CLAUDE.md`), one folder per tag (`ao-x/element.js`, `ao-x/style.css`): `enhance.js` (viewer hook, frames, `upgrade`), `registry.js` (a tag's `element.js` loads when a post has it), `_core/` (one player at a time, the now-playing bar, the viewer hook; the viewer and its zoom load on the first open), `_lib/` (times, tables, `h()`) |
| `src/scripts/lazy.js` | `lazy(load, fallbackUrl)`: every dynamic import; a lost chunk (a deploy since the page loaded) navigates to `fallbackUrl` or reloads once |
| `src/styles/elements.css` | the viewer, the now-playing bar, `.visually-hidden`: linked from `PostView`, the notes page and `index.astro` (into `site.css` by T3.2); an element's own CSS is inlined into its articles by `components/post/ElementStyles.astro` |
| `src/elements/ao-demo/demos/<name>/` | the two `<ao-demo>` demos, `synthid` (AO-040: `model.js` the watermark maths, `ui.js`, a file per part, `index.js` mounts) and `cf` (AO-057), each an `index.js` exporting `mount(host, part)` and a `style.css` |
| `src/scripts/cards/` + `src/styles/cards.css` | the hover card: `data.js` (`previews.json`, fetched once and shared), `render.js` (the element and where it goes; the icon when a card has no still), `hover.js` (when: listeners, timings, media). `ledger-preview.js` is a one-line stub that `stats.astro`, `PostView`, `notes.astro` and `views/projects.js` import until W4 |
| `src/scripts/ledger/` | `filter.js` (the chips: one topic or project, `?topic=` read on load and kept with `replaceState`), `feed.js` (`bindFeedCopy`) |
| `src/scripts/search/` + `src/styles/search.css` | `box.js` (the box, `/`, the switch), `keyword.js` (Pagefind, on first focus), `semantic.js` (`/api/search`, 400 ms after typing, at most 40 a page), `merge.js` (reciprocal rank), `results.js` (rows and deep links `?hl=&hs=#heading`), `terms.js`, `ask.js` (Ask Goobie: `/api/session`, Turnstile only when Ask is on, the session in `sessionStorage`, `/api/ask`) |
| `src/scripts/post/highlight.js` | marks a deep link's sentence (or words) in its section, opens its `<details>`, centres it in `#panel-scroll`; the post and notes pages call it (T2.1 moves the call into `views/post.js`) |
| `src/scripts/home-scene.js` | the homepage scene and overlay (split into `scripts/home/` by T3.1 and T3.2) |
| `src/scripts/stats/**`, `src/styles/stats/**` | the `/stats` page: its own code, kept as is |
| `src/scripts/mode.js` | the panel pages' day/night toggle: `data-mode`, the stored choice, `aria-pressed` |
| `src/scripts/views/projects.js` | the projects view's module (`mount(root)` → unmount): the hover card on its post links |
| `src/scripts/views/ledger.js` | the ledger view's module: chips, search box, feed copy, hover card |
| `src/styles/tokens.css` | every colour as a day/night pair, the `--pc-*` and `--home-*` tokens per mode (plain strings: the `/stats` canvas parses them), the homepage tween (`:root[data-tweening]` mixes by `--mix`), fonts, type scale, space, radii, z |
| `src/styles/site.css` | the one stylesheet of every panel page: tokens, base, chrome, prose, cards, ledger, search, projects, about, research (later tasks add theirs) |
| `src/styles/{base,chrome,prose,about,research}.css` | page-wide rules; the frame, the view header, shared hover states; long-form text (`.pc-prose`); the text pages (`.page-*`: About, 404); a research document |
| `src/styles/projects.css` | the projects page (`.proj-*`), on `--pc-*` tokens only so the overlay's tween carries it |
| `src/styles/ledger.css` | the ledger (`.row-*`, `.chip*`, `.start-*`, `.month`, `.ledger-feed*`), on `--pc-*` tokens only |
| `src/styles/fonts.css`, `public/fonts/` | written by `scripts/tools/fonts.mjs`: Google's own woff2 slices, self-hosted under content-hashed names |
| `src/styles/panel.css` | an `@import` stub (tokens, chrome, prose, cards, ledger, search, projects, about) for `index.astro` until T3.2 |
| `src/styles/lore.css`, `courses.css` | the course looks |

### `scripts/` (Node)

| Path | What |
|---|---|
| `scripts/check/` | the checker: `index.mjs` (CLI), `run.mjs` (levels), `repo.mjs`, `text.mjs`, one file per rule, `grandfathered.mjs` |
| `scripts/build/verify-dist.mjs` | at `astro:build:done`: `contracts.mjs` over `dist/`, then the budgets |
| `scripts/build/contracts.mjs` | pure checks of the frozen contracts over `dist/` |
| `scripts/build/stats-pages.mjs`, `dev-stats-fixture.mjs` | `/stats-pages.txt`; `/api/stats` for `astro dev` |
| `scripts/build/pagefind.mjs` | at `astro:build:done`: Pagefind's index of `dist/ledger/**/*.html` into `dist/pagefind/`; a failure fails the build |
| `scripts/build/markdown.mjs` + `rehype-{post-images,heading-ids,post-text}.mjs` | the Markdown plugins (step 3 of "A build"); `markdown.mjs` lists the post components until T1.2 and hashes the plugins' code into the config, so Astro's content cache re-renders when they change |
| `scripts/lore-thumbs.mjs` | the lore thumbnails (moves to `build/` in W4) |
| `scripts/media/` | `files.mjs` (what is media, `STAYS_IN_GIT`), `push.mjs`, `verify.mjs`, `integration.mjs` (the guard) |
| `scripts/tools/new-post.mjs` | `npm run new-post`: the next `AO-###`, the v2 frontmatter |
| `scripts/tools/never-publish-hash.mjs` | `npm run never-publish:hash`: the private list → `never-publish.json` |
| `scripts/tools/budgets.mjs` | the page-weight budgets (section "Budgets") and the font check |
| `scripts/tools/fonts.mjs` | `node scripts/tools/fonts.mjs` after a build: fetches Google's slices for the code points the pages show, rewrites `public/fonts/`, `fonts.css`, `fonts.json`; `misses(dist)` |
| `scripts/tools/searches.mjs` | `npm run searches [-- days]`: the top search and Ask queries, for Aaron only (D1 through the API) |
| `scripts/tools/element-usage.mjs`, `dist-diff.mjs` | every `<ao-*>`, video and iframe per built page (`--diff` for rewrites); two builds compared |
| `scripts/lib/{secrets,cfapi}.mjs`, `scripts/tools/put-secret.mjs` | `secret(NAME)` from the environment or Infisical; the Cloudflare API client that finds or makes the Worker's resources; `put-secret` sets one Worker secret, never printing it |
| `scripts/tools/preview-media.mjs` | every resize-to-a-cap job: a post's card still and loop (`PREVIEWS.md`), and with `--out --size --cap` one still (post icons, project pictures; `docs/MEDIA.md`) |
| `scripts/clawd-growth-montage/`, `scripts/presentations/` | one-off generators for two posts (W4 deletes them) |

### `worker/` and `tests/`

| Path | What |
|---|---|
| `worker/index.js` | `ROUTES` and `CRONS`: the routes and jobs above |
| `worker/lib/` | `http.js` (json, status, sameOrigin, readJson), `sql.js` (ensure), `flags.js` + `flags.sql` (switches, daily caps), `memo.js` (a read shared for 30 s), `session.js` (Ask tokens), `text.js` (normalize, scrub, sha256), `build-files.js` |
| `worker/media/serve.js` | video, audio, HLS and `/read/*`: R2 first, then the asset, with byte ranges |
| `worker/reads/` | `serve.js` + `reads.sql`: the reader counter |
| `worker/stats/` | `index.js` (serve and `runStep`), `shape.js` (pure), `stats.sql`: the traffic snapshot |
| `worker/session/serve.js` | `GET`, `POST /api/session` |
| `worker/search/` | `serve.js` (`GET /api/search`), `retrieve.js` (embed and query, shared with Ask), `sync.js` (the index cron), `counts.js` (anonymous counts), `search.sql` |
| `worker/ask/` | `serve.js` (`POST /api/ask`), `prompt.js` (Goobie, the excerpts, citations), `deepseek.js` (the one call), `ask.sql` |
| `worker/cleanup.js` | the daily sweep of old counts, answers and totals |
| `worker/read/` | a stub until T2.4 |
| `tests/unit/` | `live.test.mjs` (AO-073 through every rule), `live-checker.test.mjs`, `never-publish.test.mjs`, `session.test.mjs` (Ask tokens), `media.test.mjs` (byte ranges without a sizes list), `text.test.mjs` (the extraction on five archived posts), `chunks.test.mjs` (search chunks), `sync.test.mjs` (the index sync), `citations.test.mjs` (Ask's guards, citations and DeepSeek answers); `worker-env.mjs` loads a Worker module with its `.sql` and gives an in-memory D1 |
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
scene chunk ≤ 30 KB (HTML 12, entry JS 12). Printed by every build, never failing it. A display code point the
self-hosted fonts miss is a warning in the build and a failure of `node scripts/tools/budgets.mjs` and of
`tests/unit/fonts.test.mjs`; `node scripts/tools/fonts.mjs` fixes it.
`tests/unit/budgets.test.mjs` (in `npm test`) checks the measuring on a made-up `dist/`; from W4 it fails at 20%
over. On 2026-11-01 the worst post page was 53.4 KB and the homepage 71.7 KB.

## Contracts (frozen)

Other code, other repos and the live Worker key on these. Behind them, files move freely.

| Contract | Checked by |
|---|---|
| `/ledger/<slug>/` for every post, `public/_redirects`, RSS guid = `https://aaronorelup.com/ledger/<slug>/` | `verify-dist` against `tests/baseline/urls.txt` |
| the `<ao-*>` tag names and attributes (72 posts use them) | the e2e suite; an unknown tag fails the build (`rehype-post-text`) |
| `/ledger/previews.json` = `{ posts: { slug: card } }`, keys = listed slugs | `verify-dist` |
| `/stats-pages.txt`: no unlisted slug, nothing deeper than `/ledger/<slug>/` except `/ledger/<listed>/notes/` | `verify-dist`, `agg.test.mjs` |
| `/version.json` and the main-only guard in `astro.config.mjs` | unchanged |
| every page's `<meta name="ao-build" content="<commit>">` (the overlay compares it before mounting a fetched page) | `chrome/Head.astro` |
| what the course publishers write: `public/courses/**`, `src/data/courses/*.json`, `src/data/lore/*.json` | never moved |
| the overlay: `data-panel-view`, `data-panel-host`, `data-post-article`, `data-ledger-entry`, `data-close-reader`, `data-panel-home`, `data-no-fly`, the `ao-stop` event | `tests/e2e/` |
| AO-073's paths (`LIVE_NOTEBOOKS`) are never edited, and nothing about them fails a build | `exempt.js` read by every rule, `tests/unit/live*.test.mjs` |

## Data flows

- **A post.** `src/content/posts/<slug>.md` → schema → Markdown and its plugins → `PostView.astro` inside
  `PanelPage` at `/ledger/<slug>/`. The article carries the CSS of the `<ao-*>` it uses (`ElementStyles`), and the
  page calls `enhance()` (`src/elements/enhance.js`), which imports each of those tags' `src/elements/<tag>/element.js`.
  On the homepage the overlay fetches that page, copies `[data-post-article]` in and calls the same `enhance()` (through
  the `post-components.js` shim until T3.1), so the tags upgrade the same way. Notes pages render the same chrome with the note's content.
- **The hover card.** `previews.json` is built from listed posts' `preview:` (or their opening lines). On a device
  that can hover, `scripts/cards/` fetches it once when idle and opens a card on any `/ledger/<slug>/` link. On a
  phone a ledger row's stamp opens the same short version in place, from the page's own HTML.
- **The ledger.** `LedgerView` renders every listed post under its month, the chips with counts made at build, and
  `START_HERE`. Its search box asks Pagefind in the browser (loaded on first focus) and `/api/search` (no token) and
  merges the two by reciprocal rank; a result links `/ledger/<slug>/?hl=<words>&hs=<passage>#<heading>`, which
  `post/highlight.js` marks. Ask Goobie loads `search/ask.js` only when opened: `GET /api/session` first, and only
  when that says `ask: true`, Turnstile and a 30-minute token; answers are text, `[n]` linked to their passages.
- **Search and Ask.** The build writes each listed post and notes page as chunks (`/search/docs/`) and a manifest
  of their hashes. Every minute `search.sync` embeds the changed docs with `@cf/baai/bge-m3` into the Vectorize
  index `blog-search` (ids `AO-045:3`, `AO-045n:3` for notes). `/api/search` embeds the query and returns the best
  chunks of the best posts; `/api/ask` takes the chunks scoring at least `ask_min_score` (a D1 flag) as numbered
  excerpts for one DeepSeek call, cached in D1 on its exact messages. Switches and caps are D1 `flags` rows
  (`docs/WORKER.md`); the only thing stored about a query is its day, mode, normalised text and a count.
- **Media.** Video and audio are uploaded by `npm run media:push` and listed in `media-manifest.json`; the Worker
  serves them from R2 at their normal URLs. Pictures and captions stay in `public/` (`docs/MEDIA.md`).
- **Icons and project pictures.** `public/media/icons/<AO-###>.webp` (256 px) and `-96.webp`, keyed by post id, and
  `public/media/projects/<name>.webp` (640×360), all made by `scripts/tools/preview-media.mjs --out --size --cap`
  and capped by `assets.mjs`. Pages ask `src/lib/icons.js iconFor(post)`; null (a live notebook, a new post) means
  draw the topic glyph. New icons come from the agent kit's icon recipe (`docs/MEDIA.md`).
- **The projects page.** `src/content/projects/*.yaml` → `src/lib/projects.js` → `components/projects/` at
  `/projects`, and in the homepage overlay through `panel/ProjectsView.astro`. Post links open in the overlay's
  reader like every `/ledger/` link.
- **`/stats`.** The cron gathers Cloudflare analytics into D1 one step a minute (token: the `CF_ANALYTICS_TOKEN`
  secret); `/api/stats` serves the stored snapshot, naming only pages in `/stats-pages.txt`. Nothing is keyed on a
  visitor's IP address.
- **The lore course.** Every page under `/courses/i-love-my-evening-television/` is drawn from
  `src/data/lore/lore.json` and its pictures in `public/courses/i-love-my-evening-television/media/`, which the
  series repo `aaronorelup/i-love-my-evening-television` writes (`python3 Series/lore/tools/lore.py publish --blog
  <this repo>`). Its lessons (`public/courses/i-love-my-evening-television/lessons/`) and their data
  (`src/data/courses/i-love-my-evening-television.json`) come from that repo's `lessons.py`. Change the line in its
  `Series/lore/` and publish again, never the files here.

## Recipes

- **A post component.** A folder `src/elements/ao-<name>/` with `element.js` and `style.css`, its tag in `TAGS`
  in `scripts/build/markdown.mjs` (a post using a tag not there fails the build), and a `## <ao-<name>>` section
  in `docs/COMPONENTS.md` (`npm run check` asks for it). Its CSS is inlined in the article, after the page's
  stylesheets, so a rule as specific as one in `prose.css` (`.pc-prose p`, `li`, `img`: one class, one tag) wins
  over it. Add its behaviours to `tests/e2e/INVENTORY.md` with a spec.
- **A page type.** A file in `src/pages/` inside `PanelPage`, its view in `src/components/`, classes only (no
  `style=`), colours and type from `tokens.css`. If the homepage overlay should open it, pass `view="<name>"` to
  `PanelPage` (its wrapper gets `data-panel-view`) and add it to `NAV` in `src/data/site.js`. It goes into
  `stats-pages.txt` automatically if it is a public page.
- **A content kind.** A collection in `src/content.config.ts` with a schema in `src/schemas/`, read only through
  `src/lib/content.js`, and its files added to the checker's scopes (`never-publish.mjs`, `links.mjs`).
- **A Worker route.** A line in `ROUTES` (`worker/index.js`), its handler in its feature folder, the path in
  `run_worker_first` if it isn't under `/api/` (`worker/CLAUDE.md`). Errors are status codes; nothing reads a visitor's IP; every paid call has a cap, a timeout,
  no retry and a switch.
- **A cron job.** A named entry in `CRONS` (`worker/index.js`): one bounded step a run, returning a word to log.
