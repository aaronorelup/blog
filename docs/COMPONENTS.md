# Post components

Every `<ao-*>` tag a post can use from its Markdown. Each lives in `src/elements/<tag>/` (`element.js`, and
`style.css`, inlined into the article of the posts that use it); the tag names and attributes are frozen
(`ARCHITECTURE.md`, "Contracts"). Every post also gets, with no tag, one player at a time, the now-playing bar and
the image viewer (`src/elements/_core/`).

Each section says what the component is for, its attributes, the least markup that works, its behaviours (the rows
of `tests/e2e/INVENTORY.md`) and the post that shows it best. `npm run check` reports a component folder with no
section here.

## <ao-ask>

Questions put to an AI agent, each with the tool call it became and what came back, so a reader sees what a
connection can answer and can take the question for their own. With JS: a filter per connection (when there is more
than one), a Copy button on each question, and one question open at a time. Without JS: the details, which already
open and close. No attributes of its own.

Children: one `<details data-via="Connection" data-tool="tool_name">` per question, holding a `<summary>` (the
question as asked), then whatever shows the call (`<pre>`) and the answer (`<p>`, `<ul>`); then an optional
`<figcaption>`. `data-via` and `data-tool` are shown as a tag on the question.

```html
<ao-ask>
<details data-via="Cloudflare" data-tool="query_worker_observability"><summary>How many visits did the post get?</summary>
<pre>query_worker_observability(view: "events", filter: path = "/ledger/x/")</pre><p>312 requests, 41 from people.</p></details>
<figcaption><b>Asking the analytics</b></figcaption>
</ao-ask>
```

Behaviours: ask-1, ask-3 (ask-2, the filter, is skipped: the one page has one connection). Used by 1 post
(`INVENTORY.md`): `who-visits-a-new-website`.

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

Rows of outputs made from the same brief (one row per prompt, one figure per model, agent or setting), shown
labelled, with a "Judge blind" button. Blind, each row is shuffled, every caption is hidden and the pictures stop
opening the viewer (its caption would give the answer away); the reader picks one per row, then Reveal puts the
labels back, marks the picks and counts them. A figure with `data-verdict="…"` carries someone else's pick (a judge
agent, a reviewer), shown on reveal and compared with the reader's.

| Attribute | |
|---|---|
| `aspect="w/h"` | the frame every picture is fitted into (default `4/3`) |

Children: `<div data-row="Row title">` each holding two or more `<figure>`s (an `<img>` and a `<figcaption>` whose
`<b>` is the label), then an optional `<figcaption>` for the set. Without JS the rows are plain figures with their
captions.

```html
<ao-blind aspect="1/1">
<div data-row="A lighthouse at dusk">
<figure><img src="/media/x/a.webp" alt="…"><figcaption><b>Model A</b></figcaption></figure>
<figure data-verdict="Judge's pick"><img src="/media/x/b.webp" alt="…"><figcaption><b>Model B</b></figcaption></figure>
</div>
<figcaption><b>Same prompt, two models</b></figcaption>
</ao-blind>
```

Behaviours: blind-1, blind-2. Used by 2 posts (`INVENTORY.md`); best shown by `props-three-budgets`.

## <ao-calc>

A calculator the reader can turn, for a post whose numbers depend on choices (how many minutes, how many takes per
keeper, which size). No attributes of its own: everything is on its list items.

Children: a `<ul>` of inputs, an `<ol>` of results, an optional `<figcaption>`.

| On an input `<li>` | |
|---|---|
| `data-var="name"` | the variable it sets; the item's text is its label |
| `data-min` `data-max` `data-step` `data-value` | a slider (default 0 to 100, any step, starting at `data-min`); `data-unit` is printed after its value |
| `data-options="736×416:7\|1344×768:19"` | one button per option instead; the variable takes the number after the colon; `data-value` names the option that starts pressed (default the first) |

| On a result `<li>` | |
|---|---|
| `data-f="mins / 60 * size * 1.09"` | the formula: `+ - * / ^`, parentheses, `min max round ceil floor abs`, and the variables above; one that doesn't parse shows `–` (and a console warning) |
| `data-prefix` `data-unit` `data-digits` | printed before and after the number, and its decimals (default 0) |

Without JS the labels stay as two plain lists, so the caption should carry one worked example.

```html
<ao-calc>
<ul><li data-var="mins" data-min="1" data-max="60" data-step="1" data-value="10" data-unit="min">Finished video</li>
<li data-var="size" data-options="736×416:7|1344×768:19" data-value="1344×768">Clip size</li></ul>
<ol><li data-f="mins / 60 * size * 1.09" data-prefix="$" data-digits="2">Cost</li></ol>
<figcaption><b>What a video costs</b> Ten minutes at 1344×768: $3.45.</figcaption>
</ao-calc>
```

Behaviours: calc-1 to calc-4. Used by 1 post (`INVENTORY.md`): `renting-a-gpu`.

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

A total, then what each layer takes out of it, down to what is left: requests down to the ones that were people,
renders down to the keepers. One bar at the top shows the whole split; each row shows what it took and what was
left, and a row and its segment light together. Without JS: the list, with the numbers as written.

| Attribute | |
|---|---|
| `unit="pages"` | printed after the total |

Children: an `<ol>` whose `<li>` each hold a `<b>` label, a `<data value="…">` and a short note, optionally followed
by a nested `<ul>` of examples that opens on request ("What's in it"); then an optional `<figcaption>`. It needs at
least two items with a `<data>`.
- The first value is the total; a negative value is what that layer removes.
- A positive value after the first is a count measured another way ("of these, about 290 ran the script"): what it
  leaves out is shown as unconfirmed (striped), not as removed, so the end of the bar reads as a range.
- A value written `~290` is an estimate, and every figure after an estimate is rounded to tens.

```html
<ao-funnel unit="requests">
<ol><li><b>Every request</b> <data value="2000">2,000</data> in the logs</li>
<li><b>Bots</b> <data value="-1634">−1,634</data> said so in their user agent<ul><li>Googlebot</li></ul></li>
<li><b>Ran the script</b> <data value="290">~290</data> counted by the page itself</li></ol>
<figcaption><b>Who visited</b></figcaption>
</ao-funnel>
```

Behaviours: funnel-1 to funnel-4. Used by 2 posts (`INVENTORY.md`); best shown by `who-visits-a-new-website`.

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

A picture far wider than the page (a panorama, a long strip, a storyboard), shown at a readable height and panned
across instead of shrunk to a sliver. Drag it, swipe it, use a trackpad, or focus it and use the arrow keys (Shift
for bigger steps, Home and End jump to the ends); a minimap under it shows the whole picture and where the frame
is, and a click or drag on it jumps there. Glide pans slowly to the end (any touch, a wheel or `ao-stop` stops it);
Full size opens the picture in the image viewer.

| Attribute | |
|---|---|
| `views="A\|B"` | two or more `<img>`s become views of one place, one button each; the frame keeps its place as a fraction of the width, so pictures of different lengths (an 8:1 and a 12:1 strip) are compared at the same point of their story |
| `stops="0.3:Bridge\|0.8:Gate"` | buttons that glide the frame's centre to a fraction of the width (a bare number is labelled as a percentage) |
| `height="360"` | the frame's height in px on wide screens (phones get less) |

Children: one or more `<img>`, then an optional `<figcaption>`. Without JS: the images and caption stack, at the
page's width.

```html
<ao-pan height="360" views="Day|Night" stops="0.3:Bridge|0.8:Gate">
<img src="/media/x/day.webp" alt="The town by day, end to end">
<img src="/media/x/night.webp" alt="The same town at night">
<figcaption><b>One street, 12:1</b></figcaption>
</ao-pan>
```

Behaviours: pan-1 to pan-6. Used by 1 post (`INVENTORY.md`): `moss-image-on-8gb`.

## <ao-runs>

When each agent of a run (a workflow, a fleet, a night of scheduled jobs) started and stopped, drawn on one clock.
One lane per phase, in the order phases first appear; agents that overlap inside a phase stack, so a fan-out reads
as a tall block and a lone agent as a thin line. Pointing at a bar, or moving along them with the arrow keys (Home
and End jump to the ends), names the agent and its length.

| Attribute | |
|---|---|
| `start="HH:MM"` | where the axis starts (default: the first start); it also puts two-part times on a clock |
| `end="HH:MM"` | where the axis ends (default: the last end) |

Children: one `<table>` whose body rows are label, phase, start, end, then an optional `<figcaption>`. A time is a
clock time (`HH:MM:SS`, same day) or `m:ss` / plain seconds from the start of the run; the table is on a clock when
any start has three parts or the element has `start`. A row whose times don't read, or that ends before it starts,
is left out. The table stays for screen readers (visually hidden once drawn); without JS it is the table.

```html
<ao-runs>
<table><thead><tr><th>Agent</th><th>Phase</th><th>Start</th><th>End</th></tr></thead>
<tbody><tr><td>planner</td><td>Plan</td><td>0:00</td><td>1:40</td></tr><tr><td>writer 1</td><td>Write</td><td>1:40</td><td>9:05</td></tr></tbody></table>
<figcaption><b>One run, agent by agent</b></figcaption>
</ao-runs>
```

Behaviours: runs-1 to runs-3. Used by 2 posts (`INVENTORY.md`); best shown by `the-clock-nobody-checked`.

## <ao-series>

Numbers per day (or per any ordered label) drawn as one column each, from a plain `<table>`, so the figures are
written once and the table stays for screen readers and readers without JS. Pointing at a day, or focusing the chart
and using the arrow keys (PageUp and PageDown move a week, Home and End to the ends), reads out every series and any
marks for that day.

| Attribute | |
|---|---|
| `show="Name"` | the series drawn first (default: the first); a button per series switches |
| `avg="7"` | also draws the trailing N-day average as a line over the columns |
| `stack` | every series stacked in one column per day instead; the legend's buttons hide and show a layer, and the scale follows what is shown |

Children: one `<table>`: the first column is the day (`YYYY-MM-DD`, read out as "Tue 30 Sep", in UTC) or any label,
every other column a series named by its `<th>`; `<th data-unit="MB">` prints its unit. Then an optional `<ol>` of
`<li data-d="YYYY-MM-DD">…</li>` that marks days under the axis (a post going up, a deploy), and an optional
`<figcaption>`.

```html
<ao-series show="Visits" avg="7">
<table><thead><tr><th>Day</th><th>Visits</th><th data-unit="MB">Sent</th></tr></thead>
<tbody><tr><td>2026-09-30</td><td>120</td><td>48</td></tr><tr><td>2026-10-01</td><td>95</td><td>31</td></tr></tbody></table>
<ol><li data-d="2026-10-01">The post went up</li></ol>
<figcaption><b>A month of visits</b></figcaption>
</ao-series>
```

Behaviours: series-1 to series-3 (`stack` and `th[data-unit]` are used by no page today). Used by 2 posts
(`INVENTORY.md`); best shown by `who-visits-a-new-website`.

## <ao-shots>

A video with its shots laid out as a strip of thumbnails under it, so a reader sees the whole edit at a glance and
jumps to any shot: reels, trailers, films, cuts. No attributes.

Children: one `<video>`, then an `<ol>` whose `<li data-t="m:ss.xx">` each hold an `<img>` (the shot's thumbnail)
and a short label, then an optional `<figcaption>`. A click plays from that shot; the shot being played is lit and
kept in view inside the strip (never by scrolling the page); the arrow keys move along the strip. Without JS: the
video, then the thumbnails as a plain list.

```html
<ao-shots>
<video src="/media/x/reel.mp4" controls preload="metadata"></video>
<ol><li data-t="0:00"><img src="/media/x/s1.webp" alt="">Cold open</li><li data-t="0:05.4"><img src="/media/x/s2.webp" alt="">Title</li></ol>
<figcaption><b>The reel, shot by shot</b></figcaption>
</ao-shots>
```

Behaviours: shots-1. Used by 3 posts (`INVENTORY.md`); best shown by `showreel-rebuilt`.

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

Parts of a whole whose parts have parts, drawn as nested rectangles with areas in proportion. Written once as a
plain `<table>`: the first column is the groups (projects), every other column a kind of part (languages), the cells
amounts. Each group is a block, its parts tiles coloured by column. Pointing at a tile, or focusing the chart and
using the arrow keys (Home and End to the ends), reads it out. The table stays for screen readers (visually hidden
once drawn); without JS it is the table.

| Attribute | |
|---|---|
| `views="By project\|By language"` | a second view turns it inside out: one block per column, the groups as its tiles (one button per view, the first two only) |
| `top="6"` | keeps the six largest columns and folds the rest into "Other" |
| `unit="lines"` | printed after each amount in the read-out |
| `aspect="w/h"` | the chart's frame on wide screens (default `16/10`; a phone gets `4/5`) |

Children: one `<table>`, then an optional `<figcaption>`. Rows with no amount above zero are left out.

```html
<ao-treemap views="By project|By language" top="6" unit="lines">
<table><thead><tr><th>Project</th><th>JavaScript</th><th>CSS</th></tr></thead>
<tbody><tr><td>blog</td><td>18,200</td><td>6,100</td></tr><tr><td>games</td><td>9,400</td><td>800</td></tr></tbody></table>
<figcaption><b>Where the code is</b></figcaption>
</ao-treemap>
```

Behaviours: treemap-1 to treemap-3. Used by 1 post (`INVENTORY.md`): `counting-the-code`.
