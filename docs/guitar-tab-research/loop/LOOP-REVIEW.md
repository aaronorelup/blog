# LOOP-REVIEW: an adversarial review of the loop before E4

By the loop-review agent (not its builder), 2026-11-27: `G/loop/tools/loop/` at 02:00 UTC, `LOOP-BUILD.md`, the dry runs
`G/loop/runs/dry-capo-l2/` (units 0-2, 3 revisits) and `dry2-capo-l2/` (units 0-3). No code changed. Evidence:
`G/work/loop-review/` (vtest.py, vtest2.py, units_count.py, calls.py, fake_transcript.jsonl, guard_window.log) and
restart copies `G/loop/review-sim/{A,B}` (driven with `--fake`: no model call).

**Verdict: not ready.** Four blocking problems (a leak, an audit blind to relative paths, no restart from before a void,
a driver kill that leaves its writer running); the rest holds, with the minor problems at the end.

## 1. Leaks: everything a writer can read

- **Paths opened** (grep of every `open`, `subprocess` and path constant in prep, pack, driver, draw, neckpic, solve,
  make_tools, validate and E3's `solver.py`): prep.py reads the sound and video, `G/experiments/<S>/{c-01/beats.txt,
  chain-2,n-01..n-05}`, the window and anchors, and for L1 only the key (onset, offset, pitch copied: amendment 4 holds).
  Everything else reads the blind folder, the hand-reach code, the kit and the venvs. The writer's tools call only those.
- **One pack, every file** (dry 1 `u001`: PACK.md, candidates.csv, solver.json, unit.json, state.json, similar.md,
  .finished_context.json, spectrogram.png, neck.jpg, PROMPT.txt, and after the call run.json, run.meta.json,
  audit.json, blind_run.log, render/) and `inputs/` (config, candidates, units, similar, beats, hand/anchors.json,
  hand_window.csv, tips.jsonl): grep over both blind folders for the three keys' title and player words, `truth`,
  `/songs/`, `/experiments/`, `labels`, `blind-map`, `AO-08`, `/blind/b`: no hit (only "score" = the similarity score).
  Every absolute path in them points into the blind folder, the loop code or a venv. Container tags: encoder and handler only.
- **LEAK: the sound and video are hard links** (`prep.py` `link()` = `os.link`): `stat -c %h` reads 3 for
  `inputs/audio.wav` and 5 for `inputs/video.mp4` in `bw/adc4ee37`. `find -samefile` names `G/songs/capo/capo.mono.wav`
  and `capo.mp4`, whose folder also holds `tab.png` and `tab_pages/`; on the nylon song it would name `G/blind/b2/`.
  AO-082 required `%h` = 1 (`video/BLIND.md` section 3); the amendment requires copies.

## 2. The tool limit and the rules

- **Transcripts** dry 1 `u001` (15 calls), dry 2 `u000` (15) and `u003` (9): Bash, Read and Write only. Reads: PACK.md,
  candidates.csv, similar.md, TOOLS-BAR.md, state.json, .finished_context.json, unit.json, config.json, the pack's and
  its own pictures, residual.png. Bash: `ls` of its folder, tools and inputs; spec.sh, overlay.sh `--plain`, render.sh,
  check.sh; heredocs writing bar.json and lessons.json; two Python scripts in the harness scratchpad that read only
  `inputs/audio.wav`. Nothing outside its pack, the run's tools and inputs and that scratchpad; no network, git or search.
- **AUDIT HOLE.** `audit_unit.py` voids only absolute paths into forbidden folders. A fake transcript holding
  `cat ../../../../truth/capo/capo.truth.json`, `cd /home/user/gtv && cat truth/capo/...`, a Python string-built path to
  the key, `Glob **/*.truth.json` at G, `find .. -samefile ../inputs/audio.wav` and `cat ../u000/lessons.json ../tab.json`
  gets no VOID (four WARNs, two silent). Only `Read /home/user/gtv/truth/...` and `find /home...` void. The driver only
  logs a void and goes on. The guard cannot stand in: it watches folders by inotify (no process id), and in the dry
  runs' window (01:36:40-02:01:50, 188,527 lines) other lanes opened all three keys (01:36:50, 01:38:12, 01:38:15) and
  read `G/songs/capo/capo.mp4` about 19,000 times.

## 3. Correctness

- **Validation** (vtest.py, vtest2.py on dry 2 `u003`'s bar): rejected: a wrong fret or string for the pitch; two notes
  on one string within 35 ms; an onset over 30 ms outside the unit; a base candidate neither kept nor dropped; a new note
  when the notes are given. Accepted: a new note on string 3 at 11.50 s while candidate 67 rings on string 3 to 12.39 s,
  and one 40 ms after 67 (only onset groups are checked); a kept candidate moved 1.2 s inside the unit; on L1 a changed
  pitch or onset with a `why`; a unison "new" copy of a kept note on another string.
- **Restart** (copies of dry 2 at unit 3, `--fake --revisits off`). Killed after the writer finished, before the merge:
  the call is reused, state.json and tab.json come out identical to the original. Killed after state.json was saved,
  before progress.json: the lessons merge twice (`bp|split` 14 to 16, `mt3|invents` 1 to 2, agree units and the repeat
  listed twice) and units_log gets a second row with the same cost. A call killed by the hard limit is never reused
  (needs exit 0): paid again.
- **Killing the driver leaves its writer running.** `blind_run.sh` runs under `timeout`, which makes its own process
  group: killing the driver's pid, or its group, leaves timeout, blind_run.sh and claude alive (same chain tested with
  `sleep`). On restart the driver renames the unit folder `.aborted<T>` and calls a new writer; the orphan keeps writing
  by absolute path (`{PACK}` in its prompt) into the new folder, and its blind_run.sh writes run.json and run.meta.json
  there when it ends. An aborted call is never audited and its cost is never logged.
- **A void cannot be restarted from before it.** `--from 2` on a copy forgot units 2-3 in progress.json and tab.json
  but kept them in state.json (unit_conf of 2 and 3, "3 repeats 2", habits naming 2 and 3). No copy of state.json or
  tab.json is kept before each unit; revisions of earlier units made after unit N stay; the voided folders stay in the
  blind folder as `u002.prev<T>/`, readable by later writers.
- **Lessons** merge by code rules only (evidence appended, counts added, a seen shape replaces an unseen one); never re-judged.
- **Revisits** (code paths): 1 shape seen otherwise (earlier groups, same pitch set, other places); 3 repeat of an unsure
  unit; 4 a habit naming earlier units (only where a weak note of that model was kept); 5 after units 7, 15, ... over
  the unsure among the last 8; plus revisit.json; a reviser's lessons trigger nothing; caps 2 a unit, 4 a round. Trigger 2
  (L3) departs from the design: every affected unit is queued, then the queue is cut silently to the 4 lowest-numbered;
  the rest keep the driver's nearest-fret reflow and are neither solved again nor revisited.
- **`--revisits off`**: `queue()` returns before queueing: no revisit call. **`--state off`**: state.json is emptied
  before every unit (tuning kept), no similar units, the pack's state is empty. But `inputs/similar.json` stays,
  `spec.sh` draws the finished string:fret of any stretch from tab.json, and `../uNNN/lessons.json` and `bar.json` are
  readable with no audit flag; and unit_conf and unsure are wiped with it, so triggers 3 and 5 never fire: the state-off
  run also has fewer revisits than L2.

## 4. Pack quality (dry 1 `u001`, dry 2 `u003`)

- spectrogram.png: note-name grid, unit edges, beats, white base boxes and cyan alternatives with ids, finished notes in
  green with string:fret. The candidates are readable; ids overlap where two start together (21 and 23 at 3.79 s).
- neck.jpg: 8 tiles, gold fret numbers counted from the capo, the window band from the capo's edge to fret 5. Checked on
  the inlays: dots at 2, 6, 9 (double), 12 and 14 from the capo (4 hidden by the hand) = frets 5, 9, 12, 15, 17 with capo 3. The window
  and frets are drawn right. Fingertip labels are small; the grid runs on past the capo onto the headstock.
- render/residual.png: readable, noisy (steady blue bands at B4, D5, F5); red over the right context (next unit unwritten).

## 5. Cost (units_log.jsonl of both dry runs; units by prep.py's rules, units_count.py)

- 7 writes: $0.623 list on average (sd 0.087), 15,505 output and 249,870 input tokens (incl. cache), 2.60 min a call;
  dry 2: 4 units in 10.15 min = 2.54 min a unit with packs. 3 revisits: $0.425, 1.50 min, 8,868 output. No re-ask, no
  fallback. Dry units held 15-21 candidates, the capo song's 25.4 (median 24, max 69): ranges run from the dry rate to +30 %.
- Units: capo 73, standard 56, nylon 53 (gaps) = 182 a rung, 728 writes for the twelve E4 runs. **Capo L2 run:** 73
  writes $45-59, 3.1-4.0 h, 1.1-1.5 M output and 18-24 M input tokens; 7-18 revisits (0.1-0.25 a unit) $3-8 and
  0.2-0.5 h: **about $49-67 and 3.3-4.5 h.**
- **Twelve E4 runs:** writes $454-590 plus revisits $31-77 = **about $485-670 list** ($40-56 a run), 11-15 M output and
  180-240 M input tokens, 33-45 h of serial calls = 8-11 h wall at four runs at a time (L1 and L4 a little less).

## PROBLEMS, ranked

1. **BLOCKING, leak.** `inputs/audio.wav` and `inputs/video.mp4` are hard links (`%h` 3 and 5): `find -samefile` names
   `G/songs/<S>/` (beside the tab pictures) or `G/blind/b2/`. Copy them (`shutil.copyfile`) and check `%h` = 1 at start.
2. **BLOCKING, audit.** Relative, `cd`-then-relative, string-built and Glob paths to the keys, `find .. -samefile` and
   reads of other units' folders pass `audit_unit.py`; the driver ignores a void; the guard has no process ids. Resolve
   each path against the call's folder and `cd` targets, void anything above the blind folder outside the run's tools
   and inputs, and stop the driver at a void.
3. **BLOCKING, void restart.** No state.json or tab.json copy before each unit; `--from N` keeps the voided units'
   lessons and later revisions and leaves their folders readable. Snapshot both before every unit, restore them on
   `--from N`, move the voided folders out of `G/loop/bw/`.
4. **BLOCKING, kill.** Killing the driver orphans the running writer, which then writes into the re-made pack; aborted
   calls are neither audited nor costed. Trap SIGTERM in the driver and kill the call's group (record its pgid), and
   audit and log every `.aborted` call.
5. MINOR, E6. `--state off` leaves similar.json, spec.sh's finished notes and earlier unit folders readable, and wipes
   unit_conf and unsure, so revisit triggers 3 and 5 never fire: the state-off run differs from L2 in revisits too.
6. MINOR, L3. A tuning change revisits only the 4 lowest-numbered affected units (silently cut); the rest are never
   solved again. The round cap also drops sweep and habit items without a log line.
7. MINOR, scoring. `score_run.py` has no share over heard key notes (conf not "tab"), which the amendment asks for.
8. MINOR, validation. Same string while a note rings is accepted; a kept candidate's onset can move anywhere in the
   unit; L1 lets a pitch or onset change with a `why`; a unison duplicate is accepted.
9. MINOR, restart. A kill between saving state.json and progress.json merges the unit's lessons twice and logs its
   cost twice; a valid bar from a call killed by the hard limit is paid for again after a restart.
10. MINOR. Overlapping candidate ids; residual red over the unwritten right context; the source readable (WARN only).
