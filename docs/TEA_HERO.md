# The tea room hero (`/tea/`): runtime, manifest, tools

Built on branch `feat/alt-view-hero` (the hero runtime, 2026-11-10) and wired into the tea room on `tea/hero`
(2026-11-11), on top of tea-core's `/tea/` page. This file is meant to be enough on its own for a session that only
has the repo.

**The lab page, `src/pages/tea-lab.astro` (`/tea-lab/`), is temporary.** It is a development page kept so the hero
can run alone and try a variant manifest (`?manifest=`). The final models are in; it stays, hidden, while the scene
is still being tuned, and deleting it is a step of "Next steps". It carries its own robots noindex, is in no sitemap,
feed or search index, and nothing links to it (tea-16); like every built page it is a line of `stats-pages.txt`, so
`/stats` may name it if it gets visits. It doesn't rename the main site's stylesheet (it imports `tea.css`, not
`site.css`).

## What it is

The top of `/tea/` copies the structure of the Shopify Editions Winter '26 hero: two characters in motion around one
object, in front of one picture placed in 3D space, with a framed title box. Ours: the tea house garden at night,
Jefrie (left) and Yusef (right, with a lantern) around a small CRT television. Everything is real-time Three.js:

- **Scroll timeline.** With the scene the section is 300vh and pinned (two layouts, below). One progress value (0 to
  1) drives the camera along a Catmull-Rom path (wide shot; as the title box docks a drift left and in, which slides
  the TV out from under the docked box; then in between the characters toward the tea house door; a portrait screen
  has a path of its own) and every character track at once. The moment the brief asks for: Jefrie crouches while the
  box is still centred (0.03 to 0.09), springs as it docks, is cut to her pose-baked leap mesh in the air (0.135),
  flies across the garden toward the path, is cut back to her rig as she comes down (0.375), lands with her weight
  taken (to 0.45), turns and walks to the door (0.55 to 1) with her tail coiled at her heels. Yusef flutters from the
  right edge of the opening frame to his place as the box docks, then waits by the door with the lantern; by 1 both
  flank the door.
- **Idle loop on top:** breathing bob, sway, wing beats, lantern swing, tail curl, antenna wobble, the TV screen's
  emissive shader (moon, scanlines, rolling bar, grain, flicker shared with its light and glow), drifting motes
  (fireflies and petals, one Points draw).
- **Pointer parallax** (mouse), device tilt where no permission prompt is needed (Android), a slow drift otherwise.
- **Day and night** follow `data-mode` on `<html>` (the site's `scene-mode`), tweened live. Night is moonlight,
  lantern and TV glow; day is a warm dusk (separate picture, lights lerped).
- **Lazy and safe.** After first paint and idle, `boot.js` checks `?hero=off`, reduced motion, Save-Data / 2g, a small
  device (`deviceMemory < 2` or `hardwareConcurrency < 3`; `?hero=on` skips these two) and WebGL, then imports the
  3D chunk. Any failure leaves the poster, with the reason in `data-3d-off` on the section (`asked`, `reduced
  motion`, `save data`, `small device`, `no webgl`, `failed`). Reduced motion turned on while the scene runs puts the
  poster back the same way; a lost WebGL context shows the poster until the context is back. Drawing stops when the
  hero is off screen or the tab is hidden. Pixel ratio capped at 1.75 (1.5 on touch or small screens; fewer motes).
  Leaving the page while the scene loads leaves nothing in the console (tea-hero-25): from `pagehide` (listened for
  only until the scene's files are in) `boot.js` aborts its loads: the manifest and the models are fetched with that
  signal (not by three's FileLoader, whose streamed read leaves a cut body as an unhandled rejection), a model's own
  pictures load through a texture loader that then starts none and reports no failure, and `mount` stops waiting
  (`data-3d-off="failed"` on the page being left). WebKit cuts a page's loads earlier, at `beforeunload`: a model
  picture that fails is reported only 1.5 s later, and not at all once the page is being left. `beforeunload` itself
  is not listened for: it may not lead anywhere (a mailto link fires it in some browsers, and the page stays: the
  scene comes up all the same, tea-hero-28), and a listener keeps Firefox from caching the page for the way back.
- **Nothing moves under the reader.** The section grows by two screens when the scene pins, so the pin waits for a
  moment when that moves nothing the reader reads (`whenPinnable` in `pin.js`): the scroll at rest (no scroll for 200 ms
  and none over the next two frames, so a chapter link tapped just before the pin gets its jump), and the page at its
  top or the title box above the screen (then the scroll moves by the growth). A reader with the box on screen keeps
  the poster until they go back to the top or past it. A reload or a way back to a place inside the pinned scene
  lands there again (`onLeave`/`placeBack`). `data-hero-settled` on the section says the hero will change no layout
  by itself any more: set with `data-3d-off` on the static path, and once the scene is pinned and its first frame is
  up. Tests that need the page to hold still wait for it (or open `/tea/?hero=off`). An address with a chapter
  (`/tea/#projects`) lands on it at once, before the scene pins (`layouts/TeaPage.astro`, tea-17): with the page's
  `scroll-behavior: smooth`, phone WebKit glides its own scroll there while the page loads and, the page busy, stops
  part way down the ledger (with the scene or without it); the first link followed on the page glides again.

## The first picture, on every path

The poster, a still of the scene's opening frame (progress 0, idle time 0, pointer centred), is the hero's picture
for everyone: one image for the mode and the screen's shape (`poster-{night,day}.webp` 1600x1067, the 3:2 of
`reference.aspect`, and under
`max-aspect-ratio: 1/1` `poster-{night,day}-tall.webp` 1050x1400, the 3:4 portrait frame that phones crop at the
sides), a CSS background in `stage.css`, so it needs no script and only the one that applies is fetched. The stage is
one screen at the top of the hero on every path, as the pinned stage is, so the poster is cropped the same before and
after the pin; once the canvas covers it the poster is taken away (`data-covered`), so a switch of mode fetches no
other poster under the canvas.

| Path | What is on screen | Notes |
|---|---|---|
| no JavaScript | the poster behind the title box, one screen | the page is all there; nothing else loads |
| reduced motion | the same | `data-3d-off="reduced motion"`, none of the 3D is fetched (e2e tea-hero-1) |
| no WebGL (also Save-Data, a small device, `?hero=off`, any failure) | the same | `data-3d-off` says why (tea-hero-2) |
| the scene loads | the poster, then the canvas fades in over the same frame (700 ms) | the posters are the opening frame (mean difference 1.2 to 3.6 of 255, best aligned at offset 0, at 1440x900, 1280x800, 1024x768, 768x1024 and 390x844, night and day), so nothing jumps; re-run `poster.mjs` after any change to the opening composition or the assets |

Why one picture: whoever arrives sees the same place and the same characters, with motion added where it can run;
the 3D path's first seconds show the frame the scene comes alive from. Phase 1's SVG garden (`TeaNight.astro`) was
retired with this: a different drawing under the scene would cross-fade into a different picture.

Before first paint the page loads its HTML, CSS, fonts, its small scripts (`boot.js` among them, 1.2 KB) and the one
poster. Never three, the loader, the manifest, the models or the picture layers: tea-hero-3 checks every 3D request
starts after first paint.

## Layouts

`cover.css` (tea-core) lays out the static hero: the section at least one screen tall (`min-height: 100svh`), the box
centred in `.tea-hero-pin`'s padding, which lives in `--tea-hero-pt`, `--tea-hero-pb` and `--tea-hero-px` on
`.tea-hero` (84/56 px and the page's side padding; 76/40/14 px under 561 px). With the scene (`data-3d="on"`),
`stage.css` makes the section 300vh and `pin.js` picks `data-hero-layout`, again on every resize:

- **`dock`** (a landscape screen where the box fits, its height plus the two paddings at most the window's, and where
  docked it would cover at most 37% of the width: 1280 and wider; a 4:3 screen such as 1024x768 or 1180x820 flows):
  `.tea-hero-pin` sticks (100svh). The box is placed absolutely exactly where the static layout centred it, then from
  progress 0.1 (`data-hero-phase="docked"`) glides lower left (`--tea-dock-x`; `--tea-dock-low`, which keeps it clear
  of the day/night switch at the foot of a 1024 px+ screen) to `--tea-dock-scale` (.8), with the statement and the
  counter folded away (still read out). The glide (`data-hero-glide`) comes on only once the open place is laid out,
  so the box never slides in when the layout changes. While it is docked the scene's lens shift (`camera.dock.shift`,
  scaled by the share of the width the box covers against `camera.dock.cover`) slides the picture right, eased like
  the box's own move, so the characters stand clear of it (see "Composition").
- **`flow`** (a portrait screen, a box that doesn't fit, or a 4:3 one): the pin becomes a grid as tall as the
  section, the stage sticks (100svh) and the box keeps the static layout's place in the first screen and scrolls away
  with the page. The scene holds its opening frame until the box's foot has passed 30% of the screen (`leadOf` in
  `pin.js`, the "lead", a share of the scroll, at most half), then plays over the rest.

On a portrait screen the box waits low in the first screen (`--tea-hero-pt` max(76px, 61svh) in `stage.css`, on every
path): the portrait camera stands the cast in the top 60% of the frame, so the first screen shows the characters and
the TV above the box's title, the rest of the box below the fold.

Both layouts start with the box's rectangle identical to the static one, so the scene arriving moves nothing: the box
is within 1 px of its static place on every frame of the mount (tea-hero-8), the stage keeps its size, CLS 0 from the
mount at 1440x900 and 390x844. The hero's foot fades into the page (the stage's `::after`, under the box): always on
the static path, and with the scene only as the pin lets go (`data-hero-end` from progress 0.92). The title box is the
same on every path: no backdrop blur (over a canvas it would be a blur pass a frame), and by day an opaque card (the
dusk picture under 10% of it took the title to 2.6:1 and the kicker to 4.2:1; now 3.1 and 5.1). Rules for the
surrounding CSS: no ancestor of what sticks (`.tea-hero-pin` in dock; the stage, so the pin too, in flow) may set
`overflow` other than visible (`flow` sets the pin's own to visible); the canvas has `pointer-events: none` and pointer
input is read on `window`, so the box stays clickable. tea-core may react to `data-hero-phase` ("open", "docked"),
`data-hero-layout`, `data-hero-end` and `data-hero-settled` on `.tea-hero`.

**The day/night switch.** One `ModeToggle` in the rail (`chrome/ModeToggle.astro` and `scripts/mode.js` unchanged). Under
1024 px the rail is the sticky chapter strip, and its backdrop-filter used to make the strip the fixed switch's
containing block, so the switch scrolled with the strip, off screen all through the hero. The strip's frosted ground
is now a `::before` layer (`tea.css`), so the switch is fixed to the screen's top right from the first screen, over
the static and the pinned hero, and sits in the strip's reserved right end once the strip sticks (tea-hero-5).

## Files

| Path | What |
|---|---|
| `src/components/tea/TeaHero.astro` | the hero's markup contract: `.tea-hero[data-tea-hero] > .tea-hero-pin > <Stage /> + .tea-hero-box` (tea-core's box: skip link, kicker, h1, statement, counter, chapter list, the way out) |
| `src/components/tea/hero/Stage.astro` | the whole `.tea-hero-stage` div (poster and shade) and `boot.js`; prop `manifest` (default `/tea/hero/manifest.json`); imports `stage.css` |
| `src/styles/tea/stage.css` | the stage, poster per mode and shape, canvas fade, readability shade, the `dock` and `flow` layouts, the docked box |
| `src/scripts/tea/hero/boot.js` | the tiny entry: gating, then `import('./stage.js')` |
| `src/scripts/tea/hero/stage.js` | `mount(section, stage)`: three, the scene, pin, frame loop, pause, resize, mode (followed from the start of the mount), the lead and the lens shift, a lost context, reduced motion turned on; `window.__teaHero` hook |
| `src/scripts/tea/hero/three.js` | three and GLTFLoader through the same dynamic imports `<ao-model>` makes, as live bindings (see "three and the shared chunks") |
| `src/scripts/tea/hero/pin.js` | `data-3d` when it moves nothing (`whenPinnable`, `keepPlace`), the layout (`layoutFor`, `dockShare`, `relayout`, the glide), the lead (`leadOf`), progress (`rawOf`), phase and end, the place kept for a reload (`onLeave`, `placeBack`) |
| `src/scripts/tea/hero/manifest.js` | fetch and normalise the manifest (defaults for every optional field) |
| `src/scripts/tea/hero/actors.js` | GLB loading (GLTFLoader + MeshoptDecoder), rest positions per screen shape (`orientActors`), props, material overrides, tint, bend |
| `src/scripts/tea/hero/tracks.js` | node lookup, scroll tracks and idle waves as deltas from rest pose, portrait travel |
| `src/scripts/tea/hero/deform.js` | the bend deform for unrigged meshes (vertex shader) |
| `src/scripts/tea/hero/backdrop.js` | picture layers, night and day images mixed in a shader |
| `src/scripts/tea/hero/camera.js` | camera path, cover-fit field of view (landscape and portrait), portrait framing, parallax, lens shift |
| `src/scripts/tea/hero/lights.js`, `crt.js`, `motes.js`, `input.js` | lights and glows, the screen shader and flicker, motes, scroll and pointer input |
| `public/tea/hero/manifest.json` | the scene, all of it |
| `public/tea/hero/*.webp, *.glb` | the painted picture's layers (`bg-*`, final: see "The picture"), posters (`poster-*`), the cast's models (`jefrie_rig.glb`, `jefrie_leap_rig.glb`, `yusef_rig.glb`, `tv_rig.glb`, `lantern_rig.glb`; see "The cast") |
| `scripts/tools/tea-hero/` | `shots.mjs`, `poster.mjs`, `silhouettes.mjs` (overlap and behind-the-box per size and scroll), `edges.mjs` (the picture covers every frame), `verify.mjs` |
| `tests/e2e/tea-hero.spec.mjs` | the e2e spec (tea-hero-1 to 29, listed in `tests/e2e/INVENTORY.md`) |
| `tests/unit/tea-hero.test.mjs` | the runtime's maths in plain node: the manifest's defaults and new fields, every channel, the swap (follow, a cut, a dissolve down and back), `loadActors` on a GLB made in memory, the skeleton freed, the shipped manifest's channels, its own leap swap, a portrait camera path, and its picture covering every frame (`edges.mjs`) |
| `src/pages/tea-lab.astro` | the lab: the real hero and rail over empty chapter heads; `?manifest=`. Temporary (see the top of this file) |

Outside these, the slice touched `src/styles/tea/cover.css` (the padding variables; the SVG garden's rules and the
old stage rules removed; the box's backdrop blur removed), `src/styles/tea/tea.css` (the strip's `::before`) and deleted
`src/components/tea/TeaNight.astro`. No `package.json` change; `three` 0.160 and the tools' `@playwright/test` and
`sharp` are already dependencies. Nothing imports from `src/scripts/home/**`.

## The manifest (`public/tea/hero/manifest.json`)

Units: world units (at their manifest scale Jefrie is about 1.95 units tall, ears included, Yusef about 1.7, the
TV 0.83 to its antennas). Y is up, the camera starts on +z
looking toward -z, the picture is behind at negative z. Angles are degrees, Euler order YXZ, written `[x, y, z]`.
Relative URLs resolve against the manifest's own URL. Every optional field has a default (`manifest.js`).

| Field | Meaning |
|---|---|
| `version` | must be `1` |
| `reference.aspect` | the aspect the scene is composed for (default 1.6; the shipped manifest's is 1.5, so a 4:3 screen loses less of the sides). Wider screens keep its horizontal field of view (crop top and bottom), narrower landscape screens keep its vertical one (crop the sides): like `object-fit: cover`, so the poster matches. Portrait screens use `camera.portrait` |
| `background.layers[]` | the picture: `id`, `night` and `day` image URLs (`src` is an alias for both), `z` (depth, e.g. -10 far, -6 mid), `size` `[w, h]` in units (keep the image's aspect), `x`, `y` (centre), `cutout` (true for a layer with alpha: transparent, no depth write), `fog` (0..1, tint toward the fog colour), `portraitScale` (default 1.5: how much the layer grows on a portrait screen to cover the taller view). The current mode's images load first, the other mode's after the first frame |
| `actors[]` | `id`, `src` (GLB), `scale` (uniform), `position`, `rotation` (the rest pose of the actor's root), `portraitPosition` (optional; else `x` is multiplied by `camera.portrait.spread`), `rig` (`kind`: `"nodes"` or `"baked"`, informational; `map`: `{ "conventionName": "nameInTheGLB" }` aliases), `deform`, `materials`, `tint` (hex multiplied into every material colour), `envIntensity` (default 0.6), `props[]`, `follow` (another actor's `id`: see "One actor in place of another"), `fade` (true: for an `opacity` track, its opaque materials alpha-hashed) |
| `actors[].deform` | for meshes with no skeleton: `{ "kind": "bend", "start": -0.15, "y": -0.42, "rest": 0.35 }`. In the mesh's own space (for a quantized mesh: model units divided by its node's scale, see below), everything past `start` along -z (a tail behind the body) curls up toward +y around height `y`; `rest` is the resting curvature (1/units). The `bend` channel adds to it |
| `actors[].materials` | `{ "<node name>": { "shader": "crt" } }`: every mesh at or under that node gets the TV screen shader (the node needs UVs) |
| `actors[].props[]` | separately loaded rigid GLBs: `id` (the prop's root is renamed to it, so tracks, lights and glows can name it), `src`, `parent` (a node of the actor, e.g. `hand.R`; missing or absent: the actor's model root), `scale`, `position`, `rotation`, `materials` |
| `lights[]` | `id`, `type` (`ambient`, `hemi`, `dir`, `point`), `attach` (`{ "actor", "node" }`, optional: the light hangs from that node, `position` is then local), `distance`, `decay` (point), `flicker` (`"crt"`: follows the screen's flicker), and `night` / `day` states each `{ color, ground (hemi), intensity, position }`. Lerped by the mode |
| `glows[]` | additive halo sprites: `attach`, `position`, `size`, `color`, `night` and `day` opacity, `flicker` |
| `camera` | `fov` (vertical, at the reference aspect), `near`, `far`, `keys[]` `{ t, pos, look }` (t = the scene's progress; at least two; uneven spacing is fine), `parallax` `{ x, y (units of offset at full pointer), ease (1/s), drift (0..1, the touch drift) }` |
| `camera.portrait` | a portrait screen (aspect 1 or less): `fov` (vertical, at `aspect`), `aspect` (the tall poster's shape, 0.75 in the manifest, default 430/932: narrower screens keep the vertical field and crop the sides, wider ones crop top and bottom, like cover), `spread` (x multiplier for the actors' rest positions), `travel` (the share of a whole actor's own sideways travel, its position track's x, kept; default `spread`), `keys` (the tall frame's own camera path, `{ t, pos, look }` like `camera.keys`, at least two: a composition of its own; without it the landscape path is adapted by the next two), `pull` (units pulled back at the start), `drop` (units the look-at is lowered at the start) |
| `camera.dock` | the dock layout: `shift`, the lens shift while the box is docked, as a share of the frame's width the picture slides right: a number, or keys `[[t, shift], ...]` along the scene's progress; `cover` (default 0.33), the share of the width the docked box covered where the keys were tuned (1440x900): the shift is scaled by the share it covers on the screen at hand |
| `tracks[]` | scroll-driven: `actor`, `node` (omit for the whole actor), `channel`, `keys` `[[t, value], ...]`, `ease` (`"smooth"` default, or `"linear"`). Values hold before the first key and after the last |
| `idle[]` | time-driven waves: `actor`, `node`, `channel`, `amp` (number or `[x, y, z]`), `hz`, `phase` (0..1), `wave` (`sin`, `bounce`, `noise`), `scroll` (optional `[[t, gain], ...]`: the wave's strength along the scroll) |
| `motes` | `count`, `mobile` (count on phones), `size`, `box` `[[minX, minY, minZ], [maxX, maxY, maxZ]]`, `fly` and `petal` colours |
| `look` | `night` / `day`: `exposure` (ACES tone mapping), `fog` (colour), `clear` (the colour behind everything) |

### The picture

The final painted picture (made outside the repository, with its working material): two layers of one garden, each
with a night and a dusk image.

| Layer | Files | Pixels | Plane |
|---|---|---|---|
| far | `bg-far-night.webp` 185,864 B, `bg-far-day.webp` 246,712 B | 2816x1584, opaque | 29.568 x 16.632 units at z -10, centre (0, 0.6) |
| mid | `bg-mid-night.webp` 74,398 B, `bg-mid-day.webp` 87,286 B | 1800x1200, alpha: the cherry tree and the bushes | 19.08 x 12.72 units at z -6, centre (-1.1, 1.0), `cutout` |

The painter's own fit was 28.16 x 15.84 at (0, 0.65) and 18 x 12 at (-1.1, 1.0), 100 px a unit. `edges.mjs` showed
that with the docked box's lens shift and the pointer near the window's top right it let the far plate's left edge into
the frame (by up to 0.52 units at 1280x800 with the pointer in the corner, 0.08 with it three quarters of the way
there) and the bushes' straight cut at the mid layer's left edge, and on a portrait tablet tilted all the way the far
plate's foot (0.29 units at 768x1024). So the far plate is 5% larger about the doorway, which stays at about world
(0.07, 1.58), where the camera looks last, and the mid layer is 6% larger about its own centre. Traced with the
runtime's own camera code over the whole scroll (steps of 0.005), the pointer anywhere in -1..1 on both axes and the
lens shift docked or not (at the docked box's measured share of the width: at most 1.12 times the tuned one, and 1.15
passes too), at 17 sizes from 360x640 to 1920x1080, no frame shows past the far plate, and the mid layer's side edges
never come into view where its paint reaches them (rows 921 to 1051 of its 1200; its top and bottom bands are fully
transparent). A portrait screen grows each layer by `portraitScale` (1.5) about its centre. The stand-in plates showed
their left edge from progress 0.2 to 0.3 on a docked desktop even with the pointer centred. `npm test` traces the
shipped manifest the same way (`tests/unit/tea-hero.test.mjs`, about 7 s) and fails on any frame past an edge, as it
does on the painter's fit: so **keep these `background.layers` when another manifest comes in whole** (the cast's
carries the painter's fit), and after any change to the camera keys, `camera.dock`, `camera.portrait`, the parallax or
a layer, read the margins `edges.mjs` prints.

### Composition (the final cast)

Directed on the page with contact sheets at 1440x900, 1280x800, 1024x768, 768x1024 and 390x844, night and day, and
measured with `silhouettes.mjs` (each actor drawn alone as a flat silhouette at a raw scroll progress: its share
behind the title box, and the overlap between two actors as a share of the smaller).

- **The opening frame** (progress 0: the posters, and every path's first picture). The TV stands in front of Jefrie
  at the left (TV at (-1.3, -0.2, 1.7), scale 0.72; Jefrie at (-2.05, 0, 0.8): her leap path is rescaled so she
  still lands on the path), Yusef at the right ((1.05, 0.15, -0.65), with the lantern), the centred box between
  them; she crouches in it (0.03 to 0.09) while the box is still centred. Behind the open box: Jefrie 0.1% at
  1440x900; Jefrie 2.5%, Yusef 0.6% and the TV 6.5% at 1280x800; on 4:3 (1024x768, whose box is 53% of the width)
  Jefrie 5.7%, Yusef 3.6% (a wing tip) and the TV 18.6%; on a portrait screen the TV 0.6%. The TV covers the front of
  her legs (7.4% of the TV's silhouette on landscape screens, 25% on a portrait one): it is staged in front of her.
- **Docked desktop** (1280 and wider). The box docks at 0.1; from 0.1 to 0.25 the camera drifts left and in (no
  further left than x -0.9, where the far plate's edge would show) so the TV slides out from under the docked box, and
  `camera.dock.shift` is 0.14 to 0.22 through the leap (0.1 to 0.3), 0.05 at 0.62 and 0.14 to 0.16 at the door
  (`cover` 0.33). Yusef flutters from the right of the opening frame to his place by 0.14 (his position track),
  clear of the box open and docked. Behind the docked box: at the moment the box docks (0.1, while it glides there
  for 900 ms and the lens shift eases in) Jefrie 34.5% and the TV 28.9% at 1440x900 (52% and 34% at 1280x800); by
  0.135 Jefrie 0 and the TV 8.3% (14.3%); nothing at 0.2; the TV 15.7% (16.9%) at 0.3 and 6.3% (5.3%) at 0.375 as it
  leaves the frame at the bottom left; from 0.45 to the door nothing (Jefrie 0.3% at most at 1280x800). The two
  characters touch nowhere (0.27% at 0.55, as she turns).
- **Portrait screens** have a camera path of their own (`camera.portrait.keys`, `fov` 50 at `aspect` 0.75, `travel`
  0.18; `portraitPosition` Jefrie (-0.6, 0, 1.0), Yusef (0.62, 0.15, -0.8), the TV (-0.2, -0.2, 1.4)): the cast
  stands in the top 60% above the low box at first; while the box scrolls away the scene holds its opening frame (the
  lead: on 390x844 the box covers the cast wholly from raw 0.2 to 0.375); then the camera comes in and drops low to
  look up at the spring and the flight (0.1 to 0.3), rises for the landing, lets the TV leave at the bottom as it
  moves in (0.43 to 0.55), and follows the walk to the door from behind. Overlaps: her leap mesh's arm in front of Yusef's robe, 4.3%
  of his silhouette at 390x844 at scene 0.3 (0.7% at 768x1024), otherwise none.
- **The edges.** Heads stay in frame everywhere. Yusef's wing tips stay inside the frame (on 4:3 the right one
  touches the edge as the scene starts, until the camera moves in). Jefrie's tail coils at her heels on the walk
  (0.6 to 1) so it stays in frame on narrow screens (it ran out of a phone's left edge for the whole walk before);
  on a docked desktop the coil sits on the path beside the box's right edge, grazing the frame's foot.
- **Night and dusk.** Jefrie carries a key and a rim light (`jefrie_key`, `jefrie_rim`; her leap mesh the same pair,
  brighter, to match her) so she reads against the dark garden at night and the bright dusk plate; Yusef carries
  `yusef_dusk`, a warm point light in front of him that is off at night and on by day (3.0), which separates his
  white robe and wings from the dusk plate; the lantern hangs from his right hand with its light and glow (5 at
  night, 4.5 by day), held out at his side, never over Jefrie's head; her tail stays off his robe (the one place
  they meet is her outstretched arm in front of his robe on a phone, above).
- **The cuts** (frames either side, `cutcheck`-style: Jefrie's flat silhouette and her mean brightness in the lit
  frame). At 1440x900 the silhouettes either side of a cut overlap by 0.81 (cut 1) and 0.77 (cut 2), against 0.75 to
  0.92 between neighbouring frames of the same mesh; her centre moves 6.2 and 13.7 px (7.6 to 15.5 between
  neighbours); area within 2%. Brightness: at night +3.8% and +1.3%, by day -14% into the leap and +14% out of it (the
  leap mesh's grey armour against the rig's black). At 390x844: overlap 0.81 and 0.78 against 0.89 to 0.99, centre
  3.7 and 2.9 px, brightness -3% and -18% at night, -9% and -3% by day. See "Known issues" 1.

Channels (scroll tracks and idle waves add together, both as **deltas from the rest pose**, so a final asset with a
different rest pose keeps working):

| Channel | Value | Applies |
|---|---|---|
| `position` | `[x, y, z]` units | added to the node's rest position (parent space). With no `node`: moves the actor's root |
| `rotation` | `[x, y, z]` degrees | after the rest rotation, in the node's own space |
| `scale` | `[x, y, z]` factors | multiplies the rest scale (the actor's inner group when no `node`) |
| `squash` | number (0.1 = 10% taller and thinner, -0.1 = squashed) | volume-keeping scale on y |
| `bend` | number (curvature) | added to the actor's `deform.rest`; whole-actor only |
| `visible` | number: drawn while 0.5 or more (keys `[[p - 0.001, 1], [p + 0.001, 0]]`, `"ease": "linear"`, make a cut at p) | whole actor only (a track with a `node` is skipped) |
| `opacity` | number 0..1 | whole actor only: an actor with `fade` dissolves (its opaque materials alpha-hashed, so no sorting and no transparent pass, and drawn whole at 1; a see-through one keeps its blending; each material's own opacity times this); any actor is hidden at 0.004 or less |

Shown or hidden is worked out afresh every frame from that frame's `visible` and `opacity` values alone, so an actor cut
away or faded out comes back when the reader scrolls back (an actor with neither channel is never touched).

### One actor in place of another

A pose-baked mesh can stand in for a rigged character for part of the scroll (the leap: one mesh posed in the air, cut
in where the standing rig's pose is closest to it). Give it its own actor with `follow`:

```json
{ "id": "jefrie_leap", "src": "jefrie_leap_rig.glb", "follow": "jefrie", "envIntensity": 1.45,
  "position": [-0.0467, 0.013, 0.0453], "rotation": [-12.96, -12.09, -13.35], "scale": 0.9623, "rig": { "kind": "nodes" } }
{ "actor": "jefrie", "channel": "visible", "ease": "linear", "keys": [[0, 1], [0.13462, 1], [0.135, 0], [0.37486, 0], [0.375, 1]] }
{ "actor": "jefrie_leap", "channel": "visible", "ease": "linear", "keys": [[0, 0], [0.13462, 0], [0.135, 1], [0.37486, 1], [0.375, 0]] }
```

- **`follow`:** every frame, after every track, the follower's root takes its leader's position and rotation and its
  inner group the leader's scale (squash included). Its own `position`, `rotation` and `scale` place its model inside
  them, in the leader's model units: the offset a pose match gives. Its own whole-actor position, rotation and scale
  tracks are overridden; its node tracks, idle waves, `visible` and `opacity` are its own. A follower must name another
  actor that follows no one, or the manifest fails and the poster stays. A follower has no rest place of its own
  (`portraitPosition` is not read).
- **A cut** is `visible` on both, the other way round; at exactly the cut's middle both values are 0.5 and both draw for
  that one frame. **A dissolve** is `opacity` on both with `fade` (keys such as `[[0.18, 1], [0.21, 0], [0.5, 0],
  [0.53, 1]]` and the reverse): alpha hashing dithers the opaque materials while it runs, and only then (an opaque
  material is drawn at opacity 1; but a see-through texel of its texture, which an opaque material otherwise ignores,
  dithers all the time: give a fade actor's opaque materials opaque textures).
- **Lights and glows hanging from a hidden actor are not drawn.** Give the follower its own lights, as many as the one
  it replaces (the shipped leap mesh carries `jefrie_leap_key` and `jefrie_leap_rim`, as Jefrie carries `jefrie_key`
  and `jefrie_rim`; tea-hero-27 counts them through both cuts), so the scene's light count never changes at a cut: a
  change recompiles every lit material in the middle of the scroll. The TV's screen shader is not faded by `opacity`.
- **So cut an actor that carries lights or glows; dissolve only one that carries none.** Through a dissolve both
  actors are drawn, and their lights and glows are not faded with them: both actors' lights shine at full strength, so
  the light on the scene doubles, and the light count changes, so the first time the scroll enters the overlap every
  lit material on screen is compiled again (one frame took 0.57 s under SwiftShader with a light on each stand-in,
  0.68 s with the final cast's two light pairs; not measured on a real GPU).
- Tools that isolate an actor (`silhouettes.mjs`) hide meshes, never an actor's root, which its tracks set.
- **Where the shipped cast cuts.** Both cuts sit on the leap's fastest moments, where a change of shape reads least:
  0.135 is the spring's last frames (her root moves 0.075 units, 0.033 of it up, and turns 1.2 degrees over the last
  0.004 of scroll before it, the box just docked and the lens shift easing in), 0.375 the fall before the landing
  (0.035 units, 0.017 of it down, over 0.0014). The standing rig is keyed into the leap mesh's silhouette on both sides
  of each cut (the rig builder's poses, retimed with the rest of the leap). What still changes at a cut is the leap mesh's own detail, not its place or size: see "Known issues".

### Node naming convention for rigs

Bones of a skinned mesh and rigid part nodes are the same to the runtime (both are `Object3D`s). Name them:

`hips, spine, chest, neck, head, jaw, upperarm.L, forearm.L, hand.L, upperarm.R, forearm.R, hand.R`, `robe`, and:

- **Chains** are numbered from the base, two digits: `tail.01` (at the root) ... `tail.NN` (at the tip), `cape.01` ...
  `cape.NN` (from the shoulders down), `hair.01` ...
- **Wings** are a root and two chains: `wing.L` (the root: turns the whole wing), `wing.L.a.01`, `wing.L.a.02` (the
  leading edge, over the top and down the outside), `wing.L.b.01`, `wing.L.b.02` (the inner feathers); the same with
  `.R`. Both chains start at the root.
- **Legs:** `thigh.L`, `shin.L`, `foot.L` (pivots at the hip, the knee, the ankle), the same with `.R`.
- **Skirt panels:** `skirt.L`, `skirt.R`, children of `hips` with pivots on the hip line; rigid like a thigh (`x` -
  swings the panel forward). Key them from the thighs (about 0.45 of a thigh's forward swing, 0.25 of its backward
  swing) so a raised knee comes out from under the hem instead of tearing it.
- **Props:** a single-piece prop's node is `prop`; the actor's `props[].id` (e.g. `lantern`, `bell`) renames its root.
- **The TV:** `body`, `screen` (with UVs, for the shader), `antenna.L`, `antenna.R`, `knob.1`, `knob.2`.
- **A pose-baked mesh that stands in for a rig** (a leap) keeps the rig's names for what still moves under its root
  (`hips`, `head`, `cape.01` ..., `tail.01` ...); the leap actor is `jefrie_leap`, following `jefrie`.

How rotation tracks act on these nodes (the rigs made for the final cast):
- The whole actor (a track with no node) turns about its own axes too: `x` + leans it forward, `y` + turns it to its
  left, `z` + tilts its top to its right (- leans it into a leap to its left).
- Rigid parts (hips, chest, head, arms, hands, legs, robe, the TV's parts, props) rest at identity: `[x, y, z]`
  degrees turn them about the model's own axes (+x its left, +y up, +z forward) at their pivot.
- Arms rest as modelled, an A-pose, shoulder to wrist about 45 to 50 degrees down. On an arm, `x` runs nearly along
  it, so it mostly twists it; `z` raises it (+ on `.L`, - on `.R`); `y` swings it (- forward on `.L`, + forward on
  `.R`). Forearms flex forward with the same `y` signs. Legs: `x` - on a thigh brings the knee forward, `x` + on a
  shin bends the knee, `x` - on a foot levels it.
- Chain and wing bones rest along their own segment (local +Y toward the tip, +Z the chain's up side, X = Y x Z), so a
  value means the same on every bone and on any rest shape: `x` curls toward the up side (a tail lifts off the floor
  wherever it lies, a cape streams back, a wing folds forward), `z` swings sideways (a wing spreads: `.L` and `.R` take
  opposite signs, as `y` does), `y` twists.
- Lights may ride with an actor: a `lights[]` entry with `attach: { "actor": id }` and no node hangs from the actor's
  root, so it turns with the actor but is not scaled by it (`position` in world units in the root's frame).

GLTFLoader strips `.` `:` `/` `[` `]` from names and turns spaces into `_`, so `upperarm.L` arrives as `upperarmL`
(and `wing.L.a.01` as `wingLa01`: no two names may collide once stripped).
Write the convention names in the manifest anyway: the lookup tries the rig `map` alias, the exact name, the
sanitised name, then the glTF's original name. A track whose actor or node is missing is skipped silently (e2e tea-hero-24 lists any name of the shipped manifest the models lack). Put each
part's pivot where it bends (shoulder, wing root, tail joint): rotation tracks turn nodes about their own origin.
Models face +z with Y up. The root's `position` is where the model's origin goes.

Both rig kinds through one mechanism:
- **Skinned or part-rigged:** tracks name bones or parts (`wing.L`, `tail.03`). A skinned mesh's skeleton (its bone
  texture) is freed with the scene.
- **Pose-baked mesh** (one TRELLIS mesh, no skeleton): whole-body tracks only (`position`, `rotation`, `squash`),
  the `bend` deform for a tail, and props (lantern, bell) loaded separately and parented to the actor.

### What the loader takes (checked on 2026-11-11)

- **Compression:** `EXT_meshopt_compression` (the decoder, `three/examples/jsm/libs/meshopt_decoder.module.js`, is
  bundled into the lazy 3D chunk only: 22.4 KB, 6.1 KB gzip of it), `KHR_mesh_quantization` and `EXT_texture_webp`,
  all three as required extensions: what `gltf-transform optimize --compress meshopt --texture-compress webp` and
  `gltfpack -cc -tc` write. The spike's compressed models (Yusef, the CRT, the lantern, Jefrie; kept with its working
  material, outside the repository) load in the lab through a manifest variant, with no console error. No KTX2 or
  Draco decoder is bundled.
- **Skinned meshes:** a test model built like the final assets (a skinned tail with bones `tail.01` to `tail.03`, a
  rigid `wing.L` with its pivot at its root, quantized, meshopt, a WebP texture) binds by the convention names: the
  bones arrive as `Bone`s named `tail01` with `userData.name` `tail.01`, tracks on `tail.02` and `wing.L` turn them, and
  the skinned tail curls (its skinned bounding box goes from y 0.62 to 1.21 at the top).
- **Quantized meshes keep their scale on the node.** After `KHR_mesh_quantization` a mesh's positions are integers in
  -1..1 and its node carries the scale back (about 0.5 for TRELLIS output, which is about 1 unit across). The `bend`
  deform works on the mesh's own positions, so its `start` and `y` are in that space: model units divided by the
  mesh node's scale (about twice the model units for TRELLIS output).
- **Props need their parent node:** a prop whose `parent` node is missing hangs from the model's root (the spike's
  Yusef has no `hand.R`, so the lantern sits at his centre). A track or material on a missing node is skipped.

## three and the shared chunks

`three` is one shared chunk (`three.module.*.js`, 166.6 KB gzip) that the homepage scene, `<ao-model>` and the hero
all use; `GLTFLoader.*.js` is shared with `<ao-model>`. A static `import { X } from 'three'` in the hero adds X to
that chunk's export list (the hero's eight new names took it from 94 to 102 exports, 101 bytes larger), and a static
GLTFLoader import turns GLTFLoader's chunk into a shared one; both then re-hash, every chunk that names them re-hashes
after them, and the homepage downloads three again after the deploy. So `src/scripts/tea/hero/three.js` reaches
three and GLTFLoader through the same dynamic imports `<ao-model>` makes (`import('three')`, the namespace it already
exports, and `import('three/examples/jsm/loaders/GLTFLoader.js')`) and fills live bindings once; `stage.js` awaits
`loadThree()` first, and no hero module makes a three object at its top level. Built against an untouched build of
the branch the hero joined: `three.module` and `GLTFLoader` byte-identical, no other main-site chunk renamed.
**Keep it that way: never `import ... from 'three'` in `src/scripts/tea/hero/`, import from `./three.js`** (and add a
name to its list). A top-level `await import('three')` there instead re-splits the whole site's chunks.

## Running it

```bash
npm run build && npx astro preview --port 4411   # or: npx astro dev --port 4392 (the tools' default URLs)
# /tea/?hero=on skips the device checks (not WebGL or reduced motion), ?hero=off keeps the poster
# /tea-lab/?hero=on&manifest=<file>.json loads /tea/hero/<file>.json: put a variant (and its models) in dist/ after a
# build, never in public/. Stop a preview started by an agent with: npx astro preview stop (or kill it)
node scripts/tools/tea-hero/shots.mjs --url http://localhost:4411/tea/?hero=on --out <dir> --sheet
#   1440x900 and 390x844, night and day, p 0 0.1 0.2 0.25 0.3 0.45 0.6 0.8 1; one contact sheet a size and mode
node scripts/tools/tea-hero/poster.mjs --url http://localhost:4411/tea/?hero=on [--out <dir>]   # rewrites the posters
node scripts/tools/tea-hero/silhouettes.mjs --url http://localhost:4411/tea/?hero=on [--sizes 390x844,1440x900] [--out <dir>]
#   per size and scroll position: overlap between the actors, each one's share behind the title box (JSON lines)
node scripts/tools/tea-hero/edges.mjs [--sizes 1440x900:dock:1,390x844] [--ptr 1] [--manifest <file>]   # no browser
#   every frame of the scroll, pointer and lens shift: does the picture cover it? exit 1 if a layer's edge shows
node scripts/tools/tea-hero/verify.mjs --url http://localhost:4411/tea/   # behaviour checks, also against /tea-lab/
npm run e2e -- --project=desktop --project=phone tests/e2e/tea-hero.spec.mjs   # --workers=2 on a busy box
```

Headless WebGL: Chromium from Playwright with `--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist` renders correctly (the scripts pass these; the e2e desktop project's Chromium has WebGL as it
is, and headless WebKit has a WebGL context too). SwiftShader draws a few frames a second, so the tools freeze idle
time (`__teaHero.freeze(t)`), pin the pointer (`__teaHero.pointer([0, 0])`), hold the frame loop
(`__teaHero.hold(true)`; `render()` still draws one) and snap the smoothing (`__teaHero.render()`) so frames are
repeatable and a loaded box doesn't time out. They also hide Astro's dev toolbar and turn the box's transitions off.
`__teaHero.setProgress(p)` fixes the progress (null gives the scroll back); `__teaHero.dispose()` tears everything down
and restores the poster.

## Measured (2026-11-12, this branch)

- Boot entry (Stage's script): 1,448 B, **858 B gzip -9**, plus the site's existing shared preload helper.
- 3D chunk `stage.*.js`: 52,952 B, **17.7 KB gzip -9** (all of `src/scripts/tea/hero/` plus the meshopt decoder,
  which is 22.4 KB of it, 6.1 KB gzip; the actor swap added 1,181 B, 410 B gzip; the portrait camera path and the
  leave-the-page grace 301 B more). Loads only after first paint, only on the 3D path.
- It also loads `three.module.*.js` (166.6 KB gzip) and `GLTFLoader.*.js` (13.1 KB gzip), byte-identical to the
  chunks the site already ships, so cached for anyone who has seen the homepage or a post with a model.
- Files on the 3D path per visit: 2.77 MB, 2,765,602 B (the five models 2,083,772 B: `jefrie_rig.glb` 518,348,
  `jefrie_leap_rig.glb` 537,944, `yusef_rig.glb` 562,412, `tv_rig.glb` 229,364, `lantern_rig.glb` 235,704; the four
  picture layers 594,260 B, the other mode's two among them fetched after the first frame; the manifest 87,570 B,
  9.9 KB gzip) plus the one poster (51 to 100 KB: tall 51,198 / 63,676 B, wide 81,924 / 99,732 B) and the scripts
  above: 3.06 MB at most with the scripts gzipped, 3.62 MB with them counted whole. The page no longer fetches
  anything under `/media/jefrie-3d/` (the published post's model stays where it is). `public/tea/hero/` holds
  3,062,132 B.
- `/tea/` itself: HTML 24.4 KB gzip (25.8 before the hero: the SVG garden went), CSS 8.6 KB gzip.
  Main-site budgets identical to the baseline.

## Verified

- e2e `tea-hero.spec.mjs` (tea-hero-1 to 29) in both projects, desktop (Chromium 1440x900) and phone (WebKit,
  iPhone 13); each test seen failing on a build broken on purpose. Among them: the box holds still through the mount
  (8), a late scene moves nothing on screen (9), arriving at `/tea/#projects` lands there (10), the switch pressed
  while loading (11), a lost and restored context (12), reduced motion turned on (13), no poster fetched under the
  canvas (14), a square window (15), a missing manifest or model (16), Save-Data and a small device (17), a reload
  inside the scene (18), the stage one screen and the foot's fade (19), the same box on both paths (20), where the
  box docks (21), the box low on a portrait screen (22), a chapter link tapped just as the scene pins (23), every
  part the manifest names found in the models (24), leaving the page while the scene loads (25), one actor swapped
  for another on `/tea/` itself, the shipped manifest plus a follower served in its place (26), the shipped leap's
  own swap with the point lights counted through both cuts (27), a beforeunload that does not leave the page (28:
  failed with the scene stopping its loads on beforeunload), the title box's lines clear of the switch on a phone
  (29). The arrival at a chapter address itself is tea-17 (`tea.spec.mjs`).
- `tests/unit/tea-hero.test.mjs` (in `npm test`): each of eight broken runtimes (the round-2 opacity bug, no follow, no
  skeleton freed, a follower moved by `orientActors`, a `visible` on a node bound, no `fade`, a follower left behind
  while its leader is cut away, `fade` dithering a fully shown actor) fails one of its tests; the shipped manifest's
  own leap swap (exactly one of the pair drawn, a step either side of every cut, down and back) and a portrait screen
  following `camera.portrait.keys` are checked too.
- `verify.mjs` against `/tea/` and `/tea-lab/` (both layouts; see its header).
- The posters, re-rendered with `poster.mjs` from the final cast's opening frame, against that frame on the page
  (box, switch, shade, rail and foot hidden) at 1440x900, 1280x800, 1024x768, 768x1024 and 390x844, night and day:
  best aligned at offset 0 everywhere, mean difference 1.2 to 3.6 of 255 (the poster's resampling at the edges, the
  screen's grain, the motes); the actors' silhouettes as in "Composition" (`silhouettes.mjs`, on the final cast); the
  title box's text contrast by day and by night over the poster and the scene (by day title 3.1, kicker 5.1, the rest
  5.5 or more; measured before the cast came in, not measured again with it).
- The picture's edges with `edges.mjs` (see "The picture"), in `npm test` on the shipped manifest (the final cast's
  camera: 0 faults at 17 sizes); it fails on the painter's own fit and on the stand-in plates.
- The loader on the spike's compressed models and a skinned test model (above).

## Not verified

- Frame rate on real hardware: only SwiftShader here (a few fps by design). Expect the costs to be the Jefrie GLB's
  2048 textures and one full-screen draw; there are no shadows or post-processing.
- Real phones: iOS Safari's `svh` while pinned or with the stage sticky, its dynamic toolbar, device tilt on a real
  Android phone (the handling of a reading is checked with synthetic events in Chromium), a real GPU. Headless WebKit
  ran the phone e2e project.
- The back/forward cache: neither headless engine used it; a page restored from it keeps its state as it was.

## Known issues

1. **The leap mesh is another picture of Jefrie.** At both cuts her place, size and brightness carry over on a
   desktop (see "Composition"), but the leap mesh (`jefrie_leap_rig.glb`, from the leap still) is not the standing
   rig's picture: its armour is grey with silver kneepads where hers is black, its helmet has dark spikes where hers
   has the red fin and white grin, and its tail hooks where hers hangs. Scrolled slowly, each cut (0.135 into the
   leap, 0.375 out of it) reads as one figure turning into another in one frame; at 0.375 her legs also go from the
   leap's tuck to the rig's stretch for the landing. On a phone the second cut also darkens her by about a quarter
   (the leap mesh catches more of her riding key light from the portrait camera's side). A leap mesh made from the
   standing still would remove all of it (see "Next steps").
2. **The TV under the docked box** on a docked desktop: as the box docks (0.1 to 0.135) the TV still stands partly
   under it, and again as it leaves the frame at the bottom left (0.25 to 0.375); see "Composition" for the shares.
3. **4:3 screens** (1024x768, flow): the box is 53% of the width, so in the opening frame it covers part of the TV and
   the edge of Yusef's wing; once it has scrolled away Jefrie's hand and cape touch the frame's left edge and Yusef's
   wing tip its right edge until the camera moves in.
4. **Phones:** the box rises over the cast as the reader scrolls it away (the scene holds its opening frame until the
   box's foot has passed 30% of the screen), so for a moment the heads are under the box, and Jefrie's crouch starts
   as its foot leaves them.
5. The picture is final; its stepping stones still read as a regular ladder of ovals, most of all on a phone, where
   they fill the lower half of the frame.
6. **The lab page** is live (noindex, linked from nowhere, but a line of `stats-pages.txt`) until it is deleted.
7. At load, before the scene, tea-core's title moves about 10 px when its web font swaps in (CLS 0.0004, scene or
   not). The scene's arrival moves nothing on screen (tea-hero-8 and 9).

## Next steps

1. **A leap mesh made from the standing still** (recommended, see "Known issues" 1): the leap pose drawn from
   `jefrie_apose`'s picture (her black armour, red fin, white grin, cape and tail as they are), meshed, rigged and pose
   matched to the standing rig as `jefrie_leap_rig.glb` was, under 900 KB. It replaces that file and the
   `jefrie_leap` actor's `position`, `rotation`, `scale` and node tracks; the cuts (0.135, 0.375), the riding lights
   and every other key stay. Then key the standing rig's legs into its tuck at 0.375, check both cuts frame by frame on
   a desktop and a phone (silhouette, place and brightness against the frames either side), and run the e2e spec
   (tea-hero-24 and 27 hold the names and the swap). The posters stay: the leap mesh first shows at 0.135.
2. **Delete `src/pages/tea-lab.astro`** when no more variants are to be tried, build, confirm `/tea-lab/` is gone
   from `dist/stats-pages.txt`, drop tea-16 or turn it into a check that the page is gone, run `verify.mjs` and the
   e2e spec, compare budgets and run `dist-diff` against an untouched build, then land per `CLAUDE.md`.
