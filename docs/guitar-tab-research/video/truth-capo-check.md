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

## Second check (after the repairs)

Checked 2026-11-25 by the truth-recheck-capo agent with its own scripts. Nothing in `/home/user/gtv/truth/capo/` was changed. Truth checked: the repaired `capo.truth.json`, SHA-256 `426d256fcec1...491f74d9`. Scripts, logs, outputs and frames: `/home/user/gtv/work/truth-recheck-capo/` (`bin/`, `logs/`, `out/`, `frames/`). The model runs are mine (gtr-run r0773 Basic Pitch, r0774 Beat This, r0775 guitar-fl; byte-identical to the first check's, since the audio did not change), scored as e1909-e1911. The onset detector is new: madmom 0.16.1 CNN onsets with its own peak picking (threshold 0.54, `out/madmom.thr0.54.txt`). It is a trained detector, not the mel flux that the build and the first check used.

**Verdict. Both listed problems are fixed, and I found nothing the repair broke. No problem is left.** Four doubts remain.

### 1. Schema, times, side files (`out/check1.json`, `logs/check_truth.json`, `out/gp5_*.json`)

- `gtr-eval check-truth`: 8317 checks, 0 mismatches. Every schema and `source` key is present.
- `capo.wav` has 10,051,317 frames at 44.1 kHz, 2 channels: 227.92102 s, equal to `duration_s`. No note, beat, chord or tap lies outside it.
- 0 zero-length notes (the shortest is 0.1265 s). No duplicate (onset, pitch) or (onset, string), no same-pitch pair within 30 ms, no overlap on one string. Every offset keeps the let-ring rule: at most 2 s, and at least 10 ms before the next onset on its string.
- pitch = tuning + capo + fret for 815/815. Beats rise strictly, the downbeats are every 4th beat, the chords cover 0-227.921 s without a gap, and tempo 76.56 = 60 / median beat interval.
- **Side files agree with the JSON:**
  - `notes.csv` (815), `beats.txt` (288; its beat-1 rows are the 72 downbeats) and `chords.lab` (68) are identical to it.
  - `tab.txt` bar times equal the downbeats (within 0.5 ms), with the same 815 (bar, string, fret).
  - `.mid`: 815 notes, onsets within 1.8 ms. 19 offsets differ by 0.055-1.82 s, where same-pitch notes overlap on different strings.
  - `.gp5` with `--time-shift 0.3455`: 815/815 same string and fret, onset F1 1.0, largest offset 7.3 ms.
- **Against the first build** (`truth-fix-capo/orig/capo.truth.json`):
  - Pitch, string, fret and voice are identical for all 815 notes.
  - 128 onsets moved, all later, by 31.8-119.0 ms (median 49.3), and no two notes changed order. 103 offsets changed, and 7 notes became `conf` `tab` (now 761 / 54).
  - 57 beats (by up to 101.6 ms), 22 downbeats, 24 taps and 24 chord boundaries changed. Chord labels, key, tuning, capo and cents did not.
  - `truth-capo-repairs.csv` lists exactly the 128 moved notes.

### 3. Timing (`bin/timing.py`, `bin/timing2.py`; `out/timing.json`, `out/timing2.json`, `logs/timing_table.log`)

- **madmom against the 738 truth onset events: recall within 50 ms 0.993 after the repair, 0.961 before.** The lowest 10 s window is 0.97 after and 0.87 before.
  - Precision against notes and taps 0.909; taps found within 50 ms 0.992. The median detection minus truth is -15.7 ms: the CNN peak comes before the flux peak.
- **SuperFlux** (librosa 0.11, hop 128, default peak picking) finds 0.889. None of its 82 misses has a detection within 136 ms, so they are notes it does not hear (legato), not shifted ones.
- **Models** (my runs, `gtr-eval notes`): Basic Pitch P .537, R .960, F1 .689 (median offset -15 ms); guitar-fl P .884, R .958, F1 .920 (-20 ms).

"mad" is madmom recall within 50 ms. R and F1 are the models' scores within 50 ms; R100 is their recall within 100 ms.

| s | mad | BP R/F1 | gfl R/F1 | | s | mad | BP R/F1 | gfl R/F1 | | s | mad | BP R/F1 | gfl R/F1 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0-10 | 1.00 | 1.00/.76 | 1.00/1.00 | | 80-90 | 1.00 | 1.00/.63 | 1.00/.96 | | 160-170 | 1.00 | 1.00/.77 | 1.00/.98 |
| 10-20 | 1.00 | 1.00/.69 | 1.00/.98 | | 90-100 | 1.00 | .89/.67 | .92/.91 | | 170-180 | 1.00 | .95/.74 | .93/.93 |
| 20-30 | 1.00 | .92/.69 | .94/.95 | | 100-110 | 1.00 | .88/.68 | .94/.91 | | 180-190 | .97 | .96/.76 | .94/.94 |
| 30-40 | 1.00 | .88/.69 | .91/.94 | | 110-120 | 1.00 | .97/.68 | 1.00/.98 | | 190-200 | .97 | .93/.64 | .90/.87 |
| 40-50 | 1.00 | .91/.66 | .97/.94 | | 120-130 | 1.00 | .94/.67 | .97/.92 | | 200-210 | 1.00 | 1.00/.65 | 1.00/.92 |
| 50-60 | 1.00 | .96/.68 | 1.00/.93 | | 130-140 | .97 | 1.00/.76 | .97/.95 | | 210-220 | 1.00 | 1.00/.61 | .97/.89 |
| 60-70 | .97 | 1.00/.76 | .95/.95 | | 140-150 | .97 | .95/.67 | .90/.87 | | 220-228 | 1.00 | 1.00/.71 | 1.00/**.62** |
| 70-80 | .97 | .95/.68 | .90/.86 | | 150-160 | 1.00 | 1.00/.63 | 1.00/.91 | | | | | |

- **Every drop is explained**, and none is a shifted passage. R100 equals R in every window but five, where it is at most .06 higher.
  - madmom .97 (60-80, 130-150, 180-200 s, one event each):
    - Four Eb4 hammer-ons (75.78, 144.39, 181.81, 194.34 s; below).
    - Two D4 + thump events (67.74, 136.35 s), where it fires 50 ms early on the thump. Both models put the D4 within 8 ms of the truth (bias removed).
  - Basic Pitch .88-.92 (20-50, 90-110 s): it misses 15 C4 pull-off targets (s4 f7).
  - guitar-fl .90-.91 (30-40, 70-80, 140-150, 190-200 s): it misses the Eb4 hammer-ons, some C4 pull-offs and Bb2 bass notes, and the Eb3 under the thumps at 79.64, 148.24 and 198.20 s.
  - guitar-fl .62 (220-228 s): extra notes in the ringing last chord (P .44, R 1.00).
- **Note level** (`logs/suspects.log`, `out/timing2.json`, `logs/ctx.log`).
  - Four methods (madmom, SuperFlux, and both models with their median offset removed): **0 notes** that two methods hear more than 50 ms after the truth, with none within 30 ms. In the other direction there is one: #648 (181.81 s), a hammer-on whose "evidence" is the attacks of its neighbours.
  - Three methods (no SuperFlux): 50 such notes on the first build, 5 now. All 5 have no model note of that pitch within 200 ms, so madmom alone gives a time: #648 again, and four C4 pull-off targets at +32 to +51 ms with its bias removed (see Doubts).
- **The 128 re-timed notes:** madmom (bias removed) median -2 ms, 128/128 within 30 ms. The Basic Pitch and guitar-fl medians are -3 ms. None was moved past its sound.
- **The Eb4 hammer-ons (s2 f0 to f1), a doubt in the first check, are settled** (`logs/sal2_eb4.log`, `out/legato.json`).
  - Six of them have no detector onset (63.30, 75.78, 131.89, 144.39, 181.81, 194.34 s).
  - At all six, D4 (harmonics 2-4, 46 ms STFT) falls 9-18 dB from 20 ms before to 20-40 ms after the truth onset. Eb4 turns from 1-4 dB below D4 to 1-12 dB above it.
  - The truth is right: a hammer-on has no attack for a detector to find.
- **The D4 at 197.80 s** (the one note the repair left): madmom is +28 ms and guitar-fl +22 ms raw (about +43 ms with bias removed). Basic Pitch has no D4 there. It is inside 50 ms.

### 2. Tuning and capo (not touched by the repair; measured again; `out/check2.json`)

- **Pitches** (my Basic Pitch run):
  - The open strings with capo 3 (G2 C3 F3 Bb3 D4 G4) sound 57/25/62/129/289/70 times.
  - The open strings without a capo (E2 A2 D3 G3 B3 E4) sound 0/0/2/16/0/0 times. G3 is also s4 f2 in the tab.
  - The capo-2 set sounds 8/0/0/0/0/0 times.
  - guitar-fl's lowest note is Bb2 (69 notes), apart from one F2.
- **Frames** 6.12, 120.20 and 128.57 s at full resolution (`frames/f_6.116_right.png`, `frames/cmp3.jpg`):
  - The capo sits in fret space 3. The single dot between it and the next wire toward the nut is the 3rd-fret dot: counting on from it, the dots fall in spaces 5, 7, 9, 12 (three), 15 and 17.
  - The nut is off-frame. **Capo 3.**
- **Cents:** I measured the fundamentals of 877 guitar-fl notes (0.25 s from +60 ms, zero-padded FFT, parabolic peak). The median is **+2.8**, IQR -2.0 to +6.7. The truth's +2.0 agrees.

### 4. Twenty random notes (seed 7, one per twentieth of the piece) and all 26 notes of bars 9 and 13

Files: `bin/check45.py`, `out/check45.json`, `frames/sheet_r1.jpg`, `frames/sheet_r2.jpg`, `frames/sheet_bars.jpg`, `frames/zoom_open.jpg`.

- **Rise**: the salience of the pitch (harmonics 1-4, 46 ms STFT), 25-100 ms after the onset minus 25-80 ms before.
- **Offsets**: madmom / Basic Pitch / guitar-fl, raw, in ms.
- **Frame**: the frame at the onset, with fret spaces from my wire positions on frame 6.12 s. The neck moves up to about 45 px sideways, so the fret space is good to about half a fret. "nfN" means a fingertip is in nut-fret space N (= fret + 3).

| # s note s/f | rise dB; offsets | frame | | # s note s/f | rise dB; offsets | frame |
|---|---|---|---|---|---|---|
| 20 6.12 C4 3/2 | 8.4; -16/-16/-18 | nf5 | | 416 120.20 F4 2/3 | 10.0; -21/-8/-19 | nf6, low strings |
| 48 14.38 C4 3/2 | 14.6; -12/-23/-17 | nf5 | | 439 128.57 F4 2/3 (moved) | 17.8; -9/-10/-14 | nf6 |
| 98 29.64 D4 4/9 | 7.8; -17/-3/-25 | nf12 | | 476 137.52 Bb2 6/3 | 5.0; -17/-24/-23 | thumb at nf6 |
| 117 35.58 D4 2/0 | 18.1; -12/-11/-21 | open: fingers near s1-s2 | | 525 149.62 C4 4/7 | 9.8; -21/-23/-26 | nf10 |
| 157 46.70 Bb3 3/0 | 15.2; -14/-13/-21 | open: unclear | | 590 168.56 C4 3/2 | 3.5; -12/-17/-21 | nf5 |
| 215 65.01 G3 4/2 | 7.0; -13/-2/-16 | nf5 | | 621 176.91 D4 3/4 | 6.9; -10/-21/-15 | nf7 |
| 234 69.92 F4 2/3 (moved) | 10.2; -15/-24/-22 | nf6 | | 655 183.59 G3 4/2 | 6.3; -16/-29/-22 | nf5 |
| 299 86.18 C4 3/2 | 10.0; -18/-23/-22 | nf5 | | 715 197.64 Eb4 2/1 `tab` | ring; -20/none/none | nf4 |
| 354 101.09 D4 2/0 | 13.3; -15/-15/-24 | open: unclear | | 749 206.10 F4 2/3 | 6.8; -13/-10/-25 | nf6 |
| 362 103.64 Eb4 2/1 | 9.4; -9/-23/-18 | nf4, low strings | | 803 221.56 Bb3 3/0 | 14.0; -16/-22/-21 | open: unclear |

- **Bars 9 and 13** (#80-92, 25.22-28.13 s; #124-136, 37.74-40.64 s): Bb2 on s6 f3 and the D4/C4 pull-off figure on s4 f9/f7.
  - Every D4 and Bb2: madmom -22 to -4 ms, and one model within 30 ms (raw).
  - The 8 C4 pull-off targets rise -4.7 to 8.5 dB, with madmom at -24 to +18 ms. Seven have a model note within 31 ms; #133 (39.62 s) has none.
  - Frames (8): the thumb over the top frets s6 at nf6, and a fingertip is at nf10 or nf12 on the middle strings.
- **Result.** Every note's pitch sounds from its onset, or rings on into it, within the timing above.
  - All 16 fretted notes show a fingertip in the right fret space.
  - In the 4 open-string frames, fingers rest near the bottom strings at nf4-6; from the front, pressing cannot be told from hovering. The string can be read only roughly. No frame contradicts the truth.

### 5. Beats, downbeats, chords (`out/eval_beats.json` e1909, `logs/beats_detail.log`, `out/check45.json`)

- **Beat This** (my run):
  - Beats F **.998** (288/288 within 70 ms), CMLt .997, median offset -11 ms; the largest is 53 ms, at 161.73 s (the slide's attack; madmom is at -17 ms there).
  - Downbeats F **.986** (72/72), largest offset 41 ms. 72 of its downbeats fall on a truth beat 1, and 1 on a beat 2.
- **Onset envelope:**
  - 272 of 288 beats carry a note or tap, and all 272 have a madmom onset within 50 ms (0.949 on the first build).
  - So do all 71 downbeats that carry one (0.873 before). Bar 60 starts on a tie.
  - The 16 beats with no event lie -35 to +27 ms from Beat This.
- **Bar starts:** every downbeat is beat 1 of a `tab.txt` bar, within 0.5 ms.
- **Five random chord segments (seed 7).** Cosine of the label against major/minor templates, then the best template:

| segment s | label | truth notes: label / best | CQT chroma: label / best |
|---|---|---|---|
| 23.69-25.22 | C:min | .55 / C:min | .55 / A#:maj .60 |
| 37.74-43.92 | A#:maj | .75 / tie with G:min (Bb, D, C sound) | .69 / G:min .72 |
| 64.26-65.79 | C:min | .68 / C:min | .63 / C:min |
| 135.97-142.24 | A#:maj | .83 / A#:maj | .65 / A#:maj |
| 165.66-167.25 | D#:maj | .80 / D#:maj | .71 / D#:maj |

### 6. The record and the tools' video

- **Six frames of `capo.mp4`** (6.1, 40, 120.2, 128.6, 180, 225 s; `frames/cmp3.jpg`, `frames/six_b.jpg`), 1920x556: no tab, chord name, title, logo or text. The container tags hold only encoders (Lavf60.16.100, Lavc60.31.102 libx264).
- **The Repairs section holds up against my files.** Every number below matches:
  - 128 notes in 120 events moved later by 32-119 ms (median 49), with pitch, string, fret and voice unchanged; 103 offsets; 7 notes to `tab` (761/54).
  - 57 beats (up to 102 ms), 22 downbeats, 24 taps and 24 chord boundaries changed; labels and range unchanged; tempo 76.56.
  - Beat This .998 / 288 and .986 / 72. guitar-fl .884/.958/.920 and Basic Pitch .537/.960/.689. `.gp5` onset+offset .409.
  - The only text change in the truth is `what` (it now mentions the repair), besides `derivation`.
- **Small mismatches with no effect:**
  - The record gives guitar-fl's lowest per-10 s recall as .88 and Basic Pitch's as .85; I get .90 and .88. Probably other window edges.
  - The record says "17 same-pitch notes overlap". The repaired truth has 23 overlapping same-pitch pairs on different strings. The 19 MIDI offsets agree.

### PROBLEMS (second check)

None. Both earlier problems are fixed. No note is more than 50 ms from its sound for two independent methods, and no beat is more than 70 ms from Beat This.

### Doubts (second check)

- **The C4 pull-off targets (s4 f7 after s4 f9; 20 notes, `out/legato.json`).**
  - madmom is at a median -8 ms raw, but up to +35 ms at 28.65, 41.17 and 97.31 s. There the C4 rises 10-40 ms after the truth (`logs/sal2_c4.log`).
  - At 7 of them the repair moved the D4 before the C4 later and moved the C4 less or not at all. The D4-to-C4 gap shrank from 174-221 ms to 136-171 ms.
  - This is inside 50 ms, and both models miss most of these C4s, so no score moves. Re-time them from the D4's stop if the build is touched again.
- **Pull-off origins struck with an X slap** (Eb4 on s2 f1 at 79.08, 147.68 and 197.64 s; `conf` `tab`; `logs/ctx.log`): neither model hears an Eb4 attack there.
  - The Eb4 hammered on 0.2 s earlier is still ringing, and the slap brings out Eb3, Bb3 and D4.
  - They are right by the tab, but no tool can be expected to report them.
- **The five thump events the record names** (56.47, 79.64, 125.08, 148.24, 198.20 s; `logs/ctx.log`): the models put the written notes 19-42 ms after the thump (raw), inside 50 ms.
- **The first check's doubts on derived chord labels and the static `neck_quad_px` still stand.** Across my six frames the capo moves about 45 px sideways (1725 to 1770 px), and at 40 s the neck is tilted. The repair did not touch either.
