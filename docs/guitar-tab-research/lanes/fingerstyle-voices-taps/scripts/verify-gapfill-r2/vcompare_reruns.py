#!/usr/bin/env python3
"""Compare (verifier, round 2) the verifier's re-runs of gap round 2 with the gap agent's original outputs.

Usage: <venv-core python> -I vcompare_reruns.py
Re-runs (ledger ids, label "verify ..."): r0706 libfmp (re-run of r0620), r0707 eguitar_ircam.ts (r0643),
r0710 and r0712 Basic Pitch taskset -c 1 (r0673), r0714 (r0670), r0715 (r0672), r0720 MidiBERT inputs (r0656),
r0721 scorer self-test (r0658). Prints one line per compared file group. Reads files only.
"""
import filecmp
import glob
import json
import os

import numpy as np
import soundfile as sf

L = "/home/user/gtr/lanes/fingerstyle-voices-taps"
V = f"{L}/verify-gapfill-r2"
S = "/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/samples"


def same_bytes(a, b):
    return os.path.exists(a) and os.path.exists(b) and filecmp.cmp(a, b, shallow=False)


# libfmp r0620 vs r0706: WAV samples, onset files, summary without timings
A, B = f"{L}/out/gap2-libfmp/S6taps", f"{V}/libfmp/S6taps"
wavs = sorted(glob.glob(f"{A}/*/*.wav"))
n_same_samples = n_same_bytes = 0
for p in wavs:
    q = p.replace(A, B)
    a, ra = sf.read(p, dtype="float32")
    b, rb = sf.read(q, dtype="float32")
    n_same_samples += int(ra == rb and a.shape == b.shape and np.array_equal(a, b))
    n_same_bytes += int(same_bytes(p, q))
txts = sorted(glob.glob(f"{A}/onsets_*/*.txt"))
n_txt = sum(same_bytes(p, p.replace(A, B)) for p in txts)
sa, sb = json.load(open(f"{A}/summary.json")), json.load(open(f"{B}/summary.json"))
strip = lambda s: [{k: v for k, v in r.items() if k != "seconds"} for r in s["runs"]]
print(f"libfmp r0706 vs r0620: {n_same_samples}/{len(wavs)} WAV files with identical samples "
      f"({n_same_bytes} byte-identical), {n_txt}/{len(txts)} onset files byte-identical, "
      f"summary equal apart from timings: {strip(sa) == strip(sb)}; timings r0620 {[r['seconds'] for r in sa['runs']]}"
      f" r0706 {[r['seconds'] for r in sb['runs']]}")

# eguitar r0643 vs r0707 and the samples
for c in ("S6taps", "S2s", "R3c"):
    print(f"eguitar {c}: r0707 CSV byte-identical to r0643: {same_bytes(f'{L}/out/gap2-ipt/{c}.windows.csv', f'{V}/ipt/{c}.windows.csv')}; "
          f"sample byte-identical to r0643: {same_bytes(f'{L}/out/gap2-ipt/{c}.windows.csv', f'{S}/eguitar-ircam/{c}.windows.csv')}")
a, b = json.load(open(f"{L}/out/gap2-ipt/summary.json")), json.load(open(f"{V}/ipt/summary.json"))
smp = json.load(open(f"{S}/eguitar-ircam/ipt_summary.json"))


def strip_ipt(d):
    d = json.loads(json.dumps(d))
    d.pop("model", None)
    d.pop("load_seconds", None)
    for c in d["clips"].values():
        c.pop("forward_seconds_batched", None)
    return d


print("eguitar summary r0707 equal to r0643 apart from model path and timings:", strip_ipt(a) == strip_ipt(b),
      "| sample ipt_summary.json equal to r0643's summary.json:", smp == a,
      "| r0643 load/forward:", a["load_seconds"], {k: v["forward_seconds_batched"] for k, v in a["clips"].items()},
      "| r0707:", b["load_seconds"], {k: v["forward_seconds_batched"] for k, v in b["clips"].items()})

# Basic Pitch: every re-run's 10 files against r0252's
ref = sorted(glob.glob(f"{L}/out/basic-pitch/*.mono_basic_pitch.*"))
for d in ("A_taskset1", "A2_taskset1_env1", "B_slot_ort2", "C_slot_default"):
    n = sum(same_bytes(p, f"{L}/out/gap2-bp-threads/{d}/{os.path.basename(p)}") for p in ref)
    print(f"basic-pitch gap round {d}: {n}/{len(ref)} files byte-identical to r0252")
for d in ("A2_taskset1_env1", "A2b_taskset1_env1", "B_slot_ort2", "C_slot_default"):
    n = sum(same_bytes(p, f"{V}/bp/{d}/{os.path.basename(p)}") for p in ref)
    print(f"basic-pitch verifier {d}: {n}/{len(ref)} files byte-identical to r0252")
for tag in ("A", "A2", "B", "C"):
    src = f"{L}/gap2/bp-threads/{tag}_monitor.json"
    print(f"monitor sample gap2_threads_{tag}.json byte-identical to {src}: {same_bytes(f'{S}/basic-pitch/gap2_threads_{tag}.json', src)}")
for tag in ("A", "A2", "B", "C"):
    d = json.load(open(f"{S}/basic-pitch/gap2_threads_{tag}.json"))
    th = [(v["name"], v["masks"], v["cpus_seen_while_accumulating"], v["cpu_ticks"] / 100) for v in d["threads"].values()]
    print(f"  original monitor {tag}: process mask {d['process_masks']}, threads {th}, sum {sum(t[3] for t in th):.2f}")
for tag, rid in (("A2", "r0710"), ("A2b", "r0712"), ("B", "r0714"), ("C", "r0715")):
    d = json.load(open(f"{V}/logs/{tag}_monitor.json"))
    th = [(v["name"], v["masks"], v["cpus_seen_while_accumulating"], v["cpu_ticks"] / 100) for v in d["threads"].values()]
    out_mask = sum(t[3] for t in th if t[1] and all(m not in d["process_masks"] for m in t[1]))
    print(f"  verifier monitor {rid} ({tag}): process mask {d['process_masks']}, threads {th}, sum {sum(t[3] for t in th):.2f}")

# MidiBERT r0656/r0658 vs r0720/r0721 and the samples
for p in sorted(glob.glob(f"{L}/gap2/midibert/inputs/*.mid")):
    f = os.path.basename(p)
    print(f"midibert {f}: r0720 byte-identical {same_bytes(p, f'{V}/midibert/inputs/{f}')}, sample byte-identical {same_bytes(p, f'{S}/midibert/{f}')}")
for p in sorted(glob.glob(f"{L}/gap2/midibert/selftest/*.mid")):
    f = os.path.basename(p)
    print(f"midibert selftest {f}: r0721 byte-identical {same_bytes(p, f'{V}/midibert/selftest/{f}')}")
norm = lambda x: json.dumps(x).replace(f"{V}/midibert/", "").replace(f"{L}/gap2/midibert/", "")
a = json.load(open(f"{L}/gap2/midibert/selftest/selftest.json"))
b = json.load(open(f"{V}/midibert/selftest/selftest.json"))
c = json.load(open(f"{S}/midibert/scorer_selftest.json"))
print("selftest.json r0721 equal to r0658 (paths cut to the part after .../midibert/):", norm(a) == norm(b),
      "| sample equal to r0658 the same way:", norm(a) == norm(c))
