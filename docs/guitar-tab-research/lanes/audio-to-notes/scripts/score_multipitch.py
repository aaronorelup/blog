"""Frame-level multi-pitch scores with mir_eval.multipitch (gtr-eval has no multi-f0 subcommand, so this lane
computes them itself; run with the gtr-eval venv's Python: /home/user/gtr/eval/venv/bin/python -I).

usage: score_multipitch.py <truth id> <estimate> [--voice chord] [--out result.json]
estimate: a JSON {"times": [...], "freqs_hz": [[...], ...]} (multi-f0 frames, as run_essentia.py writes them),
          or a notes CSV (onset_s,offset_s,pitch_midi) / MIDI file, turned into frames on the same grid.
Reference: every truth note except voice 'drums' (or only --voice), as frames on a 10 ms grid from 0 to duration_s:
at time t the reference holds the frequency 440*2^((pitch-69)/12) of every note with onset <= t < offset.
The estimate is put on the same grid by taking, for each reference time, the estimate frame with the nearest time
(estimate frames further than half the estimate's own hop from any reference time are not used); notes are put on
the grid the same way as the reference. Metrics: mir_eval.multipitch.evaluate(ref_time, ref_freqs, est_time,
est_freqs) defaults (50 cents tolerance): Precision, Recall, Accuracy, Chroma Precision, Chroma Recall, Chroma
Accuracy, and the error scores.
"""
import argparse
import csv
import json
import sys

import numpy as np
import mir_eval

ap = argparse.ArgumentParser()
ap.add_argument("truth")
ap.add_argument("est")
ap.add_argument("--voice", default=None)
ap.add_argument("--out", default=None)
a = ap.parse_args()

tp = a.truth if a.truth.endswith(".json") else f"/home/user/gtr/inputs/{a.truth}/{a.truth}.truth.json"
T = json.load(open(tp))
hop = 0.01
grid = np.arange(0, T["duration_s"], hop)


def notes_to_frames(notes):
    fr = [[] for _ in grid]
    for on, off, p in notes:
        i0 = int(np.ceil(on / hop - 1e-9))
        i1 = int(np.ceil(off / hop - 1e-9))
        for i in range(max(i0, 0), min(i1, len(grid))):
            fr[i].append(440.0 * 2 ** ((p - 69) / 12.0))
    return [np.array(f) for f in fr]


ref_notes = [(n["onset"], n["offset"], n["pitch"]) for n in T["notes"]
             if n["voice"] != "drums" and (a.voice is None or n["voice"] == a.voice)]
ref = notes_to_frames(ref_notes)

if a.est.endswith(".json"):
    E = json.load(open(a.est))
    et = np.asarray(E["times"])
    ef = E["freqs_hz"]
    ehop = float(np.median(np.diff(et))) if len(et) > 1 else hop
    idx = np.clip(np.searchsorted(et, grid), 0, len(et) - 1)
    idx_prev = np.clip(idx - 1, 0, len(et) - 1)
    pick = np.where(np.abs(et[idx_prev] - grid) < np.abs(et[idx] - grid), idx_prev, idx)
    est = [np.array([f for f in ef[j] if f > 0]) if abs(et[j] - g) <= ehop / 2 + 1e-9 else np.array([])
           for j, g in zip(pick, grid)]
    kind = f"multi-f0 frames, hop {ehop:.5f} s, nearest frame per 10 ms reference time"
elif a.est.endswith(".mid"):
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(a.est)
    est = notes_to_frames([(n.start, n.end, n.pitch) for i in pm.instruments if not i.is_drum for n in i.notes])
    kind = "MIDI notes put on the 10 ms grid"
else:
    rows = list(csv.DictReader(open(a.est)))
    k_on = next(k for k in ("onset_s", "start_time_s", "onset") if k in rows[0])
    k_off = next(k for k in ("offset_s", "end_time_s", "offset") if k in rows[0])
    k_p = next(k for k in ("pitch_midi", "pitch") if k in rows[0])
    est = notes_to_frames([(float(r[k_on]), float(r[k_off]), float(r[k_p])) for r in rows])
    kind = "notes CSV put on the 10 ms grid"

scores = mir_eval.multipitch.evaluate(grid, ref, grid, est)
res = {"truth": tp, "est": a.est, "voice": a.voice, "estimate_handling": kind, "n_frames": len(grid),
       "ref_frames_with_notes": int(sum(1 for f in ref if len(f))), "est_frames_with_pitches": int(sum(1 for f in est if len(f))),
       "mir_eval": mir_eval.__version__, "scores": {k: round(float(v), 6) for k, v in scores.items()}}
print(json.dumps(res))
if a.out:
    json.dump(res, open(a.out, "w"), indent=1)
