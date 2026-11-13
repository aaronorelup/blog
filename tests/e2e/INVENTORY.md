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

### `ao-demo`: claude-text-watermark (`synthid`), who-visits-a-new-website (`cf`), three-ways-to-search-my-blog (`goobie-lab`)

`goobie-lab`'s specs open its own post's page (AO-083), so a live run there sees that post among the ones listed since
the recording.

| Behaviour | Listener or attribute | Spec |
|---|---|---|
| synthid `tournament`: a swapped word and another key redraw the tournament | word and key `click` | demo-synthid-1 |
| synthid `certain`: removing the tail and another case change the pairs | checkbox `change`, case `click`, slider `input` | demo-synthid-2 |
| synthid `detect`: fewer words checked change the score | range `input` | demo-synthid-3 |
| synthid `edit`: typing or an edit button rescores; Reset restores | textarea `input`, edit buttons, Reset, strip `change` | demo-synthid-4 |
| synthid `book`: pointing at the chart reads it out | svg `pointermove` `pointerleave` | demo-synthid-5 |
| cf `you`: asks `/cdn-cgi/trace` and lays out the visit; the address is masked until shown | Show `click`, show/hide `click` | demo-cf-1 |
| cf `count`: shows the live count; an automated browser isn't counted (asserted on the status line only) | `data-slug`, `visibilitychange`, Try again | demo-cf-2 |
| goobie-lab `windows`: the three ways, each with its map; in-context's shades every post, RAG's a few | `part` | demo-lab-1 |
| goobie-lab `context`: another question redraws the figures and the answer; past the window the growth slider says it no longer fits, and by how much | question `click`, range `input` | demo-lab-2 |
| goobie-lab `rag`: the k slider moves the cut through the chunks and the window's tokens; a chunk opens | range `input`, `details` | demo-lab-3 |
| goobie-lab `agent`: Next, Back and Show every turn step through the turns; the answer and grade come at the last; a button that turns itself off hands the keyboard's focus to the other way; an answer's "- " lines are a list | button `click`, Enter | demo-lab-4 |
| goobie-lab `agent`: a recorded call runs again live on the site's files, the same as recorded on the posts it searched (whatever was listed since); on all the posts listed today it says how many came since, this post among them, and what it returns now; its result and an opened result stay as you step | Run this call live `click`, Next `click` | demo-lab-5 |
| goobie-lab `agent`: the playground searches the reader's own words live, as plain text; cites link to their passages | form `submit` | demo-lab-6 |
| goobie-lab `agent`: a live run that can't read the site's files says so, and the next try reads them | Run this call live `click` | demo-lab-7 |

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
| A lost post component chunk in the panel opens the post's real page at once, with no reload first: `mountView` hands the view its fallback, which `enhance()` passes on | overlay-4b |
| A link to another post inside a post stays in the panel | overlay-5 |
| Esc closes to the scene, Back reopens the post, Forward closes it | overlay-6 |
| Back to the ledger (`data-close-reader`) and back to the tea house (`data-panel-home`) | overlay-7 |
| Closing the panel stops what plays in it (`ao-stop`): every video of a synced `<ao-compare>` plays; Esc's `ao-stop` has paused each one while it is still in the panel (a listener in the same dispatch reads `paused` and `isConnected`: the browser pauses a removed video by itself, so a check after the drop alone would pass without `ao-stop`); each stays stopped once the panel has dropped its copy (read through handles) | overlay-8 |
| Esc while a synced set is still starting (told to play, its files held until the panel has closed): `ao-stop` pauses every video while still in the panel, and none starts when the bytes arrive, in the dropped copy or in the page | overlay-8b |
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
| No view brings a second copy of the site's rules: the homepage links site.css, so opening the ledger, projects, about, now and a post adopts no stylesheet | overlay-24 |
| A view in the panel has the colours it has on its own page, by day and by night, and its focused search box looks the same | overlay-25 |
| While the panel is up the day/night switch sits in its header, clear of the card's corner and the nav, and still switches; it goes back on close | overlay-26 |
| On a phone the panel's footer is two short lines (under a tenth of the window), every link kept: exactly the feed, the tea room and every elsewhere | overlay-27 (phone) |

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
| A post link on `/stats` opens its card (`stats.astro` imports `cards/hover.js`) | ledger-13 (desktop) |
| RSS: one item per listed post, guid = the post URL | pages-1 |
| `/version.json`'s shape | pages-2 |
| `/stats` draws the snapshot (`/api/stats` 200) | pages-3 |
| `/stats` says the numbers aren't connected (503) | pages-4 |
| The doorway's sort counts each pile up as its dots land, every frame, in its own text node: over the whole sort (watched from the page's first script, since the sort can start as the page loads) the pile buttons never have a node replaced (listen-5), and their figures change | pages-6 |
| A range change rolls the lede's figures (`tweenNumber`, every frame for 450 ms) in their own text nodes: watched from before the range is picked to the roll's end, the provenance buttons around them never have a node replaced (listen-5), and the figures change | pages-7 |
| A link to a heading lands on it, and a search result's passage is in view, though the components above it draw after the load event (`scripts/views/post.js`) | pages-5 |
| `/now` shows the newest snapshot of `src/content/now/`, lit in the nav; its History links every snapshot by date, newest first; each `/now/<date>/` shows that snapshot, marks its own row unlinked and points back to `/now` | pages-8 |

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

## Ask by voice (`voice.spec.mjs`)

`/api/ask/hear` answers from `fixtures/api.json` (`hear-200`, `hear-empty`, `hear-429`); the desktop project launches
Chromium with a fake microphone (`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`), so the
recording specs run on desktop only (WebKit has no fake device).

| Behaviour | Spec |
|---|---|
| The microphone is hidden in Search and shows once Ask opens with `voice: true`; `hear.js` loads only on its first press; recording it is `aria-pressed`, labelled "Stop recording", counts the seconds and shows the line that the audio is thrown away; a second press sends one `POST /api/ask/hear` (`audio/webm`, the Ask token, the recording) and the text heard goes in the box and is asked through one `POST /api/ask` with it as `q`; back in Search the microphone goes | voice-1 (desktop) |
| A recording stops on its own at 30 s (`page.clock`) and is sent | voice-2 (desktop) |
| An empty transcript says "RAG Goobie didn’t catch that" and a `429` says it is busy; nothing is asked and the microphone works again | voice-3 (desktop) |
| No microphone where the browser has no `MediaRecorder` | voice-4 |
| `{ voice: false }` leaves Ask typed only, with no microphone | voice-5 |

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

## The tea room (`tea.spec.mjs`)

`/tea/`, the whole site on one chaptered page (`src/pages/tea/`, `src/components/tea/`, `src/scripts/tea/rail.js`).
Every expectation comes from the build or the source (the ledger page, the content files' frontmatter,
`src/data/tea.js`), so the rows hold while posts land on main; chapters are reached by their anchors, so they hold
once the 3D hero pins the top.

| Behaviour | Spec |
|---|---|
| The page loads with every chapter of `CHAPTERS`, in order, each with its word, lede and numeral, and the hero's contents and the rail list them all with the same numerals | tea-1 |
| Its post links are exactly the ledger's listed posts; each sits once under its topic with its AO id; the topic pills, group counts, the counter line ("N posts · N projects · N courses") and "Open the ledger" carry the real counts; Start here is `START_HERE` in order; every listed post's notes page is linked and no other, from each card and index row of a post that has one | tea-2 |
| Projects (each section's cards, in order), courses, the newest Now snapshot and About (its lede and prose, all of `/about/` but its title) show what `/projects/`, `/courses/`, `/now/` and `/about/` show | tea-3 |
| Every internal link and picture resolves: page anchors are ids on the page, every other address answers 200, an anchor on another page is an id there | tea-4 |
| No draft or unlisted post anywhere: no slug in the HTML; no title and no AO id of its own in the page's text or any attribute, outside Now's and About's own words (the main site's, tea-3) | tea-5 |
| Canonical, robots and the sitemap follow the shipped `TEA_SEO` through `teaSeo()` (`'pending'`: self canonical, no robots tag, not in the sitemap); never a feed item, no `data-pagefind-body`, and semantic search and Ask hold only the listed posts and their notes; og:url says what the canonical says, and no share card (`/og/page/tea.jpg` 404), `og:image`, `twitter:card` or JSON-LD block names the page | tea-6 |
| The panel footer's "Tea room" link and the homepage gate's button reach `/tea/`; the gate's `data-no-fly` leaves at once (the scene doesn't hold the click to fly) | tea-7 |
| The hero, the rail and the footer lead back to `/`; the footer carries every `NAV` link | tea-8 |
| The rail marks the chapter being read (`aria-current`), none over the hero; a rail link or strip pill takes the reader to its chapter; a chapter reached by its anchor shows its opener (the one-time fade was set off, or never waited, and ends fully shown; no frame of it is timed) | tea-9 |
| With JavaScript off every chapter shows, nothing waits to fade in, every link shows on a wide window, and on a phone every address is on a link that shows; the day/night switch, which needs its script, isn't shown, nor does the phone's strip keep room for it (its pills run to its end) | tea-10 |
| Day or night chosen on a panel page is what `/tea/` opens in, and the reverse (the shared `scene-mode`) | tea-11 |
| The first Tab is the skip link, in view; it takes the keyboard past the hero and the rail into the first chapter; no positive tabindex | tea-12 |
| No console error, no sideways scroll at 1440 and 390 wide by day and by night (at the top and at every chapter), every picture loads | tea-13 |
| Under 1024 px the strip keeps the chapter being read in view: at every chapter, going down and back up, its pill sits whole inside the strip and clear of its fading end; Tab from "Main site" brings each pill in turn whole into view, clear of the fade, with room for its focus ring; with reduced motion (the strip moves at once) and without (it glides; WebKit starts the glide up to about 0.7 s late, so the pass waits for the pill to arrive and stay) | tea-14 (desktop at 390 wide, and phone) |
| One `h1`, the hero's title, first; each chapter's word an `h2` and the first heading in it; About's sections (`AboutView level={2} title={false}`) at `h3` with no title of their own; no heading skips a level | tea-15 |
| The hero lab `/tea-lab/` (a frozen copy of 2026-11-12 since then) answers with its own robots noindex and no share picture or JSON-LD; the sitemap, the feed, the hover cards' list, search, Ask and read-aloud never name it, and no page links it (`/tea/`, the 404 page, every page of the sitemap) | tea-16 |
| An address with a chapter (`/tea/#projects`) lands on it at once: every frame from the first has the window at the top or at the chapter, never between (phone WebKit glides there while the page loads and, the page busy, stops part way); the first link followed on the page glides to its chapter | tea-17 |

## The tea room being rebuilt (`tea-next.spec.mjs`, `tea-engine.spec.mjs`, `tea/<id>.spec.mjs`)

`/tea-next/` until the swap (the address is one constant in `tests/e2e/tea/base.mjs`). Every expectation comes from the
picks (`src/data/tea-picks.json`), the registry and `COPY.room`. The live notebook only warns.

| Behaviour | Spec |
|---|---|
| The sections are the picks' chapters in order, each with its anchor (the `dom` id), its `h2` and one statement; the hero slip, the bookmark and the tab list the same, with the same numerals | tea-next-1 |
| Each chapter shows exactly its shelves' posts, in order, and a topic its one closing link; no other post link on the page | tea-next-2 |
| Courses: the two courses, their names and links | tea-next-3 |
| Every internal link and picture resolves (the live notebook only warns) | tea-next-4 |
| No draft or unlisted post anywhere: no slug in the HTML, no title in its text | tea-next-5 |
| The index marks the chapter whose section holds the scroll position | tea-next-9 |
| Without JavaScript the page is book mode: every chapter, word, still and link shows, no stage | tea-next-10 |
| One `h1`; each chapter's first heading its `h2`; the first Tab is the skip link; nine Tab stops in the frame with a ring | tea-next-12 |
| Under 1024 px the tab shows the current numeral and short name whole; its sheet lists every chapter in rows of 44 px or more and closes on a choice | tea-next-14 |
| `/tea-next/` says noindex; no sitemap, feed, index or other page names it | tea-next-16 |
| One link to `/` in the hero slip, in the index as shown, and in the footer, which carries the main nav | tea-next-8 |
| The planned places are the real ones: the screens are fully shut at every section's top from the third chapter on | tea-next-24 |
| An address with a chapter lands on its opening frame in one step (screens open, its word in view); `#ledger` lands on the first topic | tea-next-17 |
| No console message, no sideways scroll, every picture in reach decoded, at every chapter's opening frame and every half screen | tea-next-13 |
| Head and tail: each chapter's paper begins 1.2 vh in (1.0 after the hero) and ends 0.6 vh before its end (1.6 when last); the screens are shut when the footer comes in | tea-next-18 |
| No layout shift from load to settled and through a scripted scroll | tea-next-19 |
| Reduced motion: book mode, nothing running or playing, two frames 700 ms apart identical at six places | tea-next-20 |
| Save-Data: book mode, no request for a loop, a film, three or a model | tea-next-21 |
| The closed bookmark covers no text at any chapter's rest places | tea-next-22 |
| The footer's computed styles equal `/tea/`'s (until the swap) | tea-next-23 |
| Purity: the frame at a place is the same loaded directly, flicked to from the top and from the bottom (scrollTo) and turned to with the wheel, in state read back from the page and in pixels (under 0.1% apart), at 1440x900, 760 wide, 390x844 and on the phone; also at the door, before and after every screens change, and the house closing | tea-engine: purity |
| No frame is nearly all dark, no band is dark and flat, no dark flat area is over 0.49 of the frame, and on a phone no more than a fifth of the lower 40% is dark and flat, paper or none, at 240 places (200 on a phone); the floors measured on looks A and B (`scripts/tools/tea/sweep.mjs`, `docs/TEA_ROOM.md`) | tea-engine: the empty-frame sweep |
| At every half screen the page is no wider than the window, and `html` and `body` never set overflow | tea-engine: nothing scrolls sideways |

Each chapter's own rows are in its own file:
- `hero`: [tests/e2e/inventory/tea-hero.md](inventory/tea-hero.md)
- `start`: [tests/e2e/inventory/tea-start.md](inventory/tea-start.md)
- `tv`: [tests/e2e/inventory/tea-tv.md](inventory/tea-tv.md)
- `film`: [tests/e2e/inventory/tea-film.md](inventory/tea-film.md)
- `games`: [tests/e2e/inventory/tea-games.md](inventory/tea-games.md)
- `art`: [tests/e2e/inventory/tea-art.md](inventory/tea-art.md)
- `3d`: [tests/e2e/inventory/tea-3d.md](inventory/tea-3d.md)
- `agents`: [tests/e2e/inventory/tea-agents.md](inventory/tea-agents.md)
- `learning`: [tests/e2e/inventory/tea-learning.md](inventory/tea-learning.md)
- `site`: [tests/e2e/inventory/tea-site.md](inventory/tea-site.md)
- `projects`: [tests/e2e/inventory/tea-projects.md](inventory/tea-projects.md)
- `courses`: [tests/e2e/inventory/tea-courses.md](inventory/tea-courses.md)
- `now`: [tests/e2e/inventory/tea-now.md](inventory/tea-now.md)
- `about`: [tests/e2e/inventory/tea-about.md](inventory/tea-about.md)

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

## The tea room's hero (`tea-hero.spec.mjs`)

The 3D hero at the top of `/tea/` (`src/components/tea/hero/`, `src/scripts/tea/hero/`, `docs/TEA_HERO.md`). Both
projects have WebGL (desktop Chromium, phone WebKit), so the scene runs in both; on a box with a software GPU every
frame is a long task, so a test that checks layout holds the scene's loop through its own hook first, and tests wait
for `data-hero-settled` (the hero will change no layout by itself any more) before they act.

| Behaviour | Spec |
|---|---|
| With reduced motion the poster stays and none of the 3D (its chunk, three, the loader, the manifest, models, picture layers) is fetched | tea-hero-1 |
| Without WebGL the same | tea-hero-2 (desktop: a Chromium flag) |
| Nothing of the 3D is fetched before first paint; where the scene runs its files do come, after it | tea-hero-3 |
| Where WebGL runs the scene mounts, pins and draws with no console error, and what sticks stays at the top mid-scroll | tea-hero-4 |
| On a phone the day/night switch is on screen and on top through the static and the pinned hero, works, and is the only one; landed on the first chapter, the strip is already stuck at the top with the switch inside it | tea-hero-5 (phone) |
| The title box's skip link takes the keyboard past the pinned hero to the chapters | tea-hero-6 |
| Every chapter link in the title box lands on its chapter at its scroll margin | tea-hero-7 |
| The title box holds within 1 px of its static place on every frame while the scene takes over | tea-hero-8 |
| A scene that arrives late moves nothing on screen: with the box still on screen it waits; with the reader on the first chapter it pins with the chapter left where it is | tea-hero-9 |
| Arriving at `/tea/#projects` lands on the chapter, and the scene, ready only once the page has left the top for it, pins without moving the reader off it | tea-hero-10 |
| The day/night switch pressed while the models load is the mode the scene comes up in, its pictures included | tea-hero-11 |
| A lost WebGL context shows the poster until it is back, then the scene with its light made again | tea-hero-12 |
| Reduced motion turned on while the scene runs puts the poster back, the page where it was, and frees every geometry and picture the scene put on the GPU | tea-hero-13 |
| With the scene up the switch fetches no poster under the canvas | tea-hero-14 |
| The poster and the scene take the same shape of frame, a square window included | tea-hero-15 |
| A missing manifest or model keeps the poster and the hero one screen, with no page error | tea-hero-16 |
| Save-Data and a small device keep the poster and fetch none of the 3D | tea-hero-17 |
| A reload inside the scene comes back to the same place in it; a new visit starts at the top | tea-hero-18 |
| The stage is one screen on every path, and the hero's foot fades into the page (static always, with the scene only as the pin lets go) | tea-hero-19 |
| The title box is the same box static and over the scene: no backdrop blur, an opaque card by day | tea-hero-20 |
| The box docks only where it leaves most of the frame to the scene (1024x768 flows, 1366x768 docks with the lens shift scaled) | tea-hero-21 (desktop) |
| On a portrait screen the box waits low and the scene (the tea house and the TV) stands clear above it, the scene keeps the portrait frame's full height, the pinned section is three screens as on every screen, and the camera's move plays over 0.8 of a screen of scroll at least after the box has gone | tea-hero-22 |
| A chapter link tapped in the last moments before the scene pins lands on its chapter, from a chapter (the pin no longer cuts the jump short) and from the top (nor lands it two screens early) | tea-hero-23 |
| Every part the manifest names (the nodes its tracks and idle waves move, the nodes lights and glows hang from, each prop's parent and each material override's node) is in the loaded models: the runtime would skip a missing one without a word | tea-hero-24 |
| Leaving the page while the scene loads (a reload as the manifest arrives, and as the models do) leaves no console error: once the page is being left the scene starts no load and reports none it loses | tea-hero-25 |
| One actor in place of another, on `/tea/` with the shipped manifest (its own followers and whole-actor `visible` and `opacity` tracks left out) plus a follower and a second actor made of its first actor's model, served in its place, so it holds whatever the cast is: down the scroll to 0.8 and back, the follower rides its leader's root and scale, an opacity dissolve (with `fade`) and a visible cut show and hide each actor as keyed, the dissolved-out actor comes back, and nothing reaches the console | tea-hero-26 |
| The shipped scene on the page: the cast is the TV alone, no actor is hidden at the top or follows another, every actor is drawn, and down the scroll and back (0 to 1 in tenths, a step either side of any cut) neither the number of point lights drawn nor the number of pictures on the GPU ever changes | tea-hero-27 |
| A beforeunload that does not lead to leaving (a mailto link fires it in some browsers) while the models load costs nothing: the scene comes up, nothing logged (the scene stops its loads on pagehide only, so the page stays eligible for the back/forward cache) | tea-hero-28 |
| Under 1024 px no line of the title box (skip link, statement, counter, chapter numerals) runs under the fixed day/night switch's column as the box scrolls up under it: on a phone, static or over the scene, with the counter on one line, and at 561, 600 and 640 px wide | tea-hero-29 |
| The page's own mailto link clicked while the models load costs nothing: Chromium sends a beforeunload and the scene loads on; WebKit cancels the loads in flight, which the scene tries again, and comes up with nothing logged | tea-hero-30 |

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
