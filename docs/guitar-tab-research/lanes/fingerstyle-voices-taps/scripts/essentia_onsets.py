"""Essentia onset detection: OnsetDetection (each method) + Onsets, OnsetRate, SuperFluxExtractor.

Usage: python essentia_onsets.py <input wav (44.1 kHz)> <out dir>
Pipeline for each OnsetDetection method (Essentia's own onset tutorial): MonoLoader(sampleRate=44100) ->
FrameGenerator(frameSize=1024, hopSize=512) -> Windowing(type='hann') -> FFT -> CartesianToPolar ->
OnsetDetection(method=m) -> Onsets() (default parameters, frameRate 44100/512) on that one detection function.
OnsetRate()(audio) and SuperFluxExtractor()(audio) with default parameters.
Writes <out>/<name>.txt (one onset time in seconds per line) and <out>/timing.json.
"""
import json
import os
import sys
import time

import essentia
import essentia.standard as es
import numpy as np

inp, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
audio = es.MonoLoader(filename=inp, sampleRate=44100)()
timing = {"essentia": essentia.__version__, "input": inp, "n_samples": int(len(audio))}
w, fft, c2p = es.Windowing(type="hann"), es.FFT(), es.CartesianToPolar()
for m in ["hfc", "complex", "complex_phase", "flux", "melflux", "rms"]:
    t0 = time.time()
    od = es.OnsetDetection(method=m)
    feats = []
    for frame in es.FrameGenerator(audio, frameSize=1024, hopSize=512):
        mag, ph = c2p(fft(w(frame)))
        feats.append(od(mag, ph))
    onsets = es.Onsets()(essentia.array([feats]), [1])
    np.savetxt(os.path.join(out, f"od_{m}.txt"), onsets, fmt="%.6f")
    timing[f"od_{m}"] = {"seconds": round(time.time() - t0, 3), "n_onsets": int(len(onsets))}
t0 = time.time()
onsets, rate = es.OnsetRate()(audio)
np.savetxt(os.path.join(out, "onsetrate.txt"), onsets, fmt="%.6f")
timing["onsetrate"] = {"seconds": round(time.time() - t0, 3), "n_onsets": int(len(onsets)), "rate_per_s": float(rate)}
t0 = time.time()
onsets = es.SuperFluxExtractor()(audio)
np.savetxt(os.path.join(out, "superflux.txt"), onsets, fmt="%.6f")
timing["superflux"] = {"seconds": round(time.time() - t0, 3), "n_onsets": int(len(onsets))}
with open(os.path.join(out, "timing.json"), "w") as f:
    json.dump(timing, f, indent=1)
print(json.dumps(timing))
