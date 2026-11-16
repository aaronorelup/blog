"""Chain D: the pitch cross check of chainD_join.py repeated with every fingertip cell's fret moved by -1 and +1
(the video lane found that on R3b the fret number of a cell depends on the method by one fret).

usage: python3 chainD_pitch_shift_check.py <join json> [<join json> ...]
For each onset that has fingertip cells: does the note's pitch equal standard tuning + (fret + d) on the cell's
string for some fingertip, for d = -1, 0, +1. Counts only; no truth exists for these clips.
"""
import json, sys

TUNING = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}
out = {}
for p in sys.argv[1:]:
    j = json.load(open(p))
    rows = [n for n in j["notes"] if n.get("tip_cells")]
    res = {"onsets_with_cells": len(rows)}
    for d in (-1, 0, 1):
        res[f"pitch_on_a_tip_cell_fret_shift_{d:+d}"] = sum(
            any(TUNING[s] + f + d == n["pitch"] for s, f in n["tip_cells"].values()) for n in rows)
    res["pitch_is_open_string"] = sum(n["pitch"] in TUNING.values() for n in rows)
    out[j["clip"]] = res
print(json.dumps(out))
