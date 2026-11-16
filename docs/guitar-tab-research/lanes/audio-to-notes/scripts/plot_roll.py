"""Piano-roll picture: truth notes (grey) with the estimate on top (red).
usage: python plot_roll.py <clip> <estimate .mid or notes .csv> <out.png> "<title>" [--voice V] [--t1 seconds]"""
import argparse, csv, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import truth_notes, midi_notes, pianoroll_png
ap = argparse.ArgumentParser(); ap.add_argument("clip"); ap.add_argument("est"); ap.add_argument("out"); ap.add_argument("title")
ap.add_argument("--voice", default=None); ap.add_argument("--t1", type=float, default=None)
a = ap.parse_args()
if a.est.endswith(".mid"):
    est = [(n[0], n[1], n[2]) for n in midi_notes(a.est)]
else:
    rows = list(csv.DictReader(open(a.est)))
    k_on = next(k for k in ("onset_s", "start_time_s") if k in rows[0]); k_off = next(k for k in ("offset_s", "end_time_s") if k in rows[0])
    est = [(float(r[k_on]), float(r[k_off]), float(r["pitch_midi"])) for r in rows]
tr = truth_notes(a.clip, a.voice)
pianoroll_png(est, tr, a.out, a.title, t1=a.t1)
print(a.out, os.path.getsize(a.out))
