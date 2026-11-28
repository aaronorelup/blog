"""DeepRhythm 0.0.13 (PyPI): one global tempo per file with a confidence.

Usage (venv-deeprhythm, Python 3.11, torch 2.15.0+cpu):
  python -I deeprhythm_run.py --audio <file.wav> --outdir <dir>
The package looks for its weights at ~/.local/share/deeprhythm/deeprhythm-0.7.pth and otherwise downloads them from
github.com, which this box's proxy refuses (HTTP 403). The same file was fetched from
https://raw.githubusercontent.com/bleugreen/deeprhythm/main/deeprhythm-0.7.pth (sha256 c7cc8cc0...b3d9c4) into the lane
folder, and HOME is pointed there before the package reads it.
Calls DeepRhythmPredictor(device="cpu", quiet=True).predict(file, include_confidence=True) -> (bpm, confidence).
The package loads audio at 22050 Hz and splits it into 8 s clips (deeprhythm.utils.load_and_split_audio).
Writes tempo_deeprhythm.txt (one number, BPM), deeprhythm.json, timings_deeprhythm.json.
"""
import argparse
import json
import os
import time

HOME = "/home/user/gtr/lanes/chords-beats-key/models/deeprhythm_home"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    os.environ["HOME"] = HOME
    t0 = time.perf_counter()
    import torch
    from deeprhythm import DeepRhythmPredictor
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "import_s": round(time.perf_counter() - t0, 3)}
    t = time.perf_counter()
    m = DeepRhythmPredictor(device="cpu", quiet=True)
    tim["load_s"] = round(time.perf_counter() - t, 3)
    t = time.perf_counter()
    bpm, conf = m.predict(a.audio, include_confidence=True)
    tim["predict_s"] = round(time.perf_counter() - t, 3)
    with open(os.path.join(a.outdir, "tempo_deeprhythm.txt"), "w") as f:
        f.write("%.3f\n" % bpm)
    with open(os.path.join(a.outdir, "deeprhythm.json"), "w") as f:
        json.dump({"bpm": float(bpm), "confidence": float(conf), "weights": m.model_path}, f, indent=1)
    tim["outputs"] = {"bpm": float(bpm), "confidence": float(conf)}
    with open(os.path.join(a.outdir, "timings_deeprhythm.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
