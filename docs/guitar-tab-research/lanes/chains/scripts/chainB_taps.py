"""Chain B glue: the percussive part's onsets (tap candidates) joined with the note onsets transcribed from the harmonic
part, and both compared with the S6taps truth.

usage: python3 chainB_taps.py <percussive onsets txt (one time per line)> <Basic Pitch notes csv of the harmonic part>
                             <truth json> <out json>
An onset "has a note" when a transcribed note onset lies within 50 ms of it. Truth events (from the truth file, the
fingerstyle lane's classes): taps that start within 1 ms of a truth note onset group are "tap+note", the other taps are
"tap-only", note groups without a tap are "note-only". Each percussive onset is matched to the nearest truth event
within 50 ms (one-to-one, in time order) to say what it is.
"""
import csv, json, sys

perc = sorted(float(l.split()[0]) for l in open(sys.argv[1]) if l.strip())
notes = []
with open(sys.argv[2]) as f:
    r = csv.reader(f); next(r)
    notes = sorted(float(row[0]) for row in r)
truth = json.load(open(sys.argv[3]))
groups = []
for n in sorted(x["onset"] for x in truth["notes"]):
    if not groups or n - groups[-1] > 0.001:
        groups.append(n)
taps = sorted(t["time"] for t in truth["taps"])
events = []
for t in taps:
    events.append((t, "tap+note" if any(abs(t - g) <= 0.001 for g in groups) else "tap-only"))
for g in groups:
    if not any(abs(t - g) <= 0.001 for t in taps):
        events.append((g, "note-only"))
events.sort()
used = set(); rows = []
for p in perc:
    has_note = any(abs(p - n) <= 0.05 for n in notes)
    best = None
    for i, (t, k) in enumerate(events):
        if i in used or abs(t - p) > 0.05:
            continue
        if best is None or abs(t - p) < abs(events[best][0] - p):
            best = i
    kind = None
    if best is not None:
        used.add(best); kind = events[best][1]
    rows.append({"onset": round(p, 4), "has_transcribed_note_within_50ms": has_note, "truth_event": kind})
cnt = {}
for r_ in rows:
    k = f"{'with' if r_['has_transcribed_note_within_50ms'] else 'without'} note / truth {r_['truth_event']}"
    cnt[k] = cnt.get(k, 0) + 1
res = {"percussive_onsets": len(perc), "transcribed_note_onsets": len(notes),
       "truth": {"taps": len(taps), "note_groups": len(groups),
                 "events": {k: sum(1 for _, kk in events if kk == k) for k in ("tap+note", "tap-only", "note-only")}},
       "onsets_without_a_transcribed_note_within_50ms": sum(not r_["has_transcribed_note_within_50ms"] for r_ in rows),
       "by_class": cnt, "rows": rows}
json.dump(res, open(sys.argv[4], "w"), indent=0)
print(json.dumps({k: v for k, v in res.items() if k != "rows"}))
