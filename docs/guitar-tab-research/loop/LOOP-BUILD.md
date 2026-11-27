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
cd $R && $L/prep.py capo l2-capo --notes l2 --tuning 40 45 50 55 59 64 --capo 3 \
  --window /home/user/gtv/loop/e1/capo/v0_m1/hand_window.csv     # or E1's published G/loop/hand/capo/hand_window.csv
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

Two blind runs of L2 on the capo song (tuning `40 45 50 55 59 64`, capo 3, window `G/loop/e1/capo/v0_m1/`), Opus 5.5
at effort max through `blind_run.sh`. Folders `G/loop/runs/dry-capo-l2/` (units 0-2) and `G/loop/runs/dry2-capo-l2/`
(units 0-3, after the fixes below; unit 3 repeats unit 2). Numbers from each run's `units_log.jsonl` and
`score/summary.json` (`score_run.py ... --solver`).

| run, unit | minutes | output tokens | input tokens (incl. cache) | list cost | notes kept / dropped | key right / invented |
|---|---|---|---|---|---|---|
| dry 1, u0 | 3.55 | 20,622 | 347,582 | $0.785 | 11 / 8 | 11 of 11 / 0 |
| dry 1, u1 | 2.58 | 14,926 | 259,355 | $0.603 | 12 / 9 | 11 of 11 / 1 |
| dry 1, u2 | 2.27 | 13,245 | 210,387 | $0.561 | 11 / 6 | 11 of 11 / 0 |
| dry 1, 3 revisits (u0 twice, u1) | 1.71, 1.63, 1.17 | 10,062, 10,094, 6,447 | | $0.478, $0.432, $0.365 | all "keep" | |
| dry 2, u0 | 2.68 | 16,435 | 208,683 | $0.633 | 11 / 8 | 11 of 11 / 0 |
| dry 2, u1 | 2.46 | 14,521 | 233,527 | $0.597 | 11 / 10 | 11 of 11 / 0 |
| dry 2, u2 | 2.57 | 15,779 | 350,006 | $0.671 | 11 / 6 | 11 of 11 / 0 |
| dry 2, u3 (repeat of u2) | 2.10 | 13,006 | 139,553 | $0.514 | 11 / 4 | 11 of 11 / 0 |

- **Score of the 3 units** (key cut to 0-9.59 s, 33 key notes; gtr-eval 0.12.1): dry 1: same string and fret 33 of 33
  = 1.000, 0 wrong place, 0 missed, 1 invented (an open G2 alternative held by two models, kept on the strength of a
  red band in the residual: scored right-to-wrong), onset F1 0.985, GP5 read back 0.970 (evals e0644-e0650). Dry 2:
  units 0-2 33 of 33, nothing invented; with unit 3, 44 of 44, onset F1 1.000, GP5 0.977 (e0651-e0657). The solver
  alone on the same units: 1.000 both times. These bars are easy (a held bass and one shape; almost every note has a
  single place in the window), so the dry run proves the plumbing and the rules, not the loop's worth.
- **Behaviour** (transcripts): every writer read PACK.md, candidates.csv and similar.md, looked at 4 to 7 pictures
  (spectrogram, neck, its own overlays and spectrograms), wrote bar.json, ran render.sh and read the residual, wrote
  lessons and ran check.sh; every bar passed on the first ask. Lessons were specific (the fingertip on string 6 read
  one fret high by the tool; Basic Pitch's octave inventions and re-onsets inside ringing notes; pull-offs to the
  open string; let-ring). Unit 1 and unit 3 named their repeats (u0, u2); unit 3, starting from unit 2's tab, took
  9 tool calls against 14 to 17. No writer recognised the piece. At this pace an L2 run of the capo song's 73 units is
  about 3 hours and $40 to $50 before revisits.
- **Audit** (`audit_unit.py` over all 10 transcripts, `score/audit.json`): no read outside the pack, the run's tools and
  inputs; no network, git, install, key or search command; only Bash, Read, Write, Edit, Glob, Grep. Warnings only:
  writers put scratch files in the harness's own per-session scratchpad (`/tmp/claude-0/<their folder>/`).
- **Fixed after dry 1** (in dry 2): similar.md lined the earlier tab up by the unit edges, so a repeat's notes sat
  0.3 s off and the `like` column was empty (now: from the downbeats, refined by lining the notes up; 13 proposals in
  u1, 11 in u3); a writer naming earlier units for a model habit sent each to a reviser that found nothing to change (3 calls,
  $1.28): the prompt now asks only for units the habit made wrong, and the driver opens one only if it kept a weak
  note of that model; TOOLS-BAR.md warns that a steady band in the residual is the General MIDI guitar's timbre; the
  auditor flagged a writer's own scratchpad and the word "claude" in a path as void (now a warning, and only a `claude`
  or `gh` command is void); spec.sh and render.sh failed before the first unit had a tab. After dry 2: candidates
  before the unit are no longer drawn over its finished (green) notes.

## What is still weak

- **The hand window is E1's v0** (one keyframe, no tracking): the writers saw it read the string-6 fingertip one
  fret high in every unit; on the standard song the v0 neck model is visibly off at 16-19 s. prep.py picks up E1's
  published files (`G/loop/hand/<S>/`, a `track.json`) when they land; the nylon song has no anchors yet.
- **The residual** is noisy: FluidSynth's overtones and the guitar body differ from the recording, so low red bands
  and blue bass overtones appear everywhere. Row whitening was tried and made it worse; the per-note `check.txt`
  (rise at the fundamental, unexplained onsets) is the better evidence. It misled one writer into an invented note.
- **Alternatives are many**: 971 on the capo song, 899 held by one model (mostly Basic Pitch octaves and re-onsets).
  Writers drop them well but spend tokens listing them.
- **Revisits are untested on hard bars**: no shape was seen differently, no repeat was unsure, no sweep fired in 4
  units. The L3 tuning review and its re-placing ran only with `--fake` (plumbing). Caps: 2 revisits a unit, 4 after
  one unit.
- **The solver comparison** in `score_run.py --solver` uses each pack's own solver proposal (context = the writer's
  finished previous unit, max fret 20 - capo), not E3's whole-song run; for E4's "L2 against the solver in the same
  cell" use E3's ladder cell.
- **Only serial units** (`--max-parallel 1`): each unit reads the state the last one left. Songs can run side by side
  as separate drivers (each call is one claude process; each pack build takes about 7 s of CPU).
- **W2** (`w2.py`) is built and its preparation and answer check tested, but no W2 session has run.
