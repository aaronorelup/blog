"""BeatNet 1.1.3 (PyPI, installed with --no-deps): beats and downbeats, offline (madmom DBN) and online (particle filter).

Usage (venv-beatnet, Python 3.11, torch 2.15.0+cpu, numpy 1.23.5, librosa 0.10.2.post1, madmom 0.16.1 with the one-line
collections.abc import fix described in trials.md, pyaudio 0.2.14):
  python -I beatnet_run.py --audio <file.wav> --outdir <dir> [--model 1]
Runs BeatNet(model, mode='offline', inference_model='DBN', plot=[], thread=False, device='cpu').process(path) and
BeatNet(model, mode='online', inference_model='PF', ...).process(path). numpy's global random seed is set to 0 before
each run (the particle filter draws random numbers). Both return an array of rows (time in seconds, position):
position 1 marks a downbeat (DBN: madmom's beat-in-bar counter; PF: 1 = downbeat, 2 = other beat).
Writes beats_beatnet_<mode>.txt and downbeats_beatnet_<mode>.txt (one time per line), beatnet_<mode>.txt (raw rows),
timings_beatnet.json.
"""
import argparse
import json
import os
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--model", type=int, default=1)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import numpy as np
    import torch
    from BeatNet.BeatNet import BeatNet
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "import_s": round(time.perf_counter() - t0, 3),
           "model": a.model}
    for mode, inf in (("offline", "DBN"), ("online", "PF")):
        np.random.seed(0)
        t = time.perf_counter()
        est = BeatNet(a.model, mode=mode, inference_model=inf, plot=[], thread=False, device="cpu")
        out = est.process(a.audio)
        tim["%s_%s_s" % (mode, inf)] = round(time.perf_counter() - t, 3)
        out = np.asarray(out).reshape(-1, 2) if len(out) else np.zeros((0, 2))
        np.savetxt(os.path.join(a.outdir, "beatnet_%s.txt" % mode), out, fmt=["%.3f", "%d"], delimiter="\t")
        np.savetxt(os.path.join(a.outdir, "beats_beatnet_%s.txt" % mode), out[:, 0], fmt="%.3f")
        np.savetxt(os.path.join(a.outdir, "downbeats_beatnet_%s.txt" % mode), out[out[:, 1] == 1, 0], fmt="%.3f")
        tim["n_rows_%s" % mode] = int(len(out))
        tim["n_downbeats_%s" % mode] = int((out[:, 1] == 1).sum())
        tim["positions_%s" % mode] = sorted(set(int(x) for x in out[:, 1]))
    with open(os.path.join(a.outdir, "timings_beatnet.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
