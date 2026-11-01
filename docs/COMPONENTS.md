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

## <ao-series>

## <ao-shots>

## <ao-slider>

## <ao-timeline>

## <ao-transcript>

## <ao-treemap>
