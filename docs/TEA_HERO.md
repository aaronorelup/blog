# The tea room hero (`/tea/`): runtime, manifest, tools

Branch `feat/alt-view-hero`, based on `origin/main` at `6566f5c`. Written by the hero-runtime agent on 2026-11-10.
This file is meant to be enough on its own for a session that only has the repo.

**Before anything merges to main: delete `src/pages/tea-lab.astro`.** It is a development page (noindex, linked
from nowhere) kept so the hero can be run alone. While it exists the build lists `/tea-lab/` in `stats-pages.txt`,
and its imports rename the shared stylesheet chunk on every page (same bytes, same hash, new name; see "Known issues").

## What it is

The top of `/tea/` copies the structure of the Shopify Editions Winter '26 hero: two characters in motion around one
object, in front of one picture placed in 3D space, with a framed title box. Ours: the tea house garden at night,
Jefrie (left) and Yusef (right, with a lantern) around a small CRT television. Everything is real-time Three.js:

- **Scroll timeline.** The section is pinned (about 300vh desktop, 220vh phone). One progress value (0 to 1) drives
  the camera along a Catmull-Rom path (wide shot, a slight orbit right, then in between the characters toward the
  tea house door) and every character track at once. The moment the brief asks for: from progress 0.1 to 0.45 Jefrie
  crouches, leaps over the TV and turns in the air with her tail curling while the camera orbits past her; by 1 both
  characters flank the door.
- **Idle loop on top:** breathing bob, sway, wing beats, lantern swing, tail curl, antenna wobble, the TV screen's
  emissive shader (moon, scanlines, rolling bar, grain, flicker shared with its light and glow), drifting motes
  (fireflies and petals, one Points draw).
- **Pointer parallax** (mouse), device tilt where no permission prompt is needed (Android), a slow drift otherwise.
- **Day and night** follow `data-mode` on `<html>` (the site's `scene-mode`), tweened live. Night is moonlight,
  lantern and TV glow; day is a warm dusk (separate picture, lights lerped).
- **Lazy and safe.** The poster (CSS background, one image for the mode and the screen shape) paints first. After
  first paint and idle, `boot.js` (760 B gzip) checks reduced motion, Save-Data / 2g, a small device
  (`deviceMemory < 2` or `hardwareConcurrency < 3`) and WebGL, then imports the 3D chunk. The canvas cross-fades in
  over the poster once a frame is drawn. Any failure leaves the poster, with the reason in `data-3d-off` on the
  section. Drawing stops when the hero is off screen or the tab is hidden. Pixel ratio capped at 1.75 (1.5 on touch
  or small screens; fewer motes there too).

## Files

| Path | What |
|---|---|
| `src/components/tea/hero/Stage.astro` | renders the whole `.tea-hero-stage` div (poster and shade) and loads `boot.js`; prop `manifest` (default `/tea/hero/manifest.json`); imports `stage.css` |
| `src/styles/tea/stage.css` | poster per mode and shape, canvas fade, readability shade, the pin and the title box's two placements |
| `src/scripts/tea/hero/boot.js` | the tiny entry: gating, then `import('./stage.js')` |
| `src/scripts/tea/hero/stage.js` | `mount(section, stage)`: build, pin, frame loop, pause, resize, mode; `window.__teaHero` hook |
| `src/scripts/tea/hero/manifest.js` | fetch and normalise the manifest (defaults for every optional field) |
| `src/scripts/tea/hero/actors.js` | GLB loading (GLTFLoader + MeshoptDecoder), props, material overrides, tint, bend |
| `src/scripts/tea/hero/tracks.js` | node lookup, scroll tracks and idle waves as deltas from rest pose |
| `src/scripts/tea/hero/deform.js` | the bend deform for unrigged meshes (vertex shader) |
| `src/scripts/tea/hero/backdrop.js` | picture layers, night and day images mixed in a shader |
| `src/scripts/tea/hero/camera.js` | camera path, cover-fit field of view, portrait framing, parallax |
| `src/scripts/tea/hero/lights.js`, `crt.js`, `motes.js`, `input.js`, `pin.js` | lights and glows, the screen shader and flicker, motes, scroll and pointer input, the pin |
| `public/tea/hero/manifest.json` | the scene, all of it |
| `public/tea/hero/*.webp, *.glb` | stand-in picture layers (`bg-*`), posters (`poster-*`), stand-in models (`standin-*`) |
| `scripts/tools/tea-hero/` | `standins.mjs` (stand-in GLBs), `paint.mjs` + `paint-scene.js` (stand-in picture), `poster.mjs`, `shots.mjs`, `verify.mjs` |
| `src/pages/tea-lab.astro` | the lab page. DELETE before merging |

No `package.json` change; `three` 0.160 and the tools' `@playwright/test` and `sharp` are already dependencies.
Nothing imports from `src/scripts/home/**`.

## Wiring it into tea-core's page (`TeaHero.astro`)

tea-core's markup contract, with `<Stage />` replacing the bare stage div:

```astro
---
import Stage from '../hero/Stage.astro';   // path from src/components/tea/
---
<section class="tea-hero" id="top" data-tea-hero>
  <div class="tea-hero-pin">
    <Stage />
    <div class="tea-hero-box"> kicker, h1, statement, counters, chapter TOC, skip link, "Go to the main site" </div>
  </div>
</section>
```

Rules for the surrounding CSS:
- No ancestor of `.tea-hero-pin` may set `overflow` (hidden, auto, clip), or `position: sticky` stops working.
- Without `data-3d="on"` the section should be one viewport tall with the box centred (tea-core's static rules; the
  lab page shows one way). `stage.css` sets `.tea-hero` and `.tea-hero-pin` to `position: relative` and the stage to
  `position: absolute; inset: 0; z-index: 0`; the box needs `position: relative; z-index: 2` or higher in static mode.
- With `data-3d="on"` `stage.css` owns the box's placement (`left`, `top`, `translate`, `scale`; centred while
  `data-hero-phase="open"`, docked lower left from progress 0.1, `data-hero-phase="docked"`; on phones it waits at
  the bottom, then docks smaller). tea-core styles the box's contents and may react to `--tea-hero-progress` (0..1,
  three decimals) and `data-hero-phase` on `.tea-hero`, e.g. to fade the statement once docked.
- The canvas has `pointer-events: none`; pointer input is read on `window`. The box stays clickable.
- The mode switch (`ModeToggle` + `mode.js`) is enough; the hero watches `data-mode` with a MutationObserver.

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
| `actors[].deform` | for meshes with no skeleton: `{ "kind": "bend", "start": -0.15, "y": -0.42, "rest": 0.35 }`. In the mesh's own space, everything past `start` along -z (a tail behind the body) curls up toward +y around height `y`; `rest` is the resting curvature (1/units). The `bend` channel adds to it |
| `actors[].materials` | `{ "<node name>": { "shader": "crt" } }`: every mesh at or under that node gets the TV screen shader (the node needs UVs) |
| `actors[].props[]` | separately loaded rigid GLBs: `id` (the prop's root is renamed to it, so tracks, lights and glows can name it), `src`, `parent` (a node of the actor, e.g. `hand.R`; missing or absent: the actor's model root), `scale`, `position`, `rotation`, `materials` |
| `lights[]` | `id`, `type` (`ambient`, `hemi`, `dir`, `point`), `attach` (`{ "actor", "node" }`, optional: the light hangs from that node, `position` is then local), `distance`, `decay` (point), `flicker` (`"crt"`: follows the screen's flicker), and `night` / `day` states each `{ color, ground (hemi), intensity, position }`. Lerped by the mode |
| `glows[]` | additive halo sprites: `attach`, `position`, `size`, `color`, `night` and `day` opacity, `flicker` |
| `camera` | `fov` (vertical, at the reference aspect), `near`, `far`, `keys[]` `{ t, pos, look }` (t = scroll progress; at least two; uneven spacing is fine), `parallax` `{ x, y (units of offset at full pointer), ease (1/s), drift (0..1, the touch drift) }`, `portrait` `{ fov, spread (x multiplier for actors), pull (units pulled back at the start), drop (units the look-at is lowered at the start) }` |
| `tracks[]` | scroll-driven: `actor`, `node` (omit for the whole actor), `channel`, `keys` `[[t, value], ...]`, `ease` (`"smooth"` default, or `"linear"`). Values hold before the first key and after the last |
| `idle[]` | time-driven waves: `actor`, `node`, `channel`, `amp` (number or `[x, y, z]`), `hz`, `phase` (0..1), `wave` (`sin`, `bounce`, `noise`), `scroll` (optional `[[t, gain], ...]`: the wave's strength along the scroll) |
| `motes` | `count`, `mobile` (count on phones), `size`, `box` `[[minX, minY, minZ], [maxX, maxY, maxZ]]`, `fly` and `petal` colours |
| `look` | `night` / `day`: `exposure` (ACES tone mapping), `fog` (colour), `clear` (the colour behind everything) |

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
sanitised name, then the glTF's original name. A track whose actor or node is missing is skipped silently. Put each
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

## Running it

```bash
npx astro dev --port 4392            # then http://localhost:4392/tea-lab/  (?hero=on skips the device checks,
                                     # ?hero=off forces the poster). Stop with: npx astro dev stop
node scripts/tools/tea-hero/shots.mjs --out shots/hero-lab     # 1440x900 and 390x844, night and day, p 0..1
node scripts/tools/tea-hero/poster.mjs                         # rewrites public/tea/hero/poster-*.webp
node scripts/tools/tea-hero/verify.mjs                         # behaviour checks (all pass at this commit)
node scripts/tools/tea-hero/standins.mjs                       # rewrites public/tea/hero/standin-*.glb
node scripts/tools/tea-hero/paint.mjs                          # rewrites public/tea/hero/bg-*.webp
```

Headless WebGL: Chromium from Playwright with `--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist` renders correctly (the scripts pass these). SwiftShader draws a few frames a second, so time
the scripts generously; the shot and poster scripts freeze idle time (`__teaHero.freeze(t)`), pin the pointer
(`__teaHero.pointer([0, 0])`) and snap the smoothing (`__teaHero.render()`) so frames are repeatable. They also hide
Astro's dev toolbar, which otherwise lands in the capture. `__teaHero.setProgress(p)` fixes the progress (null gives
the scroll back); `__teaHero.dispose()` tears everything down and restores the poster.

The posters are the opening frame (progress 0, idle time 0, pointer centred, title box hidden): 1600x1000 for
landscape and 430x932 at 1.5x for portrait (CSS picks the tall one under `max-aspect-ratio: 1/1`). Re-run
`poster.mjs` after any change to the opening composition or the assets, so the cross-fade does not jump.

## Measured (this commit)

- Boot entry (Stage's script): 1.2 KB, **760 B gzip**, plus the existing shared preload helper.
- Hero chunk `stage.*.js`: 44.8 KB, **14.8 KB gzip** (all of `src/scripts/tea/hero/` plus the meshopt decoder).
- It also loads `GLTFLoader.*.js` (13.2 KB gzip) and `three.module.*.js` (**165 KB gzip**), both chunks the site already
  ships. three cannot be tree-shaken for us: `<ao-model>` does `import('three')` (the whole namespace), so Rollup
  keeps one full three chunk that the homepage scene, `<ao-model>` and the hero share. Our imports are named.
- Main-site budgets after the build: identical to the baseline (post page 20.5/20 KB, ledger row 351 B, homepage
  before the scene 22.6 KB).
- Hero files in `public/tea/hero/`: 768 KB in all (largest: standin-angel.glb 126 KB; posters 77, 88, 48, 53 KB).
  Plus the Jefrie stand-in referenced from `/media/jefrie-3d/jefrie-v2.glb` (2.07 MB: **over** the 1.5 MB per-file
  cap; acceptable only as a stand-in).

## Verified

- `npm run check` and `npm run build` pass (with the lab page present).
- `verify.mjs`: reduced motion and no WebGL keep the poster with no console errors and no canvas; the 3D path has no
  console errors; CLS under 0.001 when the canvas appears; the mode switch tweens the scene live; drawing stops off
  screen and resumes; the skip link lands on the first chapter through the pin.
- Screenshots at 1440x900 and 390x844, night and day, progress 0, 0.25, 0.5, 0.75, 1 (in the hero-lab folder of the
  build box, `shots/hero-lab/` if you run `shots.mjs`).

## Not verified

- Frame rate on real hardware: only SwiftShader was available (a few fps by design). Expect the costs to be the
  Jefrie GLB's 2048 textures and one full-screen draw; there are no shadows or post-processing.
- Real phones (WebKit cannot run on the build box), device tilt, iOS Safari's `svh` behaviour while pinned.
- Save-Data and the small-device gate (code path only).
- Arriving with a `#chapter` hash: `pin.js` compensates the scroll when the section grows, checked by reasoning, not
  by a test.

## Known issues

1. **Stand-ins.** Yusef is a primitive angel (`standin-angel.glb`), the TV is primitive, the picture is a painted
   placeholder (`bg-*`), Jefrie is the existing 2 MB `jefrie-v2.glb` (one unrigged mesh; her tail curls through the
   bend deform). All of them are data in the manifest.
2. **The lab page** must be deleted before merging (stats-pages entry, CSS chunk name).
3. **CSS chunk name.** With a second page importing `ModeToggle`, Vite names the shared stylesheet
   `ModeToggle.D0HzDAyb.css` instead of `PanelChrome.D0HzDAyb.css` on every page: same bytes and hash, so only the
   file name changes (one extra download per visitor after the deploy). tea-core's page will cause the same; worth a
   look at integration, not a bug.
4. `three.module.*.js` and `GLTFLoader.*.js` get new hashes with the hero in the build (three's chunk is 101 bytes
   larger, most likely its export list changing for the hero's named imports; not investigated further). The homepage downloads three again once after the deploy.
5. The portrait framing uses one camera path pulled back and aimed lower; phones show the characters closer
   together (`portrait.spread`) and partly overlapping at progress 0.25.

## Next steps

1. **Final assets (hero-assets):** for each character a GLB facing +z, Y up, compressed (meshopt via
   `gltfpack -cc -tc` or `gltf-transform meshopt`; WebP textures, 1024 or smaller), under 1.5 MB each and 4 MB for
   everything. Rigged: nodes named by the convention above, pivots at the joints. Unrigged: say so and give the tail's
   start (`deform.start`, `deform.y` in mesh units). Props (lantern, bell) as separate GLBs with their origin at the
   grip. The TV with a `screen` node that has UVs. The picture: one painted image (about 2400x1500, WebP under 300 KB)
   per mode, plus one or two cut-out layers (WebP with alpha) from the same picture at nearer depths, sized in world
   units to their planes (the stand-in layout: far plane 24x15 units at z -10, centre y 0.65; mid 17x10.6 at z -6,
   centre y 1.0, 100 px a unit).
2. **Swap:** edit `public/tea/hero/manifest.json` only (`src`, `scale`, `position`, `rotation`, `deform`, node names
   in tracks and idle, layer sizes). Look at the lab, adjust the keys, run `shots.mjs`, then `poster.mjs`. Delete
   `standin-*.glb` and `bg-*.webp` that are no longer referenced.
3. **Wire in:** rebase this branch on tea-core's branch, put `<Stage />` in `TeaHero.astro` as shown above, check
   the box's static and pinned layouts with tea-core's styles, run `verify.mjs` against `/tea/` (`--url`; it expects
   a `.lab-skip` link and `#c1`/`#c3` ids: change those selectors to tea-core's skip link and chapter ids).
4. **Delete `src/pages/tea-lab.astro`**, build, confirm `/tea-lab/` is gone from `dist/stats-pages.txt`, compare budgets
   with the baseline, then land per `CLAUDE.md`.
