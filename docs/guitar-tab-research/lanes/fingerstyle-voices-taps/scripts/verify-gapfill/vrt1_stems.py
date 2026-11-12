# Verifier (gap round 1): independent recompute of the RT1 Demucs stem figures in trials.md, "Gap round 1".
# Reads the 16-bit WAV files with Python's wave module (not soundfile), works on int16 -> float64, and checks:
#  - each stem's energy re the mix (sum of squares over both channels), in dB
#  - each stem's peak of the (L+R)/2 signal, in dBFS
#  - the drums stem's RMS (dBFS) in 10 s windows of the (L+R)/2 signal
#  - the loudest moments of each drums stem: (a) scipy find_peaks(distance = 1 s) as in gap1_rt1_drum_peaks.py,
#    (b) without find_peaks: every sample of |(L+R)/2| above -40 / -50 dBFS, grouped into regions whose samples are
#    less than 1 s apart, with the time and level of each region's maximum.
# usage: python vrt1_stems.py <mix wav> <model dir> [<model dir> ...]
import glob
import json
import os
import sys
import wave

import numpy as np


def read16(p):
    with wave.open(p, 'rb') as w:
        assert w.getsampwidth() == 2
        n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
        a = np.frombuffer(w.readframes(n), dtype='<i2').reshape(-1, ch).astype(np.float64) / 32768.0
    return a, sr


def regions(m, sr, thr_db):
    idx = np.flatnonzero(m > 10 ** (thr_db / 20))
    out = []
    if len(idx) == 0:
        return out
    starts = [0] + list(np.flatnonzero(np.diff(idx) >= sr) + 1)
    ends = starts[1:] + [len(idx)]
    for s, e in zip(starts, ends):
        seg = idx[s:e]
        k = seg[np.argmax(m[seg])]
        out.append([round(k / sr, 3), round(float(20 * np.log10(m[k])), 1)])
    return out


mix, sr = read16(sys.argv[1])
em = float(np.sum(mix ** 2))
res = {}
for d in sys.argv[2:]:
    model = {}
    for p in sorted(glob.glob(os.path.join(d, '*.wav'))):
        y, s2 = read16(p)
        stem = os.path.basename(p)[:-4]
        mono = (y[:, 0] + y[:, 1]) / 2
        r = {'energy_re_mix_db': round(10 * np.log10(np.sum(y ** 2) / em), 2),
             'mono_peak_dbfs': round(float(20 * np.log10(np.max(np.abs(mono)))), 2),
             'frames': len(y), 'sr': s2, 'channels': y.shape[1]}
        if stem == 'drums':
            w = 10 * s2
            r['rms_dbfs_per_10s'] = [round(float(20 * np.log10(np.sqrt(np.mean(mono[i:i + w] ** 2)))), 1)
                                     for i in range(0, len(mono), w)]
            am = np.abs(mono)
            from scipy.signal import find_peaks
            pk, _ = find_peaks(am, distance=s2)
            lv = 20 * np.log10(am[pk] + 1e-12)
            r['find_peaks_n'] = int(len(pk))
            r['find_peaks_above_-40'] = [[round(pk[i] / s2, 3), round(float(lv[i]), 1)] for i in np.flatnonzero(lv > -40)]
            r['find_peaks_above_-50'] = [[round(pk[i] / s2, 3), round(float(lv[i]), 1)] for i in np.flatnonzero(lv > -50)]
            r['regions_above_-40'] = regions(am, s2, -40)
            r['regions_above_-50'] = regions(am, s2, -50)
        model[stem] = r
    res[d] = model
print(json.dumps(res, indent=1))
