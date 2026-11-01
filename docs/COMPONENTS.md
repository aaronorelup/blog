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

## <ao-cues>

## <ao-demo>

An interactive demo written for one post. Its code is `src/elements/ao-demo/demos/<name>/index.js`, its own chunk,
fetched only when a post uses it, and its CSS is `demos/<name>/style.css`, inlined into that post's article only. The
module exports `mount(host, part)`, which returns `{ destroy }` (called when the element leaves the page, as the
homepage's reader swaps posts) or `null`. Whatever the element held before is the no-JS fallback. A name with no
folder leaves the fallback; a chunk that fails to load leaves it too, and the next connect tries again.

| Attribute | |
|---|---|
| `name="synthid"` | the demo: the folder under `demos/` |
| `part="tournament"` | which part of it to mount; an unknown part leaves the fallback |
| `data-slug="…"` | `cf`'s `count` only: the post whose reads it counts (default: the page's own slug) |

```html
<ao-demo name="synthid" part="tournament">The tournament needs JavaScript: each word is picked by a knockout of + and − rounds.</ao-demo>
```

The demos:
- **`synthid`** (`claude-text-watermark`): SynthID-Text small enough to watch. `model.js` is the published watermark
  (the paper's g-values, tournament update, masking and mean score, with our own hash) over a toy model, a letter
  of weighted word choices; `ui.js` the shared pieces. Parts: `tournament` (how one token is picked), `certain` (why
  a token with one right answer comes out the same), `detect` (the checker counts the +), `edit` (what edits and
  tricks do to the count), `book` (expected detection for a long text after editing).
- **`cf`** (`who-visits-a-new-website`): `you` asks Cloudflare's edge what it saw of this visit (`/cdn-cgi/trace`,
  only on aaronorelup.com), masks the address until shown, and walks the visit through the post's funnel; `count` is
  the post's live reader counter from `/api/reads` (`worker/reads/`), one read per browser per day after a few
  seconds in view, never from an automated browser.

Behaviours: demo-synthid-1 to demo-synthid-5, demo-cf-1, demo-cf-2. Used by 2 posts (`INVENTORY.md`).

## <ao-diff>

## <ao-fetch>

## <ao-frames>

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

## <ao-listen>

## <ao-matrix>

One subject run through a grid of settings (a method per row, a target per column), every cell shown the same size,
with buttons that switch every cell between views of the same output at once (textured / clay, before / after,
front / back). Switching views on one matrix switches every matrix on the page that has the same views, so a reader
comparing two subjects keeps one look. Only the pictures in view open in the image viewer, and they page through in
order. Without JS: the rows, every picture showing.

| Attribute | |
|---|---|
| `cols="A\|B\|C"` | column headings, left to right (on a phone each cell carries its own) |
| `views="X\|Y"` | one button per view; a cell's nth `<img>` is its nth view (default: one view) |
| `aspect="w/h"` | the frame every picture is fitted into (default `1/1`) |

Children: one `<div data-row="Label|note">` per row, holding a `<figure>` per cell (its `<img>`s, one per view, and
an optional `<figcaption>`); `<figure class="none">text</figure>` is an empty cell, and a short row is filled with
empty cells. Then an optional `<figcaption>` for the set. A view only fetches its pictures once someone asks for it.

```html
<ao-matrix cols="Front|Side" views="Textured|Clay" aspect="1/1">
<div data-row="Method A|30 s">
<figure><img src="/media/x/a-front.webp" alt="…"><img src="/media/x/a-front-clay.webp" alt="…" loading="lazy"></figure>
<figure class="none">Failed</figure>
</div>
<figcaption><b>Two methods, two angles</b></figcaption>
</ao-matrix>
```

Behaviours: matrix-1 to matrix-3. Used by 2 posts (`INVENTORY.md`); best shown by `props-three-budgets`.

## <ao-model>

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

## <ao-timeline>

## <ao-transcript>

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
