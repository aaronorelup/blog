"""Gap round 1: what the Demucs stems of RT1 hold (the drums-stem route of this lane, as in the R3 table).

For each model folder: every stem's energy relative to the mix (sum of squares over both channels / the same for
the mix, in dB), each stem's peak of the (L+R)/2 mono signal in dBFS, and for the drums stem
librosa.onset.onset_detect (defaults, units='time') on the stem loaded as mono (written to drums_onsets.txt), plus
the drums stem's level in every 10 s window (RMS dBFS of the mono signal).

usage: python gap1_rt1_stems.py <mix wav> <model dir> [<model dir> ...]
"""
import glob
import json
import os
import sys

import librosa
import numpy as np
import soundfile as sf

mix, sr = sf.read(sys.argv[1], always_2d=True)
em = float(np.sum(mix.astype(np.float64) ** 2))
db = lambda v: round(float(10 * np.log10(v)), 1) if v > 0 else float("-inf")
res = {}
for d in sys.argv[2:]:
    model = {}
    for p in sorted(glob.glob(os.path.join(d, "*.wav"))):
        y, s2 = sf.read(p, always_2d=True)
        mono = y.astype(np.float64).mean(axis=1)
        stem = os.path.basename(p)[:-4]
        model[stem] = {"energy_re_mix_db": db(float(np.sum(y.astype(np.float64) ** 2)) / em),
                       "mono_peak_dbfs": round(float(20 * np.log10(np.max(np.abs(mono)) + 1e-12)), 1),
                       "sr": s2, "channels": y.shape[1], "seconds": round(len(y) / s2, 3)}
        if stem == "drums":
            m, _ = librosa.load(p, sr=None, mono=True)
            on = librosa.onset.onset_detect(y=m, sr=s2, units="time")
            np.savetxt(os.path.join(d, "drums_onsets.txt"), on, fmt="%.6f")
            w = 10 * s2
            model[stem]["n_librosa_onsets"] = int(len(on))
            model[stem]["rms_dbfs_per_10s"] = [round(float(20 * np.log10(np.sqrt(np.mean(m[i:i + w] ** 2)) + 1e-12)), 1)
                                              for i in range(0, len(m), w)]
    res[d] = model
    print(d, json.dumps(model))
json.dump(res, open(os.path.join(os.path.commonpath(sys.argv[2:]), "stems_summary.json"), "w"), indent=1)
