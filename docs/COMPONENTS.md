# Post components

Every `<ao-*>` tag a post can use from its Markdown. Each lives in `src/elements/<tag>/` (`element.js`, and
`style.css`, inlined into the article of the posts that use it); the tag names and attributes are frozen
(`ARCHITECTURE.md`, "Contracts"). Every post also gets, with no tag, one player at a time, the now-playing bar and
the image viewer (`src/elements/_core/`).

Each section says what the component is for, its attributes, the least markup that works, its behaviours (the rows
of `tests/e2e/INVENTORY.md`) and the post that shows it best. `npm run check` reports a component folder with no
section here.

## <ao-ask>

## <ao-bars>

A bar chart drawn from a plain `<table>`, so the numbers are written once; the table stays for screen readers
(visually hidden once the chart is drawn) and is what a reader without JS gets.

| Attribute | |
|---|---|
| `max="N"` | the value a full-width bar stands for (default: the largest value); give two charts the same `max` to put them on one scale |
| `unit="…"` | printed after each value (`lessons`, `%`) |

Children: one `<table>`; its first column labels the rows, every other column is a series named by its `<th>`, on
one shared scale (several series get a legend). A cell that isn't a number draws no bar. An optional direct
`<figcaption>` captions the chart.

```html
<ao-bars unit="lessons" max="17">
<table><thead><tr><th>Source</th><th>Lessons</th></tr></thead>
<tbody><tr><td>Docs</td><td>12</td></tr><tr><td>Videos</td><td>5</td></tr></tbody></table>
<figcaption><b>Where the lessons came from</b></figcaption>
</ao-bars>
```

Behaviours: bars-1, bars-2. Used by 10 posts (`INVENTORY.md`); best shown by `curriculum-from-sources` (`max`,
`unit`, up to four series).

## <ao-blind>

## <ao-calc>

## <ao-compare>

A grid of same-sized frames, pictures or videos, so outputs are judged side by side.

| Attribute | |
|---|---|
| `cols="N"` | columns on a wide screen (default 2); a tablet shows at most 2, a phone 1 |
| `aspect="w/h"` | the frame every item is fitted into, letterboxed on one background (default `4/3`) |
| `sync` | its videos play, pause and seek together, as one player (`GROUPS` in `_core/player.js`) |

Children: one `<figure>` per item, an `<img>` or a `<video>` and an optional `<figcaption>` (a `<b>` title and a
`.ao-meta` line). `<figure class="wide">` spans the whole row, for a sheet that is already side by side.

```html
<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/x/a.webp" alt="…"><figcaption><b>A</b><span class="ao-meta">what it is</span></figcaption></figure>
<figure><img src="/media/x/b.webp" alt="…"><figcaption><b>B</b></figcaption></figure>
</ao-compare>
```

Behaviours: compare-1 to compare-3; its stills open in the image viewer. Used by 24 posts (`INVENTORY.md`); best
shown by `moonlight-two-cuts` (stills) and `storm-bell-fighter` (`sync`).

## <ao-cues>

One or more cuts of the same timeline (a music video and its re-edit, a film and its previs) played in lockstep
beside a list of timed cues: lyric lines, shots, chapters. The cue being played is lit, and a click on one sends
every cut there, so two cuts of a song are compared at the same bar instead of from memory. The first video sets the
clock and the others follow it (a small drift is closed with the playback rate, only a big gap with a seek); if one
cut runs out of buffer, all wait for it. Only one cut is heard at a time: a Sound button per cut picks it.

| Attribute | |
|---|---|
| `labels="A\|B"` | one tag per video (default: each video's `title`, else Cut 1, Cut 2) |

Children: one or more `<video>`, then an `<ol>` whose `<li data-t="m:ss.xx">` are the cues, then an optional
`<figcaption>`. Without JS: the videos with their own controls, and the cues as a plain list.

```html
<ao-cues labels="v1|v2">
<video src="/media/x/v1.mp4" preload="metadata"></video>
<video src="/media/x/v2.mp4" preload="metadata"></video>
<ol><li data-t="0:21">The first verse</li><li data-t="1:44.97">The drop</li></ol>
<figcaption><b>Two cuts of one song</b></figcaption>
</ao-cues>
```

Behaviours: cues-1 to cues-9 (cues-3b, space on a cut, is broken on main). Used by `moonlight-two-cuts` (the best
example) and `moonlight-five-times`.

## <ao-demo>

## <ao-diff>

Versions of the same text with the changed words marked, so a reader sees what an edit, a fact-check or a judge did
to a line instead of being told. One button per version: an earlier one shows its words struck through where they
were cut and the last version's new words underlined (a word-level diff against the last); the last shows as it
stands.

| Attribute | |
|---|---|
| `labels="Draft\|Final"` | one name per version, in order (default Version 1, 2, …) |

Children: one `<blockquote>` per version, the last being the one the others are compared to; an optional
`<figcaption>` sits underneath. Without JS the blockquotes and the caption stack.

```html
<ao-diff labels="Draft|Final">
<blockquote>The first take of the line.</blockquote>
<blockquote>The line as it went out.</blockquote>
<figcaption><b>What the edit did</b></figcaption>
</ao-diff>
```

Behaviours: diff-1. Used by `curriculum-from-sources`, `first-lesson-on-the-new-map` and `the-missing-map` (the
best example).

## <ao-fetch>

HTTP requests the reader sends from their own browser, each with its answer as it arrives: the status, the headers
that matter, the bytes received and the time taken. For posts whose claim is what a server does, so the reader
checks it live instead of trusting a pasted curl. Same origin only (the site's own files); nothing is sent until a
click. A body is counted, not kept, and reading stops at `cap`; Send all runs every row in turn.

| Attribute | |
|---|---|
| `cap="2000000"` | the most bytes of a body read before it stops (default 2 MB; no post sets it today) |
| `data-url` (on a row) | the request's path |
| `data-range="bytes=a-b"` (on a row) | optional: sent as a Range header; a 200 answer then says the range was ignored |
| `data-method="HEAD"` (on a row) | optional (default GET; no post uses it today) |
| `data-show="body"` (on a row) | also prints the body's first 4 KB, JSON indented, for small text answers |

Children: an `<ol>` of `<li data-url="…">` whose text is the label, then an optional `<figcaption>`.

```html
<ao-fetch>
<ol>
<li data-url="/media/x/clip.mp4" data-range="bytes=0-1023">The first KB of the clip</li>
<li data-url="/version.json" data-show="body">What the site is running</li>
</ol>
</ao-fetch>
```

Behaviours: fetch-1 to fetch-3. Used by `every-video-can-seek` (the best example) and `the-branch-that-went-live`.

## <ao-frames>

A video the reader steps through one frame at a time, for animation where the point is a frame or two (an impact
frame, a hit-stop, a smear) that playback hides. It adds previous and next frame, play and pause, a quarter-speed
toggle, a frame counter and, optionally, buttons that jump to labelled frames; with the video focused, the left and
right arrows step too.

| Attribute | |
|---|---|
| `fps="24"` | the clip's frame rate (default 24); frame n is shown at (n + 0.5) / fps |
| `marks="46:Impact\|47:Red frame"` | optional: one button per frame, with its label (`46` alone reads Frame 46) |

Children: one `<video>` and an optional `<figcaption>`. Without JS it is the plain video.

```html
<ao-frames fps="24" marks="46:Impact|47:Red frame">
<video src="/media/x/hit.mp4" preload="metadata" muted playsinline></video>
<figcaption><b>The hit</b><span class="ao-meta">frames 46 and 47</span></figcaption>
</ao-frames>
```

Behaviours: frames-1 to frames-3. Used by `ai-rigging-vs-a-script` (and its notes), `paper-jefrie` and
`storm-bell-pop-up` (the best example).

## <ao-funnel>

## <ao-game>

A game from `public/games/` (or `public/labs/`) played inside the post. Nothing downloads until the reader asks: a
poster and a Play button first, then the game's own page in a frame, with Fullscreen, Stop and an "own tab" link
under it. A running game is a player: scrolled away, with the tab hidden, when anything else plays or when the
homepage closes the reader, it pauses (its frames held, its AudioContexts suspended) behind a veil that resumes it.

| Attribute | |
|---|---|
| `src` | the game's page, e.g. `/games/storm-bell/` (same origin) |
| `poster` | the still shown before it loads |
| `size` | printed on the button, so the reader knows what the click costs |
| `label` | what it is, for the frame and for screen readers (default `Game`) |
| `aspect="w/h"` | the frame (default `16/9`) |
| `note` | one line under the frame: controls, what it needs |

The inner markup, a link to the game, is the no-JS fallback.

```html
<ao-game src="/games/x/" poster="/media/x/poster.webp" size="about 20 MB" label="X, playable in the browser"
  note="Keyboard: A / D move, J hit."><a href="/games/x/">Play X</a></ao-game>
```

Behaviours: game-1 to game-8, core-3. Used by `storm-bell-fighter` (`/games/storm-bell/`, the best example) and
`loom-and-information-flow` (`/labs/mini-loom/`, `/labs/info-flow/`).

## <ao-listen>

Several renders of the same audio, compared by ear at the same moment. One player for the whole set: picking
another clip keeps the playhead where it was, so the reader hears the same word under each treatment, and A/B flips
to the reference clip and back. Each clip's spectrogram spans its length; the playhead runs across it and a click
seeks. With the list focused, up and down pick a clip, space plays, C flips A/B. It is one player on the page.

| Attribute | |
|---|---|
| `ref="id"` | the clip A/B compares against (default: the first) |

Children: one `<figure data-id="…">` per clip, holding an `<audio>`, an optional spectrogram `<img>` and a
`<figcaption>` (its `<b>` names the clip, its `.ao-meta` describes it); a direct child `<figcaption>` captions the
set. At least two clips. Without JS the figures stack with native controls.

```html
<ao-listen ref="raw">
<figure data-id="raw"><audio src="/media/x/raw.mp3" controls></audio><img src="/media/x/raw.webp" alt="">
<figcaption><b>Raw</b><span class="ao-meta">as recorded</span></figcaption></figure>
<figure data-id="fixed"><audio src="/media/x/fixed.mp3" controls></audio><img src="/media/x/fixed.webp" alt="">
<figcaption><b>Fixed</b><span class="ao-meta">after the pass</span></figcaption></figure>
</ao-listen>
```

Behaviours: listen-1 to listen-4, core-3. Used by `bad-very-bad` (and its notes), `remora-voice-lab` (the best
example) and `showreel-rebuilt`.

## <ao-matrix>

## <ao-model>

A GLB the reader can turn around. Nothing heavy loads until they ask: the poster and a button first, then three.js
and the model on the click. Drag to orbit, scroll or pinch to zoom; it turns slowly on its own until touched (not
with reduced motion), draws only while on screen, and frees the GPU when the post leaves the page.

| Attribute | |
|---|---|
| `src` | the `.glb` (keep it a few MB: 1K textures, about 30k triangles is plenty) |
| `poster` | the still shown before it loads |
| `size` | printed on the button, so the reader knows what the click costs |
| `label` | what it is, for the button and for screen readers (default `3D model`) |
| `ratio="wide"` | a 0.56 frame instead of 0.8 (no post uses it today) |

```html
<ao-model src="/media/x/model.glb" poster="/media/x/model.webp" size="2.1 MB" label="X, in 3D"></ao-model>
```

Behaviours: model-1, model-2, overlay-3. Used by `jefrie-in-3d` (the best example) and `props-three-budgets`.

## <ao-pan>

## <ao-runs>

## <ao-series>

## <ao-shots>

## <ao-slider>

Two images of the same frame, one over the other, with a divider the reader drags (or moves with the arrow keys)
to wipe between them: before and after, where the difference is in the detail. A Full size button opens both in the
image viewer, since the frame itself is all slider.

| Attribute | |
|---|---|
| `aspect="w/h"` | the frame both images are fitted into (default `16/9`) |
| `labels="A\|B"` | the tags of the left and right image (default: each image's `alt`, else Before and After) |
| `start="50"` | where the divider starts, in percent |

Children: the first `<img>` is the left side, the second the right; an optional `<figcaption>` sits under the frame.
Without JS the two images and the caption stack.

```html
<ao-slider aspect="16/9" labels="Before|After">
<img src="/media/x/before.webp" alt="…"><img src="/media/x/after.webp" alt="…">
<figcaption><b>The fix</b><span class="ao-meta">what changed</span></figcaption>
</ao-slider>
```

Behaviours: slider-1 to slider-4, viewer-10. Used by 8 posts (`INVENTORY.md`); best shown by `crimson-coil`.

## <ao-timeline>

Events from several sources at once (sessions, agents, people) in one time order, each on its own rail, so what
overlapped shows at a glance. View buttons dim every event one party couldn't see.

| Attribute | |
|---|---|
| `lanes="a:Session A\|b:Session B"` | each rail's key and label, left to right |
| `views="b:What B could see"` | optional: one button per key, dimming every event whose `data-in` lacks it; Everything restores |

Children: one `<ol>`; each event is an `<li data-lane="a" data-in="b c">` with a `<time>` first. Without JS it is
an ordered list with times, which is the whole content.

```html
<ao-timeline lanes="a:Session A|b:Session B" views="b:What B saw">
<ol>
<li data-lane="a" data-in="a b"><time>13:05</time> A pushes the branch.</li>
<li data-lane="b" data-in="b"><time>13:07</time> B reads it.</li>
</ol>
</ao-timeline>
```

Behaviours: timeline-1, timeline-2. Used by 8 posts (`INVENTORY.md`); `views` is best shown by `the-planted-lie`.

## <ao-transcript>

Narrated videos with their captions laid out as a transcript the reader can read, search and click, so two versions
of one lesson are compared by what they actually say. A click (or Enter) on a line plays that video from there; the
line being spoken is lit; the search box and the preset chips mark and count a term in every transcript at once.

| Attribute | |
|---|---|
| `find="cache\|security"` | preset search terms, one button each; pressing one again clears it |

Children: one or more `<figure>`, each a `<video>` carrying `<track kind="captions" src="….vtt">` and a
`<figcaption>`; then an optional `<figcaption>` for the set. Without JS: the videos, with the captions as native
subtitles.

```html
<ao-transcript find="cache|security">
<figure><video src="/media/x/v1.mp4" preload="none" controls><track kind="captions" src="/media/x/v1.vtt"
  srclang="en" label="English"></video><figcaption><b>Version 1</b></figcaption></figure>
<figure><video src="/media/x/v2.mp4" preload="none" controls><track kind="captions" src="/media/x/v2.vtt"
  srclang="en" label="English"></video><figcaption><b>Version 2</b></figcaption></figure>
</ao-transcript>
```

Behaviours: transcript-1 to transcript-5. Used by `every-video-can-seek`, `lessons-sent-back` (the best example)
and `loom-and-information-flow`.

## <ao-treemap>
