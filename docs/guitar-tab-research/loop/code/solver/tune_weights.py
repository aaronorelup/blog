#!/usr/bin/env python3
"""tune_weights.py: the one-time weight search on the capo song (run with the eval venv's python: needs mir_eval).
Scores with the same matching as gtr-eval tab's list (onset 50 ms, same pitch, each note once) but in-process and
without the ledger; the kept weights are then scored with gtr-eval itself. Objective: the mean main number over
four capo cells (key / chain-2 notes x hand off / tool window hard), tuning given.
Usage: tune_weights.py <out.json>"""
import json, os, sys, itertools
import numpy as np
import mir_eval

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import solver

G = "/home/user/gtv"
S = "capo"
TR = json.load(open(f"{G}/truth/{S}/{S}.truth.json"))
TUN, CAPO = TR["tuning_midi"], TR["capo"]
WIN = solver.Window(sys.argv[2] if len(sys.argv) > 2 else f"{G}/loop/e1/{S}/v0_m1/hand_window.csv")
NOTES = {"key": solver.load_notes(f"{G}/truth/{S}/{S}.truth.json"),
         "chain2": solver.load_notes(f"{G}/experiments/{S}/chain-2/notes.csv")}
tn = [n for n in TR["notes"] if n.get("string") is not None]
ref_iv = np.array([[n["onset"], max(n["offset"], n["onset"] + 0.01)] for n in tn])
ref_p = np.array([440 * 2 ** ((n["pitch"] - 69) / 12) for n in tn])
ref_sf = [(n["string"], n["fret"]) for n in tn]


def main_number(path):
    if not path: return 0.0
    iv = np.array([[n["onset"], max(n["offset"], n["onset"] + 0.01)] for n in path])
    p = np.array([440 * 2 ** ((n["pitch"] - 69) / 12) for n in path])
    m = mir_eval.transcription.match_notes(ref_iv, ref_p, iv, p, onset_tolerance=0.05, pitch_tolerance=50.0,
                                           offset_ratio=None)
    return sum(1 for i, j in m if ref_sf[i] == (path[j]["string"], path[j]["fret"])) / len(tn)


def objective(W):
    r = {}
    for nk, notes in NOTES.items():
        for hk, win in (("off", None), ("tool", WIN)):
            res = solver.solve_range([dict(n) for n in notes], TUN, CAPO, win, "hard", W, alternatives=False)
            r[f"{nk}-{hk}"] = round(main_number(res["path"]), 4)
    return float(np.mean(list(r.values()))), r


GRID = {"move": [0.05, 0.1, 0.2, 0.4, 0.8], "height": [0.0, 0.02, 0.05, 0.1], "span": [0.3, 0.6, 1.0, 2.0],
        "ring": [0.0, 0.15, 0.3, 0.6, 1.0], "open": [-0.3, -0.1, 0.0, 0.1, 0.3]}

if __name__ == "__main__":
    W = {"move": 0.2, "height": 0.02, "span": 0.6, "ring": 0.3, "open": 0.0, "win": 0.5, "drop": 5.0}
    log = []
    best, parts = objective(W); log.append({"W": dict(W), "obj": best, "cells": parts, "step": "start"})
    for rnd in range(3):
        changed = False
        for k, vals in GRID.items():
            for v in vals:
                if v == W[k]: continue
                W2 = dict(W, **{k: v}); o, pr = objective(W2)
                log.append({"W": W2, "obj": o, "cells": pr, "step": f"round {rnd + 1} {k}={v}"})
                if o > best + 1e-4: best, parts, W, changed = o, pr, W2, True
        if not changed: break
    # soft-window weight, with the other weights fixed (cells with the tool window, soft)
    soft = []
    for v in [0.1, 0.25, 0.5, 1.0, 2.0]:
        W2 = dict(W, win=v); r = {}
        for nk, notes in NOTES.items():
            res = solver.solve_range([dict(n) for n in notes], TUN, CAPO, WIN, "soft", W2, alternatives=False)
            r[nk] = round(main_number(res["path"]), 4)
        soft.append({"win": v, "obj": float(np.mean(list(r.values()))), "cells": r})
    bw = max(soft, key=lambda x: (round(x["obj"], 4), -abs(x["win"] - 0.5)))["win"]
    W["win"] = bw
    json.dump({"kept": W, "objective": best, "cells": parts, "soft_win_search": soft, "log": log},
              open(sys.argv[1], "w"), indent=1)
    print(json.dumps({"kept": W, "objective": best, "cells": parts}))
    print(json.dumps(soft))
