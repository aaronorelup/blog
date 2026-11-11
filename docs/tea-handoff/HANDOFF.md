# HANDOFF: the tea room, an alternate view of aaronorelup.com

Written 2026-11-10 by the orchestrating session (Claude Fable 5.2) on Aaron Orelup's build box, for a fresh cloud
session that has this repository and nothing else from that box. Read this file top to bottom, then `SCOPE.md`,
then the two surveys next to it.

**This folder (`docs/tea-handoff/`) is working material, not site content. Delete it in the same change that lands
the tea room on `main`.** It sits on a public repository: it holds no key values, and nothing in it should be
added that Aaron would not publish.

## 1. Start here

- **Start from branch:** `feat/alt-view` (the static page and this folder). The 3D hero is on the second branch,
  `feat/alt-view-hero`. Section 5 has every branch and commit.
- **Nothing here is merged or deployed.** `main` is untouched by this work. The live site is unchanged.
- **Your job:** finish the mission in Appendix A (the original prompt and its three addenda, pasted in full) from
  the state in section 5, in the order in section 6.
- **First commands:**
  ```
  git fetch origin
  git checkout feat/alt-view
  npm ci
  npm run check && npm run build && npm test
  npx astro preview --port 4391     # then open http://localhost:4391/tea/
  npm run e2e -- --project=desktop  # starts its own preview; add the phone project if WebKit runs where you are
  ```
- **Paths in this folder:** every path here is in the repository unless it starts with `/workspace/`. Those are
  on the build box only and you cannot reach them; section 10 lists what stayed there and where the closest copy
  in the repo is.
- **Before you change code:** read the repo's `CLAUDE.md`, `ARCHITECTURE.md`, `WRITING.md`, and in this folder
  `SCOPE.md` (decisions, the hero plan, the SEO switch), `SITE_SURVEY.md` (how the repo works and what will bite)
  and `DESIGN_BRIEF.md` (tokens, layout, copy).

## 2. The goal and the rules, in short (the full text is Appendix A and it wins over this summary)

- Build a second view of aaronorelup.com at `/tea/` ("the tea room"): the same information as the main site, from
  the same Astro content collections and data modules, so one edit updates both views. Links both ways.
- Structure from the Shopify Editions Winter '26 page (chapters, giant headers, many "headline + one line" cards,
  rhythm, motion). Look from Aaron's tea house (the homepage scene), with accents from I Love My Evening Television
  and World 1. Not a Renaissance look. Nothing of Shopify's branding, art, fonts or copy.
- Scope is only the alternate view. Main-site files change only for the links to it and a shared prop.
- **Hero (top priority for visual quality, Appendix A, addendum 3):** copy the structure of the Shopify hero. Per
  character or object: an isolated still, then TRELLIS image-to-3D, then a rig or pose so it moves. Two 3D
  characters with an object in front of one picture placed in 3D space, with pointer parallax. No video model for
  anything: stills only from image models, all motion is real-time Three.js driven by scroll. Skip the pencil spin.
  At least one moment where a character is animated in 3D while the camera moves with the scroll. Respect
  `prefers-reduced-motion` and page weight: lazy-load after first paint, static poster fallback.
- **Live sync is the goal** (addendum 1). The decisions on architecture and scope belong to the orchestrating
  model; they are recorded in `SCOPE.md`.
- **SEO is held for Aaron** (addendum 2). Do not ship canonical, noindex, sitemap or search-exclusion changes for
  `/tea/`. The policy is one switch. See section 4.
- **Operations:** never end your turn while an agent you started is still running. Watch context: above 70
  percent, compact or hand off with a HANDOFF file.
- **Team:** the orchestrator plans, delegates, reviews and integrates; Opus builders take well-scoped slices with
  their own files; Sonnet helpers take small mechanical pieces. Few long-lived agents beat many throwaway ones.
- **Repo rules** (from `CLAUDE.md`): only `main` deploys; land with `npm run check && npm run build && npm test`
  and the e2e specs you touch, rebase on `origin/main` right before `git push origin HEAD:main`, never force-push,
  then confirm `https://aaronorelup.com/version.json` shows your commit and the new URL returns 200. AO-073
  (`teardown-lab`) is never edited. The repo is public: no keys, tokens, private links or never-publish names.
  Video and audio go to R2 through `npm run media:push`, never into git.
- **Done means** (Appendix A): `/tea/` live with the same content from the same files and links both ways; all
  checks green, pushed to main, deploy confirmed; a `REPORT.md` with URLs, what it shows, how it shares content,
  design choices, the agent tree, problems and fixes, what is left, and desktop and phone screenshots.
- Aaron's last name is spelled Orelup.

## 3. Decisions already made (details and reasons in `SCOPE.md`)

1. A route tree in the same repo at `/tea/`, reading the same helpers as the main site. No snapshot fallback.
2. One long chaptered page. Every listed post, project, course, snapshot and research doc is a card or row linking
   to its own main-site page. Now and About are shown in full. Post bodies are not re-rendered under `/tea/` in
   this version.
3. Two phases, two pushes. Phase 1: the whole static page (its hero is the permanent reduced-motion and no-WebGL
   path), links both ways, the SEO switch, tests. Phase 2: the 3D hero, after a look-at-it quality gate.
4. Hero binaries are small and live in git under `public/tea/hero/` (the repo already keeps `.glb` files in git:
   `public/media/jefrie-3d/`). Cap: under 4 MB in total beyond the page, no file over 1.5 MB, poster under 150 KB,
   nothing but the poster before first paint. Commit binaries once, final. This departs from the letter of the
   original prompt ("media to R2"): the repo's media flow carries only video and audio, and the hero has neither.
5. Hero cast, first choice: Jefrie riding her tail (the skateboard's counterpart) and Yusef with wings and lantern,
   with a small CRT television from Evening Television as the object between them, in front of a painted night
   tea-house garden. Echo the bell bearer is the alternate. The spike results in section 8 decide the final cast.
6. Markup contract between the page and the 3D hero:
   ```html
   <section class="tea-hero" id="top" data-tea-hero>
     <div class="tea-hero-pin">
       <div class="tea-hero-stage" data-tea-stage aria-hidden="true"></div>  <!-- poster and canvas mount here -->
       <div class="tea-hero-box"> title box: kicker, h1, statement, counters, chapter TOC, main-site pill </div>
     </div>
   </section>
   ```
   Without the 3D script the hero is one viewport tall and static. With it, the script sets `data-3d="on"` on
   `.tea-hero`, the section grows tall and `.tea-hero-pin` sticks while the scroll timeline plays.

**Advisor guidance that shaped the plan** (the Fable advisor, consulted when the plan was set):
- Land in two phases: the static page first, the 3D hero second.
- Hero binaries small and in git, committed once, final.
- Run every candidate character through the spike and let the results pick the cast.
- Try rigid puppet parts (named parts with pivots) before skinning. A pose-baked mesh plus separately modelled
  swinging props still meets Aaron's "rig or pose".
- Write each RunPod pod id to disk the moment it is created, and verify termination through the API.
- Keep asset tooling (TRELLIS, Blender, gltf tools) out of the repo's `package.json`.
- Look at a contact sheet of scroll positions before phase 2 lands.
- No existing e2e spec covers `/tea/`. WebKit cannot launch on the build box, so the phone e2e project has never
  run for this work.

## 4. SEO switch: still awaiting Aaron. Do not ship a policy.

- One constant, `TEA_SEO` in `src/data/tea.js`, shipped as `'pending'`. Read in two places: the tea layout and
  `src/pages/sitemap.xml.js`.
- While pending, `/tea/` gets what any page gets from the shared `Head` (the site default: a canonical tag naming
  the page itself, no robots tag) and is absent from the sitemap, RSS, Pagefind, semantic search and Ask.
- Because posts are not re-rendered, the decision covers one URL. Values: `'canonical-main'` (canonical to
  `https://aaronorelup.com/`, the orchestrator's recommendation), `'noindex'`, `'index'`. The table is in `SCOPE.md`.
- Leave it at `'pending'` until Aaron answers in his own words.

## 5. State of the work

Nothing is on `main`. Both branches below were pushed to origin for this handoff; neither is merged or deployed.
`main` was at `6566f5c` when the work started; it moves all day (other agents land posts), so rebase before landing.

### 5.1 Phase 1, the static page: branch `feat/alt-view` (done, builder "tea-core")

Based on `6566f5c` (`origin/main` at the start). Commits:

| Commit | What it does |
|---|---|
| `1b5e478` | First build: `/tea/`, the whole site on one chaptered page (layout, copy and SEO switch, shaping helpers, all chapters, static hero, rail, CSS, rail script); `Head.astro` gains an optional `canonical` prop; `sitemap.xml.js` adds `/tea/` only when the switch says so |
| `255251f` | Links from the main site: "Tea room" in the panel footer after RSS, "Everything on one page" on the homepage gate card (`data-no-fly`) |
| `db10b95` | Fixes: the day/night switch moves into the rail, showreel link, numerals on the chapter curtains, tea rows in `ARCHITECTURE.md` |
| (handoff commit) | Adds this folder, `docs/tea-handoff/`. Delete it in the change that lands on `main` |

**What is built.** One long page at `/tea/` showing the whole main site, read at build time from the same helpers:
a static hero (an SVG night tea-house garden behind the framed title box; this stays as the reduced-motion and
no-WebGL path), then chapters I Start here, II The ledger (all 73 listed posts by topic, with links to the 11
notes), III Projects (all 41 in 5 sections), IV Courses (both courses, the 9 lore hub links, the next-course
slot), V Now (newest snapshot in full, older ones and research linked), VI About (the main site's own
`AboutView`, restyled), then utilities and footer. A side rail on desktop and a top strip on phone mark the
current chapter and hold the day/night switch. Full file map: `status/tea-core.md` in this folder. Main-site
edits are only: `Head.astro` (optional canonical prop, default unchanged), `sitemap.xml.js`, `PanelChrome.astro`
(one footer link), `src/pages/index.astro` (one gate button), and rows in `ARCHITECTURE.md`. No dependency,
lockfile, glyph or image change. Left empty for the 3D hero: `src/components/tea/hero/`, `src/scripts/tea/hero/`,
`src/styles/tea/stage.css`, `public/tea/hero/`.

**Verified on the build box (Node 24):** `npm run check` 0 errors and the same 9 warnings as baseline; `npm run
build` 262 pages (baseline 261 plus `/tea/`), contracts hold; `npm test` 124 of 124. A dist diff against an
untouched build of `6566f5c` showed only `tea/index.html` added, `stats-pages.txt` plus one line, and the footer
link on panel pages plus the gate button on `index.html`; `sitemap.xml` and `rss.xml` byte-identical. Budgets
unchanged except "homepage before the scene" 22.6 to 22.7 KB (budget 30). All 222 internal links on `/tea/`
resolve; 73 distinct post links, no unlisted or draft slug. SEO while `'pending'`: self canonical, no robots tag,
absent from the sitemap. Keyboard order, JS off and reduced motion checked by hand. Desktop e2e `home-7/8/9`,
`overlay-15`, `overlay-25` pass; `overlay-26` failed once under two workers and passed twice alone (a known flake).
Page weight: `/tea/` HTML 25.5 KB gzipped, CSS 8.3 KB gzipped. Screenshots: `shots/` in this folder (the six
without a `hero-lab-` prefix; the five with it show the 3D hero on stand-ins).

**Not done or not verified:**
1. e2e `overlay-27` (phone project, `tests/e2e/overlay.spec.mjs:649`) asserts the panel footer has exactly
   `SOCIAL.length + 1` links; the "Tea room" link makes it one more, so it will fail. It also checks the footer
   stays under 10 percent of the viewport height and every link is in view. It was not run (WebKit cannot launch
   on the build box). Decide: update the expected count, or move the link.
2. Two `h1`s on `/tea/`: `AboutView` brings its own "About me" `h1`, kept for a single source and visually hidden
   under `.tea-about`. If one `h1` matters, move About's copy to a data module both views read.
3. On a phone the day/night switch sits in the top strip, which is not visible while the hero is on screen.
4. No unit or e2e tests for `/tea/` yet. The planned verify slice was never launched because of this handoff.
5. No WebKit or real phone run; phone layouts were checked in Chromium at 390x844 only.
6. The Evening Television and Yusef stills the design brief proposed for the Courses chapter were not used (they
   are unpublished originals, section 10); the course plates reuse the existing course card images.

### 5.2 Phase 2, the 3D hero: branch `feat/alt-view-hero` (builder "hero-runtime")

Based on `6566f5c`, separately from `feat/alt-view` (the two branches have not been joined yet). Commits:

| Commit | What it does |
|---|---|
| `131ba62` | Runtime: first frame from the manifest (WIP, with the lab page) |
| `d46af8f` | Stand-in models and a painted stand-in picture, full manifest |
| `9fd5bd6` | Composition pass, portrait framing, poster and shot scripts in the repo |
| `02c95d6` | Posters, behaviour checks, clear colour, mode tween at low frame rates |
| `fab636d` | `docs/TEA_HERO.md`: manifest format, tools, integration, next steps |

**Read `docs/TEA_HERO.md` on that branch.** It is the full runtime write-up; `status/hero-runtime.md` here is the
same text plus the builder's notes.

**What is built.** A Three.js hero driven by one manifest, `public/tea/hero/manifest.json`, mounted by
`src/components/tea/hero/Stage.astro` into tea-core's `[data-tea-stage]` contract (code in
`src/scripts/tea/hero/`, CSS in `src/styles/tea/stage.css`, tools in `scripts/tools/tea-hero/`). The section pins
for about 300vh (220vh on phones); one scroll progress value drives a camera path (wide shot, a slight orbit, then
between the characters toward the tea house door) and every character track. The required moment: from progress 0.1
to 0.45 Jefrie crouches, leaps over the TV and turns in the air with her tail curling while the camera orbits past
her. On top: an idle loop (breathing, wings, lantern swing, tail curl, TV screen shader with flicker), pointer
parallax, tilt on Android, motes, live day and night from `data-mode`. A poster paints first; `boot.js` (760 B
gzip) imports the 3D chunk only after first paint and only without reduced motion, Save-Data or 2g, on a capable
device, with WebGL. Any failure keeps the poster. It runs today on **stand-ins**: a primitive angel for Yusef, a
primitive TV, a painted placeholder picture, and Aaron's existing `public/media/jefrie-3d/jefrie-v2.glb` for Jefrie
(one unrigged mesh, tail curled by a bend deform). Swapping to the final assets is a manifest edit.

**Verified on the build box:** `npm run check` and `npm run build` pass (with the lab page). The branch's own
`scripts/tools/tea-hero/verify.mjs` passes: reduced motion and no WebGL keep the poster with no console errors;
the 3D path has no console errors; CLS under 0.001 when the canvas appears; the mode switch tweens live; drawing
stops off screen; the skip link reaches the first chapter through the pin. Main-site budgets identical to
baseline. Hero code 14.8 KB gzip (`stage.*.js`) plus the site's existing `three.module` (165 KB gzip) and
`GLTFLoader` (13.2 KB gzip) chunks. `public/tea/hero/` holds 768 KB of stand-ins and posters.

**Not verified, and known issues:**
1. **Delete `src/pages/tea-lab.astro` before anything merges to `main`.** It is a noindex development page linked
   from nowhere, kept so the hero can run alone (`/tea-lab/`). While it exists the build adds `/tea-lab/` to
   `stats-pages.txt`, and its imports rename the shared stylesheet chunk on every page (same bytes and hash, new
   file name).
2. The Jefrie stand-in `jefrie-v2.glb` is 2.07 MB, over the 1.5 MB per-file cap: acceptable only as a stand-in.
3. Frame rate on real hardware is unknown: headless Chromium on the box renders through software WebGL
   (SwiftShader, a few frames a second). Real phones, iOS Safari (its `svh` behaviour while pinned) and tilt are
   unverified. Save-Data and the small-device gate were checked as code paths only.
4. On phones the characters overlap around a quarter of the way through the scroll (`camera.portrait.spread`).
5. With the hero in the build, the shared `three.module.*.js` and `GLTFLoader.*.js` chunks get new hashes (three's
   is 101 bytes larger), so the homepage downloads three once more after the deploy.
6. Commits on this branch are authored with a per-command identity, "Claude (hero-runtime agent)", and carry a
   `Co-Authored-By: Claude Opus 5.5` trailer. git config was not changed.

### 5.3 Hero assets (builder "hero-spike", no branch: worked in a scratch folder on the build box)

Every candidate went through still, TRELLIS.2 and GLB: Jefrie (A-pose and leap), Yusef (A-pose and leap), Echo
(A-pose and leap), and three props (CRT television, lantern, bell). Eight of nine models are good; Yusef's leap came
out as a flat relief. A rig test on Yusef worked (rigid head and arms, a 5-bone skinned chain per wing). The
spike's recommendation is **Jefrie and Yusef around the CRT television, Echo as the alternate**, with a hybrid rig.
Details in section 8. Its outputs are in `hero/` here: the 9 stills (WebP, 1024), six compressed GLBs, contact
and rig sheets, the lab page, all tools, `PODS.txt` and `COSTS.md`. Its full write-up is `status/hero-spike.md`.
All four pods are terminated, verified independently for this handoff; GPU cost USD 4.87 (section 8).

### 5.4 Session history (for the problems part of `REPORT.md`)

- The orchestrating process was restarted five times on 2026-11-10. Three times a headless process exited and
  killed its background agents (the reason for ADDENDUM_2's rule); the other restarts came with switches between
  plans and in and out of Remote Control.
  Builders were relaunched from what they had left on disk each time, which is why commits and status files were
  made early and often.
- WebKit cannot launch on the build box (missing system libraries), so only the desktop e2e project ran.
- The full Shopify page (54,200 px) crashed a headless tab when captured as one image; it was captured as a
  scroll sequence instead (`refs/moodboard.md`).
- Aaron then asked for this handoff (a cloud session continues), so the verify slice and the landing of phase 1
  did not happen on the build box.

- TRELLIS route: no hosted image-to-3D key was available; the public TRELLIS.2 Hugging Face Space refused on an
  anonymous GPU quota; a 29 GB prebuilt TRELLIS image never finished pulling on a RunPod pod in 45 minutes; a
  generic cached image plus a 4-minute bootstrap worked once camenduru's wheels were installed one by one with
  `--no-deps` (section 8).
- Gemini image billing hit HTTP 402 after three stills, so the rest were made with xAI.
- The working pod sat idle for about four hours after its jobs finished (about USD 3.40 of the USD 4.87) because
  the spike's session stalled. It was terminated, and the lesson is in section 8: terminate as soon as jobs return.
- Headless WebGL on the box needs SwiftShader flags and renders a few frames a second, so the runtime's shot and
  poster scripts freeze time and pin the pointer to make repeatable frames.

## 6. What is left, in order

1. **Get your bearings.** Check out `feat/alt-view`, `npm ci`, run check, build and test, open `/tea/` in a
   preview in both day and night, and compare with `shots/`. Read section 11: some steps below wait on Aaron.
2. **Verify phase 1** (the slice that was never launched):
   - Unit tests `tests/unit/tea*.test.mjs` for `src/lib/tea.js` (`roman`, `plural`, `counterLine`, `postRow`,
     `ledgerByTopic`, `loreHub`, `projectHref`) and for `teaSeo()` in `src/data/tea.js` (all four values give the
     table in section 4).
   - e2e `tests/e2e/tea*.spec.mjs`: the page loads with every chapter; the rail marks the current chapter; with
     JS off every section is visible; every internal link resolves; no unlisted or draft slug appears; the post
     count equals `listedPosts()`; canonical and robots match the switch; both main-site links reach `/tea/`.
   - Decide `overlay-27` (section 5.1, item 1). Do not weaken the test's intent; update the count or move the
     link, and say which in the commit.
   - Decide the two `h1`s and the phone day/night switch (section 5.1, items 2 and 3).
   - Run the phone e2e project if WebKit launches where you are.
3. **Hero assets** (the spike's plan, `status/hero-spike.md` section 9; it estimated about a day of agent time and
   about USD 2). Get Aaron's answers to section 11 questions 2 and 3 first: this needs keys and the reference art.
   - Final stills with xAI `grok-imagine-image-2.0` and the prompts in `hero/tools/gen_stills_jobs.py`, 2 to 3
     variants each: Jefrie A-pose with the tail laid in a gentle S to one side (not curled at her feet), Yusef
     A-pose with the wings a little further from the body, a leap pose for Jefrie only. Keep the CRT, lantern and
     bell, or regenerate the CRT with its screen as a separate dark inset.
   - TRELLIS.2 on a RunPod RTX 4090 with `hero/tools/pod/create_b.py` (ready in about 6 minutes): each still at
     1024 with `dec=30000 tex=1024`. **Terminate the pod the moment `client.py wait` returns** and write its id to
     disk at creation.
   - Compress with `hero/tools/compress.sh`, drop the metallicRoughness texture, target under 900 KB per character
     and 250 KB per prop, inside the cap in section 3, item 4. Check with turntable sheets.
   - Rig: port the lab's logic (`hero/lab/`) into the hero module or bake it into the GLBs. Jefrie: a tail chain
     along a curved polyline, cape as a 3-bone chain, rigid arms and head. Yusef: as in the lab, two chains per
     wing, lantern parented to the right hand. Name nodes by the convention in `docs/TEA_HERO.md`.
   - The background: one painted night tea-house garden picture per mode (about 2400 px wide, WebP under 300 KB),
     plus one or two cut-out depth layers with alpha, sized per `docs/TEA_HERO.md`.
4. **Hero runtime and integration** (`docs/TEA_HERO.md`, "Next steps", on `feat/alt-view-hero`).
   - Rebase `feat/alt-view-hero` on `feat/alt-view` (or merge it in on a new branch). Put `<Stage />` in
     `src/components/tea/TeaHero.astro` in place of the bare stage div, keeping the box markup. Check the static
     and pinned layouts with tea-core's styles (no ancestor of `.tea-hero-pin` may set `overflow`).
   - Swap the stand-ins by editing `public/tea/hero/manifest.json` only; adjust the keys in the lab, re-run
     `scripts/tools/tea-hero/shots.mjs`, then `poster.mjs`. Delete unreferenced `standin-*.glb` and `bg-*.webp`,
     and stop pointing at `jefrie-v2.glb`. Commit the final binaries once.
   - Fix the phone overlap at a quarter of the scroll. Run `verify.mjs --url` against `/tea/` (change its
     `.lab-skip`, `#c1` and `#c3` selectors to tea-core's skip link and chapter ids).
   - Delete `src/pages/tea-lab.astro`, build, and confirm `/tea-lab/` is gone from `dist/stats-pages.txt`.
   - Check frame rate on real hardware and a real phone if you can; otherwise say it was not checked.
5. **Quality gate for phase 2.** A contact sheet of scroll positions at desktop and phone, day and night, plus
   reduced motion and no WebGL (the poster stays). Re-measure budgets and run the dist diff against a fresh
   untouched build of `origin/main` (build it in a second worktree: the box's `baseline_dist` is not in the repo).
6. **Land.** Whether phase 1 lands alone first is a question for Aaron (section 11). For each landing: delete
   `docs/tea-handoff/` in the same change, `git fetch origin && git rebase origin/main`, `npm run check && npm run
   build && npm test` and the e2e specs you touched, `git push origin HEAD:main` (never force), then confirm
   `https://aaronorelup.com/version.json` shows your commit and `https://aaronorelup.com/tea/` returns 200.
   Leave `TEA_SEO` at `'pending'` unless Aaron has answered.
7. **Report.** The mission asks for `REPORT.md` and desktop and phone screenshots under `/workspace/teahouse_alt/`
   on the build box, which you cannot reach. Ask Aaron where he wants them (section 11); the content list is in
   Appendix A, "Done means", item 3. Section 5.4 holds the problems so far.

## 7. Key findings you will need (full detail in `SITE_SURVEY.md` and `DESIGN_BRIEF.md`)

**How content loads.** `src/lib/content.js` is the only file allowed to import `astro:content`. Use
`listedPosts()` for every list (never `allPosts()`, which includes 2 unlisted posts that must never appear, be
linked or be counted), `projects()` with `projectsPage()`, `nowSnapshots()` with `renderEntry()`, `research()`,
`COURSES` and `NEXT_COURSE` from `src/data/courses.js`, `START_HERE` from `src/data/picks.js`, `TOPICS` from
`src/data/taxonomy.js`, `NAV` and `SOCIAL` from `src/data/site.js`. Counts at survey time: 73 listed posts,
41 projects in 5 sections, 2 courses, 1 Now snapshot, 1 research doc, 11 notes.

**Rules that fail the build or the tests.**
- Every file under `src/`, `worker/`, `scripts/` stays under 400 lines. No grandfathering for new files.
- No `style=` attributes in `.astro` files. No CSS imported from browser JS (`src/scripts/**`).
- The fonts unit test fails on any character not already in the shipped font slices (a new arrow, dot, kanji or
  ornament anywhere on a built page). Use SVG for ornaments. The fonts tool needs network and rewrites generated
  files: avoid needing it.
- Budgets measure only the homepage, the ledger index and post pages, but the post page is already 3 percent over
  its 20 KB budget and `npm test` fails at 20 percent over. Keep tea CSS out of `site.css`, and keep the one
  footer link short. After a build, compare budget rows and run `node scripts/tools/dist-diff.mjs` against an
  untouched build of `origin/main` to prove main pages changed only by the link.
- Never run the contracts tool with `--baseline`. Never regenerate `tests/baseline/urls.txt`.
- `public/courses/**`, `src/data/courses/*.json`, `src/data/lore/*.json` are written by other repos: read only.
- UI copy on tea pages is not machine-checked, so follow `WRITING.md` by hand: first person, short, plain, no em
  dashes, no spaced en dashes, no semicolons, no exclamation marks, none of the banned phrases. Keep copy in
  `src/data/tea.js`, which the never-publish scan covers.

**Where the two links from the main site go.** The panel footer (`src/components/chrome/PanelChrome.astro`, next
to RSS) and the homepage gate card (`src/pages/index.astro`, with `data-no-fly` so the camera does not fly out).
Not the header nav: e2e `overlay-26` guards that area.

**SEO mechanics.** `Head.astro` always writes a self canonical. The sitemap, RSS, Pagefind (glob `ledger/**`),
semantic search, Ask and og images are built from explicit lists, so `/tea/` stays out of them unless added.
`stats-pages.txt` is a crawl of the build, so `/tea/` enters it by itself.

**Tests.** No existing e2e spec covers `/tea/`; it needs its own (`tests/e2e/tea*.spec.mjs`) and unit tests
(`tests/unit/tea*.test.mjs`). The Playwright config serves each checkout's own `dist/` on a port derived from the
checkout path. On the build box WebKit could not launch, so only `--project=desktop` ran there; a full e2e pass
with the phone project has not been done by this work. Baseline on untouched `origin/main` at `6566f5c`: check
passes with 9 warnings (all in one held post and the AO-073 post), build 261 pages in 18 s, 124 of 124 unit
tests.

**Design.** Tokens, type scale, card anatomy, chapter list and copy rules are in `DESIGN_BRIEF.md` sections 2, 3
and 8. Only fonts the site already ships. Day and night follow the site's `scene-mode` setting (`data-mode` on
`<html>`), so the visitor's choice carries across both views. The brief's hero (a centred framed box) was
written before Aaron asked for the 3D hero: the box stays, the 3D scene goes behind it.

**Reference images** are in `refs/` (a curated set; `refs/moodboard.md` describes every capture, including the
ones left on the box). `refs/scripts/` holds the Playwright capture scripts; their output paths point to the box.

**Prior art in the repo.** Post AO-018 (`src/content/posts/jefrie-in-3d.md`, listed) tells how Jefrie was made in
3D in September: TRELLIS.2 from one picture (a 685,000-triangle shell in 321 s), then rebuilt so it could bend.
Its models are in `public/media/jefrie-3d/` (`jefrie-headmerge.glb` 1.6 MB, `jefrie-v2.glb` 2.0 MB) with stills of
every stage. Read it before the hero work.

## 8. Hero pipeline: results and gotchas

Full detail: `status/hero-spike.md` (pipeline) and `docs/TEA_HERO.md` on `feat/alt-view-hero` (runtime).

**Stills.** Gemini `gemini-3-pro-image` (3 stills, then HTTP 402 on its billing cap) and xAI
`grok-imagine-image-2.0` image edits (6 stills), each from Aaron's reference art (on the box only) with a shared
"isolated subject on plain light grey, A-pose, no shadow" suffix. All nine are in `hero/stills/`; prompts in
`hero/tools/gen_stills_jobs.py`; contact sheets `hero/sheets/stills_a.jpg`, `stills_b.jpg`.

**Routes to TRELLIS, in the order tried:**
1. A hosted image-to-3D API: no key for one (no fal, Replicate, Hugging Face, Tripo, Meshy or Stability key).
2. The public Hugging Face Space `microsoft/TRELLIS.2`: refused on the anonymous ZeroGPU quota. It would work with
   a Hugging Face token, which we did not have.
3. A RunPod pod on the prebuilt 29 GB image `camenduru/trellis2:latest`: still pulling after 45 minutes, with no
   progress visible. Do not use big prebuilt images on pods.
4. **What worked:** a RunPod RTX 4090 (secure cloud; every 24 GB+ type was "Low" stock) on the cached
   `runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404` image plus `hero/tools/pod/boot.sh`, which installs
   camenduru's prebuilt cp312 wheels one at a time with `--no-deps` (all together they hit ResolutionImpossible),
   clones `camenduru/TRELLIS.2-hf`, and downloads ungated mirrors of the weights. Ready about 6 minutes after
   creation. `server.py` is a small token-guarded job server on port 8000 reached through the RunPod proxy; use
   submit then poll (the proxy cuts requests at about 100 s and drops some POSTs just after boot).

**Models** (raw GLBs 5.5 to 8.3 MB each, on the box only; sheets in `hero/sheets/chars_apose.jpg`,
`chars_leap.jpg`, `props.jpg`): Jefrie A-pose good (very dark textures, the tail curls in front of her feet);
Jefrie leap good (a strong pose-baked option); Yusef A-pose the best of the set; **Yusef leap failed** (a flat
bas-relief: wide-open wings in a three-quarter flying pose gave no depth cue); Echo A-pose good, Echo leap very
good; CRT, lantern and bell very good. The CRT's screen is one surface with the body, so the glow shader needs a
screen mask.

**Compression** (`hero/tools/compress.sh`, gltf-transform with meshopt and WebP; the runtime needs
`MeshoptDecoder`): Yusef 619 KB, CRT 237 KB, bell 171 KB pass. Lantern 703 KB, Echo leap 1.19 MB and Jefrie A-pose
1.36 MB are over target: TRELLIS's UV atlas has many seams and the simplifier stalls near 52k triangles. Fix: ask
TRELLIS's extractor for `dec=30000` and drop the metallicRoughness texture. The compressed files are in `hero/glb/`.

**Rig verdict:** a hybrid. Rigid named parts with pivots work for heads and arms; rigid tail segments show doubled
scales, so tails and wings need short skinned bone chains (built in the browser at load); whole-body bob, lean and
squash on top; pose-baked leap meshes for poses rotation cannot reach. Proven on Yusef (`hero/sheets/rig_test.jpg`:
a wing beat at about 0.2 rad per bone; at full amplitude the feathers shard, `rig_test_too_strong.jpg`). Not yet
tried on Jefrie's new model. Lab page: `hero/lab/` (serve the folder and open `index.html?rig=<name>&mode=live`).

**Runtime.** One JSON manifest, `public/tea/hero/manifest.json`, describes the picture layers, actors, props,
lights, glows, camera keys, scroll tracks and idle waves; tracks are deltas from the rest pose, so final assets
with a different rest pose keep working. Its format and the node naming convention for rigs are in
`docs/TEA_HERO.md`. Headless checks need Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist` (the branch's scripts pass these).

**Pods and cost.** Verified for this handoff through the RunPod API on 2026-11-10: the account has **no pods**,
and each of the four pods this work created (`vdz1yk8137gg6f`, `e9i3f2qwqzy9yx`, `pdv3f0gwb5d1be`,
`3c8oacy2gt6wlr`) returns "pod not found". The API's own billing records for those four pods total **USD 4.87**
(5.41 billed hours of RTX 4090 time with disk), of which about USD 3.40 is the working pod left idle for about
four hours after its jobs finished. Images: about USD 0.40 (Gemini) and about USD 0.42 (xAI), both estimates from
list prices. **Total about USD 5.69.** The account also holds one network volume that this work did not create;
it was not touched. Lesson: write the pod id to disk at creation and terminate the pod the moment its jobs return.

## 9. Keys (names only)

On the build box, keys came from `python3 ~/.claude/bin/getkey.py NAME` with `INFISICAL_CLIENT_ID` unset, read
inside scripts and never printed, written to disk, or placed in a URL. The cloud session needs its own way to
receive them (an open question for Aaron, section 11). Names used or offered:

| Name | For |
|---|---|
| `GITHUB_TOKEN` | clone and push (`git -c credential.helper='!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f' ...`), never in a remote URL |
| `RUNPOD` | GPU pods for TRELLIS |
| `GEMINI`, `XAI` | still-image generation |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | `npm run media:push` (not needed so far: the hero has no video or audio) |

The spike's tools ask `getkey.py` for `RUNPOD_API_KEY`, `GEMINI_API_KEY` and `XAI_API_KEY` (the short names
`RUNPOD`, `GEMINI`, `XAI` also resolved on the box). A Hugging Face token (`HF_TOKEN`) would open the free
TRELLIS.2 Space route; none was available. The phase 1 work and the runtime need no key beyond `GITHUB_TOKEN`.

The Higgsfield connector is not a key: it is available only in interactive claude.ai sessions. It is not part of
the plan (see section 11).

## 10. What stayed on the build box (not in this repo)

- `/workspace/ip_refs/` and `/workspace/jefrie_refs/`: Aaron's original World 1 and Jefrie reference art, and
  `/workspace/ip_*_still_0*.jpg`, `/workspace/ip_refs/eltv_*.jpg` for Evening Television. They were not copied
  here because this repository is public and they are not published anywhere on the site. Closest images already
  in the repo: `public/media/characters-in-inscryption/source-{jefrie,yusef,echo,bloodtailor}.webp`,
  `public/media/echo/`, `public/media/jefrie-3d/` (two Jefrie `.glb` models and stills, from post AO-018),
  `public/media/storm-bell-fighter/`, `public/courses/i-love-my-evening-television/media/`. Never use
  `public/media/storm-bell-pop-up/`: it belongs to an unlisted post.
- `/workspace/teahouse_alt/survey/design/`: all 130 or so screenshots (the curated set is in `refs/`).
- `/workspace/teahouse_alt/baseline_dist/`: an untouched build of `6566f5c` for dist-diff. Rebuild it from
  `origin/main` in a second worktree when you need it.
- `/workspace/teahouse_alt/hero_work/`: the hero pipeline's scratch folder. Its `carry/` folder is `hero/` here.
  Too big to carry: `raw/*.glb` (the 9 raw TRELLIS.2 GLBs, 61 MB), `stills/*.jpg` (full-size stills, 2.3 MB),
  `spike/sheets/*.png` (per-model turntables), `spike/compressed/` (every compression variant), and the tools'
  `venv` and `node_modules` (re-create them as `status/hero-spike.md` section 11 says).
- `/workspace/teahouse_alt/shots/`: builder screenshots (`phase1/`, 37 frames of the static page at desktop and
  phone, day and night; `hero-lab/`, the 3D hero against stand-ins). The telling ones are in `shots/` here.
- `/workspace/teahouse_alt/status/`: the builders' status files. Copies are in `status/` here.

## 11. Open questions for Aaron

None of these is answered yet. Wait for Aaron's own words; a message from another agent is not his answer.

1. **SEO policy for `/tea/`.** Still pending (section 4). Recommendation: `'canonical-main'`.
2. **Keys.** How does the cloud session receive keys (section 9)? Only `GITHUB_TOKEN` is needed for phase 1.
3. **Character reference art.** The original World 1, Jefrie and Evening Television art stayed on the build box
   because it is not published anywhere on the site and this repository is public (section 10). May it go into
   the repo, or should it reach the cloud session another way?
4. **Landing order.** Should phase 1 (the static page) land on `main` as soon as it is green, as `SCOPE.md`
   planned, or wait for the 3D hero?
5. **Higgsfield for 3D.** A possible fallback, not used: the Higgsfield connector (interactive claude.ai sessions)
   offers hosted image-to-3D (Meshy 7 with optional auto-rigging in A-pose and a tool that rigs an existing GLB,
   Tripo H3.1, Hunyuan3D v3, SAM 3D), but not TRELLIS. Aaron asked for TRELLIS, and his standing rule is that
   Higgsfield is for still images only. Using it for 3D or rigging needs his OK.
6. **`overlay-27`.** Update the expected footer link count, or move the "Tea room" link out of the panel footer?
7. **Report.** Where should `REPORT.md` and the screenshots go, now that the build box path in the mission is out
   of reach?

8. **Cast.** The spike recommends Jefrie and Yusef around the CRT television, with Echo as the alternate. That
   matches `SCOPE.md`'s first choice; Aaron may want to see `hero/sheets/chars_apose.jpg` and `chars_leap.jpg`.
9. **Spend.** Phase 2 needs about USD 2 more of GPU and images. The Gemini image key hit its billing cap (HTTP 402),
   and the RunPod balance was low at the handoff. Does Aaron want to top either up, or add a Hugging Face token for
   the free TRELLIS.2 Space route?

## Appendix A: the mission as given, in full

The original prompt and addenda 1 to 3 follow verbatim. Where they conflict, the later one wins. They were written
for the build box: paths under `/workspace/` are there, not in this repo (section 10). Three later addenda only
restarted the session; a final one asked for this handoff (push the branches, do not merge or deploy).

<!-- appendix-a: pasted by handoff_tools/append_appendix.py -->

### A.1 The original prompt (`PROMPT.md`)

~~~~markdown
# Mission: a second, alternate view of aaronorelup.com, live

You are the orchestrator (Claude Fable 5.2, X High effort, Fable advisor on). Aaron Orelup asked for this on a voice call on 2026-11-10.

## What to build
An **alternative view** of Aaron's site that people can visit, showing **the exact same information** as the main site (ledger posts, projects, now/setup, about, courses, etc.), and **linked both ways**: the main site links to the alternate view and the alternate view links back, so from either one a visitor can reach everything already built.
- It must use **the same markdown/content files** (the same Astro content collections and data modules) as the main site, so editing a post or the ledger in one place updates both. Strong preference: build it as a new route tree inside the same Astro repo (for example under `/tea/` or another name you choose with good reason), reading the same collections. Only if that's truly impractical, simplify to a single page of its own that still shows up-to-date information from the same sources.
- **Design reference:** the Shopify Editions Winter '26 page, https://www.shopify.com/editions/winter2026 (a text dump is in `/workspace/teahouse_alt/shopify_editions_winter26.md`; fetch the live page and study its layout too). Take the UI ideas: a huge amount of content made scannable through clear sections, bold section headers, many short "headline + one line" feature cards, rhythm, motion, confidence.
- **Aesthetic:** NOT a Renaissance aesthetic. Use Aaron's **tea house** aesthetic (the homepage's tea house scene: see `src/scripts/home/scene/` including `palette.js` day/night colours, `home.css`, `ARCHITECTURE.md`). You may also draw on the **I Love My Evening Television** series look (gentle maker/public-TV that turns uncanny at 8 PM; see the repo's lore/course content and any assets) and the **World 1 / Storm Bell Fighter** character art (Yusef, Echo, Bloodtailor). Reference stills on this box: `/workspace/ip_*` (e.g. ip_eltv_still_01.jpg, ip_yusef_still_01.jpg, ip_echo_still_01.jpg, ip_bloodtailor_still_01.jpg). Media for the site must go to R2 through the repo's own media flow (`npm run media:push`), not into git.
- **Scope:** just this alternate view. Do NOT rebuild or restyle the main site. Only touch main-site files as needed to add the link to the alternate view (and shared code if it is truly required, without changing main-site behavior).

## Repo and deploy rules (from the repo; read its CLAUDE.md, ARCHITECTURE.md, WRITING.md first and follow them)
- Work in a FRESH clone at `/workspace/teahouse_alt/blog` of github.com/aaronorelup/blog on a new branch, e.g. `feat/alt-view`. Do not work in `/workspace/blog` or `/workspace/blog-guitar-post` (another agent is using the latter and may push to main while you work).
- GitHub auth: `GITHUB_TOKEN=$(python3 ~/.claude/bin/getkey.py GITHUB_TOKEN)` (run with `INFISICAL_CLIENT_ID` unset), and use a one-off credential helper: `git -c credential.helper='!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f' clone/push ...`. Never write the token to disk, a remote URL, or a log. R2 keys are fetched the same way if `media:push` needs them.
- Only `main` deploys. To land: `npm run check`, `npm run build`, `npm test` (unit + e2e) all green; rebase on the latest `origin/main` right before pushing; `git push origin HEAD:main`; then confirm the deploy by checking the live site's `version.json` and the new URL returning 200. If the other agent landed first, rebase and re-run checks.
- Aaron approved pushing this live. Don't change DNS, Cloudflare settings, or secrets. Don't delete anything in R2.

## How to run the team (Anthropic's multi-agent orchestration guidance; full doc in `/workspace/teahouse_alt/multiagent_orchestration_doc.md`, read it)
- You orchestrate; you do not do the build work yourself. Keep your own context small: plan, delegate, review, integrate, decide.
- Delegate to **opus-builder** agents (Opus 5.5) for each well-scoped slice, with focused prompts and clear inputs/outputs. Opus builders may hand small mechanical pieces to **sonnet-helper** (Sonnet 5.5). Escalate hard calls up, not down.
- Good patterns: parallel fan-out of independent slices (e.g. design system + tokens, ledger index view, post view, other sections, linking + tests), specialization, and escalation. Avoid overlapping file ownership between parallel agents; give each slice its own files. Prefer few, long-lived agents you follow up with over many throwaway ones.
- Everyone shares one filesystem; you are responsible for integration and for the final checks.
- The advisor (Fable 5.2) is on for the session; consult it when setting the plan and before declaring done, and expect workers to do the same.

## Done means
1. The alternate view is live on aaronorelup.com at its URL (200), showing the same content as the main site from the same files, with links both ways.
2. All checks green, pushed to main, deploy confirmed via version.json.
3. Write `/workspace/teahouse_alt/REPORT.md`: live URL(s), what it shows, how it shares content with the main site, design choices (what came from Shopify, what from the tea house / Evening TV / World 1), the agent tree you used (how many Opus and Sonnet agents, what each did), problems and how they were solved, anything left undone, and desktop + phone screenshots saved under `/workspace/teahouse_alt/shots/`.
~~~~

### A.2 Addendum 1 (`ADDENDUM_1.md`)

~~~~markdown
# Update from Aaron (voice call, 2026-11-10 ~11:52 AM CT). These override or extend PROMPT.md.

You were briefly paused to receive this; continue from where you were (check the state of /workspace/teahouse_alt/blog first; the clone may be incomplete).

1. **Live sync is the goal.** The alternate tea-house view must stay tied to the existing live site: it updates automatically from the same source content and the same site architecture the main site already uses, so Aaron maintains exactly one place. Only if that turns out to be impractical, fall back to a separate snapshot page that is explicitly not maintained going forward (say so on the page and in the report).

2. **You (Fable 5.2) own the decisions.** Architecture, whether to stay in this one session or continue in additional sessions in sequence as needs arise, and scope (how much of the existing site's content carries into the tea-house view) are your calls. Aaron does not want to micromanage them. Decide, record the reasoning briefly in REPORT.md, and keep going.

3. **Write a scope inventory early, then keep building.** Before the build locks in, write `/workspace/teahouse_alt/SCOPE.md`: a concise inventory of the live site's current content and structure (sections, pages, content types, interactive pieces, feeds, special pages), and for each: transfers cleanly / needs rework / left out, with one line of why. Write it as soon as you've surveyed the repo and the live site (have an agent do the survey), then proceed on your own decisions without waiting for a reply.

4. **Hard operational rule: context.** Watch your own context-window usage. If it goes above 70%, either compact (/compact) or hand off to a fresh session to continue (write a HANDOFF.md with state, decisions, and next steps), whichever you judge better. Auto-compaction is also set to trigger at 70% for this session.
~~~~

### A.3 Addendum 2 (`ADDENDUM_2.md`)

~~~~markdown
Continue the build. Important fix: last run, you ended your turn while your two survey agents ran in the background, and in this headless (-p) mode ending the turn exits the process and kills them. From now on, never end your turn while any agent you spawned is still running. Run agents in the foreground or wait for their results before replying, and only end your turn when the whole job (per PROMPT.md's definition of done) is complete or truly blocked. Re-run the two surveys (reuse anything already in survey/).

SEO: Aaron is reviewing your canonical recommendation. Do NOT ship canonical, noindex, sitemap, or search-exclusion changes for /tea/ yet. Build it so that policy is a single, easy switch, and list it in SCOPE.md as awaiting Aaron. All other rules from PROMPT.md and ADDENDUM_1.md still apply (SCOPE.md early, the 70% context rule).
~~~~

### A.4 Addendum 3 (`ADDENDUM_3.md`)

~~~~markdown
New direction from Aaron for the HERO of /tea/ (he walked the Shopify Winter '26 Editions page). Copy its STRUCTURE, not its content. This is the top priority for visual quality.

1. Pipeline per hero character or object: generate a really good isolated image (a clean subject on a plain background), then turn it into a 3D model with TRELLIS (image-to-3D), then rig or pose it so it moves the way it should. The motion is a huge part of the effect.
2. Shopify's top of page has two 3D characters animated with a skateboard, in front of a background that is one picture placed in 3D space, so mouse movement parallaxes around it. Replicate that idea in the tea-house / I Love My Evening Television / World 1 aesthetic, not latte-and-shopping-bags trendiness. World 1 character references are in /workspace/ip_refs/ and the Jefrie refs are in /workspace/jefrie_refs/.
3. NO video model for any of it. Everything is real-time 3D (Three.js), animated as you scroll, in that 3D space. Aaron's standing rule: Higgs Field is OK for still images only, never video. For motion, prefer puppet rigging and Three.js 3D built from PNG assets.
4. Skip Shopify's pencil spin specifically. But include at least one moment where a character is actually animated in 3D space while the camera moves with the scroll, something of that difficulty.
5. The hero must be really high quality, at the very top of the page. Respect prefers-reduced-motion and the repo's page-weight budgets (lazy-load the 3D after first paint, and give a static poster fallback).

Keys: python3 ~/.claude/bin/getkey.py <NAME>, with INFISICAL_CLIENT_ID unset. Available: RUNPOD (GPU for TRELLIS), GEMINI and XAI (image generation), and others in Infisical ai-keys prod. Choose the cheapest reliable way to run TRELLIS (a RunPod pod or serverless, or a hosted TRELLIS API if you find one with a key we have). Log the cost. If you truly can't run TRELLIS, say why in SCOPE.md and use the closest image-to-3D alternative.

Put this into SCOPE.md and the build plan now, and write a short "HERO PLAN" section at the top of SCOPE.md saying how you're incorporating each of the 5 points. All earlier rules still hold (ADDENDUM_1, ADDENDUM_2: never end your turn while agents run, SEO switch held for Aaron, and the 70% context rule).
~~~~
