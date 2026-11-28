"""Real fingerstyle clips without truth (R3a, R3b, R3c): what the tap-side steps of this lane emit.

Usage: python real_clips_onsets.py <out dir> <clip id> [<clip id> ...]
For each clip (/home/user/gtr/inputs/<id>/<id>.mono.wav): librosa.effects.hpss(margin=4) -> percussive part;
librosa.onset.onset_detect (defaults) on the mix and on the percussive part; energy fractions (sum of squares of
the part / sum of squares of the mix). Writes <out>/<id>/{onsets_mix.txt, onsets_percussive_m4.txt} and prints one
JSON line per clip. No truth exists for these clips, so only counts are reported.
"""
import json
import os
import sys

import librosa
import numpy as np

out = sys.argv[1]
for cid in sys.argv[2:]:
    y, sr = librosa.load(f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav", sr=None, mono=True)
    h, p = librosa.effects.hpss(y, margin=4.0)
    om = librosa.onset.onset_detect(y=y, sr=sr, units="time")
    op = librosa.onset.onset_detect(y=p, sr=sr, units="time")
    d = os.path.join(out, cid)
    os.makedirs(d, exist_ok=True)
    np.savetxt(os.path.join(d, "onsets_mix.txt"), om, fmt="%.6f")
    np.savetxt(os.path.join(d, "onsets_percussive_m4.txt"), op, fmt="%.6f")
    e = lambda x: float(np.sum(x.astype(np.float64) ** 2))
    print(json.dumps({"clip": cid, "sr": sr, "duration_s": round(len(y) / sr, 3), "n_onsets_mix": int(len(om)),
                      "n_onsets_percussive_m4": int(len(op)), "energy_fraction_percussive_m4": round(e(p) / e(y), 4),
                      "energy_fraction_harmonic_m4": round(e(h) / e(y), 4)}))
