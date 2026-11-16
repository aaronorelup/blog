#!/usr/bin/env python3
"""verify-gap2-thread-probe.py (verify-gapfill-source-separation, round 2).

Written separately from scripts/gap2_thread_probe.py to check its findings a second way.

Usage: python3 -I verify-gap2-thread-probe.py OUT.json -- command [args...]

Starts the command, then every 0.5 s reads, for every thread of the command's process tree:
  /proc/<pid>/task/<tid>/status  -> Cpus_allowed_list (the CPUs the thread may run on)
  /proc/<pid>/task/<tid>/stat    -> utime + stime (fields 14 and 15, clock ticks) and field 39 (CPU last run on)
Writes per thread: every allowed list seen (with sample counts), every CPU seen, and the last CPU time read;
and a summary: CPU seconds summed by each thread's last allowed list, and the most threads seen at once.
"""
import json
import os
import subprocess
import sys
import time

HZ = os.sysconf("SC_CLK_TCK")


def children_of(pid):
    out = []
    try:
        for tid in os.listdir(f"/proc/{pid}/task"):
            try:
                with open(f"/proc/{pid}/task/{tid}/children") as f:
                    out += [int(x) for x in f.read().split()]
            except OSError:
                pass
    except OSError:
        pass
    return out


def tree(root):
    seen, todo = [], [root]
    while todo:
        p = todo.pop()
        if p in seen:
            continue
        seen.append(p)
        todo += children_of(p)
    return seen


def read_thread(pid, tid):
    base = f"/proc/{pid}/task/{tid}"
    allowed = None
    with open(base + "/status") as f:
        for line in f:
            if line.startswith("Cpus_allowed_list:"):
                allowed = line.split(":", 1)[1].strip()
            elif line.startswith("Name:"):
                name = line.split(":", 1)[1].strip()
    with open(base + "/stat") as f:
        s = f.read()
    rest = s[s.rindex(")") + 2:].split()
    # rest[0] is field 3 (state); field n is rest[n - 3]
    cpu_ticks = int(rest[14 - 3]) + int(rest[15 - 3])
    last_cpu = int(rest[39 - 3])
    return name, allowed, cpu_ticks / HZ, last_cpu


def main():
    out_json = sys.argv[1]
    assert sys.argv[2] == "--"
    cmd = sys.argv[3:]
    t0 = time.time()
    proc = subprocess.Popen(cmd)
    threads = {}
    max_at_once = 0
    n_samples = 0
    while proc.poll() is None:
        n_now = 0
        for pid in tree(proc.pid):
            try:
                tids = os.listdir(f"/proc/{pid}/task")
            except OSError:
                continue
            for tid in tids:
                try:
                    name, allowed, cpu_s, last_cpu = read_thread(pid, tid)
                except (OSError, ValueError, IndexError):
                    continue
                n_now += 1
                key = f"{pid}/{tid}"
                t = threads.setdefault(key, {"pid": int(pid), "tid": int(tid), "name": name, "allowed": {},
                                             "cpus": {}, "first_s": round(time.time() - t0, 2)})
                t["allowed"][allowed] = t["allowed"].get(allowed, 0) + 1
                t["cpus"][str(last_cpu)] = t["cpus"].get(str(last_cpu), 0) + 1
                t["cpu_s"] = round(cpu_s, 2)
                t["last_allowed"] = allowed
                t["last_s"] = round(time.time() - t0, 2)
        max_at_once = max(max_at_once, n_now)
        n_samples += 1
        time.sleep(0.5)
    wall = time.time() - t0
    by_allowed = {}
    for t in threads.values():
        by_allowed[t["last_allowed"]] = round(by_allowed.get(t["last_allowed"], 0) + t.get("cpu_s", 0), 2)
    res = {"cmd": cmd, "exit_code": proc.returncode, "wall_s": round(wall, 2), "interval_s": 0.5,
           "samples": n_samples, "probe_affinity": sorted(os.sched_getaffinity(0)),
           "probe_own_cpu_s": round(sum(os.times()[:2]), 2), "max_threads_at_once": max_at_once,
           "threads_seen": len(threads), "cpu_s_by_last_allowed_list": by_allowed,
           "threads": sorted(threads.values(), key=lambda t: (t["pid"], t["tid"]))}
    with open(out_json, "w") as f:
        json.dump(res, f, indent=1)
    print(json.dumps({k: v for k, v in res.items() if k != "threads"}), flush=True)
    sys.exit(proc.returncode)


if __name__ == "__main__":
    main()
