"""Decode a service's stems to 44.1 kHz WAV (ffmpeg) and measure their time offset against the input mix: the lag that
maximises the cross-correlation between the mono sum of the stems and the mono mix (first 20 s), and the sum's
residual against the mix. Usage: python -I stem_alignment.py <mix.wav> <stems_dir> <wav_out_dir>
"""
import glob, json, os, subprocess, sys
import numpy as np
import soundfile as sf

mix_path, sdir, wdir = sys.argv[1:4]
os.makedirs(wdir, exist_ok=True)
mix, sr = sf.read(mix_path, always_2d=True)
mix = mix.mean(axis=1)
stems = {}
for p in sorted(glob.glob(os.path.join(sdir, "*"))):
    name = os.path.splitext(os.path.basename(p))[0]
    out = os.path.join(wdir, name + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ar", str(sr), "-c:a", "pcm_f32le", out], check=True)
    x, _ = sf.read(out, always_2d=True)
    stems[name] = x.mean(axis=1)
n = min(len(mix), *(len(v) for v in stems.values()))
tot = sum(v[:n] for v in stems.values())
seg = int(20 * sr)
a, b = mix[:seg], tot[:seg]
corr = np.fft.irfft(np.fft.rfft(b, 2 * seg) * np.conj(np.fft.rfft(a, 2 * seg)))
lags = np.concatenate([np.arange(0, seg), np.arange(-seg, 0)])
best = int(lags[np.argmax(corr)])
res = mix[:n] - tot[:n]
out = {"sample_rate": sr, "mix_samples": len(mix), "stem_samples": {k: len(v) for k, v in stems.items()},
       "best_lag_samples_sum_vs_mix": best, "best_lag_ms": round(best / sr * 1000, 3),
       "rms_db": {k: round(20 * np.log10(np.sqrt(np.mean(v[:n] ** 2)) + 1e-12), 2) for k, v in stems.items()},
       "mix_rms_db": round(20 * np.log10(np.sqrt(np.mean(mix[:n] ** 2)) + 1e-12), 2),
       "sum_minus_mix_rms_db_at_lag0": round(20 * np.log10(np.sqrt(np.mean(res ** 2)) + 1e-12), 2)}
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(wdir, "alignment.json"), "w"), indent=1)
