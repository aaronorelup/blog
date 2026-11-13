# DIORAMA: the page is a paper theatre and the scroll is its camera

A prototype of /tea/ (hero, Start here, I Love My Evening Television, its closing strip, the opening of
AI video & film). The rules below were written before any code and are held everywhere after. Where building
sharpened a rule, the line says so ("amended, round N"); the rounds are at the foot.

## The medium

Exactly two surfaces.

### 1. The world (what you look at)

- **Made of** painted flats in the garden's hand: flat gouache shapes, an uneven dark ink outline, soft shading
  inside each shape; indigo, plum, moss, and lantern amber only where light falls. A scene is a shadow box: three
  to six flats standing at real distances from one another (sky, far, subject, near), never one flat picture.
- **Fixed behind the page.** The world never scrolls with the text. It moves only because the camera moves.
- **Depth is carried by three things and nothing else:** how fast a flat grows as the camera nears it (far flats
  barely change, near flats sweep out of frame), how dark and soft it is (near foliage is a dark, pre-softened
  silhouette; the subject is the only sharp, lit thing), and what overlaps what. (Amended, round 6: the near
  foliage keeps its ink line and is softened only a little; a fully blurred bough read as a smudge and was cut.)
- **One light per scene, and it is the subject.** Garden: the open door. Tea room: the floor lantern. Television
  chapter: the screen. Film chapter: the projector. Light is a warm (or, for the screen, cold) pool that breathes
  slowly; it sits on the flats in front of it and on any paper that passes through it. No second light, no rim
  glows, no neon.
- **Nothing you read is printed on the world**, with the one exception the reference allows: the giant chapter
  word and its single statement line, set in lamp-cream inside the scene's calm dark area, standing in the scene
  as a flat of its own (things nearer than the word pass in front of it).

### 2. The paper (what you read)

- **Made of** washi: warm off-white with long fibres, cut by hand (a slightly uneven edge, square corners, no
  border line, no rounded cards). A sheet is an object nearer the eye than the whole scene: narrower than the
  frame, the world visible round it, one soft shadow under it, down and to the right.
- **Everything read sits on paper:** the title slip, the rail, the speech bubble, captions, the programme card,
  the clock tag, the closing strip.
- **A picture on paper is a window cut in the sheet** with the picture standing a little way behind it (a thin
  inner shadow at the top and left edge, the picture drifting a touch slower than the sheet). Never a card with
  rounded corners.
- **Light on paper:** the scene's light is fixed in the frame, so a sheet is warm where it passes the lantern and
  cool grey-violet away from it. Ink is near-black plum `#231F2B`. No blur panels, no glass.

## How each kind of thing moves

| Thing | Moves like | Never |
|---|---|---|
| Camera | glides: a slow push along one line toward the scene's light, a pure function of scroll | swims sideways, follows the pointer, rotates, shakes |
| Flat (scenery) | slides in its own plane to the wings, straight, eased at both ends, in depth order | fades in place, bounces, spins |
| Sheet of paper | rises with the scroll like a held card and settles: a degree and a half of tilt easing to square (the small slips: bubble, programme cards, the 20:00 slip; the two large sheets stay square because they carry the scene's fixed light) | springs, flips, scales up from nothing |
| Petal | drifts down and across on a slow sine, turning; a few, not a storm | sparkles, trails |
| Lantern | breathes: brightness within 6% over about five seconds | pulses, strobes |
| Television | flickers: its light steps a little, unevenly, about eight times a second | scan-line overlays, RGB splits, tearing |
| Clock | steps a minute at a time with the scroll | spins freely |

Everything on the page is a function of two numbers: the scroll position and the time. `?still=1` holds time at
one fixed instant and `?y=` sets the scroll, so the two together are one exact frame. With
`prefers-reduced-motion` time is held the same way, the camera stops gliding and rests at each scene's key pose,
and scenes change by a plain cut.

## Type

The site's own faces, from the kit.

| Use | Face | Size | Colour |
|---|---|---|---|
| Giant chapter word (on the world) | Zen Maru Gothic 700, line-height 0.9, tracking -0.025em | clamp(52px, 11.5vw, 190px); 15vw on an upright screen | lamp-cream `#F6E7C8` |
| Statement line under it (on the world) | Georgia italic (a count, where a chapter has no line of its own, in JetBrains Mono) | clamp(17px, 1.75vw, 27px) | `#E9DCC3` |
| Title on paper | Zen Maru Gothic 700 | 22 to 40px | ink `#231F2B` |
| One line on paper | Georgia | 16 to 19px | ink at 82% |
| Tiny label, rail, link | Karla 600, uppercase, tracking 0.14em for labels | 11.5 to 13px | ink at 62% |
| Clock, ids, counters | JetBrains Mono 500 | 12px; the clock up to 34px | ink |

A long chapter name is solved by stacking, not shrinking: the small words ride as a first line at a fifth of the
size, and the two heavy words take a line each ("I Love My / Evening / Television").

## The one accent

Noren vermilion `#B5482E` (the door curtain's red). Allowed in exactly three places: the single link of each item
(its underline and its arrow; the words stay ink, amended in round 1 because solid vermilion titles shouted), the
mark of the current chapter in the rail, and the clock when it reaches 20:00. Lantern amber is light, not an
accent: it appears only as light falling on the world or on paper, never as a text or button colour. (The coin's
rim is the site's own lamp colour, as on the live page.)

## The transition between chapters

Two devices, one for each kind of step.

- **Going further in (inside a chapter): through the light.** The scene's one light is an opening, and the next
  place really stands behind it at its own distance: the room behind the doorway, the picture behind the glass.
  From far away the opening is plain light; as the camera closes on it the light thins like a veil, the place
  behind is seen through it, and the opening grows until its edges leave the frame. (Amended, round 1: the first
  version let the light fill the frame as a flat wash. A wash is not a picture, so it was replaced by real depth.)
- **Changing chapter: the flats change, as on a toy theatre.** The old scene's flats slide off to the wings, the
  nearest first and fastest, while the new scene's flats slide on from the other side, the farthest first. A
  sheet of paper is usually crossing the frame while this happens, as the storyteller's hand would. Where the
  place stays the same and only its light changes (the tea room, lantern to television), the dark comes across
  it as one more flat: a sliding screen with a straight edge (amended, round 5).

## Build notes

- One fixed stage holds every scene; only the scenes in view are displayed. Layers move by `transform` and
  `opacity` only (no CSS filter, no mix-blend-mode, no backdrop blur; no WebGL). Softness is baked into the
  near-foliage images. Two things use `clip-path`: each sheet's hand-cut edge (set once) and the glass while the
  camera goes through it. One 2D canvas draws the petals, the fireflies, the dust and the projector's beam.
- Each flat is placed by one small pinhole model: where it appears when the camera is at rest, and how far away
  it stands. The garden's numbers are the kit's own (`plates/manifest.json`): the same plates, depths and opening
  camera as the live hero, pulled back a little so the whole house shows.
- Text and links live in normal document flow on paper, so Tab order, anchors and reading order are the
  document's; the stage holds pictures only (`aria-hidden`).
- All copy and links are baked from `kit/content.json` by `tools/build.py` (not retyped). The asset scripts that
  cut the kit's plates into flats are in `tools/assets/` (kept as a record; they hold this machine's paths; the
  kit's stills and loops were copied in by hand and each loop was given a VP9 twin with ffmpeg); the harness is
  `tools/check.js` and `tools/fps.js`.

## Rounds

Each round: at least four screenshots with `?y=` and `?still=1` (three desktop frames at 1440x900 from different
sections, one phone frame at 390x844), read as a harsh art director against the reference sheets and the garden
plate, the three weakest things named, then fixed.

### Round 1 (frames: hero y=0, the sheet y=0.245, the push into the set y=0.43, phone hero)

1. **The two thresholds were blank light.** Going through the door the frame was a flat amber wash; going into the
   television it was a flat cold wash; and to get there the plate was enlarged far past the point where its ink line
   holds. A frozen frame there was not a picture. Fixed by building both as real depth: the doorway is now a hole
   cut in the house flat, the room stands behind it at its own distance and is seen through the door from the lawn
   (the door's amber is a veil that thins as you come close, so the far view is still the plate's own); the house
   front has a sharp 4x repaint for the last steps; the pictures inside the set stand behind the glass and grow
   with it. No wash is left anywhere on the page.
2. **Hero corners.** The near bough at the top left was a smudge with a straight cut edge, and when the camera was
   pulled back to show the whole house the mid plate's right-hand bushes were sliced by the plate's own edge. The
   bough is re-cut from the blossom only; the bushes are their own flat, set against the frame's corner.
3. **Paper that shouted.** The title slip was a quarter of the frame with a thirteen-line index, post titles were
   solid vermilion, and the rail cut a chapter name short with an ellipsis. The slip is smaller with a two-column
   index, titles are ink with a vermilion underline and arrow, the rail wraps.

### Round 2 (frames: chapter head y=0.34, E1 y=0.47, E3 y=0.56, phone E2 y=0.5)

1. **The television chapter's room was one flat blue**, the set looked pasted on (no contact with the mats) and the
   statement line ran over the dark lantern. Relit with plum kept in the shadows and the cold pool moved under the
   set; both sets have a contact shadow; the line sits under the word, clear of everything.
2. **E3 was a black void** (the first-light frame is nearly empty at full bleed). It now shows the frame after the
   turn, the cursor standing over the city, cropped past its letterbox bars.
3. **Phone.** The rail tab was cut to nothing (its paper edge was measured while it was empty), and the set around
   the screen was soft because it was drawn small and enlarged. The tab is re-cut when its label changes; both
   television sets are laid out at their own pixel size.

### Round 3 (frames: the coin y=0.16, 20:00 y=0.72, deep in the garden y=0.78, the cinema y=0.9, phone start y=0.2)

1. **Deep in the garden-in-the-garden the picture went to mush**: each level's television was a 390-pixel copy
   baked into its plate and enlarged three times over. Every level's set is now drawn from the full-size render,
   placed over its plate, so the thing the camera is flying at is always sharp.
2. **After the last set went dark there was an empty black frame.** The tube now keeps one point of light for a
   moment (the only thing on the stage), and the dark stage is held only until the next scene's flats cover it.
3. **The projector stood there dark**: the cloth was lit but the beam only came on after the strip had gone. The
   beam now comes on as the projector lands.

Also measured here: with the sky hidden once the house front covers it, the 1x house flat hidden once the sharp
repaint covers the frame, and the room's ceiling-and-floor backdrop drawn only when the plate does not fill the
frame, the scripted scroll went from a worst second of about 20 frames to about 28 (software rendering).

### Round 4 (frames: mid-walk y=0.035, at the door y=0.06, the sheet y=0.215, phone sheet y=0.24)

1. **The sheet said everything twice and its pictures lay flat.** The chapter's label and line stood in giant type
   on the wall and again as a header on the sheet; the header is gone and the sheet starts with its first picture.
   The windows now read as holes in the paper: a lit cut edge below and to the right, deeper shade inside at the
   top and left.
2. **The fireflies looked like interface dots** (a hard disc with a ring). Each is now one small warm point with a
   soft breath of light, smaller, fewer pixels.
3. **Nothing told you the set has channels.** The clock tag carries a dial: five marks, the one that is on filled
   in. At 20:00 none of them is.

The page was also shortened (hero, chapter head, the turn and the last scene) by about a screen and a half.

### Round 5 (frames: the coin y=0.165, the chapter change y=0.30 to 0.316, 20:00 y=0.745, phone coin y=0.19)

1. **The speech bubble was a card.** It has a tail toward the coin (to the left on a wide screen, upward on a
   phone). On a phone the title slip also came back into the room after leaving; it is hidden once it has gone.
2. **At 20:00 the second garden did not look wrong at a glance**: the house was dark but the lawn was lit as
   before. The set is now the only light in that garden; the rest falls into dark.
3. **The change from Start here to the television chapter slid the whole lit room sideways off an identical dark
   one**, so for a moment there were two rooms. Now the room stays where it is and the dark comes across it like a
   sliding screen, one straight edge, the lantern unlit behind it; the old props leave first, the set and the word
   come on after.

### Round 6 (frames: hero at 1920x1080, early walk y=0.02, a channel change y=0.5, E4 y=0.62, E5 y=0.67, a
reduced-motion sweep, and phone frames at y=0, 0.343, 0.472, 0.72, 0.872, 0.956)

1. **The near bough over the cherry tree was still a smudge**: at 1080p its soft dark showed compression blocks, and
   re-cut with its ink line it showed ragged holes where the trunk had been. It sat on the prettiest thing in the
   frame. It is gone. The near foliage is now the two dark bushes at the lower corners, re-cut with their ink line
   kept and only a little softness, large enough to read as standing in front of the lens.
2. **E5's card lay across the film's own title lettering.** For that film the card rides high, above the lettering.
3. **A channel change butted two pictures together with no edge**, unlike every other flat on the page. Each set
   now has a dark cut edge, as the sliding dark in the room does.

Also in this round: the giant "Start here" was being crossed by the coin and the bubble; it now leaves for the
wing as they come up. The title slip is moved off, not hidden, so the page's h1 stays in the accessibility tree.

### After the rounds: a review pass on what stills cannot show

No new design; faults that only live running, the keyboard or reduced motion reveal.

- **Live:** the clouds drifted by a fixed speed for as long as the page was open and would have run out of flat
  after about two minutes; the drift is now a slow sway inside the flat's own margin. The camera had a small
  time-based breath, against the rule that it is a function of the scroll only; removed. The harness now checks
  that the opening frame is moving within a second and that a full live scroll throws nothing.
- **Keyboard:** the rail's links came second in the Tab order while the rail was still in the wing, so focus went
  to something off the frame. A rail or title slip that holds the focus now comes on. The harness checks that the
  first nine Tab stops are outlined and inside the frame.
- **Reduced motion:** the slips still tilted, the windows still drifted, the coin still popped and the slip, rail
  and clock still slid with the scroll, and the giant "Start here" was always in the wing. All are now at rest
  poses or cuts, and the word is on its wall.
- **The dark set:** the last picture now goes dark as the closing strip's edge is already coming up, so the empty
  stage is shorter (it is still there for a moment: see below).

## State at hand-over

**What it is.** One page, `index.html`, with `assets/` (fonts, css, js, img, video) and nothing from any other
host. 4.3 MB. Loops: three, each with an H.264 and a VP9 file, the largest 0.47 MB.

**Checks (`tools/check.js`, all passing on the final build):** the same `?y=&still=1` address gives the same
pixels twice (four positions); every request goes to the one host and none fails; the five section ids exist;
the links on the page are exactly the eleven in `content.json`; every picture in the document has alt text; every
title and line from `content.json` is on the page; the loop decodes and plays; a 390-wide phone never scrolls
sideways; with reduced motion two frames half a second apart are identical; the first nine Tab stops are outlined
and inside the frame; live, the opening frame moves within a second and a full scripted scroll throws nothing.

**Frame rate.** A time-driven scroll of the whole page in 30 seconds at 1920x1080, counting animation frames in
each wall-clock second, three runs: median 48, 44, 49 frames a second; worst second 24, 23, 23. Lowest of the
three: **median 44, worst second 23.** This machine has no GPU: headless Chromium draws through SwiftShader
(software Vulkan), so every painted layer is composited on the CPU. The low seconds are the walk to the door and
the first seconds in the room, where the most large flats overlap. No WebGL is used; nothing is filtered or
blended per frame. On a GPU the same layers are plain textured quads.

**Pictures generated:** 3 (the tea room, the garden cinema, a prop sheet), none rejected. See `gen/LOG.md`.

**Facts for the owner to confirm.**
- The speech bubble is the draft given in the brief, word for word.
- E5 (THE SMALL ONE) is shown as "Not out yet" because `content.json` has `released: null` for it (no release or
  link in the repo). The kit also notes the repo does not call it Episode 5.
- Each film's one line is the first `line` in `content.json`, printed as written (the CSS raises its first
  letter). Each post's one line is its `verdict`.
- "AI video & film" has no line of its own in the site's data, so its statement is the live count, "16 posts".
- The ten chapters outside this slice are listed in the rail and the index as plain words, not links: the data
  gives them no address on this page.
- "Go to the main site" is in `content.json` without an address, so it is not on the page.

**Weakest things still on the page.**
1. For a moment after the last set goes dark the frame is nearly empty: black, the edges of the set, one point of
   light. It is short, and the closing strip is already rising into it, but frozen there it is not a picture.
2. Deep in the walk and deep in the fall at 20:00, what is behind the sharp subject is the kit's plate enlarged
   two to seven times. The subject (the house front, each television) is redrawn sharp; the lawn and trees behind
   it are soft. It reads as distance, but it is softness from enlargement, not painted softness.
3. The three "Start here" pictures are the kit's 640-pixel stills, so the windows are held to about 640 wide; only
   one of the three has a loop. It is the quietest of the five sections.
