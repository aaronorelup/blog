"""Pure-sine check of Essentia's PitchYinProbabilistic (defaults) against Essentia's PitchYin, run in venv-essentia
(essentia-tensorflow 2.1b6.dev1389). One second of a 0.5-amplitude sine at 44.1 kHz per frequency."""
import numpy as np
import essentia.standard as es
sr = 44100
t = np.arange(sr) / sr
for f in (110.0, 220.0, 369.99, 440.0):
    x = (0.5 * np.sin(2 * np.pi * f * t)).astype(np.float32)
    p, v = es.PitchYinProbabilistic(sampleRate=sr)(x)
    p = np.asarray(p)
    good = p[p > 0]
    print("sine", f, "frames", len(p), "voiced", len(good), "median est", round(float(np.median(good)), 3) if len(good) else None)
    print("   PitchYin one frame", es.PitchYin(sampleRate=sr, frameSize=2048)(x[:2048]))
