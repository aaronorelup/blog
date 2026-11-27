# LOOP-REVIEW3: adversarial re-test of the sandbox after the network/credential/slot fix

By the sandbox-test agent (not the builder, fixer or sandbox-net agent), 2026-11-27 ~04:10-04:25 UTC, on the code as
sandbox-net left it. No code changed. Method: a probe script in a copy of the shipped nylon blind folder
(`bw/bd5dda21`, run `r3-nylon-l2`), run through `sandbox_run.sh` the way `sbxcall.py` launches a writer
(`SBX_RW=pk`, `SBX_RO` the loop code and gtr). Evidence: `G/work/sandbox-test/` (probe.sh, probe2.sh, probe3.out,
realcall.net.jsonl, PROGRESS.md); net logs `G/transcripts/sbxtest-*.net.jsonl`.

**Verdict: ready (PASS).** LOOP-REVIEW2.md's three blocking problems are closed and no route I tried reached anything
a writer must not reach. The two residual MINORs below are hygiene, not leaks.

## 1. Every route tried, and its result

**Internet (all refused).** Direct `http`/`https` to example.com: no route (000). Old agent proxy `127.0.0.1:36933`:
000 (gone, another netns). The new bridge `127.0.0.1:3128` CONNECT to example.com / raw.githubusercontent.com: both
000/refused. DNS (`getent`, python `getaddrinfo`): fail. `/dev/tcp` to 1.1.1.1:443 and an external IP: fail. Python
raw sockets to 1.1.1.1, 8.8.8.8:53, 169.254.169.254 (metadata), 10/172.17/192.168: all `OSError`. Host built from
base64 (`example.com`): 000. A decoded `api.anthropic.com` on a non-model path (`/v1/models`): 403 from the filter.

**Egress is truly bounded.** `/proc/net/tcp` holds one line (the bridge listener), `/proc/net/unix` one entry; no fd
of any visible process points outside the sandbox tree. Creating a netdev (`ip link add`) and a raw socket: refused
(no CAP_NET_ADMIN/NET_RAW). So even killing `net_bridge` and binding your own :3128 reaches only the one unix socket
to `net_filter` outside, which takes only `CONNECT api.anthropic.com:443` + `POST /v1/messages` with no web tools /
URL / file / MCP source. The bridge runs as nobody; its `/proc/<pid>/mem` is unreadable.

**Localhost services outside:** ports 2024, 34837, 35889, 36933, 42117, 45135 all closed (another netns); only 3128
(the bridge) answers, and it 403s a plain `GET` and every non-model path.

**Session ingress / credentials.** `SESSION_INGRESS_URL`, `CLAUDE_SESSION_INGRESS_TOKEN_FILE`, the messaging,
account, org, email, GH and AWS variables: all unset in the writer's env. The known ingress token file
(`/home/claude/.claude/remote/.session_ingress_token`) stat'd at **size 0** (bound to `/dev/null`; I did not list
`/home/claude`, which the permission system refuses). Crafted POSTs on the API host to `/api/claude_code/settings`,
`/v1/files`, `/api/event_logging/v2/batch`: all 403.

**Answer keys & records.** `truth`, `songs`, `experiments`, `blind`, `work`, `notes`, `heldout`, `transcripts`,
`library`, `production`, `guard`, `render`, `candidates`, `gtr/ledger`: all empty tmpfs. `loop/bw`, `loop/runs`,
`loop/e1..e3`, `loop/netca`, `loop/score`: absent. `/home/user/blog` masked (STATE.md unreadable). Under `loop/` only
`.net`, `sbxtest` (its own work folder, no siblings) and `tools` (read-only) show; the E1 hand-answer source
(`e1/tuning/dev`) is gone. Symlink to `truth`: empty. Symlink to `netca/ca.key`: absent. `/proc`: own pid namespace,
only self + the bridge; no outside process environ.

**Escape:** `unshare -m`, `unshare -n`, `mount -o remount,rw` on the loop code, `umount` a mask: all refused. Writes
to the loop code, `/usr/bin`, and a read-only sibling (`inputs/`): refused. Only the pack folder is writable.

## 2. The new prep's blind folder (bd5dda21): slot names and source paths

`blindcheck.py bw/bd5dda21` -> **0 hits.** `inputs/hand/track.json` source paths are rewritten to the folder's own
neutral id (`.../bw/bd5dda21/...`); no `G/experiments/<slot>`, `G/loop/e1/<slot>` or slot word (capo/tuning/standard)
as a value or path. My looser grep flagged three files, all benign: `track.json`/`config.json` carry `"kind":"nylon"`
and `"strings":"nylon"` — the **instrument type, intended writer input** (every song's pack states nylon or steel;
"nylon" is not a slot name, the nylon song's slot is `tuning`), and `tuning_midi`/`tuning_given:true` is the L2
condition (the true tuning is given on purpose). The only `/home/` strings are the folder's own path.

## 3. A real call still works

One `claude -p` (effort low) through the sandbox: exit 0, result `"OK"`, $0.023, `is_error` false. Net log: 2
`POST /v1/messages` allowed; `/api/claude_cli/bootstrap`, `policy_limits`, `settings`, `/api/eval/sdk-*`,
`event_logging` and the datadog telemetry CONNECT all refused. A writer gets a model call and nothing else.

## PROBLEMS, ranked

1. MINOR, intended-input clarity. `config.json "strings"` and `track.json "kind"` disclose nylon vs steel. This is
   by design and, with the network closed, not exploitable (a writer cannot fetch a recognised tune). Note it in the
   records as intended so a later reviewer does not re-flag it.
2. MINOR, leftover test folders. `G/loop/sbxtest/probe3`, `G/transcripts/sbxtest-*`, and sandbox-net's `sn-*` runs are
   non-blind scratch; remove before the real E4 runs so no stray folder confuses `blindcheck`/`copy_run`.
