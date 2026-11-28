# Independent re-analysis of the S4 sync captures (verifier's own code).
import numpy as np, soundfile as sf, json, sys
from scipy.signal import fftconvolve
OUT="/home/user/gtr/lanes/browser-audio-sync/out/sync/"
s4, sr = sf.read("/home/user/gtr/inputs/S4/S4.wav", dtype="float32")
s4m = s4.mean(axis=1)
beats = [float(l.split()[0]) for l in open("/home/user/gtr/inputs/S4/S4.beats.txt") if l.strip()]
def onsets(x, thr=0.05, quiet=int(0.1*44100)):
    idx = np.flatnonzero(np.abs(x) > thr)
    res=[]; last=-10**9
    for i in idx:
        if i - last > quiet: res.append(i)
        last = i
    return np.array(res)
for name in ["sync_s4_buffer_busy0.wav","sync_s4_element_busy0.wav"]:
    x, r = sf.read(OUT+name, dtype="float32")
    assert r == 44100
    ch0, ch1 = x[:,0], x[:,1]
    # lag of S4 in ch0: cross-correlate first 10 s of S4 with ch0
    seg = s4m[:441000]
    c = fftconvolve(ch0, seg[::-1], mode="valid")
    lag = int(np.argmax(c))
    d = ch0[lag:lag+len(s4m)] - s4m[:len(ch0)-lag]
    ons = onsets(ch1)
    bf = lag + np.round(np.array(beats)*44100).astype(int)
    # match each beat to nearest onset
    dev = np.array([ (ons[np.argmin(np.abs(ons-b))]-b)/44.1 for b in bf])
    print(name, "dur_s %.3f" % (len(x)/44100), "lag", lag, "maxdiff %.2e rms %.2e" % (np.abs(d).max(), np.sqrt((d**2).mean())),
          "n_onsets", len(ons), "n_beats", len(bf),
          "dev ms: min %.3f max %.3f mean %.3f median %.3f sd %.3f" % (dev.min(), dev.max(), dev.mean(), np.median(dev), dev.std()))
