> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. `/workspace/teahouse_alt/blog` is the build box clone of this repository. `/workspace/ip_refs/` and `/workspace/jefrie_refs/` (original character art) stayed on the box: see `HANDOFF.md` section 10 for the closest images in the repo. `/workspace/teahouse_alt/hero_work/` stayed on the box; what was carried over is in `hero/` here. The "State" column of the build plan and the "Hero pipeline status" at the bottom were not updated after the builders started: `HANDOFF.md` section 5 has the current state.

# SCOPE: the tea room, an alternate view of aaronorelup.com

Written 2026-11-10 by the orchestrator (Fable 5.2) from two agent surveys:
`survey/SITE_SURVEY.md` (repo and live site) and `survey/DESIGN_BRIEF.md` (Shopify Editions structure, tea house tokens).
Base commit: `6566f5c` (`origin/main`, the commit that is live). Working branch: `feat/alt-view` in `/workspace/teahouse_alt/blog`.

## HERO PLAN (Aaron's direction of 12:32, top priority for visual quality)

The top of `/tea/` copies the structure of the Shopify Winter '26 hero and none of its content: two 3D characters
in motion around one object, in front of one picture placed in 3D space, with a framed title box holding the
chapter list. Ours is the tea house at night with World 1 characters and an Evening Television set.

| # | Aaron's point | How it is built |
|---|---|---|
| 1 | Isolated image, then TRELLIS image-to-3D, then rig or pose | Per character and prop: a clean isolated still (Gemini or xAI image generation, from the World 1 refs in `/workspace/ip_refs/` and `/workspace/jefrie_refs/`, A-pose, plain background), then TRELLIS to a textured mesh, then a puppet rig (a small skeleton with named bones, or rigid named parts with pivots if skinning fails), then decimation and texture compression to a small GLB. More candidates are generated than are used (Jefrie, Yusef, Echo, plus props) and the best two characters pass a look-at-it quality gate. Cost is logged in `hero_work/COSTS.md`. |
| 2 | Two 3D characters with an object, in front of one picture in 3D space with mouse parallax | Two World 1 characters leap toward each other across the frame (first choice: Jefrie riding her tail, which is the skateboard's counterpart, and Yusef with wings and lantern; Echo the bell bearer is the alternate). The object between them is a small CRT television from I Love My Evening Television, glowing. Behind them is one painted picture of the tea house garden at night on a plane set back in the scene (plus one or two cut-out depth layers from the same picture), so the pointer moves the camera a little and everything parallaxes. |
| 3 | No video model. Real-time Three.js, animated on scroll | No video anywhere. Stills only from image models. All motion is Three.js: bones or parts driven by a scroll timeline and an idle loop. `three` is already a dependency of the repo. |
| 4 | Skip the pencil spin. One moment of a character animated in 3D while the camera moves with scroll | The hero is a pinned section. Scrolling moves the camera from the wide shot in between the two characters toward the tea house door while Jefrie's tail ride and Yusef's wings and lantern play through their poses (character animation and camera move on the same scroll timeline). No spinning-object gag. |
| 5 | Very high quality, at the very top, reduced motion, page weight | The framed title box and a static poster paint first (plain HTML and one image). The 3D module and assets load lazily after first paint, only with WebGL and without `prefers-reduced-motion`. Reduced motion or no WebGL keeps the poster. Budgets: hero JS in its own chunk, GLBs and textures compressed, a stated byte cap in the hero brief, main-site budgets re-measured after the build. |

If TRELLIS cannot be run (no GPU capacity, no working image), the reason goes here and the closest image-to-3D
alternative is used. Status of that: see "Hero pipeline status" at the bottom.

## Decisions (mine, per ADDENDUM_1; reasons in one line each)

- **Architecture: a route tree in the same Astro repo, at `/tea/`.** It calls the same helpers the main site calls
  (`listedPosts`, `projectsPage`, `nowSnapshots`, `COURSES`, `research`, `NAV`, `SOCIAL`), so one edit updates both
  views on the next deploy. No snapshot fallback is needed.
- **One long chaptered page, like Editions.** Every listed post, project, course, snapshot and research doc is a
  card or row on `/tea/` that links to its own page on the main site. Short content (Now, About) is shown in full.
- **Post bodies are not re-rendered under `/tea/` in this version.** The post components (synced video, players,
  calculators, read-aloud) are tied to the main page frame and its tests; a second copy of 86 pages is where the
  open SEO question bites hardest; and the hero is now the priority. A tea-styled reading view is a clean follow-up.
- **Links both ways.** Tea to main: the title box, the rail, the footer, and every card. Main to tea: one link in
  the panel footer (every panel page) and one on the homepage gate card.
- **Single source for hand-written copy.** About text is shared (reuse the component or move the copy to a data
  module both views read, with the main page's HTML unchanged). Counts are computed at build, never typed.
- **Sessions.** One session, context watched. If it passes 70 percent I compact or write `HANDOFF.md` and continue.
- **Two phases, two pushes.** Phase 1 is the whole tea room with a static hero (which is also the reduced-motion
  and no-WebGL path), links both ways, the SEO switch and tests; it lands as soon as it is green. Phase 2 is the
  3D hero, built in parallel from the start, landed when it passes a look-at-it quality gate. The hero is the one
  slice that can fail, so it does not hold the rest back.
- **Hero byte cap.** Everything the hero loads beyond the page (models, textures, background, poster; not the
  three.js chunk) stays under 4 MB in total, no file over 1.5 MB, poster under 150 KB, and nothing but the poster
  loads before first paint. Binaries are committed once, final; iteration happens in `hero_work/`, outside git.
- **Hero binaries live in git under `public/tea/hero/`, small.** (Precedent: the repo already keeps `.glb` models
  in git, `public/media/jefrie-3d/` at 2.0 MB and 1.6 MB.) The repo's media flow (`npm run media:push`)
  carries only video and audio to R2; the hero has neither. Pictures and models follow the repo's convention for
  pictures (git, under `public/`), with a byte cap. Routing `.glb` through R2 would mean changing the Worker's
  routes, which is out of bounds for this job.

## Inventory of the live site, and what carries into the tea room

| Piece of the main site | Count today | In the tea room | Why |
|---|---|---|---|
| Homepage tea house scene (3D, waypoints, overlay) | 1 | Left out as a copy; its look and day/night palette drive the design; linked ("Go to the main site") | It is the main view. The tea room is the other one |
| Homepage copy (welcome, right now) | 5 cards | Needs rework: the hero statement is new copy; "right now" comes from the Now snapshot instead | Homepage text is hardcoded in the page, so copying it would drift |
| Ledger index (months, topic chips, Start here) | 73 listed posts, 7 topics, 5 picks | Transfers cleanly: "Start here" chapter from `START_HERE`, "The ledger" chapter grouped by topic from `listedPosts()` | Same helpers, same order rules |
| Ledger filter chips and search box | 1 | Needs rework: topic anchors instead of filters; "Search the ledger" links to `/ledger/` | The search UI is bound to the ledger view and the Worker |
| Hover preview cards | 73 | Left out | The index is for scanning; cards already show the summary |
| Post pages and their components | 75 built | Left out as tea pages; every post is linked | See decisions above |
| Notes pages | 11 | Linked from their post's row where a note exists | Same reason as posts |
| Unlisted posts, drafts | 2 + 2 | Never shown, never linked, never counted | Repo hard rule; only `listedPosts()` is used |
| AO-073 live notebook | 1 | Shown as a normal row linking to it; nothing of it is edited | It is a listed post; its files are not ours |
| Read-aloud, og images, reads counter | per post | Left out | They belong to post pages |
| Projects | 41 in 5 sections | Transfers cleanly via `projectsPage()` | Same data, same sections |
| Now and setup | 1 snapshot | Transfers cleanly: newest snapshot rendered in full, older ones linked | Same collection via `nowSnapshots()` / `renderEntry` |
| About | 1 | Transfers with a small shared-source change | Copy is hardcoded in a component today |
| Courses index | 2 courses + next slot | Transfers cleanly from `COURSES` / `NEXT_COURSE`, counts from data | Same module |
| The Hidden Curriculum (lessons) | 14 published | Linked as a course plate with counts | Lessons are static players written by another repo |
| I Love My Evening Television (lore hub, ~165 pages) | 4 episodes and the lore | Linked: plate plus links to the hub's sections (world, timeline, episodes, characters, things) | Written by another repo; link, do not copy |
| Research | 1 doc | Transfers cleanly as rows from `research()` | Same collection |
| Stats | 1 | Linked in utilities | Worker-backed page |
| Search, Ask RAG Goobie | on `/ledger/` | Linked in utilities | Worker-backed, bound to the ledger view |
| RSS | 1 feed | Linked; not duplicated | One feed is right |
| Sitemap, canonical, robots | - | Awaiting Aaron (below) | - |
| 404, version.json, redirects | - | Untouched | Shared by both views already |
| Labs, games, gauntlet, presentations, tools under `public/` | ~15 | Reached through their project cards, as on the main site | They are link targets, not pages of ours |
| Lantern door and coin (homepage easter egg) | 1 | Left out | Belongs to the homepage scene |
| Hidden easter-egg pages under `public/ledger/` | 3 | Never linked | Repo rule |
| Day and night mode | toggle | Transfers: same `scene-mode` setting, so the choice follows the visitor across both views | Shared `mode.js` and tokens |

## SEO policy: AWAITING AARON (nothing shipped)

Aaron is reviewing whether the main site is canonical and the tea pages non-canonical (canonical tags to the
matching main pages, or noindex). Until he decides, no tea-specific canonical, noindex, sitemap or search-exclusion
behaviour ships.

What the decision now covers: **one URL, `/tea/`.** Because posts are not re-rendered under `/tea/`, there are no
per-post twins. The question is only how the single tea page relates to the main site.

State shipped while pending: `/tea/` gets exactly what any new page on the site gets from the shared `Head`
(the site default, which is a canonical tag naming the page itself, and no robots tag). It is absent from the
sitemap, RSS, Pagefind, semantic search and Ask, because those are built from explicit lists. It does appear in
`stats-pages.txt` (the list of pages `/stats` may show), because that file is a crawl of the build.

The switch is one constant, `TEA_SEO` in `src/data/tea.js`, shipped as `'pending'`. It is read in two places: the
tea layout (robots tag and canonical target) and `src/pages/sitemap.xml.js`. Values:

| Value | Canonical tag on `/tea/` | Robots | Sitemap |
|---|---|---|---|
| `'pending'` (shipped) | site default (itself) | none | absent |
| `'canonical-main'` (my recommendation) | `https://aaronorelup.com/` (set by `TEA_CANONICAL_TWIN`, one line to change) | none | absent |
| `'noindex'` | site default | `noindex` | absent |
| `'index'` | itself | none | listed |

Changing it is a one-line commit.

## Build plan and agent slices

| Slice | Agent | Owns | State |
|---|---|---|---|
| Survey of repo and live site | opus-builder | `survey/SITE_SURVEY.md` | done |
| Design recon and brief | opus-builder | `survey/DESIGN_BRIEF.md`, `survey/design/` | done |
| tea-core: layout, tokens, all chapters, SEO switch, main-site links | opus-builder | `src/data/tea.js`, `src/lib/tea*.js`, `src/layouts/TeaPage.astro`, `src/components/tea/**` (not `hero/`), `src/styles/tea/**` (not `hero*.css`), `src/scripts/tea/**` (not `hero/`), `src/pages/tea/**`, the few main-site lines | planned |
| hero-spike, then hero-assets: one time-boxed pass from still to TRELLIS to GLB to a bare Three.js page for every candidate (Jefrie, Yusef, Echo, props), then production of the chosen two | opus-builder | `/workspace/teahouse_alt/hero_work/`, final files for `public/tea/hero/` | planned |
| hero-runtime: Three.js scene, scroll timeline, parallax, fallbacks | opus-builder | `src/scripts/tea/hero/**`, `src/components/tea/hero/**`, `src/styles/tea/hero.css` (own worktree `blog-hero`) | planned |
| verify: unit and e2e specs for `/tea/`, budgets, dist diff, review | opus-builder | `tests/unit/tea*.test.mjs`, `tests/e2e/tea*.spec.mjs` | planned |
| Integration, landing, report | orchestrator | merge, checks, rebase, push, `REPORT.md`, `shots/` | planned |

## Hero pipeline status

Not started. Updated when TRELLIS has run (where, cost, what was kept).
