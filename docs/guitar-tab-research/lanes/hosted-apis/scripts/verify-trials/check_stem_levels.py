"""verify-trials-hosted-apis: independent check of the stem timing and level figures in trials.md.
For each service output: lag of the mono stem sum against the mono input mix (cross-correlation over the first 20 s,
searched over +-4000 samples), RMS level of each stem's mono decode, and RMS of (mix - sum of stems) after removing
the lag. Reads the 44.1 kHz float WAV decodes made with ffmpeg (paths given). Usage:
  python -I check_stem_levels.py <mix.wav> <dir with untrimmed decodes> <dir with trimmed decodes or ->"""
import glob, json, os, sys
import numpy as np
import soundfile as sf

mix_p, raw_d, trim_d = sys.argv[1:4]
mix, sr = sf.read(mix_p, always_2d=True)
mix = mix.mean(axis=1)
raw = {os.path.splitext(os.path.basename(p))[0]: sf.read(p, always_2d=True)[0].mean(axis=1)
       for p in sorted(glob.glob(os.path.join(raw_d, "*.wav"))) if "sum_" not in p}
db = lambda x: round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)), 2)
n = min(len(mix), *(len(v) for v in raw.values()))
tot = sum(v[:n] for v in raw.values())
seg = 20 * sr
a, b = mix[:seg], tot[:seg]
lags = range(-4000, 4001)
# direct correlation over a window of lags (b shifted against a)
best = max(lags, key=lambda L: float(np.dot(a[max(0, -L):seg - max(0, L)], b[max(0, L):seg - max(0, -L)])))
out = {"sample_rate": sr, "lengths": {k: len(v) for k, v in raw.items()}, "mix_len": len(mix),
       "lag_samples_sum_after_mix": best, "lag_ms": round(best / sr * 1000, 3),
       "stem_rms_dbfs": {k: db(v[:n]) for k, v in raw.items()}, "mix_rms_dbfs": db(mix[:n])}
if trim_d != "-":
    tr = {os.path.splitext(os.path.basename(p))[0]: sf.read(p, always_2d=True)[0].mean(axis=1)
          for p in sorted(glob.glob(os.path.join(trim_d, "*.wav"))) if "sum_" not in p}
    m = min(len(mix), *(len(v) for v in tr.values()))
    ts = sum(v[:m] for v in tr.values())
    out["residual_after_trim_dbfs"] = db(mix[:m] - ts)
else:
    out["residual_lag0_dbfs"] = db(mix[:n] - tot)
print(json.dumps(out))
