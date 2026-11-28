"""Beat This! (beat-this 1.1.0 from PyPI): beats and downbeats.

Usage (venv-beatthis, Python 3.11, torch 2.15.0+cpu):
  python -I beatthis_run.py --audio <file.wav> --outdir <dir> [--checkpoint final0] [--dbn]

beat_this.inference.File2Beats(checkpoint_path=<ckpt>, device="cpu", float16=False, dbn=False) returns two numpy arrays
of times in seconds (beats, downbeats). Default post-processing "minimal" (peak picking, no madmom).
Writes <outdir>/<ckpt>_beats.txt, <ckpt>_downbeats.txt (one time per line), <ckpt>.json, timings_<ckpt>.json.
"""
import argparse
import json
import os
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--checkpoint", default="final0")
    ap.add_argument("--dbn", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import numpy as np
    import torch
    from beat_this.inference import File2Beats
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "import_s": round(time.perf_counter() - t0, 3)}
    t = time.perf_counter()
    f2b = File2Beats(checkpoint_path=a.checkpoint, device="cpu", float16=False, dbn=a.dbn)
    tim["load_model_s"] = round(time.perf_counter() - t, 3)
    t = time.perf_counter()
    beats, downbeats = f2b(a.audio)
    tim["inference_s"] = round(time.perf_counter() - t, 3)
    tag = a.checkpoint + ("_dbn" if a.dbn else "")
    np.savetxt(os.path.join(a.outdir, tag + "_beats.txt"), beats, fmt="%.3f")
    np.savetxt(os.path.join(a.outdir, tag + "_downbeats.txt"), downbeats, fmt="%.3f")
    with open(os.path.join(a.outdir, tag + ".json"), "w") as f:
        json.dump({"beats": [round(float(x), 3) for x in beats], "downbeats": [round(float(x), 3) for x in downbeats]}, f)
    tim["outputs"] = {"n_beats": int(len(beats)), "n_downbeats": int(len(downbeats)),
                      "median_ibi_bpm": round(60.0 / float(np.median(np.diff(beats))), 2) if len(beats) > 2 else None}
    with open(os.path.join(a.outdir, "timings_%s.json" % tag), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
