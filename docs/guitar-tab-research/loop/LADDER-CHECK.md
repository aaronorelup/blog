# LADDER-CHECK: an independent check of E3 (the constraint ladder with a plain solver)

Checked 2026-11-27 by agent `e3-verify`, which did not build E3 and changed none of its files. G = `/home/user/gtv`;
my scripts and outputs in `G/work/e3-verify/`; my gtr-eval runs e0595 to e0636 in `G/loop/ledger/evals.jsonl`. Solver
SHA-256 `a159359e...`, the same as in `ladder.json` and every `cell.json`.

## 1. Re-scored cells (gtr-eval 0.12.1 `tab`, main = same_string_and_fret_fraction_of_truth)

Each cell's solver run again from its own `cmd.sh` into `G/work/e3-verify/rescore/<S>/<cell>/`. My answer.json is byte
for byte the stored one in all 7, and both score as `ladder.json` says:

| cell | ladder.json | stored, re-scored | mine | my eval (tab, notes) | onset F1 mine / ladder |
|---|---|---|---|---|---|
| nylon key-given-off (A), best cell | 0.9666 | 0.966561 | 0.966561 | e0596, e0597 | 1.000 / 1.000 |
| nylon chain2-wrong-off, worst cell | 0.1019 | 0.101911 | 0.101911 | e0599, e0600 | 0.8329 / 0.8329 |
| capo chain2-given-tool | 0.8294 | 0.829448 | 0.829448 | e0602, e0603 | 0.9204 / 0.9204 |
| capo chain2-wrong-off | 0.6822 | 0.682209 | 0.682209 | e0614, e0615 | 0.9204 / 0.9204 |
| capo key-given-ceiling (A) | 0.8785 | 0.878528 | 0.878528 | e0605, e0606 | 1.000 / 1.000 |
| standard chain2-given-tool-soft | 0.8527 | 0.852725 | 0.852725 | e0608, e0609 | 0.8917 / 0.8917 |
| standard chain2f-wrong-tool | 0.8542 | 0.854197 | 0.854197 | e0611, e0612 | 0.8924 / 0.8924 |

All 226 eval ids in `ladder.json` (104 cells, 9 fixed points) name the right subcommand, answer and value.

## 2. What the non-assisted cells read

- `solver.py` reads only its arguments; `load_notes` keeps onset, offset and pitch (string and fret are dropped). No
  song name or song value in it. `MAX_STATES` (600) never reached (largest 50): the min-marginals are exact.
- `run_ladder.py` opens the key for: the capo (given), `tuning_midi` (the "given" tuning rung, by design), `duration_s`
  (the validator only), the key's notes (key-* cells only) and scoring. `assisted` = key notes or a perfect or ceiling
  window: every cell that uses the key's notes or frets is marked (A).
- Trace, capo `chain2-given-tool`: `--notes G/experiments/capo/chain-2/notes.csv` (from f-03-chain-hint, notes n-03:
  guitar-fl on `capo.mono.wav`) `--tuning 40,45,50,55,59,64` (the key's: the given rung) `--capo 3` `--window
  G/loop/e1/capo/v0_m1/hand_window.csv` (of E1's tools only `score_e1.py` opens a key).
- Trace, standard `chain2f-wrong-tool`: `--notes G/loop/e3/standard/inputs/chain2f_wrong.csv` (chain-2's 734 notes minus
  1, [37.251 s, MIDI 41], removed by `placeable_in_window` under chain-1's tuning) `--tuning 40,45,50,55,59,64`
  (chain-1's `tab.json`, which for standard equals the given one) `--capo 0` `--window` E1's standard v0_m1.
- **The weights depend on one song.** `DEFAULT_W` came from `tune_weights.py`, which maximises the main number against
  the capo key, over 4 capo cells (two of them chain2-given-off and chain2-given-tool). I ran the search's start weights
  (move 0.2, height 0.02, span 0.6, ring 0.3, win 0.5) on the chain2-given cells (`G/work/e3-verify/startw/`):

| chain2, given | start weights | kept weights | gain from the fit |
|---|---|---|---|
| capo off / tool | 0.680 / 0.780 (e0616, e0617) | 0.767 / 0.829 | +0.087 / +0.049 |
| standard off / tool | 0.823 / 0.856 (e0618, e0619) | 0.829 / 0.854 | +0.006 / -0.002 |
| nylon off | 0.801 (e0620) | 0.801 | 0.000 |

  Capo's rows are fitted on capo's key; the others barely move. The window's gain is not from the fit: with the start
  weights it is +0.100 (capo) and +0.032 (standard), against +0.063 and +0.025.
- E1's margin 1 was picked after scoring margins against these keys (STATE.md) but does not inflate the ladder: margin
  0 / 2 give 0.834 / 0.826 on capo, margin 0 0.857 on standard (e0634 to e0636), against 0.829 / 0.854 (`margin/`).

## 3. Twenty notes the window moved (capo; chain2-given-off against chain2-given-tool, same notes)

`G/work/e3-verify/window_moves.py`, out `moves_capo.txt`, matched to the key with gtr-eval's rule (50 ms, 50 cents).
56 notes change place: **51 moved to the key's place, 0 moved away from it or to another wrong place, 5 are invented
notes** (no key note); the 20 evenly spaced: **18 right, 0 wrong, 2 invented** (51 = 676 - 625, the two cells' right
places). Standard: all 17 moved notes go to the key's place (`moves_standard.txt`; 580 - 563 = 17).

## 4. LADDER.md's claims against files

- Tables: `check_tables.py` checks every main-number cell, detail row (all seven columns), fixed point and window
  gain against `ladder.json`: 148 rows and cells, 0 mismatches.
- Hand off equals AO-082's choosers (`pair_chains.py`, 3 ms and pitch): 815/815, 628/628, 679/679 with chain-5;
  882/882, 610/611, 734/734 with chain-2. Holds.
- Weights table and accepted order: all in `G/loop/e3/tune_capo.json`, `tune_capo_open_win.json`. Soft win 3, 4, 8
  has no run file; re-run (`softwin/`, e0628 to e0633): 0.8699 key, 0.8294 chain-2, as said.
- `error_types.txt` (no script kept): recomputed (`error_types.py`), every count equal. 99/106 capo, 54/58 standard,
  61 of 68 with the perfect window, ceiling 99 / 55 / 21: hold.
- `window_stats.txt` widths 6.04 / 3.35 / 5.25, tool 5.53 / 4.86; E1 coverage 0.9946 / 0.9982 (`v0_m1/score.json`);
  window SHA-256 prefixes `721a67f80039`, `188c31f5a343`; soft fallbacks 82 / 0, 83 / 21, 86 / 0, 1 either way; hard
  against soft 18 / 8 / 18 pairs, 6 differ by 0.0015; 0 drops; at most 0.166 s a cell; wrong-tuning cost 0.085 to
  0.110 on capo; chain2f's one removed note; 22 nylon cells not run (G/loop/hand/ still absent): all hold.

## PROBLEMS

1. **Capo's numbers are fitted, and not marked.** Where: LADDER.md "Weights", the capo tables, "Against Opus". What:
   the weights maximise capo's main number against capo's key, and two of the four objective cells are the non-assisted
   capo chain2 cells. Evidence: section 2's table (the fit adds +0.087 / +0.049 on capo, +0.006 / -0.002 on standard, 0
   on nylon). Fix: mark capo's rows "weights fitted on this key"; quote standard and nylon as the out-of-sample
   numbers, or fit leave-one-song-out; say the window's gain holds under the start weights (+0.100 / +0.032).
2. **Kit arm numbers on another basis.** Where: the kit-arm detail rows and "Against Opus". What: the kit arm's of
   matched (0.966 / 0.798 / 0.941) and onset F1 (0.904 / 0.688 / 0.908) are GP5 read-back numbers (BLIND-RESULTS.md
   tables), set beside the solver's tab-list numbers. Evidence: `G/blind/results.json` `attempts/c1..c3/tools/protocol`:
   on the list the kit arm has of matched 0.965 / 0.774 / 0.941 and onset F1 0.919 / 0.850 / 0.918. So "onset F1 0.904
   / 0.908 against chain-2's 0.920 / 0.892" is 0.919 / 0.918 against 0.920 / 0.892 on one basis. Fix: use the list
   numbers, or label them GP5.
3. **Nylon "with the tool window".** Where: "What no fret window fixes". What: "With the tool window and the key's
   notes ... all 21 on nylon", but nylon has no tool cell. Evidence: `error_types.txt` has nylon off, perfect and
   ceiling only. Fix: "(nylon: no window)".
4. **Claims typed in, not computed.** Where: `make_ladder_records.py` lines 121 (soft win 3, 4, 8) and 124 to 127
   (the hand-off pairing counts); `error_types.txt` and `window_stats.txt` have no script. What: no file shows how
   they were made. Evidence: each is true (sections 4 and 2 re-made them). Fix: keep the scripts and outputs (mine are
   in `G/work/e3-verify/`).
5. **Two ladder runs at once.** Where: the ledger and `cell.json`. What: the same cells were scored twice in the same
   second (e.g. e0347 and e0348 at 01:26:03, nylon key-given-off). For 46 cells `cell.json` and `ladder.json` give
   different (identical-valued) eval ids, e.g. capo chain2-wrong-tool-soft e0275 against e0273. Fix: a lock in
   `run_ladder.py`; build `ladder.json` from each `cell.json`.
6. **Nit, grouping wording.** LADDER.md: notes "within 35 ms of each other"; `group_notes` measures from a group's
   first note. Fix the sentence.
