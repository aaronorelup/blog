"""Compare the same stem from two runs (sample-by-sample), e.g. to see whether Demucs gives identical output twice.
Usage: python -I compare_runs.py <wav a> <wav b> [<wav a> <wav b> ...]
For each pair: frames, subtype, max |a-b|, and the difference level 10 log10(|a-b|^2/|a|^2) in dB over the common
length (both read as float64; -inf = identical)."""
import sys
import numpy as np
import soundfile as sf

args = sys.argv[1:]
for a, b in zip(args[0::2], args[1::2]):
    x, sa = sf.read(a, always_2d=True, dtype="float64"); y, sb = sf.read(b, always_2d=True, dtype="float64")
    n = min(len(x), len(y)); d = x[:n] - y[:n]
    e = np.sum(d ** 2); r = np.sum(x[:n] ** 2)
    lvl = float("-inf") if e == 0 else 10 * np.log10(e / r)
    print(f"{a} vs {b}: frames {len(x)} / {len(y)}, {sf.info(a).subtype} / {sf.info(b).subtype}, "
          f"max|diff| {np.max(np.abs(d)):.6g}, diff level {lvl:.2f} dB")
