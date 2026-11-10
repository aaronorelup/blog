"""Compare two WAV files sample by sample (after reading both as int16 when possible).
Usage: python compare_wav.py <a.wav> <b.wav>"""
import json, sys
import numpy as np, soundfile as sf
a, sa = sf.read(sys.argv[1], dtype='int16', always_2d=True)
b, sb = sf.read(sys.argv[2], dtype='int16', always_2d=True)
n = min(len(a), len(b))
d = np.abs(a[:n].astype(np.int32) - b[:n].astype(np.int32))
print(json.dumps({'a': sys.argv[1], 'b': sys.argv[2], 'sr_a': sa, 'sr_b': sb, 'frames_a': len(a), 'frames_b': len(b),
                  'channels': [a.shape[1], b.shape[1]], 'identical_samples_fraction': float((d == 0).mean()),
                  'max_abs_diff_int16': int(d.max()), 'mean_abs_diff_int16': float(d.mean())}))
