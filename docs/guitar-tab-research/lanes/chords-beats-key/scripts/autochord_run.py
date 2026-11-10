"""autochord 0.1.4 (PyPI): NNLS Chroma (Vamp) features + a Bi-LSTM-CRF TensorFlow model, 25 classes (12 maj, 12 min, N).

Usage (venv-tf, Python 3.11, tensorflow-cpu 2.12.1, vamp 1.1.0; autochord installed with --no-deps):
  python -I autochord_run.py --audio <file.wav> --outdir <dir>
On import autochord copies its bundled nnls-chroma.so into the first Vamp plugin directory and downloads its model
from Google Drive into ~/.autochord. To keep both inside the lane folder, HOME and VAMP_PATH are pointed at
/home/user/gtr/lanes/chords-beats-key/models/autochord_home before the import (the model was downloaded there by a
first import, see trials.md).
Calls autochord.recognize(audio, lab_fn=<outdir>/chords_autochord.lab) -> list of (start, end, label).
"""
import argparse
import json
import os
import time

HOME = "/home/user/gtr/lanes/chords-beats-key/models/autochord_home"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    os.environ["HOME"] = HOME
    os.environ["VAMP_PATH"] = os.path.join(HOME, "vamp")
    t0 = time.perf_counter()
    import autochord
    tim = {"import_and_model_load_s": round(time.perf_counter() - t0, 3)}
    t = time.perf_counter()
    res = autochord.recognize(a.audio, lab_fn=os.path.join(a.outdir, "chords_autochord.lab"))
    tim["recognize_s"] = round(time.perf_counter() - t, 3)
    tim["outputs"] = {"n_segments": len(res), "labels": sorted(set(r[2] for r in res)),
                      "first": [[round(float(r[0]), 3), round(float(r[1]), 3), r[2]] for r in res[:5]]}
    with open(os.path.join(a.outdir, "timings_autochord.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
