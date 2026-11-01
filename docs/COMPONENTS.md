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

## <ao-demo>

## <ao-diff>

## <ao-fetch>

## <ao-frames>

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

## <ao-timeline>

## <ao-transcript>

## <ao-treemap>
