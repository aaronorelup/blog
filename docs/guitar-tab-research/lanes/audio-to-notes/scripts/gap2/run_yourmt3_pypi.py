"""Gap round 2: the third-party PyPI package `yourmt3` 0.1.4 (YMT3 class, as in its PyPI description) on S2n, R1c and
the S4 guitar stem, CPU, precision "32".

usage: python run_yourmt3_pypi.py <checkpoint .pt> <model_name> <outdir>
The package's YMT3.__init__ builds the model for <model_name> and calls
model.load_state_dict(torch.load(model_path), strict=False), which ignores missing and unexpected keys; this script
compares the checkpoint's keys with the built model's state_dict (read only) and records the counts. Then
YMT3.predict(path, batch_size=8, output_path=...) per clip, timed with time.perf_counter. Writes <outdir>/<clip>.mid
and <outdir>/run_facts.json.
"""
import json
import os
import sys
import time

ckpt, model_name, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)
os.chdir(outdir)  # YourMT3(...) is built with write_output_dir="."

t0 = time.perf_counter()
import torch  # noqa: E402
from yourmt3 import YMT3  # noqa: E402
t_import = time.perf_counter() - t0

t1 = time.perf_counter()
m = YMT3(ckpt, model_name, precision="32", device="cpu")
t_load = time.perf_counter() - t1

sd = torch.load(ckpt)
model_keys = set(m.model.state_dict().keys())
ckpt_keys = set(sd.keys()) if isinstance(sd, dict) else set()
facts = {
    "torch": torch.__version__, "checkpoint": ckpt, "model_name": model_name, "precision": "32", "device": "cpu",
    "import_s": round(t_import, 3), "model_build_and_load_s": round(t_load, 3),
    "checkpoint_type": type(sd).__name__, "checkpoint_keys": len(ckpt_keys), "model_state_keys": len(model_keys),
    "keys_in_both": len(model_keys & ckpt_keys), "model_keys_missing_from_checkpoint": len(model_keys - ckpt_keys),
    "checkpoint_keys_not_in_model": len(ckpt_keys - model_keys),
    "examples_missing": sorted(model_keys - ckpt_keys)[:5], "examples_unexpected": sorted(ckpt_keys - model_keys)[:5],
    "audio_cfg": {k: m.model.audio_cfg[k] for k in ("sample_rate", "input_frames") if k in m.model.audio_cfg},
    "num_decoding_channels": m.model.task_manager.num_decoding_channels,
    "clips": {},
}
del sd
CLIPS = {"S2n": "/home/user/gtr/inputs/S2n/S2n.wav", "R1c": "/home/user/gtr/inputs/R1c/R1c.wav",
         "S4guitar": "/home/user/gtr/inputs/S4/stems/guitar.wav"}
for clip, path in CLIPS.items():
    t2 = time.perf_counter()
    out = m.predict(path, batch_size=8, output_path=os.path.join(outdir, f"{clip}.mid"))
    dt = time.perf_counter() - t2
    facts["clips"][clip] = {"input": path, "predict_s": round(dt, 3), "output": out}
    print(clip, facts["clips"][clip], flush=True)
with open(os.path.join(outdir, "run_facts.json"), "w") as f:
    json.dump(facts, f, indent=1, default=str)
print(json.dumps({k: v for k, v in facts.items() if k != "clips"}, default=str), flush=True)
