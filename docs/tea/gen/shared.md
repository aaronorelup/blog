# The shared art: what each file is, how to draw it, and how it was made

Everything in `public/tea/shared/`. This file is the usage sheet for the builders of the page and the log of how
each picture was made (every generation request, kept or rejected, is at the foot).

**State: working versions.** The three files below were made by script from the two prototypes' own files so the
shared system can be built against real pictures. Their names, their alpha and the way they are drawn will not
change. Their pixels will: each is replaced by a final version, and this file then says so.

The generation log is the last section. Every request is there, kept or rejected.

## What a `4k` generation is worth (measured, 2026-11-12)

The same prompt (the screen plate, below as S1 and S2) was sent twice to Higgsfield `generate_image`, model id
`nano_banana_pro`, aspect 4:5, once at `4k` and once at `2k`, with the same two references. **Size:** `2k`
returned 1856 x 2304 and `4k` returned 3712 x 4608, exactly twice each way (so 16:9 is 2752 x 1536 at `2k` and
5504 x 3072 at `4k`). **Cost:** 2 credits at `2k`, 4 credits at `4k` (the balance went from 530.37 to 524.37 for
the pair). **Sharpness**, as the width in pixels over which an ink line's edge goes from 10% to 90% of its step
(median over every strong edge on rows and columns 7 px apart; `edges.py` in the painter's working folder): the
garden plate 1.54 to 1.60 px, the `2k` result 1.50 px, the `4k` result 2.04 px (quartiles 1.87 and 2.14), and
the `2k` result enlarged twice by Lanczos 2.74 px. So `4k` is **not** the `2k` picture enlarged: it holds real
extra detail, about one and a half times the `2k` picture's detail each way, not twice. Pixel for pixel it is a
little softer than the garden plate. Reduced to 75% (2784 x 3456, or 4128 x 2304 for 16:9) its edge measures
1.53 px, the garden plate's own. Looked at 100% beside the garden plate, that is what the eye says too: the
`2k` line is as crisp as the plate's, the `4k` line is a touch soft at full size and crisp at three quarters.

**Ruling for every later painter.** Make masters at `4k`. Treat a `4k` master as a picture whose honest size is
75% of its pixels: 4128 x 2304 for 16:9, 2304 x 4128 for 9:16. Write plates from it at that size or smaller,
never at its full 5504 px. That covers both widths `plates.mjs` writes without the upscaler. A `4k` request
costs twice a `2k` one, and two requests never return the same picture, so a composition cannot be settled at
`2k` and then made again at `4k`: ask at `4k` from the first try for any plate the camera pushes into, and at
`2k` only for a plate that will never be drawn above 2752 px.

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

## Generation log

Tool: Higgsfield `generate_image`, model id `nano_banana_pro` (the job reports its engine as `nano_banana_2`).
References on every request, role `image_references`: (1) the garden plate `public/tea/hero/bg-far-night.webp`
scaled to 2048 x 1152, as the style reference, and (2) a crop of the same plate round the house, enlarged
twice, to show the line. No name and no site name is in any prompt.

| # | For | Size asked | Returned | Credits | Kept |
|---|---|---|---|---|---|
| S1 | the screen plate, and the `4k` measurement | 4:5, `4k` | 3712 x 4608 | 4 | see the screen's section |
| S2 | the same prompt, for the measurement | 4:5, `2k` | 1856 x 2304 | 2 | measurement only |

### S1 and S2: the screen (jobs `7602002a-178b-4b1e-a751-a91128bd806f` and `2be226db-1603-4c3c-b77e-5cfbb2db6bae`)

> Use the two attached pictures only as the STYLE reference (look at the lit paper windows of the house in them)
> and paint a new picture in exactly the same hand: flat gouache colour shapes, an uneven hand-drawn dark ink
> outline of the same weight around every shape, soft shading inside the shapes, clean and simple like a 2D
> animation background. Not photorealistic, no texture noise, not a 3D render.
>
> Subject: ONE single Japanese shoji sliding screen, seen perfectly flat and frontal like an architectural
> elevation, filling the whole upright picture exactly from edge to edge: its dark cedar outer frame runs along
> all four edges of the picture. Inside the frame, a regular grid lattice of thin dark cedar bars over paper:
> five columns and seven rows of panes, all the same size, each pane a little wider than it is tall. Below the
> lattice, the bottom seventh of the screen is one plain dark cedar board. The paper in every pane is plain, pale
> warm cream paper, evenly and softly lit from behind, with only a faint soft shadow along the top and left
> inside edge of each pane. The cedar is dark warm brown with plum in its shadows. No perspective, no floor, no
> wall, no room, no shadow shapes on the paper, nothing else in the picture: only the one flat screen.
>
> No people, no animals, no characters, no silhouettes, no text, no lettering, no signature, no watermark, no
> border.

Both came back in the garden's hand: flat cedar, one dark uneven outline, soft shade inside each pane. Both drew
five panes across and six down, not seven. S1 (`4k`) left a white margin round the screen. S2 (`2k`) drew a
second frame outside the screen.
