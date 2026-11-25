# Independent check of the "tuning" ground truth

Checked 2026-11-25 by truth-check-tuning with its own scripts: `/home/user/gtv/truth/tuning/` (JSON, side files, video
JSON) and `truth-tuning.md`. Scripts, logs, frames: `/home/user/gtv/work/truth-check-tuning/` (`PROGRESS.md`). No truth file changed.

**Verdict: not passed. 2 problems**: 12 bass notes have the wrong pitch and fret, and about 55 notes sit where nothing of
their pitch is plucked (7 of them in the film's 30 s segment). Tuning, capo, form, schema, side files and video: pass.

## 1. Schema, times, side files (`c1_schema.py`, `c1_*.log`)

- `gtr-eval check-truth` 0.12.1: 6411 checks, 0 mismatches; the segment truth 1109 checks, 0 mismatches.
- Every schema key is present. 628 notes, onsets 1.678-177.464 s, offsets up to 182.50 s, all inside the 187.3707 s WAV
  (`duration_s` differs by 22 us). 0 zero-length notes, 0 same-pitch notes within 30 ms of each other, 0 overlapping notes
  on one string (shortest gap on a string 0.29 s), 0 of 628 break pitch = tuning + capo + fret. Frets 0-5.
- Side files: `notes.csv` 628/628 equal; `beats.txt` equal within 0.05 ms, its beat-1 rows are the 49 downbeats;
  `chords.lab` 50/50; `.mid` all 628 notes within 2.1 ms (tick rounding); `.gp5` and `.tab.txt` 49 bars, each bar's
  (string, fret) multiset equal to the JSON; `quantized.json` the same multiset; `seg30.truth.json` is the full truth cut at
  25.0 s (106 notes, 33 beats, 8 downbeats) and `seg30.wav` equals `tuning.wav` from 25.0 s sample for sample. The merged
  tab unrolled as Verse 4x, Chorus, Verse 4x, Chorus 2x, Verse 4x, End matches the JSON bar by bar (49/49).

## 2. Tuning and capo (`c2_tuning.py`, `c2_tuning.json`, `frames/`)

- Lowest pitch, without the tab: long-term spectrum 1.5-178 s, level above the 40-70 Hz floor: C2 +4.1 dB, C#2 +9.7,
  **D2 +24.3** (the first real peak), E2 +27.0, G2 +38.2. Nothing sounds below D2, and standard tuning cannot go below E2.
- Open strings (the fret-0 notes of each string, 15-144 per string), level 0.2 s after the onset, claimed against the
  standard-tuning pitch of that string (harmonics 1-3): s6 D2 55.6 / E2 28.7 dB; s5 G2 56.2 / A2 43.4; s4 C3 47.5 / D3
  33.9; s3 F3 49.7 / G3 40.1; s2 A3 54.4 / B3 21.7; s1 C4 48.1 / D4 31.2 / E4 28.9. The claimed pitch is the louder one in
  85-100 % of the notes of each string. **D G C F A C confirmed**, the extra drop of string 1 included.
- Video: frame at 100.0 s, 1:1 crop (`frames/nut_100.0.png`): the nut (x about 2144 px) and the slotted headstock are in
  frame, no capo, the fretting hand at frets 1-3. The same in all 46 onset crops of check 4 and the six frames of check 6.
  **No capo confirmed.**
- Cents: my STFT peak method (465 single notes, 0.37 s window, parabolic peak) median **-9.3 c** (IQR -18.4 to -2.8; per
  string s1 -9.2, s2 -3.9, s3 -10.7, s5 -11.9, s6 -18.5); `librosa.estimate_tuning` (defaults) -13.0 c on 10-170 s.
  The truth's -9 agrees.

## 3. Timing (`c3_onsets.py`, `c3_windows.py`, `bp/`, `c3_*.json`)

- My onset detector (librosa mel flux, hop 5.8 ms, 678 onsets): **548/628 truth onsets (0.873) have an onset within
  50 ms**; chance level (truth shifted by +-0.25 and +-0.5 s) 0.352. Median: detector 11.6 ms earlier than the truth. By
  voice melody 0.896, chord 0.884, bass 0.763; by conf tab+audio 0.909, tab 0.652. Per 10 s from 0 to 180 s:
  .90 .82 .86 1.0 .92 .88 .89 .81 .89 .85 .84 .89 .89 .86 .91 .86 .84 .76
- Basic Pitch 0.4 (my run, gtr-run r0769, 65-1400 Hz), `gtr-eval notes` (50 ms, 50 c): onset **P 0.541, R 0.678,
  F1 0.602** (the record's numbers exactly); median 21 ms earlier than the truth. Per 10 s F1 (gtr-eval's matching,
  `mir_eval` match_notes, per window): .60 .59 .62 .68 .68 .58 .59 .75 .65 .54 .61 .48 .63 .59 .57 .65 .57 .45.
  Shifting Basic Pitch by +21 ms does not help (F1 0.595).
- No window collapses. Lowest: 170-180 s (detector 0.76, Basic Pitch 0.45: the slowing last bar), 110-120 s (Basic Pitch
  0.48), 70-80 s (detector 0.81). No whole stretch is misaligned; the failures are single notes (Problems 1 and 2):
  **55 notes have neither an onset within 50 ms nor a Basic Pitch note of their pitch within 50 ms** (`c3_windows.log`),
  mostly at bar position 3 (18 of 48 bars, the bass), 1 (9 bars) and 6 (8 bars).

## 4. Twenty random notes (seed 20261125) and every note of bars 8 and 12 (`c4_notes.py`, `c4_table.md`)

rise = dB change of the note's pitch (harmonics 1-4, 93 ms STFT), 10-100 ms before to 30-120 ms after the onset (confirmed
notes: median +11.3). onset / BP = ms to the nearest detected onset / Basic Pitch note of that pitch (`-` = none within
0.5 s). `*` = bar 8 or 12. Video crops at each onset: `frames/sheet_random20.png`, `frames/sheet_bars8_12.png`.

| # | t s | pitch | conf | rise dB | onset ms | BP ms | verdict | # | t s | pitch | conf | rise dB | onset ms | BP ms | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 3.48 | C4 s1 f0 | t+a | +16.1 | -6 | -22 | ok | 22 | 8.01 | G3 s3 f2 | t+a | +1.9 | -6 | +464 | ok, re-pluck |
| 79 | 23.95 | A#2 s5 f3 | t+a | +7.3 | -17 | +126 | ok | 104 | 31.18 | G2 s5 f0 | t+a | +18.6 | +17 | -16 | ok |
| 107 | 31.45 | A#3 s2 f1 | t+a | +17.9 | +29 | +19 | ok | 124 | 36.54 | C4 s1 f0 | t+a | +13.9 | -12 | -23 | ok |
| 142 | 41.72 | A3 s2 f0 | t+a | -1.1 | -12 | -27 | ok, re-pluck | 163 | 47.30 | C4 s1 f0 | t+a | +18.3 | -6 | -23 | ok |
| 190 | 55.00 | C4 s1 f0 | tab | -3.1 | -48 | - | doubt | 216 | 62.22 | C4 s1 f0 | t+a | +8.2 | -12 | -36 | ok |
| 236 | 67.58 | D3 s4 f2 | t+a | +0.8 | -12 | -155 | ok, re-pluck | 239 | 68.60 | A3 s2 f0 | t+a | +14.5 | -6 | -20 | ok |
| 259 | 74.57 | A3 s2 f0 | t+a | +4.6 | -12 | -34 | ok | 311 | 89.36 | A3 s2 f0 | t+a | +4.0 | -6 | -13 | ok |
| 323 | 92.80 | G3 s3 f2 | t+a | +7.8 | -17 | -40 | ok | 390 | 111.37 | C3 s4 f0 | t+a | +15.5 | -12 | +118 | ok |
| 422 | 120.21 | G2 s5 f0 | t+a | +5.0 | -17 | -39 | ok | 488 | 138.44 | C4 s1 f0 | t+a | +7.9 | -12 | -28 | ok |
| 490 | 139.31 | F3 s3 f0 | t+a | +3.2 | +203 | -32 | ok | 531 | 150.52 | F3 s3 f0 | t+a | +3.2 | +163 | -37 | ok |
| 91* | 27.52 | E2 s6 f2 | t+a | +19.9 | +17 | -1 | ok | 92* | 27.68 | G2 s5 f0 | t+a | +14.9 | -17 | -30 | ok |
| 93* | 27.68 | G3 s3 f2 | t+a | +12.0 | -17 | +133 | ok | 94* | 27.73 | C3 s4 f0 | t+a | +7.0 | +12 | +88 | ok |
| 95* | 28.24 | A3 s2 f0 | tab | -1.8 | +394 | +378 | **FAIL** | 96* | 28.64 | A3 s2 f0 | t+a | +17.9 | -12 | -28 | ok |
| 97* | 29.07 | D2 s6 f0 | tab | -0.8 | +218 | - | **FAIL** | 98* | 29.30 | C4 s1 f0 | t+a | +10.4 | -12 | +407 | ok |
| 99* | 29.73 | C4 s1 f0 | t+a | +13.6 | -12 | -23 | ok | 100* | 30.19 | G3 s3 f2 | t+a | +4.3 | -17 | +414 | ok |
| 101* | 30.42 | A3 s2 f0 | t+a | +14.0 | -6 | -21 | ok | 102* | 30.63 | G3 s3 f2 | t+a | +13.3 | -12 | -33 | ok |
| 103* | 30.85 | A3 s2 f0 | t+a | +7.6 | -6 | -21 | ok | 143* | 42.08 | A#2 s5 f3 | t+a | +17.9 | -17 | +62 | ok |
| 144* | 42.08 | A#3 s2 f1 | t+a | +14.6 | -17 | - | ok | 145* | 42.17 | D3 s4 f2 | tab | +9.9 | -17 | -37 | ok |
| 146* | 42.17 | F3 s3 f0 | t+a | +11.6 | -17 | +10 | ok | 147* | 42.69 | C4 s1 f0 | t+a | -1.1 | -12 | -31 | ok, re-pluck |
| 148* | 43.10 | C4 s1 f0 | t+a | +17.3 | -6 | -19 | ok | 149* | 43.48 | A#2 s5 f3 | tab | +1.2 | +9 | -126 | ok, re-pluck |
| 150* | 43.76 | C4 s1 f0 | t+a | +0.6 | -17 | +365 | ok, re-pluck | 151* | 44.15 | C4 s1 f0 | t+a | +5.5 | -12 | -30 | ok |
| 152* | 44.57 | F3 s3 f0 | t+a | +10.0 | -12 | -30 | ok | 153* | 44.78 | A#3 s2 f1 | t+a | +15.5 | -6 | -24 | ok |
| 154* | 45.02 | F3 s3 f0 | t+a | +8.6 | -12 | -36 | ok | 155* | 45.19 | A3 s2 f0 | t+a | +3.5 | -12 | +11 | ok |

Pitch: 37 of 46 rise at least 2 dB at the onset with an onset or Basic Pitch note within 50 ms; 6 more are re-plucks of a
ringing string with a pluck within 50 ms; **#95 and #97 fail** (Problems 1 and 2); #190 is a doubt. Video, all 46: no
capo; the hand at frets 1-3 at every onset, holding the tab's shape (bar 8: the D/F# shape, thumb over the neck; bar 12:
the C shape), so the fret region agrees everywhere. Which string a fingertip stops cannot be seen at this camera angle:
the video confirms frets, not strings (it cannot decide Problem 1).

## 5. Beats, downbeats, chords (`c5_*.json`, `c5_offsets.log`)

- Downbeats: 49/49 are the first onset of a tab bar (its bass note); 46/49 have an onset within 50 ms; bars 3.44-4.31 s
  (median 3.654). Beats 1, 3, 4 sit on onsets (within 50 ms: 0.94, 0.92, 0.75); beat 2 is interpolated (0.02).
- madmom DBN (gtr-run r0770): the same grid (4 beats in each truth bar, 45 full bars), but later on every beat: median
  +142, +204, +182, +224 ms on beats 1-4. `gtr-eval beats`: F 0.03 (6/193 matched), downbeat F 0.0.
- Five random chords (seed 20261125: 5.41 s C:maj/3, 23.82 Bb:maj/3, 60.02 Bb:maj/3, 71.26 C:maj/3, 154.59 Bb:maj/3):
  every label tone is among the notes and in the audio's chroma top 4; the notes outside the label are the melody's open
  A3 (6th of C, maj7 of Bb) and C4 / D (9th): the labels fit.

## 6. The record against the files; the video the tools get

- Shown by the files: all counts (628 notes, 481 events, 49 bars, voices, conf 539/89, 193 beats, 49 downbeats, 50 chords
  and the label counts, segment 106 = 90 + 16 notes, 33/8/9), the check-truth counts, Basic Pitch 0.541/0.678/0.602
  (re-run here), guitar-gaps 0.798/0.785/0.791 (in `work/truth-tuning/eval_gaps.log`, not re-run), the form and section
  times, the nut in frame.
- Not shown by the files: (a) "Notes: none found" and "the open 6th string (49 notes) sounds D2": 12 of the 49 sound E2
  (Problem 1); (b) chord notes "in string order 6 to 1": 31 of 49 chords are not (bar 1: s4 at 1.794 s, s5 at 1.846 s);
  (c) beat positions 0.488 / 0.727 in the record, 0.500 / 0.740 in the JSON's `derivation`; (d) librosa gives -13.0 c
  here, not -10.0 (the record's parameters are not stated).
- `tuning.mp4`, six frames at 1/7 to 6/7 of its length (`frames/six.png`) and the 46 crops: no tab, chord name, title or
  caption anywhere; only the player in his room.

## PROBLEMS

1. **Wrong bass note in the 12 D/F#-shape verse bars.** Where: bar position 3 of bars 2, 4, 6, 8, 18, 20, 22, 24, 42, 44,
   46, 48 = notes 19, 45, 71, 97, 227, 253, 279, 305, 539, 565, 591, 617 (6.84, 14.36, 21.67, 29.07, 65.27, 72.75, 80.14,
   87.56, 152.54, 159.79, 167.09, 174.62 s). What: the truth (like the tab) has D2, string 6 fret 0; the recording has E2,
   string 6 fret 2 (the chord's fretted bass, kept). Evidence (`c4_pos3b.json`, `c4_pos3.json`): after these onsets the
   E2 fundamental is 24.7 dB above the D2 fundamental (median of 12) and rises 4.4 dB; at the same position of the 12
   C/E-shape bars D2 is 17.4 dB above E2. Basic Pitch writes E2 near 9 of the 12 (5 within 85 ms) and D2 at none; bar 8
   in `frames/spec_27.png`. The builder's test was fooled by harmonics: D2's 3rd harmonic is A3, the open 2nd string.
   Fix: pitch 40, string 6, fret 2 for these notes; re-time each at the E2 fundamental's rise (4 have no pluck within
   200 ms: if none is found, drop the note as let-ring); add it to the record's "Departures from the tab"; rebuild the side
   files and the segment truth (#97 is in it).
2. **About 55 notes sit where nothing of their pitch is plucked.** Where: `c3_windows.json` "suspects_missed_by_both"
   (index, time, pitch, distances); 29 conf `tab`, 26 conf `tab+audio`; 6 are Problem 1's. In the 30 s segment: #87
   26.48 s F3, #95 28.24 A3, #97 29.07 D2, #141 41.48 G3, #173 49.90 A3, #175 50.72 D2, #188 54.33 F2. What: no onset
   within 50 ms and no Basic Pitch note of the same pitch within 50 ms; 26 of them have their pitch 100-500 ms away and no
   onset within 100 ms. Evidence: #95 (bar 8, position 1, placed by the template): onsets at 27.736, 27.823 and then
   28.630 s, nothing in between; Basic Pitch A3 at 27.85 s; at 28.24 s A3 falls 1.8 dB (`frames/spec_27.png`). #87: no
   onset between 26.041 and 26.732 s (`frames/spec_25.png`). Effect: 8.8 % of the truth (7 of 106 notes, 6.6 %, of the
   segment) can only score as misses, so every tool's recall and precision come out low and the film would blame the
   tool. Fix: re-time each against its pitch's own rise (fundamental, not harmonics shared with the open strings), or
   mark the unconfirmed ones (e.g. `conf: "tab"`) and report scores with and without them; #95 most likely belongs at
   about 27.82-27.85 s.

## Doubts

- Onset convention: my detector is 11.6 ms, Basic Pitch 21 ms earlier than the truth; a +21 ms shift did not raise F1.
- Beats are an inference. madmom lands 0.14-0.22 s after every truth beat; the truth's beats 3 and 4 sit on single-note
  onsets and madmom's do not, so the truth is the better grid, but the film should say "the right tempo and bars, about
  0.2 s late", not "no beat found".
- Chord-note onsets in the rolled chords: 31 of 49 rolls are not in string order; Basic Pitch puts #236's D3 155 ms
  earlier. Treat chord-note onsets as +-0.1 s, as the record says.
- Chord labels are triads; the open A3 of the melody is nearly as strong as the chord tones. Root and majmin scores are
  unaffected; a sevenths score could argue.
- Tuning per string s2 -3.9 c to s6 -18.5 c (median -9). #190 (55.00 s, C4, tab): no rise, no Basic Pitch C4 within 0.5 s.
- `tuning.tab.txt` says one column = one 16th note, but a bar has 32 columns (32nds at 66 bpm). `tuning.video.json`: the
  fingertip strings of its two labelled frames come from the tab, not the picture (the record says so).
