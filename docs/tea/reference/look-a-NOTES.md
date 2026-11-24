# SHOJI: the tea house's architecture organises the page

Prototype of /tea/ (hero, Start here, I Love My Evening Television, its closing strip, the opening of AI video & film).
Written before any code; held to everywhere after.

## The medium

Exactly two surfaces, and one building.

### 1. The world (what you look at)
- Made of: painted plates in the garden's hand. Flat gouache shapes, an uneven dark ink outline, soft shading
  inside each shape. Indigo, plum, moss; lantern amber only where there is light.
- It is fixed behind the page. It never scrolls with the text. It changes only when the building changes it.
- Light: ONE source per scene, and it is always the scene's subject. Garden: the door. Room: the floor lantern.
  Alcove: the television. Inside the set: the picture. Screening room: the projector's beam.
- Nothing you read is printed on the world, with one exception taken from the reference: the giant chapter word and
  its single statement line, in lamp-lit cream, set on the calm dark area each plate is painted to have.

### 2. The paper (what you read)
- Made of: washi. Warm off-white with long fibres, a deckle edge on all sides, never a rounded corner, never a
  border line. A sheet is an object: it is narrower than the room, the world shows round it, and it casts one soft
  shadow, falling away from the scene's light.
- Everything read sits on paper: the title slip, the rail, the speech bubble, the prints' captions, the channel
  card, the clock tag, the closing strip.
- A picture on paper is a print pasted to the sheet: a thin ink keyline, a hair of shadow, hung a fraction off
  square. Never a rounded card.
- Ink on paper is near-black plum (#231F2B). No grey text boxes, no blur, no glass.

### The building (what moves the world)
- Cedar and paper. Shoji screens are the only wipe: two screens slide in from the sides, meet at the post, the room
  behind is changed while they are shut, and they slide apart on the next room. They pass in front of everything
  but the rail, so what is behind them is revealed, not faded in.
- Within a chapter you go further in by pushing INTO THE LIGHT SOURCE until it is the frame: the camera walks up the
  stones to the lit door; it pushes into the television's glass until the set's face is the whole page. No frame on
  the way is ever empty.

## How each kind of thing moves
| Thing | Moves like | Never |
|---|---|---|
| Camera | glides: one slow push toward the light, a pure function of scroll; never past the point where the ink line softens | swims, follows the pointer, rotates |
| Screen | slides sideways on its track at an even pace, eases only at the ends | fades, bounces |
| Sheet | rises with the page; a print on it settles the last few pixels and a fraction of a degree as it arrives | flips, springs, scales up |
| Petal | drifts down and to the right, slowly, a few at a time | swirls, bursts |
| Lantern | breathes: its glow swells a few percent over four seconds | flashes |
| Television | flickers: only its light changes, quickly and slightly; a channel changes through the tube's pale light | shakes, tears, shows noise or scanline effects |
| Portrait | rises out of its coin once, eased, and stays | wobbles |

No pointer parallax, no spring, no spin, no scale-bounce. One easing for anything timed: cubic-bezier(.4, 0, .2, 1).

Two exceptions to this table, both in the same half-screen of scroll, the push into the television (added in rounds
1 and 4, named here so the rules stay honest): the alcove is enlarged past the point where its ink line softens
(under the painted face that is taking the frame), and the painted face itself starts turned 11 degrees about the
vertical and 4 about the horizontal, to sit in the turned set, and squares up as it grows. Nothing else on the page
rotates in depth.

## Type (the site's own faces, kit/fonts)
- Giant chapter word: Zen Maru Gothic 700, clamp(56px, 10.6vw, 168px), line-height .92, tracking -0.025em, cream on the
  world. A long name is broken into a small first line and giant last words.
- Statement: Georgia 400, clamp(19px, 1.7vw, 24px), one line of thought, max 34ch.
- Titles on paper: Zen Maru Gothic 700, ink. Lines on paper: Georgia 400. Labels: Karla 600, 11.5px, uppercase,
  tracked .16em. Numbers, ids, the clock: JetBrains Mono.

## The one accent
Vermilion (#C8402A). Allowed in exactly three places: the seal (one per sheet), the mark beside the current chapter in
the rail, and the keyboard focus ring. Links are ink with an ink underline.
THE ONE SANCTIONED BREAK: at 20:00 in the television chapter the vermilion leaves the seal and takes the picture.
For that span only, the seal and the rail mark are ink and the world is a two-colour print, vermilion and ink.

## The transition between chapters
Shoji shut, world changed behind them, shoji open. The next world's light warms the paper of the screens before
they part. The giant word is already standing in the room when the screens open.

## Repeatability
Every scroll-driven value is a pure function of scroll position (no lerp toward a target). Ambient motion is a
function of one clock t; `?still=1` pins t to a constant, puts every triggered entrance in its end state and shows
posters instead of loops. Petals are seeded. The 19:40 to 20:00 clock is derived from scroll, never from wall time.
`?y=0.37` is applied after fonts and layout are final.

---

# Build log

Pictures generated: see gen/LOG.md (the image model through Higgsfield, the garden plate as the style reference).
v1 (all five sections, end to end) stood before round 1. Frames: `?y=<fraction>&still=1`, desktop 1440x900, phone 390x844.

## Round 1
Frames read: desktop y 0, 0.03, 0.085, 0.205, 0.245, 0.62; phone y 0, 0.06, 0.16, 0.21, 0.27, 0.45, 0.62, 0.8, 0.99.
The three weakest things:
1. **Two blank spreads.** Passing inside went through a frame of nothing but flat amber (y 0.085), and the push into
   the television through a frame of nothing but pale blue. A page of a picture book is never empty.
   Fix: the amber bloom is gone. The house's lit screens slide shut across the garden while the camera is still
   walking, and open on the room: the same device as every other chapter change. Into the television is now one
   continuous push into the glass: the alcove grows until the set's painted face (the same set, drawn flat) has taken
   the frame, its screen still showing the moon; then the channel changes. Rule reworded: you go further in by
   pushing INTO THE LIGHT SOURCE until it is the frame.
2. **The first scroll shows two lists at once** (the title slip leaving, the rail arriving), and on the phone the slip
   buries the house and the television; the phone also scrolled sideways by 8px (the deckle of the sheet).
   Fix: the rail waits until the slip has left. Phone: the slip starts at 69% of the first screen, picture above it;
   horizontal overflow clipped at the root.
3. **The rail is a bright scrap in every frame**, and the television's face is muddy grey.
   Fix: the rail is paper in shadow (it hangs on the doorpost, away from every lamp), slimmer and smaller. The face is
   redrawn: cedar case, warm cream bezel, no dirty haze.

## Round 2
Frames read: desktop y 0, start+0.75, hello, start sheet, tv+0.8, dial+2.45, dial+3.4, dial+4.5; phone start+0.75.
(Round 1's fixes held: the screens shutting on the garden and the push into the glass are pictures at every step.)
The three weakest things:
1. **Start here was one huge blank sheet** that hid the room for three screens, with the posts stacked on it like a
   blog list. Fix: three prints, each its own sheet (picture pasted in, a big ink numeral, title and one line in the
   margin, its seal), laid across the room left, right, left. The room and its lantern stay in the picture between
   them, and each sheet settles as it arrives.
2. **The speech bubble sat on the room's one lantern** and read as an interface box. Fix: a narrower bubble that
   stops short of the lantern; the light source is never covered by paper at rest.
3. **The channels were five identical frozen frames, and the card had dead paper under short lines.** Fix: the camera
   glides on each picture while its channel is on (a 5% push, read off the scroll); the card keeps one size and the
   link always sits at its foot. Also: the title slip hangs from a thread and is a little narrower.

## Round 3
Frames read: desktop hero+0.45, hero+1.2, hero+1.9, start+0.3, tv-0.45, also+0.1, next+0.45, next+1.0; phone y 0.
(Round 2's prints hold: print 2 against the dark room with the lantern beside it is the best spread of the start.)
The three weakest things:
1. **The rail was a grey sticker on the lawn.** It arrived during the walk up the stones, where the index had only
   just been shown, and the plain darkening had turned warm paper cold grey. Fix: it arrives with the first room,
   at the moment the screens shut; the shadow on it is warm (sepia, not grey).
2. **The closing strip was a default row of thumbnails on a slab.** Fix: it is a handscroll: a cedar roller with
   its two caps at the right end, the paper running under it, the series' name as its small tag.
3. **The television in the garden did not read as lit**: it cast nothing. Fix: a pool of its cool light lies on the
   grass in front of it and flickers with the tube; the set is 8% larger.
   (Found on the way: on the phone the painted face showed before the push began, because it was keyed to its size.
   It is keyed to the push now.)

## Round 4
Hard rules measured this round (scripts in the build's work folder, not shipped): frame rate, repeatability (the same
`?y=&still=1` URL loaded twice, 28 frames, pixel-identical), reduced motion (0 running animations, 0 playing loops,
frames static), alt text, focus ring, links.
Frames read: desktop y 0, start-0.02, hello, dial+3.5, next-0.4; phone hello, dial+4.5.
The three weakest things:
1. **The shut screens were an empty wall of lattice, three times over**, a quarter of it plain board. Fix:
   shadow-play. On the paper of the right-hand screen stands the silhouette of the light the next room is built
   round: the lantern and the kettle (amber), the little television with its tube glowing (blue-white), the film
   projector and its beam (pale). The page tells you what is behind the screens before they part. The board is cut
   down by framing the screens 16% taller.
2. **The painted face looked pasted on** while it grew out of the turned set. Fix: it starts turned the way the set
   is turned (11 degrees about the vertical, 4 about the horizontal) and squares up as it takes the frame.
3. **Nothing drifted in the screening room.** Fix: seven motes of dust rise slowly through the projector's beam
   (compositor-only CSS; still under `?still=1` and reduced motion).

## Round 5
Frames read: 1920x1080 y 0, start prints, dial+2.4, also-0.4; 1440x900 hero+0.25, dial+0.45, next+1.2; phone dial+1.4.
Also checked: the loop plays in view (VP9 here, h264 where there is one), loops, pauses off screen; two frames 400 ms
apart differ in the first second (petals, the tube, the door's light).
The three weakest things:
1. **The foreground cherry's trunk under the title slip read as a signpost holding the slip up.** Fix: the
   foreground cherry is re-staged as a canopy hanging into the top-left corner, trunk out of frame; the slip hangs by
   its thread in the blossom, like a paper strip tied to a branch.
2. **On a 1920 screen the paper was undersized**: fixed-pixel slips on a picture that had grown. Fix: from 1680px
   up the paper grows with the room (slip, card, rail, clock and their type a quarter larger).
3. **Captions broke badly and the channel card sat on the picture's subject.** Fix: titles are balanced (no widow
   under a two-line title); the card is tucked lower and further left, nearer the bezel's corner.

## Round 6
Frames read: desktop start+0.42, tv+0.42, dial+4.2, dial+5.25; phone hello, prints; then start-0.02, start+0.3,
tv+0.28, next+0.28, 1920x1080 dial+1.4, phone start+0.3 and tv-0.02 after the fixes.
The three weakest things:
1. **The shadow travelled with the screen**, so while the screens parted there were two lanterns (and two
   televisions) in the frame. Fix: each shadow now stands exactly where its object stands in the room behind
   (placed from the plates' own geometry at every screen size) and does not move: the sliding screen wipes it away
   and uncovers the real thing in the same place. At the half-way frame the lantern is half shadow, half lantern.
2. **The rail cut three chapter names short with dots.** Fix: long names wrap with a hanging indent; nothing in the
   rail is truncated.
3. **Craft in the first paint and in the card:** the text faces swapped in after the first paint, and on a large
   screen a link's arrow dropped to a line of its own. Fix: the three text faces are preloaded; each arrow is tied
   to its link's last word.
   (Found by the repeatability check after this round: the speech bubble's tail, a clipped box, was anti-aliased
   differently on about one load in five. It is a plain border triangle now; 28 frames identical again, and the
   frame it was in identical six loads out of six.)

## After round 6 (a second reader's pass over the finished page)
- The shadow-play lights were cut off square where their pictures ended (the lantern's glow, the pale box under the
  television, the projector's beam ending in a line). Every light and shadow now dies away to nothing inside its
  picture (checked: alpha 0 on all four edges), and the three shut-screen frames were re-read at 100%.
- On the phone a shadow that straddled the post was cut in half by it. Each shadow is now on both screens, so it is
  whole, and each screen wipes its own half away.

# Where it stands

## Measured (headless Chromium, SwiftShader: software rendering, no GPU)
- Frame rate, scripted scroll top to bottom at 1920x1080, 40 s, 541 px/s, ambient animation running:
  **median 56 fps, worst second 33 fps** in the last run before the shadow fix (the pale screens opening on the
  screening room; the push into the television next at 35). Across the runs made during the build the median was
  56 to 60 and the worst second 30 to 36; the final run's figures are at the foot of this file. Longest single
  frame 83 to 150 ms. These numbers are limited by software rendering: every
  moving thing is a transform or an opacity on its own layer, the one canvas (petals) is 2D, there is no WebGL,
  no filter, blend mode or mask on anything that moves.
- `?y=` with `?still=1`: 14 positions x 2 sizes, each loaded twice in fresh pages with different waits: pixel-identical.
- `prefers-reduced-motion`: 0 running animations, 0 playing loops, two screenshots 700 ms apart identical at six
  positions. Scroll-driven glides snap instead of travelling (camera, screens, the push); channels cut.
- 390x844: no sideways scroll at any tested position; every section opens on a picture.
- Requests: localhost only (no library, no CDN). 15 outbound links, all hrefs from content.json.
- Images all carry alt (decorative plates empty, content pictures described; the five channel pictures use the
  lore's own captions). Focus ring: 2px vermilion on paper.
- Folder 30 MB (27 MB of it the five raw generated PNGs in gen/raw; the page itself, assets/ plus index.html, is
  3.1 MB). Loops: one, 0.40 MB VP9 + 0.15 MB h264.

## The three weakest things still on the page
1. **The push into the television.** For about half a screen of scroll the flat painted face sits inside the kit's
   rendered 3D set: two ways of drawing in one frame, and the alcove behind is enlarged past the point where its ink
   line stays sharp (the rule "never past the point where the ink line softens" is bent here, under the face).
2. **Two of the three Start-here prints are the kit's 640x360 previews** shown about as large as they can go; on a
   large or high-density screen they are soft beside the painted room, and only one of the three has a loop.
3. **The rail is still a slip of paper in the corner of every frame**: thirteen lines, ten of them inert in this
   slice. Inside the television it lies across the bezel's corner. It is quiet in tone, not in size.

## Things to know
- E5: content.json has `released: null` for THE SMALL ONE. The card says "not out yet" (never "released").
- "AI video & film" has no lede in content.json: the opening shows the live count, "16 posts", and nothing invented.
- Link text is always real copy: a post's own title (start, strip), the post title under each episode, the series
  name under 20:00 (its course page). The only words on the page that are not from content.json are the alt texts.
- Georgia is not installed on the build machine, so the frames it produced show Liberation Serif where a reader's
  machine will show Georgia (wider; the layouts leave room for it).
- This Chromium has no h264, so the loop was checked as VP9; the h264 source is the kit's file, untouched.
- `assets/img/garden-mid.webp` (the kit's uncut mid plate, 74 KB) and four spare deckle strips are not referenced by
  the page; they were left in place rather than deleted.
- Without JavaScript the world does not draw (the plates are placed by script); the text content is all in the HTML.
- Not seen by a headless phone check: on a real phone the address bar collapsing is a resize, the page re-measures on
  every resize, so the world will re-fit by up to about 10% on the first touch scroll. Untested and unfixed here.

## Final run (after every change above)
- Frame rate, 1920x1080, 40 s scripted scroll, software rendering (SwiftShader): median 59 fps, worst second 35 fps (screens shutting on the garden), longest frame 83 ms.
- Repeatability: 28 frames identical on reload. Reduced motion: nothing running, nothing playing, frames static.
- Sweep at 1440x900 and 390x844: no console error, no failed or foreign request, no sideways scroll.
- Server stopped. Folder 30 MB.
