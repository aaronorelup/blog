"""verify-gapfill-audio-to-notes (gap round 1 check): corrections to tools.json, each one a string replacement that must
match exactly once in its field. Keeps the file's formatting (json.dumps(indent=1, ensure_ascii=False), no trailing
newline).

usage: python fix_tools_json.py <tools.json>
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path))
by = {t["name"]: t for t in d["tools"]}


def rep(name, field, old, new, sub=None):
    t = by[name]
    path = [field] + (sub.split("/") if sub else [])
    holder = t
    for k in path[:-1]:
        holder = holder[k]
    key = path[-1]
    if isinstance(holder[key], list):
        hits = [i for i, s in enumerate(holder[key]) if old in s]
        assert len(hits) == 1 and holder[key][hits[0]].count(old) == 1, (name, field, old)
        holder[key][hits[0]] = holder[key][hits[0]].replace(old, new)
    else:
        assert holder[key].count(old) == 1, (name, field, old)
        holder[key] = holder[key].replace(old, new)


# mt3-infer: the vendor's self-description is quoted, not stated as a fact; the not-run wording is exact.
rep("mt3-infer", "what",
    "Production-ready, unified inference toolkit for the MT3 music transcription model family (PyPI description): one Python API and CLI over vendored MR-MT3, mt3-pytorch and YourMT3 code",
    "one Python API and CLI over vendored MR-MT3, mt3-pytorch and YourMT3 code; its PyPI description: \"Production-ready, unified inference toolkit for the MT3 music transcription model family\"")
rep("mt3-infer", "not_run_reason",
    "The MT3, mt3-pytorch, MR-MT3 and YourMT3+ code could not be run from their repositories (session permission system), and this package",
    "The session's permission system refused installing the MT3 clone and running the mt3-pytorch clone, and MR-MT3 and YourMT3+ were not attempted after those refusals; this package")
# yourmt3: the weights repository holds more than the seven files named.
rep("yourmt3 (PyPI, third party)", "license",
    "YMT3+.pt 185,123,699 bytes and six other files",
    "YMT3+.pt 185,123,699 bytes and the six other YourMT3 and MT3 files listed in survey.md section 37 (the repository also holds other models' files, e.g. crepe_*.h5 and melodia_vamp_plugin_*.zip)",
    sub="weights/name")
# YourMT3+: what the cited timings are; the code has no package from the authors.
rep("YourMT3+", "not_run_reason",
    "the code exists only in the Space's git repository,",
    "the code exists only in the Space's git repository (no package from the authors; the third-party PyPI packages yourmt3 and mt3-infer were not used),")
rep("YourMT3+", "not_run_reason",
    "(r0164 31.18 s, r0245 31.34 s, cpu-basic) are the CPU timings on record.",
    "(r0164 31.18 s and r0245 31.34 s, round trips its script measured, upload and queueing included; ledger walls 32.21 s and 33.78 s; cpu-basic hardware) are the timings on record for the CPU Space.")
# RMVPE / rmvpe-onnx: the CLI's --plot.
for n in ("RMVPE", "rmvpe-onnx"):
    rep(n, "outputs", "without --csv it only prints a summary",
        "without --csv it prints a summary and writes no file (--plot also shows an interactive plotly figure)")
# Onsets and Frames: the start-up figure counts from a whole-second ledger time.
m = by["Onsets and Frames (Magenta)"]["runs"][0]["metrics"]
assert m["startup_before_first_file_s"] == 20.5
m["startup_note"] = ("about 20 s: counted from the ledger's start time 23:41:16, which has whole seconds; the first "
                     "'Starting transcription' log line is at 23:41:36.47 (verify-gapfill-audio-to-notes)")
vr = by["Onsets and Frames (Magenta)"]["runs"]
vr.append({"run_id": "r0583", "input_id": "S1,S2n,R1c,S4guitar", "cores": 2, "wall_s": 38.72, "peak_mb": 1154.2,
           "exit_code": 0, "output_files": ["/home/user/gtr/lanes/audio-to-notes/verify-gap1/oaf-out/<clip>.wav.midi"],
           "metrics": {"round": "verification of gap round 1 (verify-gapfill-audio-to-notes, 2026-11-11)",
                       "command": "the r0545 command, venv rebuilt from samples/onsets-frames/uv-pip-freeze-venv-oaf-py3.8.txt, checkpoint re-downloaded (same sha256)",
                       "cpu_s": 42.6, "slot_wait_s": 0.0,
                       "per_file_s_from_log": {"S1": 5.232, "S2n": 3.309, "R1c": 3.568, "S4guitar": 5.102},
                       "outputs_vs_r0545": "all four MIDI files byte-identical"}})
for n in ("RMVPE", "rmvpe-onnx"):
    by[n]["runs"].append({"run_id": "r0579", "input_id": "S1,S2n,S2s,S4,S4lead,R1b,R2,R3a", "cores": 2, "wall_s": 25.42,
                          "peak_mb": 1199.2, "exit_code": 0,
                          "output_files": ["/home/user/gtr/lanes/audio-to-notes/verify-gap1/rmvpe-out/f0/<clip>.f0.csv"],
                          "metrics": {"round": "verification of gap round 1 (verify-gapfill-audio-to-notes, 2026-11-11)",
                                      "command": "the r0516 command, venv rebuilt from samples/rmvpe/uv-pip-freeze-venv-rmvpe-py3.11.txt, rmvpe.onnx re-downloaded (same sha256)",
                                      "cpu_s": 44.6, "slot_wait_s": 0.0, "model_setup_s": 1.464,
                                      "predict_s_per_clip": {"S1": 14.153, "S2n": 0.91, "S2s": 1.075, "S4": 1.19, "S4lead": 1.081, "R1b": 0.84, "R2": 0.836, "R3a": 0.535},
                                      "outputs_vs_r0516": "all eight f0 CSVs byte-identical"}})
    by[n]["runs"].append({"run_id": "r0581", "input_id": "S1", "cores": None, "wall_s": 6.02, "peak_mb": 1007.9,
                          "exit_code": 0,
                          "output_files": ["/home/user/gtr/lanes/audio-to-notes/verify-gap1/rmvpe-out/cli/S1.csv"],
                          "metrics": {"round": "verification of gap round 1 (verify-gapfill-audio-to-notes, 2026-11-11)",
                                      "nolock": True, "command": "the r0517 CLI command", "cpu_s": 8.8,
                                      "outputs_vs_r0517": "CSV byte-identical; printed summary identical except Time (1639.4 ms; r0517 2902.0 ms)"}})
out = json.dumps(d, indent=1, ensure_ascii=False)
open(path, "w").write(out)
print("ok", len(d["tools"]), len(out.encode()))
