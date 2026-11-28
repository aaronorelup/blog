#!/usr/bin/env python3
"""Apply (verifier, round 2) the corrections and re-run notes of the gap round 2 check to tools.json.

Usage: python3 -I vpatch_tools_json.py <tools.json>
Keeps the file's own formatting (json.dumps(indent=1, ensure_ascii=False), no newline at the end), refuses to write if
that formatting does not round-trip, and prints every path it changed.
"""
import json
import sys

p = sys.argv[1]
s = open(p, encoding="utf-8").read()
d = json.loads(s)
assert json.dumps(d, indent=1, ensure_ascii=False) == s, "formatting does not round-trip"
T = {e["name"]: e for e in d["tools"]}
changed = []


def run(tool, rid):
    r = [x for x in T[tool]["runs"] if x["run_id"] == rid]
    assert len(r) == 1, (tool, rid)
    return r[0]


def setm(tool, rid, key, value):
    run(tool, rid)["metrics"][key] = value
    changed.append(f"{tool} / {rid} / metrics.{key}")


bp = "Basic Pitch"
cav = ("taskset -c 1 did not keep every thread on core 1: Basic Pitch builds ort.InferenceSession without "
       "SessionOptions, and ONNX Runtime's threading documentation says that a session with no thread count creates "
       "extra threads per additional physical core, 'affinitized to that core'; r0252's command, started the same "
       "way and watched as r0673, had 4 threads with masks 1, 1, 2, 3 and 5.64 s of its 12.4 s CPU on cores 2 and 3 "
       "(the thread names do not show which library started each thread). Not a one-core timing (this run itself was "
       "not watched). Wording corrected by the round-2 verifier (was 'taskset -c 1 held the main thread only').")
for rid in ("r0252", "r0325"):
    assert run(bp, rid)["metrics"]["affinity_caveat_gap_round_2"].startswith("taskset -c 1 held the main thread only")
    setm(bp, rid, "affinity_caveat_gap_round_2", cav)
setm(bp, "r0673", "verifier_rerun", "round-2 verifier: r0710 (same command, --nolock, taskset -c 1, the three thread "
     "variables at 1; venv with the same package versions under Python 3.11; wall 20.98 s, first run in that venv) and "
     "r0712 (second run, wall 8.39 s): thread masks 1, 1, 2, 3 in r0710; in r0712 the masks 1, 1 and 3, and one "
     "thread read with the mask 1 at some readings and 2 at others; with 8.65 s "
     "of 29.3 s and 8.15 s of 16.0 s CPU on cores 2 and 3; outputs byte-identical to r0252. r0708 (exit 1, output "
     "folder missing) is superseded by r0710.")
setm(bp, "r0670", "verifier_rerun", "round-2 verifier: r0714 (same wrapper and arguments, 2-core slot cores 2-3, wall "
     "6.05 s): all 4 threads kept the mask 2-3; outputs byte-identical to r0252")
setm(bp, "r0672", "verifier_rerun", "round-2 verifier: r0715 (same command, 2-core slot cores 0-1, wall 3.61 s): 6 "
     "threads, masks 0-1, 0-1, 0-1, 1, 2, 3, 3.26 s of 8.5 s CPU on cores 2 and 3; outputs byte-identical to r0252")

lf = "libfmp (HPS and HRPS)"
setm(lf, "r0620", "verifier_rerun", "round-2 verifier: r0706 (venv rebuilt offline from samples/freezes/venv-libfmp.txt, "
     "2-core slot, wall 30.99 s): identical samples in all 16 WAV files (only two bytes of the PEAK chunk's timestamp "
     "differ), byte-identical onset files, summary equal apart from the timings; the 28 scorings e1792 to e1825 re-run "
     "with --no-ledger (gtr-eval 0.12.1) gave the same counts and metrics")
setm(lf, "r0620", "notebook_hrps_note", "round-2 verifier: the C8S1_HRPS notebook's cell In [3] passes param_list to "
     "libfmp.c8.experiment_hrps_parameter, which in libfmp 1.3.0 calls hrps(x, Fs=Fs, N=1024, H=512, ...) whatever "
     "N and H the list holds (c8s1_hps.py line 319), so the notebook's own HRPS parts use H=512 (L_h 9 frames); this "
     "run passed the list's H=256 (L_h 19 frames)")

ipt = [n for n in T if n.startswith("ipt~ / libipt")][0]
setm(ipt, "r0643", "verifier_rerun", "round-2 verifier: r0707 (model downloaded again, same sha256; venv rebuilt "
     "offline from samples/freezes/venv-ipt.txt; 2-core slot, wall 11.82 s): byte-identical window CSVs for all three "
     "clips, summary equal apart from model path and timings")
setm(ipt, "r0643", "count_in_and_median_top1_prob", "count-in windows (13 each in S6taps and S2s): top-1 probability "
     "0.7612, 0.8048, then 0.6703 eleven times; median top-1 probability of the windows at or above -60 dBFS: S6taps "
     "0.9999, S2s 1.0, R3c 0.9988 (four-decimal CSV values; round-2 verifier)")

mb = T["MidiBERT-Piano melody extraction"]
k = [i for i, u in enumerate(mb["unverified"]) if u.startswith("gap round 2: inputs for a run elsewhere")]
assert len(k) == 1
mb["unverified"][k[0]] += ("; round-2 verifier re-runs r0720 (inputs) and r0721 (self-test) wrote byte-identical "
                           "MIDI files and the same self-test result")
changed.append("MidiBERT-Piano melody extraction / unverified[%d]" % k[0])

qm = T["QM Vamp Plugins: note onset detector"]
qm["not_run_reason"] += (" Round-2 verifier, 2026-11-12: a wider search (.so and .cat files under paths containing "
                         "'vamp') again found no QM plugin; the Vamp SDK's vamp-example-plugins.so (Ubuntu package "
                         "vamp-examples, plugins include 'Simple Percussion Onset Detector') is in "
                         "/usr/lib/x86_64-linux-gnu/vamp/, outside vamp-simple-host's default search path, and was not run.")
changed.append("QM Vamp Plugins: note onset detector / not_run_reason")

out = json.dumps(d, indent=1, ensure_ascii=False)
open(p, "w", encoding="utf-8").write(out)
print("\n".join(changed))
