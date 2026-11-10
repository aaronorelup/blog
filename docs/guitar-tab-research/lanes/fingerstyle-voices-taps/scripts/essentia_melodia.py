"""Essentia PredominantPitchMelodia on a clip: the melody voice from audio directly.

Usage: python essentia_melodia.py <out dir> <clip id> [<clip id> ...]
Input: /home/user/gtr/inputs/<id>/<id>.mono.wav, EqualLoudness() then PredominantPitchMelodia() with default
parameters (frameSize 2048, hopSize 128, sampleRate 44100, minFrequency 80 Hz, maxFrequency 20000 Hz per Essentia's
reference). Output <out>/<id>.melodia.csv: time_s,f0_hz,confidence (f0 0 = unvoiced, written as empty).
Frame times follow Essentia's tutorial: time of frame i = i * hopSize / sampleRate.
"""
import os
import sys
import time

import essentia.standard as es
import numpy as np

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
for cid in sys.argv[2:]:
    t0 = time.time()
    audio = es.MonoLoader(filename=f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav", sampleRate=44100)()
    audio = es.EqualLoudness()(audio)
    pitch, conf = es.PredominantPitchMelodia()(audio)
    t = np.arange(len(pitch)) * 128 / 44100.0
    with open(os.path.join(out, f"{cid}.melodia.csv"), "w") as f:
        f.write("time_s,f0_hz,confidence\n")
        for ti, fi, ci in zip(t, pitch, conf):
            f.write(f"{ti:.4f},{'' if fi <= 0 else f'{fi:.3f}'},{ci:.4f}\n")
    print(f"{cid}: {len(pitch)} frames, {int(np.sum(pitch > 0))} voiced, {time.time() - t0:.2f} s")
