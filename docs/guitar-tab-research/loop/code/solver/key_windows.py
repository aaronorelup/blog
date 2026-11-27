#!/usr/bin/env python3
"""key_windows.py <truth.json> <out_dir>: the two ASSISTED hand windows made from an answer key (scoring aids, never
a tool's output).

perfect.csv: each bar (from the key's downbeats; the notes before the first downbeat are one more bar) gets the key's
             fretted frets in that bar plus one either side, rows at 30 a second; bars with no fretted note are lost
             (no constraint). Open strings are always allowed by the solver.
ceiling.csv: one row at each of the key's onset groups (35 ms) with exactly that group's fretted frets (no margin);
             groups with only open strings are lost. The solver uses the row nearest to a note's onset.
Frets are counted from the capo, as in the key and in hand_window.csv."""
import json, os, sys

GROUP_S = 0.035
MAXF = 20


def main(truth, out):
    T = json.load(open(truth))
    notes = sorted(T["notes"], key=lambda n: n["onset"])
    dur = float(T.get("duration_s") or notes[-1]["offset"] + 1)
    db = sorted(T["downbeats"])
    edges = [0.0] + [d for d in db if d > 0] + [dur + 1]
    bars = []
    for a, b in zip(edges, edges[1:]):
        fr = [n["fret"] for n in notes if a <= n["onset"] < b and n.get("fret") is not None and n["fret"] > 0]
        bars.append((a, b, (max(1, min(fr) - 1), min(MAXF, max(fr) + 1)) if fr else None))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "perfect.csv"), "w") as f:
        f.write("t,lo,hi,conf,lost\n")
        k, bi = 0, 0
        while k / 30.0 <= dur:
            t = k / 30.0
            while bi < len(bars) - 1 and t >= bars[bi][1]: bi += 1
            w = bars[bi][2]
            f.write(f"{t:.4f},{w[0]},{w[1]},1,0\n" if w else f"{t:.4f},,,0,1\n")
            k += 1
    groups, cur = [], []
    for n in notes:
        if cur and n["onset"] - cur[0]["onset"] > GROUP_S: groups.append(cur); cur = []
        cur.append(n)
    if cur: groups.append(cur)
    with open(os.path.join(out, "ceiling.csv"), "w") as f:
        f.write("t,lo,hi,conf,lost\n")
        for g in groups:
            fr = [n["fret"] for n in g if n.get("fret") is not None and n["fret"] > 0]
            t = g[0]["onset"]
            f.write(f"{t:.4f},{min(fr)},{max(fr)},1,0\n" if fr else f"{t:.4f},,,0,1\n")
    nb = sum(1 for b in bars if b[2]); print(f"{truth}: {len(bars)} bars ({nb} with frets), {len(groups)} groups")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
