"""Apply chordino_run.py's end-of-file rule to .lab files written before that rule was added (run r0215).

Rule: a segment's end is capped at the audio duration; a segment that starts at or after that end is dropped.
Durations: truth duration_s of each clip (R2full and R2 also have one). Rewrites the files in place and prints what it
dropped.
"""
import glob
import json
import os

OUT = "/home/user/gtr/lanes/chords-beats-key/out/chordino"
for lab in sorted(glob.glob(os.path.join(OUT, "*", "chords_chordino*.lab"))):
    clip = os.path.basename(os.path.dirname(lab))
    dur = json.load(open("/home/user/gtr/inputs/%s/%s.truth.json" % (clip, clip)))["duration_s"]
    rows = [l.rstrip("\n").split("\t") for l in open(lab) if l.strip()]
    keep = []
    for s, e, lab_ in rows:
        s, e = float(s), min(float(e), dur)
        if s >= e:
            print("dropped", clip, os.path.basename(lab), s, lab_)
            continue
        keep.append("%.3f\t%.3f\t%s\n" % (s, e, lab_))
    open(lab, "w").write("".join(keep))
