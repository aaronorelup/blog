"""Timbre-Trap (sony/timbre-trap, commit 7afe7e9, cloned to /home/user/gtr/lanes/audio-to-notes/build/timbre-trap)
with the paper's base weights tt-orig.pt from the Hugging Face Space cwitkowitz/timbre-trap.

usage: python run_timbretrap.py <outdir> [--clips S2n,S3,...]
Model built as in the README (sample_rate=22050, n_octaves=9, bins_per_octave=60, secs_per_block=3, latent_size=128,
model_complexity=2, skip_connections=False), weights loaded with load_state_dict. Post-processing copied from the
repo's experiments/comparison.py: activations = to_array(model.transcribe(audio).squeeze(0)); threshold(
filter_non_peaks(activations), 0.5); bins above mir_eval.multipitch.MAX_FREQ zeroed; active bins -> Hz.
Writes <clip>.multif0.json ({"times", "freqs_hz"}) and timings.json.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import CLIPS  # noqa: E402

REPO = "/home/user/gtr/lanes/audio-to-notes/build/timbre-trap"
WEIGHTS = "/home/user/gtr/lanes/audio-to-notes/dl/timbre-trap-weights/tt-orig.pt"
ap = argparse.ArgumentParser()
ap.add_argument("outdir")
ap.add_argument("--clips", default="S1,S2n,S2s,S3,S4guitar,R1a,R1b,R1c")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
sys.path.append(REPO)

import numpy as np  # noqa: E402
import torch  # noqa: E402
import librosa  # noqa: E402
import mir_eval  # noqa: E402
from timbre_trap.framework import TimbreTrap  # noqa: E402
from timbre_trap.utils import to_array, filter_non_peaks, threshold  # noqa: E402

torch.set_num_threads(2)
t0 = time.perf_counter()
model = TimbreTrap(sample_rate=22050, n_octaves=9, bins_per_octave=60, secs_per_block=3, latent_size=128,
                   model_complexity=2, skip_connections=False)
sd = torch.load(WEIGHTS, map_location="cpu", weights_only=False)
load_note = "state_dict"
if not isinstance(sd, dict):  # a pickled model object
    model, load_note = sd, f"pickled object of type {type(sd).__name__}"
else:
    model.load_state_dict(sd)
model.eval()
rec = {"tool": "timbre-trap 7afe7e9", "weights": os.path.basename(WEIGHTS), "weights_loaded_as": load_note,
       "setup_s": round(time.perf_counter() - t0, 3), "clips": {}}
cqt = model.sliCQ
midi_freqs = cqt.get_midi_freqs()
invalid = librosa.midi_to_hz(midi_freqs) > mir_eval.multipitch.MAX_FREQ
for clip in a.clips.split(","):
    t1 = time.perf_counter()
    y, _ = librosa.load(CLIPS[clip], sr=22050, mono=True)
    x = torch.from_numpy(y)[None, None]
    x = cqt.pad_to_block_length(x)
    times = cqt.get_times(cqt.get_expected_frames(x.size(-1)))
    with torch.no_grad():
        act = to_array(model.transcribe(x).squeeze(0))
    act = threshold(filter_non_peaks(act), 0.5)
    act[invalid] = 0
    freqs = [[round(float(f), 3) for f in librosa.midi_to_hz(midi_freqs[np.where(act[:, i])[0]])]
             for i in range(act.shape[-1])]
    times = np.asarray(times, dtype=float)[: len(freqs)]
    json.dump({"times": [round(float(t), 5) for t in times], "freqs_hz": freqs},
              open(os.path.join(a.outdir, f"{clip}.multif0.json"), "w"))
    rec["clips"][clip] = {"input": CLIPS[clip], "seconds": round(time.perf_counter() - t1, 3),
                          "n_frames": len(freqs), "hop_s": round(float(times[1] - times[0]), 5),
                          "activation_shape": list(act.shape), "n_pitches_total": int(sum(len(f) for f in freqs)),
                          "max_pitches_in_a_frame": int(max(len(f) for f in freqs))}
    print(clip, rec["clips"][clip], flush=True)
json.dump(rec, open(os.path.join(a.outdir, "timings.json"), "w"), indent=1)
