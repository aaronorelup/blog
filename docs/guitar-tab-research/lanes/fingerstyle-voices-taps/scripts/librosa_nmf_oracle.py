"""librosa.decompose.decompose (scikit-learn NMF) on S6taps, with an ORACLE grouping of the components.

Usage: python librosa_nmf_oracle.py <out dir> [n_components ...]
Input: S6taps.mono.wav. Magnitude STFT (n_fft 2048, hop 512). For each k: librosa.decompose.decompose(S, n_components=k,
sort=True, random_state=0) (scikit-learn NMF, its defaults otherwise). Each component c is turned into audio with a
soft mask (W[:,c] H[c] / W H) on the complex STFT and an inverse STFT.
ORACLE grouping (uses the truth stems, so it is an upper bound of what this decomposition can give, not a method):
a component goes to 'taps' when its audio has a larger normalized correlation with stems/taps.wav than with
stems/guitar.wav. The summed taps group is written as nmf_k<k>_oracle_taps.wav, the rest as nmf_k<k>_oracle_guitar.wav.
Also printed per component: spectral flatness of its basis vector (geometric / arithmetic mean), a no-truth feature.
"""
import json
import os
import sys
import time

import librosa
import numpy as np
import soundfile as sf

out = sys.argv[1]
ks = [int(k) for k in sys.argv[2:]] or [8, 16]
os.makedirs(out, exist_ok=True)
y, sr = librosa.load("/home/user/gtr/inputs/S6taps/S6taps.mono.wav", sr=None, mono=True)
taps, _ = librosa.load("/home/user/gtr/inputs/S6taps/stems/taps.wav", sr=None, mono=True)
gtr, _ = librosa.load("/home/user/gtr/inputs/S6taps/stems/guitar.wav", sr=None, mono=True)
D = librosa.stft(y, n_fft=2048, hop_length=512)
S = np.abs(D)


def ncorr(a, b):
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))


for k in ks:
    t0 = time.time()
    W, H = librosa.decompose.decompose(S, n_components=k, sort=True, random_state=0)
    V = W @ H + 1e-10
    comps, info = [], []
    for c in range(k):
        mask = np.outer(W[:, c], H[c]) / V
        yc = librosa.istft(D * mask, hop_length=512, length=len(y))
        comps.append(yc)
        flat = float(np.exp(np.mean(np.log(W[:, c] + 1e-12))) / (np.mean(W[:, c]) + 1e-12))
        info.append({"c": c, "flatness": round(flat, 4), "corr_taps": round(ncorr(yc, taps), 4),
                     "corr_guitar": round(ncorr(yc, gtr), 4)})
    to_taps = [i["corr_taps"] > i["corr_guitar"] for i in info]
    yt = np.sum([comps[c] for c in range(k) if to_taps[c]], axis=0) if any(to_taps) else np.zeros_like(y)
    yg = np.sum([comps[c] for c in range(k) if not to_taps[c]], axis=0) if not all(to_taps) else np.zeros_like(y)
    sf.write(os.path.join(out, f"nmf_k{k}_oracle_taps.wav"), yt.astype(np.float32), sr, subtype="FLOAT")
    sf.write(os.path.join(out, f"nmf_k{k}_oracle_guitar.wav"), yg.astype(np.float32), sr, subtype="FLOAT")
    print(json.dumps({"k": k, "seconds": round(time.time() - t0, 2), "n_components_to_taps": int(sum(to_taps)),
                      "components": info}))
