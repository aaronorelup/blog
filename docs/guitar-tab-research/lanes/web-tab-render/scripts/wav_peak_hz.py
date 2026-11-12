#!/usr/bin/env python3
"""Strongest spectral peak of a float32 WAV in a time window and a frequency band (numpy only).
Usage: python -I wav_peak_hz.py file.wav t0 t1 fmin fmax
Prints the peak frequency (Hz, parabolic interpolation on a Hann-windowed FFT zero-padded to 2**18) and the nearest
MIDI note number = 69 + 12*log2(f/440)."""
import math
import struct
import sys

import numpy as np


def read_float_wav(path):
    b = open(path, 'rb').read()
    ch = struct.unpack('<H', b[22:24])[0]
    sr = struct.unpack('<I', b[24:28])[0]
    data = np.frombuffer(b[44:], dtype='<f4')
    return data.reshape(-1, ch).mean(axis=1), sr


def main():
    path, t0, t1, fmin, fmax = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
    x, sr = read_float_wav(path)
    seg = x[int(t0 * sr):int(t1 * sr)]
    n = 1 << 18
    spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n))
    freqs = np.fft.rfftfreq(n, 1 / sr)
    band = np.where((freqs >= fmin) & (freqs <= fmax))[0]
    k = band[np.argmax(spec[band])]
    a, b0, c = spec[k - 1], spec[k], spec[k + 1]
    p = 0.5 * (a - c) / (a - 2 * b0 + c)
    f = (k + p) * sr / n
    print(f'{path}: peak {f:.2f} Hz in {fmin}-{fmax} Hz, {t0}-{t1} s; MIDI {69 + 12 * math.log2(f / 440):.2f}')


if __name__ == '__main__':
    main()
