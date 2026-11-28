"""Count truth-voiced frames where torchcrepe's batch output (run r0321) is at or above 1500 Hz, and the median
periodicity there. Run with the gtr-eval venv's Python (numpy): python -I diag_torchcrepe_high_frames.py"""
import csv, json
import numpy as np
OUT = "/home/user/gtr/lanes/audio-to-notes/out"
for clip, voice in [("R1b", "lead"), ("S1", None), ("S2n", "melody")]:
    T = json.load(open(f"/home/user/gtr/inputs/{clip}/{clip}.truth.json"))
    grid = np.arange(0, T["duration_s"], 0.01); ref = np.zeros(len(grid))
    for n in sorted(T["notes"], key=lambda n: n["onset"]):
        if voice and n["voice"] != voice:
            continue
        i0 = int(np.ceil(n["onset"] / 0.01)); i1 = int(np.ceil(n["offset"] / 0.01))
        ref[i0:i1] = 440 * 2 ** ((n["pitch"] - 69) / 12)
    for tool in ["torchcrepe-tiny", "torchcrepe-full"]:
        rows = list(csv.DictReader(open(f"{OUT}/{tool}/f0/{clip}.f0.csv")))
        f = np.array([float(r["frequency_hz"]) for r in rows]); p = np.array([float(r["confidence"]) for r in rows])
        idx = np.clip(np.round(grid / 0.01).astype(int), 0, len(f) - 1)
        e = f[idx]; pp = p[idx]; v = ref > 0; hi = v & (e >= 1500)
        print(clip, tool, "truth-voiced frames", int(v.sum()), "est>=1500Hz on", int(hi.sum()),
              "median periodicity there", round(float(np.median(pp[hi])), 3) if hi.any() else None,
              "| elsewhere", round(float(np.median(pp[v & ~hi])), 3))
