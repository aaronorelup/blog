"""Verifier: print the first and last raw ChordChange of chord-extractor's Chordino() (defaults) for each clip, with the
file duration, to check the claim that every list starts with N at 0.372 s and ends with an N change 0.28 to 0.37 s
after the end of the file. Run with the rebuilt venv-chordext python: python -I chordino_raw_ends.py S3 S4 ...
"""
import json
import sys

import librosa
from chord_extractor.extractors import Chordino

out = []
for c in sys.argv[1:]:
    wav = "/home/user/gtr/inputs/%s/%s.wav" % (c, c)
    dur = librosa.get_duration(path=wav)
    ch = Chordino().extract(wav)
    out.append({"clip": c, "duration_s": round(dur, 3), "n_changes": len(ch),
                "first": [ch[0].chord, round(ch[0].timestamp, 3)],
                "last": [ch[-1].chord, round(ch[-1].timestamp, 3)],
                "last_minus_duration_s": round(ch[-1].timestamp - dur, 3)})
    print(json.dumps(out[-1]), flush=True)
lags = [o["last_minus_duration_s"] for o in out]
print(json.dumps({"all_first_N_at_0.372": all(o["first"] == ["N", 0.372] for o in out),
                  "all_last_N": all(o["last"][0] == "N" for o in out),
                  "last_minus_duration_min_max": [min(lags), max(lags)]}))
