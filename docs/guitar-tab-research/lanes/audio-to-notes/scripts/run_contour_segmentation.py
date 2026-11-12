"""Handoff test inside the lane: other trackers' f0 contours (CSV files written by run_f0.py / run_essentia.py, all
on a 10 ms grid) fed to Essentia's PitchContourSegmentation, which turns a pitch contour into notes.

usage: python run_contour_segmentation.py <outdir> <tool:threshold,...> <clip,...>
For each tool and clip: read <tool>/f0/<clip>.f0.csv (time_s, frequency_hz[, confidence]); frames whose confidence
is below the given threshold (if one is given) are set to 0 Hz (unvoiced); the contour is passed with the clip's
mono audio at 44100 Hz to PitchContourSegmentation(hopSize=441, sampleRate=44100) (441 samples = 10 ms, the
contours' hop), other parameters at their defaults (minDuration 0.1 s, pitchDistanceThreshold 60 cents,
rmsThreshold -2, tuningFrequency 440). Writes <outdir>/<tool>/<clip>.notes.csv (onset_s, offset_s, pitch_midi).
"""
import json
import os
import sys
import time
import csv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import mono_path, write_notes_csv  # noqa: E402

import numpy as np  # noqa: E402
import essentia.standard as es  # noqa: E402

OUT = "/home/user/gtr/lanes/audio-to-notes/out"
outdir = sys.argv[1]
tools = [t.split(":") for t in sys.argv[2].split(",")]
clips = sys.argv[3].split(",")
rec = {}
for tool, thr in tools:
    for clip in clips:
        rows = list(csv.DictReader(open(f"{OUT}/{tool}/f0/{clip}.f0.csv")))
        t = np.array([float(r["time_s"]) for r in rows])
        f = np.array([float(r["frequency_hz"]) for r in rows])
        if thr and "confidence" in rows[0]:
            c = np.array([float(r["confidence"]) for r in rows])
            f = np.where(c >= float(thr), f, 0.0)
        # put the contour on the exact 10 ms grid starting at 0 s (nearest frame), as the algorithm assumes
        grid = np.arange(0, t[-1] + 1e-9, 0.01)
        idx = np.clip(np.round((grid - t[0]) / 0.01).astype(int), 0, len(f) - 1)
        pitch = f[idx].astype(np.float32)
        audio = es.MonoLoader(filename=mono_path(clip), sampleRate=44100)()
        t0 = time.perf_counter()
        onset, dur, midi = es.PitchContourSegmentation(hopSize=441, sampleRate=44100)(pitch, audio)
        notes = [(float(o), float(o + d), int(m)) for o, d, m in zip(onset, dur, midi) if np.isfinite(m)]
        n_nan = int(sum(1 for m in midi if not np.isfinite(m)))  # notes whose MIDI pitch came back NaN: dropped
        write_notes_csv(os.path.join(outdir, tool, f"{clip}.notes.csv"), notes)
        rec[f"{tool}/{clip}"] = {"threshold": thr or None, "frames": int(len(pitch)),
                                 "voiced_frames": int((pitch > 0).sum()), "n_notes": len(notes),
                                 "n_notes_with_nan_pitch_dropped": n_nan,
                                 "segmentation_s": round(time.perf_counter() - t0, 3)}
        print(tool, clip, rec[f"{tool}/{clip}"], flush=True)
json.dump(rec, open(os.path.join(outdir, "runs.json"), "w"), indent=1)
