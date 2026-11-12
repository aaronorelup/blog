# Adding a world (and what the engine gives you)

A world is the generic scene plus three small files. Copy xAI's, change the names, and it runs:

| File | What it is |
|---|---|
| `worlds/<id>.js` | The configuration: looks and placement only. No facts |
| `signatures/<id>.js` | The signature moment of beat c. Optional: with none, beat c shows the myth and its truth |
| `src/styles/ai-landscape/2026-11-10/world-<id>.css` | Only what `world.css` cannot know, scoped to `[data-world="<id>"]`. Optional |

Nothing else is edited. `worlds/index.js` finds the config, `scene/index.js` finds the signature, and
`sections/40-worlds.astro` finds the stylesheet. Delete all three and the world still runs on `_default.js`.

## The configuration (`worlds/xai.js` is the model)

| Key | Meaning |
|---|---|
| `id`, `brandMode` | The company's id. `'full'`, or `'marks-only'`: glass, glow and line fall back to house greys. Marks, character and art stay |
| `theme`, `hour` | `chrome` (`'light'` or `'dark'`), `ground`, `ink`, `glass`, `rim`, `glow`, `line` (the 2 px line under the kicker and the iris edge), `prism` (four hex, Google only). `lamp: [x, y, z]` toward the lamp (negative z puts it behind the stack), `warmth` 0 to 1 |
| `marks` | `lid: mark('<id>', '<file>')`, a file of `src/assets/.../marks/<id>/`, named with or without its extension. No such file gives `null`, and the plate then prints the name in house type. `of: 'brand'` or `'name'` (which name it stands for), `plate: 'white'` or `'ink'`, `clear` (clear space as a fraction of the mark's height, or `'own'` when the file carries it) |
| `art` | `artOf('<id>')` reads `plate`, `plate-s`, `hero`, `prop-1..3`, `fore`, `portrait` from `src/assets/.../art/<id>/`. A missing file is `null` and its piece is skipped. Any other picture there: `art('<id>', '<name>')` |
| `alt` | `plate`, `hero`, `portrait`: descriptions for the text version. A portrait's alt names the person and says it is a cut-paper illustration. `person`: the name alone, the caption a tap on the portrait shows (`null`: no caption) |
| `character`, `backdrop` | `kind: 'sprite'` (the hero cut-out) or `'orb3d'`, `floor` (1 to 9, where it stands), `size` in world units. `y` (world height of the wall's bottom edge: lower shows less of the plate's floor), `turn` (radians) |
| `props` | Up to three `{ file, z, x, y, w }`. `file` is a number: 2 is `prop-2`. Depth behind the stack (negative z), x and y of its centre from the stack's foot, width. The low rung draws the first two |
| `fore`, `portrait`, `dust` | `{ z, x, y, w }` for the foreground edge, in front of the stack (positive z). `{ x, y }` on the wall, or `null` when the picture was left out. The colour of the motes as hex (default: the glow) |
| `signature`, `myth`, `catchFloor` | The signature module's name. The myth beat c answers: an `id` from `providers.<id>.misconceptions[]` in `src/data/ai-landscape/2026-11-10.json` (a wrong id fails the build and prints the right ones). The floor (1 to 9) that slides out in beat d |

World units: a floor is 2.4 wide and 0.26 high, a closed stack 2.70 high, an open one 5.22. The stack stands at x = 0 of its
world, the wall 22 behind it. At the open stop the frame is about 12 units wide at the stack.
CSS: Page.astro writes the theme onto `.ail-world[data-world="<id>"]` as `--w-ground`, `--w-ink`, `--w-glass`, `--w-edge` (a
slab's outline on paper), `--w-hatch`, `--w-line`, `--w-scrim` (behind any word over art) and `--w-card`. `--ail-fg`, `--ail-fg-2`
and `--ail-bg` are the words and the ground of the moment: they flip with the chrome and in the dark. Any company's glass is
`--ail-own-<id>`, its rim `--ail-rim-<id>`.

## The four beats (`sections/worlds.js`, the same for all five)

| Beat | Screens | The section does | You may add |
|---|---|---|---|
| a Enter | 0 to 0.6 | Trucks to the stack, opens the iris, shows name, kicker, "Known for" | Nothing |
| b Open | 0.6 to 1.5 | Pulls the stack apart, callouts, doors, hover, push-in | Nothing |
| c Signature | 1.5 to 2.5 | Holds the camera, hides all callouts but `sig.lit`, calls your `update` | The moment |
| d The catch | 2.5 to 3.0 | Slides `catchFloor` out, shows the catch and four flags, shuts the iris | `sig.catch(k)` |

## The words (`data/view.js` builds them, `World.astro` prints them)

| World | `world.items(0)` | `world.items(1)` | `world.catchItems()` |
|---|---|---|---|
| anthropic | The other four companies (note: their connector and skills names, tag: their MCP answer) | Its three empty media sockets, each with its reason | None: the catch is list 1 |
| openai | Its two voice products (the second tagged when its model is not named) | The workers its agent hands work to | The empty video socket and its reason |
| google | The two doors (note: the models each offers, fact: how that door picks one) | The image-method sentence (note: the definition), then the earlier line | Plates: `renamed`, `shut-down`, `stale` |
| meta | Three steps: the doors, the harness sentence, the approval sentence | None | The `locked` flagship (note: its access line) |
| xai | The models it may think with | The coding agents it hands work to | None: the frosted floor is the catch |

Every word a signature shows is already in the page, hidden until you light it: read it from the HTML, never type it.
Each is an `<li>`: its words in `.ail-own`, a quieter second line in `.ail-note`, a state in `.ail-tag`. A fact inside is a
`button.ail-fact` whose `dataset.text` is the claim's full sentence (second depth). A list's heading is the `h3` before it. A
catch item has `dataset.kind` (`empty`, `locked`, `renamed`, `shut-down`, `stale`), its old name in `.ail-catch__was` and, when
stale, `dataset.until`. On a desktop each item waits unseen: `ctx.labels.pin(li, point)` places it and the class `is-on` shows
it. On a phone `is-on` lists it in the sheet and nothing is pinned. A word the page lacks is a gap in the `SIGNATURE` and
`CATCH` tables of `data/view.js`, which the foundation owns: ask for it. A world package never edits `view.js` or `World.astro`.

## A signature (`signatures/xai.js` is the model)

```js
export function create(ctx, world) {   // once, when the world is entered
  return {
    play() {},            // called once by itself when beat c is reached. Never under reduced motion
    still() {},           // reduced motion: set the lit end state, on every visit to beat c. No flight
    step() {},            // reduced motion: walk one stop. The engine never calls it: your own button does
    reset() {},           // back to nothing: leaving beat c, leaving the world
    update(dt, amount) {},// every frame the world is on. amount 0 to 1 is how far beat c is in: scale everything by it
    catch(k) {},          // beat d, k 0 to 1 while the catch floor is out, then once with 0: clear what you showed
    dispose() {},         // remove every mesh, pin and listener you made
    lit: -1, dark: false, // the floor index whose callout stays readable (or -1). true flips chrome and scrims to dark
  };
}
```

`world` is `{ id, cfg, el, tower, inst, data, sec, ui, button(act), items(k), catchItems(), calls() }`: `button('go')` is the
button from `COPY.signature.<id>.go`, and `data` is `ctx.data.p[id]`. Under reduced motion a press of `go` calls your `step()`
and not the flight (xAI: `if (ctx.reduced) sig.step(); else start(false)`). Buttons are the real ones in the page. At most 60
words on screen: a pinned label counts. Things you make are hidden when `amount` is 0.

## What `ctx` holds

| Piece | Use |
|---|---|
| `ctx.data` | The page's JSON: `order`, `layers`, and per company `p[id]`: `stack[9]` of `{ s, g, p }` (state `solid` `hatch` `frost` `dotted` `hollow`, guest owner ids, parts as `[owner, status, official]`), `doors[]` (`id`, `kind`, `stack` or `null`, `m` models as `[owner, status, role]`), `to[]` delegates as `[owner, official, kind, relation]`, `lamps`, `ext` (`mcp`: yes, partial, no or unknown, `skills`: true or false), `media` (three states), `voice` |
| `ctx.row` | `towers[5]`, `tower(id)`, `pick(x, y)`. A tower: `open`, `dim`, `show`, `lift`, `shift`, `point(i, side)`, `anchor(i, side, project)`, `setCells(cells)`, and `floors[i]` with `lit`, `dim`, `slide`, `raise`, `frost`, `guestShow` (set every frame) and `pulse` (set once) |
| `ctx.prims` | Each call returns an object: set its fields, call its `update()` every frame, `dispose()` it at the end. All but `figure` take `{ side }`: 0 draws it anywhere, 1 only inside the open world |
| `cores(tower, i, [[owner, status]], { ghost, ring, radius })` | Spheres circling inside floor i. Fields: `show`, `spin` (radians), `spread`, `night` (halos, 0 to 1), `fade`, and `items[k].active` 0 to 1 (that one glows). `ghost`: seen through frosted glass. `ring`: the circle's radius |
| `sockets(tower, i, [filled])`, `lamps(tower, i, [value])`, `doors(tower, n)`, `gate(tower, i)` | Rings on top of floor i (true seats a disc): `show`, `dark`. Lamps on its front for `'yes'`, `'partial'`, `'no'`, `'unknown'`: `show`, `level`. Door slabs on floor 1: `open` (which one is ajar), `show`. A gate with its bar down: `lift` 0 to 1, `show`, `x` |
| `arc(from, to, { official, lift, color, dots })` | A curved line between two Vector3 it re-reads every update: `draw` 0 to 1, `show`, `dark`. `official` `'yes'` is solid, `'partial'` long dashes, `'no'` short |
| `figure(tower, i, url, { size, at })` | A second figure: the cut-out `url` (`cfg.art.props[0]`, or `art()`) on its own glass ledge beside floor i (`at` -1 left, 1 right), drawn only inside the world. Field: `show`. Leave that picture out of `props` |
| `ctx.thread`, `ctx.labels` | `through(tower, toFloor)`, `at(pointIndex)`, `show`, `dark`, `pos`. `ctx.createThread()` makes another. `pin(el, pointOrFn, { dx, dy, ax, ay })`, `line(kind)`, `project(v3)`, `callouts(tower, list)` |
| `ctx.studio`, `ctx.rig` | The light state: `lamp`, `warmth`, `dark` (the sweep, 0 to 1), `glow { amount, radius, color, pos }`, `roomX`, `setInk(texture, rect)` and `ink` for print on the floor, `casters[5..7]` for extra shadows. The camera: `to(stop)`, `mix(a, b, e)`, `dolly(a, b, time)`, `world(x, 'enter' or 'open')`, `stops`, `yaw`, `pitch`, `push` |
| `ctx.mats`, `ctx.textures`, `owner(id)`, `world(id)` | `glass(owner)`, `core(owner)`, `paper(texture, opts)`. `load(url)`, `title(text)`, `glyphPlane(name)`, `markPlate({ url, name, plate, clear })` for another company's lid (its `world(id).marks`). From `worlds/index.js`: `{ glass, rim, glow, prism }` for a company, `'outside'` or `'you'` (a colour always means its owner), and any company's resolved configuration |
| `ctx.reduced`, `ctx.phone`, `ctx.quality` | No flights. No pins over a stack: words go in the sheet. The rung's `dust`, `props`, `small` |

Immediate mode: every frame the engine resets the towers, the lamp, the camera and the thread, then the active section and its
signature set what they want. Nothing you set lasts a frame unless you set it again.

## Adding a section (the other packages)

`src/components/.../sections/NN-name.astro` renders `<section id data-sec="name" data-screens="1.4" data-rail="Label"
data-land="0.3"><div class="ail-stage">...</div></section>`, importing its own CSS. The entry sizes the section, lists it in the
rail, shows its stage while the clock is inside it, and lands links to `#id` at `data-land` screens in. Words come from `view`
(`data/view.js`: `view.providers`, `view.layers`, `view.data` with every claimRef resolved, `fact()`) and `COPY`, through
`Fact.astro` (a fact with its proof data: a click nobody takes with `preventDefault()` pushes in on its floor), `Stack.astro`,
`Mark.astro` and `Glyph.astro`. A block with `data-beat="a b"` stays hidden until `setBeat(el, 'a')` (`core/dom.js`).
`src/scripts/.../sections/name.js` exports `create(ctx, el, sec)` and returns `{ enter, update(t, dt, u), leave, dispose, stops }`
(`t` 0 to 1, `u` screens in, `stops` the still frames for reduced motion). Start and end at `ctx.rig.stops.row` so neighbours
meet without a jump.

## Checking a world

`npm run build`, `npx astro preview --port 4329`, then `/ai-landscape/?tier=low#<id>`. `?tier=static` is the text version,
`?reduced` is reduced motion. `window.__landscape` has `section`, `world`, `camera`, `frames`, `debug.ctx` (the context above)
and `debug.states('<id>')` (one stack in all five states). Look at 1440 by 900 and 390 by 844, and count the words of every beat.
