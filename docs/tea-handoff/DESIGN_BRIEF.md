> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. `survey/design/moodboard.md` is `refs/moodboard.md` here and `survey/design/scripts/` is `refs/scripts/`. Of the screenshots named below, `desktop-37-shipping-b.png`, `desktop-45-footer.png` and the two `*-structure.json` files are in `refs/shopify/`; the rest of the roughly 130 captures stayed on the box. The `/workspace/ip_*` and `ip_refs/*` stills (original World 1 and Evening Television art) stayed on the box and were not used: see `HANDOFF.md` section 10. The hero described in this brief predates the 3D hero (Appendix A, addendum 3): the framed box stays, the 3D scene goes behind it.

# Design brief: the alternate view ("the tea room")

This brief is for the builders. It describes a second set of pages that show the main site's content (ledger, projects,
now, about, courses, research) as one long chaptered page. The structure comes from Shopify Editions Winter '26, and
everything you see comes from the tea house. Screenshots are listed in `survey/design/moodboard.md`. The scripts that
took them are in `survey/design/scripts/`.

**Evidence and gaps.** The Shopify page loaded fine in headless Chromium (HTTP 200, no blocking). Measurements come
from three sources: `shopify/desktop-structure.json` and `phone-structure.json` (heading sizes and positions, sticky
elements), the first-run scroll frames `desktop-scroll-001..022` (roughly the top third of the 54,200 px page), and the
chapter frames from 23 on. Chapter frames 01 to 22 are blank: they show the page's black geometric intro overlay, so
they are not cited. There is no full-page capture, and the phone frames stop at Agentic. All motion notes below are
**inferred** from stills, class names and repeated text, not watched.

## 1. What Shopify Editions does, as transferable patterns

**Skeleton, top to bottom (desktop 1440):**
1. **Thin fixed top bar**, 50 px: product name and edition on the left, an Editions dropdown, Search, and two links on
   the right.
2. **Hero:** full-bleed art with a centred framed box (340x464 px, 1 px line). Inside: the edition title at 32 px/700,
   a two-line statement ("A new world of commerce. 150+ product updates."), and the **chapter list as the table of
   contents**, 12 names at about 18 px/700 with tight leading, each with a roman numeral right-aligned (I to XII). The
   TOC *is* the hero.
3. **Persistent left rail** (an `aside`, fixed, 288 px wide, 20% of the width). The edition title sits top left. The
   same 12-item TOC is bottom-left at 18 px/700 with tight line-height. The current chapter is full ink with a dotted
   leader running to its numeral, and the others are greyed. Legal links sit at the bottom. All content starts at
   x=288 and runs to 1428 (a 1140 px column).
4. **Chapter opener:** a giant word (194 px/700, -0.03em tracking, line-height 0.9) over full-bleed art, then a lede
   at about 44 px in a serif with a swash initial. Each opener fills about 1.3 viewports.
5. **Sub-chapter header** ("Designs, refined"): a 44 px serif with a decorative initial, about 150 px tall, then a run
   of feature cards.
6. **Feature cards, in three sizes:**
   - **Hero feature:** a 32 px/700 headline, a 2 to 4 line serif lede at about 22 px, a small boxed "Read help doc ↗"
     chip, and a media plate (about 1140x600).
   - **Half cards:** 2-up at 563 px each with a 14 px gutter. Media plate (563x440), an 18 px/700 title, a 2-line
     description at 14 to 15 px in mid-grey, and the chip.
   - **Third cards:** a 3-up variant at 274 px for small features.
7. **"Headline + one line" index:** the densest pattern and the most useful for us. Two column pairs per row, each pair
   a bold 14 px title (178 px wide) plus a grey 14 px description (about 270 px wide), with about 56 to 70 px between
   rows. No media and no borders, on a slightly tinted panel. Every chapter ends with one, so the long tail of small
   updates is all on the page and costs little space (see `desktop-45-footer.png` and `desktop-37-shipping-b.png`).
8. **Interstitials:** between chapters, a black screen with thin geometric construction lines (circles, diagonals)
   around the framed box. It works as a breath and a reset.
9. **Footer:** a "Get notified" block and a list of past editions.

**Counters.** One number carries the hero ("150+ product updates"). Nothing else is counted, and that restraint keeps
it working.

**Type relationships.** Body 14 to 15 px. Card title 18 px/700. Feature headline 32 px. Serif lede 22 to 44 px. Chapter
word 194 px. The ratios run roughly 1 : 1.3 : 2.2 : 3 : 13. Two families: a grotesque for labels and headlines, and a
serif for ledes. Light ink on a tinted ground, and secondary text is grey, not smaller.

**Spacing rhythm.** Heavy vertical air: 100 to 200 px between card groups and a full viewport between chapters. A
14 px gutter inside grids. The left edge never moves (x=288).

**Motion (inferred).**
- The rail TOC highlights the current chapter as you scroll.
- Some panels are `position: sticky; top: 110px` with `min-height: 100svh`, so the media pins while the text passes.
- One marquee repeats its prompt cards (the text appears twice in the dump, so it loops).
- Chapter art fades or parallaxes behind the giant word.
- Hover changes are small, mostly on the chip.

**Phone (390).**
- The rail disappears. The top bar becomes 60 px with a hamburger.
- The hero keeps the framed TOC with numerals at 25 px side margins.
- The chapter word drops to 72 px/0.9.
- Everything goes to one column at 12 px side margins.
- Half cards stack with the media first.
- The headline+line index becomes one item per row, title over description, about 80 px per item.

**What we take:** the TOC-as-hero, the persistent rail TOC with a current-chapter marker, giant chapter words, the
three card sizes, the dense headline+line index closing each chapter, one hero counter line, interstitial breaths, and
a fixed left edge. **What we leave:** the art, the serif swash initials, the black geometric screens as styled, the
grey-on-cream low-contrast descriptions (they fail AA), and the copy.

## 2. Tea house tokens

**Where tokens live.** `tokens.css` is "the only source of colour". It defines each colour as a `--day-*`/`--night-*`
pair with `--pc-*` per mode, and `/stats` parses those strings. So:
- **Text and surfaces** use the existing `--pc-*` tokens. Add nothing there.
- **New tokens** go in **one new file**, `src/styles/tea.css`, loaded only by the tea pages. It follows the same pair
  pattern (`--day-tea-*` / `--night-tea-*` → `--tea-*` under `:root[data-mode='day']`).
- Scene colours come from `palette.js` (DAY / NIGHT).
- Two text colours are **derived** (not in either source) to pass AA on the day card. They are marked † below.

**Mode.** Night is the default. Day only when `localStorage['scene-mode'] === 'day'`, set before first paint by
`Head.astro`, which writes `data-mode="day"`. Reuse `chrome/ModeToggle.astro` and `scripts/mode.js` unchanged, so a
mode chosen on the main site carries over and the reverse. No tween: data-mode flips at once, as on panel pages.

| Role | Day | Night | Source |
|---|---|---|---|
| ground (page) | `#FBF3E8` | `#101220` | `--pc-page` |
| card surface (washi) | `#FFFBF5` | `#151726` | new `--tea-card` (day lightened from cream; night = `--night-bg` solid) |
| tile / index panel | `#F3E7D2` | `#201F2C` | `--pc-tile` (day = P.paper) |
| ink (titles, strong) | `#3A3A42` | `#F2E7D5` | `--pc-strong` (= P.ink by day) |
| body | `#4A4A50` | `#C9BCA9` | `--pc-body` |
| meta (dates, ids) | `#6B5E52` | `#9C917F` | `--pc-soft` (use this, not `--pc-quiet`, on cards) |
| display head (large only) | `#BE7A10` | `#F0C06A` | `--pc-head` |
| small head / kicker † | `#8F5A0C` | `#F0C06A` | new `--tea-kicker` |
| link / accent † | `#A34A2E` | `#E2795C` | new `--tea-link` (day = darkened P.vermilion) |
| wood (beams, joinery lines) | `#9A5F36` | `#A0703A` | new `--tea-wood` (P.woodDark / P.shojiLitEmis) |
| wood fill (decorative only) | `#C4874F` | `#3F2918` | new `--tea-wood-fill` (P.wood / NIGHT.woodDark) |
| shoji panel (featured) | `#FCEFC4` | `#2B2A3A` | new `--tea-shoji` (P.shojiLit / a night shoji) |
| lantern glow | `#F6DFA8` | `#FFD892` | new `--tea-lamp` (P.shoji / NIGHT.lampPaper), glows and active pills |
| wall pink (hover fill) | `#F0A6B8` | `#CE8CA4` at 18% | new `--tea-pink` (= `--home-pink` / P.petal night) |
| hairline | `#E2D5C0` | `#302E3E` | `--pc-line` (decorative, not for meaning) |

**Contrast (WCAG 2.x, computed).** AA needs 4.5 for body and small text, 3.0 for large text (24 px, or 18.7 px bold)
and UI lines.

| Text on surface | Day ground | Day card | Day tile | Day shoji | Night ground | Night card | Night tile | Night wood fill |
|---|---|---|---|---|---|---|---|---|
| ink | 10.2 | 10.9 | 9.2 | 9.8 | 15.2 | 14.5 | 13.3 | 11.1 |
| body | 8.0 | 8.5 | 7.2 | — | 10.0 | 9.5 | 8.7 | 7.3 |
| meta (soft) | 5.7 | 6.1 | 5.1 | 5.5 | 6.0 | 5.7 | 5.2 | **4.4 ✗** |
| kicker † / night head | 5.3 | 5.6 | 4.7 | 5.0 | 11.0 | 10.5 | 9.6 | — |
| link † / night accent | 5.3 | 5.7 | 4.8 | — | 6.3 | 6.0 | 5.5 | — |
| display head `BE7A10` | **3.2 large only** | 3.4 large only | 2.9 ✗ | ✗ | — | — | — | — |
| wood line (UI, 3:1) | 4.7 | 5.0 | — | — | 4.3 | 4.1 | — | — |

Rules that follow:
- Day `--pc-head` only at 24 px and up, never on tile or shoji.
- Day `--pc-accent` `#A85E2B` (4.44 on ground, 3.99 on card) and `--pc-quiet` (4.16 on card, and 4.37 on the night
  tile) are **not** used for small text. Use `--tea-link` and `--pc-soft` instead.
- The night wood fill takes ink and body only, never meta.
- Ink on wall pink is 5.8, so pink hover fills keep ink text.

**Type: shipped fonts only** (`fonts.json`). Zen Maru Gothic 500/700, Karla 400/600, JetBrains Mono 400/500/700.
- There are no italics, no Karla 700 and no serif webfont (`--font-serif` is system Georgia, which the post page
  already uses for ledes).
- Zen Maru Gothic ships only a handful of CJK glyphs (subset slices), so **no decorative Japanese text**.

| Use | Family / weight | Size (desktop → phone) | Line-height / tracking |
|---|---|---|---|
| Chapter word | Zen Maru Gothic 700 | `clamp(64px, 11vw, 168px)` | 0.92 / -0.02em |
| Hero title | Zen Maru Gothic 700 | `clamp(40px, 7vw, 76px)` (matches `.home-h1`) | 1.02 |
| Sub-chapter / section | Zen Maru Gothic 700 | `clamp(26px, 3vw, 36px)` | 1.1 |
| Feature card headline | Zen Maru Gothic 700 | 22 → 20 px | 1.2 |
| Card headline (grid, index) | Karla 600 | 16.5 → 16 px | 1.3 |
| Lede / one-line summary | Georgia (`--font-serif`) | 19 px lede, 15.5 px in cards | 1.5 |
| Body | Karla 400 | 15.5 px (`--text-body`) | 1.6 |
| Metadata (AO-077, date, count) | JetBrains Mono 400/500 | 12.5 px (`--text-sm`) | 1.4 / 0.02em |
| Kicker / rail labels | Karla 600 caps | 11.5 to 12.5 px | 0.14em (like `.home-hint`) |
| Rail TOC items | Karla 600 | 15 px, numerals in Mono 12 px | 1.35 |

**Spacing.** Use the existing scale (`--space-1..8`: 4, 8, 14, 18, 24, 34, 44, 60). Add `--tea-gap-chapter:
clamp(96px, 14vh, 160px)` and `--tea-gap-group: clamp(56px, 8vh, 96px)`. The grid gutter is `--space-3` (14 px), the
same gutter as Shopify. The content column is `min(1140px, 100% - 2*clamp(18px, 5vw, 48px))`, and its left edge is
fixed beside the rail.

**Radius.** Cards `--radius-m` (10 px), featured plates `--radius-l` (24 px, like `.home-card`), pills
`--radius-pill`. Icons 8 px (as on the ledger).

**Line, shadow and motif language** (pure CSS or inline SVG, no image files):
- **Shoji grid:** the featured panel's background is a `repeating-linear-gradient` lattice in `--tea-wood` at 6%
  opacity (1 px bars every 28 px). It appears behind the hero TOC box and behind START_HERE picks, nowhere else.
- **Wood joinery:** chapter rules are a 2 px `--tea-wood` line with a small square tenon (a 6x6 px block) at the left
  end. Card borders are 1 px `--pc-line`, turning to `--tea-wood` on hover.
- **Noren curtain:** the chapter opener's kicker hangs from the top rule as 3 to 5 short vertical panels (CSS
  `linear-gradient` stripes in `--tea-wood-fill` with 2 px gaps) carrying the chapter numeral.
- **Lantern:** the current item in the rail, the active filter pill and focus rings take `--tea-lamp` with a soft
  `box-shadow: 0 0 14px` glow at night (like the home toggle knob). No glow by day.
- **Shadows:** cards are flat at rest. Featured plates use `--home-shadow` values. No other elevation.
- **Petals:** none. They belong to the 3D scene.

**Iconography.**
- Reuse what exists: the post icons `public/media/icons/<id>-96.webp` (and 256), the topic glyphs from
  `chrome/Glyph.astro` (film, brush, cube, pad, agent, book, house), and the 640x360 preview images and verdict stamps.
- Arrows are text (→ ↗), which Karla and Zen Maru cover.
- No new icon set.

## 3. Page blueprint: the index

**URL: `/tea/`.** It is short, lowercase, names the aesthetic and collides with nothing. `public/` has courses, games,
gauntlet, labs, ledger, media, og, presentations and tools. `src/pages` has ask, now, read, research, search, stats and
the rest. The alternative is `/room/`, a little less clear. Sub-pages nest as `/tea/<slug>/`. Nothing in the design
assumes the pages are or are not indexed: canonical, noindex and sitemap stay one switch.

**Layout frame (desktop ≥ 1024).**
- A fixed left rail, 248 px. Top: "Aaron's tea room" in Zen Maru 700 20 px and "← Main site". Middle and bottom: the
  chapter TOC with numerals, the current chapter in ink with a dotted wood leader and a lantern dot. Bottom: the mode
  toggle and the utility links.
- Content to the right in a column up to 1140 px.
- **1024 to 1280:** rail 200 px.
- **Under 1024:** the rail becomes a **sticky top strip** (56 px) holding "← Main site", a horizontally scrolling
  chapter list (snap, current item lantern-filled) and the mode toggle. No hamburger, so every chapter link is always
  in the DOM and visible.

**Hero (one viewport, not more).** A centred framed box (1 px `--tea-wood`, a shoji lattice inside at 6%), about
520 px wide:
- Kicker: "THE TEA ROOM".
- Title: "Everything on one page".
- Statement: one line (§8).
- Counter line in Mono: "73 posts · 41 projects · 2 courses". These are **computed at build** from
  `listedPosts()` / `isListed`, `projects()` and `COURSES`, never typed in. Drafts and unlisted posts never count and
  never show.
- The chapter TOC with numerals, as in Editions.
- A clear pill button: "Go to the main site →" (`/`).
- Phone: the same box at full width minus 18 px margins, with the TOC kept.

**Chapters** (order and treatment):

| # | Chapter (nav label) | Content | Header | Card pattern | Desktop / phone |
|---|---|---|---|---|---|
| I | Start here | `START_HERE` (5 picks) | Giant word plus a one-line lede | **Feature card**: 256 px icon or preview image, verdict stamp, title, summary, AO-id · date · topic | 5 across at 1280+ (or 2 large + 3), shoji panel behind. Phone: 1 column, image left 96 px |
| II | The ledger | All listed posts, **grouped by the 7 topics** (agents 23, video 15, learning 12, games 7, art 6, 3d 5, site 5 today). Months are metadata only: every post is Aug to Nov 2026 | Giant word plus a topic sub-nav (anchor pills with counts, plain links) | Per topic: up to 2 **half cards** (newest or picked) with preview image, then the **headline+line index** for the rest: `AO-077` (Mono) · title (Karla 600) · summary clamped to 1 line · date | Index 2 pairs per row at 1280+, 1 pair per row 720 to 1280, stacked on phone. Each topic opens with its glyph and "Working with AI agents · 23" |
| III | Projects | 41 projects in their 5 sections: Play it here, Download it, Watch, Read about it, Stopped | Giant word plus a section sub-nav | Play/Watch: **half cards** with the project `image`, `name`, `line`, main link. Download, Read, Stopped: index rows (name · line · since) | 2-up / 1-up. Stopped in the quietest style (meta colour titles still ≥ 4.5) |
| IV | Courses | The Hidden Curriculum (C-01), I Love My Evening Television (C-02) | Giant word | Two **wide plates** side by side: course art (C-01 already has the tea-house night plate), code, title, tagline, lesson/lore counts from data | 2-up → stacked. The only place Evening TV art appears (§6) |
| V | Now | The latest now snapshot plus the setup, with Research folded in (1 item) | Sub-chapter size, not a giant word (thin content) | Snapshot summary plus its headings as an index; research rendered as one index row "Research notes" | 1 column, max 720 |
| VI | About | Who Aaron is, contact, social | Sub-chapter size | A small card with the avatar coin image (static), 2 paragraphs, social pills | 1 column |
| — | Utilities | Search, Ask Goobie, Stats, RSS | No header: a footer row | Plain links | Wrap |

**Interstitials.** Between chapters, a 30 to 40vh breath: a full-width shoji lattice band in `--tea-tile`, the chapter's
numeral in Mono, and nothing else. It replaces Shopify's black geometric screens. Use it only before II, III and IV.

**Card anatomy (all cards are `<a>` blocks or contain one main link).**
- **Feature:** image plate 16:9 (preview 640x360) or 1:1 icon, radius 10. Verdict stamp (the ledger's outlined caps
  pill). Title in Zen Maru 700 20 to 22 px. Summary in serif 15.5 px, 3 lines max. Meta row in Mono.
- **Half:** the same with a 16:9 plate and a 2-line summary.
- **Index row:** no border. Title 16.5 px Karla 600 in ink, one-line summary in `--pc-body` (not grey-on-grey, the
  Shopify failure), Mono meta in `--pc-soft`. Row padding 14 px with a 1 px `--pc-line` top rule.
- **Hover (pointer only):** title turns `--tea-link`, the border/rule turns `--tea-wood`, and a 3 px lantern bar grows
  on the left (`scaleY` 0→1, 160 ms). No lift and no image zoom.
- **Hover preview cards:** do not show the main site's hover-card callouts here. The index is for scanning.
- Every card links to the post's own page (main site or `/tea/<slug>/`, see §4).

**Footer.** A wood rule with a tenon, then:
- "Go to the main site →" (big pill).
- The main NAV links (Ledger, Courses, Projects, About, Now, Stats).
- Utilities (Search, Ask, RSS).
- SOCIAL from `site.js`.
- The copyright line as on the main site.

## 4. Sub-pages (if posts are shown under `/tea/`)

- **Render the same post body** with `prose.css` and the post's own components untouched. The tea view only changes the
  frame around it. Components carry their own styles and must not inherit tea tokens beyond `--pc-*`, which they
  already read.
- **Frame:**
  - The same rail (or top strip on phone), with the current chapter "The ledger" and the post's topic highlighted.
  - The reading column stays as the main site's (max 720 px, `--font-body` 15.5/1.6) so wide components keep their
    width.
- **Header:**
  - A Mono kicker "AO-045 · Oct 11, 2026 · 4 min".
  - The title in Zen Maru 700 `clamp(30px, 4vw, 44px)` (`--text-h1`).
  - The summary in serif 19 px.
  - The verdict stamp and takeaway in a shoji panel (lattice at 6%) instead of the plain rule.
  - A "Read this on the main site →" link next to the meta.
- **Footer:** older/newer (`olderNewer`), 3 related (`related`) as index rows, and "Back to the tea room".
- Do not restyle `<details>`, code blocks or `<ao-*>` elements.

## 5. Motion and accessibility

**Animation (CSS first, one small module at most):**
- **Rail current-chapter marker:** one `IntersectionObserver` on chapter `<section>`s sets `aria-current="true"` on the
  matching rail link (in a plain module or a custom element, `<tea-rail>`). Without JS the rail still works as anchors.
- **Reveal:** opt-in through `html.js .tea-reveal` (fade 0→1, `translateY(12px)→0`, 420 ms `--ease-panel`), triggered
  by the same observer. **Content is visible by default.** The hidden state only applies once JS has added the class,
  and the `.no-js` path shows everything.
- **Sticky:** the rail is `position: sticky/fixed` and the phone strip is `position: sticky; top: 0`. The feature
  plate pins inside Start here (`position: sticky; top: 96px`) on desktop only. No scroll-jacking and no canvas.
- **Hover:** the lantern bar and colour changes, 160 ms.
- **No marquees.**

**`prefers-reduced-motion: reduce`:** no reveal transforms or fades (content static), no smooth scroll
(`scroll-behavior: auto`), glow kept and transitions 0 ms.

**Focus:** `:focus-visible { outline: 3px solid var(--pc-head); outline-offset: 3px; }`, the site's existing pattern.
- On night ground that is 11:1. On day ground `#BE7A10` is 3.2:1, which passes the 3:1 for UI.
- Card links show the outline around the whole card.

**Keyboard path:**
1. Skip link ("Skip to the chapters", `--z-skip`).
2. "← Main site".
3. The rail chapter links, in order.
4. The mode toggle.
5. The hero's main-site button.
6. The content in source order.

Chapter targets are `<section id="ledger" tabindex="-1" aria-labelledby>` with `scroll-margin-top` equal to the strip
height on phone. The rail is a `<nav aria-label="Chapters">` with an ordered list. Numerals are `aria-hidden`.

**Semantics:** one `h1` (hero). The chapter word is an `h2`, topic and section heads are `h3`, card titles `h3`/`h4`
inside lists. Counts are in text, not only in pills.

**No-JS:** everything renders and every link works. The only losses are the current-chapter marker and the reveal.

## 6. Evening Television and World 1 art

Keep it to **two places**, so the tea room stays one room.

1. **Courses chapter, C-02 plate:** `/workspace/ip_eltv_still_02.jpg`, the old CRT with the green screen and the
   origami animals under a warm lamp.
   - It is the series' "gentle, then 8 PM" mood in one frame, and its lamp matches our lantern.
   - Crop 16:9 centred on the TV and lamp.
   - Treatment in CSS only:
     - 2 px scanlines (`repeating-linear-gradient` at 8% black) over the image.
     - A rounded "CRT" radius of 18 px with an inner vignette shadow.
     - A Mono caption chip "8:00 PM".
   - By day the plate sits on the shoji panel. By night, add a faint green glow (`#7BE08A` at 12%, `box-shadow`
     only, decorative).
   - Alternative: `ip_eltv_still_01.jpg` (moon base, chess robot, lamp) if a less eerie frame is wanted. The lore
     course page's episode stills already exist on the site and can be reused instead of new media.
   - C-01 keeps its existing tea-house night plate (`/courses/the-hidden-curriculum/engine/assets/teahouse-night.jpg`).
2. **Projects chapter, one World 1 strip on the Storm Bell Fighter card** (a START_HERE post, so these characters are
   public):
   - **Use** `/workspace/ip_yusef_still_01.jpg` cropped to the right two thirds: Yusef's lantern and the lit water.
     The lantern is our motif. Strip 21:9 at the top of that project's half card.
   - **Optional, night mode only:** a small portrait crop of `ip_refs/world1_echo.jpg`, the bell helmet and shoulders
     only, cropped above the hand-bell.
   - **Do not use:** the Bloodtailor stills (blood, menace) or any frame with the dripping bell or the red-eyed crowds
     in the visible crop. WRITING.md says nothing violent or gory in a card. Captions use only the character's public
     name and the game's name.

**Media flow:** none of these go in git. Serve them through the site's media flow (the survey agent documents it;
`docs/MEDIA.md`). The sources are 1280x720 (portraits 864x1152), so **do not upscale**:

| File | Output | Weight |
|---|---|---|
| `ip_eltv_still_02.jpg` | 1280w and 640w AVIF + WebP, 16:9 | 1280w ≤ 140 KB, 640w ≤ 45 KB |
| `ip_yusef_still_01.jpg` crop | 1280x548 and 640x274, AVIF + WebP | ≤ 110 KB / ≤ 35 KB |
| `ip_refs/world1_echo.jpg` crop (optional) | 480x480 and 240x240, AVIF + WebP | ≤ 40 KB / ≤ 15 KB |

All images need `width`/`height`, `loading="lazy"` (none is above the fold) and descriptive alt text.

## 7. Do-not list

- No Renaissance look: no classical paintings, swash serif initials, gilt or construction-line geometry screens.
- No Shopify branding, artwork, fonts (Neue Montreal, HW Cigars, Inter), copy or the word "Edition".
- No new webfonts. Only the shipped Zen Maru Gothic, Karla and JetBrains Mono, plus system Georgia.
- No decorative Japanese characters (no glyph coverage), and no fake-Japanese ornaments.
- No glyph outside the shipped slices. `tests/unit/fonts.test.mjs` fails on any new code point (see SITE_SURVEY.md).
  These are safe because they are already in use: `→` `←` `↗` (Zen Maru slices) and `·` (Latin). Draw dotted leaders,
  numerals' dots and ornaments in CSS, not as characters.
- Keep all tea copy in `src/data/tea.js`, which the never-publish check scans. Copy inside `src/components/tea/` is
  not scanned.
- No content hidden behind interactions that fail without JS: no tabs-only, accordion-only or carousel-only content,
  and no reveal that starts hidden without JS.
- No changes to the main site's pages, `tokens.css` values, the homepage scene, chrome or components. The tea view
  adds files and reuses components.
- No hard-coded counts, and no draft or unlisted post anywhere (lists, counts, cards, feeds).
- No edits to `public/courses/**`, `src/data/courses/*.json`, `src/data/lore/*.json` or anything AO-073.
- No Three.js or canvas on tea pages, no scroll-jacking, no autoplaying video or sound.
- No gory crops, and no character backstory beyond what is public.
- No design that depends on the tea pages being indexed or not.

## 8. Copy

**Rules from WRITING.md and `banned-phrases.js` for headings and microcopy:**
1. Headings are plain labels that name the thing. No hooks, puns or teasers.
2. Aaron's voice: first person, casual, short sentences, contractions, plain words.
3. **No em dashes.** Plain hyphens and straight quotes. No semicolons, few colons, no stacked parentheses.
4. No exclamation marks, no emoji.
5. Banned: incredible, powerful, game-changing, seamless, unlock, leverage, delve, "let's dive", "buckle up",
   "here's the thing", "it turns out", "in this post", "spoiler:", "the short answer", "TL;DR", "you can skim".
6. No two-sentence contrast flip, no cheekiness, no telling the reader how to read the page.
7. Name things the way a newcomer would ("my AI-made TV series", not "C-02" alone).
8. Keep numbers that matter, from data. Don't invent any.
9. Humour only as a trailing aside, said plainly.
10. Never the never-publish items: no job, employer, money, keys or private links.

**Drafts:**
- Hero kicker: "THE TEA ROOM"
- Hero title: "Everything on one page"
- Hero line: "Every post, project and course from my tea house, laid out on one long page so you can see it all at once."
- Counter: "73 posts · 41 projects · 2 courses" (computed)
- Hero button: "Go to the main site →"
- Rail title: "Aaron's tea room". Back link: "← Main site"
- Chapters and nav labels (nav label first, then the chapter lede):
  - I **Start here**: "Five posts to read first."
  - II **The ledger**: "Everything I've written about learning AI, sorted by topic."
  - III **Projects**: "Everything I've made or am making, sorted by what you can do with it."
  - IV **Courses**: "Two courses. One on building with AI, one on the world of my TV series."
  - V **Now**: "What I'm working on this month, and the setup I use."
  - VI **About**: "Who I am and where to find me."
- Utility row: "Search" · "Ask Goobie" · "Stats" · "RSS"
- Footer: "This is the long view of aaronorelup.com. The tea house is the front door." Then "Go to the main site →".
- Post sub-page: "Read this on the main site →" · "Back to the tea room"
