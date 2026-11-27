# Tools for finding a guitar's tuning

What you have: a video of one guitarist playing, the notes a note model heard in its sound, where the fretting hand
is on the neck at every moment, and tools to look and to listen. The capo is given to you in your task. The job these
tools serve: find the six open strings of the guitar, the way a person would.

## The files

| file | what it is |
|---|---|
| `video.mp4` | the recording, picture and sound. Times everywhere are seconds from its start |
| `notes.csv` | `onset,offset,pitch`: the notes a note model heard (pitch as a MIDI number, 60 = C4, one step = one semitone). Some are wrong: invented, missed, an octave off, or split in two |
| `hand/hand_window.csv` | 30 rows a second: `t,lo,hi,conf,lost,...`. `lo..hi` = the frets the fretting hand can reach, counted FROM THE CAPO (1 = the first fret above the capo), one fret of margin either side included. `lost = 1`: no hand on the neck, so no constraint. Open strings are always allowed |
| `hand/tips.jsonl` | one line per video frame: `tips` = each fingertip's `[f, s]` (keys 8 index, 12 middle, 16 ring, 20 little, 4 thumb), `f` = fret coordinate counted FROM THE NUT (wire k is at f = k; a tip pressing fret k has k-1 < f <= k), `s` = across the board (0 = the string-6 edge, 1 = the string-1 edge); `thumb_over` = the thumb comes over the neck |
| `neck/anchors.json`, `neck/track.json` | the neck model the overlay draws |
| `tools/` | the scripts below |

Words: string 6 is the thickest, lowest string, string 1 the thinnest. A **tuning** is written as six MIDI numbers, the
open strings WITHOUT the capo, string 6 first, comma separated, no spaces. A capo on fret N adds
N semitones to every open string. A **place** is (string, fret from the capo); fret 0 is the open string.

Every command runs with one Python, from this folder:

    PY=/home/user/gtv/tools/venv-video/bin/python

## The order a person works in

1. **Open strings seen and heard.** Find moments where a string clearly rings open (no finger on it, the frames show
   it) and look at what the sound has there (`spectro.py`), or: a heard note that no fretted place inside the window
   can make must be an open string.
2. **One clear chord shape.** Find a moment where the fingers hold a clear shape (`overlay.py`, `frames.py` with a
   zoom), read the fingers' strings and frets, look at the chord's notes in the sound, and work out which open strings
   make that shape sound that chord.
3. **Heard notes against the notes the hand could play** (`conflicts.py`): every tuning near the one you assume is
   scored by how many heard notes it cannot play where the hand is.
4. **Ties.** Several tunings often fit equally well. The fingertips (`fingers.py`) and your own eyes on the frames
   decide between them. Assume the best answer and change a string only when what is seen and heard keep disagreeing.

## conflicts.py: which tunings fit the notes and the hand

    $PY tools/conflicts.py notes.csv hand/hand_window.csv --capo N --centre T [--t0 S --t1 S] [--check T] [--tips hand/tips.jsonl] [--json out.json]

- The grid: each string from 5 semitones below to 2 semitones above the tuning you give as `--centre` (the one you
  assume), 8^6 = 262,144 tunings, kept only when the open strings rise from string 6 to string 1. Seconds to run.
- A note is placeable in a tuning when some string sounds its pitch open or at a fret inside the window at its onset.
  **Conflicts**: `singles` = notes with no place; `groups` = notes starting together (within 35 ms) that cannot all
  go on different strings. `total` = both.
- Without `--t0/--t1` it reports three stretches: the first 30 s and 60 s from the first note, and the whole recording.
- The output: the best 20 with their conflicts, how many tunings tie with the best (`tied`), the `margin` to the next
  total, and for each string the values it takes among the tied tunings ("among the tied: s6 ...; s1 ..."): a string
  with one value there is settled by the notes; a string with several is not. Within a tie the order prefers tunings
  nearer `--centre`: that is your assumption, not evidence. `--check T` reports T's conflicts and rank.
- `--json` also lists the conflicting notes and groups of the first-ranked tuning (times, pitches, the window).
- `--tips hand/tips.jsonl` breaks the tie with the finger rule (below): the first-ranked tuning is challenged by each
  other tied tuning in turn and loses its place when the fingers favour the challenger; it prints the winner and how
  many tied tunings it beats, how many stay undecided and how many still beat it.
- What it cannot see: a string tuned one semitone lower plays its open notes at fret 1, which is inside a window that
  starts at fret 1; the notes alone often cannot tell such tunings apart. Invented notes (a note model's mistakes) make
  conflicts for the right tuning too: look at the listed conflicts before trusting a small difference.

## fingers.py: what the fingertips say about two tunings

    $PY tools/fingers.py notes.csv hand/hand_window.csv hand/tips.jsonl --capo N --a T --b T [--t0 S --t1 S] [--list 40]
    $PY tools/fingers.py notes.csv hand/hand_window.csv hand/tips.jsonl --capo N --strings T

- For each note, each tuning has its places inside the window. A note counts when the two tunings need different
  places for it. At the video frames within 0.05 s of its onset it asks whether a fingertip is near the place one of
  them needs: within 0.25 fret of the fret's space and within half a string spacing of the string's line (the strings'
  lines are spread evenly across the board with 8% of its width outside the outer strings).
  - one tuning can play the note open, the other needs a finger: no fingertip at any of the other's places favours the
    open one; a fingertip at a place only the other has favours the other;
  - both need a finger: a fingertip INSIDE the fret space of a place only one of them has favours that one.
- It prints the counts for A and for B and a verdict (A or B when one has at least twice the other's count and leads
  by 3 or more; else undecided). `--list N` prints the first N counted notes with their places and the nearest tip's
  distances (`d_f` in frets, `d_s` in string spacings): look at the overlay at some of those times yourself.
- `--strings T` asks each string's question on its own: T against T with that one string 1 or 2 semitones lower or
  higher.
- Known weak points: the landmark at a fingertip can lie up to about one string spacing off the string it presses,
  and a fingertip can lie just past the fret wire; check doubtful verdicts on the frames.

## overlay.py: the neck, the window and the fingertips on frames

    $PY tools/overlay.py video.mp4 neck/anchors.json hand sheet.jpg --times 12.5,40,61.2 --track neck/track.json [--crop x0,y0,x1,y1] [--cols 2] [--width 960]

Frames at the given times with every fret wire drawn (cyan), each fret numbered FROM THE CAPO (gold, the capo is 0),
the window as a green band, the fretting fingertips as red dots with their fret from the capo (the thumb as a ring),
and the time, window and confidence in the title. Check that the lines sit on the real wires and that the pressing
fingers are inside the band. "NO NECK MODEL" = the neck was not found at that time.

## frames.py: plain frames, zoomed

    $PY tools/frames.py video.mp4 sheet.jpg --times 12.5,40 [--crop x0,y0,x1,y1] [--cols 2] [--width 960]

## spectro.py: the sound of a stretch on a pitch axis

    $PY tools/spectro.py video.mp4 spec.png --t0 40 --t1 48 [--notes notes.csv] [--lo 36] [--hi 88]

One row per third of a semitone, MIDI numbers `--lo` to `--hi` with note names; `--notes` draws each note of a list as
a box. At most 120 s a picture.

## render.py: hear chosen notes

    $PY tools/render.py chosen.csv out.wav [--t0 S --t1 S] [--program 24] [--mix video.mp4]

Plays a note list (`onset,offset,pitch`; write your own CSV with the notes you want) with FluidSynth (General MIDI
program 24 nylon, 25 steel guitar). `--mix video.mp4`: left channel the recording, right channel the rendering, over
the same stretch. You cannot listen: compare the rendering with the recording by looking at both with `spectro.py`.
