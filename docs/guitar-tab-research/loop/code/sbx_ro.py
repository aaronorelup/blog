#!/usr/bin/env python3
"""sbx_ro.py "<ids of the mounts the namespace started with>"

Run by sandbox_run.sh inside a call's new mount namespace, last, before the capabilities are dropped. Every mount the
namespace inherited from the box (/, /opt/claude-code, /opt/env-runner, /dev, /mnt/..., found by its mount id) that is
still on top at its place, not hidden by a mount of the sandbox at it or above it, is remounted read-only (a bind
remount: this namespace only). So a call can write only where the sandbox put something of its own: its folder (or
its pack), its transcripts, the overlay over /root (a tmpfs above the real /root: what the CLI writes there is gone
when the call ends) and the tmpfs masks. Nothing it writes can run outside later (no change to the system's Python,
the CLI, the venvs, the loop's code, ~/.bashrc). proc, sysfs, devpts and the like are left alone. Prints one line."""
import subprocess, sys

init = set(sys.argv[1].split())
SKIP = {"proc", "sysfs", "devpts", "cgroup", "cgroup2", "mqueue", "securityfs", "debugfs", "tracefs", "bpf", "pstore",
        "fusectl", "configfs", "hugetlbfs", "binfmt_misc", "autofs", "efivarfs", "nsfs", "rpc_pipefs"}


def unescape(p):
    return p.replace("\\040", " ").replace("\\011", "\t").replace("\\012", "\n").replace("\\134", "\\")


rows = []
for line in open("/proc/self/mountinfo"):
    f = line.split()
    sep = f.index("-")
    rows.append((f[0], unescape(f[4]), f[sep + 1], f[5].split(",")))
ours = [mp for mid, mp, _, _ in rows if mid not in init]
made, left, already = [], [], 0
for mid, mp, fstype, opts in rows:
    if mid not in init or fstype in SKIP:
        continue
    if any(q == mp or (q != "/" and mp.startswith(q.rstrip("/") + "/")) for q in ours):
        continue                                   # a mask or a bind of the sandbox is at it or above it
    if "ro" in opts:
        already += 1; continue
    r = subprocess.run(["mount", "-o", "remount,bind,ro", mp], capture_output=True, text=True)
    (made if r.returncode == 0 else left).append(mp)
if left:
    print(f"sbx_ro: could not make read-only: {' '.join(left)}", file=sys.stderr)
sys.exit(1 if left else 0)
