# N-E2: Noise2Fret, the literal reading of "Can we do a diffusion method like AO-087?"

Written 2026-11-27 by the N-E2 helper of the NOTES session (branch `research/guitar-notes`). Work folder, with every
script, run, score and log: `/home/user/notes/runs/e2/` (`PROGRESS.md`, `bin/`, `e2.json`, `votes/votes.json`,
`conf/sweep.json`, `logs/collect.md`). Film material: `/home/user/notes/runs/<S>/n2f-traj-<ckpt>/`.

## In short

- **Yes, a diffusion transcriber that exists today runs on this box.** Noise2Fret (Simionato and Bigo, ISMIR 2026,
  MIT, about 15 M weights) ran all four released checkpoints on the three songs on 2 CPU cores with nothing new
  installed. A 30 s segment takes 3.5 to 6.3 s of wall time; a whole song 4.6 to 27 s. The brief's stop rules (30
  minutes per 30 s; a whole song in 30 minutes) are met by a factor of about 300 and 70.
- **No, it does not help.** Its best standalone onset F1 is 0.601 (capo), 0.383 (tuning), 0.394 (standard), against
  guitar-fl's 0.920, 0.796, 0.892. It misses the 0.88 gate on capo and standard by about 0.3 and 0.5.
- **As a voter it lowers the vote.** Added as a fourth voter to the 2-of-3 vote of fl, gaps and Transkun, no run of any
  variant adds 0.01 on any song. The best single change is +0.005 (tuning); the best on capo is -0.005, on standard
  -0.005.
- **Used as a re-scorer** of the guitar models' candidates (a pitch mask from fl and gaps), it reaches 0.855 / 0.556 /
  0.691. That is below fl alone and below simply keeping every fl or gaps candidate (0.893 / 0.821 / 0.869).
- **The GPU fine-tune gate is not met.** On the 30 s segments its best variant is 0.067 (capo), 0.116 (tuning) and
  0.117 (standard) below guitar-fl; the gate is 0.03.
- **The film.** The "every note at once, then thinning" picture exists only in the noisy latent read through the
  class head (`p_xt`), and at the start that is pure noise, not the model hearing every note (the checker found
  gs_laux's step-1 `p_xt` bit-identical on all three songs). What the model believes (`p_x0`) is sparse from the
  first step; with gs_laux it barely moves, with goat it grows by 38 to 71 % as more attacks are committed. More
  steps make the answer worse (-0.06 to -0.15 F1 at 20 steps). So the honest film shows both rows, and E4 (the haze) remains the answer to Aaron's question by
  intent.

## What was run

- **Runner.** `/home/user/notes/methods/n2f/n2f_infer.py` (README next to it, read in full, Checker fixes included),
  Python 3.11 / torch 2.15 CPU in `/home/user/notes/venv`, run with `python -I`. Wrapper:
  `bin/n2f.sh <S> <run> <seg30|whole> <ckpt> [args]`. Every model run went through `gtr-run --lane notes` (2-core slot,
  `--threads 2`); its run id is in each table.
- **Checkpoints.** `gs_laux` (GuitarSet_N2F_Laux), `gs` (GuitarSet_N2F), `goat` (GOAT_N2F), `goat_laux` (GOAT_N2F_Laux).
  Defaults: 1 denoising step, seed 0, GuitarSet ckpts decoded through every slot ("frames"), GOAT ckpts anchored on
  librosa onsets at level `--goat-level 0.5`.
- **Audio.** `/home/user/gtv/songs/<S>/<S>.seg30.mono.wav` (30 s; capo from 12.76 s, tuning from 25.0 s, standard
  from 0.0 s) and `<S>.mono.wav` (whole song, 228 / 187 / 177 s).
- **Pitch.** The model names a standard-tuning string and fret, and the CSV pitch is the sounding pitch. That is the
  heard pitch on all three songs, the nylon song included. It cannot name anything below E2: 37 of the tuning song's
  628 key notes are D2 or D#2, so its recall ceiling there is 0.941.
- **Scoring of record.** `/home/user/gtr/bin/gtr-eval notes --truth /home/user/gtv/truth/<S>/<S>.truth.json --est
  runs/<S>/<run>/out.csv --no-ledger --pretty` (gtr-eval 0.12.1, onset F1 at 50 ms and 50 cents, offsets ignored).
  Output: `scores/<S>/<run>/whole.json`. The 30 s keys were cut with `/home/user/gtv/tools/bin/crop_truth.py` into
  `truth/` (same notes as the step-2 segment keys, checked). A segment run is scored directly
  (`scores/<S>/seg30-<ckpt>/seg30run.json`). A whole-song run is also cropped to the segment exactly as step 2 did
  (`breakdown.py --t0 --dur 30`, then gtr-eval: `scores/<S>/<run>/seg30.json`). The breakdown is
  `/home/user/gtv/work/exp-notes/bin/breakdown.py` (`scores/<S>/<run>/bd/`); slaps use `taps_invented.py`'s rule
  (an invented note within 50 ms of a key tap; `scores/<S>/<run>/taps.json`). All by `bin/score.py`, gathered by
  `bin/collect.py` into `e2.json`.

## 1. Time on 2 cores (1 step)

Wall seconds from the `gtr-run` ledger, including loading and feature extraction.

| checkpoint | capo 30 s | tuning 30 s | standard 30 s | capo whole (228 s) | tuning whole (187 s) | standard whole (177 s) |
|---|---|---|---|---|---|---|
| gs_laux | 6.18 (r1350) | 4.99 (r1358) | 5.13 (r1368) | 26.48 (r1351) | 14.71 (r1359) | 20.85 (r1369) |
| gs | 6.26 (r1352) | 5.07 (r1360) | 5.14 (r1371) | 18.26 (r1353) | 23.31 (r1361) | 16.91 (r1372) |
| goat | 4.09 (r1354) | 3.68 (r1362) | 5.11 (r1373) | 8.36 (r1355) | 5.16 (r1363) | 5.54 (r1374) |
| goat_laux | 5.38 (r1356) | 3.46 (r1364) | 3.85 (r1387) | 7.89 (r1357) | 5.15 (r1367) | 4.61 (r1388) |

So gs_laux runs at 0.08 to 0.12 s per audio second, GOAT at about 0.03. The box was shared (load average 3.5 to 5), so
the spread between gs and gs_laux, which have the same network, is load. At 20 steps (section 6) a 30 s segment takes
29 to 30 s with gs_laux and about 5 s with goat. No install, download or GPU was needed: the venv and the checkpoints
were already on the box.

## 2. The four checkpoints, default settings

Onset F1. "30 s run": the model run on the 30 s file. "crop": the whole-song run cropped to the same 30 s.

| checkpoint | capo 30 s run | tuning 30 s run | standard 30 s run | capo whole | tuning whole | standard whole | capo crop | tuning crop | standard crop |
|---|---|---|---|---|---|---|---|---|---|
| gs_laux | 0.418 | 0.330 | 0.508 | 0.459 | 0.318 | 0.352 | 0.416 | 0.374 | 0.514 |
| gs | 0.288 | 0.151 | 0.219 | 0.338 | 0.107 | 0.143 | 0.256 | 0.137 | 0.230 |
| goat | 0.500 | 0.245 | 0.521 | 0.489 | 0.209 | 0.353 | 0.470 | 0.228 | 0.481 |
| goat_laux | 0.516 | 0.272 | 0.387 | **0.545** | 0.285 | 0.326 | 0.530 | 0.291 | 0.375 |
| for comparison: guitar-fl (n-03) | | | | 0.920 | 0.796 | 0.892 | 0.941 | 0.783 | 0.988 |
| guitar-gaps (n-02) | | | | 0.919 | 0.830 | 0.879 | 0.922 | 0.807 | 0.992 |
| Transkun (n-04) | | | | 0.896 | 0.785 | 0.866 | 0.898 | 0.790 | 0.976 |

The comparison rows are N-E0's rescores (`/home/user/notes/runs/e0/rescore/<S>/n-0*/whole.json`, `seg30.json`).
Checker correction: for Transkun, `seg30.json` scores its own run on the 30 s file (step 2's `cmd_seg30.sh`), not a
crop, so the crop columns now hold the crop of its whole-song run (checker's own scorer). Its 30 s runs score
0.848 / 0.760 / 0.976. For fl and gaps step 2's segment numbers are crops, as here.
A 30 s run and the crop of the whole run differ a little: the GuitarSet ckpts scale the file to its peak, and the GOAT
ckpts detect onsets and set the level over the file they are given.

**The breakdown, whole songs** (`scores/<S>/<run>/bd/breakdown.json`, `taps.json`; onset error = estimate minus key,
median over matched notes, from gtr-eval). Key notes per string group: capo 298 on strings 6-4 and 517 on 3-1, tuning
177 and 451, standard 314 and 365.

| song | run | F1 | P | R | found | missed | invented | heard-only R | R strings 6-4 | R strings 3-1 | invented at a slap | median onset error ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| capo | gs_laux | 0.459 | 0.344 | 0.688 | 561 | 254 | 1068 | 0.698 | 0.440 | 0.832 | 635 of 1068 | -5.8 |
| capo | gs | 0.338 | 0.288 | 0.407 | 332 | 483 | 819 | 0.413 | 0.148 | 0.557 | 461 of 819 | -8.7 |
| capo | goat | 0.489 | 0.519 | 0.461 | 376 | 439 | 348 | 0.481 | 0.453 | 0.466 | 78 of 348 | +8.6 |
| capo | goat_laux | 0.545 | 0.518 | 0.575 | 469 | 346 | 437 | 0.587 | 0.453 | 0.646 | 150 of 437 | +8.6 |
| tuning | gs_laux | 0.318 | 0.255 | 0.422 | 265 | 363 | 776 | 0.450 | 0.186 | 0.514 | no slaps | -11.6 |
| tuning | gs | 0.107 | 0.131 | 0.091 | 57 | 571 | 379 | 0.093 | 0.006 | 0.124 | no slaps | -17.4 |
| tuning | goat | 0.209 | 0.163 | 0.293 | 184 | 444 | 947 | 0.302 | 0.181 | 0.337 | no slaps | 0.0 |
| tuning | goat_laux | 0.285 | 0.240 | 0.352 | 221 | 407 | 700 | 0.363 | 0.226 | 0.401 | no slaps | -5.8 |
| standard | gs_laux | 0.352 | 0.304 | 0.418 | 284 | 395 | 651 | 0.425 | 0.484 | 0.362 | 415 of 651 | +13.6 |
| standard | gs | 0.143 | 0.158 | 0.131 | 89 | 590 | 475 | 0.142 | 0.213 | 0.060 | 284 of 475 | +13.6 |
| standard | goat | 0.353 | 0.332 | 0.377 | 256 | 423 | 514 | 0.372 | 0.405 | 0.353 | 191 of 514 | +25.2 |
| standard | goat_laux | 0.326 | 0.329 | 0.323 | 219 | 460 | 447 | 0.324 | 0.357 | 0.293 | 207 of 447 | +25.2 |

What it says:

- **Wrong and extra notes, not timing.** With a 100 ms onset tolerance F1 moves by at most 0.023
  (`scores/<S>/<run>/whole_tol100_chroma.json`, gs_laux and goat_laux; the checker found goat at +0.025 on tuning). Forgiving octaves too adds 0.03 to 0.13. The
  model hears the wrong notes, and many that are not there.
- **Slaps.** On the steel-string songs 59 to 64 % of gs_laux's inventions sit at a slap (capo 635 of 1068). The
  GuitarSet model never heard percussive playing.
- **Bass strings.** Recall on strings 6-4 is 0.006 to 0.484, below the treble strings on capo and tuning.
- **The nylon song is the worst**, as for every tool; there gs barely works (recall 0.091).

## 3. Variants

All on whole songs; the 30 s number is the crop. Mean = mean of the three whole-song F1.

| variant | capo whole | tuning whole | standard whole | mean | capo crop | tuning crop | standard crop | run ids (capo, tuning, standard) |
|---|---|---|---|---|---|---|---|---|
| goat, librosa onsets (default) | 0.489 | 0.209 | 0.353 | 0.350 | 0.470 | 0.228 | 0.481 | r1355, r1363, r1374 |
| (a) goat, fl's onsets | 0.491 | 0.215 | 0.347 | 0.351 | 0.474 | 0.278 | 0.478 | r1365, r1384, r1403 |
| goat_laux, librosa onsets (default) | 0.545 | 0.285 | 0.326 | 0.385 | 0.530 | 0.291 | 0.375 | r1357, r1367, r1388 |
| (a) goat_laux, fl's onsets | 0.527 | 0.288 | 0.338 | 0.384 | 0.472 | 0.310 | 0.383 | r1366, r1385, r1404 |
| (b) gs_laux, range mask | 0.462 | 0.318 | 0.352 | 0.377 | 0.418 | 0.374 | 0.514 | r1370, r1386, r1405 |
| (b) gs, range mask | 0.338 | 0.107 | 0.143 | 0.196 | 0.256 | 0.137 | 0.230 | r1375, r1391, r1406 |
| (b) goat, range mask | 0.497 | 0.209 | 0.353 | 0.353 | 0.472 | 0.228 | 0.481 | r1376, r1393, r1407 |
| (b) goat_laux, range mask | 0.550 | 0.285 | 0.326 | 0.387 | 0.537 | 0.291 | 0.375 | r1377, r1395, r1408 |
| (b) goat / goat_laux, fl's onsets, range mask | 0.500 / 0.533 | 0.215 / 0.288 | 0.347 / 0.338 | 0.354 / 0.386 | | | | r1382, r1399, r1412 / r1383, r1401, r1413 |
| (c) gs_laux, fl U gaps pitch mask (re-scorer) | **0.855** | 0.556 | **0.691** | **0.700** | **0.874** | 0.553 | 0.701 | r1378, r1396, r1409 |
| extra: goat, fl's onsets, fl U gaps pitch mask | 0.680 | 0.575 | 0.620 | 0.625 | 0.747 | **0.667** | **0.871** | r1380, r1397, r1410 |
| extra: goat_laux, fl's onsets, fl U gaps pitch mask | 0.784 | **0.606** | 0.569 | 0.653 | 0.782 | 0.578 | 0.714 | r1381, r1398, r1411 |
| extra: gs_laux, notes with conf >= 0.8 (best standalone) | 0.601 | 0.383 | 0.394 | 0.459 | 0.562 | 0.440 | 0.573 | post-filter of r1351, r1359, r1369 |
| reference: keep every fl or gaps note (1-of-2, E0's cluster rule) | 0.893 | 0.821 | 0.869 | 0.861 | 0.910 | 0.791 | 0.988 | `votes/refs.json` |
| reference: 2-of-2 vote of fl and gaps | 0.948 | 0.805 | 0.909 | 0.887 | 0.955 | 0.800 | 0.992 | `votes/refs.json` |

The capo mask, capo song only:

| checkpoint | no mask | `--capo 3` | `--capo 3` + range | found / invented, no mask | found / invented, `--capo 3` | run ids |
|---|---|---|---|---|---|---|
| gs_laux | 0.459 | 0.455 | 0.455 | 561 / 1068 | 545 / 1037 | r1414, r1415 |
| gs | 0.338 | 0.336 | 0.336 | 332 / 819 | 312 / 729 | r1416, r1417 |
| goat | 0.489 | 0.443 | 0.443 | 376 / 348 | 333 / 355 | r1418, r1419 |
| goat_laux | 0.545 | 0.455 | 0.455 | 469 / 437 | 385 / 494 | r1420, r1421 |
| goat / goat_laux, fl's onsets | 0.491 / 0.527 | 0.447 / 0.442 | | | | r1422 / r1423 |

**(a) Onset anchors.** fl's onsets (`inputs/<S>/fl_onsets.txt`: 858, 555 and 673 unique onset times of
`experiments/<S>/n-03/notes.csv`) change GOAT's F1 by -0.018 to +0.012. On GuitarSet the key's own onsets added 0.04
(README); here the anchors are not what limits it. They do move its timing: median onset error goes to fl's own
(-20, -28 and 0 ms) from GOAT's +9, 0 to -6 and +25 ms.

**(b) The capo mask, and whether it is the right constraint.** `--capo 3` forbids frets 0 to 2 on every string in the
model's standard-tuning naming. As physics it is exactly right: a guitar in standard tuning with a capo at 3 can sound
only the positions a capo-less guitar has at fret 3 and up, and a capo-3 open string sounds what the model calls fret
3. For this model it is the wrong constraint, and it costs 0.002 to 0.090. Two reasons, both measured:

1. The model's string choice is not reliable (on GuitarSet the GOAT ckpts pick the right string for about 61 % of
   correctly pitched notes, README), so forbidding a string position also forbids right pitches.
2. With 1 step the mask acts on the final class choice of that string, and the forbidden class's share goes to
   another fret on the same string, which is a different pitch. Of goat_laux's 146 notes at frets 0 to 2 on the capo
   song (84 of them right), only 3 keep their pitch on another string under the mask; for 116 a note of another pitch
   sits on the same string within 50 ms, and 27 vanish. Found notes fall from 469 to 385 and invented notes rise from
   437 to 494.

The constraint that matches a pitch target is the **range mask** (`inputs/<S>/range.json`: sounding pitch from the
lowest open string with the capo to string 1's fret 20; capo 43 to 84, tuning 38 to 80, standard 40 to 84). It costs
nothing and helps a little where there is something to remove: capo +0.000 (gs) to +0.009 (goat; goat with fl's onsets +0.008);
tuning and standard unchanged (same F1 to six places). So: pitch range yes, string mask no,
for a model that hears a capo-less standard-tuned guitar.

**(c) Noise2Fret as a re-scorer of the guitar models' candidates.** `inputs/<S>/pitchmask_gs.json`: each 23 ms row may
only attack positions sounding a pitch that fl or gaps has within ±35 ms of it (the README's oracle-mask geometry, with
fl and gaps in place of the key); every other row may only say "no attack". 1,642, 1,093 and 1,292 candidates. The
result keeps precision near the guitar models' (0.886 / 0.832 / 0.849) but loses recall (0.826 / 0.417 / 0.582). It
is below fl alone on every song and below keeping every candidate (the 1-of-2 row). So the model removes more right
notes than wrong ones from these candidates: as a judge of which candidate is real, it is worse than no judge. GOAT
with fl's onsets and the same mask (`pitchmask_goat.json`, rows [anchor - 50, anchor + 60) ms) is lower on capo and
standard, higher on tuning, and below fl everywhere.

**Extra: a confidence threshold.** The CSV's `conf` is the softmax probability of the chosen class. `bin/conf_sweep.py`
kept notes with conf >= th (th 0 to 0.9) and scored them in-process with gtr-eval's own `cmd_notes`
(`conf/sweep.json`). Chosen leave-one-song-out (the best mean F1 of the other two songs), the threshold is 0.8 for
every song with gs_laux. That is the best standalone Noise2Fret here: 0.601 / 0.383 / 0.394, mean 0.459.

| gs_laux, conf >= | 0 | 0.4 | 0.6 | 0.7 | 0.8 | 0.9 |
|---|---|---|---|---|---|---|
| capo | 0.459 | 0.489 | 0.550 | 0.577 | 0.601 | 0.591 |
| tuning | 0.318 | 0.328 | 0.354 | 0.367 | 0.383 | 0.383 |
| standard | 0.352 | 0.360 | 0.389 | 0.397 | 0.394 | 0.365 |

## 4. As a voter

The vote is N-E0's, unchanged (`bin/vote.py`): per MIDI pitch, a cluster takes every note within 50 ms of its first
onset, and it is kept when at least k tools have a note in it; onset and offset are the medians. fl, gaps and Transkun
come from N-E0's labels. The base 2-of-3 vote of fl, gaps and Transkun reproduces N-E0 exactly: 0.952785 / 0.818182 /
0.924585 whole (30 s: 0.976 / 0.825 / 1.000). Every vote is scored with the gtr-eval CLI (`votes/<S>/<vote>.json`,
`.seg30.json`). In brackets: the change against the base vote.

| Noise2Fret run | vote | capo whole | tuning whole | standard whole | capo 30 s | tuning 30 s | standard 30 s |
|---|---|---|---|---|---|---|---|
| gs_laux | 2 of 4 | 0.934 (-0.019) | 0.822 (+0.004) | 0.914 (-0.010) | 0.966 (-0.009) | 0.825 (+0.000) | 0.988 (-0.012) |
| gs_laux | 3 of 4 | 0.937 (-0.016) | 0.793 (-0.025) | 0.889 (-0.036) | 0.933 (-0.042) | 0.802 (-0.023) | 0.980 (-0.020) |
| gs_laux | 2 of 3, instead of Transkun | 0.931 (-0.022) | 0.816 (-0.002) | 0.902 (-0.023) | 0.946 (-0.030) | 0.806 (-0.019) | 0.984 (-0.016) |
| gs | 2 of 4 | 0.941 (-0.012) | 0.819 (+0.001) | 0.918 (-0.007) | 0.971 (-0.005) | 0.825 (+0.000) | 1.000 (+0.000) |
| goat | 2 of 4 | 0.948 (-0.005) | 0.821 (+0.003) | 0.912 (-0.013) | 0.971 (-0.005) | 0.822 (-0.002) | 0.988 (-0.012) |
| goat_laux | 2 of 4 | 0.944 (-0.009) | 0.816 (-0.002) | 0.908 (-0.017) | 0.971 (-0.005) | 0.809 (-0.015) | 1.000 (+0.000) |
| goat_laux, fl's onsets | 2 of 4 | 0.944 (-0.009) | 0.812 (-0.006) | 0.914 (-0.011) | 0.976 (+0.000) | 0.806 (-0.019) | 1.000 (+0.000) |
| gs_laux, conf >= 0.8 | 2 of 4 | 0.940 (-0.013) | 0.823 (+0.005) | 0.919 (-0.005) | 0.966 (-0.009) | 0.825 (+0.000) | 0.992 (-0.008) |
| gs_laux, fl U gaps pitch mask | 2 of 4 | 0.925 (-0.027) | 0.819 (+0.001) | 0.908 (-0.017) | 0.962 (-0.014) | 0.821 (-0.004) | 0.996 (-0.004) |
| goat_laux, fl's onsets, pitch mask | 3 of 4 | 0.944 (-0.009) | 0.784 (-0.035) | 0.888 (-0.037) | 0.939 (-0.037) | 0.798 (-0.027) | 0.984 (-0.016) |

Every run and variant, all three vote kinds, is in `votes/votes.json`. Over all 58 song-runs (26 on capo, 16 on each
other song) and 3 vote kinds, 174 votes, the largest whole-song gain is +0.005 (gs_laux conf >= 0.8, 2 of 4, tuning). The largest on capo is -0.005, on standard -0.005. A 3-of-4 vote
always loses (-0.009 to -0.054): the model rarely agrees on the right notes the others are unsure of.

**Notes Noise2Fret finds that fl, gaps and Transkun all miss** (by the labels of the whole-song matching):

| | capo | tuning | standard |
|---|---|---|---|
| key notes all three miss (of them heard, conf not `tab`) | 17 (9) | 87 (53) | 39 (18) |
| found by gs_laux (heard) | 1 (0) | 16 (15) | 4 (1) |
| found by goat_laux | 0 | 16 | 5 |
| found by any of the four checkpoints (heard) | 1 (0) | 32 (24) | 10 (4) |

So on the nylon song the diffusion model does hear something the guitar models miss: 32 of the 87 notes no voter has,
24 of them heard. But each checkpoint brings 379 to 947 invented notes on that song, and nothing here picks those 32 out.
They are a candidate source for E4's haze (a weak prior), not a voter.

## 5. Gates of the brief

| gate | needed | Noise2Fret's best | met |
|---|---|---|---|
| joins the candidates | 0.88 or more on capo and standard | standalone 0.601 / 0.394 (gs_laux, conf >= 0.8); any variant 0.855 / 0.691 (the re-scorer) | no |
| stays in the app as a voter | +0.01 to the vote | +0.005 on tuning at most; capo and standard never above -0.005 | no |
| ask Aaron for a GPU fine-tune | within 0.03 of guitar-fl on the 30 s segments (0.941 / 0.783 / 0.988) | standalone 0.562 / 0.440 / 0.573; any variant 0.874 / 0.667 / 0.871 | no (gaps 0.067 / 0.116 / 0.117) |
| runs here | 30 min per 30 s, a whole song in 30 min | 6.3 s per 30 s, 27 s per whole song (gs_laux, 1 step) | yes |

## 6. The trajectory, for the film

Runs: gs_laux and goat on each 30 s file, `--steps 20 --save-trajectory` (gtr-run r1379, r1389 capo; r1390, r1394
tuning; r1400, r1402 standard; 29 to 30 s and about 5 s). Files: `/home/user/notes/runs/<S>/n2f-traj-<ckpt>/`
(`trajectory.npz`, `out.csv`, `out.npz`). Contact sheets: `contact_sheet.png` there, made by `bin/contact_sheet.py`
(top row `p_xt`, middle row `p_x0`, each a pitch roll of attack probability; bottom, the count per step), with the
counts in `contact_sheet.json`.

Cells (row, string, fret) with probability above 0.1, at steps 1, 6, 11, 16 and 20 of 20. GuitarSet rows are 23 ms
frames (1,292 in 30 s; only slot 0 is kept); GOAT rows are onset windows (77 to 108).

| song, checkpoint | `p_xt`, noisy latent | `p_x0`, clean estimate |
|---|---|---|
| capo, gs_laux | 12579, 669, 323, 264, 259 | 235, 277, 269, 263, 258 |
| tuning, gs_laux | 12579, 539, 246, 231, 215 | 131, 228, 224, 211, 212 |
| standard, gs_laux | 12579, 462, 160, 138, 137 | 86, 126, 129, 137, 140 |
| capo, goat | 2862, 2495, 1409, 600, 406 | 224, 259, 278, 349, 383 |
| tuning, goat | 2833, 2503, 1560, 809, 622 | 435, 441, 494, 588, 602 |
| standard, goat | 2032, 1796, 1123, 652, 523 | 338, 375, 424, 480, 501 |

What it shows, plainly:

- `p_xt` is the AO-087 picture: it opens with every note at once and thins out. But at step 1 the latent is pure
  Gaussian noise read through the class head (76 % of gs_laux's string-rows show an "attack" there). That haze is
  noise, not the model weighing every note the recording could hold. It thins because the noise is removed.
- `p_x0` is what the model believes. It is sparse from the first step. With gs_laux it changes little after the first few steps.
  With goat it grows by 38 to 71 %: more steps commit more attacks.
- More steps make the answer worse. On the 30 s files, 20 steps against 1: gs_laux 0.307 / 0.191 / 0.355 against
  0.418 / 0.330 / 0.508, goat 0.351 / 0.189 / 0.416 against 0.500 / 0.245 / 0.521 (`scores/traj/<S>-<ckpt>-20steps.json`).
  The released model is meant to be used at 1 step, which has no trajectory to show.
- For the film: draw both rows side by side and say which is which. The "haze thinning" that answers Aaron's question
  by intent is E4's, where every candidate's weight is evidence from the recording.

## 7. Handoff to LOOP

- `/home/user/gtv/notes/<S>/n2f-gs_laux/notes.csv`: the best standalone variant (gs_laux, 1 step, conf >= 0.8;
  786 / 615 / 434 notes; 0.601 / 0.383 / 0.394). `notes_all.csv` beside it has every gs_laux note, for another
  threshold. `source.json` names the run, its gtr-run id and the scores.
- `/home/user/gtv/notes/<S>/n2f-gs_laux-pmask/notes.csv`: the best variant overall, the re-scorer of fl and gaps
  (0.855 / 0.556 / 0.691). It is not independent of fl and gaps.
- Columns: onset, offset, pitch, support (1), conf (the model's class probability). Offsets are the next attack on the
  same string, capped at 2 s: the model predicts none.
- Neither should become a LOOP rung by its numbers. Each also carries a string and fret in the run's `out.csv`
  (standard-tuning naming, frets from the nut).

## What is uncertain

- One run per setting, seed 0. The README measured seeds moving F1 by about ±0.003 on GuitarSet.
- The confidence threshold and the variant choice were made on these three songs (the threshold leave-one-song-out).
  No held-out song was used. It changes nothing here: every number is far from every gate.
- The GuitarSet checkpoints learned an odd target (class 20 = "not played"); the runner decodes it as its builder and
  checker found best. Another decoding might do a little better; it would not close a gap of 0.3.
- The range mask's top (string 1's fret 20, counted from the nut) is the brief's E5 rule as I read it; it removed
  nothing at the top on these songs.
- The model's onsets are 14 to 25 ms late on the standard song and 0 to 17 ms early on the tuning song; a 100 ms tolerance moves
  F1 by at most 0.024, so this does not change the verdict.
- Not tried: the other diffusion models in the brief's table (D3RM, DiffRoll: piano; Noise-to-Notes: drums), and
  `Noise2Fret_and_Onsets`, which has no released weights (README).

## Files

| path | what |
|---|---|
| `/home/user/notes/runs/e2/PROGRESS.md` | the job's log, for a restart |
| `/home/user/notes/runs/e2/bin/` | `n2f.sh` (one run), `step1.sh`, `step2.sh`, `step4.sh` (the batches), `make_inputs.py` (onsets, masks), `score.py`, `collect.py`, `vote.py`, `refs.py`, `conf_sweep.py`, `contact_sheet.py`, `handoff.py` |
| `/home/user/notes/runs/e2/runs/<S>/<run>/` | each run: `out.csv`, `out.npz`, `run.log` (the gtr-run line), `stdout.json` |
| `/home/user/notes/runs/e2/scores/<S>/<run>/` | `whole.json`, `seg30.json` or `seg30run.json` (gtr-eval), `bd/` and `seg30/` (breakdown, labels), `taps.json` |
| `/home/user/notes/runs/e2/e2.json`, `logs/collect.md` | every number above, per run |
| `/home/user/notes/runs/e2/votes/` | `votes.json`, `refs.json`, each vote's notes and gtr-eval output |
| `/home/user/notes/runs/e2/conf/sweep.json` | the confidence sweep |
| `/home/user/notes/runs/e2/inputs/` | fl's onset times, the range masks, the fl U gaps pitch masks (`inputs.json`: counts) |
| `/home/user/notes/runs/<S>/n2f-traj-<ckpt>/` | 20-step trajectories, contact sheets |
| `/home/user/gtv/notes/<S>/n2f-gs_laux/`, `n2f-gs_laux-pmask/` | the handoff |

## Checker

An independent checker re-derived this record on 2026-11-27, with its own code, in `/home/user/notes/runs/check-n2f/`
(`PROGRESS.md`, `bin/`, `out/check.json`). Its scorer (`bin/myscore.py`) uses mir_eval 0.8.2's `match_notes` at
50 ms and 50 cents with offsets ignored. It reads the CSVs and the keys itself and makes its own 30 s crops. As a
calibration it gives step 2's fl / gaps / fl 0.920 / 0.830 / 0.892 and 59 / 82 invented notes at slaps, as
recorded. The verdict stands. Every number in sections 1 to 6 holds, apart from the five corrections below.

**What was checked, and how**

| check | how | result |
|---|---|---|
| every run's score | 70 output CSVs (67 model runs, 3 conf >= 0.8 filters), whole song, 30 s crop and 30 s run, against `e2.json` | 0 differences in F1, found, notes, heard-only recall, string-group recall, slaps, median onset error |
| the record's tables | sections 2 to 6 printed from the checker's scores | all match, except the Transkun crop (correction 1) |
| the vote | rebuilt from the raw `notes.csv` of n-03, n-02, n-04 and each run's `out.csv` (`bin/myvote.py`), not from labels | base 2-of-3: 0.952785 / 0.818182 / 0.924585, equal to N-E0's `e0.json` to six places; 174 votes (58 song-runs x 3 kinds): 0 differences; new-note counts 1 (0) / 32 (24) / 10 (4) |
| confidence sweep | 10 runs x 3 songs x 9 thresholds | 270 of 270 equal |
| no setting chosen on its own song | the run and the threshold picked together, on the other two songs only | gs_laux at 0.8 for every song, so the best standalone (0.601 / 0.383 / 0.394) holds out of sample |
| masks | `make_inputs.py` read | the keys give only `tuning_midi` and `capo`; pitch-mask geometry (+-35 ms; GOAT -50 to +60 ms) is the README's, fixed on GuitarSet |
| fl's onsets | unique onset times of `n-03/notes.csv` | 858 / 555 / 673, equal to the files |
| ledger | `/home/user/gtr/ledger/runs.jsonl` | 74 rows labelled E2 (r1348 to r1423; r1392 is another lane), all exit 0, 2 cores, `--threads 2`; 73 run logs match their row (label, wall, input file); 24 timing cells and all 73 run ids cited here match |
| reproducibility | two runs repeated through gtr-run | r1483 (capo gs_laux whole) and r1484 (tuning goat_laux whole): CSVs byte-identical to r1351 and r1367; r1483 took 14.94 s against 26.48 s, so timings vary about 2x with box load |
| capo mask | recount from `out.csv` | goat_laux 146 notes at frets 0-2, 84 right, 3 / 116 / 27 as stated |
| trajectories | cell counts and 20-step F1 from `trajectory.npz` and `out.csv` | all equal; contact sheets exist for all six |
| segments | the 30 s WAVs against the whole songs; the 30 s keys against step 2's | offsets 12.76 / 25.0 / 0.0 s exact (lag 0, correlation 1.0); same notes |
| handoff | `/home/user/gtv/notes/<S>/n2f-gs_laux*/` | columns onset, offset, pitch, support (1), conf; 786 / 615 / 434 notes; 0.601 / 0.383 / 0.394 (re-scorer 0.855 / 0.556 / 0.691); equal to their source runs; `source.json` hashes match |
| this file | read in full; checked against the private never-publish list | numbers only: no key notes, no tab text, no keys, no hosts, no never-publish name; E2 wrote nothing else into the repo |

**What I changed in this record** (copy of the earlier text:
`/home/user/notes/runs/check-n2f/backup/e2-noise2fret.md.before-checker`)

1. Section 2: Transkun's 30 s numbers (0.848 / 0.760 / 0.976) came from its own run on the 30 s file, not a crop. The
   crop columns now hold 0.898 / 0.790 / 0.976. No gate uses Transkun.
2. Section 2: the 100 ms tolerance moves gs_laux and goat_laux by at most 0.023, not 0.024. goat moves 0.025 on tuning.
3. Section 3: the largest range-mask gain (+0.009) is goat with librosa onsets. With fl's onsets it is +0.008.
4. Section 4: "26 runs" is the capo count. The votes cover 58 song-runs, 174 votes in all.
5. In short: `p_x0` barely moves only with gs_laux. With goat it grows 38 to 71 %.

**Notes**

- gs_laux's step-1 `p_xt` is bit-identical on all three songs (the same seeded noise on the same 1,292 rows), so the
  opening "every note at once" carries nothing from the recording. That supports section 6.
- The gate rows "any variant" take each song's best variant after seeing the scores. That favours Noise2Fret,
  so the "no" holds.
- The job's own report says "52 model runs". The ledger has 73 in r1350 to r1423 (67 one-step runs and 6 of 20
  steps), plus r1348, an earlier copy of capo seg30 gs_laux (5.84 s).
