"""aubio 0.4.9 command-line tools (Ubuntu package aubio-tools 0.4.9-4.4build1), default settings.

usage: python3 run_aubio.py <outdir> [--clips ...]
Per clip (input: the clip's .mono.wav, or the stereo stem):
  aubiopitch -i <wav>            -> stdout "time_s pitch_hz" per hop (yinfft, buffer 2048, hop 256 at the file's rate,
                                    silence -90 dB, tolerance 0.3) -> <clip>.f0.csv (no confidence column)
  aubionotes -i <wav>            -> stdout "midi_pitch onset_s offset_s" per note (hfc onsets, threshold 0.3,
                                    minioi 0.012 s, yinfft pitch, silence -90 dB, release drop 10 dB) -> <clip>.notes.csv
The raw stdout of both tools is kept as <clip>.aubiopitch.txt and <clip>.aubionotes.txt.
"""
import argparse
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import mono_path, write_f0_csv, write_notes_csv  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("outdir")
ap.add_argument("--clips", default="S1,S2n,S2s,S4,S4lead,R1b,R2,R3a")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
rec = {"tool": "aubio 0.4.9 CLI", "clips": {}}
for clip in a.clips.split(","):
    wav = mono_path(clip)
    t0 = time.perf_counter()
    p = subprocess.run(["aubiopitch", "-i", wav], capture_output=True, text=True)
    t1 = time.perf_counter()
    n = subprocess.run(["aubionotes", "-i", wav], capture_output=True, text=True)
    t2 = time.perf_counter()
    open(os.path.join(a.outdir, f"{clip}.aubiopitch.txt"), "w").write(p.stdout)
    open(os.path.join(a.outdir, f"{clip}.aubionotes.txt"), "w").write(n.stdout)
    ts, fs = [], []
    for line in p.stdout.splitlines():
        parts = line.split()
        if len(parts) == 2:
            ts.append(float(parts[0]))
            fs.append(float(parts[1]))
    write_f0_csv(os.path.join(a.outdir, f"{clip}.f0.csv"), ts, fs)
    notes, other = [], []
    for line in n.stdout.splitlines():
        parts = line.split()
        if len(parts) == 3:
            notes.append((float(parts[1]), float(parts[2]), int(round(float(parts[0])))))
        elif parts:
            other.append(line)
    write_notes_csv(os.path.join(a.outdir, f"{clip}.notes.csv"), notes)
    rec["clips"][clip] = {"input": wav, "aubiopitch_s": round(t1 - t0, 3), "aubionotes_s": round(t2 - t1, 3),
                          "n_frames": len(ts), "hop_s": round(ts[1] - ts[0], 6) if len(ts) > 1 else None,
                          "n_frames_hz_gt0": sum(1 for f in fs if f > 0), "n_notes": len(notes),
                          "aubionotes_lines_not_3_fields": other[:5], "exit": [p.returncode, n.returncode]}
    print(clip, rec["clips"][clip], flush=True)
with open(os.path.join(a.outdir, "timings.json"), "w") as fh:
    json.dump(rec, fh, indent=1)
