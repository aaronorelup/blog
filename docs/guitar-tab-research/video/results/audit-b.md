# Audit B: steps 6 to 10 (string and fret, video, sound + video, tab files and chains, hosted)

Agent `audit-b`, 2026-11-25. A check of the experiments behind `step-06-string-fret.md`, `step-07-video.md`,
`step-08-sound-and-video.md`, `step-09-tabs-and-chains.md` (with its chains) and `step-10-hosted.md`. I ran none of
them. Nothing under `/home/user/gtv/experiments/` or `/home/user/gtv/truth/` was written (0 files newer than the
audit's start). One side effect: the three w-04 score.sh files re-run a neck tracker through `gtr-run`, which added
r1095-r1097 to the run ledger. Scripts and outputs: `/home/user/gtv/work/audit-b/` (`bin/`, files named below).

**Scope.** 180 `result.json` in `/home/user/gtv/experiments/<S>/{f,w,y,o,chain,h}-*` (153 ran, 24 skipped, 3 failed:
capo/h-02, tuning/w-04, tuning/w-05), plus step 9's separator checks capo and standard `n-03-sep07`, tuning `n-02-sep01`.

## 1. Recompute

Each score.sh was re-run in a shadow copy (`rescore/<S>/<exp>/`, `bin/rescore.py`). Its paths point at the copy and
gtr-eval runs with `--no-ledger`. The render lines (`notes2wav.py`, `dedupe.sh`) were left out because they make sound,
not numbers. w-07's `post_w07.py` also rewrites result.json, so a copy that only recomputes `scores.json` ran instead.
`bin/compare.py` compared every output with the saved file, and every result.json score with the outputs.

| check | count | differences |
|---|---|---|
| score.sh re-run | 145, all in scope (142 + 3 separator checks) | all exit 0 |
| in scope without a score.sh | 38: 26 skipped/failed, 12 ran (w-06, y-01, o-02, o-04 on each song) | their record numbers checked against result.json and their own files |
| outputs compared with the saved files | 807: 298 non-JSON (GP5, beats, chords, clicks) and 509 JSON with 581,022 values | non-JSON: 0. JSON: 10 files, listed below |
| result.json score values | 2,713 | see below |
| truth named in score files (sha256) | 375 files | 0 stale: every one is today's answer key of its own song |
| 30-s truths (`exp-hosted/tr30`, `exp-chains/tr30`) | 3 + 3 | 0: byte-identical to a fresh `crop_truth.py` crop of the final keys |

The 10 differing JSON files:
- `f-06/score_frames.json` on all three songs: **PROBLEM 1**.
- capo `w-02/cells_window.json`, `w-03/cells_rtm.json`, `w-03/cells_mediapipe_same_window.json` and
  `w-05/score_cells.json`: the re-run only adds `neck_motion`/`neck_track`, which `score_video_cells.py` gained at 07:29.
  Every count is identical.
- `w-04/track/neck_track.json` on all three songs: only `time_s`, which is run time.

The 2,713 result.json values:
- 2,484 are in the re-run outputs: 1,794 under the same name, 690 by value under another name.
- 175 are in files of the same folder that `cmd.sh` wrote (`tab.gp5.readback.json`, `join.json`, `scores_all.json`,
  `meta.json`, hand summaries) and agree with them.
- 30 are lists or dicts.
- 24 are not in the re-run outputs. 23 of these have a source elsewhere:
  - the 21 counts of `y-02-hint` are in `y-02/<S>.join.json` (written by `y02.py`);
  - capo `w-05`'s fret-error histogram is in its `score_cells.json`;
  - standard `w-04`'s best RMS 4.49 is in `standard/w-05/score_cells.json`.

  The last one is standard `w-05`'s histogram, which is stale: **PROBLEM 2**.

Step-record tables against result.json: every table cell was parsed (`bin/check_step06.py` to `check_step10.py`).

| record | numbers compared | differences |
|---|---|---|
| step-06 | 670 (plus inline: tuning "right string" shares, Guitab 69/24/11 matched by time, 815/626/541 identical tuttut-LilyPond positions) | 0 |
| step-07 | 138 (plus the 206 / 26 fretted tuning notes counted from the truth, neck track 1236/1771) | w-06 70.8 px (**PROBLEM 4**); w-05 histogram: record right, result.json stale (**PROBLEM 2**) |
| step-08 | 228 (plus the four "share of all truth notes" pairs) | 0 |
| step-09 | 433, plus the 30 values of "Which step loses the most" recomputed from unrounded scores | 0 |
| step-10 | 78 (plus order counts 25/32, 20/26, 0/18 and 7, costs summing to USD 0.014716) | 0 |

Film-window counts checked against their files: step-08 y-02 (94 notes / 91 cells / 49 fit). Step-09 `stretch*.json` and
`pindiff_chain-2.json` for o-01, chains 1-6 and the o-03 film window. All are equal. The y-03 counts are equal as well,
but their labels are not supported (**PROBLEM 8**).

## 2. In depth: five per step

Picks: `picks.txt`, Python `random.Random(20261125)`, plus 20261125+9 for a separate chain sample. Each step's picks
are the best-scoring result per song plus two random ones.
- step 6: capo f-01-hint, tuning f-01-hint, standard f-01; capo f-01, tuning f-01-chain-hint.
- step 7: capo w-05, standard w-05, tuning w-01 (w-05 failed on tuning); standard w-03, tuning w-03.
- step 8: capo y-03-tips-hint, tuning y-03-tips-hint, standard y-03-tips; capo y-02, tuning y-03-hint.
- step 9: o-01-c01-32 on all three songs; tuning o-04, capo o-03-span. Chains: capo chain-6, tuning chain-5,
  standard chain-6; tuning chain-6, standard chain-5.
- step 10: capo h-03, tuning h-03-hint, standard h-03-hint; standard h-06, tuning h-08 (both skipped, with reasons).

| question | finding (files: `indepth_step06/08/09.jsonl`, `timeline_all.jsonl`) |
|---|---|
| right truth, right scope | Yes for all 30. Full runs name `<S>.truth.json`; h-03 uses the 30-s truth, scope seg30. |
| segment outputs moved to the timeline | **w-03:** frames shifted by round(t0 x fps): capo +319 at 25 fps = 12.76 s, tuning +750 at 30 fps = 25.0 s, standard 0 at 50 fps. The seg30 WAVs start at t0 to the sample. **h-03:** `notes.csv` = `notes.seg.csv` + t0 for every note; `render.wav` was not moved (**PROBLEM 6**). |
| "-hint" got the hint, plain run none | **f-0x-hint:** `--capo 3` on capo, `--tuning 38,43,48,53,57,60` on tuning; plain runs standard tuning, capo 0. **f-07-hint:** Guitab's capo stepper at 3 (1052 of 1141 frets 3 lower than f-07). **y-03-*-hint:** `--capo-as-tuning 3` or the true tuning. **y02.py:** "hint" = the truth's tuning and capo. **chain-1:** t-02's answer (D#2 / Drop D, capo 0). **chain-2, chain-5:** the f-03 hint tabs. **h-03:** the hint sentence is only in the -hint prompts, but the file name leaks the song (**PROBLEM 5**). |
| canonical output on the recording's timeline | **Truth-note runs:** the first three notes of `notes.csv` are the truth's onsets, which are 3-57 ms from onsets detected in the recording. **Tool-note runs:** within 1-105 ms of a same-pitch truth note and 2-36 ms of a detected onset. `render.wav` starts sounding within 40 ms of the first note. A sweep of all 113 `notes.csv` and their `render.wav` in scope: only f-07 and f-07-hint (**PROBLEM 7**) and the h-03 renders (**PROBLEM 6**) are off. chain-4 puts h-03's notes on h-03's own beat grid, as step 9 says. |
| a result marked "ran" has its output | Yes for all 153 ran results: every listed file exists and is not empty. Every skip or failure states why. |
| blind helpers | No helper agent in steps 6-10 (records and folders). The one model call is h-03 (MiMo): its prompt and schema name no song and give no truth, but the file name does (**PROBLEM 5**). chain-3 relies on t-07 (step 5), whose request names its pictures `sheet_1.jpg` and `neck_*.jpg`. |

## 3. Sentences that say more than the numbers

Problems 3, 5, 8 and 9 below. The following claims were checked and their numbers support them:
- step-06: the hint deltas; scorify's window counts (`raw/<S>.windows.json`).
- step-07: "178 frames with no hand" (`hand_loss.json`); "capo grid +1" (3 of 3 labelled tips, and y-02's fret-1 count
  232 vs 86).
- step-08: all four observations.
- step-09: the loss reading; "11.7-13.7 % clipped" (`clicks.log`); +7.7 / +17.6 / +58.5 ms (`first_onset_<S>.log`);
  "49.1 ms median" (`film_window.json`: signed median over all 288 clicks; result.json's 37.5 ms is the median over
  the 217 clicks within 70 ms).
- step-10: the cost sums; the note that the hint runs' "right" capo and strings were given.

## 4. Public safety of `results/`

15 files (with `audit-a.md`). The largest is 20.9 KB. The scan found:
- no key-like strings, IP addresses or e-mail addresses;
- one URL, a public API endpoint (fretwise.ai);
- 0 hits from the blog's own never-publish matcher (`scripts/check/never-publish.mjs` `keys()` + hash, run by
  `bin/np_scan.mjs`; its self-test finds 3 of 3 private terms);
- mentions of Aaron that are research-task references only (T06, T18, T55, FOR_AARON). step-10 also states that the
  Gemini key's prepaid balance was 0. That is an account detail, already in `EXPERIMENTS.md`.

Nothing must come out.

## PROBLEMS

1. **f-06 (capo, tuning, standard): score.sh does not reproduce `score_frames.json`.**
   - What is wrong: its `gtr-eval tab-frames` line lacks `--est-tuning 40,45,50,55,59,64 --est-capo 0`, which the
     saved file used (step-06 says so).
   - Evidence: as saved, the line gives frame pitch F1 0.045 on capo (saved 0.608) and 0.039 on tuning (saved 0.494).
     On standard only the options differ. With the two flags all three reproduce exactly
     (`rescore/<S>/f-06/score_frames.json` vs `score_frames_withflags.json`).
   - Fix: add the flags to the three score.sh files.
2. **standard/w-05: result.json `labelled_fret_error_hist` is stale.**
   - What is wrong: it reads `{"1": 3, "2": 5, "3": 3}` (11 tips), but `labelled_with_cell` is 12.
   - Evidence: `score_cells.json` (08:02) and the re-run give `{"1": 3, "2": 6, "3": 3}`, which step-07 prints.
   - Fix: copy the value from `score_cells.json` `labelled_frames.fret_error_hist` into result.json.
3. **step-07 says w-07 was not run, but it ran on all three songs.**
   - What is wrong: the table row "w-07 CoTracker3 (RunPod) | B | not run: no pod in this job" and the bullet
     "RunPod only ... Not run".
   - Evidence: `<S>/w-07/result.json` say `ran` (box CPU fallback, 06:32-06:45; tracked-quad error median 28.0 /
     142.8 / 17.5 px), and `step-gpu.md` reports it.
   - Fix: point both lines at `step-gpu.md`.
4. **step-07, w-06 table, standard: "worst corner vs the hand-set quad 70.8 px" should be 70.7.**
   - Evidence: `standard/w-06/sam_quad_standard_f0450.json` `corner_dist_to_hand_quad_px` max 70.7, and result.json
     says 70.7. The 70.8 is the distance to the truth's neck track.
   - Fix: 70.7.
5. **h-03 and h-03-hint (all three songs, so also chain-4): the model was sent the song's slot name.**
   - What is wrong: `request.json` `/messages[0]/content[0]/file/filename` is `capo.seg30.mono.wav`,
     `tuning.seg30.mono.wav` or `standard.seg30.mono.wav`. The no-hint runs were therefore told the answer category.
     step-10's "Only the segments' sound left the box" is not exact.
   - Evidence: in all three no-hint runs the model still answered wrong (capo 0, standard tuning with capo 3, capo 2),
     so no score is inflated.
   - Fix: re-send with a neutral name such as `clip.wav` (about USD 0.004 per run), or state the leak in step-10 and
     chain-4. Stage 4's blind test must not pass slot-named files either.
6. **h-03 and h-03-hint on capo and tuning: `render.wav` and `render_mix.wav` are in segment time.**
   - What is wrong: both are 30.0 s files that start at the segment's 0 s (recording 12.76 s and 25.0 s), while
     `notes.csv` and `chords.lab` are on the recording's timeline. result.json notes name only the notes and chords.
   - Evidence: `soxi`, and `timeline_all.jsonl` (sound 1 s before the first note's window).
   - Fix: pad t0 s of silence, or say "segment time" in result.json and step-10. PRODUCTION.md 2.7 re-renders from
     notes, so the film itself is not affected.
7. **f-07 and f-07-hint (capo, tuning, standard): `notes.csv` and `render.wav` are on Guitab's own GP5 time, and
   result.json does not say so.**
   - Evidence: capo's first note is at 0.000 s against the truth's 0.345 s. The median gap of the first 20 notes to a
     same-pitch truth note is 0.29 / 1.28 / 0.99 s. step-06 discloses this; result.json and its notes do not.
   - Fix: add "timeline: Guitab GP5 time, not the recording" to each f-07* result.json, so that no builder lays it
     against the recording.
8. **step-08 "For the film": the y-03 stretches do not show what their labels say.**
   - What is wrong: "where the video helps" (capo 142-162 s, no hint) has 33 wrong->right against 32 right->wrong.
     "Where the video hurts" (capo 29-49 s, with the hint) has 22 against 21, a net gain.
   - Evidence (`capo/y-03/diff.json`, `capo/y-03-hint/diff.json`): the most helpful 20 s without the hint is 172-192 s
     (60 against 21). The most harmful with the hint is 142-162 s (5 against 32).
   - Fix: use those windows, or relabel.
9. **step-09 "The plan's command keeps every note, string and fret (matched by order: 1.000 / 0.981 / 1.000)".**
   - What is wrong: on tuning all 628 notes are written, but only 616 match by note order (`tuning/o-01/score_tab_order.json`).
   - Fix: "every note on capo and standard; 616 of 628 by order on tuning".

## Notes (not problems)

- Pinned y-03 runs lose 1-5 notes in LilyPond (for example standard y-03-tips-chain writes 729 against the base's 734;
  `n_est` vs `base_n_est`). The scores of matched notes ignore them, and the shares of all truth notes count them as
  wrong. step-08 does not mention it.
- standard w-03 has `frames` 1502 in result.json, while its hand-loss window counts 1500. step-07 cites the window,
  and 0 frames are lost either way.
- capo w-02, w-03 and w-05 were scored before `score_video_cells.py` gained neck-motion compensation. The current
  script gives the same numbers.
- step-gpu.md's own w-07 numbers were not checked here.
- Nothing this audit tried was refused by the permission system.
