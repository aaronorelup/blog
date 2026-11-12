"""SwiftF0 0.3.0 with the pitch range limited to a guitar's range (fmin=82.4 Hz, fmax=1319 Hz), plus its own
segment_notes(); same outputs as run_f0.py swiftf0. usage: python run_swiftf0_range.py <outdir> [clips]"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import mono_path, write_f0_csv, write_notes_csv
import numpy as np
from swift_f0 import SwiftF0
from swift_f0.music import segment_notes
out = sys.argv[1]; clips = (sys.argv[2] if len(sys.argv) > 2 else "S1,S2n,S2s,S4,S4lead,R1b,R2,R3a").split(",")
os.makedirs(out, exist_ok=True)
det = SwiftF0(threads=2)
rec = {"settings": {"fmin": 82.4, "fmax": 1319.0, "segment_notes": "pitch_hold_ms=80"}, "clips": {}}
for c in clips:
    t0 = time.perf_counter()
    r = det.detect_file(mono_path(c), fmin=82.4, fmax=1319.0)
    notes = [(n.start, n.end, int(np.floor(69 + 12 * np.log2(n.pitch_hz / 440.0) + 0.5)), round(float(n.pitch_hz), 3)) for n in segment_notes(r)]
    write_f0_csv(os.path.join(out, f"{c}.f0.csv"), r.timestamps, r.pitch_hz, r.confidence)
    write_notes_csv(os.path.join(out, f"{c}.notes.csv"), notes, extra_cols="fitted_pitch_hz")
    rec["clips"][c] = {"seconds": round(time.perf_counter() - t0, 3), "n_notes": len(notes)}
json.dump(rec, open(os.path.join(out, "timings.json"), "w"), indent=1)
print(rec)
