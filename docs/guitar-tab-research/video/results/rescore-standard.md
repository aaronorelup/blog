# Rescore of the standard slot against the repaired answer key

Agent rescore-standard, 2026-11-25. Work folder `/home/user/gtv/work/rescore-standard/` (`PROGRESS.md`, `list.txt`,
`map/<exp>.json` = every score old and new with the file and JSON path it comes from, `backup/<exp>/` = each
experiment's score files before the rescore, `logs/`). No tool was run again: only `score.sh` (and the scoring
scripts named below).

**When the key changed** (file times, UTC, and `truth-standard.md`): round 2 installed at 06:13 (676 -> 680 notes,
76 poses in `standard.video.json`); round 3 at 06:55:28 (`standard.truth.json` and side files, 679 notes, 16 slaps
re-timed) and 07:29:13 (`standard.video.json` gains `neck_track_note`, `standard.neck_track.json` gains the per-frame
outline, `tools/bin/score_video_cells.py` uses it). Rule applied: a result older than the files its `score.sh` reads.

**Derived answer keys also stale**: the 30 s crops `work/exp-hosted/tr30`, `exp-chords/tr30`, `exp-gpu/tr30` and
`exp-notes/truth` `standard.seg30.truth.json` were made from the 676-note key (re-cropping that key with
`crop_truth.py` reproduces them exactly). Replaced by a crop of the current key, identical to the one `exp-sep` already
used (SHA-256 `88e6ed6d...`; bar 3's C3 at 6.886 s out, a note at 29.338 s in, still 125 notes). Old copies:
`seg30/old676_copies/`.

## Rescored: 30 experiments, `score.sh` run unchanged, `result.json` rewritten with `result.py --force`

Old scores are kept in each `result.json` `notes` as "before rescore: {...}". Main score shown; all in `map/<exp>.json`.

| exp | main score, old -> new | scores changed | new eval ids |
|---|---|---|---|
| n-01 | onset F1 0.656 -> 0.663 (found 572 -> 579 of 676 -> 679) | 16 of 17 | e2529 |
| n-01-hint | onset F1 0.657 -> 0.664 | 16 of 17 | e2530 |
| n-02 | onset F1 0.869 -> 0.879 (invented 78 -> 70) | 16 of 17 | e2531 |
| n-03 | onset F1 0.882 -> **0.892** (missed 54 -> 49) | 16 of 17 | e2532 |
| n-04 | onset F1 0.865 -> 0.866 (was scored on the 680-note key) | 10 of 17 | e2533 |
| n-05 | onset F1 0.768 -> 0.774 | 16 of 17 | e2534 |
| n-08 | segment onset F1 0.042 = 0.042; high-range F1 0.0417 -> 0.0415 | 2 of 17 | e2535 |
| sep-04 | segment F1 stem 0.737 -> 0.743, mix 0.735 -> 0.741; stem minus mix +0.0023 (recomputed by hand: it is a difference, not in a score file) | 13 of 27 | e2537, e2538 |
| w-05 | exact 9 -> 16, within one fret 81 -> 100 of 547 -> 546 (0.0165 -> 0.0293, 0.1481 -> 0.1832) | 9 of 14 | - |
| c-01, c-02, c-02-hint, c-03, c-04, c-06, c-06-hint | unchanged (beats, chords, key, tempo did not change) | 0 | e2492-e2512 |
| h-03, h-03-hint | unchanged (1 note matched of 125 either way) | 0 | e2515-e2528 |
| n-08-hint | unchanged (0 found) | 0 | e2536 |
| t-01, t-02, t-02-hint, t-03, t-04, t-05, t-07, t-08 | unchanged (tuning and capo did not change) | 0 | e2539-e2551 |
| w-01, w-02, w-03 | unchanged (hand loss with 76 poses = with 3; w-02's stretch notes are the same 81) | 0 | - |

Also re-scored, as the step records quote them: the six `n-0x/seg30/score.sh` (segment F1 n-01 0.738 -> 0.745,
n-01-hint 0.741 -> 0.747, n-02 0.984 -> 0.992, n-03 0.980 -> 0.988, n-04 0.968 -> 0.976, n-05 0.916 -> 0.924;
e2552-e2557), n-05 guitar programs only (ledger e2044's arguments: 0.774 -> 0.780, e2558), `taps_invented.py
standard n-01 ... n-05` (invented notes within 50 ms of a slap or thump: n-02 51 of 78 -> 61 of 70, n-03 72 of 112 -> 82
of 104, n-05 179 of 285 -> 199 of 279, n-04 16 -> 17, n-01 156 = 156), and `collect.py` for the step-2 tables and
`step-02-notes-windows.csv`. The n-0x `score.sh` also re-render `render.wav` from the tool's unchanged `notes.csv`.

**Biggest change**: w-05 within one fret +0.035 (81 -> 100 notes), almost all from the scorer's per-frame neck
outline (the round-3 test on the same key with the old scorer gave 9 / 81). Among the note scores: n-02 and n-03
whole-song onset F1 +0.010, segment F1 +0.008 for most tools.

## Not rescored, and why

- **w-04**: line 1 of its `score.sh` runs the neck tracker (a tool); its scores summarise the tracker output and read
  no answer key. **w-07**: scored inside the CoTracker run at 06:31, after round 2's poses; round 3 left the poses
  as they were (`standard.video.json` equal except the new `neck_track_note`), so its scores stand.
- **w-02's cells score** (0 exact, 14 within one fret of 67) was rescored but is still **not motion-compensated**:
  its `score.sh` passes `w-02/truth_window.json`, so the scorer does not find `standard.neck_track.json` next to it
  (`neck_motion: lookups_not_compensated 69`). Changing the script was outside this job.
- No `score.sh` (nothing to rerun): c-05, f-07-hint, h-01, h-02, h-04 to h-08, t-06 (skipped); w-06 (its neck-track
  keys are unchanged); y-01 (no answer key).
- Already current (scored after 06:55, or after 07:29 when they use the video): sep-00 to sep-07 except sep-04
  (rescored by exp-sep at 07:00), every f-* and y-* run, v-01 to v-04.

## Step records corrected

`step-02-notes.md` (8 tables, the taps table, the film table, the truth-notes paragraph, the guitar-programs
sentence), `step-02-notes-windows.csv` (43 standard rows), `step-gpu.md` (sep-04 tables), `step-01-separation.md`
(sep-04 sentence), `step-07-video.md` (table 3 and its notes), `step-06-string-fret.md` and
`step-08-sound-and-video.md` (the quoted standard n-03 F1). Each changed table has a "Standard rescored ..." line.
Steps 3, 4, 5 and 10 quote no standard number that changed.

## Did a ranking or conclusion change? No

- Step 2, whole song on standard: n-03 > n-02 > n-04 > n-05 > n-01-hint > n-01 before and after; segment: n-02 >
  n-03 > n-04 > n-05 > n-01-hint > n-01 before and after. n-03 stays the best standard input for the f- and y-chains.
- Step 2, slaps: the share of invented notes that sit on a slap or thump grows (n-02 65 % -> 87 %, n-05 63 % -> 71 %)
  because 16 slaps moved to their attacks: the conclusion that invented notes are mostly slaps gets stronger.
- sep-04: the stem still adds about +0.002 F1 on standard, nothing worth a separation pass.
- Step 7: standard fingertip cells improve but stay far below capo (exact 0.029 vs 0.088, within one 0.183 vs 0.399).
