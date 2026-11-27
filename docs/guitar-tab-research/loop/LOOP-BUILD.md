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

L2 on the capo song with today's window (E1 has not published `G/loop/hand/capo/` yet; when it does, give that
folder as `--hand-dir` and drop `--anchors` and `--track`; the window of each song and condition is in "Network and
credentials", item 4):

```
E=/home/user/gtv/loop/e1
cd $R && $L/prep.py capo l2-capo --notes l2 --tuning 40 45 50 55 59 64 --capo 3 --hand-dir $E/capo/dev/final_m1_f30 \
  --anchors $E/capo/anchors.v0.json --track $E/capo/dev/track.final.json
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

## Network and credentials (after LOOP-REVIEW2.md)

By the sandbox-net agent, 2026-11-27 03:30-04:10 UTC: LOOP-REVIEW2.md's three blocking problems and its minor ones.
Evidence in `G/work/sandbox-net/` (PROGRESS.md, `probe4.out` with `netprobe.sh` and `apiprobe.py`, `probe3.net.jsonl`,
`writeprobe.out`, `killtest.sh` and `kk*.log`, `run_cli.py`, `sbxcall_test.py`; the replaced files in `orig/`). New code
in `G/loop/tools/`: `net_filter.py`, `net_bridge.py`, `sbx_ro.py`, `loop/blindcheck.py`; changed: `sandbox_run.sh`,
`blind_run.sh`, `loop/sbxcall.py`, `prep.py`, `driver.py`, `score_run.py`, `copy_run.py`. Every caller of
`sandbox_run.sh` gets all of it (the driver, W2, and the lanes that call it directly).

1. **Network** (blocking 1). Each call has its own network namespace (`unshare -n`) whose only interface is
   loopback. Inside, `net_bridge.py` (run as nobody, no capabilities) listens on 127.0.0.1:3128 and joins each
   connection to a unix socket served outside by `net_filter.py`, which `sandbox_run.sh` starts for the call's
   lifetime (it exits with the call; log `G/transcripts/<run>/<call id>.net.jsonl`, beside the transcripts folder,
   not writable inside). The filter takes only `CONNECT api.anthropic.com:443` and opens that connection itself,
   directly. It also ends the TLS of that host with the sandbox's own CA (`G/loop/netca/`, outside every sandbox;
   inside it is the only CA the variables name) and checks each request before sending it on over a new TLS
   connection checked against the real certificate: method and path must be `POST /v1/messages` or
   `/v1/messages/count_tokens`, the Host header the API host, the HTTP framing strict (CRLF only, one length,
   chunked never beside a Content-Length; the request is written anew with its own length, so nothing can be
   smuggled behind it), and a model request may name no tool the API runs itself (any tool type but custom), no
   `mcp_servers`, no `container`, no content block with a URL or stored-file source and no JSON key twice. Inside,
   `HTTPS_PROXY` / `https_proxy` (and `HTTP_PROXY`) point to the bridge, `NO_PROXY` is localhost only, the other proxy
   variables are dropped. The path check matters: the session ingress has the same host as the model API
   (`SESSION_INGRESS_URL` names api.anthropic.com), so a host filter alone would have let a readable token reach it.
   - What a real call needs, found by testing (`SBX_NET_MODE=observe`, a real dummy call): besides `POST
     /v1/messages` (Opus and one Haiku request) the CLI asks for `/api/claude_code/policy_limits`,
     `/api/claude_code/settings`, `/api/eval/sdk-…`, `/api/claude_cli/bootstrap` and `/api/event_logging/v2/batch`,
     and CONNECTs to `http-intake.logs.us5.datadoghq.com` (telemetry). All of them are refused and logged: dummy calls
     answered the same with and without them ($0.024 each), and so did the real L2 call (item 5). No other host or
     path was needed.
   - Proved (`probe4.out`, a writer-like probe run through `sandbox_run.sh`): example.com, raw.githubusercontent.com,
     the HQ rules page, api.github.com, github.com, claude.ai and plain http all refused at CONNECT; no DNS, and no
     route to 1.1.1.1, 8.8.8.8, the API's own address, 10/8, 172.17/16, 192.168/16, 169.254.169.254 or IPv6 (raw
     Python sockets and bash `/dev/tcp`); the box's localhost services (2024, 34837, 35889, the old proxy port 36933,
     42117, 45135) closed, being in another namespace; the only unix socket visible is the filter's; on the API host
     15 crafted requests refused (two session-ingress paths, the CLI's settings, the files API, web_fetch, web_search,
     an image and a document from a URL, mcp_servers, a server tool in a gzip body and in a chunked body, a JSON key
     twice, Content-Length with chunked, a foreign Host header, an absolute URL) while a clean one without credential
     went through (401 from the API); `unshare`, `mount` and taking loopback down refused.
2. **Credentials** (blocking 2). Found by masking known paths only: the permission system refused a listing of
   `/home/claude/.claude/remote/` (as it refused the reviewer's listing of `/home/claude`), so nothing there was
   listed or traced. Dummy `claude -p` calls (effort low, network closed): all of `/home/claude` masked: "Not logged
   in"; only `.session_ingress_token` and its variable kept: "Not logged in"; with every dropped variable kept:
   "Authentication error"; `~claude/.claude/remote/` bound back with `.session_ingress_token` bound to `/dev/null`
   and every variable below dropped: works. So the CLI authenticates with another file of that folder, not with
   the session's ingress token. Now: `/home/claude` is a tmpfs; `~claude/.claude/remote/` comes back read-only (a
   writer cannot change the session's files) with `.session_ingress_token` bound to `/dev/null`; dropped from the
   call's environment: `SESSION_INGRESS_URL`, `CLAUDE_SESSION_INGRESS_TOKEN_FILE`, `SBX_TELEMETRY_SOCKET`,
   `CLAUDE_CODE_REMOTE*`, `CCR_*`, the messaging socket and token, the session, container, account and organization
   ids, the user's e-mail, GitHub, AWS, cloud and git variables. Masked as well: `/run` (the telemetry socket and the
   rest), `/dev/shm`, `~/.aws`, `~/.ssh`, `~/.studio`, `~/.boto`, `~/.gitconfig`, the environment manager's files, and
   `~/.claude.json` is a per-call copy without the account's e-mail and the MCP servers (before, the CLI put the
   e-mail into the writer's context). **The CLI's own credential stays readable inside** (it must, for the CLI to
   log in), **but with the network closed it reaches nothing but the model API**: the filter sends on only model
   requests without web tools, URL sources or MCP servers, so it buys a model call that cannot fetch anything, which
   is what the writer already is; the session ingress, the CLI's settings, the files API and every other host and
   path are refused.
3. **Slot names** (blocking 3). `prep.py` no longer byte-copies the hand files that can name their sources: it
   rewrites `tips.jsonl`, `anchors.json` and `track.json` with every path-like string set to null (the video and
   the anchors get the blind folder's own paths), so `track.json` no longer names `G/loop/e1/<slot>/...` or
   `G/experiments/<slot>/...`. At the end of every prep `loop/blindcheck.py` reads every file of the blind folder
   (text; JSON values; CSV cells; media tags and the printable strings of binary files) for a slot name in a path,
   file name or id or as a whole value, "truth", "experiments", a song's title, artist, player, id, source file or
   source host (read from `video/songs.json` and `G/library/NOTES.md`, there only) and any path outside the folder,
   the loop's code and the venvs; one hit refuses the run and deletes the folder. `driver.py` runs the same check at
   every start. The bare word as a key (`"capo": 3`, `tuning_midi`) is the schema of every run and passes. On the 22
   old blind folders: the nylon one (`bw/4701f496`, `r2-nylon-l2`) has 8 hits, all in `track.json`; the two
   pre-fix dry runs name transcript paths; the rest none. `r2-nylon-l2` is marked `UNUSABLE.json` and the driver
   refuses it (tested). Its replacement, `runs/r3-nylon-l2` (`bw/bd5dda21`), was prepared with the
   same arguments: 53 units, 1,120 candidates, 0 hits; track and tips identical but for the three paths; the neck
   model loads it. Preps of the capo and standard songs with the windows below, and an L4 one: 0 hits. Negative
   tests: a player's name and "capo" as a value put into a `track.json`: both runs refused, folders deleted.
4. **Minor problems.**
   - Key copies: `score_run.py` writes `truth_heard.json`, `truth_span.json` and `truth_span_heard.json` to
     `G/loop/score/<run>/`, never into the run folder; the 11 such files of earlier scorings were moved there;
     `copy_run.py` skips `truth*.json`. Tested on a copy of dry3: the same numbers, no key file in the run folder.
   - Orphans: the call keeps its own hard limit, so it stops even when the driver dies. `sbxcall.py` sets
     `SBX_HARD_S` = the driver's limit + 60 s; `blind_run.sh` runs claude under `timeout` at `SBX_HARD_S` - 45 s
     (TERM, KILL 20 s later), and `sandbox_run.sh` at `SBX_HARD_S` sends TERM to every process of the call's pid
     namespace and 30 s later KILL (`unshare --kill-child` ends the namespace). Tested with the driver killed by
     SIGKILL 5 s into the call (limit 10 s, so 70 s): a real claude running `sleep 240` was gone at +72 s
     (`run.meta.json` written, exit 143), a sandboxed sleep 600 at +102 s.
   - `/run`: the staging folders have random names and are removed on exit; folders of a call killed outright are
     removed by the next start; the old `/run/sbx-1` and `/run/sbxrw-1` are gone. None left after the tests.
   - The hand window of each condition (L1, L2, L3, E5's W2 and E6's two runs; L4 has none): `G/loop/hand/<S>/` once
     lane E1 publishes it (then `--hand-dir G/loop/hand/<S>` alone). Until then the development windows (margin 1,
     30 rows a second, scores in `G/work/e1-tracker/PROGRESS.md`):

     | song | `--hand-dir` | `--anchors` | `--track` |
     |---|---|---|---|
     | capo | `G/loop/e1/capo/dev/final_m1_f30` | `G/loop/e1/capo/anchors.v0.json` | `G/loop/e1/capo/dev/track.final.json` |
     | standard | `G/loop/e1/standard/dev/final_m1_f30` | `G/loop/e1/standard/anchors.v0.json` | `G/loop/e1/standard/dev/track.final.json` |
     | nylon | `G/loop/e1/tuning/dev/final2_m1_f30` | `G/loop/e1/tuning/anchors.dev.json` | `G/loop/e1/tuning/dev/track.final2.json` |

   - Added: nothing a call writes can run outside later. `/root` is an overlay with a tmpfs above it (what the CLI
     writes in its home is gone after the call), the loop's code is always read-only (`net_filter.py`, which runs
     outside, is there), and `sbx_ro.py` remounts read-only every mount the namespace got from the box (`/`,
     `/opt/claude-code`, `/opt/env-runner`, `/dev`, `/mnt/...`). `writeprobe.out`: the system's Python, `/etc`, the
     CLI, the venvs, the scorer, the loop's code, `/var/tmp` and `/dev` refused; `/root` and `~/.claude` writable
     inside only (the real `~/.bashrc` unchanged). The writer's five tools (render, spec, solve, overlay, check)
     give the same output with it as without.
5. **One real L2 writer call** with everything in place: `runs/sn-l2-capo`, a copy of dry3, unit 3 (9.59-12.75 s),
   Opus 5.5 at effort max: **1.37 minutes, $0.422 list** (8,202 output tokens, 214,884 input tokens with cache, 16
   turns, 15 tool calls, 3 pictures read), valid on the first ask, audit 0 void 0 warn. Its 11 notes: 11 of 11 key
   notes on the key's string and fret (heard 11 of 11), 0 wrong, missed or invented (`score_run.py`, span 0-12.75 s:
   44 of 44). Its network log: 15 CONNECTs, all to api.anthropic.com:443, 10 `POST /v1/messages` let through (9
   Opus, 1 Haiku, custom tools only), 13 of the CLI's other requests refused (settings, policy, flags, bootstrap,
   telemetry) and one CONNECT refused (the telemetry host). The same unit before the change (kt-dry3): 2.04 minutes,
   $0.530, 11 of 11. This lane's 20 dummy calls cost $0.27 list.

Lanes: E1's three `hand-*-check` calls started at 03:40 and 03:43 UTC, before the change, under the old sandbox
(network open); their transcripts (167 tool calls) hold no network command. E2's `tun-*-all` calls (started 04:00)
run under the closed network and work (17 to 25 model requests each by 04:04).

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

- **The hand window is E1's development window** (item 4 of "Network and credentials"), scored on the keys:
  `--hand-dir G/loop/hand/<S>/` takes E1's blind, published folder when it lands.
- **The residual** is noisy (FluidSynth's timbre); the context is now masked; `check.txt` is the better evidence.
- **Alternatives are many** (971 on the capo song, 899 held by one model); thinning their labels helps the picture.
- **Revisits are untested on hard bars**; L3's tuning review and re-placing ran only with fake calls.
- **The new string-rings rule** may cost writers a round of `check.sh` on legato passages (they must mark
  `repluck` or move a note); dry3's writers passed it on the first ask, and the stand-in marks it itself.
- **The guard** (inotify, no process ids) is unchanged; the sandbox is the first line and the transcript audit the
  second. Readable inside and not answers: the CLI's own credential (it reaches only model requests through the
  filter), `~/.claude/settings.json`, the cached policy and remote settings, the CLI binary (read-only).
- **W2's sandboxed path** is built but has not run a session.
- **Only serial units** (`--max-parallel 1`); songs can run side by side as separate drivers.
