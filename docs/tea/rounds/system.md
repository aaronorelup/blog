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
