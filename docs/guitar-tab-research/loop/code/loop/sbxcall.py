#!/usr/bin/env python3
"""sbxcall.py: one blind call, run the only way the loop runs one: through sandbox_run.sh (a private mount and pid
namespace in which every answer-bearing place is an empty tmpfs; only the call's work folder and the loop's code are
mounted back), in its own session and process group (setsid), with its pid and pgid in a pid file, a hard time limit,
a scrubbed environment (no tokens, keys, e-mail or outside paths), the work folder read-only except the call's own
folder, and the loop's code, the venvs and the scorer read-only. Used by driver.py and w2.py. sandbox_run.sh also
gives the call its own network namespace whose only way out is net_filter.py (model requests to the API host only)
and keeps a second hard limit inside the call (SBX_HARD_S = this one + 60 s), so a call outlives a dead driver by
at most that.

kill_group(pgid) ends a call: SIGTERM to the group (claude stops; blind_run.sh, the namespace's init, still writes
run.meta.json), then SIGKILL after a grace; when the namespace's init dies the kernel kills everything left inside it,
so nothing the writer started survives. kill_leftover(pidfile) does the same for a call a dead driver left running."""
import json, os, signal, subprocess, time

G = "/home/user/gtv"
SANDBOX = os.path.join(G, "loop", "tools", "sandbox_run.sh")
BLIND_RUN = os.path.join(G, "loop", "tools", "blind_run.sh")
TRANSCRIPTS = os.path.join(G, "transcripts")
RO = [os.path.join(G, "loop", "tools"), os.path.join(G, "tools"), "/home/user/gtr"]
ENV_DROP = {"GH_TOKEN", "GITHUB_TOKEN", "CLAUDE_CODE_USER_EMAIL", "CLAUDE_ADDITIONAL_DIRECTORIES",
            "CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD", "CLAUDE_CODE_CHILD_NOTES_DIR", "OLDPWD", "PWD",
            "CLAUDE_CODE_MESSAGING_TOKEN", "CLAUDE_CODE_MESSAGING_SOCKET", "DOCUMENTS_MCP_SCRATCH_ROOT",
            "CLAUDE_CODE_DIAGNOSTICS_FILE", "CLAUDE_AFTER_LAST_COMPACT", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_PID",
            "TRACEPARENT", "CLAUDE_CODE_ACCOUNT_UUID", "CLAUDE_CODE_ORGANIZATION_UUID", "CLAUDE_CODE_BASE_REF",
            "SBX_TRANSCRIPTS", "SBX_RW", "SBX_RO", "CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_REMOTE_SESSION_ID",
            "SESSION_INGRESS_URL", "CLAUDE_SESSION_INGRESS_TOKEN_FILE", "SBX_TELEMETRY_SOCKET", "SBX_HARD_S",
            "SBX_CLAUDE_LIMIT_S", "SBX_NETLOG", "CLAUDE_CODE_POST_FOR_SESSION_INGRESS_V2", "CLAUDE_CODE_USE_CCR_V2",
            "CLAUDE_CODE_CONTAINER_ID", "CLAUDE_CODE_WORKER_EPOCH"}
# sandbox_run.sh drops these too (and every proxy variable) inside the call; SBX_NET_* (the filter's mode and hosts)
# can only be set by hand, never through the driver
ENV_DROP_PREFIX = ("GIT_", "AWS_", "CLOUDSDK_", "GTR_", "INFISICAL", "CLAUDE_CODE_REMOTE", "CCR_", "SBX_NET",
                   "CLAUDE_CODE_MESSAGING")
HARD_MARGIN_S = 60       # the call's own hard limit (sandbox_run.sh SBX_HARD_S) = the driver's + this
MARKERS = ("sandbox_run.sh", "blind_run.sh", "unshare", "claude", "setpriv", "sleep", "net_filter.py", "net_bridge.py",
           "timeout")


def scrub_env():
    return {k: v for k, v in os.environ.items() if k not in ENV_DROP and not k.startswith(ENV_DROP_PREFIX)}


def group_members(pgid):
    out = []
    for d in os.listdir("/proc"):
        if not d.isdigit():
            continue
        try:
            st = open(f"/proc/{d}/stat").read()
            f = st[st.rindex(")") + 2:].split()
            if int(f[2]) == pgid:
                cmd = open(f"/proc/{d}/cmdline", "rb").read().replace(b"\0", b" ").decode(errors="replace")
                out.append((int(d), f[0], cmd))
        except (OSError, ValueError, IndexError):
            continue
    return out


def alive(pgid):
    return any(s != "Z" for _, s, _ in group_members(pgid))


def kill_group(pgid, proc=None, grace=30, log=None):
    """SIGTERM, then SIGKILL; True when no live process of the group is left."""
    for sig, wait in ((signal.SIGTERM, grace), (signal.SIGKILL, 15)):
        try:
            os.killpg(pgid, sig)
        except ProcessLookupError:
            return True
        except PermissionError:
            pass
        t = time.time()
        while time.time() - t < wait:
            if proc is not None:
                proc.poll()
            if not alive(pgid):
                if log:
                    log(f"process group {pgid} ended after {'SIGTERM' if sig == signal.SIGTERM else 'SIGKILL'}")
                return True
            time.sleep(0.5)
    return not alive(pgid)


def kill_leftover(pidfile, log=None):
    """A call a dead driver left: kill its group if it is still that call (checked by command line). Returns the pid
    record (or None) and whether a live group was killed."""
    try:
        rec = json.load(open(pidfile))
    except (OSError, ValueError):
        return None, False
    pgid = int(rec.get("pgid", 0) or 0)
    killed = False
    if pgid > 1:
        mem = [m for m in group_members(pgid) if m[1] != "Z"]
        if mem and any(k in cmd for _, _, cmd in mem for k in MARKERS):
            if log:
                log(f"a call left by an earlier driver is still running (pgid {pgid}, {len(mem)} processes): killing it")
            kill_group(pgid, log=log)
            killed = True
    return rec, killed


def run(work, pack, prompt_file, label, effort, td, hard_s, pidfile, log_path, extra_rec=None, fake_sleep=None,
        on_start=None, rw=None, ro_extra=()):
    """Runs one sandboxed call; waits for it (polling, so signals reach the caller); returns a dict with rc, wall_s,
    timed_out, pgid. A Stop raised by the caller's signal handler propagates after the group is killed."""
    os.makedirs(td, exist_ok=True)
    env = scrub_env()
    rw = [os.path.relpath(pack, work)] if rw is None else rw     # [] = the whole work folder stays writable
    if rw:
        env["SBX_RW"] = " ".join(rw)
    env["SBX_RO"] = " ".join(p for p in list(RO) + list(ro_extra) if os.path.exists(p))
    # a limit kept inside the call itself, so it stops even when this driver dies (SIGKILL, a lost box): blind_run.sh
    # stops claude at it and sandbox_run.sh ends the namespace 45 s later
    env["SBX_HARD_S"] = str(int(hard_s + HARD_MARGIN_S))
    if fake_sleep is not None:
        cmd = [SANDBOX, work, td, "sleep", str(fake_sleep)]
    else:
        cmd = [SANDBOX, work, td, BLIND_RUN, pack, prompt_file, label, effort]
    t0 = time.time()
    with open(log_path, "a") as fh:
        proc = subprocess.Popen(cmd, stdout=fh, stderr=subprocess.STDOUT, env=env, cwd=work, start_new_session=True,
                                stdin=subprocess.DEVNULL)
    pgid = proc.pid          # start_new_session: the child is its own session and group leader
    rec = {"pid": proc.pid, "pgid": pgid, "started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(t0)),
           "work": work, "pack": pack, "label": label, "td": td, "hard_s": hard_s}
    rec.update(extra_rec or {})
    tmp = pidfile + ".tmp"
    json.dump(rec, open(tmp, "w")); os.replace(tmp, pidfile)
    if on_start:
        on_start(proc, pgid)
    timed_out = False
    try:
        while True:
            try:
                rc = proc.wait(timeout=2)
                break
            except subprocess.TimeoutExpired:
                if time.time() - t0 > hard_s:
                    timed_out = True
                    kill_group(pgid, proc)
                    try:
                        rc = proc.wait(timeout=30)
                    except subprocess.TimeoutExpired:
                        rc = -9
                    break
    except BaseException:
        old = signal.signal(signal.SIGTERM, signal.SIG_IGN)
        try:
            kill_group(pgid, proc)
            try:
                proc.wait(timeout=30)
            except subprocess.TimeoutExpired:
                pass
        finally:
            signal.signal(signal.SIGTERM, old)
        raise
    # the group leader is gone; make sure nothing of the group is left
    if alive(pgid):
        kill_group(pgid, proc, grace=10)
    try:
        os.remove(pidfile)
    except OSError:
        pass
    return {"rc": rc, "wall_s": round(time.time() - t0, 1), "timed_out": timed_out, "pgid": pgid,
            "left_alive": alive(pgid)}


def find_transcript(td, sid=None):
    """The call's transcript under its transcripts folder (td/<slug>/<session id>.jsonl)."""
    best = None
    for dp, _, fs in os.walk(td):
        for f in fs:
            if f.endswith(".jsonl") and (sid is None or f.startswith(sid)):
                p = os.path.join(dp, f)
                if best is None or os.path.getmtime(p) > os.path.getmtime(best):
                    best = p
    return best
