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

## <ao-treemap>
