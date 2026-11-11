"""libfmp 1.3.0 HPS and HRPS (libfmp.c8.c8s1_hps.hps / hrps) on one clip, then librosa onsets on the parts.

Usage: python gap2_libfmp_hrps.py <clip id> <out dir>
Input: /home/user/gtr/inputs/<id>/<id>.mono.wav, loaded with librosa.load(path, sr=22050), as libfmp's own
experiment_hps_parameter / experiment_hrps_parameter do ("Fs = 22050", "x, Fs = librosa.load(fn_wav, sr=Fs)").
Settings, all taken from the FMP notebooks (www.audiolabs-erlangen.de/resources/MIR/FMP/C8/, read 2026-11-11):
  - HRPS, the C8S1_HRPS notebook's param_list (cell In [3]): N=1024, H=256, L_h=0.2 s, L_p=500 Hz,
    beta = 1.1, 2, 4, 32.
  - HPS, the defaults of the C8S1_HPS notebook's experiment_hps_pieces: N=1024, H=256, L_h=0.2 s, L_p=500 Hz,
    mask 'binary' (the function's default) and, as a second run, mask 'soft'.
For each setting: the parts as float32 WAV at 22050 Hz (<out>/<name>/{harmonic,percussive[,residual]}.wav), the
energy of each part / the energy of the loaded mix, and librosa.onset.onset_detect(y=part, sr=22050, units='time')
with its defaults (hop 512 = 23.2 ms at 22050 Hz) on the percussive part (-> <out>/onsets_percussive/<name>.txt)
and, for HRPS, on the residual part (-> <out>/onsets_residual/<name>.txt). Onsets of the loaded mix with the same
call -> <out>/onsets_mix/mix_22050.txt. No truth is read. Writes <out>/summary.json.
"""
import json
import os
import sys
import time

import librosa
import libfmp
import libfmp.c8
import numpy as np
import soundfile as sf
from libfmp.c8 import convert_l_hertz_to_bins, convert_l_sec_to_frames, make_integer_odd

cid, out = sys.argv[1], sys.argv[2]
path = f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav"
Fs = 22050
x, Fs = librosa.load(path, sr=Fs)
os.makedirs(out, exist_ok=True)
e = lambda s: float(np.sum(np.asarray(s, dtype=np.float64) ** 2))
E = e(x)


def write_onsets(sub, name, sig):
    on = librosa.onset.onset_detect(y=sig, sr=Fs, units="time")
    d = os.path.join(out, sub)
    os.makedirs(d, exist_ok=True)
    np.savetxt(os.path.join(d, f"{name}.txt"), on, fmt="%.6f")
    return int(len(on))


summary = {"input": path, "Fs": Fs, "n_samples": int(len(x)), "libfmp": getattr(libfmp, "__version__", "1.3.0 (freeze)"),
           "librosa": librosa.__version__, "n_onsets_mix_22050": write_onsets("onsets_mix", "mix_22050", x), "runs": []}

settings = [("hps_binary", "hps", dict(N=1024, H=256, L_h=0.2, L_p=500, mask="binary")),
            ("hps_soft", "hps", dict(N=1024, H=256, L_h=0.2, L_p=500, mask="soft"))]
settings += [(f"hrps_beta{b:g}", "hrps", dict(N=1024, H=256, L_h=0.2, L_p=500, beta=b)) for b in (1.1, 2, 4, 32)]

for name, fn, kw in settings:
    t0 = time.time()
    if fn == "hps":
        x_h, x_p = libfmp.c8.hps(x, Fs=Fs, **kw)
        parts = {"harmonic": x_h, "percussive": x_p}
    else:
        x_h, x_p, x_r = libfmp.c8.hrps(x, Fs=Fs, **kw)
        parts = {"harmonic": x_h, "percussive": x_p, "residual": x_r}
    t1 = time.time()
    d = os.path.join(out, name)
    os.makedirs(d, exist_ok=True)
    for k, v in parts.items():
        sf.write(os.path.join(d, f"{k}.wav"), np.asarray(v, dtype=np.float32), Fs, subtype="FLOAT")
    run = {"name": name, "function": fn, "params": kw, "seconds": round(t1 - t0, 3),
           "L_h_frames": make_integer_odd(convert_l_sec_to_frames(kw["L_h"], Fs=Fs, N=kw["N"], H=kw["H"])),
           "L_p_bins": make_integer_odd(convert_l_hertz_to_bins(kw["L_p"], Fs=Fs, N=kw["N"], H=kw["H"])),
           "energy_fraction": {k: e(v) / E for k, v in parts.items()},
           "energy_fraction_mix_minus_parts": e(x - sum(parts.values())) / E,
           "n_onsets_percussive": write_onsets("onsets_percussive", name, x_p)}
    if "residual" in parts:
        run["n_onsets_residual"] = write_onsets("onsets_residual", name, parts["residual"])
    summary["runs"].append(run)
    print(json.dumps(run), flush=True)

with open(os.path.join(out, "summary.json"), "w") as f:
    json.dump(summary, f, indent=1)
