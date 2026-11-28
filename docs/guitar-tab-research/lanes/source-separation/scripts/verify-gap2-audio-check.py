#!/usr/bin/env python3
"""verify-gap2-audio-check.py (verify-gapfill-source-separation, round 2).

Recomputes, from the audio in out/, the facts gap round 2 states about the htdemucs-6s-guitar-ft runs and the stock
control (written separately from scripts/stem_facts.py): per stem the format, frames, RMS level (dBFS over all
channels and samples), the stem sum against the mix at lag 0 (10 log10(|mix - sum|^2 / |mix|^2), mono), the
projection <est, true> / <true, true> of each true stem (mono) where true stems exist, full-scale sample counts, and
whether derived_instrumental_sum.wav equals the sum of the five non-vocal stems. Writes one JSON.

Usage: <venv>/bin/python -I verify-gap2-audio-check.py <out.json>
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

OUT = "/home/user/gtr/lanes/source-separation/out"
IN = "/home/user/gtr/inputs"
SETS = [("htdemucs-6s-guitar-ft", "S4"), ("htdemucs-6s-guitar-ft", "S6taps"), ("htdemucs-6s-guitar-ft", "S2s"),
        ("htdemucs-6s-guitar-ft", "R2"), ("htdemucs_6s-via-ft-script", "S4"), ("htdemucs_6s-via-ft-script", "S6taps")]
STEMS = ["drums", "bass", "other", "vocals", "guitar", "piano"]


def rms_db(x):
    return round(float(10 * np.log10(np.mean(x ** 2))), 2)


def main():
    res = {}
    for model, clip in SETS:
        d = os.path.join(OUT, model, clip)
        mix, sr = sf.read(os.path.join(IN, clip, f"{clip}.wav"), dtype="float64", always_2d=True)
        r = {"mix_rms_dbfs": rms_db(mix), "mix_frames": len(mix), "stems": {}}
        total = np.zeros_like(mix)
        mono = {}
        for s in STEMS:
            p = os.path.join(d, f"{s}.wav")
            info = sf.info(p)
            x, xsr = sf.read(p, dtype="float64", always_2d=True)
            xi, _ = sf.read(p, dtype="int32", always_2d=True)
            # PCM_24 is read into the top 24 bits of int32; full scale = +-2^31 (minus one step of 2^8 at the top)
            full = int(np.sum(xi >= 2 ** 31 - 2 ** 8)) + int(np.sum(xi <= -(2 ** 31)))
            r["stems"][s] = {"subtype": info.subtype, "rate": xsr, "channels": info.channels, "frames": len(x),
                             "bytes": os.path.getsize(p), "rms_dbfs": rms_db(x), "full_scale_samples": full,
                             "samples": int(x.size)}
            total += x
            mono[s] = x.mean(axis=1)
        m = mix.mean(axis=1)
        t = total.mean(axis=1)
        r["sum_residual_db_lag0"] = round(float(10 * np.log10(np.sum((m - t) ** 2) / np.sum(m ** 2))), 2)
        tdir = os.path.join(IN, clip, "stems")
        if clip in ("S4", "S6taps") and os.path.isdir(tdir):
            r["projection"] = {}
            for f in sorted(os.listdir(tdir)):
                if not f.endswith(".wav"):
                    continue
                y, _ = sf.read(os.path.join(tdir, f), dtype="float64", always_2d=True)
                y = y.mean(axis=1)
                n = min(len(y), len(m))
                r["projection"][f[:-4]] = {s: round(float(np.dot(mono[s][:n], y[:n]) / np.dot(y[:n], y[:n])), 4)
                                           for s in STEMS}
        ds = os.path.join(d, "derived_instrumental_sum.wav")
        if os.path.exists(ds):
            z, _ = sf.read(ds, dtype="float64", always_2d=True)
            five = sum(sf.read(os.path.join(d, f"{s}.wav"), dtype="float64", always_2d=True)[0]
                       for s in ["drums", "bass", "other", "guitar", "piano"])
            r["derived_instrumental_sum"] = {"subtype": sf.info(ds).subtype, "frames": len(z),
                                             "max_abs_diff_vs_five_stem_sum": float(np.max(np.abs(z - five)))}
        res[f"{model}/{clip}"] = r
    with open(sys.argv[1], "w") as f:
        json.dump(res, f, indent=1)
    print(json.dumps(res)[:200])


if __name__ == "__main__":
    main()
