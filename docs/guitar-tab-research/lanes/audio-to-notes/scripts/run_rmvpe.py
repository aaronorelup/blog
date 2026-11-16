"""Gap round 1: RMVPE through the PyPI wrapper rmvpe-onnx 0.2.3 (ONNX Runtime, CPU).

usage: python run_rmvpe.py <rmvpe.onnx> <out dir> <clip.wav> [<clip.wav> ...]

For each clip: soundfile.read (as the package's CLI does), RMVPE(model_path, device="cpu").predict(audio, sr),
then writes <out dir>/f0/<clip id>.f0.csv = time_s,frequency_hz,confidence with the raw outputs (no threshold;
the README: "The Python API returns raw outputs with no confidence thresholding applied"), and
<out dir>/timings.json (model setup and per-clip seconds of predict(), audio reading excluded) plus facts about
the output arrays.
"""
import json
import os
import sys
import time

import numpy as np
import soundfile as sf

model, outdir = sys.argv[1:3]
clips = sys.argv[3:]
os.makedirs(os.path.join(outdir, "f0"), exist_ok=True)

import onnxruntime as ort  # noqa: E402
import rmvpe_onnx  # noqa: E402
from rmvpe_onnx import RMVPE  # noqa: E402

t0 = time.perf_counter()
rmvpe = RMVPE(model_path=model, device="cpu")
info = {
    "rmvpe_onnx_version": rmvpe_onnx.__version__,
    "onnxruntime_version": ort.__version__,
    "provider": rmvpe.session.get_providers()[0],
    "model_setup_s": round(time.perf_counter() - t0, 3),
    "model_input": [(i.name, i.shape, i.type) for i in rmvpe.session.get_inputs()],
    "model_output": [(o.name, o.shape, o.type) for o in rmvpe.session.get_outputs()],
    "lowest_bin_hz": float(10 * 2 ** (rmvpe.cents_mapping[4] / 1200)),
    "highest_bin_hz": float(10 * 2 ** (rmvpe.cents_mapping[4 + 359] / 1200)),
    "clips": {},
}
for path in clips:
    cid = os.path.basename(path).split(".")[0]
    if "/stems/" in path:
        cid = os.path.basename(os.path.dirname(os.path.dirname(path))) + os.path.basename(path).split(".")[0]
    audio, sr = sf.read(path, always_2d=False)
    t = time.perf_counter()
    tm, f0, conf, act = rmvpe.predict(audio, sr)
    dt = time.perf_counter() - t
    np.savetxt(os.path.join(outdir, "f0", f"{cid}.f0.csv"), np.vstack([tm, f0, conf]).T,
               fmt=["%.3f", "%.3f", "%.6f"], delimiter=",", header="time_s,frequency_hz,confidence", comments="")
    info["clips"][cid] = {
        "input": path, "sr_in": sr, "channels_in": 1 if audio.ndim == 1 else audio.shape[1],
        "predict_s": round(dt, 3), "frames": int(len(f0)), "activation_shape": list(act.shape),
        "hop_s": float(tm[1] - tm[0]) if len(tm) > 1 else None,
        "f0_min_hz": float(f0.min()), "f0_max_hz": float(f0.max()),
        "confidence_min": float(conf.min()), "confidence_max": float(conf.max()),
        "frames_conf_ge_0.03": int((conf >= 0.03).sum()), "frames_conf_ge_0.5": int((conf >= 0.5).sum()),
    }
    print(cid, info["clips"][cid]["predict_s"], len(f0), flush=True)
with open(os.path.join(outdir, "timings.json"), "w") as f:
    json.dump(info, f, indent=1)
