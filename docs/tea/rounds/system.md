# The shared system (piece 1): improvement rounds on the stub page

Each round: at least three frames of `/tea-next/` with `?y=` (or a chapter's anchor) and `?still=1`, two on a
desktop at 1440x900 from different parts of the page and one on a phone at 390x844, read at full size as a harsh
art director would, beside the garden plate. The three weakest things are named, then fixed. The stub chapters'
pictures are placeholders (`scripts/tools/tea/stub-art.mjs`) that each chapter's builder replaces, so a round
judges the system (the stage, the paper, the type, the index, the screens, book mode) on them, and fixes the
placeholders only where they would mislead a builder.

## Round 1: the generic stub room (desktop at the television's opening frame and two screens into it, phone)

Frames: `#evening-television` and `?y=0.13` at 1440x900, `?y=0.2` at 390x844.

1. **The statement ran over the lantern.** The giant word's line ("Thirty-minute films ...") lay across the only
   light in the frame, which the bar forbids (text on the subject or on the light). The stub lantern now stands
   right of the reading line, between it and the paper's column, in every stub chapter.
2. **The paper's cut edge looked broken.** Steps of two pixels along an edge read as a chip or a misprint, not as
   paper cut by hand. Every step is one pixel now.
3. **The room was a flat field with a ruled line across it.** A wall and a floor of one colour each and a single
   hard horizon read as a placeholder screen, not a room of the house, and left the upper right a quarter of the
   frame of nothing. The stub field is now painted as a room in the same hand: a beam, posts framing the back
   wall, papered panels between them that the lamp lights faintly, mats on the floor.

## Round 2: book mode only (no script on a desktop, reduced motion on a desktop, no script on a phone)

Frames: `#evening-television` without script and `#projects` with reduced motion at 1440x900, `#start` without
script at 390x844.

1. **The phone's still cut its own light in half.** Start here's upright still was a crop of B's room that ended
   in the middle of the floor lantern, the one thing the room is about. The crop is now centred on the lantern.
2. **The rooms took the colour of their light everywhere.** The stub wall and floor were the night mixed with the
   chapter's light, so the Projects room (a pale yellow light) went olive and muddy, and the paper on it looked
   dirty. The brief's rule is that shadows stay indigo and plum: the wall and floor are now the night's own plum,
   and the light is only in the pool and on the papered panels it falls on.
3. **Titles broke at their hyphens.** "Crimson Coil, a 30-" over "minute oil painting show" reads as a typo. A
   hyphenated word in an item's link now stays whole.

## Round 3: the phone only (390x844)

Frames: the top (`?y=0`), `#projects`, `?y=0.5` (the 3D chapter with a slip), `?y=0.021` (the door half open).

1. **The door was a picture torn in two.** On the phone the garden's halves parted with a raw seam through the
   house and nothing to say they were panels. Each half now has a cut edge, a dark ink line and a little shade
   where it parts, as B's sets got in its sixth round.
2. **The subject was small on an upright frame.** The stub lantern stood 105 px tall on a phone, a speck in the
   middle of a wall. It is half as large again on `p`, and the aim moves with it.
3. **The tab's numeral read as a close button.** "X PROJECTS" at the top left of a phone looks like a way out. The
   numeral is now set off by a thin rule from the chapter's name.

## Round 4: 2560x1440

Frames: the top, `#topic-art`, `?y=0.31` (a room between items), `?y=0.026` (the door half open).

1. **Round 3's cut edge drew a line through the house at rest.** The garden's two halves lie exactly on the plate
   until they part, so an ink line on their edges stood in the first frame, down the middle of the house and the
   path. Taken out: the halves are plain again, and making the door a pair of panels is the hero's (3.1).
2. **The room behind the door lost its word.** Start here's word stood at the left of its wall, so while the
   door's halves parted only "art here" showed between them. The stub's word now stands over the middle of the
   wall, where the door opens first.
3. **The index shrank beside everything else.** At 2560 the paper and its type had grown by a quarter (1.2) but the
   bookmark had not, so it read as a thin strip of ticks. It grows with the paper now, and still stays inside its
   gutter (110 of 120 px).
