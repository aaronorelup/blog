#!/usr/bin/env python3
"""gap2_box_sampler.py: while a timed job runs, record how busy the whole box is and how much of that is the job
(gap round 2).

Usage:  gap2_box_sampler.py <out.json> <pattern> [--interval S] [--max-seconds N]

Every S seconds (default 2) it reads /proc/stat (busy and total jiffies per CPU), /proc/loadavg, and the utime +
stime of every process whose command line contains <pattern> together with their threads' CPU time (the job), so
"busy CPU seconds of the box" minus "CPU seconds of the job" = CPU seconds used by everything else in that interval.
It starts recording when such a process first appears and stops when none is left (or after --max-seconds).
"""
import json
import os
import sys
import time

TCK = os.sysconf("SC_CLK_TCK")


def cpu_times():
    out = {}
    with open("/proc/stat") as f:
        for line in f:
            if line.startswith("cpu"):
                p = line.split()
                vals = list(map(int, p[1:]))
                idle = vals[3] + vals[4]
                out[p[0]] = (sum(vals) - idle, sum(vals))
    return out


def job_ticks(pattern):
    total, pids = 0, []
    for d in os.listdir("/proc"):
        if not d.isdigit():
            continue
        try:
            with open(f"/proc/{d}/cmdline", "rb") as f:
                cmd = f.read().replace(b"\0", b" ").decode(errors="replace")
            if pattern not in cmd or "gap2_box_sampler" in cmd:
                continue
            with open(f"/proc/{d}/stat") as f:
                st = f.read().rsplit(")", 1)[1].split()
            total += int(st[11]) + int(st[12])
            pids.append(int(d))
        except OSError:
            continue
    return total, pids


def main():
    out_path, pattern = sys.argv[1], sys.argv[2]
    interval = float(sys.argv[sys.argv.index("--interval") + 1]) if "--interval" in sys.argv else 2.0
    max_s = float(sys.argv[sys.argv.index("--max-seconds") + 1]) if "--max-seconds" in sys.argv else 3600
    t0 = time.time()
    while not job_ticks(pattern)[1]:
        if time.time() - t0 > max_s:
            sys.exit("no job found")
        time.sleep(0.2)
    samples = []
    prev_c, (prev_j, _) = cpu_times(), job_ticks(pattern)
    t_start = time.time()
    while True:
        time.sleep(interval)
        c = cpu_times()
        j, pids = job_ticks(pattern)
        with open("/proc/loadavg") as f:
            load1 = float(f.read().split()[0])
        busy = {k: round((c[k][0] - prev_c[k][0]) / max(1, c[k][1] - prev_c[k][1]), 3) for k in c if k != "cpu"}
        box_busy_s = (c["cpu"][0] - prev_c["cpu"][0]) / TCK
        job_s = max(0, j - prev_j) / TCK
        samples.append({"t": round(time.time() - t_start, 1), "load1": load1, "busy_per_cpu": busy,
                        "box_busy_cpu_s": round(box_busy_s, 2), "job_cpu_s": round(job_s, 2),
                        "other_cpu_s": round(box_busy_s - job_s, 2)})
        prev_c, prev_j = c, j
        if not pids or time.time() - t_start > max_s:
            break
    tot = lambda k: round(sum(s[k] for s in samples), 1)
    summary = {"pattern": pattern, "interval_s": interval, "seconds": round(time.time() - t_start, 1),
               "box_busy_cpu_s": tot("box_busy_cpu_s"), "job_cpu_s": tot("job_cpu_s"),
               "other_cpu_s": tot("other_cpu_s"),
               "mean_load1": round(sum(s["load1"] for s in samples) / max(1, len(samples)), 2),
               "samples": samples}
    with open(out_path, "w") as f:
        json.dump(summary, f, indent=1)
    sys.stderr.write(f"[box-sampler] {summary['seconds']}s box_busy={summary['box_busy_cpu_s']} "
                     f"job={summary['job_cpu_s']} other={summary['other_cpu_s']} mean_load1={summary['mean_load1']}\n")


if __name__ == "__main__":
    main()
