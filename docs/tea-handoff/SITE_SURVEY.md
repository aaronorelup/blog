> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. `/workspace/teahouse_alt/blog` is the build box clone of this repository at `6566f5c`; every other path below is a repository path or a URL on the live site. Counts are as of the survey (2026-11-10).

# aaronorelup.com: survey for the tea-house alternate view

Repo `/workspace/teahouse_alt/blog`, branch `feat/alt-view` = `origin/main` = live (`6566f5c`, live `/version.json`
shows the same commit, branch `main`, 73 posts). Read-only survey; the tracked tree is untouched (`git status` clean).

## 0. Baseline runs (untouched tree, Node v24.22.1)

| Command | Result | Wall time |
|---|---|---|
| `npm ci` | ok (audit warnings; `esbuild`/`sharp` install scripts "not yet covered by allowScripts" warning, harmless) | 4 s |
| `npm run check` | pass: 0 errors, 9 warnings (all in `storm-bell-pop-up.md` (HELD) and `teardown-lab.md` (AO-073)) | 1.3 s |
| `npm run build` | pass: 261 pages, `stats-pages.txt` 337 pages, pagefind 84 pages, contracts hold | 18 s |
| `npm test` | pass: 124/124 (reads the last build's `dist/`: contracts, budgets, fonts) | 5.5 s |
| `npm run e2e` (full) | 648 tests, 4 workers. **desktop (Chromium): ~300 pass**, 7 late `overlay-16..23` failures (see below). **phone (WebKit): every test fails at `browserType.launch`**: host is missing WebKit libs (`libevent-2.1.so.7`, `libgstgl-1.0.so.0`, `libavif.so.16`, `libmanette`, `libenchant-2`...). Run was killed at 639/648 after ~7.5 min when the parent exited | ~8 min for the parallel projects |
| `npx playwright test -c tests/e2e/playwright.config.mjs --project=desktop tests/e2e/overlay.spec.mjs` (rerun) | **30 passed, 1 skipped, 0 failed**: the earlier overlay failures were load or the dying run, not the tree | 4.4 min |

Gotchas:
- Node 24 works for check/build/test (CLAUDE.md talks about Node 22.22/22.23; `.node-version` is 22.23.4 for
  Workers Builds). `astro` is pinned to 7.4.1; do not bump.
- Local builds are not blocked by the main-only guard (`astro.config.mjs:20`, only when `WORKERS_CI` is set). But
  any push of a non-main branch to GitHub makes a Workers Builds build that fails on purpose (harmless, but noisy).
- `npm run e2e` starts its own `astro preview --port <4400+hash(path)> --ignore-lock` (webServer in
  `tests/e2e/playwright.config.mjs`); no manual preview needed. It also rewrites `tests/e2e/targets.json`
  (gitignored, as are `results/` and `report/`). Use `--project=desktop` on this box: WebKit cannot launch.
- `npm test` depends on the last `npm run build`'s `dist/` (contracts, budgets, fonts test). Always build first.
- The overlay failures were `#stop-rail [data-goto]` "hidden" after 20 s (the homepage scene never got ready) at
  the end of the run. They pass when the spec runs alone (rerun above), so treat them as load flakes. A full
  desktop-only run was not completed: about 300 desktop tests had passed when the run was killed. Still unknown: the
  full-suite time with WebKit (phone) working, and the `desktop-timing`/`phone-timing` projects (`@timing` specs,
  run after the parallel ones), which never started. Untested suggestion for this box: `npm run e2e -- --project=desktop`.

## A. Content inventory

Loaders: `src/lib/content.js` is the only importer of `astro:content` (enforced by `scripts/check/code.mjs`).

```js
allPosts()          // all posts incl. drafts, sorted by slug
listedPosts()       // isListed: !draft && !unlisted  -- use this for every list
research(); projects(); nowSnapshots() /* newest first, drafts out */; notesBySlug() /* Map slug->note */
renderEntry(entry)  // = astro:content render -> { Content, remarkPluginFrontmatter: { text } }
textOf(entry)       // the extraction: words, headings, sections, read, full, elements, links
slugOf(entry)       // entry.id = file name = URL slug
```
`src/lib/posts.js`: `isListed(data)`, `ledgerOrder(posts)`, `byMonth(posts) -> [{month, posts}]`,
`countBy(posts, 'topic'|'project')`, `olderNewer(post, posts)`, `related(post, posts, n=3)`.
`src/lib/cards.js cardOf(post)` (hover-card shape), `src/lib/icons.js iconFor(post) -> {s256,s96}|null`,
`src/lib/text/minutes.js` (reading minutes from `text.words`), `src/lib/dates.js shortDate/dayOf/monthOf/isoDay`,
`src/lib/glyphs.js GLYPHS` (topic line drawings), `src/data/taxonomy.js TOPICS, PROJECTS`,
`src/data/picks.js START_HERE (5 slugs), REEL`, `src/data/site.js NAV, SOCIAL`.

**Listed / unlisted / draft** (`src/lib/posts.js:8`): `draft: true` = not built at all (dev only); `unlisted: true`
= built at `/ledger/<slug>/` with `noindex`, no og card, no short version, and in **no** list, feed, card, search,
Ask, read-aloud, sitemap or `/stats`. Counts now: 77 files = **73 listed** + 2 unlisted (`guitar-tabs-from-video`,
`storm-bell-pop-up`) + 2 drafts (`how-rag-goobie-works`, `never-more-than-a-month-behind`).
**AO-073 exemption** (`src/data/exempt.js`): `teardown-lab` (listed) and its paths `public/media/teardown-lab/`,
`public/labs/teardown/`, `dist/ledger/teardown-lab/` are a live notebook other sessions write; never edit; every
rule calls `isLive()/isLivePath()` and only warns. Note `isLivePath` is a substring match on `/ledger/teardown-lab/`,
so a `/tea/ledger/teardown-lab/` path would also count as live. `HELD`: AO-028 `storm-bell-pop-up` (warn only).

| Section | URL(s) | Source of truth | Loaded by | Count | Client JS / Worker |
|---|---|---|---|---|---|
| Homepage (tea house) | `/` | `src/pages/index.astro` (copy hardcoded in the page), `src/layouts/Home.astro` | none (static) | 6 waypoints (`data-wp` 0-5, one an empty spacer), 5 cards: hero, Projects, Ledger and Courses, Right now, gate | JS: `src/scripts/home/index.js` (three.js scene chunk, or `flat.js` without WebGL), overlay, coin |
| Homepage overlay | opens `/ledger`, `/courses`, `/projects`, `/about`, `/now`, posts and notes in a panel | fetches the real page, mounts `[data-panel-view]` (`src/scripts/home/overlay/`) | `routes.js`: NAV entries with `overlay: true` + `/ledger/<slug>(/notes)` | - | JS |
| Lantern door | coin: five night tosses -> `/api/lantern` | `src/scripts/home/{coin,lantern}.js`, `worker/lantern.js` (302 to secret `LANTERN_URL`) | - | - | JS + Worker |
| Ledger index | `/ledger/` (`?topic=`) | posts collection; `START_HERE`; taxonomy | `LedgerView.astro`: `listedPosts()`, `byMonth`, `countBy` | 73 rows, 5 Start here, 7 topics, 7 projects chips | JS `views/ledger.js`: chips filter, search box, feed copy, hover card |
| Hover preview cards | any `/ledger/<slug>/` link (mouse) | `/ledger/previews.json` (`src/pages/ledger/previews.json.js`, `cardOf`) | `src/scripts/cards/{data,render,hover}.js`; regex `^\/ledger\/([^/?#]+)\/?$` (`hover.js:9`) | 73 cards | JS |
| Post page | `/ledger/<slug>/` | `src/content/posts/<slug>.md` | `src/pages/ledger/[slug].astro` (`allPosts()` minus drafts) -> `PostView.astro` | 75 built (73 listed + 2 unlisted) | JS `views/post.js`: `enhance()` components, contents, details, landing, hover card, Listen |
| Notes page | `/ledger/<slug>/notes/` | `src/content/notes/<slug>.md` | `notesBySlug()`; `ledger/[slug]/notes.astro` | 11 | JS `views/notes.js` |
| Post components | inside posts | `src/elements/ao-*/` (23 tags: ask bars blind calc compare cues demo diff fetch frames funnel game listen matrix model pan runs series shots slider timeline transcript treemap), `docs/COMPONENTS.md` | `elements/registry.js` lazy-loads a tag's `element.js` when present; CSS inlined by `ElementStyles.astro` | 72 posts use them | JS; media from R2 via Worker |
| Read-aloud | Listen button on listed posts | `/read/index.json`, `/read/<slug>.json` (build), recordings `read/<slug>/<hash>` in R2 | `src/scripts/read-aloud/`; `ReadAloud.astro` `data-read-hash` | listed posts | JS + Worker (falls back to browser voice) |
| og images | `/og/<slug>.jpg?v=<h8>` | drawn by `src/lib/og/` (sharp) | `ogImage(post)` in `ledger/[slug].astro` | listed posts only | build only |
| Projects | `/projects/` | `src/content/projects/*.yaml` (41: play 12, download 6, watch 9, read 11, stopped 3), `REEL` | `projectsPage(await projects(), await listedPosts())` -> `{sections, highlights}` (`src/lib/projects.js`) | 41 cards | JS `views/projects.js` (hover cards) |
| Now | `/now/` (newest), `/now/<date>/` | `src/content/now/<YYYY-MM-DD>.md` | `nowSnapshots()` -> `NowView {snap, snaps, dated}` | 1 snapshot (2026-11-08) | none |
| About | `/about/` | **hardcoded copy in `src/components/about/AboutView.astro`** (73 lines) | - | 1 | none |
| Courses index | `/courses/` | `src/data/courses.js COURSES, NEXT_COURSE` (+ `src/data/courses/*.json`, `src/data/lore/lore.json`) | `CoursesView.astro` | 2 courses + locked C-03 slot | none |
| C-01 The Hidden Curriculum | `/courses/the-hidden-curriculum/` + lesson players `public/courses/the-hidden-curriculum/lessons/<id>/` (static, other repo) | `src/data/courses/the-hidden-curriculum.json` (11 modules, 14 published, 34 locked) | `src/pages/courses/the-hidden-curriculum.astro` (372 lines, `courseCounts`, `isLegacyRow`, `fmtDuration`) | 15 lesson folders | none on index; lessons are static HTML players |
| C-02 I Love My Evening Television | `/courses/i-love-my-evening-television/` + `world/ timeline/ episodes/ characters/ things/ eggs/ threads/ questions/ steel/`, `episodes/<id>/`, `characters/<id>/`, `things/<id>/`, `lore.js`, `search.json`; lessons `public/courses/i-love-my-evening-television/lessons/` (9) | `src/data/lore/lore.json` (4 episodes, 77 characters, 72 things, 421 timeline, 60 eggs, 41 threads, 14 questions), `src/data/courses/i-love-my-evening-television.json` (9 published) | `src/lib/lore.js` (`LORE, EPISODES, CHARACTERS, THINGS, entity, urlOf, TIERS`), `lore-html.js`, `lore-svg.js`; `components/lore/LorePage.astro` (re-themes the panel by overriding `--pc-*`) | ~165 pages | small JS (tier filter, search) |
| Research | `/research/`, `/research/<slug>/`, raw `/research/<slug>.md` | `src/content/research/` | `research()`; `ResearchView {doc}` | 1 (`second-brain-builders`) | none |
| Stats | `/stats/` | Worker `/api/stats` (D1 snapshot) gated by `/stats-pages.txt` | `src/pages/stats.astro` (KEEP-exempt), `src/scripts/stats/**` | 1 | JS + Worker |
| Search | box on `/ledger/` | Pagefind `dist/pagefind/` (words) + `/api/search` (Vectorize; docs `/search/manifest.json`, `/search/docs/*.json`) | `src/scripts/search/` | 84 indexed pages (73 posts + 11 notes) | JS + Worker |
| Ask RAG Goobie | switch on the ledger search box | `/ask/manifest.json`, `/ask/*.txt` from `src/lib/ask/` | `src/scripts/search/ask.js`, `worker/ask/` (Turnstile, DeepSeek) | 73 posts + 11 notes | JS + Worker |
| RSS | `/rss.xml` | `listedPosts()` | `src/pages/rss.xml.js` | 73 items, guid `https://aaronorelup.com/ledger/<slug>/` | - |
| Sitemap | `/sitemap.xml` | explicit list (`src/pages/sitemap.xml.js`) | see B.vi | - | - |
| 404 | `/404.html` | `src/pages/404.astro` (SVG chess clock) | - | 1 | none |
| version.json, media-sizes.json, stats-pages.txt | - | `src/pages/version.json.js`, `media-sizes.json.js`, `scripts/build/stats-pages.mjs` | - | - | - |
| Hidden pages | `public/ledger/{context-window,earthlight,touch-move}/...` (easter eggs, noindex in `_headers`) | public | never link them (`links.mjs`) | 3 | - |
| Static extras (other repos / hand) | `public/labs/{info-flow,mini-loom,teardown(AO-073)}`, `public/games/{armies-of-gielinor,clawd-growth-montage,grind-and-grimoire,storm-bell}`, `public/gauntlet/{lockkeeper,loom,music-video}`, `public/presentations/*` (3), `public/tools/previs-film-flow` | public, linked from posts and project cards | - | - | own JS |
| Redirects | `/posts/*`, `/course/*`, renamed slugs | `public/_redirects` | - | - | - |

## B. How a `/tea/` route tree plugs in

### i. Layouts and chrome
- `src/layouts/PanelPage.astro` (59 lines): `import '../styles/site.css'`, `<Head>`, `<slot name="head">`,
  skip link, `ModeToggle`, `#panel-screen > #panel-card > PanelChrome`, and an inline module that runs
  `mountView(document.querySelector('[data-panel-view]'))`. Props: `title, description, active, view, noindex, image,
  published, tagline`.
- `src/layouts/Home.astro` (27 lines): `site.css` + `home.css`, `<Head>`, `html.no-js`.
- `src/components/chrome/Head.astro` (43 lines) is style-free and reusable as is: charset/viewport, title,
  description, `robots noindex,nofollow` when `noindex`, og tags, **`<meta name="ao-build">`** (contract),
  **`<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)}>`** (always self), RSS alternate, favicon,
  font preload (`fonts.json.preload` = Karla latin), pre-paint inline script setting `data-mode='day'` from
  `localStorage['scene-mode']`.
- A new `TeaPage.astro` layout can use `Head` + `ModeToggle` (markup only, styles live in `chrome.css`) without
  `site.css`. Astro/Vite bundles CSS per page, so a layout importing its own `tea.css` (which `@import`s
  `tokens.css`) should leave main-site pages and their budgets alone. **Unverified**: shared imports can re-split
  chunks (see E). `tokens.css` pulls in `fonts.css`, so fonts come for free.
- `PanelChrome.astro` (header with `← Back to the tea house`, NAV, `#panel-scroll`, footer RSS + SOCIAL) is
  main-site look; don't reuse it in the tea view except for its data (`NAV`, `SOCIAL`).
- Precedent for re-theming: `LorePage.astro` + `src/styles/lore.css` override `--pc-*` tokens to restyle chrome.

### ii. Post bodies
- Pipeline (`astro.config.mjs`, `scripts/build/markdown.mjs`): unified, Shiki (dual theme CSS vars), then
  `rehype-post-images` (width/height/`data-full`), `rehype-heading-ids` (github-slugger), `rehype-post-text` (the
  `text` extraction, stamps `data-r`, `data-pagefind-ignore` on `<ao-*>`, fails the build on an unknown tag).
- Render: `const { Content, remarkPluginFrontmatter: { text } } = await renderEntry(post)`; `PostView.astro` wraps it:
  `<article class="post" data-post-article data-panel-view="post" data-slug>`, `ElementStyles tags={text.elements}`
  (inline `<style data-ao>`), `PostHeader`, `ShortVersion`, `NotesLink`, `Contents`, `<div class="pc-prose"
  data-pagefind-body={listed ? '' : undefined}><Content/></div>`, `Related`, `PostNav`.
- CSS a body needs: `tokens.css` (`--pc-*`, fonts), `prose.css` (`.pc-prose`, the classes posts wear instead of
  `style=`), `post.css`, `elements.css` (viewer, now-playing bar, `.visually-hidden`), `read-aloud.css`, `cards.css`
  (hover card), plus each element's inlined CSS. All are on `--pc-*` tokens, so a tea skin = override `--pc-*`.
- JS a body needs: `views/post.js` mounted on `[data-panel-view="post"]` via `mountView`; it imports `enhance()`,
  `post/contents.js`, `post/details.js`, `read-aloud/listen.js`, `cards/hover.js`. `contents.js`, `highlight.js`,
  `read-aloud/index.js` and `views/post.js` scroll/observe **`root.closest('#panel-scroll')`**: the tea post page
  must keep an `#panel-scroll` scroller (or those fall back to null root = viewport, untested).
- **Practical?** Yes technically (render `PostView` inside a tea layout with `#panel-scroll` and the post CSS), but
  it costs: (1) a second copy of 75 post pages + 11 notes; (2) each copy self-canonicals and would be crawled
  (see SEO switch); (3) `data-pagefind-body` in the copy is harmless only because pagefind globs `ledger/**`
  (`scripts/build/pagefind.mjs:10`) and `tea/ledger/...` doesn't match; keep it that way; (4) `stats-pages.txt`
  picks up every copy automatically (+86 lines) and `/stats` would split traffic across two URLs; (5) read-aloud is
  keyed on `data-slug`/`data-read-hash`, so recordings are shared (fine); (6) og: the copy would have no og image
  unless passed `ogImage(post).path` (reusing the same card is fine); (7) e2e behaviour suite only covers
  `/ledger/` so a broken component in the copy goes unseen unless new specs are added; (8) the homepage overlay
  and hover cards only recognise `/ledger/<slug>/` hrefs. **Recommendation: do not re-render bodies in v1**; the
  tea view lists everything and links to the canonical `/ledger/<slug>/`.

### iii. Checks, contracts, budgets, tests a `/tea/` tree meets

| Guard | File / lines | What `/tea/**` must satisfy |
|---|---|---|
| 400-line ceiling | `scripts/check/code.mjs:7,18` (`MAX_LINES = 400`, `.js .mjs .cjs .ts .astro .css .sql` under `src/ worker/ scripts/`) | every new file < 400 lines (no grandfathering: `grandfathered.mjs` `UNTIL = {}` and "Nothing is ever added") |
| no `style=` | `code.mjs:20` (`src/(components|layouts|pages)/**/*.astro`) | classes only, no inline style attrs (an `is:inline <style>` block is fine) |
| no CSS import from browser JS | `code.mjs:19` (`src/elements`, `src/scripts`) | import CSS from layouts/components, never from `src/scripts/tea/*.js` |
| `astro:content` only in `lib/content.js` | `code.mjs:21` | go through `src/lib/content.js` |
| header rule (<= 5 lines) | ARCHITECTURE.md:31 only; **not enforced** by any check | follow it anyway |
| banned phrases, em dash, `;` | `scripts/check/prose.mjs` scope = posts/notes/now/title/summary only; not UI pages | follow WRITING.md by hand (B.v) |
| never-publish | `scripts/check/never-publish.mjs:48-52` scope = posts, notes, now, projects, `src/components/{about,now}`, `src/data/*.js` | new `src/components/tea/**` copy is **not scanned**; either keep copy in a `src/data/tea.js` (scanned) or add the folder to `scope` |
| links | `scripts/check/links.mjs`: only content files | no `/tea/` constraint; but never link `public/ledger/**` easter eggs or unlisted posts |
| contracts | `scripts/build/contracts.mjs` via `verify-dist.mjs` (deploy-fatal) and `tests/unit/contracts.test.mjs` | previews.json keys = listed; rss guids = `/ledger/<slug>/`; `stats-pages.txt` regex only inspects `^/ledger/`; baseline `tests/baseline/urls.txt` (137 paths) must all still be built. `/tea/**` is not in the baseline and need not be. Do not run `--baseline` (it would freeze `/tea/` URLs) |
| stats-pages | `scripts/build/stats-pages.mjs:20-38` crawls `dist/`; drops any path whose segment or word equals an **unlisted slug** | `/tea/**` enters automatically; a tea URL must never contain an unlisted slug |
| Ask files | `scripts/build/ask-dist.mjs` reads `dist/ledger/<slug>/` only | unaffected |
| budgets | `scripts/tools/budgets.mjs` measures only `dist/ledger/<slug>/index.html`, `dist/ledger/index.html`, `dist/index.html`; `npm test` fails at >20% over | `/tea/` unmeasured, **but** anything added to `PanelChrome`/`site.css`/post pages counts: post page minus prose already **20.5/20.0 KB (3% over)**, ledger per row 351/360 B, chrome HTML 3.6/4.0 KB |
| fonts | `tests/unit/fonts.test.mjs` + `scripts/tools/fonts.mjs misses()`: every code point on any built page with `ao-build` meta or in `_astro/*.js|css` must be in a self-hosted slice | any new glyph on `/tea/` (kanji, ornaments, arrows not yet used) fails `npm test` until `node scripts/tools/fonts.mjs` (network) regenerates `public/fonts/`, `fonts.css`, `fonts.json` |
| media guard | `scripts/media/integration.mjs` (build) + `assets.mjs` | no video/audio in `public/` outside courses; no file > 25 MiB |
| element tags | `rehype-post-text` | only matters if Markdown is rendered |
| e2e | `tests/e2e/*.spec.mjs` | nothing targets `/tea/`. `targets.json` (`scripts/tools/element-usage.mjs`, run by the Playwright config) walks every `dist/**/*.html` but keeps only post/notes pages under `/ledger/<slug>/` and pages copied from `public/` (`pageOf`, lines 55-62), so a `/tea/` page with a video, iframe or `<ao-*>` generates **no** tests automatically. Tea pages need their own specs. Element specs read targets from posts only |
| NAV-derived | `routes.js` (overlay), `PanelChrome` (nav), `data-active-view` | a NAV entry with `overlay:false` is a normal link; with `overlay:true` it needs a view module |

Paths registry: there is none (`src/lib/paths.js` is only `PUBLIC_DIR`). Route lists that are hand-kept: `NAV`
(`src/data/site.js`), `PAGES` in `src/pages/sitemap.xml.js:11-18`.

### iv. Where a single "tea house view" link goes
- Panel pages: `src/components/chrome/PanelChrome.astro:36-39` footer:
  `<div class="pc-foots"><a href="/rss.xml" class="pc-foot">RSS</a>{SOCIAL.map(...)}</div>` -> add one `<a href="/tea/"
  class="pc-foot">` (or an entry in a new list). Adds bytes to every post page's chrome HTML (3.6/4.0 KB; post page
  total already 3% over). Avoid the header NAV: `overlay-26` (`tests/e2e/overlay.spec.mjs:622-640`) asserts the mode
  toggle stays clear of `.pc-navs-o`/`.pc-home`, and `overlay-25` compares `.pc-nav`/`.pc-foot` colours.
- Homepage: `src/pages/index.astro:125-141` gate card (`.home-social` nav or a line before `.home-sign`). A same-site
  link not in the overlay's routes flies the camera out through the torii first (`src/scripts/home/scene/exit.js:13-21`);
  `data-no-fly` leaves at once. Tests asserting homepage links: `home-7/8/9` (`tests/e2e/home.spec.mjs:120-190`)
  pick `a[href="/ledger"]`, `a[href="/courses"]`, the GitHub link; overlay-15 compares colours of every
  `section[data-wp] a` before/after (a new link is included in both snapshots, fine).
- Tea -> main: link to `/` and canonical `/ledger/...` etc.

### v. Writing rules for UI copy (WRITING.md "Voice", `src/data/banned-phrases.js`)
First person, Aaron's voice, short sentences, contractions, plain words. **No em dashes, no spaced en dashes, no
semicolons**, few colons, no stacked parentheses, straight quotes, no emoji, no exclamation marks, no cheekiness,
no "two-sentence contrast flip", no telling the reader how to read. Banned: it turns out, here's the thing, in this
post, incredible, game-changing, seamless, unlock, leverage, powerful, delve, let's dive, buckle up, spoiler:, the
short answer, you can skim, tl;dr. Not machine-checked on pages, so self-check. No never-publish terms (repo public).

### vi. SEO switch (policy undecided; ship neutral)

How each surface enumerates pages today:

| Surface | Mechanism | `/tea/**` enters automatically? | Asserted by |
|---|---|---|---|
| canonical | `Head.astro:33`: always self (`Astro.url.pathname`) | **yes**: a tea page self-canonicals | nothing (no test on canonical) |
| robots meta | `Head.astro:25`: only when `noindex` prop true; `public/robots.txt` allows all; `public/_headers` X-Robots-Tag for 2 egg paths | no meta unless passed (=indexable) | `post-6` (`tests/e2e/post.spec.mjs:144-150`) for unlisted posts only |
| sitemap.xml | explicit: `PAGES` list + `nowSnapshots()`, `research()`, `listedPosts()`, `notesBySlug()`, lore ids (`src/pages/sitemap.xml.js`) | **no** | nothing |
| RSS | `listedPosts()` (`src/pages/rss.xml.js`), guid must be `/ledger/<slug>/` | no | `contracts.mjs rssProblems`, `pages-1` |
| Pagefind | crawl of `dist/ledger/**/*.html`, only `[data-pagefind-body]` | **no** (glob `ledger/**`); would if glob widened | count printed only |
| `/search/*` (semantic) | `searchDocs()` from `listedPosts()` (`src/lib/search/docs.js`) | no | `chunks/sync` unit tests |
| `/ask/*` | `src/lib/ask/docs.js` from `listedPosts()`; `ask-dist.mjs` reads `dist/ledger/<slug>/` | no | verify-dist (fatal) |
| og images | per listed post, passed as `image` prop by `ledger/[slug].astro` | no (no og tags on tea pages unless passed) | `post-6` |
| `/stats` | crawl of `dist/` -> `stats-pages.txt` | **yes** | `statsPagesProblems` checks only `/ledger/` lines |
| read-aloud, previews.json, version.json | collections | no | contracts |

Neutral "no policy yet" state that passes every check: tea pages built with the shared `Head` (self canonical, no
robots meta, og image omitted or a static one), not in `sitemap.xml`, not in pagefind (no `data-pagefind-body`, glob
untouched), not in RSS/search/ask, present in `stats-pages.txt` (automatic). No tea page re-renders post bodies.
Nothing above has a contract on `/tea/`.

Proposed single switch: `src/data/tea.js` exporting e.g. `export const TEA_SEO = 'neutral'` (later `'canonical-main'`
| `'noindex'` | `'index'`), plus `TEA_BASE = '/tea'`. It would have to be read in exactly these places:
1. the tea layout, passing `noindex` and a `canonical` override into `Head` (Head needs one new optional prop
   `canonical?: string`, defaulting to today's self URL, so main pages are byte-identical);
2. `src/pages/sitemap.xml.js` (append tea URLs only when policy says index);
3. `scripts/build/stats-pages.mjs` (filter `/tea/` if they should stay out of `/stats`; default include);
4. optionally `public/robots.txt` cannot read JS; prefer meta robots via (1). Pagefind/search/ask need no reading
   while tea pages carry no `data-pagefind-body` and bodies are not re-rendered.
`src/data/*.js` is also inside never-publish scope, so copy kept there is scanned.

### vii. Live sync ("edit once, both views update")
Automatic if tea pages call the same helpers (`listedPosts`, `projectsPage`, `nowSnapshots`, `COURSES`, `LORE`...).
Things that break or need care:
- **Hardcoded copy, not data**: homepage stop text (`src/pages/index.astro:84-139`, incl. "Right now" paragraph),
  About (`src/components/about/AboutView.astro`), course summaries (`src/data/courses.js`, shared so fine),
  Projects section intros (`src/lib/projects.js SECTIONS`, shared). To sync About/home copy, extract to a data module
  or reuse the component markup (`<AboutView/>` inside the tea layout restyled via tokens).
- Hidden Curriculum page logic lives in the 372-line page itself (`src/pages/courses/the-hidden-curriculum.astro`),
  not a lib; a tea version must import shared logic (`courseCounts`, `isLegacyRow`) or link to the canonical page.
  Lore pages are 165+ pages under KEEP-exemption; link to them, don't copy.
- Hardcoded counts: data helpers compute theirs (`courseCounts`, `DERIVED`, `COURSES[].extra`). Hand-written prose
  carries some that drift: `index.astro:119` "Building two things" (Wallpaper Breaker, Hidden Curriculum),
  `index.astro:85` "six years", `AboutView.astro:25` "The first two are on...". Not exhaustive (I grepped digits and
  number words in About, the homepage and CoursesView only). Keep numbers out of tea copy.
- Generated files needing a manual step: `src/styles/fonts.css`, `src/data/fonts.json`, `public/fonts/` (run
  `node scripts/tools/fonts.mjs` after a build when a new glyph appears, needs network); `tests/baseline/urls.txt`
  (never regenerate to pass); `src/data/media-manifest.json` (`media:push`, needs R2 keys); `src/data/ask-packs.json`
  (`ask:pin`). Course/lore JSON and `public/courses/**` are written by other repos: read only.
- Build-time only: a new post needs a deploy for both views (same as today). Client-side data available at runtime:
  `/ledger/previews.json` (cards), `/version.json`.

## C. Media

- (Checked in code: `scripts/media/files.mjs:17-42` `PUBLIC`, `STAYS_IN_GIT = ['courses/', live-notebook dirs]`,
  the extension map, `belongsInR2(url)`; `push.mjs:7-8,30` credentials.) `npm run media:push` scans `public/` for video
  and audio (`.mp4 .webm .mov .mp3 .m4a .wav .ogg .opus .flac .m3u8 .ts` ...) outside `STAYS_IN_GIT`
  (`public/courses/`, live-notebook folders), uploads new/changed ones to R2 bucket `aaronorelup-site-media` at the
  same key as the URL path, writes `src/data/media-manifest.json` (path, size, MD5), deletes local copies (`--keep`
  keeps them). Env: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` (or Infisical via `getkey.py`).
  `npm run media:verify` checks the live site serves each from R2.
- `/media-sizes.json` (`src/pages/media-sizes.json.js`): sizes of media still in git, for `worker/media/serve.js`.
- **Only video and audio go to R2.** Pictures (`.webp .png .jpg`) and captions (`.vtt`) stay in git under
  `public/` (convention `public/media/<slug>/`). `src/assets/` holds only the og font. Build refuses any public file
  > 25 MiB. Caps on images in git: icons 24 KB / 6 KB (`public/media/icons/<AO-###>.webp`, `-96.webp`), project
  pictures 640x360 <= 60 KB, og 1200x630 <= 150 KB (`src/data/limits.js`, checked by `assets.mjs`); other pictures
  have no cap. Resize tool: `scripts/tools/preview-media.mjs --out --size --cap` (needs ffmpeg).
- Existing imagery to reuse (all in git, served at the same path without `public/`):
  - Tea house: `/courses/the-hidden-curriculum/engine/assets/teahouse-night.jpg` (C-01 card),
    `/media/storm-bell-fighter/teahouse-night.jpg`, `/aaron.webp`, `/chibi.webp`, coin SVG in `index.astro`;
    lore thing `tea-house-gate` -> `/courses/i-love-my-evening-television/media/tranquility-homestead/e2-2148-the-gate.webp`.
  - Evening Television: `/courses/i-love-my-evening-television/card.webp`, `og.jpg`, `media/<entity>/*.webp`
    (109 entity folders; paths in `lore.json` `images[].ref`), generated thumbs `.../thumbs/`; post folders
    `/media/{crimson-coil,earthlight,context-window,touch-move,the-small-one-harness,bad-very-bad}/`.
  - World 1 / Storm Bell Fighter: `/media/storm-bell-fighter/` (`poster.webp`, `bt-turntable.webp`,
    `jefrie-turntable.webp`, `seed7-*.jpg`, ...), `/media/projects/storm-bell-fighter.webp`,
    `/media/previews/storm-bell-fighter.webp`, game `/games/storm-bell/`; Yusef/Echo/Bloodtailor:
    `/media/characters-in-inscryption/{source,ingame}-{yusef,echo,bloodtailor}.webp`,
    `/media/echo/*.webp` (9), `/media/blood-helix/bloodtailor-*.png`, `/media/wallpapers-nobody-saw/sept-bloodtailor.webp`,
    lore `/courses/i-love-my-evening-television/media/{bloodtailor,storm-bell,lantern}/`.
  - Caution: `/media/storm-bell-pop-up/{yusef-sheet,final-yusef,mt-yusef,bloodtailor-sheet}.webp` belong to an
    **unlisted** post (AO-028); don't surface or link them.
  - Post icons `/media/icons/AO-###.webp` (lantern gouache style) via `iconFor(post)`.

## D. Tea house scene facts

Page tokens (`src/styles/tokens.css`), default night; day when `localStorage['scene-mode']==='day'`:

| token | day | night |
|---|---|---|
| page | #FBF3E8 | #101220 |
| bg (panel) | rgba(251,243,232,.97) | rgba(21,23,38,.96) |
| head | #BE7A10 | #F0C06A |
| strong | #3A3A42 | #F2E7D5 |
| body | #4A4A50 | #C9BCA9 |
| quiet / soft | #7A6C5D / #6B5E52 | #8E8375 / #9C917F |
| line / line2 | #E2D5C0 / #D0BEA3 | #302E3E / #4A445A |
| accent | #A85E2B | #E2795C |
| gold | #B08A2E | #C9A227 |
| tile / hover / code | #F3E7D2 / #F4E9D8 / #F0E5D2 | #201F2C / #222130 / #222130 |
| home card | rgba(251,243,232,.9) | rgba(21,23,38,.86) |
| home pink / blush (both modes) | #F0A6B8 / #F7C9D4 | same |

Scene world (`src/scripts/home/scene/palette.js`, DAY -> NIGHT): cream #FBF3E8->#151726, skyTop #6FB4E8->#0B1030,
skyLow #CDE9F7->#2A3157, wall #F0A6B8->#6B4453, shoji #F6DFA8->#424A66, shojiLit #FCEFC4->#4E5678, wood
#C4874F->#5B3A26, woodDark #9A5F36->#3F2918, tatami #E8C98A->#7C6647, grass #9DB863->#31453C, leaf #8FAE55->#3B4E38,
leafDark #6E8B3D->#2C3B29, stone #CBC0AE->#565B63, tea #E08A5F->#8B4C34, vermilion #C2603F->#803D2C, ink
#3A3A42->#0E1019, petal #F7B7C8->#CE8CA4, paper #F3E7D2->#C7B28D, roof #9BA1B8->#363E56, mtnNear #5C6B8A->#39435C,
lampPaper #EFE2C2->#FFD892, lampGlow #F4EAD0->#FFF0C8, flame #E9DCB4->#FFE6A8, shoji emissive at night #8A5E28.

Fonts (self-hosted, `scripts/tools/fonts.mjs` GOOGLE constant): **Zen Maru Gothic 500, 700** (`--font-display`; 20
slices each, but only for the code points pages show: symbols plus the few kana and kanji used today, `いおかこすなのはばまみやん地月沈球窓見`. **No 茶 or other tea-house kanji is shipped**; any new one means a fonts tool run with network), **Karla 400, 600** (`--font-body`, latin + latin-ext; latin preloaded),
**JetBrains Mono 400/500/700** (lore course). `--font-serif` = Georgia system stack, `--font-mono` = system stack.
Only slices containing code points that built pages show are shipped. A new family or weight = edit `GOOGLE` in
`scripts/tools/fonts.mjs`, build, run the tool (network), commit `public/fonts/`, `fonts.css`, `fonts.json`. A new
glyph in an existing family = same tool run. Type scale: xs 11.5, sm 12.5, md 14, body 15.5, lg 17, h1
clamp(30px,4vw,44px); space 4/8/14/18/24/34/44/60; radii 8/10/24/pill.

Day vs night: **user choice only, no clock.** Default night. `Head.astro` inline script sets `data-mode="day"` before
paint if stored; `src/scripts/mode.js` toggles and dispatches cancelable `ao-mode`; the homepage cancels it and
tweens `--mix` (`src/scripts/home/theme.js`). A tea page that includes `ModeToggle` + `Head` inherits this for free.

## E. Risks and recommendations

Cheapest architecture that keeps edit-once true:
1. A `TeaPage.astro` layout using `Head` + `ModeToggle`, its own `src/styles/tea/*.css` importing `tokens.css`
   (not `site.css`), and index pages under `src/pages/tea/` that call the same helpers: `/tea/` (front, with
   home/about copy), `/tea/ledger/` (from `listedPosts`, `byMonth`, `countBy`, `START_HERE`, `iconFor`, `cardOf`),
   `/tea/projects/` (`projectsPage`), `/tea/courses/` (`COURSES`, `courseCounts`), `/tea/now/` (`nowSnapshots`,
   render via `renderEntry`), `/tea/research/`. Every item links to the canonical main URL (`/ledger/<slug>/`,
   course pages, lore pages). Hover cards come free by importing `src/scripts/cards/hover.js` lazily (it matches
   `/ledger/<slug>/` hrefs). Optional: a Now/About that renders the snapshot/about prose itself.
2. Do not re-render post bodies under `/tea/ledger/<slug>/` in v1. It is feasible later (PostView inside a tea
   layout with `#panel-scroll`, prose/post/elements CSS on overridden `--pc-*` tokens), gated by the SEO switch,
   with its own e2e specs.

Traps:
- `npm test`'s fonts test fails on any new display glyph on tea pages (decorative kanji, new arrows) until the fonts
  tool is re-run with network. Prefer glyphs already shipped, or SVG.
- New fonts/weights (an Editions-style serif) need the fonts tool and add bytes; check `/tea/` weight yourself, no
  budget covers it.
- After the first tea build, compare `npm run build`'s budget rows with this baseline and run
  `node scripts/tools/dist-diff.mjs` on old vs new `dist/`: shared imports (`cards/hover.js`, `mode.js`,
  `tokens.css`) can re-split Vite chunks and change main pages' bytes.
- Post-page budget is already 3% over (20.5/20 KB, fails at 24 KB): don't grow `site.css` or `PanelChrome`; keep tea
  CSS out of `site.css`.
- 400-line ceiling with no grandfathering for new files: split tea pages into components.
- No `style=` attributes in `.astro`; no CSS imports from `src/scripts/**`.
- `stats-pages.txt` auto-includes every `/tea/` page; never put an unlisted slug in a tea URL; consider if `/stats`
  should list them (switch point 3).
- Self-canonical by default: tea pages are indexable duplicates of list pages until the SEO switch is decided.
- Never use `allPosts()` for lists (would leak 2 unlisted posts); always `listedPosts()`. Don't link
  `public/ledger/**` eggs or `storm-bell-pop-up` media.
- Don't add `/tea` to `NAV` as `overlay: true` (needs an overlay view); a header nav item risks `overlay-26`.
- Don't regenerate `tests/baseline/urls.txt`; don't touch AO-073 paths, `public/courses/**`, course/lore JSON.
- Main moves all day (AO-073 fleet): rebase before landing; on lockfile conflict take origin's and `npm install`.
  Only `main` deploys; landing a feature branch means merging into main (Aaron's OK for anything public).
- Box limits: WebKit (phone project) cannot launch here; e2e must run `--project=desktop`, and the homepage
  overlay specs can time out under 4 workers.
- Homepage copy and About are hardcoded; the tea view either reuses those components (restyled) or the copy moves to
  a data module both read, otherwise the views drift.
