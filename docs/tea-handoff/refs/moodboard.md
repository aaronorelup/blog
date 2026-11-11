> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. This is the moodboard of the full capture set (about 130 files, on the box under `/workspace/teahouse_alt/survey/design/`). Only the files present in `refs/shopify/` and `refs/teahouse/` here were carried over; the larger Shopify PNGs were re-encoded as JPEG under the same base name to keep this folder small. The scripts in `refs/scripts/` write to box paths.

# Moodboard: screenshots for the alternate view

Captured 2026-11-10 with Playwright 1.64 (Chromium headless), at 1440x900 desktop and 390x844 phone. The scripts are
in `scripts/`.

## shopify/ (layout reference: www.shopify.com/editions/winter2026)

The page loaded fine headless (HTTP 200). There is no full-page capture: the page is 54,200 px tall and the first run
crashed the tab at about 17,000 px.

- `desktop-00-firstview.png`: hero. Painted art, the centred framed box with the edition title, "150+ product updates"
  and the 12-chapter TOC with roman numerals.
- `desktop-scroll-001..022.png`: a continuous scroll of the top third (hero, Sidekick, Agentic, the start of Online).
  The useful ones:
  - `003`: giant "Sidekick" chapter word, with the fixed left rail and TOC appearing.
  - `008`: half-card pair plus the "Designs, refined" sub-chapter header and the rail's current-chapter marker.
  - `012`: half cards and the start of the 2x(title | line) index.
  - `015`: a hero feature (headline, lede, chip, media).
  - `004..022`: more card runs and sticky media.
- `desktop-01..22-*.png`: **blank for our purposes.** They show the page's black geometric intro overlay (construction
  lines around the framed title), not chapter content. Only `desktop-14-online-c` and `desktop-19-marketing-b` were
  viewed, as examples of that overlay.
- `desktop-23..41-*.png`: chapter frames, Checkout to Developer.
  - `31-b2b-b`: dark chapter lede over a light half-card grid.
  - `37-shipping-b`: the headline+line index on a tinted panel, then a black interstitial.
  - `40-developer-b`: a hero feature on a light ground with the rail's active item (Developer XII).
  - The rest show more card and index runs.
- `desktop-42..44-get-notified-*.png`, `desktop-45-footer.png`: end of the page. `45` is the Developer index (two
  title|line pairs per row) above the footer.
- `phone-01-hero.png`: phone hero. The framed TOC is kept at full width.
- `phone-02..05-*.png`, `phone-07`: hero scroll and chapter frames, not individually reviewed (judged by file size and
  neighbours).
- `phone-06-sidekick-a.png`: phone chapter opener, 72 px chapter word, serif lede, media below.
- `phone-08-sidekick-c.png`: phone feature card stacked (title, lede, chip, then media).
- `phone-09-agentic-a.png`: transition frame. The phone capture stops here.
- `desktop-structure.json`, `phone-structure.json`: headings with sizes, fonts and positions, plus the sticky and fixed
  elements (the 288 px fixed aside, `sticky top-110` panels).

## teahouse/ (aaronorelup.com, the main site)

Night is the default. Day was forced by setting `localStorage['scene-mode']='day'` before load. Panel pages scroll
inside their own container, so the `*-scrolled.png` frames match the unscrolled ones (duplicates, ignore).

- `desktop-night-home.png` / `desktop-day-home.png`: the tea house scene and its hero card ("Aaron Orelup", the coin
  avatar, the welcome lines, the stop rail at right).
- `desktop-{night,day}-home-stop1..3.png`: the next camera stops. `night-stop2` is the lantern-lit interior with the
  "The Ledger & Courses" card, the best night palette reference.
- `phone-{night,day}-home.png`, `phone-{night,day}-home-stop1..3.png`: the same scene at 390.
- `desktop-{night,day}-ledger.png`: the ledger. Title, search, START HERE icons with verdict stamps, topic and project
  pills with counts, month groups.
- `phone-{night,day}-ledger.png`: the phone ledger. The nav wraps under "Back to the tea house", and the picks scroll
  sideways.
- `desktop-{night,day}-post.png`, `phone-night-post.png`: a post (AO-045 Crimson Coil). Icon, Mono meta, pills, Zen
  Maru title, serif summary, the "short version" verdict block.
- `desktop-{night,day}-projects.png`: projects. Section counters (Play it here 12 ...), the showreel and the card row.
- `desktop-{night,day}-now.png`: the now page.
- `desktop-{night,day}-about.png`: about.
- `desktop-{night,day}-courses.png`: the courses list.
- `desktop-{night,day}-eltv-course.png`: the Evening Television lore course. Dark glass, a serif title, Mono stats,
  episode stills with labels.

## Art references viewed (not copied; on this box only)

- `/workspace/ip_eltv_still_01.jpg`: a moon base, a girl, a chess robot "PAWN", a warm lamp and a CRT.
- `/workspace/ip_eltv_still_02.jpg`: a CRT with a green screen, origami animals and a lamp. **Recommended** for the
  Courses plate.
- `/workspace/ip_refs/eltv_family_thread.jpg`: a habitat corridor with a child's drawing.
- `/workspace/ip_yusef_still_01.jpg`, `ip_refs/world1_yusef.jpg`: Yusef, a winged figure with a lantern by a river.
  **Recommended**, cropped to the lantern.
- `/workspace/ip_echo_still_01.jpg`, `ip_refs/world1_echo.jpg`: Echo, bell-helmeted, in a trench. A head crop only,
  optional.
- `/workspace/ip_bloodtailor_still_01.jpg`: Bloodtailor, red cloak and chains, blood. **Not recommended.**
- `/workspace/ip_refs/world1_town_darkness_river.jpg`: a town against a sea of red eyes. Too dark for the tea room.
