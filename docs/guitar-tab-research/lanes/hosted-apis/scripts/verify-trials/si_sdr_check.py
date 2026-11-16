"""verify-trials-hosted-apis: SI-SDR written out in numpy (independent of gtr-eval's code) for a few stem pairs.
Both signals averaged to mono, trimmed to the shorter length, mean removed; target = (<e,r>/<r,r>) r;
SI-SDR = 10 log10(|target|^2 / |e - target|^2). Usage: python -I si_sdr_check.py <ref.wav> <est.wav> [...pairs]"""
import json, sys
import numpy as np
import soundfile as sf

a = sys.argv[1:]
for ref_p, est_p in zip(a[0::2], a[1::2]):
    r = sf.read(ref_p, always_2d=True)[0].mean(axis=1)
    e = sf.read(est_p, always_2d=True)[0].mean(axis=1)
    n = min(len(r), len(e))
    r, e = r[:n] - r[:n].mean(), e[:n] - e[:n].mean()
    t = (np.dot(e, r) / np.dot(r, r)) * r
    print(json.dumps({"ref": ref_p.split("/inputs/")[-1], "est": est_p.split("/hosted-apis/")[-1], "samples": n,
                      "si_sdr_db": round(float(10 * np.log10(np.dot(t, t) / np.dot(e - t, e - t))), 4)}))
