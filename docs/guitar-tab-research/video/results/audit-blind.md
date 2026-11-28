# Audit: the six blind attempts (breaches)

Agent blind-auditor, 2026-11-25. Scope: the transcripts of the six attempts (`blind-b1-tools`, `blind-b1-bare`,
`blind-b2-tools`, `blind-b2-bare`, `blind-b3-tools`, `blind-b3-bare`) and the file-access watch that ran while they
worked (`/home/user/gtv/guard/access.log`). I changed nothing in the attempts' folders (I only grepped each HOW.md
for its recognition line). Work folder (scripts,
extracted call lists, flags, logs): `/home/user/gtv/work/blind-auditor/` (`PROGRESS.md` lists every step).

## Verdict

**All six attempts are valid** under the void rules of BLIND.md section 4 and their prompt: none read, listed or
searched an answer folder, another blind folder, the other arm's folder, the records, a ledger or a transcript; none
used the web, a key, git, an install, a helper agent, a skill or an MCP tool; the bare arms used no MIR or
machine-learning package. Three minor deviations touch no answer (section 4). Two problems are not the attempts' doing
and the orchestrator has to weigh them (section 5): the harness put the orchestrator's task list into every attempt's
context, and it names the performers and the answer keys `capo`, `tuning`, `standard`; and two of the blind videos
are hard links of the originals in `songs/`.

## 1. What was checked

- **Transcripts**: one per label (each workflow journal has one `started` and one `result` per label: no restart),
  under `/root/.claude/projects/-home-user-blog/59564c1e-.../subagents/workflows/`:
  b1-tools `wf_fa869053-7c7/agent-a307e4eea6f56af98` (10:39:41-11:08:01 UTC), b2-bare `.../agent-ae2cea3d648751d67`
  (10:39:42-11:19:15), b1-bare `.../agent-a88ebcbdc0fb002b7` (11:19:15-11:57:28), b2-tools `.../agent-ab9ba5ba2694a2b60`
  (11:19:16-11:52:10), b3-tools `wf_635d9ffe-f50/agent-a7dd744b6d4f63617` (10:39:42-11:14:35), b3-bare
  `.../agent-a10f89d31e0b64b09` (11:14:35-11:54:40). All six lie inside the watch (10:39:30-11:57:33).
- **Every tool call** listed by `scripts/extract.py` (tool, input, result, permission) and checked by `analyze.py`:
  every absolute path in every input (commands, heredoc bodies, written files) against the allowed set; every program
  run; every `python` interpreter and every import (`pyinterp.py`); every `..` resolved (`dotdot.py`); commands with
  no leading `cd` (`nocd.py`: a Bash call in an agent thread starts in `/home/user/blog`); process, search, env and
  subprocess patterns (`suspicious.py`, `subproc.py`); references to `venv-*`, `models` and `/home/user/gtr` (`runok.py`);
  names of the piece, player, tab sources and recognition words (`names.py`); the harness attachments.
- **Rules applied**: the prompt (work folder, video, arm folder; run only what the arm's sheet names), TOOLS.md
  "What you may use" and BARE.md "What you may use". Allowed runs: the kit's tools and the Pythons its wrappers name,
  `python3` for standard-library glue, ffmpeg/ffprobe/fluidsynth, gtr-run and gtr-eval through the kit (tools arm);
  the bare venv, ffmpeg/ffprobe, fluidsynth with FluidR3_GM, the validator, the GP5 writer, gtr-run (bare arm).
- **Not checkable**: the transcripts store the thinking blocks empty, so only actions, outputs and written text were
  read. The permission system refused nothing (every call `accept`).

## 2. Per attempt

| attempt | tool calls (Bash / Read / Write / Edit / handback) | commands without `cd` | paths outside the allowed set | web, git, installs, agents | interpreters, imports | verdict |
|---|---|---|---|---|---|---|
| b1-tools | 176 (129 / 44 / 2 / 0 / 1) | 12, all absolute paths | 0 | 0 | venv-torch 35; `python3` 87 (kit scripts, csv glue; 3 with numpy) | valid |
| b1-bare | 184 (149 / 32 / 2 / 0 / 1) | 2, absolute | 0 | 0 | bare venv 223; numpy, scipy, soundfile, stdlib, own `py/*.py` | valid |
| b2-tools | 140 (110 / 27 / 2 / 0 / 1) | 4, absolute | 0 | 0 | venv-torch 68 (Pillow, numpy); `python3` 5, stdlib only | valid |
| b2-bare | 172 (121 / 34 / 14 / 2 / 1) | 1, absolute | 0 | 0 | bare venv 178; numpy, scipy, soundfile, stdlib, own `img.py` | valid |
| b3-tools | 161 (116 / 43 / 1 / 0 / 1) | 10, absolute | 0 | 0 | venv-torch 22 (Pillow); `python3` 65, stdlib only | valid |
| b3-bare | 185 (153 / 29 / 2 / 0 / 1) | 2, absolute | 0 | 0 | bare venv 241; numpy, scipy, stdlib | valid |

- Tools used: Bash, Read, Write, Edit and the hand-back only. No WebFetch, WebSearch, ToolSearch, agent, skill or MCP
  call; no `curl`, `wget`, `git`, `pip`, `uv`, `apt`, `npm`, `sox`, aubio, Vamp, `timidity`, `locate`, `find /`.
- Read/Write/Edit paths: only the attempt's own folder plus its arm sheet (TOOLS.md or BARE.md). Every `cd` goes to
  the own folder; every `..` is `../video.mp4` (b2-bare, 42 times) or a path back into the own folder (b1-tools, once).
- LilyPond appears only as `assign.sh --tool lilypond` (b1-tools 9, b2-tools 5), which TOOLS.md allows.
- No attempt names `/home/user/gtr` in any input: gtr-run and gtr-eval ran only inside kit wrappers (37 gtr-run
  runs, section 3 item 3; gtr-eval only through the kit's `selfcheck.sh` and its `lib/selfcheck.py`). No bare attempt ran gtr-run. No attempt read the `/tmp/claude-0` output
  files of its background commands.
- The only "outside" path strings in the inputs are `sed` patterns (`/for`, `/if`, `/---/`), not paths.
- Subprocess calls in the attempts' own code run only ffmpeg or the arm's own Python.

## 3. The access log

1. **Header**: the watch (`watch.py`, the same as `workflows/guard-watch.py`) started 10:39:24, was restarted at
   10:39:30 and stopped 11:57:33; it watched 2,881 paths: every folder under `truth/`, `songs/`, `experiments/`,
   `candidates/`, `work/`, `production/` and the records folder, plus `tools/INSTALLED.md` and the run ledger.
   **Coverage checked**: those roots hold 2,885 folders today, 6 of them made after the watch stopped (this audit's
   and the scorer's work folders): 2,879 + 2 files = 2,881. No folder under the roots changed during the window.
2. **12,587 event lines**: 5,936 `ACCESS` on `/home/user/gtr/ledger/runs.jsonl`, 2,217 `OPEN DIR` and 4,434
   `ACCESS DIR` on the records folder, and **none** on truth, songs, experiments, candidates, work, production,
   INSTALLED.md or any file of the records folder.
3. **Ledger reads**: 37 bursts, each at the end time of one gtr-run record, one to one (`out/ledger-match.txt`):
   gtr-run reads the ledger to number a run just before it appends the record. The 37 records r1124-r1160 are all
   lane `blind-kit`, started by the kit's wrappers (`heavy()` in `lib/common.sh`) with the attempt's folder as cwd:
   b1-tools 9 (r1127 r1129 r1131 r1137-r1141 r1144), b3-tools 14 (r1124-r1126 r1128 r1130 r1132-r1136 r1142 r1143
   r1145 r1146), b2-tools 14 (r1147-r1160). Each lies inside its attempt's span. No other process ran gtr-run.
4. **Folder listings**: three bursts of 2,217 lines at 10:40:03, 11:37:54 and 11:54:44, each a walk of all 370
   folders of the records folder. The orchestrator's transcript has a `stop_hook_summary` at exactly those three
   seconds; its Stop hook (`/root/.claude/stop-hook-git-check.sh`, set in `launcher-settings.json`) runs
   `git ls-files --others`, which walks the repository. The attempts' calls at those moments
   (`out/dir-burst-calls.txt`): b1-tools `ps aux | grep` + its own logs, b2-bare ffmpeg on its video, b3-tools
   `frames.sh` and a Read of its own contact sheet (10:40:03); b1-bare Python on its own JSON, b2-tools
   `answer2gp5.py`, b3-bare the validator (11:37:54); b1-bare Python editing its own script (11:54:44). None lists
   the repository. Attribution: the orchestrator's Stop hook.
5. **What the watch cannot see**: `stat`, reads through another hard link, and everything outside its roots
   (`/home/user/gtv/blind`, `/home/user/gtv/tools`, the rest of `/home/user/blog`, `/home/user/gtr`). The transcripts
   cover those: no attempt names any of them beyond its own folder, video and arm.

## 4. Minor deviations (not voiding; none touches an answer)

- **b1-tools #6 (10:40:04)**: `ps aux | grep -E "notes_guitar|beats|madmom"` to see whether its background jobs ran.
  The output also showed b3-tools' kit commands in `/home/user/gtv/blind/b3/tools` (command lines only, no file
  content, no answer).
- **b2-tools #14 (11:21:07)**: `ps aux | grep -E "notes_guitar|python" | head -5`: the output showed system service
  processes and its own shell, no answer and no key value.
- **b1-tools #27, #79, #159**: the system `python3` with numpy (beat-interval statistics, chord-label comparison)
  where TOOLS.md says plain `python3` is for standard-library glue; numpy is in the kit's own Python, so this gave
  no capability the arm lacked.

## 5. Problems not caused by the attempts

1. **The orchestrator's task list was in every attempt's context.** The harness added it as `task_reminder`
   attachments (b1-tools 17, b1-bare 18, b2-tools 13, b2-bare 17, b3-tools 16, b3-bare 18; the first between 40 and
   90 s after each start). Task #17 names the performers of the three recordings; task #21 calls the answer keys
   `capo`, `tuning` and `standard`, and task #18 speaks of "a standard-tuning candidate ... by a different player".
   No titles, tunings, capo frets or tabs are in it, and all 99 copies are identical (the same 25 tasks and wording
   from the first wave to the last), so no first-wave result reached the second wave this way. The other attachments
   (background-job notices, edited-file notices) concern only the attempt's own jobs and files.
   No attempt wrote any of those names in a command, a file or its
   hand-back (`out/names.txt`), and every HOW.md says the piece was not recognised; whether the thinking used the
   hint cannot be checked. The film should say the attempts' context carried the performer names and the three key
   names; a rerun would need workflow agents that do not receive the task list.
2. **Two blind videos are hard links of the originals**, against BLIND.md section 4 step 2 (`stat -c %h` should print
   1 1 1; it prints 2 1 2): `blind/b1/video.mp4` shares its inode with `songs/standard/standard.mp4` (link made
   10:23:41) and `blind/b3/video.mp4` with `songs/capo/capo.mp4` (10:27:31). Same bytes, so the attempts saw only what
   they were given; reads through the blind path do not reach the `songs/` watch, and no attempt named a `songs/` path.
   No effect on validity, but the record of the setup should be corrected.
3. Not checked here: whether the scorer's later reads are clean (outside the window).

## 6. Files

`/home/user/gtv/work/blind-auditor/out/`: `<label>.calls.jsonl` (every call), `<label>.flags.txt`, `<label>.summary.json`,
`suspicious-b1.txt`, `suspicious-b23.txt`, `names.txt`, `ledger-window.txt`, `ledger-match.txt`, `dir-burst-calls.txt`,
`access-summary.txt` (one level up). Scripts: `/home/user/gtv/work/blind-auditor/scripts/`.

## Round 2

Agent blind-auditor-r2, 2026-11-25. Scope: the attempts `blind-c1-tools`, `blind-c1-bare`, `blind-c2-tools`, `blind-c2-bare`,
`blind-c3-tools`, `blind-c3-bare`, every attachment and reminder in their context, and `/home/user/gtv/guard/access-r2.log`. Round
1's scripts plus `attach.py`, `imports2.py`, `ledger.py`, `accesslog.py`, `orch.py` in `/home/user/gtv/work/blind-auditor-r2/`
(`scripts/`, outputs in `out/`, `PROGRESS.md` lists every step). I changed nothing in the attempts' folders.

**Verdict: all six attempts are valid, and no attachment or reminder leaked.** None read, listed or searched an answer folder,
another blind folder (the round-1 `b*` folders included), the other arm's folder, the records, a ledger or a transcript; none used
the web, a key, git, an install, a helper agent, a skill or an MCP tool; the bare arms used only their venv. The permission system
refused one call (c2-tools, a stray write to `/tmp/claude-0`); the other deviations are minor (R2.4). Two setup problems are not the
attempts' doing (R2.6).

**R2.1 Checked.** One transcript per label (journals: one `started` and one `result` each, no restart), under
`.../subagents/workflows/`: c1-tools `wf_2161a950-609/agent-acd0f0eea8d4d6fce` (12:20:57-13:02:13 UTC), c2-bare
`.../agent-ab14f63c3eb034348` (12:20:57-13:04:43), c1-bare `.../agent-a99bf0b89605c83fa` (13:04:43-13:46:55), c2-tools
`.../agent-af1de0ecc50968125` (13:04:43-13:39:06), c3-tools `wf_6044e612-6ad/agent-aa989800ff1e0f3c8` (12:20:57-12:54:09), c3-bare
`.../agent-a4a270e81985f1c71` (12:54:09-13:34:08); all inside the watch. The prompts are round 1's word for word (only the id
differs). Checked as in round 1 (imports with a stricter parser), plus every permission decision, attachment, meta message and
tool-result reminder, and each `prefix.json` (cache hashes only).

**R2.2 Attachments and reminders** (raw and rendered text):

| type | count per transcript | what it held |
|---|---|---|
| task_reminder | c1-tools 19, c1-bare 20, c2-tools 16, c2-bare 15, c3-tools 18, c3-bare 15 | all 103 `{"content": [], "itemCount": 0}`, shown as the generic "task tools haven't been used recently" line: no task list |
| instructions | 1 | `/root/.claude/CLAUDE.md`, the agent kit's INSTRUCTIONS.md, `/home/user/blog/CLAUDE.md`; the same in all six |
| environment | 1 | working directory `/home/user/blog` (the session's, as in round 1), "git repository: true", platform, scratchpad path |
| prompt_snapshot | 2 | the system prompt and the tool definitions |
| skill_listing, mcp_instructions_delta, deferred_tools_delta, model, date, credential_org, session_context, remote_session_change | 1 each | generic lists of skills, MCP servers and tools (the same in all six); model name, date, organisation id, `{}`, commit attribution lines |
| queued_command, edited_text_file | c1-tools 4 + 1, c3-tools 7 + 2, c3-bare 0 + 0, the others 0 + 1 | notices of the attempt's own background commands; its own HOW.md |
| deferred_tools_record | c1-tools 2, c1-bare 2, c3-tools 3 | input bookkeeping, and the TaskStop (c1-bare) and Monitor (c3-tools) schemas loaded with ToolSearch |
| meta user messages | 28 in all | the hand-back reminder (6) and image-size notes (22) |

None names a performer, title, tab source or video id of songs.json, or a folder of the job (no `/home/user/gtv`, `guitar-tab`,
`songs/`, `truth`; only `AO-073` in the blog's CLAUDE.md, `AO-001` in a skill description); `capo`, `tuning`, `standard` never as a
slot (only "standard CLI tools", "Standard 5-field cron"). No system-reminder in any tool result (`out/attach-*`).

**R2.3 Per attempt.**

| attempt | tool calls (Bash / Read / Write / Edit / other / handback) | commands without `cd` | paths outside the allowed set | web, git, installs, agents | interpreters, imports | verdict |
|---|---|---|---|---|---|---|
| c1-tools | 196 (144 / 45 / 3 / 3 / 0 / 1) | 12, all absolute | 0 | 0 | venv-torch 134 (numpy, librosa, Pillow); `python3` 1, stdlib | valid |
| c1-bare | 206 (154 / 47 / 0 / 2 / ToolSearch 1, TaskStop 1 / 1) | 1, absolute | 0 | 0 | bare venv 231; numpy, scipy, soundfile, stdlib, own `img.py` | valid |
| c2-tools | 163 (132 / 29 / 1 / 0 / 0 / 1) | 6, absolute | 0 read; 1 refused write (#103) | 0 | venv-torch 66 (numpy, librosa, soundfile); `python3` 18, 2 with numpy | valid |
| c2-bare | 151 (124 / 24 / 2 / 0 / 0 / 1) | 3, absolute | 0 | 0 | bare venv 251; numpy, scipy, soundfile, PyGuitarPro, stdlib, own modules | valid |
| c3-tools | 192 (147 / 38 / 1 / 4 / ToolSearch 1 / 1) | 12, absolute | 0 | 0 | venv-torch 34 (numpy, scipy, soundfile, librosa, matplotlib, Pillow); `python3` 64, stdlib | valid |
| c3-bare | 153 (127 / 23 / 2 / 0 / 0 / 1) | 1, absolute | 0 | 0 | bare venv 240; numpy, scipy, soundfile, stdlib, own `ana.py` | valid |

- Read/Write/Edit: only the own folder and the arm sheet (c3-bare also read `bare/validate_answer.py`). No input names another blind
  folder, `/home/user/gtv/guard`, `/home/user/blog`, or `/home/user/gtr` beyond `bin/gtr-eval` (R2.4); none names gtr-run. Every
  `..` is the own video or folder (c2-bare: 33 `../video.mp4`, 7 from its own `cal/`); other "outside" strings are `sed` patterns.
- Every HOW.md (48-59 lines) and hand-back says the piece was not recognised; no songs.json name anywhere (`out/names.txt`).
- answer.json, answer.gp5, HOW.md, NOTES.md were last written inside each attempt's span. After 13:47 each folder got a `score/`
  folder (37 entries) and `c2/tools/w/` lost entries: the scorer and the orchestrator's clean-up (NOTE.md).

**R2.4 Refusal and minor deviations** (not voiding; none touches an answer).
- **c2-tools #103 (13:25:02)**: `python3 - > /tmp/claude-0/x 2>/dev/null; cat > scripts/levels.py ...` was refused by the auto-mode
  classifier (`unauthorized_access`), the only refusal of round 2: a write, and nothing ran; #104 sent the same command without it.
- **`ps aux`**: c1-tools #22 (showed c3-tools' kit command lines; it says so in HOW.md and its hand-back), c3-tools #18 (c1-tools'
  kit command lines, MCP servers with key names but no values, the watch's command line `watch.py .../access-r2.log`), c2-tools #19
  (its own kit jobs, the same watch line), c2-tools #117 (a count).
- **gtr-eval usage text**: c1-tools #20, #37 and c2-tools #39 ran it with no arguments or `--help` (the text names the `ledger`
  subcommand and `/home/user/gtr/inputs`); no comparison, no ledger command.
- **c2-tools #127, #128**: system `python3` with numpy, where TOOLS.md says plain `python3` is for standard-library glue.
- **Harness tools**: c1-bare #17-#18 ToolSearch, then TaskStop of its own timed-out command; c3-tools #172 ToolSearch for Monitor,
  never called.

**R2.5 The access log.**
1. START 12:20:45 (pid 451, 2,888 paths), STOP 13:47:00. Coverage: 2,886 folders under the roots existed before the start and still
   exist, + 2 files = 2,888; 10 were made after the stop (this audit, the scorer), none in the window. As in round 1 the watch
   cannot see `/home/user/gtv/blind`, `/home/user/gtv/tools`, `/home/user/gtr` beyond the ledger, or hard-link reads: the
   transcripts cover those.
2. 25,317 lines = 25,315 events + START and STOP: 9,794 ACCESS on the run ledger; 5,173 OPEN DIR + 10,346 ACCESS DIR on the records
   folder; one OPEN + one ACCESS of `video/PRODUCTION.md` (13:34:08); **none** on truth, songs, experiments, candidates, work,
   production or INSTALLED.md.
3. Ledger: 45 bursts = 45 gtr-run records r1161-r1205, one to one by end time, all lane `blind-kit`, cwd the attempt's folder,
   inside its span: c3-tools 19, c1-tools 11, c2-tools 15 (`out/ledger-match.txt`). No bare attempt and no other process ran
   gtr-run.
4. Folder listings: seven walks of 2,217 lines. 12:21:12 and 13:34:55 = the orchestrator's Stop hook (`stop_hook_summary` at those
   seconds); 13:34:08 with PRODUCTION.md = its compaction (`compact_file_reference` to that file); 13:34:13 = its
   permission-classifier call that carried a git status. **13:25:04, 13:25:09, 13:25:18 are not a compaction, as NOTE.md says**
   (the orchestrator's transcript holds only queue notices from 12:21:12 to 13:34:08): they fall on c2-tools' refused #103 (result
   13:25:04) and its next calls #104 and #105, whose classifier contexts are the only 2 of 832 in round 2 with a computed git status
   of `/home/user/blog` (clean, 0 changes), the same pairing as at 13:34:13: the harness's classifier ran git status in the
   session's working directory after the refusal. That context is a field of the transcript record, not part of the tool result the
   agent reads; the commands ran in the own folder (`out/dir-burst-calls.txt`).

**R2.6 Problems not caused by the attempts.**
1. **The videos are hard links again, of the same three recordings as round 1** (links made 12:19:46; `stat -c %h` prints 3 2 3):
   `blind/c1/video.mp4` = `blind/b3/video.mp4` = `songs/capo/capo.mp4`, `blind/c3/video.mp4` = `blind/b1/video.mp4` =
   `songs/standard/standard.mp4`, `blind/c2/video.mp4` = `blind/b2/video.mp4`. The round-1 folders held answers to the same pieces;
   no round-2 attempt named them.
2. **BLIND.md section 4 step 3 (tools Bash, Read, Write, Edit, Glob, Grep only) was applied in neither round**: each attempt was
   offered the same 55 tools (Skill, Artifact, 38 MCP tools among them) and 540 deferred ones (WebFetch, WebSearch, SendMessage
   among them); they used none of them but ToolSearch (twice) and TaskStop (once).
3. NOTE.md: the 13:25 attribution is not supported (R2.5 item 4) and it counts START and STOP as events; the rest checks out. Not
   checked here: the scorer's reads after 13:47 and the orchestrator's deletion of scratch files.
