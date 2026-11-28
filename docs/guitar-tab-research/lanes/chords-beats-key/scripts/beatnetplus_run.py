"""BeatNet+ (mjhydri/BeatNet-Plus): beats and downbeats per clip, for Aaron's steps (for-aaron.md, section 12).

Written in gap round 2 and NOT run on the research box: BeatNet+ installs from its cloned repository, whose code the
box's permission system refuses to run. The calls are the ones the BeatNet+ README gives (read 2026-11-11,
https://raw.githubusercontent.com/mjhydri/BeatNet-Plus/main/README.md) and the constructor signature in
src/BeatNetPlus/inference.py at commit bb90eb0:
  BeatNetPlusInference(weights, mode='online', inference_model='PF', plot=[], device='cpu', ...)
  output = estimator.process(path)   # numpy array (num_beats, 2): time in seconds, 1 = downbeat / 2 = other beat
The offline DBN in that file is madmom's DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=50,
observation_lambda=16). numpy's global seed is set to 0 before each run, as in this lane's BeatNet glue
(beatnet_run.py), because the particle filter draws random numbers.

Usage, from the root of the BeatNet-Plus clone, in the environment of for-aaron.md section 12:
  python beatnetplus_run.py --audio clips/S3.wav --outdir out/S3
Writes, for each weights file (generic, af_non_percussive) and each mode (online PF, offline DBN):
  bnp_<weights>_<mode>.txt (raw rows), beats_bnp_<weights>_<mode>.txt and downbeats_bnp_<weights>_<mode>.txt
  (one time per line), and timings_bnp.json (seconds per run, from time.perf_counter).
"""
import argparse
import json
import os
import time

WEIGHTS = {
    "generic": "src/BeatNetPlus/models/generic_weights.pt",
    "af_non_percussive": "src/BeatNetPlus/models/af_non_percussive_weights.pt",
}
MODES = (("online", "PF"), ("offline", "DBN"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--device", default="cpu")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import numpy as np
    import torch
    from BeatNetPlus.inference import BeatNetPlusInference
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "device": a.device,
           "import_s": round(time.perf_counter() - t0, 3), "audio": os.path.basename(a.audio)}
    for wname, wpath in WEIGHTS.items():
        for mode, inf in MODES:
            np.random.seed(0)
            t = time.perf_counter()
            est = BeatNetPlusInference(wpath, mode=mode, inference_model=inf, device=a.device)
            out = est.process(a.audio)
            tag = "%s_%s" % (wname, mode)
            tim["%s_s" % tag] = round(time.perf_counter() - t, 3)
            out = np.asarray(out).reshape(-1, 2) if len(out) else np.zeros((0, 2))
            np.savetxt(os.path.join(a.outdir, "bnp_%s.txt" % tag), out, fmt=["%.3f", "%d"], delimiter="\t")
            np.savetxt(os.path.join(a.outdir, "beats_bnp_%s.txt" % tag), out[:, 0], fmt="%.3f")
            np.savetxt(os.path.join(a.outdir, "downbeats_bnp_%s.txt" % tag), out[out[:, 1] == 1, 0], fmt="%.3f")
            tim["n_rows_%s" % tag] = int(len(out))
            tim["n_downbeats_%s" % tag] = int((out[:, 1] == 1).sum())
    with open(os.path.join(a.outdir, "timings_bnp.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
