"""gap round 2: compare two TabCNN frames CSVs (time, s1..s6; fret or -1) frame by frame.
Prints, per clip: frames, frames where all six strings agree, string-frame cells that agree / all cells, and the
cells active (fret >= 0) in each file. usage: python gap2_compare_frames.py <dir> <config A> <config B> <clips...>"""
import sys, csv
d, A, B, clips = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
def read(p):
    with open(p) as fh:
        r = csv.reader(fh); next(r)
        return [(float(x[0]), tuple(int(v) for v in x[1:])) for x in r]
tot = [0, 0, 0, 0]
for c in clips:
    fa, fb = read(f"{d}/{c}.{A}.frames.csv"), read(f"{d}/{c}.{B}.frames.csv")
    assert len(fa) == len(fb) and all(abs(x[0] - y[0]) < 1e-6 for x, y in zip(fa, fb)), c
    same_frames = sum(x[1] == y[1] for x, y in zip(fa, fb))
    cells = sum(sum(p == q for p, q in zip(x[1], y[1])) for x, y in zip(fa, fb))
    act_a = sum(sum(v >= 0 for v in x[1]) for x in fa); act_b = sum(sum(v >= 0 for v in y[1]) for y in fb)
    print(f"{c}: frames {len(fa)}, identical frames {same_frames}, identical string cells {cells}/{6*len(fa)}, "
          f"active cells {A} {act_a}, {B} {act_b}")
    tot[0] += len(fa); tot[1] += same_frames; tot[2] += cells; tot[3] += 6 * len(fa)
print(f"all: frames {tot[0]}, identical frames {tot[1]}, identical string cells {tot[2]}/{tot[3]}")
