# Behaviour inventory

Every bespoke behaviour of the site, the pages that use it and the check that holds it. Rows come from the code:
each `addEventListener` and each documented attribute of a component has one (`src/elements/**`,
`src/scripts/home/`, `src/scripts/home/overlay/`, `src/scripts/cards/`, `src/scripts/ledger/`,
`src/scripts/search/`, `src/scripts/post/`, `src/scripts/views/`, the inline scripts of the standalone pages). A spec
id is the start of a test title (`npm run e2e -- -g core-4`). Unless a row says otherwise it passes on both projects,
`desktop` (Chromium 1440×900) and `phone` (WebKit, iPhone 13). The two wall-clock checks, search-2 and read-2 (tagged
`@timing`), run in `desktop-timing` and `phone-timing`, the two projects' teardowns: Playwright starts them once both
have finished, whatever their results, one test at a time a project, so their budgets in ms time the code and not a
box whose 4 cores the parallel tests saturate. A teardown project always runs whole: every `npm run e2e`, filtered or
not, ends with these 4 tests.

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
| While the video plays (the count drawn every frame) the Play/Pause button's content is never touched; pausing changes it (listen-5) | `requestVideoFrameCallback`, video `timeupdate`, Play `click` | frames-4 |

### `ao-diff`: curriculum-from-sources, first-lesson-on-the-new-map, the-missing-map

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| One button per version; earlier versions as a word diff against the last; the last as it stands | `labels`, buttons `click` | diff-1 |

### `ao-listen`: bad-very-bad, remora-voice-lab, showreel-rebuilt

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| A clip row picks and plays it; Play/Pause and the clock follow the audio | row `click`, Play `click`, audio `play` `pause` `loadedmetadata` `ended` | listen-1 |
| A Pause pressed while a seek is still running holds once the seek is done, and one pressed as a spectrogram seek made while playing ends with no data yet to play (WebKit's player otherwise plays the clip again) | Play `click` mid-seek and at `seeked`, spectrogram `click`, audio `play` | listen-1b |
| The hold ends: a play from outside the page (a media key, the lock screen) a second after the clip settles plays, after a Pause as the clip starts, mid-seek, before it is under way, and as a seek ends with no data yet to play | Play `click`, spectrogram `click`, audio `play` `seeked` | listen-1c |
| A/B switches to the reference (`ref`) at the same moment (both clocks read in the page as the reference starts playing), and back; the clip left stays paused, past its own seek's end (WebKit's player otherwise plays it again) | `ref`, A/B `click`, audio `play` | listen-2 |
| Only the clip picked plays: a play of the clip A/B or a row left, 100 ms and 700 ms after the click, is paused at once while the clip picked plays on | A/B and row `click`, audio `play` | listen-2b |
| The spectrogram seeks on click and with the arrows | spectrogram `pointerdown` `keydown` | listen-3 |
| List focused: arrows pick and keep playing, space toggles, C flips A/B | element `keydown` | listen-4 |
| While a clip plays (the playhead and clock drawn every frame) the Play/Pause button's content is never touched; pausing changes it (on WebKit a tap on a button whose text node is replaced between press and release fires no click) | the draw loop (`requestAnimationFrame`), Play `click` | listen-5 |
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
| While the cuts play (scrubber, clock and lit cue drawn every frame) the Play/Pause button's content is never touched; pausing changes it (listen-5) | the draw loop (`requestAnimationFrame`), Play `click` | cues-10 |

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
| A rail dot flies to its waypoint (the cards' page lets clicks through to the rail; only the shown card takes them) | rail `click` | home-4 |
| The day/night toggle tweens the world (the page colour passes through between, the 3D changes with it even with the camera still, once it ends `--pc-bg` is the plain per-mode string again, and the screen is the one a fresh load of that mode draws) | toggle `click` → `ao-mode` → theme.js | home-5 |
| The avatar flips like a coin and lands on a face | avatar `click`, `pointerenter` `pointerleave` | home-6 |
| Without WebGL the scene bails to the flat page, in the stored mode's colours | `home/index.js` `webgl()` → `flat()` | home-7 (Chromium: `--disable-webgl` is its flag) |
| An outside link flies the camera out through the gate (the white at full), then opens; a new-tab link leaves the scene where it stood | window `click` → `bindOutbound`, `flyToLink` (`scene/exit.js`) | home-8 |
| A `data-no-fly` link leaves at once, the panel left as it was | `data-no-fly` | home-9 |
| A lost WebGL context bails to the flat page | canvas `webglcontextlost` | home-10 |
| The backtick opens and closes the staging tool | window `keydown` → onStageHotkey | home-11 (its own keys, drag and copy are a tool for Aaron, not checked) |
| Five night tosses in a row open the lantern door: the last lands lamp-up, the lamp flares, the page goes to `/api/lantern` | avatar `click` → lantern.js | home-12 (the Worker's redirect: live-6) |
| With night stored the first paint is already night: page, card and heading colours before any module runs | Head's inline script, tokens.css | home-13 |

The scene specs pin `?tier=low`, which the scene supports for slow machines, so software WebGL never drops it to
its static rung mid-test.

## Homepage overlay (`overlay.spec.mjs`)

| Behaviour | Spec |
|---|---|
| A card grows into the ledger, with no document load | overlay-1 |
| A row opens its post in the panel, with no document load; `enhance(root)` makes its pictures open the viewer; Esc closes the viewer and leaves the panel open | overlay-2 |
| Post A, post B, back to A, on to C: every `ao-*` is defined each time; the model renders, the game reloads, the demo responds | overlay-3 |
| A lost chunk (the first the post's view module asks for) still ends on a working post: `mountView`'s `lazy()` opens the real page | overlay-4 |
| A link to another post inside a post stays in the panel | overlay-5 |
| Esc closes to the scene, Back reopens the post, Forward closes it | overlay-6 |
| Back to the ledger (`data-close-reader`) and back to the tea house (`data-panel-home`) | overlay-7 |
| Closing the panel stops what plays in it (`ao-stop`) | overlay-8 |
| A post the panel can't fetch opens as its real page | overlay-9 |
| A deep link to a post is its real page, components working | overlay-10 |
| The ledger's copy button puts the feed's address on the clipboard | overlay-11 (desktop: clipboard permissions are Chromium's in Playwright) |
| A view is fetched on intent only: nothing on idle, the page on the pointer going down, once | overlay-12 |
| The homepage asks for no picture of a view it isn't showing | overlay-13 |
| Courses brings its own stylesheets, put before the homepage's, and they apply | overlay-14 |
| Opening and closing every view (and a post) leaves the homepage's body and card colours as they were | overlay-15 |
| A page from another build (`ao-build`) opens as the real page | overlay-16 |
| Back, or "← LEDGER", from a post finds the ledger filtered (`?topic=`, even one set after it was mounted) and scrolled as it was left | overlay-17 |
| A search result (`?hl=&hs=#heading`) opens in the panel with its passage marked, in view | overlay-18 |
| A post's notes open in the panel | overlay-19 |
| The scene draws nothing while the panel covers it, and draws again once it closes | overlay-20 |
| A project's own page ("Start the course", `data-no-fly`) leaves at once from the panel, with no flight | overlay-21 |
| Ask works again in a ledger mounted afresh: its Turnstile widget goes into the box on screen | overlay-22 |
| A view opened just after scrolling a post opens at its top: the post keeps its place only in its own history entry | overlay-23 |
| No view brings a second copy of the site's rules: the homepage links site.css, so opening the ledger, projects, about and a post adopts no stylesheet | overlay-24 |
| A view in the panel has the colours it has on its own page, by day and by night, and its focused search box looks the same | overlay-25 |
| While the panel is up the day/night switch sits in its header, clear of the card's corner and the nav, and still switches; it goes back on close | overlay-26 |
| On a phone the panel's footer is two short lines (under a tenth of the window), every link kept | overlay-27 (phone) |

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
| The doorway's sort counts each pile up as its dots land, every frame, in its own text node: over the whole sort (watched from the page's first script, since the sort can start as the page loads) the pile buttons never have a node replaced (listen-5), and their figures change | pages-6 |
| A range change rolls the lede's figures (`tweenNumber`, every frame for 450 ms) in their own text nodes: watched from before the range is picked to the roll's end, the provenance buttons around them never have a node replaced (listen-5), and the figures change | pages-7 |
| A link to a heading lands on it, and a search result's passage is in view, though the components above it draw after the load event (`scripts/views/post.js`) | pages-5 |

## The post page (`post.spec.mjs`)

| Behaviour | Spec |
|---|---|
| The short version is the post's card in `previews.json` (verdict, takeaway, points), at `#short`; no preview, no box | post-1 (desktop: built files) |
| Read next: three listed posts, never the post itself; older and newer follow the ledger's order; no series threads | post-2 (desktop: built files) |
| A long post's contents list is open and sticky beside the text at 1440 px, marking the heading read; a closed `<details>` above the text on a phone; a short post has none | post-3 |
| `?hl=` opens the folded `<details>` holding the term and marks it; a `#target` inside a closed `<details>` opens it (`scripts/post/details.js`) | post-4 |
| The header: the 96/256 icon, `AO-### · date · N min`, topic and project chips linking to the ledger's filters; the byline on Claude's pages (`voice: claude`) only | post-5 (desktop: built files) |
| An unlisted post: noindex, no share card, no short version, its topic glyph, only listed posts in Read next | post-6 |
| Every listed post shares an absolute `/og/<slug>.jpg?v=` card, 1200×630 JPEG under 150 KB, as `og:type article` | post-7 (desktop: built files) |
| RSS categories are the topic label, then the project labels | post-8 (desktop: built files) |
| A wide picture in `<ao-compare>` holds its ratio before it loads, so the page doesn't jump | post-9 |
| Reload, and Back with and without the page cache, put `#panel-scroll` back where the reader was, on a long post with components | post-10 |
| The notes page is the post view without the short version, Read next or older/newer; its way back is the short version | post-11 |

## Search and Ask RAG Goobie (`search.spec.mjs`)

`/api/*` answers come from `fixtures/api.json` (search-200 was recorded from `wrangler dev`, the answers of ask-200 and
ask-notes from Goobie's prompt against DeepSeek; no `related` list names AO-073, so no check waits on the live
notebook); Ask's answers are event streams (`sse`, `fixtures.mjs` `streamOf()`), and search-17 and -19 hold the stream
in the page to see it step by step. Turnstile is a stub that solves at once with the test response. Every spec that
clicks Ask waits for `[data-search][data-ready]` first (the box's module has mounted).

| Behaviour | Spec |
|---|---|
| `/` focuses the box (inside it, `/` is a character); nothing of search loads before the first focus | search-1 |
| "gpu" draws the words half's first results within 150 ms of the index being ready (the best of three loads, Pagefind's files served from memory so the time is the code's, not the network's), the rest as their passages come, each linked to its heading with `?hl=&hs=` and marked | search-2 (`@timing`) |
| A row on screen never moves or changes once drawn: the words half's late passages and the meaning half only add rows at the end, as they come, with the 2nd page's passage slow, and with the 1st page's slow so the meaning half draws first. The third row's link, read with the pointer on it, keeps its box and is the element under the pointer once everything is in, and a click (a tap on the phone) opens it | search-26 |
| Words typing in are patched into the answer, never redrawn whole: a cite drawn stays the same link through every redraw and the final render, so one pressed while more words come (released where it is then: `text-wrap: pretty` can move it along its line) is clicked | search-27 |
| The answer's final render keeps the paragraph the words typed into in the page: a cite pressed as the `answer` event comes is never taken out of the page (a MutationObserver on the body sees no removal of it) and is the same, connected link after the fine print, summary and posts go in after the paragraph; the step list above it goes at once, as without a press (search-17), and a click on the cite then counts | search-28 |
| The Pagefind index holds exactly the listed posts and their notes, each a `/ledger/` page that exists | search-3 |
| No unlisted post can be found by its title | search-4 |
| A result opens its post with the sentence marked, open inside its `<details>`, in view in `#panel-scroll` (the frame unscrolled); a click clears it | search-5 |
| The meaning half joins once typing stops (one call), with no `/api/session` request and no Turnstile | search-6 |
| A failed meaning call leaves the words half and says nothing | search-7 |
| Ask RAG Goobie: no Turnstile before Ask opens; `GET /api/session`, then Turnstile, then one mint; the button is disabled and Goobie thinks while a question is out (the first is held until the test lets it go), and a second Enter sends nothing; the answer is text; its `[n]` count posts (every cite of one post reads `[1]`, a run of them shows once), each link goes to its own passage and works; related rows; one session for the next question | search-8 |
| `{ ask: false }` hides the switch and says RAG Goobie is resting, with no Turnstile | search-9 |
| `resting` and `busy` show their line over the closest posts, in place of the steps and of any words already streamed (busy's fixture streams some first) | search-10 |
| A search still answering when Ask opens draws nothing in Ask, and the meaning half is never asked | search-11 |
| A Turnstile challenge left unsolved (`timeout-callback`) says so and frees the button | search-12 |
| A cite of a notes passage (`kind: 'notes'`) links to `/ledger/<slug>/notes/#<anchor>` and opens it with the words marked; a post passage links to the post | search-13 |
| Opening Ask keeps the box's words, focused and selected: Enter asks them, typing replaces them | search-14 |
| Aaron's two answers of 2026-11-01 (`fixtures/answers.mjs`): cites numbered by post with no gaps (1, 2, 3), a run of cites (spaces between too) showing each post once; no `title` tooltip, an `aria-label` "Source n: post, passage"; on a desktop each cite's card is its post's with a line naming its passage (heading, the opening, the full making-of for a notes cite, which gets a card), moving between two cites of one post leaves its loop playing, and a related row's card has no line | search-15 |
| On a phone each `[n]` is a 44 px tap target (an invisible absolute box under `pointer: coarse`) that never covers another cite's number; cites closer than that (a run, one above another) share the room between them; the answer's lines and its cites don't move; a tap under a number opens its passage. On a desktop the target is the cite's own box | search-16 |
| The steps show as the stream comes, in order, each ticked when the next arrives (start, plan with topic labels, found, read with titles from previews.json, write), with a status line; then the answer (cites as in search-15), the fine print (no "How RAG Goobie works" link before that post is listed) and the summary line; `aria-busy` clears | search-17 |
| A cached answer is one event: the answer and "Answered before, from the answer cache · 0.1 s" | search-18 |
| Words typing in are cited as they come (no raw `[n.s]` ever), and the final paragraph is the answer event's render | search-19 |
| The empty Ask box's placeholder steps every 4 s (`page.clock`) from a random example through the list in order, the default line included, and loops; typing stops it, emptying the box starts it again, Search brings back "Search the ledger"; the `aria-label` never changes | search-20 |
| Under reduced motion the Ask box shows the first example and never changes it | search-21 |
| The "Ask RAG Goobie" button shows no card while the how-it-works post isn't in `previews.json`; once it is, hovering shows its card with the line "How RAG Goobie works", leaving closes it and keyboard focus opens it; a phone gets none | search-22 |
| Words typed before the box's module has run (its chunk held) are searched once it mounts | search-23 |
| The line under the box says how many posts RAG Goobie reads, in Ask only | search-24 |
| On a 360 px Android phone (Chromium) a cite that ends a line flush makes no sideways scroll (its 44 px box stays inside the panel's padding) | search-25 (desktop project, Android profile) |

Ask against the real Worker runs under `npx wrangler dev` in the eval (docs/ASK.md, "The eval"): the real Worker,
a real mint with the test secret and real DeepSeek answers, never from the e2e suite.

## The hover card's size (`cards.spec.mjs`)

Ask streams Aaron's two answers (`fixtures/answers.mjs`) on a kept session, so no Turnstile loads.

| Behaviour | Spec |
|---|---|
| At 1366×657 and 1024×600, by day and by night, every card opened from a RAG Goobie cite (with its "RAG Goobie cites:" line), a related row under the answer and the ledger's rows at the top, middle and foot of the window is inside the window whole, shows all of its words (`scrollHeight <= clientHeight`: `place()` measures the content, not the box `max-height` caps) and keeps clear of the link's words, stepping down a size only where it has to | cards-1 (desktop) |
| At 1440×900 the cites' and related rows' cards are full size, and every card shows whole, a row reached as a scroll begins included | cards-2 (desktop) |
| A card whose link leaves the page while it is open (the next answer replacing the one it was in) closes at the pointer's next move | cards-3 (desktop) |

## The projects page (`projects.spec.mjs`)

| Behaviour | Spec |
|---|---|
| Every card (`src/content/projects/*.yaml`) is in its section once, the jump row's counts are the section sizes, a jump link scrolls to its section, stopped entries are lines with no picture | projects-1 |
| Highlights: the reel is `preload="none"` and loads nothing until played, then plays inline (WebKit on a phone too); four highlighted cards; the 15-second cut is linked | projects-2 |
| Every Play and Download card has a needs line; every private card has its ribbon and links only to this site | projects-3 |
| Every card picture and icon loads, and none moves the page when it arrives late | projects-4 |
| A card's post link opens its hover card | projects-5 (desktop) |
| In the homepage overlay the projects view has the same cards in the same sections, and a post link opens in the reader with no document load | projects-6 |

## Read-aloud (`read-aloud.spec.mjs`)

Recordings are fixtures the spec makes from the build's `/read/<slug>.json` (silent audio in byte ranges, a word
every 200 ms), so nothing waits for the Worker's key.

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| Listen opens karaoke mode and plays this version's recording; the word read is marked at 1x and 2x; the speed button steps 1x, 1.25x, 1.5x, 2x, each setting `playbackRate`; pause and close | `[data-read-aloud]` click (`listen.js`), `.ra-bar` buttons, `CSS.highlights` `ao-read` | read-1 |
| A click on a word mid-paragraph starts there within a second, within 0.3 s of the word, in its part | article `click` → `caretPositionFromPoint` / `caretRangeFromPoint` | read-2 (`@timing`) |
| A click on a word while the recording's first part is still loading reads and marks from there, and the bar says it plays | `recorded.js` `play()` superseded by a later one | read-2b |
| A reader closed while its recording loads plays nothing when it arrives: no part fetched, nothing on the lock screen | `index.js` `loading` | read-2c |
| With no recording of this version the browser voice reads, block by block: its word boundaries mark the word, the speed sets `rate`, a click starts the next utterance at that word | `speechSynthesis` (a stand-in voice in Chromium) | read-3 |
| The real browser voice reads and pauses | `speechSynthesis` (WebKit) | read-3b (phone) |
| A video starting pauses the reading, the reading starting pauses the video, and `ao-stop` stops it | claim, the bar's `aoPause`, `ao-stop` | read-4 |
| The lock screen names the reading; its play resumes it and pauses a playing video, as the bar's does; closing the reader clears it | `navigator.mediaSession` (`recorded.js`), claim | read-4b |
| In the homepage's reader (the panel mounts `views/post.js`) Listen works, and closing the panel stops it | `ao-stop`, the view's unmount | read-5 |
| `/read/index.json` and `/read/<slug>.json` are the recorded posts', never the live notebook's or an unlisted post's, with the page's `data-read-hash`; a version not recorded answers `200 { ready: false }` | the build, `worker/media/serve.js` | read-6 |
| A post never recorded (unlisted, a live notebook) has no `data-read-hash`: Listen reads in the browser's voice, with no choice of voice, no word of a recording and no `/read/` request | `listen.js`, `bar.js` | read-7 |
| Every tap that reads plays inside itself, as iOS and strict Android autoplay need: Listen speaks a silent utterance and plays the one `<audio>` before its import and fetch, and that element alone then reads the recording; a word, the bar's play, a change of voice and the speed start the recording or the voice within the tap | `listen.js` `unlock()`, `index.js` `play()`, `HTMLMediaElement.play` / `speechSynthesis.speak` (stand-ins that mark the tap) | read-8 |
| The bar is drawn again on every play, pause and next part; the speed button only when the speed changes, so its content is never touched as the reading moves to its next part or pauses (listen-5), and its own click still steps it | `bar.js` `show()` | read-9 |

## The live site (`live.spec.mjs`, `npm run e2e:live`)

GET and HEAD only: `/version.json` is a main build (live-1), every baseline path answers (live-2), media come from
R2 in byte ranges (live-3), `/api/stats` and `/api/reads` answer in their shapes (live-4), the homepage and a post
load without a script error (live-5), `/api/lantern` answers `302` to an https address that isn't this site,
`no-store`, compared and never printed (live-6).

## Broken on main (reported to Aaron)

Nothing in the suite is broken on main (home-4, the rail dots, was fixed by T3.2). A smaller quirk: after `ao-stop`
a running game's veil reads "Paused while something else plays." (the page-wide stop reaches the game through its
`aoPause` first), where "Paused." was meant. game-4 asserts only that it is paused.

## The test browsers' own quirks

- **A slow network on demand.** `E2E_MEDIA_DELAY=150-400 npm run e2e -- <specs>` holds every request for a media
  file on the live site 150-400 ms (`fixtures.mjs`; off when unset), so seeks and waits for data run long as on a
  phone. Under it, on `phone`, WebKit's player plays a clip paused mid-seek again as the seek ends: 318 such plays
  in 1,500 tries on 2026-11-02, nearly all within 10 ms of `seeked` (the latest 237 ms after it, 1.1 s after the
  pause), and none of 199 clips paused just after Play with no seek running. listen-2's flake was one of those,
  of the clip A/B left. It also plays a clip paused as a seek made while playing ends with no data yet to play
  (`readyState` 2): 3-5 ms after the pause, 5 of 30 Pauses pressed at a spectrogram seek's `seeked` (listen-1b
  makes that state certain). Not on by default: it slows every media spec.

- **Playwright's Linux WebKit never loops a video.** At the loop point a `loop` video goes back to 0 and stalls there
  (`readyState` 2, the clock stopped, `seeked` over and over), whatever the file: both 2x2 clips of
  `ai-rigging-vs-a-script`, served live or from a local server with byte ranges, on a bare page with none of the
  site's code, and a `testsrc` clip from ffmpeg (checked 2026-11-01). Chromium loops them, and so does WebKit when a
  script seeks back to 0 after `ended`. It is the engine's GStreamer backend, not the site (Safari plays through
  AVFoundation): on `phone`, a check that needs a clip running must not wait past its first pass.
