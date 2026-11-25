# Step 2. Sound to notes (n-*), on the three recordings

Agent exp-notes, 2026-11-25. Every number below is read from a file under `/home/user/gtv/experiments/<S>/<exp>/`:
`score_notes.json` (gtr-eval 0.12.1 `notes --chroma`, eval id in `result.json` / `score_notes.err`), `breakdown.json`
(per 10 s, by pitch range, by string group; its `n_matched` is asserted equal to gtr-eval's for every run),
`labels.json` (each truth note hit/missed, each estimated note hit/invented), `invented_vs_taps.json`,
`result.json` (result.py). Scripts: `/home/user/gtv/work/exp-notes/bin/` (`run_local.sh`, `run_ymt3.sh`,
`join_ymt3.py`, `run_transkun*.sh`, `run_api_b.sh`, `score_one.sh`, `breakdown.py`, `seg30_all.sh`,
`taps_invented.py`, `film_stretch.py`, `collect.py`). Per-10-s rows for every run: `step-02-notes-windows.csv` (next
to this file). Matching: onset within 50 ms and pitch within 50 cents, offsets ignored, unless stated. Truth: the
whole of each song (scored_range = the whole file in all three); 30 s segment truths cropped with `crop_truth.py`
(`/home/user/gtv/work/exp-notes/truth/`). Invented = an estimated note matched to no truth note; missed = a truth
note matched by no estimated note.

## Runs (scope, wall-clock on the box, gtr-run run id; 2 cores unless stated)

| exp | tool | capo | tuning | standard | scope |
|---|---|---|---|---|---|
| n-01 | Basic Pitch 0.4.0 (tflite), no hint | 14.6 s r0781 | 13.1 s r0795 | 11.0 s r0834 | whole song |
| n-01-hint | same, `--minimum/--maximum-frequency` from the true tuning + capo (capo 95.1-1244.5 Hz, tuning 71.2-830.6, standard 79.9-1046.5: lowest open string -3 %, top string + 20 frets) | 15.2 s r0782 | 11.5 s r0826 | 11.5 s r0835 | whole song |
| n-02 | guitar-gaps.pth | 143.9 s r0788 | 110.9 s r0831 | 105.4 s r0838 | whole song (mono) |
| n-03 | guitar-fl.pth | 155.8 s r0794 | 102.1 s r0833 | 110.4 s r0847 | whole song (mono) |
| n-04 (B) | Transkun 2.0.1 | 159.7 s r0875 | 181.3 s r0891 | 185.2 s r0897 | whole song; also run on the segment WAV: 55.3 s r0855, 38.6 s r0859, 38.7 s r0860 |
| n-05 | YourMT3+ CPU Space (bd69fbac) | 340.6 s | 252.4 s | 254.0 s | whole song as 30 s pieces without overlap (8/7/6 calls, all ok; notes cut at piece ends); time = sum of the calls (remote CPU) |
| n-08 (B) | MiMo v2.6 Flash via Vercel AI Gateway | 32.2 s r0799, $0.00027 | 44.5 s r0820, $0.00066 | 130.8 s r0828, $0.00163 | 30 s segment (mono) |
| n-08-hint (B) | same, true tuning and capo appended to the prompt (`work/exp-notes/notes_prompt_hint_<S>.txt`) | 70.7 s r0844, $0.00088 | 41.1 s r0822, $0.00051 | 64.5 s r0846, $0.00083 | 30 s segment |

Not run: n-06, n-07, n-09 (priority C). Transkun took 160-185 s per whole song here, not the 19 min the plan estimated.
Hints: Basic Pitch takes a frequency range, MiMo a prompt; the guitar models, Transkun and the YourMT3+ Space take no
tuning, capo, range or tempo, so they have no -hint run.

## What failed

- n-08-hint, capo and standard, first try: `ProxyError('Unable to connect to proxy', RemoteDisconnected('Remote end
  closed connection without response'))` after 301 s (capo r0812, standard r0836). The second try of each ran (r0844,
  r0846); those are the results.
- `join_ymt3.py` crashed once writing `pieces.json` (numpy int64 in JSON) after the MIDI was written; fixed and rerun; the
  joined MIDIs' SHA-256 still equal the ones gtr-eval recorded in `score_notes.json`. Nothing was refused by the permission system.
- YourMT3+ returns several instruments (capo: Acoustic Piano 65 notes, Guitar 945, Drums 65; tuning: Guitar 673, Bass
  10, Singing Voice 2; standard: Piano 7, Electric Piano 5, Guitar 870, Guitar dist. 2, Drums 21; `n-05/join.log`).
  The tables pool every non-drum track (gtr-eval default). Guitar programs only (`--midi-programs 24-31`,
  `n-05/score_notes_guitar_programs.json`): capo 0.827 (e2042), tuning 0.732 (e2043), standard 0.774 (e2044).

## Scores

**Onset F1 (precision / recall), whole songs, 50 ms / 50 cents, gtr-eval eval id**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 Basic Pitch | **0.689** (0.537 / 0.960) e1985 | **0.626** (0.562 / 0.705) e2053 | **0.656** (0.536 / 0.846) e2070 |
| n-01-hint Basic Pitch + freq. range hint | **0.709** (0.562 / 0.960) e1986 | **0.627** (0.565 / 0.705) e2057 | **0.657** (0.537 / 0.846) e2071 |
| n-02 guitar-gaps.pth | **0.919** (0.876 / 0.966) e1987 | **0.830** (0.837 / 0.823) e2062 | **0.869** (0.881 / 0.857) e2072 |
| n-03 guitar-fl.pth | **0.920** (0.884 / 0.958) e2052 | **0.796** (0.846 / 0.752) e2066 | **0.882** (0.847 / 0.920) e2074 |
| n-04 Transkun (piano model) | **0.896** (0.889 / 0.903) e2198 | **0.785** (0.810 / 0.761) e2199 | **0.865** (0.926 / 0.812) e2200 |
| n-05 YourMT3+ CPU Space | **0.803** (0.726 / 0.899) e2039 | **0.731** (0.701 / 0.764) e2040 | **0.768** (0.678 / 0.886) e2041 |

**Found / missed / invented notes (truth notes: capo 815, tuning 628, standard 676)**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 | 782 / 33 / 674 (est 1456) | 443 / 185 / 345 (est 788) | 572 / 104 / 495 (est 1067) |
| n-01-hint | 782 / 33 / 610 (est 1392) | 443 / 185 / 341 (est 784) | 572 / 104 / 494 (est 1066) |
| n-02 | 787 / 28 / 111 (est 898) | 517 / 111 / 101 (est 618) | 579 / 97 / 78 (est 657) |
| n-03 | 781 / 34 / 102 (est 883) | 472 / 156 / 86 (est 558) | 622 / 54 / 112 (est 734) |
| n-04 | 736 / 79 / 92 (est 828) | 478 / 150 / 112 (est 590) | 552 / 128 / 44 (est 596) |
| n-05 | 733 / 82 / 277 (est 1010) | 480 / 148 / 205 (est 685) | 599 / 77 / 285 (est 884) |

**Onset+offset F1 / pitch-class-only onset F1 / median onset error of found notes (est - truth). Truth offsets are let-ring estimates, not measured**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 | 0.302 / 0.691 / -15 ms | 0.177 / 0.637 / -21 ms | 0.343 / 0.674 / 3 ms |
| n-01-hint | 0.311 / 0.711 / -15 ms | 0.177 / 0.639 / -21 ms | 0.343 / 0.674 / 3 ms |
| n-02 | 0.407 / 0.922 / -19 ms | 0.382 / 0.831 / -30 ms | 0.470 / 0.875 / -1 ms |
| n-03 | 0.523 / 0.923 / -20 ms | 0.293 / 0.798 / -30 ms | 0.562 / 0.891 / -0 ms |
| n-04 | 0.237 / 0.900 / -21 ms | 0.146 / 0.787 / -27 ms | 0.417 / 0.868 / -4 ms |
| n-05 | 0.457 / 0.808 / -12 ms | 0.321 / 0.736 / -27 ms | 0.488 / 0.779 / -2 ms |

**By pitch range: onset F1 below / at-or-above the sounding open 3rd string (MIDI split capo 58, tuning 53, standard 55); m = missed, i = invented**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 | 0.463 (11m 418i) / 0.811 (22m 256i) | 0.451 (66m 204i) / 0.719 (119m 141i) | 0.580 (42m 338i) / 0.739 (62m 157i) |
| n-01-hint | 0.503 (11m 355i) / 0.812 (22m 255i) | 0.451 (66m 204i) / 0.722 (119m 137i) | 0.580 (42m 338i) / 0.740 (62m 156i) |
| n-02 | 0.844 (6m 64i) / 0.945 (22m 47i) | 0.816 (35m 29i) / 0.835 (76m 72i) | 0.887 (30m 40i) / 0.853 (67m 38i) |
| n-03 | 0.897 (14m 28i) / 0.927 (20m 74i) | 0.809 (48m 13i) / 0.791 (108m 73i) | 0.865 (20m 69i) / 0.898 (34m 43i) |
| n-04 | 0.848 (32m 27i) / 0.911 (47m 65i) | 0.782 (48m 24i) / 0.786 (102m 88i) | 0.876 (54m 18i) / 0.856 (74m 26i) |
| n-05 | 0.625 (53m 119i) / 0.863 (29m 158i) | 0.670 (56m 63i) / 0.754 (92m 142i) | 0.704 (25m 210i) / 0.834 (52m 75i) |

**Recall by the truth note's string: strings 6-4 / strings 3-1**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 | 0.913 (272/298) / 0.987 (510/517) | 0.627 (111/177) / 0.736 (332/451) | 0.865 (268/310) / 0.831 (304/366) |
| n-01-hint | 0.913 (272/298) / 0.987 (510/517) | 0.627 (111/177) / 0.736 (332/451) | 0.865 (268/310) / 0.831 (304/366) |
| n-02 | 0.973 (290/298) / 0.961 (497/517) | 0.802 (142/177) / 0.832 (375/451) | 0.903 (280/310) / 0.817 (299/366) |
| n-03 | 0.926 (276/298) / 0.977 (505/517) | 0.729 (129/177) / 0.760 (343/451) | 0.935 (290/310) / 0.907 (332/366) |
| n-04 | 0.879 (262/298) / 0.917 (474/517) | 0.729 (129/177) / 0.774 (349/451) | 0.829 (261/315) / 0.797 (291/365) |
| n-05 | 0.799 (238/298) / 0.957 (495/517) | 0.684 (121/177) / 0.796 (359/451) | 0.919 (285/310) / 0.858 (314/366) |

**Recall by truth voice melody / bass / chord; recall on truth notes confirmed in the audio (conf not `tab`)**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 | 0.962 / 0.950 / 0.975; heard-only 0.967 | 0.773 / 0.629 / 0.578; heard-only 0.752 | 0.826 / 0.884 / 0.800; heard-only 0.880 |
| n-01-hint | 0.962 / 0.950 / 0.975; heard-only 0.967 | 0.773 / 0.629 / 0.578; heard-only 0.752 | 0.826 / 0.884 / 0.800; heard-only 0.880 |
| n-02 | 0.963 / 0.970 / 0.975; heard-only 0.975 | 0.885 / 0.928 / 0.592; heard-only 0.865 | 0.810 / 0.920 / 0.824; heard-only 0.898 |
| n-03 | 0.967 / 0.931 / 0.975; heard-only 0.966 | 0.797 / 0.804 / 0.599; heard-only 0.813 | 0.902 / 0.949 / 0.894; heard-only 0.951 |
| n-04 | 0.916 / 0.871 / 0.875; heard-only 0.929 | 0.818 / 0.753 / 0.619; heard-only 0.811 | 0.796 / 0.858 / 0.731; heard-only 0.848 |
| n-05 | 0.955 / 0.748 / 0.875; heard-only 0.905 | 0.846 / 0.711 / 0.585; heard-only 0.795 | 0.861 / 0.924 / 0.859; heard-only 0.906 |

**30 s segment (capo 12.76-42.76 s, tuning 25-55 s, standard 0-30 s of the song WAV): onset F1, found/missed/invented, eval id. n-04, n-08: run on the segment WAV; the others: the whole-song estimate cropped**

| technique | capo | tuning | standard |
|---|---|---|---|
| n-01 Basic Pitch | **0.674** 93/9/81 e2075 | **0.659** 82/24/61 e2080 | **0.738** 120/5/80 e2085 |
| n-01-hint Basic Pitch + freq. range hint | **0.689** 93/9/75 e2076 | **0.659** 82/24/61 e2081 | **0.741** 120/5/79 e2086 |
| n-02 guitar-gaps.pth | **0.922** 101/1/16 e2077 | **0.807** 88/18/24 e2082 | **0.984** 122/3/1 e2087 |
| n-03 guitar-fl.pth | **0.941** 96/6/6 e2078 | **0.783** 81/25/20 e2083 | **0.980** 124/1/4 e2088 |
| n-04 Transkun (piano model) | **0.848** 89/13/19 e2090 | **0.760** 79/27/23 e2091 | **0.968** 121/4/4 e2092 |
| n-05 YourMT3+ CPU Space | **0.777** 94/8/46 e2079 | **0.678** 81/25/52 e2084 | **0.916** 120/5/17 e2089 |
| n-08 MiMo v2.6 Flash | **0.000** 0/102/30 e2045 | **0.021** 2/104/80 e2047 | **0.042** 7/118/199 e2049 |
| n-08-hint MiMo v2.6 Flash + tuning/capo in prompt | **0.010** 1/101/107 e2046 | **0.012** 1/105/56 e2048 | **0.000** 0/125/107 e2051 |

**capo: onset F1 x 100 per 10 s (column = window start, s)**

| technique | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 | 160 | 170 | 180 | 190 | 200 | 210 | 220 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| truth notes | 34 | 30 | 36 | 34 | 33 | 27 | 41 | 42 | 37 | 38 | 34 | 29 | 32 | 40 | 40 | 37 | 29 | 44 | 48 | 41 | 36 | 37 | 16 |
| n-01 | 76 | 69 | 69 | 69 | 66 | 68 | 76 | 68 | 63 | 67 | 68 | 68 | 67 | 76 | 67 | 63 | 77 | 74 | 76 | 64 | 65 | 61 | 71 |
| n-01-hint | 76 | 71 | 70 | 71 | 69 | 70 | 79 | 71 | 64 | 69 | 70 | 72 | 70 | 79 | 71 | 64 | 77 | 75 | 77 | 68 | 66 | 63 | 73 |
| n-02 | 100 | 97 | 94 | 91 | 92 | 95 | 89 | 86 | 90 | 88 | 96 | 88 | 95 | 89 | 87 | 90 | 98 | 93 | 96 | 87 | 91 | 92 | 97 |
| n-03 | 100 | 98 | 95 | 94 | 94 | 93 | 95 | 86 | 96 | 91 | 91 | 98 | 92 | 95 | 87 | 91 | 98 | 93 | 94 | 87 | 92 | 89 | 62 |
| n-04 | 99 | 88 | 93 | 94 | 91 | 87 | 90 | 90 | 84 | 87 | 96 | 87 | 90 | 92 | 85 | 91 | 97 | 84 | 94 | 85 | 88 | 85 | 86 |
| n-05 | 86 | 81 | 85 | 81 | 69 | 84 | 92 | 79 | 60 | 61 | 77 | 71 | 85 | 90 | 86 | 78 | 96 | 94 | 94 | 83 | 68 | 82 | 91 |

**tuning: onset F1 x 100 per 10 s (column = window start, s)**

| technique | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 | 160 | 170 | 180 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| truth notes | 31 | 34 | 35 | 37 | 37 | 34 | 35 | 36 | 37 | 33 | 37 | 36 | 37 | 35 | 35 | 37 | 37 | 25 | 0 |
| n-01 | 69 | 70 | 68 | 68 | 67 | 58 | 59 | 75 | 65 | 56 | 61 | 51 | 62 | 59 | 60 | 65 | 60 | 60 | - |
| n-01-hint | 69 | 70 | 68 | 68 | 67 | 58 | 59 | 76 | 65 | 56 | 61 | 51 | 62 | 60 | 61 | 65 | 60 | 60 | - |
| n-02 | 87 | 91 | 91 | 81 | 84 | 67 | 90 | 88 | 90 | 80 | 83 | 70 | 73 | 83 | 81 | 88 | 81 | 92 | - |
| n-03 | 84 | 84 | 83 | 77 | 77 | 76 | 84 | 76 | 91 | 76 | 81 | 60 | 74 | 81 | 76 | 85 | 81 | 90 | - |
| n-04 | 84 | 88 | 87 | 77 | 79 | 77 | 81 | 78 | 88 | 72 | 76 | 66 | 68 | 70 | 76 | 83 | 82 | 84 | - |
| n-05 | 80 | 82 | 79 | 69 | 63 | 71 | 82 | 84 | 82 | 69 | 72 | 67 | 64 | 68 | 64 | 75 | 72 | 84 | - |

**standard: onset F1 x 100 per 10 s (column = window start, s)**

| technique | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 | 140 | 150 | 160 | 170 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| truth notes | 46 | 40 | 39 | 34 | 30 | 42 | 37 | 34 | 30 | 45 | 43 | 40 | 43 | 34 | 31 | 43 | 42 | 23 |
| n-01 | 69 | 78 | 75 | 66 | 51 | 66 | 71 | 67 | 65 | 62 | 69 | 65 | 61 | 58 | 58 | 64 | 68 | 61 |
| n-01-hint | 69 | 78 | 76 | 66 | 51 | 66 | 71 | 67 | 65 | 62 | 69 | 65 | 61 | 58 | 58 | 64 | 68 | 61 |
| n-02 | 99 | 99 | 97 | 86 | 75 | 84 | 92 | 76 | 81 | 92 | 85 | 88 | 88 | 83 | 77 | 86 | 84 | 81 |
| n-03 | 97 | 99 | 99 | 85 | 86 | 87 | 95 | 82 | 80 | 92 | 89 | 84 | 86 | 84 | 75 | 87 | 90 | 81 |
| n-04 | 93 | 100 | 99 | 89 | 85 | 90 | 94 | 85 | 84 | 80 | 78 | 86 | 94 | 92 | 72 | 69 | 82 | 68 |
| n-05 | 93 | 89 | 92 | 78 | 92 | 72 | 78 | 69 | 80 | 82 | 76 | 78 | 63 | 71 | 67 | 71 | 69 | 72 |

**Invented notes that start within 50 ms of a truth percussive event (thumb slap on the strings, wrist thump, body
slap; `invented_vs_taps.json`); tuning has no percussion (0 events)**

| technique | capo (258 events) | standard (211 events) | capo: invented below G2, the lowest playable note with capo 3 |
|---|---|---|---|
| n-01 | 240 of 674 | 156 of 495 | 71 |
| n-01-hint | 207 of 610 | 156 of 494 | 8 |
| n-02 | 64 of 111 | 51 of 78 | 9 |
| n-03 | 59 of 102 | 72 of 112 | 1 |
| n-04 | 14 of 92 | 16 of 44 | 6 |
| n-05 | 94 of 277 | 179 of 285 | 8 |

## Truth notes that bear on these scores

- standard: all four whole-song tools of n-01/02/03/05 put a note, within 25 ms, at each of the 6 played notes and the
  2 wrong pitches (#196 51.65 s, #464 121.19 s: E3 played, G3 in the truth) that `truth-standard-check.md` lists
  under "PROBLEMS (second check)"; the truth file does not have them fixed. Up to 8 invented and 1-2 missed per tool on
  `standard` are truth errors (about 1.2 % of 676). Evidence table: `/home/user/gtv/work/exp-notes/TRUTH-DOUBTS.md`.
  Scores above are against the file as it stands.
- tuning: 92 of 106 segment notes and 556 of 628 whole-song notes (`n-02/breakdown.json` `truth_conf`) are confirmed in the audio (conf not `tab`); the
  recall on those alone is the "heard-only" column above, as `truth-tuning-check.md` asks.
- Offsets in all three truths are let-ring estimates (next attack on the string - 10 ms), so onset+offset F1 measures
  agreement with that rule, not a measured note end.

## For the film

Stretches chosen by `film_stretch.py` (`/home/user/gtv/work/exp-notes/film_stretch.json`): the 20 s, in 1 s steps
over all three songs, with the most of both found and wrong notes (largest min(found, missed + invented)). Times are
on the song WAV's timeline (`/home/user/gtv/songs/<S>/<S>.wav`; video time = WAV time + 17.992 s for capo, + 20.992 s
for standard, + 0 for tuning, per the truth records). For every stretch, show: the truth notes
(`/home/user/gtv/truth/<S>/<S>.notes.csv`) against the tool's `notes.csv`, coloured from `labels.json` (truth
`missed` vs estimate `invented`, `hit` on both sides); play: the tool's `render.wav` (FluidSynth, steel program 25,
nylon 24 for tuning; time 0 = WAV time 0) over the same seconds, then the recording. All files under
`/home/user/gtv/experiments/<S>/<exp>/`.

| exp | song, seconds | in the stretch: found / missed / invented | what the numbers settle | for the ear or eye |
|---|---|---|---|---|
| n-01 | capo 184-204 s | 81 / 3 / 83 | whole song: 782 of 815 truth notes found, 674 invented; 240 invented start within 50 ms of a slap or thump; 71 invented lie below G2 (capo 3) | whether the invented notes sound like the slaps they sit on, or like wrong notes |
| n-01-hint | capo 60-80 s | 81 / 2 / 52 | the range hint removes invented notes (here 62 -> 52; whole capo song 674 -> 610, below-G2 71 -> 8) and finds the same 782 notes; on tuning and standard F1 moves by 0.002 and 0.0004 | the same 20 s rendered with and without the hint (n-01/render.wav, n-01-hint/render.wav) |
| n-02 | tuning 111-131 s | 52 / 21 / 24 | best tuning F1 (0.830); 2 truth notes inside this stretch (#397 113.192, #435 123.745 s) are named as doubtful in truth-tuning-check.md | whether the missed notes are audible in the recording's rolled chords |
| n-03 | tuning 107-127 s | 46 / 28 / 17 | tuning F1 0.796 vs 0.920 / 0.882 on the steel-string songs; inside this stretch truth-tuning-check.md names #386 110.405, #397 113.192 and #435 123.745 s as doubtful | whether the render keeps the piece's line |
| n-04 | tuning 110-130 s | 48 / 25 / 23 | a piano model: tuning F1 0.785, onset+offset F1 0.146 (lowest of the six whole-song runs on tuning); truth-tuning-check.md names #386, #397 and #435 inside this stretch as doubtful | the render's note lengths against the ringing nylon strings |
| n-05 | standard 120-140 s | 70 / 7 / 64 | standard: 285 invented, 179 of them within 50 ms of a slap or thump; extra instruments returned (piano, drums) | whether the invented notes at the slaps are audible as pitches |
| n-08 | standard 0.0-20.0 s | 4 / 82 / 131 | 4 of 86 truth notes found, 131 invented; segment F1 0.042 | the render against the recording: whether any of the piece survives |
| n-08-hint | standard 2.0-22.0 s | 0 / 87 / 83 | with the tuning and capo in the prompt: 0 of 87 found; segment F1 0.0 (no hint 0.042) | as n-08 |

n-08 and n-08-hint ran on the segment only; their `render.wav` and `labels.json` are on the segment timeline, which
for standard starts at WAV 0 s, so the times above apply as written. Hit/missed/invented counts and F1 are settled by
the truth (numbers); how close a render sounds to the piece is for the viewer's ear.
