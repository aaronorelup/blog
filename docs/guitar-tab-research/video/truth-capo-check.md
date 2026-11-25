# Independent check of the `capo` ground truth (*Steal My Girl*, capo 3)

Checked 2026-11-25 by the truth-check-capo agent, with its own scripts. Nothing in `/home/user/gtv/truth/capo/` was changed. Truth checked: `capo.truth.json`, SHA-256 `d6f95a15aa98...b3dad864`. Scripts, logs and outputs are in `/home/user/gtv/work/truth-check-capo/` (`bin/`, `logs/`, `out/`, `frames/`). Every number comes from a file named next to it.

**Verdict.** The pitches, strings, frets, tuning and capo hold up. The timing does not hold up everywhere: **46 of 815 notes, in 24 short runs, sit 50 to 100 ms before the sound.** Most runs are the figures that lead into a bar at the end of a phrase. The beats, downbeats and taps there are early by the same amount.

## 1. Schema, times, side files

- `gtr-eval check-truth`: 8317 checks, 0 mismatches (`logs/check_truth.json`).
- `bin/check_schema.py` (`out/schema.json`):
  - Every schema key and `source` key is present.
  - `capo.wav` has 10,051,317 frames at 44.1 kHz, 2 channels: 227.92102 s, equal to `duration_s`.
  - 0 notes, beats, chords or taps outside the audio. 0 zero-length notes (the shortest is 0.135 s).
  - No duplicate (onset, pitch) or (onset, string), no same-pitch pair within 30 ms, 0 overlaps on one string.
  - pitch = tuning + capo + fret for 815/815.
  - Beats rise strictly. Downbeats are a subset, one every 4 beats. The chords cover 0-227.921 s with no gap.
- Side files:
  - `notes.csv` (815 rows), `beats.txt` (288 rows; the beat-1 rows are the 72 downbeats) and `chords.lab` (68) are identical to the JSON.
  - `tab.txt` bar times equal the downbeats (0.5 ms rounding), with the same bar/string/fret multiset of 815 notes.
  - `.mid`: 815 notes, onsets within 2 ms, same pitches.
  - `.gp5`: `gtr-eval tab --time-shift 0.3455` gives 815/815 same string and fret (`out/eval_gp5_tab.json`).
  - 19 MIDI offsets differ by 20 ms to 1.87 s. The cause is 17 overlapping same-pitch pairs on different strings, not the record's "tick rounding" (`logs/mid_offsets.log`).

## 2. Tuning and capo (without the tab's header)

- **The pitches that sound** (both models are my own runs; `logs/chords_tuning.log`):
  - Neither model has a single note at E2, A2, B3 or E4 (40/45/59/64), the open strings without a capo.
  - Basic Pitch hears the capo-3 open-string pitches: G2 (43) 57 times, C3 25, F3 62, Bb3 129, D4 289, G4 70. G2 is the open 6th string over capo 3; it is not in the truth, which the record says.
  - guitar-fl's lowest note is Bb2 (46, 69 notes), apart from one F2.
  - Basic Pitch's 39/41/42 (37/25/8 notes) lie below every string and fall on thumps: body sound.
- **Frame** (`frames/f1.png`, 1.00 s, full resolution; crops `f1_right.jpg`, `f1_mid.jpg`):
  - Wires from the nut side are at x ≈ 1827, 1718, 1616, 1518, (hidden), 1340, 1260, 1183, 1110, 1041, 977. Counted from the wire just left of the capo, the inlays sit in fret spaces 3, 5, 7, 9, 12 (three dots), 15 and 17.
  - The capo (x ≈ 1740) is in fret space 3, on the nut side of wire 3. The nut is off-frame past x = 1920.
  - **Capo 3 confirmed.** The capo sits at the same place relative to the inlays in all six frames (`frames/montage6.jpg`).
- **Cents.** I measured the fundamentals of 738 guitar-fl notes (a 0.2 s window starting 50 ms after the onset, parabolic peak): median **+2.6 cents**, IQR +0.2 to +5.5. `librosa.estimate_tuning` on the first 120 s gives +4.0. The truth's +2.0 agrees.

## 3. Timing: my own onset detector and two transcription models

- **Detector**: librosa 0.11 mel flux, hop 256, peak picking fixed in advance. 837 detections against 738 truth onset events (notes within 25 ms merged).
  - **Recall within 50 ms: 0.916.** Precision against notes and taps: 0.879. Taps recall: 0.965.
  - The median detection minus truth is +2.8 ms, half a hop: the truth sits on onset-envelope peaks.
- **Models** (my own runs, `out/timing.json`):
  - Basic Pitch 0.4.0 (tflite): P .518, R .925, F1 .664.
  - guitar-fl: P .860, R .931, F1 .894.
  - Their matched offsets have medians of -13 and -18 ms.

R and R100 are recall within 50 and 100 ms.

| s | n | det | gfl R/F1 | gfl R100 | BP R/R100 | | s | n | det | gfl R/F1 | gfl R100 | BP R/R100 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0-10 | 34 | **.82** | .94/.94 | 1.00 | .94/1.00 | | 120-130 | 32 | **.80** | **.88**/.83 | .97 | **.81**/.97 |
| 10-20 | 30 | .97 | 1.00/.98 | 1.00 | 1.00/1.00 | | 130-140 | 40 | .95 | .95/.93 | .97 | .97/1.00 |
| 20-30 | 37 | .86 | .95/.95 | .95 | .92/.95 | | 140-150 | 40 | .95 | .90/.87 | .90 | .95/.95 |
| 30-40 | 33 | .94 | .91/.94 | .91 | .88/.88 | | 150-160 | 37 | 1.00 | 1.00/.91 | 1.00 | 1.00/1.00 |
| 40-50 | 33 | .94 | .97/.94 | .97 | .91/.94 | | 160-170 | 29 | .89 | .90/.88 | 1.00 | .90/1.00 |
| 50-60 | 27 | **.81** | .93/.86 | 1.00 | **.81**/.96 | | 170-180 | 44 | .86 | **.84**/.84 | .93 | .86/.95 |
| 60-70 | 41 | .95 | .93/.93 | .95 | .98/1.00 | | 180-190 | 48 | .92 | .92/.92 | .94 | .92/.94 |
| 70-80 | 42 | .95 | .91/.86 | .91 | .95/.95 | | 190-200 | 41 | .92 | .90/.87 | .90 | .93/.95 |
| 80-90 | 37 | 1.00 | 1.00/.96 | 1.00 | 1.00/1.00 | | 200-210 | 36 | .89 | .97/.90 | 1.00 | .97/1.00 |
| 90-100 | 38 | .89 | .90/.88 | .92 | .84/.90 | | 210-220 | 37 | 1.00 | .97/.89 | .97 | 1.00/1.00 |
| 100-110 | 34 | .97 | .94/.91 | .94 | .88/.94 | | 220-228 | 16 | .87 | .88/**.54** | 1.00 | .81/1.00 |
| 110-120 | 29 | .90 | .97/.95 | 1.00 | .93/.97 | | | | | | | |

- **Drops.** The detector drops at 0-10, 50-60 and 120-130 s, the models at 50-60, 120-130, 170-180 and 220-228 s. The .54 at the end comes from guitar-fl's extra notes in the last chord. R100 returns to .96-1.00 there, so the drops are timing, not missing notes.
- **Note level** (`out/suspects.json`, `logs/consensus.log`). For each truth note I took the nearest detector onset and each model's nearest onset of the same pitch, with the model's median bias added back.
  - **46 notes**: at least two of the three methods say 50 ms or more late, and none is within 30 ms. For 17 of them all three say so without any bias correction.
  - The CQT (`out/cqt_suspects.png`) shows it at 59.14-59.50, 127.92-128.10 and 162.07-162.48 s. There the C4-Bb3-(thump + bass) figure that leads into the bar sounds 50-100 ms after the truth. The notes after it are on time again.
- **The 15 C4 pull-off targets** (s4 f7 after s4 f9, 25.5-111.3 s) that Basic Pitch misses are real. At the truth onset C4 rises a median +9.4 dB (minimum 2.6) while D4 falls 7.0 dB, and the steepest rise is a median 6 ms from the truth (`logs/pulloff_c4.log`).

## 4. Twenty random notes (seed 2026), and every note of bars 7 and 11 inside the 30 s segment

- **Audio**: the CQT rise at the pitch, 20-120 ms after the onset against 10-100 ms before (`out/check4_spec.json`, `.png`).
  - "ring": the same pitch was already sounding, so the rise is small. Both models' onsets confirm these notes (`out/cqt_weak5.png`).
  - The offsets are Basic Pitch / guitar-fl, in ms.
- **Frame**: the nearest frame at full resolution (`frames/c4/`, `frames/c4_sheet0-3.jpg`, `zoom_63_64_68.jpg`).
  - "region nfN": a fingertip is in nut-fret space N (= fret + 3).
  - "free": no finger visibly presses the open string.
  - The string can be read only roughly.

| # s note s/f | rise dB, BP/gfl ms | frame | | # s note s/f | rise dB, BP/gfl ms | frame |
|---|---|---|---|---|---|---|
| 105 31.19 Bb3 3/0 | 2.2 ring, -8/-22 | free | | 586 166.80 C4 3/2 | 17.6, -13/-18 | region nf5 |
| 121 36.78 D4 2/0 | 9.3, -15/-20 | unclear | | 615 175.75 G4 2/5 | ring, -18/-20 | region nf8 |
| 228 68.50 Bb3 3/0 | 16.6, -29/-20 | hand off board | | 636 179.66 G4 2/5 | 8.6, -21/-25 | near nf8 |
| 327 93.89 D4 4/9 | 3.9 (+14.6 oct), -13/-23 | region nf12 | | 662 185.52 D4 2/0 | 6.7, -18/-21 | free |
| 430 126.22 F4 2/3 | ring, +25/+23 | region nf6 | | 748 206.10 Bb3 3/0 | ring, -10/-17 | free |
| 502 143.78 Eb3 5/3 | 19.4, +2/+5 | region nf6 | | 769 212.31 Bb3 3/0 | 11.6, -17/-22 | motion blur |
| 514 146.65 Eb3 5/3 | 14.7, +27/+21 | region nf6 | | 786 216.69 D4 2/0 | 13.2, -20/-19 | free |
| 524 149.20 D4 4/9 | 12.5, -17/-19 | region nf12 | | 791 218.44 Bb3 3/0 | 18.4, -7/-17 | free |
| 560 159.05 Bb3 3/0 | 11.1, -33/-21 | free | | 795 218.83 Eb3 5/3 | 10.1, -29/-20 | region nf6 |
| 569 161.54 D4 2/0 | ring, -20/-19 | free | | 802 220.99 D4 2/0 | 12.5, -24/-21 | free |

- **Bar 7** (#62-70, 19.08-21.92 s): Eb3 5/3 x3, Eb4 2/1, D4 2/0 x2, C4 3/2 x2, Bb3 3/0. Rises 5.9-24.6 dB; model offsets -24 to +21 ms.
- **Bar 11** (#106-114, 31.37-34.34 s): the same figure. Rises 2.4 (+18.9 at the octave) to 21.7 dB; offsets -23 to +13 ms.
- **Hand, both bars**: one shape throughout. A pair of fingers sits at nut-fret 6 on s6/s5, one fingertip at s3 nut-fret 5 and one at s2 nut-fret 4 (zoom). At the open D4 (#64) a finger hovers over s2 (a pull-off).
- **All 38 notes sound at the written pitch from their onset.** Both models find the same pitch within 33 ms, and the detector within 44 ms. No frame contradicts the string or fret; two are unclear (#121, #769).

## 5. Beats, downbeats, chords

- **Beat This 1.1.0** (my run; `gtr-eval beats` e1891; `out/eval_beats_beatthis.json`, `logs/beats_detail.log`):
  - Beats F .977 (282/288 within 70 ms), CMLt .993. Downbeats F .932 (68/72), CMLt .959.
  - 72 of its downbeats fall on truth beat 1 and one elsewhere: the bar lines are in the right musical place.
  - It differs from the truth by more than 70 ms only at 7.21 (bar 3 beat 2), 59.50 (bar 20), 128.10 (bar 42), 161.68, 174.89 (bar 57) and 178.02 s (bar 58). The truth is 70-102 ms early every time, at places found in section 3.
- **Onset envelope.** 272 of 288 truth beats carry a note or tap, and 91.5 % of those have a detected onset within 50 ms. Of the 23 that do not, 20 are in the section 3 runs (detected 55-102 ms later). The other three (28.26, 51.76, 189.01 s) are 55 ms late.
- **Bar starts.** Every truth downbeat is beat 1 of a tab bar (it equals the `tab.txt` bar time). 71 of 72 carry an event; bar 60 starts on a tie.
- **Five random chord segments (seed 2026).** Cosine of the label against duration-weighted truth pitch classes and against CQT chroma (`logs/chords_tuning.log`, `logs/chords_notes.log`):

| segment s | label | notes: label / best | audio: label / best |
|---|---|---|---|
| 51.76-53.29 | F:maj | .57 / A#:maj .80 (F, D, C, Bb sound; no A) | .75 / F:maj |
| 54.87-56.47 | D#:maj | .67 / C:min .93 | .74 / C:min .81 |
| 134.37-135.97 | D#:maj | **.32** / D:min, A#:maj .63 | .52 / D:maj .60 |
| 210.94-218.83 | A#:maj | .89 / A#:maj | .76 / A#:maj |
| 218.83-223.44 | D#:maj | .66 / tie with D#:min | .63 / D#:min .69 (F# = 5th partial of D) |

## 6. The record against the files; the tools' video

- **Six frames of `capo.mp4`** (1, 40, 80, 120, 160, 220 s; `frames/montage6.jpg`): no tab, chord name, title, logo or text. The container tags hold only `encoder=Lavf60.16.100`. `capo.seg30.mp4` is also 1920x556.
- **Confirmed by my files:** all counts (815 notes, 573/202/40 by voice, 768/47 by conf, 288/72 beats, 68 chords, 258 taps 96/146/16), tempo 76.57, Basic Pitch .518/.925/.664 and guitar-fl .860/.931/.894 (my runs give identical numbers), capo 3 behind wire 3 with the nut off-frame, +2 cents.
- **Not supported:**
  - "No 10-second stretch scores far below ... so no stretch is misaligned": the 10 s windows hide the 24 runs.
  - "±0.50 s changes no event": that tests the search window, not the tempo penalty that holds these events on the written grid.
  - "MIDI tick rounding": see section 1.
  - "One static shot": the camera is static, but the guitar moves (see Doubts).

## PROBLEMS

1. **Note onsets 50-100 ms early: 46 notes in 24 runs.**
   - Where (s, #note): 7.21-7.42 (#24-25), 9.03-10.42 (#30-35), 25.38, 28.06, 34.53, 53.29 (#174), 59.14-59.50 (#190-192), 62.63 (#205), 92.28 (#321), 94.04, 112.86 (#397), 120.34 (#417), 126.61 (#433), 127.75-128.51 (#436-439), 131.24 (#451), 162.07-162.48 (#572-574), 172.97-174.89 (#603-612), 178.03 (#628), 180.97-181.15 (#643-646), 194.70, 197.80, 207.24-208.38 (#753-757), 219.79-220.31 (#798-800), 223.23.
   - Evidence: at least two of three independent methods hear the note 50-116 ms after the truth onset (`logs/consensus.log`). The CQT shows three of the runs (`out/cqt_suspects.png`).
   - Effect: a tool that gets these notes right is scored wrong on them.
   - Fix: re-time these events from the audio. Either snap each to the onset where two methods agree within ±150 ms, or re-run the alignment with the tempo penalty relaxed at phrase ends. Then re-check.
2. **Beats, downbeats and taps early by the same amount.**
   - Where: beats 7.21 (bar 3 beat 2), 59.50 (bar 20), 128.10 (bar 42), 161.68, 174.89 (bar 57) and 178.02 (bar 58) are 70-102 ms early against Beat This. The detector also hears the downbeats of bars 18, 21, 43, 53 and 59 55-102 ms late. The thumps at 59.498 and 128.102 are early too.
   - Evidence: `logs/beats_detail.log`.
   - Fix: re-interpolate them after fix 1.

## Doubts (none of these alone would make the film state a wrong fact about a tool)

- **Chord labels are derived, and three of five fit their own notes poorly** (section 5). F:maj at 51.76 s has no A sounding. D#:maj at 54.87 s fits C:min better. D#:maj at 134.37 s scores cos .32. Score chords by root, or call them a reading.
- **`neck_quad_px` is static, but the neck moves** (`logs/string_track.log`, `logs/capo_track.log`):
  - Near the capo (x 1650), string 6 lies at y 219-284 in clean frames: 284 at about 40 s, 219 at about 55 s.
  - Near the body (x 700) it stays within y 198-216.
  - `score_video_cells.py` does not read the quad. Anything that does would be off by up to about 60 px at the nut end.
- **Eb4 on s2 f1, last 16th of beat 1**, in bars 21, 25, 43, 47 and 63 (63.29, 75.78, 131.89, 144.39, 194.34 s): the detector and guitar-fl put the onset 150-180 ms later, but Basic Pitch hears Eb4 at the truth time. Probably a soft hammer-on; check by ear.
- `SONGS.md` says "the nut at the right edge". The nut is off-frame, as `truth-capo.md` says.
- **Not re-checked:** the labelled frames of `capo.video.json` (2.60 s, 59.96 s), the record's time base, and its 10-note hand check.
