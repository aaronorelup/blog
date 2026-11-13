# The shared art: what each file is, how to draw it, and how it was made

Everything in `public/tea/shared/`. This file is the usage sheet for the builders of the page, the record of the
painter's rounds, and the log of every generation request, kept or rejected (the last section).

**What waits for the owner.** The three television pictures are not approved. Nothing may be built on them as
final until he has seen them beside the model's render and the garden plate and said yes in his own words. His
answer is recorded in the log's table.

## Changed since the first version (commit `d5f4efdb`)

File names are the same. A builder who read the first version of this page needs only this list.

- `tv-face-p.webp` is a different picture: the front set itself, not a re-laid upright set. Its geometry is all
  new (set 1536 x 1420 at the top of the canvas, glass box 157, 407, 1108, 1185).
- `tv-face.webp` is 2752 x 2544, not 2752 x 2476: the plinth is 68 px taller, to the model's height. Nothing
  above the plinth moved, so the glass's box is unchanged.
- `tv.webp`: the same size and the same glass box. The glass's corners moved by up to 3 px.
- All three sets have new colours (the table in the television's section) and no wood grain.

## What a `4k` generation is worth (measured, 2026-11-12)

The same prompt (the screen plate, below as S1 and S2) was sent twice to Higgsfield `generate_image`, model id
`nano_banana_pro`, aspect 4:5, once at `4k` and once at `2k`, with the same two references. **Size:** `2k`
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

## The files

| File | Pixels | Bytes | Alpha | What it is |
|---|---|---|---|---|
| `washi.webp` | 512, 512 | 6,320 | no | the paper tile. Tiles both ways. Its mean colour is the paper colour `#F1E6D0` |
| `screen.webp` | 1776, 2000 | 239,218 | yes | one sliding screen: cedar frame and lattice opaque, the paper see-through |
| `sheet-shadow.webp` | 384, 384 | 4,284 | yes | the one shadow under a sheet or a slip, as a nine-slice |
| `tv.webp` | 2254, 2048 | 147,394 | yes | the little television, three-quarter view, cut out, its glass a hole |
| `tv-face.webp` | 2752, 2544 | 178,590 | yes | the same set seen from the front, whole, cut out, its glass a hole |
| `tv-face-p.webp` | 1536, 2752 | 93,404 | yes | the same front picture at a phone's size, on a 9:16 canvas |
| `shadow-example.webp` | 1620, 720 | 31,256 | yes | the worked example of a screen shadow: a lantern and a kettle |

No file is video or audio. The largest is under 1 MiB.

## washi.webp

Draw it at its own size, one tile pixel to one CSS pixel, over the paper colour:

```css
background: #F1E6D0 url(/tea/shared/washi.webp) 0 0 / 512px 512px;
```

The tile's mean is `rgb(240.3, 230.3, 208.4)`, the paper colour to within one level a channel, so a sheet looks
the same before and after the tile arrives. Its fibres are long and faint (the tile's luminance has a standard
deviation of 1.77 levels), so 16 px text reads on it as on plain paper. A chapter's 6% tint goes
over it as a flat layer of the chapter's light colour.

## screen.webp

**What is in it.** The left-hand screen, seen flat: five panes across and six down. Its right edge is the stile
that meets the other screen at the post. The right-hand screen is the same picture mirrored (`scaleX(-1)`).

- Frame, lattice bars, the rail and the board at the foot: opaque.
- Paper: alpha 0.2 where it is plain, rising to about 0.57 in the
  soft shade a bar throws on it. Its colour is a dark plum, so paper only ever dims what is behind it. Put one
  flat field of colour behind the screen and the paper takes that colour. No blend mode is needed.
- The stack, from the back: the field (a `background-color` on the screen's own box), then the chapter's
  shadow, then this plate. So the lattice crosses the shadow, as it would.

**Its geometry, as shares of the plate** (measured from the file):

| Part | Across (x) | Down (y) |
|---|---|---|
| Outer stile (left) | 0 to 0.063 | |
| Five panes | 0.063 to 0.936 | |
| Meeting stile (right) | 0.936 to 1 | |
| Top rail | | 0 to 0.053 |
| Six rows of panes | | 0.053 to 0.844 |
| Rail under the lattice | | 0.844 to 0.886 |
| Board at the foot | | 0.886 to 1 |

**How to draw it.** Each screen's box is 52% of the frame wide and 116% of it tall, with its top at the top of
the frame. The plate covers the box, anchored to its top and to the meeting stile:

```css
.screen img { width: 100%; height: 100%; object-fit: cover; object-position: 100% 0; }
.screen-r img { transform: scaleX(-1); }
```

The plate is a little squarer than the box (0.888 against 0.797 at 16:9), on purpose. Wherever the box is the
narrower shape, which is every window up to 16:9 and every phone, the plate is fitted by its height: the
frame's foot then falls at 86.2% of the plate, in the middle of the rail under the lattice, so the frame ends on
a strip of cedar and the plain board is never seen. The spare width is cut at the outer edge, which is at or
past the window's edge when the screens are shut. On a window wider than 16:9 the plate is fitted by its width
and the foot cuts through the last row of panes instead.

| Window | Box (CSS px) | Plate drawn at | Shows |
|---|---|---|---|
| 1920 x 1080 | 998 x 1253 | 0.63 of its size | 4.5 panes across, 6 down |
| 2560 x 1440 | 1331 x 1670 | 0.84 | the same |
| 1440 x 900 at two device pixels | 749 x 1044 | 1.04 device px to a plate px | 4.2 panes across |
| 390 x 844 | 203 x 979 | 0.49 (2.04 plate px to a CSS px) | the stile and one pane |

**Checked** over lantern amber `#FFD892`, the television's `#9FB8FF`, a pale `#F6E7C8`, and the night ground
`rgb(16, 18, 32)`, each over a dark room (the rounds below).

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
`/ 120px` in the `border-image`. It is blurred, so it holds at any size. A sheet smaller than 192 px either way
still works: the corners do not overlap until it is under 1 px.

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
| Plinth's height as a share of the set's width (model, painting) | | 0.0715, 0.0712 |

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
| Knobs | `rgb(74, 62, 78)` |
| Aerial rods, and their base | `rgb(174, 165, 156)`, `rgb(50, 40, 50)` |
| Ink line | `rgb(21, 14, 18)` (the garden plate's is `rgb(16, 13, 14)`) |

The stage has no filter and no blend mode, so a chapter that needs the set in another light (the cold room,
the three gardens of the fall) makes its own graded copy of `tv-face.webp` by script and keeps the geometry
below unchanged.

All numbers are pixels of the file, `x, y` from its top left.

| | `tv.webp` | `tv-face.webp` | `tv-face-p.webp` |
|---|---|---|---|
| View | three-quarter, the hero's own angle | front on, no perspective | the same front picture, smaller |
| Canvas | 2254, 2048 | 2752, 2544 | 1536, 2752 |
| The set fills | the whole canvas | the whole canvas | the full width, from the top down to y = 1420. Transparent below |
| Top of the case (under the aerial) | y = 302 | y = 464 | y = 259 |
| Glass: its box `x0, y0, x1, y1` | 205, 698, 1359, 1756 | 282, 729, 1985, 2124 | 157, 407, 1108, 1185 |
| Glass: width x height | 1154 x 1058 | 1703 x 1395 | 951 x 778 |
| Glass: its four corners, clockwise from top left | (237, 717) (1294, 799) (1341, 1709) (321, 1661) | (355, 800) (1907, 794) (1915, 2038) (347, 2033) | (196, 448) (1064, 443) (1068, 1138) (192, 1133) |
| Largest upright rectangle wholly inside the glass | 316, 799, 1248, 1655 | 368, 799, 1899, 2054 | 205, 446, 1060, 1146 |
| Ink line round the glass, at its thinnest | 10 px | 11 px | 6 px |
| Made from its master at | 0.70 of its pixels | 0.764 | 0.426 |

**The glass is a hole with a painted edge.** One unbroken ink line runs round it on the set's side, drawn by
script exactly on the hole's boundary, so the hole's soft edge shows nothing but ink over any picture, light
or dark. The script that writes the files refuses a file with a gap in that line, with anything but ink in the
hole's soft edge, or (for `tv-face.webp`) with a glass under 1700 px wide.

**How to put a picture in the glass.** Stand it behind the set, covering the glass's box. The set's own frame
masks it to the glass's rounded shape. On `tv.webp` the glass is turned 14 degrees, so a flat picture behind it
is right to within a few pixels at the size it stands in the garden (under 200 px wide); for anything larger map
the picture's corners to the four corners given.

**How the faces differ from the brief's numbers, and why.** The brief asked for the front view on a 16:9 canvas
with a glass at least 1700 px wide. The model's own front, measured from a front-on render, is 1.08 times as
wide as it is tall with its aerial, its glass is 1.16 times as wide as tall, and the glass is 62% of the set's
width. A whole set with a 1700 px glass is therefore about 2750 x 2550, and cannot be 1536 tall unless the set
is redrawn wide, which would be a new set. So:

- `tv-face.webp` keeps the set and grows the canvas: 2752 wide as asked, 2544 tall, glass
  1703 px wide. The glass is taller than 16:9, so when its width matches a 16:9 window its
  height more than covers it. A 16:9 episode stood in the glass at the glass's full width is letterboxed in the
  tube at rest and fills the window exactly when the glass does.
- To reach a 1700 px glass the master was written at 0.764 of its pixels, a hair over the 0.75 ruling above.
  Its ink edge measures the garden plate's own figure (the rounds give the number).
- `tv-face-p.webp` is **not** a second design. The brief's phone layout (3.3) describes the set with "its knobs
  in a row under" the glass, which is look A's own upright set, and the first version painted one. Beside the
  other two it was a different television, so it was withdrawn. The file is now the front picture itself, at
  1536 px wide, at the top of the 9:16 canvas the brief asks for. What that costs on a phone is the glass's
  width: see the poses below.

**The phone's poses** (`set-above`), for a frame `W` wide. Both keep the glass in the top 42% at 390 x 844 and
430 x 932.

| Pose | Draw the file | The glass is | On 390 x 844 |
|---|---|---|---|
| Whole set | `W` wide, its top at the frame's top | 62% of `W` wide, from 26.5% to 77% of `W` down | 241 px wide, from y = 103 to 301 (12% to 36%) |
| Closer | to be measured in the phone round | | |

**Sharpness limits these give** (1.25 CSS px to a file px): the glass of `tv-face.webp` may be drawn up to
2129 CSS px wide, which covers a 1920 px window and not a 2560 px one: there the glass stops at 2129 px and the
set's own bezel is seen round it, 215 px each side. Drawn the width of a 390 px phone, `tv-face-p.webp` has 3.9
file px to a CSS px. Its glass is 951 x 778, so it may grow
to 972 CSS px tall: enough to cover an 844 px screen (at 1.08) and a 932 px one (at 1.20), and no taller.

## The screens' shadows: the rule, the template, a worked example

**The rule for the picture, so the engine needs no number of its own.** A shadow's picture is exactly three
times as wide and three times as tall as the box of the flat it belongs to, with the object in the middle
third each way. So if the flat's box at rest is `[x, y, w, h]`, the shadow is drawn at `[x - w, y - h, 3w, 3h]`,
by the same projection, on both screens, between the field and the plate. The margin is where the glow dies
away. If an object's glow or beam needs more room than that, give its flat a larger box with transparent
margin; do not change the rule.

**What a shadow is made of.**

1. The silhouette: the object's own alpha, so the real object is uncovered in exactly the shadow's outline. It
   is blurred by 0.4% of the picture's width, as a shadow through paper is, in ink plum `#261A2A` at 80%.
2. The object's own light: the parts of the object that are its lamp (the lantern's paper, the television's
   glass, the projector's lens) are not dark. They are pale (`#FFF4DE` for a warm lamp, `#EEF3FF` for the
   television) and lie under the silhouette, so the lantern's bars cross its lit paper.
3. The glow: the lit parts blurred at 3% and at 9% of the picture's width, added together, at most 80%. It is
   the only light on the screens, and there is no second one.
4. The window: every alpha is multiplied by a smooth ramp that is 0 at each edge and 1 from a tenth of the way
   in. This is what makes rule 3 of the screens true, and the script refuses to write a file whose outermost
   rows or columns are not all 0.

**The template.** One script makes any chapter's shadow from its own cut-outs. Copy it into the chapter's tools
(`scripts/tools/tea/<id>/shadow.mjs`), write the small config beside it, and run it with the repo's `sharp`.

```js
// A screen shadow from an object's own cut-out: node shadow.mjs <config.json> <out.webp>
// The picture is three times the object's box each way, the object in the middle third. Alpha is 0 on all four edges.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const [cfgPath, out] = process.argv.slice(2);
const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
const px = cfg.px ?? 1.2;                                   // pixels for each board unit
const [bw, bh] = cfg.box;                                   // the object's box, in board units
const W = Math.round(bw * 3 * px), H = Math.round(bh * 3 * px);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const INK = hex(cfg.ink ?? '#261A2A'), GLOW = hex(cfg.glow ?? '#FFF4DE');
const smooth = (lo, hi, x) => { const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo))); return t * t * (3 - 2 * t); };

const solid = new Float32Array(W * H), lit = new Float32Array(W * H);
for (const part of cfg.parts) {                             // each part: its cut-out and where it stands in the box
  const [x, y, w, h] = part.at.map((v) => Math.round(v * px));
  const { data } = await sharp(part.src).ensureAlpha().resize(w, h, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const mask = part.lit && typeof part.lit === 'string'
    ? await sharp(part.lit).resize(w, h, { fit: 'fill' }).greyscale().extractChannel(0).raw().toBuffer() : null;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const s = (j * w + i) * 4, X = Math.round(bw * px) + x + i, Y = Math.round(bh * px) + y + j;
    const a = data[s + 3] / 255, luma = 0.299 * data[s] + 0.587 * data[s + 1] + 0.114 * data[s + 2];
    const l = mask ? mask[j * w + i] / 255 : (part.lit ? smooth(part.lit - 25, part.lit + 25, luma) : 0);
    const k = Y * W + X;
    solid[k] = Math.max(solid[k], a * (1 - l)); lit[k] = Math.max(lit[k], a * l);
  }
}
const blur = async (f, sigma) => {                          // a blurred copy of one channel
  const b = Buffer.from(Uint8Array.from(f, (v) => Math.round(v * 255)));
  const r = await sharp(b, { raw: { width: W, height: H, channels: 1 } }).blur(Math.max(0.3, sigma)).extractChannel(0).raw().toBuffer();
  return Float32Array.from(r, (v) => v / 255);
};
const soft = await blur(solid, W * 0.004);                  // the silhouette, a little soft, as through paper
const core = await blur(lit, W * 0.004);                    // the object's own light
const near = await blur(lit, W * 0.03), far = await blur(lit, W * 0.09);

const rgba = Buffer.alloc(W * H * 4);
for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
  const k = Y * W + X;
  const edge = smooth(0, 0.1, Math.min(X, W - 1 - X) / W) * smooth(0, 0.1, Math.min(Y, H - 1 - Y) / H);
  const g = Math.min(1, 0.92 * core[k] + 0.9 * near[k] + 1.6 * far[k]) * (cfg.glowStrength ?? 0.8);
  const d = Math.min(1, soft[k]) * (cfg.inkStrength ?? 0.8);
  const a = (1 - (1 - g) * (1 - d)) * edge;                 // the dark silhouette lies over the glow
  const mix = d + g * (1 - d) > 0 ? d / (d + g * (1 - d)) : 0;
  for (let c = 0; c < 3; c++) rgba[k * 4 + c] = Math.round(INK[c] * mix + GLOW[c] * (1 - mix));
  rgba[k * 4 + 3] = Math.round(a * 255);
}
for (let X = 0; X < W; X++) if (rgba[X * 4 + 3] || rgba[((H - 1) * W + X) * 4 + 3]) throw new Error('alpha on the top or bottom edge');
for (let Y = 0; Y < H; Y++) if (rgba[Y * W * 4 + 3] || rgba[(Y * W + W - 1) * 4 + 3]) throw new Error('alpha on a side edge');
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(out);
console.log(out, W + 'x' + H, 'object box in the picture:', [W / 3, H / 3, W / 3, H / 3].map(Math.round).join(', '));
```

The config names the box of the flat in board units, how many pixels to give each unit, the glow's colour, and
each part with the place it has inside the box. A part's `lit` is either a luminance (pixels of the cut-out
brighter than it are the object's lamp) or the path of a mask picture, white where the lamp is.

```json
{
  "box": [450, 200],
  "px": 1.2,
  "glow": "#FFF4DE",
  "parts": [
    { "src": "lantern.png", "at": [0, 6, 107, 194], "lit": 150 },
    { "src": "kettle.png", "at": [196, 0, 254, 200] }
  ]
}
```

**The worked example** is `shadow-example.webp`, made by exactly that script and that config: a floor lantern
and a low table with its kettle, standing together as one group 450 by 200 board units. The lantern was cut
from look B's room plate and the table is look B's own prop, both read from the frozen copies. The picture is
1620 x 720, the group stands in its middle third (x 540 to 1080, y 240 to 480), and its alpha is 0 on all four
edges. It is an example and a placeholder for the stub. The chapter that owns the lantern makes its own from
its own flats.

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
   green and thin there, broken for about 250 px near the lower corner, and the cream beside it had a green
   cast 60 px wide. The cast is taken out of the cream, and one unbroken ink line is now drawn round the whole
   hole (at its thinnest 11 px on `tv-face.webp`). The build refuses a file with a gap in that line.

## Generation log

Tool: Higgsfield `generate_image`, model id `nano_banana_pro` (every job reports its engine as `nano_banana_2`).
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
