# Step 6. String and fret (f-*), on the three recordings

Agent exp-strfret, 2026-11-25. Every number is copied from `/home/user/gtv/experiments/<S>/<exp>/result.json`, whose
scores are gtr-eval 0.12.1 `tab` output (`score_tab.json`; eval ids in the first table). Scripts:
`/home/user/gtv/work/exp-strfret/bin/` (`notes2mid.py`, `run_one.sh`, `scorify_windows.py`, `run_tabcnn.sh`,
`guitab.cjs`, `run_guitab.sh`, `gp5json.py`, `post.py`, `tables.py`, `film_stretch.py`). Truth: the whole of each song
(scored_range = the whole file in all three, so nothing was cropped). Matching: onsets within 50 ms and the same pitch,
unless stated.

**Runs.** A: f-01 tuttut 0.0.7, f-02 scorify 0.4.0, f-03 LilyPond 2.24.3, f-06 TabCNN (Zenodo 11406378), f-07 Guitab
1.2.0 browser version. B: f-04 tabsynth 1.0.6. C not run (f-05, f-08, f-09, f-10). All on whole songs, through gtr-run
(lane `film-strfret`, 2 cores).

| exp id | input | hint |
|---|---|---|
| f-0x | the truth's notes (onset, offset, pitch), strings and frets removed: the assigner alone | none: standard tuning E2 A2 D3 G3 B3 E4, capo 0 |
| f-0x-hint | the same | the truth's tuning and capo (capo 3 / D2 G2 C3 F3 A3 C4 / standard, capo 0) |
| f-0x-chain | the best step-2 notes by onset F1 (`step-02-notes.md`): capo n-03 guitar-fl (0.920), tuning n-02 guitar-gaps (0.830), standard n-03 (0.892; 0.882 before the standard rescore of 2026-11-25, still the best) | none |
| f-0x-chain-hint | the same | the truth's tuning and capo |
| f-06, f-07 | the recording itself (TabCNN: mono WAV; Guitab: the stereo WAV in headless Chromium, model E25, `?backend=wasm`) | f-07-hint: Guitab's Capo stepper at 3 (capo song only) |

Inputs to the note assigners: one-track MIDI written by `notes2mid.py` (`work/exp-strfret/mid/`). For the standard
song the true values are the defaults, so its -hint runs are the same command as the no-hint runs (identical scores).
Hints that could not be given: tabsynth has no tuning argument (f-04-hint and f-04-chain-hint on `tuning`: skipped);
its capo hint is the wrapper's `--transpose -3` with the frets then read as counted from a capo at 3. TabCNN has no
tuning or capo option (standard tuning, 19 frets). Guitab has a capo stepper but no tuning option, and the true capo of
`tuning` and `standard` is 0, its default: f-07-hint there is recorded as skipped (it would be the f-07 run).

**How to read the scores.** The truth counts frets from the capo (capo song: capo 3). An assigner told nothing writes
frets from the nut for a guitar without a capo, so on the capo song "same string and fret" is 0 for every no-hint run by
construction; the second table counts frets from the nut on both sides and is the comparable number there. On the
tuning song every open string differs from standard, so without the tuning a note on the right string has the wrong
fret number: 0 in both tables by construction. The share on the right string (any fret) for those runs: f-01 0.289,
f-03 0.289, f-04 0.271, f-01-chain 0.267, f-03-chain 0.249, f-04-chain 0.243, f-06 0.161, f-07 0.192.
**f-07 (Guitab) is matched by note order** (`tab --ignore-time`, `score_tab_order.json`): its GP5 times are its own
beat grid (first measure at 0 s, 77 BPM on the capo song), and by time only 69 of 815 (capo), 24 of 628 (tuning) and
11 of 679 (standard) notes matched (`score_tab.json`). Its notes.csv and render.wav are on that GP5 timeline, not the
recording's: a constant shift does not fit (median onset gap to the nearest same-pitch truth note: capo +0.26 to +0.32 s,
standard -0.11 to -0.22 s, tuning -0.19 to -0.63 s over three 40-s spans).

## Scores (whole songs; f-07 rows matched by note order)

**Same string and fret, of matched notes (fret counted from each side's capo; matched/truth notes in brackets; gtr-eval eval id)**

| run | capo | tuning | standard |
|---|---|---|---|
| f-01 | 0.000 (815/815) e2313 | 0.000 (591/628) e2321 | 0.892 (679/679) e2329 |
| f-01-hint | 0.795 (815/815) e2315 | 0.967 (628/628) e2323 | 0.892 (679/679) e2340 |
| f-01-chain | 0.000 (781/815) e2316 | 0.000 (494/628) e2325 | 0.894 (630/679) e2342 |
| f-01-chain-hint | 0.795 (781/815) e2319 | 0.975 (517/628) e2327 | 0.894 (630/679) e2343 |
| f-02 | 0.000 (602/815) e2415 | - (0/628) e2419 | 0.903 (444/679) e2423 |
| f-02-hint | 0.792 (698/815) e2416 | 0.962 (556/628) e2420 | 0.903 (444/679) e2424 |
| f-02-chain | 0.000 (297/815) e2417 | - (0/628) e2421 | 0.816 (98/679) e2425 |
| f-02-chain-hint | 0.625 (477/815) e2418 | 0.836 (140/628) e2422 | 0.816 (98/679) e2426 |
| f-03 | 0.000 (815/815) e2374 | 0.000 (591/628) e2395 | 0.892 (679/679) e2399 |
| f-03-hint | 0.795 (815/815) e2388 | 0.967 (628/628) e2396 | 0.892 (679/679) e2400 |
| f-03-chain | 0.000 (781/815) e2389 | 0.000 (482/628) e2397 | 0.895 (627/679) e2401 |
| f-03-chain-hint | 0.800 (781/815) e2393 | 0.975 (517/628) e2398 | 0.895 (627/679) e2402 |
| f-04 | 0.000 (815/815) e2403 | 0.000 (591/628) e2407 | 0.829 (679/679) e2409 |
| f-04-hint | 0.521 (815/815) e2404 | skipped | 0.829 (679/679) e2410 |
| f-04-chain | 0.000 (781/815) e2405 | 0.000 (482/628) e2408 | 0.805 (630/679) e2411 |
| f-04-chain-hint | 0.597 (781/815) e2406 | skipped | 0.805 (630/679) e2413 |
| f-06 | 0.000 (613/815) e2350,e2352,e2353 | 0.000 (273/628) e2355,e2357,e2358 | 0.915 (355/679) e2360,e2362,e2363 |
| f-07 | 0.000 (764/815) e2364,e2365 | 0.000 (437/628) e2366,e2367 | 0.912 (625/679) e2386,e2387 |
| f-07-hint | 0.832 (764/815) e2412,e2414 | skipped | skipped |


**Same string and same fret counted from the nut, of matched notes**

| run | capo | tuning | standard |
|---|---|---|---|
| f-01 | 0.394 (815/815) | 0.000 (591/628) | 0.892 (679/679) |
| f-01-hint | 0.795 (815/815) | 0.967 (628/628) | 0.892 (679/679) |
| f-01-chain | 0.396 (781/815) | 0.000 (494/628) | 0.894 (630/679) |
| f-01-chain-hint | 0.795 (781/815) | 0.975 (517/628) | 0.894 (630/679) |
| f-02 | 0.654 (602/815) | - (0/628) | 0.903 (444/679) |
| f-02-hint | 0.792 (698/815) | 0.962 (556/628) | 0.903 (444/679) |
| f-02-chain | 0.424 (297/815) | - (0/628) | 0.816 (98/679) |
| f-02-chain-hint | 0.625 (477/815) | 0.836 (140/628) | 0.816 (98/679) |
| f-03 | 0.393 (815/815) | 0.000 (591/628) | 0.892 (679/679) |
| f-03-hint | 0.795 (815/815) | 0.967 (628/628) | 0.892 (679/679) |
| f-03-chain | 0.394 (781/815) | 0.000 (482/628) | 0.895 (627/679) |
| f-03-chain-hint | 0.800 (781/815) | 0.975 (517/628) | 0.895 (627/679) |
| f-04 | 0.405 (815/815) | 0.000 (591/628) | 0.829 (679/679) |
| f-04-hint | 0.521 (815/815) | skipped | 0.829 (679/679) |
| f-04-chain | 0.411 (781/815) | 0.000 (482/628) | 0.805 (630/679) |
| f-04-chain-hint | 0.597 (781/815) | skipped | 0.805 (630/679) |
| f-06 | 0.615 (613/815) | 0.000 (273/628) | 0.915 (355/679) |
| f-07 | 0.759 (764/815) | 0.000 (437/628) | 0.912 (625/679) |
| f-07-hint | 0.832 (764/815) | skipped | skipped |


**Same string and fret, of all truth notes (unplaced and unmatched notes count as wrong)**

| run | capo | tuning | standard |
|---|---|---|---|
| f-01 | 0.000 (815/815) | 0.000 (591/628) | 0.892 (679/679) |
| f-01-hint | 0.795 (815/815) | 0.967 (628/628) | 0.892 (679/679) |
| f-01-chain | 0.000 (781/815) | 0.000 (494/628) | 0.829 (630/679) |
| f-01-chain-hint | 0.762 (781/815) | 0.803 (517/628) | 0.829 (630/679) |
| f-02 | 0.000 (602/815) | 0.000 (0/628) | 0.591 (444/679) |
| f-02-hint | 0.679 (698/815) | 0.852 (556/628) | 0.591 (444/679) |
| f-02-chain | 0.000 (297/815) | 0.000 (0/628) | 0.118 (98/679) |
| f-02-chain-hint | 0.366 (477/815) | 0.186 (140/628) | 0.118 (98/679) |
| f-03 | 0.000 (815/815) | 0.000 (591/628) | 0.892 (679/679) |
| f-03-hint | 0.795 (815/815) | 0.967 (628/628) | 0.892 (679/679) |
| f-03-chain | 0.000 (781/815) | 0.000 (482/628) | 0.826 (627/679) |
| f-03-chain-hint | 0.767 (781/815) | 0.803 (517/628) | 0.826 (627/679) |
| f-04 | 0.000 (815/815) | 0.000 (591/628) | 0.829 (679/679) |
| f-04-hint | 0.521 (815/815) | skipped | 0.829 (679/679) |
| f-04-chain | 0.000 (781/815) | 0.000 (482/628) | 0.747 (630/679) |
| f-04-chain-hint | 0.572 (781/815) | skipped | 0.747 (630/679) |
| f-06 | 0.000 (613/815) | 0.000 (273/628) | 0.479 (355/679) |
| f-07 | 0.000 (764/815) | 0.000 (437/628) | 0.839 (625/679) |
| f-07-hint | 0.780 (764/815) | skipped | skipped |


**Run time (gtr-run wall seconds, 2 cores; estimated notes written)**

| run | capo | tuning | standard |
|---|---|---|---|
| f-01 | 0.29 s, 815 notes | 0.3 s, 628 notes | 0.38 s, 679 notes |
| f-01-hint | 0.26 s, 815 notes | 0.32 s, 628 notes | 0.36 s, 679 notes |
| f-01-chain | 0.36 s, 883 notes | 0.3 s, 618 notes | 0.36 s, 734 notes |
| f-01-chain-hint | 0.37 s, 883 notes | 0.35 s, 618 notes | 0.36 s, 734 notes |
| f-02 | 13.2 s, 602 notes | 4.61 s, 0 notes | 10.4 s, 444 notes |
| f-02-hint | 16.29 s, 698 notes | 8.8 s, 556 notes | 10.32 s, 444 notes |
| f-02-chain | 11.57 s, 321 notes | 5.64 s, 0 notes | 8.62 s, 110 notes |
| f-02-chain-hint | 14.04 s, 550 notes | 10.08 s, 186 notes | 8.29 s, 110 notes |
| f-03 | 8.76 s, 815 notes | 3.43 s, 591 notes | 3.67 s, 679 notes |
| f-03-hint | 3.33 s, 815 notes | 3.62 s, 628 notes | 3.5 s, 679 notes |
| f-03-chain | 3.81 s, 883 notes | 3.26 s, 581 notes | 3.53 s, 734 notes |
| f-03-chain-hint | 3.37 s, 882 notes | 3.38 s, 618 notes | 3.3 s, 734 notes |
| f-04 | 0.35 s, 815 notes | 0.24 s, 591 notes | 0.26 s, 679 notes |
| f-04-hint | 0.27 s, 815 notes | - | 0.24 s, 679 notes |
| f-04-chain | 0.31 s, 883 notes | 0.25 s, 581 notes | 0.25 s, 734 notes |
| f-04-chain-hint | 0.31 s, 882 notes | - | 0.38 s, 734 notes |
| f-06 | 30.88 s, 2864 notes | 24.51 s, 1917 notes | 22.57 s, 1398 notes |
| f-07 | 172.59 s, 1141 notes | 142.52 s, 554 notes | 138.79 s, 787 notes |
| f-07-hint | 175.24 s, 1141 notes | - | - |

**TabCNN (f-06), audio in: its notes and its frame tab** (`score_notes.json`, `score_frames.json`; frames scored with
TabCNN's own tuning and capo given, `--est-tuning 40,45,50,55,59,64 --est-capo 0`, eval e2427, e2428, e2429; the
frame tab compares string and fret counted from each side's capo)

| number | capo | tuning | standard |
|---|---|---|---|
| notes onset F1 (P / R) | 0.333 (0.214 / 0.752) | 0.215 (0.142 / 0.435) | 0.342 (0.254 / 0.523) |
| frame tab F1 | 0.034 | 0.024 | 0.688 |
| frame pitch F1 | 0.608 | 0.494 | 0.715 |
| tab hits / pitch hits | 0.057 | 0.049 | 0.966 |

## What failed, and what was done instead

- **scorify (f-02) on a whole song placed 0 notes in all 12 runs**: `search-exhausted`, "No valid path within the
  declared candidate and mechanics model" (tuning no-hint runs: `infeasible`). Logs:
  `work/exp-strfret/logs/f02_whole_<S>_<id>.log`. Fallbacks tried on capo truth notes with the capo told: larger search
  limits (beam 512, 512 candidates, 5,000,000 expansions, minDuration 1/256, maxAttacksPerSecond 64; r0968) and
  adaptive mode with held notes allowed to be cut short (r0970): both `search-exhausted`, "Expansion budget exceeded",
  0 placed (`work/exp-strfret/scorify_fb/`). **The f-02 rows are therefore scorify run on 10-second windows**
  (`scorify_windows.py`, each window arranged alone, default options, windows joined); a window scorify cannot arrange
  leaves its notes without a position. Windows fully placed: capo-hint 20 of 23, tuning-hint 16 of 18, standard 12 of
  18, standard-chain 3 of 18, tuning no-hint 0 of 18 (8 `infeasible`, 10 `search-exhausted`)
  (`experiments/<S>/f-02*/raw/<S>.windows.json`).
- **Notes below the lowest open string without the tuning hint** (tuning song, 37 truth notes below E2): tuttut wrote
  628 notes, none below E2, so 37 at another pitch (591 matched); LilyPond and tabsynth wrote 591 (the 37 dropped).
- **Guitab timing**: see "How to read" (order matching). Guitab placed 1141, 554 and 787 notes (capo, tuning,
  standard; truth 815, 628, 679).
- **Not run**: f-04-hint and f-04-chain-hint on `tuning` (no tuning argument); f-07-hint on `tuning` and `standard`
  (true capo 0 = default, no tuning option); C entries. Nothing was refused by the permission system.
- **Disk**: the box fell to 2.4 GB free during the runs; every `render.wav` of this step was converted to mono
  22.05 kHz 16-bit (FluidSynth render by `notes2wav.py`, then ffmpeg), and identical renders are hard links of one
  file (`work/exp-strfret/renders/`). Truth-note runs that keep every note render the truth's pitches and onsets, so
  their render.wav files are the same sound: a right pitch on a wrong string sounds the same.

## Observations the numbers carry

- On the truth's notes with the true tuning and capo, tuttut and LilyPond agree note for note on capo (815 of 815
  identical positions) and tuning (626 of 628), and on 541 of 679 on standard; their scores: 0.795 / 0.967 / 0.892.
- The hint changes the capo song's comparable number (frets from the nut, truth notes in): tuttut 0.394 -> 0.795,
  scorify 0.654 -> 0.792 (602 -> 698 placed), LilyPond 0.393 -> 0.795, tabsynth 0.405 -> 0.521, Guitab (audio in,
  order-matched) 0.759 -> 0.832; on the tuning song (right string and fret): 0 -> 0.967 (tuttut, LilyPond), 0 -> 0.962
  (scorify).
- From the step-2 notes instead of the truth's, with the hint, the share of all truth notes on the right string and
  fret: capo 0.762 (tuttut), 0.767 (LilyPond), 0.572 (tabsynth), 0.366 (scorify); tuning 0.803 (tuttut, LilyPond),
  0.186 (scorify); standard 0.829, 0.826, 0.747, 0.118.
- TabCNN on the standard song: 0.915 of 355 matched notes on the right string and fret, 0.479 of all truth notes, and
  1398 notes written for 679 truth notes (notes onset F1 0.342).

## For the film

Stretches are 15 s, chosen by `film_stretch.py` as the window with the most min(right, wrong) (per-note labels in
`labels_tab.json` of each run: est string/fret, truth string/fret, right / other_string / same_string_other_fret /
unmatched; its own matching, same rule as gtr-eval, counts below are from those files). Show: the run's `tab.gp5`
(rhythm from the truth's beats, display only; Guitab's own GP5 for f-07) next to the truth `/home/user/gtv/truth/<S>/<S>.gp5`,
wrong positions from `labels_tab.json`. Play: `render.wav` of the run (FluidSynth, recording timeline except f-07).
Right/wrong is settled by the truth (a number); the sound of a wrong string is not different in the render, so the
ear cannot judge this step: the viewer judges by eye only how a tab reads.

| technique | song, stretch (s) | in the stretch (labels_tab.json) | files (under /home/user/gtv/experiments/) | settled by |
|---|---|---|---|---|
| f-01 tuttut | tuning 49-64 | f-01-hint: 49 right, 7 other string; f-01 (no hint), same seconds: 0 right, 37 other string, 15 same string other fret, 4 unmatched | tuning/f-01-hint/{tab.gp5,render.wav,labels_tab.json}, tuning/f-01/tab.gp5 | number (0.967 vs 0 whole song) |
| f-02 scorify | capo 174-189 | f-02-hint: 48 right, 24 other string; f-02 (no hint, frets from nut): 34 right, 38 other string | capo/f-02-hint/..., capo/f-02/...; raw/capo.windows.json for the unplaced windows (140-150 s, 190-210 s) | number (0.792 of 698 placed) |
| f-03 LilyPond | standard 156-171 | 58 right, 11 other string (69 truth notes) | standard/f-03/{tab.gp5,render.wav,labels_tab.json}; raw/standard.png is LilyPond's own engraving of the first systems | number (0.892) |
| f-04 tabsynth | capo 70-85 | f-04-hint: 30 right, 32 other string; f-04 (nut): 31 right, 31 other string | capo/f-04-hint/..., capo/f-04/... | number (0.521 hint vs 0.405 nut no-hint) |
| f-06 TabCNN | standard 152-167 | 33 right, 6 other string, 105 written notes with no truth note (68 truth notes) | standard/f-06/{tab.gp5,render.wav,frames.csv,labels_tab.json} | number for positions (0.915 of matched); the 105 extra notes are audible in render.wav |
| f-07 Guitab | capo 92-107 of the recording (Guitab GP5 time 91.7-106.7: its times + 0.29 s matched with 0.15 s tolerance) | f-07-hint: 26 right, 26 other string, 31 unmatched; f-07: 22 right, 30 other string, 31 unmatched | capo/f-07-hint/{tab.gp5,render.wav,labels_tab.json}, capo/f-07/... | number (order-matched 0.832 vs 0.759 from nut); its own rhythm in the GP5 is for the eye |
