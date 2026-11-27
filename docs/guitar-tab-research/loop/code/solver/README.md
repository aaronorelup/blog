# solver: a plain string-and-fret solver (E3), callable bar by bar (E4)

`solver.py` turns notes (onset, offset, pitch), a tuning, the capo and optionally a hand window into the string and
fret of every note: a Viterbi (min-sum dynamic programme) over onset groups. No Opus, no song-specific value: all it
knows about a recording comes from its arguments. Python 3 with numpy (`G/tools/venv-torch/bin/python`, or the eval
venv). About 0.1 s for a whole song (738 to 764 groups).

## The model

- **Groups.** Notes whose onsets lie within 35 ms of a group's first note are one group.
- **State of a group.** Every note on its own string at a fret 0 to 20 counted from the capo
  (`pitch = tuning[6 - string] + capo + fret`), plus `h`, the fret of the hand's index finger (1 to 20); the hand
  covers frets h to h+3.
- **Costs inside a group:** `span` per fret a fretted note lies outside the hand's four-fret box (so a group spanning
  more than 4 frets always pays); `height` x the group's mean fretted fret; `open` per open-string note; the window
  (below). **Between groups:** `move` per fret the hand moves; `ring` for each note put on a string that still rings
  from the previous group (its offset more than 50 ms after the new onset) with another pitch.
- **The window** (`--window hand_window.csv`, frets from the capo; columns t, lo, hi, conf, lost; the row nearest to a
  note's onset applies). `--window-mode hard`: a fretted note outside [lo, hi] is forbidden; `soft`: it costs `win`
  per fret outside. Open strings are always allowed; lost rows (or empty lo/hi) give no constraint. Under hard, a group
  with no allowed state falls back to soft for that group (`stats.soft_fallback_groups`). A pin overrides the window.
- **Drops.** A note no string can play (pitch out of range, more notes than strings) is dropped at cost `drop`
  (`stats.dropped`); it is left out of `answer.json`.
- **Alternatives.** A backward pass gives, for every note and each of its places, the cost of the best whole path with
  the note there (exact min-marginals under the model). `delta` = that cost minus the best path's cost (0 = the chosen
  place).

## Weights (set once on the capo song, never per song)

`move 0.4, height 0.1, span 1.0, ring 0.0, open 0.0, open_win 0.0, win 2.0, drop 5.0` (`DEFAULT_W` in
`solver.py`; `open_win` charges an open string when the same pitch has a fretted place inside the window: tried, kept off). Found by
`tune_weights.py` (coordinate search, 3 rounds, objective = mean main number over four capo cells; log in
`G/loop/e3/tune_capo.json`); `LADDER.md` in the records says which values were tried and why these were kept.
`--weights move=0.2,ring=0.3` overrides them for an experiment; never per song in a reported run.

## Command line

```
solver.py --notes notes.csv --tuning 40,45,50,55,59,64 --capo 3 \
  [--window hand_window.csv --window-mode hard|soft] [--filter-window] \
  [--t0 S --t1 S] [--pins pins.json] [--context ctx.json] [--weights k=v,...] [--max-fret 20] [--top 3] \
  [--answer answer.json] [--json-out result.json] [--stats-out stats.json]
```

- `--notes`: CSV with `onset,offset,pitch` (other columns, such as a string and fret, are ignored) or JSON (a list, or
  an object with `notes`, such as a truth file: its strings and frets are ignored too).
- `--tuning`: open strings as MIDI numbers, string 6 to string 1, without the capo; `--capo`: the capo fret.
- `--filter-window`: first removes the notes the window cannot place (no open string with that pitch and no fretted
  place inside the window at the onset; lost rows keep the note): the ladder's `chain2f` notes.
- `--answer`: the kit's `answer.json` (validate with `G/tools/kit/validate_answer.py`); `key`, `chords`, `beats`,
  `downbeats` and `tempo_bpm` are fixed placeholders that are never scored, `tuning_offset_cents` is 0; same-string
  overlaps are trimmed (offsets are not scored).
- Prints the stats as one JSON line.

### A time range, for the loop (E4)

`--t0 --t1` solve only the notes with `t0 <= onset < t1`. `--context ctx.json` is the previous group's state, so the
range continues the hand and the ringing strings from where the last range ended:

```json
{"notes": [{"onset": 12.31, "offset": 12.9, "pitch": 55, "string": 3, "fret": 0}], "hand": 5}
```

(`hand` may be null: then it is taken as the lowest fretted fret, or left free.) `--pins pins.json` fixes places,
e.g. ones Opus has settled from a frame; each pin matches the note within 30 ms with the same pitch:

```json
[{"onset": 37.33, "pitch": 58, "string": 3, "fret": 0}]
```

`--json-out` writes:

```json
{"path": [{"onset": .., "offset": .., "pitch": .., "string": .., "fret": .., "hand": ..}],
 "alternatives": [{"onset": .., "pitch": .., "places": [{"string": 3, "fret": 0, "cost": 41.2, "delta": 0.0},
                                                       {"string": 4, "fret": 5, "cost": 41.6, "delta": 0.4}]}],
 "last_state": {"notes": [...], "hand": 5},
 "cost": 41.2, "stats": {"notes": .., "groups": .., "soft_fallback_groups": .., "dropped": .., "seconds": ..}}
```

`last_state` is the next range's `--context`. From Python: `import solver; solver.solve_range(notes, tuning, capo,
window=solver.Window(path), mode="hard", t0=.., t1=.., context=.., pins=[..])` returns the same dictionary
(`notes` from `solver.load_notes(path)`).

## Other files here

- `key_windows.py <truth.json> <dir>`: the two ASSISTED windows made from an answer key: `perfect.csv` (each bar's key
  frets, one either side) and `ceiling.csv` (each onset group's own key frets, no margin). Scoring aids, never a tool.
- `tune_weights.py <out.json> [window.csv]`: the one-time weight search on the capo song (eval venv, needs mir_eval).
- `run_ladder.py [song ...]`: E3's ladder (every cell's answer, scores, eval ids) into `G/loop/e3/<song>/`; one run at
  a time (lock `G/loop/e3/.run_ladder.lock`); resumable, re-runs a cell when its notes, window, weights or the solver
  change (SHA-256). Scores each cell against all key notes and against the heard ones (conf not "tab"). Tunings: given,
  wrong (`wrong_tuning.py`), finder (read from `G/loop/e3/<S>/inputs/finder_tuning.json` once E2 writes it). The tool
  window is E1's published one (`G/loop/hand/<S>/hand_window.csv`) when it exists, else its development window; chain2f
  uses `hand_filter.py` when E1 has published it, else `solver.placeable_in_window` (the same rule). Start-weight cells
  (the weight search's start, for the out-of-sample check) go to `G/loop/e3/<S>/startw/`.
- `wrong_tuning.py [song ...]`: the "wrong" tuning rung with its evidence (`G/loop/e3/<S>/inputs/wrong_tuning.json`).
- `ladder_checks.py`: every count the records state that is not a cell's own score (error kinds, window widths, the
  hand filter's removals, the pairing with AO-082's choosers, soft-weight plateau) into `G/loop/e3/checks.json`.
- `make_ladder_records.py <ladder.json> <tables.md>`: the records, built from each cell's `cell.json`; checks every eval
  id against the ledger (subcommand, answer file and its SHA-256, value) and stops on a mismatch.
