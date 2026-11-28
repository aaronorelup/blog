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

## Second check (after the repairs)

Checked 2026-11-25 by truth-recheck-tuning, after the repairs, with its own scripts: `/home/user/gtv/work/truth-recheck-tuning/`
(`PROGRESS.md`, `logs/`, `frames/`). Own runs: Basic Pitch 0.4 (gtr-run r0776, 65-1400 Hz), guitar-fl.pth (r0777, a model
neither the builder nor the repair used), Beat This! final0 (r0778). Distances in ms below have each method's median lead over
the truth removed (detector 31.9, Basic Pitch 21.0, guitar-fl 29.6). No truth file changed.

**Verdict: passed, no problem left.** Problem 1 is fixed. Problem 2 is fixed as far as the recording can show: 18 notes are
still unconfirmed, but they are marked `tab` and 4 of them show counter-evidence. The repair misplaced one note (#498) and
moved one unconfirmed note away from both models (#397). Neither changes any score: see Doubts.

### S1. Schema, times, side files (`c1_check.py`, `logs/c1_*.log`): pass

- `gtr-eval check-truth`: 6411 checks, 0 mismatches (SHA-256 `0075867d551a...`, as the record says). Segment: 1109 checks, 0
  mismatches (`4747d3b03228...`). Every schema and source key is present. 628 notes (481 events, 49 bars; melody 384, chord
  147, bass 97; conf 556 `tab+audio` / 72 `tab`). Onsets 1.678-177.464 s, offsets up to 182.497 s, WAV 187.37068 s.
  0 notes of zero length (shortest 0.186 s), 0 same-pitch or same-string pairs within 30 ms, 0 overlaps on one string
  (shortest gap 0.221 s), 0 of 628 break pitch = tuning + capo + fret. Frets 0-5. Only the last chord's `end` (187.3707,
  rounded) is 20 us past the last sample.
- Side files against the JSON: `notes.csv` 0 of 628 differ. `beats.txt`: 193 rows within 0.05 ms, its 49 beat-1 rows are the
  downbeats. `chords.lab`: 0 of 50 differ. `.mid`: onsets within 2.1 ms, pitches equal, 16 offsets differ (up to 2.17 s: one
  pitch on two strings in one channel, as recorded). `.gp5` (49 measures, tuning 60 57 53 48 43 38), `.tab.txt` and
  `quantized.json`: each bar's (string, fret) multiset equals the JSON's. `seg30.truth.json` equals my own crop at 25.0 s
  (106 = 92 + 14 notes, 33 beats, 8 downbeats, 9 chords). `seg30.wav` = `tuning.wav` from 25.0 s, sample for sample.

### S2. Tuning and capo (`c2_tuning.py`, `frames/nut_95_1to1.png`): pass

- Open strings, 0.05-0.5 s after each fret-0 onset: the claimed pitch is louder than the standard-tuning pitch for s6 37/37
  notes (D2 over E2, median +18.2 dB), s5 30/30 (+23.0), s4 15/15 (+18.1), s3 70/82 (+11.7), s2 142/144 (+32.1) and s1
  106/114 (C4 over E4, +23.2). Long-term spectrum 2-176 s, level above the 40-60 Hz floor: C#2 +11.1, **D2 +30.0**, E2 +34.3.
  D2 is the lowest pitch that sounds, which standard tuning cannot reach. **D G C F A C confirmed.**
- Frame at 95.0 s, 1:1 crop: the nut and the slotted headstock are in view, there is no capo and the hand is at frets 1-3. The
  same holds in the 46 crops of S4 and in `nut_compare.png` (33, 50, 125.5 and 170 s). **No capo.**
- Cents: parabolic fundamental peaks of 414 single notes from G2 up give a median of **-8.1 c** (IQR -12.7 to -1.9). The
  truth's -9 agrees.

### S3. Timing (`c3_onsets.py`, `c3_models.py`, `c3_consensus.py`, `logs/c3_*.log`): pass

- Onset detector (my own SuperFlux-like method: log filterbank, lag 2, 747 onsets): **591 of 628 truth onsets (0.941) have an
  onset within 50 ms**, against 0.30-0.58 when the truth is shifted by +-0.25 or +-0.5 s. The detector is a median 31.9 ms
  earlier; with that removed, 602 (0.959). By conf: `tab+audio` 0.969, `tab` 0.722. Per 10 s from 0 s (raw):
  .94 1.0 1.0 .97 .95 .79 .97 .92 .95 .91 .84 .92 .92 .94 .97 1.0 .97 1.0. With the lead removed the lowest is .865 (100-110 s).
- Models, `gtr-eval notes`: Basic Pitch e1965 onset **P .562 R .705 F1 .626** (the record's numbers exactly); guitar-fl e1966
  **P .848 R .753 F1 .798**. Shifting either model by +10, +20 or +30 ms changes F1 by less than 0.03 (best +10 ms: .629 and
  .803), so the truth's later onset convention costs the tools nothing. Per 10 s F1 (one matching over the whole piece,
  split by onset time): Basic Pitch .69 .70 .68 .68 .68 .58 .59 .75 .65 .57 .61 .51 .63 .59 .60 .65 .60 .60; guitar-fl .87
  .84 .83 .77 .77 .76 .84 .79 .91 .76 .81 .60 .77 .81 .73 .85 .78 .90.
- No stretch drops for both measures at once. The lowest model window is 110-120 s for both models, but there the
  detector gives .917 (.972 with the lead removed), and the pitch of 94 % of the notes stands at least 3 dB above both
  neighbouring semitones (0.89-0.97 in every window). That window is hard for the models; it is not misaligned.
  **Only 7 notes have no method within 50 ms**: #173, 209, 264, 500 (unconfirmed `tab`), 386, 435 and 572 (Doubts).

### S4. Twenty random notes (seed 20261126) and every note of bars 8 and 14 (`c4_spec.py`, `c4_table.md`)

rise = level change of the note's fundamental / median of harmonics 1-4, after against before the onset (window 0.15-0.5 s
by pitch, at -9 c). onset / BP / g-fl = ms, with each method's lead removed (`-` = none within 0.5 s). `*` = bar 8 or 14.
Verdicts: ok = the pitch rises and something lands within 50 ms; re-pluck = no rise, but a model writes the pitch within
50 ms; onset only = an onset within 50 ms with no evidence of the pitch.

| # | t s | note | conf | rise dB f0/h | onset | BP | g-fl | verdict | # | t s | note | conf | rise dB f0/h | onset | BP | g-fl | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 14 | 5.47 | G2 s5 f0 | t+a | +16.1/+12.8 | +32 | +18 | - | ok | 43 | 13.52 | A3 s2 f0 | tab | -6.2/-0.3 | -7 | +408 | +403 | onset only |
| 105 | 31.33 | D3 s4 f2 | t+a | +25.3/+14.9 | -3 | +0 | -2 | ok | 131 | 38.37 | G3 s3 f2 | t+a | +25.3/+15.5 | +35 | +34 | +203 | ok |
| 141 | 41.48 | G3 s3 f2 | tab | +1.5/-5.3 | +39 | -446 | -462 | onset only | 196 | 56.59 | E3 s4 f4 | t+a | +23.3/+18.8 | +0 | - | +5 | ok |
| 229 | 65.96 | C4 s1 f0 | t+a | +19.0/+15.2 | +0 | -6 | -1 | ok | 237 | 67.73 | F3 s3 f0 | t+a | +27.8/+11.9 | +35 | +12 | +26 | ok |
| 271 | 78.06 | F3 s3 f0 | t+a | +16.2/+12.3 | -6 | -16 | -8 | ok | 285 | 81.90 | A3 s2 f0 | t+a | +2.8/+2.3 | -3 | -13 | -3 | ok, re-pluck |
| 298 | 85.63 | A3 s2 f0 | t+a | +6.7/+9.8 | +0 | +1 | -4 | ok | 300 | 86.11 | G2 s5 f0 | t+a | +18.6/+13.2 | +32 | +7 | - | ok |
| 304 | 87.11 | A3 s2 f0 | t+a | +27.5/+23.8 | +0 | +7 | +0 | ok | 306 | 87.83 | C4 s1 f0 | t+a | +4.8/+8.4 | +0 | +426 | +0 | ok |
| 355 | 101.26 | C4 s1 f0 | t+a | -3.2/-1.1 | -6 | -89 | -63 | onset only | 364 | 104.23 | G2 s5 f0 | t+a | +13.7/+13.6 | +29 | +1 | +20 | ok |
| 410 | 116.75 | C4 s1 f0 | t+a | +2.2/-8.6 | -6 | +84 | +13 | ok, re-pluck | 441 | 125.52 | A3 s2 f0 | tab | +2.4/-4.3 | -8 | +79 | -1 | ok, re-pluck |
| 531 | 150.52 | F3 s3 f0 | t+a | +11.7/+4.4 | -9 | -16 | -12 | ok | 547 | 154.76 | A#2 s5 f3 | t+a | +20.8/+13.5 | -3 | -8 | +1 | ok |
| 91* | 27.52 | E2 s6 f2 | t+a | +30.3/+29.0 | +29 | +20 | +21 | ok | 92* | 27.68 | G2 s5 f0 | t+a | +15.8/+16.4 | -6 | -9 | -5 | ok |
| 93* | 27.68 | G3 s3 f2 | t+a | +21.3/+18.9 | -6 | +154 | +146 | ok | 94* | 27.73 | C3 s4 f0 | t+a | +14.1/+11.0 | +18 | +109 | +36 | ok |
| 95* | 27.83 | A3 s2 f0 | t+a | +7.3/+2.6 | -3 | +39 | - | ok | 96* | 28.64 | A3 s2 f0 | t+a | +31.3/+26.9 | +0 | -8 | -2 | ok |
| 97* | 29.04 | E2 s6 f2 | t+a | +5.1/+6.0 | -6 | +50 | -13 | ok | 98* | 29.30 | C4 s1 f0 | t+a | +13.1/+19.0 | -3 | +428 | -2 | ok |
| 99* | 29.73 | C4 s1 f0 | t+a | +19.7/+17.6 | -3 | -2 | -2 | ok | 100* | 30.19 | G3 s3 f2 | t+a | +8.8/+5.9 | -9 | +435 | -15 | ok |
| 101* | 30.42 | A3 s2 f0 | t+a | +17.9/+8.7 | +3 | +0 | +1 | ok | 102* | 30.63 | G3 s3 f2 | t+a | +13.3/+14.7 | -6 | -12 | -8 | ok |
| 103* | 30.85 | A3 s2 f0 | t+a | +8.6/+6.2 | +0 | +0 | +0 | ok | 169* | 49.15 | D2 s6 f0 | t+a | +21.2/+12.2 | +41 | +46 | +35 | ok |
| 170* | 49.20 | D3 s4 f2 | t+a | +37.7/+9.4 | -6 | +139 | - | ok | 171* | 49.27 | A2 s5 f2 | t+a | +23.8/+8.3 | +35 | +34 | +34 | ok |
| 172* | 49.48 | F3 s3 f0 | t+a | +18.9/+11.6 | -99 | +0 | -3 | ok | 173* | 49.90 | A3 s2 f0 | tab | -5.5/-3.4 | -94 | +368 | +376 | **FAIL** |
| 174* | 50.27 | A3 s2 f0 | t+a | +17.3/+15.8 | +0 | -5 | +3 | ok | 175* | 50.72 | D2 s6 f0 | tab | +1.0/+0.7 | -19 | - | - | onset only |
| 176* | 50.94 | C4 s1 f0 | t+a | +2.4/+16.8 | -6 | +1 | -4 | ok | 177* | 51.38 | C4 s1 f0 | t+a | +17.6/+18.5 | +3 | +1 | +5 | ok |
| 178* | 51.80 | F3 s3 f0 | t+a | +23.7/+19.6 | -6 | -15 | -8 | ok | 179* | 52.05 | A3 s2 f0 | t+a | +6.3/+1.3 | +0 | -15 | -9 | ok |
| 180* | 52.26 | F3 s3 f0 | t+a | +9.6/+2.6 | -6 | -9 | +3 | ok | 181* | 52.47 | A3 s2 f0 | tab | -1.4/+0.6 | -8 | -11 | -12 | ok, re-pluck |

The 46 notes: 37 ok, 4 re-pluck, 4 onset only (#43, #141, #175 `tab`; #355, which both models place 63-89 ms earlier), 1
FAIL (#173 `tab`: A3 falls 5.5 dB, and the nearest onset is 94 ms away). The two repaired notes of bar 8 hold up: #95 (A3 at
27.83 s, +7.3 dB) and #97 (E2 at 29.04 s, +5.1 dB, guitar-fl within 13 ms). Video (`frames/sheet_*.png`, 1:1 crops of
frets 0-4): no capo in any crop and the hand at frets 1-3 throughout. In bar 8 the thumb comes over the neck at fret 2 for
the whole bar, so string 6 fret 2 (E2) is held, as the repaired #97 says. A fingertip's string cannot be resolved at this
camera angle. In bar 14 (49.15-50.72 s) the neck sits about 75 px lower in the frame.

### S5. Beats, downbeats, chords (`c5_check.py`, `logs/c5_check.log`, gtr-eval e1967)

- Truth beats on a detector onset within 50 ms: beat 1 45/49, beat 3 48/48, beat 4 46/48, beat 2 0/48 (interpolated by
  design). The 9 beats the repair changed: the beats 3 and 4 now sit on onsets (-6 to +6 ms; before 54-174 ms away), and the
  beats 2 stay interpolated.
- Beat This!: 211 beats at 68.2 bpm (truth 65.73). It is later than the truth on every beat: median +142, +198, +191 and +214
  ms on beats 1-4. `gtr-eval beats`: F 0.050. Its downbeats are a median +142 ms from the truth's (46 of 49 within 0.2 s),
  with 4 to 6 of its beats in each truth bar. Its beats sit on onsets as often as the truth's (0.725 against 0.720), but the
  truth's beats 1, 3 and 4 alone score 0.96. This is the same finding as madmom in the first check.
- Downbeats: 49/49 are the first onset of their tab bar, but not always its bass (see Doubts). All 5 random chords (5.41
  C:maj/3, 12.82 C:maj/3, 38.34 G:min, 89.64 G:min, 151.07 C:maj/3 s) have every label tone among their notes, with 3/3,
  2/3, 2/3, 3/3 and 3/3 of the tones in the audio chroma's top 4. The extra notes are the melody's open A3 and C4: the
  labels fit.

### S6. The repairs, the record and the video the tools get (`c4_analyze.py`, `c4_moves.py`, `logs/c4_*.log`)

- **Problem 1 fixed.** 0.02-0.47 s after each of the 12 new onsets, E2 is +19.9 to +38.8 dB above D2. guitar-fl writes an E2
  within 16 ms of all 12, and my detector has an onset within 12 ms of 11 of them (#305: none, but guitar-fl is within 10 ms).
  The bar 8 video agrees (S4).
- **Problem 2 fixed.** 29 of the 33 moved notes have a model note of their pitch within 20 ms at the new time (2 at the old);
  of the 51 repaired rows not `tab`, 47 are ok or re-pluck; the 18 unconfirmed: 1 ok, 2 re-pluck, 11 onset only, 4 FAIL.
- What the record claims and the files show: every count (notes, events, bars, voices, conf, beats, downbeats, chords and
  labels, segment 106 = 92 + 14 / 33 / 8 / 9), the check-truth counts, the SHA-256s, Basic Pitch .562/.705/.626, 33 moved
  (19 later, 14 earlier), 12 re-pitched, the 9 beat changes, 37 open-6th notes on D2, 69 CSV rows (all match the JSON).
  guitar-gaps .837/.823/.830 was not re-run (guitar-fl ran instead). What the files do not show: (a) "never before the bass" and
  "beat 1 = onset of the chord's lowest note": in bars 15, 31, 35 and 37 a chord note comes 64-70 ms before the bass and
  carries the downbeat (as before the repair, `orig/tuning.notes.csv`). (b) "The guitar moves by about 10-30 px": the nut is
  about 100 px lower at 50 s and 125.5 s than the quad (`frames/nut_compare.png`). Nothing scores against the quad
  (`score_video_cells.py` does not read it). (c) The record says 45 and 46 bars for the 0.488 / 0.727 positions; the JSON
  says 46 and 47.
- `tuning.mp4`, six frames at 1/7 to 6/7 (`frames/six.png`) and the 46 crops: no tab, chord name, title or caption; only the
  player in his room.

### PROBLEMS (second check): none

### Doubts (second check)

- **#498 (140.487 s, melody C4 on s1, bar 39), misplaced by the repair.** It was moved 469 ms into the chord roll, 82 ms after
  the chord's own C4 (#497, s2 f3). It now comes 0.168 s after the downbeat, where bars 15 and 31 (same pattern) put this
  note at 0.750 and 0.722 s. Its evidence at 140.487 is the roll's one C4 attack (both models put it at 140.536). There is a
  weak onset at the old time, 140.954 s (strength 0.14), with no C4 rise. Scores do not change (one truth C4 there stays
  unmatched either way). Fix: put it back at about 140.95 s as `tab`, and move #497 toward the C4 attack.
- **#397 (113.192 s, C4, `tab`).** Rule A moved it 38 ms later, so both models' C4 (113.09 s) is now 75 ms early instead of 38.
  Fix: put it back at 113.154 s or leave it unconfirmed. #355 (101.262 s, C4, `tab+audio`): both models are 63-89 ms
  earlier, and the C4 band rises at 101.17 s. #572 (161.930 s, D2): all three methods are 58-73 ms later. #386 (110.405 s,
  F3, kept as heard): both models and an onset put the F3 at 110.83 s, and the nearest onset to 110.405 s is 145 ms away.
  #435 (123.745 s, D2): no onset within 96 ms. All are single notes, none in the 30 s segment.
- **The unconfirmed `tab` notes** are left in the truth. #173 (49.90 s, in the segment), #209, #264 and #500 show their pitch
  falling 5.5-11.7 dB, with the nearest onset 67-214 ms away and no model note within 0.24 s. They are probably not played there. The
  film's scores should be given without the `tab` notes, or both ways, as the record does. #173 is not played in a tab shown
  over the segment.
- **Beats are an inference.** Beat 2 sits on no onset in 48/48 bars, while the nearest event, the first single note, comes at
  about 0.21 of the bar, about 0.15 s earlier. Two trackers land 0.14-0.21 s after every truth beat. The film should report
  the right tempo and bars with an offset, not "no beat found".
- Onset convention 21-32 ms later than all three methods (no cost, S3); 16 `.mid` offsets; last chord end 20 us past the WAV.
