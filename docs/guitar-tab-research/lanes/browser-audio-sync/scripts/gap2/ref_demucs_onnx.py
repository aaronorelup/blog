"""Native reference for the browser run of htdemucs_6s: demucs-onnx 0.3.4's own code path on a local model file.

usage: python -I ref_demucs_onnx.py <model.onnx> <input.wav> <out dir>

Uses the PyPI package's functions unchanged: demucs_onnx._audio.load_audio (soundfile, float32, stereo),
demucs_onnx.inference._make_session (ORT_ENABLE_ALL, the given providers) and
demucs_onnx.inference._chunked_separate_single (7.8 s chunks, quarter overlap, linspace fade window), with the stem
order from demucs_onnx._hub.MODEL_REGISTRY["htdemucs_6s"]. The only difference from `demucs-onnx separate --model
htdemucs_6s --small` is that the model is read from the given path instead of being downloaded again. Writes each stem
as 32-bit float WAV (soundfile subtype FLOAT) and ref.json (timings, session inputs and outputs).
"""
import json
import os
import sys
import time

import numpy as np
import onnxruntime as ort
import soundfile as sf
from demucs_onnx._audio import load_audio
from demucs_onnx._hub import MODEL_REGISTRY
from demucs_onnx.inference import _chunked_separate_single, _make_session

model_path, wav, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
audio, sr = load_audio(wav, target_sr=44100)
t0 = time.perf_counter()
sess = _make_session(model_path, ["CPUExecutionProvider"])
t_create = time.perf_counter() - t0
sources = tuple(MODEL_REGISTRY["htdemucs_6s"].sources)
t1 = time.perf_counter()
stems = _chunked_separate_single(sess, sources, audio, verbose=True, progress=False)
t_sep = time.perf_counter() - t1
for s, a in stems.items():
    sf.write(os.path.join(out, f"{s}.wav"), a.T, 44100, subtype="FLOAT")
res = {
    "onnxruntime": ort.__version__, "numpy": np.__version__, "providers": sess.get_providers(),
    "inputs": [{"name": i.name, "shape": i.shape, "type": i.type} for i in sess.get_inputs()],
    "outputs": [{"name": o.name, "shape": o.shape, "type": o.type} for o in sess.get_outputs()],
    "sources": list(sources), "input_shape": list(audio.shape), "native_sr": sr,
    "session_create_s": round(t_create, 3), "separate_s": round(t_sep, 3),
    "affinity": sorted(os.sched_getaffinity(0)),
}
with open(os.path.join(out, "ref.json"), "w") as f:
    json.dump(res, f, indent=1)
print(json.dumps(res))
