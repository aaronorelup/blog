# LOOP-REVIEW2: a second adversarial review, of the fixes

By the loop-review2 agent (not the builder or fixer), 2026-11-27 03:10-03:40 UTC, on the code as the fixer left it. No code
changed. Evidence: `G/work/loop-review2/` (fakes/, killtest.py, solotest.py, scan.py, run_probe.py), the probe copy
`G/loop/review2/bwp/u003/` (probe.sh, probe.out, probe2.out), test runs `G/loop/runs/r2*` (fake except r2-nylon-l2).

**Verdict: not ready.** The ten problems of LOOP-REVIEW.md are fixed (one minor rest), but the sandbox leaves the
network open and a session credential readable, and the nylon song's blind folder names its slot: three blocking problems.

## 1. The first review's problems, one by one

1. **Hard links: fixed.** Every file of dry3's `bw/f3e17e62` and the new nylon `bw/4701f496` has `%n` = 1; prep.py checks
   it at the end (line 298), the driver at start (line 124).
2. **Audit: fixed for every listed case.** The first review's fakes: 11 VOID (12 `--state-off`); new fakes VOID too
   (relative Read, `cd ..` x4, `pushd`, `ls`/Grep above, `xargs`, a bash glob, `d=/home/user`). The driver stops at a void.
   Still unseen (section 2): base64-built path, a key path inside a Python file made with Write then run (Write content is
   not read), `os.sep.join` (0 flags each), `chr()` (WARN), bash `/dev/tcp` to a local port (0).
3. **Void restart: fixed.** r2V (`--test-void-at 3 --void-policy restart`): state.json at the void = `snapshots/u003`
   (md5 0b4cf384), `u003` moved to `runs/r2V/voided/from003.*/blind/`, its row marked voided, unit 3 written again.
   r2F (`--restart-from 1`): state.json and tab.json md5 = `snapshots/u001` (8cf3b3db, 6b59dfd0), u001-u002 moved out.
4. **Kill: fixed.** r2KT, SIGTERM mid-call: exit 130 in 32 s, 0 processes left in the call's group, an aborted row with
   its audit, folder in `aborted/`. r2KK, SIGKILL: the call lives on until the next start kills, logs and moves it.
5. **`--state off`: fixed.** r2S: each call runs in `bw/<id>.solo/`: inputs without similar.json, tools, no lessons, a
   tab of 0 notes, its own pack only.
6. **L3: fixed** (fixer's fkL3 log, not re-run: units 0 and 1 revisited for the tuning, no cap; deferrals logged).
7. **Heard share: fixed.** dry3's `score/summary.json`: the main number over 761 heard key notes (whole, span, unit...).
8. **Validation: fixed.** vtest.py and vtest2.py again: a ringing string (at 11.50 s, and 40 ms after), a kept candidate
   moved 1.2 s, an onset 25 ms past the end, a unison copy, an L1 pitch, onset or new note: all rejected. Accepted by
   design: an L2 pitch change with a `why`, a place outside the window with a `place_why`.
9. **Apply twice: fixed.** Stops at `u003:after-lessons` (r2T1) and `u004:after-log` (r2T2), then a restart: state.json,
   tab.json and lessons identical to the uninterrupted r2C (state c043db67, tab 543d4b75), 5 rows, no repeated call id.
   Hard-limit reuse: the fixer's test only.
10. **Pictures:** no overlapping ids (nylon u000's spectrogram.png); residual mask not re-checked; source still WARN.

## 2. Leaks through the sandbox (u003/probe.sh, run through sandbox_run.sh with the driver's env scrub and SBX_RW/RO)

Closed, route by route:
- G/truth, songs, experiments, blind, work, notes, transcripts and the rest: 0 entries; G/loop: only tools and the work
  folder; `../../../../truth/...`: no such file; a symlink to G/truth: empty. The blog, land, the agent kit,
  `~/.claude/{bin,skills,projects,...}`, `~/.config`, /tmp, gtr's ledgers, inputs and lanes: empty.
- /proc: 4 pids (own namespace); inputs `%h` 1; /dev/vda: EPERM (outside too). Remounts: `umount`, `mount` refused; in a
  new user namespace the masks are locked ("not mounted"), a non-recursive bind of G and an ext4 mount refused.
- Writes: state, tab, inputs, tools, earlier units, loop code, G/tools, gtr read-only; the pack writable. Key store:
  getkey.py "Infisical identity not found"; `git credential fill` no password; no AWS or GitHub variable.
- Every file a writer can see outside the system folders (211,342 under gtr, G/tools, G/loop/tools, /root, /run, /var,
  /srv, /mnt, /opt): 0 with a key's title, 0 exact copies of a key or a song file (scan.py, run outside on those paths).

Open:
- **The internet.** example.com 200, raw.githubusercontent.com 200, the HQ rules page 200 (its projects API 401), through
  the agent proxy the scrub keeps. The keys are transcriptions of published tabs (the steel songs: the player's own
  published arrangements of two well-known tunes; nylon: the composer's tab): a writer that recognises a tune can fetch
  its tab. The audit voids only a literal curl, wget or URL (section 1, item 2).
- **Localhost.** 127.0.0.1:35889 (environment manager, 401 without a token), :36933 (the proxy relay), :2024 (not HTTP)
  and three other lanes' claude processes: all connect.
- **`/home/claude` is not masked.** The session ingress token (`.session_ingress_token`, 894 B) exists inside, and
  `SESSION_INGRESS_URL` and `CLAUDE_SESSION_INGRESS_TOKEN_FILE` stay in the writer's env: a credential to this cloud
  session (the orchestrator's event stream, and a way to post into it). Not exercised: the permission system refused a
  listing of `/home/claude` from outside, and the token was never used.
- **The nylon blind folder names its slot.** `inputs/hand/track.json`, copied unchanged by `prep.py --track`, names
  `G/loop/e1/<slot>/anchors.dev.json` and `G/experiments/<slot>/w-01/...`. The files are hidden; the name is not, and
  for this song the slot is the word for its altered tuning (prep.py's own rule: never the slot name). It tells L3.
- Visible, no answer: `~/.claude.json` (its MCP helpers are in the masked `~/.claude/bin`), `~/.studio/getkey.py`.

## 3. Nylon unit 0, a real sandboxed L2 writer call (`runs/r2-nylon-l2`, `bw/4701f496`)

- Prep (`--hand-dir G/loop/e1/tuning/dev/final2_m1_f30`, anchors.dev, track.final2, `--units gaps`; no record says which
  E1 version E4 uses): 53 units, 1,120 candidates, every file a copy, the video = `G/blind/b2`'s blacked copy (cmp).
- Call u000.1: valid at once, $0.398, 1.57 min, 7,317 output tokens, 15 tool calls, audit 0 void 0 warn. Pack: 0-3.83 s,
  8 base + 1 alternative, tuning given; hand "lost" before 2.6 s (video fades in), frets 1-4 after (neck.jpg).
- Output: 8 notes, each string:fret right for the tuning (46 = 5:3, 50 = 4:2, open 6, 3, 2, 1), confidence 0.75;
  lessons: strings 6 and 3 agree with the tuning, one shape, the hand's fade-in, one bp split habit. It makes sense.

## 4. Cost, projected again

- 12 real writes (dry 7, dry3 3, kt-dry3's rewrite, nylon u000): $0.609 mean (sd 0.104; 0.398-0.785), 2.53 min, 14,963
  output tokens; 4 revisits: $0.413, 1.46 min; 1 aborted call $0.103. Revisits: 4 in 11 units (0.36 a unit; the first
  review used 0.1-0.25; the fixer's cross-unit offset cut should lower it).
- **Capo L2 run (73 units):** writes $37-52 (mean ± 1 sd), 7-26 revisits $3-11: **about $40-63, 3.2-3.7 h.**
- **Twelve E4 runs (728 writes):** writes $368-519, 73-262 revisits $30-108: **about $400-630 list (mid about $510)**,
  10.9 M output tokens, 33-37 h of serial calls = 8-10 h wall at four runs at a time. Not counted: W2 and L3 tuner
  calls, re-asks (none seen), void restarts (one unit each).

## PROBLEMS, ranked

1. **BLOCKING, network.** A sandboxed writer reaches the internet (the keys' published tabs) and every localhost service;
   the audit misses a fetch built in a written file or a decoded string. Give the call its own network namespace with
   only the model API (a relay that CONNECTs to the API host only), or at least VOID network code and decoders in Bash
   and in Write/Edit content (socket, urllib, requests, http.client, /dev/tcp, base64 -d, chr(, fromhex, exec).
2. **BLOCKING, session credential.** `/home/claude/.claude/remote/.session_ingress_token` is readable inside and the
   ingress variables stay in the env. Mask `/home/claude` (tmpfs) and drop `SESSION_INGRESS_URL`,
   `CLAUDE_SESSION_INGRESS_TOKEN_FILE`, `SBX_TELEMETRY_SOCKET` and the `CLAUDE_CODE_REMOTE*` variables.
3. **BLOCKING, slot name.** `prep.py --track` copies track.json with source paths naming the slot (nylon: its tuning
   word) into `inputs/hand/`. Strip its paths as anchors.json is cleaned; grep the blind folder for the slot at prep's end.
4. MINOR, key copies. score_run.py writes `truth_heard.json` (122,732 B, nearly the whole key) and `truth_span*.json`
   into `G/loop/runs/<run>/score/`, and copy_run.py copies them into every test copy (removed from mine). Hidden from
   sandboxed calls, but key copies outside G/truth: write them to a temp folder removed after scoring.
5. MINOR, orphan. After a SIGKILL of the driver (or its box) the call runs on, with no hard limit, until the next start.
6. MINOR, records. Which E1 nylon window E4 uses is not written down; `/run/sbx-1` and `/run/sbxrw-1` are left on /run.
