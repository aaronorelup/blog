"""Write the sum of some estimated stems as one float32 WAV (for scoring a 4- or 6-stem output against the
artist's instrumental of R2). Usage: python -I sum_stems.py <out wav> <stem wav> [<stem wav> ...]
All inputs must share sample rate and channel count; the sum is over the common length."""
import sys
import numpy as np
import soundfile as sf

out, ins = sys.argv[1], sys.argv[2:]
sigs, srs = [], set()
for p in ins:
    x, sr = sf.read(p, always_2d=True, dtype="float64")
    sigs.append(x); srs.add(sr)
assert len(srs) == 1, f"sample rates differ: {srs}"
n = min(len(x) for x in sigs)
s = np.sum([x[:n] for x in sigs], axis=0)
sf.write(out, s.astype(np.float32), srs.pop(), subtype="FLOAT")
print(f"wrote {out}: {n} frames, {s.shape[1]} ch, sum of {len(ins)} stems, peak {np.max(np.abs(s)):.4f}")
