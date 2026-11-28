"""Chain C: what changed between two tab outputs of the same notes (no hint vs a capo / tuning hint, or unpinned vs pinned).

usage: python3 chainC_diff.py <A.gtreval.json> <B.gtreval.json> [--label L]
Each file: {"tuning_midi", "capo", "notes": [{onset, pitch, string, fret}]} (the guitar-tab lane's gtr-eval files).
Notes are paired one to one by sounding pitch and onset within 35 ms (LilyPond's glue gives every note of a 30 ms
group the group's onset; tuttut gives each its own). For each pair: same string; same fret as written (counted from
each file's capo); same fret counted from the nut (fret + capo). Prints one JSON line.
"""
import json, sys

a, b = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
label = sys.argv[sys.argv.index("--label") + 1] if "--label" in sys.argv else ""
ca, cb = int(a.get("capo", 0) or 0), int(b.get("capo", 0) or 0)
A = sorted(a["notes"], key=lambda n: (n["onset"], n["pitch"]))
B = sorted(b["notes"], key=lambda n: (n["onset"], n["pitch"]))
used = set(); pairs = []
for x in A:
    best = None
    for i, y in enumerate(B):
        if i in used or y["pitch"] != x["pitch"] or abs(y["onset"] - x["onset"]) > 0.035:
            continue
        if best is None or abs(y["onset"] - x["onset"]) < abs(B[best]["onset"] - x["onset"]):
            best = i
    if best is not None:
        used.add(best); pairs.append((x, B[best]))
same_string = sum(x["string"] == y["string"] for x, y in pairs)
same_written = sum(x["string"] == y["string"] and x["fret"] == y["fret"] for x, y in pairs)
same_abs = sum(x["string"] == y["string"] and x["fret"] + ca == y["fret"] + cb for x, y in pairs)
moves = {}
for x, y in pairs:
    if x["string"] != y["string"]:
        k = f"string {x['string']}->{y['string']}"
        moves[k] = moves.get(k, 0) + 1
changed = [{"onset": round(x["onset"], 3), "pitch": x["pitch"], "A": [x["string"], x["fret"]], "B": [y["string"], y["fret"]]}
           for x, y in pairs if (x["string"], x["fret"] + ca) != (y["string"], y["fret"] + cb)]
print(json.dumps({"label": label, "A": sys.argv[1], "B": sys.argv[2], "capo_A": ca, "capo_B": cb,
                  "notes_A": len(A), "notes_B": len(B), "paired": len(pairs), "unpaired_A": len(A) - len(pairs),
                  "unpaired_B": len(B) - len(pairs), "same_string": same_string,
                  "same_string_and_written_fret": same_written, "same_string_and_fret_from_nut": same_abs,
                  "string_moves": moves, "first_changed": changed[:5]}))
