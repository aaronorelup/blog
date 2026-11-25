# Ground truth: standard (*Imagine*, Gareth Evans)

Truth builder, stage 2, 2026-11-25 (agent `truth-standard`). Everything a tool is scored against for the `standard`
slot. Heavy files and every script: `/home/user/gtv/truth/standard/`, `/home/user/gtv/songs/standard/`,
`/home/user/gtv/work/truth-standard/` (`bin/`, `logs/`, `PROGRESS.md`). Every number below comes from a file named
next to it.

**In one paragraph.** 680 notes over the whole piece (0 to 177.00 s of `standard.wav`, all 56 bars, nothing left
out), strings and frets from Gareth Evans' own on-screen Guitar Pro tab, read twice independently (853 of 853 tab
notes identical), timed to the recording, and following the performance where it departs from the tab. Standard
tuning, no capo, +6 cents sharp. 573 notes are confirmed by a pitch rise in the audio at their onset, 96 come from the
tab alone (mostly re-plucks of a pitch that is still ringing), 11 are heard but not in the tab. The guitar-trained
model scores onset F1 0.891 against it and Basic Pitch 0.663, both in or near the range the research saw on real
guitar; the truth's timing agrees with the model's notes to a median of 0.0 ms. Repaired twice after independent
checks: 14 onsets re-timed, bar 36 and the rolled-chord rule (Repairs); then 2 notes re-pitched, 2 unplayed tab notes
removed, 6 played notes added, and the video's neck outline tracked through the whole video, now 76 poses instead of 3
(Repairs, second round, at the end).

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
| `truth-standard-repairs.csv` (next to this record) | every note the repair changed, before and after, with its evidence (Repairs) |
| `truth-standard-repairs2.csv` (next to this record) | every note the second repair changed, before and after, with its evidence (Repairs, second round) |
| `standard.video.json` | video truth: fps, size, capo 0, 76 pose ranges with neck quadrilaterals, 6 labelled frames |
| `standard.neck_track.json` | the neck outline tracked every 5 frames (0.1 s), raw and 0.5-s-smoothed, that the poses come from |

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
   model check below, fixed without the model). In rolled chords (tab arpeggio mark, 24 events) the flux of an upper
   note is mixed with the lower notes' harmonics (C4 is the 3rd harmonic of F2), so a note not later than the string
   below it (60 notes) is timed on its clean partials when at least two agree within 25 ms (8 notes), and otherwise
   moved to its own first flux peak 5-100 ms after that string (51 notes; 1 timed by hand). This is the repaired rule
   (`refine_arp_v2.py`, Repairs); the first build forced all 60.
5. **conf**: `tab+audio` = a rise of 3 dB or more in the CQT at the note's pitch (or its octave below E3) at the
   onset (read at the alignment's onset; for the 14 notes the repair re-timed, at the new onset); `tab` = not confirmed
   that way; `audio` = heard, not in the tab (departures).
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
    4-6 bass, the rest chord (the capo truth uses the same rule); the 11 heard-only notes are chord.

## Covered range and counts

Whole piece: `scored_range` [0.0, 177.00102] s, bars 1-56, no repeat signs (all bars written out), all 56 bars seen
by the cursor in order. Notes **680**: `tab+audio` **573**, `tab` **96**, `audio` **11**; voice bass 274, melody 313,
chord 93; pitches E2 (40) to G4 (67); first onset 0.448 s, last 174.621 s. Beats 224, downbeats 56, chord segments 70
(C:maj, F:maj, G:maj, A:min, D:min, E:maj, N), taps 211. `gtr-eval check-truth`: **6971 checks, 0 mismatches**
(after the second repair: `work/truth-fix2-standard/logs/chk_final2_checktruth.log`).

## Departures from the tab (the truth follows the performance)

- **Added**: an open G3 (string 3) sounds with the tab's note at bar 31 pos 3.5 (97.98 s), bar 49 pos 3.75 (155.06 s)
  and bar 51 pos 3.5 (161.13 s): CQT at G3 rises from about -33 dB to -21..-25 dB (+8.0 to +12.0 dB), the guitar
  model hears a 1.0-1.2 s G3 at each, and no harmonic of a sounding note falls on G3. In the truth as conf `audio`,
  timed with the tab note they sound with (`work/.../departures.json`).
- **Second repair** (Repairs, second round): at bar 17 pos 0.75 (51.66 s) and bar 39 pos 0.75 (121.20 s) the player
  plays E3 s4 f2 where the tab has G3 s3 f0; bar 39's pos-1.0 E3 (121.37 s) and bar 45's pos-2.0 C4 (141.13 s) are not
  played (the C4 comes a sixteenth early, 140.86 s); six played notes were missing (A3 bar 10, G2 bar 27, E3 bars 30 and
  34, C4 bar 45, D3 bar 53). The 8 notes in place are conf `audio`, each timed on its own onset.
- **Not added** (doubtful, listed in the same file): a G2 after the X slaps of bars 29 and 33 (+7.2 and +4.1 dB, s6
  still fretted at 3: possibly the slapped string ringing on), an A2 brushed 0.18 s before the bar 50 chord (+6.3 dB),
  the pitched thuds of the "(lh)" slaps at the end of bar 24 (already taps), a B3 at -40 dB.
- **Left out by the player?** Two proven in the second repair (above). 22 tab notes are neither heard by the guitar
  model nor confirmed by a CQT rise; nearly all are re-plucks of a pitch still ringing (G3, C3, A3, C4, E3 repeats), so
  they stay in as `tab`. The other way round, the guitar model's 104 notes that match no truth note are 72 the same
  pitch still sounding, 10 an octave or twelfth of a sounding note, 14 at a slap or thump, 8 other (the doubtful ones
  above) (`bin/unmatched.py`; after the second repair `work/truth-fix2-standard/logs/chk_after2_unmatched.log`; 112 =
  76/11/17/8 after the first, 116 = 78/11/19/8 before it).
- **Fingering**: no other fingering seen in the frames checked (6 labelled frames, 13 check frames); the frames agree
  with the tab's positions, including the slide into s3 fret 9 (bar 16) and s2 fret 5 (bar 13). The E3-for-G3 notes
  of the second repair are another string plucked inside the same C shape (s4 f2 is held), not another fingering.

## Checks, with numbers

| check | result | file |
|---|---|---|
| guitar-fl.pth (guitar-trained model) on standard.mono.wav, gtr-run r0767 | onset P 0.858, R 0.926, **F1 0.891**; onset+offset F1 0.571; recall bass 0.953, chord 0.903, melody 0.911 (eval e2175, second repair; e1968 after the first: F1 0.882; first build e1896: 0.877) | `work/.../gfl/`, `work/truth-fix2-standard/logs/chk_final2_gfl.json` |
| the same per 10 s | 0.97 0.99 1.00 0.85 0.86 0.90 0.95 0.82 0.82 0.93 0.91 0.84 0.90 0.84 0.78 0.87 0.91 0.81 (0-10 s ... 170-177 s; 110-120 s was 0.75 before the repair of bar 36) | `work/truth-fix2-standard/logs/chk_after2_per10.log` |
| timing against guitar-fl (nearest same-pitch onset, 638 notes) | median 0.0 ms, 10th-90th percentile -10.9 to +9.3 ms, 630 within 50 ms (622 of 633 after the first repair, 618 before it) | `work/truth-fix2-standard/logs/chk_after2_offset_gfl.log` |
| Basic Pitch 0.4.0 (tflite) on standard.wav, r0768 | onset P 0.543, R 0.851, **F1 0.663**; onset+offset 0.348 (eval e2176; e1969 after the first repair: 0.656; first build e1897: 0.654); per 10 s 0.51-0.78 | `work/.../bp/`, `work/truth-fix2-standard/logs/chk_after2_per10.log` |
| first truth, before the onset fix | guitar-fl F1 0.449, the model's onsets +49 ms later everywhere (eval e1890): what led to step 4 | `logs/eval_gfl_v1.json` |
| truth synthesized (FluidR3 steel guitar) vs the recording, chroma | **0.786**; per 10 s 0.70-0.89 (lowest 70-80 s, 0.697); +1 semitone 0.454, -1 semitone 0.425 (0.787, 0.453, 0.425 before the second repair) | `work/.../chroma_check.json`, `work/truth-fix2-standard/logs/chk_after2_chroma.log` |
| 10 notes by hand, spectrogram slice and video frame at the onset | CQT at the note's pitch rises 8.6 to 29.8 dB in 9 of 10; bar 45 pos 0.75 (s3 f2, a re-pluck of a ringing A3) +1.8 dB only. Fretting hand at frets 1-4 in 10 of 10 (string not resolvable at that scale). 3 more at high frets: bar 16 hand sliding over frets 7-10 into s3 f9, bar 13 index on s2 f5, bar 30 E shape at frets 4-6 | `work/.../handcheck.json`, `handcheck_spec.png`, `handcheck_frames.jpg`, `handcheck_highfret.jpg` |
| side files against the JSON (`--no-ledger`) | notes.csv onset and onset+offset F1 1.0; .mid 1.0 (onset+offset 0.996, tick rounding); .tab.txt 680/680 same string and fret; beats.txt beats F 1.0, downbeats 1.0 (`--downbeat-col 2`); chords.lab root, majmin, sevenths 1.0; .gp5 with `--time-shift 0.4981`: tab 652/680 and notes F1 0.959 (Guitar Pro gives a beat one time: the 28 others are notes more than 50 ms from it, nearly all upper notes of rolled chords, and the added bar-34 E3, 71 ms before its beat; every matched note has the same string and fret; 649/676 and 0.960 after the first repair, 647 and 0.957 before it), onset+offset 0.407 (written lengths); `--ignore-time` 680/680 | `work/truth-fix2-standard/logs/chk_final2_side.log` |

**GP5 time 0 = 0.4981 s of standard.wav** (one beat per tab event, rests as rests, a hidden tempo change on every
beat so each beat starts at its aligned time; the 11 heard-only notes included, the added G2 of bar 27 and C4 of bar 45
as beats of their own at pos 1.5 and 1.75).

## Video truth (`standard.video.json`)

50 fps, 1920x648 (standard.mp4; the same coordinates in standard.full.mp4), av offset 0 (the picture lags the sound
by 14.5 ms, under one frame), not mirrored (right-handed, string 6 at the top), capo_fret 0. One static camera shot,
but the guitar moves inside it: the nut end swings up and down (nut-upper y 158 to 291, x 1845 to 1919) within a
second or two, while the body end moves little up and down and slides sideways with the guitar (x 372 to 442). The first build gave three pose ranges (0-50, 50-100, 100-177.02 s); the
second repair replaced them with **76 poses** (p01 to p76, 0.2 to 14.6 s long, median 1.7 s) cut from the neck outline
tracked every 0.1 s (`standard.neck_track.json`; Repairs, second round). Each has its quadrilateral (nut-upper,
nut-lower, body-lower, body-upper), frets_visible [0, 20] and `quad_frame` (the frame whose tracked outline is closest
to it). p01 (0-14.55 s) keeps the corners read by hand on the frame at 9.0 s, within 1 px. Six labelled frames (in
poses p01, p09, p31, p32, p36, p73), each looked at in a 2x zoom: 1.51 s (C chord: index [2,1], middle [4,2], ring [5,3]), 40.85 s (index [2,5]),
89.26 s and 101.52 s and 170.95 s (F: thumb s6 f1, index [2,1], middle [3,2], ring [4,3]), 93.62 s (E shape: index
[3,4], middle [2,5], ring [4,6]); pinkies hovering (null).

## What remains uncertain

- **Offsets** are estimates (let ring), not measured: onset+offset scores mean little here.
- **Voice** labels and **chord** labels are derived by rule, not given by the tab; D:min and G:maj in 9 half bars
  rest on a tie-break (no third played); sevenths are not labelled.
- **96 `tab` notes** are not confirmed at their onset (re-plucks of ringing pitches, a few legato notes); their
  times come from their event. Bar 37's downbeat C4 is one: neither the model nor the CQT hears it. Another is bar 17's
  pos-1.0 G3 (#198 before the second repair, 51.877 s): an X slap falls there, and the G3's own partials drop 9-10 dB
  after it instead of rising, while guitar-fl and Basic Pitch report a G3 there and guitar-gaps does not. It stays
  (`work/truth-fix2-standard/out/ev_p1.json`).
- **Rolled chords** are the least certain times in the file: 51 upper notes have fewer than two clean partials (no
  partial of their own for C4 or F3 over F2 and E4 over E3; only the fundamental for B3 over G2) and are placed by the
  order rule; 10 of the 72 upper roll notes are more than 100 ms after their bass (at most 174 ms, bar 1). In the G
  rolls of bars 15, 27 and 47 a faint B3 sounds
  from the chord's first attack; the truth times the B3's main rise 50-90 ms later, where guitar-gaps and guitar-fl
  put it at the first attack (Repairs, Problem 2).
- **The 11 `audio` notes** were found with the models' help: the first 3 from a guitar-fl note with no truth note, the 8
  of the second repair from the independent check (guitar-fl and guitar-gaps agreeing), each then confirmed on the
  spectrum without the models. That is 11 of 680 notes in the model checks.
- **Chroma 0.70-0.80** in the middle of the piece (verses 2-3, chorus) against 0.87-0.89 at the start: percussion
  (slaps, thumps) and the let-ring offsets lower it; the note timing there agrees with the model at 0.75-0.92 F1.
- **Video**: a pose's quad holds every 0.5-s-smoothed tracked outline within 10 px, but in quick movements the outline
  leaves it for a moment: 3.3% of the raw 0.1-s samples are 15 to 38 px away (a note there can land a string off). The
  string of a fingertip was read only in the 2x zooms of the 6 labelled frames.

## Scripts (in `/home/user/gtv/work/truth-standard/bin/`)

`encode.sh` (inputs), `compare_readers.py`, `merge.py`, `cursor_track.py`, `bar_fit.py`, `features.py`, `align.py`,
`refine.py`, `refine_arp.py`, `tuning.py`, `build_truth.py` (truth + side files; `departures.json`), `write_gp5.py`,
`chroma_check.py`, `per10.py`, `offset_vs.py`, `unmatched.py`, `handcheck.py`, `labzoom.py`, `neck_shift.py`,
`nut_track.py`, `diag.py`. Order: encode, compare, merge, cursor, bar_fit, features, align (0.6 0.3), refine,
refine_arp, tuning, build_truth (aligned_arp.json 6), write_gp5, then the checks.

## Repairs

Done 2026-11-25 by the truth-fix-standard agent after the independent check (`truth-standard-check.md`, PROBLEMS 1
and 2). Work folder `/home/user/gtv/work/truth-fix-standard/` (below `F/`: `bin/`, `logs/`, `out/`, `frames/`,
`PROGRESS.md`; the first build in `orig/`, SHA-256 `4227f6c4e19e...`). Repaired `standard.truth.json`: SHA-256
`12675764353539fb...` (`F/logs/installed.sha256`). Every changed note, before and after, with its evidence:
`truth-standard-repairs.csv` (next to this record).

**Own evidence** (`F/bin/cleanpart.py`, `F/bin/evid.py`), independent of the builder's alignment and of the checker's
code: a note's *clean* partials are the harmonics that no partial of any other sounding note comes near (outside the
main lobe of a Hann window of 2048, 4096 or 8192 samples, the shortest that separates them). On each, the linear
magnitude of a centred window rises fastest where the tone starts, whatever the window length. On the bar-36 notes
where the truth and the models already agreed (#430, #431, #433, #434) it lands 1-12 ms from the truth and 1-16 ms
from the models. Attack transients:
positive spectral flux above 2 kHz. guitar-fl, guitar-gaps (the checker's run) and Basic Pitch were used only to
check a result, never to set a time.

### Problem 1, bar 36 (111.0-113.2 s): fixed, 5 notes and 1 beat

| note | before | own evidence | gfl / gaps / BP | after |
|---|---|---|---|---|
| #429 G2 s6 f3, pos 1.0 | 111.785 | clean h1 111.961, h3 111.934, h7 111.907, h9 111.894 (median 111.920) | 111.919 / 111.921 / 111.922 | **111.920** (+135 ms) |
| #432 C3 s5 f3, pos 2.5 | 112.969 | h1 113.096, h7 113.105; the C3 line stops at 112.71 when the A2 takes string 5 and returns at 113.10 | 113.100 / 113.102 / 113.107 | **113.100** (+131) |
| #425 G3 s3 f0, roll | 111.161 | h1 111.080, h3 111.069, h7 111.070 (+35 dB); rule v2 below: 111.075 | 111.072 / 111.075 / 111.097 | **111.075** (-86) |
| #424 E3 s4 f2, roll | 111.094 | h1 111.066, its only strong clean partial (its harmonics-1-8 flux shares h2, h4 with E4); set by hand | none of the three hears an E3 here | **111.066** (-28) |
| #426 E4 s1 f0, roll | 111.176 | no clean partial (octave of E3); the order rule after G3 gives 111.097 | 111.083 / 111.076 / 111.085 | **111.097** (-79) |
| beat 2 of bar 36 | 111.820 | the time of the pos-1.0 event, which now follows the G2 | madmom 111.93 | **111.920** |

The roll's C3 (#423, 111.042; own 111.050) was right: the roll now runs C3 111.042, E3 111.066, G3 111.075, E4 111.097,
inside the roll's attack transients (111.049 to 111.105, nothing after). The bass line G2 C3 A2 C3 B2 C3 now moves in
even eighths (0.38-0.41 s apart; before 0.54, 0.39, 0.26, 0.54, 0.38). Cause: the alignment's CQT onsets of these two
notes (111.774, 112.976) were 146 and 124 ms early, beyond the +120 ms reach of the flux refinement, which took a
smaller flux peak inside its window; in the roll, the forcing rule below.
Evidence: `F/logs/evid1.log`, `F/logs/roll36.log`, `F/frames/evid1_bar36.png`, `F/frames/roll36.png`; the hand-set
times are in `F/out/overrides.json`, each with its reason.

### Problem 2, rolled-chord top notes #177, #312, #636: not a problem (kept); the forcing rule changed

- **#636** B3 (bar 53 pos 2.0, 166.285; no arpeggio mark, so `refine_arp.py` never touched it): five of its seven
  clean partials start at 166.274-166.294 (h1 166.292, h3 166.280, h5 166.294, h7 166.292, h9 166.274; h6 166.207,
  h10 166.425); guitar-fl (166.275) and Basic
  Pitch (166.292) agree with the truth, only guitar-gaps has 166.233; the B3 line starts at about 166.28
  (`F/frames/evid1_bar53.png`). The checker's pitch flux peaks with the G2 because B3's 2nd, 4th and 6th harmonics
  coincide with G2's 5th, 10th and 15th.
- **#177** B3 (bar 15, 44.789) and **#312** B3 (bar 27, 82.696), tops of G2 D3 G3 B3 rolls: the B3 fundamental
  (247.8 Hz) is clean against G2, D3 and G3, and with an 8192 window against the C4 the same string played before
  (262.5 Hz). Its steepest rise is at 44.80-44.84 (13-47 ms after the truth) and 82.686-82.717 (at it), not at the
  bass. At the chord's first attack (44.741,
  82.610) it is only 4-10 dB above a neutral frequency (238 Hz) and 8-14 dB under its peak; 50-90 ms later it rises
  by those 8-14 dB (`F/frames/b3_fundamental.png`, `F/bin/levels.py`; bar 47's G roll, #558, is the same). The truth
  times that main rise; Basic Pitch agrees in bar 27 (82.704). guitar-gaps puts these rolls in one frame (bar 15: G2,
  D3 and B3 all at 44.735), and the checker's pitch flux carries the harmonics B3 shares with G2 plus the attack's
  noise. Caveat: in bar 27 a faint B3 (-45 dB against -31 at its peak) sounds from the first attack; a tool that
  reports the B3 there is 83 ms off the truth.
- **The rule**, `F/bin/refine_arp_v2.py` (replaces `refine_arp.py`, which is left as it was): a roll note that is not
  later than the string below it is now timed on its clean partials when at least two of them agree within 25 ms
  (searched from 10 ms before the bass to 200 ms after it, a rise in the first 5 ms not counting; the sounding notes
  for the clean test include each string's last note unless an X slap muted it); otherwise it is forced as before
  (first own-flux peak 5-100 ms after the string below), since it has no evidence of its own. Of the 60 notes the
  first build forced, 8 are now timed on clean partials, 51 are still forced, 1 is set by hand (#424). Besides bar 36
  this moves bar 1 G3 +9 ms, bar 3 G3 -31 and C4 -32 (forced after the G3), bar 29 A3 -21 and C4 -11, bar 30 E4 -12,
  bar 35 A3 +4, bar 53 A3 +14, bar 56 G3 +2; after it each is within 19 ms of guitar-fl and of guitar-gaps (before: up
  to 45 ms; `F/logs/arp_fix_diff.log`). It keeps #177 and #312 (only their fundamental is clean, and it agrees with the
  forced time). Without the 10 ms start it would have moved bar 25's A3 (#289, heard by no model) 98 ms earlier, to
  17 ms before its bass, on a thud of the left-hand slaps that end bar 24.

### Notes, beats, side files

- **14 onsets** changed (bar 36's five, the rule's nine), **10 notes** get a new let-ring offset only (the next attack
  on their string moved), **1 conf**: `rise_db` was measured again at the new onset of all 14 with the builder's CQT
  measure; 13 keep 3 dB or more, bar 3's C4 (#32, an octave over the bass) has -1.3 dB and is now `tab`. Counts 573
  `tab+audio`, 100 `tab`, 3 `audio` (574 / 99 / 3 before). Note numbers #30/#31 and #327/#328 swap (sorted by onset).
- **Beats**: 1 of 224 changed (bar 36 beat 2). Downbeats, the 70 chord segments and their labels, the 211 taps, key,
  tempo 76.14, tuning and `scored_range` [0, 177.00102] are unchanged; nothing was cut from the scored range.
- **Side files** rewritten from the JSON by the builder's own code (`F/bin/build_truth_fix.py`,
  `F/bin/write_gp5_fix.py`: copies of `build_truth.py` and `write_gp5.py` with only the folders and two derivation
  texts changed; on the builder's aligned file they rewrite all seven files byte for byte, `F/logs/repro_build.log`).
  `.chords.lab` and `.tab.txt` came out identical; GP5 time 0 is still 0.4981 s. Order now: ... refine,
  `refine_arp_v2.py` (with `out/overrides.json`), `remeasure.py`, `build_truth_fix.py`, `write_gp5_fix.py`,
  `checks.sh`.

| self-check (`F/bin/checks.sh` on the first build and on the repair; `F/logs/summary_before.log`, `summary_after.log`, `final_*`) | before | after |
|---|---|---|
| `gtr-eval check-truth` | 6931 checks, 0 mismatches | 6931, 0 |
| notes.csv, .mid, .tab.txt, beats.txt, chords.lab against the JSON | 1.0, 1.0 (on+off 0.996), 676/676, 1.0 and 1.0, 1.0 | the same |
| .gp5 (`--time-shift 0.4981`): tab matched, notes F1, onset+offset | 647/676, 0.957, 0.411 | 649/676, 0.960, 0.411 |
| guitar-fl: P / R / F1, onset+offset F1 | 0.842 / 0.914 / 0.877, 0.557 (e1896) | 0.847 / 0.920 / **0.882**, 0.562 (e1968) |
| guitar-fl F1 in 110-120 s (bar 36) | 0.75 | 0.84 |
| truth notes with a same-pitch guitar-fl onset within 50 ms | 618 of 633 | 622 of 633 |
| Basic Pitch: P / R / F1 | 0.534 / 0.843 / 0.654 (e1897) | 0.536 / 0.846 / 0.656 (e1969) |
| guitar-gaps (checker's r0771) F1 | 0.863 | 0.869 |
| madmom (checker's r0772): beats F (matched), downbeats F | 0.978 (219), 0.982 | 0.982 (220), 0.982 |
| truth late: 2 of the 3 models more than 50 ms earlier, none within 30 ms | 5 (#288 #425 #426 #466 #575) | 3 (#288 #466 #575) |
| truth early: the same the other way | 6 (#187 #432 #464 #533 #542 #675) | 5 |
| chroma, synthesized truth vs recording (+1 / -1 semitone) | 0.787 (0.453 / 0.425) | 0.787 (0.453 / 0.425) |
| the 10 notes checked by hand | none of them was re-timed | unchanged |

**Left as they are**, with the reason: #288 F3 and #575 C4 (rolled over an F2 bass, bars 25 and 49) have no partial
of their own (the checker's Doubt 2); bar 49's A3 (#574) also stays 46-57 ms after guitar-fl and Basic Pitch (one of its
two clean partials falls in the rule's first 5 ms). #464 G3 and #466 E3 (bar 39, both `tab`): the models hear a G3 and
an E3 160-180 ms from them, the other way round; not examined here. #187 and #542 are slides into E4 from below, whose
pitch arrives after the pluck; #533 is a roll's bass; #675 is bar 56's last note (Doubt 6).

## Repairs, second round

Done 2026-11-25 by the truth-fix2-standard agent after the second independent check (`truth-standard-check.md`,
"Second check", PROBLEMS 1 to 3). Work folder `/home/user/gtv/work/truth-fix2-standard/` (below `F2/`: `bin/`,
`logs/`, `out/`, `frames/`, `stage/`, `PROGRESS.md`; the files as they were before this round in `orig/`, hashes in
`logs/orig.sha256`). Repaired `standard.truth.json`: SHA-256 `daa4884b3543041b...` (`F2/logs/installed.sha256`).
Every changed note, before and after, with its evidence: `truth-standard-repairs2.csv` (next to this record, 19 rows).

**Own evidence** (`F2/bin/ev2.py`), independent of the builder's alignment, of the first repair's code and of the
checker's code: the magnitude at the exact frequency of each partial (the DFT of a centred Hann frame of 4096 samples,
hop 1 ms; also 2048 and 8192) of `standard.mono.wav`. A partial is *clean* when no harmonic (1 to 30) of any other note
the truth has sounding there falls inside the Hann main lobe. *Rise* = median level 5-30 ms after the frames stop
touching the onset minus the same before it. *Control* = the same rise at frequencies between the harmonics, which is
what a slap, a thump or another attack does there. Onsets of the notes put in (`F2/bin/time_new.py`) follow the
truth's own convention: the peak of the builder's pitch-specific flux (`refine.py`) within 40 ms of the steepest rise
of the clean partials. Run on the 513 tab+audio notes the builder timed by flux, this returns the truth's onset within
3 ms for 505. guitar-fl, guitar-gaps (r0771) and Basic Pitch were used only to check, never to set a time.

### Problem 1, bars 17 and 39: fixed, 2 notes re-pitched and 1 removed

| note before | own evidence | gfl / gaps / BP | after |
|---|---|---|---|
| #196 G3 s3 f0, bar 17 pos 0.75, 51.683 (`tab`) | G3: h1 +4.8 dB, but its clean h3, h7, h9 fall 13.6, 20.5, 6.0 dB. E3: 7 clean partials rise a median 10.8 dB (h1 +29.3), 13.0 dB more than the control | E3 at 51.651 / 51.650 / 51.650 | **E3 s4 f2, 51.6644**, `audio` |
| #464 G3 s3 f0, bar 39 pos 0.75, 121.200 (`tab`) | G3: clean partials median -1.4 dB. E3: h1 +24.4 dB (the E3 line goes from -35 to -11 dB at 121.17-121.25 s), 5 clean partials median +5.8, 5.9 more than the control | E3 at 121.185 / 121.189 / 121.182 | **E3 s4 f2, 121.1966**, `audio` |
| #466 E3 s4 f2, bar 39 pos 1.0, 121.366 (`tab`) | E3 h1 -8.7 dB, clean partials median -1.5, 11.2 below the control: the E3 of pos 0.75 decaying | none | **removed** |

The checker is right on all three. In bar 39 the player swaps the tab's order (E3 at pos 0.75, G3 at pos 1.0; #465
G3 rises and all three models hear it). Bar 17 differs at pos 1.0, where an X slap falls: the E3 (#197) rises again
(E3 line -24 to -9 dB, both models) and stays; the tab's G3 (#198, `tab`) falls 9-10 dB instead of rising, while
guitar-fl and Basic Pitch report a G3 and guitar-gaps does not. It stays as a doubt (What remains uncertain).

### Problem 2, six played notes missing: fixed, 6 added, and bar 45's pos-2.0 C4 removed

| added (all `audio`, voice chord) | own evidence: clean partials, median rise, over the control | onset (flux) | gfl / gaps / BP |
|---|---|---|---|
| A3 s3 f2, bar 10 pos 0.5 (with the C3) | h1 2 5 7 10 11: +14.2 dB (h1 +19.1), +16.5 | 29.3384 | 29.324 / 29.319 / 29.334 |
| G2 s6 f3, bar 27 pos 1.5 (no tab note there) | h1 7 11: +17.7 (h1 +20.2), +12.0 | 83.8908 | 83.875 / 83.874 / 83.877 |
| E3 s4 f2, bar 30 pos 0 (with C3 and C4) | h1 2 5 7 10: +18.0 (h1 +27.7), +9.8 | 92.1020 | 92.089 / 92.091 / 92.068 |
| E3 s4 f2, bar 34 pos 0 (with C3 and C4) | h1 2 5 7 10: +17.8 (h1 +36.6), +17.4 | 104.6436 | 104.676 / 104.677 / 104.684 |
| C4 s2 f1, bar 45 pos 1.75 (no tab note there) | h1 3 7 9: +12.3 (h1 +13.3), +16.6 | 140.8610 | 140.863 / 140.862 / 140.873 |
| D3 s4 f0, bar 53 pos 2.0 (with the G2) | h1 +22.6, h11 +10.9 (the G2's attack leaves no free control bin); with 8192 samples h1 7 11: +20.8 | 166.2055 | 166.220 / 166.219 / 166.234 |

The checker is right on all six. guitar-fl and guitar-gaps sit within 20 ms of the flux onsets (also for the two E3s
of Problem 1) and Basic Pitch within 34 ms, except in bar 34 (32-41 ms later), where the models put the E3 with its chord: there the E3 line rises at 104.63-104.65 s, the C3's at 104.65-104.69 s, and the flux of E3, C3 and
C4 all peak at 104.64 and again at 104.684, so the E3 comes about 40 ms before the C3 and C4 (104.685). Not in the
checker's list, found while checking bar 45: **#541 C4 s2 f1, bar 45 pos 2.0, 141.126 (`tab`) is not played**. Its
clean partials fall (h3 -5.6, h9 +2.7 dB; with 8192 samples five clean partials, median -4.6 dB) and no model has a C4
there; the C4 of 140.861 is the tab's C4 played a sixteenth early. Removed. The C3 both models report at 39.24 s (the
checker's Doubt 4) has no rise of its own here either (8192 samples: clean partials median -3.5 dB): not added.

**Notes, beats, side files.** 4 tab notes out (#196 and #464 as G3, #466, #541), 8 `audio` notes in, 7 notes with a new
let-ring offset only (the next attack on their string moved; listed in the CSV): 676 notes become 680, `tab` 100 to
96, `audio` 3 to 11, `tab+audio` 573 unchanged; voice bass 274, melody 313, chord 93 (heard-only notes stay chord, as
before). Beats, downbeats, the 70 chord segments and their labels, the 211 taps, key, tempo 76.14, tuning and
`scored_range` [0, 177.00102] are unchanged (`F2/logs/compare2.log`; beats.txt and chords.lab byte-identical); nothing
was cut from the scored range. The side files were rewritten from the JSON by `F2/bin/build_truth_fix2.py` and
`F2/bin/write_gp5_fix2.py` (the first repair's scripts plus a changes file, `F2/out/changes2.json`; without it they
rewrite all seven installed files byte for byte, `F2/stage/repro/`). The GP5 has 467 beats (the G2 of bar 27 and the C4
of bar 45 split the beat they fall in); time 0 is still 0.4981 s.

### Problem 3, the video's pose A: fixed, and poses B and C with it

- **Tracking** (`F2/bin/neck_track2.py`; gtr-run r0832 every 0.5 s, then r0868 every 5 frames, 2 cores, 405 s): SIFT
  keypoints on the fretboard of the frame at 9.0 s, where pose A's corners were read, matched in each frame, a RANSAC
  similarity (rotation, scale, translation) fitted to the matches, and pose A's quad mapped through it. 1778 frames, at
  least 35 inliers each (median 96), median residual per frame 0.8 px (at most 1.6).
- **What it shows.** The body end of the neck moves little up and down (body-upper y 243-262 in 98% of the frames)
  but slides sideways with the guitar (x 372-442), while the nut end swings: nut-upper y from 158 to 291 and x from
  1845 to 1919 in the poses (143 to 305 in single frames), often within a second. Pose A holds only to about
  14 s. From 15 to 37 s the neck is 14-27 px higher than pose A (nut-upper y 173-186 against 200; the black box over
  the logo hides the top edge there), and from 38 s on it is up to 57 px lower (at the checker's 46.34 and 49.5 s
  nut-upper is 57 and 48 px lower and 25 and 31 px further right). Poses B and C are off by as much (below).
- **Independent check** (`F2/bin/string_check.py`, which does not use the tracker): in columns between fret wires where
  exactly six evenly spaced strings are seen, with 1.5 string spacings clear beyond both outer strings (so no hand is
  over them and the outer strings are known), the mean distance of the six from where a quad puts them, one frame every
  2 s (89 frames). Tracked outline: median 0.3 px near the nut (17 frames have such a column; max 0.7) and 0.3 px on
  the body half (84 frames; max 1.2). Old 3 poses: 13.2 px near the nut (max 35.5; 10 of 13 frames over 8 px), 7.8 px on
  the body half (max 23.7; 41 of 87 over 8 px). New poses: 2.6 px (max 8.2) and 2.3 px (max 18.9; 2 of 82 over 8 px).
  Drawn on 12 frames (`F2/frames/quad_new_vs_old.jpg`: 9.0, 16, 30, 40.85, 46.34, 49.5, 75, 88.5, 99, 110, 163.08, 176
  s), the new quads follow the fretboard edges in all 12.
- **Poses** (`F2/bin/pose_split.py`, 10 px): each coordinate of the tracked outline is median-smoothed over 0.5 s; a
  pose grows while every coordinate's range stays within 20 px, and its quad is the mid-range. **76 poses**, 0.2 to 14.6
  s long (median 1.7 s); every smoothed sample lies within 10 px of its pose's quad (about 0.4 string spacing at the
  nut). Raw samples: median 6.0 px, 90th percentile 10.4, 99th 18.7; 3.3% are over 15 px (quick movements, fits with few
  inliers). `standard.video.json` gets the 76 shots (each with `quad_frame`, the frame whose tracked outline is closest
  to its quad) and `neck_track_file`; the 6 labelled frames keep their fingertip labels and name their new pose (p01,
  p09, p31, p32, p36, p73); the track itself is `standard.neck_track.json` (232 KB). Two labelled frames per shot is no
  longer possible. `score_video_cells.py` takes one fret grid per shot, so the video lane needs a grid per pose (the
  frame `make_w04_cmds.py` uses for shot 0, 9.0 s, is inside p01).

| self-check (`F2/bin/checks2.sh`, logs `F2/logs/chk_after2_*`, `chk_final2_*`; before = the first repair's `chk_after_*`) | before | after |
|---|---|---|
| `gtr-eval check-truth` | 6931 checks, 0 mismatches | 6971, 0 |
| notes: all / `tab+audio` / `tab` / `audio` | 676 / 573 / 100 / 3 | 680 / 573 / 96 / 11 |
| notes.csv, .mid, .tab.txt, beats.txt, chords.lab against the JSON | 1.0, 1.0 (on+off 0.996), 676/676, 1.0 and 1.0, 1.0 | the same, .tab.txt 680/680 |
| .gp5 (`--time-shift 0.4981`): tab matched, notes F1, onset+offset | 649/676, 0.960, 0.411 | 652/680, 0.959, 0.407 (`--ignore-time` 680/680) |
| guitar-fl: P / R / F1, onset+offset F1 | 0.847 / 0.920 / 0.882, 0.562 (e1968) | 0.858 / 0.926 / **0.891**, 0.571 (e2175) |
| guitar-fl recall bass / chord / melody | 0.949 / 0.894 / 0.902 | 0.953 / 0.903 / 0.911 |
| guitar-fl F1 in the 10-s windows that moved (20, 50, 80, 90, 100, 120, 140, 160 s) | .99 .87 .80 .92 .89 .86 .75 .90 | 1.00 .90 .82 .93 .91 .90 .78 .91 |
| truth notes with a same-pitch guitar-fl onset within 50 ms | 622 of 633 | 630 of 638 |
| Basic Pitch: P / R / F1 | 0.536 / 0.846 / 0.656 (e1969) | 0.543 / 0.851 / 0.663 (e2176) |
| guitar-gaps (checker's r0771) F1 | 0.869 | 0.878 |
| madmom (checker's r0772): beats F (matched), downbeats F | 0.982 (220), 0.982 | unchanged |
| truth late / early: 2 of the 3 models more than 50 ms off the same way, none within 30 ms | 3 (#288 #466 #575) / 5 (#187 #464 #533 #542 #675) | 2 / 4 (the same notes but #466 and #464; now numbered #289 #578 / #188 #536 #545 #679) |
| guitar-fl notes with no truth note: same pitch ringing / octave or 12th / at a tap / other | 112 = 76 / 11 / 17 / 8 | 104 = 72 / 10 / 14 / 8 |
| truth notes guitar-fl misses (of them `tab`) | 54 (26) | 50 (22) |
| chroma, synthesized truth vs recording (+1 / -1 semitone) | 0.787 (0.453 / 0.425) | 0.786 (0.454 / 0.425) |
| video: strings' distance from where the quad puts them, nut half / body half, median (max) | 13.2 (35.5) / 7.8 (23.7) px | 2.6 (8.2) / 2.3 (18.9) px |

**Left as they are**: #198 (bar 17 pos 1.0 G3, above); the roll tops the first repair kept (#177 #312 #558 #636, the
checker's Doubt 1); the tuning offset (Doubt 2); the slide-ins (Doubt 3). Order of this round's scripts: `ev2.py`
(evidence, with `orig/standard.truth.json` as the truth whose notes it names), `time_new.py`, `build_truth_fix2.py`
and `write_gp5_fix2.py` (on the first repair's `stage/aligned_fix_rm.json` with `out/changes2.json`), `compare2.py`,
`checks2.sh`, `repairs_csv.py`; for the video `neck_track2.py`, `pose_split.py` (10 px, step 5, median 5),
`make_video_json.py`, `string_check.py`, `quad_sheet.py`.
