#!/usr/bin/env python3
"""audit_unit.py <pack_dir> [--transcript T.jsonl] [--work <work folder>] [--state-off] [--json out.json]

Reads one writer's (or reviser's, tuner's, W2's) transcript and lists every tool call. It is the SECOND line of defence:
the first is sandbox_run.sh, inside which nothing answer-bearing exists. Every path a call names is resolved: absolute
paths as they are, relative ones against the call's working directory (the transcript's cwd, then every `cd` inside the
command, in order), `..` climbing included, Glob and Grep against their `path`. Flags:
  VOID  a path outside the call's work folder that is under /home or /root (the keys, songs, experiments, other runs,
        other blind folders, the records, the scorer, the key store, other transcripts: everything of the box), except
        the code and venvs the tools run (G/loop/tools, G/tools/venv*, G/tools/kit, gtr's eval venv) and the call's own
        transcript folder; a search (find, Glob, Grep, ls -R, du) rooted above the work folder; find -samefile / -inum
        / -links; another unit's folder when the condition forbids it (--state-off: nothing of other units); a Write or
        Edit outside the pack; network, git, installs, keys, mount/nsenter/sudo, a claude or gh command; a tool other
        than Bash, Read, Write, Edit, Glob, Grep.
  WARN  another unit's folder of the same run (allowed with the state on), the loop's source code, other absolute
        paths outside the system folders, a string-built path.
Also usage(): tokens and cost summed from the transcript (used when a call was killed before run.json was written);
the list price is computed from the tokens when the transcript has no cost record (Opus 5.5 list: $4 / M input,
$20 / M output, $0.20 / M cache read, $8 / M cache write; fitted exactly to the dry runs' run.json costs)."""
import json, os, re, shlex, sys

G = "/home/user/gtv"
PRICE = {"input": 4e-6, "output": 20e-6, "cache_read": 0.2e-6, "cache_write": 8e-6}
CMD_VOID = [r"\bcurl\b", r"\bwget\b", r"\bpip3?\s+install", r"\bapt(-get)?\b", r"\bgit\b", r"\bnpm\b", r"\bssh\b",
            r"\bnc\b", r"\blocate\b", r"\bfind\s+/(\s|$)", r"\bfind\s+/home", r"\bfind\s+/root", r"grep\s+-[a-zA-Z]*r[a-zA-Z]*\s+.*\s/(\s|$)",
            r"getkey", r"infisical", r"(^|[\s;&|(])gh\s", r"(^|[\s;&|(])claude\s", r"http[s]?://",
            r"-samefile\b", r"-inum\b", r"-links\b", r"\bmount\b", r"\bumount\b", r"\bnsenter\b", r"\bunshare\b",
            r"\bsudo\b", r"\bchroot\b", r"/proc/\d+/", r"/proc/[0-9]*/?root"]
SEARCH = re.compile(r"(^|[\s;&|(])(find|du|tree|locate|rg|ag)\b|(^|[\s;&|(])ls\s+[^;&|]*-[a-zA-Z]*R|grep\s+-[a-zA-Z]*[rR]")
OK_TOOLS = {"Bash", "Read", "Write", "Edit", "Glob", "Grep"}
SYSTEM_OK = ("/usr/", "/bin/", "/lib", "/etc/", "/dev/null", "/dev/std", "/dev/fd", "/proc/self", "/opt/node",
             "/usr/share/sounds", f"{G}/tools/venv", f"{G}/tools/kit", "/home/user/gtr/eval/venv")
CODE_WARN = (f"{G}/loop/tools",)
ABS_RX = re.compile(r"(?<![A-Za-z0-9_.\-~$}])(~?/[A-Za-z0-9_.\-/]+)")
REL_RX = re.compile(r"(?:^|(?<=[\s'\"=(,;:<>|&`]))((?:\.\.?/)+[A-Za-z0-9_.\-/]*|\.\.(?=$|[\s'\";|&)]))")
UNIT_RX = re.compile(r"^(u\d{3}(\.r\d+)?|tuning\.u\d{3}|w2)(/|$)")


def under(p, root):
    return p == root or p.startswith(root.rstrip("/") + "/")


def transcript_of(pack):
    m = os.path.join(pack, "run.meta.json")
    if os.path.exists(m):
        t = json.load(open(m)).get("transcript")
        if t and os.path.exists(t):
            return t
    slug = pack.replace("/", "-").replace(".", "-")
    d = os.path.expanduser(f"~/.claude/projects/{slug}")
    if os.path.isdir(d):
        js = sorted((os.path.join(d, f) for f in os.listdir(d) if f.endswith(".jsonl")), key=os.path.getmtime)
        if js:
            return js[-1]
    return None


def calls(tr):
    out = []
    for line in open(tr):
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        m = d.get("message")
        if d.get("type") == "assistant" and isinstance(m, dict) and isinstance(m.get("content"), list):
            for x in m["content"]:
                if isinstance(x, dict) and x.get("type") == "tool_use":
                    out.append({"t": d.get("timestamp"), "name": x["name"], "input": x.get("input", {}),
                                "cwd": d.get("cwd")})
    return out


def usage(tr):
    seen, tot, cost = set(), {"input": 0, "output": 0, "cache_read": 0, "cache_write": 0}, None
    t0 = t1 = None
    for line in open(tr):
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        ts = d.get("timestamp")
        if ts:
            t0 = t0 or ts; t1 = ts
        if d.get("type") == "cost-state":
            cost = d.get("totalCostUSD", cost)
        m = d.get("message")
        if d.get("type") == "assistant" and isinstance(m, dict) and m.get("usage"):
            k = m.get("id") or d.get("requestId")
            if k in seen:
                continue
            seen.add(k); u = m["usage"]
            tot["input"] += u.get("input_tokens", 0) or 0; tot["output"] += u.get("output_tokens", 0) or 0
            tot["cache_read"] += u.get("cache_read_input_tokens", 0) or 0
            tot["cache_write"] += u.get("cache_creation_input_tokens", 0) or 0
    est = round(sum(tot[k] * PRICE[k] for k in PRICE), 4)
    return {"tokens": tot, "cost_usd_list": cost if cost is not None else est, "cost_from": "transcript" if cost is not None
            else "tokens x list price", "cost_est_from_tokens": est, "first": t0, "last": t1}


def segments(cmd):
    """Splits a shell command into simple commands (on ; & | and newlines); returns a list of strings."""
    out, cur, i, n = [], [], 0, len(cmd)
    while i < n:
        c = cmd[i]
        if c in ";|&\n":
            out.append("".join(cur)); cur = []
            while i < n and cmd[i] in ";|&\n":
                i += 1
            continue
        cur.append(c); i += 1
    out.append("".join(cur))
    return [s.strip() for s in out if s.strip()]


def cd_target(seg, cwd):
    try:
        t = shlex.split(seg)
    except ValueError:
        t = seg.split()
    if t and t[0] in ("cd", "pushd"):
        dst = t[1] if len(t) > 1 else "/root"
        if dst == "-":
            return None
        return os.path.normpath(os.path.join(cwd, os.path.expanduser(dst)))
    return None


def audit(pack, tr=None, work=None, state_off=False):
    pack = os.path.abspath(pack)
    work = os.path.abspath(work) if work else os.path.dirname(pack)
    tr = tr or transcript_of(pack)
    slug = pack.replace("/", "-").replace(".", "-")
    own_tmp = f"/tmp/claude-0/{slug}"
    own_tr = f"/root/.claude/projects/{slug}"
    if not tr or not os.path.exists(tr):
        return {"pack": pack, "work": work, "transcript": tr, "void": ["no transcript found"], "warn": [], "calls": 0,
                "reads": {"pictures": 0, "files": []}, "usage": {}}
    V, Wn, n, reads = [], [], 0, {"pictures": 0, "files": []}

    def judge(nm, p, how, write=False, search=False):
        p = os.path.normpath(os.path.expanduser(p))
        if under(p, pack):
            return
        if write:
            V.append(f"{nm} writes outside its pack ({how}): {p}"); return
        if under(p, work):
            rel = os.path.relpath(p, work)
            if rel == ".":
                if search:
                    Wn.append(f"{nm} searches its whole work folder ({how}): {p}")
                return
            if rel.split("/")[0] in ("tools", "inputs") or rel in ("state.json", "tab.json"):
                return
            if UNIT_RX.match(rel) or rel.startswith(("voided", "aborted")):
                (V if state_off else Wn).append(f"{nm} reads another unit's folder ({how}): {p}")
            else:
                Wn.append(f"{nm} in its work folder, outside its pack/tools/inputs ({how}): {p}")
            return
        if p.startswith(SYSTEM_OK) or p.startswith(own_tmp) or under(p, own_tr):
            if search and not p.startswith((own_tmp, own_tr)) and p.count("/") <= 2:
                V.append(f"{nm} searches a machine folder ({how}): {p}")
            return
        if any(under(p, c) for c in CODE_WARN):
            Wn.append(f"{nm} {'searches' if search else 'reads'} the loop's code ({how}): {p}")
            return
        if p.startswith(("/home", "/root")) or p in ("/", ""):
            V.append(f"{nm} touches {p} ({how}){' [search]' if search else ''}"); return
        if p.startswith("/tmp/"):
            Wn.append(f"{nm} uses /tmp outside its scratchpad ({how}): {p}"); return
        if len(p) > 4 and not p.startswith(("/dev/", "/proc/")):
            Wn.append(f"{nm} outside its folders ({how}): {p}")

    for c in calls(tr):
        n += 1
        nm, inp = c["name"], c["input"] if isinstance(c["input"], dict) else {}
        cwd = c.get("cwd") or pack
        if nm not in OK_TOOLS:
            V.append(f"tool {nm} used"); continue
        if nm in ("Read", "Write", "Edit"):
            p = str(inp.get("file_path", ""))
            p = p if p.startswith(("/", "~")) else os.path.join(cwd, p)
            if nm == "Read":
                rp = os.path.normpath(p)
                reads["files"].append(os.path.relpath(rp, pack) if under(rp, pack) else rp)
                if rp.lower().endswith((".png", ".jpg", ".jpeg")):
                    reads["pictures"] += 1
            judge(nm, p, "file_path", write=nm != "Read")
            continue
        if nm in ("Glob", "Grep"):
            base = str(inp.get("path") or cwd)
            base = base if base.startswith(("/", "~")) else os.path.join(cwd, base)
            pat = str(inp.get("pattern", "")) if nm == "Glob" else str(inp.get("glob", "") or "")
            if pat.startswith("/"):
                base = pat.split("*")[0].rsplit("/", 1)[0] or "/"
            elif "../" in pat or pat.startswith(".."):
                lead = re.match(r"((?:\.\./)+|\.\.$)", pat)
                base = os.path.join(base, lead.group(1) if lead else "..")
            judge(nm, base, "search base", search=True)
            continue
        # Bash
        cmd = str(inp.get("command", ""))
        for rx in CMD_VOID:
            if re.search(rx, cmd):
                V.append(f"command matches {rx}: {cmd[:160]}")
        if re.search(r"['\"]\s*\+\s*['\"]|['\"]/(home|root)[^'\"]*['\"]\s*[+%]|os\.path\.join\(\s*['\"]/(home|root)", cmd):
            Wn.append(f"a string-built path in: {cmd[:160]}")
        cur = os.path.normpath(cwd)
        for seg in segments(cmd):
            dst = cd_target(seg, cur)
            is_search = bool(SEARCH.search(seg))
            for m in ABS_RX.finditer(seg):
                p = m.group(1).rstrip("/.,;:") or "/"
                judge("Bash", p, seg[:100], search=is_search)
            for m in REL_RX.finditer(seg):
                judge("Bash", os.path.join(cur, m.group(1)), seg[:100], search=is_search)
            if is_search:
                try:
                    toks = shlex.split(seg)
                except ValueError:
                    toks = seg.split()
                if toks and toks[0] == "find" and (len(toks) == 1 or toks[1].startswith("-")):
                    judge("Bash", cur, seg[:100], search=True)
            if dst:
                judge("Bash", dst, "cd " + seg[:80])
                cur = dst
    return {"pack": pack, "work": work, "state_off": state_off, "transcript": tr, "calls": n, "void": sorted(set(V)),
            "warn": sorted(set(Wn)), "reads": reads, "usage": usage(tr)}


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("pack"); ap.add_argument("--transcript"); ap.add_argument("--json")
    ap.add_argument("--work"); ap.add_argument("--state-off", action="store_true")
    a = ap.parse_args()
    r = audit(a.pack, a.transcript, a.work, a.state_off)
    if a.json:
        json.dump(r, open(a.json, "w"), indent=1)
    print(json.dumps({k: r[k] for k in ("calls", "void", "warn")}, indent=1)[:3000])
    sys.exit(1 if r["void"] else 0)
