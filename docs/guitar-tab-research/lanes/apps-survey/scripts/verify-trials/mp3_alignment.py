"""Verifier's check of the lane's MP3 copies (scripts/make_mp3_copies.sh) against the WAV clips.

For each clip: the WAV's sample count; the sample count ffmpeg decodes from the MP3 by default (it applies the
encoder delay and padding recorded in the MP3's LAME header); the same with ffmpeg's `-flags2 +skip_manual`
(the header's skip is not applied, as a decoder that ignores that header would do); and, for each decode, the lag
in samples that maximises the cross-correlation of the mono mixes over the first 10 s (search 0 to 3999 samples,
and -3000 to 3000 for the default decode).

Run with the scorer's environment (numpy, soundfile):
  /home/user/gtr/eval/venv/bin/python -I mp3_alignment.py
Written by verify-trials-apps-survey, 2026-11-10.
"""
import subprocess

import numpy as np
import soundfile as sf

IDS = ['S1', 'S2s', 'S3', 'S4', 'S5capo2', 'S5dropd', 'S6taps', 'S7flat30', 'R1a', 'R2']
WAV = '/home/user/gtr/inputs/{0}/{0}.wav'
MP3 = '/home/user/gtr/lanes/apps-survey/out/clips-mp3/{0}.mp3'


def decode(path, channels, manual_skip):
    cmd = ['ffmpeg', '-v', 'error']
    if manual_skip:
        cmd += ['-flags2', '+skip_manual']
    cmd += ['-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, channels)


def best_lag(a, b, sr, lags):
    n = sr * 10
    ref = a[:n]
    best = None
    for lag in lags:
        if lag >= 0:
            seg = b[lag:lag + n]
        else:
            seg = np.concatenate([np.zeros(-lag, dtype=np.float32), b[:n + lag]])
        if len(seg) < n:
            continue
        c = float(np.dot(ref, seg))
        if best is None or c > best[1]:
            best = (lag, c)
    return best[0]


print('clip | WAV samples | MP3 default decode: samples, lag | MP3 with +skip_manual: samples, extra, lag')
for i in IDS:
    w, sr = sf.read(WAV.format(i), dtype='float32', always_2d=True)
    a = w.mean(1)
    d = decode(MP3.format(i), w.shape[1], False)
    m = decode(MP3.format(i), w.shape[1], True)
    lag_d = best_lag(a, d.mean(1), sr, range(-3000, 3001))
    lag_m = best_lag(a, m.mean(1), sr, range(0, 4000))
    print(f'{i} | {len(w)} | {len(d)}, {lag_d} | {len(m)}, {len(m) - len(w)} ({(len(m) - len(w)) / sr:.4f} s), '
          f'{lag_m} ({lag_m / sr * 1000:.2f} ms)')
