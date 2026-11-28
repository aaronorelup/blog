"""Watch the threads of one running process: CPU affinity mask and the CPU each thread last ran on.

Usage: python gap2_thread_affinity_monitor.py <cmdline substring> <out.json> [--timeout 900] [--every 0.05]
Waits for a process whose /proc/<pid>/cmdline contains the substring and does not contain "gtr-run" or this script's
name, then until it exits reads, every --every seconds, for each thread in /proc/<pid>/task/<tid>/:
  status -> Cpus_allowed_list (the affinity mask the kernel holds for that thread),
  stat   -> field 39 "processor" (CPU the thread last ran on) and fields 14 + 15 utime + stime (clock ticks).
Writes a summary: every thread id seen, its name, the masks and processors seen, its last CPU ticks; and the
process-level Cpus_allowed_list. Runs outside the timed command (it is not part of the gtr-run process tree).
"""
import json
import os
import sys
import time

sub, out = sys.argv[1], sys.argv[2]
timeout = float(sys.argv[sys.argv.index("--timeout") + 1]) if "--timeout" in sys.argv else 900.0
every = float(sys.argv[sys.argv.index("--every") + 1]) if "--every" in sys.argv else 0.05
me = os.path.basename(__file__)
t0 = time.time()
pid = None
while pid is None and time.time() - t0 < timeout:
    for p in os.listdir("/proc"):
        if not p.isdigit() or int(p) == os.getpid():
            continue
        try:
            cl = open(f"/proc/{p}/cmdline", "rb").read().replace(b"\0", b" ").decode(errors="replace")
        except OSError:
            continue
        if sub in cl and "gtr-run" not in cl and me not in cl:
            pid = int(p)
            break
    time.sleep(0.02)
if pid is None:
    json.dump({"error": "process not found", "substring": sub}, open(out, "w"))
    sys.exit(1)
found_at = time.time() - t0
threads, proc_mask, n_samples, max_threads = {}, set(), 0, 0
while os.path.exists(f"/proc/{pid}"):
    try:
        st = open(f"/proc/{pid}/status").read()
        for line in st.splitlines():
            if line.startswith("Cpus_allowed_list:"):
                proc_mask.add(line.split(":", 1)[1].strip())
        tids = os.listdir(f"/proc/{pid}/task")
    except OSError:
        break
    max_threads = max(max_threads, len(tids))
    for tid in tids:
        try:
            s = open(f"/proc/{pid}/task/{tid}/status").read()
            stat = open(f"/proc/{pid}/task/{tid}/stat").read()
        except OSError:
            continue
        mask = [l.split(":", 1)[1].strip() for l in s.splitlines() if l.startswith("Cpus_allowed_list:")][0]
        name = [l.split(":", 1)[1].strip() for l in s.splitlines() if l.startswith("Name:")][0]
        f = stat[stat.rindex(")") + 2:].split()
        # f[0] is field 3 (state); field n is f[n - 3]
        cpu, ticks = int(f[39 - 3]), int(f[14 - 3]) + int(f[15 - 3])
        d = threads.setdefault(tid, {"name": name, "masks": set(), "cpus_seen": set(), "ticks": 0})
        d["masks"].add(mask)
        if ticks > d["ticks"]:
            d["cpus_seen"].add(cpu)
        d["ticks"] = max(d["ticks"], ticks)
    n_samples += 1
    time.sleep(every)
res = {"pid": pid, "substring": sub, "found_after_s": round(found_at, 3), "watched_s": round(time.time() - t0 - found_at, 2),
       "samples": n_samples, "max_threads_at_once": max_threads, "process_masks": sorted(proc_mask),
       "n_threads_seen": len(threads),
       "threads": {tid: {"name": d["name"], "masks": sorted(d["masks"]), "cpus_seen_while_accumulating": sorted(d["cpus_seen"]),
                         "cpu_ticks": d["ticks"]} for tid, d in sorted(threads.items(), key=lambda kv: int(kv[0]))}}
masks = {}
for d in res["threads"].values():
    for m in d["masks"]:
        masks[m] = masks.get(m, 0) + 1
res["threads_per_mask"] = masks
res["cpus_used_by_threads_with_ticks"] = sorted({c for d in res["threads"].values() if d["cpu_ticks"] > 0
                                               for c in d["cpus_seen_while_accumulating"]})
json.dump(res, open(out, "w"), indent=1)
print(json.dumps({k: v for k, v in res.items() if k != "threads"}))
