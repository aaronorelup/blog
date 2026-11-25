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
