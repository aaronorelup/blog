# The hand-reach tool

What it gives you: for every moment of a guitar video, the frets the player's fretting hand can reach, counted from
the capo (`hand_window.csv`), and pictures to check it. It reads the video, stored hand landmarks (21 points per hand
per video frame, already computed) and anchors that YOU set: which fret wires you see where on a few frames. From the
anchors it builds a model of the neck (frets placed by the 12-tone rule from the wires you name), follows the guitar
through the video, and puts the fingertips on that neck.

Nothing here knows the music. The tool can be wrong in three ways, and you check each: the wires are numbered wrongly
(the whole grid one or more frets off), the grid drifts off the real wires, or the hand landmarks are wrong. You look
at its pictures and correct it.

All commands run with one Python:

    PY=/home/user/gtv/tools/venv-video/bin/python
    HR=/home/user/gtv/loop/tools/handreach

Use the paths your task gives for the video (`VIDEO`), the landmarks (`LM`, a `.jsonl` file) and your work folder.
Times are seconds from the start of the video. Pixel coordinates are those of the full video frame.

## Words

- **Wire k**: the k-th fret wire counted from the NUT; the nut itself is wire 0. Always count from the nut, never from
  the capo, when you name wires.
- **Fret k**: the space between wire k-1 and wire k. A finger pressing fret k sits just behind wire k (on the nut side).
- **The capo** is given to you. A capo on fret N clamps the strings at wire N: the capo's wire is N, and fret N is the
  space it covers (its bar sits just on the nut side of wire N).
- **Frets from the capo**: what the window and the overlay numbers use: fret from capo = fret - N. The capo is 0 (the
  open string); fret N+1 is 1. Open strings are always allowed and are not part of the window.
- **String-6 edge / string-1 edge**: the two long edges of the fingerboard: the one under the thickest string (string
  6) and the one under the thinnest (string 1). String 6 is the string nearest the player's face: with the guitar held to
  play and the camera upright, its edge is the upper one in the picture (a camera looking down from the player's
  side can show it differently: follow the thickest string).
- **Shot**: a stretch of video with one camera view. A cut starts a new shot.

## The steps

1. Look at the whole video (contact sheet): shots, cuts, how much the guitar moves, title cards.
2. Set anchors: a keyframe per shot, more where the guitar moves or turns a lot.
3. Track: `neck_track.py` follows the board from each keyframe and checks itself.
4. Window: `hand_window.py` puts the fingertips on the tracked neck.
5. Look at the overlay at keyframes, at the self-check's worst times and at moments you care about.
6. Correct: more keyframes (and track again), or a corrections file for the window.

Budget: for a 3-minute video, `neck_track.py` takes 3 to 8 CPU minutes (more keyframes, more time; with 2 cores, 2 to
6 minutes of wall time); everything else takes seconds. It prints a progress line per keyframe and direction to
stderr: send it to a log (`> track.log 2>&1`) and look at the log's last lines while it runs.

## 1. contact_sheet.py: the video at a glance

    $PY $HR/contact_sheet.py VIDEO sheet.jpg [--every 5] [--t0 T] [--t1 T] [--cols 6] [--width 320] [--crop x0,y0,x1,y1]
        [--track track.json --anchors anchors.json]

Small frames every `--every` s, each labelled with its time. It prints the large frame-to-frame changes (likely cuts
or title cards). Look for: cuts (a new view: each needs its own keyframe), a guitar that moves, tilts or turns,
moments where the nut or the inlays are clear of the hands (good keyframes), black or title frames (nothing to track).
With `--track` and `--anchors` each tile also shows the tracked board outline (cyan, wire 12 marked) or a red border
where the track has no fit: a fast way to see where a track holds and where it is lost.

## 2. Anchors

### frame_ruler.py: read pixel positions

    $PY $HR/frame_ruler.py VIDEO T out.jpg [--crop x0,y0,x1,y1] [--scale 2] [--step 50]

A frame (or a crop of it, enlarged by `--scale`) with a grid labelled in full-frame pixels. Use it to read the four
corners of a rough board outline for `wire_candidates.py`, and to look closely at the nut, the capo or the inlays.

### wire_candidates.py: find the wires on a frame

    $PY $HR/wire_candidates.py VIDEO T QUAD OUTPREFIX [--floor 1] [--slant 0.5]
    $PY $HR/wire_candidates.py VIDEO T auto OUTPREFIX --anchors anchors.json [--track track.json]

QUAD is a rough outline of the fingerboard, 8 numbers `x1,y1,x2,y2,x3,y3,x4,y4`, corners in this order: string-6 edge
at the BODY end, string-6 edge at the NUT end, string-1 edge at the nut end, string-1 edge at the body end. Make it
cover the board from just past the nut (or the frame edge) to where the board meets the soundhole, edge to edge; it
need not be exact. `auto` takes the outline from your current model at time T (after a first keyframe, and from the
track once you have one): the quick way to make further keyframes.

It writes `OUTPREFIX.json` (each candidate: a letter, its two ends `a` on the string-6 edge and `b` on the string-1
edge, its strength) and `OUTPREFIX.jpg` (the frame with the candidates drawn and lettered A, B, C... from the body end
towards the nut). The printed `A@x` is the x of the candidate's end on the string-6 edge (on a slanted board it differs
from the board's middle by some pixels). Each candidate follows the wire's own direction. Some candidates are not wires (a finger edge, the
end of the board, the capo's bar, the nut's two edges, a string reflection); some wires are missed (under fingers,
faint). A wire can be found twice a few pixels apart: name the one that sits on the wire in the picture (try both
and keep the one with smaller residuals). `--floor` is the weakest ridge kept: raise it to 2 or 3 when a clear board
gives many false candidates, lower it to 0.6 when faint wires are missed.

### Naming the wires

Look at `OUTPREFIX.jpg` (crop and enlarge with `frame_ruler.py` where needed) and decide which letter is which wire
number counted from the nut. Ways to know, best first:
- **Count from the nut** when the nut is in view: the nut is the thick light bar where the strings leave the
  headstock; the next wire is 1, and so on. Between fingers you can often still see the wires near the nut.
- **Inlays** (dots on the board face or on the board's edge): single marks usually sit in frets 3, 5, 7, 9, 15, 17,
  a double (or larger) mark in fret 12, sometimes also in 19 or 21; a mark in fret k lies between wires k-1 and k.
  Not every guitar has them, and some put fret 1 or 10 instead of 9: check the count against another cue.
- **The capo**: with a capo on fret N, the wire just on the body side of its bar is wire N.
- **The body join**: on most steel-string guitars the neck meets the body at wire 14 (sometimes 12); on most
  nylon-string (classical) guitars at wire 12. Use it as a check, not as the only cue.
- **Spacing**: the gaps shrink towards the body by about 6 % a fret (each gap is 0.944 times the one before it), so a
  missing wire shows as a gap about twice as wide as its neighbours. Two gaps add up to about 1.94 times the first.

Name at least four wires, far apart (for example one near the nut, one near the body, two between), and never guess
a number you cannot count: leave that candidate out.

A quad drawn by hand gives candidate ends that sit on YOUR outline's edges, so a rough outline costs residuals (up to
10 px at both ends). After the first keyframe at a time is written, run `wire_candidates.py VIDEO T auto ...
--anchors anchors.json` at the same time, name the same wires on the new letters and write the keyframe again (it
replaces the first): residuals usually fall to 1 to 2 px.

### make_anchors.py: write a keyframe

    $PY $HR/make_anchors.py anchors.json --video VIDEO --capo N --kind steel|nylon --add OUTPREFIX.json "D=17,H=12,M=7,R=3,U=0"
        --landmarks LM --snap [--shot t0,t1] [--by "who"] [--note "how named"] [--dry-run]

Adds a keyframe at the candidates file's time to `anchors.json` (created if missing; a keyframe at the same time is
replaced). `--kind` is `steel` for a steel-string guitar and `nylon` for a nylon-string (classical) one: it sets the
board's taper. It prints:
- **residuals**: each named wire's distance in pixels from the fitted model. A few pixels is good. One wire far off
  (more than about a quarter of the gap between its neighbours) is a wrong name or a false candidate: fix it.
- **the keyframe check**: the detector run on the fitted board; the median distance of the candidates from the nearest
  modelled wire as a share of the local fret gap, in the middle of the board and at its edges. Under 0.05 is a good
  keyframe; around 0.25 means the grid does not sit on the wires (a wrong name, or wires named on a false candidate).
- with `--snap`: further wires the detector finds within 0.2 of a gap of the modelled ones are added, growing out
  from the wires you named, and kept only if the check improves. Your named wires always stay, and the numbering
  cannot change. Use it.
- Neither the residuals nor the keyframe check can tell a correct numbering from one shifted by a WHOLE fret (names
  all one too high fit almost as well: the wire pattern repeats). The numbering rests on your count (the nut, the
  inlays, the capo) and on a second cue (the body join). Try a shifted naming with `--dry-run` if in doubt: it will
  fit about as well, so decide by the picture.
`--dry-run` prints everything and writes nothing: try names that way first. `--shot t0,t1` adds a shot range (see
below). Record how you named the wires in `--note` (for example "nut visible, counted 0 to 5; dots at 5 and 7").

### The anchors file

    {"video": ..., "capo": N, "board": {"kind": "steel"},
     "keyframes": [{"t": 60.0, "wires": [{"k": 3, "a": [x, y], "b": [x, y]}, ...], "by": ..., "note": ..., "names": ...}],
     "shots": [[t0, t1], ...]}

`k` is the wire number from the nut; `a` is the wire's end on the string-6 edge, `b` on the string-1 edge (full-frame
pixels). `"snap": true` marks wires added by `--snap`. `shots` is optional: when given, a track never leaves the shot
of its keyframe, and times outside every listed shot get no model. Without it the tracker finds cuts itself.

### Good keyframes

- One keyframe per shot at least, at a moment where the nut or the inlays are clear and the guitar is in a typical
  position. Add keyframes where the guitar moves or turns a lot, where the self-check gets worse, and near both ends
  of a long shot. Each keyframe resets the model; between two keyframes the tracker blends the two.
- Name wires far apart: the fit is only as good as its spread. Wires 2 and 12 alone can leave the high frets half a
  gap off; four to six wires over the whole board, plus `--snap`, fit to a pixel or two.
- Check the keyframe check, then look at the overlay at the keyframe (step 5).

## 3. neck_track.py: follow the guitar

    $PY $HR/neck_track.py VIDEO anchors.json LM track.json [--fps 5] [--check-every 5]

From every keyframe, forward and backward to the next keyframe or the end of the shot, the tracker follows the board
frame to frame (feature tracking, then a fit of the straightened board against the keyframe's, then a refit to the
wires it can see), with the hands masked out. Each keyframe is first refined on its own frame the way `--snap` does
(kept only if its check improves). Between two keyframes both tracks are kept: where they agree (within 1/4 of a
fret) they are blended, where they disagree the nearer keyframe's track is used and the time is listed in
`disagreements`. Output `track.json`: `t` (sample times, 5 a second), `H` (the board model at each sample, or null
where there is no trustworthy fit: no constraint there), `conf` (0 to 1, how well the board matches the keyframe's
picture), `cuts` (cuts it found), `disagreements` (time ranges where two keyframes' tracks differ by more than 1/4 of a
fret: look at the overlay there, and add a keyframe in the middle if the grid is off), `keyframe_refine`, `summary`
(samples, null share, times) and `selfcheck`.

It prints the self-check (also `track_check.py` below): every 5 s, on a frame between two track samples, the wire
detector runs on the tracked board and each wire it finds is measured against the nearest modelled wire, as a share of
the local fret gap, in the middle of the board (`median_share`, `p90_share`, `within_third`) and at its edges
(`median_edge`). Read it so:
- `median_share` and `median_edge` well under 0.1: the grid sits on the wires. Around 0.25 is chance: the grid is off.
- `times_over_third` / `times_edge_over_third`: times where the grid is off by more than a third of a gap: look there
  and add a keyframe nearby. `times_few_candidates`: too few wires seen to judge (hands over the board, blur).
- `lost_times`: no model there (null samples). A whole stretch of nulls: a cut, a title card, the guitar out of view,
  or a shot with no keyframe: add one. A stretch where the board is only partly visible (a band or title over it) and
  you cannot count wires: leave it without a model (out of `shots`, or a corrections line `lost`): no constraint is
  safe, a wrong one is not.
- The check cannot see a grid that is off by a WHOLE fret (the wire pattern repeats). Only the pictures show that:
  check the numbering on the overlay (nut, capo, inlays).

`--fps` is the sample rate (5 is enough; the window interpolates between samples).

### track_check.py: the self-check again, alone

    $PY $HR/track_check.py VIDEO anchors.json track.json LM [--every 5] [--offset 0.1] [--out check.json]

Prints one line per time (candidates, median distance in pixels and as a share of a gap, 90th percentile, edge) and
the summary. Give `""` as `track.json` to check the keyframes alone (each time uses the nearest keyframe of its shot).

## 4. hand_window.py: the window

    $PY $HR/hand_window.py LM anchors.json OUTDIR --track track.json [--margin 1] [--fps 30] [--corrections corr.txt]

Writes `OUTDIR/hand_window.csv`, one row per 1/fps s (`--fps 30` or `10`):

    t, lo, hi, conf, lost, f_lo, f_hi, p_lo, p_hi, nframes

`lo..hi` is the window in frets FROM THE CAPO (1 is the first fret above the capo); open strings are always allowed.
`lost` = 1 means no constraint at that time (no hand on the neck, no neck model, too few fingertips on the board).
`f_lo..f_hi` is the fretting hand's part, `p_lo..p_hi` the picking hand's tips when they are over the board (taps);
`conf` combines the hand detector's score, the track's confidence and how many fingertips were on the board;
`nframes` is the number of video frames the row joins (those within +-0.04 s). The window is the fingertips' frets
plus `--margin` frets on each side (0, 1 or 2); the thumb counts when it comes over the string-6 edge. The picking
hand's tips count when they lie over the board between the capo and wire 22 (taps): on a board that ends before wire
22 (many nylon-string guitars end at 19), plucking fingers over the soundhole can fall in that range and widen the
window: if the overlay shows `p_lo`/`p_hi` set where nobody taps, correct those rows.
Also writes `OUTDIR/tips.jsonl`: per video frame, each fingertip's fret coordinate `f` (wire k is at f = k; a tip
pressing fret k has k-1 < f <= k, counted from the nut) and across position `s` (0 = string-6 edge, 1 = string-1 edge).

## 5. overlay.py: look at it

    $PY $HR/overlay.py VIDEO anchors.json OUTDIR sheet.jpg --times 12.5,40,61.2 --track track.json [--crop x0,y0,x1,y1] [--cols 2] [--width 960]

Frames at the given times with every wire from the nut to wire 22 (cyan; the capo's wire and wire 12 thicker), each
fret numbered FROM THE CAPO (gold numbers along the string-1 edge), the window as a green band, the fretting hand's
fingertips (red dots with their fret from the capo), and a title with the time, the window and its confidence ("LOST"
or "NO NECK MODEL" when there is no constraint). Crop to the neck to see the wires. Check:
- Do the cyan lines sit ON the real wires, across the whole board, from string 6 to string 1?
- Is the numbering right (the gold numbers against the capo, the inlays, the nut)?
- Are the red dots on the fingertips that press strings, and is every pressing fingertip inside the green band?
  The hand landmarks can be wrong: a fingertip put one fret too far, or two fingers swapped (the thumb's ring sitting
  on a finger that presses). The thumb is drawn as a ring: orange "T" with its fret when it counts (over the string-6
  edge), grey when it does not.
Look at every keyframe, the self-check's worst times, a few times spread over each shot, and any moment where a
note's place matters.

## 6. Correcting

Two ways, use either or both:

- **New keyframes** (when the grid is off or lost): make a keyframe at that time (`wire_candidates.py ... auto ...
  --anchors anchors.json --track track.json`, name, `make_anchors.py ... --snap`), then run `neck_track.py` again and
  then `hand_window.py` again. A grid one fret off everywhere means a wrong name in a keyframe: fix that keyframe.
- **A corrections file** for `hand_window.py --corrections` (applied after the window is computed; later lines win;
  frets from the capo; `#` starts a comment; write the reason there):

      # t0    t1     action
      61.0   64.5   3-7        # hand clearly at frets 4-6 (overlay 62.0), landmarks lost it
      80.0   82.0   lost       # hand off the neck, landmarks put it on the body
      100.0  130.0  shift 1    # grid one fret low here, numbering checked on the inlay at fret 7

  `lo-hi` sets the window (conf 1), `lost` removes the constraint, `shift n` moves every window in the range by n
  frets. The lines applied and the number of rows each changed are written to `OUTDIR/corrections_applied.json`.
  Re-run `overlay.py` afterwards to see the corrected window.

Keep a log of what you checked, what you changed and why.

## 7. corrections.json: the log of a check

When you check the tool's output, log every decision, accepted or not, in `corrections.json` in your folder:

    {"decisions": [
      {"t": 40.0,  "looked": "every-10s", "action": "accept", "reason": "grid on the wires, numbering checked on the capo, tips in the band"},
      {"t": 62.03, "looked": "onset", "action": "window", "t0": 61.0, "t1": 64.5, "lo": 4, "hi": 6,
       "reason": "fingers clearly at frets 4-6 (overlay 62.0); the landmarks put the index on the body"},
      {"t": 81.2,  "looked": "onset", "action": "lost", "t0": 80.0, "t1": 82.0, "reason": "hand off the neck"},
      {"t": 115.0, "looked": "every-10s", "action": "shift", "t0": 100.0, "t1": 130.0, "n": 1, "reason": "grid one fret low, inlay at fret 7"},
      {"t": 140.0, "looked": "onset", "action": "keyframe", "reason": "grid half a fret off; new keyframe at 140.0 in anchors.json"}
    ]}

- `t`: the time you looked at; `looked`: why (`every-10s`, `onset`, or your own word); `reason`: what you saw.
- `action`: `accept` (the window is right there); `window` (from `t0` to `t1` the fretting fingertips are on frets
  `lo` to `hi` FROM THE CAPO, the fingers' own frets with NO margin: each run's margin is added when the corrections are
  applied, so a margin-1 window becomes `lo-1` to `hi+1`); `lost` (no constraint from `t0` to `t1`); `shift` (every
  window from `t0` to `t1` moved by `n` frets); `keyframe` (you added or fixed a keyframe in `anchors.json` at `t`, with
  `wire_candidates.py` and `make_anchors.py`: the neck is then tracked again and the windows remade).
- To see a correction before you log it, write the same lines as a corrections text file for margin 1 (section 6,
  with the margin added), run `hand_window.py` into another folder and `overlay.py` on it.
