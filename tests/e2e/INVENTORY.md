# Behaviour inventory

Every bespoke behaviour of the site, the pages that use it and the check that holds it. Rows come from the code:
each `addEventListener` and each documented attribute of a component has one (`src/elements/**`,
`src/scripts/home-scene.js`, `src/scripts/cards/`, `src/scripts/ledger/`, `src/scripts/search/`,
`src/scripts/post/highlight.js`, the inline scripts of the standalone pages). A spec id is the start of a test title
(`npm run e2e -- -g core-4`). Unless a row says otherwise it passes on both projects, `desktop` (Chromium 1440×900)
and `phone` (WebKit, iPhone 13).

The pages listed are those of the build this was written from; the specs don't read this list. They take their
pages from `tests/e2e/targets.json`, which `scripts/tools/element-usage.mjs` rewrites from `dist/` before every run,
and never pick a live notebook (AO-073, `src/data/exempt.js`). A row whose behaviour is broken on `main` is a
`test.fail()` and says why under "Broken on main". No row is loosened to get green (P step 9).

## Core: one player at a time (`core.spec.mjs`)

Pages: any post with media; groups are `ao-compare[sync]`, `ao-cues`, `ao-listen`, `ao-game`; the iframes are the
HLS player pages in `still-on-shift-concept`, `still-on-shift-music-video`, `crimson-coil`, `earthlight`.

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Starting a lone player pauses the one playing | document `play` (capture) → claim | core-1 |
| A sync group plays together; a lone player pauses it | `GROUPS`, claim | core-2 |
| A second group pauses the first | claim, `ao-listen-play` | core-3 |
| A silent player scrolled away pauses, and resumes when back | IntersectionObserver → onSight | core-4 |
| An audible player scrolled away keeps playing; the bar shows title and clock | onSight, document `pause` `ended` `timeupdate` `volumechange` → nowPlaying.update | core-5 |
| The bar's toggle pauses and plays | `.ao-np-toggle` click | core-6 |
| Back to it scrolls the player into view; close stops it and hides the bar | `.ao-np-back`, `.ao-np-close` click | core-7 |
| `ao-stop` stops everything | document `ao-stop` | core-8 |
| A same-origin iframe is a player: playing in one pauses another | document `load` (capture) → hookFrame, frame `play` | core-9 |
| An embedded player and the post's player pause each other | frame `play`, claim's frame loop | core-10 |
| An embedded player with sound scrolled away keeps playing, with the bar | frame `pause` `ended` `timeupdate` → bar | core-11 |

## The image viewer (`viewer.spec.mjs`)

Pages: every post with pictures; the spec uses the first page with `data-full` pictures (`crimson-coil` and its
notes, `earthlight`'s notes, `nine-claudes-one-painting` today).

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A click opens the picture, counted among the post's pictures | document `click` → open | viewer-1 |
| Enter or Space on a focused picture opens it; enhance() makes pictures focusable buttons | document `keydown`, `enhance()` | viewer-2 |
| Arrows, Home, End and the side buttons page, wrapping at the ends | dialog `keydown`, dialog `click` (`prev`, `next`) | viewer-3 |
| + = − 1 0 zoom, actual size and fit; PageDown and PageUp page | dialog `keydown` | viewer-4 |
| The wheel zooms around the pointer | dialog `wheel` | viewer-4b (desktop: a phone has no wheel) |
| A click on the picture zooms there, a drag pans, a click fits, a click beside it closes | stage `pointerdown` `pointermove` `pointerup` | viewer-5 (desktop: mouse) |
| A double tap zooms | stage pointer events, touch | viewer-6 (phone) |
| A pinch zooms | stage pointer events, two touches | viewer-7 (desktop project, touch sent through the Chromium DevTools protocol; real devices: Aaron's list) |
| Esc closes; Back closes without leaving the post | dialog `cancel` `close`, window `popstate`, history entry | viewer-8 |
| `data-full` is the file fetched and linked (on the first of those pages where such a picture opens in the viewer) | `data-full` | viewer-9 |
| Pictures in links, buttons, `ao-slider`, `ao-pan`, `ao-model`, `ao-game`, `ao-listen`, `[data-no-zoom]` keep their own click | `NO_VIEWER` | viewer-10 |
| The toolbar zooms in, out, fits, links the file, closes | dialog `click` (`in`, `out`, `fit`, `close`) | viewer-11 (a phone hides + and −, by design) |
| `ao-stop` closes it | document `ao-stop` | viewer-12 |
| A swipe sideways pages, a swipe down closes | stage pointer events, one touch | viewer-13 (desktop project through the DevTools protocol, as viewer-7) |
| A resize keeps the picture the size it was on screen; fit then fits the new window | window `resize` → layout(keep) | viewer-14 |

## Components (`elements/*.spec.mjs`)

### `ao-compare`: ai-rigging-vs-a-script, bad-very-bad, characters-in-inscryption, context-window, crimson-coil, earthlight, echo-the-borrowed-voice, every-video-can-seek, jefrie-in-3d, jefrie-lora, modding-megabonk, moonlight-five-times, moonlight-in-code, moonlight-two-cuts, nine-claudes-one-painting, paper-jefrie, props-three-budgets, showreel-rebuilt, still-on-shift-music-video, storm-bell-fighter, storm-bell-pop-up, the-missing-map, touch-move, wallpapers-nobody-saw

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| `cols` and `aspect` shape the grid | `cols`, `aspect` | compare-1 |
| `sync`: play and pause in step | `sync`, `play` `pause` (capture) | compare-2 |
| `sync`: a seek moves every video | `seeked` (capture) | compare-3 |

### `ao-model`: jefrie-in-3d, props-three-budgets

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Poster and a button naming `size` until the click; then three.js, the GLB (`src`) and a canvas that draws | `poster`, `size`, `label`, `src`, button `click` | model-1 |
| A drag turns it, stops the turning and drops the hint | OrbitControls `start` | model-2 |
| Leaving the page frees the GPU; coming back renders again | `disconnectedCallback` | overlay-3 |
| `ratio="wide"` | `ratio` | not used by any page today; resize() reads it |

### `ao-timeline`: every-video-can-seek, opus-55-on-x-alone, showreel-rebuilt, storm-bell-fighter, the-branch-that-went-live, the-confession-that-spread, the-planted-lie, wallpapers-nobody-saw

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| One legend entry per lane, each event on its lane's rail, with its lane named | `lanes`, `data-lane` | timeline-1 |
| A view button dims what that party couldn't see; Everything restores | `views`, `data-in`, button `click` | timeline-2 |

### `ao-game`: loom-and-information-flow (`/labs/mini-loom/`, `/labs/info-flow/`), storm-bell-fighter (`/games/storm-bell/`); AO-073's labs are left out

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Poster and Play (with `size`) until the click; then the game's page (`src`) in a frame, Fullscreen and Stop shown | `src`, `poster`, `size`, `label`, `note`, `aspect`, Play `click`, frame `load` | game-1 |
| Scrolled away it pauses behind a veil; the veil resumes it | IntersectionObserver, veil `click` | game-2, game-6 |
| Another player pauses it; resuming pauses the other | document `ao-listen-play`, claim | game-3 |
| `ao-stop` and a hidden tab pause it | document `ao-stop`, `visibilitychange` | game-4 (wording: see below) |
| Stop unloads it; Play again reloads; the own-tab link unloads it | Stop `click`, link `click` | game-5 |
| Every embedded game loads and pauses off screen | per target | game-6 |
| Fullscreen puts its frame full screen | Fullscreen `click` | game-7 (desktop: iPhone Safari has no fullscreen for frames) |
| A key or click inside the game counts as pressing play | frame window `keydown` `pointerdown` (capture) | game-8 |

### `ao-slider`: crimson-coil, earthlight, moss-image-on-8gb, nine-claudes-one-painting, paper-jefrie, props-three-budgets, the-branch-that-went-live, wallpapers-nobody-saw

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| `labels` name the sides; the divider starts at `start` (50) | `labels`, `start`, `aspect` | slider-1 |
| Keys move the divider | range `input` | slider-2 |
| A drag moves the divider | range `input` | slider-3 |
| Full size opens both pictures in the viewer | zoom `click` | slider-4 |

### `ao-frames`: ai-rigging-vs-a-script, paper-jefrie, storm-bell-pop-up

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A mark jumps to its frame; ‹ frame and frame › step one | `marks`, `fps`, buttons `click`, video `seeked` `timeupdate` `loadedmetadata` → count | frames-1 |
| Arrow keys on the video step frames | video `keydown` | frames-2 |
| Play toggles (its label follows); ¼ speed sets the rate | buttons `click`, video `play` `pause` | frames-3 |

### `ao-diff`: curriculum-from-sources, first-lesson-on-the-new-map, the-missing-map

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| One button per version; earlier versions as a word diff against the last; the last as it stands | `labels`, buttons `click` | diff-1 |

### `ao-listen`: bad-very-bad, remora-voice-lab, showreel-rebuilt

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A clip row picks and plays it; Play/Pause and the clock follow the audio | row `click`, Play `click`, audio `play` `pause` `loadedmetadata` `ended` | listen-1 |
| A/B switches to the reference (`ref`) at the same moment, and back | `ref`, A/B `click` | listen-2 |
| The spectrogram seeks on click and with the arrows | spectrogram `pointerdown` `keydown` | listen-3 |
| List focused: arrows pick and keep playing, space toggles, C flips A/B | element `keydown` | listen-4 |
| Only one clip on the page plays | document `ao-listen-play` | core-3 |

The specs use the first set whose clips all run 4 s or more; many are one-line sound bites that end under a test.
The `ao-cues` specs take the instance with the fewest media bytes (`lightestWith`) and run one at a time: every test
streams the same two films.

### `ao-cues`: moonlight-five-times, moonlight-two-cuts

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Play runs every cut together, Pause stops them | Play `click`, the follow loop (`timeupdate`, rate nudges) | cues-1 |
| A cue sends every cut to its time, plays, and lights the cue | cue `click`, `data-t` | cues-2 |
| Enter on a cue seeks there and plays | cue `keydown` | cues-3 |
| Space on a focused cut plays and pauses them all | element `keydown`, the cuts' `tabindex` | cues-3b |
| One Sound button per cut picks the one heard | `labels`, Sound `click` | cues-4 |
| The scrubber seeks every cut | scrubber `input` | cues-5 |
| A cut out of video holds the rest until it has caught up | video `waiting`, `canplay` `canplaythrough` `seeked` `playing` | cues-6 |
| A click on a video toggles every cut | video `click` | cues-7 |
| A cut paused from outside stops all; the lead's end stops them | video `pause`, lead `ended` | cues-8 |
| Another player starting stops the cuts | document `ao-listen-play` | cues-9 |

### `ao-transcript`: every-video-can-seek, lessons-sent-back, loom-and-information-flow

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A line seeks its video there, plays it, lights the line | line `click`, the VTT `track` | transcript-1 |
| The lit line follows the video | video `play` → loop, `seeked` | transcript-2 |
| A find chip marks every hit and counts them; again clears; the search box marks too | `find`, chip `click`, search `input` | transcript-3 |
| One pane playing pauses the other | document `ao-listen-play` | transcript-4 |
| Enter on a line seeks; hiding the element pauses its video | line `keydown`, video `timeupdate` | transcript-5 |

### `ao-fetch`: every-video-can-seek, the-branch-that-went-live

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A row sends its request and prints the live status and headers; a `data-range` row gets 206 | `data-url`, `data-range`, Send `click` | fetch-1 |
| Send all runs every row | Send all `click` | fetch-2 |
| A `data-show="body"` row prints the start of the body | `data-show` | fetch-3 |
| `cap`, `data-method` | `cap`, `data-method` | not used by any page today (every row is a GET under the cap) |

### `ao-bars`: context-window, curriculum-from-sources, daily-candy, earthlight, first-lesson-on-the-new-map, renting-a-gpu, touch-move, who-visits-a-new-website

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| One bar per row, widths against `max`, values with `unit` | `max`, `unit` | bars-1 |
| Several series get a legend | table columns | bars-2 |

### `ao-shots`: bad-very-bad, first-lesson-on-the-new-map, showreel-rebuilt

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A shot seeks the video there and plays; the current shot is lit; arrows move between shots | `data-t`, shot `click` `keydown`, video `timeupdate` `seeked` `loadedmetadata` | shots-1 |

### `ao-blind`: daily-candy, props-three-budgets

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Judge blind, pick one per row, Reveal: labels, verdicts (`data-verdict`), the tally; Judge blind again | `aspect`, `data-row`, `data-verdict`, toggle, pick and reveal `click` | blind-1 |
| Blind, a click on a picture picks it instead of opening the viewer | picture `click`, `data-no-zoom` | blind-2 |

### `ao-runs`: first-lesson-on-the-new-map, the-clock-nobody-checked

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| One bar per row, a summary, an axis | the table, `start`, `end` | runs-1 |
| Pointing at, or clicking, a bar names it; leaving the chart clears it | bar `pointerenter` `click`, chart `pointerleave` | runs-2 |
| Focus and the arrows, Home and End walk the bars | bar `focus` `keydown` | runs-3 |

### `ao-calc`: renting-a-gpu

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Every result shows a number with its prefix and unit | `data-f`, `data-prefix`, `data-unit`, `data-digits` | calc-1 |
| A slider changes its readout and the results | `data-var`, `data-min`, `data-max`, `data-step`, `data-value`, range `input` | calc-2 |
| An option button picks its value | `data-options`, option `click` | calc-3 |
| A slider moves by keys too | range `input` | calc-4 |

### `ao-series`: d1-free-tier-cutoff, who-visits-a-new-website

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| `show` picks the first series; the buttons switch it | `show`, `avg`, button `click` | series-1 |
| Pointing at a day reads it out (with its marks), leaving clears it | body `pointermove` `pointerdown` `pointerleave`, `data-d` marks | series-2 |
| The chart takes focus and the keys walk the days | plot `focus` `blur` `keydown` | series-3 |
| `stack` (layers), `th[data-unit]` | `stack`, `data-unit` | not used by any page today |

### `ao-funnel`: counting-the-code, who-visits-a-new-website

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A total row, one row and segment per step, a summary with `unit` | `unit`, `data value` | funnel-1 |
| A row and its segment light together, from either | row and segment `pointerenter` `pointerleave` | funnel-2 |
| Focus in a row lights it | row `focusin` `focusout` | funnel-3 |
| What's in it opens and closes the examples | more `click` | funnel-4 |

### `ao-ask`: who-visits-a-new-website

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A question expands; opening another closes it | details `toggle` | ask-1 |
| The filter shows one connection's questions | `data-via`, filter `click` | ask-2: skipped, the one page has one connection, so no filter is drawn |
| Copy the question | copy `click`, `data-tool` | ask-3 (desktop: clipboard permissions are Chromium's in Playwright) |

### `ao-pan`: moss-image-on-8gb

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A drag pans | stage `pointerdown` `pointermove` `pointerup` `pointercancel` | pan-1 (desktop: a phone pans natively) |
| Arrows, Home and End pan | stage `keydown` | pan-2 |
| The minimap's window follows; a click on the minimap jumps there | stage `scroll`, img `load` → paint, minimap `pointerdown` `pointermove` `pointerup` | pan-3 |
| A stop glides there; a view keeps the place | `stops`, `views`, buttons `click` | pan-4 |
| Glide pans until its button, a wheel or `ao-stop` stops it | Glide `click`, stage `wheel` `touchstart`, document `ao-stop` | pan-5 |
| Full size opens the views in the viewer | Full size `click` | pan-6 |
| `height` | `height` | sets the frame height; drawn on every page that uses it |

### `ao-treemap`: counting-the-code

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Tiles drawn (`top`, `unit`); pointing at one reads it out, leaving clears | stage `pointermove` `pointerleave` | treemap-1 |
| Focus and the keys walk the tiles | stage `focus` `keydown` | treemap-2 |
| A view button regroups | `views`, button `click` | treemap-3 |

### `ao-matrix`: moss-image-on-8gb, props-three-budgets

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A heading per column (`cols`), rows under them (`data-row`) | `cols`, `aspect`, `data-row` | matrix-1 |
| A view button switches every cell, and every matrix with the same views | `views`, button `click`, document `ao-matrix-view` | matrix-2 |
| Hidden views never open in the viewer | `.ao-matrix-off` | matrix-3 |

### `ao-demo`: claude-text-watermark (`synthid`), who-visits-a-new-website (`cf`)

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| synthid `tournament`: a swapped word and another key redraw the tournament | word and key `click` | demo-synthid-1 |
| synthid `certain`: removing the tail and another case change the pairs | checkbox `change`, case `click`, slider `input` | demo-synthid-2 |
| synthid `detect`: fewer words checked change the score | range `input` | demo-synthid-3 |
| synthid `edit`: typing or an edit button rescores; Reset restores | textarea `input`, edit buttons, Reset, strip `change` | demo-synthid-4 |
| synthid `book`: pointing at the chart reads it out | svg `pointermove` `pointerleave` | demo-synthid-5 |
| cf `you`: asks `/cdn-cgi/trace` and lays out the visit; the address is masked until shown | Show `click`, show/hide `click` | demo-cf-1 |
| cf `count`: shows the live count; an automated browser isn't counted (asserted on the status line only) | `data-slug`, `visibilitychange`, Try again | demo-cf-2 |

## Standalone pages (`standalone.spec.mjs`, `elements/game.spec.mjs`)

| Behaviour | Pages | Spec |
|---|---|---|
| Loads with a clean console | every same-origin page a post links, iframes or plays (`targets.json` `standalone`: the games, labs, gauntlet pages, presentations, the previs tool, the course's first lesson, the HLS players, the making-of page) | standalone-1 |
| Sets up its media, and every file it plays answers a byte range (206) from R2 | each of those pages with video or audio, every `?v=` variant too (`/media/still-on-shift/?v=previs&embed` plays an mp4) | standalone-3 |
| Its `?v=` variants switch | `/media/still-on-shift/` (`?v=previs`) | standalone-2 |
| HLS streams through hls.js, a seek to the middle is answered from R2 (whole `.ts` segments, so 200 or 206), captions show where the page has a `<track>` | `/media/still-on-shift/`, `-v2`, `-v3` (no captions), `crimson-coil/highlight`, `crimson-coil/film`, `earthlight/highlight` | hls-1 |
| The making-of lightbox: a thumbnail opens its group, arrows page, Esc closes | `/media/bad-very-bad/making-of/` | making-1 |
| Its side buttons page; its close button and backdrop close | same | making-2 |
| Its clips play, in byte ranges | same | making-3 |
| Each embedded game loads and pauses off screen | `/games/storm-bell/`, `/labs/mini-loom/`, `/labs/info-flow/` | game-6 |

## Homepage scene (`home.spec.mjs`)

| Behaviour | Listener | Spec |
|---|---|---|
| The wheel walks the waypoints | window `wheel` | home-1 (desktop) |
| A swipe walks them | window `touchstart` `touchend` | home-2 |
| Arrows, Page keys, space, Home and End walk them | window `keydown` | home-3 |
| A rail dot flies to its waypoint | rail `click` | home-4: broken on main |
| The day/night toggle tweens the world (the page colour passes through between) | toggle `click` → tweenMix | home-5 |
| The avatar flips like a coin and lands on a face | avatar `click`, `pointerenter` `pointerleave` | home-6 |
| Without WebGL the scene bails to the flat page | hasWebGL → bail | home-7 (Chromium: `--disable-webgl` is its flag) |
| An outside link flies the camera out through the gate (the white at full), then opens; a new-tab link leaves the scene where it stood | document `click` → onOutboundClick, flyToLink | home-8 |
| A `data-no-fly` link leaves at once, the panel left as it was | `data-no-fly` | home-9 |
| A lost WebGL context bails to the flat page | canvas `webglcontextlost` | home-10 |
| The backtick opens and closes the staging tool | window `keydown` → onStageHotkey | home-11 (its own keys, drag and copy are a tool for Aaron, not checked) |

The scene specs pin `?tier=low`, which the scene supports for slow machines, so software WebGL never drops it to
its static rung mid-test.

## Homepage overlay (`overlay.spec.mjs`)

| Behaviour | Spec |
|---|---|
| A card grows into the ledger, with no document load | overlay-1 |
| A row opens its post in the panel, with no document load; `enhance(root)` makes its pictures open the viewer | overlay-2 |
| Post A, post B, back to A, on to C: every `ao-*` is defined each time; the model renders, the game reloads, the demo responds | overlay-3 |
| A lost component chunk still ends on a working post | overlay-4: broken on main |
| A link to another post inside a post stays in the panel | overlay-5 |
| Esc closes to the scene, Back reopens the post, Forward closes it | overlay-6 |
| Back to the ledger (`data-close-reader`) and back to the tea house (`data-panel-home`) | overlay-7 |
| Closing the panel stops what plays in it (`ao-stop`) | overlay-8 |
| A post the panel can't fetch opens as its real page | overlay-9 |
| A deep link to a post is its real page, components working | overlay-10 |
| The ledger's copy button puts the feed's address on the clipboard | overlay-11 (desktop: clipboard permissions are Chromium's in Playwright) |

## Pages (`ledger.spec.mjs`, `pages.spec.mjs`)

| Behaviour | Spec |
|---|---|
| The ledger lists every listed post once, newest first, each under the month it was filed in | ledger-1 |
| The hover card opens on pointing (verdict, id), closes on leaving and Escape | ledger-2 (desktop) |
| Keyboard focus opens it; its picture loads | ledger-3 (desktop) |
| A phone never gets one | ledger-4 (phone) |
| A post link inside a post opens it, with the title | ledger-5 (desktop) |
| The copy button on `/ledger` puts the feed's address on the clipboard (`bindFeedCopy`) | ledger-6 (desktop) |
| On a phone a row's title is one line and its summary at most two | ledger-7 (phone) |
| Each chip shows as many rows as it counts and hides empty months; All shows every row | ledger-8 |
| `?topic=video` opens filtered; a chip keeps the rest of the query string; the lit chip again clears it | ledger-9 |
| A chip row that wraps balances its lines, never one chip alone on the last (`text-wrap: balance`) | ledger-14 |
| Start here: the five `START_HERE` posts in order, each with icon, title and stamp | ledger-10 |
| A row's stamp opens its short version in place, with no request | ledger-11 |
| A card with no still shows the post's icon | ledger-12 (desktop) |
| A post link on `/stats` opens its card (through the `ledger-preview.js` stub) | ledger-13 (desktop) |
| RSS: one item per listed post, guid = the post URL | pages-1 |
| `/version.json`'s shape | pages-2 |
| `/stats` draws the snapshot (`/api/stats` 200) | pages-3 |
| `/stats` says the numbers aren't connected (503) | pages-4 |

## Search and Ask Goobie (`search.spec.mjs`)

`/api/*` answers come from `fixtures/api.json` (search-200 was recorded from `wrangler dev`, the answers of ask-200 and
ask-notes from Goobie's prompt against DeepSeek; no `related` list names AO-073, so no check waits on the live
notebook); Turnstile is a stub that solves at once with the test response.

| Behaviour | Spec |
|---|---|
| `/` focuses the box (inside it, `/` is a character); nothing of search loads before the first focus | search-1 |
| "gpu" lists the words half within 150 ms of the index being ready (the best of three loads; timed, so run it alone when the box is busy), each passage linked to its heading with `?hl=&hs=` and marked | search-2 |
| The Pagefind index holds exactly the listed posts and their notes, each a `/ledger/` page that exists | search-3 |
| No unlisted post can be found by its title | search-4 |
| A result opens its post with the sentence marked, open inside its `<details>`, in view in `#panel-scroll` (the frame unscrolled); a click clears it | search-5 |
| The meaning half joins once typing stops (one call), with no `/api/session` request and no Turnstile | search-6 |
| A failed meaning call leaves the words half and says nothing | search-7 |
| Ask: no Turnstile before Ask opens; `GET /api/session`, then Turnstile, then one mint; the button is disabled and Goobie thinks while a question is out, and a second Enter sends nothing; the answer is text; each `[n]` links to its passage and works; related rows; one session for the next question | search-8 |
| `{ ask: false }` hides the switch and says Goobie is resting, with no Turnstile | search-9 |
| `resting` and `not-found` show their line over the closest posts | search-10 |
| A search still answering when Ask opens draws nothing in Ask, and the meaning half is never asked | search-11 |
| A Turnstile challenge left unsolved (`timeout-callback`) says so and frees the button | search-12 |
| A cite of a notes passage (`kind: 'notes'`) links to `/ledger/<slug>/notes/#<anchor>` and opens it with the words marked; a post passage links to the post | search-13 |
| Opening Ask keeps the box's words, focused and selected: Enter asks them, typing replaces them | search-14 |

Ask against the real Worker is checked by hand under `npx wrangler dev` (docs/WORKER.md, "Locally"): the real
Turnstile widget with the test site key, a real mint and a real DeepSeek answer.

## The projects page (`projects.spec.mjs`)

| Behaviour | Spec |
|---|---|
| Every card (`src/content/projects/*.yaml`) is in its section once, the jump row's counts are the section sizes, a jump link scrolls to its section, stopped entries are lines with no picture | projects-1 |
| Highlights: the reel is `preload="none"` and loads nothing until played, then plays inline (WebKit on a phone too); four highlighted cards; the 15-second cut is linked | projects-2 |
| Every Play and Download card has a needs line; every private card has its ribbon and links only to this site | projects-3 |
| Every card picture and icon loads, and none moves the page when it arrives late | projects-4 |
| A card's post link opens its hover card | projects-5 (desktop) |
| In the homepage overlay the projects view has the same cards in the same sections, and a post link opens in the reader with no document load | projects-6 |

## The live site (`live.spec.mjs`, `npm run e2e:live`)

GET and HEAD only: `/version.json` is a main build (live-1), every baseline path answers (live-2), media come from
R2 in byte ranges (live-3), `/api/stats` and `/api/reads` answer in their shapes (live-4), the homepage and a post
load without a script error (live-5).

## Broken on main (reported to Aaron)

- **home-4, the rail dots.** The active section lies over the rail at every tier and on both projects, so a click on
  a dot lands on the section and the scene doesn't move. The keys, the wheel and a swipe work.
- **overlay-4, a lost chunk.** `openPost` imports `post-components.js` (the shim, whose chunk carries `enhance()`) with
  no fallback: when a deploy has replaced the chunk, the post shows un-upgraded. T1.2's `lazy(load, fallbackUrl)`
  navigates to the real page instead, once T3.1's `openPost` imports through it.

Smaller quirk: after `ao-stop` a running game's veil reads "Paused while something else plays." (the page-wide stop
reaches the game through its `aoPause` first), where "Paused." was meant. game-4 asserts only that it is paused.
