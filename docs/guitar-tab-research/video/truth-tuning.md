# Ground truth for the "tuning" recording

Stage 2 (truth), slot `tuning`, 2026-11-25. Truth file: `/home/user/gtv/truth/tuning/tuning.truth.json` (schema of
`EXPERIMENTS.md` "Scoring"). Work folder, scripts and logs: `/home/user/gtv/work/truth-tuning/` (`PROGRESS.md`,
`bin/`, `align/`, `check/`). Every number below comes from a file named next to it. Repaired the same day after the
independent check (`truth-tuning-check.md`): see **Repairs** at the end. Counts and checks below are the repaired
truth's; the values before the repair are given next to them.

## Source and credit

- *A soft collision of breath*, composed and played by Evan Handyside (Vimeo 1149455966; tab and post on
  intellimusica.com, "Free TABs"). Licence as stated: site footer "Copyright (c) 2026 Intellimusica"; Vimeo states
  none (all rights reserved by default). Credit line: "A soft collision of breath, composed and played by Evan
  Handyside, intellimusica.com". The rights note of `SONGS.md` (the tab PDF came through the site's public API) stands.
- Inputs made here (`/home/user/gtv/songs/tuning/`): `songs.json` gives no crop or mask, so `tuning.mp4` is a stream
  copy of the download with all metadata stripped (no re-encode, 2304x1296, 30 fps, 187.37 s, both streams start at
  0); no `tuning.full.mp4`. `tuning.wav` (44.1 kHz s16 stereo from `tuning.mp4`), `tuning.mono.wav`, and the segment
  at t0 = 25.0 s (from `songs.json`): `tuning.seg30.wav`, `.seg30.mono.wav`, `.seg30.mp4` (x264 crf 16, gtr-run r0753).

## Tuning and capo, and how each was confirmed

- **Tuning D2 G2 C3 F3 A3 C4** (`tuning_midi` 38 43 48 53 57 60). The tab writes "TUNING: D G C F A C" twice (text and
  letters on the staff) and the post says "one whole step down, then dropping the 1st string an additional whole step".
  Audio: the open 1st string (114 notes) sounds C4, median 13.8 dB above D4 in the 50-300 ms after each onset; the open
  6th string sounds D2, median 16.3 dB above E2 over the builder's 49 notes (CQT, 36 bins/octave). 12 of those 49 were
  in fact E2, string 6 fret 2 (Repairs, Problem 1): 37 open-6th notes remain. The lowest note of the piece is that
  open D2. The truth rendered in this tuning matches the recording at chroma 0.807 (below). This settles the 1st-string
  drop that the selector's chroma check could not (0.810 vs 0.808).
- **Capo: none.** The tab and the post name none; the frames at 2.6 s and 33.0 s show the nut with no capo and the
  fretting hand at frets 1-3 (`check/hands_label.jpg`).
- **`tuning_offset_cents` -9**: `librosa.estimate_tuning` on 1.5-177 s gives -10.0 c; the median of per-note
  fundamental peaks (400 notes from D3 up, 120-bin/octave CQT, parabolic peak) is -8.5 c (IQR -11.4 to -2.8).

## Method

1. **The two readings.** `read-a.json` and `read-b.json` (both present, both parse) agree on every one of the 134
   notes / 101 events of the page (6 systems: verse 20 events, chorus systems 2-5 of 20 events each, End 1 chord):
   **134 agreed, 0 differed** (`bin/cmp_readers.py`). One note was marked with a doubt by both readers: system 5,
   event 17, string 2 fret 3 (a retraced glyph, maybe a 2). Looked at enlarged (`tab/doubt_b5e17.png`, page `tab/page-1.png`
   at 300 dpi): it is a 3 with the same flat foot as the clean 3s on that line and in the End chord. In the recording,
   at its three onsets, C4 (fret 3) rises 8.8, 10.9 and 7.7 dB while B3 (fret 2) stays 14-17 dB under C4
   (`bin/dbg_doubt.py`): **fret 3 kept**. Merged reading: `/home/user/gtv/truth/tuning/tuning.tab-merged.json`.
2. **Form as played.** The bass notes of a Basic Pitch run over the whole file showed the bar pattern; the alignment
   then confirmed it bar by bar: Verse 4x (from 1.68 s), Chorus (systems 2-5, from 31.1 s), Verse 4x (60.0 s), Chorus 2x
   (89.6 s, 118.6 s), **Verse 4x (147.4 s)**, End chord (177.13 s). That is 481 events and 628 notes.
3. **Alignment.** A FluidSynth rendering of the event list at even spacing, chroma DTW against the recording, gave a
   first map; it was up to 1.5 s off in places (verse-to-chorus joins), so it only seeds the search. The aligner
   (`bin/snap3.py`) works on two levels: (a) each half-line of the tab (a chord plus 9 notes) is one bar; its start (the
   lowest chord note) is chosen among pluck transients where the chord's own pitches rise, by a dynamic programme that
   keeps bar lengths even (48 bars, median 3.65 s); (b) inside a bar the 9 single notes are placed by a rhythm template
   re-estimated from the piece (median positions 0.21 0.32 0.43 0.50 0.62 0.74 0.80 0.87 0.92 of the bar) and each is
   snapped to the strongest pluck transient (spectral flux above 1 kHz, 5.8 ms grid) within 0.15 s where its own pitch
   rises at least 3 dB (fundamental, or harmonics 2-4 for a string re-plucked while it still rings). The chords are
   rolled upward over 0.1-0.3 s, and the dB rise of a long low-note CQT window peaks before the pluck, so chord notes
   were re-timed (`bin/chordhalf.py`) at the half-rise point of each pitch's linear CQT magnitude (unbiased for a
   symmetric window), snapped to a transient within 30 ms, in string order 6 to 1, never before the bass.
   Variants tried and dropped, with their guitar-model onset F1: DTW only (1 s errors), v3 without the chord re-timing
   0.706, transient-dominant weights 0.143 (alignment broke), chord re-timing by transient 0.693, plus backtracking
   0.637. The final one scores 0.791.
4. **Offsets**: the next pluck of the same string, or the time the pitch falls 25 dB under its post-onset peak, at most
   6 s. Approximate: read onset+offset scores with care.
5. **Voices**: chord notes `chord`, except the lowest note of each chord `bass`; single notes on strings 5-6 `bass`;
   the rest `melody`. No taps (no technique marks on the page, none seen or heard).
6. **Beats (inferred, the tab has no rhythm)**: one tab half-line = one 4/4 bar. Beat 1 = onset of the chord's lowest
   note (the downbeat), beat 3 = onset of the 5th event, beat 4 = onset of the 7th event, beat 2 halfway between 1 and
   3; the End chord carries one beat. Why: over the piece the 5th and 7th events sit at 0.488 (IQR 0.480-0.494, 45
   bars) and 0.727 (IQR 0.720-0.734, 46 bars) of the bar. Tempo 65.73 bpm = 4 beats per median bar (3.651 s); the
   playing is rubato (bars 3.44-3.79 s; the last bar before the End 4.31 s).
7. **Chords (from the tab's names)**: the names on the page are shape names for standard tuning; the guitar sounds a
   whole step lower, so each is moved down a whole step and checked against the notes it covers: C/E -> `Bb:maj/3`,
   D/F# -> `C:maj/3`, Am -> `G:min`, Em -> `D:min`, C -> `Bb:maj`, G5 -> `F:5`, D11 (D add11) -> `C:maj(11)` (no fifth
   is played), the unnamed End chord (C/E shape) -> `Bb:maj/3`. One chord per bar, `N` before the first note, the End
   chord to the end of the file.
8. **Key `D minor`** (a judgement): Krumhansl-Kessler on duration-weighted pitch classes of the repaired notes gives
   D minor r = 0.744, C major 0.732, F major 0.725 (the relative major, same pitch set); before the repair 0.771 and
   0.690 (F major).

## Coverage and counts

- **Whole piece**: `scored_range` [0, 187.37] s. Notes from 1.68 s to 177.46 s; the End chord rings to the end; no
  pluck after 177.5 s (no transient of strength >= 0.15 there; Basic Pitch's notes at 182-184 s are not plucks).
- **628 notes** (481 events, 49 bars = 48 + End): melody 384, chord 147, bass 97. **conf: tab+audio 556, tab 72,
  audio 0** (539 / 89 before the repair). The `tab` notes sit mostly at bar positions 1, 3 and 9, the notes that
  re-pluck a string still ringing the same pitch (A3 after A3, the bass D2 after the chord's D2); their onsets come
  from the bar template or sit on a flux peak without pitch evidence (Repairs).
- **193 beats, 49 downbeats, 50 chord segments** (Bb:maj/3 13, C:maj/3 12, G:min 9, D:min 6, Bb:maj 3, F:5 3,
  C:maj(11) 3, N 1).
- Segment 25-55 s (`tuning.seg30.truth.json`, `crop_truth.py`): 106 notes (92 tab+audio, 14 tab; 90 / 16 before the
  repair), 33 beats, 8
  downbeats, 9 chords: the last verse pass and six and a half bars of chorus 1, so both chord families and all six
  strings, as the selector estimated. Kept at t0 = 25.0 s.

## Departures from the tab

- **Form**: the recording adds a third **Verse 4x after Chorus 2x**, before the End. The post's form ("Verse 4x,
  Chorus / Verse 4x, Chorus 2x / End") gives 401 events and 524 notes in about 180 s at 0.45 s per event, which is
  where `songs.json`'s timings came from; as played it is 481 events and 628 notes at about 0.365 s per event, so
  the section times in `songs.json` are wrong: chorus 1 starts at 31.1 s (not 37.5 s), verse block 2 at 60.0 s,
  chorus 2x at 89.6 s, verse block 3 at 147.4 s, End at 177.13 s.
- **Notes**: one, found by the independent check and confirmed in the repair. At bar position 3 of the 12
  D/F#-shape verse bars (bars 2, 4, 6, 8, 18, 20, 22, 24, 42, 44, 46, 48) the tab writes the open 6th string (D2); the
  player keeps the chord's fretted bass, **E2, string 6 fret 2**: E2 is 17-33 dB louder than D2 after all 12 of these
  onsets (Repairs, Problem 1). Otherwise every event of the tab is played in every pass as far as this alignment can
  tell; no note heard outside the tab was added (`audio` 0). Not proven for the 72 `tab` notes, which are not
  confirmed either way.

## Checks

- `gtr-eval check-truth` (0.12.1): **6411 checks, 0 mismatches** (`work/truth-tuning/checktruth.log`); the segment
  truth 1109 checks, 0 mismatches. The same for the repaired files (`work/truth-fix-tuning/logs/checktruth_installed.log`,
  `checktruth_seg30.log`).
- Side files against the JSON (`sidecheck.log`): `notes.csv` onset and onset+offset F1 1.0; `.mid` onset F1 1.0,
  onset+offset 0.975 (two notes of one pitch on two strings, e.g. C4 on strings 1 and 2, overlap and cannot be held
  apart in one MIDI channel); `beats.txt` F 1.0; `chords.lab` root and majmin 1.0; `.gp5` and `.tab.txt` scored
  `tab --ignore-time`: 599 of 628 matched by order, 0.997 same string and fret of matched (not 1.0: these two files
  are a reading aid on a 16th grid at 66 bpm with each rolled chord on one beat, which shuffles the order-matching).
  Rewritten from the repaired JSON and scored again with the same results (.mid onset+offset 0.9745;
  `work/truth-fix-tuning/logs/sidecheck.jsonl`).
- **Transcription models against the truth** (`gtr-eval notes`, 50 ms, 50 cents; logs `eval_bp.log`,
  `eval_gaps.log`; no eval id was printed; repaired truth: `work/truth-fix-tuning/logs/eval_models.log`, gtr-eval
  e1953-e1956): guitar-gaps.pth (gtr-run r0757) onset **P 0.837, R 0.823, F1 0.830** (onset+offset 0.382; before the
  repair 0.798 / 0.785 / 0.791, 0.353); Basic Pitch 0.4.0 with the dropped-tuning range 73.4-1319 Hz (r0755) onset
  **P 0.562, R 0.705, F1 0.626** (onset+offset 0.178; before 0.541 / 0.678 / 0.602, 0.168; it writes 788 notes for
  628, mostly repeats of ringing notes). Per 10 s (`bin/evalwin.py`, mir_eval; `logs/evalwin_new.log`): guitar-gaps
  0.67-0.92 in every window (0.67-0.85 before; no window lower than before), Basic Pitch 0.51-0.75 (0.45-0.75); the
  lowest windows are now 50-60 s (0.67) and 110-130 s (0.70, 0.73) for guitar-gaps and 110-120 s (0.51) for Basic
  Pitch, all chorus; before the repair 170-180 s (the slowing last bar) was the lowest for both. No window collapses,
  so no stretch is misaligned. Matched onsets: the models are earlier than the truth by a median 21 ms (Basic Pitch)
  and 30 ms (guitar-gaps): the truth marks the transient peak, the models the attack start. Within 50 ms of a
  guitar-gaps note of the same pitch: 382 of 432 single notes (358 before), 135 of 196 chord notes (`logs/gaps_split.log`).
- **Truth rendered against the recording** (`notes2wav.py`, nylon; repaired truth `work/truth-fix-tuning/out/chroma/chroma_new.json`):
  mean chroma cosine **0.833** over 1.5-178 s, 0.801-0.870 per 10 s; the same rendering shifted by one bar gives 0.556
  (0.445-0.664). Before the repair (`check/chroma.json`): 0.807 (0.772-0.847), shifted 0.584 (0.466-0.674).
- **Ten notes by hand** (one per tenth of the note list; `check/tencheck.jpg`, `check/tencheck.json`): a spectrogram
  slice and the video frame at each onset. All ten show their pitch rising at the onset (6.1 to 22.0 dB); for 8 of 10 a
  model note of the same pitch is within 50 ms. #5 (G3, string 3 fret 2, 81.22 s, a re-pluck, rise 6.4 dB) has no model
  note within 0.3 s; #3 (G3 in a Gm chord, 45.52 s) is 5 ms from Basic Pitch but 162 ms from guitar-gaps. The frames
  show the fretting hand at frets 1-3 at every fretted note; the string under each finger cannot be resolved at this
  camera angle. The spectrogram tiles were too small to judge onsets by eye beyond these numbers. None of these ten
  notes changed in the repair (`work/truth-fix-tuning/logs/tencheck_changed.log`).

## Video truth

`/home/user/gtv/truth/tuning/tuning.video.json`: 30 fps, 2304x1296, one shot (static camera, no cuts), mirrored false,
capo_fret 0, `av_offset_s` 0 (not measured: both streams start at 0). Neck quadrilateral (nut upper, nut lower, body
lower, body upper) [2148, 832, 2161, 920, 1445, 1088, 1405, 983] px, set by hand on the frame at 33.0 s; the guitar
moves by about 10-30 px. Unlike `SONGS.md`, the nut and part of the headstock are in frame at the right edge;
frets_visible [0, 19] (the upper count approximate). Two frames labelled by looking at 2x crops: 2.6 s (C/E shape:
ring [5, 3], middle [4, 2], index and pinky not fretting) and 33.0 s (Am shape: index [2, 1], middle [4, 2], ring
[3, 2]). The fret space of each fingertip was seen; the string was taken from the tab's shape.

## What remains uncertain

- **Chord-note onsets.** The chords are rolled; 61 of 196 chord notes are more than 50 ms from the guitar model's note
  of that pitch. Their pitch and order are sure, their onsets less so (likely within about 0.1 s).
- **The 72 `tab` notes**: no pitch heard at a flux peak; onsets from the bar template (about +-0.1 s) or on a flux
  peak without pitch evidence. Scores with and without them: Repairs.
- **Chord heads**: 14 chord notes, the bass at the downbeat of bars 1, 4, 34 and 48 among them, sit 35-128 ms before a
  flux peak at least 3x stronger (`work/truth-fix-tuning/logs/chordA.log`); not moved in the repair (they would move
  downbeats; inside the +-0.1 s stated for chord notes).
- **Offsets** (rule-based) and so every onset+offset score.
- **Beats, time signature and tempo** are an inference (the tab has no rhythm); the chord labels follow the tab's
  names (C:maj(11) has no fifth in the voicing); the key (D minor vs F major) is a judgement.
- **Onset convention**: the truth marks the pluck transient; models trained on GuitarSet mark about 20-30 ms earlier.
- **Video**: fingertip strings inferred, frets_visible upper bound approximate, A/V offset not measured.

## Repairs

Done 2026-11-25 by the truth-fix-tuning agent after the independent check (`truth-tuning-check.md`, PROBLEMS 1 and 2).
Work folder `/home/user/gtv/work/truth-fix-tuning/` (`bin/`, `logs/`, `out/`, `PROGRESS.md`; the builder's files before
the repair in `orig/`, truth SHA-256 `5f366bb59fd0...`). Repaired `tuning.truth.json` SHA-256 `0075867d551a...`, segment
truth `4747d3b03228...` (`logs/installed.sha256`). Everything from the builder's files to the last check runs again
from one script, `bin/run_all.sh`. Every note the repair looked at, before and after, with its decision and evidence:
`truth-tuning-repairs.csv` (69 rows, next to this record). Times were set from the recording only (the builder's
1 kHz+ flux peaks, the truth's onset convention, and the level of the note's own pitch); Basic Pitch, guitar-gaps and
the checker's onset detector were used only to check the result.

**Pitch evidence.** `f0`: level change of the note's fundamental band (+-40 cents at -9 c) between 0.25 s windows just
before and just after a time (0.37 s for G2 and below, so that D2 and E2 are resolved). `h`: the median of that change
over harmonics 1-6 (windows 0.37 / 0.25 / 0.15 s by band). A pitch counts as heard when f0 or h rises at least 3 dB and
neither falls more than 3 dB. Not the fundamental alone, as the check proposed: in this tuning the fundamental of C4 is
the 2nd harmonic of the open C3 string and that of A3 the 3rd harmonic of the open D2, so these bands are often loud
already, and a re-plucked ringing string raises its upper harmonics more than its fundamental. Bar 4: the first A3
(13.514 s) and first C4 (14.559 s) of their pairs leave the fundamental flat while A5 rises 10 dB and G5 16 dB
(`bin/risespec.py`), and guitar-gaps and the checker's detector both find a note there. Calibration (`logs/calib2.log`):
of 403 notes that Basic Pitch and the detector both put within 50 ms, f0 alone rises 3 dB for 88 %, h for 87 % (C4: 79 %
and 90 %); at the same pitches 0.2 s away h passes for 4 %.

### Problem 1, wrong bass in the 12 D/F#-shape verse bars: fixed

- Confirmed with my own measure (`bin/p1check.py`, `logs/p1check.log`): 0.05-0.42 s after the position-3 onset, E2 is
  louder than D2 in all 12 D/F#-shape bars (median +22.5 dB, +17.1 to +32.8) and D2 louder than E2 in all 12
  C/E-shape bars (median 16.5 dB).
- **Changed: 12 notes** (19, 45, 71, 97, 227, 253, 279, 305, 539, 565, 591, 617): pitch 38 -> 40, string 6 fret 0 ->
  fret 2, all now `tab+audio`. Re-timed on the flux peak where E2 is heard: 6.844 -> 6.902 s (+58 ms), 14.355 -> 14.338
  (-16), 21.670 -> 21.612 (-58), 29.069 -> 29.037 (-32, the segment's), 65.274 -> 65.294 (+20), 87.563 -> 87.533 (-30),
  152.536 -> 152.485 (-50), 159.787 -> 159.800 (+13), 167.088 -> 167.102 (+14), 174.623 -> 174.364 (-259, bar 48, the
  slowing last bar); 72.748 and 80.140 s already sat on the E2 pluck. **None dropped as let-ring**: each has an E2
  pluck (f0 +1.4 to +9.9 dB, h +3.4 to +17.0 dB at its new time) and guitar-gaps writes an E2 36-45 ms before each new
  time (its usual lead). The check's "no pluck within 200 ms" for four of them comes from its mel-flux detector, which
  finds no onset there; the builder's 1 kHz+ flux has a peak at each.

### Problem 2, about 55 notes where nothing of their pitch is plucked: 37 fixed or shown heard, 18 marked unconfirmed

Rule (`bin/fix.py`, notes in time order, each between its neighbouring events' current times, +-15 ms):
- **A, every single note**: when the note sits on a weak flux peak (or none) and a peak at least 3x stronger (and at
  least 0.3) follows within 130 ms inside its interval, that peak is the pluck; the note moves there unless its
  fundamental falls more than 3 dB. This was the builder's flaw: the long-window rise score is already high just before
  an attack, so the snap could take a small peak 30-110 ms early (the same flaw as in the capo truth).
- **B, the check's 55 notes, the 12 E2 basses and one more note of bar 48 (below)**: B1, on a flux peak where the pitch
  is heard (chord notes keep the builder's half-rise convention, no peak needed): kept. B2, otherwise the flux peak of
  the interval that holds no other note, is not a weak pre-peak of a stronger one and where the pitch is heard (best
  strength + rise, a mild pull to the old time): moved there; of a same-pitch pair (A3 A3, C4 C4) the second, louder
  note is placed first. Otherwise (B3 on a peak, B4 at the template time): left, `conf: "tab"`.
- `conf` of every note looked at: `tab+audio` only when its pitch is heard at its final time (single notes: on a peak).

| the check's 55 notes | n | notes (truth index before the repair) |
|---|---|---|
| A: moved to the stronger peak, 70-105 ms later | 7 | 4, 10, 33, 34, 335, 389, 582 |
| B2: re-timed | 13 | 19, 32, 71, 95 (28.236 -> 27.829 s, A3 +10.6 dB), 97, 240, 305, 498, 539, 616, 618, 619, 621 (the last four in bar 48) |
| B1: heard where they are (the check's two tests missed them) | 17 | 87, 191, 214, 253, 269, 282, 302, 334, 354, 386, 484, 542, 555, 572, 584, 596, 601 |
| unconfirmed, `tab`, time kept | 18 | 141, 173, 175, 188, 201, 209, 251, 264, 318, 342, 357, 394, 409, 461, 487, 500, 524, 609 |

- The unconfirmed 18 (9 bass, 8 melody, 1 chord note) are mostly the first note of a repeated pair or a bass re-plucked
  while it still rings; guitar-gaps hears 5 of them within 50 ms. They are not deleted: the tab writes them and nothing
  shows they are not played; scores with and without them are below.
- Moved outside the list: rule A moved 7 more notes 23-64 ms later (64, 220, 358, 397, 436, 437, 563), and note 620
  (bar 48, G3, written at its template time 175.948 s, 48 ms before the repaired note 621) went to 175.630 s, where G3
  rises 19.6 dB (f0) and 12.9 dB (h). In all **33 notes moved** (19 later, median +64 ms, 13 to 106; 14 earlier,
  median -204 ms, 16 to 469), 12 re-pitched; `conf` 20 `tab` -> `tab+audio`, 3 `tab+audio` -> `tab` (318, 389, 609):
  **556 `tab+audio`, 72 `tab`**. Pitch, string, fret and voice of every other note are unchanged.
- Segment 25-55 s, the check's seven: #87 heard in place (F3 +3.7 / +4.9 dB on its peak; guitar-gaps 40 ms earlier),
  #95 -> 27.829 s, #97 -> E2 at 29.037 s, #141, #173, #175, #188 unconfirmed. Segment: 106 notes, 92 / 14.
- **Not changed**: the chord heads (What remains uncertain); the other `tab` notes outside the list (60 before, 53
  now; rule B on all of them, dry run `out/fix_v3all.truth.json`, moved 10 more notes with no gain in any check: guitar-gaps within 50 ms
  511 -> 510).

| measure (`logs/`) | before | after |
|---|---|---|
| checker's own detector: truth onsets with an onset within 50 ms (`c3_onsets_*.log`) | 548 (0.873) | 565 (0.900) |
| notes missed by both the detector and Basic Pitch, the check's test (`c3_windows_*.log`) | 55 | 39 |
| the same and no guitar-gaps note of the pitch within 50 ms (`final_summary.log`) | 34 (26 `tab`) | 16 (13 `tab`) |
| notes 2 of 3 methods (bias removed) hear > 50 ms later / earlier, none within 30 ms (`agree_*.log`) | 31 / 5 | 18 / 2 |
| within 50 ms, bias removed: Basic Pitch / guitar-gaps / detector | 421 / 486 / 545 | 439 / 512 / 562 |
| guitar-gaps onset P / R / F1 (onset+offset F1), e1954 -> e1956 | 0.798 / 0.785 / 0.791 (0.353) | 0.837 / 0.823 / 0.830 (0.382) |
| Basic Pitch onset P / R / F1 (onset+offset F1), e1953 -> e1955 | 0.541 / 0.678 / 0.602 (0.168) | 0.562 / 0.705 / 0.626 (0.178) |
| without the `tab` notes (539 -> 556 notes; estimates unchanged): guitar-gaps R / F1 | 0.853 / 0.795 | 0.865 / 0.819 |
| the same, Basic Pitch R / F1 (e1957-e1960) | 0.746 / 0.606 | 0.752 / 0.622 |
| segment 25-55 s, onset F1 guitar-gaps / Basic Pitch (`eval_seg30.log`) | 0.798 / 0.643 | 0.807 / 0.659 |
| truth rendered vs recording, chroma (one bar shifted) | 0.807 (0.584) | 0.833 (0.556) |

The 39 left by the check's test: 17 heard where they are (B1), the 18 unconfirmed, and 4 re-timed E2/D2 basses (71,
240, 305, 617) that guitar-gaps puts within 16 ms (bias removed). **`scored_range` is unchanged** ([0, 187.37] s, nothing cut): no
10 s window scores lower than before for either model, none collapses, chroma is at least 0.801 in every 10 s, and the
unconfirmed notes are single notes spread over the piece and marked `tab`.

### Self-checks after the repair (step 6 of the method)

`gtr-eval check-truth` 6411 checks, 0 mismatches; segment 1109, 0. Rebuilt with the builder's own rules
(`bin/rebuild.py`: offsets, beats, key; the side files as `write_truth.py`, the .mid with pretty_midi as before) and
scored against the JSON: `notes.csv` 1.0 / 1.0, `.mid` onset 1.0, onset+offset 0.9745, `beats.txt` F 1.0, `chords.lab`
root and majmin 1.0, `.gp5` and `.tab.txt` `tab --ignore-time` 599 of 628 matched, 0.997 same string and fret: all as
before. Beats follow the repaired 5th and 7th events: 9 of 193 changed (bars 3, 28, 34: beats 2-3 by +32 to +81 ms;
bar 48: beats 2, 3, 4 by -155, -311, -425 ms, now on its notes); downbeats, chords and tempo (65.73) unchanged; key
above. Also fixed from the check's list: the JSON's beat text now gives the measured 0.488 / 0.727 (was 0.500 / 0.740),
and `tuning.tab.txt` says a two-character cell is one 16th. Models per 10 s, chroma and the ten hand-checked notes: in
Checks above.
