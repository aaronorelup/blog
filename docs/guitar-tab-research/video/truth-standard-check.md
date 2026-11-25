# Check of the ground truth: standard (*Imagine*)

Independent check, 2026-11-25 (agent `truth-check-standard`), of `/home/user/gtv/truth/standard/` and `truth-standard.md`.
Scripts, logs, results: `/home/user/gtv/work/truth-check-standard/` (below `W/`). Truth files unchanged (sha256 equal,
`W/logs/truth_sha256_start.txt`). Own runs via gtr-run: guitar-gaps.pth (r0771, not the builder's guitar-fl), madmom (r0772).

**Verdict: not yet.** Schema, side files, tuning, capo, pitches, strings, frets, bar lines and video are right. Two timing
faults: bar 36 (four notes and a beat 86-141 ms off) and three rolled-chord top notes 52-120 ms late (bars 15, 27, 53).

## 1. Schema and side files

- `gtr-eval check-truth`: 6931 checks, 0 mismatches (`W/logs/check_truth.log`, truth sha256 `4227f6c4...`).
- Own check (`W/bin/c1_schema.py` -> `W/out/c1_schema.json`): all 20 top-level schema fields present (source with url,
  license, license_quote, attribution); 676 notes with all 7 note fields (+ conf); pitch = tuning + capo + fret 676/676;
  every time inside [0, 177.00102] (WAV: 7,805,745 samples at 44.1 kHz); exact duplicates, same pitch within 50 ms,
  same-string overlaps, zero-length: 0 each (shortest note 132 ms); beats 224 rising, downbeats every 4th (56); chords
  70, contiguous 0-177.001; taps 211 (93 string-slap, 118 thump).
- Side files: notes.csv, beats.txt, chords.lab identical to the JSON; gtr-eval (`W/logs/side_*.json`): .mid onset F1 1.0
  (onset+offset 0.9956), .tab.txt 676/676 same string and fret, beats/downbeats 1.0, chords 1.0, .gp5 (`--time-shift
  0.4981`) 647/676 matched, all same string and fret, notes F1 0.957.
- Against the reading: tab-merged.json's 673 pitched notes (+180 X) map 1:1 per string in time order to the 673 non-`audio`
  notes (s1 2, s2 139, s3 222, s4 151, s5 121, s6 38), 0 fret differences, 0 order violations (`W/out/note_tabmap.json`).
  Bars 2 and 6 (21 notes) read by eye off `tab_pages/page_01.png`, `page_02.png` (`W/frames/tab_p1p2.jpg`): identical.

## 2. Tuning and capo (without the tab header)

- **Lowest pitches** (`W/bin/c2_tuning.py`, `W/out/c2_tuning.json`; a pitch counts when peaks sit at f0, 2f0, 3f0 within
  35 cents): E2 in 205 of 3804 frames, F2 205, D#2 10 and D2 9 scattered (no sustained line), nothing lower; silence
  (RMS -60 to -70 dB) before 0.45 s. E2 sounding rules out a capo in standard tuning.
- **Open strings that sound**: the sample's open-string notes are heard at standard pitch, 8.8 to 28.3 dB above both
  semitone neighbours: B3 (#28, #82, #587, #645), G3 (#61, #561), D3 (#175) (`W/out/c5_sample.json`).
- **Frames at full resolution** (`W/frames/lab_sheet.jpg`, `notes_sheet1-3.jpg`, `last_full.jpg`): the nut (cream
  bar) is in view at the right in every frame looked at, no capo. Shapes seen match pitches heard in standard tuning:
  C shape at frets 1-3 with C3 E3 G3 C4 (0.45-6.5 s), F with the thumb on s6 fret 1 and F2 heard (95.18 s, rise
  13.4 dB), E shape at frets 4-6 over the open 6th string (93.62 s).
- **Cents**: spectral peaks 70-700 Hz (76,793, magnitude-weighted): median +3.7, circular mean +4.6, 47 % of the weight
  in 0..+10; librosa `estimate_tuning` +2.0. The truth says 6 (Doubt 1).

## 3. Timing, per 10 seconds (`W/logs/c4_timing.log`, `W/out/c4_timing.json`)

| detector | whole piece | lowest 10-s windows |
|---|---|---|
| own spectral-flux onsets (628): truth notes with one within 50 ms | 0.913 (events 0.897), median -3.8 ms | 110-120 s 0.825, 70-80 0.853, 50-60 0.881 |
| librosa default onsets (422) | 0.836 | 10-20 s 0.70 (soft let-ring intro) |
| own pitch-specific flux (harmonics 1-8, +-150 ms) | 0.907 within 50 ms, median -3.8 ms | (`W/out/c5_pitchflux_all.json`) |
| guitar-gaps, gtr-eval notes (`W/out/eval_gaps.json`) | P 0.875, R 0.851, **F1 0.863**; matched median -0.2 ms | 40-50 s 0.75, 70-80 0.757, 110-120 0.773, 140-150 0.774 |

Per 10 s, flux hit rate .91 .93 .97 .91 .97 .88 .89 .85 .93 .93 .91 .83 .95 .88 .94 .91 .93 .91; guitar-gaps F1 .99 .99
.97 .86 .75 .84 .92 .76 .81 .92 .85 .77 .88 .83 .77 .86 .84 .81. No window collapses: no passage missing or invented.
Dips (`W/logs/c10_windows.log`): 40-50 and 70-80 s mostly the model's extra notes at slaps (precision 0.71, 0.70) plus the
rolls of bars 15 and 25; 110-120 s bar 36 (Problem 1) and bar 37's re-plucks; 140-150 s rolls and re-plucks of bars 45,
47. 26 truth notes have neither an own onset nor a model note within 50 ms (20 `tab+audio`, 6 `tab`;
`W/out/c4b_misses.json`). The model's 82 unmatched notes: 20 same pitch still ringing, 17 octave or twelfth of a sounding
note, 12 at a tap, 15 a same-pitch truth note 50-150 ms away, 18 other (14 pitch-108 slap artefacts). Off by over 50 ms on
both pitch-specific estimators (guitar-gaps same pitch and own pitch flux, same sign): 11 notes (`W/out/c5b_flagged.json`,
CQT `W/frames/spec_bars.png`): Problems 1, 2, Doubt 2.

## 4. Forty-one notes: 20 random (one per 1/20 of the piece, seed 20261125) + every note of bars 2 and 6

Spectrum (`W/bin/c5_pitchflux.py`, `W/out/c5_sample.json`): rise at the pitch (harmonics 1-3, 20-120 ms after vs 60-10 ms
before), level over both semitone neighbours 20-250 ms after, pitch-flux peak. Video (`W/bin/c8_frames.py`, full-resolution
crops, expected cell drawn from video.json; `W/out/c8_video_verdicts.json`): Y fingertip in that cell, O open, no finger on it.

| # | t s | note | s/f | bar:pos | rise dB | over nbrs dB | flux ms | video |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.448 | C3 | 5/3 | 1:0 | 46.1 | 13.4 | +19 | Y |
| 17-28 | 3.745-6.500 | A3 F3 C3 A3 F3 C3 F3 A3 C3 A3 A#3 B3 | bar 2 | 2:0-3.5 | 5.9 to 19.1; A#3 -4.5 | 10.8 to 28.3 | -10 to +8 | 11 Y, #28 O |
| 61 | 13.814 | G3 | 3/0 | 5:0.75 | 14.1 | 16.5 | -15 | O |
| 74-82 | 16.328-19.096 | F3 C3 F3 C3 F3 C3 A3 A#3 B3 | bar 6 | 6:0-3.5 | 4.4 to 15.8; A#3 -2.4, B3 2.8 | 12.5 to 25.3 | -7 to +11 | 8 Y, #82 O |
| 106 | 25.244 | A#3 | 3/3 | 8:3.25 | -3.2 | 9.0 | +5 | Y |
| 146 | 35.324 | F3 | 4/3 | 12:0 | 6.5 | 12.8 | -7 | Y |
| 155 | 38.505 | C4 | 2/1 | 13:0 | 3.1 | 17.7 | **-108** | Y |
| 175 | 44.743 | D3 | 4/0 | 15:0 | 9.6 | 16.2 | +2 | O |
| 237, 263, 276 | 61.76, 68.47, 71.99 | C3 F3 C3 | 5/3 4/3 5/3 | 20:1.5, 22:2, 23:2.5 | 8.9, 6.9, 6.2 | 21.7, 22.2, 18.2 | +2, -4, -7 | Y Y Y |
| 321 | 85.839 | F3 | 4/3 | 28:0 | 12.7 | 13.7 | -7 | Y |
| 354 | 95.177 | F2 | 6/1 | 31:0 | 13.4 | 8.0 | -4 | Y (thumb) |
| 372 | 99.168 | E3 | 4/2 | 32:1 | 2.2 | 18.7 | -7 | Y |
| 421 | 110.293 | C4 | 3/5 | 35:3 | 11.7 | 24.0 | -30 | Y |
| 468, 481 | 121.77, 125.28 | C3 F3 | 5/3 4/3 | 39:1.5, 40:2 | 8.8, 11.5 | 16.0, 23.7 | -4, -4 | Y Y |
| 538 | 140.250 | C4 | 2/1 | 45:1 | 4.7 | 24.5 | -4 | Y |
| 561 | 146.577 | G3 | 3/0 | 47:1 | 1.3 | 25.6 | -4 | O |
| 587 | 155.064 | B3 | 2/0 | 49:3.75 | 10.4 | 22.2 | -4 | O? |
| 609 | 159.952 | G2 | 6/3 | 51:2 | 8.0 | 9.1 | -1 | Y |
| 645 | 168.433 | B3 | 2/0 | 54:0.75 | 5.8 | 8.8 | -4 | O |

Pitch above both neighbours 41/41 (lowest +8.0 dB); rise >= 3 dB 35/41 (others: A#3 hammer-ons #27, #81, #106 over a ringing
A3, still 9-15 dB above A3 and B3; re-plucks #82, #372, #561). Pitch-flux peak within 50 ms 40/41 (#155: C4 over an F2 bass,
its 3rd harmonic; Doubt 2). Video: 34/34 fretted Y, 6/7 open O, #587 O? (a fingertip hovers near s1/s2 fret 1; B3 heard 22 dB
over its neighbours). video.json's 6 labelled frames match what I see; its fret lines fall within ~10-15 px of the wires.

## 5. Beats, downbeats, chords (`W/bin/c7_beats.py`, `W/out/c7_beats.json`, `W/out/eval_madmom_beats.json`)

- madmom vs the truth: beats F 0.978 (219/224), CMLt 1.0, AMLt 1.0, matched median -19.6 ms; downbeats F 0.982
  (55/56), CMLt 1.0; tempo 75.95 vs 76.14. Beats more than 70 ms apart: bar 24 b4 (-72), bar 28 b3 (-75), **bar 36 b2
  (+110)**, bar 55 b1 (+92: madmom's error, guitar-gaps hears the F2 bass 5 ms before the truth downbeat), bar 56 b4
  (+95, after the last note).
- Onset envelope: mean peak 0.71 at the truth beats vs 0.259 half-way between them; best lag -20 ms; 208/224 beats
  with an envelope peak within 70 ms (124 within 30 ms).
- Bar lines: all 56 bars have a note at position 0; each downbeat sits -2 to +50 ms (median +34.5) after the first of
  them; 0 truth notes fall outside their tab bar. A tab bar starts at every downbeat.
- Five chords at random (seed 20261125), pitch classes sounding inside (seconds): 3.78-6.91 F:maj (F 3.1, C 3.1, A 2.5,
  B 1.6, A# 0.6: F with the A-A#-B line), 13.23-16.36 C:maj (C E G + B: Cmaj7), 93.60-95.21 E:maj (E G# B + D: E7),
  107.80-109.53 F:maj (F A C), 156.79-158.34 E:maj (E7). All five match.

## 6. The record and the tools' video

- True as written: 676 notes (574/99/3), E2-G4, first/last onset 0.448/174.621 s, 224/56/70/211, 6931 checks, tempo 76.14,
  side-file scores, 8851 frames, 50 fps, 177.02 s, 1920x648, Opus audio, no title in container or stream tags (only
  encoder, handler, language, vendor), 3 poses and 6 labelled frames; the 9 builder files I looked for exist.
- Not borne out: "the order rule fixes the upper notes' onsets to within the model's agreement": 7 of 96 rolled-chord notes
  are over 50 ms after guitar-gaps' same pitch (bars 15, 25, 27, 33, 36, 47, 49; `W/logs/c4c_arp.log`). "No stretch far
  low" holds per 10 s but hides bar 36. The 3 added G3 "heard by the guitar model": guitar-gaps has none (Doubt 3).
- standard.mp4, six frames (n 0, 1500, 3000, 5000, 7500, 8850; `W/frames/six_sheet.jpg`): no tab, chord name, title or
  logo; frame 0 has 12 red pixels in its last row (banner edge, illegible); the last 5 frames (from 176.92 s) start the
  fade to the end card (mean luma 89 -> 71.6), the last frame at full resolution is only darker, no text.

## PROBLEMS

1. **Bar 36, 111.0-113.2 s: notes #425, #426, #429, #432 and beat 2 (111.82).** #429 G2 s6f3 (pos 1.0) is at 111.785;
   guitar-gaps has 111.921, my onset detector 111.920, my pitch flux +136 ms, and the CQT line of G2 starts at about
   111.92. #432 C3 s5f3 (pos 2.5) is at 112.969; model 113.102, onset 113.087, pitch flux +141 ms. In the pos-0 roll,
   #425 G3 (111.161) and #426 E4 (111.176) are 86-132 ms late: the model hears both at 111.075 (`W/logs/c4c_bar36.log`,
   `W/frames/spec_bars.png`). Beat 2 is 110 ms before madmom's. Fix: #429 -> about 111.92, #432 -> about 113.09,
   #425/#426 -> about 111.07 (check each on the CQT), beat 2 -> about 111.91; rebuild offsets, side files and GP5,
   re-run check-truth.
2. **Rolled-chord top notes 52-120 ms late**, not harmonics of a lower note, on both pitch-specific estimators: #312 B3
   bar 27 pos 0 at 82.696 (model 82.613, pitch flux -120 ms, onset -91 ms), #177 B3 bar 15 pos 0 at 44.789 (model
   44.735, flux -94 ms), #636 B3 bar 53 pos 2.0 at 166.285 (model 166.233, flux -88 ms). Each costs a correct tool a
   match and adds a false positive. Fix: move them to about 82.61, 44.74, 166.23, and in `refine_arp.py` keep a top
   note at the bass time when its own flux peaks there instead of forcing it 5-100 ms after the string below.

## Doubts

1. Tuning offset: truth 6 cents, my estimates +2.0 to +4.6 (peak median +3.7); a tool answering 3 is scored 3 cents
   off. 4 would be safer, or state +-3 cents.
2. Roll tops over an F2 bass cannot be timed or confirmed from audio (C4 = its 3rd harmonic, F3 = its 2nd): #155 (bar
   13, flux -108 ms, the model never hears it), #290 (bar 25, never heard), #383 (bar 33, -50/-79 ms), #575 (bar 49,
   -68/-77 ms), #288 F3 (bar 25, -59/-71 ms). The tab has them; #155's frame shows the index on s2 f1.
3. The 3 added open G3 (97.98, 155.06, 161.13 s, `audio`): guitar-gaps finds no G3 within 1.5 s; my spectrum has a G3
   rise of 9.6-14.1 dB and G4 +14.5-17 dB at each (`W/logs/c9_claims.log`). Plausible, on one model + CQT.
4. Beats sit about 20-35 ms after the onsets (madmom -19.6 ms, envelope lag -20 ms, downbeats a median 34.5 ms after
   the bar's first note, at most 50): inside the 70 ms window. Chord bounds inherit it (the next chord's bass 37-40 ms
   before the bound in 2 of the 5 chords).
5. The .gp5 scores 0.957, not the 1.0 EXPERIMENTS.md asks of side files (29 rolled-chord notes; GP has one time per
   beat). Documented in the record.
6. Unheard notes: A#3 hammer-ons of bars 18, 20, 40 (#216, #241, #484: the model never outputs A#3 there, though the
   sampled ones in bars 2, 6, 8 are 9-15 dB above A3 and B3) and `tab` re-plucks (#195, #221, #384, #633, #674, #675;
   bar 56's #674/#675 may be mistimed or not played). Bar 24 b4 and bar 28 b3 (72-75 ms from madmom) not examined.

## Second check

Independent re-check, 2026-11-25 (agent `truth-recheck-standard`), of the repaired truth (SHA-256 `12675764353539fb...`,
the record's installed hash) and `standard.video.json`. Own scripts, logs, results:
`/home/user/gtv/work/truth-recheck-standard/` (below `R/`). Truth files unchanged (`R/logs/sha256_start.txt` = `_end`).
Own runs: guitar-fl (gtr-run r0779), Beat This! final0 (r0780); guitar-gaps is checker 1's r0771 output (input SHA-256
`c985b9f9...` = today's mono WAV).

**Verdict: not yet.** Both repairs hold: bar 36 now agrees with both models within 21 ms and Beat This! puts beat 2 on
the truth (0 ms); the new roll rule moved nothing wrong. The roll tops the repair kept stay a doubt. New: two notes with
the wrong pitch, string and fret (bars 17, 39), six played notes missing, and the video truth's pose-A neck quadrilateral
is off by more than a string after about 40 s.

### 1. Schema and side files (in full)

- `gtr-eval check-truth`: 6931 checks, 0 mismatches (`R/logs/check_truth.log`).
- Own (`R/bin/r1_schema.py` -> `R/out/r1_schema.json`): all 20 fields and 5 source fields; 676 notes with all 7 fields +
  conf (573/100/3; bass 275, melody 316, chord 85); pitch = tuning + capo + fret 676/676; every time in [0, 177.00102]
  (WAV 7,805,745 frames at 44.1 kHz); sorted; 0 exact duplicates, 0 same pitch within 50 ms, 0 same-string overlaps or
  re-attacks under 60 ms, 0 zero-length (shortest 132 ms); beats 224 rising, downbeats 56 = every 4th beat; chords 70
  contiguous 0-177.001; taps 211 (93 string-slap, 118 thump).
- Side files: notes.csv, beats.txt, chords.lab equal to the JSON field by field; gtr-eval (`R/out/side_*.json`): .mid
  onset F1 1.0 (on+off 0.9956), notes.csv 1.0/1.0, .tab.txt 676/676 same string and fret, beats and downbeats 1.0,
  chords 1.0; .gp5 (`--time-shift 0.4981`) 649/676 matched, all same string and fret, F1 0.960; `--ignore-time` 676/676.

### 2. Tuning and capo (not touched by the repair; blind, `R/bin/r2_tuning.py`, `r2b_low.py`)

- Lowest pitch with peaks at f0, 2f0, 3f0 (30 cents) per 0.37-s frame: E2 in 211 frames; below it only scattered frames
  (D#2 18, C2 12, D2 11, C#2 6, B1 2; 38 of the 49 within 0.6 s after a tap), no sustained line: lowest string E2, no
  drop tuning, and E2 sounding rules out a capo on a standard-tuned guitar. F#2 in 556 frames is the body's air
  resonance (no F#2 in the truth; 405 of them within 0.6 s after a tap).
- Open strings in the sample of 4: G3 (#30 #40 #109 #111 #113 #244) and B3 (#44 #181 #511 #581 #645) rise at their own
  pitch, 11-31 dB over both semitone neighbours. Frames (34 at full resolution, `R/frames/c4_sheet1-2.jpg`,
  `six_sheet.jpg`): the cream nut at the right, no capo; the C shape at frets 1-3 (bars 3, 9) sounds C3 E3 G3 C4.
- Cents, 129,862 spectral peaks 70-1000 Hz: magnitude-weighted circular mean +4.9, weighted median +3.9, unweighted
  median +2.5; the truth says 6 (Doubt 2).

### 3. Timing, in full (`R/bin/r3_timing.py` -> `R/out/r3_timing.json`)

| detector | per 10 s (0-10 ... 170-177 s) | whole piece |
|---|---|---|
| own superflux onsets (573; log semitone bands, hop 5 ms): truth notes with one within 50 ms | .94 .95 .95 .94 .90 .91 .95 .91 .90 .91 **.86** .98 .95 .94 .94 .91 .88 .87 | 0.922 (480 events 0.917), median -2.9 ms |
| guitar-fl, own run, `gtr-eval notes` F1 | .97 .99 .99 .85 .86 .87 .95 .82 **.80** .92 .89 .84 .86 .84 **.75** .87 .90 .81 | P .847 R .920 **F1 .882** |
| guitar-gaps (r0771 output) F1 | .99 .99 .97 .86 **.75** .84 .92 **.76** .81 .92 .85 .88 .88 .83 .77 .86 .84 .81 | F1 .869 |

Drops (`R/logs/r3_timing.log`): own onsets under 0.8 in bars 25, 28, 53, 56; model recall under 0.75 in bars 13, 25, 45,
56 (guitar-fl; guitar-gaps also 15, 19, 27, 32, 34, 47, 54). There: roll tops over F2 (#288 #575, check 1's Doubt 2), G
rolls (#177 #312 #558, Doubt 1), slide-in #542, bar 56's end, re-plucks, Problem 2's bars 27, 45, 53; bars 17 and 39
(Problem 1) hide in windows at 0.84-0.89.
- Both models agree (within 30 ms) on a same-pitch onset 50-250 ms from the truth for 8 notes (`R/out/r3b_suspects.json`):
  #288 #575, #312 #558, #542, #384 (an unheard re-pluck), #464 #466 (Problem 1).
- Every note whose own pitch does not rise (< 2 dB) while a pitch both models report there does (>= 5 dB): exactly 2,
  #196 and #464 (`R/out/r3j_swaps.json`). Notes both models report with no same-pitch truth note within 50 ms: 30, most a
  ringing pitch or a tap; 6 are played notes (`R/out/r3e_agree.json`, Problem 2).
- The 14 re-timed onsets (`R/out/r4_retimed.json`): guitar-fl and guitar-gaps within 21 ms of the new time for all 13 they
  hear (#424 E3: neither, as recorded); bar 36: #429 G2 -1/+1 ms, #432 C3 0/+2, #425 G3 -3/-1, #426 E4 -14/-21; the
  rule's nine within 19 ms of both (largest #329 -19/-18). My onsets: a detection within 50 ms for 10 of the 14 (the
  other 4 are upper roll notes, #32 #350 #411 #629).

### 4. Twenty random notes (one per 1/20 of the piece, seed 42) + every note of bars 3 and 9

Spectrum (`R/bin/r4b_sample.py`, `R/out/r4b_sample.json`): best rise over h1-h3 and clean partials (4096 window, 20-120 ms
after vs 60-10 ms before); level over both semitone neighbours 30-300 ms after (16384). Video (`R/bin/r4c_frames.py`,
crops at round(t x 50)): Y fingertip at that fret and string, O string left free, O? not visible enough.

| # | t s | note | s/f | bar | conf | rise dB | over nbrs dB | video |
|---|---|---|---|---|---|---|---|---|
| 40, 244 | 8.459, 63.685 | G3 G3 | 3/0 | 3, 21 | tab+audio | 18.5, 27.3 | 31.2, 22.0 | O O |
| 48, 79, 212 | 10.444, 18.301, 55.462 | C3 C3 C3 | 5/3 | 4, 6, 18 | tab+audio | 16.7, 18.9, 22.3 | 10.0, 7.8, 5.7 | Y Y Y |
| 128 | 31.342 | A3 | 3/2 | 10 | tab+audio | 32.7 | 8.4 | Y |
| 155 | 38.505 | C4 | 2/1 | 13 | tab+audio | 5.1 (h3 only) | 20.6 | Y |
| 181, 581 | 46.339, 153.734 | B3 B3 | 2/0 | 15, 49 | tab+audio | 21.3, 21.4 | 24.7, 25.0 | O O |
| 292 | 77.172 | C4 | 2/1 | 25 | tab | 20.6 | 27.9 | Y |
| 323 | 87.790 | G4 | 2/8 | 28 | tab+audio | 35.2 | 37.2 | Y (hand at frets 7-9) |
| 358 | 96.050 | A3 | 3/2 | 31 | tab | 9.7 | 1.3 | Y |
| 370 | 99.162 | B3 | 3/4 | 32 | tab+audio | 20.6 | 11.3 | Y |
| 439, 480 | 114.690, 124.898 | C3 C3 | 5/3 | 37, 40 | tab+audio | 18.0, 23.5 | 10.8, 8.9 | Y Y |
| 467 | 121.766 | G3 | 3/0 | 39 | tab | 11.2 | 6.0 | O |
| 511, 645 | 132.784, 168.433 | B3 B3 | 2/0 | 42, 54 | tab, tab+audio | 17.3, 18.0 | 24.0, 11.4 | O? O? |
| 544 | 142.632 | D4 | 3/7 | 46 | tab+audio | 14.5 | 10.2 | Y (frets 5-8) |
| 621 | 163.078 | G#3 | 4/6 | 52 | tab+audio | 14.0 | 24.0 | Y (E shape, frets 4-6) |
| 29-45 | 6.886-9.675 | bar 3 (17 notes) | C shape | 3 | 11 tab+audio, 6 tab | 7.0 to 24.1 | 0.7 to 31.2 | Y at 6.94, 8.45, 9.24 s; #44 O? |
| 108-121 | 25.816-28.768 | bar 9 (14 notes) | C shape | 9 | tab+audio | 11.9 to 26.9 | -1.0 to 25.8 | Y; pinky s3 f4 at 28.17, 28.56 |

Rise of 3 dB or more 51/51, but #32 C4 (bar 3, `tab`) only on its 3rd harmonic, which G3's 4th covers: not confirmed, as
recorded. Over both neighbours by 3 dB or more 46/51 (#118, #120 B3 s3 f4 beside a sounding C4; #29 C3 at the roll start;
#32; #358). Video: 28/28 frames show the hand at the truth's frets (counted by eye: my markers, drawn from video.json,
sat off in late pose-A frames, Problem 3). No fretted note was seen on another fret.

### 5. Beats, downbeats, chords (`R/bin/r5_beats.py`, `R/out/r5_beats.json`, `R/out/eval_beatthis.json`)

- Beat This! (final0, no DBN): beats F 0.989 (221/224 within 70 ms), CMLt 0.987, median -9.3 ms; downbeats F 0.964
  (54/56), CMLt 1.0. Over 70 ms: bar 1 b1 (+82), bar 55 b1 (+72; madmom +92 in check 1), bar 56 b3 (Beat This! has
  none). Bar 36: b1 +33, b2 0, b3 +10, b4 +23 ms. Own onset envelope: mean peak 1.05 at the beats, 0.47 half-way.
- Bar lines: every downbeat -2 to +50 ms (median 34.5) after its bar's first note; no note before bar 1; beat intervals
  0.642-0.957 s: the shortest (bar 44 b4 to bar 45 b1) agrees with Beat This! within 70 ms, the longest starts at bar 55
  b1 (Beat This! +72 ms there).
- Five chords (seed 11), seconds of sounding per pitch class: 73.22-77.98 F:maj (F 5.6, A 3.3, C 3.1), 77.98-79.52 A:min
  (E 1.6, A 1.5, C 0.7), 156.79-158.34 E:maj (E G# B + D, C 0.9), 159.94-161.53 G:maj (B 1.6, G 1.2 with the bass G2,
  F 1.2, A 1.2), 169.41-170.93 E:maj (E7). All five consistent with the notes (sevenths unlabelled, as recorded).

### 6. The record and the tools' video

- Borne out: counts, check-truth, guitar-fl P/R/F1 and per 10 s (my run gives the same to three decimals), 622 of 633
  within 50 ms, guitar-gaps 0.869, GP5 649/676 and 0.960, the bar-36 table's model columns, the rule's nine within 19 ms,
  the repairs CSV (27 rows: 14 re-timed, 10 offset only, 3 kept; 4.9 KB).
- Not borne out: "the truth follows the performance", "Left out by the player? None proven ... re-plucks of a pitch still
  ringing" and "no other fingering seen": bars 17 and 39 play E3 s4 f2 where the truth has G3 s3 f0, and six played notes
  are missing. The unmatched-note count hides them: the E3s at 51.65 and 121.19 s count as "the same pitch still
  sounding", those of bars 30 and 34 as "at a slap or thump". Pose A's quadrilateral, read at 9.0 s, does not hold to
  50 s. guitar-fl timing: median 0.6 ms, p10-p90 -9.8 to +9.7 ms on my run (record 0.0, -10.6 to +9.4: trivial).
- standard.mp4 (unchanged since check 1), six other frames (n 25, 2200, 4400, 6600, 8000, 8849; `R/frames/six_sheet.jpg`):
  no tab, chord name, title or logo (black box over the logo); the last pixel row is the picture's edge, illegible
  (`R/frames/bottom_rows.png`); container tags only encoder, handler, vendor, language.

### PROBLEMS (second check)

1. **Wrong pitch, string and fret at bar 17 pos 0.75 (51.68 s, #196) and bar 39 pos 0.75 (121.20 s, #464); bar 39's #466
   is not played.** The tab has G3 s3 f0; the player plays E3 s4 f2 (the C shape's middle finger). #196: G3 +3.5 dB at
   h1, -6.6 on clean partials; both models E3 at 51.650/51.652, E3 +19.0 dB. #464: G3 -1.8/-1.4 dB; models E3 at
   121.186/121.189; the E3 fundamental goes from 28-31 dB (121.05-121.16 s) to 46-49 dB (121.20-121.26), G3's does not
   move (`R/logs/r3d_bar39.log`). At pos 1.0 (121.36) G3
   rises +4.5 dB (#465 right) but E3 falls 4.8 dB and neither model has an E3: #466 (E3 s4 f2, `tab`) is not played.
   Fix: #196 -> pitch 52, s4 f2, about 51.65 s; #464 -> 52, s4 f2, about 121.19 s (conf `audio`); delete #466; rebuild
   offsets, side files and GP5; list them under Departures.
2. **Six played notes are missing** (both models within 6 ms of each other, a rise at the pitch, not a harmonic of a
   sounding note; the three near a thump start rising 50-75 ms before it, bias-corrected): A3 s3 f2 at 29.32 s (bar 10,
   with the C3; +22.1 dB at h1), G2 s6 f3 at 83.875 (bar 27, no tap within 388 ms; +14.8 dB at h1, +12.2 on h1/h7), E3
   s4 f2 at 92.09 (bar 30 pos 0, with C3 C4; +6.6/+10.1 at h1/h2) and at 104.68 (bar 34 pos 0; +5.7/+6.7), C4 s2 f1 at
   140.864 (bar 45, a re-pluck; +11.8/+14.0), D3 s4 f0 at 166.22 (bar 53 pos 2.0, with the G2; +9.7/+9.7)
   (`R/out/r3e_agree.json`, `R/logs/r3g_risetimes.log`, `r3h_bar27_53.log`, `r3i_places.log`). A correct tool scores a
   false positive at each. Fix: add them as `audio` like the three G3 departures, each after a look at the CQT.
3. **`standard.video.json` pose A (0-50 s) does not fit after about 40 s.** Drawn on the frames
   (`R/frames/quad_check.jpg`): it fits at 9.0 s, but at 46.34 and 49.5 s the fretboard's top edge near the nut is about
   40 px below the quad's (about 1.5 string spacings) and the nut about 50 px or more right of it; poses B (99 s) and C
   (102, 176 s) fit roughly. `score_video_cells.py` would put a correct fingertip on the wrong string or fret there. Fix:
   track the nut through pose A as in B and C, or split A where the guitar moves; check on 40.85 s (labelled) and 49.5 s.

### Doubts (second check)

1. Roll tops the repair kept (#177, #312, #558, #636): both models put them earlier (-32/-54, -69/-83, -58/-66, -10/-52
   ms); my clean-partial timing runs early inside rolls (-30 to -55 ms on rule notes where both models agree with the
   truth), so it neither confirms nor refutes the repair's reading. The film should not judge a tool on these four.
2. Tuning offset: blind +2.5 to +4.9 cents against the truth's 6 (check 1's Doubt 1 stands).
3. Slide-ins (#542 bar 45, #187): the truth times the pluck, both models the pitch's arrival (+75/+80 ms for #542).
4. Unheard `tab` re-plucks remain (#384 A3 bar 33: the models hear only the next A3, 102.33 s); a C3 both models report at
   39.24 s (bar 13) has no rise of its own (-0.5 dB clean): not added.
5. Downbeats sit a median 34.5 ms after the bar's first note (up to 50; Beat This! +82 at bar 1): inside 70 ms.
6. Tools may report F#2 after thumps (the body resonance near 92.5 Hz; both models at 37.65 s): no truth error.

## Third check

Independent re-check, 2026-11-25 (agent `truth-recheck2-standard`), of the truth after the second repair
(`standard.truth.json` SHA-256 `daa4884b3543041b...`, `standard.video.json` `e2211bef511ee2a5...`, the installed hashes).
Own scripts, logs, results: `/home/user/gtv/work/truth-recheck2-standard/` (below `Q/`); truth files unchanged
(`Q/logs/sha256_start.txt` = `_end`). Own runs: guitar-fl r0916 (2 cores, 114 s; notes byte-identical to r0779), gtr-eval
e2245 (notes), e2246 (beats); guitar-gaps is checker 1's r0771 output (same mono WAV, SHA-256 `c985b9f9...`).

**Verdict: not yet.** The second check's problems are fixed in the notes (bars 17 and 39, the six added notes, the two
removed ones all measure right) and pose A's large misfit is gone. New: bar 3's first C3 (#29, inside the 30-s segment)
does not sound; the slap fills of bars 12, 24 and 44 are 55-70 ms late in `taps`; and the 76 poses miss the neck's quick
jolts after thumps, so 5.5% of fretted notes would land in the wrong string lane (none in 0-30 s).

### 1. Schema and side files (in full)

- `gtr-eval check-truth`: 6971 checks, 0 mismatches (`Q/logs/c1_checktruth.log`).
- Own (`Q/bin/c1_schema.py` -> `Q/out/c1_schema.json`): all 20 fields and 5 source fields; 680 notes with all 7 fields +
  conf (573 `tab+audio` / 96 `tab` / 11 `audio`; bass 274, melody 313, chord 93); pitch = tuning + capo + fret 680/680;
  onsets 0.448-174.621 s, offsets <= 176.989, all inside the WAV (7,805,745 frames = 177.00102 s); sorted; 0 exact
  duplicates, 0 same pitch within 50 ms, 0 same-string overlaps or re-attacks under 60 ms, 0 zero-length (shortest
  132 ms); beats 224 rising, downbeats 56 = every 4th beat; chords 70 contiguous 0-177.001; taps 211 (93 slap, 118 thump).
- Side files: notes.csv, beats.txt, chords.lab equal to the JSON field by field; .mid every onset within 1.8 ms, 6
  offsets differ (same pitch on two strings at once, which one MIDI channel cannot hold, `Q/logs/c1c_midoff.log`); .gp5
  read with PyGuitarPro: 56 bars, 467 beats, 680 notes, (string, fret) multiset equal to the truth's. gtr-eval
  (`Q/out/side_*.json`): .mid onset F1 1.0 (on+off 0.9956), notes.csv 1.0/1.0, .tab.txt 680/680, beats and downbeats
  1.0, chords 1.0, .gp5 (`--time-shift 0.4981`) 652/680 all same string and fret, `--ignore-time` 680/680.

### 2. Tuning and capo (not touched by the repair; blind, `Q/bin/c2_tuning.py`, `c2_lowest.py`)

- Lowest pitch with h1, h2, h3 peaks (within 25 dB of the frame maximum) per 0.37-s frame: F2 38 frames, G2 75, C3 389,
  nothing below F2; guitar-fl's lowest notes are E2 (8) and F2 (18), none lower: low string E2, no drop tuning, and E2
  sounding rules out a capo on a standard guitar.
- Cents (h1 and h2 peak frequency, 16384 samples from 80 ms after the onset, 566 confirmed notes): median +5.1, IQR +1.6
  to +7.4 (s6 +8.2, s5 +7.0, s4 +2.2, s3 +4.0, s2 +4.9); open B3 +1.6 (37 notes), G3 +3.2 (43), D3 +1.5 (7), E2 +6.0 (3):
  standard tuning; the truth's 6 is within 1 cent.
- Picture: 4x crops of the nut at 15 times (`Q/frames/strip_a-d.jpg`): the cream nut with the strings running over it,
  frets 1-2 bare, no capo; fingers at frets 1-3 in the C and F shapes counted from the nut (`Q/frames/notes_1-4.jpg`).

### 3. Timing, in full (`Q/bin/c3_onsets.py`, `c3_model.py`, `c3_cross.py`)

| detector | per 10 s (0-10 ... 170-177 s) | whole piece |
|---|---|---|
| own onsets (log-frequency flux, hop 2.5 ms, 613 detections): truth notes with one within 50 ms | .91 .97 1.00 .97 .97 .93 1.00 .88 .94 .93 .91 .93 .98 .94 .97 **.81** .88 .91 | 0.934 (482 events 0.932; the truth shifted 0.1 s: 0.02-0.09), median 0.0 ms, p10/p90 -7.3/+4.9 |
| guitar-fl r0916, `gtr-eval notes` F1 | .97 .99 1.00 .85 .86 .90 .95 .82 .82 .94 .91 .84 .90 .84 **.78** .87 .91 .81 | P .858 R .926 **F1 .891** (e2245) |
| guitar-gaps (r0771) F1 | .99 .99 .99 .86 **.75** .87 .92 **.76** .82 .93 .86 .88 .91 .83 .81 .86 .85 .81 | F1 .878 |

Drops: own onsets under 0.8 in bars 25, 48, 53, 56; guitar-fl recall under 0.75 in bars 13, 25, 56: roll tops (#156,
#289-291, #577-578, #632-633: both models 56-93 ms earlier or absent), slide-ins (#545, #571), re-plucks, bar 56's end.
Every bar's notes sit a median -5.3 to +6.8 ms from guitar-fl (`Q/logs/c3_bar_timing.log`). The 43 notes both models
miss: roll tops, `tab` re-plucks, #487 A#3 (s3 f2 -> f3; on 8192 samples A#3 rises -60 -> -34 dB as A3 dies) and #29
(Problem 1). Of guitar-fl's 104 extra notes, 4 are not a ringing pitch, an octave/12th or at a tap (Doubt 3). Taps:
thumps a median 25 ms after their attack (97.5% within 50 ms); 16 slaps 55-70 ms late (Problem 2).

### The second check's problems, re-measured (`Q/bin/spec.py`: exact-frequency DFT, 4096/8192 Hann; rise = median level 60-200 ms after minus 200-60 ms before)

- P1 fixed: E3 #197 (51.664 s) h1 +18.4 dB, the old G3 there +3.5; E3 #468 (121.197) +15.1, the old G3 -1.8; removed
  #466 E3 121.366: -12.9 dB (decaying). Both models have both E3s (guitar-fl recall of the 11 `audio` notes: 11/11).
- P2 fixed: A3 29.338 +14.5 dB (8192 +13.9), G2 83.891 +10.9 (+14.0), E3 92.102 +19.6, E3 104.644 +10.6, D3 166.206
  +21.4 (+29.7); C4 140.861 only +2.7 against the ringing C4, but its line dips to -42 dB at 140.80-140.84 s and is back
  at -27 dB from +20 ms: a re-pluck (`Q/logs/trace_543.log`). Removed C4 141.126: -3.5 dB. Departure G3s +16 to +21.
- P3 fixed for the slow movement of the neck, not for the quick one (Problem 3).

### 4. Twenty random notes (one per 1/20 of the piece, seed 20261128) + every note of bars 5 and 8

h1 rise as above; near = max 20-100 ms after minus min 100-20 ms before (the dip and re-attack of a re-pluck); nbrs =
level over both semitone neighbours 60-300 ms after (8192; 16384 below A2). Models: g guitar-fl, p gaps. Video (frame
round(t x 50)): Y fingertip on the marked cell (pose quad's string lane, fret by the rule of 18), O open string with no
finger on it (`Q/logs/c4_table.log`, `Q/frames/notes_1-4.jpg`).

| # | t s | note s/f | bar | conf | h1 / near / nbrs dB | models | video |
|---|---|---|---|---|---|---|---|
| 29 | 6.886 | C3 5/3 | 3 | tab+audio | **-20.7** / 15.9 / 4.2 | none | Y (shape held) |
| 48, 229, 450 | 10.444, 59.363, 116.225 | C3 5/3 | 4, 19, 37 | tab+audio | +7.2..+35.8 / 26.8..49.6 / 10.6..12.2 | gp, g, gp | Y Y Y |
| 84, 111, 520, 560 | 19.480, 26.628, 134.595, 145.799 | G3 3/0 | 7, 9, 43, 47 | t+a, t+a, tab, t+a | +1.9..+45.6 / 15.8..38.5 / 8.3..33.4 | gp x4 | O O O O? |
| 169, 329, 512, 588 | 42.386, 88.979, 132.355, 154.895 | A3 3/2 | 14, 29, 42, 49 | tab+audio | +7.7..+34.6 / 9.7..32.2 / 8.3..30.3 | gp x4 | Y x4 |
| 187, 262, 323 | 47.930, 67.664, 85.839 | F3 4/3 | 16, 22, 28 | tab+audio | +14.3..+27.5 / 23.3..47.0 / 18.3..22.0 | gp x3 | Y x3 |
| 289 | 76.412 | F3 4/3 | 25 | tab+audio | +12.7 / 23.1 / 13.2 | none (both 56-59 ms earlier: roll top) | Y |
| 382, 428, 650 | 100.741, 111.066, 168.592 | E3 4/2 | 32, 36, 54 | tab+audio | +5.4..+9.5 / 17.0..28.2 / 5.7..15.3 | gp, none, none | Y x3 |
| 633 | 164.718 | C4 2/1 | 53 | tab+audio | +22.3 / 14.3 / 23.5 | gp | Y |
| 58-73 | 13.219-16.136 | bar 5, 16 notes (C3, E3, G3, B3 3/4, A3) | 5 | 14 t+a, 2 tab | -2.1..+25.4 / 14.1..49.1 / 5.5..33.3, #72 -1.3 | gp 16/16 | Y 11, O 5 |
| 99-107 | 22.658-25.441 | bar 8, 9 notes (F3, C3, A3, A#3 3/3, B3 2/0) | 8 | tab+audio | +0.5..+33.9 / 5.5..47.3 / 10.3..22.0, #106 -1.2 | gp 8, g 9 | Y 8, O 1 |

44 of 45 sound from their onset (a rise or a re-pluck dip, above both neighbours or heard by both models): the small h1
rises are re-plucks of a ringing G3 or C3 (#61 #63 #65 #66 #100); #72 B3 rises -36 -> -26 dB beside an equally loud
C4; #106 A#3 is the figure of #487. #29 does not sound (Problem 1). All 35 fretted notes show a fingertip on the cell.

### 5. Beats, downbeats, chords (`Q/bin/c5_beats.py` -> `Q/out/c5_beats.json`)

- Beats, downbeats, chords, taps, tempo and key equal to the pre-repair truth (`truth-fix2-standard/orig/`).
- Own flux: mean peak 13.5 (x median) at the beats, 6.5 at the off-beat eighths, 1.9 at the sixteenths. librosa beat
  tracker (own run): 76.0 bpm, gtr-eval e2246 beats F 0.977 (216/224 within 70 ms), CMLt 0.969, median +16 ms.
- Downbeats -2.1 to +70.8 ms (median 35.0) after their bar's first note; only bar 34 over +60 (the added E3 of 104.644 s
  leads the chord by 41 ms). Beat intervals 0.642-0.957 s.
- Five chords (seed 20261130), seconds sounding per pitch class: 22.69-25.85 F:maj (C 3.1, F 3.1, A 1.9); 54.28-57.43
  F:maj (F 3.1, A 2.0, C 1.9); 104.71-106.25 C:maj (C 2.1, E 1.5, B 1.0, G 0.8); 111.05-117.45 C:maj (C 9.0, E 7.1,
  G 6.3); 120.60-123.73 C:maj (E 3.1, G 2.3, B 2.2, C 1.9: since the bar-39 E3 more E minor by duration, C:maj by the
  builder's bass rule). Consistent with the notes (sevenths unlabelled, as recorded).

### 6. The record and the tools' video

- Borne out: counts, pitch range E2-G4, check-truth, guitar-fl P/R/F1 and per 10 s (90-100 s: .94 against .93),
  guitar-gaps .878, GP5 652/680 and 467 beats, the repairs CSV (19 rows, 4.8 KB), the 76 poses (0.2-14.55 s, median 1.7,
  quad_frame inside each, the 6 labelled frames in the poses named), raw outline vs pose: median 6.0, p90 10.4, p99 18.7
  px, 3.3% over 15 px (`Q/logs/c6_claims.log`).
- Not borne out: (a) the over-15-px raw samples as "quick movements, fits with few inliers": they are real (Problem 3).
  (b) "the new quads follow the fretboard edges in all 12" includes 49.5 s, where p12's top edge is 17-18 px above the
  fretboard at the nut (`Q/frames/strip_b.jpg`); `string_check.py` needs six visible strings and takes one frame per
  2 s, so it never measured 15-37 s (box over string 6) or a jolt. (c) .mid on+off 0.996 is same-pitch overlaps, not tick
  rounding. (d) "1778 frames" tracked: the file has 1771 samples. (e) Smoothed samples "within 10 px": up to 10.4.
- standard.mp4 unchanged (`fbaf409f...`); six frames (n 100, 1500, 3000, 5000, 7000, 8700, `Q/frames/six.jpg`): no tab,
  chord name, title or logo; the last row is a static 1-px line, nothing readable (`Q/frames/bottom_zoom.png`); tags only encoder.

### PROBLEMS (third check)

1. **#29 C3 s5 f3, bar 3 pos 0 (6.886 s, `tab+audio`) does not sound** (inside the 30-s segment). C3's fundamental
   holds -29 dB while #25 rings, dips to -44 dB at 6.85 s, is back at -30 for 6.88-6.91 s, then falls to -46 (6.97), -48
   (7.00) and about -50 until 7.27 s; at #33 (C3, 7.306 s) it rises to -25 and holds -26/-27 to 7.60 s
   (`Q/logs/ftrace_c3_bar3.log`, `c3_bar3_evidence.log`): rise -20.7 dB, the only fall among the 45 sampled notes.
   guitar-fl and guitar-gaps have no C3 from 6.50 to 7.29 s; both have #33 (7.296/7.294) and the bar's E3, G3, C4. The
   video shows the C shape held, not a pluck. Fix: remove #29 (as #466 and #541 were), rebuild offsets and side files;
   look at the other C3s both models miss while there (#196 51.485 s, h1 -1.3 dB; #374 #403 #440 #621 #651, all `tab`).
2. **16 string-slap taps are 55-70 ms late**: all five slaps of the "(lh)" fills of bar 12 (37.315-38.087 s), bar 24
   (75.211-75.995 s) and bar 44 (138.395-139.179 s), and 160.780 s (bar 51). The high-frequency attack (waveform first
   difference, 5-ms frames, a jump of 6-33 dB) comes 55-70 ms before each truth time and nothing happens at it; the truth
   times sit on the tab's sixteenth grid. guitar-gaps marks 17 slaps with a C8 artefact a median 64.5 ms before the
   truth (`Q/bin/c3_slaps.py`, `Q/logs/c3_slaps.log`, `c3_taps.log`). The other 77 slaps are within 50 ms (median
   -10 ms). A perfect tap detector loses 16 of 211 taps (7.6%) at 50 ms (`onsets --field taps`). Fix: re-time each slap
   to its attack (steepest high-frequency rise within -120..+60 ms).
3. **The poses miss the neck's quick jolts; the tracked outline is right there.** At 49.5, 59.0, 68.5 and 108.0 s the
   strings and the nut sit where the raw outline puts them (my 4x readings within about 3 px; 75-110 inliers) and 17-23
   px below the pose quad; at 107.90/108.00/108.10/108.20 s, after the thump of 107.80 s, the neck jolts -12/+22/-12/+8 px
   against p39 and the raw outline -12/+23/-13/+7 (frame 5400 identical to ffmpeg's, `Q/bin/ffcmp.py`; `Q/frames/strip_b-d.jpg`).
   With the raw outline as reference, 30 of 547 fretted notes (5.5%) have their string lane more than half a lane off at
   their fret, 3 more than a whole lane (up to 31.7 px), in 20 poses (p15-p73); none of the 99 in 0-30 s
   (`Q/bin/v_dev.py`, `Q/logs/v_dev_raw.log`; 12 with a 3-sample median of the raw outline). A correct fingertip there is
   scored on the wrong string. Fix: score each note against the nearest 0.1-s tracked outline (`quad_raw`, single-sample
   jumps such as 152.3 s dropped), or cut a pose wherever the raw outline leaves its quad by more than half a lane (about
   12 px at the nut); until then score the video lane on 0-30 s only.

### Doubts (third check)

1. Roll tops (#156 #289-291 #313 #539 #561 #577-578): both models 55-83 ms earlier or absent; C4 over F2 has no partial
   of its own. The film should not judge a tool on them (as checks 1 and 2).
2. `tab` re-plucks neither model hears that do not rise: #199 G3 51.877 s (-9.6 dB, the record's doubt), #520 G3 134.595.
3. Model-only notes: B3 151.650 (guitar-fl; -38 dB, rising with both semitone neighbours: the shift to s2 f5), A2 156.564
   (guitar-fl; +20 dB, 0.17 s before the E chord: the record's brushed A2), G2 91.891 and 104.473 (+1.9, -0.5 dB);
   guitar-gaps E3 155.474, 165.866, 168.220 (no rise).
4. Thumps sit a median 25 ms after their attack (97.5% within 50 ms): fine for scoring, worth re-timing with the slaps.
5. Bars 34 and 39 carry B and E weight under C:maj (Cmaj7 / E-minor colour); bar 34's downbeat is 70.8 ms after the E3.
