"""Gap round 2, item A8: where ONNX Runtime puts its intra-op threads when the process is limited to 2 CPUs.

usage: taskset -c 0,1 python -I ort_affinity_probe.py <model.onnx>
Two sessions on the same model, each run repeatedly for about 3 s on random input while a sampler reads
/proc/self/task/*/status (Cpus_allowed_list) and /proc/self/task/*/stat (field 39, last CPU) every 50 ms:
  A: SessionOptions with only graph_optimization_level = ORT_ENABLE_ALL (what rmvpe-onnx 0.2.3 sets);
  B: the same plus intra_op_num_threads = 2.
Prints one JSON object per session. A behaviour probe, not a timing.
"""
import json
import os
import sys
import threading
import time

import numpy as np
import onnxruntime as ort

model = sys.argv[1]
print(json.dumps({"onnxruntime": ort.__version__, "process_affinity": sorted(os.sched_getaffinity(0)),
                  "os_cpu_count": os.cpu_count()}), flush=True)


def probe(label, opts):
    before = set(os.listdir("/proc/self/task"))
    seen = {}
    stop = threading.Event()

    def sample():
        while not stop.is_set():
            for tid in os.listdir("/proc/self/task"):
                if tid in before:
                    continue
                try:
                    status = open(f"/proc/self/task/{tid}/status").read()
                    stat = open(f"/proc/self/task/{tid}/stat").read()
                except OSError:
                    continue
                allowed = [l.split(":", 1)[1].strip() for l in status.splitlines() if l.startswith("Cpus_allowed_list")][0]
                cpu = int(stat[stat.rindex(")") + 2:].split()[36])
                rec = seen.setdefault(tid, {"allowed": set(), "ran_on": set()})
                rec["allowed"].add(allowed)
                rec["ran_on"].add(cpu)
            time.sleep(0.05)

    th = threading.Thread(target=sample, daemon=True)
    th.start()
    sess = ort.InferenceSession(model, sess_options=opts, providers=["CPUExecutionProvider"])
    inp = sess.get_inputs()[0]
    shape = [d if isinstance(d, int) else 1 for d in inp.shape]
    x = np.random.default_rng(0).standard_normal(shape).astype(np.float32)
    n, t0 = 0, time.perf_counter()
    while time.perf_counter() - t0 < 3.0:
        sess.run(None, {inp.name: x})
        n += 1
    stop.set()
    th.join()
    del sess
    print(json.dumps({"session": label, "input": [inp.name, shape], "runs": n,
                      "new_threads": len(seen),
                      "threads": [{"cpus_allowed_list": sorted(v["allowed"]), "ran_on_cpus": sorted(v["ran_on"])}
                                  for _, v in sorted(seen.items(), key=lambda kv: int(kv[0]))]}), flush=True)


a = ort.SessionOptions()
a.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
probe("A: graph_optimization_level only", a)
b = ort.SessionOptions()
b.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
b.intra_op_num_threads = 2
probe("B: plus intra_op_num_threads=2", b)
