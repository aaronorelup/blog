# Generated pictures: log

Tool: the Higgsfield MCP tools (`models_explore` recommend, `media_upload` + curl PUT + `media_confirm`,
`generate_image_batch`, `jobs_wait`). Model for every job: the image model (its name left out of this copy), chosen
because it takes reference images. Settings for every job: resolution `2k`, thinking_level `high`, one image per
job, paid with credits (2 each), two reference images with role `image_references`:
- `style-garden-night.jpg`: kit/plates/bg-far-night.webp scaled to 2048x1152
- `style-garden-crop.jpg`: a 2x crop of the same plate round the house (to show the line)

Budget: 10 stills, rejects counted. **Tally: 5 generated, 5 kept, 0 rejected.**
Rules held: stills only; no people or characters; no lettering; each judged at full size beside a crop of the garden
plate at the same scale before it was kept. Raw results as returned are in `gen/raw/`; what the page uses are the
graded WebP copies in `assets/img/`.

---

## 1. The room inside the door
- Job `00f2df05-3a0f-427a-b7fa-ccd8f9dbd5c1`, aspect 16:9, result 2752x1536, file `raw/g01-room.png`
- Used as `assets/img/room.webp` (graded 10% darker, 8% less saturated, 2560 wide): the world of "Start here".
- Verdict: KEPT. Same line weight, same flat shading as the garden.

Prompt, verbatim:

> Paint a NEW picture in exactly the style of the two attached reference paintings, as if by the same hand on the same evening: flat gouache colour shapes, a hand-drawn dark ink outline of slightly uneven weight around every shape, soft shading inside the shapes, clean and simple like a 2D animation background or a picture-book spread. No photorealism, no texture noise, no 3D render look. Night palette only: deep indigo, plum, dusty mauve, moss green, dark warm cedar brown; the single bright colour is warm lantern amber.
>
> SUBJECT: the inside of the same small Japanese tea house at night, seen straight-on from a very low viewpoint at floor level just inside the entrance. A quiet tatami room. Back wall: on the right third a tokonoma alcove with a rough cedar corner post, a plain blank hanging scroll (pale paper, nothing on it) and one small vase with a single cherry blossom branch; on the left two thirds, closed shoji paper screens in dark cedar frames, unlit, dim blue-grey paper with night behind them. On the tatami, right of centre, stands ONE andon floor lantern (square wooden frame, paper shade) glowing warm amber. It is the ONLY light source: its pool of light falls on the tatami around it and fades quickly. The whole left half of the room and the ceiling beams stay in calm deep indigo-plum shadow with very little detail (a large calm dark area). A low dark wooden tea table with a small iron kettle and two cups beside the lantern, two flat floor cushions. Restful wide composition with a lot of empty tatami floor in the foreground.
>
> Absolutely no people, no animals, no characters, no figures, no faces. No text, no lettering, no calligraphy, no signature, no watermark, no border.

## 2. The alcove
- Job `587b26da-0437-4e61-8414-9710490814a5`, aspect 16:9, result 2752x1536, file `raw/g02-alcove.png`
- Used as `assets/img/alcove.webp` (graded 8% darker, 7% less saturated): the world of "I Love My Evening
  Television". The kit's own television is set on the lit spot; nothing in the plate was repainted.
- Verdict: KEPT.

Prompt, verbatim:

> Paint a NEW picture in exactly the style of the two attached reference paintings, as if by the same hand on the same evening: flat gouache colour shapes, a hand-drawn dark ink outline of slightly uneven weight around every shape, soft shading inside the shapes, clean and simple like a 2D animation background or a picture-book spread. No photorealism, no texture noise, no 3D render look. Night palette only: deep indigo, plum, dusty mauve, moss green, dark warm cedar brown.
>
> SUBJECT: a close, straight-on view of the tokonoma alcove of a small Japanese tea room at night, seen from floor level. The alcove fills the RIGHT half of the picture: a raised cedar floor board one low step above the tatami, a rough natural cedar corner post at the alcove's left edge, a dusty plum plaster back wall. The middle of the alcove's floor board is EMPTY: a clear empty space where an object will be placed later. From that empty spot a cool pale blue-white glow spreads, as if a small screen stood there: the cool light lies on the board, climbs the back wall and touches the post, and fades quickly. It is the ONLY light in the picture; the room's lantern is out. High on the alcove's back wall hangs a narrow blank hanging scroll: plain pale paper, nothing written or drawn on it. The LEFT half of the picture is the dark wall of the room with closed unlit shoji screens in deep indigo shadow and very little detail (a large calm dark area). Foreground: dark moss-olive tatami mats with their cloth borders.
>
> Absolutely no people, no animals, no characters, no figures, no faces, no television, no objects on the alcove floor. No text, no lettering, no calligraphy, no signature, no watermark, no border.

## 3. The screening room
- Job `13231e8b-eaf9-46c3-8a55-708a9a14635f`, aspect 16:9, result 2752x1536, file `raw/g03-screening.png`
- Used as `assets/img/screening.webp` (graded 10% darker, 8% less saturated): the world of "AI video & film".
- Verdict: KEPT. (Three small vent strokes on the projector's base were checked at full size: strokes, not letters.)

Prompt, verbatim:

> Paint a NEW picture in exactly the style of the two attached reference paintings, as if by the same hand on the same evening: flat gouache colour shapes, a hand-drawn dark ink outline of slightly uneven weight around every shape, soft shading inside the shapes, clean and simple like a 2D animation background or a picture-book spread. No photorealism, no texture noise, no 3D render look. Night palette only: deep indigo, plum, dusty mauve, moss green, dark warm cedar brown; the single bright area is pale warm projector light.
>
> SUBJECT: a little home cinema inside a small Japanese tea house at night, seen from a low viewpoint at floor level from the back of the room. On the far wall, right of centre, a large blank sheet of white paper stretched in a dark cedar frame serves as a cinema screen. A small old film projector with two reels stands on a low wooden table in the right foreground, in silhouette; its cone of pale warm light crosses the dark room to the screen, with a few dust motes floating in the beam. The screen is blank glowing paper: no picture and no writing on it. Empty flat floor cushions in two rows on the tatami. Cedar posts and ceiling beams. The beam and the glowing screen are the ONLY light. The left third of the picture and the ceiling stay in calm deep indigo-plum shadow with very little detail (a large calm dark area), with closed unlit shoji screens on the left wall.
>
> Absolutely no people, no animals, no characters, no figures, no faces. No text, no lettering, no numbers, no signature, no watermark, no border.

## 4. The screen
- Job `b4e7c76d-c41f-4f16-8fde-3ef578aeacf0`, aspect 1:1, result 2048x2048, file `raw/g04-shoji.png`
- Used as `assets/img/shoji-amber.webp` (1600x1600): the transition screen, the left panel as painted and the right
  panel mirrored. `shoji-blue.webp` and `shoji-pale.webp` are recolours of it made in PIL (only the lit paper is
  recoloured: television blue-white, projector pale), not new generations.
- Verdict: KEPT.

Prompt, verbatim:

> Paint a NEW picture in exactly the style of the two attached reference paintings (look at the lit paper windows of the house in them), as if by the same hand: flat gouache colour shapes, a hand-drawn dark ink outline of slightly uneven weight around every shape, soft shading inside the shapes, clean and simple like a 2D animation background. No photorealism, no texture noise, no 3D render look.
>
> SUBJECT: ONE single Japanese shoji sliding screen, seen perfectly flat and frontal like an architectural elevation, filling the whole square picture exactly from edge to edge: its dark cedar outer frame runs along all four edges of the picture. Inside the frame, a regular grid lattice of thin dark cedar bars (five columns, six rows of panes) over washi paper. The bottom fifth of the screen is a solid dark cedar board panel. The paper is lit evenly from behind by warm lantern amber light, a little brighter toward the right side, soft and calm, the same amber as the windows in the reference. No perspective, no floor, no wall, no room, no shadow shapes, nothing else in the picture: only the one flat screen.
>
> Absolutely no people, no animals, no characters, no silhouettes. No text, no lettering, no signature, no watermark.

## 5. The picture at 20:00
- Job `44eeae4a-b6d0-4e12-a95d-ac7fe98468aa`, aspect 16:9, result 2752x1536, file `raw/g05-turn.png`
- Used as `assets/img/turn.webp`: what the television shows when the clock reaches 20:00.
- Verdict: KEPT, with one flaw fixed by hand in PIL: a bright vermilion wedge between the house and the right-hand
  tree (the moon's edge showing below the hill line) was painted to the moon's cream.

Prompt, verbatim:

> Re-make the first attached reference painting as a TWO-COLOUR PRINT by the same hand: the same flat shapes, the same hand-drawn dark ink outline of slightly uneven weight, soft shading kept very flat. Use ONLY two inks in the whole picture: vermilion red in three flat strengths (deep oxblood, full vermilion, pale washed vermilion) and black ink. No other hue anywhere: no blue, no green, no purple, no amber, no pink. Unprinted warm cream paper is the lightest tone.
>
> The same view as the reference: the same small Japanese tea house in the centre, the same round cherry tree at its left and the dark trees at its right, the same row of oval stepping stones leading up the lawn to the door, the low hills behind. But the scene is quietly wrong: every paper window of the house is DARK, flat black, unlit. Only the doorway is lit, and it is plain blank cream paper, a bright empty opening. An enormous full moon of plain cream paper, much larger than the house, sits low in the sky directly behind the house, so the roof and the trees stand in black silhouette against it. The sky is flat full vermilion with no clouds and no stars. The lawn is deep oxblood, the stepping stones black. A few small cream petals hang in the air. Calm, still, symmetrical, beautiful and slightly eerie, like a Japanese night woodblock print made by the same illustrator.
>
> Absolutely no people, no animals, no characters, no figures, no faces. No text, no lettering, no seal stamp, no signature, no watermark, no border, no paper edge.

---

## Not generated: drawn for this page, no model
- the washi and its deckle edges (PIL, `washi.webp`, `deckle-*.webp`)
- the little moon picture in the television (PIL, `tv-moon.webp`, `tv-moon-flat.webp`)
- the television's painted face and its knob (SVG baked to WebP, `tvface.webp`, `tvface-tall.webp`, `knob.webp`)
- the three shadow-play silhouettes on the shut screens (PIL, `sil-*.webp`; the television's outline is cut from the
  kit's render)
- the cut of the kit's mid plate into its left and right groups (`garden-mid-l.webp`, `garden-mid-r.webp`: the kit's
  pixels, cropped)
