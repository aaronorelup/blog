# Ground truth: standard (*Imagine*, Gareth Evans)

Truth builder, stage 2, 2026-11-25 (agent `truth-standard`). Everything a tool is scored against for the `standard`
slot. Heavy files and every script: `/home/user/gtv/truth/standard/`, `/home/user/gtv/songs/standard/`,
`/home/user/gtv/work/truth-standard/` (`bin/`, `logs/`, `PROGRESS.md`). Every number below comes from a file named
next to it.

**In one paragraph.** 676 notes over the whole piece (0 to 177.00 s of `standard.wav`, all 56 bars, nothing left
out), strings and frets from Gareth Evans' own on-screen Guitar Pro tab, read twice independently (853 of 853 tab
notes identical), timed to the recording. Standard tuning, no capo, +6 cents sharp. 574 notes are confirmed by a
pitch rise in the audio at their onset, 99 come from the tab alone (mostly re-plucks of a pitch that is still
ringing), 3 are heard but not in the tab. The guitar-trained model scores onset F1 0.877 against it and Basic Pitch
0.654, both in or near the range the research saw on real guitar; the truth's timing agrees with the model's notes to a
median of 0.0 ms.

## Files

| file | what |
|---|---|
| `songs/standard/standard.mp4` | what the tools and the blind run get: video.mkv from 21.0 s for 177.0 s (Important Info card with the title cut by 21.0 s; the fade to the end card starts at 197.91 s), crop 1920x648 (tab strip and logo banner gone) plus a black box x 1425, y 0, w 495, h 205 over the logo, x264 crf 16 (preset medium, GOP 50), Opus audio copied, metadata stripped (only encoder tags remain). 8851 frames, 50 fps, 177.02 s. gtr-run r0765 |
| `standard.full.mp4` | the same cut, uncropped (1920x1080, tab strip visible) |
| `standard.wav`, `.mono.wav` | 44.1 kHz 16-bit from standard.mp4, 177.00102 s. **t = 0 is video.mkv audio 20.992494 s** (cross-correlation at 5, 90 and 170 s, r >= 0.9995, `work/.../off.json`) |
| `standard.seg30.wav`, `.seg30.mono.wav`, `.seg30.mp4` | the segment of `songs.json` (mkv 21.0-51.0 s) = standard time 0.0-30.0 s (seg30.mp4 is a stream copy, 30.04 s) |
| `truth/standard/standard.truth.json` | the truth, schema of `EXPERIMENTS.md` "Scoring"; `scored_range` [0, 177.00102]; every note has `conf` |
| `standard.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.gp5`, `.tab.txt` | side files (scores below) |
| `standard.tab-merged.json` | the merged reading (reader a + a `merge` block); `read-a.json`, `read-b.json` the two readings |
| `standard.video.json` | video truth: fps, size, capo 0, 3 pose ranges with neck quadrilaterals, 6 labelled frames |

## Source and credit

*Imagine* (John Lennon, 1971), solo fingerstyle arrangement, tab and performance by Gareth Evans. Credit line:
"Imagine (John Lennon), fingerstyle arrangement, tab and performance by Gareth Evans (goliathguitartutorials.com).
Video from his YouTube channel, via the Internet Archive." Source: https://archive.org/details/gareth-evans_202101
(YouTube wEtU5g9RNwQ, 2016-10-14). Licence: none stated in the archive item (a third-party mirror); the YouTube
original carries the standard YouTube licence; a cover of a major-label composition; his GP file and PDF are now sold.

## Tuning and capo, and how each was confirmed

- **The tab and the video**: the Important Info card (to 20.8 s) says "Tuning Standard" and "No Capo" (reader b, and
  the frame at 20.4 s in `work/.../frames/edges.png`). The tab strip shows no tuning letters (Guitar Pro prints them
  only for a non-standard tuning).
- **The picture**: nut and frets 1 to 20 are in view, no capo anywhere (frame 9.0 s, `frames/grid_30.png`,
  `ends_30.png`); the chord shapes seen sit at the tab's frets counted from the nut (C shape at frets 1-3 in bar 1, F
  with the thumb over the top at fret 1, E shape at frets 4-6 in bar 30; the inlays at 3, 5, 7, 9, 12 check the count).
- **The sound**: the truth synthesized as written matches the recording at chroma 0.787, a semitone up 0.453, down
  0.425 (below). The lowest note, E2 (open string 6, MIDI 40), is the lowest the tab asks for and is heard where the
  tab puts it (bar 30 pos 2.0: CQT rise at E2/E3 at 93.6 s, confirmed `tab+audio`); open strings G3 and B3 ring at
  their tab places (134 open-string notes, 95 confirmed `tab+audio`; all 9 E2 notes confirmed).
- **Cents**: +5.64 cents median over 485 confirmed notes (spectral peak 60-300 ms after the onset, IQR +2.6 to +9.5;
  per string: s4 +2.0, s2 +5.2, s3 +5.1, s5 +7.1, s6 +12.2), librosa `estimate_tuning` +3.0. Recorded as
  `tuning_offset_cents` **6** (the note median rounded, the same rule as the capo truth). `work/.../tuning.json`.

## Method

1. **Readers compared** (`bin/compare_readers.py` -> `compare.json`): 853 notes each, **853 identical** in bar,
   position, string, fret and length, **0 differ**. Neither reader marked a doubt. The only difference in marks: bars
   13, 25 and 45 pos 3.0, string 2 fret 5: reader a "slide in from below", reader b "slide from the tied fret 1". I
   looked at pages 4, 7 and 12 enlarged (`frames/slide_marks.png`, `p04_glyphs.png`): the glyph is a short detached
   "/" just left of the 5, the same glyph as the slide-in to s3 fret 9 both readers agree on (bars 16, 28, 48); the
   legato slides of bar 14 are drawn digit to digit under a slur. Settled for reader a. The notes are the same either
   way. Wrist thumps "(o)": 118 in both (a keeps them as bar texts, b as events).
2. **Bar times from the Guitar Pro cursor** (`bin/cursor_track.py`, `bin/bar_fit.py`): the blue cursor was tracked in
   all 8865 frames of the strip; 14 pages of 4 bars, cursor jumps 57-69 px at every bar line (the next largest 24 px).
   The cursor runs at a constant **75.997 bpm** (3.15802 s per bar; residuals within +-53 ms, the screen capture's
   steps). The performer plays to it: the audio sits 0.111 s before the cursor grid, then within about +-0.1 s.
3. **Events to the audio** (`bin/align.py`): every tab event placed on the grid plus that lag, then moved by a
   Viterbi path (+-0.3 s, a penalty on changes) that maximizes CQT pitch rises of the event's notes plus the onset
   envelope. Event moves: median +8 ms, 5th-95th percentile -97 to +66 ms; a few pushed downbeats up to -172 ms
   (bars 33, 53, 55: checked on the spectrogram, `frames/diag_pair.png`, the chord really starts early).
4. **Note onsets** (`bin/refine.py`, `bin/refine_arp.py`): each note moved to the peak of a short-window spectral flux
   of its own harmonics (STFT 2048, hop 2.9 ms, harmonics 1-8) within -40..+120 ms. The first estimate from the long
   low-frequency CQT windows ran early: the flux moved 670 of 673 tab notes by a median of +45.9 ms (found by the
   model check below, fixed without the model). In rolled chords (tab arpeggio mark, 24 events) a note not later
   than the string below it moves to its own first flux peak 5-100 ms after that string (60 notes, median +57 ms):
   their harmonics overlap the bass (C4 is the 3rd harmonic of F2).
5. **conf**: `tab+audio` = a rise of 3 dB or more in the CQT at the note's pitch (or its octave below E3) at the
   onset; `tab` = not confirmed that way; `audio` = heard, not in the tab (departures).
6. **Offsets** are a let-ring rule ("let ring throughout" is written at bar 1), not measured: the next attack on the
   same string (pitched or X slap) minus 10 ms, at most max(2.0 s, written length), end of file. Use onset metrics.
7. **Beats and downbeats**: the tab's quarter-note positions (224 = 56 bars x 4), times interpolated between aligned
   events (exact where an event sits on the beat); downbeats = beat 1 of each bar. `tempo_bpm` 76.14 = 60 / median
   beat interval. Time signature 4/4 from the tab.
8. **Chords**: the tab has **no chord names**, so they are **derived from the truth notes** per half bar: pitch
   classes weighted by how long each note sounds inside the half bar, the lowest note attacked +1, major/minor
   templates; a half bar with only slaps keeps the previous label; 9 exact ties (no third played: bars 14, 16, 26,
   28, 46, 48) go to the chord diatonic in C major (D:min, G:maj). Merged into 70 segments: verse C | F, bridge
   F Am | Dm Am | G | G, chorus F G | C E | F G | C E | F G | C E | F Dm | C. Sevenths (the intro's Cmaj7 colour, the
   chorus E7) are **not** labelled, so `sevenths` scores only triads.
9. **Key**: C major (Krumhansl profile of the notes; A minor second).
10. **Taps**: 93 `string-slap` (the X notes, "XX = percussive thumb slap"; "(lh)" over one X in bars 12, 24, 44) and 118
    `thump` ("(o) = wrist thump"); 15 thumps over tied notes or a rest are interpolated on the beat grid.
11. **Voice** is a rule, not from the tab: per event the highest note on strings 1-3 is melody, the lowest on strings
    4-6 bass, the rest chord (the capo truth uses the same rule); the 3 heard-only notes are chord.

## Covered range and counts

Whole piece: `scored_range` [0.0, 177.00102] s, bars 1-56, no repeat signs (all bars written out), all 56 bars seen
by the cursor in order. Notes **676**: `tab+audio` **574**, `tab` **99**, `audio` **3**; voice bass 275, melody 316,
chord 85; pitches E2 (40) to G4 (67); first onset 0.448 s, last 174.621 s. Beats 224, downbeats 56, chord segments 70
(C:maj, F:maj, G:maj, A:min, D:min, E:maj, N), taps 211. `gtr-eval check-truth`: **6931 checks, 0 mismatches**
(`logs/check_truth.log`).

## Departures from the tab (the truth follows the performance)

- **Added**: an open G3 (string 3) sounds with the tab's note at bar 31 pos 3.5 (97.98 s), bar 49 pos 3.75 (155.06 s)
  and bar 51 pos 3.5 (161.13 s): CQT at G3 rises from about -33 dB to -21..-25 dB (+8.0 to +12.0 dB), the guitar
  model hears a 1.0-1.2 s G3 at each, and no harmonic of a sounding note falls on G3. In the truth as conf `audio`,
  timed with the tab note they sound with (`work/.../departures.json`).
- **Not added** (doubtful, listed in the same file): a G2 after the X slaps of bars 29 and 33 (+7.2 and +4.1 dB, s6
  still fretted at 3: possibly the slapped string ringing on), an A2 brushed 0.18 s before the bar 50 chord (+6.3 dB),
  the pitched thuds of the "(lh)" slaps at the end of bar 24 (already taps), a B3 at -40 dB.
- **Left out by the player?** None proven. 26 tab notes are neither heard by the guitar model nor confirmed by a CQT
  rise; nearly all are re-plucks of a pitch still ringing (G3, C3, A3, C4, E3 repeats), so they stay in as `tab`.
  The other way round, the guitar model's 116 notes that match no truth note are 78 the same pitch still sounding,
  11 an octave or twelfth of a sounding note, 19 at a slap or thump, 8 other (the doubtful ones above)
  (`bin/unmatched.py`, `logs/unmatched_final.log`).
- **Fingering**: no other fingering seen in the frames checked (6 labelled frames, 13 check frames); the frames agree
  with the tab's positions, including the slide into s3 fret 9 (bar 16) and s2 fret 5 (bar 13).

## Checks, with numbers

| check | result | file |
|---|---|---|
| guitar-fl.pth (guitar-trained model) on standard.mono.wav, gtr-run r0767 | onset P 0.842, R 0.914, **F1 0.877**; onset+offset F1 0.557; recall bass 0.942, chord 0.882, melody 0.899 (eval e1896) | `work/.../gfl/`, `logs/eval_gfl_final.json` |
| the same per 10 s | 0.97 0.99 0.99 0.85 0.86 0.87 0.95 0.82 0.80 0.92 0.89 0.75 0.86 0.84 0.75 0.87 0.90 0.81 (0-10 s ... 170-177 s): no stretch far low | `logs/gfl_per10.log` |
| timing against guitar-fl (nearest same-pitch onset, 633 notes) | median 0.0 ms, 10th-90th percentile -10.9 to +9.5 ms, 618 within 50 ms | `logs/offset_gfl.log` |
| Basic Pitch 0.4.0 (tflite) on standard.wav, r0768 | onset P 0.534, R 0.843, **F1 0.654**; onset+offset 0.341 (eval e1897); per 10 s 0.51-0.78 | `work/.../bp/`, `logs/bp_per10.log` |
| first truth, before the onset fix | guitar-fl F1 0.449, the model's onsets +49 ms later everywhere (eval e1890): what led to step 4 | `logs/eval_gfl_v1.json` |
| truth synthesized (FluidR3 steel guitar) vs the recording, chroma | **0.787**; per 10 s 0.70-0.89 (lowest 70-80 s, 0.697); +1 semitone 0.453, -1 semitone 0.425 | `work/.../chroma_check.json` |
| 10 notes by hand, spectrogram slice and video frame at the onset | CQT at the note's pitch rises 8.6 to 29.8 dB in 9 of 10; bar 45 pos 0.75 (s3 f2, a re-pluck of a ringing A3) +1.8 dB only. Fretting hand at frets 1-4 in 10 of 10 (string not resolvable at that scale). 3 more at high frets: bar 16 hand sliding over frets 7-10 into s3 f9, bar 13 index on s2 f5, bar 30 E shape at frets 4-6 | `work/.../handcheck.json`, `handcheck_spec.png`, `handcheck_frames.jpg`, `handcheck_highfret.jpg` |
| side files against the JSON (`--no-ledger`) | notes.csv onset and onset+offset F1 1.0; .mid 1.0 (onset+offset 0.996, tick rounding); .tab.txt 676/676 same string and fret; beats.txt beats F 1.0, downbeats 1.0 (`--downbeat-col 2`); chords.lab root, majmin, sevenths 1.0; .gp5 with `--time-shift 0.4981`: tab 647/676 and notes F1 0.957 (Guitar Pro gives a beat one time: the 29 others are rolled-chord notes more than 50 ms after their beat; every matched note has the same string and fret), onset+offset 0.411 (written lengths) | `logs/sidefiles.log` |

**GP5 time 0 = 0.4981 s of standard.wav** (one beat per tab event, rests as rests, a hidden tempo change on every
beat so each beat starts at its aligned time; the 3 heard-only notes included).

## Video truth (`standard.video.json`)

50 fps, 1920x648 (standard.mp4; the same coordinates in standard.full.mp4), av offset 0 (the picture lags the sound
by 14.5 ms, under one frame), not mirrored (right-handed, string 6 at the top), capo_fret 0. One static camera shot,
but the guitar moves inside it (the nut drifts from x 1855 to about 1915 and 60 px down), so it is given as three pose
ranges: 0-50 s, 50-100 s, 100-177.02 s, each with its quadrilateral (nut-upper, nut-lower, body-lower, body-upper) and
frets_visible [0, 20]. Pose A's corners were read on a frame; in B and C the nut corners come from a nut tracker and
the body-end corners are pose A shifted by the measured mid-neck drift (about +-20 px). Six labelled frames, two per
range, each looked at in a 2x zoom: 1.51 s (C chord: index [2,1], middle [4,2], ring [5,3]), 40.85 s (index [2,5]),
89.26 s and 101.52 s and 170.95 s (F: thumb s6 f1, index [2,1], middle [3,2], ring [4,3]), 93.62 s (E shape: index
[3,4], middle [2,5], ring [4,6]); pinkies hovering (null).

## What remains uncertain

- **Offsets** are estimates (let ring), not measured: onset+offset scores mean little here.
- **Voice** labels and **chord** labels are derived by rule, not given by the tab; D:min and G:maj in 9 half bars
  rest on a tie-break (no third played); sevenths are not labelled.
- **99 `tab` notes** are not confirmed at their onset (re-plucks of ringing pitches, a few legato notes); their
  times come from their event. Bar 37's downbeat C4 is one: neither the model nor the CQT hears it.
- **Rolled chords**: the order rule fixes the upper notes' onsets to within the model's agreement, but a roll's
  individual onsets are the least certain times in the file (60 notes, up to +157 ms after the bass).
- **The 3 `audio` notes** were found with the guitar model's help (a model note at an onset with no truth note), then
  confirmed on the CQT; that is 3 of 676 notes in the model check.
- **Chroma 0.70-0.80** in the middle of the piece (verses 2-3, chorus) against 0.87-0.89 at the start: percussion
  (slaps, thumps) and the let-ring offsets lower it; the note timing there agrees with the model at 0.75-0.92 F1.
- **Video**: body-end corners in poses B and C are extrapolated (+-20 px); the string of a fingertip was read only
  in the 2x zooms of the 6 labelled frames.

## Scripts (in `/home/user/gtv/work/truth-standard/bin/`)

`encode.sh` (inputs), `compare_readers.py`, `merge.py`, `cursor_track.py`, `bar_fit.py`, `features.py`, `align.py`,
`refine.py`, `refine_arp.py`, `tuning.py`, `build_truth.py` (truth + side files; `departures.json`), `write_gp5.py`,
`chroma_check.py`, `per10.py`, `offset_vs.py`, `unmatched.py`, `handcheck.py`, `labzoom.py`, `neck_shift.py`,
`nut_track.py`, `diag.py`. Order: encode, compare, merge, cursor, bar_fit, features, align (0.6 0.3), refine,
refine_arp, tuning, build_truth (aligned_arp.json 6), write_gp5, then the checks.
