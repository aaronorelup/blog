"""Gap round 2, item A8: Basic Pitch 0.4.0 configuration 3 of run r0234 (predict() with Model(nmp.onnx), ONNX Runtime
1.23.2, defaults, the 16 clip files) again, with a sampler thread that reads /proc/self/task/*/status
(Cpus_allowed_list) and /proc/self/task/*/stat (field 39, the CPU the thread last ran on) every 50 ms, to record
whether ONNX Runtime's threads stay on the 2 cores gtr-run pins the process to.

usage: python run under gtr-run: bp_onnx_affinity.py <outdir>
Writes <outdir>/<clip>.mid and .notes.csv (as run_basic_pitch_py.py does) and <outdir>/affinity.json.
"""
import json
import os
import sys
import threading
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from a2n_common import CLIPS  # noqa: E402

outdir = sys.argv[1]
os.makedirs(outdir, exist_ok=True)
proc_affinity_at_start = sorted(os.sched_getaffinity(0))
threads = {}  # tid -> {"comm", "allowed": set(str), "ran_on": set(int), "first_seen_s"}
stop = threading.Event()
t_start = time.perf_counter()
n_samples = [0]


def sample():
    for tid in os.listdir("/proc/self/task"):
        try:
            status = open(f"/proc/self/task/{tid}/status").read()
            stat = open(f"/proc/self/task/{tid}/stat").read()
        except OSError:
            continue
        allowed = [l.split(":", 1)[1].strip() for l in status.splitlines() if l.startswith("Cpus_allowed_list")][0]
        comm = stat[stat.index("(") + 1: stat.rindex(")")]
        fields = stat[stat.rindex(")") + 2:].split()
        cpu = int(fields[36])  # field 39 of /proc/<pid>/task/<tid>/stat ("processor"); fields[] starts at field 3
        rec = threads.setdefault(tid, {"comm": comm, "allowed": set(), "ran_on": set(),
                                       "first_seen_s": round(time.perf_counter() - t_start, 3)})
        rec["allowed"].add(allowed)
        rec["ran_on"].add(cpu)
    n_samples[0] += 1


def sampler():
    while not stop.is_set():
        sample()
        time.sleep(0.05)


th = threading.Thread(target=sampler, daemon=True)
th.start()

import onnxruntime as ort  # noqa: E402
from basic_pitch import build_icassp_2022_model_path, FilenameSuffix  # noqa: E402
from basic_pitch.inference import Model, predict, save_note_events  # noqa: E402

model_path = build_icassp_2022_model_path(FilenameSuffix["onnx"])
t0 = time.perf_counter()
model = Model(model_path)
t_load = time.perf_counter() - t0
rec = {"onnxruntime": ort.__version__, "model_path": str(model_path), "model_type": str(model.model_type),
       "process_affinity_at_start": proc_affinity_at_start, "model_load_s": round(t_load, 3), "clips": {}}
R0234_CLIPS = ["S1", "S2n", "S2s", "S3", "S4", "S4guitar", "S4lead", "S5capo2", "S5dropd", "S6taps", "S7flat30",
               "R1a", "R1b", "R1c", "R2", "R3a"]  # the 16 inputs of r0234, in its order
for clip in R0234_CLIPS:
    path = CLIPS[clip]
    t1 = time.perf_counter()
    model_output, midi_data, note_events = predict(path, model)
    dt = time.perf_counter() - t1
    midi_data.write(os.path.join(outdir, f"{clip}.mid"))
    save_note_events(note_events, os.path.join(outdir, f"{clip}.notes.csv"))
    rec["clips"][clip] = {"predict_s": round(dt, 3), "n_notes": len(note_events)}
    print(clip, rec["clips"][clip], flush=True)
stop.set()
th.join()
sample()
rec["process_affinity_at_end"] = sorted(os.sched_getaffinity(0))
rec["n_samples"] = n_samples[0]
rec["threads"] = {tid: {"comm": v["comm"], "first_seen_s": v["first_seen_s"], "cpus_allowed_list": sorted(v["allowed"]),
                        "ran_on_cpus": sorted(v["ran_on"])} for tid, v in sorted(threads.items(), key=lambda kv: int(kv[0]))}
rec["all_cpus_any_thread_ran_on"] = sorted({c for v in threads.values() for c in v["ran_on"]})
rec["all_cpus_allowed_lists_seen"] = sorted({a for v in threads.values() for a in v["allowed"]})
with open(os.path.join(outdir, "affinity.json"), "w") as f:
    json.dump(rec, f, indent=1)
print("threads seen", len(threads), "cpus any thread ran on", rec["all_cpus_any_thread_ran_on"],
      "allowed lists seen", rec["all_cpus_allowed_lists_seen"], flush=True)
