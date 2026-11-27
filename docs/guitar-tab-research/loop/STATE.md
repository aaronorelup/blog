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

## 2026-11-27 05:10 UTC: dollars per percent measured; scope set; W2 and E6 started; Closer restored

- Weekly window: 0.68 (04:27) -> 0.70 (04:41) -> 0.71 (04:49) -> 0.72 (05:02). Over those 35 minutes the loop's calls
  logged about $58 (`G/loop/work/spend.py`: $18.18 at 04:31, $69.99 at 05:01) and the account also ran NOTES' lanes and
  LOOP's E1 agents: about $120 in all, so about $30 per 1%. 28% left is about $840 for both sessions; NOTES takes about
  $250 (its message of 04:31), LOOP about $590. The seven running loop runs need about $200 more.
- **Scope, decided now** (Aaron's "full freedom"; a cut, not a wait): keep L2, L4 (three songs) and L1 (nylon); W2 on the
  three songs (E5); E6 once, the state emptied, on capo (revisits-off dropped); held-out (E7) L3 and W2 on Closer and
  September, Three Little Boats if the budget allows; no repeated runs for spread (AO-082's measured run-to-run spread,
  0.011 to 0.037 on the main number, stands in, and L2 against W2 and the held-out songs show variation); L3 and L1 on the
  other two songs stay paused; a lean film of about 12 to 15 minutes.
- **Started 05:02**: w2-capo, w2-standard, w2-nylon (one whole-song sandboxed session each, 90 minutes allowed, L2's
  inputs) and e6s-capo (L2 with the state emptied before every unit). Eleven runs going.
- **Held-out key Closer** (NOTES; Gareth Evans, E A D G A D, capo 1, 1,149 notes; no note transcriber used to build it)
  restored from R2 `workbench/guitar-tab-app/heldout/closer/` to `G/songs/closer/` and `G/truth/closer/`; every file
  matches `MANIFEST.sha256`; closer.truth.json 4c91534f5c5c8ec3cbefab7e8d91efb9585b4b05afe7fefd33cad9636eafe28e,
  closer.mono.wav 7657f0d9918488560d92cae96c09ce823e48654799d06a0f0f4116c02fe93ddc, video.mkv
  98ecf9028e71a800876e18e652addd883c0588b2f1a2694d04e832cbe6170cfd. LOOP audits it before any run uses it.
- NOTES ran `hand_filter.py` unchanged on four note models' whole-song notes: no found note lost in 12 runs, onset F1 up
  0.000 to 0.013; it is a default stage of NOTES' frozen pipeline.
- The hand windows' R2 copy is at `workbench/guitar-tab-app/loop/hand/<S>/` (a first copy went to the workbench's
  `2026-11-27/loop/hand/` by an rclone alias slip; both hold the same files).

## 2026-11-27 05:15 UTC: a first look inside the running loop (orchestrator only, never shown to a writer)

- `G/loop/work/peek.py` scores a running loop's finished units against the key (same pitch, string and fret, onset
  within 50 ms) for the orchestrator. At about 05:05: L2 standard 0.919 of 185 key notes (15 units), L2 nylon 0.891 of 174
  (14 units), L1 nylon 1.000 of 251 (20 units), L4 standard 0.893, L4 nylon 0.845, L2 capo 0.733 of 150 (14 units), L4
  capo 0.764.
- All 40 of L2 capo's wrong places in those units are in the two tap passages (25 to 31 s and 37 to 44 s): the key has D4
  and C4 tapped at string 4 frets 9 and 7; the loop put them on the open 2nd string and string 3 fret 2, the solver's
  choice, accepted by the writer. The pack showed one window per onset (the union of the fretting and the picking hand,
  for example 2-11), so nothing told the writer the picking hand was on the board. This is E3's main error type (an open
  string chosen where the player fretted). Not changed mid-run. A candidate change for the frozen held-out version:
  show the picking hand's window apart from the fretting hand's and flag notes it can reach as possible taps. Decided
  after the three L2 runs end, and tried only on the dev songs' affected units before freezing.

## 2026-11-27 05:22 UTC: held-out keys in R2; held-out prep started; E7's note rule

- NOTES' held-out keys (all built with no note transcriber; NOTES' audits 7 PASS each, one record count fixed each):
  - september: Evan Handyside, Wake Me Up When September Ends, open G (D G D G B D), capo 2. R2
    `workbench/guitar-tab-app/heldout/september/`. september.truth.json
    8bba0443bdcbbb8269ebd186d62ad5dfcb0b71d216309b2142799d7b32c9da5d, september.mono.wav
    31b7e69707c1cce0f76fa6ebdc28c7c09c401bde6a566d41913d94213609bd52, video.mp4
    d9b8107e7bd96d74a65e6cbe68bd705e19b7db419806ba32b7b42d4134983863, MANIFEST.sha256
    e647574d2f14accc670d229aff384c04c1d66ca2a56320f4e202ba91f4b40691.
  - boats: Culture Vannin's Three Little Boats, played by Pete Lumb (a new player), nylon, standard tuning, no capo, 232
    notes. R2 `.../heldout/boats/`. boats.truth.json 5bdcbfad3ea92a54ae3d0a80cb73e3790ecdf4f7d48f6da9c5ec1ead2f2b9b26,
    boats.mono.wav 7cd121a4dedde0a7d60d797fd9b13538b684a982ab833c9f1a2f41b2cd3e185b, video.webm
    80c2bbb27387af3ad2faa2e0df8f3c0e0ddab775003e48ebe430273dc18f732d, MANIFEST.sha256
    c873e8a44262c8142b746c046fd370fddececb8b97970080ec9105d5a0f3e062. Short and cheap: in the held-out set.
  - Open item named by every audit: no one has checked the note models' training sets (GuitarSet, GAPS, Leduc, GOAT)
    against these videos.
- **E7's one note rule**: NOTES' frozen pipeline will not be ready for 4 to 6 hours, so E7 freezes gaps-paper alone
  (`guitar-gaps-paper-version-12200_iterations.pth`, xavriley/midi-transcription-models, default thresholds; onset F1 on
  the dev songs, NOTES' numbers: 0.954 / 0.822 / 0.896), then `hand_filter.py` with the finder's tuning; alternatives as
  on the dev songs (fl, gaps, Transkun, Basic Pitch; YourMT3+ was a remote Space and is left out).
- Held-out prep lane (wf_1252baf2-15a, 05:10): blind videos, note models, beats, landmarks, LOOP's own key audit, a
  prep.py option for held-out notes; then Opus blind hand anchors and check and the tuning finder, as on the dev songs.
  Closer and September; Boats after.

## 2026-11-27 05:55 UTC: W2 done on the three songs (E5)

- One whole-song session per song (L2's inputs: chain-2's notes and alternatives, the tuning given, the hand window,
  the solver, renders; 90 minutes allowed; sandboxed, network closed). Scored with gtr-eval tab on its answer.json
  (`G/loop/score/w2/`): capo **0.947** (of matched 0.972), standard **0.878** (0.940), nylon **0.830** (0.974).
  Minutes and list cost: 36.6 / $10.85, 34.6 / $8.86, 27.9 / $8.20. The standard session named the piece ("Imagine"
  arranged for fingerstyle in C): memory may have helped there; the other two said not recognised.
- W2 placed every tapped note of the capo song's tap passages right (28 of 28 at 25-31 s, 28 of 28 at 37-44 s, 25 of 26
  twice later); its HOW.md: "tapping bars ... right hand over the neck taps Bb2 6:3 ... left hand at frets 7-9 plays F3
  4:0 / D4 4:9 / C4 4:7 hammer-pull figures (solver had D4 on 2:0)", reasoning from same-string evidence in the sound (a
  note cut the instant the next starts) and the overlay pictures. The bar-by-bar L2 writer got 8 of 28 in each.
- The running loops at 05:50 (peek, orchestrator only): L2 capo 0.824 (28 units), standard 0.896 (28), nylon 0.861 (30);
  L4 0.785 / 0.850 / 0.843; L1 nylon 1.000 (42 units, 537 key notes); E6 state-off capo 0.824 (15 units). Loop calls so
  far $185.62.

## 2026-11-27 06:10 UTC: L1 nylon done

- L1 on the nylon song (the key's onsets, offsets and pitches; the tuning given; the hand window): **1.000** of all 628
  key notes on the key's string and fret (heard notes 556 of 556), 54 units, 86.3 writer minutes, $23.15 list, no
  revisit. The plain solver with the same inputs: 0.967 (LADDER.md); AO-082's chain-5 (tuttut): 0.967. By thirds:
  1.59 / 1.71 / 1.49 minutes and 9,281 / 9,455 / 7,989 output tokens a unit. Score: `G/loop/runs/l1-nylon/score/`.
- 06:35 UTC: **L4 nylon done** (hand off): main **0.833** (heard 0.876), matched 0.847, of matched 0.983, onset F1 0.841
  (chain-2's notes alone: 0.796), GP5 read back 0.742; 53 units, 130 writer minutes, $32.18, no revisit. By thirds:
  right 0.832 / 0.841 / 0.823; minutes a unit 2.74 / 2.34 / 2.28; output tokens a unit 16,475 / 13,368 / 13,536. The plain
  solver with the tuning given and no window: 0.801 (LADDER.md).
- 06:45 UTC: **L2 nylon done** (the main condition): main **0.836** (heard 0.876), matched 0.850, of matched 0.983, onset
  F1 0.845, GP5 0.742; the solver alone on the same packs 0.801 (heard 0.842); 53 units, 121.7 writer minutes, $30.46, no
  revisit fired. By thirds: right 0.845 / 0.833 / 0.828; minutes a unit 2.47 / 2.37 / 2.03; output tokens 14,189 /
  13,598 / 11,743 (faster later, not more accurate). The writer's decisions, scored: keeping an alternative 23 wrong to
  right against 17 invented; dropping 10 invented against 6 played; placing 4 wrong to right, 4 wrong to wrong. Against
  L4 (hand off) 0.833 and W2 0.830: on this open-position song the window and bar-by-bar both add almost nothing.
- 06:50 UTC: **L4 standard done** (hand off): main **0.831** (heard 0.863), matched 0.932, of matched 0.891, onset F1
  0.909, GP5 0.822; solver alone on the same packs 0.828; 56 units, 145.2 writer minutes, $35.20 (revisits $0.31). By
  thirds: right 0.885 / 0.796 / 0.791; minutes 2.17 / 2.92 / 2.69; output tokens 13,173 / 17,284 / 16,370 (slower and
  worse after the first third, with no window). Decisions: drops 42 invented against 7 played; alternatives kept 6 right
  against 15 invented and 4 played-but-misplaced; placing 3 wrong to right, 3 wrong to wrong.
- 07:10 UTC: **L2 standard done**: main **0.875** (heard 0.916), matched 0.929, of matched 0.941, onset F1 0.901, GP5
  0.863; solver alone on the same packs 0.854 (heard 0.880); 56 units, 145.5 writer minutes, $37.41 (revisits $1.25, 2
  revisits). By thirds: right 0.906 / 0.848 / 0.851; minutes 2.32 / 2.74 / 2.75; output tokens 13,636 / 15,855 / 16,552.
  Decisions: drops 33 invented against 7 played; alternatives 7 right against 16 invented; placing 13 wrong to right and
  2 more from alternatives. Against L4 (hand off) 0.831: the window adds 0.044 for the bar writer here; W2 0.878. (The
  main number equals AO-082's kit arm's list number, 0.874816, by coincidence: 594 of 679 both.)

## 2026-11-27 07:12 UTC: the weekly limit at 0.85; cuts

- The account's weekly window read **0.85 at 06:51 UTC** (past the 0.75 warning; 0.72 at 05:02): 13% in under two
  hours, about $30 to $35 per 1% across both sessions (the loop's calls alone went from $70 at 05:01 to $303 at 07:07).
  About 12 to 15% is left until the reset (about 2026-12-02 11:00 UTC); 100% stops both sessions and any other agent on
  the account.
- Cuts, decided now: **E6 stopped** at 38 of 73 units (07:08; compared with L2 on the same 38 units); **no L3 on Closer
  and September**: the held-out test is W2 with the tuning found (the dev songs put W2 level with or above L2 at a
  quarter of the cost), L3 only on the short Boats if it fits; **the film**: planned and scripted now, built after the
  reset unless at least 8% is left. NOTES asked to cut the same way and to leave 5% untouched for Aaron's other agents.
  Aaron asked on the project page (review 47): film now, smaller, or after the reset.

## 2026-11-27 07:16 UTC: FREEZE for E7 at commit 497b3524

- Every tool, prompt and threshold the held-out runs use is frozen at **commit 497b3524** (`loop/code/`, 52 files with
  `SHA256SUMS`, a copy of `G/loop/tools/`): the hand-reach tool and its blind procedure (anchors, then check; margin 1,
  hard), the tuning finder's procedure (Opus "everything" run), the solver and its capo-fitted weights, the loop and
  W2 with their prompts, the sandbox. E7's one note rule: gaps-paper alone, default thresholds, then the hand filter
  with the finder's tuning (alternatives fl, gaps, Transkun, Basic Pitch). No held-out run started before this line.
- The capo song's tap miss (05:15 entry) is NOT fixed in the frozen loop: the held-out test runs the loop as the dev
  songs ran it.

## 2026-11-27 07:25 UTC: held-out prep done (Closer, September); held-out W2 started

- Prep (wf_1252baf2-15a; `HELDOUT-PREP.md`, `HELDOUT-BLIND.md`): blind videos checked by eye, five note models (gaps-paper
  weights SHA-256 94a7c936ec9fde83686d29007dc256274384e832739cadece39e92cee3b69a7e), Beat This!, MediaPipe (after
  installing libgles2), LOOP's own key audits: Closer PASS, September PASS (weak frame check: a wide shot). The held-out
  blind steps ran after a freeze manifest of their inputs (`G/heldout/freeze-ho-blind.json`, 64 files, 06:03 UTC); the
  repository snapshot of the same code is commit 497b3524.
- Opus blind on the held-out songs, six runs, $29.18, all audits clean: Closer 20 keyframes in 11 shots, a check of 873
  decisions (725 of them one rule: the picking hand's tips taken out of the window, no tap seen in about 50 frames);
  September 11 keyframes, 28 decisions. The finder's tunings (scored later): Closer 40 45 50 55 57 62, September 38 43 50
  55 59 62. The hand filter removed 22 of Closer's 1,191 gaps-paper notes, none of September's 412.
- Held-out W2 started: September 07:18 (44 units' worth, 712 candidates, 412 base), Closer 07:24 (87 units' worth, 1,866
  candidates, 1,169 base). Boats' prep is running (wf_62d3538c-c8b).
- 07:35 UTC: **L4 capo done** (hand off): main **0.783** (heard 0.786), matched 0.985, of matched 0.795, onset F1 0.933,
  GP5 0.771; solver alone on the same packs 0.767; 73 units, 182.1 writer minutes, $46.95 (revisits $1.40). By thirds:
  right 0.788 / 0.716 / 0.844; minutes 2.76 / 2.44 / 2.26; output tokens 16,611 / 14,669 / 13,699. Decisions: drops 40
  invented, 0 played; alternatives 9 right against 40 invented and 12 played-but-misplaced; placing 22 wrong to right
  against 18 right to wrong. Notes found well (onset F1 0.933 against chain-2's 0.920); places are what it loses (W2:
  0.947).

## 2026-11-27 08:00 UTC: held-out W2 scored (Closer, September); the error that is left

- W2 scored with `G/loop/work/score_w2.py` (gtr-eval tab on answer.json, the same on the key's heard notes, gtr-eval
  notes; `G/loop/score/<run>/w2_summary.json`), and the plain solver's own tab from each W2 pack (`solver_tab.json`, the
  same inputs) beside it:

| song | W2 main | heard | of matched | onset F1 | solver alone | minutes, list cost |
|---|---|---|---|---|---|---|
| capo (dev) | 0.947 | 0.955 | 0.972 | | 0.828 | 36.6, $10.85 |
| standard (dev) | 0.878 | 0.914 | 0.940 | | 0.854 | 34.6, $8.86 |
| nylon (dev) | 0.830 | 0.874 | 0.974 | | 0.801 | 27.9, $8.20 |
| **September (held out)** | **0.823** | 0.839 | 0.839 | 0.968 | 0.736 | 25.7, $6.09 |
| **Closer (held out)** | **0.698** | 0.715 | 0.768 | 0.894 | 0.579 | 35.9, $6.85 |

- The brief's rule: held-out W2 (0.760 on these two) is more than 0.10 below the dev songs' mean (0.885), so the post
  says the method did worse on new songs. The plain solver drops the same way (dev 0.828 / 0.854 / 0.801 against held-out
  0.736 / 0.579); Opus's gain over the solver holds or grows (dev +0.119 / +0.024 / +0.029, held-out +0.087 / +0.119).
  The notes are found well on both (onset F1 0.968, 0.894); the places are what drop.
- **The error that is left is one kind**: an open string where the player fretted the same pitch inside the window.
  September: 56 of 66 wrong places are key string 2 fret 3 written as the open 1st string. Closer: 243 wrong places, led by
  key s4 f5 -> open s3 (53), s4 f7 -> open s2 (32), s6 f10 -> open s4 (31), s5 f5 -> open s4 (17); s3 f12 -> s2 f10 (57) is
  the one fretted-to-fretted pattern. The capo song's tap passages were the same error in the loop runs. The hand window
  cannot tell these apart (open strings are always allowed); the fingers can (E2's finger rule settled the nylon 1st
  string 103 to 1).
- **Exploratory, after the held-out results** (`G/loop/work/fingers_place.py`, code only, no Opus): move a note the
  answer put on an open string to a fretted place of the same pitch inside the window when a fingertip is inside that
  place's fret space within half a string spacing at the onset (fingers.py's presence test, constants unchanged). Main
  number before -> after, W2 answers: capo 0.947 -> 0.936, standard 0.878 -> 0.904, nylon 0.830 -> 0.783, September
  0.823 -> 0.883, Closer 0.698 -> 0.708; the solver's tabs: 0.828 -> 0.870, 0.854 -> 0.891, 0.801 -> 0.753, 0.736 ->
  0.811, 0.579 -> 0.594. It helps where the player frets up the neck and hurts the nylon song, whose open strings really
  ring: the fingertip landmarks are about a string off (E2). Not adopted; the fingers are the next constraint to get
  right, with a better finger-to-string reading than MediaPipe's landmarks.

## 2026-11-27 08:06 UTC: Boats ready; W2 and L3 started on it

- Boats prep (wf_62d3538c-c8b; `HELDOUT-PREP.md` boats section): restored and checked against its manifest; video 67.08 s
  with NOTES' boxes over 2 captions and the end logo; LOOP's key audit PASS; blind anchors (11 keyframes), check (76
  decisions, 47 window), finder (40 45 50 55 59 64, scored later): 37.4 minutes, $10.40. All nine held-out blind runs:
  150.9 minutes, $39.58. The hand filter removed 0 of gaps-paper's 216 notes. The agent also fixed ho-blind's held-out
  name scan (it had dropped the names file's entries) and re-ran it on all nine transcripts: 0 hits.
- Boats is short (24 units), so it gets both: W2 and L3 (the loop with the tuning found), started 08:05.

## 2026-11-27 08:15 UTC: L2 capo done; E6 compared

- **L2 capo done**: main **0.859** (heard 0.863), matched 0.985, of matched 0.872, onset F1 0.918, GP5 0.845; the solver
  alone on the same packs 0.828; 73 units, 181.7 writer minutes, $54.64 (revisits $8.60: shape revisits 4 wrong to right,
  asked revisits 4 wrong to right, 1 invented). By thirds: right 0.840 / 0.838 / 0.898; minutes 2.49 / 2.41 / 2.57;
  output tokens 14,322 / 14,464 / 15,088. Decisions: alternatives 16 right against 52 invented; drops 24 invented, 0
  played; placing 13 wrong to right against 14 right to wrong. The window adds 0.076 (L4 0.783); W2 0.947.
- **E6, the state emptied before every unit** (stopped at 38 units for the weekly limit), against L2 and L4 on the same
  units 0 to 37 (0 to 118.8 s, 414 key notes): E6 0.843 (349 right, 59 wrong place, 42 invented), L2 0.824 (341, 69,
  65), L4 0.734 (304, 106, 61). Emptying the carried state cost nothing (it scored 0.019 higher, inside AO-082's run-to-run
  spread of 0.011 to 0.037). By the brief's rule: on these songs, bar by bar is chunking, not learning; the film says so.

## 2026-11-27 08:45 UTC: Boats W2 scored; held out read again; records written

- **Boats W2** (`G/loop/score/w2-ho-boats/`): main **0.935** (heard 0.942), of matched 1.000, onset F1 0.956; the plain
  solver on the same pack 0.909; 23.0 minutes, $7.71. No wrong place in either: W2 217 right, 15 missed, 5 invented
  (the tune sits in first position). Evals e2140 to e2143.
- **Held out, all three**: W2 0.935 / 0.823 / 0.698 (mean 0.819) against the dev songs' 0.885. Closer is more than 0.10
  below, so the brief's rule fires on it ("a held-out main number"): the post says the method was fitted to the songs it
  was built on, and that it held on Boats and nearly on September. Placing was tested on two of three (Boats has none
  to get wrong). RESULTS.md's point 7 is rewritten to say this.
- Held-out tunings scored with gtr-eval tuning: 6 of 6 on all three (e1717 to e1719).
- E6 scored with gtr-eval on units 0 to 37 (e1711 to e1716): it matches the orchestrator's count exactly.
- Written: `RESULTS.md`, `results.json` (by `make_results.py`), `FILM-SCRIPT.md` (about 10 minutes), `POST-DRAFT.md`.
  Checkpoint 3 sent to HQ. Review 47 (film now or after the reset) not yet opened by Aaron.
- Running: l3-ho-boats (the loop, tuning found), e3-refresh (the ladder's fixes and held-out rows), the R2 archive of
  G/loop (no media copies) and G/transcripts.

## 2026-11-27 08:55 UTC: the E3 ladder refreshed (e3-refresh, commit 11872511)

- All six of LADDER-CHECK2's problems fixed; the capo wrong rung added (6th string 39 from t-02-hint's notes): with the
  tool window key's notes 0.872 -> 0.762, chain-2's 0.832 -> 0.737 (FITTED). The finder rung equals given on all three
  songs (answers byte for byte). chain2f with `hand_filter.py` removes 0 notes (1 invented under capo's wrong rung).
- The tool cells now use the published windows everywhere: capo's key cell 0.876 -> 0.872 and chain-2 0.833 -> 0.832,
  so the capo figures in this log's 03:50 entry (and the plan's-rule gain, now +0.065) are superseded by LADDER.md.
- **Held out, the plain solver** (main, hand off -> tool): Closer 0.427 -> 0.571, September 0.710 -> 0.731, Boats 0.909
  -> 0.909. The W2 packs' solver tabs (0.579 / 0.736 / 0.909) rebuild note for note; the gap is bar-by-bar context.
- Records: 825 eval ids against the ledger, 0 mismatches; 465 table values against the cell files, 0 mismatches.
- Access note: e3-refresh read the held-out keys (G/truth/<S>/) from 08:28 to 08:34 UTC, outside every sandbox, while
  l3-ho-boats ran inside its own (the keys' places are tmpfs inside it); no key file was copied into a run or blind
  folder (G/work/e3-refresh/PROGRESS.md).
- W2's held-out wrong places by kind: September 65 of 66 an open string for a fretted note; Closer 138 of 243 (85 both
  fretted, 20 fretted for open); Boats none. RESULTS.md says "most", not "almost all".
