"""librosa harmonic-percussive source separation (HPSS) on one clip, three settings.

Usage: python -I hpss_run.py <input wav> <out dir>
Writes <out dir>/<setting>/harmonic.wav and percussive.wav (float32 WAV, input sample rate and channel count,
same length as the input), plus <out dir>/<setting>/percussive_onsets.txt: librosa.onset.onset_detect on the
mono average of percussive.wav (default parameters, units='time'), one time in seconds per line.
Settings: default = librosa.effects.hpss(y) (kernel_size=31, power=2.0, mask=False, margin=1.0, n_fft=2048,
hop_length=512); margin3 = margin=3.0; margin1-5 = margin=(1.0, 5.0) (harmonic margin 1, percussive margin 5).
With a margin above 1 the two parts no longer add up to the input: the rest is the residual.
"""
import sys, os, time, json
import numpy as np
import soundfile as sf
import librosa

inp, outdir = sys.argv[1], sys.argv[2]
y, sr = sf.read(inp, always_2d=True, dtype="float32")
y = y.T  # (channels, samples) as librosa expects for multichannel
settings = {"default": {}, "margin3": {"margin": 3.0}, "margin1-5": {"margin": (1.0, 5.0)}}
report = {"input": inp, "sample_rate": sr, "channels": y.shape[0], "samples": y.shape[1],
          "librosa": librosa.__version__, "settings": {}}
for name, kw in settings.items():
    t0 = time.time()
    h, p = librosa.effects.hpss(y, **kw)
    dt = time.time() - t0
    d = os.path.join(outdir, name)
    os.makedirs(d, exist_ok=True)
    sf.write(os.path.join(d, "harmonic.wav"), h.T, sr, subtype="FLOAT")
    sf.write(os.path.join(d, "percussive.wav"), p.T, sr, subtype="FLOAT")
    on = librosa.onset.onset_detect(y=p.mean(axis=0), sr=sr, units="time")
    np.savetxt(os.path.join(d, "percussive_onsets.txt"), on, fmt="%.4f")
    rms = lambda v: float(20 * np.log10(np.sqrt(np.mean(v.astype(np.float64) ** 2)) + 1e-30))
    report["settings"][name] = {"kwargs": {k: (list(v) if isinstance(v, tuple) else v) for k, v in kw.items()},
                                "seconds_hpss": round(dt, 2), "harmonic_rms_dbfs": round(rms(h), 2),
                                "percussive_rms_dbfs": round(rms(p), 2),
                                "residual_rms_dbfs": round(rms(y - h - p), 2), "input_rms_dbfs": round(rms(y), 2),
                                "n_percussive_onsets": int(len(on)),
                                "first_onsets_s": [round(float(t), 3) for t in on[:10]]}
    print(name, json.dumps(report["settings"][name]), flush=True)
with open(os.path.join(outdir, "hpss_report.json"), "w") as fh:
    json.dump(report, fh, indent=1)
