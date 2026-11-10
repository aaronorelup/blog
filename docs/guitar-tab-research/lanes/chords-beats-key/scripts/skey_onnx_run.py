"""S-KEY (Deezer) global key estimation through the community ONNX export on Hugging Face (aaatmy/skey-onnx),
run with onnxruntime. No code from the S-KEY repository is run.

Usage: venv-skey/bin/python -I skey_onnx_run.py --audio <wav> --outdir <dir> --model-dir <dir with skey.onnx, manifest.json>

Glue written for this lane, following upstream skey/key_detection.py (load_audio, infer_key) as read at
raw.githubusercontent.com/deezer/skey/main/skey/key_detection.py on 2026-11-10:
  - decode the file with soundfile (upstream: torchaudio.load(path, backend="soundfile"));
  - resample to the manifest's sample rate (22050 Hz) with torchaudio.transforms.Resample(orig_freq, new_freq)
    (upstream uses the same call with its default arguments);
  - average the channels (upstream: torch.mean(waveform, dim=0, keepdim=True));
  - pass float32 audio of shape [1, samples] to the ONNX graph. Per the model card, peak normalization,
    VQT/dB preprocessing, frequency cropping and ChromaNet are inside the graph and the output `scores` [1, 24]
    already includes the softmax;
  - label = manifest["labels"][argmax(scores)] (upstream: key_map[int(torch.mean(logits, dim=0).argmax())]).
Writes key_skey.txt ("<tonic> major|minor", the form gtr-eval reads), skey.json (all 24 scores, the label order,
model file SHA-256, timings).
"""
import argparse
import hashlib
import json
import os
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--model-dir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    T = {}
    t0 = time.perf_counter()
    import numpy as np
    import soundfile as sf
    import torch
    import torchaudio
    import onnxruntime as ort
    T["import_s"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    man = json.load(open(os.path.join(a.model_dir, "manifest.json")))
    onnx_path = os.path.join(a.model_dir, man["model_file"])
    sha = hashlib.sha256(open(onnx_path, "rb").read()).hexdigest()
    sess = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    in_name = sess.get_inputs()[0].name
    T["load_model_s"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    x, sr = sf.read(a.audio, dtype="float32", always_2d=True)      # [samples, channels]
    w = torch.from_numpy(x.T.copy())                                 # [channels, samples]
    target = int(man["sample_rate"])
    if sr != target:
        w = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target)(w)
    if w.shape[0] > 1:
        w = torch.mean(w, dim=0, keepdim=True)
    audio = w.numpy().astype(np.float32)                             # [1, samples]
    T["load_resample_s"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    scores = sess.run(None, {in_name: audio})[0]
    T["inference_s"] = round(time.perf_counter() - t0, 3)

    s = np.asarray(scores).reshape(-1)
    idx = int(np.argmax(s))
    label = man["labels"][idx]                                       # e.g. "G Major", "B minor"
    tonic, mode = label.split()
    key_str = "%s %s" % (tonic, mode.lower())
    with open(os.path.join(a.outdir, "key_skey.txt"), "w") as f:
        f.write(key_str + "\n")
    out = {"input": os.path.abspath(a.audio), "input_sr": sr, "model_sr": target, "n_samples_in": int(audio.shape[1]),
           "onnx_sha256": sha, "manifest_sha256": man.get("sha256"), "label": label, "key": key_str,
           "argmax_index": idx, "score_max": float(s[idx]), "scores": [float(v) for v in s],
           "labels": man["labels"], "input_name": in_name, "onnxruntime": ort.__version__,
           "torch": torch.__version__, "torchaudio": torchaudio.__version__, "timings": T,
           "torch_threads": torch.get_num_threads()}
    json.dump(out, open(os.path.join(a.outdir, "skey.json"), "w"), indent=1)
    print(json.dumps({"key": key_str, "score": round(float(s[idx]), 4), "timings": T}))


if __name__ == "__main__":
    main()
