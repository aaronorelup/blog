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

## <ao-compare>

## <ao-cues>

## <ao-demo>

## <ao-diff>

## <ao-fetch>

## <ao-frames>

## <ao-funnel>

## <ao-game>

## <ao-listen>

## <ao-matrix>

## <ao-model>

## <ao-pan>

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
