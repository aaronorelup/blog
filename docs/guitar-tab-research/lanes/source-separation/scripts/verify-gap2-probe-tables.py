"""verify-gapfill-source-separation (round 2, resumed 2026-11-12): recompute, from the per-thread records of the gap
round's probe files (samples/gap2-ort/probe_*_S4.json), the columns of its ONNX Runtime table that come from the
probe (threads seen at once, CPU s by the thread's allowed CPUs) and the sentences under it (when the single-CPU
threads ran, the CPU each last ran on, the probe's own CPU time).  Usage: python verify-gap2-probe-tables.py DIR OUT.json
"""
import json
import os
import sys
from collections import defaultdict

d = sys.argv[1]
out = {}
for name in sorted(os.listdir(d)):
    if not (name.startswith("probe_") and name.endswith(".json")):
        continue
    p = json.load(open(os.path.join(d, name)))
    wall = p["wall_s"]
    by_allowed = defaultdict(float)
    single = []
    for t in p["threads"]:
        allowed = list(t["allowed_seen"].keys())
        last_allowed = allowed[-1] if allowed else None
        by_allowed[last_allowed] += t["cpu_s_last"]
        if len(allowed) == 1 and allowed[0] in ("1", "2", "3"):
            single.append({
                "tid": t["tid"], "allowed": allowed[0], "samples_allowed": t["allowed_seen"][allowed[0]],
                "cpu_seen": t["cpu_seen"], "cpu_s": t["cpu_s_last"],
                "first_seen_s": t["first_seen_s"], "before_end_s": round(wall - t["last_seen_s"], 2),
            })
    out[name] = {
        "wall_s": wall, "samples": p["samples"], "interval_s": p["interval_s"],
        "max_threads_at_once": p["max_threads_at_once"], "threads_seen": p["threads_seen"],
        "probe_own_cpu_s": p["probe_own_cpu_s"],
        "cpu_s_by_allowed_recomputed": {k: round(v, 2) for k, v in sorted(by_allowed.items())},
        "cpu_s_by_allowed_stored": p["cpu_s_by_last_allowed_list"],
        "single_cpu_threads": single,
        "cpu2_plus_cpu3_s": round(sum(s["cpu_s"] for s in single if s["allowed"] in ("2", "3")), 2),
        "every_thread_allowed_only_0-1": all(list(t["allowed_seen"].keys()) == ["0-1"] for t in p["threads"]),
    }
print(json.dumps(out, indent=1))
with open(sys.argv[2], "w") as f:
    json.dump(out, f, indent=1)
