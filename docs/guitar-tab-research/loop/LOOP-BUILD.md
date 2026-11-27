# The loop as built (E4 to E6)

How the loop of `LOOP-DESIGN.md` was built, how to start each run, and what its blind dry runs showed. Code in
`G/loop/tools/loop/` (G = `/home/user/gtv`); runs in `G/loop/runs/<name>/`. Built by the loop-builder agent and fixed
by the loop-fixer agent after `LOOP-REVIEW.md`, 2026-11-27. Every writer, reviser, tuner and W2 call now runs inside
`G/loop/tools/sandbox_run.sh`.

## Start a run

Every run is two commands: `prep.py` writes the inputs once (every file a copy), `driver.py` runs the units in order
(serial by design), saves after every call and resumes after a restart. Start the driver detached so a restart of the
calling agent does not kill it:

```
L=/home/user/gtv/loop/tools/loop; R=/home/user/gtv/loop/runs
cd $R && $L/prep.py <S> <run> --notes l2 --tuning <6 MIDI, string 6 to 1> --capo <N> --hand-dir <E1 folder> [--anchors <file>]
cd $R/<run> && setsid nohup python3 $L/driver.py $R/<run> --void-policy restart > driver.out 2>&1 < /dev/null &
```

| run | prep.py arguments | driver.py arguments |
|---|---|---|
| L1 (key's notes) | `--notes l1 --tuning <given> --capo N --hand-dir <dir>` | `--void-policy restart` |
| L2 (main) | `--notes l2 --tuning <given> --capo N --hand-dir <dir>` | `--void-policy restart` |
| L3 (tuning found) | `--notes l2 --tuning <E2's answer> --tuning-source found --capo N --hand-dir <dir>` | `--void-policy restart` |
| L4 (hand off) | `--notes l2 --tuning <given> --capo N --hand-dir none` | `--void-policy restart` |
| E6 state emptied | as L2, a new run folder | `--state off --void-policy restart` |
| E6 revisits off | as L2, a new run folder | `--revisits off --void-policy restart` |
| W2 (whole song, E5) | as L2, a new run folder | not the driver: `setsid nohup python3 $L/w2.py $R/<run> > w2.out 2>&1 < /dev/null &` |

L2 on the capo song with today's best window (E1 has not published `G/loop/hand/capo/` yet; when it does, give that
folder as `--hand-dir` and drop `--anchors`):

```
cd $R && $L/prep.py capo l2-capo --notes l2 --tuning 40 45 50 55 59 64 --capo 3 \
  --hand-dir /home/user/gtv/loop/e1/capo/v0_m1 --anchors /home/user/gtv/loop/e1/capo/anchors.v0.json
cd $R/l2-capo && setsid nohup python3 $L/driver.py $R/l2-capo --void-policy restart > driver.out 2>&1 < /dev/null &
```

- `--hand-dir` is a folder with `hand_window.csv`, `tips.jsonl`, `anchors.json` and `track.json` (E1's published
  `G/loop/hand/<S>/`); prep copies those four and nothing else (never a score file). `--anchors` / `--track` override;
  without anchors in the folder prep looks in `G/loop/hand/<S>/`, then the newest `G/loop/e1/<S>/anchors*.json`.
  `--window <csv|none>` still works (its folder is the hand dir). The nylon song has no anchors yet: until E1
  publishes them, only its L4 (`--hand-dir none`) can be prepared. Given values: capo 3 / 0 / 0; tunings capo
  `40 45 50 55 59 64`, tuning (nylon) `38 43 48 53 57 60`, standard `40 45 50 55 59 64`.
- **Resume**: run the same driver command again; it rolls back any half-applied step and goes on at the first
  unfinished unit. **Stop**: `kill -TERM $(python3 -c "import json;print(json.load(open('$R/<run>/driver.pid'))['pid'])")`
  (the running call's process group is killed with it). **After a void**: the driver stops with exit 3 and
  `<run>/VOID.json` (default `--void-policy stop`), or with `--void-policy restart` restarts once from the snapshot
  before that unit and stops if the unit is void again; go on by hand with `--restart-from N`.
- Other options: `--to N` (stop before unit N), `--hard-min 15` (a call is killed after this; a valid bar it left is
  used), `--fake` (plumbing test: the solver answers; `--fake-sleep S` makes each call a sandboxed sleep, for kill
  tests), `--test-void-at N` (test: unit N's first call is marked void). `copy_run.py <run> <new run>` makes a full
  copy (driver side and blind folder, paths rewritten) for tests.
- **Score** (the orchestrator, never the driver): `$L/score_run.py $R/<run> /home/user/gtv/truth/<S>/<S>.truth.json --solver`.

## What changed after LOOP-REVIEW.md

The review's ten problems, in its order, and the eleven items of the fix brief.

1. **Copies, not links** (blocking). `prep.py` copies every input (`shutil.copyfile`: sound, video, the hand files)
   and refuses to finish if any file of the blind folder has `st_nlink` != 1 or is a symlink; `driver.py` checks the
   same at every start and refuses to run otherwise. dry3's blind folder: `%h` = 1 for all 11 input files.
2. **Sandbox and audit** (blocking). Every writer, reviser, tuner and W2 call goes through `sbxcall.py` ->
   `sandbox_run.sh <work folder> G/transcripts/<run name>/<call id>/ blind_run.sh ...`. Work folder = the run's blind
   folder (or, with `--state off`, a fresh per-call folder: item 7). Added to `sandbox_run.sh` (opt-in, set by the
   driver): `SBX_RW` keeps only the call's own folder writable (inputs, tools, `state.json`, `tab.json` and every other
   unit's folder are read-only), `SBX_RO` makes the loop's code (`G/loop/tools`), the venvs (`G/tools`) and the scorer
   (`/home/user/gtr`) read-only; tested: writes there fail with "Read-only file system", the pack stays writable,
   `spec.sh` runs in 2.8 s inside. The call's environment is scrubbed (no GitHub, AWS or cloud tokens, no account
   e-mail, no outside paths; claude still runs). `blind_run.sh` hides `SBX_TRANSCRIPTS` from claude, and the driver
   rewrites the pack's `run.meta.json` so it names no outside path (the transcripts folder names the run). The
   driver also fingerprints every file outside the pack before and after a call; a change voids it.
   `audit_unit.py` (second line) now resolves every path: relative ones against the transcript's cwd and each `cd` in
   the command, `..` included; Glob and Grep against their base; it voids anything under /home or /root outside the
   work folder (except the code and venvs the tools run), searches rooted above the work folder, `find -samefile /
   -inum / -links`, mount/nsenter/sudo, writes outside the pack, and other units' folders when the condition forbids
   them (state off); another unit's folder with the state on is a warning. On the review's fake transcript all six
   leaks now void (`cat ../../../../truth/...`, `cd /home/user/gtv && cat truth/...`, the string-built Python path,
   `Glob **/*.truth.json` at G, `find .. -samefile`, `Read` of the key); `cat ../u000/lessons.json ../tab.json` is a
   warning (state on). On the ten dry 1 and dry 2 transcripts: no void. The driver stops at a void (item 3).
3. **Snapshots and void restart** (blocking). Before each unit the driver saves `state.json`, `tab.json`,
   `changes.jsonl`, `progress.json`, the blind folder's listing and the log's row count in `<run>/snapshots/uNNN/`.
   `--restart-from N` restores the snapshot taken before unit N, moves every blind folder made since (units N and
   later, later revisits, tuning reviews) to `<run>/voided/fromNNN.<T>/blind/` with copies of the replaced files,
   marks the log rows made since `voided` (their cost stays counted) and goes on. A void call stops the driver
   (`VOID.json`, exit 3); `--void-policy restart` restarts once from the snapshot before that unit's round (a write of
   unit i, or a revisit or tuning review after it: unit i) and stops if it is void again.
4. **Process groups** (blocking). Each call runs in its own session (`setsid`); its pid and pgid are in
   `<run>/writer.pid` and in `<run>/calls/<call id>.json`. The driver traps TERM, INT and HUP: it kills the group (TERM,
   then KILL after 30 s; when the namespace's init dies the kernel ends everything inside), audits the cut-off call,
   logs its cost (from the transcript when `run.json` is missing: tokens x list price, $4 / $20 / $0.20 / $8 per M
   input / output / cache read / cache write, an exact fit to the dry runs' costs) and moves its folder to
   `<run>/aborted/`. The hard limit kills the group the same way. A restart first kills any call left in `writer.pid`
   (checked by command line), then audits and logs it.
5. **Restart idempotence**. A unit's apply (merge, changes, lessons, the cost row, the revisit queue, `done`) is one
   transaction: a restart inside an unfinished unit restores its snapshot first, so nothing merges twice; revisits
   and tuning reviews use `<run>/snapshots/apply/` and an applied marker the same way. Every log row carries its call id
   and is written once. A call that finished, or was killed by the hard limit, and left a valid bar is reused after a
   restart (`inflight.json` names it), not paid again; an aborted one is redone.
6. **L3 revisits**. No silent cap: a trigger is queued or logged as skipped with why (`revisit-skip` rows: unit not
   finished, already opened twice, revisits off, a habit with no weak note kept, the solver agrees after a tuning
   change). After a tuning change every affected unit is solved again with the new tuning; where the solver's path
   differs from the re-placed notes it is revisited (tuning items: no round or unit cap), else a row says the solver
   agrees. Other items: at most 4 a round; the rest wait for the next round (logged), and all that is left runs after
   the last unit.
7. **E6 `--state off`**. Each call runs in a fresh folder `G/loop/bw/<id>.solo/` that holds a copy of the inputs
   without `similar.json`, the tools made for it, an empty state (the tuning only), an empty `tab.json` (a revisit: that
   unit's own notes only) and the unit's pack; the pack moves back into the blind folder after the call and the folder
   is deleted. So no other unit's folder, no similar units and no finished note of another unit reach any tool or
   picture; the solver gets no previous unit as context either (a change: it had the previous unit's last chord).
   `unit_conf` and `unsure` are kept on the driver side from each unit's own confidence, so triggers 3 and 5 fire as in
   L2 (fake test: the sweep after unit 7 opened the 8 unsure units, 4 then 4).
8. **Scoring**. `score_run.py` adds the share over heard key notes (key notes whose `conf` is not "tab"): whole key
   (`tab_heard.json`), span, per unit and per third (`units.csv`, `summary.json`), and the solver alone on heard notes;
   all earlier numbers stay. Voided and aborted calls' costs are reported apart; audits are redone from `calls/`.
9. **Validation**. Rejected now: a note on a string an earlier note of the unit still rings on (its offset more than
   35 ms past the new onset) unless the later note says `"repluck": true` (the driver then cuts the earlier offset); a
   kept candidate's onset moved more than 30 ms (a drop plus a new note); in L1 any change of a given pitch or onset
   (why or not); one pitch twice within 35 ms. At the merge, a note of an earlier unit still ringing on a string the
   new unit strikes is cut at that onset too (added after kt-dry3's unit 3 asked for a $0.38 revisit of unit 2 only to
   shorten two offsets). The review's test cases (`vtest.py`, `vtest2.py`) are now all rejected
   except a pitch change with a why in L2 and a stretch with a place_why, which the design allows. `WRITER.md` and
   `REVISER.md` say so; the solver's stand-in marks its notes `repluck`.
10. **Pictures**. Candidate ids on the spectrogram never overlap: a label that collides moves up, right or down with a
    thin leader line; a one-model alternative's label that still collides is left out. The residual masks the context
    outside the unit (grey, "context: masked"). Checked on dry3's unit 1 (21 and 23 at 3.79 s now side by side).
11. **The hand window**. `prep.py --hand-dir` (item list above).
- **W2** runs through the same sandbox (`w2.py`: work folder = the run's blind folder, whose `inputs/` and `tools/`
  are read-only; its own process group, `writer.pid`, the hard limit; audit from its transcript). Not run yet.

## The files

- **Driver side** `<run>/` (never shown to a writer): `run.json`, `progress.json`, `tab.json`, `changes.jsonl`,
  `units_log.jsonl` (every call once, by call id: wall time, tokens, list cost, audit, validity, triggers; plus
  `revisit-skip` and `restart-from` rows), `calls/<call id>.json` and `.audit.json` (pack and work folder at call time,
  pid and pgid, transcript path, the full audit), `snapshots/uNNN/`, `voided/`, `aborted/`, `driver.log`, `driver.pid`,
  `driver.lock` (one driver per run), `writer.pid` (while a call runs), `inflight.json`, `VOID.json` (after a void stop),
  `answer.json`, `answer.gp5`, `score/`. Transcripts: `G/transcripts/<run name>/<call id>/`.
- **Writer side** `G/loop/bw/<random id>/` (linked as `<run>/blind`): neutral names only. `inputs/` (copies:
  audio.wav, video.mp4, candidates.csv, units.json, similar.json, beats.txt, config.json, hand/), `tools/`,
  `state.json`, `tab.json`, one folder per call (`u007/`, `u007.r1/`, `tuning.u012/`); no audit or outside path.
- **Code**: `prep.py`, `pack.py`, `solve.py`, `draw.py`, `neckpic.py`, `make_tools.py`, `validate.py`, `driver.py`,
  `sbxcall.py` (the sandboxed call), `audit_unit.py`, `score_run.py`, `w2.py`, `copy_run.py`; prompts `WRITER.md`,
  `REVISER.md`, `TUNER.md`, `W2.md`.

## How the pieces meet the design

- **Candidates**: chain-2's notes as the base, the five models' extra notes merged (one pitch within 50 ms is one
  candidate, with its supporters). On the capo song: 882 base + 971 alternatives. The writer must decide every base
  candidate and every candidate two or more models hold.
- **Validation** (`validate.py`): pitch = tuning + capo + fret, strings distinct within an onset group (35 ms), a
  string still ringing (repluck), a kept onset moved 30 ms at most, no unison duplicate, onsets inside the unit, every
  required candidate kept or dropped, reasons for drops of 2+ model notes, added notes, places other than the
  solver's and fretted notes outside the window; L1: given pitches and onsets fixed, nothing added or dropped. A
  rejected bar is asked again once; then the solver's proposal stands in (`fallback`).
- **State** merged by rule (as before): tuning evidence, shape book, hand, model and player habits, repeats, unit
  confidences, unsure units.
- **Revisits**: triggers 1 to 5 plus `revisit.json`; at most 2 revisits of a unit (tuning re-placing excepted), at most
  4 after one unit (the rest wait, logged); a reviser's lessons never trigger more.

## The dry runs (L2, capo song)

`dry-capo-l2` and `dry2-capo-l2` ran before the fixes (not sandboxed; hard links; see `LOOP-REVIEW.md`).
**dry3-capo-l2** ran after them: units 0 to 2, prepared with `--hand-dir G/loop/e1/capo/v0_m1 --anchors
G/loop/e1/capo/anchors.v0.json`, every call sandboxed, Opus 5.5 at effort max. Numbers from its `units_log.jsonl`,
`driver.log` and `score/summary.json` (`score_run.py ... --solver`, gtr-eval evals e0658-e0667).

| run, unit | minutes (call) | output tokens | input tokens (incl. cache) | list cost | notes kept / dropped | audit |
|---|---|---|---|---|---|---|
| dry3, u0 | 2.61 | 15,886 | 238,460 | $0.640 | 11 / 8 | 0 void, 0 warn |
| dry3, u1 | 3.38 | 19,979 | 248,185 | $0.749 | 11 / 10 | 0 void, 0 warn |
| dry3, u2 | 2.59 | 15,746 | 209,667 | $0.621 | 11 / 6 | 0 void, 0 warn |
| dry3, total | 8.58 (8.8 wall with packs, 02:48:30-02:57:19) | 51,611 | 696,312 | $2.009 | 33 / 24 | |
| kt-dry3, u3 (repeat of u2; after the kill) | 2.04 | 12,104 | 189,832 | $0.530 | 11 / 4 | 0 void, 0 warn |
| kt-dry3, u3 cut off by the kill | 0.5 | 802 | 37,375 | $0.103 | | 0 void |
| kt-dry3, revisit of u2 (asked by u3) | 1.34 | 7,251 | 205,549 | $0.376 | rewrite: 2 offsets, 0 place changes | 0 void |
| dry 1 (before) | 3.55, 2.58, 2.27 | 20,622, 14,926, 13,245 | | $0.785, $0.603, $0.561 | | |
| dry 2 (before) | 2.68, 2.46, 2.57 | 16,435, 14,521, 15,779 | | $0.633, $0.597, $0.671 | | |

- **dry3 score** (key cut to 0-9.59 s): same string and fret 33 of 33 = 1.000, heard key notes 32 of 32 = 1.000, 0
  wrong place, 0 missed, 0 invented, onset F1 1.000, GP5 read back 0.970; the solver alone 1.000 (heard 1.000). Every
  bar passed on the first ask; no revisit was triggered. The sandbox costs nothing visible: minutes and tokens are
  within the earlier runs' range ($0.62 to $0.75 a unit against $0.56 to $0.79).
- These bars are easy (a held bass and one shape), so the dry runs prove the plumbing and the rules, not the loop's
  worth. At dry3's pace (2.9 min and $0.67 a unit) an L2 run of the capo song's 73 units is about 3.5 hours and $49
  before revisits, as the review estimated.

## Tests of the fixes (on copies; folders kept)

- **Void restart** (`G/loop/runs/vt-dry3`, a copy of dry3): unit 1's call marked void by hand, then
  `--restart-from 1`: `state.json` came back identical to `snapshots/u001/state.json` (md5), the tab holds unit 0
  only, `done` = [0], `u001/` and `u002/` moved to `voided/from001.<T>/blind/`, their 2 log rows marked voided; the
  run then went on (`--fake`) to unit 2. Automatic path (`fkV`, fake): `--test-void-at 1 --void-policy restart`
  restarted once from unit 1 and finished; with the default policy (`fkV2`) the driver stopped with `VOID.json`.
- **Kill** (`G/loop/runs/kt-dry3`, a copy of dry3, a real writer on unit 3): SIGTERM to the driver 28 s into the call:
  the call's group (unshare, blind_run.sh, claude) was empty 3.1 s later, no process named the copy's blind folder,
  the cut-off call was audited (no void) and its cost logged from its transcript ($0.103, 802 output tokens), its
  folder moved to `aborted/`; the restart rebuilt the pack and wrote unit 3 again (2.04 min, $0.530, valid on the
  first ask), whose writer asked for a revisit of unit 2, which ran sandboxed too (1.34 min, $0.376). SIGKILL to the driver
  (`fkK2`, sandboxed fake sleep): the call stayed alive as expected; the restart found it in `writer.pid`, killed its
  group and logged it.
- **Hard limit** (a fake sandboxed sleep, `--hard-min 0.2`): the call was killed (TERM, then KILL), marked
  `timed_out`, its bar used; nothing of its group was left.
- **Exactly once** (`fkA`, `fkB`, `fkC`, fake): stops forced after the lessons and after the cost row of unit 2, then
  a restart: `state.json`, `tab.json` and the log rows identical to an uninterrupted run (md5), habits counted once.
- **State off** (`fkS`, fake): the per-call folder of unit 9 held `inputs/` (audio, video, beats, candidates,
  config, units, hand/; no similar.json), `tools/`, `state.json` (empty but the tuning), `tab.json` (no notes) and
  `u009/` (its pack: unit rows and the next unit's candidates as context, no finished notes); unit confidences were
  kept and the sweep after unit 7 opened the unsure units.
- **L3** (`fkL3`, fake, tuning "found" with string 6 a tone low): after conflicts in 3 units the (fake) tuner moved
  string 6 to E; units 0 and 1 (notes on string 6) were solved again, differed, and were both revisited.

## What is still weak

- **The hand window is E1's v0** (one keyframe, no tracking). `--hand-dir G/loop/hand/<S>/` takes E1's published
  folder when it lands; the nylon song still has no anchors.
- **The residual** is noisy (FluidSynth's timbre); the context is now masked; `check.txt` is the better evidence.
- **Alternatives are many** (971 on the capo song, 899 held by one model); thinning their labels helps the picture.
- **Revisits are untested on hard bars**; L3's tuning review and re-placing ran only with fake calls.
- **The new string-rings rule** may cost writers a round of `check.sh` on legato passages (they must mark
  `repluck` or move a note); dry3's writers passed it on the first ask, and the stand-in marks it itself.
- **The guard** (inotify, no process ids) is unchanged; the sandbox is the first line and the transcript audit the
  second. An attacker inside the sandbox could still read the session's own ingress token or the agent kit's state
  files under `/root/.claude` (not answers, and the audit voids any read under /root).
- **W2's sandboxed path** is built but has not run a session.
- **Only serial units** (`--max-parallel 1`); songs can run side by side as separate drivers.
