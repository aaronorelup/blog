# The shared art: what each file is, how to draw it, and how it was made

Everything in `public/tea/shared/`. This file is the usage sheet for the builders of the page and the log of how
each picture was made (every generation request, kept or rejected, is at the foot).

**State: working versions.** The three files below were made by script from the two prototypes' own files so the
shared system can be built against real pictures. Their names, their alpha and the way they are drawn will not
change. Their pixels will: each is replaced by a final version, and this file then says so.

## The files

| File | Pixels | Alpha | What it is |
|---|---|---|---|
| `washi.webp` | 512 x 512 | none | the paper tile. Tiles in both directions. Its mean colour is the paper colour `#F1E6D0` |
| `screen.webp` | 1600 x 1600 | yes | one sliding screen: cedar frame and lattice opaque, the paper see-through |
| `sheet-shadow.webp` | 384 x 384 | yes | the one shadow under a sheet or a slip, as a nine-slice |

Still to come: `tv.webp`, `tv-face.webp`, `tv-face-p.webp`, and the template for the screens' shadows.

## washi.webp

Draw it at its own size, one tile pixel to one CSS pixel, over the paper colour:

```css
background: #F1E6D0 url(/tea/shared/washi.webp) 0 0 / 512px 512px;
```

The tile's mean is the paper colour to within one level a channel, so a sheet looks the same before and after
the tile arrives. A chapter's 6% tint goes over it as a flat layer of the chapter's light colour.

## screen.webp

**What is in it.** The left-hand screen, seen flat. Its right edge is the stile that meets the other screen at
the post. The right-hand screen is the same picture mirrored (`scaleX(-1)`).

- Frame, lattice bars and the board at the foot: opaque.
- Paper: alpha 0.16 where it is plain, rising to about 0.6 in the soft shade under each bar. Its colour is a
  dark plum, so paper only ever dims what is behind it. Put one flat field of colour behind the screen and the
  paper takes that colour: no blend mode is needed.
- The field belongs behind the paper only. Give the screen's element the field as its `background-color`; the
  plate covers all of it.

**Its geometry, as shares of the plate** (measured from the file):

| Part | Across (x) | Down (y) |
|---|---|---|
| Outer stile (left) | 0 to 0.055 | |
| Paper, six panes across and six down | 0.055 to 0.945 | 0.056 to 0.757 |
| Meeting stile (right) | 0.945 to 1 | |
| Top rail | | 0 to 0.056 |
| Board at the foot | | 0.757 to 1 |

**How to draw it.** Each screen's box is 52% of the frame wide and 116% of it tall, with its top at the top of
the frame. The plate covers the box, anchored to the meeting stile, so the stile is always whole and the outer
edge is what a narrow window cuts:

```css
.screen img { width: 100%; height: 100%; object-fit: cover; object-position: 100% 0; }
.screen-r img { transform: scaleX(-1); }
```

At 1920x1080 the box is 998 x 1253 CSS px and the plate is drawn at 0.78 of its size. At 2560x1440 it is drawn
at 1.04. On a 390x844 phone the box is 203 x 979 and shows the stile and a pane and a third.

**Checked** over the three kinds of light and the night ground: lantern amber `#FFD892`, the television's
`#9FB8FF`, a pale `#F6E7C8`, and `rgb(16, 18, 32)`.

## sheet-shadow.webp

One picture for every sheet and slip, whatever its size. It is a pre-blurred shadow drawn round a square that
stands for the sheet: the square is the middle 192 px, and there are 96 px of margin on every side. The fall
(10 px right, 14 px down, with a tighter, darker shadow close under the edge) is already in the picture. Its
colour is `rgb(3, 3, 12)` and only its alpha varies. Its alpha is 0 on all four edges.

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
`/ 120px` in the `border-image`. It is blurred, so it holds at any size.

## How the working versions were made

No generation. All three by script from files already in the repo.

- `washi.webp`: look B's tile (`public/labs/tea-room/b/assets/img/washi.webp`, 512 px), its mean colour moved
  from `rgb(232, 226, 212)` to the paper colour.
- `screen.webp`: look A's screen plate (`public/labs/tea-room/a/assets/img/shoji-amber.webp`, 1600 px). The lit
  paper was found by its colour and replaced by see-through plum, keeping each pane's own shading and dropping
  the light that was painted across the whole plate.
- `sheet-shadow.webp`: drawn. Two blurred squares, one wide and soft, one tight and dark.
