# The shared art: what each file is, how to draw it, and how it was made

Everything in `public/tea/shared/`. This file is the usage sheet for the builders of the page, the record of the
painter's rounds, and the log of every generation request, kept or rejected (the last section).

**What waits for the owner.** The three television pictures are not approved. Nothing may be built on them as
final until he has seen them beside the model's render and the garden plate and said yes in his own words. His
answer is recorded in the log's table.

## Changed since the first version (commit `d5f4efdb`)

The seven file names are the same, and one file is new. A builder who read the first version of this page
needs only this list.

- `tv-face-p.webp` is a different picture and a different size: the front set itself, not a re-laid upright
  set, framed on a 2304 x 4096 canvas (it was 1536 x 2752). Its geometry is all new: the table in its section,
  and the two poses for a phone under it.
- `tv-face.webp` is 3602 x 3330 (it was 2752 x 2476): the same picture at its master's full size, with its
  plinth lengthened to the model's height. Every number of its geometry is new: the table in its section.
- `tv.webp`: the same size and the same glass box. The glass's corners moved by a few px. It now has the
  garden's night painted into it, and a heavier ink line.
- All three sets have new colours (the table in the television's section) and no wood grain.
- `screen.webp`: the same size and the same geometry. Its paper is thinner (alpha 0.09 beside the post, not
  0.2), so the field's colour comes through clean, and the pale pixels along its ink lines are gone.
- **`screen-p.webp` is new**: the screen for an upright frame (a phone). One `<picture>` chooses between the
  two plates, and the CSS is the same (the screen's section).
- `shadow-example.webp`: the same size and box, a new picture. The recipe changed: a shadow only darkens.
  A chapter's own `shadow.mjs` should be copied again from this page.
- `washi.webp` is 1024 px, not 512. It is still drawn as a 512 px tile: the CSS on this page already says so.
- `sheet-shadow.webp`: the same size and the same nine-slice. Plum, not blue-black, and a little lighter.

## What a `4k` generation is worth (measured, 2026-11-12)

The same prompt (the screen plate, below as S1 and S2) was sent twice to Higgsfield `generate_image`, with the image model the
brief names, aspect 4:5, once at `4k` and once at `2k`, with the same two references. **Size:** `2k`
returned 1856 x 2304 and `4k` returned 3712 x 4608, exactly twice each way (so 16:9 is 2752 x 1536 at `2k` and
5504 x 3072 at `4k`; 1:1 at `4k` measured 4096 x 4096). **Cost:** 2 credits at `2k`, 4 credits at `4k` (the
balance went from 530.37 to 524.37 for the pair). **Sharpness**, as the width in pixels over which an ink line's
edge goes from 10% to 90% of its step (median over every strong edge on rows and columns 7 px apart; the tool is
`edges.py` in the painter's working folder): the garden plate 1.54 to 1.60 px, the `2k` result 1.50 px, the `4k`
result 2.04 px (quartiles 1.87 and 2.14), and the `2k` result enlarged twice by Lanczos 2.74 px. So `4k` is
**not** the `2k` picture enlarged: it holds real extra detail, about one and a half times the `2k` picture's
detail each way, not twice. Pixel for pixel it is a little softer than the garden plate. Reduced to 75%
(2784 x 3456, or 4128 x 2304 for 16:9) its edge measures 1.53 px, the garden plate's own. Looked at 100% beside
the garden plate, that is what the eye says too: the `2k` line is as crisp as the plate's, the `4k` line is a
touch soft at full size and crisp at three quarters.

**Ruling for every later painter.** Make masters at `4k`. Treat a `4k` master as a picture whose honest size is
75% of its pixels: 4128 x 2304 for 16:9, 2304 x 4128 for 9:16. Write plates from it at that size or smaller,
never at its full 5504 px. That covers both widths `plates.mjs` writes without the upscaler. A `4k` request
costs twice a `2k` one, and two requests never return the same picture, so a composition cannot be settled at
`2k` and then made again at `4k`: ask at `4k` from the first try for any plate the camera pushes into, and at
`2k` only for a plate that will never be drawn above 2752 px.

**One exception to the ruling, added in the rounds: `tv-face.webp` is written at its master's full size.** The
ruling stands for every other plate. The exception was made so that the set's glass (2229 px in the file) can
cover a 2560 px window, where the 75% size could not. What it costs is said here plainly: the file's pixels are
not all honest. At 2560 the glass is drawn at 1.15 CSS px to a file px, inside the limit, but at about 1.5 to
an honest px, which is over it. The softness of a `4k` master is in its edges, so the file's colour (not its
alpha) was given a mild sharpen whose result is held, pixel by pixel, between the darkest and the lightest
value the pixel already had within 2 px: an edge gets steeper, nothing overshoots, and no detail is added.
Measured on the file: the edge is 1.83 px before and 1.61 px after (quartile 1.52), against the garden plate's
1.60 (quartile 1.51), and at 100% beside the garden plate its curved lines are as smooth and as crisp as the
plate's. A stronger sharpen measured crisper (1.33 px) and was thrown away: a quarter of its edges were harder
than anything in the garden, and its curves stair-stepped. A set is flat shapes and ink lines. A scenery plate
with painted texture was not tried this way: use the ruling.

```py
def crisp(rgb, radius=1.6, amount=0.5, reach=2):          # rgb: float array, height x width x channels
    out = np.empty_like(rgb)
    for c in range(rgb.shape[2]):
        ch = rgb[..., c]
        sharp = ch + amount * (ch - scipy.ndimage.gaussian_filter(ch, radius))
        lo = scipy.ndimage.minimum_filter(ch, size=2 * reach + 1)
        hi = scipy.ndimage.maximum_filter(ch, size=2 * reach + 1)
        out[..., c] = np.clip(sharp, lo, hi)
    return out
```

## The files

| File | Pixels | Bytes | Alpha | What it is |
|---|---|---|---|---|
| `washi.webp` | 1024, 1024 | 33,092 | no | the paper tile, drawn at 512 CSS px. Tiles both ways. Its mean colour is the paper colour `#F1E6D0` |
| `screen.webp` | 1776, 2000 | 283,004 | yes | one sliding screen: cedar frame and lattice opaque, the paper see-through |
| `screen-p.webp` | 902, 3300 | 249,576 | yes | the same screen re-laid for an upright frame (a phone): three panes across, twelve down |
| `sheet-shadow.webp` | 384, 384 | 4,198 | yes | the one shadow under a sheet or a slip, as a nine-slice |
| `tv.webp` | 2254, 2048 | 128,768 | yes | the little television, three-quarter view, cut out, its glass a hole |
| `tv-face.webp` | 3602, 3330 | 275,504 | yes | the same set seen from the front, whole, cut out, its glass a hole |
| `tv-face-p.webp` | 2304, 4096 | 150,488 | yes | the same front picture at a phone's size, on a 9:16 canvas |
| `shadow-example.webp` | 1620, 720 | 22,696 | yes | the worked example of a screen shadow: a lantern and a kettle |

No file is video or audio. The largest is under 1 MiB.

## washi.webp

The file is 1024 px for a tile of 512 CSS px, so its fibres are crisp on a dense screen. Draw it at 512 px,
over the paper colour:

```css
background: #F1E6D0 url(/tea/shared/washi.webp) 0 0 / 512px 512px;
```

The tile's mean is `rgb(242.6, 231.7, 207.7)`, the paper colour to within about one level a channel, so a sheet
looks the same before and after the tile arrives. Its fibres are long and faint (the tile's luminance has a
standard deviation of 1.6 levels), so 16 px text reads on it as on plain paper. It holds nothing
wider than a fibre: what is left of it when blurred over 40 px varies by 0.3 of a level, so the repeat cannot be
seen on a sheet of any size. A chapter's 6% tint goes over it as a flat layer of the chapter's light colour.

**A picture window cut in the sheet**, as the paper round drew it (look B's recipe, which is right on this
paper): the hole's lit cut edge is a hair of pale light below and to the right, its near edge a hair of shade
above and to the left, and inside the hole the shade falls a few pixels onto the picture from the top and the
left. No keyline, no rounded corner.

```css
.win { box-shadow: 0 1.5px 0 rgba(255,252,240,.75), 1.5px 0 0 rgba(255,252,240,.5),
                   0 -1px 0 rgba(35,31,43,.35), -1px 0 0 rgba(35,31,43,.3); }
.win::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(20,16,30,.42), rgba(20,16,30,0) 12px),
              linear-gradient(90deg, rgba(20,16,30,.34), rgba(20,16,30,0) 10px); }
```

## screen.webp, and screen-p.webp for an upright frame

**What is in it.** The left-hand screen, seen flat: five panes across and six down. Its right edge is the stile
that meets the other screen at the post. The right-hand screen is the same picture mirrored (`scaleX(-1)`).

- Frame, lattice bars, the rail and the board at the foot: opaque. The cedar is `rgb(64, 39, 41)` and its
  ink line `rgb(19, 12, 17)` whatever the field, because wood lets nothing through.
- Paper: alpha 0.13 where it is plain (0.09 beside the post and low down, rising to about
  0.2 toward the top rail and the outer stile, so the light seems to stand low behind the post), and about
  0.45 in the soft shade a bar throws on it. Its colour is a dark plum, so paper only
  ever dims what is behind it. Put one flat field of colour behind the screen and the paper takes that
  colour. No blend mode is needed.
- The stack, from the back: the field (a `background-color` on the screen's own box), then the chapter's
  shadow, then this plate. So the lattice crosses the shadow, as it would.

**Its geometry, as shares of the plate** (measured from the files):

| Part | `screen.webp` across (x) | down (y) | `screen-p.webp` across (x) | down (y) |
|---|---|---|---|---|
| Outer stile (left) | 0 to 0.061 | | none: the plate starts in a bar | |
| Panes | five, 0.061 to 0.939 | | three, 0.017 to 0.897 | |
| Meeting stile (right) | 0.939 to 1 | | 0.897 to 1 | |
| Top rail | | 0 to 0.051 | | 0 to 0.027 |
| Rows of panes | | six, 0.051 to 0.844 | | twelve, 0.027 to 0.854 |
| Rail under the lattice | | 0.844 to 0.886 | | 0.854 to 0.876 |
| Board at the foot | | 0.886 to 1 | | 0.876 to 1 |

**How to draw it.** Each screen's box is 52% of the frame wide and 116% of it tall, with its top at the top of
the frame. The plate covers the box, anchored to its top and to the meeting stile. The same rule draws both
plates: use `screen-p.webp` where the frame is upright and narrower than three fifths of its height (a phone),
and `screen.webp` everywhere else.

```css
.screen img { width: 100%; height: 100%; object-fit: cover; object-position: 100% 0; }
.screen-r img { transform: scaleX(-1); }
```

```html
<picture><source media="(max-aspect-ratio: 3/5)" srcset="/tea/shared/screen-p.webp"><img src="/tea/shared/screen.webp" alt=""></picture>
```

`screen.webp` is a little squarer than the box (0.888 against 0.797 at 16:9), on purpose. Wherever the box is
the narrower shape, which is every window up to 16:9, the plate is fitted by its height: the frame's foot then
falls at 86.2% of the plate, in the middle of the rail under the lattice, so the frame ends on a strip of
cedar and the plain board is never seen. The spare width is cut at the outer edge, which is at or past the
window's edge when the screens are shut. On a window wider than 16:9 the plate is fitted by its width and the
foot cuts through the last row of panes instead. `screen-p.webp` (0.273) is fitted by its height on any frame
narrower than three fifths of its height, and the foot again falls in its rail (85.4% to 87.6%).

**Why a phone has its own plate.** Drawn on a 390 px phone, `screen.webp` gives each screen one column of
panes 136 px wide and a double post a quarter of the screen across, and at three device pixels it is enlarged
1.47 times. `screen-p.webp` is the same painting re-laid by script for an upright frame: the three columns
beside the meeting stile, and twelve rows (the six painted rows, each with half the bar above and below it,
laid in a new order and cross-faded over 28 px where they join). Nothing in it was generated.

| Window | Plate | Box (CSS px) | Plate drawn at | Shows |
|---|---|---|---|---|
| 1920 x 1080 | `screen.webp` | 998 x 1253 | 0.63 of its size | 4.5 panes across, 6 down |
| 2560 x 1440 | `screen.webp` | 1331 x 1670 | 0.84 | the same |
| 1440 x 900 at two device pixels | `screen.webp` | 749 x 1044 | 1.04 device px to a plate px | 4.2 panes across |
| 390 x 844 at three device pixels | `screen-p.webp` | 203 x 979 | 0.89 device px to a plate px | the stile and 2.3 panes across (72 x 56 px each), 10 down |
| 430 x 932 at three device pixels | `screen-p.webp` | 224 x 1081 | 0.98 | the same |

**Checked** in a browser with exactly this CSS, over lantern amber `#FFD892`, the television's `#9FB8FF`, a
pale `#F6E7C8`, and the night ground `rgb(16, 18, 32)`, each over a dark room, shut and half open, at
1440 x 900, 1920 x 1080, 2560 x 1440, 390 x 844 and 430 x 932 (the screens' round).

## sheet-shadow.webp

One picture for every sheet and slip, whatever its size. It is a pre-blurred shadow drawn round a square that
stands for the sheet: the square is the middle 192 px, and there are 96 px of margin on every side. The fall
(10 px right, 14 px down, with a tighter, darker shadow close under the edge) is already in the picture. Its
colour is an indigo plum, `rgb(14, 9, 26)`, as every shadow on the page is, and only its alpha varies: at most
162 of 255 under the sheet's edge, and 0 on all four edges.

Draw it as a nine-slice on an element that is a sibling of the sheet, under it, and 96 px larger on every side:

```css
.sheet-shadow {
  position: absolute; inset: -96px; pointer-events: none;
  border: 96px solid transparent;
  border-image: url(/tea/shared/sheet-shadow.webp) 96 fill / 96px;
}
```

The shadow is not a child of the clipped sheet (the sheet's `clip-path` would cut it). Where paper grows by a
quarter (from 1680 px wide), the shadow may grow with it: `inset: -120px`, `border-width: 120px`, and
`/ 120px` in the `border-image`. It is blurred, so it holds at any size. A sheet smaller than 192 px either way
still works: the corners do not overlap until it is under 1 px.

**On a phone** a sheet is the frame's width less 12 px each side, so the shadow's box reaches 84 px past the
frame's edge. Let the sheet's own section clip it (`overflow: clip` on the section, never on the page), or the
page scrolls sideways. The brief fixes the fall at 10 px and 14 px (1.1), and that is what the file draws at
its own size. Drawing it at half size on a phone (`inset: -48px`, `border-width: 48px`, `/ 48px`) would make
the fall 5 px and 7 px beside a 12 px margin: that departs from the brief, so it is the owner's to allow, not
a builder's to choose.

## The television: tv.webp, tv-face.webp, tv-face-p.webp

One set, the owner's: the little television of the live page, painted from its model
(`public/tea/hero/tv_rig.glb`). The walnut case, the cream frame round the whole front, the two knobs one above
the other, the speaker grille, the slot and the small switch, the dark plinth, the rabbit-ear aerial at the
right of the top. Two paintings, three files: `tv.webp` is the three-quarter view, `tv-face.webp` is the same
set seen front on, and `tv-face-p.webp` is that same front picture, whole, at a phone's size on an upright
canvas. Every picture is a cut-out: alpha 0 outside the set, and the glass is a hole, so whatever stands behind
the picture shows through it. The alpha and the hole were cut from the painted picture itself, not from the
model's mask.

**How close it is to the model, measured.** Each file's outline was laid over the model's own render from the
same side, both boxes fitted to one another:

| | Three-quarter | Front |
|---|---|---|
| Outline over the model's outline (1 is the same shape) | 0.994 | 0.986 |
| Whole set, width to height (model, painting) | 1.104, 1.102 | 1.083, 1.082 |
| Body without the aerial, width to height (model, painting) | 1.372, 1.37 | 1.315, 1.325 |
| Aerial's height as a share of the body's (model, painting) | 0.183, 0.183 | 0.214, 0.223 |
| Glass's width as a share of the body's (model, painting) | 0.515, 0.512 | 0.623, 0.619 |
| Glass, width to height (model, painting) | 1.086, 1.091 | 1.164, 1.221 |
| Plinth's height as a share of the set's width (model, painting) | | 0.0715, 0.0714 |

The aerial's two rods lean from upright by 39.5 and 34.8 degrees on the model seen from the hero's angle and
by 39.9 and 34.5 in the painting. From the front: 41.7 and 38.6 on the model, 41.3 and 36.5 in the painting.

The front painting came back with its plinth a third too low. It was lengthened by script to the model's
height (89 rows put into the plinth's plain middle; its two ink lines are as painted). The front glass is 5%
wider for its height than the model's: left as painted.

**Its colours are one table, the same in every file** (the rounds say why each was moved). Each is the median
of that material in the file, in the night key the set has in the garden:

| Material | Colour |
|---|---|
| Wood in the light (the top, the rim) | `rgb(98, 64, 44)` |
| Wood in shade (the side, the plinth) | `rgb(62, 39, 43)` |
| Control panel | `rgb(103, 68, 47)` |
| Cream frame | `rgb(218, 196, 160)` |
| Knobs, and the pointer bar across each | `rgb(74, 62, 78)`, `rgb(132, 120, 130)` |
| Aerial rods, and their base | `rgb(174, 165, 156)`, `rgb(50, 40, 50)` |
| Ink line | `rgb(21, 14, 18)` (the garden plate's is `rgb(16, 13, 14)`) |

That table is `tv-face.webp` and `tv-face-p.webp`, which are lit evenly so that each chapter can light them.
The stage has no filter and no blend mode, so a chapter that needs the set in another light (the cold room,
the three gardens of the fall) makes its own graded copy of `tv-face.webp` by script and keeps the geometry
below unchanged.

**`tv.webp` has the garden's night painted into it**, because it stands in one place only, the garden at the
top of the page, and nothing on the stage can tint it. Every colour of the table is multiplied by 0.72 (the
wood, the knobs) to 0.80 (the pale frame) and cooled by `(0.95, 0.98, 1.12)`, so the wood in the light comes
to `rgb(67, 46, 36)` and the frame to `rgb(166, 154, 143)` (worked out from the table, not sampled from the
file). The frame takes up to 30% more light, a little blue, within 124 px of the glass: the tube's light on its
own bezel. Its ink line is heavier than the faces' for its size, 13 px in the file where it was 10, because it
is only ever drawn small (the garden round says by how much).

**What the hero adds round `tv.webp`** (3.1), as this page's sheets drew it. For a set drawn `w` wide and `h`
tall with its top left at `x, y`: a contact shadow, a soft dark ellipse `1.02w` by `0.17h` at
`x + 0.02w, y + 0.885h`, colour `rgb(8, 10, 18)`, alpha 0.8 at its middle and 0 at its edge; and the pool of
the tube's light on the grass, a soft ellipse `1.9w` by `0.52h` at `x - 0.62w, y + 0.80h`, colour
`rgb(150, 175, 235)`, alpha 0.3 at its middle and 0 at its edge, behind the set. Both are the hero's to make
and tune. Without them the set floats: the last tile of the garden round's sheet shows it bare.

All numbers are pixels of the file, `x, y` from its top left.

| | `tv.webp` | `tv-face.webp` | `tv-face-p.webp` |
|---|---|---|---|
| View | three-quarter, the hero's own angle | front on, no perspective | the same front picture, smaller |
| Canvas | 2254, 2048 | 3602, 3330 | 2304, 4096 |
| The set's box `x0, y0, x1, y1` | the whole canvas | the whole canvas | 69, 47, 2235, 2047. Transparent below |
| Top of the case (under the aerial) | y = 302 | y = 607 | y = 411 |
| Glass: its box `x0, y0, x1, y1` | 205, 698, 1359, 1756 | 369, 954, 2598, 2780 | 291, 620, 1631, 1717 |
| Glass: width x height | 1154 x 1058 | 2229 x 1826 | 1340 x 1097 |
| Glass: its four corners, clockwise from top left | (237, 717) (1294, 799) (1341, 1709) (321, 1661) | (462, 1050) (2501, 1044) (2507, 2667) (455, 2662) | (351, 673) (1570, 671) (1575, 1651) (343, 1647) |
| Largest upright rectangle wholly inside the glass | 316, 799, 1248, 1655 | 482, 1046, 2485, 2688 | 359, 675, 1563, 1662 |
| Ink line round the glass, at its thinnest | 12 px | 15 px | 8 px |
| Made from its master at | 0.70 of its pixels | its full size | 0.60 |
| Margins in the canvas | none | none | 69 px each side, 46 px above, the rest of the canvas below |

**The glass is a hole with a painted edge.** One unbroken ink line runs round it on the set's side, drawn by
script exactly on the hole's boundary, so the hole's soft edge shows nothing but ink over any picture, light
or dark. The script that writes the files refuses a file with a gap in that line, with anything but ink in the
hole's soft edge, or (for `tv-face.webp`) with a glass under 1700 px wide.

**How to put a picture in the glass.** Stand it behind the set, covering the glass's box. The set's own frame
masks it to the glass's rounded shape. On `tv.webp` the glass is turned 14 degrees, so a flat picture behind it
is right to within a few pixels at the size it stands in the garden (under 200 px wide); for anything larger map
the picture's corners to the four corners given.

**How the faces differ from the brief's numbers, and why.** The brief asked for the front view at 2752 x 1536
with a glass at least 1700 px wide, and 1536 x 2752 for a phone, and says its sizes are the smallest a plate may
be. The model's own front, measured from a front-on render, is 1.08 times as wide as it is tall with its aerial,
its glass is 1.16 times as wide as tall, and the glass is 62% of the set's width. A whole set cannot have a
1700 px glass and be 1536 px tall unless it is redrawn wide, which would be a new set. So:

- `tv-face.webp` is the whole set at its master's full size, 3602 x
  3330, glass 2229 x 1826. The glass is taller
  than 16:9, so when its width matches a 16:9 window its height more than covers it. A 16:9 episode stood in
  the glass at the glass's full width is letterboxed in the tube at rest and fills the window exactly when the
  glass does.
- `tv-face-p.webp` is **not** a second design. The brief's phone layout (3.3) describes the set with "its knobs
  in a row under" the glass, which is look A's own upright set, and the first version painted one. Beside the
  other two it was a different television, so it was withdrawn. The file is now the front picture itself,
  framed for an upright screen: 2304 x 4096 (9:16, larger than
  the brief's smallest so that the glass holds when it grows to the whole screen), the set 94% of the canvas's
  width with a margin each side and above it, so that drawn the frame's width its outline is whole. What the one
  set costs on a phone is the glass's width at rest: see the poses.

**The phone's poses** (`set-above`), for a frame `W` wide. Both keep the glass in the top 42% at 390 x 844 and
430 x 932. The second is the first pushed in, one picture growing.

| Pose | Draw the file | The glass is | On 390 x 844 |
|---|---|---|---|
| The whole set (the room) | `W` wide, its top left at the frame's top left | 58% of `W` wide, from 0.27 `W` to 0.75 `W` down | 227 px wide, y = 105 to 291 (12% to 34%) |
| Into the set (the dial) | 1.547 `W` wide, its left 0.145 `W` and its top 0.346 `W` outside the frame | 90% of `W` wide, from 0.07 `W` to 0.81 `W` down. The knobs are out of the frame | 351 px wide, y = 27 to 315 (3% to 37%) |

**Sharpness limits these give** (1.25 CSS px to a file px). The glass of `tv-face.webp` may be drawn up to
2786 CSS px wide, so it covers a 2560 px window at 1.15 (about 1.5 to an honest pixel of its master: the
exception in the first section). On a laptop of 1512 px at two device pixels it covers the window at 1.36
device px to a file px. On a phone, `tv-face-p.webp` has 5.9 of its pixels to a CSS px with
the whole set in view and 3.8 in the second pose. Its glass is 1340 x
1097: it covers an 844 px screen at 0.77 CSS px to a file px and a 932 px one at 0.85,
inside the limit. On a screen of three device pixels that is 2.3 and 2.5 device px to a file px, so the
bezel's ink line is at its softest at the moment it leaves the frame.

**What a phone sees at 20:00.** The glass is wider than it is tall and the phone is the other way, so when the
glass grows to the whole screen its sides leave first and the last of the set in view is its bezel as two
cream bands, across the top and the foot (the phone round's sheet shows it). That is this set's shape, not a
fault of the file. The chapter's builder decides how long the bands stay.

## The screens' shadows: the rule, the template, a worked example

**The rule for the picture, so the engine needs no number of its own.** A shadow's picture is exactly three
times as wide and three times as tall as the box of the flat it belongs to, with the object in the middle
third each way. So if the flat's box at rest is `[x, y, w, h]`, the shadow is drawn at `[x - w, y - h, 3w, 3h]`,
by the same projection, on both screens, between the field and the plate. The margin is where the shadow dies
away. If an object's beam needs more room than that, give its flat a larger box with transparent margin; do
not change the rule.

**A shadow only ever darkens the paper.** The first version put a pale patch where the lantern's paper is, and
on the screen it read as a hole cut in the shadow. A shadow on paper is one soft dark shape. So the picture
holds dark colours only, and what varies is how dense they are. That also makes it right on any field: amber,
cold blue, pale. The script refuses to write a picture whose lightest colour is brighter than a dark brown.

**What a shadow is made of.** Every number is fixed in the script, so that twelve painters' shadows match.

1. **The silhouette** is the object's own alpha, lamp and all, as one shape, so the real object is uncovered in
   exactly the shadow's outline. It is blurred by 0.35% of the picture's width, as a shadow through paper is,
   with a fainter second edge at 1.2% (its penumbra). Colour: ink plum `#261A2A`. Density: 0.78.
2. **A lamp is the same shadow, thinner, never a hole.** The parts of the object that are its lamp are named in
   the config (`lit`). A paper shade lit from inside (a lantern) has density 0.40. A lamp that shines straight
   at the paper (a television's tube, a lens: `"tube": true`) has 0.20, which is what "its tube glowing" means
   here: the tube is nearly the field's own light, with the dark case round it. The lamp's edge inside the
   silhouette is blurred by 0.9% of the picture's width, so it is a glow and never a cut-out.
3. **Warmth near the lamp.** The shadow of whatever stands beside a lamp is thinner and warmer on the lamp's
   side: its density falls by up to a third, and its colour moves from ink plum toward the lamp's colour (a warm
   umber `#6A452C`, or for a cold lamp `"lamp": "#3B4868"`), over a distance of 9% of the picture's width. This
   is the only light in the picture, and it is made of less shadow, not of added light.
4. **A beam** (the projector) is also made of less shadow. `"shade": 0.16` lays a faint dusk round the object,
   and a part marked `"clear": true` (a white wedge from the lens) is where the dusk is left out.
5. **The window.** Every alpha is multiplied by a smooth ramp that is 0 at each edge and 1 from a tenth of the
   way in. This is what makes rule 3 of the screens true, and the script refuses to write a file whose
   outermost rows or columns are not all 0.

**The template.** One script makes any chapter's shadow from its own cut-outs. Copy it into the chapter's tools
(`scripts/tools/tea/<id>/shadow.mjs`), write the small config beside it, and run it with the repo's `sharp`.

```js
// A screen shadow from an object's own cut-out: node shadow.mjs <config.json> <out.webp>
// One soft dark silhouette. The picture is three times the object's box each way, the object in the middle third.
// It only ever darkens the paper: no pixel of it is pale. Alpha is 0 on all four edges.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const [cfgPath, out] = process.argv.slice(2);
const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
const px = cfg.px ?? 1.2;                                   // pixels for each board unit
const [bw, bh] = cfg.box;                                   // the object's box, in board units
const W = Math.round(bw * 3 * px), H = Math.round(bh * 3 * px);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const INK = hex('#261A2A');                                 // the shadow: ink plum
const LAMP = hex(cfg.lamp ?? '#6A452C');                    // the shadow where a lamp warms it (a cold lamp: '#3B4868')
const DARK = 0.78, THIN = 0.40, TUBE = 0.20, WARM = 0.34;   // fixed strengths: the object, a paper shade lit from inside, a tube or a lens
const SHADE = cfg.shade ?? 0;                               // the dusk a beam cuts through (a projector): 0.16, else none
const smooth = (lo, hi, x) => { const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo))); return t * t * (3 - 2 * t); };

const solid = new Float32Array(W * H), lit = new Float32Array(W * H), tube = new Float32Array(W * H), clear = new Float32Array(W * H);
for (const part of cfg.parts) {                             // each part: its cut-out and where it stands in the box
  const [x, y, w, h] = part.at.map((v) => Math.round(v * px));
  const { data } = await sharp(part.src).ensureAlpha().resize(w, h, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const mask = typeof part.lit === 'string'
    ? await sharp(part.lit).resize(w, h, { fit: 'fill' }).greyscale().extractChannel(0).raw().toBuffer() : null;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const s = (j * w + i) * 4, X = Math.round(bw * px) + x + i, Y = Math.round(bh * px) + y + j;
    if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
    const a = data[s + 3] / 255, luma = 0.299 * data[s] + 0.587 * data[s + 1] + 0.114 * data[s + 2];
    const l = mask ? mask[j * w + i] / 255 : (part.lit ? smooth(part.lit - 25, part.lit + 25, luma) : 0);
    const k = Y * W + X;
    if (part.clear) { clear[k] = Math.max(clear[k], a); continue; }       // a beam: where the dusk is left out
    solid[k] = Math.max(solid[k], a); lit[k] = Math.max(lit[k], a * l);
    if (part.tube) tube[k] = Math.max(tube[k], a * l);                   // this lamp shines straight at the paper
  }
}
const blur = async (f, sigma) => {                          // a blurred copy of one channel
  const b = Buffer.from(Uint8Array.from(f, (v) => Math.round(Math.min(1, v) * 255)));
  const r = await sharp(b, { raw: { width: W, height: H, channels: 1 } }).blur(Math.max(0.3, sigma)).extractChannel(0).raw().toBuffer();
  return Float32Array.from(r, (v) => v / 255);
};
const edge = await blur(solid, W * 0.0035);                 // the silhouette, a little soft, as through paper
const pen = await blur(solid, W * 0.012);                   // and its penumbra
const lamp = await blur(lit, W * 0.009);                    // the lamp's own part of the silhouette: a soft edge, never a cut-out
const tubeS = await blur(tube, W * 0.009);
const near = await blur(lit, W * 0.09);                     // the lamp's warmth, which reaches the things beside it
const dusk = SHADE ? await blur(solid, W * 0.11) : null, beam = SHADE ? await blur(clear, W * 0.006) : null;
let nmax = 0; for (const v of near) nmax = Math.max(nmax, v);

const rgba = Buffer.alloc(W * H * 4);
let lumaMax = 0;
for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
  const k = Y * W + X;
  const win = smooth(0, 0.1, Math.min(X, W - 1 - X) / W) * smooth(0, 0.1, Math.min(Y, H - 1 - Y) / H);
  const warm = nmax ? near[k] / nmax : 0;                   // 1 at the lamp, falling away round it
  const body = Math.min(1, 0.8 * edge[k] + 0.3 * pen[k]);   // the whole object, lamp included: one shape
  const thin = body > 0 ? Math.min(1, lamp[k] / Math.max(body, 0.05)) : 0;
  const isTube = lamp[k] > 0.02 ? Math.min(1, tubeS[k] / lamp[k]) : 0;
  const lampA = THIN + (TUBE - THIN) * isTube;
  let a = body * (DARK - (DARK - lampA) * thin) * (1 - WARM * warm * (1 - thin));
  if (SHADE) a = 1 - (1 - a) * (1 - SHADE * Math.min(1, dusk[k] * 3.2) * (1 - beam[k]));
  const t = Math.min(1, 0.75 * warm + 0.6 * thin);
  const c = [0, 1, 2].map((i) => INK[i] + (LAMP[i] - INK[i]) * t);
  for (let i = 0; i < 3; i++) rgba[k * 4 + i] = Math.round(c[i]);
  rgba[k * 4 + 3] = Math.round(a * win * 255);
  if (rgba[k * 4 + 3]) lumaMax = Math.max(lumaMax, 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]);
}
for (let X = 0; X < W; X++) if (rgba[X * 4 + 3] || rgba[((H - 1) * W + X) * 4 + 3]) throw new Error('alpha on the top or bottom edge');
for (let Y = 0; Y < H; Y++) if (rgba[Y * W * 4 + 3] || rgba[(Y * W + W - 1) * 4 + 3]) throw new Error('alpha on a side edge');
if (lumaMax > 100) throw new Error('a shadow may only darken: its lightest colour is ' + lumaMax.toFixed(0));
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 88, alphaQuality: 92, effort: 6 }).toFile(out);
console.log(out, W + 'x' + H, 'object box in the picture:', [W / 3, H / 3, W / 3, H / 3].map(Math.round).join(', '));
```

The config names the box of the flat in board units, how many pixels to give each unit, and each part with the
place it has inside the box (`at`: x, y, width, height, and a part may reach outside the box). A part's `lit` is
either a luminance (pixels of the cut-out brighter than it are the object's lamp) or the path of a mask picture,
white where the lamp is. Three configs, one for each kind of object the brief names:

```json
{ "box": [450, 200], "px": 1.2,
  "parts": [ { "src": "lantern.png", "at": [0, 6, 107, 194], "lit": 150 },
             { "src": "table-and-kettle.png", "at": [196, 0, 254, 200] } ] }

{ "box": [260, 240], "px": 2.0, "lamp": "#3B4868",
  "parts": [ { "src": "set-with-its-glass-filled.png", "at": [0, 0, 260, 240], "lit": "glass-mask.png", "tube": true } ] }

{ "box": [150, 245], "px": 2.4, "shade": 0.16,
  "parts": [ { "src": "projector.png", "at": [0, 0, 150, 245] },
             { "src": "beam-wedge.png", "at": [140, 59, 160, 120], "clear": true } ] }
```

For the television the cut-out given to the script has its glass filled in (alpha 1 in the hole), because the
shadow is of the whole set, and the mask says which part of it is the tube.

**The worked example** is `shadow-example.webp`, made by exactly that script and the first config: a floor
lantern and a low table with its kettle, standing together as one group 450 by 200 board units. The lantern was
cut from look B's room plate and the table is look B's own prop, both read from the frozen copies. The picture
is 1620 x 720, the group stands in its middle third (x 540 to 1080, y 240 to 480), its alpha is 0 on all four
edges and at most 199 of 255. It is an example and a placeholder for the stub.
The chapter that owns the lantern makes its own from its own flats. The other two configs were run on the
painted set and on look B's projector for the rounds' sheets, and are not shipped.

## The rounds

Each round: the new pictures beside the garden plate at 100% on one contact sheet, read as a harsh art director
would, the three weakest things named, those three fixed. The sheets are in the painter's working folder, not in
the repo. A different crop each round.

### The first complete version

Seven pictures, end to end, before any polish: the tile drawn by script, the screen from the `4k` master with
its paper made see-through, the sheet shadow, the set painted three times, one screen shadow from the template.

### The art director's read of the first version, and what was done

The first version was read by the person who briefed the painter. Five things, each checked against the files
before anything was changed. The work was then taken over by a second painter (the first was cut off by a
machine restart). The paper, the screens and the shadow are answered in the rounds below. The television first:

1. **"The three television pictures are not one set."** True. The three-quarter and the front pictures agreed.
   The upright one was another television: its controls in a strip under the glass, a taller cabinet. It was
   withdrawn. `tv-face-p.webp` is now the front picture itself at a phone's size, so there are two paintings
   and one set. This leaves the brief's phone layout (3.3, "its knobs in a row under it") unmet on purpose:
   the same set seen front on has its knobs beside the glass.
2. **"Is it the owner's television?"** Measured against the model's own renders from the same two sides. The
   shape was already his: the three-quarter outline lies over the model's at 0.994, with the same aerial, the
   same glass, the same proportions. The front's cabinet matched too, but its plinth was a third too low
   (0.047 of the set's width where the model has 0.072): lengthened by script. What had drifted was the
   surface, and all of it was brought back by script, the same way in both paintings, with no new generation:
   - the wood was plum-rose with swirls and knots, where the model is plain walnut: the strokes are painted
     out (the garden plate puts no strokes inside its shapes either) and the wood is a dark warm brown, with
     plum only where it is in shade;
   - the aerial's rods were cream on a large blue base, where the model's are grey metal on a small dark one:
     pale grey rods, a dark base;
   - the knobs were a light grey-violet, where the model's are dark: darkened;
   - the two creams did not agree (`228, 205, 165` and `244, 222, 190`): one cream now, and no longer a lit
     white, because the set stands in the dark;
   - the ink line was purple (`32, 12, 31`) where the garden's is near black (`16, 13, 14`), and the outline
     kept a rim of the magenta ground it was cut from: the ink is `21, 14, 18` and the rim is gone.
3. **"The glass."** `tv-face.webp`'s glass measures 1703 px of 2752. The first version's hole had a fault the
   sheet did not show: along the glass's right edge the key colour had run into the paint, so the ink line was
   green and thin there, broken for a stretch above the lower corner, and the cream beside it had a green
   cast 60 px wide. The cast is taken out of the cream, and one unbroken ink line is now drawn round the whole
   hole (at its thinnest 11 px on `tv-face.webp`). The build refuses a file with a gap in that line.
4. **"The shadow example: the lantern's paper shows as a pale rectangle, which reads as a hole."** True, and it
   was the recipe's fault, not the example's: it painted every lamp pale. The recipe is rewritten on one rule,
   a shadow only darkens, with fixed numbers (the section above). The lantern is now one warm-dark shape whose
   shade is thinner than its frame, the table beside it is thinner and warmer on the lantern's side, and no
   pixel of the picture is pale. The same script was run for the television (its tube nearly the field's own
   blue inside a dark case) and for the projector and its beam, to see that one recipe carries all three.
5. **"The screens."** The lattice holds. Two faults were found in the plate when it was drawn by a browser with
   this page's own CSS. Over a dark field (the house closing) about a thousand pale pixels showed along the
   ink lines: the soft edge between paper and ink had been left as opaque grey. And the paper's plum veil
   (alpha 0.2) took a fifth of the light out of every field, so lantern amber came out tan and the pale light
   came out grey-beige beside the room's own lamp. The plate was made again from the same master with the
   same geometry: the paper is cut pane by pane at the master's size, its soft edge is ink and paper only (the
   script counts pale pixels over the night ground and refuses any), and the veil is 0.09. The cedar is
   `rgb(64, 39, 41)` in every light, because wood is opaque. The sizes are checked in the screens' round.

### Round 1: the set, at 100% beside the garden plate

Sheet: `r1-tv-100.png` (twelve tiles at 100%: two of the garden plate, the knobs, the grille, the aerial's
base and the frame's corner of `tv.webp`, the rim, the second knob, the switch and the aerial's base of
`tv-face.webp`, the knobs and a glass corner of `tv-face-p.webp`). After the fixes: `r1-tv-after-100.png`.
Measured on this round's files: the ink line's edge is 1.60 px on `tv.webp`, 1.64 on `tv-face.webp`, 1.56 on
`tv-face-p.webp`, and 1.60 on the garden plate (10% to 90% of the step, as in the `4k` measurement).

The three weakest things:

1. **The knobs were two dark discs with nothing on them.** Each knob's pointer bar was painted in the knob's
   own colour, so it did not read, and at the size the set has in the garden the knobs were blobs. The model's
   bars are pale metal across a dark knob, and that is what makes them knobs. The four bars are now pale
   (`132, 120, 130`) on the dark knob (`74, 62, 78`).
2. **Lines the painter left open, and marks the first clean-up left behind.** The second knob of the front
   picture had no ring across its top (24 degrees of it were missing): closed with an arc of the same ink. On
   the three-quarter picture three scraps of grain strokes had survived beside the edge between the top and
   the side: painted out.
3. **The front picture still had streaks in its wooden rim and plinth while the three-quarter picture had
   none**, so the two did not look like one piece of wood. Painted out to a quarter of their strength: what is
   left reads as the rim's own shading, not as grain.

### Round 2: the television at the close-up, where the camera reaches its glass

Frames drawn by a headless browser with this page's own geometry, the set's face over look B's television
room, a picture standing behind the glass: at 1920 x 1080 and 2560 x 1440 with the glass 92% to 100% of the
window's width, at the moment the glass is as tall as the window (its four corners in view), and on a laptop
of two device pixels. Sheets: `r2-closeup.png`, `r2-closeup-corners.png`, `r2-closeup-before-after.png`,
`r2-ring-after.png`. Over a bright picture, over the dark garden and over a pale tube the hole's edge shows no
halo and no jagged step, and the ink line is unbroken all the way round.

The three weakest things:

1. **The picture was softest exactly where the camera goes closest**, which is the fault of look B this piece
   was told not to repeat. The face was 2752 px wide with a 1703 px glass. At 2560 x 1440 the glass could not
   cover the window inside the limit (it stopped at 2129 px with the bezel in view), and on a dense laptop the
   glass at full width stood at 1.8 device px to a file px. The face is now written at its master's full size
   with a mild sharpen of its edges: glass 2229 px, which covers 2560 at 1.15 and a 1512 px laptop of two
   device pixels at 1.36. This is one exception to the `4k` ruling, and the first section says what it costs.
   Its ink edge measures 1.61 px at 100% (garden 1.60). A stronger sharpen was tried first and withdrawn at
   the end of the rounds: it measured crisper than the garden and stair-stepped its curves.
2. **The phone's file at the same moment.** At 20:00 the glass grows to the whole phone screen. From a 1536 px
   file that is 3.25 device px to a file px on a screen of three, about twice as soft as the garden plate is
   at rest on the same phone. `tv-face-p.webp` is now 2160 px wide on a 2160 x 3840 canvas: 2.3.
3. **A dirty strip beside the glass.** With the hole over a pale tube, a few pixels of grey speckle ran along
   the outside of the new ink line near the lower right corner: what was left of the first line's ragged
   edge, and the last of the key colour in the cream there. The stained cream beside the glass is now evened
   in its light as well as its colour, and the strip the old line stood on is repainted from the paint just
   beyond it before the new line is drawn.

### Round 3: the set standing small in the garden plate

Frames drawn by a headless browser: the garden plate covering 1440 x 900, 1920 x 1080 and 2560 x 1440, the set
at the place and size it has in the hero (lower left, 18.3% of the frame's width, as in look B and on the live
page), an episode's picture behind its glass, and a pool of light and a contact shadow of the kind the hero
will add. Beside them the live page's own poster at the same size. Sheets: `r3-garden-whole.jpg`,
`r3-garden-100.png` (before), `r3-garden-after.png`.

The three weakest things:

1. **The set was lit from nowhere.** Its cream frame was the brightest thing in the garden after the house's
   windows, and its wood a warm daylight brown on a lawn that is nearly black-green. It read as a sticker.
   Nothing on the stage can tint a flat, so the night is painted into `tv.webp` itself: the whole set brought
   down and cooled as the lawn round it is, the pale frame a little less than the wood.
2. **Its ink line was half the garden's weight at the size it is drawn.** At 1440 x 900 the garden plate's
   line is 2.3 px on the screen and the set's was 1.2 px, so the set looked drawn with a finer pen. The line in
   `tv.webp` is now heavier (13 px in the file where it was 10: 1.5 px on the screen at 1440, 2.7 px at 2560,
   where the garden's is 3.6). Twice that was tried and thrown away: at 100% it filled in the slot and the
   switch. A scrap of cream that the heavier lines closed in on beside the glass is inked over.
3. **The tube lit nothing of its own set.** The frame beside a lit glass was as dark as the frame's far side.
   The bezel nearest the glass now takes a little cool light from the tube, falling away within 124 px.

What is not this piece's to fix, and is written into the television's section for the hero's builder: the
pool of light on the grass and the contact shadow. With them the set stands on the lawn. Without them it
floats (the sheet's last tile).

### Round 4: the screens in the three light colours, at every size

Frames drawn by a headless browser with the CSS of this page: the two screens over lantern amber, the
television's blue, the pale light and the night ground, shut and half open, each with its shadow (the lantern
and kettle, the television, the projector and its beam), over look B's rooms, at 1440 x 900, 1920 x 1080,
2560 x 1440, 390 x 844 and 430 x 932 at three device pixels. Sheets: `r4-screens-sizes.png` (before),
`r4-screens-phone.png`, `r4-screens-after-b.png`, `r4-screens-lights.jpg`.

**What the brief asks, checked.** Each screen's box is 52% of the frame wide and 116% of it tall in every
frame. The two overlap by 4% of the frame at the post: on a desktop that is the meeting stile's own width (58
px of 1440), so the two stiles read as one post. The frame's foot falls in the rail under the lattice at every
size, so the plain board is never seen. At 2560 x 1440 the plate is drawn at 0.84 of its size and its bars
are as crisp as the garden plate's. The cedar measures the same in all three lights and over the night
ground, and the paper is clean amber, clean blue and clean cream.

The three weakest things:

1. **On a phone the screen was the desktop's, cut down to a strip.** One column of panes 136 px wide to a
   screen, a double post a quarter of the screen across, and at three device pixels the plate enlarged 1.47
   times, so its bars were soft. A phone now has its own plate, `screen-p.webp`, re-laid by script from the same
   painting: two columns and a part of a third to a screen, ten rows down, 0.89 device px to a plate px.
2. **The television's shadow had a hole in it after all.** Its tube was a crisp-edged window of plain field
   inside the dark case: the lantern's fault again, in a quieter form. A lamp's edge inside a silhouette is now
   blurred nearly three times as far, and a tube is a fifth as dense as the case, not an eighth: a glow inside
   a shadow.
3. **The paper was one flat fill from corner to corner**, where the garden's own lit windows fall away toward
   their edges. The paper's veil now thickens toward the top rail and the outer stile (from 0.09 to about 0.2),
   so both screens are brightest low down beside the post, as if the lamp stood there.

### Round 5: washi with real text on it, and a picture window

Frames drawn by a headless browser: a sheet 640 px wide over look B's two rooms, with a kicker in Karla 600 at
12 px, a title in Zen Maru Gothic, a line at 16 px, a link, and a window cut in it with a picture behind; a small
slip beside it; the same sheet full width on a 390 x 844 phone; at one, two and three device pixels. The line is
set in Gelasio, an open face cut to Georgia's widths, because Georgia is not on this machine. The sheet's edge
is cut by a `clip-path` and its shadow is the nine-slice, both as this page says. Sheets: `r5-paper-whole.jpg`,
`r5-paper-100.png` (before), `r5-paper-after.png`, `r5-sheet-shadow.png`, and the owner's `paper-compare.jpg`.

Text at 16 px and at 12 px reads on the tile as on plain paper at every density. The window reads as a hole,
with the picture behind it. The shadow falls 10 px right and 14 px down and dies away inside its picture.

The three weakest things:

1. **On a dense screen the paper was blotchy and its fibres soft.** The 512 px tile was enlarged twice on a
   laptop of two device pixels, which is where the owner will look: its fibres went soft and its clouds read as
   stains. The tile is drawn again at 1024 px for the same 512 CSS px: long pale fibres about a pixel and a half
   wide in the file, a few dark ones, flecks.
2. **The tile's repeat.** At six times its contrast the first tile showed one dark cloud in every 512 px, a
   grid of faint patches on any large sheet. The new tile has no cloud wider than a fibre's length (what is
   left of it over 40 px is 0.3 of a level, where the first tile had 1.25).
3. **The sheet's shadow was blue-black, and heavy on a light world.** Over the cinema's lit cloth it was a grey
   band, the look of a drop-shadowed card. It is now the page's own shadow colour, an indigo plum, and a
   seventh lighter (at most 162 of 255 under the edge, where it had 186). On the dark rooms it reads as before.

### Round 6: everything on a phone-sized frame

Frames drawn by a headless browser at 390 x 844 and 430 x 932, three device pixels: the garden with the set
in the grass, the television chapter's `set-above` layout with an episode in the glass and its card on paper
below, the glass growing at 20:00, the screens shut on amber with the lantern's shadow and half open on the
cold room. Sheets: `r6-phone-whole.jpg` (before), `r6-phone-100.png`, `r6-phone-after.jpg`.

At three device pixels the set in the grass, the set's face, the screens' bars and the type on paper are all
crisp at 100%. The glass is in the top 42% in both poses at both sizes.

The three weakest things:

1. **The phone's picture of the set was not framed.** The cabinet ran into the canvas's edges, so drawn the
   frame's width its outline was cut by the screen's edge and it read as a crop, not as a set standing in a
   room. `tv-face-p.webp` is now a 2304 x 4096 canvas with the set 94% of its width, a margin each side and
   above (the set's own pixels are unchanged).
2. **The glass at rest is 227 px wide on a 390 px phone**, so an episode stands 227 x 128 px. That is what
   one true set costs against look A's upright set, whose glass spanned the phone. A second pose is measured
   and written into the television's section for the dial: the same file pushed in until the glass is 90% of
   the width (351 px) and the knobs have left the frame. It has 3.8 file px to a CSS px there, so it is crisp.
3. **The sheet's shadow reached 84 px past a phone's edge**, which is a sideways scroll waiting to happen. The
   sheet shadow's section now says so and says how it is clipped. Its 14 px fall is large beside a phone's
   12 px margin, but the brief fixes the fall, so a smaller one is left as a question for the owner.

What this round found and could not fix in a picture: at 20:00 on a phone the last of the set in view is its
bezel as two cream bands across the top and the foot, because the glass is wider than tall and the phone is
not. It is written into the television's section for the chapter's builder.

### Where it stands after the rounds

Measured on the files as shipped (the ink line's edge, 10% to 90% of its step, and the line's weight, both in
the file's own pixels; the garden plate is 1.60 px and 4 px):

| File | Edge | Line |
|---|---|---|
| `tv.webp` | 1.59 px | 13 px (drawn about a seventh of its size) |
| `tv-face.webp` | 1.61 px | 16 px |
| `tv-face-p.webp` | 1.58 px | 10 px |
| `screen.webp` | 1.57 px | 8 px |
| `screen-p.webp` | 1.55 px | 7 px |

**The three weakest things still in it.**

1. **The front picture is not quite the model's front.** It was painted to match the three-quarter picture, and
   its glass is a twentieth wider for its height than the model's (1.22 against 1.16), its body a hair wider
   (1.325 against 1.315). Its outline lies over the model's at 0.986, where the three-quarter one reaches 0.994.
   It reads as the same set. It is the one difference that is not on purpose, and the owner's sheet says so.
2. **The one true set is small on a phone.** Its glass is 227 px wide at rest on a 390 px screen, and at 20:00
   the last of it to leave is the bezel as two cream bands, its ink line enlarged 2.3 times in device pixels at
   that moment. A wider glass would be another television.
3. **`tv.webp` is still drawn with a finer pen than the garden**, 1.5 px on the screen where the plate's line
   is 2.3 px, because a heavier line filled in its slot and switch. And it has the garden's night painted into
   it, so it is right in that one place only: any other scene uses the front picture and lights it itself.

Smaller: `screen-p.webp`'s twelve rows are the six painted rows used twice, so two rows of every screen on a
phone are a pair. The television's and the projector's shadows were made only to test the recipe: each chapter
makes its own.

**For the owner.** Three sheets were made for him, outside the repo, in the painter's working folder:
`tv-compare.jpg` (the model, the painting, the painting in the garden, each with a piece at actual pixels),
`screens-compare.jpg` and `paper-compare.jpg`. Nothing may be built on the television as final until he has
said yes to the first.

## Generation log

Tool: Higgsfield `generate_image`, with the image model the brief names (each job reports its engine under
another id). Model names are not written in this repo's logs: see docs/tea/gen/README.md.
The garden plate `public/tea/hero/bg-far-night.webp`, scaled to 2048 x 1152, is a reference on every request,
as the style reference. No name and no site name is in any prompt. No video model was used. References are
written below by these names:

- **style**: the garden plate, 2048 x 1152.
- **line**: a crop of the garden plate round the house, enlarged twice, to show the line.
- **model, three-quarter** and **model, front**: the existing television model rendered alone on plain grey,
  2048 x 2048, at the hero's own angle and from the front (three.js, the site's own version, headless).
- A request may also name an earlier result as a reference, by its number here.

| # | For | References | Asked | Returned | Credits | Kept | The owner's yes |
|---|---|---|---|---|---|---|---|
| S1 | the screen plate, and the `4k` measurement | style, line | 4:5, `4k` | 3712 x 4608 | 4 | yes: `screen.webp` | not needed (scenery) |
| S2 | the same prompt, for the measurement | style, line | 4:5, `2k` | 1856 x 2304 | 2 | no: measurement only | |
| T1 | the set, three-quarter | style, line, model three-quarter | 1:1, `4k` | 4096 x 4096 | 4 | yes: `tv.webp` | waiting |
| T2 | the set, front | style, line, model front | 1:1, `4k` | 4096 x 4096 | 4 | no: a brown rim where the model and T1 have the cream frame | |
| T3 | the set, front, to match T1 | style, T1, model front | 1:1, `4k` | nothing: the service's content filter stopped the job | 0 | no | |
| T4 | T3 again, the same prompt | style, T1, model front | 1:1, `4k` | 4096 x 4096 | 4 | yes: `tv-face.webp` | waiting |
| T5 | the set, upright, for a phone | style, T4 | 4:5, `4k` | 3712 x 4608 | 4 | no: the control strip came out grey-violet, not brown | |
| T6 | the same, the strip's colour spelled out | style, T4 | 4:5, `4k` | 3712 x 4608 | 4 | no: kept at first, then withdrawn. A set with its controls under the glass is a second design, not the owner's set | |

Tries, of eight a plate: the screen 2 (one was the measurement), the three-quarter set 1, the front set 3 (one
stopped by the filter), the upright set 2 (both withdrawn: the upright file is made from the front set).

**Count and cost.** Eight requests, seven pictures returned, 26 credits: the Higgsfield balance was 530.37
before S1 and 504.37 after T6. Nothing was requested after T6. Everything the rounds changed was changed by
script from the masters of S1, T1 and T4, so the balance is still 504.37.

Not generated, made by script: the paper tile (drawn: clouds and long fibres, seeded), the sheet shadow (two
blurred squares), the screen's see-through paper and its shortened board, every cut-out's alpha and glass hole,
the sets' colours, the painting-out of their wood grain, the ink line round each glass, the front set's longer
plinth, `tv-face-p.webp` (the front picture, smaller), the example shadow (from look B's lantern and table),
every resize.

### S1 and S2: the screen (jobs `7602002a-178b-4b1e-a751-a91128bd806f` and `2be226db-1603-4c3c-b77e-5cfbb2db6bae`)

> Use the two attached pictures only as the STYLE reference (look at the lit paper windows of the house in
> them) and paint a new picture in exactly the same hand: flat gouache colour shapes, an uneven hand-drawn
> dark ink outline of the same weight around every shape, soft shading inside the shapes, clean and simple
> like a 2D animation background. Not photorealistic, no texture noise, not a 3D render.
>
> Subject: ONE single Japanese shoji sliding screen, seen perfectly flat and frontal like an architectural
> elevation, filling the whole upright picture exactly from edge to edge: its dark cedar outer frame runs
> along all four edges of the picture. Inside the frame, a regular grid lattice of thin dark cedar bars over
> paper: five columns and seven rows of panes, all the same size, each pane a little wider than it is tall.
> Below the lattice, the bottom seventh of the screen is one plain dark cedar board. The paper in every pane
> is plain, pale warm cream paper, evenly and softly lit from behind, with only a faint soft shadow along the
> top and left inside edge of each pane. The cedar is dark warm brown with plum in its shadows. No
> perspective, no floor, no wall, no room, no shadow shapes on the paper, nothing else in the picture: only
> the one flat screen.
>
> No people, no animals, no characters, no silhouettes, no text, no lettering, no signature, no watermark, no
> border.

Both came back in the garden's hand: flat cedar, one dark uneven outline, soft shade inside each pane. Both drew
five panes across and six down, not seven. S1 (`4k`) left a white margin round the screen, which was cropped
off. S2 (`2k`) drew a second frame outside the screen. S1 is the master of `screen.webp`: its six rows are kept
exactly as painted, and only its plain board is shortened by script.

### T1: the set, three-quarter (job `e6f45422-ceaf-47f3-971b-65b971d0250f`)

> The first two attached pictures are the STYLE reference only. The third attached picture is the SUBJECT: a
> small old television set, shown as a 3D render. Paint this exact television again in exactly the hand of the
> first two pictures: flat gouache colour shapes, an uneven hand-drawn dark ink outline of the same weight
> around every shape, soft shading inside each shape, clean and simple like a prop in a 2D animation
> background. Not photorealistic, no photographic wood grain, no texture noise, no 3D render look, no glossy
> highlights.
>
> Keep the set exactly as it is in the third picture: the same three-quarter view from the same angle (the
> front face turned a little to the left, the right side and a sliver of the top visible), the same
> proportions, every part in the same place. A boxy wooden case in warm dark brown wood, with only a few
> simple painted grain strokes. A thick cream-coloured bezel with rounded corners round the screen. To the
> right of the screen a narrow brown control panel with two round dark knobs, one above the other, then a
> small square speaker grille of short dark slots, then a small slot and one tiny switch at the bottom. A dark
> plinth under the case. On the top of the case, at the right, a rabbit-ear aerial: two pale rods in a V
> rising from a small dark round base.
>
> Night colours, as if the set stood in the garden of the first picture: the wood a dark warm brown with plum
> in its shadows, the bezel a muted warm cream, the knobs dark grey-violet. Soft even light from the front
> left. No cast shadow.
>
> The screen glass must be one completely flat, even, solid pure green (#00FF00), with no picture, no
> reflection, no shading and no highlight on it, so that it can be cut out. The background must be one
> completely flat, even, solid pure magenta (#FF00FF) everywhere, with no gradient, no floor, no shadow and no
> texture. The television is drawn large and centred, filling most of the square picture without touching its
> edges, and no part of it may contain magenta or green.
>
> No people, no animals, no characters, no text, no lettering, no numbers, no brand, no logo, no signature, no
> watermark, no border.

Kept. The same set from the same angle: case, cream frame, two knobs, grille, slot, switch, plinth, aerial. The
generator left a faint square of noise on the green glass, which does not matter: the glass is cut out.

### T2: the set, front (job `94e3c23d-708b-4636-ad92-26a4f2a2ef67`)

> The first two attached pictures are the STYLE reference only. The third attached picture is the SUBJECT: a
> small old television set seen exactly from the front, shown as a 3D render. Paint this exact television
> again in exactly the hand of the first two pictures: flat gouache colour shapes, an uneven hand-drawn dark
> ink outline of the same weight around every shape, soft shading inside each shape, clean and simple like a
> prop in a 2D animation background. Not photorealistic, no photographic wood grain, no texture noise, no 3D
> render look, no glossy highlights.
>
> Keep the set exactly as it is in the third picture: seen perfectly flat and frontal like an elevation
> drawing, no perspective, no side and no top visible, the same proportions, every part in the same place and
> the same size. A boxy wooden case in warm dark brown wood, seen as a thin wooden rim round the front, with
> only a few simple painted grain strokes. A thick cream-coloured bezel with rounded corners round the screen.
> The screen is large, a little wider than it is tall, with softly rounded corners and slightly bowed edges.
> To the right of the screen a narrow brown control panel with two round dark knobs, one above the other, then
> a small square speaker grille of short dark slots, then a small slot and one tiny switch at the bottom. A
> dark plinth under the case. On the top of the case, at the right, a rabbit-ear aerial: two pale rods in a V
> rising from a small dark round base.
>
> Night colours, as if the set stood in the garden of the first picture: the wood a dark warm brown with plum
> in its shadows, the bezel a muted warm cream, the knobs dark grey-violet. Soft even light from the front. No
> cast shadow.
>
> The screen glass must be one completely flat, even, solid pure green (#00FF00), with no picture, no
> reflection, no shading and no highlight on it, so that it can be cut out. The background must be one
> completely flat, even, solid pure magenta (#FF00FF) everywhere, with no gradient, no floor, no shadow and no
> texture. The television is drawn as large as it can be while the whole of it, aerial included, stays inside
> the square picture without touching its edges, and no part of it may contain magenta or green.
>
> No people, no animals, no characters, no text, no lettering, no numbers, no brand, no logo, no signature, no
> watermark, no border.

Rejected. In the right hand, but it drew a wide brown wooden rim round a cream bezel that frames the glass
only. The model, and T1, have the cream frame round the whole front with the control panel inside it. Beside T1
it read as a second set.

### T3 and T4: the set, front, matched to T1 (jobs `f67976fc-c514-4a8d-802b-991221f2ecaa` and `7555bafe-6300-4222-be9c-f51444b53eac`)

> The first attached picture is the STYLE reference only. The second attached picture is a painted old
> television set seen from a three-quarter angle. The third attached picture is a 3D render of the same set
> seen exactly from the front. Paint the television of the second picture again, in exactly the same hand, the
> same colours and the same ink line as the second picture (flat gouache colour shapes, an uneven hand-drawn
> dark ink outline of one weight around every shape, soft shading inside each shape, like a prop in a 2D
> animation background), but now seen exactly from the front, with the layout and proportions of the third
> picture. Not photorealistic, no photographic wood grain, no texture noise, no 3D render look, no glossy
> highlights.
>
> Seen perfectly flat and frontal like an elevation drawing: no perspective, no side and no top visible. It is
> the same set, so keep every part as it is painted in the second picture. The whole front is framed by the
> thick cream-coloured frame with rounded corners: the cream frame runs all the way round the front, round the
> screen and round the brown control panel together. Outside the cream frame only a narrow rim of the dark
> brown wooden case shows, with two or three plain straight grain strokes and no knots. The screen is large, a
> little wider than it is tall, with softly rounded corners and slightly bowed edges, and a lighter cream
> bevel between the frame and the glass. To the right of the screen, inside the cream frame, the narrow brown
> control panel: two plain round dark grey-violet knobs, one above the other, each with one raised bar across
> it, then a small square speaker grille of short dark slots, then a small slot and one tiny switch at the
> bottom. A dark plinth under the case. On the top of the case, at the right, the rabbit-ear aerial: two pale
> rods in a V rising from a small dark round base.
>
> The same night colours as the second picture. Soft even light from the front. No cast shadow.
>
> The screen glass must be one completely flat, even, solid pure green (#00FF00), with no picture, no
> reflection, no shading and no highlight on it, so that it can be cut out. The background must be one
> completely flat, even, solid pure magenta (#FF00FF) everywhere, with no gradient, no floor, no shadow and no
> texture. The television is drawn as large as it can be while the whole of it, aerial included, stays inside
> the square picture without touching its edges, and no part of it may contain magenta or green.
>
> No people, no animals, no characters, no text, no lettering, no numbers, no brand, no logo, no signature, no
> watermark, no border.

T3 was stopped by the service's content filter (status `nsfw`, no picture, no charge). T4 is the same prompt
and the same references sent again, unchanged. Kept: the cream frame runs round the whole front, the bevel
round the glass has mitred corners, the knobs and the grille are T1's.

### T5: the set, upright (job `e562f311-bf7e-4a9a-afaf-c317189249b9`)

> The first attached picture is the STYLE reference only. The second attached picture is a painted old
> television set seen exactly from the front. Paint an upright model of the same set, in exactly the same
> hand, the same colours and the same ink line as the second picture (flat gouache colour shapes, an uneven
> hand-drawn dark ink outline of one weight around every shape, soft shading inside each shape, like a prop in
> a 2D animation background). Not photorealistic, no photographic wood grain, no texture noise, no 3D render
> look, no glossy highlights.
>
> Seen perfectly flat and frontal like an elevation drawing: no perspective, no side and no top visible. It is
> the same set with its parts laid out for an upright case, taller than it is wide. The screen takes the upper
> part of the front and is nearly as wide as the whole set: the same screen as in the second picture, a little
> wider than it is tall, with softly rounded corners and slightly bowed edges, and the same lighter cream
> bevel with mitred corners between the frame and the glass. BELOW the screen, across the full width of the
> set, lies the brown control panel as one low horizontal strip: at its left the two plain round dark
> grey-violet knobs side by side, each with one raised bar across it; in the middle the speaker grille of
> short dark slots; at its right the small slot and the one tiny switch. The same thick cream-coloured frame
> with rounded corners runs all the way round the front, round the screen and the control strip together.
> Outside the cream frame only the same narrow rim of the dark brown wooden case shows. The same dark plinth
> under the case. On the top of the case, at the right, the same rabbit-ear aerial: two pale rods in a V
> rising from a small dark round base.
>
> The same night colours as the second picture. Soft even light from the front. No cast shadow.
>
> The screen glass must be one completely flat, even, solid pure green (#00FF00), with no picture, no
> reflection, no shading and no highlight on it, so that it can be cut out. The background must be one
> completely flat, even, solid pure magenta (#FF00FF) everywhere, with no gradient, no floor, no shadow and no
> texture. The television is drawn as large as it can be while the whole of it, aerial included, stays inside
> the upright picture without touching its edges, and no part of it may contain magenta or green.
>
> No people, no animals, no characters, no text, no lettering, no numbers, no brand, no logo, no signature, no
> watermark, no border.

Rejected. The layout is right, but the control strip is the knobs' own grey-violet, so the knobs do not stand
out and the strip is not the brown panel of T1 and T4.

### T6: the set, upright, second try (job `b8cf1999-3db9-4905-a134-c187e34c3faf`)

> The first attached picture is the STYLE reference only. The second attached picture is a painted old
> television set seen exactly from the front. Paint an upright model of the same set, in exactly the same
> hand, the same colours and the same ink line as the second picture (flat gouache colour shapes, an uneven
> hand-drawn dark ink outline of one weight around every shape, soft shading inside each shape, like a prop in
> a 2D animation background). Not photorealistic, no photographic wood grain, no texture noise, no 3D render
> look, no glossy highlights.
>
> Seen perfectly flat and frontal like an elevation drawing: no perspective, no side and no top visible. It is
> the same set with its parts laid out for an upright case, taller than it is wide. The screen takes the upper
> part of the front and is nearly as wide as the whole set: the same screen as in the second picture, a little
> wider than it is tall, with softly rounded corners and slightly bowed edges, and the same lighter cream
> bevel with mitred corners between the frame and the glass. BELOW the screen, across the full width of the
> set, lies the control panel as one low horizontal strip. The control strip is the SAME WARM BROWN WOOD
> COLOUR as the control panel in the second picture (brown, not grey and not violet). On that brown strip: at
> its left the two plain round dark grey-violet knobs side by side, each with one raised bar across it, dark
> against the brown; in the middle the speaker grille of short dark slots; at its right the small dark slot
> and the one tiny switch. The same thick cream-coloured frame with rounded corners runs all the way round the
> front, round the screen and the brown control strip together. Outside the cream frame only the same narrow
> rim of the dark brown wooden case shows. The same dark plinth under the case. On the top of the case, at the
> right, the same rabbit-ear aerial: two pale rods in a V rising from a small dark round base.
>
> The same night colours as the second picture: dark warm brown wood with plum in its shadows, muted warm
> cream frame, dark grey-violet knobs. Soft even light from the front. No cast shadow.
>
> The screen glass must be one completely flat, even, solid pure green (#00FF00), with no picture, no
> reflection, no shading and no highlight on it, so that it can be cut out. The background must be one
> completely flat, even, solid pure magenta (#FF00FF) everywhere, with no gradient, no floor, no shadow and no
> texture. The television is drawn as large as it can be while the whole of it, aerial included, stays inside
> the upright picture without touching its edges, and no part of it may contain magenta or green.
>
> No people, no animals, no characters, no text, no lettering, no numbers, no brand, no logo, no signature, no
> watermark, no border.

Kept in the first version: a brown strip, the two knobs side by side, the grille, the slot and the switch. Withdrawn
afterwards: laid beside T1 and T4 it is another television (its controls in a strip under the glass, a taller
cabinet), and the set must be one set. `tv-face-p.webp` is now made from T4.
