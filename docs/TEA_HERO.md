# The tea room hero (`/tea/`): runtime, manifest, tools

Built on branch `feat/alt-view-hero` (the hero runtime, 2026-11-10) and wired into the tea room on `tea/hero`
(2026-11-11), on top of tea-core's `/tea/` page. This file is meant to be enough on its own for a session that only
has the repo.

**The lab page, `src/pages/tea-lab.astro` (`/tea-lab/`), is temporary.** It is a development page kept so the hero
can run alone and try a variant manifest (`?manifest=`). It stays, hidden, while the scene is still being tuned, and deleting it is a step of "Next steps". It carries its own robots noindex, is in no sitemap,
feed or search index, and nothing links to it (tea-16); like every built page it is a line of `stats-pages.txt`, so
`/stats` may name it if it gets visits. It doesn't rename the main site's stylesheet (it imports `tea.css`, not
`site.css`).

## What it is

The top of `/tea/` was modelled on the Shopify Editions Winter '26 hero: figures in motion around one object, in front
of one picture placed in 3D space, with a framed title box. Ours is the tea house garden at night with a small CRT
television at the lower left. **There are no characters** (2026-11-12): Jefrie, her leap mesh and Yusef with his
lantern were taken out because they read badly; the garden, the tea house and the TV stay. Everything is real-time
Three.js:

- **Scroll timeline.** With the scene the section is 300vh on every screen and pinned (two layouts, below). One
  progress value (0 to 1) drives the camera along a Catmull-Rom path and the TV's one track. The camera opens on the
  wide shot (the TV at the lower left), drifts a little left and in as the title box docks (0.1 to 0.135, which slides
  the TV out from under the docked box), then eases toward the tea house door, where it ends (1) looking straight at
  it. The TV holds its place to 0.13, scoots a little right as the camera comes in and sinks out of the frame at the
  bottom (by about 0.35 on a desktop). A portrait screen has a camera path of its own, the same move.
- **Idle loop on top:** the TV's bob and sway and its antenna wobble, the TV screen's emissive shader (moon, scanlines, rolling bar, grain, flicker shared with its light and glow), drifting motes
  (fireflies and petals, one Points draw).
- **Pointer parallax** (mouse), device tilt where no permission prompt is needed (Android), a slow drift otherwise.
- **Day and night** follow `data-mode` on `<html>` (the site's `scene-mode`), tweened live. Night is moonlight and
  the TV's glow; day is a warm dusk (separate picture, lights lerped).
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
  WebKit sends no event at all for such a link: it cancels the loads in flight (the fetches fail as network errors)
  and cuts image elements' loads without a load or error event. So a network error is tried again twice, 0.5 s and
  1.5 s later, unless the page is being left (`patient` in `manifest.js`: the manifest, the models and the picture
  layers; an answer such as a 404 is not tried again, tea-hero-16), the picture layers are fetched and decoded from
  their own bytes, and a picture whose decode has not settled in 4 s is started once more, the models' too: the page's
  own mailto link clicked while a model loads costs nothing (tea-hero-30).
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
| the scene loads | the poster, then the canvas fades in over the same frame (700 ms) | the posters are the opening frame (re-rendered with `poster.mjs` on 2026-11-12, without the characters; the alignment was measured on the cast's posters, mean difference 1.6 to 2.7 of 255 at offset 0, and not measured again), so nothing jumps; re-run `poster.mjs` after any change to the opening composition or the assets |

Why one picture: whoever arrives sees the same place and the same TV, with motion added where it can run;
the 3D path's first seconds show the frame the scene comes alive from. Phase 1's SVG garden (`TeaNight.astro`) was
retired with this: a different drawing under the scene would cross-fade into a different picture.

Before first paint the page loads its HTML, CSS, fonts, its small scripts (`boot.js` among them, 1.2 KB) and the one
poster. Never three, the loader, the manifest, the models or the picture layers: tea-hero-3 checks every 3D request
starts after first paint.

## Layouts

`cover.css` (tea-core) lays out the static hero: the section at least one screen tall (`min-height: 100svh`), the box
centred in `.tea-hero-pin`'s padding, which lives in `--tea-hero-pt`, `--tea-hero-pb` and `--tea-hero-px` on
`.tea-hero` (84/56 px and the page's side padding; 76/40/14 px under 561 px). With the scene (`data-3d="on"`),
`stage.css` makes the section 300vh (on every shape of screen) and `pin.js` picks `data-hero-layout`, again on every
resize:

- **`dock`** (a landscape screen where the box fits, its height plus the two paddings at most the window's, and where
  docked it would cover at most 37% of the width: 1280 and wider; a 4:3 screen such as 1024x768 or 1180x820 flows):
  `.tea-hero-pin` sticks (100svh). The box is placed absolutely exactly where the static layout centred it, then from
  progress 0.1 (`data-hero-phase="docked"`) glides lower left (`--tea-dock-x`; `--tea-dock-low`, which keeps it clear
  of the day/night switch at the foot of a 1024 px+ screen) to `--tea-dock-scale` (.8), with the statement and the
  counter folded away (still read out). The glide (`data-hero-glide`) comes on only once the open place is laid out,
  so the box never slides in when the layout changes. While it is docked the scene's lens shift (`camera.dock.shift`,
  scaled by the share of the width the box covers against `camera.dock.cover`) slides the picture right, eased like
  the box's own move, so the tea house door stands clear of it (see "Composition").
- **`flow`** (a portrait screen, a box that doesn't fit, or a 4:3 one): the pin becomes a grid as tall as the
  section, the stage sticks (100svh) and the box keeps the static layout's place in the first screen and scrolls away
  with the page. The scene holds its opening frame until the box's foot has passed 30% of the screen (`leadOf` in
  `pin.js`, the "lead", a share of the scroll, at most half), then plays over the rest. Every section is 300vh, so a
  switch between the layouts moves nothing below the hero. A portrait screen's was 400vh while the characters were in,
  to give Jefrie's leap room (with 300vh it went by in about a third of a phone's screen); the camera's slow move to the
  door needs none of that, so it is 300vh again: on a 390x844 phone the lead is 0.5 of the scroll (its cap) and the
  move plays over one screen (tea-hero-22 asks for 0.8 at least and for the 300vh).

On a portrait screen the box waits low in the first screen (`--tea-hero-pt` max(76px, 61svh) in `stage.css`, on every
path): the portrait camera stands the tea house and the TV in the top 60% of the frame, so the first screen shows them
above the box's title, the rest of the box below the fold.

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
the static and the pinned hero, and sits in the strip's reserved right end once the strip sticks (tea-hero-5). The box
scrolls up under it there, so `stage.css` keeps the box's text out of the switch's column: on a phone a 76 px gutter,
with the counter set a little smaller so it keeps to one line (it breaks, where even that is too wide, only between
its parts); from 561 px a gutter and a skip-link offset that follow the centred 540 px box and are gone by about
680 px (tea-hero-29, at 561, 600 and 640 px and on the phone).

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
| `public/tea/hero/*.webp, *.glb` | the painted picture's layers (`bg-*`, final: see "The picture"), posters (`poster-*`), the one model, `tv_rig.glb` (the characters' `jefrie_rig.glb`, `jefrie_leap_rig.glb`, `yusef_rig.glb` and `lantern_rig.glb` were deleted with them; they are in git history before 2026-11-12) |
| `scripts/tools/tea-hero/` | `shots.mjs`, `poster.mjs`, `silhouettes.mjs` (overlap and behind-the-box per size and scroll, actor by actor: with the TV alone, its share behind the box), `edges.mjs` (the picture covers every frame), `verify.mjs` |
| `tests/e2e/tea-hero.spec.mjs` | the e2e spec (tea-hero-1 to 30, listed in `tests/e2e/INVENTORY.md`) |
| `tests/unit/tea-hero.test.mjs` | the runtime's maths in plain node: the manifest's defaults and new fields, every channel, the swap (follow, a cut, a dissolve down and back, on made-up actors), `loadActors` on a GLB made in memory, the skeleton freed, the shipped manifest's channels, its cast (the TV alone, its shader, light and glow, nothing naming a missing actor, no unused GLB in `public/tea/hero/`), every actor drawn down the scroll and back, its camera (the TV in frame at the start, the door ahead at the end, at five sizes), a portrait camera path, and its picture covering every frame (`edges.mjs`) |
| `src/pages/tea-lab.astro` | the lab: the real hero and rail over empty chapter heads; `?manifest=`. Temporary (see the top of this file) |

Outside these, the slice touched `src/styles/tea/cover.css` (the padding variables; the SVG garden's rules and the
old stage rules removed; the box's backdrop blur removed), `src/styles/tea/tea.css` (the strip's `::before`) and deleted
`src/components/tea/TeaNight.astro`. No `package.json` change; `three` 0.160 and the tools' `@playwright/test` and
`sharp` are already dependencies. Nothing imports from `src/scripts/home/**`.

## The manifest (`public/tea/hero/manifest.json`)

Units: world units (the TV is 0.83 units tall to its antennas at scale 1, about 0.51 at its manifest scale 0.62). Y is up, the camera starts on +z
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
shipped manifest the same way (`tests/unit/tea-hero.test.mjs`, about 3 s) and fails on any frame past an edge, as it
does on a far plate a tenth smaller (the painter's own fit failed under the cast's camera, which drifted further left
over the leap; under the camera without the characters it passes, at 1280x800 docked and 768x1024): so **keep these
`background.layers` when another manifest comes in whole** (the cast's carried the painter's fit), and after any
change to the camera keys, `camera.dock`, `camera.portrait`, the parallax or a layer, read the margins `edges.mjs`
prints.

### Composition (the garden and the TV)

Until 2026-11-12 the scene had a cast (Jefrie with a pose-baked leap mesh cut in mid-air, Yusef with a lantern) and a
camera directed around them; the section on that composition is in git history. Without them the scene is the
picture and the TV, re-aimed simply, and looked at on contact sheets at 1440x900 and 390x844, night and day (not
measured on flat masks as the cast was):

- **The opening frame** (progress 0: the posters, and every path's first picture). The camera as it was: the tea
  house in the middle behind the open title box, the TV (scale 0.62, at (-1.3, -0.2, 1.7), turned a little toward the
  middle) at the lower left, clear of the box at 1440x900. On a portrait screen (`portraitPosition` (-0.55, -0.2,
  1.45)) the TV stands on the lawn left of the stepping stones, just above the low box, the tea house above it.
- **The move.** `camera.keys`: the wide shot to 0.1; a drift left and in by 0.135 as the box docks, which slides the TV
  out from under the docked box (it stands under part of it at 0.1, as it did); then in toward the door through
  (-0.55, 1.25, 4.0) at 0.4 and (-0.25, 1.4, 1.2) at 0.7 to (0, 1.55, -1.4) at 1, looking at (0, 1.3, -10). The TV's
  one track moves it 0.35 right (with 0.1 up) from 0.13 to 0.35, then down 0.9 and 0.4 nearer by 1, so it leaves at
  the bottom clear of the docked box. `camera.dock.shift` is 0.14 at 0.1, 0.18 at 0.35, 0.13 at 0.7 and 0.16 at 1
  (`cover` 0.33): the door stands a little right of the middle, clear of the docked box. `camera.portrait.keys`: the
  same move in the tall frame, (0, 1.35, 8.2) looking low at first (the box waits under the scene), through 0.1, 0.4
  and 0.7 to (-0.05, 1.6, 0.6) looking at the door. No new effect.
- **Night and dusk.** The lights are the sky (hemi), the key and the fill (directional) and the TV's own point light
  with its glow (both flickering with the screen). The lights that keyed the characters (`jefrie_key`, `jefrie_rim`,
  the leap mesh's pair, `yusef_dusk`) and the lantern's light and glow went with them. At night the TV's body reads as
  a grey-brown box lit by its own screen, the screen itself bright (moon, scanlines); at dusk it reads as warm wood.
  The lantern's light (5 at night, distance 6) also lit the lawn around Yusef: that warm pool is gone, so the lawn is
  a little darker at night than it was.

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

A pose-baked mesh can stand in for a rigged character for part of the scroll (the cast's leap was one: one mesh posed
in the air, cut in where the standing rig's pose was closest to it). The shipped manifest uses none now; the runtime
keeps the mechanism (tests/unit and e2e tea-hero-26 check it on made-up actors). Give the stand-in its own actor with
`follow` (the leap as it was):

```json
{ "id": "jefrie_leap", "src": "jefrie_leap_rig.glb", "follow": "jefrie", "envIntensity": 1.45,
  "position": [-0.0467, 0.013, 0.0453], "rotation": [-12.96, -12.09, -13.35], "scale": 0.9623, "rig": { "kind": "nodes" } }
{ "actor": "jefrie", "channel": "visible", "ease": "linear", "keys": [[0, 1], [0.14962, 1], [0.15, 0], [0.34986, 0], [0.35, 1]] }
{ "actor": "jefrie_leap", "channel": "visible", "ease": "linear", "keys": [[0, 0], [0.14962, 0], [0.15, 1], [0.34986, 1], [0.35, 0]] }
```

- **`follow`:** every frame, after every track, the follower's root takes its leader's position and rotation and its
  inner group the leader's scale (squash included). Its own `position`, `rotation` and `scale` place its model inside
  them, in the leader's model units: the offset a pose match gives. Its own whole-actor position, rotation and scale
  tracks are overridden; its node tracks, idle waves, `visible` and `opacity` are its own. A follower must name another
  actor that follows no one, or the manifest fails and the poster stays. A follower has no rest place of its own
  (`portraitPosition` is not read). An actor hidden at the top of the scroll by its own whole-actor `visible` or
  `opacity` track stands in for another: `npm test` and tea-hero-27 fail on one that follows no one.
- **A cut** is `visible` on both, the other way round; at exactly the cut's middle both values are 0.5 and both draw for
  that one frame. **A dissolve** is `opacity` on both with `fade` (keys such as `[[0.18, 1], [0.21, 0], [0.5, 0],
  [0.53, 1]]` and the reverse): alpha hashing dithers the opaque materials while it runs, and only then (an opaque
  material is drawn at opacity 1; but a see-through texel of its texture, which an opaque material otherwise ignores,
  dithers all the time: give a fade actor's opaque materials opaque textures).
- **Lights and glows hanging from a hidden actor are not drawn.** Give the follower its own lights, as many as the one
  it replaces (the leap mesh carried `jefrie_leap_key` and `jefrie_leap_rim`, as Jefrie carried `jefrie_key` and
  `jefrie_rim`; tea-hero-27 counts the point lights drawn down the scroll and back), so the scene's light count never
  changes at a cut: a change recompiles every lit material in the middle of the scroll. The TV's screen shader is not faded by `opacity`.
- **So cut an actor that carries lights or glows; dissolve only one that carries none.** Through a dissolve both
  actors are drawn, and their lights and glows are not faded with them: both actors' lights shine at full strength, so
  the light on the scene doubles, and the light count changes, so the first time the scroll enters the overlap every
  lit material on screen is compiled again (one frame took 0.57 s under SwiftShader with a light on each stand-in,
  0.68 s with the final cast's two light pairs; not measured on a real GPU).
- Tools that isolate an actor (`silhouettes.mjs`) hide meshes, never an actor's root, which its tracks set.

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
  (`hips`, `head`, `cape.01` ..., `tail.01` ...).

How rotation tracks act on these nodes (the rigs made for the cast that was):
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

- Boot entry (Stage's script): 1,375 B, **836 B gzip -9**, plus the site's existing shared preload helper.
- 3D chunk `stage.*.js`: 54,301 B, **18.1 KB gzip -9** (all of `src/scripts/tea/hero/` plus the meshopt decoder,
  which is 22.4 KB of it, 6.1 KB gzip; the actor swap added 1,181 B, 410 B gzip; the portrait camera path and the
  leave-the-page grace 301 B more; the loads tried again, the pictures uploaded at the mount and freed at the dispose
  1,349 B, 419 B gzip). Loads only after first paint, only on the 3D path.
- It also loads `three.module.*.js` (166.6 KB gzip) and `GLTFLoader.*.js` (13.1 KB gzip), byte-identical to the
  chunks the site already ships, so cached for anyone who has seen the homepage or a post with a model.
- Files on the 3D path per visit (2026-11-12, without the characters): 829,282 B (the one model, `tv_rig.glb`
  229,364 B; the four picture layers 594,260 B, the other mode's two among them fetched after the first frame; the
  manifest 5,658 B, 1.6 KB gzip) plus the one poster (41 to 76 KB: tall 40,772 / 54,080 B, wide 57,464 / 76,258 B,
  night / day) and the scripts above. With the cast it was 2,769,884 B (its four other models 1,854,408 B, its
  manifest 91,852 B). `public/tea/hero/` holds 1,057,856 B (3,061,128 B with the cast).
- `/tea/` itself: HTML 24.4 KB gzip (25.8 before the hero: the SVG garden went), CSS 8.6 KB gzip.
  Main-site budgets identical to the baseline.

## Verified

Without the characters (2026-11-12), in this sandbox: `npm run check`, `npm run build`, `npm test` (the unit tests
above among them) and the e2e specs `tea-hero.spec.mjs` and `tea.spec.mjs` in the **desktop** project (Chromium
1440x900) only: headless WebKit was not installed, so the phone project did not run. The posters re-rendered with
`poster.mjs` and looked at (no character on any of the four); contact sheets with `shots.mjs` at 1440x900 and
390x844, night and day; `edges.mjs` with 0 faults at its 17 sizes. Not done again: `silhouettes.mjs`, `verify.mjs`,
the posters' alignment against the live frame, the title box's text contrast over the scene (the night scene behind
it is darker than with the cast: no lantern), frame by frame checks of the TV leaving the frame.

Before, with the cast (`3beb3cd`): each e2e test of `tea-hero.spec.mjs` was seen failing on a build broken on
purpose, in both projects. Among them: the box holds still through the mount (8), a late scene moves nothing on
screen (9), arriving at `/tea/#projects` lands there (10), the switch pressed while loading (11), a lost and restored
context (12), reduced motion turned on (13, also checking the GPU holds nothing of the scene afterwards), no poster
fetched under the canvas (14), a square window (15), a missing manifest or model (16), Save-Data and a small device
(17), a reload inside the scene (18), the stage one screen and the foot's fade (19), the same box on both paths (20),
where the box docks (21), the box low on a portrait screen (22), a chapter link tapped just as the scene pins (23),
every part the manifest names found in the models (24), leaving the page while the scene loads (25), one actor
swapped for another on `/tea/` itself (26), the leap's swap with the lights and pictures counted (27), a beforeunload
that does not leave the page (28), the title box's lines clear of the switch on a phone and at 561, 600 and 640 px
(29), the page's real mailto link clicked while a model loads (30). The arrival at a chapter address itself is tea-17
(`tea.spec.mjs`). In `tests/unit/tea-hero.test.mjs` each of eight broken runtimes (the round-2 opacity bug, no
follow, no skeleton freed, a follower moved by `orientActors`, a `visible` on a node bound, no `fade`, a follower left
behind while its leader is cut away, `fade` dithering a fully shown actor) fails one of its tests. The loader was
checked on the spike's compressed models and a skinned test model (above). Tests 22, 26 and 27 have been rewritten
since (no cast) and were not seen failing on a broken build again.

## Not verified

- Frame rate on real hardware: only SwiftShader here (a few fps by design). The TV's texture is 512x512; expect the
  cost to be the full-screen draw of the picture; there are no shadows or post-processing.
- Real phones: iOS Safari's `svh` while pinned or with the stage sticky, its dynamic toolbar, device tilt on a real
  Android phone (the handling of a reading is checked with synthetic events in Chromium), a real GPU. Headless WebKit
  ran the phone e2e project.
- The back/forward cache: neither headless engine used it; a page restored from it keeps its state as it was.

## Known issues

1. **The TV and the dock.** At the moment the box docks (0.1, while it glides there for 900 ms) the TV still stands
   under part of the box's docked place, as it did with the cast; the camera's drift left slides it out by 0.135.
2. **The empty middle.** Without the characters the opening frame is the tea house behind the title box, a wide lawn
   and the TV at the lower left: the box hides the door, the subject of the move, until it docks (desktop) or scrolls
   away (portrait). Nothing stands between the TV and the house.
3. **Phones:** the scene holds its opening frame until the box's foot has passed 30% of the screen; on a 390x844
   phone that is half the scroll (the lead's cap), so the move to the door plays over the second half only, one screen
   of scroll. The TV has no contact shadow, so on the portrait frame, standing on the lawn by the stones, it looks
   pasted on rather than standing.
4. **4:3 screens** (1024x768, flow): the box is 53% of the width, so in the opening frame it covers part of the TV until
   the camera moves in.
5. The picture is final; its stepping stones still read as a regular ladder of ovals, most of all on a phone, where
   they fill the lower half of the frame, now with nothing on them.
6. **The lab page** is live (noindex, linked from nowhere, but a line of `stats-pages.txt`) until it is deleted.
7. At load, before the scene, tea-core's title moves about 10 px when its web font swaps in (CLS 0.0004, scene or
   not). The scene's arrival moves nothing on screen (tea-hero-8 and 9).

## Next steps

1. **Run the phone e2e project** (WebKit, iPhone 13) on a box that has WebKit: tea-hero-22 (now 300vh on a portrait
   screen and at least 0.8 of a screen of play) and the rest were only run in the desktop project after the
   characters came out.
2. **Delete `src/pages/tea-lab.astro`** when no more variants are to be tried, build, confirm `/tea-lab/` is gone
   from `dist/stats-pages.txt`, drop tea-16 or turn it into a check that the page is gone, run `verify.mjs` and the
   e2e spec, compare budgets and run `dist-diff` against an untouched build, then land per `CLAUDE.md`.
