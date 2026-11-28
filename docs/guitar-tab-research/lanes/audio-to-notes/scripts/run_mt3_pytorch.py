"""Gap round 1: mt3-pytorch (kunato/mt3-pytorch, commit e203122) on the shared clips, CPU only.

Follows the repository README's usage:
    from inference import InferenceHandler
    handler = InferenceHandler('./pretrained')
    handler.inference('music.mp3')
with device=cpu (the class defaults to cuda) and an explicit output path.

usage: python run_mt3_pytorch.py <clone dir> <pretrained dir> <out dir> <clip.wav> [<clip.wav> ...]
Writes <out dir>/<clip id>.mid and <out dir>/timings.json (seconds per clip, model load separately).
"""
import json
import os
import sys
import time

clone, pretrained, outdir = sys.argv[1:4]
clips = sys.argv[4:]
sys.path.insert(0, clone)
os.makedirs(outdir, exist_ok=True)

import torch  # noqa: E402

torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
t0 = time.perf_counter()
from inference import InferenceHandler  # noqa: E402

handler = InferenceHandler(pretrained, device=torch.device("cpu"))
timings = {"model_load_s": round(time.perf_counter() - t0, 3), "clips": {}}
print("model loaded", timings["model_load_s"], flush=True)
for path in clips:
    cid = os.path.basename(path).split(".")[0]
    t = time.perf_counter()
    handler.inference(path, outpath=os.path.join(outdir, f"{cid}.mid"))
    timings["clips"][cid] = round(time.perf_counter() - t, 3)
    print(cid, timings["clips"][cid], flush=True)
with open(os.path.join(outdir, "timings.json"), "w") as f:
    json.dump(timings, f, indent=1)
