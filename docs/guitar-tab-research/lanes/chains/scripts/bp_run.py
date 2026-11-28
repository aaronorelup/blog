"""Basic Pitch 0.4.0 through its Python API on explicit files, the audio-to-notes lane's defaults (TFLite model).

usage: python bp_run.py <outdir> <label>=<audio path> [<label>=<audio path> ...]
Writes per file: <label>.mid, <label>.notes.csv (Basic Pitch's note-events layout), and timings.json with the
model load time and each predict() time (time.perf_counter). Same settings as the audio-to-notes lane's
run_basic_pitch_py.py with no options: onset 0.5, frame 0.3, minimum note length 127.70 ms, no frequency limits,
melodia trick on, one pitch-bend track.
"""
import json
import os
import sys
import time

from basic_pitch import build_icassp_2022_model_path, FilenameSuffix
from basic_pitch.inference import Model, predict, save_note_events

outdir = sys.argv[1]
os.makedirs(outdir, exist_ok=True)
t0 = time.perf_counter()
model_path = build_icassp_2022_model_path(FilenameSuffix["tflite"])
model = Model(model_path)
settings = dict(onset_threshold=0.5, frame_threshold=0.3, minimum_note_length=127.70, minimum_frequency=None,
                maximum_frequency=None, multiple_pitch_bends=False, melodia_trick=True)
rec = {"backend": "tflite", "model_path": str(model_path), "settings": settings,
       "model_load_s": round(time.perf_counter() - t0, 3), "files": {}}
for arg in sys.argv[2:]:
    label, path = arg.split("=", 1)
    t1 = time.perf_counter()
    model_output, midi_data, note_events = predict(path, model, **settings)
    dt = time.perf_counter() - t1
    midi_data.write(os.path.join(outdir, f"{label}.mid"))
    save_note_events(note_events, os.path.join(outdir, f"{label}.notes.csv"))
    rec["files"][label] = {"input": path, "predict_s": round(dt, 3), "n_notes": len(note_events)}
    print(label, rec["files"][label], flush=True)
with open(os.path.join(outdir, "timings.json"), "w") as f:
    json.dump(rec, f, indent=1)
