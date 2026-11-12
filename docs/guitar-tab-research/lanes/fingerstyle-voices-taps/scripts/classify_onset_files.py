"""Break a list of estimated onset times down by what each one lands on (tap only, tap together with a note onset,
note onset only, neither), for a clip with truth taps (S6taps).

Usage: python classify_onset_files.py <clip id> <onsets.txt> [more onset files...]
Each onset file: one time in seconds per line. Prints one JSON line per file.
Matching: fvt_common.classify_onsets (mir_eval.util.match_events, one-to-one, window 50 ms; a tap counts as
'tap+note' when a truth note-onset group is within 1 ms of it).
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import classify_onsets, load_truth  # noqa: E402

cid = sys.argv[1]
truth = load_truth(cid)
for p in sys.argv[2:]:
    est = np.atleast_1d(np.loadtxt(p)) if os.path.getsize(p) else np.array([])
    r = classify_onsets(est, truth)
    r["file"] = p
    print(json.dumps(r))
