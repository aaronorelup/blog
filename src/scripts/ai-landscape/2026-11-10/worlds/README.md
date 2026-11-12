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
| `brandMode` | `'full'`, or `'marks-only'`: glass, glow and line fall back to house greys. Marks, character and art stay |
| `theme` | `chrome` (`'light'` or `'dark'`), `ground`, `ink`, `glass`, `rim`, `glow`, `line` (the 2 px line under the kicker and the iris edge), `prism` (four hex, Google only). Page.astro writes these to CSS as `--w-*` and `--ail-own-<id>` |
| `hour` | `lamp: [x, y, z]` toward the lamp, `warmth` 0 to 1. Negative z puts the lamp behind the stack |
| `marks` | `lid: mark('<id>', '<file name>')`, `of: 'brand'` or `'name'` (which name it stands for), `plate: 'white'` or `'ink'`, `clear` (clear space as a fraction of the mark's height, or `'own'` when the file carries it) |
| `art` | `artOf('<id>')` reads `plate`, `plate-s`, `hero`, `prop-1..3`, `fore`, `portrait` from `src/assets/.../art/<id>/`. A missing file is `null` and its piece is skipped |
| `alt` | `plate`, `hero`, `portrait`: descriptions for the text version. A portrait's alt names the person |
| `character` | `kind: 'sprite'` (the hero cut-out) or `'orb3d'`, `floor` (1 to 9, where it stands), `size` in world units |
| `backdrop` | `y` (world height of the wall's bottom edge: lower shows less of the plate's floor), `turn` (radians) |
| `props` | Up to three `{ file, z, x, y, w }`: which `prop-N`, depth behind the stack (negative z), x and y of its centre from the stack's foot, width. The low rung draws the first two |
| `fore` | `{ z, x, y, w }` for the foreground edge, in front of the stack (positive z) |
| `portrait` | `{ x, y }` on the wall, or `null` when the picture was left out |
| `signature`, `myth`, `catchFloor` | The signature module's name, the id of the myth beat c answers, the floor (1 to 9) that slides out in beat d |

World units: a floor is 2.4 wide and 0.26 high, a closed stack 2.70 high, an open one 5.22. The stack stands at
x = 0 of its world, the wall 22 behind it. At the open stop the frame is about 12 units wide at the stack.

## The four beats (`sections/worlds.js`, the same for all five)

| Beat | Screens | The section does | You may add |
|---|---|---|---|
| a Enter | 0 to 0.6 | Trucks to the stack, opens the iris, shows name, kicker, "Known for" | Nothing |
| b Open | 0.6 to 1.5 | Pulls the stack apart, callouts, doors, hover, push-in | Nothing |
| c Signature | 1.5 to 2.5 | Holds the camera, hides all callouts but `sig.lit`, calls your `update` | The moment |
| d The catch | 2.5 to 3.0 | Slides `catchFloor` out, shows the catch and four flags, shuts the iris | `sig.catch(k)` |

## A signature (`signatures/xai.js` is the model)

```js
export function create(ctx, world) {   // once, when the world is entered
  return {
    play() {},            // called once by itself when beat c is reached. Never under reduced motion
    still() {},           // reduced motion: set the lit end state. No flight
    step() {},            // walk one stop (the button under reduced motion)
    reset() {},           // back to nothing: leaving beat c, leaving the world
    update(dt, amount) {},// every frame the world is on. amount 0 to 1 is how far beat c is in: scale everything by it
    catch(k) {},          // beat d, k 0 to 1 while the catch floor is out
    dispose() {},         // remove every mesh, pin and listener you made
    lit: -1,              // the floor index whose callout stays readable (or -1)
    dark: false,          // true flips the chrome and the scrims to dark (lights out)
  };
}
```

`world` is `{ id, cfg, el, tower, inst, data, sec, ui, button(act), items(k), calls() }`: `button('go')` is the
button from `COPY.signature.<id>.go`, `items(k)` the `<li>` nodes of the k-th list of the text version (pin them
with `ctx.labels.pin` and add the class `is-on` to show one). `data` is `ctx.data.p[id]`.

Rules: read every word from the HTML, never type a name or a number. Buttons are the real ones in the page. At
most 60 words on screen: a pinned label counts. Things you make are hidden when `amount` is 0.

## What `ctx` holds

| Piece | Use |
|---|---|
| `ctx.data` | The page's JSON: `order`, `layers`, and per company `p[id]`: `stack[9]` of `{ s, g, p }` (state `solid` `hatch` `frost` `dotted` `hollow`, guest owner ids, parts as `[owner, status, official]`), `doors[]` (`id`, `kind`, `stack` or `null`, `m` models), `to[]` delegates as `[owner, official, kind, relation]`, `lamps`, `ext`, `media`, `voice` |
| `ctx.row` | `towers[5]`, `tower(id)`, `pick(x, y)`. A tower: `open`, `dim`, `show`, `lift`, `shift`, `point(i, side)`, `anchor(i, side, project)`, `setCells(cells)`, and `floors[i]` with `lit`, `dim`, `slide`, `raise`, `frost`, `guestShow` (set every frame) and `pulse` (set once) |
| `ctx.prims` | `cores(tower, i, [[owner, status]])`, `doors(tower, n)`, `sockets(tower, i, [filled])`, `lamps(tower, i, ['yes', 'partial', 'no', 'unknown'])`, `arc(from, to, { official, lift })`, `gate(tower, i)`. Each returns fields to set, `update()` to call every frame, `dispose()` |
| `ctx.thread` | `through(tower, toFloor)`, `at(pointIndex)`, `show`, `dark`, `pos`. `ctx.createThread()` makes another |
| `ctx.labels` | `pin(el, pointOrFn, { dx, dy, ax, ay })`, `line(kind)`, `project(v3)`, `callouts(tower, list)` |
| `ctx.studio` | The light state: `lamp`, `warmth`, `dark` (the sweep, 0 to 1), `glow { amount, radius, color, pos }`, `roomX`, `setInk(texture, rect)` and `ink` for print on the floor, `casters[5..7]` for extra shadows |
| `ctx.rig` | `to(stop)`, `mix(a, b, e)`, `dolly(a, b, time)`, `world(x, 'enter' or 'open')`, `stops`, `yaw`, `pitch`, `push` |
| `ctx.mats`, `ctx.textures` | `glass(owner)`, `core(owner)`, `paper(texture, opts)`. `load(url)`, `title(text)`, `glyphPlane(name)` |
| `owner(id)` | From `worlds/index.js`: `{ glass, rim, glow, prism }` for a company, `'outside'` or `'you'`. A colour always means its owner |
| `ctx.reduced`, `ctx.phone`, `ctx.quality` | No flights. No pins over a stack: words go in the sheet. The rung's `dust`, `props`, `small` |

Immediate mode: every frame the engine resets the towers, the lamp, the camera and the thread, then the active
section and its signature set what they want. Nothing you set lasts a frame unless you set it again.

## Adding a section (the other packages)

`src/components/.../sections/NN-name.astro` renders `<section id data-sec="name" data-screens="1.4"
data-rail="Label"><div class="ail-stage">...</div></section>`, importing its own CSS. Words come from
`view` (`data/view.js`: `view.providers`, `view.layers`, `view.data` with every claimRef resolved, `fact()`)
and `COPY`. A block with `data-beat="a b"` stays hidden until `setBeat(el, 'a')` (`core/dom.js`).
`src/scripts/.../sections/name.js` exports `create(ctx, el, sec)` and returns
`{ enter, update(t, dt, u), leave, dispose, stops }` (`t` 0 to 1, `u` screens in, `stops` the still frames
for reduced motion). Start and end at `ctx.rig.stops.row` so neighbours meet without a jump.

## Checking a world

`npm run build`, `npx astro preview --port 4329`, then `/ai-landscape/?tier=low#<id>`. `?tier=static` is the
text version, `?reduced` is reduced motion. `window.__landscape` has `section`, `world`, `camera`, `frames`, and
`debug.ctx` (the context above) and `debug.states('<id>')` (one stack in all five states).
Look at 1440 by 900 and 390 by 844. Read the words of every beat and count them.
