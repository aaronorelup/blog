"""Gap round 2: test scripts/stone_npz_labels.py on a values.npz written the way STONE's inference.py writes it.

inference.py (deezer/stone main, commit 0c5f72d) calls main() with os.path.abspath(audio_path) and saves
np.savez(<audio_path>/results/<ckpt_name>/values.npz, **{<absolute song path>: torch.mean(yh, dim=0).argmax().numpy()}),
i.e. one 0-d int64 array per file, keyed by the file's absolute path. This test writes two such files with made-up
class numbers into a temporary folder and runs the label script on them. No STONE code is involved.
Usage: python3 -I test_stone_npz_labels.py
"""
import os
import subprocess
import sys
import tempfile

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "..", "stone_npz_labels.py")
CASES = (("semitone_ks", "ks", {"S3.wav": 9, "R1a.wav": 10}),
         ("semisupervised_ks_mode", "ks_mode", {"S3.wav": 17, "R1a.wav": 9}))

with tempfile.TemporaryDirectory() as tmp:
    clips = os.path.join(tmp, "workspace", "clips")
    for ckpt, kind, vals in CASES:
        d = os.path.join(clips, "results", ckpt)
        os.makedirs(d)
        np.savez(os.path.join(d, "values.npz"),
                 **{os.path.join(clips, k): np.array(v, dtype=np.int64) for k, v in vals.items()})
        out = subprocess.run([sys.executable, "-I", SCRIPT, os.path.join(d, "values.npz"), kind],
                             capture_output=True, text=True, check=True).stdout
        print("%s (%s):" % (ckpt, kind))
        print(out, end="")
