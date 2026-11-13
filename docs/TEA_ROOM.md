# The tea room

How the rebuilt tea room works: the look as rules, the code, the tests, and the tools every builder runs. It is
built at `/tea-next/` (`src/pages/tea-next/index.astro`) beside today's `/tea/`, which is untouched until the
swap; the swap moves the page to `/tea/` and this document stays. `docs/TEA_HERO.md` describes today's 3D hero and
is retired with it. The two prototypes this page was chosen from are frozen and live at `/labs/tea-room/a/` (A,
"paper screens") and `/labs/tea-room/b/` (B, "walk through the house"); their notes and generation logs, and the
site's tokens, are in `docs/tea/reference/`.

**Words used here.** A *frame* is what the window shows at one scroll position ("the frame at y = 0.4" is the
page scrolled 40% of the way). One *screen*, written *1 vh*, is one viewport height of scroll. The *world* is the
painted picture fixed behind the page, the *paper* the sheets you read, which scroll over it. A *scene* is one
painted place, made of *flats* (painted layers, each at its own distance) drawn from *plates* (image files); a
*still* is one flat picture of a whole scene. A *slot* is a real element of the page (a picture of the owner's
work, a player, a game) placed on a flat so it sits in the scene. An *opening* is a hole in a flat (a doorway, a
television's glass) with the next scene standing behind it. The *screens* are the two sliding paper screens that
change one chapter's scene for the next. The *stage* is the fixed layers that hold every scene, and the *engine*
the one script that places everything on them. *Live mode* is the page with the engine running; *book mode* the
page with nothing moving.

---

## 1. The look

The page is one evening at a painted tea house, shown as a paper theatre whose camera is the scroll: you walk
through the garden and the door, and each chapter is a room or a corner of the garden, changed for the next by two
sliding paper screens. The rules below merge B's rules (the base) with A's screens; where they disagreed one
ruling stands and the other is gone.

### Two surfaces and one building

**The world.**
- Painted flats in the garden plate's hand (`public/tea/hero/bg-far-night.webp`): flat gouache shapes, one uneven
  dark ink line round every shape, soft shading inside. Indigo, plum, moss and dark wood; lantern amber only where
  light falls.
- A scene is a shadow box of three to six flats at real distances (a back wall or sky, a far flat, the subject,
  one or two near flats), never one flat picture.
- Fixed behind the page. It changes only because the camera moves or the screens slide, and both follow the scroll.
- Depth comes from three things only: how fast a flat grows as the camera nears it, how dark it is (near flats are
  dark silhouettes, softened a little in the file itself), and what overlaps what.
- One light per scene, and the light is the subject. It is painted into the plates, with at most one soft "pool"
  flat that breathes. No second light, rim glow, neon or bloom.
- Nothing read is printed on the world, except each chapter's giant word and its one statement line, in
  lamp-cream, standing in the scene's calm dark. The word is a flat of its own, so nearer flats pass in front of it.
- No figure is painted into the world: no person, animal, robot or character. The owner's work is content and is
  shown as what it is: in a window or on a screen (a picture, a loop or a film on paper, or on the television's
  glass, the cinema cloth, a board, a page); on a turntable (his own models, in the 3D chapter); or, on the Moon
  only, as cut-outs of the lab's machines from his own renders. Anything with its own interface (a game, a lab
  machine) is never seen bare: before a press it is a picture with no interface, after a press it runs in its
  window or in a sheet of paper.
- Nothing walks. Nothing turns in depth except a model on its turntable. No flat fades in place, bounces or spins.
  The camera never sways, shakes, rotates or eases on after the scroll stops. A pointer lean of the near flats
  exists as one switch (`?lean=1`) and is off as built.

**The paper.**
- Washi, warm off-white `#F1E6D0` with long fibres (`public/tea/shared/washi.webp`, a 512 px tile).
- Cut by hand: straight sides a pixel or two uneven, square corners, no border, no rounded corner. A `clip-path`
  set once a sheet, never animated.
- A sheet is nearer the eye than the whole scene: narrower than the frame, the world showing round it, one soft
  shadow down and to the right (10 px, 14 px), a pre-blurred picture under the sheet, never a CSS filter.
- Everything read is on paper: the title slip, the index, the speech bubble, captions, cards, the clock tag,
  labels, Now and About.
- A picture on paper is a window cut in the sheet: the picture a little behind the hole, a thin inner shadow at
  top and left, a lit cut edge at bottom and right. Never a rounded card or a keyline.
- Paper takes a 6% wash of its chapter's light. Ink is near-black plum `#231F2B`. No blur panels, no glass, no grey
  boxes.
- Two sizes: a **sheet** carries reading (at most 720 px wide on a desktop) and stays square; a **slip** (the
  bubble, a card, a tag, a label) may arrive tilted a degree and a half and settle square.
- The footer is not paper: `src/components/tea/TeaFooter.astro` is used unchanged, on the night ground.

**The building.** The house is cedar and paper. Its sliding screens are the only thing that changes one chapter
for the next. Inside a chapter you go further in by pushing the camera into the light until it is the frame (the
door, the television's glass), and the next place really stands behind that opening. No wash of flat colour ever
stands in for a picture.

### Type and colour

| Use | Face | Size | Colour |
|---|---|---|---|
| Giant word (on the world) | Zen Maru Gothic 700, line-height 0.9, tracking -0.025em | `clamp(56px, 11vw, 184px)`; `15vw` on an upright screen | lamp-cream `#F6E7C8` |
| Statement under it | Georgia italic, at most 34 characters a line | `clamp(17px, 1.75vw, 27px)` | `#E9DCC3` |
| Title on paper | Zen Maru Gothic 700 | 22 to 40 px | ink |
| A line on paper | Georgia | 16 to 19 px (never under 16 on a phone) | ink at 82% |
| Label, index, link | Karla 600; labels uppercase, tracking 0.14em | 11.5 to 13 px | ink at 62% |
| Clock, ids, counts | JetBrains Mono 500 | 12 px; the clock up to 34 px | ink |

A long chapter name is stacked, never shrunk (the small words ride as a first line at a fifth of the size). From
1680 px wide, paper and its type grow by a quarter. Titles are balanced, and a link's arrow is tied to its last
word. The three Latin files are preloaded. A glyph the live site does not already use fails the font check: draw
decorative marks as pictures.

Night ground `rgb(16, 18, 32)`; lamp-cream `#F6E7C8`; paper `#F1E6D0`; ink `#231F2B`; lantern amber `#FFD892`
(light only, never text). **The one accent is the door curtain's vermilion, `#B5482E`**, in exactly four places:
the underline and arrow of an item's one link and one button, the current chapter's mark in the index, the clock at
20:00, and the 2 px focus ring on paper (on the world the ring is lamp-cream). Each chapter has one light colour,
which lights its scene, tints its paper and lights the screens that open on it. Four places leave the night palette
(the morning desk, the dawn garden, what is outside the veranda in Games, the Moon), in the same hand: the house
frames the other place, shadows stay indigo and plum, and nothing is more saturated than the garden's blossom.

The page is one evening: night from the garden to Now, morning in Learning, the garden at dawn in About. The time
of day belongs to the chapter; the site's day and night switch is not shown here.

### Motion

The scroll position and the time drive the page. The pointer is a third input for the Film chapter and, if the
lean is turned on, for the near flats. Nothing else is an input.

| Thing | Driven by | Moves like | Never |
|---|---|---|---|
| Camera | scroll | one slow push along one line toward the scene's light | sideways, rotating, shaking, easing after the scroll stops |
| Flat | scroll | slides straight in its own plane to a wing, eased at both ends, nearest leaving first | fades in place, bounces, spins |
| Screens | scroll | slide on their track at an even pace, eased at the ends | fade, bounce |
| Paper | scroll | rises with the page; a slip settles its last 34 px and 1.5 degrees | springs, flips, grows from nothing |
| Clock (television) | scroll | steps a minute at a time | spins freely |
| Petal, firefly, dust | time | a few, on a slow seeded sine | sparkles, storms |
| Lantern | time | breathes within 6% over about five seconds | pulses |
| Television | time | its light steps unevenly about eight times a second | scan lines, glitch, noise |
| Loop | time | plays muted in view, pauses out of view | sound unasked |
| Model (3D only) | time | turns slowly | tumbles |

Scroll is native: no smooth-scroll library, no wheel capture, no snapping. Nothing eases toward a target over
time; every value is computed from the scroll position. One easing for the few timed things (the index, a
button): `cubic-bezier(.4, 0, .2, 1)`. No CSS transition or animation runs inside the stage.

### The screens

Two shoji screens, each 52% of the frame wide, framed 16% taller than the frame, one painted plate
(`public/tea/shared/screen.webp`, `screen-p.webp` upright) whose paper is partly see-through over a flat field of
the **next** chapter's light. They stand in front of the whole world and behind paper. Measured from the boundary
(where the next section begins): from -0.5 to -0.1 vh they slide in, from -0.1 to +0.1 they are shut (at 0 the
scene changes behind them), from +0.1 to +0.5 they slide apart. A chapter's last 0.6 vh holds no paper (the tail)
and its first paper begins at 1.2 vh at the earliest (the head; 1.0 for the chapter entered through the door).

On the screens stands the shadow of the object the coming chapter is built round, exactly where that object stands
in its opening frame (computed by the scene's own projection), drawn on both screens so that each wipes its own
half away and uncovers the real object in place. Every shadow fades to nothing at its edges. The shadow belongs to
the next **visible** chapter. The first change is the house's own: you walk through the door, and the wall panels
beside it slide apart. The last change is the house closing: after the last chapter's paper the screens shut once
more on the night ground, with no shadow, and the footer rises over them; so whichever chapter is last is one
screen longer (a tail of 1.6 vh).

### 20:00, and the phone, and book mode

**20:00.** In the television chapter a clock tag runs from 19:40 a minute at a time. At 20:00 it turns vermilion,
the dial goes out, and the picture on the glass is the garden with the little television in it. The camera pushes
through that glass into a second garden, then a third, each stranger, and through the third set's glass lands on
the Moon, where the chapter's machines stand. Each garden is a scene and each glass an opening, so the next garden
really stands behind the glass, and a scene is changed for the one behind only when the opening covers the frame.
The fall never ends in the dark.

**The phone has its own design.** No frame leaves its lower 40% dark or empty. Each chapter fills the phone its
own way and names its layout (`p.layout` in its scene data); no two neighbours use the same one, and
`tea-scenes.test` warns when they do. Scenes are composed for an upright frame, from an upright plate made from the
desktop plate where the wide one does not survive the crop. One item to a screen. The index is a tab at the top
left, the clock tag at the top right. Nothing needs hover. The address bar shrinking is not a resize. Checked at
390x844, 430x932 and 844x390.

**Book mode** is the page with reduced motion, Save-Data, a 2g connection, `?book=1`, or no script. It is a
complete picture book: no stage, camera, screens or petals; each chapter a section as tall as its content, its
still as its background, its word and statement at the top, its paper in normal flow; a plain cut between
chapters. No loop plays (each shows its first frame and a play button), no 3D loads before a press. Every link,
alt text and word is the same as in live mode.

### The reference, the bar, and looks to avoid

The page takes its **structure** from Shopify Editions Winter '26: one world fixed behind the page, chapters that
each open on a giant word and one statement, pale paper for reading, one scroll coordinate in viewport heights
driving everything, a chapter index at the left, each chapter showing its content its own way. Not its paintings,
3D figures, shaders, bloom, eased scrolling, video-heavy cards or weight.

**The bar.** Frozen at any scroll position, on a desktop and on a phone, a frame is good enough only if:
1. it is a picture: one lit subject, at least three flats of depth, nothing cut off by its own edge, no flat dark
   area larger than a quarter of the frame, and on a phone nothing empty in the lower 40%;
2. it is sharp: no picture drawn past the limit below;
3. it can be read at a glance: at most one sheet being read plus small slips, no text clipped, covered by the index,
   or lying on the subject or the light;
4. it is not the frame before: one screen on, the picture has changed in a way you can name;
5. it holds beside the garden plate and the reference frames at the same size;
6. you would keep scrolling with the text hidden.

Items 1 to 3 are checked by scripts (the sweep, `tea-scenes.test`, the index test). Item 4 is checked by a number
(`differ.mjs`, below) and, with items 5 and 6, by a reviewer who did not build the frame, from a reel
(`reel.mjs`), and by the owner on his own laptop and phone at `/tea-next/?words=0`.

**Avoid**: a blog list in costume (a grid or column of thumbnail cards); rounded cards, shadow tiles, glass, blur,
gradients, anything that reads as a dashboard; flat colour where a picture should be; an empty dark frame; a
photographic 3D render as scenery or a model lit from where the room is not; an interface seen bare; soft
pictures; neon, glow, bloom, flare, sparkles; scan lines, colour splits, glitch, station graphics; things that
spring, bounce, pop or fade in one after another; a world that swims with the mouse; carousels; the same layout in
two chapters running; generated people, animals or characters; lettering in a generated picture; decorative kanji;
emoji, exclamation marks, filler, anything untrue. And the faults B was known for: the television as a 3D render in
a painted room, the picture softest where the camera goes closest, dead dark frames (B's desktop at y 0.82 to 0.86,
and a phone's lower half dark for the whole television chapter), a page that scrolled sideways, an index that
covered text, and a flat dark slide between chapters.

---

## 2. The code

### Where things are

Everything new has `room` in its path, and nothing of today's page is edited before the swap. The page:
`src/pages/tea-next/index.astro`, `src/layouts/TeaRoomPage.astro` (the head script that picks the mode, the CSS,
the engine entry), `src/components/tea/room/` (`RoomStage`, `RoomScene`, `RoomScreens`, `RoomChapter`,
`RoomPaper`, `RoomWindow`, `RoomLink`, `RoomButton`, `RoomSlot`, `RoomLoop`, `RoomEmbed`, `RoomIndex`, and
`chapters/<Id>.astro`, one a chapter), `src/styles/tea/room/` (`room.css` the entry, `stage`, `paper`, `type`,
`index`, `book`, `embed`, `foot` (today's footer rules, copied), `chapters/<id>.css`), `src/scripts/tea/room/`
(the engine, `media.js`, `chapters/<id>.js`). Data: `src/data/tea.js` (`COPY.room`, which imports every chapter's
copy), `src/data/tea/embeds.js` (every playable thing and the chapter that plays it), and per chapter
`src/data/tea/<id>/copy.js`, `scene.js`, `art.js`. `src/lib/tea-scene.js` and `tea-scene-check.js` read every
scene at build time. Pictures: `public/tea/shared/` (washi, the screen plates, the sheet shadow, the television),
`public/tea/key/` (the house sheet and key frames), `public/tea/scenes/<id>/`, `public/media/tea/<id>/` (posters in
git, clips in R2).

**A chapter builder writes only in its own places**: `src/components/tea/room/chapters/<Id>.astro` and
`chapters/<id>/**`, `src/data/tea/<id>/**`, `src/styles/tea/room/chapters/<id>.css`,
`src/scripts/tea/room/chapters/<id>.js` and `<id>/**`, `public/tea/scenes/<id>/**`, `public/media/tea/<id>/**`,
`scripts/tools/tea/<id>/**`, `tests/unit/tea-<id>.test.mjs` (the hero's is `tests/unit/tea-room-hero.test.mjs`:
`tea-hero.test.mjs` is today's page's, and `tea-today.test.mjs` holds every file of today's page to its bytes),
`tests/e2e/tea/<id>.spec.mjs`, `tests/e2e/inventory/tea-<id>.md`, `docs/tea/rounds/<id>.md`, `docs/tea/gen/<id>.md`. Every line a chapter needs in
a shared file is already written. The one shared file many write is `src/data/media-manifest.json`, and only by
`npm run media:push`.

**Rules that shape the tree** (checked by `npm run check`, `npm test` or the build): at most 400 lines a source
file; no `style=` in `.astro`; no CSS import from browser JavaScript; all copy under `src/data/` and obeying the
copy rules (no em dash, spaced en dash, semicolon, exclamation mark, curly quote or banned phrase); no video or
audio under `public/` when the build runs, no file over 25 MiB; never import `three` statically or fetch it or a
`.glb` at load; never set `overflow` on `html`, `body`, `.tea-frame` or `.tea-main`; never touch the live notebook
(`src/content/posts/teardown-lab.md`, `public/media/teardown-lab/`, `public/labs/teardown/`), the courses' files or
the lore files, and every check of this page asks `isLivePath()` and at most warns about them; no draft or
unlisted post anywhere; `TEA_SEO` stays `'pending'`; `/tea-next/` carries `noindex`, is in no sitemap and is linked
from nowhere. The frozen copies (`public/labs/tea-room/**`, `public/tea-lab/`) are never edited.

**The picks.** `src/data/tea-picks.json` (written only by `npm run tea:picks`) holds the chapter order, hidden
chapters and each shelf's items; `teaChapters()` (`src/lib/tea-room.js`) is the only way a post reaches the page.
The hero is always first (the layout fails the build otherwise); apart from that no chapter assumes its
neighbours. A chapter looks right with one item and with its shelf's maximum; an empty shelf hides its part.

### Two modes, lengths, anchors

The head script sets `data-room="live"` on `<html>` unless reduced motion, Save-Data, 2g or `?book=1`; absent
means book mode, and all CSS is written book mode first. In live mode the stage is two fixed layers (back and
front) that clip themselves, take no pointer and are `aria-hidden`; the document is a column of sections, one per
visible chapter, with paper in normal flow, so Tab order, anchors and find-in-page are the document's own. A
section never gets a transform, opacity, filter or `z-index`.

A chapter's scroll length is `base + per x n` screens, `n` the items the picks give it (`data-n`, `data-n-p` on
the section; `lengths.js`), so the page's height is final before the first layout and nothing jumps. The section
carries `data-room-chapter="<id>"`; its `dom` id is on a zero-size anchor 0.5 vh in (at the top for the hero and
for the chapter entered through the door), so a jump lands on the chapter's opening frame. The first topic chapter
also carries `id="ledger"` for old links. All lengths are in `lvh`; the engine takes its viewport height from a
`100lvh` element, so the address bar is not a resize. The page cannot scroll sideways because nothing in the flow
is wider than the frame and everything that moves is in a stage layer or a fixed slot.

The stacking order, back to front: the night ground; the back stage (`z-index` 1, flats); slot elements (2, real
elements, fixed in live mode); the front stage (3, near flats that pass in front of a slot, then the screens);
paper (4); the footer's wrapper (5); the index (6); a sheet opened by an embed (the top layer).

### A chapter as data

Its scenes in `scene.js` (plain data, board units: 1600x900 for the desktop composition `d`, 900x1600 for the
phone's `p`), its paper in its component, its words in `copy.js`, its set piece in `chapters/<id>.js`. A scene has
a light, a shadow object, a still, and for each composition an aim (its light), flats back to front (`box` in
board units, `r` its distance: the back plate is 1, nearer is smaller, `src` and `px`, or `text` for the word),
slots, camera keys, tracks (slides, lifts, opacity, wipes) and `rest` (what a set piece's elements hold when it is
not running). A chapter with a run of scenes exports `scenes` and `run`. `src/lib/tea-scene.js` checks the whole shape
and compiles it into one JSON block in the page.

**The camera** is a pinhole pushing along one line toward the aim. When it has pushed by `m`, a flat at distance
`r` is drawn `r / (r - m)` times its rest size, about the aim. **Marks** tie the world to the paper: any paper
element may carry `data-room-mark`, and a key may name a mark instead of a number (and `each: 'ep'` stands for the
marks `ep-1` to `ep-n`). Two named pushes: `m: 'through'` (the opening just covers the window) and
`m: 'fit:<slot>'` (as far as the slot's picture allows at 1.25). A track holds its first value before its first
key and its last after its last.

**An opening** (`through: { to, hole, at }` on a flat): `to` names the next scene of the run (the hero's door
says `'next'`, the next visible chapter's first scene), `hole` is its box on the flat (or `'open'` where the flats
in front are the mask), and `at` is the distance the scene behind stands at (always further than the flat). The
scene behind is drawn in a **port**, held at its opening frame and sized so it is exactly the frame when the hole
covers the window; the handover happens at that push, so it is no change at all. Openings are drawn two deep and
no deeper. No slot is on at a scene's first frame. The build checks every opening at 17 window sizes.

**A slot** names a box on a flat; the element carrying `data-room-slot` is placed over it every frame by the same
projection and is in normal flow in book mode (one copy, never two). Off is a written value (opacity 0, no
pointer, `data-off`). **The one button** (`RoomButton`) is a paper slip at least 44 px tall that says what it does
and what it costs above 5 MB. **The embed** (`RoomEmbed` with a key from `embeds.js`): a poster and one button
before a press, nothing fetched; on a press an `<ao-game>` loaded at once or a `<video controls>`, in its window
or in a `<dialog>` sheet (every lab machine); one thing runs at a time.

### Sharpness

No plate and no picture is drawn at more than **1.25 CSS pixels per pixel of its own**, checked for `d` at
1920x1080 and 2560x1440 and for `p` at 430x932; a phone plate also keeps at least 1.6 of its pixels per CSS pixel
at rest. Plates are ours to make, so each is written in two widths (`plates.mjs`): the smaller for windows up to
1920 CSS px at one device pixel, the larger for anything wider or denser, both in the flat's `srcset`. The owner's
pictures cannot be made larger, so the picture sets the size (`fit:`); nothing is stretched to hide a bezel. **The
near-third rule**: whatever the camera travels to stands at `r` 0.35 or less, and a back plate never grows past 1.5
times its rest size. The walk to the door is a chain of three whole-view plates handed over by a dissolve of at
most 0.25 vh while the outgoing one is still sharp, and its last steps are the house's panels sliding apart.
Full-frame plates carry 4% spare on every side. A post's 640 px preview still is never used wider than 512 px; a
picture is sized to its pixels (1280 px up to 1600 CSS px wide); every content picture has a phone copy, and none
of the owner's pictures is re-compressed to meet a byte target.

Generated pictures are scenery only (rooms, corners of the garden, objects, backdrops), with no figure and no
lettering, made on Higgsfield with the garden plate as the style reference and the house sheet
(`docs/tea/house.md`) cited, at most eight tries a plate, every request logged in `docs/tea/gen/<id>.md`. The
owner's work is never generated. Cutting out, filling in and upscaling his pictures each need his yes. An item
with no entry in its chapter's `art.js` is shown in the chapter's plain form, and `npm run check` (the `tea-art`
rule) names it.

### The engine: one pure function of scroll

`src/scripts/tea/room/engine/`. `frame(y, t, ptr, L)` (`frame.js`, pure: no DOM, no globals, no memory) works out
the whole frame from the scroll position, the time, the pointer and the layout. `apply.js` is the only code that
writes it, and it writes only five kinds of thing: each scene's two groups (hidden or not), the flats and ports of
the scene that is on, every slot (on or off), every element a set piece drives (its values, or its `rest`), and
the screens, shadow, ambient canvas and the index's mark. Exactly one scene is on at any position, and both groups
of every other scene are hidden on every frame. Every value is written every frame, on or off. A set piece is
asked for its values whenever its section is within a screen; further away it holds `rest`. No CSS transition,
animation, IntersectionObserver or "already seen" flag acts on any of it. Loading changes which picture an
element holds, never where it is or whether it is shown: until a scene's plates have decoded, its still stands
under them.

`clock()` is the time, or 12.4 with `?still=1` or reduced motion; `pointer()` is `[0, 0]` until a mouse moves and
always on touch, `?still=1` and reduced motion. **Hooks kept in the shipped page**: `?y=<share>` (after the first
measurement), `?still=1`, `?book=1`, `?meter=1` (the frame-rate meter; `&from=` and `&to=` give a stretch, a share
or a chapter id), `?words=0` (every word hidden, for the bar), `?lean=1`, `?gl=0` (the 3D chapter on its
posters), and `window.__room.settled()` and `.state()` (the frame as written, read back from the DOM, rounded to a
hundredth of a pixel).

**The index**: from 1024 px wide a bookmark at the left (56 px closed, 232 px open on hover or focus, by CSS
alone), with paper laid out right of a 96 px gutter so it never covers text; under 1024 px a tab at the top left
that opens a `<details>` sheet of every chapter. Numerals I, II, III in page order; the hero has none.

### Loading, weight and frame rate

Pictures come at their best first and weight is worked on later: laziness is a limit from the first day, bytes are targets until the
whole-page pass turns what the page really weighs into limits. **Limits now**: the first paint fetches only the
HTML, CSS, the engine, three font files and the hero's first plates and television, and straight after it the
walk's closer plates and the room behind the door; a scene's pictures load within one and a half chapters of it
and are given back beyond two; nothing of a film, game, machine or model before its press, no `three` or `.glb`
before the 3D chapter; no picture over 4096 px on its long side.

| Target (gzip for text) | |
|---|---|
| First paint | 800 KB (HTML 40, CSS 14, engine 14, fonts 67, plates and television 600) |
| Straight after it | 700 KB more |
| A scene's plates and still | 900 KB desktop at the smaller width (a still at most 250 KB), 600 KB phone |
| A chapter's content pictures | whatever they weigh at their own quality: reported |
| A loop | 1.2 MB in a window 960 px wide or more, 300 KB in a small card; at most eight on the page, three playing |
| The whole page, top to bottom | 26 MB desktop, 15 MB phone |

A clip is cut to its target with `ffmpeg` into `public/media/tea/<id>/`, pushed to R2 with
`npm run media:push -- --keep`, and the manifest is never hand-merged (`docs/MEDIA.md`). `media.js` alone decides
what plays: loops (no `autoplay`) play in view and never in book mode, with `?still=1` or while a film or embed
runs, and are hidden from the site's `player.js` by a capturing `play` listener.

Only `transform` and `opacity` change on the stage: no filter, blend mode, backdrop blur or mask on anything that
moves; at most eight flats moving at once and three larger than the frame; a fully covered flat is hidden. **Frame
rate is measured two ways.** On the owner's hardware, `/tea-next/?meter=1` is the gate: a median of 60 and no
second under 50 on a laptop, at least 50 on a phone. On an agent's machine, `fps.mjs` is a tripwire only (below).

---

## 3. The tools

`scripts/tools/tea/`. Each takes `--help`, exits 0 when its check passed, 1 when it failed, 2 when it could not
run, and prints lines a builder can paste. An address is a path on the last build (default `/tea-next/`; the
looks are `/labs/tea-room/a/` and `/labs/tea-room/b/`, which take `?y=<0..1>&still=1`) or a whole URL. For a path
the tools use `TEA_BASE` if it is set, else a server already on this checkout's own tools port, else they start
`astro preview` themselves and stop it at the end. A place is a share of the page (`0.37`), a chapter's opening
frame (`tv`), a point into its section (`tv+1.5`, in vh) or its last frame (`tv:end`). Pictures go to
`captures/tea/<tool>/` (ignored by git). Each tool opens Chromium: run one at a time.

| Tool | What it does |
|---|---|
| `frames.mjs [address] --at <places> --sizes 1440x900,390x844 [--words 0] [--sheet]` | stills, each loaded directly at `?y=&still=1`; a contact sheet a size |
| `frames.mjs [address] --weigh [--from] [--to]` | the bytes fetched at first paint, straight after, and over a scroll, by chapter and kind, beside the targets (text as gzip) |
| `sweep.mjs [address] [--phone] [--n 240] [--from] [--to]` | the empty-frame sweep (below); exit 1 on a dead frame |
| `differ.mjs [address]`, `differ.mjs a.png b.png` | not the frame before (below); exit 1 on a pair too alike |
| `reel.mjs --chapter <id>` | frames every 0.25 vh with `?still=1&words=0` at 1440x900 and 390x844, one numbered strip a size, for the reviewer |
| `fps.mjs [address] --from <place> --to <place>` | three runs of the stretch and three of look B, taking turns, at both sizes; medians, ratio, worst second; exit 1 under 0.8 of B |
| `plates.mjs <master> --out <path> [--kind picture] [--phone]` | a plate in two widths (`<out>.webp`, `<out>-l.webp`) and its `srcset`; a phone plate (`-p`); a content picture's phone copy; tiles past 4096 px |
| `length.mjs [--built]` | each chapter's length in screens on a desktop and a phone, the totals, and the play and watch buttons |

**fps.mjs on an agent's machine.** Agent machines have no graphics card, so Chromium draws in software: the
number measures the machine as much as the page, and the worst second is noise. It is a tripwire for a change that
makes the page much slower. The rule: three runs of your stretch and three of look B in the same session; if your
median is under 0.8 of B's, find out why before you land. The room is measured by its own meter (`?meter=1`), and
B by the meter's same `scrollRun()` and `meterStats()`, so one piece of code measures both.

**length.mjs** reads the picks and each chapter's scene data through the same function as the `tea-art` rule's
note. The buttons are counted by one rule a chapter (`BUTTONS`): the television's one machine button, one for each
film, a game's where `embeds.js` plays it in Games, Projects' play and watch shelves. A chapter's `scene.js` may
export `buttons(shelves, { embeds, onPage })` to count its own. `--built` also counts the `room-button`s on the
last build's page.

### Calibration

The floors of the sweep and of `differ.mjs` are measured, not guessed. They were set by running the tools on
looks A and B on 2026-11-13 (both looks loaded at `?y=<share>&still=1`, one page load a frame, at 1440x900 and
390x844 in Chromium; B is 20.6 screens long on a desktop and 20.4 on a phone, A 20.5 and 19.8, so 0.01 of either
page is about 0.2 vh). The frames they were measured on are kept in `tests/unit/fixtures/tea/sweep/` and
`tests/unit/fixtures/tea/differ/`, and `tests/unit/tea-sweep.test.mjs` and `tea-calibration.test.mjs` hold the
floors to them.

**The sweep** (`sweep.mjs`, the frame read at 96 px wide, luminance of 255):

| Floor | Value | Measured |
|---|---|---|
| bright: share of the frame brighter than 40 | at least 0.30 | B's dead stretch on a desktop, y 0.82 to 0.85: 0.21, 0.12, 0.10, 0.15. Its dark but good frames 0.58 and 0.66: 0.39 and 0.50 |
| band: a quarter-height band, mean under 30 and spread under 8, is dead | | the darkest band of B's good desktop frames has a spread of 20 or more; B's phone television chapter has a lower 40% of mean 13.1 and spread 1.5 |
| region: the largest dark flat area (6 px cells of the copy, joined edge to edge) | at most 0.49 of the frame | B at 0.86 (the film garden sliding in at the right of the dark): 0.54. B's dark good frames 0.56 to 0.69 (night sky over the city, the clock's dial): 0.30 to 0.44 |
| lower (phone): share of the lower 40% that is dark and flat, paper or none | at most 0.20 | B's television chapter from 0.40 to 0.84: 0.29 to 1.00, including 0.48, 0.52 and 0.62, where an episode's card lies across the dark (0.43, 0.36, 0.29). Every other B phone frame: 0.11 or less |
| rows (phone): share of the lower 40%'s rows dark and flat | at most 0.5 | the page builder's first floor, kept |

So B fails from 0.82 to 0.86 on a desktop and from 0.40 to 0.84 on a phone (its whole television chapter after
the lit room), and passes everywhere else, its night frames included. A passes on a desktop, and fails at one
phone frame (0.50). The bar's own words ask for no dark flat area over a quarter of the frame; on this measure
B's night skies, which the brief names as good pictures, are 0.30 to 0.44, so the floor sits half way between them and the
first dead frame at 0.54 (0.49), and the reviewer judges the rest.

**differ** (`differ.mjs`, with every word hidden: `?words=0` on the room, a style that makes every glyph
transparent on the looks; a 16 x 9 grid, 9 x 16 on a phone, each cell its mean colour):

| Floor | Value | Measured |
|---|---|---|
| cell: a cell has changed when its colour moved this far (RGB distance of 441) | 24 | not measured: borrowed from the purity test's allowance for one channel |
| dark: a cell darker than this (luminance of 255) in both frames never counts as changed | 40 | not measured: borrowed from the sweep's brightness line. It adds margin, not a verdict: without it the slide's pairs below measure 26%, 17% and 22% (still under the floor) and 0.82 / 0.85 31%. It costs B's night steps (0.51 to 0.70 on a desktop) up to 20 points, and the lowest of them stays at 55% |
| cells: share of cells changed, for frames a step apart and for two chapters | at least 0.30 | must pass, neighbouring chapters' opening frames: B start 0.16 against television 0.36, 72% (phone 0.18 / 0.37: 88%); A 0.2 against 0.5, 69% (phone 77%). Must fail, one held picture 0.1 vh apart: B 0.16 8 to 10%, B 0.36 0%, B phone 0.37 0%, A 0.46 0% (and phone 0%). Must fail, B's flat dark slide between the television and film: 0.82 / 0.84 17%, 0.83 / 0.85 13%, phone 0.82 / 0.83 15 to 17% |
| mean: two chapters' opening frames, distance between their mean colours | at least 7 | half the smallest distance measured between neighbouring chapters in A and B (A desktop 0.15 against 0.45: 14.0; the others 20 to 77) |

For scale, B's own steps one screen apart on a desktop run from 0% to 96% of cells: its held title of the
television chapter (0.32 to 0.37, 0%), its held first episode (0.42 to 0.47, 21%) and its held film title (0.91
to 0.96, 13%) fail, which is the fault the bar names. Within its dark stretch B's frames are less than a screen
apart, so a step across it compares a lit frame with a dark one and passes: the sweep is what catches the stretch
itself, and differ the slide's frames compared with each other.

**What differ cannot tell.** Paper is kept with the words hidden, so a sheet moving over a held picture counts as
change: pairs of B and A only 0.1 vh apart with a sheet in the frame measured 30% to 72%. A held picture under
moving paper passes a step; the reviewer's reel is what catches it.

**Run on the stub page** (the shared system's stubs, before any chapter is built, 2026-11-13). The sweep: 236 of
240 desktop frames are pictures and 4 are the house closing or the footer; on a phone 195 of 200, 4 not judged,
and one dead: y = 0.98, the house closing half way shut, whose dark panes fill 23% of the lower 40% (the spec
judges a closing frame unless the screens are fully shut; its own phone run, at the iPhone 13's 390x664,
passes all its frames). differ: 92 pairs too alike (59 of 84 on a desktop, 33 on
a phone). Inside every stub chapter the frame holds, and the stub rooms are one placeholder room in different
lights, so of the chapters' opening frames only start to television and agents to learning pass (and courses to
now on a phone). That is what the stubs are; each chapter's builder makes its own pass.

---

## 4. Tests

Until the swap, today's `tests/e2e/tea.spec.mjs`, `tea-hero.spec.mjs`, `tests/unit/tea.test.mjs` and
`tea-hero.test.mjs` run against `/tea/` untouched. The new page's tests open the one address in
`tests/e2e/tea/base.mjs`, which the swap changes. Three rules for every new test: the live notebook never fails a
tea test (ask `isLivePath()`, warn); a picture is checked only if it is rendered (displayed and within a screen;
book-mode stills are never fetched in live mode); media comes from the live site, so a loop must be in R2 before
its test can pass.

**Rewritten for the new page** (`tests/e2e/tea-next.spec.mjs`, renamed `tea.spec.mjs` at the swap): the sections
are exactly `teaChapters()` in order, each with its anchor, its `h2` and one statement, listed with the same
numerals in the hero slip, the bookmark and the tab; each chapter shows exactly its shelves' rows with one link
each and one closing link; Projects shows the picked projects, Now and About match their pages word for word,
Courses its two courses; the index marks the chapter whose section holds the scroll position; without script the
page is book mode with everything visible; one `h1`, each chapter's first heading its real `h2`, focus visible and
in the frame at nine Tab stops; under 1024 px the tab names the chapter whole and its sheet lists and closes; an
address with a chapter lands on its opening frame in one step and `#ledger` on the first topic chapter; no console
error, no sideways scroll, every rendered picture near the frame decoded, at both sizes and both modes.

**New**: purity (`tea-engine.spec.mjs`: a frame is the same loaded directly, flicked to from the top and from the
bottom, and after real wheel turns, in state exactly and in pixels within 0.001 of the frame, at spots inside every
screens change, every opening and every handover, desktop and phone); the empty-frame sweep; not the frame before;
nothing sideways; head and tail of every chapter at both sizes, and the screens shut when the footer enters; no
layout shift; reduced motion and Save-Data are book mode with nothing playing or loading; the index covers no text;
one thing plays at a time; one button an embed; the footer's computed styles equal `/tea/`'s until the swap; the
weight of the first paint and each chapter; the 3D chapter stays lazy; each chapter's acceptance list
(`tests/e2e/tea/<id>.spec.mjs`); the engine alone (`tests/unit/tea-engine.test.mjs`: deterministic, one scene on,
no missing value, off slots off, far chapters at `rest`, seamless handovers, tracks hold their ends, screens shut
at every boundary); the scenes (`tests/unit/tea-scenes.test.mjs`: sharpness at the three sizes, cover at 17 sizes,
every opening, every shadow and mark, any picks, the hero first, neighbours' phone layouts); each set piece
(`tests/unit/tea-<id>.test.mjs`); the tools and their floors (`tea-tools.test.mjs`, `tea-sweep.test.mjs`,
`tea-calibration.test.mjs`); and, turned on at the swap, every chapter's copy and every kept picture approved.

**Unchanged**: every link and picture resolves (warning for the live notebook); no draft or unlisted post anywhere;
`TEA_SEO` `'pending'`; the main site reaches the tea room and it leads back; nothing names `/tea-lab/`, and nothing
links or names `/tea-next/`; the copy test; the picks' tests; every code rule, the font check, the media guard, the
never-publish scan, the post page's and homepage's budgets, and the frozen contracts.

**The swap** is one small commit (the page moves to `/tea/`, the staging prop and `/tea-next/` go, the tests'
address changes, today's two e2e specs are replaced and deleted), so one `git revert` puts the old page back. The
old page's files are removed in a later commit, after the new page has been live and right for a day.
