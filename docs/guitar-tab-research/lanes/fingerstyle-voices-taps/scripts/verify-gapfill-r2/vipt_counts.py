#!/usr/bin/env python3
"""Recount (verifier) the eguitar_ircam.ts window figures of "Gap round 2" from the saved window CSVs.

Usage: python3 vipt_counts.py <dir holding S6taps.windows.csv, S2s.windows.csv, R3c.windows.csv>
Reads only the CSVs (probabilities rounded to 4 decimals there) and the S6taps truth taps; prints every count the
section quotes. Standard library only.
"""
import csv, json, os, statistics, sys
from collections import Counter

d = sys.argv[1]


def load(cid):
    with open(os.path.join(d, f"{cid}.windows.csv")) as f:
        rows = list(csv.DictReader(f))
    return rows


classes = ["behind-nut", "bend", "bottleneck", "glissando", "legato", "muted", "palmstrike", "scratch", "snap-pizz",
           "staccato", "sustained", "tremolo", "trill", "vibrato"]
R = {c: load(c) for c in ("S6taps", "S2s", "R3c")}
for cid, rows in R.items():
    gate = [r for r in rows if float(r["rms_dbfs"]) >= -60]
    quiet = [r for r in rows if float(r["rms_dbfs"]) < -60]
    print(cid, "windows", len(rows), "top1 all", Counter(r["top_class"] for r in rows).most_common())
    print("   >=-60 dBFS:", len(gate), Counter(r["top_class"] for r in gate).most_common())
    if quiet:
        print("   below -60:", len(quiet), "t_end", quiet[0]["t_end_s"], "to", quiet[-1]["t_end_s"], "rms",
              min(float(r["rms_dbfs"]) for r in quiet), "to", max(float(r["rms_dbfs"]) for r in quiet),
              "classes", Counter(r["top_class"] for r in quiet), "top prob", min(float(r["top_prob"]) for r in quiet),
              "to", max(float(r["top_prob"]) for r in quiet))
    print("   last two:", [(r["t_end_s"], r["top_class"]) for r in rows[-2:]])
    tp = [float(r["top_prob"]) for r in gate]
    print("   top prob in gated windows: median", statistics.median(tp), "min", min(tp))
a, b = R["S6taps"], R["S2s"]
assert [r["t_end_s"] for r in a] == [r["t_end_s"] for r in b]
same = sum(1 for x, y in zip(a, b) if x["top_class"] == y["top_class"])
diff = [(y["top_class"], x["top_class"], x["tap_in_last_0.2s"]) for x, y in zip(a, b) if x["top_class"] != y["top_class"]]
print("S6taps vs S2s same top1:", same, "of", len(a), "| differ:", len(diff),
      Counter(f"{s2} -> {s6}" for s2, s6, _ in diff).most_common(), "| with a tap in last 0.2 s:",
      sum(1 for *_, t in diff if t == "1"))
for c in ("palmstrike", "scratch", "legato", "trill", "bottleneck"):
    print("   mean prob S6taps - S2s", c, round(sum(float(x[c]) - float(y[c]) for x, y in zip(a, b)) / len(a), 4))
gate = [r for r in a if float(r["rms_dbfs"]) >= -60]
tap = [r for r in gate if r["tap_in_last_0.2s"] == "1"]
notap = [r for r in gate if r["tap_in_last_0.2s"] == "0"]
print("S6taps gated windows with tap:", len(tap), "without:", len(notap), "| all windows with tap:",
      sum(1 for r in a if r["tap_in_last_0.2s"] == "1"))
for c in ("palmstrike", "scratch", "bottleneck"):
    print("   mean", c, round(sum(float(r[c]) for r in tap) / len(tap), 4), "vs", round(sum(float(r[c]) for r in notap) / len(notap), 4))
ps = [r for r in a if r["top_class"] == "palmstrike"]
print("S6taps palmstrike top1 windows:", len(ps), "with a tap in last 0.2 s:", sum(1 for r in ps if r["tap_in_last_0.2s"] == "1"))
# the tap flag itself, from the truth
T = json.load(open("/home/user/gtr/inputs/S6taps/S6taps.truth.json"))
taps = [t["time"] for t in T["taps"]]
flag_ok = all((r["tap_in_last_0.2s"] == "1") == any(float(r["t_end_s"]) - 0.2 < t <= float(r["t_end_s"]) for t in taps) for r in a)
print("tap flags agree with the truth taps (to the 3-decimal end times):", flag_ok, "| truth taps:", len(taps))
