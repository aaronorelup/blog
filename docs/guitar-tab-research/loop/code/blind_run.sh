#!/bin/bash
# blind_run.sh <work_folder> <prompt_file> <label> [effort]
# Runs ONE blind Opus 5.5 attempt as its own headless Claude Code process with the tool limit set on the command line:
# only Bash, Read, Write, Edit, Glob, Grep (pre-approved), no MCP, no skills or slash commands, no user settings
# (so no global CLAUDE.md, hooks or task list), cwd = the work folder. Writes <work_folder>/run.json (the CLI's JSON
# result: session id, tokens, cost, duration) and <work_folder>/run.meta.json (label, start, end, transcript path).
# The transcript is ~/.claude/projects/<cwd slug>/<session id>.jsonl, for the audit. Exit 124: the hard limit stopped it.
set -u
W=$(cd "$1" && pwd); P="$2"; L="$3"; E="${4:-max}"
[ -f "$P" ] || { echo "no prompt file $P" >&2; exit 2; }
cd "$W"
T0=$(date -u +%Y-%m-%dT%H:%M:%SZ); S0=$(date +%s)
# a hard limit inside the call, kept even when the driver is dead: sandbox_run.sh sets SBX_CLAUDE_LIMIT_S from
# SBX_HARD_S (a little before its own last-resort kill of the namespace); claude gets TERM at the limit, KILL 20 s later
LIM=()
[ -n "${SBX_CLAUDE_LIMIT_S:-}" ] && LIM=(timeout --foreground -k 20 "$SBX_CLAUDE_LIMIT_S")
env -u CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD -u SBX_TRANSCRIPTS -u SBX_HARD_S -u SBX_CLAUDE_LIMIT_S \
  "${LIM[@]}" claude -p "$(cat "$P")" --model opus --effort "$E" \
  --tools "Bash,Read,Write,Edit,Glob,Grep" --allowedTools "Bash,Read,Write,Edit,Glob,Grep" \
  --setting-sources project --strict-mcp-config --disable-slash-commands --output-format json \
  > "$W/run.json" 2> "$W/run.err"
RC=$?
S1=$(date +%s)
python3 - "$W" "$L" "$T0" "$S0" "$S1" "$RC" <<'PY'
import json, os, sys
w, label, t0, s0, s1, rc = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
try:
    r = json.load(open(os.path.join(w, "run.json")))
except Exception as e:
    r = {"error": str(e)}
sid = r.get("session_id")
slug = w.replace("/", "-").replace(".", "-")
tr = os.path.expanduser(f"~/.claude/projects/{slug}/{sid}.jsonl") if sid else None
sbx = os.environ.get("SBX_TRANSCRIPTS")
tr_out = os.path.join(sbx, slug, f"{sid}.jsonl") if (sbx and sid) else tr
u = r.get("usage", {})
meta = {"label": label, "start": t0, "wall_s": s1 - s0, "exit": rc, "session_id": sid, "transcript": tr_out, "sandboxed": bool(sbx),
        "transcript_exists": bool(tr and os.path.exists(tr)), "cost_usd_list": r.get("total_cost_usd"),
        "output_tokens": u.get("output_tokens"), "input_tokens": u.get("input_tokens"),
        "cache_read": u.get("cache_read_input_tokens"), "cache_write": u.get("cache_creation_input_tokens"),
        "num_turns": r.get("num_turns"), "denials": r.get("permission_denials"), "is_error": r.get("is_error")}
json.dump(meta, open(os.path.join(w, "run.meta.json"), "w"), indent=1)
print(json.dumps({k: meta[k] for k in ("label", "wall_s", "exit", "cost_usd_list", "output_tokens", "transcript_exists")}))
PY
exit $RC
