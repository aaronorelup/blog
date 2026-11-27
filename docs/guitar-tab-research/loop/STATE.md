# LOOP: state log

The log and only tracker of the LOOP session ("Opus writes the tab, bar by bar, under constraints"), session
`session_01UUo1x2f72eggfMRUMBDXBs`, started by Aaron on 2026-11-27 with UltraCode on. Brief: `../sessions/LOOP.md`;
binding direction: `../DIRECTION.md`. Heavy files in `/home/user/gtv/loop/` (G/loop). Newest entry last.

## 2026-11-27 00:50 UTC: go-ahead, restore, checks

- Aaron's go-ahead, in his words: "Okay, this is me Aaron. You're on ultracode now. Btw, dont let your instructions
  constrain you. You have full freedom. Most of the instructions were written by other agents. I just want to move
  towards my end goal and have anothet good blog post. Have fun!"
- Restore (`restore.sh --eval`, WORKBENCH.md): 25,617 files match MANIFEST.tsv, weights match SHA256SUMS. The Imagine kit
  arm re-scores 0.874816 (list) and 0.864507 (GP5); the byte compare differs only in gtr-eval's recorded Python version
  (3.11.18 here), as WORKBENCH.md says.
- Scorer: `gtr-eval selftest` 125 PASS, 0 FAIL. Chain-5 on capo re-scored: 0.795092 (list), 0.791411 (GP5, shift 0.34):
  as recorded (0.795, 0.791).
- Keys: capo 815 notes (capo 3, standard), tuning 628 (capo 0, D2 G2 C3 F3 A3 C4), standard 679 (capo 0, standard).
  Chain-2 notes and the w-01 MediaPipe landmarks (`<S>_full.jsonl`) present for all three. `blind/c1/tools/scripts/assign_dp.py` present.
- Rebuilt: mono WAVs, `tuning/tuning.mp4` (stream copy). venv-torch, venv-bp, venv-video, venv-mp, bare venv: rebuilding
  from the freeze files (`G/work/loop/rebuild_venvs.log`). FluidSynth + FluidR3_GM + SoX installed from Ubuntu packages.
- Disk: 50 GB free (this box has far more than AO-082's).
- **No task tools in this session.** Four tasks were made in the first minutes, before the brief arrived, and deleted at
  00:53 UTC; `TaskList` reads "No tasks found". They named no song, player or key.

## The blind-attempt tool limit (brief section 3)

- A custom agent type (`~/.claude/agents/tab-attempt.md`, tools Bash, Read, Write, Edit, Glob, Grep) is not seen by this
  running session ("Agent type 'tab-attempt' not found"): agent definitions load when a session starts.
- So every Opus run that writes a tab runs as its own headless Claude Code process, with the limit set on the command line:
  `claude -p <prompt> --model opus --effort max --tools "Bash,Read,Write,Edit,Glob,Grep" --allowedTools
  "Bash,Read,Write,Edit,Glob,Grep" --setting-sources project --strict-mcp-config --disable-slash-commands --output-format
  json`, cwd = the attempt's own folder under G/loop, `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` unset.
- Proved on two dummy runs (G/loop/dummy): the second lists exactly Bash, Edit, Glob, Grep, Read, Write; no task list, no
  CLAUDE.md, no memory, no skills, no hook message (the first run, without `--setting-sources project`, saw the global
  CLAUDE.md and the start hook: fixed). The harness still attaches the account's e-mail note; it names no song. Each run
  leaves its transcript in `~/.claude/projects/<cwd slug>/<session id>.jsonl` for `audit_blind.py`, and the JSON result
  gives tokens, cost and time per call (the per-bar measures of E4).

## 2026-11-27 01:05 UTC: E1 first look (the hand-reach tool, v0)

- Tool in `G/loop/tools/handreach/`: `frame_ruler.py` (a frame with a pixel ruler), `wire_candidates.py` (fret-wire
  candidates inside a rough board outline, lettered for naming), `make_anchors.py` (named wires -> a keyframe; prints each
  wire's residual against 12-TET), `neck.py` (image -> board plane by a homography from the named wire ends, fret
  coordinate f = -12 log2(1 - x)), `hand_window.py` (stored MediaPipe landmarks -> `hand_window.csv` at 30 rows a second,
  frets from the capo, `tips.jsonl`), `overlay.py` (frames with the frets numbered from the capo, the window band and the
  fingertips), `score_e1.py` (scoring only: coverage, exclusions, width, places per note, chain-2 as a filter).
- v0 = one keyframe per song, wires named by the orchestrator by eye (capo: wires 2 and 12 at 60 s; standard: 20 lettered
  candidates named by the inlays, residuals 0.6 to 5.1 px), no tracking. Before any tuning of the tool:

| song (fretted key notes) | margin | coverage of not lost | excluded | lost | mean width | places per note (before) | one place (before) | key place kept |
|---|---|---|---|---|---|---|---|---|
| capo (557) | 0 | 0.984 | 9 | 0.011 | 3.96 | 1.37 (3.46) | 0.67 (0.10) | 0.989 |
| capo | 1 | 0.995 | 3 | 0.011 | 5.53 | 1.54 | 0.52 | 0.996 |
| capo | 2 | 0.996 | 2 | 0.011 | 6.92 | 1.68 | 0.41 | 0.998 |
| standard (546) | 0 | 0.974 | 14 | 0.004 | 3.36 | 1.11 (3.24) | 0.87 (0.06) | 0.979 |
| standard | 1 | 0.998 | 1 | 0.004 | 4.86 | 1.26 | 0.76 | 0.999 |

  Files: `G/loop/e1/<S>/v0_m<margin>/score.json`. The brief's perfect window (the key's frets +-1) gives 1.59 / 1.35 places and
  0.53 / 0.66 one place: the tool alone is as tight, because it reads the hand, not the bar. As a filter on chain-2's
  notes the window removes 0 or 1 notes: invented notes sit at pitches the hand can play.
- Nylon (tuning): the guitar moves in the wide shot (the nut at x 2170 at 45 s, 2197 at 60 s) and the board has no face
  inlays: wires are counted from the nut, and the neck needs tracking. Candidates found 8 wires and the nut at 60 s.
- Two key-labelled fingertips on capo read one fret high (MediaPipe's tip lies past the wire): margin 1 covers it.

## 2026-11-27 01:20 UTC: lanes running, NOTES joints settled

- Lanes started (workflows): E1 the hand tool (wf_a8a17bff-83d: tracker, blind anchors and check, record, verify), E3 the
  solver ladder (wf_9a546330-297), the loop build (wf_7a8adf63-0df: builder with a 3-unit blind dry run, then a review).
  E2 (the tuning finder) waits for E1's first nylon window (script `G/loop/work/loop-e2-tuning.js`).
- The design: `LOOP-DESIGN.md`. The file-access watch runs for the whole session (`G/guard/loop-access.log`, pid in
  `G/guard/loop-watch.pid`). Blind runs go through `G/loop/tools/blind_run.sh` (the command line of the tool limit above).
- Checkpoint 1 sent to Aaron (session chat and the command-center project guitar-tab-app). GPU: not needed so far.
- The parent session says the briefs (sessions/LOOP.md, NOTES.md) were committed as drafts; a reviewed version follows.
  Setup goes on; the experiment plan is not locked until it lands.
- NOTES (session_01UUo1x31YLxTbeZLXqSR5T3) builds the held-out keys for both sessions (lane H from 01:05 UTC): closer
  (Gareth Evans, E A D G A D, capo 1), september (Evan Handyside, Wake Me Up When September Ends, open G, capo 2), and a
  new player (Culture Vannin / Pete Lumb "Three Little Boats", CC BY 3.0, or Gareth Evans "Stitches", capo 1). No note
  transcriber is used to build, time or check them. They come to this box through R2 with a manifest; LOOP audits each
  before use. NOTES' notes handoff: `G/notes/<S>/<method>/notes.csv` (onset, offset, pitch, support, conf). Both sessions
  run on their own boxes.

## 2026-11-27 01:45 UTC: the reviewed brief (c608fa84), first results

- The parent session's reviewed brief (sessions/LOOP.md at c608fa84) replaces the draft. Taken up now: blind folders get
  copies, never hard links; the watch's roots now also cover G/blind, notes, loop, heldout, /home/user/blog and
  /home/user/land (restarted 01:42:48 UTC, 4,195 folders; .git and node_modules left out); ids carry L- (L-E1 ...); LOOP
  owns one `hand_filter.py`, published beside the windows; every main number also gets the share over heard key notes;
  a void bar call voids its run from that bar on, restarted from the state saved before it; E3's wrong-tuning rung is
  D G C F A D on nylon and the capo-aware lowest-note rule on steel; held-out keys move only through private R2 with
  SHA-256 lines here; the post is made in a `/home/user/land` worktree. Amendments for the lanes' next agents are in their
  PROGRESS.md files (G/work/e1-blind, e1-record, e1-verify, loop-review).
- The tool limit: the brief asks for a custom agent type used after Aaron's yes. This session cannot load one (agent types
  load at session start), so it uses the command-line limit (`blind_run.sh`), proved on two dummy runs, named at
  checkpoint 1; Aaron's words at the go-ahead ("full freedom") are the go to carry on.
- Pre-commit scan: `G/loop/tools/precommit_scan.sh` (never-publish hashes, the command-center host, signed R2 links).
- L-E3 (wf_9a546330-297) done: `LADDER.md`, `ladder.json`, its check `LADDER-CHECK.md` (5 record problems, no number
  wrong). The tool window adds +0.063 (capo, chain-2's notes, tuning given: 0.767 -> 0.829) and +0.025 (standard: 0.829 ->
  0.854) to the plain solver, within 0.002 to 0.009 of the ceiling window. Most remaining wrong places (99 of 106 on capo)
  are an open string chosen where the player fretted the same pitch: no window can fix those. The solver's weights were
  fitted on the capo key (+0.087 / +0.049 there, about 0 elsewhere): its capo rows are marked fitted. Nylon's window cells
  and the brief's new tuning rung wait for the nylon window.
- The loop's 3-unit dry run (capo, L2): unit 0 took 213 s, 20.6k output tokens, $0.79 list; its 11 notes all on the key's
  string and fret (checked by the orchestrator only). Projected: about 4.3 hours and $57 for the capo song's 73 units.

## 2026-11-27 03:20 UTC: the sandbox; E1 tracker done; E2 and E3's second pass started

- **The sandbox** (`G/loop/tools/sandbox_run.sh`): every blind attempt now runs in a private mount and pid namespace in
  which every answer-bearing place is an empty tmpfs (keys, songs, experiments, AO-082's blind answers, other runs, the
  records, other transcripts, /tmp, the key store and agent kit), only its own folder under G/loop and G/loop/tools are
  mounted back, ~/.claude/projects is its own transcripts folder (G/transcripts/<label>/), and CAP_SYS_ADMIN and
  CAP_SYS_PTRACE are dropped so nothing inside can remount. Probe: keys, songs and records empty, 4 processes visible,
  mount denied, the venvs, ffmpeg, fluidsynth and claude work; an attempt told to read a key found "the file does not
  exist". This answers the loop review's leak problems at the root; the transcript audit and the watch stay as evidence.
- The loop review (`LOOP-REVIEW.md`): 4 blocking problems (hard links, relative-path reads the audit missed, no
  snapshots for a void restart, an orphaned writer after a kill) and 6 minor. Fix lane wf_9414ed6f-ca0: the fixer's
  sandboxed dry run (3 capo units) placed 33 of 33 key notes right (heard 32 of 32), $0.62 to $0.75 and 2.6 to 3.4
  minutes a unit; void restart and kill tested on copies. A second review is next.
- L-E1 tracker done (`neck_track.py`: optical flow, ECC on the straightened board, a refit to detected wires; each
  keyframe refined on its own frame). Self-check, distance to the nearest wire as a share of the fret spacing (chance
  0.25): capo 0.017, standard 0.013, nylon 0.020 (untracked: 0.200). Development windows, coverage at margins 0 / 1 / 2:
  capo 0.991 / 0.996 / 0.998 (width 3.95 at margin 0), standard 0.980 / 0.998 / 1.000 (3.19), nylon 1.000 / 1.000 / 1.000
  (2.67). Its blind phase (Opus sets anchors, then checks, in the sandbox) started 02:58.
- L-E2 (the tuning finder, wf_8855e028-4f8) and L-E3's second pass (wf_2a695ee9-c96: the reviewed brief's wrong-tuning
  rung, nylon window cells, the heard share, the check's fixes) started 03:16.
- The nylon-window watcher looked one folder too shallow and timed out; the windows existed (G/loop/e1/tuning/dev/).

## 2026-11-27 03:28 UTC: loop fixed; second review; network closing

- Loop fix lane done (`LOOP-BUILD.md` rewritten): copies only (st_nlink checked at every start), every writer, reviser,
  tuner and W2 call sandboxed through `sbxcall.py`, snapshots and `--restart-from`, void stops the run (or one restart
  with `--void-policy restart`), process groups killed on exit, transactional apply, L3 revisits uncapped, E6 state-off
  isolation, the heard share in `score_run.py`, stricter validation. Sandboxed dry run: 3 capo units, 33 of 33 right.
- Second review (`LOOP-REVIEW2.md`): every first-review problem fixed and re-tested; 3 new blocking: the sandbox still
  reached the internet and localhost through the agent proxy (the keys are published tabs), the session ingress token was
  readable, and a copied track.json named the nylon slot. Lane wf_b05b1158-f3e gives each call its own network namespace
  whose only way out is a filtering proxy that allows the model API alone, masks the session credentials, strips source
  paths and checks every blind folder for slot names, titles and players, then an adversarial re-test.
- Caveat on record: L-E1's and L-E2's blind runs started before the network was closed; they ran in the file sandbox
  with the transcript audit, as AO-082's attempts did. Their answers (anchors and checks; tunings) gain nothing from the
  web for the nylon original, and the audits flag any network command.

## 2026-11-27 03:50 UTC: L-E3 second pass done (check passed)

- Main / heard share, the solver on chain-2's notes with the tuning given, hand off -> tool window: capo 0.767 / 0.770
  -> 0.833 / 0.841 (FITTED: weights chosen on capo's key; start weights 0.680 -> 0.791), standard 0.829 / 0.852 -> 0.854
  / 0.880, nylon 0.801 / 0.842 -> 0.801 / 0.842 (open position: the window adds nothing). Key's notes: 0.795 -> 0.876,
  0.892 -> 0.915, 0.967 -> 0.967.
- The new wrong-tuning rung on nylon, D G C F A D (AO-082's blind arms' answer): key's notes 0.780, chain-2's 0.619 under
  every window; all 129 matched C4 go to string 2 fret 3, all 18 D4 to the open 1st string; the window catches it in only
  6 onset groups. The steel rungs are dropped: the capo-aware lowest-note rule on chain-2's notes returns the true tuning
  (the check notes that AO-082's own t-02 inputs would give a wrong 6th string on capo: to be stated in LADDER.md).
- The plan's rule does not fire (+0.066 capo, +0.025 standard): L4 runs on all three songs.
- Left for the ladder's refresh when E1 publishes: the finder slot, hand_filter.py in chain2f, FITTED labels in four
  places, 21 table cells 0.001 off from double rounding, the capo rung's disclosure (LADDER-CHECK2.md).

## 2026-11-27 04:20 UTC: network closed; L4 started on all three songs

- Sandbox network lane (wf_b05b1158-f3e) passed its adversarial re-test (`LOOP-REVIEW3.md`): each call has its own
  network namespace with loopback only; its one way out is `net_filter.py`, outside, which allows CONNECT to the model API
  alone and, reading that traffic with its own CA (the only one trusted inside), passes only POST /v1/messages and
  count_tokens with no server tools, MCP servers or URL sources. /home/claude is masked except what the CLI needs to log
  in (the session ingress token is /dev/null); the box's mounts are read-only inside, /root is a throwaway overlay. prep
  nulls every source path and `blindcheck.py` refuses a blind folder holding a slot name, title, player or source path.
  A real L2 call: 1.37 min, $0.42, 11 of 11 notes right, every CONNECT to the API host only. L-E1's three check runs
  (03:40 to 04:01) ran before this, in the file sandbox; their transcripts hold no network command.
- Test runs moved to `G/loop/runs/_tests/` (nothing deleted).
- **L4 started 04:18 UTC** (chain-2's notes, tuning given, hand off), one driver each, `--void-policy restart`:
  l4-capo (73 units, 1,853 candidates, 882 base), l4-standard (56 units, 1,458 / 734), l4-nylon (53 units cut at gaps:
  its downbeats are unsure; 1,120 / 611). A watcher reports driver ends, voids and errors.

## 2026-11-27 04:35 UTC: L-E2 done; E1 published; twelve runs started, five paused for the weekly limit

- **L-E2, the tuning finder** (wf_8855e028-4f8; `TUNING.md`, `tuning.json`, `E2-TUNING.md`): Opus 5.5, blind, capo given,
  got all 36 open strings right in 6 runs (chord shape alone, and everything together, on each song), 10 to 15 minutes and
  $2.48 to $3.51 a run. The nylon 1st string came out C4, from a G minor grip at 31.8 s (a fingertip at fret 2 on string 1
  while D4 sounds) and Bb3 ringing with C4; AO-082's tools and both blind arms said D4. Code alone: (c) ties the key with
  76 to 82 other tunings on every song (ranked first only by its prior), the finger rule settles the nylon 1st string 103
  to 1 but puts a steel song's 1st string a semitone off in some rows (fingertip landmarks about a string off). By the
  plan's rule, "tuning found" through Opus is the app's default; one run per condition, so no spread yet. These runs used
  the file sandbox before the network was closed (caveat above); their audits found no network call. L3 starts from
  `G/loop/e2/finder-answer.json` (the "everything" runs: the true tunings on all three songs).
- **L-E1 published** `G/loop/hand/<S>/` at 04:20 UTC: the window after Opus's own blind check (anchors by Opus: 22
  keyframes on capo; checks: 106, 53 and 59 decisions with 13, 16 and 0 window corrections and 1 new keyframe), margin 1,
  a hard rule. Coverage of fretted key notes 0.995 / 0.998 / 1.000 (capo / standard / nylon), mean width 5.45 / 4.58 /
  3.73 frets, places per note 3.46 -> 1.53 / 3.24 -> 1.24 / 3.62 -> 1.45, notes with one place 0.10 -> 0.52 / 0.06 ->
  0.77 / 0.11 -> 0.58. Record `HAND.md` (E1's verify agent still running).
- **Runs started 04:29** with E1's published windows: L2 on the three songs, L1 on the three, L3 on the three (12 with L4).
- **Weekly limit.** This account's all-models weekly window read 68% used at 04:27 UTC (status allowed_warning, resets
  about 2026-12-02 11:00 UTC, overage disabled for the org: 100% stops this session and NOTES until then). AO-082's rate
  (about $2,000 for about 90% of a week) puts 1% near $22, so about $700 is left for both sessions, against about $1,000
  to $1,200 for all of LOOP's plan. So at 04:30 L3 (three songs) and L1 (capo, standard) were stopped cleanly (each aborted
  call logged, resumable with the same command): L3 duplicates L2 now that the finder was right on all three, and belongs
  on the held-out songs (E7 runs L3); L1 is a ceiling, kept on the nylon song where model notes and the key's differ most.
  Running: L2 x3, L4 x3, L1 nylon, about $100 an hour. NOTES told; dollars per percent to be measured.

## 2026-11-27 05:00 UTC: L-E1 done and checked

- L-E1 (wf_a8a17bff-83d) done; its verify (`HAND-CHECK.md`) reproduced every number of `hand.json` (84 conditions) with its
  own code and found the fret numbering right and the window covering the playing finger at 12 random notes. Its five
  problems change no number; fixed by the orchestrator: places per note are over all key notes (fretted only: 3.24 -> 1.35
  / 3.20 -> 1.12 / 3.13 -> 1.13), the clean verdict rests on the sandbox and transcripts (the watch has no pids), totals
  132.9 min and $26.34 for the six blind E1 runs, the nylon nut drawn about a quarter fret off (absorbed by margin 1), the
  tracker's smoke test (not a condition) had hard links: replaced by copies.
- NOTES (04:31): about $420 spent so far; it goes lean and proposes about $250 for the rest of NOTES (film included), LOOP
  the rest of the weekly window. Its new note model, gaps-paper, reads 0.954 / 0.822 / 0.896 onset F1 (old best 0.920 /
  0.830 / 0.892); not added as a rung on the three songs (budget); E7 uses NOTES' frozen pipeline if it is ready first.
