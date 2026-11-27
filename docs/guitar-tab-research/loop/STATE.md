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
