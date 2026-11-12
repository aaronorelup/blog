"""Monophonic f0 trackers on the shared clips, one tool per call, one gtr-run per call.

usage: python run_f0.py <tool> <outdir> [--clips S1,S2n,...]
tools: pyin (librosa), swiftf0, torchcrepe-full, torchcrepe-tiny, fcpe (torchfcpe), pesto, penn
Writes per clip <clip>.f0.csv (time_s,frequency_hz,confidence; 0 Hz = no pitch written by the tool) and, where the
tool has its own note segmenter (swiftf0: swift_f0.segment_notes), <clip>.notes.csv; timings.json holds the model
load time and the per-clip time (time.perf_counter, audio loading included) measured inside the one gtr-run.
Settings are written into timings.json. Inputs are read as mono: the clip's (L+R)/2 .mono.wav made by the inputs
builder (S4 stems are mono-mixed here the same way).
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import CLIPS, mono_path, write_f0_csv, write_notes_csv  # noqa: E402

MONO_SET = "S1,S2n,S2s,S4,S4lead,R1b,R2,R3a"
ap = argparse.ArgumentParser()
ap.add_argument("tool")
ap.add_argument("outdir")
ap.add_argument("--clips", default=MONO_SET)
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402


def load_mono(clip):
    y, sr = sf.read(mono_path(clip), dtype="float32", always_2d=True)
    return y.mean(axis=1), sr


rec = {"tool": a.tool, "clips": {}}
t0 = time.perf_counter()
if a.tool == "pyin":
    import librosa
    rec["version"] = librosa.__version__
    SR = 22050
    settings = dict(sr=SR, fmin=float(librosa.note_to_hz("C2")), fmax=float(librosa.note_to_hz("C7")),
                    frame_length=2048, hop_length=512)
    rec["settings"] = dict(settings, note="librosa.load(path, sr=22050, mono=True); librosa.pyin(...) other args default")

    def run(clip):
        y, sr = librosa.load(mono_path(clip), sr=SR, mono=True)
        f0, vflag, vprob = librosa.pyin(y, **settings)
        t = librosa.times_like(f0, sr=SR, hop_length=settings["hop_length"])
        f = np.where(vflag, np.nan_to_num(f0), 0.0)
        return t, f, vprob, None
elif a.tool == "swiftf0":
    import swift_f0
    from swift_f0 import SwiftF0
    from swift_f0.music import segment_notes
    rec["version"] = getattr(swift_f0, "__version__", "0.3.0 (pip)")
    det = SwiftF0(threads=2)
    rec["settings"] = dict(fmin="default 46.875", fmax="default 2093.75", threads=2,
                           segment_notes="pitch_hold_ms=80 (default)", voiced="confidence >= 0.5 (tool's calibration)")

    def run(clip):
        r = det.detect_file(mono_path(clip))
        # pitch_midi = nearest MIDI note of the segmenter's fitted pitch; the fitted pitch itself is kept in Hz
        notes = [(n.start, n.end, int(np.floor(69 + 12 * np.log2(n.pitch_hz / 440.0) + 0.5)), round(float(n.pitch_hz), 3))
                 for n in segment_notes(r)]
        return r.timestamps, r.pitch_hz, r.confidence, notes
elif a.tool.startswith("torchcrepe"):
    import torch
    import torchcrepe
    torch.set_num_threads(2)
    model = a.tool.split("-")[1]
    rec["version"] = "torchcrepe 0.0.24"
    rec["settings"] = dict(model=model, sr="16000 (torchcrepe resamples)", hop_length="160 samples = 10 ms",
                           fmin=50.0, fmax=2006.0, decoder="torchcrepe.decode.viterbi (default)",
                           batch_size=512, device="cpu",
                           confidence="periodicity (raw, no filtering)")

    def run(clip):
        y, sr = load_mono(clip)
        import torchaudio.functional as AF
        x = torch.from_numpy(y)[None]
        if sr != 16000:
            x = AF.resample(x, sr, 16000)
        pitch, per = torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0, fmax=2006.0, model=model,
                                        return_periodicity=True, batch_size=512, device="cpu")
        p = pitch[0].numpy()
        c = per[0].numpy()
        t = np.arange(len(p)) * 0.01
        return t, p, c, None
elif a.tool == "fcpe":
    import torch
    from torchfcpe import spawn_bundled_infer_model
    torch.set_num_threads(2)
    m = spawn_bundled_infer_model(device="cpu")
    rec["version"] = "torchfcpe 0.0.4 (bundled model)"
    rec["settings"] = dict(sr="16000 input (resampled here with torchaudio)", decoder_mode="local_argmax",
                           threshold=0.006, f0_min=80, f0_max=880, interp_uv=False,
                           hop="160 samples at 16 kHz = 10 ms (model's own hop)",
                           confidence="none: 0 Hz where the model's uv mask is set")

    def run(clip):
        import torchaudio.functional as AF
        y, sr = load_mono(clip)
        x = torch.from_numpy(y)[None]
        if sr != 16000:
            x = AF.resample(x, sr, 16000)
        f0 = m.infer(x[..., None], sr=16000, decoder_mode="local_argmax", threshold=0.006, f0_min=80, f0_max=880,
                     interp_uv=False)
        f = f0[0, :, 0].numpy()
        t = np.arange(len(f)) * 0.01
        return t, f, None, None
elif a.tool == "pesto":
    import torch
    import pesto
    torch.set_num_threads(2)
    rec["version"] = "pesto-pitch 2.0.1"
    rec["settings"] = dict(model_name="mir-1k_g7 (default)", step_size_ms=10.0, reduction="alwa (default)",
                           sr="native 44100 (PESTO computes its own CQT)", confidence="PESTO confidence output")

    def run(clip):
        y, sr = load_mono(clip)
        ts, f0, conf, act = pesto.predict(torch.from_numpy(y), sr, step_size=10.0)
        t = ts.numpy() / 1000.0 if float(ts.max()) > 1000 else ts.numpy()
        return t, f0.numpy(), conf.numpy(), None
elif a.tool == "penn":
    import torch
    import penn
    torch.set_num_threads(2)
    rec["version"] = "penn 1.0.0 (checkpoint maxrmorrison/fcnf0-plus-plus fcnf0++.pt from the Hugging Face Hub)"
    rec["settings"] = dict(sample_rate="8000 (penn resamples)", hopsize_s=0.01, fmin=penn.FMIN, fmax=penn.FMAX,
                           center="half-window (default)", decoder=penn.DECODER, batch_size=2048,
                           confidence="periodicity (raw)", gpu=None)

    def run(clip):
        y, sr = load_mono(clip)
        pitch, per = penn.from_audio(torch.from_numpy(y)[None], sr, hopsize=0.01, batch_size=2048, gpu=None)
        p = pitch[0].numpy()
        c = per[0].numpy()
        # center='half-window' (the default) adds no padding: frame i covers samples [i*hop, i*hop + WINDOW_SIZE)
        # at 8 kHz (penn.core.preprocess), so its centre is at i*0.01 s + 1024/8000/2 s = i*0.01 + 0.064 s
        t = np.arange(len(p)) * 0.01 + penn.WINDOW_SIZE / penn.SAMPLE_RATE / 2
        return t, p, c, None
elif a.tool == "rmvpe":
    from rmvpe_onnx import RMVPE  # noqa
    raise SystemExit("set up separately")
else:
    raise SystemExit(f"unknown tool {a.tool}")
rec["setup_s"] = round(time.perf_counter() - t0, 3)

for clip in a.clips.split(","):
    t1 = time.perf_counter()
    t, f, c, notes = run(clip)
    dt = time.perf_counter() - t1
    write_f0_csv(os.path.join(a.outdir, f"{clip}.f0.csv"), t, f, c)
    info = {"input": mono_path(clip), "seconds": round(dt, 3), "n_frames": int(len(t)),
            "hop_s": round(float(t[1] - t[0]), 5) if len(t) > 1 else None,
            "n_frames_freq_gt0": int(np.sum(np.nan_to_num(f) > 0))}
    if notes is not None:
        write_notes_csv(os.path.join(a.outdir, f"{clip}.notes.csv"), notes, extra_cols="fitted_pitch_hz")
        info["n_notes"] = len(notes)
    rec["clips"][clip] = info
    print(clip, info, flush=True)
with open(os.path.join(a.outdir, "timings.json"), "w") as fh:
    json.dump(rec, fh, indent=1)
