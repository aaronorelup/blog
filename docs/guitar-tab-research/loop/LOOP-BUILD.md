# The loop as built (E4 to E6)

How the loop of `LOOP-DESIGN.md` was built, how to start each run, and what its blind dry run showed. Code in
`G/loop/tools/loop/` (G = `/home/user/gtv`); runs in `G/loop/runs/<name>/`. Built by the loop-builder agent,
2026-11-27.

## Start a run

Every run is two commands: `prep.py` writes the inputs once, `driver.py` runs the units in order (serial by design),
saves after every call and resumes after a restart at the first unfinished unit. Start the driver detached so a
restart of the calling agent does not kill it:

```
L=/home/user/gtv/loop/tools/loop; R=/home/user/gtv/loop/runs
cd $R && $L/prep.py <S> <run> --notes l2 --tuning <6 MIDI, string 6 to 1> --capo <N> --window <hand_window.csv>
cd $R/<run> && setsid nohup python3 $L/driver.py $R/<run> > driver.out 2>&1 < /dev/null &
```

| run | prep.py arguments | driver.py arguments |
|---|---|---|
| L1 (key's notes) | `--notes l1 --tuning <given> --capo N --window <csv>` | (none) |
| L2 (main) | `--notes l2 --tuning <given> --capo N --window <csv>` | (none) |
| L3 (tuning found) | `--notes l2 --tuning <E2's answer> --tuning-source found --capo N --window <csv>` | (none) |
| L4 (hand off) | `--notes l2 --tuning <given> --capo N --window none` | (none) |
| E6 state emptied | as L2, a new run folder | `--state off` |
| E6 revisits off | as L2, a new run folder | `--revisits off` |
| W2 (whole song, E5) | as L2, a new run folder | not the driver: `setsid nohup python3 $L/w2.py $R/<run> > w2.out 2>&1 &` (90 min, then it assembles the answer) |

L2 on the capo song, as the orchestrator asked:

```
cd $R && $L/prep.py capo l2-capo --notes l2 --tuning 40 45 50 55 59 64 --capo 3 --window <E1's capo hand_window.csv>
cd $R/l2-capo && setsid nohup python3 $L/driver.py $R/l2-capo > driver.out 2>&1 < /dev/null &
```

Given values: capo 3 / 0 / 0; tunings capo `40 45 50 55 59 64`, tuning (nylon) `38 43 48 53 57 60`, standard
`40 45 50 55 59 64`. prep.py finds the anchors next to the window file, then in `G/loop/hand/<S>/`, then the newest
`G/loop/e1/<S>/anchors*.json`, and a `track.json` beside the window (or `--anchors`, `--track`). The nylon song has
no anchors yet: until E1 publishes them, only its L4 (`--window none`) can be prepared. Units on the nylon song are 2 to
4 s cuts at gaps (its downbeats are unsure); `--units bars|gaps` overrides.

Driver options: `--from N` (start again at unit N: units N and later are forgotten and their folders kept as
`.prevT`), `--to N` (stop before unit N), `--hard-min 15` (a call is killed after this; its outputs are still used if
they validate), `--fake` (plumbing test: no model calls, the solver answers). After a run, the orchestrator scores it:
`$L/score_run.py $R/<run> /home/user/gtv/truth/<S>/<S>.truth.json --solver` (never called by the driver).

## The files

- **Driver side** `<run>/` (never shown to a writer): `run.json` (slot, rung, blind folder), `progress.json`,
  `tab.json`, `changes.jsonl` (every change: before, after, why, by whom), `units_log.jsonl` (every call: wall time,
  tokens, list cost, audit flags, validity, triggers), `driver.log`, `answer.json`, `answer.gp5`, `score/`.
- **Writer side** `G/loop/bw/<random id>/` (linked as `<run>/blind`): neutral names only, no slot name, title, key or
  score. `inputs/` (audio.wav and video.mp4 as hard links, candidates.csv, units.json, similar.json, beats.txt,
  config.json, hand/), `tools/` (the writer's tools and TOOLS-BAR.md), `state.json` (the carried state), `tab.json`,
  and one folder per call: `u007/` (a unit), `u007.r1/` (its first revisit), `tuning.u012/` (L3's tuning review).
- **Code**: `prep.py` (inputs), `pack.py` (a unit's pack), `solve.py` (adapter to E3's `solver.py` `solve_range`:
  places, the solver's choice, exact next-best costs), `draw.py` (spectrogram, render + residual), `neckpic.py` (the
  hand-reach overlay, cropped), `make_tools.py` (the writer's tools), `validate.py` (the driver's checks; the writer's
  `check.sh`), `driver.py`, `audit_unit.py` (every tool call of a transcript), `score_run.py`, `w2.py`;
  prompts `WRITER.md`, `REVISER.md`, `TUNER.md`, `W2.md`.

## How the pieces meet the design

- **Candidates**: chain-2's notes as the base, the five models' extra notes merged (one pitch within 50 ms is one
  candidate, with its supporters). On the capo song: 882 base + 971 alternatives (899 held by one model, mostly Basic
  Pitch). The writer must decide every base candidate and every candidate two or more models hold; one-model
  alternatives it may ignore.
- **Validation** (`validate.py`): pitch = tuning + capo + fret, strings distinct within an onset group (35 ms), onsets
  inside the unit, every required candidate kept or dropped, reasons for drops of 2+ model notes, for added notes, for
  places other than the solver's and for fretted notes outside the window. A rejected bar is asked again once with
  the errors; then the solver's proposal stands in (logged as `fallback`).
- **State** (`state.json`), merged by rule: tuning evidence per string (agree / conflict units, pitches heard), shape
  book (a seen shape replaces an unseen one; others are kept as `other`), hand per unit, model habits counted by
  model and kind, player habits, repeats, unit confidences, unsure units.
- **Revisits**: shape seen differently (1), tuning change in L3 (2), repeat of an unsure unit (3), a model habit naming
  earlier units (4), every 8 units over the unsure ones (5), plus the writer's own `revisit.json`. At most 2 revisits
  of one unit and 4 after any one unit; a reviser's lessons never trigger more revisits.
- **L3**: a string with conflicts in 3 units and no support since gets one tuning-review call; a change re-places
  every unit with notes on that string through revisits.
- **E6 `--state off`**: the state is emptied before every unit and no similar units are shown; the solver keeps the
  previous unit's last chord as context.

## The dry run (L2, capo song, units 0 to 2)

DRYRUN

## What is still weak

WEAK
