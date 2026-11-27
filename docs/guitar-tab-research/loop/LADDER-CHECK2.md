# LADDER-CHECK2: an independent check of E3's second pass

Checked 2026-11-27 by agent `e3-verify2`, which built none of E3 and changed none of its files. G = `/home/user/gtv`; my
scripts and outputs: `G/work/e3-verify2/`; my gtr-eval runs: e1228 to e1257 in `G/loop/ledger/evals.jsonl`. Solver SHA-256
`a159359e...` in `ladder.json` and every `cell.json`, window SHA-256 prefixes as LADDER.md gives them.

## 1. Seven cells re-run and re-scored (`rescore.py`, `rescore.json`)

I ran each cell's solver again from its own `cmd.sh` into my folder, then scored it with gtr-eval 0.12.1 (`tab`, `notes`,
and `tab` against my own heard key). In all 7 cells my `answer.json` is byte for byte the stored one.

| cell | main, cell.json / mine | heard, cell.json / mine | onset F1 | my evals |
|---|---|---|---|---|
| capo chain2-given-tool (FITTED) | 0.833129 / 0.833129 | 0.840999 / 0.840999 | 0.920448 | e1228-e1230 |
| capo startw chain2-given-tool | 0.791411 / 0.791411 | 0.797635 / 0.797635 | 0.920448 | e1231-e1233 |
| standard chain2-given-tool | 0.854197 / 0.854197 | 0.879931 / 0.879931 | 0.891720 | e1234-e1236 |
| standard startw chain2-given-off | 0.823270 / 0.823270 | 0.845626 / 0.845626 | 0.891720 | e1237-e1239 |
| nylon chain2-wrong-tool (new rung, nylon window) | 0.619427 / 0.619427 | 0.640288 / 0.640288 | 0.832930 | e1240-e1242 |
| nylon chain2-given-tool (nylon window) | 0.800955 / 0.800955 | 0.841727 / 0.841727 | 0.832930 | e1243-e1245 |
| nylon key-wrong-tool (A), extra | 0.780255 / 0.780255 | 0.778777 / 0.778777 | 1.000000 | e1246-e1248 |

## 2. Heard share without gtr-eval (`heard_mine.py`, `heard_mine.json`)

"Heard" here means a key note whose conf is not "tab". That gives 761 / 556 / 583 of 815 / 628 / 679 notes; standard has 11 notes
with conf "audio". My matching: same MIDI pitch, onsets within 50 ms, pairs taken greedily from the smallest gap; a
right place is the same string and fret. I scored the heard notes alone, then all notes counting the heard ones. Both
ways agree with the records:
capo chain2-given-tool 640 / 761 = 0.840999 (of matched 640 / 735 = 0.871); nylon chain2-wrong-tool 356 / 556 = 0.640288
(0.743); standard chain2-given-tool 513 / 583 = 0.879931 (0.923). Main shares from the same code: 679 / 389 / 580 right.

## 3. Labels, basis, lock, records

- **Kit arm on the list basis** (`kit_rescore.py`, e1249 to e1257): I re-scored `G/blind/c1..c3/tools/answer.json`.
  Main 0.944785 / 0.659236 / 0.874816, of matched 0.964912 / 0.773832 / 0.941363, onset F1 0.919355 / 0.849881 / 0.918486,
  heard 0.961892 / 0.683453 / 0.905660. These equal `results.json` (protocol, `chain_style.tab_list_*`) and `ladder.json`.
  The GP5 numbers appear only in the rows marked GP5 (`notes_gp5_onset_f1` 0.904 / 0.688 / 0.908). Fixed.
- **FITTED:** capo's kept-weight rows carry the label in its main table, its detail rows and the window-gain table, and
  the first finding says FITTED. The start-weight rows are on all songs. The gains from the fit are +0.0871 / +0.0417 on capo
  (off / tool) and -0.0016 to +0.0059 elsewhere (`claims.json`), as stated.
- **Lock** (`locktest.py`, `locktest.json`): I held `G/loop/e3/.run_ladder.lock` and started `run_ladder.py standard`. It printed
  "another run holds ... waiting" and was still waiting at 6 s. I killed it: no file changed and the ledger gained 0 lines.
- **Records:** `ladder.json`'s 138 rows (cells, start-weight cells, fixed points) equal each `cell.json` / `fixed.json`.
  Its 414 eval ids match the ledger on subcommand, est path, the est file's SHA-256 now, and value (`check_records.py`).
  No eval was made twice in one second. The 8 repeated soft-win evals came from the failed r1343 run and then r1344,
  with the same values. `make_ladder_records.py`, re-run into my folder, rebuilds `ladder.json` and `tables.md` byte for byte
  (526 ids, 0 mismatches). LADDER.md = e3-fix's `head.md` + `tables.md` + `tail.md`.
- **Prose claims** (`claims.py`, `errkinds.py` with my own matching) all hold:
  - wrong-place kinds 99 of 101, 54 of 58, 21 of 21 (chain-2: 99 of 102, 48 of 50, 13 of 13); the ceiling leaves 99 / 55 / 21;
  - nylon's 129 C4 (114 on s1f0, 15 on s2f3) all go to s2f3, and its 18 D4 go from s1f2 to s1f0;
  - the wrong rung costs 0.1863 / 0.1815 in every window cell; ceiling - tool 0.00245 / 0.00147, tool - perfect 0.0589 / 0.025;
  - soft fallbacks: 4 / 21 / 35 at the ceiling, 6 for chain-2's notes on the wrong tuning (tool), 82 in the first pass;
  - hard against soft: 9 / 18 / 9 pairs, 3 differ, at most 0.001472; 0 drops; at most 0.191 s a cell;
  - the weight table matches `tune_capo.json` and `tune_capo_open_win.json`; r1340 took 534.68 s (`/home/user/gtr/ledger/runs.jsonl`).

## PROBLEMS

1. **The steel wrong rung is dropped only because of which notes the rule reads.** Where: LADDER.md "What changed",
   `wrong_tuning.py`. What: the capo-aware lowest-note rule gives the true tuning on chain-2's notes, where the lowest recurring
   note is A#2. On AO-082's own lowest-note inputs (t-02: n-01; t-02-hint: n-01-hint) the same rule gives a 6th string of 36 (C2)
   or 39 (D#2) on capo. Those results sit in `G/loop/e3/capo/inputs/wrong_tuning.json`
   ("same_rule_on_other_notes_reference_only"), and LADDER.md does not mention them. The 39 tuning is exactly the
   first pass's frozen capo rung. E2-TUNING.md counts t-02's sound-only answer as capo 5 of 6 (D#2). Standard gives E2 from
   every note set, so dropping its rung holds. Fix: say this in LADDER.md. Either keep a capo wrong rung from t-02-hint's notes
   (39; re-run it with the new window) or give the reason for using chain-2's notes.
2. **Double rounding in two tables.** 21 of the 339 table cells I checked are 0.001 off the value rounded from full precision. The
   First pass table has 19: standard key off heard is 0.888 but cell.json gives 0.888508 (0.889); nylon heard is 0.102 for 0.102518;
   capo key tool is 0.759 for 0.759509. The window-gain table has 2: standard ceiling - off is +0.026 for +0.026510. Cause:
   `make_ladder_records.py` lines 235 and 249 print the 4-decimal values from `ladder.json` at 3 decimals. Fix: print from the full values.
3. **FITTED missing in four places.** The "Heard notes" finding (capo 0.841 against 0.833), "Against Opus" (the solver's
   capo main 0.833 and heard 0.841; only "of matched" is labelled), the plan's-rule line (+0.066), and the First pass
   table's two capo rows. All of these use the kept weights. Fix: add the label, as the tables have it.
4. **Nit, weight table.** "height ... 0.7801 -> 0.8052 in round 1". The height steps took the objective from 0.7810 (after move
   0.05) to 0.8052 (`ladder.json` weight_search.accepted_steps); 0.7801 is the start.
5. **Nit, lock.** `run_ladder.py` opens the lock with "w" before `flock`, so a waiting run blanks the holder's pid line (my test
   did; I restored the line). `ladder_checks.py` and `make_ladder_records.py` take no lock, so either can run during a ladder
   run. Fix: open with "a" and truncate only after the lock is held; take the lock in the other two scripts.
6. **Nit, wording.** "the hard rule fails in 6 groups of chain-2's notes against 0 under the true tuning" holds for the tool and
   perfect windows. Under the ceiling it is 24 against 21. LADDER.md calls the nylon rung "the brief's", but the
   `sessions/LOOP.md` on this box (00:53) still says "chain-1's wrong one" for E3. The rule comes from STATE.md 01:45; cite that.
