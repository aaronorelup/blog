#!/bin/bash
# sandbox_run.sh <work_folder> <transcripts_dir> <command...>
# Runs <command> (normally blind_run.sh) where the answers cannot be read and nothing but the model API can be reached.
#
# Files: a private mount and pid namespace in which every answer-bearing place is an empty tmpfs (the keys, songs,
# experiments, AO-082's blind answers, other runs, the records, other transcripts, the scratch folders, the key store),
# with only the attempt's own folder (<work_folder>, under /home/user/gtv/loop) and the loop's code
# (/home/user/gtv/loop/tools) mounted back; ~/.claude/projects is the given <transcripts_dir>, so the attempt's
# transcript is kept there and no other transcript is visible. /home/claude (the cloud session's own files) is masked
# but ~claude/.claude/remote/, which holds the credential the CLI needs, comes back read-only, and the session ingress
# token in it is bound to /dev/null (found by masking: the CLI does not need it). /run (the sandbox telemetry socket
# and every other socket there), /dev/shm, ~/.aws, ~/.ssh, ~/.studio, ~/.boto, ~/.gitconfig and the environment
# manager's files are masked too; ~/.claude.json is a per-call copy without the account's e-mail and MCP servers.
#
# Network: its own network namespace (unshare -n) whose only interface is loopback. The only way out is
# net_bridge.py on 127.0.0.1:$SBX_NET_PORT (default 3128), joined to a unix socket served OUTSIDE by net_filter.py
# (started here for the call's lifetime), which accepts only CONNECT to api.anthropic.com:443, ends its TLS with the
# sandbox's own CA (the only CA trusted inside) and lets through only model requests (POST /v1/messages and
# /v1/messages/count_tokens, Host the API, no server tool, MCP server, container or URL/file source), each sent on
# over a new TLS connection it opens itself; everything else is refused and logged. So the credential left readable
# reaches nothing but the model, without web. HTTPS_PROXY / https_proxy point to the bridge, NO_PROXY no longer lists
# the API host, the agent proxy's port and every other localhost service of the box are gone (another namespace), and
# the session-ingress, telemetry, messaging, remote-session, account and token variables are dropped. Log:
# $SBX_NETLOG, default <transcripts_dir>.net.jsonl (beside the transcripts folder, not inside it, so the call cannot
# write it). $SBX_NET_MODE=observe (by hand only, never for a blind attempt) logs what would be refused instead.
#
# Writes: /root is an overlay with a tmpfs above it (what the CLI writes in its home is the call's own, gone after
# it), the loop's code is always read-only, and at the end sbx_ro.py remounts read-only every mount the namespace
# got from the box (/, /opt/claude-code, /opt/env-runner, /dev, /mnt/...): the call can write only its own folder (or
# pack), its transcripts, /root's overlay and the tmpfs masks, so nothing it writes can run outside later.
#
# The command runs with CAP_SYS_ADMIN, CAP_SYS_PTRACE, CAP_SYS_MODULE, CAP_SYS_RAWIO, CAP_NET_ADMIN and CAP_NET_RAW
# dropped from the bounding set, so nothing inside can remount, enter another namespace, reach another process's view
# or change the network. $SBX_HARD_S (optional): a hard limit of the whole call, kept here, so a call stops at it even
# when its driver is dead (TERM to the namespace, KILL 30 s later). The /run staging folders are removed on exit.
# Answers stay on the box; they are just not there for the attempt.
set -u
WF=$(realpath "$1"); TD=$(realpath -m "$2"); shift 2
case "$WF" in /home/user/gtv/loop/*) ;; *) echo "work folder must be under /home/user/gtv/loop" >&2; exit 2;; esac
TOOLS=/home/user/gtv/loop/tools
mkdir -p "$TD"
# an inherited descriptor (a socket opened outside) would carry the box's network into the namespace: close all > 2
for fd in /proc/$$/fd/*; do fd=${fd##*/}; [ "$fd" -gt 2 ] 2>/dev/null && eval "exec $fd>&-" 2>/dev/null; done
# staging folders left by a call that was killed outright (their pid file names a process that is gone)
for d in /run/sbxnet-??????; do
  [ -d "$d" ] || continue; p=$(cat "$d/pid" 2>/dev/null) || p=""
  if { [ -n "$p" ] && ! kill -0 "$p" 2>/dev/null; } || { [ -z "$p" ] && [ -n "$(find "$d" -maxdepth 0 -mmin +10)" ]; }; then
    rm -f "$d/proxy.sock" "$d/pid" "$d/ca.crt" "$d/claude.json"; rmdir "$d" 2>/dev/null; fi
done
for d in /run/sbx-1 /run/sbxrw-1/* /run/sbxrw-1; do [ -d "$d" ] && rmdir "$d" 2>/dev/null; done   # the old fixed names
NETD=$(mktemp -d /run/sbxnet-XXXXXX); chmod 755 "$NETD"; echo $$ > "$NETD/pid"
NETLOG=${SBX_NETLOG:-${TD%/}.net.jsonl}
PORT=${SBX_NET_PORT:-3128}
# shellcheck disable=SC2086
python3 -I "$TOOLS/net_filter.py" --socket "$NETD/proxy.sock" --log "$NETLOG" --label "$(basename "$TD")" \
  --watch-pid $$ --mode "${SBX_NET_MODE:-inspect}" ${SBX_NET_ALLOW:+--allow $SBX_NET_ALLOW} < /dev/null &
FPID=$!
CPID=""; WPID=""
cleanup() {
  [ -n "$WPID" ] && kill "$WPID" 2>/dev/null
  kill "$FPID" 2>/dev/null; wait "$FPID" 2>/dev/null
  rm -f "$NETD/proxy.sock" "$NETD/pid" "$NETD/ca.crt" "$NETD/claude.json"; rmdir "$NETD" 2>/dev/null
}
trap cleanup EXIT
trap ':' TERM INT HUP          # the call's process group gets the signal too; wait for the namespace to end, then clean up
for i in $(seq 100); do [ -S "$NETD/proxy.sock" ] && break; sleep 0.05; done
[ -S "$NETD/proxy.sock" ] || { echo "net_filter.py did not start" >&2; exit 2; }
cp /home/user/gtv/loop/netca/ca.crt "$NETD/ca.crt"       # the filter's CA: the only one trusted inside
# ~/.claude.json for the call: a copy without the account's e-mail address and the MCP servers (bound over it inside)
python3 -I - "$NETD/claude.json" <<'PY' 2>/dev/null || true
import json, os, sys
d = json.load(open("/root/.claude.json"))
d.pop("mcpServers", None); (d.get("oauthAccount") or {}).pop("emailAddress", None)
fd = os.open(sys.argv[1], os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600); os.write(fd, json.dumps(d).encode()); os.close(fd)
PY

unshare -m -p -n -f --kill-child=SIGKILL --propagation private --mount-proc bash -c '
set -e
WF="$1"; TD="$2"; NETD="$3"; PORT="$4"; shift 4
TOOLS=/home/user/gtv/loop/tools
INIT=$(awk "{print \$1}" /proc/self/mountinfo | tr "\n" " ")     # the box mounts: read-only at the end (sbx_ro.py)
# /root: an overlay whose upper layer is a tmpfs, so what the CLI writes in its home is the call own and gone after it
O=$(mktemp -d /run/sbxov-XXXXXX); mount -t tmpfs -o mode=0700 tmpfs $O; mkdir $O/up $O/wk
mount -t overlay overlay -o lowerdir=/root,upperdir=$O/up,workdir=$O/wk /root
umount -l $O; rmdir $O
S=$(mktemp -d /run/sbx-XXXXXX)
mount --bind /home/user/gtv/loop $S
mount --bind "$TD" /root/.claude/projects
mount -t tmpfs tmpfs /home/user/gtv/loop
mkdir -p $TOOLS "$WF" /home/user/gtv/loop/.net
mount --bind $S/tools $TOOLS; mount -o remount,bind,ro $TOOLS      # the loop code (net_filter.py runs outside)
mount --bind "$S/${WF#/home/user/gtv/loop/}" "$WF"
umount -l $S; rmdir $S
mount --bind "$NETD" /home/user/gtv/loop/.net      # the filter socket, the only way out
# opt-in (the loop driver sets these): SBX_RW = paths inside the work folder that stay writable, the rest of the work
# folder is then read-only; SBX_RO = absolute paths made read-only (the loop code, the venvs, the scorer). Done before
# the capabilities are dropped, so nothing inside can undo it.
if [ -n "${SBX_RW:-}" ]; then
  T=$(mktemp -d /run/sbxrw-XXXXXX); k=0
  for r in $SBX_RW; do [ -e "$WF/$r" ] || continue; k=$((k+1)); mkdir -p $T/$k; mount --bind "$WF/$r" $T/$k; done
  mount --bind "$WF" "$WF"; mount -o remount,bind,ro "$WF"
  k=0
  for r in $SBX_RW; do [ -e "$WF/$r" ] || continue; k=$((k+1)); mount --bind $T/$k "$WF/$r"; umount -l $T/$k; rmdir $T/$k; done
  rmdir $T
fi
for r in ${SBX_RO:-}; do [ -e "$r" ] || continue; mount --bind "$r" "$r"; mount -o remount,bind,ro "$r"; done
unset SBX_RW SBX_RO
for d in truth songs experiments candidates work production blind notes heldout guard library render vault transcripts; do
  [ -d /home/user/gtv/$d ] && mount -t tmpfs tmpfs /home/user/gtv/$d; done
# The credential of the CLI (found by masking, LOOP-BUILD.md "Network and credentials"): /home/claude is masked below,
# then only ~claude/.claude/remote/ comes back, read-only, with the session ingress token in it bound to /dev/null (the
# CLI authenticates with another file of that folder). Whatever is left readable reaches only the filter.
CR=/home/claude/.claude/remote
if [ -d "$CR" ]; then mkdir -p /home/user/gtv/loop/.keep; mount --bind "$CR" /home/user/gtv/loop/.keep; fi
for d in /home/user/blog /home/user/land /home/user/gtr/ledger /home/user/gtr/eval/ledger /home/user/gtr/inputs /home/user/gtr/lanes \
         /root/agent-kit /root/wb /root/.config /tmp /root/.claude/tasks /root/.claude/sessions /root/.claude/shell-snapshots \
         /root/.claude/session-env /root/.claude/backups /root/.claude/cc-project-state /root/.claude/skills /root/.claude/bin \
         /root/.claude/agents /root/.claude/plugins /root/.claude/environment-manager /root/.claude/rm-guard /root/.claude/state \
         /root/.aws /root/.ssh /root/.studio /home/claude /run /dev/shm; do
  [ -d "$d" ] && mount -t tmpfs tmpfs "$d"; done
if [ -d /home/user/gtv/loop/.keep ]; then
  mkdir -p "$CR"; mount --bind /home/user/gtv/loop/.keep "$CR"; mount -o remount,bind,ro "$CR"
  umount /home/user/gtv/loop/.keep; rmdir /home/user/gtv/loop/.keep
  [ -f "$CR/.session_ingress_token" ] && mount --bind /dev/null "$CR/.session_ingress_token"
fi
for f in /root/.claude/CLAUDE.md /root/.claude/infisical.json /root/.claude/agent-kit-key /root/.claude/library-rules.txt \
         /root/.claude/agent-kit-state.json /root/.boto /root/.gitconfig; do
  [ -f "$f" ] && mount --bind /dev/null "$f"; done
if [ -f /home/user/gtv/loop/.net/claude.json ]; then
  mount --bind /home/user/gtv/loop/.net/claude.json /root/.claude.json; fi
# the network: loopback up, the bridge (as nobody, no capabilities) on 127.0.0.1:PORT -> the filter socket
python3 -I $TOOLS/net_bridge.py --up
setpriv --reuid=65534 --regid=65534 --clear-groups --inh-caps=-all --bounding-set=-all \
  python3 -I $TOOLS/net_bridge.py /home/user/gtv/loop/.net/proxy.sock "$PORT" < /dev/null > /dev/null 2>&1 &
HP=$(printf "%04X" "$PORT")
for i in $(seq 100); do grep -q "^ *[0-9]*: 0100007F:$HP 00000000:0000 0A" /proc/net/tcp && break; sleep 0.05; done
P="http://127.0.0.1:$PORT"
export HTTPS_PROXY=$P https_proxy=$P HTTP_PROXY=$P http_proxy=$P NO_PROXY=localhost,127.0.0.1,::1 no_proxy=localhost,127.0.0.1,::1
CA=/home/user/gtv/loop/.net/ca.crt
export NODE_EXTRA_CA_CERTS=$CA SSL_CERT_FILE=$CA REQUESTS_CA_BUNDLE=$CA CURL_CA_BUNDLE=$CA PIP_CERT=$CA DENO_CERT=$CA \
  NIX_SSL_CERT_FILE=$CA AWS_CA_BUNDLE=$CA HTTPLIB2_CA_CERTS=$CA GRPC_DEFAULT_SSL_ROOTS_FILE_PATH=$CA HEX_CACERTS_PATH=$CA
for v in $(compgen -e); do
  case "$v" in
    SESSION_INGRESS_URL|CLAUDE_SESSION_INGRESS_TOKEN_FILE|SBX_TELEMETRY_SOCKET|CLAUDE_CODE_REMOTE*|CCR_*|\
    CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2|CLAUDE_CODE_USE_CCR_V2|CLAUDE_CODE_MESSAGING_*|CLAUDE_CODE_CONTAINER_ID|\
    CLAUDE_CODE_WORKER_EPOCH|CLAUDE_CODE_SESSION_ID|CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION|CLAUDE_CODE_DIAGNOSTICS_FILE|\
    GLOBAL_AGENT_*|YARN_HTTPS_PROXY|npm_config_https_proxy|npm_config_noproxy|DOCKER_HTTPS_PROXY|CLOUDSDK_*|\
    ELECTRON_GET_USE_PROXY|GH_TOKEN|GITHUB_TOKEN|AWS_*|GIT_*|INFISICAL*|SBX_NET*|CLAUDE_CODE_USER_EMAIL|\
    CLAUDE_CODE_ACCOUNT_UUID|CLAUDE_CODE_ORGANIZATION_UUID|CLAUDE_CODE_CHILD_*|CLAUDE_ADDITIONAL_DIRECTORIES|\
    CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD|DOCUMENTS_MCP_SCRATCH_ROOT|CLAUDE_PID|TRACEPARENT) unset "$v";;
  esac
done
python3 -I $TOOLS/sbx_ro.py "$INIT"
cd "$WF"
export SBX_TRANSCRIPTS="$TD"
if [ -n "${SBX_HARD_S:-}" ]; then export SBX_CLAUDE_LIMIT_S=$(( SBX_HARD_S > 90 ? SBX_HARD_S - 45 : SBX_HARD_S )); fi
exec setpriv --bounding-set -sys_admin,-sys_ptrace,-sys_module,-sys_rawio,-net_admin,-net_raw "$@"
' sbx "$WF" "$TD" "$NETD" "$PORT" "$@" < /dev/null &
CPID=$!
if [ -n "${SBX_HARD_S:-}" ]; then
  ( trap 'kill $SP 2>/dev/null; exit 0' TERM
    sleep "$SBX_HARD_S" & SP=$!; wait $SP
    echo "sandbox_run.sh: hard limit ${SBX_HARD_S}s reached: stopping the call" >&2
    # TERM to every process of the call's pid namespace but its init (an init ignores TERM from outside), so claude
    # stops and blind_run.sh still writes its record; then KILL: unshare dies and --kill-child ends the namespace
    NSI=$(cat /proc/$CPID/task/$CPID/children 2>/dev/null); NSI=${NSI%% *}
    NS=$(readlink /proc/$NSI/ns/pid 2>/dev/null)
    if [ -n "$NS" ]; then
      for q in /proc/[0-9]*; do q=${q#/proc/}; [ "$q" != "$NSI" ] && [ "$(readlink /proc/$q/ns/pid 2>/dev/null)" = "$NS" ] && kill -TERM $q 2>/dev/null; done
    fi
    sleep 30 & SP=$!; wait $SP; kill -KILL "$CPID" 2>/dev/null; kill -KILL "$NSI" 2>/dev/null ) &
  WPID=$!
fi
RC=0
while :; do wait "$CPID"; RC=$?; kill -0 "$CPID" 2>/dev/null || break; done
exit $RC
