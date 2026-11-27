# LADDER: the constraint ladder with a plain solver (E3)

E3 of `../sessions/LOOP.md`: how much each constraint buys when no Opus is involved. Second pass 2026-11-27 (agent
e3-fix), refreshed the same day by e3-refresh once E1 had published its windows and hand filter and E2 its tuning
finder, with the six problems of `LADDER-CHECK2.md` fixed and held-out rows added. The capo is given everywhere (3 / 0 / 0;
held out 1 / 2 / 0). G = `/home/user/gtv`. Every number is in `ladder.json`, built from each cell's own `cell.json` by
`make_ladder_records.py`, which checked all 825 eval ids against the ledger (`G/loop/ledger/evals.jsonl`: subcommand,
answer file and its SHA-256, value): 0 mismatches. Every table value is printed from full precision. Main number = the
tab list on the recording's clock (same string and fret as the key, frets from each side's capo, onset within 50 ms, same
pitch, as a share of all key notes; `gtr-eval tab` on `answer.json`). **Heard** = the same, as a share of the key notes
whose conf is not "tab" (761 / 556 / 583 of 815 / 628 / 679), and "heard of matched" of the matched ones among them.
"(A)" marks ASSISTED rows (the key's notes, or windows made from its frets): ceilings, never results. **FITTED** marks
capo's rows with the kept weights, which were chosen on capo's key.

## What changed in this refresh

- **The tool window is E1's published one** (HAND.md's default: after Opus's blind check, margin 1, 30 rows a second,
  hard; `G/loop/hand/<S>/hand_window.csv`, the same files as `hand/<S>/` here) in every tool cell, in place of E1's
  development window. Only capo's tool cells move (key's notes 0.876 -> 0.872, chain-2's 0.833 -> 0.832, FITTED); every
  standard and nylon cell scores as before. The second pass is frozen in `G/loop/e3/second-pass/` and compared below.
- **chain2f uses the published `hand_filter.py`** (`G/loop/tools/handreach/`, the same file as `hand/hand_filter.py`
  here) with that window and each cell's tuning. With the tuning given (or the finder's) it removes no note of chain-2's
  on any song, so chain2f equals chain2 there; under capo's wrong rung it removes 1, an invented note.
- **The finder rung is filled** from E2's own answers, never the key: `G/loop/e2/finder-answer.json`, each song's
  "everything" run's `tuning.json` (SHA-256 checked), written to `G/loop/e3/<S>/inputs/finder_tuning.json`. It equals the
  given tuning on all three songs, and each of its 21 cells per song has the given cell's answer byte for byte.
- **Capo has a wrong rung again** (problem 1). The rung's rule is the reviewed brief's as STATE.md's 01:45 UTC entry
  records it (c608fa84): nylon D G C F A D, both round-2 blind arms' answer; steel the kit's lowest-note rule read knowing
  the capo (`wrong_tuning.py`). The copy of `sessions/LOOP.md` on this box (00:53) still names chain-1's tuning for this
  rung. On chain-2's notes the rule gives the true tuning on both steel songs (capo: the lowest recurring note is A#2, not
  below G2, the open 6th string with the capo; standard: E2). On AO-082's own lowest-note inputs it does not on capo: 39
  (D#2) from t-02-hint's notes (n-01-hint) and 36 (C2) from t-02's (n-01), as `G/loop/e3/capo/inputs/wrong_tuning.json`
  shows. So where chain-2's notes give the true tuning, the rung now takes t-02-hint's: 39 on capo, which is also the
  first pass's frozen capo rung and t-02's sound-only answer in `E2-TUNING.md` (capo 5 of 6, D#2). Standard gives E2 from
  every note set, so its rung stays dropped.
- **Held out**: the solver alone on Closer, September and Boats with the frozen method's inputs (section below).
- Fixes: tables print from full precision (21 cells were 0.001 off); FITTED on every capo number with the kept weights;
  one lock, `e3lock.py` (opened for appending, emptied only once held), taken by `run_ladder.py`, `run_heldout.py`,
  `ladder_checks.py` and `make_ladder_records.py`; `ladder_checks.py` keeps a soft-window eval id when the answer comes
  out byte for byte the same (no more duplicate ledger lines).

## The solver, in plain words

`G/loop/tools/solver/solver.py` (README beside it; SHA-256 `a159359e...`, unchanged). Notes whose onsets lie within 35 ms
of a group's first note are one group; each group's notes go on different strings at frets 0 to 20 (from the capo), with
the hand's index finger at a fret h covering h to h+3, and a Viterbi picks the cheapest run. Costs: moving the hand,
height on the neck, stretching outside the four frets, open and still-ringing strings, and the window: a fretted note
outside the hand's reach is forbidden (hard) or charged per fret (soft). Open strings are always allowed; a lost hand
gives no constraint; a group no state can satisfy under hard falls back to soft and is counted. At most 0.207 s a cell.

## Weights: FITTED on the capo key

Set once by `tune_weights.py`: a coordinate search on one objective, the mean main number of four capo cells (key's and
chain-2's notes, hand off and tool window hard, the first pass's v0 window), scored in-process with gtr-eval's matching.
Start 0.7801, kept 0.8153 (`G/loop/e3/tune_capo.json`, `tune_capo_open_win.json`, `checks.json`).

| weight | tried | start | kept | why |
|---|---|---|---|---|
| move (per fret moved) | 0.05, 0.1, 0.2, 0.4, 0.8 | 0.2 | 0.4 | 0.05 in round 1 (0.7810), 0.2 (0.8111) and 0.4 (0.8126) in round 2; 0.8 lower (0.8095) |
| height (x mean fret) | 0, 0.02, 0.05, 0.1 | 0.02 | 0.1 | the largest gain, 0.7810 -> 0.8052 in round 1 (after move 0.05); 0 gave 0.7512 |
| span (per fret outside h..h+3) | 0.3, 0.6, 1.0, 2.0 | 0.6 | 1.0 | 0.8153 against 0.8126 at 0.6; 2.0 the same |
| ring (string still ringing) | 0, 0.15, 0.3, 0.6, 1.0 | 0.3 | 0 | 0.8052 -> 0.8107; 0.6 raised the key's cells (0.800, 0.875) but lowered the mean |
| open (per open string) | -0.3 .. 0.3 | 0 | 0 | every positive value lowered all four cells; -0.1 tied |
| win (soft, per fret outside) | 0.1 .. 2.0, then 3, 4, 8 | 0.5 | 2.0 | rises to 2.0 (key 0.8699, chain-2 0.8294) and stays there at 3, 4, 8 (e1220 to e1227) |
| open_win (open while fretted fits) | 0 .. 2 | 0 | 0 | 0.1 and up lowered the tool cells (key 0.870 -> 0.847 at 0.1) |
| drop (unplayable note) | 5 | 5 | 5 | never reached: 0 drops in every cell |

With chain-2's notes the fit is worth +0.087 (off) and +0.042 (tool) on capo, and -0.002 to +0.006 on the other two
songs, which it never saw (the start rows below). Standard, nylon and the held-out songs are the out-of-sample numbers.

## The rungs

Notes: the key's (A), chain-2's (`G/experiments/<S>/chain-2/notes.csv`), chain2f (chain-2's after `hand_filter.py` with
the tool window and the cell's tuning). Tuning: given; wrong (capo and nylon); finder (E2's answer). Hand: off; tool
(E1's published window); perfect (A: each bar's key frets, one either side); ceiling (A: each onset group's own key
frets); hard unless "soft". With the hand off the solver writes AO-082's choosers' tab: paired by onset (3 ms) and
pitch, its places equal chain-5's for 815 / 628 / 679 of 815 / 628 / 679 notes and chain-2's for 882 / 610 / 734 of
882 / 611 / 734.

## The ladder, per recording

### capo (Steal My Girl, capo 3)

Tool window (published, HAND.md's default): `G/loop/hand/capo/hand_window.csv` (SHA-256 `059da17ef62c`, the same file as `hand/capo/hand_window.csv` here); chain2f by `G/loop/tools/handreach/hand_filter.py`, which removes 0 (given), 1 (wrong), 0 (finder) of chain-2's 882 notes. Wrong rung: D#2 A2 D3 G3 B3 E4 (39 45 50 55 59 64), the kit's lowest-note rule read knowing the capo (L < 40 + capo => 6th string L - capo, else standard) on t-02-hint's notes (n-01-hint), as on chain-2's it gives the true tuning. For reference, the same rule on t-02's notes (n-01) gives 36 45 50 55 59 64. Tuning finder: E2 A2 D3 G3 B3 E4, E2's answer read from `G/loop/e2/blind/tun-a-all/tuning.json`, equal to the given tuning; its 21 cells' answers are byte for byte the given cells', so the given rows stand for it. Each cell: main / heard.

| notes, tuning, weights | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given, kept FITTED | 0.795 / 0.790 | 0.872 / 0.873 | 0.872 / 0.873 | 0.804 / 0.799 | 0.804 / 0.799 | 0.879 / 0.879 | 0.879 / 0.879 |
| key (A), given, start | 0.790 / 0.784 | 0.872 / 0.873 | 0.867 / 0.867 | 0.804 / 0.799 | 0.804 / 0.799 | 0.883 / 0.884 | 0.883 / 0.884 |
| key (A), wrong, kept FITTED | 0.699 / 0.695 | 0.762 / 0.762 | 0.762 / 0.762 | 0.704 / 0.700 | 0.704 / 0.700 | 0.768 / 0.769 | 0.768 / 0.769 |
| chain2, given, kept FITTED | 0.767 / 0.770 | 0.832 / 0.840 | 0.832 / 0.840 | 0.774 / 0.778 | 0.774 / 0.778 | 0.836 / 0.844 | 0.836 / 0.844 |
| chain2, given, start | 0.680 / 0.678 | 0.790 / 0.796 | 0.790 / 0.796 | 0.761 / 0.763 | 0.761 / 0.763 | 0.816 / 0.823 | 0.816 / 0.823 |
| chain2, wrong, kept FITTED | 0.682 / 0.683 | 0.737 / 0.742 | 0.737 / 0.742 | 0.687 / 0.689 | 0.687 / 0.689 | 0.741 / 0.746 | 0.741 / 0.746 |

| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|
| key-given-off (kept fitted) | 0.795 | 0.790 | 0.790 | 0.795 | 1.000 | 1.000 | 648 / 167 / 0 / 0 | e0668, e0669, e0670 |
| key-given-tool (kept fitted) | 0.872 | 0.873 | 0.873 | 0.872 | 1.000 | 1.000 | 711 / 104 / 0 / 0 | e1720, e1721, e1722 |
| chain2-given-off (kept fitted) | 0.767 | 0.770 | 0.797 | 0.800 | 0.958 | 0.920 | 625 / 156 / 34 / 101 | e0689, e0690, e0691 |
| chain2-given-tool (kept fitted) | 0.832 | 0.840 | 0.869 | 0.868 | 0.958 | 0.920 | 678 / 103 / 34 / 101 | e1768, e1769, e1770 |
| key-wrong-tool (kept fitted) | 0.762 | 0.762 | 0.762 | 0.762 | 1.000 | 1.000 | 621 / 194 / 0 / 0 | e1729, e1730, e1731 |
| chain2-wrong-tool (kept fitted) | 0.737 | 0.742 | 0.769 | 0.770 | 0.958 | 0.920 | 601 / 180 / 34 / 101 | e1777, e1778, e1779 |
| AO-082 chain-1, re-scored | 0.000 | 0.000 | 0.000 | 0.000 | 0.958 | 0.920 | 0 / 781 / 34 / 102 | e0779, e0780, e0781 |
| kit arm round 2 (c1), list re-scored | 0.945 | 0.962 | 0.973 | 0.965 | 0.979 | 0.919 | 770 / 28 / 17 / 123 | e0782, e0783, e0784 |
| kit arm round 2, GP5 (results.json) | 0.930 | | | 0.966 | | 0.904 | 758 / 27 / 30 / 136 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### nylon (slot tuning, D2 G2 C3 F3 A3 C4)

Tool window (published, HAND.md's default): `G/loop/hand/tuning/hand_window.csv` (SHA-256 `744051af00dc`, the same file as `hand/tuning/hand_window.csv` here); chain2f by `G/loop/tools/handreach/hand_filter.py`, which removes 0 (given), 0 (wrong), 0 (finder) of chain-2's 611 notes. Wrong rung: D2 G2 C3 F3 A3 D4 (38 43 48 53 57 62), both AO-082 round-2 blind arms' answer (G/blind/results.json, protocol.tuning_midi). Tuning finder: D2 G2 C3 F3 A3 C4, E2's answer read from `G/loop/e2/blind/tun-c-all/tuning.json`, equal to the given tuning; its 21 cells' answers are byte for byte the given cells', so the given rows stand for it. Each cell: main / heard.

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
| key-given-tool (kept) | 0.967 | 0.973 | 0.973 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e1891, e1892, e1893 |
| chain2-given-off (kept) | 0.801 | 0.842 | 0.977 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e0848, e0849, e0850 |
| chain2-given-tool (kept) | 0.801 | 0.842 | 0.977 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e1924, e1925, e1926 |
| key-wrong-tool (kept) | 0.780 | 0.779 | 0.779 | 0.780 | 1.000 | 1.000 | 490 / 138 / 0 / 0 | e1897, e1898, e1899 |
| chain2-wrong-tool (kept) | 0.619 | 0.640 | 0.743 | 0.754 | 0.822 | 0.833 | 389 / 127 / 112 / 95 | e1930, e1931, e1932 |
| AO-082 chain-1, re-scored | 0.102 | 0.103 | 0.119 | 0.124 | 0.822 | 0.833 | 64 / 452 / 112 / 95 | e0980, e0981, e0982 |
| kit arm round 2 (c2), list re-scored | 0.659 | 0.683 | 0.763 | 0.774 | 0.852 | 0.850 | 414 / 121 / 93 / 96 | e0983, e0984, e0985 |
| kit arm round 2, GP5 (results.json) | 0.548 | | | 0.798 | | 0.688 | 344 / 87 / 197 / 193 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### standard (Imagine)

Tool window (published, HAND.md's default): `G/loop/hand/standard/hand_window.csv` (SHA-256 `1ca9118ccc36`, the same file as `hand/standard/hand_window.csv` here); chain2f by `G/loop/tools/handreach/hand_filter.py`, which removes 0 (given), 0 (finder) of chain-2's 734 notes. Wrong rung: dropped: the kit's lowest-note rule read knowing the capo gives the true tuning on chain-2's notes and on t-02's (n-01) and on t-02-hint's (n-01-hint). Tuning finder: E2 A2 D3 G3 B3 E4, E2's answer read from `G/loop/e2/blind/tun-b-all/tuning.json`, equal to the given tuning; its 21 cells' answers are byte for byte the given cells', so the given rows stand for it. Each cell: main / heard.

| notes, tuning, weights | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given, kept | 0.892 / 0.889 | 0.915 / 0.913 | 0.913 / 0.911 | 0.892 / 0.889 | 0.892 / 0.889 | 0.919 / 0.918 | 0.919 / 0.918 |
| key (A), given, start | 0.894 / 0.894 | 0.918 / 0.916 | 0.916 / 0.914 | 0.897 / 0.894 | 0.897 / 0.894 | 0.922 / 0.921 | 0.922 / 0.921 |
| chain2, given, kept | 0.829 / 0.852 | 0.854 / 0.880 | 0.853 / 0.878 | 0.829 / 0.852 | 0.829 / 0.852 | 0.856 / 0.883 | 0.856 / 0.883 |
| chain2, given, start | 0.823 / 0.846 | 0.856 / 0.882 | 0.848 / 0.875 | 0.831 / 0.854 | 0.831 / 0.854 | 0.856 / 0.883 | 0.856 / 0.883 |

| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|
| key-given-off (kept) | 0.892 | 0.889 | 0.889 | 0.892 | 1.000 | 1.000 | 606 / 73 / 0 / 0 | e0996, e0997, e0998 |
| key-given-tool (kept) | 0.915 | 0.913 | 0.913 | 0.915 | 1.000 | 1.000 | 621 / 58 / 0 / 0 | e2032, e2033, e2034 |
| chain2-given-off (kept) | 0.829 | 0.852 | 0.894 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e1017, e1018, e1019 |
| chain2-given-tool (kept) | 0.854 | 0.880 | 0.923 | 0.921 | 0.928 | 0.892 | 580 / 50 / 49 / 104 | e2059, e2060, e2061 |
| AO-082 chain-1, re-scored | 0.829 | 0.852 | 0.894 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e1135, e1137, e1140 |
| kit arm round 2 (c3), list re-scored | 0.875 | 0.906 | 0.941 | 0.941 | 0.929 | 0.918 | 594 / 37 / 48 / 64 | e1142, e1144, e1146 |
| kit arm round 2, GP5 (results.json) | 0.865 | | | 0.941 | | 0.908 | 587 / 37 / 55 / 71 (GP5) | |

AO-082's fixed points re-scored: chain-5 = key-given-off, chain-2 = chain2-given-off in every column (eval ids in ladder.json).

### First pass: the old wrong rung (chain-1's tuning), frozen

| song, notes | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| capo, key (A), FITTED | 0.699 / 0.695 | 0.760 / 0.760 | 0.760 / 0.760 | 0.704 / 0.700 | 0.704 / 0.700 | 0.768 / 0.769 | 0.768 / 0.769 |
| capo, chain2, FITTED | 0.682 / 0.683 | 0.737 / 0.742 | 0.737 / 0.742 | 0.687 / 0.689 | 0.687 / 0.689 | 0.741 / 0.746 | 0.741 / 0.746 |
| nylon, key (A) | 0.107 / 0.103 | not run | not run | 0.107 / 0.103 | 0.107 / 0.103 | 0.107 / 0.103 | 0.107 / 0.103 |
| nylon, chain2 | 0.102 / 0.103 | not run | not run | 0.102 / 0.103 | 0.102 / 0.103 | 0.102 / 0.103 | 0.102 / 0.103 |
| standard, key (A) | 0.892 / 0.889 | 0.915 / 0.913 | 0.913 / 0.911 | 0.892 / 0.889 | 0.892 / 0.889 | 0.919 / 0.918 | 0.919 / 0.918 |
| standard, chain2 | 0.829 / 0.852 | 0.854 / 0.880 | 0.853 / 0.878 | 0.829 / 0.852 | 0.829 / 0.852 | 0.856 / 0.883 | 0.856 / 0.883 |

Chain-1's tunings: capo 39 45 50 55 59 64, nylon 38 45 50 55 59 64, standard 40 45 50 55 59 64; tool windows: capo `G/loop/e1/capo/v0_m1/hand_window.csv`, nylon none, standard `G/loop/e1/standard/v0_m1/hand_window.csv`. Frozen cells, with new heard evals of the same answers: `G/loop/e3/first-pass/`.

Capo's wrong rung in this pass has chain-1's tuning again (39 45 50 55 59 64): 12 of 14 key and chain-2 cells score as the first pass's; the 2 that differ are key-wrong-tool, key-wrong-tool-soft (the first pass's tool window was E1's v0).

### What the window buys (tuning given; main number)

| song, notes, weights | tool - off | perfect - off (A) | ceiling - off (A) |
|---|---|---|---|
| capo, key (A), kept FITTED | +0.077 | +0.009 | +0.083 |
| capo, chain2, kept FITTED | +0.065 | +0.007 | +0.069 |
| capo, chain2, start | +0.110 | +0.081 | +0.136 |
| nylon, key (A), kept | +0.000 | +0.000 | +0.000 |
| nylon, chain2, kept | +0.000 | +0.000 | +0.000 |
| nylon, chain2, start | +0.002 | +0.000 | +0.002 |
| standard, key (A), kept | +0.022 | +0.000 | +0.027 |
| standard, chain2, kept | +0.025 | +0.000 | +0.027 |
| standard, chain2, start | +0.032 | +0.007 | +0.032 |

### E1's development window (second pass, frozen) against the published one

The second pass's cells with E1's development window are frozen in `G/loop/e3/second-pass/<S>/`. Of 126 cells, 116 score the same with the published window (capo 25 of 35, nylon 56 of 56, standard 35 of 35); these differ:

| song, cell, weights | development: main / heard | published: main / heard | eval tab (development) |
|---|---|---|---|
| capo, key-given-tool, kept FITTED | 0.876 / 0.876 | 0.872 / 0.873 | e0671 |
| capo, key-given-tool-soft, kept FITTED | 0.876 / 0.876 | 0.872 / 0.873 | e0674 |
| capo, chain2-given-tool, kept FITTED | 0.833 / 0.841 | 0.832 / 0.840 | e0692 |
| capo, chain2-given-tool-soft, kept FITTED | 0.833 / 0.841 | 0.832 / 0.840 | e0695 |
| capo, chain2f-given-tool, kept FITTED | 0.833 / 0.841 | 0.832 / 0.840 | e0713 |
| capo, chain2f-given-tool-soft, kept FITTED | 0.833 / 0.841 | 0.832 / 0.840 | e0716 |
| capo, key-given-tool, start | 0.876 / 0.876 | 0.872 / 0.873 | e0734 |
| capo, key-given-tool-soft, start | 0.876 / 0.876 | 0.867 / 0.867 | e0737 |
| capo, chain2-given-tool, start | 0.791 / 0.798 | 0.790 / 0.796 | e0755 |
| capo, chain2-given-tool-soft, start | 0.791 / 0.798 | 0.790 / 0.796 | e0758 |

## Held out: the solver alone on three new recordings

The frozen method's inputs, read from each held-out W2 run (`G/loop/runs/w2-ho-<S>/run.json`), never from the key: gaps-paper's notes after `hand_filter.py` with the finder's tuning and the given capo (the kept notes equal run.json's count and the W2 pack's base candidates); hand off, and the tool window `G/heldout/<S>/hand/hand_window.csv` (Opus's blind anchors and check, margin 1), hard; the kept weights (FITTED on capo's key, never on these songs); frets 0 to 20 from the capo, as in the dev cells. Scored with gtr-eval tab and notes like the dev cells; heard = key notes whose conf is not "tab". The keys stay private: only scores and counts here. Cells: `G/loop/e3/heldout/<S>/`, by `run_heldout.py`.

| recording, hand | notes (kept / removed by the filter) | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |
|---|---|---|---|---|---|---|---|---|---|
| Closer (steel, capo 1), off | 1169 / 22 | 0.427 | 0.439 | 0.491 | 0.486 | 0.880 | 0.872 | 491 / 520 / 138 / 158 | e2145, e2146, e2147 |
| Closer (steel, capo 1), tool | 1169 / 22 | 0.571 | 0.580 | 0.648 | 0.649 | 0.880 | 0.872 | 656 / 355 / 138 / 158 | e2148, e2149, e2150 |
| September (nylon, capo 2), off | 412 / 0 | 0.710 | 0.728 | 0.742 | 0.744 | 0.954 | 0.960 | 296 / 102 / 19 / 14 | e2154, e2155, e2156 |
| September (nylon, capo 2), tool | 412 / 0 | 0.731 | 0.752 | 0.766 | 0.766 | 0.954 | 0.960 | 305 / 93 / 19 / 14 | e2157, e2158, e2159 |
| Boats (nylon, no capo), off | 216 / 0 | 0.909 | 0.920 | 1.000 | 1.000 | 0.909 | 0.942 | 211 / 0 / 21 / 5 | e2163, e2164, e2165 |
| Boats (nylon, no capo), tool | 216 / 0 | 0.909 | 0.920 | 1.000 | 1.000 | 0.909 | 0.942 | 211 / 0 / 21 / 5 | e2166, e2167, e2168 |

Wrong places by kind with the tool window (`checks.json` `heldout_error_types`, matched with gtr-eval's rule): Closer 355: 139 an open string where the player fretted, 188 both fretted, 28 fretted where the player played open; September 93: 72 an open string where the player fretted, 21 both fretted, 0 fretted where the player played open; Boats 0.

gtr-eval's tuning check (`tuning_differs`) on the finder's tuning: false on every held-out cell.

Cross-check with each W2 pack's own solver proposal (`G/loop/bw/<blind_dir>/w2/solver_tab.json`: the same notes, tuning, capo and window, solved bar by bar by `w2.py`, each bar with only the last finished group before it as context, frets up to 20 - capo):

| recording | pack's solver tab, main (eval) | rebuilt by w2.py's procedure | tool cell, main | pack - cell | right notes, pack / cell | notes on another place (bars) | whole song, frets up to 20 - capo |
|---|---|---|---|---|---|---|---|
| Closer (steel, capo 1) | 0.579 (e1699) | yes, note for note | 0.571 | +0.008 | 665 / 656 | 15 of 1169 (11 of 87) | 0.571 (same answer) |
| September (nylon, capo 2) | 0.736 (e1695) | yes, note for note | 0.731 | +0.005 | 307 / 305 | 2 of 412 (2 of 44) | 0.731 (same answer) |
| Boats (nylon, no capo) | 0.909 (e2143) | yes, note for note | 0.909 | +0.000 | 211 / 211 | 0 of 216 (0 of 24) | no capo: the cell itself |

## Findings

- **The window adds +0.065 (capo, FITTED) and +0.025 (standard) with chain-2's notes, tuning given; +0.110 / +0.032 with
  the start weights; on nylon 0.000 (+0.002 start).** The tool window comes within 0.004 / 0.0015 of the ceiling and
  beats the bar-wide perfect window by 0.058 / 0.025: at the key's fretted onsets it is about as wide (mean 5.45 / 3.73 /
  4.58 frets against 6.04 / 3.35 / 5.25) but follows the hand inside the bar (coverage 0.9946 / 1.000 / 0.9982 where the
  hand is known). On capo it leaves 5 wrong places where both solver and player fretted (key's notes; 68 with the hand
  off, 61 with the perfect window). E1's development window did a little better on capo (0.876 / 0.833): at 38.9, 39.6
  and 106.8 s the published window starts at fret 2 where the development one starts at 6, and the solver puts those
  notes (the key's string 4 fret 7) at string 3 fret 2 (key's notes: all three; chain-2's: the one at 106.8 s).
- **What no fret window fixes.** With the tool window and the key's notes, 99 of 104 wrong places on capo, 54 of 58 on
  standard and 21 of 21 on nylon are an open string where the player fretted the same pitch (chain-2's notes: 99 of 103,
  48 of 50, 13 of 13); the ceiling leaves 99 / 55 / 21. A fret window cannot see whether a string is pressed, and
  charging open strings (`open_win`) lowered every window cell. That is the whole gap on nylon (the key's notes reach
  0.967 with any window or none): it needs the fingers, string by string (E4's frames, or a per-string tracker).
- **The nylon wrong rung (string 1 a whole tone high)** costs 0.186 with the key's notes (0.967 -> 0.780) and 0.182
  with chain-2's (0.801 -> 0.619), under every window. With the key's notes it moves all 129 matched C4 (114 on the open
  1st string and 15 at string 2 fret 3 in the key) to string 2 fret 3, and all 18 D4 (string 1 fret 2) to the open 1st
  string (`checks.json`, `nylon_string1`). No window tells: fret 3 is in the hand's reach near the nut. The hard rule
  fails in 6 groups of chain-2's notes with the tool or the perfect window (0 under the true tuning) and in 24 with the
  ceiling (21 under the true tuning); with the key's notes in none. E2's finder settled string 1 from the fingers
  (`TUNING.md`: C4, from a G minor grip at 31.8 s), so the finder rung equals the given one.
- **The capo wrong rung (string 6 a semitone low, 39)** costs 0.110 with the key's notes (0.872 -> 0.762) and 0.094 with
  chain-2's (0.832 -> 0.737) with the tool window (FITTED), 0.096 / 0.085 with the hand off. It adds wrong places where
  both fretted: with the key's notes and the tool window 95 of its 194, against 5 of 104 under the true tuning (the 99
  open-string ones stay). The window hardly sees it: the hard rule fails in 1 group of chain-2's notes with the tool
  window (0 with the key's), and in 80 / 86 with the ceiling (4 / 0 under the true tuning).
- **Heard notes.** With chain-2's notes the heard share is above the main number on every song (tool, given: 0.840 /
  0.842 / 0.880 against 0.832 / 0.801 / 0.854; capo FITTED): the note model finds 735 of 761, 479 of 556 and 556 of 583
  heard key notes (0.966 / 0.862 / 0.954) against 0.958 / 0.822 / 0.928 of all, so it misses the "tab"-only notes most,
  by far on nylon. With the key's notes the two shares differ by at most 0.006 (nylon 0.967 / 0.973). Held out the
  heard share is above the main number too (tool: 0.580 / 0.752 / 0.920 against 0.571 / 0.731 / 0.909).
- **Against Opus, on one basis (the tab list).** The round-2 kit arm, re-scored here as `G/blind/results.json` has it
  (protocol): main 0.945 / 0.659 / 0.875, of matched 0.965 / 0.774 / 0.941, onset F1 0.919 / 0.850 / 0.918, heard 0.962 /
  0.683 / 0.906. The solver (chain-2's notes, true tuning, tool window; capo FITTED): 0.832 / 0.801 / 0.854, of matched
  0.868 / 0.975 / 0.921, onset F1 0.920 / 0.833 / 0.892, heard 0.840 / 0.842 / 0.880. With notes about level on the
  steel songs, the kit arm's reading of frames places 0.965 against 0.868 on capo (FITTED; 0.825 with the start
  weights) and 0.941 against 0.921 on standard. On nylon it used D G C F A D: on that tuning the solver reads 0.619 (of
  matched 0.754) against its 0.659 (0.774). GP5 numbers (AO-082's main number) only in the rows marked GP5.
- **Hard against soft.** Soft at 2.0 behaves as hard: 18 of 18 pairs on capo and 18 of 18 on nylon (tunings given and
  wrong) score the same; on standard 3 of 9 differ, soft lower by at most 0.0015 (one note); the finder's pairs repeat
  the given ones. No tool cell with the tuning given fell back to soft under hard; the ceiling (A) cannot be met by
  chain-2's notes in 4 / 21 / 35 groups. No cell dropped a note.
- **Held out, the solver alone drops the way W2 does.** With the tool window: Closer 0.571, September 0.731, Boats 0.909,
  against the dev songs' 0.832 / 0.801 / 0.854 (there chain-2's notes, here gaps-paper's after the filter; the weights
  never saw these songs). The window adds +0.144 on Closer, +0.022 on September and nothing on Boats, where every matched
  note is on the key's place with the hand off too (211 right, 21 missed, 5 invented). The notes are found well (onset
  F1 0.872 / 0.960 / 0.942); the places are what drop (of matched 0.649 / 0.766 / 1.000). September's wrong places are
  the dev songs' kind (72 of 93 an open string where the player fretted); Closer's are mostly both fretted (188 of 355,
  139 open), unlike any dev song.
- **The W2 packs' solver tabs against these cells** (0.579 / 0.736 on Closer / September, as STATE.md has them; 0.909
  on Boats). The packs hold the same notes, tuning, capo and window, and their tabs rebuild note for note with `w2.py`'s
  procedure. Two things differ from the cells: frets up to 20 - capo, and solving bar by bar (no notes past a bar's end,
  only the last finished group before it as context). The fret limit changes no answer (a whole-song cell with it is
  byte for byte the tool cell), so the bar cut is all of it: 15 notes in 11 of 87 bars on Closer and 2 in 2 of 44 on
  September sit on another place, 9 and 2 more of them right in the packs' tabs (+0.008 / +0.005); Boats none.
- **The plan's rule** (LOOP.md E3: "If the window adds under 0.01 on both steel songs with the tuning given, E4's hand-off
  rung runs on the nylon song only"): +0.065 (capo, FITTED) / +0.025 (standard; +0.110 / +0.032 start). **It does not fire: L4 runs
  on all three.**

## Not run

Nothing is left empty: the finder slot, the published windows and `hand_filter.py` are all in. The start weights run on
the tuning given only (the out-of-sample check needs nothing more). The held-out rows have no ASSISTED windows (they
would read the private keys' frets).

## Files

Tools: `G/loop/tools/solver/` (`solver.py`, `README.md`, `run_ladder.py`, `run_heldout.py`, `wrong_tuning.py`,
`ladder_checks.py`, `make_ladder_records.py`, `e3lock.py`, `key_windows.py`, `tune_weights.py`). Cells:
`G/loop/e3/<S>/<cell>/` and `startw/<cell>/` (answer, command, solver stats, three scores, `cell.json`); inputs (key and
heard key notes, the wrong rung's evidence, the finder's tuning, chain2f) in `inputs/`; fixed points (chains 5, 2, 1, kit
arm) in `fixed/`; held out in `G/loop/e3/heldout/<S>/` (`heldout.json`; their key cuts in `G/loop/score/e3-heldout/`,
private); the second pass (development window) frozen with its tools in `G/loop/e3/second-pass/`; the first pass in
`G/loop/e3/first-pass/`. Runs: gtr-run r1340 (the second pass's ladder), r1380 (this refresh: 140 cells re-run, 453.3 s
on 2 cores), r1382 (held out, 31.5 s), r1384 (the checks). Remake, in that folder: `G/tools/venv-torch/bin/python
run_ladder.py`, `G/tools/venv-torch/bin/python run_heldout.py`, `/home/user/gtr/eval/venv/bin/python ladder_checks.py`,
`python3 make_ladder_records.py <ladder.json> <tables.md>`. The held-out cells ran `solver.py` and `hand_filter.py`, and the
cross-check the loop's `solve.py`, byte for byte as frozen in `code/` (SHA-256 as in `code/SHA256SUMS`); the ladder
scripts there are the second pass's (this refresh changed them, not the solver).
