# Ground truth for the "tuning" recording

Stage 2 (truth), slot `tuning`, 2026-11-25. Truth file: `/home/user/gtv/truth/tuning/tuning.truth.json` (schema of
`EXPERIMENTS.md` "Scoring"). Work folder, scripts and logs: `/home/user/gtv/work/truth-tuning/` (`PROGRESS.md`,
`bin/`, `align/`, `check/`). Every number below comes from a file named next to it.

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
  6th string (49 notes) sounds D2, median 16.3 dB above E2 (CQT, 36 bins/octave). The lowest note of the piece is that
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
8. **Key `D minor`** (a judgement): Krumhansl-Kessler on duration-weighted pitch classes of these notes gives D minor
   r = 0.771, F major 0.690 (the relative major, same pitch set).

## Coverage and counts

- **Whole piece**: `scored_range` [0, 187.37] s. Notes from 1.68 s to 177.46 s; the End chord rings to the end; no
  pluck after 177.5 s (no transient of strength >= 0.15 there; Basic Pitch's notes at 182-184 s are not plucks).
- **628 notes** (481 events, 49 bars = 48 + End): melody 384, chord 147, bass 97. **conf: tab+audio 539, tab 89,
  audio 0.** The 89 `tab` notes sit mostly at bar positions 1, 3 and 9, the notes that re-pluck a string still ringing
  the same pitch (A3 after A3, the bass D2 after the chord's D2); their onsets come from the bar template.
- **193 beats, 49 downbeats, 50 chord segments** (Bb:maj/3 13, C:maj/3 12, G:min 9, D:min 6, Bb:maj 3, F:5 3,
  C:maj(11) 3, N 1).
- Segment 25-55 s (`tuning.seg30.truth.json`, `crop_truth.py`): 106 notes (90 tab+audio, 16 tab), 33 beats, 8
  downbeats, 9 chords: the last verse pass and six and a half bars of chorus 1, so both chord families and all six
  strings, as the selector estimated. Kept at t0 = 25.0 s.

## Departures from the tab

- **Form**: the recording adds a third **Verse 4x after Chorus 2x**, before the End. The post's form ("Verse 4x,
  Chorus / Verse 4x, Chorus 2x / End") gives 401 events and 524 notes in about 180 s at 0.45 s per event, which is
  where `songs.json`'s timings came from; as played it is 481 events and 628 notes at about 0.365 s per event, so
  the section times in `songs.json` are wrong: chorus 1 starts at 31.1 s (not 37.5 s), verse block 2 at 60.0 s,
  chorus 2x at 89.6 s, verse block 3 at 147.4 s, End at 177.13 s.
- **Notes**: none found. Every event of the tab is played in every pass as far as this alignment can tell; no note
  heard outside the tab was added (`audio` 0). Not proven for the 89 `tab` notes, which are not confirmed either way.

## Checks

- `gtr-eval check-truth` (0.12.1): **6411 checks, 0 mismatches** (`work/truth-tuning/checktruth.log`); the segment
  truth 1109 checks, 0 mismatches.
- Side files against the JSON (`sidecheck.log`): `notes.csv` onset and onset+offset F1 1.0; `.mid` onset F1 1.0,
  onset+offset 0.975 (two notes of one pitch on two strings, e.g. C4 on strings 1 and 2, overlap and cannot be held
  apart in one MIDI channel); `beats.txt` F 1.0; `chords.lab` root and majmin 1.0; `.gp5` and `.tab.txt` scored
  `tab --ignore-time`: 599 of 628 matched by order, 0.997 same string and fret of matched (not 1.0: these two files
  are a reading aid on a 16th grid at 66 bpm with each rolled chord on one beat, which shuffles the order-matching).
- **Transcription models against the truth** (`gtr-eval notes`, 50 ms, 50 cents; logs `eval_bp.log`,
  `eval_gaps.log`; no eval id was printed): guitar-gaps.pth (gtr-run r0757) onset **P 0.798, R 0.785, F1 0.791**
  (onset+offset 0.353); Basic Pitch 0.4.0 with the dropped-tuning range 73.4-1319 Hz (r0755) onset **P 0.541,
  R 0.678, F1 0.602** (onset+offset 0.168; it writes 788 notes for 628, mostly repeats of ringing notes). Per 10 s
  (`bin/evalwin.py`, mir_eval): guitar-gaps 0.67-0.85 in every window, Basic Pitch 0.45-0.75; the lowest window for
  both is 170-180 s (the slowing last bar and the End chord). No window collapses, so no stretch is misaligned.
  Matched onsets: the models are earlier than the truth by a median 21 ms (Basic Pitch) and 29 ms (guitar-gaps):
  the truth marks the transient peak, the models the attack start. Within 50 ms of a guitar-gaps note of the same
  pitch: 358 of 432 single notes, 135 of 196 chord notes.
- **Truth rendered against the recording** (`notes2wav.py`, nylon, `check/chroma.json`): mean chroma cosine **0.807**
  over 1.5-178 s, 0.772-0.847 per 10 s; the same rendering shifted by one bar gives 0.584 (0.466-0.674).
- **Ten notes by hand** (one per tenth of the note list; `check/tencheck.jpg`, `check/tencheck.json`): a spectrogram
  slice and the video frame at each onset. All ten show their pitch rising at the onset (6.1 to 22.0 dB); for 8 of 10 a
  model note of the same pitch is within 50 ms. #5 (G3, string 3 fret 2, 81.22 s, a re-pluck, rise 6.4 dB) has no model
  note within 0.3 s; #3 (G3 in a Gm chord, 45.52 s) is 5 ms from Basic Pitch but 162 ms from guitar-gaps. The frames
  show the fretting hand at frets 1-3 at every fretted note; the string under each finger cannot be resolved at this
  camera angle. The spectrogram tiles were too small to judge onsets by eye beyond these numbers.

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
- **The 89 `tab` notes**: no pitch rise at a transient; onsets from the bar template (about +-0.1 s).
- **Offsets** (rule-based) and so every onset+offset score.
- **Beats, time signature and tempo** are an inference (the tab has no rhythm); the chord labels follow the tab's
  names (C:maj(11) has no fifth in the voicing); the key (D minor vs F major) is a judgement.
- **Onset convention**: the truth marks the pluck transient; models trained on GuitarSet mark about 20-30 ms earlier.
- **Video**: fingertip strings inferred, frets_visible upper bound approximate, A/V offset not measured.
