# LADDER: the constraint ladder with a plain solver (E3)

E3 of `../sessions/LOOP.md`: how much each constraint buys when no Opus is involved. The capo is given everywhere
(3 / 0 / 0). Every number below names its gtr-eval id (ledger `G/loop/ledger/evals.jsonl`, G = `/home/user/gtv`); all of
them, with the files they came from, are in `ladder.json`. Main number = the tab list on the recording's clock: same
string and fret as the key (frets from each side's capo), onset within 50 ms, same pitch, as a share of all key notes
(`gtr-eval tab` on `answer.json`). "(A)" marks ASSISTED rows: they use the answer key (its notes, or windows made from
its frets) and are ceilings, never results.

## The solver, in plain words

`G/loop/tools/solver/solver.py` (README beside it). Notes whose onsets lie within 35 ms of each other are one group.
For each group it lists every way to put its notes on different strings at frets 0 to 20 (counted from the capo), and
for each way every place the hand could be (the index finger at fret h, the hand covering h to h+3). A dynamic programme
(Viterbi) then picks the cheapest run through all the groups. The costs: moving the hand (per fret), playing high on the
neck (per fret of the group's mean fret), stretching outside the hand's four frets (per fret, so a shape wider than 4
frets always pays), an open string (a cost or a bonus), a note put on a string that still rings from the group before,
and the hand window: a fretted note outside the frets the hand can reach at that moment is forbidden (hard) or charged
per fret outside (soft). Open strings are always allowed; where the tracker lost the hand there is no constraint; a
group that no state can satisfy under hard falls back to soft and is counted. A note no string can play is dropped.

The same solver runs on a time range for the loop: `solve_range(notes, t0, t1, context, pins)` (CLI `--t0 --t1
--context ctx.json --pins pins.json --json-out`) continues from the previous group's state (hand and ringing strings),
honours pinned places (a pin overrides the window), and returns the best path plus, for every note, its places with the
cost of the best whole path through each (exact min-marginals from a backward pass; the top 3). A whole song takes
about 0.1 s (`stats.seconds` in each cell's `solver_stats.json`).

## Weights, and how they were set

Set once on the capo song and never per song, by `tune_weights.py`: a coordinate search (each weight over a few values
in turn, the best kept, until a round changes nothing) on one objective, the mean main number of four capo cells (the
key's notes and chain-2's, each with the hand off and with the tool window hard, tuning given), scored in-process with
mir_eval's matching (the same rule as `gtr-eval tab`; the kept weights' numbers agree with gtr-eval to 4 places).
Log: `G/loop/e3/tune_capo.json`, `G/loop/e3/tune_capo_open_win.json`.

| weight | tried | kept | why |
|---|---|---|---|
| move (per fret the hand moves) | 0.05, 0.1, 0.2, 0.4, 0.8 | 0.4 | 0.05 in round 1 (0.7810), then 0.2 (0.8111) and 0.4 (0.8126) in round 2; 0.8 lower (0.8095) |
| height (x mean fret) | 0, 0.02, 0.05, 0.1 | 0.1 | the largest gain: 0.7801 -> 0.8052 (round 1); 0 gave 0.7512 |
| span (per fret outside h..h+3) | 0.3, 0.6, 1.0, 2.0 | 1.0 | 0.8153 against 0.8126 at 0.6; 2.0 the same, so the smaller |
| ring (string still ringing) | 0, 0.15, 0.3, 0.6, 1.0 | 0 | 0.3 -> 0: 0.8052 -> 0.8107 (round 1). The note model's offsets run long: in round 2, ring 1.0 took chain2-off to 0.696; ring 0.6 raised the key's notes (off 0.800, tool 0.875 against 0.795, 0.870) but lowered the mean |
| open (per open string) | -0.3, -0.1, 0, 0.1, 0.3 | 0 | every positive value lowered all cells; -0.1 tied, 0 is neutral |
| win (soft, per fret outside) | 0.1, 0.25, 0.5, 1.0, 2.0, 3, 4, 8 | 2.0 | rises to 2.0 (0.850, the same as hard) and stays flat: the smallest value on the plateau |
| open_win (open string while a fretted place is inside the window) | 0, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2 | 0 | added after reading the capo errors (below); every value from 0.1 up lowered the tool cells (key 0.870 -> 0.847 at 0.1) |
| drop (a note no string can play) | 5 (fixed) | 5 | never reached on these inputs (0 drops in every cell) |

Start: move 0.2, height 0.02, span 0.6, ring 0.3, open 0, win 0.5 (0.7801). Accepted, in order: move 0.05, height
0.05, height 0.1, ring 0, move 0.2, move 0.4, span 1.0 (0.8153); round 3 changed nothing; win was searched last.

**With the hand off, the solver writes AO-082's choosers' tab.** Paired by onset (3 ms) and pitch, its places equal
chain-5's (tuttut or LilyPond on the key's notes) for 815 / 628 / 679 of 815 / 628 / 679 notes, and chain-2's for
882 / 610 / 734 of 882 / 611 / 734. So every "off" row is the fixed point, and what the window adds is measured on top
of the best chooser AO-082 had.

## The ladder, per recording

Capo given everywhere. Notes: the key's onsets, offsets and pitches (A); chain-2's measured notes; chain2f, chain-2's
after the tool window's filter. Tuning: given (the key's), wrong (chain-1's: capo string 6 a semitone low, nylon Drop D,
standard standard, so there "wrong" equals "given"), finder (empty, for E2). Hand: off; tool (E1 v0, margin 1); perfect (A:
each bar's key frets, one either side); ceiling (A: each onset's own key frets). Window hard unless "soft". Rows: notes,
tuning; columns: hand. Every cell's eval ids are in `ladder.json`.

### capo (Steal My Girl, capo 3)

Tool window: `G/loop/e1/capo/v0_m1/hand_window.csv` (SHA-256 `721a67f80039`). Main numbers:

| notes, tuning | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given | 0.795 | 0.870 | 0.870 | 0.804 | 0.804 | 0.878 | 0.878 |
| key (A), wrong | 0.699 | 0.759 | 0.759 | 0.704 | 0.704 | 0.768 | 0.768 |
| chain2, given | 0.767 | 0.829 | 0.829 | 0.774 | 0.774 | 0.836 | 0.836 |
| chain2, wrong | 0.682 | 0.737 | 0.737 | 0.687 | 0.687 | 0.741 | 0.741 |
| chain2f, given | 0.767 | 0.829 | 0.829 | 0.774 | 0.774 | 0.836 | 0.836 |
| chain2f, wrong | 0.682 | 0.737 | 0.737 | 0.687 | 0.687 | 0.741 | 0.741 |

| detail | main | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes |
|---|---|---|---|---|---|---|
| key-given-off | 0.795 | 0.795 | 1.000 | 1.000 | 648 / 167 / 0 / 0 | e0227, e0228 |
| key-given-tool | 0.870 | 0.870 | 1.000 | 1.000 | 709 / 106 / 0 / 0 | e0229, e0230 |
| key-given-ceiling | 0.878 | 0.878 | 1.000 | 1.000 | 716 / 99 / 0 / 0 | e0237, e0238 |
| chain2-given-off | 0.767 | 0.800 | 0.958 | 0.920 | 625 / 156 / 34 / 101 | e0255, e0256 |
| chain2-given-tool | 0.829 | 0.866 | 0.958 | 0.920 | 676 / 105 / 34 / 101 | e0257, e0258 |
| chain2-given-tool-soft | 0.829 | 0.866 | 0.958 | 0.920 | 676 / 105 / 34 / 101 | e0259, e0260 |
| AO-082 chain-5, re-scored | 0.795 | 0.795 | 1.000 | 1.000 | 648 / 167 / 0 / 0 | e0085, e0086 |
| AO-082 chain-2, re-scored | 0.767 | 0.800 | 0.958 | 0.920 | 625 / 156 / 34 / 101 | e0087, e0088 |
| AO-082 chain-1, re-scored | 0.000 | 0.000 | 0.958 | 0.920 | 0 / 781 / 34 / 102 | e0089, e0090 |
| kit arm, round 2 (BLIND-RESULTS.md) | 0.945 list, 0.930 GP5 | 0.966 | | 0.904 | 758 / 27 / 30 / 136 (GP5) | |

### nylon (slot tuning, D2 G2 C3 F3 A3 C4)

Tool window: `none yet`. Main numbers:

| notes, tuning | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given | 0.967 | not run | not run | 0.967 | 0.967 | 0.967 | 0.967 |
| key (A), wrong | 0.107 | not run | not run | 0.107 | 0.107 | 0.107 | 0.107 |
| chain2, given | 0.801 | not run | not run | 0.801 | 0.801 | 0.801 | 0.801 |
| chain2, wrong | 0.102 | not run | not run | 0.102 | 0.102 | 0.102 | 0.102 |

| detail | main | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes |
|---|---|---|---|---|---|---|
| key-given-off | 0.967 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e0347, e0349 |
| key-given-ceiling | 0.967 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e0359, e0361 |
| chain2-given-off | 0.801 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e0387, e0389 |
| AO-082 chain-5, re-scored | 0.967 | 0.967 | 1.000 | 1.000 | 607 / 21 / 0 / 0 | e0131, e0132 |
| AO-082 chain-2, re-scored | 0.801 | 0.975 | 0.822 | 0.833 | 503 / 13 / 112 / 95 | e0133, e0134 |
| AO-082 chain-1, re-scored | 0.102 | 0.124 | 0.822 | 0.833 | 64 / 452 / 112 / 95 | e0135, e0136 |
| kit arm, round 2 (BLIND-RESULTS.md) | 0.659 list, 0.548 GP5 | 0.798 | | 0.688 | 344 / 87 / 197 / 193 (GP5) | |

### standard (Imagine)

Tool window: `G/loop/e1/standard/v0_m1/hand_window.csv` (SHA-256 `188c31f5a343`). Main numbers:

| notes, tuning | off | tool | tool soft | perfect (A) | perfect soft (A) | ceiling (A) | ceiling soft (A) |
|---|---|---|---|---|---|---|---|
| key (A), given | 0.892 | 0.915 | 0.913 | 0.892 | 0.892 | 0.919 | 0.919 |
| key (A), wrong | 0.892 | 0.915 | 0.913 | 0.892 | 0.892 | 0.919 | 0.919 |
| chain2, given | 0.829 | 0.854 | 0.853 | 0.829 | 0.829 | 0.856 | 0.856 |
| chain2, wrong | 0.829 | 0.854 | 0.853 | 0.829 | 0.829 | 0.856 | 0.856 |
| chain2f, given | 0.829 | 0.854 | 0.853 | 0.829 | 0.829 | 0.856 | 0.856 |
| chain2f, wrong | 0.829 | 0.854 | 0.853 | 0.829 | 0.829 | 0.856 | 0.856 |

| detail | main | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes |
|---|---|---|---|---|---|---|
| key-given-off | 0.892 | 0.892 | 1.000 | 1.000 | 606 / 73 / 0 / 0 | e0427, e0429 |
| key-given-tool | 0.915 | 0.915 | 1.000 | 1.000 | 621 / 58 / 0 / 0 | e0431, e0433 |
| key-given-ceiling | 0.919 | 0.919 | 1.000 | 1.000 | 624 / 55 / 0 / 0 | e0447, e0449 |
| chain2-given-off | 0.829 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e0483, e0485 |
| chain2-given-tool | 0.854 | 0.921 | 0.928 | 0.892 | 580 / 50 / 49 / 104 | e0487, e0489 |
| chain2-given-tool-soft | 0.853 | 0.919 | 0.928 | 0.892 | 579 / 51 / 49 / 104 | e0491, e0493 |
| AO-082 chain-5, re-scored | 0.892 | 0.892 | 1.000 | 1.000 | 606 / 73 / 0 / 0 | e0221, e0222 |
| AO-082 chain-2, re-scored | 0.829 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e0223, e0224 |
| AO-082 chain-1, re-scored | 0.829 | 0.894 | 0.928 | 0.892 | 563 / 67 / 49 / 104 | e0225, e0226 |
| kit arm, round 2 (BLIND-RESULTS.md) | 0.875 list, 0.865 GP5 | 0.941 | | 0.908 | 587 / 37 / 55 / 71 (GP5) | |

## What the window buys (tuning given)

| song, notes | tool - off | perfect - off (A) | ceiling - off (A) | tool - perfect | tool - ceiling |
|---|---|---|---|---|---|
| capo, key's notes (A) | +0.075 | +0.009 | +0.083 | +0.066 | -0.009 |
| capo, chain-2's notes | **+0.063** | +0.007 | +0.069 | +0.055 | -0.006 |
| standard, key's notes (A) | +0.022 | 0.000 | +0.027 | +0.022 | -0.004 |
| standard, chain-2's notes | **+0.025** | 0.000 | +0.027 | +0.025 | -0.002 |
| nylon, key's notes (A) | not run | 0.000 | 0.000 | | |
| nylon, chain-2's notes | not run | 0.000 | 0.000 | | |

- **The tool window comes within 0.002 to 0.009 of the ceiling** (each onset's own key frets, no margin) on both steel
  songs, and beats the bar-wide perfect window by 0.022 to 0.066. A bar's frets one either side (mean width 6.0 / 3.4 /
  5.3 frets at the key's fretted onsets, `G/loop/e3/window_stats.txt`) is about as wide as the tool's (5.5 / - / 4.9)
  but cannot follow the hand inside the bar: 61 of the 68 both-fretted wrong places on capo stay with it.
- **What no fret window fixes.** With the tool window and the key's notes, 99 of the 106 wrong places on capo, 54 of 58
  on standard and all 21 on nylon are notes the solver puts on an open string where the player fretted the same pitch on
  a lower-pitched string (`G/loop/e3/error_types.txt`; the ceiling leaves exactly those: 99 / 55 / 21). Open strings are always
  allowed, because the hand window cannot see whether a string is pressed. Charging an open string when a fretted place
  sits inside the window (`open_win`) was tried on capo and lowered every window cell (0.870 -> 0.847 at 0.1): the
  player also lets open strings ring inside the hand's reach. Telling these apart needs the fingers, string by string:
  E4's frames, or a per-string tracker. That is the whole remaining gap on nylon, where the key's notes already reach
  0.967 with no window.
- **Notes the window removes (chain2f).** None on capo, one on standard (37.251 s, MIDI 41, an invented note: invented
  104 -> 103, nothing else changes). As E1 found, invented notes sit at pitches the hand can play.
- **Under the wrong tuning** the window still adds about as much on capo (+0.060 key, +0.055 chain-2; the wrong string 6
  costs 0.085 to 0.110 in every cell), and on nylon nothing saves Drop D (0.107 / 0.102). But a hard window tells a wrong
  tuning: on nylon the ceiling's hard rule cannot be met in 82 groups under Drop D against 0 under the given tuning (83
  against 21 with chain-2's notes), on capo 86 against 0. The tool window (margin 1) does not see capo's string 6 one
  semitone low (1 such group either way): a one-fret error hides inside the margin. A signal for E2's conflict counts.

## Hard against soft

The soft weight that scores best on capo (2.0 per fret outside) behaves as the hard rule: all 18 pairs on capo and all 8
on nylon score the same; on standard 6 of 18 pairs differ, soft lower by 0.0015 (one note) in the tool cells. Weaker soft
weights lost on capo (0.5: 0.838 key, 0.821 chain-2, against 0.870 and 0.829 hard). Under hard, 0 or 1 group a cell fell
back to soft with the tuning given and the tool window, so the window rarely rules out a played note: hard it is,
as E1's coverage (0.995 / 0.998 at margin 1) said. No cell dropped a note.

## The plan's rule, and what it changes

LOOP.md E3: "If the window adds under 0.01 on both steel songs with the tuning given, E4's hand-off rung runs on the
nylon song only." It adds +0.063 (capo) and +0.025 (standard) with chain-2's notes, +0.075 and +0.022 with the key's:
**the rule does not fire; E4's hand-off rung (L4) runs on all three recordings.**

Against Opus: with the same capo, true tuning and E1's window, the solver puts 0.866 / 0.921 of chain-2's matched notes
on the key's place (capo / standard); AO-082's kit arm, reading frames itself, put 0.966 / 0.941 of its own on it (its
list 0.945 / 0.875 against the solver's 0.829 / 0.854; its notes differ, onset F1 0.904 / 0.908 against chain-2's 0.920
/ 0.892). The open-or-fretted choice above is where a reader of frames can still win.

## Not run, and left empty

- **Nylon, waiting for its window** (`G/loop/hand/tuning/hand_window.csv` did not exist when this was written): the 8
  tool cells (key and chain2 x given and wrong x hard and soft) and all 14 chain2f cells. `run_ladder.py tuning` runs
  them as soon as the file exists, and re-runs any cell whose window changes (SHA-256 in each `cell.json`); E1's newer
  windows for capo and standard (`G/loop/hand/<S>/`) are picked up the same way.
- **Tuning "finder"**: left empty for the orchestrator to fill when E2 lands (`run_ladder.py`, `TUNINGS`).

## Files

Tools: `G/loop/tools/solver/` (`solver.py`, `README.md`, `key_windows.py`, `tune_weights.py`, `run_ladder.py`,
`make_ladder_records.py`). Cells: `G/loop/e3/<S>/<cell>/` (`answer.json`, `cmd.sh`, `solver_stats.json`, `score_*.json`,
`cell.json`); fixed points re-scored in `G/loop/e3/<S>/fixed/`; assisted windows in `G/loop/e3/windows/<S>/`. Every
number and eval id: `ladder.json` here (gtr-eval 0.12.1, ledger `G/loop/ledger/evals.jsonl`).
