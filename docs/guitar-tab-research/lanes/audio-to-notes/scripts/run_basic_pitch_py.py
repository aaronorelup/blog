"""Basic Pitch 0.4.0 through its Python API: basic_pitch.inference.predict(), one call per clip.

usage: python run_basic_pitch_py.py <backend tflite|onnx|tf> <outdir> <tag> [--fmin HZ] [--fmax HZ] [--clips S1,S2n,...]
Writes per clip: <clip>.mid, <clip>.notes.csv (Basic Pitch's own note-events layout:
start_time_s,end_time_s,pitch_midi,velocity,pitch_bend...), <clip>.model_output.npz, and timings.json
(model load time and per-clip predict() time, time.perf_counter, inside the one gtr-run of the batch).
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import CLIPS  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("backend")
ap.add_argument("outdir")
ap.add_argument("tag")
ap.add_argument("--fmin", type=float, default=None)
ap.add_argument("--fmax", type=float, default=None)
ap.add_argument("--clips", default=",".join(CLIPS))
ap.add_argument("--onset", type=float, default=0.5)
ap.add_argument("--frame", type=float, default=0.3)
ap.add_argument("--minlen", type=float, default=127.70)
ap.add_argument("--no-melodia", action="store_true")
ap.add_argument("--multi-bends", action="store_true")
a = ap.parse_args()

import numpy as np  # noqa: E402
import basic_pitch  # noqa: E402
from basic_pitch import build_icassp_2022_model_path, FilenameSuffix  # noqa: E402
from basic_pitch.inference import Model, predict, save_note_events  # noqa: E402

os.makedirs(a.outdir, exist_ok=True)
t0 = time.perf_counter()
model_path = build_icassp_2022_model_path(FilenameSuffix[a.backend])
model = Model(model_path)
t_load = time.perf_counter() - t0
settings = dict(onset_threshold=a.onset, frame_threshold=a.frame, minimum_note_length=a.minlen,
                minimum_frequency=a.fmin, maximum_frequency=a.fmax, multiple_pitch_bends=a.multi_bends,
                melodia_trick=not a.no_melodia)
rec = {"tag": a.tag, "backend": a.backend, "model_path": str(model_path), "model_type": str(model.model_type),
       "settings": settings, "model_load_s": round(t_load, 3), "clips": {}}
for clip in a.clips.split(","):
    path = CLIPS[clip]
    t1 = time.perf_counter()
    model_output, midi_data, note_events = predict(path, model, **settings)
    dt = time.perf_counter() - t1
    midi_data.write(os.path.join(a.outdir, f"{clip}.mid"))
    save_note_events(note_events, os.path.join(a.outdir, f"{clip}.notes.csv"))
    np.savez_compressed(os.path.join(a.outdir, f"{clip}.model_output.npz"), **model_output)
    n_bend = sum(len(i.pitch_bends) for i in midi_data.instruments)
    rec["clips"][clip] = {"input": path, "predict_s": round(dt, 3), "n_notes": len(note_events),
                          "midi_instruments": len(midi_data.instruments), "midi_pitch_bend_events": n_bend,
                          "model_output_shapes": {k: list(v.shape) for k, v in model_output.items()}}
    print(clip, rec["clips"][clip], flush=True)
with open(os.path.join(a.outdir, "timings.json"), "w") as f:
    json.dump(rec, f, indent=1)
