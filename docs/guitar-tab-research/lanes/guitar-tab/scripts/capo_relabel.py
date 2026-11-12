"""Glue (guitar-tab lane) for the capo-by-transposition workaround: a tool that has no capo parameter is given the
notes transposed DOWN by N semitones; its strings and frets are then read as counted from a capo at fret N.
This rewrites the tool's gtr-eval note file: capo := N, every pitch += N, strings and frets unchanged.
usage: python capo_relabel.py in.gtreval.json out.gtreval.json N"""
import json, sys
d = json.load(open(sys.argv[1])); n = int(sys.argv[3])
d["capo"] = n
for x in d["notes"]:
    x["pitch"] = x["pitch"] + n
d["glue"] = f"capo_relabel.py: tool ran on notes transposed by -{n}; frets read as counted from capo {n}; pitches +{n}"
json.dump(d, open(sys.argv[2], "w"), indent=1)
