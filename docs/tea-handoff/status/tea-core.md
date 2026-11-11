> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. Of the screenshots named at the end, the six "most telling" are in `shots/` here under the same base names as JPEG (`.jpg`); the other 31 stayed on the box. `/workspace/teahouse_alt/baseline_dist` was an untouched build of `6566f5c`: rebuild one from `origin/main` in a second worktree when you need it.

# tea-core: phase 1 of the tea room (`/tea/`), status for the handoff

Branch `feat/alt-view`, based on `6566f5c` (`origin/main` at the start). Commits (local, not pushed):
`1b5e478` first build, `255251f` main-site links, `db10b95` fixes and ARCHITECTURE rows. The tree is clean.

## What is built and where

One long chaptered page at `/tea/` that shows the whole main site, live-synced from the same helpers:

| Piece | File | Source of its data |
|---|---|---|
| Page | `src/pages/tea/index.astro` | `listedPosts()` (never `allPosts()`), `notesBySlug()`, `START_HERE`, `projectsPage()`, `COURSES`, `nowSnapshots()`, `research()` |
| Layout | `src/layouts/TeaPage.astro` | shared `Head` read through `teaSeo()`; `styles/tea/tea.css`; `scripts/tea/rail.js` |
| Copy + SEO switch | `src/data/tea.js` | `TEA_BASE='/tea'`, `TEA_SEO='pending'`, `TEA_CANONICAL_TWIN='/'`, `teaSeo()`, `CHAPTERS`, `COPY` (all UI copy, inside the never-publish scan) |
| Shaping (pure) | `src/lib/tea.js` | `roman`, `plural`, `counterLine`, `postRow`, `ledgerByTopic`, `loreHub`, `projectHref` |
| Hero (static, permanent reduced-motion/no-WebGL path) | `src/components/tea/TeaHero.astro`, `TeaNight.astro` (SVG backdrop: night sky, moon, tea house with lit shoji, stone lantern, cherry trees; day mode = earlier bluer evening) | counter line computed: "73 posts · 41 projects · 2 courses" |
| Rail / phone strip | `TeaRail.astro` (includes the shared `ModeToggle`, so day/night follows `scene-mode` across both views) | `CHAPTERS` |
| Chapters | `TeaChapter`, `TeaBreath`, `TeaStart` (I), `TeaLedger` (II, all 73 posts by topic, 2 half cards + index rows each, notes links for the 11 notes), `TeaProjects` (III, all 41 in 5 sections), `TeaCourses` (IV, both courses with counts from `courseCounts`, 9 lore hub links with counts from lore data, C-03 slot), `TeaNow` (V, newest snapshot rendered in full via `renderEntry`, older ones linked, research rows), `TeaAbout` (VI, renders the main site's own `about/AboutView`, restyled under `.tea-about`), `TeaFooter` (utilities + footer) | as above |
| Cards / rows | `TeaPostCard`, `TeaProjectCard`, `TeaRow` | |
| CSS | `src/styles/tea/tea.css` (tokens, base, frame, rail, motion; imports `tokens.css`, never `site.css`), `cover.css` (hero), `chapters.css`, `sections.css` | |
| JS | `src/scripts/tea/rail.js` (current chapter as `aria-current`, strip scroll, one-time fade only below the fold, none under reduced motion) | |

Hero markup contract for the 3D agent (exact): `section.tea-hero#top[data-tea-hero] > .tea-hero-pin > .tea-hero-stage[data-tea-stage][aria-hidden]` (holds the SVG today; phase 2 mounts poster + canvas there) `+ .tea-hero-box` (skip link "Skip to the chapters", kicker, h1, statement, counter, chapter TOC with numerals, "Go to the main site" pill). Untouched and left for the 3D agent: `src/components/tea/hero/`, `src/scripts/tea/hero/`, `src/styles/tea/stage.css`, `public/tea/hero/`.

Main-site edits (the only ones): `Head.astro` optional `canonical?: string` (default = today's self URL); `sitemap.xml.js` appends `/tea/` only when `teaSeo().inSitemap`; `PanelChrome.astro` footer link "Tea room" after RSS; `src/pages/index.astro` gate card button "Everything on one page →" (`data-no-fly`). Plus tea rows in `ARCHITECTURE.md`. No package.json/lockfile change, no new dependency, no new glyph, no image files.

## Verified (2026-11-10, Node 24, on this box)

- `npm run check`: 0 errors, 9 warnings (the same 9 as baseline: AO-028 and AO-073 files).
- `npm run build`: pass, 262 pages (baseline 261, +`/tea/`), contracts hold, `stats-pages.txt` 338 (+`/tea/`).
- `npm test`: 124/124 pass (incl. fonts, budgets, contracts).
- dist-diff vs `/workspace/teahouse_alt/baseline_dist` (`node scripts/tools/dist-diff.mjs`): ADDED `tea/index.html`; CHANGED `stats-pages.txt` (one line `/tea/`, automatic); TEXT on 260 panel pages = only the footer's "Tea room" link, and `index.html` = footer + gate button. No MARKUP-only or ASSETS differences (no chunk re-split). `sitemap.xml` and `rss.xml` byte-identical; `about/index.html` and post pages differ only by the footer link.
- Budgets before → after: every row identical except "homepage before the scene" 22.6 → 22.7 KB (budget 30). Post page minus prose 20.5/20.0 KB (3% over, unchanged), chrome HTML 3.6/4.0 KB (unchanged at this rounding), ledger per row 351 B unchanged.
- `/tea/` SEO with `'pending'`: canonical `https://aaronorelup.com/tea/` (self), no robots meta, absent from sitemap, no `data-pagefind-body`. `teaSeo()` returns the SCOPE table for all four values.
- Links: all 222 internal hrefs on `/tea/` resolve to files in `dist/` (anchors to ids on the page); 73 distinct `/ledger/<slug>/` links = all listed posts; no unlisted or draft slug anywhere.
- Keyboard order: skip link, hero TOC, main-site pill, rail title, "Main site", rail chapters, utilities, mode toggle, then content. Rail marks the current chapter (checked after jumping to Projects).
- JS off: every section visible (0 hidden reveals), all rows and cards present. Reduced motion: nothing waits to fade, `scroll-behavior: auto`.
- e2e (desktop Chromium): `home-7/8/9`, `overlay-15`, `overlay-25` pass; `overlay-26` failed once in a 2-worker run and passed twice alone (a known load flake per the survey).
- Page weight: `/tea/` HTML 25.5 KB gz, CSS 8.3 KB gz, JS inline and small; images lazy.

## Not done / not verified / known issues

1. **`overlay-27` (phone project) will fail**: `tests/e2e/overlay.spec.mjs:649` asserts the panel footer has exactly `SOCIAL.length + 1` links; the "Tea room" link makes it +2. Not run here (WebKit cannot launch on this box). Not weakened, per brief: needs a decision (update the count to +2 in the verify slice, or move the link).
2. Two `h1`s on `/tea/`: `AboutView` carries its own `h1` "About me". It is kept (single source, main page unchanged) and visually hidden under `.tea-about` since the chapter word already says "About". If one `h1` matters, move About's copy to a data module both views read.
3. The phone strip holds the mode toggle (the strip's `backdrop-filter` makes it the toggle's containing block), so on a phone the toggle is not visible while the hero is on screen; it appears with the strip.
4. No unit or e2e tests for `/tea/` (the verify slice owns them). WebKit/phone not tested in a real browser engine beyond Chromium at 390x844.
5. The brief's Evening TV / Yusef stills (`/workspace/ip_*`) were not used: no new media; course plates reuse the existing `card` images.

## Next steps

1. Verify slice: unit tests for `src/lib/tea.js` and `teaSeo()`; e2e for `/tea/` (rail current chapter, no-JS, links resolve, no unlisted slugs, canonical/robots per switch); decide `overlay-27`.
2. Phase 2 (3D hero) mounts into `[data-tea-stage]` without changing the box markup.
3. Before landing: `git fetch origin && git rebase origin/main`, `npm run check && npm run build && npm test`, the e2e specs above, then Aaron's OK; SEO policy stays `'pending'` until he decides (one-line change in `src/data/tea.js`).

## Screenshots (`/workspace/teahouse_alt/shots/phase1/`, 37 files: desktop 1440x900 and phone 390x844, day and night, full page + hero, start, ledger, projects, courses, now, about, footer, plus a no-JS frame)

The six most telling: `desktop-night-hero.png`, `desktop-day-hero.png`, `desktop-night-start.png`, `desktop-day-ledger.png`, `desktop-night-courses.png`, `phone-night-hero.png`.
