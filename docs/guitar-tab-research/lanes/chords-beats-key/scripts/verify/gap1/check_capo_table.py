"""verify-gapfill-chords-beats-key: recompute the capo table of trials.md ("Capo 2 and chord labels") from the label files.

Own reader (no code from capo_chord_labels.py): each .lab file is "start end label" per line; "first four" = the first
four segments whose label is not N; "at midpoint t" = the label of the segment with start <= t < end. The truth
midpoints are taken from S5capo2.chords.lab (first four non-N truth segments). Prints the recomputed rows and the
table's rows side by side. Run: python3 -I check_capo_table.py
"""
import os, re

O = "/home/user/gtr/lanes/chords-beats-key/out"
TR = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/trials.md"


def lab(p):
    rows = []
    for ln in open(p):
        f = ln.split()
        if len(f) >= 3:
            rows.append((float(f[0]), float(f[1]), f[2]))
    return rows


def first4(rows):
    return [r for r in rows if r[2] != "N"][:4]


def at(rows, t):
    for s, e, l in rows:
        if s <= t < e:
            return l
    return "(none)"


truth = lab("/home/user/gtr/inputs/S5capo2/S5capo2.chords.lab")
mids = [round((s + e) / 2, 3) for s, e, l in first4(truth)]
truth2 = lab("/home/user/gtr/inputs/S2n/S2n.chords.lab")
print("truth midpoints", mids, "S2n truth first4", first4(truth2))
tools = [
    ("truth", None, None),
    ("Chordino (global tuning; local tuning gave the same)", "chordino/{c}/chords_chordino.lab", "chordino/{c}/chords_chordino_localtuning.lab"),
    ("madmom CNN + CRF", "madmom/{c}/chords_cnn.lab", None),
    ("madmom deep chroma", "madmom/{c}/chords_dc.lab", None),
    ("Essentia TonalExtractor (440 Hz)", "essentia/{c}/chords_tonal.lab", None),
    ("autochord", "autochord/{c}/chords_autochord.lab", None),
    ("CREMA", "crema/{c}/chords_crema.lab", None),
    ("lv-chordia (submission and ismir2017 identical)", "lv_chordia/{c}/chords_lvchordia_submission.lab", "lv_chordia/{c}/chords_lvchordia_ismir2017.lab"),
]
text = open(TR).read()
tbl = {}
for ln in text.splitlines():
    if ln.startswith("| ") and ("S5capo2" not in ln) and ln.count("|") == 5:
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        tbl[cells[0]] = cells[1:]
roots = set()
for name, pat, alt in tools:
    if pat is None:
        a, b = truth, truth2
    else:
        a, b = lab(os.path.join(O, pat.format(c="S5capo2"))), lab(os.path.join(O, pat.format(c="S2n")))
        if alt:
            a2 = lab(os.path.join(O, alt.format(c="S5capo2")))
            print("   ", name, "alt file identical labels on S5capo2:", a2 == a, "| S2n:", lab(os.path.join(O, alt.format(c="S2n"))) == b)
    f4 = ", ".join("%s %.2f-%.2f" % (l, s, e) for s, e, l in first4(a))
    m1 = " ".join(at(a, t) for t in mids)
    m2 = " ".join(at(b, t) for t in mids)
    for s, e, l in first4(a):
        roots.add(re.match(r"[A-G][#b]?", l).group(0))
    for t in mids:
        roots.add(re.match(r"[A-G][#b]?", at(a, t)).group(0))
    row = tbl.get(name)
    ok = row == [f4, m1, m2] if row else "row not found"
    print(("OK  " if ok is True else "DIFF"), name)
    if ok is not True:
        print("   computed:", [f4, m1, m2])
        print("   table:   ", row)
print("roots in the S5capo2 columns:", sorted(roots))
