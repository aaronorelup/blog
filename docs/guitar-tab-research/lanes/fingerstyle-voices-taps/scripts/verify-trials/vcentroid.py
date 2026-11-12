# Verifier recompute: spectral centroid of 50 ms after each onset matched to a truth tap, by tap kind.
import json, sys, numpy as np, soundfile as sf, mir_eval
T = json.load(open('/home/user/gtr/inputs/S6taps/S6taps.truth.json'))
taps = sorted(T['taps'], key=lambda t: t['time']); tt = np.array([t['time'] for t in taps])
wav, onf = sys.argv[1], sys.argv[2]
est = np.sort(np.atleast_1d(np.loadtxt(onf)))
y, sr = sf.read(wav, always_2d=True); y = y.mean(axis=1)
w = int(0.05 * sr); win = np.hanning(w); f = np.fft.rfftfreq(w, 1 / sr)
res = {}
m = mir_eval.util.match_events(tt, est, 0.05)
for ri, ei in m:
    s = int(est[ei] * sr); seg = y[s:s + w]
    mag = np.abs(np.fft.rfft(seg * win)); res.setdefault(taps[ri]['kind'], []).append(float((f * mag).sum() / mag.sum()))
print(wav.split('/out/')[-1], onf.split('/')[-1], {k: (len(v), round(min(v)), round(float(np.median(v))), round(max(v))) for k, v in res.items()}, 'unmatched', len(est) - len(m))
