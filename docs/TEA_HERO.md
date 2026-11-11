# The tea room hero (`/tea/`): runtime, manifest, tools

Built on branch `feat/alt-view-hero` (the hero runtime, 2026-11-10) and wired into the tea room on `tea/hero`
(2026-11-11), on top of tea-core's `/tea/` page. This file is meant to be enough on its own for a session that only
has the repo.

**Before anything merges to main: delete `src/pages/tea-lab.astro`.** It is a development page (noindex, linked from
nowhere) kept so the hero can run alone. While it exists the build lists `/tea-lab/` in `stats-pages.txt`. It no
longer renames the main site's stylesheet (it imports `tea.css`, not `site.css`).

## What it is

The top of `/tea/` copies the structure of the Shopify Editions Winter '26 hero: two characters in motion around one
object, in front of one picture placed in 3D space, with a framed title box. Ours: the tea house garden at night,
Jefrie (left) and Yusef (right, with a lantern) around a small CRT television. Everything is real-time Three.js:

- **Scroll timeline.** With the scene the section is 300vh and pinned (two layouts, below). One progress value (0 to
  1) drives the camera along a Catmull-Rom path (wide shot, a slight orbit right, then in between the characters
  toward the tea house door) and every character track at once. The moment the brief asks for: from progress 0.1 to
  0.45 Jefrie crouches, leaps over the TV and turns in the air with her tail curling while the camera orbits past her;
  by 1 both characters flank the door.
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
- **Nothing moves under the reader.** The section grows by two screens when the scene pins, so the pin waits for a
  moment when that moves nothing the reader reads (`whenPinnable` in `pin.js`): the scroll at rest (no scroll for 200 ms
  and none over the next two frames, so a chapter link tapped just before the pin gets its jump), and the page at its
  top or the title box above the screen (then the scroll moves by the growth). A reader with the box on screen keeps
  the poster until they go back to the top or past it. A reload or a way back to a place inside the pinned scene
  lands there again (`onLeave`/`placeBack`). `data-hero-settled` on the section says the hero will change no layout
  by itself any more: set with `data-3d-off` on the static path, and once the scene is pinned and its first frame is
  up. Tests that need the page to hold still wait for it (or open `/tea/?hero=off`).

## The first picture, on every path

The poster, a still of the scene's opening frame (progress 0, idle time 0, pointer centred), is the hero's picture
for everyone: one image for the mode and the screen's shape (`poster-{night,day}.webp` 1600x1000, and under
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
| the scene loads | the poster, then the canvas fades in over the same frame (700 ms) | the posters are the opening frame (mean difference 1.0 to 1.5 of 255, offset 0, at 1440x900, 1280x720, 1440x700, 768x1024, 390x844, 360x640), so nothing jumps; re-run `poster.mjs` after any change to the opening composition or the assets |

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
| `public/tea/hero/*.webp, *.glb` | stand-in picture layers (`bg-*`), posters (`poster-*`), stand-in models (`standin-*`) |
| `scripts/tools/tea-hero/` | `shots.mjs`, `poster.mjs`, `silhouettes.mjs` (overlap and behind-the-box per size and scroll), `verify.mjs`; `standins.mjs` (stand-in GLBs), `paint.mjs` + `paint-scene.js` (stand-in picture) |
| `tests/e2e/tea-hero.spec.mjs` | the e2e spec (tea-hero-1 to 24, listed in `tests/e2e/INVENTORY.md`) |
| `src/pages/tea-lab.astro` | the lab: the real hero and rail over empty chapter heads; `?manifest=`. DELETE before merging |

Outside these, the slice touched `src/styles/tea/cover.css` (the padding variables; the SVG garden's rules and the
old stage rules removed; the box's backdrop blur removed), `src/styles/tea/tea.css` (the strip's `::before`) and deleted
`src/components/tea/TeaNight.astro`. No `package.json` change; `three` 0.160 and the tools' `@playwright/test` and
`sharp` are already dependencies. Nothing imports from `src/scripts/home/**`.

## The manifest (`public/tea/hero/manifest.json`)

Units: world units (the stand-ins are about 2 units tall at their manifest scale). Y is up, the camera starts on +z
looking toward -z, the picture is behind at negative z. Angles are degrees, Euler order YXZ, written `[x, y, z]`.
Relative URLs resolve against the manifest's own URL. Every optional field has a default (`manifest.js`).

| Field | Meaning |
|---|---|
| `version` | must be `1` |
| `reference.aspect` | the aspect the scene is composed for (1.6). Wider screens keep its horizontal field of view (crop top and bottom), narrower landscape screens keep its vertical one (crop the sides): like `object-fit: cover`, so the poster matches. Portrait screens use `camera.portrait` |
| `background.layers[]` | the picture: `id`, `night` and `day` image URLs (`src` is an alias for both), `z` (depth, e.g. -10 far, -6 mid), `size` `[w, h]` in units (keep the image's aspect), `x`, `y` (centre), `cutout` (true for a layer with alpha: transparent, no depth write), `fog` (0..1, tint toward the fog colour), `portraitScale` (default 1.5: how much the layer grows on a portrait screen to cover the taller view). The current mode's images load first, the other mode's after the first frame |
| `actors[]` | `id`, `src` (GLB), `scale` (uniform), `position`, `rotation` (the rest pose of the actor's root), `portraitPosition` (optional; else `x` is multiplied by `camera.portrait.spread`), `rig` (`kind`: `"nodes"` or `"baked"`, informational; `map`: `{ "conventionName": "nameInTheGLB" }` aliases), `deform`, `materials`, `tint` (hex multiplied into every material colour), `envIntensity` (default 0.6), `props[]` |
| `actors[].deform` | for meshes with no skeleton: `{ "kind": "bend", "start": -0.15, "y": -0.42, "rest": 0.35 }`. In the mesh's own space (for a quantized mesh: model units divided by its node's scale, see below), everything past `start` along -z (a tail behind the body) curls up toward +y around height `y`; `rest` is the resting curvature (1/units). The `bend` channel adds to it |
| `actors[].materials` | `{ "<node name>": { "shader": "crt" } }`: every mesh at or under that node gets the TV screen shader (the node needs UVs) |
| `actors[].props[]` | separately loaded rigid GLBs: `id` (the prop's root is renamed to it, so tracks, lights and glows can name it), `src`, `parent` (a node of the actor, e.g. `hand.R`; missing or absent: the actor's model root), `scale`, `position`, `rotation`, `materials` |
| `lights[]` | `id`, `type` (`ambient`, `hemi`, `dir`, `point`), `attach` (`{ "actor", "node" }`, optional: the light hangs from that node, `position` is then local), `distance`, `decay` (point), `flicker` (`"crt"`: follows the screen's flicker), and `night` / `day` states each `{ color, ground (hemi), intensity, position }`. Lerped by the mode |
| `glows[]` | additive halo sprites: `attach`, `position`, `size`, `color`, `night` and `day` opacity, `flicker` |
| `camera` | `fov` (vertical, at the reference aspect), `near`, `far`, `keys[]` `{ t, pos, look }` (t = the scene's progress; at least two; uneven spacing is fine), `parallax` `{ x, y (units of offset at full pointer), ease (1/s), drift (0..1, the touch drift) }` |
| `camera.portrait` | a portrait screen (aspect 1 or less): `fov` (vertical, at `aspect`), `aspect` (the tall poster's shape, 0.75 in the manifest, default 430/932: narrower screens keep the vertical field and crop the sides, wider ones crop top and bottom, like cover), `spread` (x multiplier for the actors' rest positions), `travel` (the share of a whole actor's own sideways travel, its position track's x, kept; default `spread`), `pull` (units pulled back at the start), `drop` (units the look-at is lowered at the start) |
| `camera.dock` | the dock layout: `shift`, the lens shift while the box is docked, as a share of the frame's width the picture slides right: a number, or keys `[[t, shift], ...]` along the scene's progress; `cover` (default 0.33), the share of the width the docked box covered where the keys were tuned (1440x900): the shift is scaled by the share it covers on the screen at hand |
| `tracks[]` | scroll-driven: `actor`, `node` (omit for the whole actor), `channel`, `keys` `[[t, value], ...]`, `ease` (`"smooth"` default, or `"linear"`). Values hold before the first key and after the last |
| `idle[]` | time-driven waves: `actor`, `node`, `channel`, `amp` (number or `[x, y, z]`), `hz`, `phase` (0..1), `wave` (`sin`, `bounce`, `noise`), `scroll` (optional `[[t, gain], ...]`: the wave's strength along the scroll) |
| `motes` | `count`, `mobile` (count on phones), `size`, `box` `[[minX, minY, minZ], [maxX, maxY, maxZ]]`, `fly` and `petal` colours |
| `look` | `night` / `day`: `exposure` (ACES tone mapping), `fog` (colour), `clear` (the colour behind everything) |

### Composition (as tuned on the stand-ins)

Measured with `silhouettes.mjs` (each actor drawn alone as a flat silhouette, by scene progress) and the contact
sheets. Desktop: `camera.dock.shift` 0.19 while Jefrie crouches, 0.16 to 0.09 through the leap (0.26 to 0.45), 0.05 at
0.62, 0.14 to 0.16 at the door, scaled by the docked box's share of the width (1 at 1440x900, 1.05 at 1366x768, 1.11 at
1280x800). Jefrie steps right (0.45) before the crouch and ends nearer the door; the orbit at 0.3 swings less. Behind
the docked box: Jefrie at most 12.5 to 14.5% at the crouch (0.1) and 0.5 to 3.5% at the door at 1440x900, 1366x768 and
1280x800, the TV 4 to 9.5% at 0.4; 4:3 screens flow instead (at 1024x768 the docked box would cover 45% of the width
and Jefrie stood 79% behind it). Phone: `camera.portrait.aspect` 0.75 (a 3:4 tablet keeps the whole frame, heads
included), `travel` 0.1, Yusef's `portraitPosition` [1.15, 0.15, -0.3] (`spread` 0.5 draws Jefrie in to -0.9): the
lantern clears Jefrie's head at every position; her tail passes in front of the hem of his robe at scene progress 0.5
to 0.55 (4.0% of his silhouette at most at 390x844 and 360x740, 3.4% at 768x1024), nothing else touches from 0.15 to 1.
Known on desktop (stand-ins): through the leap (0.4 to 0.5) Yusef's lantern meets Jefrie's head and her tail crosses
his robe, 16% of the smaller silhouette at 1440x900 at 0.45. Raising his arm cut the lantern off the top of the frame:
left for the final assets.

Channels (scroll tracks and idle waves add together, both as **deltas from the rest pose**, so a final asset with a
different rest pose keeps working):

| Channel | Value | Applies |
|---|---|---|
| `position` | `[x, y, z]` units | added to the node's rest position (parent space). With no `node`: moves the actor's root |
| `rotation` | `[x, y, z]` degrees | after the rest rotation, in the node's own space |
| `scale` | `[x, y, z]` factors | multiplies the rest scale (the actor's inner group when no `node`) |
| `squash` | number (0.1 = 10% taller and thinner, -0.1 = squashed) | volume-keeping scale on y |
| `bend` | number (curvature) | added to the actor's `deform.rest`; whole-actor only |

### Node naming convention for rigs

Bones of a skinned mesh and rigid part nodes are the same to the runtime (both are `Object3D`s). Name them:

`hips, spine, chest, neck, head, jaw, upperarm.L, forearm.L, hand.L, upperarm.R, forearm.R, hand.R, thigh.L, shin.L,
foot.L, thigh.R, shin.R, foot.R, wing.L, wing.R, tail.01 ... tail.NN` (base to tip, two digits), `cape`, `robe`,
`hair`, and for props `prop`, `lantern`, `bell`. The TV: `body`, `screen` (with UVs, for the shader), `antenna.L`,
`antenna.R`, `knob.1`, `knob.2`.

GLTFLoader strips `.` `:` `/` `[` `]` from names and turns spaces into `_`, so `upperarm.L` arrives as `upperarmL`.
Write the convention names in the manifest anyway: the lookup tries the rig `map` alias, the exact name, the
sanitised name, then the glTF's original name. A track whose actor or node is missing is skipped silently (e2e tea-hero-24 lists any name of the shipped manifest the models lack). Put each
part's pivot where it bends (shoulder, wing root, tail joint): rotation tracks turn nodes about their own origin.
Models face +z with Y up. The root's `position` is where the model's origin goes.

Both rig kinds through one mechanism:
- **Skinned or part-rigged:** tracks name bones or parts (`wing.L`, `tail.03`).
- **Pose-baked mesh** (one TRELLIS mesh, no skeleton): whole-body tracks only (`position`, `rotation`, `squash`),
  the `bend` deform for a tail, and props (lantern, bell) loaded separately and parented to the actor.

### What the loader takes (checked on 2026-11-11)

- **Compression:** `EXT_meshopt_compression` (the decoder, `three/examples/jsm/libs/meshopt_decoder.module.js`, is
  bundled into the lazy 3D chunk only: 22.4 KB, 6.1 KB gzip of it), `KHR_mesh_quantization` and `EXT_texture_webp`,
  all three as required extensions: what `gltf-transform optimize --compress meshopt --texture-compress webp` and
  `gltfpack -cc -tc` write. The spike's compressed models in `docs/tea-handoff/hero/glb/` (Yusef, the CRT, the lantern,
  Jefrie) load in the lab through a manifest variant, with no console error. No KTX2 or Draco decoder is bundled.
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
node scripts/tools/tea-hero/verify.mjs --url http://localhost:4411/tea/   # behaviour checks, also against /tea-lab/
npm run e2e -- --project=desktop --project=phone tests/e2e/tea-hero.spec.mjs   # --workers=2 on a busy box
node scripts/tools/tea-hero/standins.mjs                       # rewrites public/tea/hero/standin-*.glb
node scripts/tools/tea-hero/paint.mjs                          # rewrites public/tea/hero/bg-*.webp
```

Headless WebGL: Chromium from Playwright with `--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist` renders correctly (the scripts pass these; the e2e desktop project's Chromium has WebGL as it
is, and headless WebKit has a WebGL context too). SwiftShader draws a few frames a second, so the tools freeze idle
time (`__teaHero.freeze(t)`), pin the pointer (`__teaHero.pointer([0, 0])`), hold the frame loop
(`__teaHero.hold(true)`; `render()` still draws one) and snap the smoothing (`__teaHero.render()`) so frames are
repeatable and a loaded box doesn't time out. They also hide Astro's dev toolbar and turn the box's transitions off.
`__teaHero.setProgress(p)` fixes the progress (null gives the scroll back); `__teaHero.dispose()` tears everything down
and restores the poster.

## Measured (2026-11-11, this branch)

- Boot entry (Stage's script): 1,211 B, **755 B gzip -9**, plus the site's existing shared preload helper.
- 3D chunk `stage.*.js`: 50,671 B, **16.8 KB gzip -9** (all of `src/scripts/tea/hero/` plus the meshopt decoder,
  which is 22.4 KB of it, 6.1 KB gzip). Loads only after first paint, only on the 3D path.
- It also loads `three.module.*.js` (166.6 KB gzip) and `GLTFLoader.*.js` (13.1 KB gzip), byte-identical to the
  chunks the site already ships, so cached for anyone who has seen the homepage or a post with a model.
- Files on the 3D path per visit, stand-ins: 2.56 MB (the Jefrie stand-in `/media/jefrie-3d/jefrie-v2.glb` 2.07 MB,
  the three other stand-in models 215 KB, the four picture layers 277 KB, the manifest) plus the one poster (53 to
  88 KB: tall 53,234 / 58,734 B, wide 76,668 / 87,596 B). `public/tea/hero/` holds 779 KB.
- `/tea/` itself: HTML 23.9 KB gzip (25.8 before the hero: the SVG garden went), CSS 8.5 KB gzip (8.4 before).
  Main-site budgets identical to the baseline.

## Verified

- e2e `tea-hero.spec.mjs` (tea-hero-1 to 24) in both projects, desktop (Chromium 1440x900) and phone (WebKit,
  iPhone 13); each test seen failing on a build broken on purpose. Among them: the box holds still through the mount
  (8), a late scene moves nothing on screen (9), arriving at `/tea/#projects` lands there (10), the switch pressed
  while loading (11), a lost and restored context (12), reduced motion turned on (13), no poster fetched under the
  canvas (14), a square window (15), a missing manifest or model (16), Save-Data and a small device (17), a reload
  inside the scene (18), the stage one screen and the foot's fade (19), the same box on both paths (20), where the
  box docks (21), the box low on a portrait screen (22), a chapter link tapped just as the scene pins (23), every part the manifest names found in the models (24).
- `verify.mjs` against `/tea/` and `/tea-lab/` (both layouts; see its header).
- The poster against the scene's opening frame at 1440x900, 1280x720, 1440x700, 768x1024, 390x844 and 360x640 (offset
  0, mean difference 1.0 to 1.5 of 255); the actors' silhouettes as above (`silhouettes.mjs`); the title box's text
  contrast by day and by night over the poster and the scene (by day title 3.1, kicker 5.1, the rest 5.5 or more).
- The loader on the spike's compressed models and a skinned test model (above).

## Not verified

- Frame rate on real hardware: only SwiftShader here (a few fps by design). Expect the costs to be the Jefrie GLB's
  2048 textures and one full-screen draw; there are no shadows or post-processing.
- Real phones: iOS Safari's `svh` while pinned or with the stage sticky, its dynamic toolbar, device tilt on a real
  Android phone (the handling of a reading is checked with synthetic events in Chromium), a real GPU. Headless WebKit
  ran the phone e2e project.
- The back/forward cache: neither headless engine used it; a page restored from it keeps its state as it was.

## Known issues

1. **Stand-ins.** Yusef is a primitive angel (`standin-angel.glb`), the TV is primitive, the picture is a painted
   placeholder (`bg-*`), Jefrie is the existing 2 MB `jefrie-v2.glb` (over the 1.5 MB per-file cap: a stand-in only;
   one unrigged mesh, her tail curls through the bend deform). All of them are data in the manifest.
2. **The lab page** must be deleted before merging (its `stats-pages.txt` line).
3. At load, before the scene, tea-core's title moves about 10 px when its web font swaps in (CLS 0.0004, scene or
   not). The scene's arrival moves nothing on screen (tea-hero-8 and 9).
4. **Composition left for the final assets:** at progress 0 the centred box hides most of the TV on every landscape
   screen (68% at 1440x900, 90% at 1024x768): the opening frame and the wide posters need recomposing with the final
   cast. Mid-leap on desktop Yusef's lantern meets Jefrie's head (see "Composition").

## Next steps

1. **Final assets (hero-assets):** for each character a GLB facing +z, Y up, compressed (meshopt via
   `gltfpack -cc -tc` or `gltf-transform meshopt`; WebP textures, 1024 or smaller), under 1.5 MB each and 4 MB for
   everything. Rigged: nodes named by the convention above, pivots at the joints. Unrigged: say so and give the tail's
   start (`deform.start`, `deform.y` in the mesh's own, quantized space). Props (lantern, bell) as separate GLBs with
   their origin at the grip. The TV with a `screen` node that has UVs. The picture: one painted image (about
   2400x1500, WebP under 300 KB) per mode, plus one or two cut-out layers (WebP with alpha) from the same picture at
   nearer depths, sized in world units to their planes (the stand-in layout: far plane 24x15 units at z -10, centre y
   0.65; mid 17x10.6 at z -6, centre y 1.0, 100 px a unit).
2. **Swap:** edit `public/tea/hero/manifest.json` only (`src`, `scale`, `position`, `rotation`, `deform`, node names
   in tracks and idle, layer sizes). Look at it in the lab with a variant first, then on `/tea/`; adjust the keys,
   `camera.dock.shift` and `camera.portrait.travel` with `shots.mjs --sheet` (the title box in the frame), then run
   `poster.mjs`, and hold the result to `silhouettes.mjs` at 390x844, 360x740, 768x1024, 1280x800 and 1440x900: no
   overlap between the actors, nothing behind the docked box. Delete `standin-*.glb` and `bg-*.webp` that are no
   longer referenced and stop pointing at `jefrie-v2.glb`. Commit the final binaries once.
3. **Delete `src/pages/tea-lab.astro`**, build, confirm `/tea-lab/` is gone from `dist/stats-pages.txt`, run
   `verify.mjs` and the e2e spec, compare budgets and run `dist-diff` against an untouched build, then land per
   `CLAUDE.md`.
