#!/usr/bin/env python3
"""gap2_guitar_ft.py: run `adityalakhani/htdemucs-6s-guitar-ft` (or the stock htdemucs_6s) the way the model repo's
`inference.py` does, with demucs 4.1.0 from PyPI (gap round 2).

Usage:  <venv-demucs>/bin/python gap2_guitar_ft.py --input X.wav --outdir DIR [--checkpoint guitar_htdemucs_6s.pt]
                                                   [--shifts 1] [--overlap 0.25] [--segment 7.8] [--seed 0]

Steps copied from the repo's inference.py (read, not run, 2026-11-11): `get_model("htdemucs_6s")`;
`torch.load(checkpoint, map_location=device, weights_only=True)`; take `model_state_dict` when the file is a training
snapshot; prefix the keys with "models.0." when they do not match the BagOfModels wrapper; `load_state_dict`; read
the audio with soundfile (stereo float32; mono repeated, extra channels dropped); no input normalisation;
`apply_model(model, mix, shifts=1, segment=7.8, overlap=0.25, device=...)`; clamp to [-1, 1]; write PCM_24. The
repo's script writes only source index 4 (guitar); this one writes all six sources so it can be seen where the
guitar went. Without --checkpoint the stock htdemucs_6s weights run through the same steps (a control).
Differences from the repo's script: demucs 4.1.0 instead of the pinned 4.0.1, no resampling step (all inputs here
are 44.1 kHz), Python's random generator seeded (--seed) so the random shift can be repeated.
"""
import argparse
import json
import os
import random
import sys
import time

import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--checkpoint", default=None)
    ap.add_argument("--shifts", type=int, default=1)
    ap.add_argument("--overlap", type=float, default=0.25)
    ap.add_argument("--segment", type=float, default=7.8)
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()
    random.seed(a.seed)
    torch.manual_seed(a.seed)
    info = {"input": os.path.abspath(a.input), "checkpoint": a.checkpoint, "shifts": a.shifts,
            "overlap": a.overlap, "segment": a.segment, "seed": a.seed, "torch_threads": torch.get_num_threads()}
    t0 = time.time()
    model = get_model("htdemucs_6s")
    if a.checkpoint:
        ck = torch.load(a.checkpoint, map_location="cpu", weights_only=True)
        if isinstance(ck, dict) and "model_state_dict" in ck:
            info["checkpoint_keys"] = sorted(k for k in ck if k != "model_state_dict" and k != "optimizer_state_dict")
            info["checkpoint_meta"] = {k: (v if isinstance(v, (int, float, str)) else str(type(v)))
                                       for k, v in ck.items() if k not in ("model_state_dict", "optimizer_state_dict")}
            sd = ck["model_state_dict"]
        else:
            sd = ck
        wrapper_keys = set(model.state_dict().keys())
        if not any(k in wrapper_keys for k in list(sd.keys())[:3]):
            sd = {f"models.0.{k}": v for k, v in sd.items()}
            info["keys_prefixed"] = True
        res = model.load_state_dict(sd)
        info["load_state_dict"] = str(res)
        info["n_tensors_loaded"] = len(sd)
    model.eval()
    info["sources"] = list(model.sources)
    info["load_s"] = round(time.time() - t0, 2)
    audio, sr = sf.read(a.input, always_2d=True, dtype="float32")
    wav = torch.from_numpy(audio.T.copy())
    if wav.shape[0] == 1:
        wav = wav.repeat(2, 1)
    elif wav.shape[0] > 2:
        wav = wav[:2]
    if sr != 44100:
        sys.exit(f"input is {sr} Hz; this script expects 44.1 kHz")
    t1 = time.time()
    with torch.no_grad():
        out = apply_model(model, wav.unsqueeze(0), shifts=a.shifts, segment=a.segment, overlap=a.overlap,
                          device="cpu", progress=False)
    info["separate_s"] = round(time.time() - t1, 2)
    os.makedirs(a.outdir, exist_ok=True)
    for i, name in enumerate(model.sources):
        y = out[0, i].clamp(-1.0, 1.0)
        sf.write(os.path.join(a.outdir, f"{name}.wav"), y.T.numpy(), 44100, subtype="PCM_24")
    with open(os.path.join(a.outdir, "run_info.json"), "w") as f:
        json.dump(info, f, indent=1)
    print(json.dumps(info), flush=True)


if __name__ == "__main__":
    main()
