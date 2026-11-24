"""Measure spoken takes without listening to them: speaking length, pace, pitch and noise floor.

    python voice_measure.py --words "the text that was spoken" take1.wav [take2.wav ...]

Each file must be a WAV (mono or stereo, any rate). Prints one JSON line per file:
  start, end        first and last sample above the speech gate (seconds)
  speech_s          end - start: the length the engine schedules
  wpm               words / speech_s * 60
  f0_median_hz      median pitch of the voiced 40 ms frames (autocorrelation)
  f0_p10_hz, f0_p90_hz, f0_range_st   the spread of the pitch, in semitones between the 10th and 90th percentiles
  noise_floor_dbfs  RMS of the quietest 10 % of 20 ms frames inside the speech (the pauses)
  peak_dbfs         sample peak
  pauses            gaps of 250 ms or more below the gate, inside the speech
numpy and scipy only.
"""
import argparse
import json
import sys

import numpy as np
from scipy.io import wavfile


def read_mono(path):
    sr, x = wavfile.read(path)
    if x.dtype.kind == 'i':
        x = x.astype(np.float64) / float(np.iinfo(x.dtype).max)
    else:
        x = x.astype(np.float64)
    if x.ndim == 2:
        x = x.mean(axis=1)
    return sr, x


def frame_rms(x, n):
    m = len(x) // n
    f = x[:m * n].reshape(m, n)
    return np.sqrt((f * f).mean(axis=1) + 1e-20)


def measure(path, words):
    sr, x = read_mono(path)
    hop = int(0.02 * sr)
    rms = frame_rms(x, hop)
    db = 20 * np.log10(rms)
    gate = max(db.max() - 40.0, -60.0)
    on = np.nonzero(db > gate)[0]
    if len(on) == 0:
        return {'file': path, 'error': 'silent'}
    i0, i1 = int(on[0]), int(on[-1]) + 1
    start, end = i0 * hop / sr, i1 * hop / sr
    inside = db[i0:i1]
    quiet = np.sort(inside)[:max(1, len(inside) // 10)]
    noise = 10 * np.log10(np.mean(10 ** (quiet / 10)))
    # pauses: runs of frames below the gate inside the speech
    below = inside <= gate
    pauses, run = 0, 0
    for b in below:
        run = run + 1 if b else 0
        if run == int(0.25 / 0.02):
            pauses += 1
    # pitch: normalised autocorrelation of 40 ms frames, 60 to 400 Hz
    n = int(0.04 * sr)
    lo, hi = int(sr / 400), int(sr / 60)
    f0 = []
    for k in range(i0 * hop, i1 * hop - n, n // 2):
        fr = x[k:k + n] - x[k:k + n].mean()
        e = float((fr * fr).sum())
        if e < 1e-6 or 20 * np.log10(np.sqrt(e / n)) < gate + 10:
            continue
        ac = np.correlate(fr, fr, 'full')[n - 1:]
        ac = ac / ac[0]
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.5:
            f0.append(sr / lag)
    f0 = np.array(f0)
    out = {'file': path, 'start': round(start, 3), 'end': round(end, 3), 'speech_s': round(end - start, 3),
           'wpm': round(words / (end - start) * 60, 1) if words else None,
           'noise_floor_dbfs': round(float(noise), 1), 'peak_dbfs': round(float(20 * np.log10(np.abs(x).max() + 1e-20)), 1),
           'pauses': pauses, 'voiced_frames': int(len(f0))}
    if len(f0):
        p10, p50, p90 = np.percentile(f0, [10, 50, 90])
        out.update({'f0_median_hz': round(float(p50), 1), 'f0_p10_hz': round(float(p10), 1), 'f0_p90_hz': round(float(p90), 1),
                    'f0_range_st': round(float(12 * np.log2(p90 / p10)), 2)})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--words', default='')
    ap.add_argument('files', nargs='+')
    a = ap.parse_args()
    words = len(a.words.split())
    for f in a.files:
        print(json.dumps(measure(f, words)))


if __name__ == '__main__':
    sys.exit(main())
