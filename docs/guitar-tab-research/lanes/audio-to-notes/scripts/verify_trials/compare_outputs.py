"""verify-trials-audio-to-notes: compare the verifier's re-run outputs (verify/out/<tool>/) with the trial agent's
outputs (out/<tool>/): byte-identical or not; for tables, row counts and the largest absolute difference per column;
for MIDI, note counts and the number of (onset to 1 ms, pitch) pairs in common. Run with the gtr-eval venv's Python.
usage: python -I compare_outputs.py <tool dir pairs as orig:verify ...>"""
import csv, filecmp, json, os, sys
import numpy as np
O = "/home/user/gtr/lanes/audio-to-notes/out"; V = "/home/user/gtr/lanes/audio-to-notes/verify/out"

def table(p):
    rows = [r for r in csv.reader(open(p)) if r]
    try:
        float(rows[0][0]); hdr = None; data = rows
    except ValueError:
        hdr = rows[0]; data = rows[1:]
    return hdr, data

def cmp_file(a, b):
    if filecmp.cmp(a, b, shallow=False):
        return "identical bytes"
    if a.endswith(".csv"):
        ha, da = table(a); hb, db = table(b)
        if len(da) != len(db):
            return f"DIFFERENT row count {len(da)} vs {len(db)}"
        n = min(len(x) for x in da + db)
        A = np.array([[float(v) for v in r[:n]] for r in da]); B = np.array([[float(v) for v in r[:n]] for r in db])
        d = np.abs(A - B).max(axis=0)
        return f"same rows ({len(da)}), max abs diff per column {np.round(d, 6).tolist()}"
    if a.endswith(".mid"):
        import pretty_midi
        na = [(round(n.start, 3), n.pitch) for i in pretty_midi.PrettyMIDI(a).instruments for n in i.notes]
        nb = [(round(n.start, 3), n.pitch) for i in pretty_midi.PrettyMIDI(b).instruments for n in i.notes]
        return f"MIDI notes {len(na)} vs {len(nb)}, common (onset ms, pitch) pairs {len(set(na) & set(nb))}"
    if a.endswith(".json"):
        ja = json.load(open(a)); jb = json.load(open(b))
        if "freqs_hz" in ja:
            same = ja["freqs_hz"] == jb["freqs_hz"] and ja["times"] == jb["times"]
            return f"multi-pitch frames {len(ja['times'])} vs {len(jb['times'])}, frame lists equal: {same}"
        return "json differs"
    return "bytes differ"

for pair in sys.argv[1:]:
    o, v = pair.split(":")
    od, vd = os.path.join(O, o), os.path.join(V, v)
    for root, _, files in os.walk(vd):
        for f in sorted(files):
            if f in ("timings.json",) or f.endswith(".npz") or f.startswith("scores"):
                continue
            b = os.path.join(root, f); rel = os.path.relpath(b, vd); a = os.path.join(od, rel)
            print(f"{v}/{rel}: " + (cmp_file(a, b) if os.path.exists(a) else "no original file"))
