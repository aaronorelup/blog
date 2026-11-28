"""Classify audio windows with the IRCAM electric-guitar playing-technique model eguitar_ircam.ts (TorchScript).

Usage: python gap2_ipt_classify.py <model.ts> <out dir> <clip id>...   (clip ids: S6taps, S2s, R3c, ...)
Model contract (Hugging Face card nbrochec/ipt_models): input (batch, 1, segment_length) float32 raw audio, output
logits (batch, num_classes); methods get_sr(), get_seglen(), get_classnames().
Per clip: /home/user/gtr/inputs/<id>/<id>.mono.wav is read with soundfile, resampled to get_sr() (8000 Hz) with
scipy.signal.resample_poly, and cut into windows of get_seglen() samples (7168 = 896 ms) that END at
t = seglen/sr + k * 0.1 s (k = 0, 1, ...), i.e. each window is the 896 ms of audio before t, as libipt classifies
the last get_seglen() samples it has buffered. All windows of a clip go through one batched forward pass; softmax over
the logits as in libipt's core/model.h. libipt's energy gate and a host's smoothing are NOT applied; the RMS of each
window is written so a gate can be applied afterwards (the libipt README example uses -60 dB).
Writes <out>/<id>.windows.csv (t_end_s, rms_dbfs, top class, top probability, one probability column per class) and
<out>/summary.json. For clips with truth taps (S6taps) each window is also marked when a truth tap lies in its last
0.2 s, (t - 0.2, t]. For S6taps and S2s (same notes, S2s without taps) the windows are paired by t.
"""
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly

model_path, out = sys.argv[1], sys.argv[2]
clips = sys.argv[3:]
os.makedirs(out, exist_ok=True)
torch.set_grad_enabled(False)
t0 = time.time()
model = torch.jit.load(model_path, map_location="cpu")
model.eval()
t_load = time.time() - t0
sr, seglen, classes = int(model.get_sr()), int(model.get_seglen()), list(model.get_classnames())
summary = {"model": model_path, "torch": torch.__version__, "threads": torch.get_num_threads(), "sr": sr,
           "seglen": seglen, "classes": classes, "load_seconds": round(t_load, 3), "hop_s": 0.1, "clips": {}}
print(json.dumps({k: summary[k] for k in ("sr", "seglen", "classes", "load_seconds", "threads")}), flush=True)
probs_by_clip, t_by_clip = {}, {}
for cid in clips:
    path = f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav"
    y, in_sr = sf.read(path, dtype="float64", always_2d=True)
    y = y.mean(axis=1)
    g = np.gcd(int(in_sr), sr)
    x = resample_poly(y, sr // g, int(in_sr) // g).astype(np.float32)
    hop = int(round(0.1 * sr))
    ends = np.arange(seglen, len(x) + 1, hop)
    win = np.stack([x[e - seglen:e] for e in ends])
    rms_db = 20 * np.log10(np.sqrt(np.mean(win.astype(np.float64) ** 2, axis=1)) + 1e-12)
    t1 = time.time()
    logits = model(torch.from_numpy(win).unsqueeze(1))
    t_fwd = time.time() - t1
    p = torch.softmax(logits, dim=-1).numpy().astype(np.float64)
    t_end = ends / sr
    top = p.argmax(axis=1)
    taps = None
    truth_path = f"/home/user/gtr/inputs/{cid}/{cid}.truth.json"
    with open(truth_path) as f:
        truth = json.load(f)
    if truth.get("taps"):
        tt = np.array([tp["time"] for tp in truth["taps"]])
        taps = np.array([bool(np.any((tt > t - 0.2) & (tt <= t))) for t in t_end])
    with open(os.path.join(out, f"{cid}.windows.csv"), "w") as f:
        f.write("t_end_s,rms_dbfs,top_class,top_prob," + ",".join(classes) + (",tap_in_last_0.2s" if taps is not None else "") + "\n")
        for i in range(len(t_end)):
            row = [f"{t_end[i]:.3f}", f"{rms_db[i]:.2f}", classes[top[i]], f"{p[i, top[i]]:.4f}"] + [f"{v:.4f}" for v in p[i]]
            if taps is not None:
                row.append(str(int(taps[i])))
            f.write(",".join(row) + "\n")
    gate = rms_db >= -60.0
    s = {"input": path, "input_sr": int(in_sr), "n_windows": int(len(t_end)), "forward_seconds_batched": round(t_fwd, 3),
         "top1_counts_all": {c: int(np.sum(top == i)) for i, c in enumerate(classes) if np.sum(top == i)},
         "mean_prob_all": {c: round(float(p[:, i].mean()), 4) for i, c in enumerate(classes)},
         "n_windows_rms_ge_-60dBFS": int(gate.sum()),
         "top1_counts_rms_ge_-60dBFS": {c: int(np.sum(top[gate] == i)) for i, c in enumerate(classes) if np.sum(top[gate] == i)}}
    if taps is not None:
        s["n_windows_tap_in_last_0.2s"] = int(taps.sum())
        for lab, m in (("tap_in_last_0.2s", taps & gate), ("no_tap_in_last_0.2s", (~taps) & gate)):
            s[f"mean_prob_{lab}_rms_ge_-60dBFS"] = {c: round(float(p[m, i].mean()), 4) for i, c in enumerate(classes)}
            s[f"top1_counts_{lab}_rms_ge_-60dBFS"] = {c: int(np.sum(top[m] == i)) for i, c in enumerate(classes) if np.sum(top[m] == i)}
    summary["clips"][cid] = s
    probs_by_clip[cid], t_by_clip[cid] = p, t_end
    print(json.dumps({cid: s}), flush=True)

if "S6taps" in probs_by_clip and "S2s" in probs_by_clip:
    a, b = probs_by_clip["S6taps"], probs_by_clip["S2s"]
    n = min(len(a), len(b))
    assert np.allclose(t_by_clip["S6taps"][:n], t_by_clip["S2s"][:n])
    cmp = {"n_paired_windows": int(n),
           "same_top1": int(np.sum(a[:n].argmax(1) == b[:n].argmax(1))),
           "mean_abs_prob_difference": {c: round(float(np.abs(a[:n, i] - b[:n, i]).mean()), 4) for i, c in enumerate(classes)},
           "mean_prob_S6taps_minus_S2s": {c: round(float((a[:n, i] - b[:n, i]).mean()), 4) for i, c in enumerate(classes)}}
    summary["S6taps_vs_S2s"] = cmp
    print(json.dumps({"S6taps_vs_S2s": cmp}), flush=True)
with open(os.path.join(out, "summary.json"), "w") as f:
    json.dump(summary, f, indent=1)
