#!/usr/bin/env python3
"""gap2_thread_probe.py: run a command and sample the threads of its process tree from /proc (gap round 2).

Usage:  gap2_thread_probe.py <summary.json> [--interval S] -- <command> [args...]

Every S seconds (default 0.25) it reads, for every thread of the command and of its child processes:
  /proc/<pid>/task/<tid>/status   Cpus_allowed_list: the CPUs the thread is allowed to run on
  /proc/<pid>/task/<tid>/stat     field 39 'processor' (the CPU it last ran on), fields 14 and 15 utime + stime
It writes a JSON summary: for each thread its name, every Cpus_allowed_list value seen (with sample counts), how
often it was seen on each CPU, and its CPU seconds at the last sample; the most threads seen at once; CPU seconds
summed by allowed-CPU list; the probe's own CPU affinity and its own CPU time (which the caller's rusage includes).
The exit code is the command's. Written by gapfill-source-separation to check where ONNX Runtime threads run.
"""
import json
import os
import resource
import subprocess
import sys
import time


def children_map():
    m = {}
    for d in os.listdir("/proc"):
        if not d.isdigit():
            continue
        try:
            with open(f"/proc/{d}/stat") as f:
                s = f.read()
            ppid = int(s.rsplit(")", 1)[1].split()[1])
            m.setdefault(ppid, []).append(int(d))
        except (OSError, ValueError, IndexError):
            pass
    return m


def tree(root):
    m, out, i = children_map(), [root], 0
    while i < len(out):
        out.extend(m.get(out[i], []))
        i += 1
    return out


def main():
    argv = sys.argv[1:]
    if "--" not in argv:
        sys.stderr.write(__doc__)
        sys.exit(2)
    cut = argv.index("--")
    opts, cmd = argv[:cut], argv[cut + 1:]
    out_path = opts[0]
    interval = float(opts[opts.index("--interval") + 1]) if "--interval" in opts else 0.25
    tck = os.sysconf("SC_CLK_TCK")
    threads, max_threads, n_samples = {}, 0, 0
    t0 = time.time()
    p = subprocess.Popen(cmd)
    while True:
        rc = p.poll()
        n = 0
        for pid in tree(p.pid):
            try:
                tids = os.listdir(f"/proc/{pid}/task")
            except OSError:
                continue
            for tid in tids:
                base = f"/proc/{pid}/task/{tid}"
                try:
                    with open(base + "/stat") as f:
                        st = f.read()
                    with open(base + "/status") as f:
                        status = f.read()
                except OSError:
                    continue
                comm = st[st.index("(") + 1:st.rindex(")")]
                fields = st.rsplit(")", 1)[1].split()  # fields[0] is stat field 3 (state)
                utime, stime, cpu = int(fields[11]), int(fields[12]), int(fields[36])
                allowed = next((l.split(":", 1)[1].strip() for l in status.splitlines()
                                if l.startswith("Cpus_allowed_list")), "?")
                k = f"{pid}/{tid}"
                t = threads.setdefault(k, {"pid": pid, "tid": int(tid), "comm": comm, "allowed_seen": {},
                                           "cpu_seen": {}, "cpu_s_last": 0.0,
                                           "first_seen_s": round(time.time() - t0, 2)})
                t["comm"] = comm
                t["allowed_seen"][allowed] = t["allowed_seen"].get(allowed, 0) + 1
                t["cpu_seen"][str(cpu)] = t["cpu_seen"].get(str(cpu), 0) + 1
                t["cpu_s_last"] = round((utime + stime) / tck, 2)
                t["last_seen_s"] = round(time.time() - t0, 2)
                n += 1
        max_threads = max(max_threads, n)
        n_samples += 1
        if rc is not None:
            break
        time.sleep(interval)
    wall = time.time() - t0
    by_allowed = {}
    for t in threads.values():
        last_allowed = list(t["allowed_seen"])[-1]
        by_allowed[last_allowed] = round(by_allowed.get(last_allowed, 0.0) + t["cpu_s_last"], 2)
    ru = resource.getrusage(resource.RUSAGE_SELF)
    summary = {
        "cmd": cmd, "exit_code": rc, "wall_s": round(wall, 2), "interval_s": interval, "samples": n_samples,
        "probe_affinity": sorted(os.sched_getaffinity(0)),
        "probe_own_cpu_s": round(ru.ru_utime + ru.ru_stime, 2),
        "max_threads_at_once": max_threads, "threads_seen": len(threads),
        "cpu_s_by_last_allowed_list": by_allowed,
        "threads": sorted(threads.values(), key=lambda t: (t["pid"], t["tid"])),
    }
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(summary, f, indent=1)
    sys.stderr.write(f"[thread-probe] exit={rc} wall={wall:.2f}s max_threads={max_threads} "
                     f"cpu_s_by_allowed={by_allowed} probe_cpu={summary['probe_own_cpu_s']}s -> {out_path}\n")
    sys.exit(rc)


if __name__ == "__main__":
    main()
