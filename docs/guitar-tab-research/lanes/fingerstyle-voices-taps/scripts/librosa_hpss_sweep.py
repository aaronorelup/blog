"""librosa harmonic-percussive separation at several margins, plus librosa onset detection on each percussive part.

Usage: python librosa_hpss_sweep.py <clip id> <out dir> [margins...]
Input: /home/user/gtr/inputs/<id>/<id>.mono.wav (read at its own rate, 44.1 kHz mono).
For each margin m: librosa.effects.hpss(y, margin=m) (kernel_size=31, power=2.0, mask=False defaults of
librosa.effects.hpss; STFT n_fft=2048, hop_length=512) -> <out>/m<m>/harmonic.wav, percussive.wav (float32);
then librosa.onset.onset_detect(y=percussive, sr=sr, units='time') (defaults: hop 512, spectral-flux onset
strength on a mel spectrogram, peak picking with librosa's defaults) -> <out>/m<m>/onsets_percussive.txt.
Also writes onsets of the unseparated mix with the same call -> <out>/onsets_mix.txt.
"""
import json
import os
import sys
import time

import librosa
import numpy as np
import soundfile as sf

cid, out = sys.argv[1], sys.argv[2]
margins = [float(m) for m in sys.argv[3:]] or [1.0, 2.0, 4.0, 8.0, 16.0]
path = f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav"
y, sr = librosa.load(path, sr=None, mono=True)
os.makedirs(out, exist_ok=True)
summary = {"input": path, "sr": sr, "n_samples": len(y), "librosa": librosa.__version__, "runs": []}
on_mix = librosa.onset.onset_detect(y=y, sr=sr, units="time")
np.savetxt(os.path.join(out, "onsets_mix.txt"), on_mix, fmt="%.6f")
summary["n_onsets_mix"] = int(len(on_mix))
for m in margins:
    t0 = time.time()
    h, p = librosa.effects.hpss(y, margin=m)
    t1 = time.time()
    d = os.path.join(out, f"m{m:g}")
    os.makedirs(d, exist_ok=True)
    sf.write(os.path.join(d, "harmonic.wav"), h.astype(np.float32), sr, subtype="FLOAT")
    sf.write(os.path.join(d, "percussive.wav"), p.astype(np.float32), sr, subtype="FLOAT")
    on = librosa.onset.onset_detect(y=p, sr=sr, units="time")
    np.savetxt(os.path.join(d, "onsets_percussive.txt"), on, fmt="%.6f")
    e = lambda x: float(np.sum(x.astype(np.float64) ** 2))
    summary["runs"].append({"margin": m, "hpss_seconds": round(t1 - t0, 3), "n_onsets_percussive": int(len(on)),
                            "energy_fraction_harmonic": e(h) / e(y), "energy_fraction_percussive": e(p) / e(y),
                            "energy_fraction_residual": e(y - h - p) / e(y)})
with open(os.path.join(out, "summary.json"), "w") as f:
    json.dump(summary, f, indent=1)
print(json.dumps(summary, indent=1))
