# LADDER: the constraint ladder with a plain solver (E3)

E3 of `../sessions/LOOP.md`: how much each constraint buys when no Opus is involved. Second pass, 2026-11-27 (agent
e3-fix), after the reviewed brief and `LADDER-CHECK.md`. The capo is given everywhere (3 / 0 / 0). G = `/home/user/gtv`.
Every number is in `ladder.json`, built from each cell's own `cell.json` by `make_ladder_records.py`, which checked all
526 eval ids against the ledger (`G/loop/ledger/evals.jsonl`: subcommand, answer file and its SHA-256, value): 0
mismatches. Main number = the tab list on the recording's clock (same string and fret as the key, frets from each side's
capo, onset within 50 ms, same pitch, as a share of all key notes; `gtr-eval tab` on `answer.json`). **Heard** = the
same, as a share of the key notes whose conf is not "tab" (761 / 556 / 583 of 815 / 628 / 679), and "heard of matched" of
the matched ones among them. "(A)" marks ASSISTED rows (the key's notes, or windows made from its frets): ceilings, never
results. **FITTED** marks capo's rows with the kept weights, which were chosen on capo's key.

## What changed from the first pass

- **The wrong-tuning rung** is the brief's: nylon D G C F A D (38 43 48 53 57 62, both round-2 blind arms' answer in
  `G/blind/results.json`); on the steel songs the kit's lowest-note rule on chain-2's notes, read knowing the capo
  (`wrong_tuning.py`: the lowest recurring pitch is A#2 on capo, not below G2, the open 6th string with the capo, and E2
  on standard): both give the true tuning, so the rung is dropped there. The old cells (chain-1's tuning) are frozen in
  the table "First pass".
- **The tool window** is E1's development window, margin 1, 30 rows a second (`G/loop/hand/` is not published yet):
  capo and standard `final_m1_f30` (tracked), nylon `final2_m1_f30` (4 keyframes; its tool cells are new). Only capo's
  tool cells change (key 0.870 -> 0.876, chain-2 0.829 -> 0.833); standard's new file scores the same in every cell.
- **chain2f** uses the solver's own rule (`hand_filter.py` did not exist at 03:23 or 03:40 UTC). It removes no note on
  any song now (with v0 the first pass removed one invented note on standard), so chain2f equals chain2 everywhere.
- Added: the heard share; the start weights' rows on all songs; the kit arm on the list basis; a lock in `run_ladder.py`;
  `ladder_checks.py` (`G/loop/e3/checks.json`) for every count here that is not a cell's score; the records script types in no number.

## The solver, in plain words

`G/loop/tools/solver/solver.py` (README beside it; SHA-256 `a159359e...`, unchanged). Notes whose onsets lie within 35 ms
of a group's first note are one group; each group's notes go on different strings at frets 0 to 20 (from the capo), with
the hand's index finger at a fret h covering h to h+3, and a Viterbi picks the cheapest run. Costs: moving the hand,
height on the neck, stretching outside the four frets, open and still-ringing strings, and the window: a fretted note
outside the hand's reach is forbidden (hard) or charged per fret (soft). Open strings are always allowed; a lost hand
gives no constraint; a group no state can satisfy under hard falls back to soft and is counted. At most 0.191 s a cell.

## Weights: FITTED on the capo key

Set once by `tune_weights.py`: a coordinate search on one objective, the mean main number of four capo cells (key's and
chain-2's notes, hand off and tool window hard, the first pass's v0 window), scored in-process with gtr-eval's matching.
Start 0.7801, kept 0.8153 (`G/loop/e3/tune_capo.json`, `tune_capo_open_win.json`, `checks.json`).

| weight | tried | start | kept | why |
|---|---|---|---|---|
| move (per fret moved) | 0.05, 0.1, 0.2, 0.4, 0.8 | 0.2 | 0.4 | 0.05 in round 1 (0.7810), 0.2 (0.8111) and 0.4 (0.8126) in round 2; 0.8 lower (0.8095) |
| height (x mean fret) | 0, 0.02, 0.05, 0.1 | 0.02 | 0.1 | the largest gain, 0.7801 -> 0.8052 in round 1; 0 gave 0.7512 |
| span (per fret outside h..h+3) | 0.3, 0.6, 1.0, 2.0 | 0.6 | 1.0 | 0.8153 against 0.8126 at 0.6; 2.0 the same |
| ring (string still ringing) | 0, 0.15, 0.3, 0.6, 1.0 | 0.3 | 0 | 0.8052 -> 0.8107; 0.6 raised the key's cells (0.800, 0.875) but lowered the mean |
| open (per open string) | -0.3 .. 0.3 | 0 | 0 | every positive value lowered all four cells; -0.1 tied |
| win (soft, per fret outside) | 0.1 .. 2.0, then 3, 4, 8 | 0.5 | 2.0 | rises to 2.0 (key 0.8699, chain-2 0.8294) and stays there at 3, 4, 8 (e1220 to e1227) |
| open_win (open while fretted fits) | 0 .. 2 | 0 | 0 | 0.1 and up lowered the tool cells (key 0.870 -> 0.847 at 0.1) |
| drop (unplayable note) | 5 | 5 | 5 | never reached: 0 drops in every cell |

With chain-2's notes the fit is worth +0.087 (off) and +0.042 (tool) on capo, and -0.002 to +0.006 on the other two
songs, which it never saw (the start rows below). Standard and nylon are the out-of-sample numbers.

## The rungs

Notes: the key's (A), chain-2's (`G/experiments/<S>/chain-2/notes.csv`), chain2f (chain-2's after the hand filter).
Tuning: given, wrong (nylon only), finder (empty, for E2). Hand: off; tool (E1, margin 1); perfect (A: each bar's key
frets, one either side); ceiling (A: each onset group's own key frets); hard unless "soft". With the hand off the solver
writes AO-082's choosers' tab: paired by onset (3 ms) and pitch, its places equal chain-5's for 815 / 628 / 679 of
815 / 628 / 679 notes and chain-2's for 882 / 610 / 734 of 882 / 611 / 734.

## The ladder, per recording

### capo (Steal My Girl, capo 3)

Tool window (development): `G/loop/e1/capo/dev/final_m1_f30/hand_window.csv` (SHA-256 `607ab0cdfb10`); chain2f by the solver rule. Each cell: main / heard.

| notes, tuning, weights | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given, kept FITTED | 0.795 / 0.790 | 0.876 / 0.876 | 0.876 / 0.876 | 0.804 / 0.799 | 0.804 / 0.799 | 0.879 / 0.879 | 0.879 / 0.879 |
| key (A), given, start | 0.790 / 0.784 | 0.876 / 0.876 | 0.876 / 0.876 | 0.804 / 0.799 | 0.804 / 0.799 | 0.883 / 0.884 | 0.883 / 0.884 |
| chain2, given, kept FITTED | 0.767 / 0.770 | 0.833 / 0.841 | 0.833 / 0.841 | 0.774 / 0.778 | 0.774 / 0.778 | 0.836 / 0.844 | 0.836 / 0.844 |
| chain2, given, start | 0.680 / 0.678 | 0.791 / 0.798 | 0.791 / 0.798 | 0.761 / 0.763 | 0.761 / 0.763 | 0.816 / 0.823 | 0.816 / 0.823 |

| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|
| key-given-off (kept fitted) | 0.795 | 0.790 | 0.790 | 0.795 | 1.000 | 1.000 | 648 / 167 / 0 / 0 | e0668, e0669, e0670 |
| key-given-tool (kept fitted) | 0.876 | 0.876 | 0.876 | 0.876 | 1.000 | 1.000 | 714 / 101 / 0 / 0 | e0671, e0672, e0673 |
| chain2-given-off (kept fitted) | 0.767 | 0.770 | 0.797 | 0.800 | 0.958 | 0.920 | 625 / 156 / 34 / 101 | e0689, e0690, e0691 |
| chain2-given-tool (kept fitted) | 0.833 | 0.841 | 0.871 | 0.869 | 0.958 | 0.920 | 679 / 102 / 34 / 101 | e0692, e0693, e0694 |
| AO-082 chain-1, re-scored | 0.000 | 0.000 | 0.000 | 0.000 | 0.958 | 0.920 | 0 / 781 / 34 / 102 | e0779, e0780, e0781 |
| kit arm round 2 (c1), list re-scored | 0.945 | 0.962 | 0.973 | 0.965 | 0.979 | 0.919 | 770 / 28 / 17 / 123 | e0782, e0783, e0784 |
| kit arm round 2, GP5 (results.json) | 0.930 | | | 0.966 | | 0.904 | 758 / 27 / 30 / 136 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### nylon (slot tuning, D2 G2 C3 F3 A3 C4)

Tool window (development): `G/loop/e1/tuning/dev/final2_m1_f30/hand_window.csv` (SHA-256 `9e57bb85d2a9`); chain2f by the solver rule. Each cell: main / heard.

| notes, tuning, weights | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given, kept | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 |
| key (A), given, start | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 | 0.967 / 0.973 |
| key (A), wrong, kept | 0.780 / 0.779 | 0.780 / 0.779 | 0.780 / 0.779 | 0.780 / 0.779 | 0.780 / 0.779 | 0.780 / 0.779 | 0.780 / 0.779 |
| chain2, given, kept | 0.801 / 0.842 | 0.801 / 0.842 | 0.801 / 0.842 | 0.801 / 0.842 | 0.801 / 0.842 | 0.801 / 0.842 | 0.801 / 0.842 |
| chain2, given, start | 0.801 / 0.842 | 0.803 / 0.844 | 0.803 / 0.844 | 0.801 / 0.842 | 0.801 / 0.842 | 0.803 / 0.844 | 0.803 / 0.844 |
| chain2, wrong, kept | 0.619 / 0.640 | 0.619 / 0.640 | 0.619 / 0.640 | 0.619 / 0.640 | 0.619 / 0.640 | 0.619 / 0.640 | 0.619 / 0.640 |

| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|
| key-given-off (kept) | 0.967 | 0.973 | 0.973 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e0806, e0807, e0808 |
| key-given-tool (kept) | 0.967 | 0.973 | 0.973 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e0809, e0810, e0811 |
| chain2-given-off (kept) | 0.801 | 0.842 | 0.977 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e0848, e0849, e0850 |
| chain2-given-tool (kept) | 0.801 | 0.842 | 0.977 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e0851, e0852, e0853 |
| key-wrong-tool (kept) | 0.780 | 0.779 | 0.779 | 0.780 | 1.000 | 1.000 | 490 / 138 / 0 / 0 | e0830, e0831, e0832 |
| chain2-wrong-tool (kept) | 0.619 | 0.640 | 0.743 | 0.754 | 0.822 | 0.833 | 389 / 127 / 112 / 95 | e0872, e0873, e0874 |
| AO-082 chain-1, re-scored | 0.102 | 0.103 | 0.119 | 0.124 | 0.822 | 0.833 | 64 / 452 / 112 / 95 | e0980, e0981, e0982 |
| kit arm round 2 (c2), list re-scored | 0.659 | 0.683 | 0.763 | 0.774 | 0.852 | 0.850 | 414 / 121 / 93 / 96 | e0983, e0984, e0985 |
| kit arm round 2, GP5 (results.json) | 0.548 | | | 0.798 | | 0.688 | 344 / 87 / 197 / 193 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### standard (Imagine)

Tool window (development): `G/loop/e1/standard/dev/final_m1_f30/hand_window.csv` (SHA-256 `9e398c6895af`); chain2f by the solver rule. Each cell: main / heard.

| notes, tuning, weights | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given, kept | 0.892 / 0.889 | 0.915 / 0.913 | 0.913 / 0.911 | 0.892 / 0.889 | 0.892 / 0.889 | 0.919 / 0.918 | 0.919 / 0.918 |
| key (A), given, start | 0.894 / 0.894 | 0.918 / 0.916 | 0.916 / 0.914 | 0.897 / 0.894 | 0.897 / 0.894 | 0.922 / 0.921 | 0.922 / 0.921 |
| chain2, given, kept | 0.829 / 0.852 | 0.854 / 0.880 | 0.853 / 0.878 | 0.829 / 0.852 | 0.829 / 0.852 | 0.856 / 0.883 | 0.856 / 0.883 |
| chain2, given, start | 0.823 / 0.846 | 0.856 / 0.882 | 0.848 / 0.875 | 0.831 / 0.854 | 0.831 / 0.854 | 0.856 / 0.883 | 0.856 / 0.883 |

| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|
| key-given-off (kept) | 0.892 | 0.889 | 0.889 | 0.892 | 1.000 | 1.000 | 606 / 73 / 0 / 0 | e0996, e0997, e0998 |
| key-given-tool (kept) | 0.915 | 0.913 | 0.913 | 0.915 | 1.000 | 1.000 | 621 / 58 / 0 / 0 | e0999, e1000, e1001 |
| chain2-given-off (kept) | 0.829 | 0.852 | 0.894 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e1017, e1018, e1019 |
| chain2-given-tool (kept) | 0.854 | 0.880 | 0.923 | 0.921 | 0.928 | 0.892 | 580 / 50 / 49 / 104 | e1020, e1021, e1022 |
| AO-082 chain-1, re-scored | 0.829 | 0.852 | 0.894 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e1135, e1137, e1140 |
| kit arm round 2 (c3), list re-scored | 0.875 | 0.906 | 0.941 | 0.941 | 0.929 | 0.918 | 594 / 37 / 48 / 64 | e1142, e1144, e1146 |
| kit arm round 2, GP5 (results.json) | 0.865 | | | 0.941 | | 0.908 | 587 / 37 / 55 / 71 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### First pass: the old wrong rung (chain-1's tuning), frozen

| song, notes | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| capo, key (A) | 0.699 / 0.695 | 0.759 / 0.759 | 0.759 / 0.759 | 0.704 / 0.700 | 0.704 / 0.700 | 0.768 / 0.769 | 0.768 / 0.769 |
| capo, chain2 | 0.682 / 0.683 | 0.737 / 0.742 | 0.737 / 0.742 | 0.687 / 0.689 | 0.687 / 0.689 | 0.741 / 0.746 | 0.741 / 0.746 |
| nylon, key (A) | 0.107 / 0.102 | not run | not run | 0.107 / 0.102 | 0.107 / 0.102 | 0.107 / 0.102 | 0.107 / 0.102 |
| nylon, chain2 | 0.102 / 0.102 | not run | not run | 0.102 / 0.102 | 0.102 / 0.102 | 0.102 / 0.102 | 0.102 / 0.102 |
| standard, key (A) | 0.892 / 0.888 | 0.915 / 0.912 | 0.913 / 0.911 | 0.892 / 0.888 | 0.892 / 0.888 | 0.919 / 0.918 | 0.919 / 0.918 |
| standard, chain2 | 0.829 / 0.853 | 0.854 / 0.880 | 0.853 / 0.878 | 0.829 / 0.853 | 0.829 / 0.853 | 0.856 / 0.883 | 0.856 / 0.883 |

### What the window buys (tuning given; main number)

| song, notes, weights | tool - off | perfect - off (A) | ceiling - off (A) |
|---|---|---|---|
| capo, key (A), kept FITTED | +0.081 | +0.009 | +0.083 |
| capo, chain2, kept FITTED | +0.066 | +0.007 | +0.069 |
| capo, chain2, start | +0.112 | +0.081 | +0.136 |
| nylon, key (A), kept | +0.000 | +0.000 | +0.000 |
| nylon, chain2, kept | +0.000 | +0.000 | +0.000 |
| nylon, chain2, start | +0.002 | +0.000 | +0.002 |
| standard, key (A), kept | +0.022 | +0.000 | +0.026 |
| standard, chain2, kept | +0.025 | +0.000 | +0.026 |
| standard, chain2, start | +0.032 | +0.007 | +0.032 |

Chain-1's tuning: capo's string 6 a semitone low (39), nylon Drop D, standard standard (so equal to "given"); E1's v0
window on the steel songs, none on nylon. Frozen cells, with new heard evals of the same answers: `G/loop/e3/first-pass/`.

## Findings

- **The window adds +0.066 (capo, FITTED) and +0.025 (standard) with chain-2's notes, tuning given; +0.112 / +0.032 with
  the start weights; on nylon 0.000 (+0.002 start).** The tool window comes within 0.0025 / 0.0015 of the ceiling and
  beats the bar-wide perfect window by 0.059 / 0.025: at the key's fretted onsets it is about as wide (mean 5.51 / 3.80 /
  4.69 frets against 6.04 / 3.35 / 5.25) but follows the hand inside the bar (coverage 0.9964 / 1.000 / 0.9982 where the
  hand is known). On capo it leaves 2 wrong places where both solver and player fretted (key's notes; 68 with the hand
  off, 61 with the perfect window).
- **What no fret window fixes.** With the tool window and the key's notes, 99 of 101 wrong places on capo, 54 of 58 on
  standard and 21 of 21 on nylon are an open string where the player fretted the same pitch (chain-2's notes: 99 of 102,
  48 of 50, 13 of 13); the ceiling leaves 99 / 55 / 21. A fret window cannot see whether a string is pressed, and
  charging open strings (`open_win`) lowered every window cell. That is the whole gap on nylon (the key's notes reach
  0.967 with any window or none): it needs the fingers, string by string (E4's frames, or a per-string tracker).
- **The new wrong rung (nylon, string 1 a whole tone high)** costs 0.186 with the key's notes (0.967 -> 0.780) and 0.182
  with chain-2's (0.801 -> 0.619), under every window. With the key's notes it moves all 129 matched C4 (114 on the open
  1st string and 15 at string 2 fret 3 in the key) to string 2 fret 3, and all 18 D4 (string 1 fret 2) to the open 1st
  string (`checks.json`, `nylon_string1`). No window tells: fret 3 is in the hand's reach near the nut; the hard rule fails
  in 6 groups of chain-2's notes against 0 under the true tuning, and in none with the key's (the first pass's Drop D
  failed the ceiling in 82). E2 must settle string 1 from the fingers at the C4 and D4 onsets, as the brief says.
- **Heard notes.** With chain-2's notes the heard share is above the main number on every song (tool, given: 0.841 /
  0.842 / 0.880 against 0.833 / 0.801 / 0.854): the note model finds 735 of 761, 479 of 556 and 556 of 583 heard key
  notes (0.966 / 0.862 / 0.954) against 0.958 / 0.822 / 0.928 of all, so it misses the "tab"-only notes most, by far on
  nylon. With the key's notes the two shares differ by at most 0.006 (nylon 0.967 / 0.973).
- **Against Opus, on one basis (the tab list).** The round-2 kit arm, re-scored here as `G/blind/results.json` has it
  (protocol): main 0.945 / 0.659 / 0.875, of matched 0.965 / 0.774 / 0.941, onset F1 0.919 / 0.850 / 0.918, heard 0.962 /
  0.683 / 0.906. The solver (chain-2's notes, true tuning, tool window): 0.833 / 0.801 / 0.854, of matched 0.869 / 0.975
  / 0.921, onset F1 0.920 / 0.833 / 0.892, heard 0.841 / 0.842 / 0.880. With notes about level on the steel songs, the
  kit arm's reading of frames places 0.965 against 0.869 on capo (FITTED; 0.826 with the start weights) and 0.941 against
  0.921 on standard. On nylon it used D G C F A D: on that tuning the solver reads 0.619 (of matched 0.754) against its
  0.659 (0.774). GP5 numbers (AO-082's main number) only in the rows marked GP5.
- **Hard against soft.** Soft at 2.0 behaves as hard: 9 of 9 pairs on capo and 18 of 18 on nylon score the same; on
  standard 3 of 9 differ, soft lower by at most 0.0015 (one note). No tool cell with the tuning given fell back to soft
  under hard; the ceiling (A) cannot be met by chain-2's notes in 4 / 21 / 35 groups. No cell dropped a note.
- **The plan's rule** (LOOP.md E3: "If the window adds under 0.01 on both steel songs with the tuning given, E4's hand-off
  rung runs on the nylon song only"): +0.066 / +0.025 (+0.112 / +0.032 start). **It does not fire: L4 runs on all three.**

## Not run, and left empty

- **Tuning "finder":** all cells, for the orchestrator (E2 is running): `run_ladder.py` runs them once
  `G/loop/e3/<S>/inputs/finder_tuning.json` (`{"tuning_midi": [...], "source": "..."}`) exists.
- **E1's published windows and `hand_filter.py`:** absent at run time. Then `run_ladder.py` re-runs exactly the cells
  whose window or filtered notes changed (SHA-256 in `cell.json`, `inputs/chain2f_*.csv.json`); remake the records.

## Files

Tools: `G/loop/tools/solver/` (`solver.py`, `README.md`, `run_ladder.py`, `wrong_tuning.py`, `ladder_checks.py`,
`make_ladder_records.py`, `key_windows.py`, `tune_weights.py`). Cells: `G/loop/e3/<S>/<cell>/` and `startw/<cell>/`
(answer, command, solver stats, three scores, `cell.json`); inputs (key and heard key notes, the wrong rung's evidence,
chain2f) in `inputs/`; fixed points (chains 5, 2, 1, kit arm) in `fixed/`; the first pass in `G/loop/e3/first-pass/`.
Runs: gtr-run r1340 (the ladder, 534.7 s on 2 cores), r1344 (the checks). Remake, in that folder:
`G/tools/venv-torch/bin/python run_ladder.py`, `/home/user/gtr/eval/venv/bin/python ladder_checks.py`,
`python3 make_ladder_records.py <ladder.json> <tables.md>`.
