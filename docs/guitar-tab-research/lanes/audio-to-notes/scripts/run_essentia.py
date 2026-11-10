"""Essentia 2.1b6.dev1389 (essentia-tensorflow wheel) pitch algorithms on the shared clips.

usage: python run_essentia.py <algo> <outdir> [--clips ...]
algos:
  melodia      EqualLoudness -> PredominantPitchMelodia (defaults) -> f0 csv (Hz, pitchConfidence);
               then PitchContourSegmentation(pitch, signal) (defaults) -> notes csv (Essentia's own note step)
  pyin         PitchYinProbabilistic (defaults; outputUnvoiced='negative' -> written as 0 Hz) -> f0 csv
  klapuri      EqualLoudness -> MultiPitchKlapuri (defaults) -> multi-f0 frames json (polyphonic)
  multimelodia EqualLoudness -> MultiPitchMelodia (defaults) -> multi-f0 frames json (polyphonic)
  crepe-full / crepe-tiny   PitchCREPE(graphFilename=crepe-<size>-1.pb, hopSize=10 ms) on 16 kHz audio -> f0 csv
Audio: MonoLoader(sampleRate=44100) of the clip's .mono.wav (16000 for CREPE, resampled by MonoLoader).
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import mono_path, write_f0_csv, write_notes_csv  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("algo")
ap.add_argument("outdir")
ap.add_argument("--clips", default="S1,S2n,S2s,S4,S4lead,R1b,R2,R3a")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)

import numpy as np  # noqa: E402
import essentia  # noqa: E402
import essentia.standard as es  # noqa: E402

MODELS = "/home/user/gtr/lanes/audio-to-notes/dl/essentia-models"
rec = {"algo": a.algo, "essentia": essentia.__version__, "clips": {}}
SR = 16000 if a.algo.startswith("crepe") else 44100
if a.algo.startswith("crepe"):
    size = a.algo.split("-")[1]
    t0 = time.perf_counter()
    crepe = es.PitchCREPE(graphFilename=f"{MODELS}/crepe-{size}-1.pb", hopSize=10)
    rec["setup_s"] = round(time.perf_counter() - t0, 3)
    rec["settings"] = {"graphFilename": f"crepe-{size}-1.pb", "hopSize_ms": 10, "batchSize": 64, "sampleRate": 16000}

for clip in a.clips.split(","):
    t1 = time.perf_counter()
    audio = es.MonoLoader(filename=mono_path(clip), sampleRate=SR)()
    info = {"input": mono_path(clip), "sample_rate": SR}
    if a.algo == "melodia":
        x = es.EqualLoudness(sampleRate=SR)(audio)
        pitch, conf = es.PredominantPitchMelodia(sampleRate=SR)(x)
        t = np.arange(len(pitch)) * 128 / SR
        onset, dur, midi = es.PitchContourSegmentation(sampleRate=SR, hopSize=128)(pitch, audio)
        notes = [(float(o), float(o + d), int(m)) for o, d, m in zip(onset, dur, midi)]
        write_f0_csv(os.path.join(a.outdir, f"{clip}.f0.csv"), t, pitch, conf)
        write_notes_csv(os.path.join(a.outdir, f"{clip}.notes.csv"), notes)
        info.update(n_frames=len(pitch), hop_s=128 / SR, n_frames_voiced=int(np.sum(pitch > 0)), n_notes=len(notes))
    elif a.algo == "pyin":
        pitch, vprob = es.PitchYinProbabilistic(sampleRate=SR)(audio)
        t = np.arange(len(pitch)) * 256 / SR
        f = np.where(pitch > 0, pitch, 0.0)
        write_f0_csv(os.path.join(a.outdir, f"{clip}.f0.csv"), t, f, vprob)
        info.update(n_frames=len(pitch), hop_s=256 / SR, n_frames_voiced=int(np.sum(f > 0)))
    elif a.algo in ("klapuri", "multimelodia"):
        x = es.EqualLoudness(sampleRate=SR)(audio)
        alg = es.MultiPitchKlapuri(sampleRate=SR) if a.algo == "klapuri" else es.MultiPitchMelodia(sampleRate=SR)
        frames = alg(x)
        t = (np.arange(len(frames)) * 128 / SR).round(5).tolist()
        out = {"hop_s": 128 / SR, "times": t, "freqs_hz": [[round(float(v), 3) for v in fr] for fr in frames]}
        with open(os.path.join(a.outdir, f"{clip}.multif0.json"), "w") as fh:
            json.dump(out, fh)
        info.update(n_frames=len(frames), n_pitches_total=int(sum(len(fr) for fr in frames)),
                    max_pitches_in_a_frame=int(max(len(fr) for fr in frames)))
    elif a.algo.startswith("crepe"):
        time_, freq, conf, act = crepe(audio)
        write_f0_csv(os.path.join(a.outdir, f"{clip}.f0.csv"), np.asarray(time_), np.asarray(freq), np.asarray(conf))
        info.update(n_frames=len(freq), hop_s=float(time_[1] - time_[0]) if len(time_) > 1 else None,
                    activation_shape=list(np.asarray(act).shape))
    else:
        raise SystemExit("unknown algo")
    info["seconds"] = round(time.perf_counter() - t1, 3)
    rec["clips"][clip] = info
    print(clip, info, flush=True)
with open(os.path.join(a.outdir, "timings.json"), "w") as fh:
    json.dump(rec, fh, indent=1)
