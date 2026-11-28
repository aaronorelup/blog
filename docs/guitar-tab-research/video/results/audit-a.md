# Audit A: steps 1 to 5 and the GPU lane

Agent audit-a, 2026-11-25. Scope: the records `step-01-separation.md`, `step-02-notes.md`, `step-03-voices-taps.md`,
`step-04-chords-beat.md`, `step-05-tuning-capo.md`, `step-gpu.md` and the 124 experiment folders behind them
(`/home/user/gtv/experiments/<S>/<exp>/` for sep-*, n-*, v-*, c-*, t-*, w-07 on capo, tuning, standard, plus the band
clip S4's sep-00/01/03/06). I ran none of the experiments and changed none of their files: every re-score ran on a
sandbox copy with `gtr-eval --no-ledger`, and a size + mtime listing of all 2,972 files in those folders was identical
before and after. Work folder (scripts, outputs, logs): `/home/user/gtv/work/audit-a/` (`PROGRESS.md` lists every step).

## Verdict

Every number re-computed equals the stored one, and every score used the current answer key. Ten problems remain:
two blind runs that were not fully blind, two sets of outputs not on the recording's timeline, and six sentences or
labels in the records that their files do not carry. Details and fixes under PROBLEMS.

## 1. Re-computation (every score.sh, then every number of result.json and of the tables)

- **124 result.json**: 116 have a `score.sh`, 6 are `skipped` with a reason (c-05, t-06 on all songs), 2 ran without
  scoring (tuning v-03, v-04: the tuning truth has no taps). `result.py validate`: all valid, no listed file missing.
- **All 116 score.sh re-run** (236 gtr-eval calls and 37 helper-script calls: breakdown.py, chainB_taps.py,
  nonote_onsets.py, owl_capo.py, post_w07.py without its result.py write; the render lines were left out). Exit 0
  everywhere, no output missing. Every regenerated file equals the stored one (JSON compared value by value apart from
  paths; CSV and text byte by byte, including the `notes.csv` that breakdown.py rebuilds from each MIDI).
  Comparison per folder: `/home/user/gtv/work/audit-a/cmp/<S>_<exp>.json`, summary `cmp/_summary.json`.
- **result.json numbers**: 1,637 found in the re-scored outputs, 171 only in side files that no score.sh writes
  (stem levels, voice_split.json, timings; checked by sampling: 5 stem levels re-measured from the FLAC stems, sep-04
  gain and residual re-computed from `guitar.wav` and the segment: +1.01 dB / -40.37 dB capo, -63.54 dB standard,
  all equal), 10 derived (sep-04 stem-minus-mix F1, v-02 voice counts): all correct by hand.
- **Scores no score.sh produces**, re-run by hand with the same commands: c-06 `repeat2/` chords, key and tempo
  (3 songs), v-03/v-04 tap-kind recalls (8), n-05 guitar-programs-only F1 (3). All equal (`extra/`).
- **Eval ids**: all 243 ids in these result.json exist in the scoring ledger, exited 0, read an estimate inside their
  own folder, and were scored against the current truth (SHA-256 of the whole key, or of its 30 s crop) (`evalids.json`).
- **Segment truths**: a fresh `crop_truth.py` of today's keys (t0 capo 12.76 s, tuning 25.0 s, standard 0.0 s) is
  byte-identical to every crop the steps used (`exp-sep/tr30`, `exp-notes/truth`, `exp-chords/tr30`, `exp-gpu/tr30`).
- **Tables against files** (`bin/tables.py`, every number in a song column checked against the files of that
  experiment and song): step-01 216/217, step-02 576/594, step-03 106/107, step-04 273/273, step-05 143/151,
  step-gpu 90/99. All the rest are explained: text counts ("of 3"), segment eval ids that live in the ledger (all 18
  checked: current crop, same numbers), `taps.txt` line counts, run times and memory from the run ledger (all 9 equal).
  One real difference: P7.

## 2. Five results per step in depth

Picked with `random.Random(20261125)` after the best-scoring technique of each song (`indepth_picks.json`):

| step | results opened |
|---|---|
| 1 | capo/sep-07, tuning/sep-01, standard/sep-07 (best), tuning/sep-07, S4/sep-00 |
| 2 | capo/n-03, tuning/n-02, standard/n-03 (best), standard/n-04, tuning/n-01 |
| 3 | capo/v-01-hint, tuning/v-01-hint, standard/v-01 (best voices), tuning/v-01, capo/v-04 (best taps) |
| 4 | capo/c-02, tuning/c-02, standard/c-04 (best chords), capo/c-02-hint, tuning/c-06 |
| 5 | capo/t-07, tuning/t-01, standard/t-02 (best), standard/t-07, capo/t-05 |
| gpu | capo, tuning, standard sep-04; standard/w-07, tuning/w-07 |

What held:
- **Truth and scope**: as above for every eval id; scopes in result.json match what ran (seg30 runs read the
  segment files and the cropped key; sep-06 is whole-song on S4 and capo, seg30 on tuning and standard).
- **Segments on the timeline**: `notes.seg30.csv` equals `notes.csv` cut to [t0, t0+30) and moved by -t0 (largest
  difference 7e-15 s); sep-04, sep-05, sep-06 `notes.csv` all lie inside [t0, t0+30] of the recording; c-06
  `chords.lab` = `chords.seg30.lab` + 25.0 s on tuning; c-06 renders start at 25.0 s. Exceptions: P3, P4.
- **Canonical outputs**: 61 folders have a `notes.csv` (`timeline.json`). In the 37 whole-song runs (S4 and t-02
  aside) the first three notes sit at most 44 ms from an onset detected in the recording (librosa, `onsets/<S>.json`)
  and at most 59 ms from a truth onset; every whole-song `render.wav` is as long as the recording and its first sound
  is at the first note (capo 0.33 s, standard 0.46-0.48 s, tuning silent until 1.7 s). t-02's notes are a subset of
  n-01's (same times); v-01 voice files use only n-01 onsets and their renders start at the first note. S4's first
  Basic Pitch notes at 0.0 s are invented notes, not a shift (the next ones match at 1-9 ms).
- **Hints**: n-01 has no frequency flags, n-01-hint has 95.1-1244.5 / 71.2-830.6 / 79.9-1046.5 Hz (true tuning + capo);
  v-01 threshold 55 on all songs, v-01-hint 58 / 53 / 55; c-02 is the research's `madmom_run.py` (no truth, meter
  [3,4]), c-02-hint passes the true tempo +-10 % and 4/4; t-02 reads n-01 notes, t-02-hint n-01-hint notes; MiMo
  prompts: the hint sentence is only in the -hint requests. Exception: P1.
- **Blind helpers**: t-07's `look_prompt.txt` is the same for the three songs and names nothing; the first messages
  of the capo and standard sessions (read from their transcripts) are a neutral "blind picture-reading test" plus the
  same task file; capo and standard pictures are crops of the playing area (no tab, no title). t-04's prompt is neutral.
  Exception: P2.
- **Film stretches re-counted** with gtr-eval on cropped windows: sep-00 capo 65-85 s 80/157 (82 truth); n-01 capo
  184-204 s 81/3/83; n-01-hint 60-80 s 81/2/52 (n-01 62 invented); n-02 tuning 52/21/24; n-05 standard 70/6/64; taps
  capo v-03 32 of 32 with 89 onsets, v-04 23 of 32 with 23, standard v-04 4 of 29 with 5, v-03 29 with 66; tuning
  87 and 121 onsets; c-02 capo 12.76-32.76 s 13 bar lines (all 7 true ones hit), c-02-hint 7 of 7; c-06 tuning
  29-49 s majmin 0.17 / 0.488; c-04 tuning 79-99 s 0.493; c-01 tuning 25-45 s 1 of 22 beats, median +0.203 s; w-07
  standard per pose recomputed from `quads.json` and `video.json`: median 17.5 px, worst 32.9, fixed 43.9 / 78.6,
  poses 68 and 72 as stated; tuning drift 95 px at 20 s, 92 at 40 s, 151-172 from 80 s; capo 13-45 px. All equal to
  the records. (sep-07 79/105 and n-03 46/28/17 come from whole-song matching; matching inside the window alone gives
  78 and 45/29/17. Both are valid; the records match their own files.)
- **Other facts checked**: ElevenLabs lag 1,105 samples in all four `lag.json`; t-05's capo box centre at u = 272.7
  against the grid's fret-3 line at 273.3 (0.6 px, as stated); `<S>.mp4` and `<S>.wav` have the same length and
  `av_offset_s` 0, so w-07 overlay times are recording times.

## 3. Sentences

Read in full in all six records. Six say more than, or other than, their files: P5 to P10.

## 4. Public check of `results/`

All 15 files are 21 KB or less. No key, token, signed link, IP address or e-mail. One wording point, outside these steps:
`step-10-hosted.md` names Aaron five times, once about the state of a paid account (its h-08 line); suggest neutral
wording there ("needs a paid top-up"). Nothing else about him.

## PROBLEMS

**P1. MiMo "blind" runs carry the slot name in the attached file name.** t-03 (all 18 requests), and the plain runs of
n-08, c-06 and c-06 `repeat2` on all three songs. Evidence: `<S>/t-03/<capoN|tuningN>/request.json`,
`messages[0].content[0].file.filename` = `capo.seg30.mono.wav` / `tuning.seg30.mono.wav` / `standard.seg30.mono.wav`;
same field in `<S>/n-08/request.json`, `<S>/c-06/request.json`. t-03's prompt says "From the sound alone" and asks
exactly whether there is a capo and what the tuning is. Whether the gateway shows file names to the model is not known;
the answers show no clear use (capo yes on 2 of 3 tries for the capo song and on 2 of 3 for the standard song).
Fix: send the audio as a neutral name (`clip.wav`) and re-run t-03 (6 requests per song, about $0.002), and n-08 /
c-06 if they stay in the film; until then step-05 and the t-03 result.json notes should say so.

**P2. t-07 tuning: the blind session saw the creator's name.** The last tile of `tuning/t-07/pics/sheet_2.jpg`
(about 170 s) is the video's end card with the creator's tab-website name. step-05 says that tile "was not checked".
The answer (`tuning/t-07/look/session_answer.json`) does not use it (0 web searches, tuning guessed standard, wrong).
Fix: rebuild sheet 2 from frames before the end card and re-run the tuning session (about $0.5), or state the
exposure in step-05 and in `tuning/t-07/result.json`.

**P3. n-08 and n-08-hint, capo and tuning: canonical outputs are on the segment's timeline.** `notes.csv` onsets run
0.0-9.3 s (capo n-08), 0.0-15.5 s (tuning n-08); none fall inside the segment's place in the recording (12.76-42.76 s,
25-55 s); `render.wav` is 30.0 s and starts at 0.0 s (`/home/user/gtv/work/audit-a/timeline.json`). result.json
does not say so (step-02 does, in a footnote). Scores are right (scored against the segment key). Fix: as sep-04/05/06
did, keep the segment copy as `notes.seg30.csv`, write `notes.csv` shifted by +t0, re-render `render.wav` on the
recording's timeline, and note it in result.json. (Standard: t0 = 0, nothing to change.)

**P4. sep-04, capo and tuning: `render.wav` and `render.mix.wav` start at t0, not at 0.** 31.8 s long, recording left
and render right (stated in step-gpu.md), while sep-05 and sep-06 segment runs have full-length renders on the
recording's timeline. Fix: add `render.wav` on the recording's timeline (keep these as `render.seg30.wav`) or say
"time 0 = t0" in each result.json. (PRODUCTION.md 6.4 already forbids putting experiment renders in the film.)

**P5. step-02, "For the film", n-03 row: "0.920 / 0.882 on the steel-string songs".** Standard n-03 is 0.892 since the
standard rescore (`standard/n-03/result.json` onset_f1 0.89172; the table above it says 0.892). Fix: 0.882 -> 0.892.

**P6. step-03, v-03 film line: "526 of the 910 onsets fall on a truth note-only event, capo/v-03/chainB.json".** The
file says 535 (note-only 535, tap+note 199, tap-only 59, none 117; my re-run of chainB_taps.py gives the same). Fix:
526 -> 535.

**P7. step-05, tuning offset table, standard t-01 cites eval e2253.** That eval was scored against the old standard
key; `standard/t-01/result.json` holds e2539 (current key, same -3.0 cents). Fix: e2253 -> e2539.

**P8. step-04, header: "for tuning `truth/tuning/tuning.wav` (the songs folder has no `tuning.wav`)".** False:
`songs/tuning/tuning.wav` is the same file (hard link, identical bytes), in place since 02:47 UTC, before c-01 ran
(05:57). No number changes. Fix: drop the parenthesis.

**P9. step-01, film notes on sep-07: "The one technique here that changes a solo song's score".** Table 1 shows
sep-01 +0.011 and sep-02 +0.009 on capo, while sep-07's +0.02 on standard is counted as a change; no run-to-run
spread is measured. Fix: "the technique that moves a solo song's whole-song F1 the most (capo +0.094, standard
+0.02; every other separator moves it by 0.012 or less)".

**P10. step-gpu, sep-04 table, row "notes found, mix / stem 181 / 178".** These are notes written (`n_est`); notes
found (matched) are 92 / 92 on capo (79 / 79 tuning, 120 / 120 standard). step-02 uses "found" for matched truth
notes, so the film could show the wrong count. Fix: rename the row "notes written".

## Minor (no effect on any number; fix when convenient)

- `work/exp-notes/film_stretch.json` still says n-05 standard 120-140 s missed 7; step-02 says 6, and 6 is right
  against today's key (76 truth notes, 70 found). Re-run `film_stretch.py`.
- The same Basic Pitch run on `standard.wav` is F1 0.664 in step-01 (sep-00, scored from the CSV, 580 matched) and
  0.663 in step-02 (n-01, scored from the MIDI, 579: tick rounding moves one onset). The film should use one.
- `capo/sep-07/score.sh` contains `perc_onsets.py <audio> ...`: a placeholder, so that line cannot run as written
  (its scoring half can). Put the real input path.
- step-03 says every folder has `cmd.sh`: v-01 and v-01-hint have `cmd.raw.sh` (+ `cmd.truthnotes.sh`), v-02 has none
  (same run as v-01).
- c-06 `repeat2`, the tap-kind recalls and n-05's guitar-programs scores are not in any score.sh (re-run here by hand,
  all equal). Add their lines.

## Files

`/home/user/gtv/work/audit-a/`: `PROGRESS.md`, `inventory.txt`, `validate.txt`, `cmp/` (re-score comparison),
`evalids.json`, `tables_<step>.json`, `timeline.json`, `onsets/`, `win/` (window re-counts), `extra/` (hand re-scores),
`indepth_picks.json`, `orig_snapshot_before.txt` / `_after.txt`, `bin/` (all scripts).
