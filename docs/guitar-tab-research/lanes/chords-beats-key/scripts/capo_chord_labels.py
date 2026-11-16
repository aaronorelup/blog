"""For each chord tool's output on S5capo2 (and on S2n, the same tab without the capo), list the first four chord
segments that are not N, next to the truth's first four chord segments, and the label each tool gives at the
midpoint of each of those four truth segments.

Usage: python3 -I capo_chord_labels.py [--clips S5capo2,S2n] [--json out.json]
Reads   /home/user/gtr/inputs/<clip>/<clip>.chords.lab and the .lab files listed in FILES below under
        /home/user/gtr/lanes/chords-beats-key/out/<tool>/<clip>/ (as each tool's run wrote them).
A segment is (start, end, label); runs of the same label are NOT merged (the files are used as written).
"""
import argparse
import json
import os

OUT = "/home/user/gtr/lanes/chords-beats-key/out"
INP = "/home/user/gtr/inputs"
FILES = [
    ("Chordino (chord-extractor 0.1.3), global tuning", "chordino", "chords_chordino.lab"),
    ("Chordino, local tuning", "chordino", "chords_chordino_localtuning.lab"),
    ("madmom 0.16.1 CNN + CRF", "madmom", "chords_cnn.lab"),
    ("madmom 0.16.1 deep chroma", "madmom", "chords_dc.lab"),
    ("Essentia TonalExtractor (440 Hz)", "essentia", "chords_tonal.lab"),
    ("autochord 0.1.4", "autochord", "chords_autochord.lab"),
    ("CREMA 0.2.0", "crema", "chords_crema.lab"),
    ("lv-chordia 1.1.0, submission", "lv_chordia", "chords_lvchordia_submission.lab"),
    ("lv-chordia 1.1.0, ismir2017", "lv_chordia", "chords_lvchordia_ismir2017.lab"),
    ("Omnizart 0.5.0 chord", "omnizart", "chords_omnizart.lab"),
]


def read_lab(p):
    segs = []
    for line in open(p):
        parts = line.replace(",", " ").split()
        if len(parts) >= 3:
            try:
                segs.append((float(parts[0]), float(parts[1]), parts[2]))
            except ValueError:
                pass
    return segs


def is_n(lab):
    return lab in ("N", "N.C.", "NC", "X")


def label_at(segs, t):
    for s, e, l in segs:
        if s <= t < e:
            return l
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", default="S5capo2,S2n")
    ap.add_argument("--json", default=None)
    a = ap.parse_args()
    res = {}
    for clip in a.clips.split(","):
        truth = read_lab(os.path.join(INP, clip, clip + ".chords.lab"))
        t4 = [s for s in truth if not is_n(s[2])][:4]
        mids = [round((s + e) / 2, 3) for s, e, _ in t4]
        rows = [{"tool": "truth", "file": "%s.chords.lab" % clip,
                 "first4": [[round(s, 3), round(e, 3), l] for s, e, l in t4],
                 "at_truth_midpoints": [l for _, _, l in t4]}]
        for name, tool, f in FILES:
            p = os.path.join(OUT, tool, clip, f)
            if not os.path.exists(p):
                rows.append({"tool": name, "file": None})
                continue
            segs = read_lab(p)
            e4 = [s for s in segs if not is_n(s[2])][:4]
            rows.append({"tool": name, "file": os.path.relpath(p, OUT),
                         "first4": [[round(s, 3), round(e, 3), l] for s, e, l in e4],
                         "at_truth_midpoints": [label_at(segs, m) for m in mids]})
        res[clip] = {"truth_midpoints_s": mids, "rows": rows}
        print("==", clip, "truth midpoints", mids)
        for r in rows:
            if r.get("file") is None and r["tool"] != "truth":
                print("  %-48s (no output file)" % r["tool"])
                continue
            f4 = "  ".join("%s %.2f-%.2f" % (l, s, e) for s, e, l in r["first4"])
            print("  %-48s first4: %s | at truth midpoints: %s" % (r["tool"], f4, " ".join(str(x) for x in r["at_truth_midpoints"])))
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)


if __name__ == "__main__":
    main()
